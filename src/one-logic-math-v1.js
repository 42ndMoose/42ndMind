(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneLogicMathV1 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const v = '1.5.0';
  const first_principle = 'All admitted difference must preserve the one.';

  const F = Object.freeze([
    'B=Cl(B)',
    'Cl(Cl(B))=Cl(B)',
    'norm(B)=1',
    'P(B)=1',
    'One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)',
    'L=PiL(B)',
    'sub(L,B)',
    'One(L)=and(sub(L,B),norm(L)=1,P(L)=1)',
    'forall(q,imp(in(q,B),One(q)))',
    'iota(x)=qx',
    'B[x]=Cl(union(B,{qx}))',
    'Adm(x,B)=and(norm(B[x])=1,P(B[x])=1)',
    'imp(Adm(x,B),One(B[x]))',
    'D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))',
    'Om(q,B)=not(S(R(q,B)))',
    'S(q,B)=and(C(q,B),P(q,B),not(Om(q,B)))',
    'Pres(Om(q,B),B)=1',
    'EqB(a,b)=eq(D(a,B),D(b,B))',
    'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))',
    'Red(B)=quot(B,EqB)',
    'norm(Red(B))=1',
    'G(q,B)=and(Adm(q,B),not(exists(r,and(in(r,B),EqB(q,r)))))',
    'imp(not(G(q,B)),B[q]=B)',
    'Phi(q,B)=Focus(B,q)',
    'E(B,phi)=PiE(Phi(phi,B))',
    'Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)',
    'Valid(E(B,phi),B)=1',
    'Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))',
    'Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))))'
  ]);

  const A = Object.freeze([
    ['=', 'B', ['Cl', 'B']],
    ['=', ['Cl', ['Cl', 'B']], ['Cl', 'B']],
    ['=', ['norm', 'B'], 1],
    ['=', ['P', 'B'], 1],
    ['=', ['One', 'B'], ['and', ['=', 'B', ['Cl', 'B']], ['=', ['norm', 'B'], 1], ['=', ['P', 'B'], 1]]],
    ['=', 'L', ['PiL', 'B']],
    ['sub', 'L', 'B'],
    ['=', ['One', 'L'], ['and', ['sub', 'L', 'B'], ['=', ['norm', 'L'], 1], ['=', ['P', 'L'], 1]]],
    ['forall', 'q', ['imp', ['in', 'q', 'B'], ['One', 'q']]],
    ['=', ['iota', 'x'], 'qx'],
    ['=', ['B', 'x'], ['Cl', ['union', 'B', ['set', 'qx']]]],
    ['=', ['Adm', 'x', 'B'], ['and', ['=', ['norm', ['B', 'x']], 1], ['=', ['P', ['B', 'x']], 1]]],
    ['imp', ['Adm', 'x', 'B'], ['One', ['B', 'x']]],
    ['=', ['D', 'q', 'B'], ['N', ['U', 'q'], ['R', 'q', 'B'], ['T', 'q', 'B'], ['C', 'q', 'B'], ['Om', 'q', 'B'], ['Phi', 'q', 'B'], ['P', 'q', 'B'], ['G', 'q', 'B']]],
    ['=', ['Om', 'q', 'B'], ['not', ['S', ['R', 'q', 'B']]]],
    ['=', ['S', 'q', 'B'], ['and', ['C', 'q', 'B'], ['P', 'q', 'B'], ['not', ['Om', 'q', 'B']]]],
    ['=', ['Pres', ['Om', 'q', 'B'], 'B'], 1],
    ['=', ['EqB', 'a', 'b'], ['eq', ['D', 'a', 'B'], ['D', 'b', 'B']]],
    ['imp', ['EqB', 'a', 'b'], ['=', ['Cl', ['union', 'B', ['set', 'a', 'b']]], ['Cl', ['union', 'B', ['set', 'a']]]]],
    ['=', ['Red', 'B'], ['quot', 'B', 'EqB']],
    ['=', ['norm', ['Red', 'B']], 1],
    ['=', ['G', 'q', 'B'], ['and', ['Adm', 'q', 'B'], ['not', ['exists', 'r', ['and', ['in', 'r', 'B'], ['EqB', 'q', 'r']]]]]],
    ['imp', ['not', ['G', 'q', 'B']], ['=', ['B', 'q'], 'B']],
    ['=', ['Phi', 'q', 'B'], ['Focus', 'B', 'q']],
    ['=', ['E', 'B', 'phi'], ['PiE', ['Phi', 'phi', 'B']]],
    ['=', ['Valid', 'y', 'B'], ['and', ['sub', 'y', 'B'], ['=', ['norm', 'y'], 1], ['=', ['P', 'y'], 1]]],
    ['=', ['Valid', ['E', 'B', 'phi'], 'B'], 1],
    ['=', ['Active', 'B'], ['and', ['One', 'B'], ['forall', 'x', ['imp', ['Adm', 'x', 'B'], ['One', ['B', 'x']]]]]],
    ['=', ['Living', 'B'], ['and', ['Active', 'B'], ['forall', 'a', 'b', ['imp', ['EqB', 'a', 'b'], ['=', ['Cl', ['union', 'B', ['set', 'a', 'b']]], ['Cl', ['union', 'B', ['set', 'a']]]]]]]]
  ]);

  function freezeDeep(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(k => freezeDeep(value[k]));
    return Object.freeze(value);
  }

  const OPERATORS = freezeDeep({
    B: { role: 'whole', law: ['B=Cl(B)', 'norm(B)=1', 'P(B)=1'], contract: { state_sources: ['canonical_math', 'files', 'internal_state.symbols', 'internal_state.relations', 'internal_state.expressions'], forbidden: [{ base: 'B', index: 't' }, { base: 'B', index: 't1' }], source_identity_path: 'src/one-logic-math-v1.js' } },
    Cl: { role: 'closure', law: ['B=Cl(B)', 'Cl(Cl(B))=Cl(B)', 'B[x]=Cl(union(B,{qx}))'], contract: { operation: 'deterministic_closure', input: 'state_or_union', output: 'closure_signature', sources: ['canonical_math', 'source_files', 'symbols', 'relations', 'expressions', 'definition_vectors'], idempotent: true, equivalent_unit_policy: 'collapse_by_EqB' } },
    norm: { role: 'unity_measure', law: ['norm(B)=1', 'norm(Red(B))=1'], contract: { value: 1, holds_when: ['canonical_math_complete', 'source_identity_ok', 'reduction_preserves_or_decreases_units', 'no_banned_runtime_notation'] } },
    P: { role: 'proof_validity', law: ['P(B)=1'], contract: { value: 1, holds_when: ['required_formulas_present', 'operator_contract_present', 'state_shape_present', 'candidate_has_safe_paths'] } },
    One: { role: 'one_preservation', law: ['One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)', 'One(L)=and(sub(L,B),norm(L)=1,P(L)=1)', 'forall(q,imp(in(q,B),One(q)))'], contract: { holds_when: ['Cl_idempotent', 'norm_equals_1', 'P_equals_1'] } },
    L: { role: 'internal_language', law: ['L=PiL(B)', 'sub(L,B)', 'One(L)=and(sub(L,B),norm(L)=1,P(L)=1)', 'forall(q,imp(in(q,B),One(q)))'], contract: { operation: 'PiL(B)', source: 'B', output: 'internal_language', containment: 'sub(L,B)', local_unit_policy: 'all_units_inside_B_preserve_One' } },
    sub: { role: 'inside_relation', law: ['sub(L,B)', 'Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)'], contract: { holds_when: ['unit_is_resident_in_B', 'unit_is_generated_from_B', 'unit_is_focus_expression_of_B'] } },
    iota: { role: 'input_localization', law: ['iota(x)=qx'], contract: { maps: { input: 'x', output: 'qx' }, raw_input_policy: 'never_admit_raw_external_difference' } },
    Adm: { role: 'admission', law: ['Adm(x,B)=and(norm(B[x])=1,P(B[x])=1)', 'imp(Adm(x,B),One(B[x]))'], contract: { candidate: 'x', admitted_form: 'B[x]', holds_when: ['candidate_after_state_is_One', 'candidate_after_state_has_norm_1', 'candidate_after_state_has_P_1'] } },
    D: { role: 'definition_vector', law: ['D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))'], contract: { fields: ['U', 'R', 'T', 'C', 'Om', 'Phi', 'P', 'G'], U: 'unit_identity', R: 'relations_inside_B', T: 'transformation_or_effect', C: 'constraints_touched', Om: 'unresolved_remainder', Phi: 'focus_scope', P: 'proof_validity_status', G: 'growth_status', signature: 'stable_hash_of_ordered_fields' } },
    S: { role: 'stability', law: ['S(q,B)=and(C(q,B),P(q,B),not(Om(q,B)))'], contract: { holds_when: ['constraints_present', 'proof_valid', 'no_unresolved_remainder'] } },
    Om: { role: 'unknown_preservation', law: ['Om(q,B)=not(S(R(q,B)))', 'Pres(Om(q,B),B)=1'], contract: { unresolved_when: ['relation_stability_absent', 'proof_not_established', 'constraints_absent'], preservation_policy: 'unresolved_remainder_must_remain_inside_B_until_resolved' } },
    EqB: { role: 'definition_equivalence', law: ['EqB(a,b)=eq(D(a,B),D(b,B))', 'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))'], contract: { compare: 'definition_signature', equal_when: 'D(a,B) and D(b,B) have same signature', collapse_law: 'equivalent_units_do_not_multiply_closure' } },
    Red: { role: 'reduction', law: ['Red(B)=quot(B,EqB)', 'norm(Red(B))=1'], contract: { operation: 'quotient_by_EqB', outputs: ['reduced_units', 'duplicate_count', 'reduction_ratio', 'norm_preserved'], norm_policy: 'reduction_must_preserve_one' } },
    G: { role: 'growth', law: ['G(q,B)=and(Adm(q,B),not(exists(r,and(in(r,B),EqB(q,r)))))', 'imp(not(G(q,B)),B[q]=B)'], contract: { genuine_when: ['Adm(q,B)', 'not_equivalent_to_existing_unit', 'unknown_preserved', 'law_preserved'], no_growth_policy: 'if_not_genuine_growth_then_state_signature_must_not_change' } },
    Phi: { role: 'focus', law: ['Phi(q,B)=Focus(B,q)'], contract: { operation: 'internal_focus', scope: 'B', external_focus_policy: 'not_admitted' } },
    E: { role: 'expression', law: ['E(B,phi)=PiE(Phi(phi,B))'], contract: { operation: 'expression_from_focus', output_must_satisfy: 'Valid(E(B,phi),B)' } },
    Valid: { role: 'expression_validity', law: ['Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)', 'Valid(E(B,phi),B)=1'], contract: { holds_when: ['sub(y,B)', 'norm(y)=1', 'P(y)=1'] } },
    Active: { role: 'active_math', law: ['Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))'], contract: { active_when: ['One(B)', 'every_admitted_difference_preserves_One'] } },
    Living: { role: 'living_math', law: ['Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))'], contract: { living_when: ['Active(B)', 'equivalent_difference_collapses', 'unknowns_preserved', 'reduction_preserves_norm', 'non_growth_does_not_change_state'] } }
  });

  const CONTRACT = freezeDeep({
    version: 'one-logic-operator-contract-v0.1',
    math_version: v,
    expected_math_version: v,
    first_principle,
    canonical_path: 'src/one-logic-math-v1.js',
    required_formulas: F.slice(),
    banned_runtime_notation: [{ base: 'B', index: 't' }, { base: 'B', index: 't1' }],
    state_sources: ['canonical_math', 'files', 'internal_state'],
    unit_kinds: ['formula', 'file', 'symbol', 'relation', 'expression', 'candidate'],
    definition_fields: OPERATORS.D.contract.fields.slice(),
    unit_constraints: { formula: ['CanonicalMath', 'Proof'], file: ['One', 'Closure', 'SourceIdentity', 'Proof'], symbol: ['One', 'Closure', 'Proof'], relation: ['EqB', 'Reduction'], expression: ['One', 'Focus', 'ExpressionValidity'], candidate: ['One', 'Closure', 'Admission', 'Growth', 'UnknownPreservation', 'Reduction', 'ExpressionValidity'], unit: ['One', 'Closure', 'Proof'] },
    operators: OPERATORS
  });

  const M = Object.freeze({ v, F, A, CONTRACT });
  function lines() { return F.slice(); }
  function textBlock() { return F.join('\n'); }
  function operatorContract(name) { return CONTRACT.operators[name] || null; }
  function contractBlock() { return JSON.stringify(CONTRACT, null, 2); }

  return Object.freeze({ VERSION: v, FIRST_PRINCIPLE: first_principle, M, F, A, OPERATORS, CONTRACT, lines, textBlock, operatorContract, contractBlock });
});
