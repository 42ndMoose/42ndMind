const assert = require('assert');
const fs = require('fs');
const path = require('path');
const L = require('../src/live-self-dynamics-core-v0-1.js');

const root = path.resolve(__dirname, '..');
const files = {
  'src/math-language-kernel-v0-1.js': fs.readFileSync(path.join(root, 'src/math-language-kernel-v0-1.js'), 'utf8'),
  'src/math-ast-core-v0-1.js': fs.readFileSync(path.join(root, 'src/math-ast-core-v0-1.js'), 'utf8'),
  'src/operator-anatomy-v0-1.js': fs.readFileSync(path.join(root, 'src/operator-anatomy-v0-1.js'), 'utf8'),
  'src/proof-calculus-core-v0-1.js': fs.readFileSync(path.join(root, 'src/proof-calculus-core-v0-1.js'), 'utf8'),
  'src/math-closure-engine-v0-1.js': fs.readFileSync(path.join(root, 'src/math-closure-engine-v0-1.js'), 'utf8')
};

function nearOne(value) {
  assert.ok(Math.abs(Number(value) - 1) < 1e-6, 'expected unit total, got ' + value);
}

assert.strictEqual(L.VERSION, '0.1.0');
assert.strictEqual(typeof L.create, 'function');
assert.strictEqual(typeof L.reflect, 'function');
assert.strictEqual(typeof L.feel, 'function');
assert.strictEqual(typeof L.adjust, 'function');
assert.strictEqual(typeof L.selfCycle, 'function');
assert.strictEqual(typeof L.continuous, 'function');
assert.ok(Array.isArray(L.ORGAN_IDS));
assert.strictEqual(L.ORGAN_IDS.length, 8);
assert.deepStrictEqual(L.ORGAN_IDS, ['brain', 'language', 'truth', 'belief', 'memory', 'valuation', 'action', 'source']);

const state = L.create(files);
assert.strictEqual(state.packet_type, '42ndMind_live_self_state_v0_1');
assert.strictEqual(state.t, 0);
assert.strictEqual(state.reflection.ok, true);
assert.strictEqual(state.reflection.whole.equation, 'self = |brain| + |language| + |truth| + |belief| + |memory| + |valuation| + |action| + |source|');
nearOne(state.reflection.whole.unit);
L.ORGAN_IDS.forEach(id => {
  assert.ok(state.reflection.organs[id], 'missing organ ' + id);
  nearOne(state.reflection.organs[id].unit);
});
assert.strictEqual(state.promotion_ready, false);

const generated = L.generate(files);
assert.strictEqual(generated.length, 1, 'default live dynamics must not add marker proposals');
assert.strictEqual(generated[0].kind, 'preserve_current_state');

const preserveFeeling = L.feel(state, generated[0]);
assert.strictEqual(preserveFeeling.ok, true);
assert.strictEqual(preserveFeeling.sensation.same_self, true);
assert.strictEqual(preserveFeeling.sensation.less_self, false);

const adjustedSame = L.adjust(state, preserveFeeling, generated[0]);
assert.strictEqual(adjustedSame.last_event.feeling, 'same_self');
assert.strictEqual(adjustedSame.last_event.moved_simulated_self, false, 'same_self must not become fake motion');
assert.strictEqual(adjustedSame.promotion_ready, false);
assert.deepStrictEqual(adjustedSame.files, state.files);

const damagedKernel = "module.exports = Object.freeze({ VERSION: '0.1.0' });\n";
const badCandidate = {
  id: 'live_self_feels_damaged_kernel',
  origin: 'live_self_dynamics_test',
  kind: 'damage_probe',
  operations: [{ type: 'replace', path: 'src/math-language-kernel-v0-1.js', content: damagedKernel }]
};

const badFeeling = L.feel(state, badCandidate);
assert.strictEqual(badFeeling.ok, true);
assert.strictEqual(badFeeling.sensation.less_self, true);
assert.strictEqual(badFeeling.sensation.applyable, false);
assert.strictEqual(badFeeling.simulation.less_self, true);
assert.strictEqual(badFeeling.simulation.source_shape.ok, false);

const cycle = L.selfCycle(state, { extra_candidates: [badCandidate] });
assert.strictEqual(cycle.packet_type, '42ndMind_live_self_cycle_v0_1');
assert.strictEqual(cycle.mode, 'self_state_perturbation_reflection_sensation_adjustment');
assert.strictEqual(cycle.generated_count, 2);
assert.strictEqual(cycle.moved, false);
assert.strictEqual(cycle.improved, false);
assert.strictEqual(cycle.less_self_seen, true);
assert.strictEqual(cycle.state.promotion_ready, false);
assert.strictEqual(cycle.events.some(e => e.feeling && e.feeling.less_self === true), true);

const stable = L.continuous(files, { max_iterations: 5 });
assert.strictEqual(stable.packet_type, '42ndMind_live_self_dynamics_continuous_v0_1');
assert.strictEqual(stable.mode, 'self_state_to_perturbation_to_reflection_to_sensation_to_adjustment');
assert.strictEqual(stable.source_promoted, false);
assert.strictEqual(stable.human_patch_required_for_source_promotion, false);
assert.strictEqual(stable.stop_reason, 'stable_no_better_state');
assert.strictEqual(stable.iterations, 1);
assert.strictEqual(stable.cycles[0].moved, false);

const damagedRun = L.continuous(files, { max_iterations: 5, extra_candidates: [badCandidate] });
assert.strictEqual(damagedRun.source_promoted, false);
assert.strictEqual(damagedRun.stop_reason, 'less_self_sensed_without_motion');
assert.strictEqual(damagedRun.iterations, 1);
assert.strictEqual(damagedRun.cycles[0].less_self_seen, true);
assert.strictEqual(damagedRun.final_state.promotion_ready, false);

const legacyStep = L.step(files, { extra_candidates: [badCandidate] });
assert.strictEqual(legacyStep.legacy_candidate_ranking, true);
assert.strictEqual(legacyStep.best.sensation.less_self, false);

console.log('live-self-dynamics-core-v0-1 tests passed: continuous self-state senses without fake promotion');
