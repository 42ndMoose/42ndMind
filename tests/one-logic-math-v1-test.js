const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');
const P = require('../src/math-law-invariant-prover-v0-1.js');
const G = require('../src/math-law-gate-v0-1.js');
const Proof = require('../src/math-law-proof-checker-v0-1.js');

assert.strictEqual(M.VERSION, '1.6.0');
assert.strictEqual(M.FIRST_PRINCIPLE, 'All admitted difference must preserve the one.');
assert.ok(M.F.includes('B=Cl(B)'));
assert.ok(M.F.includes('Cl(Cl(B))=Cl(B)'));
assert.ok(M.F.includes('One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)'));
assert.ok(M.F.includes('One(L)=and(sub(L,B),norm(L)=1,P(L)=1)'));
assert.ok(M.F.includes('forall(q,imp(in(q,B),One(q)))'));
assert.ok(M.F.includes('q=iota(x)'));
assert.ok(M.F.includes('D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))'));
assert.ok(M.F.includes('Meaning(q,B)=D(q,B)'));
assert.ok(M.F.includes('B[x]=Cl(Red(union(B,{D(iota(x),B)})))'));
assert.ok(M.F.includes('B[x,y]=Cl(Red(union(B[x],{D(iota(y),B[x])})))'));
assert.ok(M.F.includes('imp(Adm(x,B),One(B[x]))'));
assert.ok(M.F.includes('Relates(q,r,B)=not_empty(intersect(R(q,B),R(r,B)))'));
assert.ok(M.F.includes('Contradicts(q,r,B)=incompatible(C(q,B),C(r,B))'));
assert.ok(M.F.includes('Contradiction(D(q,B),B)=exists(r,and(in(r,B),Contradicts(q,r,B)))'));
assert.ok(M.F.includes('Unresolved(q,B)=Om(q,B)'));
assert.ok(M.F.includes('Equivalent(q,r,B)=EqB(q,r)'));
assert.ok(M.F.includes('Growth(q,B)=G(q,B)'));
assert.ok(M.F.includes('imp(Om(q,B),P(q,B)=incomplete)'));
assert.ok(M.F.includes('Pres(Om(q,B),B)=1'));
assert.ok(M.F.includes('EqB(a,b)=eq(D(a,B),D(b,B))'));
assert.ok(M.F.includes('imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))'));
assert.ok(M.F.includes('Red(B)=quot(B,EqB)'));
assert.ok(M.F.includes('Acc(q,B)=and(Valid(D(q,B),B),Pres(Om(q,B),B)=1,not(Contradiction(D(q,B),B)),norm(Red(union(B,{D(q,B)})))=1)'));
assert.ok(M.F.includes('Strain(B,x)=and(Adm(x,B),One(B[x]),Pres(Om(iota(x),B[x]),B[x])=1,exists(r,and(Unresolved(r,B[x]),not(EqB(iota(x),r)))))'));
assert.ok(M.F.includes('Injury(B,x)=and(Adm(x,B),One(B[x]),Contradiction(D(iota(x),B),B),Om(iota(x),B[x]))'));
assert.ok(M.F.includes('Feel(B,x)=N(Phi(B,x),R(B[x],B),T(B[x],B),C(B[x],B),Om(B[x],B),P(B[x],B),G(B[x],B))'));
assert.deepStrictEqual(M.A[0], ['=', 'B', ['Cl', 'B']]);
assert.deepStrictEqual(M.A[1], ['=', ['Cl', ['Cl', 'B']], ['Cl', 'B']]);
assert.deepStrictEqual(Object.keys(M.M).sort(), ['A', 'CONTRACT', 'F', 'v'].sort());

assert.ok(M.CONTRACT);
assert.strictEqual(M.CONTRACT.version, 'one-logic-operator-contract-v0.2');
assert.strictEqual(M.CONTRACT.expected_math_version, '1.6.0');
['Cl','norm','P','sub','iota','N','U','R','T','C','Adm','D','Meaning','Om','Relates','Contradicts','Contradiction','Unresolved','Equivalent','EqB','Red','Growth','G','Acc','Phi','E','Valid','Active','Living','Strain','Injury','Feel'].forEach(name => assert.ok(M.CONTRACT.operators[name], name));
assert.strictEqual(M.operatorContract('D').contract.meaning_policy, 'D(q,B) is the formal place where meaning updates');
assert.strictEqual(M.operatorContract('B').contract.update_policy, 'B grows only by Cl(Red(union(B,{D(iota(x),B)})))');
assert.strictEqual(M.operatorContract('Om').contract.unclear_input_policy, 'unclear input becomes Om not false certainty');
assert.strictEqual(M.operatorContract('Acc').contract.scope, 'most_accurate_under_current_B_and_all_admitted_contact_so_far');
assert.strictEqual(M.operatorContract('Feel').contract.no_conscious_qualia_claim, true);
assert.strictEqual(M.operatorContract('Injury').contract.not_biological_pain, true);
assert.strictEqual(M.operatorContract('Strain').contract.not_biological_pain, true);

