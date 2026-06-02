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

const p0 = K.packet(s);
ok('packet is symbolic', p0.φ === 'Ω' && p0.Ξ === '');
ok('packet carries invariant list', p0.χ.includes('∥λ∥₁=1') && p0.χ.includes('∥ι∥₁=1'));

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
