const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

function requireComplete(name, packet) {
  ok(name + ' packet is Ω*', packet.φ === 'Ω*' && packet.Ξ === '');
  ok(name + ' reaches fixed point', packet.fixed === true);
  ok(name + ' completes under current constraints', packet.complete === true);
  ok(name + ' preserves unit-total', packet.u.ok === true && Math.abs(K.l1(packet.Ω) - 1) < 1e-6);
  ok(name + ' has no unresolved gap', packet.unresolved_count === 0);
  ok(name + ' has no lexeme conflict', packet.conflict_count === 0);
  ok(name + ' emits lexicon', packet.lexicon && packet.lexicon.u.ok === true && packet.lexicon.entries.length > 0);
  return packet;
}

function has(packet, symbol) {
  return packet.lexicon.entries.some(row => row.σ === symbol && row.accepted === true);
}

const F = [{ σ: 'a', w: 0.5 }, { σ: 'b', w: 0.5 }];
const FsameMessy = [{ σ: 'b', w: 0.25 }, { σ: 'a', w: 0.25 }, { σ: 'b', w: 0.25 }, { σ: 'a', w: 0.25 }];
const G = [{ σ: 'a', w: 0.25 }, { σ: 'b', w: 0.75 }];
const H = [{ σ: 'a', w: 0.4 }, { σ: 'b', w: 0.4 }, { σ: 'c', w: 0.2 }];
const I = [{ σ: 'ι⊕', w: 0.34 }, { σ: 'ι↔', w: 0.33 }, { σ: 'ι□', w: 0.33 }];
const Itarget = [{ σ: 'ι⊕', w: 0.5 }, { σ: 'ι↔', w: 0.25 }, { σ: 'ι□', w: 0.25 }];

const pureField = requireComplete('pure field algebra scope', K.complete([F, FsameMessy], { steps: 8 }));
ok('pure field scope derives canonical equality lexeme', has(pureField, 'Λ:≡1') || pureField.lexicon.entries.some(row => row.rule === '≡.true=true'));
ok('pure field scope derives closed gap lexeme', has(pureField, 'Λ:Δ0'));

const gapCorrection = requireComplete('gap correction algebra scope', K.complete([F], { target: G, steps: 8 }));
ok('gap correction scope derives reducing transform lexeme', has(gapCorrection, 'Λ:T↓'));
ok('gap correction scope derives closed target gap lexeme', has(gapCorrection, 'Λ:Δ0'));
ok('gap correction scope contains transformed target field', gapCorrection.fields.some(field => K.equivalent(field, G).true === true));

const proofConvergence = requireComplete('proof convergence algebra scope', K.complete([F], { target: G, steps: 8 }));
ok('proof convergence scope derives proof lexeme', has(proofConvergence, 'Λ:⊢1'));
ok('proof convergence scope derives stable convergence lexeme', has(proofConvergence, 'Λ:lim1'));
ok('proof convergence scope derives generalized proof after-zero lexeme', has(proofConvergence, 'Λ:⊢.after0'));
ok('proof convergence scope derives generalized convergence score-zero lexeme', has(proofConvergence, 'Λ:lim.score0'));

const lexemeScope = requireComplete('lexeme derivation scope', K.complete([F], { target: H, steps: 8 }));
ok('lexeme derivation scope derives generalized numeric facts', lexemeScope.lexicon.entries.some(row => row.σ.indexOf('Λ:') === 0 && row.rule.indexOf('=0') > 0));
ok('lexeme derivation scope resolves stable convergence lexeme', K.resolveLexeme('Λ:lim1', lexemeScope.lexicon).ok === true);

const groundingScope = requireComplete('formal grounding scope', K.complete([F], { steps: 8 }));
ok('formal grounding scope derives formal mode lexeme', has(groundingScope, 'Λ:Gf'));
ok('formal grounding scope derives not-observed fact lexeme', has(groundingScope, 'Λ:G.observed0'));

const intentionScope = requireComplete('intention field scope', K.complete([I], { target: Itarget, steps: 8 }));
ok('intention scope preserves unit-total fields', intentionScope.fields.every(field => Math.abs(K.l1(field) - 1) < 1e-6));
ok('intention scope closes toward intention target', intentionScope.fields.some(field => K.equivalent(field, Itarget).true === true));
ok('intention scope derives completion lexemes', has(intentionScope, 'Λ:lim1') && has(intentionScope, 'Λ:⊢1'));

const baseLex = gapCorrection.lexicon.entries.find(row => row.σ === 'Λ:Δ0');
const conflict = Object.assign({}, baseLex, { ν: 'ν-conflict' });
const contradictionScope = K.complete([F], { target: G, steps: 8, registry: [baseLex, conflict] });
ok('contradiction scope remains symbolic', contradictionScope.φ === 'Ω*' && contradictionScope.Ξ === '');
ok('contradiction scope detects lexeme conflict', contradictionScope.conflict_count > 0);
ok('contradiction scope refuses complete flag', contradictionScope.complete === false);
ok('contradiction scope still preserves unit-total', contradictionScope.u.ok === true);

console.log(rows.join('\n'));