const formulas = new Set(M.F);
const contractLaw = new Set(Object.values(M.CONTRACT.operators).flatMap(operator => operator.law || []));
formulas.forEach(formula => assert.ok(contractLaw.has(formula), 'formula has canonical operator contract law: ' + formula));

assert.strictEqual(P.VERSION, '0.1.3');
assert.strictEqual(P.EXPECTED_MATH_VERSION, M.CONTRACT.expected_math_version);
assert.strictEqual(P.CANONICAL_MATH_PATH, M.CONTRACT.canonical_path);
assert.deepStrictEqual(P.REQUIRED, M.CONTRACT.required_formulas);
assert.strictEqual(G.VERSION, '0.1.3');
assert.strictEqual(G.EXPECTED_MATH_VERSION, M.CONTRACT.expected_math_version);
assert.strictEqual(G.CANONICAL_MATH_PATH, M.CONTRACT.canonical_path);
assert.deepStrictEqual(G.REQUIRED, M.CONTRACT.required_formulas);
['closure','closureSignature','verifyClosureIdempotence','candidateAsInput','candidateAfterState','verifyAdmission','defineUnit','definitionSignature','stabilityOf','unknownOf','preservesUnknown','eqB','collapseEquivalentUnits','verifyEquivalenceCollapse','red','verifyReductionNorm','isGrowth','verifyNoGrowthNoChange','focus','expressionOf','validExpression','verifyActive','verifyLiving','evaluateState','evaluateTransition'].forEach(name => assert.strictEqual(typeof P[name], 'function', name));

const canonical = fs.readFileSync(path.join(__dirname, '..', 'src', 'one-logic-math-v1.js'), 'utf8');
const gateSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'math-law-gate-v0-1.js'), 'utf8');
const proverSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'math-law-invariant-prover-v0-1.js'), 'utf8');
assert.ok(!canonical.includes('B_t'));
assert.ok(!canonical.includes('B_t1'));
assert.ok(!canonical.includes('Cl(union(B({a})))'));
assert.ok(!canonical.includes('foccus'));
assert.ok(!proverSource.includes('foccus'));
assert.ok(!canonical.includes('valid in B'));
assert.ok(!proverSource.includes('valid in B'));
assert.ok(!gateSource.includes("const EXPECTED_MATH_VERSION = '1.6.0'"));
assert.ok(!gateSource.includes("const CANONICAL_MATH_PATH = 'src/one-logic-math-v1.js'"));
assert.ok(!gateSource.includes('Object.freeze(Prover && Prover.REQUIRED || ['));
assert.ok(!gateSource.includes("'B=Cl(B)'"));
assert.ok(!proverSource.includes("'B=Cl(B)'"));
assert.ok(!proverSource.includes('required_formulas || ['));
assert.ok(!proverSource.includes("|| 'src/one-logic-math-v1.js'"));

const state = {
  files: { 'src/one-logic-math-v1.js': canonical },
  internal_state: { symbols: ['B', 'B'], relations: [], expressions: [], virtual_edits: [] }
};
const stateReport = P.evaluateState(state, { math: M });
assert.strictEqual(stateReport.theorem_prover, false);
assert.strictEqual(stateReport.invariant_prover, true);
assert.strictEqual(stateReport.contract_version, 'one-logic-operator-contract-v0.2');
assert.strictEqual(stateReport.math_version, '1.6.0');
assert.strictEqual(stateReport.ok, true);
assert.strictEqual(stateReport.One, true);
assert.strictEqual(stateReport.Closure, true);
assert.strictEqual(stateReport.Reduction, true);
assert.strictEqual(stateReport.proved, true);
assert.strictEqual(stateReport.proof.ok, true);
assert.ok(stateReport.reduction.duplicate_count >= 1);

const proofReport = Proof.proveState(state, { math: M, evidence: stateReport });
assert.strictEqual(Proof.VERSION, '0.1.2');
assert.strictEqual(proofReport.ok, true);
assert.strictEqual(proofReport.failed_obligation, null);
assert.ok(proofReport.obligations.length > 0);

const duplicateExpr = { kind: 'expression', id: 'expression:focusB', value: 'focus B' };
const sameMeaningState = {
  files: { 'src/one-logic-math-v1.js': canonical },
  internal_state: { symbols: ['B'], relations: [], expressions: [duplicateExpr, duplicateExpr], virtual_edits: [] }
};
const sameReduction = P.red(sameMeaningState, { math: M });
assert.ok(P.eqB(duplicateExpr, duplicateExpr, sameMeaningState, { math: M }));
assert.ok(sameReduction.duplicate_count >= 1);
assert.strictEqual(sameReduction.norm_preserved, true);

