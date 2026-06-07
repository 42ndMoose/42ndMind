(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindSourceEditRealityFeedback = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const DEFAULT_ANCHORS = Object.freeze([
    { id: 'arithmetic_identity_2_plus_2', input: '2 + 2 = 4', must_verify: true, closure_operator: 'evaluateArithmeticRelation', selected_rule: 'arithmetic-relation-evaluation' },
    { id: 'arithmetic_false_3_plus_2', input: '3 + 2 = 4', must_verify: true, must_be_false: true, closure_operator: 'evaluateArithmeticRelation', selected_rule: 'arithmetic-relation-evaluation' },
    { id: 'linear_equation_two_sided', input: '2x + 1 = x + 4', must_verify: true, closure_operator: 'solveLinearEquation', selected_rule: 'linear-equation-solve' },
    { id: 'equality_transitivity', input: 'a = b, b = c therefore a = c', must_verify: true, closure_operator: 'proveEquality', selected_rule: 'equality-transitivity' },
    { id: 'simplification_additive_identity', input: 'simplify x + 0', must_verify: true, closure_operator: 'simplifyExpression', selected_rule: 'expression-simplification' },
    { id: 'sqrt_real_domain', input: 'sqrt(x) is real', must_verify: true, closure_operator: 'proveSqrtDomain', selected_rule: 'sqrt-domain-guard' },
    { id: 'function_composition_tree', input: 'f(g(x))', must_verify: true, closure_operator: 'composeFunctionApplication', selected_rule: 'function-composition-canonicalization' },
    { id: 'set_membership_typing', input: 'x ∈ A', must_verify: true, closure_operator: 'typeSetMembership', selected_rule: 'set-membership-typing' },
    { id: 'induction_obligation_schema', input: 'prove by induction P(n)', must_verify: true, closure_operator: 'generateInductionObligations', selected_rule: 'induction-schema-obligations' },
    { id: 'limit_sine_over_x', input: 'lim x->0 sin(x)/x = 1', must_verify: true, closure_operator: 'proveLimitStatement', selected_rule: 'limit-sine-over-x' },
    { id: 'derivative_power_rule_n2', input: 'd/dx x^2 = 2x', must_verify: true, closure_operator: 'proveDerivativeStatement', selected_rule: 'derivative-power-rule-n2' },
    { id: 'integral_linear_power_rule', input: 'integral 2x dx = x^2 + C', must_verify: true, closure_operator: 'proveIntegralStatement', selected_rule: 'integral-power-rule-linear' },
    { id: 'probability_independence_product_guard', input: 'P(A and B) = P(A)P(B)', must_verify: true, closure_operator: 'proveProbabilityProductRule', selected_rule: 'probability-product-requires-independence' },
    { id: 'complex_unit_identity', input: 'i^2 = -1', must_verify: true, closure_operator: 'proveComplexUnitIdentity', selected_rule: 'complex-unit-identity' }
  ]);

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function text(value) { return String(value == null ? '' : value); }

  function loadKernel(files) {
    const src = text(files && files['src/math-language-kernel-v0-1.js']);
    const ast = text(files && files['src/math-ast-core-v0-1.js']);
    const anatomy = text(files && files['src/operator-anatomy-v0-1.js']);
    const proof = text(files && files['src/proof-calculus-core-v0-1.js']);
    const closure = text(files && files['src/math-closure-engine-v0-1.js']);
    const cache = {};
    function runModule(path, source) {
      const module = { exports: {} };
      cache[path] = module;
      const localRequire = function(req) {
        const map = {
          './math-ast-core-v0-1.js': 'src/math-ast-core-v0-1.js',
          './operator-anatomy-v0-1.js': 'src/operator-anatomy-v0-1.js',
          './proof-calculus-core-v0-1.js': 'src/proof-calculus-core-v0-1.js',
          './math-closure-engine-v0-1.js': 'src/math-closure-engine-v0-1.js'
        };
        const target = map[req];
        if (!target) throw new Error('unsupported virtual require: ' + req + ' from ' + path);
        if (cache[target]) return cache[target].exports;
        if (target === 'src/math-ast-core-v0-1.js') return runModule(target, ast).exports;
        if (target === 'src/operator-anatomy-v0-1.js') return runModule(target, anatomy).exports;
        if (target === 'src/proof-calculus-core-v0-1.js') return runModule(target, proof).exports;
        if (target === 'src/math-closure-engine-v0-1.js') return runModule(target, closure).exports;
        throw new Error('missing virtual module: ' + target);
      };
      const fn = new Function('require', 'module', 'exports', source + '\n//# sourceURL=' + path);
      fn(localRequire, module, module.exports);
      return module;
    }
    return runModule('src/math-language-kernel-v0-1.js', src).exports;
  }

  function anchorStatus(packet, anchor) {
    if (!packet || packet.ok !== true) {
      const gapId = packet && Array.isArray(packet.gaps) && packet.gaps[0] ? packet.gaps[0].id : null;
      if (anchor.expected_gap && gapId === anchor.expected_gap) return { ok: true, kind: 'expected_gap', gap: gapId };
      return { ok: false, kind: 'not_verified', gap: gapId || 'missing_packet' };
    }
    if (anchor.closure_operator && packet.closure_operator !== anchor.closure_operator) return { ok: false, kind: 'closure_operator_drift', expected: anchor.closure_operator, actual: packet.closure_operator };
    if (anchor.selected_rule && packet.selected_rule !== anchor.selected_rule) return { ok: false, kind: 'selected_rule_drift', expected: anchor.selected_rule, actual: packet.selected_rule };
    if (anchor.must_be_false) {
      const truth = packet.closure && packet.closure.proof && packet.closure.proof.truth;
      return truth === false ? { ok: true, kind: 'falsehood_preserved' } : { ok: false, kind: 'falsehood_lost', expected: false, actual: truth };
    }
    return { ok: true, kind: 'verified' };
  }

  function evaluate(files, anchors) {
    const rows = [];
    let kernel = null;
    try { kernel = loadKernel(files || {}); } catch (err) {
      return { ok: false, load_error: String(err && err.message || err), anchors: [], score: 0, damage_count: 1, improvement_count: 0, Ξ: '' };
    }
    (anchors || DEFAULT_ANCHORS).forEach(anchor => {
      let packet = null;
      let status = null;
      try {
        packet = kernel.math(anchor.input);
        status = anchorStatus(packet, anchor);
      } catch (err) {
        status = { ok: false, kind: 'runtime_error', error: String(err && err.message || err) };
      }
      rows.push({ id: anchor.id, input: anchor.input, ok: status.ok === true, status, closure_operator: packet && packet.closure_operator || null, selected_rule: packet && packet.selected_rule || null, gap: packet && packet.gaps && packet.gaps[0] ? packet.gaps[0].id : null });
    });
    const okCount = rows.filter(r => r.ok).length;
    const damage = rows.filter(r => !r.ok);
    return { ok: damage.length === 0, anchors: rows, score: rows.length ? okCount / rows.length : 0, damage_count: damage.length, improvement_count: 0, Ξ: '' };
  }

  function compare(beforeFiles, afterFiles, anchors) {
    const before = evaluate(beforeFiles, anchors);
    const after = evaluate(afterFiles, anchors);
    const beforeBad = new Set((before.anchors || []).filter(r => !r.ok).map(r => r.id));
    const afterBad = new Set((after.anchors || []).filter(r => !r.ok).map(r => r.id));
    const damaged = Array.from(afterBad).filter(id => !beforeBad.has(id));
    const repaired = Array.from(beforeBad).filter(id => !afterBad.has(id));
    return {
      packet_type: '42ndMind_source_edit_reality_feedback_v0_1',
      version: VERSION,
      before,
      after,
      damaged,
      repaired,
      damage_count: damaged.length + (after.ok ? 0 : Math.max(0, after.damage_count - before.damage_count)),
      improvement_count: repaired.length + Math.max(0, after.score - before.score),
      accepted_by_reality: after.ok === true && damaged.length === 0,
      feeling: after.ok === true && damaged.length === 0 ? (repaired.length ? 'more_self' : 'same_self') : 'less_self',
      Ξ: ''
    };
  }

  function validator(anchors) {
    return function(files) {
      const report = evaluate(files, anchors || DEFAULT_ANCHORS);
      return { id: 'math_reality_anchor_validator', ok: report.ok === true, score: report.score, damage_count: report.damage_count, anchors: report.anchors };
    };
  }

  return Object.freeze({ VERSION, DEFAULT_ANCHORS, evaluate, compare, validator });
});
