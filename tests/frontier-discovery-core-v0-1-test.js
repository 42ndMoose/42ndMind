const assert = require('assert');
const F = require('../src/frontier-discovery-core-v0-1.js');
const W = require('../src/whole-self-simulation-core-v0-1.js');

assert.strictEqual(F.VERSION, '0.1.0');
assert.strictEqual(typeof F.readGap, 'function');
assert.strictEqual(typeof F.infer, 'function');
assert.strictEqual(typeof F.fromWholeSelf, 'function');
assert.strictEqual(typeof F.createLedger, 'function');
assert.strictEqual(typeof F.record, 'function');

const already = F.infer('2 + 2 = 4');
assert.strictEqual(already.packet_type, '42ndMind_frontier_discovery_v0_1');
assert.strictEqual(already.needed, false);
assert.strictEqual(already.proposals.length, 0);

const complexCase = 'i' + '^' + '2 = -1';
const complex = F.infer(complexCase);
assert.strictEqual(complex.needed, false);
assert.strictEqual(complex.proposals.length, 0);

const matrixCase = 'A B = C';
const matrix = F.infer(matrixCase);
if (matrix.needed) {
  assert.strictEqual(matrix.proposals[0].candidate.ast_node, 'MatrixProductStatement');
  assert.strictEqual(matrix.proposals[0].candidate.closure_operator, 'typeMatrixProduct');
  assert.ok(matrix.proposals[0].candidate.proof_obligations.some(x => /dimension/.test(x)));
} else {
  assert.strictEqual(matrix.proposals.length, 0);
}

const sequenceCase = 'a_n = n' + '^' + '2';
const sequence = F.infer(sequenceCase);
if (sequence.needed) {
  assert.strictEqual(sequence.proposals[0].candidate.ast_node, 'SequenceDefinition');
  assert.strictEqual(sequence.proposals[0].candidate.closure_operator, 'defineSequence');
} else {
  assert.strictEqual(sequence.proposals.length, 0);
}

const existsCase = 'exists x in R, x' + '^' + '2 = 2';
const existential = F.infer(existsCase);
assert.strictEqual(existential.needed, true);
assert.strictEqual(existential.proposals[0].candidate.ast_node, 'ExistentialStatement');
assert.strictEqual(existential.proposals[0].candidate.closure_operator, 'generateExistentialObligations');

const relationCase = 'Harvey is happy, happy is good, but Harvey is not good';
const relation = F.infer(relationCase);
assert.strictEqual(relation.needed, true);
assert.strictEqual(relation.proposals[0].candidate.ast_node, 'RelationClaimSet');
assert.strictEqual(relation.proposals[0].candidate.closure_operator, 'analyzeRelationClaimSet');
assert.ok(relation.proposals[0].candidate.proof_obligations.some(x => /silently transferring/.test(x)));

const unknown = F.infer('unknown operator sample');
assert.strictEqual(unknown.needed, true);
assert.strictEqual(unknown.proposals[0].kind, 'unknown_unclassified_frontier');
assert.strictEqual(unknown.proposals[0].candidate.closure_operator, 'unresolvedFrontierClosure');

const state = W.evaluateState({ id: 'frontier_discovery_state' });
const batch = F.fromWholeSelf(state);
assert.strictEqual(batch.packet_type, '42ndMind_frontier_discovery_batch_v0_1');
assert.strictEqual(batch.count, state.wants.length);
assert.strictEqual(batch.discoveries.length, state.wants.length);
assert.ok(batch.discoveries.some(row => row.needed === true));
assert.ok(!state.wants.some(row => row.id === 'complex_numbers'));

let ledger = F.createLedger([]);
assert.strictEqual(ledger.success_count, 0);
assert.strictEqual(ledger.failure_count, 0);
ledger = F.record(ledger, { input: complexCase, result: 'promoted', reason: 'candidate passed gates' });
ledger = F.record(ledger, { input: sequenceCase, result: 'rejected', reason: 'missing proof rule' });
assert.strictEqual(ledger.entries.length, 2);
assert.strictEqual(ledger.success_count, 1);
assert.strictEqual(ledger.failure_count, 1);

console.log('frontier-discovery-core-v0-1 tests passed');
