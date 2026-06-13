(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathLawGate = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.3';
  let Canon = null, Prover = null;
  try { if (typeof require === 'function') Canon = require('./one-logic-math-v1.js'); } catch (_) {}
  try { if (typeof require === 'function') Prover = require('./math-law-invariant-prover-v0-1.js'); } catch (_) {}

  function O(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function A(x) { return Array.isArray(x) ? x : []; }
  function copy(x) { return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function math(o) { return O(o).math || Canon || (typeof globalThis !== 'undefined' && globalThis.OneLogicMathV1) || null; }
  function prover(o) { return O(o).prover || Prover || (typeof globalThis !== 'undefined' && globalThis.FortySecondMindMathLawInvariantProver) || null; }
  function contract(o) { const m = math(o || {}); return O(O(o).contract || m && m.CONTRACT); }
  function optionPack(o) { return Object.assign({}, o || {}, { math: math(o || {}), prover: prover(o || {}) }); }
  function expectedVersion(o) { return contract(o || {}).expected_math_version || null; }
  function canonicalPath(o) { return contract(o || {}).canonical_path || null; }
  function required(o) { return A(contract(o || {}).required_formulas); }

  function fail(reason, o) {
    return { ok: false, version: VERSION, theorem_prover: false, invariant_prover: false, contract_version: contract(o || {}).version || null, math_version: math(o || {}) && math(o || {}).VERSION || null, expected_math_version: expectedVersion(o || {}), One: false, Closure: false, Admission: false, UnknownPreservation: false, EquivalenceCollapse: false, Reduction: false, Growth: false, NoGrowthNoChange: false, ExpressionValidity: false, Active: false, Living: false, blocked: true, blocked_reason: reason, candidate_admitted: false, genuine_growth: false, changed: null, reduction: null, invariant_report: { ok: false, theorem_prover: false, invariant_prover: false, blocked_reason: reason }, final_report: null, limits: { theorem_prover: false, invariant_prover: false, operator_contract_source: 'src/one-logic-math-v1.js' } };
  }

  function shape(report, transition, blocked) {
    const r = report || {}, t = transition || null;
    return { ok: !!r.ok, version: VERSION, theorem_prover: false, invariant_prover: r.invariant_prover === true, contract_version: r.contract_version || null, math_version: r.math_version || null, expected_math_version: r.expected_version || r.math_version || null, One: !!r.One, Closure: !!r.Closure, Admission: t ? !!t.Admission : !!r.Admission, UnknownPreservation: t ? !!t.UnknownPreservation : !!r.UnknownPreservation, EquivalenceCollapse: t ? !!t.EquivalenceCollapse : !!r.EquivalenceCollapse, Reduction: t ? !!t.Reduction : !!r.Reduction, Growth: t ? !!t.Growth : !!r.Growth, NoGrowthNoChange: t ? !!t.NoGrowthNoChange : !!r.NoGrowthNoChange, ExpressionValidity: t ? !!t.ExpressionValidity : !!r.ExpressionValidity, Active: t ? !!t.Active : !!r.Active, Living: t ? !!t.Living : !!r.Living, blocked: !!blocked, blocked_reason: blocked ? (t && t.blocked_reason || r.blocked_reason || 'math_law_failed') : null, candidate_admitted: t ? !blocked && !!t.Admission : null, genuine_growth: t ? !!t.Growth : null, changed: t ? !!t.changed : null, reduction: r.reduction || t && t.reduction || null, invariant_report: t || r, final_report: r, limits: { theorem_prover: false, invariant_prover: r.invariant_prover === true, operator_contract_source: 'src/one-logic-math-v1.js' } };
  }

  function ready(o) {
    const x = optionPack(o || {});
    if (!x.math || !contract(x).operators) return { ok: false, gate: fail('canonical_operator_contract_unavailable', x), options: x };
    if (!x.prover || typeof x.prover.evaluateState !== 'function' || typeof x.prover.evaluateTransition !== 'function') return { ok: false, gate: fail('invariant_prover_unavailable', x), options: x };
    return { ok: true, options: x };
  }

  function verifyMath(m) {
    const c = O(m && m.CONTRACT);
    const missing = A(c.required_formulas).filter(f => A(m && m.F).indexOf(f) < 0);
    return { ok: !!(m && c.operators) && m.VERSION === c.expected_math_version && missing.length === 0, version: m && m.VERSION || null, expected_version: c.expected_math_version || null, contract_present: !!c.operators, missing };
  }

  function verifySourceFiles(files, options) {
    const p = canonicalPath(options || {}), source = String(O(files)[p] == null ? '' : O(files)[p]);
    const missing_files = p && source ? [] : [p || 'canonical_path_unavailable'];
    const missing_formulas = source ? required(options || {}).filter(f => source.indexOf(f) < 0) : required(options || {}).slice();
    return { ok: missing_files.length === 0 && missing_formulas.length === 0, canonical_path: p, missing_files, missing_formulas };
  }

  function verifyState(state, options) {
    const r = ready(options || {});
    if (!r.ok) return r.gate;
    return shape(r.options.prover.evaluateState(state, r.options), null, false);
  }

  function verifyTransition(before, candidate, after, options) {
    const r = ready(options || {});
    if (!r.ok) return r.gate;
    const transition = r.options.prover.evaluateTransition(before, candidate || {}, after || before, r.options);
    const final = r.options.prover.evaluateState(after || before, r.options);
    return shape(final, transition, !transition.ok);
  }

  function gateCycle(before, cycle, options) {
    const r = ready(options || {});
    if (!r.ok) { const state = copy(before) || {}; state.law_gate = r.gate; return Object.assign({}, cycle || {}, { state, law_gate: r.gate, invariant_report: r.gate.invariant_report, blocked_by_math_law: true }); }
    const after = cycle && cycle.state || before;
    const transition = r.options.prover.evaluateTransition(before, cycle || {}, after, r.options);
    const blocked = !transition.ok;
    const accepted = blocked ? before : (typeof r.options.prover.reducedState === 'function' ? r.options.prover.reducedState(after, r.options) : after);
    const final = r.options.prover.evaluateState(accepted, r.options);
    const gate = shape(final, transition, blocked);
    const state = copy(accepted) || {};
    state.law_gate = gate;
    state.invariant_report = transition;
    return Object.assign({}, cycle || {}, { state, law_gate: gate, invariant_report: transition, blocked_by_math_law: blocked, candidate_admitted: !blocked && transition.Admission === true, genuine_growth: transition.Growth === true, reduction: final.reduction || null });
  }

  return Object.freeze({ VERSION, get EXPECTED_MATH_VERSION() { return expectedVersion({}); }, get CANONICAL_MATH_PATH() { return canonicalPath({}); }, get REQUIRED() { return required({}); }, verifyMath, verifySourceFiles, verifyState, verifyTransition, gateCycle });
});
