/* 42ndMind Semantic Canonical Relation Proposer v0.1
 * Turns canonical vector-basis relations into reviewable formal relation candidates.
 *
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_canonical_relation_proposer_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_canonical_relation_candidate_report_v0_1';

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
  function stableHash(value) {
    let h = 0;
    const s = text(value);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36).slice(0, 8);
  }

  function doctrine() {
    return {
      canonical_relation_candidates_are_not_doctrine: true,
      relations_are_structural_under_anonymous_basis_not_label_truth: true,
      equivalence_subset_contrast_and_orthogonality_require_review: true,
      local_labels_are_explanatory_metadata_only: true,
      relation_proposer_does_not_promote_doctrine: true,
      relation_proposer_does_not_patch_source: true,
      relation_proposer_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      canonical_basis: !!(global.KernelSemanticCanonicalVectorBasisV01 && typeof global.KernelSemanticCanonicalVectorBasisV01.loadExtractAndCanonicalize === 'function')
    };
  }

  function vectorById(report) {
    const map = {};
    asArray(report && report.canonical_vectors).forEach(v => { map[v.canonical_vector_id] = v; });
    return map;
  }

  function vectorLabel(v) {
    return text(v && v.source_operator_metadata) || text(v && v.law_id) || 'unknown_law';
  }

  function localMetadataForIds(report, ids) {
    const map = vectorById(report);
    return unique(asArray(ids).flatMap(id => asArray(map[id] && map[id].local_pressure_metadata)));
  }

  function proposeEquivalenceClasses(report) {
    const map = vectorById(report);
    return asArray(report && report.equivalence_classes).filter(c => c.member_count > 1).map(c => {
      const members = asArray(c.member_vector_ids).map(id => map[id]).filter(Boolean);
      const labels = members.map(vectorLabel);
      return {
        candidate_id: `rel_equiv_${stableHash(c.canonical_signature)}`,
        relation_kind: 'canonical_equivalence',
        formal_statement: `${labels.join(' ≡ ')} under canonical signature {${c.canonical_signature}}`,
        canonical_signature: c.canonical_signature,
        member_law_ids: clone(c.member_law_ids),
        member_vector_ids: clone(c.member_vector_ids),
        local_label_metadata: unique(members.flatMap(v => asArray(v.local_pressure_metadata))),
        interpretation_hint: 'Different operators share the same anonymous canonical vector. This is a structural equivalence candidate, not a truth claim.',
        review_requirement: 'Check whether the equivalence is genuine or only an artifact of the current pressure vocabulary.',
        belief_movement: 'none'
      };
    });
  }

  function proposeRelation(rel, report) {
    const map = vectorById(report);
    const left = map[rel.left_vector_id];
    const right = map[rel.right_vector_id];
    const leftName = vectorLabel(left);
    const rightName = vectorLabel(right);
    const shared = asArray(rel.shared_dimensions).join(', ');
    const leftOnly = asArray(rel.left_only_dimensions).join(', ') || '∅';
    const rightOnly = asArray(rel.right_only_dimensions).join(', ') || '∅';

    let relation_kind = 'structural_overlap';
    let formal_statement = `${leftName} ∩ ${rightName} = {${shared}}`;
    let interpretation_hint = 'The two law vectors share some anonymous dimensions while diverging elsewhere.';
    let review_requirement = 'Check whether the shared dimensions represent a meaningful common formal role.';

    if (rel.relation_type === 'strict_subset') {
      relation_kind = 'canonical_subset';
      formal_statement = `${leftName} ⊂ ${rightName}; added dimensions in right: {${rightOnly}}`;
      interpretation_hint = 'The left law is structurally contained inside the right law under the current anonymous basis.';
      review_requirement = 'Check whether the superset relation reflects real semantic enrichment or missing dimensions in the smaller law.';
    } else if (rel.relation_type === 'strict_superset') {
      relation_kind = 'canonical_superset';
      formal_statement = `${rightName} ⊂ ${leftName}; added dimensions in left: {${leftOnly}}`;
      interpretation_hint = 'The right law is structurally contained inside the left law under the current anonymous basis.';
      review_requirement = 'Check whether the superset relation reflects real semantic enrichment or missing dimensions in the smaller law.';
    } else if (rel.relation_type === 'orthogonal') {
      relation_kind = 'canonical_orthogonality';
      formal_statement = `${leftName} ⟂ ${rightName}; shared dimensions: ∅`;
      interpretation_hint = 'The two laws do not share anonymous basis dimensions in the current law set.';
      review_requirement = 'Check whether this is true separation or a sparse-corpus artifact.';
    } else if (rel.contrast_like) {
      relation_kind = 'canonical_contrast';
      formal_statement = `${leftName} and ${rightName} share {${shared}} but diverge by left {${leftOnly}} and right {${rightOnly}}`;
      interpretation_hint = 'The two laws share a common formal core but branch into different pressure roles.';
      review_requirement = 'Check whether this forms a real contrast boundary.';
    } else if (rel.relation_type === 'equivalent') {
      relation_kind = 'canonical_equivalence_pair';
      formal_statement = `${leftName} ≡ ${rightName}; signature {${shared}}`;
      interpretation_hint = 'The two laws have identical anonymous canonical vectors.';
      review_requirement = 'Check whether identical vectors should remain separate operators or collapse into one equivalence class.';
    }

    return {
      candidate_id: `rel_${relation_kind}_${stableHash(rel.left_vector_id + rel.right_vector_id + rel.relation_type)}`,
      relation_kind,
      source_relation_type: rel.relation_type,
      formal_statement,
      left_law_id: rel.left_law_id,
      right_law_id: rel.right_law_id,
      left_operator_metadata: leftName,
      right_operator_metadata: rightName,
      shared_dimensions: clone(asArray(rel.shared_dimensions)),
      left_only_dimensions: clone(asArray(rel.left_only_dimensions)),
      right_only_dimensions: clone(asArray(rel.right_only_dimensions)),
      jaccard_similarity: rel.jaccard_similarity,
      local_label_metadata: localMetadataForIds(report, [rel.left_vector_id, rel.right_vector_id]),
      interpretation_hint,
      review_requirement,
      belief_movement: 'none'
    };
  }

  function proposeFromBasisReport(report, options = {}) {
    const includeOrthogonal = options.include_orthogonal !== false;
    const equivalence = proposeEquivalenceClasses(report);
    const relationCandidates = asArray(report && report.relations)
      .filter(rel => includeOrthogonal || rel.relation_type !== 'orthogonal')
      .map(rel => proposeRelation(rel, report));
    const candidates = equivalence.concat(relationCandidates);
    const summary = {
      candidate_count: candidates.length,
      equivalence_class_candidate_count: equivalence.length,
      pair_relation_candidate_count: relationCandidates.length,
      relation_kind_counts: countMap(candidates.map(c => c.relation_kind)),
      basis_dimension_count: report && report.summary && report.summary.basis_dimension_count || asArray(report && report.basis_dimensions).length,
      canonical_vector_count: report && report.summary && report.summary.canonical_vector_count || asArray(report && report.canonical_vectors).length,
      objective_language_claim: 'relation_candidates_under_anonymous_basis_not_final_math',
      belief_movement: 'none'
    };
    return {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_basis_packet_type: text(report && report.packet_type),
      source_basis_summary: clone(report && report.summary || {}),
      summary,
      relation_candidates: candidates,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadCanonicalizeAndPropose(options = {}) {
    if (!modulesAvailable().canonical_basis) throw new Error('KernelSemanticCanonicalVectorBasisV01 unavailable');
    const basisPacket = await global.KernelSemanticCanonicalVectorBasisV01.loadExtractAndCanonicalize(options);
    const relationReport = proposeFromBasisReport(basisPacket.basis_report, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: basisPacket.ok === true,
      basis_packet: basisPacket,
      relation_report: relationReport,
      summary: relationReport.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticCanonicalRelationProposerV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE,
    doctrine, modulesAvailable, vectorById, proposeEquivalenceClasses,
    proposeRelation, proposeFromBasisReport, loadCanonicalizeAndPropose
  });
})(typeof window !== 'undefined' ? window : globalThis);
