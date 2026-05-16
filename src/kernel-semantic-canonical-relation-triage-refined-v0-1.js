/* 42ndMind Refined Semantic Canonical Relation Triage v0.1
 * Triages remaining relation candidates after basis-refinement law extraction.
 *
 * It focuses on remaining equivalence targets after known bad collapses
 * have been split. It does not decide truth, move belief, promote doctrine,
 * or write source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_canonical_relation_triage_refined_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_refined_canonical_relation_triage_report_v0_1';

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
  function hasAll(items, needles) {
    const set = new Set(asArray(items).map(lower));
    return asArray(needles).every(n => set.has(lower(n)));
  }
  function hasAny(items, needles) {
    const set = new Set(asArray(items).map(lower));
    return asArray(needles).some(n => set.has(lower(n)));
  }

  function doctrine() {
    return {
      refined_relation_triage_runs_after_basis_refinement_split: true,
      bad_equivalence_splits_must_remain_split: true,
      remaining_equivalences_become_next_refinement_targets_not_doctrine: true,
      unit_total_principle_allows_small_complete_shapes_to_refine_without_exceeding_one: true,
      early_scope_can_be_complete_one_with_few_dimensions: true,
      mature_scope_remains_one_with_more_dimensions: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_remains_separate_from_shape: true,
      relation_triage_refined_does_not_promote_doctrine: true,
      relation_triage_refined_does_not_patch_source: true,
      relation_triage_refined_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      refined_relation_proposer: !!(global.KernelSemanticCanonicalRelationProposerRefinedV01 && typeof global.KernelSemanticCanonicalRelationProposerRefinedV01.loadRefinedCanonicalizeAndPropose === 'function')
    };
  }

  function classifyRemainingEquivalence(target) {
    const ops = unique(target && target.member_operators);
    const formal = lower(target && target.formal_statement);
    const metadata = asArray(target && target.local_label_metadata);

    if (ops.length === 1) {
      return {
        triage_type: 'self_equivalence_duplicate_consolidation_candidate',
        severity: 'low',
        recommended_action: 'consolidate_duplicate_law_candidates_or_keep_as_same_operator_repetition',
        next_build_target: 'duplicate_law_candidate_consolidation',
        rationale: 'Only one operator appears in this equivalence target. This is probably a duplicate or repeated candidate for the same operator, not a vocabulary collapse.'
      };
    }

    if (hasAll(ops, ['unresolved', 'not_settled', 'not_collusion']) || (hasAny(ops, ['unresolved', 'not_settled', 'not_collusion']) && metadata.includes('uncertainty_calibration_pressure'))) {
      return {
        triage_type: 'status_negation_vocabulary_collapse_needs_role_split',
        severity: 'high',
        recommended_action: 'add_distinguishing_dimensions_between_general_unresolved_claim_closure_and_negated_collusion_status',
        next_build_target: 'uncertainty_status_negation_basis_refinement',
        rationale: 'General unresolved status, claim-closure non-settlement, and negated collusion status all share uncertainty pressure, but they play different formal roles and should not remain one undifferentiated dimension.'
      };
    }

    if (metadata.length <= 1) {
      return {
        triage_type: 'thin_equivalence_needs_contrast_probe',
        severity: 'medium',
        recommended_action: 'add_role_specific_contrast_examples_before_accepting_equivalence',
        next_build_target: 'thin_equivalence_contrast_probe',
        rationale: 'The equivalence is based on a very thin pressure signature. It may be real, but it should be contrast-tested before being accepted as structure.'
      };
    }

    return {
      triage_type: 'remaining_structural_equivalence_review',
      severity: 'medium',
      recommended_action: 'review_for_true_equivalence_or_missing_dimension',
      next_build_target: 'remaining_equivalence_review',
      rationale: 'This remaining equivalence may be genuine structure or a missing dimension. It needs targeted contrast review.'
    };
  }

  function triageRemainingTarget(target) {
    const classification = classifyRemainingEquivalence(target);
    return Object.assign({
      triage_id: `refined_equiv_triage_${stableHash(text(target && target.formal_statement))}`,
      source_candidate_id: text(target && target.candidate_id),
      formal_statement: text(target && target.formal_statement),
      canonical_signature: text(target && target.canonical_signature),
      member_operators: clone(unique(target && target.member_operators)),
      local_label_metadata: clone(asArray(target && target.local_label_metadata)),
      source_review_requirement: text(target && target.review_requirement),
      belief_movement: 'none'
    }, classification);
  }

  function classifyRelationCandidate(candidate) {
    const kind = text(candidate && candidate.relation_kind);
    const statement = lower(candidate && candidate.formal_statement);
    const metadata = asArray(candidate && candidate.local_label_metadata);

    if (kind === 'canonical_equivalence' || kind === 'canonical_equivalence_pair') {
      if (statement.includes('expert') && statement.includes('settled')) {
        return {
          triage_type: 'regression_bad_equivalence_expert_settled',
          severity: 'critical',
          recommended_action: 'block_and_restore_source_status_vs_claim_closure_split',
          next_build_target: 'regression_fix_authority_closure_split',
          rationale: 'This bad equivalence should remain split after basis refinement. Its return indicates regression.'
        };
      }
      if (statement.includes('collusion') && statement.includes('coordinated')) {
        return {
          triage_type: 'regression_bad_equivalence_collusion_coordinated',
          severity: 'critical',
          recommended_action: 'block_and_restore_collusion_vs_coordination_split',
          next_build_target: 'regression_fix_coordination_collusion_split',
          rationale: 'This bad equivalence should remain split after basis refinement. Its return indicates regression.'
        };
      }
      return {
        triage_type: 'remaining_equivalence_candidate',
        severity: 'medium',
        recommended_action: 'review_equivalence_or_generate_split_probe',
        next_build_target: 'remaining_equivalence_review',
        rationale: 'Equivalence remains under the refined basis. Review whether it is genuine or a missing dimension.'
      };
    }

    if (kind === 'canonical_subset' || kind === 'canonical_superset') {
      return {
        triage_type: 'refined_subset_or_enrichment_candidate',
        severity: 'medium',
        recommended_action: 'review_whether_added_dimensions_are_true_enrichment',
        next_build_target: 'refined_subset_enrichment_review',
        rationale: 'Subset structure may be real semantic enrichment or a sign that the smaller law is under-modeled.'
      };
    }

    if (kind === 'canonical_contrast') {
      return {
        triage_type: 'refined_contrast_boundary_candidate',
        severity: 'medium',
        recommended_action: 'preserve_or_test_boundary_with_positive_and_negative_examples',
        next_build_target: 'refined_contrast_boundary_review',
        rationale: 'The relation shares a formal core while diverging into distinct dimensions. It may define a useful boundary.'
      };
    }

    if (kind === 'canonical_orthogonality') {
      return {
        triage_type: 'refined_orthogonality_candidate',
        severity: 'low',
        recommended_action: 'ignore_unless_domain_needs_bridge_examples',
        next_build_target: 'low_priority_refined_orthogonality_review',
        rationale: 'The laws share no anonymous dimensions. This may be true separation or sparse-corpus artifact.'
      };
    }

    return {
      triage_type: 'unclassified_refined_relation_candidate',
      severity: 'medium',
      recommended_action: 'manual_refined_relation_review',
      next_build_target: 'manual_refined_relation_review',
      rationale: 'No refined triage rule exists for this relation kind yet.'
    };
  }

  function triageRelationCandidate(candidate) {
    const classification = classifyRelationCandidate(candidate);
    return Object.assign({
      triage_id: `refined_relation_triage_${stableHash(text(candidate && candidate.candidate_id) + text(candidate && candidate.formal_statement))}`,
      source_candidate_id: text(candidate && candidate.candidate_id),
      relation_kind: text(candidate && candidate.relation_kind),
      formal_statement: text(candidate && candidate.formal_statement),
      local_label_metadata: clone(asArray(candidate && candidate.local_label_metadata)),
      source_review_requirement: text(candidate && candidate.review_requirement),
      belief_movement: 'none'
    }, classification);
  }

  function summarize(relationRows, remainingRows, refinedPacket) {
    const all = asArray(relationRows);
    const remaining = asArray(remainingRows);
    const severity = countMap(all.concat(remaining).map(row => row.severity));
    return {
      relation_triage_count: all.length,
      remaining_equivalence_triage_count: remaining.length,
      remaining_equivalence_target_count: remaining.length,
      critical_regression_count: (severity.critical || 0),
      high_severity_count: (severity.high || 0),
      medium_severity_count: (severity.medium || 0),
      low_severity_count: (severity.low || 0),
      relation_triage_type_counts: countMap(all.map(row => row.triage_type)),
      remaining_equivalence_type_counts: countMap(remaining.map(row => row.triage_type)),
      next_build_target_counts: countMap(all.concat(remaining).map(row => row.next_build_target)),
      split_checks_passed: refinedPacket && refinedPacket.summary && refinedPacket.summary.split_checks_passed === true,
      unit_total_principle: 'early_scope_and_mature_scope_both_sum_abs_dimensions_to_1',
      objective_language_claim: 'refined_relation_triage_guides_next_basis_refinement_not_final_math',
      belief_movement: 'none'
    };
  }

  function triageRefinedPacket(refinedPacket) {
    const relationRows = asArray(refinedPacket && refinedPacket.relation_report && refinedPacket.relation_report.relation_candidates).map(triageRelationCandidate);
    const remainingRows = asArray(refinedPacket && refinedPacket.remaining_equivalence_targets).map(triageRemainingTarget);
    const summary = summarize(relationRows, remainingRows, refinedPacket);
    return {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_packet_type: text(refinedPacket && refinedPacket.packet_type),
      source_summary: clone(refinedPacket && refinedPacket.summary || {}),
      summary,
      remaining_equivalence_triage: remainingRows,
      relation_triage: relationRows,
      recommended_next_targets: unique(remainingRows.filter(row => row.severity === 'high' || row.severity === 'critical').map(row => row.next_build_target)),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadRefinedProposeAndTriage(options = {}) {
    if (!modulesAvailable().refined_relation_proposer) throw new Error('KernelSemanticCanonicalRelationProposerRefinedV01 unavailable');
    const refinedPacket = await global.KernelSemanticCanonicalRelationProposerRefinedV01.loadRefinedCanonicalizeAndPropose(options);
    const triage = triageRefinedPacket(refinedPacket);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: refinedPacket.ok === true && triage.summary.critical_regression_count === 0,
      refined_relation_packet: refinedPacket,
      triage_report: triage,
      summary: triage.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticCanonicalRelationTriageRefinedV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE,
    doctrine, modulesAvailable, classifyRemainingEquivalence, triageRemainingTarget,
    classifyRelationCandidate, triageRelationCandidate, summarize, triageRefinedPacket,
    loadRefinedProposeAndTriage
  });
})(typeof window !== 'undefined' ? window : globalThis);
