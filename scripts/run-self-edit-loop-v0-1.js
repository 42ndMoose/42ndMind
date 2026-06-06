#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('../src/self-edit-loop-v0-1.js');
const OA = require('../src/operator-anatomy-v0-1.js');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const REPORT_PATH = path.join(ARTIFACT_DIR, 'self-edit-loop-report-v0-1.json');
const SUMMARY_PATH = path.join(ARTIFACT_DIR, 'self-edit-loop-summary-v0-1.json');
const REACTIVE_REPORT_PATH = path.join(ARTIFACT_DIR, 'reactive-self-edit-report-v0-1.json');
const REACTIVE_SUMMARY_PATH = path.join(ARTIFACT_DIR, 'reactive-self-edit-summary-v0-1.json');
const REACTIVE_TEST_PATH = 'tests/meta-reactive-language-parser-v0-1-test.js';
const PARSER_PATH = 'src/language-parser-v0-1.js';

const BASE_FRONTIER = Object.freeze([
  {
    id: 'formal_math_reactive_self_growth_frontier_linear_and_mp',
    source: 'fixed_frontier',
    requires: [],
    axes: [
      { id: 'parser_solve_linear_equation', file: PARSER_PATH, needle: 'solveLinearEquation', class: 'operator', w: 1 },
      { id: 'parser_proof_check_step', file: PARSER_PATH, needle: 'checkProofStep', class: 'operator', w: 1 }
    ],
    assertions: [
      "assert.strictEqual(typeof P.solveLinearEquation, 'function');",
      "assert.strictEqual(P.solveLinearEquation('x + 1 = 3').value, 2);",
      "assert.strictEqual(typeof P.checkProofStep, 'function');",
      "assert.strictEqual(P.checkProofStep('if A => B and A, then B').ok, true);"
    ]
  },
  {
    id: 'formal_math_reactive_self_growth_frontier_two_step_and_chain',
    source: 'fixed_frontier',
    requires: ['solveLinearEquation', 'checkProofStep'],
    axes: [
      { id: 'parser_solve_two_step_linear_equation', file: PARSER_PATH, needle: 'solveTwoStepLinearEquation', class: 'operator', w: 1 },
      { id: 'parser_check_hypothetical_syllogism', file: PARSER_PATH, needle: 'checkHypotheticalSyllogism', class: 'operator', w: 1 }
    ],
    assertions: [
      "assert.strictEqual(typeof P.solveTwoStepLinearEquation, 'function');",
      "assert.strictEqual(P.solveTwoStepLinearEquation('2x + 1 = 7').value, 3);",
      "assert.strictEqual(typeof P.checkHypotheticalSyllogism, 'function');",
      "assert.strictEqual(P.checkHypotheticalSyllogism('if A => B and B => C and A, then C').ok, true);"
    ]
  }
]);

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
    'src/operator-anatomy-v0-1.js',
    'tests/self-edit-loop-v0-1-test.js',
    'tests/formal-math-v0-1-test.js'
  ].forEach(relativePath => {
    const content = readIfExists(relativePath);
    if (content != null) files[relativePath] = content;
  });

  return files;
}

function parserSource(files) {
  return String(files[PARSER_PATH] || '');
}

function parserHas(files, needle) {
  return parserSource(files).indexOf(needle) >= 0;
}

function parserSupportsSquareNonnegativeTheorem(files) {
  const source = parserSource(files);
  return source.indexOf('compileMath') >= 0 &&
    source.indexOf('square') >= 0 &&
    (source.indexOf('>=') >= 0 || source.indexOf('≥') >= 0) &&
    /\^2|²/.test(source);
}

function parserSupportsDivisionConstraint(files) {
  const source = parserSource(files);
  return source.indexOf('compileMath') >= 0 &&
    source.indexOf('undefined-when') >= 0 &&
    source.indexOf('/') >= 0;
}

function parserSupportsLinearRelation(files) {
  const source = parserSource(files);
  return source.indexOf('compileMath') >= 0 &&
    source.indexOf("mode: 'relation'") >= 0 &&
    source.indexOf('relationSymbol') >= 0;
}

function addClosureGap(gaps, files, capability) {
  if (!capability || parserHas(files, capability.needle)) return;
  gaps.push(capability);
}

