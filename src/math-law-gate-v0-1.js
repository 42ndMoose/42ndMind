(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathLawGate = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const REQUIRED = Object.freeze([
    'B=Cl(B)',
    'Cl(Cl(B))=Cl(B)',
    'One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)',
    'B[x]=Cl(union(B,{qx}))',
    'imp(Adm(x,B),One(B[x]))',
    'EqB(a,b)=eq(D(a,B),D(b,B))',
    'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))',
    'Red(B)=quot(B,EqB)',
    'imp(not(G(q,B)),B[q]=B)',
    'Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))',
    'Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))))'
  ]);

  let Canon = null;
  try { if (typeof require === 'function') Canon = require('./one-logic-math-v1.js'); } catch (_) { Canon = null; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function canon(o) { return (o && o.math) || Canon || (typeof globalThis !== 'undefined' && globalThis.OneLogicMathV1) || null; }
  function verifyMath(math) {
    const m = math || canon({});
    const F = arr(m && m.F);
    const missing = REQUIRED.filter(x => F.indexOf(x) < 0);
    return { ok: !!m && missing.length === 0, version: m && (m.VERSION || m.M && m.M.v) || null, missing };
  }
  function verifyState(state, options) {
    const law = verifyMath(canon(options || {}));
    const s = obj(state);
    const files = obj(s.files);
    const internal = obj(s.internal_state);
    const ok = law.ok && Object.keys(files).length > 0 && !!internal;
    return { ok, version: VERSION, math_version: law.version, law, One: ok, Active: ok, Living: ok, counts: { files: Object.keys(files).length, symbols: arr(internal.symbols).length, relations: arr(internal.relations).length } };
  }
  function gateCycle(before, cycle, options) {
    const next = cycle && cycle.state || before;
    const gate = verifyState(next, options || {});
    const out = Object.assign({}, cycle || {}, { law_gate: gate });
    out.state = JSON.parse(JSON.stringify(next || {}));
    out.state.law_gate = gate;
    return out;
  }
  return Object.freeze({ VERSION, REQUIRED, verifyMath, verifyState, gateCycle });
});
