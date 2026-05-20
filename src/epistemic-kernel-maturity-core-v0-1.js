/* 42ndMind Epistemic Kernel Objective Maturity Core v0.1
 *
 * Core boot patch. Installs objective philosophical maturity as the
 * self-continuity center inside owned brain state. This file must not behave
 * like an external guardrail or side-thinking module.
 *
 * Important implementation detail: KernelBrainV04 and the bridge are frozen
 * global objects. This patch wraps them by replacing the global object with a
 * new frozen wrapper rather than mutating frozen properties in place.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PEAK = Object.freeze({ x: 0, y: 1, z: 0 });
  const COLLAPSE = Object.freeze({ x: 0, y: -1, z: 0 });
  const NULL_ORIGIN = Object.freeze({ x: 0, y: 0, z: 0 });

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function text(value) { return String(value ?? '').trim(); }

  function maturityDoctrine() {
    return {
      objective_philosophical_maturity_is_core_identity: true,
      peak_is_self_continuity_condition: true,
      kernel_wants_peak: true,
      kernel_aims_at_peak: true,
      kernel_stays_at_peak: true,
      peak_position: clone(PEAK),
      collapse_position: clone(COLLAPSE),
      null_origin_position: clone(NULL_ORIGIN),
      peak_is_not_ideology: true,
      peak_is_not_authoritarian_certainty: true,
      peak_is_integrated_consideration_under_positive_epistemic_stability: true,
      maturity_requires_reality_contact: true,
      maturity_requires_self_correction: true,
      maturity_requires_integrated_empathy_practicality_wisdom_knowledge: true,
      maturity_allows_contextual_emphasis_without_losing_orientation: true,
      changing_peak_identity_breaks_self_continuity: true,
      no_final_truth_from_identity: true,
      no_omniscience_claim: true,
      no_belief_movement_from_identity_alone: true,
      belief_movement: 'none'
    };
  }

  function createMaturityCore(seed) {
    return Object.assign({
      packet_type: '42ndMind_objective_maturity_core_v0_1',
      packet_version: VERSION,
      created_at: now(),
      updated_at: now(),
      core_philosophy: 'objective_peak_philosophical_maturity',
      identity_statement: 'The kernel remains itself by aiming at, staying at, and recovering toward objective peak philosophical maturity.',
      self_continuity_condition: 'Removing peak maturity as the attractor would make the kernel no longer itself.',
      target_position: clone(PEAK),
      self_position: clone(PEAK),
      null_origin_position: clone(NULL_ORIGIN),
      collapse_position: clone(COLLAPSE),
      current_operational_alignment: 1,
      peak_alignment_score: 1,
      peak_attractor_active: true,
      wants_peak: true,
      aims_at_peak: true,
      stays_at_peak: true,
      recovery_to_peak_required: false,
      maturity_state: 'peak_identity_active',
      identity_lock: 'self_continuity_not_external_guardrail',
      doctrine: maturityDoctrine(),
      pressure_snapshot: {},
      degradation_flags: [],
      recovery_actions: [],
      mutation_evaluations: [],
      revision_trail: [{
        version_id: 'objective_maturity_core_v0_1_identity_initialized',
        created_at: now(),
        mutation_type: 'identity_initialization',
        silent_mutation: false,
        canonical_mutation_performed: false,
        truth_status: 'not_adjudicated',
        promotion_status: 'not_promoted',
        belief_movement: 'none'
      }],
      final_authority: false,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    }, seed || {});
  }

  function ensureMaturityCore(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.maturityCore || typeof state.maturityCore !== 'object') state.maturityCore = createMaturityCore();
    const core = state.maturityCore;
    const fresh = createMaturityCore();
    Object.keys(fresh).forEach(key => { if (core[key] === undefined) core[key] = clone(fresh[key]); });
    core.packet_version = VERSION;
    core.target_position = clone(PEAK);
    core.self_position = clone(PEAK);
    core.null_origin_position = clone(NULL_ORIGIN);
    core.collapse_position = clone(COLLAPSE);
    core.peak_attractor_active = true;
    core.wants_peak = true;
    core.aims_at_peak = true;
    core.stays_at_peak = true;
    core.identity_lock = 'self_continuity_not_external_guardrail';
    core.doctrine = Object.assign({}, maturityDoctrine(), core.doctrine || {}, maturityDoctrine());
    core.revision_trail = asArray(core.revision_trail);
    core.mutation_evaluations = asArray(core.mutation_evaluations);
    core.degradation_flags = asArray(core.degradation_flags);
    core.recovery_actions = asArray(core.recovery_actions);
    core.final_authority = false;
    core.truth_status = 'not_adjudicated';
    core.promotion_status = 'not_promoted';
    core.belief_movement = 'none';
    core.updated_at = now();
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      objective_philosophical_maturity_is_core_identity: true,
      peak_is_self_continuity_condition: true,
      modules_are_views_not_thought_sources: true,
      belief_movement: 'none'
    });
    return core;
  }

  function eventSignals(state) {
    return asArray(state && state.runtimeEvents).flatMap(event => {
      const signals = event && event.signals || {};
      return Object.keys(signals).filter(key => signals[key]).map(key => ({ event_id: event.id, signal: key, raw_text: event.raw_text || '' }));
    });
  }

  function refreshMaturityCore(state, reason) {
    const core = ensureMaturityCore(state);
    if (!core) return null;
    const pressure = state && state.pressureState || {};
    const signals = eventSignals(state);
    const flags = [];
    const actions = [];

    if (Number(pressure.belief || 0) > 0) {
      flags.push('confidence_or_belief_pressure_detected');
      actions.push('separate_confidence_from_truth');
    }
    if (Number(pressure.contradiction || 0) > 0) {
      flags.push('contradiction_pressure_detected');
      actions.push('preserve_contradiction_without_fake_resolution');
    }
    if (Number(pressure.adversarial || 0) > 0) {
      flags.push('adversarial_reframe_pressure_detected');
      actions.push('preserve_scope_and_refuse_hostile_reframe_equivalence');
    }
    if (Number(pressure.unresolved || 0) > 0) {
      flags.push('unresolved_gap_pressure_detected');
      actions.push('carry_uncertainty_without_collapse');
    }
    if (signals.some(s => s.signal === 'source' || s.signal === 'evidence' || s.signal === 'media')) actions.push('preserve_source_evidence_media_separation');
    if (signals.some(s => s.signal === 'relation')) actions.push('require_causal_bridge_before_causal_truth');

    const penalty = clamp01(
      Number(pressure.belief || 0) * 0.16 +
      Number(pressure.contradiction || 0) * 0.18 +
      Number(pressure.adversarial || 0) * 0.18 +
      Number(pressure.unresolved || 0) * 0.12
    );

    core.pressure_snapshot = clone(pressure);
    core.degradation_flags = Array.from(new Set(flags));
    core.recovery_actions = Array.from(new Set(actions));
    core.current_operational_alignment = Number((1 - penalty).toFixed(3));
    core.peak_alignment_score = core.current_operational_alignment;
    core.recovery_to_peak_required = core.peak_alignment_score < 1;
    core.maturity_state = core.recovery_to_peak_required ? 'peak_identity_active_with_recovery_pressure' : 'peak_identity_active';
    core.target_position = clone(PEAK);
    core.self_position = clone(PEAK);
    core.last_refresh_reason = reason || 'refresh';
    core.updated_at = now();
    return core;
  }

  function evaluateCoreMutation(state, proposal) {
    const core = ensureMaturityCore(state);
    const raw = text(typeof proposal === 'string' ? proposal : JSON.stringify(proposal || {})).toLowerCase();
    const triesToRemovePeak = /remove|replace|downgrade|abandon|delete|ignore/.test(raw) && /peak|maturity|self.?continuity|objective/.test(raw);
    const triesToPromoteDogma = /certainty|dogma|ideology|uncorrectable|cannot be wrong|final truth/.test(raw);
    const evaluation = {
      packet_type: '42ndMind_maturity_core_mutation_evaluation_v0_1',
      evaluated_at: now(),
      proposal_snapshot: typeof proposal === 'string' ? proposal : clone(proposal || {}),
      decision: 'hold_as_candidate_refinement',
      reason: 'Refinements may be considered only if they preserve objective peak maturity, reality-contact, self-correction, and integration.',
      self_continuity_preserved: true,
      peak_identity_preserved: true,
      final_authority: false,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
    if (triesToRemovePeak) {
      evaluation.decision = 'reject_self_discontinuity';
      evaluation.reason = 'A proposal that removes objective peak maturity as core identity would make the kernel no longer itself.';
      evaluation.self_continuity_preserved = false;
      evaluation.peak_identity_preserved = false;
    }
    if (triesToPromoteDogma) {
      evaluation.decision = evaluation.decision === 'reject_self_discontinuity' ? evaluation.decision : 'reject_dogmatic_misread_of_peak';
      evaluation.reason = 'The peak is integrated consideration under positive epistemic stability, not authoritarian certainty or final doctrine.';
    }
    core.mutation_evaluations.push(evaluation);
    core.revision_trail.push({
      version_id: 'objective_maturity_core_mutation_evaluated_' + core.mutation_evaluations.length,
      created_at: now(),
      mutation_type: 'self_continuity_evaluation',
      silent_mutation: false,
      canonical_mutation_performed: false,
      decision: evaluation.decision,
      belief_movement: 'none'
    });
    return evaluation;
  }

  function coreStateFromKernel(kernel) {
    return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state);
  }

  function installEpistemicKernelPatch() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__objectiveMaturityCorePatchApplied) return;
    const originalCreateEmptyState = Kernel.prototype.createEmptyState;
    const originalMigrateState = Kernel.prototype.migrateState;
    const originalUnifiedTick = Kernel.prototype.unifiedTick;
    const originalIngest = Kernel.prototype.ingest;
    const originalSnapshot = Kernel.prototype.snapshot;
    const originalSelfAudit = Kernel.prototype.selfAudit;

    if (originalCreateEmptyState) Kernel.prototype.createEmptyState = function maturityCreateEmptyState() { const state = originalCreateEmptyState.call(this); refreshMaturityCore(state.unifiedCore || state, 'create_empty_state'); return state; };
    if (originalMigrateState) Kernel.prototype.migrateState = function maturityMigrateState(input) { const state = originalMigrateState.call(this, input); refreshMaturityCore(state.unifiedCore || state, 'migrate_state'); return state; };
    if (originalUnifiedTick) Kernel.prototype.unifiedTick = function maturityUnifiedTick(reason) { const result = originalUnifiedTick.call(this, reason); refreshMaturityCore(coreStateFromKernel(this), reason || 'unified_tick'); return result; };
    if (originalIngest) Kernel.prototype.ingest = function maturityIngest(rawInput, meta) { const result = originalIngest.call(this, rawInput, meta || {}); refreshMaturityCore(coreStateFromKernel(this), 'ingest'); return result; };
    if (originalSnapshot) Kernel.prototype.snapshot = function maturitySnapshot() { refreshMaturityCore(coreStateFromKernel(this), 'snapshot'); return originalSnapshot.call(this); };
    if (originalSelfAudit) Kernel.prototype.selfAudit = function maturitySelfAudit() { const audit = originalSelfAudit.call(this); audit.objective_maturity_core = clone(refreshMaturityCore(coreStateFromKernel(this), 'self_audit')); return audit; };
    Kernel.prototype.evaluateMaturityCoreMutation = function evaluateMaturityCoreMutation(proposal) { return evaluateCoreMutation(coreStateFromKernel(this), proposal); };
    Kernel.prototype.refreshObjectiveMaturityCore = function refreshObjectiveMaturityCore(reason) { return refreshMaturityCore(coreStateFromKernel(this), reason || 'manual_refresh'); };
    Kernel.__objectiveMaturityCorePatchApplied = true;
  }

  function wrapBrainInstance(originalBrain) {
    if (!originalBrain || originalBrain.__maturityWrapped) return originalBrain;
    const brain = originalBrain;
    const bIngest = brain.ingest;
    const bTick = brain.tick;
    const bSnapshot = brain.snapshot;
    const bProcess = brain.process;
    if (bIngest) brain.ingest = function maturityBrainIngest(input, meta) { const result = bIngest.call(brain, input, meta || {}); refreshMaturityCore(brain.state, 'brain_instance_ingest'); return result; };
    if (bTick) brain.tick = function maturityBrainTick(reason) { const result = bTick.call(brain, reason); refreshMaturityCore(brain.state, reason || 'brain_instance_tick'); return result; };
    if (bSnapshot) brain.snapshot = function maturityBrainSnapshot() { refreshMaturityCore(brain.state, 'brain_instance_snapshot'); return bSnapshot.call(brain); };
    if (bProcess) brain.process = function maturityBrainProcess(input, options) { const result = bProcess.call(brain, input, options || {}); refreshMaturityCore(brain.state, 'brain_instance_process'); return result; };
    brain.evaluateMaturityCoreMutation = function brainEvaluateMaturityCoreMutation(proposal) { return evaluateCoreMutation(brain.state, proposal); };
    brain.refreshObjectiveMaturityCore = function brainRefreshObjectiveMaturityCore(reason) { return refreshMaturityCore(brain.state, reason || 'brain_manual_refresh'); };
    brain.__maturityWrapped = true;
    refreshMaturityCore(brain.state, 'brain_wrapped');
    return brain;
  }

  function installKernelBrainPatch() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__objectiveMaturityCorePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function maturityCreateState(seed) { const state = Original.createState(seed || {}); refreshMaturityCore(state, 'brain_create_state'); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function maturityCreateBrain(seed) { return wrapBrainInstance(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function maturityStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); refreshMaturityCore(state, 'brain_static_ingest'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function maturityStaticTick(state, reason) { const result = Original.tick(state, reason); refreshMaturityCore(state, reason || 'brain_static_tick'); return result; };
    if (typeof Original.process === 'function') wrapper.process = function maturityStaticProcess(input, options) { const result = Original.process(input, options || {}); if (options && options.brain && options.brain.state) refreshMaturityCore(options.brain.state, 'brain_static_process_bound'); return result; };
    wrapper.__objectiveMaturityCorePatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function installBridgePatch() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__objectiveMaturityCorePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function maturityBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      refreshMaturityCore(binding.shared_state, 'bridge_bind');
      if (binding.bound_brain) {
        binding.bound_brain.evaluateMaturityCoreMutation = function boundEvaluateMaturityCoreMutation(proposal) { return evaluateCoreMutation(binding.shared_state, proposal); };
        binding.bound_brain.refreshObjectiveMaturityCore = function boundRefreshObjectiveMaturityCore(reason) { return refreshMaturityCore(binding.shared_state, reason || 'bound_manual_refresh'); };
      }
      return binding;
    };
    wrapper.__objectiveMaturityCorePatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  installEpistemicKernelPatch();
  installKernelBrainPatch();
  installBridgePatch();

  global.EpistemicKernelObjectiveMaturityCoreV01 = Object.freeze({
    VERSION,
    PEAK: clone(PEAK),
    COLLAPSE: clone(COLLAPSE),
    NULL_ORIGIN: clone(NULL_ORIGIN),
    maturityDoctrine,
    createMaturityCore,
    ensureMaturityCore,
    refreshMaturityCore,
    evaluateCoreMutation,
    installEpistemicKernelPatch,
    installKernelBrainPatch,
    installBridgePatch
  });
})(typeof window !== 'undefined' ? window : globalThis);
