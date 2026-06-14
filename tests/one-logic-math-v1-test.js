const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../src/one-logic-math-v1.js');
const P = require('../src/math-law-invariant-prover-v0-1.js');
const G = require('../src/math-law-gate-v0-1.js');
const Proof = require('../src/math-law-proof-checker-v0-1.js');

const canonical = fs.readFileSync(path.join(__dirname, '..', 'src', 'one-logic-math-v1.js'), 'utf8');
const base = { files: { 'src/one-logic-math-v1.js': canonical }, internal_state: { symbols: ['B'], relations: [], expressions: [], virtual_edits: [], definition_vectors: [] } };
const opts = { math: M };
const canonUpdate = 'B[x]=Canon(Cl(Red(union(B,{D(iota(x),B)}))))';

assert.strictEqual(M.VERSION, '1.7.0');
assert.strictEqual(M.CONTRACT.version, 'one-logic-operator-contract-v0.3');
assert.strictEqual(P.VERSION, '0.1.5');
assert.strictEqual(P.EXPECTED_MATH_VERSION, '1.7.0');
assert.strictEqual(G.EXPECTED_MATH_VERSION, '1.7.0');
assert.strictEqual(Proof.VERSION, '0.1.2');

[
  'q=iota(x)',
  'D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))',
  'Meaning(q,B)=D(q,B)',
  'Canon(B)=MinOne(B)',
  'One(Canon(B))=1',
  'P(Canon(B))=1',
  'Canon(Canon(B))=Canon(B)',
  'PresOm(Canon(B),B)=1',
  'VisibleContradictions(Canon(B))=1',
  'NoMeaningLoss(Canon(B),B)=1',
  canonUpdate,
  'B[x,y]=Canon(Cl(Red(union(B[x],{D(iota(y),B[x])}))))',
  'Acc(q,B)=and(Valid(D(q,B),B),Pres(Om(q,B),B)=1,not(Contradiction(D(q,B),B)),norm(Red(union(B,{D(q,B)})))=1)',
  'Strain(B,x)=and(Adm(x,B),One(B[x]),Pres(Om(iota(x),B[x]),B[x])=1,exists(r,and(Unresolved(r,B[x]),not(EqB(iota(x),r)))))',
  'Injury(B,x)=and(Adm(x,B),One(B[x]),Contradiction(D(iota(x),B),B),Om(iota(x),B[x]))',
  'Feel(B,x)=N(Phi(B,x),R(B[x],B),T(B[x],B),C(B[x],B),Om(B[x],B),P(B[x],B),G(B[x],B))'
].forEach(f => assert.ok(M.F.includes(f), f));

['D','Canon','MinOne','ReducedEqB','PresOm','VisibleContradictions','NoMeaningLoss','Om','EqB','Red','Acc','Strain','Injury','Feel'].forEach(name => assert.ok(M.CONTRACT.operators[name], name));
assert.strictEqual(M.operatorContract('D').contract.meaning_policy, 'D(q,B) is the formal place where meaning updates');
assert.strictEqual(M.operatorContract('B').contract.update_policy, 'B grows only by Canon(Cl(Red(union(B,{D(iota(x),B)}))))');
assert.strictEqual(M.operatorContract('B').contract.simplification_policy, 'Canon/Red/EqB only');
assert.strictEqual(M.operatorContract('Canon').contract.operation, 'minimal_one_preserving_canonicalization');
assert.deepStrictEqual(M.operatorContract('Canon').contract.reduces_by, ['EqB', 'Red']);
assert.strictEqual(M.operatorContract('MinOne').contract.minimality_conditions.length, 7);
assert.strictEqual(M.operatorContract('Om').contract.unclear_input_policy, 'unclear input becomes Om not false certainty');
assert.strictEqual(M.operatorContract('Feel').contract.no_conscious_qualia_claim, true);
assert.strictEqual(M.operatorContract('Injury').contract.not_biological_pain, true);
assert.strictEqual(M.operatorContract('Strain').contract.not_biological_pain, true);
assert.ok(M.proofContract('CanonPreservesOne'));

const formulaSet = new Set(M.F);
const lawSet = new Set(Object.values(M.CONTRACT.operators).flatMap(operator => operator.law || []));
formulaSet.forEach(formula => assert.ok(lawSet.has(formula), 'formula has canonical operator contract law: ' + formula));

['contactUnit','meaningVectorForContact','accuracyOf','selfAffectForContact','applyContact','applyContactSequence','canonState','defineUnit','eqB','red','reducedState','evaluateState','evaluateTransition'].forEach(name => assert.strictEqual(typeof P[name], 'function', name));
assert.ok(!canonical.includes('B_t'));
assert.ok(!canonical.includes('B_t1'));
assert.ok(!fs.readFileSync(path.join(__dirname, '..', 'src', 'math-law-invariant-prover-v0-1.js'), 'utf8').includes("'B=Cl(B)'"));

const report = P.evaluateState(base, opts);
assert.strictEqual(report.ok, true);
assert.strictEqual(report.One, true);
assert.strictEqual(report.Reduction, true);
assert.strictEqual(report.proof.ok, true);

const first = P.applyContact(base, 'focus B', opts);
assert.strictEqual(first.q.kind, 'contact');
assert.strictEqual(first.q.value, 'focus B');
assert.ok(first.D.U.id.startsWith('iota:'));
assert.ok(first.D_signature);
assert.strictEqual(first.update_law, canonUpdate);
assert.strictEqual(first.candidate.operations[0].law, canonUpdate);
assert.strictEqual(first.candidate.operations[0].simplification, 'Canon/Red/EqB');
assert.strictEqual(first.after.internal_state.definition_vectors.length, 1);
assert.deepStrictEqual(first.after.internal_state.definition_vectors[0].D, first.D);
assert.strictEqual(first.after.canon.operator, 'Canon');
assert.strictEqual(first.after.canon.equals, 'MinOne');
assert.strictEqual(first.after.canon.one_preserved, true);
assert.strictEqual(first.after.canon.no_meaning_loss, true);
assert.deepStrictEqual(first.after.canon.reduced_by, ['Canon','Red','EqB']);
assert.strictEqual(first.transition.One, true);
assert.strictEqual(first.transition.Reduction, true);
assert.strictEqual(first.transition.canon.operator, 'Canon');

