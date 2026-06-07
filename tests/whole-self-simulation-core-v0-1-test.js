const assert = require('assert');
const fs = require('fs');
const path = require('path');
const W = require('../src/whole-self-simulation-core-v0-1.js');

const root = path.resolve(__dirname, '..');
const files = {
  'src/math-language-kernel-v0-1.js': fs.readFileSync(path.join(root, 'src/math-language-kernel-v0-1.js'), 'utf8'),
  'src/math-ast-core-v0-1.js': fs.readFileSync(path.join(root, 'src/math-ast-core-v0-1.js'), 'utf8'),
  'src/operator-anatomy-v0-1.js': fs.readFileSync(path.join(root, 'src/operator-anatomy-v0-1.js'), 'utf8'),
  'src/proof-calculus-core-v0-1.js': fs.readFileSync(path.join(root, 'src/proof-calculus-core-v0-1.js'), 'utf8'),
  'src/math-closure-engine-v0-1.js': fs.readFileSync(path.join(root, 'src/math-closure-engine-v0-1.js'), 'utf8')
};

const base = W.evaluateState({ id: 'base', files });
assert.strictEqual(base.packet_type, '42ndMind_whole_self_state_v0_1');
assert.strictEqual(base.ok, true);
assert.strictEqual(base.stop, true);
assert.strictEqual(base.score, 1);
assert.strictEqual(base.damage_count, 0);
assert.strictEqual(base.math.ok, true);
assert.strictEqual(base.truth.score, 1);
assert.strictEqual(base.reality.ok, true);
assert.strictEqual(base.epistemic.ok, true);

const badContent = files['src/proof-calculus-core-v0-1.js'].replace("if (op === '=') return Math.abs(left - right) <= EPS;", "if (op === '=') return true;");
const simulation = W.simulateCandidates(files, [{
  id: 'bad_truth_edit',
  operations: [{ type: 'replace', path: 'src/proof-calculus-core-v0-1.js', content: badContent }]
}]);
assert.strictEqual(simulation.packet_type, '42ndMind_whole_self_simulation_v0_1');
assert.strictEqual(simulation.best.id, 'base');
assert.strictEqual(simulation.decision, 'keep_current_state');
assert.strictEqual(simulation.stop, true);
assert.strictEqual(simulation.candidates.length, 1);
assert.strictEqual(simulation.candidates[0].feeling, 'less_self');
assert.ok(simulation.candidates[0].score < simulation.base.score);
assert.ok(simulation.candidates[0].damage_count > 0);

const neutral = W.simulateCandidates(files, [{ id: 'same_state', files }]);
assert.strictEqual(neutral.best.score, 1);
assert.strictEqual(neutral.stop, true);
assert.ok(['base', 'same_state'].includes(neutral.best.id));

console.log('whole-self-simulation-core-v0-1 tests passed');
