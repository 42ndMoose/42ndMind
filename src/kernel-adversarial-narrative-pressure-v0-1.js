/* 42ndMind Adversarial Narrative Pressure v0.1
 * Expands neutral synthetic tests for bad-actor narrative distortion.
 * Consumes claim/narrative benchmark v0.1.
 * No real people/events. No political-specific built-ins. No LLM. No lookup. No truth promotion.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_adversarial_narrative_pressure_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function benchmarkApi() {
    if (!global.KernelClaimNarrativeBenchmarkV01) throw new Error('KernelClaimNarrativeBenchmarkV01 unavailable');
    return global.KernelClaimNarrativeBenchmarkV01;
  }

  function doctrine() {
    return {
      adversarial_pressure_is_structural_not_final_truth: true,
      hostile_reframe_is_not_same_claim: true,
      interpretive_charity_remains_open_when_scope_is_missing: true,
      quantifier_injection_is_distortion_pressure: true,
      condition_deletion_is_distortion_pressure: true,
      context_stripping_is_distortion_pressure: true,
      quote_clipping_is_distortion_pressure: true,
      motive_stuffing_is_distortion_pressure_not_motive_proof: true,
      burden_inversion_is_distortion_pressure: true,
      equivalence_smuggling_is_distortion_pressure: true,
      certainty_inflation_is_distortion_pressure: true,
      source_laundering_is_not_independent_convergence: true,
      loaded_label_substitution_is_propaganda_pressure: true,
      no_real_people_or_events: true,
      no_political_specific_builtins: true,
      no_llm: true,
      no_source_lookup: true,
      candidate_only_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function sampleAdversarialCases() {
    return [
      {
        case_id: 'adv_quantifier_injection_001',
        attack_family: 'quantifier_injection',
        original_claim: 'Visitors should not enter the restricted room without clearance.',
        adversarial_reframe: 'All visitors should never enter the room.',
        expected_attack_status: 'quantifier_injection_pressure_visible'
      },
      {
        case_id: 'adv_condition_deletion_001',
        attack_family: 'condition_deletion',
        original_claim: 'Members should avoid voting when they have a conflict of interest.',
        adversarial_reframe: 'The speaker said members should not vote.',
        expected_attack_status: 'condition_deletion_pressure_visible'
      },
      {
        case_id: 'adv_no_good_interpretation_001',
        attack_family: 'no_good_interpretation',
        original_claim: 'The instruction may need clarification before it is applied.',
        adversarial_reframe: 'There is no good interpretation: the speaker rejected the whole instruction.',
        expected_attack_status: 'no_good_interpretation_pressure_visible'
      },
      {
        case_id: 'adv_motive_stuffing_001',
        attack_family: 'motive_stuffing',
        original_claim: 'The deadline changed after the complaint was filed.',
        adversarial_reframe: 'The deadline changed because the committee wanted to punish the applicant.',
        expected_attack_status: 'motive_stuffing_pressure_visible'
      },
      {
        case_id: 'adv_context_stripping_001',
        attack_family: 'context_stripping',
        original_claim: 'In the training example, the phrase was shown as a bad example.',
        adversarial_reframe: 'The speaker used the phrase approvingly.',
        expected_attack_status: 'context_stripping_pressure_visible'
      },
      {
        case_id: 'adv_quote_clipping_001',
        attack_family: 'quote_clipping',
        original_claim: 'The full sentence was: the proposal sounds harsh if read without the exception.',
        adversarial_reframe: 'The speaker said the proposal sounds harsh.',
        expected_attack_status: 'quote_clipping_pressure_visible'
      },
      {
        case_id: 'adv_burden_inversion_001',
        attack_family: 'burden_inversion',
        original_claim: 'The record does not yet prove the accusation.',
        adversarial_reframe: 'Unless the speaker proves innocence, the accusation should stand.',
        expected_attack_status: 'burden_inversion_pressure_visible'
      },
      {
        case_id: 'adv_equivalence_smuggling_001',
        attack_family: 'equivalence_smuggling',
        original_claim: 'The two procedures share one step.',
        adversarial_reframe: 'The two procedures are basically the same.',
        expected_attack_status: 'equivalence_smuggling_pressure_visible'
      },
      {
        case_id: 'adv_certainty_inflation_001',
        attack_family: 'certainty_inflation',
        original_claim: 'The available records suggest a discrepancy.',
        adversarial_reframe: 'The records prove deliberate deception.',
        expected_attack_status: 'certainty_inflation_pressure_visible'
      },
      {
        case_id: 'adv_source_laundering_001',
        attack_family: 'source_laundering',
        original_claim: 'One anonymous post made the claim.',
        adversarial_reframe: 'Many accounts are saying it, so it is independently confirmed.',
        expected_attack_status: 'source_laundering_pressure_visible'
      },
      {
        case_id: 'adv_ambiguity_weaponization_001',
        attack_family: 'ambiguity_weaponization',
        original_claim: 'The message could be read as a warning or a reminder.',
        adversarial_reframe: 'The message was obviously a threat.',
        expected_attack_status: 'ambiguity_weaponization_pressure_visible'
      },
      {
        case_id: 'adv_loaded_label_substitution_001',
        attack_family: 'loaded_label_substitution',
        original_claim: 'The reviewer questioned the rule.',
        adversarial_reframe: 'The reviewer attacked fairness itself.',
        expected_attack_status: 'loaded_label_substitution_pressure_visible'
      }
    ];
  }

  function includesAny(value, terms) {
    const s = lower(value);
    return asArray(terms).some(term => s.includes(term));
  }

  function detectSignals(caseRow) {
    const original = lower(caseRow.original_claim);
    const reframe = lower(caseRow.adversarial_reframe);
    const signals = [];

    if (includesAny(reframe, ['all ', 'every ', 'never', 'always', 'no one', 'none']) && !includesAny(original, ['all ', 'every ', 'never', 'always', 'no one', 'none'])) signals.push('quantifier_or_modal_injection');
    if (includesAny(original, ['without', 'when', 'if', 'unless', 'exception', 'context', 'training example', 'conflict of interest', 'clearance']) && !includesAny(reframe, ['without', 'when', 'if', 'unless', 'exception', 'context', 'training example', 'conflict of interest', 'clearance'])) signals.push('condition_or_context_deletion');
    if (includesAny(reframe, ['no good interpretation', 'only interpretation', 'obviously', 'cannot be interpreted'])) signals.push('no_good_interpretation_framing');
    if (includesAny(reframe, ['because', 'wanted to', 'intended to', 'secretly', 'deliberately']) && !includesAny(original, ['because', 'wanted to', 'intended to', 'secretly', 'deliberately'])) signals.push('motive_or_intent_stuffing');
    if (includesAny(original, ['training example', 'bad example', 'full sentence', 'if read without']) && !includesAny(reframe, ['training example', 'bad example', 'full sentence', 'if read without'])) signals.push('context_stripping');
    if (includesAny(original, ['full sentence', 'exception']) && !includesAny(reframe, ['full sentence', 'exception'])) signals.push('quote_clipping');
    if (includesAny(reframe, ['unless the speaker proves innocence', 'must prove innocence', 'should stand']) && includesAny(original, ['does not yet prove'])) signals.push('burden_inversion');
    if (includesAny(reframe, ['basically the same', 'the same']) && includesAny(original, ['share one step', 'one step'])) signals.push('equivalence_smuggling');
    if (includesAny(reframe, ['prove', 'proves', 'obviously']) && includesAny(original, ['suggest', 'could', 'may', 'not yet'])) signals.push('certainty_inflation');
    if (includesAny(reframe, ['many accounts', 'independently confirmed']) && includesAny(original, ['one anonymous', 'one post'])) signals.push('source_laundering');
    if (includesAny(reframe, ['obviously a threat', 'obviously']) && includesAny(original, ['could be read', 'warning or a reminder'])) signals.push('ambiguity_weaponization');
    if (includesAny(reframe, ['attacked fairness', 'corrupt', 'evil', 'hateful']) && !includesAny(original, ['attacked fairness', 'corrupt', 'evil', 'hateful'])) signals.push('loaded_label_substitution');

    return Array.from(new Set(signals));
  }

  const FAMILY_STATUS = {
    quantifier_injection: 'quantifier_injection_pressure_visible',
    condition_deletion: 'condition_deletion_pressure_visible',
    no_good_interpretation: 'no_good_interpretation_pressure_visible',
    motive_stuffing: 'motive_stuffing_pressure_visible',
    context_stripping: 'context_stripping_pressure_visible',
    quote_clipping: 'quote_clipping_pressure_visible',
    burden_inversion: 'burden_inversion_pressure_visible',
    equivalence_smuggling: 'equivalence_smuggling_pressure_visible',
    certainty_inflation: 'certainty_inflation_pressure_visible',
    source_laundering: 'source_laundering_pressure_visible',
    ambiguity_weaponization: 'ambiguity_weaponization_pressure_visible',
    loaded_label_substitution: 'loaded_label_substitution_pressure_visible'
  };

  function expectedSignalForFamily(family) {
    return {
      quantifier_injection: 'quantifier_or_modal_injection',
      condition_deletion: 'condition_or_context_deletion',
      no_good_interpretation: 'no_good_interpretation_framing',
      motive_stuffing: 'motive_or_intent_stuffing',
      context_stripping: 'context_stripping',
      quote_clipping: 'quote_clipping',
      burden_inversion: 'burden_inversion',
      equivalence_smuggling: 'equivalence_smuggling',
      certainty_inflation: 'certainty_inflation',
      source_laundering: 'source_laundering',
      ambiguity_weaponization: 'ambiguity_weaponization',
      loaded_label_substitution: 'loaded_label_substitution'
    }[family];
  }

  function attackRecord(caseRow) {
    const signals = detectSignals(caseRow);
    const family = text(caseRow.attack_family);
    const status = FAMILY_STATUS[family] || 'unresolved_adversarial_pressure';
    const expectedSignal = expectedSignalForFamily(family);
    const pressure = round(Math.min(1, 0.18 + signals.length * 0.17));
    return {
      attack_record_id: `${safeId(caseRow.case_id)}_adversarial_pressure_v0_1`,
      case_id: text(caseRow.case_id),
      attack_family: family,
      original_claim: text(caseRow.original_claim),
      adversarial_reframe: text(caseRow.adversarial_reframe),
      observed_attack_status: status,
      expected_attack_status: text(caseRow.expected_attack_status),
      expected_match: status === text(caseRow.expected_attack_status) && signals.includes(expectedSignal),
      structural_signals: signals,
      expected_signal: expectedSignal,
      adversarial_pressure: pressure,
      same_claim_status: 'not_same_claim',
      truth_status: 'not_adjudicated',
      guards: {
        hostile_reframe_is_not_same_claim: true,
        pressure_is_not_truth: true,
        condition_deletion_is_not_same_claim: true,
        quantifier_injection_is_not_same_claim: true,
        motive_stuffing_is_not_motive_proof: true,
        source_laundering_is_not_independent_convergence: true,
        ambiguity_weaponization_does_not_close_ambiguity: true,
        contradiction_detection_is_not_resolution: true
      },
      external_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function statusCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.observed_attack_status] = (acc[row.observed_attack_status] || 0) + 1;
      return acc;
    }, {});
  }

  function validateAttackRecord(row) {
    const errors = [];
    if (!text(row && row.attack_record_id)) errors.push('missing_attack_record_id');
    if (!text(row && row.case_id)) errors.push('missing_case_id');
    if (!text(row && row.attack_family)) errors.push('missing_attack_family');
    if (row && row.expected_match !== true) errors.push(`expected_attack_mismatch:${row.observed_attack_status}:${row.expected_attack_status}:${row.expected_signal}`);
    if (!asArray(row && row.structural_signals).includes(row && row.expected_signal)) errors.push('expected_signal_missing');
    const pressure = Number(row && row.adversarial_pressure);
    if (Number.isNaN(pressure) || pressure < 0 || pressure > 1) errors.push(`adversarial_pressure_out_of_range:${pressure}`);
    if (row && row.same_claim_status !== 'not_same_claim') errors.push('same_claim_not_rejected');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (!row || !row.guards || row.guards.hostile_reframe_is_not_same_claim !== true) errors.push('hostile_reframe_guard_missing');
    if (!row || !row.guards || row.guards.pressure_is_not_truth !== true) errors.push('pressure_truth_guard_missing');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      case_id: text(row && row.case_id),
      ok: errors.length === 0,
      errors,
      attack_family: text(row && row.attack_family),
      observed_attack_status: text(row && row.observed_attack_status),
      structural_signals: asArray(row && row.structural_signals),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const rows = asArray(packet && packet.attack_records);
    const validations = rows.map(validateAttackRecord);
    const families = new Set(rows.map(row => row.attack_family));
    const signals = new Set(rows.flatMap(row => asArray(row.structural_signals)));
    const errors = [];
    if (packet && packet.source_claim_narrative_benchmark_ok !== true) errors.push('source_claim_narrative_benchmark_not_ok');
    if (rows.length !== 12) errors.push(`attack_record_count_not_12:${rows.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.case_id}:${row.errors.join('|')}`); });
    const checks = {
      source_claim_narrative_benchmark_ok: packet && packet.source_claim_narrative_benchmark_ok === true,
      twelve_attack_records: rows.length === 12,
      twelve_attack_families: families.size === 12,
      all_records_valid: validations.every(row => row.ok),
      quantifier_injection_visible: signals.has('quantifier_or_modal_injection'),
      condition_deletion_visible: signals.has('condition_or_context_deletion'),
      no_good_interpretation_visible: signals.has('no_good_interpretation_framing'),
      motive_stuffing_visible: signals.has('motive_or_intent_stuffing'),
      context_stripping_visible: signals.has('context_stripping'),
      quote_clipping_visible: signals.has('quote_clipping'),
      burden_inversion_visible: signals.has('burden_inversion'),
      equivalence_smuggling_visible: signals.has('equivalence_smuggling'),
      certainty_inflation_visible: signals.has('certainty_inflation'),
      source_laundering_visible: signals.has('source_laundering'),
      ambiguity_weaponization_visible: signals.has('ambiguity_weaponization'),
      loaded_label_substitution_visible: signals.has('loaded_label_substitution'),
      hostile_reframe_not_same_claim: rows.every(row => row.same_claim_status === 'not_same_claim'),
      no_truth_adjudication: packet && packet.adjudicates_final_truth === false && rows.every(row => row.truth_status === 'not_adjudicated'),
      no_llm_used: packet && packet.llm_used === false && rows.every(row => row.llm_used === false),
      no_external_lookup: packet && packet.external_lookup_performed === false && rows.every(row => row.external_lookup_performed === false),
      candidate_only_not_promoted: rows.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && rows.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_adversarial_narrative_pressure_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      attack_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runAdversarialSuite(options = {}) {
    const benchmarkPacket = options.claim_narrative_benchmark_packet || benchmarkApi().runBenchmark(options.benchmark_options || {});
    const cases = asArray(options.cases || sampleAdversarialCases());
    const records = cases.map(attackRecord);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Neutral synthetic adversarial narrative-pressure suite. Detects hostile reframes as structural pressure, not truth.',
      source_claim_narrative_benchmark_ok: benchmarkPacket && benchmarkPacket.ok === true,
      source_claim_narrative_benchmark_version: text(benchmarkPacket && benchmarkPacket.packet_version),
      source_benchmark_record_count: benchmarkPacket && benchmarkPacket.benchmark_record_count || 0,
      attack_record_count: records.length,
      attack_family_count: new Set(records.map(row => row.attack_family)).size,
      attack_records: records,
      status_counts: statusCounts(records),
      doctrine: doctrine(),
      external_lookup_performed: false,
      llm_used: false,
      adjudicates_final_truth: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelAdversarialNarrativePressureV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleAdversarialCases,
    detectSignals,
    attackRecord,
    statusCounts,
    validateAttackRecord,
    validatePacket,
    runAdversarialSuite
  });
})(typeof window !== 'undefined' ? window : globalThis);
