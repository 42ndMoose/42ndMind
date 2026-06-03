const assert = require('assert');
const L = require('../src/self-edit-loop-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const completeFiles = {
  'src/math-language-kernel-v0-1.js': "module.exports = { VERSION: '0.1.0' };",
  'tests/math-language-kernel-v0-1-test.js': "const assert = require('assert'); const M = require('../src/math-language-kernel-v0-1.js'); assert.strictEqual(M.VERSION, '0.1.0');",
  'src/discovery-core-v0-1.js': "module.exports = { VERSION: '0.1.0' };",
  'tests/discovery-core-v0-1-test.js': "const assert = require('assert'); const M = require('../src/discovery-core-v0-1.js'); assert.strictEqual(M.VERSION, '0.1.0');",
  'src/source-sandbox-v0-1.js': "module.exports = { VERSION: '0.1.0' };",
  'tests/source-sandbox-v0-1-test.js': "const assert = require('assert'); const M = require('../src/source-sandbox-v0-1.js'); assert.strictEqual(M.VERSION, '0.1.0');",
  'src/language-parser-v0-1.js': "module.exports = { VERSION: '0.1.0' };",
  'tests/language-parser-v0-1-test.js': "const assert = require('assert'); const M = require('../src/language-parser-v0-1.js'); assert.strictEqual(M.VERSION, '0.1.0');",
  'src/intention-algebra-v0-1.js': "module.exports = { VERSION: '0.1.0' };",
  'tests/intention-algebra-v0-1-test.js': "const assert = require('assert'); const M = require('../src/intention-algebra-v0-1.js'); assert.strictEqual(M.VERSION, '0.1.0');",
  'src/nested-relation-core-v0-1.js': "module.exports = { VERSION: '0.1.0' };",
  'tests/nested-relation-core-v0-1-test.js': "const assert = require('assert'); const M = require('../src/nested-relation-core-v0-1.js'); assert.strictEqual(M.VERSION, '0.1.0');",
  'src/truth-accounting-core-v0-1.js': "module.exports = { VERSION: '0.1.0' };",
  'tests/truth-accounting-core-v0-1-test.js': "const assert = require('assert'); const M = require('../src/truth-accounting-core-v0-1.js'); assert.strictEqual(M.VERSION, '0.1.0');",
  'tests/fixtures/language-v0-1/conformance-fixtures.json': "{}",
  'tests/language-v0-1-conformance-test.js': "const assert = require('assert'); assert.ok(true);"
};

ok('self-edit loop loads', L.VERSION === '0.1.0');
const completeState = L.wholeState(completeFiles, 'abababab cdcdcdcd');
ok('whole language state is unit-total', completeState.unit.ok === true);
ok('complete files have no manifest gaps', completeState.gaps.length === 0);
ok('whole language fields are unit-total', ['Λ', 'Γ', 'ΩL'].every(key => Math.abs(L.l1(completeState.fields[key]) - 1) < 1e-6));

const completeReport = L.run(completeFiles, { rawInput: 'abababab cdcdcdcd' });
ok('complete run accepted artifact-only proposal', completeReport.accepted === true);
ok('complete run exports self-edit artifact in virtual source', !!completeReport.virtual_summary['artifacts/self-edit-state-v0-1.json']);
ok('complete run keeps English empty', completeReport.ξ === '');

const missingFiles = Object.assign({}, completeFiles);
delete missingFiles['src/truth-accounting-core-v0-1.js'];
delete missingFiles['tests/truth-accounting-core-v0-1-test.js'];

const missingState = L.wholeState(missingFiles, 'abababab cdcdcdcd');
ok('missing files produce gaps', missingState.gaps.length === 2);
const missingReport = L.run(missingFiles, { rawInput: 'abababab cdcdcdcd' });
ok('missing run proposes gap-filling operations', missingReport.proposal.operations.some(op => op.path === 'src/truth-accounting-core-v0-1.js'));
ok('missing run accepted virtual scaffold proposal', missingReport.accepted === true);
ok('missing run does not mutate base source', !missingReport.base_summary['src/truth-accounting-core-v0-1.js']);
ok('missing run mutates virtual source', !!missingReport.virtual_summary['src/truth-accounting-core-v0-1.js']);
ok('accepted run opens truth gate', missingReport.truth_gate && missingReport.truth_gate.true === true);

console.log(rows.join('\n'));
