#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/operator-anatomy-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('let MathAstCore = null;')) {
  const marker = "  const A = value => Array.isArray(value) ? value : [];\n";
  if (!s.includes(marker)) throw new Error('A marker not found');
  s = s.replace(marker, marker + "  let MathAstCore = null;\n  try { if (typeof require === 'function') MathAstCore = require('./math-ast-core-v0-1.js'); } catch (_) { MathAstCore = null; }\n\n");
}

if (!s.includes('function astSurfaceIds(samples)')) {
  const marker = '  function availableSurfaces(parserSource) {';
  if (!s.includes(marker)) throw new Error('availableSurfaces marker not found');
  const block = `  function astSurfaceIds(samples) {
    if (!MathAstCore || typeof MathAstCore.classify !== 'function') return [];
    const rows = Array.isArray(samples) ? samples : [
      '2x + 1 = 7',
      '2x + 1',
      'x >= 3 with x = 5',
      'x/y is undefined when y = 0',
      '∀x ∈ ℝ, x^2 >= 0',
      'A=>B, B=>C',
      'A, not A'
    ];
    return Array.from(new Set(rows.map(sample => MathAstCore.classify(sample).anatomy_id).filter(Boolean))).sort();
  }

`;
  s = s.replace(marker, block + marker);
}

if (!s.includes('const astIds = astSurfaceIds(arguments[1] && arguments[1].samples);')) {
  const marker = "    const source = String(parserSource || '');\n";
  if (!s.includes(marker)) throw new Error('availableSurfaces source marker not found');
  s = s.replace(marker, marker + "    const astIds = astSurfaceIds(arguments[1] && arguments[1].samples);\n");
}

const returnMarker = "    return Array.from(new Set(out)).sort();";
if (s.includes(returnMarker)) {
  s = s.replace(returnMarker, "    return Array.from(new Set(out.concat(astIds))).sort();");
}

const oldClosure = "return availableSurfaces(source)";
if (s.includes(oldClosure) && !s.includes('availableSurfaces(source, opts)')) {
  s = s.replace(oldClosure, "return availableSurfaces(source, opts)");
}

fs.writeFileSync(path, s);
console.log('math AST anatomy bridge applied');
