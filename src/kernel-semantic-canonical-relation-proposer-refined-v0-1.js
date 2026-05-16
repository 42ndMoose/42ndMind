/* 42ndMind Refined Semantic Canonical Relation Proposer v0.1
 * Runs canonical relation proposal over the refined canonical basis path.
 *
 * It keeps basis-refinement splits visible and exports relation-graph candidates
 * as objective-language structure candidates, not doctrine.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_canonical_relation_proposer_refined_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_refined_canonical_relation_report_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const value = text(item);
      const key = value.toLowerCase();
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

  function doctrine() {
    return {
      refined_relations_use_basis_refinement_law_candidates: true,
      split_checks_are_structural_sanity_checks_not_truth: true,
      remaining_equivalences_become_review_targets_not_doctrine: true,
      relation_graph_is_objective_language_candidate_not_final_math: true,
      local_labels_are_metadata_only: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_remains_separate_from_shape: true,
      refined_relation_proposer_does_not_promote_doctrine: true,
      refined_relation_proposer_does_not_patch_source: true,
      refined_relation_proposer_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      law_extractor_patch: !!(global.KernelSemanticLawCandidateExtractorV01 && global.KernelSemanticLawCandidateExtractorV01.VERSION === '0.1.1'),
      canonical_basis: !!(global.KernelSemanticCanonicalVectorBasisV01 && typeof global.KernelSemanticCanonicalVectorBasisV01.loadExtractAndCanonicalize === 'function'),
      relation_proposer: !!(global.KernelSemanticCanonicalRelationProposerV01 && typeof global.KernelSemanticCanonicalRelationProposerV01.proposeFromBasisReport === 'function')
    };
  }

  function vectorById(report) {
    const map = {};
    asArray(report && report.canonical_vectors).forEach(v => { map[v.canonical_vector_id] = v; });
    return map;
  }

  function operatorForVectorId(report, id) {
    const map = vectorById(report);
    return text(map[id] && map[id].source_operator_metadata);
  }

  function operatorsInClass(report, cls) {
    return unique(asArray(cls && cls.member_vector_ids).map(id => operatorForVectorId(report, id)).filter(Boolean));
  }

  function hasEquivalenceClassContaining(report, left, right) {
    return asArray(report && report.equivalence_classes).some(cls => {
      const ops = operatorsInClass(report, cls);
      return ops.includes(left) && ops.includes(right);
    });
  }

  function splitCheck(report, left, right) {
    const leftVectors = asArray(report && report.canonical_vectors).filter(v => v.source_operator_metadata === left);
    const rightVectors = asArray(report && report.canonical_vectors).filter(v => v.source_operator_metadata === right);
    const collapsed = hasEquivalenceClassContaining(report, left, right);
    return {
      pair: `${left}/${right}`,
      left_operator: left,
      right_operator: right,
      left_vector_count: leftVectors.length,
      right_vector_count: rightVectors.length,
      collapsed,
      split: leftVectors.length > 0 && rightVectors.length > 0 && !collapsed,
      left_signatures: unique(leftVectors.map(v => v.canonical_signature)),
      right_signatures: unique(rightVectors.map(v => v.canonical_signature)),
      belief_movement: 'none'
    };
  }

  function splitChecks(report) {
    return [
      splitCheck(report, 'expert', 'settled'),
      splitCheck(report, 'collusion', 'coordinated')
    ];
  }

  function remainingEquivalenceTargets(report, relationReport) {
    return asArray(relationReport && relationReport.relation_candidates)
      .filter(c => c.relation_kind === 'canonical_equivalence')
      .map(c => ({
        candidate_id: c.candidate_id,
        formal_statement: c.formal_statement,
        canonical_signature: c.canonical_signature,
        member_operators: operatorsInClass(report, { member_vector_ids: c.member_vector_ids }),
        local_label_metadata: clone(asArray(c.local_label_metadata)),
        review_requirement: 'Review whether this remaining equivalence is genuine structure or another vocabulary collapse.',
        belief_movement: 'none'
      }));
  }

  function relationGraph(report, relationReport) {
    const nodes = asArray(report && report.canonical_vectors).map(v => ({
      id: v.canonical_vector_id,
      law_id: v.law_id,
      operator_metadata: v.source_operator_metadata,
      canonical_signature: v.canonical_signature,
      local_pressure_metadata: clone(asArray(v.local_pressure_metadata)),
      label_warning: v.label_warning || 'local labels are metadata only',
      belief_movement: 'none'
    }));
    const edges = asArray(relationReport && relationReport.relation_candidates).map(c => ({
      id: c.candidate_id,
      kind: c.relation_kind,
      statement: c.formal_statement,
      left_operator_metadata: c.left_operator_metadata || null,
      right_operator_metadata: c.right_operator_metadata || null,
      shared_dimensions: clone(asArray(c.shared_dimensions)),
      left_only_dimensions: clone(asArray(c.left_only_dimensions)),
      right_only_dimensions: clone(asArray(c.right_only_dimensions)),
      local_label_metadata: clone(asArray(c.local_label_metadata)),
      review_requirement: c.review_requirement,
      belief_movement: 'none'
    }));
    return {
      packet_type: '42ndMind_semantic_refined_relation_graph_candidate_v0_1',
      packet_version: VERSION,
      created_at: now(),
      node_count: nodes.length,
      edge_count: edges.length,
      nodes,
      edges,
      objective_language_claim: 'relation_graph_candidate_under_anonymous_refined_basis_not_final_math',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function summarize(report, relationReport, checks, remaining) {
    const relationKinds = countMap(asArray(relationReport && relationReport.relation_candidates).map(c => c.relation_kind));
    return {
      basis_dimension_count: report && report.summary && report.summary.basis_dimension_count || asArray(report && report.basis_dimensions).length,
      canonical_vector_count: report && report.summary && report.summary.canonical_vector_count || asArray(report && report.canonical_vectors).length,
      law_candidate_count: report && report.summary && report.summary.law_candidate_count || 0,
      basis_refinement_law_count: report && report.source_law_summary && report.source_law_summary.basis_refinement_law_count || 0,
      suppressed_collapsed_law_count: report && report.source_law_summary && report.source_law_summary.suppressed_collapsed_law_count || 0,
      relation_candidate_count: relationReport && relationReport.summary && relationReport.summary.candidate_count || 0,
      relation_kind_counts: relationKinds,
      remaining_equivalence_target_count: remaining.length,
      split_checks_passed: asArray(checks).every(c => c.split === true),
      split_checks: clone(checks),
      objective_language_claim: 'refined_relation_candidates_under_anonymous_basis_not_final_math',
      active_shape_l1_rule: 'sum_abs_dimensions_equals_1',
      belief_movement: 'none'
    };
  }

  async function loadRefinedCanonicalizeAndPropose(options = {}) {
    const modules = modulesAvailable();
    if (!modules.law_extractor_patch) throw new Error('KernelSemanticLawCandidateExtractorV01 v0.1.1 patch not loaded');
    if (!modules.canonical_basis) throw new Error('KernelSemanticCanonicalVectorBasisV01 unavailable');
    if (!modules.relation_proposer) throw new Error('KernelSemanticCanonicalRelationProposerV01 unavailable');
    const basisPacket = await global.KernelSemanticCanonicalVectorBasisV01.loadExtractAndCanonicalize(options);
    const relationReport = global.KernelSemanticCanonicalRelationProposerV01.proposeFromBasisReport(basisPacket.basis_report, options);
    const checks = splitChecks(basisPacket.basis_report);
    const remaining = remainingEquivalenceTargets(basisPacket.basis_report, relationReport);
    const graph = relationGraph(basisPacket.basis_report, relationReport);
    const summary = summarize(basisPacket.basis_report, relationReport, checks, remaining);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: basisPacket.ok === true && summary.split_checks_passed === true,
      basis_packet: basisPacket,
      relation_report: Object.assign({}, relationReport, { packet_version: VERSION, refined_by: PACKET_TYPE, doctrine: doctrine(), belief_movement: 'none' }),
      relation_graph: graph,
      split_checks: checks,
      remaining_equivalence_targets: remaining,
      summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticCanonicalRelationProposerRefinedV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE,
    doctrine, modulesAvailable, vectorById, operatorForVectorId, operatorsInClass,
    hasEquivalenceClassContaining, splitCheck, splitChecks,
    remainingEquivalenceTargets, relationGraph, summarize,
    loadRefinedCanonicalizeAndPropose
  });
})(typeof window !== 'undefined' ? window : globalThis);
