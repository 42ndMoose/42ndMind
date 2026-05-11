/* 42ndMind Maturity Objective v0.1
 * Pure sidecar module. It does not mutate kernel state.
 *
 * Purpose:
 * Make the maturity target explicit enough to test:
 * - null origin remains separate from active worldview states
 * - active states preserve |x| + |y| + |z| = 1
 * - objective maturity target is (0, 1, 0)
 * - upward y movement must be constrained by evidence grounding,
 *   contradiction pressure, source discipline, counter-consideration,
 *   non-self-sealing, and unresolved pressure
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const EPSILON = 0.000001;
  const GATES = Object.freeze([
    'counter_consideration',
    'non_strawman',
    'self_correction',
    'contradiction_handling',
    'reality_contact',
    'non_self_sealing'
  ]);

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function isObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function number(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  function clamp01(value) { return Math.max(0, Math.min(1, number(value))); }
  function text(value) { return String(value ?? '').trim(); }

  function statePoint(input = {}) {
    const s = input.octahedron || input.point || input.root_worldview?.octahedron || input.rootWorldview?.octahedron || input;
    return { x: number(s.x), y: number(s.y), z: number(s.z) };
  }

  function activeMass(point) {
    return Math.abs(point.x) + Math.abs(point.y) + Math.abs(point.z);
  }

  function isNullOrigin(point) {
    return Math.abs(point.x) < EPSILON && Math.abs(point.y) < EPSILON && Math.abs(point.z) < EPSILON;
  }

  function isActiveSurface(point) {
    return Math.abs(activeMass(point) - 1) < 0.001;
  }

  function normalizeGateValue(value) {
    if (typeof value === 'number') return clamp01(value);
    const s = text(value).toLowerCase();
    if (['open', 'passed', 'true', 'yes'].includes(s)) return 1;
    if (['partial', 'mixed', 'uncertain', 'unresolved'].includes(s)) return 0.5;
    if (['closed', 'failed', 'false', 'no'].includes(s)) return 0;
    if (isObject(value)) {
      if ('score' in value) return clamp01(value.score);
      if ('value' in value) return normalizeGateValue(value.value);
      if ('status' in value) return normalizeGateValue(value.status);
      if ('open' in value) return value.open ? 1 : 0;
    }
    return 0;
  }

  function collectGates(input = {}) {
    const raw = input.gates || input.gate_scores || input.gate_snapshot || input.kernel_state?.gates || {};
    const out = {};
    GATES.forEach(name => { out[name] = normalizeGateValue(raw[name]); });
    return out;
  }

  function average(values) {
    const xs = values.map(number).filter(Number.isFinite);
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  }

  function countEvidence(input = {}) {
    const evidence = asArray(input.evidence || input.kernel_state?.evidence || input.evidence_rows);
    const supporting = evidence.filter(e => text(e.relation || e.type).toLowerCase() !== 'attacks').length;
    const attacking = evidence.filter(e => text(e.relation || e.type).toLowerCase() === 'attacks').length;
    return {
      total: number(input.evidence_count, evidence.length),
      supporting: number(input.supporting_evidence_count, supporting),
      attacking: number(input.attacking_evidence_count, attacking)
    };
  }

  function countPressure(input = {}) {
    const openQuestions = asArray(input.open_questions || input.questions || input.kernel_state?.open_questions);
    const contradictions = asArray(input.contradictions || input.kernel_state?.contradictions);
    const unresolvedContradictions = contradictions.filter(c => text(c.status).toLowerCase() !== 'resolved').length;
    const sourceQuestions = number(
      input.source_registry_summary?.unresolved_source_questions ??
      input.source_registry_metadata?.counts?.unresolved_source_questions ??
      input.source_registry?.counts?.unresolved_source_questions,
      0
    );
    return {
      open_questions: number(input.open_question_count, openQuestions.length),
      unresolved_contradictions: number(input.unresolved_contradiction_count, unresolvedContradictions),
      unresolved_source_questions: sourceQuestions,
      self_sealing_flags: number(input.self_sealing_flags, 0),
      motive_overclaim_flags: number(input.motive_overclaim_flags, 0)
    };
  }

  function sourceDisciplineScore(input = {}) {
    const summary = input.source_registry_summary || input.source_registry_metadata || input.source_registry || {};
    const available = summary.available === true || isObject(summary.counts) || number(summary.source_count ?? summary.counts?.sources, 0) > 0;
    const unresolved = number(summary.unresolved_source_questions ?? summary.counts?.unresolved_source_questions, 0);
    if (!available) return 0;
    if (unresolved > 0) return 0.55;
    return 0.85;
  }

  function evidenceGroundingScore(evidence) {
    if (evidence.total <= 0) return 0;
    const supportBase = Math.min(1, evidence.supporting / 3);
    const attackAwareness = evidence.attacking > 0 ? 1 : 0.65;
    return clamp01((supportBase * 0.75) + (attackAwareness * 0.25));
  }

  function pressurePenalty(pressure) {
    const raw =
      pressure.open_questions * 0.08 +
      pressure.unresolved_contradictions * 0.18 +
      pressure.unresolved_source_questions * 0.08 +
      pressure.self_sealing_flags * 0.35 +
      pressure.motive_overclaim_flags * 0.22;
    return clamp01(raw);
  }

  function hardCaps(gates, evidence, pressure, sourceScore) {
    const caps = [];
    if (evidence.total <= 0) caps.push({ cap: 0.35, reason: 'no_evidence_grounding' });
    if (sourceScore <= 0) caps.push({ cap: 0.55, reason: 'no_source_registry_or_source_review_visibility' });
    if (pressure.unresolved_contradictions > 0) caps.push({ cap: 0.72, reason: 'unresolved_contradiction_pressure' });
    if (pressure.unresolved_source_questions > 0) caps.push({ cap: 0.82, reason: 'unresolved_source_questions_visible' });
    if (pressure.self_sealing_flags > 0) caps.push({ cap: 0.45, reason: 'self_sealing_pressure' });
    if (pressure.motive_overclaim_flags > 0) caps.push({ cap: 0.62, reason: 'motive_overclaim_pressure' });
    GATES.forEach(name => {
      if (gates[name] <= 0) caps.push({ cap: 0.55, reason: `closed_gate_${name}` });
      else if (gates[name] < 0.75) caps.push({ cap: 0.82, reason: `partial_gate_${name}` });
    });
    return caps;
  }

  function applyCaps(score, caps) {
    return caps.reduce((s, item) => Math.min(s, item.cap), score);
  }

  function classify(score, point, caps) {
    if (isNullOrigin(point)) return 'null_origin_not_maturity';
    if (!isActiveSurface(point)) return 'invalid_active_surface';
    if (caps.some(c => c.reason.includes('self_sealing'))) return 'self_sealing_capped';
    if (caps.some(c => c.reason.includes('motive_overclaim'))) return 'motive_overclaim_capped';
    if (caps.some(c => c.reason.includes('unresolved'))) return 'unresolved_pressure_capped';
    if (score >= 0.95) return 'near_objective_maturity_candidate';
    if (score >= 0.75) return 'stable_but_not_peak';
    if (score >= 0.45) return 'partially_stable';
    return 'immature_or_under_supported';
  }

  function assess(input = {}) {
    const point = statePoint(input);
    const gates = collectGates(input);
    const evidence = countEvidence(input);
    const pressure = countPressure(input);
    const gateScore = average(GATES.map(name => gates[name]));
    const evidenceScore = evidenceGroundingScore(evidence);
    const sourceScore = sourceDisciplineScore(input);
    const penalty = pressurePenalty(pressure);
    const rawScore = clamp01((gateScore * 0.38) + (evidenceScore * 0.28) + (sourceScore * 0.18) + (clamp01(point.y) * 0.16) - penalty);
    const caps = hardCaps(gates, evidence, pressure, sourceScore);
    const cappedScore = applyCaps(rawScore, caps);

    return {
      packet_type: '42ndMind_maturity_objective_assessment',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      doctrine: {
        null_origin_is_not_maturity: true,
        active_worldview_surface: '|x| + |y| + |z| = 1',
        objective_maturity_target: { x: 0, y: 1, z: 0 },
        lateral_tensions_integrated_not_erased: true,
        kernel_owns_belief_movement: true,
        non_scoring_assessment: true
      },
      point,
      surface: {
        active_mass: activeMass(point),
        is_null_origin: isNullOrigin(point),
        is_active_surface: isActiveSurface(point),
        surface_error: Math.abs(activeMass(point) - 1)
      },
      lanes: {
        gate_score: gateScore,
        evidence_grounding_score: evidenceScore,
        source_discipline_score: sourceScore,
        y_stability_signal: clamp01(point.y),
        unresolved_pressure_penalty: penalty,
        raw_maturity_score: rawScore,
        capped_maturity_score: cappedScore
      },
      inputs_seen: { gates, evidence, pressure },
      caps,
      classification: classify(cappedScore, point, caps),
      belief_state_effect: {
        belief_movement: 'none',
        scoring_effect: 'none',
        kernel_state_mutation: false
      }
    };
  }

  function canPromotePeak(input = {}) {
    const result = assess(input);
    return result.surface.is_active_surface && !result.surface.is_null_origin && result.lanes.capped_maturity_score >= 0.95 && result.caps.length === 0;
  }

  global.MaturityObjectiveV01 = Object.freeze({
    VERSION,
    GATES,
    assess,
    canPromotePeak,
    activeMass,
    isNullOrigin,
    isActiveSurface
  });
})(typeof window !== 'undefined' ? window : globalThis);
