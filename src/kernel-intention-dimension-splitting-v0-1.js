/* 42ndMind Intention Dimension Splitting v0.1
 * Proposes candidate dimension subdivisions from minimal-pair pressure.
 * Candidate-only. No source formula mutation. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_dimension_splitting_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

  function minPairApi() {
    if (!global.KernelIntentionMinimalPairLibraryV01) throw new Error('KernelIntentionMinimalPairLibraryV01 unavailable');
    return global.KernelIntentionMinimalPairLibraryV01;
  }

  function ledgerApi() {
    if (!global.KernelIntentionCanonicalFormulaLedgerV01) throw new Error('KernelIntentionCanonicalFormulaLedgerV01 unavailable');
    return global.KernelIntentionCanonicalFormulaLedgerV01;
  }

  function doctrine() {
    return {
      proposes_dimension_splits_from_minimal_pair_pressure: true,
      split_candidates_are_not_doctrine: true,
      no_source_formula_mutation: true,
      old_dimension_mass_is_redistributed_not_inflated: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      rollback_required: true,
      belief_movement: 'none'
    };
  }

  function l1(terms) {
    return Number(asArray(terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
  }

  function forceOutsideShape(shapeTerms, forceTerms) {
    const shape = new Set(asArray(shapeTerms).map(term => safeId(term.dimension)));
    return asArray(forceTerms).every(force => !shape.has(safeId(force.dimension)));
  }

  function currentVersion(record) {
    const id = text(record && record.current_candidate_version);
    return asArray(record && record.versions).find(v => v.version_id === id) || asArray(record && record.versions)[0] || null;
  }

  function recordByConcept(ledgerPacket, concept) {
    const id = safeId(concept);
    return asArray(ledgerPacket && ledgerPacket.ledger_records).find(row => safeId(row.concept) === id) || null;
  }

  function pairsForDimension(minPairPacket, concept, dimension) {
    const c = safeId(concept);
    const d = safeId(dimension);
    return asArray(minPairPacket && minPairPacket.minimal_pairs).filter(pair => safeId(pair.concept) === c && safeId(pair.pressure_dimension) === d);
  }

  function childrenForDimension(term, pairRows) {
    const dimension = safeId(term && term.dimension);
    const role = safeId(term && term.role);
    const coefficient = Number(term && term.coefficient || 0);
    const sign = coefficient < 0 ? -1 : 1;
    const parentAbs = Number(Math.abs(coefficient).toFixed(6));
    const childOneAbs = Number((parentAbs / 2).toFixed(6));
    const childTwoAbs = Number((parentAbs - childOneAbs).toFixed(6));
    const childCoefficients = [childOneAbs * sign, childTwoAbs * sign];
    const suffixes = role === 'core_shape'
      ? ['identity_component', 'contrast_boundary_component']
      : role === 'boundary_shape'
        ? ['scope_component', 'limit_component']
        : role === 'expression_or_derivative_shape'
          ? ['signal_component', 'expression_boundary_component']
          : ['primary_component', 'pressure_component'];
    return suffixes.map((suffix, index) => ({
      dimension: `${dimension}_${suffix}`,
      coefficient: Number(childCoefficients[index].toFixed(6)),
      parent_dimension: dimension,
      split_index: index + 1,
      role: text(term && term.role) || 'shape_term',
      pressure_pair_count: asArray(pairRows).length,
      belief_movement: 'none'
    }));
  }

  function shapeWithSplit(shapeTerms, parentDimension, childTerms) {
    const parent = safeId(parentDimension);
    const out = [];
    asArray(shapeTerms).forEach(term => {
      if (safeId(term.dimension) === parent) childTerms.forEach(child => out.push(clone(child)));
      else out.push(clone(term));
    });
    return out;
  }

  function splitCandidate(record, version, term, pairRows) {
    const concept = safeId(record && record.concept);
    const dimension = safeId(term && term.dimension);
    const sourceShapeTerms = clone(asArray(version && version.shape_terms));
    const sourceForceTerms = clone(asArray(version && version.force_terms));
    const childTerms = childrenForDimension(term, pairRows);
    const revisedShapeTerms = shapeWithSplit(sourceShapeTerms, dimension, childTerms);
    const sourceL1 = l1(sourceShapeTerms);
    const revisedL1 = l1(revisedShapeTerms);
    return {
      split_id: `${concept}_${dimension}_split_candidate_v0_1`,
      concept,
      source_version_id: text(version && version.version_id),
      parent_dimension: dimension,
      parent_role: text(term && term.role) || 'shape_term',
      parent_coefficient: Number(term && term.coefficient || 0),
      pressure_pair_count: asArray(pairRows).length,
      pressure_pair_ids: asArray(pairRows).map(pair => pair.pair_id),
      split_reason: `Minimal-pair pressure touched ${dimension} ${asArray(pairRows).length} times for ${concept}.`,
      child_terms: childTerms,
      source_shape_terms: sourceShapeTerms,
      revised_shape_terms: revisedShapeTerms,
      force_terms: sourceForceTerms,
      source_l1_total: sourceL1,
      revised_l1_total: revisedL1,
      mass_change: Number((revisedL1 - sourceL1).toFixed(6)),
      force_terms_outside_shape: forceOutsideShape(revisedShapeTerms, sourceForceTerms),
      source_formula_snapshot: {
        symbolic_formula: text(version && version.symbolic_formula),
        force_equation: text(version && version.force_equation),
        shape_terms: sourceShapeTerms,
        force_terms: sourceForceTerms,
        belief_movement: 'none'
      },
      revised_symbolic_formula: `${concept.toUpperCase()}_i^split(${dimension}) = source terms with ${dimension} redistributed across ${childTerms.map(row => row.dimension).join(' + ')}; Σ|dimension_i| = 1`,
      action_status: 'split_candidate_not_applied',
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      rollback_available: true,
      rollback_target: {
        to_version_id: text(version && version.version_id),
        restore_parent_dimension: dimension,
        restore_parent_coefficient: Number(term && term.coefficient || 0),
        belief_movement: 'none'
      },
      belief_movement: 'none'
    };
  }

  function splitCandidatesForRecord(record, minPairPacket) {
    const version = currentVersion(record);
    return asArray(version && version.shape_terms).map(term => splitCandidate(record, version, term, pairsForDimension(minPairPacket, record.concept, term.dimension)));
  }

  function groupByConcept(candidates) {
    const map = {};
    asArray(candidates).forEach(candidate => {
      const concept = safeId(candidate.concept);
      if (!map[concept]) map[concept] = [];
      map[concept].push(candidate);
    });
    return Object.keys(map).sort().map(concept => ({
      concept,
      split_candidate_count: map[concept].length,
      pressure_pair_count: map[concept].reduce((sum, row) => sum + Number(row.pressure_pair_count || 0), 0),
      all_revised_l1_totals_equal_1: map[concept].every(row => Math.abs(1 - Number(row.revised_l1_total || 0)) <= EPSILON),
      force_terms_outside_shape: map[concept].every(row => row.force_terms_outside_shape === true),
      candidates: map[concept],
      belief_movement: 'none'
    }));
  }

  function validateCandidate(candidate) {
    const errors = [];
    if (!text(candidate && candidate.split_id)) errors.push('missing_split_id');
    if (!text(candidate && candidate.concept)) errors.push('missing_concept');
    if (!text(candidate && candidate.source_version_id)) errors.push('missing_source_version_id');
    if (!text(candidate && candidate.parent_dimension)) errors.push('missing_parent_dimension');
    if (asArray(candidate && candidate.child_terms).length < 2) errors.push('missing_child_terms');
    if (Math.abs(1 - Number(candidate && candidate.source_l1_total || 0)) > EPSILON) errors.push(`source_l1_not_1:${candidate && candidate.source_l1_total}`);
    if (Math.abs(1 - Number(candidate && candidate.revised_l1_total || 0)) > EPSILON) errors.push(`revised_l1_not_1:${candidate && candidate.revised_l1_total}`);
    if (Number(candidate && candidate.mass_change || 0) !== 0) errors.push(`mass_changed:${candidate && candidate.mass_change}`);
    if (candidate && candidate.force_terms_outside_shape !== true) errors.push('force_terms_not_outside_shape');
    if (candidate && candidate.action_status !== 'split_candidate_not_applied') errors.push('split_applied_too_early');
    if (candidate && candidate.promotion_status !== 'not_promoted') errors.push('split_promoted');
    if (candidate && candidate.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (candidate && candidate.rollback_available !== true) errors.push('rollback_not_available');
    if (!candidate || !candidate.rollback_target) errors.push('missing_rollback_target');
    if (candidate && candidate.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      split_id: text(candidate && candidate.split_id),
      concept: text(candidate && candidate.concept),
      ok: errors.length === 0,
      errors,
      source_l1_total: Number(candidate && candidate.source_l1_total || 0),
      revised_l1_total: Number(candidate && candidate.revised_l1_total || 0),
      mass_change: Number(candidate && candidate.mass_change || 0),
      force_terms_outside_shape: candidate && candidate.force_terms_outside_shape === true,
      promotion_status: text(candidate && candidate.promotion_status),
      doctrine_status: text(candidate && candidate.doctrine_status),
      rollback_available: candidate && candidate.rollback_available === true,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const candidates = asArray(packet && packet.split_candidates);
    const groups = asArray(packet && packet.concept_groups);
    const validations = candidates.map(validateCandidate);
    const errors = [];
    if (packet && packet.source_minimal_pair_ok !== true) errors.push('source_minimal_pair_not_ok');
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (packet && packet.concept_count !== 11) errors.push(`concept_count_not_11:${packet && packet.concept_count}`);
    if (packet && packet.split_candidate_count !== 55) errors.push(`split_candidate_count_not_55:${packet && packet.split_candidate_count}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.split_id}:${row.errors.join('|')}`); });
    groups.forEach(group => {
      if (group.split_candidate_count !== 5) errors.push(`${group.concept}:split_candidate_count_not_5:${group.split_candidate_count}`);
      if (group.pressure_pair_count !== 10) errors.push(`${group.concept}:pressure_pair_count_not_10:${group.pressure_pair_count}`);
    });
    return {
      packet_type: '42ndMind_intention_dimension_splitting_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks: {
        source_minimal_pair_ok: packet && packet.source_minimal_pair_ok === true,
        source_ledger_ok: packet && packet.source_ledger_ok === true,
        eleven_concepts: packet && packet.concept_count === 11,
        fifty_five_split_candidates: packet && packet.split_candidate_count === 55,
        five_splits_per_concept: groups.length === 11 && groups.every(group => group.split_candidate_count === 5),
        all_source_l1_totals_equal_1: validations.every(row => Math.abs(1 - Number(row.source_l1_total || 0)) <= EPSILON),
        all_revised_l1_totals_equal_1: validations.every(row => Math.abs(1 - Number(row.revised_l1_total || 0)) <= EPSILON),
        no_mass_inflation: validations.every(row => Number(row.mass_change || 0) === 0),
        force_terms_outside_shape: validations.every(row => row.force_terms_outside_shape === true),
        candidate_only_not_promoted: validations.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
        rollback_data_present: validations.every(row => row.rollback_available === true),
        belief_movement_none: packet && packet.belief_movement === 'none' && validations.every(row => row.belief_movement === 'none')
      },
      split_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runDimensionSplitting(options = {}) {
    const minimalPairPacket = options.minimal_pair_packet || minPairApi().runMinimalPairLibrary(options.minimal_pair_options || {});
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const candidates = asArray(ledgerPacket && ledgerPacket.ledger_records).flatMap(record => splitCandidatesForRecord(record, minimalPairPacket));
    const groups = groupByConcept(candidates);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Candidate dimension splits generated from minimal-pair pressure. Source formulas are preserved; parent dimension mass is redistributed across children; no formula is applied or promoted.',
      source_minimal_pair_ok: minimalPairPacket && minimalPairPacket.ok === true,
      source_minimal_pair_count: minimalPairPacket && minimalPairPacket.minimal_pair_count || 0,
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      concept_count: groups.length,
      split_candidate_count: candidates.length,
      concept_groups: groups,
      split_candidates: candidates,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionDimensionSplittingV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    l1,
    forceOutsideShape,
    currentVersion,
    recordByConcept,
    pairsForDimension,
    childrenForDimension,
    shapeWithSplit,
    splitCandidate,
    splitCandidatesForRecord,
    groupByConcept,
    validateCandidate,
    validatePacket,
    runDimensionSplitting
  });
})(typeof window !== 'undefined' ? window : globalThis);
