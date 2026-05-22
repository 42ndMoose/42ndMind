/* 42ndMind Belief-Memory Field
 * Memory is belief/context. It is not a separate self and does not promote truth.
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
      truth_context_items: [],
      truth_pressure_snapshots: [],
      rejected_noise_memory: [],
      updated_at: now()
    };
    if (!state.beliefMemory.semantic_reactivations) state.beliefMemory.semantic_reactivations = [];
    if (!state.beliefMemory.truth_context_items) state.beliefMemory.truth_context_items = [];
    if (!state.beliefMemory.truth_pressure_snapshots) state.beliefMemory.truth_pressure_snapshots = [];
    return state.beliefMemory;
  }

  function eventActivationIds(state, event) {
    const eventId = event && event.id;
    if (!eventId || !state.sharedSubstrate) return [];
    return arr(state.sharedSubstrate.activations).filter(item => item.source_event === eventId).map(item => item.id);
  }

  function findClaim(truth, claimId) {
    return arr(truth && truth.claim_records).find(claim => claim.id === claimId || claim.claim_id === claimId) || null;
  }

  function pressureSnapshot(truth, claim) {
    const globalPressure = truth && truth.pressure || {};
    return {
      claim_id: claim && (claim.id || claim.claim_id) || null,
      support_pressure: Number(claim && claim.support_pressure || 0),
      counter_pressure: Number(claim && claim.counter_pressure || 0),
      contradiction_pressure: Number(claim && claim.contradiction_pressure || 0),
      unresolved_pressure: Number(claim && claim.unresolved_pressure || 0),
      global_support_pressure: Number(globalPressure.support || 0),
      global_counter_pressure: Number(globalPressure.counter || 0),
      global_contradiction_pressure: Number(globalPressure.contradiction || 0),
      global_unresolved_pressure: Number(globalPressure.unresolved || 0),
      verification_need: Number(globalPressure.verification_need || 0),
      semantic_precision_need: Number(globalPressure.semantic_precision_need || 0)
    };
  }

  function alreadyStored(field, memoryKey) {
    return arr(field.truth_context_items).some(item => item.memory_key === memoryKey);
  }

  function storeTruthContext(field, item) {
    if (!item || !item.memory_key || alreadyStored(field, item.memory_key)) return null;
    field.truth_context_items.unshift(item);
    return item;
  }

  function consolidateTruthContext(state, event) {
    const field = ensure(state);
    const truth = state.truth || {};
    const activationIds = eventActivationIds(state, event);
    if (!activationIds.length && !arr(truth.claim_records).length) return field;

    const fromThisEvent = item => item && (item.source_event === (event && event.id) || activationIds.includes(item.shared_substrate_activation_id));
    const claims = arr(truth.claim_records).filter(fromThisEvent);
    const evidence = arr(truth.evidence_records).filter(fromThisEvent);
    const counterclaims = arr(truth.counterclaim_records).filter(fromThisEvent);
    const gaps = arr(truth.unresolved_gaps).filter(item => item && item.source_event === (event && event.id));

    claims.forEach(claim => {
      const snapshot = pressureSnapshot(truth, claim);
      const stored = storeTruthContext(field, {
        memory_key: 'truth_claim_context:' + claim.id + ':' + (event && event.id),
        kind: 'truth_claim_context',
        claim_id: claim.id,
        source_id: claim.source_id,
        text: claim.text,
        shared_substrate_activation_id: claim.shared_substrate_activation_id,
        pressure_snapshot: snapshot,
        truth_status: 'claim_candidate_not_truth',
        belief_status: 'context_not_belief_commitment',
        belief_movement: 'context_storage_only',
        source_event: event && event.id,
        at: now()
      });
      if (stored) {
        field.provisional_beliefs.unshift({
          kind: 'truth_pressure_context_available',
          claim_id: claim.id,
          belief_status: 'not_belief_commitment',
          truth_status: 'not_final',
          pressure_snapshot: snapshot,
          at: now()
        });
      }
    });

    evidence.forEach(record => {
      const claim = findClaim(truth, record.target_claim_id);
      const snapshot = pressureSnapshot(truth, claim);
      storeTruthContext(field, {
        memory_key: 'truth_evidence_context:' + record.id + ':' + (event && event.id),
        kind: 'truth_evidence_context',
        evidence_id: record.id,
        target_claim_id: record.target_claim_id,
        stance: record.stance,
        source_id: record.source_id,
        text: record.text,
        weight: record.weight,
        shared_substrate_activation_id: record.shared_substrate_activation_id,
        pressure_snapshot: snapshot,
        truth_status: 'evidence_context_not_truth',
        belief_status: 'context_not_belief_commitment',
        belief_movement: 'support_counter_context_only',
        source_event: event && event.id,
        at: now()
      });
    });

    counterclaims.forEach(counterclaim => {
      const claim = findClaim(truth, counterclaim.target_claim_id);
      const snapshot = pressureSnapshot(truth, claim);
      storeTruthContext(field, {
        memory_key: 'truth_counterclaim_context:' + counterclaim.id + ':' + (event && event.id),
        kind: 'truth_counterclaim_context',
        counterclaim_id: counterclaim.id,
        target_claim_id: counterclaim.target_claim_id,
        source_id: counterclaim.source_id,
        text: counterclaim.text,
        weight: counterclaim.weight,
        shared_substrate_activation_id: counterclaim.shared_substrate_activation_id,
        pressure_snapshot: snapshot,
        truth_status: 'counterclaim_context_not_truth',
        belief_status: 'context_not_belief_commitment',
        belief_movement: 'contradiction_context_only',
        source_event: event && event.id,
        at: now()
      });
      field.truth_pressure_snapshots.unshift({
        kind: 'truth_pressure_after_counterclaim',
        claim_id: counterclaim.target_claim_id,
        counterclaim_id: counterclaim.id,
        pressure_snapshot: snapshot,
        source_event: event && event.id,
        at: now()
      });
    });

    gaps.forEach(gap => {
      field.open_truth_requirements.unshift({
        kind: 'unresolved_truth_gap_context',
        target_claim_id: gap.target_claim_id,
        reason: gap.reason,
        pressure: gap.pressure,
        truth_status: 'unresolved_not_truth',
        belief_status: 'context_not_belief_commitment',
        source_event: event && event.id,
        at: now()
      });
    });

    return field;
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

    consolidateTruthContext(state, event);

    field.memory_items = arr(field.memory_items).slice(0, 120);
    field.provisional_beliefs = arr(field.provisional_beliefs).slice(0, 120);
    field.belief_challenges = arr(field.belief_challenges).slice(0, 120);
    field.open_truth_requirements = arr(field.open_truth_requirements).slice(0, 120);
    field.semantic_memory_links = arr(field.semantic_memory_links).slice(0, 120);
    field.semantic_reactivations = arr(field.semantic_reactivations).slice(0, 120);
    field.truth_context_items = arr(field.truth_context_items).slice(0, 160);
    field.truth_pressure_snapshots = arr(field.truth_pressure_snapshots).slice(0, 120);
    field.rejected_noise_memory = arr(field.rejected_noise_memory).slice(0, 120);
    field.updated_at = now();
    return field;
  }

  global.FortySecondMindBeliefMemoryField = Object.freeze({ ensure, ingest, consolidateTruthContext });
})(typeof window !== 'undefined' ? window : globalThis);
