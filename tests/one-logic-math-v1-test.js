const assert = require('assert');
const fs = require('fs');
const path = require('path');
const MathCore = require('../src/one-logic-math-v1.js');

assert.strictEqual(MathCore.VERSION, '1.0.0');
assert.strictEqual(MathCore.packet.packet_type, '42ndMind_one_logic_canonical_math_v1');
assert.ok(MathCore.primitive.includes('1 = 1'));
assert.ok(MathCore.primitive.includes('B = 1'));
assert.ok(MathCore.primitive.includes('L = 1'));
assert.ok(MathCore.primitive.includes('q = 1'));
assert.ok(MathCore.primitive.includes('∀q ⊂ B, q = 1'));
assert.ok(MathCore.primitive.includes('closure(B, x) = B′ where B′ = 1'));
assert.ok(MathCore.coordinate.includes('coordinates are descriptions of distinction; they are not the primitive law'));
assert.ok(MathCore.integrity.includes('The math is standalone before implementation.'));
assert.ok(MathCore.integrity.includes('No implementation-generated symbol is allowed to replace the primitive law.'));

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.includes('One Logic Canonical Math'));
assert.ok(index.includes('B = 1'));
assert.ok(index.includes('L = 1'));
assert.ok(index.includes('q = 1'));
assert.ok(index.includes('Implementation, projection, artifacts, and debug state are not the authority.'));
assert.ok(!index.includes('latest-recursive-unit-brain-projection'));
assert.ok(!index.includes('Generated body law'));
assert.ok(!index.includes('Loading current body'));

console.log('one-logic-math-v1-test: all checks passed');
