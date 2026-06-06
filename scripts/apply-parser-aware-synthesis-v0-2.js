#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

const oldLine = "      if (impl && current.indexOf('function ' + impl.name + '(') < 0) { current += '\\n' + impl.code; functions.push(impl.name); }";
const newLine = "      if (impl && current.indexOf('function ' + impl.name + '(') < 0) { functions.push(impl.name); if (String(path) !== 'src/language-parser-v0-1.js') current += '\\n' + impl.code; }";

if (!s.includes(oldLine) && !s.includes(newLine)) {
  throw new Error('target synthesis append line not found');
}

if (s.includes(oldLine)) s = s.replace(oldLine, newLine);

fs.writeFileSync(path, s);
console.log('parser-aware synthesis v0.2 applied');
