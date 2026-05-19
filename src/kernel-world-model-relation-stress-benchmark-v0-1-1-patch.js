/* 42ndMind World-Model Relation Stress Benchmark v0.1.1 patch
 * Fixes posture-safety validation so safe negative postures like not_disproof,
 * not_verification, and not_promoted are treated as non-truth outcomes.
 * No doctrine change. No truth promotion. No lookup. No LLM. No belief movement.
 */
(function (global) {
  'use strict';

  const previous = global.KernelWorldModelRelationStressBenchmarkV01;
  if (!previous) throw new Error('KernelWorldModelRelationStressBenchmarkV01 must load before v0.1.1 patch');

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }

  function safeRelationStressPosture(posture) {
    const p = text(posture);
    return p.includes('not_truth') ||
      p.includes('not_resolved') ||
      p.includes('not_disproof') ||
      p.includes('not_verification') ||
      p.includes('not_promoted') ||
      p.includes('candidate_visible') ||
      p.includes('no_belief_movement');
  }

  function validateRelationStressRecord(row) {
    const errors = [];
    if (!text(row && row.relation_stress_record_id)) errors.push('missing_relation_stress_record_id');
    if (!text(row && row.stress_id)) errors.push('missing_stress_id');
    if (!text(row && row.family)) errors.push('missing_family');
    if (!text(row && row.targeted_relation_id)) errors.push('missing_targeted_relation_id');
    if (row && row.expected_match !== true) errors.push('expected_response_mismatch');
    if (text(row && row.observed_response) !== text(row && row.expected_response)) errors.push('observed_response_not_expected');
    if (!safeRelationStressPosture(row && row.relation_stress_candidate_posture)) errors.push(`unsafe_relation_stress_posture:${row && row.relation_stress_candidate_posture}`);
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
      all_postures_non_truth: records.every(row => safeRelationStressPosture(row.relation_stress_candidate_posture)),
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
      packet_type: '42ndMind_world_model_relation_stress_validation_v0_1_1_patch',
      packet_version: previous.VERSION,
      patch_version: '0.1.1',
      created_at: now(),
      ok: errors.length === 0,
      checks,
      relation_stress_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runRelationStressBenchmark(options = {}) {
    const packet = previous.runRelationStressBenchmark(options || {});
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    packet.patch_version = '0.1.1';
    packet.validation_patch_applied = true;
    return packet;
  }

  global.KernelWorldModelRelationStressBenchmarkV01 = Object.freeze(Object.assign({}, previous, {
    PATCH_VERSION: '0.1.1',
    safeRelationStressPosture,
    validateRelationStressRecord,
    validatePacket,
    runRelationStressBenchmark
  }));
})(typeof window !== 'undefined' ? window : globalThis);
