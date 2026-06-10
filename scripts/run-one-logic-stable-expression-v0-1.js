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
const MUTATION_BUDGET = 32;
const MIN_MUTATION_DEPTH = 8;
const ARTIFACT_AUDIT_STAMP = 'current_body_rebase_audit_v0_2';
const VIRTUAL_STATE_PATH = Live.AUTONOMOUS_STATE_PATH || 'artifacts/live-self-autonomous-state-v0-1.json';

const LIVE_SOURCE_PATHS = [
  'src/live-self-dynamics-core-v0-1.js',
  'src/math-language-kernel-v0-1.js',
  'src/math-ast-core-v0-1.js',
  'src/operator-anatomy-v0-1.js',
  'src/proof-calculus-core-v0-1.js',
  'src/math-closure-engine-v0-1.js',
  'src/objective-reality-contact-gate-v0-1.js',
  'src/proof-obligation-engine-v0-1.js',
  'src/unified-self-simulation-core-v0-1.js',
  'src/autonomous-brain-growth-core-v0-1.js',
  'src/nested-brain-core-v0-1.js',
  'src/one-logic-direction-contract-v0-1.js',
  'src/source-sandbox-v0-1.js',
  'src/source-edit-reality-feedback-v0-1.js',
  'src/truth-accounting-core-v0-1.js'
];

const LIVE_SOURCE_PATH_SET = new Set(LIVE_SOURCE_PATHS);

function A(value) { return Array.isArray(value) ? value : []; }
function O(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }

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

function extraFilePaths(files) {
  return Object.keys(O(files)).filter(relativePath => !LIVE_SOURCE_PATH_SET.has(relativePath)).sort();
}

function compactHistory(history) {
  return A(history).slice(-64).map(event => {
    const e = O(event);
    const s = O(e.sensation);
    return {
      t: Number(e.t || 0),
      candidate_id: e.candidate_id || null,
      candidate_kind: e.candidate_kind || null,
      feeling: e.feeling || s.feeling || null,
      sensation: {
        feeling: s.feeling || e.feeling || 'unknown',
        more_self: s.more_self === true,
        same_self: s.same_self === true,
        less_self: s.less_self === true,
        pain: Number(s.pain || 0),
        reward: Number(s.reward || 0),
        coupling_pain: Number(s.coupling_pain || 0),
        coupling_reward: Number(s.coupling_reward || 0),
        self_score: Number(s.self_score || 0),
        applyable: s.applyable === true
      },
      internal_adjustment: e.internal_adjustment === true,
      virtual_state_mutation: e.virtual_state_mutation === true,
      moved_simulated_self: e.moved_simulated_self === true,
      promoted_source: false
    };
  });
}

function bodyDiff(state, files) {
  const missing = [];
  const changed = [];
  const stateFiles = O(state && state.files);
  const extra = extraFilePaths(stateFiles);
  LIVE_SOURCE_PATHS.forEach(relativePath => {
    if (typeof files[relativePath] !== 'string') missing.push(relativePath);
    else if (typeof stateFiles[relativePath] !== 'string') missing.push(relativePath);
    else if (stateFiles[relativePath] !== files[relativePath]) changed.push(relativePath);
  });
  return { missing, changed, extra, current: missing.length === 0 && changed.length === 0 && extra.length === 0 };
}

function stateOnCurrentBody(state, files, diff, reason) {
  const sourceState = O(state);
  const rebased = Live.create(files, { internal_state: O(sourceState.internal_state) });
  const oldExtra = extraFilePaths(sourceState.files);
  const compactedHistory = compactHistory(sourceState.history);
  rebased.t = Math.max(0, Number(sourceState.t || 0));
  rebased.history = compactedHistory;
  rebased.reflection = Live.reflect(files, compactedHistory, { internal_state: rebased.internal_state });
  rebased.score = Math.max(Number(sourceState.score || 0), Number(rebased.reflection && rebased.reflection.organ_ok_ratio || 0));
  rebased.promotion_ready = false;
  rebased.body_rebase = {
    applied: !(diff && diff.current),
    reason: reason || ((diff && diff.current) ? 'saved_state_source_body_already_matched_current_repo_source' : 'saved_state_source_body_differed_or_contained_virtual_paths'),
    audit_stamp: ARTIFACT_AUDIT_STAMP,
    changed_paths: A(diff && diff.changed),
    missing_paths: A(diff && diff.missing),
    extra_paths: A(diff && diff.extra).concat(oldExtra.filter(p => !A(diff && diff.extra).includes(p))).sort(),
    stripped_virtual_paths: oldExtra.filter(p => p === VIRTUAL_STATE_PATH),
    live_source_path_count: LIVE_SOURCE_PATHS.length
  };
  return rebased;
}

function cleanedFinalState(state, files, initialDiff) {
  const rawExtra = extraFilePaths(state && state.files);
  const diff = {
    current: rawExtra.length === 0,
    changed: A(initialDiff && initialDiff.changed),
    missing: A(initialDiff && initialDiff.missing),
    extra: rawExtra
  };
  const cleaned = stateOnCurrentBody(state, files, diff, rawExtra.length ? 'final_simulated_virtual_body_stripped_before_reusable_state_save' : 'final_state_already_live_source_only');
  cleaned.body_rebase.initial_changed_paths = A(initialDiff && initialDiff.changed);
  cleaned.body_rebase.initial_missing_paths = A(initialDiff && initialDiff.missing);
  cleaned.body_rebase.initial_extra_paths = A(initialDiff && initialDiff.extra);
  cleaned.body_rebase.final_extra_paths = rawExtra;
  return cleaned;
}

