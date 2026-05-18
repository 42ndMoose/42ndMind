/* 42ndMind Intention Formula Inspector v0.1
 * Exposes current algebraic/candidate formula memory for a selected intention concept.
 * Read-only. Candidate-only. No promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_formula_inspector_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function ledgerApi() {
    if (!global.KernelIntentionCanonicalFormulaLedgerV011) throw new Error('KernelIntentionCanonicalFormulaLedgerV011 unavailable');
    return global.KernelIntentionCanonicalFormulaLedgerV011;
  }

  function proofApi() {
    if (!global.KernelIntentionProofOutputV01) throw new Error('KernelIntentionProofOutputV01 unavailable');
    return global.KernelIntentionProofOutputV01;
  }

  function doctrine() {
    return {
      inspector_is_read_only: true,
      exposes_formula_memory_without_promoting_it: true,
      shows_all_versions_v0001_v0002_v0003: true,
      shows_current_candidate_formula: true,
      shows_shape_terms_and_force_terms_separately: true,
      shows_l1_invariant: 'sum_abs_dimensions_equals_1',
      shows_force_intensity_outside_shape: 'F = M · i',
      links_formula_to_proof_reference: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
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

  function recordForConcept(ledgerPacket, concept) {
    const id = safeId(concept);
    return asArray(ledgerPacket && ledgerPacket.ledger_records).find(row => safeId(row.concept) === id) || null;
  }

  function proofForConcept(proofPacket, concept) {
    const id = safeId(concept);
    return asArray(proofPacket && proofPacket.proofs).find(row => safeId(row.concept) === id) || null;
  }

  function versionSummary(version, currentVersionId) {
    const shapeTerms = clone(asArray(version && version.shape_terms));
    const forceTerms = clone(asArray(version && version.force_terms));
    return {
      version_id: text(version && version.version_id),
      is_current_candidate: text(version && version.version_id) === text(currentVersionId),
      source_type: text(version && version.source_type),
      symbolic_formula: text(version && version.symbolic_formula),
      force_equation: text(version && version.force_equation),
      shape_terms: shapeTerms,
      force_terms: forceTerms,
      shape_term_count: shapeTerms.length,
      force_term_count: forceTerms.length,
      l1_total: l1(shapeTerms),
      force_terms_outside_shape: forceOutsideShape(shapeTerms, forceTerms),
      guards: clone(asArray(version && version.guards)),
      validation: clone(version && version.validation),
      rollback_available: version && version.rollback_available === true,
      rollback_target: clone(version && version.rollback_target),
      promotion_status: text(version && version.promotion_status),
      doctrine_status: text(version && version.doctrine_status),
      belief_movement: 'none'
    };
  }

  function inspectConcept(concept, options = {}) {
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const proofPacket = options.proof_packet || proofApi().runProofOutput(options.proof_options || {});
    const id = safeId(concept);
    const record = recordForConcept(ledgerPacket, id);
    if (!record) {
      return {
        packet_type: '42ndMind_intention_formula_inspection_result_v0_1',
        packet_version: VERSION,
        created_at: now(),
        ok: false,
        concept: id,
        error: 'concept_not_found',
        available_concepts: asArray(ledgerPacket && ledgerPacket.ledger_records).map(row => safeId(row.concept)),
        belief_movement: 'none'
      };
    }
    const currentId = text(record.current_candidate_version);
    const versions = asArray(record.versions).map(version => versionSummary(version, currentId));
    const current = versions.find(version => version.is_current_candidate) || versions[0] || null;
    const proof = proofForConcept(proofPacket, id);
    const inspection = {
      packet_type: '42ndMind_intention_formula_inspection_result_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: true,
      concept: id,
      ledger_id: text(record.ledger_id),
      current_candidate_version: currentId,
      current_candidate: current,
      versions,
      version_count: versions.length,
      version_types: versions.map(version => version.source_type),
      proof_reference: proof ? {
        proof_id: text(proof.proof_id),
        proof_step_count: Number(proof.proof_step_count || 0),
        proof_lines: clone(asArray(proof.proof_lines))
      } : null,
      rollback_available: record.rollback_available === true,
      rollback_targets: clone(asArray(record.rollback_targets)),
      revision_trail: clone(asArray(record.revision_trail)),
      doctrine_status: 'candidate_not_doctrine',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
    inspection.validation = validateInspection(inspection);
    inspection.ok = inspection.validation.ok === true;
    return inspection;
  }

  function inspectAll(options = {}) {
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const proofPacket = options.proof_packet || proofApi().runProofOutput(options.proof_options || {});
    const inspections = asArray(ledgerPacket && ledgerPacket.ledger_records).map(record => inspectConcept(record.concept, { ledger_packet: ledgerPacket, proof_packet: proofPacket }));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Read-only formula inspector exposing current candidate mathematical/algebraic formula memory for each intention concept.',
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      source_proof_ok: proofPacket && proofPacket.ok === true,
      source_proof_count: proofPacket && proofPacket.proof_count || 0,
      inspection_count: inspections.length,
      inspections,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  function validateInspection(inspection) {
    const errors = [];
    const versions = asArray(inspection && inspection.versions);
    const current = inspection && inspection.current_candidate;
    if (!inspection || inspection.ok !== true) errors.push('inspection_not_ok');
    if (!text(inspection && inspection.concept)) errors.push('missing_concept');
    if (versions.length < 3) errors.push(`version_count_less_than_3:${versions.length}`);
    if (!versions.some(version => version.source_type === 'compiled_formula')) errors.push('missing_compiled_formula');
    if (!versions.some(version => version.source_type === 'staged_revision')) errors.push('missing_staged_revision');
    if (!versions.some(version => version.source_type === 'coefficient_dimension_revision')) errors.push('missing_coefficient_dimension_revision');
    if (!current) errors.push('missing_current_candidate');
    if (current && !text(current.version_id).includes('v0003_coefficient_dimension_revision')) errors.push('current_candidate_not_v0003');
    if (current && Math.abs(1 - Number(current.l1_total || 0)) > EPSILON) errors.push(`current_l1_not_1:${current.l1_total}`);
    if (current && current.force_terms_outside_shape !== true) errors.push('force_terms_not_outside_shape');
    if (current && !text(current.symbolic_formula)) errors.push('missing_symbolic_formula');
    if (inspection && !inspection.proof_reference) errors.push('missing_proof_reference');
    if (versions.some(version => version.promotion_status !== 'not_promoted')) errors.push('version_promoted');
    if (versions.some(version => version.doctrine_status !== 'candidate_not_doctrine')) errors.push('version_doctrine_status_not_safe');
    if (inspection && inspection.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      concept: text(inspection && inspection.concept),
      ok: errors.length === 0,
      errors,
      current_candidate_version: text(inspection && inspection.current_candidate_version),
      version_count: versions.length,
      current_l1_total: current ? current.l1_total : null,
      current_force_terms_outside_shape: current ? current.force_terms_outside_shape : false,
      proof_reference_present: !!(inspection && inspection.proof_reference),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const inspections = asArray(packet && packet.inspections);
    const validations = inspections.map(validateInspection);
    const errors = [];
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (packet && packet.source_proof_ok !== true) errors.push('source_proof_not_ok');
    if (inspections.length !== 11) errors.push(`inspection_count_not_11:${inspections.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.concept}:${row.errors.join('|')}`); });
    const checks = {
      source_ledger_ok: packet && packet.source_ledger_ok === true,
      source_proof_ok: packet && packet.source_proof_ok === true,
      eleven_inspections: inspections.length === 11,
      all_have_three_versions: validations.every(row => row.version_count >= 3),
      current_candidate_is_v0003: validations.every(row => text(row.current_candidate_version).includes('v0003_coefficient_dimension_revision')),
      all_current_l1_totals_equal_1: validations.every(row => Math.abs(1 - Number(row.current_l1_total || 0)) <= EPSILON),
      all_force_terms_outside_shape: validations.every(row => row.current_force_terms_outside_shape === true),
      all_have_proof_reference: validations.every(row => row.proof_reference_present === true),
      read_only_candidate_not_promoted: inspections.every(row => asArray(row.versions).every(version => version.promotion_status === 'not_promoted' && version.doctrine_status === 'candidate_not_doctrine')),
      belief_movement_none: packet && packet.belief_movement === 'none' && inspections.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_intention_formula_inspector_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      inspection_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  global.KernelIntentionFormulaInspectorV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    l1,
    forceOutsideShape,
    recordForConcept,
    proofForConcept,
    versionSummary,
    inspectConcept,
    inspectAll,
    validateInspection,
    validatePacket
  });
})(typeof window !== 'undefined' ? window : globalThis);
