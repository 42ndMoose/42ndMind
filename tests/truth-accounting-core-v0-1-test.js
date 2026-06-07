const assert = require('assert');
const T = require('../src/truth-accounting-core-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const closed = T.create({
  id: 'θ_closed',
  support: 1,
  counter: 0,
  contradiction: 0,
  unknown: 0,
  scope_ok: 1,
  scope_error: 0,
  definition_ok: 1,
  definition_error: 0,
  observation_ok: 1,
  observation_error: 0,
  measurement_ok: 1,
  measurement_error: 0,
  no_contradiction: 1,
  no_unknown: 1
});

ok('truth accounting core loads', T.VERSION === '0.1.0');
ok('closed claim has unit fields', closed.unit.ok === true);
ok('closed claim opens truth gate', closed.truth_gate.true === true);
ok('closed claim theta true is one', closed.θ.some(row => row.σ === 'θT' && row.w === 1));
ok('closed claim has no English', closed.ξ === '' && closed.truth_gate.english === '');

const unknown = T.create({
  id: 'θ_unknown',
  support: 1,
  counter: 0,
  contradiction: 0,
  unknown: 0.4,
  scope_ok: 1,
  definition_ok: 1,
  observation_ok: 1,
  measurement_ok: 1,
  no_contradiction: 1,
  no_unknown: 0.6
});

ok('unknown claim remains unit-total', unknown.unit.ok === true);
ok('unknown claim does not open truth gate', unknown.truth_gate.true === false);
ok('unknown claim is unresolved', unknown.truth_gate.unresolved === true);

const contradicted = T.create({
  id: 'θ_contradicted',
  support: 1,
  counter: 0.2,
  contradiction: 0.7,
  unknown: 0,
  scope_ok: 1,
  definition_ok: 1,
  observation_ok: 1,
  measurement_ok: 1,
  no_contradiction: 0.3,
  no_unknown: 1
});

ok('contradicted claim remains unit-total', contradicted.unit.ok === true);
ok('contradicted claim does not open truth gate', contradicted.truth_gate.true === false);
ok('contradicted claim is contested', contradicted.truth_gate.contested === true);

const badScope = T.create({
  id: 'θ_scope_error',
  support: 1,
  contradiction: 0,
  unknown: 0,
  scope_ok: 0.4,
  scope_error: 0.6,
  definition_ok: 1,
  observation_ok: 1,
  measurement_ok: 1,
  no_contradiction: 1,
  no_unknown: 1
});

ok('scope error blocks truth', badScope.truth_gate.true === false && badScope.truth_gate.scoped === false);
ok('definition/observation/measurement channels exist', ['δ', 'ο', 'μ'].every(key => Math.abs(T.l1(badScope[key]) - 1) < 1e-6));

const old = T.fromOldTruthClaim({
  id: 'old_claim',
  support_pressure: 0.8,
  counter_pressure: 0.1,
  contradiction_pressure: 0.2,
  unresolved_pressure: 0.3
});

ok('old truth pressure ports into math claim', old.id === 'old_claim' && old.unit.ok === true);
ok('old truth pressure does not auto-promote truth', old.truth_gate.true === false);
ok('serialized truth packet exists', T.serialize(closed).startsWith('Θ{'));

require('./cognitive-organism-core-v0-1-test.js');
rows.push('PASS cognitive organism core proof runs through truth suite');

console.log(rows.join('\n'));
