#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

const start = s.indexOf('  function injectParserFactorySource(source, functions) {');
const end = s.indexOf('  function injectExports(source, names) {');
if (start < 0 || end < 0 || end <= start) throw new Error('injectParserFactorySource block markers not found');

const replacement = `  function injectParserFactorySource(source, functions) {
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
    let factoryExports = false;
    names.forEach(name => {
      if (out.indexOf('    ' + name + ',') >= 0) return;
      const exportMarker = '    toKernelFields,';
      if (out.indexOf(exportMarker) >= 0) {
        out = out.replace(exportMarker, '    ' + name + ',\n' + exportMarker);
        factoryExports = true;
      }
    });
    if (!factoryExports) out = injectExports(out, names);
    return out;
  }

`;

s = s.slice(0, start) + replacement + s.slice(end);

const parserReturn = "    if (String(path) === 'src/language-parser-v0-1.js') return injectParserFactorySource(current, functions.map(name => implementationForNeedle(name)).filter(Boolean));";
const repeated = new RegExp('(?:' + parserReturn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\n)+');
s = s.replace(repeated, parserReturn + '\n');

fs.writeFileSync(path, s);
console.log('self-edit parser export fallback applied');
