/* 42ndMind Intention Parser Proof Trace v0.1.1 Patch
 * Expanded parser proof traces over 27-case parser expansion.
 * Accepted cases get formula traces. Unmatched controls get holdout traces.
 * Candidate-only. No attribution. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';
  const PACKET_TYPE = '42ndMind_intention_expanded_parser_proof_trace_v0_1_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function expandedParserApi() {
    if (!global.KernelIntentionArbitraryLanguageParserV011) throw new Error('KernelIntentionArbitraryLanguageParserV011 unavailable');
    return global.KernelIntentionArbitraryLanguageParserV011;
  }

  function traceApi() {
    if (!global.KernelIntentionParserProofTraceV01) throw new Error('KernelIntentionParserProofTraceV01 unavailable');
    return global.KernelIntentionParserProofTraceV01;
  }

  function ledgerApi() {
    if (!global.KernelIntentionCanonicalFormulaLedgerV011) throw new Error('KernelIntentionCanonicalFormulaLedgerV011 unavailable');
    return global.KernelIntentionCanonicalFormulaLedgerV011;
  }

  function proofApi() {
    if (!global.KernelIntentionProofOutputV01) throw new Error('KernelIntentionProofOutputV01 unavailable');
    return global.KernelIntentionProofOutputV01;
  }

  function doctrine() {
    return {
      expands_parser_proof_trace_to_twenty_seven_cases: true,
      accepted_cases_get_formula_traces: true,
      unmatched_cases_get_holdout_traces: true,
      holdout_trace_is_not_formula_acceptance: true,
      weak_dimension_only_noise_remains_rejected: true,
      trace_is_explanation_not_attribution: true,
      trace_is_candidate_not_doctrine: true,
      ambiguity_must_remain_visible: true,
      unresolved_dimensions_must_remain_visible: true,
      uses_canonical_ledger_v0_1_1_formula_memory_for_accepted_cases: true,
      local_shape_l1_total_required_for_accepted_cases: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function makeAcceptedTrace(parse, ledgerPacket, proofPacket) {
    const base = traceApi().traceForParse(parse, ledgerPacket, proofPacket);
    base.trace_id = `${text(parse && parse.parse_id)}_expanded_formula_trace_v0_1_1`;
    base.trace_kind = 'accepted_formula_trace';
    base.expected_mode = text(parse && parse.expected_mode);
    base.expected_concept = text(parse && parse.expected_concept);
    base.expected_match = parse && parse.expected_match_v0_1_1 === true;
    base.unmatched_holdout_applied = false;
    base.conclusion = 'accepted_candidate_formula_trace_with_visible_ambiguity_and_unresolved_dimensions';
    base.belief_movement = 'none';
    return base;
  }

  function makeHoldoutTrace(parse) {
    const top = parse && parse.top_candidate || {};
    const traceLines = [
      `Input: ${text(parse && parse.input_text)}`,
      `Normalized input: ${text(parse && parse.normalized_text)}`,
      `Parse status: ${text(parse && parse.parse_status)}`,
      'Trace kind: holdout_trace',
      `Rejected weak candidate: ${safeId(top.concept)}`,
      `Rejected candidate version: ${text(top.candidate_version)}`,
      `Alias hits: ${asArray(top.alias_hits).length ? asArray(top.alias_hits).join(', ') : 'none'}`,
      `Matched dimensions: ${asArray(top.matched_dimensions).map(row => safeId(row.parent_dimension || row.dimension)).join(', ') || 'none'}`,
      `Unresolved dimensions: ${Number(top.unresolved_dimension_count || 0)}`,
      `Ambiguity score: ${Number(parse && parse.ambiguity_score || 0)}`,
      `Holdout applied: ${parse && parse.unmatched_holdout_applied === true}`,
      `Holdout reason: ${text(parse && parse.unmatched_holdout_reason)}`,
      'Conclusion: no formula acceptance; weak dimension-only noise remains held out.',
      'Belief movement: none'
    ];
    return {
      trace_id: `${text(parse && parse.parse_id)}_expanded_holdout_trace_v0_1_1`,
      trace_kind: 'holdout_trace',
      parse_id: text(parse && parse.parse_id),
      input_text: text(parse && parse.input_text),
      normalized_text: text(parse && parse.normalized_text),
      parse_status: text(parse && parse.parse_status),
      expected_mode: text(parse && parse.expected_mode),
      expected_concept: text(parse && parse.expected_concept),
      expected_match: parse && parse.expected_match_v0_1_1 === true,
      top_concept: 'unmatched',
      rejected_candidate: safeId(top.concept),
      rejected_candidate_version: text(top.candidate_version),
      rejected_candidate_snapshot: {
        concept: safeId(top.concept),
        candidate_version: text(top.candidate_version),
        alias_hits: clone(asArray(top.alias_hits)),
        raw_score: Number(top.raw_score || 0),
        normalized_score: Number(top.normalized_score || 0),
        matched_dimension_count: Number(top.matched_dimension_count || 0),
        unresolved_dimension_count: Number(top.unresolved_dimension_count || 0),
        belief_movement: 'none'
      },
      formula_snapshot: null,
      proof_reference: null,
      proof_excerpt: [],
      alias_hits: clone(asArray(top.alias_hits)),
      matched_dimensions: clone(asArray(top.matched_dimensions)),
      unresolved_dimensions: clone(asArray(top.unresolved_dimensions)),
      matched_dimension_count: Number(top.matched_dimension_count || 0),
      unresolved_dimension_count: Number(top.unresolved_dimension_count || 0),
      ambiguity_gap: Number(parse && parse.ambiguity_gap || 0),
      ambiguity_score: Number(parse && parse.ambiguity_score || 0),
      unmatched_holdout_applied: parse && parse.unmatched_holdout_applied === true,
      unmatched_holdout_reason: text(parse && parse.unmatched_holdout_reason),
      observed_l1_total: null,
      force_terms_outside_shape: null,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      trace_lines: traceLines,
      trace_text: traceLines.join('\n'),
      conclusion: 'holdout_trace_no_formula_acceptance',
      belief_movement: 'none'
    };
  }

  function traceForExpandedParse(parse, ledgerPacket, proofPacket) {
    if (text(parse && parse.expected_mode) === 'unmatched' || text(parse && parse.parse_status) === 'unmatched') {
      return makeHoldoutTrace(parse);
    }
    return makeAcceptedTrace(parse, ledgerPacket, proofPacket);
  }

  function validateTrace(trace) {
    const errors = [];
    const kind = text(trace && trace.trace_kind);
    if (!text(trace && trace.trace_id)) errors.push('missing_trace_id');
    if (!text(trace && trace.parse_id)) errors.push('missing_parse_id');
    if (!text(trace && trace.input_text)) errors.push('missing_input_text');
    if (trace && trace.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (trace && trace.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (trace && trace.promotion_status !== 'not_promoted') errors.push('promoted');
    if (!text(trace && trace.trace_text).includes('Ambiguity score:')) errors.push('trace_missing_ambiguity_score');
    if (kind === 'accepted_formula_trace') {
      if (!text(trace && trace.candidate_version).includes('v0003_coefficient_dimension_revision')) errors.push('accepted_candidate_not_v0003');
      if (!trace || !trace.formula_snapshot || !text(trace.formula_snapshot.symbolic_formula)) errors.push('accepted_missing_formula_snapshot');
      if (!trace || !trace.proof_reference || !text(trace.proof_reference.proof_id)) errors.push('accepted_missing_proof_reference');
      if (Math.abs(1 - Number(trace && trace.observed_l1_total || 0)) > EPSILON) errors.push(`accepted_l1_not_1:${trace && trace.observed_l1_total}`);
      if (trace && trace.force_terms_outside_shape !== true) errors.push('accepted_force_terms_not_outside_shape');
      if (!text(trace && trace.trace_text).includes('Matched dimensions:')) errors.push('accepted_trace_missing_matched_dimensions');
      if (!text(trace && trace.trace_text).includes('Unresolved dimensions:')) errors.push('accepted_trace_missing_unresolved_dimensions');
    } else if (kind === 'holdout_trace') {
      if (trace && trace.parse_status !== 'unmatched') errors.push('holdout_parse_status_not_unmatched');
      if (trace && trace.unmatched_holdout_applied !== true) errors.push('holdout_not_applied');
      if (!text(trace && trace.unmatched_holdout_reason)) errors.push('holdout_reason_missing');
      if (trace && trace.formula_snapshot !== null) errors.push('holdout_has_formula_snapshot');
      if (trace && trace.proof_reference !== null) errors.push('holdout_has_proof_reference');
      if (!text(trace && trace.rejected_candidate)) errors.push('holdout_missing_rejected_candidate');
      if (!text(trace && trace.trace_text).includes('no formula acceptance')) errors.push('holdout_missing_no_acceptance_statement');
    } else {
      errors.push('unknown_trace_kind');
    }
    return {
      trace_id: text(trace && trace.trace_id),
      parse_id: text(trace && trace.parse_id),
      trace_kind: kind,
      ok: errors.length === 0,
      errors,
      parse_status: text(trace && trace.parse_status),
      top_concept: text(trace && trace.top_concept),
      rejected_candidate: text(trace && trace.rejected_candidate),
      candidate_version: text(trace && trace.candidate_version),
      ambiguity_score: Number(trace && trace.ambiguity_score || 0),
      unresolved_dimension_count: Number(trace && trace.unresolved_dimension_count || 0),
      observed_l1_total: trace && trace.observed_l1_total,
      force_terms_outside_shape: trace && trace.force_terms_outside_shape,
      promotion_status: text(trace && trace.promotion_status),
      doctrine_status: text(trace && trace.doctrine_status),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const traces = asArray(packet && packet.traces);
    const validations = traces.map(validateTrace);
    const accepted = traces.filter(row => row.trace_kind === 'accepted_formula_trace');
    const holdout = traces.filter(row => row.trace_kind === 'holdout_trace');
    const errors = [];
    if (packet && packet.source_expanded_parser_ok !== true) errors.push('source_expanded_parser_not_ok');
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (packet && packet.source_proof_ok !== true) errors.push('source_proof_not_ok');
    if (packet && packet.trace_count !== 27) errors.push(`trace_count_not_27:${packet && packet.trace_count}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.trace_id}:${row.errors.join('|')}`); });
    const checks = {
      source_expanded_parser_ok: packet && packet.source_expanded_parser_ok === true,
      source_ledger_ok: packet && packet.source_ledger_ok === true,
      source_proof_ok: packet && packet.source_proof_ok === true,
      twenty_seven_traces: traces.length === 27,
      twenty_five_accepted_formula_traces: accepted.length === 25,
      two_holdout_traces: holdout.length === 2,
      accepted_traces_have_v0003_formula: accepted.every(row => text(row.candidate_version).includes('v0003_coefficient_dimension_revision') && row.formula_snapshot && text(row.formula_snapshot.symbolic_formula).length > 0),
      accepted_traces_have_proof_reference: accepted.every(row => row.proof_reference && text(row.proof_reference.proof_id).length > 0),
      holdout_traces_have_no_formula_acceptance: holdout.every(row => row.formula_snapshot === null && row.proof_reference === null && row.unmatched_holdout_applied === true),
      ambiguity_visible: traces.some(row => row.parse_status === 'ambiguous_candidate_match') && traces.every(row => typeof row.ambiguity_score === 'number'),
      unresolved_dimensions_visible: traces.every(row => typeof row.unresolved_dimension_count === 'number'),
      accepted_l1_totals_equal_1: accepted.every(row => Math.abs(1 - Number(row.observed_l1_total || 0)) <= EPSILON),
      accepted_force_terms_outside_shape: accepted.every(row => row.force_terms_outside_shape === true),
      candidate_only_not_promoted: validations.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && validations.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_intention_expanded_parser_proof_trace_validation_v0_1_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      trace_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runExpandedTrace(options = {}) {
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const proofPacket = options.proof_packet || proofApi().runProofOutput(options.proof_options || {});
    const expandedParserPacket = options.expanded_parser_packet || expandedParserApi().runExpandedParser(Object.assign({}, options.expanded_parser_options || {}, { ledger_packet: ledgerPacket, proof_packet: proofPacket }));
    const traces = asArray(expandedParserPacket && expandedParserPacket.parses).map(row => traceForExpandedParse(row, ledgerPacket, proofPacket));
    const accepted = traces.filter(row => row.trace_kind === 'accepted_formula_trace');
    const holdout = traces.filter(row => row.trace_kind === 'holdout_trace');
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Expanded proof-style traces over parser v0.1.1/v0.1.2 surface. Accepted rows get formula traces; unmatched negative controls get holdout traces without formula acceptance.',
      source_expanded_parser_ok: expandedParserPacket && expandedParserPacket.ok === true,
      source_expanded_parser_parse_count: expandedParserPacket && expandedParserPacket.parse_count || 0,
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      source_proof_ok: proofPacket && proofPacket.ok === true,
      source_proof_count: proofPacket && proofPacket.proof_count || 0,
      trace_count: traces.length,
      accepted_trace_count: accepted.length,
      holdout_trace_count: holdout.length,
      traces,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionParserProofTraceV011 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    makeAcceptedTrace,
    makeHoldoutTrace,
    traceForExpandedParse,
    validateTrace,
    validatePacket,
    runExpandedTrace
  });
})(typeof window !== 'undefined' ? window : globalThis);
