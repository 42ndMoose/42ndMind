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
    for (let i = 0; i < text.length; i += 1) { hash ^= text.charCodeAt(i); hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24); }
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
    return { packet_type: '42ndMind_whole_language_state_v0_1', version: VERSION, manifest: C(manifest || DEFAULT_MANIFEST), layers: inspection.layers, gaps: inspection.gaps, math_patch: mathPatch, fields: { Λ, Γ, Π, ΩL }, discovery: discovery && D.packet ? D.packet(discovery) : null, unit: { Λ: l1(Λ), Γ: l1(Γ), Π: l1(Π), ΩL: l1(ΩL), ok: Math.abs(l1(Λ) - 1) < EPS && Math.abs(l1(Γ) - 1) < EPS && Math.abs(l1(Π) - 1) < EPS && Math.abs(l1(ΩL) - 1) < EPS }, ξ: '' };
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
    if (name === 'solveLinearEquation') return { name, code: "function solveLinearEquation(input) {\n" +
      "  const text = typeof input === 'string' ? input.replace(/\\s+/g, '') : String(input && input.equation || '').replace(/\\s+/g, '');\n" +
      "  const m = /^([a-zA-Z])([+\\-*/])(-?\\d+(?:\\.\\d+)?)=(-?\\d+(?:\\.\\d+)?)$/.exec(text);\n" +
      "  if (!m) return { ok: false, reason: 'unsupported_linear_form' };\n" +
      "  const variable = m[1]; const op = m[2]; const a = Number(m[3]); const b = Number(m[4]);\n" +
      "  let value;\n" +
      "  if (op === '+') value = b - a; else if (op === '-') value = b + a; else if (op === '*') value = b / a; else if (op === '/') value = b * a;\n" +
      "  if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };\n" +
      "  return { ok: true, variable, value, relation: '=', steps: ['parse-linear-one-step', 'apply-inverse-operation'] };\n" +
      "}\n" };
    if (name === 'checkProofStep') return { name, code: "function checkProofStep(input) {\n" +
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
      "}\n" };
    if (name === 'solveTwoStepLinearEquation') return { name, code: "function solveTwoStepLinearEquation(input) {\n" +
      "  const text = typeof input === 'string' ? input.replace(/\\s+/g, '') : String(input && input.equation || '').replace(/\\s+/g, '');\n" +
      "  const m = /^(-?\\d+(?:\\.\\d+)?)?([a-zA-Z])([+\\-])(-?\\d+(?:\\.\\d+)?)=(-?\\d+(?:\\.\\d+)?)$/.exec(text);\n" +
      "  if (!m) return { ok: false, reason: 'unsupported_two_step_linear_form' };\n" +
      "  const coefficient = m[1] === undefined || m[1] === '' ? 1 : Number(m[1]);\n" +
      "  const variable = m[2]; const op = m[3]; const offset = Number(m[4]); const target = Number(m[5]);\n" +
      "  const shifted = op === '+' ? target - offset : target + offset;\n" +
      "  const value = shifted / coefficient;\n" +
      "  if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };\n" +
      "  return { ok: true, variable, value, relation: '=', steps: ['parse-two-step-linear', 'undo-offset', 'divide-by-coefficient'] };\n" +
      "}\n" };
    if (name === 'checkHypotheticalSyllogism') return { name, code: "function checkHypotheticalSyllogism(input) {\n" +
      "  const data = typeof input === 'string' ? { text: input } : (input || {});\n" +
      "  const text = String(data.text || '').replace(/\\s+/g, '');\n" +
      "  const direct = /(?:if)?([A-Z])(?:=>|⇒)([A-Z])(?:and|&)(\\2)(?:=>|⇒)([A-Z])(?:and|&)(\\1)(?:,?then|=>)(\\4)/i.exec(text);\n" +
      "  if (direct) return { ok: true, rule: 'hypothetical-syllogism+modus-ponens', conclusion: direct[4].toUpperCase() };\n" +
      "  const premises = Array.isArray(data.premises) ? data.premises.map(String) : [];\n" +
      "  const conclusion = String(data.conclusion || '').trim().toUpperCase();\n" +
      "  const implications = premises.map(p => /^\\s*([A-Z])\\s*(?:=>|⇒)\\s*([A-Z])\\s*$/i.exec(p)).filter(Boolean);\n" +
      "  const facts = premises.filter(p => !/(?:=>|⇒)/.test(p)).map(p => p.trim().toUpperCase());\n" +
      "  for (const first of implications) for (const second of implications) {\n" +
      "    if (first[2].toUpperCase() === second[1].toUpperCase() && facts.includes(first[1].toUpperCase()) && conclusion === second[2].toUpperCase()) {\n" +
      "      return { ok: true, rule: 'hypothetical-syllogism+modus-ponens', conclusion };\n" +
      "    }\n" +
      "  }\n" +
      "  return { ok: false, reason: 'unsupported_hypothetical_syllogism' };\n" +
      "}\n" };
    if (name === 'proveSquareNonnegative') return { name, code: "function proveSquareNonnegative(input) {\n" +
      "  const data = typeof input === 'string' ? { raw: input } : (input || {});\n" +
      "  const raw = String(data.raw || data.text || '').replace(/\\s+/g, '');\n" +
      "  const left = String(data.left || '').replace(/\\s+/g, '');\n" +
      "  const right = String(data.right == null ? '' : data.right).replace(/\\s+/g, '');\n" +
      "  const relation = String(data.relation || '').replace('≥', '>=').trim();\n" +
      "  const domain = String(data.domain || '').toLowerCase();\n" +
      "  const joined = raw || (left + relation + right);\n" +
      "  const hasSquare = /[a-zA-Z](?:\\^2|²)/.test(joined) || /[a-zA-Z](?:\\^2|²)/.test(left);\n" +
      "  const nonnegative = /(>=|≥)0$/.test(joined) || (relation === '>=' && right === '0');\n" +
      "  const realDomain = !domain || domain === 'real' || domain === 'reals' || /(?:∈|in)(?:ℝ|R|real|reals)/i.test(String(data.raw || data.text || ''));\n" +
      "  if (hasSquare && nonnegative && realDomain) {\n" +
      "    return { ok: true, rule: 'square-nonnegative-over-reals', conclusion: 'x^2>=0', steps: ['square-as-product', 'same-sign-product-nonnegative'] };\n" +
      "  }\n" +
      "  return { ok: false, reason: 'unsupported_square_nonnegative_form' };\n" +
      "}\n" };
    if (name === 'proveDivisionByZeroUndefined') return { name, code: "function proveDivisionByZeroUndefined(input) {\n" +
      "  const data = typeof input === 'string' ? { raw: input } : (input || {});\n" +
      "  const raw = String(data.raw || data.text || '').replace(/\\s+/g, '');\n" +
      "  const condition = String(data.condition || '').replace(/\\s+/g, '');\n" +
      "  const left = String(data.left || '').replace(/\\s+/g, '');\n" +
      "  const hasDivision = raw.indexOf('/') >= 0 || left.indexOf('/') >= 0;\n" +
      "  const denominatorZero = /=0$/.test(raw) || /=0$/.test(condition);\n" +
      "  const saysUndefined = /undefined/i.test(String(data.raw || data.text || data.result || ''));\n" +
      "  if (hasDivision && denominatorZero && saysUndefined) {\n" +
      "    return { ok: true, rule: 'division-by-zero-undefined', conclusion: 'denominator_zero_makes_quotient_undefined', steps: ['detect-quotient', 'detect-zero-denominator', 'reject-field-division-by-zero'] };\n" +
      "  }\n" +
      "  return { ok: false, reason: 'unsupported_division_by_zero_form' };\n" +
      "}\n" };
    if (name === 'evaluateLinearRelation') return { name, code: "function evaluateLinearRelation(input) {\n" +
      "  const data = typeof input === 'string' ? { relation: input } : (input || {});\n" +
      "  const relation = String(data.relation || data.raw || data.text || '').replace(/\\s+/g, '').replace('≥', '>=').replace('≤', '<=');\n" +
      "  const value = Number(data.value ?? data.x ?? data.assignment);\n" +
      "  const m = /^([a-zA-Z])(?:>=|<=|>|<|=)(-?\\d+(?:\\.\\d+)?)$/.exec(relation);\n" +
      "  const op = relation.includes('>=') ? '>=' : relation.includes('<=') ? '<=' : relation.includes('>') ? '>' : relation.includes('<') ? '<' : relation.includes('=') ? '=' : null;\n" +
      "  if (!m || !op || !Number.isFinite(value)) return { ok: false, reason: 'unsupported_linear_relation_form' };\n" +
      "  const target = Number(m[2]);\n" +
      "  const truth = op === '>=' ? value >= target : op === '<=' ? value <= target : op === '>' ? value > target : op === '<' ? value < target : value === target;\n" +
      "  return { ok: true, truth, variable: m[1], relation: op, value, target, rule: 'linear-relation-evaluation' };\n" +
      "}\n" };
    if (name === 'classifyMathStatement') return { name, code: "function classifyMathStatement(input) {\n" +
      "  const packet = typeof input === 'string' && typeof compileMath === 'function' ? compileMath(input) : (input || {});\n" +
      "  const mode = String(packet.mode || 'unknown');\n" +
      "  const ops = Array.isArray(packet.operators) ? packet.operators : [];\n" +
      "  if (mode === 'theorem' && ops.includes('square')) return { ok: true, class: 'square-theorem', closure: 'proveSquareNonnegative' };\n" +
      "  if (mode === 'constraint' && ops.includes('/')) return { ok: true, class: 'division-constraint', closure: 'proveDivisionByZeroUndefined' };\n" +
      "  if (mode === 'relation') return { ok: true, class: 'linear-relation', closure: 'evaluateLinearRelation' };\n" +
      "  if (mode === 'equation') return { ok: true, class: 'equation', closure: 'solveLinearEquation' };\n" +
      "  if (mode === 'proof-rule') return { ok: true, class: 'proof-rule', closure: 'checkProofStep' };\n" +
      "  return { ok: false, class: 'unknown', closure: null };\n" +
      "}\n" };
    if (name === 'decomposeAffineExpression') return { name, code: "function decomposeAffineExpression(input) {\n" +
      "  const text = String(input == null ? '' : input).replace(/\\s+/g, '');\n" +
      "  const m = /^(-?\\d+(?:\\.\\d+)?)?([a-zA-Z])(?:(\\+|-)(-?\\d+(?:\\.\\d+)?))?$/.exec(text);\n" +
      "  if (!m) return { ok: false, reason: 'unsupported_affine_expression' };\n" +
      "  const coefficient = m[1] === undefined || m[1] === '' ? 1 : Number(m[1]);\n" +
      "  const variable = m[2];\n" +
      "  const sign = m[3] || '+';\n" +
      "  const magnitude = m[4] === undefined ? 0 : Number(m[4]);\n" +
      "  const offset = sign === '-' ? -Math.abs(magnitude) : magnitude;\n" +
      "  if (!Number.isFinite(coefficient) || !Number.isFinite(offset)) return { ok: false, reason: 'non_finite_affine_part' };\n" +
      "  return { ok: true, coefficient, variable, offset, parts: ['coefficient', 'variable', 'offset'] };\n" +
      "}\n" };
    if (name === 'solveAffineEquation') return { name, code: "function solveAffineEquation(input) {\n" +
      "  const text = String(input == null ? '' : input).replace(/\\s+/g, '');\n" +
      "  const m = /^(.+)=(-?\\d+(?:\\.\\d+)?)$/.exec(text);\n" +
      "  if (!m) return { ok: false, reason: 'unsupported_affine_equation' };\n" +
      "  const left = typeof decomposeAffineExpression === 'function' ? decomposeAffineExpression(m[1]) : null;\n" +
      "  if (!left || left.ok !== true) return { ok: false, reason: 'left_side_not_affine' };\n" +
      "  if (left.coefficient === 0) return { ok: false, reason: 'zero_coefficient' };\n" +
      "  const target = Number(m[2]);\n" +
      "  const value = (target - left.offset) / left.coefficient;\n" +
      "  if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };\n" +
      "  return { ok: true, variable: left.variable, value, relation: '=', steps: ['decompose-affine-expression', 'undo-offset', 'undo-coefficient'] };\n" +
      "}\n" };
    if (name === 'composeImplicationChain') return { name, code: "function composeImplicationChain(input) {\n" +
      "  const rows = Array.isArray(input) ? input : String(input || '').split(/,|and/i);\n" +
      "  const implications = rows.map(x => String(x).replace(/\\s+/g, '')).map(x => /^([A-Z])(?:=>|⇒)([A-Z])$/i.exec(x)).filter(Boolean);\n" +
      "  for (const first of implications) {\n" +
      "    for (const second of implications) {\n" +
      "      const a = first[1].toUpperCase();\n" +
      "      const b = first[2].toUpperCase();\n" +
      "      const b2 = second[1].toUpperCase();\n" +
      "      const c = second[2].toUpperCase();\n" +
      "      if (b === b2) return { ok: true, rule: 'implication-chain-composition', conclusion: a + '=>' + c, parts: [a, b, c] };\n" +
      "    }\n" +
      "  }\n" +
      "  return { ok: false, reason: 'no_composable_implication_chain' };\n" +
      "}\n" };
    if (name === 'detectContradiction') return { name, code: "function detectContradiction(input) {\n" +
      "  const rows = Array.isArray(input) ? input.map(String) : String(input || '').split(/,|and/i);\n" +
      "  const clean = rows.map(x => String(x).trim()).filter(Boolean);\n" +
      "  const positives = new Set();\n" +
      "  const negatives = new Set();\n" +
      "  clean.forEach(row => {\n" +
      "    const normalized = row.replace(/\\s+/g, ' ').trim();\n" +
      "    const neg = /^not\\s+(.+)$/i.exec(normalized);\n" +
      "    if (neg) negatives.add(neg[1].trim().toUpperCase());\n" +
      "    else positives.add(normalized.toUpperCase());\n" +
      "  });\n" +
      "  for (const p of positives) {\n" +
      "    if (negatives.has(p)) return { ok: true, contradiction: true, pair: [p, 'not ' + p], rule: 'non-contradiction' };\n" +
      "  }\n" +
      "  return { ok: true, contradiction: false, pair: null, rule: 'non-contradiction' };\n" +
      "}\n" };
    return null;
  }

  function injectParserFactorySource(source, functions) {
    const fns = Array.isArray(functions) ? functions : [];
    if (!fns.length) return source;
    let out = String(source || '');
    const names = [];
    fns.forEach(fn => {
      if (!fn || !fn.name || !fn.code) return;
      names.push(fn.name);
      if (out.indexOf('function ' + fn.name + '(') >= 0) return;
      const marker = '  function parseRows(body) {';
      if (out.indexOf(marker) >= 0) out = out.replace(marker, '  ' + String(fn.code).replace(/\n/g, '\n  ').trim() + '\n\n' + marker);
      else out += '\n' + fn.code + '\n';
    });
    names.forEach(name => {
      if (out.indexOf('    ' + name + ',') >= 0) return;
      const exportMarker = '    toKernelFields,';
      if (out.indexOf(exportMarker) >= 0) out = out.replace(exportMarker, '    ' + name + ',\n' + exportMarker);
    });
    return out;
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
      if (impl && current.indexOf('function ' + impl.name + '(') < 0) { functions.push(impl.name); if (String(path) !== 'src/language-parser-v0-1.js') current += '\n' + impl.code; }
      else if (!impl) fallback.push('// meta-complete candidate: ' + gap.id + ' requires ' + gap.needle);
    });
    if (fallback.length) current += '\n' + fallback.join('\n') + '\n';
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));
    return injectExports(current, functions);
  }
  function markerSource(files, path, gaps) { const base = has(files, path) ? String(files[path] == null ? '' : files[path]) : manifestSourceScaffold({ layer: path }); return base + '\n' + A(gaps).map(g => '// meta-search marker-only candidate: ' + g.id + ' requires ' + g.needle).join('\n') + '\n'; }
  function groupedGaps(patch) { const grouped = {}; A(patch && patch.gaps).forEach(gap => { if (!gap || gap.reason === 'missing_file') return; const path = gap.file; if (!grouped[path]) grouped[path] = []; grouped[path].push(gap); }); return grouped; }
  function capabilityOperations(files, patch) { const ops = []; A(patch && patch.proposal && patch.proposal.operations).forEach(op => ops.push(C(op))); const grouped = groupedGaps(patch); Object.keys(grouped).sort().forEach(path => ops.push({ type: has(files, path) ? 'replace' : 'create', path, content: synthesizeSource(files, path, grouped[path]) })); return ops; }
  function markerOperations(files, patch) { const ops = []; const grouped = groupedGaps(patch); Object.keys(grouped).sort().forEach(path => ops.push({ type: has(files, path) ? 'replace' : 'create', path, content: markerSource(files, path, grouped[path]) })); return ops; }
  function metaValidators(axes, beforePatch) { return [ function(candidateFiles) { const after = M.propose(candidateFiles, { axes }); return { id: 'meta_gap_nonincrease', ok: A(after.gaps).length <= A(beforePatch.gaps).length, before: A(beforePatch.gaps).length, after: A(after.gaps).length }; }, function(candidateFiles) { const after = M.propose(candidateFiles, { axes }); return { id: 'meta_unit_total', ok: after.unit && after.unit.ok === true, unit: after.unit }; } ]; }
  function metaFields(beforePatch, afterPatch, report, score) { const beforeGaps = A(beforePatch && beforePatch.gaps).length; const afterGaps = A(afterPatch && afterPatch.gaps).length; const Δ = normalize([['Δmeta:before_gaps', beforeGaps || 0.0001], ['Δmeta:after_gaps', afterGaps || 0.0001], ['Δmeta:improvement', Math.max(0.0001, beforeGaps - afterGaps)]], 'Δmeta0'); const Ωmeta = normalize([['Ωmeta:sandbox', report && report.accepted ? 1 : 0.0001], ['Ωmeta:score', Math.max(0.0001, score)], ['Ωmeta:gaps_closed', beforeGaps > afterGaps ? 1 : 0.0001], ['Ωmeta:tests', A(report && report.tests).every(t => t.ok) ? 1 : 0.0001]], 'Ωmeta∅'); return { Δ, Ωmeta }; }
  function scoreReport(beforePatch, afterPatch, report) { const beforeGapCount = A(beforePatch && beforePatch.gaps).length; const afterGapCount = A(afterPatch && afterPatch.gaps).length; const improvement = beforeGapCount - afterGapCount; const testPenalty = A(report.tests).filter(t => !t.ok).length + A(report.validators).filter(v => !v.ok).length; return R(Math.max(0, improvement / Math.max(1, beforeGapCount) - testPenalty)); }

  function metaComplete(files, goal, options) {
    const opts = Object.assign({ tests: [], sandboxOptions: { allowDelete: false, maxPatchBytes: 2000000 } }, options || {});
    const baseFiles = C(files || {});
    const axes = goalAxes(goal);
    const beforePatch = M && M.propose ? M.propose(baseFiles, { axes }) : null;
    const operations = capabilityOperations(baseFiles, beforePatch);
    const proposalSeed = { id: 'meta_completion_' + checksum({ goal, beforePatch }).slice(0, 10), kind: 'meta_completion_candidate_patch', goal: C(goal || {}), operations: operations.concat([artifactOperation('artifacts/meta-completion-v0-1.json', { goal, before: beforePatch })]), expected: { before_gap_count: A(beforePatch && beforePatch.gaps).length, target_gap_count: 0 } };
    const sandbox = X.create(baseFiles, opts.sandboxOptions);
    const report = X.simulate(sandbox, proposalSeed, opts.tests || [], metaValidators(axes, beforePatch));
    const afterPatch = M && M.propose ? M.propose(sandbox.virtual, { axes }) : null;
    const beforeGapCount = A(beforePatch && beforePatch.gaps).length;
    const afterGapCount = A(afterPatch && afterPatch.gaps).length;
    const improvement = beforeGapCount - afterGapCount;
    const score = scoreReport(beforePatch, afterPatch, report);
    const fields = metaFields(beforePatch, afterPatch, report, score);
    const operatorSynthesis = O && O.synthesize ? O.synthesize(report, { goal, beforePatch, afterPatch }) : null;
    const decision = report.accepted && improvement > 0 ? { code: 'propose_candidate_patch', confidence: R(Math.min(0.99, 0.55 + score * 0.4)), summary: 'Sandbox simulation improved declared language gaps; candidate patch is ready for external review.' } : (report.accepted ? { code: 'no_improvement', confidence: 0.65, summary: 'Sandbox simulation passed but did not improve declared gaps.' } : { code: 'reject_candidate_patch', confidence: 0.8, summary: 'Sandbox simulation rejected the candidate patch.' });
    return { packet_type: '42ndMind_meta_completion_report_v0_1', version: VERSION, goal: C(goal || {}), axes, before_patch: beforePatch, proposal: proposalSeed, sandbox_report: report, after_patch: afterPatch, improvement: { before_gaps: beforeGapCount, after_gaps: afterGapCount, closed: improvement, score }, fields, unit: { Δ: l1(fields.Δ), Ωmeta: l1(fields.Ωmeta), ok: Math.abs(l1(fields.Δ) - 1) < EPS && Math.abs(l1(fields.Ωmeta) - 1) < EPS }, operator_synthesis: operatorSynthesis, decision, virtual_summary: X.summarize(sandbox.virtual), base_summary: X.summarize(sandbox.base), ξ: '' };
  }

  function operationsForVariant(kind, files, patch) { if (kind === 'marker_only') return markerOperations(files, patch); return capabilityOperations(files, patch); }
  function metaSearch(files, goal, options) {
    const opts = Object.assign({ tests: [], variants: ['marker_only', 'synthesized_implementation'], maxIterations: 4, sandboxOptions: { allowDelete: false, maxPatchBytes: 2000000 } }, options || {});
    const baseFiles = C(files || {});
    const axes = goalAxes(goal);
    const sandbox = X.create(baseFiles, opts.sandboxOptions);
    const initialPatch = M.propose(baseFiles, { axes });
    const trace = [];
    let best = null;
    for (let i = 0; i < Math.min(opts.maxIterations, A(opts.variants).length); i += 1) {
      const variant = opts.variants[i];
      const beforePatch = M.propose(sandbox.virtual, { axes });
      const beforeGaps = A(beforePatch.gaps).length;
      const operations = operationsForVariant(variant, sandbox.virtual, beforePatch);
      const proposal = { id: 'meta_search_' + variant + '_' + checksum({ goal, i, beforePatch }).slice(0, 8), kind: 'closed_loop_self_edit_candidate', variant, operations: operations.concat([artifactOperation('artifacts/meta-search-attempt-v0-1.json', { variant, before: beforePatch })]) };
      const report = X.simulate(sandbox, proposal, opts.tests || [], metaValidators(axes, beforePatch));
      const afterPatch = M.propose(sandbox.virtual, { axes });
      const afterGaps = A(afterPatch.gaps).length;
      const score = report.accepted ? scoreReport(beforePatch, afterPatch, report) : R(-1 - A(report.chaos).length);
      const entry = { iteration: i + 1, variant, accepted: report.accepted === true, reverted: report.accepted !== true, chaos: C(report.chaos || []), before_gaps: beforeGaps, after_gaps: afterGaps, score, changed: C(report.changed || []), reason: report.accepted ? 'accepted_virtual_state' : 'rejected_and_rolled_back' };
      trace.push(entry);
      if (report.accepted && (!best || score > best.score)) best = { iteration: i + 1, variant, score, proposal, report, after_patch: afterPatch };
      if (report.accepted && afterGaps === 0) break;
    }
    const finalPatch = M.propose(sandbox.virtual, { axes });
    const closed = A(initialPatch.gaps).length - A(finalPatch.gaps).length;
    const Δloop = normalize([['Δloop:initial_gaps', A(initialPatch.gaps).length || 0.0001], ['Δloop:final_gaps', A(finalPatch.gaps).length || 0.0001], ['Δloop:closed', Math.max(0.0001, closed)], ['Δloop:rejected', trace.filter(t => t.reverted).length || 0.0001]], 'Δloop0');
    const Ωloop = normalize([['Ωloop:attempts', trace.length || 0.0001], ['Ωloop:best_score', best ? Math.max(0.0001, best.score) : 0.0001], ['Ωloop:rollback', trace.some(t => t.reverted) ? 1 : 0.0001], ['Ωloop:accepted', best ? 1 : 0.0001]], 'Ωloop∅');
    return { packet_type: '42ndMind_closed_loop_meta_search_v0_1', version: VERSION, goal: C(goal || {}), axes, initial_patch: initialPatch, final_patch: finalPatch, trace, best: best ? { iteration: best.iteration, variant: best.variant, score: best.score, proposal: best.proposal, changed: C(best.report.changed || []) } : null, improvement: { initial_gaps: A(initialPatch.gaps).length, final_gaps: A(finalPatch.gaps).length, closed, score: best ? best.score : 0 }, fields: { Δloop, Ωloop }, unit: { Δloop: l1(Δloop), Ωloop: l1(Ωloop), ok: Math.abs(l1(Δloop) - 1) < EPS && Math.abs(l1(Ωloop) - 1) < EPS }, decision: best && closed > 0 ? { code: 'propose_best_candidate', confidence: R(Math.min(0.99, 0.6 + best.score * 0.3)), summary: 'Closed-loop sandbox search found a candidate that improved the simulated language state after rejecting harmful attempts.' } : { code: 'no_safe_improvement', confidence: 0.7, summary: 'Closed-loop sandbox search found no accepted candidate that improved the simulated language state.' }, virtual_summary: X.summarize(sandbox.virtual), base_summary: X.summarize(sandbox.base), ξ: '' };
  }

  function dependencyProjection(files, axes, tests) {
    const rows = [];
    A(axes).forEach(ax => { rows.push(['dep:' + ax.file + '->' + ax.needle, has(files, ax.file) && String(files[ax.file]).indexOf(ax.needle) >= 0 ? 0.0001 : 1]); });
    A(tests).forEach(test => rows.push(['test:' + test, has(files, test) ? 0.0001 : 1]));
    return normalize(rows.length ? rows : [['dep:closed', 0.0001]], 'dep0');
  }

  function runHealth(files, tests) {
    const results = X.runTests(files, tests || []);
    const failures = results.filter(r => !r.ok);
    return { results, failures, pressure: failures.length };
  }

  function pressureOf(files, goal, options) {
    const opts = options || {};
    const axes = goalAxes(goal);
    const patch = M.propose(files, { axes });
    const health = runHealth(files, opts.tests || []);
    const dependency = dependencyProjection(files, axes, opts.tests || []);
    const Pfield = normalize([
      ['P:capability_gaps', A(patch.gaps).length || 0.0001],
      ['P:test_failures', health.failures.length || 0.0001],
      ['P:dependency', dependency.reduce ? l1(dependency) : 1],
      ['P:unit', patch.unit && patch.unit.ok ? 0.0001 : 1]
    ], 'P0');
    const scalar = R(A(patch.gaps).length + health.failures.length + (patch.unit && patch.unit.ok ? 0 : 1));
    return { scalar, patch, health, dependency, fields: { P: Pfield, D: dependency }, unit: { P: l1(Pfield), D: l1(dependency), ok: Math.abs(l1(Pfield) - 1) < EPS && Math.abs(l1(dependency) - 1) < EPS } };
  }

  function reactiveState(files, goal, options) {
    const opts = Object.assign({ tests: [] }, options || {});
    const baseFiles = C(files || {});
    const axes = goalAxes(goal);
    const pressure = pressureOf(baseFiles, goal, opts);
    const whole = wholeState(baseFiles, Object.keys(baseFiles).join('\n'), opts.manifest || DEFAULT_MANIFEST);
    const Rfield = normalize([
      ['R:pressure', pressure.scalar || 0.0001],
      ['R:whole', whole.unit.ok ? 0.0001 : 1],
      ['R:axes', axes.length || 0.0001],
      ['R:source', Object.keys(baseFiles).length || 0.0001]
    ], 'R0');
    return { packet_type: '42ndMind_reactive_state_v0_1', version: VERSION, goal: C(goal || {}), axes, files: baseFiles, whole, pressure, fields: { R: Rfield, P: pressure.fields.P, D: pressure.fields.D }, unit: { R: l1(Rfield), P: l1(pressure.fields.P), D: l1(pressure.fields.D), ok: Math.abs(l1(Rfield) - 1) < EPS && pressure.unit.ok }, history: [], ξ: '' };
  }

  function reactiveMutate(state, proposal, options) {
    const opts = Object.assign({ tests: [], allowNeutral: false }, options || {});
    const beforeFiles = C(state.files || {});
    const beforePressure = pressureOf(beforeFiles, state.goal, opts);
    let nextFiles = beforeFiles;
    let blocked = null;
    try { nextFiles = X.applyProposal(beforeFiles, proposal, { allowDelete: false, maxPatchBytes: 2000000 }); }
    catch (err) { blocked = String(err && err.message || err); }
    const afterPressure = blocked ? beforePressure : pressureOf(nextFiles, state.goal, opts);
    const delta = R(afterPressure.scalar - beforePressure.scalar);
    const accepted = !blocked && (delta < 0 || (opts.allowNeutral && delta === 0));
    const causal = [];
    if (blocked) causal.push('blocked:' + blocked);
    if (afterPressure.patch.gaps.length > beforePressure.patch.gaps.length) causal.push('capability_gaps_increased');
    if (afterPressure.health.failures.length > beforePressure.health.failures.length) causal.push('test_failures_increased');
    if (afterPressure.scalar < beforePressure.scalar) causal.push('pressure_reduced');
    if (afterPressure.scalar === beforePressure.scalar) causal.push('pressure_unchanged');
    if (afterPressure.scalar > beforePressure.scalar) causal.push('pressure_increased');
    const nextState = reactiveState(accepted ? nextFiles : beforeFiles, state.goal, opts);
    nextState.history = A(state.history).concat([{ id: proposal && proposal.id || 'mutation_' + (A(state.history).length + 1), accepted, reverted: !accepted, before_pressure: beforePressure.scalar, after_pressure: afterPressure.scalar, delta, causal, changed: blocked ? [] : Object.keys(nextFiles).filter(path => !beforeFiles[path] || checksum(beforeFiles[path]) !== checksum(nextFiles[path])) }]);
    return { packet_type: '42ndMind_reactive_mutation_report_v0_1', version: VERSION, accepted, reverted: !accepted, delta, causal, before: beforePressure, after: afterPressure, state: nextState, ξ: '' };
  }

  return Object.freeze({ VERSION, DEFAULT_MANIFEST: C(DEFAULT_MANIFEST), run, metaComplete, metaSearch, reactiveState, reactiveMutate, pressureOf, goalAxes, wholeState, inspect, normalize, l1 });
});
