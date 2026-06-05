const assert = require('assert');
const L = require('../src/self-edit-loop-v0-1.js');
const M = require('../src/mathematical-patch-proposer-v0-1.js');

const rows = [];
function ok(name, condition, detail) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, detail || name);
}

function moduleSource(needles) {
  const unique = Array.from(new Set((needles || ['ok']).map(String)));
  const markers = unique.map(needle => '// marker: ' + needle).join('\n');
  return "module.exports = { VERSION: '0.1.0' };\n" + markers + "\n";
}

function moduleTest(sourcePath) {
  if (sourcePath.endsWith('.json')) return "const assert = require('assert'); assert.ok(true);";
  return "const assert = require('assert'); const M = require('../" + sourcePath + "'); assert.strictEqual(M.VERSION, '0.1.0');";
}

function completeFixtureJsonFor(path) {
  const needles = M.REQUIRED_AXES.filter(axis => axis.file === path).map(axis => axis.needle);
  const data = { validPackets: [], invalidPackets: [], markers: needles };
  return JSON.stringify(data);
}

function buildCompleteFiles() {
  const files = {};
  const needlesByFile = {};
  M.REQUIRED_AXES.forEach(axis => {
    if (!needlesByFile[axis.file]) needlesByFile[axis.file] = [];
    needlesByFile[axis.file].push(axis.needle);
  });

  L.DEFAULT_MANIFEST.forEach(layer => {
    const needles = needlesByFile[layer.source] || ['ok'];
    files[layer.source] = layer.source.endsWith('.json') ? completeFixtureJsonFor(layer.source) : moduleSource(needles);
    files[layer.test] = moduleTest(layer.source);
  });
  return files;
}

function reportDetail(report) {
  return JSON.stringify({
    accepted: report.accepted,
    decision: report.decision,
    truth_gate: report.truth_gate,
    chaos: report.sandbox_report && report.sandbox_report.chaos,
    tests: report.sandbox_report && report.sandbox_report.tests,
    validators: report.sandbox_report && report.sandbox_report.validators,
    error: report.sandbox_report && report.sandbox_report.error,
    changed: report.sandbox_report && report.sandbox_report.changed,
    proposal: report.proposal && report.proposal.operations && report.proposal.operations.map(op => ({ type: op.type, path: op.path }))
  }, null, 2);
}

function executeCommonJs(source) {
  const module = { exports: {} };
  const fn = new Function('module', 'exports', source);
  fn(module, module.exports);
  return module.exports;
}

const completeFiles = buildCompleteFiles();

ok('self-edit loop loads', L.VERSION === '0.1.0');
const completeState = L.wholeState(completeFiles, 'abababab cdcdcdcd');
ok('whole language state is unit-total', completeState.unit.ok === true);
ok('complete files have no manifest gaps', completeState.gaps.length === 0);
ok('complete files have no mathematical gaps', completeState.math_patch.gaps.length === 0);
ok('whole language fields are unit-total', ['Λ', 'Γ', 'Π', 'ΩL'].every(key => Math.abs(L.l1(completeState.fields[key]) - 1) < 1e-6));

const completeReport = L.run(completeFiles, { rawInput: 'abababab cdcdcdcd', tests: [] });
ok('complete run accepted artifact-only proposal', completeReport.accepted === true, reportDetail(completeReport));
ok('complete run exports self-edit artifact in virtual source', !!completeReport.virtual_summary['artifacts/self-edit-state-v0-1.json']);
ok('complete run exports mathematical patch artifact in virtual source', !!completeReport.virtual_summary['artifacts/mathematical-patch-v0-1.json']);
ok('complete run includes mathematical patch packet', completeReport.math_patch.packet_type === '42ndMind_mathematical_patch_v0_1');
ok('complete run keeps English empty', completeReport.ξ === '');

const missingFiles = Object.assign({}, completeFiles);
delete missingFiles['src/truth-accounting-core-v0-1.js'];
delete missingFiles['tests/truth-accounting-core-v0-1-test.js'];

