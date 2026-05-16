/* 42ndMind Semantic Canonical Vector Basis v0.1
 * Converts semantic law candidates into anonymous canonical vector forms.
 *
 * This strips pressure labels from the formal comparison layer and compares
 * law candidates by structure: equivalence, subset, overlap, contrast, and
 * orthogonality. Labels remain as metadata only.
 *
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_canonical_vector_basis_v0_1';
  const REPORT_TYPE = '42ndMind_semantic_canonical_vector_basis_report_v0_1';

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
  function setOf(items) { return new Set(unique(items)); }
  function intersection(a, b) { const bs = setOf(b); return unique(a).filter(x => bs.has(x)); }
  function difference(a, b) { const bs = setOf(b); return unique(a).filter(x => !bs.has(x)); }
  function subset(a, b) { const bs = setOf(b); return unique(a).every(x => bs.has(x)); }
  function sameSet(a, b) { const ua = unique(a), ub = unique(b); return ua.length === ub.length && subset(ua, ub); }
  function signature(items) { return unique(items).sort().join('|'); }
  function ratio(n, d) { return d ? Number((n / d).toFixed(4)) : 0; }
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
      canonical_basis_strips_labels_from_formal_comparison: true,
      local_pressure_names_are_metadata_not_final_math: true,
      canonical_vectors_compare_structure_under_basis_renaming: true,
      equivalence_requires_same_anonymous_basis_set: true,
      subset_overlap_and_orthogonality_are_structural_relations_not_truth: true,
      isomorphism_claims_are_candidates_until_cross_notation_tests_exist: true,
      basis_extractor_does_not_promote_doctrine: true,
      basis_extractor_does_not_patch_source: true,
      basis_extractor_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      law_invariance_tester: !!(global.KernelSemanticLawInvarianceTesterV01 && typeof global.KernelSemanticLawInvarianceTesterV01.loadExtractAndTest === 'function')
    };
  }

  function lawId(law, index) {
    return text(law && law.id) || `law_${index + 1}`;
  }

  function collectPressureDimensions(laws) {
    return unique(asArray(laws).flatMap(law => asArray(law && law.pressures))).sort();
  }

  function roleSignatureForPressure(pressure, laws) {
    const includedLawIndexes = [];
    const includedOperators = [];
    const coPressures = [];
    asArray(laws).forEach((law, index) => {
      const pressures = asArray(law && law.pressures);
      if (pressures.includes(pressure)) {
        includedLawIndexes.push(index + 1);
        includedOperators.push(text(law && law.primary_operator || `operator_${index + 1}`));
        pressures.forEach(p => { if (p !== pressure) coPressures.push(p); });
      }
    });
    return {
      incidence_count: includedLawIndexes.length,
      incidence_law_indexes: includedLawIndexes,
      incidence_operator_count: unique(includedOperators).length,
      co_dimension_count: unique(coPressures).length,
      role_fingerprint: `i:${includedLawIndexes.join(',')};o:${unique(includedOperators).length};c:${unique(coPressures).length}`
    };
  }

  function buildAnonymousBasis(laws) {
    const pressures = collectPressureDimensions(laws);
    const raw = pressures.map(localLabel => {
      const role = roleSignatureForPressure(localLabel, laws);
      return Object.assign({ local_label: localLabel }, role);
    });
    raw.sort((a, b) => {
      if (b.incidence_count !== a.incidence_count) return b.incidence_count - a.incidence_count;
      if (b.co_dimension_count !== a.co_dimension_count) return b.co_dimension_count - a.co_dimension_count;
      if (a.role_fingerprint !== b.role_fingerprint) return a.role_fingerprint.localeCompare(b.role_fingerprint);
      return a.local_label.localeCompare(b.local_label);
    });
    return raw.map((item, index) => Object.assign({}, item, {
      canonical_id: `d${index + 1}`,
      local_label_is_metadata_only: true
    }));
  }

  function basisMap(basis) {
    const map = {};
    asArray(basis).forEach(d => { map[d.local_label] = d.canonical_id; });
    return map;
  }

  function canonicalVectorForLaw(law, index, basis) {
    const map = basisMap(basis);
    const localPressures = unique(asArray(law && law.pressures)).sort();
    const dims = unique(localPressures.map(p => map[p])).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
    const binary = {};
    asArray(basis).forEach(d => { binary[d.canonical_id] = dims.includes(d.canonical_id) ? 1 : 0; });
    return {
      law_id: lawId(law, index),
      source_operator_metadata: text(law && law.primary_operator),
      source_equation_metadata: text(law && law.equation),
      canonical_vector_id: `cv_${index + 1}_${stableHash(dims.join('|'))}`,
      canonical_dimensions: dims,
      canonical_signature: signature(dims),
      dimension_count: dims.length,
      binary_vector: binary,
      local_pressure_metadata: localPressures,
      observation_count: Number(law && law.observation_count) || 0,
      law_status: text(law && law.law_status || 'unknown'),
      label_warning: 'Canonical dimensions are formal comparison symbols. Local labels are metadata only.',
      belief_movement: 'none'
    };
  }

  function relationBetween(a, b) {
    const ad = asArray(a && a.canonical_dimensions);
    const bd = asArray(b && b.canonical_dimensions);
    const shared = intersection(ad, bd);
    const aOnly = difference(ad, bd);
    const bOnly = difference(bd, ad);
    const unionCount = unique(ad.concat(bd)).length;
    let relation_type = 'overlap';
    if (sameSet(ad, bd)) relation_type = 'equivalent';
    else if (!shared.length) relation_type = 'orthogonal';
    else if (subset(ad, bd)) relation_type = 'strict_subset';
    else if (subset(bd, ad)) relation_type = 'strict_superset';
    else if (shared.length && aOnly.length && bOnly.length) relation_type = 'partial_overlap';

    const contrast_like = shared.length > 0 && aOnly.length > 0 && bOnly.length > 0;
    return {
      left_vector_id: a.canonical_vector_id,
      right_vector_id: b.canonical_vector_id,
      left_law_id: a.law_id,
      right_law_id: b.law_id,
      relation_type,
      shared_dimensions: shared,
      left_only_dimensions: aOnly,
      right_only_dimensions: bOnly,
      shared_count: shared.length,
      union_count: unionCount,
      jaccard_similarity: ratio(shared.length, unionCount),
      contrast_like,
      candidate_invariant_relation: relation_type !== 'orthogonal' || contrast_like,
      belief_movement: 'none'
    };
  }

  function pairwiseRelations(vectors) {
    const rels = [];
    for (let i = 0; i < asArray(vectors).length; i++) {
      for (let j = i + 1; j < asArray(vectors).length; j++) {
        rels.push(relationBetween(vectors[i], vectors[j]));
      }
    }
    return rels;
  }

  function equivalenceClasses(vectors) {
    const groups = new Map();
    asArray(vectors).forEach(v => {
      const key = v.canonical_signature;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(v);
    });
    return Array.from(groups.entries()).map(([sig, rows], index) => ({
      class_id: `E${index + 1}`,
      canonical_signature: sig,
      member_count: rows.length,
      member_law_ids: rows.map(r => r.law_id),
      member_vector_ids: rows.map(r => r.canonical_vector_id),
      status: rows.length > 1 ? 'nontrivial_equivalence_class' : 'singleton_class',
      belief_movement: 'none'
    }));
  }

  function summarize(report) {
    const rels = asArray(report && report.relations);
    return {
      basis_dimension_count: asArray(report && report.basis_dimensions).length,
      law_candidate_count: asArray(report && report.source_law_candidates).length,
      canonical_vector_count: asArray(report && report.canonical_vectors).length,
      equivalence_class_count: asArray(report && report.equivalence_classes).length,
      nontrivial_equivalence_class_count: asArray(report && report.equivalence_classes).filter(c => c.member_count > 1).length,
      relation_count: rels.length,
      relation_type_counts: countMap(rels.map(r => r.relation_type)),
      contrast_pair_count: rels.filter(r => r.contrast_like).length,
      subset_relation_count: rels.filter(r => r.relation_type === 'strict_subset' || r.relation_type === 'strict_superset').length,
      orthogonal_pair_count: rels.filter(r => r.relation_type === 'orthogonal').length,
      candidate_invariant_relation_count: rels.filter(r => r.candidate_invariant_relation).length,
      objective_language_claim: 'canonical_structure_candidates_not_final_math',
      belief_movement: 'none'
    };
  }

  function canonicalizeLawReport(lawReport, options = {}) {
    const laws = asArray(lawReport && lawReport.law_candidates);
    const basis = buildAnonymousBasis(laws);
    const vectors = laws.map((law, index) => canonicalVectorForLaw(law, index, basis));
    const relations = pairwiseRelations(vectors);
    const classes = equivalenceClasses(vectors);
    const report = {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_law_packet_type: text(lawReport && lawReport.packet_type),
      source_law_summary: clone(lawReport && lawReport.summary || {}),
      source_law_candidates: clone(laws),
      basis_dimensions: basis,
      canonical_vectors: vectors,
      equivalence_classes: classes,
      relations,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    report.summary = summarize(report);
    return report;
  }

  async function loadExtractAndCanonicalize(options = {}) {
    if (!modulesAvailable().law_invariance_tester) throw new Error('KernelSemanticLawInvarianceTesterV01 unavailable');
    const invariancePacket = await global.KernelSemanticLawInvarianceTesterV01.loadExtractAndTest(options);
    const lawReport = invariancePacket.law_packet && invariancePacket.law_packet.law_report;
    const basisReport = canonicalizeLawReport(lawReport, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: invariancePacket.ok === true,
      invariance_packet: invariancePacket,
      basis_report: basisReport,
      summary: basisReport.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticCanonicalVectorBasisV01 = Object.freeze({
    VERSION, PACKET_TYPE, REPORT_TYPE,
    doctrine, modulesAvailable, collectPressureDimensions, roleSignatureForPressure,
    buildAnonymousBasis, canonicalVectorForLaw, relationBetween, pairwiseRelations,
    equivalenceClasses, summarize, canonicalizeLawReport, loadExtractAndCanonicalize
  });
})(typeof window !== 'undefined' ? window : globalThis);
