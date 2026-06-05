const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');
const P = require('../src/language-parser-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

function has(packet, symbol) {
  return packet.lexicon.entries.some(row => row.σ === symbol && row.accepted === true);
}

const raw = 'Energy costs are rising because the monthly bill increased again.';
const packet = P.compileRaw(raw);
ok('raw compiler emits omega packet', packet.φ === 'Ω' && packet.Ξ === '');
ok('raw compiler emits unit-total fields', packet.u.ok === true && P.ORDER.every(key => Math.abs(P.l1(packet.fields[key]) - 1) < 1e-6));
ok('raw compiler preserves token axes', packet.fields.τ.some(row => row.σ === 'tok:energy') && packet.fields.τ.some(row => row.σ === 'tok:costs'));
ok('raw compiler preserves relation axes', packet.fields.ρ.some(row => row.σ.indexOf('rel:energy-costs') === 0));
ok('raw compiler marks semantics as unverified', packet.fields.ε.some(row => row.σ === 'raw:unverified-semantics'));

const symbolic = P.rawToSymbolic(raw);
ok('raw compiler serializes to symbolic omega packet', typeof symbolic === 'string' && symbolic.indexOf('Ω{') === 0);
ok('raw symbolic packet round-trips', P.roundTrip(symbolic).same === true);

const fields = P.rawToKernelFields(raw);
ok('raw compiler emits kernel fields', fields.length === P.ORDER.length && fields.every(field => Math.abs(K.l1(field) - 1) < 1e-6));
ok('raw kernel fields preserve layer prefixes', fields.some(field => field.some(row => row.σ === 'τ:tok:energy')));

const rawCompletion = P.rawToKernelCompletion(raw, K, { steps: 8 });
ok('raw input closes under omega-star', rawCompletion.φ === 'Ω*' && rawCompletion.complete === true);
ok('raw completion emits formal grounding', has(rawCompletion, 'Λ:Gf'));
ok('raw completion emits equality closure', has(rawCompletion, 'Λ:≡1'));
ok('raw completion has no unresolved gap', rawCompletion.unresolved_count === 0);

const question = 'Can you finish the kernel input compiler now?';
const qPacket = P.compileRaw(question);
ok('raw compiler detects question shape', qPacket.fields.ι.some(row => row.σ === 'intent:question'));
ok('raw compiler detects request shape', qPacket.fields.ι.some(row => row.σ === 'intent:request'));
const qCompletion = P.rawToKernelCompletion(question, K, { steps: 8 });
ok('question raw input closes under omega-star', qCompletion.φ === 'Ω*' && qCompletion.complete === true);

const target = 'Energy costs are rising because the observed bill increased.';
const targetSeed = P.rawToKernelSeed(target);
const rawTargetCompletion = P.rawToKernelCompletion(raw, K, {
  whole: true,
  complete: {
    target: targetSeed,
    observations: [{ source: 'raw-target', value: targetSeed }],
    steps: 8
  }
});
ok('raw input closes against raw target', rawTargetCompletion.φ === 'Ω*' && rawTargetCompletion.complete === true);
ok('raw target completion derives observed grounding', has(rawTargetCompletion, 'Λ:Go'));
ok('raw target completion derives correction and proof', has(rawTargetCompletion, 'Λ:T↓') && has(rawTargetCompletion, 'Λ:⊢1'));

let emptyRejected = false;
try {
  P.compileRaw('   ');
} catch (err) {
  emptyRejected = String(err && err.message || err).indexOf('no tokenizable content') >= 0;
}
ok('empty raw input is rejected', emptyRejected === true);

console.log(rows.join('\n'));
