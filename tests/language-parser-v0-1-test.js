const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');
const P = require('../src/language-parser-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const source = 'Ω{τ[τ1=1];ρ[ρ∅=1];μ[μ1=0.7,μ2=0.3];ε[ε↓=0.8,ε↑=0.2];λ[λ1=1];ι[ιτ=0.5,ιμ=0.5];κ[κλ=1];Ω[λ:λ1=0.5,ι:ιτ=0.5]}';
const parsed = P.parse(source);

ok('parser loads', P.VERSION === '0.1.0');
ok('parse returns omega packet', parsed.φ === 'Ω');
ok('parse keeps English empty', parsed.Ξ === '');
ok('all required fields exist', P.ORDER.every(key => Array.isArray(parsed.fields[key])));
ok('parsed fields are unit-total', parsed.u.ok === true);

const canonical = P.canonical(parsed);
const text = P.serialize(canonical);
const rt = P.roundTrip(text);

ok('serialize returns packet wrapper', text.startsWith('Ω{') && text.endsWith('}'));
ok('round trip is stable', rt.same === true);
ok('round trip keeps unit totals', rt.reparsed.u.ok === true);
ok('validation passes valid source', P.validate(source).ok === true);
ok('validation rejects invalid source', P.validate('bad').ok === false);

const s = K.create();
K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
const packet = K.packet(s);
const canonicalPacket = P.fromKernelPacket(packet);
const packetText = P.serialize(canonicalPacket);
const reparsedPacket = P.parse(packetText);

ok('kernel packet converts to language packet', canonicalPacket.φ === 'Ω');
ok('kernel packet serializes', packetText.includes('λ[') && packetText.includes('ι['));
ok('kernel packet reparses', reparsedPacket.u.ok === true);
ok('kernel packet round trip is stable', P.roundTrip(packetText).same === true);

const missing = 'Ω{τ[τ1=1]}';
ok('missing fields fail by default', P.validate(missing).ok === false);
const loose = P.parse(missing, { requireAll: false });
ok('missing fields can be filled in loose mode', loose.u.ok === true && P.ORDER.every(key => Array.isArray(loose.fields[key])));

console.log(rows.join('\n'));
