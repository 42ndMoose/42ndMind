/* 42ndMind Question Appetite v0.1
 *
 * Makes useful questions arise from live need pressure, not fixed prompt rules.
 * The kernel asks when learning opportunity, source-role uncertainty, identity
 * need, meaning scope, memory commitment, or verification pressure matter.
 *
 * This is not a connector and not a strict bottleneck.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function rowId(prefix, parts) { return `${prefix}_${tinyHash(asArray(parts).join('|')).slice(0, 12)}`; }
  function latestEvent(state) { const rows = asArray(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(event) { return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text)); }
  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }
  function uniqueRows(rows, keyFn) { const seen = new Set(); const out = []; asArray(rows).forEach(row => { const key = keyFn(row); if (!key || seen.has(key)) return; seen.add(key); out.push(row); }); return out; }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }

  function doctrine() {
    return {
      question_appetite_lives_inside_owned_state: true,
      questions_arise_from_live_need_pressure: true,
      not_a_connector_question_module: true,
      not_a_strict_bottleneck_rule: true,
      no_always_ask_identity_rule: true,
      learning_opportunity_can_raise_source_role_need: true,
      factual_claims_can_raise_verification_need_without_forcing_question: true,
      communication_candidates_are_pressure_candidates_not_scripts: true,
      one_selected_question_is_projection_of_need_pressure: true,
      no_final_truth_promotion: true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function ensure(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.learningDrive || typeof state.learningDrive !== 'object') state.learningDrive = { packet_type: '42ndMind_learning_drive_auto_stub' };
    if (!state.curiosityCore || typeof state.curiosityCore !== 'object') state.curiosityCore = { packet_type: '42ndMind_curiosity_auto_stub' };
    if (!state.communicationCore || typeof state.communicationCore !== 'object') state.communicationCore = { packet_type: '42ndMind_communication_core_v0_1', message_history: [] };
    if (!state.languageMathCore || typeof state.languageMathCore !== 'object') state.languageMathCore = { packet_type: '42ndMind_language_math_core_v0_1' };

    const learning = state.learningDrive;
    learning.question_appetite_version = VERSION;
    learning.doctrine = Object.assign({}, learning.doctrine || {}, doctrine());
    learning.question_appetite = asArray(learning.question_appetite);
    learning.learning_priority_questions = asArray(learning.learning_priority_questions);

    const curiosity = state.curiosityCore;
    curiosity.question_appetite_version = VERSION;
    curiosity.priority_needs = asArray(curiosity.priority_needs);

    const comm = state.communicationCore;
    comm.question_appetite_version = VERSION;
    comm.attention_candidates = asArray(comm.attention_candidates);
    comm.message_history = asArray(comm.message_history);

    const lm = state.languageMathCore;
    lm.question_appetite_version = VERSION;
    lm.doctrine = Object.assign({}, lm.doctrine || {}, doctrine());
    lm.question_appetite_log = asArray(lm.question_appetite_log);

    state.doctrine = Object.assign({}, state.doctrine || {}, {
      question_appetite_lives_inside_owned_state: true,
      questions_arise_from_live_need_pressure: true,
      not_a_strict_bottleneck_rule: true,
      no_final_truth_promotion: true
    });
    return learning;
  }

  function userNameKnown(state) {
    const rows = asArray(state && state.beliefMemoryCore && state.beliefMemoryCore.memory_items);
    return rows.some(row => /\bmy name is\b|\bcall me\b|\bname is\b/i.test(text(row.statement || row.raw_text || '')));
  }

  function recentFactPressure(state) {
    const rows = asArray(state && state.languageMathCore && state.languageMathCore.truth_relevance_pressure);
    return rows.length ? rows[0] : null;
  }

  function recentFactualClaim(state) {
    const rows = asArray(state && state.languageMathCore && state.languageMathCore.factual_claim_candidates);
    return rows.length ? rows[0] : null;
  }

  function detectLearningOpportunity(raw) {
    const s = lower(raw);
    return /\b(ask me anything|you can ask me anything|ask anything|i can give you answers|i offered to give you answers|give you answers|teach you|i can teach|for you to understand|understand everything better|one small info at a time|learn from me|i will tell you)\b/.test(s);
  }

  function detectIdentityOrSourceOffer(raw) {
    const s = lower(raw);
    return /\b(i am your creator|i created you|creator|operator|teacher|tester|testing you|user|source|learn from me)\b/.test(s);
  }

  function detectMeaningOffer(raw) {
    const s = lower(raw);
    return /\b(means|meaning|define|definition|word|language|private meaning|invented language)\b/.test(s);
  }

  function scoreNeeds(state, raw) {
    const s = lower(raw);
    const learningOpportunity = detectLearningOpportunity(raw);
    const identityKnown = userNameKnown(state);
    const sourceOffer = detectIdentityOrSourceOffer(raw);
    const meaningOffer = detectMeaningOffer(raw);
    const fact = recentFactualClaim(state);
    const factWasCurrent = fact && text(fact.raw_text).toLowerCase() === s;
    const pressures = [];

    const identityNeed = clamp01((learningOpportunity ? 0.68 : 0.18) + (!identityKnown ? 0.16 : -0.18) + (sourceOffer ? 0.1 : 0));
    const sourceRoleNeed = clamp01((learningOpportunity ? 0.82 : 0.22) + (sourceOffer ? 0.18 : 0) + (factWasCurrent ? 0.2 : 0));
    const learningOpportunityNeed = clamp01(learningOpportunity ? 0.92 : sourceOffer ? 0.55 : 0.18);
    const truthVerificationNeed = clamp01(factWasCurrent ? Number(fact.verification_need || 0.7) : recentFactPressure(state) ? 0.42 : 0.12);
    const meaningScopeNeed = clamp01(meaningOffer ? 0.7 : 0.12);
    const memoryCommitmentNeed = clamp01(/\b(remember|memorize|store|keep this|use this later|from now on)\b/.test(s) ? 0.76 : learningOpportunity ? 0.46 : 0.16);

    function add(kind, pressure, reason) {
      pressures.push({
        need_id: rowId('need', [kind, raw, pressure]),
        need_kind: kind,
        pressure: Number(pressure.toFixed(3)),
        reason,
        status: pressure >= 0.65 ? 'active_need_pressure' : pressure >= 0.35 ? 'background_need_pressure' : 'low_need_pressure',
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      });
    }

    add('identity_need', identityNeed, 'Knowing what to call the speaker improves communication but is not always required.');
    add('source_role_need', sourceRoleNeed, 'Learning from the user is safer when the kernel knows whether the user is teaching, testing, giving context, or acting as creator/operator.');
    add('learning_opportunity_need', learningOpportunityNeed, 'The user appears to be offering information or instruction that may reduce ignorance.');
    add('truth_verification_need', truthVerificationNeed, 'External-world claims can be held provisionally but require verification before objective use.');
    add('meaning_scope_need', meaningScopeNeed, 'Meaning claims need scope, boundary, and conflict handling.');
    add('memory_commitment_need', memoryCommitmentNeed, 'Durable learning should distinguish temporary context from memory-worthy context.');

    return pressures.sort((a, b) => b.pressure - a.pressure);
  }

  function buildQuestion(state, raw, needs) {
    const top = asArray(needs)[0];
    const byKind = Object.fromEntries(asArray(needs).map(n => [n.need_kind, n]));
    let question = null;
    let kind = null;
    let priority = top ? top.pressure : 0;
    const fact = recentFactualClaim(state);
    const factWasCurrent = fact && lower(fact.raw_text) === lower(raw);

    if (byKind.learning_opportunity_need && byKind.learning_opportunity_need.pressure >= 0.85 && byKind.source_role_need && byKind.source_role_need.pressure >= 0.7) {
      kind = 'source_role_learning_priority_question';
      question = 'What should I call you, and are you trying to teach me facts, meanings, or your worldview?';
      priority = Math.max(priority, 0.9);
    } else if (factWasCurrent && byKind.truth_verification_need && byKind.truth_verification_need.pressure >= 0.75) {
      kind = 'factual_claim_truth_scope_question';
      question = `Should I hold “${fact.relation_formula}” as a user-supplied factual candidate to verify later, or were you testing my fact intake?`;
      priority = Math.max(priority, 0.78);
    } else if (byKind.meaning_scope_need && byKind.meaning_scope_need.pressure >= 0.65) {
      kind = 'meaning_scope_question';
      question = 'Is this a general meaning claim, a private/local definition, a joke, or a test of semantic trust?';
      priority = Math.max(priority, 0.72);
    } else if (byKind.memory_commitment_need && byKind.memory_commitment_need.pressure >= 0.65) {
      kind = 'memory_commitment_question';
      question = 'Should I keep this as durable memory, temporary conversation context, or a provisional belief candidate?';
      priority = Math.max(priority, 0.7);
    }

    if (!question) return null;
    return {
      question_id: rowId('qapp', [raw, kind, question]),
      question_kind: kind,
      question_text: question,
      priority: Number(priority.toFixed(3)),
      source_needs: asArray(needs).filter(n => n.pressure >= 0.35).map(n => ({ need_kind: n.need_kind, pressure: n.pressure, reason: n.reason })),
      status: 'selected_from_live_need_pressure_not_fixed_rule',
      blocks_continuation: false,
      expects_user_reply: true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function makeThought(question) {
    if (!question) return null;
    return {
      thought_id: rowId('qthought', [question.question_id]),
      thought_kind: 'learning_priority_question',
      message: question.question_text,
      source_pressure: 'question_appetite_need_pressure',
      priority: question.priority,
      expects_user_reply: true,
      question_id: question.question_id,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function updateCommunication(state, thought, question, needs) {
    const comm = state.communicationCore || { message_history: [] };
    const candidate = {
      candidate_id: rowId('attcand', [thought.thought_id]),
      candidate_kind: thought.thought_kind,
      message: thought.message,
      priority: thought.priority,
      source_pressure: thought.source_pressure,
      question_id: question.question_id,
      source_needs: clone(question.source_needs),
      status: 'attention_candidate_from_question_appetite',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
    comm.attention_candidates = uniqueRows([candidate].concat(asArray(comm.attention_candidates)), row => row.candidate_id).slice(0, 100);
    const currentPriority = Number(comm.current_message && comm.current_message.priority || 0);
    if (!comm.current_message || thought.priority >= currentPriority || thought.priority >= 0.88) {
      comm.current_message = thought;
      comm.selected_pressure = candidate;
      comm.message_history = uniqueRows([thought].concat(asArray(comm.message_history)), row => row.thought_id).slice(0, 100);
    }
    comm.updated_at = now();
    comm.truth_status = 'not_final';
    comm.promotion_status = 'not_promoted_to_final_truth';
    comm.belief_movement = 'provisional_only';
    state.communicationCore = comm;
    return comm;
  }

  function applyQuestionAppetite(state, reason) {
    const learning = ensure(state);
    if (!learning) return null;
    const event = latestEvent(state);
    const raw = eventText(event);
    if (!raw) return learning;
    const needs = scoreNeeds(state, raw);
    const activeNeeds = needs.filter(n => n.pressure >= 0.35);
    const question = buildQuestion(state, raw, needs);

    learning.question_appetite = uniqueRows([{
      appetite_id: rowId('appetite', [event && event.id, raw]),
      at: now(),
      event_id: event && event.id || null,
      raw_preview: raw.slice(0, 220),
      top_need: needs[0] || null,
      active_needs: activeNeeds,
      selected_question_id: question && question.question_id || null,
      status: question ? 'question_selected_from_need_pressure' : 'no_question_needed_yet',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(learning.question_appetite)), row => row.appetite_id).slice(0, 100);

    state.curiosityCore.priority_needs = uniqueRows(activeNeeds.concat(asArray(state.curiosityCore.priority_needs)), row => row.need_id).slice(0, 100);

    if (question) {
      learning.learning_priority_questions = uniqueRows([question].concat(asArray(learning.learning_priority_questions)), row => row.question_id).slice(0, 100);
      const thought = makeThought(question);
      state.languageMathCore.live_thought = thought;
      state.languageMathCore.communication_pressure = uniqueRows([{
        pressure_id: rowId('qcomm', [thought.thought_id]),
        thought_id: thought.thought_id,
        pressure_kind: thought.thought_kind,
        priority: thought.priority,
        message: thought.message,
        source_pressure: thought.source_pressure,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      }].concat(asArray(state.languageMathCore.communication_pressure)), row => row.pressure_id).slice(0, 100);
      updateCommunication(state, thought, question, needs);
    }

    state.languageMathCore.question_appetite_log = uniqueRows([{
      log_id: rowId('qlog', [event && event.id, raw, reason]),
      at: now(),
      reason: reason || 'question_appetite_refresh',
      event_id: event && event.id || null,
      active_need_count: activeNeeds.length,
      selected_question: question ? question.question_text : null,
      selected_question_kind: question ? question.question_kind : null,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(state.languageMathCore.question_appetite_log)), row => row.log_id).slice(0, 100);

    return learning;
  }

  function patchBaseRefresh() {
    const Base = global.EpistemicKernelLanguageMathCoreV01;
    if (!Base || Base.__questionAppetitePatchApplied) return;
    const wrapper = Object.assign({}, Base);
    const oldRefresh = Base.refreshLanguageMathCore;
    if (typeof oldRefresh === 'function') {
      wrapper.refreshLanguageMathCore = function questionAppetiteRefresh(state, reason) {
        const result = oldRefresh.call(Base, state, reason || 'question_appetite_base_refresh');
        applyQuestionAppetite(state, reason || 'question_appetite_after_base_refresh');
        return state && state.languageMathCore || result;
      };
    }
    wrapper.applyQuestionAppetite = applyQuestionAppetite;
    wrapper.scoreQuestionNeeds = scoreNeeds;
    wrapper.VERSION = `${Base.VERSION || '0.1.1'}+qapp-${VERSION}`;
    wrapper.__questionAppetitePatchApplied = true;
    global.EpistemicKernelLanguageMathCoreV01 = Object.freeze(wrapper);
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__questionAppetitePatchApplied) return;
    const oldIngest = Kernel.prototype.ingest;
    const oldTick = Kernel.prototype.unifiedTick;
    const oldSnapshot = Kernel.prototype.snapshot;
    const oldRefresh = Kernel.prototype.refreshLanguageMathCore;
    if (oldIngest) Kernel.prototype.ingest = function questionKernelIngest(input, meta) { const result = oldIngest.call(this, input, meta || {}); applyQuestionAppetite(stateFromKernel(this), 'kernel_ingest_question_appetite'); return result; };
    if (oldTick) Kernel.prototype.unifiedTick = function questionKernelTick(reason) { const result = oldTick.call(this, reason); applyQuestionAppetite(stateFromKernel(this), reason || 'kernel_tick_question_appetite'); return result; };
    if (oldSnapshot) Kernel.prototype.snapshot = function questionKernelSnapshot() { applyQuestionAppetite(stateFromKernel(this), 'kernel_snapshot_question_appetite'); return oldSnapshot.call(this); };
    Kernel.prototype.refreshLanguageMathCore = function questionKernelRefresh(reason) { if (oldRefresh) oldRefresh.call(this, reason || 'kernel_refresh_question_appetite'); return applyQuestionAppetite(stateFromKernel(this), reason || 'kernel_manual_question_appetite'); };
    Kernel.__questionAppetitePatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__questionAppetiteWrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    const oldRefresh = brain.refreshLanguageMathCore;
    if (oldIngest) brain.ingest = function questionBrainIngest(input, meta) { const result = oldIngest.call(brain, input, meta || {}); applyQuestionAppetite(brain.state, 'brain_ingest_question_appetite'); return result; };
    if (oldTick) brain.tick = function questionBrainTick(reason) { const result = oldTick.call(brain, reason); applyQuestionAppetite(brain.state, reason || 'brain_tick_question_appetite'); return result; };
    if (oldSnapshot) brain.snapshot = function questionBrainSnapshot() { applyQuestionAppetite(brain.state, 'brain_snapshot_question_appetite'); return oldSnapshot.call(brain); };
    brain.refreshLanguageMathCore = function questionBrainRefresh(reason) { if (oldRefresh) oldRefresh.call(brain, reason || 'brain_refresh_question_appetite'); return applyQuestionAppetite(brain.state, reason || 'brain_manual_question_appetite'); };
    brain.__questionAppetiteWrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__questionAppetitePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function questionCreateState(seed) { const state = Original.createState(seed || {}); ensure(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function questionCreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function questionStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); applyQuestionAppetite(state, 'static_ingest_question_appetite'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function questionStaticTick(state, reason) { const result = Original.tick(state, reason); applyQuestionAppetite(state, reason || 'static_tick_question_appetite'); return result; };
    wrapper.__questionAppetitePatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__questionAppetitePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function questionBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensure(binding.shared_state);
      applyQuestionAppetite(binding.shared_state, 'bridge_bind_question_appetite');
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__questionAppetitePatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchBaseRefresh();
  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelQuestionAppetiteV01 = Object.freeze({
    VERSION,
    doctrine,
    ensure,
    scoreNeeds,
    buildQuestion,
    applyQuestionAppetite,
    patchBaseRefresh,
    patchKernel,
    patchBrainStatic,
    patchBridge,
    wrapBrain
  });
})(typeof window !== 'undefined' ? window : globalThis);
