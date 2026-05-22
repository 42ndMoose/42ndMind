/* 42ndMind Language Field
 * Internal organ only. It does not speak.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }
  function normalize(rows) { return global.FortySecondMindBrainState.normalizeUnitTotal(rows); }
  function id(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'term'; }

  const SEEDS = {
    meaning: [['referent_relation', 0.26], ['use_boundary', 0.22], ['context_sensitivity', 0.18], ['neighbor_difference', 0.18], ['truth_constraint', 0.16]],
    truth: [['reality_contact', 0.30], ['non_contradiction_pressure', 0.20], ['evidence_requirement', 0.20], ['scope_condition', 0.15], ['belief_independence', 0.15]],
    belief: [['accepted_candidate', 0.24], ['confidence_weight', 0.20], ['action_readiness', 0.16], ['revision_openness', 0.20], ['truth_gap_visibility', 0.20]],
    memory: [['stored_context', 0.24], ['retrieval_usefulness', 0.22], ['belief_context_link', 0.20], ['compression_need', 0.18], ['source_trace', 0.16]],
    communication: [['state_expression', 0.24], ['listener_bridge', 0.20], ['truth_discipline', 0.20], ['question_projection', 0.16], ['meaning_precision', 0.20]]
  };

  function makeField(term, dims) {
    const dimensions = normalize((dims || [['underdefined_reference', 1]]).map(d => ({ dimension: d[0], weight: d[1] })));
    return { term: id(term), unit_total: 1, dimensions, l1_total: global.FortySecondMindBrainState.l1Total(dimensions), status: 'candidate_meaning_field', updated_at: now() };
  }

  function ensure(state) {
    if (!state.language) state.language = { term_fields: {}, semantic_relations: [], learning_deltas: [], semantic_basis_links: [], rejected_semantic_noise: [], unit_total_checks: [], updated_at: now() };
    Object.keys(SEEDS).forEach(term => { if (!state.language.term_fields[term]) state.language.term_fields[term] = makeField(term, SEEDS[term]); });
    state.language.unit_total_checks = Object.values(state.language.term_fields).map(f => ({ term: f.term, ok: Math.abs(f.l1_total - 1) < 0.00001, l1_total: f.l1_total }));
    state.language.updated_at = now();
    return state.language;
  }

  function ingest(state, event, semanticBasisResult) {
    const field = ensure(state);
    const text = String(event && event.text || '').toLowerCase();
    Object.keys(SEEDS).forEach(term => {
      if (text.includes(term)) field.learning_deltas.unshift({ term, delta: 0.01, reason: 'pressure_bearing_term_seen', at: now() });
    });

    const focus = state.semanticFocus || {};
    arr(focus.admitted).forEach(meaning => {
      field.term_fields[meaning.term] = {
        term: meaning.term,
        unit_total: 1,
        dimensions: arr(meaning.dimensions),
        l1_total: meaning.l1_total,
        status: 'linked_from_semantic_basis',
        updated_at: now()
      };
      field.semantic_basis_links.unshift({ term: meaning.term, dimensions: arr(meaning.dimensions).map(d => d.dimension), source_event: focus.source_event, at: now() });
      field.learning_deltas.unshift({ term: meaning.term, delta: 0.05, reason: 'basis_reusing_meaning_admitted', at: now() });
    });
    arr(focus.rejected).forEach(rejection => {
      field.rejected_semantic_noise.unshift({ term: rejection.term, reason: rejection.reason, source_event: focus.source_event, at: now() });
    });

    field.semantic_basis_links = arr(field.semantic_basis_links).slice(0, 80);
    field.rejected_semantic_noise = arr(field.rejected_semantic_noise).slice(0, 80);
    field.learning_deltas = arr(field.learning_deltas).slice(0, 80);
    field.unit_total_checks = Object.values(field.term_fields).map(f => ({ term: f.term, ok: Math.abs(f.l1_total - 1) < 0.00001, l1_total: f.l1_total }));
    field.updated_at = now();
    return field;
  }

  global.FortySecondMindLanguageField = Object.freeze({ SEEDS, makeField, ensure, ingest });
})(typeof window !== 'undefined' ? window : globalThis);
