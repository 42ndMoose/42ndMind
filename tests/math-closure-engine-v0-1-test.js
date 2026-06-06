const assert = require('assert');
const Closure = require('../src/math-closure-engine-v0-1.js');

assert.strictEqual(Closure.VERSION, '0.1.0');

const cases = [
  ['2x + 1 = 7', 'solveAffineEquation'],
  ['-3y - 6 = 9', 'solveAffineEquation'],
  ['2x + 1 = x + 4', 'solveLinearEquation'],
  ['2x + 1 with x = 3', 'evaluateSubstitution'],
  ['2 + 3 * 4 = 14', 'evaluateArithmeticRelation'],
  ['(2 + 3)^2 = 25', 'evaluateArithmeticRelation'],
  ['x/y is undefined when y = 0', 'proveDivisionByZeroUndefined'],
  ['∀x ∈ ℝ, x^2 ≥ 0', 'proveSquareNonnegative'],
  ['∀x ∈ ℝ, x + 0 = x', 'proveAlgebraicIdentity'],
  ['∀x ∈ ℝ, x * 1 = x', 'proveAlgebraicIdentity'],
  ['A=>B, B=>C', 'composeImplicationChain'],
  ['A, not A', 'detectContradiction'],
  ['x >= 3 with x = 5', 'evaluateLinearRelation']
];

for (const [source, operator] of cases) {
  const derived = Closure.deriveObligation(source);
  assert.strictEqual(derived.ok, true, source);
  assert.strictEqual(derived.obligation.operator, operator, source);
  assert.ok(derived.anatomy && derived.anatomy.id, source);

  const closed = Closure.close(source);
  assert.strictEqual(closed.ok, true, source);
  assert.strictEqual(closed.verified, true, source);
  assert.strictEqual(closed.no_unresolved_gap, true, source);
  assert.strictEqual(closed.gaps.length, 0, source);
  assert.strictEqual(closed.obligation.operator, operator, source);
  assert.notStrictEqual(closed.result, null, source);
}

const unsupported = Closure.close('x + unknown');
assert.strictEqual(unsupported.ok, false);
assert.ok(unsupported.gaps.length >= 1);
assert.strictEqual(unsupported.gaps[0].id, 'unclassified_math_ast');

const solved = Closure.close('2x + 1 = 7');
assert.strictEqual(solved.result.variable, 'x');
assert.strictEqual(solved.result.value.value, 3);

const solvedBothSides = Closure.close('2x + 1 = x + 4');
assert.strictEqual(solvedBothSides.result.variable, 'x');
assert.strictEqual(solvedBothSides.result.value.value, 3);

const substitution = Closure.close('2x + 1 with x = 3');
assert.strictEqual(substitution.proof.result, 7);

const arithmetic = Closure.close('2 + 3 * 4 = 14');
assert.strictEqual(arithmetic.proof.truth, true);

const relation = Closure.close('x >= 3 with x = 5');
assert.strictEqual(relation.proof.truth, true);

console.log('math-closure-engine-v0-1 tests passed');
