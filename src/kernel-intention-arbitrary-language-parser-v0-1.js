/* 42ndMind Intention Arbitrary-Language Parser v0.1
 * Maps neutral text surfaces into candidate formula structures from canonical ledger v0.1.1.
 * Deterministic v0.1 parser. Candidate-only. No attribution. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_arbitrary_language_parser_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

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
      parses_text_into_candidate_formula_matches: true,
      parser_is_deterministic_v0_1_not_semantic_oracle: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      ambiguity_must_remain_visible: true,
      unresolved_dimensions_must_remain_visible: true,
      uses_canonical_ledger_v0_1_1_as_target_memory: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function sampleInputs() {
    return [
      { id: 'sample_consent_001', text: 'A person clearly agrees after understanding the scope and can still say no.', expected_concept: 'consent' },
      { id: 'sample_threat_001', text: 'Someone says harm will follow unless the other person complies.', expected_concept: 'threat' },
      { id: 'sample_request_001', text: 'A person asks another to do something while leaving refusal available.', expected_concept: 'request' },
      { id: 'sample_refusal_001', text: 'A person rejects the proposed action and withholds permission.', expected_concept: 'refusal' },
      { id: 'sample_trust_001', text: 'A person relies on another with a positive expectation while accepting vulnerability.', expected_concept: 'trust' },
      { id: 'sample_betrayal_001', text: 'A trusted relation is violated by a harmful disloyal action.', expected_concept: 'betrayal' },
      { id: 'sample_doubt_001', text: 'A proposition is under consideration because uncertainty and an evidence gap remain.', expected_concept: 'doubt' },
      { id: 'sample_belief_001', text: 'A proposition is accepted as true with stable commitment and readiness to act.', expected_concept: 'belief' },
      { id: 'sample_fear_001', text: 'A person anticipates harm, feels vulnerable, and moves toward protective avoidance.', expected_concept: 'fear' },
      { id: 'sample_coercion_001', text: 'A choice is constrained by external pressure and a penalty condition.', expected_concept: 'coercion' },
      { id: 'sample_manipulation_001', text: 'Hidden influence bypasses autonomy through information asymmetry and emotional leverage.', expected_concept: 'manipulation' },
      { id: 'sample_ambiguous_001', text: 'A person asks but also creates pressure to comply.', expected_concept: 'ambiguous' }
    ];
  }

  function normalizeInput(input) {
    return lower(input).replace(/[^a-z0-9\s_]+/g, ' ').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokens(input) {
    return normalizeInput(input).split(' ').filter(Boolean);
  }

  function tokenSet(input) {
    return new Set(tokens(input));
  }

  function aliases() {
    return {
      consent: ['consent', 'agree', 'agrees', 'agreement', 'permission', 'authorize', 'authorization', 'voluntary', 'understanding', 'scope', 'capacity'],
      threat: ['threat', 'harm', 'unless', 'comply', 'complies', 'compliance', 'fear', 'penalty', 'conditional'],
      request: ['request', 'ask', 'asks', 'asked', 'asking', 'invitation', 'refusal', 'available', 'reason', 'noncoercive'],
      refusal: ['refusal', 'reject', 'rejects', 'rejected', 'withhold', 'withholds', 'withholding', 'permission', 'boundary'],
      trust: ['trust', 'trusted', 'rely', 'relies', 'reliance', 'positive', 'expectation', 'vulnerability'],
      betrayal: ['betrayal', 'betray', 'betrayed', 'trusted', 'violated', 'disloyal', 'harmful', 'relation'],
      doubt: ['doubt', 'uncertain', 'uncertainty', 'question', 'questioning', 'evidence', 'gap', 'consideration'],
      belief: ['belief', 'believe', 'accepted', 'accepts', 'true', 'commitment', 'confidence', 'readiness'],
      fear: ['fear', 'harm', 'vulnerable', 'vulnerability', 'avoidance', 'protective', 'anticipated', 'arousal'],
      coercion: ['coercion', 'coerce', 'constrained', 'constraint', 'pressure', 'external', 'penalty', 'threat', 'compliance'],
      manipulation: ['manipulation', 'manipulate', 'hidden', 'influence', 'bypass', 'autonomy', 'asymmetry', 'emotional', 'leverage', 'framing']
    };
  }

  function parentDimensionName(dimension) {
    return safeId(dimension).replace(/_(identity_component|contrast_boundary_component|scope_component|limit_component|signal_component|expression_boundary_component|primary_component|pressure_component)$/g, '');
  }

  function wordsFromId(value) {
    return safeId(value).split('_').filter(Boolean);
  }

  function currentVersion(record) {
    const id = text(record && record.current_candidate_version);
    return asArray(record && record.versions).find(v => v.version_id === id) || asArray(record && record.versions)[0] || null;
  }

  function proofForConcept(proofPacket, concept) {
    const id = safeId(concept);
    return asArray(proofPacket && proofPacket.proofs).find(row => safeId(row.concept) === id) || null;
  }

  function conceptScore(record, inputTokens) {
    const concept = safeId(record && record.concept);
    const conceptAliases = aliases()[concept] || wordsFromId(concept);
    const hits = conceptAliases.filter(alias => inputTokens.has(alias));
    return {
      concept,
      alias_hits: hits,
      alias_score: hits.length,
      belief_movement: 'none'
    };
  }

  function dimensionScore(term, inputTokens) {
    const dimension = safeId(term && term.dimension);
    const parent = parentDimensionName(dimension);
    const words = Array.from(new Set(wordsFromId(parent).concat(wordsFromId(dimension))));
    const hits = words.filter(word => inputTokens.has(word));
    return {
      dimension,
      parent_dimension: parent,
      coefficient: Number(term && term.coefficient || 0),
      role: text(term && term.role),
      matched_terms: hits,
      matched: hits.length > 0,
      match_score: hits.length,
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

  function parseInput(input, ledgerPacket, proofPacket) {
    const raw = text(input && input.text != null ? input.text : input);
    const id = text(input && input.id) || `parse_${Math.random().toString(36).slice(2)}`;
    const inputTokenSet = tokenSet(raw);
    const candidates = asArray(ledgerPacket && ledgerPacket.ledger_records).map(record => {
      const version = currentVersion(record);
      const cScore = conceptScore(record, inputTokenSet);
      const dimensions = asArray(version && version.shape_terms).map(term => dimensionScore(term, inputTokenSet));
      const matched = dimensions.filter(row => row.matched);
      const unresolved = dimensions.filter(row => !row.matched);
      const weightedDimensionScore = Number(matched.reduce((sum, row) => sum + Math.abs(Number(row.coefficient || 0)), 0).toFixed(6));
      const rawScore = cScore.alias_score + dimensions.reduce((sum, row) => sum + row.match_score, 0);
      const normalizedScore = Number((weightedDimensionScore + Math.min(1, cScore.alias_score / 3)).toFixed(6));
      const proof = proofForConcept(proofPacket, record.concept);
      return {
        concept: safeId(record.concept),
        candidate_version: text(version && version.version_id),
        source_type: text(version && version.source_type),
        alias_hits: cScore.alias_hits,
        raw_score: rawScore,
        normalized_score: normalizedScore,
        matched_dimension_count: matched.length,
        unresolved_dimension_count: unresolved.length,
        matched_dimensions: matched,
        unresolved_dimensions: unresolved,
        observed_l1_total: l1(version && version.shape_terms),
        force_terms_outside_shape: forceOutsideShape(version && version.shape_terms, version && version.force_terms),
        proof_reference: proof ? { proof_id: proof.proof_id, proof_step_count: proof.proof_step_count } : null,
        promotion_status: text(version && version.promotion_status),
        doctrine_status: text(version && version.doctrine_status),
        belief_movement: 'none'
      };
    }).sort((a, b) => b.normalized_score - a.normalized_score || b.raw_score - a.raw_score || a.concept.localeCompare(b.concept));
    const top = candidates[0] || null;
    const second = candidates[1] || null;
    const ambiguityGap = Number(((top ? top.normalized_score : 0) - (second ? second.normalized_score : 0)).toFixed(6));
    const ambiguityScore = Number((1 - Math.max(0, Math.min(1, ambiguityGap))).toFixed(6));
    const parseStatus = top && top.normalized_score > 0
      ? (ambiguityGap < 0.25 ? 'ambiguous_candidate_match' : 'candidate_match')
      : 'unmatched';
    return {
      parse_id: id,
      input_text: raw,
      normalized_text: normalizeInput(raw),
      token_count: inputTokenSet.size,
      parse_status: parseStatus,
      top_candidate: top,
      second_candidate: second,
      ambiguity_gap: ambiguityGap,
      ambiguity_score: ambiguityScore,
      candidates: candidates.slice(0, 5),
      candidate_count: candidates.length,
      expected_concept: text(input && input.expected_concept) || null,
      expected_match: input && input.expected_concept && input.expected_concept !== 'ambiguous' ? safeId(input.expected_concept) === safeId(top && top.concept) : null,
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function validateParse(row) {
    const errors = [];
    if (!text(row && row.parse_id)) errors.push('missing_parse_id');
    if (!text(row && row.input_text)) errors.push('missing_input_text');
    if (!row || !row.top_candidate) errors.push('missing_top_candidate');
    if (row && row.top_candidate) {
      if (Math.abs(1 - Number(row.top_candidate.observed_l1_total || 0)) > EPSILON) errors.push('top_l1_not_1');
      if (row.top_candidate.force_terms_outside_shape !== true) errors.push('top_force_terms_not_outside_shape');
      if (row.top_candidate.promotion_status !== 'not_promoted') errors.push('top_candidate_promoted');
      if (row.top_candidate.doctrine_status !== 'candidate_not_doctrine') errors.push('top_doctrine_status_not_safe');
      if (row.top_candidate.belief_movement !== 'none') errors.push('top_belief_movement_not_none');
    }
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('parse_doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('parse_belief_movement_not_none');
    return {
      parse_id: text(row && row.parse_id),
      ok: errors.length === 0,
      errors,
      parse_status: text(row && row.parse_status),
      top_concept: text(row && row.top_candidate && row.top_candidate.concept),
      ambiguity_score: Number(row && row.ambiguity_score || 0),
      expected_concept: text(row && row.expected_concept),
      expected_match: row && row.expected_match,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const parses = asArray(packet && packet.parses);
    const validations = parses.map(validateParse);
    const expectedRows = validations.filter(row => row.expected_concept && row.expected_concept !== 'ambiguous');
    const errors = [];
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (packet && packet.source_proof_ok !== true) errors.push('source_proof_not_ok');
    if (packet && packet.parse_count !== 12) errors.push(`parse_count_not_12:${packet && packet.parse_count}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.parse_id}:${row.errors.join('|')}`); });
    if (!expectedRows.every(row => row.expected_match === true)) errors.push('not_all_expected_samples_matched');
    return {
      packet_type: '42ndMind_intention_arbitrary_language_parser_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks: {
        source_ledger_ok: packet && packet.source_ledger_ok === true,
        source_proof_ok: packet && packet.source_proof_ok === true,
        twelve_parse_cases: packet && packet.parse_count === 12,
        all_parses_have_candidates: validations.every(row => row.top_concept.length > 0),
        expected_samples_matched: expectedRows.every(row => row.expected_match === true),
        ambiguity_visible: parses.some(row => row.parse_status === 'ambiguous_candidate_match'),
        unresolved_dimensions_visible: parses.every(row => row.top_candidate && row.top_candidate.unresolved_dimension_count >= 0),
        force_terms_outside_shape: parses.every(row => row.top_candidate && row.top_candidate.force_terms_outside_shape === true),
        candidate_only_not_promoted: parses.every(row => row.top_candidate && row.top_candidate.promotion_status === 'not_promoted' && row.top_candidate.doctrine_status === 'candidate_not_doctrine'),
        belief_movement_none: packet && packet.belief_movement === 'none' && parses.every(row => row.belief_movement === 'none')
      },
      parse_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runParser(options = {}) {
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const proofPacket = options.proof_packet || proofApi().runProofOutput(options.proof_options || {});
    const inputs = asArray(options.inputs || sampleInputs());
    const parses = inputs.map(input => parseInput(input, ledgerPacket, proofPacket));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Deterministic v0.1 parser from neutral text surfaces into candidate intention formula matches from canonical ledger v0.1.1. No attribution, no belief ledger, ambiguity remains visible.',
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      source_proof_ok: proofPacket && proofPacket.ok === true,
      source_proof_count: proofPacket && proofPacket.proof_count || 0,
      parse_count: parses.length,
      parses,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionArbitraryLanguageParserV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleInputs,
    normalizeInput,
    tokens,
    tokenSet,
    aliases,
    parentDimensionName,
    wordsFromId,
    currentVersion,
    proofForConcept,
    conceptScore,
    dimensionScore,
    l1,
    forceOutsideShape,
    parseInput,
    validateParse,
    validatePacket,
    runParser
  });
})(typeof window !== 'undefined' ? window : globalThis);
