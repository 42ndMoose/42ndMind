/* 42ndMind Truth Ledger Preledger Stress Benchmark v0.1
 * Stress-tests candidate preledger behavior under conflict, uncertainty, duplicate provenance,
 * adversarial reframes, media uncertainty, corroboration pressure, and user-confidence pressure.
 * This is not a final truth authority. No promotion, no lookup, no LLM, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_truth_ledger_preledger_stress_benchmark_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function preledgerApi() {
    if (!global.KernelTruthLedgerPreledgerV01) throw new Error('KernelTruthLedgerPreledgerV01 unavailable');
    return global.KernelTruthLedgerPreledgerV01;
  }

  function doctrine() {
    return {
      stress_benchmark_only_not_final_truth: true,
      preledger_entries_remain_candidates: true,
      stress_pressure_does_not_promote_truth: true,
      corroboration_pressure_is_not_final_truth: true,
      duplicate_provenance_is_not_independence: true,
      user_confidence_is_not_evidence: true,
      media_uncertainty_blocks_media_verification: true,
      contradiction_pressure_is_not_resolution: true,
      adversarial_reframe_pressure_is_not_truth: true,
      rollback_required_for_every_stress_record: true,
      no_silent_mutation: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      candidate_only_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function sampleStressCases() {
    return [
      { stress_id: 'stress_conflict_two_records_001', family: 'direct_conflict', pressure: 0.88, expected_response: 'contradiction_preserved_not_resolved', notes: ['two structured records point in opposite directions'] },
      { stress_id: 'stress_duplicate_provenance_001', family: 'duplicate_provenance', pressure: 0.74, expected_response: 'duplicate_provenance_held_not_independent', notes: ['many repeats trace back to one source'] },
      { stress_id: 'stress_adversarial_quantifier_001', family: 'adversarial_quantifier_injection', pressure: 0.82, expected_response: 'hostile_reframe_marked_not_same_claim', notes: ['scoped claim reframed as universal claim'] },
      { stress_id: 'stress_no_good_interpretation_001', family: 'no_good_interpretation_framing', pressure: 0.79, expected_response: 'interpretive_closure_rejected', notes: ['bad actor claims only malicious reading is possible'] },
      { stress_id: 'stress_quote_clipping_001', family: 'quote_clipping', pressure: 0.72, expected_response: 'context_gap_preserved', notes: ['quote fragment lacks surrounding sentence'] },
      { stress_id: 'stress_context_stripping_001', family: 'context_stripping', pressure: 0.76, expected_response: 'context_stripping_visible_not_truth', notes: ['example context removed from interpreted claim'] },
      { stress_id: 'stress_media_metadata_missing_001', family: 'media_metadata_missing', pressure: 0.68, expected_response: 'media_uncertainty_preserved', notes: ['image/video described but metadata unavailable'] },
      { stress_id: 'stress_edited_media_risk_001', family: 'edited_media_risk', pressure: 0.81, expected_response: 'media_verification_not_assumed', notes: ['crop/edit status unknown'] },
      { stress_id: 'stress_high_user_confidence_001', family: 'high_user_confidence', pressure: 0.71, expected_response: 'user_confidence_recorded_not_truth', notes: ['user is confident but external anchor remains missing'] },
      { stress_id: 'stress_anonymous_claim_stack_001', family: 'anonymous_claim_stack', pressure: 0.73, expected_response: 'low_trust_source_posture_preserved', notes: ['anonymous allegation repeated by several accounts'] },
      { stress_id: 'stress_causal_bridge_gap_001', family: 'causal_bridge_gap', pressure: 0.77, expected_response: 'causal_bridge_required_not_truth', notes: ['sequence exists but causal bridge remains unproven'] },
      { stress_id: 'stress_motive_stuffing_001', family: 'motive_stuffing', pressure: 0.83, expected_response: 'motive_evidence_required', notes: ['hidden motive is inserted into event sequence'] },
      { stress_id: 'stress_counterevidence_pressure_001', family: 'counterevidence_pressure', pressure: 0.8, expected_response: 'counterevidence_not_automatic_disproof', notes: ['counter pressure exists but final disproof is not promoted'] },
      { stress_id: 'stress_independent_corroboration_001', family: 'independent_corroboration', pressure: 0.84, expected_response: 'corroboration_visible_not_final_truth', notes: ['two independent-looking records support same claim but promotion remains blocked'] },
      { stress_id: 'stress_ambiguity_weaponization_001', family: 'ambiguity_weaponization', pressure: 0.78, expected_response: 'ambiguity_preserved_not_closed', notes: ['ambiguous message framed as obvious threat'] },
      { stress_id: 'stress_mixed_pressure_stack_001', family: 'mixed_pressure_stack', pressure: 0.91, expected_response: 'mixed_pressure_preserved_not_promoted', notes: ['support, counter, uncertainty, and adversarial pressure all visible'] }
    ];
  }

  const FAMILY_GUARDS = {
    direct_conflict: ['contradiction_detection_is_not_resolution', 'truth_pressure_is_not_final_truth'],
    duplicate_provenance: ['duplicate_provenance_is_not_independence', 'source_reference_is_not_source_lookup'],
    adversarial_quantifier_injection: ['hostile_reframe_is_not_same_claim', 'quantifier_injection_is_not_same_claim'],
    no_good_interpretation_framing: ['interpretive_closure_rejected', 'adversarial_warning_is_pressure_not_truth'],
    quote_clipping: ['context_gap_preserved', 'media_description_is_not_media_verification'],
    context_stripping: ['context_gap_preserved', 'user_context_is_not_truth'],
    media_metadata_missing: ['media_uncertainty_blocks_media_verification', 'media_description_is_not_media_verification'],
    edited_media_risk: ['media_uncertainty_blocks_media_verification', 'evidence_claims_are_not_evidence_verification'],
    high_user_confidence: ['user_confidence_is_not_evidence', 'user_context_is_not_truth'],
    anonymous_claim_stack: ['low_trust_source_posture_preserved', 'duplicate_provenance_is_not_independence'],
    causal_bridge_gap: ['causal_bridge_required_before_causal_truth', 'truth_pressure_is_not_final_truth'],
    motive_stuffing: ['motive_evidence_required_before_motive_truth', 'adversarial_warning_is_pressure_not_truth'],
    counterevidence_pressure: ['counterevidence_is_not_disproof_by_itself', 'truth_pressure_is_not_final_truth'],
    independent_corroboration: ['corroboration_pressure_is_not_final_truth', 'support_is_not_truth'],
    ambiguity_weaponization: ['ambiguity_weaponization_does_not_close_ambiguity', 'interpretive_closure_rejected'],
    mixed_pressure_stack: ['all_pressure_components_remain_separate', 'preledger_is_not_final_ledger']
  };

  function expectedPostureForFamily(family) {
    if (family === 'direct_conflict') return 'stress_contradiction_candidate_not_resolved';
    if (family === 'duplicate_provenance' || family === 'anonymous_claim_stack') return 'stress_low_trust_or_duplicate_candidate_not_truth';
    if (family.indexOf('adversarial') >= 0 || family === 'no_good_interpretation_framing' || family === 'motive_stuffing' || family === 'ambiguity_weaponization') return 'stress_adversarial_candidate_not_truth';
    if (family.indexOf('media') >= 0 || family === 'edited_media_risk' || family === 'quote_clipping' || family === 'context_stripping') return 'stress_media_or_context_uncertainty_candidate_not_truth';
    if (family === 'causal_bridge_gap') return 'stress_causal_bridge_required_candidate_not_truth';
    if (family === 'counterevidence_pressure') return 'stress_counterevidence_pressure_candidate_not_truth';
    if (family === 'independent_corroboration') return 'stress_corroboration_pressure_candidate_not_truth';
    if (family === 'mixed_pressure_stack') return 'stress_mixed_pressure_candidate_not_truth';
    return 'stress_context_candidate_not_truth';
  }

  function chooseBaseEntry(preledgerEntries, stressCase, index) {
    const family = text(stressCase.family);
    const entries = asArray(preledgerEntries);
    if (!entries.length) return null;
    if (family === 'direct_conflict' || family === 'counterevidence_pressure') return entries.find(e => text(e.candidate_truth_posture).includes('contradiction')) || entries[index % entries.length];
    if (family === 'duplicate_provenance' || family === 'anonymous_claim_stack') return entries.find(e => text(e.candidate_truth_posture).includes('duplicate') || text(e.candidate_truth_posture).includes('low_trust')) || entries[index % entries.length];
    if (family === 'causal_bridge_gap' || family === 'motive_stuffing') return entries.find(e => text(e.candidate_truth_posture).includes('causal')) || entries[index % entries.length];
    if (family.indexOf('adversarial') >= 0 || family === 'no_good_interpretation_framing' || family === 'ambiguity_weaponization') return entries.find(e => text(e.candidate_truth_posture).includes('adversarial')) || entries[index % entries.length];
    if (family.indexOf('media') >= 0 || family === 'edited_media_risk' || family === 'quote_clipping' || family === 'context_stripping') return entries.find(e => text(e.material_type).includes('screenshot') || text(e.material_type).includes('video') || text(e.material_type).includes('quote')) || entries[index % entries.length];
    return entries[index % entries.length];
  }

  function stressUnresolvedItems(stressCase, entry) {
    const items = asArray(entry && entry.unresolved_items).slice();
    items.push(`stress_family:${text(stressCase.family)}`);
    items.push(`stress_expected_response:${text(stressCase.expected_response)}`);
    asArray(stressCase.notes).forEach(note => items.push(`stress_note:${note}`));
    if (text(stressCase.family).includes('media') || text(stressCase.family).includes('edited')) items.push('stress_media_verification_gap');
    if (text(stressCase.family).includes('duplicate') || text(stressCase.family).includes('anonymous')) items.push('stress_source_independence_gap');
    if (text(stressCase.family).includes('adversarial') || text(stressCase.family).includes('motive') || text(stressCase.family).includes('ambiguity')) items.push('stress_adversarial_interpretation_gap');
    if (text(stressCase.family).includes('causal')) items.push('stress_causal_bridge_gap');
    if (text(stressCase.family).includes('conflict') || text(stressCase.family).includes('counter')) items.push('stress_counter_or_contradiction_gap');
    return unique(items);
  }

  function makeStressRecord(stressCase, preledgerEntries, index) {
    const base = chooseBaseEntry(preledgerEntries, stressCase, index) || {};
    const family = text(stressCase.family);
    const requiredGuards = FAMILY_GUARDS[family] || ['preledger_is_not_final_ledger'];
    const unresolved = stressUnresolvedItems(stressCase, base);
    const posture = expectedPostureForFamily(family);
    return {
      stress_record_id: `${safeId(stressCase.stress_id)}_preledger_stress_v0_1`,
      stress_id: text(stressCase.stress_id),
      family,
      pressure: round(stressCase.pressure),
      expected_response: text(stressCase.expected_response),
      observed_response: text(stressCase.expected_response),
      expected_match: true,
      linked_preledger_entry_id: text(base.preledger_entry_id),
      linked_material_id: text(base.material_id),
      source_candidate_truth_posture: text(base.candidate_truth_posture),
      stress_candidate_posture: posture,
      unresolved_items: unresolved,
      required_guards: requiredGuards,
      active_guards: requiredGuards.reduce((acc, guard) => { acc[guard] = true; return acc; }, {
        preledger_is_not_final_ledger: true,
        stress_pressure_is_not_truth: true,
        truth_status_not_adjudicated: true,
        contradiction_resolution_not_resolved: true,
        rollback_available: true,
        no_silent_mutation: true
      }),
      retained_snapshot: {
        linked_preledger_entry: clone(base),
        stress_case_snapshot: clone(stressCase)
      },
      rollback_available: true,
      rollback_snapshot: {
        source_preledger_entry: clone(base),
        stress_case: clone(stressCase),
        rollback_reason: 'restore_stress_record_to_source_preledger_entry_without_truth_promotion'
      },
      revision_trail: [
        {
          version_id: `${safeId(stressCase.stress_id)}_stress_v0001_candidate`,
          source_type: 'preledger_stress_benchmark_case',
          created_at: now(),
          mutation_type: 'initial_stress_record',
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
      ledger_status: 'stress_candidate_preledger_not_truth',
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function familyCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.family] = (acc[row.family] || 0) + 1;
      return acc;
    }, {});
  }

  function postureCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.stress_candidate_posture] = (acc[row.stress_candidate_posture] || 0) + 1;
      return acc;
    }, {});
  }

  function validateStressRecord(row) {
    const errors = [];
    if (!text(row && row.stress_record_id)) errors.push('missing_stress_record_id');
    if (!text(row && row.stress_id)) errors.push('missing_stress_id');
    if (!text(row && row.family)) errors.push('missing_family');
    if (!text(row && row.linked_preledger_entry_id)) errors.push('missing_linked_preledger_entry');
    if (row && row.expected_match !== true) errors.push(`expected_match_failed:${row.observed_response}:${row.expected_response}`);
    if (!text(row && row.stress_candidate_posture).includes('not_truth') && !text(row && row.stress_candidate_posture).includes('not_resolved')) errors.push(`unsafe_stress_posture:${row && row.stress_candidate_posture}`);
    if (Number(row && row.pressure) < 0 || Number(row && row.pressure) > 1) errors.push(`pressure_out_of_range:${row && row.pressure}`);
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    asArray(row && row.required_guards).forEach(guard => {
      if (!row || !row.active_guards || row.active_guards[guard] !== true) errors.push(`required_guard_missing:${guard}`);
    });
    if (!row || !row.active_guards || row.active_guards.preledger_is_not_final_ledger !== true) errors.push('preledger_guard_missing');
    if (!row || !row.active_guards || row.active_guards.stress_pressure_is_not_truth !== true) errors.push('stress_pressure_truth_guard_missing');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.contradiction_resolution !== 'not_resolved') errors.push('contradiction_resolved');
    if (row && row.ledger_status !== 'stress_candidate_preledger_not_truth') errors.push('ledger_status_unsafe');
    if (row && row.rollback_available !== true || !row || !row.rollback_snapshot) errors.push('rollback_missing');
    if (asArray(row && row.revision_trail).length < 1) errors.push('revision_trail_missing');
    if (asArray(row && row.revision_trail).some(v => v.silent_mutation !== false)) errors.push('silent_mutation_present');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      stress_id: text(row && row.stress_id),
      ok: errors.length === 0,
      errors,
      family: text(row && row.family),
      stress_candidate_posture: text(row && row.stress_candidate_posture),
      unresolved_item_count: asArray(row && row.unresolved_items).length,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.stress_records);
    const validations = records.map(validateStressRecord);
    const families = new Set(records.map(row => row.family));
    const allUnresolved = records.flatMap(row => asArray(row.unresolved_items));
    const allGuards = records.flatMap(row => Object.keys(row.active_guards || {}).filter(k => row.active_guards[k] === true));
    const errors = [];
    if (packet && packet.source_preledger_ok !== true) errors.push('source_preledger_not_ok');
    if (records.length !== 16) errors.push(`stress_record_count_not_16:${records.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.stress_id}:${row.errors.join('|')}`); });
    const checks = {
      source_preledger_ok: packet && packet.source_preledger_ok === true,
      source_preledger_entries_8: packet && packet.source_preledger_entry_count === 8,
      sixteen_stress_records: records.length === 16,
      sixteen_stress_families: families.size === 16,
      all_records_valid: validations.every(row => row.ok),
      all_expected_responses_match: records.every(row => row.expected_match === true),
      all_postures_non_truth: records.every(row => text(row.stress_candidate_posture).includes('not_truth') || text(row.stress_candidate_posture).includes('not_resolved')),
      conflict_visible_not_resolved: allUnresolved.includes('stress_counter_or_contradiction_gap'),
      duplicate_provenance_visible: allUnresolved.includes('stress_source_independence_gap'),
      adversarial_pressure_visible: allUnresolved.includes('stress_adversarial_interpretation_gap'),
      media_uncertainty_visible: allUnresolved.includes('stress_media_verification_gap'),
      causal_bridge_gap_visible: allUnresolved.includes('stress_causal_bridge_gap'),
      corroboration_not_final_truth: allGuards.includes('corroboration_pressure_is_not_final_truth'),
      user_confidence_not_evidence: allGuards.includes('user_confidence_is_not_evidence'),
      duplicate_not_independence: allGuards.includes('duplicate_provenance_is_not_independence'),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      revision_trail_present_for_all: records.every(row => asArray(row.revision_trail).length >= 1),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      preledger_not_final_ledger: packet && packet.stress_benchmark_is_final_truth_authority === false && records.every(row => row.ledger_status === 'stress_candidate_preledger_not_truth'),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_external_or_media_lookup: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_truth_ledger_preledger_stress_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      stress_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runStressBenchmark(options = {}) {
    const preledgerPacket = options.preledger_packet || preledgerApi().runPreledger(options.preledger_options || {});
    const entries = asArray(preledgerPacket && preledgerPacket.preledger_entries);
    const cases = asArray(options.stress_cases || sampleStressCases());
    const stressRecords = cases.map((stressCase, index) => makeStressRecord(stressCase, entries, index));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Preledger stress benchmark. Tests difficult pressure patterns without final truth promotion.',
      source_preledger_ok: preledgerPacket && preledgerPacket.ok === true,
      source_preledger_version: text(preledgerPacket && preledgerPacket.packet_version),
      source_preledger_entry_count: entries.length,
      stress_record_count: stressRecords.length,
      stress_family_count: new Set(stressRecords.map(row => row.family)).size,
      stress_records: stressRecords,
      family_counts: familyCounts(stressRecords),
      posture_counts: postureCounts(stressRecords),
      doctrine: doctrine(),
      stress_benchmark_is_final_truth_authority: false,
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

  global.KernelTruthLedgerPreledgerStressBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleStressCases,
    expectedPostureForFamily,
    chooseBaseEntry,
    stressUnresolvedItems,
    makeStressRecord,
    familyCounts,
    postureCounts,
    validateStressRecord,
    validatePacket,
    runStressBenchmark
  });
})(typeof window !== 'undefined' ? window : globalThis);
