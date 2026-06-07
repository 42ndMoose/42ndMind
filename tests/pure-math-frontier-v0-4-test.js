const assert = require('assert');
const AST = require('../src/math-ast-core-v0-1.js');
const Proof = require('../src/proof-calculus-core-v0-1.js');
const Closure = require('../src/math-closure-engine-v0-1.js');
const K = require('../src/math-language-kernel-v0-1.js');
const W = require('../src/whole-self-simulation-core-v0-1.js');

const cases = [
  ['sqrt(x) is real', 'SqrtDomainStatement', 'proveSqrtDomain', 'sqrt-domain-guard'],
  ['f(g(x))', 'FunctionComposition', 'composeFunctionApplication', 'function-composition-canonicalization'],
  ['x ∈ A', 'SetMembership', 'typeSetMembership', 'set-membership-typing'],
  ['prove by induction P(n)', 'InductionSchema', 'generateInductionObligations', 'induction-schema-obligations']
];

for (const [source, astType, closureOperator, selectedRule] of cases) {
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

assert.strictEqual(Proof.proveSqrtDomain(AST.parse('sqrt(x) is real')).ok, true);
assert.strictEqual(Proof.composeFunctionApplication(AST.parse('f(g(x))')).ok, true);
assert.strictEqual(Proof.typeSetMembership(AST.parse('x ∈ A')).ok, true);
const induction = Proof.generateInductionObligations(AST.parse('prove by induction P(n)'));
assert.strictEqual(induction.ok, true);
assert.strictEqual(induction.conclusion.type, 'ProofObligations');
assert.strictEqual(induction.conclusion.obligations.length, 2);

const state = W.evaluateState({ id: 'frontier_after_v0_4' });
assert.strictEqual(state.ok, true);
assert.strictEqual(state.stop, false);
assert.ok(state.wants.some(row => row.id === 'limits'));
assert.ok(state.wants.some(row => row.id === 'derivative'));
assert.ok(!state.wants.some(row => row.id === 'sqrt_real_domain'));
assert.ok(!state.wants.some(row => row.id === 'function_composition'));
assert.ok(!state.wants.some(row => row.id === 'set_membership'));
assert.ok(!state.wants.some(row => row.id === 'induction_schema'));

console.log('pure-math-frontier-v0-4 tests passed');
