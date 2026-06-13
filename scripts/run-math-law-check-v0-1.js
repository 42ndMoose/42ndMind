#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');
const P = require('../src/math-law-invariant-prover-v0-1.js');
const G = require('../src/math-law-gate-v0-1.js');
const C = require('../src/math-law-cycle-core-v0-1.js');
const ROOT = path.resolve(__dirname, '..');
const paths = ['src/one-logic-math-v1.js','src/math-law-invariant-prover-v0-1.js','src/math-law-gate-v0-1.js','src/math-law-cycle-core-v0-1.js','src/live-self-dynamics-core-v0-1.js','src/math-language-kernel-v0-1.js','src/math-ast-core-v0-1.js','src/operator-anatomy-v0-1.js','src/proof-calculus-core-v0-1.js','src/math-closure-engine-v0-1.js','src/unified-self-simulation-core-v0-1.js','src/autonomous-brain-growth-core-v0-1.js','src/nested-brain-core-v0-1.js','src/one-logic-direction-contract-v0-1.js'];
const files = {};
paths.forEach(p => { const f = path.join(ROOT, p); if (fs.existsSync(f)) files[p] = fs.readFileSync(f, 'utf8'); });
let state = C.create(files, { math: M, prover: P, gate: G });
const trace = [];
for (let i = 0; i < 8; i += 1) {
  const r = C.cycle(state, { math: M, prover: P, gate: G });
  state = r.state;
  const gate = r.law_gate || state.law_gate || {};
  trace.push({
    i,
    ok: !!gate.ok,
    blocked: !!gate.blocked,
    blocked_reason: gate.blocked_reason || null,
    admitted: gate.candidate_admitted,
    growth: gate.genuine_growth,
    changed: gate.changed,
    reduction_duplicates: gate.reduction && gate.reduction.duplicate_count || 0,
    score: r.score,
    moved: r.moved
  });
  if (!gate.ok) break;
}
const report = {
  ok: !!(state.law_gate && state.law_gate.ok),
  math_version: M.VERSION,
  prover_version: P.VERSION,
  gate_version: G.VERSION,
  cycle_version: C.VERSION,
  cycles: trace.length,
  final_gate: state.law_gate,
  final_invariant_report: state.invariant_report || state.law_gate && state.law_gate.invariant_report || null,
  trace
};
console.log(JSON.stringify(report, null, 2));
module.exports = { report };
