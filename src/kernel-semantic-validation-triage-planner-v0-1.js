/* 42ndMind Semantic Validation Triage Planner v0.1
 * Classifies template validation revise/reject rows into actionable next steps.
 *
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_validation_triage_planner_v0_1';
  const TRIAGE_PACKET_TYPE = '42ndMind_semantic_validation_triage_report_v0_1';

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
  function countMap(items) {
    return asArray(items).reduce((acc, item) => {
      const key = text(item || 'unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
  function includesAny(items, needles) {
    const set = new Set(asArray(items));
    return asArray(needles).some(n => set.has(n));
  }
  function pressureFamily(pressure) {
    const p = text(pressure);
    if (p.includes('authority') || p.includes('source') || p.includes('trust') || p.includes('certification') || p.includes('reviewer') || p.includes('rating')) return 'authority_source_status';
    if (p.includes('accusation') || p.includes('reputational')) return 'accusation_risk';
    if (p.includes('contradiction') || p.includes('falsity')) return 'contradiction_falsity';
    if (p.includes('evidence') || p.includes('support') || p.includes('provenance')) return 'evidence_contact';
    if (p.includes('motive') || p.includes('intent') || p.includes('agency') || p.includes('coordination')) return 'motive_agency';
    if (p.includes('ambiguity') || p.includes('clarity')) return 'clarity_ambiguity';
    if (p.includes('affective') || p.includes('salience') || p.includes('confidence')) return 'rhetoric_affect';
    return 'other';
  }
  function familySet(pressures) { return unique(asArray(pressures).map(pressureFamily)); }

  function doctrine() {
    return {
      triage_classifies_validation_failures_not_truth: true,
      triage_actions_are_recommendations_not_source_edits: true,
      productive_overmatch_can_signal_richer_template_not_failure: true,
      grammar_gap_requires_review_before_rule_patch: true,
      triage_does_not_promote_seed_entries: true,
      triage_does_not_patch_source: true,
      triage_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      validation_runner: !!(global.KernelSemanticTemplateValidationRunnerV01 && typeof global.KernelSemanticTemplateValidationRunnerV01.loadPlanAndValidate === 'function')
    };
  }

  function baseRow(row) {
    const c = row && row.comparison || {};
    const missing = asArray(c.missing_pressures);
    const extra = asArray(c.extra_pressures);
    const expected = asArray(row && row.expected_pressures);
    const actual = asArray(row && row.actual_pressures);
    return { missing, extra, expected, actual, expectedFamilies: familySet(expected), actualFamilies: familySet(actual) };
  }

  function triageRow(row, options = {}) {
    const b = baseRow(row);
    const recommendation = text(row && row.recommendation || 'unknown');
    const matchCount = Number(row && row.match_count) || 0;
    const missingCount = b.missing.length;
    const extraCount = b.extra.length;
    const expectedCount = b.expected.length;
    const actualCount = b.actual.length;
    const missingRatio = expectedCount ? missingCount / expectedCount : 0;
    const actualOps = asArray(row && row.actual_operators);
    const sentence = text(row && row.sentence);

    let triage_type = 'accepted_clean';
    let severity = 'none';
    let recommended_action = 'keep_as_validated_seed_candidate';
    let rationale = 'The workbench matched the expected pressure signature without overmatch or undermatch.';
    let next_build_target = 'seed_candidate_review';
    const tags = [];

    if (recommendation === 'accept_with_review') {
      triage_type = 'accepted_with_review';
      severity = 'low';
      recommended_action = 'keep_but_review_extra_pressure';
      rationale = 'The sentence matched the expected pressures and only added reviewable extra pressures.';
      next_build_target = 'human_review_before_seed_candidate';
      tags.push('reviewable_extra_pressure');
    }

    if (recommendation === 'revise' || recommendation === 'reject') {
      severity = recommendation === 'reject' ? 'high' : 'medium';
      recommended_action = 'revise_sentence_or_template';
      triage_type = 'template_validation_mismatch';
      rationale = 'The workbench output did not cleanly match the planner expected pressure signature.';
      next_build_target = 'template_revision';
    }

    if (!matchCount) {
      triage_type = 'sentence_unmatched_by_workbench';
      severity = 'high';
      recommended_action = 'rewrite_sentence_first_then_consider_grammar_patch';
      rationale = 'The workbench found no operator match, so the sentence cannot be used as a seed without rewrite or grammar review.';
      next_build_target = 'sentence_rewrite_or_grammar_gap_review';
      tags.push('no_workbench_match');
    } else if (missingCount === 0 && extraCount > 0) {
      triage_type = 'productive_overmatch';
      severity = extraCount > 3 ? 'medium' : 'low';
      recommended_action = 'split_or_promote_as_richer_template_after_review';
      rationale = 'The sentence matched all expected pressures but also carried additional semantic pressure. This may be a richer template rather than a bad sentence.';
      next_build_target = 'template_split_or_expected_signature_expansion';
      tags.push('extra_pressure');
    } else if (missingCount > 0 && extraCount === 0) {
      triage_type = missingRatio >= 0.75 ? 'template_expectation_too_broad_or_sentence_too_weak' : 'sentence_missing_expected_pressure';
      severity = missingRatio >= 0.75 ? 'high' : 'medium';
      recommended_action = missingRatio >= 0.75 ? 'narrow_expected_signature_or_rewrite_sentence' : 'rewrite_sentence_to_trigger_missing_pressures';
      rationale = 'The sentence matched the workbench but did not carry all expected pressures.';
      next_build_target = 'template_sentence_revision';
      tags.push('missing_pressure');
    } else if (missingCount > 0 && extraCount > 0) {
      triage_type = 'crossed_template_or_wrong_expected_signature';
      severity = 'high';
      recommended_action = 'compare_expected_signature_against_actual_template_then_split_or_rewrite';
      rationale = 'The sentence missed expected pressures while adding different ones, suggesting the planned wording crossed into another template.';
      next_build_target = 'signature_alignment_review';
      tags.push('missing_pressure', 'extra_pressure');
    }

    if (includesAny(b.expected, ['authority_transfer_pressure', 'closure_pressure']) && includesAny(b.extra, ['source_trust_pressure', 'certification_pressure', 'rating_pressure', 'reviewer_status_pressure', 'trust_inflation_pressure'])) {
      triage_type = 'authority_template_too_narrow';
      recommended_action = 'split_authority_closure_from_source_status_template';
      rationale = 'The wording mixed closure pressure with source-status and rating pressure. It may need separate authority-closure and source-status templates.';
      next_build_target = 'authority_template_split';
      tags.push('authority_source_status_mix');
    }

    if (includesAny(b.expected, ['authority_transfer_pressure', 'certification_pressure', 'rating_pressure', 'reviewer_status_pressure']) && missingCount >= 2 && actualCount <= 3) {
      triage_type = 'expected_authority_bundle_too_broad';
      recommended_action = 'reduce_expected_pressure_signature_or_make_sentence_more_specific';
      rationale = 'The expected authority bundle is larger than what the sentence actually expresses.';
      next_build_target = 'expected_signature_reduction';
      tags.push('authority_bundle_overexpected');
    }

    if (includesAny(b.expected, ['motive_agency_pressure', 'intent_attribution_pressure']) && missingCount > 0 && includesAny(b.extra, ['accusation_pressure', 'evidence_gap_pressure', 'reputational_risk_pressure'])) {
      triage_type = 'motive_template_crossed_into_accusation_risk';
      recommended_action = 'rewrite_without_accusation_language_or_move_to_accusation_template';
      rationale = 'The planned motive sentence triggered accusation-risk pressure instead of the intended motive/intent signature.';
      next_build_target = 'motive_sentence_rewrite';
      tags.push('motive_accusation_collision');
    }

    if (includesAny(b.expected, ['accusation_pressure', 'reputational_risk_pressure']) && includesAny(b.actual, ['contradiction_pressure', 'falsity_claim_pressure']) && missingCount > 0) {
      triage_type = 'false_accusation_grammar_gap_or_template_wording_gap';
      recommended_action = 'add_or_refine_false_accusation_grammar_after_review';
      rationale = 'The workbench detects contradiction/falsity but does not preserve the accusation-risk and reputational-risk pressures expected by the false-accusation template.';
      next_build_target = 'false_accusation_grammar_patch_or_rewording';
      tags.push('false_accusation_gap');
    }

    if (includesAny(b.expected, ['direct_link_evidence_burden']) && includesAny(b.actual, ['uncertainty_calibration_pressure']) && missingCount > 0) {
      triage_type = 'common_source_sentence_softened_direct_link_burden';
      recommended_action = 'decide_whether_common_source_language_should_reduce_direct_link_burden';
      rationale = 'The sentence is doing uncertainty calibration, not direct-link burden. This may be correct and should be modeled explicitly.';
      next_build_target = 'common_source_contrast_rule_review';
      tags.push('uncertainty_common_source');
    }

    return {
      sentence,
      source_recommendation: recommendation,
      triage_type,
      severity,
      recommended_action,
      next_build_target,
      rationale,
      expected_pressure_signature: text(row && row.expected_pressure_signature),
      expected_pressures: clone(b.expected),
      actual_pressures: clone(b.actual),
      missing_pressures: clone(b.missing),
      extra_pressures: clone(b.extra),
      expected_pressure_families: clone(b.expectedFamilies),
      actual_pressure_families: clone(b.actualFamilies),
      actual_operators: clone(actualOps),
      match_count: matchCount,
      tags: unique(tags),
      belief_movement: 'none'
    };
  }

  function summarizeTriage(items) {
    const rows = asArray(items);
    return {
      triage_count: rows.length,
      triage_type_counts: countMap(rows.map(r => r.triage_type)),
      severity_counts: countMap(rows.map(r => r.severity)),
      recommended_action_counts: countMap(rows.map(r => r.recommended_action)),
      next_build_target_counts: countMap(rows.map(r => r.next_build_target)),
      accepted_clean_count: rows.filter(r => r.triage_type === 'accepted_clean').length,
      revise_or_reject_count: rows.filter(r => r.source_recommendation === 'revise' || r.source_recommendation === 'reject').length,
      high_severity_count: rows.filter(r => r.severity === 'high').length,
      belief_movement: 'none'
    };
  }

  function planFromValidation(validation, options = {}) {
    const results = asArray(validation && validation.results);
    const triage = results.map(row => triageRow(row, options));
    const summary = summarizeTriage(triage);
    return {
      packet_type: TRIAGE_PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_validation_packet_type: text(validation && validation.packet_type),
      source_sentence_count: Number(validation && validation.validation_case_count) || results.length,
      source_summary: clone(validation && validation.summary || {}),
      summary,
      triage,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadValidateAndTriage(options = {}) {
    if (!modulesAvailable().validation_runner) throw new Error('KernelSemanticTemplateValidationRunnerV01 unavailable');
    const validationPacket = await global.KernelSemanticTemplateValidationRunnerV01.loadPlanAndValidate(options);
    const triage = planFromValidation(validationPacket.validation, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: validationPacket.ok === true,
      validation_packet: validationPacket,
      triage,
      summary: triage.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticValidationTriagePlannerV01 = Object.freeze({
    VERSION, PACKET_TYPE, TRIAGE_PACKET_TYPE,
    doctrine, modulesAvailable, pressureFamily, familySet,
    triageRow, summarizeTriage, planFromValidation, loadValidateAndTriage
  });
})(typeof window !== 'undefined' ? window : globalThis);
