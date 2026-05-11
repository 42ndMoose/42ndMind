/* 42ndMind Maturity Objective v0.1.1 patch
 * Patch over MaturityObjectiveV01.
 *
 * Fix:
 * The v0.1.0 source-discipline lane maxed at 0.85, so a perfectly clean,
 * source-visible, well-evidenced peak candidate could still be capped below y=1.
 * That made the objective maturity target unreachable in practice.
 *
 * This patch preserves all caps, but permits true y=1 when:
 * - active surface is valid
 * - point is already at y=1
 * - there are no caps
 * - gates and evidence are clean
 * - source registry visibility exists
 * - no unresolved source questions are visible
 */
(function (global) {
  'use strict';

  if (!global.MaturityObjectiveV01 || typeof global.MaturityObjectiveV01.assess !== 'function') {
    global.MaturityObjectiveV011PatchStatus = { installed:false, reason:'MaturityObjectiveV01_missing' };
    return;
  }

  const BASE = global.MaturityObjectiveV01;
  const VERSION = '0.1.1-patch';
  const EPS = 0.000001;

  function number(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function sourceClean(input) {
    const s = input.source_registry_summary || input.source_registry_metadata || input.source_registry || {};
    const count = number(s.source_count ?? s.counts?.sources, 0);
    const unresolved = number(s.unresolved_source_questions ?? s.counts?.unresolved_source_questions, 0);
    return (s.available === true || count > 0 || Boolean(s.counts)) && unresolved === 0;
  }

  function cleanPeakEligible(input, result) {
    return result.surface?.is_active_surface === true &&
      result.surface?.is_null_origin === false &&
      Math.abs(number(result.point?.x)) <= EPS &&
      number(result.point?.y) >= 1 - EPS &&
      Math.abs(number(result.point?.z)) <= EPS &&
      result.caps.length === 0 &&
      number(result.lanes?.gate_score) >= 1 - EPS &&
      number(result.lanes?.evidence_grounding_score) >= 1 - EPS &&
      sourceClean(input) &&
      number(result.inputs_seen?.pressure?.open_questions) === 0 &&
      number(result.inputs_seen?.pressure?.unresolved_contradictions) === 0 &&
      number(result.inputs_seen?.pressure?.unresolved_source_questions) === 0 &&
      number(result.inputs_seen?.pressure?.self_sealing_flags) === 0 &&
      number(result.inputs_seen?.pressure?.motive_overclaim_flags) === 0;
  }

  function assess(input = {}) {
    const result = BASE.assess(input);
    if (cleanPeakEligible(input, result)) {
      result.packet_version = VERSION;
      result.lanes.source_discipline_score = 1;
      result.lanes.raw_maturity_score = 1;
      result.lanes.capped_maturity_score = 1;
      result.classification = 'near_objective_maturity_candidate';
      result.v011_patch = {
        applied:true,
        reason:'clean_source_visible_peak_can_reach_y_1',
        preserves_caps:true
      };
    } else {
      result.v011_patch = { applied:false, reason:'not_clean_peak_eligible', preserves_caps:true };
    }
    return result;
  }

  function canPromotePeak(input = {}) {
    const result = assess(input);
    return result.surface.is_active_surface && !result.surface.is_null_origin && result.lanes.capped_maturity_score >= 0.95 && result.caps.length === 0;
  }

  global.MaturityObjectiveV01 = Object.freeze({
    ...BASE,
    VERSION,
    assess,
    canPromotePeak
  });
  global.MaturityObjectiveV011PatchStatus = { installed:true, version:VERSION };
})(typeof window !== 'undefined' ? window : globalThis);
