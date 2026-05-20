/* 42ndMind Epistemic Kernel Active Curiosity v0.1
 *
 * Core boot patch. Installs active curiosity and referent tracking inside the
 * owned/shared brain state. This is not a connector and not a UI-only feature.
 *
 * Purpose: after raw input, the kernel should show what it is currently curious
 * about and what phrase/span it is referring to, so the user can answer targeted
 * questions without manually structuring everything first.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'curiosity'; }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function unique(values) { return Array.from(new Set(asArray(values).map(text).filter(Boolean))); }

  function curiosityDoctrine() {
    return {
      active_curiosity_lives_inside_owned_state: true,
      curiosity_comes_from_active_logic_not_ui: true,
      curiosity_targets_spans_and_referents: true,
      user_answers_are_context_not_automatic_truth: true,
      short_answers_can_bind_referents_when_current_question_requests_it: true,
      clarification_is_maturity_preserving: true,
      no_truth_promotion_from_answer: true,
      no_belief_movement_from_answer: true,
      no_silent_canonical_mutation: true,
      belief_movement: 'none'
    };
  }

  function createCuriosityCore(seed) {
    return Object.assign({
      packet_type: '42ndMind_active_curiosity_core_v0_1',
      packet_version: VERSION,
      created_at: now(),
      updated_at: now(),
      doctrine: curiosityDoctrine(),
      active: false,
      latest_event_id: null,
      focus_span: null,
      focus_reason: null,
      current_question: null,
      current_question_id: null,
      active_questions: [],
      referent_candidates: [],
      answer_log: [],
      bound_referents: [],
      unresolved_referents: [],
      curiosity_state: 'idle',
      renderer_hint: 'Show the current question, the exact span it refers to, and the answer box.',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    }, seed || {});
  }

  function ensureCuriosityCore(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.curiosityCore || typeof state.curiosityCore !== 'object') state.curiosityCore = createCuriosityCore();
    const core = state.curiosityCore;
    const fresh = createCuriosityCore();
    Object.keys(fresh).forEach(key => { if (core[key] === undefined) core[key] = clone(fresh[key]); });
    core.packet_version = VERSION;
    core.doctrine = Object.assign({}, curiosityDoctrine(), core.doctrine || {}, curiosityDoctrine());
    core.active_questions = asArray(core.active_questions);
    core.referent_candidates = asArray(core.referent_candidates);
    core.answer_log = asArray(core.answer_log);
    core.bound_referents = asArray(core.bound_referents);
    core.unresolved_referents = asArray(core.unresolved_referents);
    core.truth_status = 'not_adjudicated';
    core.promotion_status = 'not_promoted';
    core.belief_movement = 'none';
    core.updated_at = now();
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      active_curiosity_lives_inside_owned_state: true,
      curiosity_comes_from_active_logic_not_ui: true,
      modules_are_views_not_thought_sources: true,
      belief_movement: 'none'
    });
    return core;
  }

  function latestEvent(state) {
    const events = asArray(state && state.runtimeEvents);
    return events.length ? events[events.length - 1] : null;
  }

  function splitSpans(raw) {
    const s = text(raw);
    if (!s) return [];
    const parts = s.split(/(?<=[.!?])\s+|\n+|;+/).map(x => x.trim()).filter(Boolean);
    const clauses = [];
    parts.forEach(part => {
      const inner = part.split(/\s+but\s+|\s+because\s+|\s+however\s+|\s+although\s+/i).map(x => x.trim()).filter(Boolean);
      inner.forEach(x => clauses.push(x));
    });
    return clauses.length ? clauses.slice(0, 12) : [s];
  }

  function classifySpan(span, event) {
    const raw = lower(span);
    const types = [];
    if (/\bshould\b|\bmust\b|\bought\b|\bneed to\b|\bshould not\b/.test(raw)) types.push('normative_principle_candidate');
    if (/\b(i believe|i think|my principle|my boundary|i refuse|i will not|i value|for me)\b/.test(raw)) types.push('self_report_candidate');
    if (/\b(joke|jokes|humor|sarcasm|satire|race jokes|racist jokes)\b/.test(raw)) types.push('humor_boundary_candidate');
    if (/\b(not the same as|should not be mistaken|different from|distinguish|distinction)\b/.test(raw)) types.push('distinction_candidate');
    if (/\b(all|everyone|never|always|only)\b/.test(raw)) types.push('scope_quantifier_candidate');
    if (/"|\bquote\b|\bsaid\b|\bsays\b/.test(raw)) types.push('quote_or_reported_claim_candidate');
    if (/\b(me|my|i)\b/.test(raw)) types.push('speaker_self_reference_candidate');
    if (event && event.signals && event.signals.reframe) types.push('reframe_context_candidate');
    return unique(types.length ? types : ['raw_meaning_candidate']);
  }

  function questionForCandidate(candidate, event) {
    const types = candidate.candidate_types;
    if (types.includes('speaker_self_reference_candidate') || types.includes('self_report_candidate')) {
      return {
        question_family: 'speaker_identity',
        question_text: `Who is saying or owning this statement: “${candidate.span}”?`,
        expected_answer_shape: 'speaker_identity',
        examples: ['me', 'someone else', 'quoted person', 'unknown speaker']
      };
    }
    if (types.includes('humor_boundary_candidate') || types.includes('distinction_candidate')) {
      return {
        question_family: 'meaning_distinction',
        question_text: `What distinction is this trying to make: “${candidate.span}”?`,
        expected_answer_shape: 'meaning_distinction_or_boundary',
        examples: ['my principle', 'humor vs hostility', 'policy boundary', 'quoted claim']
      };
    }
    if (types.includes('normative_principle_candidate')) {
      return {
        question_family: 'principle_or_boundary',
        question_text: `Is this your principle, a boundary, a quoted claim, or a claim you want tested: “${candidate.span}”?`,
        expected_answer_shape: 'principle_boundary_or_claim_role',
        examples: ['my principle', 'my boundary', 'quoted claim', 'test this claim']
      };
    }
    if (types.includes('quote_or_reported_claim_candidate')) {
      return {
        question_family: 'quote_source',
        question_text: `Is this quoted/reported from someone else, or is it your own statement: “${candidate.span}”?`,
        expected_answer_shape: 'source_or_ownership',
        examples: ['me', 'quoted person', 'article', 'unknown']
      };
    }
    if (event && event.signals && event.signals.reframe) {
      return {
        question_family: 'reframe_target',
        question_text: `What is the original claim and what is the hostile reframe here?`,
        expected_answer_shape: 'original_vs_reframe',
        examples: ['original: ..., reframe: ...']
      };
    }
    return {
      question_family: 'referent_role',
      question_text: `What is this text supposed to be: “${candidate.span}”?`,
      expected_answer_shape: 'role_label',
      examples: ['my belief', 'my principle', 'someone else said this', 'a joke', 'a rule I reject']
    };
  }

  function scoreCandidate(candidate, event) {
    let score = 0.25;
    const types = candidate.candidate_types;
    if (types.includes('self_report_candidate')) score += 0.25;
    if (types.includes('normative_principle_candidate')) score += 0.22;
    if (types.includes('humor_boundary_candidate')) score += 0.20;
    if (types.includes('distinction_candidate')) score += 0.18;
    if (types.includes('speaker_self_reference_candidate')) score += 0.15;
    if (types.includes('quote_or_reported_claim_candidate')) score += 0.12;
    if (event && event.signals && (event.signals.reframe || event.signals.contradiction || event.signals.belief_pressure)) score += 0.08;
    return Math.min(1, Number(score.toFixed(3)));
  }

  function deriveCuriosity(state, reason) {
    const core = ensureCuriosityCore(state);
    const event = latestEvent(state);
    if (!event || !text(event.raw_text)) {
      core.active = false;
      core.current_question = null;
      core.current_question_id = null;
      core.focus_span = null;
      core.focus_reason = 'no_latest_event';
      core.curiosity_state = 'idle';
      core.updated_at = now();
      return core;
    }

    const spans = splitSpans(event.raw_text);
    const candidates = spans.map((span, index) => {
      const candidate = {
        candidate_id: `curio_${safeId(event.id)}_${String(index + 1).padStart(2, '0')}_${tinyHash(span).slice(0, 6)}`,
        event_id: event.id,
        span,
        span_index: index,
        candidate_types: classifySpan(span, event),
        status: 'referent_candidate_not_truth',
        truth_status: 'not_adjudicated',
        promotion_status: 'not_promoted',
        belief_movement: 'none'
      };
      candidate.curiosity_priority = scoreCandidate(candidate, event);
      return candidate;
    }).sort((a, b) => b.curiosity_priority - a.curiosity_priority);

    const top = candidates[0] || null;
    const question = top ? questionForCandidate(top, event) : null;
    const questionId = top && question ? `q_${top.candidate_id}_${safeId(question.question_family)}` : null;
    const qRow = top && question ? {
      question_id: questionId,
      event_id: event.id,
      target_candidate_id: top.candidate_id,
      target_span: top.span,
      question_family: question.question_family,
      question_text: question.question_text,
      expected_answer_shape: question.expected_answer_shape,
      examples: question.examples,
      status: 'active_curiosity_question',
      asked_at: now(),
      answered: false,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    } : null;

    core.active = !!qRow;
    core.latest_event_id = event.id;
    core.focus_span = top ? top.span : null;
    core.focus_reason = top ? top.candidate_types.join('|') : 'no_candidate';
    core.referent_candidates = candidates;
    core.current_question = qRow ? qRow.question_text : null;
    core.current_question_id = qRow ? qRow.question_id : null;
    if (qRow && !core.active_questions.some(q => q.question_id === qRow.question_id)) core.active_questions.unshift(qRow);
    core.active_questions = core.active_questions.slice(0, 20);
    core.unresolved_referents = candidates.filter(c => c.curiosity_priority >= 0.45).map(c => ({ candidate_id: c.candidate_id, span: c.span, candidate_types: c.candidate_types, curiosity_priority: c.curiosity_priority }));
    core.curiosity_state = qRow ? 'asking_targeted_question' : 'idle';
    core.last_refresh_reason = reason || 'derive_curiosity';
    core.updated_at = now();
    return core;
  }

  function normalizeAnswer(answer, question) {
    const raw = text(answer);
    const low = lower(raw);
    const normalized = {
      raw_answer: raw,
      answer_kind: 'freeform_context',
      bound_value: raw,
      confidence: 0.5
    };
    if (/^(me|mine|myself|i said it|i did)$/i.test(raw)) {
      normalized.answer_kind = 'direct_user_speaker';
      normalized.bound_value = 'user_directly_owns_statement';
      normalized.confidence = 0.9;
    } else if (/\b(my principle|principle|i believe|belief)\b/i.test(raw)) {
      normalized.answer_kind = 'personal_principle';
      normalized.bound_value = 'user_principle_or_belief';
      normalized.confidence = 0.8;
    } else if (/\b(my boundary|boundary|i refuse|will not)\b/i.test(raw)) {
      normalized.answer_kind = 'personal_boundary';
      normalized.bound_value = 'user_boundary';
      normalized.confidence = 0.8;
    } else if (/\b(quote|quoted|someone else|not me|article|they said)\b/i.test(raw)) {
      normalized.answer_kind = 'external_or_quoted_claim';
      normalized.bound_value = 'not_direct_user_claim_without_more_context';
      normalized.confidence = 0.75;
    } else if (/\b(joke|humor|sarcasm|satire)\b/i.test(raw)) {
      normalized.answer_kind = 'humor_context';
      normalized.bound_value = 'humor_or_joke_context';
      normalized.confidence = 0.7;
    }
    normalized.question_family = question && question.question_family || 'unknown';
    return normalized;
  }

  function answerCuriosity(state, answer, meta) {
    const core = ensureCuriosityCore(state);
    if (!core.current_question_id) deriveCuriosity(state, 'answer_without_current_question_refresh');
    const question = core.active_questions.find(q => q.question_id === core.current_question_id) || core.active_questions[0] || null;
    const normalized = normalizeAnswer(answer, question);
    const row = {
      answer_id: `ans_${tinyHash((question && question.question_id || 'noq') + '|' + text(answer)).slice(0, 8)}`,
      answered_at: now(),
      question_id: question && question.question_id || null,
      target_span: question && question.target_span || core.focus_span || null,
      raw_answer: text(answer),
      normalized_answer: normalized,
      meta_snapshot: clone(meta || {}),
      status: 'context_answer_candidate_not_truth',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
    core.answer_log.unshift(row);
    core.answer_log = core.answer_log.slice(0, 50);
    if (question) {
      question.answered = true;
      question.answer_id = row.answer_id;
      question.status = 'answered_context_candidate';
    }
    core.bound_referents.unshift({
      binding_id: `bind_${row.answer_id}`,
      question_id: row.question_id,
      target_span: row.target_span,
      answer_kind: normalized.answer_kind,
      bound_value: normalized.bound_value,
      confidence: normalized.confidence,
      status: 'referent_binding_candidate_not_truth',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none',
      created_at: now()
    });
    core.bound_referents = core.bound_referents.slice(0, 50);
    core.current_question = null;
    core.current_question_id = null;
    core.active = false;
    core.curiosity_state = 'answer_received_context_candidate';
    core.updated_at = now();
    return row;
  }

  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }

  function installEpistemicKernelPatch() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__activeCuriosityPatchApplied) return;
    const originalIngest = Kernel.prototype.ingest;
    const originalUnifiedTick = Kernel.prototype.unifiedTick;
    const originalSnapshot = Kernel.prototype.snapshot;

    if (originalIngest) Kernel.prototype.ingest = function curiosityIngest(input, meta) { const result = originalIngest.call(this, input, meta || {}); deriveCuriosity(stateFromKernel(this), 'kernel_ingest'); return result; };
    if (originalUnifiedTick) Kernel.prototype.unifiedTick = function curiosityTick(reason) { const result = originalUnifiedTick.call(this, reason); deriveCuriosity(stateFromKernel(this), reason || 'kernel_tick'); return result; };
    if (originalSnapshot) Kernel.prototype.snapshot = function curiositySnapshot() { deriveCuriosity(stateFromKernel(this), 'kernel_snapshot'); return originalSnapshot.call(this); };
    Kernel.prototype.refreshActiveCuriosity = function refreshActiveCuriosity(reason) { return deriveCuriosity(stateFromKernel(this), reason || 'manual_refresh'); };
    Kernel.prototype.answerActiveCuriosity = function answerActiveCuriosity(answer, meta) { return answerCuriosity(stateFromKernel(this), answer, meta || { source: 'EpistemicKernel.answerActiveCuriosity' }); };
    Kernel.__activeCuriosityPatchApplied = true;
  }

  function wrapBrainInstance(brain) {
    if (!brain || brain.__activeCuriosityWrapped) return brain;
    const bIngest = brain.ingest;
    const bTick = brain.tick;
    const bSnapshot = brain.snapshot;
    const bProcess = brain.process;
    if (bIngest) brain.ingest = function curiosityBrainIngest(input, meta) { const result = bIngest.call(brain, input, meta || {}); deriveCuriosity(brain.state, 'brain_ingest'); return result; };
    if (bTick) brain.tick = function curiosityBrainTick(reason) { const result = bTick.call(brain, reason); deriveCuriosity(brain.state, reason || 'brain_tick'); return result; };
    if (bSnapshot) brain.snapshot = function curiosityBrainSnapshot() { deriveCuriosity(brain.state, 'brain_snapshot'); return bSnapshot.call(brain); };
    if (bProcess) brain.process = function curiosityBrainProcess(input, options) { const result = bProcess.call(brain, input, options || {}); deriveCuriosity(brain.state, 'brain_process'); return result; };
    brain.refreshActiveCuriosity = function refreshActiveCuriosity(reason) { return deriveCuriosity(brain.state, reason || 'brain_manual_refresh'); };
    brain.answerActiveCuriosity = function answerActiveCuriosity(answer, meta) { return answerCuriosity(brain.state, answer, meta || { source: 'KernelBrain.answerActiveCuriosity' }); };
    brain.__activeCuriosityWrapped = true;
    return brain;
  }

  function installKernelBrainPatch() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__activeCuriosityPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function curiosityCreateState(seed) { const state = Original.createState(seed || {}); ensureCuriosityCore(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function curiosityCreateBrain(seed) { return wrapBrainInstance(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function curiosityStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); deriveCuriosity(state, 'brain_static_ingest'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function curiosityStaticTick(state, reason) { const result = Original.tick(state, reason); deriveCuriosity(state, reason || 'brain_static_tick'); return result; };
    if (typeof Original.process === 'function') wrapper.process = function curiosityStaticProcess(input, options) { const result = Original.process(input, options || {}); if (options && options.brain && options.brain.state) deriveCuriosity(options.brain.state, 'brain_static_process_bound'); return result; };
    wrapper.__activeCuriosityPatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function installBridgePatch() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__activeCuriosityPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function curiosityBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensureCuriosityCore(binding.shared_state);
      deriveCuriosity(binding.shared_state, 'bridge_bind');
      if (binding.bound_brain) wrapBrainInstance(binding.bound_brain);
      return binding;
    };
    wrapper.__activeCuriosityPatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  installEpistemicKernelPatch();
  installKernelBrainPatch();
  installBridgePatch();

  global.EpistemicKernelActiveCuriosityV01 = Object.freeze({
    VERSION,
    curiosityDoctrine,
    createCuriosityCore,
    ensureCuriosityCore,
    deriveCuriosity,
    answerCuriosity,
    normalizeAnswer,
    classifySpan,
    questionForCandidate,
    installEpistemicKernelPatch,
    installKernelBrainPatch,
    installBridgePatch
  });
})(typeof window !== 'undefined' ? window : globalThis);
