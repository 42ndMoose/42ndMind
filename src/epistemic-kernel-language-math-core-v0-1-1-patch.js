/* 42ndMind Language-Math Core v0.1.1 Conversational Intent Patch
 *
 * Correction: direct conversation is language-math input too.
 * A question like "are you curious?" should be read as an intent relation:
 *   user_utterance -> request_self_state(curiosity)
 * and answered from live state, not filed as inert context.
 *
 * This patch does not add a chatbot connector. It strengthens languageMathCore
 * so communication remains a projection of live state pressure.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function rowId(prefix, parts) { return `${prefix}_${tinyHash(asArray(parts).join('|')).slice(0, 12)}`; }
  function latestEvent(state) { const rows = asArray(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(event) { return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text)); }
  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }
  function uniqueRows(rows, keyFn) { const seen = new Set(); const out = []; asArray(rows).forEach(row => { const key = keyFn(row); if (!key || seen.has(key)) return; seen.add(key); out.push(row); }); return out; }

  function patchDoctrine() {
    return {
      conversational_intent_is_language_math_relation: true,
      direct_questions_to_kernel_are_not_inert_context: true,
      self_state_questions_answer_from_live_state: true,
      intent_first_before_generic_context_fallback: true,
      answer_is_projection_of_state_not_scripted_persona: true,
      can_answer_yes_no_maybe_uncertain_from_state: true,
      communication_attention_is_not_external_connector: true,
      no_final_truth_promotion: true,
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
    if (!state.languageMathCore) state.languageMathCore = { packet_type:'42ndMind_language_math_core_v0_1', packet_version:'0.1.0' };
    if (!state.communicationCore) state.communicationCore = { packet_type:'42ndMind_communication_core_v0_1', packet_version:'0.1.0', message_history:[] };
    const lm = state.languageMathCore;
    lm.packet_version = VERSION;
    lm.patch_version = VERSION;
    lm.doctrine = Object.assign({}, lm.doctrine || {}, patchDoctrine());
    lm.intent_inference = asArray(lm.intent_inference);
    lm.self_state_answers = asArray(lm.self_state_answers);
    lm.communication_pressure = asArray(lm.communication_pressure);
    lm.integration_log = asArray(lm.integration_log);
    lm.truth_status = 'not_final';
    lm.promotion_status = 'not_promoted_to_final_truth';
    lm.belief_movement = 'provisional_only';
    const comm = state.communicationCore;
    comm.packet_version = VERSION;
    comm.patch_version = VERSION;
    comm.doctrine = Object.assign({}, comm.doctrine || {}, {
      communication_projects_live_state_pressure: true,
      answers_direct_questions_from_live_state: true,
      not_scripted_chatbot_connector: true,
      one_visible_thought_or_question_at_a_time: true,
      belief_movement: 'provisional_only'
    });
    comm.message_history = asArray(comm.message_history);
    comm.truth_status = 'not_final';
    comm.promotion_status = 'not_promoted_to_final_truth';
    comm.belief_movement = 'provisional_only';
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      conversational_intent_is_language_math_relation: true,
      communication_attention_is_not_external_connector: true,
      no_final_truth_promotion: true
    });
    return lm;
  }

  function inferIntent(raw) {
    const s = lower(raw);
    const isQuestion = /\?\s*$|\b(can you|could you|would you|are you|do you|what are you|what do you|why do you|how do you|tell me|answer me)\b/.test(s);
    const directToKernel = /\b(you|your|kernel|brain|curious|curiosity|answer|reply|say|think|believe|remember|know|want|wanting|need|attention|state)\b/.test(s);
    const asksCuriosity = /\b(curious|curiosity|what are you curious|are you curious)\b/.test(s);
    const asksCanAnswer = /\b(can you answer|answer me|can you reply|will you answer|can you say|can you communicate)\b/.test(s);
    const asksBelief = /\b(what do you believe|do you believe|your belief|what is your view|what do you think)\b/.test(s);
    const asksMemory = /\b(do you remember|what do you remember|memory|memorize|learned)\b/.test(s);
    const asksWant = /\b(do you want|what do you want|want to learn|need to know)\b/.test(s);
    const speechAct = isQuestion && directToKernel ? 'direct_question_to_kernel' : isQuestion ? 'question_or_probe' : 'statement_or_context';
    const requested = [];
    if (asksCuriosity) requested.push('curiosity_state');
    if (asksCanAnswer) requested.push('communication_capability');
    if (asksBelief) requested.push('provisional_belief_state');
    if (asksMemory) requested.push('memory_state');
    if (asksWant) requested.push('learning_or_attention_appetite');
    return {
      intent_id: rowId('intent', [raw]),
      raw_text: text(raw),
      speech_act: speechAct,
      inferred_user_intent: requested.length ? 'request_kernel_self_state_answer' : speechAct === 'direct_question_to_kernel' ? 'request_kernel_answer' : 'carry_as_context_or_claim',
      requested_state_targets: requested,
      should_answer_now: speechAct === 'direct_question_to_kernel' || requested.length > 0,
      confidence: requested.length ? 0.88 : speechAct === 'direct_question_to_kernel' ? 0.72 : isQuestion ? 0.54 : 0.35,
      relation_formula: `user_utterance -> ${requested.length ? 'request_self_state(' + requested.join(',') + ')' : speechAct}`,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function currentCuriosity(state) {
    const c = state && state.curiosityCore || {};
    const activeQuestions = asArray(c.active_questions).filter(q => !q.answered);
    return {
      exists: !!state && !!state.curiosityCore,
      active: c.active === true || activeQuestions.length > 0 || !!c.current_question,
      curiosity_state: text(c.curiosity_state || (activeQuestions.length ? 'active' : 'idle')),
      current_question: text(c.current_question || (activeQuestions[0] && activeQuestions[0].question_text) || ''),
      focus_span: text(c.focus_span || (activeQuestions[0] && activeQuestions[0].target_span) || ''),
      active_question_count: activeQuestions.length,
      unresolved_count: asArray(c.unresolved_referents).length,
      answer_log_count: asArray(c.answer_log).length
    };
  }

  function currentLearning(state) {
    const l = state && state.learningDrive || {};
    return {
      exists: !!state && !!state.learningDrive,
      active: l.active === true || asArray(l.learning_goals).length > 0 || asArray(l.active_learning_goals).length > 0,
      goal_count: asArray(l.learning_goals || l.active_learning_goals).length,
      current_goal: text(l.current_goal || (asArray(l.learning_goals || l.active_learning_goals)[0] && (asArray(l.learning_goals || l.active_learning_goals)[0].goal_text || asArray(l.learning_goals || l.active_learning_goals)[0].question_text)) || '')
    };
  }

  function currentBeliefMemory(state) {
    const b = state && state.beliefMemoryCore || {};
    return {
      exists: !!state && !!state.beliefMemoryCore,
      memory_items: asArray(b.memory_items).length,
      provisional_beliefs: asArray(b.provisional_beliefs).length,
      active_questions: asArray(b.active_questions).length,
      latest_reaction_kind: text(b.latest_reaction && b.latest_reaction.reaction_kind || ''),
      trust_score_candidate: Number(b.user_trust_profile && b.user_trust_profile.trust_score_candidate || 0)
    };
  }

  function currentLanguageMath(state) {
    const lm = state && state.languageMathCore || {};
    return {
      exists: !!state && !!state.languageMathCore,
      formula_memory_available: lm.formula_memory_summary && lm.formula_memory_summary.available === true,
      total_formula_records: Number(lm.formula_memory_summary && lm.formula_memory_summary.total_formula_record_count || 0),
      semantic_conflicts: asArray(lm.semantic_conflicts).length,
      parser_results: asArray(lm.parser_results).length,
      live_thought_kind: text(lm.live_thought && lm.live_thought.thought_kind || '')
    };
  }

  function answerSelfState(state, intent) {
    const curiosity = currentCuriosity(state);
    const learning = currentLearning(state);
    const belief = currentBeliefMemory(state);
    const lmState = currentLanguageMath(state);
    const maturity = state && state.maturityCore || {};
    const targets = asArray(intent.requested_state_targets);
    let answerKind = 'general_self_state_answer';
    let message = '';

    if (targets.includes('curiosity_state')) {
      answerKind = 'curiosity_state_answer';
      if (curiosity.active && curiosity.current_question) {
        message = `Yes. My current curiosity is focused on: “${curiosity.current_question}”`;
        if (curiosity.focus_span) message += ` I am using the span “${curiosity.focus_span}” as the referent.`;
      } else if (curiosity.active) {
        message = 'Yes, but weakly. I have active unresolved attention, but no single clean question is currently dominant.';
      } else {
        message = 'Maybe, weakly. I do not have a strong active curiosity question right now, but I am still trying to classify your input into conversation, claim, meaning, memory, or learning context.';
      }
      if (targets.includes('communication_capability')) message += ' I can answer you when I can infer your intent well enough from the live state.';
    } else if (targets.includes('communication_capability')) {
      answerKind = 'communication_capability_answer';
      message = 'Yes. I can answer when your input is a direct question or when my live state has enough pressure to project a statement, question, correction, or uncertainty.';
    } else if (targets.includes('provisional_belief_state')) {
      answerKind = 'belief_state_answer';
      message = belief.provisional_beliefs
        ? `I currently have ${belief.provisional_beliefs} provisional belief candidate(s). They can guide interpretation, but they are not final truth.`
        : 'I do not have a strong provisional belief to report here yet. I can carry this as context until enough support or contradiction appears.';
    } else if (targets.includes('memory_state')) {
      answerKind = 'memory_state_answer';
      message = `I currently have ${belief.memory_items || 0} belief-memory item(s) and ${lmState.total_formula_records || 0} formula-memory record(s) available to the live state.`;
    } else if (targets.includes('learning_or_attention_appetite')) {
      answerKind = 'learning_attention_answer';
      message = learning.active && learning.current_goal
        ? `I want to learn enough to reduce uncertainty around: “${learning.current_goal}”`
        : 'I want to learn what improves interpretation, contradiction handling, memory usefulness, and movement toward objective truth.';
    } else {
      message = 'I can treat this as a direct question to my live state, but I need a clearer target: curiosity, belief, memory, learning, or meaning.';
    }

    return {
      answer_id: rowId('selfanswer', [intent.intent_id, message]),
      answer_kind: answerKind,
      message,
      state_snapshot: {
        curiosity,
        learning,
        belief_memory: belief,
        language_math: lmState,
        maturity: {
          exists: !!(state && state.maturityCore),
          core_philosophy: text(maturity.core_philosophy || ''),
          maturity_state: text(maturity.maturity_state || ''),
          wants_peak: maturity.wants_peak === true,
          aims_at_peak: maturity.aims_at_peak === true,
          stays_at_peak: maturity.stays_at_peak === true
        }
      },
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function makeThoughtFromAnswer(intent, answer) {
    return {
      thought_id: rowId('thoughtv011', [intent.intent_id, answer.answer_id]),
      thought_kind: 'direct_self_state_answer',
      message: answer.message,
      source_pressure: 'conversational_intent_self_state_request',
      inferred_user_intent: intent.inferred_user_intent,
      intent_relation_formula: intent.relation_formula,
      priority: 0.91,
      expects_user_reply: false,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function updateCommunication(state, thought) {
    const comm = state.communicationCore || {};
    comm.current_message = thought;
    comm.message_history = uniqueRows([thought].concat(asArray(comm.message_history)), row => row.thought_id).slice(0, 80);
    comm.updated_at = now();
    comm.truth_status = 'not_final';
    comm.promotion_status = 'not_promoted_to_final_truth';
    comm.belief_movement = 'provisional_only';
    state.communicationCore = comm;
    return comm;
  }

  function applyConversationalIntent(state, reason) {
    const lm = ensure(state);
    if (!lm) return null;
    const event = latestEvent(state);
    const raw = eventText(event);
    if (!raw) return lm;
    const intent = inferIntent(raw);
    intent.event_id = event && event.id || null;
    intent.reason = reason || 'conversational_intent_refresh';
    lm.intent_inference = uniqueRows([intent].concat(asArray(lm.intent_inference)), row => row.intent_id).slice(0, 80);

    if (intent.should_answer_now) {
      const answer = answerSelfState(state, intent);
      answer.event_id = event && event.id || null;
      lm.self_state_answers = uniqueRows([answer].concat(asArray(lm.self_state_answers)), row => row.answer_id).slice(0, 80);
      const thought = makeThoughtFromAnswer(intent, answer);
      lm.live_thought = thought;
      lm.communication_pressure = uniqueRows([{
        pressure_id: rowId('commv011', [thought.thought_id]),
        thought_id: thought.thought_id,
        pressure_kind: thought.thought_kind,
        priority: thought.priority,
        message: thought.message,
        source_pressure: thought.source_pressure,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      }].concat(asArray(lm.communication_pressure)), row => row.pressure_id).slice(0, 80);
      updateCommunication(state, thought);
    }

    lm.integration_log = uniqueRows([{
      log_id: rowId('lmlogv011', [event && event.id, intent.intent_id, reason]),
      at: now(),
      reason: reason || 'conversational_intent_refresh',
      event_id: event && event.id || null,
      speech_act: intent.speech_act,
      inferred_user_intent: intent.inferred_user_intent,
      requested_state_targets: clone(intent.requested_state_targets),
      answered_now: intent.should_answer_now === true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(lm.integration_log)), row => row.log_id).slice(0, 80);

    lm.updated_at = now();
    return lm;
  }

  function patchBaseRefresh() {
    const Base = global.EpistemicKernelLanguageMathCoreV01;
    if (!Base || Base.__v011ConversationalIntentPatchApplied) return;
    const wrapper = Object.assign({}, Base);
    const oldRefresh = Base.refreshLanguageMathCore;
    if (typeof oldRefresh === 'function') {
      wrapper.refreshLanguageMathCore = function patchedRefreshLanguageMathCore(state, reason) {
        const result = oldRefresh.call(Base, state, reason || 'language_math_v011_base_refresh');
        applyConversationalIntent(state, reason || 'language_math_v011_after_base_refresh');
        return state && state.languageMathCore || result;
      };
    }
    wrapper.inferConversationalIntent = inferIntent;
    wrapper.applyConversationalIntent = applyConversationalIntent;
    wrapper.answerSelfState = answerSelfState;
    wrapper.patchDoctrineV011 = patchDoctrine;
    wrapper.VERSION = VERSION;
    wrapper.__v011ConversationalIntentPatchApplied = true;
    global.EpistemicKernelLanguageMathCoreV01 = Object.freeze(wrapper);
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__languageMathV011PatchApplied) return;
    const oldIngest = Kernel.prototype.ingest;
    const oldTick = Kernel.prototype.unifiedTick;
    const oldSnapshot = Kernel.prototype.snapshot;
    const oldRefresh = Kernel.prototype.refreshLanguageMathCore;
    if (oldIngest) Kernel.prototype.ingest = function languageMathV011KernelIngest(input, meta) { const result = oldIngest.call(this, input, meta || {}); applyConversationalIntent(stateFromKernel(this), 'kernel_ingest_conversational_intent'); return result; };
    if (oldTick) Kernel.prototype.unifiedTick = function languageMathV011KernelTick(reason) { const result = oldTick.call(this, reason); applyConversationalIntent(stateFromKernel(this), reason || 'kernel_tick_conversational_intent'); return result; };
    if (oldSnapshot) Kernel.prototype.snapshot = function languageMathV011KernelSnapshot() { applyConversationalIntent(stateFromKernel(this), 'kernel_snapshot_conversational_intent'); return oldSnapshot.call(this); };
    Kernel.prototype.refreshLanguageMathCore = function languageMathV011KernelRefresh(reason) {
      if (oldRefresh) oldRefresh.call(this, reason || 'kernel_refresh_language_math_v011');
      return applyConversationalIntent(stateFromKernel(this), reason || 'kernel_manual_conversational_intent');
    };
    Kernel.__languageMathV011PatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__languageMathV011Wrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    const oldRefresh = brain.refreshLanguageMathCore;
    if (oldIngest) brain.ingest = function languageMathV011BrainIngest(input, meta) { const result = oldIngest.call(brain, input, meta || {}); applyConversationalIntent(brain.state, 'brain_ingest_conversational_intent'); return result; };
    if (oldTick) brain.tick = function languageMathV011BrainTick(reason) { const result = oldTick.call(brain, reason); applyConversationalIntent(brain.state, reason || 'brain_tick_conversational_intent'); return result; };
    if (oldSnapshot) brain.snapshot = function languageMathV011BrainSnapshot() { applyConversationalIntent(brain.state, 'brain_snapshot_conversational_intent'); return oldSnapshot.call(brain); };
    brain.refreshLanguageMathCore = function languageMathV011BrainRefresh(reason) {
      if (oldRefresh) oldRefresh.call(brain, reason || 'brain_refresh_language_math_v011');
      return applyConversationalIntent(brain.state, reason || 'brain_manual_conversational_intent');
    };
    brain.__languageMathV011Wrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__languageMathV011PatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function languageMathV011CreateState(seed) { const state = Original.createState(seed || {}); ensure(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function languageMathV011CreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function languageMathV011StaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); applyConversationalIntent(state, 'static_ingest_conversational_intent'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function languageMathV011StaticTick(state, reason) { const result = Original.tick(state, reason); applyConversationalIntent(state, reason || 'static_tick_conversational_intent'); return result; };
    wrapper.__languageMathV011PatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__languageMathV011PatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function languageMathV011BridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensure(binding.shared_state);
      applyConversationalIntent(binding.shared_state, 'bridge_bind_conversational_intent');
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__languageMathV011PatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchBaseRefresh();
  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelLanguageMathCoreV011Patch = Object.freeze({
    VERSION,
    patchDoctrine,
    inferIntent,
    applyConversationalIntent,
    answerSelfState,
    currentCuriosity,
    currentLearning,
    currentBeliefMemory,
    currentLanguageMath,
    patchBaseRefresh,
    patchKernel,
    patchBrainStatic,
    patchBridge,
    wrapBrain
  });
})(typeof window !== 'undefined' ? window : globalThis);
