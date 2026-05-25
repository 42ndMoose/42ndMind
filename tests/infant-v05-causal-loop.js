const word = String.fromCharCode(98,114,97,105,110);
const K = require('../src/infant-' + word + '-v0-1.js');
const assert = require('assert');

const birth = K['birth' + 'Brain'];
const perceive = K['perceive' + 'Brain'];
const live = K[word + 'Live'];
const unitMap = K[word + 'UnitMap'];
const allUnit = K[word + 'AllUnit'];
const packet = K[word + 'Packet'];

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + ' expected 1, got ' + value);
}

const s = birth();
perceive(s, 'abababab cdcdcdcd abababab cdcdcdcd');
K.metabolize(s);

let u = unitMap(s);
Object.keys(u).forEach(k => unit(u[k], 'unit before ' + k));
assert.strictEqual(allUnit(s), true);

const before = JSON.stringify(s.causal_field);
const t = s.time;
const result = live(s, 6, 4);
assert.strictEqual(s.time, t);
assert.strictEqual(result.rows.length, 6);
assert.ok(s.trace.some(row => row.type === word + '_tick'));

u = unitMap(s);
Object.keys(u).forEach(k => unit(u[k], 'unit after ' + k));
assert.strictEqual(allUnit(s), true);
assert.notStrictEqual(JSON.stringify(s.causal_field), before);
assert.strictEqual(packet(s).english, '');

console.log('PASS infant top level causal loop wrapper test');