const typoUnit = { kind: 'expression', id: 'expression:noisy-input', value: 'foccus B' };
const typoDefinition = P.defineUnit(typoUnit, state, { math: M });
assert.ok(typoDefinition.Om.ok, 'noisy input is unresolved');
assert.ok(typoDefinition.Om.unresolved.includes('relation_stability_absent'));
assert.notStrictEqual(typoDefinition.U.id, 'focus B');
assert.ok(M.F.includes('imp(Om(q,B),P(q,B)=incomplete)'));

const omittedUnit = { kind: 'expression', id: 'expression:omitted-input', value: 'valid in B' };
const omittedDefinition = P.defineUnit(omittedUnit, state, { math: M });
assert.ok(omittedDefinition.Om.ok, 'omitted expression is unresolved');
assert.notStrictEqual(omittedDefinition.U.id, 'Valid(E(B,phi),B)');
assert.strictEqual(P.preservesUnknown(state, state, { math: M }).ok, true);

const claimTrue = { kind: 'expression', id: 'claim:A:true', value: 'claim A = true' };
const claimFalse = { kind: 'expression', id: 'claim:A:false', value: 'claim A = false' };
const contradictionState = {
  files: { 'src/one-logic-math-v1.js': canonical },
  internal_state: { symbols: ['B'], relations: [], expressions: [claimTrue, claimFalse], virtual_edits: [] }
};
assert.strictEqual(P.eqB(claimTrue, claimFalse, contradictionState, { math: M }), false);
assert.ok(P.defineUnit(claimTrue, contradictionState, { math: M }).Om.ok || P.defineUnit(claimFalse, contradictionState, { math: M }).Om.ok);
assert.strictEqual(P.evaluateState(contradictionState, { math: M }).One, true);
assert.ok(M.F.includes('Contradiction(D(q,B),B)=exists(r,and(in(r,B),Contradicts(q,r,B)))'));

const weakUnit = { kind: 'expression', id: 'meaning:q', value: 'q has weak relation' };
const weakState = {
  files: { 'src/one-logic-math-v1.js': canonical },
  internal_state: { symbols: ['B'], relations: [], expressions: [weakUnit], virtual_edits: [] }
};
const strongerState = {
  files: { 'src/one-logic-math-v1.js': canonical },
  internal_state: { symbols: ['B'], relations: [{ source: 'meaning:q', relation: 'supplies stronger relation/evidence', target: 'known meaning' }], expressions: [weakUnit], virtual_edits: [] }
};
const weakD = P.defineUnit(weakUnit, weakState, { math: M });
const strongD = P.defineUnit(weakUnit, strongerState, { math: M });
assert.ok(weakD.Om.ok);
assert.ok(strongD.R.length > weakD.R.length);
assert.notStrictEqual(P.definitionSignature(weakD), P.definitionSignature(strongD));
assert.strictEqual(P.evaluateState(strongerState, { math: M }).One, true);
assert.ok(M.operatorContract('Acc').contract.revisable_by_future_contact);

assert.ok(M.operatorContract('Strain'));
assert.ok(M.operatorContract('Injury'));
assert.ok(M.operatorContract('Feel'));
assert.strictEqual(M.operatorContract('Feel').contract.no_conscious_qualia_claim, true);
assert.ok(M.operatorContract('Injury').contract.meaning.includes('inside_One'));

const brokenMath = { VERSION: M.VERSION, F: M.F.filter(f => f !== 'B=Cl(B)'), CONTRACT: M.CONTRACT };
const brokenProof = Proof.proveState(state, { math: brokenMath, evidence: stateReport });
assert.strictEqual(brokenProof.ok, false);
assert.strictEqual(brokenProof.failed_obligation, 'One');
assert.ok(brokenProof.obligations.some(row => row.missing_required.includes('B=Cl(B)')));

const noContractReport = P.evaluateState(state, { math: { VERSION: '1.6.0', F: M.F } });
assert.strictEqual(noContractReport.ok, false);
assert.strictEqual(noContractReport.one.canonical.blocked_reason, 'canonical_operator_contract_unavailable');

const gateReport = G.verifyState(state, { math: M, prover: P });
assert.strictEqual(gateReport.ok, true);
assert.strictEqual(gateReport.invariant_prover, true);
assert.strictEqual(gateReport.theorem_prover, false);
assert.strictEqual(gateReport.One, true);
assert.strictEqual(gateReport.Living, true);

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.includes('brain_math'));
assert.ok(index.includes('src/one-logic-math-v1.js'));
assert.ok(index.includes('OneLogicMathV1.textBlock()'));
assert.ok(!index.includes('B_t'));
assert.ok(!index.includes('B_t1'));
assert.ok(!index.includes('projection'));
assert.ok(!index.includes('latest-recursive-unit-brain-projection'));

console.log('one-logic-math-v1-test: all checks passed');
