#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'src/live-self-dynamics-core-v0-1.js');
let src = fs.readFileSync(target, 'utf8');

function replaceImportBlock() {
  src = src.replace(
    "let Unified = null, Language = null, Direction = null, MathKernel = null;\n  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }\n  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }\n  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }\n  try { if (typeof require === 'function') MathKernel = require('./math-language-kernel-v0-1.js'); } catch (_) { MathKernel = null; }",
    "let Unified = null, Language = null, Direction = null, RealityGate = null;\n  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }\n  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }\n  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }\n  try { if (typeof require === 'function') RealityGate = require('./objective-reality-contact-gate-v0-1.js'); } catch (_) { RealityGate = null; }"
  );
  src = src.replace(
    "let Unified = null, Language = null, Direction = null;\n  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }\n  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }\n  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }",
    "let Unified = null, Language = null, Direction = null, RealityGate = null;\n  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }\n  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }\n  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }\n  try { if (typeof require === 'function') RealityGate = require('./objective-reality-contact-gate-v0-1.js'); } catch (_) { RealityGate = null; }"
  );
}

const gate = `

  function objectiveRealityCases() {
    return RealityGate && typeof RealityGate.defaultCases === 'function' ? RealityGate.defaultCases() : [];
  }

  function objectiveLanguageRealityGate(live, options) {
    const cases = A(options && options.reality_cases).length ? A(options.reality_cases) : objectiveRealityCases();
    if (!RealityGate || typeof RealityGate.run !== 'function') return { packet_type: '42ndMind_objective_reality_contact_gate_v0_1', ok: false, complete: false, status: 'adversarial_reality_gate_unavailable', score: 0, pass_count: 0, case_count: cases.length, failures: cases, cases: [], verdict_classes: [], rule_sources: [], empty_text: '' };
    const report = RealityGate.run(cases);
    return Object.assign({}, report, { packet_type: '42ndMind_objective_language_reality_gate_v0_1', complete: report.ok === true, status: report.ok === true ? 'adversarial_reality_contact_passed' : 'adversarial_reality_contact_failed' });
  }`;

replaceImportBlock();

const start = src.indexOf('\n  function objectiveRealityCases() {');
const end = start >= 0 ? src.indexOf('\n\n  function stableDiff', start) : -1;
if (start >= 0 && end > start) {
  src = src.slice(0, start) + gate + src.slice(end);
} else {
  const stableStart = src.indexOf('\n  function stableDiff');
  if (stableStart < 0) throw new Error('stableDiff anchor not found');
  src = src.slice(0, stableStart) + gate + '\n' + src.slice(stableStart);
}

src = src.replace(
  "const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const oct = octahedronPosition(state);",
  "const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const realityGate = objectiveLanguageRealityGate(state, options || {}); const oct = octahedronPosition(state);"
);
src = src.replace(
  "objective_completion_status: math.status === 'provisionally_complete' && realityGate.complete ? 'externally_contacted_minimum_core' : math.status === 'provisionally_complete' ? 'internally_complete_reality_incomplete' : 'internally_incomplete'",
  "objective_completion_status: math.status === 'provisionally_complete' && realityGate.complete ? 'adversarially_contacted_minimum_core' : math.status === 'provisionally_complete' ? 'internally_complete_reality_incomplete' : 'internally_incomplete'"
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
console.log('applied or upgraded adversarial live self reality gate');
