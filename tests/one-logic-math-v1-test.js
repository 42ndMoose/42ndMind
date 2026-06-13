const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');
const P = require('../src/math-law-invariant-prover-v0-1.js');
const G = require('../src/math-law-gate-v0-1.js');

assert.strictEqual(M.VERSION, '1.5.0');
assert.ok(M.F.includes('B=Cl(B)'));
assert.ok(M.F.includes('Cl(Cl(B))=Cl(B)'));
assert.ok(M.F.includes('One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)'));
assert.ok(M.F.includes('One(L)=and(sub(L,B),norm(L)=1,P(L)=1)'));
assert.ok(M.F.includes('forall(q,imp(in(q,B),One(q)))'));
assert.ok(M.F.includes('B[x]=Cl(union(B,{qx}))'));
assert.ok(M.F.includes('imp(Adm(x,B),One(B[x]))'));
assert.ok(M.F.includes('D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))'));
assert.ok(M.F.includes('Pres(Om(q,B),B)=1'));
assert.ok(M.F.includes('EqB(a,b)=eq(D(a,B),D(b,B))'));
assert.ok(M.F.includes('imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))'));
assert.ok(M.F.includes('Red(B)=quot(B,EqB)'));
assert.ok(M.F.includes('G(q,B)=and(Adm(q,B),not(exists(r,and(in(r,B),EqB(q,r)))))'));
assert.ok(M.F.includes('Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))'));
assert.ok(M.F.includes('Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))))'));
assert.deepStrictEqual(M.A[0], ['=', 'B', ['Cl', 'B']]);
assert.deepStrictEqual(M.A[1], ['=', ['Cl', ['Cl', 'B']], ['Cl', 'B']]);
assert.deepStrictEqual(Object.keys(M.M).sort(), ['A', 'F', 'v'].sort());

assert.strictEqual(P.VERSION, '0.1.0');
['closure','closureSignature','verifyClosureIdempotence','candidateAsInput','candidateAfterState','verifyAdmission','defineUnit','definitionSignature','stabilityOf','unknownOf','preservesUnknown','eqB','collapseEquivalentUnits','verifyEquivalenceCollapse','red','verifyReductionNorm','isGrowth','verifyNoGrowthNoChange','focus','expressionOf','validExpression','verifyActive','verifyLiving','evaluateState','evaluateTransition'].forEach(name => assert.strictEqual(typeof P[name], 'function', name));

const canonical = fs.readFileSync(path.join(__dirname, '..', 'src', 'one-logic-math-v1.js'), 'utf8');
const state = {
  files: { 'src/one-logic-math-v1.js': canonical },
  internal_state: { symbols: ['B', 'B'], relations: [], expressions: [], virtual_edits: [] }
};
const stateReport = P.evaluateState(state, { math: M });
assert.strictEqual(stateReport.theorem_prover, false);
assert.strictEqual(stateReport.invariant_prover, true);
assert.strictEqual(stateReport.math_version, '1.5.0');
assert.strictEqual(stateReport.ok, true);
assert.strictEqual(stateReport.One, true);
assert.strictEqual(stateReport.Closure, true);
assert.strictEqual(stateReport.Reduction, true);
assert.ok(stateReport.reduction.duplicate_count >= 1);

const gateReport = G.verifyState(state, { math: M, prover: P });
assert.strictEqual(gateReport.ok, true);
assert.strictEqual(gateReport.invariant_prover, true);
assert.strictEqual(gateReport.theorem_prover, false);
assert.strictEqual(gateReport.One, true);
assert.strictEqual(gateReport.Living, true);

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.includes('brain_math'));
assert.ok(index.includes('src/one-logic-math-v1.js'));
assert.ok(index.includes('OneLogicMathV1.textBlock()'));
assert.ok(!index.includes('B_t'));
assert.ok(!index.includes('B_t1'));
assert.ok(!index.includes('projection'));
assert.ok(!index.includes('latest-recursive-unit-brain-projection'));

console.log('one-logic-math-v1-test: all checks passed');
