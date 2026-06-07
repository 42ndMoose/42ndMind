const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');

assert.strictEqual(K.VERSION, '0.1.0');
assert.strictEqual(typeof K.math, 'function');
assert.strictEqual(typeof K.completeMath, 'function');

const solved = K.math('2x + 1 = x + 4');
assert.strictEqual(solved.φ, 'M');
assert.strictEqual(solved.ok, true);
assert.strictEqual(solved.verified, true);
assert.strictEqual(solved.ast_type, 'LinearEquation');
assert.strictEqual(solved.closure_operator, 'solveLinearEquation');
assert.strictEqual(solved.selected_rule, 'linear-equation-solve');
assert.strictEqual(solved.gap_count, 0);
assert.ok(Array.isArray(solved.ΩM));
assert.strictEqual(Math.abs(K.l1(solved.ΩM) - 1) < 1e-6, true);
assert.ok(solved.ΩM.some(row => row.σ === 'M:verified'));
assert.ok(solved.ΩM.some(row => row.σ === 'M:closure:solveLinearEquation'));
assert.ok(solved.lexicon.entries.some(row => row.σ === 'Λ:M.ok1' && row.accepted === true));
assert.strictEqual(solved.Ξ, '');

const equality = K.math('a = b, b = c therefore a = c');
assert.strictEqual(equality.ok, true);
assert.strictEqual(equality.verified, true);
assert.strictEqual(equality.ast_type, 'EqualityProof');
assert.strictEqual(equality.closure_operator, 'proveEquality');
assert.strictEqual(equality.selected_rule, 'equality-transitivity');
assert.ok(equality.ΩM.some(row => row.σ === 'M:closure:proveEquality'));
assert.ok(equality.ΩM.some(row => row.σ === 'M:rule:equality-transitivity'));

const simplified = K.math('simplify x + 0');
assert.strictEqual(simplified.ok, true);
assert.strictEqual(simplified.verified, true);
assert.strictEqual(simplified.ast_type, 'Simplification');
assert.strictEqual(simplified.closure_operator, 'simplifyExpression');
assert.strictEqual(simplified.selected_rule, 'expression-simplification');
assert.ok(simplified.ΩM.some(row => row.σ === 'M:closure:simplifyExpression'));
assert.ok(simplified.ΩM.some(row => row.σ === 'M:rule:expression-simplification'));

const identity = K.math('∀x ∈ ℝ, x + 0 = x');
assert.strictEqual(identity.ok, true);
assert.strictEqual(identity.closure_operator, 'proveAlgebraicIdentity');
assert.strictEqual(identity.selected_rule, 'algebraic-identity');
assert.ok(identity.ΩM.some(row => row.σ === 'M:closure:proveAlgebraicIdentity'));

const sqrt = K.math('sqrt(x) is real');
assert.strictEqual(sqrt.φ, 'M');
assert.strictEqual(sqrt.ok, true);
assert.strictEqual(sqrt.verified, true);
assert.strictEqual(sqrt.gap_count, 0);
assert.strictEqual(sqrt.ast_type, 'SqrtDomainStatement');
assert.strictEqual(sqrt.closure_operator, 'proveSqrtDomain');
assert.strictEqual(sqrt.selected_rule, 'sqrt-domain-guard');
assert.ok(sqrt.ΩM.some(row => row.σ === 'M:closure:proveSqrtDomain'));
assert.strictEqual(sqrt.Ξ, '');

const complete = K.completeMath('a = b, b = c therefore a = c', { steps: 4 });
assert.strictEqual(complete.φ, 'MΩ*');
assert.strictEqual(complete.ok, true);
assert.strictEqual(complete.verified, true);
assert.strictEqual(complete.complete, true);
assert.ok(complete.Ωstar && complete.Ωstar.φ === 'Ω*');
assert.strictEqual(complete.Ωstar.complete, true);
assert.strictEqual(complete.Ξ, '');

console.log('kernel-math-closure-bridge-v0-1 tests passed');
