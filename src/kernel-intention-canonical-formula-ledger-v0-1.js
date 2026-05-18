/* 42ndMind Intention Canonical Formula Ledger v0.1
 * Stores compiled intention formulas and staged revision candidates in a
 * versioned, non-doctrinal ledger.
 *
 * This ledger does not decide real-world intent, does not store people/events,
 * does not resolve contradiction pressure, and does not promote doctrine.
 * It preserves source formula snapshots, staged revision guards, validation
 * results, rollback data, unit-total local shape, and force/shape separation.
 *
 * Core doctrine:
 * formula ledger is candidate memory, not belief/world-model memory
 * compiled formulas and staged revisions both remain candidate versions
 * no formula replacement without version trail
 * no silent source mutation
 * local shape remains Σ |dimension_i| = 1
 * force/intensity remains outside shape: F = M · i
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_canonical_formula_ledger_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'concept'; }

  function expansionApi() {
    if (!global.KernelIntentionConceptExpansionLoopV01) throw new Error('KernelIntentionConceptExpansionLoopV01 unavailable');
    return global.KernelIntentionConceptExpansionLoopV01;
  }

  function revisionApi() {
    if (!global.KernelIntentionFormulaRevisionEngineV01) throw new Error('KernelIntentionFormulaRevisionEngineV01 unavailable');
    return global.KernelIntentionFormulaRevisionEngineV01;
  }

  function doctrine() {
    return {
      stores_formula_versions_not_world_beliefs: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      compiled_formulas_remain_candidate_versions: true,
      staged_revisions_remain_candidate_versions: true,
      promotion_requires_future_explicit_ledger: true,
      no_silent_source_mutation: true,
      no_formula_replacement_without_version_trail: true,
      rollback_data_required: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      contradiction_detection_is_not_contradiction_resolution: true,
      belief_movement: 'none'
    };
  }

  function compiledFormulas(expansionPacket) {
    const compiled = expansionPacket && expansionPacket.compiled_packet;
    return asArray(compiled && compiled.compiled_formulas);
  }

  function compiledValidation(expansionPacket, concept) {
    const id = safeId(concept);
    const validations = expansionPacket && expansionPacket.compiled_packet && expansionPacket.compiled_packet.validation && expansionPacket.compiled_packet.validation.validations;
    return clone(asArray(validations).find(v => safeId(v.concept) === id) || null);
  }

  function revisionValidation(revisionPacket, concept) {
    const id = safeId(concept);
    const validations = revisionPacket && revisionPacket.validation && revisionPacket.validation.validations;
    return clone(asArray(validations).find(v => safeId(v.concept) === id) || null);
  }

  function revisionForConcept(revisionPacket, concept) {
    const id = safeId(concept);
    return asArray(revisionPacket && revisionPacket.revision_candidates).find(c => safeId(c.concept) === id) || null;
  }

  function shapeL1(terms) {
    return Number(asArray(terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
  }

  function forceOutsideShape(shapeTerms, forceTerms) {
    const shape = new Set(asArray(shapeTerms).map(term => safeId(term.dimension)));
    return asArray(forceTerms).every(force => !shape.has(safeId(force.dimension)));
  }

  function compiledVersion(formula, expansionPacket) {
    const concept = safeId(formula && formula.concept);
    const versionId = `${concept}_v0001_compiled_formula`;
    const shapeTerms = clone(asArray(formula && formula.shape_terms));
    const forceTerms = clone(asArray(formula && formula.force_terms));
    return {
      version_id: versionId,
      source_type: 'compiled_formula',
      concept,
      formula_snapshot: {
        packet_type: text(formula && formula.packet_type),
        packet_version: text(formula && formula.packet_version),
        created_at: text(formula && formula.created_at),
        concept,
        scope_total: Number(formula && formula.scope_total || 0),
        core_terms: clone(asArray(formula && formula.core_terms)),
        boundary_terms: clone(asArray(formula && formula.boundary_terms)),
        derivative_expression_terms: clone(asArray(formula && formula.derivative_expression_terms)),
        unresolved_terms: clone(asArray(formula && formula.unresolved_terms)),
        shape_terms: clone(shapeTerms),
        force_terms: clone(forceTerms),
        neighbor_transitions: clone(asArray(formula && formula.neighbor_transitions)),
        invariance_status: clone(formula && formula.invariance_status),
        symbolic_formula: text(formula && formula.symbolic_formula),
        force_equation: text(formula && formula.force_equation),
        review_status: text(formula && formula.review_status),
        belief_movement: 'none'
      },
      shape_terms: shapeTerms,
      force_terms: forceTerms,
      symbolic_formula: text(formula && formula.symbolic_formula),
      force_equation: text(formula && formula.force_equation),
      guards: [],
      validation: {
        source_validation: compiledValidation(expansionPacket, concept),
        ledger_l1_total: shapeL1(shapeTerms),
        force_terms_outside_shape: forceOutsideShape(shapeTerms, forceTerms),
        belief_movement: 'none'
      },
      created_at: now(),
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function stagedRevisionVersion(revision, compiledVersionRow, revisionPacket) {
    const concept = safeId(revision && revision.concept);
    const versionId = `${concept}_v0002_staged_revision`;
    const shapeTerms = clone(asArray(revision && revision.staged_shape_terms));
    const forceTerms = clone(asArray(revision && revision.staged_force_terms));
    return {
      version_id: versionId,
      source_type: 'staged_revision',
      concept,
      parent_version_id: compiledVersionRow && compiledVersionRow.version_id,
      formula_snapshot: {
        packet_type: text(revision && revision.packet_type),
        packet_version: text(revision && revision.packet_version),
        created_at: text(revision && revision.created_at),
        concept,
        revision_kind: text(revision && revision.revision_kind),
        source_review_status: text(revision && revision.source_review_status),
        staged_review_status: text(revision && revision.staged_review_status),
        source_formula_snapshot: clone(revision && revision.source_formula_snapshot),
        staged_shape_terms: clone(shapeTerms),
        staged_force_terms: clone(forceTerms),
        revision_guards: clone(asArray(revision && revision.revision_guards)),
        revised_symbolic_formula: text(revision && revision.revised_symbolic_formula),
        action_status: text(revision && revision.action_status),
        revision_changes_source_coefficients: revision && revision.revision_changes_source_coefficients === true,
        revision_changes_source_shape_terms: revision && revision.revision_changes_source_shape_terms === true,
        revision_adds_guards: revision && revision.revision_adds_guards === true,
        promotion_status: 'not_promoted',
        belief_movement: 'none'
      },
      source_formula_snapshot: clone(revision && revision.source_formula_snapshot),
      shape_terms: shapeTerms,
      force_terms: forceTerms,
      symbolic_formula: text(revision && revision.revised_symbolic_formula),
      force_equation: text(revision && revision.source_formula_snapshot && revision.source_formula_snapshot.force_equation),
      guards: clone(asArray(revision && revision.revision_guards)),
      validation: {
        source_validation: revisionValidation(revisionPacket, concept),
        ledger_l1_total: shapeL1(shapeTerms),
        force_terms_outside_shape: forceOutsideShape(shapeTerms, forceTerms),
        action_status: text(revision && revision.action_status),
        source_l1_total: Number(revision && revision.source_l1_total || 0),
        revised_l1_total: Number(revision && revision.revised_l1_total || 0),
        belief_movement: 'none'
      },
      created_at: now(),
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function sourceSnapshotMatchesCompiled(stagedVersion, compiledVersionRow) {
    const stagedSource = stagedVersion && stagedVersion.source_formula_snapshot;
    const compiledSnapshot = compiledVersionRow && compiledVersionRow.formula_snapshot;
    return text(stagedSource && stagedSource.symbolic_formula) === text(compiledSnapshot && compiledSnapshot.symbolic_formula) &&
      JSON.stringify(asArray(stagedSource && stagedSource.shape_terms)) === JSON.stringify(asArray(compiledSnapshot && compiledSnapshot.shape_terms));
  }

  function buildLedgerRecord(formula, revision, expansionPacket, revisionPacket) {
    const concept = safeId(formula && formula.concept);
    const v1 = compiledVersion(formula, expansionPacket);
    const v2 = revision ? stagedRevisionVersion(revision, v1, revisionPacket) : null;
    const versions = [v1].concat(v2 ? [v2] : []);
    const revisionTrail = [
      {
        event_id: `${concept}_trail_0001_compiled_formula_stored`,
        event_type: 'compiled_formula_stored',
        from_version_id: null,
        to_version_id: v1.version_id,
        source_formula_preserved: true,
        applied_as_doctrine: false,
        belief_movement: 'none'
      }
    ];
    if (v2) {
      revisionTrail.push({
        event_id: `${concept}_trail_0002_staged_revision_stored`,
        event_type: 'staged_revision_stored',
        from_version_id: v1.version_id,
        to_version_id: v2.version_id,
        source_formula_snapshot_version_id: v1.version_id,
        source_snapshot_matches_compiled_version: sourceSnapshotMatchesCompiled(v2, v1),
        source_formula_preserved: true,
        revision_applied_to_source: false,
        applied_as_doctrine: false,
        belief_movement: 'none'
      });
    }
    return {
      ledger_id: `canonical_formula_ledger_${concept}_v0_1`,
      concept,
      current_candidate_version: v2 ? v2.version_id : v1.version_id,
      versions,
      revision_trail: revisionTrail,
      rollback_available: true,
      rollback_targets: v2 ? [{ from_version_id: v2.version_id, to_version_id: v1.version_id, reason: 'restore_compiled_formula_snapshot_before_staged_revision', belief_movement: 'none' }] : [],
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function validateVersion(version) {
    const errors = [];
    const l1 = shapeL1(version && version.shape_terms);
    if (Math.abs(1 - l1) > EPSILON) errors.push(`l1_not_1:${l1}`);
    if (!forceOutsideShape(version && version.shape_terms, version && version.force_terms)) errors.push('force_terms_leaked_into_shape');
    if (version && version.promotion_status !== 'not_promoted') errors.push('promotion_status_not_safe');
    if (version && version.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (version && version.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (!text(version && version.symbolic_formula).includes('Σ|dimension_i| = 1')) errors.push('symbolic_formula_missing_unit_total');
    return {
      version_id: text(version && version.version_id),
      source_type: text(version && version.source_type),
      ok: errors.length === 0,
      errors,
      l1_total: l1,
      force_terms_outside_shape: forceOutsideShape(version && version.shape_terms, version && version.force_terms),
      promotion_status: text(version && version.promotion_status),
      doctrine_status: text(version && version.doctrine_status),
      belief_movement: 'none'
    };
  }

  function validateRecord(record) {
    const versions = asArray(record && record.versions);
    const versionValidations = versions.map(validateVersion);
    const errors = [];
    const compiled = versions.find(v => v.source_type === 'compiled_formula');
    const staged = versions.find(v => v.source_type === 'staged_revision');
    if (!compiled) errors.push('missing_compiled_formula_version');
    if (!staged) errors.push('missing_staged_revision_version');
    if (versions.length < 2) errors.push('version_count_less_than_2');
    if (record && record.doctrine_status !== 'candidate_not_doctrine') errors.push('record_doctrine_status_not_safe');
    if (record && record.belief_movement !== 'none') errors.push('record_belief_movement_not_none');
    if (record && record.rollback_available !== true) errors.push('rollback_not_available');
    if (!asArray(record && record.rollback_targets).length) errors.push('missing_rollback_targets');
    if (new Set(versions.map(v => v.version_id)).size !== versions.length) errors.push('duplicate_version_ids');
    versionValidations.forEach(v => { if (!v.ok) errors.push(`${v.version_id}:${v.errors.join('|')}`); });
    if (compiled && staged && !sourceSnapshotMatchesCompiled(staged, compiled)) errors.push('staged_source_snapshot_does_not_match_compiled_version');
    if (record && asArray(record.revision_trail).length < versions.length) errors.push('revision_trail_too_short');
    return {
      concept: text(record && record.concept),
      ok: errors.length === 0,
      errors,
      version_count: versions.length,
      compiled_version_count: versions.filter(v => v.source_type === 'compiled_formula').length,
      staged_revision_version_count: versions.filter(v => v.source_type === 'staged_revision').length,
      version_validations: versionValidations,
      rollback_available: record && record.rollback_available === true,
      no_silent_overwrite: errors.indexOf('staged_source_snapshot_does_not_match_compiled_version') === -1 && errors.indexOf('revision_trail_too_short') === -1 && errors.indexOf('duplicate_version_ids') === -1,
      belief_movement: 'none'
    };
  }

  function validateLedgerPacket(packet) {
    const records = asArray(packet && packet.ledger_records);
    const recordValidations = records.map(validateRecord);
    const allVersions = records.flatMap(record => asArray(record.versions));
    const checks = {
      ledger_has_11_concepts: records.length === 11,
      compiled_version_stored_for_each_concept: recordValidations.every(v => v.compiled_version_count >= 1),
      staged_revision_version_stored_for_each_concept: recordValidations.every(v => v.staged_revision_version_count >= 1),
      version_count_at_least_2_per_concept: recordValidations.every(v => v.version_count >= 2),
      all_l1_totals_equal_1: recordValidations.every(rv => rv.version_validations.every(v => Math.abs(1 - Number(v.l1_total || 0)) <= EPSILON)),
      force_terms_outside_shape: recordValidations.every(rv => rv.version_validations.every(v => v.force_terms_outside_shape === true)),
      all_promotion_status_not_promoted: allVersions.every(v => v.promotion_status === 'not_promoted'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(r => r.belief_movement === 'none') && allVersions.every(v => v.belief_movement === 'none'),
      rollback_data_present: records.every(r => r.rollback_available === true && asArray(r.rollback_targets).length >= 1),
      no_silent_overwrite: recordValidations.every(v => v.no_silent_overwrite === true)
    };
    const errors = [];
    Object.keys(checks).forEach(key => { if (!checks[key]) errors.push(key); });
    recordValidations.forEach(v => { if (!v.ok) errors.push(`${v.concept}:${v.errors.join('|')}`); });
    return {
      packet_type: '42ndMind_intention_canonical_formula_ledger_validation_v0_1',
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
    const expansionPacket = options.expansion_packet || expansionApi().runExpansion(options.expansion_options || {});
    const revisionPacket = options.revision_packet || revisionApi().runRevisionEngine(Object.assign({}, options.revision_options || {}, { expansion_packet: expansionPacket }));
    const formulas = compiledFormulas(expansionPacket);
    const records = formulas.map(formula => buildLedgerRecord(formula, revisionForConcept(revisionPacket, formula.concept), expansionPacket, revisionPacket));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Versioned candidate ledger for compiled intention formulas and staged formula revisions. Candidate only, not doctrine, no belief/world-model storage.',
      ledger_id: 'canonical_formula_ledger_v0_1',
      source_expansion_ok: expansionPacket && expansionPacket.ok === true,
      source_revision_ok: revisionPacket && revisionPacket.ok === true,
      source_compiled_formula_count: formulas.length,
      source_revision_candidate_count: asArray(revisionPacket && revisionPacket.revision_candidates).length,
      ledger_record_count: records.length,
      current_candidate_policy: 'latest_staged_revision_is_current_candidate_but_not_promoted',
      promotion_policy: 'not_promoted_until_future_explicit_ledger_promotes',
      doctrine_status: 'candidate_not_doctrine',
      ledger_records: records,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validateLedgerPacket(packet);
    packet.ok = packet.validation.ok === true && packet.source_expansion_ok === true && packet.source_revision_ok === true;
    return packet;
  }

  global.KernelIntentionCanonicalFormulaLedgerV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    compiledFormulas,
    compiledValidation,
    revisionValidation,
    revisionForConcept,
    shapeL1,
    forceOutsideShape,
    compiledVersion,
    stagedRevisionVersion,
    sourceSnapshotMatchesCompiled,
    buildLedgerRecord,
    validateVersion,
    validateRecord,
    validateLedgerPacket,
    runLedger
  });
})(typeof window !== 'undefined' ? window : globalThis);
