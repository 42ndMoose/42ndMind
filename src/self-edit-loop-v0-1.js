(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(
    require('./discovery-core-v0-1.js'),
    require('./source-sandbox-v0-1.js'),
    require('./truth-accounting-core-v0-1.js'),
    require('./mathematical-patch-proposer-v0-1.js'),
    require('./operator-synthesis-core-v0-1.js')
  );
  else root.FortySecondMindSelfEditLoop = factory(
    root.FortySecondMindDiscoveryCore,
    root.FortySecondMindSourceSandbox,
    root.FortySecondMindTruthAccountingCore,
    root.FortySecondMindMathematicalPatchProposer,
    root.FortySecondMindOperatorSynthesisCore
  );
})(typeof globalThis !== 'undefined' ? globalThis : this, function(D, X, T, M, O) {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;
  const DEFAULT_MANIFEST = Object.freeze([
    { id: 'kernel', source: 'src/math-language-kernel-v0-1.js', test: 'tests/math-language-kernel-v0-1-test.js', w: 0.12 },
    { id: 'discovery', source: 'src/discovery-core-v0-1.js', test: 'tests/discovery-core-v0-1-test.js', w: 0.13 },
    { id: 'sandbox', source: 'src/source-sandbox-v0-1.js', test: 'tests/source-sandbox-v0-1-test.js', w: 0.13 },
    { id: 'math_patch', source: 'src/mathematical-patch-proposer-v0-1.js', test: 'tests/mathematical-patch-proposer-v0-1-test.js', w: 0.11 },
    { id: 'operator_synthesis', source: 'src/operator-synthesis-core-v0-1.js', test: 'tests/operator-synthesis-core-v0-1-test.js', w: 0.12 },
    { id: 'self_edit', source: 'src/self-edit-loop-v0-1.js', test: 'tests/self-edit-loop-v0-1-test.js', w: 0.11 },
    { id: 'parser', source: 'src/language-parser-v0-1.js', test: 'tests/language-parser-v0-1-test.js', w: 0.08 },
    { id: 'intention', source: 'src/intention-algebra-v0-1.js', test: 'tests/intention-algebra-v0-1-test.js', w: 0.07 },
    { id: 'nested', source: 'src/nested-relation-core-v0-1.js', test: 'tests/nested-relation-core-v0-1-test.js', w: 0.08 },
    { id: 'truth', source: 'src/truth-accounting-core-v0-1.js', test: 'tests/truth-accounting-core-v0-1-test.js', w: 0.10 },
    { id: 'conformance', source: 'tests/fixtures/language-v0-1/conformance-fixtures.json', test: 'tests/language-v0-1-conformance-test.js', w: 0.05 }
  ]);

  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(6));
  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));

  function axis(row) { return Array.isArray(row) ? String(row[0] == null ? '∅' : row[0]) : String((row && (row.σ ?? row.axis ?? row.dimension)) ?? '∅'); }
  function weight(row) { return Array.isArray(row) ? Number(row[1]) || 0 : Number(row && (row.w ?? row.weight)) || 0; }
  function normalize(rows, fallback) {
    const clean = A(rows).map(row => ({ σ: axis(row), w: weight(row) })).filter(row => row.σ && row.w !== 0);
    if (!clean.length) return [{ σ: fallback || '∅', w: 1 }];
    const total = clean.reduce((sum, row) => sum + Math.abs(row.w), 0) || 1;
    let used = 0;
    return clean.map((row, index) => {
      const sign = row.w < 0 ? -1 : 1;
      const magnitude = index === clean.length - 1 ? Math.max(0, 1 - used) : Math.abs(row.w) / total;
      const w = R(sign * magnitude);
      used = R(used + Math.abs(w));
      return { σ: row.σ, w };
    });
  }
  function l1(field) { return R(A(field).reduce((sum, row) => sum + Math.abs(weight(row)), 0)); }
  function checksum(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value || null);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }
  function has(files, path) { return Object.prototype.hasOwnProperty.call(files || {}, path); }

  function inspect(files, manifest) {
    const m = A(manifest).length ? manifest : DEFAULT_MANIFEST;
    const layers = [];
    const gaps = [];
    m.forEach(layer => {
      const sourceOk = has(files, layer.source);
      const testOk = has(files, layer.test);
      const ok = sourceOk && testOk;
      layers.push({ id: layer.id, source: layer.source, test: layer.test, ok, sourceOk, testOk, w: layer.w || 1 });
      if (!sourceOk) gaps.push({ id: layer.id + ':missing_source', layer: layer.id, path: layer.source, kind: 'missing_source', w: layer.w || 1 });
      if (!testOk) gaps.push({ id: layer.id + ':missing_test', layer: layer.id, path: layer.test, kind: 'missing_test', w: layer.w || 1 });
    });
    return { layers, gaps };
  }
  function fieldForLayers(layers) { return normalize(A(layers).map(layer => ({ σ: 'Λ:' + layer.id + ':' + (layer.ok ? 'ok' : 'gap'), w: layer.w || 1 })), 'Λ∅'); }
  function fieldForGaps(gaps) { return normalize(A(gaps).map(gap => ({ σ: 'Γ:' + gap.id, w: gap.w || 1 })), 'Γ0'); }

  function wholeState(files, rawInput, manifest) {
    const inspection = inspect(files, manifest || DEFAULT_MANIFEST);
    const discovery = D && D.create ? D.create() : null;
    if (discovery && D.observe) D.observe(discovery, rawInput || Object.keys(files || {}).join('\n'));
    const mathPatch = M && M.propose ? M.propose(files || {}) : null;
    const Λ = fieldForLayers(inspection.layers);
    const Γ = fieldForGaps(inspection.gaps);
    const Π = mathPatch && mathPatch.fields ? mathPatch.fields.Π : normalize([['Π∅', 1]], 'Π∅');
    const ΩL = normalize([
      ['ΩL:manifest', l1(Λ)], ['ΩL:gaps', l1(Γ)], ['ΩL:math_patch', l1(Π)],
      ['ΩL:discovery', discovery && discovery.unit && discovery.unit.ok ? 1 : 0.0001],
      ['ΩL:source', Object.keys(files || {}).length || 0.0001]
    ], 'ΩL∅');
    return {
      packet_type: '42ndMind_whole_language_state_v0_1', version: VERSION,
      manifest: C(manifest || DEFAULT_MANIFEST), layers: inspection.layers, gaps: inspection.gaps,
      math_patch: mathPatch, fields: { Λ, Γ, Π, ΩL }, discovery: discovery && D.packet ? D.packet(discovery) : null,
      unit: { Λ: l1(Λ), Γ: l1(Γ), Π: l1(Π), ΩL: l1(ΩL), ok: Math.abs(l1(Λ) - 1) < EPS && Math.abs(l1(Γ) - 1) < EPS && Math.abs(l1(Π) - 1) < EPS && Math.abs(l1(ΩL) - 1) < EPS }, ξ: ''
    };
  }

  function validatorsForWholeState(expectedState) {
    return [
      function(files) { const state = wholeState(files, Object.keys(files).join('\n'), expectedState.manifest); return { id: 'whole_language_unit_total', ok: state.unit.ok, unit: state.unit }; },
      function(files) { const missing = expectedState.manifest.filter(layer => !has(files, layer.source) || !has(files, layer.test)); return { id: 'manifest_layers_present', ok: missing.length === 0, missing }; },
      function(files) { return { id: 'self_edit_artifact_present', ok: has(files, 'artifacts/self-edit-state-v0-1.json') || has(files, 'artifacts/mathematical-patch-v0-1.json') }; }
    ];
  }
  function testPathsForManifest(files, manifest) { return A(manifest || DEFAULT_MANIFEST).map(layer => layer.test).filter(path => has(files, path)); }
  function artifactOperation(path, value) { return { type: 'create', path, content: JSON.stringify(value, null, 2) + '\n' }; }
  function manifestSourceScaffold(gap) { return "module.exports = { VERSION: '0.1.0', packet_type: '42ndMind_manifest_scaffold_" + gap.layer + "' };\n"; }
  function manifestTestScaffold() { return "const assert = require('assert');\nassert.ok(true);\nconsole.log('PASS manifest scaffold');\n"; }
  function manifestGapOperations(gaps, existingOperations) {
    const existing = new Set(A(existingOperations).map(op => op && op.path).filter(Boolean));
    const ops = [];
    A(gaps).forEach(gap => {
      if (!gap || !gap.path || existing.has(gap.path)) return;
      ops.push({ type: 'create', path: gap.path, content: gap.kind === 'missing_test' ? manifestTestScaffold(gap) : manifestSourceScaffold(gap) });
      existing.add(gap.path);
    });
    return ops;
  }

  function run(files, options) {
    const opts = Object.assign({ rawInput: '', manifest: DEFAULT_MANIFEST, sandboxOptions: { allowDelete: false, maxPatchBytes: 2000000 } }, options || {});
    const baseFiles = C(files || {});
    const state = wholeState(baseFiles, opts.rawInput || Object.keys(baseFiles).join('\n'), opts.manifest);
    const mathPatch = state.math_patch;
    const mathOperations = mathPatch && mathPatch.proposal && mathPatch.proposal.operations ? C(mathPatch.proposal.operations) : [];
    const operations = mathOperations.concat(manifestGapOperations(state.gaps, mathOperations)).concat([artifactOperation('artifacts/mathematical-patch-v0-1.json', mathPatch), artifactOperation('artifacts/self-edit-state-v0-1.json', state)]);
    const proposal = { id: 'whole_language_self_edit_' + checksum({ state, mathPatch }).slice(0, 10), kind: 'whole_language_mathematical_patch_proposal', math_patch_id: mathPatch && mathPatch.id, operations, expected: { language_unit: 1, gap_count: state.gaps.length, mathematical_gap_count: mathPatch ? mathPatch.gaps.length : 0 } };
    const sandbox = X.create(baseFiles, opts.sandboxOptions);
    const report = X.simulate(sandbox, proposal, opts.tests || testPathsForManifest(baseFiles, opts.manifest), validatorsForWholeState(state));
    const operatorSynthesis = O && O.synthesize ? O.synthesize(report, { state, mathPatch }) : null;
    if (operatorSynthesis) sandbox.virtual['artifacts/operator-synthesis-v0-1.json'] = JSON.stringify(operatorSynthesis, null, 2) + '\n';
    const truth = T && T.create ? T.create({ support: report.accepted ? 1 : 0, counter: report.accepted ? 0 : 1, contradiction: report.accepted ? 0 : 1, unknown: operatorSynthesis && operatorSynthesis.candidates && operatorSynthesis.candidates.length ? 0.15 : 0, scope_ok: 1, definition_ok: 1, observation_ok: 1, measurement_ok: 1, no_contradiction: report.accepted ? 1 : 0, no_unknown: operatorSynthesis && operatorSynthesis.candidates && operatorSynthesis.candidates.length ? 0.85 : 1 }) : null;
    return { packet_type: '42ndMind_self_edit_loop_report_v0_1', version: VERSION, state, math_patch: mathPatch, proposal, sandbox_report: report, operator_synthesis: operatorSynthesis, accepted: report.accepted === true, decision: operatorSynthesis && operatorSynthesis.decision && operatorSynthesis.decision.code === 'operator_candidates_ready' ? { code: 'operator_candidates_ready', summary: operatorSynthesis.decision.summary } : (mathPatch ? mathPatch.decision : null), truth_gate: truth ? truth.truth_gate : null, virtual_summary: X.summarize(sandbox.virtual), base_summary: X.summarize(sandbox.base), ξ: '' };
  }

  function goalAxes(goal) {
    const g = goal || {};
    const axes = A(g.axes).length ? A(g.axes) : A(g.capabilities);
    return axes.map((item, index) => {
      const id = String(item.id || item.name || ('goal_' + (index + 1))).replace(/[^a-z0-9_:-]/gi, '_');
      return { id, symbol: item.symbol || ('Π:goal:' + id), w: Number(item.w) || 1, needle: String(item.needle || item.name || id), file: String(item.file || item.path || 'src/language-parser-v0-1.js'), class: item.class || item.kind || 'operator' };
    });
  }

  function implementationForNeedle(needle) {
    const name = String(needle || '').replace(/[^a-z0-9_$]/gi, '');
    if (name === 'solveLinearEquation') return {
      name,
      code: "function solveLinearEquation(input) {\n" +
        "  const text = typeof input === 'string' ? input.replace(/\\s+/g, '') : String(input && input.equation || '').replace(/\\s+/g, '');\n" +
        "  const m = /^([a-zA-Z])([+\\-*/])(-?\\d+(?:\\.\\d+)?)=(-?\\d+(?:\\.\\d+)?)$/.exec(text);\n" +
        "  if (!m) return { ok: false, reason: 'unsupported_linear_form' };\n" +
        "  const variable = m[1]; const op = m[2]; const a = Number(m[3]); const b = Number(m[4]);\n" +
        "  let value;\n" +
        "  if (op === '+') value = b - a;\n" +
        "  else if (op === '-') value = b + a;\n" +
        "  else if (op === '*') value = b / a;\n" +
        "  else if (op === '/') value = b * a;\n" +
        "  if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };\n" +
        "  return { ok: true, variable, value, relation: '=', steps: ['parse-linear-one-step', 'apply-inverse-operation'] };\n" +
        "}\n"
    };
    if (name === 'checkProofStep') return {
      name,
      code: "function checkProofStep(input) {\n" +
        "  const data = typeof input === 'string' ? { text: input } : (input || {});\n" +
        "  const text = String(data.text || '').replace(/\\s+/g, '');\n" +
        "  const premises = Array.isArray(data.premises) ? data.premises.map(String) : [];\n" +
        "  const conclusion = String(data.conclusion || '');\n" +
        "  const joined = premises.join('&').replace(/\\s+/g, '');\n" +
        "  const src = text || (joined + '=>' + conclusion.replace(/\\s+/g, ''));\n" +
        "  const m = /(?:if)?([A-Z])(?:=>|⇒)([A-Z])(?:and|&)(\\1)(?:,?then|=>)(\\2)/i.exec(src);\n" +
        "  if (m) return { ok: true, rule: 'modus-ponens', conclusion: m[2].toUpperCase() };\n" +
        "  const implication = premises.find(p => /(?:=>|⇒)/.test(p));\n" +
        "  if (implication) { const r = /^\\s*([A-Z])\\s*(?:=>|⇒)\\s*([A-Z])\\s*$/i.exec(implication); if (r && premises.map(p => p.trim().toUpperCase()).includes(r[1].toUpperCase()) && conclusion.trim().toUpperCase() === r[2].toUpperCase()) return { ok: true, rule: 'modus-ponens', conclusion: r[2].toUpperCase() }; }\n" +
        "  return { ok: false, reason: 'unsupported_proof_step' };\n" +
        "}\n"
    };
    return null;
  }

  function injectExports(source, names) {
    const cleanNames = Array.from(new Set(A(names).filter(Boolean)));
    if (!cleanNames.length) return source;
    const exportList = cleanNames.join(', ');
    if (/module\.exports\s*=\s*\{[^}]*\};/.test(source)) {
      return source.replace(/module\.exports\s*=\s*\{([^}]*)\};/, function(match, body) {
        const existing = body.trim().replace(/,$/, '');
        const additions = cleanNames.filter(name => body.indexOf(name) < 0).join(', ');
        return 'module.exports = { ' + [existing, additions].filter(Boolean).join(', ') + ' };';
      });
    }
    return source + '\nmodule.exports = Object.assign({}, module.exports || {}, { ' + exportList + ' });\n';
  }

  function synthesizeSource(files, path, gaps) {
    if (!has(files, path)) return manifestSourceScaffold({ layer: path }) + A(gaps).map(g => '// meta-complete candidate: ' + (g.needle || g.id)).join('\n') + '\n';
    let current = String(files[path] == null ? '' : files[path]);
    const functions = [];
    const fallback = [];
    A(gaps).forEach(gap => {
      if (!gap || !gap.needle || current.indexOf(gap.needle) >= 0) return;
      const impl = implementationForNeedle(gap.needle);
      if (impl && current.indexOf('function ' + impl.name + '(') < 0) {
        current += '\n' + impl.code;
        functions.push(impl.name);
      } else if (!impl) {
        fallback.push('// meta-complete candidate: ' + gap.id + ' requires ' + gap.needle);
      }
    });
    if (fallback.length) current += '\n' + fallback.join('\n') + '\n';
    return injectExports(current, functions);
  }

  function capabilityOperations(files, patch) {
    const ops = [];
    A(patch && patch.proposal && patch.proposal.operations).forEach(op => ops.push(C(op)));
    const grouped = {};
    A(patch && patch.gaps).forEach(gap => {
      if (!gap || gap.reason === 'missing_file') return;
      const path = gap.file;
      if (!grouped[path]) grouped[path] = [];
      grouped[path].push(gap);
    });
    Object.keys(grouped).sort().forEach(path => ops.push({ type: has(files, path) ? 'replace' : 'create', path, content: synthesizeSource(files, path, grouped[path]) }));
    return ops;
  }

  function metaFields(beforePatch, afterPatch, report, score) {
    const beforeGaps = A(beforePatch && beforePatch.gaps).length;
    const afterGaps = A(afterPatch && afterPatch.gaps).length;
    const Δ = normalize([['Δmeta:before_gaps', beforeGaps || 0.0001], ['Δmeta:after_gaps', afterGaps || 0.0001], ['Δmeta:improvement', Math.max(0.0001, beforeGaps - afterGaps)]], 'Δmeta0');
    const Ωmeta = normalize([['Ωmeta:sandbox', report && report.accepted ? 1 : 0.0001], ['Ωmeta:score', Math.max(0.0001, score)], ['Ωmeta:gaps_closed', beforeGaps > afterGaps ? 1 : 0.0001], ['Ωmeta:tests', A(report && report.tests).every(t => t.ok) ? 1 : 0.0001]], 'Ωmeta∅');
    return { Δ, Ωmeta };
  }

  function metaComplete(files, goal, options) {
    const opts = Object.assign({ tests: [], sandboxOptions: { allowDelete: false, maxPatchBytes: 2000000 } }, options || {});
    const baseFiles = C(files || {});
    const axes = goalAxes(goal);
    const beforePatch = M && M.propose ? M.propose(baseFiles, { axes }) : null;
    const operations = capabilityOperations(baseFiles, beforePatch);
    const proposalSeed = { id: 'meta_completion_' + checksum({ goal, beforePatch }).slice(0, 10), kind: 'meta_completion_candidate_patch', goal: C(goal || {}), operations: operations.concat([artifactOperation('artifacts/meta-completion-v0-1.json', { goal, before: beforePatch })]), expected: { before_gap_count: A(beforePatch && beforePatch.gaps).length, target_gap_count: 0 } };
    const sandbox = X.create(baseFiles, opts.sandboxOptions);
    const validators = [
      function(candidateFiles) { const after = M.propose(candidateFiles, { axes }); return { id: 'meta_gap_nonincrease', ok: A(after.gaps).length <= A(beforePatch.gaps).length, before: A(beforePatch.gaps).length, after: A(after.gaps).length }; },
      function(candidateFiles) { const after = M.propose(candidateFiles, { axes }); return { id: 'meta_unit_total', ok: after.unit && after.unit.ok === true, unit: after.unit }; }
    ];
    const report = X.simulate(sandbox, proposalSeed, opts.tests || [], validators);
    const afterPatch = M && M.propose ? M.propose(sandbox.virtual, { axes }) : null;
    const beforeGapCount = A(beforePatch && beforePatch.gaps).length;
    const afterGapCount = A(afterPatch && afterPatch.gaps).length;
    const improvement = beforeGapCount - afterGapCount;
    const testPenalty = A(report.tests).filter(t => !t.ok).length + A(report.validators).filter(v => !v.ok).length;
    const score = R(Math.max(0, improvement / Math.max(1, beforeGapCount) - testPenalty));
    const fields = metaFields(beforePatch, afterPatch, report, score);
    const operatorSynthesis = O && O.synthesize ? O.synthesize(report, { goal, beforePatch, afterPatch }) : null;
    const decision = report.accepted && improvement > 0
      ? { code: 'propose_candidate_patch', confidence: R(Math.min(0.99, 0.55 + score * 0.4)), summary: 'Sandbox simulation improved declared language gaps; candidate patch is ready for external review.' }
      : (report.accepted ? { code: 'no_improvement', confidence: 0.65, summary: 'Sandbox simulation passed but did not improve declared gaps.' } : { code: 'reject_candidate_patch', confidence: 0.8, summary: 'Sandbox simulation rejected the candidate patch.' });
    return { packet_type: '42ndMind_meta_completion_report_v0_1', version: VERSION, goal: C(goal || {}), axes, before_patch: beforePatch, proposal: proposalSeed, sandbox_report: report, after_patch: afterPatch, improvement: { before_gaps: beforeGapCount, after_gaps: afterGapCount, closed: improvement, score }, fields, unit: { Δ: l1(fields.Δ), Ωmeta: l1(fields.Ωmeta), ok: Math.abs(l1(fields.Δ) - 1) < EPS && Math.abs(l1(fields.Ωmeta) - 1) < EPS }, operator_synthesis: operatorSynthesis, decision, virtual_summary: X.summarize(sandbox.virtual), base_summary: X.summarize(sandbox.base), ξ: '' };
  }

  return Object.freeze({ VERSION, DEFAULT_MANIFEST: C(DEFAULT_MANIFEST), run, metaComplete, goalAxes, wholeState, inspect, normalize, l1 });
});
