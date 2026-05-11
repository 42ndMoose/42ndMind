/* 42ndMind Maturity Hard Fusion v0.1
 * Patch layer that constrains upward y movement after normal kernel recalculation.
 * Requires: EpistemicKernel, MaturityObjectiveV01, optionally MaturityFusionV01.
 *
 * This is the first movement-fusion layer:
 * - preserves null origin
 * - preserves active surface math |x| + |y| + |z| = 1
 * - caps upward y when maturity objective says unresolved pressure blocks it
 * - records audit metadata/events
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 0.000001;
  const SOURCE_REGISTRY_KEY = '42ndMind_source_registry_v0_1';

  const GATE_MAP = Object.freeze({
    counter_consideration: 'G1_counter_consideration',
    non_strawman: 'G2_non_strawman',
    self_correction: 'G3_self_correction',
    contradiction_handling: 'G4_contradiction_handling',
    reality_contact: 'G5_reality_contact',
    non_self_sealing: 'G6_non_self_sealing'
  });

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function number(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function clamp01(value) { return Math.max(0, Math.min(1, number(value))); }
  function abs(v) { return Math.abs(number(v)); }
  function text(value) { return String(value ?? '').trim(); }
  function activeMass(point) { return abs(point.x) + abs(point.y) + abs(point.z); }
  function isNull(point) { return activeMass(point) <= EPS; }
  function isSurface(point) { return Math.abs(activeMass(point) - 1) <= 0.001; }
  function now() { return new Date().toISOString(); }

  function pointFromState(state) {
    const root = state.rootWorldview || state.root_worldview || state.root || {};
    const candidates = [
      root.octahedron && root.octahedron.point,
      root.octahedron,
      root.point,
      state.octahedron && state.octahedron.point,
      state.octahedron,
      state.point,
      state.root_point
    ];
    const p = candidates.find(v => v && (v.x !== undefined || v.y !== undefined || v.z !== undefined)) || {};
    return { x: number(p.x), y: number(p.y), z: number(p.z) };
  }

  function simpleGates(state) {
    const gateStates = state.gateStates || {};
    const out = {};
    Object.entries(GATE_MAP).forEach(([simple, internal]) => {
      const rawScore = number(gateStates[internal] && gateStates[internal].score, 0);
      out[simple] = clamp01((rawScore + 1) / 2);
    });
    return out;
  }

  function loadSourceRegistrySummary() {
    try {
      if (!global.localStorage) return { available: false, source_count: 0, unresolved_source_questions: 0 };
      const raw = global.localStorage.getItem(SOURCE_REGISTRY_KEY);
      if (!raw) return { available: false, source_count: 0, unresolved_source_questions: 0 };
      const payload = JSON.parse(raw);
      const registry = payload && (payload.sourceRegistry || (payload.sourceRegistryReport && payload.sourceRegistryReport.source_registry));
      const counts = (registry && registry.counts) || {};
      return {
        available: Boolean(registry),
        source_count: number(counts.sources, 0),
        unresolved_source_questions: number(counts.unresolved_source_questions, 0),
        metadata_only: true,
        scoring_allowed: false
      };
    } catch (error) {
      return { available: false, source_count: 0, unresolved_source_questions: 0, error: error.message };
    }
  }

  function pressureFlags(state) {
    const contradictions = asArray(state.contradictions);
    const activeContradictions = contradictions.filter(c => text(c.status || 'active') !== 'resolved');
    const questions = asArray(state.questions || state.open_questions || state.openQuestions);
    const openQuestions = questions.filter(q => text(q.status || 'open') !== 'resolved');
    const gateStates = state.gateStates || {};
    const nonSelfSealingScore = number(gateStates.G6_non_self_sealing && gateStates.G6_non_self_sealing.score, 0);
    const motiveQuestionCount = openQuestions.filter(q => /motive|intent|intention|deliberate|malice/i.test(text(q.text))).length;
    const selfSealingContradictions = activeContradictions.filter(c => /self-sealing|self sealing/i.test(text(c.reason))).length;
    return {
      open_question_count: openQuestions.length,
      unresolved_contradiction_count: activeContradictions.length,
      self_sealing_flags: (nonSelfSealingScore < -0.1 ? 1 : 0) + selfSealingContradictions,
      motive_overclaim_flags: motiveQuestionCount > 0 ? 1 : 0
    };
  }

  function inputFromState(state) {
    const pressure = pressureFlags(state);
    return {
      point: pointFromState(state),
      gates: simpleGates(state),
      evidence: asArray(state.evidence || state.evidenceRows || state.evidence_rows),
      contradictions: asArray(state.contradictions),
      open_questions: asArray(state.questions || state.open_questions || state.openQuestions),
      open_question_count: pressure.open_question_count,
      unresolved_contradiction_count: pressure.unresolved_contradiction_count,
      self_sealing_flags: pressure.self_sealing_flags,
      motive_overclaim_flags: pressure.motive_overclaim_flags,
      source_registry_summary: loadSourceRegistrySummary()
    };
  }

  function capPoint(point, allowedY) {
    const p = { x: number(point.x), y: number(point.y), z: number(point.z) };
    const allowed = clamp01(allowedY);
    if (isNull(p)) return { point: p, applied: false, reason: 'null_origin' };
    if (!isSurface(p)) return { point: p, applied: false, reason: 'invalid_surface' };
    if (p.y <= allowed + EPS) return { point: p, applied: false, reason: 'already_within_cap' };

    const newY = allowed;
    const oldLateral = abs(p.x) + abs(p.z);
    const newLateral = Math.max(0, 1 - abs(newY));
    let x = 0;
    let z = 0;

    if (oldLateral > EPS) {
      x = Math.sign(p.x) * (abs(p.x) / oldLateral) * newLateral;
      z = Math.sign(p.z) * (abs(p.z) / oldLateral) * newLateral;
    } else {
      x = 0;
      z = newLateral;
    }

    return {
      point: { x, y: newY, z },
      applied: true,
      reason: oldLateral > EPS ? 'proportional_lateral_preservation' : 'fallback_lateral_knowledge_burden'
    };
  }

  function updateRootNode(state, point, debug) {
    const nodes = asArray(state.beliefGraph && state.beliefGraph.nodes);
    const root = nodes.find(node => node.id === 'root_worldview');
    if (!root) return;
    root.octahedron = root.octahedron || {};
    root.octahedron.point = { ...point };
    root.octahedron.debug = { ...(root.octahedron.debug || {}), maturity_hard_fusion: debug };
  }

  function logOnce(state, detail) {
    const signature = [detail.action, detail.original_y.toFixed(6), detail.allowed_y.toFixed(6), detail.capped_y.toFixed(6), detail.cap_reasons.join('|')].join(':');
    state.maturityHardFusionAudit = state.maturityHardFusionAudit || {};
    if (state.maturityHardFusionAudit.last_signature === signature) return;
    state.maturityHardFusionAudit.last_signature = signature;
    state.eventLog = asArray(state.eventLog);
    state.eventLog.push({
      id: `event_maturity_hard_fusion_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      at: now(),
      type: 'maturity_hard_fusion_applied',
      detail
    });
  }

  function applyToState(state) {
    if (!global.MaturityObjectiveV01 || typeof global.MaturityObjectiveV01.assess !== 'function') {
      state.maturityHardFusion = { available: false, reason: 'MaturityObjectiveV01_missing', version: VERSION };
      return state.maturityHardFusion;
    }

    const input = inputFromState(state);
    const assessment = global.MaturityObjectiveV01.assess(input);
    const fusion = global.MaturityFusionV01 && typeof global.MaturityFusionV01.proposal === 'function'
      ? global.MaturityFusionV01.proposal({ ...input, assessment })
      : { action: 'cap_upward_y_movement', proposed_y: clamp01(input.point.y), allowed_y: clamp01(assessment.lanes && assessment.lanes.capped_maturity_score), cap_reasons: asArray(assessment.caps).map(c => c.reason), assessment };

    const originalPoint = input.point;
    const capped = capPoint(originalPoint, fusion.allowed_y);
    const detail = {
      version: VERSION,
      action: capped.applied ? 'cap_upward_y_movement' : 'no_cap_applied',
      cap_algorithm: capped.reason,
      original_point: originalPoint,
      capped_point: capped.point,
      original_y: number(originalPoint.y),
      allowed_y: number(fusion.allowed_y),
      capped_y: number(capped.point.y),
      cap_reasons: asArray(fusion.cap_reasons),
      maturity_classification: assessment.classification,
      doctrine: {
        hard_fusion_applied_to_point: capped.applied,
        active_surface_preserved: isSurface(capped.point) || isNull(capped.point),
        null_origin_preserved: isNull(originalPoint) ? isNull(capped.point) : true,
        upward_y_constrained_by_maturity_objective: true,
        kernel_owns_belief_movement: true
      }
    };

    state.maturityHardFusion = {
      packet_type: '42ndMind_maturity_hard_fusion_state',
      packet_version: VERSION,
      updated_at: now(),
      applied: capped.applied,
      detail,
      assessment,
      fusion_proposal: fusion
    };

    if (capped.applied) {
      state.octahedron = state.octahedron || {};
      state.octahedron.point = { ...capped.point };
      state.octahedron.debug = { ...(state.octahedron.debug || {}), maturity_hard_fusion: detail };
      updateRootNode(state, capped.point, detail);
      logOnce(state, detail);
    }

    return state.maturityHardFusion;
  }

  function install() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || !Kernel.prototype) return { installed: false, reason: 'EpistemicKernel_missing' };
    const proto = Kernel.prototype;
    if (proto.__maturityHardFusionV01Installed) return { installed: true, already_installed: true, version: VERSION };
    if (typeof proto.recalculate !== 'function') return { installed: false, reason: 'recalculate_missing' };

    const originalRecalculate = proto.recalculate;
    proto.recalculate = function maturityHardFusionRecalculateWrapper(...args) {
      const result = originalRecalculate.apply(this, args);
      try { applyToState(this.state); }
      catch (error) { this.state.maturityHardFusion = { packet_version: VERSION, applied: false, error: error.message, updated_at: now() }; }
      return result;
    };
    proto.__maturityHardFusionV01Installed = true;
    proto.__maturityHardFusionV01OriginalRecalculate = originalRecalculate;
    return { installed: true, version: VERSION };
  }

  const api = Object.freeze({ VERSION, install, applyToState, inputFromState, capPoint });
  global.MaturityHardFusionV01 = api;
  if (global.EpistemicKernel) install();
})(typeof window !== 'undefined' ? window : globalThis);
