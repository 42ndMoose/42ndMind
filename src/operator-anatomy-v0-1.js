(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindOperatorAnatomy = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const R = value => Number((Number(value) || 0).toFixed(6));
  const A = value => Array.isArray(value) ? value : [];
  let MathAstCore = null;
  try { if (typeof require === 'function') MathAstCore = require('./math-ast-core-v0-1.js'); } catch (_) { MathAstCore = null; }

  const CATALOG = Object.freeze({
    affine_equation: Object.freeze({
      id: 'affine_equation', operation: 'solve', surface: 'a*x + b = c',
      parts: ['coefficient', 'variable', 'offset', 'target'],
      preconditions: ['coefficient != 0', 'target is finite', 'offset is finite'],
      inverse_chain: ['undo-offset', 'undo-coefficient'], closure_operator: 'solveAffineEquation', closure_result: 'variable_value',
      examples: ['2x + 1 = 7', '-3y - 6 = 9'], assertion: "assert.strictEqual(P.solveAffineEquation('2x + 1 = 7').value, 3);"
    }),
    linear_equation: Object.freeze({
      id: 'linear_equation', operation: 'solve', surface: 'a*x + b = c*x + d',
      parts: ['left_coefficient', 'right_coefficient', 'left_offset', 'right_offset', 'variable'],
      preconditions: ['net coefficient != 0', 'offsets are finite'],
      inverse_chain: ['collect-variable-terms', 'collect-constant-terms', 'divide-by-net-coefficient'], closure_operator: 'solveLinearEquation', closure_result: 'variable_value',
      examples: ['2x + 1 = x + 4'], assertion: "assert.strictEqual(P.solveLinearEquation('2x + 1 = x + 4').value, 3);"
    }),
    affine_expression: Object.freeze({
      id: 'affine_expression', operation: 'decompose', surface: 'a*x + b',
      parts: ['coefficient', 'variable', 'offset'], preconditions: ['coefficient is finite', 'offset is finite'],
      inverse_chain: [], closure_operator: 'decomposeAffineExpression', closure_result: 'coefficient_variable_offset',
      examples: ['2x + 1', '-3y - 6'], assertion: "assert.strictEqual(P.decomposeAffineExpression('-3y - 6').coefficient, -3);"
    }),
    substitution_evaluation: Object.freeze({
      id: 'substitution_evaluation', operation: 'evaluate', surface: 'a*x + b with x = v',
      parts: ['coefficient', 'variable', 'offset', 'assignment'], preconditions: ['assignment is finite', 'expression is affine'],
      inverse_chain: [], closure_operator: 'evaluateSubstitution', closure_result: 'numeric_value',
      examples: ['2x + 1 with x = 3'], assertion: "assert.strictEqual(P.evaluateSubstitution('2x + 1 with x = 3').result, 7);"
    }),
    linear_relation_truth: Object.freeze({
      id: 'linear_relation_truth', operation: 'evaluate', surface: 'x >= n under x = v',
      parts: ['variable', 'relation', 'target', 'assignment'], preconditions: ['assignment is finite', 'target is finite'],
      inverse_chain: [], closure_operator: 'evaluateLinearRelation', closure_result: 'truth_value',
      examples: ['x >= 3 with x = 5'], assertion: "assert.strictEqual(P.evaluateLinearRelation({ relation: 'x >= 3', value: 5 }).truth, true);"
    }),
    arithmetic_relation_truth: Object.freeze({
      id: 'arithmetic_relation_truth', operation: 'evaluate', surface: 'numeric expression relation numeric expression',
      parts: ['left_expression', 'relation', 'right_expression'], preconditions: ['both sides evaluate to finite numbers'],
      inverse_chain: [], closure_operator: 'evaluateArithmeticRelation', closure_result: 'truth_value',
      examples: ['2 + 3 * 4 = 14', '(2 + 3)^2 = 25'], assertion: "assert.strictEqual(P.evaluateArithmeticRelation('2 + 3 * 4 = 14').truth, true);"
    }),
    division_constraint: Object.freeze({
      id: 'division_constraint', operation: 'guard', surface: 'x/y undefined when y = 0',
      parts: ['numerator', 'denominator'], preconditions: ['denominator != 0'], violations: ['denominator = 0'],
      inverse_chain: [], closure_operator: 'proveDivisionByZeroUndefined', closure_result: 'undefined',
      examples: ['x/y is undefined when y = 0'], assertion: "assert.strictEqual(P.proveDivisionByZeroUndefined('x/y is undefined when y = 0').ok, true);"
    }),
    square_nonnegative: Object.freeze({
      id: 'square_nonnegative', operation: 'prove', surface: 'x^2 >= 0 over reals',
      parts: ['base', 'product_of_same_term'], preconditions: ['base is real'],
      inverse_chain: [], closure_operator: 'proveSquareNonnegative', closure_result: 'nonnegative_truth',
      examples: ['∀x ∈ ℝ, x^2 >= 0'], assertion: "assert.strictEqual(P.proveSquareNonnegative('∀x ∈ ℝ, x^2 >= 0').ok, true);"
    }),
    algebraic_identity: Object.freeze({
      id: 'algebraic_identity', operation: 'prove', surface: 'identity equality over reals',
      parts: ['universal_scope', 'identity_operator', 'neutral_element'], preconditions: ['domain is real', 'identity form is supported'],
      inverse_chain: [], closure_operator: 'proveAlgebraicIdentity', closure_result: 'identity_truth',
      examples: ['∀x ∈ ℝ, x + 0 = x', '∀x ∈ ℝ, x * 1 = x'], assertion: "assert.strictEqual(P.proveAlgebraicIdentity('∀x ∈ ℝ, x + 0 = x').ok, true);"
    }),
    implication_chain: Object.freeze({
      id: 'implication_chain', operation: 'compose', surface: 'A=>B and B=>C gives A=>C',
      parts: ['antecedent', 'middle', 'consequent'], preconditions: ['first consequent equals second antecedent'],
      inverse_chain: [], closure_operator: 'composeImplicationChain', closure_result: 'composed_implication',
      examples: ['A=>B, B=>C'], assertion: "assert.strictEqual(P.composeImplicationChain(['A=>B', 'B=>C']).conclusion, 'A=>C');"
    }),
    contradiction_pair: Object.freeze({
      id: 'contradiction_pair', operation: 'detect', surface: 'A and not A cannot both be true in the same scope',
      parts: ['claim', 'negated_claim', 'scope'], preconditions: ['same scope', 'same referent'], violations: ['claim and negated claim both asserted'],
      inverse_chain: [], closure_operator: 'detectContradiction', closure_result: 'contradiction_flag',
      examples: ['A, not A'], assertion: "assert.strictEqual(P.detectContradiction(['A', 'not A']).contradiction, true);"
    }),
    statement_classification: Object.freeze({
      id: 'statement_classification', operation: 'classify', surface: 'compiled math packet to closure class',
      parts: ['mode', 'operators', 'relation', 'domain'], preconditions: ['packet has mode'],
      inverse_chain: [], closure_operator: 'classifyMathStatement', closure_result: 'closure_operator_name',
      examples: ['∀x ∈ ℝ, x^2 >= 0'], assertion: "assert.strictEqual(P.classifyMathStatement('∀x ∈ ℝ, x^2 >= 0').closure, 'proveSquareNonnegative');"
    })
  });

  function catalog() { return Object.keys(CATALOG).sort().map(key => Object.assign({}, CATALOG[key])); }
  function has(source, needle) { return String(source || '').indexOf(String(needle || '')) >= 0; }

  function astSurfaceIds(samples) {
    if (!MathAstCore || typeof MathAstCore.classify !== 'function') return [];
    const rows = Array.isArray(samples) ? samples : [
      '2x + 1 = 7',
      '2x + 1',
      '2x + 1 = x + 4',
      '2x + 1 with x = 3',
      'x >= 3 with x = 5',
      '2 + 3 * 4 = 14',
      '(2 + 3)^2 = 25',
      'x/y is undefined when y = 0',
      '∀x ∈ ℝ, x^2 >= 0',
      '∀x ∈ ℝ, x + 0 = x',
      '∀x ∈ ℝ, x * 1 = x',
      'A=>B, B=>C',
      'A, not A'
    ];
    return Array.from(new Set(rows.map(sample => MathAstCore.classify(sample).anatomy_id).filter(Boolean))).sort();
  }

  function availableSurfaces(parserSource) {
    const source = String(parserSource || '');
    const astIds = astSurfaceIds(arguments[1] && arguments[1].samples);
    const out = [];
    if (has(source, 'compileMath')) out.push('statement_classification');
    if (has(source, 'checkProofStep') || has(source, 'checkHypotheticalSyllogism')) out.push('implication_chain');
    if (has(source, 'checkProofStep') || has(source, 'compileClaim')) out.push('contradiction_pair');
    if (has(source, 'compileMath') && has(source, "mode: 'equation'")) out.push('affine_equation');
    if (has(source, 'compileMath') && has(source, "mode: 'equation'")) out.push('affine_expression');
    if (has(source, 'compileMath') && has(source, "mode: 'relation'")) out.push('linear_relation_truth');
    if (has(source, 'compileMath') && has(source, 'undefined-when')) out.push('division_constraint');
    if (has(source, 'compileMath') && has(source, 'square') && (/\^2|²/.test(source))) out.push('square_nonnegative');
    return Array.from(new Set(out.concat(astIds))).sort();
  }

  function closureGaps(parserSource, options) {
    const opts = Object.assign({ file: 'src/language-parser-v0-1.js' }, options || {});
    const source = String(parserSource || '');
    return availableSurfaces(source, opts)
      .map(id => CATALOG[id])
      .filter(anatomy => anatomy && !has(source, anatomy.closure_operator))
      .map(anatomy => ({
        id: 'parser_' + anatomy.closure_operator.replace(/[A-Z]/g, ch => '_' + ch.toLowerCase()).replace(/^_/, ''),
        file: opts.file,
        needle: anatomy.closure_operator,
        class: 'operator_anatomy_closure',
        anatomy_id: anatomy.id,
        operation: anatomy.operation,
        parts: A(anatomy.parts),
        preconditions: A(anatomy.preconditions),
        violations: A(anatomy.violations),
        inverse_chain: A(anatomy.inverse_chain),
        parsed_form: anatomy.examples[0] || anatomy.surface,
        reason: 'Operator anatomy exposes a representable surface whose closure operator is missing.',
        assertion: anatomy.assertion,
        w: 1
      }));
  }

  function frontierNode(parserSource, options) {
    const gaps = closureGaps(parserSource, options);
    if (!gaps.length) return null;
    return {
      id: 'formal_math_operator_anatomy_batch_' + gaps.map(g => g.needle).join('_'),
      source: 'operator_anatomy_generated_closure_failure',
      generated_from: {
        anatomy_ids: gaps.map(g => g.anatomy_id),
        parsed_forms: gaps.map(g => g.parsed_form),
        reason: 'Operator anatomy found representable operation surfaces whose closure operators are missing.',
        missing_operators: gaps.map(g => g.needle)
      },
      requires: ['solveLinearEquation', 'checkProofStep', 'solveTwoStepLinearEquation', 'checkHypotheticalSyllogism'],
      axes: gaps.map(g => ({ id: g.id, file: g.file, needle: g.needle, class: g.class, w: g.w, anatomy_id: g.anatomy_id })),
      assertions: gaps.reduce((rows, g) => rows.concat(["assert.strictEqual(typeof P." + g.needle + ", 'function');", g.assertion]), [])
    };
  }

  function pressure(parserSource, options) {
    const gaps = closureGaps(parserSource, options);
    const surfaces = availableSurfaces(parserSource);
    const scalar = gaps.length;
    return { packet_type: '42ndMind_operator_anatomy_pressure_v0_1', version: VERSION, scalar, surfaces, gaps: gaps.map(g => ({ needle: g.needle, anatomy_id: g.anatomy_id, operation: g.operation })), unit: { surfaces: R(surfaces.length ? 1 : 0), gaps: R(gaps.length ? 1 : 0), ok: true }, ξ: '' };
  }

  return Object.freeze({ VERSION, catalog, availableSurfaces, closureGaps, frontierNode, pressure });
});
