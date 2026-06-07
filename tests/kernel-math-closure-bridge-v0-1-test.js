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

const identity = K.math('∀x ∈ ℝ, x + 0 = x');
assert.strictEqual(identity.ok, true);
assert.strictEqual(identity.closure_operator, 'proveAlgebraicIdentity');
assert.strictEqual(identity.selected_rule, 'algebraic-identity');
assert.ok(identity.ΩM.some(row => row.σ === 'M:closure:proveAlgebraicIdentity'));

const unsupported = K.math('sqrt(x) is real');
assert.strictEqual(unsupported.φ, 'M');
assert.strictEqual(unsupported.ok, false);
assert.strictEqual(unsupported.verified, false);
assert.strictEqual(unsupported.gap_count, 1);
assert.strictEqual(unsupported.gaps[0].id, 'unclassified_math_ast');
assert.ok(unsupported.ΩM.some(row => row.σ === 'M:gap'));
assert.ok(unsupported.ΩM.some(row => row.σ === 'M:gap:unclassified_math_ast'));
assert.strictEqual(unsupported.Ξ, '');

const complete = K.completeMath('2 + 3 * 4 = 14', { steps: 4 });
assert.strictEqual(complete.φ, 'MΩ*');
assert.strictEqual(complete.ok, true);
assert.strictEqual(complete.verified, true);
assert.strictEqual(complete.complete, true);
assert.ok(complete.Ωstar && complete.Ωstar.φ === 'Ω*');
assert.strictEqual(complete.Ωstar.complete, true);
assert.strictEqual(complete.Ξ, '');

console.log('kernel-math-closure-bridge-v0-1 tests passed');
