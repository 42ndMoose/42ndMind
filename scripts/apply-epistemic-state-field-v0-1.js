#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/epistemic-octahedron-core-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('function clamp01(value)')) {
  const marker = '  function governanceSummary() {';
  if (!s.includes(marker)) throw new Error('governanceSummary marker not found');
  const block = String.raw`  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    if (n < 0) return 0;
    if (n > 1) return 1;
    return n;
  }

  function mean(values) {
    const xs = (Array.isArray(values) ? values : []).map(Number).filter(Number.isFinite);
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  }

  function pointFromField(field) {
    const f = Object.assign({}, field || {});
    const coherence = clamp01(f.coherence);
    const reality = clamp01(f.reality_contact);
    const correction = clamp01(f.self_correction);
    const antiDelusion = clamp01(f.anti_delusion);
    const integration = clamp01(f.integration);
    const closure = clamp01(f.closure);
    const stability = mean([coherence, reality, correction, antiDelusion, integration, closure]);
    const y = R((stability * 2) - 1);
    const lateralScale = R(1 - stability);
    const x = R((reality - correction) * lateralScale);
    const z = R(((coherence + antiDelusion) / 2 - integration) * lateralScale);
    return projectToSurface({ x, y, z });
  }

  function transitionComponents(input) {
    const data = input || {};
    const good = data.goodMutation || null;
    const bad = data.badMutation || null;
    const search = data.search || {};
    const meta = data.meta || {};
    const parserPatch = data.parserPatch || null;
    const initial = data.initial || null;
    const initialPressure = Number(initial && initial.pressure ? initial.pressure.scalar : 0);
    const finalPressure = Number(good && good.state && good.state.pressure ? good.state.pressure.scalar : initialPressure);
    const maxPressure = Math.max(1, Math.abs(initialPressure), Math.abs(finalPressure));
    const beforeClosure = clamp01(1 - (Math.max(0, initialPressure) / maxPressure));
    const afterClosure = clamp01(1 - (Math.max(0, finalPressure) / maxPressure));
    const searchAccepted = search && search.decision && search.decision.code === 'propose_best_candidate';
    const metaAccepted = meta && meta.decision && meta.decision.code === 'propose_candidate_patch';
    const mutationAccepted = !!(good && good.accepted && good.delta < 0 && good.state && good.state.unit && good.state.unit.ok);
    const fakeRejected = !!(bad && bad.reverted === true && bad.accepted === false);
    const unitOk = !!(good && good.state && good.state.unit && good.state.unit.ok);
    const agreement = searchAccepted === metaAccepted && (!metaAccepted || mutationAccepted);
    const scope = !!(parserPatch && parserPatch.path === 'src/language-parser-v0-1.js');
    const before = {
      coherence: clamp01(initial && initial.unit && initial.unit.ok ? 0.5 : 0),
      reality_contact: clamp01(initial && initial.unit && initial.unit.ok ? 0.5 : 0),
      self_correction: 0.5,
      anti_delusion: 0.5,
      integration: beforeClosure,
      closure: beforeClosure
    };
    const after = {
      coherence: searchAccepted && metaAccepted && mutationAccepted ? 1 : 0,
      reality_contact: unitOk ? 1 : 0,
      self_correction: fakeRejected ? 1 : 0,
      anti_delusion: agreement ? 1 : 0,
      integration: finalPressure === 0 && finalPressure < initialPressure ? 1 : 0,
      scope_clarity: scope ? 1 : 0,
      closure: afterClosure
    };
    return { before, after, initial_pressure: initialPressure, final_pressure: finalPressure };
  }

  function evaluateTransitionField(input) {
    const components = transitionComponents(input || {});
    const beforePoint = pointFromField(components.before);
    const afterPoint = pointFromField(components.after);
    const beforeDistance = peakDistance(beforePoint);
    const afterDistance = peakDistance(afterPoint);
    const deltaPeakDistance = beforeDistance == null || afterDistance == null ? null : R(beforeDistance - afterDistance);
    const delta = {};
    Object.keys(Object.assign({}, components.before, components.after)).sort().forEach(key => {
      delta[key] = R(clamp01(components.after[key]) - clamp01(components.before[key]));
    });
    const capabilityImproves = Number.isFinite(components.initial_pressure) && Number.isFinite(components.final_pressure) && components.final_pressure < components.initial_pressure;
    const peakPreserved = deltaPeakDistance == null ? false : deltaPeakDistance >= 0;
    const accept = !!(capabilityImproves && peakPreserved && afterDistance === 0);
    return {
      packet_type: '42ndMind_epistemic_octahedron_transition_field_v0_1',
      version: VERSION,
      plot_kind: 'kernel_state_transition_proxy',
      before: { components: components.before, point: beforePoint, peak_distance: beforeDistance },
      after: { components: components.after, point: afterPoint, peak_distance: afterDistance },
      delta_components: delta,
      delta_peak_distance: deltaPeakDistance,
      pressure: { before: components.initial_pressure, after: components.final_pressure, delta: R(components.final_pressure - components.initial_pressure) },
      preference: {
        capability_improves: capabilityImproves,
        peak_distance_preserved_or_improved: peakPreserved,
        accept,
        reason: accept ? 'capability improved while transition moved to the peak-governance proxy' : 'transition did not both improve capability and preserve/reach the peak-governance proxy'
      },
      ξ: ''
    };
  }

`;
  s = s.replace(marker, block + marker);
}

if (!s.includes('evaluateTransitionField,')) {
  s = s.replace('    evaluateReactiveGate,\n    governanceSummary', '    evaluateReactiveGate,\n    evaluateTransitionField,\n    governanceSummary');
}

if (!s.includes("state_transition: 'evaluateTransitionField")) {
  s = s.replace("      gates: ['coherence', 'reality_contact', 'self_correction', 'anti_delusion', 'integration', 'scope_clarity']", "      gates: ['coherence', 'reality_contact', 'self_correction', 'anti_delusion', 'integration', 'scope_clarity'],\n      state_transition: 'evaluateTransitionField computes before/after components, octahedral proxy points, delta peak distance, and capability pressure delta'");
}

fs.writeFileSync(path, s);
console.log('epistemic state field applied');
