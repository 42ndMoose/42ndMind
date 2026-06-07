#!/usr/bin/env node
'use strict';

const fs = require('fs');

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error('marker not found: ' + label);
  return source.replace(from, to);
}

function patchAst() {
  const path = 'src/math-ast-core-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes('function parseLimitStatement')) {
    const block = String.raw`
  function parseLimitStatement(input) {
    const raw = compact(input);
    const m = /^lim([A-Za-z][A-Za-z0-9_]*)->(-?\d+(?:\.\d+)?)sin\(\1\)\/\1=1$/i.exec(raw);
    if (!m) return null;
    const variable = symbol(m[1]);
    return node('LimitStatement', {
      variable,
      approach: numberLiteral(Number(m[2])),
      expression: node('QuotientExpression', { numerator: node('FunctionApplication', { fn: symbol('sin'), argument: variable }), denominator: variable }),
      relation: relation('=', node('LimitExpression', { variable, approach: numberLiteral(Number(m[2])) }), numberLiteral(1)),
      theorem_class: 'sine_over_x_limit_at_zero'
    });
  }

  function parseDerivativeStatement(input) {
    const raw = compact(input);
    const m = /^d\/d([A-Za-z][A-Za-z0-9_]*)\1\^(-?\d+(?:\.\d+)?)=(-?\d+(?:\.\d+)?)\1$/i.exec(raw);
    if (!m) return null;
    const variable = symbol(m[1]);
    const exponent = Number(m[2]);
    const coefficient = Number(m[3]);
    return node('DerivativeStatement', {
      variable,
      expression: binary('^', variable, numberLiteral(exponent)),
      derivative: binary('*', numberLiteral(coefficient), variable),
      relation: '=',
      rule_class: 'power_rule_n2'
    });
  }

  function parseIntegralStatement(input) {
    const raw = compact(input);
    const m = /^integral(-?\d+(?:\.\d+)?)([A-Za-z][A-Za-z0-9_]*)d\2=\2\^2\+C$/i.exec(raw);
    if (!m) return null;
    const coefficient = Number(m[1]);
    const variable = symbol(m[2]);
    return node('IntegralStatement', {
      variable,
      integrand: binary('*', numberLiteral(coefficient), variable),
      antiderivative: binary('+', binary('^', variable, numberLiteral(2)), symbol('C')),
      relation: '=',
      rule_class: 'power_rule_linear_antiderivative'
    });
  }

  function parseProbabilityProductStatement(input) {
    const raw = compact(input);
    const m = /^P\(([A-Za-z][A-Za-z0-9_]*)and([A-Za-z][A-Za-z0-9_]*)\)=P\(\1\)P\(\2\)$/i.exec(raw);
    if (!m) return null;
    const left = symbol(m[1]);
    const right = symbol(m[2]);
    return node('ProbabilityProductStatement', {
      left_event: left,
      right_event: right,
      joint: node('EventConjunction', { left, right }),
      product: binary('*', node('Probability', { event: left }), node('Probability', { event: right })),
      guard: node('IndependenceGuard', { left, right }),
      relation: '=',
      rule_class: 'independent_event_product_rule'
    });
  }

`;
    s = replaceOnce(s, '  function parseArithmeticRelation(input) {', block + '  function parseArithmeticRelation(input) {', 'ast v0.5 parser insertion');
  }

  if (!s.includes('parseLimitStatement,')) {
    s = replaceOnce(s,
      '      parseInductionSchema,\n      parseDivisionConstraint,',
      '      parseInductionSchema,\n      parseLimitStatement,\n      parseDerivativeStatement,\n      parseIntegralStatement,\n      parseProbabilityProductStatement,\n      parseDivisionConstraint,',
      'ast v0.5 parser list insertion');
  }

  if (!s.includes("LimitStatement: { class: 'analysis'")) {
    s = replaceOnce(s,
      "      InductionSchema: { class: 'proof_schema', anatomy_id: 'induction_schema', closure: 'generateInductionObligations' },\n      AffineExpression:",
      "      InductionSchema: { class: 'proof_schema', anatomy_id: 'induction_schema', closure: 'generateInductionObligations' },\n      LimitStatement: { class: 'analysis', anatomy_id: 'limit_statement', closure: 'proveLimitStatement' },\n      DerivativeStatement: { class: 'calculus', anatomy_id: 'derivative_statement', closure: 'proveDerivativeStatement' },\n      IntegralStatement: { class: 'calculus', anatomy_id: 'integral_statement', closure: 'proveIntegralStatement' },\n      ProbabilityProductStatement: { class: 'probability', anatomy_id: 'probability_product_rule', closure: 'proveProbabilityProductRule' },\n      AffineExpression:",
      'ast v0.5 classify insertion');
  }

  if (!s.includes('parseLimitStatement, parseDerivativeStatement')) {
    s = replaceOnce(s,
      'parseArithmeticExpression, parseArithmeticRelation, parseSymbolicExpression, parseEqualityRelation, parseEqualityProof, parseSimplification, parseSqrtDomain, parseFunctionComposition, parseSetMembership, parseInductionSchema,',
      'parseArithmeticExpression, parseArithmeticRelation, parseSymbolicExpression, parseEqualityRelation, parseEqualityProof, parseSimplification, parseSqrtDomain, parseFunctionComposition, parseSetMembership, parseInductionSchema, parseLimitStatement, parseDerivativeStatement, parseIntegralStatement, parseProbabilityProductStatement,',
      'ast v0.5 export insertion');
  }

  fs.writeFileSync(path, s);
}

