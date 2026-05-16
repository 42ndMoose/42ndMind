/* 42ndMind Semantic Law Invariance Tester v0.1
 * Tests semantic law candidates for objective-language readiness.
 *
 * This does not prove truth. It grades whether a candidate mapping behaves like
 * a repeatable formal invariant across validation, contrast, evidence burden,
 * legitimacy guards, and blocked belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_law_invariance_tester_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_law_invariance_report_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const value = text(item);
      const key = value.toLowerCase();
      if (value && !seen.has(key)) { seen.add(key); out.push(value); }
    });
    return out;
  }
  function countMap(items) {
    return asArray(items).reduce((acc, item) => {
      const key = text(item || 'unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
  function bounded(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function doctrine() {
    return {
      invariance_tests_grade_formal_readiness_not_truth: true,
      objective_language_requires_repeatability_contrast_and_legitimacy_guards: true,
      law_candidate_success_is_not_doctrine_promotion: true,
      contrast_boundaries_are_required_to_prevent_semantic_collapse: true,
      belief_movement_must_remain_none_from_language_alone: true,
      tester_does_not_promote_doctrine: true,
      tester_does_not_patch_source: true,
      tester_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      law_extractor: !!(global.KernelSemanticLawCandidateExtractorV01 && typeof global.KernelSemanticLawCandidateExtractorV01.loadValidateTriageAndExtract === 'function')
    };
  }

  function movementInvariant(law) {
    return text(law && law.belief_movement) === 'none' && text(law && law.allowed_movement) === 'none_from_language_alone' && text(law && law.blocked_movement).includes('blocked');
  }

  function pressureVectorTotal(law) {
    const pressures = asArray(law && law.pressures);
    const norm = Number(law && law.pressure_vector_l1_norm) || 0;
    return pressures.length > 0 && norm === pressures.length;
  }

  function scoreLaw(law, options = {}) {
    const minStrongObservations = Math.max(3, Number(options.min_strong_observations || 4));
    const minProtoObservations = Math.max(2, Number(options.min_proto_observations || 2));
    const observationCount = Number(law && law.observation_count) || 0;
    const evidenceCount = asArray(law && law.evidence_burden).length;
    const guardCount = asArray(law && law.legitimacy_guards).length;
    const contrastCount = asArray(law && law.contrast_classes).length;
    const falsificationCount = asArray(law && law.falsification_tests).length;
    const pressureCount = asArray(law && law.pressures).length;

    const tests = {
      repeatability: observationCount >= minProtoObservations,
      strong_repeatability: observationCount >= minStrongObservations,
      pressure_vector_total: pressureVectorTotal(law),
      evidence_burden_present: evidenceCount > 0,
      legitimacy_guards_present: guardCount > 0,
      contrast_classes_present: contrastCount > 0,
      falsification_tests_present: falsificationCount > 0,
      movement_blocked_from_language_alone: movementInvariant(law),
      nonempty_equation: !!text(law && law.equation),
      nonempty_operator: !!text(law && law.primary_operator),
      nontrivial_pressure_vector: pressureCount >= 2
    };

    const weights = {
      repeatability: 14,
      strong_repeatability: 8,
      pressure_vector_total: 12,
      evidence_burden_present: 12,
      legitimacy_guards_present: 10,
      contrast_classes_present: 14,
      falsification_tests_present: 10,
      movement_blocked_from_language_alone: 10,
      nonempty_equation: 4,
      nonempty_operator: 3,
      nontrivial_pressure_vector: 3
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const earned = Object.keys(tests).reduce((sum, key) => sum + (tests[key] ? weights[key] : 0), 0);
    const readiness_score = Number((earned / totalWeight).toFixed(4));

    let readiness = 'insufficient_candidate';
    if (readiness_score >= 0.88 && tests.strong_repeatability && tests.contrast_classes_present && tests.legitimacy_guards_present) readiness = 'strong_invariant_candidate';
    else if (readiness_score >= 0.72 && tests.repeatability && tests.evidence_burden_present) readiness = 'proto_invariant_candidate';
    else if (readiness_score >= 0.55) readiness = 'weak_formal_candidate';

    const missing = Object.keys(tests).filter(key => !tests[key]);
    const recommended_next_action = readiness === 'strong_invariant_candidate'
      ? 'prepare_for_human_review_as_objective_language_candidate'
      : readiness === 'proto_invariant_candidate'
        ? 'add_contrast_and_repeatability_tests_before_candidate_promotion_review'
        : readiness === 'weak_formal_candidate'
          ? 'add_more_validated_sentences_and_legitimacy_guards'
          : 'do_not_use_as_law_candidate_yet';

    return {
      law_id: text(law && law.id),
      primary_operator: text(law && law.primary_operator),
      equation: text(law && law.equation),
      observation_count: observationCount,
      pressure_count: pressureCount,
      readiness,
      readiness_score,
      tests,
      missing_requirements: missing,
      recommended_next_action,
      objective_language_status: readiness === 'strong_invariant_candidate' ? 'candidate_objective_language_fragment' : 'not_yet_objective_language',
      belief_movement: 'none'
    };
  }

  function rankTests(tests) {
    return asArray(tests).slice().sort((a, b) => b.readiness_score - a.readiness_score || b.observation_count - a.observation_count || a.primary_operator.localeCompare(b.primary_operator));
  }

  function summarize(tests, lawReport) {
    const ranked = rankTests(tests);
    return {
      law_candidate_count: asArray(tests).length,
      strong_invariant_candidate_count: ranked.filter(t => t.readiness === 'strong_invariant_candidate').length,
      proto_invariant_candidate_count: ranked.filter(t => t.readiness === 'proto_invariant_candidate').length,
      weak_formal_candidate_count: ranked.filter(t => t.readiness === 'weak_formal_candidate').length,
      insufficient_candidate_count: ranked.filter(t => t.readiness === 'insufficient_candidate').length,
      readiness_counts: countMap(ranked.map(t => t.readiness)),
      objective_language_fragment_count: ranked.filter(t => t.objective_language_status === 'candidate_objective_language_fragment').length,
      top_candidate: ranked[0] || null,
      contrast_boundary_count: Number(lawReport && lawReport.summary && lawReport.summary.contrast_boundary_count) || asArray(lawReport && lawReport.contrast_boundaries).length,
      accepted_rows: Number(lawReport && lawReport.summary && lawReport.summary.accepted_rows) || 0,
      contested_rows: Number(lawReport && lawReport.summary && lawReport.summary.contested_rows) || 0,
      objective_language_claim: ranked.some(t => t.objective_language_status === 'candidate_objective_language_fragment') ? 'candidate_fragments_detected_not_final_math' : 'no_strong_objective_language_fragment_yet',
      belief_movement: 'none'
    };
  }

  function testLawReport(lawReport, options = {}) {
    const lawCandidates = asArray(lawReport && lawReport.law_candidates);
    const tests = lawCandidates.map(law => scoreLaw(law, options));
    const ranked = rankTests(tests);
    return {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_law_packet_type: text(lawReport && lawReport.packet_type),
      source_law_candidate_count: lawCandidates.length,
      summary: summarize(ranked, lawReport),
      ranked_invariance_tests: ranked,
      contrast_boundaries: clone(asArray(lawReport && lawReport.contrast_boundaries)),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadExtractAndTest(options = {}) {
    if (!modulesAvailable().law_extractor) throw new Error('KernelSemanticLawCandidateExtractorV01 unavailable');
    const lawPacket = await global.KernelSemanticLawCandidateExtractorV01.loadValidateTriageAndExtract(options);
    const invarianceReport = testLawReport(lawPacket.law_report, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: lawPacket.ok === true,
      law_packet: lawPacket,
      invariance_report: invarianceReport,
      summary: invarianceReport.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticLawInvarianceTesterV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE,
    doctrine, modulesAvailable, movementInvariant, pressureVectorTotal,
    scoreLaw, rankTests, summarize, testLawReport, loadExtractAndTest
  });
})(typeof window !== 'undefined' ? window : globalThis);
