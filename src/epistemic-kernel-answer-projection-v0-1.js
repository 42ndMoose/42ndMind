/* 42ndMind Answer Projection v0.1
 *
 * Direct questions are not inert context and not factual claims.
 * This organ projects answers from live state: memory, factual candidates,
 * language-math doctrine, maturity identity, and learning appetite.
 *
 * It is not a chatbot connector. It is a live-state answer projection layer.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

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

  function doctrine() {
    return {
      answer_projection_lives_inside_owned_state: true,
      direct_questions_are_answer_requests_not_context_fallbacks: true,
      factual_questions_are_not_factual_claims: true,
      answers_project_from_live_state_not_scripted_persona: true,
      unknown_answers_should_say_unknown_not_context_acknowledgement: true,
      user_memory_can_answer_user_identity_questions_without_final_truth: true,
      factual_candidates_can_answer_as_unverified_user_supplied_candidates: true,
      no_auto_external_verification: true,
      no_final_truth_promotion: true,
      not_a_chatbot_connector: true,
      belief_movement: 'provisional_only'
    };
  }

  function ensure(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.communicationCore) state.communicationCore = { packet_type: '42ndMind_communication_core_v0_1', message_history: [] };
    if (!state.languageMathCore) state.languageMathCore = { packet_type: '42ndMind_language_math_core_v0_1' };
    const comm = state.communicationCore;
    comm.answer_projection_version = VERSION;
    comm.doctrine = Object.assign({}, comm.doctrine || {}, doctrine());
    comm.answer_projection_log = asArray(comm.answer_projection_log);
    comm.question_answer_candidates = asArray(comm.question_answer_candidates);
    comm.message_history = asArray(comm.message_history);
    const lm = state.languageMathCore;
    lm.answer_projection_version = VERSION;
    lm.doctrine = Object.assign({}, lm.doctrine || {}, doctrine());
    lm.interrogative_fact_drift_log = asArray(lm.interrogative_fact_drift_log);
    lm.answer_projection_log = asArray(lm.answer_projection_log);
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      answer_projection_lives_inside_owned_state: true,
      direct_questions_are_answer_requests_not_context_fallbacks: true,
      factual_questions_are_not_factual_claims: true,
      no_final_truth_promotion: true
    });
    return comm;
  }

  function isQuestion(raw) {
    const s = lower(raw);
    return /\?\s*$/.test(s) || /^(who|what|when|where|why|how|do|does|did|can|could|would|should|is|are|am)\b/.test(s);
  }

  function classifyQuestion(raw) {
    const s = lower(raw);
    if (!isQuestion(raw)) return { is_question: false, question_kind: 'not_question' };
    if (/\bwhat(?:'s| is) my name\b/.test(s)) return { is_question: true, question_kind: 'user_name_question' };
    if (/\bmy name\b/.test(s) && /\?/.test(s)) return { is_question: true, question_kind: 'user_name_question' };
    if (/\bdo you know who i am\b|\bwho am i\b/.test(s)) return { is_question: true, question_kind: 'user_identity_question' };
    if (/\bwhat are you\b|\bwhat r u\b/.test(s)) return { is_question: true, question_kind: 'kernel_identity_question' };
    if (/\bwhat(?:'s| is) your name\b/.test(s)) return { is_question: true, question_kind: 'kernel_name_question' };
    if (/\bfinal truth\b/.test(s)) return { is_question: true, question_kind: 'final_truth_question' };
    if (/\bwhat do you want to know\b|\bwhat info.*want.*learn\b|\bwhat info.*specifically\b|\bwhat.*specifically.*learn\b/.test(s)) return { is_question: true, question_kind: 'learning_appetite_question' };
    if (/\bcan you say something(?: else)?\b|\bcan you answer\b|\bcan you talk\b|\bsay something\b/.test(s)) return { is_question: true, question_kind: 'communication_prompt' };
    if (/\bwho\s+is\s+(?:the\s+)?\d+(?:st|nd|rd|th)?\s+president\s+of\s+(?:the\s+)?(?:usa|us|united states|united states of america)\b/.test(s) || /\bdo you know who\s+is\s+(?:the\s+)?\d+(?:st|nd|rd|th)?\s+president\s+of\s+(?:the\s+)?(?:usa|us|united states|united states of america)\b/.test(s)) {
      return { is_question: true, question_kind: 'external_fact_answer_request', relation: 'is_47th_president_of', object_family: 'usa' };
    }
    return { is_question: true, question_kind: 'general_direct_question' };
  }

  function ingestUserNameIfPresent(state, raw) {
    const s = text(raw);
    const match = s.match(/\bmy name is\s+([A-Za-z][A-Za-z\-']{1,40})\b/i) || s.match(/\bcall me\s+([A-Za-z][A-Za-z\-']{1,40})\b/i);
    if (!match) return null;
    const name = match[1];
    const comm = ensure(state);
    comm.user_identity_model = Object.assign({}, comm.user_identity_model || {}, {
      preferred_name: name,
      source_id: 'direct_user',
      source_kind: 'user_input',
      confidence: 0.82,
      truth_status: 'user_supplied_identity_context_not_final_truth',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only',
      updated_at: now()
    });
    if (state.beliefMemoryCore) {
      state.beliefMemoryCore.memory_items = uniqueRows([{
        memory_id: rowId('mem_name', [name]),
        memory_kind: 'user_identity_context',
        belief_ladder_stage: 'learned_context',
        statement: `User says their name is ${name}.`,
        source_id: 'direct_user',
        source_kind: 'user_input',
        access_model: 'core_readable_memory_drawer',
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only',
        confidence: 0.82,
        created_at: now(),
        updated_at: now()
      }].concat(asArray(state.beliefMemoryCore.memory_items)), row => row.memory_id).slice(0, 120);
    }
    return name;
  }

  function findUserName(state) {
    const model = state && state.communicationCore && state.communicationCore.user_identity_model;
    if (model && model.preferred_name) return model.preferred_name;
    const candidates = [];
    asArray(state && state.beliefMemoryCore && state.beliefMemoryCore.memory_items).forEach(row => candidates.push(text(row.statement || row.raw_text || '')));
    asArray(state && state.languageMathCore && state.languageMathCore.back_of_head_context).forEach(row => candidates.push(text(row.statement || row.raw_text || '')));
    asArray(state && state.runtimeEvents).forEach(row => candidates.push(eventText(row)));
    for (let i = candidates.length - 1; i >= 0; i--) {
      const m = candidates[i].match(/\bmy name is\s+([A-Za-z][A-Za-z\-']{1,40})\b/i) || candidates[i].match(/\bUser says their name is\s+([A-Za-z][A-Za-z\-']{1,40})\b/i) || candidates[i].match(/\bcall me\s+([A-Za-z][A-Za-z\-']{1,40})\b/i);
      if (m) return m[1];
    }
    return null;
  }

  function normalizeUsaObject(object) {
    const s = lower(object);
    return s === 'usa' || s === 'us' || s === 'america' || s === 'united_states' || s === 'united_states_of_america';
  }

  function find47thPresidentCandidate(state) {
    const rows = asArray(state && state.languageMathCore && state.languageMathCore.factual_claim_candidates);
    return rows.find(f => f && f.relation === 'is_47th_president_of' && normalizeUsaObject(f.object) && !/^(who|what|do_you|do_you_know_who|does|did|can|could|would|should)/.test(text(f.subject)));
  }

  function cleanInterrogativeFactDrift(state, raw, q) {
    const lm = state && state.languageMathCore;
    if (!lm || !q.is_question) return;
    const isCurrent = row => lower(row && row.raw_text) === lower(raw);
    const badSubject = row => /^(who|what|which|do_you|do_you_know_who|does|did|can|could|would|should)/.test(text(row && row.subject));
    const driftedFacts = asArray(lm.factual_claim_candidates).filter(row => isCurrent(row) && badSubject(row));
    if (!driftedFacts.length) return;
    lm.factual_claim_candidates = asArray(lm.factual_claim_candidates).filter(row => !(isCurrent(row) && badSubject(row)));
    lm.entity_relation_candidates = asArray(lm.entity_relation_candidates).filter(row => !driftedFacts.some(f => row && row.source_fact_id === f.fact_id));
    lm.truth_relevance_pressure = asArray(lm.truth_relevance_pressure).filter(row => !driftedFacts.some(f => row && row.target_fact_id === f.fact_id));
    lm.interrogative_fact_drift_log = uniqueRows([{
      drift_id: rowId('drift', [raw]),
      at: now(),
      raw_text: raw,
      removed_fact_ids: driftedFacts.map(f => f.fact_id),
      reason: 'latest input is an answer request, not a factual claim; removed interrogative-as-subject drift',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(lm.interrogative_fact_drift_log)), row => row.drift_id).slice(0, 100);
  }

  function buildAnswer(state, raw, q) {
    const name = findUserName(state);
    const fact = find47thPresidentCandidate(state);
    let message = null;
    let answerKind = q.question_kind;
    let priority = 0.93;

    if (q.question_kind === 'user_name_question') {
      message = name ? `You told me your name is ${name}. I can use that as user-supplied identity context, not final truth.` : 'I do not know your name yet from my current live memory. Tell me “my name is …” and I can keep it as user-supplied context.';
    } else if (q.question_kind === 'user_identity_question') {
      message = name ? `I know you as ${name} from user-supplied context. I do not yet have a fully verified role model for you beyond direct user/source unless you teach me one.` : 'I do not know who you are yet beyond being the current user/source speaking to me.';
    } else if (q.question_kind === 'kernel_identity_question') {
      message = 'I am the 42ndMind epistemic kernel live state: a shared-state reasoning organism oriented around objective maturity, provisional belief, memory, language-math, curiosity, and truth pressure.';
    } else if (q.question_kind === 'kernel_name_question') {
      message = 'My working identity is 42ndMind / epistemic kernel. That is a live-state identity label, not a human name.';
    } else if (q.question_kind === 'final_truth_question') {
      message = 'Final truth is not active yet. In this kernel, final truth means a future strict truth-ledger promotion after evidence, contradiction, source, scope, and causal requirements are satisfied. Current outputs remain not_final.';
    } else if (q.question_kind === 'learning_appetite_question') {
      message = name ? `I want to know what role I should treat you as, ${name}: teacher, tester, creator/operator, or ordinary speaker. That would improve how I weigh future facts, meanings, and worldview fragments.` : 'I want to know who you are to me first: what should I call you, and are you teaching me facts, meanings, or your worldview?';
      priority = 0.94;
    } else if (q.question_kind === 'communication_prompt') {
      message = 'Yes. I can project one thought from my live state. Right now, I am trying to separate conversation, factual claims, user memory, and learning questions without treating any of them as final truth.';
    } else if (q.question_kind === 'external_fact_answer_request') {
      if (fact) {
        message = `I have a user-supplied factual candidate: ${fact.subject} -> ${fact.relation} -> ${fact.object}. I can answer from that as provisional context, but I have not verified it as objective truth.`;
      } else {
        message = 'I do not have a verified answer in my live state. If you supply a candidate, I can hold it provisionally and mark it for verification later.';
      }
      priority = 0.95;
    } else if (q.question_kind === 'general_direct_question') {
      message = 'I recognize that as a direct question, but I do not yet have a clean answer path for it. I should answer unknown rather than file it as generic context.';
      priority = 0.88;
    }

    if (!message) return null;
    return {
      answer_id: rowId('answer', [raw, answerKind, message]),
      answer_kind: answerKind,
      raw_text: raw,
      message,
      source_basis: {
        user_name_known: !!name,
        user_name: name || null,
        factual_candidate_used: fact ? fact.fact_id : null,
        factual_relation: fact ? fact.relation_formula : null
      },
      priority,
      status: 'answer_projected_from_live_state',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function makeThought(answer) {
    return {
      thought_id: rowId('answerthought', [answer.answer_id]),
      thought_kind: 'direct_answer_projection',
      message: answer.message,
      source_pressure: 'direct_question_answer_projection',
      priority: answer.priority,
      expects_user_reply: false,
      answer_id: answer.answer_id,
      answer_kind: answer.answer_kind,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function shouldProjectOver(current, thought) {
    if (!current) return true;
    if (current.thought_kind === 'semantic_conflict_question' && current.priority >= thought.priority) return false;
    return thought.priority >= Number(current.priority || 0) || current.thought_kind === 'heard_context_no_major_formalization' || current.thought_kind === 'formula_parse_statement';
  }

  function projectAnswer(state, reason) {
    const comm = ensure(state);
    if (!comm) return null;
    const event = latestEvent(state);
    const raw = eventText(event);
    if (!raw) return comm;
    ingestUserNameIfPresent(state, raw);
    const q = classifyQuestion(raw);
    cleanInterrogativeFactDrift(state, raw, q);
    if (!q.is_question) return comm;
    const answer = buildAnswer(state, raw, q);
    if (!answer) return comm;
    const thought = makeThought(answer);
    comm.question_answer_candidates = uniqueRows([answer].concat(asArray(comm.question_answer_candidates)), row => row.answer_id).slice(0, 100);
    comm.attention_candidates = uniqueRows([{
      candidate_id: rowId('answercand', [thought.thought_id]),
      candidate_kind: thought.thought_kind,
      message: thought.message,
      priority: thought.priority,
      source_pressure: thought.source_pressure,
      answer_id: answer.answer_id,
      answer_kind: answer.answer_kind,
      status: 'attention_candidate_from_answer_projection',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(comm.attention_candidates)), row => row.candidate_id).slice(0, 100);
    if (shouldProjectOver(comm.current_message, thought)) {
      comm.current_message = thought;
      comm.selected_pressure = comm.attention_candidates[0];
      comm.message_history = uniqueRows([thought].concat(asArray(comm.message_history)), row => row.thought_id).slice(0, 100);
    }
    comm.answer_projection_log = uniqueRows([{
      log_id: rowId('answerlog', [raw, reason || 'answer_projection']),
      at: now(),
      reason: reason || 'answer_projection_refresh',
      raw_text: raw,
      question_kind: q.question_kind,
      answer_kind: answer.answer_kind,
      projected_message_kind: state.communicationCore && state.communicationCore.current_message && state.communicationCore.current_message.thought_kind || null,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(asArray(comm.answer_projection_log)), row => row.log_id).slice(0, 100);
    state.communicationCore = comm;

    const lm = state.languageMathCore;
    if (lm) {
      lm.live_thought = state.communicationCore.current_message || thought;
      lm.answer_projection_log = uniqueRows([{
        log_id: rowId('lmanswerlog', [raw, reason || 'answer_projection']),
        at: now(),
        raw_text: raw,
        question_kind: q.question_kind,
        answer_kind: answer.answer_kind,
        current_message_kind: state.communicationCore.current_message && state.communicationCore.current_message.thought_kind || null,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      }].concat(asArray(lm.answer_projection_log)), row => row.log_id).slice(0, 100);
    }
    return comm;
  }

  function patchBaseRefresh() {
    const Base = global.EpistemicKernelLanguageMathCoreV01;
    if (!Base || Base.__answerProjectionPatchApplied) return;
    const wrapper = Object.assign({}, Base);
    const oldRefresh = Base.refreshLanguageMathCore;
    if (typeof oldRefresh === 'function') {
      wrapper.refreshLanguageMathCore = function answerProjectionRefresh(state, reason) {
        const result = oldRefresh.call(Base, state, reason || 'answer_projection_base_refresh');
        projectAnswer(state, reason || 'answer_projection_after_base_refresh');
        return state && state.languageMathCore || result;
      };
    }
    wrapper.projectAnswer = projectAnswer;
    wrapper.classifyQuestionForAnswerProjection = classifyQuestion;
    wrapper.VERSION = `${Base.VERSION || '0.1.1'}+answer-${VERSION}`;
    wrapper.__answerProjectionPatchApplied = true;
    global.EpistemicKernelLanguageMathCoreV01 = Object.freeze(wrapper);
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__answerProjectionPatchApplied) return;
    const oldIngest = Kernel.prototype.ingest;
    const oldTick = Kernel.prototype.unifiedTick;
    const oldSnapshot = Kernel.prototype.snapshot;
    const oldRefresh = Kernel.prototype.refreshLanguageMathCore;
    if (oldIngest) Kernel.prototype.ingest = function answerKernelIngest(input, meta) { const result = oldIngest.call(this, input, meta || {}); projectAnswer(stateFromKernel(this), 'kernel_ingest_answer_projection'); return result; };
    if (oldTick) Kernel.prototype.unifiedTick = function answerKernelTick(reason) { const result = oldTick.call(this, reason); projectAnswer(stateFromKernel(this), reason || 'kernel_tick_answer_projection'); return result; };
    if (oldSnapshot) Kernel.prototype.snapshot = function answerKernelSnapshot() { projectAnswer(stateFromKernel(this), 'kernel_snapshot_answer_projection'); return oldSnapshot.call(this); };
    Kernel.prototype.refreshLanguageMathCore = function answerKernelRefresh(reason) { if (oldRefresh) oldRefresh.call(this, reason || 'kernel_refresh_answer_projection'); return projectAnswer(stateFromKernel(this), reason || 'kernel_manual_answer_projection'); };
    Kernel.__answerProjectionPatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__answerProjectionWrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    const oldRefresh = brain.refreshLanguageMathCore;
    if (oldIngest) brain.ingest = function answerBrainIngest(input, meta) { const result = oldIngest.call(brain, input, meta || {}); projectAnswer(brain.state, 'brain_ingest_answer_projection'); return result; };
    if (oldTick) brain.tick = function answerBrainTick(reason) { const result = oldTick.call(brain, reason); projectAnswer(brain.state, reason || 'brain_tick_answer_projection'); return result; };
    if (oldSnapshot) brain.snapshot = function answerBrainSnapshot() { projectAnswer(brain.state, 'brain_snapshot_answer_projection'); return oldSnapshot.call(brain); };
    brain.refreshLanguageMathCore = function answerBrainRefresh(reason) { if (oldRefresh) oldRefresh.call(brain, reason || 'brain_refresh_answer_projection'); return projectAnswer(brain.state, reason || 'brain_manual_answer_projection'); };
    brain.__answerProjectionWrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__answerProjectionPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function answerCreateState(seed) { const state = Original.createState(seed || {}); ensure(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function answerCreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function answerStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); projectAnswer(state, 'static_ingest_answer_projection'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function answerStaticTick(state, reason) { const result = Original.tick(state, reason); projectAnswer(state, reason || 'static_tick_answer_projection'); return result; };
    wrapper.__answerProjectionPatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__answerProjectionPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function answerBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensure(binding.shared_state);
      projectAnswer(binding.shared_state, 'bridge_bind_answer_projection');
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__answerProjectionPatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchBaseRefresh();
  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelAnswerProjectionV01 = Object.freeze({
    VERSION,
    doctrine,
    ensure,
    classifyQuestion,
    buildAnswer,
    projectAnswer,
    cleanInterrogativeFactDrift,
    patchBaseRefresh,
    patchKernel,
    patchBrainStatic,
    patchBridge,
    wrapBrain
  });
})(typeof window !== 'undefined' ? window : globalThis);
