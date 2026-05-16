/* 42ndMind Semantic Template Validation Runner v0.1
 * Validates planner suggested sentences against the semantic operator workbench.
 *
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_template_validation_runner_v0_1';
  const VALIDATION_PACKET_TYPE = '42ndMind_semantic_template_validation_report_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const value = text(item);
      const key = lower(value);
      if (value && !seen.has(key)) { seen.add(key); out.push(value); }
    });
    return out;
  }
  function operatorName(signature) { return text(signature).split('(')[0].trim() || text(signature); }
  function pressureParts(signature) { return unique(text(signature).split(/\s*[|+]+\s*/).map(text).filter(Boolean)).sort(); }
  function difference(a, b) { const bset = new Set(asArray(b)); return asArray(a).filter(x => !bset.has(x)); }
  function intersection(a, b) { const bset = new Set(asArray(b)); return asArray(a).filter(x => bset.has(x)); }

  function doctrine() {
    return {
      validation_runner_checks_templates_against_workbench_not_truth: true,
      suggested_sentences_are_candidate_inputs_not_doctrine: true,
      accept_revise_reject_are_review_recommendations_not_belief_movement: true,
      overmatch_and_undermatch_are_diagnostics_not_rejections_by_themselves: true,
      runner_does_not_promote_seed_entries: true,
      runner_does_not_patch_source: true,
      runner_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      planner: !!(global.KernelSemanticVectorTemplatePlannerV01 && typeof global.KernelSemanticVectorTemplatePlannerV01.loadCombinedCompressAndPlan === 'function'),
      workbench: !!(global.KernelSemanticOperatorWorkbenchV01 && typeof global.KernelSemanticOperatorWorkbenchV01.analyzeSentence === 'function'),
      draft_entries: !!(global.KernelSemanticOperatorWorkbenchV01 && typeof global.KernelSemanticOperatorWorkbenchV01.draftEntries === 'function')
    };
  }

  function casesFromPlan(plan) {
    const cases = [];
    asArray(plan && plan.selected_templates).forEach((template, template_index) => {
      const expectedPressures = pressureParts(template.pressure_signature);
      asArray(template.suggested_sentences).forEach((sentence, sentence_index) => {
        cases.push({
          sentence: text(sentence),
          template_id: text(template.template_id),
          template_index,
          sentence_index,
          expected_template_group: text(template.template_group),
          expected_pressure_signature: text(template.pressure_signature),
          expected_pressures: expectedPressures,
          expected_operator_names: unique(asArray(template.operator_names).map(operatorName)),
          high_risk_pressures: clone(asArray(template.high_risk_pressures)),
          safety_rule: text(template.safety_rule),
          source_priority: Number(template.priority) || 0
        });
      });
    });

    const seen = new Set();
    return cases.filter(item => {
      const key = lower(item.sentence);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function analyze(sentence, options = {}) {
    if (!modulesAvailable().workbench) {
      return {
        ok: false,
        reason: 'semantic_operator_workbench_unavailable',
        sentence: text(sentence),
        match_count: 0,
        groups: [],
        actual_operators: [],
        actual_operator_names: [],
        actual_pressures: [],
        belief_movement: 'none'
      };
    }
    const report = global.KernelSemanticOperatorWorkbenchV01.analyzeSentence(sentence, options);
    const matches = asArray(report.matches);
    return {
      ok: report.ok === true,
      sentence: text(sentence),
      match_count: Number(report.match_count) || matches.length,
      groups: unique(asArray(report.groups)),
      actual_operators: unique(matches.map(m => text(m.operator))),
      actual_operator_names: unique(matches.map(m => operatorName(m.operator || m.name))),
      actual_pressures: unique(asArray(report.pressures)).sort(),
      evidence_burden: clone(asArray(report.evidence_burden)),
      legitimacy_guards: clone(asArray(report.legitimacy_guards)),
      contrast_classes: clone(asArray(report.contrast_classes)),
      raw_workbench_report: clone(report),
      belief_movement: 'none'
    };
  }

  function classify(expectedCase, actual, options = {}) {
    const allowedExtraPressures = Number(options.allowed_extra_pressures ?? 0);
    const maxOperators = Number(options.max_operators_per_sentence || 4);
    const expectedPressures = asArray(expectedCase.expected_pressures);
    const actualPressures = asArray(actual.actual_pressures);
    const missingPressures = difference(expectedPressures, actualPressures);
    const extraPressures = difference(actualPressures, expectedPressures);
    const matchedPressures = intersection(expectedPressures, actualPressures);
    const expectedOps = asArray(expectedCase.expected_operator_names);
    const actualOps = asArray(actual.actual_operator_names);
    const matchedOperatorNames = intersection(expectedOps, actualOps);

    const overmatch_flags = [];
    const undermatch_flags = [];
    if (!actual.match_count) undermatch_flags.push('no_workbench_match');
    if (missingPressures.length) undermatch_flags.push('missing_expected_pressures');
    if (extraPressures.length > allowedExtraPressures) overmatch_flags.push('extra_pressures_review_needed');
    if (actual.actual_operators.length > maxOperators) overmatch_flags.push('many_operators_single_sentence');

    let recommendation = 'accept';
    if (!actual.match_count) recommendation = 'reject';
    else if (missingPressures.length) recommendation = 'revise';
    else if (overmatch_flags.length) recommendation = 'revise';
    else if (extraPressures.length) recommendation = 'accept_with_review';

    return {
      recommendation,
      pressure_match_ratio: expectedPressures.length ? Number((matchedPressures.length / expectedPressures.length).toFixed(4)) : 0,
      matched_pressures: matchedPressures,
      missing_pressures: missingPressures,
      extra_pressures: extraPressures,
      matched_operator_names: matchedOperatorNames,
      overmatch_flags,
      undermatch_flags,
      belief_movement: 'none'
    };
  }

  function validateCase(expectedCase, options = {}) {
    const actual = analyze(expectedCase.sentence, options);
    const comparison = classify(expectedCase, actual, options);
    return {
      sentence: expectedCase.sentence,
      expected_template_group: expectedCase.expected_template_group,
      expected_pressure_signature: expectedCase.expected_pressure_signature,
      expected_pressures: clone(expectedCase.expected_pressures),
      expected_operator_names: clone(expectedCase.expected_operator_names),
      actual_template_groups: clone(actual.groups),
      actual_operators: clone(actual.actual_operators),
      actual_operator_names: clone(actual.actual_operator_names),
      actual_pressures: clone(actual.actual_pressures),
      match_count: actual.match_count,
      evidence_burden: clone(actual.evidence_burden),
      legitimacy_guards: clone(actual.legitimacy_guards),
      contrast_classes: clone(actual.contrast_classes),
      comparison,
      recommendation: comparison.recommendation,
      high_risk_pressures: clone(expectedCase.high_risk_pressures),
      safety_rule: expectedCase.safety_rule,
      source_template_id: expectedCase.template_id,
      source_priority: expectedCase.source_priority,
      belief_movement: 'none'
    };
  }

  function summarize(results) {
    const rows = asArray(results);
    const count = rows.length;
    const recommendation_counts = rows.reduce((acc, row) => {
      const key = text(row.recommendation || 'unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const accepted = (recommendation_counts.accept || 0) + (recommendation_counts.accept_with_review || 0);
    return {
      sentence_count: count,
      accept_count: recommendation_counts.accept || 0,
      accept_with_review_count: recommendation_counts.accept_with_review || 0,
      revise_count: recommendation_counts.revise || 0,
      reject_count: recommendation_counts.reject || 0,
      recommendation_counts,
      accepted_or_reviewable_count: accepted,
      accepted_or_reviewable_ratio: count ? Number((accepted / count).toFixed(4)) : 0,
      overmatch_count: rows.filter(row => asArray(row.comparison && row.comparison.overmatch_flags).length > 0).length,
      undermatch_count: rows.filter(row => asArray(row.comparison && row.comparison.undermatch_flags).length > 0).length,
      no_match_count: rows.filter(row => row.match_count === 0).length,
      belief_movement: 'none'
    };
  }

  function validatePlan(plan, options = {}) {
    const cases = casesFromPlan(plan);
    const results = cases.map(item => validateCase(item, options));
    return {
      packet_type: VALIDATION_PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_plan_packet_type: text(plan && plan.packet_type),
      source_plan_version: text(plan && plan.packet_version),
      vector_count: Number(plan && plan.vector_count) || 0,
      template_count: Number(plan && plan.template_count) || 0,
      selected_template_count: Number(plan && plan.selected_template_count) || 0,
      suggested_sentence_count: Number(plan && plan.suggested_sentence_count) || cases.length,
      validation_case_count: cases.length,
      summary: summarize(results),
      results,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadPlanAndValidate(options = {}) {
    if (!modulesAvailable().planner) throw new Error('KernelSemanticVectorTemplatePlannerV01 unavailable');
    const plannerPacket = await global.KernelSemanticVectorTemplatePlannerV01.loadCombinedCompressAndPlan(options);
    const validation = validatePlan(plannerPacket.plan, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: plannerPacket.ok === true,
      planner_packet: plannerPacket,
      validation,
      summary: validation.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function acceptedSentences(validation, options = {}) {
    const includeReview = options.include_accept_with_review !== false;
    return asArray(validation && validation.results).filter(row => row.recommendation === 'accept' || (includeReview && row.recommendation === 'accept_with_review')).map(row => row.sentence);
  }

  function draftAccepted(validation, options = {}) {
    const sentences = acceptedSentences(validation, options);
    if (!modulesAvailable().draft_entries) {
      return { ok:false, reason:'semantic_operator_workbench_draft_entries_unavailable', sentence_count:sentences.length, belief_movement:'none', doctrine:doctrine() };
    }
    const draft = global.KernelSemanticOperatorWorkbenchV01.draftEntries(sentences.join('\n'), Object.assign({}, options, { id_prefix: options.id_prefix || 'validated_template' }));
    return Object.assign({}, draft, {
      packet_type: '42ndMind_semantic_template_validation_draft_candidates_v0_1',
      source_validation_packet_type: VALIDATION_PACKET_TYPE,
      source_sentence_count: sentences.length,
      doctrine: doctrine(),
      belief_movement: 'none'
    });
  }

  global.KernelSemanticTemplateValidationRunnerV01 = Object.freeze({
    VERSION, PACKET_TYPE, VALIDATION_PACKET_TYPE,
    doctrine, modulesAvailable, pressureParts, casesFromPlan, analyze, classify,
    validateCase, summarize, validatePlan, loadPlanAndValidate,
    acceptedSentences, draftAccepted
  });
})(typeof window !== 'undefined' ? window : globalThis);
