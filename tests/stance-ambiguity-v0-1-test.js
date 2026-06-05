const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');
const P = require('../src/language-parser-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const stance = P.compileClaim("women shouldn't vote");
ok('unspecified normative stance emits gamma packet', stance.φ === 'Γ' && stance.mode === 'stance' && stance.Ξ === '');
ok('stance stores subject relation object', stance.subject === 'women' && stance.relation === 'should-not' && stance.object === 'vote');
ok('stance does not infer all quantifier', stance.quantifier !== 'all');
ok('stance does not infer some quantifier', stance.quantifier !== 'some');
ok('stance marks quantifier unspecified', stance.quantifier === 'unspecified');
ok('stance requires elaboration when quantifier missing', stance.elaboration_required === true && stance.elaboration_reason === 'missing_quantifier');
ok('stance field is unit-total', Math.abs(K.l1(stance.Γ) - 1) < 1e-6);
ok('stance field contains elaboration-required axis', stance.Γ.some(row => row.σ === 'elaboration:required'));

const allStance = P.compileClaim("all women shouldn't vote");
ok('all quantified stance is explicit', allStance.quantifier === 'all' && allStance.elaboration_required === false);
ok('all quantified stance differs from unspecified stance', allStance.key !== stance.key);

const someStance = P.compileClaim("some women shouldn't vote");
ok('some quantified stance is explicit', someStance.quantifier === 'some' && someStance.elaboration_required === false);
ok('some quantified stance differs from all stance', someStance.key !== allStance.key);

const accepted = K.acceptClaim(stance, []);
ok('kernel can store ambiguous stance as speaker stance', accepted.accepted === true && accepted.elaboration_required === true);
const allAccepted = K.acceptClaim(allStance, [accepted]);
ok('explicit all stance does not overwrite unspecified stance', allAccepted.accepted === true);
const resolvedUnspecified = K.resolveClaim(stance.key, [accepted, allAccepted]);
ok('unspecified stance resolves separately by exact key', resolvedUnspecified.ok === true && resolvedUnspecified.value === 'vote');
const resolvedBase = K.resolveClaim('women.should-not=vote', [accepted, allAccepted]);
ok('base stance without quantifier does not falsely resolve quantified claims', resolvedBase.ok === false);

const completion = K.complete([stance.Γ], { steps: 8 });
ok('ambiguous stance closes under omega-star', completion.φ === 'Ω*' && completion.complete === true);
ok('ambiguous stance has no unresolved gap', completion.unresolved_count === 0);

console.log(rows.join('\n'));
