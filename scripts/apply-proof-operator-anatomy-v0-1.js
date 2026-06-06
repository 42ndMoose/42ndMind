#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'src/operator-anatomy-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes("implication_chain: Object.freeze")) {
  const marker = "    statement_classification: Object.freeze({";
  if (!s.includes(marker)) throw new Error('statement_classification marker not found');
  const block = `    implication_chain: Object.freeze({
      id: 'implication_chain',
      operation: 'compose',
      surface: 'A=>B and B=>C gives A=>C',
      parts: ['antecedent', 'middle', 'consequent'],
      preconditions: ['first consequent equals second antecedent'],
      inverse_chain: [],
      closure_operator: 'composeImplicationChain',
      closure_result: 'composed_implication',
      examples: ['A=>B, B=>C'],
      assertion: "assert.strictEqual(P.composeImplicationChain(['A=>B', 'B=>C']).conclusion, 'A=>C');"
    }),
    contradiction_pair: Object.freeze({
      id: 'contradiction_pair',
      operation: 'detect',
      surface: 'A and not A cannot both be true in the same scope',
      parts: ['claim', 'negated_claim', 'scope'],
      preconditions: ['same scope', 'same referent'],
      violations: ['claim and negated claim both asserted'],
      inverse_chain: [],
      closure_operator: 'detectContradiction',
      closure_result: 'contradiction_flag',
      examples: ['A, not A'],
      assertion: "assert.strictEqual(P.detectContradiction(['A', 'not A']).contradiction, true);"
    }),
`;
  s = s.replace(marker, block + marker);
}

if (!s.includes("out.push('implication_chain')")) {
  const marker = "    if (has(source, 'compileMath')) out.push('statement_classification');\n";
  if (!s.includes(marker)) throw new Error('availableSurfaces marker not found');
  s = s.replace(marker, marker + "    if (has(source, 'checkProofStep') || has(source, 'checkHypotheticalSyllogism')) out.push('implication_chain');\n    if (has(source, 'checkProofStep') || has(source, 'compileClaim')) out.push('contradiction_pair');\n");
}

fs.writeFileSync(path, s);
console.log('proof operator anatomy applied');
