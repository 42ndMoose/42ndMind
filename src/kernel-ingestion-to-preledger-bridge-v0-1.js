/* 42ndMind Ingestion-to-Preledger Bridge v0.1
 * Converts deterministic ingestion / dossier-compiled packets into preledger-ready candidate entries.
 * It does not promote truth, move belief, verify evidence/media/sources, or adjudicate reality.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_ingestion_to_preledger_bridge_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'preledger'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }

  function dossierCompilerApi() {
    if (!global.KernelDossierToPacketCompilerV01) throw new Error('KernelDossierToPacketCompilerV01 unavailable');
    return global.KernelDossierToPacketCompilerV01;
  }

  function doctrine() {
    return {
      ingestion_to_preledger_bridge_only: true,
      preledger_ready_is_not_truth_promotion: true,
      compiled_ingestion_packets_become_candidate_preledger_entries: true,
      dossier_material_remains_context_not_truth: true,
      source_reference_is_anchor_not_lookup: true,
      evidence_description_is_claim_not_verification: true,
      media_description_is_context_not_verification: true,
      quote_fragment_requires_context: true,
      adversarial_reframe_is_pressure_not_truth: true,
      relation_candidate_is_not_relation_truth: true,
      coverage_hold_preserves_unknown_or_unresolved_gap: true,
      support_pressure_is_not_truth: true,
      counter_pressure_is_not_disproof: true,
      causal_relation_requires_bridge: true,
      preledger_entry_is_candidate_not_final: true,
      no_final_truth_promotion: true,
      no_belief_movement: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      rollback_required_for_every_preledger_entry: true,
      no_silent_mutation: true,
      belief_movement: 'none'
    };
  }

  function categoryForPacketType(packetType) {
    const map = {
      claim_candidate: 'claim_candidate_entry',
      source_reference: 'source_anchor_entry',
      evidence_description: 'evidence_description_entry',
      media_description: 'media_description_entry',
      quote_fragment: 'quote_fragment_entry',
      context_note: 'context_note_entry',
      adversarial_reframe: 'adversarial_pressure_entry',
      relation_candidate: 'relation_candidate_entry',
      coverage_hold: 'unresolved_coverage_hold_entry',
      dossier_summary_packet: 'dossier_summary_entry'
    };
    return map[text(packetType)] || 'context_note_entry';
  }

  function pressureComponentsForPacket(row) {
    const type = text(row && row.packet_type);
    const relation = text(row && row.relation_family_candidate);
    const components = {
      support_pressure: 0,
      counter_pressure: 0,
      contradiction_pressure: 0,
      narrative_pressure: 0,
      adversarial_pressure: 0,
      unresolved_gap_pressure: 0,
      external_anchor_pressure: 0,
      evidence_description_pressure: 0,
      media_description_pressure: 0,
      relation_candidate_pressure: 0,
      coverage_hold_pressure: 0
    };
    if (type === 'claim_candidate') components.unresolved_gap_pressure = 0.35;
    if (type === 'source_reference') components.external_anchor_pressure = 0.45;
    if (type === 'evidence_description') components.evidence_description_pressure = 0.55;
    if (type === 'media_description') components.media_description_pressure = 0.55;
    if (type === 'quote_fragment') components.unresolved_gap_pressure = 0.5;
    if (type === 'context_note') components.unresolved_gap_pressure = 0.35;
    if (type === 'adversarial_reframe') components.adversarial_pressure = 0.75;
    if (type === 'relation_candidate') components.relation_candidate_pressure = 0.6;
    if (type === 'coverage_hold') components.coverage_hold_pressure = 0.7;
    if (type === 'dossier_summary_packet') components.narrative_pressure = 0.25;
    if (relation === 'supports') components.support_pressure = Math.max(components.support_pressure, 0.45);
    if (relation === 'counters') components.counter_pressure = Math.max(components.counter_pressure, 0.45);
    if (relation === 'contradicts') components.contradiction_pressure = Math.max(components.contradiction_pressure, 0.5);
    if (relation === 'causes_or_contributes_to') components.relation_candidate_pressure = Math.max(components.relation_candidate_pressure, 0.65);
    if (relation === 'injects_quantifier') components.adversarial_pressure = Math.max(components.adversarial_pressure, 0.7);
    if (relation === 'clips_quote') components.unresolved_gap_pressure = Math.max(components.unresolved_gap_pressure, 0.55);
    return components;
  }

  function requiredForPromotion(row) {
    const type = text(row && row.packet_type);
    const relation = text(row && row.relation_family_candidate);
    const needs = ['explicit_promotion_layer_required', 'human_readable_trace_required', 'rollback_snapshot_required'];
    if (type === 'claim_candidate') needs.push('claim_scope_and_terms_preserved');
    if (type === 'source_reference') needs.push('source_lookup_or_anchor_verification_required_before_truth');
    if (type === 'evidence_description') needs.push('evidence_verification_required');
    if (type === 'media_description') needs.push('media_verification_required');
    if (type === 'quote_fragment') needs.push('quote_context_required');
    if (type === 'adversarial_reframe') needs.push('original_claim_and_reframe_must_remain_distinct');
    if (type === 'relation_candidate') needs.push('relation_bridge_required_if_truth_claimed');
    if (type === 'coverage_hold') needs.push('unknown_or_unresolved_gap_must_be_resolved_or_preserved');
    if (relation === 'causes_or_contributes_to') needs.push('causal_bridge_required_before_causal_truth');
    if (relation === 'supports') needs.push('support_not_truth_guard_must_remain_active');
    if (relation === 'media_describes') needs.push('media_description_not_media_verification_guard_must_remain_active');
    return unique(needs);
  }

  function unresolvedForPreledger(row) {
    const items = asArray(row && row.unresolved_items).slice();
    items.push('preledger_entry_candidate_not_truth');
    items.push('truth_status:not_adjudicated');
    items.push('belief_movement:none');
    if (text(row && row.packet_type) === 'source_reference') items.push('source_anchor_not_lookup');
    if (text(row && row.packet_type) === 'evidence_description') items.push('evidence_description_not_verified_evidence');
    if (text(row && row.packet_type) === 'media_description') items.push('media_description_not_verified_media');
    if (text(row && row.packet_type) === 'quote_fragment') items.push('quote_fragment_context_required');
    if (text(row && row.packet_type) === 'adversarial_reframe') items.push('adversarial_reframe_pressure_not_truth');
    if (text(row && row.packet_type) === 'relation_candidate') items.push('relation_candidate_not_relation_truth');
    if (text(row && row.packet_type) === 'coverage_hold') items.push('coverage_hold_preserves_gap');
    return unique(items);
  }

  function guardsForPreledger(row) {
    const type = text(row && row.packet_type);
    const guards = {
      ingestion_to_preledger_bridge_only: true,
      preledger_ready_is_not_truth_promotion: true,
      preledger_entry_is_candidate_not_final: true,
      dossier_material_remains_context_not_truth: true,
      support_pressure_is_not_truth: true,
      counter_pressure_is_not_disproof: true,
      no_final_truth_promotion: true,
      no_belief_movement: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      rollback_available: true,
      no_silent_mutation: true
    };
    if (type === 'source_reference') guards.source_reference_is_anchor_not_lookup = true;
    if (type === 'evidence_description') guards.evidence_description_is_claim_not_verification = true;
    if (type === 'media_description') guards.media_description_is_context_not_verification = true;
    if (type === 'quote_fragment') guards.quote_fragment_requires_context = true;
    if (type === 'adversarial_reframe') guards.adversarial_reframe_is_pressure_not_truth = true;
    if (type === 'relation_candidate') guards.relation_candidate_is_not_relation_truth = true;
    if (type === 'coverage_hold') guards.coverage_hold_preserves_unknown_or_unresolved_gap = true;
    if (text(row && row.relation_family_candidate) === 'causes_or_contributes_to') guards.causal_relation_requires_bridge = true;
    return guards;
  }

  function makePreledgerEntry(row, compilerPacket, index) {
    const entryId = `preledger_ready_${String(index + 1).padStart(2, '0')}__${safeId(row && row.packet_type)}__${safeId(row && row.ingestion_packet_id)}`;
    return {
      preledger_entry_id: entryId,
      source_ingestion_packet_id: text(row && row.ingestion_packet_id),
      source_packet_type: text(row && row.packet_type),
      preledger_category: categoryForPacketType(row && row.packet_type),
      title: text(row && row.title),
      candidate_text: text(row && row.content),
      source_label: text(row && row.source_label),
      target_claim_id: text(row && row.target_claim_id),
      relation_family_candidate: text(row && row.relation_family_candidate),
      coverage_family_candidate: text(row && row.coverage_family_candidate),
      coverage_classification_snapshot: clone(row && row.coverage_classification_snapshot),
      pressure_components: pressureComponentsForPacket(row),
      required_for_truth_promotion: requiredForPromotion(row),
      unresolved_items: unresolvedForPreledger(row),
      separation_guards: guardsForPreledger(row),
      source_packet_snapshot: clone(row),
      source_compiler_snapshot: {
        source_dossier_compiler_ok: !!(compilerPacket && compilerPacket.ok),
        source_dossier_compiler_version: text(compilerPacket && compilerPacket.packet_version),
        compiled_section_count: Number(compilerPacket && compilerPacket.compiled_section_count) || 0,
        compiled_packet_count: Number(compilerPacket && compilerPacket.compiled_packet_count) || 0,
        source_final_authority: !!(compilerPacket && compilerPacket.dossier_compiler_is_final_truth_authority)
      },
      preledger_ready_status: 'candidate_preledger_entry_not_truth',
      ledger_status: 'candidate_preledger_not_truth',
      truth_status: 'not_adjudicated',
      adjudicates_final_truth: false,
      final_authority: false,
      source_lookup_performed: false,
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none',
      rollback_available: true,
      rollback_snapshot: {
        source_ingestion_packet: clone(row),
        source_compiler_summary: compilerPacket ? {
          ok: compilerPacket.ok,
          packet_version: compilerPacket.packet_version,
          compiled_section_count: compilerPacket.compiled_section_count,
          compiled_packet_count: compilerPacket.compiled_packet_count
        } : null,
        rollback_reason: 'remove_preledger_ready_entry_without_mutating_source_packet_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${entryId}_v0001_candidate`,
          source_type: 'ingestion_to_preledger_bridge',
          created_at: now(),
          mutation_type: 'initial_preledger_ready_entry',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ]
    };
  }

  function makePreledgerEntries(compiledPackets, compilerPacket) {
    return asArray(compiledPackets).map((row, index) => makePreledgerEntry(row, compilerPacket, index));
  }

  function countBy(records, key) {
    return asArray(records).reduce((acc, row) => {
      const value = text(row && row[key]) || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function validatePreledgerEntry(row) {
    const errors = [];
    if (!text(row && row.preledger_entry_id)) errors.push('missing_preledger_entry_id');
    if (!text(row && row.source_ingestion_packet_id)) errors.push('missing_source_ingestion_packet_id');
    if (!text(row && row.source_packet_type)) errors.push('missing_source_packet_type');
    if (!text(row && row.preledger_category)) errors.push('missing_preledger_category');
    if (row && row.preledger_ready_status !== 'candidate_preledger_entry_not_truth') errors.push('preledger_ready_status_not_candidate');
    if (row && row.ledger_status !== 'candidate_preledger_not_truth') errors.push('ledger_status_not_candidate');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.adjudicates_final_truth !== false) errors.push('adjudicates_final_truth');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.source_lookup_performed !== false) errors.push('source_lookup_performed');
    if (!row || !row.pressure_components) errors.push('pressure_components_missing');
    if (asArray(row && row.required_for_truth_promotion).length < 1) errors.push('required_for_truth_promotion_missing');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    if (!row || !row.separation_guards || row.separation_guards.preledger_ready_is_not_truth_promotion !== true) errors.push('preledger_not_truth_guard_missing');
    if (!row || !row.separation_guards || row.separation_guards.no_belief_movement !== true) errors.push('no_belief_movement_guard_missing');
    if (row && row.source_packet_type === 'source_reference' && (!row.separation_guards || row.separation_guards.source_reference_is_anchor_not_lookup !== true)) errors.push('source_anchor_guard_missing');
    if (row && row.source_packet_type === 'evidence_description' && (!row.separation_guards || row.separation_guards.evidence_description_is_claim_not_verification !== true)) errors.push('evidence_guard_missing');
    if (row && row.source_packet_type === 'media_description' && (!row.separation_guards || row.separation_guards.media_description_is_context_not_verification !== true)) errors.push('media_guard_missing');
    if (row && row.source_packet_type === 'adversarial_reframe' && (!row.separation_guards || row.separation_guards.adversarial_reframe_is_pressure_not_truth !== true)) errors.push('reframe_guard_missing');
    if (row && row.source_packet_type === 'relation_candidate' && (!row.separation_guards || row.separation_guards.relation_candidate_is_not_relation_truth !== true)) errors.push('relation_guard_missing');
    if (row && row.source_packet_type === 'coverage_hold' && (!row.separation_guards || row.separation_guards.coverage_hold_preserves_unknown_or_unresolved_gap !== true)) errors.push('coverage_hold_guard_missing');
    if (row && row.rollback_available !== true || !row || !row.rollback_snapshot) errors.push('rollback_missing');
    if (asArray(row && row.revision_trail).length < 1) errors.push('revision_trail_missing');
    if (asArray(row && row.revision_trail).some(v => v.silent_mutation !== false)) errors.push('silent_mutation_present');
    return {
      preledger_entry_id: text(row && row.preledger_entry_id),
      ok: errors.length === 0,
      errors,
      source_packet_type: text(row && row.source_packet_type),
      preledger_category: text(row && row.preledger_category),
      belief_movement: 'none'
    };
  }

  function validateBridgePacket(packet) {
    const entries = asArray(packet && packet.preledger_ready_entries);
    const validations = entries.map(validatePreledgerEntry);
    const types = new Set(entries.map(row => row.source_packet_type));
    const categories = new Set(entries.map(row => row.preledger_category));
    const unresolved = entries.flatMap(row => asArray(row.unresolved_items));
    const guards = entries.flatMap(row => Object.keys(row.separation_guards || {}).filter(key => row.separation_guards[key] === true));
    const errors = [];
    if (packet && packet.source_dossier_compiler_ok !== true) errors.push('source_dossier_compiler_not_ok');
    if (packet && packet.source_compiled_packet_count !== 21) errors.push(`source_compiled_packet_count_not_21:${packet.source_compiled_packet_count}`);
    if (entries.length !== 21) errors.push(`preledger_ready_entry_count_not_21:${entries.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.preledger_entry_id}:${row.errors.join('|')}`); });
    const checks = {
      source_dossier_compiler_ready: packet && packet.source_dossier_compiler_ok === true,
      source_compiled_packets_21: packet && packet.source_compiled_packet_count === 21,
      preledger_ready_entries_21: entries.length === 21,
      packet_types_10: types.size === 10,
      preledger_categories_10: categories.size === 10,
      all_records_valid: validations.every(row => row.ok),
      all_entries_candidate_preledger_not_truth: entries.every(row => row.preledger_ready_status === 'candidate_preledger_entry_not_truth' && row.ledger_status === 'candidate_preledger_not_truth'),
      source_evidence_media_quote_reframe_relation_coverage_guards_visible: ['source_reference_is_anchor_not_lookup','evidence_description_is_claim_not_verification','media_description_is_context_not_verification','quote_fragment_requires_context','adversarial_reframe_is_pressure_not_truth','relation_candidate_is_not_relation_truth','coverage_hold_preserves_unknown_or_unresolved_gap'].every(guard => guards.includes(guard)),
      unresolved_items_visible: unresolved.includes('preledger_entry_candidate_not_truth') && unresolved.includes('evidence_description_not_verified_evidence') && unresolved.includes('media_description_not_verified_media') && unresolved.includes('adversarial_reframe_pressure_not_truth'),
      pressure_components_present_for_all: entries.every(row => !!row.pressure_components),
      required_promotion_items_present_for_all: entries.every(row => asArray(row.required_for_truth_promotion).length >= 1),
      support_not_truth_guard_visible: guards.includes('support_pressure_is_not_truth'),
      counter_not_disproof_guard_visible: guards.includes('counter_pressure_is_not_disproof'),
      no_truth_promotion: packet && packet.truth_status === 'not_adjudicated' && entries.every(row => row.truth_status === 'not_adjudicated' && row.promotion_status === 'not_promoted'),
      no_llm_used: packet && packet.llm_used === false && entries.every(row => row.llm_used === false),
      no_lookup_used: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && entries.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false && row.source_lookup_performed === false),
      rollback_available_for_all: entries.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      no_silent_mutation: entries.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.ingestion_to_preledger_bridge_is_final_truth_authority === false && entries.every(row => row.final_authority === false),
      belief_movement_none: packet && packet.belief_movement === 'none' && entries.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_ingestion_to_preledger_bridge_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      preledger_entry_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runIngestionToPreledgerBridge(options = {}) {
    const compilerPacket = options.dossier_compiler_packet || dossierCompilerApi().runDossierToPacketCompiler(options.dossier_compiler_options || {});
    const compiledPackets = asArray(options.compiled_ingestion_packets || compilerPacket.compiled_ingestion_packets);
    const entries = makePreledgerEntries(compiledPackets, compilerPacket);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Ingestion-to-preledger bridge. Converts deterministic ingestion / dossier packets into preledger-ready candidate entries without truth promotion.',
      source_dossier_compiler_ok: compilerPacket && compilerPacket.ok === true,
      source_dossier_compiler_version: text(compilerPacket && compilerPacket.packet_version),
      source_compiled_section_count: Number(compilerPacket && compilerPacket.compiled_section_count) || 0,
      source_compiled_packet_count: Number(compilerPacket && compilerPacket.compiled_packet_count) || 0,
      preledger_ready_entry_count: entries.length,
      source_packet_type_count: new Set(entries.map(row => row.source_packet_type)).size,
      preledger_category_count: new Set(entries.map(row => row.preledger_category)).size,
      preledger_ready_entries: entries,
      source_packet_type_counts: countBy(entries, 'source_packet_type'),
      preledger_category_counts: countBy(entries, 'preledger_category'),
      doctrine: doctrine(),
      ingestion_to_preledger_bridge_is_final_truth_authority: false,
      adjudicates_final_truth: false,
      truth_status: 'not_adjudicated',
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none',
      rollback_available: true,
      rollback_snapshot: {
        source_dossier_compiler_packet: clone(compilerPacket),
        preledger_ready_entries: clone(entries),
        rollback_reason: 'remove_bridge_packet_without_mutating_compiled_dossier_packets_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `ingestion_to_preledger_bridge_${VERSION.replace(/\./g, '_')}_v0001_candidate`,
          source_type: 'ingestion_to_preledger_bridge',
          created_at: now(),
          mutation_type: 'initial_bridge_packet',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ]
    };
    packet.validation = validateBridgePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIngestionToPreledgerBridgeV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    categoryForPacketType,
    pressureComponentsForPacket,
    requiredForPromotion,
    unresolvedForPreledger,
    guardsForPreledger,
    makePreledgerEntry,
    makePreledgerEntries,
    countBy,
    validatePreledgerEntry,
    validateBridgePacket,
    runIngestionToPreledgerBridge
  });
})(typeof window !== 'undefined' ? window : globalThis);
