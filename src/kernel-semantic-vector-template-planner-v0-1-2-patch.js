/* 42ndMind Semantic Vector Template Planner v0.1.2 patch
 * Refines accusation-risk sentence generation after workbench review.
 * Avoids proof/rating overmatches and abstract reputation phrasing that failed to map.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticVectorTemplatePlannerV01;
  if (!base) throw new Error('KernelSemanticVectorTemplatePlannerV01 unavailable for v0.1.2 patch');

  const VERSION = '0.1.2';
  const PACKET_TYPE = '42ndMind_semantic_vector_template_planner_v0_1_2_patch';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
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
  function pressureSet(signature) { return new Set(base.pressureParts(signature)); }
  function hasAll(set, items) { return asArray(items).every(item => set.has(item)); }

  function doctrine() {
    return Object.assign({}, base.doctrine(), {
      patch_packet_type: PACKET_TYPE,
      patch_version: VERSION,
      patch_refines_accusation_risk_sentences_after_workbench_review: true,
      patch_avoids_proof_rating_overmatches_in_accusation_templates: true,
      patch_avoids_abstract_reputation_only_phrasing: true,
      belief_movement: 'none'
    });
  }

  function ruleForSignature(signature) {
    const s = pressureSet(signature);
    if (hasAll(s, ['accusation_pressure', 'direct_link_evidence_burden', 'evidence_gap_pressure', 'reputational_risk_pressure'])) {
      return {
        group: 'accusation_risk_direct_evidence_gap',
        rationale: 'Serious accusation language carries reputational risk and requires exact accusation, target, and direct evidence before belief movement.',
        safety_rule: 'contrast_first_high_guard',
        sentences: [
          'The post makes a serious accusation without showing a direct evidence link.',
          'The article recklessly accused the official of misconduct without direct evidence.',
          'The report recklessly accused the named target of misconduct without direct evidence.',
          'The claim accuses the person of wrongdoing, but the direct evidence link is still missing.'
        ]
      };
    }
    return base.ruleForSignature(signature);
  }

  function planTemplate(template, options = {}) {
    const sig = text(template && template.pressure_signature);
    const rule = ruleForSignature(sig);
    const risk = base.riskScore(sig);
    const safety = base.safetyScore(sig);
    const highRisk = base.highRiskPressures(sig).length;
    const observations = Number(template && template.observation_count) || 0;
    const priority = Number(((observations * 10) + risk + (highRisk * 4) + (safety / 20)).toFixed(2));
    const maxSentences = Math.max(2, Number(options.sentences_per_template || 4));
    return {
      template_id: text(template && template.template_id),
      pressure_signature: sig,
      observation_count: observations,
      entry_ids: clone(asArray(template && template.entry_ids)),
      operator_names: clone(asArray(template && template.operator_names)),
      pressure_families: clone(asArray(template && template.pressure_families)),
      template_group: rule.group,
      rationale: rule.rationale,
      priority,
      risk_score: risk,
      safety_score: safety,
      safety_rule: rule.safety_rule,
      high_risk_pressures: base.highRiskPressures(sig),
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
      packet_type: '42ndMind_semantic_vector_template_plan_v0_1_2',
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
    return Object.assign({}, base.summarizePlan(plan), {
      packet_version: VERSION,
      patch_packet_type: PACKET_TYPE,
      patch_version: VERSION,
      doctrine: doctrine(),
      belief_movement: 'none'
    });
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

  global.KernelSemanticVectorTemplatePlannerV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PACKET_TYPE,
    doctrine,
    ruleForSignature,
    planTemplate,
    planFromVectorSpace,
    summarizePlan,
    loadCombinedCompressAndPlan
  }));
})(typeof window !== 'undefined' ? window : globalThis);
