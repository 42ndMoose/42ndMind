const assert = require('assert');
const AST = require('../src/math-ast-core-v0-1.js');
const Proof = require('../src/proof-calculus-core-v0-1.js');
const Closure = require('../src/math-closure-engine-v0-1.js');
const K = require('../src/math-language-kernel-v0-1.js');
const W = require('../src/whole-self-simulation-core-v0-1.js');

const limCase = 'lim ' + 'x->0 ' + 'sin' + '(x)' + '/' + 'x = 1';
const derCase = 'd' + '/' + 'dx ' + 'x' + '^' + '2 = 2x';
const intCase = 'integral ' + '2x ' + 'dx = ' + 'x' + '^' + '2 + C';

const rows = [
  [limCase, 'LimitStatement', 'proveLimitStatement', 'limit-sine-over-x'],
  [derCase, 'DerivativeStatement', 'proveDerivativeStatement', 'derivative-power-rule-n2'],
  [intCase, 'IntegralStatement', 'proveIntegralStatement', 'integral-power-rule-linear']
];

for (const row of rows) {
  const source = row[0];
  const astType = row[1];
  const closureOperator = row[2];
  const selectedRule = row[3];
  const ast = AST.parse(source);
  assert.strictEqual(ast.ok, true, source);
  assert.strictEqual(ast.body.type, astType, source);
  assert.strictEqual(AST.classify(ast).closure, closureOperator, source);
  const closed = Closure.close(source);
  assert.strictEqual(closed.ok, true, source);
  assert.strictEqual(closed.verified, true, source);
  assert.strictEqual(closed.obligation.operator, closureOperator, source);
  assert.strictEqual(closed.selected_rule, selectedRule, source);
  const packet = K.math(source);
  assert.strictEqual(packet.ok, true, source);
  assert.strictEqual(packet.verified, true, source);
  assert.strictEqual(packet.closure_operator, closureOperator, source);
  assert.strictEqual(packet.selected_rule, selectedRule, source);
}

assert.strictEqual(Proof.proveLimitStatement(AST.parse(limCase)).ok, true);
assert.strictEqual(Proof.proveDerivativeStatement(AST.parse(derCase)).ok, true);
assert.strictEqual(Proof.proveIntegralStatement(AST.parse(intCase)).ok, true);

const state = W.evaluateState({ id: 'frontier_after_v0_5' });
assert.strictEqual(state.ok, true);
assert.strictEqual(state.stop, false);
assert.ok(!state.wants.some(row => row.id === 'complex_numbers'));
assert.ok(state.wants.some(row => row.id === 'sequences'));
assert.ok(state.wants.some(row => row.id === 'logic_quantifier_exists'));
assert.ok(!state.wants.some(row => row.id === 'limits'));
assert.ok(!state.wants.some(row => row.id === 'derivative'));
assert.ok(!state.wants.some(row => row.id === 'integral'));

const matrix = Closure.close('A B = C');
if (matrix.ok) assert.strictEqual(matrix.selected_rule, 'matrix-product-dimension-guard');
else assert.strictEqual(matrix.gaps[0].id, 'unclassified_math_ast');

console.log('pure-math-frontier-v0-5 tests passed');
