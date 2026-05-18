/* 42ndMind Objective Claim-Language Kernel v0.1.1 Patch
 * Fixes motive-overclaim dependency emission by prioritizing hidden-motive markers over generic causal markers.
 * Deterministic. No LLM. No source lookup. Candidate only.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';
  const PACKET_TYPE = '42ndMind_objective_claim_language_v0_1_1';

  function baseApi() {
    if (!global.KernelObjectiveClaimLanguageV01) throw new Error('KernelObjectiveClaimLanguageV01 unavailable');
    return global.KernelObjectiveClaimLanguageV01;
  }

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function doctrine() {
    const d = baseApi().doctrine();
    d.motive_markers_outrank_generic_causal_markers = true;
    d.hidden_motive_claim_requires_motive_evidence_dependency = true;
    d.patch_version = VERSION;
    return d;
  }

  function classifyClaimKind(claimText, packet) {
    const s = lower(claimText);
    const flags = asArray(packet && packet.narrative_flags).map(safeId);
    if (/secretly|wanted|motive|only because|intended|agenda/.test(s) || flags.includes('hidden_motive_claim') || flags.includes('mind_reading') || flags.includes('only_because')) return 'motive_attribution_claim';
    if (/because|caused|cause|causes|led to|responsible for/.test(s) || flags.includes('causal_jump')) return 'causal_claim';
    if (/must|should|traitors|decent person|every decent/.test(s) || flags.includes('loaded_label')) return 'normative_rhetorical_claim';
    if (/might|could|maybe|appears|sounds like|ambiguous/.test(s) || flags.includes('ambiguity')) return 'ambiguous_interpretive_claim';
    if (/reduced|increased|shows|describe|arriving|happened|occurred|was|is/.test(s)) return 'descriptive_factual_claim';
    return 'general_claim';
  }

  function extractDependencies(packet, claimKind) {
    const context = packet && packet.context || {};
    const dependencies = [];
    asArray(context.entities).forEach(entity => dependencies.push({ dependency_type: 'entity_anchor', value: text(entity), registry: 'names_or_entities_registry' }));
    asArray(context.events).forEach(event => dependencies.push({ dependency_type: 'event_anchor', value: text(event), registry: 'events_registry' }));
    asArray(context.dates).forEach(date => dependencies.push({ dependency_type: 'date_anchor', value: text(date), registry: 'dates_registry' }));
    asArray(packet && packet.evidence).forEach(ev => dependencies.push({ dependency_type: 'supporting_evidence_anchor', value: text(ev.evidence_id), registry: 'evidence_media_registry' }));
    asArray(packet && packet.counterevidence).forEach(ev => dependencies.push({ dependency_type: 'counterevidence_anchor', value: text(ev.evidence_id), registry: 'evidence_media_registry' }));
    if (claimKind === 'causal_claim') dependencies.push({ dependency_type: 'causal_bridge_required', value: 'correlation_is_not_enough_for_cause', registry: 'reasoning_dependency' });
    if (claimKind === 'motive_attribution_claim') dependencies.push({ dependency_type: 'motive_evidence_required', value: 'hidden_intention_requires_direct_or_strong_indirect_evidence', registry: 'reasoning_dependency' });
    return dependencies;
  }

  function analyzeClaim(packet) {
    const base = baseApi();
    const claimId = text(packet && packet.claim_id) || 'claim_001';
    const claimText = text(packet && packet.claim_text);
    const tokens = base.tokenizeClaim(claimText);
    const claimKind = classifyClaimKind(claimText, packet);
    const source = base.sourcePosture(packet);
    const contradiction = base.contradictionPressure(packet);
    const narrative = base.narrativePressure(packet, claimKind);
    const dependencies = extractDependencies(packet, claimKind);
    const scores = { source, contradiction, narrative };
    const truthStatus = base.determineTruthStatus(packet, claimKind, scores);
    const result = {
      packet_type: '42ndMind_objective_claim_analysis_result_v0_1_1',
      packet_version: VERSION,
      created_at: now(),
      claim_id: claimId,
      claim_text: claimText,
      normalized_claim: lower(claimText),
      tokens,
      claim_kind: claimKind,
      dependencies,
      dependency_count: dependencies.length,
      source_posture: source,
      contradiction_pressure: contradiction,
      narrative_pressure: narrative,
      truth_status_candidate: truthStatus,
      expected_truth_status: text(packet && packet.expected_truth_status),
      expected_match: !text(packet && packet.expected_truth_status) || truthStatus === text(packet && packet.expected_truth_status),
      user_context_snapshot: clone(packet && packet.context),
      evidence_snapshot: clone(asArray(packet && packet.evidence)),
      counterevidence_snapshot: clone(asArray(packet && packet.counterevidence)),
      external_lookup_performed: false,
      llm_used: false,
      contradiction_resolution: 'not_resolved',
      doctrine_status: 'candidate_not_doctrine',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
    result.validation = validateClaimResult(result);
    result.ok = result.validation.ok === true;
    return result;
  }

  function validateClaimResult(result) {
    const baseValidation = baseApi().validateClaimResult(result);
    const errors = asArray(baseValidation.errors).slice();
    if (result && result.claim_id === 'claim_motive_overclaim_001') {
      const hasMotiveDependency = asArray(result.dependencies).some(row => row.dependency_type === 'motive_evidence_required');
      if (result.claim_kind !== 'motive_attribution_claim') errors.push(`motive_claim_kind_wrong:${result.claim_kind}`);
      if (!hasMotiveDependency) errors.push('motive_evidence_dependency_missing');
    }
    return Object.assign({}, baseValidation, {
      ok: errors.length === 0,
      errors,
      claim_kind: text(result && result.claim_kind),
      belief_movement: 'none'
    });
  }

  function validatePacket(packet) {
    const analyses = asArray(packet && packet.analyses);
    const validations = analyses.map(validateClaimResult);
    const errors = [];
    if (analyses.length !== 8) errors.push(`analysis_count_not_8:${analyses.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.claim_id}:${row.errors.join('|')}`); });
    const statuses = analyses.map(row => row.truth_status_candidate);
    const motive = analyses.find(row => row.claim_id === 'claim_motive_overclaim_001');
    const checks = {
      eight_claim_analyses: analyses.length === 8,
      all_expected_statuses_match: analyses.every(row => row.expected_match === true),
      motive_kind_and_dependency_correct: !!(motive && motive.claim_kind === 'motive_attribution_claim' && asArray(motive.dependencies).some(row => row.dependency_type === 'motive_evidence_required')),
      contradiction_pressure_detected: statuses.includes('contradiction_pressure_candidate'),
      narrative_overclaim_detected: statuses.includes('narrative_overclaim_pressure_candidate'),
      propaganda_pressure_detected: statuses.includes('propaganda_pressure_candidate'),
      causal_overclaim_detected: statuses.includes('causal_overclaim_pressure_candidate'),
      ambiguity_preserved: statuses.includes('ambiguous_unresolved_candidate'),
      unsupported_unresolved_preserved: statuses.includes('unsupported_unresolved_candidate'),
      corroboration_detected: statuses.includes('corroborated_candidate'),
      evidence_support_detected: statuses.includes('evidence_supported_candidate'),
      no_llm_used: analyses.every(row => row.llm_used === false),
      no_external_lookup: analyses.every(row => row.external_lookup_performed === false),
      candidate_only_not_promoted: analyses.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && analyses.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_objective_claim_language_validation_v0_1_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      claim_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runClaimLanguage(options = {}) {
    const inputs = asArray(options.claim_packets || baseApi().samplePackets());
    const analyses = inputs.map(analyzeClaim);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Patched deterministic objective claim-language layer. Motive markers outrank generic causal markers; no LLM; no source lookup.',
      claim_count: inputs.length,
      analyses,
      doctrine: doctrine(),
      llm_used: false,
      external_lookup_performed: false,
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelObjectiveClaimLanguageV011 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    samplePackets: function () { return baseApi().samplePackets(); },
    tokenizeClaim: function (claimText) { return baseApi().tokenizeClaim(claimText); },
    classifyClaimKind,
    extractDependencies,
    evidenceScore: function (rows) { return baseApi().evidenceScore(rows); },
    contradictionPressure: function (packet) { return baseApi().contradictionPressure(packet); },
    narrativePressure: function (packet, claimKind) { return baseApi().narrativePressure(packet, claimKind); },
    sourcePosture: function (packet) { return baseApi().sourcePosture(packet); },
    determineTruthStatus: function (packet, claimKind, scores) { return baseApi().determineTruthStatus(packet, claimKind, scores); },
    analyzeClaim,
    validateClaimResult,
    validatePacket,
    runClaimLanguage
  });
})(typeof window !== 'undefined' ? window : globalThis);
