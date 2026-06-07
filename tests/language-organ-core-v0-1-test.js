const assert = require('assert');
const L = require('../src/language-organ-core-v0-1.js');

function near(value, target) { assert.ok(Math.abs(Number(value) - Number(target)) < 1e-12); }
function languageOk(packet) {
  assert.strictEqual(packet.language.container, true);
  assert.strictEqual(packet.language.content_complete, false);
  assert.strictEqual(packet.language.ok, true);
  assert.strictEqual(packet.language.organ_count, 6);
  near(packet.language.magnitude, 6);
  near(packet.language.coherence, 1);
  Object.keys(packet.organs).forEach(id => near(packet.organs[id].unit, 1));
}

assert.strictEqual(L.VERSION, '0.1.0');
assert.strictEqual(typeof L.create, 'function');
assert.strictEqual(typeof L.observe, 'function');

const state = L.create();
const empty = L.packet(state);
languageOk(empty);
assert.strictEqual(empty.records.length, 0);

const one = L.observe(state, '2 + 2 = 4');
languageOk(one);
assert.strictEqual(one.records.length, 1);
assert.ok(Object.keys(one.slots.syntax).length >= 1);
assert.ok(Object.keys(one.slots.translation).length >= 1);

const two = L.observe(state, 'simplify x + 0');
languageOk(two);
assert.strictEqual(two.records.length, 2);
assert.ok(Object.keys(two.slots.proof).length >= 1);

const three = L.observe(state, 'unknown operator sample');
languageOk(three);
assert.strictEqual(three.records.length, 3);
assert.ok(Object.keys(three.slots.generation).length >= 1);
assert.ok(Object.keys(three.slots.gaps).length >= 1);

const run = L.run(['A B = C', 'a_n = n^2', 'exists x in R, x^2 = 2']);
languageOk(run.final);
assert.strictEqual(run.packets.length, 3);
assert.strictEqual(run.final.records.length, 3);

console.log('language-organ-core-v0-1 tests passed');
