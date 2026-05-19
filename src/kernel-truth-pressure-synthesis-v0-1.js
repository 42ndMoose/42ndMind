/* 42ndMind Truth-Pressure Synthesis v0.1
 * Combines claim-language outputs, source provenance, and evidence/media summaries.
 * Produces candidate truth-pressure synthesis without final truth promotion.
 * No LLM. No lookup. No contradiction resolution. No doctrine promotion.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_truth_pressure_synthesis_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function claimApi() {
    if (!global.KernelObjectiveClaimLanguageV01) throw new Error('KernelObjectiveClaimLanguageV01 unavailable');
    return global.KernelObjectiveClaimLanguageV01;
  }

  function evidenceApi() {
    if (!global.KernelEvidenceMediaRegistryV01) throw new Error('KernelEvidenceMediaRegistryV01 unavailable');
    return global.KernelEvidenceMediaRegistryV01;
  }

  function doctrine() {
    return {
      synthesizes_truth_pressure_without_truth_promotion: true,
      claim_language_status_remains_candidate: true,
      support_counterevidence_contradiction_narrative_propaganda_and_gaps_remain_separate: true,
      contradiction_detection_is_not_contradiction_resolution: true,
      narrative_pressure_is_not_hidden_motive_proof: true,
      propaganda_pressure_is_structural_not_external_fact_check: true,
      evidence_descriptions_are_context_not_truth: true,
      source_provenance_informs_weight_without_source_lookup: true,
      unresolved_gaps_remain_visible: true,
      no_llm: true,
      no_source_lookup: true,
      candidate_only_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function evidenceSummaryMap(evidencePacket) {
    const map = {};
    asArray(evidencePacket && evidencePacket.claim_evidence_summaries).forEach(row => {
      map[text(row.claim_id)] = row;
    });
    return map;
  }

  function externalEvidencePressureForClaim(analysis, evidenceMap) {
    const direct = evidenceMap[text(analysis && analysis.claim_id)] || null;
    const dependencyIds = asArray(analysis && analysis.dependencies)
      .filter(dep => /evidence_media_registry/.test(text(dep.registry)))
      .map(dep => text(dep.value));
    const matchingSummaries = asArray(Object.keys(evidenceMap)).map(key => evidenceMap[key]).filter(summary => {
      const ids = asArray(summary && summary.evidence_ids).map(text);
      return dependencyIds.some(id => ids.includes(id));
    });
    const selected = direct ? [direct] : matchingSummaries;
    const support = selected.reduce((sum, row) => sum + Number(row.support_strength || 0), 0);
    const counter = selected.reduce((sum, row) => sum + Number(row.counter_strength || 0), 0);
    const groups = [];
    selected.forEach(row => asArray(row.independence_groups).forEach(group => groups.push(text(group))));
    return {
      linked_external_claim_summary_count: selected.length,
      linked_external_claim_ids: selected.map(row => text(row.claim_id)),
      dependency_evidence_ids: dependencyIds,
      external_support_strength: round(support),
      external_counter_strength: round(counter),
      external_independent_group_count: Array.from(new Set(groups.filter(Boolean))).length,
      external_bridge_status: selected.length ? 'external_evidence_summary_linked' : 'no_direct_external_summary_linked',
      belief_movement: 'none'
    };
  }

  function pressureComponents(analysis, externalEvidence) {
    const contradiction = analysis && analysis.contradiction_pressure || {};
    const narrative = analysis && analysis.narrative_pressure || {};
    const source = analysis && analysis.source_posture || {};
    const supportScore = Number(contradiction.support_score || 0);
    const counterScore = Number(contradiction.counter_score || 0);
    const externalSupport = Number(externalEvidence && externalEvidence.external_support_strength || 0);
    const externalCounter = Number(externalEvidence && externalEvidence.external_counter_strength || 0);
    const independentExternalBonus = externalEvidence && externalEvidence.external_independent_group_count >= 2 ? 0.08 : 0;
    const supportPressure = round(Math.min(1, Math.max(supportScore, externalSupport / 2) + independentExternalBonus));
    const counterPressure = round(Math.min(1, Math.max(counterScore, externalCounter / 2)));
    const contradictionPressure = round(Math.max(Number(contradiction.contradiction_pressure || 0), counterPressure - supportPressure * 0.35));
    const narrativePressure = round(Number(narrative.narrative_pressure || 0));
    const propagandaPressure = round(Number(narrative.propaganda_pressure || 0));
    const unresolvedGapPressure = round(Math.max(
      supportPressure < 0.3 && counterPressure < 0.3 ? 0.7 : 0,
      source.hearsay_count > 0 ? 0.55 : 0,
      analysis && analysis.truth_status_candidate === 'ambiguous_unresolved_candidate' ? 0.6 : 0,
      externalEvidence && externalEvidence.external_bridge_status === 'no_direct_external_summary_linked' ? 0.25 : 0
    ));
    return {
      support_pressure: supportPressure,
      counter_pressure: counterPressure,
      contradiction_pressure: contradictionPressure,
      contradiction_present: contradiction.contradiction_present === true || counterPressure > 0.5,
      contradiction_resolution: 'not_resolved',
      narrative_pressure: narrativePressure,
      propaganda_pressure: propagandaPressure,
      unresolved_gap_pressure: unresolvedGapPressure,
      source_weight_posture: text(source.trust_posture),
      user_context_not_auto_truth: source.user_supplied_context_not_auto_truth === true,
      belief_movement: 'none'
    };
  }

  function determineSynthesisStatus(analysis, components) {
    const status = text(analysis && analysis.truth_status_candidate);
    if (components.contradiction_present && components.counter_pressure >= 0.5) return 'contradiction_pressure_visible_candidate';
    if (components.propaganda_pressure >= 0.72) return 'propaganda_pressure_visible_candidate';
    if (status === 'narrative_overclaim_pressure_candidate') return 'narrative_overclaim_pressure_visible_candidate';
    if (status === 'causal_overclaim_pressure_candidate') return 'causal_overclaim_pressure_visible_candidate';
    if (status === 'ambiguous_unresolved_candidate') return 'ambiguous_unresolved_pressure_candidate';
    if (status === 'corroborated_candidate') return 'corroborated_pressure_candidate';
    if (status === 'evidence_supported_candidate') return 'evidence_supported_pressure_candidate';
    if (status === 'unsupported_unresolved_candidate') return 'unsupported_unresolved_pressure_candidate';
    return 'unresolved_truth_pressure_candidate';
  }

  function unresolvedGapNotes(analysis, components, externalEvidence) {
    const notes = [];
    if (components.user_context_not_auto_truth) notes.push('user_context_recorded_but_not_auto_truth');
    if (components.unresolved_gap_pressure >= 0.5) notes.push('support_or_context_gap_visible');
    if (components.contradiction_present) notes.push('contradiction_pressure_visible_not_resolved');
    if (components.narrative_pressure >= 0.55) notes.push('narrative_pressure_visible_not_hidden_motive_proof');
    if (components.propaganda_pressure >= 0.72) notes.push('propaganda_pressure_visible_structural_not_fact_check');
    if (externalEvidence && externalEvidence.external_bridge_status === 'no_direct_external_summary_linked') notes.push('no_direct_external_evidence_summary_linked');
    if (analysis && analysis.claim_kind === 'causal_claim') notes.push('causal_bridge_required_before_causal_truth');
    if (analysis && analysis.claim_kind === 'motive_attribution_claim') notes.push('motive_evidence_required_before_motive_truth');
    return notes;
  }

  function synthesizeClaim(analysis, evidenceMap) {
    const externalEvidence = externalEvidencePressureForClaim(analysis, evidenceMap);
    const components = pressureComponents(analysis, externalEvidence);
    const synthesisStatus = determineSynthesisStatus(analysis, components);
    const record = {
      synthesis_id: `${safeId(analysis && analysis.claim_id)}_truth_pressure_synthesis_v0_1`,
      claim_id: text(analysis && analysis.claim_id),
      claim_text: text(analysis && analysis.claim_text),
      claim_kind: text(analysis && analysis.claim_kind),
      source_truth_status_candidate: text(analysis && analysis.truth_status_candidate),
      synthesis_status_candidate: synthesisStatus,
      pressure_components: components,
      external_evidence_pressure: externalEvidence,
      dependency_count: Number(analysis && analysis.dependency_count || 0),
      dependencies: clone(asArray(analysis && analysis.dependencies)),
      unresolved_gap_notes: unresolvedGapNotes(analysis, components, externalEvidence),
      separation_guards: {
        support_is_not_truth: true,
        counterevidence_is_not_disproof_by_itself: true,
        contradiction_is_not_resolved: true,
        narrative_pressure_is_not_motive_proof: true,
        propaganda_pressure_is_not_external_fact_check: true,
        user_context_is_not_auto_truth: true
      },
      external_lookup_performed: false,
      llm_used: false,
      contradiction_resolution: 'not_resolved',
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    record.validation = validateSynthesisRecord(record);
    record.ok = record.validation.ok === true;
    return record;
  }

  function aggregateSynthesis(records, evidencePacket) {
    const statuses = asArray(records).map(row => row.synthesis_status_candidate);
    const maxOf = key => round(Math.max.apply(null, asArray(records).map(row => Number(row.pressure_components && row.pressure_components[key] || 0)).concat([0])));
    return {
      synthesis_record_count: asArray(records).length,
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
      belief_movement: 'none'
    };
  }

  function validateSynthesisRecord(record) {
    const errors = [];
    const c = record && record.pressure_components || {};
    if (!text(record && record.synthesis_id)) errors.push('missing_synthesis_id');
    if (!text(record && record.claim_id)) errors.push('missing_claim_id');
    if (!text(record && record.synthesis_status_candidate)) errors.push('missing_synthesis_status_candidate');
    ['support_pressure','counter_pressure','contradiction_pressure','narrative_pressure','propaganda_pressure','unresolved_gap_pressure'].forEach(key => {
      const v = Number(c[key]);
      if (v < 0 || v > 1 || Number.isNaN(v)) errors.push(`${key}_out_of_range:${v}`);
    });
    if (c.contradiction_resolution !== 'not_resolved') errors.push('contradiction_resolved');
    if (!record || !record.separation_guards || record.separation_guards.support_is_not_truth !== true) errors.push('support_truth_guard_missing');
    if (!record || !record.separation_guards || record.separation_guards.narrative_pressure_is_not_motive_proof !== true) errors.push('narrative_guard_missing');
    if (!record || !record.separation_guards || record.separation_guards.propaganda_pressure_is_not_external_fact_check !== true) errors.push('propaganda_guard_missing');
    if (record && record.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (record && record.llm_used !== false) errors.push('llm_used');
    if (record && record.contradiction_resolution !== 'not_resolved') errors.push('record_contradiction_resolved');
    if (record && record.promotion_status !== 'not_promoted') errors.push('promoted');
    if (record && record.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (record && record.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      synthesis_id: text(record && record.synthesis_id),
      claim_id: text(record && record.claim_id),
      ok: errors.length === 0,
      errors,
      synthesis_status_candidate: text(record && record.synthesis_status_candidate),
      support_pressure: c.support_pressure,
      counter_pressure: c.counter_pressure,
      contradiction_pressure: c.contradiction_pressure,
      narrative_pressure: c.narrative_pressure,
      propaganda_pressure: c.propaganda_pressure,
      unresolved_gap_pressure: c.unresolved_gap_pressure,
      belief_movement: 'none'
    };
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
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_external_lookup: packet && packet.external_lookup_performed === false && records.every(row => row.external_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_truth_pressure_synthesis_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      synthesis_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runSynthesis(options = {}) {
    const claimPacket = options.claim_language_packet || claimApi().runClaimLanguage(options.claim_options || {});
    const evidencePacket = options.evidence_media_packet || evidenceApi().runRegistry(options.evidence_options || {});
    const evidenceMap = evidenceSummaryMap(evidencePacket);
    const records = asArray(claimPacket && claimPacket.analyses).map(analysis => synthesizeClaim(analysis, evidenceMap));
    const aggregate = aggregateSynthesis(records, evidencePacket);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Truth-pressure synthesis over claim-language outputs, source provenance, and evidence/media summaries. Candidate only; no final truth promotion.',
      source_claim_language_ok: claimPacket && claimPacket.ok === true,
      source_claim_count: claimPacket && claimPacket.claim_count || 0,
      source_evidence_media_ok: evidencePacket && evidencePacket.ok === true,
      source_evidence_record_count: evidencePacket && evidencePacket.evidence_record_count || 0,
      external_claim_evidence_summary_count: asArray(evidencePacket && evidencePacket.claim_evidence_summaries).length,
      synthesis_record_count: records.length,
      synthesis_records: records,
      aggregate,
      external_claim_evidence_summaries: clone(asArray(evidencePacket && evidencePacket.claim_evidence_summaries)),
      doctrine: doctrine(),
      llm_used: false,
      external_lookup_performed: false,
      adjudicates_final_truth: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelTruthPressureSynthesisV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    evidenceSummaryMap,
    externalEvidencePressureForClaim,
    pressureComponents,
    determineSynthesisStatus,
    unresolvedGapNotes,
    synthesizeClaim,
    aggregateSynthesis,
    validateSynthesisRecord,
    validatePacket,
    runSynthesis
  });
})(typeof window !== 'undefined' ? window : globalThis);
