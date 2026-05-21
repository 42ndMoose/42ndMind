/* 42ndMind Truth Field
 * Truth pressure is separate from belief. No final truth promotion.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }

  function ensure(state) {
    if (!state.truth) state.truth = { candidates: [], pressure: { support: 0, counter: 0, contradiction: 0, unresolved: 0, verification_need: 0 }, final_truth_promotion: false, updated_at: now() };
    return state.truth;
  }

  function ingest(state, event) {
    const truth = ensure(state);
    const text = String(event && event.text || '').toLowerCase();
    const looksClaimLike = /\b(is|are|was|were|means|because|proves|shows|true|false)\b/.test(text);
    if (looksClaimLike) {
      truth.candidates.unshift({ text: event.text, truth_status: 'not_adjudicated', promotion_status: 'not_promoted', verification_need: 'open', at: now() });
      truth.pressure.verification_need = Math.min(1, truth.pressure.verification_need + 0.2);
    }
    truth.candidates = truth.candidates.slice(0, 80);
    truth.updated_at = now();
    return truth;
  }

  global.FortySecondMindTruthField = Object.freeze({ ensure, ingest });
})(typeof window !== 'undefined' ? window : globalThis);
