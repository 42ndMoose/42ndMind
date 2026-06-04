(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindMathLanguageKernel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;
  const FIELD_KEYS = Object.freeze(['τ', 'ρ', 'μ', 'ε', 'λ', 'ι', 'κ', 'Ω', 'δ', 'Δ', 'Λ']);
  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(6));
  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));

  const DEFINITIONS = Object.freeze({
    σ: 'axis identity inside a finite symbolic field',
    w: 'signed finite scalar weight assigned to σ before or after 𝒩',
    χ: 'constraint row that must remain stable under accepted transformations',
    '𝒩': 'unit-total normalization by L1 magnitude',
    Δ: 'normalized gap field over measurable mismatch axes',
    Δ0: 'closed gap: measured gap score is zero',
    δ: 'expected-actual discrepancy field',
    T: 'local unit-preserving correction transform',
    C: 'finite one-step closure over fields, gaps, and transforms',
    '≡': 'canonical equivalence relation',
    '⊢': 'invariant-preserving proof gate',
    G: 'grounding status packet',
    Λ: 'kernel-derived lexeme over a stable packet pattern'
  });

  const INVARIANTS = Object.freeze([
    { id: 'χ_unit_total', row: '∥F∥₁=1', axis: '∥', weight: 0.27 },
    { id: 'χ_finite_weight', row: '∀w∈F:Number.isFinite(w)', axis: 'w', weight: 0.16 },
    { id: 'χ_axis_defined', row: '∀σ∈F:σ≠∅', axis: 'σ', weight: 0.13 },
    { id: 'χ_canonical_order', row: 'canonical(F)=sort(merge(F))', axis: '≡', weight: 0.12 },
    { id: 'χ_zero_gap', row: 'Δ.score=0⇒Δ=Δ0', axis: 'Δ0', weight: 0.10 },
    { id: 'χ_no_english', row: 'Ξ=""', axis: 'Ξ', weight: 0.10 },
    { id: 'χ_local_minimality', row: 'T*=argmin(score(Δ(T(F),G))+cost(T))', axis: 'T', weight: 0.12 }
  ]);

  function rowAxis(row) {
    if (Array.isArray(row)) return String(row[0] == null ? '∅' : row[0]);
    return String((row && (row.σ ?? row.axis ?? row.dimension)) ?? '∅');
  }

  function rowWeight(row) {
    if (Array.isArray(row)) return Number(row[1]) || 0;
    return Number(row && (row.w ?? row.weight)) || 0;
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

  function mergeRows(rows) {
    const out = {};
    A(rows).forEach(row => {
      const σ = rowAxis(row);
      const w = rowWeight(row);
      if (σ && σ !== '∅' && Number.isFinite(w) && Math.abs(w) > EPS) out[σ] = (out[σ] || 0) + w;
    });
    return Object.keys(out).sort().map(σ => ({ σ, w: R(out[σ]) })).filter(row => Math.abs(row.w) > EPS);
  }

  function normalize(rows) {
    const clean = mergeRows(rows);
    if (!clean.length) return [{ σ: '∅', w: 1 }];
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

  function l1(field) { return R(A(field).reduce((sum, row) => sum + Math.abs(rowWeight(row)), 0)); }

  function fieldMap(field) {
    const out = {};
    A(field).forEach(row => { out[rowAxis(row)] = (out[rowAxis(row)] || 0) + rowWeight(row); });
    return out;
  }

  function rowsFromMap(map) { return Object.keys(map || {}).sort().map(key => ({ σ: key, w: map[key] })); }

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

  function scalar(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function scalarOk(value) { return Number.isFinite(Number(value)); }

  function unitGap(value) {
    if (Array.isArray(value)) return Math.abs(l1(value) - 1);
    if (scalarOk(value)) return Math.abs(Math.abs(scalar(value)) - 1);
    return 1;
  }

  function dominant(field) {
    const rows = A(field).slice().sort((a, b) => Math.abs(rowWeight(b)) - Math.abs(rowWeight(a)) || rowAxis(a).localeCompare(rowAxis(b)));
    return rows.length ? rowAxis(rows[0]) : '∅';
  }

  function definitions() { return C(DEFINITIONS); }
  function invariants() { return C(INVARIANTS); }
  function invariantField() { return normalize(INVARIANTS.map(row => ({ σ: row.axis, w: row.weight }))); }

  function isField(value) {
    return Array.isArray(value) && value.every(row => Array.isArray(row) || (row && typeof row === 'object' && ('σ' in row || 'axis' in row || 'dimension' in row)));
  }

  function packetField(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const out = [];
    FIELD_KEYS.forEach(key => A(value[key]).forEach(row => out.push({ σ: key + ':' + rowAxis(row), w: rowWeight(row) })));
    return out;
  }

  function rawComparableField(value) {
    if (isField(value)) return mergeRows(value);
    const packet = packetField(value);
    if (packet.length) return mergeRows(packet);
    if (scalarOk(value)) return [{ σ: String(scalar(value)), w: Math.max(EPS, Math.abs(scalar(value))) }];
    return [];
  }

  function comparableField(value) {
    const raw = rawComparableField(value);
    return raw.length ? normalize(raw) : [];
  }

  function invariantRows(value) {
    if (!value || typeof value !== 'object') return [];
    return Array.from(new Set(A(value.χ || value.invariants || value.constraints).map(String))).sort();
  }

  function validateField(field) {
    const rows = A(field);
    const finite = rows.every(row => Number.isFinite(rowWeight(row)));
    const axisDefined = rows.every(row => rowAxis(row) !== '∅' && rowAxis(row) !== '');
    const unit = Math.abs(l1(rows) - 1) < EPS;
    const χ = normalize([['∥', unit ? 1 : EPS], ['w', finite ? 1 : EPS], ['σ', axisDefined ? 1 : EPS], ['Ξ', 1]]);
    return { φ: 'χ', v: VERSION, χ, ok: unit && finite && axisDefined, z: { '∥': unit ? 0 : R(Math.abs(l1(rows) - 1)), w: finite ? 0 : 1, σ: axisDefined ? 0 : 1, Ξ: 0 }, Ξ: '' };
  }

  function rawGapScore(packet) {
    const z = packet && packet.z || {};
    return R(Object.keys(z).reduce((sum, key) => sum + Math.abs(Number(z[key]) || 0), 0));
  }

  function discrepancy(expected, actual, scope) {
    const eOk = scalarOk(expected);
    const aOk = scalarOk(actual);
    const contractGap = eOk && aOk ? Math.abs(scalar(expected) - scalar(actual)) : 1;
    const totalGap = unitGap(actual);
    const measureGap = eOk && aOk ? 0 : 1;
    const z = { 'δ=': R(contractGap), 'δ∥': R(totalGap), 'δ?': R(measureGap) };
    const score = rawGapScore({ z });
    const δ = score <= EPS ? [{ σ: 'δ0', w: 1 }] : normalize([['δ=', Math.max(EPS, z['δ='])], ['δ∥', Math.max(EPS, z['δ∥'])], ['δ?', Math.max(EPS, z['δ?'])]]);
    return { φ: 'δ', v: VERSION, s: scope == null ? '∅' : String(scope), e: C(expected), a: C(actual), δ, ω: score <= EPS ? 'δ0' : dominant(δ), score, u: { δ: l1(δ), ok: Math.abs(l1(δ) - 1) < EPS }, z, χ: ['δ=|e-a|', 'δ∥=|1-∥a∥₁|', 'δ.score=0⇒δ=δ0', 'δ=𝒩(δ=⊕δ∥⊕δ?)'], Ξ: '' };
  }

  function axisMismatch(a, b) {
    const am = fieldMap(a);
    const bm = fieldMap(b);
    const keys = Array.from(new Set(Object.keys(am).concat(Object.keys(bm))));
    if (!keys.length) return 1;
    return R(keys.filter(key => !(key in am) || !(key in bm)).length / keys.length);
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

  function invariantMismatch(a, b) {
    const ax = invariantRows(a);
    const bx = invariantRows(b);
    if (!ax.length && !bx.length) return 0;
    const keys = Array.from(new Set(ax.concat(bx)));
    const amap = countMap(ax);
    const bmap = countMap(bx);
    return R(keys.filter(key => !amap[key] || !bmap[key]).length / Math.max(1, keys.length));
  }

  function gap(a, b, scope) {
    const af = comparableField(a);
    const bf = comparableField(b);
    const measurable = A(af).length && A(bf).length;
    const z = { 'Δσ': axisMismatch(af, bf), 'Δw': weightMismatch(af, bf), 'Δ∥': unitMismatch(rawComparableField(a), rawComparableField(b)), 'Δχ': invariantMismatch(a, b), 'Δ?': measurable ? 0 : 1 };
    const score = rawGapScore({ z });
    const Δ = score <= EPS ? [{ σ: 'Δ0', w: 1 }] : normalize([['Δσ', Math.max(EPS, z['Δσ'])], ['Δw', Math.max(EPS, z['Δw'])], ['Δ∥', Math.max(EPS, z['Δ∥'])], ['Δχ', Math.max(EPS, z['Δχ'])], ['Δ?', Math.max(EPS, z['Δ?'])]]);
    return { φ: 'Δ', v: VERSION, s: scope == null ? '∅' : String(scope), Δ, ω: score <= EPS ? 'Δ0' : dominant(Δ), score, z, u: { Δ: l1(Δ), ok: Math.abs(l1(Δ) - 1) < EPS }, χ: ['Δ=𝒩(Δσ⊕Δw⊕Δ∥⊕Δχ⊕Δ?)', 'Δ.score=0⇒Δ=Δ0', 'Δσ=axis gap', 'Δw=weight gap', 'Δ∥=unit gap', 'Δχ=invariant gap'], Ξ: '' };
  }

  function axisUnionField(current, target) {
    const cm = fieldMap(current);
    const tm = fieldMap(target);
    const keys = Array.from(new Set(Object.keys(cm).concat(Object.keys(tm)))).sort();
    return normalize(keys.map(key => ({ σ: key, w: key in cm ? cm[key] : EPS })));
  }

  function weightProjectedField(current, target) {
    const tm = fieldMap(target);
    return normalize(Object.keys(tm).sort().map(key => ({ σ: key, w: tm[key] })));
  }

  function candidateTransform(name, cost, field) { return { name, cost, field: normalize(field) }; }

  function correction(current, target, scope) {
    const cf = comparableField(current);
    const tf = comparableField(target);
    const before = gap(current, target, scope);
    const candidates = [];
    if (cf.length) candidates.push(candidateTransform('T0', 0, cf));
    if (cf.length) candidates.push(candidateTransform('T∥', 0.02, normalize(rawComparableField(current))));
    if (cf.length && tf.length) candidates.push(candidateTransform('Tσ', 0.08, axisUnionField(cf, tf)));
    if (cf.length && tf.length) candidates.push(candidateTransform('Tw', 0.13, weightProjectedField(cf, tf)));
    if (!candidates.length && tf.length) candidates.push(candidateTransform('T?', 0.21, tf));
    const evaluated = candidates.map(item => {
      const after = gap(item.field, target, scope);
      return Object.assign({}, item, { gap: after, score: R(rawGapScore(after) + item.cost) });
    }).sort((a, b) => a.score - b.score || a.cost - b.cost || a.name.localeCompare(b.name));
    const best = evaluated[0] || candidateTransform('T∅', 1, normalize([['∅', 1]]));
    const after = best.gap || gap(best.field, target, scope);
    const T = normalize(evaluated.map(item => ({ σ: item.name, w: 1 / Math.max(EPS, item.score + EPS) })));
    return { φ: 'T', v: VERSION, s: scope == null ? '∅' : String(scope), method: 'finite_local_argmin', T, chosen: best.name, before, after, transformed: C(best.field), candidates: evaluated.map(item => ({ T: item.name, cost: item.cost, score: item.score, ω: item.gap.ω, z: item.gap.z })), reduced: after.score <= before.score, u: { T: l1(T), ok: Math.abs(l1(T) - 1) < EPS && validateField(best.field).ok }, χ: ['T*=argmin(score(Δ(T(F),G))+cost(T))', '∥T(F)∥₁=1', 'Ξ=""'], Ξ: '' };
  }

  function canonicalBody(value, options) {
    const opts = options || {};
    if (isField(value) || scalarOk(value)) {
      const raw = rawComparableField(value);
      return { kind: 'F', F: opts.raw ? mergeRows(raw) : normalize(raw) };
    }
    if (value && typeof value === 'object') {
      const fields = {};
      FIELD_KEYS.forEach(key => { if (Array.isArray(value[key])) fields[key] = normalize(value[key]); });
      if (!Object.keys(fields).length && packetField(value).length) fields.F = normalize(packetField(value));
      return { kind: 'Π', φ: value.φ || 'Π', fields, χ: invariantRows(value) };
    }
    return { kind: '∅', F: normalize([['∅', 1]]) };
  }

  function canonical(value, options) {
    const body = canonicalBody(value, options);
    const unitRows = body.kind === 'F' ? body.F : Object.keys(body.fields || {}).reduce((rows, key) => rows.concat(body.fields[key]), []);
    const id = 'ν' + checksum(body).slice(0, 12);
    return { φ: 'ν', v: VERSION, id, body: C(body), F: body.kind === 'F' ? C(body.F) : undefined, u: { ν: unitRows.length ? l1(normalize(unitRows)) : 1, ok: true }, χ: ['ν=canonical(x)', 'merge duplicate σ', 'sort σ', 'Ξ=""'], Ξ: '' };
  }

  function equivalent(a, b, options) {
    const ca = canonical(a, options);
    const cb = canonical(b, options);
    const same = JSON.stringify(ca.body) === JSON.stringify(cb.body);
    const af = ca.body.kind === 'F' ? ca.body.F : comparableField(ca.body);
    const bf = cb.body.kind === 'F' ? cb.body.F : comparableField(cb.body);
    return { φ: '≡', v: VERSION, true: same, distance: distance(af, bf), a: ca.id, b: cb.id, χ: ['≡ iff canonical(a)=canonical(b)'], Ξ: '' };
  }

  function close(seed, options) {
    const opts = options || {};
    const base = A(seed).length ? A(seed) : [invariantField()];
    const fields = base.map(item => canonical(item).F || normalize(rawComparableField(item)));
    const target = opts.target ? canonical(opts.target).F : null;
    const all = fields.slice();
    const gaps = [];
    const transforms = [];
    for (let i = 0; i < fields.length; i += 1) {
      for (let j = i; j < fields.length; j += 1) gaps.push(gap(fields[i], fields[j], 'C'));
      if (target) {
        const t = correction(fields[i], target, 'C');
        transforms.push(t);
        all.push(t.transformed);
      }
    }
    const unique = [];
    const seen = {};
    all.forEach(field => { const c = canonical(field); if (!seen[c.id]) { seen[c.id] = true; unique.push(c.F); } });
    return { φ: 'C', v: VERSION, fields: unique, gaps: gaps.map(g => ({ ω: g.ω, score: g.score, z: g.z })), transforms: transforms.map(t => ({ chosen: t.chosen, reduced: t.reduced, after: t.after.score })), u: { C: 1, ok: unique.every(field => Math.abs(l1(field) - 1) < EPS) }, χ: ['C=finite_closure(F,Δ,T)', 'Ξ=""'], Ξ: '' };
  }

  function proveTransform(transform, current, target, scope) {
    const t = transform && transform.φ === 'T' ? transform : correction(current, target, scope || '⊢');
    const before = gap(current, target, scope || '⊢');
    const after = gap(t.transformed, target, scope || '⊢');
    const valid = validateField(t.transformed).ok;
    const reduced = after.score <= before.score;
    const noEnglish = t.Ξ === '';
    return { φ: '⊢', v: VERSION, true: valid && reduced && noEnglish, valid, reduced, before: before.score, after: after.score, transform: t.chosen, χ: ['⊢ iff ∥T(F)∥₁=1 and Δ decreases and Ξ=""'], Ξ: '' };
  }

  function converge(current, target, options) {
    const opts = options || {};
    const max = Math.max(1, Number(opts.steps || 8));
    let state = canonical(current).F;
    const goal = canonical(target).F;
    const trace = [];
    for (let i = 0; i < max; i += 1) {
      const before = gap(state, goal, 'lim');
      const t = correction(state, goal, 'lim');
      const after = gap(t.transformed, goal, 'lim');
      trace.push({ i, chosen: t.chosen, before: before.score, after: after.score, reduced: after.score <= before.score });
      state = t.transformed;
      if (after.score <= EPS || Math.abs(before.score - after.score) <= EPS) break;
    }
    const finalGap = gap(state, goal, 'lim');
    return { φ: 'lim', v: VERSION, stable: finalGap.score <= EPS || trace.every(row => row.reduced), final: C(state), score: finalGap.score, trace, u: { lim: l1(state), ok: Math.abs(l1(state) - 1) < EPS }, χ: ['lim=iterate(T*) until Δ stops decreasing', 'Ξ=""'], Ξ: '' };
  }

  function ground(value, observations) {
    const c = canonical(value);
    const hasObservation = A(observations).length > 0;
    const field = c.F || comparableField(value);
    const formal = field.length ? validateField(field).ok : true;
    return { φ: 'G', v: VERSION, mode: hasObservation ? 'observed' : 'formal', formal, observed: hasObservation, true: formal && (hasObservation || true), id: c.id, χ: ['formal=internal consistency', 'observed=formal + measurement channel', 'Ξ=""'], Ξ: '' };
  }

  function lexeme(σ, rule, packet, gain) {
    const target = canonical({ φ: 'Λχ', χ: [rule] });
    return { φ: 'Λ', v: VERSION, σ, rule, ν: target.id, source: packet && packet.φ || '∅', c: R(gain || 0), accepted: false, χ: ['Λ=derive(packet fact)', 'Λν=canonical(rule)', 'Ξ=""'], Ξ: '' };
  }

  function packetFacts(packet) {
    if (!packet || typeof packet !== 'object') return [];
    const φ = String(packet.φ || 'Π');
    const out = [];
    function walk(value, path) {
      if (Array.isArray(value)) return;
      if (value && typeof value === 'object') {
        Object.keys(value).sort().forEach(key => {
          if (key === 'χ' || key === 'Ξ' || key === 'v') return;
          walk(value[key], path.concat(key));
        });
        return;
      }
      if (!path.length || path[0] === 'φ') return;
      const p = path.join('.');
      if (typeof value === 'boolean') out.push({ φ, path: p, value, rule: φ + '.' + p + '=' + String(value), gain: 0.7 });
      else if (typeof value === 'number' && Number.isFinite(value)) out.push({ φ, path: p, value: Math.abs(value) <= EPS ? 0 : R(value), rule: φ + '.' + p + '=' + (Math.abs(value) <= EPS ? '0' : String(R(value))), gain: Math.abs(value) <= EPS ? 1 : 0.25 });
      else if (typeof value === 'string' && value !== '') out.push({ φ, path: p, value, rule: φ + '.' + p + '=' + value, gain: 0.4 });
    }
    walk(packet, []);
    return out;
  }

  function lexemeSymbol(fact) {
    if (fact.φ === 'Δ' && fact.path === 'score' && fact.value === 0) return 'Λ:Δ0';
    if (fact.φ === 'δ' && fact.path === 'score' && fact.value === 0) return 'Λ:δ0';
    if (fact.φ === 'T' && fact.path === 'reduced' && fact.value === true) return 'Λ:T↓';
    if (fact.φ === '⊢' && fact.path === 'true' && fact.value === true) return 'Λ:⊢1';
    if (fact.φ === 'lim' && fact.path === 'stable' && fact.value === true) return 'Λ:lim1';
    if (fact.φ === 'G' && fact.path === 'mode' && fact.value === 'formal') return 'Λ:Gf';
    if (fact.φ === 'G' && fact.path === 'mode' && fact.value === 'observed') return 'Λ:Go';
    if (fact.φ === '≡' && fact.path === 'true' && fact.value === true) return 'Λ:≡1';
    if (fact.φ === '≡' && fact.path === 'true' && fact.value === false) return 'Λ:≡0';
    if (fact.value === true) return 'Λ:' + fact.φ + '.' + fact.path + '1';
    if (fact.value === false) return 'Λ:' + fact.φ + '.' + fact.path + '0';
    if (fact.value === 0) return 'Λ:' + fact.φ + '.' + fact.path + '0';
    return 'Λ:' + fact.φ + '.' + fact.path + '=' + String(fact.value);
  }

  function lexemeCandidates(packet) { return packetFacts(packet).map(fact => lexeme(lexemeSymbol(fact), fact.rule, packet, fact.gain)); }

  function acceptLexeme(candidate, registry) {
    const reg = A(registry);
    const conflict = reg.find(item => item && item.φ === 'Λ' && item.σ === candidate.σ && item.ν !== candidate.ν);
    const ok = candidate && candidate.φ === 'Λ' && candidate.Ξ === '' && !conflict;
    return Object.assign({}, C(candidate), { accepted: !!ok, rejected: !ok, conflict: conflict ? conflict.ν : null });
  }

  function deriveLexicon(packets, registry) {
    const reg = A(registry);
    const raw = A(packets).reduce((list, packet) => list.concat(lexemeCandidates(packet)), []);
    const accepted = [];
    const seen = {};
    raw.sort((a, b) => a.σ.localeCompare(b.σ) || a.rule.localeCompare(b.rule)).forEach(candidate => {
      const acc = acceptLexeme(candidate, reg.concat(accepted));
      const key = acc.σ + '|' + acc.ν;
      if (acc.accepted && !seen[key]) { seen[key] = true; accepted.push(acc); }
    });
    const Λ = normalize(accepted.map(item => ({ σ: item.σ, w: Math.max(EPS, item.c || EPS) })));
    return { φ: 'Λ', v: VERSION, Λ, entries: accepted, count: accepted.length, u: { Λ: l1(Λ), ok: Math.abs(l1(Λ) - 1) < EPS }, χ: ['Λ=accepted(kernel-derived facts)', 'no σ conflict', 'Ξ=""'], Ξ: '' };
  }

  function resolveLexeme(symbol, lexicon) {
    const entries = lexicon && A(lexicon.entries) || A(lexicon);
    const matches = entries.filter(item => item && item.φ === 'Λ' && item.σ === symbol && item.accepted === true);
    return { φ: 'Λ?', v: VERSION, σ: symbol, ok: matches.length === 1, matches: C(matches), χ: ['Λ? resolves iff exactly one accepted σ'], Ξ: '' };
  }

  function countMap(list) {
    const out = {};
    A(list).forEach(item => { out[item] = (out[item] || 0) + 1; });
    return out;
  }

  function ngrams(symbols, max) {
    const out = {};
    const size = Math.max(1, Number(max) || 1);
    for (let n = 1; n <= size; n += 1) for (let i = 0; i <= symbols.length - n; i += 1) {
      const key = symbols.slice(i, i + n).join('');
      out[key] = (out[key] || 0) + 1;
    }
    return out;
  }

  function repeatedPatterns(symbols, maxN, minRepeat) {
    const counts = ngrams(symbols, maxN);
    return Object.keys(counts).map(pattern => ({ pattern, count: counts[pattern], size: Array.from(pattern).length, gain: Math.max(0, (Array.from(pattern).length - 1) * (counts[pattern] - 1)) }))
      .filter(item => item.size > 1 && item.count >= minRepeat && item.gain > 0)
      .sort((a, b) => b.gain - a.gain || b.size - a.size || a.pattern.localeCompare(b.pattern));
  }

  function sense(raw) {
    const text = String(raw == null ? '' : raw);
    const symbols = Array.from(text);
    return { raw: text, symbols, count: symbols.length, distinct: Object.keys(countMap(symbols)).length, checksum: checksum(text) };
  }

  function create(seed) {
    const state = { version: VERSION, rule: '∥Ω∥₁=1', time: 0, params: Object.assign({ max_ngram: 4, min_repeat: 2, max_tokens: 144, max_relations: 288 }, seed && seed.params || {}), memory: { seen: 0, tokens: [], token_index: {}, relation_counts: {}, relations: [] }, input: null, τ: normalize([['∅', 1]]), ρ: normalize([['∅', 1]]), μ: normalize([['∅', 1]]), ε: normalize([['ε₀', 1]]), λ: normalize([['∅', 1]]), ι: normalize([['ι□', 1]]), κ: normalize([['κ₀', 1]]), Ω: normalize([['λ', 1]]), Λ: normalize([['Λ∅', 1]]), χ: [], Ξ: '', trace: [] };
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
        const token = memory.tokens.find(item => item.id === memory.token_index[candidate.pattern]);
        if (token) { token.count += candidate.count; token.gain += candidate.gain; }
      }
    });
    const active = candidates.map(candidate => memory.tokens.find(token => token.pattern === candidate.pattern)).filter(Boolean).slice(0, 12);
    for (let i = 0; i < active.length; i += 1) for (let j = i + 1; j < active.length; j += 1) {
      const a = active[i].id;
      const b = active[j].id;
      const key = a < b ? a + '↔' + b : b + '↔' + a;
      memory.relation_counts[key] = (memory.relation_counts[key] || 0) + 1;
    }
    memory.relations = Object.keys(memory.relation_counts).map((key, index) => { const pair = key.split('↔'); return { id: 'ρ' + (index + 1), a: pair[0], b: pair[1], count: memory.relation_counts[key] }; }).sort((a, b) => b.count - a.count).slice(0, state.params.max_relations);
    return candidates;
  }

  function updateFields(state, sensory, candidates) {
    const memory = state.memory;
    state.τ = memory.tokens.length ? normalize(memory.tokens.map(token => ({ σ: token.id, w: Math.max(1, token.gain + token.count) }))) : normalize([['τ∅', 1]]);
    state.ρ = memory.relations.length ? normalize(memory.relations.map(rel => ({ σ: rel.id, w: Math.max(1, rel.count) }))) : normalize([['ρ∅', 1]]);
    state.μ = memory.tokens.length || memory.relations.length ? normalize(memory.tokens.map(token => ({ σ: 'μ' + token.id.replace('τ', ''), w: Math.max(1, token.count) })).concat(memory.relations.map((rel, index) => ({ σ: 'μρ' + (index + 1), w: Math.max(1, rel.count) })))) : normalize([['μ∅', 1]]);
    const compression = sensory.count ? Math.min(1, A(candidates).reduce((sum, item) => sum + item.gain, 0) / Math.max(1, sensory.count * 2)) : 0;
    const uncertainty = R(1 - compression);
    state.ε = normalize([['ε↓', Math.max(0.0001, compression)], ['ε↑', Math.max(0.0001, uncertainty)]]);
    state.λ = blend([{ field: state.τ, gain: 0.30 }, { field: state.ρ, gain: 0.24 }, { field: state.μ, gain: 0.26 }, { field: state.ε, gain: 0.20 }]);
    const relationPressure = memory.relations.length ? Math.min(1, memory.relations.length / 16) : 0;
    const bindingPressure = memory.tokens.length ? Math.min(1, memory.tokens.length / 16) : 0;
    state.ι = normalize([['ι⊕', Math.max(0.0001, compression)], ['ι↔', Math.max(0.0001, relationPressure)], ['ιμ', Math.max(0.0001, bindingPressure)], ['ι?', Math.max(0.0001, uncertainty * 0.75)], ['ι□', Math.max(0.0001, uncertainty * 0.50)]]);
    state.κ = normalize([['κλ', l1(state.λ)], ['κι', l1(state.ι)], ['κε', l1(state.ε)], ['κΩ', l1(state.Ω)]]);
  }

  function rebalance(state) {
    state.λ = normalize(state.λ);
    state.ι = normalize(state.ι);
    state.ε = normalize(state.ε);
    state.κ = normalize(state.κ);
    state.Λ = normalize(state.Λ || [['Λ∅', 1]]);
    state.Ω = blend([{ field: state.λ.map(row => ({ σ: 'λ:' + row.σ, w: row.w })), gain: 0.32 }, { field: state.ι.map(row => ({ σ: 'ι:' + row.σ, w: row.w })), gain: 0.27 }, { field: state.ε.map(row => ({ σ: 'ε:' + row.σ, w: row.w })), gain: 0.16 }, { field: state.κ.map(row => ({ σ: 'κ:' + row.σ, w: row.w })), gain: 0.14 }, { field: state.Λ.map(row => ({ σ: 'Λ:' + row.σ, w: row.w })), gain: 0.11 }]);
    state.χ = INVARIANTS.map(row => row.row).concat(['δ.score=0⇒δ=δ0', 'Δ.score=0⇒Δ=Δ0', 'Λ=derive(packet fact)', 'δ=𝒩(|e-a|⊕|1-∥a∥₁|⊕δ?)', 'Δ=𝒩(Δσ⊕Δw⊕Δ∥⊕Δχ⊕Δ?)', 'ν=canonical(x)', '≡ iff canonical(a)=canonical(b)', 'C=finite_closure(F,Δ,T)', '⊢=invariant_preserving_transform', 'λ=𝒩(τ⊕ρ⊕μ⊕ε)', 'ι=𝒩(λτ⊕λρ⊕λμ⊕λε)', 'Ω=𝒩(λ⊕ι⊕ε⊕κ⊕Λ)']);
    state.unit = unitReport(state);
    return state;
  }

  function unitReport(state) {
    return { τ: l1(state.τ), ρ: l1(state.ρ), μ: l1(state.μ), ε: l1(state.ε), λ: l1(state.λ), ι: l1(state.ι), κ: l1(state.κ), Λ: l1(state.Λ), Ω: l1(state.Ω), ok: [state.τ, state.ρ, state.μ, state.ε, state.λ, state.ι, state.κ, state.Λ, state.Ω].every(field => Math.abs(l1(field) - 1) < EPS) };
  }

  function observe(state, raw) {
    const before = C({ λ: state.λ, ι: state.ι, Ω: state.Ω, Λ: state.Λ });
    const sensory = sense(raw);
    const candidates = remember(state, sensory);
    state.input = { count: sensory.count, distinct: sensory.distinct, checksum: sensory.checksum };
    state.time += 1;
    updateFields(state, sensory, candidates);
    rebalance(state);
    const after = C({ λ: state.λ, ι: state.ι, Ω: state.Ω, Λ: state.Λ });
    state.trace.unshift({ t: state.time, Δλ: distance(before.λ, after.λ), Δι: distance(before.ι, after.ι), ΔΩ: distance(before.Ω, after.Ω), ΔΛ: distance(before.Λ, after.Λ), τ: state.memory.tokens.length, ρ: state.memory.relations.length, u: state.unit.ok });
    state.trace = state.trace.slice(0, 128);
    return packet(state);
  }

  function step(state, raw) { return observe(state, raw); }

  function packet(state) {
    return { φ: 'Ω', v: VERSION, t: state.time, λ: C(state.λ), ι: C(state.ι), τ: C(state.τ), ρ: C(state.ρ), μ: C(state.μ), ε: C(state.ε), κ: C(state.κ), Λ: C(state.Λ), Ω: C(state.Ω), χ: C(state.χ), u: C(state.unit), d: { Hλ: entropy(state.λ), Hι: entropy(state.ι), HΛ: entropy(state.Λ), HΩ: entropy(state.Ω) }, Ξ: '' };
  }

  function snapshot(state) { return C(state); }

  return Object.freeze({ VERSION, definitions, invariants, invariantField, validateField, create, observe, step, packet, snapshot, normalize, l1, blend, distance, entropy, discrepancy, gap, correction, canonical, equivalent, close, proveTransform, converge, ground, deriveLexicon, acceptLexeme, resolveLexeme, rebalance, unitReport });
});
