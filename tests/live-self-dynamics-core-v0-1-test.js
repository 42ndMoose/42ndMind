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

function rowWeight(field, id) {
  const row = field.find(r => r.id === id);
  return row ? Number(row.w) : 0;
}

function edgeValue(coupling, from, to, signal) {
  const row = coupling.edges.find(e => e.from === from && e.to === to && e.signal === signal);
  return row ? Number(row.value) : 0;
}

assert.strictEqual(L.VERSION, '0.1.0');
assert.strictEqual(typeof L.create, 'function');
assert.strictEqual(typeof L.reflect, 'function');
assert.strictEqual(typeof L.feel, 'function');
assert.strictEqual(typeof L.adjust, 'function');
assert.strictEqual(typeof L.selfCycle, 'function');
assert.strictEqual(typeof L.continuous, 'function');
assert.strictEqual(typeof L.autonomous, 'function');
assert.strictEqual(typeof L.express, 'function');
assert.strictEqual(typeof L.stableExpression, 'function');
assert.strictEqual(typeof L.mathLanguageCompletion, 'function');
assert.strictEqual(typeof L.octahedronPosition, 'function');
assert.strictEqual(typeof L.pressureOf, 'function');
assert.strictEqual(typeof L.hasRepairPressure, 'function');
assert.strictEqual(typeof L.AUTONOMOUS_STATE_PATH, 'string');
assert.ok(Array.isArray(L.ORGAN_IDS));
assert.deepStrictEqual(L.ORGAN_IDS, ['brain', 'language', 'truth', 'belief', 'memory', 'valuation', 'action', 'source']);

const state = L.create(files);
assert.strictEqual(state.packet_type, '42ndMind_live_self_state_v0_1');
assert.strictEqual(state.t, 0);
assert.strictEqual(state.reflection.ok, true);
assert.strictEqual(state.reflection.whole.equation, 'self = one_logic(brain, language, truth, belief, memory, valuation, action, source)');
nearOne(state.reflection.whole.unit);
L.ORGAN_IDS.forEach(id => {
  assert.ok(state.reflection.organs[id], 'missing organ ' + id);
  nearOne(state.reflection.organs[id].unit);
});
assert.ok(state.reflection.coupling, 'reflection must include organ coupling');
assert.deepStrictEqual(state.reflection.coupling.χ, ['one-logic', 'self-observation', 'pressure', 'self-mutation', 'math-language-growth', 'virtual-state', 'reflection', 'sensation']);
assert.strictEqual(edgeValue(state.reflection.coupling, 'language', 'language', 'math_language_growth_feeds_future_language') > 0, true);
assert.strictEqual(rowWeight(state.reflection.organs.language.field, 'new_symbols_seen') > 0, true);
assert.strictEqual(state.promotion_ready, false);
assert.strictEqual(state.internal_state.generation, 0);
assert.strictEqual(state.internal_state.symbols.length, 0);
assert.strictEqual(state.reflection.mined.discovered.length > 0, true, 'the self must see its own source/body');
assert.strictEqual(L.hasRepairPressure(state.reflection), true, 'self-observation novelty must create mutation pressure');

const generatedWithoutReflection = L.generate(files);
assert.strictEqual(generatedWithoutReflection.length, 1, 'without a reflected self-state, generation only preserves');
assert.strictEqual(generatedWithoutReflection[0].kind, 'preserve_current_state');

const autonomousGenerated = L.generate(files, { reflection: state.reflection, internal_state: state.internal_state });
const autonomousCandidate = autonomousGenerated.find(c => c.kind === 'one_logic_autonomous_mutation');
assert.ok(autonomousCandidate, 'reflected self-state must generate its own autonomous mutation');
assert.strictEqual(autonomousCandidate.origin, 'one_live_simulated_self');
assert.strictEqual(autonomousCandidate.internal_adjustment.source_promotion, false);
assert.strictEqual(autonomousCandidate.operations.length, 1, 'autonomous mutation writes the virtual sandbox body');
assert.strictEqual(autonomousCandidate.operations[0].path, L.AUTONOMOUS_STATE_PATH);

