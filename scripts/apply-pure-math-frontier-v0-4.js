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
  if (!s.includes('function parseSqrtDomain')) {
    const block = String.raw`
  function parseSqrtDomain(input) {
    const text = normalize(input);
    const m = /^sqrt\(([^)]+)\)\s+is\s+real$/i.exec(text);
    if (!m) return null;
    const radicand = parseSymbolicExpression(m[1]);
    if (!radicand) return null;
    return node('SqrtDomainStatement', { radicand, domain: symbol('R'), guard: relation('>=', radicand, numberLiteral(0)) });
  }

  function parseFunctionComposition(input) {
    const raw = compact(input);
    const m = /^([A-Za-z][A-Za-z0-9_]*)\(([A-Za-z][A-Za-z0-9_]*)\(([A-Za-z][A-Za-z0-9_]*)\)\)$/.exec(raw);
    if (!m) return null;
    const inner = node('FunctionApplication', { fn: symbol(m[2]), argument: symbol(m[3]) });
    const outer = node('FunctionApplication', { fn: symbol(m[1]), argument: inner });
    return node('FunctionComposition', { outer: symbol(m[1]), inner: symbol(m[2]), argument: symbol(m[3]), expression: outer });
  }

  function parseSetMembership(input) {
    const text = normalize(input);
    const m = /^([A-Za-z][A-Za-z0-9_]*)\s+in\s+([A-Za-z][A-Za-z0-9_]*)$/i.exec(text);
    if (!m) return null;
    return node('SetMembership', { element: symbol(m[1]), set: symbol(m[2]), relation: 'in' });
  }

  function parseInductionSchema(input) {
    const text = normalize(input);
    const m = /^prove\s+by\s+induction\s+([A-Za-z][A-Za-z0-9_]*)\(([A-Za-z][A-Za-z0-9_]*)\)$/i.exec(text);
    if (!m) return null;
    const predicate = symbol(m[1]);
    const variable = symbol(m[2]);
    return node('InductionSchema', {
      predicate,
      variable,
      domain: symbol('N'),
      base_case: node('PredicateApplication', { predicate, argument: numberLiteral(0) }),
      inductive_step: node('Implication', {
        antecedent: node('PredicateApplication', { predicate, argument: variable }),
        consequent: node('PredicateApplication', { predicate, argument: binary('+', variable, numberLiteral(1)) })
      })
    });
  }

`;
    s = replaceOnce(s, '  function parseArithmeticRelation(input) {', block + '  function parseArithmeticRelation(input) {', 'ast frontier parser insertion');
  }
  if (!s.includes('parseSqrtDomain,')) {
    s = replaceOnce(s,
      '      parseSimplification,\n      parseDivisionConstraint,',
      '      parseSimplification,\n      parseSqrtDomain,\n      parseFunctionComposition,\n      parseSetMembership,\n      parseInductionSchema,\n      parseDivisionConstraint,',
      'ast parser list frontier insertion');
  }
  if (!s.includes("SqrtDomainStatement: { class: 'constraint'")) {
    s = replaceOnce(s,
      "      Simplification: { class: 'rewrite', anatomy_id: 'expression_simplification', closure: 'simplifyExpression' },\n      AffineExpression:",
      "      Simplification: { class: 'rewrite', anatomy_id: 'expression_simplification', closure: 'simplifyExpression' },\n      SqrtDomainStatement: { class: 'constraint', anatomy_id: 'sqrt_domain', closure: 'proveSqrtDomain' },\n      FunctionComposition: { class: 'expression', anatomy_id: 'function_composition', closure: 'composeFunctionApplication' },\n      SetMembership: { class: 'relation', anatomy_id: 'set_membership', closure: 'typeSetMembership' },\n      InductionSchema: { class: 'proof_schema', anatomy_id: 'induction_schema', closure: 'generateInductionObligations' },\n      AffineExpression:",
      'ast classify frontier insertion');
  }
  if (!s.includes('parseSqrtDomain, parseFunctionComposition')) {
    s = replaceOnce(s,
      'parseArithmeticExpression, parseArithmeticRelation, parseSymbolicExpression, parseEqualityRelation, parseEqualityProof, parseSimplification,',
      'parseArithmeticExpression, parseArithmeticRelation, parseSymbolicExpression, parseEqualityRelation, parseEqualityProof, parseSimplification, parseSqrtDomain, parseFunctionComposition, parseSetMembership, parseInductionSchema,',
      'ast export frontier insertion');
  }
  fs.writeFileSync(path, s);
}