function operatorAnatomyFrontier(files) {
  if (!OA || typeof OA.frontierNode !== 'function') return [];
  const node = OA.frontierNode(parserSource(files), { file: PARSER_PATH });
  return node ? [node] : [];
}

function generatedClosureFrontier(files) {
  const gaps = [];
  if (parserSupportsSquareNonnegativeTheorem(files)) {
    addClosureGap(gaps, files, {
      id: 'parser_prove_square_nonnegative',
      needle: 'proveSquareNonnegative',
      parsed_form: '∀x ∈ ℝ, x^2 >= 0',
      reason: 'compileMath recognizes square/nonnegative theorem forms but the parser lacks an executable closure operator for that theorem class.',
      assertion: "assert.strictEqual(P.proveSquareNonnegative('∀x ∈ ℝ, x^2 >= 0').ok, true);"
    });
  }
  if (parserSupportsDivisionConstraint(files)) {
    addClosureGap(gaps, files, {
      id: 'parser_prove_division_by_zero_undefined',
      needle: 'proveDivisionByZeroUndefined',
      parsed_form: 'x/y is undefined when y = 0',
      reason: 'compileMath recognizes division-by-zero undefined constraints but the parser lacks an executable closure operator for that constraint class.',
      assertion: "assert.strictEqual(P.proveDivisionByZeroUndefined('x/y is undefined when y = 0').ok, true);"
    });
  }
  if (parserSupportsLinearRelation(files)) {
    addClosureGap(gaps, files, {
      id: 'parser_evaluate_linear_relation',
      needle: 'evaluateLinearRelation',
      parsed_form: 'x >= 3 with x = 5',
      reason: 'compileMath recognizes linear relation forms but the parser lacks an executable evaluator for relation truth under assignment.',
      assertion: "assert.strictEqual(P.evaluateLinearRelation({ relation: 'x >= 3', value: 5 }).truth, true);"
    });
  }
  addClosureGap(gaps, files, {
    id: 'parser_classify_math_statement',
    needle: 'classifyMathStatement',
    parsed_form: 'compileMath packet classification',
    reason: 'The parser has multiple math statement modes but lacks a unified classifier that maps parsed forms to expected closure operators.',
    assertion: "assert.strictEqual(P.classifyMathStatement('∀x ∈ ℝ, x^2 >= 0').closure, 'proveSquareNonnegative');"
  });

  if (!gaps.length) return [];
  return [{
    id: 'formal_math_generated_closure_batch_' + gaps.map(g => g.needle).join('_'),
    source: 'generated_closure_failure',
    generated_from: {
      parsed_forms: gaps.map(g => g.parsed_form),
      reason: 'Parser semantic surface contains parseable math/proof forms whose implied closure operators are missing.',
      missing_operators: gaps.map(g => g.needle)
    },
    requires: ['solveLinearEquation', 'checkProofStep', 'solveTwoStepLinearEquation', 'checkHypotheticalSyllogism'],
    axes: gaps.map(g => ({ id: g.id, file: PARSER_PATH, needle: g.needle, class: 'closure_operator', w: 1 })),
    assertions: gaps.reduce((rows, g) => rows.concat(["assert.strictEqual(typeof P." + g.needle + ", 'function');", g.assertion]), [])
  }];
}

function activeFrontier(files) {
  const anatomy = operatorAnatomyFrontier(files);
  return BASE_FRONTIER.concat(anatomy.length ? anatomy : generatedClosureFrontier(files));
}

function frontierStatus(files) {
  const frontier = activeFrontier(files);
  const statuses = frontier.map((node, index) => {
    const requirements_met = node.requires.every(needle => parserHas(files, needle));
    const missing = node.axes.filter(axis => !parserHas(files, axis.needle)).map(axis => axis.needle);
    const closed = missing.length === 0;
    const unlocked = requirements_met;
    return {
      index,
      id: node.id,
      source: node.source || 'unknown',
      generated_from: node.generated_from || null,
      unlocked,
      closed,
      requirements_met,
      requires: node.requires.slice(),
      missing,
      axes: node.axes.map(axis => Object.assign({}, axis))
    };
  });
  const selected = statuses.find(row => row.unlocked && !row.closed) || null;
  return {
    packet_type: '42ndMind_capability_frontier_v0_1',
    version: L.VERSION,
    selected_id: selected ? selected.id : null,
    selected_source: selected ? selected.source : null,
    exhausted: selected == null,
    generated_count: statuses.filter(row => row.source === 'generated_closure_failure').length,
    statuses,
    ξ: ''
  };
}

