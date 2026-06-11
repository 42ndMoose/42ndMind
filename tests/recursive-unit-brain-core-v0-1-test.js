const assert = require('assert');
const UnitBrain = require('../src/recursive-unit-brain-core-v0-1.js');

function near(value, target, message) {
  assert.ok(Math.abs(Number(value) - Number(target)) < 1e-6, message || `expected ${value} near ${target}`);
}

assert.strictEqual(UnitBrain.VERSION, '0.3.0');
assert.strictEqual(typeof UnitBrain.normalizeNode, 'function');
assert.strictEqual(typeof UnitBrain.project, 'function');
assert.strictEqual(typeof UnitBrain.refineByContact, 'function');
assert.strictEqual(typeof UnitBrain.liveProjection, 'function');
assert.strictEqual(typeof UnitBrain.selfDefine, 'function');
assert.strictEqual(typeof UnitBrain.focusExpression, 'function');

const root = UnitBrain.project({
  id: 'brain',
  children: [
    { id: 'language', w: 2, children: [
      { id: 'syntax', w: 1 },
      { id: 'semantics', w: 1 },
      { id: 'proof', w: 2 },
      { id: 'symbolic_token_potato', w: 0.01, vague: false, meta: { expression_construction: 'ordered_symbol_sequence' }, children: [
        { id: 'letter_p_1', w: 1, vague: false, meta: { symbol_letter: 'p', position: 1 } },
        { id: 'letter_o_2', w: 1, vague: false, meta: { symbol_letter: 'o', position: 2 } },
        { id: 'letter_t_3', w: 1, vague: false, meta: { symbol_letter: 't', position: 3 } },
        { id: 'letter_a_4', w: 1, vague: false, meta: { symbol_letter: 'a', position: 4 } },
        { id: 'letter_t_5', w: 1, vague: false, meta: { symbol_letter: 't', position: 5 } },
        { id: 'letter_o_6', w: 1, vague: false, meta: { symbol_letter: 'o', position: 6 } }
      ] }
    ] },
    { id: 'truth', w: 1 },
    { id: 'memory', w: 1 }
  ]
});

assert.strictEqual(root.packet_type, '42ndMind_recursive_unit_brain_projection_v0_1');
assert.strictEqual(root.ok, true);
assert.strictEqual(root.principle, 'recursive_unit_total_state_projected_through_kernel_constraints');
near(root.root.child_total, 1, 'root aspects must normalize to one');
near(root.root.children.find(x => x.id === 'language').child_total, 1, 'language aspects must normalize to one');
assert.strictEqual(root.unit_violation_count, 0);
assert.strictEqual(root.max_depth >= 3, true);
assert.strictEqual(root.root.children.find(x => x.id === 'truth').vague, true, 'undefined leaves remain vague valid units');
assert.strictEqual(root.self_definition.packet_type, '42ndMind_recursive_unit_self_definition_v0_1');
assert.ok(root.self_definition.root_formulas.some(line => line.includes('⊕')), 'self definition must generate aspect formula from body');
assert.ok(root.self_definition.immediate_aspects.length === 3, 'self definition must derive immediate aspects from body');
assert.strictEqual(root.self_definition.constructed_expressions[0].visible_expression, 'potato');
assert.ok(root.self_definition.constructed_expressions[0].reduction.includes('p + o + t + a + t + o'));

const potatoFocus = UnitBrain.focusExpression(root, { token: 'potato' });
assert.strictEqual(potatoFocus.packet_type, '42ndMind_recursive_unit_focus_expression_v0_1');
assert.strictEqual(potatoFocus.ok, true, 'potato focus must be valid only when ordered body parts derive the token');
assert.strictEqual(potatoFocus.visible_expression, 'potato');
assert.strictEqual(potatoFocus.source, 'body_ordered_symbol_sequence');
assert.strictEqual(potatoFocus.construction.visible_expression, 'potato');
assert.strictEqual(potatoFocus.construction.reduction, 'p + o + t + a + t + o -> potato');
assert.strictEqual(potatoFocus.whole_body_present, true);
assert.strictEqual(potatoFocus.obligation.satisfied, true);
assert.ok(potatoFocus.trace.includes('symbolic_token_potato'), 'focus trace must point to the constructed body token');

const fakeFocus = UnitBrain.focusExpression(root, { token: 'not_in_body' });
assert.strictEqual(fakeFocus.ok, false, 'focus must fail when no ordered body construction derives the token');
assert.strictEqual(fakeFocus.visible_expression, '');
assert.strictEqual(fakeFocus.obligation.satisfied, false);

const refined = UnitBrain.refineByContact(root.root, {
  path: ['brain', 'truth'],
  children: [
    { id: 'contact', w: 3 },
    { id: 'contradiction_guard', w: 1 },
    { id: 'belief_separation', w: 2 }
  ]
});

assert.strictEqual(refined.ok, true);
assert.deepStrictEqual(refined.refinement.path, ['brain', 'truth']);
const truth = refined.root.children.find(x => x.id === 'truth');
assert.strictEqual(truth.vague, false);
near(truth.child_total, 1, 'refined truth aspects must conserve one');
assert.strictEqual(truth.children.length, 3);

const live = UnitBrain.liveProjection({
  state: {
    t: 4,
    internal_state: {
      generation: 3,
      symbols: ['a', 'b', 'c'],
      relations: [{ id: 'r1' }],
      mutations: [{ id: 'm1' }],
      virtual_edits: [{ path: 'virtual' }]
    },
    reflection: {
      coupling: {
        language: { coherence: 1, growth_pressure: 0.25 },
        truth: { contact: 1, damage: 0 },
        source: { identity: 1 },
        action: { mutation_pressure: 0.5 }
      }
    }
  },
  expression: {
    objective_reality_gate: { score: 1 }
  }
});

assert.strictEqual(live.ok, true);
assert.strictEqual(live.root.id, 'one_logic_brain');
assert.strictEqual(live.contact.truth_contact, 1);
assert.strictEqual(live.contact.language_growth_pressure, 0.25);
near(live.root.child_total, 1, 'live projection root must conserve one');
live.root.children.forEach(child => near(child.child_total, 1, `${child.id} must conserve one`));
assert.strictEqual(live.node_count > 15, true, 'live projection must materialize the current one-logic body as recursive units');
assert.strictEqual(live.self_definition.constructed_expressions[0].visible_expression, 'potato');
assert.strictEqual(live.focus_expression_demonstrations.length, 1);
assert.strictEqual(live.focus_expression_demonstrations[0].visible_expression, 'potato');
assert.strictEqual(live.focus_expression_demonstrations[0].source, 'body_ordered_symbol_sequence');
assert.strictEqual(live.focus_expression_demonstrations[0].ok, true);

console.log('recursive-unit-brain-core-v0-1-test: all checks passed');
