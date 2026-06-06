const assert = require('assert');
const AST = require('../src/math-ast-core-v0-1.js');

assert.strictEqual(AST.VERSION, '0.1.0');

const eq = AST.parse('2x + 1 = 7');
assert.strictEqual(eq.ok, true);
assert.strictEqual(eq.body.type, 'Equation');
assert.strictEqual(eq.body.left.type, 'AffineExpression');
assert.strictEqual(eq.body.left.coefficient, 2);
assert.strictEqual(eq.body.left.offset, 1);
assert.strictEqual(AST.classify(eq).closure, 'solveAffineEquation');

const eq2 = AST.parse('-3y - 6 = 9');
assert.strictEqual(eq2.ok, true);
assert.strictEqual(eq2.body.type, 'Equation');
assert.strictEqual(eq2.body.left.coefficient, -3);
assert.strictEqual(eq2.body.left.offset, -6);
assert.strictEqual(AST.classify(eq2).closure, 'solveAffineEquation');

const div = AST.parse('x/y is undefined when y = 0');
assert.strictEqual(div.ok, true);
assert.strictEqual(div.body.type, 'DivisionConstraint');
assert.strictEqual(AST.classify(div).closure, 'proveDivisionByZeroUndefined');

const sq = AST.parse('∀x ∈ ℝ, x^2 ≥ 0');
assert.strictEqual(sq.ok, true);
assert.strictEqual(sq.body.type, 'QuantifiedStatement');
assert.strictEqual(sq.body.theorem_class, 'square_nonnegative_over_reals');
assert.strictEqual(AST.classify(sq).closure, 'proveSquareNonnegative');

const chain = AST.parse('A=>B, B=>C');
assert.strictEqual(chain.ok, true);
assert.strictEqual(chain.body.type, 'ImplicationChain');
assert.strictEqual(chain.body.implications.length, 2);
assert.strictEqual(AST.classify(chain).closure, 'composeImplicationChain');

const contradiction = AST.parse('A, not A');
assert.strictEqual(contradiction.ok, true);
assert.strictEqual(contradiction.body.type, 'ContradictionPair');
assert.strictEqual(contradiction.body.contradiction, true);
assert.strictEqual(AST.classify(contradiction).closure, 'detectContradiction');

const rel = AST.parse('x >= 3 with x = 5');
assert.strictEqual(rel.ok, true);
assert.strictEqual(rel.body.type, 'LinearRelation');
assert.strictEqual(AST.classify(rel).closure, 'evaluateLinearRelation');

console.log('math-ast-core-v0-1 tests passed');
