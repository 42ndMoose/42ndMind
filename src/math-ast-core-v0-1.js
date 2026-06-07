(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathAstCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';

  function R(value) { return Number((Number(value) || 0).toFixed(12)); }
  function node(type, data) { return Object.assign({ type }, data || {}); }
  function numberLiteral(value) { return node('NumberLiteral', { value: R(value) }); }
  function symbol(name) { return node('Symbol', { name: String(name || '').trim() }); }
  function unary(op, argument) { return node('UnaryExpression', { operator: op, argument }); }
  function binary(op, left, right) { return node('BinaryExpression', { operator: op, left, right }); }
  function relation(op, left, right) { return node('Relation', { operator: op, left, right }); }

  function normalize(input) {
    return String(input == null ? '' : input)
      .replace(/⇒/g, '=>')
      .replace(/⟹/g, '=>')
      .replace(/≥/g, '>=')
      .replace(/≤/g, '<=')
      .replace(/∈/g, ' in ')
      .replace(/ℝ/g, 'R')
      .replace(/²/g, '^2')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/⊢/g, ' therefore ')
      .replace(/∴/g, ' therefore ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compact(input) { return normalize(input).replace(/\s+/g, ''); }
  function hasLetter(text) { return /[a-zA-Z]/.test(String(text || '')); }

  function parseAffineExpression(input) {
    const text = compact(input);
    const m = /^([+-]?\d+(?:\.\d+)?)?([a-zA-Z])(?:(\+|-)(\d+(?:\.\d+)?))?$/.exec(text);
    if (!m) return null;
    const coefficient = m[1] === undefined || m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const variable = m[2];
    const sign = m[3] || '+';
    const magnitude = m[4] === undefined ? 0 : Number(m[4]);
    const offset = sign === '-' ? -Math.abs(magnitude) : magnitude;
    const product = coefficient === 1 ? symbol(variable) : binary('*', numberLiteral(coefficient), symbol(variable));
    if (offset === 0) return node('AffineExpression', { coefficient: R(coefficient), variable, offset: 0, expression: product });
    return node('AffineExpression', { coefficient: R(coefficient), variable, offset: R(offset), expression: binary(offset < 0 ? '-' : '+', product, numberLiteral(Math.abs(offset))) });
  }

  function parseAffineSide(input) {
    const affine = parseAffineExpression(input);
    if (affine) return affine;
    const text = compact(input);
    if (/^[+-]?\d+(?:\.\d+)?$/.test(text)) return node('AffineExpression', { coefficient: 0, variable: null, offset: R(Number(text)), expression: numberLiteral(Number(text)) });
    return null;
  }

  function tokenizeArithmetic(input) {
    const text = compact(input);
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      const prev = tokens[tokens.length - 1];
      const unaryMinus = ch === '-' && (!prev || prev.type === 'op' || prev.value === '(');
      if (/\d|\./.test(ch) || unaryMinus) {
        let j = i + (unaryMinus ? 1 : 0);
        while (j < text.length && /\d|\./.test(text[j])) j += 1;
        const raw = text.slice(i, j);
        if (!/^-?\d+(?:\.\d+)?$/.test(raw)) return null;
        tokens.push({ type: 'number', value: Number(raw) });
        i = j;
        continue;
      }
      if ('+-*/^'.includes(ch)) { tokens.push({ type: 'op', value: ch }); i += 1; continue; }
      if (ch === '(' || ch === ')') { tokens.push({ type: 'paren', value: ch }); i += 1; continue; }
      return null;
    }
    return tokens;
  }

  function parseArithmeticExpression(input) {
    const tokens = tokenizeArithmetic(input);
    if (!tokens || !tokens.length) return null;
    let pos = 0;
    function peek() { return tokens[pos]; }
    function take() { return tokens[pos++]; }
    function primary() {
      const t = take();
      if (!t) return null;
      if (t.type === 'number') return numberLiteral(t.value);
      if (t.value === '(') {
        const e = additive();
        const close = take();
        if (!e || !close || close.value !== ')') return null;
        return e;
      }
      return null;
    }
    function power() {
      let left = primary();
      if (!left) return null;
      if (peek() && peek().value === '^') { take(); const right = power(); if (!right) return null; left = binary('^', left, right); }
      return left;
    }
    function multiplicative() {
      let left = power();
      while (peek() && (peek().value === '*' || peek().value === '/')) { const op = take().value; const right = power(); if (!right) return null; left = binary(op, left, right); }
      return left;
    }
    function additive() {
      let left = multiplicative();
      while (peek() && (peek().value === '+' || peek().value === '-')) { const op = take().value; const right = multiplicative(); if (!right) return null; left = binary(op, right ? left : left, right); }
      return left;
    }
    const ast = additive();
    return ast && pos === tokens.length ? ast : null;
  }

  function parseSymbolicExpression(input) {
    const text = compact(input);
    if (/^[A-Za-z][A-Za-z0-9_]*$/.test(text)) return symbol(text);
    if (/^-?\d+(?:\.\d+)?$/.test(text)) return numberLiteral(Number(text));
    let m = /^([A-Za-z][A-Za-z0-9_]*)(\+|\*)((-?\d+(?:\.\d+)?))$/.exec(text);
    if (m) return binary(m[2], symbol(m[1]), numberLiteral(Number(m[3])));
    m = /^((-?\d+(?:\.\d+)?))(\+|\*)([A-Za-z][A-Za-z0-9_]*)$/.exec(text);
    if (m) return binary(m[3], numberLiteral(Number(m[1])), symbol(m[4]));
    return parseArithmeticExpression(text);
  }

  function termKey(term) { return JSON.stringify(term); }

  function parseEqualityRelation(input) {
    const text = normalize(input);
    const m = /^(.+?)=(.+)$/.exec(text.replace(/\s+/g, ''));
    if (!m) return null;
    const left = parseSymbolicExpression(m[1]);
    const right = parseSymbolicExpression(m[2]);
    if (!left || !right) return null;
    return relation('=', left, right);
  }

  function parseEqualityProof(input) {
    const text = normalize(input);
    const parts = text.split(/\s+therefore\s+/i);
    if (parts.length === 1) {
      const conclusion = parseEqualityRelation(parts[0]);
      if (!conclusion || termKey(conclusion.left) !== termKey(conclusion.right)) return null;
      return node('EqualityProof', { rule: 'reflexivity', premises: [], conclusion });
    }
    if (parts.length !== 2) return null;
    const premises = parts[0].split(/,| and /i).map(parseEqualityRelation).filter(Boolean);
    const conclusion = parseEqualityRelation(parts[1]);
    if (!premises.length || !conclusion) return null;
    if (premises.length === 1) return node('EqualityProof', { rule: 'symmetry', premises, conclusion });
    if (premises.length === 2) return node('EqualityProof', { rule: 'transitivity', premises, conclusion });
    return node('EqualityProof', { rule: 'equality_chain', premises, conclusion });
  }

  function parseSimplification(input) {
    const text = normalize(input);
    const m = /^simplify\s+(.+)$/i.exec(text);
    if (!m) return null;
    const expression = parseSymbolicExpression(m[1]);
    if (!expression) return null;
    return node('Simplification', { expression });
  }


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

  function parseArithmeticRelation(input) {
    const text = compact(input);
    if (hasLetter(text)) return null;
    const m = /^(.+?)(>=|<=|=|>|<)(.+)$/.exec(text);
    if (!m) return null;
    const left = parseArithmeticExpression(m[1]);
    const right = parseArithmeticExpression(m[3]);
    if (!left || !right) return null;
    return node('ArithmeticRelation', { relation: relation(m[2], left, right) });
  }

  function parseEquation(input) {
    const text = compact(input);
    if (/(>=|<=|>|<|with)/i.test(text)) return null;
    const m = /^(.+)=(-?\d+(?:\.\d+)?)$/.exec(text);
    if (!m || !hasLetter(m[1])) return null;
    const left = parseAffineExpression(m[1]);
    if (!left) return null;
    return node('Equation', { left, right: numberLiteral(Number(m[2])), relation: '=' });
  }

  function parseLinearEquation(input) {
    const text = compact(input);
    if (/(>=|<=|>|<|with)/i.test(text)) return null;
    const m = /^(.+)=(.+)$/.exec(text);
    if (!m || !hasLetter(text)) return null;
    const left = parseAffineSide(m[1]);
    const right = parseAffineSide(m[2]);
    if (!left || !right) return null;
    const variable = left.variable || right.variable;
    if (!variable) return null;
    if ((left.variable && left.variable !== variable) || (right.variable && right.variable !== variable)) return null;
    return node('LinearEquation', { left, right, variable, relation: '=' });
  }

  function parseSubstitutionEvaluation(input) {
    const text = compact(input);
    const m = /^(.+)with([a-zA-Z])=(-?\d+(?:\.\d+)?)$/.exec(text);
    if (!m) return null;
    const expression = parseAffineExpression(m[1]);
    if (!expression || expression.variable !== m[2]) return null;
    return node('SubstitutionEvaluation', { expression, assignment: node('Assignment', { variable: m[2], value: numberLiteral(Number(m[3])) }) });
  }

  function parseLinearRelation(input) {
    const text = compact(input);
    const m = /^([a-zA-Z])(>=|<=|>|<|=)(-?\d+(?:\.\d+)?)(?:with\1=(-?\d+(?:\.\d+)?))?$/.exec(text);
    if (!m) return null;
    return node('LinearRelation', { relation: relation(m[2], symbol(m[1]), numberLiteral(Number(m[3]))), assignment: m[4] === undefined ? null : node('Assignment', { variable: m[1], value: numberLiteral(Number(m[4])) }) });
  }

  function parseDivisionConstraint(input) {
    const raw = compact(input);
    const m = /^([a-zA-Z])\/([a-zA-Z])isundefinedwhen\2=0$/i.exec(raw);
    if (!m) return null;
    return node('DivisionConstraint', { expression: binary('/', symbol(m[1]), symbol(m[2])), denominator: symbol(m[2]), violation: relation('=', symbol(m[2]), numberLiteral(0)), result: node('Undefined', {}) });
  }

  function parseSquareNonnegative(input) {
    const raw = compact(input);
    const m = /^(?:forall|∀)?([a-zA-Z])(?:inR|inreals|inreal)?[,]?\1\^2>=0$/i.exec(raw);
    if (!m) return null;
    return node('QuantifiedStatement', { quantifier: 'forall', variable: symbol(m[1]), domain: symbol('R'), body: relation('>=', binary('^', symbol(m[1]), numberLiteral(2)), numberLiteral(0)), theorem_class: 'square_nonnegative_over_reals' });
  }

  function parseAlgebraicIdentity(input) {
    const raw = compact(input);
    let m = /^(?:forall|∀)?([a-zA-Z])(?:inR|inreals|inreal)?[,]?\1\+0=\1$/i.exec(raw);
    if (m) return node('QuantifiedStatement', { quantifier: 'forall', variable: symbol(m[1]), domain: symbol('R'), body: relation('=', binary('+', symbol(m[1]), numberLiteral(0)), symbol(m[1])), theorem_class: 'additive_identity_over_reals' });
    m = /^(?:forall|∀)?([a-zA-Z])(?:inR|inreals|inreal)?[,]?0\+\1=\1$/i.exec(raw);
    if (m) return node('QuantifiedStatement', { quantifier: 'forall', variable: symbol(m[1]), domain: symbol('R'), body: relation('=', binary('+', numberLiteral(0), symbol(m[1])), symbol(m[1])), theorem_class: 'additive_identity_over_reals' });
    m = /^(?:forall|∀)?([a-zA-Z])(?:inR|inreals|inreal)?[,]?\1\*1=\1$/i.exec(raw);
    if (m) return node('QuantifiedStatement', { quantifier: 'forall', variable: symbol(m[1]), domain: symbol('R'), body: relation('=', binary('*', symbol(m[1]), numberLiteral(1)), symbol(m[1])), theorem_class: 'multiplicative_identity_over_reals' });
    m = /^(?:forall|∀)?([a-zA-Z])(?:inR|inreals|inreal)?[,]?1\*\1=\1$/i.exec(raw);
    if (m) return node('QuantifiedStatement', { quantifier: 'forall', variable: symbol(m[1]), domain: symbol('R'), body: relation('=', binary('*', numberLiteral(1), symbol(m[1])), symbol(m[1])), theorem_class: 'multiplicative_identity_over_reals' });
    return null;
  }

  function parseImplicationAtom(input) {
    const text = compact(input);
    const m = /^([A-Za-z][A-Za-z0-9_]*)(?:=>)([A-Za-z][A-Za-z0-9_]*)$/.exec(text);
    if (!m) return null;
    return node('Implication', { antecedent: symbol(m[1]), consequent: symbol(m[2]) });
  }

  function parseImplicationChain(input) {
    const rows = Array.isArray(input) ? input : normalize(input).split(/,| and /i);
    const implications = rows.map(parseImplicationAtom).filter(Boolean);
    if (implications.length < 2) return null;
    return node('ImplicationChain', { implications });
  }

  function parseClaimAtom(input) {
    const text = normalize(input);
    const neg = /^not\s+(.+)$/i.exec(text);
    if (neg) return unary('not', symbol(neg[1].trim()));
    return symbol(text);
  }

  function parseContradictionPair(input) {
    const rows = Array.isArray(input) ? input : normalize(input).split(/,| and /i);
    const claims = rows.map(parseClaimAtom).filter(x => x && (x.type === 'Symbol' || x.type === 'UnaryExpression'));
    if (claims.length < 2) return null;
    const positives = new Set(claims.filter(x => x.type === 'Symbol').map(x => x.name.toUpperCase()));
    const negatives = new Set(claims.filter(x => x.type === 'UnaryExpression' && x.operator === 'not' && x.argument.type === 'Symbol').map(x => x.argument.name.toUpperCase()));
    const hit = Array.from(positives).find(x => negatives.has(x));
    if (!hit) return null;
    return node('ContradictionPair', { claims, contradiction: true, referent: hit });
  }

  function parse(input) {
    const parsers = [
      parseSquareNonnegative,
      parseAlgebraicIdentity,
      parseEqualityProof,
      parseSimplification,
      parseSqrtDomain,
      parseFunctionComposition,
      parseSetMembership,
      parseInductionSchema,
      parseLimitStatement,
      parseDerivativeStatement,
      parseIntegralStatement,
      parseProbabilityProductStatement,
      parseDivisionConstraint,
      parseSubstitutionEvaluation,
      parseLinearRelation,
      parseEquation,
      parseLinearEquation,
      parseArithmeticRelation,
      parseImplicationChain,
      parseContradictionPair
    ];
    for (const p of parsers) {
      const ast = p(input);
      if (ast) return node('MathProgram', { body: ast, source: input, ok: true });
    }
    return node('MathProgram', { body: node('Unknown', { raw: normalize(input) }), source: input, ok: false });
  }

  function classify(astOrInput) {
    const ast = typeof astOrInput === 'string' || Array.isArray(astOrInput) ? parse(astOrInput) : astOrInput;
    const body = ast && ast.type === 'MathProgram' ? ast.body : ast;
    const type = body && body.type;
    if (type === 'QuantifiedStatement') {
      if (body.theorem_class === 'square_nonnegative_over_reals') return { ok: true, type, class: 'theorem', anatomy_id: 'square_nonnegative', closure: 'proveSquareNonnegative' };
      if (/identity_over_reals$/.test(String(body.theorem_class || ''))) return { ok: true, type, class: 'theorem', anatomy_id: 'algebraic_identity', closure: 'proveAlgebraicIdentity' };
    }
    const map = {
      Equation: { class: 'equation', anatomy_id: 'affine_equation', closure: 'solveAffineEquation' },
      LinearEquation: { class: 'equation', anatomy_id: 'linear_equation', closure: 'solveLinearEquation' },
      EqualityProof: { class: 'proof', anatomy_id: 'equality_proof', closure: 'proveEquality' },
      Simplification: { class: 'rewrite', anatomy_id: 'expression_simplification', closure: 'simplifyExpression' },
      SqrtDomainStatement: { class: 'constraint', anatomy_id: 'sqrt_domain', closure: 'proveSqrtDomain' },
      FunctionComposition: { class: 'expression', anatomy_id: 'function_composition', closure: 'composeFunctionApplication' },
      SetMembership: { class: 'relation', anatomy_id: 'set_membership', closure: 'typeSetMembership' },
      InductionSchema: { class: 'proof_schema', anatomy_id: 'induction_schema', closure: 'generateInductionObligations' },
      LimitStatement: { class: 'analysis', anatomy_id: 'limit_statement', closure: 'proveLimitStatement' },
      DerivativeStatement: { class: 'calculus', anatomy_id: 'derivative_statement', closure: 'proveDerivativeStatement' },
      IntegralStatement: { class: 'calculus', anatomy_id: 'integral_statement', closure: 'proveIntegralStatement' },
      ProbabilityProductStatement: { class: 'probability', anatomy_id: 'probability_product_rule', closure: 'proveProbabilityProductRule' },
      AffineExpression: { class: 'expression', anatomy_id: 'affine_expression', closure: 'decomposeAffineExpression' },
      SubstitutionEvaluation: { class: 'evaluation', anatomy_id: 'substitution_evaluation', closure: 'evaluateSubstitution' },
      LinearRelation: { class: 'relation', anatomy_id: 'linear_relation_truth', closure: 'evaluateLinearRelation' },
      ArithmeticRelation: { class: 'relation', anatomy_id: 'arithmetic_relation_truth', closure: 'evaluateArithmeticRelation' },
      DivisionConstraint: { class: 'constraint', anatomy_id: 'division_constraint', closure: 'proveDivisionByZeroUndefined' },
      ImplicationChain: { class: 'proof', anatomy_id: 'implication_chain', closure: 'composeImplicationChain' },
      ContradictionPair: { class: 'proof', anatomy_id: 'contradiction_pair', closure: 'detectContradiction' }
    };
    return Object.assign({ ok: !!map[type], type: type || 'Unknown' }, map[type] || { class: 'unknown', anatomy_id: null, closure: null });
  }

  function canonical(astOrInput) {
    const ast = typeof astOrInput === 'string' || Array.isArray(astOrInput) ? parse(astOrInput) : astOrInput;
    return JSON.stringify(ast, Object.keys(JSON.parse(JSON.stringify(ast))).sort());
  }

  return Object.freeze({
    VERSION, normalize, compact, node, numberLiteral, symbol, unary, binary, relation,
    parseArithmeticExpression, parseArithmeticRelation, parseSymbolicExpression, parseEqualityRelation, parseEqualityProof, parseSimplification, parseSqrtDomain, parseFunctionComposition, parseSetMembership, parseInductionSchema, parseLimitStatement, parseDerivativeStatement, parseIntegralStatement, parseProbabilityProductStatement,
    parseAffineExpression, parseEquation, parseLinearEquation, parseSubstitutionEvaluation, parseLinearRelation,
    parseDivisionConstraint, parseSquareNonnegative, parseAlgebraicIdentity,
    parseImplicationChain, parseContradictionPair, parse, classify, canonical
  });
});
