/* 42ndMind Semantic Basis Refinement Seed Planner v0.1
 * Converts canonical relation triage into targeted seed-sentence candidates.
 *
 * Purpose: split false equivalences, probe subset relations, and test contrast
 * boundaries before changing the pressure/basis model.
 *
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_basis_refinement_seed_planner_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_basis_refinement_seed_plan_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
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
  function stableHash(value) {
    let h = 0;
    const s = text(value);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36).slice(0, 8);
  }

  function doctrine() {
    return {
      basis_refinement_sentences_are_candidates_not_seed_entries: true,
      planner_targets_basis_gaps_not_truth_claims: true,
      vocabulary_collapse_requires_contrast_validation_before_new_dimension: true,
      suggested_dimensions_are_hypotheses_not_doctrine: true,
      unit_total_rule_preserved_for_active_shapes: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_remains_separate_from_shape: true,
      planner_does_not_promote_doctrine: true,
      planner_does_not_patch_source: true,
      planner_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      relation_triage: !!(global.KernelSemanticCanonicalRelationTriageV01 && typeof global.KernelSemanticCanonicalRelationTriageV01.loadProposeAndTriage === 'function'),
      workbench: !!(global.KernelSemanticOperatorWorkbenchV01 && typeof global.KernelSemanticOperatorWorkbenchV01.analyzeSentence === 'function')
    };
  }

  function targetPriority(target) {
    const t = lower(target);
    if (t === 'authority_closure_basis_refinement') return 100;
    if (t === 'coordination_collusion_basis_refinement') return 95;
    if (t === 'accusation_motive_boundary_probe') return 80;
    if (t === 'motive_coordination_subset_probe') return 70;
    if (t === 'equivalence_contrast_probe') return 60;
    if (t.includes('orthogonality')) return 20;
    return 40;
  }

  function targetSpec(target) {
    const t = lower(target);
    if (t === 'authority_closure_basis_refinement') {
      return {
        target_id: 'authority_closure_basis_refinement',
        expected_new_dimensions: ['source_status_dimension', 'claim_closure_dimension', 'evidence_support_requirement_dimension'],
        purpose: 'Split source/status authority from claim closure or settledness.',
        sentence_candidates: [
          'The expert identified the claim, but the record has not settled whether it is true.',
          'The source is qualified, while the conclusion remains unresolved until the evidence is shown.',
          'The claim is settled only when the record supports it, not merely because an expert said it.',
          'The expert status raises inspection priority, but it does not close the question.'
        ],
        expected_contrast: ['expert(source)', 'settled(claim)', 'primary_document(evidence)', 'direct_support_pressure'],
        review_goal: 'The workbench should stop collapsing expert/source-status into settled/claim-closure.'
      };
    }
    if (t === 'coordination_collusion_basis_refinement') {
      return {
        target_id: 'coordination_collusion_basis_refinement',
        expected_new_dimensions: ['covert_agreement_dimension', 'illicit_coordination_dimension', 'neutral_coordination_dimension'],
        purpose: 'Split neutral coordination from covert or illicit collusion.',
        sentence_candidates: [
          'The teams coordinated their schedules openly, but that does not show collusion.',
          'The companies colluded only if a hidden agreement controlled their actions.',
          'Similar timing suggests coordination, while collusion requires evidence of a covert agreement.',
          'The shared plan was public coordination, not secret collusion.'
        ],
        expected_contrast: ['coordinated(actor,event)', 'collusion(actors)', 'direct_link_evidence_burden'],
        review_goal: 'The workbench should separate neutral coordination from covert/illicit agreement.'
      };
    }
    if (t === 'accusation_motive_boundary_probe') {
      return {
        target_id: 'accusation_motive_boundary_probe',
        expected_new_dimensions: ['accusation_target_harm_dimension', 'motive_attribution_dimension', 'direct_burden_shared_dimension'],
        purpose: 'Probe the shared direct-burden dimension between accusation-risk and motive/coordination laws.',
        sentence_candidates: [
          'The critic attributed a motive without accusing the person of misconduct.',
          'The post accused the official of wrongdoing, which creates reputational risk beyond motive speculation.',
          'The timing raises a motive question, but it does not accuse the target of a specific harmful act.',
          'The claim assigns intent and also accuses the person of misconduct, so both burdens must be separated.'
        ],
        expected_contrast: ['reckless_accusation(actor,target,claim)', 'ulterior_motive_attribution(actor,target,motive)', 'reputational_risk_pressure'],
        review_goal: 'The workbench should distinguish motive attribution from accusation-risk while preserving shared evidence burden.'
      };
    }
    if (t === 'motive_coordination_subset_probe') {
      return {
        target_id: 'motive_coordination_subset_probe',
        expected_new_dimensions: ['intent_attribution_superset_dimension', 'coordination_base_dimension'],
        purpose: 'Test whether motive attribution is a true superset of coordination/collusion or whether coordination needs another dimension.',
        sentence_candidates: [
          'The actors coordinated their actions, but the motive behind the coordination is still unknown.',
          'The actors coordinated because they wanted the outcome, so the claim adds intent attribution.',
          'The shared action shows coordination without proving why the actors did it.',
          'The motive claim goes beyond coordination by assigning an internal reason.'
        ],
        expected_contrast: ['coordinated(actor,event)', 'ulterior_motive_attribution(actor,target,motive)', 'intent_attribution_pressure'],
        review_goal: 'The workbench should test whether intent attribution is only present in the superset.'
      };
    }
    return {
      target_id: text(target || 'manual_relation_review'),
      expected_new_dimensions: ['unresolved_basis_dimension'],
      purpose: 'Manual relation review target.',
      sentence_candidates: [],
      expected_contrast: [],
      review_goal: 'Manual review required before generating seed candidates.'
    };
  }

  function groupTriageRows(triageRows) {
    const groups = new Map();
    asArray(triageRows).forEach(row => {
      const target = text(row && row.next_build_target || 'manual_relation_review');
      if (!groups.has(target)) groups.set(target, []);
      groups.get(target).push(row);
    });
    return Array.from(groups.entries()).map(([target, rows]) => ({ target, rows }));
  }

  function buildTargetPlan(group) {
    const target = group.target;
    const spec = targetSpec(target);
    const severityCounts = countMap(asArray(group.rows).map(r => r.severity));
    const priority = targetPriority(target) + ((severityCounts.high || 0) * 5) + ((severityCounts.medium || 0) * 2);
    const sentenceCandidates = unique(spec.sentence_candidates);
    return {
      target_id: spec.target_id,
      priority,
      source_row_count: asArray(group.rows).length,
      severity_counts: severityCounts,
      purpose: spec.purpose,
      expected_new_dimensions: clone(spec.expected_new_dimensions),
      suggested_sentence_count: sentenceCandidates.length,
      suggested_sentences: sentenceCandidates,
      expected_contrast: clone(spec.expected_contrast),
      review_goal: spec.review_goal,
      source_formal_statements: unique(asArray(group.rows).map(r => r.formal_statement)).slice(0, 12),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function planFromTriage(triageReport, options = {}) {
    const rows = asArray(triageReport && triageReport.triage);
    const minPriority = Number(options.min_priority || 50);
    const plans = groupTriageRows(rows).map(buildTargetPlan).filter(plan => plan.priority >= minPriority || plan.suggested_sentence_count > 0).sort((a, b) => b.priority - a.priority || a.target_id.localeCompare(b.target_id));
    const allSentences = unique(plans.flatMap(p => p.suggested_sentences));
    const summary = {
      source_triage_count: rows.length,
      refinement_target_count: plans.length,
      high_priority_refinement_target_count: plans.filter(p => p.priority >= 90).length,
      suggested_sentence_count: allSentences.length,
      expected_new_dimension_count: unique(plans.flatMap(p => p.expected_new_dimensions)).length,
      target_ids: plans.map(p => p.target_id),
      top_target: plans[0] && plans[0].target_id || 'none',
      active_shape_l1_rule: 'sum_abs_dimensions_equals_1',
      objective_language_claim: 'basis_refinement_candidates_not_final_math',
      belief_movement: 'none'
    };
    return {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_triage_packet_type: text(triageReport && triageReport.packet_type),
      source_triage_summary: clone(triageReport && triageReport.summary || {}),
      summary,
      refinement_targets: plans,
      suggested_sentences: allSentences,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function analyzeSentences(sentences) {
    if (!modulesAvailable().workbench) {
      return {
        ok: false,
        reason: 'workbench_unavailable',
        results: [],
        belief_movement: 'none'
      };
    }
    const results = unique(sentences).map(sentence => {
      const report = global.KernelSemanticOperatorWorkbenchV01.analyzeSentence(sentence);
      return {
        sentence,
        match_count: Number(report.match_count) || asArray(report.matches).length,
        operators: unique(asArray(report.matches).map(m => text(m.operator || m.name))),
        pressures: unique(asArray(report.pressures)).sort(),
        groups: unique(asArray(report.groups)),
        workbench_report: clone(report),
        belief_movement: 'none'
      };
    });
    return {
      ok: true,
      sentence_count: results.length,
      matched_count: results.filter(r => r.match_count > 0).length,
      unmatched_count: results.filter(r => r.match_count === 0).length,
      results,
      belief_movement: 'none'
    };
  }

  async function loadTriageAndPlan(options = {}) {
    if (!modulesAvailable().relation_triage) throw new Error('KernelSemanticCanonicalRelationTriageV01 unavailable');
    const triagePacket = await global.KernelSemanticCanonicalRelationTriageV01.loadProposeAndTriage(options);
    const plan = planFromTriage(triagePacket.triage_report, options);
    const validation = options.validate_with_workbench === false ? null : analyzeSentences(plan.suggested_sentences);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: triagePacket.ok === true,
      triage_packet: triagePacket,
      seed_plan: plan,
      workbench_preview: validation,
      summary: plan.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticBasisRefinementSeedPlannerV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE,
    doctrine, modulesAvailable, targetPriority, targetSpec, groupTriageRows,
    buildTargetPlan, planFromTriage, analyzeSentences, loadTriageAndPlan
  });
})(typeof window !== 'undefined' ? window : globalThis);
