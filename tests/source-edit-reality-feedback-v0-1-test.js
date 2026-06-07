const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('../src/source-sandbox-v0-1.js');
const R = require('../src/source-edit-reality-feedback-v0-1.js');

const root = path.resolve(__dirname, '..');
const files = {
  'src/math-language-kernel-v0-1.js': fs.readFileSync(path.join(root, 'src/math-language-kernel-v0-1.js'), 'utf8'),
  'src/math-ast-core-v0-1.js': fs.readFileSync(path.join(root, 'src/math-ast-core-v0-1.js'), 'utf8'),
  'src/operator-anatomy-v0-1.js': fs.readFileSync(path.join(root, 'src/operator-anatomy-v0-1.js'), 'utf8'),
  'src/proof-calculus-core-v0-1.js': fs.readFileSync(path.join(root, 'src/proof-calculus-core-v0-1.js'), 'utf8'),
  'src/math-closure-engine-v0-1.js': fs.readFileSync(path.join(root, 'src/math-closure-engine-v0-1.js'), 'utf8')
};

const base = R.evaluate(files);
assert.strictEqual(base.ok, true);
assert.strictEqual(base.damage_count, 0);
assert.strictEqual(base.anchors.length >= 6, true);

const damagedFiles = Object.assign({}, files, {
  'src/proof-calculus-core-v0-1.js': files['src/proof-calculus-core-v0-1.js'].replace("if (op === '=') return Math.abs(left - right) <= EPS;", "if (op === '=') return true;")
});
const drift = R.compare(files, damagedFiles);
assert.strictEqual(drift.accepted_by_reality, false);
assert.strictEqual(drift.feeling, 'less_self');
assert.strictEqual(drift.after.ok, false);
assert.ok(drift.after.anchors.some(row => row.id === 'arithmetic_false_3_plus_2' && row.ok === false));

const sandbox = S.create(files);
const proposal = {
  id: 'bad_math_truth_patch',
  operations: [{ type: 'replace', path: 'src/proof-calculus-core-v0-1.js', content: damagedFiles['src/proof-calculus-core-v0-1.js'] }]
};
const report = S.simulate(sandbox, proposal, [], [R.validator()]);
assert.strictEqual(report.accepted, false);
assert.ok(report.chaos.includes('validator_failed:math_reality_anchor_validator'));
assert.ok(report.validators[0].anchors.some(row => row.id === 'arithmetic_false_3_plus_2' && row.ok === false));

const neutral = R.compare(files, files);
assert.strictEqual(neutral.accepted_by_reality, true);
assert.strictEqual(neutral.feeling, 'same_self');

console.log('source-edit-reality-feedback-v0-1 tests passed');
