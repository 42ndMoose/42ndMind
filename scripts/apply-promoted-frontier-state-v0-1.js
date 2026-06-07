#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/whole-self-simulation-core-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

const anchors = [
  '2 + 2 = 4',
  '3 + 2 = 4',
  '2x + 1 = x + 4',
  'a = b, b = c therefore a = c',
  'simplify x + 0',
  '∀x ∈ ℝ, x + 0 = x',
  'sqrt(x) is real',
  'f(g(x))',
  'x ∈ A',
  'prove by induction P(n)',
  'i^2 = -1',
  'lim x->0 sin(x)/x = 1',
  'd/dx x^2 = 2x',
  'integral 2x dx = x^2 + C',
  'P(A and B) = P(A)P(B)',
  'A B = C',
  'a_n = n^2',
  'exists x in R, x^2 = 2'
];

const anchorBlock = '  const DEFAULT_LANGUAGE_ANCHORS = Object.freeze([\n' + anchors.map(x => "    '" + x.replace(/'/g, "\\'") + "'").join(',\n') + '\n  ]);';
const frontierBlock = '  const DEFAULT_FRONTIER_ANCHORS = Object.freeze([]);';

s = s.replace(/  const DEFAULT_LANGUAGE_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, anchorBlock);
s = s.replace(/  const DEFAULT_FRONTIER_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, frontierBlock);

fs.writeFileSync(path, s);
console.log('promoted frontier state applied: bounded frontier closed');
