/* 42ndMind Source/Provenance Registry v0.1
 * Tracks source independence, provenance posture, duplicate provenance, and evidence-source linkage.
 * No LLM. No source lookup. No truth adjudication. Candidate only.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_source_provenance_registry_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function uniq(rows) { return Array.from(new Set(asArray(rows).map(text).filter(Boolean))); }

  function anchorApi() {
    if (!global.KernelExternalAnchorPacketSchemaV01) throw new Error('KernelExternalAnchorPacketSchemaV01 unavailable');
    return global.KernelExternalAnchorPacketSchemaV01;
  }

  function doctrine() {
    return {
      tracks_source_provenance_without_truth_adjudication: true,
      duplicate_provenance_is_not_independent_convergence: true,
      independent_sources_require_distinct_independence_groups: true,
      source_lookup_is_not_automatic: true,
      llm_is_not_required: true,
      user_descriptions_are_context_not_truth: true,
      evidence_links_to_sources_but_does_not_promote_truth: true,
      hearsay_direct_media_and_documentary_postures_are_distinguished: true,
      registry_entries_are_candidate_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function classifySourceModality(source) {
    const s = lower((source && source.source_type) + ' ' + (source && source.provenance_status) + ' ' + (source && source.trust_posture));
    if (/anonymous|hearsay|rumor/.test(s)) return 'hearsay_or_unverified_assertion';
    if (/media|video|audio|image/.test(s)) return 'media_description';
    if (/record|document|documentary/.test(s)) return 'documentary_description';
    if (/user|first_person|description/.test(s)) return 'user_supplied_description';
    return 'unknown_source_modality';
  }

  function sourceReliabilityPosture(source) {
    const modality = classifySourceModality(source);
    const trust = lower(source && source.trust_posture);
    if (modality === 'hearsay_or_unverified_assertion') return 'low_trust_unresolved';
    if (/direct_description/.test(trust) || modality === 'media_description') return 'consider_with_weight_not_auto_truth';
    if (/documentary|record/.test(trust) || modality === 'documentary_description') return 'documentary_candidate_not_verified';
    if (/grain_of_salt|context/.test(trust)) return 'context_only_with_grain_of_salt';
    return 'neutral_unverified_context';
  }

  function provenanceKey(source) {
    return [safeId(source && source.source_type), safeId(source && source.provenance_status), safeId(source && source.independence_group)].join('|');
  }

  function buildSourceRecords(anchorPacket) {
    const sources = asArray(anchorPacket && anchorPacket.sources);
    return sources.map(source => ({
      registry_entry_id: `${text(source.source_id)}_provenance_v0_1`,
      source_id: text(source.source_id),
      label: text(source.label),
      source_type: text(source.source_type),
      source_modality: classifySourceModality(source),
      provenance_status: text(source.provenance_status),
      independence_group: text(source.independence_group),
      provenance_key: provenanceKey(source),
      trust_posture: text(source.trust_posture),
      reliability_posture: sourceReliabilityPosture(source),
      lookup_performed: source.lookup_performed === true,
      llm_used: false,
      adjudicates_truth: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    }));
  }

  function buildEvidenceSourceLinks(anchorPacket) {
    const sourceIds = new Set(asArray(anchorPacket && anchorPacket.sources).map(row => text(row.source_id)));
    return asArray(anchorPacket && anchorPacket.evidence).map(evidence => ({
      link_id: `${text(evidence.evidence_id)}__${text(evidence.source_ref)}_link_v0_1`,
      evidence_id: text(evidence.evidence_id),
      evidence_type: text(evidence.evidence_type),
      source_ref: text(evidence.source_ref),
      source_ref_resolves: sourceIds.has(text(evidence.source_ref)),
      independence_group: text(evidence.independence_group),
      strength: Number(evidence.strength || 0),
      trust_posture: text(evidence.trust_posture),
      media_lookup_performed: evidence.media_lookup_performed === true,
      link_status: 'evidence_source_link_not_truth',
      belief_movement: 'none'
    }));
  }

  function detectDuplicateProvenance(sourceRecords) {
    const byKey = {};
    asArray(sourceRecords).forEach(row => {
      const key = text(row.provenance_key);
      if (!byKey[key]) byKey[key] = [];
      byKey[key].push(row.source_id);
    });
    return Object.keys(byKey).filter(key => byKey[key].length > 1).map(key => ({
      duplicate_key: key,
      source_ids: byKey[key],
      duplicate_count: byKey[key].length,
      independence_status: 'duplicate_provenance_not_independent_convergence',
      belief_movement: 'none'
    }));
  }

  function independenceSummary(sourceRecords, evidenceLinks) {
    const sourceGroups = uniq(asArray(sourceRecords).map(row => row.independence_group));
    const evidenceGroups = uniq(asArray(evidenceLinks).map(row => row.independence_group));
    return {
      source_independence_group_count: sourceGroups.length,
      evidence_independence_group_count: evidenceGroups.length,
      source_independence_groups: sourceGroups,
      evidence_independence_groups: evidenceGroups,
      has_multiple_source_groups: sourceGroups.length >= 2,
      has_multiple_evidence_groups: evidenceGroups.length >= 2,
      independent_convergence_possible_only_across_distinct_groups: true,
      belief_movement: 'none'
    };
  }

  function sourcePostureCounts(sourceRecords) {
    const counts = {};
    asArray(sourceRecords).forEach(row => { counts[row.source_modality] = (counts[row.source_modality] || 0) + 1; });
    return counts;
  }

  function validateSourceRecord(row) {
    const errors = [];
    if (!text(row && row.registry_entry_id)) errors.push('missing_registry_entry_id');
    if (!text(row && row.source_id)) errors.push('missing_source_id');
    if (!text(row && row.source_modality)) errors.push('missing_source_modality');
    if (!text(row && row.provenance_status)) errors.push('missing_provenance_status');
    if (!text(row && row.independence_group)) errors.push('missing_independence_group');
    if (!text(row && row.reliability_posture)) errors.push('missing_reliability_posture');
    if (row && row.lookup_performed !== false) errors.push('lookup_performed');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.adjudicates_truth !== false) errors.push('truth_adjudicated');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return { source_id: text(row && row.source_id), ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function validateEvidenceLink(row) {
    const errors = [];
    if (!text(row && row.link_id)) errors.push('missing_link_id');
    if (!text(row && row.evidence_id)) errors.push('missing_evidence_id');
    if (!text(row && row.source_ref)) errors.push('missing_source_ref');
    if (row && row.source_ref_resolves !== true) errors.push('source_ref_unresolved');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.link_status !== 'evidence_source_link_not_truth') errors.push('link_truth_promotion_risk');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return { link_id: text(row && row.link_id), ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function validateRegistry(packet) {
    const sourceRows = asArray(packet && packet.source_records);
    const linkRows = asArray(packet && packet.evidence_source_links);
    const sourceValidations = sourceRows.map(validateSourceRecord);
    const linkValidations = linkRows.map(validateEvidenceLink);
    const errors = [];
    if (packet && packet.source_anchor_schema_ok !== true) errors.push('source_anchor_schema_not_ok');
    if (sourceRows.length !== 4) errors.push(`source_record_count_not_4:${sourceRows.length}`);
    if (linkRows.length !== 5) errors.push(`evidence_link_count_not_5:${linkRows.length}`);
    sourceValidations.forEach(row => { if (!row.ok) errors.push(`${row.source_id}:${row.errors.join('|')}`); });
    linkValidations.forEach(row => { if (!row.ok) errors.push(`${row.link_id}:${row.errors.join('|')}`); });
    const postureCounts = sourcePostureCounts(sourceRows);
    const checks = {
      source_anchor_schema_ok: packet && packet.source_anchor_schema_ok === true,
      four_source_records: sourceRows.length === 4,
      five_evidence_source_links: linkRows.length === 5,
      all_source_records_valid: sourceValidations.every(row => row.ok),
      all_evidence_links_valid: linkValidations.every(row => row.ok),
      distinguishes_source_modalities: !!(postureCounts.user_supplied_description && postureCounts.media_description && postureCounts.documentary_description),
      independence_groups_present: packet && packet.independence_summary && packet.independence_summary.source_independence_group_count >= 3,
      duplicate_provenance_checked: Array.isArray(packet && packet.duplicate_provenance),
      duplicate_provenance_not_independent_convergence: asArray(packet && packet.duplicate_provenance).every(row => row.independence_status === 'duplicate_provenance_not_independent_convergence'),
      no_source_lookup: sourceRows.every(row => row.lookup_performed === false) && packet && packet.lookup_performed === false,
      no_media_lookup: linkRows.every(row => row.media_lookup_performed === false),
      no_llm_used: sourceRows.every(row => row.llm_used === false) && packet && packet.llm_used === false,
      no_truth_adjudication: sourceRows.every(row => row.adjudicates_truth === false) && linkRows.every(row => row.link_status === 'evidence_source_link_not_truth'),
      candidate_only_not_promoted: sourceRows.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && sourceRows.every(row => row.belief_movement === 'none') && linkRows.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_source_provenance_registry_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      source_validations: sourceValidations,
      evidence_link_validations: linkValidations,
      errors,
      belief_movement: 'none'
    };
  }

  function runRegistry(options = {}) {
    const anchorPacketWrapper = options.anchor_packet_wrapper || anchorApi().runAnchorSchema(options.anchor_options || {});
    const anchorPacket = options.anchor_packet || (anchorPacketWrapper && anchorPacketWrapper.anchor_packet);
    const sourceRecords = buildSourceRecords(anchorPacket);
    const evidenceLinks = buildEvidenceSourceLinks(anchorPacket);
    const duplicateProvenance = detectDuplicateProvenance(sourceRecords);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Source/provenance registry for external anchors. Tracks source modality, trust posture, independence groups, duplicate provenance, and evidence-source links without truth adjudication.',
      source_anchor_schema_ok: anchorPacketWrapper && anchorPacketWrapper.ok === true,
      source_anchor_packet_id: text(anchorPacket && anchorPacket.anchor_packet_id),
      source_record_count: sourceRecords.length,
      evidence_source_link_count: evidenceLinks.length,
      source_records: sourceRecords,
      evidence_source_links: evidenceLinks,
      duplicate_provenance: duplicateProvenance,
      duplicate_provenance_count: duplicateProvenance.length,
      independence_summary: independenceSummary(sourceRecords, evidenceLinks),
      source_posture_counts: sourcePostureCounts(sourceRecords),
      doctrine: doctrine(),
      lookup_performed: false,
      llm_used: false,
      adjudicates_truth: false,
      belief_movement: 'none'
    };
    packet.validation = validateRegistry(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelSourceProvenanceRegistryV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    classifySourceModality,
    sourceReliabilityPosture,
    provenanceKey,
    buildSourceRecords,
    buildEvidenceSourceLinks,
    detectDuplicateProvenance,
    independenceSummary,
    sourcePostureCounts,
    validateSourceRecord,
    validateEvidenceLink,
    validateRegistry,
    runRegistry
  });
})(typeof window !== 'undefined' ? window : globalThis);
