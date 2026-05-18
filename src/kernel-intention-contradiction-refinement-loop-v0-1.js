/* 42ndMind Intention Contradiction/Refinement Loop v0.1
 * Compares compiled intention formulas across concepts and emits candidate
 * refinement pressure without rewriting formulas or promoting doctrine.
 *
 * This is not real-world intent attribution and not a belief/world-model ledger.
 * It uses contradiction pressure as discovery hygiene for the objective
 * intention-language workbench.
 *
 * Core doctrine:
 * contradiction detection is not contradiction resolution
 * refinement suggestions are candidate actions, not doctrine
 * local concept shapes must preserve Σ |dimension_i| = 1
 * force/intensity remains outside shape: F = M · i
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_contradiction_refinement_loop_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'concept'; }

  function expansionApi() {
    if (!global.KernelIntentionConceptExpansionLoopV01) throw new Error('KernelIntentionConceptExpansionLoopV01 unavailable');
    return global.KernelIntentionConceptExpansionLoopV01;
  }

  function doctrine() {
    return {
      compares_intention_formulas_not_claim_facts: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      contradiction_detection_is_not_contradiction_resolution: true,
      refinement_actions_are_candidate_not_doctrine: true,
      does_not_rewrite_source_formulas: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function pairRules() {
    return [
      {
        id: 'consent_vs_coercion',
        concepts: ['consent', 'coercion'],
        expected_relations: [
          { from: 'consent', dimension: 'voluntary_authorization', to: 'coercion' },
          { from: 'coercion', dimension: 'constrained_choice', to: 'voluntary_choice' }
        ],
        pressure_type: 'opposition_boundary_pressure',
        refinement_action: 'Keep voluntary_authorization and constrained_choice as opposing core dimensions; do not collapse consent into coercion or coercion into consent.'
      },
      {
        id: 'request_vs_threat',
        concepts: ['request', 'threat'],
        expected_relations: [
          { from: 'request', dimension: 'noncoercive_address', to: 'demand' },
          { from: 'threat', dimension: 'compliance_pressure_target', to: 'warning' }
        ],
        pressure_type: 'coercive_boundary_pressure',
        refinement_action: 'Keep noncoercive_address separate from compliance_pressure_target; request must not hard-collapse into threat.'
      },
      {
        id: 'trust_vs_betrayal',
        concepts: ['trust', 'betrayal'],
        expected_relations: [
          { from: 'betrayal', dimension: 'prior_trust_relation', to: 'harm' },
          { from: 'trust', dimension: 'reliance_placement', to: 'optimism' }
        ],
        pressure_type: 'dependency_reversal_pressure',
        refinement_action: 'Represent betrayal as dependent on prior trust-relation pressure, not as generic harm.'
      },
      {
        id: 'belief_vs_doubt',
        concepts: ['belief', 'doubt'],
        expected_relations: [
          { from: 'doubt', dimension: 'uncertainty_pressure', to: 'belief' },
          { from: 'doubt', dimension: 'withheld_closure', to: 'belief' },
          { from: 'belief', dimension: 'acceptance_as_true', to: 'hypothesis' }
        ],
        pressure_type: 'closure_nonclosure_pressure',
        refinement_action: 'Keep acceptance_as_true and withheld_closure as inverse closure pressures; do not treat doubt as weak belief only.'
      },
      {
        id: 'fear_vs_threat',
        concepts: ['fear', 'threat'],
        expected_relations: [
          { from: 'fear', dimension: 'anticipated_harm', to: 'arousal_without_threat' },
          { from: 'threat', dimension: 'fear_activation', to: 'cold_threat' }
        ],
        pressure_type: 'internal_external_harm_pressure',
        refinement_action: 'Keep fear as internal anticipated-harm structure and threat as external conditional-harm pressure.'
      },
      {
        id: 'manipulation_vs_coercion',
        concepts: ['manipulation', 'coercion'],
        expected_relations: [
          { from: 'manipulation', dimension: 'target_autonomy_bypass', to: 'advice' },
          { from: 'coercion', dimension: 'penalty_or_threat_condition', to: 'persuasion' }
        ],
        pressure_type: 'autonomy_bypass_vs_constraint_pressure',
        refinement_action: 'Keep hidden autonomy-bypass separate from overt constraint/penalty pressure; manipulation and coercion can overlap but are not identical.'
      }
    ];
  }

  function findFormula(compiledPacket, concept) {
    const id = safeId(concept);
    return asArray(compiledPacket && compiledPacket.compiled_formulas).find(formula => safeId(formula.concept) === id) || null;
  }

  function shapeL1(formula) {
    return Number(asArray(formula && formula.shape_terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
  }

  function forceLeaks(formula) {
    const shapeNames = new Set(asArray(formula && formula.shape_terms).map(term => safeId(term.dimension)));
    return asArray(formula && formula.force_terms).filter(force => shapeNames.has(safeId(force.dimension))).map(force => force.dimension);
  }

  function relationExists(formula, target, dimension) {
    const t = safeId(target);
    const d = safeId(dimension);
    return asArray(formula && formula.neighbor_transitions).some(edge => safeId(edge.to) === t && safeId(edge.removed_dimension) === d);
  }

  function inspectFormulaIntegrity(formula) {
    const errors = [];
    const warnings = [];
    if (!formula) errors.push('missing_formula');
    if (formula && formula.review_status !== 'compiled_candidate_not_doctrine') errors.push('formula_promoted_to_doctrine');
    if (formula && formula.belief_movement !== 'none') errors.push('belief_movement_not_none');
    const l1 = formula ? shapeL1(formula) : 0;
    if (formula && Math.abs(1 - l1) > EPSILON) errors.push(`l1_not_1:${l1}`);
    const leaks = forceLeaks(formula);
    if (leaks.length) errors.push(`force_leak:${leaks.join(',')}`);
    if (formula && !asArray(formula.neighbor_transitions).length) warnings.push('no_neighbor_transitions');
    return {
      concept: text(formula && formula.concept),
      ok: errors.length === 0,
      severity: errors.length ? 'hard_error' : warnings.length ? 'warning' : 'pass',
      l1_total: l1,
      errors,
      warnings,
      force_leaks: leaks,
      review_status: text(formula && formula.review_status),
      belief_movement: 'none'
    };
  }

  function analyzePair(rule, compiledPacket) {
    const formulas = rule.concepts.map(concept => findFormula(compiledPacket, concept));
    const missing = rule.concepts.filter((concept, index) => !formulas[index]);
    const relationChecks = asArray(rule.expected_relations).map(rel => {
      const formula = findFormula(compiledPacket, rel.from);
      const exists = relationExists(formula, rel.to, rel.dimension);
      return {
        from: safeId(rel.from),
        removed_dimension: safeId(rel.dimension),
        to: safeId(rel.to),
        relation_exists: exists,
        belief_movement: 'none'
      };
    });
    const missingRelations = relationChecks.filter(row => !row.relation_exists);
    const hardErrors = [];
    if (missing.length) hardErrors.push(`missing_formula:${missing.join(',')}`);
    if (missingRelations.length) hardErrors.push(`missing_expected_relation:${missingRelations.map(r => `${r.from}-${r.removed_dimension}->${r.to}`).join(',')}`);
    return {
      id: text(rule.id),
      concepts: clone(rule.concepts),
      pressure_type: text(rule.pressure_type),
      relation_checks: relationChecks,
      contradiction_status: hardErrors.length ? 'relation_gap_detected' : 'structured_pressure_detected',
      refinement_action: text(rule.refinement_action),
      action_status: 'candidate_refinement_action_not_applied',
      severity: hardErrors.length ? 'hard_error' : 'refinement_pressure',
      errors: hardErrors,
      belief_movement: 'none'
    };
  }

  function detectDuplicateDimensionPressure(compiledPacket) {
    const dimensionMap = {};
    asArray(compiledPacket && compiledPacket.compiled_formulas).forEach(formula => {
      asArray(formula.shape_terms).forEach(term => {
        const id = safeId(term.dimension);
        if (!dimensionMap[id]) dimensionMap[id] = [];
        dimensionMap[id].push({ concept: formula.concept, role: term.role, coefficient: term.coefficient });
      });
    });
    const duplicates = Object.entries(dimensionMap).filter(([, uses]) => uses.length > 1).map(([dimension, uses]) => ({
      dimension,
      uses,
      pressure_type: 'shared_dimension_pressure',
      refinement_action: 'Check whether shared wording is true structural reuse or an overly broad dimension label.',
      action_status: 'candidate_refinement_action_not_applied',
      belief_movement: 'none'
    }));
    return {
      packet_type: '42ndMind_intention_duplicate_dimension_pressure_v0_1',
      duplicate_count: duplicates.length,
      duplicates,
      severity: duplicates.length ? 'refinement_pressure' : 'pass',
      belief_movement: 'none'
    };
  }

  function validateLoopPacket(packet) {
    const errors = [];
    if (!packet || packet.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (!packet || packet.source_expansion_ok !== true) errors.push('source_expansion_not_ok');
    asArray(packet && packet.formula_integrity).forEach(row => {
      if (!row.ok) errors.push(`formula_integrity:${row.concept}:${row.errors.join('|')}`);
    });
    asArray(packet && packet.pair_analyses).forEach(row => {
      if (row.severity === 'hard_error') errors.push(`pair_analysis:${row.id}:${row.errors.join('|')}`);
      if (row.action_status !== 'candidate_refinement_action_not_applied') errors.push(`action_auto_applied:${row.id}`);
      if (row.belief_movement !== 'none') errors.push(`pair_belief_movement:${row.id}`);
    });
    return {
      packet_type: '42ndMind_intention_contradiction_refinement_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      errors,
      belief_movement: 'none'
    };
  }

  function runLoop(options = {}) {
    const expansion = options.expansion_packet || expansionApi().runExpansion(options.expansion_options || {});
    const compiled = expansion && expansion.compiled_packet;
    const formulaIntegrity = asArray(compiled && compiled.compiled_formulas).map(inspectFormulaIntegrity);
    const pairAnalyses = asArray(options.pair_rules || pairRules()).map(rule => analyzePair(rule, compiled));
    const duplicatePressure = detectDuplicateDimensionPressure(compiled);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Contradiction/refinement pressure over compiled candidate intention formulas. Does not rewrite formulas or promote doctrine.',
      source_expansion_ok: expansion && expansion.ok === true,
      compiled_formula_count: compiled && compiled.compiled_formula_count || 0,
      formula_integrity: formulaIntegrity,
      pair_analysis_count: pairAnalyses.length,
      pair_analyses: pairAnalyses,
      duplicate_dimension_pressure: duplicatePressure,
      proposed_refinement_actions: pairAnalyses.map(row => ({
        source_pair: row.id,
        pressure_type: row.pressure_type,
        action: row.refinement_action,
        action_status: row.action_status,
        belief_movement: 'none'
      })).concat(asArray(duplicatePressure.duplicates).map(row => ({
        source_pair: 'shared_dimension_pressure',
        pressure_type: row.pressure_type,
        action: `${row.dimension}: ${row.refinement_action}`,
        action_status: row.action_status,
        belief_movement: 'none'
      }))),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validateLoopPacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionContradictionRefinementLoopV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    pairRules,
    findFormula,
    shapeL1,
    forceLeaks,
    relationExists,
    inspectFormulaIntegrity,
    analyzePair,
    detectDuplicateDimensionPressure,
    validateLoopPacket,
    runLoop
  });
})(typeof window !== 'undefined' ? window : globalThis);