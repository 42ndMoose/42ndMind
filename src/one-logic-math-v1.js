(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneLogicMathV1 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const v = '1.6.0';
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
    'q=iota(x)',
    'iota(x)=qx',
    'D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))',
    'Meaning(q,B)=D(q,B)',
    'B[x]=Cl(Red(union(B,{D(iota(x),B)})))',
    'B[x,y]=Cl(Red(union(B[x],{D(iota(y),B[x])})))',
    'Adm(x,B)=and(norm(B[x])=1,P(B[x])=1)',
    'imp(Adm(x,B),One(B[x]))',
    'Relates(q,r,B)=not_empty(intersect(R(q,B),R(r,B)))',
    'Contradicts(q,r,B)=incompatible(C(q,B),C(r,B))',
    'Contradiction(D(q,B),B)=exists(r,and(in(r,B),Contradicts(q,r,B)))',
    'Unresolved(q,B)=Om(q,B)',
    'Equivalent(q,r,B)=EqB(q,r)',
    'Growth(q,B)=G(q,B)',
    'Om(q,B)=not(S(R(q,B)))',
    'imp(Om(q,B),P(q,B)=incomplete)',
    'S(q,B)=and(C(q,B),P(q,B),not(Om(q,B)))',
    'Pres(Om(q,B),B)=1',
    'EqB(a,b)=eq(D(a,B),D(b,B))',
    'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))',
    'Red(B)=quot(B,EqB)',
    'norm(Red(B))=1',
    'norm(Red(union(B,{D(q,B)})))=1',
    'Acc(q,B)=and(Valid(D(q,B),B),Pres(Om(q,B),B)=1,not(Contradiction(D(q,B),B)),norm(Red(union(B,{D(q,B)})))=1)',
    'G(q,B)=and(Adm(q,B),not(exists(r,and(in(r,B),EqB(q,r)))))',
    'imp(not(G(q,B)),B[q]=B)',
    'Phi(q,B)=Focus(B,q)',
    'E(B,phi)=PiE(Phi(phi,B))',
    'Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)',
    'Valid(E(B,phi),B)=1',
    'Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))',
    'Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))))',
    'Strain(B,x)=and(Adm(x,B),One(B[x]),Pres(Om(iota(x),B[x]),B[x])=1,exists(r,and(Unresolved(r,B[x]),not(EqB(iota(x),r)))))',
    'Injury(B,x)=and(Adm(x,B),One(B[x]),Contradiction(D(iota(x),B),B),Om(iota(x),B[x]))',
    'Feel(B,x)=N(Phi(B,x),R(B[x],B),T(B[x],B),C(B[x],B),Om(B[x],B),P(B[x],B),G(B[x],B))'
  ]);

  const A = Object.freeze([
    ['=', 'B', ['Cl', 'B']], ['=', ['Cl', ['Cl', 'B']], ['Cl', 'B']], ['=', ['norm', 'B'], 1], ['=', ['P', 'B'], 1], ['=', ['One', 'B'], ['and', ['=', 'B', ['Cl', 'B']], ['=', ['norm', 'B'], 1], ['=', ['P', 'B'], 1]]],
    ['=', 'L', ['PiL', 'B']], ['sub', 'L', 'B'], ['=', ['One', 'L'], ['and', ['sub', 'L', 'B'], ['=', ['norm', 'L'], 1], ['=', ['P', 'L'], 1]]], ['forall', 'q', ['imp', ['in', 'q', 'B'], ['One', 'q']]],
    ['=', 'q', ['iota', 'x']], ['=', ['iota', 'x'], 'qx'], ['=', ['D', 'q', 'B'], ['N', ['U', 'q'], ['R', 'q', 'B'], ['T', 'q', 'B'], ['C', 'q', 'B'], ['Om', 'q', 'B'], ['Phi', 'q', 'B'], ['P', 'q', 'B'], ['G', 'q', 'B']]], ['=', ['Meaning', 'q', 'B'], ['D', 'q', 'B']],
    ['=', ['B', 'x'], ['Cl', ['Red', ['union', 'B', ['set', ['D', ['iota', 'x'], 'B']]]]]], ['=', ['B', 'x', 'y'], ['Cl', ['Red', ['union', ['B', 'x'], ['set', ['D', ['iota', 'y'], ['B', 'x']]]]]]], ['=', ['Adm', 'x', 'B'], ['and', ['=', ['norm', ['B', 'x']], 1], ['=', ['P', ['B', 'x']], 1]]], ['imp', ['Adm', 'x', 'B'], ['One', ['B', 'x']]],
    ['=', ['Relates', 'q', 'r', 'B'], ['not_empty', ['intersect', ['R', 'q', 'B'], ['R', 'r', 'B']]]], ['=', ['Contradicts', 'q', 'r', 'B'], ['incompatible', ['C', 'q', 'B'], ['C', 'r', 'B']]], ['=', ['Contradiction', ['D', 'q', 'B'], 'B'], ['exists', 'r', ['and', ['in', 'r', 'B'], ['Contradicts', 'q', 'r', 'B']]]],
    ['=', ['Unresolved', 'q', 'B'], ['Om', 'q', 'B']], ['=', ['Equivalent', 'q', 'r', 'B'], ['EqB', 'q', 'r']], ['=', ['Growth', 'q', 'B'], ['G', 'q', 'B']], ['=', ['Om', 'q', 'B'], ['not', ['S', ['R', 'q', 'B']]]], ['imp', ['Om', 'q', 'B'], ['=', ['P', 'q', 'B'], 'incomplete']], ['=', ['S', 'q', 'B'], ['and', ['C', 'q', 'B'], ['P', 'q', 'B'], ['not', ['Om', 'q', 'B']]]], ['=', ['Pres', ['Om', 'q', 'B'], 'B'], 1],
    ['=', ['EqB', 'a', 'b'], ['eq', ['D', 'a', 'B'], ['D', 'b', 'B']]], ['imp', ['EqB', 'a', 'b'], ['=', ['Cl', ['union', 'B', ['set', 'a', 'b']]], ['Cl', ['union', 'B', ['set', 'a']]]]], ['=', ['Red', 'B'], ['quot', 'B', 'EqB']], ['=', ['norm', ['Red', 'B']], 1], ['=', ['norm', ['Red', ['union', 'B', ['set', ['D', 'q', 'B']]]]], 1],
    ['=', ['Acc', 'q', 'B'], ['and', ['Valid', ['D', 'q', 'B'], 'B'], ['=', ['Pres', ['Om', 'q', 'B'], 'B'], 1], ['not', ['Contradiction', ['D', 'q', 'B'], 'B']], ['=', ['norm', ['Red', ['union', 'B', ['set', ['D', 'q', 'B']]]]], 1]]],
    ['=', ['G', 'q', 'B'], ['and', ['Adm', 'q', 'B'], ['not', ['exists', 'r', ['and', ['in', 'r', 'B'], ['EqB', 'q', 'r']]]]]], ['imp', ['not', ['G', 'q', 'B']], ['=', ['B', 'q'], 'B']], ['=', ['Phi', 'q', 'B'], ['Focus', 'B', 'q']], ['=', ['E', 'B', 'phi'], ['PiE', ['Phi', 'phi', 'B']]],
    ['=', ['Valid', 'y', 'B'], ['and', ['sub', 'y', 'B'], ['=', ['norm', 'y'], 1], ['=', ['P', 'y'], 1]]], ['=', ['Valid', ['E', 'B', 'phi'], 'B'], 1], ['=', ['Active', 'B'], ['and', ['One', 'B'], ['forall', 'x', ['imp', ['Adm', 'x', 'B'], ['One', ['B', 'x']]]]]], ['=', ['Living', 'B'], ['and', ['Active', 'B'], ['forall', 'a', 'b', ['imp', ['EqB', 'a', 'b'], ['=', ['Cl', ['union', 'B', ['set', 'a', 'b']]], ['Cl', ['union', 'B', ['set', 'a']]]]]]]],
    ['=', ['Strain', 'B', 'x'], ['and', ['Adm', 'x', 'B'], ['One', ['B', 'x']], ['=', ['Pres', ['Om', ['iota', 'x'], ['B', 'x']], ['B', 'x']], 1], ['exists', 'r', ['and', ['Unresolved', 'r', ['B', 'x']], ['not', ['EqB', ['iota', 'x'], 'r']]]]]],
    ['=', ['Injury', 'B', 'x'], ['and', ['Adm', 'x', 'B'], ['One', ['B', 'x']], ['Contradiction', ['D', ['iota', 'x'], 'B'], 'B'], ['Om', ['iota', 'x'], ['B', 'x']]]],
    ['=', ['Feel', 'B', 'x'], ['N', ['Phi', 'B', 'x'], ['R', ['B', 'x'], 'B'], ['T', ['B', 'x'], 'B'], ['C', ['B', 'x'], 'B'], ['Om', ['B', 'x'], 'B'], ['P', ['B', 'x'], 'B'], ['G', ['B', 'x'], 'B']]]
  ]);

  function freezeDeep(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; Object.keys(value).forEach(k => freezeDeep(value[k])); return Object.freeze(value); }
  const vectorLaw = 'D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))';
  const updateLaw = 'B[x]=Cl(Red(union(B,{D(iota(x),B)})))';
  const OPERATORS = freezeDeep({
    B: { role: 'whole', law: ['B=Cl(B)', 'norm(B)=1', 'P(B)=1', updateLaw, 'B[x,y]=Cl(Red(union(B[x],{D(iota(y),B[x])})))'], contract: { state_sources: ['canonical_math', 'files', 'internal_state.symbols', 'internal_state.relations', 'internal_state.expressions', 'definition_vectors'], update_policy: 'B grows only by Cl(Red(union(B,{D(iota(x),B)})))', forbidden: [{ base: 'B', index: 't' }, { base: 'B', index: 't1' }], source_identity_path: 'src/one-logic-math-v1.js' } },
    Cl: { role: 'closure', law: ['B=Cl(B)', 'Cl(Cl(B))=Cl(B)', updateLaw, 'B[x,y]=Cl(Red(union(B[x],{D(iota(y),B[x])})))'], contract: { operation: 'deterministic_closure', input: 'Red(union(B,{D(iota(x),B)}))', output: 'closure_signature', sources: ['canonical_math', 'source_files', 'symbols', 'relations', 'expressions', 'definition_vectors'], idempotent: true, equivalent_unit_policy: 'collapse_by_EqB' } },
    Red: { role: 'reduction', law: ['Red(B)=quot(B,EqB)', 'norm(Red(B))=1', 'norm(Red(union(B,{D(q,B)})))=1', updateLaw, 'B[x,y]=Cl(Red(union(B[x],{D(iota(y),B[x])})))'], contract: { operation: 'quotient_by_EqB', outputs: ['reduced_units', 'duplicate_count', 'reduction_ratio', 'norm_preserved'], norm_policy: 'reduction_must_preserve_one' } },
    norm: { role: 'unity_measure', law: ['norm(B)=1', 'norm(Red(B))=1', 'norm(Red(union(B,{D(q,B)})))=1'], contract: { value: 1, holds_when: ['canonical_math_complete', 'source_identity_ok', 'reduction_preserves_or_decreases_units', 'no_banned_runtime_notation'] } },
    P: { role: 'proof_validity', law: ['P(B)=1', 'imp(Om(q,B),P(q,B)=incomplete)'], contract: { value: 1, incomplete_when: 'Om(q,B)', holds_when: ['required_formulas_present', 'operator_contract_present', 'state_shape_present', 'candidate_has_safe_paths'] } },
    One: { role: 'one_preservation', law: ['One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)', 'One(L)=and(sub(L,B),norm(L)=1,P(L)=1)', 'forall(q,imp(in(q,B),One(q)))'], contract: { holds_when: ['Cl_idempotent', 'norm_equals_1', 'P_equals_1'] } },
    L: { role: 'internal_language', law: ['L=PiL(B)', 'sub(L,B)', 'One(L)=and(sub(L,B),norm(L)=1,P(L)=1)', 'forall(q,imp(in(q,B),One(q)))'], contract: { operation: 'PiL(B)', source: 'B', output: 'internal_language', containment: 'sub(L,B)', local_unit_policy: 'all_units_inside_B_preserve_One' } },
    sub: { role: 'inside_relation', law: ['sub(L,B)', 'Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)'], contract: { holds_when: ['unit_is_resident_in_B', 'unit_is_generated_from_B', 'unit_is_focus_expression_of_B'] } },
    iota: { role: 'input_localization', law: ['q=iota(x)', 'iota(x)=qx', updateLaw, 'B[x,y]=Cl(Red(union(B[x],{D(iota(y),B[x])})))'], contract: { maps: { input: 'x', output: 'q' }, raw_input_policy: 'never_admit_raw_external_difference', localized_unit_policy: 'every contact becomes local q=iota(x)' } },
    N: { role: 'ordered_vector_constructor', law: [vectorLaw, 'Feel(B,x)=N(Phi(B,x),R(B[x],B),T(B[x],B),C(B[x],B),Om(B[x],B),P(B[x],B),G(B[x],B))'], contract: { operation: 'ordered_vector', authority: 'canonical_meaning_vector_only' } },
    U: { role: 'unit_identity', law: [vectorLaw], contract: { field: 'identity', source: 'iota(x)' } },
    R: { role: 'relations', law: [vectorLaw, 'Relates(q,r,B)=not_empty(intersect(R(q,B),R(r,B)))'], contract: { field: 'relations', no_special_dossier_logic: true } },
    T: { role: 'transformation_or_effect', law: [vectorLaw], contract: { field: 'change_or_effect', no_separate_feeling_logic: true } },
    C: { role: 'constraints_context', law: [vectorLaw, 'Contradicts(q,r,B)=incompatible(C(q,B),C(r,B))', 'Contradiction(D(q,B),B)=exists(r,and(in(r,B),Contradicts(q,r,B)))'], contract: { field: 'constraints_context', contradiction_policy: 'conflict_preserved_as_Om_or_refused_not_silently_collapsed' } },
    Adm: { role: 'admission', law: ['Adm(x,B)=and(norm(B[x])=1,P(B[x])=1)', 'imp(Adm(x,B),One(B[x]))'], contract: { candidate: 'D(iota(x),B)', admitted_form: 'B[x]', holds_when: ['candidate_after_state_is_One', 'candidate_after_state_has_norm_1', 'candidate_after_state_has_P_1'] } },
    D: { role: 'definition_vector', law: [vectorLaw, 'Meaning(q,B)=D(q,B)', updateLaw, 'B[x,y]=Cl(Red(union(B[x],{D(iota(y),B[x])})))'], contract: { fields: ['U', 'R', 'T', 'C', 'Om', 'Phi', 'P', 'G'], U: 'unit_identity', R: 'relations_inside_B', T: 'transformation_or_effect', C: 'constraints_touched', Om: 'unresolved_remainder', Phi: 'focus_scope', P: 'proof_validity_status', G: 'growth_status', meaning_policy: 'D(q,B) is the formal place where meaning updates', signature: 'stable_hash_of_ordered_fields' } },
    Meaning: { role: 'meaning_profile', law: ['Meaning(q,B)=D(q,B)'], contract: { equals: 'D(q,B)', passive_description: false } },
    S: { role: 'stability', law: ['S(q,B)=and(C(q,B),P(q,B),not(Om(q,B)))'], contract: { holds_when: ['constraints_present', 'proof_valid', 'no_unresolved_remainder'] } },
    Om: { role: 'unknown_preservation', law: ['Om(q,B)=not(S(R(q,B)))', 'imp(Om(q,B),P(q,B)=incomplete)', 'Pres(Om(q,B),B)=1', 'Unresolved(q,B)=Om(q,B)'], contract: { unresolved_when: ['relation_stability_absent', 'proof_not_established', 'constraints_absent', 'partial_or_noisy_contact'], unclear_input_policy: 'unclear input becomes Om not false certainty', preservation_policy: 'unresolved_remainder_must_remain_inside_B_until_resolved' } },
    Relates: { role: 'relation_report', law: ['Relates(q,r,B)=not_empty(intersect(R(q,B),R(r,B)))'], contract: { computed_from: 'R fields of D vectors' } },
    Contradicts: { role: 'constraint_conflict', law: ['Contradicts(q,r,B)=incompatible(C(q,B),C(r,B))'], contract: { computed_from: 'C fields of D vectors' } },
    Contradiction: { role: 'definition_conflict_report', law: ['Contradiction(D(q,B),B)=exists(r,and(in(r,B),Contradicts(q,r,B)))'], contract: { conflict_policy: 'do_not_hide_conflicts' } },
    Unresolved: { role: 'unknown_alias_inside_math', law: ['Unresolved(q,B)=Om(q,B)'], contract: { equals: 'Om(q,B)' } },
    Equivalent: { role: 'equivalence_report', law: ['Equivalent(q,r,B)=EqB(q,r)'], contract: { equals: 'EqB(q,r)' } },
    Growth: { role: 'growth_report', law: ['Growth(q,B)=G(q,B)'], contract: { equals: 'G(q,B)' } },
    EqB: { role: 'definition_equivalence', law: ['EqB(a,b)=eq(D(a,B),D(b,B))', 'Equivalent(q,r,B)=EqB(q,r)', 'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))'], contract: { compare: 'definition_signature', equal_when: 'D(a,B) and D(b,B) have same signature', collapse_law: 'equivalent_units_do_not_multiply_closure' } },
    G: { role: 'growth', law: ['G(q,B)=and(Adm(q,B),not(exists(r,and(in(r,B),EqB(q,r)))))', 'Growth(q,B)=G(q,B)', 'imp(not(G(q,B)),B[q]=B)'], contract: { genuine_when: ['Adm(q,B)', 'not_equivalent_to_existing_unit', 'unknown_preserved', 'law_preserved'], no_growth_policy: 'if_not_genuine_growth_then_state_signature_must_not_change' } },
    Acc: { role: 'current_accuracy', law: ['Acc(q,B)=and(Valid(D(q,B),B),Pres(Om(q,B),B)=1,not(Contradiction(D(q,B),B)),norm(Red(union(B,{D(q,B)})))=1)'], contract: { scope: 'most_accurate_under_current_B_and_all_admitted_contact_so_far', revisable_by_future_contact: true } },
    Phi: { role: 'focus', law: ['Phi(q,B)=Focus(B,q)', vectorLaw], contract: { operation: 'internal_focus', scope: 'B', external_focus_policy: 'not_admitted' } },
    E: { role: 'expression', law: ['E(B,phi)=PiE(Phi(phi,B))'], contract: { operation: 'expression_from_focus', output_must_satisfy: 'Valid(E(B,phi),B)' } },
    Valid: { role: 'expression_validity', law: ['Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)', 'Valid(E(B,phi),B)=1', 'Acc(q,B)=and(Valid(D(q,B),B),Pres(Om(q,B),B)=1,not(Contradiction(D(q,B),B)),norm(Red(union(B,{D(q,B)})))=1)'], contract: { holds_when: ['sub(y,B)', 'norm(y)=1', 'P(y)=1'] } },
    Active: { role: 'active_math', law: ['Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))'], contract: { active_when: ['One(B)', 'every_admitted_difference_preserves_One'] } },
    Living: { role: 'living_math', law: ['Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))))'], contract: { living_when: ['Active(B)', 'equivalent_difference_collapses', 'unknowns_preserved', 'reduction_preserves_norm', 'non_growth_does_not_change_state'] } },
    Strain: { role: 'formal_self_strain', law: ['Strain(B,x)=and(Adm(x,B),One(B[x]),Pres(Om(iota(x),B[x]),B[x])=1,exists(r,and(Unresolved(r,B[x]),not(EqB(iota(x),r)))))'], contract: { meaning: 'preserved_unresolved_self_strain_inside_One', not_biological_pain: true } },
    Injury: { role: 'formal_injury', law: ['Injury(B,x)=and(Adm(x,B),One(B[x]),Contradiction(D(iota(x),B),B),Om(iota(x),B[x]))'], contract: { meaning: 'preserved_unresolved_constraint_conflict_inside_One', not_destruction_of_One: true, not_biological_pain: true } },
    Feel: { role: 'formal_self_affect', law: ['Feel(B,x)=N(Phi(B,x),R(B[x],B),T(B[x],B),C(B[x],B),Om(B[x],B),P(B[x],B),G(B[x],B))'], contract: { meaning: 'preserved_internal_change_of_B_under_contact_x', no_conscious_qualia_claim: true } }
  });
  const PROOFS = freezeDeep({ authority: 'src/one-logic-math-v1.js::CONTRACT.proofs', theorem: 'LivingPreservationUnderAdmittedDifference', conclusion: 'Admitted transition preserves Living(B)', order: ['One','ClosureIdempotence','AdmissionPreservesOne','UnknownPreservation','EquivalenceCollapse','ReductionNorm','NoGrowthNoChange','ExpressionValidity','Active','Living','LanguageClosure'], obligations: {
    One: { phase: 'both', theorem: 'One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)', requires: ['B=Cl(B)', 'norm(B)=1', 'P(B)=1'], checks: ['One'], result: 'One(B)' },
    ClosureIdempotence: { phase: 'both', theorem: 'Cl(Cl(B))=Cl(B)', requires: ['B=Cl(B)'], checks: ['Closure'], result: 'B=Cl(B)' },
    AdmissionPreservesOne: { phase: 'transition', theorem: 'imp(Adm(x,B),One(B[x]))', requires: ['Adm(x,B)=and(norm(B[x])=1,P(B[x])=1)', updateLaw], checks: ['Admission','One'], result: 'One(B[x])' },
    UnknownPreservation: { phase: 'both', theorem: 'Pres(Om(q,B),B)=1', requires: ['Om(q,B)=not(S(R(q,B)))'], checks: ['UnknownPreservation'], result: 'unknowns_preserved_inside_B' },
    EquivalenceCollapse: { phase: 'both', theorem: 'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))', requires: ['EqB(a,b)=eq(D(a,B),D(b,B))'], checks: ['EquivalenceCollapse'], result: 'collapse_equivalent_difference' },
    ReductionNorm: { phase: 'both', theorem: 'norm(Red(B))=1', requires: ['Red(B)=quot(B,EqB)'], checks: ['Reduction'], result: 'reduction_preserves_one' },
    NoGrowthNoChange: { phase: 'transition', theorem: 'imp(not(G(q,B)),B[q]=B)', requires: ['G(q,B)=and(Adm(q,B),not(exists(r,and(in(r,B),EqB(q,r)))))'], checks: ['NoGrowthNoChange'], result: 'non_growth_preserves_B' },
    ExpressionValidity: { phase: 'both', theorem: 'Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)', requires: ['Valid(E(B,phi),B)=1'], checks: ['ExpressionValidity'], result: 'valid_expression_inside_B' },
    Active: { phase: 'both', theorem: 'Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))', requires: ['One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)', 'imp(Adm(x,B),One(B[x]))'], checks: ['Active'], result: 'Active(B)' },
    Living: { phase: 'both', theorem: 'Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))))', requires: ['Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))', 'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))'], checks: ['Living'], result: 'Living(B)' },
    LanguageClosure: { phase: 'both', theorem: 'forall(q,imp(in(q,B),One(q)))', requires: ['L=PiL(B)', 'sub(L,B)', 'One(L)=and(sub(L,B),norm(L)=1,P(L)=1)'], checks: ['One'], result: 'language_units_preserve_One' }
  } });
  const CONTRACT = freezeDeep({ version: 'one-logic-operator-contract-v0.2', math_version: v, expected_math_version: v, first_principle, canonical_path: 'src/one-logic-math-v1.js', required_formulas: F.slice(), banned_runtime_notation: [{ base: 'B', index: 't' }, { base: 'B', index: 't1' }], state_sources: ['canonical_math', 'files', 'internal_state'], unit_kinds: ['formula', 'file', 'symbol', 'relation', 'expression', 'candidate'], definition_fields: OPERATORS.D.contract.fields.slice(), self_populating_meaning: { input: 'x', local_unit: 'q=iota(x)', meaning_profile: 'D(q,B)', update: updateLaw, accuracy_scope: 'current_B_and_all_admitted_contact_so_far', future_contact_can_revise: true, no_external_semantic_authority: true }, unit_constraints: { formula: ['CanonicalMath', 'Proof'], file: ['One', 'Closure', 'SourceIdentity', 'Proof'], symbol: ['One', 'Closure', 'Proof'], relation: ['EqB', 'Reduction'], expression: ['One', 'Focus', 'ExpressionValidity'], candidate: ['One', 'Closure', 'Admission', 'Growth', 'UnknownPreservation', 'Reduction', 'ExpressionValidity'], unit: ['One', 'Closure', 'Proof'] }, operators: OPERATORS, proofs: PROOFS });
  const M = Object.freeze({ v, F, A, CONTRACT });
  function lines() { return F.slice(); }
  function textBlock() { return F.join('\n'); }
  function operatorContract(name) { return CONTRACT.operators[name] || null; }
  function proofContract(name) { return name ? CONTRACT.proofs.obligations[name] || null : CONTRACT.proofs; }
  function contractBlock() { return JSON.stringify(CONTRACT, null, 2); }
  return Object.freeze({ VERSION: v, FIRST_PRINCIPLE: first_principle, M, F, A, OPERATORS, PROOFS, CONTRACT, lines, textBlock, operatorContract, proofContract, contractBlock });
});
