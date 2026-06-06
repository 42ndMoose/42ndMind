#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/language-parser-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('function solveTwoStepLinearEquation(input)')) {
  const block = `
  function solveTwoStepLinearEquation(input) {
    const text = typeof input === 'string'
      ? input.replace(/\s+/g, '')
      : String(input && input.equation || '').replace(/\s+/g, '');
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
    return {
      ok: true,
      variable,
      value,
      relation: '=',
      steps: ['parse-two-step-linear', 'undo-offset', 'divide-by-coefficient']
    };
  }

  function checkHypotheticalSyllogism(input) {
    const data = typeof input === 'string' ? { text: input } : (input || {});
    const text = String(data.text || '').replace(/\s+/g, '');
    const direct = /(?:if)?([A-Z])(?:=>|⇒)([A-Z])(?:and|&)(\2)(?:=>|⇒)([A-Z])(?:and|&)(\1)(?:,?then|=>)(\4)/i.exec(text);
    if (direct) {
      return {
        ok: true,
        rule: 'hypothetical-syllogism+modus-ponens',
        conclusion: direct[4].toUpperCase()
      };
    }
    const premises = Array.isArray(data.premises) ? data.premises.map(String) : [];
    const conclusion = String(data.conclusion || '').trim().toUpperCase();
    const implications = premises
      .map(p => /^\s*([A-Z])\s*(?:=>|⇒)\s*([A-Z])\s*$/i.exec(p))
      .filter(Boolean);
    const facts = premises
      .filter(p => !/(?:=>|⇒)/.test(p))
      .map(p => p.trim().toUpperCase());
    for (const first of implications) {
      for (const second of implications) {
        if (
          first[2].toUpperCase() === second[1].toUpperCase() &&
          facts.includes(first[1].toUpperCase()) &&
          conclusion === second[2].toUpperCase()
        ) {
          return {
            ok: true,
            rule: 'hypothetical-syllogism+modus-ponens',
            conclusion
          };
        }
      }
    }
    return { ok: false, reason: 'unsupported_hypothetical_syllogism' };
  }
`;

  const marker = '  function parseRows(body) {';
  if (!s.includes(marker)) throw new Error('parseRows marker not found');
  s = s.replace(marker, block + '\n' + marker);
}

if (!s.includes('    solveTwoStepLinearEquation,')) {
  const marker = '    checkProofStep,\n    toKernelFields,';
  if (!s.includes(marker)) throw new Error('export marker not found');
  s = s.replace(marker, '    checkProofStep,\n    solveTwoStepLinearEquation,\n    checkHypotheticalSyllogism,\n    toKernelFields,');
}

fs.writeFileSync(path, s);
console.log('accepted stage-2 parser candidate applied');
