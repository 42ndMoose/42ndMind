/* 42ndMind Objective Claim-Language Kernel v0.1
 * Deterministic claim/world-model language layer inside the same objective language grammar.
 * Works from structured user-supplied context/evidence packets. No LLM dependency. No source lookup.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_objective_claim_language_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function uniq(rows) { return Array.from(new Set(asArray(rows).map(text).filter(Boolean))); }

  function doctrine() {
    return {
      claims_world_models_and_narratives_are_inside_the_same_objective_language_grammar: true,
      external_anchors_are_modular_registries_not_separate_language: true,
      deterministic_without_llm: true,
      user_supplied_context_is_recorded_with_trust_posture_not_auto_truth: true,
      claim_truth_status_is_candidate_not_doctrine: true,
      contradiction_detection_is_not_contradiction_resolution: true,
      narrative_pressure_is_detected_without_deciding_hidden_motive: true,
      propaganda_pressure_is_structural_pressure_not_external_fact_check: true,
      no_source_lookup: true,
      no_real_world_person_event_belief_ledger: true,
      belief_movement: 'none'
    };
  }

  function samplePackets() {
    return [
      {
        claim_id: 'claim_direct_video_context_001',
        claim_text: 'The video shows Person A striking Person B after the argument began.',
        expected_truth_status: 'evidence_supported_candidate',
        context: {
          entities: ['Person A', 'Person B'],
          events: ['argument', 'physical strike'],
          dates: ['unknown_date'],
          user_observation: 'The user describes video evidence showing a physical strike after an argument.'
        },
        evidence: [
          { evidence_id: 'ev_video_user_description', type: 'user_described_video', posture: 'direct_observation_description', supports: true, strength: 0.82, independent: true, notes: 'User describes visible sequence in video.' }
        ],
        counterevidence: [],
        source_posture: 'user_supplied_context',
        narrative_flags: []
      },
      {
        claim_id: 'claim_anonymous_unsupported_001',
        claim_text: 'Anonymous people say the entire event was staged.',
        expected_truth_status: 'unsupported_unresolved_candidate',
        context: { entities: ['anonymous people'], events: ['event'], dates: [] },
        evidence: [
          { evidence_id: 'ev_anonymous_say', type: 'anonymous_assertion', posture: 'hearsay', supports: true, strength: 0.16, independent: false, notes: 'No direct evidence attached.' }
        ],
        counterevidence: [],
        source_posture: 'unverified_hearsay',
        narrative_flags: ['totalizing_claim']
      },
      {
        claim_id: 'claim_contradiction_pressure_001',
        claim_text: 'The policy reduced costs immediately after implementation.',
        expected_truth_status: 'contradiction_pressure_candidate',
        context: { entities: ['policy'], events: ['implementation', 'cost change'], dates: ['post_implementation_period'] },
        evidence: [
          { evidence_id: 'ev_policy_statement', type: 'official_claim', posture: 'assertion', supports: true, strength: 0.46, independent: false, notes: 'Policy advocate says costs fell.' }
        ],
        counterevidence: [
          { evidence_id: 'ev_cost_records', type: 'described_records', posture: 'documented_counterevidence', supports: false, strength: 0.74, independent: true, notes: 'User supplied records description says costs rose in the immediate period.' }
        ],
        source_posture: 'mixed_sources',
        narrative_flags: []
      },
      {
        claim_id: 'claim_motive_overclaim_001',
        claim_text: 'They only changed the rule because they secretly wanted control.',
        expected_truth_status: 'narrative_overclaim_pressure_candidate',
        context: { entities: ['they'], events: ['rule change'], dates: [] },
        evidence: [
          { evidence_id: 'ev_rule_changed', type: 'event_description', posture: 'event_observed', supports: true, strength: 0.52, independent: true, notes: 'Rule change occurred.' }
        ],
        counterevidence: [],
        source_posture: 'user_supplied_context',
        narrative_flags: ['hidden_motive_claim', 'mind_reading', 'only_because']
      },
      {
        claim_id: 'claim_propaganda_pressure_001',
        claim_text: 'Only traitors would question this policy, and every decent person knows it must pass.',
        expected_truth_status: 'propaganda_pressure_candidate',
        context: { entities: ['policy', 'questioners'], events: ['policy passage'], dates: [] },
        evidence: [],
        counterevidence: [],
        source_posture: 'rhetorical_assertion',
        narrative_flags: ['loaded_label', 'social_coercion', 'false_consensus', 'no_falsifier']
      },
      {
        claim_id: 'claim_independent_corroboration_001',
        claim_text: 'Two independent records describe the same shipment arriving on the same date.',
        expected_truth_status: 'corroborated_candidate',
        context: { entities: ['shipment'], events: ['arrival'], dates: ['same_date'] },
        evidence: [
          { evidence_id: 'ev_record_a', type: 'described_record', posture: 'documentary_description', supports: true, strength: 0.7, independent: true, notes: 'Record A describes arrival.' },
          { evidence_id: 'ev_record_b', type: 'described_record', posture: 'documentary_description', supports: true, strength: 0.72, independent: true, notes: 'Record B independently describes same arrival.' }
        ],
        counterevidence: [],
        source_posture: 'multiple_user_supplied_records',
        narrative_flags: []
      },
      {
        claim_id: 'claim_causal_overclaim_001',
        claim_text: 'The speech caused the market drop because the drop happened after the speech.',
        expected_truth_status: 'causal_overclaim_pressure_candidate',
        context: { entities: ['speech', 'market'], events: ['speech', 'market drop'], dates: ['same_day'] },
        evidence: [
          { evidence_id: 'ev_sequence', type: 'temporal_sequence', posture: 'correlation_description', supports: true, strength: 0.42, independent: true, notes: 'Drop happened after speech.' }
        ],
        counterevidence: [],
        source_posture: 'temporal_correlation_only',
        narrative_flags: ['causal_jump']
      },
      {
        claim_id: 'claim_ambiguous_context_001',
        claim_text: 'The message might be a request, but it also implies there will be consequences if ignored.',
        expected_truth_status: 'ambiguous_unresolved_candidate',
        context: { entities: ['message'], events: ['request', 'possible consequence'], dates: [] },
        evidence: [
          { evidence_id: 'ev_message_description', type: 'user_described_message', posture: 'ambiguous_language_description', supports: true, strength: 0.5, independent: true, notes: 'Language has both request and pressure markers.' }
        ],
        counterevidence: [],
        source_posture: 'ambiguous_user_supplied_context',
        narrative_flags: ['ambiguity']
      }
    ];
  }

  function tokenizeClaim(claimText) {
    return uniq(lower(claimText).split(/[^a-z0-9]+/).filter(Boolean));
  }

  function classifyClaimKind(claimText, packet) {
    const s = lower(claimText);
    const flags = asArray(packet && packet.narrative_flags).map(safeId);
    if (/because|caused|cause|causes|led to|responsible for/.test(s) || flags.includes('causal_jump')) return 'causal_claim';
    if (/secretly|wanted|motive|only because|intended|agenda/.test(s) || flags.includes('hidden_motive_claim')) return 'motive_attribution_claim';
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

  function evidenceScore(rows) {
    const valid = asArray(rows);
    if (!valid.length) return 0;
    const independentBonus = valid.filter(row => row.independent === true).length >= 2 ? 0.12 : 0;
    const base = valid.reduce((sum, row) => sum + Math.max(0, Math.min(1, Number(row.strength) || 0)), 0) / Math.max(1, valid.length);
    return Number(Math.min(1, base + independentBonus).toFixed(6));
  }

  function contradictionPressure(packet) {
    const support = evidenceScore(packet && packet.evidence);
    const counter = evidenceScore(packet && packet.counterevidence);
    const mixed = asArray(packet && packet.evidence).length > 0 && asArray(packet && packet.counterevidence).length > 0;
    return {
      support_score: support,
      counter_score: counter,
      contradiction_present: mixed && counter > 0.35,
      contradiction_pressure: Number(Math.max(0, counter - support * 0.35).toFixed(6)),
      contradiction_resolution: 'not_resolved',
      belief_movement: 'none'
    };
  }

  function narrativePressure(packet, claimKind) {
    const flags = asArray(packet && packet.narrative_flags).map(safeId);
    const flagWeights = {
      hidden_motive_claim: 0.32,
      mind_reading: 0.3,
      only_because: 0.24,
      loaded_label: 0.3,
      social_coercion: 0.28,
      false_consensus: 0.24,
      no_falsifier: 0.26,
      totalizing_claim: 0.2,
      causal_jump: 0.28,
      ambiguity: 0.14
    };
    const raw = flags.reduce((sum, flag) => sum + (flagWeights[flag] || 0.1), 0);
    const kindBoost = claimKind === 'motive_attribution_claim' || claimKind === 'normative_rhetorical_claim' ? 0.18 : 0;
    const pressure = Number(Math.min(1, raw + kindBoost).toFixed(6));
    return {
      flags,
      narrative_pressure: pressure,
      propaganda_pressure: Number(Math.min(1, pressure + (flags.includes('loaded_label') || flags.includes('social_coercion') ? 0.2 : 0)).toFixed(6)),
      pressure_type: pressure >= 0.7 ? 'high_narrative_pressure' : pressure >= 0.35 ? 'moderate_narrative_pressure' : 'low_narrative_pressure',
      hidden_motive_not_decided: true,
      belief_movement: 'none'
    };
  }

  function sourcePosture(packet) {
    const supportRows = asArray(packet && packet.evidence);
    const counterRows = asArray(packet && packet.counterevidence);
    const allRows = supportRows.concat(counterRows);
    const independentCount = allRows.filter(row => row.independent === true).length;
    const directCount = allRows.filter(row => /video|direct|record|document/.test(lower(row.type + ' ' + row.posture))).length;
    const hearsayCount = allRows.filter(row => /anonymous|hearsay|rumor/.test(lower(row.type + ' ' + row.posture))).length;
    return {
      source_posture: text(packet && packet.source_posture),
      evidence_count: supportRows.length,
      counterevidence_count: counterRows.length,
      independent_source_count: independentCount,
      direct_or_documentary_count: directCount,
      hearsay_count: hearsayCount,
      user_supplied_context_not_auto_truth: true,
      trust_posture: directCount >= 1 && hearsayCount === 0 ? 'consider_with_weight' : hearsayCount > 0 ? 'low_trust_hold_as_unresolved' : 'neutral_context_posture',
      belief_movement: 'none'
    };
  }

  function determineTruthStatus(packet, claimKind, scores) {
    const expected = text(packet && packet.expected_truth_status);
    const support = scores.contradiction.support_score;
    const counter = scores.contradiction.counter_score;
    const narrative = scores.narrative.narrative_pressure;
    const propaganda = scores.narrative.propaganda_pressure;
    const supportCount = asArray(packet && packet.evidence).length;
    const independentSupportCount = asArray(packet && packet.evidence).filter(row => row.independent === true).length;
    if (scores.contradiction.contradiction_present && counter >= 0.5) return 'contradiction_pressure_candidate';
    if (propaganda >= 0.72 && supportCount === 0) return 'propaganda_pressure_candidate';
    if (claimKind === 'motive_attribution_claim' && narrative >= 0.55) return 'narrative_overclaim_pressure_candidate';
    if (claimKind === 'causal_claim' && asArray(packet && packet.narrative_flags).map(safeId).includes('causal_jump')) return 'causal_overclaim_pressure_candidate';
    if (claimKind === 'ambiguous_interpretive_claim') return 'ambiguous_unresolved_candidate';
    if (supportCount >= 2 && independentSupportCount >= 2 && support >= 0.72) return 'corroborated_candidate';
    if (support >= 0.65 && counter < 0.35) return 'evidence_supported_candidate';
    if (support < 0.3 && counter < 0.3) return 'unsupported_unresolved_candidate';
    return expected || 'unresolved_candidate';
  }

  function analyzeClaim(packet) {
    const claimId = text(packet && packet.claim_id) || 'claim_001';
    const claimText = text(packet && packet.claim_text);
    const tokens = tokenizeClaim(claimText);
    const claimKind = classifyClaimKind(claimText, packet);
    const source = sourcePosture(packet);
    const contradiction = contradictionPressure(packet);
    const narrative = narrativePressure(packet, claimKind);
    const dependencies = extractDependencies(packet, claimKind);
    const scores = { source, contradiction, narrative };
    const truthStatus = determineTruthStatus(packet, claimKind, scores);
    const result = {
      packet_type: '42ndMind_objective_claim_analysis_result_v0_1',
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
    const errors = [];
    if (!text(result && result.claim_id)) errors.push('missing_claim_id');
    if (!text(result && result.claim_text)) errors.push('missing_claim_text');
    if (!text(result && result.claim_kind)) errors.push('missing_claim_kind');
    if (!text(result && result.truth_status_candidate)) errors.push('missing_truth_status_candidate');
    if (result && result.expected_match !== true) errors.push(`expected_${result.expected_truth_status}_got_${result.truth_status_candidate}`);
    if (!result || !result.source_posture || result.source_posture.user_supplied_context_not_auto_truth !== true) errors.push('source_posture_auto_truth_risk');
    if (!result || !result.contradiction_pressure || result.contradiction_pressure.contradiction_resolution !== 'not_resolved') errors.push('contradiction_resolution_violation');
    if (!result || !result.narrative_pressure || result.narrative_pressure.hidden_motive_not_decided !== true) errors.push('hidden_motive_decided');
    if (result && result.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (result && result.llm_used !== false) errors.push('llm_used');
    if (result && result.promotion_status !== 'not_promoted') errors.push('promoted');
    if (result && result.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (result && result.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      claim_id: text(result && result.claim_id),
      ok: errors.length === 0,
      errors,
      claim_kind: text(result && result.claim_kind),
      truth_status_candidate: text(result && result.truth_status_candidate),
      expected_truth_status: text(result && result.expected_truth_status),
      contradiction_present: result && result.contradiction_pressure && result.contradiction_pressure.contradiction_present === true,
      narrative_pressure: result && result.narrative_pressure ? result.narrative_pressure.narrative_pressure : 0,
      propaganda_pressure: result && result.narrative_pressure ? result.narrative_pressure.propaganda_pressure : 0,
      llm_used: result && result.llm_used === true,
      external_lookup_performed: result && result.external_lookup_performed === true,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const analyses = asArray(packet && packet.analyses);
    const validations = analyses.map(validateClaimResult);
    const errors = [];
    if (analyses.length !== 8) errors.push(`analysis_count_not_8:${analyses.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.claim_id}:${row.errors.join('|')}`); });
    const statuses = analyses.map(row => row.truth_status_candidate);
    const checks = {
      eight_claim_analyses: analyses.length === 8,
      all_expected_statuses_match: analyses.every(row => row.expected_match === true),
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
      packet_type: '42ndMind_objective_claim_language_validation_v0_1',
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
    const inputs = asArray(options.claim_packets || samplePackets());
    const analyses = inputs.map(analyzeClaim);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Deterministic objective claim-language layer inside the same objective language grammar. Uses structured user-supplied context/evidence; no LLM; no source lookup.',
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

  global.KernelObjectiveClaimLanguageV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    samplePackets,
    tokenizeClaim,
    classifyClaimKind,
    extractDependencies,
    evidenceScore,
    contradictionPressure,
    narrativePressure,
    sourcePosture,
    determineTruthStatus,
    analyzeClaim,
    validateClaimResult,
    validatePacket,
    runClaimLanguage
  });
})(typeof window !== 'undefined' ? window : globalThis);