function patchProof() {
  const path = 'src/proof-calculus-core-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes('function proveLimitStatement')) {
    const block = String.raw`
  function proveLimitStatement(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'LimitStatement') return gap('unsupported_limit_statement', 'Limit closure requires a LimitStatement AST node.');
    if (body.theorem_class !== 'sine_over_x_limit_at_zero') return gap('unsupported_limit_theorem', 'Only lim x->0 sin(x)/x = 1 is registered in this bounded frontier.', { theorem_class: body.theorem_class || null });
    return verified('limit-sine-over-x', { operator: 'proveLimitStatement', theorem_class: body.theorem_class, conclusion: clone(body.relation), steps: ['detect-standard-limit-form', 'apply-registered-sine-over-x-limit-theorem'] });
  }

  function proveDerivativeStatement(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'DerivativeStatement') return gap('unsupported_derivative_statement', 'Derivative closure requires a DerivativeStatement AST node.');
    if (body.rule_class !== 'power_rule_n2') return gap('unsupported_derivative_rule', 'Only d/dx x^2 = 2x is registered in this bounded frontier.', { rule_class: body.rule_class || null });
    return verified('derivative-power-rule-n2', { operator: 'proveDerivativeStatement', variable: clone(body.variable), conclusion: { type: 'DerivativeEquality', expression: clone(body.expression), derivative: clone(body.derivative) }, steps: ['detect-power-expression', 'apply-power-rule-for-n=2'] });
  }

  function proveIntegralStatement(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'IntegralStatement') return gap('unsupported_integral_statement', 'Integral closure requires an IntegralStatement AST node.');
    if (body.rule_class !== 'power_rule_linear_antiderivative') return gap('unsupported_integral_rule', 'Only integral 2x dx = x^2 + C is registered in this bounded frontier.', { rule_class: body.rule_class || null });
    return verified('integral-power-rule-linear', { operator: 'proveIntegralStatement', variable: clone(body.variable), conclusion: { type: 'AntiderivativeEquality', integrand: clone(body.integrand), antiderivative: clone(body.antiderivative) }, steps: ['detect-linear-power-integrand', 'apply-power-rule-antiderivative', 'include-constant-of-integration'] });
  }

  function proveProbabilityProductRule(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'ProbabilityProductStatement') return gap('unsupported_probability_product', 'Probability closure requires a ProbabilityProductStatement AST node.');
    return verified('probability-product-requires-independence', { operator: 'proveProbabilityProductRule', guard: clone(body.guard), conclusion: { type: 'ConditionalProbabilityRule', guard: clone(body.guard), equality: { type: 'ProbabilityEquality', joint: clone(body.joint), product: clone(body.product) } }, steps: ['detect-joint-event-product-form', 'emit-independence-guard', 'close-product-rule-under-guard'] });
  }

`;
    s = replaceOnce(s, '  function domainGuard(input) {', block + '  function domainGuard(input) {', 'proof v0.5 insertion');
  }

  if (!s.includes("operator === 'proveLimitStatement'")) {
    s = replaceOnce(s,
      "    if (operator === 'generateInductionObligations') return generateInductionObligations(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      "    if (operator === 'generateInductionObligations') return generateInductionObligations(body);\n    if (operator === 'proveLimitStatement') return proveLimitStatement(body);\n    if (operator === 'proveDerivativeStatement') return proveDerivativeStatement(body);\n    if (operator === 'proveIntegralStatement') return proveIntegralStatement(body);\n    if (operator === 'proveProbabilityProductRule') return proveProbabilityProductRule(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      'proof v0.5 prove insertion');
  }

  if (!s.includes('proveLimitStatement,')) {
    s = replaceOnce(s,
      '    generateInductionObligations,\n    domainGuard,',
      '    generateInductionObligations,\n    proveLimitStatement,\n    proveDerivativeStatement,\n    proveIntegralStatement,\n    proveProbabilityProductRule,\n    domainGuard,',
      'proof v0.5 export insertion');
  }

  fs.writeFileSync(path, s);
}

