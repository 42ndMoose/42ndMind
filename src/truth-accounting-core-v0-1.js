(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindTruthAccountingCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;

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

  function pair(okSymbol, errorSymbol, okValue, errorValue) {
    return normalize([
      { σ: okSymbol, w: Math.max(0, Number(okValue) || 0) },
      { σ: errorSymbol, w: Math.max(0, Number(errorValue) || 0) }
    ], errorSymbol);
  }

  function l1(field) {
    return R(A(field).reduce((sum, row) => sum + Math.abs(weight(row)), 0));
  }

  function m(field) {
    const out = {};
    A(field).forEach(row => { out[axis(row)] = (out[axis(row)] || 0) + weight(row); });
    return out;
  }

  function val(field, symbol) {
    return Math.max(0, Math.abs(m(field)[symbol] || 0));
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
  }

  function create(seed) {
    const s = seed || {};
    return normalizeClaim({
      packet_type: '42ndMind_truth_accounting_claim_v0_1',
      version: VERSION,
      id: String(s.id || 'θ0'),
      σ: s.σ || pair('σ✓', 'σ!', s.scope_ok == null ? 0 : s.scope_ok, s.scope_error == null ? 1 : s.scope_error),
      δ: s.δ || pair('δ✓', 'δ!', s.definition_ok == null ? 0 : s.definition_ok, s.definition_error == null ? 1 : s.definition_error),
      ο: s.ο || pair('ο✓', 'ο!', s.observation_ok == null ? 0 : s.observation_ok, s.observation_error == null ? 1 : s.observation_error),
      η: s.η || pair('η+', 'η-', s.support == null ? 0 : s.support, s.counter == null ? 1 : s.counter),
      χ: s.χ || pair('χ0', 'χ!', s.no_contradiction == null ? 0 : s.no_contradiction, s.contradiction == null ? 1 : s.contradiction),
      υ: s.υ || pair('υ0', 'υ?', s.no_unknown == null ? 0 : s.no_unknown, s.unknown == null ? 1 : s.unknown),
      μ: s.μ || pair('μ✓', 'μ!', s.measurement_ok == null ? 0 : s.measurement_ok, s.measurement_error == null ? 1 : s.measurement_error),
      θ: normalize([['θ?', 1]], 'θ?'),
      ξ: '',
      trace: []
    });
  }

  function normalizeClaim(claim) {
    claim.σ = normalize(claim.σ, 'σ!');
    claim.δ = normalize(claim.δ, 'δ!');
    claim.ο = normalize(claim.ο, 'ο!');
    claim.η = normalize(claim.η, 'η-');
    claim.χ = normalize(claim.χ, 'χ!');
    claim.υ = normalize(claim.υ, 'υ?');
    claim.μ = normalize(claim.μ, 'μ!');
    return compute(claim);
  }

  function components(claim) {
    const c = normalizeOnly(claim);
    return {
      support: R(val(c.η, 'η+')),
      counter: R(val(c.η, 'η-')),
      no_contradiction: R(val(c.χ, 'χ0')),
      contradiction: R(val(c.χ, 'χ!')),
      no_unknown: R(val(c.υ, 'υ0')),
      unknown: R(val(c.υ, 'υ?')),
      scope_ok: R(val(c.σ, 'σ✓')),
      scope_error: R(val(c.σ, 'σ!')),
      definition_ok: R(val(c.δ, 'δ✓')),
      definition_error: R(val(c.δ, 'δ!')),
      observation_ok: R(val(c.ο, 'ο✓')),
      observation_error: R(val(c.ο, 'ο!')),
      measurement_ok: R(val(c.μ, 'μ✓')),
      measurement_error: R(val(c.μ, 'μ!'))
    };
  }

  function normalizeOnly(claim) {
    const c = Object.assign({}, claim || {});
    c.σ = normalize(c.σ, 'σ!');
    c.δ = normalize(c.δ, 'δ!');
    c.ο = normalize(c.ο, 'ο!');
    c.η = normalize(c.η, 'η-');
    c.χ = normalize(c.χ, 'χ!');
    c.υ = normalize(c.υ, 'υ?');
    c.μ = normalize(c.μ, 'μ!');
    return c;
  }

  function compute(claim) {
    const c = normalizeOnly(claim);
    const p = components(c);

    const closure = R(
      p.support *
      p.no_contradiction *
      p.no_unknown *
      p.scope_ok *
      p.definition_ok *
      p.observation_ok *
      p.measurement_ok
    );

    const raw = [
      { σ: 'θT', w: closure },
      { σ: 'θC', w: p.contradiction },
      { σ: 'θU', w: p.unknown },
      { σ: 'θS', w: p.scope_error },
      { σ: 'θD', w: p.definition_error },
      { σ: 'θO', w: p.observation_error },
      { σ: 'θM', w: p.measurement_error },
      { σ: 'θK', w: p.counter }
    ];

    c.θ = normalize(raw, 'θU');
    c.unit = {
      σ: l1(c.σ), δ: l1(c.δ), ο: l1(c.ο), η: l1(c.η), χ: l1(c.χ), υ: l1(c.υ), μ: l1(c.μ), θ: l1(c.θ),
      ok: [c.σ, c.δ, c.ο, c.η, c.χ, c.υ, c.μ, c.θ].every(field => Math.abs(l1(field) - 1) < EPS)
    };
    c.components = p;
    c.closure = closure;
    c.truth_gate = {
      true: closure === 1 && val(c.θ, 'θT') === 1,
      contested: p.contradiction > 0 || p.counter > 0,
      unresolved: p.unknown > 0,
      scoped: p.scope_error === 0,
      defined: p.definition_error === 0,
      observed: p.observation_error === 0,
      measured: p.measurement_error === 0,
      english: ''
    };
    c.ξ = '';
    return c;
  }

  function fromOldTruthClaim(record) {
    const r = record || {};
    const support = clamp01(r.support_pressure || 0);
    const counter = clamp01(r.counter_pressure || 0);
    const contradiction = clamp01(r.contradiction_pressure || 0);
    const unknown = clamp01(r.unresolved_pressure == null ? 1 : r.unresolved_pressure);
    return create({
      id: r.id || r.claim_id || 'θ_old',
      support,
      counter,
      contradiction,
      unknown,
      scope_ok: 1 - unknown,
      scope_error: unknown,
      definition_ok: 1 - unknown,
      definition_error: unknown,
      observation_ok: Math.min(1, support),
      observation_error: 1 - Math.min(1, support),
      measurement_ok: Math.min(1, support),
      measurement_error: 1 - Math.min(1, support),
      no_contradiction: 1 - contradiction,
      no_unknown: 1 - unknown
    });
  }

  function assertTrue(claim) {
    const c = compute(claim);
    return c.truth_gate.true === true;
  }

  function serialize(claim) {
    const c = compute(claim);
    function f(key) {
      return key + '[' + A(c[key]).map(row => axis(row) + '=' + R(weight(row))).join(',') + ']';
    }
    return 'Θ{' + ['σ', 'δ', 'ο', 'η', 'χ', 'υ', 'μ', 'θ'].map(f).join(';') + '}';
  }

  return Object.freeze({
    VERSION,
    create,
    compute,
    components,
    fromOldTruthClaim,
    assertTrue,
    serialize,
    normalize,
    l1
  });
});
