/* 42ndMind Kernel Motivation v0.4
 *
 * Purpose:
 * Convert epistemic state into live pressure signals so the kernel has a
 * desire-like preference gradient toward mature integration without pretending
 * to have human emotion.
 *
 * Motivation here means: persistent preference over epistemic states.
 * It does not decide truth, bypass the governor, promote rules, or mutate state.
 *
 * Doctrine:
 * - peak maturity should emerge as an attractor from first principles
 * - immature states create visible epistemic pressure
 * - pressure reduction must be earned by clarity, source contact, consistency,
 *   falsifiability, bounded confidence, and governor-compatible movement
 * - optimality is best-reachable-state under current constraints, not fake certainty
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const PRESSURE_TYPES = Object.freeze({
    CONTRADICTION: 'contradiction_pressure',
    UNRESOLVED: 'unresolved_pressure',
    OVERCONFIDENCE: 'overconfidence_pressure',
    SOURCE_CONTACT: 'source_contact_hunger',
    FALSIFIABILITY: 'falsifiability_hunger',
    INTEGRATION: 'integration_pressure',
    SELF_STABILITY: 'self_stability_pressure',
    INTENTION_CLARITY: 'intention_clarity_pressure',
    OPTIMALITY: 'optimality_pressure'
  });
  const DECISIONS = Object.freeze({
    STABLE_MAINTAIN: 'STABLE_MAINTAIN',
    IMPROVE_CLARITY: 'IMPROVE_CLARITY',
    SEEK_EVIDENCE: 'SEEK_EVIDENCE',
    REDUCE_OVERCLAIM: 'REDUCE_OVERCLAIM',
    RESOLVE_CONTRADICTION: 'RESOLVE_CONTRADICTION',
    HOLD_AND_REVIEW: 'HOLD_AND_REVIEW'
  });

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function now() { return new Date().toISOString(); }
  function round(value) { return Number(clamp(value, 0, 1).toFixed(3)); }

  function present(value) { return value !== null && value !== undefined; }

  function pressure(type, value, reason, evidence, repair) {
    return {
      type,
      value: round(value),
      reason: text(reason),
      evidence: asArray(evidence).map(text).filter(Boolean),
      repair_path: asArray(repair).map(text).filter(Boolean)
    };
  }

  function reportFromInput(input) {
    return input && input.packet_type === '42ndMind_kernel_brain_v0_4_report' ? input : null;
  }

  function consistencyFrom(input) {
    if (input && input.consistency_report) return input.consistency_report;
    if (input && input.packet_type === '42ndMind_kernel_consistency_report_v0_4') return input;
    return null;
  }

  function probabilityFrom(input) {
    if (input && input.probability_report) return input.probability_report;
    if (input && input.packet_type === '42ndMind_kernel_probability_report_v0_4') return input;
    return null;
  }

  function intentionFrom(input) {
    if (input && input.intention_recovery_report) return input.intention_recovery_report;
    if (input && input.packet_type === '42ndMind_kernel_intention_recovery_report') return input;
    return null;
  }

  function stateSnapshotFrom(input) {
    if (input && input.state_snapshot) return input.state_snapshot;
    if (input && input.packet_type === '42ndMind_kernel_state_v0_4_snapshot') return input;
    return null;
  }

  function questionsFrom(report) {
    const items = [];
    if (!report) return items;
    const candidate = report.sensemaking_report && report.sensemaking_report.governor_candidate;
    if (candidate) items.push.apply(items, asArray(candidate.questions));
    if (report.preflight_report && report.preflight_report.sanitized_command) {
      asArray(report.preflight_report.sanitized_command.commands).forEach(cmd => {
        const packet = cmd && (cmd.packet || cmd.extraction_packet) || {};
        asArray(packet.questions).forEach(q => items.push(text(q && (q.text || q))));
      });
    }
    return items.map(text).filter(Boolean);
  }

  function attacksFrom(report) {
    const items = [];
    if (!report) return items;
    const candidate = report.sensemaking_report && report.sensemaking_report.governor_candidate;
    if (candidate) items.push.apply(items, asArray(candidate.attacks));
    return items.map(text).filter(Boolean);
  }

  function contradictionPressure(consistency) {
    if (!consistency) return pressure(PRESSURE_TYPES.CONTRADICTION, 0.12, 'No consistency report is visible, so contradiction status is not fully known.', ['missing_consistency_report'], ['run_consistency_check']);
    if (consistency.decision === 'CONTRADICTION_VISIBLE') {
      return pressure(PRESSURE_TYPES.CONTRADICTION, 0.92, 'Visible contradiction must remain active until resolved or bounded.', [`conflicts:${asArray(consistency.conflicts).length}`], ['preserve_conflict', 'ask_what_would_resolve_or_bound_it']);
    }
    if (consistency.decision === 'TENSION_VISIBLE') {
      return pressure(PRESSURE_TYPES.CONTRADICTION, 0.45, 'Tension is visible and should constrain upward certainty.', [`duplicates:${asArray(consistency.duplicates).length}`], ['keep_tension_visible', 'check_independent_provenance']);
    }
    if (consistency.decision === 'INSUFFICIENT_STRUCTURE') {
      return pressure(PRESSURE_TYPES.CONTRADICTION, 0.28, 'Structure is insufficient for consistency confidence.', ['insufficient_structure'], ['recover_intent_or_clarify_claim']);
    }
    return pressure(PRESSURE_TYPES.CONTRADICTION, 0.04, 'No visible contradiction pressure.', ['consistent_or_no_conflict_visible'], ['maintain_consistency_monitoring']);
  }

  function unresolvedPressure(report, probability) {
    const questions = questionsFrom(report);
    const attacks = attacksFrom(report);
    const penalty = probability ? Number(probability.unresolved_penalty || 0) : 0;
    const value = clamp(questions.length * 0.12 + attacks.length * 0.14 + penalty, 0, 0.9);
    return pressure(PRESSURE_TYPES.UNRESOLVED, value, value > 0 ? 'Unresolved questions or attacks remain visible.' : 'No unresolved pressure is visible.', [`questions:${questions.length}`, `attacks:${attacks.length}`, `probability_penalty:${penalty}`], value > 0 ? ['answer_or_preserve_open_questions', 'do_not_hide_unresolved_pressure'] : ['continue_monitoring']);
  }

  function overconfidencePressure(probability) {
    if (!probability) return pressure(PRESSURE_TYPES.OVERCONFIDENCE, 0.18, 'No calibrated probability is visible, so raw confidence must not be overtrusted.', ['missing_probability_report'], ['run_probability_calibration']);
    const raw = Number(probability.raw_confidence_mean || 0.5);
    const calibrated = Number(probability.probability || 0.5);
    const gap = Math.max(0, raw - calibrated);
    const capped = probability.probability_band === 'CAPPED_BY_EPISTEMIC_PRESSURE' ? 0.25 : 0;
    return pressure(PRESSURE_TYPES.OVERCONFIDENCE, clamp(gap + capped, 0, 0.95), gap + capped > 0 ? 'Raw confidence exceeds calibrated probability or is capped by epistemic pressure.' : 'No overconfidence pressure is visible.', [`raw:${raw}`, `calibrated:${calibrated}`, `band:${probability.probability_band}`], gap + capped > 0 ? ['lower_confidence_or_add_support', 'respect_probability_cap'] : ['maintain_bounded_confidence']);
  }

  function sourceContactPressure(report, probability) {
    const items = asArray(report && report.epistemic_items);
    const sourceCount = probability ? Number(probability.independent_source_count || 0) : 0;
    const hasItems = items.length > 0;
    let value = 0;
    if (!hasItems) value = 0.12;
    else if (sourceCount <= 0) value = 0.78;
    else if (sourceCount === 1) value = 0.38;
    else value = 0.08;
    return pressure(PRESSURE_TYPES.SOURCE_CONTACT, value, sourceCount <= 0 && hasItems ? 'Claim-like pressure has no independent source contact.' : 'Source contact pressure is bounded.', [`epistemic_items:${items.length}`, `independent_sources:${sourceCount}`], sourceCount <= 0 && hasItems ? ['seek_source_contact', 'mark_unreviewed_until_source_visible'] : ['preserve_provenance_distinction']);
  }

  function falsifiabilityPressure(report, intention) {
    const questions = questionsFrom(report);
    const hasFalsifiabilityQuestion = questions.some(q => /weaken|against|falsif|disprove|count against|what would/.test(q.toLowerCase()));
    const motiveRisk = intention && intention.decision === 'HIGH_RISK_INTENT';
    const value = hasFalsifiabilityQuestion ? 0.08 : motiveRisk ? 0.72 : questions.length ? 0.28 : 0.42;
    return pressure(PRESSURE_TYPES.FALSIFIABILITY, value, hasFalsifiabilityQuestion ? 'A falsifiability path is visible.' : 'No clear falsifiability path is visible.', [`falsifiability_question:${hasFalsifiabilityQuestion}`, `motive_risk:${!!motiveRisk}`], hasFalsifiabilityQuestion ? ['maintain_counter_consideration_visibility'] : ['ask_what_would_weaken_this', 'avoid_self_sealing_pressure']);
  }

  function integrationPressure(report, consistency, probability) {
    const decision = text(report && report.final_decision);
    const consistencyScore = consistency ? Number(consistency.consistency_score || 0) : 0.5;
    const prob = probability ? Number(probability.probability || 0.5) : 0.5;
    let value = 0.2;
    if (decision === 'BLOCK') value += 0.45;
    if (decision === 'CLARIFY') value += 0.28;
    if (decision === 'NEAR_NULL') value += 0.12;
    value += (1 - consistencyScore) * 0.25;
    if (prob < 0.42) value += 0.16;
    return pressure(PRESSURE_TYPES.INTEGRATION, clamp(value, 0, 0.95), 'Integration pressure reflects how far current material is from stable mature synthesis.', [`decision:${decision || 'unknown'}`, `consistency:${consistencyScore}`, `probability:${prob}`], ['integrate_only_after_clarity_consistency_and_probability_are_bounded']);
  }

  function selfStabilityPressure(report) {
    const decision = text(report && report.final_decision);
    const isSelfModification = /self|kernel|rewrite|promote|rule|doctrine|architecture/i.test(text(report && report.input_preview));
    const risky = isSelfModification && (decision !== 'BLOCK' && decision !== 'CLARIFY');
    return pressure(PRESSURE_TYPES.SELF_STABILITY, risky ? 0.72 : isSelfModification ? 0.36 : 0.08, risky ? 'Self-modification-like pressure must stay governed and test-bound.' : 'No major self-stability pressure is visible.', [`self_modification_language:${isSelfModification}`, `decision:${decision || 'unknown'}`], risky ? ['route_to_self_maintenance_candidate', 'require_tests_before_promotion'] : ['preserve_governor_authority']);
  }

  function intentionClarityPressure(intention, report) {
    if (intention) {
      if (intention.decision === 'MULTIPLE_PLAUSIBLE') return pressure(PRESSURE_TYPES.INTENTION_CLARITY, 0.58, 'Multiple plausible intended meanings remain live.', [`interpretations:${asArray(intention.interpretations).length}`], ['preserve_alternatives', 'ask_targeted_clarification']);
      if (intention.decision === 'CLARIFY') return pressure(PRESSURE_TYPES.INTENTION_CLARITY, 0.76, 'Intended meaning cannot be safely recovered yet.', ['clarification_needed'], ['ask_for_exact_claim_evidence_or_question']);
      if (intention.decision === 'HIGH_RISK_INTENT') return pressure(PRESSURE_TYPES.INTENTION_CLARITY, 0.84, 'Intent or motive inference is high-risk.', ['high_risk_intent'], ['rewrite_as_observable_claim', 'seek_independent_motive_evidence']);
      return pressure(PRESSURE_TYPES.INTENTION_CLARITY, 0.12, 'Recovered intention is usable as candidate pressure.', [`decision:${intention.decision}`], ['send_candidate_to_governor']);
    }
    const sense = report && report.sensemaking_report;
    if (sense && sense.classification === 'ambiguous_candidate_meaning') return pressure(PRESSURE_TYPES.INTENTION_CLARITY, 0.7, 'Sensemaking found ambiguity without recovered intention.', ['ambiguous_candidate_meaning'], ['run_intention_recovery_or_ask_clarification']);
    return pressure(PRESSURE_TYPES.INTENTION_CLARITY, 0.18, 'No explicit intention recovery report is attached.', ['no_intention_report'], ['run_intention_recovery_when_wording_is_sloppy']);
  }

  function optimalityPressure(report, consistency, probability) {
    const decision = text(report && report.final_decision);
    const blockers = [];
    if (decision === 'BLOCK') blockers.push('blocked_pressure');
    if (decision === 'CLARIFY') blockers.push('clarification_needed');
    if (consistency && consistency.decision !== 'CONSISTENT') blockers.push(consistency.decision);
    if (probability && probability.probability_band === 'CAPPED_BY_EPISTEMIC_PRESSURE') blockers.push('probability_capped');
    const value = clamp(blockers.length * 0.16, 0.04, 0.88);
    return pressure(PRESSURE_TYPES.OPTIMALITY, value, blockers.length ? 'Current state is not the best reachable mature state under known constraints.' : 'Current state is close to the best reachable bounded state.', blockers, blockers.length ? ['move_to_best_reachable_state_without_fake_certainty'] : ['maintain_state_and_monitor_new_evidence']);
  }

  function weightedTotal(signals) {
    const weights = {
      contradiction_pressure: 1.25,
      unresolved_pressure: 1.05,
      overconfidence_pressure: 1.1,
      source_contact_hunger: 1.0,
      falsifiability_hunger: 1.0,
      integration_pressure: 0.9,
      self_stability_pressure: 1.15,
      intention_clarity_pressure: 1.0,
      optimality_pressure: 0.85
    };
    let num = 0, den = 0;
    asArray(signals).forEach(s => {
      const w = weights[s.type] || 1;
      num += Number(s.value || 0) * w;
      den += w;
    });
    return round(den ? num / den : 0);
  }

  function chooseDecision(total, signals) {
    const byType = Object.fromEntries(asArray(signals).map(s => [s.type, Number(s.value || 0)]));
    if ((byType[PRESSURE_TYPES.CONTRADICTION] || 0) >= 0.75) return DECISIONS.RESOLVE_CONTRADICTION;
    if ((byType[PRESSURE_TYPES.OVERCONFIDENCE] || 0) >= 0.55) return DECISIONS.REDUCE_OVERCLAIM;
    if ((byType[PRESSURE_TYPES.INTENTION_CLARITY] || 0) >= 0.65) return DECISIONS.IMPROVE_CLARITY;
    if ((byType[PRESSURE_TYPES.SOURCE_CONTACT] || 0) >= 0.55) return DECISIONS.SEEK_EVIDENCE;
    if (total >= 0.42) return DECISIONS.HOLD_AND_REVIEW;
    return DECISIONS.STABLE_MAINTAIN;
  }

  function recommendedActions(decision) {
    if (decision === DECISIONS.RESOLVE_CONTRADICTION) return ['preserve_contradiction', 'ask_resolution_question', 'cap_probability_until_resolved'];
    if (decision === DECISIONS.REDUCE_OVERCLAIM) return ['lower_confidence', 'keep_probability_cap_visible', 'seek_independent_support'];
    if (decision === DECISIONS.IMPROVE_CLARITY) return ['run_intention_recovery', 'ask_targeted_clarification', 'preserve_multiple_interpretations'];
    if (decision === DECISIONS.SEEK_EVIDENCE) return ['seek_source_contact', 'separate_retrieval_from_verification', 'avoid_independent_convergence_from_duplicates'];
    if (decision === DECISIONS.HOLD_AND_REVIEW) return ['hold_candidate_pressure', 'review_unresolved_questions', 'do_not_promote_yet'];
    return ['maintain_current_bounded_state', 'monitor_new_pressure'];
  }

  function analyze(input = {}, options = {}) {
    const report = reportFromInput(input) || reportFromInput(input.report);
    const consistency = consistencyFrom(input) || consistencyFrom(report);
    const probability = probabilityFrom(input) || probabilityFrom(report);
    const intention = intentionFrom(input) || intentionFrom(input.intention_report);
    const stateSnapshot = stateSnapshotFrom(input);

    const signals = [
      contradictionPressure(consistency),
      unresolvedPressure(report, probability),
      overconfidencePressure(probability),
      sourceContactPressure(report, probability),
      falsifiabilityPressure(report, intention),
      integrationPressure(report, consistency, probability),
      selfStabilityPressure(report),
      intentionClarityPressure(intention, report),
      optimalityPressure(report, consistency, probability)
    ];
    const total = weightedTotal(signals);
    const decision = chooseDecision(total, signals);

    return {
      packet_type: '42ndMind_kernel_motivation_report_v0_4',
      packet_version: VERSION,
      created_at: now(),
      decision,
      pressure_total: total,
      pressure_signals: signals,
      recommended_actions: recommendedActions(decision),
      state_snapshot_seen: !!stateSnapshot,
      belief_movement: 'none',
      governor_bypass: false,
      motivation_is_not_emotion: true,
      motivation_is_preference_gradient: true,
      doctrine: {
        peak_is_attractor_not_slogan: true,
        optimality_means_best_reachable_state_under_constraints: true,
        pressure_reduction_must_be_earned: true,
        motivation_does_not_decide_truth: true,
        motivation_does_not_bypass_governor: true,
        motivation_does_not_auto_promote_rules: true,
        ambiguous_intent_prefers_clarification_over_false_certainty: true
      }
    };
  }

  function sampleInput(kind) {
    if (!global.KernelBrainV04 || typeof global.KernelBrainV04.process !== 'function') return {};
    if (kind === 'contradiction') {
      const consistency_report = global.KernelConsistencyV04 && global.KernelConsistencyV04.analyze(global.KernelConsistencyV04.sampleItems('contradiction'));
      const probability_report = global.KernelProbabilityV04 && global.KernelProbabilityV04.analyze({ items:global.KernelConsistencyV04.sampleItems('contradiction'), consistency_report });
      return { report:global.KernelBrainV04.process(global.KernelBrainV04.sampleInput('claim')), consistency_report, probability_report };
    }
    if (kind === 'sloppy') {
      return { report:global.KernelBrainV04.process(global.KernelBrainV04.sampleInput('ambiguous')), intention_report:global.KernelIntentionRecoveryV04 && global.KernelIntentionRecoveryV04.analyze(global.KernelIntentionRecoveryV04.sampleInput('sloppy')) };
    }
    if (kind === 'unreviewed') return global.KernelBrainV04.process('The claim is probably true but no source is available yet.');
    if (kind === 'command') return global.KernelBrainV04.process(global.KernelBrainV04.sampleInput('reviewed_command'));
    return global.KernelBrainV04.process(global.KernelBrainV04.sampleInput(kind || 'claim'));
  }

  global.KernelMotivationV04 = Object.freeze({
    VERSION,
    PRESSURE_TYPES,
    DECISIONS,
    analyze,
    sampleInput,
    weightedTotal,
    recommendedActions
  });
})(typeof window !== 'undefined' ? window : globalThis);
