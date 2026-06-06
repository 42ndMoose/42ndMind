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

insertCase('decomposeAffineExpression', String.raw`    if (name === 'decomposeAffineExpression') return { name, code: "function decomposeAffineExpression(input) {\n" +
      "  const text = String(input == null ? '' : input).replace(/\\s+/g, '');\n" +
      "  const m = /^(-?\\d+(?:\\.\\d+)?)?([a-zA-Z])(?:(\\+|-)(-?\\d+(?:\\.\\d+)?))?$/.exec(text);\n" +
      "  if (!m) return { ok: false, reason: 'unsupported_affine_expression' };\n" +
      "  const coefficient = m[1] === undefined || m[1] === '' ? 1 : Number(m[1]);\n" +
      "  const variable = m[2];\n" +
      "  const sign = m[3] || '+';\n" +
      "  const magnitude = m[4] === undefined ? 0 : Number(m[4]);\n" +
      "  const offset = sign === '-' ? -Math.abs(magnitude) : magnitude;\n" +
      "  if (!Number.isFinite(coefficient) || !Number.isFinite(offset)) return { ok: false, reason: 'non_finite_affine_part' };\n" +
      "  return { ok: true, coefficient, variable, offset, parts: ['coefficient', 'variable', 'offset'] };\n" +
      "}\n" };
`);

insertCase('solveAffineEquation', String.raw`    if (name === 'solveAffineEquation') return { name, code: "function solveAffineEquation(input) {\n" +
      "  const text = String(input == null ? '' : input).replace(/\\s+/g, '');\n" +
      "  const m = /^(.+)=(-?\\d+(?:\\.\\d+)?)$/.exec(text);\n" +
      "  if (!m) return { ok: false, reason: 'unsupported_affine_equation' };\n" +
      "  const left = typeof decomposeAffineExpression === 'function' ? decomposeAffineExpression(m[1]) : null;\n" +
      "  if (!left || left.ok !== true) return { ok: false, reason: 'left_side_not_affine' };\n" +
      "  if (left.coefficient === 0) return { ok: false, reason: 'zero_coefficient' };\n" +
      "  const target = Number(m[2]);\n" +
      "  const value = (target - left.offset) / left.coefficient;\n" +
      "  if (!Number.isFinite(value)) return { ok: false, reason: 'non_finite_solution' };\n" +
      "  return { ok: true, variable: left.variable, value, relation: '=', steps: ['decompose-affine-expression', 'undo-offset', 'undo-coefficient'] };\n" +
      "}\n" };
`);

fs.writeFileSync(path, s);
console.log('operator anatomy synthesis cases applied');
