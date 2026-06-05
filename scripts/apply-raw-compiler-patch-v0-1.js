const fs = require('fs');

const path = 'src/language-parser-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('function compileRaw(source, options)')) {
  const marker = `  function splitTopLevel(text, separator) {
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
`;

  const rawCompiler = String.raw`
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
`;

  if (!s.includes(marker)) throw new Error('splitTopLevel marker not found');
  s = s.replace(marker, marker + rawCompiler);
}

if (!s.includes('function rawToKernelFields(input, options)')) {
  const marker = `  function toKernelCompletion(input, kernel, options) {
    if (!kernel || typeof kernel.complete !== 'function') throw new Error('Kernel with complete(...) is required');
    const opts = options || {};
    const seed = opts.whole === true ? [toKernelSeed(input, opts.parse)] : toKernelFields(input, opts.parse);
    return kernel.complete(seed, opts.complete || {});
  }
`;

  const rawKernel = `
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
`;

  if (!s.includes(marker)) throw new Error('toKernelCompletion marker not found');
  s = s.replace(marker, marker + rawKernel);
}

s = s.replace('    fromKernelPacket,\n    toKernelFields,', '    fromKernelPacket,\n    compileRaw,\n    rawToSymbolic,\n    toKernelFields,');
s = s.replace('    toKernelCompletion,\n    validate,', '    toKernelCompletion,\n    rawToKernelFields,\n    rawToKernelSeed,\n    rawToKernelCompletion,\n    validate,');

fs.writeFileSync(path, s);
console.log('raw compiler patch applied');