function patchProof() {
  const path = 'src/proof-calculus-core-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');
  if (!s.includes('function proveSqrtDomain')) {
    const block = String.raw`
  function proveSqrtDomain(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'SqrtDomainStatement') return gap('unsupported_sqrt_domain', 'Square-root domain closure requires a SqrtDomainStatement AST node.');
    const radicandValue = valueOf(body.radicand);
    if (Number.isFinite(radicandValue) && radicandValue < 0) return gap('sqrt_negative_radicand', 'sqrt(x) is real over R only when the radicand is nonnegative.', { radicand: clone(body.radicand) });
    return verified('sqrt-domain-guard', { operator: 'proveSqrtDomain', guard: clone(body.guard), conclusion: { type: 'DomainGuard', expression: 'sqrt', requirement: clone(body.guard) }, steps: ['detect-square-root', 'emit-real-domain-radicand-guard'] });
  }

  function composeFunctionApplication(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'FunctionComposition') return gap('unsupported_function_composition', 'Function composition closure requires a FunctionComposition AST node.');
    return verified('function-composition-canonicalization', { operator: 'composeFunctionApplication', outer: clone(body.outer), inner: clone(body.inner), argument: clone(body.argument), conclusion: clone(body.expression), steps: ['detect-nested-function-application', 'canonicalize-as-composition-tree'] });
  }

  function typeSetMembership(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'SetMembership') return gap('unsupported_set_membership', 'Set membership closure requires a SetMembership AST node.');
    return verified('set-membership-typing', { operator: 'typeSetMembership', element: clone(body.element), set: clone(body.set), conclusion: { type: 'TypedRelation', operator: 'in', element: clone(body.element), set: clone(body.set) }, steps: ['detect-membership-relation', 'canonicalize-element-set-relation'] });
  }

  function generateInductionObligations(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'InductionSchema') return gap('unsupported_induction_schema', 'Induction closure requires an InductionSchema AST node.');
    return verified('induction-schema-obligations', { operator: 'generateInductionObligations', predicate: clone(body.predicate), variable: clone(body.variable), domain: clone(body.domain), conclusion: { type: 'ProofObligations', schema: 'induction', obligations: [clone(body.base_case), clone(body.inductive_step)] }, steps: ['detect-induction-request', 'emit-base-case', 'emit-inductive-step'] });
  }

`;
    s = replaceOnce(s, '  function domainGuard(input) {', block + '  function domainGuard(input) {', 'proof frontier insertion');
  }
  if (!s.includes("operator === 'proveSqrtDomain'")) {
    s = replaceOnce(s,
      "    if (operator === 'simplifyExpression') return simplifyExpression(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      "    if (operator === 'simplifyExpression') return simplifyExpression(body);\n    if (operator === 'proveSqrtDomain') return proveSqrtDomain(body);\n    if (operator === 'composeFunctionApplication') return composeFunctionApplication(body);\n    if (operator === 'typeSetMembership') return typeSetMembership(body);\n    if (operator === 'generateInductionObligations') return generateInductionObligations(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      'proof prove operator frontier insertion');
  }
  if (!s.includes('proveSqrtDomain,')) {
    s = replaceOnce(s,
      '    simplifyExpression,\n    simplifyNode,',
      '    simplifyExpression,\n    simplifyNode,\n    proveSqrtDomain,\n    composeFunctionApplication,\n    typeSetMembership,\n    generateInductionObligations,',
      'proof export frontier insertion');
  }
  fs.writeFileSync(path, s);
}

