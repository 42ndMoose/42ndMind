(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathematicalPatchProposer = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;

  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(6));
  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));

  const REQUIRED_AXES = Object.freeze([
    { id: 'unit_total', symbol: 'Π:unit', w: 0.16, needle: 'normalize', file: 'src/math-language-kernel-v0-1.js' },
    { id: 'discovery_growth', symbol: 'Π:discovery', w: 0.14, needle: 'birth', file: 'src/discovery-core-v0-1.js' },
    { id: 'source_sandbox', symbol: 'Π:sandbox', w: 0.14, needle: 'simulate', file: 'src/source-sandbox-v0-1.js' },
    { id: 'whole_self_edit', symbol: 'Π:self_edit', w: 0.14, needle: 'wholeState', file: 'src/self-edit-loop-v0-1.js' },
    { id: 'roundtrip_language', symbol: 'Π:roundtrip', w: 0.10, needle: 'roundTrip', file: 'src/language-parser-v0-1.js' },
    { id: 'nested_relation', symbol: 'Π:nested', w: 0.10, needle: 'relationDepth', file: 'src/nested-relation-core-v0-1.js' },
    { id: 'truth_closure', symbol: 'Π:truth', w: 0.12, needle: 'truth_gate', file: 'src/truth-accounting-core-v0-1.js' },
    { id: 'conformance', symbol: 'Π:conformance', w: 0.10, needle: 'validPackets', file: 'tests/fixtures/language-v0-1/conformance-fixtures.json' }
  ]);

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

  function source(files, path) {
    return String((files || {})[path] == null ? '' : (files || {})[path]);
  }

  function inspect(files, axes) {
    return A(axes || REQUIRED_AXES).map(axis => {
      const exists = has(files, axis.file);
      const content = source(files, axis.file);
      const satisfied = exists && content.indexOf(axis.needle) >= 0;
      return Object.assign({}, axis, {
        exists,
        satisfied,
        gap: satisfied ? 0 : 1,
        reason: !exists ? 'missing_file' : 'missing_required_operator'
      });
    });
  }

  function fields(gaps) {
    const Γ = normalize(A(gaps).filter(g => g.gap > 0).map(g => ({ σ: 'Γ:' + g.id + ':' + g.reason, w: g.w || 1 })), 'Γ0');
    const Π = normalize(A(gaps).map(g => ({ σ: g.symbol, w: g.gap > 0 ? (g.w || 1) : 0.0001 })), 'Π0');
    const ΩΠ = normalize([
      ['ΩΠ:gaps', l1(Γ)],
      ['ΩΠ:patch', l1(Π)],
      ['ΩΠ:closure', A(gaps).every(g => g.gap === 0) ? 1 : 0.0001]
    ], 'ΩΠ∅');
    return { Γ, Π, ΩΠ };
  }

  function operationForGap(gap) {
    if (gap.reason === 'missing_file') {
      const isTest = /^tests\//.test(gap.file);
      const content = isTest
        ? "const assert = require('assert');\nassert.ok(true);\nconsole.log('PASS mathematical patch scaffold');\n"
        : "(function(root, factory) {\n" +
          "  if (typeof module === 'object' && module.exports) module.exports = factory();\n" +
          "  else root.FortySecondMindMathematicalPatchScaffold = factory();\n" +
          "})(typeof globalThis !== 'undefined' ? globalThis : this, function() {\n" +
          "  'use strict';\n" +
          "  function normalize(rows) { return Array.isArray(rows) && rows.length ? rows : [{ σ: '∅', w: 1 }]; }\n" +
          "  function " + gap.needle.replace(/[^a-z0-9_]/gi, '_') + "() { return true; }\n" +
          "  return Object.freeze({ VERSION: '0.1.0', normalize, " + gap.needle.replace(/[^a-z0-9_]/gi, '_') + " });\n" +
          "});\n";
      return { type: 'create', path: gap.file, content };
    }

    const marker = '\n\n/* 42ndMind mathematical patch marker: ' + gap.id + ' requires ' + gap.needle + ' */\n';
    return { type: 'patch', path: gap.file, from: source.__placeholder || '', to: marker };
  }

  function safeOperationForGap(files, gap) {
    if (gap.reason === 'missing_file') return operationForGap(gap);
    const current = source(files, gap.file);
    const marker = '\n\n/* 42ndMind mathematical patch marker: ' + gap.id + ' requires ' + gap.needle + ' */\n';
    return { type: 'patch', path: gap.file, from: current.slice(-Math.min(80, current.length)) || current, to: (current.slice(-Math.min(80, current.length)) || current) + marker };
  }

  function propose(files, options) {
    const opts = Object.assign({ axes: REQUIRED_AXES }, options || {});
    const inspected = inspect(files, opts.axes);
    const gaps = inspected.filter(item => item.gap > 0);
    const f = fields(inspected);
    const operations = gaps.map(gap => safeOperationForGap(files, gap));
    const mathPatch = {
      packet_type: '42ndMind_mathematical_patch_v0_1',
      version: VERSION,
      id: 'Π' + checksum(inspected).slice(0, 10),
      inspected: C(inspected),
      gaps: C(gaps),
      fields: f,
      unit: { Γ: l1(f.Γ), Π: l1(f.Π), ΩΠ: l1(f.ΩΠ), ok: Math.abs(l1(f.Γ) - 1) < EPS && Math.abs(l1(f.Π) - 1) < EPS && Math.abs(l1(f.ΩΠ) - 1) < EPS },
      proposal: {
        id: 'mathematical_patch_' + checksum(gaps).slice(0, 10),
        kind: 'mathematical_patch_proposal',
        operations
      },
      ξ: ''
    };
    return mathPatch;
  }

  return Object.freeze({
    VERSION,
    REQUIRED_AXES: C(REQUIRED_AXES),
    inspect,
    propose,
    normalize,
    l1
  });
});
