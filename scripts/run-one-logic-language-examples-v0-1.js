#!/usr/bin/env node
'use strict';

const LC = require('../src/one-logic-language-completion-v0-1.js');
const M = require('../src/one-logic-math-v1.js');
const P = require('../src/math-law-invariant-prover-v0-1.js');
const Proof = require('../src/math-law-proof-checker-v0-1.js');

const options = { math: M, prover: P, proof_checker: Proof };
const examples = LC.exampleRows(options).map(row => ({
  input: row.input,
  generated_expression: row.generated_expression,
  generated_expressions: row.generated_expressions,
  proof: row.proof,
  result: row.result
}));
const language_spec = LC.languageSpec(options);

console.log(JSON.stringify({
  packet_type: '42ndMind_one_logic_language_example_set_v0_1',
  language_version: LC.VERSION,
  math_version: M.VERSION,
  semantic_authority: M.CONTRACT.canonical_path + '::CONTRACT',
  proof_authority: M.CONTRACT.proofs.authority,
  grammar: LC.grammar(),
  language_spec,
  examples
}, null, 2));

module.exports = { examples, language_spec };
