/* 42ndMind Intention Parser Proof Trace v0.1
 * Turns parser results into readable proof-style translation traces.
 * Candidate-only. No attribution. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_parser_proof_trace_v0_1';
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
      converts_parse_results_to_proof_traces: true,
      trace_is_explanation_not_attribution: true,
      trace_is_candidate_not_doctrine: true,
      ambiguity_must_remain_visible: true,
      unresolved_dimensions_must_remain_visible: true,
      uses_canonical_ledger_v0_1_1_formula_memory: true,
      uses_parser_candidate_match_without_promoting_it: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function l1(terms) {
    return Number(asArray(terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
  }

  function forceOutsideShape(shapeTerms, forceTerms) {
    const shape = new Set(asArray(shapeTerms).map(term => safeId(term.dimension)));
    return asArray(forceTerms).every(force => !shape.has(safeId(force.dimension)));
  }

  function recordForConcept(ledgerPacket, concept) {
    const id = safeId(concept);
    return asArray(ledgerPacket && ledgerPacket.ledger_records).find(row => safeId(row.concept) === id) || null;
  }

  function versionForCandidate(record, versionId) {
    const id = text(versionId);
    return asArray(record && record.versions).find(row => text(row.version_id) === id) || null;
  }

  function proofForConcept(proofPacket, concept) {
    const id = safeId(concept);
    return asArray(proofPacket && proofPacket.proofs).find(row => safeId(row.concept) === id) || null;
  }

  function dimList(rows) {
    return asArray(rows).map(row => safeId(row.parent_dimension || row.dimension)).filter(Boolean);
  }

  function traceForParse(parse, ledgerPacket, proofPacket) {
    const top = parse && parse.top_candidate || {};
    const concept = safeId(top.concept);
    const record = recordForConcept(ledgerPacket, concept);
    const version = versionForCandidate(record, top.candidate_version) || {};
    const proof = proofForConcept(proofPacket, concept) || {};
    const matchedDimensions = dimList(top.matched_dimensions);
    const unresolvedDimensions = dimList(top.unresolved_dimensions);
    const aliases = clone(asArray(top.alias_hits));
    const shapeTerms = clone(asArray(version.shape_terms));
    const forceTerms = clone(asArray(version.force_terms));
    const observedL1 = l1(shapeTerms);
    const forceOk = forceOutsideShape(shapeTerms, forceTerms);
    const traceLines = [
      `Input: ${text(parse && parse.input_text)}`,
      `Normalized input: ${text(parse && parse.normalized_text)}`,
      `Parse status: ${text(parse && parse.parse_status)}`,
      `Top candidate: ${concept}`,
      `Candidate version: ${text(top.candidate_version)}`,
      `Candidate formula: ${text(version.symbolic_formula)}`,
      `Alias hits: ${aliases.length ? aliases.join(', ') : 'none'}`,
      `Matched dimensions: ${matchedDimensions.length ? matchedDimensions.join(', ') : 'none'}`,
      `Unresolved dimensions: ${unresolvedDimensions.length ? unresolvedDimensions.join(', ') : 'none'}`,
      `Ambiguity score: ${Number(parse && parse.ambiguity_score || 0)}`,
      `Proof reference: ${text(proof.proof_id) || text(top.proof_reference && top.proof_reference.proof_id)}`,
      'Shape invariant: Σ |dimension_i| = 1',
      `Observed L1 total: ${observedL1}`,
      `Force terms outside shape: ${forceOk}`,
      'Conclusion: input surface maps to a candidate formula structure, with ambiguity and unresolved dimensions preserved.',
      'Belief movement: none'
    ];
    return {
      trace_id: `${text(parse && parse.parse_id)}_proof_trace_v0_1`,
      parse_id: text(parse && parse.parse_id),
      input_text: text(parse && parse.input_text),
      normalized_text: text(parse && parse.normalized_text),
      parse_status: text(parse && parse.parse_status),
      top_concept: concept,
      second_concept: safeId(parse && parse.second_candidate && parse.second_candidate.concept),
      candidate_version: text(top.candidate_version),
      formula_snapshot: {
        symbolic_formula: text(version.symbolic_formula),
        force_equation: text(version.force_equation),
        shape_terms: shapeTerms,
        force_terms: forceTerms,
        belief_movement: 'none'
      },
      alias_hits: aliases,
      matched_dimensions: clone(asArray(top.matched_dimensions)),
      unresolved_dimensions: clone(asArray(top.unresolved_dimensions)),
      matched_dimension_count: Number(top.matched_dimension_count || 0),
      unresolved_dimension_count: Number(top.unresolved_dimension_count || 0),
      ambiguity_gap: Number(parse && parse.ambiguity_gap || 0),
      ambiguity_score: Number(parse && parse.ambiguity_score || 0),
      proof_reference: {
        proof_id: text(proof.proof_id) || text(top.proof_reference && top.proof_reference.proof_id),
        proof_step_count: Number(proof.proof_step_count || top.proof_reference && top.proof_reference.proof_step_count || 0)
      },
      proof_excerpt: asArray(proof.proof_lines).slice(0, 8),
      observed_l1_total: observedL1,
      force_terms_outside_shape: forceOk,
      promotion_status: text(top.promotion_status),
      doctrine_status: 'candidate_not_doctrine',
      trace_lines: traceLines,
      trace_text: traceLines.join('\n'),
      conclusion: 'candidate_formula_match_with_visible_ambiguity_and_unresolved_dimensions',
      belief_movement: 'none'
    };
  }

  function validateTrace(trace) {
    const errors = [];
    if (!text(trace && trace.trace_id)) errors.push('missing_trace_id');
    if (!text(trace && trace.parse_id)) errors.push('missing_parse_id');
    if (!text(trace && trace.input_text)) errors.push('missing_input_text');
    if (!text(trace && trace.top_concept)) errors.push('missing_top_concept');
    if (!text(trace && trace.candidate_version).includes('v0003_coefficient_dimension_revision')) errors.push('candidate_not_v0003');
    if (!trace || !trace.formula_snapshot || !text(trace.formula_snapshot.symbolic_formula)) errors.push('missing_formula_snapshot');
    if (!trace || !trace.proof_reference || !text(trace.proof_reference.proof_id)) errors.push('missing_proof_reference');
    if (!asArray(trace && trace.trace_lines).length) errors.push('missing_trace_lines');
    if (!text(trace && trace.trace_text).includes('Matched dimensions:')) errors.push('trace_missing_matched_dimensions');
    if (!text(trace && trace.trace_text).includes('Unresolved dimensions:')) errors.push('trace_missing_unresolved_dimensions');
    if (!text(trace && trace.trace_text).includes('Ambiguity score:')) errors.push('trace_missing_ambiguity_score');
    if (Math.abs(1 - Number(trace && trace.observed_l1_total || 0)) > EPSILON) errors.push(`l1_not_1:${trace && trace.observed_l1_total}`);
    if (trace && trace.force_terms_outside_shape !== true) errors.push('force_terms_not_outside_shape');
    if (trace && trace.promotion_status !== 'not_promoted') errors.push('trace_promoted');
    if (trace && trace.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (trace && trace.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      trace_id: text(trace && trace.trace_id),
      parse_id: text(trace && trace.parse_id),
      ok: errors.length === 0,
      errors,
      top_concept: text(trace && trace.top_concept),
      candidate_version: text(trace && trace.candidate_version),
      ambiguity_score: Number(trace && trace.ambiguity_score || 0),
      unresolved_dimension_count: Number(trace && trace.unresolved_dimension_count || 0),
      observed_l1_total: Number(trace && trace.observed_l1_total || 0),
      force_terms_outside_shape: trace && trace.force_terms_outside_shape === true,
      promotion_status: text(trace && trace.promotion_status),
      doctrine_status: text(trace && trace.doctrine_status),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const traces = asArray(packet && packet.traces);
    const validations = traces.map(validateTrace);
    const errors = [];
    if (packet && packet.source_parser_ok !== true) errors.push('source_parser_not_ok');
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (packet && packet.source_proof_ok !== true) errors.push('source_proof_not_ok');
    if (packet && packet.trace_count !== 12) errors.push(`trace_count_not_12:${packet && packet.trace_count}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.trace_id}:${row.errors.join('|')}`); });
    return {
      packet_type: '42ndMind_intention_parser_proof_trace_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks: {
        source_parser_ok: packet && packet.source_parser_ok === true,
        source_ledger_ok: packet && packet.source_ledger_ok === true,
        source_proof_ok: packet && packet.source_proof_ok === true,
        twelve_traces: traces.length === 12,
        every_trace_has_formula_snapshot: traces.every(row => row.formula_snapshot && text(row.formula_snapshot.symbolic_formula).length > 0),
        every_trace_has_proof_reference: traces.every(row => row.proof_reference && text(row.proof_reference.proof_id).length > 0),
        ambiguity_visible: traces.some(row => row.parse_status === 'ambiguous_candidate_match') && traces.every(row => typeof row.ambiguity_score === 'number'),
        unresolved_dimensions_visible: traces.every(row => typeof row.unresolved_dimension_count === 'number'),
        all_l1_totals_equal_1: validations.every(row => Math.abs(1 - Number(row.observed_l1_total || 0)) <= EPSILON),
        force_terms_outside_shape: validations.every(row => row.force_terms_outside_shape === true),
        candidate_only_not_promoted: validations.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
        belief_movement_none: packet && packet.belief_movement === 'none' && validations.every(row => row.belief_movement === 'none')
      },
      trace_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runTrace(options = {}) {
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const proofPacket = options.proof_packet || proofApi().runProofOutput(options.proof_options || {});
    const parserPacket = options.parser_packet || parserApi().runParser(Object.assign({}, options.parser_options || {}, { ledger_packet: ledgerPacket, proof_packet: proofPacket }));
    const traces = asArray(parserPacket && parserPacket.parses).map(row => traceForParse(row, ledgerPacket, proofPacket));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Readable proof-style traces for parser outputs. Input text is translated into candidate formula memory with aliases, matched dimensions, unresolved dimensions, ambiguity, formula snapshot, and proof reference visible.',
      source_parser_ok: parserPacket && parserPacket.ok === true,
      source_parser_parse_count: parserPacket && parserPacket.parse_count || 0,
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      source_proof_ok: proofPacket && proofPacket.ok === true,
      source_proof_count: proofPacket && proofPacket.proof_count || 0,
      trace_count: traces.length,
      traces,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionParserProofTraceV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    l1,
    forceOutsideShape,
    recordForConcept,
    versionForCandidate,
    proofForConcept,
    dimList,
    traceForParse,
    validateTrace,
    validatePacket,
    runTrace
  });
})(typeof window !== 'undefined' ? window : globalThis);
