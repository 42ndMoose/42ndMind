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
  let MathAstCore = null;
  try { if (typeof require === 'function') MathAstCore = require('./math-ast-core-v0-1.js'); } catch (_) { MathAstCore = null; }


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

  function l1(field) { return R(A(field).reduce((sum, row) => sum + Math.abs(weight(row)), 0)); }
  function fmt(value) { return R(value).toFixed(6).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1'); }
  function safeSymbol(value, fallback) {
    const clean = String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    return clean || fallback || 'x';
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
      } else current += ch;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  function unitReport(fields) {
    const report = {};
    ORDER.forEach(key => { report[key] = l1(fields[key]); });
    report.ok = ORDER.every(key => Math.abs(report[key] - 1) < EPS);
    return report;
  }

  function countMap(values) {
    const out = {};
    A(values).forEach(value => { const key = String(value); out[key] = (out[key] || 0) + 1; });
    return out;
  }

  function topCountRows(prefix, values, limit) {
    const counts = countMap(values);
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b)).slice(0, limit || 12).map(key => ({ σ: prefix + safeSymbol(key), w: counts[key] }));
  }

  function rawTokens(text) { return String(text == null ? '' : text).toLowerCase().match(/[a-z0-9]+/g) || []; }
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
    if (/\b(is|are|was|were|does|do|did|because|therefore|so|means|implies|should)\b/.test(lower)) rows.push({ σ: 'intent:claim', w: 1 });
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
    const fields = { τ, ρ, μ, ε, λ, ι, κ, Ω };
    return { φ: 'Ω', v: VERSION, mode: 'raw_compiled', fields, raw: { length: text.length, tokens: tokens.length, relations: bigrams.length }, u: unitReport(fields), Ξ: '' };
  }

  function claimObject(value) { return safeSymbol(String(value == null ? '' : value).replace(/[?.!]+$/g, ''), 'unknown'); }

  function claimPacket(mode, subject, relation, object, source, scope) {
    const σ = mode === 'query' ? 'Γ?:' + subject + '.' + relation : 'Γ:' + subject + '.' + relation + '=' + object;
    const Γ = normalize([{ σ, w: 0.40 }, { σ: 'subject:' + subject, w: 0.15 }, { σ: 'relation:' + relation, w: 0.15 }, { σ: 'object:' + (object || '?'), w: 0.15 }, { σ: 'source:' + source, w: 0.10 }, { σ: 'scope:' + scope, w: 0.05 }], 'Γ∅');
    return { φ: mode === 'query' ? 'Γ?' : 'Γ', v: VERSION, mode, subject, relation, object: object || null, source, scope, Γ, key: subject + '.' + relation, statement: σ, u: { Γ: l1(Γ), ok: Math.abs(l1(Γ) - 1) < EPS }, Ξ: '' };
  }

  function stancePacket(quantifier, subject, relation, object) {
    const q = claimObject(quantifier || 'unspecified');
    const subj = claimObject(subject);
    const rel = claimObject(relation);
    const obj = claimObject(object);
    const key = subj + '.' + rel + '.q=' + q;
    const baseKey = subj + '.' + rel + '=' + obj;
    const σ = 'Γ:' + key + '=' + obj;
    const Γ = normalize([{ σ, w: 0.34 }, { σ: 'subject:' + subj, w: 0.13 }, { σ: 'relation:' + rel, w: 0.13 }, { σ: 'object:' + obj, w: 0.13 }, { σ: 'quantifier:' + q, w: 0.12 }, { σ: 'source:speaker-stance', w: 0.08 }, { σ: q === 'unspecified' ? 'elaboration:required' : 'elaboration:not-required', w: 0.07 }], 'Γ∅');
    return { φ: 'Γ', v: VERSION, mode: 'stance', subject: subj, relation: rel, object: obj, quantifier: q, source: 'speaker_stance', scope: 'normative', elaboration_required: q === 'unspecified', elaboration_reason: q === 'unspecified' ? 'missing_quantifier' : null, key, base_key: baseKey, statement: σ, u: { Γ: l1(Γ), ok: Math.abs(l1(Γ) - 1) < EPS }, Γ, Ξ: '' };
  }

  function compileClaim(source, options) {
    const opts = options || {};
    const text = String(source == null ? '' : source).trim();
    const lower = text.toLowerCase().replace(/\s+/g, ' ').trim();
    let m = /^(?:my name is|i am|i'm|call me)\s+([a-z0-9][a-z0-9_-]*)[.!?]*$/i.exec(text);
    if (m) return claimPacket('assert', 'self', 'name', claimObject(m[1]), 'self_report', 'identity');
    m = /^my\s+([a-z0-9_-]+)\s+is\s+(.+?)[.!?]*$/i.exec(text);
    if (m) return claimPacket('assert', 'self', claimObject(m[1]), claimObject(m[2]), 'self_report', opts.scope || 'self_attribute');
    if (/^(what is my name|who am i)\??$/i.test(lower)) return claimPacket('query', 'self', 'name', null, 'user_query', 'identity');
    m = /^what is my\s+([a-z0-9_-]+)\??$/i.exec(lower);
    if (m) return claimPacket('query', 'self', claimObject(m[1]), null, 'user_query', 'self_attribute');
    m = /^(all|some)\s+([a-z0-9][a-z0-9 _-]*?)\s+should(?:n't|n’t| not)\s+(.+?)[.!?]*$/i.exec(text);
    if (m) return stancePacket(claimObject(m[1]), m[2], 'should-not', m[3]);
    m = /^(all|some)\s+([a-z0-9][a-z0-9 _-]*?)\s+should\s+(.+?)[.!?]*$/i.exec(text);
    if (m) return stancePacket(claimObject(m[1]), m[2], 'should', m[3]);
    m = /^([a-z0-9][a-z0-9 _-]*?)\s+should(?:n't|n’t| not)\s+(.+?)[.!?]*$/i.exec(text);
    if (m) return stancePacket('unspecified', m[1], 'should-not', m[2]);
    m = /^([a-z0-9][a-z0-9 _-]*?)\s+should\s+(.+?)[.!?]*$/i.exec(text);
    if (m) return stancePacket('unspecified', m[1], 'should', m[2]);
    throw new Error('No deterministic claim pattern matched');
  }

  function rawToClaimCandidates(source, options) { try { return [compileClaim(source, options)]; } catch (err) { return []; } }
  function relationSymbol(value) { return String(value || '').replace('≥', '>=').replace('≤', '<=').replace('⇒', '=>').trim(); }
  function domainSymbol(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'ℝ' || raw === 'r' || raw === 'real' || raw === 'reals') return 'real';
    if (raw === 'ℤ' || raw === 'z' || raw === 'integer' || raw === 'integers') return 'integer';
    if (raw === 'ℕ' || raw === 'n' || raw === 'natural' || raw === 'naturals') return 'natural';
    return claimObject(raw || 'unspecified');
  }

  function mathOperators(text) {
    const raw = String(text || '');
    const ops = [];
    if (/\+/.test(raw)) ops.push('+');
    if (/-/.test(raw) && !/=>/.test(raw)) ops.push('-');
    if (/\//.test(raw)) ops.push('/');
    if (/\*/.test(raw)) ops.push('*');
    if (/[²^]2/.test(raw) || /²/.test(raw)) ops.push('square');
    if (/(=>|⇒)/.test(raw)) ops.push('=>');
    return ops;
  }

  function mathPacket(data) {
    const variables = A(data.variables);
    const operators = A(data.operators);
    const domain = data.domain || 'unspecified';
    const quantifier = data.quantifier || 'unspecified';
    const relation = data.relation || 'none';
    const rows = [{ σ: 'mode:' + claimObject(data.mode), w: 0.16 }, { σ: 'relation:' + claimObject(relation), w: 0.13 }, { σ: 'quantifier:' + claimObject(quantifier), w: 0.12 }, { σ: 'domain:' + claimObject(domain), w: 0.12 }, { σ: data.elaboration_required ? 'elaboration:required' : 'elaboration:not-required', w: 0.10 }];
    variables.forEach(v => rows.push({ σ: 'var:' + claimObject(v), w: 0.07 }));
    operators.forEach(op => rows.push({ σ: 'op:' + claimObject(op), w: 0.07 }));
    if (data.left) rows.push({ σ: 'left:' + claimObject(data.left), w: 0.07 });
    if (data.right) rows.push({ σ: 'right:' + claimObject(data.right), w: 0.07 });
    if (data.condition) rows.push({ σ: 'condition:' + claimObject(data.condition), w: 0.07 });
    if (data.result) rows.push({ σ: 'result:' + claimObject(data.result), w: 0.07 });
    if (data.rule) rows.push({ σ: 'rule:' + claimObject(data.rule), w: 0.07 });
    const M = normalize(rows, 'M∅');
    return Object.assign({ φ: 'M', v: VERSION, source: 'formal_math', M, u: { M: l1(M), ok: Math.abs(l1(M) - 1) < EPS }, Ξ: '' }, data, { domain, quantifier, relation, variables, operators });
  }

  function compileMath(source) {
    const text = String(source == null ? '' : source).trim();
    let m = /^∀\s*([a-zA-Z])\s*(?:∈|in)\s*(ℝ|R|real|reals|ℤ|Z|integer|integers|ℕ|N|natural|naturals)\s*,\s*(.+?)\s*(≥|>=|≤|<=|>|<|=)\s*(.+)$/i.exec(text);
    if (m) return mathPacket({ mode: 'theorem', raw: text, variables: [m[1].toLowerCase()], operators: mathOperators(m[3] + m[5]), quantifier: 'all', domain: domainSymbol(m[2]), relation: relationSymbol(m[4]), left: m[3].trim(), right: m[5].trim(), elaboration_required: false, solved: false });
    m = /^([a-zA-Z])\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)$/.exec(text);
    if (m) return mathPacket({ mode: 'equation', raw: text, variables: [m[1].toLowerCase()], operators: [m[2]], quantifier: 'unspecified', domain: 'unspecified', relation: '=', left: m[1] + m[2] + m[3], right: m[4], elaboration_required: true, solved: false });
    m = /^([a-zA-Z])\s*\/\s*([a-zA-Z])\s+is\s+undefined\s+when\s+([a-zA-Z])\s*=\s*0$/i.exec(text);
    if (m) return mathPacket({ mode: 'constraint', raw: text, variables: [m[1].toLowerCase(), m[2].toLowerCase()], operators: ['/'], quantifier: 'all', domain: 'unspecified', relation: 'undefined-when', left: m[1] + '/' + m[2], right: 'undefined', condition: m[3].toLowerCase() + '=0', result: 'undefined', elaboration_required: false, solved: false });
    m = /^if\s+([a-zA-Z])\s*(?:=>|⇒)\s*([a-zA-Z])\s+and\s+\1\s*,?\s*then\s+\2$/i.exec(text);
    if (m) return mathPacket({ mode: 'proof-rule', raw: text, variables: [m[1].toUpperCase(), m[2].toUpperCase()], operators: ['=>'], quantifier: 'rule', domain: 'logic', relation: 'therefore', left: m[1].toUpperCase() + '=>' + m[2].toUpperCase(), right: m[2].toUpperCase(), rule: 'modus-ponens', elaboration_required: false, solved: false });
    m = /^([a-zA-Z])\s*(≥|>=|≤|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)$/.exec(text);
    if (m) return mathPacket({ mode: 'relation', raw: text, variables: [m[1].toLowerCase()], operators: [], quantifier: 'unspecified', domain: 'unspecified', relation: relationSymbol(m[2]), left: m[1].toLowerCase(), right: m[3], elaboration_required: true, solved: false });
    throw new Error('No deterministic math pattern matched');
  }

  function solveLinearEquation(input) {
    const text = typeof input === 'string' ? input.replace(/\s+/g, '') : String(input && input.equation || '').replace(/\s+/g, '');
    const m = /^([a-zA-Z])([+\-*/])(-?\d+(?:\.\d+)?)=(-?\d+(?:\.\d+)?)$/.exec(text);
    if (!m) return { ok: false, reason: 'unsupported_linear_form' };
    const variable = m[1];
    const op = m[2];
    const a = Number(m[3]);
    const b = Number(m[4]);
    let value;
    if (op === '+') value = b - a;
    else if (op === '-') value = b + a;
    else if (op === '*') value = b / a;
    else if (op === '/') value = b * a;
    if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };
    return { ok: true, variable, value, relation: '=', steps: ['parse-linear-one-step', 'apply-inverse-operation'] };
  }

  function checkProofStep(input) {
    const data = typeof input === 'string' ? { text: input } : (input || {});
    const text = String(data.text || '').replace(/\s+/g, '');
    const premises = Array.isArray(data.premises) ? data.premises.map(String) : [];
    const conclusion = String(data.conclusion || '');
    const joined = premises.join('&').replace(/\s+/g, '');
    const src = text || (joined + '=>' + conclusion.replace(/\s+/g, ''));
    const m = /(?:if)?([A-Z])(?:=>|⇒)([A-Z])(?:and|&)(\1)(?:,?then|=>)(\2)/i.exec(src);
    if (m) return { ok: true, rule: 'modus-ponens', conclusion: m[2].toUpperCase() };
    const implication = premises.find(p => /(?:=>|⇒)/.test(p));
    if (implication) {
      const r = /^\s*([A-Z])\s*(?:=>|⇒)\s*([A-Z])\s*$/i.exec(implication);
      if (r && premises.map(p => p.trim().toUpperCase()).includes(r[1].toUpperCase()) && conclusion.trim().toUpperCase() === r[2].toUpperCase()) return { ok: true, rule: 'modus-ponens', conclusion: r[2].toUpperCase() };
    }
    return { ok: false, reason: 'unsupported_proof_step' };
  }

  function solveTwoStepLinearEquation(input) {
    const text = typeof input === 'string' ? input.replace(/\s+/g, '') : String(input && input.equation || '').replace(/\s+/g, '');
    const m = /^(-?\d+(?:\.\d+)?)?([a-zA-Z])([+\-])(-?\d+(?:\.\d+)?)=(-?\d+(?:\.\d+)?)$/.exec(text);
    if (!m) return { ok: false, reason: 'unsupported_two_step_linear_form' };
    const coefficient = m[1] === undefined || m[1] === '' ? 1 : Number(m[1]);
    const variable = m[2];
    const op = m[3];
    const offset = Number(m[4]);
    const target = Number(m[5]);
    const shifted = op === '+' ? target - offset : target + offset;
    const value = shifted / coefficient;
    if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };
    return { ok: true, variable, value, relation: '=', steps: ['parse-two-step-linear', 'undo-offset', 'divide-by-coefficient'] };
  }

  function checkHypotheticalSyllogism(input) {
    const data = typeof input === 'string' ? { text: input } : (input || {});
    const text = String(data.text || '').replace(/\s+/g, '');
    const direct = /(?:if)?([A-Z])(?:=>|⇒)([A-Z])(?:and|&)(\2)(?:=>|⇒)([A-Z])(?:and|&)(\1)(?:,?then|=>)(\4)/i.exec(text);
    if (direct) return { ok: true, rule: 'hypothetical-syllogism+modus-ponens', conclusion: direct[4].toUpperCase() };
    const premises = Array.isArray(data.premises) ? data.premises.map(String) : [];
    const conclusion = String(data.conclusion || '').trim().toUpperCase();
    const implications = premises.map(p => /^\s*([A-Z])\s*(?:=>|⇒)\s*([A-Z])\s*$/i.exec(p)).filter(Boolean);
    const facts = premises.filter(p => !/(?:=>|⇒)/.test(p)).map(p => p.trim().toUpperCase());
    for (const first of implications) {
      for (const second of implications) {
        if (first[2].toUpperCase() === second[1].toUpperCase() && facts.includes(first[1].toUpperCase()) && conclusion === second[2].toUpperCase()) {
          return { ok: true, rule: 'hypothetical-syllogism+modus-ponens', conclusion };
        }
      }
    }
    return { ok: false, reason: 'unsupported_hypothetical_syllogism' };
  }


  function proveSquareNonnegative(input) {
    const data = typeof input === 'string' ? { raw: input } : (input || {});
    const raw = String(data.raw || data.text || '').replace(/s+/g, '');
    const left = String(data.left || '').replace(/s+/g, '');
    const right = String(data.right == null ? '' : data.right).replace(/s+/g, '');
    const relation = String(data.relation || '').replace('≥', '>=').trim();
    const domain = String(data.domain || '').toLowerCase();
    const joined = raw || (left + relation + right);
    const hasSquare = /[a-zA-Z](?:^2|²)/.test(joined) || /[a-zA-Z](?:^2|²)/.test(left);
    const nonnegative = /(>=|≥)0$/.test(joined) || (relation === '>=' && right === '0');
    const realDomain = !domain || domain === 'real' || domain === 'reals' || /(?:∈|in)(?:ℝ|R|real|reals)/i.test(String(data.raw || data.text || ''));
    if (hasSquare && nonnegative && realDomain) {
      return {
        ok: true,
        rule: 'square-nonnegative-over-reals',
        conclusion: 'x^2>=0',
        steps: ['square-as-product', 'same-sign-product-nonnegative']
      };
    }
    return { ok: false, reason: 'unsupported_square_nonnegative_form' };
  }

  function proveDivisionByZeroUndefined(input) {
    const data = typeof input === 'string' ? { raw: input } : (input || {});
    const raw = String(data.raw || data.text || '').replace(/\s+/g, '');
    const condition = String(data.condition || '').replace(/\s+/g, '');
    const left = String(data.left || '').replace(/\s+/g, '');
    const hasDivision = raw.indexOf('/') >= 0 || left.indexOf('/') >= 0;
    const denominatorZero = /=0$/.test(raw) || /=0$/.test(condition);
    const saysUndefined = /undefined/i.test(String(data.raw || data.text || data.result || ''));
    if (hasDivision && denominatorZero && saysUndefined) {
      return { ok: true, rule: 'division-by-zero-undefined', conclusion: 'denominator_zero_makes_quotient_undefined', steps: ['detect-quotient', 'detect-zero-denominator', 'reject-field-division-by-zero'] };
    }
    return { ok: false, reason: 'unsupported_division_by_zero_form' };
  }

  function evaluateLinearRelation(input) {
    const data = typeof input === 'string' ? { relation: input } : (input || {});
    const relation = String(data.relation || data.raw || data.text || '').replace(/\s+/g, '').replace('≥', '>=').replace('≤', '<=');
    const value = Number(data.value ?? data.x ?? data.assignment);
    const m = /^([a-zA-Z])(?:>=|<=|>|<|=)(-?\d+(?:\.\d+)?)$/.exec(relation);
    const op = relation.includes('>=') ? '>=' : relation.includes('<=') ? '<=' : relation.includes('>') ? '>' : relation.includes('<') ? '<' : relation.includes('=') ? '=' : null;
    if (!m || !op || !Number.isFinite(value)) return { ok: false, reason: 'unsupported_linear_relation_form' };
    const target = Number(m[2]);
    const truth = op === '>=' ? value >= target : op === '<=' ? value <= target : op === '>' ? value > target : op === '<' ? value < target : value === target;
    return { ok: true, truth, variable: m[1], relation: op, value, target, rule: 'linear-relation-evaluation' };
  }

  function classifyMathStatement(input) {
    const packet = typeof input === 'string' && typeof compileMath === 'function' ? compileMath(input) : (input || {});
    const mode = String(packet.mode || 'unknown');
    const ops = Array.isArray(packet.operators) ? packet.operators : [];
    if (mode === 'theorem' && ops.includes('square')) return { ok: true, class: 'square-theorem', closure: 'proveSquareNonnegative' };
    if (mode === 'constraint' && ops.includes('/')) return { ok: true, class: 'division-constraint', closure: 'proveDivisionByZeroUndefined' };
    if (mode === 'relation') return { ok: true, class: 'linear-relation', closure: 'evaluateLinearRelation' };
    if (mode === 'equation') return { ok: true, class: 'equation', closure: 'solveLinearEquation' };
    if (mode === 'proof-rule') return { ok: true, class: 'proof-rule', closure: 'checkProofStep' };
    return { ok: false, class: 'unknown', closure: null };
  }

  function solveAffineEquation(input) {
    const text = String(input == null ? '' : input).replace(/\s+/g, '');
    const m = /^(.+)=(-?\d+(?:\.\d+)?)$/.exec(text);
    if (!m) return { ok: false, reason: 'unsupported_affine_equation' };
    const left = typeof decomposeAffineExpression === 'function' ? decomposeAffineExpression(m[1]) : null;
    if (!left || left.ok !== true) return { ok: false, reason: 'left_side_not_affine' };
    if (left.coefficient === 0) return { ok: false, reason: 'zero_coefficient' };
    const target = Number(m[2]);
    const value = (target - left.offset) / left.coefficient;
    if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };
    return { ok: true, variable: left.variable, value, relation: '=', steps: ['decompose-affine-expression', 'undo-offset', 'undo-coefficient'] };
  }

  function decomposeAffineExpression(input) {
    const text = String(input == null ? '' : input).replace(/\s+/g, '');
    const m = /^(-?\d+(?:\.\d+)?)?([a-zA-Z])(?:(\+|-)(-?\d+(?:\.\d+)?))?$/.exec(text);
    if (!m) return { ok: false, reason: 'unsupported_affine_expression' };
    const coefficient = m[1] === undefined || m[1] === '' ? 1 : Number(m[1]);
    const variable = m[2];
    const sign = m[3] || '+';
    const magnitude = m[4] === undefined ? 0 : Number(m[4]);
    const offset = sign === '-' ? -Math.abs(magnitude) : magnitude;
    if (!Number.isFinite(coefficient) || !Number.isFinite(offset)) return { ok: false, reason: 'non_finite_affine_part' };
    return { ok: true, coefficient, variable, offset, parts: ['coefficient', 'variable', 'offset'] };
  }

  function detectContradiction(input) {
    const rows = Array.isArray(input) ? input.map(String) : String(input || '').split(/,|and/i);
    const clean = rows.map(x => String(x).trim()).filter(Boolean);
    const positives = new Set();
    const negatives = new Set();
    clean.forEach(row => {
      const normalized = row.replace(/\s+/g, ' ').trim();
      const neg = /^not\s+(.+)$/i.exec(normalized);
      if (neg) negatives.add(neg[1].trim().toUpperCase());
      else positives.add(normalized.toUpperCase());
    });
    for (const p of positives) {
      if (negatives.has(p)) return { ok: true, contradiction: true, pair: [p, 'not ' + p], rule: 'non-contradiction' };
    }
    return { ok: true, contradiction: false, pair: null, rule: 'non-contradiction' };
  }

  function composeImplicationChain(input) {
    const rows = Array.isArray(input) ? input : String(input || '').split(/,|and/i);
    const implications = rows.map(x => String(x).replace(/\s+/g, '')).map(x => /^([A-Z])(?:=>|⇒)([A-Z])$/i.exec(x)).filter(Boolean);
    for (const first of implications) {
      for (const second of implications) {
        const a = first[1].toUpperCase();
        const b = first[2].toUpperCase();
        const b2 = second[1].toUpperCase();
        const c = second[2].toUpperCase();
        if (b === b2) return { ok: true, rule: 'implication-chain-composition', conclusion: a + '=>' + c, parts: [a, b, c] };
      }
    }
    return { ok: false, reason: 'no_composable_implication_chain' };
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
    if (opts.requireAll) ORDER.forEach(key => { if (!fields[key]) throw new Error('Missing field: ' + key); });
    ORDER.forEach(key => { if (!fields[key]) fields[key] = normalize([], EMPTY[key]); });
    const u = unitReport(fields);
    if (!opts.normalize && !u.ok) throw new Error('Unit invariant failed');
    return { φ: 'Ω', v: VERSION, fields, u, Ξ: '' };
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
    ORDER.forEach(key => { fields[key] = normalize(src[key], EMPTY[key]).slice().sort((a, b) => axis(a).localeCompare(axis(b))); });
    return { φ: 'Ω', v: VERSION, fields, u: unitReport(fields), Ξ: '' };
  }

  function serialize(packet) {
    const p = canonical(packet);
    return 'Ω{' + ORDER.map(key => key + '[' + A(p.fields[key]).map(row => axis(row) + '=' + fmt(weight(row))).join(',') + ']').join(';') + '}';
  }

  function roundTrip(source) {
    const parsed = parse(source);
    const text = serialize(parsed);
    const reparsed = parse(text);
    return { text, parsed, reparsed, same: JSON.stringify(canonical(parsed)) === JSON.stringify(canonical(reparsed)) };
  }

  function fromKernelPacket(packet) { return canonical(packet); }
  function rawToSymbolic(source, options) { return serialize(compileRaw(source, options)); }
  function toKernelFields(input, options) {
    const packet = typeof input === 'string' ? parse(input, options) : canonical(input);
    const fields = sourceFields(packet);
    return ORDER.map(key => A(fields[key]).map(row => ({ σ: key + ':' + axis(row), w: weight(row) })));
  }
  function toKernelSeed(input, options) { return toKernelFields(input, options).reduce((rows, field) => rows.concat(field), []); }
  function toKernelCompletion(input, kernel, options) {
    if (!kernel || typeof kernel.complete !== 'function') throw new Error('Kernel with complete(...) is required');
    const opts = options || {};
    const seed = opts.whole === true ? [toKernelSeed(input, opts.parse)] : toKernelFields(input, opts.parse);
    return kernel.complete(seed, opts.complete || {});
  }
  function rawToKernelFields(input, options) { return toKernelFields(compileRaw(input, options)); }
  function rawToKernelSeed(input, options) { return toKernelSeed(compileRaw(input, options)); }
  function rawToKernelCompletion(input, kernel, options) {
    if (!kernel || typeof kernel.complete !== 'function') throw new Error('Kernel with complete(...) is required');
    const opts = options || {};
    const packet = compileRaw(input, opts.raw);
    const seed = opts.whole === true ? [toKernelSeed(packet)] : toKernelFields(packet);
    return kernel.complete(seed, opts.complete || {});
  }
  function parseMathAst(input) {
    if (MathAstCore && typeof MathAstCore.parse === 'function') return MathAstCore.parse(input);
    return { type: 'MathProgram', ok: false, body: { type: 'Unknown', raw: String(input == null ? '' : input) }, source: input };
  }
  function classifyMathAst(input) {
    if (MathAstCore && typeof MathAstCore.classify === 'function') return MathAstCore.classify(input);
    return { ok: false, type: 'Unknown', class: 'unknown', anatomy_id: null, closure: null };
  }
  function mathAstToKernelFields(input) {
    const ast = typeof input === 'string' || Array.isArray(input) ? parseMathAst(input) : input;
    const cls = classifyMathAst(ast);
    const rows = [
      { σ: 'ast:' + safeSymbol(cls.type || 'unknown'), w: 1 },
      { σ: 'class:' + safeSymbol(cls.class || 'unknown'), w: 1 },
      { σ: 'closure:' + safeSymbol(cls.closure || 'none'), w: 1 }
    ];
    return [normalize(rows, 'math-ast')];
  }

  function mathToKernelFields(input) { const packet = typeof input === 'string' ? compileMath(input) : input; return [A(packet.M).map(row => ({ σ: 'M:' + axis(row), w: weight(row) }))]; }
  function mathToKernelSeed(input) { return mathToKernelFields(input).reduce((rows, field) => rows.concat(field), []); }
  function mathToKernelCompletion(input, kernel, options) {
    if (!kernel || typeof kernel.complete !== 'function') throw new Error('Kernel with complete(...) is required');
    const opts = Object.assign({}, (options && (options.complete || options)) || {});
    delete opts.math;
    return kernel.complete(mathToKernelFields(input), opts);
  }
  function validate(source) { try { const result = roundTrip(source); return { ok: true, result, errors: [] }; } catch (err) { return { ok: false, result: null, errors: [String(err && err.message || err)] }; } }

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
    compileClaim,
    rawToClaimCandidates,
    compileMath,
    parseMathAst,
    classifyMathAst,
    mathAstToKernelFields,
    mathToKernelFields,
    mathToKernelSeed,
    mathToKernelCompletion,
    solveLinearEquation,
    checkProofStep,
    solveTwoStepLinearEquation,
    checkHypotheticalSyllogism,
    proveSquareNonnegative,
    proveDivisionByZeroUndefined,
    evaluateLinearRelation,
    classifyMathStatement,
    solveAffineEquation,
    decomposeAffineExpression,
    detectContradiction,
    composeImplicationChain,
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
