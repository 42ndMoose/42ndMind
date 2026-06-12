#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');
const G = require('../src/math-law-gate-v0-1.js');
const C = require('../src/math-law-cycle-core-v0-1.js');
const ROOT = path.resolve(__dirname, '..');
const paths = ['src/one-logic-math-v1.js','src/math-law-gate-v0-1.js','src/math-law-cycle-core-v0-1.js','src/live-self-dynamics-core-v0-1.js','src/math-language-kernel-v0-1.js','src/math-ast-core-v0-1.js','src/operator-anatomy-v0-1.js','src/proof-calculus-core-v0-1.js','src/math-closure-engine-v0-1.js','src/unified-self-simulation-core-v0-1.js','src/autonomous-brain-growth-core-v0-1.js','src/nested-brain-core-v0-1.js','src/one-logic-direction-contract-v0-1.js'];
const files = {};
paths.forEach(p => { const f = path.join(ROOT, p); if (fs.existsSync(f)) files[p] = fs.readFileSync(f, 'utf8'); });
let state = C.create(files, { math: M, gate: G });
const trace = [];
for (let i = 0; i < 8; i += 1) { const r = C.cycle(state, { math: M, gate: G }); state = r.state; trace.push({ i, ok: r.law_gate && r.law_gate.ok, score: r.score, moved: r.moved }); if (!r.law_gate || !r.law_gate.ok) break; }
const report = { ok: !!(state.law_gate && state.law_gate.ok), math_version: M.VERSION, gate_version: G.VERSION, cycles: trace.length, final_gate: state.law_gate, trace };
console.log(JSON.stringify(report, null, 2));
module.exports = { report };
