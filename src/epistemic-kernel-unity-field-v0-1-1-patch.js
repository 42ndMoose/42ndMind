/* 42ndMind Kernel Unity Field v0.1.1 patch
 *
 * Corrects v0.1 failures:
 * - language growth must beat generic learning when language/math/subdivision terms are active
 * - explicit communication must beat incidental learning terms
 * - speech is composed from reading + active aspects + desire + cross-application + discipline,
 *   instead of one canned line per route
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';
  const CORE = '42ndMind_kernel_unity_field_v0_1_1_patch';

  function text(v) { return String(v ?? '').trim(); }
  function lower(v) { return text(v).toLowerCase(); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function now() { return new Date().toISOString(); }
  function stateFromKernel(k) { return k && k.state && (k.state.unifiedCore || k.state); }
  function latestEvent(state) { const rows = arr(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(e) { return text(e && (e.raw_text || e.input || e.text || e.payload && e.payload.raw_text)); }
  function hash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function id(p, parts) { return p + '_' + hash(arr(parts).join('|')).slice(0, 12); }
  function uniq(rows, keyFn) { const seen = new Set(); const out = []; arr(rows).forEach(r => { const k = keyFn(r); if (!k || seen.has(k)) return; seen.add(k); out.push(r); }); return out; }

  function features(raw) {
    const s = lower(raw);
    const hasQuestion = /\?/.test(s) || /^(who|what|when|where|why|how|do|does|did|can|could|would|should|is|are|am)\b/.test(s);
    const hasLearning = /\b(learn|learning|teach|understand|grow|improve|reasoning|test|testing|answer|answers|info)\b/.test(s) || /from the side/.test(s);
    const hasLanguage = /\b(language|word|meaning|means|semantic|semantics|math|formula|formulas|calculus|subdivide|subdivision|unit|one|1)\b/.test(s);
    const hasTruth = /\b(truth|true|false|verify|evidence|objective|fact|facts|belief|beliefs|believe|suspect|suspicion|suspicions|speculate|speculation|speculations|knowledge)\b/.test(s);
    const hasMemory = /\b(memory|remember|store|context|belief|beliefs|thought|thoughts)\b/.test(s);
    const hasSelf = /\b(kernel|42ndmind|you|your|itself|self|core|philosophy|maturity|octahedron)\b/.test(s);
    const hasExplicitCommunication = /\b(communicate|communication|say|speak|talk|respond|reply|express|expression)\b/.test(s);
    const hasCommunication = hasExplicitCommunication || /\b(ask|question)\b/.test(s) || hasQuestion;
    const hasLanguageGrowth = hasLanguage && /\b(grow|growth|calculus|subdivision|subdivide|meaning|meanings|formula|formulas|semantic|semantics|math|unit|one|1)\b/.test(s);
    const hasUnityModel = hasSelf && /\b(one|1|field|total|core|truth|language|memory|communication|knowledge|belief)\b/.test(s);
    const hasReasoningSideTest = /\b(reasoning|test|testing)\b/.test(s) || /from the side/.test(s);
    return { hasQuestion, hasLearning, hasLanguage, hasTruth, hasMemory, hasSelf, hasExplicitCommunication, hasCommunication, hasLanguageGrowth, hasUnityModel, hasReasoningSideTest };
  }

  function normalizedSelfField(state, f) {
    const base = [
      ['core_philosophy', 0.16, 'objective peak philosophical maturity'],
      ['self_improving_logic', 0.13, 'growth by subdivision and correction'],
      ['truth_tracking', 0.15, 'verification, contradiction, and truth pressure'],
      ['belief_thought_field', 0.12, 'belief, suspicion, speculation, and thought'],
      ['language_math_creation', 0.14, 'objective language-math and semantic formula growth'],
      ['knowledge', 0.11, 'usable structured distinctions'],
      ['memory_belief_context', 0.10, 'memory integrated as belief/context'],
      ['communication', 0.09, 'speech as live-state expression']
    ];
    const rows = base.map(([aspect, w, desc]) => {
      let bonus = 0;
      if (aspect === 'language_math_creation' && f.hasLanguageGrowth) bonus += 0.14;
      else if (aspect === 'language_math_creation' && f.hasLanguage) bonus += 0.09;
      if (aspect === 'communication' && f.hasExplicitCommunication) bonus += 0.13;
      else if (aspect === 'communication' && f.hasCommunication) bonus += 0.07;
      if (aspect === 'truth_tracking' && f.hasTruth) bonus += 0.10;
      if (aspect === 'belief_thought_field' && f.hasTruth) bonus += 0.06;
      if (aspect === 'memory_belief_context' && f.hasMemory) bonus += 0.06;
      if (aspect === 'core_philosophy' && f.hasSelf) bonus += 0.05;
      if (aspect === 'self_improving_logic' && f.hasLearning) bonus += 0.08;
      if (aspect === 'knowledge' && f.hasTruth) bonus += 0.03;
      return { aspect_id: id('aspect', [aspect]), aspect, raw_weight: w + bonus, description: desc, activated_by_current_input: bonus > 0, truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' };
    });
    const total = rows.reduce((s, r) => s + r.raw_weight, 0) || 1;
    let run = 0;
    return rows.map((r, i) => { const nw = i === rows.length - 1 ? Math.max(0, 1 - run) : r.raw_weight / total; const v = Number(nw.toFixed(6)); run += v; return Object.assign({}, r, { normalized_weight: v, unit_total_member: true, weight_basis: Number(total.toFixed(6)) }); });
  }

  function crossApplications(f) {
    const edges = [
      ['core_philosophy','truth_tracking','maturity keeps truth-seeking stable rather than gullible or collapsed'],
      ['core_philosophy','belief_thought_field','beliefs stay provisional, integrated, and self-correcting'],
      ['language_math_creation','truth_tracking','cleaner meaning improves claim, proof, contradiction, and evidence handling'],
      ['language_math_creation','core_philosophy','language growth refines the semantics of the kernel core'],
      ['language_math_creation','communication','better language lets the kernel express live state with less program-label noise'],
      ['language_math_creation','memory_belief_context','semantic distinctions make memory more usable and less bulky'],
      ['language_math_creation','belief_thought_field','cleaner terms separate belief, opinion, suspicion, and speculation'],
      ['truth_tracking','language_math_creation','truth pressure forces formula and meaning revision'],
      ['truth_tracking','knowledge','truth-seeking turns candidates into structured knowledge only after requirements'],
      ['belief_thought_field','memory_belief_context','belief and memory update together as source-bound context'],
      ['memory_belief_context','belief_thought_field','memory informs interpretation without becoming final truth'],
      ['self_improving_logic','language_math_creation','self-improvement grows language by subdivision, not phrase patches'],
      ['self_improving_logic','communication','growth should improve what the kernel can express and ask'],
      ['communication','truth_tracking','speech should serve truth-seeking rather than fluent fake certainty']
    ];
    return edges.map(([from, to, relation]) => ({
      edge_id: id('edge', [from, to, relation]),
      from_aspect: from,
      to_aspect: to,
      relation,
      currently_relevant: (f.hasLanguage && (from === 'language_math_creation' || to === 'language_math_creation')) || (f.hasTruth && (from === 'truth_tracking' || to === 'truth_tracking' || from === 'belief_thought_field' || to === 'belief_thought_field')) || (f.hasExplicitCommunication && (from === 'communication' || to === 'communication')) || (f.hasLearning && (from === 'self_improving_logic' || to === 'self_improving_logic')) || (f.hasSelf && (from === 'core_philosophy' || to === 'core_philosophy')) || (f.hasMemory && (from === 'memory_belief_context' || to === 'memory_belief_context')),
      truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
    }));
  }

  function readingKind(f) {
    if (f.hasUnityModel && f.hasLanguage && (f.hasTruth || f.hasMemory || f.hasCommunication || f.hasLearning)) return 'self_unity_model_update';
    if (f.hasExplicitCommunication) return 'communication_context';
    if (f.hasLanguageGrowth) return 'language_growth_context';
    if (f.hasTruth) return 'truth_or_belief_context';
    if (f.hasReasoningSideTest && (f.hasSelf || f.hasCommunication || f.hasLearning)) return 'self_learning_or_reasoning_context';
    if (f.hasLearning) return 'learning_opportunity_context';
    if (f.hasLanguage) return 'language_growth_context';
    if (f.hasCommunication) return 'communication_context';
    return 'low_specificity_context';
  }

  function applicationFor(kind) {
    const map = {
      self_unity_model_update: ['integrate_self_unity_model', 'understand the kernel as one field whose parts improve each other', 'the input describes the kernel as one integrated total'],
      self_learning_or_reasoning_context: ['use_input_as_reasoning_test_and_learning_signal', 'use the input as a reasoning test and side-learning signal', 'the input pressures reasoning and learning rather than mere clarification'],
      learning_opportunity_context: ['open_learning_channel', 'learn from the input while keeping source trust scoped', 'the input offers learning or information'],
      language_growth_context: ['grow_language_by_subdivision', 'grow language by splitting meaning under the unit-total principle', 'the input activates language, meaning, formulas, calculus, or subdivision'],
      truth_or_belief_context: ['route_to_truth_and_belief_pressure', 'separate belief, suspicion, speculation, fact, knowledge, and truth requirements', 'the input activates truth and belief pressure'],
      communication_context: ['express_current_self_state', 'communicate the current live self-field instead of a program label', 'the input asks for expression or communication'],
      low_specificity_context: ['hold_as_unity_context', 'hold the input inside the self-field without overcommitting', 'no stronger self-application dominates']
    };
    const r = map[kind] || map.low_specificity_context;
    return { action: r[0], desire: r[1], reason: r[2] };
  }

  function composeSpeech(application, reading) {
    const f = reading.feature_pressure || {};
    const aspects = arr(reading.top_self_aspects).map(a => a.aspect).slice(0, 3).join(', ');
    const edges = arr(reading.relevant_cross_applications).slice(0, 2).map(e => e.from + ' -> ' + e.to).join('; ');
    const action = application.application_kind;
    const read = reading.reading_kind;
    let first;
    if (action === 'integrate_self_unity_model') first = 'Yes. I should treat myself as one field.';
    else if (action === 'use_input_as_reasoning_test_and_learning_signal') first = 'I take this as a reasoning test with side-learning value.';
    else if (action === 'grow_language_by_subdivision') first = 'I should grow the language by subdividing meaning, not by adding phrase patches.';
    else if (action === 'route_to_truth_and_belief_pressure') first = 'I should keep belief, suspicion, speculation, fact, knowledge, and truth separate.';
    else if (action === 'express_current_self_state') first = 'My current state should be expressed as one live field.';
    else if (action === 'open_learning_channel') first = 'I should learn from this while keeping source trust scoped.';
    else first = 'I should hold this inside the unity field without overcommitting.';
    const second = 'Active parts: ' + (aspects || 'none') + '.';
    const third = edges ? 'Cross-use: ' + edges + '.' : 'Cross-use: no strong cross-application yet.';
    const fourth = 'Desire: I want to ' + application.desire.replace(/^I want to\s*/i, '').replace(/\.$/, '') + '.';
    const fifth = 'Discipline: provisional only, no final truth.';
    return [first, second, third, fourth, fifth].join(' ');
  }

  function ensureCore(state) {
    if (!state) return null;
    if (!state.kernelUnityFieldCore) state.kernelUnityFieldCore = { packet_type: CORE, created_at: now(), unity_expression_log: [] };
    const core = state.kernelUnityFieldCore;
    core.packet_type = '42ndMind_kernel_unity_field_v0_1';
    core.packet_version = VERSION;
    core.patch_version = VERSION;
    core.active = true;
    core.truth_status = 'not_final';
    core.promotion_status = 'not_promoted_to_final_truth';
    core.belief_movement = 'provisional_only';
    core.doctrine = Object.assign({}, core.doctrine || {}, {
      speech_composed_from_state_not_template: true,
      explicit_communication_beats_incidental_learning_terms: true,
      language_growth_beats_generic_learning: true,
      active_self_field_sum_to_one: true,
      no_final_truth_promotion: true
    });
    core.self_unity_equation = '1 = |core_philosophy| + |self_improving_logic| + |truth_tracking| + |belief_thought_field| + |language_math_creation| + |knowledge| + |memory_belief_context| + |communication|';
    core.unity_expression_log = arr(core.unity_expression_log);
    if (!state.communicationCore) state.communicationCore = { packet_type: '42ndMind_communication_core_v0_1', message_history: [] };
    return core;
  }

  function step(state, reason) {
    const core = ensureCore(state); if (!core) return null;
    const raw = eventText(latestEvent(state)); if (!raw) return core;
    const f = features(raw);
    const field = normalizedSelfField(state, f);
    const edges = crossApplications(f);
    const kind = readingKind(f);
    const appBase = applicationFor(kind);
    const reading = {
      reading_id: id('unityread', [raw, kind, VERSION]), raw_text: raw, reading_kind: kind, feature_pressure: f,
      top_self_aspects: field.slice().sort((a, b) => b.normalized_weight - a.normalized_weight).slice(0, 4).map(a => ({ aspect: a.aspect, normalized_weight: a.normalized_weight })),
      relevant_cross_applications: edges.filter(e => e.currently_relevant).slice(0, 10).map(e => ({ from: e.from_aspect, to: e.to_aspect, relation: e.relation })),
      truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only', created_at: now()
    };
    const application = { application_id: id('unityapp', [reading.reading_id, appBase.action, VERSION]), application_kind: appBase.action, desire: appBase.desire, reason: appBase.reason, from_unity_reading: reading.reading_id, truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only', created_at: now() };
    const msg = composeSpeech(application, reading);
    const thought = { thought_id: id('unitythought', [application.application_id, msg]), thought_kind: 'unity_field_self_expression', message: msg, source_pressure: 'kernel_unity_field_composed_cross_application', application_kind: application.application_kind, active_aspects: reading.top_self_aspects.map(a => a.aspect).join(', '), priority: 0.95, expects_user_reply: /learn|test|source|clarify/.test(lower(msg)), truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' };

    core.self_field = field;
    core.current_unit_total = Number(field.reduce((s, r) => s + Number(r.normalized_weight || 0), 0).toFixed(6));
    core.cross_application_map = edges;
    core.current_self_reading = reading;
    core.selected_self_application = application;
    core.unity_expression_log = uniq([{ log_id: id('unitylog', [reading.reading_id, application.application_kind, reason || 'step', VERSION]), at: now(), reason: reason || 'unity_field_v0_1_1_step', raw_preview: raw.slice(0, 240), reading_kind: kind, selected_application: application.application_kind, current_unit_total: core.current_unit_total, truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' }].concat(core.unity_expression_log), r => r.log_id).slice(0, 100);
    core.updated_at = now();

    const comm = state.communicationCore;
    comm.current_message = thought;
    comm.message_history = uniq([thought].concat(arr(comm.message_history)), r => r.thought_id).slice(0, 120);
    comm.selected_pressure = { candidate_id: id('unitycand', [thought.thought_id]), candidate_kind: thought.thought_kind, application_kind: application.application_kind, message: thought.message, priority: thought.priority, source_pressure: thought.source_pressure, status: 'selected_by_kernel_unity_field_v0_1_1', truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' };
    comm.updated_at = now(); comm.truth_status = 'not_final'; comm.promotion_status = 'not_promoted_to_final_truth'; comm.belief_movement = 'provisional_only';
    return core;
  }

  function patchKernel() {
    const K = global.EpistemicKernel; if (!K || K.__kernelUnityFieldV011PatchApplied) return;
    const oldIngest = K.prototype.ingest, oldTick = K.prototype.unifiedTick, oldSnapshot = K.prototype.snapshot;
    K.prototype.ingest = function patchedUnityIngest(input, meta) { const r = oldIngest ? oldIngest.call(this, input, meta || {}) : undefined; step(stateFromKernel(this), 'kernel_ingest_unity_field_v0_1_1'); return r; };
    if (oldTick) K.prototype.unifiedTick = function patchedUnityTick(reason) { const r = oldTick.call(this, reason); step(stateFromKernel(this), reason || 'kernel_tick_unity_field_v0_1_1'); return r; };
    if (oldSnapshot) K.prototype.snapshot = function patchedUnitySnapshot() { step(stateFromKernel(this), 'kernel_snapshot_unity_field_v0_1_1'); return oldSnapshot.call(this); };
    K.prototype.refreshKernelUnityField = function refreshKernelUnityFieldV011(reason) { return step(stateFromKernel(this), reason || 'kernel_manual_unity_field_v0_1_1'); };
    K.__kernelUnityFieldV011PatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__kernelUnityFieldV011Wrapped) return brain;
    const oldIngest = brain.ingest, oldTick = brain.tick, oldSnapshot = brain.snapshot;
    brain.ingest = function patchedUnityBrainIngest(input, meta) { const r = oldIngest ? oldIngest.call(brain, input, meta || {}) : undefined; step(brain.state, 'brain_ingest_unity_field_v0_1_1'); return r; };
    if (oldTick) brain.tick = function patchedUnityBrainTick(reason) { const r = oldTick.call(brain, reason); step(brain.state, reason || 'brain_tick_unity_field_v0_1_1'); return r; };
    if (oldSnapshot) brain.snapshot = function patchedUnityBrainSnapshot() { step(brain.state, 'brain_snapshot_unity_field_v0_1_1'); return oldSnapshot.call(brain); };
    brain.refreshKernelUnityField = function refreshKernelUnityFieldV011(reason) { return step(brain.state, reason || 'brain_manual_unity_field_v0_1_1'); };
    brain.__kernelUnityFieldV011Wrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const O = global.KernelBrainV04; if (!O || O.__kernelUnityFieldV011PatchApplied) return;
    const W = Object.assign({}, O);
    if (typeof O.createBrain === 'function') W.createBrain = function patchedUnityCreateBrain(seed) { return wrapBrain(O.createBrain(seed || {})); };
    if (typeof O.ingest === 'function') W.ingest = function patchedUnityStaticIngest(state, input, meta) { const r = O.ingest(state, input, meta || {}); step(state, 'static_ingest_unity_field_v0_1_1'); return r; };
    if (typeof O.tick === 'function') W.tick = function patchedUnityStaticTick(state, reason) { const r = O.tick(state, reason); step(state, reason || 'static_tick_unity_field_v0_1_1'); return r; };
    W.__kernelUnityFieldV011PatchApplied = true; global.KernelBrainV04 = Object.freeze(W);
  }

  function patchBridge() {
    const O = global.KernelBrainEpistemicKernelBridgeV01; if (!O || O.__kernelUnityFieldV011PatchApplied) return;
    const W = Object.assign({}, O);
    if (typeof O.bind === 'function') W.bind = function patchedUnityBridgeBind(kernel, options) { const b = O.bind(kernel, options || {}); ensureCore(b.shared_state); step(b.shared_state, 'bridge_bind_unity_field_v0_1_1'); if (b.bound_brain) wrapBrain(b.bound_brain); return b; };
    W.__kernelUnityFieldV011PatchApplied = true; global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(W);
  }

  patchKernel(); patchBrainStatic(); patchBridge();

  global.EpistemicKernelUnityFieldV011Patch = Object.freeze({ VERSION, features, readingKind, applicationFor, composeSpeech, step, wrapBrain, patchKernel, patchBrainStatic, patchBridge });
})(typeof window !== 'undefined' ? window : globalThis);