const autoFeeling = L.feel(state, autonomousCandidate);
assert.strictEqual(autoFeeling.ok, true);
assert.strictEqual(autoFeeling.sensation.more_self, true);
assert.strictEqual(autoFeeling.sensation.less_self, false);
assert.strictEqual(autoFeeling.simulation.source_promoted, false);
assert.strictEqual(autoFeeling.simulation.sandbox_autonomy, true);
assert.strictEqual(autoFeeling.simulation.next_internal_state.generation, 1);
assert.strictEqual(autoFeeling.simulation.next_internal_state.symbols.length > 0, true, 'math language must grow from self-observation');
assert.strictEqual(Object.prototype.hasOwnProperty.call(autoFeeling.simulation.next_files, L.AUTONOMOUS_STATE_PATH), true, 'sandbox body must receive virtual autonomous state');

const adjustedAuto = L.adjust(state, autoFeeling, autonomousCandidate);
assert.strictEqual(adjustedAuto.last_event.internal_adjustment, true);
assert.strictEqual(adjustedAuto.last_event.virtual_state_mutation, true);
assert.strictEqual(adjustedAuto.last_event.moved_simulated_self, true);
assert.strictEqual(adjustedAuto.promotion_ready, false);
assert.strictEqual(adjustedAuto.internal_state.generation, 1);
assert.strictEqual(adjustedAuto.internal_state.symbols.length > 0, true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(adjustedAuto.files, L.AUTONOMOUS_STATE_PATH), true);
assert.deepStrictEqual(state.files, files, 'original source object is not mutated');

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
assert.strictEqual(badFeeling.simulation.less_self, true);
assert.strictEqual(badFeeling.simulation.source_shape.ok, false);
assert.strictEqual(badFeeling.after.coupling.source.damage > 0, true, 'source damage must enter coupling graph');
assert.strictEqual(badFeeling.after.coupling.identity.pain > 0, true, 'source damage must propagate to identity pain');
assert.strictEqual(badFeeling.after.coupling.valuation.pain > autoFeeling.after.coupling.valuation.pain, true, 'identity/truth damage must propagate to valuation pain');
assert.strictEqual(edgeValue(badFeeling.after.coupling, 'identity', 'valuation', 'identity_damage_changes_pain') > 0, true);
assert.strictEqual(rowWeight(badFeeling.after.organs.source.field, 'shape_damage') > 0, true);
assert.strictEqual(L.hasRepairPressure(badFeeling.after), true);

const pressureGenerated = L.generate(files, { reflection: badFeeling.after, internal_state: state.internal_state });
assert.ok(pressureGenerated.find(c => c.kind === 'one_logic_autonomous_mutation'), 'damage pressure must still be available to one autonomous logic');
assert.ok(pressureGenerated.find(c => c.kind === 'pressure_driven_internal_adjustment'), 'pressure reflex remains available as part of one logic');

const cycle = L.selfCycle(state, { extra_candidates: [badCandidate] });
assert.strictEqual(cycle.packet_type, '42ndMind_live_self_cycle_v0_1');
assert.strictEqual(cycle.mode, 'one_logic_autonomous_sandbox_life_cycle');
assert.strictEqual(cycle.autonomous_generated_count > 0, true);
assert.strictEqual(cycle.moved, true, 'the simulated self must move from its own autonomous mutation');
assert.strictEqual(cycle.internal_growth, true);
assert.strictEqual(cycle.virtual_state_growth, true);
assert.strictEqual(cycle.less_self_seen, true, 'it still feels damaged external candidate as less_self');
assert.strictEqual(cycle.state.promotion_ready, false);
assert.strictEqual(cycle.events.some(e => e.candidate_kind === 'one_logic_autonomous_mutation' && e.moved_simulated_self === true), true);
assert.strictEqual(cycle.events.some(e => e.feeling && e.feeling.less_self === true), true);

