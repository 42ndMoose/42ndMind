const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');
const P = require('../src/language-parser-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const nameClaim = P.compileClaim('my name is Kai');
ok('claim compiler emits gamma packet', nameClaim.φ === 'Γ' && nameClaim.Ξ === '');
ok('name claim has self name key', nameClaim.key === 'self.name' && nameClaim.object === 'kai');
ok('name claim field is unit-total', Math.abs(K.l1(nameClaim.Γ) - 1) < 1e-6);

const accepted = K.acceptClaim(nameClaim, []);
ok('kernel accepts first self name claim', accepted.accepted === true && accepted.rejected === false);

const query = P.compileClaim('what is my name?');
ok('claim compiler emits query packet', query.φ === 'Γ?' && query.query !== true && query.key === 'self.name');
const resolved = K.resolveClaim(query, [accepted]);
ok('kernel resolves accepted name claim', resolved.ok === true && resolved.value === 'kai');
ok('resolved claim field is unit-total', Math.abs(K.l1(resolved.Γ) - 1) < 1e-6);

const duplicate = K.acceptClaim(P.compileClaim('I am Kai'), [accepted]);
ok('kernel accepts duplicate same-value name claim', duplicate.accepted === true && duplicate.rejected === false);
const resolvedDuplicate = K.resolveClaim(query, [accepted, duplicate]);
ok('duplicate same-value claims still resolve uniquely', resolvedDuplicate.ok === true && resolvedDuplicate.value === 'kai');

const conflict = K.acceptClaim(P.compileClaim('my name is John'), [accepted]);
ok('kernel rejects conflicting same-key different-value claim', conflict.accepted === false && conflict.rejected === true && conflict.conflict !== null);
const resolvedAfterConflict = K.resolveClaim(query, [accepted, conflict]);
ok('rejected conflict does not overwrite accepted claim', resolvedAfterConflict.ok === true && resolvedAfterConflict.value === 'kai');

const attr = P.compileClaim('my city is Winnipeg');
ok('claim compiler handles self attribute', attr.φ === 'Γ' && attr.key === 'self.city' && attr.object === 'winnipeg');
const attrAccepted = K.acceptClaim(attr, [accepted]);
ok('kernel accepts non-conflicting self attribute', attrAccepted.accepted === true);
const attrQuery = P.compileClaim('what is my city?');
ok('claim compiler handles self attribute query', attrQuery.φ === 'Γ?' && attrQuery.key === 'self.city');
ok('kernel resolves self attribute query', K.resolveClaim(attrQuery, [accepted, attrAccepted]).value === 'winnipeg');

const noClaim = P.rawToClaimCandidates('the weather seems cold today');
ok('non-claim raw input produces no deterministic claim', Array.isArray(noClaim) && noClaim.length === 0);

const claimCompletion = K.complete([nameClaim.Γ], { steps: 8 });
ok('accepted claim field closes under omega-star', claimCompletion.φ === 'Ω*' && claimCompletion.complete === true);
ok('accepted claim completion has no unresolved gap', claimCompletion.unresolved_count === 0);

console.log(rows.join('\n'));
