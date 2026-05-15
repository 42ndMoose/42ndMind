/* 42ndMind Semantic Contrast Gap Planner v0.1.1 Patch
 * Adds template coverage for remaining source/evidence-layer contrast gaps.
 * The planner still only suggests review batches. It does not decide truth,
 * move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticContrastGapPlannerV01;
  if (!base) return;

  const VERSION = '0.1.1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item); const key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  const EXTRA_TEMPLATES = Object.freeze({
    clip: {
      operator_name: 'clip',
      group: 'evidence_contact',
      priority_hint: 8,
      rationale: 'A clip is partial evidence and must be contrasted with the fuller record before support or contradiction is earned.',
      sentences: [
        'The clip shows only part of the exchange.',
        'The full transcript gives more context than the clip.'
      ]
    },
    summary: {
      operator_name: 'summary',
      group: 'source_trust',
      priority_hint: 8,
      rationale: 'A summary is an interpretation layer and must not replace the underlying record.',
      sentences: [
        'The summary leaves out the qualifying sentence.',
        'The summary simplifies the record but does not quote it directly.'
      ]
    },
    hearsay: {
      operator_name: 'hearsay',
      group: 'source_trust',
      priority_hint: 8,
      rationale: 'Hearsay should preserve distance from primary evidence and lower claim-level confidence.',
      sentences: [
        'The witness heard the claim secondhand.',
        'The source repeated hearsay without seeing the document.'
      ]
    },
    named_source: {
      operator_name: 'named_source',
      group: 'source_trust',
      priority_hint: 7,
      rationale: 'A named source improves accountability but still does not prove the claim without inspectable evidence.',
      sentences: [
        'A named source provided the document.',
        'The named source signed the statement under their real name.'
      ]
    },
    leaked_document: {
      operator_name: 'leaked_document',
      group: 'evidence_contact',
      priority_hint: 7,
      rationale: 'A leaked document may be inspectable evidence, but authenticity and chain of custody still matter.',
      sentences: [
        'The leaked document appears to be an internal memo.',
        'The leaked document must be authenticated before it supports the claim.'
      ]
    },
    evidence_shows: {
      operator_name: 'evidence_shows',
      group: 'evidence_contact',
      priority_hint: 7,
      rationale: 'Evidence-shows language can inflate support unless the exact evidence-to-claim mapping is visible.',
      sentences: [
        'The records show that the payment was approved in March.',
        'The evidence shows a delay, but it does not show intent.'
      ]
    },
    chart: {
      operator_name: 'chart',
      group: 'evidence_contact',
      priority_hint: 6,
      rationale: 'A chart is a representation layer and must be checked against the underlying data and axes.',
      sentences: [
        'The chart shows an increase after the policy changed.',
        'The chart uses a truncated axis that exaggerates the change.'
      ]
    },
    interpretation: {
      operator_name: 'interpretation',
      group: 'source_trust',
      priority_hint: 6,
      rationale: 'Interpretation must be separated from the underlying record.',
      sentences: [
        'The article gives an interpretation of the document.',
        'The interpretation goes beyond what the record states.'
      ]
    },
    secondary_summary: {
      operator_name: 'secondary_summary',
      group: 'source_trust',
      priority_hint: 6,
      rationale: 'Secondary summaries are farther from primary evidence and should preserve source-layer distance.',
      sentences: [
        'A secondary summary described the report without linking the original document.',
        'The secondary summary omits the table used in the original report.'
      ]
    },
    expert_commentary: {
      operator_name: 'expert_commentary',
      group: 'authority_transfer',
      priority_hint: 6,
      rationale: 'Expert commentary is interpretation from an authority; it is not itself the underlying evidence.',
      sentences: [
        'The expert commentary interpreted the dataset as evidence of delay.',
        'The expert commentary should be checked against the raw data.'
      ]
    },
    press_release: {
      operator_name: 'press_release',
      group: 'source_trust',
      priority_hint: 6,
      rationale: 'A press release is official messaging and provenance, not automatic claim truth.',
      sentences: [
        'The press release announced the new deadline.',
        'The press release summarized the policy but did not include the full rule text.'
      ]
    }
  });

  function doctrine() {
    const d = base.doctrine();
    d.patch_version = VERSION;
    d.patch_adds_source_evidence_gap_templates = true;
    d.planner_suggests_review_batches_not_truth = true;
    d.planner_does_not_move_belief = true;
    d.belief_movement = 'none';
    return d;
  }

  const TEMPLATE_BANK = Object.freeze(Object.assign({}, base.TEMPLATE_BANK || {}, EXTRA_TEMPLATES));

  function missingContrastItems(distillation) {
    const missing = (((distillation || {}).compact_report || {}).contrast_coverage || {}).missing || [];
    return asArray(missing).map(item => {
      const name = lower(item.operator_name);
      const template = TEMPLATE_BANK[name] || null;
      return {
        operator_name: item.operator_name,
        mentioned_count: Number(item.mentioned_count || 0),
        examples: clone(asArray(item.examples)),
        known_template: !!template,
        template_group: template ? template.group : 'unknown',
        rationale: template ? template.rationale : 'This contrast class is mentioned by the corpus but has no direct seed example yet.',
        priority_hint: template ? template.priority_hint : 3
      };
    });
  }

  function weakMappingTargets(distillation) { return base.weakMappingTargets(distillation); }

  function rankMissing(missingItems, weakTargets) {
    const weakByName = {};
    asArray(weakTargets).forEach(w => {
      const name = lower(w.operator_name);
      if (!weakByName[name]) weakByName[name] = [];
      weakByName[name].push(w);
    });
    return asArray(missingItems).map(item => {
      const name = lower(item.operator_name);
      const weakHits = weakByName[name] || [];
      const score = (item.mentioned_count * 3) + item.priority_hint + (item.known_template ? 4 : 0) + weakHits.length;
      return Object.assign({}, item, { weak_mapping_count: weakHits.length, score });
    }).sort((a, b) => b.score - a.score || b.mentioned_count - a.mentioned_count || a.operator_name.localeCompare(b.operator_name));
  }

  function chooseTemplates(rankedMissing, options = {}) {
    const maxOperators = Number(options.max_operator_targets || 6);
    const selected = [];
    asArray(rankedMissing).forEach(item => {
      if (selected.length >= maxOperators) return;
      const template = TEMPLATE_BANK[lower(item.operator_name)];
      if (template) selected.push(Object.assign({}, item, { template: clone(template) }));
    });
    return selected;
  }

  function buildSuggestedBatch(selectedTemplates, options = {}) {
    const maxSentences = Number(options.max_sentences || 10);
    const sentences = [];
    asArray(selectedTemplates).forEach(item => {
      asArray(item.template && item.template.sentences).forEach(sentence => {
        if (sentences.length < maxSentences) sentences.push(sentence);
      });
    });
    return unique(sentences).slice(0, maxSentences);
  }

  function batchRationale(selectedTemplates) {
    return asArray(selectedTemplates).map(item => ({
      operator_name: item.operator_name,
      group: item.template_group,
      score: item.score,
      mentioned_count: item.mentioned_count,
      rationale: item.rationale,
      expected_pressure_target: item.template ? item.template.group : 'unknown',
      examples_that_mentioned_gap: clone(asArray(item.examples).slice(0, 3))
    }));
  }

  function planFromDistillation(distillation, options = {}) {
    const missing = missingContrastItems(distillation);
    const weak = weakMappingTargets(distillation);
    const ranked = rankMissing(missing, weak);
    const selected = chooseTemplates(ranked, options);
    const suggestedBatch = buildSuggestedBatch(selected, options);
    const rationale = batchRationale(selected);
    return {
      packet_type: base.PACKET_TYPE,
      packet_version: VERSION,
      patch_packet_type: '42ndMind_semantic_contrast_gap_planner_v0_1_1_patch',
      created_at: now(),
      ok: true,
      decision: suggestedBatch.length ? 'CONTRAST_BATCH_SUGGESTED_FOR_REVIEW' : 'NO_TEMPLATE_BACKED_GAP_BATCH_AVAILABLE',
      source_distiller_packet_type: text(distillation && distillation.packet_type),
      corpus_entry_count: Number((((distillation || {}).compact_report || {}).corpus_entry_count) || 0),
      contrast_gap_count: missing.length,
      ranked_missing_contrasts: ranked,
      selected_operator_targets: selected.map(item => ({ operator_name: item.operator_name, group: item.template_group, score: item.score, mentioned_count: item.mentioned_count, rationale: item.rationale })),
      suggested_batch: {
        packet_type: '42ndMind_semantic_contrast_gap_suggested_batch_v0_1',
        packet_version: VERSION,
        created_at: now(),
        intended_workflow: 'Paste these sentences into semantic-operator-workbench.html and click ANALYZE only before drafting.',
        sentence_count: suggestedBatch.length,
        sentences: suggestedBatch,
        rationale
      },
      weak_mapping_count: weak.length,
      weak_targets_sample: weak.slice(0, 20),
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  async function loadDistillAndPlan(options = {}) {
    if (!global.KernelSemanticLanguageDistillerV01 || typeof global.KernelSemanticLanguageDistillerV01.loadCombinedAndDistill !== 'function') throw new Error('KernelSemanticLanguageDistillerV01 unavailable');
    const distillation = await global.KernelSemanticLanguageDistillerV01.loadCombinedAndDistill(options);
    const plan = planFromDistillation(distillation, options);
    plan.distillation_metrics = {
      entries: distillation.compact_report.corpus_entry_count,
      unique_operators: distillation.compact_report.unique_operator_count,
      unique_pressures: distillation.compact_report.unique_pressure_count,
      stable_mappings: distillation.compact_report.stable_mapping_count,
      weak_mappings: distillation.compact_report.weak_mapping_count,
      contrast_gaps: distillation.compact_report.contrast_missing_count,
      overmatch_risks: distillation.compact_report.overmatch_risk_count
    };
    plan.distillation = distillation;
    return plan;
  }

  function batchText(plan) { return asArray(plan && plan.suggested_batch && plan.suggested_batch.sentences).join('\n'); }

  global.KernelSemanticContrastGapPlannerV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    TEMPLATE_BANK,
    doctrine,
    missingContrastItems,
    weakMappingTargets,
    rankMissing,
    chooseTemplates,
    buildSuggestedBatch,
    batchRationale,
    planFromDistillation,
    loadDistillAndPlan,
    batchText
  }));
})(typeof window !== 'undefined' ? window : globalThis);
