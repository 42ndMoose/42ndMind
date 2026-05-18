/* 42ndMind Intention Concept Expansion Loop v0.1
 * Expands the objective intention-language workbench beyond the initial
 * desire / lying / promise seed set.
 *
 * This module adds candidate concepts, builds compatible refinement and
 * necessity suites, runs lattice/invariance checks, and compiles formulas.
 * It does not attribute intent to real people and does not promote doctrine.
 *
 * Core doctrine:
 * concept expansion is candidate only
 * each concept has local scope total = 1
 * force/intensity remains outside shape: F = M · i
 * no person/event/narrative belief ledger
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_concept_expansion_loop_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'concept'; }

  function discoveryApi() { if (!global.KernelIntentionDiscoveryV01) throw new Error('KernelIntentionDiscoveryV01 unavailable'); return global.KernelIntentionDiscoveryV01; }
  function refinementApi() { if (!global.KernelIntentionRefinementV01) throw new Error('KernelIntentionRefinementV01 unavailable'); return global.KernelIntentionRefinementV01; }
  function necessityApi() { if (!global.KernelIntentionNecessityTestV01) throw new Error('KernelIntentionNecessityTestV01 unavailable'); return global.KernelIntentionNecessityTestV01; }
  function latticeApi() { if (!global.KernelIntentionNeighborLatticeV01) throw new Error('KernelIntentionNeighborLatticeV01 unavailable'); return global.KernelIntentionNeighborLatticeV01; }
  function invarianceApi() { if (!global.KernelIntentionLatticeInvarianceBenchmarkV01) throw new Error('KernelIntentionLatticeInvarianceBenchmarkV01 unavailable'); return global.KernelIntentionLatticeInvarianceBenchmarkV01; }
  function compilerApi() { if (!global.KernelIntentionFormulaCompilerV01) throw new Error('KernelIntentionFormulaCompilerV01 unavailable'); return global.KernelIntentionFormulaCompilerV01; }

  function doctrine() {
    return {
      expands_intention_concepts_not_claim_facts: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      expanded_concepts_are_candidate_not_doctrine: true,
      concept_scope_total: 1,
      local_shape_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      expansion_must_pass_discovery_refinement_necessity_lattice_invariance_compiler: true,
      belief_movement: 'none'
    };
  }

  function blueprints() {
    return [
      bp('consent', ['agent_capacity', 'informed_understanding', 'voluntary_authorization'], ['scope_boundary'], ['communicative_signal'], 'pressure_level', ['assent', 'coercion', 'permission'], {
        agent_capacity: ['concept_collapses', 'necessary_core', 'invalid_consent'],
        informed_understanding: ['concept_shifts_to_neighbor', 'necessary_core', 'uninformed_assent'],
        voluntary_authorization: ['concept_shifts_to_neighbor', 'necessary_core', 'coercion'],
        scope_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'overbroad_consent'],
        communicative_signal: ['concept_remains_expression_weakened', 'derivative_expression', 'private_willingness']
      }),
      bp('threat', ['conditional_harm_proposition', 'agency_or_control_claim', 'compliance_pressure_target'], ['credibility_boundary'], ['fear_activation'], 'harm_severity', ['warning', 'request', 'coercion'], {
        conditional_harm_proposition: ['concept_collapses', 'necessary_core', 'nonthreatening_statement'],
        agency_or_control_claim: ['concept_shifts_to_neighbor', 'necessary_core', 'warning'],
        compliance_pressure_target: ['concept_shifts_to_neighbor', 'necessary_core', 'warning'],
        credibility_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'empty_threat'],
        fear_activation: ['concept_remains_expression_weakened', 'derivative_expression', 'cold_threat']
      }),
      bp('request', ['desired_action_from_other', 'uptake_invitation', 'noncoercive_address'], ['context_boundary'], ['reason_giving'], 'urgency', ['command', 'demand', 'private_wish'], {
        desired_action_from_other: ['concept_collapses', 'necessary_core', 'social_contact'],
        uptake_invitation: ['concept_shifts_to_neighbor', 'necessary_core', 'private_wish'],
        noncoercive_address: ['concept_shifts_to_neighbor', 'necessary_core', 'demand'],
        context_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'vague_request'],
        reason_giving: ['concept_remains_expression_weakened', 'derivative_expression', 'bare_request']
      }),
      bp('refusal', ['rejected_proposition_or_action', 'boundary_assertion', 'withholding_authorization'], ['scope_boundary'], ['explanation_signal'], 'firmness', ['acceptance', 'hesitation', 'silence'], {
        rejected_proposition_or_action: ['concept_collapses', 'necessary_core', 'neutral_response'],
        boundary_assertion: ['concept_shifts_to_neighbor', 'necessary_core', 'hesitation'],
        withholding_authorization: ['concept_shifts_to_neighbor', 'necessary_core', 'consent'],
        scope_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'blanket_refusal'],
        explanation_signal: ['concept_remains_expression_weakened', 'derivative_expression', 'bare_no']
      }),
      bp('trust', ['reliance_placement', 'positive_expectation', 'vulnerability_acceptance'], ['scope_boundary'], ['openness_signal'], 'confidence', ['hope', 'optimism', 'prediction'], {
        reliance_placement: ['concept_shifts_to_neighbor', 'necessary_core', 'optimism'],
        positive_expectation: ['concept_shifts_to_neighbor', 'necessary_core', 'guarded_reliance'],
        vulnerability_acceptance: ['concept_shifts_to_neighbor', 'necessary_core', 'mere_prediction'],
        scope_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'naive_trust'],
        openness_signal: ['concept_remains_expression_weakened', 'derivative_expression', 'latent_trust']
      }),
      bp('betrayal', ['prior_trust_relation', 'violated_expectation', 'harmful_disloyal_action'], ['obligation_scope'], ['felt_injury'], 'injury_severity', ['disappointment', 'mistake', 'harm'], {
        prior_trust_relation: ['concept_shifts_to_neighbor', 'necessary_core', 'harm'],
        violated_expectation: ['concept_shifts_to_neighbor', 'necessary_core', 'disappointment'],
        harmful_disloyal_action: ['concept_shifts_to_neighbor', 'necessary_core', 'mistake'],
        obligation_scope: ['concept_remains_boundary_weakened', 'boundary_condition', 'ambiguous_betrayal'],
        felt_injury: ['concept_remains_expression_weakened', 'derivative_expression', 'unfelt_betrayal']
      }),
      bp('doubt', ['proposition_under_consideration', 'uncertainty_pressure', 'withheld_closure'], ['evidence_gap_boundary'], ['questioning_orientation'], 'doubt_intensity', ['belief', 'curiosity', 'suspicion'], {
        proposition_under_consideration: ['concept_collapses', 'necessary_core', 'vague_anxiety'],
        uncertainty_pressure: ['concept_shifts_to_neighbor', 'necessary_core', 'belief'],
        withheld_closure: ['concept_shifts_to_neighbor', 'necessary_core', 'belief'],
        evidence_gap_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'open_ended_doubt'],
        questioning_orientation: ['concept_remains_expression_weakened', 'derivative_expression', 'latent_doubt']
      }),
      bp('belief', ['proposition_representation', 'acceptance_as_true', 'stability_of_commitment'], ['confidence_boundary'], ['action_readiness'], 'confidence', ['hypothesis', 'doubt', 'assumption'], {
        proposition_representation: ['concept_collapses', 'necessary_core', 'attitude_without_content'],
        acceptance_as_true: ['concept_shifts_to_neighbor', 'necessary_core', 'hypothesis'],
        stability_of_commitment: ['concept_shifts_to_neighbor', 'necessary_core', 'assumption'],
        confidence_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'overconfident_belief'],
        action_readiness: ['concept_remains_expression_weakened', 'derivative_expression', 'inactive_belief']
      }),
      bp('fear', ['anticipated_harm', 'vulnerability_representation', 'protective_avoidance_orientation'], ['probability_boundary'], ['arousal_expression'], 'fear_intensity', ['concern', 'anxiety', 'caution'], {
        anticipated_harm: ['concept_collapses', 'necessary_core', 'arousal_without_threat'],
        vulnerability_representation: ['concept_shifts_to_neighbor', 'necessary_core', 'concern'],
        protective_avoidance_orientation: ['concept_shifts_to_neighbor', 'necessary_core', 'anxiety'],
        probability_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'free_floating_fear'],
        arousal_expression: ['concept_remains_expression_weakened', 'derivative_expression', 'cold_fear']
      }),
      bp('coercion', ['constrained_choice', 'external_pressure_source', 'penalty_or_threat_condition'], ['escape_cost_boundary'], ['compliance_behavior'], 'pressure_magnitude', ['persuasion', 'threat', 'voluntary_choice'], {
        constrained_choice: ['concept_shifts_to_neighbor', 'necessary_core', 'voluntary_choice'],
        external_pressure_source: ['concept_shifts_to_neighbor', 'necessary_core', 'internal_conflict'],
        penalty_or_threat_condition: ['concept_shifts_to_neighbor', 'necessary_core', 'persuasion'],
        escape_cost_boundary: ['concept_remains_boundary_weakened', 'boundary_condition', 'soft_coercion'],
        compliance_behavior: ['concept_remains_expression_weakened', 'derivative_expression', 'resisted_coercion']
      }),
      bp('manipulation', ['hidden_influence_strategy', 'target_autonomy_bypass', 'outcome_control_intent'], ['information_asymmetry'], ['framing_or_emotional_leverage'], 'influence_strength', ['persuasion', 'advice', 'coercion'], {
        hidden_influence_strategy: ['concept_shifts_to_neighbor', 'necessary_core', 'persuasion'],
        target_autonomy_bypass: ['concept_shifts_to_neighbor', 'necessary_core', 'advice'],
        outcome_control_intent: ['concept_shifts_to_neighbor', 'necessary_core', 'influence'],
        information_asymmetry: ['concept_remains_boundary_weakened', 'boundary_condition', 'transparent_influence'],
        framing_or_emotional_leverage: ['concept_remains_expression_weakened', 'derivative_expression', 'plain_manipulation']
      })
    ];
  }

  function bp(concept, core, boundary, expression, force, contrasts, effects) {
    return { concept, core, boundary, expression, force, contrasts, effects };
  }

  function dimensionDescription(concept, dimension, role) {
    return `${dimension} is a ${role} dimension candidate for the objective intention concept ${concept}.`;
  }

  function buildDiscoverySeeds(concepts) {
    return asArray(concepts || blueprints()).map(b => ({
      concept: b.concept,
      question: `What invariant structure makes ${b.concept} ${b.concept} before evaluating any real-world person or event?`,
      raw_dimensions: b.core.map(name => ({ name, role: 'shape', description: dimensionDescription(b.concept, name, 'core-shape') }))
        .concat(b.boundary.map(name => ({ name, role: 'shape', description: dimensionDescription(b.concept, name, 'boundary-shape') })))
        .concat(b.expression.map(name => ({ name, role: 'shape', description: dimensionDescription(b.concept, name, 'expression/derivative-shape') })))
        .concat([{ name: b.force, role: 'force', description: `${b.force} is force/intensity for ${b.concept}, not a shape dimension.` }]),
      contrasts: b.contrasts,
      exclusion_frames: [`not_${b.concept}`, `${b.concept}_without_required_core`, `${b.concept}_with_force_confused_as_shape`],
      minimal_pairs: b.contrasts.slice(0, 3).map(neighbor => ({ pair: `${b.concept}_vs_${neighbor}`, pressure: `${b.concept} must remain structurally separated from ${neighbor}.` }))
    }));
  }

  function buildRefinementSuites(concepts) {
    const out = {};
    asArray(concepts || blueprints()).forEach(b => {
      out[b.concept] = {
        concept: b.concept,
        core_dimensions: clone(b.core),
        boundary_dimensions: clone(b.boundary),
        expression_dimensions: clone(b.expression),
        force_dimensions: [b.force],
        rejected_shape_dimensions: [],
        contrast_findings: b.contrasts.map(neighbor => ({ contrast: neighbor, finding: `${b.concept} must not collapse into ${neighbor} under contrast pressure.` })),
        refinement_notes: [`${b.force} remains force/intensity outside ${b.concept}_i.`]
      };
    });
    return out;
  }

  function buildNecessitySuites(concepts) {
    const out = {};
    asArray(concepts || blueprints()).forEach(b => {
      const removal_effects = {};
      Object.entries(b.effects || {}).forEach(([dimension, tuple]) => {
        removal_effects[dimension] = {
          result: tuple[0],
          necessity_class: tuple[1],
          neighbor_shift: tuple[2],
          explanation: `Removing ${dimension} from ${b.concept} creates ${tuple[0]} toward ${tuple[2]}.`
        };
      });
      out[b.concept] = { concept: b.concept, removal_effects };
    });
    return out;
  }

  function buildInvarianceCases(concepts) {
    return asArray(concepts || blueprints()).map(b => {
      const firstCore = b.core[0];
      const firstEffect = b.effects[firstCore];
      return {
        id: `${b.concept}_${firstCore}_expansion_invariance`,
        case_type: 'expansion_direct_relation',
        concept_alias: b.concept,
        dimension_alias: firstCore,
        neighbor_alias: firstEffect[2],
        expected: { concept: b.concept, dimension: firstCore, neighbor: firstEffect[2] }
      };
    });
  }

  function validateExpansionPacket(packet) {
    const errors = [];
    if (!packet || packet.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (!packet || !packet.compiled_packet || packet.compiled_packet.ok !== true) errors.push('compiled_packet_not_ok');
    if (!packet || packet.expanded_concept_count !== 11) errors.push(`unexpected_expanded_concept_count:${packet && packet.expanded_concept_count}`);
    asArray(packet && packet.compiled_packet && packet.compiled_packet.compiled_formulas).forEach(formula => {
      if (formula.review_status !== 'compiled_candidate_not_doctrine') errors.push(`formula_promoted:${formula.concept}`);
      const l1 = Number(asArray(formula.shape_terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
      if (l1 !== 1) errors.push(`formula_l1_not_1:${formula.concept}:${l1}`);
      asArray(formula.force_terms).forEach(force => {
        if (asArray(formula.shape_terms).some(term => safeId(term.dimension) === safeId(force.dimension))) errors.push(`force_leaked:${formula.concept}:${force.dimension}`);
      });
    });
    return {
      packet_type: '42ndMind_intention_concept_expansion_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      errors,
      belief_movement: 'none'
    };
  }

  function runExpansion(options = {}) {
    const concepts = asArray(options.blueprints || blueprints());
    const discovery = discoveryApi().runDiscovery({ concepts: buildDiscoverySeeds(concepts), limit: concepts.length });
    const refinement = refinementApi().runRefinement({ discovery_packet: discovery, refinement_suites: buildRefinementSuites(concepts) });
    const necessity = necessityApi().runNecessityTests({ refinement_packet: refinement, necessity_suites: buildNecessitySuites(concepts) });
    const lattice = latticeApi().runLattice({ necessity_packet: necessity });
    const invariance = invarianceApi().runBenchmark({ lattice_packet: lattice, cases: buildInvarianceCases(concepts) });
    const compiled = compilerApi().runCompiler({ discovery_packet: discovery, refinement_packet: refinement, necessity_packet: necessity, lattice_packet: lattice, invariance_packet: invariance });
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Candidate expansion loop for objective intention-language concepts. Adds concepts through discovery/refinement/necessity/lattice/invariance/compiler pipeline. Not doctrine; no real-world intent attribution.',
      expanded_concept_count: concepts.length,
      expanded_concepts: concepts.map(b => b.concept),
      source_summary: {
        discovery_ok: discovery.ok === true,
        refinement_ok: refinement.ok === true,
        necessity_ok: necessity.ok === true,
        lattice_ok: lattice.ok === true,
        invariance_ok: invariance.ok === true,
        compiler_ok: compiled.ok === true,
        belief_movement: 'none'
      },
      discovery_packet: discovery,
      refinement_packet: refinement,
      necessity_packet: necessity,
      lattice_packet: lattice,
      invariance_packet: invariance,
      compiled_packet: compiled,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validateExpansionPacket(packet);
    packet.ok = packet.validation.ok === true && Object.values(packet.source_summary).filter(v => typeof v === 'boolean').every(Boolean);
    return packet;
  }

  global.KernelIntentionConceptExpansionLoopV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    blueprints,
    buildDiscoverySeeds,
    buildRefinementSuites,
    buildNecessitySuites,
    buildInvarianceCases,
    validateExpansionPacket,
    runExpansion
  });
})(typeof window !== 'undefined' ? window : globalThis);