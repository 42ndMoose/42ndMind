/* 42ndMind Kernel Motivation v0.4.1 patch
 *
 * Fix:
 * v0.4.0 correctly detected sloppy intent as live intention-clarity pressure,
 * but the decision threshold was too high. MULTIPLE_PLAUSIBLE recovered intent
 * produced clarity pressure around 0.58 and fell through to HOLD_AND_REVIEW.
 *
 * v0.4.1 treats intention clarity pressure >= 0.55 as enough to prefer
 * IMPROVE_CLARITY, unless contradiction or overconfidence already has stronger
 * priority.
 */
(function (global) {
  'use strict';
  if (!global.KernelMotivationV04) return;

  const BASE = global.KernelMotivationV04;
  const VERSION = '0.4.1';
  const DECISIONS = BASE.DECISIONS;
  const PRESSURE_TYPES = BASE.PRESSURE_TYPES;

  function asArray(value) { return Array.isArray(value) ? value : []; }

  function signalValue(report, type) {
    const signal = asArray(report && report.pressure_signals).find(s => s && s.type === type);
    return signal ? Number(signal.value || 0) : 0;
  }

  function patchedDecision(report) {
    const contradiction = signalValue(report, PRESSURE_TYPES.CONTRADICTION);
    const overconfidence = signalValue(report, PRESSURE_TYPES.OVERCONFIDENCE);
    const intentionClarity = signalValue(report, PRESSURE_TYPES.INTENTION_CLARITY);
    const sourceContact = signalValue(report, PRESSURE_TYPES.SOURCE_CONTACT);
    const total = Number(report && report.pressure_total || 0);

    if (contradiction >= 0.75) return DECISIONS.RESOLVE_CONTRADICTION;
    if (overconfidence >= 0.55) return DECISIONS.REDUCE_OVERCLAIM;
    if (intentionClarity >= 0.55) return DECISIONS.IMPROVE_CLARITY;
    if (sourceContact >= 0.55) return DECISIONS.SEEK_EVIDENCE;
    if (total >= 0.42) return DECISIONS.HOLD_AND_REVIEW;
    return DECISIONS.STABLE_MAINTAIN;
  }

  function analyze(input, options) {
    const report = BASE.analyze(input, options);
    const nextDecision = patchedDecision(report);
    if (nextDecision !== report.decision) {
      report.v041_patch = {
        applied: true,
        rule: 'intention_clarity_pressure_055_prefers_improve_clarity',
        previous_decision: report.decision,
        next_decision: nextDecision
      };
      report.decision = nextDecision;
      report.recommended_actions = BASE.recommendedActions(nextDecision);
    } else {
      report.v041_patch = {
        applied: false,
        rule: 'base_decision_retained'
      };
    }
    report.packet_version = VERSION;
    return report;
  }

  global.KernelMotivationV04 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    analyze
  }));
})(typeof window !== 'undefined' ? window : globalThis);
