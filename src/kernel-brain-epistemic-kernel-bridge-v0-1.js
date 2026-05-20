/* 42ndMind KernelBrainV04 <-> EpistemicKernel Bridge v0.1
 *
 * This is not a thought module. It performs reference binding only.
 * Goal: avoid duplicated consciousness between:
 *   - EpistemicKernel.state.unifiedCore
 *   - KernelBrainV04.createBrain().state
 *
 * Correct behavior:
 *   KernelBrainV04 bound brain state === EpistemicKernel.state.unifiedCore
 *   No copying as the normal path.
 *   No truth promotion.
 *   No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';
  const PACKET_TYPE = '42ndMind_kernel_brain_epistemic_kernel_bridge_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }

  function requireKernelBrain() {
    if (!global.KernelBrainV04) throw new Error('KernelBrainV04 unavailable');
    if (typeof global.KernelBrainV04.ingest !== 'function') throw new Error('KernelBrainV04.ingest unavailable');
    if (typeof global.KernelBrainV04.tick !== 'function') throw new Error('KernelBrainV04.tick unavailable');
    return global.KernelBrainV04;
  }

  function bridgeDoctrine() {
    return {
      bridge_is_reference_binding_not_thought_module: true,
      one_backing_state: true,
      kernel_brain_state_is_epistemic_unified_core: true,
      no_state_mirroring_as_normal_path: true,
      no_duplicate_consciousness: true,
      modules_are_views_not_thought_sources: true,
      kernel_brain_can_present_or_drive_same_core_state: true,
      epistemic_kernel_remains_live_owner: true,
      no_truth_promotion: true,
      no_belief_movement: true,
      no_silent_canonical_mutation: true,
      belief_movement: 'none'
    };
  }

  function ensureUnifiedCore(epistemicKernel) {
    if (!epistemicKernel || typeof epistemicKernel !== 'object') throw new Error('epistemic_kernel_required');
    if (!epistemicKernel.state || typeof epistemicKernel.state !== 'object') epistemicKernel.state = {};
    if (!epistemicKernel.state.unifiedCore || typeof epistemicKernel.state.unifiedCore !== 'object') {
      epistemicKernel.state.unifiedCore = requireKernelBrain().createState({
        state_type: 'shared_epistemic_kernel_unified_core',
        version: 'shared_epistemic_kernel_kernel_brain_v0_1'
      });
    }
    return epistemicKernel.state.unifiedCore;
  }

  function normalizeSharedState(state) {
    const brain = requireKernelBrain();
    const fresh = brain.createState({ state_type: 'shared_epistemic_kernel_unified_core' });
    Object.keys(fresh).forEach(key => {
      if (state[key] === undefined) state[key] = clone(fresh[key]);
    });
    state.state_type = 'shared_epistemic_kernel_unified_core';
    state.bridge_version = VERSION;
    state.bridge_doctrine = bridgeDoctrine();
    state.doctrine = Object.assign({}, state.doctrine || {}, bridgeDoctrine(), {
      brain_owns_unified_core: true,
      kernel_brain_owns_internal_state: true,
      modules_are_views_not_thought_sources: true,
      meaning_claim_relation_pressure_admission_live_inside_brain: true,
      belief_movement: 'none'
    });
    state.receptors = asArray(state.receptors).length ? state.receptors : clone(fresh.receptors || []);
    state.runtimeEvents = asArray(state.runtimeEvents);
    state.interpretations = asArray(state.interpretations);
    state.meaningNodes = asArray(state.meaningNodes);
    state.claimNodes = asArray(state.claimNodes);
    state.evidenceNodes = asArray(state.evidenceNodes);
    state.relationEdges = asArray(state.relationEdges);
    state.admissionProposals = asArray(state.admissionProposals);
    state.beliefCommitments = asArray(state.beliefCommitments);
    state.externalReports = asArray(state.externalReports);
    state.graph = state.graph && typeof state.graph === 'object' ? state.graph : { nodes: [], links: [] };
    state.graph.nodes = asArray(state.graph.nodes);
    state.graph.links = asArray(state.graph.links);
    state.eventIndex = state.eventIndex && typeof state.eventIndex === 'object' ? state.eventIndex : {};
    state.stats = Object.assign({}, fresh.stats || {}, state.stats || {});
    state.pressureState = Object.assign({}, fresh.pressureState || {}, state.pressureState || {});
    state.updated_at = now();
    state.bridge = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      bound_at: now(),
      binding_mode: 'shared_reference_not_copy',
      one_backing_state: true,
      duplicate_consciousness: false,
      belief_movement: 'none'
    };
    return state;
  }

  function makeBoundBrain(epistemicKernel, sharedState) {
    const brain = requireKernelBrain();
    const bound = {
      state: sharedState,
      epistemicKernel,
      binding_mode: 'shared_reference_not_copy',
      bridge_version: VERSION,
      ingest(input, meta = {}) {
        const event = brain.ingest(sharedState, input, Object.assign({ source: 'bound_kernel_brain_v0_4' }, meta));
        sharedState.bridge.last_writer = 'KernelBrainV04.bound.ingest';
        sharedState.bridge.last_event_id = event && event.id;
        sharedState.bridge.updated_at = now();
        return event;
      },
      proposeAdmissions() {
        sharedState.bridge.last_writer = 'KernelBrainV04.bound.proposeAdmissions';
        sharedState.bridge.updated_at = now();
        brain.tick(sharedState, 'bound_propose_admissions_reference_only');
        return sharedState.admissionProposals;
      },
      tick(reason = 'bound_tick') {
        const summary = brain.tick(sharedState, reason);
        sharedState.bridge.last_writer = 'KernelBrainV04.bound.tick';
        sharedState.bridge.updated_at = now();
        return summary;
      },
      snapshot() {
        brain.tick(sharedState, 'bound_snapshot');
        return clone(sharedState);
      },
      process(input, options = {}) {
        const report = brain.process(input, Object.assign({}, options, { brain: bound }));
        sharedState.bridge.last_writer = 'KernelBrainV04.bound.process';
        sharedState.bridge.updated_at = now();
        return report;
      }
    };
    return bound;
  }

  function bind(epistemicKernel, options = {}) {
    const state = normalizeSharedState(ensureUnifiedCore(epistemicKernel));
    const boundBrain = makeBoundBrain(epistemicKernel, state);
    epistemicKernel.kernelBrainV04 = boundBrain;
    epistemicKernel.state.kernelBrainV04Bridge = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      bound_at: now(),
      binding_mode: 'shared_reference_not_copy',
      one_backing_state: true,
      duplicate_consciousness: false,
      kernel_brain_state_is_epistemic_unified_core: boundBrain.state === epistemicKernel.state.unifiedCore,
      options_snapshot: clone(options),
      belief_movement: 'none'
    };
    if (typeof epistemicKernel.unifiedTick === 'function') epistemicKernel.unifiedTick('kernel_brain_bridge_bound');
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      ok: true,
      bound_at: now(),
      binding_mode: 'shared_reference_not_copy',
      one_backing_state: true,
      duplicate_consciousness: false,
      kernel_brain_state_is_epistemic_unified_core: boundBrain.state === epistemicKernel.state.unifiedCore,
      bound_brain: boundBrain,
      shared_state: state,
      doctrine: bridgeDoctrine(),
      final_authority: false,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function validateBinding(epistemicKernel, boundBrain) {
    const errors = [];
    if (!epistemicKernel || !epistemicKernel.state) errors.push('missing_epistemic_kernel_state');
    if (!boundBrain || !boundBrain.state) errors.push('missing_bound_brain_state');
    if (epistemicKernel && boundBrain && epistemicKernel.state && boundBrain.state !== epistemicKernel.state.unifiedCore) errors.push('not_same_state_reference');
    const state = boundBrain && boundBrain.state;
    if (state && state.bridge && state.bridge.binding_mode !== 'shared_reference_not_copy') errors.push('binding_mode_not_reference');
    if (state && asArray(state.beliefCommitments).length !== 0) errors.push('belief_commitments_present');
    if (state && asArray(state.runtimeEvents).some(e => e.belief_movement !== 'none' || e.truth_status !== 'not_adjudicated')) errors.push('unsafe_runtime_event');
    if (state && asArray(state.admissionProposals).some(a => a.canonical_mutation_performed !== false || a.belief_movement !== 'none')) errors.push('unsafe_admission_proposal');
    return {
      packet_type: '42ndMind_kernel_brain_epistemic_kernel_bridge_validation_v0_1',
      packet_version: VERSION,
      ok: errors.length === 0,
      errors,
      checks: {
        same_state_reference: !!(epistemicKernel && boundBrain && epistemicKernel.state && boundBrain.state === epistemicKernel.state.unifiedCore),
        binding_mode_reference: !!(state && state.bridge && state.bridge.binding_mode === 'shared_reference_not_copy'),
        one_backing_state: !!(state && state.bridge && state.bridge.one_backing_state === true),
        duplicate_consciousness_false: !!(state && state.bridge && state.bridge.duplicate_consciousness === false),
        no_belief_commitments: !!(state && asArray(state.beliefCommitments).length === 0),
        no_truth_promotion: !!(state && asArray(state.runtimeEvents).every(e => e.truth_status === 'not_adjudicated')),
        no_canonical_mutation: !!(state && asArray(state.admissionProposals).every(a => a.canonical_mutation_performed === false)),
        belief_movement_none: !!(state && asArray(state.runtimeEvents).every(e => e.belief_movement === 'none') && asArray(state.admissionProposals).every(a => a.belief_movement === 'none'))
      },
      belief_movement: 'none'
    };
  }

  global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    bridgeDoctrine,
    ensureUnifiedCore,
    normalizeSharedState,
    bind,
    validateBinding
  });
})(typeof window !== 'undefined' ? window : globalThis);
