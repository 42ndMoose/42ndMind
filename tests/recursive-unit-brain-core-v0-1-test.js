const assert = require('assert');
const UnitBrain = require('../src/recursive-unit-brain-core-v0-1.js');

function near(value, target, message) {
  assert.ok(Math.abs(Number(value) - Number(target)) < 1e-6, message || `expected ${value} near ${target}`);
}

assert.strictEqual(UnitBrain.VERSION, '0.8.0');
assert.strictEqual(typeof UnitBrain.normalizeNode, 'function');
assert.strictEqual(typeof UnitBrain.project, 'function');
assert.strictEqual(typeof UnitBrain.refineByContact, 'function');
assert.strictEqual(typeof UnitBrain.liveProjection, 'function');
assert.strictEqual(typeof UnitBrain.selfDefine, 'function');
assert.strictEqual(typeof UnitBrain.focusExpression, 'function');
assert.strictEqual(typeof UnitBrain.activeMathLaw, 'function');
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
assert.strictEqual(live.principle, 'universal_active_math_state_projected_through_internal_proof_constraints');
assert.strictEqual(live.root.meta.active_math_law, 'B = U ⊕ R ⊕ X ⊕ C ⊕ Ω ⊕ Φ ⊕ P ⊕ G');
near(live.root.child_total, 1, 'live projection root must conserve one');
live.root.children.forEach(child => near(child.child_total, 1, `${child.id} must conserve one`));

const rootIds = live.root.children.map(x => x.id);
['U_units', 'R_relations', 'X_transformations', 'C_constraints', 'Omega_unresolveds', 'Phi_focus', 'P_proof', 'G_growth'].forEach(id => {
  assert.ok(rootIds.includes(id), `root must include ${id}`);
});

const units = live.root.children.find(x => x.id === 'U_units');
const language = units.children.find(x => x.id === 'language');
assert.ok(language, 'language must be a projection inside U, not a separate root engine');
near(language.child_total, 1, 'language must conserve one');
assert.strictEqual(language.meta.projection, 'π_language(B)');
assert.strictEqual(language.meta.invariant, '|L| = 1');
assert.strictEqual(language.meta.active_math_law, 'L = U_L ⊕ R_L ⊕ X_L ⊕ C_L ⊕ Ω_L ⊕ Φ_L ⊕ P_L ⊕ G_L');
['U_L_expression_units', 'R_L_relations', 'X_L_transformations', 'C_L_constraints', 'Omega_L_unresolveds', 'Phi_L_focus', 'P_L_proof', 'G_L_growth'].forEach(id => {
  assert.ok(language.children.some(x => x.id === id), `language must include ${id}`);
});

const proof = live.root.children.find(x => x.id === 'P_proof');
const proofNode = proof.children.find(x => x.id === 'P_proof_obligations');
assert.ok(proofNode, 'proof obligations must be in P, inside the same active math');
near(proofNode.child_total, 1, 'proof obligations must conserve one');
assert.strictEqual(proofNode.meta.active_math_law, 'P(B) = P_B ⊕ P_L ⊕ P_U ⊕ P_Ω ⊕ P_F');

assert.strictEqual(live.unit_violation_count, 0);
assert.strictEqual(live.proof_violation_count, 0);
assert.strictEqual(live.active_math.universal_law.packet_type, '42ndMind_universal_active_math_law_v0_1');
assert.ok(live.active_math.universal_law.law.includes('B = U ⊕ R ⊕ X ⊕ C ⊕ Ω ⊕ Φ ⊕ P ⊕ G'));
assert.ok(live.active_math.universal_law.law.includes('B_next = closure(B ⊕ input_unit)'));
assert.strictEqual(live.active_math.proof_state.packet_type, '42ndMind_internal_math_proof_state_v0_1');
assert.strictEqual(live.active_math.proof_state.satisfied, true);
assert.strictEqual(live.active_math.proof_state.failed.length, 0);
assert.strictEqual(live.active_math.proof_state.proof_node_path, 'one_logic_brain/P_proof/P_proof_obligations');
assert.strictEqual(live.self_definition.internal_math_proof.satisfied, true);
assert.ok(live.self_definition.internal_math_proof.checks.every(row => row.satisfied === true));

assert.strictEqual(live.active_math.language_law.packet_type, '42ndMind_active_math_language_law_v0_1');
assert.ok(live.active_math.language_law.law.includes('L = U_L ⊕ R_L ⊕ X_L ⊕ C_L ⊕ Ω_L ⊕ Φ_L ⊕ P_L ⊕ G_L'));
assert.ok(live.active_math.language_law.law.includes('∀u ∈ U_L: |u| = 1'));
assert.ok(live.active_math.language_law.law.includes('unknown(u) ⇔ ¬stable(R_L(u))'));

assert.strictEqual(live.self_definition.constructed_expressions[0].visible_expression, 'potato');
assert.ok(live.self_definition.constructed_expressions[0].reduction.includes('p + o + t + a + t + o'));
assert.strictEqual(live.self_definition.semantic_focuses[0].focus_operator, 'F_food_noun');
assert.deepStrictEqual(live.self_definition.semantic_focuses[0].route, ['one_logic_brain', 'U_units', 'language', 'U_L_expression_units', 'word_class_noun', 'semantic_domain_food', 'candidate_set_food_noun']);
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
  path: ['one_logic_brain', 'U_units', 'truth_projection'],
  children: [
    { id: 'contact', w: 3 },
    { id: 'contradiction_guard', w: 1 },
    { id: 'belief_separation', w: 2 }
  ]
});

assert.strictEqual(refined.ok, true);
assert.deepStrictEqual(refined.refinement.path, ['one_logic_brain', 'U_units', 'truth_projection']);
const refinedTruth = refined.root.children.find(x => x.id === 'U_units').children.find(x => x.id === 'truth_projection');
assert.strictEqual(refinedTruth.vague, false);
near(refinedTruth.child_total, 1, 'refined truth projection aspects must conserve one');

console.log('recursive-unit-brain-core-v0-1-test: all checks passed');
