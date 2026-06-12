const assert = require('assert');
const UnitBrain = require('../src/recursive-unit-brain-core-v0-1.js');

function near(value, target, message) {
  assert.ok(Math.abs(Number(value) - Number(target)) < 1e-6, message || `expected ${value} near ${target}`);
}

assert.strictEqual(UnitBrain.VERSION, '0.5.0');
assert.strictEqual(typeof UnitBrain.normalizeNode, 'function');
assert.strictEqual(typeof UnitBrain.project, 'function');
assert.strictEqual(typeof UnitBrain.refineByContact, 'function');
assert.strictEqual(typeof UnitBrain.liveProjection, 'function');
assert.strictEqual(typeof UnitBrain.selfDefine, 'function');
assert.strictEqual(typeof UnitBrain.focusExpression, 'function');

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

assert.strictEqual(live.packet_type, '42ndMind_recursive_unit_brain_projection_v0_1');
assert.strictEqual(live.ok, true);
assert.strictEqual(live.root.id, 'one_logic_brain');
assert.strictEqual(live.principle, 'recursive_unit_total_state_projected_through_kernel_constraints');
assert.strictEqual(live.contact.truth_contact, 1);
assert.strictEqual(live.contact.language_growth_pressure, 0.25);
near(live.root.child_total, 1, 'live projection root must conserve one');
live.root.children.forEach(child => near(child.child_total, 1, `${child.id} must conserve one`));
const language = live.root.children.find(x => x.id === 'language');
assert.ok(language, 'live projection must define language as local one');
near(language.child_total, 1, 'language must conserve one');
assert.strictEqual(language.meta.invariant, '|L| = 1');
assert.ok(language.children.some(x => x.id === 'expression_units'), 'language must contain expression unit space');
assert.ok(language.children.some(x => x.id === 'relations'), 'language must contain relation field');
assert.ok(language.children.some(x => x.id === 'unresolveds'), 'language must preserve unknowns inside language');
assert.strictEqual(live.unit_violation_count, 0);
assert.strictEqual(live.max_depth >= 7, true);
assert.strictEqual(live.node_count > 40, true, 'live projection must materialize language as a local one with semantic focus route and symbol construction');
assert.strictEqual(live.self_definition.packet_type, '42ndMind_recursive_unit_self_definition_v0_1');
assert.ok(live.self_definition.root_formulas.some(line => line.includes('⊕')), 'self definition must generate aspect formula from brain');
assert.strictEqual(live.self_definition.language_one.invariant, '|L| = 1');
assert.ok(live.self_definition.language_one.formulas.some(line => line.startsWith('L =') || line.startsWith('L=')), 'self definition must expose language as a local one');
assert.strictEqual(live.self_definition.constructed_expressions[0].visible_expression, 'potato');
assert.ok(live.self_definition.constructed_expressions[0].reduction.includes('p + o + t + a + t + o'));
assert.strictEqual(live.self_definition.semantic_focuses[0].focus_operator, 'F_food_noun');
assert.deepStrictEqual(live.self_definition.semantic_focuses[0].route, ['one_logic_brain', 'language', 'expression_units', 'word_class_noun', 'semantic_domain_food', 'candidate_set_food_noun']);
assert.strictEqual(live.self_definition.semantic_focuses[0].language_invariant, '|L| = 1');
assert.strictEqual(live.self_definition.semantic_focuses[0].visible_expression, 'potato');
assert.strictEqual(live.self_definition.semantic_focuses[0].selected_candidate.id, 'candidate_potato');

const potatoFocus = UnitBrain.focusExpression(live, { token: 'potato' });
assert.strictEqual(potatoFocus.packet_type, '42ndMind_recursive_unit_focus_expression_v0_1');
assert.strictEqual(potatoFocus.ok, true, 'potato focus must be valid only when the semantic route selects and constructs it');
assert.strictEqual(potatoFocus.visible_expression, 'potato');
assert.strictEqual(potatoFocus.focus_formula, 'F_food_noun(B) -> potato');
assert.strictEqual(potatoFocus.brain_invariant, '|B| = 1');
assert.strictEqual(potatoFocus.language_invariant, '|L| = 1');
assert.strictEqual(potatoFocus.source, 'semantic_focus_then_ordered_symbol_sequence');
assert.strictEqual(potatoFocus.semantic_focus.selected_candidate.id, 'candidate_potato');
assert.strictEqual(potatoFocus.semantic_focus.construction.reduction, 'p + o + t + a + t + o -> potato');
assert.strictEqual(potatoFocus.construction.visible_expression, 'potato');
assert.strictEqual(potatoFocus.obligation.satisfied, true);
assert.strictEqual(potatoFocus.obligation.focused_expression_must_preserve_language_one, true);
assert.ok(potatoFocus.trace.includes('symbolic_token_potato'), 'focus trace must pass through the constructed symbol token');

const fakeFocus = UnitBrain.focusExpression(live, { token: 'not_in_body' });
assert.strictEqual(fakeFocus.ok, false, 'focus must fail when no semantic route or ordered body construction derives the token');
assert.strictEqual(fakeFocus.visible_expression, '');
assert.strictEqual(fakeFocus.obligation.satisfied, false);

const refined = UnitBrain.refineByContact(live.root, {
  path: ['one_logic_brain', 'truth'],
  children: [
    { id: 'contact', w: 3 },
    { id: 'contradiction_guard', w: 1 },
    { id: 'belief_separation', w: 2 }
  ]
});

assert.strictEqual(refined.ok, true);
assert.deepStrictEqual(refined.refinement.path, ['one_logic_brain', 'truth']);
const truth = refined.root.children.find(x => x.id === 'truth');
assert.strictEqual(truth.vague, false);
near(truth.child_total, 1, 'refined truth aspects must conserve one');
assert.strictEqual(truth.children.length, 4);

console.log('recursive-unit-brain-core-v0-1-test: all checks passed');