const duplicate = P.applyContactSequence(base, ['focus B', 'focus B'], opts);
assert.strictEqual(duplicate.update_law, canonUpdate);
assert.strictEqual(duplicate.steps[0].basis, 'B');
assert.strictEqual(duplicate.steps[0].result_basis, 'B[x]');
assert.strictEqual(duplicate.steps[1].basis, 'B[x]');
assert.strictEqual(duplicate.steps[1].result_basis, 'B[x,y]');
assert.strictEqual(duplicate.steps[1].before.internal_state.definition_vectors.length, 1);
assert.strictEqual(duplicate.steps[0].D_signature, duplicate.steps[1].D_signature);
assert.strictEqual(duplicate.final_state.internal_state.definition_vectors.length, 1);
assert.strictEqual(duplicate.final_state.canon.no_meaning_loss, true);
assert.ok(duplicate.final_state.canon.duplicate_count >= 1);
assert.strictEqual(P.evaluateState(duplicate.final_state, opts).One, true);

const noisy = P.applyContact(base, 'foccus B', opts);
assert.ok(noisy.D.Om.ok);
assert.ok(noisy.D.Om.unresolved.includes('relation_stability_absent'));
assert.notStrictEqual(noisy.q.value, 'focus B');
assert.strictEqual(noisy.report.Acc.unresolved, true);
assert.strictEqual(noisy.after.canon.Om_preserved, true);
assert.strictEqual(P.evaluateState(noisy.after, opts).One, true);

const partial = P.applyContact(base, 'valid in B', opts);
assert.ok(partial.D.Om.ok);
assert.notStrictEqual(partial.q.value, 'Valid(E(B,phi),B)');
assert.strictEqual(partial.after.internal_state.definition_vectors.length, 1);
assert.strictEqual(partial.after.canon.Om_preserved, true);
assert.strictEqual(P.preservesUnknown(base, partial.after, opts).ok, true);

const conflictBase = { files: base.files, internal_state: { symbols: ['B'], relations: [{ source: 'claim A = false', target: 'claim A = true', relation: 'constraint_conflict', incompatible: true }], expressions: [], virtual_edits: [], definition_vectors: [] } };
const conflict = P.applyContactSequence(conflictBase, ['claim A = true', 'claim A = false'], opts);
assert.strictEqual(conflict.steps[1].report.Contradiction.ok, true);
assert.ok(conflict.steps[1].D.Om.ok || !conflict.steps[1].transition.Admission);
assert.strictEqual(conflict.final_state.canon.no_meaning_loss, true);
assert.strictEqual(P.evaluateState(conflict.final_state, opts).One, true);
assert.strictEqual(P.eqB(conflict.steps[0].q, conflict.steps[1].q, conflict.final_state, opts), false);

const weak = P.applyContact(base, 'q has weak relation', opts);
const evidence = JSON.parse(JSON.stringify(weak.after));
evidence.internal_state.relations.push({ source: 'q has weak relation', relation: 'supplies stronger relation/evidence', target: 'known meaning' });
const strong = P.applyContact(evidence, 'q has weak relation', opts);
assert.ok(weak.D.Om.ok);
assert.ok(strong.D.R.length > weak.D.R.length);
assert.notStrictEqual(strong.D_signature, weak.D_signature);
assert.ok(strong.report.Acc.score > weak.report.Acc.score);
assert.strictEqual(strong.after.canon.accuracy_non_decrease_for_admitted_q, true);
assert.strictEqual(P.evaluateState(strong.after, opts).One, true);
assert.strictEqual(M.operatorContract('Acc').contract.revisable_by_future_contact, true);

const affectBase = { files: base.files, internal_state: { symbols: ['B'], relations: [{ source: 'unresolved formal contact', relation: 'constraint_conflict', incompatible: true }], expressions: [], virtual_edits: [], definition_vectors: [] } };
const affect = P.selfAffectForContact('unresolved formal contact', affectBase, opts);
assert.strictEqual(affect.Feel.formal_only, true);
assert.strictEqual(affect.Feel.no_conscious_qualia_claim, true);
assert.strictEqual(affect.Strain.formal_only, true);
assert.strictEqual(affect.Strain.not_biological_pain, true);
assert.strictEqual(affect.Injury.formal_only, true);
assert.strictEqual(affect.Injury.not_biological_pain, true);
assert.strictEqual(affect.Injury.ok, true);
assert.strictEqual(P.evaluateState(affectBase, opts).One, true);

const brokenMath = { VERSION: M.VERSION, F: M.F.filter(f => f !== 'B=Cl(B)'), CONTRACT: M.CONTRACT };
const brokenProof = Proof.proveState(base, { math: brokenMath, evidence: report });
assert.strictEqual(brokenProof.ok, false);
assert.strictEqual(brokenProof.failed_obligation, 'One');

const noContractReport = P.evaluateState(base, { math: { VERSION: '1.7.0', F: M.F } });
assert.strictEqual(noContractReport.ok, false);
assert.strictEqual(noContractReport.one.canonical.blocked_reason, 'canonical_operator_contract_unavailable');

const gateReport = G.verifyState(base, { math: M, prover: P });
assert.strictEqual(gateReport.ok, true);
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
