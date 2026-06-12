(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathLawGate = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.1';
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

  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function text(x) { return String(x == null ? '' : x); }
  function clone(x) { return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function canon(o) { return (o && o.math) || Canon || (typeof globalThis !== 'undefined' && globalThis.OneLogicMathV1) || null; }

  function verifyMath(math) {
    const m = math || canon({});
    const F = arr(m && m.F);
    const version = m && (m.VERSION || m.M && m.M.v) || null;
    const missing = REQUIRED.filter(x => F.indexOf(x) < 0);
    const wrong_version = version !== EXPECTED_MATH_VERSION;
    return { ok: !!m && !wrong_version && missing.length === 0, version, expected_version: EXPECTED_MATH_VERSION, wrong_version, missing };
  }

  function verifySourceFiles(files) {
    const f = obj(files);
    const canonical = text(f[CANONICAL_MATH_PATH]);
    const missing_files = [];
    if (!canonical) missing_files.push(CANONICAL_MATH_PATH);
    const missing_formulas = canonical ? REQUIRED.filter(x => canonical.indexOf(x) < 0) : REQUIRED.slice();
    const banned_runtime_notation = ['B_t', 'B_t1'].filter(x => canonical.indexOf(x) >= 0);
    const ok = missing_files.length === 0 && missing_formulas.length === 0 && banned_runtime_notation.length === 0;
    return { ok, canonical_path: CANONICAL_MATH_PATH, missing_files, missing_formulas, banned_runtime_notation };
  }

  function verifyState(state, options) {
    const law = verifyMath(canon(options || {}));
    const s = obj(state);
    const files = obj(s.files);
    const internal = obj(s.internal_state);
    const source = verifySourceFiles(files);
    const has_files = Object.keys(files).length > 0;
    const has_internal_state = !!s.internal_state && typeof s.internal_state === 'object' && !Array.isArray(s.internal_state);
    const ok = law.ok && source.ok && has_files && has_internal_state;
    return {
      ok,
      version: VERSION,
      math_version: law.version,
      expected_math_version: EXPECTED_MATH_VERSION,
      law,
      source,
      One: ok,
      Active: ok,
      Living: ok,
      counts: {
        files: Object.keys(files).length,
        symbols: arr(internal.symbols).length,
        relations: arr(internal.relations).length,
        expressions: arr(internal.expressions).length,
        virtual_edits: arr(internal.virtual_edits).length
      },
      limits: {
        theorem_prover: false,
        checks_required_formula_presence: true,
        checks_source_contains_canonical_math: true,
        blocks_after_state_when_gate_fails: true,
        eqb_reduction_semantics: 'declared_by_math_not_fully_proved_here'
      }
    };
  }

  function gateCycle(before, cycle, options) {
    const o = options || {};
    const next = cycle && cycle.state || before;
    const beforeGate = verifyState(before, o);
    const afterGate = verifyState(next, o);
    const blocked = !!(beforeGate.ok && !afterGate.ok);
    const state = clone(blocked ? before : next) || {};
    const gate = blocked
      ? Object.assign({}, beforeGate, { blocked: true, blocked_reason: 'after_state_failed_math_law', rejected_after: afterGate })
      : afterGate;
    state.law_gate = gate;
    const out = Object.assign({}, cycle || {}, { law_gate: gate, blocked_by_math_law: blocked });
    out.state = state;
    return out;
  }

  return Object.freeze({ VERSION, EXPECTED_MATH_VERSION, CANONICAL_MATH_PATH, REQUIRED, verifyMath, verifySourceFiles, verifyState, gateCycle });
});