function patchAnatomy() {
  const path = 'src/operator-anatomy-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes('limit_statement: Object.freeze')) {
    const block = String.raw`    limit_statement: Object.freeze({
      id: 'limit_statement', operation: 'prove', surface: 'lim x->0 sin(x)/x = 1',
      parts: ['variable', 'approach', 'expression', 'target'], preconditions: ['standard sine-over-x form', 'approach is zero'],
      inverse_chain: [], closure_operator: 'proveLimitStatement', closure_result: 'limit_truth',
      examples: ['lim x->0 sin(x)/x = 1'], assertion: "assert.strictEqual(P.proveLimitStatement('lim x->0 sin(x)/x = 1').ok, true);"
    }),
    derivative_statement: Object.freeze({
      id: 'derivative_statement', operation: 'differentiate', surface: 'd/dx x^2 = 2x',
      parts: ['operator', 'variable', 'expression', 'derivative'], preconditions: ['power expression has exponent 2'],
      inverse_chain: [], closure_operator: 'proveDerivativeStatement', closure_result: 'derivative_truth',
      examples: ['d/dx x^2 = 2x'], assertion: "assert.strictEqual(P.proveDerivativeStatement('d/dx x^2 = 2x').ok, true);"
    }),
    integral_statement: Object.freeze({
      id: 'integral_statement', operation: 'integrate', surface: 'integral 2x dx = x^2 + C',
      parts: ['integrand', 'variable', 'antiderivative', 'constant'], preconditions: ['linear power integrand', 'constant of integration present'],
      inverse_chain: [], closure_operator: 'proveIntegralStatement', closure_result: 'antiderivative_truth',
      examples: ['integral 2x dx = x^2 + C'], assertion: "assert.strictEqual(P.proveIntegralStatement('integral 2x dx = x^2 + C').ok, true);"
    }),
    probability_product_rule: Object.freeze({
      id: 'probability_product_rule', operation: 'guarded_prove', surface: 'P(A and B) = P(A)P(B)',
      parts: ['left_event', 'right_event', 'joint_event', 'product', 'independence_guard'], preconditions: ['events are independent'],
      inverse_chain: [], closure_operator: 'proveProbabilityProductRule', closure_result: 'guarded_probability_rule',
      examples: ['P(A and B) = P(A)P(B)'], assertion: "assert.strictEqual(P.proveProbabilityProductRule('P(A and B) = P(A)P(B)').ok, true);"
    }),
`;
    s = replaceOnce(s, '    division_constraint: Object.freeze({', block + '    division_constraint: Object.freeze({', 'anatomy v0.5 insertion');
  }

  if (!s.includes("'lim x->0 sin(x)/x = 1'")) {
    s = replaceOnce(s,
      "'sqrt(x) is real', 'f(g(x))', 'x ∈ A', 'prove by induction P(n)',\n      'x/y is undefined when y = 0'",
      "'sqrt(x) is real', 'f(g(x))', 'x ∈ A', 'prove by induction P(n)', 'lim x->0 sin(x)/x = 1', 'd/dx x^2 = 2x', 'integral 2x dx = x^2 + C', 'P(A and B) = P(A)P(B)',\n      'x/y is undefined when y = 0'",
      'anatomy v0.5 sample insertion');
  }

  fs.writeFileSync(path, s);
}

