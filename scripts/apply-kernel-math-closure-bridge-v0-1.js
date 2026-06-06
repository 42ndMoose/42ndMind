#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = 'src/math-language-kernel-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('let MathClosureEngine = null;')) {
  const marker = "  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));\n";
  if (!s.includes(marker)) throw new Error('kernel constant marker not found');
  s = s.replace(marker, marker + "  let MathClosureEngine = null;\n  try { if (typeof require === 'function') MathClosureEngine = require('./math-closure-engine-v0-1.js'); } catch (_) { MathClosureEngine = null; }\n\n");
}

if (!s.includes('function math(input, options) {')) {
  const marker = '  function snapshot(state) { return C(state); }\n';
  if (!s.includes(marker)) throw new Error('snapshot marker not found');
  const block = String.raw`
  function mathClosureField(closure) {
    const rows = [];
    const ok = !!(closure && closure.ok === true);
    const classification = closure && closure.classification || {};
    const obligation = closure && closure.obligation || {};
    const proof = closure && closure.proof || {};
    rows.push({ σ: ok ? 'M:verified' : 'M:gap', w: 1 });
    if (classification.anatomy_id) rows.push({ σ: 'M:anatomy:' + classification.anatomy_id, w: 0.9 });
    if (obligation.operator) rows.push({ σ: 'M:closure:' + obligation.operator, w: 0.9 });
    if (closure && closure.selected_rule) rows.push({ σ: 'M:rule:' + closure.selected_rule, w: 0.8 });
    if (proof && proof.operator) rows.push({ σ: 'M:proof:' + proof.operator, w: 0.8 });
    if (Array.isArray(closure && closure.gaps)) closure.gaps.forEach(g => rows.push({ σ: 'M:gap:' + String(g.id || 'unknown'), w: 0.7 }));
    return normalize(rows);
  }

  function math(input, options) {
    const opts = options || {};
    const engine = opts.engine || MathClosureEngine;
    if (!engine || typeof engine.close !== 'function') {
      const ΩM = normalize([{ σ: 'M:gap:closure_engine_unavailable', w: 1 }]);
      return { φ: 'M', v: VERSION, ok: false, verified: false, source: String(input == null ? '' : input), ΩM, gap_count: 1, gaps: [{ id: 'closure_engine_unavailable', reason: 'Kernel math path requires math-closure-engine-v0-1.js.' }], χ: ['M=kernel math closure packet', 'M consumes AST→anatomy→proof/closure', 'Ξ=""'], Ξ: '' };
    }
    const closure = engine.close(input);
    const ΩM = mathClosureField(closure);
    const lex = deriveLexicon([closure, { φ: 'M', ok: closure.ok === true, verified: closure.verified === true, gap_count: Array.isArray(closure.gaps) ? closure.gaps.length : 1, selected_rule: closure.selected_rule || null, Ξ: '' }]);
    return {
      φ: 'M',
      v: VERSION,
      source: String(input == null ? '' : input),
      ast_type: closure && closure.classification ? closure.classification.type : 'Unknown',
      anatomy_id: closure && closure.classification ? closure.classification.anatomy_id : null,
      closure_operator: closure && closure.obligation ? closure.obligation.operator : null,
      selected_rule: closure && closure.selected_rule || null,
      ok: !!(closure && closure.ok === true),
      verified: !!(closure && closure.verified === true),
      gap_count: Array.isArray(closure && closure.gaps) ? closure.gaps.length : 1,
      gaps: C(Array.isArray(closure && closure.gaps) ? closure.gaps : []),
      closure: C(closure),
      ΩM,
      lexicon: lex,
      u: { ΩM: l1(ΩM), ok: Math.abs(l1(ΩM) - 1) < EPS && lex.u.ok === true },
      χ: ['M=kernel math closure packet', 'M consumes AST→anatomy→proof/closure', 'M.ok iff closure.ok', 'Ξ=""'],
      Ξ: ''
    };
  }

  function completeMath(input, options) {
    const opts = options || {};
    const m = math(input, opts);
    const Ωstar = complete([m.ΩM], { steps: opts.steps || 4, registry: opts.registry || [] });
    return Object.assign({}, m, {
      φ: 'MΩ*',
      Ωstar,
      complete: m.verified === true && Ωstar.complete === true,
      χ: ['MΩ*=math(input)→Ω*', 'complete iff verified and Ω* complete', 'Ξ=""'],
      Ξ: ''
    });
  }

`;
  s = s.replace(marker, block + marker);
}

const exportOld = 'return Object.freeze({ VERSION, definitions, invariants, invariantField, validateField, create, observe, step, packet, snapshot, normalize, l1, blend, distance, entropy, discrepancy, gap, correction, canonical, equivalent, close, proveTransform, converge, ground, deriveLexicon, acceptLexeme, resolveLexeme, acceptClaim, resolveClaim, complete, rebalance, unitReport });';
const exportNew = 'return Object.freeze({ VERSION, definitions, invariants, invariantField, validateField, create, observe, step, packet, snapshot, normalize, l1, blend, distance, entropy, discrepancy, gap, correction, canonical, equivalent, close, proveTransform, converge, ground, deriveLexicon, acceptLexeme, resolveLexeme, acceptClaim, resolveClaim, complete, math, completeMath, rebalance, unitReport });';
if (s.includes(exportOld)) s = s.replace(exportOld, exportNew);

fs.writeFileSync(path, s);
console.log('kernel math closure bridge applied');
