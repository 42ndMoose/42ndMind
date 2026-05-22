/* 42ndMind Clean Kernel
 * One brain. Separate organs. Communication motor owns visible output.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }
  function hasSemanticBasis() { return !!global.FortySecondMindSemanticBasisCore; }

  function createKernel(seed) {
    const state = global.FortySecondMindBrainState.createBrainState(seed || {});
    global.FortySecondMindMaturityCore.ensure(state);
    ensureSemanticBasis(state);
    global.FortySecondMindLanguageField.ensure(state);
    global.FortySecondMindNeuralField.ensure(state);
    global.FortySecondMindBeliefMemoryField.ensure(state);
    global.FortySecondMindTruthField.ensure(state);
    global.FortySecondMindCommunicationMotor.ensure(state);
    global.FortySecondMindAutoplasticity.ensure(state);
    return {
      state,
      ingest(text, meta) {
        const event = { id: 'event_' + (state.events.length + 1), text: String(text || ''), meta: meta || {}, at: now() };
        state.events.push(event);
        global.FortySecondMindMaturityCore.ensure(state);
        const semanticBasisResult = runSemanticBasisStep(state, event);
        circulateSemanticFocus(state, event, semanticBasisResult);
        global.FortySecondMindLanguageField.ingest(state, event, semanticBasisResult);
        global.FortySecondMindNeuralField.activate(state, pressureFromEvent(event, semanticBasisResult));
        global.FortySecondMindBeliefMemoryField.ingest(state, event, semanticBasisResult);
        global.FortySecondMindTruthField.ingest(state, event, semanticBasisResult);
        global.FortySecondMindAutoplasticity.observe(state);
        const output = global.FortySecondMindCommunicationMotor.select(state);
        state.updated_at = now();
        return { event, semanticBasisResult, output, state };
      },
      proposeMeaning(term, dimensions, meta) {
        ensureSemanticBasis(state);
        const result = global.FortySecondMindSemanticBasisCore.admitCandidate(state.semanticBasis, term, dimensions, meta || { source: 'kernel_proposeMeaning' });
        circulateSemanticFocus(state, { id: 'manual_proposal', text: term, meta: meta || {}, at: now() }, { available: true, action: 'manual_meaning_proposal', proposal_count: 1, admitted_count: result.admitted ? 1 : 0, rejected_count: result.admitted ? 0 : 1, results: [result] });
        state.updated_at = now();
        return result;
      },
      snapshot() { return global.FortySecondMindBrainState.clone(state); }
    };
  }

  function ensureSemanticBasis(state) {
    if (!hasSemanticBasis()) return null;
    if (!state.semanticBasis) state.semanticBasis = global.FortySecondMindSemanticBasisCore.sampleCore();
    return state.semanticBasis;
  }

  function runSemanticBasisStep(state, event) {
    const core = ensureSemanticBasis(state);
    if (!core) return { available: false, action: 'semantic_basis_unavailable' };
    const proposals = event && event.meta && Array.isArray(event.meta.meaning_proposals) ? event.meta.meaning_proposals : [];
    const results = proposals.map(p => global.FortySecondMindSemanticBasisCore.admitCandidate(core, p.term, p.dimensions, Object.assign({ source_event: event.id }, p.meta || {})));
    return {
      available: true,
      action: proposals.length ? 'evaluated_meaning_proposals' : 'no_meaning_proposals',
      proposal_count: proposals.length,
      admitted_count: results.filter(r => r.admitted).length,
      rejected_count: results.filter(r => !r.admitted).length,
      results
    };
  }

  function compactMeaning(meaning) {
    return meaning ? { term: meaning.term, dimensions: meaning.dimensions, l1_total: meaning.l1_total, status: meaning.status } : null;
  }

  function circulateSemanticFocus(state, event, semanticBasisResult) {
    const result = semanticBasisResult || { results: [] };
    const admitted = (result.results || []).filter(r => r.admitted).map(r => compactMeaning(r.meaning));
    const rejected = (result.results || []).filter(r => !r.admitted).map(r => ({ term: r.evaluation && r.evaluation.term, reason: r.evaluation && r.evaluation.reason, evaluation: r.evaluation }));
    state.semanticFocus = {
      source_event: event && event.id,
      action: result.action || 'none',
      admitted,
      rejected,
      admitted_terms: admitted.map(m => m.term),
      rejected_terms: rejected.map(r => r.term),
      active_dimensions: admitted.reduce((dims, m) => dims.concat((m.dimensions || []).map(d => d.dimension)), []),
      updated_at: now()
    };
    return state.semanticFocus;
  }

  function pressureFromEvent(event, semanticBasisResult) {
    const text = String(event && event.text || '').toLowerCase();
    const semanticPressure = semanticBasisResult && semanticBasisResult.proposal_count
      ? 0.12 + semanticBasisResult.admitted_count * 0.06 + semanticBasisResult.rejected_count * 0.04
      : 0;
    return {
      language_math: (/\b(language|meaning|truth|belief|memory|communication|formula|unit|semantic|basis)\b/.test(text) ? 0.25 : 0.05) + semanticPressure,
      truth_tracking: (/\b(true|truth|fact|evidence|verify|false|because)\b/.test(text) ? 0.25 : 0.05) + (semanticPressure ? 0.04 : 0),
      belief_memory: semanticPressure ? 0.08 : 0.02,
      communication_motor: /\?\s*$|\b(answer|say|ask|communicate)\b/.test(text) ? 0.25 : 0.02,
      curiosity_drive: /\?\s*$/.test(text) ? 0.18 : 0.03,
      core_maturity: 0.1,
      doubt_inhibitor: 0.08
    };
  }

  global.FortySecondMindKernel = Object.freeze({ createKernel, pressureFromEvent, ensureSemanticBasis, runSemanticBasisStep, circulateSemanticFocus });
})(typeof window !== 'undefined' ? window : globalThis);
