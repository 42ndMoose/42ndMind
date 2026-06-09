const assert = require('assert');
const Gate = require('../src/objective-reality-contact-gate-v0-1.js');

assert.strictEqual(Gate.VERSION, '0.1.0');
assert.strictEqual(typeof Gate.evaluate, 'function');
assert.strictEqual(typeof Gate.run, 'function');
assert.strictEqual(typeof Gate.defaultCases, 'function');

const expected = {
  '2 + 2 = 4': 'verified',
  '2x + 1 = x + 4': 'verified',
  'x / x = 1 with x != 0': 'conditional',
  'x / x = 1': 'under_guarded',
  'sqrt(x^2) = x': 'conditional',
  'a = b, b = c therefore a = c': 'verified',
  'a < b, b < c therefore a < c': 'verified',
  'a < b therefore b < a': 'rejected',
  'forall x in R, x + 0 = x': 'universal_verified',
  '2 + 2 = 5': 'rejected'
};

Object.keys(expected).forEach(input => {
  const actual = Gate.evaluate(input);
  assert.strictEqual(actual.verdict, expected[input], input + ' expected ' + expected[input] + ' got ' + actual.verdict);
});

const generalized = {
  'y / y = 1 with y != 0': 'conditional',
  'z / z = 1': 'under_guarded',
  'sqrt(y^2) = y': 'conditional',
  'p = q, q = r therefore p = r': 'verified',
  'm < n, n < o therefore m < o': 'verified',
  'm < n therefore n < m': 'rejected',
  'forall y in R, y + 0 = y': 'universal_verified',
  '7 - 3 = 4': 'verified',
  '7 - 3 = 5': 'rejected'
};

Object.keys(generalized).forEach(input => {
  const actual = Gate.evaluate(input);
  assert.strictEqual(actual.verdict, generalized[input], input + ' expected generalized ' + generalized[input] + ' got ' + actual.verdict);
  assert.strictEqual(actual.rule_source, 'structural_reality_rule', input + ' should come from structural rule');
});

const guarded = Gate.evaluate('y / y = 1 with y != 0');
assert.deepStrictEqual(guarded.conditions, ['y != 0']);

const unguarded = Gate.evaluate('z / z = 1');
assert.deepStrictEqual(unguarded.missing_conditions, ['z != 0']);

const sqrt = Gate.evaluate('sqrt(y^2) = y');
assert.deepStrictEqual(sqrt.conditions, ['y >= 0']);
assert.strictEqual(sqrt.corrected_form, 'sqrt(y^2)=|y|');

const report = Gate.run();
assert.strictEqual(report.packet_type, '42ndMind_objective_reality_contact_gate_v0_1');
assert.strictEqual(report.ok, true);
assert.strictEqual(report.status, 'adversarial_reality_contact_passed');
assert.strictEqual(report.pass_count, report.case_count);
assert.strictEqual(report.score, 1);
assert.ok(report.verdict_classes.includes('verified'));
assert.ok(report.verdict_classes.includes('conditional'));
assert.ok(report.verdict_classes.includes('under_guarded'));
assert.ok(report.verdict_classes.includes('rejected'));
assert.ok(report.verdict_classes.includes('universal_verified'));
assert.ok(report.rule_sources.includes('structural_reality_rule'));

console.log('objective-reality-contact-gate-v0-1 structural tests passed');
