/* 42ndMind Kernel
 * One brain. Separate organs. Communication motor owns visible output.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }
  function hasSemanticBasis() { return !!global.FortySecondMindSemanticBasisCore; }
  function hasSharedSubstrate() { return !!global.FortySecondMindSharedSubstrate; }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }

  function createKernel(seed) {
    const state = global.FortySecondMindBrainState.createBrainState(seed || {});
    if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.ensure(state);
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
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.ensure(state);
        global.FortySecondMindMaturityCore.ensure(state);
        const languageReceptorResult = global.FortySecondMindLanguageField.proposeFromText(state, event);
        const semanticBasisResult = runSemanticBasisStep(state, event, languageReceptorResult);
        circulateSemanticFocus(state, event, semanticBasisResult, languageReceptorResult);
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.applySemanticFocus(state, event);
        global.FortySecondMindLanguageField.ingest(state, event, semanticBasisResult);
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.recordOrganLink(state, 'language', event, 'read_write_semantic_focus');
        global.FortySecondMindNeuralField.activate(state, pressureFromEvent(event, semanticBasisResult, languageReceptorResult));
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.recordOrganLink(state, 'neural', event, 'received_shared_activation_pressure');
        global.FortySecondMindTruthField.ingest(state, event, semanticBasisResult);
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.recordOrganLink(state, 'truth', event, 'tracked_shared_activation_requirements');
        global.FortySecondMindBeliefMemoryField.ingest(state, event, semanticBasisResult);
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.recordOrganLink(state, 'belief_memory', event, 'contextualized_shared_activation');
        global.FortySecondMindAutoplasticity.observe(state);
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.recordOrganLink(state, 'autoplasticity', event, 'observed_shared_activation_health');
        const output = global.FortySecondMindCommunicationMotor.select(state);
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.recordOrganLink(state, 'communication', event, 'selected_motor_output_from_state');
        state.updated_at = now();
        return { event, languageReceptorResult, semanticBasisResult, output, state };
      },
      proposeMeaning(term, dimensions, meta) {
        ensureSemanticBasis(state);
        const result = global.FortySecondMindSemanticBasisCore.admitCandidate(state.semanticBasis, term, dimensions, meta || { source: 'kernel_proposeMeaning' });
        circulateSemanticFocus(state, { id: 'manual_proposal', text: term, meta: meta || {}, at: now() }, { available: true, action: 'manual_meaning_proposal', proposal_count: 1, admitted_count: result.admitted ? 1 : 0, rejected_count: result.admitted ? 0 : 1, results: [result] }, { proposals: [], activations: [], receptor_hits: [], memory_feedback: [] });
        if (hasSharedSubstrate()) global.FortySecondMindSharedSubstrate.applySemanticFocus(state, { id: 'manual_proposal' });
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

  function runSemanticBasisStep(state, event, languageReceptorResult) {
    const core = ensureSemanticBasis(state);
    if (!core) return { available: false, action: 'semantic_basis_unavailable' };
    const explicit = event && event.meta && Array.isArray(event.meta.meaning_proposals) ? event.meta.meaning_proposals : [];
    const generated = arr(languageReceptorResult && languageReceptorResult.proposals);
    const proposals = explicit.concat(generated);
    const results = proposals.map(p => global.FortySecondMindSemanticBasisCore.admitCandidate(core, p.term, p.dimensions, Object.assign({ source_event: event.id }, p.meta || {})));
    return {
      available: true,
      action: proposals.length ? 'evaluated_meaning_proposals' : 'no_meaning_proposals',
      proposal_count: proposals.length,
      explicit_proposal_count: explicit.length,
      generated_proposal_count: generated.length,
      admitted_count: results.filter(r => r.admitted).length,
      rejected_count: results.filter(r => !r.admitted).length,
      results
    };
  }

  function compactMeaning(meaning) {
    return meaning ? { term: meaning.term, dimensions: meaning.dimensions, l1_total: meaning.l1_total, status: meaning.status } : null;
  }

  function circulateSemanticFocus(state, event, semanticBasisResult, languageReceptorResult) {
    const result = semanticBasisResult || { results: [] };
    const admitted = arr(result.results).filter(r => r.admitted).map(r => compactMeaning(r.meaning));
    const rejected = arr(result.results).filter(r => !r.admitted).map(r => ({ term: r.evaluation && r.evaluation.term, reason: r.evaluation && r.evaluation.reason, evaluation: r.evaluation }));
    const activated = arr(languageReceptorResult && languageReceptorResult.activations).map(a => ({ term: a.term, dimensions: a.dimensions, source: a.source }));
    const memoryFeedback = arr(languageReceptorResult && languageReceptorResult.memory_feedback).map(f => ({
      term: f.term,
      dimensions: f.dimensions,
      context_count: f.context_count,
      semantic_link_count: f.semantic_link_count,
      truth_context_count: f.truth_context_count,
      pressure_snapshot_count: f.pressure_snapshot_count,
      shared_substrate_activation_ids: arr(f.shared_substrate_activation_ids),
      source: f.source,
      truth_status: f.truth_status,
      belief_status: f.belief_status
    }));
    const receptorHits = arr(languageReceptorResult && languageReceptorResult.receptor_hits);
    state.semanticFocus = {
      source_event: event && event.id,
      action: result.action || 'none',
      admitted,
      rejected,
      activated,
      memory_feedback: memoryFeedback,
      receptor_hits: receptorHits,
      admitted_terms: admitted.map(m => m.term),
      rejected_terms: rejected.map(r => r.term),
      activated_terms: activated.map(a => a.term),
      memory_feedback_terms: memoryFeedback.map(f => f.term),
      active_dimensions: admitted.reduce((dims, m) => dims.concat((m.dimensions || []).map(d => d.dimension)), [])
        .concat(activated.reduce((dims, a) => dims.concat(arr(a.dimensions).map(d => d.dimension)), []))
        .concat(memoryFeedback.reduce((dims, f) => dims.concat(arr(f.dimensions)), []))
        .concat(receptorHits.map(h => h.dimension)),
      generated_proposal_count: result.generated_proposal_count || 0,
      receptor_hit_count: receptorHits.length,
      memory_feedback_count: memoryFeedback.length,
      updated_at: now()
    };
    return state.semanticFocus;
  }

  function pressureFromEvent(event, semanticBasisResult, languageReceptorResult) {
    const text = String(event && event.text || '').toLowerCase();
    const semanticPressure = semanticBasisResult && semanticBasisResult.proposal_count
      ? 0.12 + semanticBasisResult.admitted_count * 0.06 + semanticBasisResult.rejected_count * 0.04
      : 0;
    const activationPressure = arr(languageReceptorResult && languageReceptorResult.activations).length ? 0.08 : 0;
    const memoryPressure = arr(languageReceptorResult && languageReceptorResult.memory_feedback).length ? 0.06 : 0;
    const receptorPressure = arr(languageReceptorResult && languageReceptorResult.receptor_hits).length ? 0.05 : 0;
    const substratePressure = hasSharedSubstrate() && event ? 0.03 : 0;
    return {
      language_math: (/\b(language|meaning|truth|belief|memory|communication|formula|unit|semantic|basis)\b/.test(text) ? 0.25 : 0.05) + semanticPressure + receptorPressure + activationPressure + memoryPressure + substratePressure,
      truth_tracking: (/\b(true|truth|fact|evidence|verify|false|because)\b/.test(text) ? 0.25 : 0.05) + (semanticPressure || activationPressure || memoryPressure ? 0.04 : 0),
      belief_memory: semanticPressure || activationPressure || memoryPressure ? 0.08 + memoryPressure : 0.02,
      communication_motor: /\?\s*$|\b(answer|say|ask|communicate)\b/.test(text) ? 0.25 : 0.02,
      curiosity_drive: /\?\s*$/.test(text) ? 0.18 : 0.03,
      core_maturity: 0.1,
      doubt_inhibitor: 0.08
    };
  }

  global.FortySecondMindKernel = Object.freeze({ createKernel, pressureFromEvent, ensureSemanticBasis, runSemanticBasisStep, circulateSemanticFocus });
})(typeof window !== 'undefined' ? window : globalThis);
