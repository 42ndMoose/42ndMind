const assert = require('assert');
const AST = require('../src/math-ast-core-v0-1.js');
const Proof = require('../src/proof-calculus-core-v0-1.js');

assert.strictEqual(Proof.VERSION, '0.1.0');
assert.strictEqual(Proof.identity(AST.symbol('A'), AST.symbol('A')).ok, true);
assert.strictEqual(Proof.identity(AST.symbol('A'), AST.symbol('B')).ok, false);

const solved = Proof.inverseOperation(AST.parse('2x + 1 = 7'));
assert.strictEqual(solved.ok, true);
assert.strictEqual(solved.variable, 'x');
assert.strictEqual(solved.value, 3);

const solvedNegative = Proof.inverseOperation(AST.parse('-3y - 6 = 9'));
assert.strictEqual(solvedNegative.ok, true);
assert.strictEqual(solvedNegative.variable, 'y');
assert.strictEqual(solvedNegative.value, -5);

const solvedBothSides = Proof.solveLinearEquation(AST.parse('2x + 1 = x + 4'));
assert.strictEqual(solvedBothSides.ok, true);
assert.strictEqual(solvedBothSides.variable, 'x');
assert.strictEqual(solvedBothSides.value, 3);

const substitutedEval = Proof.evaluateSubstitution(AST.parse('2x + 1 with x = 3'));
assert.strictEqual(substitutedEval.ok, true);
assert.strictEqual(substitutedEval.result, 7);

const arithmetic = Proof.evaluateArithmeticRelation(AST.parse('2 + 3 * 4 = 14'));
assert.strictEqual(arithmetic.ok, true);
assert.strictEqual(arithmetic.truth, true);
assert.strictEqual(arithmetic.left, 14);
assert.strictEqual(arithmetic.right, 14);

const arithmeticParen = Proof.evaluateArithmeticRelation(AST.parse('(2 + 3)^2 = 25'));
assert.strictEqual(arithmeticParen.ok, true);
assert.strictEqual(arithmeticParen.truth, true);

const equalityReflexive = Proof.proveEquality(AST.parse('x = x'));
assert.strictEqual(equalityReflexive.ok, true);
assert.strictEqual(equalityReflexive.equality_rule, 'reflexivity');
assert.strictEqual(equalityReflexive.rule, 'equality-reflexivity');

const equalitySymmetry = Proof.proveEquality(AST.parse('x = y therefore y = x'));
assert.strictEqual(equalitySymmetry.ok, true);
assert.strictEqual(equalitySymmetry.equality_rule, 'symmetry');
assert.strictEqual(equalitySymmetry.rule, 'equality-symmetry');

const equalityTransitivity = Proof.proveEquality(AST.parse('a = b, b = c therefore a = c'));
assert.strictEqual(equalityTransitivity.ok, true);
assert.strictEqual(equalityTransitivity.equality_rule, 'transitivity');
assert.strictEqual(equalityTransitivity.rule, 'equality-transitivity');

const simplifiedAdd = Proof.simplifyExpression(AST.parse('simplify x + 0'));
assert.strictEqual(simplifiedAdd.ok, true);
assert.strictEqual(simplifiedAdd.result, 'x');
assert.strictEqual(simplifiedAdd.changed, true);

const simplifiedMul = Proof.simplifyExpression(AST.parse('simplify x * 1'));
assert.strictEqual(simplifiedMul.ok, true);
assert.strictEqual(simplifiedMul.result, 'x');
assert.strictEqual(simplifiedMul.changed, true);

const addIdentity = Proof.algebraicIdentity(AST.parse('∀x ∈ ℝ, x + 0 = x'));
assert.strictEqual(addIdentity.ok, true);
assert.strictEqual(addIdentity.operator, 'proveAlgebraicIdentity');
assert.strictEqual(addIdentity.theorem_class, 'additive_identity_over_reals');

const mulIdentity = Proof.algebraicIdentity(AST.parse('∀x ∈ ℝ, x * 1 = x'));
assert.strictEqual(mulIdentity.ok, true);
assert.strictEqual(mulIdentity.operator, 'proveAlgebraicIdentity');
assert.strictEqual(mulIdentity.theorem_class, 'multiplicative_identity_over_reals');

const division = Proof.domainGuard(AST.parse('x/y is undefined when y = 0'));
assert.strictEqual(division.ok, true);
assert.strictEqual(division.conclusion, 'undefined');

const universal = Proof.universalStatement(AST.parse('∀x ∈ ℝ, x^2 ≥ 0'));
assert.strictEqual(universal.ok, true);
assert.strictEqual(universal.operator, 'proveSquareNonnegative');
assert.strictEqual(Proof.quantifierScope(AST.parse('∀x ∈ ℝ, x^2 ≥ 0')).domain, 'R');

const imp = AST.parse('A=>B, B=>C').body.implications[0];
assert.strictEqual(Proof.modusPonens(imp, AST.symbol('A')).ok, true);
assert.strictEqual(Proof.modusPonens(imp, AST.symbol('A')).conclusion.name, 'B');

const chain = Proof.implicationChain(AST.parse('A=>B, B=>C'));
assert.strictEqual(chain.ok, true);
assert.strictEqual(chain.conclusion, 'A=>C');

const contradiction = Proof.contradiction(AST.parse('A, not A'));
assert.strictEqual(contradiction.ok, true);
assert.strictEqual(contradiction.contradiction, true);

const relation = Proof.evaluateLinearRelation(AST.parse('x >= 3 with x = 5'));
assert.strictEqual(relation.ok, true);
assert.strictEqual(relation.truth, true);

const rewritten = Proof.equivalenceRewrite(AST.symbol('A'), AST.symbol('A'), AST.symbol('B'));
assert.strictEqual(rewritten.ok, true);
assert.strictEqual(rewritten.conclusion.name, 'B');

const substituted = Proof.substitution(AST.relation('>=', AST.symbol('x'), AST.numberLiteral(3)), { x: 5 });
assert.strictEqual(substituted.ok, true);
assert.strictEqual(substituted.conclusion.left.value, 5);

console.log('proof-calculus-core-v0-1 tests passed');
