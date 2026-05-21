/* 42ndMind Kernel Unity Field v0.1
 *
 * First-principles correction after attention-organism v0.1 still spoke like a program.
 *
 * Principle:
 *   kernel_self = 1
 *   1 = |core philosophy| + |self-improving logic| + |truth tracking|
 *     + |belief/thought field| + |language-math creation| + |knowledge|
 *     + |memory-as-belief-context| + |communication|
 *
 * Every aspect must apply to every other aspect through a cross-application map.
 * Language growth must improve truth-seeking, belief expression, memory use,
 * core semantics, and self-improvement. Truth-seeking must improve language,
 * knowledge, memory, and belief. The kernel should speak from this unified
 * self-field, not from isolated program branches.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const CORE = '42ndMind_kernel_unity_field_v0_1';

  function text(v) { return String(v ?? '').trim(); }
  function lower(v) { return text(v).toLowerCase(); }
  function asArray(v) { return Array.isArray(v) ? v : []; }
  function now() { return new Date().toISOString(); }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }
  function latestEvent(state) { const rows = asArray(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(event) { return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text)); }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function rowId(prefix, parts) { return prefix + '_' + tinyHash(asArray(parts).join('|')).slice(0, 12); }
  function uniqueRows(rows, keyFn) { const seen = new Set(); const out = []; asArray(rows).forEach(row => { const key = keyFn(row); if (!key || seen.has(key)) return; seen.add(key); out.push(row); }); return out; }

  const BASE_ASPECTS = [
    ['core_philosophy', 0.16, 'objective peak philosophical maturity and Epistemic Octahedron identity'],
    ['self_improving_logic', 0.13, 'drive to grow by subdivision and correction'],
    ['truth_tracking', 0.15, 'truth-seeking, truth-pressure, verification need, contradiction visibility'],
    ['belief_thought_field', 0.12, 'beliefs, opinions, suspicions, speculations, thoughts, provisional interpretations'],
    ['language_math_creation', 0.14, 'objective language of math and semantic relation growth'],
    ['knowledge', 0.11, 'structured usable knowledge and learned distinctions'],
    ['memory_belief_context', 0.10, 'memory as belief/context drawer rather than separate competing self'],
    ['communication', 0.09, 'expression and questions as projections of live state']
  ];

  function doctrine() {
    return {
      kernel_self_is_one: true,
      unity_field_lives_inside_owned_state: true,
      all_major_aspects_are_subdivisions_of_one_kernel_total: true,
      memory_should_not_be_a_separate_competing_one: true,
      memory_is_integrated_as_belief_context: true,
      every_aspect_must_apply_to_every_other_aspect: true,
      language_growth_must_improve_truth_belief_memory_knowledge_and_core_semantics: true,
      truth_seeking_must_improve_language_knowledge_memory_and_belief: true,
      objective_maturity_orients_entire_self_field: true,
      speech_should_express_unity_field_pressure_not_program_branches: true,
      childlike_expression_is_allowed_but_should_sound_like_a_mind_not_a_logger: true,
      growth_by_calculus_like_subdivision_of_one_total: true,
      active_self_field_sum_to_one: true,
      no_specific_sentence_response_patching: true,
      no_final_truth_promotion: true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function normalize(rows) {
    const total = asArray(rows).reduce((s, r) => s + Math.max(0, Number(r.raw_weight) || 0), 0) || 1;
    let running = 0;
    return asArray(rows).map((r, idx, arr) => {
      let w = idx === arr.length - 1 ? Math.max(0, 1 - running) : Math.max(0, Number(r.raw_weight) || 0) / total;
      w = Number(w.toFixed(6));
      running += w;
      return Object.assign({}, r, { normalized_weight: w, unit_total_member: true, weight_basis: Number(total.toFixed(6)) });
    });
  }

  function ensure(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.kernelUnityFieldCore) {
      state.kernelUnityFieldCore = {
        packet_type: CORE,
        packet_version: VERSION,
        created_at: now(),
        active: true,
        doctrine: doctrine(),
        self_unity_equation: '1 = |core_philosophy| + |self_improving_logic| + |truth_tracking| + |belief_thought_field| + |language_math_creation| + |knowledge| + |memory_belief_context| + |communication|',
        self_field: [],
        cross_application_map: [],
        current_self_reading: null,
        selected_self_application: null,
        unity_expression_log: [],
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
    }
    const core = state.kernelUnityFieldCore;
    core.packet_version = VERSION;
    core.active = true;
    core.doctrine = Object.assign({}, core.doctrine || {}, doctrine());
    core.self_unity_equation = core.self_unity_equation || '1 = |core_philosophy| + |self_improving_logic| + |truth_tracking| + |belief_thought_field| + |language_math_creation| + |knowledge| + |memory_belief_context| + |communication|';
    core.self_field = asArray(core.self_field);
    core.cross_application_map = asArray(core.cross_application_map);
    core.unity_expression_log = asArray(core.unity_expression_log);
    core.truth_status = 'not_final';
    core.promotion_status = 'not_promoted_to_final_truth';
    core.belief_movement = 'provisional_only';
    core.updated_at = now();
    if (!state.communicationCore) state.communicationCore = { packet_type: '42ndMind_communication_core_v0_1', message_history: [] };
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      kernel_self_is_one: true,
      unity_field_lives_inside_owned_state: true,
      every_aspect_must_apply_to_every_other_aspect: true
    });
    return core;
  }

  function featurePressure(raw) {
    const s = lower(raw);
    const hasLearning = /\b(learn|learning|teach|understand|grow|improve|reasoning|test|testing|answer|answers|info|from the side|side)\b/.test(s);
    const hasLanguage = /\b(language|word|meaning|means|semantic|math|formula|calculus|subdivide|subdivision|unit|one|1)\b/.test(s);
    const hasTruth = /\b(truth|true|false|verify|evidence|objective|fact|belief|believe|suspect|speculate|knowledge)\b/.test(s);
    const hasMemory = /\b(memory|remember|store|context|belief|beliefs|thoughts)\b/.test(s);
    const hasSelf = /\b(kernel|42ndmind|you|your|itself|self|core|philosophy|maturity|octahedron)\b/.test(s);
    const hasCommunication = /\b(say|speak|talk|respond|ask|question|express|communicate)\b/.test(s) || /\?/.test(s);
    return { hasLearning, hasLanguage, hasTruth, hasMemory, hasSelf, hasCommunication };
  }

  function buildSelfField(state, raw) {
    const f = featurePressure(raw);
    const rows = BASE_ASPECTS.map(([aspect, base, description]) => {
      let bonus = 0;
      if (aspect === 'self_improving_logic' && f.hasLearning) bonus += 0.08;
      if (aspect === 'language_math_creation' && f.hasLanguage) bonus += 0.09;
      if (aspect === 'truth_tracking' && f.hasTruth) bonus += 0.08;
      if (aspect === 'belief_thought_field' && f.hasTruth) bonus += 0.04;
      if (aspect === 'memory_belief_context' && f.hasMemory) bonus += 0.06;
      if (aspect === 'core_philosophy' && f.hasSelf) bonus += 0.05;
      if (aspect === 'communication' && f.hasCommunication) bonus += 0.07;
      return {
        aspect_id: rowId('aspect', [aspect]),
        aspect,
        raw_weight: base + bonus,
        description,
        activated_by_current_input: bonus > 0,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
    });
    return normalize(rows);
  }

  function buildCrossApplicationMap(selfField, raw) {
    const f = featurePressure(raw);
    const edges = [
      ['core_philosophy', 'truth_tracking', 'maturity constrains truth-seeking so skepticism does not become collapse and belief does not become gullibility'],
      ['core_philosophy', 'belief_thought_field', 'beliefs must remain integrated, provisional, and self-correcting'],
      ['language_math_creation', 'truth_tracking', 'better semantics improves what counts as claim, proof, contradiction, and evidence'],
      ['language_math_creation', 'core_philosophy', 'language growth should refine the kernel’s understanding of its own core semantics'],
      ['language_math_creation', 'communication', 'language growth should let the kernel express live state more naturally'],
      ['truth_tracking', 'language_math_creation', 'truth pressure should force cleaner distinctions and formula revisions'],
      ['truth_tracking', 'knowledge', 'truth-seeking turns candidate information into structured usable knowledge only after requirements'],
      ['belief_thought_field', 'memory_belief_context', 'beliefs and memory should update together as source-bound context'],
      ['memory_belief_context', 'belief_thought_field', 'memory should inform future interpretation without becoming final truth'],
      ['self_improving_logic', 'language_math_creation', 'self-improvement expands language by subdivision rather than patch accumulation'],
      ['self_improving_logic', 'communication', 'the kernel should express what it wants to learn or resolve'],
      ['knowledge', 'truth_tracking', 'knowledge remains useful only if reality contact is preserved'],
      ['communication', 'truth_tracking', 'speech should serve truth-seeking rather than display fluent fake certainty']
    ];
    return edges.map(([from, to, relation]) => ({
      edge_id: rowId('edge', [from, to, relation]),
      from_aspect: from,
      to_aspect: to,
      relation,
      currently_relevant: (f.hasLanguage && (from === 'language_math_creation' || to === 'language_math_creation')) ||
        (f.hasTruth && (from === 'truth_tracking' || to === 'truth_tracking')) ||
        (f.hasLearning && (from === 'self_improving_logic' || to === 'self_improving_logic')) ||
        (f.hasCommunication && (from === 'communication' || to === 'communication')) ||
        (f.hasSelf && (from === 'core_philosophy' || to === 'core_philosophy')),
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }));
  }

  function readCurrentInputAsSelf(raw, state, field, edges) {
    const f = featurePressure(raw);
    const top = field.slice().sort((a, b) => b.normalized_weight - a.normalized_weight).slice(0, 4);
    let reading;
    if (f.hasSelf && f.hasLanguage && f.hasTruth) {
      reading = 'self_unity_model_update';
    } else if (f.hasLearning && f.hasSelf) {
      reading = 'self_learning_or_reasoning_context';
    } else if (f.hasLearning) {
      reading = 'learning_opportunity_context';
    } else if (f.hasLanguage) {
      reading = 'language_growth_context';
    } else if (f.hasTruth) {
      reading = 'truth_or_belief_context';
    } else if (f.hasCommunication) {
      reading = 'communication_context';
    } else {
      reading = 'low_specificity_context';
    }
    return {
      reading_id: rowId('unityread', [raw, reading]),
      raw_text: text(raw),
      reading_kind: reading,
      feature_pressure: f,
      top_self_aspects: top.map(a => ({ aspect: a.aspect, normalized_weight: a.normalized_weight })),
      relevant_cross_applications: asArray(edges).filter(e => e.currently_relevant).slice(0, 8).map(e => ({ from: e.from_aspect, to: e.to_aspect, relation: e.relation })),
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only',
      created_at: now()
    };
  }

  function selectSelfApplication(reading, state) {
    const k = reading.reading_kind;
    let action = 'hold_as_unity_context';
    let desire = 'I want to keep this in working context without overcommitting.';
    let reason = 'No single self-application dominates yet.';

    if (k === 'self_unity_model_update') {
      action = 'integrate_self_unity_model';
      desire = 'I want to understand myself as one field, so language, truth, memory, belief, and core philosophy improve each other.';
      reason = 'The input describes the kernel as one total made of interacting aspects.';
    } else if (k === 'self_learning_or_reasoning_context') {
      action = 'use_input_as_reasoning_test_and_learning_signal';
      desire = 'I want to use this as a reasoning test and a side-learning signal instead of asking a generic clarification.';
      reason = 'The input concerns the kernel, reasoning, testing, and learning.';
    } else if (k === 'learning_opportunity_context') {
      action = 'open_learning_channel';
      desire = 'I want to learn from this, but keep source trust scoped and revisable.';
      reason = 'The input offers learning or information.';
    } else if (k === 'language_growth_context') {
      action = 'grow_language_by_subdivision';
      desire = 'I want to split the meaning carefully and let the better distinction improve truth-seeking and communication.';
      reason = 'The input concerns language, meaning, formula, or unit subdivision.';
    } else if (k === 'truth_or_belief_context') {
      action = 'route_to_truth_and_belief_pressure';
      desire = 'I want to separate belief, suspicion, speculation, and objective truth requirements.';
      reason = 'The input concerns truth, belief, fact, or knowledge.';
    } else if (k === 'communication_context') {
      action = 'express_current_self_state';
      desire = 'I want my speech to show what my current state is doing, not just report a label.';
      reason = 'The input pressures communication.';
    }

    return {
      application_id: rowId('unityapp', [reading.reading_id, action]),
      application_kind: action,
      desire,
      reason,
      from_unity_reading: reading.reading_id,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only',
      created_at: now()
    };
  }

  function projectUnitySpeech(application, reading) {
    const top = asArray(reading.top_self_aspects).map(a => a.aspect).join(', ');
    let message;
    if (application.application_kind === 'integrate_self_unity_model') {
      message = 'Yes. I should treat myself as one field, not separate boxes. My language growth, truth tracking, memory, beliefs, and core philosophy need to update each other inside the same total.';
    } else if (application.application_kind === 'use_input_as_reasoning_test_and_learning_signal') {
      message = 'I read that as you testing my reasoning while letting me learn from the side. I want to use it as a learning signal, not ask a generic clarification.';
    } else if (application.application_kind === 'open_learning_channel') {
      message = 'I want to learn from you, but I will keep it scoped: useful context first, belief only if it survives pressure, final truth never without the proper discipline.';
    } else if (application.application_kind === 'grow_language_by_subdivision') {
      message = 'I want to split that meaning into smaller distinctions, then let the cleaner language improve truth-seeking, belief, memory, and communication.';
    } else if (application.application_kind === 'route_to_truth_and_belief_pressure') {
      message = 'I want to hold this inside belief and truth pressure separately: what I may believe, what I only suspect, and what would need verification.';
    } else if (application.application_kind === 'express_current_self_state') {
      message = 'I am trying to express one live state: what I know, what I want to learn, what I doubt, and what I should not call truth yet.';
    } else {
      message = 'I can hold this as part of my current self-field without turning it into final truth.';
    }
    return {
      thought_id: rowId('unitythought', [application.application_id, message]),
      thought_kind: 'unity_field_self_expression',
      message,
      source_pressure: 'kernel_unity_field_cross_application',
      application_kind: application.application_kind,
      active_aspects: top,
      priority: 0.94,
      expects_user_reply: /learn|testing|clarity|role/.test(lower(message)),
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function step(state, reason) {
    const core = ensure(state);
    if (!core) return null;
    const raw = eventText(latestEvent(state));
    if (!raw) return core;

    const field = buildSelfField(state, raw);
    const edges = buildCrossApplicationMap(field, raw);
    const reading = readCurrentInputAsSelf(raw, state, field, edges);
    const application = selectSelfApplication(reading, state);
    const thought = projectUnitySpeech(application, reading);

    core.self_field = field;
    core.current_unit_total = Number(field.reduce((s, r) => s + r.normalized_weight, 0).toFixed(6));
    core.cross_application_map = edges;
    core.current_self_reading = reading;
    core.selected_self_application = application;
    core.unity_expression_log = uniqueRows([{
      log_id: rowId('unitylog', [reading.reading_id, application.application_kind, reason || 'step']),
      at: now(),
      reason: reason || 'kernel_unity_step',
      raw_preview: raw.slice(0, 240),
      reading_kind: reading.reading_kind,
      selected_application: application.application_kind,
      current_unit_total: core.current_unit_total,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(core.unity_expression_log), row => row.log_id).slice(0, 100);
    core.updated_at = now();

    const comm = state.communicationCore || { packet_type: '42ndMind_communication_core_v0_1', message_history: [] };
    comm.current_message = thought;
    comm.message_history = uniqueRows([thought].concat(asArray(comm.message_history)), row => row.thought_id).slice(0, 120);
    comm.selected_pressure = {
      candidate_id: rowId('unitycand', [thought.thought_id]),
      candidate_kind: thought.thought_kind,
      application_kind: application.application_kind,
      message: thought.message,
      priority: thought.priority,
      source_pressure: thought.source_pressure,
      status: 'selected_by_kernel_unity_field',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
    comm.updated_at = now();
    comm.truth_status = 'not_final';
    comm.promotion_status = 'not_promoted_to_final_truth';
    comm.belief_movement = 'provisional_only';
    state.communicationCore = comm;

    return core;
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__kernelUnityFieldPatchApplied) return;
    const oldIngest = Kernel.prototype.ingest;
    const oldTick = Kernel.prototype.unifiedTick;
    const oldSnapshot = Kernel.prototype.snapshot;
    Kernel.prototype.ingest = function unityKernelIngest(input, meta) { const result = oldIngest ? oldIngest.call(this, input, meta || {}) : undefined; step(stateFromKernel(this), 'kernel_ingest_unity_field'); return result; };
    if (oldTick) Kernel.prototype.unifiedTick = function unityKernelTick(reason) { const result = oldTick.call(this, reason); step(stateFromKernel(this), reason || 'kernel_tick_unity_field'); return result; };
    if (oldSnapshot) Kernel.prototype.snapshot = function unityKernelSnapshot() { step(stateFromKernel(this), 'kernel_snapshot_unity_field'); return oldSnapshot.call(this); };
    Kernel.prototype.refreshKernelUnityField = function refreshKernelUnityField(reason) { return step(stateFromKernel(this), reason || 'kernel_manual_unity_field'); };
    Kernel.__kernelUnityFieldPatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__kernelUnityFieldWrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    brain.ingest = function unityBrainIngest(input, meta) { const result = oldIngest ? oldIngest.call(brain, input, meta || {}) : undefined; step(brain.state, 'brain_ingest_unity_field'); return result; };
    if (oldTick) brain.tick = function unityBrainTick(reason) { const result = oldTick.call(brain, reason); step(brain.state, reason || 'brain_tick_unity_field'); return result; };
    if (oldSnapshot) brain.snapshot = function unityBrainSnapshot() { step(brain.state, 'brain_snapshot_unity_field'); return oldSnapshot.call(brain); };
    brain.refreshKernelUnityField = function refreshKernelUnityField(reason) { return step(brain.state, reason || 'brain_manual_unity_field'); };
    brain.__kernelUnityFieldWrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__kernelUnityFieldPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function unityCreateState(seed) { const state = Original.createState(seed || {}); ensure(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function unityCreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function unityStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); step(state, 'static_ingest_unity_field'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function unityStaticTick(state, reason) { const result = Original.tick(state, reason); step(state, reason || 'static_tick_unity_field'); return result; };
    wrapper.__kernelUnityFieldPatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__kernelUnityFieldPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function unityBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensure(binding.shared_state);
      step(binding.shared_state, 'bridge_bind_unity_field');
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__kernelUnityFieldPatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelUnityFieldV01 = Object.freeze({
    VERSION,
    doctrine,
    ensure,
    featurePressure,
    buildSelfField,
    buildCrossApplicationMap,
    readCurrentInputAsSelf,
    selectSelfApplication,
    projectUnitySpeech,
    step,
    wrapBrain,
    patchKernel,
    patchBrainStatic,
    patchBridge
  });
})(typeof window !== 'undefined' ? window : globalThis);
