/* 42ndMind Semantic Basis Core
 *
 * Purpose:
 * Prove the smallest useful semantic primitive:
 * meanings must reuse a shared basis instead of expanding into isolated labels.
 *
 * This file does not speak, does not infer intent, and does not pretend to be intelligence.
 * It only builds unit-total meaning fields, measures overlap/contrast, and rejects
 * disconnected one-off subdivision.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function id(value) { return text(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function arr(value) { return Array.isArray(value) ? value : []; }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }
  function clamp01(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }
  function absTotal(rows) { return round(arr(rows).reduce((sum, row) => sum + Math.abs(Number(row.weight) || 0), 0)); }

  function normalizeDimensions(dimensions) {
    const rows = arr(dimensions).map(row => {
      if (Array.isArray(row)) return { dimension: id(row[0]), weight: Number(row[1]) || 0 };
      return { dimension: id(row.dimension), weight: Number(row.weight) || 0 };
    }).filter(row => row.dimension && row.weight !== 0);

    const total = rows.reduce((sum, row) => sum + Math.abs(row.weight), 0) || 1;
    let running = 0;
    return rows.map((row, index) => {
      const sign = row.weight < 0 ? -1 : 1;
      const magnitude = index === rows.length - 1
        ? Math.max(0, 1 - running)
        : Math.abs(row.weight) / total;
      const weight = round(sign * magnitude);
      running = round(running + Math.abs(weight));
      return { dimension: row.dimension, weight };
    });
  }

  function createCore(seed) {
    const core = {
      packet_type: '42ndMind_semantic_basis_core_v0_1',
      packet_version: VERSION,
      basis_dimensions: {},
      meanings: {},
      relation_graph: [],
      admission_log: [],
      rejection_log: [],
      doctrine: {
        meaning_total_is_one: true,
        dimensions_should_be_reused_not_locally_invented: true,
        new_dimensions_need_cross_concept_explanatory_value: true,
        disconnected_subdivision_is_not_language_growth: true,
        no_speech_generation: true,
        no_final_truth_promotion: true
      }
    };
    arr(seed && seed.basis_dimensions).forEach(d => registerBasisDimension(core, d.dimension || d, d.description || 'seed_basis_dimension'));
    arr(seed && seed.meanings).forEach(m => addMeaning(core, m.term, m.dimensions, { source: 'seed' }));
    return core;
  }

  function registerBasisDimension(core, dimension, description) {
    const key = id(dimension);
    if (!core.basis_dimensions[key]) {
      core.basis_dimensions[key] = {
        dimension: key,
        description: text(description) || 'basis_dimension',
        use_count: 0,
        terms: []
      };
    }
    return core.basis_dimensions[key];
  }

  function addMeaning(core, term, dimensions, meta) {
    const termId = id(term);
    const normalized = normalizeDimensions(dimensions);
    const meaning = {
      term: termId,
      unit_total: 1,
      dimensions: normalized,
      l1_total: absTotal(normalized),
      status: 'candidate_meaning_field',
      meta: meta || {}
    };
    core.meanings[termId] = meaning;
    normalized.forEach(dim => {
      const basis = registerBasisDimension(core, dim.dimension, 'admitted_or_seeded_basis_dimension');
      basis.use_count += 1;
      if (!basis.terms.includes(termId)) basis.terms.push(termId);
    });
    refreshRelations(core);
    return meaning;
  }

  function dimensionMap(meaning) {
    const map = {};
    arr(meaning && meaning.dimensions).forEach(row => { map[row.dimension] = Number(row.weight) || 0; });
    return map;
  }

  function compareMeanings(a, b) {
    const ma = dimensionMap(a);
    const mb = dimensionMap(b);
    const dims = Array.from(new Set(Object.keys(ma).concat(Object.keys(mb))));
    let shared = 0;
    let contrast = 0;
    const shared_dimensions = [];
    const contrast_dimensions = [];
    dims.forEach(dim => {
      const av = ma[dim] || 0;
      const bv = mb[dim] || 0;
      if (av !== 0 && bv !== 0) {
        if (Math.sign(av) === Math.sign(bv)) {
          const s = Math.min(Math.abs(av), Math.abs(bv));
          shared += s;
          shared_dimensions.push({ dimension: dim, shared_weight: round(s) });
        } else {
          const c = Math.min(Math.abs(av), Math.abs(bv));
          contrast += c;
          contrast_dimensions.push({ dimension: dim, contrast_weight: round(c) });
        }
      }
    });
    return {
      a: a && a.term,
      b: b && b.term,
      shared_score: clamp01(round(shared)),
      contrast_score: clamp01(round(contrast)),
      shared_dimensions,
      contrast_dimensions,
      disconnected: shared === 0 && contrast === 0
    };
  }

  function refreshRelations(core) {
    const meanings = Object.values(core.meanings);
    const relations = [];
    for (let i = 0; i < meanings.length; i++) {
      for (let j = i + 1; j < meanings.length; j++) {
        const relation = compareMeanings(meanings[i], meanings[j]);
        relation.relation_kind = relation.disconnected
          ? 'disconnected_no_shared_basis'
          : relation.contrast_score > relation.shared_score
            ? 'contrast_relation'
            : 'shared_basis_relation';
        relations.push(relation);
      }
    }
    core.relation_graph = relations;
    return relations;
  }

  function basisUseCount(core, dimension) {
    const basis = core.basis_dimensions[id(dimension)];
    return basis ? basis.use_count : 0;
  }

  function evaluateCandidate(core, term, dimensions) {
    const normalized = normalizeDimensions(dimensions);
    const existing = Object.keys(core.basis_dimensions);
    const reused = normalized.filter(row => existing.includes(row.dimension));
    const newDims = normalized.filter(row => !existing.includes(row.dimension));
    const knownCoverage = normalized.length ? reused.length / normalized.length : 0;
    const tempMeaning = { term: id(term), dimensions: normalized };
    const relationScores = Object.values(core.meanings).map(existingMeaning => compareMeanings(tempMeaning, existingMeaning));
    const bestRelation = relationScores.sort((a, b) => (b.shared_score + b.contrast_score) - (a.shared_score + a.contrast_score))[0] || null;
    const disconnectedFromAll = relationScores.length > 0 && relationScores.every(r => r.disconnected);
    const hasReusablePressure = knownCoverage > 0 || (bestRelation && (bestRelation.shared_score > 0 || bestRelation.contrast_score > 0));
    const shouldReject = disconnectedFromAll || (newDims.length === normalized.length && Object.keys(core.meanings).length > 0);
    return {
      term: id(term),
      normalized_dimensions: normalized,
      l1_total: absTotal(normalized),
      known_dimension_count: reused.length,
      new_dimension_count: newDims.length,
      known_coverage: round(knownCoverage),
      best_relation: bestRelation,
      disconnected_from_all_existing_meanings: disconnectedFromAll,
      has_reusable_pressure: !!hasReusablePressure,
      admission_recommendation: shouldReject ? 'reject_disconnected_subdivision' : 'admit_candidate_meaning',
      reason: shouldReject
        ? 'Candidate uses an isolated dimension set with no shared or contrasting basis relation to existing meanings.'
        : 'Candidate reuses or contrasts with the current basis.'
    };
  }

  function admitCandidate(core, term, dimensions, meta) {
    const evaluation = evaluateCandidate(core, term, dimensions);
    if (evaluation.admission_recommendation === 'reject_disconnected_subdivision') {
      core.rejection_log.unshift({ term: evaluation.term, evaluation, meta: meta || {} });
      return { admitted: false, evaluation };
    }
    const meaning = addMeaning(core, term, dimensions, meta || {});
    core.admission_log.unshift({ term: meaning.term, evaluation, meta: meta || {} });
    return { admitted: true, meaning, evaluation };
  }

  function findDimensionRole(core, dimension) {
    const key = id(dimension);
    const users = Object.values(core.meanings).filter(m => dimensionMap(m)[key] !== undefined).map(m => ({ term: m.term, weight: dimensionMap(m)[key] }));
    const positive = users.filter(u => u.weight > 0).map(u => u.term);
    const negative = users.filter(u => u.weight < 0).map(u => u.term);
    return {
      dimension: key,
      use_count: basisUseCount(core, key),
      positive_terms: positive,
      negative_terms: negative,
      contrastive: positive.length > 0 && negative.length > 0,
      reusable: users.length >= 2
    };
  }

  function sampleCore() {
    const core = createCore({ basis_dimensions: [
      'reality_contact',
      'self_correction',
      'integrated_judgment',
      'information_grasp',
      'person_concern',
      'constraint_contact',
      'contextual_flexibility',
      'false_certainty_resistance'
    ] });
    addMeaning(core, 'wisdom', [
      ['integrated_judgment', 0.28],
      ['contextual_flexibility', 0.22],
      ['self_correction', 0.20],
      ['reality_contact', 0.16],
      ['false_certainty_resistance', 0.14]
    ], { source: 'sample' });
    addMeaning(core, 'knowledge', [
      ['information_grasp', 0.36],
      ['reality_contact', 0.20],
      ['self_correction', 0.16],
      ['integrated_judgment', 0.12],
      ['contextual_flexibility', 0.16]
    ], { source: 'sample' });
    addMeaning(core, 'empathy', [
      ['person_concern', 0.38],
      ['contextual_flexibility', 0.18],
      ['reality_contact', 0.14],
      ['self_correction', 0.14],
      ['constraint_contact', 0.16]
    ], { source: 'sample' });
    addMeaning(core, 'practicality', [
      ['constraint_contact', 0.38],
      ['reality_contact', 0.20],
      ['information_grasp', 0.16],
      ['contextual_flexibility', 0.14],
      ['person_concern', 0.12]
    ], { source: 'sample' });
    addMeaning(core, 'collapse', [
      ['reality_contact', -0.28],
      ['self_correction', -0.26],
      ['integrated_judgment', -0.20],
      ['false_certainty_resistance', -0.16],
      ['contextual_flexibility', -0.10]
    ], { source: 'sample' });
    return core;
  }

  global.FortySecondMindSemanticBasisCore = Object.freeze({
    VERSION,
    normalizeDimensions,
    createCore,
    registerBasisDimension,
    addMeaning,
    compareMeanings,
    refreshRelations,
    evaluateCandidate,
    admitCandidate,
    basisUseCount,
    findDimensionRole,
    sampleCore
  });
})(typeof window !== 'undefined' ? window : globalThis);
