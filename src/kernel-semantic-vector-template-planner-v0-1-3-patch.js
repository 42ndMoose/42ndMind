/* 42ndMind Semantic Vector Template Planner v0.1.3 patch
 * Adds a natural sentence rule for false-accusation direct-contradiction pressure signatures.
 * Keeps planner outputs as review targets only; no belief movement or doctrine promotion.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticVectorTemplatePlannerV01;
  if (!base) throw new Error('KernelSemanticVectorTemplatePlannerV01 unavailable for v0.1.3 patch');

  const VERSION = '0.1.3';
  const PACKET_TYPE = '42ndMind_semantic_vector_template_planner_v0_1_3_patch';

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
      patch_adds_false_accusation_direct_contradiction_sentences: true,
      patch_avoids_symbolic_fallback_for_false_accusation_template: true,
      belief_movement: 'none'
    });
  }

  function ruleForSignature(signature) {
    const s = pressureSet(signature);
    if (hasAll(s, ['accusation_pressure', 'contradiction_pressure', 'evidence_contact_pressure', 'reputational_risk_pressure'])) {
      return {
        group: 'false_accusation_direct_contradiction',
        rationale: 'False-accusation language carries reputational risk and requires a direct contradictory record before moving from unsupported to false.',
        safety_rule: 'contrast_first_high_guard',
        sentences: [
          'The accusation is false only if the full record directly contradicts the target, action, or date.',
          'The full video contradicts the accusation, but the exact claim still has to match the record.',
          'The payroll record disproves the accusation only if it covers the same time and location.',
          'The claim calls the accusation false, so the contradictory evidence must be identified directly.'
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
      packet_type: '42ndMind_semantic_vector_template_plan_v0_1_3',
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
