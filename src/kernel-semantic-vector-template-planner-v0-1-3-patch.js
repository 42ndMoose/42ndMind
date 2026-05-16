/* 42ndMind Semantic Vector Template Planner v0.1.3 patch
 * Adds natural sentence rules for false-accusation direct-contradiction and
 * basis-refinement pressure signatures.
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
  function hasAny(set, items) { return asArray(items).some(item => set.has(item)); }

  function doctrine() {
    return Object.assign({}, base.doctrine(), {
      patch_packet_type: PACKET_TYPE,
      patch_version: VERSION,
      patch_adds_false_accusation_direct_contradiction_sentences: true,
      patch_adds_basis_refinement_sentences: true,
      patch_avoids_symbolic_fallback_for_false_accusation_template: true,
      patch_avoids_symbolic_fallback_for_basis_refinement_templates: true,
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

    if (s.has('covert_agreement_pressure')) {
      return {
        group: 'coordination_collusion_basis_refinement',
        rationale: 'Collusion should not collapse into ordinary coordination; covert agreement or shared control must be identified separately.',
        safety_rule: 'covert_agreement_required_before_collusion_guard',
        sentences: [
          'The teams coordinated their schedules openly, but that does not show collusion.',
          'The companies colluded only if a hidden agreement controlled their actions.',
          'Similar timing suggests coordination, while collusion requires evidence of a covert agreement.',
          'The shared plan was public coordination, not secret collusion.'
        ]
      };
    }

    if (hasAll(s, ['authority_transfer_pressure', 'uncertainty_calibration_pressure'])) {
      return {
        group: 'authority_status_nonclosure_basis_refinement',
        rationale: 'Expert or source status should raise inspection priority without becoming claim closure.',
        safety_rule: 'source_status_not_claim_closure_guard',
        sentences: [
          'The expert identified the claim, but the record has not settled whether it is true.',
          'The source is qualified, while the conclusion remains unresolved until the evidence is shown.',
          'The claim is settled only when the record supports it, not merely because an expert said it.',
          'The expert status raises inspection priority, but it does not close the question.'
        ]
      };
    }

    if (hasAll(s, ['closure_pressure', 'direct_support_pressure', 'evidence_contact_pressure']) && s.has('authority_transfer_pressure')) {
      return {
        group: 'authority_closure_evidence_support_basis_refinement',
        rationale: 'Claim closure requires direct support mapping; expert assertion remains separate source-status pressure.',
        safety_rule: 'record_support_required_for_closure_guard',
        sentences: [
          'The claim is settled only when the record supports it, not merely because an expert said it.',
          'The expert supports the claim, but the evidence chain still needs inspection.',
          'The official conclusion closes the question only if the record supports the exact claim.',
          'The authority label should raise inspection priority, not end the analysis.'
        ]
      };
    }

    if (hasAll(s, ['motive_agency_pressure', 'uncertainty_calibration_pressure']) && !s.has('covert_agreement_pressure')) {
      return {
        group: 'coordination_motive_uncertainty_basis_refinement',
        rationale: 'Coordination can be observed while motive remains unresolved; the why is an additional burden.',
        safety_rule: 'coordination_does_not_settle_motive_guard',
        sentences: [
          'The actors coordinated their actions, but the motive behind the coordination is still unknown.',
          'The shared action shows coordination without proving why the actors did it.',
          'The public coordination identifies a shared action, not an internal reason.',
          'The record can show coordination while leaving motive unresolved.'
        ]
      };
    }

    if (hasAll(s, ['intent_attribution_pressure', 'motive_agency_pressure', 'direct_link_evidence_burden'])) {
      return {
        group: 'motive_intent_direct_link',
        rationale: 'Motive and intent claims require direct-link evidence and should not be inferred from outcome, benefit, or timing alone.',
        safety_rule: 'direct_link_required_for_intent_guard',
        sentences: [
          'The critic attributed a motive, but the record only shows an outcome.',
          'The official benefited from the result, but benefit alone does not prove motive.',
          'The motive claim goes beyond coordination by assigning an internal reason.',
          'The actors coordinated because they wanted the outcome, so the claim adds intent attribution.'
        ]
      };
    }

    if (hasAll(s, ['pattern_similarity_pressure', 'uncertainty_calibration_pressure'])) {
      return {
        group: 'pattern_similarity_coordination_review',
        rationale: 'Similarity or timing can trigger inspection, but it does not prove coordination or collusion without a link mechanism.',
        safety_rule: 'similarity_is_not_collusion_guard',
        sentences: [
          'The outlets used similar wording, but a common source could explain the overlap.',
          'Similar timing may raise a coordination question without proving a shared plan.',
          'The pattern is worth inspecting, but the control channel still has to be identified.',
          'The shared timing is not enough to establish collusion by itself.'
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
