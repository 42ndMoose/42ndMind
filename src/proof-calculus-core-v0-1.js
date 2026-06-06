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
    if (node.type === 'AffineExpression') return String(node.coefficient) + '*' + node.variable + (node.offset < 0 ? String(node.offset) : '+' + String(node.offset));
    if (node.type === 'Relation') return expressionText(node.left) + node.operator + expressionText(node.right);
    return JSON.stringify(node);
  }

  function valueOf(node) {
    if (node && node.type === 'NumberLiteral') return Number(node.value);
    if (finite(node)) return Number(node);
    return NaN;
  }

  function identity(left, right) {
    if (arguments.length === 1) return verified('identity', { conclusion: clone(left), left: clone(left), right: clone(left) });
    return same(left, right)
      ? verified('identity', { conclusion: clone(right), left: clone(left), right: clone(right) })
      : gap('identity_mismatch', 'Identity requires both sides to be canonically identical.', { left: clone(left), right: clone(right) });
  }

  function substituteNode(node, assignments) {
    if (!node || typeof node !== 'object') return node;
    if (node.type === 'Symbol' && Object.prototype.hasOwnProperty.call(assignments, node.name)) {
      return { type: 'NumberLiteral', value: R(assignments[node.name]) };
    }
    if (node.type === 'BinaryExpression') return Object.assign({}, node, { left: substituteNode(node.left, assignments), right: substituteNode(node.right, assignments) });
    if (node.type === 'UnaryExpression') return Object.assign({}, node, { argument: substituteNode(node.argument, assignments) });
    if (node.type === 'Relation') return Object.assign({}, node, { left: substituteNode(node.left, assignments), right: substituteNode(node.right, assignments) });
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
    return verified('inverse-operation', {
      operator: 'solveAffineEquation',
      variable: left.variable,
      value: R(value),
      conclusion: { type: 'Assignment', variable: left.variable, value: { type: 'NumberLiteral', value: R(value) } },
      steps: ['identity-equation', 'subtract-offset', 'divide-by-coefficient']
    });
  }

  function domainGuard(input) {
    const body = bodyOf(input);
    if (!body) return gap('missing_domain_target', 'Domain guard requires an AST node.');
    if (body.type === 'DivisionConstraint') {
      const denom = symbolName(body.denominator);
      const violation = body.violation && body.violation.type === 'Relation' && body.violation.operator === '=' && valueOf(body.violation.right) === 0;
      if (!denom || !violation) return gap('division_guard_not_triggered', 'Division undefined proof requires a zero denominator violation.', { node: clone(body) });
      return verified('domain-guard', {
        operator: 'proveDivisionByZeroUndefined',
        guard: denom + ' != 0',
        violation: denom + ' = 0',
        conclusion: 'undefined',
        steps: ['detect-quotient', 'detect-zero-denominator', 'apply-division-domain-guard']
      });
    }
    if (body.type === 'QuantifiedStatement') {
      const q = quantifierScope(body);
      if (!q.ok) return q;
      return verified('domain-guard', { guard: 'variable in ' + q.domain, variable: q.variable, domain: q.domain, conclusion: clone(body.body) });
    }
    if (body.type === 'Equation') return Math.abs(Number(body.left && body.left.coefficient)) > EPS
      ? verified('domain-guard', { guard: 'coefficient != 0', conclusion: clone(body) })
      : gap('zero_coefficient', 'Affine equation violates the nonzero-coefficient solve guard.', { node: clone(body) });
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
        if (first.type === 'Implication' && second.type === 'Implication' && atomKey(first.consequent) === atomKey(second.antecedent)) {
          return verified('implication-chain', {
            operator: 'composeImplicationChain',
            conclusion: atomKey(first.antecedent) + '=>' + atomKey(second.consequent),
            implication: { type: 'Implication', antecedent: clone(first.antecedent), consequent: clone(second.consequent) },
            steps: ['match-middle-term', 'compose-implications']
          });
        }
      }
    }
    return gap('no_composable_implication_chain', 'Implication chain requires A=>B and B=>C structure.', { implications: clone(implications) });
  }

  function contradiction(input) {
    const body = bodyOf(input);
    const claims = body && body.type === 'ContradictionPair' ? body.claims : A(input);
    const positives = new Set();
    const negatives = new Set();
    claims.forEach(claim => {
      if (claim && claim.type === 'UnaryExpression' && claim.operator === 'not') negatives.add(atomKey(claim.argument));
      else positives.add(atomKey(claim));
    });
    const hit = Array.from(positives).find(key => negatives.has(key));
    return hit
      ? verified('contradiction', { operator: 'detectContradiction', contradiction: true, referent: hit, conclusion: 'contradiction:' + hit, steps: ['same-scope-positive', 'same-scope-negation'] })
      : verified('contradiction', { operator: 'detectContradiction', contradiction: false, referent: null, conclusion: 'consistent-under-current-claims' });
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
    return verified('universal-square-nonnegative', {
      operator: 'proveSquareNonnegative',
      theorem_class: body.theorem_class,
      variable: scope.variable,
      domain: scope.domain,
      conclusion: expressionText(relation),
      steps: ['open-universal-scope', 'use-real-domain', 'square-as-same-factor-product', 'same-factor-product-nonnegative']
    });
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
    const truth = op === '>=' ? value >= target : op === '<=' ? value <= target : op === '>' ? value > target : op === '<' ? value < target : value === target;
    return verified('relation-evaluation', { operator: 'evaluateLinearRelation', truth, variable, value: R(value), relation: op, target: R(target), conclusion: String(R(value)) + op + String(R(target)), steps: ['substitute-assignment', 'compare-finite-values'] });
  }

  function prove(input, obligation) {
    const body = bodyOf(input);
    const operator = typeof obligation === 'string' ? obligation : obligation && obligation.operator;
    if (operator === 'solveAffineEquation') return inverseOperation(body);
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
    domainGuard,
    implication,
    modusPonens,
    implicationChain,
    contradiction,
    quantifierScope,
    universalStatement,
    evaluateLinearRelation,
    prove,
    expressionText
  });
});
