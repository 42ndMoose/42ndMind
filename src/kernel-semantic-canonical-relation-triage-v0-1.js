/* 42ndMind Semantic Canonical Relation Triage v0.1
 * Classifies canonical relation candidates into next actions.
 *
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_canonical_relation_triage_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_canonical_relation_triage_report_v0_1';

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
  function includesAnyText(value, needles) {
    const v = lower(value);
    return asArray(needles).some(n => v.includes(lower(n)));
  }
  function hasAny(items, needles) {
    const set = new Set(asArray(items).map(lower));
    return asArray(needles).some(n => set.has(lower(n)));
  }
  function stableHash(value) {
    let h = 0;
    const s = text(value);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36).slice(0, 8);
  }

  function doctrine() {
    return {
      relation_triage_classifies_formal_candidates_not_truth: true,
      equivalence_can_signal_true_structure_or_vocabulary_collapse: true,
      subset_can_signal_enrichment_or_missing_dimension: true,
      orthogonality_can_signal_true_separation_or_sparse_corpus_artifact: true,
      contrast_candidates_require_boundary_tests: true,
      local_labels_are_metadata_for_human_review_not_final_math: true,
      relation_triage_does_not_promote_doctrine: true,
      relation_triage_does_not_patch_source: true,
      relation_triage_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      relation_proposer: !!(global.KernelSemanticCanonicalRelationProposerV01 && typeof global.KernelSemanticCanonicalRelationProposerV01.loadCanonicalizeAndPropose === 'function')
    };
  }

  function relationNames(candidate) {
    const a = text(candidate && candidate.left_operator_metadata);
    const b = text(candidate && candidate.right_operator_metadata);
    const statement = text(candidate && candidate.formal_statement);
    return { a, b, statement, joined: lower([a, b, statement].join(' ')) };
  }

  function classifyEquivalence(candidate) {
    const names = relationNames(candidate);
    const metadata = asArray(candidate && candidate.local_label_metadata);

    if (includesAnyText(names.joined, ['expert', 'settled'])) {
      return {
        triage_type: 'likely_vocabulary_collapse_needs_source_status_vs_closure_split',
        severity: 'high',
        recommended_action: 'add_distinguishing_dimension_between_source_status_and_claim_closure',
        next_build_target: 'authority_closure_basis_refinement',
        rationale: 'Expert/source status and settled/claim-closure collapsed into the same canonical vector. They should probably not be structurally identical in the final basis.'
      };
    }

    if (includesAnyText(names.joined, ['collusion', 'coordinated'])) {
      return {
        triage_type: 'likely_vocabulary_collapse_needs_illicit_coordination_dimension',
        severity: 'high',
        recommended_action: 'add_distinguishing_dimension_for_covert_or_illicit_agreement',
        next_build_target: 'coordination_collusion_basis_refinement',
        rationale: 'Collusion and coordination collapsed into the same vector. Collusion normally requires a covert/illicit/agreement dimension that neutral coordination does not require.'
      };
    }

    if (hasAny(metadata, ['authority_transfer_pressure', 'closure_pressure']) && metadata.length <= 2) {
      return {
        triage_type: 'possible_underresolved_equivalence',
        severity: 'medium',
        recommended_action: 'add_contrast_examples_to_test_whether_equivalence_survives',
        next_build_target: 'equivalence_contrast_probe',
        rationale: 'The equivalence may be real under the current sparse basis, but it has too few dimensions to trust without contrast probes.'
      };
    }

    return {
      triage_type: 'structural_equivalence_candidate_requires_review',
      severity: 'medium',
      recommended_action: 'review_for_true_equivalence_or_missing_dimension',
      next_build_target: 'equivalence_review',
      rationale: 'The relation is structurally equivalent under the anonymous basis, but equivalence must be tested against contrast cases.'
    };
  }

  function classifySubset(candidate) {
    const names = relationNames(candidate);
    if (includesAnyText(names.joined, ['collusion', 'coordinated', 'ulterior_motive_attribution'])) {
      return {
        triage_type: 'valid_subset_or_missing_intent_dimension_review',
        severity: 'medium',
        recommended_action: 'test_whether_intent_attribution_is_required_for_superset_only',
        next_build_target: 'motive_coordination_subset_probe',
        rationale: 'The smaller coordination/collusion vector appears contained in the broader motive-attribution vector. This may be valid enrichment, but it could also mean a missing dimension.'
      };
    }
    return {
      triage_type: 'subset_enrichment_candidate',
      severity: 'medium',
      recommended_action: 'check_whether_superset_dimension_is_real_semantic_enrichment',
      next_build_target: 'subset_enrichment_review',
      rationale: 'The relation suggests one law is contained in another with added dimensions. Review whether this is real enrichment or under-modeled smaller law.'
    };
  }

  function classifyContrast(candidate) {
    const names = relationNames(candidate);
    if (includesAnyText(names.joined, ['reckless_accusation'])) {
      return {
        triage_type: 'accusation_direct_burden_contrast_candidate',
        severity: 'medium',
        recommended_action: 'add_boundary_examples_between_accusation_risk_and_motive_or_coordination',
        next_build_target: 'accusation_motive_boundary_probe',
        rationale: 'The relation shares a direct burden dimension while diverging into accusation-risk versus motive/coordination dimensions. This looks like a useful contrast boundary.'
      };
    }
    return {
      triage_type: 'contrast_boundary_candidate',
      severity: 'medium',
      recommended_action: 'add_positive_and_negative_boundary_examples',
      next_build_target: 'contrast_boundary_probe',
      rationale: 'The relation shares a formal core but branches into different dimensions. It may define a real contrast boundary.'
    };
  }

  function classifyOrthogonality(candidate) {
    const names = relationNames(candidate);
    const metadata = asArray(candidate && candidate.local_label_metadata);

    if (includesAnyText(names.joined, ['emotionally_loaded', 'obfuscates']) || hasAny(metadata, ['affective_pressure', 'ambiguity_pressure', 'clarity_reduction_pressure'])) {
      return {
        triage_type: 'possible_true_separation_but_needs_bridge_examples',
        severity: 'low',
        recommended_action: 'add_bridge_examples_only_if_relation_matters',
        next_build_target: 'orthogonality_bridge_probe_optional',
        rationale: 'Rhetorical affect, ambiguity, and unrelated law families may be truly separate in the current basis, but sparse corpus effects remain possible.'
      };
    }

    return {
      triage_type: 'sparse_corpus_orthogonality_candidate',
      severity: 'low',
      recommended_action: 'do_not_prioritize_unless_domain_requires_bridge',
      next_build_target: 'low_priority_orthogonality_review',
      rationale: 'The laws share no anonymous dimensions. This may be true separation or simply lack of bridge examples.'
    };
  }

  function triageCandidate(candidate) {
    const kind = text(candidate && candidate.relation_kind);
    let base;
    if (kind === 'canonical_equivalence' || kind === 'canonical_equivalence_pair') base = classifyEquivalence(candidate);
    else if (kind === 'canonical_subset' || kind === 'canonical_superset') base = classifySubset(candidate);
    else if (kind === 'canonical_contrast') base = classifyContrast(candidate);
    else if (kind === 'canonical_orthogonality') base = classifyOrthogonality(candidate);
    else base = {
      triage_type: 'unclassified_relation_candidate',
      severity: 'medium',
      recommended_action: 'manual_relation_review',
      next_build_target: 'manual_relation_review',
      rationale: 'The relation kind has no specific triage rule yet.'
    };

    return Object.assign({
      triage_id: `triage_${stableHash(text(candidate && candidate.candidate_id) + text(candidate && candidate.formal_statement))}`,
      source_candidate_id: text(candidate && candidate.candidate_id),
      relation_kind: kind,
      formal_statement: text(candidate && candidate.formal_statement),
      local_label_metadata: clone(asArray(candidate && candidate.local_label_metadata)),
      source_review_requirement: text(candidate && candidate.review_requirement),
      belief_movement: 'none'
    }, base);
  }

  function summarize(rows) {
    const r = asArray(rows);
    return {
      triage_count: r.length,
      triage_type_counts: countMap(r.map(x => x.triage_type)),
      severity_counts: countMap(r.map(x => x.severity)),
      next_build_target_counts: countMap(r.map(x => x.next_build_target)),
      high_severity_count: r.filter(x => x.severity === 'high').length,
      medium_severity_count: r.filter(x => x.severity === 'medium').length,
      low_severity_count: r.filter(x => x.severity === 'low').length,
      vocabulary_collapse_count: r.filter(x => x.triage_type.includes('vocabulary_collapse')).length,
      objective_language_claim: 'relation_triage_guides_basis_refinement_not_final_math',
      belief_movement: 'none'
    };
  }

  function triageRelationReport(report, options = {}) {
    const rows = asArray(report && report.relation_candidates).map(triageCandidate);
    const summary = summarize(rows);
    return {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_relation_packet_type: text(report && report.packet_type),
      source_relation_summary: clone(report && report.summary || {}),
      summary,
      triage: rows,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadProposeAndTriage(options = {}) {
    if (!modulesAvailable().relation_proposer) throw new Error('KernelSemanticCanonicalRelationProposerV01 unavailable');
    const relationPacket = await global.KernelSemanticCanonicalRelationProposerV01.loadCanonicalizeAndPropose(options);
    const triage = triageRelationReport(relationPacket.relation_report, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: relationPacket.ok === true,
      relation_packet: relationPacket,
      triage_report: triage,
      summary: triage.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticCanonicalRelationTriageV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE,
    doctrine, modulesAvailable, triageCandidate, summarize, triageRelationReport, loadProposeAndTriage
  });
})(typeof window !== 'undefined' ? window : globalThis);
