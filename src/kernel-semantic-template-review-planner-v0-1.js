/* 42ndMind Semantic Template Review Planner v0.1
 * Ranks compressed semantic-vector templates and generates gated review tasks.
 *
 * Pipeline position:
 * stable mappings -> vector compression -> candidate templates -> review planner
 * -> suggested contrast sentences -> analyzer/corpus extension -> tests.
 *
 * It does not decide truth, infer final intent, move belief, promote doctrine,
 * or patch source. It only proposes review targets.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_template_review_planner_v0_1';

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
      planner_ranks_templates_not_truth: true,
      planner_generates_review_targets_not_doctrine: true,
      planner_requires_contrast_examples_before_reuse: true,
      planner_blocks_auto_expansion_without_tests: true,
      planner_does_not_infer_final_intent: true,
      planner_does_not_move_belief: true,
      planner_does_not_promote_doctrine: true,
      planner_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function pressureNames(template) {
    return unique(text(template && template.pressure_signature).split('|')).filter(Boolean);
  }

  function pressureIndex(ontology) {
    const out = {};
    asArray(ontology && ontology.pressures).forEach(row => {
      if (row && row.pressure) out[text(row.pressure)] = row;
    });
    return out;
  }

  function pressureRows(template, ontology) {
    const index = pressureIndex(ontology);
    return pressureNames(template).map(name => index[name] || { pressure:name, family:'unknown', severity:'unknown', blocks:[], requires:[], allows:[], contrasts:[] });
  }

  function collectFromRows(rows, field) {
    return unique(asArray(rows).flatMap(row => asArray(row[field]))).sort();
  }

  function familiesFor(rows) {
    return unique(asArray(rows).map(row => row.family || 'unknown')).sort();
  }

  const HIGH_RISK_PRESSURES = Object.freeze([
    'closure_pressure',
    'falsity_claim_pressure',
    'contradiction_pressure',
    'authority_transfer_pressure',
    'trust_inflation_pressure',
    'motive_agency_pressure',
    'intent_attribution_pressure',
    'direct_link_evidence_burden',
    'accusation_pressure',
    'reputational_risk_pressure',
    'absence_to_truth_pressure',
    'stigma_pressure',
    'moral_risk_framing_pressure',
    'action_justification_pressure',
    'confidence_inflation_pressure',
    'support_inflation_pressure'
  ]);

  const USEFUL_PRESSURES = Object.freeze([
    'uncertainty_calibration_pressure',
    'evidence_contact_pressure',
    'source_trust_pressure',
    'qualification_pressure',
    'scope_mismatch_pressure',
    'omission_pressure',
    'misleading_pressure',
    'unverified_pressure',
    'partial_evidence_pressure',
    'interpretation_layer_pressure',
    'clarity_reduction_pressure',
    'affective_pressure'
  ]);

  function hasAny(names, list) {
    const set = new Set(asArray(names).map(lower));
    return asArray(list).some(item => set.has(lower(item)));
  }

  function scoreTemplate(template, ontology) {
    const pressures = pressureNames(template);
    const rows = pressureRows(template, ontology);
    const families = familiesFor(rows);
    const highRisk = pressures.filter(p => HIGH_RISK_PRESSURES.map(lower).includes(lower(p)));
    const useful = pressures.filter(p => USEFUL_PRESSURES.map(lower).includes(lower(p)));
    const observationCount = Number(template && template.observation_count) || 0;
    const severityHigh = rows.filter(row => row.severity === 'high').length;
    const blocks = collectFromRows(rows, 'blocks');
    const requires = collectFromRows(rows, 'requires');
    const allows = collectFromRows(rows, 'allows');
    const pressureCount = pressures.length;
    const familyCount = families.length;
    const utility_score = observationCount * 8 + pressureCount * 3 + familyCount * 2 + useful.length * 4 + blocks.length * 0.25 + requires.length * 0.2;
    const risk_score = highRisk.length * 8 + severityHigh * 5 + (hasAny(families, ['accusation','agency','fallacy','rhetoric']) ? 4 : 0);
    const safety_score = Math.max(0, Number((100 - risk_score + Math.min(observationCount, 6) * 3).toFixed(2)));
    const priority_score = Number((utility_score + risk_score).toFixed(2));
    const review_mode = risk_score >= 18 ? 'contrast_first_high_guard' : risk_score >= 8 ? 'bounded_reuse_with_contrasts' : 'safe_template_reuse_review';
    return { pressures, rows, families, blocks, requires, allows, highRisk, useful, observationCount, pressureCount, familyCount, utility_score:Number(utility_score.toFixed(2)), risk_score:Number(risk_score.toFixed(2)), safety_score, priority_score, review_mode };
  }

  function suggestedSentencesFor(template, scored) {
    const p = new Set(scored.pressures.map(lower));
    const f = new Set(scored.families.map(lower));
    const out = [];

    function add(sentence) { if (sentence) out.push(sentence); }

    if (p.has('absence_to_truth_pressure')) {
      add('No one has disproven the allegation, but that does not prove it true.');
      add('The claim remains unresolved because lack of disproof is not proof.');
    }
    if (p.has('intent_attribution_pressure') || p.has('motive_agency_pressure')) {
      add('The critic attributed a motive, but the record only shows an outcome.');
      add('The emails show coordination, while similar timing alone would not prove intent.');
    }
    if (p.has('accusation_pressure') || p.has('reputational_risk_pressure')) {
      add('The accusation names a target but does not provide direct evidence.');
      add('The report alleges misconduct, but the supporting record has not been inspected.');
    }
    if (p.has('misleading_pressure') || p.has('omission_pressure')) {
      add('The claim is misleading because it leaves out the limiting sentence.');
      add('The number is real, but the framing omits the relevant denominator.');
    }
    if (p.has('scope_mismatch_pressure') || p.has('qualification_pressure') || p.has('narrowing_pressure')) {
      add('The dataset covers national totals, while the claim refers to one province.');
      add('The footnote narrows the claim without contradicting it.');
    }
    if (p.has('partial_evidence_pressure')) {
      add('The clip shows part of the exchange, while the transcript includes the qualification.');
      add('The excerpt supports a narrow claim, not the broader accusation.');
    }
    if (p.has('interpretation_layer_pressure')) {
      add('The summary simplifies the record and must be checked against the source document.');
      add('The chart suggests a trend, but the raw data uses a different definition.');
    }
    if (p.has('authority_transfer_pressure') || p.has('source_trust_pressure') || p.has('trust_inflation_pressure')) {
      add('The expert supports the claim, but the evidence chain still needs inspection.');
      add('The official source posted the statement, but posting establishes provenance rather than truth.');
    }
    if (p.has('clarity_reduction_pressure') || p.has('evidence_access_burden')) {
      add('The statement is too vague to identify the exact claim being made.');
      add('The spokesperson used vague language that made the evidence burden unclear.');
    }
    if (p.has('affective_pressure') || p.has('salience_distortion_pressure')) {
      add('The article uses emotionally loaded language, but the underlying evidence remains separate.');
      add('The speech raises outrage before identifying the evidence for the claim.');
    }
    if (p.has('unverified_pressure') || p.has('evidence_gap_pressure')) {
      add('The claim remains unverified after the records search.');
      add('The claim lacks evidence, but no contradictory record has been shown.');
    }
    if (p.has('contradiction_pressure')) {
      add('The transcript contradicts the claim only if both use the same date and scope.');
      add('The record appears to contradict the claim, but the definitions must match first.');
    }
    if (p.has('challenge_pressure')) {
      add('The claim is disputed, but it has not been disproven.');
      add('The audit record challenges part of the claim without settling the full dispute.');
    }
    if (p.has('confidence_inflation_pressure')) {
      add('The statement says the conclusion is obvious, but the evidence still has to be shown.');
      add('Clearly is a confidence marker and does not replace the missing record.');
    }
    if (p.has('ambiguity_pressure')) {
      add('They made the claim, but the referent has not been identified.');
      add('This supports the point only if this refers to the cited document.');
    }

    if (out.length < 2) {
      if (f.has('evidence')) {
        add('The record may support the claim, but the exact passage must be mapped first.');
        add('The source points to evidence, but the scope still needs review.');
      } else if (f.has('source_trust')) {
        add('The source has relevant status, but status does not settle the claim.');
        add('The rating is metadata until the underlying evidence is inspected.');
      } else if (f.has('rhetoric')) {
        add('The sentence uses pressure language that should be separated from evidence.');
        add('The rhetoric raises salience without proving the underlying claim.');
      } else {
        add('The template should be tested with a direct example and a contrast example.');
        add('The template should preserve uncertainty until evidence requirements are met.');
      }
    }

    return unique(out).slice(0, 4);
  }

  function planTemplate(template, ontology, options = {}) {
    const s = scoreTemplate(template, ontology);
    return {
      template_id: text(template && template.template_id),
      pressure_signature: text(template && template.pressure_signature),
      observation_count: s.observationCount,
      priority_score: s.priority_score,
      utility_score: s.utility_score,
      risk_score: s.risk_score,
      safety_score: s.safety_score,
      review_mode: s.review_mode,
      pressures: s.pressures,
      pressure_families: s.families,
      high_risk_pressures: s.highRisk,
      blocked_movements: s.blocks.slice(0, 20),
      required_checks: s.requires.slice(0, 20),
      allowed_movements: s.allows.slice(0, 20),
      suggested_sentences: suggestedSentencesFor(template, s),
      review_steps: [
        'Generate direct and contrast examples from the suggested sentences.',
        'Run examples through the semantic operator workbench.',
        'Export only reviewed seed-candidate entries.',
        'Re-run combiner, distiller, pressure registry, vector compressor, and certificate tests.',
        'Do not promote the template without zero missing pressure definitions and zero overmatch risks.'
      ],
      reuse_status: 'candidate_template_requires_review',
      belief_movement: 'none'
    };
  }

  function planTemplates(vectorSpace, ontology, options = {}) {
    const limit = Math.max(1, Number(options.limit || 8));
    const plans = asArray(vectorSpace && vectorSpace.templates).map(t => planTemplate(t, ontology, options));
    return plans.sort((a,b) => b.priority_score - a.priority_score || b.observation_count - a.observation_count).slice(0, limit);
  }

  function buildPlan(vectorPacket, options = {}) {
    const space = vectorPacket && vectorPacket.vector_space ? vectorPacket.vector_space : vectorPacket;
    const ontology = vectorPacket && vectorPacket.pressure_ontology ? vectorPacket.pressure_ontology : options.ontology;
    const plans = planTemplates(space, ontology, options);
    const suggested = unique(plans.flatMap(p => p.suggested_sentences));
    const highRiskCount = plans.filter(p => p.risk_score >= 18).length;
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      vector_count: space && space.vector_count || 0,
      template_count: space && space.template_count || 0,
      selected_template_count: plans.length,
      high_risk_template_count: highRiskCount,
      suggested_sentence_count: suggested.length,
      selected_templates: plans,
      suggested_sentences: suggested,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadCompressAndPlan(options = {}) {
    if (!global.KernelSemanticVectorCompressorV01 || typeof global.KernelSemanticVectorCompressorV01.loadCombinedAndCompress !== 'function') throw new Error('KernelSemanticVectorCompressorV01 unavailable');
    const vectorPacket = await global.KernelSemanticVectorCompressorV01.loadCombinedAndCompress(options);
    const plan = buildPlan(vectorPacket, options);
    return {
      packet_type: '42ndMind_semantic_template_review_planner_run_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: vectorPacket.ok === true,
      vector_packet: vectorPacket,
      plan,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticTemplateReviewPlannerV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    pressureNames,
    scoreTemplate,
    suggestedSentencesFor,
    planTemplate,
    planTemplates,
    buildPlan,
    loadCompressAndPlan
  });
})(typeof window !== 'undefined' ? window : globalThis);
