const assert = require('assert');
const Engine = require('../src/proof-obligation-engine-v0-1.js');

assert.strictEqual(Engine.VERSION, '0.1.0');
assert.strictEqual(typeof Engine.analyze, 'function');
assert.strictEqual(typeof Engine.run, 'function');

function verdict(input, expected) {
  const out = Engine.analyze(input);
  assert.strictEqual(out.verdict, expected, input + ' expected ' + expected + ' got ' + out.verdict);
  assert.strictEqual(out.engine, 'proof_obligation_engine_v0_1');
  assert.ok(Array.isArray(out.operators));
  assert.ok(Array.isArray(out.obligations));
  return out;
}

verdict('2 + 2 = 4', 'verified');
verdict('2 + 2 = 5', 'rejected');
verdict('7 - 3 = 4', 'verified');
verdict('7 - 3 = 5', 'rejected');

const guarded = verdict('x / x = 1 with x != 0', 'conditional');
assert.strictEqual(guarded.family, 'division_identity');
assert.strictEqual(guarded.operators[0].type, 'division');
assert.deepStrictEqual(guarded.conditions, ['x != 0']);
assert.strictEqual(guarded.obligations[0].satisfied, true);

const unguarded = verdict('z / z = 1', 'under_guarded');
assert.strictEqual(unguarded.family, 'division_identity');
assert.deepStrictEqual(unguarded.missing_conditions, ['z != 0']);
assert.strictEqual(unguarded.obligations[0].satisfied, false);

const sqrt = verdict('sqrt(y^2) = y', 'conditional');
assert.strictEqual(sqrt.family, 'sqrt_square_identity');
assert.deepStrictEqual(sqrt.conditions, ['y >= 0']);
assert.deepStrictEqual(sqrt.missing_conditions, ['y >= 0']);
assert.strictEqual(sqrt.corrected_form, 'sqrt(y^2)=|y|');

verdict('p = q, q = r therefore p = r', 'verified');
verdict('m < n, n < o therefore m < o', 'verified');
verdict('m < n therefore n < m', 'rejected');
verdict('forall y in R, y + 0 = y', 'universal_verified');

const report = Engine.run([
  { input: 'a / a = 1', expected_verdict: 'under_guarded' },
  { input: 'a / a = 1 with a != 0', expected_verdict: 'conditional' },
  { input: 'forall k in R, k + 0 = k', expected_verdict: 'universal_verified' }
]);
assert.strictEqual(report.ok, true);
assert.ok(report.operator_families.includes('division_identity'));
assert.ok(report.operator_families.includes('universal_additive_identity'));

console.log('proof-obligation-engine-v0-1 tests passed');