function patchAnatomy() {
  const path = 'src/operator-anatomy-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');
  if (!s.includes('sqrt_domain: Object.freeze')) {
    const block = String.raw`    sqrt_domain: Object.freeze({
      id: 'sqrt_domain', operation: 'guard', surface: 'sqrt(x) is real requires x >= 0 over reals',
      parts: ['radicand', 'real_domain_guard'], preconditions: ['radicand is represented', 'real square-root requires radicand >= 0'],
      inverse_chain: [], closure_operator: 'proveSqrtDomain', closure_result: 'domain_guard',
      examples: ['sqrt(x) is real'], assertion: "assert.strictEqual(P.proveSqrtDomain('sqrt(x) is real').ok, true);"
    }),
    function_composition: Object.freeze({
      id: 'function_composition', operation: 'canonicalize', surface: 'f(g(x)) as nested function application',
      parts: ['outer_function', 'inner_function', 'argument'], preconditions: ['outer and inner are symbolic functions', 'argument is symbolic'],
      inverse_chain: [], closure_operator: 'composeFunctionApplication', closure_result: 'composition_tree',
      examples: ['f(g(x))'], assertion: "assert.strictEqual(P.composeFunctionApplication('f(g(x))').ok, true);"
    }),
    set_membership: Object.freeze({
      id: 'set_membership', operation: 'type', surface: 'x in A',
      parts: ['element', 'set'], preconditions: ['element symbol exists', 'set symbol exists'],
      inverse_chain: [], closure_operator: 'typeSetMembership', closure_result: 'typed_membership_relation',
      examples: ['x ∈ A'], assertion: "assert.strictEqual(P.typeSetMembership('x ∈ A').ok, true);"
    }),
    induction_schema: Object.freeze({
      id: 'induction_schema', operation: 'generate_obligations', surface: 'prove by induction P(n)',
      parts: ['predicate', 'variable', 'base_case', 'inductive_step'], preconditions: ['predicate is symbolic', 'variable ranges over N'],
      inverse_chain: [], closure_operator: 'generateInductionObligations', closure_result: 'proof_obligations',
      examples: ['prove by induction P(n)'], assertion: "assert.strictEqual(P.generateInductionObligations('prove by induction P(n)').ok, true);"
    }),
`;
    s = replaceOnce(s, '    division_constraint: Object.freeze({', block + '    division_constraint: Object.freeze({', 'anatomy frontier insertion');
  }
  if (!s.includes("'sqrt(x) is real', 'f(g(x))', 'x ∈ A', 'prove by induction P(n)'")) {
    s = replaceOnce(s,
      "'simplify x + 0', 'simplify x * 1',\n      'x/y is undefined when y = 0'",
      "'simplify x + 0', 'simplify x * 1', 'sqrt(x) is real', 'f(g(x))', 'x ∈ A', 'prove by induction P(n)',\n      'x/y is undefined when y = 0'",
      'anatomy ast sample frontier insertion');
  }
  fs.writeFileSync(path, s);
}

function patchWholeSelf() {
  const path = 'src/whole-self-simulation-core-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');
  s = s.replace("    'sqrt(x) is real'\n  ]);", "    'sqrt(x) is real',\n    'f(g(x))',\n    'x ∈ A',\n    'prove by induction P(n)'\n  ]);");
  s = s.replace(/  const DEFAULT_FRONTIER_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, String.raw`  const DEFAULT_FRONTIER_ANCHORS = Object.freeze([
    { id: 'limits', input: 'lim x->0 sin(x)/x = 1', expected_gap: 'unclassified_math_ast', reason: 'Limits are not yet represented in the canonical math language.' },
    { id: 'derivative', input: 'd/dx x^2 = 2x', expected_gap: 'unclassified_math_ast', reason: 'Derivative operators are not yet represented.' },
    { id: 'integral', input: 'integral 2x dx = x^2 + C', expected_gap: 'unclassified_math_ast', reason: 'Integral operators are not yet represented.' },
    { id: 'probability', input: 'P(A and B) = P(A)P(B)', expected_gap: 'unclassified_math_ast', reason: 'Probability/event algebra is not yet represented.' }
  ]);`);
  fs.writeFileSync(path, s);
}

patchAst();
patchProof();
patchAnatomy();
patchWholeSelf();
console.log('pure math frontier v0.4 applied');
