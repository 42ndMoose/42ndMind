/* 42ndMind Intention Coefficient/Dimension Revision Engine v0.1
 * Stages formula revisions that incorporate candidate split dimensions.
 * Candidate-only. Source formulas are preserved. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_coefficient_dimension_revision_engine_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function splitApi() {
    if (!global.KernelIntentionDimensionSplittingV01) throw new Error('KernelIntentionDimensionSplittingV01 unavailable');
    return global.KernelIntentionDimensionSplittingV01;
  }

  function ledgerApi() {
    if (!global.KernelIntentionCanonicalFormulaLedgerV01) throw new Error('KernelIntentionCanonicalFormulaLedgerV01 unavailable');
    return global.KernelIntentionCanonicalFormulaLedgerV01;
  }

  function doctrine() {
    return {
      stages_split_dimension_formula_revisions: true,
      revisions_are_candidate_versions_not_doctrine: true,
      source_formula_snapshots_preserved: true,
      no_source_formula_mutation: true,
      no_formula_replacement_without_version_trail: true,
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

  function coefficientSum(terms) {
    return Number(asArray(terms).reduce((sum, term) => sum + Number(term.coefficient || 0), 0).toFixed(6));
  }

  function forceOutsideShape(shapeTerms, forceTerms) {
    const shape = new Set(asArray(shapeTerms).map(term => safeId(term.dimension)));
    return asArray(forceTerms).every(force => !shape.has(safeId(force.dimension)));
  }

  function currentVersion(record) {
    const id = text(record && record.current_candidate_version);
    return asArray(record && record.versions).find(v => v.version_id === id) || asArray(record && record.versions)[0] || null;
  }

  function splitCandidatesForConcept(splitPacket, concept) {
    const id = safeId(concept);
    return asArray(splitPacket && splitPacket.split_candidates).filter(row => safeId(row.concept) === id);
  }

  function splitByParentDimension(splitRows) {
    const map = {};
    asArray(splitRows).forEach(row => { map[safeId(row.parent_dimension)] = row; });
    return map;
  }

  function revisedShapeTermsFromSplits(sourceShapeTerms, splitRows) {
    const splitMap = splitByParentDimension(splitRows);
    const revised = [];
    asArray(sourceShapeTerms).forEach(term => {
      const split = splitMap[safeId(term.dimension)];
      if (split) asArray(split.child_terms).forEach(child => revised.push(clone(child)));
      else revised.push(clone(term));
    });
    return revised;
  }

  function coefficientDeltas(sourceShapeTerms, splitRows) {
    const splitMap = splitByParentDimension(splitRows);
    return asArray(sourceShapeTerms).filter(term => splitMap[safeId(term.dimension)]).map(term => {
      const split = splitMap[safeId(term.dimension)];
      const childSum = coefficientSum(split.child_terms);
      const parentCoefficient = Number(term.coefficient || 0);
      return {
        parent_dimension: safeId(term.dimension),
        parent_coefficient: parentCoefficient,
        child_coefficient_sum: childSum,
        coefficient_delta: Number((childSum - parentCoefficient).toFixed(6)),
        child_dimensions: asArray(split.child_terms).map(child => safeId(child.dimension)),
        belief_movement: 'none'
      };
    });
  }

  function symbolicFormula(concept, revisedShapeTerms, forceEquation) {
    const terms = asArray(revisedShapeTerms).map(term => `${Number(term.coefficient).toFixed(6)}·${safeId(term.dimension)}`).join(' + ');
    return `${concept.toUpperCase()}_i^r_split = ${terms}; Σ|dimension_i| = 1; ${forceEquation}`;
  }

  function stagedRevisionForRecord(record, splitPacket) {
    const concept = safeId(record && record.concept);
    const sourceVersion = currentVersion(record);
    const splitRows = splitCandidatesForConcept(splitPacket, concept);
    const sourceShapeTerms = clone(asArray(sourceVersion && sourceVersion.shape_terms));
    const sourceForceTerms = clone(asArray(sourceVersion && sourceVersion.force_terms));
    const revisedShapeTerms = revisedShapeTermsFromSplits(sourceShapeTerms, splitRows);
    const sourceL1 = l1(sourceShapeTerms);
    const revisedL1 = l1(revisedShapeTerms);
    const forceEquation = text(sourceVersion && sourceVersion.force_equation) || `F_${concept} = M_${concept} · ${concept.toUpperCase()}_i^r_split`;
    const deltas = coefficientDeltas(sourceShapeTerms, splitRows);
    return {
      revision_id: `${concept}_v0003_coefficient_dimension_revision`,
      concept,
      source_type: 'coefficient_dimension_revision',
      parent_version_id: text(sourceVersion && sourceVersion.version_id),
      source_ledger_id: text(record && record.ledger_id),
      applied_split_candidate_ids: splitRows.map(row => row.split_id),
      applied_split_candidate_count: splitRows.length,
      source_dimension_count: sourceShapeTerms.length,
      revised_dimension_count: revisedShapeTerms.length,
      dimension_count_delta: revisedShapeTerms.length - sourceShapeTerms.length,
      source_shape_terms: sourceShapeTerms,
      revised_shape_terms: revisedShapeTerms,
      force_terms: sourceForceTerms,
      coefficient_deltas: deltas,
      coefficient_delta_total: Number(deltas.reduce((sum, row) => sum + Math.abs(Number(row.coefficient_delta || 0)), 0).toFixed(6)),
      source_l1_total: sourceL1,
      revised_l1_total: revisedL1,
      mass_change: Number((revisedL1 - sourceL1).toFixed(6)),
      force_terms_outside_shape: forceOutsideShape(revisedShapeTerms, sourceForceTerms),
      source_formula_snapshot: {
        version_id: text(sourceVersion && sourceVersion.version_id),
        source_type: text(sourceVersion && sourceVersion.source_type),
        symbolic_formula: text(sourceVersion && sourceVersion.symbolic_formula),
        force_equation: text(sourceVersion && sourceVersion.force_equation),
        shape_terms: sourceShapeTerms,
        force_terms: sourceForceTerms,
        guards: clone(asArray(sourceVersion && sourceVersion.guards)),
        promotion_status: text(sourceVersion && sourceVersion.promotion_status),
        doctrine_status: text(sourceVersion && sourceVersion.doctrine_status),
        belief_movement: 'none'
      },
      revised_symbolic_formula: symbolicFormula(concept, revisedShapeTerms, forceEquation),
      force_equation: forceEquation,
      guards: clone(asArray(sourceVersion && sourceVersion.guards)).concat(splitRows.map(row => ({
        guard_type: 'split_candidate_guard',
        split_id: row.split_id,
        parent_dimension: row.parent_dimension,
        action_status: 'candidate_split_not_applied_to_source',
        belief_movement: 'none'
      }))),
      revision_trail: [
        {
          event_type: 'source_formula_snapshot_preserved',
          from_version_id: text(sourceVersion && sourceVersion.version_id),
          to_revision_id: `${concept}_v0003_coefficient_dimension_revision`,
          source_formula_mutated: false,
          belief_movement: 'none'
        },
        {
          event_type: 'split_dimensions_staged',
          split_candidate_count: splitRows.length,
          source_dimension_count: sourceShapeTerms.length,
          revised_dimension_count: revisedShapeTerms.length,
          applied_as_doctrine: false,
          belief_movement: 'none'
        }
      ],
      rollback_available: true,
      rollback_target: {
        to_version_id: text(sourceVersion && sourceVersion.version_id),
        restore_shape_terms: sourceShapeTerms,
        restore_force_terms: sourceForceTerms,
        belief_movement: 'none'
      },
      action_status: 'staged_revision_not_applied',
      source_formula_mutated: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function validateRevision(row) {
    const errors = [];
    if (!text(row && row.revision_id)) errors.push('missing_revision_id');
    if (!text(row && row.concept)) errors.push('missing_concept');
    if (!text(row && row.parent_version_id)) errors.push('missing_parent_version_id');
    if (row && row.applied_split_candidate_count !== 5) errors.push(`split_candidate_count_not_5:${row && row.applied_split_candidate_count}`);
    if (row && row.source_dimension_count !== 5) errors.push(`source_dimension_count_not_5:${row && row.source_dimension_count}`);
    if (row && row.revised_dimension_count !== 10) errors.push(`revised_dimension_count_not_10:${row && row.revised_dimension_count}`);
    if (row && row.dimension_count_delta !== 5) errors.push(`dimension_delta_not_5:${row && row.dimension_count_delta}`);
    if (Math.abs(1 - Number(row && row.source_l1_total || 0)) > EPSILON) errors.push(`source_l1_not_1:${row && row.source_l1_total}`);
    if (Math.abs(1 - Number(row && row.revised_l1_total || 0)) > EPSILON) errors.push(`revised_l1_not_1:${row && row.revised_l1_total}`);
    if (Number(row && row.mass_change || 0) !== 0) errors.push(`mass_changed:${row && row.mass_change}`);
    if (Number(row && row.coefficient_delta_total || 0) !== 0) errors.push(`coefficient_delta_not_0:${row && row.coefficient_delta_total}`);
    if (row && row.force_terms_outside_shape !== true) errors.push('force_terms_not_outside_shape');
    if (!row || !row.source_formula_snapshot) errors.push('missing_source_formula_snapshot');
    if (row && row.source_formula_mutated !== false) errors.push('source_formula_mutated');
    if (row && row.action_status !== 'staged_revision_not_applied') errors.push('revision_applied_too_early');
    if (row && row.promotion_status !== 'not_promoted') errors.push('revision_promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.rollback_available !== true) errors.push('rollback_not_available');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      revision_id: text(row && row.revision_id),
      concept: text(row && row.concept),
      ok: errors.length === 0,
      errors,
      applied_split_candidate_count: Number(row && row.applied_split_candidate_count || 0),
      source_dimension_count: Number(row && row.source_dimension_count || 0),
      revised_dimension_count: Number(row && row.revised_dimension_count || 0),
      source_l1_total: Number(row && row.source_l1_total || 0),
      revised_l1_total: Number(row && row.revised_l1_total || 0),
      mass_change: Number(row && row.mass_change || 0),
      coefficient_delta_total: Number(row && row.coefficient_delta_total || 0),
      force_terms_outside_shape: row && row.force_terms_outside_shape === true,
      rollback_available: row && row.rollback_available === true,
      promotion_status: text(row && row.promotion_status),
      doctrine_status: text(row && row.doctrine_status),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const revisions = asArray(packet && packet.staged_revisions);
    const validations = revisions.map(validateRevision);
    const errors = [];
    if (packet && packet.source_split_ok !== true) errors.push('source_split_not_ok');
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (revisions.length !== 11) errors.push(`revision_count_not_11:${revisions.length}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.revision_id}:${row.errors.join('|')}`); });
    return {
      packet_type: '42ndMind_intention_coefficient_dimension_revision_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks: {
        source_split_ok: packet && packet.source_split_ok === true,
        source_ledger_ok: packet && packet.source_ledger_ok === true,
        eleven_staged_revisions: revisions.length === 11,
        five_splits_per_revision: validations.every(row => row.applied_split_candidate_count === 5),
        dimensions_expand_5_to_10: validations.every(row => row.source_dimension_count === 5 && row.revised_dimension_count === 10),
        all_l1_totals_equal_1: validations.every(row => Math.abs(1 - Number(row.source_l1_total || 0)) <= EPSILON && Math.abs(1 - Number(row.revised_l1_total || 0)) <= EPSILON),
        no_mass_inflation: validations.every(row => Number(row.mass_change || 0) === 0),
        coefficient_delta_total_zero: validations.every(row => Number(row.coefficient_delta_total || 0) === 0),
        force_terms_outside_shape: validations.every(row => row.force_terms_outside_shape === true),
        rollback_data_present: validations.every(row => row.rollback_available === true),
        candidate_only_not_promoted: validations.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
        belief_movement_none: packet && packet.belief_movement === 'none' && validations.every(row => row.belief_movement === 'none')
      },
      revision_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runRevisionEngine(options = {}) {
    const splitPacket = options.split_packet || splitApi().runDimensionSplitting(options.split_options || {});
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const revisions = asArray(ledgerPacket && ledgerPacket.ledger_records).map(record => stagedRevisionForRecord(record, splitPacket));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Stages candidate coefficient/dimension formula revisions from split candidates. Source formulas are snapshotted and not mutated. Revisions are not applied or promoted.',
      source_split_ok: splitPacket && splitPacket.ok === true,
      source_split_candidate_count: splitPacket && splitPacket.split_candidate_count || 0,
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      staged_revision_count: revisions.length,
      staged_revisions: revisions,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionCoefficientDimensionRevisionEngineV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    l1,
    coefficientSum,
    forceOutsideShape,
    currentVersion,
    splitCandidatesForConcept,
    splitByParentDimension,
    revisedShapeTermsFromSplits,
    coefficientDeltas,
    symbolicFormula,
    stagedRevisionForRecord,
    validateRevision,
    validatePacket,
    runRevisionEngine
  });
})(typeof window !== 'undefined' ? window : globalThis);
