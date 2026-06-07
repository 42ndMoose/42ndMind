const assert = require('assert');
const G = require('../src/autonomous-brain-growth-core-v0-1.js');

function brainOne(p) {
  assert.strictEqual(p.brain.ok, true);
  assert.ok(Math.abs(G.l1(p.B) - 1) < 1e-5);
}

const s = G.create();
assert.strictEqual(s.brain.ok, true);

const a = G.grow(s, 'alpha is beta');
brainOne(a);
assert.strictEqual(a.concept_count, 2);
assert.strictEqual(a.belief_count, 1);
assert.strictEqual(a.beliefs[G.relationKey('alpha', 'beta')].positive, 1);

const b = G.grow(s, 'alpha is beta');
brainOne(b);
assert.strictEqual(b.beliefs[G.relationKey('alpha', 'beta')].positive, 2);
assert.ok(b.beliefs[G.relationKey('alpha', 'beta')].support > a.beliefs[G.relationKey('alpha', 'beta')].support);

const c = G.grow(s, 'is alpha beta?');
brainOne(c);
assert.strictEqual(c.last.growth.answer.answer, 'yes');

const d = G.answer(s, 'is alpha beta?');
assert.strictEqual(d.ok, true);
assert.strictEqual(d.result.answer, 'yes');
assert.strictEqual(d.brain.ok, true);

const z = G.grow(s, 'zz %% qq');
brainOne(z);
assert.strictEqual(z.last.growth.kind, 'unparsed');

console.log('autonomous-growth-smoke-v0-1 tests passed');
