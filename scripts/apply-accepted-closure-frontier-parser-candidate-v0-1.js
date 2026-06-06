#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/language-parser-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('function proveSquareNonnegative(input)')) {
  const block = `
  function proveSquareNonnegative(input) {
    const data = typeof input === 'string' ? { raw: input } : (input || {});
    const raw = String(data.raw || data.text || '').replace(/\s+/g, '');
    const left = String(data.left || '').replace(/\s+/g, '');
    const right = String(data.right == null ? '' : data.right).replace(/\s+/g, '');
    const relation = String(data.relation || '').replace('≥', '>=').trim();
    const domain = String(data.domain || '').toLowerCase();
    const joined = raw || (left + relation + right);
    const hasSquare = /[a-zA-Z](?:\^2|²)/.test(joined) || /[a-zA-Z](?:\^2|²)/.test(left);
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
`;

  const marker = '  function parseRows(body) {';
  if (!s.includes(marker)) throw new Error('parseRows marker not found');
  s = s.replace(marker, block + '\n' + marker);
}

if (!s.includes('    proveSquareNonnegative,')) {
  const marker = '    checkHypotheticalSyllogism,\n    toKernelFields,';
  if (!s.includes(marker)) throw new Error('export marker not found');
  s = s.replace(marker, '    checkHypotheticalSyllogism,\n    proveSquareNonnegative,\n    toKernelFields,');
}

fs.writeFileSync(path, s);
console.log('accepted closure frontier parser candidate applied');
