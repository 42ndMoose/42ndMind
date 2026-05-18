/* 42ndMind Objective Claim Trace v0.1
 * Proof-style traces for deterministic objective claim-language analysis.
 * Uses structured user-supplied context/evidence. No LLM. No source lookup. Candidate only.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_objective_claim_trace_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return text(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function claimApi() {
    if (global.KernelObjectiveClaimLanguageV011) return global.KernelObjectiveClaimLanguageV011;
    if (global.KernelObjectiveClaimLanguageV01) return global.KernelObjectiveClaimLanguageV01;
    throw new Error('KernelObjectiveClaimLanguageV011 or V01 unavailable');
  }

  function doctrine() {
    return {
      traces_claim_language_outputs_as_proof_style_records: true,
      claim_trace_is_explanation_not_final_truth: true,
      user_supplied_context_is_not_auto_truth: true,
      contradiction_detection_is_not_contradiction_resolution: true,
      narrative_pressure_is_not_hidden_motive_proof: true,
      propaganda_pressure_is_structural_pressure_not_external_fact_check: true,
      causal_overclaim_requires_causal_bridge: true,
      motive_overclaim_requires_motive_evidence: true,
      no_llm: true,
      no_source_lookup: true,
      candidate_only_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function traceKindForStatus(status) {
    const s = safeId(status);
    if (s === 'evidence_supported_candidate') return 'evidence_supported_trace';
    if (s === 'unsupported_unresolved_candidate') return 'unsupported_unresolved_trace';
    if (s === 'contradiction_pressure_candidate') return 'contradiction_pressure_trace';
    if (s === 'narrative_overclaim_pressure_candidate') return 'narrative_overclaim_trace';
    if (s === 'propaganda_pressure_candidate') return 'propaganda_pressure_trace';
    if (s === 'corroborated_candidate') return 'corroboration_trace';
    if (s === 'causal_overclaim_pressure_candidate') return 'causal_overclaim_trace';
    if (s === 'ambiguous_unresolved_candidate') return 'ambiguous_unresolved_trace';
    return 'unresolved_claim_trace';
  }

  function dependencySummary(analysis) {
    return asArray(analysis && analysis.dependencies).map(row => ({
      dependency_type: text(row.dependency_type),
      value: text(row.value),
      registry: text(row.registry)
    }));
  }

  function traceLinesForAnalysis(analysis) {
    const source = analysis && analysis.source_posture || {};
    const contradiction = analysis && analysis.contradiction_pressure || {};
    const narrative = analysis && analysis.narrative_pressure || {};
    const dependencies = dependencySummary(analysis);
    const lines = [
      `Claim: ${text(analysis && analysis.claim_text)}`,
      `Claim kind: ${text(analysis && analysis.claim_kind)}`,
      `Truth-status candidate: ${text(analysis && analysis.truth_status_candidate)}`,
      `Trace kind: ${traceKindForStatus(analysis && analysis.truth_status_candidate)}`,
      `Source posture: ${text(source.trust_posture)}`,
      'User context posture: user-supplied context is recorded as context, not automatic truth.',
      `Evidence count: ${Number(source.evidence_count || 0)}`,
      `Counterevidence count: ${Number(source.counterevidence_count || 0)}`,
      `Independent source count: ${Number(source.independent_source_count || 0)}`,
      `Support score: ${Number(contradiction.support_score || 0)}`,
      `Counter score: ${Number(contradiction.counter_score || 0)}`,
      `Contradiction present: ${contradiction.contradiction_present === true}`,
      `Contradiction resolution: ${text(contradiction.contradiction_resolution) || 'not_resolved'}`,
      'Contradiction rule: detection is not resolution.',
      `Narrative pressure: ${Number(narrative.narrative_pressure || 0)}`,
      `Propaganda pressure: ${Number(narrative.propaganda_pressure || 0)}`,
      `Narrative flags: ${asArray(narrative.flags).join(', ') || 'none'}`,
      'Narrative rule: structural pressure is not proof of hidden motive.',
      `Dependencies: ${dependencies.map(row => row.dependency_type + ':' + row.value).join(' | ') || 'none'}`,
      `LLM used: ${analysis && analysis.llm_used === true}`,
      `External lookup performed: ${analysis && analysis.external_lookup_performed === true}`,
      'Conclusion: preserve candidate status and expose pressure structure without promotion.',
      'Belief movement: none'
    ];
    if (text(analysis && analysis.truth_status_candidate) === 'causal_overclaim_pressure_candidate') {
      lines.splice(18, 0, 'Causal rule: temporal sequence requires a causal bridge before causal truth can be accepted.');
    }
    if (text(analysis && analysis.truth_status_candidate) === 'narrative_overclaim_pressure_candidate') {
      lines.splice(18, 0, 'Motive rule: hidden intention requires direct or strong indirect motive evidence before acceptance.');
    }
    if (text(analysis && analysis.truth_status_candidate) === 'propaganda_pressure_candidate') {
      lines.splice(18, 0, 'Propaganda rule: loaded labels, social coercion, false consensus, and no-falsifier structure create propaganda pressure.');
    }
    if (text(analysis && analysis.truth_status_candidate) === 'ambiguous_unresolved_candidate') {
      lines.splice(18, 0, 'Ambiguity rule: competing interpretations remain visible instead of collapsing into one decision.');
    }
    return lines;
  }

  function makeTrace(analysis) {
    const lines = traceLinesForAnalysis(analysis);
    const deps = dependencySummary(analysis);
    return {
      packet_type: '42ndMind_objective_claim_trace_record_v0_1',
      packet_version: VERSION,
      created_at: now(),
      trace_id: `${text(analysis && analysis.claim_id)}_claim_trace_v0_1`,
      trace_kind: traceKindForStatus(analysis && analysis.truth_status_candidate),
      claim_id: text(analysis && analysis.claim_id),
      claim_text: text(analysis && analysis.claim_text),
      claim_kind: text(analysis && analysis.claim_kind),
      truth_status_candidate: text(analysis && analysis.truth_status_candidate),
      expected_truth_status: text(analysis && analysis.expected_truth_status),
      expected_match: analysis && analysis.expected_match === true,
      dependencies: deps,
      dependency_count: deps.length,
      source_posture: clone(analysis && analysis.source_posture),
      contradiction_pressure: clone(analysis && analysis.contradiction_pressure),
      narrative_pressure: clone(analysis && analysis.narrative_pressure),
      user_context_snapshot: clone(analysis && analysis.user_context_snapshot),
      evidence_snapshot: clone(asArray(analysis && analysis.evidence_snapshot)),
      counterevidence_snapshot: clone(asArray(analysis && analysis.counterevidence_snapshot)),
      user_context_not_auto_truth: analysis && analysis.source_posture && analysis.source_posture.user_supplied_context_not_auto_truth === true,
      contradiction_not_resolved: analysis && analysis.contradiction_pressure && analysis.contradiction_pressure.contradiction_resolution === 'not_resolved',
      hidden_motive_not_decided: analysis && analysis.narrative_pressure && analysis.narrative_pressure.hidden_motive_not_decided === true,
      llm_used: false,
      external_lookup_performed: false,
      doctrine_status: 'candidate_not_doctrine',
      promotion_status: 'not_promoted',
      trace_lines: lines,
      trace_text: lines.join('\n'),
      belief_movement: 'none'
    };
  }

  function validateTrace(trace) {
    const errors = [];
    if (!text(trace && trace.trace_id)) errors.push('missing_trace_id');
    if (!text(trace && trace.claim_id)) errors.push('missing_claim_id');
    if (!text(trace && trace.claim_text)) errors.push('missing_claim_text');
    if (!text(trace && trace.claim_kind)) errors.push('missing_claim_kind');
    if (!text(trace && trace.truth_status_candidate)) errors.push('missing_truth_status_candidate');
    if (trace && trace.expected_match !== true) errors.push('expected_status_mismatch');
    if (trace && trace.user_context_not_auto_truth !== true) errors.push('user_context_auto_truth_risk');
    if (trace && trace.contradiction_not_resolved !== true) errors.push('contradiction_resolution_violation');
    if (trace && trace.hidden_motive_not_decided !== true) errors.push('hidden_motive_decided');
    if (trace && trace.llm_used !== false) errors.push('llm_used');
    if (trace && trace.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (trace && trace.promotion_status !== 'not_promoted') errors.push('promoted');
    if (trace && trace.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    const traceText = text(trace && trace.trace_text);
    ['Claim kind:', 'Truth-status candidate:', 'Support score:', 'Counter score:', 'Contradiction rule:', 'Narrative rule:', 'Conclusion:', 'Belief movement: none'].forEach(marker => {
      if (!traceText.includes(marker)) errors.push(`trace_missing_${safeId(marker)}`);
    });
    if (trace && trace.trace_kind === 'causal_overclaim_trace' && !traceText.includes('Causal rule:')) errors.push('causal_rule_missing');
    if (trace && trace.trace_kind === 'narrative_overclaim_trace' && !traceText.includes('Motive rule:')) errors.push('motive_rule_missing');
    if (trace && trace.trace_kind === 'propaganda_pressure_trace' && !traceText.includes('Propaganda rule:')) errors.push('propaganda_rule_missing');
    if (trace && trace.trace_kind === 'ambiguous_unresolved_trace' && !traceText.includes('Ambiguity rule:')) errors.push('ambiguity_rule_missing');
    if (trace && trace.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      trace_id: text(trace && trace.trace_id),
      claim_id: text(trace && trace.claim_id),
      trace_kind: text(trace && trace.trace_kind),
      ok: errors.length === 0,
      errors,
      claim_kind: text(trace && trace.claim_kind),
      truth_status_candidate: text(trace && trace.truth_status_candidate),
      dependency_count: Number(trace && trace.dependency_count || 0),
      user_context_not_auto_truth: trace && trace.user_context_not_auto_truth === true,
      contradiction_not_resolved: trace && trace.contradiction_not_resolved === true,
      hidden_motive_not_decided: trace && trace.hidden_motive_not_decided === true,
      llm_used: trace && trace.llm_used === true,
      external_lookup_performed: trace && trace.external_lookup_performed === true,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const traces = asArray(packet && packet.traces);
    const validations = traces.map(validateTrace);
    const errors = [];
    if (packet && packet.source_claim_language_ok !== true) errors.push('source_claim_language_not_ok');
    if (packet && packet.source_claim_count !== 8) errors.push(`source_claim_count_not_8:${packet && packet.source_claim_count}`);
    if (traces.length !== 8) errors.push(`trace_count_not_8:${traces.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.trace_id}:${row.errors.join('|')}`); });
    const kinds = traces.map(row => row.trace_kind);
    const checks = {
      source_claim_language_ok: packet && packet.source_claim_language_ok === true,
      eight_claim_traces: traces.length === 8,
      all_expected_statuses_preserved: traces.every(row => row.expected_match === true),
      all_trace_text_present: traces.every(row => text(row.trace_text).length > 80),
      evidence_supported_trace_present: kinds.includes('evidence_supported_trace'),
      unsupported_unresolved_trace_present: kinds.includes('unsupported_unresolved_trace'),
      contradiction_pressure_trace_present: kinds.includes('contradiction_pressure_trace'),
      narrative_overclaim_trace_present: kinds.includes('narrative_overclaim_trace'),
      propaganda_pressure_trace_present: kinds.includes('propaganda_pressure_trace'),
      corroboration_trace_present: kinds.includes('corroboration_trace'),
      causal_overclaim_trace_present: kinds.includes('causal_overclaim_trace'),
      ambiguous_unresolved_trace_present: kinds.includes('ambiguous_unresolved_trace'),
      user_context_not_auto_truth: traces.every(row => row.user_context_not_auto_truth === true),
      contradiction_detection_not_resolution: traces.every(row => row.contradiction_not_resolved === true),
      narrative_pressure_not_motive_proof: traces.every(row => row.hidden_motive_not_decided === true),
      no_llm_used: traces.every(row => row.llm_used === false),
      no_external_lookup: traces.every(row => row.external_lookup_performed === false),
      candidate_only_not_promoted: traces.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && traces.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_objective_claim_trace_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      trace_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runClaimTrace(options = {}) {
    const claimPacket = options.claim_packet || claimApi().runClaimLanguage(options.claim_options || {});
    const traces = asArray(claimPacket && claimPacket.analyses).map(makeTrace);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Proof-style traces for deterministic objective claim-language results. Explains source posture, dependency structure, contradiction pressure, narrative pressure, and truth-status candidate without LLM or source lookup.',
      source_claim_language_ok: claimPacket && claimPacket.ok === true,
      source_claim_language_version: text(claimPacket && claimPacket.packet_version),
      source_claim_count: claimPacket && claimPacket.claim_count || 0,
      trace_count: traces.length,
      traces,
      doctrine: doctrine(),
      llm_used: false,
      external_lookup_performed: false,
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelObjectiveClaimTraceV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    traceKindForStatus,
    dependencySummary,
    traceLinesForAnalysis,
    makeTrace,
    validateTrace,
    validatePacket,
    runClaimTrace
  });
})(typeof window !== 'undefined' ? window : globalThis);
