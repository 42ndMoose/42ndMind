const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');

assert.strictEqual(M.VERSION, '1.2.0');
assert.ok(M.F.includes('B_t=N(U_t,R_t,X_t,C_t,O_t,F_t,P_t,G_t)'));
assert.ok(M.F.includes('K(B_t,x)=N(B_t,q_x_t,r_x_t,x_x_t,c_x_t,O(q_x_t,r_x_t),f_x_t,p_x_t,g_x_t)'));
assert.ok(M.F.includes('B_t1=K(B_t,x)'));
assert.ok(M.F.includes('norm(B_t1)=1'));
assert.ok(M.F.includes('P(B_t1)=1'));
assert.ok(M.F.includes('E(B_t,phi)=Pi_E(F(B_t,phi))'));
assert.deepStrictEqual(M.A[0], ['=', 'B_t', ['N', 'U_t', 'R_t', 'X_t', 'C_t', 'O_t', 'F_t', 'P_t', 'G_t']]);
assert.deepStrictEqual(M.A[15], ['=', 'B_t1', ['K', 'B_t', 'x']]);
assert.deepStrictEqual(Object.keys(M.M).sort(), ['A', 'F', 'v'].sort());

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.includes('brain_math'));
assert.ok(index.includes('src/one-logic-math-v1.js'));
assert.ok(index.includes('OneLogicMathV1.textBlock()'));
assert.ok(!index.includes('projection'));
assert.ok(!index.includes('authority'));
assert.ok(!index.includes('latest-recursive-unit-brain-projection'));

console.log('one-logic-math-v1-test: all checks passed');
