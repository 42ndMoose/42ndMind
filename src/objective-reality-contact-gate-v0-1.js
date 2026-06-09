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
  function text(input) {
    return String(input == null ? '' : input)
      .replace(/⟹|⇒/g, ' therefore ')
      .replace(/≠/g, ' != ')
      .replace(/≥/g, ' >= ')
      .replace(/≤/g, ' <= ')
      .replace(/∀/g, 'forall ')
      .replace(/ℝ/g, 'R')
      .replace(/²/g, '^2')
      .replace(/\s+/g, ' ')
      .trim();
  }
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

  function simpleNumericExpression(raw) {
    const s = String(raw || '').replace(/\s+/g, '');
    if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
    const m = /^(-?\d+(?:\.\d+)?)([+\-*/])(-?\d+(?:\.\d+)?)$/.exec(s);
    if (!m) return NaN;
    const a = Number(m[1]), b = Number(m[3]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
    if (m[2] === '+') return a + b;
    if (m[2] === '-') return a - b;
    if (m[2] === '*') return a * b;
    if (m[2] === '/') return b === 0 ? NaN : a / b;
    return NaN;
  }

  function numericRelation(input) {
    const s = compact(input);
    if (/[a-z]/.test(s)) return null;
    const m = /^(.+?)(>=|<=|=|>|<)(.+)$/.exec(s);
    if (!m) return null;
    const left = simpleNumericExpression(m[1]);
    const right = simpleNumericExpression(m[3]);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
    const op = m[2];
    const truth = op === '=' ? Math.abs(left - right) < 1e-12 : op === '>' ? left > right : op === '<' ? left < right : op === '>=' ? left >= right : left <= right;
    return { verdict: truth ? 'verified' : 'rejected', reason: truth ? 'numeric_relation_true' : 'numeric_relation_false', value: { left: R(left), op, right: R(right) } };
  }

  function divisionIdentity(input) {
    const s = compact(input);
    const m = /^([a-z][a-z0-9_]*)\/\1=1(?:with|where)?(.*)$/.exec(s);
    if (!m) return null;
    const v = m[1];
    const tail = m[2] || '';
    const guarded = tail.includes(v + '!=0') || tail.includes(v + '>0') || tail.includes(v + '<0');
    return guarded
      ? { verdict: 'conditional', reason: 'division_identity_requires_nonzero_denominator', conditions: [v + ' != 0'] }
      : { verdict: 'under_guarded', reason: 'division_identity_missing_nonzero_denominator_guard', missing_conditions: [v + ' != 0'] };
  }

  function sqrtSquare(input) {
    const s = compact(input);
    const m = /^sqrt\(([a-z][a-z0-9_]*)\^2\)=\1$/.exec(s);
    if (!m) return null;
    const v = m[1];
    return { verdict: 'conditional', reason: 'sqrt_of_square_is_absolute_value_not_unconditional_identity', conditions: [v + ' >= 0'], corrected_form: 'sqrt(' + v + '^2)=|' + v + '|' };
  }

  function equalityTransitivity(input) {
    const s = compact(input);
    const m = /^([a-z][a-z0-9_]*)=([a-z][a-z0-9_]*),([a-z][a-z0-9_]*)=([a-z][a-z0-9_]*)therefore([a-z][a-z0-9_]*)=([a-z][a-z0-9_]*)$/.exec(s);
    if (!m) return null;
    const valid = m[2] === m[3] && m[1] === m[5] && m[4] === m[6];
    return { verdict: valid ? 'verified' : 'rejected', reason: valid ? 'equality_transitivity_valid' : 'equality_transitivity_invalid' };
  }

  function strictOrder(input) {
    const s = compact(input);
    let m = /^([a-z][a-z0-9_]*)<([a-z][a-z0-9_]*),([a-z][a-z0-9_]*)<([a-z][a-z0-9_]*)therefore([a-z][a-z0-9_]*)<([a-z][a-z0-9_]*)$/.exec(s);
    if (m) {
      const valid = m[2] === m[3] && m[1] === m[5] && m[4] === m[6];
      return { verdict: valid ? 'verified' : 'rejected', reason: valid ? 'strict_order_transitivity_valid' : 'strict_order_transitivity_invalid' };
    }
    m = /^([a-z][a-z0-9_]*)<([a-z][a-z0-9_]*)therefore([a-z][a-z0-9_]*)<([a-z][a-z0-9_]*)$/.exec(s);
    if (!m) return null;
    const reversed = m[1] === m[4] && m[2] === m[3];
    return { verdict: reversed ? 'rejected' : 'unsupported', reason: reversed ? 'strict_order_is_not_symmetric' : 'single_order_premise_has_no_supported_rule' };
  }

  function universalIdentity(input) {
    const s = compact(input);
    let m = /^forall([a-z][a-z0-9_]*)(?:inr|inreals|inreal)?,?\1\+0=\1$/.exec(s);
    if (m) return { verdict: 'universal_verified', reason: 'additive_identity_verified_as_schema', variable: m[1], schema: 'forall v in R, v + 0 = v' };
    m = /^forall([a-z][a-z0-9_]*)(?:inr|inreals|inreal)?,?0\+\1=\1$/.exec(s);
    if (m) return { verdict: 'universal_verified', reason: 'additive_identity_verified_as_schema', variable: m[1], schema: 'forall v in R, 0 + v = v' };
    return null;
  }

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
    const checks = [numericRelation, divisionIdentity, sqrtSquare, equalityTransitivity, strictOrder, universalIdentity];
    for (const check of checks) {
      const hit = check(input);
      if (hit) return Object.assign({ input: text(input), normalized: compact(input), rule_source: 'structural_reality_rule' }, hit);
    }
    const kp = kernel(input);
    if (kp.verified || kp.ok) return { input: text(input), normalized: compact(input), verdict: 'verified', reason: 'kernel_verified_supported_case', rule_source: 'math_kernel', kernel: kp };
    return { input: text(input), normalized: compact(input), verdict: 'unsupported', reason: 'no_structural_rule_or_kernel_verification', rule_source: 'none', kernel: kp };
  }

  function run(cases) {
    const rows = (A(cases).length ? A(cases) : defaultCases()).map(c => {
      const actual = evaluate(c.input);
      const expected = c.expected_verdict || 'verified';
      return Object.assign({ id: c.id || c.input, expected_verdict: expected, ok: actual.verdict === expected }, actual);
    });
    const failures = rows.filter(row => !row.ok);
    return { packet_type: '42ndMind_objective_reality_contact_gate_v0_1', version: VERSION, ok: failures.length === 0, status: failures.length === 0 ? 'adversarial_reality_contact_passed' : 'adversarial_reality_contact_failed', pass_count: rows.length - failures.length, case_count: rows.length, score: R((rows.length - failures.length) / Math.max(1, rows.length)), verdict_classes: Array.from(new Set(rows.map(row => row.verdict))).sort(), rule_sources: Array.from(new Set(rows.map(row => row.rule_source))).sort(), failures, cases: rows, chi: ['structural rules distinguish true false conditional under_guarded unsupported universal', 'completion cannot mean only self-generated closure'], empty_text: '' };
  }

  return Object.freeze({ VERSION, defaultCases, evaluate, run });
});
