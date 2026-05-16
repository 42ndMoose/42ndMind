/* 42ndMind Semantic Basis Refinement Draft Reviewer v0.1
 * Reviews workbench-triaged draft seed entries before any corpus merge.
 *
 * It groups draft candidates by refinement target, applies conservative default
 * review decisions, and exports a clean seed-packet candidate only from kept
 * entries. It does not write source, move belief, or promote doctrine.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_basis_refinement_draft_reviewer_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_basis_refinement_draft_review_report_v0_1';
  const EXPORT_PACKET_TYPE = '42ndMind_semantic_basis_refinement_clean_seed_candidate_v0_1';

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
      draft_review_is_required_before_seed_merge: true,
      kept_entries_are_clean_seed_candidates_not_doctrine: true,
      reviewer_exports_candidate_packet_only: true,
      reviewer_does_not_write_source_files: true,
      reviewer_does_not_promote_doctrine: true,
      reviewer_does_not_move_belief: true,
      unit_total_rule_preserved_for_active_shapes: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_remains_separate_from_shape: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      workbench_triage: !!(global.KernelSemanticBasisRefinementWorkbenchTriageV01 && typeof global.KernelSemanticBasisRefinementWorkbenchTriageV01.loadPlanAndTriage === 'function')
    };
  }

  function defaultDecisionForEntry(entry) {
    const triageType = text(entry && entry.triage_type);
    const operators = asArray(entry && entry.observed_operators);
    const pressures = asArray(entry && entry.observed_pressures);
    const sentence = text(entry && entry.text);
    const target = text(entry && entry.refinement_target);

    if (!sentence) {
      return { decision: 'reject', reason: 'empty_sentence' };
    }
    if (!operators.length && !pressures.length) {
      return { decision: 'rewrite', reason: 'no_observed_operator_or_pressure' };
    }
    if (triageType === 'matched_but_target_alignment_weak') {
      return { decision: 'rewrite', reason: 'weak_target_alignment' };
    }
    if (triageType === 'unmatched_rewrite_or_grammar_gap') {
      return { decision: 'rewrite', reason: 'unmatched_or_grammar_gap' };
    }
    if (triageType === 'high_value_basis_split_candidate') {
      return { decision: 'keep', reason: 'high_value_basis_split_candidate' };
    }
    if (triageType === 'matched_partial_basis_gap_candidate') {
      return { decision: 'keep', reason: 'partial_basis_gap_probe_candidate' };
    }
    if (triageType === 'useful_boundary_probe_candidate') {
      return { decision: 'keep', reason: 'useful_boundary_probe_candidate' };
    }
    if (target && (operators.length || pressures.length)) {
      return { decision: 'keep', reason: 'targeted_matched_candidate' };
    }
    return { decision: 'rewrite', reason: 'default_review_needed' };
  }

  function reviewEntry(entry, override) {
    const base = defaultDecisionForEntry(entry);
    const decision = override && override.decision ? text(override.decision) : base.decision;
    const reason = override && override.reason ? text(override.reason) : base.reason;
    const rewrittenText = override && Object.prototype.hasOwnProperty.call(override, 'rewritten_text') ? text(override.rewritten_text) : '';
    const finalText = decision === 'rewrite' && rewrittenText ? rewrittenText : text(entry && entry.text);
    return {
      review_id: `review_${stableHash(text(entry && entry.entry_id) + finalText + decision)}`,
      source_entry_id: text(entry && entry.entry_id),
      refinement_target: text(entry && entry.refinement_target),
      original_text: text(entry && entry.text),
      final_text: finalText,
      decision,
      reason,
      triage_type: text(entry && entry.triage_type),
      expected_new_dimensions: clone(asArray(entry && entry.expected_new_dimensions)),
      observed_operators: clone(asArray(entry && entry.observed_operators)),
      observed_pressures: clone(asArray(entry && entry.observed_pressures)),
      source_review_status: text(entry && entry.review_status),
      exportable: decision === 'keep',
      belief_movement: 'none'
    };
  }

  function reviewDraftPacket(draftPacket, overridesByEntryId) {
    const overrides = overridesByEntryId || {};
    const entries = asArray(draftPacket && draftPacket.entries);
    const reviews = entries.map(entry => reviewEntry(entry, overrides[text(entry && entry.entry_id)]));
    const summary = summarizeReviews(reviews);
    return {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_draft_packet_type: text(draftPacket && draftPacket.packet_type),
      source_entry_count: entries.length,
      summary,
      grouped_reviews: groupReviewsByTarget(reviews),
      reviews,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function groupReviewsByTarget(reviews) {
    const groups = {};
    asArray(reviews).forEach(row => {
      const target = text(row.refinement_target || 'unknown_target');
      if (!groups[target]) groups[target] = [];
      groups[target].push(row);
    });
    return Object.keys(groups).sort().map(target => ({
      refinement_target: target,
      review_count: groups[target].length,
      decision_counts: countMap(groups[target].map(row => row.decision)),
      reviews: groups[target],
      belief_movement: 'none'
    }));
  }

  function summarizeReviews(reviews) {
    const rows = asArray(reviews);
    const decisionCounts = countMap(rows.map(row => row.decision));
    return {
      draft_entry_count: rows.length,
      kept_entry_count: decisionCounts.keep || 0,
      rewrite_entry_count: decisionCounts.rewrite || 0,
      rejected_entry_count: decisionCounts.reject || 0,
      decision_counts: decisionCounts,
      refinement_target_counts: countMap(rows.map(row => row.refinement_target)),
      exportable_clean_packet: (decisionCounts.keep || 0) > 0,
      active_shape_l1_rule: 'sum_abs_dimensions_equals_1',
      objective_language_claim: 'reviewed_basis_refinement_seed_candidates_not_final_math',
      belief_movement: 'none'
    };
  }

  function exportCleanSeedPacket(reviewReport, options) {
    const opts = options || {};
    const kept = asArray(reviewReport && reviewReport.reviews).filter(row => row.exportable === true && row.decision === 'keep');
    const packetId = text(opts.packet_id || 'semantic_seed_basis_refinement_candidate_v0_1');
    const entries = kept.map((row, index) => ({
      entry_id: `basis_refinement_candidate_${String(index + 1).padStart(3, '0')}_${stableHash(row.final_text)}`,
      text: row.final_text,
      source: 'basis_refinement_draft_reviewer_v0_1',
      refinement_target: row.refinement_target,
      expected_new_dimensions: clone(row.expected_new_dimensions),
      observed_operators: clone(row.observed_operators),
      observed_pressures: clone(row.observed_pressures),
      review_status: 'clean_candidate_requires_final_human_approval',
      belief_movement: 'none'
    }));
    return {
      packet_type: EXPORT_PACKET_TYPE,
      packet_version: VERSION,
      packet_id: packetId,
      created_at: now(),
      entry_count: entries.length,
      entries,
      warning: 'Clean candidate packet only. Add as a real corpus seed only after final human approval and pipeline validation.',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadReviewAndExport(options) {
    if (!modulesAvailable().workbench_triage) throw new Error('KernelSemanticBasisRefinementWorkbenchTriageV01 unavailable');
    const triagePacket = await global.KernelSemanticBasisRefinementWorkbenchTriageV01.loadPlanAndTriage(options || {});
    const reviewReport = reviewDraftPacket(triagePacket.draft_seed_packet, options && options.overrides_by_entry_id);
    const cleanSeedPacket = exportCleanSeedPacket(reviewReport, options || {});
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: triagePacket.ok === true,
      triage_packet: triagePacket,
      review_report: reviewReport,
      clean_seed_packet: cleanSeedPacket,
      summary: reviewReport.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticBasisRefinementDraftReviewerV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE, EXPORT_PACKET_TYPE,
    doctrine, modulesAvailable, defaultDecisionForEntry, reviewEntry,
    reviewDraftPacket, groupReviewsByTarget, summarizeReviews,
    exportCleanSeedPacket, loadReviewAndExport
  });
})(typeof window !== 'undefined' ? window : globalThis);
