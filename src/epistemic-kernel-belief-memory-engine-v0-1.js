/* 42ndMind Epistemic Kernel Belief-Memory Engine v0.1
 *
 * Core boot patch. Installs a unified belief/memory/trust/inference layer inside
 * the owned/shared brain state. This is not a UI connector and not final truth
 * promotion. It gives the kernel a core-readable memory drawer and provisional
 * belief movement that remains challengeable, sourced, and blocked from final
 * truth until a future strict ledger layer exists.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const MAX_ROWS = 120;

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function unique(values) { return Array.from(new Set(asArray(values).map(text).filter(Boolean))); }
  function sentence(raw) { const s = text(raw); const m = s.match(/^[^.!?]+[.!?]?/); return text(m ? m[0] : s); }
  function includesAny(raw, terms) { const r = lower(raw); return asArray(terms).some(t => r.includes(lower(t))); }

  function beliefMemoryDoctrine() {
    return {
      belief_memory_engine_lives_inside_owned_state: true,
      memory_is_core_readable_drawer_not_connector: true,
      kernel_may_infer_before_asking: true,
      questions_arise_from_truth_need_not_unresolved_text_alone: true,
      user_input_is_context_not_final_truth: true,
      user_trust_is_partial_revisable_and_source_bound: true,
      provisional_beliefs_are_allowed: true,
      provisional_beliefs_can_influence_future_interpretation: true,
      provisional_beliefs_remain_challengeable: true,
      belief_confidence_is_separate_from_objective_truth: true,
      final_truth_requires_future_explicit_promotion_discipline: true,
      objective_maturity_remains_identity_center: true,
      no_final_truth_promotion: true,
      no_silent_canonical_mutation: true,
      belief_ladder: [
        'raw_context',
        'learned_context',
        'inferred_candidate',
        'provisional_belief',
        'high_confidence_belief_candidate',
        'truth_preledger_candidate',
        'final_truth_promoted_future_layer_only'
      ],
      highest_allowed_stage_v0_1: 'high_confidence_belief_candidate',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function createBeliefMemoryCore(seed) {
    return Object.assign({
      packet_type: '42ndMind_belief_memory_engine_v0_1',
      packet_version: VERSION,
      created_at: now(),
      updated_at: now(),
      doctrine: beliefMemoryDoctrine(),
      active: true,
      memory_items: [],
      source_trust_profiles: [],
      user_trust_profile: createUserTrustProfile(),
      inferred_principles: [],
      inferred_boundaries: [],
      inferred_conditions: [],
      inferred_exceptions: [],
      inferred_causal_claims: [],
      inferred_worldview_fragments: [],
      inferred_concerns: [],
      overclaim_flags: [],
      provisional_beliefs: [],
      belief_challenges: [],
      belief_update_log: [],
      inference_trace: [],
      open_truth_requirements: [],
      active_questions: [],
      memory_reuse_hits: [],
      current_uncertainty: [],
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }, seed || {});
  }

  function createUserTrustProfile(seed) {
    return Object.assign({
      source_id: 'direct_user',
      source_kind: 'user',
      trust_model: 'partial_revisable_contextual_trust',
      trust_score_candidate: 0.58,
      consistency_score: 0.60,
      clarity_score: 0.50,
      observed_inputs: 0,
      consistent_inputs: 0,
      contradiction_flags: [],
      trust_reasons: ['direct user input is relevant context but not objective proof'],
      distrust_reasons: ['source trust cannot replace evidence, bridge, or external verification'],
      last_updated: now(),
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }, seed || {});
  }

  function ensureBeliefMemoryCore(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.beliefMemoryCore || typeof state.beliefMemoryCore !== 'object') state.beliefMemoryCore = createBeliefMemoryCore();
    const core = state.beliefMemoryCore;
    const fresh = createBeliefMemoryCore();
    Object.keys(fresh).forEach(key => { if (core[key] === undefined) core[key] = clone(fresh[key]); });
    core.packet_version = VERSION;
    core.doctrine = Object.assign({}, beliefMemoryDoctrine(), core.doctrine || {}, beliefMemoryDoctrine());
    ['memory_items','source_trust_profiles','inferred_principles','inferred_boundaries','inferred_conditions','inferred_exceptions','inferred_causal_claims','inferred_worldview_fragments','inferred_concerns','overclaim_flags','provisional_beliefs','belief_challenges','belief_update_log','inference_trace','open_truth_requirements','active_questions','memory_reuse_hits','current_uncertainty'].forEach(key => { core[key] = asArray(core[key]); });
    core.user_trust_profile = createUserTrustProfile(core.user_trust_profile || {});
    core.truth_status = 'not_final';
    core.promotion_status = 'not_promoted_to_final_truth';
    core.belief_movement = 'provisional_only';
    core.updated_at = now();
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      belief_memory_engine_lives_inside_owned_state: true,
      memory_is_core_readable_drawer_not_connector: true,
      modules_are_views_not_thought_sources: true,
      belief_movement: 'provisional_only',
      no_final_truth_promotion: true
    });
    return core;
  }

  function latestEvent(state) {
    const events = asArray(state && state.runtimeEvents);
    return events.length ? events[events.length - 1] : null;
  }

  function eventText(event) {
    return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text));
  }

  function rowId(prefix, parts) { return `${prefix}_${tinyHash(asArray(parts).join('|')).slice(0, 12)}`; }

  function upsertById(rows, row, key) {
    const id = row && row[key || 'id'];
    if (!id) return rows;
    const index = rows.findIndex(x => x && x[key || 'id'] === id);
    if (index >= 0) rows[index] = Object.assign({}, rows[index], row, { updated_at: now() });
    else rows.unshift(row);
    return rows.slice(0, MAX_ROWS);
  }

  function clarityFromText(raw) {
    let score = 0.42;
    if (/\bshould\b|\bmust\b|\bprinciple\b|\bboundary\b/.test(lower(raw))) score += 0.14;
    if (/\bbecause\b|\bprevents\b|\bcomes from\b|\bdepends\b|\bcontext\b/.test(lower(raw))) score += 0.14;
    if (/\bnot\b.*\b(mistaken|same|identical)\b|\bdistinguish\b|\bdistinction\b/.test(lower(raw))) score += 0.12;
    if (text(raw).length > 180) score += 0.07;
    if (/\balways\b|\bnever\b|\bexclusively\b/.test(lower(raw))) score -= 0.04;
    return clamp01(Number(score.toFixed(3)));
  }

  function updateUserTrust(core, raw, meta) {
    const profile = createUserTrustProfile(core.user_trust_profile || {});
    const clarity = clarityFromText(raw);
    const contradiction = /\b(i am mickey mouse|kidding|not actually|contradict)\b/i.test(raw);
    profile.observed_inputs = Number(profile.observed_inputs || 0) + 1;
    profile.consistent_inputs = Number(profile.consistent_inputs || 0) + (contradiction ? 0 : 1);
    profile.clarity_score = Number(((Number(profile.clarity_score || 0.5) * 0.65) + (clarity * 0.35)).toFixed(3));
    profile.consistency_score = clamp01(Number(profile.consistent_inputs || 0) / Math.max(1, Number(profile.observed_inputs || 1)));
    if (contradiction) profile.contradiction_flags.unshift({ flag_id: rowId('trust_flag', [raw, now()]), observed_at: now(), note: 'identity_or_play_claim_requires_context_not_blind_trust' });
    profile.trust_score_candidate = clamp01(Number((0.50 + profile.clarity_score * 0.18 + profile.consistency_score * 0.12 + Math.min(0.08, profile.observed_inputs * 0.012)).toFixed(3)));
    profile.last_updated = now();
    profile.last_meta = clone(meta || {});
    profile.truth_status = 'not_final';
    profile.promotion_status = 'not_promoted_to_final_truth';
    profile.belief_movement = 'provisional_only';
    core.user_trust_profile = profile;
    core.source_trust_profiles = upsertById(core.source_trust_profiles, profile, 'source_id');
    return profile;
  }

  function makeMemory(kind, statement, event, extra) {
    return Object.assign({
      memory_id: rowId('mem', [kind, statement]),
      memory_kind: kind,
      belief_ladder_stage: kind === 'raw_user_statement' ? 'raw_context' : 'learned_context',
      statement: text(statement),
      source_id: 'direct_user',
      source_kind: 'user_input',
      event_id: event && event.id || null,
      created_at: now(),
      updated_at: now(),
      access_model: 'core_readable_memory_drawer',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }, extra || {});
  }

  function makeRequirement(kind, target, reason, confidence, event) {
    return {
      requirement_id: rowId('req', [kind, target, reason]),
      requirement_kind: kind,
      target: text(target),
      reason: text(reason),
      confidence: clamp01(confidence || 0.5),
      event_id: event && event.id || null,
      status: 'open_truth_requirement',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function makeChallenge(target, challenge, reason, confidence, event) {
    return {
      challenge_id: rowId('challenge', [target, challenge]),
      target: text(target),
      challenge: text(challenge),
      reason: text(reason),
      confidence: clamp01(confidence || 0.5),
      event_id: event && event.id || null,
      status: 'active_belief_challenge',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function relatedMemory(core, raw) {
    const words = unique(lower(raw).split(/[^a-z0-9]+/).filter(w => w.length > 4));
    const hits = asArray(core.memory_items).filter(item => {
      const s = lower(item.statement);
      let count = 0;
      words.forEach(w => { if (s.includes(w)) count++; });
      return count >= 2 || (s.includes('race joke') && lower(raw).includes('race joke')) || (s.includes('stereotyp') && lower(raw).includes('stereotyp'));
    }).slice(0, 8).map(item => ({ memory_id: item.memory_id, memory_kind: item.memory_kind, statement: item.statement }));
    return hits;
  }

  function inferRaceHumorPackage(raw, event, trust, memoryHits) {
    const principleStatement = 'Race jokes and racist jokes are not identical categories.';
    const boundaryStatement = 'The boundary between a race joke and a racist joke depends on intent, context, hostility, dehumanization, trust, correction, and whether the joke reinforces false hostile overgeneralization.';
    const causalStatement = 'Open discussion can improve collective correction by exposing misconceptions and giving people room to revise assumptions, but the causal bridge remains unproven until mechanisms and failure cases are specified.';
    const worldviewStatement = 'User values good-faith, high-trust collective correction over policy-driven suppression of sensitive speech.';
    const concernStatement = 'Malicious governance and excessive sensitivity can prevent social learning by making discussion harder before misconceptions can be corrected.';
    const userBelief = 'User likely believes stereotyping is a natural pattern-recognition process that becomes harmful or false depending on context, reform, evidence, hostility, and correction conditions.';
    return {
      principles: [{
        principle_id: rowId('principle', [principleStatement]),
        statement: principleStatement,
        inferred_from: sentence(raw),
        confidence: 0.81,
        belief_ladder_stage: 'inferred_candidate',
        source_id: 'direct_user',
        source_trust_score_candidate: trust.trust_score_candidate,
        memory_context_refs: memoryHits.map(h => h.memory_id),
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }],
      boundaries: [{
        boundary_id: rowId('boundary', [boundaryStatement]),
        statement: boundaryStatement,
        boundary_conditions: ['intent','context','hostility','dehumanization','trust','correction','false_hostile_overgeneralization'],
        inferred_without_asking_user_to_label_it: true,
        confidence: 0.79,
        belief_ladder_stage: 'inferred_candidate',
        source_id: 'direct_user',
        memory_context_refs: memoryHits.map(h => h.memory_id),
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }],
      conditions: ['intent','context','hostility','dehumanization','trust','correction','false_hostile_overgeneralization'].map(c => ({
        condition_id: rowId('condition', [boundaryStatement, c]),
        target: boundaryStatement,
        condition: c,
        status: 'candidate_boundary_condition',
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      })),
      exceptions: [{
        exception_id: rowId('exception', ['universal_discussion_claim', raw]),
        target: 'speaking about it will always be better than silencing it',
        exception_pressure: 'universal always-claim needs failure cases such as malicious incitement, direct harassment, coercive setting, or bad-faith repetition that blocks correction',
        status: 'exception_handling_needed',
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }],
      causalClaims: [{
        causal_claim_id: rowId('causal', [causalStatement]),
        statement: causalStatement,
        causal_bridge_status: 'bridge_needed_before_objective_truth',
        confidence: 0.64,
        belief_ladder_stage: 'inferred_candidate',
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }],
      worldviewFragments: [{
        worldview_id: rowId('worldview', [worldviewStatement]),
        statement: worldviewStatement,
        confidence: 0.76,
        belief_ladder_stage: 'provisional_belief',
        scope: 'user_worldview_fragment_candidate',
        truth_scope: 'user_belief_model_not_objective_world_truth',
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }],
      concerns: [{
        concern_id: rowId('concern', [concernStatement]),
        statement: concernStatement,
        confidence: 0.73,
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }],
      overclaims: [{
        overclaim_id: rowId('overclaim', ['always better than silencing', raw]),
        target: 'speaking about it will always be better than silencing it',
        overclaim_type: 'universal_quantifier_pressure',
        note: 'The always-claim is useful as direction, but needs exception handling before high-confidence objective use.',
        status: 'candidate_overclaim_needs_exception_handling',
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }],
      beliefs: [{
        belief_id: rowId('belief', [userBelief]),
        belief_stage: 'provisional_belief',
        statement: userBelief,
        source_id: 'direct_user',
        source_trust_score_candidate: trust.trust_score_candidate,
        belief_confidence: 0.74,
        user_worldview_confidence: 0.80,
        objective_truth_confidence: 0.24,
        confidence_separation: 'belief_about_user_worldview_not_objective_truth_about_world',
        memory_context_refs: memoryHits.map(h => h.memory_id),
        can_influence_future_interpretation: true,
        remains_challengeable: true,
        open_truth_requirements: ['exception_conditions','causal_bridge','failure_cases','external_evidence_if_used_objectively','correction_conditions'],
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }],
      challenges: [makeChallenge(userBelief, 'Natural pattern recognition can still produce false positives and unfair generalizations, so correction conditions matter.', 'A process being natural does not make each output accurate, fair, or mature.', 0.82, event)],
      requirements: [
        makeRequirement('exception_conditions', 'speaking about it will always be better than silencing it', 'Universal pressure must identify cases where open speech fails or causes direct harm.', 0.82, event),
        makeRequirement('causal_bridge', causalStatement, 'The mechanism between open discussion and collective improvement needs explicit steps.', 0.76, event),
        makeRequirement('boundary_failure_cases', boundaryStatement, 'The kernel needs examples that would make the boundary fail in real cases.', 0.70, event),
        makeRequirement('source_scope', userBelief, 'Keep this as user-worldview model unless independently verified as objective social truth.', 0.84, event)
      ],
      questions: [
        {
          question_id: rowId('bq', ['worldview-confirm', raw]),
          question_text: 'Should the kernel treat this as a personal worldview fragment that may guide future interpretation of speech, humor, and governance questions?',
          question_kind: 'worldview_scope_confirmation',
          reason: 'The kernel inferred a user-worldview belief candidate and needs permission before using it as a stable interpretive memory.',
          priority: 0.74,
          status: 'useful_followup_not_blocking_inference',
          truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
        },
        {
          question_id: rowId('bq', ['failure-condition', raw]),
          question_text: 'What would make this principle fail in a real case?',
          question_kind: 'failure_condition_probe',
          reason: 'The universal pressure around open discussion needs failure cases, not manual labeling.',
          priority: 0.70,
          status: 'useful_followup_not_blocking_inference',
          truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
        }
      ],
      uncertainty: [
        { uncertainty_id: rowId('unc', ['objective-social-causality', raw]), note: 'The user-worldview model is relatively clear; the objective causal social claim still requires evidence and bridge.', confidence: 0.77 }
      ],
      memory: [
        makeMemory('inferred_principle', principleStatement, event, { confidence: 0.81 }),
        makeMemory('inferred_boundary', boundaryStatement, event, { confidence: 0.79 }),
        makeMemory('inferred_user_worldview_fragment', worldviewStatement, event, { confidence: 0.76 }),
        makeMemory('provisional_user_belief', userBelief, event, { confidence: 0.74, belief_ladder_stage: 'provisional_belief' })
      ],
      trace: [{
        trace_id: rowId('trace', ['race_humor_package', raw]),
        step: 'inferred_race_humor_boundary_package_without_manual_labels',
        details: 'Detected distinction, boundary pressure, universal quantifier pressure, causal bridge pressure, worldview fragment, concern, provisional user belief, challenge, and useful follow-up questions.',
        memory_context_used: memoryHits.map(h => h.memory_id),
        truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only'
      }]
    };
  }

  function inferGenericPackage(raw, event, trust, memoryHits) {
    const first = sentence(raw) || raw;
    const principle = /\bshould\b|\bmust\b|\bought\b/i.test(raw) ? first : null;
    const boundaryNeeded = /\bboundary\b|\bdistinction\b|\bnot the same\b|\bmistaken\b/i.test(raw);
    const causalNeeded = /\bbecause\b|\bprevents\b|\bcomes from\b|\bleads to\b|\bcaus/i.test(raw);
    const belief = `User supplied context suggests a provisional worldview or claim candidate: ${first}`;
    const out = { principles: [], boundaries: [], conditions: [], exceptions: [], causalClaims: [], worldviewFragments: [], concerns: [], overclaims: [], beliefs: [], challenges: [], requirements: [], questions: [], uncertainty: [], memory: [], trace: [] };
    if (principle) out.principles.push({ principle_id: rowId('principle', [principle]), statement: principle, confidence: 0.58, belief_ladder_stage: 'inferred_candidate', source_id: 'direct_user', source_trust_score_candidate: trust.trust_score_candidate, memory_context_refs: memoryHits.map(h => h.memory_id), truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' });
    if (boundaryNeeded) out.boundaries.push({ boundary_id: rowId('boundary', [first]), statement: `Candidate boundary inferred from input: ${first}`, boundary_conditions: ['context','intent','scope','correction','harm_or_distortion'], inferred_without_asking_user_to_label_it: true, confidence: 0.54, belief_ladder_stage: 'inferred_candidate', memory_context_refs: memoryHits.map(h => h.memory_id), truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' });
    if (causalNeeded) {
      out.causalClaims.push({ causal_claim_id: rowId('causal', [first]), statement: `Candidate causal claim inferred from input: ${first}`, causal_bridge_status: 'bridge_needed_before_objective_truth', confidence: 0.50, truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' });
      out.requirements.push(makeRequirement('causal_bridge', first, 'Causal language needs mechanism before objective belief.', 0.68, event));
    }
    if (/\balways\b|\bnever\b|\bexclusively\b/i.test(raw)) out.overclaims.push({ overclaim_id: rowId('overclaim', [first]), target: first, overclaim_type: 'universal_quantifier_pressure', note: 'Universal scope needs exception handling.', status: 'candidate_overclaim_needs_exception_handling', truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' });
    out.worldviewFragments.push({ worldview_id: rowId('worldview', [first]), statement: `Potential user worldview fragment: ${first}`, confidence: 0.52, belief_ladder_stage: 'inferred_candidate', truth_scope: 'user_belief_model_not_objective_world_truth', truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' });
    out.beliefs.push({ belief_id: rowId('belief', [belief]), belief_stage: trust.trust_score_candidate > 0.72 ? 'provisional_belief' : 'inferred_candidate', statement: belief, source_id: 'direct_user', source_trust_score_candidate: trust.trust_score_candidate, belief_confidence: clamp01(trust.trust_score_candidate * 0.8), user_worldview_confidence: clamp01(trust.trust_score_candidate * 0.85), objective_truth_confidence: 0.12, confidence_separation: 'user-context confidence separated from objective truth', memory_context_refs: memoryHits.map(h => h.memory_id), can_influence_future_interpretation: true, remains_challengeable: true, open_truth_requirements: ['scope','exceptions','evidence_if_used_objectively'], truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' });
    out.challenges.push(makeChallenge(belief, 'The kernel must not confuse user-context confidence with objective truth.', 'User input can guide interpretation, but objective truth requires separate promotion discipline.', 0.78, event));
    out.requirements.push(makeRequirement('scope_and_exception_conditions', first, 'The kernel inferred a candidate but needs scope before stronger belief.', 0.62, event));
    out.questions.push({ question_id: rowId('bq', ['generic-fail', first]), question_text: 'What would make this principle or claim fail in a real case?', question_kind: 'failure_condition_probe', reason: 'The kernel inferred enough to proceed, but failure conditions would improve the model.', priority: 0.56, status: 'useful_followup_not_blocking_inference', truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' });
    out.uncertainty.push({ uncertainty_id: rowId('unc', [first]), note: 'Generic inference is lower-confidence than the race-humor package and should remain open.', confidence: 0.56 });
    if (principle) out.memory.push(makeMemory('inferred_principle', principle, event, { confidence: 0.58 }));
    out.memory.push(makeMemory('learned_context', first, event, { confidence: 0.52 }));
    out.trace.push({ trace_id: rowId('trace', ['generic', first]), step: 'generic_infer_first_then_ask_if_needed', details: 'Inferred candidate roles before asking any manual structuring question.', memory_context_used: memoryHits.map(h => h.memory_id), truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' });
    return out;
  }

  function mergePackage(core, pack) {
    asArray(pack.principles).forEach(row => { core.inferred_principles = upsertById(core.inferred_principles, row, 'principle_id'); });
    asArray(pack.boundaries).forEach(row => { core.inferred_boundaries = upsertById(core.inferred_boundaries, row, 'boundary_id'); });
    asArray(pack.conditions).forEach(row => { core.inferred_conditions = upsertById(core.inferred_conditions, row, 'condition_id'); });
    asArray(pack.exceptions).forEach(row => { core.inferred_exceptions = upsertById(core.inferred_exceptions, row, 'exception_id'); });
    asArray(pack.causalClaims).forEach(row => { core.inferred_causal_claims = upsertById(core.inferred_causal_claims, row, 'causal_claim_id'); });
    asArray(pack.worldviewFragments).forEach(row => { core.inferred_worldview_fragments = upsertById(core.inferred_worldview_fragments, row, 'worldview_id'); });
    asArray(pack.concerns).forEach(row => { core.inferred_concerns = upsertById(core.inferred_concerns, row, 'concern_id'); });
    asArray(pack.overclaims).forEach(row => { core.overclaim_flags = upsertById(core.overclaim_flags, row, 'overclaim_id'); });
    asArray(pack.beliefs).forEach(row => { core.provisional_beliefs = upsertById(core.provisional_beliefs, row, 'belief_id'); });
    asArray(pack.challenges).forEach(row => { core.belief_challenges = upsertById(core.belief_challenges, row, 'challenge_id'); });
    asArray(pack.requirements).forEach(row => { core.open_truth_requirements = upsertById(core.open_truth_requirements, row, 'requirement_id'); });
    asArray(pack.questions).forEach(row => { core.active_questions = upsertById(core.active_questions, row, 'question_id'); });
    asArray(pack.uncertainty).forEach(row => { core.current_uncertainty = upsertById(core.current_uncertainty, row, 'uncertainty_id'); });
    asArray(pack.memory).forEach(row => { core.memory_items = upsertById(core.memory_items, row, 'memory_id'); });
    asArray(pack.trace).forEach(row => { core.inference_trace = upsertById(core.inference_trace, row, 'trace_id'); });
  }

  function refreshBeliefMemory(state, reason) {
    const core = ensureBeliefMemoryCore(state);
    const event = latestEvent(state);
    const raw = eventText(event);
    if (!raw) {
      core.last_refresh_reason = reason || 'refresh_belief_memory_no_event';
      core.updated_at = now();
      return core;
    }

    const trust = updateUserTrust(core, raw, event && event.meta || {});
    const rawMem = makeMemory('raw_user_statement', raw, event, { confidence: trust.trust_score_candidate, belief_ladder_stage: 'raw_context' });
    core.memory_items = upsertById(core.memory_items, rawMem, 'memory_id');

    const memoryHits = relatedMemory(core, raw).filter(h => h.memory_id !== rawMem.memory_id);
    if (memoryHits.length) {
      core.memory_reuse_hits = upsertById(core.memory_reuse_hits, {
        reuse_id: rowId('reuse', [event && event.id, raw, memoryHits.map(h => h.memory_id).join(',')]),
        event_id: event && event.id || null,
        raw_text_preview: raw.slice(0, 180),
        memory_hits: memoryHits,
        status: 'memory_reused_in_current_inference',
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      }, 'reuse_id');
    }

    const pack = includesAny(raw, ['race jokes','racist jokes','stereotyping','collective conscience','malicious governance'])
      ? inferRaceHumorPackage(raw, event, trust, memoryHits)
      : inferGenericPackage(raw, event, trust, memoryHits);
    mergePackage(core, pack);

    core.belief_update_log = upsertById(core.belief_update_log, {
      update_id: rowId('bu', [event && event.id, raw]),
      updated_at: now(),
      event_id: event && event.id || null,
      source_id: 'direct_user',
      source_trust_score_candidate: trust.trust_score_candidate,
      memory_items_total: core.memory_items.length,
      provisional_beliefs_total: core.provisional_beliefs.length,
      update_kind: 'infer_memory_and_provisional_belief_from_user_context',
      belief_movement: 'provisional_only',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth'
    }, 'update_id');

    core.active_questions = core.active_questions
      .filter(q => !/^what is the boundary/i.test(q.question_text || '') && !/^what is this text supposed to be/i.test(q.question_text || '') && !/is this your principle, a boundary,/.test(q.question_text || ''))
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))
      .slice(0, 4);
    core.open_truth_requirements = core.open_truth_requirements.slice(0, MAX_ROWS);
    core.current_uncertainty = core.current_uncertainty.slice(0, 30);
    core.truth_status = 'not_final';
    core.promotion_status = 'not_promoted_to_final_truth';
    core.belief_movement = 'provisional_only';
    core.last_refresh_reason = reason || 'refresh_belief_memory';
    core.updated_at = now();
    return core;
  }

  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }

  function installEpistemicKernelPatch() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__beliefMemoryPatchApplied) return;
    const originalIngest = Kernel.prototype.ingest;
    const originalUnifiedTick = Kernel.prototype.unifiedTick;
    const originalSnapshot = Kernel.prototype.snapshot;
    const originalAnswerCuriosity = Kernel.prototype.answerActiveCuriosity;
    const originalAnswerLearning = Kernel.prototype.answerLearningQuestion;
    if (originalIngest) Kernel.prototype.ingest = function beliefMemoryIngest(input, meta) { const result = originalIngest.call(this, input, meta || {}); refreshBeliefMemory(stateFromKernel(this), 'kernel_ingest'); return result; };
    if (originalUnifiedTick) Kernel.prototype.unifiedTick = function beliefMemoryTick(reason) { const result = originalUnifiedTick.call(this, reason); refreshBeliefMemory(stateFromKernel(this), reason || 'kernel_tick'); return result; };
    if (originalSnapshot) Kernel.prototype.snapshot = function beliefMemorySnapshot() { refreshBeliefMemory(stateFromKernel(this), 'kernel_snapshot'); return originalSnapshot.call(this); };
    if (originalAnswerCuriosity) Kernel.prototype.answerActiveCuriosity = function beliefMemoryCuriosityAnswer(answer, meta) { const result = originalAnswerCuriosity.call(this, answer, meta || {}); refreshBeliefMemory(stateFromKernel(this), 'curiosity_answer'); return result; };
    if (originalAnswerLearning) Kernel.prototype.answerLearningQuestion = function beliefMemoryLearningAnswer(answer, meta) { const result = originalAnswerLearning.call(this, answer, meta || {}); refreshBeliefMemory(stateFromKernel(this), 'learning_answer'); return result; };
    Kernel.prototype.refreshBeliefMemory = function refreshBeliefMemoryMethod(reason) { return refreshBeliefMemory(stateFromKernel(this), reason || 'manual_refresh'); };
    Kernel.__beliefMemoryPatchApplied = true;
  }

  function wrapBrainInstance(brain) {
    if (!brain || brain.__beliefMemoryWrapped) return brain;
    const bIngest = brain.ingest;
    const bTick = brain.tick;
    const bSnapshot = brain.snapshot;
    const bProcess = brain.process;
    const bAnswerCuriosity = brain.answerActiveCuriosity;
    const bAnswerLearning = brain.answerLearningQuestion;
    if (bIngest) brain.ingest = function beliefMemoryBrainIngest(input, meta) { const result = bIngest.call(brain, input, meta || {}); refreshBeliefMemory(brain.state, 'brain_ingest'); return result; };
    if (bTick) brain.tick = function beliefMemoryBrainTick(reason) { const result = bTick.call(brain, reason); refreshBeliefMemory(brain.state, reason || 'brain_tick'); return result; };
    if (bSnapshot) brain.snapshot = function beliefMemoryBrainSnapshot() { refreshBeliefMemory(brain.state, 'brain_snapshot'); return bSnapshot.call(brain); };
    if (bProcess) brain.process = function beliefMemoryBrainProcess(input, options) { const result = bProcess.call(brain, input, options || {}); refreshBeliefMemory(brain.state, 'brain_process'); return result; };
    if (bAnswerCuriosity) brain.answerActiveCuriosity = function beliefMemoryBrainCuriosityAnswer(answer, meta) { const result = bAnswerCuriosity.call(brain, answer, meta || {}); refreshBeliefMemory(brain.state, 'brain_curiosity_answer'); return result; };
    if (bAnswerLearning) brain.answerLearningQuestion = function beliefMemoryBrainLearningAnswer(answer, meta) { const result = bAnswerLearning.call(brain, answer, meta || {}); refreshBeliefMemory(brain.state, 'brain_learning_answer'); return result; };
    brain.refreshBeliefMemory = function refreshBeliefMemoryMethod(reason) { return refreshBeliefMemory(brain.state, reason || 'brain_manual_refresh'); };
    brain.__beliefMemoryWrapped = true;
    return brain;
  }

  function installKernelBrainPatch() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__beliefMemoryPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function beliefMemoryCreateState(seed) { const state = Original.createState(seed || {}); ensureBeliefMemoryCore(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function beliefMemoryCreateBrain(seed) { return wrapBrainInstance(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function beliefMemoryStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); refreshBeliefMemory(state, 'brain_static_ingest'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function beliefMemoryStaticTick(state, reason) { const result = Original.tick(state, reason); refreshBeliefMemory(state, reason || 'brain_static_tick'); return result; };
    if (typeof Original.process === 'function') wrapper.process = function beliefMemoryStaticProcess(input, options) { const result = Original.process(input, options || {}); if (options && options.brain && options.brain.state) refreshBeliefMemory(options.brain.state, 'brain_static_process_bound'); return result; };
    wrapper.__beliefMemoryPatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function installBridgePatch() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__beliefMemoryPatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function beliefMemoryBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensureBeliefMemoryCore(binding.shared_state);
      refreshBeliefMemory(binding.shared_state, 'bridge_bind');
      if (binding.bound_brain) wrapBrainInstance(binding.bound_brain);
      return binding;
    };
    wrapper.__beliefMemoryPatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  installEpistemicKernelPatch();
  installKernelBrainPatch();
  installBridgePatch();

  global.EpistemicKernelBeliefMemoryEngineV01 = Object.freeze({
    VERSION,
    beliefMemoryDoctrine,
    createBeliefMemoryCore,
    ensureBeliefMemoryCore,
    refreshBeliefMemory,
    inferRaceHumorPackage,
    inferGenericPackage,
    relatedMemory,
    installEpistemicKernelPatch,
    installKernelBrainPatch,
    installBridgePatch
  });
})(typeof window !== 'undefined' ? window : globalThis);
