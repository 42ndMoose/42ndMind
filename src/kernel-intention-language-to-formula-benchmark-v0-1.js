/* 42ndMind Intention Language-to-Formula Benchmark v0.1
 * End-to-end benchmark: neutral input -> parser candidate -> v0003 formula -> proof trace.
 * Candidate-only. No attribution. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_language_to_formula_benchmark_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function parserApi() {
    if (!global.KernelIntentionArbitraryLanguageParserV01) throw new Error('KernelIntentionArbitraryLanguageParserV01 unavailable');
    return global.KernelIntentionArbitraryLanguageParserV01;
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
      benchmarks_full_language_to_formula_chain: true,
      input_to_candidate_concept_to_v0003_formula_to_proof_trace: true,
      benchmark_is_invariant_check_not_doctrine: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      ambiguity_must_remain_visible: true,
      unresolved_dimensions_must_remain_visible: true,
      uses_canonical_ledger_v0_1_1_formula_memory: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function benchmarkInputs() {
    return parserApi().sampleInputs();
  }

  function byId(rows, id) {
    return asArray(rows).find(row => text(row.parse_id || row.id) === text(id)) || null;
  }

  function traceByParseId(rows, parseId) {
    return asArray(rows).find(row => text(row.parse_id) === text(parseId)) || null;
  }

  function caseResult(input, parse, trace) {
    const expected = safeId(input && input.expected_concept);
    const topConcept = safeId(parse && parse.top_candidate && parse.top_candidate.concept);
    const traceConcept = safeId(trace && trace.top_concept);
    const expectedIsAmbiguous = expected === 'ambiguous';
    const expectedMatch = expectedIsAmbiguous ? true : expected === topConcept && expected === traceConcept;
    const candidateVersion = text(trace && trace.candidate_version || parse && parse.top_candidate && parse.top_candidate.candidate_version);
    const formulaText = text(trace && trace.formula_snapshot && trace.formula_snapshot.symbolic_formula);
    const proofId = text(trace && trace.proof_reference && trace.proof_reference.proof_id);
    const errors = [];
    if (!parse) errors.push('missing_parse');
    if (!trace) errors.push('missing_trace');
    if (!expectedMatch) errors.push(`expected_${expected}_got_${topConcept}_trace_${traceConcept}`);
    if (!candidateVersion.includes('v0003_coefficient_dimension_revision')) errors.push('candidate_not_v0003');
    if (!formulaText) errors.push('missing_formula_text');
    if (!proofId) errors.push('missing_proof_reference');
    if (Math.abs(1 - Number(trace && trace.observed_l1_total || 0)) > EPSILON) errors.push(`l1_not_1:${trace && trace.observed_l1_total}`);
    if (trace && trace.force_terms_outside_shape !== true) errors.push('force_terms_not_outside_shape');
    if (trace && trace.promotion_status !== 'not_promoted') errors.push('promoted');
    if (trace && trace.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (trace && trace.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (!expectedIsAmbiguous && (!parse || parse.expected_match !== true)) errors.push('parser_expected_match_failed');
    if (expectedIsAmbiguous && (!parse || parse.parse_status !== 'ambiguous_candidate_match')) errors.push('ambiguity_not_visible');
    return {
      case_id: text(input && input.id),
      input_text: text(input && input.text),
      expected_concept: text(input && input.expected_concept),
      expected_is_ambiguity_case: expectedIsAmbiguous,
      parser_status: text(parse && parse.parse_status),
      parser_top_concept: topConcept,
      trace_top_concept: traceConcept,
      candidate_version: candidateVersion,
      formula_present: formulaText.length > 0,
      formula_excerpt: formulaText.slice(0, 240),
      proof_reference_present: proofId.length > 0,
      proof_reference: proofId,
      ambiguity_score: Number(parse && parse.ambiguity_score || 0),
      unresolved_dimension_count: Number(trace && trace.unresolved_dimension_count || 0),
      observed_l1_total: Number(trace && trace.observed_l1_total || 0),
      force_terms_outside_shape: trace && trace.force_terms_outside_shape === true,
      promotion_status: text(trace && trace.promotion_status),
      doctrine_status: text(trace && trace.doctrine_status),
      expected_match: expectedMatch,
      ok: errors.length === 0,
      errors,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const cases = asArray(packet && packet.case_results);
    const errors = [];
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (packet && packet.source_proof_ok !== true) errors.push('source_proof_not_ok');
    if (packet && packet.source_parser_ok !== true) errors.push('source_parser_not_ok');
    if (packet && packet.source_trace_ok !== true) errors.push('source_trace_not_ok');
    if (packet && packet.case_count !== 12) errors.push(`case_count_not_12:${packet && packet.case_count}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    cases.forEach(row => { if (!row.ok) errors.push(`${row.case_id}:${row.errors.join('|')}`); });
    const labelled = cases.filter(row => !row.expected_is_ambiguity_case);
    const ambiguous = cases.filter(row => row.expected_is_ambiguity_case);
    const checks = {
      source_ledger_ok: packet && packet.source_ledger_ok === true,
      source_proof_ok: packet && packet.source_proof_ok === true,
      source_parser_ok: packet && packet.source_parser_ok === true,
      source_trace_ok: packet && packet.source_trace_ok === true,
      twelve_cases: cases.length === 12,
      eleven_labelled_cases_match: labelled.length === 11 && labelled.every(row => row.expected_match === true),
      ambiguity_case_visible: ambiguous.length === 1 && ambiguous.every(row => row.parser_status === 'ambiguous_candidate_match'),
      all_cases_have_v0003_formula: cases.every(row => row.candidate_version.includes('v0003_coefficient_dimension_revision') && row.formula_present === true),
      all_cases_have_proof_reference: cases.every(row => row.proof_reference_present === true),
      unresolved_dimensions_visible: cases.every(row => typeof row.unresolved_dimension_count === 'number'),
      all_l1_totals_equal_1: cases.every(row => Math.abs(1 - Number(row.observed_l1_total || 0)) <= EPSILON),
      force_terms_outside_shape: cases.every(row => row.force_terms_outside_shape === true),
      candidate_only_not_promoted: cases.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && cases.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_intention_language_to_formula_benchmark_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      errors,
      belief_movement: 'none'
    };
  }

  function runBenchmark(options = {}) {
    const inputs = asArray(options.inputs || benchmarkInputs());
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const proofPacket = options.proof_packet || proofApi().runProofOutput(options.proof_options || {});
    const parserPacket = options.parser_packet || parserApi().runParser({ ledger_packet: ledgerPacket, proof_packet: proofPacket, inputs });
    const tracePacket = options.trace_packet || traceApi().runTrace({ ledger_packet: ledgerPacket, proof_packet: proofPacket, parser_packet: parserPacket });
    const caseResults = inputs.map(input => {
      const parse = byId(parserPacket && parserPacket.parses, input.id);
      const trace = traceByParseId(tracePacket && tracePacket.traces, input.id);
      return caseResult(input, parse, trace);
    });
    const labelled = caseResults.filter(row => !row.expected_is_ambiguity_case);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'End-to-end benchmark over neutral language input, parser candidate, canonical v0003 formula memory, and parser-proof trace output. Candidate only; no attribution; no belief movement.',
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      source_proof_ok: proofPacket && proofPacket.ok === true,
      source_proof_count: proofPacket && proofPacket.proof_count || 0,
      source_parser_ok: parserPacket && parserPacket.ok === true,
      source_parser_parse_count: parserPacket && parserPacket.parse_count || 0,
      source_trace_ok: tracePacket && tracePacket.ok === true,
      source_trace_count: tracePacket && tracePacket.trace_count || 0,
      case_count: caseResults.length,
      labelled_case_count: labelled.length,
      labelled_case_pass_count: labelled.filter(row => row.ok).length,
      ambiguity_case_count: caseResults.filter(row => row.expected_is_ambiguity_case).length,
      case_results: caseResults,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionLanguageToFormulaBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    benchmarkInputs,
    byId,
    traceByParseId,
    caseResult,
    validatePacket,
    runBenchmark
  });
})(typeof window !== 'undefined' ? window : globalThis);
