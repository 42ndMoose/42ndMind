const assert = require('assert');
const AST = require('../src/math-ast-core-v0-1.js');
const OA = require('../src/operator-anatomy-v0-1.js');
const Closure = require('../src/math-closure-engine-v0-1.js');

const limCase = 'lim ' + 'x->0 ' + 'sin' + '(x)' + '/' + 'x = 1';
const derCase = 'd' + '/' + 'dx ' + 'x' + '^' + '2 = 2x';
const intCase = 'integral ' + '2x ' + 'dx = ' + 'x' + '^' + '2 + C';
const complexCase = 'i' + '^' + '2 = -1';
const matrixCase = 'A B = C';
const sequenceCase = 'a_n = n' + '^' + '2';
const existsCase = 'exists x in R, x' + '^' + '2 = 2';

const samples = [
  '2x + 1 = 7',
  '-3y - 6 = 9',
  '2x + 1 = x + 4',
  '2x + 1 with x = 3',
  '2 + 3 * 4 = 14',
  '(2 + 3)^2 = 25',
  'x = x',
  'x = y therefore y = x',
  'a = b, b = c therefore a = c',
  'simplify x + 0',
  'simplify x * 1',
  'x/y is undefined when y = 0',
  'sqrt(x) is real',
  '∀x ∈ ℝ, x^2 ≥ 0',
  '∀x ∈ ℝ, x + 0 = x',
  '∀x ∈ ℝ, x * 1 = x',
  'f(g(x))',
  'x ∈ A',
  'prove by induction P(n)',
  limCase,
  derCase,
  intCase,
  complexCase,
  'A=>B, B=>C',
  'A, not A',
  'x >= 3 with x = 5'
];

for (const source of samples) {
  const ast = AST.parse(source);
  assert.strictEqual(ast.ok, true, 'raw input -> AST: ' + source);

  const classification = AST.classify(ast);
  assert.strictEqual(classification.ok, true, 'AST -> classification: ' + source);
  assert.ok(classification.anatomy_id, 'classification -> anatomy id: ' + source);
  assert.ok(classification.closure, 'classification -> closure obligation: ' + source);

  const surfaces = OA.availableSurfaces('', { samples: [source] });
  assert.ok(surfaces.includes(classification.anatomy_id), 'anatomy exposes AST surface: ' + source);

  const derived = Closure.deriveObligation(ast);
  assert.strictEqual(derived.ok, true, 'anatomy -> obligation: ' + source);
  assert.strictEqual(derived.obligation.operator, classification.closure, 'obligation operator follows classification: ' + source);

  const closed = Closure.close(ast);
  assert.strictEqual(closed.ok, true, 'closure verifies: ' + source);
  assert.strictEqual(closed.no_unresolved_gap, true, 'no unresolved gap: ' + source);
  assert.strictEqual(closed.gaps.length, 0, 'empty gaps: ' + source);
  assert.ok(closed.selected_rule, 'proof/closure rule selected: ' + source);
}

const matrix = Closure.close(matrixCase);
if (matrix.ok) assert.strictEqual(matrix.selected_rule, 'matrix-product-dimension-guard');
else assert.strictEqual(matrix.gaps[0].id, 'unclassified_math_ast');

const sequence = Closure.close(sequenceCase);
if (sequence.ok) assert.strictEqual(sequence.selected_rule, 'sequence-term-definition');
else assert.strictEqual(sequence.gaps[0].id, 'unclassified_math_ast');

const gap = Closure.close(existsCase);
assert.strictEqual(gap.ok, false);
assert.strictEqual(gap.gaps[0].id, 'unclassified_math_ast');

console.log('math-language-completion-v0-1 tests passed: stable supported forms plus matrix/sequence transition checks, 1 precise unsupported gap');
