/* 42ndMind Intention Formula Compiler v0.1
 * Compiles discovery/refinement/necessity/lattice/invariance outputs into
 * compact algebraic intention packets.
 *
 * This is not a real-world intent detector and not a belief/world-model ledger.
 * It does not promote final doctrine. It packages candidate objective-language
 * formulas in a cleaner symbolic form.
 *
 * Core doctrine:
 * concept scope = 1
 * core + boundary + derivative/expression shape terms remain Σ |dimension_i| = 1
 * force/intensity is outside the shape: F = M · i
 * neighbor transitions are candidate structural relations, not truth claims
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_formula_compiler_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'concept'; }

  function discoveryApi() {
    if (!global.KernelIntentionDiscoveryV01) throw new Error('KernelIntentionDiscoveryV01 unavailable');
    return global.KernelIntentionDiscoveryV01;
  }
  function refinementApi() {
    if (!global.KernelIntentionRefinementV01) throw new Error('KernelIntentionRefinementV01 unavailable');
    return global.KernelIntentionRefinementV01;
  }
  function necessityApi() {
    if (!global.KernelIntentionNecessityTestV01) throw new Error('KernelIntentionNecessityTestV01 unavailable');
    return global.KernelIntentionNecessityTestV01;
  }
  function latticeApi() {
    if (!global.KernelIntentionNeighborLatticeV01) throw new Error('KernelIntentionNeighborLatticeV01 unavailable');
    return global.KernelIntentionNeighborLatticeV01;
  }
  function invarianceApi() {
    if (!global.KernelIntentionLatticeInvarianceBenchmarkV01) throw new Error('KernelIntentionLatticeInvarianceBenchmarkV01 unavailable');
    return global.KernelIntentionLatticeInvarianceBenchmarkV01;
  }

  function doctrine() {
    return {
      compiles_intention_formulas_not_claim_facts: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      compiled_formulas_are_candidate_not_doctrine: true,
      concept_scope_total: 1,
      shape_terms_preserve_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      neighbor_transitions_are_candidate_structural_relations_not_truth_claims: true,
      invariance_status_is_discovery_hygiene_not_institutional_validation: true,
      belief_movement: 'none'
    };
  }

  function byConcept(rows, concept) {
    const id = safeId(concept);
    return asArray(rows).find(row => safeId(row && row.concept) === id) || null;
  }

  function roleRows(refinement, role) {
    return asArray(refinement && refinement.dimension_classifications).filter(row => row.refined_role === role);
  }

  function termListForRole(refinement, role) {
    const shape = refinement && refinement.refined_shape && refinement.refined_shape.shape || {};
    return roleRows(refinement, role).map(row => ({
      dimension: text(row.dimension),
      coefficient: Number(shape[row.dimension] || 0),
      role,
      belief_movement: 'none'
    })).filter(term => term.dimension && term.coefficient !== 0);
  }

  function forceTerms(discoveryCandidate) {
    return asArray(discoveryCandidate && discoveryCandidate.force_dimensions).map(row => ({
      dimension: text(row.name || row),
      role: 'force_intensity_outside_shape',
      equation_role: 'M component, not i component',
      belief_movement: 'none'
    })).filter(row => row.dimension);
  }

  function algebraForTerms(concept, terms) {
    const lhs = safeId(concept).toUpperCase();
    const rhs = asArray(terms).map(term => `${Number(term.coefficient).toFixed(6)}·${term.dimension}`).join(' + ');
    return `${lhs}_i = ${rhs}; Σ|dimension_i| = 1; F_${safeId(concept)} = M_${safeId(concept)} · ${lhs}_i`;
  }

  function neighborTransitions(lattice, concept) {
    const from = safeId(concept);
    return asArray(lattice && lattice.edges).filter(edge => edge.from === from).map(edge => ({
      removed_dimension: text(edge.removed_dimension),
      to: text(edge.to),
      edge_type: text(edge.edge_type),
      structural_pressure_weight: Number(edge.structural_pressure_weight || 0),
      candidate_status: text(edge.candidate_status),
      belief_movement: 'none'
    }));
  }

  function invarianceStatus(invariance, concept) {
    const id = safeId(concept);
    const cases = asArray(invariance && invariance.case_results).filter(row => safeId(row && row.canonical && row.canonical.concept) === id);
    return {
      concept: id,
      tested_case_count: cases.length,
      passed_case_count: cases.filter(row => row.ok === true).length,
      all_tested_cases_passed: cases.every(row => row.ok === true),
      case_ids: cases.map(row => row.id),
      force_invariance_ok: invariance && invariance.force_invariance && invariance.force_invariance.ok === true,
      belief_movement: 'none'
    };
  }

  function validateCompiledFormula(formula) {
    const errors = [];
    if (!text(formula && formula.concept)) errors.push('missing_concept');
    if (Number(formula && formula.scope_total) !== 1) errors.push('scope_total_not_1');
    const terms = asArray(formula && formula.shape_terms);
    if (!terms.length) errors.push('missing_shape_terms');
    const l1 = Number(terms.reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
    if (Math.abs(1 - l1) > EPSILON) errors.push(`shape_l1_not_1:${l1}`);
    asArray(formula && formula.force_terms).forEach(force => {
      if (terms.some(term => safeId(term.dimension) === safeId(force.dimension))) errors.push(`force_leaked_into_shape:${force.dimension}`);
    });
    if (!text(formula && formula.symbolic_formula).includes('Σ|dimension_i| = 1')) errors.push('symbolic_formula_missing_unit_total');
    if (!text(formula && formula.symbolic_formula).includes('F_')) errors.push('symbolic_formula_missing_force_equation');
    if (formula && formula.review_status !== 'compiled_candidate_not_doctrine') errors.push('formula_promoted_to_doctrine');
    if (formula && formula.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      concept: text(formula && formula.concept),
      ok: errors.length === 0,
      errors,
      shape_l1_total: l1,
      shape_term_count: terms.length,
      force_term_count: asArray(formula && formula.force_terms).length,
      neighbor_transition_count: asArray(formula && formula.neighbor_transitions).length,
      belief_movement: 'none'
    };
  }

  function compileConcept(concept, packets) {
    const discovery = byConcept(packets.discovery && packets.discovery.candidates, concept);
    const refinement = byConcept(packets.refinement && packets.refinement.refinements, concept);
    const necessity = byConcept(packets.necessity && packets.necessity.candidates, concept);
    const coreTerms = termListForRole(refinement, 'core_shape');
    const boundaryTerms = termListForRole(refinement, 'boundary_shape');
    const derivativeTerms = termListForRole(refinement, 'expression_or_derivative_shape');
    const unresolvedTerms = termListForRole(refinement, 'unresolved_shape');
    const shapeTerms = coreTerms.concat(boundaryTerms).concat(derivativeTerms).concat(unresolvedTerms);
    return {
      packet_type: '42ndMind_compiled_intention_formula_v0_1',
      packet_version: VERSION,
      created_at: now(),
      concept: safeId(concept),
      scope_total: 1,
      source_status: {
        discovery_ok: packets.discovery && packets.discovery.ok === true,
        refinement_ok: packets.refinement && packets.refinement.ok === true,
        necessity_ok: packets.necessity && packets.necessity.ok === true,
        lattice_ok: packets.lattice && packets.lattice.ok === true,
        invariance_ok: packets.invariance && packets.invariance.ok === true,
        belief_movement: 'none'
      },
      core_terms: coreTerms,
      boundary_terms: boundaryTerms,
      derivative_expression_terms: derivativeTerms,
      unresolved_terms: unresolvedTerms,
      shape_terms: shapeTerms,
      force_terms: forceTerms(discovery),
      necessity_summary: {
        necessary_core_dimensions: clone(necessity && necessity.necessary_core_dimensions || []),
        boundary_dimensions: clone(necessity && necessity.boundary_dimensions || []),
        derivative_expression_dimensions: clone(necessity && necessity.derivative_expression_dimensions || []),
        unresolved_dimensions: clone(necessity && necessity.unresolved_dimensions || []),
        belief_movement: 'none'
      },
      neighbor_transitions: neighborTransitions(packets.lattice, concept),
      invariance_status: invarianceStatus(packets.invariance, concept),
      symbolic_formula: algebraForTerms(concept, shapeTerms),
      force_equation: `F_${safeId(concept)} = M_${safeId(concept)} · ${safeId(concept).toUpperCase()}_i`,
      review_status: 'compiled_candidate_not_doctrine',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function validateCompilerPacket(packet) {
    const formulas = asArray(packet && packet.compiled_formulas);
    const validations = formulas.map(validateCompiledFormula);
    const errors = [];
    if (!formulas.length) errors.push('missing_compiled_formulas');
    validations.forEach(v => { if (!v.ok) errors.push(`${v.concept}:${v.errors.join('|')}`); });
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    return {
      packet_type: '42ndMind_intention_formula_compiler_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      formula_count: formulas.length,
      validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runCompiler(options = {}) {
    const discovery = options.discovery_packet || discoveryApi().runDiscovery(options.discovery_options || {});
    const refinement = options.refinement_packet || refinementApi().runRefinement({ discovery_packet: discovery });
    const necessity = options.necessity_packet || necessityApi().runNecessityTests({ refinement_packet: refinement });
    const lattice = options.lattice_packet || latticeApi().runLattice({ necessity_packet: necessity });
    const invariance = options.invariance_packet || invarianceApi().runBenchmark({ lattice_packet: lattice });
    const concepts = asArray(discovery && discovery.candidates).map(row => safeId(row.concept));
    const packets = { discovery, refinement, necessity, lattice, invariance };
    const compiled_formulas = concepts.map(concept => compileConcept(concept, packets));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Compiled algebraic intention formula packets from discovery/refinement/necessity/lattice/invariance outputs. Candidate only; not doctrine; no real-world intent attribution.',
      source_summary: {
        discovery_ok: discovery && discovery.ok === true,
        refinement_ok: refinement && refinement.ok === true,
        necessity_ok: necessity && necessity.ok === true,
        lattice_ok: lattice && lattice.ok === true,
        invariance_ok: invariance && invariance.ok === true,
        concept_count: concepts.length,
        belief_movement: 'none'
      },
      compiled_formula_count: compiled_formulas.length,
      compiled_formulas,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validateCompilerPacket(packet);
    packet.ok = packet.validation.ok === true && Object.values(packet.source_summary).filter(v => typeof v === 'boolean').every(Boolean);
    return packet;
  }

  global.KernelIntentionFormulaCompilerV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    byConcept,
    roleRows,
    termListForRole,
    forceTerms,
    algebraForTerms,
    neighborTransitions,
    invarianceStatus,
    validateCompiledFormula,
    compileConcept,
    validateCompilerPacket,
    runCompiler
  });
})(typeof window !== 'undefined' ? window : globalThis);