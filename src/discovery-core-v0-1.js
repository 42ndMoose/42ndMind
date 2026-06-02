(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindDiscoveryCore = factory();
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

  function symbols(raw) {
    return Array.from(String(raw == null ? '' : raw));
  }

  function ngrams(xs, max) {
    const out = {};
    const limit = Math.max(1, Number(max) || 1);
    for (let n = 1; n <= limit; n += 1) {
      for (let i = 0; i <= xs.length - n; i += 1) {
        const key = xs.slice(i, i + n).join('');
        out[key] = (out[key] || 0) + 1;
      }
    }
    return out;
  }

  function candidateRows(counts, minRepeat) {
    return Object.keys(counts).map(pattern => {
      const size = Array.from(pattern).length;
      const count = counts[pattern];
      return { pattern, count, size, gain: Math.max(0, (size - 1) * (count - 1)) };
    }).filter(row => row.size > 1 && row.count >= minRepeat && row.gain > 0)
      .sort((a, b) => b.gain - a.gain || b.size - a.size || a.pattern.localeCompare(b.pattern));
  }

  function create(seed) {
    const state = {
      packet_type: '42ndMind_discovery_core_v0_1',
      version: VERSION,
      params: Object.assign({ max_ngram: 5, min_repeat: 2, birth_support: 3, max_candidates: 256, max_symbols: 256, max_relations: 512 }, seed && seed.params || {}),
      time: 0,
      observations: [],
      candidates: {},
      symbols: {},
      relations: {},
      α: normalize([['α∅', 1]], 'α∅'),
      π: normalize([['π∅', 1]], 'π∅'),
      Δ: normalize([['Δ∅', 1]], 'Δ∅'),
      β: normalize([['β∅', 1]], 'β∅'),
      ν: normalize([['ν∅', 1]], 'ν∅'),
      χ: normalize([['χ0', 1]], 'χ0'),
      υ: normalize([['υ?', 1]], 'υ?'),
      Ωd: normalize([['Ωd∅', 1]], 'Ωd∅'),
      ξ: '',
      trace: []
    };
    return refresh(state);
  }

  function candidateId(pattern) {
    return 'Δ' + checksum(pattern).slice(0, 8);
  }

  function symbolId(pattern) {
    return 'β' + checksum(pattern).slice(0, 8);
  }

  function relationId(a, b) {
    const left = a < b ? a : b;
    const right = a < b ? b : a;
    return 'ν' + checksum(left + '↔' + right).slice(0, 8);
  }

  function observe(state, raw) {
    const text = String(raw == null ? '' : raw);
    const xs = symbols(text);
    const counts = ngrams(xs, state.params.max_ngram);
    const candidates = candidateRows(counts, state.params.min_repeat).slice(0, state.params.max_candidates);
    const obs = { id: 'α' + (state.time + 1), checksum: checksum(text), length: xs.length, distinct: Object.keys(counts).length };
    state.time += 1;
    state.observations.unshift(obs);
    state.observations = state.observations.slice(0, 128);

    candidates.forEach(row => {
      const id = candidateId(row.pattern);
      const existing = state.candidates[id] || { id, pattern: row.pattern, support: 0, appearances: 0, contexts: {}, contradiction: 0, born: state.time };
      existing.support += row.gain;
      existing.appearances += row.count;
      existing.contexts[obs.checksum] = true;
      existing.last = state.time;
      state.candidates[id] = existing;
    });

    const activeIds = candidates.map(row => candidateId(row.pattern)).filter(id => state.candidates[id]).slice(0, 24);
    for (let i = 0; i < activeIds.length; i += 1) {
      for (let j = i + 1; j < activeIds.length; j += 1) {
        const rid = relationId(activeIds[i], activeIds[j]);
        const relation = state.relations[rid] || { id: rid, a: activeIds[i], b: activeIds[j], support: 0, contexts: {} };
        relation.support += 1;
        relation.contexts[obs.checksum] = true;
        state.relations[rid] = relation;
      }
    }

    updateBirths(state);
    return refresh(state);
  }

  function updateBirths(state) {
    Object.values(state.candidates).forEach(candidate => {
      const contextCount = Object.keys(candidate.contexts || {}).length;
      const stable = candidate.support >= state.params.birth_support && contextCount >= 1 && candidate.contradiction === 0;
      if (stable) {
        const id = symbolId(candidate.pattern);
        const existing = state.symbols[id] || { id, source: candidate.id, support: 0, contexts: {}, born: state.time, status: 'born' };
        existing.support = Math.max(existing.support, candidate.support);
        Object.assign(existing.contexts, candidate.contexts || {});
        existing.last = state.time;
        state.symbols[id] = existing;
      }
    });
  }

  function fieldFromObject(obj, empty, weightFn) {
    const rows = Object.values(obj || {}).map(item => ({ σ: item.id, w: Math.max(0.0001, weightFn ? weightFn(item) : item.support || 1) }));
    return normalize(rows, empty);
  }

  function refresh(state) {
    state.α = normalize(state.observations.map(o => ({ σ: o.id, w: Math.max(1, o.length || 1) })), 'α∅');
    state.π = fieldFromObject(state.candidates, 'π∅', item => item.appearances || item.support || 1);
    state.Δ = fieldFromObject(state.candidates, 'Δ∅', item => item.support || 1);
    state.β = fieldFromObject(state.symbols, 'β∅', item => item.support || 1);
    state.ν = fieldFromObject(state.relations, 'ν∅', item => item.support || 1);

    const candidateCount = Object.keys(state.candidates).length;
    const symbolCount = Object.keys(state.symbols).length;
    const contradictionPressure = Math.min(1, Object.values(state.candidates).reduce((sum, c) => sum + (c.contradiction || 0), 0));
    const unknownPressure = candidateCount ? Math.max(0, 1 - Math.min(1, symbolCount / Math.max(1, candidateCount))) : 1;

    state.χ = normalize([
      ['χ0', Math.max(0.0001, 1 - contradictionPressure)],
      ['χ!', Math.max(0.0001, contradictionPressure)]
    ], 'χ0');
    state.υ = normalize([
      ['υ0', Math.max(0.0001, 1 - unknownPressure)],
      ['υ?', Math.max(0.0001, unknownPressure)]
    ], 'υ?');
    state.Ωd = normalize([
      ['Ωd:α', l1(state.α)],
      ['Ωd:π', l1(state.π)],
      ['Ωd:Δ', l1(state.Δ)],
      ['Ωd:β', l1(state.β)],
      ['Ωd:ν', l1(state.ν)],
      ['Ωd:χ', l1(state.χ)],
      ['Ωd:υ', l1(state.υ)]
    ], 'Ωd∅');
    state.unit = {
      α: l1(state.α), π: l1(state.π), Δ: l1(state.Δ), β: l1(state.β), ν: l1(state.ν), χ: l1(state.χ), υ: l1(state.υ), Ωd: l1(state.Ωd),
      ok: [state.α, state.π, state.Δ, state.β, state.ν, state.χ, state.υ, state.Ωd].every(field => Math.abs(l1(field) - 1) < EPS)
    };
    state.trace.unshift({ t: state.time, candidates: candidateCount, symbols: symbolCount, relations: Object.keys(state.relations).length, unit: state.unit.ok });
    state.trace = state.trace.slice(0, 128);
    state.ξ = '';
    return state;
  }

  function packet(state) {
    refresh(state);
    return {
      φ: 'Ωd',
      v: VERSION,
      t: state.time,
      α: C(state.α),
      π: C(state.π),
      Δ: C(state.Δ),
      β: C(state.β),
      ν: C(state.ν),
      χ: C(state.χ),
      υ: C(state.υ),
      Ωd: C(state.Ωd),
      unit: C(state.unit),
      ξ: ''
    };
  }

  function snapshot(state) {
    refresh(state);
    return C(state);
  }

  return Object.freeze({
    VERSION,
    create,
    observe,
    refresh,
    packet,
    snapshot,
    normalize,
    l1
  });
});
