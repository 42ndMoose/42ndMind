const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');

assert.strictEqual(M.VERSION, '1.4.0');
assert.ok(M.F.includes('B=Cl(B)'));
assert.ok(M.F.includes('norm(B)=1'));
assert.ok(M.F.includes('P(B)=1'));
assert.ok(M.F.includes('L=PiL(B)'));
assert.ok(M.F.includes('Bx=Cl(union(B,{qx}))'));
assert.ok(M.F.includes('D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))'));
assert.ok(M.F.includes('Om(q,B)=not(S(R(q,B)))'));
assert.ok(M.F.includes('S(q,B)=and(C(q,B),P(q,B),not(Om(q,B)))'));
assert.ok(M.F.includes('Adm(x,B)=and(norm(Bx)=1,P(Bx)=1)'));
assert.ok(M.F.includes('Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)'));
assert.ok(M.F.includes('Live(B)=and(B=Cl(B),norm(B)=1,P(B)=1,forall(x,imp(Adm(x,B),Cl(Bx)=Bx)))'));
assert.deepStrictEqual(M.A[0], ['=', 'B', ['Cl', 'B']]);
assert.deepStrictEqual(M.A[9], ['=', 'Bx', ['Cl', ['union', 'B', ['set', 'qx']]]]);
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
