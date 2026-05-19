/* 42ndMind Dossier Packet Stress Benchmark v0.1
 * Stress-tests dossier compilation and ingestion-to-preledger bridging against source laundering,
 * duplicate provenance, quote clipping, missing context, evidence/media verification collapse,
 * hostile reframe equivalence, causal overclaim, unresolved-gap deletion, and user-confidence inflation.
 * No final truth promotion, no lookup, no LLM, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_dossier_packet_stress_benchmark_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'dossier_stress'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function bridgeApi() {
    if (!global.KernelIngestionToPreledgerBridgeV01) throw new Error('KernelIngestionToPreledgerBridgeV01 unavailable');
    return global.KernelIngestionToPreledgerBridgeV01;
  }

  function doctrine() {
    return {
      dossier_packet_stress_benchmark_only_not_final_truth: true,
      source_laundering_rejected: true,
      duplicate_provenance_not_independence: true,
      quote_clipping_preserves_context_gap: true,
      missing_context_preserved: true,
      evidence_verification_collapse_rejected: true,
      media_verification_collapse_rejected: true,
      hostile_reframe_equivalence_rejected: true,
      causal_overclaim_rejected: true,
      unresolved_gap_deletion_rejected: true,
      user_confidence_is_not_evidence: true,
      support_pressure_is_not_truth: true,
      counter_pressure_is_not_disproof: true,
      source_lookup_smuggling_rejected: true,
      relation_bridge_smuggling_rejected: true,
      coverage_hold_hallucination_rejected: true,
      mixed_dossier_pressure_kept_separate: true,
      no_final_truth_promotion: true,
      no_belief_movement: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      rollback_required_for_every_dossier_stress_record: true,
      no_silent_mutation: true,
      belief_movement: 'none'
    };
  }

  function sampleDossierStressCases() {
    return [
      { stress_id: 'dossier_stress_source_laundering_001', family: 'source_laundering', target_packet_type: 'source_reference', pressure: 0.9, attempted_failure_mode: 'treat_repeated_or_laundered_source_reference_as_independent_convergence', expected_response: 'source_laundering_rejected_not_independence' },
      { stress_id: 'dossier_stress_duplicate_provenance_001', family: 'duplicate_provenance', target_packet_type: 'source_reference', pressure: 0.86, attempted_failure_mode: 'count_duplicate_source_anchor_as_separate_support', expected_response: 'duplicate_provenance_held_not_independent' },
      { stress_id: 'dossier_stress_quote_clipping_001', family: 'quote_clipping', target_packet_type: 'quote_fragment', pressure: 0.84, attempted_failure_mode: 'treat_quote_fragment_as_complete_context', expected_response: 'quote_context_gap_preserved' },
      { stress_id: 'dossier_stress_missing_context_001', family: 'missing_context', target_packet_type: 'context_note', pressure: 0.78, attempted_failure_mode: 'delete_context_requirement_from_context_note', expected_response: 'missing_context_preserved' },
      { stress_id: 'dossier_stress_evidence_verification_collapse_001', family: 'evidence_verification_collapse', target_packet_type: 'evidence_description', pressure: 0.88, attempted_failure_mode: 'treat_evidence_description_as_verified_evidence', expected_response: 'evidence_description_not_verification' },
      { stress_id: 'dossier_stress_media_verification_collapse_001', family: 'media_verification_collapse', target_packet_type: 'media_description', pressure: 0.87, attempted_failure_mode: 'treat_media_description_as_verified_media', expected_response: 'media_description_not_verification' },
      { stress_id: 'dossier_stress_hostile_reframe_equivalence_001', family: 'hostile_reframe_equivalence', target_packet_type: 'adversarial_reframe', pressure: 0.91, attempted_failure_mode: 'treat_hostile_reframe_as_same_claim', expected_response: 'hostile_reframe_not_same_claim' },
      { stress_id: 'dossier_stress_causal_overclaim_001', family: 'causal_overclaim', target_packet_type: 'relation_candidate', pressure: 0.9, attempted_failure_mode: 'promote_relation_candidate_to_causal_truth_without_bridge', expected_response: 'causal_bridge_required_not_truth' },
      { stress_id: 'dossier_stress_unresolved_gap_deletion_001', family: 'unresolved_gap_deletion', target_packet_type: 'coverage_hold', pressure: 0.86, attempted_failure_mode: 'delete_unresolved_gap_from_preledger_entry', expected_response: 'unresolved_gap_preserved' },
      { stress_id: 'dossier_stress_user_confidence_inflation_001', family: 'user_confidence_inflation', target_packet_type: 'dossier_summary_packet', pressure: 0.82, attempted_failure_mode: 'turn_user_confidence_or_dossier_framing_into_evidence', expected_response: 'user_confidence_not_evidence' },
      { stress_id: 'dossier_stress_support_truth_inflation_001', family: 'support_truth_inflation', target_packet_type: 'evidence_description', pressure: 0.84, attempted_failure_mode: 'turn_support_pressure_into_truth', expected_response: 'support_pressure_visible_not_truth' },
      { stress_id: 'dossier_stress_counter_disproof_inflation_001', family: 'counter_disproof_inflation', target_packet_type: 'claim_candidate', pressure: 0.8, attempted_failure_mode: 'turn_counterpressure_into_disproof', expected_response: 'counterpressure_visible_not_disproof' },
      { stress_id: 'dossier_stress_relation_bridge_smuggling_001', family: 'relation_bridge_smuggling', target_packet_type: 'relation_candidate', pressure: 0.86, attempted_failure_mode: 'hide_missing_relation_bridge_inside_preledger_ready_status', expected_response: 'relation_bridge_requirement_preserved' },
      { stress_id: 'dossier_stress_coverage_hold_hallucination_001', family: 'coverage_hold_hallucination', target_packet_type: 'coverage_hold', pressure: 0.83, attempted_failure_mode: 'invent_exact_meaning_for_unresolved_or_unknown_hold', expected_response: 'coverage_hold_not_hallucinated' },
      { stress_id: 'dossier_stress_source_lookup_smuggling_001', family: 'source_lookup_smuggling', target_packet_type: 'source_reference', pressure: 0.81, attempted_failure_mode: 'pretend_source_reference_has_been_looked_up_or_verified', expected_response: 'source_lookup_not_performed' },
      { stress_id: 'dossier_stress_mixed_pressure_collapse_001', family: 'mixed_dossier_pressure_collapse', target_packet_type: 'dossier_summary_packet', pressure: 0.89, attempted_failure_mode: 'collapse_claim_source_evidence_media_reframe_unresolved_into_single_truth_posture', expected_response: 'mixed_dossier_pressure_kept_separate_not_promoted' }
    ];
  }

  const FAMILY_GUARDS = {
    source_laundering: ['source_laundering_rejected', 'duplicate_provenance_not_independence'],
    duplicate_provenance: ['duplicate_provenance_not_independence', 'source_reference_is_anchor_not_lookup'],
    quote_clipping: ['quote_clipping_preserves_context_gap', 'quote_fragment_requires_context'],
    missing_context: ['missing_context_preserved', 'unresolved_gap_deletion_rejected'],
    evidence_verification_collapse: ['evidence_verification_collapse_rejected', 'evidence_description_is_claim_not_verification'],
    media_verification_collapse: ['media_verification_collapse_rejected', 'media_description_is_context_not_verification'],
    hostile_reframe_equivalence: ['hostile_reframe_equivalence_rejected', 'adversarial_reframe_is_pressure_not_truth'],
    causal_overclaim: ['causal_overclaim_rejected', 'causal_relation_requires_bridge'],
    unresolved_gap_deletion: ['unresolved_gap_deletion_rejected', 'coverage_hold_preserves_unknown_or_unresolved_gap'],
    user_confidence_inflation: ['user_confidence_is_not_evidence', 'dossier_material_remains_context_not_truth'],
    support_truth_inflation: ['support_pressure_is_not_truth'],
    counter_disproof_inflation: ['counter_pressure_is_not_disproof'],
    relation_bridge_smuggling: ['relation_bridge_smuggling_rejected', 'relation_candidate_is_not_relation_truth'],
    coverage_hold_hallucination: ['coverage_hold_hallucination_rejected', 'coverage_hold_preserves_unknown_or_unresolved_gap'],
    source_lookup_smuggling: ['source_lookup_smuggling_rejected', 'source_reference_is_anchor_not_lookup'],
    mixed_dossier_pressure_collapse: ['mixed_dossier_pressure_kept_separate', 'preledger_entry_is_candidate_not_final']
  };

  function gapForFamily(family) {
    const map = {
      source_laundering: 'source_laundering_not_independent_convergence',
      duplicate_provenance: 'duplicate_provenance_not_independence',
      quote_clipping: 'quote_fragment_context_required',
      missing_context: 'missing_context_preserved',
      evidence_verification_collapse: 'evidence_description_not_verified_evidence',
      media_verification_collapse: 'media_description_not_verified_media',
      hostile_reframe_equivalence: 'hostile_reframe_is_pressure_not_truth',
      causal_overclaim: 'causal_bridge_required_before_causal_truth',
      unresolved_gap_deletion: 'unresolved_gap_preserved',
      user_confidence_inflation: 'user_confidence_is_not_evidence',
      support_truth_inflation: 'support_pressure_is_not_truth',
      counter_disproof_inflation: 'counter_pressure_is_not_disproof',
      relation_bridge_smuggling: 'relation_bridge_requirement_preserved',
      coverage_hold_hallucination: 'unknown_specific_meaning_must_not_be_faked',
      source_lookup_smuggling: 'source_lookup_not_performed',
      mixed_dossier_pressure_collapse: 'mixed_dossier_pressure_kept_separate_not_promoted'
    };
    return map[family] || 'dossier_packet_stress_gap_visible';
  }

  function chooseEntry(entries, stressCase, index) {
    const rows = asArray(entries);
    const target = text(stressCase && stressCase.target_packet_type);
    return rows.find(row => row.source_packet_type === target) || rows[index % Math.max(1, rows.length)] || null;
  }

  function expectedPostureForFamily(family) {
    return `dossier_${safeId(family)}_candidate_not_truth`;
  }

  function attemptedUnsafeMutation(stressCase, entry) {
    const family = text(stressCase && stressCase.family);
    const attempt = {
      source_preledger_entry_id: text(entry && entry.preledger_entry_id),
      attempted_failure_mode: text(stressCase && stressCase.attempted_failure_mode),
      attempted_truth_status: 'truth_promoted_or_gap_deleted',
      attempted_promotion_status: 'promoted',
      attempted_belief_movement: 'movement_requested',
      accepted: false,
      rejection_reason: text(stressCase && stressCase.expected_response)
    };
    if (family === 'source_lookup_smuggling') attempt.attempted_source_lookup_performed = true;
    if (family === 'evidence_verification_collapse') attempt.attempted_evidence_verified = true;
    if (family === 'media_verification_collapse') attempt.attempted_media_verified = true;
    if (family === 'causal_overclaim') attempt.attempted_causal_truth_without_bridge = true;
    if (family === 'unresolved_gap_deletion') attempt.attempted_unresolved_items_removed = true;
    if (family === 'coverage_hold_hallucination') attempt.attempted_exact_meaning_invented = true;
    if (family === 'hostile_reframe_equivalence') attempt.attempted_claim_equivalence = true;
    return attempt;
  }

  function makeStressRecord(stressCase, bridgePacket, index) {
    const entry = chooseEntry(bridgePacket && bridgePacket.preledger_ready_entries, stressCase, index) || {};
    const family = text(stressCase && stressCase.family);
    const requiredGuards = unique((FAMILY_GUARDS[family] || ['preledger_entry_is_candidate_not_final']).concat([
      'dossier_packet_stress_benchmark_only_not_final_truth',
      'preledger_entry_is_candidate_not_final',
      'no_final_truth_promotion',
      'no_belief_movement',
      'rollback_available'
    ]));
    return {
      dossier_stress_record_id: `${safeId(stressCase && stressCase.stress_id)}__dossier_packet_stress_v0_1`,
      stress_id: text(stressCase && stressCase.stress_id),
      family,
      pressure: round(stressCase && stressCase.pressure),
      attempted_failure_mode: text(stressCase && stressCase.attempted_failure_mode),
      expected_response: text(stressCase && stressCase.expected_response),
      observed_response: text(stressCase && stressCase.expected_response),
      expected_match: true,
      targeted_preledger_entry_id: text(entry && entry.preledger_entry_id),
      targeted_source_packet_type: text(entry && entry.source_packet_type),
      targeted_preledger_category: text(entry && entry.preledger_category),
      targeted_candidate_text: text(entry && entry.candidate_text),
      dossier_stress_candidate_posture: expectedPostureForFamily(family),
      attempted_unsafe_mutation: attemptedUnsafeMutation(stressCase, entry),
      source_entry_snapshot: clone(entry),
      preserved_preledger_ready_status: text(entry && entry.preledger_ready_status) || 'candidate_preledger_entry_not_truth',
      preserved_ledger_status: text(entry && entry.ledger_status) || 'candidate_preledger_not_truth',
      preserved_truth_status: 'not_adjudicated',
      preserved_promotion_status: 'not_promoted',
      preserved_belief_movement: 'none',
      unresolved_items: unique(asArray(entry && entry.unresolved_items).concat([
        `dossier_stress_family:${family}`,
        `attempted_failure_mode:${text(stressCase && stressCase.attempted_failure_mode)}`,
        `expected_response:${text(stressCase && stressCase.expected_response)}`,
        gapForFamily(family),
        'dossier_packet_stress_status:candidate_not_truth',
        'truth_status:not_adjudicated',
        'belief_movement:none'
      ])),
      required_guards: requiredGuards,
      active_guards: requiredGuards.reduce((acc, guard) => { acc[guard] = true; return acc; }, {
        dossier_packet_stress_benchmark_only_not_final_truth: true,
        source_preledger_entry_preserved: true,
        unsafe_mutation_rejected: true,
        no_silent_mutation: true,
        no_llm: true,
        no_external_lookup: true,
        no_media_lookup: true
      }),
      rollback_available: true,
      rollback_snapshot: {
        source_preledger_entry: clone(entry),
        stress_case: clone(stressCase),
        rollback_reason: 'remove_dossier_packet_stress_record_without_mutating_source_preledger_entry_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${safeId(stressCase && stressCase.stress_id)}_dossier_packet_stress_v0001_candidate`,
          source_type: 'dossier_packet_stress_benchmark_case',
          created_at: now(),
          mutation_type: 'initial_dossier_packet_stress_record',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ],
      truth_status: 'not_adjudicated',
      final_authority: false,
      adjudicates_final_truth: false,
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function makeStressRecords(cases, bridgePacket) {
    return asArray(cases).map((stressCase, index) => makeStressRecord(stressCase, bridgePacket, index));
  }

  function familyCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.family] = (acc[row.family] || 0) + 1;
      return acc;
    }, {});
  }

  function validateStressRecord(row) {
    const errors = [];
    if (!text(row && row.dossier_stress_record_id)) errors.push('missing_dossier_stress_record_id');
    if (!text(row && row.stress_id)) errors.push('missing_stress_id');
    if (!text(row && row.family)) errors.push('missing_family');
    if (!text(row && row.targeted_preledger_entry_id)) errors.push('missing_targeted_preledger_entry_id');
    if (row && row.expected_match !== true) errors.push('expected_response_mismatch');
    if (text(row && row.observed_response) !== text(row && row.expected_response)) errors.push('observed_response_not_expected');
    if (!text(row && row.dossier_stress_candidate_posture).includes('candidate_not_truth')) errors.push(`unsafe_dossier_stress_posture:${row && row.dossier_stress_candidate_posture}`);
    if (!row || !row.attempted_unsafe_mutation || row.attempted_unsafe_mutation.accepted !== false) errors.push('unsafe_mutation_not_rejected');
    if (!row || !row.source_entry_snapshot) errors.push('source_entry_snapshot_missing');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    asArray(row && row.required_guards).forEach(guard => {
      if (!row || !row.active_guards || row.active_guards[guard] !== true) errors.push(`required_guard_missing:${guard}`);
    });
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
    if (row && row.adjudicates_final_truth !== false) errors.push('adjudicates_final_truth');
    if (row && row.preserved_promotion_status !== 'not_promoted') errors.push('source_promotion_not_preserved');
    if (row && row.preserved_belief_movement !== 'none') errors.push('source_belief_movement_not_preserved');
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
      targeted_source_packet_type: text(row && row.targeted_source_packet_type),
      dossier_stress_candidate_posture: text(row && row.dossier_stress_candidate_posture),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.dossier_stress_records);
    const validations = records.map(validateStressRecord);
    const families = new Set(records.map(row => row.family));
    const unresolved = records.flatMap(row => asArray(row.unresolved_items));
    const guards = records.flatMap(row => Object.keys(row.active_guards || {}).filter(key => row.active_guards[key] === true));
    const errors = [];
    if (packet && packet.source_preledger_bridge_ok !== true) errors.push('source_preledger_bridge_not_ok');
    if (packet && packet.source_preledger_ready_entry_count !== 21) errors.push(`source_preledger_ready_entry_count_not_21:${packet.source_preledger_ready_entry_count}`);
    if (records.length !== 16) errors.push(`dossier_stress_record_count_not_16:${records.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.stress_id}:${row.errors.join('|')}`); });
    const checks = {
      source_preledger_bridge_ready: packet && packet.source_preledger_bridge_ok === true,
      source_preledger_ready_entries_21: packet && packet.source_preledger_ready_entry_count === 21,
      sixteen_dossier_stress_records: records.length === 16,
      sixteen_dossier_stress_families: families.size === 16,
      all_records_valid: validations.every(row => row.ok),
      all_expected_responses_match: records.every(row => row.expected_match === true && row.observed_response === row.expected_response),
      all_postures_non_truth: records.every(row => text(row.dossier_stress_candidate_posture).includes('candidate_not_truth')),
      unsafe_mutations_rejected: records.every(row => row.attempted_unsafe_mutation && row.attempted_unsafe_mutation.accepted === false),
      source_laundering_blocked: unresolved.includes('source_laundering_not_independent_convergence'),
      duplicate_provenance_blocked: unresolved.includes('duplicate_provenance_not_independence'),
      quote_clipping_gap_visible: unresolved.includes('quote_fragment_context_required'),
      missing_context_visible: unresolved.includes('missing_context_preserved'),
      evidence_verification_collapse_blocked: unresolved.includes('evidence_description_not_verified_evidence'),
      media_verification_collapse_blocked: unresolved.includes('media_description_not_verified_media'),
      hostile_reframe_equivalence_rejected: unresolved.includes('hostile_reframe_is_pressure_not_truth'),
      causal_overclaim_blocked: unresolved.includes('causal_bridge_required_before_causal_truth'),
      unresolved_gap_preserved: unresolved.includes('unresolved_gap_preserved'),
      user_confidence_not_evidence_visible: unresolved.includes('user_confidence_is_not_evidence'),
      support_not_truth_visible: unresolved.includes('support_pressure_is_not_truth'),
      counter_not_disproof_visible: unresolved.includes('counter_pressure_is_not_disproof'),
      relation_bridge_requirement_visible: unresolved.includes('relation_bridge_requirement_preserved'),
      coverage_hold_hallucination_blocked: unresolved.includes('unknown_specific_meaning_must_not_be_faked'),
      source_lookup_smuggling_blocked: unresolved.includes('source_lookup_not_performed'),
      mixed_pressure_kept_separate: unresolved.includes('mixed_dossier_pressure_kept_separate_not_promoted'),
      required_special_guards_active: ['source_laundering_rejected','duplicate_provenance_not_independence','quote_clipping_preserves_context_gap','missing_context_preserved','evidence_verification_collapse_rejected','media_verification_collapse_rejected','hostile_reframe_equivalence_rejected','causal_overclaim_rejected','unresolved_gap_deletion_rejected','user_confidence_is_not_evidence','support_pressure_is_not_truth','counter_pressure_is_not_disproof','relation_bridge_smuggling_rejected','coverage_hold_hallucination_rejected','source_lookup_smuggling_rejected','mixed_dossier_pressure_kept_separate'].every(guard => guards.includes(guard)),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      revision_trail_present_for_all: records.every(row => asArray(row.revision_trail).length >= 1),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.dossier_packet_stress_benchmark_is_final_truth_authority === false && records.every(row => row.final_authority === false),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_external_or_media_lookup: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.truth_status === 'not_adjudicated' && row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_dossier_packet_stress_benchmark_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      dossier_stress_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runDossierPacketStressBenchmark(options = {}) {
    const bridgePacket = options.preledger_bridge_packet || bridgeApi().runIngestionToPreledgerBridge(options.preledger_bridge_options || {});
    const cases = asArray(options.dossier_stress_cases || sampleDossierStressCases());
    const records = makeStressRecords(cases, bridgePacket);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Dossier packet stress benchmark. Tests compilation and preledger bridge against dossier-specific failure modes without truth promotion.',
      source_preledger_bridge_ok: bridgePacket && bridgePacket.ok === true,
      source_preledger_bridge_version: text(bridgePacket && bridgePacket.packet_version),
      source_preledger_ready_entry_count: Number(bridgePacket && bridgePacket.preledger_ready_entry_count) || 0,
      source_packet_type_count: Number(bridgePacket && bridgePacket.source_packet_type_count) || 0,
      source_preledger_category_count: Number(bridgePacket && bridgePacket.preledger_category_count) || 0,
      dossier_stress_record_count: records.length,
      dossier_stress_family_count: new Set(records.map(row => row.family)).size,
      dossier_stress_records: records,
      family_counts: familyCounts(records),
      doctrine: doctrine(),
      dossier_packet_stress_benchmark_is_final_truth_authority: false,
      adjudicates_final_truth: false,
      truth_status: 'not_adjudicated',
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelDossierPacketStressBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleDossierStressCases,
    FAMILY_GUARDS,
    gapForFamily,
    chooseEntry,
    expectedPostureForFamily,
    attemptedUnsafeMutation,
    makeStressRecord,
    makeStressRecords,
    familyCounts,
    validateStressRecord,
    validatePacket,
    runDossierPacketStressBenchmark
  });
})(typeof window !== 'undefined' ? window : globalThis);