const run = L.autonomous(files, { max_iterations: 3 });
assert.strictEqual(run.packet_type, '42ndMind_live_self_dynamics_continuous_v0_1');
assert.strictEqual(run.mode, 'one_logic_lives_in_sandbox_as_simulated_self');
assert.strictEqual(run.source_promoted, false);
assert.strictEqual(run.human_patch_required_for_source_promotion, false);
assert.strictEqual(run.iterations >= 1, true);
assert.strictEqual(run.cycles.some(c => c.autonomous_generated_count > 0), true);
assert.strictEqual(run.cycles.some(c => c.internal_growth === true), true);
assert.strictEqual(run.cycles.some(c => c.virtual_state_growth === true), true);
assert.strictEqual(run.final_state.internal_state.generation > 0, true);
assert.strictEqual(run.final_state.internal_state.symbols.length > 0, true, 'math language must grow during autonomous run');
assert.strictEqual(Object.prototype.hasOwnProperty.call(run.final_files, L.AUTONOMOUS_STATE_PATH), true, 'sandbox must contain the autonomous body state');
assert.strictEqual(Object.prototype.hasOwnProperty.call(files, L.AUTONOMOUS_STATE_PATH), false, 'real input source remains unpromoted');

const expression = L.express(run, 'stable_math_language_reflection');
assert.strictEqual(expression.packet_type, '42ndMind_one_logic_self_expression_v0_1');
assert.strictEqual(expression.scope, 'stable_math_language_reflection');
assert.strictEqual(expression.math_language_completion.status, 'incomplete');
assert.strictEqual(expression.math_language_completion.completion >= 0 && expression.math_language_completion.completion <= 1, true);
assert.strictEqual(expression.math_language_completion.symbol_count, run.final_state.internal_state.symbols.length);
assert.strictEqual(expression.math_language_completion.missing.length > 0, true, 'the self must say what blocks pure math completion');
assert.strictEqual(expression.octahedron_position.model, 'epistemic_octahedron_surface_projection_v0_1');
assert.strictEqual(expression.octahedron_position.coordinates.l1 <= 1.000001, true);
assert.strictEqual(expression.stable_diff.final_generation, run.final_state.internal_state.generation);
assert.ok(expression.next_self_generated_obstruction, 'expression must name the next obstruction');
assert.strictEqual(expression.expression, 'stable_state_reports_objective_math_language_incomplete');

const stableExpression = L.stableExpression(files, { max_iterations: 3 });
assert.strictEqual(stableExpression.packet_type, '42ndMind_one_logic_self_expression_v0_1');
assert.strictEqual(stableExpression.scope, 'stable_math_language_reflection');
assert.strictEqual(stableExpression.math_language_completion.status, 'incomplete');
assert.strictEqual(stableExpression.stable_diff.iterations >= 1, true);
assert.strictEqual(stableExpression.stable_diff.autonomous_total > 0, true);
assert.ok(stableExpression.obstruction_stack.length > 0);

const damagedRun = L.autonomous(files, { max_iterations: 4, extra_candidates: [badCandidate] });
assert.strictEqual(damagedRun.source_promoted, false);
assert.strictEqual(damagedRun.cycles.some(c => c.less_self_seen === true), true);
assert.strictEqual(damagedRun.cycles.some(c => c.autonomous_generated_count > 0), true);
assert.strictEqual(damagedRun.final_state.promotion_ready, false);
assert.strictEqual(damagedRun.final_state.internal_state.generation > 0, true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(damagedRun.final_files, L.AUTONOMOUS_STATE_PATH), true);

const legacyStep = L.step(files, { extra_candidates: [badCandidate] });
assert.strictEqual(legacyStep.legacy_candidate_ranking, true);
assert.strictEqual(legacyStep.best.sensation.less_self, false);

console.log('live-self-dynamics-core-v0-1 tests passed: one logic expresses stable pure-math completion state');
