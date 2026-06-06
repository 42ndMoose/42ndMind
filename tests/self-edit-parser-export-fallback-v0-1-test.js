const assert = require('assert');
const fs = require('fs');
const path = require('path');
const L = require('../src/self-edit-loop-v0-1.js');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/self-edit-loop-v0-1.js'), 'utf8');
assert.ok(source.includes('if (!factoryExports) out = injectExports(out, names);'));

const files = {};
L.DEFAULT_MANIFEST.forEach(layer => {
  files[layer.source] = layer.source.endsWith('.json')
    ? JSON.stringify({ validPackets: [], invalidPackets: [], markers: [] })
    : "module.exports = { VERSION: '0.1.0' };\n";
  files[layer.test] = "const assert = require('assert'); assert.ok(true);\n";
});

files['src/language-parser-v0-1.js'] = "module.exports = { VERSION: '0.1.0' };\n// compileMath\n";
files['tests/language-parser-v0-1-test.js'] = "const assert = require('assert'); const P = require('../src/language-parser-v0-1.js'); assert.strictEqual(typeof P.solveLinearEquation, 'function'); assert.strictEqual(typeof P.checkProofStep, 'function'); assert.strictEqual(P.solveLinearEquation('x + 1 = 3').value, 2); assert.strictEqual(P.checkProofStep('if A => B and A, then B').ok, true);\n";

const goal = {
  id: 'self_edit_export_regression',
  axes: [
    { id: 'parser_solve_linear_equation', file: 'src/language-parser-v0-1.js', needle: 'solveLinearEquation', class: 'operator', w: 1 },
    { id: 'parser_proof_check_step', file: 'src/language-parser-v0-1.js', needle: 'checkProofStep', class: 'operator', w: 1 }
  ]
};

const meta = L.metaComplete(files, goal, { tests: ['tests/language-parser-v0-1-test.js'] });
assert.strictEqual(meta.decision.code, 'propose_candidate_patch');
const patch = meta.proposal.operations.find(op => op.path === 'src/language-parser-v0-1.js');
assert.ok(patch);
assert.ok(patch.content.includes('module.exports'));

const module = { exports: {} };
new Function('module', 'exports', patch.content)(module, module.exports);
assert.strictEqual(typeof module.exports.solveLinearEquation, 'function');
assert.strictEqual(typeof module.exports.checkProofStep, 'function');
assert.strictEqual(module.exports.solveLinearEquation('x + 1 = 3').value, 2);
assert.strictEqual(module.exports.checkProofStep('if A => B and A, then B').ok, true);

console.log('self-edit-parser-export-fallback-v0-1 tests passed');
