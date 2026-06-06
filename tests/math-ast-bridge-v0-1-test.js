const assert = require('assert');
const P = require('../src/language-parser-v0-1.js');
const OA = require('../src/operator-anatomy-v0-1.js');

assert.strictEqual(typeof P.parseMathAst, 'function');
assert.strictEqual(typeof P.classifyMathAst, 'function');
assert.strictEqual(typeof P.mathAstToKernelFields, 'function');

const ast = P.parseMathAst('2x + 1 = 7');
assert.strictEqual(ast.ok, true);
assert.strictEqual(ast.body.type, 'Equation');
assert.strictEqual(P.classifyMathAst(ast).closure, 'solveAffineEquation');

const fields = P.mathAstToKernelFields('A=>B, B=>C');
assert.strictEqual(Array.isArray(fields), true);
assert.strictEqual(fields.length, 1);
assert.ok(fields[0].some(row => row.σ === 'closure:composeimplicationchain'));

const surfaces = OA.availableSurfaces('', { samples: [
  '2x + 1 = 7',
  'x/y is undefined when y = 0',
  'A, not A'
]});
assert.ok(surfaces.includes('affine_equation'));
assert.ok(surfaces.includes('division_constraint'));
assert.ok(surfaces.includes('contradiction_pair'));

console.log('math-ast-bridge-v0-1 tests passed');
