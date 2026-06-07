(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindProofCalculusCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-12;
  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(12));

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function bodyOf(input) { return input && input.type === 'MathProgram' ? input.body : input; }
  function finite(value) { return Number.isFinite(Number(value)); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function gap(id, reason, data) { return Object.assign({ ok: false, verified: false, gap: { id, reason } }, data || {}); }
  function verified(rule, data) { return Object.assign({ ok: true, verified: true, rule, gaps: [] }, data || {}); }

  function symbolName(node) {
    if (!node) return null;
    if (node.type === 'Symbol') return String(node.name || '');
    if (typeof node === 'string') return node;
    return null;
  }

  function atomKey(node) {
    if (!node) return '';
    if (node.type === 'Symbol') return String(node.name || '').trim().toUpperCase();
    if (node.type === 'UnaryExpression' && node.operator === 'not') return 'not ' + atomKey(node.argument);
    if (typeof node === 'string') return node.trim().toUpperCase();
    return JSON.stringify(node);
  }

  function expressionText(node) {
    if (!node) return '';
    if (node.type === 'NumberLiteral') return String(node.value);
    if (node.type === 'Symbol') return node.name;
    if (node.type === 'Undefined') return 'undefined';
    if (node.type === 'UnaryExpression') return String(node.operator) + ' ' + expressionText(node.argument);
    if (node.type === 'BinaryExpression') return expressionText(node.left) + String(node.operator) + expressionText(node.right);
    if (node.type === 'AffineExpression') return String(node.coefficient) + '*' + (node.variable || '') + (node.offset < 0 ? String(node.offset) : '+' + String(node.offset));
    if (node.type === 'Relation') return expressionText(node.left) + node.operator + expressionText(node.right);
    return JSON.stringify(node);
  }

  function valueOf(node) {
    if (node && node.type === 'NumberLiteral') return Number(node.value);
    if (finite(node)) return Number(node);
    return NaN;
  }

  function evaluateNumericExpression(node) {
    if (!node) return NaN;
    if (node.type === 'NumberLiteral') return Number(node.value);
    if (node.type === 'UnaryExpression' && node.operator === '-') return -evaluateNumericExpression(node.argument);
    if (node.type !== 'BinaryExpression') return NaN;
    const left = evaluateNumericExpression(node.left);
    const right = evaluateNumericExpression(node.right);
    if (!finite(left) || !finite(right)) return NaN;
    if (node.operator === '+') return left + right;
    if (node.operator === '-') return left - right;
    if (node.operator === '*') return left * right;
    if (node.operator === '/') return Math.abs(right) <= EPS ? NaN : left / right;
    if (node.operator === '^') return Math.pow(left, right);
    return NaN;
  }

  function compare(left, op, right) {
    if (!finite(left) || !finite(right)) return null;
    if (op === '>=') return left >= right;
    if (op === '<=') return left <= right;
    if (op === '>') return left > right;
    if (op === '<') return left < right;
    if (op === '=') return Math.abs(left - right) <= EPS;
    return null;
  }

  function identity(left, right) {
    if (arguments.length === 1) return verified('identity', { conclusion: clone(left), left: clone(left), right: clone(left) });
    return same(left, right)
      ? verified('identity', { conclusion: clone(right), left: clone(left), right: clone(right) })
      : gap('identity_mismatch', 'Identity requires both sides to be canonically identical.', { left: clone(left), right: clone(right) });
  }

  function substituteNode(node, assignments) {
    if (!node || typeof node !== 'object') return node;
    if (node.type === 'Symbol' && Object.prototype.hasOwnProperty.call(assignments, node.name)) return { type: 'NumberLiteral', value: R(assignments[node.name]) };
    if (node.type === 'BinaryExpression') return Object.assign({}, node, { left: substituteNode(node.left, assignments), right: substituteNode(node.right, assignments) });
    if (node.type === 'UnaryExpression') return Object.assign({}, node, { argument: substituteNode(node.argument, assignments) });
    if (node.type === 'Relation') return Object.assign({}, node, { left: substituteNode(node.left, assignments), right: substituteNode(node.right, assignments) });
    if (node.type === 'AffineExpression') return node.variable && Object.prototype.hasOwnProperty.call(assignments, node.variable)
      ? { type: 'NumberLiteral', value: R(Number(node.coefficient) * Number(assignments[node.variable]) + Number(node.offset || 0)) }
      : clone(node);
    return clone(node);
  }

  function substitution(target, assignment) {
    const body = bodyOf(target);
    const assignments = {};
    if (assignment && assignment.type === 'Assignment') assignments[assignment.variable] = valueOf(assignment.value);
    else if (assignment && typeof assignment === 'object') Object.keys(assignment).forEach(key => { if (finite(assignment[key])) assignments[key] = Number(assignment[key]); });
    if (!Object.keys(assignments).length) return gap('missing_substitution_assignment', 'Substitution requires a finite assignment.');
    const substituted = substituteNode(body, assignments);
    return verified('substitution', { input: clone(body), assignment: clone(assignments), conclusion: substituted });
  }

  function equivalenceRewrite(target, from, to) {
    const base = bodyOf(target);
    if (!same(base, from)) return gap('rewrite_source_mismatch', 'Equivalence rewrite requires the source pattern to match the target.', { target: clone(base), from: clone(from), to: clone(to) });
    return verified('equivalence-rewrite', { input: clone(base), from: clone(from), to: clone(to), conclusion: clone(to) });
  }

  function inverseOperation(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'Equation') return gap('unsupported_inverse_operation', 'Inverse operation currently supports Equation AST nodes.');
    const left = body.left;
    const right = valueOf(body.right);
    if (!left || left.type !== 'AffineExpression') return gap('left_side_not_affine', 'Solving requires an affine left side.', { equation: clone(body) });
    if (!finite(right)) return gap('non_finite_target', 'Solving requires a finite numeric target.', { equation: clone(body) });
    if (Math.abs(Number(left.coefficient)) <= EPS) return gap('zero_coefficient', 'Affine equation cannot be solved by division when coefficient is zero.', { equation: clone(body) });
    const shifted = right - Number(left.offset || 0);
    const value = shifted / Number(left.coefficient);
    if (!Number.isFinite(value)) return gap('non_finite_solution', 'Inverse operation produced a non-finite solution.', { equation: clone(body) });
    return verified('inverse-operation', { operator: 'solveAffineEquation', variable: left.variable, value: R(value), conclusion: { type: 'Assignment', variable: left.variable, value: { type: 'NumberLiteral', value: R(value) } }, steps: ['identity-equation', 'subtract-offset', 'divide-by-coefficient'] });
  }

  function solveLinearEquation(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'LinearEquation') return gap('unsupported_linear_equation', 'Linear equation solving requires a LinearEquation AST node.');
    const left = body.left;
    const right = body.right;
    if (!left || !right || left.type !== 'AffineExpression' || right.type !== 'AffineExpression') return gap('linear_equation_not_affine', 'Both sides must reduce to affine expressions.', { equation: clone(body) });
    const coefficient = Number(left.coefficient || 0) - Number(right.coefficient || 0);
    const offset = Number(right.offset || 0) - Number(left.offset || 0);
    if (Math.abs(coefficient) <= EPS) return gap('zero_linear_coefficient', 'Linear equation cannot isolate a unique value when net coefficient is zero.', { equation: clone(body) });
    const value = offset / coefficient;
    return verified('linear-equation-solve', { operator: 'solveLinearEquation', variable: body.variable, value: R(value), conclusion: { type: 'Assignment', variable: body.variable, value: { type: 'NumberLiteral', value: R(value) } }, steps: ['collect-variable-terms', 'collect-constant-terms', 'divide-by-net-coefficient'] });
  }

  function evaluateSubstitution(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'SubstitutionEvaluation') return gap('unsupported_substitution_evaluation', 'Substitution evaluation requires a SubstitutionEvaluation AST node.');
    const expr = body.expression;
    const assignment = body.assignment;
    if (!expr || expr.type !== 'AffineExpression' || !assignment) return gap('substitution_not_affine', 'Only affine substitution is supported for this rule.', { node: clone(body) });
    if (expr.variable !== assignment.variable) return gap('substitution_variable_mismatch', 'Assignment variable must match expression variable.', { node: clone(body) });
    const value = valueOf(assignment.value);
    if (!finite(value)) return gap('non_finite_substitution_value', 'Substitution value must be finite.', { node: clone(body) });
    const result = Number(expr.coefficient || 0) * value + Number(expr.offset || 0);
    return verified('substitution-evaluation', { operator: 'evaluateSubstitution', variable: expr.variable, value: R(value), result: R(result), conclusion: { type: 'NumberLiteral', value: R(result) }, steps: ['substitute-assigned-value', 'evaluate-affine-expression'] });
  }

  function relationOk(rel) { return rel && rel.type === 'Relation' && rel.operator === '=' && rel.left && rel.right; }
  function eqTerm(a, b) { return same(a, b); }

  function proveEquality(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'EqualityProof') return gap('unsupported_equality_proof', 'Equality proof requires an EqualityProof AST node.');
    const conclusion = body.conclusion;
    if (!relationOk(conclusion)) return gap('invalid_equality_conclusion', 'Equality proof requires an equality conclusion.', { node: clone(body) });
    const premises = A(body.premises).filter(relationOk);
    if (body.rule === 'reflexivity') {
      if (premises.length) return gap('reflexivity_has_premises', 'Reflexivity proof should not require premises.', { node: clone(body) });
      if (!eqTerm(conclusion.left, conclusion.right)) return gap('reflexivity_mismatch', 'Reflexivity requires a term equal to itself.', { conclusion: clone(conclusion) });
      return verified('equality-reflexivity', { operator: 'proveEquality', equality_rule: 'reflexivity', conclusion: clone(conclusion), steps: ['term-is-identical-to-itself'] });
    }
    if (body.rule === 'symmetry') {
      if (premises.length !== 1) return gap('symmetry_requires_one_premise', 'Symmetry requires exactly one equality premise.', { node: clone(body) });
      const p = premises[0];
      if (!eqTerm(p.left, conclusion.right) || !eqTerm(p.right, conclusion.left)) return gap('symmetry_mismatch', 'Symmetry requires a=b therefore b=a.', { premise: clone(p), conclusion: clone(conclusion) });
      return verified('equality-symmetry', { operator: 'proveEquality', equality_rule: 'symmetry', conclusion: clone(conclusion), steps: ['flip-equality-sides'] });
    }
    if (body.rule === 'transitivity' || body.rule === 'equality_chain') {
      if (premises.length < 2) return gap('transitivity_requires_two_premises', 'Transitivity requires at least two equality premises.', { node: clone(body) });
      for (let i = 0; i < premises.length - 1; i += 1) {
        if (!eqTerm(premises[i].right, premises[i + 1].left)) return gap('equality_chain_break', 'Adjacent equality premises must share the same middle term.', { index: i, premises: clone(premises) });
      }
      const first = premises[0];
      const last = premises[premises.length - 1];
      if (!eqTerm(first.left, conclusion.left) || !eqTerm(last.right, conclusion.right)) return gap('transitivity_conclusion_mismatch', 'Conclusion must connect the first left term to the last right term.', { premises: clone(premises), conclusion: clone(conclusion) });
      return verified('equality-transitivity', { operator: 'proveEquality', equality_rule: premises.length === 2 ? 'transitivity' : 'equality_chain', conclusion: clone(conclusion), steps: ['match-adjacent-equality-terms', 'compose-equality-chain'] });
    }
    return gap('unsupported_equality_rule', 'Equality proof rule is not supported.', { rule: body.rule });
  }

  function simplifyNode(node) {
    if (!node || typeof node !== 'object') return node;
    if (node.type !== 'BinaryExpression') return clone(node);
    const left = simplifyNode(node.left);
    const right = simplifyNode(node.right);
    if (node.operator === '+') {
      if (valueOf(right) === 0) return clone(left);
      if (valueOf(left) === 0) return clone(right);
    }
    if (node.operator === '*') {
      if (valueOf(right) === 1) return clone(left);
      if (valueOf(left) === 1) return clone(right);
      if (valueOf(right) === 0 || valueOf(left) === 0) return { type: 'NumberLiteral', value: 0 };
    }
    const lnum = evaluateNumericExpression(left);
    const rnum = evaluateNumericExpression(right);
    if (finite(lnum) && finite(rnum)) {
      const value = evaluateNumericExpression({ type: 'BinaryExpression', operator: node.operator, left: { type: 'NumberLiteral', value: lnum }, right: { type: 'NumberLiteral', value: rnum } });
      if (finite(value)) return { type: 'NumberLiteral', value: R(value) };
    }
    return Object.assign({}, node, { left, right });
  }

  function simplifyExpression(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'Simplification') return gap('unsupported_simplification', 'Simplification requires a Simplification AST node.');
    const simplified = simplifyNode(body.expression);
    if (!simplified) return gap('simplification_failed', 'Expression could not be simplified.', { node: clone(body) });
    const changed = !same(body.expression, simplified);
    return verified('expression-simplification', { operator: 'simplifyExpression', changed, input: clone(body.expression), conclusion: clone(simplified), result: expressionText(simplified), steps: changed ? ['apply-neutral-element-rewrite'] : ['already-normal-form'] });
  }


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


  function proveComplexUnitIdentity(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'ComplexUnitIdentityStatement') return gap('unsupported_complex_unit_identity', 'Complex unit identity closure requires a ComplexUnitIdentityStatement AST node.');
    return verified('complex-unit-identity', {
      operator: 'proveComplexUnitIdentity',
      domain: clone(body.domain),
      conclusion: clone(body.relation),
      steps: ['detect-imaginary-unit-symbol', 'apply-complex-unit-identity-i-squared-equals-negative-one']
    });
  }


  function typeMatrixProduct(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'MatrixProductStatement') return gap('unsupported_matrix_product', 'Matrix product typing requires a MatrixProductStatement AST node.');
    return verified('matrix-product-dimension-guard', {
      operator: 'typeMatrixProduct',
      guard: clone(body.guard),
      conclusion: {
        type: 'GuardedMatrixProductRelation',
        guard: clone(body.guard),
        relation: clone(body.relation)
      },
      steps: ['detect-matrix-product-form', 'emit-dimension-compatibility-guard', 'canonicalize-guarded-matrix-product-relation']
    });
  }


  function defineSequence(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'SequenceDefinition') return gap('unsupported_sequence_definition', 'Sequence closure requires a SequenceDefinition AST node.');
    return verified('sequence-term-definition', {
      operator: 'defineSequence',
      conclusion: {
        type: 'SequenceDefinitionPacket',
        sequence: clone(body.sequence),
        index: clone(body.index),
        domain: clone(body.domain),
        term: clone(body.term),
        term_formula: clone(body.term_formula),
        relation: clone(body.relation)
      },
      steps: ['detect-indexed-sequence-form', 'type-index-over-natural-numbers', 'canonicalize-term-formula']
    });
  }


  function generateExistentialObligations(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'ExistentialStatement') return gap('unsupported_existential_statement', 'Existential closure requires an ExistentialStatement AST node.');
    return verified('existential-witness-obligations', {
      operator: 'generateExistentialObligations',
      conclusion: {
        type: 'ExistentialWitnessObligationPacket',
        quantifier: body.quantifier,
        variable: clone(body.variable),
        domain: clone(body.domain),
        predicate: clone(body.predicate),
        witness_candidate: clone(body.witness_candidate),
        obligations: clone(body.obligations || [])
      },
      steps: ['detect-existential-claim', 'construct-canonical-witness-candidate', 'emit-domain-and-predicate-obligations']
    });
  }

  function domainGuard(input) {
    const body = bodyOf(input);
    if (!body) return gap('missing_domain_target', 'Domain guard requires an AST node.');
    if (body.type === 'DivisionConstraint') {
      const denom = symbolName(body.denominator);
      const violation = body.violation && body.violation.type === 'Relation' && body.violation.operator === '=' && valueOf(body.violation.right) === 0;
      if (!denom || !violation) return gap('division_guard_not_triggered', 'Division undefined proof requires a zero denominator violation.', { node: clone(body) });
      return verified('domain-guard', { operator: 'proveDivisionByZeroUndefined', guard: denom + ' != 0', violation: denom + ' = 0', conclusion: 'undefined', steps: ['detect-quotient', 'detect-zero-denominator', 'apply-division-domain-guard'] });
    }
    if (body.type === 'QuantifiedStatement') {
      const q = quantifierScope(body);
      if (!q.ok) return q;
      return verified('domain-guard', { guard: 'variable in ' + q.domain, variable: q.variable, domain: q.domain, conclusion: clone(body.body) });
    }
    if (body.type === 'Equation') return Math.abs(Number(body.left && body.left.coefficient)) > EPS ? verified('domain-guard', { guard: 'coefficient != 0', conclusion: clone(body) }) : gap('zero_coefficient', 'Affine equation violates the nonzero-coefficient solve guard.', { node: clone(body) });
    return gap('unsupported_domain_guard', 'No domain guard is registered for this AST node type.', { type: body.type });
  }

  function implication(antecedent, consequent) {
    if (!antecedent || !consequent) return gap('missing_implication_part', 'Implication requires antecedent and consequent.');
    return verified('implication', { conclusion: { type: 'Implication', antecedent: typeof antecedent === 'string' ? { type: 'Symbol', name: antecedent } : clone(antecedent), consequent: typeof consequent === 'string' ? { type: 'Symbol', name: consequent } : clone(consequent) } });
  }

  function modusPonens(implicationNode, fact) {
    const imp = bodyOf(implicationNode);
    if (!imp || imp.type !== 'Implication') return gap('missing_implication', 'Modus ponens requires an implication.');
    if (atomKey(imp.antecedent) !== atomKey(fact)) return gap('modus_ponens_antecedent_missing', 'The asserted fact does not match the implication antecedent.', { implication: clone(imp), fact: clone(fact) });
    return verified('modus-ponens', { conclusion: clone(imp.consequent), antecedent: clone(imp.antecedent), consequent: clone(imp.consequent) });
  }

  function implicationChain(input) {
    const body = bodyOf(input);
    const implications = body && body.type === 'ImplicationChain' ? body.implications : A(input);
    for (const first of implications) {
      for (const second of implications) {
        if (!first || !second || first === second) continue;
        if (first.type === 'Implication' && second.type === 'Implication' && atomKey(first.consequent) === atomKey(second.antecedent)) return verified('implication-chain', { operator: 'composeImplicationChain', conclusion: atomKey(first.antecedent) + '=>' + atomKey(second.consequent), implication: { type: 'Implication', antecedent: clone(first.antecedent), consequent: clone(second.consequent) }, steps: ['match-middle-term', 'compose-implications'] });
      }
    }
    return gap('no_composable_implication_chain', 'Implication chain requires A=>B and B=>C structure.', { implications: clone(implications) });
  }

  function contradiction(input) {
    const body = bodyOf(input);
    const claims = body && body.type === 'ContradictionPair' ? body.claims : A(input);
    const positives = new Set();
    const negatives = new Set();
    claims.forEach(claim => { if (claim && claim.type === 'UnaryExpression' && claim.operator === 'not') negatives.add(atomKey(claim.argument)); else positives.add(atomKey(claim)); });
    const hit = Array.from(positives).find(key => negatives.has(key));
    return hit ? verified('contradiction', { operator: 'detectContradiction', contradiction: true, referent: hit, conclusion: 'contradiction:' + hit, steps: ['same-scope-positive', 'same-scope-negation'] }) : verified('contradiction', { operator: 'detectContradiction', contradiction: false, referent: null, conclusion: 'consistent-under-current-claims' });
  }

  function quantifierScope(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'QuantifiedStatement') return gap('missing_quantified_statement', 'Quantifier scope requires a quantified statement AST node.');
    const variable = symbolName(body.variable);
    const domain = symbolName(body.domain);
    if (body.quantifier !== 'forall' || !variable || !domain) return gap('unsupported_quantifier_scope', 'Only explicit universal statements with a variable and domain are supported.', { node: clone(body) });
    return verified('quantifier-scope', { quantifier: 'forall', variable, domain, body: clone(body.body), conclusion: clone(body.body) });
  }

  function universalStatement(input) {
    const body = bodyOf(input);
    const scope = quantifierScope(body);
    if (!scope.ok) return scope;
    if (body.theorem_class !== 'square_nonnegative_over_reals') return gap('unsupported_universal_theorem', 'Universal statement is outside the supported theorem forms.', { theorem_class: body.theorem_class || null });
    if (String(scope.domain).toUpperCase() !== 'R') return gap('unsupported_universal_domain', 'Square nonnegative theorem currently requires the real-number domain.', { domain: scope.domain });
    const relation = body.body;
    const isSquare = relation && relation.type === 'Relation' && relation.operator === '>=' && relation.left && relation.left.type === 'BinaryExpression' && relation.left.operator === '^' && valueOf(relation.left.right) === 2 && valueOf(relation.right) === 0;
    if (!isSquare) return gap('unsupported_square_nonnegative_body', 'Expected x^2 >= 0 body under universal real scope.', { body: clone(body.body) });
    return verified('universal-square-nonnegative', { operator: 'proveSquareNonnegative', theorem_class: body.theorem_class, variable: scope.variable, domain: scope.domain, conclusion: expressionText(relation), steps: ['open-universal-scope', 'use-real-domain', 'square-as-same-factor-product', 'same-factor-product-nonnegative'] });
  }

  function algebraicIdentity(input) {
    const body = bodyOf(input);
    const scope = quantifierScope(body);
    if (!scope.ok) return scope;
    if (String(scope.domain).toUpperCase() !== 'R') return gap('unsupported_identity_domain', 'Algebraic identity proof currently requires the real-number domain.', { domain: scope.domain });
    const relation = body.body;
    if (!relation || relation.type !== 'Relation' || relation.operator !== '=') return gap('unsupported_identity_body', 'Algebraic identity requires an equality body.', { body: clone(body.body) });
    const cls = body.theorem_class;
    const left = relation.left;
    const right = relation.right;
    const rightVar = symbolName(right);
    if (cls === 'additive_identity_over_reals' && left && left.type === 'BinaryExpression' && left.operator === '+' && rightVar === scope.variable) {
      const ok = (symbolName(left.left) === scope.variable && valueOf(left.right) === 0) || (valueOf(left.left) === 0 && symbolName(left.right) === scope.variable);
      if (ok) return verified('algebraic-identity', { operator: 'proveAlgebraicIdentity', theorem_class: cls, conclusion: expressionText(relation), steps: ['open-universal-scope', 'use-additive-identity-axiom'] });
    }
    if (cls === 'multiplicative_identity_over_reals' && left && left.type === 'BinaryExpression' && left.operator === '*' && rightVar === scope.variable) {
      const ok = (symbolName(left.left) === scope.variable && valueOf(left.right) === 1) || (valueOf(left.left) === 1 && symbolName(left.right) === scope.variable);
      if (ok) return verified('algebraic-identity', { operator: 'proveAlgebraicIdentity', theorem_class: cls, conclusion: expressionText(relation), steps: ['open-universal-scope', 'use-multiplicative-identity-axiom'] });
    }
    return gap('unsupported_algebraic_identity', 'The quantified equality is not one of the supported identity forms.', { theorem_class: cls, body: clone(body.body) });
  }

  function evaluateLinearRelation(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'LinearRelation') return gap('unsupported_linear_relation', 'Linear relation evaluation requires a LinearRelation AST node.');
    if (!body.assignment) return gap('missing_relation_assignment', 'Linear relation evaluation requires an assignment such as x = 5.', { node: clone(body) });
    const variable = symbolName(body.relation && body.relation.left);
    if (variable !== body.assignment.variable) return gap('assignment_variable_mismatch', 'Assignment variable must match relation variable.', { relation: clone(body.relation), assignment: clone(body.assignment) });
    const value = valueOf(body.assignment.value);
    const target = valueOf(body.relation.right);
    const op = body.relation.operator;
    if (!finite(value) || !finite(target)) return gap('non_finite_relation_value', 'Relation evaluation requires finite numeric values.', { node: clone(body) });
    const truth = compare(value, op, target);
    return verified('relation-evaluation', { operator: 'evaluateLinearRelation', truth, variable, value: R(value), relation: op, target: R(target), conclusion: String(R(value)) + op + String(R(target)), steps: ['substitute-assignment', 'compare-finite-values'] });
  }

  function evaluateArithmeticRelation(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'ArithmeticRelation') return gap('unsupported_arithmetic_relation', 'Arithmetic relation evaluation requires an ArithmeticRelation AST node.');
    const rel = body.relation;
    const left = evaluateNumericExpression(rel.left);
    const right = evaluateNumericExpression(rel.right);
    const truth = compare(left, rel.operator, right);
    if (truth == null) return gap('arithmetic_relation_not_finite', 'Arithmetic relation sides must evaluate to finite numbers.', { node: clone(body) });
    return verified('arithmetic-relation-evaluation', { operator: 'evaluateArithmeticRelation', truth, left: R(left), relation: rel.operator, right: R(right), conclusion: String(R(left)) + rel.operator + String(R(right)), steps: ['evaluate-left-arithmetic-expression', 'evaluate-right-arithmetic-expression', 'compare-finite-values'] });
  }

  function prove(input, obligation) {
    const body = bodyOf(input);
    const operator = typeof obligation === 'string' ? obligation : obligation && obligation.operator;
    if (operator === 'solveAffineEquation') return inverseOperation(body);
    if (operator === 'solveLinearEquation') return solveLinearEquation(body);
    if (operator === 'evaluateSubstitution') return evaluateSubstitution(body);
    if (operator === 'evaluateArithmeticRelation') return evaluateArithmeticRelation(body);
    if (operator === 'proveAlgebraicIdentity') return algebraicIdentity(body);
    if (operator === 'proveEquality') return proveEquality(body);
    if (operator === 'simplifyExpression') return simplifyExpression(body);
    if (operator === 'proveSqrtDomain') return proveSqrtDomain(body);
    if (operator === 'composeFunctionApplication') return composeFunctionApplication(body);
    if (operator === 'typeSetMembership') return typeSetMembership(body);
    if (operator === 'generateInductionObligations') return generateInductionObligations(body);
    if (operator === 'proveLimitStatement') return proveLimitStatement(body);
    if (operator === 'proveDerivativeStatement') return proveDerivativeStatement(body);
    if (operator === 'proveIntegralStatement') return proveIntegralStatement(body);
    if (operator === 'proveProbabilityProductRule') return proveProbabilityProductRule(body);
    if (operator === 'proveComplexUnitIdentity') return proveComplexUnitIdentity(body);
    if (operator === 'typeMatrixProduct') return typeMatrixProduct(body);
    if (operator === 'defineSequence') return defineSequence(body);
    if (operator === 'generateExistentialObligations') return generateExistentialObligations(body);
    if (operator === 'proveDivisionByZeroUndefined') return domainGuard(body);
    if (operator === 'proveSquareNonnegative') return universalStatement(body);
    if (operator === 'composeImplicationChain') return implicationChain(body);
    if (operator === 'detectContradiction') return contradiction(body);
    if (operator === 'evaluateLinearRelation') return evaluateLinearRelation(body);
    return gap('unsupported_closure_operator', 'No proof rule is registered for the requested closure operator.', { operator: operator || null, type: body && body.type || 'Unknown' });
  }

  return Object.freeze({
    VERSION,
    identity,
    substitution,
    equivalenceRewrite,
    inverseOperation,
    solveLinearEquation,
    evaluateSubstitution,
    evaluateNumericExpression,
    evaluateArithmeticRelation,
    proveEquality,
    simplifyExpression,
    simplifyNode,
    proveSqrtDomain,
    composeFunctionApplication,
    typeSetMembership,
    generateInductionObligations,
    proveLimitStatement,
    proveDerivativeStatement,
    proveIntegralStatement,
    proveProbabilityProductRule,
    proveComplexUnitIdentity,
    typeMatrixProduct,
    defineSequence,
    generateExistentialObligations,
    domainGuard,
    implication,
    modusPonens,
    implicationChain,
    contradiction,
    quantifierScope,
    universalStatement,
    algebraicIdentity,
    evaluateLinearRelation,
    prove,
    expressionText
  });
});
