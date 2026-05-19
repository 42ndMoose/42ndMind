/* 42ndMind Evidence/Media Registry v0.1
 * Tracks evidence/media posture, direction, strength, independence, source linkage, and contradiction contribution.
 * No LLM. No lookup. No truth promotion. Candidate only.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_evidence_media_registry_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }
  function uniq(rows) { return Array.from(new Set(asArray(rows).map(text).filter(Boolean))); }

  function anchorApi() {
    if (!global.KernelExternalAnchorPacketSchemaV01) throw new Error('KernelExternalAnchorPacketSchemaV01 unavailable');
    return global.KernelExternalAnchorPacketSchemaV01;
  }

  function provenanceApi() {
    if (!global.KernelSourceProvenanceRegistryV01) throw new Error('KernelSourceProvenanceRegistryV01 unavailable');
    return global.KernelSourceProvenanceRegistryV01;
  }

  function doctrine() {
    return {
      tracks_evidence_media_without_truth_promotion: true,
      evidence_descriptions_are_context_not_truth: true,
      support_and_counterevidence_direction_are_separate_from_truth: true,
      direct_documentary_media_hearsay_and_ambiguous_postures_are_distinguished: true,
      source_links_required_for_evidence_rows: true,
      independent_evidence_requires_distinct_independence_groups: true,
      contradiction_contribution_is_pressure_not_resolution: true,
      media_lookup_is_not_automatic: true,
      source_lookup_is_not_automatic: true,
      llm_is_not_required: true,
      registry_entries_are_candidate_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function classifyEvidenceModality(evidence, sourceRecord) {
    const hay = lower((evidence && evidence.evidence_type) + ' ' + (evidence && evidence.trust_posture) + ' ' + (sourceRecord && sourceRecord.source_modality) + ' ' + (sourceRecord && sourceRecord.reliability_posture));
    if (/hearsay|rumor|anonymous|unverified/.test(hay)) return 'hearsay_or_unverified_evidence';
    if (/ambiguous/.test(hay)) return 'ambiguous_context_evidence';
    if (/media|video|audio|image/.test(hay)) return 'media_description_evidence';
    if (/record|document|documentary/.test(hay)) return 'documentary_description_evidence';
    if (/direct_description/.test(hay)) return 'direct_description_evidence';
    if (/user|context/.test(hay)) return 'user_description_evidence';
    return 'unknown_evidence_modality';
  }

  function classifyEvidenceDirection(evidence) {
    const supports = asArray(evidence && evidence.supports).filter(Boolean);
    const counters = asArray(evidence && evidence.counters).filter(Boolean);
    if (supports.length && counters.length) return 'mixed_support_and_counterevidence';
    if (counters.length) return 'counterevidence';
    if (supports.length) return 'support';
    return 'undirected_context';
  }

  function contradictionContribution(evidence, direction, modality) {
    const trust = lower(evidence && evidence.trust_posture);
    if (direction === 'counterevidence') return 'direct_counter_pressure';
    if (direction === 'mixed_support_and_counterevidence') return 'mixed_pressure';
    if (/ambiguous/.test(modality) || /ambiguous/.test(trust)) return 'ambiguity_pressure';
    return 'none';
  }

  function evidenceWeightPosture(evidence, modality, sourceRecord) {
    const strength = Number(evidence && evidence.strength || 0);
    if (modality === 'hearsay_or_unverified_evidence') return 'low_weight_unresolved';
    if (modality === 'ambiguous_context_evidence') return 'ambiguous_weight_unresolved';
    if (modality === 'media_description_evidence') return strength >= 0.75 ? 'high_weight_media_description_not_verified' : 'medium_weight_media_description_not_verified';
    if (modality === 'documentary_description_evidence') return strength >= 0.65 ? 'documentary_weight_candidate' : 'weak_documentary_weight_candidate';
    if (modality === 'direct_description_evidence') return 'direct_description_weight_not_auto_truth';
    return sourceRecord && sourceRecord.reliability_posture ? sourceRecord.reliability_posture : 'neutral_unverified_context';
  }

  function buildSourceRecordMap(provenancePacket) {
    const map = {};
    asArray(provenancePacket && provenancePacket.source_records).forEach(row => { map[text(row.source_id)] = row; });
    return map;
  }

  function buildEvidenceRecords(anchorPacket, provenancePacket) {
    const sourceMap = buildSourceRecordMap(provenancePacket);
    return asArray(anchorPacket && anchorPacket.evidence).map(evidence => {
      const sourceRecord = sourceMap[text(evidence.source_ref)] || null;
      const modality = classifyEvidenceModality(evidence, sourceRecord);
      const direction = classifyEvidenceDirection(evidence);
      const contribution = contradictionContribution(evidence, direction, modality);
      return {
        registry_entry_id: `${text(evidence.evidence_id)}_evidence_media_v0_1`,
        evidence_id: text(evidence.evidence_id),
        evidence_type: text(evidence.evidence_type),
        evidence_modality: modality,
        evidence_direction: direction,
        source_ref: text(evidence.source_ref),
        source_ref_resolves: !!sourceRecord,
        source_modality: sourceRecord ? text(sourceRecord.source_modality) : null,
        source_reliability_posture: sourceRecord ? text(sourceRecord.reliability_posture) : null,
        event_refs: clone(asArray(evidence.event_refs)),
        entity_refs: clone(asArray(evidence.entity_refs)),
        supports: clone(asArray(evidence.supports)),
        counters: clone(asArray(evidence.counters)),
        strength: round(Math.max(0, Math.min(1, Number(evidence.strength || 0)))),
        independence_group: text(evidence.independence_group),
        trust_posture: text(evidence.trust_posture),
        weight_posture: evidenceWeightPosture(evidence, modality, sourceRecord),
        contradiction_contribution: contribution,
        contradiction_status: contribution === 'none' ? 'no_contradiction_pressure' : 'pressure_only_not_resolution',
        media_lookup_performed: evidence.media_lookup_performed === true,
        source_lookup_performed: sourceRecord ? sourceRecord.lookup_performed === true : false,
        evidence_status: 'candidate_context_not_truth',
        promotion_status: 'not_promoted',
        doctrine_status: 'candidate_not_doctrine',
        belief_movement: 'none'
      };
    });
  }

  function summarizeByClaim(evidenceRecords) {
    const claims = {};
    asArray(evidenceRecords).forEach(row => {
      asArray(row.supports).forEach(claim => {
        const key = text(claim);
        if (!claims[key]) claims[key] = { claim_id: key, support_count: 0, counter_count: 0, mixed_count: 0, support_strength: 0, counter_strength: 0, evidence_ids: [], independence_groups: [] };
        claims[key].support_count += 1;
        claims[key].support_strength += Number(row.strength || 0);
        claims[key].evidence_ids.push(row.evidence_id);
        claims[key].independence_groups.push(row.independence_group);
      });
      asArray(row.counters).forEach(claim => {
        const key = text(claim);
        if (!claims[key]) claims[key] = { claim_id: key, support_count: 0, counter_count: 0, mixed_count: 0, support_strength: 0, counter_strength: 0, evidence_ids: [], independence_groups: [] };
        claims[key].counter_count += 1;
        claims[key].counter_strength += Number(row.strength || 0);
        claims[key].evidence_ids.push(row.evidence_id);
        claims[key].independence_groups.push(row.independence_group);
      });
      if (row.evidence_direction === 'mixed_support_and_counterevidence') {
        asArray(row.supports).concat(asArray(row.counters)).forEach(claim => {
          const key = text(claim);
          if (claims[key]) claims[key].mixed_count += 1;
        });
      }
    });
    return Object.keys(claims).sort().map(key => {
      const row = claims[key];
      return {
        claim_id: row.claim_id,
        support_count: row.support_count,
        counter_count: row.counter_count,
        mixed_count: row.mixed_count,
        support_strength: round(row.support_strength),
        counter_strength: round(row.counter_strength),
        evidence_ids: uniq(row.evidence_ids),
        independence_groups: uniq(row.independence_groups),
        independent_group_count: uniq(row.independence_groups).length,
        claim_evidence_status: row.counter_count > 0 ? 'has_counter_pressure' : 'support_context_only_not_truth',
        belief_movement: 'none'
      };
    });
  }

  function evidencePostureCounts(evidenceRecords) {
    const counts = {};
    asArray(evidenceRecords).forEach(row => { counts[row.evidence_modality] = (counts[row.evidence_modality] || 0) + 1; });
    return counts;
  }

  function directionCounts(evidenceRecords) {
    const counts = {};
    asArray(evidenceRecords).forEach(row => { counts[row.evidence_direction] = (counts[row.evidence_direction] || 0) + 1; });
    return counts;
  }

  function contradictionSummary(evidenceRecords) {
    const pressureRows = asArray(evidenceRecords).filter(row => row.contradiction_contribution !== 'none');
    return {
      contradiction_pressure_count: pressureRows.length,
      contradiction_pressure_evidence_ids: pressureRows.map(row => row.evidence_id),
      contradiction_status: pressureRows.length ? 'pressure_visible_not_resolved' : 'no_contradiction_pressure_visible',
      belief_movement: 'none'
    };
  }

  function independenceSummary(evidenceRecords) {
    const groups = uniq(asArray(evidenceRecords).map(row => row.independence_group));
    return {
      evidence_independence_group_count: groups.length,
      evidence_independence_groups: groups,
      independent_convergence_possible_only_across_distinct_groups: true,
      duplicate_evidence_group_count: asArray(evidenceRecords).length - groups.length,
      belief_movement: 'none'
    };
  }

  function validateEvidenceRecord(row) {
    const errors = [];
    if (!text(row && row.registry_entry_id)) errors.push('missing_registry_entry_id');
    if (!text(row && row.evidence_id)) errors.push('missing_evidence_id');
    if (!text(row && row.evidence_modality)) errors.push('missing_evidence_modality');
    if (!text(row && row.evidence_direction)) errors.push('missing_evidence_direction');
    if (!text(row && row.source_ref)) errors.push('missing_source_ref');
    if (row && row.source_ref_resolves !== true) errors.push('source_ref_unresolved');
    if (Number(row && row.strength) < 0 || Number(row && row.strength) > 1) errors.push('strength_out_of_range');
    if (!text(row && row.independence_group)) errors.push('missing_independence_group');
    if (!text(row && row.trust_posture)) errors.push('missing_trust_posture');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.source_lookup_performed !== false) errors.push('source_lookup_performed');
    if (row && row.evidence_status !== 'candidate_context_not_truth') errors.push('evidence_truth_promotion_risk');
    if (row && row.contradiction_status === 'resolved') errors.push('contradiction_resolved');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      evidence_id: text(row && row.evidence_id),
      ok: errors.length === 0,
      errors,
      evidence_modality: text(row && row.evidence_modality),
      evidence_direction: text(row && row.evidence_direction),
      contradiction_contribution: text(row && row.contradiction_contribution),
      belief_movement: 'none'
    };
  }

  function validateRegistry(packet) {
    const rows = asArray(packet && packet.evidence_records);
    const validations = rows.map(validateEvidenceRecord);
    const errors = [];
    if (packet && packet.source_anchor_schema_ok !== true) errors.push('source_anchor_schema_not_ok');
    if (packet && packet.source_provenance_registry_ok !== true) errors.push('source_provenance_registry_not_ok');
    if (rows.length !== 5) errors.push(`evidence_record_count_not_5:${rows.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.evidence_id}:${row.errors.join('|')}`); });
    const postureCounts = packet && packet.evidence_posture_counts || {};
    const dirCounts = packet && packet.evidence_direction_counts || {};
    const checks = {
      source_anchor_schema_ok: packet && packet.source_anchor_schema_ok === true,
      source_provenance_registry_ok: packet && packet.source_provenance_registry_ok === true,
      five_evidence_records: rows.length === 5,
      all_evidence_records_valid: validations.every(row => row.ok),
      source_links_resolve: rows.every(row => row.source_ref_resolves === true),
      evidence_modalities_distinguished: !!(postureCounts.media_description_evidence && postureCounts.documentary_description_evidence && postureCounts.user_description_evidence || postureCounts.direct_description_evidence),
      support_direction_visible: !!dirCounts.support,
      contradiction_pressure_visible_not_resolved: packet && packet.contradiction_summary && packet.contradiction_summary.contradiction_status !== 'resolved',
      independence_groups_tracked: packet && packet.independence_summary && packet.independence_summary.evidence_independence_group_count >= 3,
      claim_evidence_summary_present: asArray(packet && packet.claim_evidence_summaries).length >= 1,
      no_media_lookup: rows.every(row => row.media_lookup_performed === false),
      no_source_lookup: rows.every(row => row.source_lookup_performed === false) && packet && packet.lookup_performed === false,
      no_llm_used: packet && packet.llm_used === false,
      no_truth_promotion: rows.every(row => row.evidence_status === 'candidate_context_not_truth'),
      candidate_only_not_promoted: rows.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && rows.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_evidence_media_registry_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      evidence_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runRegistry(options = {}) {
    const anchorWrapper = options.anchor_packet_wrapper || anchorApi().runAnchorSchema(options.anchor_options || {});
    const anchorPacket = options.anchor_packet || (anchorWrapper && anchorWrapper.anchor_packet);
    const provenancePacket = options.provenance_packet || provenanceApi().runRegistry({ anchor_packet_wrapper: anchorWrapper, anchor_packet: anchorPacket });
    const evidenceRecords = buildEvidenceRecords(anchorPacket, provenancePacket);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Evidence/media registry for anchor evidence rows. Tracks modality, direction, strength, independence, source linkage, and contradiction pressure without truth promotion.',
      source_anchor_schema_ok: anchorWrapper && anchorWrapper.ok === true,
      source_provenance_registry_ok: provenancePacket && provenancePacket.ok === true,
      source_anchor_packet_id: text(anchorPacket && anchorPacket.anchor_packet_id),
      evidence_record_count: evidenceRecords.length,
      evidence_records: evidenceRecords,
      evidence_posture_counts: evidencePostureCounts(evidenceRecords),
      evidence_direction_counts: directionCounts(evidenceRecords),
      contradiction_summary: contradictionSummary(evidenceRecords),
      independence_summary: independenceSummary(evidenceRecords),
      claim_evidence_summaries: summarizeByClaim(evidenceRecords),
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

  global.KernelEvidenceMediaRegistryV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    classifyEvidenceModality,
    classifyEvidenceDirection,
    contradictionContribution,
    evidenceWeightPosture,
    buildSourceRecordMap,
    buildEvidenceRecords,
    summarizeByClaim,
    evidencePostureCounts,
    directionCounts,
    contradictionSummary,
    independenceSummary,
    validateEvidenceRecord,
    validateRegistry,
    runRegistry
  });
})(typeof window !== 'undefined' ? window : globalThis);
