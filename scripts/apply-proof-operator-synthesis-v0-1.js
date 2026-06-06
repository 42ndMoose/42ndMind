#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

function insertCase(name, code) {
  const sentinel = "if (name === '" + name + "')";
  if (s.includes(sentinel)) return;
  const marker = '    return null;\n  }\n\n  function injectParserFactorySource';
  if (!s.includes(marker)) throw new Error('implementationForNeedle return marker not found');
  s = s.replace(marker, code + '    return null;\n  }\n\n  function injectParserFactorySource');
}

insertCase('composeImplicationChain', String.raw`    if (name === 'composeImplicationChain') return { name, code: "function composeImplicationChain(input) {\n" +
      "  const rows = Array.isArray(input) ? input : String(input || '').split(/,|and/i);\n" +
      "  const implications = rows.map(x => String(x).replace(/\\s+/g, '')).map(x => /^([A-Z])(?:=>|⇒)([A-Z])$/i.exec(x)).filter(Boolean);\n" +
      "  for (const first of implications) {\n" +
      "    for (const second of implications) {\n" +
      "      const a = first[1].toUpperCase();\n" +
      "      const b = first[2].toUpperCase();\n" +
      "      const b2 = second[1].toUpperCase();\n" +
      "      const c = second[2].toUpperCase();\n" +
      "      if (b === b2) return { ok: true, rule: 'implication-chain-composition', conclusion: a + '=>' + c, parts: [a, b, c] };\n" +
      "    }\n" +
      "  }\n" +
      "  return { ok: false, reason: 'no_composable_implication_chain' };\n" +
      "}\n" };
`);

insertCase('detectContradiction', String.raw`    if (name === 'detectContradiction') return { name, code: "function detectContradiction(input) {\n" +
      "  const rows = Array.isArray(input) ? input.map(String) : String(input || '').split(/,|and/i);\n" +
      "  const clean = rows.map(x => String(x).trim()).filter(Boolean);\n" +
      "  const positives = new Set();\n" +
      "  const negatives = new Set();\n" +
      "  clean.forEach(row => {\n" +
      "    const normalized = row.replace(/\\s+/g, ' ').trim();\n" +
      "    const neg = /^not\\s+(.+)$/i.exec(normalized);\n" +
      "    if (neg) negatives.add(neg[1].trim().toUpperCase());\n" +
      "    else positives.add(normalized.toUpperCase());\n" +
      "  });\n" +
      "  for (const p of positives) {\n" +
      "    if (negatives.has(p)) return { ok: true, contradiction: true, pair: [p, 'not ' + p], rule: 'non-contradiction' };\n" +
      "  }\n" +
      "  return { ok: true, contradiction: false, pair: null, rule: 'non-contradiction' };\n" +
      "}\n" };
`);

fs.writeFileSync(path, s);
console.log('proof operator synthesis cases applied');
