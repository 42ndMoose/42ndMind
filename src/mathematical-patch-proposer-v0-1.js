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
    { id: 'unit_normalize', symbol: 'Π:unit:normalize', w: 0.055, needle: 'normalize', file: 'src/math-language-kernel-v0-1.js', class: 'operator' },
    { id: 'unit_l1', symbol: 'Π:unit:l1', w: 0.045, needle: 'l1', file: 'src/math-language-kernel-v0-1.js', class: 'operator' },
    { id: 'kernel_packet', symbol: 'Π:kernel:packet', w: 0.045, needle: 'packet', file: 'src/math-language-kernel-v0-1.js', class: 'operator' },

    { id: 'discovery_observe', symbol: 'Π:discovery:observe', w: 0.050, needle: 'observe', file: 'src/discovery-core-v0-1.js', class: 'operator' },
    { id: 'discovery_birth', symbol: 'Π:discovery:birth', w: 0.050, needle: 'birth', file: 'src/discovery-core-v0-1.js', class: 'operator' },
    { id: 'discovery_unknown', symbol: 'Π:discovery:unknown', w: 0.040, needle: 'υ?', file: 'src/discovery-core-v0-1.js', class: 'invariant' },

    { id: 'sandbox_simulate', symbol: 'Π:sandbox:simulate', w: 0.060, needle: 'simulate', file: 'src/source-sandbox-v0-1.js', class: 'operator' },
    { id: 'sandbox_virtual', symbol: 'Π:sandbox:virtual', w: 0.045, needle: 'virtual', file: 'src/source-sandbox-v0-1.js', class: 'invariant' },
    { id: 'sandbox_reject', symbol: 'Π:sandbox:reject', w: 0.045, needle: 'rejected', file: 'src/source-sandbox-v0-1.js', class: 'invariant' },

    { id: 'math_patch_propose', symbol: 'Π:patch:propose', w: 0.060, needle: 'propose', file: 'src/mathematical-patch-proposer-v0-1.js', class: 'operator' },
    { id: 'math_patch_field', symbol: 'Π:patch:field', w: 0.050, needle: 'ΩΠ', file: 'src/mathematical-patch-proposer-v0-1.js', class: 'invariant' },
    { id: 'math_patch_decision', symbol: 'Π:patch:decision', w: 0.050, needle: 'decision', file: 'src/mathematical-patch-proposer-v0-1.js', class: 'operator' },

    { id: 'self_edit_whole', symbol: 'Π:self:whole', w: 0.055, needle: 'wholeState', file: 'src/self-edit-loop-v0-1.js', class: 'operator' },
    { id: 'self_edit_run', symbol: 'Π:self:run', w: 0.055, needle: 'run', file: 'src/self-edit-loop-v0-1.js', class: 'operator' },
    { id: 'self_edit_math_patch', symbol: 'Π:self:math_patch', w: 0.045, needle: 'math_patch', file: 'src/self-edit-loop-v0-1.js', class: 'invariant' },

    { id: 'parser_parse', symbol: 'Π:parser:parse', w: 0.040, needle: 'parse', file: 'src/language-parser-v0-1.js', class: 'operator' },
    { id: 'parser_serialize', symbol: 'Π:parser:serialize', w: 0.040, needle: 'serialize', file: 'src/language-parser-v0-1.js', class: 'operator' },
    { id: 'parser_roundtrip', symbol: 'Π:parser:roundtrip', w: 0.050, needle: 'roundTrip', file: 'src/language-parser-v0-1.js', class: 'operator' },

    { id: 'nested_relation_depth', symbol: 'Π:nested:depth', w: 0.045, needle: 'relationDepth', file: 'src/nested-relation-core-v0-1.js', class: 'operator' },
    { id: 'nested_roundtrip', symbol: 'Π:nested:roundtrip', w: 0.040, needle: 'roundTrip', file: 'src/nested-relation-core-v0-1.js', class: 'operator' },
    { id: 'nested_cycle', symbol: 'Π:nested:cycle', w: 0.040, needle: 'cycle', file: 'src/nested-relation-core-v0-1.js', class: 'invariant' },

    { id: 'truth_compute', symbol: 'Π:truth:compute', w: 0.050, needle: 'compute', file: 'src/truth-accounting-core-v0-1.js', class: 'operator' },
    { id: 'truth_gate', symbol: 'Π:truth:gate', w: 0.060, needle: 'truth_gate', file: 'src/truth-accounting-core-v0-1.js', class: 'invariant' },
    { id: 'truth_unknown', symbol: 'Π:truth:unknown', w: 0.040, needle: 'υ?', file: 'src/truth-accounting-core-v0-1.js', class: 'invariant' },

    { id: 'conformance_valid', symbol: 'Π:conf:valid', w: 0.035, needle: 'validPackets', file: 'tests/fixtures/language-v0-1/conformance-fixtures.json', class: 'fixture' },
    { id: 'conformance_invalid', symbol: 'Π:conf:invalid', w: 0.035, needle: 'invalidPackets', file: 'tests/fixtures/language-v0-1/conformance-fixtures.json', class: 'fixture' }
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
    return A(axes || REQUIRED_AXES).map(rule => {
      const exists = has(files, rule.file);
      const content = source(files, rule.file);
      const satisfied = exists && content.indexOf(rule.needle) >= 0;
      return Object.assign({}, rule, {
        exists,
        satisfied,
        gap: satisfied ? 0 : 1,
        reason: !exists ? 'missing_file' : 'missing_required_' + (rule.class || 'operator')
      });
    });
  }

  function fields(inspected) {
    const Γ = normalize(A(inspected).filter(g => g.gap > 0).map(g => ({ σ: 'Γ:' + g.id + ':' + g.reason, w: g.w || 1 })), 'Γ0');
    const Π = normalize(A(inspected).map(g => ({ σ: g.symbol, w: g.gap > 0 ? (g.w || 1) : 0.0001 })), 'Π0');
    const ΩΠ = normalize([
      ['ΩΠ:gaps', l1(Γ)],
      ['ΩΠ:patch', l1(Π)],
      ['ΩΠ:closure', A(inspected).every(g => g.gap === 0) ? 1 : 0.0001]
    ], 'ΩΠ∅');
    return { Γ, Π, ΩΠ };
  }

  function scaffoldSource(gap) {
    const fn = gap.needle.replace(/[^a-z0-9_]/gi, '_') || 'operator';
    return "(function(root, factory) {\n" +
      "  if (typeof module === 'object' && module.exports) module.exports = factory();\n" +
      "  else root.FortySecondMindMathematicalPatchScaffold = factory();\n" +
      "})(typeof globalThis !== 'undefined' ? globalThis : this, function() {\n" +
      "  'use strict';\n" +
      "  function normalize(rows) { return Array.isArray(rows) && rows.length ? rows : [{ σ: '∅', w: 1 }]; }\n" +
      "  function " + fn + "() { return true; }\n" +
      "  return Object.freeze({ VERSION: '0.1.0', normalize, " + fn + " });\n" +
      "});\n";
  }

  function scaffoldTest() {
    return "const assert = require('assert');\nassert.ok(true);\nconsole.log('PASS mathematical patch scaffold');\n";
  }

  function safeOperationForGap(files, gap) {
    if (gap.reason === 'missing_file') {
      return { type: 'create', path: gap.file, content: /^tests\//.test(gap.file) ? scaffoldTest(gap) : scaffoldSource(gap) };
    }
    return null;
  }

  function decision(gaps, operations) {
    const missingFiles = A(gaps).filter(g => g.reason === 'missing_file');
    const operatorGaps = A(gaps).filter(g => g.reason !== 'missing_file');
    if (!gaps.length) return { code: 'no_action', confidence: 1, summary: 'No mathematical patch is needed under the current declared axes.' };
    if (operatorGaps.length && !missingFiles.length) return {
      code: 'requires_implementation',
      confidence: 0.85,
      summary: 'The language has missing operators or invariants inside existing files. The patch packet identifies the exact gaps, but real implementation should not be guessed by scaffold code.'
    };
    if (missingFiles.length && operatorGaps.length) return {
      code: 'sandbox_only',
      confidence: 0.75,
      summary: 'The patch can safely scaffold missing files in the sandbox, but existing-file operator gaps still require implementation.'
    };
    return {
      code: 'sandbox_only',
      confidence: 0.9,
      summary: 'The patch can safely scaffold missing files in the sandbox. Real source still requires an external write gate.'
    };
  }

  function propose(files, options) {
    const opts = Object.assign({ axes: REQUIRED_AXES }, options || {});
    const inspected = inspect(files, opts.axes);
    const gaps = inspected.filter(item => item.gap > 0);
    const f = fields(inspected);
    const operations = gaps.map(gap => safeOperationForGap(files, gap)).filter(Boolean);
    const d = decision(gaps, operations);
    return {
      packet_type: '42ndMind_mathematical_patch_v0_1',
      version: VERSION,
      id: 'Π' + checksum(inspected).slice(0, 10),
      inspected: C(inspected),
      gaps: C(gaps),
      fields: f,
      unit: { Γ: l1(f.Γ), Π: l1(f.Π), ΩΠ: l1(f.ΩΠ), ok: Math.abs(l1(f.Γ) - 1) < EPS && Math.abs(l1(f.Π) - 1) < EPS && Math.abs(l1(f.ΩΠ) - 1) < EPS },
      decision: d,
      proposal: {
        id: 'mathematical_patch_' + checksum(gaps).slice(0, 10),
        kind: 'mathematical_patch_proposal',
        operations
      },
      ξ: ''
    };
  }

  return Object.freeze({
    VERSION,
    REQUIRED_AXES: C(REQUIRED_AXES),
    inspect,
    propose,
    decision,
    normalize,
    l1
  });
});
