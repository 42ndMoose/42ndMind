#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'src/live-self-dynamics-core-v0-1.js');
let src = fs.readFileSync(target, 'utf8');
if (src.includes('function objectiveLanguageRealityGate(')) {
  console.log('reality gate already present');
  process.exit(0);
}
src = src.replace(
  "let Unified = null, Language = null, Direction = null;\n  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }\n  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }\n  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }",
  "let Unified = null, Language = null, Direction = null, RealityGate = null;\n  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }\n  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }\n  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }\n  try { if (typeof require === 'function') RealityGate = require('./objective-reality-contact-gate-v0-1.js'); } catch (_) { RealityGate = null; }"
);
const anchor = "function stableDiff(run) { const cycles = A(run && run.cycles); const first = cycles[0] || {}; const last = cycles[cycles.length - 1] || {}; const final = run && run.final_state || run || {}; const internal = internalState(final.internal_state || {}); return { iterations: cycles.length, stop_reason: run && run.stop_reason || null, score_delta: R(Number(run && run.final_score || final.score || 0) - Number(first.score || 0)), generated_total: cycles.reduce((sum, c) => sum + Number(c.generated_count || 0), 0), autonomous_total: cycles.reduce((sum, c) => sum + Number(c.autonomous_generated_count || 0), 0), pressure_total: cycles.reduce((sum, c) => sum + Number(c.pressure_generated_count || 0), 0), internal_growth_ticks: cycles.filter(c => c.internal_growth).length, virtual_growth_ticks: cycles.filter(c => c.virtual_state_growth).length, less_self_ticks: cycles.filter(c => c.less_self_seen).length, final_generation: internal.generation, final_symbols: internal.symbols.length, final_relations: internal.relations.length, final_virtual_edits: internal.final_virtual_edits || internal.virtual_edits.length, last_cycle: last }; }";
const fallbackAnchor = "function stableDiff(run) { const cycles = A(run && run.cycles); const first = cycles[0] || {}; const last = cycles[cycles.length - 1] || {}; const final = run && run.final_state || run || {}; const internal = internalState(final.internal_state || {}); return { iterations: cycles.length, stop_reason: run && run.stop_reason || null, score_delta: R(Number(run && run.final_score || final.score || 0) - Number(first.score || 0)), generated_total: cycles.reduce((sum, c) => sum + Number(c.generated_count || 0), 0), autonomous_total: cycles.reduce((sum, c) => sum + Number(c.autonomous_generated_count || 0), 0), pressure_total: cycles.reduce((sum, c) => sum + Number(c.pressure_generated_count || 0), 0), internal_growth_ticks: cycles.filter(c => c.internal_growth).length, virtual_growth_ticks: cycles.filter(c => c.virtual_state_growth).length, less_self_ticks: cycles.filter(c => c.less_self_seen).length, final_generation: internal.generation, final_symbols: internal.symbols.length, final_relations: internal.relations.length, final_virtual_edits: internal.virtual_edits.length, last_cycle: last }; }";
const realAnchor = src.includes(anchor) ? anchor : fallbackAnchor;
const gate = `

  function objectiveRealityCases() {
    return RealityGate && typeof RealityGate.defaultCases === 'function' ? RealityGate.defaultCases() : [];
  }

  function objectiveLanguageRealityGate(live, options) {
    const cases = A(options && options.reality_cases).length ? A(options.reality_cases) : objectiveRealityCases();
    if (!RealityGate || typeof RealityGate.run !== 'function') return { packet_type: '42ndMind_objective_reality_contact_gate_v0_1', ok: false, complete: false, status: 'adversarial_reality_gate_unavailable', score: 0, pass_count: 0, case_count: cases.length, failures: cases, cases: [], empty_text: '' };
    const report = RealityGate.run(cases);
    return Object.assign({}, report, { complete: report.ok === true, status: report.ok === true ? 'adversarial_reality_contact_passed' : 'adversarial_reality_contact_failed' });
  }`;
if (!src.includes(realAnchor)) throw new Error('stableDiff anchor not found');
src = src.replace(realAnchor, gate + '\n\n  ' + realAnchor);
src = src.replace(
  "const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const oct = octahedronPosition(state);",
  "const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const realityGate = objectiveLanguageRealityGate(state, options || {}); const oct = octahedronPosition(state);"
);
src = src.replace(
  "stable_score: state.score, pressure: pressureOf(reflection), pressure_differentiation: pressureDiff, octahedron_position: oct,",
  "stable_score: state.score, pressure: pressureOf(reflection), pressure_differentiation: pressureDiff, objective_reality_gate: realityGate, objective_completion_status: math.status === 'provisionally_complete' && realityGate.complete ? 'adversarially_contacted_minimum_core' : math.status === 'provisionally_complete' ? 'internally_complete_reality_incomplete' : 'internally_incomplete', octahedron_position: oct,"
);
src = src.replace(
  "octahedronPosition, differentiatePressureByConsequence, mathLanguageCompletion, express, stableExpression",
  "octahedronPosition, differentiatePressureByConsequence, objectiveRealityCases, objectiveLanguageRealityGate, mathLanguageCompletion, express, stableExpression"
);
fs.writeFileSync(target, src);
console.log('applied adversarial live self reality gate');