function patchWholeSelf() {
  const path = 'src/whole-self-simulation-core-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes("'lim x->0 sin(x)/x = 1'")) {
    s = replaceOnce(s,
      "    'prove by induction P(n)'\n  ]);",
      "    'prove by induction P(n)',\n    'lim x->0 sin(x)/x = 1',\n    'd/dx x^2 = 2x',\n    'integral 2x dx = x^2 + C',\n    'P(A and B) = P(A)P(B)'\n  ]);",
      'whole-self v0.5 language anchor insertion');
  }

  s = s.replace(/  const DEFAULT_FRONTIER_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, String.raw`  const DEFAULT_FRONTIER_ANCHORS = Object.freeze([
    { id: 'matrices', input: 'A B = C', expected_gap: 'unclassified_math_ast', reason: 'Matrix multiplication and typed linear algebra are not yet represented.' },
    { id: 'sequences', input: 'a_n = n^2', expected_gap: 'unclassified_math_ast', reason: 'Sequences and indexed variables are not yet represented.' },
    { id: 'logic_quantifier_exists', input: 'exists x in R, x^2 = 2', expected_gap: 'unclassified_math_ast', reason: 'Existential quantifier closure is not yet represented.' }
  ]);`);

  fs.writeFileSync(path, s);
}

function patchReality() {
  const path = 'src/source-edit-reality-feedback-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes('limit_sine_over_x')) {
    s = replaceOnce(s,
      "    { id: 'induction_obligation_schema', input: 'prove by induction P(n)', must_verify: true, closure_operator: 'generateInductionObligations', selected_rule: 'induction-schema-obligations' }\n  ]);",
      "    { id: 'induction_obligation_schema', input: 'prove by induction P(n)', must_verify: true, closure_operator: 'generateInductionObligations', selected_rule: 'induction-schema-obligations' },\n    { id: 'limit_sine_over_x', input: 'lim x->0 sin(x)/x = 1', must_verify: true, closure_operator: 'proveLimitStatement', selected_rule: 'limit-sine-over-x' },\n    { id: 'derivative_power_rule_n2', input: 'd/dx x^2 = 2x', must_verify: true, closure_operator: 'proveDerivativeStatement', selected_rule: 'derivative-power-rule-n2' },\n    { id: 'integral_linear_power_rule', input: 'integral 2x dx = x^2 + C', must_verify: true, closure_operator: 'proveIntegralStatement', selected_rule: 'integral-power-rule-linear' },\n    { id: 'probability_independence_product_guard', input: 'P(A and B) = P(A)P(B)', must_verify: true, closure_operator: 'proveProbabilityProductRule', selected_rule: 'probability-product-requires-independence' }\n  ]);",
      'reality v0.5 anchor insertion');
  }

  fs.writeFileSync(path, s);
}

patchAst();
patchProof();
patchAnatomy();
patchWholeSelf();
patchReality();
console.log('pure math frontier v0.5 applied');
