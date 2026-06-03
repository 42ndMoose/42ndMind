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

  function axis(row) {
    if (Array.isArray(row)) return String(row[0] == null ? '∅' : row[0]);
    return String((row && (row.σ ?? row.axis ?? row.dimension)) ?? '∅');
  }

  function weight(row) {
    if (Array.isArray(row)) return Number(row[1]) || 0;
    return Number(row && (row.w ?? row.weight)) || 0;
  }

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

  function l1(field) {
    return R(A(field).reduce((sum, row) => sum + Math.abs(weight(row)), 0));
  }

  function checksum(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value || null);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  function has(files, path) {
    return Object.prototype.hasOwnProperty.call(files || {}, path);
  }

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

  function fieldForLayers(layers) {
    return normalize(A(layers).map(layer => ({ σ: 'Λ:' + layer.id + ':' + (layer.ok ? 'ok' : 'gap'), w: layer.w || 1 })), 'Λ∅');
  }

  function fieldForGaps(gaps) {
    return normalize(A(gaps).map(gap => ({ σ: 'Γ:' + gap.id, w: gap.w || 1 })), 'Γ0');
  }

  function wholeState(files, rawInput, manifest) {
    const inspection = inspect(files, manifest || DEFAULT_MANIFEST);
    const discovery = D && D.create ? D.create() : null;
    if (discovery && D.observe) D.observe(discovery, rawInput || Object.keys(files || {}).join('\n'));
    const mathPatch = M && M.propose ? M.propose(files || {}) : null;

    const Λ = fieldForLayers(inspection.layers);
    const Γ = fieldForGaps(inspection.gaps);
    const Π = mathPatch && mathPatch.fields ? mathPatch.fields.Π : normalize([['Π∅', 1]], 'Π∅');
    const ΩL = normalize([
      ['ΩL:manifest', l1(Λ)],
      ['ΩL:gaps', l1(Γ)],
      ['ΩL:math_patch', l1(Π)],
      ['ΩL:discovery', discovery && discovery.unit && discovery.unit.ok ? 1 : 0.0001],
      ['ΩL:source', Object.keys(files || {}).length || 0.0001]
    ], 'ΩL∅');

    return {
      packet_type: '42ndMind_whole_language_state_v0_1',
      version: VERSION,
      manifest: C(manifest || DEFAULT_MANIFEST),
      layers: inspection.layers,
      gaps: inspection.gaps,
      math_patch: mathPatch,
      fields: { Λ, Γ, Π, ΩL },
      discovery: discovery && D.packet ? D.packet(discovery) : null,
      unit: { Λ: l1(Λ), Γ: l1(Γ), Π: l1(Π), ΩL: l1(ΩL), ok: Math.abs(l1(Λ) - 1) < EPS && Math.abs(l1(Γ) - 1) < EPS && Math.abs(l1(Π) - 1) < EPS && Math.abs(l1(ΩL) - 1) < EPS },
      ξ: ''
    };
  }

  function validatorsForWholeState(expectedState) {
    return [
      function(files) {
        const state = wholeState(files, Object.keys(files).join('\n'), expectedState.manifest);
        return { id: 'whole_language_unit_total', ok: state.unit.ok, unit: state.unit };
      },
      function(files) {
        const missing = expectedState.manifest.filter(layer => !has(files, layer.source) || !has(files, layer.test));
        return { id: 'manifest_layers_present', ok: missing.length === 0, missing };
      },
      function(files) {
        return { id: 'self_edit_artifact_present', ok: has(files, 'artifacts/self-edit-state-v0-1.json') || has(files, 'artifacts/mathematical-patch-v0-1.json') };
      }
    ];
  }

  function testPathsForManifest(files, manifest) {
    return A(manifest || DEFAULT_MANIFEST).map(layer => layer.test).filter(path => has(files, path));
  }

  function artifactOperation(path, value) {
    return { type: 'create', path, content: JSON.stringify(value, null, 2) + '\n' };
  }

  function run(files, options) {
    const opts = Object.assign({ rawInput: '', manifest: DEFAULT_MANIFEST, sandboxOptions: { allowDelete: false, maxPatchBytes: 2000000 } }, options || {});
    const baseFiles = C(files || {});
    const state = wholeState(baseFiles, opts.rawInput || Object.keys(baseFiles).join('\n'), opts.manifest);
    const mathPatch = state.math_patch;
    const operations = (mathPatch && mathPatch.proposal && mathPatch.proposal.operations ? C(mathPatch.proposal.operations) : [])
      .concat([artifactOperation('artifacts/mathematical-patch-v0-1.json', mathPatch), artifactOperation('artifacts/self-edit-state-v0-1.json', state)]);
    const proposal = {
      id: 'whole_language_self_edit_' + checksum({ state, mathPatch }).slice(0, 10),
      kind: 'whole_language_mathematical_patch_proposal',
      math_patch_id: mathPatch && mathPatch.id,
      operations,
      expected: { language_unit: 1, gap_count: state.gaps.length, mathematical_gap_count: mathPatch ? mathPatch.gaps.length : 0 }
    };
    const sandbox = X.create(baseFiles, opts.sandboxOptions);
    const tests = opts.tests || testPathsForManifest(baseFiles, opts.manifest);
    const validators = validatorsForWholeState(state);
    const report = X.simulate(sandbox, proposal, tests, validators);
    const operatorSynthesis = O && O.synthesize ? O.synthesize(report, { state, mathPatch }) : null;
    if (operatorSynthesis) {
      sandbox.virtual['artifacts/operator-synthesis-v0-1.json'] = JSON.stringify(operatorSynthesis, null, 2) + '\n';
    }
    const truth = T && T.create ? T.create({
      support: report.accepted ? 1 : 0,
      counter: report.accepted ? 0 : 1,
      contradiction: report.accepted ? 0 : 1,
      unknown: operatorSynthesis && operatorSynthesis.candidates && operatorSynthesis.candidates.length ? 0.15 : 0,
      scope_ok: 1,
      definition_ok: 1,
      observation_ok: 1,
      measurement_ok: 1,
      no_contradiction: report.accepted ? 1 : 0,
      no_unknown: operatorSynthesis && operatorSynthesis.candidates && operatorSynthesis.candidates.length ? 0.85 : 1
    }) : null;

    return {
      packet_type: '42ndMind_self_edit_loop_report_v0_1',
      version: VERSION,
      state,
      math_patch: mathPatch,
      proposal,
      sandbox_report: report,
      operator_synthesis: operatorSynthesis,
      accepted: report.accepted === true,
      decision: operatorSynthesis && operatorSynthesis.decision && operatorSynthesis.decision.code === 'operator_candidates_ready'
        ? { code: 'operator_candidates_ready', summary: operatorSynthesis.decision.summary }
        : (mathPatch ? mathPatch.decision : null),
      truth_gate: truth ? truth.truth_gate : null,
      virtual_summary: X.summarize(sandbox.virtual),
      base_summary: X.summarize(sandbox.base),
      ξ: ''
    };
  }

  return Object.freeze({
    VERSION,
    DEFAULT_MANIFEST: C(DEFAULT_MANIFEST),
    run,
    wholeState,
    inspect,
    normalize,
    l1
  });
});
