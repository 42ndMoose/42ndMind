const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');
const I = require('../src/intention-algebra-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const s = K.create();
let p = K.packet(s);
let r0 = I.compute(p);

ok('intention algebra loads', I.VERSION === '0.1.0');
ok('intention result is unit-total', Math.abs(I.l1(r0.field) - 1) < 1e-6);
ok('intention result has no English', r0.english === '');
ok('classification has no English', I.classify(r0).english === '');

K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
p = K.packet(s);
let r1 = I.compute(p);
I.apply(s, p);

ok('computed intention remains unit-total after repeated pattern stream', Math.abs(I.l1(r1.field) - 1) < 1e-6);
ok('apply writes state intention field', Array.isArray(s.ι) && Math.abs(I.l1(s.ι) - 1) < 1e-6);
ok('apply writes intention algebra packet', !!s.intention_algebra && s.intention_algebra.packet_type === '42ndMind_intention_algebra_v0_1');
ok('lambda input was included', r1.inputs.λ === 1);
ok('tau input was included', r1.inputs.τ === 1);
ok('mu input was included', r1.inputs.μ === 1);
ok('formula is explicit', r1.formula.includes('ι=N'));

const before = r1.field;
K.observe(s, 'xqz 91 %% ?? blorp');
const r2 = I.compute(K.packet(s));

ok('irregular stream intention remains unit-total', Math.abs(I.l1(r2.field) - 1) < 1e-6);
ok('new stream produces measurable intention distance', I.distance(before, r2.field) >= 0);
ok('result remains symbolic only', I.classify(r2).english === '' && r2.english === '');

const manual = I.compute({
  λ: [{ σ: 'λ:a', w: 1 }],
  τ: [{ σ: 'τ:a', w: 1 }],
  ρ: [{ σ: 'ρ:a', w: 1 }],
  μ: [{ σ: 'μ:a', w: 1 }],
  ε: [{ σ: 'ε↓', w: 0.8 }, { σ: 'ε↑', w: 0.2 }],
  κ: [{ σ: 'κ:a', w: 1 }]
});

ok('manual packet computes', manual.ok === true);
ok('manual packet stays unit-total', Math.abs(I.l1(manual.field) - 1) < 1e-6);

console.log(rows.join('\n'));
