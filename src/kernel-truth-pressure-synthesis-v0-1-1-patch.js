/* 42ndMind Truth-Pressure Synthesis v0.1.1 Patch
 * Fixes priority ordering so narrative/motive overclaim remains visible even when propaganda pressure is also high.
 * Also preserves motive-evidence gap notes when an upstream narrative-overclaim status was produced under a causal claim kind.
 */
(function (global) {
  'use strict';

  if (!global.KernelTruthPressureSynthesisV01) throw new Error('KernelTruthPressureSynthesisV01 unavailable for v0.1.1 patch');

  const base = global.KernelTruthPressureSynthesisV01;
  const VERSION = '0.1.1';

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function doctrine() {
    return Object.assign({}, base.doctrine(), {
      narrative_overclaim_has_priority_over_general_propaganda_threshold: true,
      upstream_narrative_overclaim_status_preserves_motive_gap_even_when_claim_kind_is_causal: true,
      patch_version: VERSION,
      belief_movement: 'none'
    });
  }

  function patchedStatus(record) {
    const source = text(record && record.source_truth_status_candidate);
    const components = record && record.pressure_components || {};
    if (source === 'narrative_overclaim_pressure_candidate') return 'narrative_overclaim_pressure_visible_candidate';
    if (source === 'causal_overclaim_pressure_candidate') return 'causal_overclaim_pressure_visible_candidate';
    if (components.contradiction_present && Number(components.counter_pressure || 0) >= 0.5) return 'contradiction_pressure_visible_candidate';
    if (Number(components.propaganda_pressure || 0) >= 0.72) return 'propaganda_pressure_visible_candidate';
    return record.synthesis_status_candidate;
  }

  function patchRecord(record) {
    const next = clone(record);
    next.synthesis_status_candidate = patchedStatus(next);
    next.unresolved_gap_notes = asArray(next.unresolved_gap_notes).slice();
    if (next.source_truth_status_candidate === 'narrative_overclaim_pressure_candidate' && !next.unresolved_gap_notes.includes('motive_evidence_required_before_motive_truth')) {
      next.unresolved_gap_notes.push('motive_evidence_required_before_motive_truth');
    }
    next.patch_version = VERSION;
    next.validation = validateSynthesisRecord(next);
    next.ok = next.validation.ok === true;
    return next;
  }

  function aggregateSynthesis(records, evidencePacket) {
    const rows = asArray(records);
    const statuses = rows.map(row => row.synthesis_status_candidate);
    const maxOf = key => round(Math.max.apply(null, rows.map(row => Number(row.pressure_components && row.pressure_components[key] || 0)).concat([0])));
    return {
      synthesis_record_count: rows.length,
      external_claim_evidence_summary_count: asArray(evidencePacket && evidencePacket.claim_evidence_summaries).length,
      status_counts: statuses.reduce((acc, status) => { acc[status] = (acc[status] || 0) + 1; return acc; }, {}),
      max_support_pressure: maxOf('support_pressure'),
      max_counter_pressure: maxOf('counter_pressure'),
      max_contradiction_pressure: maxOf('contradiction_pressure'),
      max_narrative_pressure: maxOf('narrative_pressure'),
      max_propaganda_pressure: maxOf('propaganda_pressure'),
      max_unresolved_gap_pressure: maxOf('unresolved_gap_pressure'),
      contradiction_visible: statuses.includes('contradiction_pressure_visible_candidate'),
      narrative_overclaim_visible: statuses.includes('narrative_overclaim_pressure_visible_candidate'),
      propaganda_pressure_visible: statuses.includes('propaganda_pressure_visible_candidate'),
      causal_overclaim_visible: statuses.includes('causal_overclaim_pressure_visible_candidate'),
      ambiguity_visible: statuses.includes('ambiguous_unresolved_pressure_candidate'),
      unsupported_unresolved_visible: statuses.includes('unsupported_unresolved_pressure_candidate'),
      evidence_support_visible: statuses.includes('evidence_supported_pressure_candidate'),
      corroboration_visible: statuses.includes('corroborated_pressure_candidate'),
      truth_promotion: false,
      patch_version: VERSION,
      belief_movement: 'none'
    };
  }

  function validateSynthesisRecord(record) {
    return base.validateSynthesisRecord(record);
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.synthesis_records);
    const validations = records.map(validateSynthesisRecord);
    const statuses = records.map(row => row.synthesis_status_candidate);
    const errors = [];
    if (packet && packet.source_claim_language_ok !== true) errors.push('source_claim_language_not_ok');
    if (packet && packet.source_evidence_media_ok !== true) errors.push('source_evidence_media_not_ok');
    if (records.length !== 8) errors.push(`synthesis_record_count_not_8:${records.length}`);
    if (packet && packet.external_claim_evidence_summary_count !== 4) errors.push(`external_claim_summary_count_not_4:${packet.external_claim_evidence_summary_count}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.claim_id}:${row.errors.join('|')}`); });
    const checks = {
      source_claim_language_ok: packet && packet.source_claim_language_ok === true,
      source_evidence_media_ok: packet && packet.source_evidence_media_ok === true,
      eight_synthesis_records: records.length === 8,
      four_external_claim_evidence_summaries: packet && packet.external_claim_evidence_summary_count === 4,
      all_synthesis_records_valid: validations.every(row => row.ok),
      evidence_support_visible: statuses.includes('evidence_supported_pressure_candidate'),
      corroboration_visible: statuses.includes('corroborated_pressure_candidate'),
      unsupported_unresolved_visible: statuses.includes('unsupported_unresolved_pressure_candidate'),
      contradiction_visible_not_resolved: statuses.includes('contradiction_pressure_visible_candidate') && records.every(row => row.contradiction_resolution === 'not_resolved'),
      narrative_overclaim_visible_not_motive_proof: statuses.includes('narrative_overclaim_pressure_visible_candidate') && records.every(row => row.separation_guards.narrative_pressure_is_not_motive_proof === true),
      propaganda_pressure_visible_not_fact_check: statuses.includes('propaganda_pressure_visible_candidate') && records.every(row => row.separation_guards.propaganda_pressure_is_not_external_fact_check === true),
      causal_overclaim_visible: statuses.includes('causal_overclaim_pressure_visible_candidate'),
      ambiguity_preserved: statuses.includes('ambiguous_unresolved_pressure_candidate'),
      pressure_components_separate: records.every(row => row.pressure_components && row.pressure_components.contradiction_resolution === 'not_resolved'),
      unresolved_gaps_visible: records.some(row => asArray(row.unresolved_gap_notes).length > 0),
      motive_gap_visible_for_narrative_overclaim: records.some(row => row.source_truth_status_candidate === 'narrative_overclaim_pressure_candidate' && asArray(row.unresolved_gap_notes).includes('motive_evidence_required_before_motive_truth')),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_external_lookup: packet && packet.external_lookup_performed === false && records.every(row => row.external_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_truth_pressure_synthesis_validation_v0_1_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      synthesis_validations: validations,
      errors,
      patch_version: VERSION,
      belief_movement: 'none'
    };
  }

  function runSynthesis(options = {}) {
    const packet = clone(base.runSynthesis(options));
    packet.packet_version = VERSION;
    packet.synthesis_records = asArray(packet.synthesis_records).map(patchRecord);
    packet.synthesis_record_count = packet.synthesis_records.length;
    packet.aggregate = aggregateSynthesis(packet.synthesis_records, { claim_evidence_summaries: packet.external_claim_evidence_summaries });
    packet.doctrine = doctrine();
    packet.patch_version = VERSION;
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelTruthPressureSynthesisV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    doctrine,
    patchRecord,
    aggregateSynthesis,
    validatePacket,
    runSynthesis
  }));
})(typeof window !== 'undefined' ? window : globalThis);
