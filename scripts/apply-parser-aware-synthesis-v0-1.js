#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('function injectParserFactorySource(source, functions)')) {
  const marker = '  function injectExports(source, names) {';
  if (!s.includes(marker)) throw new Error('injectExports marker not found');
  const block = String.raw`  function injectParserFactorySource(source, functions) {
    const fns = Array.isArray(functions) ? functions : [];
    if (!fns.length) return source;
    let out = String(source || '');
    const names = [];
    fns.forEach(fn => {
      if (!fn || !fn.name || !fn.code) return;
      names.push(fn.name);
      if (out.indexOf('function ' + fn.name + '(') >= 0) return;
      const marker = '  function parseRows(body) {';
      if (out.indexOf(marker) >= 0) out = out.replace(marker, '  ' + String(fn.code).replace(/\n/g, '\n  ').trim() + '\n\n' + marker);
      else out += '\n' + fn.code + '\n';
    });
    names.forEach(name => {
      if (out.indexOf('    ' + name + ',') >= 0) return;
      const exportMarker = '    toKernelFields,';
      if (out.indexOf(exportMarker) >= 0) out = out.replace(exportMarker, '    ' + name + ',\n' + exportMarker);
    });
    return out;
  }

`;
  s = s.replace(marker, block + marker);
}

const old = "    return injectExports(current, functions);";
if (s.includes(old)) {
  s = s.replace(old, "    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));\n    return injectExports(current, functions);");
}

fs.writeFileSync(path, s);
console.log('parser-aware synthesis applied');
