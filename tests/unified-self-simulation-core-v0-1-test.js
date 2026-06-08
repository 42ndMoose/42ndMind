const assert = require('assert');
const fs = require('fs');
const path = require('path');
const U = require('../src/unified-self-simulation-core-v0-1.js');

const root = path.resolve(__dirname, '..');
const files = {
  'src/math-language-kernel-v0-1.js': fs.readFileSync(path.join(root, 'src/math-language-kernel-v0-1.js'), 'utf8'),
  'src/math-ast-core-v0-1.js': fs.readFileSync(path.join(root, 'src/math-ast-core-v0-1.js'), 'utf8'),
  'src/operator-anatomy-v0-1.js': fs.readFileSync(path.join(root, 'src/operator-anatomy-v0-1.js'), 'utf8'),
  'src/proof-calculus-core-v0-1.js': fs.readFileSync(path.join(root, 'src/proof-calculus-core-v0-1.js'), 'utf8'),
  'src/math-closure-engine-v0-1.js': fs.readFileSync(path.join(root, 'src/math-closure-engine-v0-1.js'), 'utf8')
};

assert.strictEqual(U.VERSION, '0.1.0');
assert.strictEqual(typeof U.simulate, 'function');
assert.strictEqual(typeof U.applyIfMoreOrSame, 'function');

const noop = U.simulate(files, {
  id: 'same_self_noop_comment',
  operations: [{ type: 'replace', path: 'src/operator-anatomy-v0-1.js', content: files['src/operator-anatomy-v0-1.js'] }]
});
assert.strictEqual(noop.packet_type, '42ndMind_unified_self_simulation_v0_1');
assert.strictEqual(noop.applyable, true);
assert.strictEqual(noop.less_self, false);
assert.strictEqual(noop.after.brain.ok, true);
assert.strictEqual(noop.after.brain.equation, 'brain = |perception| + |memory| + |belief| + |valuation| + |action| + |language|');
assert.strictEqual(noop.after.brain.organ_count, 6);
assert.strictEqual(noop.feeling, 'same_self');

const applied = U.applyIfMoreOrSame(files, {
  id: 'same_self_noop_apply',
  operations: [{ type: 'replace', path: 'src/operator-anatomy-v0-1.js', content: files['src/operator-anatomy-v0-1.js'] }]
});
assert.strictEqual(applied.ok, true);
assert.strictEqual(applied.applied, true);
assert.strictEqual(applied.feeling, 'same_self');

const damagedKernel = "module.exports = Object.freeze({ VERSION: '0.1.0' });\n";
const bad = U.simulate(files, {
  id: 'less_self_remove_math_kernel_closure',
  operations: [{ type: 'replace', path: 'src/math-language-kernel-v0-1.js', content: damagedKernel }]
});
assert.strictEqual(bad.applyable, false);
assert.strictEqual(bad.less_self, true);
assert.strictEqual(bad.feeling, 'less_self');
assert.ok(bad.pain > bad.reward);
assert.strictEqual(bad.reality.accepted_by_reality, false);

const rejected = U.applyIfMoreOrSame(files, {
  id: 'reject_bad_source_edit',
  operations: [{ type: 'replace', path: 'src/math-language-kernel-v0-1.js', content: damagedKernel }]
});
assert.strictEqual(rejected.ok, false);
assert.strictEqual(rejected.applied, false);
assert.strictEqual(rejected.feeling, 'less_self');

console.log('unified-self-simulation-core-v0-1 tests passed');
