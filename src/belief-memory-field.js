/* 42ndMind Belief-Memory Field
 * Memory is belief/context. It is not a separate self.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }
  function dimNames(rows) { return arr(rows).map(d => typeof d === 'string' ? d : d.dimension).filter(Boolean); }

  function ensure(state) {
    if (!state.beliefMemory) state.beliefMemory = {
      memory_items: [],
      provisional_beliefs: [],
      belief_challenges: [],
      open_truth_requirements: [],
      semantic_memory_links: [],
      semantic_reactivations: [],
      rejected_noise_memory: [],
      updated_at: now()
    };
    if (!state.beliefMemory.semantic_reactivations) state.beliefMemory.semantic_reactivations = [];
    return state.beliefMemory;
  }

  function ingest(state, event, semanticBasisResult) {
    const field = ensure(state);
    const text = String(event && event.text || '').trim();
    if (text) field.memory_items.unshift({ kind: 'raw_user_context', text, source: 'direct_user', truth_status: 'not_final', belief_movement: 'provisional_only', at: now() });

    const focus = state.semanticFocus || {};
    arr(focus.admitted).forEach(meaning => {
      field.semantic_memory_links.unshift({
        kind: 'admitted_semantic_meaning',
        term: meaning.term,
        dimensions: dimNames(meaning.dimensions),
        source_event: focus.source_event,
        truth_status: 'meaning_candidate_not_truth',
        belief_movement: 'context_link_only',
        at: now()
      });
      field.provisional_beliefs.unshift({
        kind: 'meaning_available_for_future_context',
        term: meaning.term,
        status: 'provisional_semantic_context',
        truth_status: 'not_final',
        belief_movement: 'none',
        at: now()
      });
    });
    arr(focus.activated).forEach(activation => {
      field.semantic_reactivations.unshift({
        kind: 'known_meaning_reactivated_from_language',
        term: activation.term,
        dimensions: dimNames(activation.dimensions),
        source_event: focus.source_event,
        truth_status: 'not_final',
        belief_movement: 'context_reactivation_only',
        at: now()
      });
    });
    arr(focus.rejected).forEach(rejection => {
      field.rejected_noise_memory.unshift({
        kind: 'rejected_semantic_noise',
        term: rejection.term,
        reason: rejection.reason,
        source_event: focus.source_event,
        belief_movement: 'none',
        at: now()
      });
    });

    field.memory_items = arr(field.memory_items).slice(0, 120);
    field.provisional_beliefs = arr(field.provisional_beliefs).slice(0, 120);
    field.semantic_memory_links = arr(field.semantic_memory_links).slice(0, 120);
    field.semantic_reactivations = arr(field.semantic_reactivations).slice(0, 120);
    field.rejected_noise_memory = arr(field.rejected_noise_memory).slice(0, 120);
    field.updated_at = now();
    return field;
  }

  global.FortySecondMindBeliefMemoryField = Object.freeze({ ensure, ingest });
})(typeof window !== 'undefined' ? window : globalThis);
