#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes("if (name === 'solveTwoStepLinearEquation')")) {
  const stage2 = String.raw`    if (name === 'solveTwoStepLinearEquation') return { name, code: "function solveTwoStepLinearEquation(input) {\n" +
      "  const text = typeof input === 'string' ? input.replace(/\\s+/g, '') : String(input && input.equation || '').replace(/\\s+/g, '');\n" +
      "  const m = /^(-?\\d+(?:\\.\\d+)?)?([a-zA-Z])([+\\-])(-?\\d+(?:\\.\\d+)?)=(-?\\d+(?:\\.\\d+)?)$/.exec(text);\n" +
      "  if (!m) return { ok: false, reason: 'unsupported_two_step_linear_form' };\n" +
      "  const coefficient = m[1] === undefined || m[1] === '' ? 1 : Number(m[1]);\n" +
      "  const variable = m[2]; const op = m[3]; const offset = Number(m[4]); const target = Number(m[5]);\n" +
      "  const shifted = op === '+' ? target - offset : target + offset;\n" +
      "  const value = shifted / coefficient;\n" +
      "  if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };\n" +
      "  return { ok: true, variable, value, relation: '=', steps: ['parse-two-step-linear', 'undo-offset', 'divide-by-coefficient'] };\n" +
      "}\n" };
    if (name === 'checkHypotheticalSyllogism') return { name, code: "function checkHypotheticalSyllogism(input) {\n" +
      "  const data = typeof input === 'string' ? { text: input } : (input || {});\n" +
      "  const text = String(data.text || '').replace(/\\s+/g, '');\n" +
      "  const direct = /(?:if)?([A-Z])(?:=>|⇒)([A-Z])(?:and|&)(\\2)(?:=>|⇒)([A-Z])(?:and|&)(\\1)(?:,?then|=>)(\\4)/i.exec(text);\n" +
      "  if (direct) return { ok: true, rule: 'hypothetical-syllogism+modus-ponens', conclusion: direct[4].toUpperCase() };\n" +
      "  const premises = Array.isArray(data.premises) ? data.premises.map(String) : [];\n" +
      "  const conclusion = String(data.conclusion || '').trim().toUpperCase();\n" +
      "  const implications = premises.map(p => /^\\s*([A-Z])\\s*(?:=>|⇒)\\s*([A-Z])\\s*$/i.exec(p)).filter(Boolean);\n" +
      "  const facts = premises.filter(p => !/(?:=>|⇒)/.test(p)).map(p => p.trim().toUpperCase());\n" +
      "  for (const first of implications) for (const second of implications) {\n" +
      "    if (first[2].toUpperCase() === second[1].toUpperCase() && facts.includes(first[1].toUpperCase()) && conclusion === second[2].toUpperCase()) {\n" +
      "      return { ok: true, rule: 'hypothetical-syllogism+modus-ponens', conclusion };\n" +
      "    }\n" +
      "  }\n" +
      "  return { ok: false, reason: 'unsupported_hypothetical_syllogism' };\n" +
      "}\n" };
`;
  const marker = '    return null;\n  }\n\n  function injectExports';
  if (!s.includes(marker)) throw new Error('implementationForNeedle return marker not found');
  s = s.replace(marker, stage2 + '    return null;\n  }\n\n  function injectExports');
}

fs.writeFileSync(path, s);
console.log('stage-2 synthesis cases applied');
