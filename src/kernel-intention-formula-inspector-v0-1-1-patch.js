/* 42ndMind Unified Formula Inspector v0.1.1 Patch
 * Combines canonical ledger concepts and admitted candidate meanings in one read-only inspector view.
 * No promotion. No silent mutation. No LLM. No lookup.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';
  const PACKET_TYPE = '42ndMind_unified_formula_inspector_v0_1_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function baseInspectorApi() {
    if (!global.KernelIntentionFormulaInspectorV01) throw new Error('KernelIntentionFormulaInspectorV01 unavailable');
    return global.KernelIntentionFormulaInspectorV01;
  }

  function admissionApi() {
    if (!global.KernelConceptAdmissionRegistryV01) throw new Error('KernelConceptAdmissionRegistryV01 unavailable');
    return global.KernelConceptAdmissionRegistryV01;
  }

  function doctrine() {
    const base = baseInspectorApi().doctrine();
    return Object.assign({}, base, {
      unified_inspector_shows_canonical_and_admitted_meanings: true,
      canonical_formulas_remain_separate_from_admitted_candidate_formulas: true,
      admitted_meanings_are_candidate_not_doctrine: true,
      no_admitted_formula_auto_promotes_to_canonical_ledger: true,
      admission_revision_hooks_visible: true,
      formula_origin_layer_visible: true,
      no_llm: true,
      no_source_lookup: true,
      patch_version: VERSION,
      belief_movement: 'none'
    });
  }

  function canonicalRecord(row) {
    const current = row && row.current_candidate || {};
    return {
      packet_type: '42ndMind_unified_formula_inspection_record_v0_1_1',
      record_type: 'canonical_formula',
      concept: text(row && row.concept),
      formula_origin_layer: 'canonical_formula_ledger',
      current_candidate_version: text(row && row.current_candidate_version),
      current_candidate: clone(current),
      versions: clone(asArray(row && row.versions)),
      version_count: Number(row && row.version_count || 0),
      proof_reference: clone(row && row.proof_reference),
      rollback_available: row && row.rollback_available === true,
      rollback_targets: clone(asArray(row && row.rollback_targets)),
      revision_hooks: [],
      admission_status: 'canonical_ledger_concept',
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      llm_used: false,
      external_lookup_performed: false,
      belief_movement: 'none'
    };
  }

  function admittedRecord(row) {
    const ext = admissionApi().toInspectorExtensionRecord(row);
    return {
      packet_type: '42ndMind_unified_formula_inspection_record_v0_1_1',
      record_type: 'admitted_candidate_formula',
      concept: text(ext.concept),
      formula_origin_layer: 'concept_admission_registry',
      current_candidate_version: text(ext.current_candidate_version),
      current_candidate: clone(ext.current_candidate),
      versions: clone(asArray(ext.versions)),
      version_count: Number(ext.version_count || 0),
      proof_reference: null,
      source_formula_snapshots: clone(asArray(row && row.versions && row.versions[0] && row.versions[0].source_formula_snapshots)),
      rollback_available: ext.rollback_available === true,
      rollback_targets: clone(asArray(row && row.rollback_targets)),
      revision_hooks: clone(asArray(ext.revision_hooks)),
      admission_status: text(row && row.admission_status),
      admission_mode: text(row && row.admission_mode),
      aliases: clone(asArray(row && row.aliases)),
      meaning_text: text(row && row.meaning_text),
      contradiction_notes: clone(asArray(row && row.contradiction_notes)),
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      llm_used: false,
      external_lookup_performed: false,
      belief_movement: 'none'
    };
  }

  function l1OfRecord(record) {
    const current = record && record.current_candidate || {};
    return Number(current.l1_total || 0);
  }

  function forceOutsideRecord(record) {
    const current = record && record.current_candidate || {};
    return current.force_terms_outside_shape === true;
  }

  function validateUnifiedRecord(record) {
    const errors = [];
    if (!text(record && record.record_type)) errors.push('missing_record_type');
    if (!text(record && record.concept)) errors.push('missing_concept');
    if (!text(record && record.formula_origin_layer)) errors.push('missing_formula_origin_layer');
    if (!text(record && record.current_candidate_version)) errors.push('missing_current_candidate_version');
    if (!record || !record.current_candidate || !text(record.current_candidate.symbolic_formula)) errors.push('missing_symbolic_formula');
    if (Math.abs(1 - l1OfRecord(record)) > EPSILON) errors.push(`l1_not_1:${l1OfRecord(record)}`);
    if (forceOutsideRecord(record) !== true) errors.push('force_terms_not_outside_shape');
    if (record && record.record_type === 'canonical_formula' && record.formula_origin_layer !== 'canonical_formula_ledger') errors.push('canonical_origin_wrong');
    if (record && record.record_type === 'admitted_candidate_formula' && record.formula_origin_layer !== 'concept_admission_registry') errors.push('admitted_origin_wrong');
    if (record && record.record_type === 'admitted_candidate_formula' && !asArray(record.source_formula_snapshots).length) errors.push('admitted_source_snapshots_missing');
    if (record && record.record_type === 'admitted_candidate_formula' && record.proof_reference !== null) errors.push('admitted_should_not_fake_proof_reference');
    if (record && record.promotion_status !== 'not_promoted') errors.push('promoted');
    if (record && record.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (record && record.llm_used !== false) errors.push('llm_used');
    if (record && record.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (record && record.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      concept: text(record && record.concept),
      record_type: text(record && record.record_type),
      ok: errors.length === 0,
      errors,
      l1_total: l1OfRecord(record),
      force_terms_outside_shape: forceOutsideRecord(record),
      formula_origin_layer: text(record && record.formula_origin_layer),
      belief_movement: 'none'
    };
  }

  function inspectAllUnified(options = {}) {
    const canonicalPacket = options.canonical_packet || baseInspectorApi().inspectAll(options.inspector_options || {});
    const admissionPacket = options.admission_packet || admissionApi().runAdmissionRegistry({ inspector_packet: canonicalPacket });
    const canonicalRecords = asArray(canonicalPacket && canonicalPacket.inspections).map(canonicalRecord);
    const admittedRecords = asArray(admissionPacket && admissionPacket.admission_records).map(admittedRecord);
    const records = canonicalRecords.concat(admittedRecords);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Unified read-only formula inspector for canonical ledger concepts and admitted candidate meanings.',
      source_formula_inspector_ok: canonicalPacket && canonicalPacket.ok === true,
      source_admission_registry_ok: admissionPacket && admissionPacket.ok === true,
      canonical_count: canonicalRecords.length,
      admitted_count: admittedRecords.length,
      total_formula_record_count: records.length,
      canonical_records: canonicalRecords,
      admitted_records: admittedRecords,
      formula_records: records,
      doctrine: doctrine(),
      llm_used: false,
      external_lookup_performed: false,
      belief_movement: 'none'
    };
    packet.validation = validateUnifiedPacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  function inspectConceptUnified(concept, options = {}) {
    const packet = options.unified_packet || inspectAllUnified(options);
    const id = safeId(concept);
    const matches = asArray(packet && packet.formula_records).filter(row => safeId(row.concept) === id);
    return {
      packet_type: '42ndMind_unified_formula_inspection_selected_v0_1_1',
      packet_version: VERSION,
      created_at: now(),
      ok: matches.length > 0,
      concept: id,
      match_count: matches.length,
      matches,
      belief_movement: 'none'
    };
  }

  function validateUnifiedPacket(packet) {
    const records = asArray(packet && packet.formula_records);
    const validations = records.map(validateUnifiedRecord);
    const errors = [];
    if (packet && packet.source_formula_inspector_ok !== true) errors.push('source_formula_inspector_not_ok');
    if (packet && packet.source_admission_registry_ok !== true) errors.push('source_admission_registry_not_ok');
    if (packet && packet.canonical_count !== 11) errors.push(`canonical_count_not_11:${packet && packet.canonical_count}`);
    if (packet && packet.admitted_count !== 6) errors.push(`admitted_count_not_6:${packet && packet.admitted_count}`);
    if (records.length !== 17) errors.push(`total_formula_record_count_not_17:${records.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.concept}:${row.errors.join('|')}`); });
    const checks = {
      source_formula_inspector_ok: packet && packet.source_formula_inspector_ok === true,
      source_admission_registry_ok: packet && packet.source_admission_registry_ok === true,
      eleven_canonical_records: packet && packet.canonical_count === 11,
      six_admitted_records: packet && packet.admitted_count === 6,
      seventeen_total_formula_records: records.length === 17,
      canonical_and_admitted_layers_separate: asArray(packet && packet.canonical_records).every(row => row.formula_origin_layer === 'canonical_formula_ledger') && asArray(packet && packet.admitted_records).every(row => row.formula_origin_layer === 'concept_admission_registry'),
      all_l1_totals_equal_1: validations.every(row => Math.abs(1 - Number(row.l1_total || 0)) <= EPSILON),
      all_force_terms_outside_shape: validations.every(row => row.force_terms_outside_shape === true),
      admitted_source_snapshots_present: asArray(packet && packet.admitted_records).every(row => asArray(row.source_formula_snapshots).length >= 1),
      admission_revision_hooks_visible: asArray(packet && packet.admitted_records).filter(row => asArray(row.contradiction_notes).length > 0).every(row => asArray(row.revision_hooks).length === asArray(row.contradiction_notes).length),
      no_fake_proof_for_admitted_records: asArray(packet && packet.admitted_records).every(row => row.proof_reference === null),
      no_llm_used: records.every(row => row.llm_used === false) && packet && packet.llm_used === false,
      no_external_lookup: records.every(row => row.external_lookup_performed === false) && packet && packet.external_lookup_performed === false,
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_unified_formula_inspector_validation_v0_1_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      record_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  global.KernelUnifiedFormulaInspectorV011 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    canonicalRecord,
    admittedRecord,
    l1OfRecord,
    forceOutsideRecord,
    validateUnifiedRecord,
    inspectAllUnified,
    inspectConceptUnified,
    validateUnifiedPacket
  });
})(typeof window !== 'undefined' ? window : globalThis);
