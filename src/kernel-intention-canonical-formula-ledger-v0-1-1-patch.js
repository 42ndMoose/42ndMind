/* 42ndMind Canonical Formula Ledger v0.1.1 Patch
 * Ingests coefficient/dimension staged revisions as v0003 candidate versions.
 * Keeps v0001 compiled formula and v0002 staged revision intact.
 * Candidate-only. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';
  const PACKET_TYPE = '42ndMind_intention_canonical_formula_ledger_v0_1_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function baseLedgerApi() {
    if (!global.KernelIntentionCanonicalFormulaLedgerV01) throw new Error('KernelIntentionCanonicalFormulaLedgerV01 unavailable');
    return global.KernelIntentionCanonicalFormulaLedgerV01;
  }

  function codimApi() {
    if (!global.KernelIntentionCoefficientDimensionRevisionEngineV01) throw new Error('KernelIntentionCoefficientDimensionRevisionEngineV01 unavailable');
    return global.KernelIntentionCoefficientDimensionRevisionEngineV01;
  }

  function doctrine() {
    return {
      ingests_v0003_coefficient_dimension_revisions: true,
      preserves_v0001_compiled_formula: true,
      preserves_v0002_staged_revision: true,
      appends_v0003_without_silent_overwrite: true,
      current_candidate_may_point_to_v0003_but_not_promoted: true,
      no_source_formula_mutation: true,
      no_formula_replacement_without_version_trail: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      rollback_to_v0002_and_v0001_required: true,
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

  function revisionForConcept(codimPacket, concept) {
    const id = safeId(concept);
    return asArray(codimPacket && codimPacket.staged_revisions).find(row => safeId(row.concept) === id) || null;
  }

  function versionByType(record, type) {
    return asArray(record && record.versions).find(version => version.source_type === type) || null;
  }

  function v0003Version(revision) {
    const concept = safeId(revision && revision.concept);
    const shapeTerms = clone(asArray(revision && revision.revised_shape_terms));
    const forceTerms = clone(asArray(revision && revision.force_terms));
    return {
      version_id: `${concept}_v0003_coefficient_dimension_revision`,
      source_type: 'coefficient_dimension_revision',
      concept,
      parent_version_id: text(revision && revision.parent_version_id),
      formula_snapshot: {
        packet_type: '42ndMind_intention_coefficient_dimension_revision_snapshot_v0_1_1',
        packet_version: VERSION,
        created_at: now(),
        concept,
        revision_id: text(revision && revision.revision_id),
        source_formula_snapshot: clone(revision && revision.source_formula_snapshot),
        applied_split_candidate_ids: clone(asArray(revision && revision.applied_split_candidate_ids)),
        applied_split_candidate_count: Number(revision && revision.applied_split_candidate_count || 0),
        source_dimension_count: Number(revision && revision.source_dimension_count || 0),
        revised_dimension_count: Number(revision && revision.revised_dimension_count || 0),
        dimension_count_delta: Number(revision && revision.dimension_count_delta || 0),
        source_shape_terms: clone(asArray(revision && revision.source_shape_terms)),
        revised_shape_terms: clone(shapeTerms),
        force_terms: clone(forceTerms),
        coefficient_deltas: clone(asArray(revision && revision.coefficient_deltas)),
        coefficient_delta_total: Number(revision && revision.coefficient_delta_total || 0),
        source_l1_total: Number(revision && revision.source_l1_total || 0),
        revised_l1_total: Number(revision && revision.revised_l1_total || 0),
        mass_change: Number(revision && revision.mass_change || 0),
        revised_symbolic_formula: text(revision && revision.revised_symbolic_formula),
        force_equation: text(revision && revision.force_equation),
        action_status: text(revision && revision.action_status),
        source_formula_mutated: revision && revision.source_formula_mutated === true,
        promotion_status: 'not_promoted',
        doctrine_status: 'candidate_not_doctrine',
        belief_movement: 'none'
      },
      source_formula_snapshot: clone(revision && revision.source_formula_snapshot),
      shape_terms: shapeTerms,
      force_terms: forceTerms,
      symbolic_formula: text(revision && revision.revised_symbolic_formula),
      force_equation: text(revision && revision.force_equation),
      guards: clone(asArray(revision && revision.guards)),
      validation: {
        source_validation: {
          source_revision_id: text(revision && revision.revision_id),
          source_revision_ok: true,
          source_l1_total: Number(revision && revision.source_l1_total || 0),
          revised_l1_total: Number(revision && revision.revised_l1_total || 0),
          mass_change: Number(revision && revision.mass_change || 0),
          coefficient_delta_total: Number(revision && revision.coefficient_delta_total || 0),
          source_formula_mutated: revision && revision.source_formula_mutated === true,
          belief_movement: 'none'
        },
        ledger_l1_total: l1(shapeTerms),
        force_terms_outside_shape: forceOutsideShape(shapeTerms, forceTerms),
        revised_dimension_count: shapeTerms.length,
        action_status: text(revision && revision.action_status),
        belief_movement: 'none'
      },
      revision_trail: clone(asArray(revision && revision.revision_trail)),
      rollback_available: true,
      rollback_target: clone(revision && revision.rollback_target),
      created_at: now(),
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function appendV0003(record, revision) {
    const concept = safeId(record && record.concept);
    const out = clone(record);
    const existing = asArray(out.versions).filter(version => version.version_id !== `${concept}_v0003_coefficient_dimension_revision`);
    const v3 = v0003Version(revision);
    out.versions = existing.concat([v3]);
    out.current_candidate_version = v3.version_id;
    out.revision_trail = asArray(out.revision_trail).concat([
      {
        event_id: `${concept}_trail_0003_coefficient_dimension_revision_stored`,
        event_type: 'coefficient_dimension_revision_stored',
        from_version_id: text(revision && revision.parent_version_id),
        to_version_id: v3.version_id,
        source_formula_snapshot_version_id: text(revision && revision.parent_version_id),
        source_formula_preserved: true,
        source_formula_mutated: false,
        revision_applied_to_source: false,
        applied_as_doctrine: false,
        belief_movement: 'none'
      }
    ]);
    out.rollback_available = true;
    out.rollback_targets = asArray(out.rollback_targets).concat([
      {
        from_version_id: v3.version_id,
        to_version_id: text(revision && revision.parent_version_id),
        reason: 'restore_pre_split_staged_revision_candidate',
        belief_movement: 'none'
      },
      {
        from_version_id: v3.version_id,
        to_version_id: `${concept}_v0001_compiled_formula`,
        reason: 'restore_original_compiled_formula_candidate',
        belief_movement: 'none'
      }
    ]);
    out.doctrine_status = 'candidate_not_doctrine';
    out.belief_movement = 'none';
    return out;
  }

  function validateVersion(version) {
    const errors = [];
    const shapeTerms = asArray(version && version.shape_terms);
    const forceTerms = asArray(version && version.force_terms);
    const total = l1(shapeTerms);
    if (Math.abs(1 - total) > EPSILON) errors.push(`l1_not_1:${total}`);
    if (!forceOutsideShape(shapeTerms, forceTerms)) errors.push('force_terms_not_outside_shape');
    if (version && version.promotion_status !== 'not_promoted') errors.push('version_promoted');
    if (version && version.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (version && version.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      version_id: text(version && version.version_id),
      source_type: text(version && version.source_type),
      ok: errors.length === 0,
      errors,
      l1_total: total,
      dimension_count: shapeTerms.length,
      force_terms_outside_shape: forceOutsideShape(shapeTerms, forceTerms),
      promotion_status: text(version && version.promotion_status),
      doctrine_status: text(version && version.doctrine_status),
      belief_movement: 'none'
    };
  }

  function validateRecord(record) {
    const versions = asArray(record && record.versions);
    const validations = versions.map(validateVersion);
    const errors = [];
    const compiled = versionByType(record, 'compiled_formula');
    const staged = versionByType(record, 'staged_revision');
    const codim = versionByType(record, 'coefficient_dimension_revision');
    if (!compiled) errors.push('missing_v0001_compiled_formula');
    if (!staged) errors.push('missing_v0002_staged_revision');
    if (!codim) errors.push('missing_v0003_coefficient_dimension_revision');
    if (versions.length < 3) errors.push(`version_count_less_than_3:${versions.length}`);
    if (codim && asArray(codim.shape_terms).length !== 10) errors.push(`v0003_dimension_count_not_10:${asArray(codim.shape_terms).length}`);
    if (codim && text(record.current_candidate_version) !== text(codim.version_id)) errors.push('current_candidate_not_v0003');
    if (codim && codim.formula_snapshot && codim.formula_snapshot.source_formula_mutated !== false) errors.push('source_formula_mutated');
    if (record && record.rollback_available !== true) errors.push('rollback_not_available');
    if (asArray(record && record.rollback_targets).length < 3) errors.push('rollback_targets_missing');
    if (new Set(versions.map(version => version.version_id)).size !== versions.length) errors.push('duplicate_version_ids');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.version_id}:${row.errors.join('|')}`); });
    return {
      ledger_id: text(record && record.ledger_id),
      concept: text(record && record.concept),
      ok: errors.length === 0,
      errors,
      version_count: versions.length,
      has_v0001_compiled_formula: !!compiled,
      has_v0002_staged_revision: !!staged,
      has_v0003_coefficient_dimension_revision: !!codim,
      current_candidate_version: text(record && record.current_candidate_version),
      v0003_dimension_count: codim ? asArray(codim.shape_terms).length : 0,
      version_validations: validations,
      rollback_available: record && record.rollback_available === true,
      no_silent_overwrite: errors.indexOf('duplicate_version_ids') === -1 && !!compiled && !!staged && !!codim,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.ledger_records);
    const recordValidations = records.map(validateRecord);
    const allVersions = records.flatMap(record => asArray(record.versions));
    const errors = [];
    const checks = {
      source_base_ledger_ok: packet && packet.source_base_ledger_ok === true,
      source_codim_revision_ok: packet && packet.source_codim_revision_ok === true,
      ledger_has_11_concepts: records.length === 11,
      version_count_at_least_3_per_concept: recordValidations.every(row => row.version_count >= 3),
      v0001_preserved_for_each_concept: recordValidations.every(row => row.has_v0001_compiled_formula === true),
      v0002_preserved_for_each_concept: recordValidations.every(row => row.has_v0002_staged_revision === true),
      v0003_stored_for_each_concept: recordValidations.every(row => row.has_v0003_coefficient_dimension_revision === true),
      current_candidate_is_v0003: recordValidations.every(row => text(row.current_candidate_version).includes('v0003_coefficient_dimension_revision')),
      v0003_dimension_count_10: recordValidations.every(row => row.v0003_dimension_count === 10),
      all_l1_totals_equal_1: recordValidations.every(row => row.version_validations.every(v => Math.abs(1 - Number(v.l1_total || 0)) <= EPSILON)),
      force_terms_outside_shape: recordValidations.every(row => row.version_validations.every(v => v.force_terms_outside_shape === true)),
      all_promotion_status_not_promoted: allVersions.every(version => version.promotion_status === 'not_promoted'),
      rollback_data_present: recordValidations.every(row => row.rollback_available === true),
      no_silent_overwrite: recordValidations.every(row => row.no_silent_overwrite === true),
      belief_movement_none: packet && packet.belief_movement === 'none' && allVersions.every(version => version.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key]) errors.push(key); });
    recordValidations.forEach(row => { if (!row.ok) errors.push(`${row.concept}:${row.errors.join('|')}`); });
    return {
      packet_type: '42ndMind_intention_canonical_formula_ledger_v0_1_1_validation',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      record_validations: recordValidations,
      errors,
      belief_movement: 'none'
    };
  }

  function runLedger(options = {}) {
    const baseLedgerPacket = options.base_ledger_packet || baseLedgerApi().runLedger(options.base_ledger_options || {});
    const codimPacket = options.codim_packet || codimApi().runRevisionEngine(options.codim_options || {});
    const records = asArray(baseLedgerPacket && baseLedgerPacket.ledger_records).map(record => {
      const revision = revisionForConcept(codimPacket, record.concept);
      return revision ? appendV0003(record, revision) : clone(record);
    });
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Canonical formula ledger v0.1.1 with v0003 coefficient/dimension revision candidate versions appended. Candidate only; no promotion; no source mutation.',
      source_base_ledger_ok: baseLedgerPacket && baseLedgerPacket.ok === true,
      source_codim_revision_ok: codimPacket && codimPacket.ok === true,
      source_base_ledger_record_count: baseLedgerPacket && baseLedgerPacket.ledger_record_count || 0,
      source_codim_revision_count: codimPacket && codimPacket.staged_revision_count || 0,
      ledger_id: 'canonical_formula_ledger_v0_1_1',
      ledger_record_count: records.length,
      total_version_count: records.reduce((sum, record) => sum + asArray(record.versions).length, 0),
      current_candidate_policy: 'v0003_coefficient_dimension_revision_is_current_candidate_but_not_promoted',
      promotion_policy: 'not_promoted_until_future_explicit_ledger_promotes',
      doctrine_status: 'candidate_not_doctrine',
      ledger_records: records,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionCanonicalFormulaLedgerV011 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    l1,
    forceOutsideShape,
    revisionForConcept,
    versionByType,
    v0003Version,
    appendV0003,
    validateVersion,
    validateRecord,
    validatePacket,
    runLedger
  });
})(typeof window !== 'undefined' ? window : globalThis);
