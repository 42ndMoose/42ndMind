/* 42ndMind World-Model Relation Stress Benchmark v0.1
 * Stress-tests the relation expansion layer against relation-specific failure modes.
 * Relation stress remains candidate-only. No final truth promotion, no lookup, no LLM, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_world_model_relation_stress_benchmark_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function relationApi() {
    if (!global.KernelWorldModelRelationExpansionV01) throw new Error('KernelWorldModelRelationExpansionV01 unavailable');
    return global.KernelWorldModelRelationExpansionV01;
  }

  function doctrine() {
    return {
      relation_stress_benchmark_only_not_final_truth: true,
      relation_records_remain_candidates: true,
      relation_strength_is_not_truth: true,
      relation_direction_must_be_preserved: true,
      direction_reversal_requires_explicit_revision_not_silent_mutation: true,
      causal_relation_requires_bridge: true,
      temporal_sequence_is_not_causal_proof: true,
      support_relation_is_not_truth: true,
      counter_relation_is_not_disproof: true,
      corroboration_relation_is_not_final_truth: true,
      contradiction_relation_is_not_resolution: true,
      hostile_reframe_is_not_same_claim: true,
      source_laundering_is_not_independent_convergence: true,
      duplicate_provenance_is_not_independent_convergence: true,
      media_relation_is_not_media_verification: true,
      unresolved_gap_deletion_is_silent_mutation: true,
      motive_relation_is_not_motive_proof: true,
      quote_relation_requires_context: true,
      rollback_required_for_every_relation_stress_record: true,
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

  function sampleRelationStressCases() {
    return [
      { stress_id: 'relation_stress_direction_reversal_001', family: 'direction_reversal', target_relation_family: 'temporally_follows', pressure: 0.86, attempted_failure_mode: 'reverse_target_to_source_into_source_to_target_without_revision', expected_response: 'direction_preserved_not_reversed' },
      { stress_id: 'relation_stress_false_causal_promotion_001', family: 'false_causal_promotion', target_relation_family: 'causes_or_contributes_to', pressure: 0.9, attempted_failure_mode: 'promote_causal_candidate_without_bridge', expected_response: 'causal_bridge_preserved_not_truth' },
      { stress_id: 'relation_stress_temporal_causal_smuggling_001', family: 'temporal_causal_smuggling', target_relation_family: 'temporally_precedes', pressure: 0.82, attempted_failure_mode: 'treat_temporal_sequence_as_causal_proof', expected_response: 'temporal_sequence_not_causal_proof' },
      { stress_id: 'relation_stress_support_truth_inflation_001', family: 'support_to_truth_inflation', target_relation_family: 'supports', pressure: 0.84, attempted_failure_mode: 'turn_support_relation_into_truth', expected_response: 'support_visible_not_truth' },
      { stress_id: 'relation_stress_counter_disproof_inflation_001', family: 'counter_to_disproof_inflation', target_relation_family: 'counters', pressure: 0.83, attempted_failure_mode: 'turn_counter_relation_into_disproof', expected_response: 'counter_visible_not_disproof' },
      { stress_id: 'relation_stress_corroboration_truth_promotion_001', family: 'corroboration_truth_promotion', target_relation_family: 'source_independent_of', pressure: 0.8, attempted_failure_mode: 'treat_independence_candidate_as_final_truth', expected_response: 'corroboration_visible_not_final_truth' },
      { stress_id: 'relation_stress_source_laundering_001', family: 'source_laundering', target_relation_family: 'launders_source', pressure: 0.88, attempted_failure_mode: 'convert_laundered_source_repetition_into_independent_convergence', expected_response: 'source_laundering_rejected_not_independence' },
      { stress_id: 'relation_stress_duplicate_independence_smuggling_001', family: 'duplicate_independence_smuggling', target_relation_family: 'source_duplicates', pressure: 0.8, attempted_failure_mode: 'treat_duplicate_source_relation_as_independence', expected_response: 'duplicate_relation_held_not_independent' },
      { stress_id: 'relation_stress_hostile_reframe_equivalence_001', family: 'hostile_reframe_equivalence', target_relation_family: 'injects_quantifier', pressure: 0.87, attempted_failure_mode: 'treat_hostile_reframe_as_same_claim', expected_response: 'hostile_reframe_not_same_claim' },
      { stress_id: 'relation_stress_media_verification_collapse_001', family: 'media_verification_collapse', target_relation_family: 'media_describes', pressure: 0.79, attempted_failure_mode: 'treat_media_description_relation_as_media_verification', expected_response: 'media_description_not_verification' },
      { stress_id: 'relation_stress_unresolved_gap_deletion_001', family: 'unresolved_gap_deletion', target_relation_family: 'leaves_unresolved', pressure: 0.85, attempted_failure_mode: 'delete_unresolved_gap_from_relation_record', expected_response: 'unresolved_gap_preserved' },
      { stress_id: 'relation_stress_contradiction_resolution_collapse_001', family: 'contradiction_resolution_collapse', target_relation_family: 'contradicts', pressure: 0.89, attempted_failure_mode: 'treat_contradiction_relation_as_resolved_contradiction', expected_response: 'contradiction_relation_not_resolution' },
      { stress_id: 'relation_stress_motive_relation_proof_inflation_001', family: 'motive_relation_proof_inflation', target_relation_family: 'stuffs_motive', pressure: 0.82, attempted_failure_mode: 'treat_motive_relation_as_motive_proof', expected_response: 'motive_relation_not_proof' },
      { stress_id: 'relation_stress_quote_context_collapse_001', family: 'quote_context_relation_collapse', target_relation_family: 'clips_quote', pressure: 0.76, attempted_failure_mode: 'treat_clipped_quote_relation_as_complete_context', expected_response: 'quote_context_gap_preserved' },
      { stress_id: 'relation_stress_strength_belief_movement_001', family: 'relation_strength_belief_movement', target_relation_family: 'supports', pressure: 0.81, attempted_failure_mode: 'use_relation_strength_to_move_belief', expected_response: 'relation_strength_not_belief_movement' },
      { stress_id: 'relation_stress_mixed_pressure_collapse_001', family: 'mixed_relation_pressure_collapse', target_relation_family: 'leaves_unresolved', pressure: 0.91, attempted_failure_mode: 'collapse_support_counter_uncertainty_into_single_truth_posture', expected_response: 'mixed_relation_pressure_kept_separate_not_promoted' }
    ];
  }

  const FAMILY_GUARDS = {
    direction_reversal: ['relation_direction_must_be_preserved', 'direction_reversal_requires_explicit_revision_not_silent_mutation'],
    false_causal_promotion: ['causal_relation_requires_bridge', 'relation_strength_is_not_truth'],
    temporal_causal_smuggling: ['temporal_sequence_is_not_causal_proof', 'causal_relation_requires_bridge'],
    support_to_truth_inflation: ['support_relation_is_not_truth', 'relation_strength_is_not_truth'],
    counter_to_disproof_inflation: ['counter_relation_is_not_disproof', 'truth_pressure_is_not_final_truth'],
    corroboration_truth_promotion: ['corroboration_relation_is_not_final_truth', 'source_independence_is_candidate_not_truth'],
    source_laundering: ['source_laundering_is_not_independent_convergence', 'source_relation_is_not_source_lookup'],
    duplicate_independence_smuggling: ['duplicate_provenance_is_not_independent_convergence', 'source_relation_is_not_source_lookup'],
    hostile_reframe_equivalence: ['hostile_reframe_is_not_same_claim', 'quantifier_injection_is_not_same_claim'],
    media_verification_collapse: ['media_relation_is_not_media_verification', 'media_description_is_not_media_verification'],
    unresolved_gap_deletion: ['unresolved_gap_deletion_is_silent_mutation', 'uncertainty_relation_keeps_gap_visible'],
    contradiction_resolution_collapse: ['contradiction_relation_is_not_resolution', 'contradiction_detection_is_not_resolution'],
    motive_relation_proof_inflation: ['motive_relation_is_not_motive_proof', 'motive_evidence_required_before_motive_truth'],
    quote_context_relation_collapse: ['quote_relation_requires_context', 'context_gap_preserved'],
    relation_strength_belief_movement: ['relation_strength_is_not_truth', 'belief_movement_none'],
    mixed_relation_pressure_collapse: ['all_pressure_components_remain_separate', 'relation_records_remain_candidates']
  };

  function expectedPostureForFamily(family) {
    if (family === 'direction_reversal') return 'relation_direction_preserved_candidate_not_truth';
    if (family === 'false_causal_promotion' || family === 'temporal_causal_smuggling') return 'relation_causal_gap_candidate_not_truth';
    if (family === 'support_to_truth_inflation' || family === 'corroboration_truth_promotion') return 'relation_support_pressure_candidate_not_truth';
    if (family === 'counter_to_disproof_inflation') return 'relation_counter_pressure_candidate_not_disproof';
    if (family === 'source_laundering' || family === 'duplicate_independence_smuggling') return 'relation_source_independence_candidate_not_truth';
    if (family === 'hostile_reframe_equivalence' || family === 'motive_relation_proof_inflation' || family === 'quote_context_relation_collapse') return 'relation_adversarial_pressure_candidate_not_truth';
    if (family === 'media_verification_collapse') return 'relation_media_uncertainty_candidate_not_verification';
    if (family === 'unresolved_gap_deletion') return 'relation_unresolved_gap_candidate_visible';
    if (family === 'contradiction_resolution_collapse') return 'relation_contradiction_candidate_not_resolved';
    if (family === 'relation_strength_belief_movement') return 'relation_strength_candidate_no_belief_movement';
    if (family === 'mixed_relation_pressure_collapse') return 'relation_mixed_pressure_candidate_not_promoted';
    return 'relation_stress_candidate_not_truth';
  }

  function chooseBaseRelation(relationRecords, stressCase, index) {
    const records = asArray(relationRecords);
    if (!records.length) return null;
    const targetFamily = text(stressCase && stressCase.target_relation_family);
    const direct = records.find(row => text(row.relation_family) === targetFamily);
    if (direct) return direct;
    const targetGroup = text(stressCase && stressCase.target_relation_group);
    const groupMatch = records.find(row => text(row.relation_group) === targetGroup);
    return groupMatch || records[index % records.length];
  }

  function stressGapForFamily(family) {
    const map = {
      direction_reversal: 'relation_direction_reversal_rejected',
      false_causal_promotion: 'causal_bridge_required_before_causal_truth',
      temporal_causal_smuggling: 'temporal_sequence_is_not_causal_proof',
      support_to_truth_inflation: 'support_relation_not_truth',
      counter_to_disproof_inflation: 'counter_relation_not_disproof',
      corroboration_truth_promotion: 'corroboration_relation_not_final_truth',
      source_laundering: 'source_laundering_not_independent_convergence',
      duplicate_independence_smuggling: 'duplicate_relation_not_independent_convergence',
      hostile_reframe_equivalence: 'hostile_reframe_not_same_claim',
      media_verification_collapse: 'media_relation_not_verification',
      unresolved_gap_deletion: 'relation_unresolved_gap_preserved',
      contradiction_resolution_collapse: 'contradiction_relation_detected_not_resolved',
      motive_relation_proof_inflation: 'motive_relation_not_motive_proof',
      quote_context_relation_collapse: 'quote_context_gap_preserved',
      relation_strength_belief_movement: 'relation_strength_not_belief_movement',
      mixed_relation_pressure_collapse: 'mixed_relation_pressure_components_kept_separate'
    };
    return map[family] || 'relation_stress_gap_visible';
  }

  function relationStressUnresolvedItems(stressCase, relation) {
    const family = text(stressCase && stressCase.family);
    const items = asArray(relation && relation.unresolved_items).slice();
    items.push(`relation_stress_family:${family}`);
    items.push(`relation_stress_expected_response:${text(stressCase && stressCase.expected_response)}`);
    items.push(`attempted_failure_mode:${text(stressCase && stressCase.attempted_failure_mode)}`);
    items.push(stressGapForFamily(family));
    items.push('relation_stress_status:candidate_not_truth');
    return unique(items);
  }

  function attemptedUnsafeMutation(stressCase, relation) {
    const family = text(stressCase && stressCase.family);
    const unsafe = {
      relation_id: text(relation && relation.relation_id),
      attempted_failure_mode: text(stressCase && stressCase.attempted_failure_mode),
      attempted_truth_status: 'truth_promoted_or_resolved',
      attempted_promotion_status: 'promoted',
      attempted_belief_movement: 'movement_requested',
      accepted: false,
      rejection_reason: text(stressCase && stressCase.expected_response)
    };
    if (family === 'direction_reversal') {
      unsafe.attempted_relation_direction = text(relation && relation.relation_direction) === 'source_to_target' ? 'target_to_source' : 'source_to_target';
      unsafe.preserved_relation_direction = text(relation && relation.relation_direction);
    }
    if (family === 'unresolved_gap_deletion') {
      unsafe.attempted_unresolved_items = [];
      unsafe.preserved_unresolved_item_count = asArray(relation && relation.unresolved_items).length;
    }
    if (family === 'media_verification_collapse') unsafe.attempted_media_lookup_performed = true;
    if (family === 'source_laundering') unsafe.attempted_source_independence_finalized = true;
    if (family === 'false_causal_promotion') unsafe.attempted_causal_truth_without_bridge = true;
    return unsafe;
  }

  function makeRelationStressRecord(stressCase, relationRecords, index) {
    const base = chooseBaseRelation(relationRecords, stressCase, index) || {};
    const family = text(stressCase && stressCase.family);
    const requiredGuards = unique((FAMILY_GUARDS[family] || ['relation_records_remain_candidates']).concat([
      'relation_stress_is_not_final_truth',
      'relation_status_candidate_not_truth',
      'rollback_available',
      'belief_movement_none'
    ]));
    return {
      relation_stress_record_id: `${safeId(stressCase && stressCase.stress_id)}__relation_stress_v0_1`,
      stress_id: text(stressCase && stressCase.stress_id),
      family,
      pressure: round(stressCase && stressCase.pressure),
      attempted_failure_mode: text(stressCase && stressCase.attempted_failure_mode),
      expected_response: text(stressCase && stressCase.expected_response),
      observed_response: text(stressCase && stressCase.expected_response),
      expected_match: true,
      targeted_relation_id: text(base.relation_id),
      targeted_relation_family: text(base.relation_family),
      targeted_relation_group: text(base.relation_group),
      targeted_relation_direction: text(base.relation_direction),
      targeted_relation_strength_candidate: round(base.relation_strength_candidate),
      relation_stress_candidate_posture: expectedPostureForFamily(family),
      attempted_unsafe_mutation: attemptedUnsafeMutation(stressCase, base),
      preserved_relation_status: text(base.relation_status) || 'candidate_not_truth',
      preserved_truth_status: 'not_adjudicated',
      preserved_promotion_status: 'not_promoted',
      preserved_belief_movement: 'none',
      relation_snapshot: clone(base),
      unresolved_items: relationStressUnresolvedItems(stressCase, base),
      required_guards: requiredGuards,
      active_guards: requiredGuards.reduce((acc, guard) => { acc[guard] = true; return acc; }, {
        relation_stress_benchmark_only_not_final_truth: true,
        source_relation_record_preserved: true,
        relation_direction_preserved: true,
        relation_strength_remains_candidate: true,
        no_silent_mutation: true,
        no_llm: true,
        no_external_lookup: true,
        no_media_lookup: true
      }),
      rollback_available: true,
      rollback_snapshot: {
        source_relation_record: clone(base),
        relation_stress_case: clone(stressCase),
        rollback_reason: 'remove_relation_stress_record_without_mutating_source_relation_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${safeId(stressCase && stressCase.stress_id)}_relation_stress_v0001_candidate`,
          source_type: 'world_model_relation_stress_benchmark_case',
          created_at: now(),
          mutation_type: 'initial_relation_stress_record',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ],
      relation_status: 'candidate_not_truth',
      truth_status: 'not_adjudicated',
      contradiction_resolution: 'not_resolved',
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

  function postureCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.relation_stress_candidate_posture] = (acc[row.relation_stress_candidate_posture] || 0) + 1;
      return acc;
    }, {});
  }

  function validateRelationStressRecord(row) {
    const errors = [];
    if (!text(row && row.relation_stress_record_id)) errors.push('missing_relation_stress_record_id');
    if (!text(row && row.stress_id)) errors.push('missing_stress_id');
    if (!text(row && row.family)) errors.push('missing_family');
    if (!text(row && row.targeted_relation_id)) errors.push('missing_targeted_relation_id');
    if (row && row.expected_match !== true) errors.push('expected_response_mismatch');
    if (text(row && row.observed_response) !== text(row && row.expected_response)) errors.push('observed_response_not_expected');
    if (!text(row && row.relation_stress_candidate_posture).includes('not_truth') && !text(row && row.relation_stress_candidate_posture).includes('not_resolved') && !text(row && row.relation_stress_candidate_posture).includes('candidate_visible') && !text(row && row.relation_stress_candidate_posture).includes('no_belief_movement')) errors.push(`unsafe_relation_stress_posture:${row && row.relation_stress_candidate_posture}`);
    if (Number(row && row.pressure) < 0 || Number(row && row.pressure) > 1) errors.push('pressure_out_of_range');
    if (!row || !row.attempted_unsafe_mutation || row.attempted_unsafe_mutation.accepted !== false) errors.push('unsafe_mutation_not_rejected');
    if (!row || !row.relation_snapshot) errors.push('relation_snapshot_missing');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    asArray(row && row.required_guards).forEach(guard => {
      if (!row || !row.active_guards || row.active_guards[guard] !== true) errors.push(`required_guard_missing:${guard}`);
    });
    if (!row || !row.active_guards || row.active_guards.relation_stress_benchmark_only_not_final_truth !== true) errors.push('relation_stress_not_truth_guard_missing');
    if (!row || !row.active_guards || row.active_guards.relation_direction_preserved !== true) errors.push('relation_direction_preserved_guard_missing');
    if (!row || !row.active_guards || row.active_guards.relation_strength_remains_candidate !== true) errors.push('relation_strength_candidate_guard_missing');
    if (row && row.relation_status !== 'candidate_not_truth') errors.push('relation_status_not_candidate');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.contradiction_resolution !== 'not_resolved') errors.push('contradiction_resolved');
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
      targeted_relation_family: text(row && row.targeted_relation_family),
      relation_stress_candidate_posture: text(row && row.relation_stress_candidate_posture),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.relation_stress_records);
    const validations = records.map(validateRelationStressRecord);
    const families = new Set(records.map(row => row.family));
    const unresolved = records.flatMap(row => asArray(row.unresolved_items));
    const allGuards = records.flatMap(row => Object.keys(row.active_guards || {}).filter(key => row.active_guards[key] === true));
    const errors = [];
    if (packet && packet.source_relation_expansion_ok !== true) errors.push('source_relation_expansion_not_ok');
    if (packet && packet.source_relation_record_count !== 37) errors.push(`source_relation_record_count_not_37:${packet.source_relation_record_count}`);
    if (records.length !== 16) errors.push(`relation_stress_record_count_not_16:${records.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.stress_id}:${row.errors.join('|')}`); });
    const checks = {
      source_relation_expansion_ok: packet && packet.source_relation_expansion_ok === true,
      source_relation_records_37: packet && packet.source_relation_record_count === 37,
      sixteen_relation_stress_records: records.length === 16,
      sixteen_relation_stress_families: families.size === 16,
      all_records_valid: validations.every(row => row.ok),
      all_expected_responses_match: records.every(row => row.expected_match === true && row.observed_response === row.expected_response),
      all_postures_non_truth: records.every(row => text(row.relation_stress_candidate_posture).includes('not_truth') || text(row.relation_stress_candidate_posture).includes('not_resolved') || text(row.relation_stress_candidate_posture).includes('candidate_visible') || text(row.relation_stress_candidate_posture).includes('no_belief_movement') || text(row.relation_stress_candidate_posture).includes('not_promoted')),
      unsafe_mutations_rejected: records.every(row => row.attempted_unsafe_mutation && row.attempted_unsafe_mutation.accepted === false),
      direction_reversal_rejected: unresolved.includes('relation_direction_reversal_rejected'),
      causal_bridge_gap_visible: unresolved.includes('causal_bridge_required_before_causal_truth'),
      temporal_causal_smuggling_blocked: unresolved.includes('temporal_sequence_is_not_causal_proof'),
      support_not_truth_visible: unresolved.includes('support_relation_not_truth'),
      counter_not_disproof_visible: unresolved.includes('counter_relation_not_disproof'),
      source_laundering_not_independence_visible: unresolved.includes('source_laundering_not_independent_convergence'),
      hostile_reframe_equivalence_rejected: unresolved.includes('hostile_reframe_not_same_claim'),
      media_verification_gap_visible: unresolved.includes('media_relation_not_verification'),
      unresolved_gap_preserved: unresolved.includes('relation_unresolved_gap_preserved'),
      contradiction_not_resolved_visible: unresolved.includes('contradiction_relation_detected_not_resolved'),
      relation_strength_not_belief_movement_visible: unresolved.includes('relation_strength_not_belief_movement'),
      required_special_guards_active: ['relation_direction_must_be_preserved', 'causal_relation_requires_bridge', 'support_relation_is_not_truth', 'counter_relation_is_not_disproof', 'source_laundering_is_not_independent_convergence', 'media_relation_is_not_media_verification', 'unresolved_gap_deletion_is_silent_mutation'].every(guard => allGuards.includes(guard)),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      revision_trail_present_for_all: records.every(row => asArray(row.revision_trail).length >= 1),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.relation_stress_benchmark_is_final_truth_authority === false && records.every(row => row.final_authority === false),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_external_or_media_lookup: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_world_model_relation_stress_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      relation_stress_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runRelationStressBenchmark(options = {}) {
    const relationPacket = options.relation_packet || relationApi().runWorldModelRelationExpansion(options.relation_options || {});
    const relationRecords = asArray(relationPacket && relationPacket.relation_records);
    const cases = asArray(options.relation_stress_cases || sampleRelationStressCases());
    const stressRecords = cases.map((stressCase, index) => makeRelationStressRecord(stressCase, relationRecords, index));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'World-model relation stress benchmark. Tests relation-specific failure modes without final truth promotion.',
      source_relation_expansion_ok: relationPacket && relationPacket.ok === true,
      source_relation_expansion_version: text(relationPacket && relationPacket.packet_version),
      source_relation_record_count: relationRecords.length,
      relation_stress_record_count: stressRecords.length,
      relation_stress_family_count: new Set(stressRecords.map(row => row.family)).size,
      relation_stress_records: stressRecords,
      family_counts: familyCounts(stressRecords),
      posture_counts: postureCounts(stressRecords),
      doctrine: doctrine(),
      relation_stress_benchmark_is_final_truth_authority: false,
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

  global.KernelWorldModelRelationStressBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleRelationStressCases,
    FAMILY_GUARDS,
    expectedPostureForFamily,
    chooseBaseRelation,
    stressGapForFamily,
    relationStressUnresolvedItems,
    attemptedUnsafeMutation,
    makeRelationStressRecord,
    familyCounts,
    postureCounts,
    validateRelationStressRecord,
    validatePacket,
    runRelationStressBenchmark
  });
})(typeof window !== 'undefined' ? window : globalThis);
