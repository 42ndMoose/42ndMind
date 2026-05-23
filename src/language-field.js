/* 42ndMind Language Field
 * Internal word/sentence interface to the shared semantic basis. It does not speak.
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

  const RECEPTOR_PATTERNS = [
    { dimension: 'integrated_judgment', weight: 0.24, patterns: [/careful judgment/, /judging carefully/, /sound judgment/, /weigh(?:s|ing)?[^.]{0,24}together/, /discern(?:s|ing)?[^.]{0,24}difference/] },
    { dimension: 'self_correction', weight: 0.22, patterns: [/open to correction/, /can be corrected/, /self[- ]?correct/, /willing to revise/, /revis(?:e|ion)/] },
    { dimension: 'reality_contact', weight: 0.22, patterns: [/grounded in reality/, /reality[- ]?contact/, /real[- ]world/, /contact with reality/, /grounded in what is real/] },
    { dimension: 'false_certainty_resistance', weight: 0.18, patterns: [/not believing every claim/, /before believing every claim/, /before accepting (?:a |the |this )?claim/, /slow belief/, /slows belief/, /avoid(?:s|ing)? false certainty/, /resist(?:s|ing)? false certainty/, /not rush(?:ing)? to believe/, /does not close the question/] },
    { dimension: 'information_grasp', weight: 0.14, patterns: [/evidence/, /facts?/, /information/, /what is known/, /technical grasp/] },
    { dimension: 'person_concern', weight: 0.14, patterns: [/care for people/, /human concern/, /concern for persons/, /empathy/, /compassion/] },
    { dimension: 'constraint_contact', weight: 0.14, patterns: [/constraint/, /practical/, /what can actually be done/, /real[- ]world limit/, /functional demand/] },
    { dimension: 'contextual_flexibility', weight: 0.12, patterns: [/context/, /depends on the situation/, /case by case/, /flexib(?:le|ility)/] }
  ];

  function makeField(term, dims) {
    const dimensions = normalize((dims || [['underdefined_reference', 1]]).map(d => ({ dimension: d[0], weight: d[1] })));
    return { term: id(term), unit_total: 1, dimensions, l1_total: global.FortySecondMindBrainState.l1Total(dimensions), status: 'candidate_meaning_field', updated_at: now() };
  }

  function ensure(state) {
    if (!state.language) state.language = {
      term_fields: {},
      semantic_relations: [],
      learning_deltas: [],
      semantic_basis_links: [],
      rejected_semantic_noise: [],
      generated_semantic_proposals: [],
      active_semantic_terms: [],
      receptor_hits: [],
      semantic_memory_feedback: [],
      unit_total_checks: [],
      updated_at: now()
    };
    if (!state.language.semantic_memory_feedback) state.language.semantic_memory_feedback = [];
    Object.keys(SEEDS).forEach(term => { if (!state.language.term_fields[term]) state.language.term_fields[term] = makeField(term, SEEDS[term]); });
    state.language.unit_total_checks = Object.values(state.language.term_fields).map(f => ({ term: f.term, ok: Math.abs(f.l1_total - 1) < 0.00001, l1_total: f.l1_total }));
    state.language.updated_at = now();
    return state.language;
  }

  function extractDefinitionTerm(raw) {
    const value = String(raw || '').trim();
    const match = value.match(/^\s*([A-Za-z][A-Za-z\s_-]{1,42}?)\s+(means|mean|is|refers to|involves|requires)\b/i);
    if (!match) return null;
    const candidate = match[1].trim().replace(/^(a|an|the)\s+/i, '');
    const words = candidate.split(/\s+/).filter(Boolean);
    return words.length <= 4 ? id(candidate) : null;
  }

  function inferDimensionsFromText(raw) {
    const value = String(raw || '').toLowerCase();
    const hits = [];
    RECEPTOR_PATTERNS.forEach(rule => {
      const matched = rule.patterns.some(pattern => pattern.test(value));
      if (matched) hits.push({ dimension: rule.dimension, weight: rule.weight, source: 'language_receptor_pattern' });
    });
    if (!hits.length) return { dimensions: [], hits: [] };
    const merged = {};
    hits.forEach(hit => { merged[hit.dimension] = (merged[hit.dimension] || 0) + hit.weight; });
    const dimensions = normalize(Object.keys(merged).map(dimension => [dimension, merged[dimension]]));
    return { dimensions, hits };
  }

  function knownTermActivations(state, raw) {
    const value = String(raw || '').toLowerCase();
    const meanings = state.semanticBasis && state.semanticBasis.meanings || {};
    return Object.keys(meanings).filter(term => new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(value)).map(term => ({
      term,
      dimensions: arr(meanings[term].dimensions),
      source: 'known_semantic_term_reactivated'
    }));
  }

  function memoryFeedbackForActivations(state, activations, raw) {
    const memory = state.beliefMemory || {};
    const value = String(raw || '').toLowerCase();
    const feedback = [];
    arr(activations).forEach(activation => {
      const term = id(activation.term);
      const dims = arr(activation.dimensions).map(d => d.dimension).filter(Boolean);
      const matchingSemanticLinks = arr(memory.semantic_memory_links).filter(item => item.term === term);
      const matchingTruthContexts = arr(memory.truth_context_items).filter(item => {
        const text = String(item.text || '').toLowerCase();
        return text.includes(term) || value.includes(term);
      });
      const matchingPressureSnapshots = arr(memory.truth_pressure_snapshots).filter(item => matchingTruthContexts.some(ctx => ctx.target_claim_id === item.claim_id || ctx.claim_id === item.claim_id));
      const contextCount = matchingSemanticLinks.length + matchingTruthContexts.length + matchingPressureSnapshots.length;
      if (contextCount > 0) {
        feedback.push({
          term,
          dimensions: dims,
          context_count: contextCount,
          semantic_link_count: matchingSemanticLinks.length,
          truth_context_count: matchingTruthContexts.length,
          pressure_snapshot_count: matchingPressureSnapshots.length,
          shared_substrate_activation_ids: matchingTruthContexts.map(item => item.shared_substrate_activation_id).filter(Boolean).slice(0, 12),
          source: 'belief_memory_context_pressure_not_truth',
          truth_status: 'memory_context_not_truth',
          belief_status: 'context_not_belief_commitment'
        });
      }
    });
    return feedback;
  }

  function proposeFromText(state, event) {
    const field = ensure(state);
    const raw = String(event && event.text || '');
    const term = extractDefinitionTerm(raw);
    const inference = inferDimensionsFromText(raw);
    const proposals = [];
    if (term && inference.dimensions.length >= 2) {
      proposals.push({
        term,
        dimensions: inference.dimensions,
        meta: { source: 'language_semantic_receptor', source_event: event && event.id, receptor_hits: inference.hits }
      });
      field.generated_semantic_proposals.unshift({ term, dimensions: inference.dimensions, receptor_hits: inference.hits, source_event: event && event.id, at: now() });
    }
    const activations = knownTermActivations(state, raw);
    const memoryFeedback = memoryFeedbackForActivations(state, activations, raw);
    activations.forEach(a => field.active_semantic_terms.unshift({ term: a.term, dimensions: a.dimensions.map(d => d.dimension), source_event: event && event.id, at: now() }));
    memoryFeedback.forEach(item => field.semantic_memory_feedback.unshift(Object.assign({ source_event: event && event.id, at: now() }, item)));
    inference.hits.forEach(hit => field.receptor_hits.unshift({ dimension: hit.dimension, source_event: event && event.id, at: now() }));
    field.generated_semantic_proposals = arr(field.generated_semantic_proposals).slice(0, 80);
    field.active_semantic_terms = arr(field.active_semantic_terms).slice(0, 80);
    field.semantic_memory_feedback = arr(field.semantic_memory_feedback).slice(0, 80);
    field.receptor_hits = arr(field.receptor_hits).slice(0, 80);
    field.updated_at = now();
    return { proposals, activations, receptor_hits: inference.hits, memory_feedback: memoryFeedback, definition_term: term };
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
    arr(focus.activated).forEach(activation => {
      field.learning_deltas.unshift({ term: activation.term, delta: 0.02, reason: 'known_term_reactivated_shared_basis', at: now() });
    });
    arr(focus.memory_feedback).forEach(feedback => {
      field.learning_deltas.unshift({ term: feedback.term, delta: 0.015, reason: 'known_term_reactivated_with_memory_context', truth_status: 'memory_context_not_truth', at: now() });
    });
    arr(focus.rejected).forEach(rejection => {
      field.rejected_semantic_noise.unshift({ term: rejection.term, reason: rejection.reason, source_event: focus.source_event, at: now() });
    });

    field.semantic_basis_links = arr(field.semantic_basis_links).slice(0, 80);
    field.rejected_semantic_noise = arr(field.rejected_semantic_noise).slice(0, 80);
    field.learning_deltas = arr(field.learning_deltas).slice(0, 80);
    field.semantic_memory_feedback = arr(field.semantic_memory_feedback).slice(0, 80);
    field.unit_total_checks = Object.values(field.term_fields).map(f => ({ term: f.term, ok: Math.abs(f.l1_total - 1) < 0.00001, l1_total: f.l1_total }));
    field.updated_at = now();
    return field;
  }

  global.FortySecondMindLanguageField = Object.freeze({ SEEDS, RECEPTOR_PATTERNS, makeField, ensure, inferDimensionsFromText, extractDefinitionTerm, knownTermActivations, memoryFeedbackForActivations, proposeFromText, ingest });
})(typeof window !== 'undefined' ? window : globalThis);
