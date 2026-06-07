const assert = require('assert');
const AST = require('../src/math-ast-core-v0-1.js');
const Proof = require('../src/proof-calculus-core-v0-1.js');
const Closure = require('../src/math-closure-engine-v0-1.js');
const K = require('../src/math-language-kernel-v0-1.js');
const W = require('../src/whole-self-simulation-core-v0-1.js');

const sqrtCase = 'sqrt' + '(x)' + ' is real';
const composeCase = 'f' + '(' + 'g' + '(x)' + ')';
const memberCase = 'x ' + String.fromCharCode(8712) + ' A';
const inductionCase = 'prove by induction ' + 'P' + '(n)';

const cases = [
  [sqrtCase, 'SqrtDomainStatement', 'proveSqrtDomain', 'sqrt-domain-guard'],
  [composeCase, 'FunctionComposition', 'composeFunctionApplication', 'function-composition-canonicalization'],
  [memberCase, 'SetMembership', 'typeSetMembership', 'set-membership-typing'],
  [inductionCase, 'InductionSchema', 'generateInductionObligations', 'induction-schema-obligations']
];

for (const row of cases) {
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

assert.strictEqual(Proof.proveSqrtDomain(AST.parse(sqrtCase)).ok, true);
assert.strictEqual(Proof.composeFunctionApplication(AST.parse(composeCase)).ok, true);
assert.strictEqual(Proof.typeSetMembership(AST.parse(memberCase)).ok, true);
const induction = Proof.generateInductionObligations(AST.parse(inductionCase));
assert.strictEqual(induction.ok, true);
assert.strictEqual(induction.conclusion.type, 'ProofObligations');
assert.strictEqual(induction.conclusion.obligations.length, 2);

const state = W.evaluateState({ id: 'frontier_after_v0_4' });
assert.strictEqual(state.ok, true);
assert.strictEqual(state.stop, false);
assert.ok(state.frontier_count >= 0);
assert.ok(!state.wants.some(row => row.id === 'sqrt_real_domain'));
assert.ok(!state.wants.some(row => row.id === 'function_composition'));
assert.ok(!state.wants.some(row => row.id === 'set_membership'));
assert.ok(!state.wants.some(row => row.id === 'induction_schema'));

console.log('pure-math-frontier-v0-4 tests passed');
