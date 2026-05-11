/* 42ndMind Maturity Objective v0.1.2 patch
 * Patch over MaturityObjectiveV01 after v0.1.1.
 *
 * Fix:
 * v0.1.0 classification treated any cap reason containing the substring
 * "self_sealing" as self_sealing_capped. That incorrectly classified
 * partial_gate_non_self_sealing as actual self-sealing pressure.
 *
 * This patch preserves all caps and scores, but makes classification exact:
 * - self_sealing_capped only for exact self_sealing_pressure
 * - motive_overclaim_capped only for exact motive_overclaim_pressure
 * - unresolved_pressure_capped for unresolved contradiction/source questions
 * - gate_limited when only partial/closed gates are limiting maturity
 */
(function (global) {
  'use strict';

  if (!global.MaturityObjectiveV01 || typeof global.MaturityObjectiveV01.assess !== 'function') {
    global.MaturityObjectiveV012PatchStatus = { installed:false, reason:'MaturityObjectiveV01_missing' };
    return;
  }

  const BASE = global.MaturityObjectiveV01;
  const VERSION = '0.1.2-patch';

  function reasons(result) {
    return Array.isArray(result.caps) ? result.caps.map(c => String(c.reason || '')) : [];
  }

  function reclassify(result) {
    const rs = reasons(result);
    if (result.surface?.is_null_origin) return 'null_origin_not_maturity';
    if (!result.surface?.is_active_surface) return 'invalid_active_surface';
    if (rs.includes('self_sealing_pressure')) return 'self_sealing_capped';
    if (rs.includes('motive_overclaim_pressure')) return 'motive_overclaim_capped';
    if (rs.includes('unresolved_contradiction_pressure') || rs.includes('unresolved_source_questions_visible')) return 'unresolved_pressure_capped';
    if (rs.some(r => r.startsWith('closed_gate_') || r.startsWith('partial_gate_'))) return 'gate_limited';
    const score = Number(result.lanes?.capped_maturity_score || 0);
    if (score >= 0.95) return 'near_objective_maturity_candidate';
    if (score >= 0.75) return 'stable_but_not_peak';
    if (score >= 0.45) return 'partially_stable';
    return 'immature_or_under_supported';
  }

  function assess(input = {}) {
    const result = BASE.assess(input);
    const old = result.classification;
    const next = reclassify(result);
    result.packet_version = VERSION;
    result.classification = next;
    result.v012_patch = {
      applied: old !== next,
      previous_classification: old,
      precise_classification: next,
      reason: 'exact_cap_reason_classification',
      preserves_caps: true,
      preserves_scores: true
    };
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
  global.MaturityObjectiveV012PatchStatus = { installed:true, version:VERSION };
})(typeof window !== 'undefined' ? window : globalThis);
