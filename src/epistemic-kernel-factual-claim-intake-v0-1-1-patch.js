/* 42ndMind Factual Claim Intake v0.1.1 Retention Patch
 *
 * Fixes ordering/priority drift where a factual claim is structured correctly,
 * but communicationCore.current_message is overwritten by generic formula parse
 * or a lower-priority verification question before the user sees the factual
 * acknowledgement.
 *
 * This does not add a connector. It protects factual-claim communication as a
 * live-state pressure when the latest input is itself a factual claim.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function rowId(prefix, parts) { return `${prefix}_${tinyHash(asArray(parts).join('|')).slice(0, 12)}`; }
  function latestEvent(state) { const rows = asArray(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(event) { return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text)); }
  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }
  function uniqueRows(rows, keyFn) { const seen = new Set(); const out = []; asArray(rows).forEach(row => { const key = keyFn(row); if (!key || seen.has(key)) return; seen.add(key); out.push(row); }); return out; }

  function ensure(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.languageMathCore) state.languageMathCore = { packet_type: '42ndMind_language_math_core_v0_1' };
    if (!state.communicationCore) state.communicationCore = { packet_type: '42ndMind_communication_core_v0_1', message_history: [] };
    const lm = state.languageMathCore;
    lm.factual_claim_intake_patch_version = VERSION;
    lm.doctrine = Object.assign({}, lm.doctrine || {}, {
      factual_claim_acknowledgement_retention: true,
      current_factual_claim_acknowledgement_should_not_be_overwritten_by_generic_parse: true,
      current_factual_claim_acknowledgement_should_not_be_overwritten_by_lower_priority_verification_question: true,
      retention_is_priority_arbitration_not_connector: true,
      no_final_truth_promotion: true,
      belief_movement: 'provisional_only'
    });
    lm.truth_status = 'not_final';
    lm.promotion_status = 'not_promoted_to_final_truth';
    lm.belief_movement = 'provisional_only';
    return lm;
  }

  function latestCurrentFact(state) {
    const event = latestEvent(state);
    const raw = eventText(event);
    if (!raw) return null;
    const rows = asArray(state && state.languageMathCore && state.languageMathCore.factual_claim_candidates);
    return rows.find(f => lower(f.raw_text) === lower(raw)) || null;
  }

  function makeThought(fact) {
    return {
      thought_id: rowId('factthought', [fact.fact_id, 'retained']),
      thought_kind: 'factual_claim_candidate_acknowledgement',
      message: `I am treating that as an external factual claim candidate: ${fact.relation_formula}. I can hold it provisionally from you, but verification is required before objective truth use.`,
      source_pressure: 'external_world_claim_truth_pressure_retained',
      priority: 0.86,
      expects_user_reply: false,
      fact_id: fact.fact_id,
      retention_patch_applied: true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function shouldRetainOver(current, factThought) {
    if (!current) return true;
    if (current.thought_kind === 'factual_claim_candidate_acknowledgement' && current.fact_id === factThought.fact_id) return false;
    if (current.thought_kind === 'direct_self_state_answer') return false;
    if (current.thought_kind === 'semantic_conflict_question') return false;
    const currentPriority = Number(current.priority || 0);
    if (current.thought_kind === 'learning_priority_question' && currentPriority > factThought.priority) return false;
    return true;
  }

  function retainFactualAcknowledgement(state, reason) {
    const lm = ensure(state);
    if (!lm) return null;
    const fact = latestCurrentFact(state);
    if (!fact) return lm;
    const thought = makeThought(fact);
    const comm = state.communicationCore || { message_history: [] };
    if (shouldRetainOver(comm.current_message, thought)) {
      comm.current_message = thought;
      comm.selected_pressure = {
        candidate_id: rowId('factretention', [thought.thought_id]),
        candidate_kind: thought.thought_kind,
        message: thought.message,
        priority: thought.priority,
        source_pressure: thought.source_pressure,
        fact_id: fact.fact_id,
        status: 'selected_by_factual_acknowledgement_retention',
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
      comm.message_history = uniqueRows([thought].concat(asArray(comm.message_history)), row => row.thought_id).slice(0, 100);
      comm.updated_at = now();
      comm.truth_status = 'not_final';
      comm.promotion_status = 'not_promoted_to_final_truth';
      comm.belief_movement = 'provisional_only';
      state.communicationCore = comm;
      lm.live_thought = thought;
      lm.communication_pressure = uniqueRows([{
        pressure_id: rowId('factretcomm', [thought.thought_id]),
        thought_id: thought.thought_id,
        pressure_kind: thought.thought_kind,
        priority: thought.priority,
        message: thought.message,
        source_pressure: thought.source_pressure,
        status: 'retained_current_factual_acknowledgement',
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      }].concat(asArray(lm.communication_pressure)), row => row.pressure_id).slice(0, 100);
    }
    lm.factual_retention_log = uniqueRows([{
      log_id: rowId('factretlog', [fact.fact_id, reason || 'retention']),
      at: now(),
      reason: reason || 'factual_acknowledgement_retention',
      fact_id: fact.fact_id,
      relation_formula: fact.relation_formula,
      current_message_kind: state.communicationCore && state.communicationCore.current_message && state.communicationCore.current_message.thought_kind || null,
      status: 'current_factual_claim_acknowledgement_retained_or_already_present',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(lm.factual_retention_log)), row => row.log_id).slice(0, 100);
    lm.updated_at = now();
    return lm;
  }

  function patchBaseRefresh() {
    const Base = global.EpistemicKernelLanguageMathCoreV01;
    if (!Base || Base.__factualClaimRetentionPatchApplied) return;
    const wrapper = Object.assign({}, Base);
    const oldRefresh = Base.refreshLanguageMathCore;
    if (typeof oldRefresh === 'function') {
      wrapper.refreshLanguageMathCore = function retainedFactualRefresh(state, reason) {
        const result = oldRefresh.call(Base, state, reason || 'factual_retention_base_refresh');
        retainFactualAcknowledgement(state, reason || 'factual_retention_after_base_refresh');
        return state && state.languageMathCore || result;
      };
    }
    wrapper.retainFactualAcknowledgement = retainFactualAcknowledgement;
    wrapper.VERSION = `${Base.VERSION || '0.1.1'}+factret-${VERSION}`;
    wrapper.__factualClaimRetentionPatchApplied = true;
    global.EpistemicKernelLanguageMathCoreV01 = Object.freeze(wrapper);
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__factualClaimRetentionPatchApplied) return;
    const oldIngest = Kernel.prototype.ingest;
    const oldTick = Kernel.prototype.unifiedTick;
    const oldSnapshot = Kernel.prototype.snapshot;
    const oldRefresh = Kernel.prototype.refreshLanguageMathCore;
    if (oldIngest) Kernel.prototype.ingest = function retainedFactualKernelIngest(input, meta) { const result = oldIngest.call(this, input, meta || {}); retainFactualAcknowledgement(stateFromKernel(this), 'kernel_ingest_factual_retention'); return result; };
    if (oldTick) Kernel.prototype.unifiedTick = function retainedFactualKernelTick(reason) { const result = oldTick.call(this, reason); retainFactualAcknowledgement(stateFromKernel(this), reason || 'kernel_tick_factual_retention'); return result; };
    if (oldSnapshot) Kernel.prototype.snapshot = function retainedFactualKernelSnapshot() { retainFactualAcknowledgement(stateFromKernel(this), 'kernel_snapshot_factual_retention'); return oldSnapshot.call(this); };
    Kernel.prototype.refreshLanguageMathCore = function retainedFactualKernelRefresh(reason) { if (oldRefresh) oldRefresh.call(this, reason || 'kernel_refresh_factual_retention'); return retainFactualAcknowledgement(stateFromKernel(this), reason || 'kernel_manual_factual_retention'); };
    Kernel.__factualClaimRetentionPatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__factualClaimRetentionWrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    const oldRefresh = brain.refreshLanguageMathCore;
    if (oldIngest) brain.ingest = function retainedFactualBrainIngest(input, meta) { const result = oldIngest.call(brain, input, meta || {}); retainFactualAcknowledgement(brain.state, 'brain_ingest_factual_retention'); return result; };
    if (oldTick) brain.tick = function retainedFactualBrainTick(reason) { const result = oldTick.call(brain, reason); retainFactualAcknowledgement(brain.state, reason || 'brain_tick_factual_retention'); return result; };
    if (oldSnapshot) brain.snapshot = function retainedFactualBrainSnapshot() { retainFactualAcknowledgement(brain.state, 'brain_snapshot_factual_retention'); return oldSnapshot.call(brain); };
    brain.refreshLanguageMathCore = function retainedFactualBrainRefresh(reason) { if (oldRefresh) oldRefresh.call(brain, reason || 'brain_refresh_factual_retention'); return retainFactualAcknowledgement(brain.state, reason || 'brain_manual_factual_retention'); };
    brain.__factualClaimRetentionWrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__factualClaimRetentionPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function retainedFactualCreateState(seed) { const state = Original.createState(seed || {}); ensure(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function retainedFactualCreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function retainedFactualStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); retainFactualAcknowledgement(state, 'static_ingest_factual_retention'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function retainedFactualStaticTick(state, reason) { const result = Original.tick(state, reason); retainFactualAcknowledgement(state, reason || 'static_tick_factual_retention'); return result; };
    wrapper.__factualClaimRetentionPatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__factualClaimRetentionPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function retainedFactualBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensure(binding.shared_state);
      retainFactualAcknowledgement(binding.shared_state, 'bridge_bind_factual_retention');
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__factualClaimRetentionPatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchBaseRefresh();
  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelFactualClaimIntakeV011Patch = Object.freeze({
    VERSION,
    ensure,
    latestCurrentFact,
    retainFactualAcknowledgement,
    patchBaseRefresh,
    patchKernel,
    patchBrainStatic,
    patchBridge,
    wrapBrain
  });
})(typeof window !== 'undefined' ? window : globalThis);
