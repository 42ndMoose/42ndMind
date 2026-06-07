const assert = require('assert');
const C = require('../src/cognitive-organism-core-v0-1.js');

assert.strictEqual(C.VERSION, '0.1.0');
assert.strictEqual(typeof C.create, 'function');
assert.strictEqual(typeof C.observe, 'function');
assert.strictEqual(typeof C.evaluateSelfEdit, 'function');

const state = C.create();
assert.strictEqual(state.packet_type, '42ndMind_cognitive_organism_state_v0_1');
assert.strictEqual(state.t, 0);
assert.strictEqual(state.reward, 0);
assert.strictEqual(state.pain, 0);
assert.strictEqual(state.surprise, 1);

const good = C.observe(state, '2 + 3 * 4 = 14');
assert.strictEqual(good.packet_type, '42ndMind_cognitive_organism_state_v0_1');
assert.strictEqual(good.t, 1);
assert.strictEqual(good.last.math.ok, true);
assert.ok(good.reward > good.pain, 'closed arithmetic should reward more than hurt');
assert.ok(good.memory_summary.observations === 1);
assert.ok(good.memory_summary.successes === 1);
assert.strictEqual(good.last.candidate.action, 'preserve');
assert.ok(good.attention.some(row => row.id === 'novelty'));

const repeated = C.observe(state, '2 + 3 * 4 = 14');
assert.strictEqual(repeated.last.prediction.mode, 'exact');
assert.strictEqual(repeated.last.math.ok, true);
assert.ok(repeated.surprise < good.surprise, 'repeated exact input should reduce surprise');
assert.ok(repeated.reward >= repeated.pain);
assert.strictEqual(repeated.memory_summary.observations, 2);

const bad = C.observe(state, '3 + 2 = 4');
assert.strictEqual(bad.last.math.ok, false);
assert.ok(bad.pain > bad.reward, 'false arithmetic should hurt more than reward');
assert.strictEqual(bad.last.candidate.action, 'discover_structure');
assert.ok(bad.attention[0].id === 'gap' || bad.attention[0].id === 'contradiction' || bad.attention.some(row => row.id === 'gap' && row.w > 0.2));
assert.strictEqual(bad.memory_summary.failures, 1);

const transfer = C.observe(state, '2 + 3 * 5 = 17');
assert.ok(['structural', 'none', 'exact'].includes(transfer.last.prediction.mode));
assert.strictEqual(transfer.last.math.ok, true);
assert.ok(transfer.memory_summary.successes >= 3);

const goodEdit = C.evaluateSelfEdit(state, {
  id: 'candidate_closes_gap_without_breaking_identity',
  tests_ok: true,
  validators_ok: true,
  preserves_identity: true,
  closes_gap: true,
  contradiction: false
});
assert.strictEqual(goodEdit.ok, true);
assert.strictEqual(goodEdit.edit.decision, 'accept_candidate');
assert.strictEqual(goodEdit.edit.feeling, 'more_self');
assert.ok(goodEdit.edit.reward > goodEdit.edit.pain);

const badEdit = C.evaluateSelfEdit(state, {
  id: 'candidate_breaks_arithmetic_anchor',
  tests_ok: false,
  validators_ok: false,
  preserves_identity: false,
  closes_gap: false,
  contradiction: true,
  breaks_anchor: true
});
assert.strictEqual(badEdit.ok, false);
assert.strictEqual(badEdit.edit.decision, 'reject_candidate');
assert.strictEqual(badEdit.edit.feeling, 'less_self');
assert.ok(badEdit.edit.pain > badEdit.edit.reward);

const run = C.run(['2 + 2 = 4', '3 + 2 = 4', 'a_n = n^2']);
assert.strictEqual(run.packet_type, '42ndMind_cognitive_organism_run_v0_1');
assert.strictEqual(run.packets.length, 3);
assert.strictEqual(run.final.memory_summary.observations, 3);
assert.ok(run.packets[0].last.math.ok === true);
assert.ok(run.packets[1].last.math.ok === false);
assert.ok(run.packets[2].last.math.ok === true);

console.log('cognitive-organism-core-v0-1 tests passed');
