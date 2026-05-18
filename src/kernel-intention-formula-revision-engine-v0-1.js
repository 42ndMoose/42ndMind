/* 42ndMind Intention Formula Revision Engine v0.1
 * Turns contradiction/refinement pressure into staged rewritten candidate formulas.
 *
 * This engine does not mutate source formulas. It creates revised formula
 * candidates with explicit guards, preserved unit-total shape, force separation,
 * and full revision trail.
 *
 * Core doctrine:
 * staged rewrite is not doctrine
 * contradiction pressure may produce revised candidates, not silent updates
 * source formula remains intact
 * local shape remains Σ |dimension_i| = 1
 * force/intensity remains outside shape: F = M · i
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_formula_revision_engine_v0_1';
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

  function loopApi() {
    if (!global.KernelIntentionContradictionRefinementLoopV01) throw new Error('KernelIntentionContradictionRefinementLoopV01 unavailable');
    return global.KernelIntentionContradictionRefinementLoopV01;
  }

  function doctrine() {
    return {
      rewrites_formulas_as_staged_candidates_not_doctrine: true,
      no_silent_source_mutation: true,
      source_formula_remains_intact: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      contradiction_pressure_can_generate_candidate_revision_not_resolution: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      revision_trail_required: true,
      belief_movement: 'none'
    };
  }

  function findFormula(expansionPacket, concept) {
    const compiled = expansionPacket && expansionPacket.compiled_packet;
    const formulas = compiled && compiled.compiled_formulas || [];
    const id = safeId(concept);
    return asArray(formulas).find(f => safeId(f.concept) === id) || null;
  }

  function allFormulas(expansionPacket) {
    const compiled = expansionPacket && expansionPacket.compiled_packet;
    if (compiled && Array.isArray(compiled.compiled_formulas)) return compiled.compiled_formulas;
    return [];
  }

  function shapeL1(terms) {
    return Number(asArray(terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
  }

  function guardsForConcept(loopPacket, concept) {
    const id = safeId(concept);
    const guards = [];
    asArray(loopPacket && loopPacket.pair_analyses).forEach(pair => {
      asArray(pair.relation_checks).forEach(check => {
        if (safeId(check.from) !== id) return;
        guards.push({
          guard_type: 'neighbor_boundary_guard',
          source_pair: text(pair.id),
          pressure_type: text(pair.pressure_type),
          removed_dimension: safeId(check.removed_dimension),
          neighbor: safeId(check.to),
          relation_exists: check.relation_exists === true,
          guard_expression: `${id}.${safeId(check.removed_dimension)} ↛ collapse_as ${safeId(check.to)}`,
          belief_movement: 'none'
        });
      });
    });
    return guards;
  }

  function duplicateGuardsForConcept(loopPacket, concept) {
    const id = safeId(concept);
    const guards = [];
    asArray(loopPacket && loopPacket.duplicate_dimension_pressure && loopPacket.duplicate_dimension_pressure.duplicates).forEach(dup => {
      const uses = asArray(dup.uses).filter(use => safeId(use.concept) === id);
      if (!uses.length) return;
      guards.push({
        guard_type: 'shared_dimension_precision_guard',
        dimension: safeId(dup.dimension),
        source_pair: 'shared_dimension_pressure',
        pressure_type: 'shared_dimension_pressure',
        guard_expression: `${id}.${safeId(dup.dimension)} requires precision audit before promotion`,
        action: text(dup.refinement_action),
        belief_movement: 'none'
      });
    });
    return guards;
  }

  function revisedSymbolicFormula(formula, guards) {
    const concept = safeId(formula && formula.concept);
    const lhs = concept.toUpperCase();
    const guardText = asArray(guards).map(g => g.guard_expression).join(' ∧ ');
    const baseTerms = asArray(formula && formula.shape_terms).map(term => `${Number(term.coefficient).toFixed(6)}·${term.dimension}`).join(' + ');
    const guardSuffix = guardText ? ` under guards(${guardText})` : ' under guards(none)';
    return `${lhs}_i^r = ${baseTerms}${guardSuffix}; Σ|dimension_i| = 1; F_${concept} = M_${concept} · ${lhs}_i^r`;
  }

  function buildRevisionCandidate(loopPacket, formula) {
    const concept = safeId(formula && formula.concept);
    const guards = guardsForConcept(loopPacket, concept).concat(duplicateGuardsForConcept(loopPacket, concept));
    const sourceShapeTerms = clone(asArray(formula && formula.shape_terms));
    const stagedShapeTerms = clone(sourceShapeTerms);
    const sourceL1 = shapeL1(sourceShapeTerms);
    const revisedL1 = shapeL1(stagedShapeTerms);
    const changed = guards.length > 0;
    return {
      packet_type: '42ndMind_staged_revised_intention_formula_v0_1',
      packet_version: VERSION,
      created_at: now(),
      concept,
      revision_kind: 'guarded_formula_rewrite',
      source_review_status: text(formula && formula.review_status),
      staged_review_status: 'staged_revised_candidate_not_doctrine',
      source_formula_snapshot: {
        symbolic_formula: text(formula && formula.symbolic_formula),
        force_equation: text(formula && formula.force_equation),
        shape_terms: sourceShapeTerms,
        force_terms: clone(asArray(formula && formula.force_terms)),
        neighbor_transition_count: asArray(formula && formula.neighbor_transitions).length,
        belief_movement: 'none'
      },
      staged_shape_terms: stagedShapeTerms,
      staged_force_terms: clone(asArray(formula && formula.force_terms)),
      revision_guards: guards,
      source_l1_total: sourceL1,
      revised_l1_total: revisedL1,
      revised_symbolic_formula: revisedSymbolicFormula(formula, guards),
      revision_changes_source_coefficients: false,
      revision_changes_source_shape_terms: false,
      revision_adds_guards: changed,
      action_status: 'staged_candidate_revision_not_applied',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function validateRevisionCandidate(candidate) {
    const errors = [];
    if (!text(candidate && candidate.concept)) errors.push('missing_concept');
    if (candidate && candidate.staged_review_status !== 'staged_revised_candidate_not_doctrine') errors.push('promoted_to_doctrine');
    if (candidate && candidate.action_status !== 'staged_candidate_revision_not_applied') errors.push('revision_auto_applied');
    if (candidate && candidate.promotion_status !== 'not_promoted') errors.push('promotion_status_not_safe');
    if (candidate && candidate.belief_movement !== 'none') errors.push('belief_movement_not_none');
    const sourceL1 = Number(candidate && candidate.source_l1_total || 0);
    const revisedL1 = Number(candidate && candidate.revised_l1_total || 0);
    if (Math.abs(1 - sourceL1) > EPSILON) errors.push(`source_l1_not_1:${sourceL1}`);
    if (Math.abs(1 - revisedL1) > EPSILON) errors.push(`revised_l1_not_1:${revisedL1}`);
    const stagedShape = new Set(asArray(candidate && candidate.staged_shape_terms).map(term => safeId(term.dimension)));
    asArray(candidate && candidate.staged_force_terms).forEach(force => {
      if (stagedShape.has(safeId(force.dimension))) errors.push(`force_leaked_into_shape:${force.dimension}`);
    });
    if (!text(candidate && candidate.revised_symbolic_formula).includes('Σ|dimension_i| = 1')) errors.push('missing_unit_total_formula');
    if (!text(candidate && candidate.revised_symbolic_formula).includes('^r')) errors.push('missing_revised_formula_marker');
    return {
      concept: text(candidate && candidate.concept),
      ok: errors.length === 0,
      errors,
      source_l1_total: sourceL1,
      revised_l1_total: revisedL1,
      guard_count: asArray(candidate && candidate.revision_guards).length,
      belief_movement: 'none'
    };
  }

  function validateRevisionPacket(packet) {
    const candidates = asArray(packet && packet.revision_candidates);
    const validations = candidates.map(validateRevisionCandidate);
    const errors = [];
    if (!candidates.length) errors.push('missing_revision_candidates');
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    if (packet && packet.source_expansion_ok !== true) errors.push('source_expansion_not_ok');
    if (packet && packet.source_loop_ok !== true) errors.push('source_loop_not_ok');
    validations.forEach(v => { if (!v.ok) errors.push(`${v.concept}:${v.errors.join('|')}`); });
    return {
      packet_type: '42ndMind_intention_formula_revision_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      candidate_count: candidates.length,
      validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runRevisionEngine(options = {}) {
    const expansionPacket = options.expansion_packet || expansionApi().runExpansion(options.expansion_options || {});
    const loopPacket = options.loop_packet || loopApi().runLoop(Object.assign({}, options.loop_options || {}, { expansion_packet: expansionPacket }));
    const formulas = allFormulas(expansionPacket);
    const candidates = formulas.map(formula => buildRevisionCandidate(loopPacket, formula));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Staged formula revision candidates generated from contradiction/refinement pressure. Source formulas are not mutated and doctrine is not promoted.',
      source_expansion_ok: expansionPacket && expansionPacket.ok === true,
      source_loop_ok: loopPacket && loopPacket.ok === true,
      source_pair_analysis_count: loopPacket && loopPacket.pair_analysis_count || 0,
      source_compiled_formula_count: formulas.length,
      revision_candidate_count: candidates.length,
      guarded_revision_count: candidates.filter(c => c.revision_adds_guards).length,
      revision_candidates: candidates,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validateRevisionPacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionFormulaRevisionEngineV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    findFormula,
    allFormulas,
    shapeL1,
    guardsForConcept,
    duplicateGuardsForConcept,
    revisedSymbolicFormula,
    buildRevisionCandidate,
    validateRevisionCandidate,
    validateRevisionPacket,
    runRevisionEngine
  });
})(typeof window !== 'undefined' ? window : globalThis);