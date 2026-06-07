#!/usr/bin/env node
'use strict';

const fs = require('fs');

function replaceBlock(source, label, regex, replacement) {
  if (!regex.test(source)) throw new Error('block not found: ' + label);
  return source.replace(regex, replacement);
}

function patchWholeSelf() {
  const path = 'src/whole-self-simulation-core-v0-1.js';
  let s = fs.readFileSync(path, 'utf8');

  s = replaceBlock(s, 'whole-self language anchors', /  const DEFAULT_LANGUAGE_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, String.raw`  const DEFAULT_LANGUAGE_ANCHORS = Object.freeze([
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
    'A B = C'
  ]);`);

  s = replaceBlock(s, 'whole-self frontier anchors', /  const DEFAULT_FRONTIER_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, String.raw`  const DEFAULT_FRONTIER_ANCHORS = Object.freeze([
    { id: 'sequences', input: 'a_n = n^2', expected_gap: 'unclassified_math_ast', reason: 'Sequences and indexed variables are not yet represented.' },
    { id: 'logic_quantifier_exists', input: 'exists x in R, x^2 = 2', expected_gap: 'unclassified_math_ast', reason: 'Existential quantifier closure is not yet represented.' }
  ]);`);

  fs.writeFileSync(path, s);
}

patchWholeSelf();
console.log('promoted frontier state applied');
