/* 42ndMind Attention Organism v0.1
 *
 * First-principles replacement direction for narrow answer patches.
 *
 * Principle:
 *   input -> primitive meaning pressure -> unit-total normalization
 *         -> objective maturity orientation -> selected action -> optional speech
 *
 * This file does not try to know every sentence. It converts input into a
 * bounded pressure field and selects the next epistemic action. Growth happens
 * by subdivision, not by memory bloat or phrase-specific response patches.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const CORE = '42ndMind_attention_organism_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }
  function latestEvent(state) { const rows = asArray(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(event) { return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text)); }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function rowId(prefix, parts) { return prefix + '_' + tinyHash(asArray(parts).join('|')).slice(0, 12); }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function uniqueRows(rows, keyFn) { const seen = new Set(); const out = []; asArray(rows).forEach(row => { const key = keyFn(row); if (!key || seen.has(key)) return; seen.add(key); out.push(row); }); return out; }

  const KNOWN_FUNCTION_WORDS = new Set([
    'i','you','me','my','your','the','a','an','is','are','am','was','were','be','being','been','to','of','in','on','for','from','with','and','or','but','if','then','that','this','it','as','not','do','does','did','can','could','would','should','what','who','when','where','why','how','know','want','think','say','tell','ask','learn','meaning','means','fact','truth','final','name','kernel','brain','president','united','states','america','usa'
  ]);

  function doctrine() {
    return {
      attention_organism_lives_inside_owned_state: true,
      first_principles_pressure_before_speech: true,
      no_specific_sentence_response_patching: true,
      unit_total_pressure_required: true,
      active_pressures_sum_to_one: true,
      growth_by_subdivision_not_mass_inflation: true,
      objective_maturity_orients_action_selection: true,
      epistemic_octahedron_peak_is_identity_center: true,
      language_enters_as_features_relations_pressure_and_candidate_subdivisions: true,
      speech_is_optional_projection_of_selected_action: true,
      childlike_truthful_responses_preferred_over_fake_intelligence: true,
      narrow_answer_projection_is_diagnostic_scaffolding_not_final_architecture: true,
      no_final_truth_promotion: true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function ensure(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.attentionOrganismCore) {
      state.attentionOrganismCore = {
        packet_type: CORE,
        packet_version: VERSION,
        created_at: now(),
        active: true,
        doctrine: doctrine(),
        primitive_interpretation: [],
        unit_pressure_field: [],
        concept_growth_map: [],
        selected_actions: [],
        action_log: [],
        current_unit_total: 1,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
    }
    const core = state.attentionOrganismCore;
    core.packet_version = VERSION;
    core.active = true;
    core.doctrine = Object.assign({}, core.doctrine || {}, doctrine());
    core.primitive_interpretation = asArray(core.primitive_interpretation);
    core.unit_pressure_field = asArray(core.unit_pressure_field);
    core.concept_growth_map = asArray(core.concept_growth_map);
    core.selected_actions = asArray(core.selected_actions);
    core.action_log = asArray(core.action_log);
    core.truth_status = 'not_final';
    core.promotion_status = 'not_promoted_to_final_truth';
    core.belief_movement = 'provisional_only';
    core.updated_at = now();
    if (!state.communicationCore) state.communicationCore = { packet_type: '42ndMind_communication_core_v0_1', message_history: [] };
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      attention_organism_lives_inside_owned_state: true,
      first_principles_pressure_before_speech: true,
      no_specific_sentence_response_patching: true,
      active_pressures_sum_to_one: true
    });
    return core;
  }

  function tokenize(raw) {
    return lower(raw).replace(/[^a-z0-9'\-\s]/g, ' ').split(/\s+/).filter(Boolean);
  }

  function primitiveInterpretation(raw, state) {
    const s = lower(raw);
    const tokens = tokenize(raw);
    const hasQuestionMark = /\?\s*$/.test(s);
    const startsQuestion = /^(who|what|when|where|why|how|do|does|did|can|could|would|should|is|are|am)\b/.test(s);
    const question = hasQuestionMark || startsQuestion;
    const copula = /\b(is|are|am|was|were|means|mean|called|equals|becomes)\b/.test(s);
    const definition = /\b(means|mean|define|definition|called|equals)\b/.test(s);
    const selfIdentity = /\b(my name is|call me|i am|i'm)\b/.test(s);
    const kernelAddress = /\b(you|your|kernel|brain|mind|42ndmind)\b/.test(s);
    const learningOffer = /\b(ask me|ask anything|teach|learn from me|give you answers|one small info|understand better|i can answer|i can tell)\b/.test(s);
    const memoryCue = /\b(remember|memorize|store|keep this|from now on|use this later)\b/.test(s);
    const truthCue = /\b(true|truth|fact|verify|proof|evidence|real|objective|final truth)\b/.test(s);
    const contradictionCue = /\b(but|however|contradict|inconsistent|wrong|false|not true|doesn't mean|not final)\b/.test(s);
    const uncertaintyCue = /\b(idk|maybe|unsure|not sure|i wonder|could be|might|probably)\b/.test(s);
    const unknownTokens = tokens.filter(t => t.length > 2 && !KNOWN_FUNCTION_WORDS.has(t));
    const unknownRatio = tokens.length ? unknownTokens.length / tokens.length : 0;
    const priorNameKnown = !!(state && state.communicationCore && state.communicationCore.user_identity_model && state.communicationCore.user_identity_model.preferred_name);
    const priorFactCandidates = asArray(state && state.languageMathCore && state.languageMathCore.factual_claim_candidates).length;
    const priorMemoryItems = asArray(state && state.beliefMemoryCore && state.beliefMemoryCore.memory_items).length;

    return {
      interpretation_id: rowId('interp', [raw]),
      raw_text: text(raw),
      token_count: tokens.length,
      unknown_tokens: unknownTokens.slice(0, 20),
      unknown_ratio: Number(unknownRatio.toFixed(3)),
      features: {
        question,
        assertion_candidate: !!(!question && copula),
        definition_candidate: !!definition,
        user_identity_candidate: !!selfIdentity,
        kernel_address: !!kernelAddress,
        learning_offer: !!learningOffer,
        memory_cue: !!memoryCue,
        truth_cue: !!truthCue,
        contradiction_cue: !!contradictionCue,
        uncertainty_cue: !!uncertaintyCue,
        prior_name_known: priorNameKnown,
        prior_fact_candidates: priorFactCandidates,
        prior_memory_items: priorMemoryItems
      },
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only',
      created_at: now()
    };
  }

  function rawPressures(interp, state) {
    const f = interp.features || {};
    const p = [];
    function add(kind, raw, reason) {
      const val = Math.max(0, Number(raw) || 0);
      if (val <= 0) return;
      p.push({
        pressure_id: rowId('pressure', [interp.interpretation_id, kind]),
        pressure_kind: kind,
        raw_pressure: Number(val.toFixed(4)),
        reason,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      });
    }

    add('speech_act_understanding', f.question ? 0.72 : f.assertion_candidate ? 0.46 : 0.24, 'The kernel first needs to understand the act: question, claim, definition, context, or unknown.');
    add('answer_pressure', f.question ? (f.kernel_address ? 0.7 : 0.52) : 0.06, 'Questions create pressure to answer or admit unknown.');
    add('truth_candidate_pressure', f.assertion_candidate || f.truth_cue ? 0.58 : 0.1, 'Statements with reality/being/truth structure may become truth candidates.');
    add('meaning_scope_pressure', f.definition_candidate ? 0.76 : interp.unknown_ratio > 0.45 ? 0.28 : 0.08, 'Definitions and unknown terms require meaning boundaries.');
    add('memory_pressure', f.user_identity_candidate || f.memory_cue ? 0.72 : f.learning_offer ? 0.34 : 0.08, 'Identity or durable-use cues create memory pressure.');
    add('source_role_pressure', f.learning_offer || (f.kernel_address && f.question && !f.prior_name_known) ? 0.68 : 0.16, 'Learning from a speaker requires source-role calibration.');
    add('learning_pressure', f.learning_offer ? 0.82 : f.question ? 0.36 : 0.22, 'Input can reduce ignorance or create a new learning need.');
    add('ambiguity_pressure', interp.unknown_ratio > 0.35 || f.uncertainty_cue ? 0.62 : f.question && !f.kernel_address ? 0.32 : 0.12, 'Unknown words, uncertainty cues, or incomplete target create ambiguity.');
    add('contradiction_pressure', f.contradiction_cue ? 0.58 : 0.08, 'Contradiction cues require preservation without fake resolution.');
    add('maturity_alignment_pressure', 0.5, 'Every action remains oriented toward objective peak philosophical maturity and truth-seeking discipline.');
    return p;
  }

  function normalizePressures(rawRows) {
    const total = asArray(rawRows).reduce((sum, r) => sum + (Number(r.raw_pressure) || 0), 0) || 1;
    let running = 0;
    const rows = asArray(rawRows).map((r, idx, arr) => {
      let n = idx === arr.length - 1 ? Math.max(0, 1 - running) : (Number(r.raw_pressure) || 0) / total;
      n = Number(n.toFixed(6));
      running += n;
      return Object.assign({}, r, {
        normalized_pressure: n,
        unit_total_member: true,
        pressure_total_basis: Number(total.toFixed(6))
      });
    }).sort((a, b) => b.normalized_pressure - a.normalized_pressure);
    const sum = Number(rows.reduce((s, r) => s + r.normalized_pressure, 0).toFixed(6));
    return { rows, sum };
  }

  function conceptGrowth(interp, field) {
    const unknowns = asArray(interp.unknown_tokens);
    const branches = [];
    const f = interp.features || {};
    function branch(kind, seed, reason, weight) {
      branches.push({
        branch_id: rowId('branch', [interp.interpretation_id, kind, seed]),
        branch_kind: kind,
        seed,
        growth_mode: 'subdivide_existing_unit_total_field',
        candidate_status: 'candidate_subdivision_not_canonical',
        reason,
        local_pressure_hint: Number(weight.toFixed(4)),
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      });
    }
    unknowns.slice(0, 8).forEach(t => branch('unknown_token_candidate', t, 'Unknown or low-confidence token may become a meaning branch if repeated or clarified.', 0.15 + interp.unknown_ratio));
    if (f.definition_candidate) branch('definition_boundary_candidate', interp.raw_text, 'Definition cue suggests a candidate meaning boundary that must remain scoped.', 0.72);
    if (f.user_identity_candidate) branch('user_identity_context_candidate', interp.raw_text, 'User identity context may be stored as source-bound memory, not final truth.', 0.68);
    if (f.learning_offer) branch('source_learning_channel_candidate', interp.raw_text, 'Speaker is offering information; source role and trust calibration should subdivide before heavy learning.', 0.76);
    return branches;
  }

  function selectAction(interp, fieldRows) {
    const by = Object.fromEntries(asArray(fieldRows).map(r => [r.pressure_kind, r.normalized_pressure]));
    const f = interp.features || {};
    let action = null;
    let reason = null;
    let wantsSpeech = true;

    if (f.learning_offer && (by.source_role_pressure || 0) + (by.learning_pressure || 0) > 0.28) {
      action = 'ask_source_role_for_learning';
      reason = 'The user is offering to teach; source-role calibration most improves future learning.';
    } else if (f.user_identity_candidate) {
      action = 'store_user_identity_context';
      reason = 'User identity cue should be held as source-bound memory, not objective final truth.';
    } else if (f.question && (by.answer_pressure || 0) >= 0.12) {
      action = 'answer_or_admit_unknown';
      reason = 'The input is a question; the mature move is to answer from state or admit unknown, not file as context.';
    } else if (f.definition_candidate) {
      action = 'ask_or_hold_meaning_boundary';
      reason = 'Definition/meaning cues should create scoped meaning boundaries.';
    } else if (f.assertion_candidate || f.truth_cue) {
      action = 'hold_truth_candidate_provisionally';
      reason = 'The input appears claim-like; hold as provisional truth candidate with open requirements.';
    } else if ((by.ambiguity_pressure || 0) > 0.16) {
      action = 'ask_for_clarifying_target';
      reason = 'Ambiguity pressure dominates enough to ask a simple clarifying question.';
    } else {
      action = 'hold_working_context_low_commitment';
      reason = 'No high-pressure epistemic action was needed; keep low-commitment context.';
      wantsSpeech = false;
    }

    return {
      action_id: rowId('action', [interp.interpretation_id, action]),
      action_kind: action,
      reason,
      wants_speech_projection: wantsSpeech,
      selected_from_unit_pressure: asArray(fieldRows).slice(0, 4).map(r => ({ pressure_kind: r.pressure_kind, normalized_pressure: r.normalized_pressure })),
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only',
      created_at: now()
    };
  }

  function projectSpeech(action, interp, state) {
    const f = interp.features || {};
    let message = '';
    if (action.action_kind === 'ask_source_role_for_learning') {
      message = 'I want to learn, but first I need source-role clarity: are you teaching me facts, meanings, worldview, or testing my reasoning?';
    } else if (action.action_kind === 'store_user_identity_context') {
      message = 'I can keep that as user-supplied identity context. I should not treat it as final truth, but it can guide future communication.';
    } else if (action.action_kind === 'answer_or_admit_unknown') {
      if (f.kernel_address) {
        message = 'I think you are asking me something about my state. I can answer only from what my live state currently contains; if I do not know, I should say I do not know.';
      } else {
        message = 'I think you are asking a question. I do not yet have enough grounded state to answer confidently, so I should mark it as unknown rather than pretend.';
      }
    } else if (action.action_kind === 'ask_or_hold_meaning_boundary') {
      message = 'I think this is about meaning. I should hold it as a scoped meaning candidate and look for its boundary, conflicts, and examples.';
    } else if (action.action_kind === 'hold_truth_candidate_provisionally') {
      message = 'I think you are giving me a claim. I can hold it provisionally, but I should not treat it as objective truth without verification and contradiction checks.';
    } else if (action.action_kind === 'ask_for_clarifying_target') {
      message = 'I do not understand the target clearly yet. I should ask what this is meant to affect: meaning, fact, memory, belief, or instruction.';
    } else {
      message = 'I can keep this as low-commitment working context.';
    }
    return {
      thought_id: rowId('organismthought', [action.action_id, message]),
      thought_kind: 'attention_organism_action_projection',
      message,
      source_pressure: 'first_principles_unit_pressure_field',
      action_kind: action.action_kind,
      priority: 0.9,
      expects_user_reply: action.action_kind === 'ask_source_role_for_learning' || action.action_kind === 'ask_for_clarifying_target',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function applyMemorySideEffect(state, action, interp) {
    if (!state || !state.beliefMemoryCore) return;
    if (action.action_kind !== 'store_user_identity_context') return;
    const mem = {
      memory_id: rowId('ao_mem', [interp.raw_text]),
      memory_kind: 'attention_organism_user_identity_context',
      belief_ladder_stage: 'learned_context',
      statement: interp.raw_text,
      source_id: 'direct_user',
      source_kind: 'user_input',
      access_model: 'core_readable_memory_drawer',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only',
      confidence: 0.68,
      created_at: now(),
      updated_at: now()
    };
    state.beliefMemoryCore.memory_items = uniqueRows([mem].concat(asArray(state.beliefMemoryCore.memory_items)), row => row.memory_id).slice(0, 120);
  }

  function step(state, reason) {
    const core = ensure(state);
    if (!core) return null;
    const event = latestEvent(state);
    const raw = eventText(event);
    if (!raw) return core;

    const interp = primitiveInterpretation(raw, state);
    const rawP = rawPressures(interp, state);
    const normalized = normalizePressures(rawP);
    const growth = conceptGrowth(interp, normalized.rows);
    const action = selectAction(interp, normalized.rows);
    const thought = action.wants_speech_projection ? projectSpeech(action, interp, state) : null;

    applyMemorySideEffect(state, action, interp);

    core.primitive_interpretation = uniqueRows([interp].concat(core.primitive_interpretation), row => row.interpretation_id).slice(0, 100);
    core.unit_pressure_field = normalized.rows;
    core.current_unit_total = normalized.sum;
    core.concept_growth_map = uniqueRows(growth.concat(core.concept_growth_map), row => row.branch_id).slice(0, 200);
    core.selected_action = action;
    core.selected_actions = uniqueRows([action].concat(core.selected_actions), row => row.action_id).slice(0, 100);
    core.action_log = uniqueRows([{
      log_id: rowId('aolog', [interp.interpretation_id, action.action_kind, reason || 'step']),
      at: now(),
      reason: reason || 'attention_organism_step',
      raw_preview: raw.slice(0, 220),
      selected_action: action.action_kind,
      current_unit_total: normalized.sum,
      top_pressure: normalized.rows[0] || null,
      speech_projected: !!thought,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(core.action_log), row => row.log_id).slice(0, 100);
    core.updated_at = now();

    if (thought) {
      const comm = state.communicationCore || { message_history: [] };
      comm.current_message = thought;
      comm.message_history = uniqueRows([thought].concat(asArray(comm.message_history)), row => row.thought_id).slice(0, 120);
      comm.selected_pressure = {
        candidate_id: rowId('aocand', [thought.thought_id]),
        candidate_kind: thought.thought_kind,
        action_kind: action.action_kind,
        message: thought.message,
        priority: thought.priority,
        source_pressure: thought.source_pressure,
        status: 'selected_by_attention_organism_unit_pressure',
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
      comm.updated_at = now();
      comm.truth_status = 'not_final';
      comm.promotion_status = 'not_promoted_to_final_truth';
      comm.belief_movement = 'provisional_only';
      state.communicationCore = comm;
    }

    return core;
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__attentionOrganismPatchApplied) return;
    const oldIngest = Kernel.prototype.ingest;
    const oldTick = Kernel.prototype.unifiedTick;
    const oldSnapshot = Kernel.prototype.snapshot;
    Kernel.prototype.ingest = function attentionOrganismKernelIngest(input, meta) {
      const result = oldIngest ? oldIngest.call(this, input, meta || {}) : undefined;
      step(stateFromKernel(this), 'kernel_ingest_attention_organism');
      return result;
    };
    if (oldTick) Kernel.prototype.unifiedTick = function attentionOrganismKernelTick(reason) { const result = oldTick.call(this, reason); step(stateFromKernel(this), reason || 'kernel_tick_attention_organism'); return result; };
    if (oldSnapshot) Kernel.prototype.snapshot = function attentionOrganismKernelSnapshot() { step(stateFromKernel(this), 'kernel_snapshot_attention_organism'); return oldSnapshot.call(this); };
    Kernel.prototype.refreshAttentionOrganism = function refreshAttentionOrganism(reason) { return step(stateFromKernel(this), reason || 'kernel_manual_attention_organism'); };
    Kernel.__attentionOrganismPatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__attentionOrganismWrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    brain.ingest = function attentionOrganismBrainIngest(input, meta) {
      const result = oldIngest ? oldIngest.call(brain, input, meta || {}) : undefined;
      step(brain.state, 'brain_ingest_attention_organism');
      return result;
    };
    if (oldTick) brain.tick = function attentionOrganismBrainTick(reason) { const result = oldTick.call(brain, reason); step(brain.state, reason || 'brain_tick_attention_organism'); return result; };
    if (oldSnapshot) brain.snapshot = function attentionOrganismBrainSnapshot() { step(brain.state, 'brain_snapshot_attention_organism'); return oldSnapshot.call(brain); };
    brain.refreshAttentionOrganism = function refreshAttentionOrganism(reason) { return step(brain.state, reason || 'brain_manual_attention_organism'); };
    brain.__attentionOrganismWrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__attentionOrganismPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function attentionOrganismCreateState(seed) { const state = Original.createState(seed || {}); ensure(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function attentionOrganismCreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function attentionOrganismStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); step(state, 'static_ingest_attention_organism'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function attentionOrganismStaticTick(state, reason) { const result = Original.tick(state, reason); step(state, reason || 'static_tick_attention_organism'); return result; };
    wrapper.__attentionOrganismPatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__attentionOrganismPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function attentionOrganismBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensure(binding.shared_state);
      step(binding.shared_state, 'bridge_bind_attention_organism');
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__attentionOrganismPatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelAttentionOrganismV01 = Object.freeze({
    VERSION,
    doctrine,
    ensure,
    primitiveInterpretation,
    rawPressures,
    normalizePressures,
    conceptGrowth,
    selectAction,
    projectSpeech,
    step,
    wrapBrain,
    patchKernel,
    patchBrainStatic,
    patchBridge
  });
})(typeof window !== 'undefined' ? window : globalThis);
