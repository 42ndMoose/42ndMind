(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathLanguageKernel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;

  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(6));
  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));

  function rowAxis(row) {
    if (Array.isArray(row)) return String(row[0] == null ? '∅' : row[0]);
    return String((row && (row.σ ?? row.axis ?? row.dimension)) ?? '∅');
  }

  function rowWeight(row) {
    if (Array.isArray(row)) return Number(row[1]) || 0;
    return Number(row && (row.w ?? row.weight)) || 0;
  }

  function normalize(rows) {
    const clean = A(rows).map(row => ({ σ: rowAxis(row), w: rowWeight(row) })).filter(row => row.σ && row.w !== 0);
    if (!clean.length) return [{ σ: '∅', w: 1 }];
    const total = clean.reduce((sum, row) => sum + Math.abs(row.w), 0) || 1;
    let used = 0;
    return clean.map((row, index) => {
      const sign = row.w < 0 ? -1 : 1;
      const magnitude = index === clean.length - 1 ? Math.max(0, 1 - used) : Math.abs(row.w) / total;
      const weight = R(sign * magnitude);
      used = R(used + Math.abs(weight));
      return { σ: row.σ, w: weight };
    });
  }

  function l1(field) {
    return R(A(field).reduce((sum, row) => sum + Math.abs(Number(row.w ?? row.weight) || 0), 0));
  }

  function fieldMap(field) {
    const out = {};
    A(field).forEach(row => { out[rowAxis(row)] = (out[rowAxis(row)] || 0) + rowWeight(row); });
    return out;
  }

  function rowsFromMap(map) {
    return Object.keys(map || {}).map(key => ({ σ: key, w: map[key] }));
  }

  function blend(fields) {
    const out = {};
    A(fields).forEach(item => {
      const gain = Number(item.gain ?? item.g ?? 1) || 0;
      A(item.field || item.f).forEach(row => {
        const key = rowAxis(row);
        out[key] = (out[key] || 0) + rowWeight(row) * gain;
      });
    });
    return normalize(rowsFromMap(out));
  }

  function distance(a, b) {
    const am = fieldMap(a);
    const bm = fieldMap(b);
    const keys = Array.from(new Set(Object.keys(am).concat(Object.keys(bm))));
    return R(keys.reduce((sum, key) => sum + Math.abs((am[key] || 0) - (bm[key] || 0)), 0));
  }

  function entropy(field) {
    return R(A(field).reduce((sum, row) => {
      const p = Math.abs(rowWeight(row));
      return p > 0 ? sum - p * Math.log2(p) : sum;
    }, 0));
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

  function scalar(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function scalarOk(value) {
    return Number.isFinite(Number(value));
  }

  function unitGap(value) {
    if (Array.isArray(value)) return Math.abs(l1(value) - 1);
    if (scalarOk(value)) return Math.abs(Math.abs(scalar(value)) - 1);
    return 1;
  }

  function dominant(field) {
    const rows = A(field).slice().sort((a, b) => Math.abs(rowWeight(b)) - Math.abs(rowWeight(a)) || rowAxis(a).localeCompare(rowAxis(b)));
    return rows.length ? rowAxis(rows[0]) : '∅';
  }

  function discrepancy(expected, actual, scope) {
    const eOk = scalarOk(expected);
    const aOk = scalarOk(actual);
    const e = scalar(expected);
    const a = scalar(actual);
    const contractGap = eOk && aOk ? Math.abs(e - a) : 1;
    const totalGap = unitGap(actual);
    const measureGap = eOk && aOk ? 0 : 1;
    const δ = normalize([
      ['δ=', Math.max(EPS, contractGap)],
      ['δ∥', Math.max(EPS, totalGap)],
      ['δ?', Math.max(EPS, measureGap)]
    ]);
    return {
      φ: 'δ',
      v: VERSION,
      s: scope == null ? '∅' : String(scope),
      e: C(expected),
      a: C(actual),
      δ,
      ω: dominant(δ),
      u: { δ: l1(δ), ok: Math.abs(l1(δ) - 1) < EPS },
      z: { 'δ=': R(contractGap), 'δ∥': R(totalGap), 'δ?': R(measureGap) },
      χ: ['δ=|e-a|', 'δ∥=|1-∥a∥₁|', 'δ=𝒩(δ=⊕δ∥⊕δ?)'],
      Ξ: ''
    };
  }

  function isField(value) {
    return Array.isArray(value) && value.every(row => Array.isArray(row) || (row && typeof row === 'object' && ('σ' in row || 'axis' in row || 'dimension' in row)));
  }

  function packetField(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const out = [];
    ['τ', 'ρ', 'μ', 'ε', 'λ', 'ι', 'κ', 'Ω', 'δ', 'Δ'].forEach(key => {
      A(value[key]).forEach(row => out.push({ σ: key + ':' + rowAxis(row), w: rowWeight(row) }));
    });
    return out;
  }

  function comparableField(value) {
    if (isField(value)) return normalize(value);
    const packet = packetField(value);
    if (packet.length) return normalize(packet);
    if (scalarOk(value)) return normalize([[String(scalar(value)), Math.max(EPS, Math.abs(scalar(value)))] ]);
    return [];
  }

  function axisMismatch(a, b) {
    const am = fieldMap(a);
    const bm = fieldMap(b);
    const keys = Array.from(new Set(Object.keys(am).concat(Object.keys(bm))));
    if (!keys.length) return 1;
    const diff = keys.filter(key => !(key in am) || !(key in bm)).length;
    return R(diff / keys.length);
  }

  function weightMismatch(a, b) {
    if (!A(a).length && !A(b).length) return 1;
    return R(Math.min(1, distance(a, b) / 2));
  }

  function unitMismatch(a, b) {
    const au = A(a).length ? Math.abs(l1(a) - 1) : 1;
    const bu = A(b).length ? Math.abs(l1(b) - 1) : 1;
    return R(Math.min(1, au + bu));
  }

  function invariantRows(value) {
    if (!value || typeof value !== 'object') return [];
    return A(value.χ || value.invariants || value.constraints).map(String);
  }

  function invariantMismatch(a, b) {
    const ax = invariantRows(a);
    const bx = invariantRows(b);
    if (!ax.length && !bx.length) return 0;
    const keys = Array.from(new Set(ax.concat(bx)));
    const amap = countMap(ax);
    const bmap = countMap(bx);
    const diff = keys.filter(key => !amap[key] || !bmap[key]).length;
    return R(diff / Math.max(1, keys.length));
  }

  function unknownMismatch(a, b, af, bf) {
    const measurable = A(af).length && A(bf).length;
    return measurable ? 0 : 1;
  }

  function gap(a, b, scope) {
    const af = comparableField(a);
    const bf = comparableField(b);
    const z = {
      'Δσ': axisMismatch(af, bf),
      'Δw': weightMismatch(af, bf),
      'Δ∥': unitMismatch(af, bf),
      'Δχ': invariantMismatch(a, b),
      'Δ?': unknownMismatch(a, b, af, bf)
    };
    const Δ = normalize([
      ['Δσ', Math.max(EPS, z['Δσ'])],
      ['Δw', Math.max(EPS, z['Δw'])],
      ['Δ∥', Math.max(EPS, z['Δ∥'])],
      ['Δχ', Math.max(EPS, z['Δχ'])],
      ['Δ?', Math.max(EPS, z['Δ?'])]
    ]);
    return {
      φ: 'Δ',
      v: VERSION,
      s: scope == null ? '∅' : String(scope),
      Δ,
      ω: dominant(Δ),
      z,
      u: { Δ: l1(Δ), ok: Math.abs(l1(Δ) - 1) < EPS },
      χ: ['Δ=𝒩(Δσ⊕Δw⊕Δ∥⊕Δχ⊕Δ?)', 'Δσ=axis gap', 'Δw=weight gap', 'Δ∥=unit gap', 'Δχ=invariant gap'],
      Ξ: ''
    };
  }

  function countMap(list) {
    const out = {};
    A(list).forEach(item => { out[item] = (out[item] || 0) + 1; });
    return out;
  }

  function ngrams(symbols, max) {
    const out = {};
    const size = Math.max(1, Number(max) || 1);
    for (let n = 1; n <= size; n += 1) {
      for (let i = 0; i <= symbols.length - n; i += 1) {
        const key = symbols.slice(i, i + n).join('');
        out[key] = (out[key] || 0) + 1;
      }
    }
    return out;
  }

  function repeatedPatterns(symbols, maxN, minRepeat) {
    const counts = ngrams(symbols, maxN);
    return Object.keys(counts).map(pattern => ({
      pattern,
      count: counts[pattern],
      size: Array.from(pattern).length,
      gain: Math.max(0, (Array.from(pattern).length - 1) * (counts[pattern] - 1))
    })).filter(item => item.size > 1 && item.count >= minRepeat && item.gain > 0)
      .sort((a, b) => b.gain - a.gain || b.size - a.size || a.pattern.localeCompare(b.pattern));
  }

  function sense(raw) {
    const text = String(raw == null ? '' : raw);
    const symbols = Array.from(text);
    return {
      raw: text,
      symbols,
      count: symbols.length,
      distinct: Object.keys(countMap(symbols)).length,
      checksum: checksum(text)
    };
  }

  function create(seed) {
    const state = {
      version: VERSION,
      rule: '∥Ω∥₁=1',
      time: 0,
      params: Object.assign({ max_ngram: 4, min_repeat: 2, max_tokens: 144, max_relations: 288 }, seed && seed.params || {}),
      memory: {
        seen: 0,
        tokens: [],
        token_index: {},
        relation_counts: {},
        relations: []
      },
      input: null,
      τ: normalize([['∅', 1]]),
      ρ: normalize([['∅', 1]]),
      μ: normalize([['∅', 1]]),
      ε: normalize([['ε₀', 1]]),
      λ: normalize([['∅', 1]]),
      ι: normalize([['ι□', 1]]),
      κ: normalize([['κ₀', 1]]),
      Ω: normalize([['λ', 1]]),
      χ: [],
      Ξ: '',
      trace: []
    };
    rebalance(state);
    return state;
  }

  function remember(state, sensory) {
    const memory = state.memory;
    memory.seen += 1;
    const candidates = repeatedPatterns(sensory.symbols, state.params.max_ngram, state.params.min_repeat);
    candidates.slice(0, 16).forEach(candidate => {
      if (!memory.token_index[candidate.pattern] && memory.tokens.length < state.params.max_tokens) {
        const id = 'τ' + (memory.tokens.length + 1);
        memory.token_index[candidate.pattern] = id;
        memory.tokens.push({ id, pattern: candidate.pattern, count: candidate.count, gain: candidate.gain, born: memory.seen });
      } else {
        const id = memory.token_index[candidate.pattern];
        const token = memory.tokens.find(item => item.id === id);
        if (token) {
          token.count += candidate.count;
          token.gain += candidate.gain;
        }
      }
    });

    const active = candidates.map(candidate => memory.tokens.find(token => token.pattern === candidate.pattern)).filter(Boolean).slice(0, 12);
    for (let i = 0; i < active.length; i += 1) {
      for (let j = i + 1; j < active.length; j += 1) {
        const a = active[i].id;
        const b = active[j].id;
        const key = a < b ? a + '↔' + b : b + '↔' + a;
        memory.relation_counts[key] = (memory.relation_counts[key] || 0) + 1;
      }
    }
    memory.relations = Object.keys(memory.relation_counts).map(key => {
      const pair = key.split('↔');
      return { id: 'ρ' + (Object.keys(memory.relation_counts).indexOf(key) + 1), a: pair[0], b: pair[1], count: memory.relation_counts[key] };
    }).sort((a, b) => b.count - a.count).slice(0, state.params.max_relations);

    return candidates;
  }

  function updateFields(state, sensory, candidates) {
    const memory = state.memory;
    state.τ = memory.tokens.length
      ? normalize(memory.tokens.map(token => ({ σ: token.id, w: Math.max(1, token.gain + token.count) })))
      : normalize([['τ∅', 1]]);

    state.ρ = memory.relations.length
      ? normalize(memory.relations.map(rel => ({ σ: rel.id, w: Math.max(1, rel.count) })))
      : normalize([['ρ∅', 1]]);

    state.μ = memory.tokens.length || memory.relations.length
      ? normalize(memory.tokens.map(token => ({ σ: 'μ' + token.id.replace('τ', ''), w: Math.max(1, token.count) }))
          .concat(memory.relations.map((rel, index) => ({ σ: 'μρ' + (index + 1), w: Math.max(1, rel.count) }))))
      : normalize([['μ∅', 1]]);

    const compression = sensory.count ? Math.min(1, A(candidates).reduce((sum, item) => sum + item.gain, 0) / Math.max(1, sensory.count * 2)) : 0;
    const uncertainty = R(1 - compression);
    state.ε = normalize([
      ['ε↓', Math.max(0.0001, compression)],
      ['ε↑', Math.max(0.0001, uncertainty)]
    ]);

    state.λ = blend([
      { field: state.τ, gain: 0.30 },
      { field: state.ρ, gain: 0.24 },
      { field: state.μ, gain: 0.26 },
      { field: state.ε, gain: 0.20 }
    ]);

    const relationPressure = memory.relations.length ? Math.min(1, memory.relations.length / 16) : 0;
    const bindingPressure = memory.tokens.length ? Math.min(1, memory.tokens.length / 16) : 0;
    const holdPressure = uncertainty;
    state.ι = normalize([
      ['ι⊕', Math.max(0.0001, compression)],
      ['ι↔', Math.max(0.0001, relationPressure)],
      ['ιμ', Math.max(0.0001, bindingPressure)],
      ['ι?', Math.max(0.0001, uncertainty * 0.75)],
      ['ι□', Math.max(0.0001, holdPressure * 0.50)]
    ]);

    state.κ = normalize([
      ['κλ', l1(state.λ)],
      ['κι', l1(state.ι)],
      ['κε', l1(state.ε)],
      ['κΩ', l1(state.Ω)]
    ]);
  }

  function rebalance(state) {
    state.λ = normalize(state.λ);
    state.ι = normalize(state.ι);
    state.ε = normalize(state.ε);
    state.κ = normalize(state.κ);
    state.Ω = blend([
      { field: state.λ.map(row => ({ σ: 'λ:' + row.σ, w: row.w })), gain: 0.36 },
      { field: state.ι.map(row => ({ σ: 'ι:' + row.σ, w: row.w })), gain: 0.30 },
      { field: state.ε.map(row => ({ σ: 'ε:' + row.σ, w: row.w })), gain: 0.18 },
      { field: state.κ.map(row => ({ σ: 'κ:' + row.σ, w: row.w })), gain: 0.16 }
    ]);
    state.χ = [
      '∥τ∥₁=1',
      '∥ρ∥₁=1',
      '∥μ∥₁=1',
      '∥ε∥₁=1',
      '∥λ∥₁=1',
      '∥ι∥₁=1',
      '∥Ω∥₁=1',
      'δ=𝒩(|e-a|⊕|1-∥a∥₁|⊕δ?)',
      'Δ=𝒩(Δσ⊕Δw⊕Δ∥⊕Δχ⊕Δ?)',
      'λ=𝒩(τ⊕ρ⊕μ⊕ε)',
      'ι=𝒩(λτ⊕λρ⊕λμ⊕λε)',
      'Ω=𝒩(λ⊕ι⊕ε⊕κ)'
    ];
    state.unit = unitReport(state);
    return state;
  }

  function unitReport(state) {
    return {
      τ: l1(state.τ),
      ρ: l1(state.ρ),
      μ: l1(state.μ),
      ε: l1(state.ε),
      λ: l1(state.λ),
      ι: l1(state.ι),
      κ: l1(state.κ),
      Ω: l1(state.Ω),
      ok: [state.τ, state.ρ, state.μ, state.ε, state.λ, state.ι, state.κ, state.Ω].every(field => Math.abs(l1(field) - 1) < EPS)
    };
  }

  function observe(state, raw) {
    const before = C({ λ: state.λ, ι: state.ι, Ω: state.Ω });
    const sensory = sense(raw);
    const candidates = remember(state, sensory);
    state.input = { count: sensory.count, distinct: sensory.distinct, checksum: sensory.checksum };
    state.time += 1;
    updateFields(state, sensory, candidates);
    rebalance(state);
    const after = C({ λ: state.λ, ι: state.ι, Ω: state.Ω });
    state.trace.unshift({
      t: state.time,
      Δλ: distance(before.λ, after.λ),
      Δι: distance(before.ι, after.ι),
      ΔΩ: distance(before.Ω, after.Ω),
      τ: state.memory.tokens.length,
      ρ: state.memory.relations.length,
      u: state.unit.ok
    });
    state.trace = state.trace.slice(0, 128);
    return packet(state);
  }

  function step(state, raw) {
    return observe(state, raw);
  }

  function packet(state) {
    return {
      φ: 'Ω',
      v: VERSION,
      t: state.time,
      λ: C(state.λ),
      ι: C(state.ι),
      τ: C(state.τ),
      ρ: C(state.ρ),
      μ: C(state.μ),
      ε: C(state.ε),
      κ: C(state.κ),
      Ω: C(state.Ω),
      χ: C(state.χ),
      u: C(state.unit),
      d: {
        Hλ: entropy(state.λ),
        Hι: entropy(state.ι),
        HΩ: entropy(state.Ω)
      },
      Ξ: ''
    };
  }

  function snapshot(state) {
    return C(state);
  }

  return Object.freeze({
    VERSION,
    create,
    observe,
    step,
    packet,
    snapshot,
    normalize,
    l1,
    blend,
    distance,
    entropy,
    discrepancy,
    gap,
    rebalance,
    unitReport
  });
});
