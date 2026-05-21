/* 42ndMind Factual Claim Intake v0.1
 *
 * External-world factual claims are language-math input, not inert context.
 * This patch turns factual statements into structured provisional fact candidates
 * inside owned state. It does not verify, finalize, or silently mutate truth.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function titleCase(value) { return text(value).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function rowId(prefix, parts) { return `${prefix}_${tinyHash(asArray(parts).join('|')).slice(0, 12)}`; }
  function latestEvent(state) { const rows = asArray(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(event) { return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text)); }
  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }
  function uniqueRows(rows, keyFn) { const seen = new Set(); const out = []; asArray(rows).forEach(row => { const key = keyFn(row); if (!key || seen.has(key)) return; seen.add(key); out.push(row); }); return out; }

  function doctrine() {
    return {
      factual_claim_intake_lives_inside_owned_state: true,
      factual_claims_are_language_math_relations: true,
      external_world_claims_become_structured_candidates: true,
      user_facts_are_context_not_final_truth: true,
      direct_user_source_is_partial_revisable_source: true,
      verification_pressure_is_created_without_verification: true,
      no_auto_fact_checking_from_memory: true,
      no_final_truth_promotion: true,
      no_silent_canonical_mutation: true,
      not_a_connector_fact_checker: true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function ensure(state) {
    if (!state || typeof state !== 'object') return null;
    if (global.EpistemicKernelLanguageMathCoreV01 && typeof global.EpistemicKernelLanguageMathCoreV01.ensureCore === 'function') {
      global.EpistemicKernelLanguageMathCoreV01.ensureCore(state);
    }
    if (!state.languageMathCore) state.languageMathCore = { packet_type: '42ndMind_language_math_core_v0_1' };
    if (!state.communicationCore) state.communicationCore = { packet_type: '42ndMind_communication_core_v0_1', message_history: [] };
    const lm = state.languageMathCore;
    lm.factual_claim_intake_version = VERSION;
    lm.doctrine = Object.assign({}, lm.doctrine || {}, doctrine());
    lm.factual_claim_candidates = asArray(lm.factual_claim_candidates);
    lm.entity_relation_candidates = asArray(lm.entity_relation_candidates);
    lm.truth_relevance_pressure = asArray(lm.truth_relevance_pressure);
    lm.factual_intake_log = asArray(lm.factual_intake_log);
    lm.truth_status = 'not_final';
    lm.promotion_status = 'not_promoted_to_final_truth';
    lm.belief_movement = 'provisional_only';
    if (state.beliefMemoryCore) {
      state.beliefMemoryCore.provisional_fact_candidates = asArray(state.beliefMemoryCore.provisional_fact_candidates);
    }
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      factual_claim_intake_lives_inside_owned_state: true,
      factual_claims_are_language_math_relations: true,
      no_final_truth_promotion: true
    });
    return lm;
  }

  function inferUserIntent(state, raw) {
    const s = lower(raw);
    const latestIntent = asArray(state && state.languageMathCore && state.languageMathCore.intent_inference)[0] || null;
    if (/\b(test|testing|checking|see if|blindly accept)\b/.test(s)) return 'testing_kernel_fact_or_trust_intake';
    if (/\b(i want to teach|i can teach|i will teach|for you to know|here is a fact|fact:)\b/.test(s)) return 'teaching_or_informing_kernel';
    if (latestIntent && latestIntent.inferred_user_intent) return latestIntent.inferred_user_intent;
    return 'informing_or_contextualizing';
  }

  function normalizeObject(rawObject) {
    let obj = lower(rawObject).replace(/^the\s+/, '').replace(/\.$/, '').trim();
    if (/^(united states|united states of america|usa|us|america)$/.test(obj)) return { id: 'united_states_of_america', label: 'United States of America', object_kind: 'nation_state' };
    return { id: safeId(obj), label: titleCase(obj), object_kind: 'entity_or_concept' };
  }

  function detectFactualClaim(raw, state) {
    const original = text(raw);
    const s = lower(original).replace(/\s+/g, ' ').trim();
    if (!s) return null;

    let subject = null;
    let relation = null;
    let object = null;
    let predicate = null;
    let confidence = 0.52;
    let claimScope = 'speaker_context_or_general_claim';
    let claimType = 'factual_claim_candidate';

    const presidentMatch = s.match(/^(.+?)\s+is\s+(?:the\s+)?(\d+(?:st|nd|rd|th)?)\s+president\s+of\s+(?:the\s+)?(.+?)\.?$/i);
    if (presidentMatch) {
      subject = safeId(presidentMatch[1]);
      const ordinal = safeId(presidentMatch[2]);
      const obj = normalizeObject(presidentMatch[3]);
      relation = `is_${ordinal}_president_of`;
      object = obj.id;
      predicate = `${presidentMatch[2]} president`;
      confidence = 0.86;
      claimScope = 'external_world';
      claimType = 'external_world_role_claim';
    } else {
      const relationMatch = s.match(/^(.+?)\s+(?:is|was|are|were)\s+(?:the\s+)?(.+?)\s+of\s+(?:the\s+)?(.+?)\.?$/i);
      if (relationMatch) {
        subject = safeId(relationMatch[1]);
        predicate = safeId(relationMatch[2]);
        const obj = normalizeObject(relationMatch[3]);
        relation = `is_${predicate}_of`;
        object = obj.id;
        confidence = 0.68;
        claimScope = /\b(country|president|prime minister|city|state|government|company|nation|united states|canada|indonesia)\b/.test(s) ? 'external_world' : 'possible_external_world_or_contextual';
        claimType = 'entity_relation_claim';
      } else {
        const simpleMatch = s.match(/^(.+?)\s+(?:is|was|are|were)\s+(.+?)\.?$/i);
        if (simpleMatch && /\b(president|prime minister|government|country|nation|state|city|capital|ceo|leader|law|fact|born|died|founded|located)\b/.test(s)) {
          subject = safeId(simpleMatch[1]);
          relation = 'is';
          object = safeId(simpleMatch[2]);
          predicate = safeId(simpleMatch[2]);
          confidence = 0.6;
          claimScope = 'external_world';
          claimType = 'external_world_general_claim';
        }
      }
    }

    if (!subject || !relation || !object) return null;

    const userIntent = inferUserIntent(state, original);
    const sourceTrust = state && state.beliefMemoryCore && state.beliefMemoryCore.user_trust_profile && state.beliefMemoryCore.user_trust_profile.trust_score_candidate;
    const factId = rowId('fact', [subject, relation, object, original]);
    const relationFormula = `${subject} -> ${relation} -> ${object}`;
    const verificationNeed = claimScope === 'external_world' ? 0.84 : 0.62;
    const usePermission = 'may_use_for_conversation_as_user_supplied_candidate_not_objective_truth';

    return {
      fact_id: factId,
      claim_type: claimType,
      utterance_kind: 'factual_claim',
      claim_scope: claimScope,
      raw_text: original,
      subject,
      relation,
      object,
      predicate,
      relation_formula: relationFormula,
      source_id: 'direct_user',
      source_kind: 'user_input',
      source_trust_score_candidate: Number(sourceTrust || 0.5),
      user_intent_candidate: userIntent,
      truth_status: 'unverified_external_claim_candidate',
      objective_truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only',
      memory_status: 'provisional_fact_candidate',
      confidence: confidence,
      verification_need: verificationNeed,
      truth_relevance: verificationNeed,
      can_inform_future_interpretation: true,
      use_permission: usePermission,
      open_truth_requirements: [
        'source corroboration if used objectively',
        'date/context scope if office or role can change',
        'contradiction check against future trusted sources',
        'promotion only through future truth-ledger discipline'
      ],
      created_at: now(),
      updated_at: now()
    };
  }

  function makeEntityRelation(fact, event) {
    if (!fact) return null;
    return {
      relation_id: rowId('entityrel', [fact.subject, fact.relation, fact.object]),
      relation_formula: fact.relation_formula,
      subject: fact.subject,
      relation: fact.relation,
      object: fact.object,
      source_fact_id: fact.fact_id,
      source_id: fact.source_id,
      event_id: event && event.id || null,
      status: 'candidate_entity_relation_not_verified',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function makeTruthPressure(fact, event) {
    if (!fact) return null;
    return {
      pressure_id: rowId('truthpress', [fact.fact_id]),
      pressure_kind: 'external_world_verification_pressure',
      target_fact_id: fact.fact_id,
      target_relation_formula: fact.relation_formula,
      pressure: fact.verification_need,
      reason: 'External-world factual claim can be held provisionally, but objective use requires verification and later promotion discipline.',
      source_id: fact.source_id,
      event_id: event && event.id || null,
      status: 'open_verification_pressure',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function makeThought(fact) {
    return {
      thought_id: rowId('factthought', [fact.fact_id]),
      thought_kind: 'factual_claim_candidate_acknowledgement',
      message: `I am treating that as an external factual claim candidate: ${fact.relation_formula}. I can hold it provisionally from you, but verification is required before objective truth use.`,
      source_pressure: 'external_world_claim_truth_pressure',
      priority: 0.82,
      expects_user_reply: false,
      fact_id: fact.fact_id,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function updateCommunication(state, thought) {
    const comm = state.communicationCore || { message_history: [] };
    comm.current_message = thought;
    comm.message_history = uniqueRows([thought].concat(asArray(comm.message_history)), row => row.thought_id).slice(0, 100);
    comm.updated_at = now();
    comm.truth_status = 'not_final';
    comm.promotion_status = 'not_promoted_to_final_truth';
    comm.belief_movement = 'provisional_only';
    state.communicationCore = comm;
    return comm;
  }

  function applyFactualClaimIntake(state, reason) {
    const lm = ensure(state);
    if (!lm) return null;
    const event = latestEvent(state);
    const raw = eventText(event);
    if (!raw) return lm;
    const fact = detectFactualClaim(raw, state);
    if (!fact) {
      lm.factual_intake_log = uniqueRows([{
        log_id: rowId('factlog', [event && event.id, raw, 'no_fact']),
        at: now(),
        reason: reason || 'factual_claim_intake_refresh',
        event_id: event && event.id || null,
        raw_preview: raw.slice(0, 180),
        factual_claim_detected: false,
        status: 'no_structured_external_factual_claim_detected',
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      }].concat(asArray(lm.factual_intake_log)), row => row.log_id).slice(0, 80);
      return lm;
    }
    fact.event_id = event && event.id || null;
    fact.refresh_reason = reason || 'factual_claim_intake_refresh';
    const relation = makeEntityRelation(fact, event);
    const pressure = makeTruthPressure(fact, event);
    const thought = makeThought(fact);
    lm.factual_claim_candidates = uniqueRows([fact].concat(asArray(lm.factual_claim_candidates)), row => row.fact_id).slice(0, 100);
    lm.entity_relation_candidates = uniqueRows([relation].concat(asArray(lm.entity_relation_candidates)), row => row.relation_id).slice(0, 100);
    lm.truth_relevance_pressure = uniqueRows([pressure].concat(asArray(lm.truth_relevance_pressure)), row => row.pressure_id).slice(0, 100);
    lm.live_thought = thought;
    lm.communication_pressure = uniqueRows([{
      pressure_id: rowId('factcomm', [thought.thought_id]),
      thought_id: thought.thought_id,
      pressure_kind: thought.thought_kind,
      priority: thought.priority,
      message: thought.message,
      source_pressure: thought.source_pressure,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(lm.communication_pressure)), row => row.pressure_id).slice(0, 100);
    updateCommunication(state, thought);

    if (state.beliefMemoryCore) {
      state.beliefMemoryCore.provisional_fact_candidates = uniqueRows([{
        fact_id: fact.fact_id,
        statement: fact.raw_text,
        relation_formula: fact.relation_formula,
        source_id: fact.source_id,
        source_kind: fact.source_kind,
        user_intent_candidate: fact.user_intent_candidate,
        truth_status: fact.truth_status,
        objective_truth_status: fact.objective_truth_status,
        promotion_status: fact.promotion_status,
        belief_movement: fact.belief_movement,
        memory_status: fact.memory_status,
        verification_need: fact.verification_need,
        created_at: fact.created_at,
        updated_at: fact.updated_at
      }].concat(asArray(state.beliefMemoryCore.provisional_fact_candidates)), row => row.fact_id).slice(0, 100);
    }

    lm.factual_intake_log = uniqueRows([{
      log_id: rowId('factlog', [event && event.id, fact.fact_id, reason]),
      at: now(),
      reason: reason || 'factual_claim_intake_refresh',
      event_id: event && event.id || null,
      factual_claim_detected: true,
      fact_id: fact.fact_id,
      relation_formula: fact.relation_formula,
      verification_need: fact.verification_need,
      thought_kind: thought.thought_kind,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(lm.factual_intake_log)), row => row.log_id).slice(0, 80);
    lm.updated_at = now();
    return lm;
  }

  function patchBaseRefresh() {
    const Base = global.EpistemicKernelLanguageMathCoreV01;
    if (!Base || Base.__factualClaimIntakePatchApplied) return;
    const wrapper = Object.assign({}, Base);
    const oldRefresh = Base.refreshLanguageMathCore;
    if (typeof oldRefresh === 'function') {
      wrapper.refreshLanguageMathCore = function factualRefresh(state, reason) {
        const result = oldRefresh.call(Base, state, reason || 'factual_claim_base_refresh');
        applyFactualClaimIntake(state, reason || 'factual_claim_after_base_refresh');
        return state && state.languageMathCore || result;
      };
    }
    wrapper.applyFactualClaimIntake = applyFactualClaimIntake;
    wrapper.detectFactualClaim = detectFactualClaim;
    wrapper.VERSION = `${Base.VERSION || '0.1.1'}+fact-${VERSION}`;
    wrapper.__factualClaimIntakePatchApplied = true;
    global.EpistemicKernelLanguageMathCoreV01 = Object.freeze(wrapper);
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__factualClaimIntakePatchApplied) return;
    const oldIngest = Kernel.prototype.ingest;
    const oldTick = Kernel.prototype.unifiedTick;
    const oldSnapshot = Kernel.prototype.snapshot;
    const oldRefresh = Kernel.prototype.refreshLanguageMathCore;
    if (oldIngest) Kernel.prototype.ingest = function factualKernelIngest(input, meta) { const result = oldIngest.call(this, input, meta || {}); applyFactualClaimIntake(stateFromKernel(this), 'kernel_ingest_factual_claim_intake'); return result; };
    if (oldTick) Kernel.prototype.unifiedTick = function factualKernelTick(reason) { const result = oldTick.call(this, reason); applyFactualClaimIntake(stateFromKernel(this), reason || 'kernel_tick_factual_claim_intake'); return result; };
    if (oldSnapshot) Kernel.prototype.snapshot = function factualKernelSnapshot() { applyFactualClaimIntake(stateFromKernel(this), 'kernel_snapshot_factual_claim_intake'); return oldSnapshot.call(this); };
    Kernel.prototype.refreshLanguageMathCore = function factualKernelRefresh(reason) { if (oldRefresh) oldRefresh.call(this, reason || 'kernel_refresh_factual_claim_intake'); return applyFactualClaimIntake(stateFromKernel(this), reason || 'kernel_manual_factual_claim_intake'); };
    Kernel.__factualClaimIntakePatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__factualClaimIntakeWrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    const oldRefresh = brain.refreshLanguageMathCore;
    if (oldIngest) brain.ingest = function factualBrainIngest(input, meta) { const result = oldIngest.call(brain, input, meta || {}); applyFactualClaimIntake(brain.state, 'brain_ingest_factual_claim_intake'); return result; };
    if (oldTick) brain.tick = function factualBrainTick(reason) { const result = oldTick.call(brain, reason); applyFactualClaimIntake(brain.state, reason || 'brain_tick_factual_claim_intake'); return result; };
    if (oldSnapshot) brain.snapshot = function factualBrainSnapshot() { applyFactualClaimIntake(brain.state, 'brain_snapshot_factual_claim_intake'); return oldSnapshot.call(brain); };
    brain.refreshLanguageMathCore = function factualBrainRefresh(reason) { if (oldRefresh) oldRefresh.call(brain, reason || 'brain_refresh_factual_claim_intake'); return applyFactualClaimIntake(brain.state, reason || 'brain_manual_factual_claim_intake'); };
    brain.__factualClaimIntakeWrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__factualClaimIntakePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function factualCreateState(seed) { const state = Original.createState(seed || {}); ensure(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function factualCreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function factualStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); applyFactualClaimIntake(state, 'static_ingest_factual_claim_intake'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function factualStaticTick(state, reason) { const result = Original.tick(state, reason); applyFactualClaimIntake(state, reason || 'static_tick_factual_claim_intake'); return result; };
    wrapper.__factualClaimIntakePatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__factualClaimIntakePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function factualBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensure(binding.shared_state);
      applyFactualClaimIntake(binding.shared_state, 'bridge_bind_factual_claim_intake');
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__factualClaimIntakePatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchBaseRefresh();
  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelFactualClaimIntakeV01 = Object.freeze({
    VERSION,
    doctrine,
    ensure,
    detectFactualClaim,
    applyFactualClaimIntake,
    patchBaseRefresh,
    patchKernel,
    patchBrainStatic,
    patchBridge,
    wrapBrain
  });
})(typeof window !== 'undefined' ? window : globalThis);
