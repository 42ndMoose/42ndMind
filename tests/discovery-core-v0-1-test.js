const assert = require('assert');
const D = require('../src/discovery-core-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const s = D.create();

ok('discovery core loads', D.VERSION === '0.1.0');
ok('initial discovery state is unit-total', s.unit.ok === true);
ok('initial output has no English', s.ξ === '');

D.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');

ok('observation creates candidates', Object.keys(s.candidates).length > 0);
ok('observation can birth symbols', Object.keys(s.symbols).length > 0);
ok('observation creates fields', ['α', 'π', 'Δ', 'β', 'ν', 'χ', 'υ', 'Ωd'].every(key => Math.abs(D.l1(s[key]) - 1) < 1e-6));
ok('observation keeps discovery state unit-total', s.unit.ok === true);
ok('packet is symbolic only', D.packet(s).ξ === '');

const beforeSymbols = Object.keys(s.symbols).length;
D.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
const afterSymbols = Object.keys(s.symbols).length;

ok('repeated observation preserves or grows symbol set', afterSymbols >= beforeSymbols);
ok('relations are tracked as unit field', Math.abs(D.l1(s.ν) - 1) < 1e-6);
ok('trace records discovery count', s.trace.length > 0 && typeof s.trace[0].candidates === 'number');

const noisy = D.create();
D.observe(noisy, 'xqz 91 %% ?? blorp');

ok('irregular stream tolerated', noisy.unit.ok === true);
ok('irregular stream does not require English', D.packet(noisy).ξ === '');
ok('unknown field remains unit-total', Math.abs(D.l1(noisy.υ) - 1) < 1e-6);

console.log(rows.join('\n'));
