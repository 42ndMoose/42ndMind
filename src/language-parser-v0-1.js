(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindLanguageParser = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;
  const ORDER = ['τ', 'ρ', 'μ', 'ε', 'λ', 'ι', 'κ', 'Ω'];
  const EMPTY = { τ: 'τ∅', ρ: 'ρ∅', μ: 'μ∅', ε: 'ε∅', λ: 'λ∅', ι: 'ι∅', κ: 'κ∅', Ω: 'Ω∅' };

  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(6));
  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));

  function axis(row) {
    if (Array.isArray(row)) return String(row[0] == null ? '∅' : row[0]).trim();
    return String((row && (row.σ ?? row.axis ?? row.dimension)) ?? '∅').trim();
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

  function n(value) {
    const out = R(value);
    return Object.is(out, -0) ? 0 : out;
  }

  function formatNumber(value) {
    const fixed = n(value).toFixed(6);
    return fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function splitTopLevel(text, separator) {
    const parts = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (ch === '[' || ch === '{') depth += 1;
      if (ch === ']' || ch === '}') depth -= 1;
      if (ch === separator && depth === 0) {
        if (current.trim()) parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  function parseRows(body) {
    const rows = [];
    if (!body.trim()) return rows;
    splitTopLevel(body, ',').forEach(part => {
      const at = part.indexOf('=');
      if (at <= 0) throw new Error('Invalid row: ' + part);
      const key = part.slice(0, at).trim();
      const value = Number(part.slice(at + 1).trim());
      if (!key) throw new Error('Missing row symbol');
      if (!Number.isFinite(value)) throw new Error('Invalid row weight for ' + key);
      rows.push({ σ: key, w: value });
    });
    return rows;
  }

  function parseField(text) {
    const match = /^([τρμελικΩ])\[(.*)\]$/u.exec(text.trim());
    if (!match) throw new Error('Invalid field: ' + text);
    return { key: match[1], rows: parseRows(match[2]) };
  }

  function parse(source, options) {
    const opts = Object.assign({ normalize: true, requireAll: true }, options || {});
    const compact = String(source == null ? '' : source).replace(/\s+/g, '');
    const match = /^Ω\{(.*)\}$/u.exec(compact);
    if (!match) throw new Error('Packet must match Ω{...}');

    const fields = {};
    splitTopLevel(match[1], ';').forEach(part => {
      const field = parseField(part);
      if (fields[field.key]) throw new Error('Duplicate field: ' + field.key);
      fields[field.key] = opts.normalize ? normalize(field.rows, EMPTY[field.key]) : field.rows;
    });

    if (opts.requireAll) {
      ORDER.forEach(key => {
        if (!fields[key]) throw new Error('Missing field: ' + key);
      });
    }

    ORDER.forEach(key => {
      if (!fields[key]) fields[key] = normalize([], EMPTY[key]);
    });

    const unit = unitReport(fields);
    if (!opts.normalize && !unit.ok) throw new Error('Unit invariant failed');

    return {
      φ: 'Ω',
      v: VERSION,
      fields,
      u: unit,
      Ξ: ''
    };
  }

  function unitReport(fields) {
    const report = {};
    ORDER.forEach(key => { report[key] = l1(fields[key]); });
    report.ok = ORDER.every(key => Math.abs(report[key] - 1) < EPS);
    return report;
  }

  function sourceFields(packet) {
    if (packet && packet.fields) return packet.fields;
    const fields = {};
    ORDER.forEach(key => { fields[key] = A(packet && packet[key]).length ? packet[key] : normalize([], EMPTY[key]); });
    return fields;
  }

  function canonical(packet) {
    const src = sourceFields(packet || {});
    const fields = {};
    ORDER.forEach(key => {
      fields[key] = normalize(src[key], EMPTY[key]).slice().sort((a, b) => axis(a).localeCompare(axis(b)));
    });
    return {
      φ: 'Ω',
      v: VERSION,
      fields,
      u: unitReport(fields),
      Ξ: ''
    };
  }

  function serialize(packet) {
    const p = canonical(packet);
    const body = ORDER.map(key => {
      const rows = A(p.fields[key]).map(row => axis(row) + '=' + formatNumber(weight(row))).join(',');
      return key + '[' + rows + ']';
    }).join(';');
    return 'Ω{' + body + '}';
  }

  function roundTrip(source) {
    const parsed = parse(source);
    const text = serialize(parsed);
    const reparsed = parse(text);
    return {
      text,
      parsed,
      reparsed,
      same: JSON.stringify(canonical(parsed)) === JSON.stringify(canonical(reparsed))
    };
  }

  function fromKernelPacket(packet) {
    return canonical(packet);
  }

  function validate(source) {
    try {
      const result = roundTrip(source);
      return { ok: true, result, errors: [] };
    } catch (err) {
      return { ok: false, result: null, errors: [String(err && err.message || err)] };
    }
  }

  return Object.freeze({
    VERSION,
    ORDER: ORDER.slice(),
    parse,
    serialize,
    canonical,
    roundTrip,
    fromKernelPacket,
    validate,
    normalize,
    l1,
    unitReport
  });
});
