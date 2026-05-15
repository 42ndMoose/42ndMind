/* 42ndMind Semantic Vector Template Planner v0.1
 * Converts compressed semantic vector templates into reviewable seed-sentence plans.
 *
 * stable reviewed corpus -> vector compression -> candidate templates
 * -> suggested contrast sentences for human review.
 *
 * This module does not decide truth, infer final intent, move belief,
 * promote doctrine, or patch source. It generates review targets only.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_vector_template_planner_v0_1';

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

  function doctrine() {
    return {
      planner_generates_review_sentences_not_truth: true,
      templates_are_candidate_reuse_units_not_doctrine: true,
      suggested_sentences_require_workbench_analysis_before_source_commit: true,
      high_risk_templates_require_contrast_examples: true,
      planner_does_not_infer_final_intent: true,
      planner_does_not_move_belief: true,
      planner_does_not_promote_doctrine: true,
      planner_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  const HIGH_RISK_PRESSURE_WEIGHTS = Object.freeze({
    direct_link_evidence_burden: 12,
    motive_agency_pressure: 10,
    intent_attribution_pressure: 10,
    authority_transfer_pressure: 9,
    trust_inflation_pressure: 9,
    closure_pressure: 8,
    contradiction_pressure: 8,
    accusation_pressure: 8,
    reputational_risk_pressure: 8,
    confidence_inflation_pressure: 6,
    support_inflation_pressure: 6,
    affective_pressure: 5,
    salience_distortion_pressure: 5,
    ambiguity_pressure: 4,
    source_trust_pressure: 4,
    interpretation_layer_pressure: 3,
    evidence_contact_pressure: 2,
    uncertainty_calibration_pressure: 1
  });

  function pressureParts(signature) {
    return unique(text(signature).split('|').map(s => s.trim()).filter(Boolean)).sort();
  }

  function pressureSet(signature) {
    return new Set(pressureParts(signature));
  }

  function hasAll(set, items) {
    return asArray(items).every(item => set.has(item));
  }

  function hasAny(set, items) {
    return asArray(items).some(item => set.has(item));
  }

  function riskScore(signature) {
    return pressureParts(signature).reduce((sum, p) => sum + (HIGH_RISK_PRESSURE_WEIGHTS[p] || 2), 0);
  }

  function safetyScore(signature) {
    const risk = riskScore(signature);
    const parts = pressureParts(signature);
    const uncertainty = parts.includes('uncertainty_calibration_pressure') ? 8 : 0;
    const evidence = parts.includes('evidence_contact_pressure') ? 5 : 0;
    const ambiguity = parts.includes('ambiguity_pressure') ? 3 : 0;
    return Math.max(0, Math.min(120, 100 - risk + uncertainty + evidence + ambiguity));
  }

  function highRiskPressures(signature) {
    return pressureParts(signature).filter(p => (HIGH_RISK_PRESSURE_WEIGHTS[p] || 0) >= 8);
  }

  function ruleForSignature(signature) {
    const s = pressureSet(signature);
    if (hasAll(s, ['direct_link_evidence_burden', 'intent_attribution_pressure', 'motive_agency_pressure'])) return {
      group: 'motive_intent_direct_link',
      rationale: 'Intent and hidden motive attribution require direct-link evidence and must not be inferred from outcome alone.',
      safety_rule: 'contrast_first_high_guard',
      sentences: [
        'The critic attributed a motive, but the record only shows an outcome.',
        'The emails show coordination, while similar timing alone would not prove intent.',
        'The official benefited from the result, but benefit alone does not prove motive.',
        'The accusation assigns intent before identifying a direct evidence link.'
      ]
    };
    if (hasAll(s, ['motive_agency_pressure', 'direct_link_evidence_burden'])) return {
      group: 'coordination_direct_link',
      rationale: 'Coordination language needs direct link evidence or a structured pattern strong enough to defeat independent convergence.',
      safety_rule: 'contrast_first_high_guard',
      sentences: [
        'The emails show coordination, while similar timing alone would not prove intent.',
        'The outlets used similar wording, but a common source could explain the overlap.',
        'The companies acted at the same time, but timing alone does not establish collusion.',
        'The shared message suggests coordination only if the control channel is identified.'
      ]
    };
    if (hasAll(s, ['affective_pressure', 'confidence_inflation_pressure', 'salience_distortion_pressure'])) return {
      group: 'rhetoric_affect',
      rationale: 'Affective framing can distort salience and confidence but does not itself support or defeat the underlying claim.',
      safety_rule: 'bounded_reuse_with_contrasts',
      sentences: [
        'The article uses emotionally loaded language, but the underlying evidence remains separate.',
        'The speech raises outrage before identifying the evidence for the claim.',
        'The headline uses moral shock, but the record still has to be inspected.',
        'The wording makes the issue feel urgent without showing whether the claim is true.'
      ]
    };
    if (hasAll(s, ['ambiguity_pressure', 'clarity_reduction_pressure', 'evidence_access_burden'])) return {
      group: 'rhetoric_clarity',
      rationale: 'Vague or obfuscating language blocks exact claim extraction and raises evidence-access burden before belief movement.',
      safety_rule: 'safe_template_reuse_review',
      sentences: [
        'The statement is too vague to identify the exact claim being made.',
        'The spokesperson used vague language that made the evidence burden unclear.',
        'The answer obscures the claim by avoiding the specific actor and action.',
        'The wording compresses several claims together, so each one must be separated first.'
      ]
    };
    if (hasAll(s, ['authority_transfer_pressure', 'source_trust_pressure', 'trust_inflation_pressure'])) return {
      group: 'authority_source_trust',
      rationale: 'Authority or source status can affect trust priors but must not replace the evidence chain.',
      safety_rule: 'contrast_first_high_guard',
      sentences: [
        'The expert supports the claim, but the evidence chain still needs inspection.',
        'The official source posted the statement, but posting establishes provenance rather than truth.',
        'The certified reviewer endorsed the rating, but the review criteria still matter.',
        'The institution published the claim, but publication does not settle the interpretation.'
      ]
    };
    if (hasAll(s, ['authority_transfer_pressure', 'closure_pressure'])) return {
      group: 'authority_closure',
      rationale: 'Authority can create premature closure when role status is treated as conclusion-level proof.',
      safety_rule: 'contrast_first_high_guard',
      sentences: [
        'The expert calls the claim settled, but the supporting evidence still has to be shown.',
        'The certified reviewer rated the claim false, but the rating is not the evidence itself.',
        'The official conclusion closes the question only if the record supports the exact claim.',
        'The authority label should raise inspection priority, not end the analysis.'
      ]
    };
    if (hasAll(s, ['contradiction_pressure', 'direct_support_pressure', 'evidence_contact_pressure'])) return {
      group: 'direct_record_contradiction',
      rationale: 'Direct record contact can create contradiction pressure only after matching claim, date, definition, and scope.',
      safety_rule: 'bounded_reuse_with_contrasts',
      sentences: [
        'The transcript contradicts the claim only if both use the same date and scope.',
        'The record appears to contradict the claim, but the definitions must match first.',
        'The document supports the claim only if the cited passage maps to the same scope.',
        'The quote creates evidence contact, but the full record must still be checked.'
      ]
    };
    if (hasAll(s, ['contradiction_pressure', 'evidence_contact_pressure', 'interpretation_layer_pressure'])) return {
      group: 'interpretation_layer_contradiction',
      rationale: 'Interpretation-layer evidence should be checked against the underlying record before contradiction is earned.',
      safety_rule: 'bounded_reuse_with_contrasts',
      sentences: [
        'The summary simplifies the record and must be checked against the source document.',
        'The chart suggests a trend, but the raw data uses a different definition.',
        'The transcript contradicts the claim only if both use the same date and scope.',
        'The record appears to contradict the claim, but the definitions must match first.'
      ]
    };
    if (hasAll(s, ['challenge_pressure', 'uncertainty_calibration_pressure'])) return {
      group: 'challenge_without_refutation',
      rationale: 'Challenge or dispute pressure should weaken certainty without collapsing into false, debunked, or contradicted.',
      safety_rule: 'bounded_reuse_with_contrasts',
      sentences: [
        'The claim is disputed, but that does not make it false by itself.',
        'The audit challenged the claim without fully refuting it.',
        'The reviewers contested the conclusion, but the exact weakness has to be identified.',
        'A challenge lowers certainty only to the degree that its evidence applies.'
      ]
    };
    if (hasAll(s, ['ambiguity_pressure', 'motive_agency_pressure'])) return {
      group: 'ambiguous_actor_agency',
      rationale: 'Ambiguous actors block strong agency or motive pressure until the referent is resolved.',
      safety_rule: 'bounded_reuse_with_contrasts',
      sentences: [
        'They made the claim, but the referent has not been identified.',
        'They coordinated the message only if they refers to a defined actor group.',
        'Someone pressured the witness, but the actor and mechanism are still unresolved.',
        'This assigns agency before the actor class is clear.'
      ]
    };
    if (hasAll(s, ['ambiguity_pressure'])) return {
      group: 'reference_ambiguity',
      rationale: 'Reference ambiguity prevents strong support or agency movement until the referenced object is resolved.',
      safety_rule: 'safe_template_reuse_review',
      sentences: [
        'They made the claim, but the referent has not been identified.',
        'This supports the point only if this refers to the cited document.',
        'That evidence cannot be evaluated until that is mapped to a specific record.',
        'The claim changes depending on which actor the pronoun refers to.'
      ]
    };
    if (hasAll(s, ['source_trust_pressure', 'authority_transfer_pressure', 'provenance_pressure'])) return {
      group: 'provenance_not_truth',
      rationale: 'Publication or official posting establishes provenance while leaving truth and interpretation unresolved.',
      safety_rule: 'bounded_reuse_with_contrasts',
      sentences: [
        'The official source posted the statement, but posting establishes provenance rather than truth.',
        'The archive proves the statement was published, not that the statement is accurate.',
        'The press release identifies who said it, but the claim still needs evidence.',
        'The source is official, but official status does not settle the interpretation.'
      ]
    };
    if (hasAny(s, ['interpretation_layer_pressure', 'source_trust_pressure']) && hasAny(s, ['evidence_contact_pressure'])) return {
      group: 'interpretation_layer_source_check',
      rationale: 'Summaries, charts, and source presentations compress evidence and must be checked against the underlying record.',
      safety_rule: 'bounded_reuse_with_contrasts',
      sentences: [
        'The summary simplifies the record and must be checked against the source document.',
        'The chart suggests a trend, but the raw data uses a different definition.',
        'The summary leaves out the qualifying sentence.',
        'The visualization may be accurate, but the scale and definitions still need inspection.'
      ]
    };
    if (hasAll(s, ['confidence_inflation_pressure'])) return {
      group: 'confidence_marker_without_record',
      rationale: 'Confidence markers should be stripped before evaluating whether the evidence supports the underlying claim.',
      safety_rule: 'safe_template_reuse_review',
      sentences: [
        'Clearly is a confidence marker and does not replace the missing record.',
        'The statement says the conclusion is obvious, but the evidence still has to be shown.',
        'Obviously raises confidence without adding evidence.',
        'The conclusion remains unsupported after the confidence marker is removed.'
      ]
    };
    return {
      group: 'generic_pressure_signature_review',
      rationale: 'Stable pressure signature can be reused only after examples, contrasts, and overmatch risks are reviewed.',
      safety_rule: 'safe_template_reuse_review',
      sentences: genericSentencesForSignature(signature)
    };
  }

  function genericSentencesForSignature(signature) {
    const parts = pressureParts(signature);
    const joined = parts.join(', ');
    return [
      `This wording triggers ${joined}, so the exact claim must be reviewed before belief movement.`,
      `The pressure signature ${joined} should be treated as a candidate template, not doctrine.`,
      `The claim may fit this template only after its evidence burden is made explicit.`,
      `This semantic pressure pattern needs contrast examples before it can be reused safely.`
    ];
  }

  function scoreTemplate(template) {
    const sig = text(template && template.pressure_signature);
    const observations = Number(template && template.observation_count) || 0;
    const risk = riskScore(sig);
    const safety = safetyScore(sig);
    const highRisk = highRiskPressures(sig).length;
    const priority = Number(((observations * 10) + risk + (highRisk * 4) + (safety / 20)).toFixed(2));
    return { risk, safety, highRisk, priority };
  }

  function planTemplate(template, options = {}) {
    const sig = text(template && template.pressure_signature);
    const rule = ruleForSignature(sig);
    const score = scoreTemplate(template);
    const maxSentences = Math.max(2, Number(options.sentences_per_template || 4));
    return {
      template_id: text(template && template.template_id),
      pressure_signature: sig,
      observation_count: Number(template && template.observation_count) || 0,
      entry_ids: clone(asArray(template && template.entry_ids)),
      operator_names: clone(asArray(template && template.operator_names)),
      pressure_families: clone(asArray(template && template.pressure_families)),
      template_group: rule.group,
      rationale: rule.rationale,
      priority: score.priority,
      risk_score: score.risk,
      safety_score: score.safety,
      safety_rule: rule.safety_rule,
      high_risk_pressures: highRiskPressures(sig),
      suggested_sentences: unique(rule.sentences).slice(0, maxSentences),
      review_requirements: [
        'Analyze suggested sentences in the semantic operator workbench.',
        'Confirm expected operators and pressures.',
        'Check for overmatches and missing contrasts.',
        'Export only after human review and test pass.'
      ],
      belief_movement: 'none'
    };
  }

  function planFromVectorSpace(space, options = {}) {
    const min = Math.max(2, Number(options.min_template_observations || options.min_observations || 2));
    const limit = Math.max(1, Number(options.limit || 10));
    const templates = asArray(space && space.templates).filter(t => (Number(t.observation_count) || 0) >= min);
    const planned = templates.map(t => planTemplate(t, options)).sort((a, b) => b.priority - a.priority || b.observation_count - a.observation_count || a.pressure_signature.localeCompare(b.pressure_signature));
    const selected = planned.slice(0, limit);
    const suggested = unique(selected.flatMap(t => t.suggested_sentences));
    const highRiskTemplates = selected.filter(t => t.high_risk_pressures.length > 0);
    return {
      packet_type: '42ndMind_semantic_vector_template_plan_v0_1',
      packet_version: VERSION,
      created_at: now(),
      vector_count: space && space.vector_count || 0,
      template_count: templates.length,
      selected_template_count: selected.length,
      high_risk_template_count: highRiskTemplates.length,
      suggested_sentence_count: suggested.length,
      selected_templates: selected,
      high_risk_templates: highRiskTemplates.map(t => ({ template_id: t.template_id, pressure_signature: t.pressure_signature, high_risk_pressures: t.high_risk_pressures, safety_rule: t.safety_rule })),
      suggested_sentences: suggested,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function summarizePlan(plan) {
    return {
      packet_type: '42ndMind_semantic_vector_template_plan_summary_v0_1',
      packet_version: VERSION,
      created_at: now(),
      vectors: plan && plan.vector_count || 0,
      templates: plan && plan.template_count || 0,
      selected_templates: plan && plan.selected_template_count || 0,
      high_risk_templates: plan && plan.high_risk_template_count || 0,
      suggested_sentences: plan && plan.suggested_sentence_count || 0,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadCombinedCompressAndPlan(options = {}) {
    if (!global.KernelSemanticVectorCompressorV01 || typeof global.KernelSemanticVectorCompressorV01.loadCombinedAndCompress !== 'function') throw new Error('KernelSemanticVectorCompressorV01 unavailable');
    const compressed = await global.KernelSemanticVectorCompressorV01.loadCombinedAndCompress(options);
    const plan = planFromVectorSpace(compressed.vector_space, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: compressed.ok === true,
      compressed_packet: compressed,
      plan,
      summary: summarizePlan(plan),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticVectorTemplatePlannerV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    pressureParts,
    riskScore,
    safetyScore,
    highRiskPressures,
    ruleForSignature,
    scoreTemplate,
    planTemplate,
    planFromVectorSpace,
    summarizePlan,
    loadCombinedCompressAndPlan
  });
})(typeof window !== 'undefined' ? window : globalThis);
