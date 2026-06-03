(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(
    require('./discovery-core-v0-1.js'),
    require('./source-sandbox-v0-1.js'),
    require('./truth-accounting-core-v0-1.js')
  );
  else root.FortySecondMindSelfEditLoop = factory(
    root.FortySecondMindDiscoveryCore,
    root.FortySecondMindSourceSandbox,
    root.FortySecondMindTruthAccountingCore
  );
})(typeof globalThis !== 'undefined' ? globalThis : this, function(D, X, T) {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;

  const DEFAULT_MANIFEST = Object.freeze([
    { id: 'kernel', source: 'src/math-language-kernel-v0-1.js', test: 'tests/math-language-kernel-v0-1-test.js', w: 0.14 },
    { id: 'discovery', source: 'src/discovery-core-v0-1.js', test: 'tests/discovery-core-v0-1-test.js', w: 0.16 },
    { id: 'sandbox', source: 'src/source-sandbox-v0-1.js', test: 'tests/source-sandbox-v0-1-test.js', w: 0.16 },
    { id: 'parser', source: 'src/language-parser-v0-1.js', test: 'tests/language-parser-v0-1-test.js', w: 0.12 },
    { id: 'intention', source: 'src/intention-algebra-v0-1.js', test: 'tests/intention-algebra-v0-1-test.js', w: 0.10 },
    { id: 'nested', source: 'src/nested-relation-core-v0-1.js', test: 'tests/nested-relation-core-v0-1-test.js', w: 0.12 },
    { id: 'truth', source: 'src/truth-accounting-core-v0-1.js', test: 'tests/truth-accounting-core-v0-1-test.js', w: 0.12 },
    { id: 'conformance', source: 'tests/fixtures/language-v0-1/conformance-fixtures.json', test: 'tests/language-v0-1-conformance-test.js', w: 0.08 }
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

  function scaffoldSource(layerId) {
    return "(function(root, factory) {\n" +
      "  if (typeof module === 'object' && module.exports) module.exports = factory();\n" +
      "  else root['FortySecondMind_" + layerId.replace(/[^a-z0-9_]/gi, '_') + "'] = factory();\n" +
      "})(typeof globalThis !== 'undefined' ? globalThis : this, function() {\n" +
      "  'use strict';\n" +
      "  return Object.freeze({ VERSION: '0.1.0', packet_type: '42ndMind_scaffold_" + layerId + "' });\n" +
      "});\n";
  }

  function scaffoldTest(sourcePath) {
    return "const assert = require('assert');\n" +
      "const M = require('../" + sourcePath + "');\n" +
      "assert.ok(M);\n" +
      "assert.strictEqual(M.VERSION, '0.1.0');\n" +
      "console.log('PASS scaffold');\n";
  }

  function proposalForGaps(gaps, wholeState) {
    const operations = [];
    A(gaps).forEach(gap => {
      if (gap.kind === 'missing_source') operations.push({ type: 'create', path: gap.path, content: scaffoldSource(gap.layer) });
      if (gap.kind === 'missing_test') {
        const sourceGap = A(gaps).find(g => g.layer === gap.layer && g.kind === 'missing_source');
        const sourcePath = sourceGap ? sourceGap.path : DEFAULT_MANIFEST.find(l => l.id === gap.layer)?.source || ('src/' + gap.layer + '.js');
        operations.push({ type: 'create', path: gap.path, content: scaffoldTest(sourcePath) });
      }
    });

    const reportPath = 'artifacts/self-edit-state-v0-1.json';
    operations.push({
      type: 'create',
      path: reportPath,
      content: JSON.stringify(wholeState, null, 2) + '\n'
    });

    return {
      id: 'whole_language_self_edit_' + checksum(wholeState).slice(0, 10),
      kind: 'whole_language_batch_proposal',
      operations,
      expected: {
        language_unit: 1,
        gap_count: A(gaps).length,
        artifact: reportPath
      }
    };
  }

  function wholeState(files, rawInput, manifest) {
    const inspection = inspect(files, manifest || DEFAULT_MANIFEST);
    const discovery = D && D.create ? D.create() : null;
    if (discovery && D.observe) D.observe(discovery, rawInput || Object.keys(files || {}).join('\n'));

    const Λ = fieldForLayers(inspection.layers);
    const Γ = fieldForGaps(inspection.gaps);
    const ΩL = normalize([
      ['ΩL:manifest', l1(Λ)],
      ['ΩL:gaps', l1(Γ)],
      ['ΩL:discovery', discovery && discovery.unit && discovery.unit.ok ? 1 : 0.0001],
      ['ΩL:source', Object.keys(files || {}).length || 0.0001]
    ], 'ΩL∅');

    return {
      packet_type: '42ndMind_whole_language_state_v0_1',
      version: VERSION,
      manifest: C(manifest || DEFAULT_MANIFEST),
      layers: inspection.layers,
      gaps: inspection.gaps,
      fields: { Λ, Γ, ΩL },
      discovery: discovery && D.packet ? D.packet(discovery) : null,
      unit: { Λ: l1(Λ), Γ: l1(Γ), ΩL: l1(ΩL), ok: Math.abs(l1(Λ) - 1) < EPS && Math.abs(l1(Γ) - 1) < EPS && Math.abs(l1(ΩL) - 1) < EPS },
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
        return { id: 'self_edit_artifact_present', ok: has(files, 'artifacts/self-edit-state-v0-1.json') };
      }
    ];
  }

  function testPathsForManifest(files, manifest) {
    return A(manifest || DEFAULT_MANIFEST).map(layer => layer.test).filter(path => has(files, path));
  }

  function run(files, options) {
    const opts = Object.assign({ rawInput: '', manifest: DEFAULT_MANIFEST, sandboxOptions: { allowDelete: false, maxPatchBytes: 2000000 } }, options || {});
    const baseFiles = C(files || {});
    const state = wholeState(baseFiles, opts.rawInput || Object.keys(baseFiles).join('\n'), opts.manifest);
    const proposal = proposalForGaps(state.gaps, state);
    const sandbox = X.create(baseFiles, opts.sandboxOptions);
    const tests = opts.tests || testPathsForManifest(baseFiles, opts.manifest);
    const validators = validatorsForWholeState(state);
    const report = X.simulate(sandbox, proposal, tests, validators);
    const truth = T && T.create ? T.create({
      support: report.accepted ? 1 : 0,
      counter: report.accepted ? 0 : 1,
      contradiction: report.accepted ? 0 : 1,
      unknown: 0,
      scope_ok: 1,
      definition_ok: 1,
      observation_ok: 1,
      measurement_ok: 1,
      no_contradiction: report.accepted ? 1 : 0,
      no_unknown: 1
    }) : null;

    return {
      packet_type: '42ndMind_self_edit_loop_report_v0_1',
      version: VERSION,
      state,
      proposal,
      sandbox_report: report,
      accepted: report.accepted === true,
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
    proposalForGaps,
    normalize,
    l1
  });
});
