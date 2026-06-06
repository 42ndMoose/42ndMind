(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathClosureEngine = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let MathAstCore = null;
  let OperatorAnatomy = null;
  let Proof = null;
  try { if (typeof require === 'function') MathAstCore = require('./math-ast-core-v0-1.js'); } catch (_) { MathAstCore = null; }
  try { if (typeof require === 'function') OperatorAnatomy = require('./operator-anatomy-v0-1.js'); } catch (_) { OperatorAnatomy = null; }
  try { if (typeof require === 'function') Proof = require('./proof-calculus-core-v0-1.js'); } catch (_) { Proof = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function missing(id, reason, data) { return Object.assign({ ok: false, verified: false, gaps: [{ id, reason }] }, data || {}); }

  function parse(input) {
    if (input && input.type === 'MathProgram') return input;
    if (MathAstCore && typeof MathAstCore.parse === 'function') return MathAstCore.parse(input);
    return { type: 'MathProgram', ok: false, source: input, body: { type: 'Unknown', raw: String(input == null ? '' : input) } };
  }

  function classify(astOrInput) {
    if (!MathAstCore || typeof MathAstCore.classify !== 'function') return { ok: false, type: 'Unknown', class: 'unknown', anatomy_id: null, closure: null };
    return MathAstCore.classify(astOrInput);
  }

  function anatomyFor(classification) {
    const rows = OperatorAnatomy && typeof OperatorAnatomy.catalog === 'function' ? OperatorAnatomy.catalog() : [];
    return rows.find(row => row.id === classification.anatomy_id) || null;
  }

  function deriveObligation(astOrInput) {
    const ast = parse(astOrInput);
    const classification = classify(ast);
    const anatomy = anatomyFor(classification);
    if (!ast.ok || !classification.ok) {
      return missing('unclassified_math_ast', 'Input did not reduce into a supported MathProgram AST.', { ast, classification, anatomy: null, obligation: null });
    }
    if (!classification.closure) {
      return missing('missing_closure_operator', 'AST classification did not declare a closure operator.', { ast, classification, anatomy, obligation: null });
    }
    if (!anatomy) {
      return missing('missing_operator_anatomy', 'AST classification has no matching operator anatomy entry.', { ast, classification, anatomy: null, obligation: { operator: classification.closure } });
    }
    return {
      ok: true,
      ast,
      classification,
      anatomy,
      obligation: {
        operator: classification.closure,
        anatomy_id: classification.anatomy_id,
        ast_type: classification.type,
        class: classification.class,
        parts: A(anatomy.parts),
        preconditions: A(anatomy.preconditions),
        violations: A(anatomy.violations),
        inverse_chain: A(anatomy.inverse_chain),
        expected_result: anatomy.closure_result
      },
      gaps: []
    };
  }

  function close(astOrInput) {
    const derived = deriveObligation(astOrInput);
    if (!derived.ok) return Object.assign({ packet_type: '42ndMind_math_closure_v0_1', version: VERSION, stage: 'closure' }, derived, { Ξ: '' });
    if (!Proof || typeof Proof.prove !== 'function') return missing('proof_calculus_unavailable', 'Closure engine requires proof-calculus-core-v0-1.js.', derived);
    const proof = Proof.prove(derived.ast, derived.obligation);
    const gaps = proof && proof.ok ? [] : [proof && proof.gap ? proof.gap : { id: 'proof_rule_failed', reason: 'Selected proof rule did not verify the closure.' }];
    return {
      packet_type: '42ndMind_math_closure_v0_1',
      version: VERSION,
      stage: 'closure',
      ok: gaps.length === 0,
      verified: gaps.length === 0,
      ast: clone(derived.ast),
      classification: clone(derived.classification),
      anatomy: clone(derived.anatomy),
      obligation: clone(derived.obligation),
      selected_rule: proof && proof.rule || null,
      proof: clone(proof),
      result: proof && proof.ok ? clone(proof.conclusion) : null,
      result_value: proof && proof.ok && proof.value !== undefined ? proof.value : null,
      gaps,
      no_unresolved_gap: gaps.length === 0,
      Ξ: ''
    };
  }

  function complete(input) { return close(input); }

  return Object.freeze({
    VERSION,
    parse,
    classify,
    anatomyFor,
    deriveObligation,
    close,
    complete
  });
});
