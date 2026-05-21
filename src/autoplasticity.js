/* 42ndMind Autoplasticity
 * Internal self-improvement pressure. No external patch approval loop yet.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }

  function ensure(state) {
    if (!state.autoplasticity) state.autoplasticity = { weak_patterns: [], adjustment_impulses: [], applied_adjustments: [], updated_at: now() };
    return state.autoplasticity;
  }

  function observe(state) {
    const auto = ensure(state);
    const languageChecks = state.language && state.language.unit_total_checks || [];
    languageChecks.filter(c => !c.ok).forEach(c => auto.weak_patterns.unshift({ kind: 'unit_total_violation', target: c.term, at: now() }));
    auto.weak_patterns = auto.weak_patterns.slice(0, 80);
    auto.updated_at = now();
    return auto;
  }

  global.FortySecondMindAutoplasticity = Object.freeze({ ensure, observe });
})(typeof window !== 'undefined' ? window : globalThis);
