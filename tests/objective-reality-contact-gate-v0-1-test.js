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

const guarded = Gate.evaluate('x / x = 1 with x != 0');
assert.deepStrictEqual(guarded.conditions, ['x != 0']);

const unguarded = Gate.evaluate('x / x = 1');
assert.deepStrictEqual(unguarded.missing_conditions, ['x != 0']);

const sqrt = Gate.evaluate('sqrt(x^2) = x');
assert.deepStrictEqual(sqrt.conditions, ['x >= 0']);
assert.strictEqual(sqrt.corrected_form, 'sqrt(x^2)=|x|');

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

console.log('objective-reality-contact-gate-v0-1 tests passed');