function reactiveGoal(files) {
  const frontier = frontierStatus(files);
  const selected = frontier.statuses.find(row => row.id === frontier.selected_id);
  if (!selected) {
    return {
      id: 'formal_math_reactive_self_growth_frontier_exhausted',
      frontier,
      closed_previous_goal: true,
      axes: []
    };
  }
  return {
    id: selected.id,
    frontier,
    selected_frontier: selected,
    generated_from: selected.generated_from || null,
    closed_previous_goal: frontier.statuses.some(row => row.index < selected.index && row.closed),
    axes: selected.axes
  };
}

function addReactivePressureTest(files, goal) {
  const next = Object.assign({}, files);
  const base = [
    "const assert = require('assert');",
    "const P = require('../src/language-parser-v0-1.js');",
    "assert.strictEqual(P.VERSION, '0.1.0');"
  ];
  const selected = goal && goal.selected_frontier;
  const frontier = activeFrontier(files);
  const assertions = selected
    ? frontier[selected.index].requires.map(needle => "assert.strictEqual(typeof P." + needle + ", 'function');").concat(frontier[selected.index].assertions)
    : ["assert.ok(true);"];
  next[REACTIVE_TEST_PATH] = base.concat(assertions).join('\n') + '\n';
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

  const searchAccepted = search && search.decision && search.decision.code === 'propose_best_candidate';
  const metaAccepted = meta && meta.decision && meta.decision.code === 'propose_candidate_patch';
  const mutationAccepted = !!(goodMutation && goodMutation.accepted && goodMutation.delta < 0 && goodMutation.state.unit.ok);
  const safeToPropose = !!(searchAccepted && metaAccepted && mutationAccepted);

  const report = {
    packet_type: '42ndMind_reactive_self_edit_report_v0_1',
    version: L.VERSION,
    generated_by: 'scripts/run-self-edit-loop-v0-1.js',
    goal,
    frontier: goal.frontier,
    operator_anatomy_pressure: OA && typeof OA.pressure === 'function' ? OA.pressure(parserSource(files), { file: PARSER_PATH }) : null,
    generated_from: goal.generated_from || null,
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
    safe_to_propose: safeToPropose,
    report_consistency: {
      search_accepted: searchAccepted,
      meta_accepted: metaAccepted,
      mutation_accepted: mutationAccepted,
      ok: safeToPropose
    },
    base_mutated: false,
    ξ: ''
  };

  const summary = {
    goal_id: goal.id,
    generated_from: goal.generated_from || null,
    frontier_selected_id: goal.frontier ? goal.frontier.selected_id : null,
    frontier_selected_source: goal.frontier ? goal.frontier.selected_source : null,
    frontier_exhausted: goal.frontier ? goal.frontier.exhausted : false,
    frontier_generated_count: goal.frontier ? goal.frontier.generated_count : 0,
    frontier_statuses: goal.frontier ? goal.frontier.statuses.map(row => ({ id: row.id, source: row.source, unlocked: row.unlocked, closed: row.closed, missing: row.missing, generated_from: row.generated_from })) : [],
    closed_previous_goal: goal.closed_previous_goal === true,
    safe_to_propose: report.safe_to_propose,
    initial_pressure: report.initial_pressure,
    accepted_delta: report.reactive_mutations.accepted_attempt ? report.reactive_mutations.accepted_attempt.delta : null,
    rejected_delta: report.reactive_mutations.rejected_attempt.delta,
    rejected_causal: report.reactive_mutations.rejected_attempt.causal,
    accepted_causal: report.reactive_mutations.accepted_attempt ? report.reactive_mutations.accepted_attempt.causal : null,
    search_decision: report.closed_loop_search.decision,
    report_consistency: report.report_consistency,
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
    reactive_frontier_selected_id: reactive.summary.frontier_selected_id,
    reactive_frontier_selected_source: reactive.summary.frontier_selected_source,
    reactive_frontier_exhausted: reactive.summary.frontier_exhausted,
    reactive_frontier_generated_count: reactive.summary.frontier_generated_count,
    operator_anatomy_pressure: reactive.report.operator_anatomy_pressure,
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