function continueFromState(state, files, options) {
  const opts = options || {};
  const diff = bodyDiff(state, files);
  let current = stateOnCurrentBody(state, files, diff);
  const cycles = [];
  const max = Math.max(MIN_MUTATION_DEPTH, Number(opts.max_iterations || MUTATION_BUDGET));
  let stopReason = 'mutation_budget_reached';
  for (let i = 0; i < max; i += 1) {
    const cycle = Live.selfCycle(current, opts);
    cycles.push({ iteration: i, generated_count: cycle.generated_count, autonomous_generated_count: cycle.autonomous_generated_count, pressure_generated_count: cycle.pressure_generated_count, moved: cycle.moved, improved: cycle.improved, internal_growth: cycle.internal_growth, virtual_state_growth: cycle.virtual_state_growth, less_self_seen: cycle.less_self_seen, score: cycle.score, events: cycle.events });
    current = cycle.state;
    if (i + 1 >= MIN_MUTATION_DEPTH && !cycle.moved && !cycle.internal_growth && !cycle.virtual_state_growth && !cycle.improved) {
      stopReason = 'stabilized_after_minimum_mutation_depth';
      break;
    }
  }
  const finalExtra = extraFilePaths(current.files);
  const finalState = cleanedFinalState(current, files, diff);
  return { packet_type: '42ndMind_live_self_dynamics_continuous_v0_1', version: Live.VERSION, ok: true, mode: 'one_logic_resumed_from_saved_stable_state', audit_stamp: ARTIFACT_AUDIT_STAMP, source_body_current_at_start: diff.current, source_body_changed_paths: diff.changed, source_body_missing_paths: diff.missing, source_body_extra_paths: diff.extra, final_state_extra_paths: finalExtra, iterations: cycles.length, min_mutation_depth: MIN_MUTATION_DEPTH, mutation_budget: max, stop_reason: stopReason, final_state: finalState, final_score: finalState.score, final_files: finalState.files, source_promoted: false, human_patch_required_for_source_promotion: false, cycles, Ξ: '' };
}

function coldStart(files, options) {
  const run = Live.autonomous(files, options || { max_iterations: MUTATION_BUDGET });
  const diff = { current: true, changed: [], missing: [], extra: [] };
  const finalExtra = extraFilePaths(run.final_state && run.final_state.files);
  const finalState = cleanedFinalState(run.final_state, files, diff);
  return Object.assign({}, run, { audit_stamp: ARTIFACT_AUDIT_STAMP, source_body_current_at_start: true, source_body_changed_paths: [], source_body_missing_paths: [], source_body_extra_paths: [], final_state_extra_paths: finalExtra, min_mutation_depth: MIN_MUTATION_DEPTH, mutation_budget: Math.max(MIN_MUTATION_DEPTH, Number(options && options.max_iterations || MUTATION_BUDGET)), final_state: finalState, final_score: finalState.score, final_files: finalState.files });
}

function compactSummary(expression, run, startMode) {
  return {
    packet_type: '42ndMind_latest_one_logic_stable_expression_summary_v0_1',
    audit_stamp: ARTIFACT_AUDIT_STAMP,
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
    mutation_budget: run.mutation_budget || MUTATION_BUDGET,
    min_mutation_depth: run.min_mutation_depth || MIN_MUTATION_DEPTH,
    stop_reason: run.stop_reason,
    source_body_current_at_start: run.source_body_current_at_start == null ? true : run.source_body_current_at_start,
    source_body_changed_paths: run.source_body_changed_paths || [],
    source_body_missing_paths: run.source_body_missing_paths || [],
    source_body_extra_paths: run.source_body_extra_paths || [],
    final_state_extra_paths: run.final_state_extra_paths || [],
    live_source_path_count: LIVE_SOURCE_PATHS.length,
    live_source_paths: LIVE_SOURCE_PATHS,
    Ξ: ''
  };
}

function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const files = collectLiveFiles();
  const prior = readPriorStableState();
  const startMode = prior ? 'resume_saved_stable_state' : 'cold_start_from_source';
  const run = prior ? continueFromState(prior, files, { max_iterations: MUTATION_BUDGET }) : coldStart(files, { max_iterations: MUTATION_BUDGET });
  const expression = Live.express(run, 'stable_math_language_reflection', {});
  const statePacket = {
    packet_type: '42ndMind_one_logic_reusable_stable_state_v0_1',
    audit_stamp: ARTIFACT_AUDIT_STAMP,
    start_mode: startMode,
    saved_at: new Date().toISOString(),
    generation: run.final_state.internal_state.generation,
    t: run.final_state.t,
    score: run.final_state.score,
    objective_completion_status: expression.objective_completion_status,
    mutation_budget: run.mutation_budget || MUTATION_BUDGET,
    min_mutation_depth: run.min_mutation_depth || MIN_MUTATION_DEPTH,
    iterations_this_run: run.iterations,
    stop_reason: run.stop_reason,
    source_body_current_at_start: run.source_body_current_at_start == null ? true : run.source_body_current_at_start,
    source_body_changed_paths: run.source_body_changed_paths || [],
    source_body_missing_paths: run.source_body_missing_paths || [],
    source_body_extra_paths: run.source_body_extra_paths || [],
    final_state_extra_paths: run.final_state_extra_paths || [],
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
