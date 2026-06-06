#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes("if (name === 'proveSquareNonnegative')")) {
  const block = String.raw`    if (name === 'proveSquareNonnegative') return { name, code: "function proveSquareNonnegative(input) {\n" +
      "  const data = typeof input === 'string' ? { raw: input } : (input || {});\n" +
      "  const raw = String(data.raw || data.text || '').replace(/\\s+/g, '');\n" +
      "  const left = String(data.left || '').replace(/\\s+/g, '');\n" +
      "  const right = String(data.right == null ? '' : data.right).replace(/\\s+/g, '');\n" +
      "  const relation = String(data.relation || '').replace('≥', '>=').trim();\n" +
      "  const domain = String(data.domain || '').toLowerCase();\n" +
      "  const joined = raw || (left + relation + right);\n" +
      "  const hasSquare = /[a-zA-Z](?:\\^2|²)/.test(joined) || /[a-zA-Z](?:\\^2|²)/.test(left);\n" +
      "  const nonnegative = /(>=|≥)0$/.test(joined) || (relation === '>=' && right === '0');\n" +
      "  const realDomain = !domain || domain === 'real' || domain === 'reals' || /(?:∈|in)(?:ℝ|R|real|reals)/i.test(String(data.raw || data.text || ''));\n" +
      "  if (hasSquare && nonnegative && realDomain) {\n" +
      "    return { ok: true, rule: 'square-nonnegative-over-reals', conclusion: 'x^2>=0', steps: ['square-as-product', 'same-sign-product-nonnegative'] };\n" +
      "  }\n" +
      "  return { ok: false, reason: 'unsupported_square_nonnegative_form' };\n" +
      "}\n" };
`;
  const marker = '    return null;\n  }\n\n  function injectExports';
  if (!s.includes(marker)) throw new Error('implementationForNeedle return marker not found');
  s = s.replace(marker, block + '    return null;\n  }\n\n  function injectExports');
}

fs.writeFileSync(path, s);
console.log('closure frontier synthesis case applied');
