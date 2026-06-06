#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/language-parser-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('let MathAstCore = null;')) {
  const marker = "  const R = value => Number((Number(value) || 0).toFixed(6));\n";
  if (!s.includes(marker)) throw new Error('R marker not found');
  s = s.replace(marker, marker + "  let MathAstCore = null;\n  try { if (typeof require === 'function') MathAstCore = require('./math-ast-core-v0-1.js'); } catch (_) { MathAstCore = null; }\n\n");
}

if (!s.includes('function parseMathAst(input)')) {
  const marker = '  function mathToKernelFields(input) {';
  if (!s.includes(marker)) throw new Error('mathToKernelFields marker not found');
  const block = `  function parseMathAst(input) {
    if (MathAstCore && typeof MathAstCore.parse === 'function') return MathAstCore.parse(input);
    return { type: 'MathProgram', ok: false, body: { type: 'Unknown', raw: String(input == null ? '' : input) }, source: input };
  }
  function classifyMathAst(input) {
    if (MathAstCore && typeof MathAstCore.classify === 'function') return MathAstCore.classify(input);
    return { ok: false, type: 'Unknown', class: 'unknown', anatomy_id: null, closure: null };
  }
  function mathAstToKernelFields(input) {
    const ast = typeof input === 'string' || Array.isArray(input) ? parseMathAst(input) : input;
    const cls = classifyMathAst(ast);
    const rows = [
      { σ: 'ast:' + safeSymbol(cls.type || 'unknown'), w: 1 },
      { σ: 'class:' + safeSymbol(cls.class || 'unknown'), w: 1 },
      { σ: 'closure:' + safeSymbol(cls.closure || 'none'), w: 1 }
    ];
    return [normalize(rows, 'math-ast')];
  }

`;
  s = s.replace(marker, block + marker);
}

if (!s.includes('    parseMathAst,')) {
  const marker = '    compileMath,\n';
  if (!s.includes(marker)) throw new Error('export compileMath marker not found');
  s = s.replace(marker, marker + '    parseMathAst,\n    classifyMathAst,\n    mathAstToKernelFields,\n');
}

fs.writeFileSync(path, s);
console.log('math AST parser bridge applied');
