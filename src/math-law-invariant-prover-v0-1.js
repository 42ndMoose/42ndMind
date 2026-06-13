(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathLawInvariantProver = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EXPECTED_MATH_VERSION = '1.5.0';
  const CANONICAL_MATH_PATH = 'src/one-logic-math-v1.js';
  const REQUIRED = Object.freeze([
    'B=Cl(B)',
    'Cl(Cl(B))=Cl(B)',
    'norm(B)=1',
    'P(B)=1',
    'One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)',
    'L=PiL(B)',
    'sub(L,B)',
    'One(L)=and(sub(L,B),norm(L)=1,P(L)=1)',
    'forall(q,imp(in(q,B),One(q)))',
    'iota(x)=qx',
    'B[x]=Cl(union(B,{qx}))',
    'Adm(x,B)=and(norm(B[x])=1,P(B[x])=1)',
    'imp(Adm(x,B),One(B[x]))',
    'D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))',
    'Om(q,B)=not(S(R(q,B)))',
    'S(q,B)=and(C(q,B),P(q,B),not(Om(q,B)))',
    'Pres(Om(q,B),B)=1',
    'EqB(a,b)=eq(D(a,B),D(b,B))',
    'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))',
    'Red(B)=quot(B,EqB)',
    'norm(Red(B))=1',
    'G(q,B)=and(Adm(q,B),not(exists(r,and(in(r,B),EqB(q,r)))))',
    'imp(not(G(q,B)),B[q]=B)',
    'Phi(q,B)=Focus(B,q)',
    'E(B,phi)=PiE(Phi(phi,B))',
    'Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)',
    'Valid(E(B,phi),B)=1',
    'Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))',
    'Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))))'
  ]);

  let Canon = null;
  try { if (typeof require === 'function') Canon = require('./one-logic-math-v1.js'); } catch (_) { Canon = null; }

  function A(x) { return Array.isArray(x) ? x : []; }
  function O(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function text(x) { return String(x == null ? '' : x); }
  function clone(x) { return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function math(o) { return (o && o.math) || Canon || (typeof globalThis !== 'undefined' && globalThis.OneLogicMathV1) || null; }
  function mathLines(o) { const m = math(o || {}); return A(m && m.F); }
  function mathVersion(o) { const m = math(o || {}); return m && (m.VERSION || m.M && m.M.v) || null; }
  function filesOf(s) { return O(s && s.files); }
  function internalOf(s) { return O(s && s.internal_state); }
  function stable(x) {
    if (x == null) return 'null';
    if (typeof x !== 'object') return JSON.stringify(x);
    if (Array.isArray(x)) return '[' + x.map(stable).join(',') + ']';
    return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + stable(x[k])).join(',') + '}';
  }
  function hash(input) {
    const s = text(input); let h = 2166136261;
    for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(36);
  }
  function unitId(q) { return text(q && q.id || q && q.U && q.U.id || q); }
  function keys(o) { return Object.keys(O(o)).sort(); }
  function uniqText(rows) { return Array.from(new Set(A(rows).map(text).filter(Boolean))).sort(); }

  function verifyCanonicalMathState(state, options) {
    const files = filesOf(state), internal = internalOf(state), canonical = text(files[CANONICAL_MATH_PATH]);
    const F = mathLines(options || {}), version = mathVersion(options || {});
    const required_missing_from_math = REQUIRED.filter(x => F.indexOf(x) < 0);
    const required_missing_from_source = canonical ? REQUIRED.filter(x => canonical.indexOf(x) < 0) : REQUIRED.slice();
    const banned_runtime_notation = ['B_t', 'B_t1'].filter(x => canonical.indexOf(x) >= 0);
    const canonical_present = !!canonical;
    const version_ok = version === EXPECTED_MATH_VERSION;
    const source_version_ok = canonical.indexOf(EXPECTED_MATH_VERSION) >= 0;
    const has_state_shape = keys(files).length > 0 && !!(state && state.internal_state) && typeof state.internal_state === 'object' && !Array.isArray(state.internal_state);
    const source_identity_ok = canonical_present && source_version_ok && required_missing_from_source.length === 0;
    const contradicted = banned_runtime_notation.length > 0 || required_missing_from_source.length > 0;
    const ok = version_ok && required_missing_from_math.length === 0 && has_state_shape && source_identity_ok && !contradicted;
    return { ok, version, expected_version: EXPECTED_MATH_VERSION, canonical_path: CANONICAL_MATH_PATH, canonical_present, version_ok, source_version_ok, has_state_shape, source_identity_ok, contradicted, required_missing_from_math, required_missing_from_source, banned_runtime_notation, counts: { files: keys(files).length, symbols: A(internal.symbols).length, relations: A(internal.relations).length, expressions: A(internal.expressions).length } };
  }

  function verifyOne(state, options) { const canonical = verifyCanonicalMathState(state, options || {}); return { ok: canonical.ok, canonical }; }

  function rawUnits(state, options) {
    const out = [], files = filesOf(state), internal = internalOf(state);
    mathLines(options || {}).forEach(formula => out.push({ kind: 'formula', id: 'formula:' + formula, formula }));
    keys(files).forEach(path => out.push({ kind: 'file', id: 'file:' + path, path, size: text(files[path]).length, digest: hash(files[path]) }));
    A(internal.symbols).forEach(symbol => out.push({ kind: 'symbol', id: 'symbol:' + text(symbol), value: text(symbol) }));
    A(internal.relations).forEach(relation => out.push({ kind: 'relation', id: 'relation:' + hash(stable(relation)), relation }));
    A(internal.expressions).forEach(expression => out.push({ kind: 'expression', id: 'expression:' + hash(stable(expression)), expression }));
    return out;
  }
  function units(state, options) {
    const seen = new Set();
    return rawUnits(state, options || {}).filter(u => { const sig = stable(u); if (seen.has(sig)) return false; seen.add(sig); return true; }).sort((a, b) => unitId(a).localeCompare(unitId(b)));
  }
  function relationRowsFor(q, state) {
    const id = unitId(q), value = text(q && (q.value || q.path || q.formula || id));
    return A(internalOf(state).relations).filter(r => stable(r).indexOf(id) >= 0 || (value && stable(r).indexOf(value) >= 0)).map(r => 'relation:' + hash(stable(r))).sort();
  }
  function constraintsFor(q) {
    const k = text(q && q.kind || 'unit');
    if (k === 'candidate') return ['One','Closure','Admission','Growth','UnknownPreservation','Reduction','ExpressionValidity'];
    if (k === 'expression') return ['One','Focus','ExpressionValidity'];
    if (k === 'relation') return ['EqB','Reduction'];
    if (k === 'formula') return ['CanonicalMath','Proof'];
    if (k === 'file') return ['One','Closure','SourceIdentity','Proof'];
    return ['One','Closure','Proof'];
  }
  function focus(state, q) { return { scope: 'B', unit: unitId(q), source_paths: keys(filesOf(state)).filter(path => path === CANONICAL_MATH_PATH || text(filesOf(state)[path]).indexOf(text(q && (q.value || q.path || q.formula || ''))) >= 0).slice(0, 16) }; }
  function proofOf(q, state, options) {
    const one = verifyOne(state, options || {});
    const unsafe_path = q && q.kind === 'candidate' && A(q.operations).some(op => text(op && op.path).indexOf('..') >= 0);
    return { ok: one.ok && !unsafe_path, source: one.ok, unsafe_path };
  }
  function stabilityOf(q, state, options) {
    const proof = proofOf(q, state, options || {}), rels = relationRowsFor(q, state), constraints = constraintsFor(q);
    const relation_stability_known = !!(q && (q.kind === 'formula' || q.kind === 'file' || q.kind === 'candidate' || rels.length > 0));
    return { ok: proof.ok && relation_stability_known && constraints.length > 0, proof, relation_stability_known, relation_count: rels.length, constraints };
  }
  function unknownOf(q, state, options) {
    const s = stabilityOf(q, state, options || {}), unresolved = [];
    if (!s.proof.ok) unresolved.push('proof_not_established');
    if (!s.relation_stability_known) unresolved.push('relation_stability_absent');
    if (!s.constraints.length) unresolved.push('constraints_absent');
    return { ok: unresolved.length > 0, unresolved, stable: s.ok };
  }
  function defineUnit(q, state, options) {
    const unit = O(q), kind = unit.kind || 'unit';
    return { U: { id: unitId(unit), kind }, R: relationRowsFor(unit, state), T: kind === 'candidate' ? { operations: A(unit.operations).map(op => ({ type: op && (op.type || op.op) || 'replace', path: op && op.path || null, digest: hash(stable(op)) })), events: A(unit.events).map(e => e && (e.candidate_kind || e.kind) || null).filter(Boolean) } : { digest: unit.digest || hash(stable(unit)), size: unit.size || null }, C: constraintsFor(unit), Om: unknownOf(unit, state, options || {}), Phi: focus(state, unit), P: proofOf(unit, state, options || {}), G: kind === 'candidate' ? { status: 'transition_evaluated' } : { status: 'resident' } };
  }
  function definitionSignature(definition) { return hash(stable(definition)); }

  function closure(state, options) {
    if (state && state.packet_type === '42ndMind_math_law_closure_v0_1') return clone(state);
    const us = units(state, options || {});
    const definitions = us.map(u => ({ id: unitId(u), signature: definitionSignature(defineUnit(u, state, options || {})) })).sort((a, b) => a.id.localeCompare(b.id));
    return { packet_type: '42ndMind_math_law_closure_v0_1', version: VERSION, math_version: mathVersion(options || {}), canonical_path: CANONICAL_MATH_PATH, source_signature: hash(stable(keys(filesOf(state)).map(path => [path, hash(filesOf(state)[path])]))), units: us.map(u => ({ id: unitId(u), kind: u.kind })), definitions };
  }
  function closureSignature(state, options) { return hash(stable(closure(state, options || {}))); }
  function verifyClosureIdempotence(state, options) { const once = closure(state, options || {}), twice = closure(once, options || {}), once_sig = closureSignature(once, options || {}), twice_sig = closureSignature(twice, options || {}); return { ok: once_sig === twice_sig, once_sig, twice_sig }; }

  function candidateAsInput(candidate) { const c = O(candidate); return { kind: 'candidate', id: 'candidate:' + text(c.id || c.candidate_id || c.packet_type || c.mode || hash(stable(c))), operations: A(c.operations), events: A(c.events), summary: { packet_type: c.packet_type || null, generated_count: c.generated_count || 0, moved: !!c.moved, internal_growth: !!c.internal_growth, virtual_state_growth: !!c.virtual_state_growth } }; }
  function candidateAfterState(before, candidate) { const c = O(candidate); return c.after_state || c.after || c.state || before; }
  function verifyAdmission(before, candidate, after, options) { const q = candidateAsInput(candidate), next = after || candidateAfterState(before, candidate), one = verifyOne(next, options || {}); return { ok: one.ok, admitted: one.ok, q, after_is_one: one.ok, one }; }

  function eqB(a, b, state, options) { return definitionSignature(defineUnit(a, state, options || {})) === definitionSignature(defineUnit(b, state, options || {})); }
  function collapseEquivalentUnits(inputUnits, state, options) { const groups = {}; A(inputUnits).forEach(unit => { const sig = definitionSignature(defineUnit(unit, state, options || {})); if (!groups[sig]) groups[sig] = []; groups[sig].push(unit); }); const collapsed = keys(groups).map(sig => groups[sig][0]); return { units: collapsed, duplicate_count: A(inputUnits).length - collapsed.length, group_count: collapsed.length, groups }; }
  function verifyEquivalenceCollapse(before, after, options) { const target = after || before, raw = rawUnits(target, options || {}), once = collapseEquivalentUnits(raw, target, options || {}), twice = collapseEquivalentUnits(once.units, target, options || {}); return { ok: stable(once.units.map(unitId).sort()) === stable(twice.units.map(unitId).sort()) && twice.duplicate_count === 0, duplicate_count: once.duplicate_count, group_count: once.group_count, unit_count: raw.length }; }
  function red(state, options) { const raw = rawUnits(state, options || {}), collapsed = collapseEquivalentUnits(raw, state, options || {}), original_count = raw.length, reduced_count = collapsed.units.length; return { packet_type: '42ndMind_math_law_reduction_v0_1', version: VERSION, original_count, reduced_count, duplicate_count: original_count - reduced_count, reduction_ratio: original_count ? Number(((original_count - reduced_count) / original_count).toFixed(6)) : 0, norm_preserved: verifyOne(state, options || {}).ok, units: collapsed.units.map(u => ({ id: unitId(u), kind: u.kind })) }; }
  function reducedState(state, options) { const next = clone(state || {}) || {}, internal = O(next.internal_state); internal.symbols = uniqText(internal.symbols); internal.relations = Array.from(new Map(A(internal.relations).map(row => [hash(stable(row)), row])).values()); internal.expressions = Array.from(new Map(A(internal.expressions).map(row => [hash(stable(row)), row])).values()); internal.virtual_edits = Array.from(new Map(A(internal.virtual_edits).map(row => [hash(stable(row)), row])).values()); next.internal_state = internal; next.reduction = red(next, options || {}); return next; }
  function verifyReductionNorm(state, options) { const r = red(state, options || {}); return { ok: r.norm_preserved && r.reduced_count <= r.original_count, reduction: r }; }

  function unknownSet(state, options) { return units(state, options || {}).map(u => ({ id: unitId(u), signature: definitionSignature(defineUnit(u, state, options || {})), unknown: unknownOf(u, state, options || {}) })).filter(row => row.unknown.ok); }
  function preservesUnknown(before, after, options) { const b = unknownSet(before, options || {}), a = unknownSet(after || before, options || {}), ids = new Set(a.map(x => x.id)), sigs = new Set(a.map(x => x.signature)), lost = b.filter(x => !ids.has(x.id) && !sigs.has(x.signature)); return { ok: lost.length === 0, before_unknown: b.length, after_unknown: a.length, lost }; }
  function changed(before, after, options) { return closureSignature(before, options || {}) !== closureSignature(after, options || {}); }
  function equivalentExisting(q, state, options) { const sig = definitionSignature(defineUnit(q, state, options || {})), hit = units(state, options || {}).find(u => definitionSignature(defineUnit(u, state, options || {})) === sig); return hit ? { ok: true, unit: hit, signature: sig } : { ok: false, signature: sig }; }
  function isGrowth(q, before, after, options) { const candidate = q && q.kind === 'candidate' ? q : candidateAsInput(q), admission = verifyAdmission(before, candidate, after, options || {}), didChange = changed(before, after, options || {}), equivalent = equivalentExisting(candidate, before, options || {}), unknown = preservesUnknown(before, after, options || {}), beforeOne = verifyOne(before, options || {}), afterOne = verifyOne(after, options || {}), improves_or_preserves_law = beforeOne.ok ? afterOne.ok : afterOne.ok === beforeOne.ok, ok = admission.ok && didChange && !equivalent.ok && unknown.ok && improves_or_preserves_law; return { ok, admissible: admission.ok, changed: didChange, equivalent_existing: equivalent.ok, improves_or_preserves_law, unknown_preserved: unknown.ok, admission, equivalent, unknown }; }
  function verifyNoGrowthNoChange(before, candidate, after, options) { const growth = isGrowth(candidateAsInput(candidate), before, after, options || {}), didChange = changed(before, after, options || {}); return { ok: growth.ok || !didChange, no_growth: !growth.ok, changed: didChange, growth }; }

  function expressionOf(state, phi) { return { kind: 'expression', id: 'expression:' + hash(stable(phi)), phi: focus(state, phi), value: phi }; }
  function validExpression(expr, state, options) { const e = O(expr), one = verifyOne(state, options || {}), files = filesOf(state), internal = internalOf(state), value = text(e.value || e.expression || e.id || ''), inside = !value || unitId(e).indexOf('expression:') === 0 || keys(files).some(path => text(files[path]).indexOf(value) >= 0) || A(internal.expressions).some(row => stable(row) === stable(e.value || e.expression || e)); const proof = proofOf(e, state, options || {}); return { ok: !!inside && one.ok && proof.ok, sub: !!inside, norm: one.ok, proof: proof.ok }; }
  function verifyExpressionValidity(state, options) { const expressions = A(internalOf(state).expressions), rows = expressions.length ? expressions.map(expr => validExpression({ kind: 'expression', expression: expr, value: expr }, state, options || {})) : [validExpression(expressionOf(state, 'B'), state, options || {})]; return { ok: rows.every(row => row.ok), checked: rows.length, rows }; }
  function verifyActive(before, candidate, after, options) { const one = verifyOne(after || before, options || {}), admission = candidate ? verifyAdmission(before, candidate, after, options || {}) : { ok: true, admitted: true }; return { ok: one.ok && admission.ok, one, admission }; }
  function verifyLiving(before, candidate, after, options) { const target = after || before, active = verifyActive(before || target, candidate || null, target, options || {}), unknown = before ? preservesUnknown(before, target, options || {}) : { ok: true }, equivalence = verifyEquivalenceCollapse(before || target, target, options || {}), reduction = verifyReductionNorm(target, options || {}), growth = candidate ? isGrowth(candidateAsInput(candidate), before || target, target, options || {}) : { ok: true }, noGrowth = candidate ? verifyNoGrowthNoChange(before || target, candidate, target, options || {}) : { ok: true }, expression = verifyExpressionValidity(target, options || {}), ok = active.ok && unknown.ok && equivalence.ok && reduction.ok && noGrowth.ok && expression.ok; return { ok, active, unknown, equivalence, reduction, growth, no_growth_no_change: noGrowth, expression }; }

  function falseReason(report) { const order = ['One','Closure','Admission','UnknownPreservation','EquivalenceCollapse','Reduction','NoGrowthNoChange','ExpressionValidity','Active','Living']; const key = order.find(k => report[k] === false); return key ? key + '_invariant_failed' : null; }
  function evaluateState(state, options) { const one = verifyOne(state, options || {}), closureReport = verifyClosureIdempotence(state, options || {}), equivalence = verifyEquivalenceCollapse(state, state, options || {}), reduction = verifyReductionNorm(state, options || {}), expression = verifyExpressionValidity(state, options || {}), active = verifyActive(state, null, state, options || {}), living = { ok: one.ok && closureReport.ok && equivalence.ok && reduction.ok && expression.ok && active.ok }, report = { packet_type: '42ndMind_math_law_invariant_report_v0_1', version: VERSION, theorem_prover: false, invariant_prover: true, math_version: mathVersion(options || {}), One: one.ok, Closure: closureReport.ok, Admission: true, UnknownPreservation: true, EquivalenceCollapse: equivalence.ok, Reduction: reduction.ok, Growth: true, NoGrowthNoChange: true, ExpressionValidity: expression.ok, Active: active.ok, Living: living.ok, one, closure: closureReport, equivalence, reduction: reduction.reduction, expression, active, living }; report.ok = report.One && report.Closure && report.EquivalenceCollapse && report.Reduction && report.ExpressionValidity && report.Active && report.Living; report.blocked_reason = report.ok ? null : falseReason(report); return report; }
  function evaluateTransition(before, candidate, after, options) { const target = after || candidateAfterState(before, candidate), one = verifyOne(target, options || {}), closureReport = verifyClosureIdempotence(target, options || {}), admission = verifyAdmission(before, candidate, target, options || {}), unknown = preservesUnknown(before, target, options || {}), equivalence = verifyEquivalenceCollapse(before, target, options || {}), reduction = verifyReductionNorm(target, options || {}), growth = isGrowth(candidateAsInput(candidate), before, target, options || {}), noGrowth = verifyNoGrowthNoChange(before, candidate, target, options || {}), expression = verifyExpressionValidity(target, options || {}), active = verifyActive(before, candidate, target, options || {}), living = verifyLiving(before, candidate, target, options || {}), didChange = changed(before, target, options || {}), report = { packet_type: '42ndMind_math_law_transition_invariant_report_v0_1', version: VERSION, theorem_prover: false, invariant_prover: true, math_version: mathVersion(options || {}), changed: didChange, One: one.ok, Closure: closureReport.ok, Admission: admission.ok, UnknownPreservation: unknown.ok, EquivalenceCollapse: equivalence.ok, Reduction: reduction.ok, Growth: growth.ok, NoGrowthNoChange: noGrowth.ok, ExpressionValidity: expression.ok, Active: active.ok, Living: living.ok, one, closure: closureReport, admission, unknown, equivalence, reduction: reduction.reduction, growth, no_growth_no_change: noGrowth, expression, active, living }; report.ok = report.One && report.Closure && report.Admission && report.UnknownPreservation && report.EquivalenceCollapse && report.Reduction && report.NoGrowthNoChange && report.ExpressionValidity && report.Active && report.Living; report.blocked_reason = report.ok ? null : falseReason(report); return report; }

  return Object.freeze({ VERSION, EXPECTED_MATH_VERSION, CANONICAL_MATH_PATH, REQUIRED, stable, hash, verifyCanonicalMathState, verifyOne, closure, closureSignature, verifyClosureIdempotence, candidateAsInput, candidateAfterState, verifyAdmission, defineUnit, definitionSignature, stabilityOf, unknownOf, preservesUnknown, eqB, collapseEquivalentUnits, verifyEquivalenceCollapse, red, reducedState, verifyReductionNorm, isGrowth, verifyNoGrowthNoChange, focus, expressionOf, validExpression, verifyExpressionValidity, verifyActive, verifyLiving, evaluateState, evaluateTransition });
});