const missingState = L.wholeState(missingFiles, 'abababab cdcdcdcd');
ok('missing files produce manifest gaps', missingState.gaps.length === 2);
ok('missing files produce mathematical gaps', missingState.math_patch.gaps.length >= 1);
const missingReport = L.run(missingFiles, { rawInput: 'abababab cdcdcdcd', tests: [] });
ok('missing run proposes mathematical operations', missingReport.math_patch.proposal.operations.length > 0);
ok('missing run proposes gap-filling operations', missingReport.proposal.operations.some(op => op.path === 'src/truth-accounting-core-v0-1.js'));
ok('missing run accepted virtual scaffold proposal', missingReport.accepted === true, reportDetail(missingReport));
ok('missing run does not mutate base source', !missingReport.base_summary['src/truth-accounting-core-v0-1.js']);
ok('missing run mutates virtual source', !!missingReport.virtual_summary['src/truth-accounting-core-v0-1.js']);
ok('accepted scaffold repair has truth accounting output', !!missingReport.truth_gate, reportDetail(missingReport));

const liveFiles = Object.assign({}, completeFiles);
liveFiles['src/language-parser-v0-1.js'] = "module.exports = { VERSION: '0.1.0' };\n// compileMath\n";
liveFiles['tests/language-parser-v0-1-test.js'] = moduleTest('src/language-parser-v0-1.js');
const goal = {
  id: 'formal_math_solver_growth',
  axes: [
    { id: 'parser_solve_linear_equation', file: 'src/language-parser-v0-1.js', needle: 'solveLinearEquation', class: 'operator', w: 1 },
    { id: 'parser_proof_check_step', file: 'src/language-parser-v0-1.js', needle: 'checkProofStep', class: 'operator', w: 1 }
  ]
};
const meta = L.metaComplete(liveFiles, goal, { tests: ['tests/language-parser-v0-1-test.js'] });
ok('meta-completion emits report packet', meta.packet_type === '42ndMind_meta_completion_report_v0_1' && meta.ξ === '');
ok('meta-completion detects declared capability gaps', meta.improvement.before_gaps === 2);
ok('meta-completion simulates candidate in sandbox', meta.sandbox_report && meta.sandbox_report.accepted === true, reportDetail(meta));
ok('meta-completion improves declared gaps', meta.improvement.after_gaps < meta.improvement.before_gaps, reportDetail(meta));
ok('meta-completion produces positive score', meta.improvement.score > 0, reportDetail(meta));
ok('meta-completion proposes candidate patch', meta.decision.code === 'propose_candidate_patch');
ok('meta-completion mutates virtual source', meta.virtual_summary['src/language-parser-v0-1.js'].checksum !== meta.base_summary['src/language-parser-v0-1.js'].checksum);
ok('meta-completion leaves base source unchanged', liveFiles['src/language-parser-v0-1.js'].indexOf('solveLinearEquation') < 0 && liveFiles['src/language-parser-v0-1.js'].indexOf('checkProofStep') < 0);
ok('meta-completion fields are unit-total', meta.unit.ok === true && Math.abs(L.l1(meta.fields.Δ) - 1) < 1e-6 && Math.abs(L.l1(meta.fields.Ωmeta) - 1) < 1e-6);

const parserPatch = meta.proposal.operations.find(op => op.path === 'src/language-parser-v0-1.js');
ok('meta-completion proposes executable parser source', !!parserPatch && parserPatch.content.indexOf('function solveLinearEquation') >= 0 && parserPatch.content.indexOf('function checkProofStep') >= 0, reportDetail(meta));
const synthesizedParser = executeCommonJs(parserPatch.content);
ok('synthesized parser exports solveLinearEquation', typeof synthesizedParser.solveLinearEquation === 'function');
ok('synthesized parser exports checkProofStep', typeof synthesizedParser.checkProofStep === 'function');
ok('synthesized solveLinearEquation solves x + 1 = 3', synthesizedParser.solveLinearEquation('x + 1 = 3').value === 2);
ok('synthesized checkProofStep verifies modus ponens', synthesizedParser.checkProofStep('if A => B and A, then B').ok === true);

console.log(rows.join('\n'));
