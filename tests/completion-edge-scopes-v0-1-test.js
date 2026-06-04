const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

function hasRule(packet, rule) {
  return packet.lexicon.entries.some(row => row.rule === rule && row.accepted === true);
}

function hasSymbol(packet, symbol) {
  return packet.lexicon.entries.some(row => row.σ === symbol && row.accepted === true);
}

const F = [{ σ: 'a', w: 0.5 }, { σ: 'b', w: 0.5 }];
const G = [{ σ: 'a', w: 0.25 }, { σ: 'b', w: 0.75 }];
const H = [{ σ: 'a', w: 0.4 }, { σ: 'b', w: 0.4 }, { σ: 'c', w: 0.2 }];
const rawBadUnit = [{ σ: 'a', w: 0.25 }];
const unitTarget = [{ σ: 'a', w: 1 }];

const rawUnitScope = K.complete([rawBadUnit], { target: unitTarget, steps: 8 });
ok('raw-unit scope remains symbolic', rawUnitScope.φ === 'Ω*' && rawUnitScope.Ξ === '');
ok('raw-unit scope reaches fixed point', rawUnitScope.fixed === true);
ok('raw-unit scope preserves unit-total after correction', rawUnitScope.u.ok === true);
ok('raw-unit scope retains raw unit mismatch evidence', hasRule(rawUnitScope, 'Δ.z.Δ∥=0.75') || rawUnitScope.lexicon.entries.some(row => row.rule.indexOf('Δ∥=0.75') >= 0));
ok('raw-unit scope still closes to corrected target field', rawUnitScope.fields.some(field => K.equivalent(field, unitTarget).true === true));

const observedScope = K.complete([F], { steps: 8, observations: [{ source: 'measurement', value: F }] });
ok('observed grounding scope remains symbolic', observedScope.φ === 'Ω*' && observedScope.Ξ === '');
ok('observed grounding scope completes', observedScope.complete === true);
ok('observed grounding scope derives observed mode lexeme', hasSymbol(observedScope, 'Λ:Go'));
ok('observed grounding scope derives observed boolean fact', hasSymbol(observedScope, 'Λ:G.observed1'));

const multiFieldScope = K.complete([F, G, H], { steps: 8 });
ok('multi-field closure remains symbolic', multiFieldScope.φ === 'Ω*' && multiFieldScope.Ξ === '');
ok('multi-field closure completes', multiFieldScope.complete === true);
ok('multi-field closure preserves all canonical fields', multiFieldScope.fields.length >= 3);
ok('multi-field closure emits equality and difference lexemes', hasSymbol(multiFieldScope, 'Λ:≡1') && hasSymbol(multiFieldScope, 'Λ:≡0'));
ok('multi-field closure emits gap facts', multiFieldScope.lexicon.entries.some(row => row.rule.indexOf('Δ.z.') === 0));

const unmeasurableScope = K.complete([{ arbitrary: 'unmeasurable-object' }], { steps: 4 });
ok('unmeasurable scope remains symbolic', unmeasurableScope.φ === 'Ω*' && unmeasurableScope.Ξ === '');
ok('unmeasurable scope does not falsely complete', unmeasurableScope.complete === false);
ok('unmeasurable scope reports unresolved gap', unmeasurableScope.unresolved_count > 0);
ok('unmeasurable scope still preserves unit report', unmeasurableScope.u.ok === true);

console.log(rows.join('\n'));
