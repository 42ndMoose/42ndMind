(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindOperatorSynthesisCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;

  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(6));
  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));

  const SIGNATURE_RULES = Object.freeze([
    { id: 'missing_module', match: 'module not found', op: 'resolve_or_create_module', target: 'source_graph', w: 0.16 },
    { id: 'missing_path', match: 'missing', op: 'path_presence_operator', target: 'source_manifest', w: 0.11 },
    { id: 'assertion_failed', match: 'AssertionError', op: 'invariant_alignment_operator', target: 'test_contract', w: 0.14 },
    { id: 'strict_equal_failed', match: 'strictEqual', op: 'expected_actual_alignment_operator', target: 'test_contract', w: 0.14 },
    { id: 'unit_failed', match: 'unit', op: 'unit_restoration_operator', target: 'field_normalization', w: 0.16 },
    { id: 'validator_failed', match: 'validator_failed', op: 'validator_repair_operator', target: 'semantic_gate', w: 0.12 },
    { id: 'syntax_error', match: 'SyntaxError', op: 'syntax_rewrite_operator', target: 'source_form', w: 0.10 },
    { id: 'type_error', match: 'TypeError', op: 'interface_completion_operator', target: 'module_interface', w: 0.07 }
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

  function text(value) {
    return typeof value === 'string' ? value : JSON.stringify(value || '');
  }

  function checksum(value) {
    const src = text(value);
    let hash = 2166136261;
    for (let i = 0; i < src.length; i += 1) {
      hash ^= src.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  function collectFailures(report) {
    const failures = [];
    A(report && report.tests).forEach(item => { if (!item.ok) failures.push({ kind: 'test', id: item.path, text: text(item.error || item.logs || item) }); });
    A(report && report.validators).forEach(item => { if (!item.ok) failures.push({ kind: 'validator', id: item.id, text: text(item.error || item) }); });
    A(report && report.chaos).forEach(item => failures.push({ kind: 'diagnostic', id: String(item), text: String(item) }));
    if (report && report.error) failures.push({ kind: 'blocked', id: 'blocked', text: text(report.error) });
    return failures;
  }

  function classifyFailure(failure) {
    const src = text(failure && failure.text);
    const matches = SIGNATURE_RULES.filter(rule => src.indexOf(rule.match) >= 0 || String(failure && failure.id || '').indexOf(rule.match) >= 0);
    if (matches.length) return matches;
    return [{ id: 'unknown_failure', match: '', op: 'unknown_gap_operator', target: 'unclassified', w: 0.05 }];
  }

  function diagnosticPath(failure) {
    const id = String(failure && failure.id || '');
    const match = /^test_failed:(.+)$/.exec(id);
    return match ? match[1] : null;
  }

  function classifiedTestPaths(classified) {
    const paths = {};
    A(classified).forEach(item => {
      if (item.failure && item.failure.kind === 'test' && item.rules.some(rule => rule.id !== 'unknown_failure')) {
        paths[item.failure.id] = true;
      }
    });
    return paths;
  }

  function classifyAll(failures) {
    const classified = A(failures).map(failure => ({ failure, rules: classifyFailure(failure) }));
    const coveredTests = classifiedTestPaths(classified);
    return classified.filter(item => {
      const path = diagnosticPath(item.failure);
      if (!path) return true;
      const onlyUnknown = item.rules.length === 1 && item.rules[0].id === 'unknown_failure';
      return !(onlyUnknown && coveredTests[path]);
    });
  }

  function synthesize(report, context) {
    const failures = collectFailures(report);
    const classified = classifyAll(failures);
    const candidates = [];
    classified.forEach(item => {
      item.rules.forEach(rule => {
        candidates.push({
          id: 'ω' + checksum({ failure: item.failure, rule }).slice(0, 10),
          rule: rule.id,
          operator: rule.op,
          target: rule.target,
          source_failure: item.failure.id,
          failure_kind: item.failure.kind,
          support: rule.w || 0.05,
          implementation_status: 'candidate_not_implemented'
        });
      });
    });

    const Ωω = normalize(candidates.map(c => ({ σ: 'Ωω:' + c.operator + ':' + c.target, w: c.support })), 'Ωω0');
    const Γω = normalize(candidates.map(c => ({ σ: 'Γω:' + c.rule, w: c.support })), 'Γω0');
    const decision = candidates.length
      ? { code: 'operator_candidates_ready', confidence: R(Math.min(0.95, 0.45 + candidates.length * 0.08)), summary: 'Failed simulations produced candidate algebraic operators. They are not source patches yet; they are operator candidates for the next sandbox proposal.' }
      : { code: 'no_failures', confidence: 1, summary: 'No failed simulation signatures were available for operator synthesis.' };

    return {
      packet_type: '42ndMind_operator_synthesis_v0_1',
      version: VERSION,
      id: 'Ωω' + checksum({ failures, classified, context }).slice(0, 10),
      failures,
      classified_failures: classified.map(item => ({ failure: item.failure, rules: item.rules.map(rule => rule.id) })),
      candidates,
      fields: { Ωω, Γω },
      unit: { Ωω: l1(Ωω), Γω: l1(Γω), ok: Math.abs(l1(Ωω) - 1) < EPS && Math.abs(l1(Γω) - 1) < EPS },
      decision,
      ξ: ''
    };
  }

  function toFixture(synthesis) {
    return {
      type: 'operator_synthesis_fixture_v0_1',
      id: synthesis && synthesis.id,
      candidates: A(synthesis && synthesis.candidates).map(c => ({ operator: c.operator, target: c.target, rule: c.rule })),
      decision: synthesis && synthesis.decision,
      ξ: ''
    };
  }

  return Object.freeze({
    VERSION,
    SIGNATURE_RULES: C(SIGNATURE_RULES),
    collectFailures,
    classifyFailure,
    classifyAll,
    synthesize,
    toFixture,
    normalize,
    l1
  });
});
