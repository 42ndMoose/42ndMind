const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');

assert.strictEqual(M.VERSION, '1.1.0');
assert.deepStrictEqual(M.A[0], ['eq', '1', '1']);
assert.deepStrictEqual(M.A[1], ['eq', 'B', '1']);
assert.deepStrictEqual(M.A[2], ['eq', 'L', '1']);
assert.deepStrictEqual(M.A[3], ['eq', 'q', '1']);
assert.deepStrictEqual(M.A[4], ['sub', 'L', 'B']);
assert.ok(M.F.includes('forall(q,imp(sub(q,B),eq(q,1)))'));
assert.ok(M.F.includes('and(eq(K(B,x),Bp),eq(Bp,1))'));
assert.deepStrictEqual(M.C[0], ['Gm', 'B', ['U', 'R', 'X', 'C', 'O', 'F', 'P', 'G']]);
assert.deepStrictEqual(M.O[0], ['iota', 'x', 'q']);
assert.deepStrictEqual(Object.keys(M.M).sort(), ['A', 'C', 'F', 'O', 'v'].sort());

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.includes('"v": "1.1.0"'));
assert.ok(index.includes('"eq(B,1)"'));
assert.ok(index.includes('["eq","B","1"]'));
assert.ok(index.includes('["Gm","B",["U","R","X","C","O","F","P","G"]]'));

console.log('one-logic-math-v1-test: all checks passed');
