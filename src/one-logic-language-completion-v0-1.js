(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindOneLogicLanguageCompletion = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.2.0';
  const SEMANTIC_AUTHORITY = 'one-logic-math-v1.js::CONTRACT';
  const PROOF_AUTHORITY = 'one-logic-math-v1.js::CONTRACT.proofs';
  const GRAMMAR = Object.freeze([
    { form: 'focus', syntax: 'focus <unit>', maps_to: ['Phi'] },
    { form: 'expression', syntax: 'expr <phi> | say <phi> | <phi>', maps_to: ['Phi', 'E', 'Valid'] },
    { form: 'admission', syntax: 'admit <phi>', maps_to: ['iota', 'Adm', 'Active', 'Living'] },
    { form: 'equivalence', syntax: 'eq <a> = <b> | <a> == <b> | <a> ≡ <b>', maps_to: ['D', 'EqB', 'Red'] },
    { form: 'reduction', syntax: 'reduce <phi>; <phi>; ...', maps_to: ['EqB', 'Red'] },
    { form: 'refusal', syntax: 'refuse <reason>: <input> | invalid/unclosed input', maps_to: ['Om', 'Pres'] }
  ]);
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
  function text(value) { return String(value == null ? '' : value); }
  function math(options) { return O(options).math || M || (typeof globalThis !== 'undefined' && globalThis.OneLogicMathV1) || null; }
  function prover(options) { return O(options).prover || P || (typeof globalThis !== 'undefined' && globalThis.FortySecondMindMathLawInvariantProver) || null; }
  function proofChecker(options) { return O(options).proof_checker || Proof || (typeof globalThis !== 'undefined' && globalThis.FortySecondMindMathLawProofChecker) || null; }
  function kernel(options) { return O(options).kernel || Kernel || (typeof globalThis !== 'undefined' && globalThis.FortySecondMindMathLanguageKernel) || null; }
  function stable(value) { if (value == null) return 'null'; if (typeof value !== 'object') return JSON.stringify(value); if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'; return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}'; }
  function hash(value) { const s = stable(value); let h = 2166136261; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }

  function contract(options) { const m = math(options || {}); return O(m && m.CONTRACT); }
  function operators(options) { return O(contract(options || {}).operators); }
  function operator(name, options) { return O(operators(options || {})[name]); }
  function law(name, options) { return A(operator(name, options || {}).law); }
  function canonicalPath(options) { return contract(options || {}).canonical_path || 'src/one-logic-math-v1.js'; }
  function proofAuthority(options) { return O(contract(options || {}).proofs).authority || PROOF_AUTHORITY; }
  function grammar() { return C(GRAMMAR); }
  function grammarRow(form) { return GRAMMAR.find(row => row.form === form) || GRAMMAR[1]; }
  function operatorRows(names, options) { return A(names).map(name => ({ operator: name, role: operator(name, options || {}).role || null, law: law(name, options || {}), contract: C(operator(name, options || {}).contract || {}) })); }
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
        symbols: ['B', 'L', 'One', 'Active', 'Living', 'Phi', 'E', 'Valid', 'Adm', 'EqB', 'Red', 'Om'],
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

  function balanced(source) {
    const pairs = { ')': '(', ']': '[', '}': '{' }, stack = [];
    for (let i = 0; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
      else if (pairs[ch]) { if (stack.pop() !== pairs[ch]) return false; }
    }
    return stack.length === 0;
  }
  function invalidReason(source) {
    const s = text(source).trim();
    if (!s) return 'empty_input';
    if (!balanced(s)) return 'unclosed_expression';
    if (/\bB_t\b|\bB_t1\b|latest-recursive-unit-brain-projection|\bprojection\b/i.test(s)) return 'forbidden_runtime_or_projection_notation';
    return null;
  }
  function parse(source) {
    const raw = text(source), s = raw.trim(), bad = invalidReason(s);
    if (bad) return { ok: false, form: 'refusal', source: raw, payload: s, reason: bad, operators: grammarRow('refusal').maps_to };
    let m = s.match(/^refuse\s+([^:]+):\s*(.+)$/i);
    if (m) return { ok: false, form: 'refusal', source: raw, payload: m[2].trim(), reason: m[1].trim(), operators: grammarRow('refusal').maps_to };
    m = s.match(/^admit\s+(.+)$/i);
    if (m) return { ok: true, form: 'admission', source: raw, payload: m[1].trim(), operators: grammarRow('admission').maps_to };
    m = s.match(/^reduce\s+(.+)$/i);
    if (m) return { ok: true, form: 'reduction', source: raw, payload: m[1].trim(), items: m[1].split(/\s*;\s*/).map(x => x.trim()).filter(Boolean), operators: grammarRow('reduction').maps_to };
    m = s.match(/^focus\s+(.+)$/i);
    if (m) return { ok: true, form: 'focus', source: raw, payload: m[1].trim(), operators: grammarRow('focus').maps_to };
    m = s.match(/^eq\s+(.+?)\s*=\s*(.+)$/i) || s.match(/^(.+?)\s*(?:==|≡)\s*(.+)$/);
    if (m) return { ok: true, form: 'equivalence', source: raw, payload: s, left: m[1].trim(), right: m[2].trim(), operators: grammarRow('equivalence').maps_to };
    m = s.match(/^(?:expr|say)\s+(.+)$/i);
    return { ok: true, form: 'expression', source: raw, payload: (m ? m[1] : s).trim(), operators: grammarRow('expression').maps_to };
  }

  function parserPacket(input, options) {
    // Parser/formatter only. It may shape display metadata, but it is not semantic authority.
    // Semantics and proof authority remain only SEMANTIC_AUTHORITY and PROOF_AUTHORITY.
    const k = kernel(options || {});
    if (k && typeof k.completeMath === 'function') return k.completeMath(input, options || {});
    if (k && typeof k.math === 'function') return k.math(input, options || {});
    return { φ: 'M', ok: false, verified: false, source: text(input), gaps: [{ id: 'language_kernel_unavailable' }], Ξ: '' };
  }
  function contractExpression(input, parser, options) {
    const parsed = O(options).parsed || parse(input), c = contract(options || {}), source = text(input);
    const ops = parsed.operators && parsed.operators.length ? parsed.operators : grammarRow(parsed.form || 'expression').maps_to;
    return {
      packet_type: '42ndMind_contract_derived_expression_v0_1',
      version: VERSION,
      source,
      form: parsed.form || 'expression',
      payload: parsed.payload || source,
      semantic_authority: c.canonical_path ? c.canonical_path + '::CONTRACT' : SEMANTIC_AUTHORITY,
      proof_authority: proofAuthority(options || {}),
      derived_from_contract: true,
      grammar: grammarRow(parsed.form || 'expression'),
      operators: operatorRows(ops, options || {}),
      expression_law: law('E', options || {}),
      validity_law: law('Valid', options || {}),
      focus_law: law('Phi', options || {}),
      admission_law: law('Adm', options || {}),
      equivalence_law: law('EqB', options || {}),
      reduction_law: law('Red', options || {}),
      refusal_law: law('Om', options || {}).concat(law('Pres', options || {})),
      constraints: A(O(c.unit_constraints).expression),
      parser_role: 'parse_format_hint_only_not_semantic_authority',
      parser_packet: C(parser),
      χ: ['language form maps to canonical CONTRACT.operators', 'semantic authority is only CONTRACT', 'proof authority is only CONTRACT.proofs', 'parser packet is not semantic authority'],
      Ξ: ''
    };
  }
  function expression(input, options) {
    const parsed = O(options).parsed || parse(input), parsedInput = parsed.payload || input;
    const parsedPacket = parserPacket(parsedInput, options || {});
    const body = contractExpression(parsedInput, parsedPacket, Object.assign({}, options || {}, { parsed }));
    const expr = { packet_type: '42ndMind_generated_expression_v0_1', version: VERSION, kind: 'generated_expression', id: 'expr:' + hash(body), source: text(input), form: parsed.form || 'expression', payload: parsed.payload || text(input), expression: body, semantic_authority: body.semantic_authority, proof_authority: body.proof_authority, χ: ['generated expression must remain inside B', 'generated expression derives from CONTRACT.operators', 'proof from CONTRACT.proofs'], Ξ: '' };
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
    const candidate = { packet_type: '42ndMind_language_refusal_candidate_v0_1', version: VERSION, kind: 'candidate', id: 'refuse:' + hash({ input, reason }), after_state: before, operations: [], events: [{ kind: 'refusal', reason: text(reason || 'not_admitted') }] };
    return certified({ packet_type: '42ndMind_language_refusal_v0_1', version: VERSION, kind: 'refusal', source: text(input), refused: true, reason: text(reason || 'not_admitted'), grammar: grammarRow('refusal'), operators: operatorRows(grammarRow('refusal').maps_to, options || {}), candidate }, transitionReport(before, candidate, before, options || {}));
  }
  function handle(input, options) {
    const parsed = parse(input), source = parsed.payload || input;
    if (!parsed.ok || parsed.form === 'refusal') return { input: text(input), parsed, generated_expression: null, proof: null, result: refuse(source, parsed.reason || 'not_admitted', options || {}) };
    if (parsed.form === 'reduction') {
      const generated = A(parsed.items).map(item => expression(item, Object.assign({}, options || {}, { parsed: parse(item) })));
      const result = reduce(generated, options || {});
      return { input: text(input), parsed, generated_expression: generated, proof: result.proof, result };
    }
    const generated = expression(source, Object.assign({}, options || {}, { parsed }));
    const result = admit(generated, options || {});
    return { input: text(input), parsed, generated_expression: generated, proof: generated.proof, result };
  }
  function complete(inputs, options) {
    const rows = A(inputs).map(input => handle(input, options || {}));
    const generated = rows.reduce((out, row) => out.concat(A(row.generated_expression).length ? row.generated_expression : (row.generated_expression ? [row.generated_expression] : [])), []);
    const admissions = rows.map(row => row.result).filter(packet => packet && packet.kind === 'admission');
    const routedReductions = rows.map(row => row.result).filter(packet => packet && packet.kind === 'reduction');
    const aggregateReductions = generated.length ? [reduce(generated, options || {})] : [];
    const reductions = routedReductions.concat(aggregateReductions);
    const routedRefusals = rows.map(row => row.result).filter(packet => packet && packet.kind === 'refusal');
    const explicitRefusals = A(options && options.refusals).map(row => refuse(row && row.input, row && row.reason, Object.assign({}, options || {}, { expressions: generated })));
    const refusals = routedRefusals.concat(explicitRefusals);
    const packets = generated.concat(admissions).concat(reductions).concat(refusals);
    const proofs = packets.map(packet => packet.proof).filter(Boolean);
    return { packet_type: '42ndMind_one_logic_language_completion_v0_1', version: VERSION, grammar: grammar(), rows, generated, admissions, reductions, refusals, proof_count: proofs.length, proved: packets.length > 0 && packets.every(packet => packet.proved === true) && proofs.every(proof => proof.ok === true), ok: packets.length > 0 && packets.every(packet => packet.ok === true) && proofs.every(proof => proof.ok === true), χ: ['language completion packets are certified by CONTRACT.proofs', 'no generated/admitted/reduced/refused packet is proofless'], Ξ: '' };
  }
  function exampleRows(options) {
    const inputs = ['focus B', 'reduce focus B; focus B', 'expr (unclosed'];
    return inputs.map(input => {
      const row = handle(input, options || {}), generated = row.generated_expression, g = Array.isArray(generated) ? generated[0] : generated;
      return { input, generated_expression: g ? { id: g.id, form: g.form, ok: g.ok, proof_ok: !!(g.proof && g.proof.ok) } : null, proof: g && g.proof ? { ok: g.proof.ok, theorem: g.proof.theorem } : row.result && row.result.proof ? { ok: row.result.proof.ok, theorem: row.result.proof.theorem } : null, result: { packet_type: row.result && row.result.packet_type || null, kind: row.result && row.result.kind || null, ok: !!(row.result && row.result.ok), proved: !!(row.result && row.result.proved), refused: !!(row.result && row.result.refused), reason: row.result && row.result.reason || null } };
    });
  }

  return Object.freeze({ VERSION, SEMANTIC_AUTHORITY, PROOF_AUTHORITY, grammar, parse, expression, admit, reduce, refuse, handle, complete, exampleRows, baseState, stateReport, transitionReport, contractExpression });
});
