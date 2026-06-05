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

  function safeSymbol(value, fallback) {
    const clean = String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    return clean || fallback || 'x';
  }

  function countMap(values) {
    const out = {};
    A(values).forEach(value => {
      const key = String(value);
      out[key] = (out[key] || 0) + 1;
    });
    return out;
  }

  function topCountRows(prefix, values, limit) {
    const counts = countMap(values);
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))
      .slice(0, limit || 12)
      .map(key => ({ σ: prefix + safeSymbol(key), w: counts[key] }));
  }

  function rawTokens(text) {
    return String(text == null ? '' : text).toLowerCase().match(/[a-z0-9]+/g) || [];
  }

  function rawBigrams(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length - 1; i += 1) out.push(tokens[i] + '-' + tokens[i + 1]);
    return out;
  }

  function rawIntentRows(text, tokens) {
    const lower = String(text || '').toLowerCase();
    const rows = [];
    if (/[?]/.test(text)) rows.push({ σ: 'intent:question', w: 1 });
    if (/\b(please|can|could|would|make|do|show|give|check|fix|finish)\b/.test(lower)) rows.push({ σ: 'intent:request', w: 1 });
    if (/\b(is|are|was|were|does|did|because|therefore|so|means|implies)\b/.test(lower)) rows.push({ σ: 'intent:claim', w: 1 });
    if (/!/.test(text)) rows.push({ σ: 'intent:emphasis', w: 0.5 });
    if (!rows.length && A(tokens).length) rows.push({ σ: 'intent:statement', w: 1 });
    return rows;
  }

  function compileRaw(source, options) {
    const opts = Object.assign({ maxTokens: 12, maxRelations: 12 }, options || {});
    const text = String(source == null ? '' : source).trim();
    const tokens = rawTokens(text);
    if (!text || !tokens.length) throw new Error('Raw input has no tokenizable content');
    const bigrams = rawBigrams(tokens);
    const τ = normalize(topCountRows('tok:', tokens, opts.maxTokens), EMPTY.τ);
    const ρ = normalize(bigrams.length ? topCountRows('rel:', bigrams, opts.maxRelations) : [{ σ: 'rel:single-token', w: 1 }], EMPTY.ρ);
    const μ = normalize(τ.map(row => ({ σ: 'mean:' + row.σ.slice(4), w: row.w })).concat(ρ.slice(0, 4).map(row => ({ σ: 'mean:' + row.σ.slice(4), w: row.w * 0.5 }))), EMPTY.μ);
    const ε = normalize([{ σ: 'raw:tokenized', w: tokens.length }, { σ: 'raw:relations', w: Math.max(1, bigrams.length) }, { σ: 'raw:unverified-semantics', w: 1 }], EMPTY.ε);
    const λ = normalize([{ σ: 'lex:tokens', w: τ.length }, { σ: 'lex:relations', w: ρ.length }, { σ: 'lex:meaning-candidates', w: μ.length }, { σ: 'lex:evidence', w: ε.length }], EMPTY.λ);
    const ι = normalize(rawIntentRows(text, tokens), EMPTY.ι);
    const κ = normalize([{ σ: 'constraint:deterministic-raw-compiler', w: 1 }, { σ: 'constraint:no-llm-semantics', w: 1 }, { σ: 'constraint:unit-total-output', w: 1 }], EMPTY.κ);
    const Ω = normalize([{ σ: 'τ:tokens', w: 0.20 }, { σ: 'ρ:relations', w: 0.16 }, { σ: 'μ:meaning-candidates', w: 0.18 }, { σ: 'ε:raw-evidence', w: 0.14 }, { σ: 'λ:lexical-shape', w: 0.12 }, { σ: 'ι:intent-shape', w: 0.10 }, { σ: 'κ:compiler-constraints', w: 0.10 }], EMPTY.Ω);
    return { φ: 'Ω', v: VERSION, mode: 'raw_compiled', fields: { τ, ρ, μ, ε, λ, ι, κ, Ω }, raw: { length: text.length, tokens: tokens.length, relations: bigrams.length }, u: unitReport({ τ, ρ, μ, ε, λ, ι, κ, Ω }), Ξ: '' };
  }

  function rawToSymbolic(source, options) {
    return serialize(compileRaw(source, options));
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

  function toKernelFields(input, options) {
    const packet = typeof input === 'string' ? parse(input, options) : canonical(input);
    const fields = sourceFields(packet);
    return ORDER.map(key => A(fields[key]).map(row => ({ σ: key + ':' + axis(row), w: weight(row) })));
  }

  function toKernelSeed(input, options) {
    return toKernelFields(input, options).reduce((rows, field) => rows.concat(field), []);
  }

  function toKernelCompletion(input, kernel, options) {
    if (!kernel || typeof kernel.complete !== 'function') throw new Error('Kernel with complete(...) is required');
    const opts = options || {};
    const seed = opts.whole === true ? [toKernelSeed(input, opts.parse)] : toKernelFields(input, opts.parse);
    return kernel.complete(seed, opts.complete || {});
  }

  function rawToKernelFields(input, options) {
    return toKernelFields(compileRaw(input, options));
  }

  function rawToKernelSeed(input, options) {
    return toKernelSeed(compileRaw(input, options));
  }

  function rawToKernelCompletion(input, kernel, options) {
    if (!kernel || typeof kernel.complete !== 'function') throw new Error('Kernel with complete(...) is required');
    const opts = options || {};
    const packet = compileRaw(input, opts.raw);
    const seed = opts.whole === true ? [toKernelSeed(packet)] : toKernelFields(packet);
    return kernel.complete(seed, opts.complete || {});
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
    compileRaw,
    rawToSymbolic,
    toKernelFields,
    toKernelSeed,
    toKernelCompletion,
    rawToKernelFields,
    rawToKernelSeed,
    rawToKernelCompletion,
    validate,
    normalize,
    l1,
    unitReport
  });
});
