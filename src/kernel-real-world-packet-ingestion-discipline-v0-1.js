/* 42ndMind Real-World Packet Ingestion Discipline v0.1
 * Defines how user-described real-world material enters the kernel without becoming automatic truth.
 * Consumes adversarial narrative-pressure suite v0.1.
 * No real people/events as built-ins. No political-specific built-ins. No LLM. No lookup. No truth promotion.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_real_world_packet_ingestion_discipline_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }

  function adversarialApi() {
    if (!global.KernelAdversarialNarrativePressureV01) throw new Error('KernelAdversarialNarrativePressureV01 unavailable');
    return global.KernelAdversarialNarrativePressureV01;
  }

  function doctrine() {
    return {
      real_world_material_enters_as_packet_not_truth: true,
      user_description_is_context_not_truth: true,
      media_description_is_context_not_media_verification: true,
      source_reference_is_anchor_not_lookup: true,
      evidence_claim_is_separate_from_evidence_verification: true,
      raw_description_preserved_without_silent_mutation: true,
      uncertainty_notes_required: true,
      ingestion_warnings_required: true,
      adversarial_pressure_hooks_required: true,
      truth_pressure_hooks_required: true,
      contradiction_detection_is_not_resolution: true,
      no_llm: true,
      no_source_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      candidate_only_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function sampleMaterials() {
    return [
      {
        material_id: 'rw_video_user_description_001',
        material_type: 'video_user_description',
        user_supplied_description: 'A user describes a video where a package appears to be placed near a closed office door after hours.',
        source_reference: { reference_type: 'user_observation', locator: 'user-described video', custody_status: 'not_verified' },
        media_description: { media_type: 'video', has_original_media: false, transcript_available: false, metadata_available: false },
        extracted_claims: ['package_placed_near_closed_office_after_hours'],
        evidence_claims: ['visual_sequence_claimed_by_user'],
        uncertainty_notes: ['original_video_not_loaded', 'timestamp_not_verified', 'camera_context_unknown'],
        expected_ingestion_status: 'context_packet_ready_not_truth'
      },
      {
        material_id: 'rw_screenshot_claim_001',
        material_type: 'screenshot_description',
        user_supplied_description: 'A screenshot is described as showing a rule change notice and a timestamp.',
        source_reference: { reference_type: 'screenshot', locator: 'described screenshot', custody_status: 'not_verified' },
        media_description: { media_type: 'image', has_original_media: false, transcript_available: false, metadata_available: false },
        extracted_claims: ['rule_change_notice_exists', 'timestamp_visible_in_screenshot'],
        evidence_claims: ['image_text_claimed_by_user'],
        uncertainty_notes: ['image_not_loaded', 'metadata_not_verified', 'editing_or_crop_status_unknown'],
        expected_ingestion_status: 'media_context_packet_ready_not_truth'
      },
      {
        material_id: 'rw_quote_clip_001',
        material_type: 'quote_or_transcript_fragment',
        user_supplied_description: 'A quote fragment is provided without the full preceding and following sentence.',
        source_reference: { reference_type: 'quote_fragment', locator: 'partial quote', custody_status: 'partial_context' },
        media_description: { media_type: 'text_fragment', has_original_media: false, transcript_available: false, metadata_available: false },
        extracted_claims: ['speaker_used_fragment'],
        evidence_claims: ['partial_text_claimed_by_user'],
        uncertainty_notes: ['full_context_missing', 'speaker_identity_not_verified', 'quote_boundary_unknown'],
        expected_ingestion_status: 'quote_context_packet_ready_not_truth'
      },
      {
        material_id: 'rw_article_summary_001',
        material_type: 'article_summary',
        user_supplied_description: 'A user summarizes an article as claiming that a policy caused a later outcome.',
        source_reference: { reference_type: 'article_summary', locator: 'user-described article', custody_status: 'not_checked' },
        media_description: { media_type: 'article', has_original_media: false, transcript_available: false, metadata_available: false },
        extracted_claims: ['article_claims_policy_caused_outcome'],
        evidence_claims: ['causal_claim_reported_by_user'],
        uncertainty_notes: ['article_not_loaded', 'causal_bridge_not_verified', 'source_framing_unknown'],
        expected_ingestion_status: 'article_context_packet_ready_not_truth'
      },
      {
        material_id: 'rw_social_thread_001',
        material_type: 'social_media_thread_description',
        user_supplied_description: 'A user describes several reposts repeating the same anonymous allegation.',
        source_reference: { reference_type: 'social_thread', locator: 'user-described repost chain', custody_status: 'not_verified' },
        media_description: { media_type: 'social_posts', has_original_media: false, transcript_available: false, metadata_available: false },
        extracted_claims: ['anonymous_allegation_repeated_by_multiple_posts'],
        evidence_claims: ['repost_repetition_claimed_by_user'],
        uncertainty_notes: ['original_source_unknown', 'duplicate_provenance_possible', 'independence_not_established'],
        expected_ingestion_status: 'social_context_packet_ready_not_truth'
      },
      {
        material_id: 'rw_document_record_001',
        material_type: 'document_record_description',
        user_supplied_description: 'A document is described as containing two dates that do not match a later summary.',
        source_reference: { reference_type: 'document_record', locator: 'user-described document', custody_status: 'not_verified' },
        media_description: { media_type: 'document', has_original_media: false, transcript_available: false, metadata_available: false },
        extracted_claims: ['document_dates_conflict_with_summary'],
        evidence_claims: ['documentary_discrepancy_claimed_by_user'],
        uncertainty_notes: ['document_not_loaded', 'document_version_unknown', 'summary_context_unknown'],
        expected_ingestion_status: 'document_context_packet_ready_not_truth'
      },
      {
        material_id: 'rw_direct_observation_001',
        material_type: 'direct_observation_report',
        user_supplied_description: 'A user reports directly seeing a sign removed from a door.',
        source_reference: { reference_type: 'direct_observation', locator: 'user observation', custody_status: 'self_reported' },
        media_description: { media_type: 'none', has_original_media: false, transcript_available: false, metadata_available: false },
        extracted_claims: ['sign_removed_from_door'],
        evidence_claims: ['direct_observation_claimed_by_user'],
        uncertainty_notes: ['no_independent_record_attached', 'time_not_externally_verified', 'observer_error_possible'],
        expected_ingestion_status: 'direct_observation_packet_ready_not_truth'
      },
      {
        material_id: 'rw_hostile_reframe_report_001',
        material_type: 'hostile_reframe_report',
        user_supplied_description: 'A user says an original scoped claim was reframed by someone else into an absolute accusation.',
        source_reference: { reference_type: 'user_reported_reframe', locator: 'described hostile reframe', custody_status: 'not_verified' },
        media_description: { media_type: 'conversation_or_post', has_original_media: false, transcript_available: false, metadata_available: false },
        extracted_claims: ['scoped_claim_reframed_as_absolute_accusation'],
        evidence_claims: ['adversarial_reframe_claimed_by_user'],
        uncertainty_notes: ['original_claim_text_missing', 'reframe_text_missing', 'speaker_context_unknown'],
        expected_ingestion_status: 'adversarial_context_packet_ready_not_truth'
      }
    ];
  }

  function warningSet(material) {
    const warnings = ['user_description_context_not_truth', 'external_lookup_not_performed', 'belief_not_moved'];
    const media = material.media_description || {};
    const source = material.source_reference || {};
    if (media.has_original_media !== true) warnings.push('original_media_not_verified');
    if (media.metadata_available !== true) warnings.push('metadata_not_verified');
    if (media.transcript_available !== true && ['video', 'audio', 'conversation_or_post', 'text_fragment'].includes(text(media.media_type))) warnings.push('full_transcript_or_context_missing');
    if (['not_verified', 'not_checked', 'partial_context', 'self_reported'].includes(text(source.custody_status))) warnings.push('source_custody_not_verified');
    if (asArray(material.uncertainty_notes).length === 0) warnings.push('uncertainty_notes_missing');
    if (lower(material.user_supplied_description).includes('caused')) warnings.push('causal_bridge_required_before_causal_truth');
    if (lower(material.user_supplied_description).includes('anonymous') || lower(material.user_supplied_description).includes('reposts')) warnings.push('duplicate_provenance_or_anonymous_source_risk');
    if (lower(material.user_supplied_description).includes('reframed') || lower(material.user_supplied_description).includes('absolute accusation')) warnings.push('adversarial_reframe_risk_visible');
    return unique(warnings);
  }

  function adversarialHooks(material) {
    const s = lower(`${material.material_type} ${material.user_supplied_description} ${asArray(material.uncertainty_notes).join(' ')}`);
    const hooks = [];
    if (s.includes('reframed') || s.includes('absolute')) hooks.push('quantifier_or_scope_distortion_check');
    if (s.includes('partial') || s.includes('fragment') || s.includes('quote')) hooks.push('quote_clipping_or_context_stripping_check');
    if (s.includes('anonymous') || s.includes('repost')) hooks.push('source_laundering_or_duplicate_provenance_check');
    if (s.includes('caused') || s.includes('causal')) hooks.push('causal_overclaim_check');
    if (s.includes('allegation') || s.includes('accusation')) hooks.push('loaded_label_or_motive_stuffing_check');
    if (hooks.length === 0) hooks.push('general_adversarial_pressure_scan');
    return unique(hooks);
  }

  function truthPressureHooks(material) {
    const hooks = ['support_pressure_candidate', 'unresolved_gap_pressure_candidate'];
    const s = lower(`${material.material_type} ${material.user_supplied_description} ${asArray(material.uncertainty_notes).join(' ')}`);
    if (s.includes('conflict') || s.includes('do not match')) hooks.push('contradiction_pressure_candidate');
    if (s.includes('caused')) hooks.push('causal_bridge_required');
    if (s.includes('anonymous') || s.includes('not verified')) hooks.push('low_trust_source_posture');
    if (s.includes('multiple') || s.includes('two')) hooks.push('corroboration_or_duplicate_provenance_check');
    return unique(hooks);
  }

  function ingestionStatus(material) {
    return text(material.expected_ingestion_status || 'context_packet_ready_not_truth');
  }

  function ingestionRecord(material) {
    const warnings = warningSet(material);
    return {
      ingestion_record_id: `${safeId(material.material_id)}_ingestion_v0_1`,
      material_id: text(material.material_id),
      material_type: text(material.material_type),
      ingestion_status: ingestionStatus(material),
      expected_ingestion_status: text(material.expected_ingestion_status),
      expected_match: ingestionStatus(material) === text(material.expected_ingestion_status),
      raw_packet: {
        user_supplied_description: text(material.user_supplied_description),
        source_reference: material.source_reference || {},
        media_description: material.media_description || {},
        extracted_claims: asArray(material.extracted_claims),
        evidence_claims: asArray(material.evidence_claims),
        uncertainty_notes: asArray(material.uncertainty_notes)
      },
      separation: {
        raw_description_preserved: true,
        source_reference_separate: true,
        media_description_separate: true,
        extracted_claims_separate: true,
        evidence_claims_separate: true,
        uncertainty_notes_separate: true,
        warnings_separate: true,
        truth_pressure_hooks_separate: true,
        adversarial_pressure_hooks_separate: true
      },
      ingestion_warnings: warnings,
      adversarial_pressure_hooks: adversarialHooks(material),
      truth_pressure_hooks: truthPressureHooks(material),
      source_status: 'anchor_recorded_lookup_not_performed',
      media_status: 'description_recorded_media_not_verified',
      evidence_status: 'evidence_claims_recorded_not_verified',
      context_status: 'context_not_truth',
      truth_status: 'not_adjudicated',
      contradiction_resolution: 'not_resolved',
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function statusCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.ingestion_status] = (acc[row.ingestion_status] || 0) + 1;
      return acc;
    }, {});
  }

  function validateRecord(row) {
    const errors = [];
    if (!text(row && row.ingestion_record_id)) errors.push('missing_ingestion_record_id');
    if (!text(row && row.material_id)) errors.push('missing_material_id');
    if (!text(row && row.material_type)) errors.push('missing_material_type');
    if (row && row.expected_match !== true) errors.push(`ingestion_status_mismatch:${row.ingestion_status}:${row.expected_ingestion_status}`);
    const raw = row && row.raw_packet || {};
    if (!text(raw.user_supplied_description)) errors.push('raw_description_missing');
    if (!row || !row.separation || row.separation.raw_description_preserved !== true) errors.push('raw_preservation_missing');
    if (!row || !row.separation || row.separation.source_reference_separate !== true) errors.push('source_separation_missing');
    if (!row || !row.separation || row.separation.media_description_separate !== true) errors.push('media_separation_missing');
    if (!row || !row.separation || row.separation.evidence_claims_separate !== true) errors.push('evidence_separation_missing');
    if (!row || !row.separation || row.separation.uncertainty_notes_separate !== true) errors.push('uncertainty_separation_missing');
    if (asArray(row && row.ingestion_warnings).length === 0) errors.push('warnings_missing');
    if (asArray(row && row.adversarial_pressure_hooks).length === 0) errors.push('adversarial_hooks_missing');
    if (asArray(row && row.truth_pressure_hooks).length === 0) errors.push('truth_hooks_missing');
    if (row && row.context_status !== 'context_not_truth') errors.push('context_became_truth');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.contradiction_resolution !== 'not_resolved') errors.push('contradiction_resolved');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      material_id: text(row && row.material_id),
      ok: errors.length === 0,
      errors,
      material_type: text(row && row.material_type),
      ingestion_status: text(row && row.ingestion_status),
      warning_count: asArray(row && row.ingestion_warnings).length,
      adversarial_hook_count: asArray(row && row.adversarial_pressure_hooks).length,
      truth_hook_count: asArray(row && row.truth_pressure_hooks).length,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const rows = asArray(packet && packet.ingestion_records);
    const validations = rows.map(validateRecord);
    const materialTypes = new Set(rows.map(row => row.material_type));
    const warnings = new Set(rows.flatMap(row => asArray(row.ingestion_warnings)));
    const advHooks = new Set(rows.flatMap(row => asArray(row.adversarial_pressure_hooks)));
    const truthHooks = new Set(rows.flatMap(row => asArray(row.truth_pressure_hooks)));
    const errors = [];
    if (packet && packet.source_adversarial_suite_ok !== true) errors.push('source_adversarial_suite_not_ok');
    if (rows.length !== 8) errors.push(`ingestion_record_count_not_8:${rows.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.material_id}:${row.errors.join('|')}`); });
    const checks = {
      source_adversarial_suite_ok: packet && packet.source_adversarial_suite_ok === true,
      eight_ingestion_records: rows.length === 8,
      eight_material_types: materialTypes.size === 8,
      all_records_valid: validations.every(row => row.ok),
      raw_descriptions_preserved: rows.every(row => row.separation.raw_description_preserved === true),
      source_media_evidence_uncertainty_separated: rows.every(row => row.separation.source_reference_separate === true && row.separation.media_description_separate === true && row.separation.evidence_claims_separate === true && row.separation.uncertainty_notes_separate === true),
      warnings_present: rows.every(row => asArray(row.ingestion_warnings).length > 0),
      adversarial_hooks_present: rows.every(row => asArray(row.adversarial_pressure_hooks).length > 0),
      truth_pressure_hooks_present: rows.every(row => asArray(row.truth_pressure_hooks).length > 0),
      user_context_not_truth_warning_visible: warnings.has('user_description_context_not_truth'),
      media_not_verified_warning_visible: warnings.has('original_media_not_verified'),
      duplicate_or_anonymous_risk_visible: warnings.has('duplicate_provenance_or_anonymous_source_risk'),
      adversarial_reframe_risk_visible: warnings.has('adversarial_reframe_risk_visible'),
      quote_context_hook_visible: advHooks.has('quote_clipping_or_context_stripping_check'),
      source_laundering_hook_visible: advHooks.has('source_laundering_or_duplicate_provenance_check'),
      causal_bridge_hook_visible: truthHooks.has('causal_bridge_required'),
      no_truth_adjudication: packet && packet.adjudicates_final_truth === false && rows.every(row => row.truth_status === 'not_adjudicated'),
      no_llm_used: packet && packet.llm_used === false && rows.every(row => row.llm_used === false),
      no_external_or_media_lookup: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && rows.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false),
      candidate_only_not_promoted: rows.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && rows.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_real_world_packet_ingestion_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      ingestion_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runIngestionDiscipline(options = {}) {
    const adversarialPacket = options.adversarial_packet || adversarialApi().runAdversarialSuite(options.adversarial_options || {});
    const materials = asArray(options.materials || sampleMaterials());
    const records = materials.map(ingestionRecord);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Real-world packet ingestion discipline. User descriptions, sources, media descriptions, evidence claims, warnings, uncertainty, and pressure hooks remain separate and do not become truth.',
      source_adversarial_suite_ok: adversarialPacket && adversarialPacket.ok === true,
      source_adversarial_suite_version: text(adversarialPacket && adversarialPacket.packet_version),
      source_attack_record_count: adversarialPacket && adversarialPacket.attack_record_count || 0,
      ingestion_record_count: records.length,
      material_type_count: new Set(records.map(row => row.material_type)).size,
      ingestion_records: records,
      status_counts: statusCounts(records),
      doctrine: doctrine(),
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      adjudicates_final_truth: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelRealWorldPacketIngestionDisciplineV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleMaterials,
    warningSet,
    adversarialHooks,
    truthPressureHooks,
    ingestionRecord,
    statusCounts,
    validateRecord,
    validatePacket,
    runIngestionDiscipline
  });
})(typeof window !== 'undefined' ? window : globalThis);
