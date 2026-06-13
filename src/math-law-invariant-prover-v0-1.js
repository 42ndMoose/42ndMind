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
  function sortedKeys(o) { return Object.keys(O(o)).sort(); }
  function unique(rows) { return Array.from(new Set(A(rows).map(text).filter(Boolean))).sort(); }
  function math(o) { return (o && o.math) || Canon || (typeof globalThis !== 'undefined' && globalThis.OneLogicMathV1) || null; }
  function mathVersion(o) { const m = math(o || {}); return m && (m.VERSION || m.M && m.M.v) || null; }
  function mathLines(o) { const m = math(o || {}); return A(m && m.F); }
  function filesOf(state) { return O(state && state.files); }
  function internalOf(state) { return O(state && state.internal_state); }
  function stable(value) {
    if (value == null) return 'null';
    if (typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  }
  function hash(input) {
    const s = text(input);
    let h = 2166136261;
    for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(36);
  }
  function unitId(unit) { return text(unit && unit.id || unit && unit.U && unit.U.id || unit); }
  function sourceText(state, path) { return text(filesOf(state)[path]); }

  function verifyCanonicalMathState(state, options) {
    const lines = mathLines(options || {});
    const version = mathVersion(options || {});
    const files = filesOf(state);
    const internal = internalOf(state);
    const canonical = sourceText(state, CANONICAL_MATH_PATH);
    const required_missing_from_math = REQUIRED.filter(x => lines.indexOf(x) < 0);
    const required_missing_from_source = canonical ? REQUIRED.filter(x => canonical.indexOf(x) < 0) : REQUIRED.slice();
    const banned_runtime_notation = ['B_t', 'B_t1'].filter(x => canonical.indexOf(x) >= 0);
    const canonical_present = !!canonical;
    const version_ok = version === EXPECTED_MATH_VERSION;
    const source_version_ok = canonical.indexOf(EXPECTED_MATH_VERSION) >= 0;
    const has_state_shape = Object.keys(files).length > 0 && !!(state && state.internal_state) && typeof state.internal_state === 'object' && !Array.isArray(state.internal_state);
    const source_identity_ok = canonical_present && source_version_ok && required_missing_from_source.length === 0;
    const contradicted = banned_runtime_notation.length > 0 || required_missing_from_source.length > 0;
    const ok = version_ok && required_missing_from_math.length === 0 && has_state_shape && source_identity_ok && !contradicted;
    return { ok, version, expected_version: EXPECTED_MATH_VERSION, canonical_path: CANONICAL_MATH_PATH, canonical_present, version_ok, source_version_ok, has_state_shape, source_identity_ok, contradicted, required_missing_from_math, required_missing_from_source, banned_runtime_notation, counts: { files: Object.keys(files).length, symbols: A(internal.symbols).length, relations: A(internal.relations).length, expressions: A(internal.expressions).length } };
  }

  function stateSignature(state, options) { return closureSignature(state, options); }
  function changed(before, after, options) { return stateSignature(before, options || {}) !== stateSignature(after, options || {}); }

  function rawUnits(state, options) {
    const units = [];
    const files = filesOf(state);
    const internal = internalOf(state);
    mathLines(options || {}).forEach(formula => units.push({ kind: 'formula', id: 'formula:' + formula, formula }));
    sortedKeys(files).forEach(path => units.push({ kind: 'file', id: 'file:' + path, path, size: text(files[path]).length, digest: hash(files[path]) }));
    A(internal.symbols).forEach(symbol => units.push({ kind: 'symbol', id: 'symbol:' + text(symbol), value: text(symbol) }));
    A(internal.relations).forEach(relation => units.push({ kind: 'relation', id: 'relation:' + hash(stable(relation)), relation }));
    A(internal.expressions).forEach(expression => units.push({ kind: 'expression', id: 'expression:' + hash(stable(expression)), expression }));
    return units;
  }

  function units(state, options) {
    const seen = new Set();
    return rawUnits(state, options || {}).filter(unit => {
      const sig = stable(unit);
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    }).sort((a, b) => unitId(a).localeCompare(unitId(b)));
  }

  function relationRowsFor(q, state) {
    const id = unitId(q);
    const value = text(q && (q.value || q.path || q.formula || q.kind || id));
    return A(internalOf(state).relations).filter(r => stable(r).indexOf(id) >= 0 || (value && stable(r).indexOf(value) >= 0)).map(r => ({ id: 'relation:' + hash(stable(r)), relation: r })).sort((a, b) => a.id.localeCompare(b.id));
  }

  function constraintsFor(q, state, options) {
    const kind = text(q && q.kind || 'unit');
    const base = ['One', 'Closure', 'Proof', 'UnknownPreservation', 'Reduction'];
    if (kind === 'candidate') return base.concat(['Admission', 'Growth', 'ExpressionValidity']);
    if (kind === 'expression') return base.concat(['Focus', 'ExpressionValidity']);
    if (kind === 'relation') return base.concat(['EqB', 'Reduction']);
    if (kind === 'formula') return ['CanonicalMath', 'Proof'];
    if (kind === 'file') return base.concat(q.path === CANONICAL_MATH_PATH ? ['CanonicalMath'] : ['SourceIdentity']);
    return base;
  }

  function focus(state, q) {
    const id = unitId(q);
    return { scope: 'B', unit: id, source_paths: sortedKeys(filesOf(state)).filter(path => path === CANONICAL_MATH_PATH || text(filesOf(state)[path]).indexOf(id.replace(/^symbol:/, '')) >= 0).slice(0, 16) };
  }

  function proofOf(q, state, options) {
    const one = verifyCanonicalMathState(state, options || {});
    const kind = text(q && q.kind || 'unit');
    const unsafe_path = kind === 'candidate' && A(q.operations).some(op => text(op && op.path).indexOf('..') >= 0);
    const ok = one.ok && !unsafe_path;
    return { ok, source: one.ok, unsafe_path };
  }

  function stabilityOf(q, state, options) {
    const proof = proofOf(q, state, options || {});
    const relations = relationRowsFor(q, state);
    const constraints = constraintsFor(q, state, options || {});
    const relation_stability_known = q && (q.kind === 'formula' || q.kind === 'file' || relations.length > 0 || unitId(q).indexOf('candidate:') === 0);
    const ok = proof.ok && constraints.length > 0 && relation_stability_known;
    return { ok, proof, relation_stability_known, relation_count: relations.length, constraints };
  }

  function unknownOf(q, state, options) {
    const stability = stabilityOf(q, state, options || {});
    const unresolved = [];
    if (!stability.proof.ok) unresolved.push('proof_not_established');
    if (!stability.relation_stability_known) unresolved.push('relation_stability_absent');
    if (!stability.constraints.length) unresolved.push('constraints_absent');
    return { ok: unresolved.length > 0, unresolved, stable: stability.ok };
  }

  function defineUnit(q, state, options) {
    const unit = O(q);
    const id = unitId(unit);
    const proof = proofOf(unit, state, options || {});
    const unknown = unknownOf(unit, state, options || {});
    const rels = relationRowsFor(unit, state).map(r => r.id);
    const transformation = unit.kind === 'candidate'
      ? { operations: A(unit.operations).map(op => ({ type: op && (op.type || op.op) || 'replace', path: op && op.path || null, digest: hash(stable(op)) })), event_kinds: A(unit.events).map(e => e && e.candidate_kind || e && e.kind || null).filter(Boolean) }
      : { digest: unit.digest || hash(stable(unit)), size: unit.size || null };
    const definition = {
      U: { id, kind: unit.kind || 'unit' },
      R: rels,
      T: transformation,
      C: constraintsFor(unit, state, options || {}),
      Om: unknown,
      Phi: focus(state, unit),
      P: proof,
      G: unit.kind === 'candidate' ? { status: 'candidate_growth_evaluated_by_transition' } : { status: 'resident' }
    };
    return definition;
  }

  function definitionSignature(definition) { return hash(stable(definition)); }

  function closure(state, options) {
    if (state && state.packet_type === '42ndMind_math_law_closure_v0_1') return clone(state);
    const us = units(state, options || {});
    const definitions = us.map(unit => ({ id: unitId(unit), definition: defineUnit(unit, state, options || {}), signature: definitionSignature(defineUnit(unit, state, options || {})) })).sort((a, b) => a.id.localeCompare(b.id));
    return { packet_type: '42ndMind_math_law_closure_v0_1', version: VERSION, math_version: mathVersion(options || {}), canonical_path: CANONICAL_MATH_PATH, source_signature: hash(stable(sortedKeys(filesOf(state)).map(path => [path, hash(filesOf(state)[path])]))), units: us.map(unit => ({ id: unitId(unit), kind: unit.kind })), definitions };
  }

  function closureSignature(state, options) { return hash(stable(closure(state, options || {}))); }

  function verifyClosureIdempotence(state, options) {
    const once = closure(state, options || {});
    const twice = closure(once, options || {});
    const once_sig = closureSignature(once, options || {});
    const twice_sig = closureSignature(twice, options || {});
    return { ok: once_sig === twice_sig, once_sig, twice_sig };
  }

  function candidateAsInput(candidate) {
    const c = O(candidate);
    return { kind: 'candidate', id: 'candidate:' + text(c.id || c.candidate_id || c.packet_type || c.mode || hash(stable(c))), operations: A(c.operations), events: A(c.events), summary: { packet_type: c.packet_type || null, generated_count: c.generated_count || 0, moved: !!c.moved, internal_growth: !!c.internal_growth, virtual_state_growth: !!c.virtual_state_growth, blocked_by_math_law: !!c.blocked_by_math_law } };
  }

  function candidateAfterState(before, candidate) {
    const c = O(candidate);
    return c.after_state || c.after || c.state || before;
  }

  function verifyAdmission(before, candidate, after, options) {
    const q = candidateAsInput(candidate);
    const next = after || candidateAfterState(before, candidate);
    const one = verifyOne(next, options || {});
    return { ok: one.ok, admitted: one.ok, q, after_is_one: one.ok, one };
  }

  function equivalentExistingUnit(q, state, options) {
    const qSig = definitionSignature(defineUnit(q, state, options || {}));
    const match = units(state, options || {}).map(unit => ({ unit, signature: definitionSignature(defineUnit(unit, state, options || {})) })).find(row => row.signature === qSig);
    return match ? { ok: true, unit: match.unit, signature: match.signature } : { ok: false, signature: qSig };
  }

  function eqB(a, b, state, options) { return definitionSignature(defineUnit(a, state, options || {})) === definitionSignature(defineUnit(b, state, options || {})); }

  function collapseEquivalentUnits(inputUnits, state, options) {
    const groups = {};
    A(inputUnits).forEach(unit => {
      const sig = definitionSignature(defineUnit(unit, state, options || {}));
      if (!groups[sig]) groups[sig] = [];
      groups[sig].push(unit);
    });
    const collapsed = Object.keys(groups).sort().map(sig => groups[sig][0]);
    return { units: collapsed, duplicate_count: A(inputUnits).length - collapsed.length, group_count: collapsed.length, groups };
  }

  function verifyEquivalenceCollapse(before, after, options) {
    const target = after || before;
    const us = rawUnits(target, options || {});
    const once = collapseEquivalentUnits(us, target, options || {});
    const twice = collapseEquivalentUnits(once.units, target, options || {});
    const ok = stable(once.units.map(unitId).sort()) === stable(twice.units.map(unitId).sort()) && twice.duplicate_count === 0;
    return { ok, duplicate_count: once.duplicate_count, group_count: once.group_count, unit_count: us.length };
  }

  function red(state, options) {
    const raw = rawUnits(state, options || {});
    const collapsed = collapseEquivalentUnits(raw, state, options || {});
    const original_count = raw.length;
    const reduced_count = collapsed.units.length;
    return { packet_type: '42ndMind_math_law_reduction_v0_1', version: VERSION, original_count, reduced_count, duplicate_count: original_count - reduced_count, reduction_ratio: original_count ? Number(((original_count - reduced_count) / original_count).toFixed(6)) : 0, norm_preserved: verifyOne(state, options || {}).ok, units: collapsed.units.map(unit => ({ id: unitId(unit), kind: unit.kind })) };
  }

  function reducedState(state, options) {
    const next = clone(state || {}) || {};
    const internal = O(next.internal_state);
    internal.symbols = unique(internal.symbols);
    internal.relations = Array.from(new Map(A(internal.relations).map(row => [hash(stable(row)), row])).values());
    internal.expressions = Array.from(new Map(A(internal.expressions).map(row => [hash(stable(row)), row])).values());
    internal.virtual_edits = Array.from(new Map(A(internal.virtual_edits).map(row => [hash(stable(row)), row])).values());
    next.internal_state = internal;
    next.reduction = red(next, options || {});
    return next;
  }

  function verifyReductionNorm(state, options) {
    const r = red(state, options || {});
    return { ok: r.norm_preserved && r.reduced_count <= r.original_count, reduction: r };
  }

  function unknownSet(state, options) {
    const rows = units(state, options || {}).map(unit => ({ id: unitId(unit), signature: definitionSignature(defineUnit(unit, state, options || {})), unknown: unknownOf(unit, state, options || {}) })).filter(row => row.unknown.ok);
    return rows;
  }

  function preservesUnknown(before, after, options) {
    const beforeUnknown = unknownSet(before, options || {});
    const afterUnknown = unknownSet(after || before, options || {});
    const afterIds = new Set(afterUnknown.map(row => row.id));
    const afterSigs = new Set(afterUnknown.map(row => row.signature));
    const lost = beforeUnknown.filter(row => !afterIds.has(row.id) && !afterSigs.has(row.signature));
    return { ok: lost.length === 0, before_unknown: beforeUnknown.length, after_unknown: afterUnknown.length, lost };
  }

  function verifyNoGrowthNoChange(before, candidate, after, options) {
    const q = candidateAsInput(candidate);
    const growth = isGrowth(q, before, after, options || {});
    const didChange = changed(before, after, options || {});
    return { ok: growth.ok || !didChange, no_growth: !growth.ok, changed: didChange, growth };
  }

  function isGrowth(q, before, after, options) {
    const candidate = q && q.kind === 'candidate' ? q : candidateAsInput(q);
    const admission = verifyAdmission(before, candidate, after, options || {});
    const didChange = changed(before, after, options || {});
    const eqExisting = equivalentExistingUnit(candidate, before, options || {});
    const unknown = preservesUnknown(before, after, options || {});
    const beforeOne = verifyOne(before, options || {});
    const afterOne = verifyOne(after, options || {});
    const improves_or_preserves_law = beforeOne.ok ? afterOne.ok : afterOne.ok === beforeOne.ok;
    const ok = admission.ok && didChange && !eqExisting.ok && unknown.ok && improves_or_preserves_law;
    return { ok, admissible: admission.ok, changed: didChange, equivalent_existing: eqExisting.ok, improves_or_preserves_law, unknown_preserved: unknown.ok, admission, equivalent: eqExisting, unknown };
  }

  function expressionOf(state, phi) { return { kind: 'expression', id: 'expression:' + hash(stable(phi)), phi: focus(state, phi), value: phi }; }

  function validExpression(expr, state, options) {
    const e = O(expr);
    const one = verifyOne(state, options || {});
    const sig = stable(e.value || e.expression || e);
    const files = filesOf(state);
    const internal = internalOf(state);
    const inside = sig === '{}' || Object.keys(files).some(path => stable(files[path]).indexOf(text(e.value || e.expression || e.id || '')) >= 0) || A(internal.expressions).some(row => stable(row) === stable(e.value || e.expression || e)) || unitId(e).indexOf('expression:') === 0;
    const norm = one.ok;
    const proof = proofOf(e, state, options || {});
    return { ok: !!inside && norm && proof.ok, sub: !!inside, norm, proof: proof.ok };
  }

  function verifyExpressionValidity(state, options) {
    const expressions = A(internalOf(state).expressions);
    const rows = expressions.length ? expressions.map(expr => validExpression({ kind: 'expression', expression: expr, value: expr }, state, options || {})) : [validExpression(expressionOf(state, 'B'), state, options || {})];
    return { ok: rows.every(row => row.ok), checked: rows.length, rows };
  }

  function verifyOne(state, options) {
    const canonical = verifyCanonicalMathState(state, options || {});
    return { ok: canonical.ok, canonical };
  }

  function verifyActive(before, candidate, after, options) {
    const one = verifyOne(after || before, options || {});
    const admission = candidate ? verifyAdmission(before, candidate, after, options || {}) : { ok: true, admitted: true };
    return { ok: one.ok && admission.ok, one, admission };
  }

  function verifyLiving(before, candidate, after, options) {
    const target = after || before;
    const active = verifyActive(before || target, candidate || null, target, options || {});
    const unknown = before ? preservesUnknown(before, target, options || {}) : { ok: true };
    const equivalence = verifyEquivalenceCollapse(before || target, target, options || {});
    const reduction = verifyReductionNorm(target, options || {});
    const growth = candidate ? isGrowth(candidateAsInput(candidate), before || target, target, options || {}) : { ok: true };
    const expression = verifyExpressionValidity(target, options || {});
    return { ok: active.ok && unknown.ok && equivalence.ok && reduction.ok && growth.ok && expression.ok, active, unknown, equivalence, reduction, growth, expression };
  }

  function falseReason(report) {
    const order = ['One', 'Closure', 'Admission', 'UnknownPreservation', 'EquivalenceCollapse', 'Reduction', 'Growth', 'ExpressionValidity', 'Active', 'Living'];
    const key = order.find(k => report[k] === false);
    return key ? key + '_invariant_failed' : null;
  }

  function evaluateState(state, options) {
    const one = verifyOne(state, options || {});
    const closureReport = verifyClosureIdempotence(state, options || {});
    const equivalence = verifyEquivalenceCollapse(state, state, options || {});
    const reduction = verifyReductionNorm(state, options || {});
    const expression = verifyExpressionValidity(state, options || {});
    const active = verifyActive(state, null, state, options || {});
    const living = { ok: one.ok && closureReport.ok && equivalence.ok && reduction.ok && expression.ok && active.ok };
    const report = {
      packet_type: '42ndMind_math_law_invariant_report_v0_1',
      version: VERSION,
      theorem_prover: false,
      invariant_prover: true,
      math_version: mathVersion(options || {}),
      One: one.ok,
      Closure: closureReport.ok,
      Admission: true,
      UnknownPreservation: true,
      EquivalenceCollapse: equivalence.ok,
      Reduction: reduction.ok,
      Growth: true,
      ExpressionValidity: expression.ok,
      Active: active.ok,
      Living: living.ok,
      one,
      closure: closureReport,
      equivalence,
      reduction: reduction.reduction,
      expression,
      active,
      living
    };
    report.ok = report.One && report.Closure && report.EquivalenceCollapse && report.Reduction && report.ExpressionValidity && report.Active && report.Living;
    report.blocked_reason = report.ok ? null : falseReason(report);
    return report;
  }

  function evaluateTransition(before, candidate, after, options) {
    const target = after || candidateAfterState(before, candidate);
    const one = verifyOne(target, options || {});
    const closureReport = verifyClosureIdempotence(target, options || {});
    const admission = verifyAdmission(before, candidate, target, options || {});
    const unknown = preservesUnknown(before, target, options || {});
    const equivalence = verifyEquivalenceCollapse(before, target, options || {});
    const reduction = verifyReductionNorm(target, options || {});
    const growth = isGrowth(candidateAsInput(candidate), before, target, options || {});
    const noGrowth = verifyNoGrowthNoChange(before, candidate, target, options || {});
    const expression = verifyExpressionValidity(target, options || {});
    const active = verifyActive(before, candidate, target, options || {});
    const living = verifyLiving(before, candidate, target, options || {});
    const didChange = changed(before, target, options || {});
    const report = {
      packet_type: '42ndMind_math_law_transition_invariant_report_v0_1',
      version: VERSION,
      theorem_prover: false,
      invariant_prover: true,
      math_version: mathVersion(options || {}),
      changed: didChange,
      One: one.ok,
      Closure: closureReport.ok,
      Admission: admission.ok,
      UnknownPreservation: unknown.ok,
      EquivalenceCollapse: equivalence.ok,
      Reduction: reduction.ok,
      Growth: growth.ok,
      NoGrowthNoChange: noGrowth.ok,
      ExpressionValidity: expression.ok,
      Active: active.ok,
      Living: living.ok,
      one,
      closure: closureReport,
      admission,
      unknown,
      equivalence,
      reduction: reduction.reduction,
      growth,
      no_growth_no_change: noGrowth,
      expression,
      active,
      living
    };
    report.ok = report.One && report.Closure && report.Admission && report.UnknownPreservation && report.EquivalenceCollapse && report.Reduction && report.NoGrowthNoChange && report.ExpressionValidity && report.Active && report.Living;
    report.blocked_reason = report.ok ? null : falseReason(report) || (report.NoGrowthNoChange ? null : 'no_growth_no_change_failed');
    return report;
  }

  return Object.freeze({
    VERSION,
    EXPECTED_MATH_VERSION,
    CANONICAL_MATH_PATH,
    REQUIRED,
    stable,
    hash,
    verifyCanonicalMathState,
    verifyOne,
    closure,
    closureSignature,
    verifyClosureIdempotence,
    candidateAsInput,
    candidateAfterState,
    verifyAdmission,
    defineUnit,
    definitionSignature,
    stabilityOf,
    unknownOf,
    preservesUnknown,
    eqB,
    collapseEquivalentUnits,
    verifyEquivalenceCollapse,
    red,
    reducedState,
    verifyReductionNorm,
    isGrowth,
    verifyNoGrowthNoChange,
    focus,
    expressionOf,
    validExpression,
    verifyExpressionValidity,
    verifyActive,
    verifyLiving,
    evaluateState,
    evaluateTransition
  });
});
