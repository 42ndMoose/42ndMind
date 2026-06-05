#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/language-parser-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('function solveLinearEquation(input)')) {
  const block = `
  function solveLinearEquation(input) {
    const text = typeof input === 'string'
      ? input.replace(/\s+/g, '')
      : String(input && input.equation || '').replace(/\s+/g, '');
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
    return {
      ok: true,
      variable,
      value,
      relation: '=',
      steps: ['parse-linear-one-step', 'apply-inverse-operation']
    };
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
      if (
        r &&
        premises.map(p => p.trim().toUpperCase()).includes(r[1].toUpperCase()) &&
        conclusion.trim().toUpperCase() === r[2].toUpperCase()
      ) {
        return { ok: true, rule: 'modus-ponens', conclusion: r[2].toUpperCase() };
      }
    }
    return { ok: false, reason: 'unsupported_proof_step' };
  }
`;

  const marker = '  function validate(source) {';
  if (!s.includes(marker)) throw new Error('validate marker not found');
  s = s.replace(marker, block + '\n' + marker);
}

if (!s.includes('    solveLinearEquation,')) {
  const marker = '    mathToKernelCompletion,\n    toKernelFields,';
  if (!s.includes(marker)) throw new Error('export marker not found');
  s = s.replace(marker, '    mathToKernelCompletion,\n    solveLinearEquation,\n    checkProofStep,\n    toKernelFields,');
}

fs.writeFileSync(path, s);
console.log('accepted reactive parser candidate applied');
