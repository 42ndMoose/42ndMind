(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindOneLogicLanguageCompletion = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let M = null, P = null, Proof = null, Kernel = null, fs = null, path = null;
  try { if (typeof require === 'function') M = require('./one-logic-math-v1.js'); } catch (_) {}
  try { if (typeof require === 'function') P = require('./math-law-invariant-prover-v0-1.js'); } catch (_) {}
  try { if (typeof require === 'function') Proof = require('./math-law-proof-checker-v0-1.js'); } catch (_) {}
  try { if (typeof require === 'function') Kernel = require('./math-language-kernel-v0-1.js'); } catch (_) {}
  try { if (typeof require === 'function') fs = require('fs'); } catch (_) {}
  try { if (typeof require === 'function') path = require('path'); } catch (_) {}

  function A(value) { return Array.isArray(value) ? value : []; }
  function O(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function C(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function math(options) { return O(options).math || M || (typeof globalThis !== 'undefined' && globalThis.OneLogicMathV1) || null; }
  function prover(options) { return O(options).prover || P || (typeof globalThis !== 'undefined' && globalThis.FortySecondMindMathLawInvariantProver) || null; }
  function proofChecker(options) { return O(options).proof_checker || Proof || (typeof globalThis !== 'undefined' && globalThis.FortySecondMindMathLawProofChecker) || null; }
  function kernel(options) { return O(options).kernel || Kernel || (typeof globalThis !== 'undefined' && globalThis.FortySecondMindMathLanguageKernel) || null; }
  function stable(value) { if (value == null) return 'null'; if (typeof value !== 'object') return JSON.stringify(value); if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'; return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}'; }
  function hash(value) { const s = stable(value); let h = 2166136261; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }

  function canonicalPath(options) { const m = math(options || {}); return O(m && m.CONTRACT).canonical_path || 'src/one-logic-math-v1.js'; }
  function canonicalSource(options) {
    const opts = options || {}, m = math(opts), p = canonicalPath(opts);
    if (opts.files && opts.files[p]) return String(opts.files[p]);
    if (fs && path && typeof __dirname !== 'undefined') {
      try { return fs.readFileSync(path.join(__dirname, 'one-logic-math-v1.js'), 'utf8'); } catch (_) {}
    }
    return String(m && m.VERSION || '') + '\n' + (m && typeof m.textBlock === 'function' ? m.textBlock() : A(m && m.F).join('\n'));
  }
  function baseState(expressions, options) {
    const opts = options || {}, p = canonicalPath(opts), files = Object.assign({}, O(opts.files));
    files[p] = files[p] || canonicalSource(opts);
    return {
      packet_type: '42ndMind_one_logic_language_completion_state_v0_1',
      files,
      internal_state: {
        symbols: ['B', 'L', 'One', 'Active', 'Living'],
        relations: A(opts.relations),
        expressions: A(expressions),
        virtual_edits: []
      }
    };
  }
  function opts(options) { return Object.assign({}, options || {}, { math: math(options || {}), prover: prover(options || {}), proof_checker: proofChecker(options || {}) }); }
  function stateReport(state, options) { const p = prover(options || {}); return p && p.evaluateState ? p.evaluateState(state, opts(options || {})) : { ok: false, proof: null, proved: false, blocked_reason: 'invariant_prover_unavailable' }; }
  function transitionReport(before, candidate, after, options) { const p = prover(options || {}); return p && p.evaluateTransition ? p.evaluateTransition(before, candidate, after, opts(options || {})) : { ok: false, proof: null, proved: false, blocked_reason: 'invariant_prover_unavailable' }; }
  function proofFrom(report) { return report && report.proof || null; }
  function certified(packet, report) { const proof = proofFrom(report); return Object.assign({}, packet, { invariant_report: report, proof, proved: !!(proof && proof.ok === true), ok: packet.ok !== false && !!(report && report.ok === true) && !!(proof && proof.ok === true), blocked_reason: report && report.blocked_reason || null }); }

  function languagePacket(input, options) {
    const k = kernel(options || {});
    if (k && typeof k.completeMath === 'function') return k.completeMath(input, options || {});
    if (k && typeof k.math === 'function') return k.math(input, options || {});
    return { φ: 'M', ok: false, verified: false, source: String(input == null ? '' : input), gaps: [{ id: 'language_kernel_unavailable' }], Ξ: '' };
  }
  function expression(input, options) {
    const body = languagePacket(input, options || {});
    const expr = { packet_type: '42ndMind_generated_expression_v0_1', version: VERSION, kind: 'generated_expression', id: 'expr:' + hash(body), source: String(input == null ? '' : input), expression: body, χ: ['generated expression must remain inside B', 'proof from CONTRACT.proofs'], Ξ: '' };
    const state = baseState([expr], options || {});
    return certified(expr, stateReport(state, options || {}));
  }
  function admit(expr, options) {
    const e = expr && expr.packet_type === '42ndMind_generated_expression_v0_1' ? expr : expression(expr, options || {});
    const prior = A(options && options.expressions);
    const before = baseState(prior, options || {});
    const after = baseState(prior.concat([e]), options || {});
    const candidate = { packet_type: '42ndMind_language_admission_candidate_v0_1', version: VERSION, kind: 'candidate', id: 'admit:' + e.id, after_state: after, operations: [], events: [{ kind: 'admission', expression_id: e.id }] };
    return certified({ packet_type: '42ndMind_language_admission_v0_1', version: VERSION, kind: 'admission', expression: C(e), admitted_expression_id: e.id, candidate }, transitionReport(before, candidate, after, options || {}));
  }
  function reduce(expressions, options) {
    const list = A(expressions);
    const before = baseState(list, options || {});
    const p = prover(options || {});
    const after = p && p.reducedState ? p.reducedState(before, opts(options || {})) : before;
    const candidate = { packet_type: '42ndMind_language_reduction_candidate_v0_1', version: VERSION, kind: 'candidate', id: 'reduce:' + hash(list), after_state: after, operations: [], events: [{ kind: 'reduction', count: list.length }] };
    return certified({ packet_type: '42ndMind_language_reduction_v0_1', version: VERSION, kind: 'reduction', before_count: list.length, after_count: A(after && after.internal_state && after.internal_state.expressions).length, reduction: after && after.reduction || null, candidate }, transitionReport(before, candidate, after, options || {}));
  }
  function refuse(input, reason, options) {
    const prior = A(options && options.expressions);
    const before = baseState(prior, options || {});
    const candidate = { packet_type: '42ndMind_language_refusal_candidate_v0_1', version: VERSION, kind: 'candidate', id: 'refuse:' + hash({ input, reason }), after_state: before, operations: [], events: [{ kind: 'refusal', reason: String(reason || 'not_admitted') }] };
    return certified({ packet_type: '42ndMind_language_refusal_v0_1', version: VERSION, kind: 'refusal', source: String(input == null ? '' : input), refused: true, reason: String(reason || 'not_admitted'), candidate }, transitionReport(before, candidate, before, options || {}));
  }
  function complete(inputs, options) {
    const generated = A(inputs).map(input => expression(input, options || {}));
    const admissions = generated.map(expr => admit(expr, Object.assign({}, options || {}, { expressions: [] })));
    const reductions = [reduce(generated, options || {})];
    const refusals = A(options && options.refusals).map(row => refuse(row && row.input, row && row.reason, Object.assign({}, options || {}, { expressions: generated })));
    const proofs = generated.concat(admissions).concat(reductions).concat(refusals).map(packet => packet.proof).filter(Boolean);
    return { packet_type: '42ndMind_one_logic_language_completion_v0_1', version: VERSION, generated, admissions, reductions, refusals, proof_count: proofs.length, proved: proofs.length > 0 && proofs.every(proof => proof.ok === true), ok: proofs.length > 0 && proofs.every(proof => proof.ok === true), χ: ['language completion packets are certified by CONTRACT.proofs', 'no generated/admitted/reduced/refused packet is proofless'], Ξ: '' };
  }

  return Object.freeze({ VERSION, expression, admit, reduce, refuse, complete, baseState, stateReport, transitionReport });
});
