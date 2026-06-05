const fs = require('fs');

function patchParser() {
  const path = 'src/language-parser-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes('function compileClaim(source, options)')) {
    const marker = `  function rawToSymbolic(source, options) {
    return serialize(compileRaw(source, options));
  }
`;
    const claimBlock = String.raw`
  function claimObject(value) {
    return safeSymbol(String(value == null ? '' : value).replace(/[?.!]+$/g, ''), 'unknown');
  }

  function claimPacket(mode, subject, relation, object, source, scope) {
    const σ = mode === 'query' ? 'Γ?:' + subject + '.' + relation : 'Γ:' + subject + '.' + relation + '=' + object;
    const Γ = normalize([
      { σ, w: 0.40 },
      { σ: 'subject:' + subject, w: 0.15 },
      { σ: 'relation:' + relation, w: 0.15 },
      { σ: 'object:' + (object || '?'), w: 0.15 },
      { σ: 'source:' + source, w: 0.10 },
      { σ: 'scope:' + scope, w: 0.05 }
    ], 'Γ∅');
    return { φ: mode === 'query' ? 'Γ?' : 'Γ', v: VERSION, mode, subject, relation, object: object || null, source, scope, Γ, key: subject + '.' + relation, statement: σ, u: { Γ: l1(Γ), ok: Math.abs(l1(Γ) - 1) < EPS }, Ξ: '' };
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
    throw new Error('No deterministic claim pattern matched');
  }

  function rawToClaimCandidates(source, options) {
    try { return [compileClaim(source, options)]; }
    catch (err) { return []; }
  }
`;
    if (!s.includes(marker)) throw new Error('rawToSymbolic marker not found');
    s = s.replace(marker, marker + claimBlock);
  }

  s = s.replace('    rawToSymbolic,\n    toKernelFields,', '    rawToSymbolic,\n    compileClaim,\n    rawToClaimCandidates,\n    toKernelFields,');
  fs.writeFileSync(path, s);
}

function patchKernel() {
  const path = 'src/math-language-kernel-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');

  if (!s.includes('function claimKey(claim)')) {
    const marker = `  function countMap(list) {
    const out = {};
    A(list).forEach(item => { out[item] = (out[item] || 0) + 1; });
    return out;
  }
`;
    const claimBlock = String.raw`
  function claimKey(claim) {
    return String((claim && claim.key) || ((claim && claim.subject || '∅') + '.' + (claim && claim.relation || '∅')));
  }

  function claimValue(claim) {
    return String(claim && claim.object != null ? claim.object : '?');
  }

  function claimField(claim) {
    if (Array.isArray(claim)) return normalize(claim);
    if (claim && Array.isArray(claim.Γ)) return normalize(claim.Γ);
    return normalize([{ σ: 'Γ∅', w: 1 }]);
  }

  function acceptClaim(candidate, ledger) {
    const reg = A(ledger);
    const key = claimKey(candidate);
    const value = claimValue(candidate);
    const prior = reg.find(item => item && item.φ === 'Γ' && item.accepted === true && claimKey(item) === key && claimValue(item) !== value);
    const query = candidate && candidate.φ === 'Γ?';
    const ok = candidate && (candidate.φ === 'Γ' || candidate.φ === 'Γ?') && candidate.Ξ === '' && (query || !prior);
    return Object.assign({}, C(candidate), { accepted: !!ok && !query, query: !!query, rejected: !ok && !query, conflict: prior ? prior.statement || claimValue(prior) : null, Γ: claimField(candidate), χ: ['Γ accepted iff no same-key different-object conflict', 'Γ? query does not mutate ledger', 'Ξ=""'], Ξ: '' });
  }

  function resolveClaim(query, ledger) {
    const key = typeof query === 'string' ? query : claimKey(query);
    const matches = A(ledger).filter(item => item && item.φ === 'Γ' && item.accepted === true && claimKey(item) === key);
    const unique = [];
    const seen = {};
    matches.forEach(item => { const v = claimValue(item); if (!seen[v]) { seen[v] = true; unique.push(item); } });
    return { φ: 'Γ?', v: VERSION, key, ok: unique.length === 1, value: unique.length === 1 ? claimValue(unique[0]) : null, matches: C(unique), conflict: unique.length > 1, Γ: normalize(unique.length ? unique.reduce((rows, item) => rows.concat(claimField(item)), []) : [{ σ: 'Γ?:' + key, w: 1 }]), χ: ['Γ? resolves iff exactly one accepted Γ matches key', 'Ξ=""'], Ξ: '' };
  }
`;
    if (!s.includes(marker)) throw new Error('countMap marker not found');
    s = s.replace(marker, claimBlock + '\n' + marker);
  }

  s = s.replace('resolveLexeme, complete, rebalance', 'resolveLexeme, acceptClaim, resolveClaim, complete, rebalance');
  fs.writeFileSync(path, s);
}

patchParser();
patchKernel();
console.log('claim layer patch applied');
