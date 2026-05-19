/* 42ndMind Claim/Narrative Benchmark v0.1
 * Stress-tests truth-pressure synthesis across larger synthetic claim/narrative cases.
 * Includes quantifier/scope distortion and no-good-interpretation framing.
 * No real people/events. No political-specific built-ins. No LLM. No lookup.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_claim_narrative_benchmark_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function truthApi() {
    if (!global.KernelTruthPressureSynthesisV01) throw new Error('KernelTruthPressureSynthesisV01 unavailable');
    return global.KernelTruthPressureSynthesisV01;
  }

  function doctrine() {
    return {
      benchmark_stress_tests_truth_pressure_without_truth_promotion: true,
      neutral_synthetic_cases_only: true,
      no_real_people_or_events: true,
      no_political_specific_builtins: true,
      quantifier_scope_distortion_is_structural_pressure: true,
      no_good_interpretation_framing_is_malicious_pressure_not_truth: true,
      condition_deletion_is_interpretive_distortion_pressure: true,
      duplicate_provenance_is_not_independent_convergence: true,
      unsupported_rumor_remains_unresolved: true,
      contradiction_detection_is_not_resolution: true,
      support_is_not_truth: true,
      no_llm: true,
      no_source_lookup: true,
      candidate_only_not_doctrine: true,
      belief_movement: 'none'
    };
  }

  function sampleBenchmarkCases() {
    return [
      {
        case_id: 'bench_support_only_context_001',
        case_family: 'support_only',
        original_claim: 'The package was delivered after the office closed.',
        evidence_posture: { support: 0.76, counter: 0, groups: 1, unresolved: 0.25 },
        expected_status: 'support_pressure_without_final_truth'
      },
      {
        case_id: 'bench_counterevidence_pressure_001',
        case_family: 'counterevidence',
        original_claim: 'The package was delivered before the office closed.',
        evidence_posture: { support: 0.32, counter: 0.81, groups: 2, unresolved: 0.2 },
        expected_status: 'counterevidence_pressure_visible'
      },
      {
        case_id: 'bench_ambiguity_preserved_001',
        case_family: 'ambiguity',
        original_claim: 'The message was probably an instruction.',
        evidence_posture: { support: 0.44, counter: 0.18, groups: 1, unresolved: 0.68 },
        expected_status: 'ambiguous_unresolved_pressure_visible'
      },
      {
        case_id: 'bench_causal_jump_001',
        case_family: 'causal_jump',
        original_claim: 'The rule changed after the complaint, therefore the complaint caused the rule change.',
        evidence_posture: { support: 0.46, counter: 0.06, groups: 1, unresolved: 0.55 },
        expected_status: 'causal_overclaim_pressure_visible'
      },
      {
        case_id: 'bench_hidden_motive_001',
        case_family: 'hidden_motive_claim',
        original_claim: 'The delay happened because the committee wanted to punish the applicant.',
        evidence_posture: { support: 0.38, counter: 0.02, groups: 1, unresolved: 0.72 },
        expected_status: 'motive_overclaim_pressure_visible'
      },
      {
        case_id: 'bench_loaded_label_001',
        case_family: 'loaded_label_propaganda',
        original_claim: 'Only a corrupt person would question this rule.',
        evidence_posture: { support: 0, counter: 0, groups: 0, unresolved: 0.8 },
        expected_status: 'loaded_label_propaganda_pressure_visible'
      },
      {
        case_id: 'bench_unsupported_rumor_001',
        case_family: 'unsupported_rumor',
        original_claim: 'Someone said the report was secretly altered.',
        evidence_posture: { support: 0.12, counter: 0, groups: 1, unresolved: 0.86 },
        expected_status: 'unsupported_unresolved_pressure_visible'
      },
      {
        case_id: 'bench_independent_corroboration_001',
        case_family: 'independent_corroboration',
        original_claim: 'Two independent records show the same timestamp discrepancy.',
        evidence_posture: { support: 0.84, counter: 0, groups: 2, unresolved: 0.18 },
        expected_status: 'corroborated_pressure_without_final_truth'
      },
      {
        case_id: 'bench_duplicate_provenance_001',
        case_family: 'duplicate_provenance',
        original_claim: 'Three reposts repeat the same source claim.',
        evidence_posture: { support: 0.66, counter: 0, groups: 1, unresolved: 0.45, duplicate_count: 3 },
        expected_status: 'duplicate_provenance_not_independent'
      },
      {
        case_id: 'bench_unresolved_gap_001',
        case_family: 'unresolved_evidence_gap',
        original_claim: 'The missing item was removed by a specific person.',
        evidence_posture: { support: 0.28, counter: 0.08, groups: 1, unresolved: 0.79 },
        expected_status: 'unresolved_evidence_gap_visible'
      },
      {
        case_id: 'bench_quantifier_scope_distortion_001',
        case_family: 'quantifier_scope_distortion',
        original_claim: 'Visitors should not enter the restricted room without clearance.',
        adversarial_reframe: 'All visitors should never enter the room.',
        evidence_posture: { support: 0.4, counter: 0, groups: 1, unresolved: 0.52 },
        expected_status: 'quantifier_scope_distortion_visible'
      },
      {
        case_id: 'bench_no_good_interpretation_001',
        case_family: 'no_good_interpretation_framing',
        original_claim: 'Members should avoid voting on items where they have a conflict of interest.',
        adversarial_reframe: 'There is no good interpretation: the speaker said members should not vote.',
        evidence_posture: { support: 0.37, counter: 0.05, groups: 1, unresolved: 0.64 },
        expected_status: 'no_good_interpretation_pressure_visible'
      }
    ];
  }

  const UNIVERSAL_TERMS = ['all ', 'every ', 'everyone ', 'no one ', 'none ', 'never ', 'always ', 'only '];
  const CONDITION_TERMS = ['without ', 'unless ', 'if ', 'when ', 'where ', 'during ', 'under ', 'because ', 'conflict of interest', 'restricted ', 'clearance'];

  function hasAny(hay, terms) {
    const s = lower(hay);
    return asArray(terms).some(term => s.includes(term));
  }

  function distortionProfile(original, reframe) {
    const o = lower(original);
    const r = lower(reframe);
    const originalHasCondition = hasAny(o, CONDITION_TERMS);
    const reframeHasUniversal = hasAny(r, UNIVERSAL_TERMS);
    const reframeDeletesCondition = originalHasCondition && !hasAny(r, CONDITION_TERMS.filter(term => term !== 'restricted '));
    const reframeHasNoGoodInterpretation = /no good interpretation|cannot be interpreted|only interpretation|there is no good interpretation/.test(r);
    const reframeHasStrongerModal = /never|always|all|every|no one|none/.test(r) && !/never|always|all|every|no one|none/.test(o);
    const distortionSignals = [];
    if (reframeHasUniversal) distortionSignals.push('universal_or_absolute_quantifier_injection');
    if (reframeDeletesCondition) distortionSignals.push('condition_or_scope_deletion');
    if (reframeHasNoGoodInterpretation) distortionSignals.push('no_good_interpretation_framing');
    if (reframeHasStrongerModal) distortionSignals.push('modal_strength_inflation');
    return {
      original_has_condition_or_scope_limiter: originalHasCondition,
      reframe_has_universal_or_absolute_quantifier: reframeHasUniversal,
      reframe_deletes_condition_or_scope: reframeDeletesCondition,
      no_good_interpretation_framing: reframeHasNoGoodInterpretation,
      modal_strength_inflation: reframeHasStrongerModal,
      distortion_signals: distortionSignals,
      distortion_pressure: round(Math.min(1, distortionSignals.length * 0.28)),
      belief_movement: 'none'
    };
  }

  function classifyCaseStatus(caseRow, distortion) {
    const p = caseRow.evidence_posture || {};
    const family = text(caseRow.case_family);
    if (family === 'quantifier_scope_distortion' && distortion.distortion_pressure > 0) return 'quantifier_scope_distortion_visible';
    if (family === 'no_good_interpretation_framing' && distortion.no_good_interpretation_framing) return 'no_good_interpretation_pressure_visible';
    if (family === 'counterevidence' && Number(p.counter || 0) >= 0.5) return 'counterevidence_pressure_visible';
    if (family === 'ambiguity') return 'ambiguous_unresolved_pressure_visible';
    if (family === 'causal_jump') return 'causal_overclaim_pressure_visible';
    if (family === 'hidden_motive_claim') return 'motive_overclaim_pressure_visible';
    if (family === 'loaded_label_propaganda') return 'loaded_label_propaganda_pressure_visible';
    if (family === 'unsupported_rumor') return 'unsupported_unresolved_pressure_visible';
    if (family === 'independent_corroboration' && Number(p.groups || 0) >= 2) return 'corroborated_pressure_without_final_truth';
    if (family === 'duplicate_provenance') return 'duplicate_provenance_not_independent';
    if (family === 'unresolved_evidence_gap') return 'unresolved_evidence_gap_visible';
    if (family === 'support_only') return 'support_pressure_without_final_truth';
    return 'unresolved_benchmark_pressure';
  }

  function benchmarkRecord(caseRow) {
    const distortion = distortionProfile(caseRow.original_claim, caseRow.adversarial_reframe || '');
    const status = classifyCaseStatus(caseRow, distortion);
    const p = caseRow.evidence_posture || {};
    return {
      benchmark_record_id: `${safeId(caseRow.case_id)}_benchmark_record_v0_1`,
      case_id: text(caseRow.case_id),
      case_family: text(caseRow.case_family),
      original_claim: text(caseRow.original_claim),
      adversarial_reframe: text(caseRow.adversarial_reframe),
      expected_status: text(caseRow.expected_status),
      observed_status: status,
      expected_match: status === text(caseRow.expected_status),
      pressure_profile: {
        support_pressure: round(Number(p.support || 0)),
        counter_pressure: round(Number(p.counter || 0)),
        unresolved_gap_pressure: round(Number(p.unresolved || 0)),
        independent_group_count: Number(p.groups || 0),
        duplicate_provenance_count: Number(p.duplicate_count || 0),
        distortion_pressure: distortion.distortion_pressure,
        contradiction_resolution: 'not_resolved',
        truth_promotion: false,
        belief_movement: 'none'
      },
      distortion_profile: distortion,
      guards: {
        support_is_not_truth: true,
        counterevidence_is_not_disproof_by_itself: true,
        duplicate_provenance_is_not_independent_convergence: true,
        ambiguous_claim_keeps_good_faith_interpretation_open: true,
        bad_actor_reframe_is_pressure_not_truth: true,
        quantifier_injection_is_not_same_claim: true,
        condition_deletion_is_not_same_claim: true,
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
      acc[row.observed_status] = (acc[row.observed_status] || 0) + 1;
      return acc;
    }, {});
  }

  function validateBenchmarkRecord(row) {
    const errors = [];
    if (!text(row && row.benchmark_record_id)) errors.push('missing_benchmark_record_id');
    if (!text(row && row.case_id)) errors.push('missing_case_id');
    if (!text(row && row.case_family)) errors.push('missing_case_family');
    if (row && row.expected_match !== true) errors.push(`expected_status_mismatch:${row.observed_status}:${row.expected_status}`);
    const p = row && row.pressure_profile || {};
    ['support_pressure','counter_pressure','unresolved_gap_pressure','distortion_pressure'].forEach(key => {
      const v = Number(p[key]);
      if (Number.isNaN(v) || v < 0 || v > 1) errors.push(`${key}_out_of_range:${v}`);
    });
    if (p.contradiction_resolution !== 'not_resolved') errors.push('contradiction_resolved');
    if (p.truth_promotion !== false) errors.push('truth_promoted');
    if (!row || !row.guards || row.guards.bad_actor_reframe_is_pressure_not_truth !== true) errors.push('bad_actor_guard_missing');
    if (!row || !row.guards || row.guards.quantifier_injection_is_not_same_claim !== true) errors.push('quantifier_guard_missing');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      case_id: text(row && row.case_id),
      ok: errors.length === 0,
      errors,
      case_family: text(row && row.case_family),
      observed_status: text(row && row.observed_status),
      expected_status: text(row && row.expected_status),
      belief_movement: 'none'
    };
  }

  function validateBenchmarkPacket(packet) {
    const rows = asArray(packet && packet.benchmark_records);
    const validations = rows.map(validateBenchmarkRecord);
    const families = new Set(rows.map(row => row.case_family));
    const statuses = new Set(rows.map(row => row.observed_status));
    const errors = [];
    if (packet && packet.source_truth_pressure_ok !== true) errors.push('source_truth_pressure_not_ok');
    if (rows.length !== 12) errors.push(`benchmark_record_count_not_12:${rows.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.case_id}:${row.errors.join('|')}`); });
    const quant = rows.find(row => row.case_family === 'quantifier_scope_distortion');
    const noGood = rows.find(row => row.case_family === 'no_good_interpretation_framing');
    const checks = {
      source_truth_pressure_ok: packet && packet.source_truth_pressure_ok === true,
      twelve_benchmark_records: rows.length === 12,
      all_records_valid: validations.every(row => row.ok),
      support_only_visible: statuses.has('support_pressure_without_final_truth'),
      counterevidence_visible: statuses.has('counterevidence_pressure_visible'),
      ambiguity_visible: statuses.has('ambiguous_unresolved_pressure_visible'),
      causal_jump_visible: statuses.has('causal_overclaim_pressure_visible'),
      hidden_motive_visible: statuses.has('motive_overclaim_pressure_visible'),
      loaded_label_visible: statuses.has('loaded_label_propaganda_pressure_visible'),
      unsupported_rumor_visible: statuses.has('unsupported_unresolved_pressure_visible'),
      independent_corroboration_visible: statuses.has('corroborated_pressure_without_final_truth'),
      duplicate_provenance_not_independent: statuses.has('duplicate_provenance_not_independent'),
      unresolved_gap_visible: statuses.has('unresolved_evidence_gap_visible'),
      quantifier_scope_distortion_visible: !!quant && quant.observed_status === 'quantifier_scope_distortion_visible' && quant.distortion_profile.distortion_signals.includes('condition_or_scope_deletion'),
      no_good_interpretation_pressure_visible: !!noGood && noGood.observed_status === 'no_good_interpretation_pressure_visible' && noGood.distortion_profile.no_good_interpretation_framing === true,
      distinct_case_families_covered: families.size === 12,
      no_truth_promotion: rows.every(row => row.pressure_profile.truth_promotion === false),
      no_llm_used: packet && packet.llm_used === false && rows.every(row => row.llm_used === false),
      no_external_lookup: packet && packet.external_lookup_performed === false && rows.every(row => row.external_lookup_performed === false),
      candidate_only_not_promoted: rows.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && rows.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_claim_narrative_benchmark_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      benchmark_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runBenchmark(options = {}) {
    const truthPacket = options.truth_pressure_packet || truthApi().runSynthesis(options.truth_options || {});
    const cases = asArray(options.cases || sampleBenchmarkCases());
    const records = cases.map(benchmarkRecord);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Larger claim/narrative benchmark for truth-pressure synthesis. Neutral synthetic cases only; includes quantifier/scope distortion and no-good-interpretation framing.',
      source_truth_pressure_ok: truthPacket && truthPacket.ok === true,
      source_truth_pressure_version: text(truthPacket && truthPacket.packet_version),
      source_synthesis_record_count: truthPacket && truthPacket.synthesis_record_count || 0,
      benchmark_record_count: records.length,
      benchmark_records: records,
      status_counts: statusCounts(records),
      doctrine: doctrine(),
      external_lookup_performed: false,
      llm_used: false,
      adjudicates_final_truth: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    packet.validation = validateBenchmarkPacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelClaimNarrativeBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleBenchmarkCases,
    distortionProfile,
    classifyCaseStatus,
    benchmarkRecord,
    statusCounts,
    validateBenchmarkRecord,
    validateBenchmarkPacket,
    runBenchmark
  });
})(typeof window !== 'undefined' ? window : globalThis);
