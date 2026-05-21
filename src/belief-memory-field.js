/* 42ndMind Belief-Memory Field
 * Memory is belief/context. It is not a separate self.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }

  function ensure(state) {
    if (!state.beliefMemory) state.beliefMemory = { memory_items: [], provisional_beliefs: [], belief_challenges: [], open_truth_requirements: [], updated_at: now() };
    return state.beliefMemory;
  }

  function ingest(state, event) {
    const field = ensure(state);
    const text = String(event && event.text || '').trim();
    if (text) field.memory_items.unshift({ kind: 'raw_user_context', text, source: 'direct_user', truth_status: 'not_final', belief_movement: 'provisional_only', at: now() });
    field.memory_items = arr(field.memory_items).slice(0, 120);
    field.updated_at = now();
    return field;
  }

  global.FortySecondMindBeliefMemoryField = Object.freeze({ ensure, ingest });
})(typeof window !== 'undefined' ? window : globalThis);
