const assert = require('assert');
const L = require('../src/self-edit-loop-v0-1.js');
const M = require('../src/mathematical-patch-proposer-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
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

const completeFiles = buildCompleteFiles();

ok('self-edit loop loads', L.VERSION === '0.1.0');
const completeState = L.wholeState(completeFiles, 'abababab cdcdcdcd');
ok('whole language state is unit-total', completeState.unit.ok === true);
ok('complete files have no manifest gaps', completeState.gaps.length === 0);
ok('complete files have no mathematical gaps', completeState.math_patch.gaps.length === 0);
ok('whole language fields are unit-total', ['Λ', 'Γ', 'Π', 'ΩL'].every(key => Math.abs(L.l1(completeState.fields[key]) - 1) < 1e-6));

const completeReport = L.run(completeFiles, { rawInput: 'abababab cdcdcdcd' });
ok('complete run accepted artifact-only proposal', completeReport.accepted === true);
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
const missingReport = L.run(missingFiles, { rawInput: 'abababab cdcdcdcd' });
ok('missing run proposes mathematical operations', missingReport.math_patch.proposal.operations.length > 0);
ok('missing run proposes gap-filling operations', missingReport.proposal.operations.some(op => op.path === 'src/truth-accounting-core-v0-1.js'));
ok('missing run accepted virtual scaffold proposal', missingReport.accepted === true);
ok('missing run does not mutate base source', !missingReport.base_summary['src/truth-accounting-core-v0-1.js']);
ok('missing run mutates virtual source', !!missingReport.virtual_summary['src/truth-accounting-core-v0-1.js']);
ok('accepted run opens truth gate', missingReport.truth_gate && missingReport.truth_gate.true === true);

console.log(rows.join('\n'));
