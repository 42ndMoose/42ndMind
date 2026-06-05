const fs = require('fs');

const path = 'src/language-parser-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('function stancePacket(quantifier, subject, relation, object)')) {
  const marker = `  function compileClaim(source, options) {
`;
  const stanceBlock = String.raw`
  function stancePacket(quantifier, subject, relation, object) {
    const q = claimObject(quantifier || 'unspecified');
    const subj = claimObject(subject);
    const rel = claimObject(relation);
    const obj = claimObject(object);
    const key = subj + '.' + rel + '.q=' + q;
    const baseKey = subj + '.' + rel + '=' + obj;
    const σ = 'Γ:' + key + '=' + obj;
    const Γ = normalize([
      { σ, w: 0.34 },
      { σ: 'subject:' + subj, w: 0.13 },
      { σ: 'relation:' + rel, w: 0.13 },
      { σ: 'object:' + obj, w: 0.13 },
      { σ: 'quantifier:' + q, w: 0.12 },
      { σ: 'source:speaker-stance', w: 0.08 },
      { σ: q === 'unspecified' ? 'elaboration:required' : 'elaboration:not-required', w: 0.07 }
    ], 'Γ∅');
    return { φ: 'Γ', v: VERSION, mode: 'stance', subject: subj, relation: rel, object: obj, quantifier: q, source: 'speaker_stance', scope: 'normative', elaboration_required: q === 'unspecified', elaboration_reason: q === 'unspecified' ? 'missing_quantifier' : null, key, base_key: baseKey, statement: σ, u: { Γ: l1(Γ), ok: Math.abs(l1(Γ) - 1) < EPS }, Γ, Ξ: '' };
  }
`;
  if (!s.includes(marker)) throw new Error('compileClaim marker not found');
  s = s.replace(marker, stanceBlock + '\n' + marker);
}

const throwLine = `    throw new Error('No deterministic claim pattern matched');
`;
if (!s.includes("stancePacket('unspecified'")) {
  const stancePatterns = String.raw`    m = /^(all|some)\s+([a-z0-9][a-z0-9 _-]*?)\s+should(?:n't|n’t| not)\s+(.+?)[.!?]*$/i.exec(text);
    if (m) return stancePacket(claimObject(m[1]), m[2], 'should-not', m[3]);
    m = /^([a-z0-9][a-z0-9 _-]*?)\s+should(?:n't|n’t| not)\s+(.+?)[.!?]*$/i.exec(text);
    if (m) return stancePacket('unspecified', m[1], 'should-not', m[2]);
`;
  if (!s.includes(throwLine)) throw new Error('claim throw marker not found');
  s = s.replace(throwLine, stancePatterns + throwLine);
}

fs.writeFileSync(path, s);
console.log('stance ambiguity patch applied');
