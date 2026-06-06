#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('../src/self-edit-loop-v0-1.js');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const REPORT_PATH = path.join(ARTIFACT_DIR, 'self-edit-loop-report-v0-1.json');
const SUMMARY_PATH = path.join(ARTIFACT_DIR, 'self-edit-loop-summary-v0-1.json');
const REACTIVE_REPORT_PATH = path.join(ARTIFACT_DIR, 'reactive-self-edit-report-v0-1.json');
const REACTIVE_SUMMARY_PATH = path.join(ARTIFACT_DIR, 'reactive-self-edit-summary-v0-1.json');
const REACTIVE_TEST_PATH = 'tests/meta-reactive-language-parser-v0-1-test.js';
const PARSER_PATH = 'src/language-parser-v0-1.js';

function readIfExists(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

function collectFiles() {
  const files = {};
  L.DEFAULT_MANIFEST.forEach(layer => {
    [layer.source, layer.test].forEach(relativePath => {
      const content = readIfExists(relativePath);
      if (content != null) files[relativePath] = content;
    });
  });

  [
    'README.md',
    'docs/language-standard-v0-1.md',
    'src/self-edit-loop-v0-1.js',
    'tests/self-edit-loop-v0-1-test.js',
    'tests/formal-math-v0-1-test.js'
  ].forEach(relativePath => {
    const content = readIfExists(relativePath);
    if (content != null) files[relativePath] = content;
  });

  return files;
}

function parserHas(files, needle) {
  return String(files[PARSER_PATH] || '').indexOf(needle) >= 0;
}

function reactiveGoal(files) {
  const stage1Closed = parserHas(files, 'solveLinearEquation') && parserHas(files, 'checkProofStep');
  if (!stage1Closed) {
    return {
      id: 'formal_math_reactive_self_growth_stage_1',
      closed_previous_goal: false,
      axes: [
        { id: 'parser_solve_linear_equation', file: PARSER_PATH, needle: 'solveLinearEquation', class: 'operator', w: 1 },
        { id: 'parser_proof_check_step', file: PARSER_PATH, needle: 'checkProofStep', class: 'operator', w: 1 }
      ]
    };
  }

  return {
    id: 'formal_math_reactive_self_growth_stage_2',
    closed_previous_goal: true,
    previous_goal: ['solveLinearEquation', 'checkProofStep'],
    axes: [
      { id: 'parser_solve_two_step_linear_equation', file: PARSER_PATH, needle: 'solveTwoStepLinearEquation', class: 'operator', w: 1 },
      { id: 'parser_check_hypothetical_syllogism', file: PARSER_PATH, needle: 'checkHypotheticalSyllogism', class: 'operator', w: 1 }
    ]
  };
}

function addReactivePressureTest(files, goal) {
  const next = Object.assign({}, files);
  const stage1 = [
    "const assert = require('assert');",
    "const P = require('../src/language-parser-v0-1.js');",
    "assert.strictEqual(P.VERSION, '0.1.0');",
    "assert.strictEqual(typeof P.solveLinearEquation, 'function');",
    "assert.strictEqual(P.solveLinearEquation('x + 1 = 3').value, 2);",
    "assert.strictEqual(typeof P.checkProofStep, 'function');",
    "assert.strictEqual(P.checkProofStep('if A => B and A, then B').ok, true);"
  ];

  const stage2 = [
    "assert.strictEqual(typeof P.solveTwoStepLinearEquation, 'function');",
    "assert.strictEqual(P.solveTwoStepLinearEquation('2x + 1 = 7').value, 3);",
    "assert.strictEqual(typeof P.checkHypotheticalSyllogism, 'function');",
    "assert.strictEqual(P.checkHypotheticalSyllogism('if A => B and B => C and A, then C').ok, true);"
  ];

  next[REACTIVE_TEST_PATH] = stage1.concat(goal.id.endsWith('stage_2') ? stage2 : []).join('\n') + '\n';
  return next;
}

function proposalPatchFor(meta) {
  return meta && meta.proposal && Array.isArray(meta.proposal.operations)
    ? meta.proposal.operations.find(op => op.path === PARSER_PATH)
    : null;
}

function makeReactiveReport(files) {
  const goal = reactiveGoal(files);
  const reactiveFiles = addReactivePressureTest(files, goal);
  const tests = [REACTIVE_TEST_PATH];
  const initial = L.reactiveState(reactiveFiles, goal, { tests });
  const meta = L.metaComplete(reactiveFiles, goal, { tests });
  const search = L.metaSearch(reactiveFiles, goal, { tests, variants: ['marker_only', 'synthesized_implementation'] });
  const parserPatch = proposalPatchFor(meta);

  const badMutation = L.reactiveMutate(initial, {
    id: 'report_bad_marker_mutation',
    operations: [{
      type: 'replace',
      path: PARSER_PATH,
      content: String(reactiveFiles[PARSER_PATH] || '') + '\n// report marker-only mutation\n'
    }]
  }, { tests });

  const goodMutation = parserPatch ? L.reactiveMutate(initial, {
    id: 'report_good_synthesized_mutation',
    operations: [parserPatch]
  }, { tests }) : null;

  const candidateDiff = parserPatch ? {
    path: parserPatch.path,
    type: parserPatch.type,
    before_bytes: String(reactiveFiles[parserPatch.path] || '').length,
    after_bytes: String(parserPatch.content || '').length,
    added_needles: goal.axes.filter(axis => String(parserPatch.content || '').indexOf(axis.needle) >= 0).map(axis => axis.needle),
    excerpt: String(parserPatch.content || '')
      .split('\n')
      .filter(line => goal.axes.some(axis => line.indexOf(axis.needle) >= 0) || /module\.exports/.test(line))
      .slice(0, 16)
  } : null;

  const report = {
    packet_type: '42ndMind_reactive_self_edit_report_v0_1',
    version: L.VERSION,
    generated_by: 'scripts/run-self-edit-loop-v0-1.js',
    goal,
    tests,
    initial_pressure: initial.pressure.scalar,
    meta_completion: {
      decision: meta.decision,
      improvement: meta.improvement,
      unit: meta.unit
    },
    closed_loop_search: {
      decision: search.decision,
      improvement: search.improvement,
      trace: search.trace,
      unit: search.unit
    },
    reactive_mutations: {
      rejected_attempt: {
        accepted: badMutation.accepted,
        reverted: badMutation.reverted,
        delta: badMutation.delta,
        causal: badMutation.causal
      },
      accepted_attempt: goodMutation ? {
        accepted: goodMutation.accepted,
        reverted: goodMutation.reverted,
        delta: goodMutation.delta,
        causal: goodMutation.causal,
        final_pressure: goodMutation.state.pressure.scalar,
        unit: goodMutation.state.unit
      } : null
    },
    candidate_diff: candidateDiff,
    proposed_virtual_source: parserPatch ? {
      path: parserPatch.path,
      content: parserPatch.content
    } : null,
    safe_to_propose: !!(goodMutation && goodMutation.accepted && goodMutation.delta < 0 && goodMutation.state.unit.ok),
    base_mutated: false,
    ξ: ''
  };

  const summary = {
    goal_id: goal.id,
    closed_previous_goal: goal.closed_previous_goal === true,
    safe_to_propose: report.safe_to_propose,
    initial_pressure: report.initial_pressure,
    accepted_delta: report.reactive_mutations.accepted_attempt ? report.reactive_mutations.accepted_attempt.delta : null,
    rejected_delta: report.reactive_mutations.rejected_attempt.delta,
    rejected_causal: report.reactive_mutations.rejected_attempt.causal,
    accepted_causal: report.reactive_mutations.accepted_attempt ? report.reactive_mutations.accepted_attempt.causal : null,
    search_decision: report.closed_loop_search.decision,
    search_trace: report.closed_loop_search.trace.map(row => ({ variant: row.variant, accepted: row.accepted, reverted: row.reverted, score: row.score, before_gaps: row.before_gaps, after_gaps: row.after_gaps })),
    candidate_path: candidateDiff ? candidateDiff.path : null,
    added_needles: candidateDiff ? candidateDiff.added_needles : [],
    report_artifact: path.relative(ROOT, REACTIVE_REPORT_PATH),
    summary_artifact: path.relative(ROOT, REACTIVE_SUMMARY_PATH)
  };

  return { report, summary };
}

function main() {
  const files = collectFiles();
  const rawInput = Object.keys(files).sort().map(key => '--- ' + key + '\n' + files[key]).join('\n');
  const report = L.run(files, {
    rawInput,
    tests: [],
    sandboxOptions: { allowDelete: false, maxPatchBytes: 5_000_000 }
  });

  const reactive = makeReactiveReport(files);

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(REACTIVE_REPORT_PATH, JSON.stringify(reactive.report, null, 2) + '\n');

  const summary = {
    accepted: report.accepted,
    decision: report.decision,
    gap_count: report.state.gaps.length,
    mathematical_gap_count: report.math_patch ? report.math_patch.gaps.length : null,
    operator_candidate_count: report.operator_synthesis && report.operator_synthesis.candidates ? report.operator_synthesis.candidates.length : 0,
    operator_decision: report.operator_synthesis ? report.operator_synthesis.decision : null,
    operations: report.proposal.operations.length,
    artifact: path.relative(ROOT, REPORT_PATH),
    summary_artifact: path.relative(ROOT, SUMMARY_PATH),
    reactive_artifact: path.relative(ROOT, REACTIVE_REPORT_PATH),
    reactive_summary_artifact: path.relative(ROOT, REACTIVE_SUMMARY_PATH),
    reactive_goal_id: reactive.summary.goal_id,
    reactive_closed_previous_goal: reactive.summary.closed_previous_goal,
    reactive_safe_to_propose: reactive.summary.safe_to_propose,
    reactive_initial_pressure: reactive.summary.initial_pressure,
    reactive_accepted_delta: reactive.summary.accepted_delta,
    truth_gate: report.truth_gate,
    changed_virtual_paths: report.sandbox_report.changed
  };

  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + '\n');
  fs.writeFileSync(REACTIVE_SUMMARY_PATH, JSON.stringify(reactive.summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) main();
