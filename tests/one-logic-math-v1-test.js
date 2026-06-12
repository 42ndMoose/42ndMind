const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');

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

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.includes('brain_math'));
assert.ok(index.includes('src/one-logic-math-v1.js'));
assert.ok(index.includes('OneLogicMathV1.textBlock()'));
assert.ok(!index.includes('B_t'));
assert.ok(!index.includes('B_t1'));
assert.ok(!index.includes('projection'));
assert.ok(!index.includes('latest-recursive-unit-brain-projection'));

console.log('one-logic-math-v1-test: all checks passed');
