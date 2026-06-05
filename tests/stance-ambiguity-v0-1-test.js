const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');
const P = require('../src/language-parser-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

function requireUnspecifiedStance(text, subject, relation, object) {
  const stance = P.compileClaim(text);
  ok(text + ' emits gamma stance packet', stance.φ === 'Γ' && stance.mode === 'stance' && stance.Ξ === '');
  ok(text + ' stores subject relation object', stance.subject === subject && stance.relation === relation && stance.object === object);
  ok(text + ' does not infer all quantifier', stance.quantifier !== 'all');
  ok(text + ' does not infer some quantifier', stance.quantifier !== 'some');
  ok(text + ' marks quantifier unspecified', stance.quantifier === 'unspecified');
  ok(text + ' requires elaboration', stance.elaboration_required === true && stance.elaboration_reason === 'missing_quantifier');
  ok(text + ' field is unit-total', Math.abs(K.l1(stance.Γ) - 1) < 1e-6);
  ok(text + ' field contains elaboration-required axis', stance.Γ.some(row => row.σ === 'elaboration:required'));
  return stance;
}

function requireExplicitStance(text, quantifier, subject, relation, object) {
  const stance = P.compileClaim(text);
  ok(text + ' emits explicit stance packet', stance.φ === 'Γ' && stance.mode === 'stance' && stance.Ξ === '');
  ok(text + ' stores explicit quantifier', stance.quantifier === quantifier && stance.elaboration_required === false);
  ok(text + ' stores subject relation object', stance.subject === subject && stance.relation === relation && stance.object === object);
  ok(text + ' field is unit-total', Math.abs(K.l1(stance.Γ) - 1) < 1e-6);
  return stance;
}

const stance = requireUnspecifiedStance("women shouldn't vote", 'women', 'should-not', 'vote');
const allStance = requireExplicitStance("all women shouldn't vote", 'all', 'women', 'should-not', 'vote');
const someStance = requireExplicitStance("some women shouldn't vote", 'some', 'women', 'should-not', 'vote');
ok('unspecified/all/some stance keys are separate', stance.key !== allStance.key && stance.key !== someStance.key && allStance.key !== someStance.key);

const genericCases = [
  ["immigrants should leave", 'immigrants', 'should', 'leave'],
  ["men should fight", 'men', 'should', 'fight'],
  ["children should obey", 'children', 'should', 'obey'],
  ["politicians shouldn't lie", 'politicians', 'should-not', 'lie']
];
genericCases.forEach(([text, subject, relation, object]) => {
  requireUnspecifiedStance(text, subject, relation, object);
});

const explicitCases = [
  ["all immigrants should leave", 'all', 'immigrants', 'should', 'leave'],
  ["some men should fight", 'some', 'men', 'should', 'fight'],
  ["all politicians shouldn't lie", 'all', 'politicians', 'should-not', 'lie']
];
explicitCases.forEach(([text, quantifier, subject, relation, object]) => {
  requireExplicitStance(text, quantifier, subject, relation, object);
});

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
