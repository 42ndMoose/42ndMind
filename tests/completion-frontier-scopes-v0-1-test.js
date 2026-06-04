const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

function has(packet, symbol) {
  return packet.lexicon.entries.some(row => row.σ === symbol && row.accepted === true);
}

function hasRulePrefix(packet, prefix) {
  return packet.lexicon.entries.some(row => row.rule.indexOf(prefix) === 0 && row.accepted === true);
}

function requireComplete(name, packet) {
  ok(name + ' is Ω* packet', packet.φ === 'Ω*' && packet.Ξ === '');
  ok(name + ' reaches fixed point', packet.fixed === true);
  ok(name + ' completes', packet.complete === true);
  ok(name + ' preserves unit-total', packet.u.ok === true && Math.abs(K.l1(packet.Ω) - 1) < 1e-6);
  ok(name + ' has no unresolved gap', packet.unresolved_count === 0);
  ok(name + ' has no conflict', packet.conflict_count === 0);
  ok(name + ' emits lexicon', packet.lexicon.entries.length > 0 && packet.lexicon.u.ok === true);
  return packet;
}

const claimSupport = [
  { σ: 'claim:energy-costs-rise', w: 0.34 },
  { σ: 'support:observed-bill-increase', w: 0.33 },
  { σ: 'scope:household-energy', w: 0.33 }
];

const claimTarget = [
  { σ: 'claim:energy-costs-rise', w: 0.5 },
  { σ: 'support:observed-bill-increase', w: 0.25 },
  { σ: 'scope:household-energy', w: 0.25 }
];

const truthField = [
  { σ: 'θ:support+', w: 0.25 },
  { σ: 'θ:contradiction0', w: 0.25 },
  { σ: 'θ:unknown0', w: 0.25 },
  { σ: 'θ:measurement+', w: 0.25 }
];

const nestedRelationField = [
  { σ: 'ν:rel(a,b)', w: 0.34 },
  { σ: 'ν:rel(rel(a,b),c)', w: 0.33 },
  { σ: 'ν:scope(rel(a,b))', w: 0.33 }
];

const parserTokenField = [
  { σ: 'parse:subject', w: 0.25 },
  { σ: 'parse:relation', w: 0.25 },
  { σ: 'parse:object', w: 0.25 },
  { σ: 'parse:scope', w: 0.25 }
];

const mixedFormalObserved = [
  { σ: 'G:formal', w: 0.34 },
  { σ: 'G:observed', w: 0.33 },
  { σ: 'G:measurement-channel', w: 0.33 }
];

const argumentScope = requireComplete('argument-like claim scope', K.complete([claimSupport], {
  target: claimTarget,
  observations: [{ source: 'bill', value: claimTarget }],
  steps: 8
}));
ok('argument-like scope derives observed grounding', has(argumentScope, 'Λ:Go'));
ok('argument-like scope derives correction and proof', has(argumentScope, 'Λ:T↓') && has(argumentScope, 'Λ:⊢1'));
ok('argument-like scope closes to claim target', argumentScope.fields.some(field => K.equivalent(field, claimTarget).true === true));

const truthScope = requireComplete('truth-accounting-like scope', K.complete([truthField], { steps: 8 }));
ok('truth-like scope derives formal grounding', has(truthScope, 'Λ:Gf'));
ok('truth-like scope emits canonical equality', has(truthScope, 'Λ:≡1'));
ok('truth-like scope keeps truth symbols in completed field', truthScope.fields.some(field => field.some(row => row.σ === 'θ:support+')));

const nestedScope = requireComplete('nested-relation-like scope', K.complete([nestedRelationField], { steps: 8 }));
ok('nested-like scope emits closed gap', has(nestedScope, 'Λ:Δ0'));
ok('nested-like scope keeps nested relation axes', nestedScope.fields.some(field => field.some(row => row.σ === 'ν:rel(rel(a,b),c)')));

const parserScope = requireComplete('parser-token-like scope', K.complete([parserTokenField], { steps: 8 }));
ok('parser-like scope emits formal grounding', has(parserScope, 'Λ:Gf'));
ok('parser-like scope has generalized gap facts', hasRulePrefix(parserScope, 'Δ.z.'));
ok('parser-like scope keeps parse axes', parserScope.fields.some(field => field.some(row => row.σ === 'parse:relation')));

const mixedScope = requireComplete('mixed formal observed scope', K.complete([mixedFormalObserved], {
  observations: [{ source: 'measurement-channel', value: mixedFormalObserved }],
  steps: 8
}));
ok('mixed scope derives observed grounding', has(mixedScope, 'Λ:Go'));
ok('mixed scope derives observed fact', has(mixedScope, 'Λ:G.observed1'));
ok('mixed scope emits equality closure', has(mixedScope, 'Λ:≡1'));

console.log(rows.join('\n'));
