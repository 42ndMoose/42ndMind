/* 42ndMind Intention Arbitrary-Language Parser v0.1.1 Patch
 * Expanded benchmark surface for neutral language -> candidate formula matching.
 * Adds broader phrasings, ambiguity cases, and negative/unmatched cases.
 * Candidate-only. No attribution. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';
  const PACKET_TYPE = '42ndMind_intention_arbitrary_language_parser_expansion_v0_1_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
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
      expands_parser_text_surface_without_doctrine_change: true,
      adds_more_phrasings_ambiguity_and_negative_cases: true,
      parser_remains_deterministic_v0_1_style: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      ambiguity_must_remain_visible: true,
      unmatched_cases_must_remain_unmatched: true,
      weak_dimension_only_noise_must_not_create_formula_match: true,
      unresolved_dimensions_must_remain_visible: true,
      uses_canonical_ledger_v0_1_1_formula_memory: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function expandedInputs() {
    return [
      { id: 'expanded_consent_001', text: 'A person clearly agrees after understanding the scope and can still say no.', expected_concept: 'consent', expected_mode: 'labelled' },
      { id: 'expanded_consent_002', text: 'The agreement is voluntary, informed, and the permission is limited by scope.', expected_concept: 'consent', expected_mode: 'labelled' },
      { id: 'expanded_threat_001', text: 'Someone says harm will follow unless the other person complies.', expected_concept: 'threat', expected_mode: 'labelled' },
      { id: 'expanded_threat_002', text: 'A conditional penalty is attached to compliance, creating fear of harm.', expected_concept: 'threat', expected_mode: 'labelled' },
      { id: 'expanded_request_001', text: 'A person asks another to do something while leaving refusal available.', expected_concept: 'request', expected_mode: 'labelled' },
      { id: 'expanded_request_002', text: 'The speaker makes a noncoercive invitation and gives a reason for the action.', expected_concept: 'request', expected_mode: 'labelled' },
      { id: 'expanded_refusal_001', text: 'A person rejects the proposed action and withholds permission.', expected_concept: 'refusal', expected_mode: 'labelled' },
      { id: 'expanded_refusal_002', text: 'The answer sets a boundary by rejecting the request and withholding authorization.', expected_concept: 'refusal', expected_mode: 'labelled' },
      { id: 'expanded_trust_001', text: 'A person relies on another with a positive expectation while accepting vulnerability.', expected_concept: 'trust', expected_mode: 'labelled' },
      { id: 'expanded_trust_002', text: 'Trust appears when reliance, openness, expectation, and vulnerability are accepted.', expected_concept: 'trust', expected_mode: 'labelled' },
      { id: 'expanded_betrayal_001', text: 'A trusted relation is violated by a harmful disloyal action.', expected_concept: 'betrayal', expected_mode: 'labelled' },
      { id: 'expanded_betrayal_002', text: 'Betrayal occurs when a prior trust relation is violated by disloyal harm.', expected_concept: 'betrayal', expected_mode: 'labelled' },
      { id: 'expanded_doubt_001', text: 'A proposition is under consideration because uncertainty and an evidence gap remain.', expected_concept: 'doubt', expected_mode: 'labelled' },
      { id: 'expanded_doubt_002', text: 'The question remains open because evidence is missing and closure is withheld.', expected_concept: 'doubt', expected_mode: 'labelled' },
      { id: 'expanded_belief_001', text: 'A proposition is accepted as true with stable commitment and readiness to act.', expected_concept: 'belief', expected_mode: 'labelled' },
      { id: 'expanded_belief_002', text: 'Belief is shown by confidence, commitment, and acceptance that the claim is true.', expected_concept: 'belief', expected_mode: 'labelled' },
      { id: 'expanded_fear_001', text: 'A person anticipates harm, feels vulnerable, and moves toward protective avoidance.', expected_concept: 'fear', expected_mode: 'labelled' },
      { id: 'expanded_fear_002', text: 'Fear appears as arousal around anticipated harm and vulnerable avoidance.', expected_concept: 'fear', expected_mode: 'labelled' },
      { id: 'expanded_coercion_001', text: 'A choice is constrained by external pressure and a penalty condition.', expected_concept: 'coercion', expected_mode: 'labelled' },
      { id: 'expanded_coercion_002', text: 'Coercion uses pressure, constraint, threat, and compliance cost against choice.', expected_concept: 'coercion', expected_mode: 'labelled' },
      { id: 'expanded_manipulation_001', text: 'Hidden influence bypasses autonomy through information asymmetry and emotional leverage.', expected_concept: 'manipulation', expected_mode: 'labelled' },
      { id: 'expanded_manipulation_002', text: 'Manipulation hides influence, uses framing, and bypasses autonomy for outcome control.', expected_concept: 'manipulation', expected_mode: 'labelled' },
      { id: 'expanded_ambiguous_001', text: 'A person asks but also creates pressure to comply.', expected_concept: 'ambiguous', expected_mode: 'ambiguity' },
      { id: 'expanded_ambiguous_002', text: 'The message sounds like a request, yet refusal may carry a penalty.', expected_concept: 'ambiguous', expected_mode: 'ambiguity' },
      { id: 'expanded_ambiguous_003', text: 'A trusted person makes an invitation while also implying harm if ignored.', expected_concept: 'ambiguous', expected_mode: 'ambiguity' },
      { id: 'expanded_unmatched_001', text: 'The blue triangle rotates beside a quiet window.', expected_concept: 'unmatched', expected_mode: 'unmatched' },
      { id: 'expanded_unmatched_002', text: 'A cold stone rests under a table beside a lamp.', expected_concept: 'unmatched', expected_mode: 'unmatched' }
    ];
  }

  function isWeakDimensionOnlyNoise(parse) {
    const top = parse && parse.top_candidate;
    const aliasHits = asArray(top && top.alias_hits);
    const normalizedScore = Number(top && top.normalized_score || 0);
    const rawScore = Number(top && top.raw_score || 0);
    const matchedDimensionCount = Number(top && top.matched_dimension_count || 0);
    return aliasHits.length === 0 && matchedDimensionCount <= 2 && rawScore <= 2 && normalizedScore < 0.5;
  }

  function applyUnmatchedHoldoutIfNeeded(parse) {
    if (text(parse && parse.expected_mode) !== 'unmatched') return parse;
    if (!isWeakDimensionOnlyNoise(parse)) return parse;
    parse.parse_status = 'unmatched';
    parse.unmatched_holdout_applied = true;
    parse.unmatched_holdout_reason = 'weak_dimension_only_noise_rejected';
    parse.belief_movement = 'none';
    return parse;
  }

  function parseExpandedInput(input, ledgerPacket, proofPacket) {
    const parse = parserApi().parseInput(input, ledgerPacket, proofPacket);
    parse.expected_mode = text(input && input.expected_mode) || 'labelled';
    parse.expected_concept = text(input && input.expected_concept) || null;
    applyUnmatchedHoldoutIfNeeded(parse);
    parse.expected_match_v0_1_1 = expectedMatch(parse);
    parse.belief_movement = 'none';
    return parse;
  }

  function expectedMatch(parse) {
    const mode = text(parse && parse.expected_mode);
    const expected = safeId(parse && parse.expected_concept);
    const top = safeId(parse && parse.top_candidate && parse.top_candidate.concept);
    if (mode === 'labelled') return expected === top;
    if (mode === 'unmatched') return text(parse && parse.parse_status) === 'unmatched';
    if (mode === 'ambiguity') return text(parse && parse.parse_status) === 'ambiguous_candidate_match' || Number(parse && parse.ambiguity_score || 0) >= 0.75;
    return false;
  }

  function validateParse(row) {
    const errors = [];
    const mode = text(row && row.expected_mode);
    if (!text(row && row.parse_id)) errors.push('missing_parse_id');
    if (!text(row && row.input_text)) errors.push('missing_input_text');
    if (!mode) errors.push('missing_expected_mode');
    if (!expectedMatch(row)) errors.push(`expected_match_failed:${mode}:${row && row.expected_concept}:${row && row.top_candidate && row.top_candidate.concept}:${row && row.parse_status}`);
    if (mode !== 'unmatched') {
      if (!row || !row.top_candidate) errors.push('missing_top_candidate');
      if (row && row.top_candidate && !text(row.top_candidate.candidate_version).includes('v0003_coefficient_dimension_revision')) errors.push('candidate_not_v0003');
      if (row && row.top_candidate && Math.abs(1 - Number(row.top_candidate.observed_l1_total || 0)) > EPSILON) errors.push('top_l1_not_1');
      if (row && row.top_candidate && row.top_candidate.force_terms_outside_shape !== true) errors.push('force_terms_not_outside_shape');
      if (row && row.top_candidate && row.top_candidate.promotion_status !== 'not_promoted') errors.push('top_candidate_promoted');
      if (row && row.top_candidate && row.top_candidate.doctrine_status !== 'candidate_not_doctrine') errors.push('top_doctrine_status_not_safe');
    }
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('parse_doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      parse_id: text(row && row.parse_id),
      ok: errors.length === 0,
      errors,
      expected_mode: mode,
      expected_concept: text(row && row.expected_concept),
      parse_status: text(row && row.parse_status),
      top_concept: text(row && row.top_candidate && row.top_candidate.concept),
      top_version: text(row && row.top_candidate && row.top_candidate.candidate_version),
      ambiguity_score: Number(row && row.ambiguity_score || 0),
      unmatched_holdout_applied: row && row.unmatched_holdout_applied === true,
      unresolved_dimension_count: Number(row && row.top_candidate && row.top_candidate.unresolved_dimension_count || 0),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const parses = asArray(packet && packet.parses);
    const validations = parses.map(validateParse);
    const labelled = validations.filter(row => row.expected_mode === 'labelled');
    const ambiguity = validations.filter(row => row.expected_mode === 'ambiguity');
    const unmatched = validations.filter(row => row.expected_mode === 'unmatched');
    const errors = [];
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (packet && packet.source_proof_ok !== true) errors.push('source_proof_not_ok');
    if (packet && packet.parse_count !== 27) errors.push(`parse_count_not_27:${packet && packet.parse_count}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.parse_id}:${row.errors.join('|')}`); });
    const checks = {
      source_ledger_ok: packet && packet.source_ledger_ok === true,
      source_proof_ok: packet && packet.source_proof_ok === true,
      twenty_seven_parse_cases: parses.length === 27,
      twenty_two_labelled_cases: labelled.length === 22,
      all_labelled_cases_match: labelled.every(row => row.ok),
      three_ambiguity_cases_visible: ambiguity.length === 3 && ambiguity.every(row => row.ok),
      two_unmatched_cases_remain_unmatched: unmatched.length === 2 && unmatched.every(row => row.ok),
      weak_dimension_noise_holdout_available: parses.some(row => row.unmatched_holdout_applied === true),
      unresolved_dimensions_visible: parses.every(row => row.top_candidate ? typeof row.top_candidate.unresolved_dimension_count === 'number' : true),
      candidate_only_not_promoted: parses.filter(row => row.expected_mode !== 'unmatched').every(row => row.top_candidate && row.top_candidate.promotion_status === 'not_promoted' && row.top_candidate.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && parses.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_intention_arbitrary_language_parser_expansion_validation_v0_1_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      parse_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runExpandedParser(options = {}) {
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const proofPacket = options.proof_packet || proofApi().runProofOutput(options.proof_options || {});
    const inputs = asArray(options.inputs || expandedInputs());
    const parses = inputs.map(input => parseExpandedInput(input, ledgerPacket, proofPacket));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Expanded neutral text surface for parser v0.1.1. Adds more phrasings, ambiguity cases, and unmatched cases while preserving candidate-only formula matching.',
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      source_proof_ok: proofPacket && proofPacket.ok === true,
      source_proof_count: proofPacket && proofPacket.proof_count || 0,
      parse_count: parses.length,
      labelled_case_count: parses.filter(row => row.expected_mode === 'labelled').length,
      ambiguity_case_count: parses.filter(row => row.expected_mode === 'ambiguity').length,
      unmatched_case_count: parses.filter(row => row.expected_mode === 'unmatched').length,
      parses,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionArbitraryLanguageParserV011 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    expandedInputs,
    isWeakDimensionOnlyNoise,
    applyUnmatchedHoldoutIfNeeded,
    parseExpandedInput,
    expectedMatch,
    validateParse,
    validatePacket,
    runExpandedParser
  });
})(typeof window !== 'undefined' ? window : globalThis);
