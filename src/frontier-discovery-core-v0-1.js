(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindFrontierDiscoveryCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let K = null;
  let Closure = null;
  let WholeSelf = null;
  try { if (typeof require === 'function') K = require('./math-language-kernel-v0-1.js'); } catch (_) { K = null; }
  try { if (typeof require === 'function') Closure = require('./math-closure-engine-v0-1.js'); } catch (_) { Closure = null; }
  try { if (typeof require === 'function') WholeSelf = require('./whole-self-simulation-core-v0-1.js'); } catch (_) { WholeSelf = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function text(value) { return String(value == null ? '' : value); }
  function compact(value) { return text(value).replace(/\s+/g, ' ').trim(); }
  function has(value, needle) { return text(value).indexOf(text(needle)) >= 0; }
  function safeId(value) { return compact(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown'; }

  function packet(type, data) {
    return Object.assign({ packet_type: type, version: VERSION, Ξ: '' }, data || {});
  }

  function readGap(input, options) {
    const source = compact(input);
    const kernel = options && options.kernel || K;
    const closureEngine = options && options.closure || Closure;
    let kernel_packet = null;
    let closure_packet = null;
    try { if (kernel && typeof kernel.math === 'function') kernel_packet = kernel.math(source); } catch (err) { kernel_packet = { ok: false, error: String(err && err.message || err), gaps: [{ id: 'kernel_math_error' }] }; }
    try { if (closureEngine && typeof closureEngine.close === 'function') closure_packet = closureEngine.close(source); } catch (err) { closure_packet = { ok: false, error: String(err && err.message || err), gaps: [{ id: 'closure_error' }] }; }
    const gap = (kernel_packet && Array.isArray(kernel_packet.gaps) && kernel_packet.gaps[0]) || (closure_packet && Array.isArray(closure_packet.gaps) && closure_packet.gaps[0]) || null;
    return packet('42ndMind_frontier_gap_read_v0_1', {
      input: source,
      ok: !!(kernel_packet && kernel_packet.ok === true),
      gap_id: gap && gap.id || null,
      gap: clone(gap),
      kernel_packet: clone(kernel_packet),
      closure_packet: clone(closure_packet)
    });
  }

  const HEURISTICS = [
    {
      id: 'complex_unit_identity',
      match: source => /^i\^2\s*=\s*-1$/i.test(source.replace(/\s+/g, '')),
      infer: source => proposal('complex_unit_identity', source, {
        missing: ['complex_unit_symbol', 'complex_number_domain', 'complex_unit_identity_rule'],
        ast_node: 'ComplexUnitIdentityStatement',
        anatomy_id: 'complex_unit_identity',
        closure_operator: 'proveComplexUnitIdentity',
        proof_obligations: ['represent i as the imaginary unit', 'prove or register i^2 = -1 under complex-number domain'],
        reality_anchor: { id: 'complex_unit_identity', input: source, closure_operator: 'proveComplexUnitIdentity', selected_rule: 'complex-unit-identity' },
        tests: ['AST parses complex unit identity', 'closure verifies identity under complex domain', 'whole-self wants no longer include complex_numbers']
      })
    },
    {
      id: 'matrix_multiplication',
      match: source => /^[A-Z]\s+[A-Z]\s*=\s*[A-Z]$/.test(source),
      infer: source => proposal('matrix_multiplication', source, {
        missing: ['matrix_type', 'matrix_product_operator', 'dimension_compatibility_guard'],
        ast_node: 'MatrixProductStatement',
        anatomy_id: 'matrix_product',
        closure_operator: 'typeMatrixProduct',
        proof_obligations: ['infer matrix operands', 'emit dimension compatibility guard', 'canonicalize product relation'],
        reality_anchor: { id: 'matrix_product_typing', input: source, closure_operator: 'typeMatrixProduct', selected_rule: 'matrix-product-dimension-guard' },
        tests: ['AST parses matrix product', 'closure emits dimension guard', 'unsupported invalid dimensions stay guarded']
      })
    },
    {
      id: 'sequence_definition',
      match: source => /^[a-zA-Z]_n\s*=\s*n\^2$/i.test(source.replace(/\s+/g, '')),
      infer: source => proposal('sequence_definition', source, {
        missing: ['indexed_variable', 'sequence_domain', 'term_formula'],
        ast_node: 'SequenceDefinition',
        anatomy_id: 'sequence_definition',
        closure_operator: 'defineSequence',
        proof_obligations: ['represent indexed term', 'type n over natural numbers', 'canonicalize term formula'],
        reality_anchor: { id: 'sequence_definition_square', input: source, closure_operator: 'defineSequence', selected_rule: 'sequence-term-definition' },
        tests: ['AST parses indexed sequence', 'closure emits sequence definition packet', 'whole-self wants no longer include sequences']
      })
    },
    {
      id: 'existential_quantifier',
      match: source => /^exists\s+[a-zA-Z]\s+in\s+[A-Za-z]+,\s*.+$/i.test(source),
      infer: source => proposal('existential_quantifier', source, {
        missing: ['existential_quantifier', 'witness_obligation', 'domain_scope'],
        ast_node: 'ExistentialStatement',
        anatomy_id: 'existential_quantifier',
        closure_operator: 'generateExistentialObligations',
        proof_obligations: ['open existential scope', 'emit witness obligation', 'verify predicate under witness or return missing witness gap'],
        reality_anchor: { id: 'existential_witness_obligation', input: source, closure_operator: 'generateExistentialObligations', selected_rule: 'existential-witness-obligation' },
        tests: ['AST parses existential statement', 'closure emits witness obligation', 'unwitnessed existential remains incomplete']
      })
    },
    {
      id: 'relation_claim_transfer',
      match: source => /\b(happy|good|not good|Harvey)\b/i.test(source) && /,/.test(source),
      infer: source => proposal('relation_claim_transfer', source, {
        missing: ['typed_entity', 'predicate_relation', 'relation_transfer_rule', 'scope_guard'],
        ast_node: 'RelationClaimSet',
        anatomy_id: 'relation_claim_set',
        closure_operator: 'analyzeRelationClaimSet',
        proof_obligations: ['parse entity predicates', 'separate asserted relation from transfer rule', 'detect contradiction pressure without silently transferring predicates'],
        reality_anchor: { id: 'relation_transfer_blocked_until_rule_exists', input: source, closure_operator: 'analyzeRelationClaimSet', selected_rule: 'relation-transfer-scope-check' },
        tests: ['Harvey-style input produces relation graph', 'predicate transfer is blocked without a rule', 'contradiction pressure is explicit']
      })
    }
  ];

  function proposal(kind, input, spec) {
    const id = safeId(kind + '_' + input);
    const ast_node = spec.ast_node;
    const anatomy_id = spec.anatomy_id;
    const closure_operator = spec.closure_operator;
    return packet('42ndMind_frontier_candidate_language_extension_v0_1', {
      id,
      kind,
      input: compact(input),
      status: 'candidate_structure_only',
      promoted: false,
      missing: clone(spec.missing || []),
      candidate: {
        ast_node,
        anatomy_id,
        closure_operator,
        classification: { anatomy_id, closure: closure_operator },
        proof_obligations: clone(spec.proof_obligations || []),
        reality_anchor: clone(spec.reality_anchor || null),
        tests: clone(spec.tests || [])
      },
      source_patch: {
        ready: false,
        reason: 'Discovery core proposes structure first. Source edits must be generated separately and judged by sandbox, tests, reality feedback, and whole-self simulation.'
      }
    });
  }

  function infer(input, options) {
    const source = compact(input);
    const gap = readGap(source, options || {});
    if (gap.ok === true) {
      return packet('42ndMind_frontier_discovery_v0_1', { input: source, ok: true, needed: false, gap, proposals: [], reason: 'Input already closes through the current kernel.' });
    }
    const matches = HEURISTICS.filter(h => h.match(source)).map(h => h.infer(source));
    const proposals = matches.length ? matches : [proposal('unknown_unclassified_frontier', source, {
      missing: ['unknown_operator_or_type'],
      ast_node: 'UnknownFrontierCandidate',
      anatomy_id: 'unknown_frontier',
      closure_operator: 'unresolvedFrontierClosure',
      proof_obligations: ['identify operator/type boundary', 'classify required closure rule', 'generate falsifiable tests before promotion'],
      tests: ['unsupported input remains a precise gap until structure is known']
    })];
    return packet('42ndMind_frontier_discovery_v0_1', { input: source, ok: false, needed: true, gap, proposals });
  }

  function fromWholeSelf(state, options) {
    const wants = Array.isArray(state && state.wants) ? state.wants : [];
    return packet('42ndMind_frontier_discovery_batch_v0_1', {
      source: 'whole_self_wants',
      count: wants.length,
      discoveries: wants.map(w => infer(w.input || w.id || '', options || {}))
    });
  }

  function createLedger(rows) {
    return packet('42ndMind_frontier_discovery_ledger_v0_1', {
      entries: (Array.isArray(rows) ? rows : []).map((row, index) => Object.assign({ index, status: 'recorded' }, clone(row))),
      success_count: (Array.isArray(rows) ? rows : []).filter(r => r && r.result === 'promoted').length,
      failure_count: (Array.isArray(rows) ? rows : []).filter(r => r && r.result === 'rejected').length
    });
  }

  function record(ledger, entry) {
    const base = ledger && Array.isArray(ledger.entries) ? ledger.entries : [];
    return createLedger(base.concat([Object.assign({ recorded_at_index: base.length }, clone(entry || {}))]));
  }

  return Object.freeze({ VERSION, readGap, infer, fromWholeSelf, createLedger, record, _heuristics: HEURISTICS.map(h => h.id) });
});
