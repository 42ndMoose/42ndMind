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

const source = 'Ω{τ[τ1=1];ρ[ρ∅=1];μ[μ1=0.7,μ2=0.3];ε[ε↓=0.8,ε↑=0.2];λ[λ1=1];ι[ιτ=0.5,ιμ=0.5];κ[κλ=1];Ω[λ:λ1=0.5,ι:ιτ=0.5]}';
const target = 'Ω{τ[τ1=1];ρ[ρ∅=1];μ[μ1=0.5,μ2=0.5];ε[ε↓=0.7,ε↑=0.3];λ[λ1=1];ι[ιτ=0.4,ιμ=0.6];κ[κλ=1];Ω[λ:λ1=0.5,ι:ιμ=0.5]}';

const fields = P.toKernelFields(source);
ok('compiler emits one kernel field per language layer', Array.isArray(fields) && fields.length === P.ORDER.length);
ok('compiled fields are unit-total', fields.every(field => Math.abs(K.l1(field) - 1) < 1e-6));
ok('compiled fields preserve layer-prefixed axes', fields.some(field => field.some(row => row.σ === 'μ:μ1')));

const seed = P.toKernelSeed(source);
ok('compiler emits whole seed field', Array.isArray(seed) && seed.length > fields.length);
ok('whole seed can normalize in kernel', Math.abs(K.l1(K.normalize(seed)) - 1) < 1e-6);

const compiledCompletion = P.toKernelCompletion(source, K, { steps: 8 });
ok('compiled source closes under Ω*', compiledCompletion.φ === 'Ω*' && compiledCompletion.complete === true);
ok('compiled source emits formal grounding', has(compiledCompletion, 'Λ:Gf'));
ok('compiled source emits canonical equality', has(compiledCompletion, 'Λ:≡1'));
ok('compiled source has no unresolved gap', compiledCompletion.unresolved_count === 0);

const targetSeed = P.toKernelSeed(target);
const compiledTargetCompletion = P.toKernelCompletion(source, K, {
  whole: true,
  complete: { target: targetSeed, observations: [{ source: 'language-target', value: targetSeed }], steps: 8 }
});
ok('compiled source closes against compiled target', compiledTargetCompletion.φ === 'Ω*' && compiledTargetCompletion.complete === true);
ok('compiled target completion derives observed grounding', has(compiledTargetCompletion, 'Λ:Go'));
ok('compiled target completion derives correction and proof', has(compiledTargetCompletion, 'Λ:T↓') && has(compiledTargetCompletion, 'Λ:⊢1'));
ok('compiled target completion reaches target seed', compiledTargetCompletion.fields.some(field => K.equivalent(field, targetSeed).true === true));

const loose = 'Ω{τ[τ1=1]}';
const looseCompletion = P.toKernelCompletion(loose, K, { parse: { requireAll: false }, steps: 8 });
ok('loose symbolic source fills missing layers and closes', looseCompletion.φ === 'Ω*' && looseCompletion.complete === true);
ok('loose symbolic source emits closed gap', has(looseCompletion, 'Λ:Δ0'));

const bad = 'plain english without packet structure';
let badRejected = false;
try {
  P.toKernelCompletion(bad, K);
} catch (err) {
  badRejected = String(err && err.message || err).indexOf('Packet must match Ω{...}') >= 0;
}
ok('non-packet raw input is rejected by compiler path', badRejected === true);

console.log(rows.join('\n'));
