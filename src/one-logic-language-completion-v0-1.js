(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindOneLogicLanguageCompletion = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.2.2';
  const SEMANTIC_AUTHORITY = 'one-logic-math-v1.js::CONTRACT';
  const PROOF_AUTHORITY = 'one-logic-math-v1.js::CONTRACT.proofs';
  const GRAMMAR = Object.freeze([
    { form: 'one', syntax: 'one <unit>', maps_to: ['One'], example: 'one B' },
    { form: 'focus', syntax: 'focus <unit>', maps_to: ['Phi'], example: 'focus B' },
    { form: 'expression', syntax: 'expr <phi> | say <phi> | <phi>', maps_to: ['Phi', 'E', 'Valid'], example: 'expr focus B' },
    { form: 'valid', syntax: 'valid <expr> in B', maps_to: ['Valid'], example: 'valid focus B in B' },
    { form: 'unknown', syntax: 'unknown <unit>', maps_to: ['Om'], example: 'unknown q' },
    { form: 'same', syntax: 'same <a> <b>', maps_to: ['EqB'], example: 'same focus B focus B' },
    { form: 'reduction', syntax: 'reduce <items>', maps_to: ['Red'], example: 'reduce focus B; focus B' },
    { form: 'admission', syntax: 'admit <expr>', maps_to: ['Adm', 'Active', 'Living'], example: 'admit focus B' },
    { form: 'refusal', syntax: 'refuse <input> because <reason>', maps_to: ['Om'], example: 'refuse expr (unclosed because unclosed_expression' }
  ]);
  const OBLIGATIONS = Object.freeze({
    one: ['One'],
    focus: ['ExpressionValidity', 'AdmissionPreservesOne'],
    expression: ['ExpressionValidity', 'AdmissionPreservesOne'],
    valid: ['ExpressionValidity'],
    unknown: ['UnknownPreservation'],
    same: ['EquivalenceCollapse'],
    equivalence: ['EquivalenceCollapse', 'ReductionNorm'],
    reduction: ['ReductionNorm'],
    admission: ['AdmissionPreservesOne', 'Active', 'Living'],
    refusal: ['NoGrowthNoChange', 'UnknownPreservation']
  });
  const RESULT_PACKETS = Object.freeze({
    one: '42ndMind_language_admission_v0_1',
    focus: '42ndMind_language_admission_v0_1',
    expression: '42ndMind_language_admission_v0_1',
    valid: '42ndMind_language_admission_v0_1',
    unknown: '42ndMind_language_admission_v0_1',
    same: '42ndMind_language_reduction_v0_1',
    equivalence: '42ndMind_language_reduction_v0_1',
    reduction: '42ndMind_language_reduction_v0_1',
    admission: '42ndMind_language_admission_v0_1',
    refusal: '42ndMind_language_refusal_v0_1'
  });
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
  function grammarRow(form) { return GRAMMAR.find(row => row.form === form) || GRAMMAR[2]; }
  function obligationNames(form) { return C(OBLIGATIONS[form] || OBLIGATIONS.expression); }
  function resultPacketType(form) { return RESULT_PACKETS[form] || RESULT_PACKETS.expression; }
  function resultKind(form) { return resultPacketType(form).replace('42ndMind_language_', '').replace('_v0_1', ''); }
  function proofNote(form) { return form === 'refusal' ? 'proof certifies refusal and preservation of B; it does not certify the invalid input' : 'proof certifies the generated/admitted/reduced packet under CONTRACT.proofs'; }
  function languageSpec(options) {
    return GRAMMAR.map(row => ({
      accepted_syntax: row.syntax,
      form: row.form,
      mapped_operator: C(row.maps_to),
      result_packet: resultPacketType(row.form),
      proof_obligation: obligationNames(row.form),
      example_input: row.example,
      example_result: resultKind(row.form),
      proof_authority: proofAuthority(options || {}),
      note: proofNote(row.form)
    }));
  }
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
  function splitSame(rest) {
    const byDelim = rest.split(/\s*[,|]\s*/).filter(Boolean);
    if (byDelim.length >= 2) return [byDelim[0].trim(), byDelim.slice(1).join(' ').trim()];
    const parts = rest.trim().split(/\s+/).filter(Boolean), mid = Math.max(1, Math.floor(parts.length / 2));
    return [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ')];
  }
  function parse(source) {
    const raw = text(source), s = raw.trim();
    if (!s) return { ok: false, form: 'refusal', source: raw, payload: s, reason: 'empty_input', operators: grammarRow('refusal').maps_to };
    let m = s.match(/^refuse\s+(.+?)\s+because\s+(.+)$/i);
    if (m) return { ok: false, form: 'refusal', source: raw, payload: m[1].trim(), reason: m[2].trim(), operators: grammarRow('refusal').maps_to };
    m = s.match(/^refuse\s+([^:]+):\s*(.+)$/i);
    if (m) return { ok: false, form: 'refusal', source: raw, payload: m[2].trim(), reason: m[1].trim(), operators: grammarRow('refusal').maps_to };
    const bad = invalidReason(s);
    if (bad) return { ok: false, form: 'refusal', source: raw, payload: s, reason: bad, operators: grammarRow('refusal').maps_to };
    m = s.match(/^one\s+(.+)$/i);
    if (m) return { ok: true, form: 'one', source: raw, payload: m[1].trim(), operators: grammarRow('one').maps_to };
    m = s.match(/^valid\s+(.+?)\s+in\s+B$/i);
    if (m) return { ok: true, form: 'valid', source: raw, payload: m[1].trim(), scope: 'B', operators: grammarRow('valid').maps_to };
    m = s.match(/^unknown\s+(.+)$/i);
    if (m) return { ok: true, form: 'unknown', source: raw, payload: m[1].trim(), operators: grammarRow('unknown').maps_to };
    m = s.match(/^same\s+(.+)$/i);
    if (m) { const pair = splitSame(m[1]); return { ok: true, form: 'same', source: raw, payload: s, left: pair[0], right: pair[1], items: pair, operators: grammarRow('same').maps_to }; }
    m = s.match(/^admit\s+(.+)$/i);
    if (m) return { ok: true, form: 'admission', source: raw, payload: m[1].trim(), operators: grammarRow('admission').maps_to };
    m = s.match(/^reduce\s+(.+)$/i);
    if (m) return { ok: true, form: 'reduction', source: raw, payload: m[1].trim(), items: m[1].split(/\s*;\s*/).map(x => x.trim()).filter(Boolean), operators: grammarRow('reduction').maps_to };
    m = s.match(/^focus\s+(.+)$/i);
    if (m) return { ok: true, form: 'focus', source: raw, payload: m[1].trim(), operators: grammarRow('focus').maps_to };
    m = s.match(/^eq\s+(.+?)\s*=\s*(.+)$/i) || s.match(/^(.+?)\s*(?:==|≡)\s*(.+)$/);
    if (m) return { ok: true, form: 'equivalence', source: raw, payload: s, left: m[1].trim(), right: m[2].trim(), items: [m[1].trim(), m[2].trim()], operators: ['D', 'EqB', 'Red'] };
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
      proof_obligations_used: obligationNames(parsed.form || 'expression'),
      proof_note: proofNote(parsed.form || 'expression'),
      expression_law: law('E', options || {}),
      validity_law: law('Valid', options || {}),
      focus_law: law('Phi', options || {}),
      admission_law: law('Adm', options || {}),
      equivalence_law: law('EqB', options || {}),
      reduction_law: law('Red', options || {}),
      refusal_law: law('Om', options || {}),
      one_law: law('One', options || {}),
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
    const expr = { packet_type: '42ndMind_generated_expression_v0_1', version: VERSION, kind: 'generated_expression', id: 'expr:' + hash(body), source: text(input), form: parsed.form || 'expression', payload: parsed.payload || text(input), expression: body, semantic_authority: body.semantic_authority, proof_authority: body.proof_authority, proof_obligations_used: obligationNames(parsed.form || 'expression'), proof_note: proofNote(parsed.form || 'expression'), χ: ['generated expression must remain inside B', 'generated expression derives from CONTRACT.operators', 'proof from CONTRACT.proofs'], Ξ: '' };
    const state = baseState([expr], options || {});
    return certified(expr, stateReport(state, options || {}));
  }
  function admit(expr, options) {
    const e = expr && expr.packet_type === '42ndMind_generated_expression_v0_1' ? expr : expression(expr, options || {});
    const form = e.form || 'admission';
    const prior = A(options && options.expressions);
    const before = baseState(prior, options || {});
    const after = baseState(prior.concat([e]), options || {});
    const candidate = { packet_type: '42ndMind_language_admission_candidate_v0_1', version: VERSION, kind: 'candidate', id: 'admit:' + e.id, after_state: after, operations: [], events: [{ kind: 'admission', expression_id: e.id, form }] };
    return certified({ packet_type: '42ndMind_language_admission_v0_1', version: VERSION, kind: 'admission', expression: C(e), admitted_expression_id: e.id, candidate, candidate_admitted: true, proof_obligations_used: obligationNames(form), proof_note: proofNote(form), proof_authority: proofAuthority(options || {}) }, transitionReport(before, candidate, after, options || {}));
  }
  function duplicateCount(list) { const seen = {}; A(list).forEach(row => { seen[stable(row)] = true; }); return Math.max(0, A(list).length - Object.keys(seen).length); }
  function reduce(expressions, options) {
    const list = A(expressions), form = O(options).parsed && O(options).parsed.form || 'reduction';
    const before = baseState(list, options || {});
    const p = prover(options || {});
    const after = p && p.reducedState ? p.reducedState(before, opts(options || {})) : before;
    const candidate = { packet_type: '42ndMind_language_reduction_candidate_v0_1', version: VERSION, kind: 'candidate', id: 'reduce:' + hash(list), after_state: after, operations: [], events: [{ kind: 'reduction', count: list.length, form }] };
    return certified({ packet_type: '42ndMind_language_reduction_v0_1', version: VERSION, kind: 'reduction', before_count: list.length, after_count: A(after && after.internal_state && after.internal_state.expressions).length, duplicate_count: duplicateCount(list), reduction: after && after.reduction || null, candidate, proof_obligations_used: obligationNames(form), proof_note: proofNote(form), proof_authority: proofAuthority(options || {}) }, transitionReport(before, candidate, after, options || {}));
  }
  function refuse(input, reason, options) {
    const prior = A(options && options.expressions);
    const before = baseState(prior, options || {});
    const candidate = { packet_type: '42ndMind_language_refusal_candidate_v0_1', version: VERSION, kind: 'candidate', id: 'refuse:' + hash({ input, reason }), after_state: before, operations: [], events: [{ kind: 'refusal', reason: text(reason || 'not_admitted') }] };
    return certified({ packet_type: '42ndMind_language_refusal_v0_1', version: VERSION, kind: 'refusal', source: text(input), refused: true, reason: text(reason || 'not_admitted'), refusal_reason: text(reason || 'not_admitted'), blocked_reason: text(reason || 'not_admitted'), grammar: grammarRow('refusal'), operators: operatorRows(grammarRow('refusal').maps_to, options || {}), candidate, proof_obligations_used: obligationNames('refusal'), proof_note: proofNote('refusal'), proof_authority: proofAuthority(options || {}) }, transitionReport(before, candidate, before, options || {}));
  }
  function handle(input, options) {
    const parsed = parse(input), source = parsed.payload || input;
    if (!parsed.ok || parsed.form === 'refusal') return { input: text(input), parsed, generated_expression: null, proof: null, result: refuse(source, parsed.reason || 'not_admitted', options || {}) };
    if (parsed.form === 'reduction' || parsed.form === 'equivalence' || parsed.form === 'same') {
      const items = A(parsed.items).length ? parsed.items : [parsed.left, parsed.right].filter(Boolean);
      const generated = items.map(item => expression(item, Object.assign({}, options || {}, { parsed: parse(item) })));
      const result = reduce(generated, Object.assign({}, options || {}, { parsed }));
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
    return { packet_type: '42ndMind_one_logic_language_completion_v0_1', version: VERSION, grammar: grammar(), language_spec: languageSpec(options || {}), rows, generated, admissions, reductions, refusals, proof_count: proofs.length, proved: packets.length > 0 && packets.every(packet => packet.proved === true) && proofs.every(proof => proof.ok === true), ok: packets.length > 0 && packets.every(packet => packet.ok === true) && proofs.every(proof => proof.ok === true), χ: ['language completion packets are certified by CONTRACT.proofs', 'no generated/admitted/reduced/refused packet is proofless'], Ξ: '' };
  }
  function proofSummary(packet, fallbackForm, options) {
    const p = packet && packet.proof || null, form = fallbackForm || (packet && packet.kind) || 'expression';
    return { ok: !!(p && p.ok), theorem: p && p.theorem || null, obligations_used: packet && packet.proof_obligations_used || obligationNames(form), authority: p && p.authority || proofAuthority(options || {}), note: packet && packet.proof_note || proofNote(form) };
  }
  function resultSummary(packet, form, options) {
    const kind = packet && packet.kind || null;
    return { packet_type: packet && packet.packet_type || resultPacketType(form), kind, ok: !!(packet && packet.ok), proved: !!(packet && packet.proved), candidate_admitted: kind === 'admission' ? !!(packet && packet.candidate_admitted) : null, duplicate_count: kind === 'reduction' ? packet && packet.duplicate_count || 0 : null, blocked_reason: kind === 'refusal' ? packet && packet.blocked_reason || null : null, refusal_reason: kind === 'refusal' ? packet && packet.refusal_reason || packet && packet.reason || null : null, refused: !!(packet && packet.refused), proof_authority: packet && packet.proof_authority || proofAuthority(options || {}), proof_obligations_used: packet && packet.proof_obligations_used || obligationNames(form), proof_note: packet && packet.proof_note || proofNote(form) };
  }
  function generatedSummary(generated) {
    return A(generated).map(g => ({ id: g.id, form: g.form, ok: g.ok, proof_ok: !!(g.proof && g.proof.ok), proof_obligations_used: g.proof_obligations_used, proof_authority: g.proof_authority }));
  }
  function exampleRows(options) {
    return GRAMMAR.map(rowSpec => rowSpec.example).filter(Boolean).map(input => {
      const row = handle(input, options || {}), generated = Array.isArray(row.generated_expression) ? row.generated_expression : (row.generated_expression ? [row.generated_expression] : []), form = row.parsed && row.parsed.form || 'expression';
      return { input, generated_expression: generated[0] ? generatedSummary([generated[0]])[0] : null, generated_expressions: generatedSummary(generated), proof: proofSummary(row.result, form, options || {}), result: resultSummary(row.result, form, options || {}) };
    });
  }

  return Object.freeze({ VERSION, SEMANTIC_AUTHORITY, PROOF_AUTHORITY, grammar, languageSpec, parse, expression, admit, reduce, refuse, handle, complete, exampleRows, baseState, stateReport, transitionReport, contractExpression });
});
