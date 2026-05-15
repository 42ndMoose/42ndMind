/* 42ndMind Semantic Contrast Gap Planner v0.1
 * Reads the semantic language distiller's contrast gaps and weak mappings,
 * then proposes the next small contrast batch for the operator workbench.
 *
 * This is a bounded self-direction layer: it suggests what examples to review next.
 * It does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_contrast_gap_planner_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item); const key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  const TEMPLATE_BANK = Object.freeze({
    named_actor: {
      operator_name: 'named_actor',
      group: 'reference_ambiguity',
      priority_hint: 9,
      rationale: 'Reference ambiguity needs contrast with a named actor so agency pressure can stop floating on unresolved pronouns.',
      sentences: [
        'Minister Blake approved the talking-points memo.',
        'The audit names Director Hale as the person who approved the change.'
      ]
    },
    institution: {
      operator_name: 'institution',
      group: 'reference_ambiguity',
      priority_hint: 8,
      rationale: 'Actor resolution should distinguish a named person from an institution or office.',
      sentences: [
        'The department issued the revised guidance.',
        'The agency released the corrected table.'
      ]
    },
    unknown_actor: {
      operator_name: 'unknown_actor',
      group: 'reference_ambiguity',
      priority_hint: 8,
      rationale: 'The kernel needs a stable unresolved-actor placeholder that blocks strong agency movement.',
      sentences: [
        'An unknown actor changed the file before publication.',
        'The source of the edit has not been identified.'
      ]
    },
    similar: {
      operator_name: 'similar',
      group: 'motive_agency',
      priority_hint: 10,
      rationale: 'Similarity must remain weaker than coordination or collusion unless direct-link evidence appears.',
      sentences: [
        'Several outlets used similar wording in their headlines.',
        'The posts looked similar, but no shared source has been shown.'
      ]
    },
    same_source: {
      operator_name: 'same_source',
      group: 'motive_agency',
      priority_hint: 9,
      rationale: 'A shared source can explain similarity without proving coordination among downstream actors.',
      sentences: [
        'The outlets used the same press release as their source.',
        'The reports match because they quote the same public briefing.'
      ]
    },
    independent_convergence: {
      operator_name: 'independent_convergence',
      group: 'motive_agency',
      priority_hint: 10,
      rationale: 'Independent convergence is a critical contrast against overclaiming coordination from pattern similarity.',
      sentences: [
        'The outlets reached the same conclusion independently from the same dataset.',
        'The similar recommendations may reflect independent convergence rather than coordination.'
      ]
    },
    found_by_court: {
      operator_name: 'found_by_court',
      group: 'evidence_contact',
      priority_hint: 10,
      rationale: 'The corpus must distinguish a filed allegation from a court finding.',
      sentences: [
        'The court found that the groups coordinated the campaign.',
        'The judge found that the allegation was not proven.'
      ]
    },
    confirmed: {
      operator_name: 'confirmed',
      group: 'closure_dismissal',
      priority_hint: 8,
      rationale: 'Confirmation language can inflate support unless the confirming evidence is inspectable.',
      sentences: [
        'The inspection confirmed that the deadline was extended.',
        'The second dataset confirmed the reported increase.'
      ]
    },
    policy_goal: {
      operator_name: 'policy_goal',
      group: 'motive_agency',
      priority_hint: 6,
      rationale: 'A stated policy goal should be distinguished from a hidden agenda claim.',
      sentences: [
        'The policy goal was to reduce processing delays.',
        'The stated goal of the program was cost control.'
      ]
    },
    incentive: {
      operator_name: 'incentive',
      group: 'motive_agency',
      priority_hint: 6,
      rationale: 'Incentive evidence can support motive pressure without proving intent by itself.',
      sentences: [
        'The contract gave the company a financial incentive to delay reporting.',
        'The funding model created an incentive to inflate the numbers.'
      ]
    },
    observed_effect: {
      operator_name: 'observed_effect',
      group: 'evidence_contact',
      priority_hint: 5,
      rationale: 'Observed effects should not be automatically converted into motive or agenda.',
      sentences: [
        'The observed effect was a delay in publication.',
        'The policy produced a measurable drop in wait times.'
      ]
    },
    settled: {
      operator_name: 'settled',
      group: 'closure_dismissal',
      priority_hint: 7,
      rationale: 'Settled language is closure pressure and needs scope limits.',
      sentences: [
        'The question is settled for this dataset only.',
        'The report treated the dispute as settled.'
      ]
    },
    unresolved_question: {
      operator_name: 'unresolved_question',
      group: 'uncertainty_calibration',
      priority_hint: 7,
      rationale: 'Unresolved questions preserve pressure without closure or collapse.',
      sentences: [
        'The remaining question is whether the same rule applied in April.',
        'One unresolved question is who approved the final version.'
      ]
    },
    qualifies: {
      operator_name: 'qualifies',
      group: 'evidence_contact',
      priority_hint: 6,
      rationale: 'Qualifying evidence should weaken or narrow a claim without becoming contradiction by default.',
      sentences: [
        'The transcript qualifies the claim but does not contradict it.',
        'The footnote narrows the claim to March only.'
      ]
    },
    weakens: {
      operator_name: 'weakens',
      group: 'evidence_contact',
      priority_hint: 6,
      rationale: 'Weakening evidence should be distinguished from falsifying evidence.',
      sentences: [
        'The audit weakens the claim but does not disprove it.',
        'The missing records weaken confidence in the conclusion.'
      ]
    },
    different_scope: {
      operator_name: 'different_scope',
      group: 'evidence_contact',
      priority_hint: 7,
      rationale: 'Different scope explains apparent contradiction without resolving by deletion.',
      sentences: [
        'The transcript refers to a different month than the claim.',
        'The dataset covers national totals, while the claim refers to one province.'
      ]
    }
  });

  function doctrine() {
    return {
      planner_suggests_review_batches_not_truth: true,
      suggested_sentences_are_seed_candidates_not_doctrine: true,
      contrast_gaps_are_research_targets_not_failures: true,
      weak_mappings_are_training_targets_not_bad_outputs: true,
      planner_does_not_move_belief: true,
      planner_does_not_promote_doctrine: true,
      planner_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

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
        priority_hint: template ? template.priority_hint : 4
      };
    });
  }

  function weakMappingTargets(distillation) {
    const weak = (((distillation || {}).compact_report || {}).weak_mappings) || [];
    return asArray(weak).map(item => ({
      operator_name: item.operator_name,
      operator: item.operator,
      pressure: item.pressure,
      count: Number(item.count || 0),
      needed: Number(item.needed || 0),
      entry_ids: clone(asArray(item.entry_ids)),
      examples: clone(asArray(item.examples))
    }));
  }

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
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
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
    if (!global.KernelSemanticLanguageDistillerV01 || typeof global.KernelSemanticLanguageDistillerV01.loadCombinedAndDistill !== 'function') {
      throw new Error('KernelSemanticLanguageDistillerV01 unavailable');
    }
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

  function batchText(plan) {
    return asArray(plan && plan.suggested_batch && plan.suggested_batch.sentences).join('\n');
  }

  global.KernelSemanticContrastGapPlannerV01 = Object.freeze({
    VERSION, PACKET_TYPE, TEMPLATE_BANK,
    doctrine, missingContrastItems, weakMappingTargets, rankMissing, chooseTemplates,
    buildSuggestedBatch, batchRationale, planFromDistillation, loadDistillAndPlan, batchText
  });
})(typeof window !== 'undefined' ? window : globalThis);
