/* 42ndMind Semantic Basis Refinement Workbench Triage v0.1
 * Triage targeted basis-refinement seed sentences after workbench preview.
 *
 * It classifies matched/unmatched suggestions and drafts only reviewable seed
 * candidates. It does not add corpus entries, move belief, or promote doctrine.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_basis_refinement_workbench_triage_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_basis_refinement_workbench_triage_report_v0_1';
  const DRAFT_PACKET_TYPE = '42ndMind_semantic_basis_refinement_seed_draft_v0_1';

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
  function hasAny(value, needles) {
    const v = lower(value);
    return asArray(needles).some(n => v.includes(lower(n)));
  }

  function doctrine() {
    return {
      workbench_triage_drafts_seed_candidates_only: true,
      matched_preview_is_not_automatic_seed_acceptance: true,
      unmatched_preview_is_rewrite_or_grammar_gap_signal: true,
      target_alignment_uses_sentence_and_workbench_cues_for_review_not_truth: true,
      unit_total_rule_preserved_for_active_shapes: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_remains_separate_from_shape: true,
      triage_does_not_add_corpus_entries: true,
      triage_does_not_promote_doctrine: true,
      triage_does_not_patch_source: true,
      triage_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      seed_planner: !!(global.KernelSemanticBasisRefinementSeedPlannerV01 && typeof global.KernelSemanticBasisRefinementSeedPlannerV01.loadTriageAndPlan === 'function')
    };
  }

  function targetBySentence(seedPlan) {
    const map = {};
    asArray(seedPlan && seedPlan.refinement_targets).forEach(target => {
      asArray(target.suggested_sentences).forEach(sentence => {
        map[text(sentence)] = target;
      });
    });
    return map;
  }

  function targetAlignment(sentence, targetId, operators, pressures) {
    const s = lower(sentence);
    const op = lower(asArray(operators).join(' '));
    const pr = lower(asArray(pressures).join(' '));
    const all = [s, op, pr].join(' ');

    if (targetId === 'authority_closure_basis_refinement') {
      const sourceCue = hasAny(all, ['expert', 'source', 'qualified', 'authority', 'status']);
      const closureCue = hasAny(all, ['settled', 'close', 'closure', 'conclusion', 'unresolved']);
      const evidenceCue = hasAny(all, ['record', 'evidence', 'supports', 'shown']);
      return { aligned: sourceCue && (closureCue || evidenceCue), cues: { sourceCue, closureCue, evidenceCue } };
    }
    if (targetId === 'coordination_collusion_basis_refinement') {
      const coordinationCue = hasAny(all, ['coordinated', 'coordination', 'shared plan', 'similar timing', 'schedules']);
      const collusionCue = hasAny(all, ['collusion', 'colluded', 'covert', 'hidden', 'secret', 'illicit']);
      const publicCue = hasAny(all, ['openly', 'public']);
      return { aligned: coordinationCue && collusionCue, cues: { coordinationCue, collusionCue, publicCue } };
    }
    if (targetId === 'accusation_motive_boundary_probe') {
      const accusationCue = hasAny(all, ['accused', 'accuses', 'accusing', 'accusation', 'wrongdoing', 'misconduct']);
      const motiveCue = hasAny(all, ['motive', 'intent', 'attributed', 'speculation']);
      const riskCue = hasAny(all, ['reputational', 'harmful act', 'specific harmful act']);
      return { aligned: accusationCue || motiveCue, cues: { accusationCue, motiveCue, riskCue } };
    }
    if (targetId === 'motive_coordination_subset_probe') {
      const coordinationCue = hasAny(all, ['coordinated', 'coordination', 'shared action']);
      const motiveCue = hasAny(all, ['motive', 'wanted', 'why', 'internal reason']);
      return { aligned: coordinationCue && motiveCue, cues: { coordinationCue, motiveCue } };
    }
    return { aligned: false, cues: {} };
  }

  function triagePreviewRow(row, target) {
    const sentence = text(row && row.sentence);
    const targetId = text(target && target.target_id || 'unknown_target');
    const matchCount = Number(row && row.match_count) || 0;
    const operators = unique(row && row.operators);
    const pressures = unique(row && row.pressures);
    const alignment = targetAlignment(sentence, targetId, operators, pressures);

    let triage_type = 'reviewable_matched_candidate';
    let severity = 'low';
    let recommended_action = 'review_for_seed_packet_candidate';
    let draft_candidate = true;
    let rationale = 'The sentence matched the workbench and has enough target cues for review.';

    if (!matchCount) {
      triage_type = 'unmatched_rewrite_or_grammar_gap';
      severity = 'high';
      recommended_action = 'rewrite_sentence_or_add_workbench_grammar_before_seed_use';
      draft_candidate = false;
      rationale = 'The workbench did not match this sentence, so it should not become a seed candidate yet.';
    } else if (!alignment.aligned) {
      triage_type = 'matched_but_target_alignment_weak';
      severity = 'medium';
      recommended_action = 'review_whether_sentence_tests_the_intended_basis_gap';
      draft_candidate = false;
      rationale = 'The workbench matched the sentence, but the sentence does not clearly test the intended refinement target.';
    } else if (targetId === 'authority_closure_basis_refinement' || targetId === 'coordination_collusion_basis_refinement') {
      triage_type = 'high_value_basis_split_candidate';
      severity = 'low';
      recommended_action = 'review_as_priority_seed_candidate';
      draft_candidate = true;
      rationale = 'The sentence targets a high-priority vocabulary collapse and matched the workbench.';
    } else {
      triage_type = 'useful_boundary_probe_candidate';
      severity = 'low';
      recommended_action = 'review_as_boundary_probe_seed_candidate';
      draft_candidate = true;
      rationale = 'The sentence tests a boundary or subset relation and matched the workbench.';
    }

    return {
      triage_id: `wbtriage_${stableHash(sentence + targetId)}`,
      sentence,
      target_id: targetId,
      match_count: matchCount,
      operators,
      pressures,
      target_alignment: alignment,
      triage_type,
      severity,
      recommended_action,
      draft_candidate,
      rationale,
      expected_new_dimensions: clone(asArray(target && target.expected_new_dimensions)),
      review_goal: text(target && target.review_goal),
      belief_movement: 'none'
    };
  }

  function triagePlannerPacket(packet) {
    const seedPlan = packet && packet.seed_plan || {};
    const preview = packet && packet.workbench_preview || {};
    const targetMap = targetBySentence(seedPlan);
    const rows = asArray(preview.results).map(row => triagePreviewRow(row, targetMap[text(row && row.sentence)]));
    const summary = summarize(rows, seedPlan, preview);
    return {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_seed_plan_packet_type: text(seedPlan && seedPlan.packet_type),
      source_seed_plan_summary: clone(seedPlan && seedPlan.summary || {}),
      source_workbench_preview_summary: {
        sentence_count: Number(preview.sentence_count) || asArray(preview.results).length,
        matched_count: Number(preview.matched_count) || 0,
        unmatched_count: Number(preview.unmatched_count) || 0
      },
      summary,
      triage: rows,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function summarize(rows, seedPlan, preview) {
    const r = asArray(rows);
    return {
      sentence_count: r.length,
      matched_count: r.filter(x => x.match_count > 0).length,
      unmatched_count: r.filter(x => x.match_count === 0).length,
      draft_candidate_count: r.filter(x => x.draft_candidate).length,
      rewrite_or_grammar_gap_count: r.filter(x => x.triage_type === 'unmatched_rewrite_or_grammar_gap').length,
      weak_alignment_count: r.filter(x => x.triage_type === 'matched_but_target_alignment_weak').length,
      triage_type_counts: countMap(r.map(x => x.triage_type)),
      target_counts: countMap(r.map(x => x.target_id)),
      active_shape_l1_rule: 'sum_abs_dimensions_equals_1',
      objective_language_claim: 'workbench_triaged_basis_refinement_candidates_not_final_math',
      belief_movement: 'none'
    };
  }

  function draftSeedPacket(triageReport, options = {}) {
    const rows = asArray(triageReport && triageReport.triage).filter(row => row.draft_candidate === true);
    const entries = rows.map((row, index) => ({
      entry_id: `draft_basis_refinement_${String(index + 1).padStart(3, '0')}_${stableHash(row.sentence)}`,
      text: row.sentence,
      source: 'basis_refinement_workbench_triage_v0_1',
      refinement_target: row.target_id,
      expected_new_dimensions: clone(row.expected_new_dimensions),
      observed_operators: clone(row.operators),
      observed_pressures: clone(row.pressures),
      review_status: 'draft_candidate_requires_human_review',
      belief_movement: 'none'
    }));
    return {
      packet_type: DRAFT_PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_triage_packet_type: text(triageReport && triageReport.packet_type),
      entry_count: entries.length,
      entries,
      warning: 'Draft packet only. Do not merge as corpus seed without review and clean validation.',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadPlanAndTriage(options = {}) {
    if (!modulesAvailable().seed_planner) throw new Error('KernelSemanticBasisRefinementSeedPlannerV01 unavailable');
    const plannerPacket = await global.KernelSemanticBasisRefinementSeedPlannerV01.loadTriageAndPlan(Object.assign({}, options, { validate_with_workbench: true }));
    const triageReport = triagePlannerPacket(plannerPacket);
    const draftPacket = draftSeedPacket(triageReport, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: plannerPacket.ok === true,
      planner_packet: plannerPacket,
      triage_report: triageReport,
      draft_seed_packet: draftPacket,
      summary: triageReport.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticBasisRefinementWorkbenchTriageV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE, DRAFT_PACKET_TYPE,
    doctrine, modulesAvailable, targetBySentence, targetAlignment,
    triagePreviewRow, triagePlannerPacket, summarize, draftSeedPacket,
    loadPlanAndTriage
  });
})(typeof window !== 'undefined' ? window : globalThis);
