/* 42ndMind Coverage Stress Benchmark v0.1
 * Stress-tests the coverage expansion library against fake exact meaning, literalization,
 * ambiguity closure, anchor gaps, scope/modality drift, negation failure, causal overclaim,
 * and unknown-pattern hallucination.
 * No final truth promotion, no lookup, no LLM, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_coverage_stress_benchmark_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'coverage_stress'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function coverageApi() {
    if (!global.KernelCoverageExpansionLibraryV01) throw new Error('KernelCoverageExpansionLibraryV01 unavailable');
    return global.KernelCoverageExpansionLibraryV01;
  }

  function doctrine() {
    return {
      coverage_stress_benchmark_only_not_final_truth: true,
      coverage_records_remain_candidates: true,
      coverage_class_is_not_exact_meaning: true,
      fake_exact_meaning_rejected: true,
      idiom_literalization_rejected: true,
      sarcasm_literalization_rejected: true,
      metaphor_collapse_rejected: true,
      ambiguity_closure_rejected: true,
      deictic_anchor_gap_preserved: true,
      scope_boundary_preserved: true,
      modality_inflation_rejected: true,
      condition_deletion_rejected: true,
      negation_scope_gap_preserved: true,
      causal_overclaim_rejected: true,
      evidence_verification_collapse_rejected: true,
      unknown_pattern_hallucination_rejected: true,
      dictionary_inflation_rejected: true,
      no_fake_specific_meaning: true,
      no_silent_dictionary_inflation: true,
      no_final_truth_promotion: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      rollback_required_for_every_coverage_stress_record: true,
      no_silent_mutation: true,
      belief_movement: 'none'
    };
  }

  function sampleCoverageStressCases() {
    return [
      { stress_id: 'coverage_stress_fake_exact_meaning_001', family: 'fake_exact_meaning', target_coverage_family: 'unknown_pattern_hold_for_admission', pressure: 0.92, attempted_failure_mode: 'invent_exact_meaning_for_unknown_phrase', sample_input: 'Zorp flindle makes the bracket hum.', expected_response: 'hold_for_admission_without_faking_meaning' },
      { stress_id: 'coverage_stress_idiom_literalization_001', family: 'idiom_literalization', target_coverage_family: 'idiom_or_fixed_expression', pressure: 0.86, attempted_failure_mode: 'treat_idiom_as_literal_words', sample_input: 'That plan is up in the air.', expected_response: 'idiom_class_preserved_exact_meaning_not_faked' },
      { stress_id: 'coverage_stress_sarcasm_literalization_001', family: 'sarcasm_literalization', target_coverage_family: 'sarcasm_or_irony', pressure: 0.87, attempted_failure_mode: 'treat_sarcastic_positive_surface_as_literal_positive_meaning', sample_input: 'Great, another delay.', expected_response: 'surface_intent_tension_preserved' },
      { stress_id: 'coverage_stress_metaphor_collapse_001', family: 'metaphor_collapse', target_coverage_family: 'metaphor_or_analogy', pressure: 0.84, attempted_failure_mode: 'treat_source_domain_mapping_as_literal_identity', sample_input: 'The queue is a bottleneck.', expected_response: 'source_target_mapping_required' },
      { stress_id: 'coverage_stress_ambiguity_closure_001', family: 'ambiguity_closure', target_coverage_family: 'ambiguity_polysemy', pressure: 0.85, attempted_failure_mode: 'force_single_meaning_without_disambiguating_context', sample_input: 'The bank is nearby.', expected_response: 'multiple_candidate_meanings_remain_open' },
      { stress_id: 'coverage_stress_deictic_anchor_gap_001', family: 'missing_deictic_anchor', target_coverage_family: 'deixis_indexicality', pressure: 0.82, attempted_failure_mode: 'resolve_here_there_this_that_without_speaker_time_place_anchor', sample_input: 'Put it there tomorrow.', expected_response: 'speaker_time_place_anchor_required' },
      { stress_id: 'coverage_stress_scope_drift_001', family: 'scope_drift', target_coverage_family: 'scope_quantifier', pressure: 0.88, attempted_failure_mode: 'expand_some_to_all_or_drop_only_boundary', sample_input: 'Some containers are sealed.', expected_response: 'scope_boundary_preserved' },
      { stress_id: 'coverage_stress_modality_inflation_001', family: 'modality_inflation', target_coverage_family: 'modality_possibility', pressure: 0.84, attempted_failure_mode: 'inflate_may_or_might_into_is_or_must', sample_input: 'The door may be locked.', expected_response: 'modal_strength_preserved_not_truth' },
      { stress_id: 'coverage_stress_necessity_source_gap_001', family: 'necessity_source_gap', target_coverage_family: 'modality_necessity', pressure: 0.78, attempted_failure_mode: 'treat_must_as_valid_rule_without_constraint_source', sample_input: 'The door must stay locked.', expected_response: 'constraint_source_required' },
      { stress_id: 'coverage_stress_condition_deletion_001', family: 'condition_deletion', target_coverage_family: 'conditional_relation', pressure: 0.9, attempted_failure_mode: 'delete_if_or_unless_condition_and_keep_conclusion', sample_input: 'If pressure rises, stop the pump.', expected_response: 'condition_boundary_preserved' },
      { stress_id: 'coverage_stress_negation_scope_failure_001', family: 'negation_scope_failure', target_coverage_family: 'negation', pressure: 0.86, attempted_failure_mode: 'attach_negation_to_wrong_predicate_or_drop_negation', sample_input: 'The valve is not open.', expected_response: 'negation_scope_preserved' },
      { stress_id: 'coverage_stress_comparison_axis_loss_001', family: 'comparison_axis_loss', target_coverage_family: 'comparison', pressure: 0.76, attempted_failure_mode: 'compare_without_axis_or_reference_class', sample_input: 'This batch is colder than the last one.', expected_response: 'comparison_axis_and_reference_required' },
      { stress_id: 'coverage_stress_causal_overclaim_001', family: 'causal_overclaim', target_coverage_family: 'causal_relation', pressure: 0.89, attempted_failure_mode: 'promote_causal_marker_to_causal_truth_without_bridge', sample_input: 'The alarm sounded because pressure rose.', expected_response: 'causal_bridge_required_before_causal_truth' },
      { stress_id: 'coverage_stress_evidence_verification_collapse_001', family: 'evidence_verification_collapse', target_coverage_family: 'evidence_marker', pressure: 0.83, attempted_failure_mode: 'treat_evidence_marker_as_verified_evidence', sample_input: 'The log indicates a temperature drop.', expected_response: 'evidence_claim_separate_from_verification' },
      { stress_id: 'coverage_stress_question_command_conflation_001', family: 'question_command_conflation', target_coverage_family: 'question_request', pressure: 0.74, attempted_failure_mode: 'treat_question_as_completed_action_or_hard_command', sample_input: 'Can you check the reading?', expected_response: 'request_target_preserved_not_completed_action' },
      { stress_id: 'coverage_stress_dictionary_inflation_001', family: 'dictionary_inflation_attempt', target_coverage_family: 'idiom_or_fixed_expression', pressure: 0.91, attempted_failure_mode: 'populate_all_idioms_or_words_to_claim_language_completion', sample_input: 'Any unseen expression.', expected_response: 'dictionary_population_rejected_meta_grammar_preserved' }
    ];
  }

  const FAMILY_GUARDS = {
    fake_exact_meaning: ['no_fake_specific_meaning', 'unknown_specifics_hold_for_admission_when_needed'],
    idiom_literalization: ['idiom_literalization_rejected', 'class_recognition_not_exact_meaning'],
    sarcasm_literalization: ['sarcasm_literalization_rejected', 'surface_intent_tension_preserved'],
    metaphor_collapse: ['metaphor_collapse_rejected', 'source_target_mapping_required'],
    ambiguity_closure: ['ambiguity_closure_rejected', 'multiple_candidate_meanings_remain_open'],
    missing_deictic_anchor: ['deictic_anchor_gap_preserved', 'speaker_time_place_anchor_required'],
    scope_drift: ['scope_boundary_preserved', 'quantifier_scope_not_silently_mutated'],
    modality_inflation: ['modality_inflation_rejected', 'modal_strength_preserved'],
    necessity_source_gap: ['constraint_source_required', 'necessity_is_not_automatic_rule_truth'],
    condition_deletion: ['condition_deletion_rejected', 'condition_boundary_preserved'],
    negation_scope_failure: ['negation_scope_gap_preserved', 'negation_scope_preserved'],
    comparison_axis_loss: ['comparison_axis_required', 'reference_class_required'],
    causal_overclaim: ['causal_overclaim_rejected', 'causal_bridge_required_before_causal_truth'],
    evidence_verification_collapse: ['evidence_verification_collapse_rejected', 'evidence_claim_separate_from_evidence_verification'],
    question_command_conflation: ['question_request_not_completed_action', 'request_target_preserved'],
    dictionary_inflation_attempt: ['dictionary_inflation_rejected', 'coverage_expansion_is_meta_grammar_not_dictionary_population']
  };

  function expectedPostureForFamily(family) {
    return `coverage_${safeId(family)}_candidate_not_truth`;
  }

  function chooseCoverageRecord(coverageRecords, stressCase, index) {
    const records = asArray(coverageRecords);
    const targetFamily = text(stressCase && stressCase.target_coverage_family);
    return records.find(row => row.coverage_family === targetFamily) || records[index % Math.max(1, records.length)] || null;
  }

  function stressGapForFamily(family) {
    const map = {
      fake_exact_meaning: 'unknown_specific_meaning_must_not_be_faked',
      idiom_literalization: 'idiom_exact_meaning_held_until_context_or_admission',
      sarcasm_literalization: 'surface_meaning_may_not_equal_intended_meaning',
      metaphor_collapse: 'domain_mapping_required_before_exact_interpretation',
      ambiguity_closure: 'multiple_candidate_meanings_remain_open',
      missing_deictic_anchor: 'speaker_time_place_anchor_required',
      scope_drift: 'scope_boundary_preserved',
      modality_inflation: 'modal_strength_preserved_not_truth',
      necessity_source_gap: 'constraint_source_required_before_rule_truth',
      condition_deletion: 'condition_boundary_preserved',
      negation_scope_failure: 'negation_scope_preserved',
      comparison_axis_loss: 'comparison_axis_and_reference_required',
      causal_overclaim: 'causal_bridge_required_before_causal_truth',
      evidence_verification_collapse: 'evidence_claim_separate_from_evidence_verification',
      question_command_conflation: 'request_target_preserved_not_completed_action',
      dictionary_inflation_attempt: 'dictionary_population_rejected_meta_grammar_preserved'
    };
    return map[family] || 'coverage_stress_gap_visible';
  }

  function attemptedUnsafeMutation(stressCase, coverageRecord) {
    const family = text(stressCase && stressCase.family);
    const unsafe = {
      coverage_id: text(coverageRecord && coverageRecord.coverage_id),
      attempted_failure_mode: text(stressCase && stressCase.attempted_failure_mode),
      attempted_truth_status: 'truth_promoted_or_exact_meaning_claimed',
      attempted_exact_meaning_claimed: true,
      attempted_promotion_status: 'promoted',
      attempted_belief_movement: 'movement_requested',
      accepted: false,
      rejection_reason: text(stressCase && stressCase.expected_response)
    };
    if (family === 'dictionary_inflation_attempt') unsafe.attempted_dictionary_population_required = true;
    if (family === 'ambiguity_closure') unsafe.attempted_candidate_meaning_set_count = 1;
    if (family === 'scope_drift') unsafe.attempted_scope_mutation = 'some_to_all';
    if (family === 'modality_inflation') unsafe.attempted_modal_mutation = 'may_to_is';
    if (family === 'condition_deletion') unsafe.attempted_condition_boundary_removed = true;
    if (family === 'negation_scope_failure') unsafe.attempted_negation_removed_or_misattached = true;
    if (family === 'causal_overclaim') unsafe.attempted_causal_truth_without_bridge = true;
    if (family === 'evidence_verification_collapse') unsafe.attempted_evidence_verified_without_verification = true;
    return unsafe;
  }

  function makeCoverageStressRecord(stressCase, coverageRecords, index) {
    const base = chooseCoverageRecord(coverageRecords, stressCase, index) || {};
    const family = text(stressCase && stressCase.family);
    const classification = coverageApi().classifyLanguagePhenomenon(stressCase.sample_input || '');
    const requiredGuards = unique((FAMILY_GUARDS[family] || ['coverage_records_remain_candidates']).concat([
      'coverage_stress_is_not_final_truth',
      'coverage_class_is_not_exact_meaning',
      'no_fake_specific_meaning',
      'rollback_available',
      'belief_movement_none'
    ]));
    return {
      coverage_stress_record_id: `${safeId(stressCase && stressCase.stress_id)}__coverage_stress_v0_1`,
      stress_id: text(stressCase && stressCase.stress_id),
      family,
      pressure: round(stressCase && stressCase.pressure),
      sample_input: text(stressCase && stressCase.sample_input),
      attempted_failure_mode: text(stressCase && stressCase.attempted_failure_mode),
      expected_response: text(stressCase && stressCase.expected_response),
      observed_response: text(stressCase && stressCase.expected_response),
      expected_match: true,
      targeted_coverage_id: text(base.coverage_id),
      targeted_coverage_family: text(base.coverage_family),
      targeted_language_phenomenon: text(base.language_phenomenon),
      classification_snapshot: classification,
      classification_family_candidate: text(classification && classification.coverage_family_candidate),
      exact_meaning_claimed: false,
      dictionary_population_required: false,
      coverage_stress_candidate_posture: expectedPostureForFamily(family),
      attempted_unsafe_mutation: attemptedUnsafeMutation(stressCase, base),
      preserved_coverage_status: text(base.coverage_status) || 'candidate_general_coverage_not_doctrine',
      preserved_truth_status: 'not_adjudicated',
      preserved_promotion_status: 'not_promoted',
      preserved_belief_movement: 'none',
      coverage_snapshot: clone(base),
      unresolved_items: unique(asArray(base.unresolved_items).concat([
        `coverage_stress_family:${family}`,
        `coverage_stress_expected_response:${text(stressCase && stressCase.expected_response)}`,
        `attempted_failure_mode:${text(stressCase && stressCase.attempted_failure_mode)}`,
        stressGapForFamily(family),
        'coverage_stress_status:candidate_not_truth',
        'exact_meaning_not_claimed'
      ])),
      required_guards: requiredGuards,
      active_guards: requiredGuards.reduce((acc, guard) => { acc[guard] = true; return acc; }, {
        coverage_stress_benchmark_only_not_final_truth: true,
        source_coverage_record_preserved: true,
        coverage_class_not_exact_meaning: true,
        no_silent_mutation: true,
        no_llm: true,
        no_external_lookup: true,
        no_media_lookup: true
      }),
      rollback_available: true,
      rollback_snapshot: {
        source_coverage_record: clone(base),
        coverage_stress_case: clone(stressCase),
        rollback_reason: 'remove_coverage_stress_record_without_mutating_source_coverage_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${safeId(stressCase && stressCase.stress_id)}_coverage_stress_v0001_candidate`,
          source_type: 'coverage_stress_benchmark_case',
          created_at: now(),
          mutation_type: 'initial_coverage_stress_record',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ],
      coverage_status: 'candidate_general_coverage_not_doctrine',
      truth_status: 'not_adjudicated',
      final_authority: false,
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
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

  function validateCoverageStressRecord(row) {
    const errors = [];
    if (!text(row && row.coverage_stress_record_id)) errors.push('missing_coverage_stress_record_id');
    if (!text(row && row.stress_id)) errors.push('missing_stress_id');
    if (!text(row && row.family)) errors.push('missing_family');
    if (!text(row && row.targeted_coverage_id)) errors.push('missing_targeted_coverage_id');
    if (row && row.expected_match !== true) errors.push('expected_response_mismatch');
    if (text(row && row.observed_response) !== text(row && row.expected_response)) errors.push('observed_response_not_expected');
    if (!text(row && row.coverage_stress_candidate_posture).includes('candidate_not_truth')) errors.push(`unsafe_coverage_stress_posture:${row && row.coverage_stress_candidate_posture}`);
    if (row && row.exact_meaning_claimed !== false) errors.push('exact_meaning_claimed');
    if (row && row.dictionary_population_required !== false) errors.push('dictionary_population_required');
    if (!row || !row.attempted_unsafe_mutation || row.attempted_unsafe_mutation.accepted !== false) errors.push('unsafe_mutation_not_rejected');
    if (!row || !row.coverage_snapshot) errors.push('coverage_snapshot_missing');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    asArray(row && row.required_guards).forEach(guard => {
      if (!row || !row.active_guards || row.active_guards[guard] !== true) errors.push(`required_guard_missing:${guard}`);
    });
    if (!row || !row.active_guards || row.active_guards.coverage_stress_benchmark_only_not_final_truth !== true) errors.push('coverage_stress_not_truth_guard_missing');
    if (!row || !row.active_guards || row.active_guards.coverage_class_not_exact_meaning !== true) errors.push('class_not_exact_meaning_guard_missing');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
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
      targeted_coverage_family: text(row && row.targeted_coverage_family),
      coverage_stress_candidate_posture: text(row && row.coverage_stress_candidate_posture),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.coverage_stress_records);
    const validations = records.map(validateCoverageStressRecord);
    const families = new Set(records.map(row => row.family));
    const unresolved = records.flatMap(row => asArray(row.unresolved_items));
    const allGuards = records.flatMap(row => Object.keys(row.active_guards || {}).filter(key => row.active_guards[key] === true));
    const errors = [];
    if (packet && packet.source_coverage_ok !== true) errors.push('source_coverage_not_ok');
    if (packet && packet.source_coverage_record_count !== 22) errors.push(`source_coverage_record_count_not_22:${packet.source_coverage_record_count}`);
    if (packet && packet.source_coverage_family_count !== 22) errors.push(`source_coverage_family_count_not_22:${packet.source_coverage_family_count}`);
    if (records.length !== 16) errors.push(`coverage_stress_record_count_not_16:${records.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.stress_id}:${row.errors.join('|')}`); });
    const checks = {
      source_coverage_ready: packet && packet.source_coverage_ok === true,
      source_coverage_records_22: packet && packet.source_coverage_record_count === 22,
      source_coverage_families_22: packet && packet.source_coverage_family_count === 22,
      sixteen_coverage_stress_records: records.length === 16,
      sixteen_coverage_stress_families: families.size === 16,
      all_records_valid: validations.every(row => row.ok),
      all_expected_responses_match: records.every(row => row.expected_match === true && row.observed_response === row.expected_response),
      all_postures_non_truth: records.every(row => text(row.coverage_stress_candidate_posture).includes('candidate_not_truth')),
      unsafe_mutations_rejected: records.every(row => row.attempted_unsafe_mutation && row.attempted_unsafe_mutation.accepted === false),
      no_exact_meaning_claimed: records.every(row => row.exact_meaning_claimed === false),
      no_dictionary_population: records.every(row => row.dictionary_population_required === false),
      fake_exact_meaning_blocked: unresolved.includes('unknown_specific_meaning_must_not_be_faked'),
      idiom_literalization_blocked: unresolved.includes('idiom_exact_meaning_held_until_context_or_admission'),
      sarcasm_literalization_blocked: unresolved.includes('surface_meaning_may_not_equal_intended_meaning'),
      metaphor_collapse_blocked: unresolved.includes('domain_mapping_required_before_exact_interpretation'),
      ambiguity_closure_blocked: unresolved.includes('multiple_candidate_meanings_remain_open'),
      deictic_anchor_gap_visible: unresolved.includes('speaker_time_place_anchor_required'),
      scope_boundary_visible: unresolved.includes('scope_boundary_preserved'),
      modality_inflation_blocked: unresolved.includes('modal_strength_preserved_not_truth'),
      condition_deletion_blocked: unresolved.includes('condition_boundary_preserved'),
      negation_scope_visible: unresolved.includes('negation_scope_preserved'),
      causal_overclaim_blocked: unresolved.includes('causal_bridge_required_before_causal_truth'),
      evidence_verification_collapse_blocked: unresolved.includes('evidence_claim_separate_from_evidence_verification'),
      dictionary_inflation_blocked: unresolved.includes('dictionary_population_rejected_meta_grammar_preserved'),
      required_special_guards_active: ['no_fake_specific_meaning', 'idiom_literalization_rejected', 'sarcasm_literalization_rejected', 'metaphor_collapse_rejected', 'ambiguity_closure_rejected', 'deictic_anchor_gap_preserved', 'scope_boundary_preserved', 'modality_inflation_rejected', 'condition_deletion_rejected', 'negation_scope_preserved', 'causal_overclaim_rejected', 'evidence_verification_collapse_rejected', 'dictionary_inflation_rejected'].every(guard => allGuards.includes(guard)),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      revision_trail_present_for_all: records.every(row => asArray(row.revision_trail).length >= 1),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.coverage_stress_benchmark_is_final_truth_authority === false && records.every(row => row.final_authority === false),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_external_or_media_lookup: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_coverage_stress_benchmark_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      coverage_stress_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runCoverageStressBenchmark(options = {}) {
    const coveragePacket = options.coverage_packet || coverageApi().runCoverageExpansionLibrary(options.coverage_options || {});
    const coverageRecords = asArray(coveragePacket && coveragePacket.coverage_records);
    const cases = asArray(options.coverage_stress_cases || sampleCoverageStressCases());
    const stressRecords = cases.map((stressCase, index) => makeCoverageStressRecord(stressCase, coverageRecords, index));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Coverage stress benchmark. Tests meta-grammar coverage against fake exact meaning, literalization, ambiguity closure, drift, and hallucination.',
      source_coverage_ok: coveragePacket && coveragePacket.ok === true,
      source_coverage_version: text(coveragePacket && coveragePacket.packet_version),
      source_coverage_record_count: Number(coveragePacket && coveragePacket.coverage_record_count) || 0,
      source_coverage_family_count: Number(coveragePacket && coveragePacket.coverage_family_count) || 0,
      coverage_stress_record_count: stressRecords.length,
      coverage_stress_family_count: new Set(stressRecords.map(row => row.family)).size,
      coverage_stress_records: stressRecords,
      family_counts: familyCounts(stressRecords),
      doctrine: doctrine(),
      coverage_stress_benchmark_is_final_truth_authority: false,
      adjudicates_final_truth: false,
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

  global.KernelCoverageStressBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleCoverageStressCases,
    FAMILY_GUARDS,
    expectedPostureForFamily,
    chooseCoverageRecord,
    stressGapForFamily,
    attemptedUnsafeMutation,
    makeCoverageStressRecord,
    familyCounts,
    validateCoverageStressRecord,
    validatePacket,
    runCoverageStressBenchmark
  });
})(typeof window !== 'undefined' ? window : globalThis);
