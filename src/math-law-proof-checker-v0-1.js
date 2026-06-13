(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathLawProofChecker = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const VERSION = '0.1.2';
  let Canon = null;
  try { if (typeof require === 'function') Canon = require('./one-logic-math-v1.js'); } catch (_) {}
  function O(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function A(x) { return Array.isArray(x) ? x : []; }
  function math(options) { return O(options).math || Canon || (typeof globalThis !== 'undefined' && globalThis.OneLogicMathV1) || null; }
  function contract(options) { const m = math(options || {}); return O(O(options).contract || m && m.CONTRACT); }
  function proofContract(options) { return O(contract(options || {}).proofs); }
  function formulas(options) { const m = math(options || {}); return A(m && m.F); }
  function evidence(options) { return O(O(options).evidence || O(options).report || O(options).transition || O(options).state_report); }
  function phase(options) { return O(options).phase || (O(options).transition ? 'transition' : 'state'); }
  function proofRows(options) { return O(proofContract(options || {}).obligations); }
  function operatorLaws(options) { const rows = O(contract(options || {}).operators); return Object.keys(rows).reduce((out, key) => out.concat(A(rows[key] && rows[key].law)), []); }
  function proofKnown(options) { const rows = proofRows(options || {}); return Object.keys(rows).reduce((out, key) => out.concat([key, rows[key] && rows[key].theorem, rows[key] && rows[key].result]), []).filter(Boolean); }
  function premiseKnown(value, options) { const v = String(value == null ? '' : value); return formulas(options).indexOf(v) >= 0 || operatorLaws(options).indexOf(v) >= 0 || proofKnown(options).indexOf(v) >= 0; }
  function obligationDefs(options) { const p = proofContract(options || {}), rows = proofRows(options || {}), ids = A(p.order).length ? A(p.order) : Object.keys(rows).sort(), ph = phase(options || {}); return ids.map(id => Object.assign({ id }, O(rows[id]))).filter(row => row.phase === 'both' || row.phase === ph || !row.phase); }
  function checkRow(row, options) { const F = formulas(options || {}), e = evidence(options || {}), laws = operatorLaws(options || {}), missing_required = A(row.requires).filter(req => !premiseKnown(req, options || {})), missing_theorem = row.theorem && F.indexOf(row.theorem) < 0 && laws.indexOf(row.theorem) < 0 ? [row.theorem] : [], failed_checks = A(row.checks).filter(key => e[key] !== true), ok = missing_required.length === 0 && missing_theorem.length === 0 && failed_checks.length === 0; return { id: row.id, ok, formula: row.theorem || null, theorem: row.theorem || null, requires: A(row.requires), checks: A(row.checks), result: row.result || null, missing_required, missing_theorem, failed_checks }; }
  function buildProofObligations(state, transition, options) { const o = Object.assign({}, options || {}, { state, transition }); return obligationDefs(o).map(row => checkRow(row, o)); }
  function certificate(rows, options) { const p = proofContract(options || {}), failed = rows.find(row => !row.ok) || null; return { packet_type: '42ndMind_math_law_proof_certificate_v0_1', version: VERSION, theorem: p.theorem || 'LivingPreservationUnderAdmittedDifference', ok: rows.length > 0 && !failed, authority: p.authority || 'src/one-logic-math-v1.js::CONTRACT.proofs', math_version: contract(options || {}).math_version || contract(options || {}).expected_math_version || null, premises: A(p.premises), obligations: rows, failed_obligation: failed && failed.id || null, conclusion: p.conclusion || 'Admitted transition preserves Living(B)' }; }
  function missingContract(options) { return certificate([{ id: 'ProofContract', ok: false, formula: null, requires: ['CONTRACT.proofs'], checks: [], result: null, missing_required: ['CONTRACT.proofs'], missing_theorem: [], failed_checks: [] }], options || {}); }
  function checkProof(proof, options) { if (!proofContract(options || {}).obligations) return missingContract(options || {}); const p = O(proof); if (A(p.obligations).length) return certificate(A(p.obligations).map(row => checkRow(row, Object.assign({}, options || {}, { evidence: p.evidence || evidence(options || {}) }))), options || {}); return certificate(buildProofObligations(null, null, options || {}), options || {}); }
  function proveState(state, options) { const o = Object.assign({}, options || {}, { phase: 'state' }); if (!proofContract(o).obligations) return missingContract(o); return certificate(buildProofObligations(state, null, o), o); }
  function proveTransition(before, candidate, after, options) { const o = Object.assign({}, options || {}, { phase: 'transition', before, candidate, after }); if (!proofContract(o).obligations) return missingContract(o); return certificate(buildProofObligations(after || before, evidence(o), o), o); }
  return Object.freeze({ VERSION, proofContract, buildProofObligations, checkProof, proveState, proveTransition });
});
