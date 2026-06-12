const assert = require('assert');
const UnitBrain = require('../src/recursive-unit-brain-core-v0-1.js');

function near(value, target, message) {
  assert.ok(Math.abs(Number(value) - Number(target)) < 1e-6, message || `expected ${value} near ${target}`);
}

assert.strictEqual(UnitBrain.VERSION, '0.7.0');
assert.strictEqual(typeof UnitBrain.normalizeNode, 'function');
assert.strictEqual(typeof UnitBrain.project, 'function');
assert.strictEqual(typeof UnitBrain.refineByContact, 'function');
assert.strictEqual(typeof UnitBrain.liveProjection, 'function');
assert.strictEqual(typeof UnitBrain.selfDefine, 'function');
assert.strictEqual(typeof UnitBrain.focusExpression, 'function');
assert.strictEqual(typeof UnitBrain.languageMathLaw, 'function');
assert.strictEqual(typeof UnitBrain.proofState, 'function');

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
  expression: { objective_reality_gate: { score: 1 } }
});

assert.strictEqual(live.packet_type, '42ndMind_recursive_unit_brain_projection_v0_1');
assert.strictEqual(live.ok, true);
assert.strictEqual(live.root.id, 'one_logic_brain');
assert.strictEqual(live.contact.truth_contact, 1);
assert.strictEqual(live.contact.language_growth_pressure, 0.25);
near(live.root.child_total, 1, 'live projection root must conserve one');
live.root.children.forEach(child => near(child.child_total, 1, `${child.id} must conserve one`));

const kernel = live.root.children.find(x => x.id === 'kernel');
const proofNode = kernel.children.find(x => x.id === 'P_proof_obligations');
assert.ok(proofNode, 'proof obligations must be inside the math, under kernel');
near(proofNode.child_total, 1, 'proof obligations must conserve one');
assert.strictEqual(proofNode.meta.active_math_law, 'P(B,L) = P_B ⊕ P_L ⊕ P_U ⊕ P_Ω ⊕ P_F');

const language = live.root.children.find(x => x.id === 'language');
assert.ok(language, 'live projection must define language as local one');
near(language.child_total, 1, 'language must conserve one');
assert.strictEqual(language.meta.invariant, '|L| = 1');
assert.strictEqual(language.meta.active_math_law, 'L = U ⊕ R ⊕ T ⊕ C ⊕ Ω ⊕ G');
assert.ok(language.children.some(x => x.id === 'U_expression_units'));
assert.ok(language.children.some(x => x.id === 'R_relations'));
assert.ok(language.children.some(x => x.id === 'T_transformations'));
assert.ok(language.children.some(x => x.id === 'C_constraints'));
assert.ok(language.children.some(x => x.id === 'Omega_unresolveds'));
assert.ok(language.children.some(x => x.id === 'G_growth_pressure'));

assert.strictEqual(live.unit_violation_count, 0);
assert.strictEqual(live.proof_violation_count, 0);
assert.strictEqual(live.active_math.proof_state.packet_type, '42ndMind_internal_math_proof_state_v0_1');
assert.strictEqual(live.active_math.proof_state.satisfied, true);
assert.strictEqual(live.active_math.proof_state.failed.length, 0);
assert.strictEqual(live.active_math.proof_state.proof_node_path, 'one_logic_brain/kernel/P_proof_obligations');
assert.ok(live.active_math.brain_law.includes('P(B,L) = P_B ⊕ P_L ⊕ P_U ⊕ P_Ω ⊕ P_F'));
assert.strictEqual(live.self_definition.internal_math_proof.satisfied, true);
assert.ok(live.self_definition.internal_math_proof.checks.every(row => row.satisfied === true));

assert.strictEqual(live.active_math.language_law.packet_type, '42ndMind_active_math_language_law_v0_1');
assert.ok(live.active_math.language_law.law.includes('L = U ⊕ R ⊕ T ⊕ C ⊕ Ω ⊕ G'));
assert.ok(live.active_math.language_law.law.includes('∀u ∈ U: |u| = 1'));
assert.ok(live.active_math.language_law.law.includes('unknown(u) ⇔ ¬stable(R(u))'));
assert.strictEqual(live.self_definition.language_math.invariant, '|L| = 1');
assert.ok(live.self_definition.language_one.active_math_law.includes('definition(u) = stable_closure(R(u))'));

assert.strictEqual(live.self_definition.constructed_expressions[0].visible_expression, 'potato');
assert.ok(live.self_definition.constructed_expressions[0].reduction.includes('p + o + t + a + t + o'));
assert.strictEqual(live.self_definition.semantic_focuses[0].focus_operator, 'F_food_noun');
assert.deepStrictEqual(live.self_definition.semantic_focuses[0].route, ['one_logic_brain', 'language', 'U_expression_units', 'word_class_noun', 'semantic_domain_food', 'candidate_set_food_noun']);
assert.strictEqual(live.self_definition.semantic_focuses[0].language_invariant, '|L| = 1');
assert.strictEqual(live.self_definition.semantic_focuses[0].selected_candidate.id, 'candidate_potato');

const potatoFocus = UnitBrain.focusExpression(live, { token: 'potato' });
assert.strictEqual(potatoFocus.packet_type, '42ndMind_recursive_unit_focus_expression_v0_1');
assert.strictEqual(potatoFocus.ok, true);
assert.strictEqual(potatoFocus.visible_expression, 'potato');
assert.strictEqual(potatoFocus.focus_formula, 'F_food_noun(B) -> potato');
assert.strictEqual(potatoFocus.brain_invariant, '|B| = 1');
assert.strictEqual(potatoFocus.language_invariant, '|L| = 1');
assert.strictEqual(potatoFocus.obligation.satisfied, true);
assert.strictEqual(potatoFocus.obligation.focused_expression_must_preserve_language_one, true);

const failedFocus = UnitBrain.focusExpression(live, { token: 'not_present' });
assert.strictEqual(failedFocus.ok, false);
assert.strictEqual(failedFocus.visible_expression, '');
assert.strictEqual(failedFocus.obligation.satisfied, false);

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
