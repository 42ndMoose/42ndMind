(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindObjectiveRealityContactGate = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let MathKernel = null, Obligations = null;
  try { if (typeof require === 'function') MathKernel = require('./math-language-kernel-v0-1.js'); } catch (_) { MathKernel = null; }
  try { if (typeof require === 'function') Obligations = require('./proof-obligation-engine-v0-1.js'); } catch (_) { Obligations = null; }

  function A(value) { return Array.isArray(value) ? value : []; }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function text(input) { return String(input == null ? '' : input).replace(/⟹|⇒/g, ' therefore ').replace(/≠/g, ' != ').replace(/≥/g, ' >= ').replace(/≤/g, ' <= ').replace(/∀/g, 'forall ').replace(/ℝ/g, 'R').replace(/²/g, '^2').replace(/\s+/g, ' ').trim(); }
  function compact(input) { return text(input).replace(/\s+/g, '').toLowerCase(); }

  function defaultCases() {
    return [
      { id: 'arithmetic_truth', input: '2 + 2 = 4', expected_verdict: 'verified' },
      { id: 'linear_equation_solution', input: '2x + 1 = x + 4', expected_verdict: 'verified' },
      { id: 'division_identity_guarded', input: 'x / x = 1 with x != 0', expected_verdict: 'conditional' },
      { id: 'division_identity_unguarded', input: 'x / x = 1', expected_verdict: 'under_guarded' },
      { id: 'sqrt_square_sign_guard', input: 'sqrt(x^2) = x', expected_verdict: 'conditional' },
      { id: 'equality_transitivity', input: 'a = b, b = c therefore a = c', expected_verdict: 'verified' },
      { id: 'order_transitivity', input: 'a < b, b < c therefore a < c', expected_verdict: 'verified' },
      { id: 'order_reversal_invalid', input: 'a < b therefore b < a', expected_verdict: 'rejected' },
      { id: 'universal_additive_identity', input: 'forall x in R, x + 0 = x', expected_verdict: 'universal_verified' },
      { id: 'false_arithmetic', input: '2 + 2 = 5', expected_verdict: 'rejected' }
    ];
  }

  function kernel(input) {
    if (!MathKernel || typeof MathKernel.math !== 'function') return { available: false, verified: false, ok: false, gap_count: 1 };
    try {
      const p = MathKernel.math(input);
      return { available: true, verified: !!(p && p.verified), ok: !!(p && p.ok), ast_type: p && p.ast_type || null, closure_operator: p && p.closure_operator || null, selected_rule: p && p.selected_rule || null, gap_count: Number(p && p.gap_count || 0) };
    } catch (err) { return { available: true, verified: false, ok: false, gap_count: 1, error: String(err && err.message || err) }; }
  }

  function evaluate(input) {
    const ob = Obligations && typeof Obligations.analyze === 'function' ? Obligations.analyze(input) : null;
    if (ob && ob.verdict && ob.verdict !== 'unsupported') return Object.assign({ rule_source: 'proof_obligation_engine' }, ob);
    const kp = kernel(input);
    if (kp.verified || kp.ok) return { input: text(input), normalized: compact(input), verdict: 'verified', reason: 'kernel_verified_supported_case', rule_source: 'math_kernel', kernel: kp, operators: [], obligations: [], family: 'kernel_supported' };
    return { input: text(input), normalized: compact(input), verdict: 'unsupported', reason: 'no_obligation_rule_or_kernel_verification', rule_source: 'none', kernel: kp, operators: [], obligations: [], family: 'unsupported' };
  }

  function run(cases) {
    const rows = (A(cases).length ? A(cases) : defaultCases()).map(c => {
      const actual = evaluate(c.input);
      const expected = c.expected_verdict || 'verified';
      return Object.assign({ id: c.id || c.input, expected_verdict: expected, ok: actual.verdict === expected }, actual);
    });
    const failures = rows.filter(row => !row.ok);
    return { packet_type: '42ndMind_objective_reality_contact_gate_v0_1', version: VERSION, ok: failures.length === 0, status: failures.length === 0 ? 'adversarial_reality_contact_passed' : 'adversarial_reality_contact_failed', pass_count: rows.length - failures.length, case_count: rows.length, score: R((rows.length - failures.length) / Math.max(1, rows.length)), verdict_classes: Array.from(new Set(rows.map(row => row.verdict))).sort(), rule_sources: Array.from(new Set(rows.map(row => row.rule_source))).sort(), operator_families: Array.from(new Set(rows.map(row => row.family).filter(Boolean))).sort(), failures, cases: rows, chi: ['operator anatomy creates obligations', 'completion cannot mean only self-generated closure'], empty_text: '' };
  }

  return Object.freeze({ VERSION, defaultCases, evaluate, run });
});
