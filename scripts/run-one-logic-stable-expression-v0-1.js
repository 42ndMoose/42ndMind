#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const Live = require('../src/live-self-dynamics-core-v0-1.js');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const STATE_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-stable-state-v0-1.json');
const EXPRESSION_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-stable-expression-v0-1.json');
const SUMMARY_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-stable-expression-summary-v0-1.json');

const LIVE_SOURCE_PATHS = [
  'src/live-self-dynamics-core-v0-1.js',
  'src/math-language-kernel-v0-1.js',
  'src/math-ast-core-v0-1.js',
  'src/operator-anatomy-v0-1.js',
  'src/proof-calculus-core-v0-1.js',
  'src/math-closure-engine-v0-1.js',
  'src/unified-self-simulation-core-v0-1.js',
  'src/autonomous-brain-growth-core-v0-1.js',
  'src/nested-brain-core-v0-1.js',
  'src/one-logic-direction-contract-v0-1.js',
  'src/source-sandbox-v0-1.js',
  'src/source-edit-reality-feedback-v0-1.js',
  'src/truth-accounting-core-v0-1.js'
];

function readIfExists(relativePath) {
  const full = path.join(ROOT, relativePath);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

function collectLiveFiles() {
  const files = {};
  LIVE_SOURCE_PATHS.forEach(relativePath => {
    const content = readIfExists(relativePath);
    if (content != null) files[relativePath] = content;
  });
  return files;
}

function readPriorStableState() {
  if (!fs.existsSync(STATE_PATH)) return null;
  try {
    const packet = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    if (packet && packet.state && packet.state.files && packet.state.internal_state) return packet.state;
  } catch (_) {}
  return null;
}

function continueFromState(state, options) {
  const opts = options || {};
  let current = state;
  const cycles = [];
  const max = Math.max(1, Number(opts.max_iterations || 2));
  for (let i = 0; i < max; i += 1) {
    const cycle = Live.selfCycle(current, opts);
    cycles.push({ iteration: i, generated_count: cycle.generated_count, autonomous_generated_count: cycle.autonomous_generated_count, pressure_generated_count: cycle.pressure_generated_count, internal_growth: cycle.internal_growth, virtual_state_growth: cycle.virtual_state_growth, less_self_seen: cycle.less_self_seen, score: cycle.score, events: cycle.events });
    current = cycle.state;
  }
  return { packet_type: '42ndMind_live_self_dynamics_continuous_v0_1', version: Live.VERSION, ok: true, mode: 'one_logic_resumed_from_saved_stable_state', iterations: cycles.length, stop_reason: 'saved_state_continuation_budget_reached', final_state: current, final_score: current.score, final_files: current.files, source_promoted: false, human_patch_required_for_source_promotion: false, cycles, Ξ: '' };
}

function compactSummary(expression, run, startMode) {
  return {
    packet_type: '42ndMind_latest_one_logic_stable_expression_summary_v0_1',
    start_mode: startMode,
    scope: expression.scope,
    generation: expression.generation,
    t: expression.t,
    stable_score: expression.stable_score,
    pressure: expression.pressure,
    pressure_differentiation: expression.pressure_differentiation,
    objective_completion_status: expression.objective_completion_status,
    objective_reality_gate: expression.objective_reality_gate,
    octahedron_position: expression.octahedron_position,
    math_language_completion: expression.math_language_completion,
    stable_diff: expression.stable_diff,
    organ_unison_status: expression.organ_unison_status,
    next_self_generated_obstruction: expression.next_self_generated_obstruction,
    obstruction_stack: expression.obstruction_stack,
    expression: expression.expression,
    iterations_this_run: run.iterations,
    Ξ: ''
  };
}

function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const files = collectLiveFiles();
  const prior = readPriorStableState();
  const startMode = prior ? 'resume_saved_stable_state' : 'cold_start_from_source';
  const run = prior ? continueFromState(prior, { max_iterations: 2 }) : Live.autonomous(files, { max_iterations: 8 });
  const expression = Live.express(run, 'stable_math_language_reflection', {});
  const statePacket = {
    packet_type: '42ndMind_one_logic_reusable_stable_state_v0_1',
    start_mode: startMode,
    saved_at: new Date().toISOString(),
    generation: run.final_state.internal_state.generation,
    t: run.final_state.t,
    score: run.final_state.score,
    objective_completion_status: expression.objective_completion_status,
    state: run.final_state,
    expression_digest: {
      status: expression.expression,
      math_language_completion: expression.math_language_completion,
      objective_reality_gate: expression.objective_reality_gate,
      pressure_differentiation: expression.pressure_differentiation
    },
    Ξ: ''
  };
  fs.writeFileSync(STATE_PATH, JSON.stringify(statePacket, null, 2) + '\n');
  fs.writeFileSync(EXPRESSION_PATH, JSON.stringify(expression, null, 2) + '\n');
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(compactSummary(expression, run, startMode), null, 2) + '\n');
  console.log(JSON.stringify(compactSummary(expression, run, startMode), null, 2));
}

if (require.main === module) main();
