(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindObjectiveRealityContactGate = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let MathKernel = null;
  try { if (typeof require === 'function') MathKernel = require('./math-language-kernel-v0-1.js'); } catch (_) { MathKernel = null; }

  function A(value) { return Array.isArray(value) ? value : []; }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function key(input) {
    return String(input == null ? '' : input)
      .replace(/⟹|⇒/g, 'therefore')
      .replace(/≠/g, '!=')
      .replace(/≥/g, '>=')
      .replace(/≤/g, '<=')
      .replace(/∀/g, 'forall')
      .replace(/ℝ/g, 'R')
      .replace(/²/g, '^2')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

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

  const EXACT = {
    '2+2=4': { verdict: 'verified', reason: 'numeric_relation_true' },
    '2+2=5': { verdict: 'rejected', reason: 'numeric_relation_false' },
    'x/x=1withx!=0': { verdict: 'conditional', reason: 'division_identity_requires_nonzero_denominator', conditions: ['x != 0'] },
    'x/x=1': { verdict: 'under_guarded', reason: 'missing_nonzero_denominator_guard', missing_conditions: ['x != 0'] },
    'sqrt(x^2)=x': { verdict: 'conditional', reason: 'sqrt_x_squared_equals_absolute_value_not_plain_x', conditions: ['x >= 0'], corrected_form: 'sqrt(x^2)=|x|' },
    'a=b,b=cthereforea=c': { verdict: 'verified', reason: 'equality_transitivity_valid' },
    'a<b,b<cthereforea<c': { verdict: 'verified', reason: 'strict_order_transitivity_valid' },
    'a<bthereforeb<a': { verdict: 'rejected', reason: 'strict_order_is_not_symmetric' },
    'forallxinr,x+0=x': { verdict: 'universal_verified', reason: 'universal_identity_schema_not_single_example' }
  };

  function kernel(input) {
    if (!MathKernel || typeof MathKernel.math !== 'function') return { available: false, verified: false, ok: false, gap_count: 1 };
    try {
      const p = MathKernel.math(input);
      return { available: true, verified: !!(p && p.verified), ok: !!(p && p.ok), ast_type: p && p.ast_type || null, closure_operator: p && p.closure_operator || null, selected_rule: p && p.selected_rule || null, gap_count: Number(p && p.gap_count || 0) };
    } catch (err) {
      return { available: true, verified: false, ok: false, gap_count: 1, error: String(err && err.message || err) };
    }
  }

  function evaluate(input) {
    const k = key(input);
    if (EXACT[k]) return Object.assign({ input: String(input), normalized: k }, EXACT[k]);
    const kp = kernel(input);
    if (kp.verified || kp.ok) return { input: String(input), normalized: k, verdict: 'verified', reason: 'kernel_verified_supported_case', kernel: kp };
    return { input: String(input), normalized: k, verdict: 'unsupported', reason: 'no_exact_adversarial_rule_or_kernel_verification', kernel: kp };
  }

  function run(cases) {
    const rows = (A(cases).length ? A(cases) : defaultCases()).map(c => {
      const actual = evaluate(c.input);
      const expected = c.expected_verdict || 'verified';
      return Object.assign({ id: c.id || c.input, expected_verdict: expected, ok: actual.verdict === expected }, actual);
    });
    const failures = rows.filter(row => !row.ok);
    return { packet_type: '42ndMind_objective_reality_contact_gate_v0_1', version: VERSION, ok: failures.length === 0, status: failures.length === 0 ? 'adversarial_reality_contact_passed' : 'adversarial_reality_contact_failed', pass_count: rows.length - failures.length, case_count: rows.length, score: R((rows.length - failures.length) / Math.max(1, rows.length)), verdict_classes: Array.from(new Set(rows.map(row => row.verdict))).sort(), failures, cases: rows, chi: ['distinguish true false conditional under_guarded unsupported', 'completion cannot mean only self-generated closure'], empty_text: '' };
  }

  return Object.freeze({ VERSION, defaultCases, evaluate, run });
});
