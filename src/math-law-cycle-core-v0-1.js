(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathLawCycleCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const VERSION = '0.1.1';
  let M = null, G = null, C = null, P = null;
  try { if (typeof require === 'function') M = require('./one-logic-math-v1.js'); } catch (_) {}
  try { if (typeof require === 'function') G = require('./math-law-gate-v0-1.js'); } catch (_) {}
  try { if (typeof require === 'function') C = require('./live-self-dynamics-core-v0-1.js'); } catch (_) {}
  try { if (typeof require === 'function') P = require('./math-law-invariant-prover-v0-1.js'); } catch (_) {}
  function math(o) { return (o && o.math) || M || globalThis.OneLogicMathV1; }
  function gate(o) { return (o && o.gate) || G || globalThis.FortySecondMindMathLawGate; }
  function base(o) { return (o && o.base) || C || globalThis.FortySecondMindLiveSelfDynamicsCore; }
  function prover(o) { return (o && o.prover) || P || globalThis.FortySecondMindMathLawInvariantProver; }
  function pack(o) { return { math: math(o), gate: gate(o), base: base(o), prover: prover(o) }; }
  function mark(s, o) { const x = pack(o || {}), n = JSON.parse(JSON.stringify(s || {})); n.law_gate = x.gate && x.gate.verifyState ? x.gate.verifyState(n, x) : { ok: false, theorem_prover: false, invariant_prover: false, blocked_reason: 'math_law_gate_unavailable' }; if (n.law_gate && n.law_gate.invariant_report) n.invariant_report = n.law_gate.invariant_report; return n; }
  function create(files, o) { const x = pack(o || {}); return mark(x.base.create(files, { math: x.math }), x); }
  function cycle(s, o) { const x = pack(o || {}), b = mark(s, x), c = x.base.selfCycle(b, { math: x.math }); return x.gate && x.gate.gateCycle ? x.gate.gateCycle(b, c, x) : c; }
  return Object.freeze({ VERSION, create, cycle, mark });
});
