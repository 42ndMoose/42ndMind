/* 42ndMind Truth Field
 * Truth pressure is separate from belief. No final truth promotion.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }
  function clamp01(n) { return global.FortySecondMindBrainState.clamp01(n); }
  function round(n) { return Number((Number(n) || 0).toFixed(6)); }
  function slug(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'claim'; }
  function dimensionNames(rows) { return arr(rows).map(d => typeof d === 'string' ? d : d.dimension).filter(Boolean); }
  function uniq(rows) { return Array.from(new Set(arr(rows).filter(Boolean))); }

  function normalizeDimensions(rows) {
    if (global.FortySecondMindSharedSubstrate) return global.FortySecondMindSharedSubstrate.normalizeSigned(rows);
    return global.FortySecondMindBrainState.normalizeUnitTotal(rows);
  }

  function l1Total(rows) {
    if (global.FortySecondMindSharedSubstrate) return global.FortySecondMindSharedSubstrate.l1Total(rows);
    return global.FortySecondMindBrainState.l1Total(rows);
  }

  function activateTruthPacket(state, packet) {
    if (!global.FortySecondMindSharedSubstrate) return null;
    const activation = global.FortySecondMindSharedSubstrate.activate(state, Object.assign({ source_organ: 'truth_field' }, packet || {}));
    return activation && activation.id;
  }

  function ensure(state) {
    if (!state.truth) state.truth = {
      candidates: [],
      claim_records: [],
      evidence_records: [],
      counterclaim_records: [],
      contradiction_links: [],
      unresolved_gaps: [],
      semantic_requirements: [],
      semantic_activations: [],
      rejected_noise: [],
      pressure: { support: 0, counter: 0, contradiction: 0, unresolved: 0, verification_need: 0, semantic_precision_need: 0, belief_pressure: 0 },
      final_truth_promotion: false,
      updated_at: now()
    };
    if (!state.truth.claim_records) state.truth.claim_records = [];
    if (!state.truth.evidence_records) state.truth.evidence_records = [];
    if (!state.truth.counterclaim_records) state.truth.counterclaim_records = [];
    if (!state.truth.contradiction_links) state.truth.contradiction_links = [];
    if (!state.truth.unresolved_gaps) state.truth.unresolved_gaps = [];
    if (!state.truth.semantic_activations) state.truth.semantic_activations = [];
    if (!state.truth.pressure) state.truth.pressure = {};
    ['support', 'counter', 'contradiction', 'unresolved', 'verification_need', 'semantic_precision_need', 'belief_pressure'].forEach(key => {
      if (state.truth.pressure[key] == null) state.truth.pressure[key] = 0;
    });
    state.truth.final_truth_promotion = false;
    return state.truth;
  }

  function claimDimensions(packet) {
    const explicit = arr(packet && packet.dimensions);
    const rows = explicit.length ? explicit : [
      ['claim_content', 0.34],
      ['evidence_requirement', 0.22],
      ['source_trace', 0.18],
      ['scope_condition', 0.14],
      ['truth_gap_visibility', 0.12]
    ];
    return normalizeDimensions(rows);
  }

  function findClaim(truth, claimId) {
    return arr(truth.claim_records).find(claim => claim.id === claimId || claim.claim_id === claimId) || null;
  }

  function claimSupportSummary(truth, claimId) {
    const evidence = arr(truth.evidence_records).filter(item => item.target_claim_id === claimId);
    const support = evidence.filter(item => item.stance === 'support');
    const counter = evidence.filter(item => item.stance === 'counter');
    const supportSources = uniq(support.map(item => item.source_id));
    const counterSources = uniq(counter.map(item => item.source_id));
    return {
      support_count: support.length,
      counter_count: counter.length,
      independent_support_sources: supportSources,
      independent_counter_sources: counterSources,
      source_independence_score: clamp01(supportSources.length / 3),
      support_weight: round(support.reduce((sum, item) => sum + item.weight, 0)),
      counter_weight: round(counter.reduce((sum, item) => sum + item.weight, 0))
    };
  }

  function refreshClaimPressure(truth, claimId) {
    const claim = findClaim(truth, claimId);
    if (!claim) return null;
    const summary = claimSupportSummary(truth, claimId);
    claim.support_count = summary.support_count;
    claim.counter_count = summary.counter_count;
    claim.independent_support_sources = summary.independent_support_sources;
    claim.independent_counter_sources = summary.independent_counter_sources;
    claim.source_independence_score = summary.source_independence_score;
    claim.support_pressure = clamp01(summary.support_weight);
    claim.counter_pressure = clamp01(summary.counter_weight);
    claim.contradiction_pressure = clamp01(arr(truth.contradiction_links).filter(link => link.target_claim_id === claimId).reduce((sum, link) => sum + link.weight, 0));
    claim.unresolved_pressure = clamp01(1 - Math.min(1, claim.support_pressure + claim.source_independence_score * 0.25) + (claim.counter_pressure * 0.35) + (claim.contradiction_pressure * 0.45));
    claim.truth_status = 'candidate_not_promoted';
    claim.final_truth_promotion = false;
    return claim;
  }

  function addClaim(state, truth, event, packet) {
    const id = slug(packet.claim_id || packet.id || ('claim_' + (truth.claim_records.length + 1)));
    const dimensions = claimDimensions(packet);
    const activationId = activateTruthPacket(state, {
      source_event: event && event.id,
      kind: 'truth_claim_candidate',
      term: id,
      dimensions,
      status: 'claim_candidate_not_promoted'
    });
    const claim = {
      id,
      claim_id: id,
      text: String(packet.text || event && event.text || '').trim(),
      source_event: event && event.id,
      source_id: String(packet.source_id || event && event.meta && event.meta.source || 'unknown_source'),
      unit_total: 1,
      dimensions,
      l1_total: l1Total(dimensions),
      shared_substrate_activation_id: activationId,
      support_count: 0,
      counter_count: 0,
      independent_support_sources: [],
      independent_counter_sources: [],
      source_independence_score: 0,
      support_pressure: 0,
      counter_pressure: 0,
      contradiction_pressure: 0,
      unresolved_pressure: 1,
      belief_pressure: clamp01(packet.belief_pressure || 0),
      truth_status: 'candidate_not_promoted',
      final_truth_promotion: false,
      at: now()
    };
    truth.claim_records.unshift(claim);
    truth.candidates.unshift({ text: claim.text, claim_id: id, truth_status: 'not_adjudicated', promotion_status: 'not_promoted', verification_need: 'open', shared_substrate_activation_id: activationId, at: now() });
    truth.pressure.verification_need = clamp01(truth.pressure.verification_need + 0.16);
    truth.pressure.unresolved = clamp01(truth.pressure.unresolved + 0.12);
    return claim;
  }

  function addEvidence(state, truth, event, packet) {
    const target = slug(packet.target_claim_id || packet.target || packet.claim_id);
    const stance = packet.stance === 'counter' ? 'counter' : 'support';
    const weight = clamp01(packet.weight == null ? 0.35 : packet.weight);
    const dimensions = normalizeDimensions([
      ['evidence_record', 0.34],
      [stance === 'support' ? 'support_pressure' : 'counter_pressure', 0.28],
      ['source_trace', 0.2],
      ['verification_need', 0.18]
    ]);
    const activationId = activateTruthPacket(state, {
      source_event: event && event.id,
      kind: stance === 'support' ? 'truth_support_evidence' : 'truth_counter_evidence',
      term: target,
      dimensions,
      status: 'evidence_record_not_truth_promotion'
    });
    const record = {
      id: slug(packet.evidence_id || ('evidence_' + (truth.evidence_records.length + 1))),
      target_claim_id: target,
      stance,
      source_id: String(packet.source_id || event && event.meta && event.meta.source || 'unknown_source'),
      text: String(packet.text || '').trim(),
      weight,
      unit_total: 1,
      dimensions,
      l1_total: l1Total(dimensions),
      shared_substrate_activation_id: activationId,
      truth_status: 'evidence_not_final_truth',
      at: now()
    };
    truth.evidence_records.unshift(record);
    truth.pressure[stance === 'support' ? 'support' : 'counter'] = clamp01(truth.pressure[stance === 'support' ? 'support' : 'counter'] + weight);
    truth.pressure.verification_need = clamp01(truth.pressure.verification_need + 0.06);
    refreshClaimPressure(truth, target);
    return record;
  }

  function addCounterclaim(state, truth, event, packet) {
    const target = slug(packet.target_claim_id || packet.target);
    const id = slug(packet.claim_id || packet.id || ('counterclaim_' + (truth.counterclaim_records.length + 1)));
    const weight = clamp01(packet.weight == null ? 0.55 : packet.weight);
    const dimensions = normalizeDimensions([
      ['counterclaim_content', 0.34],
      ['contradiction_pressure', 0.3],
      ['source_trace', 0.18],
      ['unresolved_gap', 0.18]
    ]);
    const activationId = activateTruthPacket(state, {
      source_event: event && event.id,
      kind: 'truth_counterclaim',
      term: id,
      dimensions,
      status: 'counterclaim_not_resolution'
    });
    const counterclaim = {
      id,
      target_claim_id: target,
      text: String(packet.text || '').trim(),
      source_id: String(packet.source_id || event && event.meta && event.meta.source || 'unknown_source'),
      weight,
      unit_total: 1,
      dimensions,
      l1_total: l1Total(dimensions),
      shared_substrate_activation_id: activationId,
      truth_status: 'counterclaim_not_final_truth',
      at: now()
    };
    truth.counterclaim_records.unshift(counterclaim);
    truth.contradiction_links.unshift({
      id: 'contradiction_' + (truth.contradiction_links.length + 1),
      target_claim_id: target,
      counterclaim_id: id,
      weight,
      source_event: event && event.id,
      shared_substrate_activation_id: activationId,
      status: 'contradiction_detected_not_resolved',
      at: now()
    });
    truth.unresolved_gaps.unshift({
      id: 'gap_' + (truth.unresolved_gaps.length + 1),
      target_claim_id: target,
      reason: 'counterclaim_requires_adjudication',
      pressure: weight,
      source_event: event && event.id,
      at: now()
    });
    truth.pressure.counter = clamp01(truth.pressure.counter + weight);
    truth.pressure.contradiction = clamp01(truth.pressure.contradiction + weight);
    truth.pressure.unresolved = clamp01(truth.pressure.unresolved + weight * 0.8);
    refreshClaimPressure(truth, target);
    return counterclaim;
  }

  function processTruthPackets(state, truth, event) {
    const packets = arr(event && event.meta && event.meta.truth_packets);
    packets.forEach(packet => {
      if (!packet || !packet.kind) return;
      if (packet.kind === 'claim') addClaim(state, truth, event, packet);
      if (packet.kind === 'evidence') addEvidence(state, truth, event, packet);
      if (packet.kind === 'counterclaim') addCounterclaim(state, truth, event, packet);
    });
  }

  function applySemanticPressure(truth, term, dims, sourceEvent, kind) {
    truth.semantic_activations.unshift({
      kind,
      term,
      dimensions: dims,
      source_event: sourceEvent,
      truth_status: 'semantic_activation_not_truth',
      at: now()
    });
    if (dims.includes('reality_contact')) truth.pressure.verification_need = clamp01(truth.pressure.verification_need + 0.05);
    if (dims.includes('self_correction') || dims.includes('false_certainty_resistance')) truth.pressure.semantic_precision_need = clamp01(truth.pressure.semantic_precision_need + 0.08);
    if (dims.includes('information_grasp')) truth.pressure.verification_need = clamp01(truth.pressure.verification_need + 0.03);
  }

  function ingest(state, event, semanticBasisResult) {
    const truth = ensure(state);
    const text = String(event && event.text || '').toLowerCase();
    const looksClaimLike = /\b(is|are|was|were|means|because|proves|shows|true|false)\b/.test(text);
    if (looksClaimLike) {
      truth.candidates.unshift({ text: event.text, truth_status: 'not_adjudicated', promotion_status: 'not_promoted', verification_need: 'open', at: now() });
      truth.pressure.verification_need = clamp01(truth.pressure.verification_need + 0.2);
    }

    processTruthPackets(state, truth, event);

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
      truth.pressure.semantic_precision_need = clamp01(truth.pressure.semantic_precision_need + 0.04);
    });

    truth.claim_records = arr(truth.claim_records).slice(0, 80);
    truth.evidence_records = arr(truth.evidence_records).slice(0, 120);
    truth.counterclaim_records = arr(truth.counterclaim_records).slice(0, 80);
    truth.contradiction_links = arr(truth.contradiction_links).slice(0, 80);
    truth.unresolved_gaps = arr(truth.unresolved_gaps).slice(0, 80);
    truth.candidates = truth.candidates.slice(0, 80);
    truth.semantic_requirements = arr(truth.semantic_requirements).slice(0, 80);
    truth.semantic_activations = arr(truth.semantic_activations).slice(0, 80);
    truth.rejected_noise = arr(truth.rejected_noise).slice(0, 80);
    truth.final_truth_promotion = false;
    truth.updated_at = now();
    return truth;
  }

  global.FortySecondMindTruthField = Object.freeze({ ensure, ingest, addClaim, addEvidence, addCounterclaim, refreshClaimPressure });
})(typeof window !== 'undefined' ? window : globalThis);
