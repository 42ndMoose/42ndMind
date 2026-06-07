#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const W = require('../src/whole-self-simulation-core-v0-1.js');

const root = path.resolve(__dirname, '..');
const artifactsDir = path.join(root, 'artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const files = {
  'src/math-language-kernel-v0-1.js': read('src/math-language-kernel-v0-1.js'),
  'src/math-ast-core-v0-1.js': read('src/math-ast-core-v0-1.js'),
  'src/operator-anatomy-v0-1.js': read('src/operator-anatomy-v0-1.js'),
  'src/proof-calculus-core-v0-1.js': read('src/proof-calculus-core-v0-1.js'),
  'src/math-closure-engine-v0-1.js': read('src/math-closure-engine-v0-1.js')
};

const badTruthEdit = files['src/proof-calculus-core-v0-1.js'].replace(
  "if (op === '=') return Math.abs(left - right) <= EPS;",
  "if (op === '=') return true;"
);

const simulation = W.simulateCandidates(files, [
  {
    id: 'candidate_bad_truth_edit_equality_always_true',
    operations: [{ type: 'replace', path: 'src/proof-calculus-core-v0-1.js', content: badTruthEdit }]
  },
  {
    id: 'candidate_same_state',
    files
  }
]);

const summary = {
  packet_type: '42ndMind_whole_self_simulation_summary_v0_1',
  version: W.VERSION,
  decision: simulation.decision,
  stop: simulation.stop,
  best_id: simulation.best && simulation.best.id,
  best_score: simulation.best && simulation.best.score,
  best_damage_count: simulation.best && simulation.best.damage_count,
  best_feeling: simulation.best && simulation.best.feeling,
  base_score: simulation.base && simulation.base.score,
  base_damage_count: simulation.base && simulation.base.damage_count,
  candidates: (simulation.candidates || []).map(c => ({
    id: c.id,
    score: c.score,
    damage_count: c.damage_count,
    feeling: c.feeling,
    ok: c.ok,
    stop: c.stop
  })),
  math_anchors: simulation.best && simulation.best.math ? simulation.best.math.anchors.map(a => ({
    input: a.input,
    ok: a.ok,
    closure_operator: a.closure_operator,
    selected_rule: a.selected_rule,
    gap: a.gap
  })) : [],
  epistemic: simulation.best && simulation.best.epistemic ? {
    ok: simulation.best.epistemic.ok,
    score: simulation.best.epistemic.score,
    closed_gates: simulation.best.epistemic.gates && simulation.best.epistemic.gates.closed_gates || []
  } : null,
  truth: simulation.best && simulation.best.truth ? {
    ok: simulation.best.truth.ok,
    score: simulation.best.truth.score
  } : null,
  reality: simulation.best && simulation.best.reality ? {
    ok: simulation.best.reality.ok,
    score: simulation.best.reality.score,
    damage_count: simulation.best.reality.damage_count
  } : null,
  Ξ: ''
};

fs.writeFileSync(path.join(artifactsDir, 'whole-self-simulation-report-v0-1.json'), JSON.stringify(simulation, null, 2));
fs.writeFileSync(path.join(artifactsDir, 'whole-self-simulation-summary-v0-1.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
