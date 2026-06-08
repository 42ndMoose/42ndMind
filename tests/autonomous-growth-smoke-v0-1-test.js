const assert = require('assert');
const G = require('../src/autonomous-brain-growth-core-v0-1.js');
const N = require('../src/nested-brain-core-v0-1.js');

function near(value, target) { assert.ok(Math.abs(Number(value) - Number(target)) < 1e-9); }
function nearCompat(value, target) { assert.ok(Math.abs(Number(value) - Number(target)) < 1e-5); }
function nearOne(value) { near(value, 1); }
function brainOne(p) {
  assert.strictEqual(p.brain.ok, true);
  nearCompat(G.l1(p.B), 1);
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

const nb = N.build(s);
assert.strictEqual(nb.ok, true);
assert.strictEqual(nb.equation, 'brain = |perception| + |memory| + |belief| + |valuation| + |action| + |language|');
assert.strictEqual(nb.organ_count, 6);
near(nb.magnitude, 6);
nearOne(nb.coherence);
near(nb.B.length, 6);
near(N.l1(nb.B), 6);
assert.ok(nb.organs.language);
Object.keys(nb.organs).forEach(id => nearOne(nb.organs[id].unit));

const sim = N.simulate(s);
assert.strictEqual(sim.ok, true);
assert.strictEqual(sim.applyable, true);
assert.strictEqual(sim.brain.ok, true);
near(sim.brain.magnitude, 6);
nearOne(sim.brain.coherence);

const applied = N.commit(s);
assert.strictEqual(applied.ok, true);
assert.strictEqual(applied.applied, true);
assert.strictEqual(s.nested_brain.ok, true);
near(s.nested_brain.magnitude, 6);
nearOne(s.nested_brain.coherence);
assert.ok(s.optimized_stage.id);

require('./language-organ-core-v0-1-test.js');
require('./unified-self-simulation-core-v0-1-test.js');

console.log('autonomous-growth-smoke-v0-1 tests passed with language as live brain organ and unified self simulation');
