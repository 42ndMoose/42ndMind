/* 42ndMind Epistemic Kernel Learning Drive v0.1
 *
 * Core boot patch. Installs a truth-seeking / learning drive inside owned
 * shared brain state. This is not a UI prompt queue and not truth promotion.
 *
 * Purpose: the kernel should not ask questions merely because a prompt exists.
 * It should generate learning goals from maturity, unresolved meaning,
 * referent bindings, principles, scope, causal bridges, exceptions, and truth
 * pressure. User answers teach context and meaning, but do not become truth.
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
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'learning'; }
  function unique(values) { return Array.from(new Set(asArray(values).map(text).filter(Boolean))); }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }

  function learningDoctrine() {
    return {
      learning_drive_lives_inside_owned_state: true,
      curiosity_comes_from_truth_seeking_not_prompt_trigger_only: true,
      questions_are_epistemic_actions_not_ui_prompts: true,
      user_answers_teach_context_not_truth: true,
      resolved_referents_feed_learning_goals: true,
      principle_text_requires_scope_exception_and_revision_conditions: true,
      causal_claims_require_bridge_before_belief: true,
      belief_satisfaction_is_not_truth_promotion: true,
      kernel_may_hold_working_belief_candidates: true,
      working_belief_candidates_are_not_final_truth: true,
      objective_maturity_remains_identity_center: true,
      no_truth_promotion_from_user_assertion: true,
      no_belief_movement_without_future_ledger: true,
      no_silent_canonical_mutation: true,
      belief_movement: 'none'
    };
  }

  function createLearningDrive(seed) {
    return Object.assign({
      packet_type: '42ndMind_epistemic_learning_drive_v0_1',
      packet_version: VERSION,
      created_at: now(),
      updated_at: now(),
      doctrine: learningDoctrine(),
      active: true,
      learning_orientation: 'truth_seeking_under_objective_maturity',
      current_learning_goal: null,
      current_learning_goal_id: null,
      learning_goals: [],
      learning_questions: [],
      learned_context: [],
      working_belief_candidates: [],
      truth_chase_state: 'idle_waiting_for_material',
      learning_appetite_score: 0,
      satisfied_items: [],
      unsatisfied_items: [],
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    }, seed || {});
  }

  function ensureLearningDrive(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.learningDrive || typeof state.learningDrive !== 'object') state.learningDrive = createLearningDrive();
    const drive = state.learningDrive;
    const fresh = createLearningDrive();
    Object.keys(fresh).forEach(key => { if (drive[key] === undefined) drive[key] = clone(fresh[key]); });
    drive.packet_version = VERSION;
    drive.doctrine = Object.assign({}, learningDoctrine(), drive.doctrine || {}, learningDoctrine());
    drive.learning_goals = asArray(drive.learning_goals);
    drive.learning_questions = asArray(drive.learning_questions);
    drive.learned_context = asArray(drive.learned_context);
    drive.working_belief_candidates = asArray(drive.working_belief_candidates);
    drive.satisfied_items = asArray(drive.satisfied_items);
    drive.unsatisfied_items = asArray(drive.unsatisfied_items);
    drive.truth_status = 'not_adjudicated';
    drive.promotion_status = 'not_promoted';
    drive.belief_movement = 'none';
    drive.updated_at = now();
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      learning_drive_lives_inside_owned_state: true,
      curiosity_comes_from_truth_seeking_not_prompt_trigger_only: true,
      user_answers_teach_context_not_truth: true,
      belief_movement: 'none'
    });
    return drive;
  }

  function latestEvent(state) {
    const events = asArray(state && state.runtimeEvents);
    return events.length ? events[events.length - 1] : null;
  }

  function hasType(candidate, type) { return asArray(candidate && candidate.candidate_types).includes(type); }

  function normalizedAnswers(state) {
    const core = state && state.curiosityCore || {};
    return asArray(core.answer_log).map(row => ({
      answer_id: row.answer_id,
      question_id: row.question_id,
      target_span: row.target_span,
      raw_answer: row.raw_answer,
      answer_kind: row.normalized_answer && row.normalized_answer.answer_kind || 'freeform_context',
      bound_value: row.normalized_answer && row.normalized_answer.bound_value || row.raw_answer,
      confidence: row.normalized_answer && row.normalized_answer.confidence || 0.5,
      status: row.status,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    }));
  }

  function classifyLearningNeed(candidate, binding) {
    const span = text(candidate && candidate.span || binding && binding.target_span);
    const raw = lower(span + ' ' + text(binding && binding.raw_answer || binding && binding.bound_value));
    const needs = [];
    if (hasType(candidate, 'normative_principle_candidate') || /\bshould\b|\bmust\b|\bbetter than\b|\bwill always\b/.test(raw)) needs.push('principle_scope_test');
    if (hasType(candidate, 'scope_quantifier_candidate') || /\balways\b|\bnever\b|\ball\b|\bany\b|\bexclusively\b/.test(raw)) needs.push('scope_quantifier_test');
    if (/\bbecause\b|\bprevents\b|\bcomes from\b|\bleads to\b|\bcaus/.test(raw)) needs.push('causal_bridge_needed');
    if (/\bboundary\b|\bmistaken\b|\bdistinction\b|\bnot the same\b|\bbetween the two\b/.test(raw)) needs.push('boundary_definition_needed');
    if (/\bmisconception\b|\bstereotyp|pattern recognition|collective conscience|governance|policy\b/.test(raw)) needs.push('concept_definition_needed');
    if (/\bexcept|unless|not always|won't always|depends|context matters\b/.test(raw)) needs.push('exception_conditions_needed');
    if (binding && /principle|boundary|philosophy|rant|direct_user_speaker|user_principle|user_boundary/.test(binding.answer_kind || binding.bound_value || '')) needs.push('user_worldview_fragment_candidate');
    return unique(needs.length ? needs : ['meaning_role_needed']);
  }

  function goalQuestion(goal) {
    const span = goal.target_span;
    if (goal.learning_need === 'principle_scope_test') return `What is the intended scope of this principle: “${span}”?`;
    if (goal.learning_need === 'scope_quantifier_test') return `Which words here are universal, conditional, or context-dependent: “${span}”?`;
    if (goal.learning_need === 'causal_bridge_needed') return `What mechanism or bridge would make this causal claim work: “${span}”?`;
    if (goal.learning_need === 'boundary_definition_needed') return `Where is the boundary in this distinction, and what examples sit on each side: “${span}”?`;
    if (goal.learning_need === 'concept_definition_needed') return `What does this concept mean here, and what would count as a mistaken use: “${span}”?`;
    if (goal.learning_need === 'exception_conditions_needed') return `What are the exceptions or limiting conditions for this statement: “${span}”?`;
    if (goal.learning_need === 'user_worldview_fragment_candidate') return `Should this be treated as your worldview fragment, a rant/context note, or a principle candidate: “${span}”?`;
    return `What role should this meaning play in the kernel's world model: “${span}”?`;
  }

  function priorityForNeed(need, candidate, binding) {
    let p = 0.35;
    if (need === 'principle_scope_test') p += 0.20;
    if (need === 'causal_bridge_needed') p += 0.22;
    if (need === 'boundary_definition_needed') p += 0.18;
    if (need === 'scope_quantifier_test') p += 0.17;
    if (need === 'exception_conditions_needed') p += 0.16;
    if (need === 'user_worldview_fragment_candidate') p += 0.14;
    if (binding) p += 0.10;
    if (candidate && Number(candidate.curiosity_priority || 0) > 0.6) p += 0.08;
    return Math.min(1, Number(p.toFixed(3)));
  }

  function makeGoal(event, candidate, need, binding) {
    const span = text(candidate && candidate.span || binding && binding.target_span || event && event.raw_text);
    const goalId = `learn_${tinyHash([event && event.id, span, need, binding && binding.answer_id].join('|')).slice(0, 10)}`;
    return {
      goal_id: goalId,
      created_at: now(),
      event_id: event && event.id || null,
      target_span: span,
      learning_need: need,
      source_candidate_id: candidate && candidate.candidate_id || null,
      source_answer_id: binding && binding.answer_id || null,
      source_answer_kind: binding && binding.answer_kind || null,
      priority: priorityForNeed(need, candidate, binding),
      question_text: goalQuestion({ target_span: span, learning_need: need }),
      status: 'active_learning_goal_candidate',
      satisfied: false,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function makeWorkingBeliefCandidate(event, candidate, binding) {
    const span = text(candidate && candidate.span || binding && binding.target_span || '');
    if (!span) return null;
    const answerKind = binding && binding.answer_kind || 'unbound_context';
    const candidateType = binding ? 'user_contextualized_worldview_fragment' : 'unresolved_worldview_fragment_candidate';
    return {
      belief_candidate_id: `wbc_${tinyHash(span + '|' + answerKind).slice(0, 10)}`,
      created_at: now(),
      candidate_type: candidateType,
      target_span: span,
      answer_kind: answerKind,
      user_context_bound: !!binding,
      belief_satisfaction: binding ? 'context_learned_but_not_truth' : 'insufficient_context',
      truth_requirements_remaining: unique(classifyLearningNeed(candidate, binding)),
      may_inform_future_questions: true,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function existingIds(rows, key) { return new Set(asArray(rows).map(r => r && r[key]).filter(Boolean)); }

  function refreshLearningDrive(state, reason) {
    const drive = ensureLearningDrive(state);
    const event = latestEvent(state);
    const curiosity = state && state.curiosityCore || {};
    const candidates = asArray(curiosity.referent_candidates);
    const answers = normalizedAnswers(state);
    const boundBySpan = new Map();
    answers.forEach(a => { if (a.target_span) boundBySpan.set(text(a.target_span), a); });

    const newGoals = [];
    candidates.forEach(candidate => {
      const binding = boundBySpan.get(text(candidate.span)) || null;
      const needs = classifyLearningNeed(candidate, binding);
      needs.forEach(need => newGoals.push(makeGoal(event, candidate, need, binding)));
    });
    answers.forEach(binding => {
      if (!candidates.some(c => text(c.span) === text(binding.target_span))) {
        classifyLearningNeed(null, binding).forEach(need => newGoals.push(makeGoal(event, null, need, binding)));
      }
    });

    const existingGoalIds = existingIds(drive.learning_goals, 'goal_id');
    newGoals.forEach(goal => { if (!existingGoalIds.has(goal.goal_id)) drive.learning_goals.unshift(goal); });
    drive.learning_goals = drive.learning_goals.slice(0, 80).sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));

    const existingQuestionIds = existingIds(drive.learning_questions, 'question_id');
    drive.learning_goals.forEach(goal => {
      const qid = `lq_${goal.goal_id}`;
      if (!existingQuestionIds.has(qid)) {
        drive.learning_questions.unshift({
          question_id: qid,
          goal_id: goal.goal_id,
          target_span: goal.target_span,
          learning_need: goal.learning_need,
          question_text: goal.question_text,
          priority: goal.priority,
          status: goal.satisfied ? 'satisfied_learning_question' : 'open_learning_question_candidate',
          truth_status: 'not_adjudicated',
          promotion_status: 'not_promoted',
          belief_movement: 'none'
        });
      }
    });
    drive.learning_questions = drive.learning_questions.slice(0, 80).sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));

    const contextIds = existingIds(drive.learned_context, 'answer_id');
    answers.forEach(answer => {
      if (!contextIds.has(answer.answer_id)) {
        drive.learned_context.unshift({
          answer_id: answer.answer_id,
          learned_at: now(),
          target_span: answer.target_span,
          answer_kind: answer.answer_kind,
          bound_value: answer.bound_value,
          raw_answer: answer.raw_answer,
          status: 'learned_context_candidate_not_truth',
          truth_status: 'not_adjudicated',
          promotion_status: 'not_promoted',
          belief_movement: 'none'
        });
      }
    });
    drive.learned_context = drive.learned_context.slice(0, 80);

    const existingBeliefIds = existingIds(drive.working_belief_candidates, 'belief_candidate_id');
    const beliefCandidates = [];
    candidates.forEach(candidate => beliefCandidates.push(makeWorkingBeliefCandidate(event, candidate, boundBySpan.get(text(candidate.span)) || null)));
    beliefCandidates.filter(Boolean).forEach(bc => { if (!existingBeliefIds.has(bc.belief_candidate_id)) drive.working_belief_candidates.unshift(bc); });
    drive.working_belief_candidates = drive.working_belief_candidates.slice(0, 80);

    const openGoals = drive.learning_goals.filter(g => !g.satisfied && Number(g.priority || 0) >= 0.55);
    drive.current_learning_goal = openGoals[0] || null;
    drive.current_learning_goal_id = drive.current_learning_goal && drive.current_learning_goal.goal_id || null;
    drive.learning_appetite_score = clamp01(openGoals.reduce((sum, g) => sum + Number(g.priority || 0), 0) / Math.max(1, openGoals.length || 1));
    drive.unsatisfied_items = openGoals.map(g => ({ goal_id: g.goal_id, learning_need: g.learning_need, target_span: g.target_span, question_text: g.question_text, priority: g.priority }));
    drive.satisfied_items = drive.learning_goals.filter(g => g.satisfied).map(g => ({ goal_id: g.goal_id, learning_need: g.learning_need, target_span: g.target_span }));
    drive.truth_chase_state = drive.current_learning_goal ? 'truth_seeking_learning_goals_open' : (drive.learned_context.length ? 'context_learned_no_high_priority_open_goal' : 'idle_waiting_for_material');
    drive.last_refresh_reason = reason || 'refresh_learning_drive';
    drive.updated_at = now();
    return drive;
  }

  function answerLearningQuestion(state, answer, meta) {
    const drive = ensureLearningDrive(state);
    refreshLearningDrive(state, 'before_learning_answer');
    const goal = drive.current_learning_goal;
    const row = {
      answer_id: `learn_ans_${tinyHash((goal && goal.goal_id || 'nog') + '|' + text(answer)).slice(0, 10)}`,
      answered_at: now(),
      goal_id: goal && goal.goal_id || null,
      target_span: goal && goal.target_span || null,
      learning_need: goal && goal.learning_need || null,
      raw_answer: text(answer),
      meta_snapshot: clone(meta || {}),
      status: 'learning_answer_context_candidate_not_truth',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
    drive.learned_context.unshift({
      answer_id: row.answer_id,
      learned_at: row.answered_at,
      target_span: row.target_span,
      answer_kind: 'learning_goal_answer',
      bound_value: row.raw_answer,
      raw_answer: row.raw_answer,
      status: 'learned_context_candidate_not_truth',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    });
    if (goal) {
      goal.satisfied = true;
      goal.status = 'satisfied_by_learning_answer_candidate';
      goal.answer_id = row.answer_id;
      goal.satisfied_at = row.answered_at;
    }
    drive.learning_questions.forEach(q => {
      if (goal && q.goal_id === goal.goal_id) {
        q.status = 'satisfied_learning_question';
        q.answer_id = row.answer_id;
      }
    });
    refreshLearningDrive(state, 'after_learning_answer');
    return row;
  }

  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }

  function installEpistemicKernelPatch() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__learningDrivePatchApplied) return;
    const originalIngest = Kernel.prototype.ingest;
    const originalUnifiedTick = Kernel.prototype.unifiedTick;
    const originalSnapshot = Kernel.prototype.snapshot;
    if (originalIngest) Kernel.prototype.ingest = function learningIngest(input, meta) { const result = originalIngest.call(this, input, meta || {}); refreshLearningDrive(stateFromKernel(this), 'kernel_ingest'); return result; };
    if (originalUnifiedTick) Kernel.prototype.unifiedTick = function learningTick(reason) { const result = originalUnifiedTick.call(this, reason); refreshLearningDrive(stateFromKernel(this), reason || 'kernel_tick'); return result; };
    if (originalSnapshot) Kernel.prototype.snapshot = function learningSnapshot() { refreshLearningDrive(stateFromKernel(this), 'kernel_snapshot'); return originalSnapshot.call(this); };
    const originalAnswerCuriosity = Kernel.prototype.answerActiveCuriosity;
    if (originalAnswerCuriosity) Kernel.prototype.answerActiveCuriosity = function learningWrappedCuriosityAnswer(answer, meta) { const result = originalAnswerCuriosity.call(this, answer, meta || {}); refreshLearningDrive(stateFromKernel(this), 'curiosity_answer'); return result; };
    Kernel.prototype.refreshLearningDrive = function refreshLearningDriveMethod(reason) { return refreshLearningDrive(stateFromKernel(this), reason || 'manual_refresh'); };
    Kernel.prototype.answerLearningQuestion = function answerLearningQuestionMethod(answer, meta) { return answerLearningQuestion(stateFromKernel(this), answer, meta || { source: 'EpistemicKernel.answerLearningQuestion' }); };
    Kernel.__learningDrivePatchApplied = true;
  }

  function wrapBrainInstance(brain) {
    if (!brain || brain.__learningDriveWrapped) return brain;
    const bIngest = brain.ingest;
    const bTick = brain.tick;
    const bSnapshot = brain.snapshot;
    const bAnswerCuriosity = brain.answerActiveCuriosity;
    if (bIngest) brain.ingest = function learningBrainIngest(input, meta) { const result = bIngest.call(brain, input, meta || {}); refreshLearningDrive(brain.state, 'brain_ingest'); return result; };
    if (bTick) brain.tick = function learningBrainTick(reason) { const result = bTick.call(brain, reason); refreshLearningDrive(brain.state, reason || 'brain_tick'); return result; };
    if (bSnapshot) brain.snapshot = function learningBrainSnapshot() { refreshLearningDrive(brain.state, 'brain_snapshot'); return bSnapshot.call(brain); };
    if (bAnswerCuriosity) brain.answerActiveCuriosity = function learningBrainCuriosityAnswer(answer, meta) { const result = bAnswerCuriosity.call(brain, answer, meta || {}); refreshLearningDrive(brain.state, 'brain_curiosity_answer'); return result; };
    brain.refreshLearningDrive = function refreshLearningDriveMethod(reason) { return refreshLearningDrive(brain.state, reason || 'brain_manual_refresh'); };
    brain.answerLearningQuestion = function answerLearningQuestionMethod(answer, meta) { return answerLearningQuestion(brain.state, answer, meta || { source: 'KernelBrain.answerLearningQuestion' }); };
    brain.__learningDriveWrapped = true;
    return brain;
  }

  function installKernelBrainPatch() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__learningDrivePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function learningCreateState(seed) { const state = Original.createState(seed || {}); ensureLearningDrive(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function learningCreateBrain(seed) { return wrapBrainInstance(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function learningStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); refreshLearningDrive(state, 'brain_static_ingest'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function learningStaticTick(state, reason) { const result = Original.tick(state, reason); refreshLearningDrive(state, reason || 'brain_static_tick'); return result; };
    wrapper.__learningDrivePatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function installBridgePatch() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__learningDrivePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function learningBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensureLearningDrive(binding.shared_state);
      refreshLearningDrive(binding.shared_state, 'bridge_bind');
      if (binding.bound_brain) wrapBrainInstance(binding.bound_brain);
      return binding;
    };
    wrapper.__learningDrivePatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  installEpistemicKernelPatch();
  installKernelBrainPatch();
  installBridgePatch();

  global.EpistemicKernelLearningDriveV01 = Object.freeze({
    VERSION,
    learningDoctrine,
    createLearningDrive,
    ensureLearningDrive,
    refreshLearningDrive,
    answerLearningQuestion,
    classifyLearningNeed,
    makeWorkingBeliefCandidate,
    installEpistemicKernelPatch,
    installKernelBrainPatch,
    installBridgePatch
  });
})(typeof window !== 'undefined' ? window : globalThis);
