const assert = require('assert');
const LC = require('../src/one-logic-language-completion-v0-1.js');
const M = require('../src/one-logic-math-v1.js');
const P = require('../src/math-law-invariant-prover-v0-1.js');
const Proof = require('../src/math-law-proof-checker-v0-1.js');

const options = { math: M, prover: P, proof_checker: Proof };
const generated = LC.expression('2 + 2 = 4', options);
const admitted = LC.admit(generated, options);
const reduced = LC.reduce([generated, generated], options);
const refused = LC.refuse('unclosed external assertion', 'not_admitted_without_one_logic_closure', options);

assert.strictEqual(generated.expression.derived_from_contract, true);
assert.strictEqual(generated.expression.parser_role, 'parse_format_hint_only_not_semantic_authority');
assert.strictEqual(generated.expression.semantic_authority, M.CONTRACT.canonical_path + '::CONTRACT');
assert.strictEqual(generated.expression.proof_authority, M.CONTRACT.proofs.authority);
assert.ok(generated.expression.operators.some(row => row.operator === 'E'));
assert.ok(generated.expression.operators.some(row => row.operator === 'Valid'));

[generated, admitted, reduced, refused].forEach(packet => {
  assert.ok(packet.proof, packet.kind + ' has proof certificate');
  assert.strictEqual(packet.proved, true);
  assert.strictEqual(packet.ok, true);
  assert.strictEqual(packet.proof.ok, true);
  assert.strictEqual(packet.blocked_reason, null);
  assert.strictEqual(packet.proof.packet_type, '42ndMind_math_law_proof_certificate_v0_1');
  assert.strictEqual(packet.proof.authority, M.CONTRACT.proofs.authority);
  assert.strictEqual(packet.proof.theorem, M.CONTRACT.proofs.theorem);
  assert.ok(Array.isArray(packet.proof.obligations));
  assert.ok(packet.proof.obligations.length > 0);
});

const completion = LC.complete(['2 + 2 = 4'], Object.assign({}, options, {
  refusals: [{ input: 'unclosed external assertion', reason: 'not_admitted_without_one_logic_closure' }]
}));
const allPackets = completion.generated.concat(completion.admissions).concat(completion.reductions).concat(completion.refusals);
assert.strictEqual(completion.packet_type, '42ndMind_one_logic_language_completion_v0_1');
assert.ok(completion.proof_count >= 4);
assert.ok(completion.generated[0].proof);
assert.ok(completion.admissions[0].proof);
assert.ok(completion.reductions[0].proof);
assert.ok(completion.refusals[0].proof);
assert.ok(allPackets.every(packet => packet.ok === true));
assert.ok(allPackets.every(packet => packet.proved === true));
assert.strictEqual(completion.ok, true);
assert.strictEqual(completion.proved, true);

console.log('one-logic-language-completion-v0-1-test: all checks passed');
