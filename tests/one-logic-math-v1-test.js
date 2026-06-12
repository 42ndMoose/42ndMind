const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');

assert.strictEqual(M.VERSION, '1.3.0');
assert.ok(M.F.includes('B=Cl(B)'));
assert.ok(M.F.includes('norm(B)=1'));
assert.ok(M.F.includes('B[x]=Cl(union(B,{q_x}))'));
assert.ok(M.F.includes('norm(B[x])=1'));
assert.ok(M.F.includes('P(B[x])=1'));
assert.ok(M.F.includes('D(q,B)=N(U(q),R(q,B),X(q,B),C(q,B),O(q,B),F(q,B),P(q,B),G(q,B))'));
assert.ok(M.F.includes('O(q,B)=not(S(R(q,B)))'));
assert.ok(M.F.includes('S(q,B)=and(C(q,B),P(q,B),not(O(q,B)))'));
assert.ok(M.F.includes('E(B,phi)=Pi_E(F(B,phi))'));
assert.deepStrictEqual(M.A[0], ['=', 'B', ['Cl', 'B']]);
assert.deepStrictEqual(M.A[8], ['=', ['B', 'x'], ['Cl', ['union', 'B', ['set', 'q_x']]]]);
assert.deepStrictEqual(Object.keys(M.M).sort(), ['A', 'F', 'v'].sort());

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.includes('brain_math'));
assert.ok(index.includes('src/one-logic-math-v1.js'));
assert.ok(index.includes('OneLogicMathV1.textBlock()'));
assert.ok(index.includes('B=Cl(B)'));
assert.ok(!index.includes('B_t'));
assert.ok(!index.includes('B_t1'));
assert.ok(!index.includes('projection'));
assert.ok(!index.includes('latest-recursive-unit-brain-projection'));

console.log('one-logic-math-v1-test: all checks passed');
