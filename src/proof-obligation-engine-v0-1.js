(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindProofObligationEngine = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';

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
  function variablePattern() { return '[a-z][a-z0-9_]*'; }

  function guardSatisfied(raw, variable, guard) {
    const s = compact(raw);
    const v = String(variable || '').toLowerCase();
    if (guard === 'nonzero') return s.includes(v + '!=0') || s.includes(v + '>0') || s.includes(v + '<0');
    if (guard === 'nonnegative') return s.includes(v + '>=0') || s.includes('0<=' + v) || s.includes(v + '>0');
    return false;
  }

  function simpleNumericExpression(raw) {
    const s = String(raw || '').replace(/\s+/g, '');
    if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
    const m = /^(-?\d+(?:\.\d+)?)([+\-*/])(-?\d+(?:\.\d+)?)$/.exec(s);
    if (!m) return NaN;
    const a = Number(m[1]);
    const b = Number(m[3]);
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
    return {
      family: 'numeric_relation',
      operators: [{ type: 'numeric_relation', op }],
      obligations: [],
      verdict: truth ? 'verified' : 'rejected',
      reason: truth ? 'numeric_relation_true' : 'numeric_relation_false',
      value: { left: R(left), op, right: R(right) }
    };
  }

  function divisionIdentity(input) {
    const s = compact(input);
    const v = variablePattern();
    const m = new RegExp('^(' + v + ')/\\1=1(?:with|where)?(.*)$').exec(s);
    if (!m) return null;
    const variable = m[1];
    const obligation = { id: 'denominator_nonzero', operator: 'division', variable, required_guard: variable + ' != 0', satisfied: guardSatisfied(input, variable, 'nonzero') };
    return {
      family: 'division_identity',
      operators: [{ type: 'division', numerator: variable, denominator: variable }],
      obligations: [obligation],
      verdict: obligation.satisfied ? 'conditional' : 'under_guarded',
      reason: obligation.satisfied ? 'division_identity_guard_satisfied' : 'division_identity_missing_nonzero_denominator_guard',
      conditions: obligation.satisfied ? [obligation.required_guard] : [],
      missing_conditions: obligation.satisfied ? [] : [obligation.required_guard]
    };
  }

  function sqrtSquare(input) {
    const s = compact(input);
    const v = variablePattern();
    const m = new RegExp('^sqrt\\((' + v + ')\\^2\\)=\\1(?:with|where)?(.*)$').exec(s);
    if (!m) return null;
    const variable = m[1];
    const obligation = { id: 'nonnegative_radical_source', operator: 'sqrt_square', variable, required_guard: variable + ' >= 0', satisfied: guardSatisfied(input, variable, 'nonnegative') };
    return {
      family: 'sqrt_square_identity',
      operators: [{ type: 'sqrt', argument: variable + '^2' }, { type: 'square', argument: variable }],
      obligations: [obligation],
      verdict: obligation.satisfied ? 'conditional' : 'conditional',
      reason: obligation.satisfied ? 'sqrt_square_identity_guard_satisfied' : 'sqrt_square_identity_requires_sign_guard',
      conditions: [obligation.required_guard],
      missing_conditions: obligation.satisfied ? [] : [obligation.required_guard],
      corrected_form: 'sqrt(' + variable + '^2)=|' + variable + '|'
    };
  }

  function equalityTransitivity(input) {
    const s = compact(input);
    const v = variablePattern();
    const m = new RegExp('^(' + v + ')=(' + v + '),(' + v + ')=(' + v + ')therefore(' + v + ')=(' + v + ')$').exec(s);
    if (!m) return null;
    const valid = m[2] === m[3] && m[1] === m[5] && m[4] === m[6];
    return {
      family: 'equality_transitivity',
      operators: [{ type: 'equality' }, { type: 'transitive_chain' }],
      obligations: [{ id: 'middle_term_matches', required_guard: m[2] + ' == ' + m[3], satisfied: m[2] === m[3] }],
      verdict: valid ? 'verified' : 'rejected',
      reason: valid ? 'equality_transitivity_valid' : 'equality_transitivity_invalid'
    };
  }

  function strictOrder(input) {
    const s = compact(input);
    const v = variablePattern();
    let m = new RegExp('^(' + v + ')<(' + v + '),(' + v + ')<(' + v + ')therefore(' + v + ')<(' + v + ')$').exec(s);
    if (m) {
      const valid = m[2] === m[3] && m[1] === m[5] && m[4] === m[6];
      return {
        family: 'strict_order_transitivity',
        operators: [{ type: 'strict_order' }, { type: 'transitive_chain' }],
        obligations: [{ id: 'middle_term_matches', required_guard: m[2] + ' == ' + m[3], satisfied: m[2] === m[3] }],
        verdict: valid ? 'verified' : 'rejected',
        reason: valid ? 'strict_order_transitivity_valid' : 'strict_order_transitivity_invalid'
      };
    }
    m = new RegExp('^(' + v + ')<(' + v + ')therefore(' + v + ')<(' + v + ')$').exec(s);
    if (!m) return null;
    const reversed = m[1] === m[4] && m[2] === m[3];
    return {
      family: 'strict_order_symmetry_test',
      operators: [{ type: 'strict_order' }, { type: 'symmetry_claim' }],
      obligations: [{ id: 'strict_order_not_symmetric', required_guard: 'do_not_reverse_<', satisfied: !reversed }],
      verdict: reversed ? 'rejected' : 'unsupported',
      reason: reversed ? 'strict_order_is_not_symmetric' : 'single_order_premise_has_no_supported_rule'
    };
  }

  function universalIdentity(input) {
    const s = compact(input);
    const v = variablePattern();
    let m = new RegExp('^forall(' + v + ')(?:inr|inreals|inreal)?,?\\1\\+0=\\1$').exec(s);
    if (m) return { family: 'universal_additive_identity', operators: [{ type: 'forall' }, { type: 'additive_identity' }], obligations: [{ id: 'schema_level_not_example', required_guard: 'universal_quantifier', satisfied: true }], verdict: 'universal_verified', reason: 'additive_identity_verified_as_schema', variable: m[1], schema: 'forall v in R, v + 0 = v' };
    m = new RegExp('^forall(' + v + ')(?:inr|inreals|inreal)?,?0\\+\\1=\\1$').exec(s);
    if (m) return { family: 'universal_additive_identity', operators: [{ type: 'forall' }, { type: 'additive_identity' }], obligations: [{ id: 'schema_level_not_example', required_guard: 'universal_quantifier', satisfied: true }], verdict: 'universal_verified', reason: 'additive_identity_verified_as_schema', variable: m[1], schema: 'forall v in R, 0 + v = v' };
    return null;
  }

  function analyze(input) {
    const checks = [numericRelation, divisionIdentity, sqrtSquare, equalityTransitivity, strictOrder, universalIdentity];
    for (const check of checks) {
      const hit = check(input);
      if (hit) return Object.assign({ input: text(input), normalized: compact(input), engine: 'proof_obligation_engine_v0_1' }, hit);
    }
    return { input: text(input), normalized: compact(input), engine: 'proof_obligation_engine_v0_1', family: 'unsupported', operators: [], obligations: [], verdict: 'unsupported', reason: 'no_obligation_rule_matched' };
  }

  function run(cases) {
    const rows = A(cases).map(c => Object.assign({ id: c.id || c.input, expected_verdict: c.expected_verdict || c.expect || null }, analyze(c.input)));
    const failures = rows.filter(row => row.expected_verdict && row.verdict !== row.expected_verdict);
    return {
      packet_type: '42ndMind_proof_obligation_engine_report_v0_1',
      version: VERSION,
      ok: failures.length === 0,
      case_count: rows.length,
      pass_count: rows.length - failures.length,
      failures,
      verdict_classes: Array.from(new Set(rows.map(row => row.verdict))).sort(),
      operator_families: Array.from(new Set(rows.map(row => row.family))).sort(),
      cases: rows,
      empty_text: ''
    };
  }

  return Object.freeze({ VERSION, analyze, run });
});
