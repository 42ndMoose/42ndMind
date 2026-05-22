/* 42ndMind Truth Field
 * Truth pressure is separate from belief. No final truth promotion.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }

  function ensure(state) {
    if (!state.truth) state.truth = {
      candidates: [],
      semantic_requirements: [],
      semantic_activations: [],
      rejected_noise: [],
      pressure: { support: 0, counter: 0, contradiction: 0, unresolved: 0, verification_need: 0, semantic_precision_need: 0 },
      final_truth_promotion: false,
      updated_at: now()
    };
    if (state.truth.pressure.semantic_precision_need == null) state.truth.pressure.semantic_precision_need = 0;
    if (!state.truth.semantic_activations) state.truth.semantic_activations = [];
    return state.truth;
  }

  function dimensionNames(rows) { return arr(rows).map(d => typeof d === 'string' ? d : d.dimension).filter(Boolean); }

  function applySemanticPressure(truth, term, dims, sourceEvent, kind) {
    truth.semantic_activations.unshift({
      kind,
      term,
      dimensions: dims,
      source_event: sourceEvent,
      truth_status: 'semantic_activation_not_truth',
      at: now()
    });
    if (dims.includes('reality_contact')) truth.pressure.verification_need = Math.min(1, truth.pressure.verification_need + 0.05);
    if (dims.includes('self_correction') || dims.includes('false_certainty_resistance')) truth.pressure.semantic_precision_need = Math.min(1, truth.pressure.semantic_precision_need + 0.08);
    if (dims.includes('information_grasp')) truth.pressure.verification_need = Math.min(1, truth.pressure.verification_need + 0.03);
  }

  function ingest(state, event, semanticBasisResult) {
    const truth = ensure(state);
    const text = String(event && event.text || '').toLowerCase();
    const looksClaimLike = /\b(is|are|was|were|means|because|proves|shows|true|false)\b/.test(text);
    if (looksClaimLike) {
      truth.candidates.unshift({ text: event.text, truth_status: 'not_adjudicated', promotion_status: 'not_promoted', verification_need: 'open', at: now() });
      truth.pressure.verification_need = Math.min(1, truth.pressure.verification_need + 0.2);
    }

    const focus = state.semanticFocus || {};
    arr(focus.admitted).forEach(meaning => {
      const dims = dimensionNames(meaning.dimensions);
      truth.semantic_requirements.unshift({
        kind: 'semantic_basis_requirement',
        term: meaning.term,
        dimensions: dims,
        source_event: focus.source_event,
        truth_status: 'meaning_candidate_not_truth',
        requirement: 'future_claims_using_this_term_must_preserve_reality_contact_self_correction_and_scope',
        at: now()
      });
      applySemanticPressure(truth, meaning.term, dims, focus.source_event, 'admitted_meaning_pressure');
    });
    arr(focus.activated).forEach(activation => {
      applySemanticPressure(truth, activation.term, dimensionNames(activation.dimensions), focus.source_event, 'known_meaning_reactivation_pressure');
    });
    arr(focus.rejected).forEach(rejection => {
      truth.rejected_noise.unshift({ kind: 'semantic_noise_not_truth_candidate', term: rejection.term, reason: rejection.reason, source_event: focus.source_event, at: now() });
      truth.pressure.semantic_precision_need = Math.min(1, truth.pressure.semantic_precision_need + 0.04);
    });

    truth.candidates = truth.candidates.slice(0, 80);
    truth.semantic_requirements = arr(truth.semantic_requirements).slice(0, 80);
    truth.semantic_activations = arr(truth.semantic_activations).slice(0, 80);
    truth.rejected_noise = arr(truth.rejected_noise).slice(0, 80);
    truth.updated_at = now();
    return truth;
  }

  global.FortySecondMindTruthField = Object.freeze({ ensure, ingest });
})(typeof window !== 'undefined' ? window : globalThis);
