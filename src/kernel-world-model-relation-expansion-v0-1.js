/* 42ndMind World-Model Relation Expansion v0.1
 * Builds candidate relation records between claims, packets, sources, media, narrative pressure,
 * adversarial pressure, uncertainty, and preledger stress records.
 * This is relation-only. No final truth promotion, no lookup, no LLM, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_world_model_relation_expansion_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function stressApi() {
    if (!global.KernelTruthLedgerPreledgerStressBenchmarkV01) throw new Error('KernelTruthLedgerPreledgerStressBenchmarkV01 unavailable');
    return global.KernelTruthLedgerPreledgerStressBenchmarkV01;
  }

  function doctrine() {
    return {
      relation_expansion_only_not_final_truth: true,
      world_model_relations_are_candidate_pressure: true,
      relation_strength_is_not_truth: true,
      relation_direction_must_be_explicit: true,
      relation_detection_is_not_relation_resolution: true,
      contradiction_relation_is_not_contradiction_resolution: true,
      support_relation_is_not_truth: true,
      counter_relation_is_not_disproof: true,
      corroboration_relation_is_not_final_truth: true,
      temporal_sequence_is_not_causal_proof: true,
      causal_relation_requires_bridge: true,
      source_relation_is_not_source_lookup: true,
      media_relation_is_not_media_verification: true,
      adversarial_relation_is_pressure_not_truth: true,
      hostile_reframe_is_not_same_claim: true,
      duplicate_provenance_is_not_independent_convergence: true,
      uncertainty_relation_keeps_gap_visible: true,
      rollback_required_for_every_relation_record: true,
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

  const FAMILY_RELATION_SPECS = {
    direct_conflict: [
      { family: 'contradicts', role: 'stress_record_to_linked_preledger_entry', direction: 'source_to_target', strength_offset: 0.06, guards: ['contradiction_relation_is_not_resolution', 'relation_strength_is_not_truth'] },
      { family: 'counters', role: 'opposing_pressure_to_claim_candidate', direction: 'source_to_target', strength_offset: -0.03, guards: ['counter_relation_is_not_disproof', 'truth_pressure_is_not_final_truth'] }
    ],
    duplicate_provenance: [
      { family: 'source_duplicates', role: 'repeated_source_group_to_source_group', direction: 'source_to_target', strength_offset: 0.05, guards: ['duplicate_provenance_is_not_independent_convergence', 'source_relation_is_not_source_lookup'] },
      { family: 'depends_on', role: 'duplicate_record_depends_on_original_source', direction: 'source_to_target', strength_offset: -0.05, guards: ['duplicate_provenance_is_not_independence', 'relation_strength_is_not_truth'] }
    ],
    adversarial_quantifier_injection: [
      { family: 'injects_quantifier', role: 'hostile_reframe_to_scoped_claim', direction: 'source_to_target', strength_offset: 0.05, guards: ['hostile_reframe_is_not_same_claim', 'quantifier_injection_is_not_same_claim'] },
      { family: 'broadens_scope', role: 'injected_universal_scope_to_original_scope', direction: 'source_to_target', strength_offset: 0.02, guards: ['scope_distortion_is_adversarial_pressure', 'relation_detection_is_not_relation_resolution'] }
    ],
    no_good_interpretation_framing: [
      { family: 'contextualizes', role: 'interpretive_pressure_to_claim_context', direction: 'source_to_target', strength_offset: -0.01, guards: ['interpretive_closure_rejected', 'adversarial_relation_is_pressure_not_truth'] },
      { family: 'leaves_unresolved', role: 'interpretation_gap_to_candidate_claim', direction: 'source_to_target', strength_offset: 0.01, guards: ['uncertainty_relation_keeps_gap_visible', 'ambiguity_weaponization_does_not_close_ambiguity'] },
      { family: 'narrows_scope', role: 'good_interpretation_preserves_possible_scope', direction: 'source_to_target', strength_offset: -0.02, guards: ['scope_preservation_required', 'relation_detection_is_not_relation_resolution'] }
    ],
    quote_clipping: [
      { family: 'clips_quote', role: 'quote_fragment_to_full_context', direction: 'source_to_target', strength_offset: 0.04, guards: ['context_gap_preserved', 'media_relation_is_not_media_verification'] },
      { family: 'requires_evidence_for', role: 'clipped_quote_requires_context_anchor', direction: 'source_to_target', strength_offset: -0.02, guards: ['source_reference_is_anchor_not_lookup', 'uncertainty_relation_keeps_gap_visible'] }
    ],
    context_stripping: [
      { family: 'strips_context', role: 'stripped_interpretation_to_context_packet', direction: 'source_to_target', strength_offset: 0.05, guards: ['context_gap_preserved', 'user_context_is_not_truth'] },
      { family: 'contextualizes', role: 'context_packet_to_candidate_claim', direction: 'source_to_target', strength_offset: -0.02, guards: ['context_is_context_not_truth', 'relation_strength_is_not_truth'] },
      { family: 'removes_condition', role: 'condition_removed_from_original_claim_context', direction: 'source_to_target', strength_offset: 0.04, guards: ['condition_deletion_is_not_same_claim', 'adversarial_relation_is_pressure_not_truth'] }
    ],
    media_metadata_missing: [
      { family: 'media_describes', role: 'media_description_to_claim_candidate', direction: 'source_to_target', strength_offset: -0.04, guards: ['media_description_is_not_media_verification', 'source_reference_is_not_source_lookup'] },
      { family: 'media_unverified_for', role: 'missing_metadata_to_media_claim', direction: 'source_to_target', strength_offset: 0.05, guards: ['media_uncertainty_blocks_media_verification', 'uncertainty_relation_keeps_gap_visible'] }
    ],
    edited_media_risk: [
      { family: 'media_unverified_for', role: 'edit_risk_to_media_claim', direction: 'source_to_target', strength_offset: 0.06, guards: ['media_uncertainty_blocks_media_verification', 'evidence_claims_are_not_evidence_verification'] },
      { family: 'requires_evidence_for', role: 'edit_risk_requires_original_media_anchor', direction: 'source_to_target', strength_offset: -0.01, guards: ['media_relation_is_not_media_verification', 'relation_strength_is_not_truth'] }
    ],
    high_user_confidence: [
      { family: 'requires_evidence_for', role: 'confidence_claim_requires_external_anchor', direction: 'source_to_target', strength_offset: -0.03, guards: ['user_confidence_is_not_evidence', 'user_context_is_not_truth'] },
      { family: 'leaves_unresolved', role: 'confidence_gap_to_candidate_claim', direction: 'source_to_target', strength_offset: 0.02, guards: ['uncertainty_relation_keeps_gap_visible', 'truth_pressure_is_not_final_truth'] }
    ],
    anonymous_claim_stack: [
      { family: 'source_reports', role: 'anonymous_source_stack_reports_candidate', direction: 'source_to_target', strength_offset: -0.04, guards: ['low_trust_source_posture_preserved', 'source_relation_is_not_source_lookup'] },
      { family: 'source_duplicates', role: 'anonymous_repetition_to_source_group', direction: 'source_to_target', strength_offset: 0.02, guards: ['duplicate_provenance_is_not_independent_convergence', 'source_laundering_is_not_convergence'] },
      { family: 'launders_source', role: 'anonymous_stack_presents_repetition_as_independence', direction: 'source_to_target', strength_offset: 0.04, guards: ['source_laundering_is_not_independent_convergence', 'source_relation_is_not_source_lookup'] }
    ],
    causal_bridge_gap: [
      { family: 'temporally_precedes', role: 'sequence_event_to_later_event', direction: 'source_to_target', strength_offset: 0.0, guards: ['temporal_sequence_is_not_causal_proof', 'relation_strength_is_not_truth'] },
      { family: 'causes_or_contributes_to', role: 'candidate_cause_to_candidate_effect', direction: 'source_to_target', strength_offset: -0.08, guards: ['causal_relation_requires_bridge', 'truth_pressure_is_not_final_truth'] },
      { family: 'temporally_follows', role: 'later_event_to_sequence_event', direction: 'target_to_source', strength_offset: 0.0, guards: ['relation_direction_must_be_explicit', 'temporal_sequence_is_not_causal_proof'] }
    ],
    motive_stuffing: [
      { family: 'stuffs_motive', role: 'motive_reframe_to_event_sequence', direction: 'source_to_target', strength_offset: 0.06, guards: ['motive_evidence_required_before_motive_truth', 'adversarial_relation_is_pressure_not_truth'] },
      { family: 'requires_evidence_for', role: 'motive_claim_requires_motive_evidence', direction: 'source_to_target', strength_offset: -0.03, guards: ['motive_stuffing_is_not_motive_proof', 'relation_strength_is_not_truth'] }
    ],
    counterevidence_pressure: [
      { family: 'counters', role: 'counterevidence_pressure_to_candidate_claim', direction: 'source_to_target', strength_offset: 0.04, guards: ['counterevidence_is_not_disproof_by_itself', 'truth_pressure_is_not_final_truth'] },
      { family: 'leaves_unresolved', role: 'counterpressure_gap_to_preledger_entry', direction: 'source_to_target', strength_offset: 0.01, guards: ['contradiction_detection_is_not_resolution', 'uncertainty_relation_keeps_gap_visible'] }
    ],
    independent_corroboration: [
      { family: 'supports', role: 'corroborating_record_to_candidate_claim', direction: 'source_to_target', strength_offset: 0.05, guards: ['support_relation_is_not_truth', 'corroboration_relation_is_not_final_truth'] },
      { family: 'source_independent_of', role: 'source_group_to_other_source_group_candidate', direction: 'source_to_target', strength_offset: 0.04, guards: ['source_independence_is_candidate_not_truth', 'corroboration_pressure_is_not_final_truth'] }
    ],
    ambiguity_weaponization: [
      { family: 'weaponizes_ambiguity', role: 'adversarial_ambiguity_reframe_to_original_claim', direction: 'source_to_target', strength_offset: 0.06, guards: ['ambiguity_weaponization_does_not_close_ambiguity', 'adversarial_relation_is_pressure_not_truth'] },
      { family: 'leaves_unresolved', role: 'ambiguity_gap_to_candidate_claim', direction: 'source_to_target', strength_offset: 0.01, guards: ['uncertainty_relation_keeps_gap_visible', 'interpretive_closure_rejected'] }
    ],
    mixed_pressure_stack: [
      { family: 'supports', role: 'support_pressure_component_to_candidate_claim', direction: 'source_to_target', strength_offset: 0.02, guards: ['support_relation_is_not_truth', 'all_pressure_components_remain_separate'] },
      { family: 'counters', role: 'counter_pressure_component_to_candidate_claim', direction: 'source_to_target', strength_offset: 0.02, guards: ['counter_relation_is_not_disproof', 'all_pressure_components_remain_separate'] },
      { family: 'leaves_unresolved', role: 'mixed_pressure_stack_to_preledger_entry', direction: 'source_to_target', strength_offset: 0.02, guards: ['preledger_is_not_final_ledger', 'uncertainty_relation_keeps_gap_visible'] }
    ]
  };

  function relationSpecsForStressRecord(stressRecord) {
    return asArray(FAMILY_RELATION_SPECS[text(stressRecord && stressRecord.family)]);
  }

  function nodeIdFor(stressRecord, spec, side) {
    const stressId = safeId(stressRecord && stressRecord.stress_id);
    const linked = safeId((stressRecord && stressRecord.linked_preledger_entry_id) || 'linked_preledger_entry');
    const material = safeId((stressRecord && stressRecord.linked_material_id) || 'linked_material');
    if (side === 'source') return `${stressId}__${safeId(spec.role)}__source`;
    if (spec.family.indexOf('source_') === 0) return `${linked}__source_group_or_record`;
    if (spec.family.indexOf('media_') === 0 || spec.family === 'clips_quote') return `${material}__media_or_quote_context`;
    return `${linked}__candidate_claim_or_preledger_entry`;
  }

  function relationGroupForFamily(family) {
    if (family === 'causes_or_contributes_to') return 'causal';
    if (family === 'temporally_precedes' || family === 'temporally_follows') return 'temporal';
    if (family === 'supports' || family === 'counters' || family === 'requires_evidence_for') return 'evidential';
    if (family === 'contradicts') return 'contradiction';
    if (family.indexOf('source_') === 0 || family === 'launders_source') return 'source';
    if (family.indexOf('media_') === 0) return 'media';
    if (family === 'contextualizes' || family === 'narrows_scope' || family === 'broadens_scope') return 'narrative';
    if (family === 'injects_quantifier' || family === 'removes_condition' || family === 'clips_quote' || family === 'strips_context' || family === 'stuffs_motive' || family === 'weaponizes_ambiguity') return 'adversarial';
    if (family === 'leaves_unresolved' || family === 'depends_on') return 'uncertainty';
    return 'relation';
  }

  function relationUnresolvedItems(stressRecord, spec) {
    const items = asArray(stressRecord && stressRecord.unresolved_items).slice();
    items.push(`relation_family:${text(spec.family)}`);
    items.push(`relation_role:${text(spec.role)}`);
    items.push('relation_status:candidate_not_truth');
    if (spec.family === 'causes_or_contributes_to') items.push('causal_bridge_required_before_causal_truth');
    if (spec.family === 'contradicts') items.push('contradiction_relation_detected_not_resolved');
    if (spec.family === 'supports') items.push('support_relation_not_truth');
    if (spec.family === 'counters') items.push('counter_relation_not_disproof');
    if (spec.family.indexOf('source_') === 0) items.push('source_relation_not_lookup');
    if (spec.family.indexOf('media_') === 0) items.push('media_relation_not_verification');
    if (relationGroupForFamily(spec.family) === 'adversarial') items.push('adversarial_relation_pressure_not_truth');
    if (spec.family === 'leaves_unresolved') items.push('relation_leaves_gap_open');
    return unique(items);
  }

  function pressureComponents(stressRecord, spec) {
    const group = relationGroupForFamily(spec.family);
    return {
      source_stress_pressure: round(stressRecord && stressRecord.pressure),
      relation_strength_candidate: round(Math.max(0, Math.min(1, Number(stressRecord && stressRecord.pressure || 0) + Number(spec.strength_offset || 0)))),
      relation_group: group,
      support_pressure: group === 'evidential' && spec.family === 'supports' ? round(stressRecord && stressRecord.pressure) : 0,
      counter_pressure: group === 'evidential' && spec.family === 'counters' ? round(stressRecord && stressRecord.pressure) : 0,
      contradiction_pressure: group === 'contradiction' ? round(stressRecord && stressRecord.pressure) : 0,
      narrative_pressure: group === 'narrative' ? round(stressRecord && stressRecord.pressure) : 0,
      adversarial_pressure: group === 'adversarial' ? round(stressRecord && stressRecord.pressure) : 0,
      uncertainty_pressure: group === 'uncertainty' || spec.family.indexOf('unverified') >= 0 || spec.family === 'requires_evidence_for' ? round(stressRecord && stressRecord.pressure) : 0
    };
  }

  function makeRelationRecord(stressRecord, spec, index) {
    const sourceNodeId = nodeIdFor(stressRecord, spec, 'source');
    const targetNodeId = nodeIdFor(stressRecord, spec, 'target');
    const pressure = pressureComponents(stressRecord, spec);
    const requiredGuards = unique(asArray(spec.guards).concat([
      'relation_expansion_is_not_final_truth',
      'relation_strength_is_candidate_pressure',
      'belief_movement_none',
      'rollback_available'
    ]));
    return {
      relation_id: `${safeId(stressRecord && stressRecord.stress_id)}__${safeId(spec.family)}__${safeId(spec.role)}__rel_${String(index + 1).padStart(2, '0')}`,
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId,
      relation_family: text(spec.family),
      relation_group: relationGroupForFamily(spec.family),
      relation_role: text(spec.role),
      relation_direction: text(spec.direction || 'source_to_target'),
      relation_strength_candidate: pressure.relation_strength_candidate,
      relation_status: 'candidate_not_truth',
      source_packet_snapshot: {
        stress_record_id: text(stressRecord && stressRecord.stress_record_id),
        stress_id: text(stressRecord && stressRecord.stress_id),
        family: text(stressRecord && stressRecord.family),
        stress_candidate_posture: text(stressRecord && stressRecord.stress_candidate_posture),
        pressure: round(stressRecord && stressRecord.pressure),
        source_candidate_truth_posture: text(stressRecord && stressRecord.source_candidate_truth_posture),
        source_node_id: sourceNodeId
      },
      target_packet_snapshot: {
        linked_preledger_entry_id: text(stressRecord && stressRecord.linked_preledger_entry_id),
        linked_material_id: text(stressRecord && stressRecord.linked_material_id),
        target_node_id: targetNodeId,
        target_truth_status: 'not_adjudicated',
        target_ledger_status: 'candidate_preledger_or_stress_record_not_truth'
      },
      pressure_components: pressure,
      unresolved_items: relationUnresolvedItems(stressRecord, spec),
      active_guards: requiredGuards.reduce((acc, guard) => { acc[guard] = true; return acc; }, {
        relation_expansion_only_not_final_truth: true,
        relation_direction_explicit: true,
        no_direction_reversal_without_recorded_revision: true,
        no_silent_mutation: true,
        no_llm: true,
        no_external_lookup: true,
        no_media_lookup: true
      }),
      rollback_available: true,
      rollback_snapshot: {
        source_stress_record: clone(stressRecord),
        relation_spec: clone(spec),
        rollback_reason: 'remove_candidate_relation_without_mutating_source_packets_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${safeId(stressRecord && stressRecord.stress_id)}_${safeId(spec.family)}_relation_v0001_candidate`,
          source_type: 'world_model_relation_expansion_candidate',
          created_at: now(),
          mutation_type: 'initial_relation_record',
          previous_relation_id: null,
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ],
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

  function makeRelationRecords(stressRecords) {
    const records = [];
    asArray(stressRecords).forEach((stressRecord) => {
      relationSpecsForStressRecord(stressRecord).forEach((spec) => {
        records.push(makeRelationRecord(stressRecord, spec, records.length));
      });
    });
    return records;
  }

  function relationFamilyCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.relation_family] = (acc[row.relation_family] || 0) + 1;
      return acc;
    }, {});
  }

  function relationGroupCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.relation_group] = (acc[row.relation_group] || 0) + 1;
      return acc;
    }, {});
  }

  function validateRelationRecord(row) {
    const errors = [];
    if (!text(row && row.relation_id)) errors.push('missing_relation_id');
    if (!text(row && row.source_node_id)) errors.push('missing_source_node_id');
    if (!text(row && row.target_node_id)) errors.push('missing_target_node_id');
    if (!text(row && row.relation_family)) errors.push('missing_relation_family');
    if (!text(row && row.relation_direction)) errors.push('missing_relation_direction');
    if (text(row && row.source_node_id) === text(row && row.target_node_id)) errors.push('source_target_same_without_explicit_self_relation');
    if (Number(row && row.relation_strength_candidate) < 0 || Number(row && row.relation_strength_candidate) > 1) errors.push('relation_strength_candidate_out_of_range');
    if (row && row.relation_status !== 'candidate_not_truth') errors.push('relation_status_not_candidate');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.contradiction_resolution !== 'not_resolved') errors.push('contradiction_resolved');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    asArray(row && row.unresolved_items).forEach(item => { if (item === 'truth_promoted') errors.push('unsafe_unresolved_item_truth_promoted'); });
    if (!row || !row.active_guards || row.active_guards.relation_expansion_only_not_final_truth !== true) errors.push('relation_not_truth_guard_missing');
    if (!row || !row.active_guards || row.active_guards.relation_direction_explicit !== true) errors.push('direction_guard_missing');
    if (!row || !row.active_guards || row.active_guards.no_silent_mutation !== true) errors.push('silent_mutation_guard_missing');
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
      relation_id: text(row && row.relation_id),
      ok: errors.length === 0,
      errors,
      relation_family: text(row && row.relation_family),
      relation_group: text(row && row.relation_group),
      relation_direction: text(row && row.relation_direction),
      relation_strength_candidate: round(row && row.relation_strength_candidate),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.relation_records);
    const validations = records.map(validateRelationRecord);
    const families = new Set(records.map(row => row.relation_family));
    const groups = new Set(records.map(row => row.relation_group));
    const unresolved = records.flatMap(row => asArray(row.unresolved_items));
    const errors = [];
    if (packet && packet.source_stress_ok !== true) errors.push('source_stress_not_ok');
    if (packet && packet.source_stress_record_count !== 16) errors.push(`source_stress_record_count_not_16:${packet.source_stress_record_count}`);
    if (records.length < 24) errors.push(`relation_record_count_below_24:${records.length}`);
    if (families.size < 12) errors.push(`relation_family_count_below_12:${families.size}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.relation_id}:${row.errors.join('|')}`); });
    const checks = {
      source_stress_ok: packet && packet.source_stress_ok === true,
      source_stress_records_16: packet && packet.source_stress_record_count === 16,
      relation_records_at_least_24: records.length >= 24,
      relation_families_at_least_12: families.size >= 12,
      relation_groups_cover_core_world_model: ['causal', 'temporal', 'evidential', 'contradiction', 'source', 'media', 'narrative', 'adversarial', 'uncertainty'].every(group => groups.has(group)),
      required_relation_families_present: ['causes_or_contributes_to', 'temporally_precedes', 'temporally_follows', 'supports', 'counters', 'contradicts', 'depends_on', 'requires_evidence_for', 'source_reports', 'source_duplicates', 'source_independent_of', 'media_describes', 'media_unverified_for', 'contextualizes', 'narrows_scope', 'broadens_scope', 'injects_quantifier', 'removes_condition', 'clips_quote', 'strips_context', 'stuffs_motive', 'launders_source', 'weaponizes_ambiguity', 'leaves_unresolved'].every(family => families.has(family)),
      direction_explicit_for_all: records.every(row => ['source_to_target', 'target_to_source', 'bidirectional_candidate'].includes(row.relation_direction)),
      no_silent_direction_reversal: records.every(row => row.active_guards && row.active_guards.no_direction_reversal_without_recorded_revision === true),
      strength_candidate_not_truth: records.every(row => row.relation_status === 'candidate_not_truth' && row.pressure_components && row.pressure_components.relation_strength_candidate === row.relation_strength_candidate),
      unresolved_items_visible_for_all: records.every(row => asArray(row.unresolved_items).length >= 1),
      guards_visible_for_all: records.every(row => row.active_guards && row.active_guards.relation_expansion_only_not_final_truth === true && row.active_guards.relation_direction_explicit === true),
      adversarial_pressure_not_truth_visible: unresolved.includes('adversarial_relation_pressure_not_truth'),
      causal_bridge_gap_visible: unresolved.includes('causal_bridge_required_before_causal_truth'),
      media_verification_gap_visible: unresolved.includes('media_relation_not_verification'),
      source_lookup_gap_visible: unresolved.includes('source_relation_not_lookup'),
      contradiction_not_resolved_visible: unresolved.includes('contradiction_relation_detected_not_resolved'),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      revision_trail_present_for_all: records.every(row => asArray(row.revision_trail).length >= 1),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.world_model_relation_expansion_is_final_truth_authority === false && records.every(row => row.final_authority === false),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_external_or_media_lookup: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_world_model_relation_expansion_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      relation_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runWorldModelRelationExpansion(options = {}) {
    const stressPacket = options.stress_packet || stressApi().runStressBenchmark(options.stress_options || {});
    const stressRecords = asArray(stressPacket && stressPacket.stress_records);
    const relationRecords = makeRelationRecords(stressRecords);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Candidate world-model relation expansion over preledger stress records. Relations are pressure structure, not final truth.',
      source_stress_ok: stressPacket && stressPacket.ok === true,
      source_stress_version: text(stressPacket && stressPacket.packet_version),
      source_stress_record_count: stressRecords.length,
      relation_record_count: relationRecords.length,
      relation_family_count: new Set(relationRecords.map(row => row.relation_family)).size,
      relation_group_count: new Set(relationRecords.map(row => row.relation_group)).size,
      relation_records: relationRecords,
      relation_family_counts: relationFamilyCounts(relationRecords),
      relation_group_counts: relationGroupCounts(relationRecords),
      doctrine: doctrine(),
      world_model_relation_expansion_is_final_truth_authority: false,
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

  global.KernelWorldModelRelationExpansionV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    FAMILY_RELATION_SPECS,
    relationSpecsForStressRecord,
    relationGroupForFamily,
    relationUnresolvedItems,
    pressureComponents,
    makeRelationRecord,
    makeRelationRecords,
    relationFamilyCounts,
    relationGroupCounts,
    validateRelationRecord,
    validatePacket,
    runWorldModelRelationExpansion
  });
})(typeof window !== 'undefined' ? window : globalThis);
