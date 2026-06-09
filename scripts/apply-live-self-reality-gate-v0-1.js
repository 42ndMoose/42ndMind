#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'src/live-self-dynamics-core-v0-1.js');
let src = fs.readFileSync(target, 'utf8');
if (src.includes('function objectiveLanguageRealityGate(')) {
  console.log('reality gate already present');
  process.exit(0);
}
src = src.replace(
  "let Unified = null, Language = null, Direction = null;\n  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }\n  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }\n  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }",
  "let Unified = null, Language = null, Direction = null, MathKernel = null;\n  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }\n  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }\n  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }\n  try { if (typeof require === 'function') MathKernel = require('./math-language-kernel-v0-1.js'); } catch (_) { MathKernel = null; }"
);
const anchor = "function stableDiff(run) { const cycles = A(run && run.cycles); const first = cycles[0] || {}; const last = cycles[cycles.length - 1] || {}; const final = run && run.final_state || run || {}; const internal = internalState(final.internal_state || {}); return { iterations: cycles.length, stop_reason: run && run.stop_reason || null, score_delta: R(Number(run && run.final_score || final.score || 0) - Number(first.score || 0)), generated_total: cycles.reduce((sum, c) => sum + Number(c.generated_count || 0), 0), autonomous_total: cycles.reduce((sum, c) => sum + Number(c.autonomous_generated_count || 0), 0), pressure_total: cycles.reduce((sum, c) => sum + Number(c.pressure_generated_count || 0), 0), internal_growth_ticks: cycles.filter(c => c.internal_growth).length, virtual_growth_ticks: cycles.filter(c => c.virtual_state_growth).length, less_self_ticks: cycles.filter(c => c.less_self_seen).length, final_generation: internal.generation, final_symbols: internal.symbols.length, final_relations: internal.relations.length, final_virtual_edits: internal.virtual_edits.length, last_cycle: last }; }";
const gate = `

  function objectiveRealityCases() {
    return [
      { id: 'arithmetic_truth', domain: 'arithmetic', input: '2+2=4' },
      { id: 'linear_equation', domain: 'algebra', input: '2x+1=x+4' },
      { id: 'equality_transitivity', domain: 'proof', input: 'a=b, b=c therefore a=c' },
      { id: 'square_nonnegative', domain: 'ordered_field', input: 'forall x in R, x^2>=0' },
      { id: 'additive_identity', domain: 'identity', input: 'forall x in R, x+0=x' },
      { id: 'substitution_evaluation', domain: 'evaluation', input: '2x+1 with x=3' }
    ];
  }

  function objectiveLanguageRealityGate(live, options) {
    const opts = options || {};
    const cases = A(opts.reality_cases).length ? A(opts.reality_cases) : objectiveRealityCases();
    if (!MathKernel || typeof MathKernel.math !== 'function') return { packet_type: '42ndMind_objective_language_reality_gate_v0_1', ok: false, complete: false, status: 'reality_gate_unavailable', score: 0, pass_count: 0, case_count: cases.length, failures: cases, cases: [], Ξ: '' };
    const rows = cases.map(c => {
      let p;
      try { p = MathKernel.math(c.input); } catch (err) { p = { ok: false, verified: false, gap_count: 1, gaps: [{ id: 'runtime_exception', reason: String(err && err.message || err) }] }; }
      const ok = !!(p && (p.verified === true || p.ok === true));
      return { id: c.id, domain: c.domain, input: c.input, ok, ast_type: p && p.ast_type || null, closure_operator: p && p.closure_operator || null, selected_rule: p && p.selected_rule || null, gap_count: Number(p && p.gap_count || 0), gaps: A(p && p.gaps).map(g => ({ id: g.id, reason: g.reason })).slice(0, 3) };
    });
    const pass = rows.filter(r => r.ok).length;
    const score = R(pass / Math.max(1, rows.length));
    const complete = rows.length > 0 && pass === rows.length;
    return { packet_type: '42ndMind_objective_language_reality_gate_v0_1', ok: true, complete, status: complete ? 'externally_contacted_minimum_core' : 'reality_contact_incomplete', score, pass_count: pass, case_count: rows.length, failures: rows.filter(r => !r.ok), cases: rows, χ: ['objective completion requires external math contact', 'Ξ=""'], Ξ: '' };
  }`;
if (!src.includes(anchor)) throw new Error('stableDiff anchor not found');
src = src.replace(anchor, gate + '\n\n  ' + anchor);
src = src.replace(
  "const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const oct = octahedronPosition(state);",
  "const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const realityGate = objectiveLanguageRealityGate(state, options || {}); const oct = octahedronPosition(state);"
);
src = src.replace(
  "stable_score: state.score, pressure: pressureOf(reflection), pressure_differentiation: pressureDiff, octahedron_position: oct,",
  "stable_score: state.score, pressure: pressureOf(reflection), pressure_differentiation: pressureDiff, objective_reality_gate: realityGate, objective_completion_status: math.status === 'provisionally_complete' && realityGate.complete ? 'externally_contacted_minimum_core' : math.status === 'provisionally_complete' ? 'internally_complete_reality_incomplete' : 'internally_incomplete', octahedron_position: oct,"
);
src = src.replace(
  "octahedronPosition, differentiatePressureByConsequence, mathLanguageCompletion, express, stableExpression",
  "octahedronPosition, differentiatePressureByConsequence, objectiveRealityCases, objectiveLanguageRealityGate, mathLanguageCompletion, express, stableExpression"
);
fs.writeFileSync(target, src);
console.log('applied compact live self reality gate');
