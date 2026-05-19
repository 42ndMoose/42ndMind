/* 42ndMind Truth Ledger Preledger v0.1
 * Collects truth-pressure outputs and real-world ingestion packets into candidate preledger entries.
 * This is not a final truth authority. No promotion, no lookup, no LLM, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_truth_ledger_preledger_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }

  function ingestionApi() {
    if (!global.KernelRealWorldPacketIngestionDisciplineV01) throw new Error('KernelRealWorldPacketIngestionDisciplineV01 unavailable');
    return global.KernelRealWorldPacketIngestionDisciplineV01;
  }

  function truthApi() {
    if (!global.KernelTruthPressureSynthesisV01) throw new Error('KernelTruthPressureSynthesisV01 unavailable');
    return global.KernelTruthPressureSynthesisV01;
  }

  function doctrine() {
    return {
      preledger_collects_candidate_entries_not_truth: true,
      ingestion_packets_are_context_not_truth: true,
      truth_pressure_is_pressure_not_final_truth: true,
      unresolved_gaps_remain_visible: true,
      contradiction_pressure_is_not_resolution: true,
      source_uncertainty_remains_visible: true,
      media_uncertainty_remains_visible: true,
      evidence_claims_are_not_verification: true,
      adversarial_warnings_remain_visible: true,
      rollback_required_for_every_entry: true,
      version_trail_required_for_every_entry: true,
      no_silent_mutation: true,
      no_truth_promotion: true,
      no_llm: true,
      no_source_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      candidate_only_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function pressureSummaryFromSynthesis(synthesisPacket) {
    const records = asArray(synthesisPacket && synthesisPacket.synthesis_records);
    const aggregate = synthesisPacket && synthesisPacket.aggregate || {};
    return {
      source_packet_type: text(synthesisPacket && synthesisPacket.packet_type),
      source_packet_version: text(synthesisPacket && synthesisPacket.packet_version),
      synthesis_record_count: records.length,
      aggregate: clone(aggregate),
      status_counts: clone(aggregate.status_counts || {}),
      visible_pressure_flags: {
        contradiction_visible: aggregate.contradiction_visible === true,
        narrative_overclaim_visible: aggregate.narrative_overclaim_visible === true,
        propaganda_pressure_visible: aggregate.propaganda_pressure_visible === true,
        causal_overclaim_visible: aggregate.causal_overclaim_visible === true,
        ambiguity_visible: aggregate.ambiguity_visible === true,
        unsupported_unresolved_visible: aggregate.unsupported_unresolved_visible === true,
        evidence_support_visible: aggregate.evidence_support_visible === true,
        corroboration_visible: aggregate.corroboration_visible === true
      },
      truth_promotion: false,
      belief_movement: 'none'
    };
  }

  function linkedSynthesisForRecord(ingestionRecord, synthesisRecords, index) {
    const hooks = asArray(ingestionRecord.truth_pressure_hooks).join(' ').toLowerCase();
    const warnings = asArray(ingestionRecord.ingestion_warnings).join(' ').toLowerCase();
    const textBlob = `${ingestionRecord.material_type} ${hooks} ${warnings}`;
    if (textBlob.includes('contradiction')) return synthesisRecords.find(r => r.synthesis_status_candidate === 'contradiction_pressure_visible_candidate') || synthesisRecords[index % synthesisRecords.length];
    if (textBlob.includes('causal')) return synthesisRecords.find(r => r.synthesis_status_candidate === 'causal_overclaim_pressure_visible_candidate') || synthesisRecords[index % synthesisRecords.length];
    if (textBlob.includes('duplicate') || textBlob.includes('corroboration')) return synthesisRecords.find(r => r.synthesis_status_candidate === 'corroborated_pressure_candidate') || synthesisRecords[index % synthesisRecords.length];
    if (textBlob.includes('low_trust') || textBlob.includes('anonymous')) return synthesisRecords.find(r => r.synthesis_status_candidate === 'unsupported_unresolved_pressure_candidate') || synthesisRecords[index % synthesisRecords.length];
    if (textBlob.includes('adversarial') || textBlob.includes('reframe')) return synthesisRecords.find(r => r.synthesis_status_candidate === 'propaganda_pressure_visible_candidate' || r.synthesis_status_candidate === 'narrative_overclaim_pressure_visible_candidate') || synthesisRecords[index % synthesisRecords.length];
    return synthesisRecords[index % synthesisRecords.length];
  }

  function candidateTruthPosture(ingestionRecord, linkedSynthesis) {
    const warnings = asArray(ingestionRecord.ingestion_warnings).join(' ').toLowerCase();
    const hooks = asArray(ingestionRecord.truth_pressure_hooks).join(' ').toLowerCase();
    const status = text(linkedSynthesis && linkedSynthesis.synthesis_status_candidate);
    if (warnings.includes('adversarial') || hooks.includes('adversarial')) return 'adversarial_context_candidate_not_truth';
    if (status.includes('contradiction')) return 'contradiction_pressure_candidate_not_resolved';
    if (warnings.includes('duplicate') || warnings.includes('anonymous')) return 'low_trust_or_duplicate_candidate_not_truth';
    if (hooks.includes('causal_bridge')) return 'causal_bridge_required_candidate_not_truth';
    if (status.includes('corroborated')) return 'corroborated_pressure_candidate_not_truth';
    if (status.includes('evidence_supported')) return 'evidence_supported_pressure_candidate_not_truth';
    return 'context_candidate_not_truth';
  }

  function entryUnresolvedItems(ingestionRecord, linkedSynthesis) {
    const items = [];
    asArray(ingestionRecord.raw_packet && ingestionRecord.raw_packet.uncertainty_notes).forEach(note => items.push(`uncertainty:${note}`));
    asArray(ingestionRecord.ingestion_warnings).forEach(warning => items.push(`warning:${warning}`));
    asArray(linkedSynthesis && linkedSynthesis.unresolved_gap_notes).forEach(note => items.push(`truth_pressure_gap:${note}`));
    if (linkedSynthesis && linkedSynthesis.pressure_components && linkedSynthesis.pressure_components.contradiction_present === true) items.push('contradiction_pressure_visible_not_resolved');
    if (linkedSynthesis && linkedSynthesis.pressure_components && linkedSynthesis.pressure_components.unresolved_gap_pressure > 0) items.push('unresolved_gap_pressure_visible');
    if (ingestionRecord && ingestionRecord.media_status === 'description_recorded_media_not_verified') items.push('media_not_verified');
    if (ingestionRecord && ingestionRecord.evidence_status === 'evidence_claims_recorded_not_verified') items.push('evidence_claims_not_verified');
    return unique(items);
  }

  function makePreledgerEntry(ingestionRecord, synthesisRecords, pressureSummary, index) {
    const linked = linkedSynthesisForRecord(ingestionRecord, synthesisRecords, index) || {};
    const unresolvedItems = entryUnresolvedItems(ingestionRecord, linked);
    const versionId = `${safeId(ingestionRecord.material_id)}_preledger_v0001_candidate`;
    const entry = {
      preledger_entry_id: `${safeId(ingestionRecord.material_id)}_truth_preledger_entry_v0_1`,
      material_id: text(ingestionRecord.material_id),
      material_type: text(ingestionRecord.material_type),
      version_id: versionId,
      version_index: 1,
      current_candidate_version: versionId,
      candidate_truth_posture: candidateTruthPosture(ingestionRecord, linked),
      source_ingestion_status: text(ingestionRecord.ingestion_status),
      linked_truth_pressure: {
        linked_synthesis_id: text(linked.synthesis_id),
        linked_claim_id: text(linked.claim_id),
        linked_status_candidate: text(linked.synthesis_status_candidate),
        pressure_components: clone(linked.pressure_components || {}),
        external_evidence_pressure: clone(linked.external_evidence_pressure || {}),
        unresolved_gap_notes: clone(linked.unresolved_gap_notes || []),
        pressure_summary: clone(pressureSummary),
        truth_promotion: false,
        belief_movement: 'none'
      },
      ingestion_snapshot: {
        raw_packet: clone(ingestionRecord.raw_packet || {}),
        source_status: text(ingestionRecord.source_status),
        media_status: text(ingestionRecord.media_status),
        evidence_status: text(ingestionRecord.evidence_status),
        context_status: text(ingestionRecord.context_status),
        ingestion_warnings: clone(ingestionRecord.ingestion_warnings || []),
        adversarial_pressure_hooks: clone(ingestionRecord.adversarial_pressure_hooks || []),
        truth_pressure_hooks: clone(ingestionRecord.truth_pressure_hooks || [])
      },
      unresolved_items: unresolvedItems,
      uncertainty_summary: {
        unresolved_item_count: unresolvedItems.length,
        source_uncertainty_visible: asArray(ingestionRecord.ingestion_warnings).includes('source_custody_not_verified'),
        media_uncertainty_visible: asArray(ingestionRecord.ingestion_warnings).includes('original_media_not_verified') || asArray(ingestionRecord.ingestion_warnings).includes('metadata_not_verified'),
        evidence_uncertainty_visible: ingestionRecord.evidence_status === 'evidence_claims_recorded_not_verified',
        adversarial_warning_visible: asArray(ingestionRecord.ingestion_warnings).includes('adversarial_reframe_risk_visible') || asArray(ingestionRecord.adversarial_pressure_hooks).length > 0,
        contradiction_visible_not_resolved: unresolvedItems.includes('contradiction_pressure_visible_not_resolved'),
        belief_movement: 'none'
      },
      separation_guards: {
        support_is_not_truth: true,
        counterevidence_is_not_disproof_by_itself: true,
        contradiction_detection_is_not_resolution: true,
        truth_pressure_is_not_final_truth: true,
        user_context_is_not_truth: true,
        media_description_is_not_media_verification: true,
        evidence_claims_are_not_evidence_verification: true,
        source_reference_is_not_source_lookup: true,
        adversarial_warning_is_pressure_not_truth: true,
        preledger_is_not_final_ledger: true
      },
      rollback_available: true,
      rollback_snapshot: {
        source_ingestion_record: clone(ingestionRecord),
        linked_truth_pressure_record: clone(linked),
        source_pressure_summary: clone(pressureSummary),
        rollback_reason: 'restore_preledger_candidate_to_source_packets_without_truth_promotion'
      },
      revision_trail: [
        {
          version_id: versionId,
          source_type: 'real_world_ingestion_plus_truth_pressure_snapshot',
          created_at: now(),
          mutation_type: 'initial_candidate_preledger_entry',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ],
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      truth_status: 'not_adjudicated',
      contradiction_resolution: 'not_resolved',
      ledger_status: 'candidate_preledger_not_truth',
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    return entry;
  }

  function statusCounts(entries) {
    return asArray(entries).reduce((acc, row) => {
      acc[row.candidate_truth_posture] = (acc[row.candidate_truth_posture] || 0) + 1;
      return acc;
    }, {});
  }

  function validateEntry(entry) {
    const errors = [];
    if (!text(entry && entry.preledger_entry_id)) errors.push('missing_preledger_entry_id');
    if (!text(entry && entry.material_id)) errors.push('missing_material_id');
    if (!text(entry && entry.version_id)) errors.push('missing_version_id');
    if (!entry || entry.version_id !== entry.current_candidate_version) errors.push('current_candidate_version_mismatch');
    if (!text(entry && entry.candidate_truth_posture).endsWith('not_truth') && !text(entry && entry.candidate_truth_posture).endsWith('not_resolved')) errors.push(`unsafe_candidate_truth_posture:${entry && entry.candidate_truth_posture}`);
    if (!entry || !entry.linked_truth_pressure || entry.linked_truth_pressure.truth_promotion !== false) errors.push('truth_pressure_promoted');
    if (!entry || !entry.ingestion_snapshot || !entry.ingestion_snapshot.raw_packet) errors.push('ingestion_snapshot_missing');
    if (asArray(entry && entry.unresolved_items).length === 0) errors.push('unresolved_items_missing');
    if (!entry || !entry.uncertainty_summary || entry.uncertainty_summary.unresolved_item_count < 1) errors.push('uncertainty_summary_missing');
    if (!entry || !entry.separation_guards || entry.separation_guards.preledger_is_not_final_ledger !== true) errors.push('preledger_guard_missing');
    if (!entry || !entry.separation_guards || entry.separation_guards.user_context_is_not_truth !== true) errors.push('user_context_guard_missing');
    if (!entry || !entry.separation_guards || entry.separation_guards.media_description_is_not_media_verification !== true) errors.push('media_guard_missing');
    if (!entry || entry.rollback_available !== true || !entry.rollback_snapshot) errors.push('rollback_missing');
    if (asArray(entry && entry.revision_trail).length < 1) errors.push('revision_trail_missing');
    if (asArray(entry && entry.revision_trail).some(v => v.silent_mutation !== false)) errors.push('silent_mutation_present');
    if (entry && entry.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (entry && entry.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (entry && entry.llm_used !== false) errors.push('llm_used');
    if (entry && entry.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (entry && entry.contradiction_resolution !== 'not_resolved') errors.push('contradiction_resolved');
    if (entry && entry.ledger_status !== 'candidate_preledger_not_truth') errors.push('ledger_status_unsafe');
    if (entry && entry.promotion_status !== 'not_promoted') errors.push('promoted');
    if (entry && entry.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (entry && entry.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      preledger_entry_id: text(entry && entry.preledger_entry_id),
      ok: errors.length === 0,
      errors,
      material_id: text(entry && entry.material_id),
      candidate_truth_posture: text(entry && entry.candidate_truth_posture),
      unresolved_item_count: asArray(entry && entry.unresolved_items).length,
      rollback_available: !!(entry && entry.rollback_available),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const entries = asArray(packet && packet.preledger_entries);
    const validations = entries.map(validateEntry);
    const postures = new Set(entries.map(e => e.candidate_truth_posture));
    const errors = [];
    if (packet && packet.source_ingestion_ok !== true) errors.push('source_ingestion_not_ok');
    if (packet && packet.source_truth_pressure_ok !== true) errors.push('source_truth_pressure_not_ok');
    if (entries.length !== 8) errors.push(`preledger_entry_count_not_8:${entries.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.material_id}:${row.errors.join('|')}`); });
    const checks = {
      source_ingestion_ok: packet && packet.source_ingestion_ok === true,
      source_truth_pressure_ok: packet && packet.source_truth_pressure_ok === true,
      eight_preledger_entries: entries.length === 8,
      all_entries_valid: validations.every(row => row.ok),
      entries_link_ingestion_snapshots: entries.every(e => !!(e.ingestion_snapshot && e.ingestion_snapshot.raw_packet)),
      entries_link_truth_pressure: entries.every(e => !!(e.linked_truth_pressure && e.linked_truth_pressure.linked_status_candidate)),
      candidate_postures_not_truth: entries.every(e => text(e.candidate_truth_posture).includes('not_truth') || text(e.candidate_truth_posture).includes('not_resolved')),
      unresolved_items_visible: entries.every(e => asArray(e.unresolved_items).length > 0),
      source_uncertainty_visible: entries.some(e => e.uncertainty_summary.source_uncertainty_visible === true),
      media_uncertainty_visible: entries.some(e => e.uncertainty_summary.media_uncertainty_visible === true),
      evidence_uncertainty_visible: entries.some(e => e.uncertainty_summary.evidence_uncertainty_visible === true),
      adversarial_warning_visible: entries.some(e => e.uncertainty_summary.adversarial_warning_visible === true),
      contradiction_or_gap_visible: entries.some(e => e.uncertainty_summary.contradiction_visible_not_resolved === true || asArray(e.unresolved_items).includes('unresolved_gap_pressure_visible')),
      rollback_available_for_all: entries.every(e => e.rollback_available === true && !!e.rollback_snapshot),
      revision_trail_present_for_all: entries.every(e => asArray(e.revision_trail).length >= 1),
      no_silent_mutation: entries.every(e => asArray(e.revision_trail).every(v => v.silent_mutation === false)),
      preledger_not_final_ledger: packet && packet.preledger_is_final_truth_authority === false && entries.every(e => e.ledger_status === 'candidate_preledger_not_truth'),
      truth_status_not_adjudicated: entries.every(e => e.truth_status === 'not_adjudicated'),
      no_llm_used: packet && packet.llm_used === false && entries.every(e => e.llm_used === false),
      no_external_or_media_lookup: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && entries.every(e => e.external_lookup_performed === false && e.media_lookup_performed === false),
      candidate_only_not_promoted: entries.every(e => e.promotion_status === 'not_promoted' && e.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && entries.every(e => e.belief_movement === 'none'),
      multiple_postures_visible: postures.size >= 4
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_truth_ledger_preledger_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      entry_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runPreledger(options = {}) {
    const ingestionPacket = options.ingestion_packet || ingestionApi().runIngestionDiscipline(options.ingestion_options || {});
    const truthPacket = options.truth_pressure_packet || truthApi().runSynthesis(options.truth_options || {});
    const ingestionRecords = asArray(ingestionPacket && ingestionPacket.ingestion_records);
    const synthesisRecords = asArray(truthPacket && truthPacket.synthesis_records);
    const pressureSummary = pressureSummaryFromSynthesis(truthPacket);
    const entries = ingestionRecords.map((row, index) => makePreledgerEntry(row, synthesisRecords, pressureSummary, index));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Candidate truth preledger. Collects truth-pressure and ingestion snapshots without final truth promotion.',
      source_ingestion_ok: ingestionPacket && ingestionPacket.ok === true,
      source_ingestion_version: text(ingestionPacket && ingestionPacket.packet_version),
      source_ingestion_record_count: ingestionRecords.length,
      source_truth_pressure_ok: truthPacket && truthPacket.ok === true,
      source_truth_pressure_version: text(truthPacket && truthPacket.packet_version),
      source_truth_pressure_record_count: synthesisRecords.length,
      preledger_entry_count: entries.length,
      preledger_entries: entries,
      posture_counts: statusCounts(entries),
      doctrine: doctrine(),
      preledger_is_final_truth_authority: false,
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

  global.KernelTruthLedgerPreledgerV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    pressureSummaryFromSynthesis,
    linkedSynthesisForRecord,
    candidateTruthPosture,
    entryUnresolvedItems,
    makePreledgerEntry,
    statusCounts,
    validateEntry,
    validatePacket,
    runPreledger
  });
})(typeof window !== 'undefined' ? window : globalThis);
