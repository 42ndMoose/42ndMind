/* 42ndMind Intention Necessity Test v0.1
 * Tests refined intention concept-shapes by removing one dimension at a time.
 *
 * This is not real-world intent attribution and not a belief/world-model ledger.
 * It checks whether a dimension appears necessary, boundary-preserving,
 * derivative/expression-level, or unresolved under deterministic contrast pressure.
 *
 * Core doctrine:
 * intention_type = 1
 * every surviving counterfactual shape remains Σ |dimension_i| = 1
 * force/intensity remains separate from shape
 * necessity findings are candidate discoveries, not doctrine
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_necessity_test_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }

  function refinementApi() {
    if (!global.KernelIntentionRefinementV01) throw new Error('KernelIntentionRefinementV01 unavailable');
    return global.KernelIntentionRefinementV01;
  }

  function doctrine() {
    return {
      tests_intention_concepts_not_claim_facts: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      necessity_findings_are_candidate_not_doctrine: true,
      removal_tests_are_counterfactual_structure_pressure: true,
      counterfactual_shapes_preserve_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_remains_separate_from_shape: true,
      unit_total_growth_is_subdivision_not_mass_inflation: true,
      belief_movement: 'none'
    };
  }

  function necessitySuites() {
    return {
      desire: {
        concept: 'desire',
        removal_effects: {
          recognized_gap_or_absence: { result: 'concept_collapses', necessity_class: 'necessary_core', neighbor_shift: 'preference_or_valuation_without_lack', explanation: 'Without a represented gap or absence, desire loses the lack-current-state contrast that makes preferred-state pull intelligible.' },
          preferred_possible_state: { result: 'concept_collapses', necessity_class: 'necessary_core', neighbor_shift: 'undirected_lack_or_discomfort', explanation: 'Without a preferred possible state, the structure can remain lack or discomfort but no longer forms desire.' },
          valuation_of_preferred_state: { result: 'concept_shifts_to_neighbor', necessity_class: 'necessary_core', neighbor_shift: 'curiosity_or_abstract_goal_state', explanation: 'Without positive valuation, the target may be represented but lacks desire’s value-bearing pull.' },
          attainment_pull: { result: 'concept_shifts_to_neighbor', necessity_class: 'necessary_core', neighbor_shift: 'preference', explanation: 'Without attainment pull, the structure can rank or prefer but does not press as desire.' },
          constraint_contact: { result: 'concept_remains_boundary_weakened', necessity_class: 'boundary_condition', neighbor_shift: 'fantasy_or_unbounded_want', explanation: 'Desire remains possible, but without constraint contact it loses boundary realism and may drift toward fantasy or unbounded want.' },
          action_or_attention_orientation: { result: 'concept_remains_expression_weakened', necessity_class: 'derivative_expression', neighbor_shift: 'latent_desire', explanation: 'Desire can exist without action, but losing orientation weakens its expression in attention, planning, or behavior.' }
        }
      },
      lying: {
        concept: 'lying',
        removal_effects: {
          proposition_representation: { result: 'concept_collapses', necessity_class: 'necessary_core', neighbor_shift: 'nonpropositional_signal', explanation: 'Without represented content, there is no proposition to falsely assert, imply, or conceal.' },
          communicative_assertion_act: { result: 'concept_collapses', necessity_class: 'necessary_core', neighbor_shift: 'private_false_belief_or_unspoken_deception_plan', explanation: 'Without communicative assertion or implication, the structure lacks the speech/sign act that makes lying occur.' },
          belief_assertion_mismatch: { result: 'concept_shifts_to_neighbor', necessity_class: 'necessary_core', neighbor_shift: 'mistake', explanation: 'Without mismatch between asserted content and belief/knowledge/warranted confidence, false assertion becomes mistake or error, not lying.' },
          audience_belief_update_target: { result: 'concept_shifts_to_neighbor', necessity_class: 'necessary_core', neighbor_shift: 'fiction_roleplay_or_private_expression', explanation: 'Without targeting another mind’s acceptance, the structure loses the deception-oriented update pressure.' },
          concealment_of_mismatch: { result: 'concept_shifts_to_neighbor', necessity_class: 'necessary_core', neighbor_shift: 'fiction_joke_roleplay_or_marked_uncertainty', explanation: 'Without concealment of mismatch, nonliteral or uncertain frames can block lying.' },
          advantage_avoidance_or_control_pressure: { result: 'concept_remains_expression_weakened', necessity_class: 'derivative_expression', neighbor_shift: 'bare_deceptive_assertion', explanation: 'A lie may have many motives or weak motive clarity; motive/function pressure is not the essence of lying.' }
        }
      },
      promise: {
        concept: 'promise',
        removal_effects: {
          future_action_or_state_commitment: { result: 'concept_collapses', necessity_class: 'necessary_core', neighbor_shift: 'present_statement_or_preference', explanation: 'Without commitment to a future action/state/restraint, the promise form collapses.' },
          speaker_ownership_of_commitment: { result: 'concept_shifts_to_neighbor', necessity_class: 'necessary_core', neighbor_shift: 'prediction_or_external_expectation', explanation: 'Without speaker-owned commitment, the utterance becomes prediction, hope, or report about expected future.' },
          recipient_reliance_invitation: { result: 'concept_shifts_to_neighbor', necessity_class: 'necessary_core', neighbor_shift: 'private_intention_or_plan', explanation: 'Without inviting reliance, the act can remain a plan or intention but loses promise’s interpersonal commitment structure.' },
          normative_obligation_creation: { result: 'concept_collapses', necessity_class: 'necessary_core', neighbor_shift: 'plan_or_preference', explanation: 'Without obligation/accountability creation, promise loses its normative binding force.' },
          condition_or_scope_boundary: { result: 'concept_remains_boundary_weakened', necessity_class: 'boundary_condition', neighbor_shift: 'vague_or_unbounded_promise', explanation: 'Promise can remain, but without scope boundaries it becomes vague and harder to evaluate.' },
          breach_meaning_if_failed: { result: 'concept_remains_expression_weakened', necessity_class: 'derivative_expression', neighbor_shift: 'implicit_accountability_only', explanation: 'Breach meaning follows from obligation; removing explicit breach semantics does not destroy the promise concept.' }
        }
      }
    };
  }

  function normalizeShapeWithout(shape, removedDimension) {
    const raw = {};
    Object.entries(shape || {}).forEach(([name, weight]) => {
      if (name !== removedDimension) raw[name] = Number(weight) || 0;
    });
    const entries = Object.entries(raw).filter(([name]) => text(name));
    if (!entries.length) return { shape: {}, l1_total: 0, unit_total_error: 1, empty_after_removal: true, belief_movement: 'none' };
    const total = entries.reduce((sum, [, value]) => sum + Math.abs(Number(value) || 0), 0) || 1;
    const next = {};
    entries.forEach(([name, value], index) => {
      const n = Number(value) || 0;
      if (index === entries.length - 1) {
        const prior = Object.values(next).reduce((sum, v) => sum + Math.abs(Number(v) || 0), 0);
        const sign = n < 0 ? -1 : 1;
        next[name] = Number((sign * Math.max(0, 1 - prior)).toFixed(6));
      } else {
        next[name] = Number((n / total).toFixed(6));
      }
    });
    const l1 = Number(Object.values(next).reduce((sum, value) => sum + Math.abs(Number(value) || 0), 0).toFixed(6));
    return { shape: next, l1_total: l1, unit_total_error: Number(Math.abs(1 - l1).toFixed(6)), empty_after_removal: false, belief_movement: 'none' };
  }

  function defaultEffectForRole(role, dimension) {
    if (role === 'core_shape') {
      return { result: 'concept_shifts_or_collapses', necessity_class: 'candidate_necessary_core', neighbor_shift: 'unknown_neighbor', explanation: `${dimension} is marked core, so removal is treated as collapse/neighbor-shift pressure until contradicted.` };
    }
    if (role === 'boundary_shape') {
      return { result: 'concept_remains_boundary_weakened', necessity_class: 'boundary_condition', neighbor_shift: 'unbounded_or_vague_variant', explanation: `${dimension} is marked boundary, so removal weakens scope without automatically destroying the concept.` };
    }
    if (role === 'expression_or_derivative_shape') {
      return { result: 'concept_remains_expression_weakened', necessity_class: 'derivative_expression', neighbor_shift: 'latent_or_less_expressed_variant', explanation: `${dimension} is marked expression/derivative, so removal weakens expression without destroying the concept.` };
    }
    return { result: 'unresolved', necessity_class: 'unresolved', neighbor_shift: 'unknown', explanation: `${dimension} is not yet classified with enough pressure.` };
  }

  function testDimension(refinement, row, suite) {
    const concept = text(refinement && refinement.concept);
    const dimension = text(row && row.dimension);
    const role = text(row && row.refined_role);
    const refinedShape = refinement && refinement.refined_shape && refinement.refined_shape.shape || {};
    const effect = (suite && suite.removal_effects && suite.removal_effects[dimension]) || defaultEffectForRole(role, dimension);
    const counterfactual = normalizeShapeWithout(refinedShape, dimension);
    return {
      concept,
      dimension,
      refined_role: role,
      removal_result: effect.result,
      necessity_class: effect.necessity_class,
      neighbor_shift: effect.neighbor_shift,
      explanation: effect.explanation,
      counterfactual_shape_after_removal: counterfactual,
      unit_total_preserved_after_removal: !counterfactual.empty_after_removal && Math.abs(1 - Number(counterfactual.l1_total || 0)) <= EPSILON,
      doctrine_status: 'candidate_necessity_finding_not_doctrine',
      belief_movement: 'none'
    };
  }

  function testRefinement(refinement, suite) {
    const concept = text(refinement && refinement.concept);
    const rows = asArray(refinement && refinement.dimension_classifications).filter(row => row.retained_in_refined_shape === true);
    const tests = rows.map(row => testDimension(refinement, row, suite || necessitySuites()[concept]));
    const errors = [];
    if (!concept) errors.push('missing_concept');
    if (!tests.length) errors.push('missing_dimension_tests');
    tests.forEach(test => {
      if (test.counterfactual_shape_after_removal.empty_after_removal) return;
      if (!test.unit_total_preserved_after_removal) errors.push(`unit_total_not_preserved_after_removing:${test.dimension}`);
      if (test.belief_movement !== 'none') errors.push(`belief_movement_not_none:${test.dimension}`);
    });
    const necessaryCore = tests.filter(t => String(t.necessity_class).includes('necessary_core'));
    const boundary = tests.filter(t => t.necessity_class === 'boundary_condition');
    const derivative = tests.filter(t => t.necessity_class === 'derivative_expression');
    return {
      packet_type: '42ndMind_intention_necessity_candidate_v0_1',
      packet_version: VERSION,
      created_at: now(),
      concept,
      source_refined_review_status: text(refinement && refinement.refined_review_status),
      necessity_review_status: 'necessity_candidate_not_doctrine',
      source_refined_shape: clone(refinement && refinement.refined_shape || {}),
      dimension_tests: tests,
      necessary_core_dimensions: necessaryCore.map(t => t.dimension),
      boundary_dimensions: boundary.map(t => t.dimension),
      derivative_expression_dimensions: derivative.map(t => t.dimension),
      unresolved_dimensions: tests.filter(t => t.necessity_class === 'unresolved').map(t => t.dimension),
      summary: {
        dimension_test_count: tests.length,
        necessary_core_count: necessaryCore.length,
        boundary_count: boundary.length,
        derivative_expression_count: derivative.length,
        unit_total_counterfactuals_ok: tests.every(t => t.counterfactual_shape_after_removal.empty_after_removal || t.unit_total_preserved_after_removal === true),
        belief_movement: 'none'
      },
      ok: errors.length === 0,
      errors,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function validateNecessityCandidate(candidate) {
    const errors = [];
    if (!text(candidate && candidate.concept)) errors.push('missing_concept');
    if (candidate && candidate.necessity_review_status !== 'necessity_candidate_not_doctrine') errors.push('promoted_to_doctrine');
    if (candidate && candidate.belief_movement !== 'none') errors.push('belief_movement_not_none');
    const tests = asArray(candidate && candidate.dimension_tests);
    if (!tests.length) errors.push('missing_dimension_tests');
    tests.forEach(test => {
      const cf = test.counterfactual_shape_after_removal || {};
      if (!cf.empty_after_removal && Math.abs(1 - Number(cf.l1_total || 0)) > EPSILON) errors.push(`counterfactual_l1_error:${test.dimension}:${cf.l1_total}`);
      if (test.doctrine_status !== 'candidate_necessity_finding_not_doctrine') errors.push(`finding_promoted:${test.dimension}`);
      if (test.belief_movement !== 'none') errors.push(`test_belief_movement_not_none:${test.dimension}`);
    });
    if (!asArray(candidate && candidate.necessary_core_dimensions).length) errors.push('missing_necessary_core_dimensions');
    return {
      concept: text(candidate && candidate.concept),
      ok: errors.length === 0 && candidate && candidate.ok === true,
      errors: errors.concat(asArray(candidate && candidate.errors)),
      dimension_test_count: tests.length,
      necessary_core_count: asArray(candidate && candidate.necessary_core_dimensions).length,
      boundary_count: asArray(candidate && candidate.boundary_dimensions).length,
      derivative_expression_count: asArray(candidate && candidate.derivative_expression_dimensions).length,
      unresolved_count: asArray(candidate && candidate.unresolved_dimensions).length,
      belief_movement: 'none'
    };
  }

  function runNecessityTests(options = {}) {
    const refinement = options.refinement_packet || refinementApi().runRefinement(options.refinement_options || {});
    const suites = Object.assign({}, necessitySuites(), options.necessity_suites || {});
    const candidates = asArray(refinement && refinement.refinements).map(refined => testRefinement(refined, suites[refined.concept]));
    const validations = candidates.map(validateNecessityCandidate);
    const errors = [];
    validations.forEach(v => { if (!v.ok) errors.push(`${v.concept}:${v.errors.join('|')}`); });
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Necessity tests for refined candidate intention concept-shapes. Candidate only; not doctrine; no real-world intent attribution.',
      source_refinement_ok: refinement && refinement.ok === true,
      necessity_candidate_count: candidates.length,
      candidates,
      validation: {
        packet_type: '42ndMind_intention_necessity_validation_v0_1',
        packet_version: VERSION,
        created_at: now(),
        ok: errors.length === 0 && refinement && refinement.ok === true,
        necessity_candidate_count: candidates.length,
        validations,
        errors,
        belief_movement: 'none'
      },
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionNecessityTestV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    necessitySuites,
    normalizeShapeWithout,
    defaultEffectForRole,
    testDimension,
    testRefinement,
    validateNecessityCandidate,
    runNecessityTests
  });
})(typeof window !== 'undefined' ? window : globalThis);