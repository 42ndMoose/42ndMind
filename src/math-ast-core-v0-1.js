(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathAstCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';

  function R(value) {
    return Number((Number(value) || 0).toFixed(12));
  }

  function normalize(input) {
    return String(input == null ? '' : input)
      .replace(/⇒/g, '=>')
      .replace(/⟹/g, '=>')
      .replace(/≥/g, '>=')
      .replace(/≤/g, '<=')
      .replace(/∈/g, ' in ')
      .replace(/ℝ/g, 'R')
      .replace(/²/g, '^2')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compact(input) {
    return normalize(input).replace(/\s+/g, '');
  }

  function node(type, data) {
    return Object.assign({ type }, data || {});
  }

  function numberLiteral(value) {
    return node('NumberLiteral', { value: R(value) });
  }

  function symbol(name) {
    return node('Symbol', { name: String(name || '').trim() });
  }

  function unary(op, argument) {
    return node('UnaryExpression', { operator: op, argument });
  }

  function binary(op, left, right) {
    return node('BinaryExpression', { operator: op, left, right });
  }

  function relation(op, left, right) {
    return node('Relation', { operator: op, left, right });
  }

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
    return node('AffineExpression', {
      coefficient: R(coefficient),
      variable,
      offset: R(offset),
      expression: binary(offset < 0 ? '-' : '+', product, numberLiteral(Math.abs(offset)))
    });
  }

  function parseEquation(input) {
    const text = compact(input);
    const m = /^(.+)=(-?\d+(?:\.\d+)?)$/.exec(text);
    if (!m) return null;
    const left = parseAffineExpression(m[1]) || symbol(m[1]);
    return node('Equation', { left, right: numberLiteral(Number(m[2])), relation: '=' });
  }

  function parseLinearRelation(input) {
    const text = compact(input);
    const m = /^([a-zA-Z])(>=|<=|>|<|=)(-?\d+(?:\.\d+)?)(?:with\1=(-?\d+(?:\.\d+)?))?$/.exec(text);
    if (!m) return null;
    return node('LinearRelation', {
      relation: relation(m[2], symbol(m[1]), numberLiteral(Number(m[3]))),
      assignment: m[4] === undefined ? null : node('Assignment', { variable: m[1], value: numberLiteral(Number(m[4])) })
    });
  }

  function parseDivisionConstraint(input) {
    const text = normalize(input);
    const raw = compact(text);
    const m = /^([a-zA-Z])\/([a-zA-Z])isundefinedwhen\2=0$/i.exec(raw);
    if (!m) return null;
    return node('DivisionConstraint', {
      expression: binary('/', symbol(m[1]), symbol(m[2])),
      denominator: symbol(m[2]),
      violation: relation('=', symbol(m[2]), numberLiteral(0)),
      result: node('Undefined', {})
    });
  }

  function parseSquareNonnegative(input) {
    const text = normalize(input);
    const raw = compact(text);
    const m = /^(?:forall|∀)?([a-zA-Z])(?:inR|inreals|inreal)?[,]?\1\^2>=0$/i.exec(raw);
    if (!m) return null;
    return node('QuantifiedStatement', {
      quantifier: 'forall',
      variable: symbol(m[1]),
      domain: symbol('R'),
      body: relation('>=', binary('^', symbol(m[1]), numberLiteral(2)), numberLiteral(0)),
      theorem_class: 'square_nonnegative_over_reals'
    });
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
      parseDivisionConstraint,
      parseEquation,
      parseLinearRelation,
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
    const map = {
      Equation: { class: 'equation', anatomy_id: 'affine_equation', closure: 'solveAffineEquation' },
      AffineExpression: { class: 'expression', anatomy_id: 'affine_expression', closure: 'decomposeAffineExpression' },
      LinearRelation: { class: 'relation', anatomy_id: 'linear_relation_truth', closure: 'evaluateLinearRelation' },
      DivisionConstraint: { class: 'constraint', anatomy_id: 'division_constraint', closure: 'proveDivisionByZeroUndefined' },
      QuantifiedStatement: { class: 'theorem', anatomy_id: 'square_nonnegative', closure: 'proveSquareNonnegative' },
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
    VERSION,
    normalize,
    compact,
    node,
    numberLiteral,
    symbol,
    unary,
    binary,
    relation,
    parseAffineExpression,
    parseEquation,
    parseLinearRelation,
    parseDivisionConstraint,
    parseSquareNonnegative,
    parseImplicationChain,
    parseContradictionPair,
    parse,
    classify,
    canonical
  });
});
