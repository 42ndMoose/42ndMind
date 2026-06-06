#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

function insertCase(name, code) {
  const sentinel = "if (name === '" + name + "')";
  if (s.includes(sentinel)) return;
  const marker = '    return null;\n  }\n\n  function injectExports';
  if (!s.includes(marker)) throw new Error('implementationForNeedle return marker not found');
  s = s.replace(marker, code + '    return null;\n  }\n\n  function injectExports');
}

insertCase('proveDivisionByZeroUndefined', String.raw`    if (name === 'proveDivisionByZeroUndefined') return { name, code: "function proveDivisionByZeroUndefined(input) {\n" +
      "  const data = typeof input === 'string' ? { raw: input } : (input || {});\n" +
      "  const raw = String(data.raw || data.text || '').replace(/\\s+/g, '');\n" +
      "  const condition = String(data.condition || '').replace(/\\s+/g, '');\n" +
      "  const left = String(data.left || '').replace(/\\s+/g, '');\n" +
      "  const hasDivision = raw.indexOf('/') >= 0 || left.indexOf('/') >= 0;\n" +
      "  const denominatorZero = /=0$/.test(raw) || /=0$/.test(condition);\n" +
      "  const saysUndefined = /undefined/i.test(String(data.raw || data.text || data.result || ''));\n" +
      "  if (hasDivision && denominatorZero && saysUndefined) {\n" +
      "    return { ok: true, rule: 'division-by-zero-undefined', conclusion: 'denominator_zero_makes_quotient_undefined', steps: ['detect-quotient', 'detect-zero-denominator', 'reject-field-division-by-zero'] };\n" +
      "  }\n" +
      "  return { ok: false, reason: 'unsupported_division_by_zero_form' };\n" +
      "}\n" };
`);

insertCase('evaluateLinearRelation', String.raw`    if (name === 'evaluateLinearRelation') return { name, code: "function evaluateLinearRelation(input) {\n" +
      "  const data = typeof input === 'string' ? { relation: input } : (input || {});\n" +
      "  const relation = String(data.relation || data.raw || data.text || '').replace(/\\s+/g, '').replace('≥', '>=').replace('≤', '<=');\n" +
      "  const value = Number(data.value ?? data.x ?? data.assignment);\n" +
      "  const m = /^([a-zA-Z])(?:>=|<=|>|<|=)(-?\\d+(?:\\.\\d+)?)$/.exec(relation);\n" +
      "  const op = relation.includes('>=') ? '>=' : relation.includes('<=') ? '<=' : relation.includes('>') ? '>' : relation.includes('<') ? '<' : relation.includes('=') ? '=' : null;\n" +
      "  if (!m || !op || !Number.isFinite(value)) return { ok: false, reason: 'unsupported_linear_relation_form' };\n" +
      "  const target = Number(m[2]);\n" +
      "  const truth = op === '>=' ? value >= target : op === '<=' ? value <= target : op === '>' ? value > target : op === '<' ? value < target : value === target;\n" +
      "  return { ok: true, truth, variable: m[1], relation: op, value, target, rule: 'linear-relation-evaluation' };\n" +
      "}\n" };
`);

insertCase('classifyMathStatement', String.raw`    if (name === 'classifyMathStatement') return { name, code: "function classifyMathStatement(input) {\n" +
      "  const packet = typeof input === 'string' && typeof compileMath === 'function' ? compileMath(input) : (input || {});\n" +
      "  const mode = String(packet.mode || 'unknown');\n" +
      "  const ops = Array.isArray(packet.operators) ? packet.operators : [];\n" +
      "  if (mode === 'theorem' && ops.includes('square')) return { ok: true, class: 'square-theorem', closure: 'proveSquareNonnegative' };\n" +
      "  if (mode === 'constraint' && ops.includes('/')) return { ok: true, class: 'division-constraint', closure: 'proveDivisionByZeroUndefined' };\n" +
      "  if (mode === 'relation') return { ok: true, class: 'linear-relation', closure: 'evaluateLinearRelation' };\n" +
      "  if (mode === 'equation') return { ok: true, class: 'equation', closure: 'solveLinearEquation' };\n" +
      "  if (mode === 'proof-rule') return { ok: true, class: 'proof-rule', closure: 'checkProofStep' };\n" +
      "  return { ok: false, class: 'unknown', closure: null };\n" +
      "}\n" };
`);

fs.writeFileSync(path, s);
console.log('broader closure synthesis cases applied');
