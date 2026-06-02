(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindIntentionAlgebra = factory();
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

  function normalize(rows) {
    const clean = A(rows).map(row => ({ σ: axis(row), w: weight(row) })).filter(row => row.σ && row.w !== 0);
    if (!clean.length) return [{ σ: 'ι∅', w: 1 }];
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

  function map(field) {
    const out = {};
    A(field).forEach(row => { out[axis(row)] = (out[axis(row)] || 0) + weight(row); });
    return out;
  }

  function mass(field, prefix) {
    const rows = A(field);
    if (!rows.length) return 0;
    const filtered = prefix == null ? rows : rows.filter(row => axis(row).startsWith(prefix));
    return R(filtered.reduce((sum, row) => sum + Math.abs(weight(row)), 0));
  }

  function hasNonEmpty(field) {
    return A(field).some(row => axis(row) !== '∅' && !axis(row).endsWith('∅'));
  }

  function get(packet, key) {
    return packet && (packet[key] || packet[String(key).toUpperCase()] || packet[String(key).toLowerCase()]) || [];
  }

  function fieldActivity(field) {
    return hasNonEmpty(field) ? l1(field) : 0;
  }

  function epsilonPressure(epsilonField) {
    const m = map(epsilonField);
    return {
      down: R(Math.abs(m['ε↓'] || m['EPSILON_DOWN'] || m['error_down'] || 0)),
      up: R(Math.abs(m['ε↑'] || m['EPSILON_UP'] || m['error_up'] || 0))
    };
  }

  function compute(packet) {
    const λ = get(packet, 'λ');
    const τ = get(packet, 'τ');
    const ρ = get(packet, 'ρ');
    const μ = get(packet, 'μ');
    const ε = get(packet, 'ε');
    const κ = get(packet, 'κ');
    const ep = epsilonPressure(ε);

    const raw = [
      { σ: 'ιτ', w: 0.18 * fieldActivity(τ) },
      { σ: 'ιρ', w: 0.16 * fieldActivity(ρ) },
      { σ: 'ιμ', w: 0.18 * fieldActivity(μ) },
      { σ: 'ιλ', w: 0.18 * fieldActivity(λ) },
      { σ: 'ιε↓', w: 0.15 * Math.max(0.0001, ep.down) },
      { σ: 'ιε↑', w: 0.10 * Math.max(0.0001, ep.up) },
      { σ: 'ικ', w: 0.05 * fieldActivity(κ) }
    ];

    const ι = normalize(raw);
    return {
      packet_type: '42ndMind_intention_algebra_v0_1',
      version: VERSION,
      formula: 'ι=N(0.18τ+0.16ρ+0.18μ+0.18λ+0.15ε↓+0.10ε↑+0.05κ)',
      field: ι,
      l1: l1(ι),
      ok: Math.abs(l1(ι) - 1) < EPS,
      inputs: {
        λ: l1(λ),
        τ: l1(τ),
        ρ: l1(ρ),
        μ: l1(μ),
        ε: l1(ε),
        κ: l1(κ),
        ε_down: ep.down,
        ε_up: ep.up
      },
      english: ''
    };
  }

  function apply(state, packet) {
    const result = compute(packet || state);
    if (state && typeof state === 'object') {
      state.ι = C(result.field);
      state.intention_algebra = C(result);
      if (state.unit && typeof state.unit === 'object') {
        state.unit.ι = result.l1;
        state.unit.ok = state.unit.ok !== false && result.ok;
      }
    }
    return result;
  }

  function distance(a, b) {
    const am = map(a);
    const bm = map(b);
    const keys = Array.from(new Set(Object.keys(am).concat(Object.keys(bm))));
    return R(keys.reduce((sum, key) => sum + Math.abs((am[key] || 0) - (bm[key] || 0)), 0));
  }

  function classify(result) {
    const field = A(result && result.field || result);
    const top = field.slice().sort((a, b) => Math.abs(weight(b)) - Math.abs(weight(a)))[0] || { σ: 'ι∅', w: 1 };
    return {
      top: axis(top),
      weight: R(Math.abs(weight(top))),
      stable: !!(result && result.ok) && Math.abs((result && result.l1) - 1) < EPS,
      english: ''
    };
  }

  return Object.freeze({
    VERSION,
    compute,
    apply,
    classify,
    normalize,
    l1,
    distance
  });
});
