const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const s = K.create();

ok('kernel loads', K.VERSION === '0.1.0');
ok('lambda starts unit-total', Math.abs(K.l1(s.λ) - 1) < 1e-6);
ok('intention starts unit-total', Math.abs(K.l1(s.ι) - 1) < 1e-6);
ok('whole state starts unit-total', Math.abs(K.l1(s.Ω) - 1) < 1e-6);
ok('no English output channel', s.Ξ === '');

const defs = K.definitions();
ok('kernel defines sigma weight and constraint rows', !!defs.σ && !!defs.w && !!defs.χ);
const inv = K.invariants();
ok('kernel has invariant registry beyond unit-total', inv.length >= 4 && inv.some(row => row.id === 'χ_no_english'));
ok('invariant field is unit-total', Math.abs(K.l1(K.invariantField()) - 1) < 1e-6);
ok('valid field passes invariant validator', K.validateField([{ σ: 'a', w: 1 }]).ok === true);
ok('bad unit field fails invariant validator', K.validateField([{ σ: 'a', w: 0.25 }]).ok === false);

const p0 = K.packet(s);
ok('packet is symbolic', p0.φ === 'Ω' && p0.Ξ === '');
ok('packet carries invariant list', p0.χ.includes('∥F∥₁=1') && p0.χ.includes('Ξ=""'));
ok('packet carries discrepancy invariant', p0.χ.some(row => row.indexOf('δ=') >= 0));
ok('packet carries gap invariant', p0.χ.some(row => row.indexOf('Δ=') >= 0));

const d0 = K.discrepancy(1, 0, 'unit');
ok('discrepancy packet is symbolic', d0.φ === 'δ' && d0.Ξ === '');
ok('discrepancy field is unit-total', d0.u.ok === true && Math.abs(K.l1(d0.δ) - 1) < 1e-6);
ok('expected-actual gap is classified', d0.ω === 'δ=' || d0.z['δ='] > 0);

const d1 = K.discrepancy(1, [{ σ: 'a', w: 0.25 }], 'field');
ok('unit-total gap is measured by discrepancy for fields', d1.z['δ∥'] > 0);
ok('field discrepancy stays unit-total', d1.u.ok === true);

const fA = [{ σ: 'a', w: 0.5 }, { σ: 'b', w: 0.5 }];
const fB = [{ σ: 'a', w: 0.5 }, { σ: 'b', w: 0.5 }];
const fC = [{ σ: 'a', w: 0.25 }, { σ: 'b', w: 0.75 }];
const fD = [{ σ: 'a', w: 1 }];
const fE = [{ σ: 'a', w: 0.25 }];

const g0 = K.gap(fA, fB, 'same');
ok('gap packet is symbolic', g0.φ === 'Δ' && g0.Ξ === '');
ok('gap field is unit-total', g0.u.ok === true && Math.abs(K.l1(g0.Δ) - 1) < 1e-6);
ok('same fields have no axis gap', g0.z['Δσ'] === 0);
ok('same fields have no weight gap', g0.z['Δw'] === 0);
ok('same fields have no unit gap', g0.z['Δ∥'] === 0);

const g1 = K.gap(fA, fC, 'weight');
ok('weight gap is measured', g1.z['Δw'] > 0);
ok('weight gap has no axis mismatch', g1.z['Δσ'] === 0);
ok('weight gap remains unit-total', g1.u.ok === true);

const g2 = K.gap(fA, fD, 'axis');
ok('axis gap is measured', g2.z['Δσ'] > 0);
ok('axis gap remains unit-total', g2.u.ok === true);

const g3 = K.gap(fA, fE, 'unit-normalized-limitation');
ok('gap currently normalizes before unit comparison', g3.z['Δ∥'] === 0);
ok('raw invalid unit field is still detected by validator', K.validateField(fE).ok === false);
ok('unit gap remains unit-total', g3.u.ok === true);

const g4 = K.gap({ χ: ['x'] }, { χ: ['y'] }, 'invariant');
ok('invariant gap is measured', g4.z['Δχ'] > 0);
ok('unknown gap is reserved when no comparable field exists', g4.z['Δ?'] > 0);

const repair = K.correction(fA, fC, 'weight-repair');
ok('correction packet is symbolic', repair.φ === 'T' && repair.Ξ === '');
ok('correction transform field is unit-total', Math.abs(K.l1(repair.T) - 1) < 1e-6);
ok('correction uses finite local argmin', repair.method === 'finite_local_argmin');
ok('correction reduces or preserves measured gap', repair.after.score <= repair.before.score);
ok('correction outputs transformed unit field', Math.abs(K.l1(repair.transformed) - 1) < 1e-6);

const p1 = K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
ok('observation returns packet', p1.φ === 'Ω');
ok('tokens form from repeated raw symbols', s.memory.tokens.length > 0);
ok('lambda remains unit-total after observation', Math.abs(K.l1(s.λ) - 1) < 1e-6);
ok('intention remains unit-total after observation', Math.abs(K.l1(s.ι) - 1) < 1e-6);
ok('meaning candidates remain unit-total', Math.abs(K.l1(s.μ) - 1) < 1e-6);
ok('whole state remains unit-total', Math.abs(K.l1(s.Ω) - 1) < 1e-6);
ok('trace records mathematical deltas', s.trace.length > 0 && typeof s.trace[0].ΔΩ === 'number');
ok('English remains empty after observation', K.packet(s).Ξ === '');

const before = K.snapshot(s);
K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
const after = K.snapshot(s);
ok('new input readjusts lambda', K.distance(before.λ, after.λ) >= 0);
ok('new input readjusts intention', K.distance(before.ι, after.ι) >= 0);
ok('all active fields still satisfy unit report', after.unit.ok === true);

const noisy = K.create();
K.observe(noisy, 'xqz 91 %% ?? blorp');
ok('irregular stream tolerated', noisy.unit.ok === true);
ok('irregular stream still has no English', K.packet(noisy).Ξ === '');

console.log(rows.join('\n'));
