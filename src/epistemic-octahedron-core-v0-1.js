(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindEpistemicOctahedronCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const PEAK = Object.freeze({ x: 0, y: 1, z: 0, label: 'objective_peak_philosophical_maturity' });
  const COLLAPSE = Object.freeze({ x: 0, y: -1, z: 0, label: 'epistemic_collapse' });
  const NULL_ORIGIN = Object.freeze({ x: 0, y: 0, z: 0, label: 'pre_philosophical_null_state' });

  function finite(n, fallback) {
    const x = Number(n);
    return Number.isFinite(x) ? x : fallback;
  }

  function R(value) {
    return Number((Number(value) || 0).toFixed(6));
  }

  function surfaceSum(point) {
    return Math.abs(finite(point && point.x, 0)) + Math.abs(finite(point && point.y, 0)) + Math.abs(finite(point && point.z, 0));
  }

  function projectToSurface(point) {
    const p = Object.assign({ x: 0, y: 0, z: 0 }, point || {});
    const sum = surfaceSum(p);
    if (sum === 0) return Object.assign({}, NULL_ORIGIN, { active: false, surface: false });
    return {
      x: R(p.x / sum),
      y: R(p.y / sum),
      z: R(p.z / sum),
      active: true,
      surface: true
    };
  }

  function peakDistance(point) {
    const p = projectToSurface(point);
    if (!p.active) return null;
    return R((Math.abs(p.x - PEAK.x) + Math.abs(p.y - PEAK.y) + Math.abs(p.z - PEAK.z)) / 2);
  }

  function gatesFromReactiveCycle(input) {
    const data = input || {};
    const good = data.goodMutation || null;
    const bad = data.badMutation || null;
    const search = data.search || {};
    const meta = data.meta || {};
    const parserPatch = data.parserPatch || null;
    const initial = data.initial || null;
    const finalPressure = good && good.state && good.state.pressure ? good.state.pressure.scalar : null;
    const initialPressure = initial && initial.pressure ? initial.pressure.scalar : null;
    const searchAccepted = search && search.decision && search.decision.code === 'propose_best_candidate';
    const metaAccepted = meta && meta.decision && meta.decision.code === 'propose_candidate_patch';
    const mutationAccepted = !!(good && good.accepted && good.delta < 0 && good.state && good.state.unit && good.state.unit.ok);
    return Object.freeze({
      coherence: !!(searchAccepted && metaAccepted && mutationAccepted),
      reality_contact: !!(good && good.state && good.state.unit && good.state.unit.ok),
      self_correction: !!(bad && bad.reverted === true && bad.accepted === false),
      anti_delusion: !!(searchAccepted === metaAccepted && (!metaAccepted || mutationAccepted)),
      integration: !!(Number.isFinite(Number(initialPressure)) && Number.isFinite(Number(finalPressure)) && Number(finalPressure) === 0 && Number(finalPressure) < Number(initialPressure)),
      scope_clarity: !!(parserPatch && parserPatch.path === 'src/language-parser-v0-1.js')
    });
  }

  function evaluateGates(gates) {
    const names = Object.keys(gates || {}).sort();
    const rows = names.map(name => ({ name, open: gates[name] === true }));
    const openCount = rows.filter(row => row.open).length;
    const closed = rows.filter(row => !row.open).map(row => row.name);
    const ratio = names.length ? openCount / names.length : 0;
    const point = closed.length === 0 ? PEAK : COLLAPSE;
    return {
      packet_type: '42ndMind_epistemic_octahedron_gate_state_v0_1',
      version: VERSION,
      ok: closed.length === 0,
      peak_attractor: closed.length === 0,
      plot_kind: 'kernel_governance_gate_state',
      point: Object.assign({}, point),
      peak_distance: closed.length === 0 ? 0 : 1,
      gate_open_ratio: R(ratio),
      gates: rows,
      closed_gates: closed,
      meaning: closed.length === 0
        ? 'candidate remains at the peak-governance attractor for this bounded kernel cycle'
        : 'candidate is rejected from the peak-governance attractor because one or more epistemic gates closed',
      ξ: ''
    };
  }

  function evaluateReactiveGate(input) {
    return evaluateGates(gatesFromReactiveCycle(input || {}));
  }

  function governanceSummary() {
    return {
      packet_type: '42ndMind_epistemic_octahedron_core_v0_1',
      version: VERSION,
      surface_equation: '|x| + |y| + |z| = 1 for active worldview positions',
      null_origin: Object.assign({}, NULL_ORIGIN),
      peak: Object.assign({}, PEAK),
      collapse: Object.assign({}, COLLAPSE),
      kernel_commitment: 'maintain peak-governance conditions by rejecting candidate state transitions that close coherence, reality-contact, self-correction, anti-delusion, integration, or scope-clarity gates',
      gates: ['coherence', 'reality_contact', 'self_correction', 'anti_delusion', 'integration', 'scope_clarity']
    };
  }

  return Object.freeze({
    VERSION,
    PEAK,
    COLLAPSE,
    NULL_ORIGIN,
    projectToSurface,
    peakDistance,
    gatesFromReactiveCycle,
    evaluateGates,
    evaluateReactiveGate,
    governanceSummary
  });
});
