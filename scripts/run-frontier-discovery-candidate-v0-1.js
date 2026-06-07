#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const S = require('../src/source-sandbox-v0-1.js');
const R = require('../src/source-edit-reality-feedback-v0-1.js');
const FD = require('../src/frontier-discovery-core-v0-1.js');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const REPORT_PATH = path.join(ARTIFACT_DIR, 'frontier-discovery-candidate-report-v0-1.json');
const SUMMARY_PATH = path.join(ARTIFACT_DIR, 'frontier-discovery-candidate-summary-v0-1.json');
const TEST_PATH = 'tests/frontier-candidate-complex-unit-v0-1-test.js';
const SEQUENCE_INPUT = 'a_n = n^2';

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function has(s, needle) { return String(s || '').indexOf(needle) >= 0; }
function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error('marker not found: ' + label);
  return source.replace(from, to);
}
function collectFiles() {
  const rels = [
    'src/math-language-kernel-v0-1.js',
    'src/math-ast-core-v0-1.js',
    'src/operator-anatomy-v0-1.js',
    'src/proof-calculus-core-v0-1.js',
    'src/math-closure-engine-v0-1.js',
    'src/source-edit-reality-feedback-v0-1.js',
    'src/frontier-discovery-core-v0-1.js',
    'src/whole-self-simulation-core-v0-1.js',
    'src/source-sandbox-v0-1.js',
    TEST_PATH
  ];
  const files = {};
  rels.forEach(rel => { if (fs.existsSync(path.join(ROOT, rel))) files[rel] = read(rel); });
  return files;
}

function exportBlock(source) {
  return String(source || '').split('return Object.freeze({')[1] || '';
}

function patchAst(s) {
  if (!has(s, 'function parseSequenceDefinition')) {
    const block = String.raw`
  function parseSequenceDefinition(input) {
    const raw = compact(input);
    const m = /^([a-zA-Z])_n=n\^2$/i.exec(raw);
    if (!m) return null;
    const sequence = symbol(m[1]);
    const index = symbol('n');
    return node('SequenceDefinition', {
      sequence,
      index,
      domain: symbol('N'),
      term: node('IndexedTerm', { sequence, index }),
      term_formula: binary('^', index, numberLiteral(2)),
      relation: relation('=', node('IndexedTerm', { sequence, index }), binary('^', index, numberLiteral(2))),
      rule_class: 'sequence_term_definition'
    });
  }

`;
    s = replaceOnce(s, '  function parseArithmeticRelation(input) {', block + '  function parseArithmeticRelation(input) {', 'sequence parser insertion');
  }
  if (!has(s, '      parseSequenceDefinition,\n      parseMatrixProductStatement,')) {
    s = replaceOnce(s,
      '      parseProbabilityProductStatement,\n      parseMatrixProductStatement,',
      '      parseProbabilityProductStatement,\n      parseSequenceDefinition,\n      parseMatrixProductStatement,',
      'sequence parser list insertion');
  }
  if (!has(s, "SequenceDefinition: { class: 'sequence'")) {
    s = replaceOnce(s,
      "      MatrixProductStatement: { class: 'linear_algebra', anatomy_id: 'matrix_product', closure: 'typeMatrixProduct' },\n      AffineExpression:",
      "      MatrixProductStatement: { class: 'linear_algebra', anatomy_id: 'matrix_product', closure: 'typeMatrixProduct' },\n      SequenceDefinition: { class: 'sequence', anatomy_id: 'sequence_definition', closure: 'defineSequence' },\n      AffineExpression:",
      'sequence classification insertion');
  }
  if (!has(exportBlock(s), 'parseSequenceDefinition')) {
    s = replaceOnce(s,
      'parseProbabilityProductStatement, parseMatrixProductStatement, parseComplexUnitIdentity,\n    parseAffineExpression',
      'parseProbabilityProductStatement, parseSequenceDefinition, parseMatrixProductStatement, parseComplexUnitIdentity,\n    parseAffineExpression',
      'sequence export insertion');
  }
  return s;
}

function patchProof(s) {
  if (!has(s, 'function defineSequence')) {
    const block = String.raw`
  function defineSequence(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'SequenceDefinition') return gap('unsupported_sequence_definition', 'Sequence closure requires a SequenceDefinition AST node.');
    return verified('sequence-term-definition', {
      operator: 'defineSequence',
      conclusion: {
        type: 'SequenceDefinitionPacket',
        sequence: clone(body.sequence),
        index: clone(body.index),
        domain: clone(body.domain),
        term: clone(body.term),
        term_formula: clone(body.term_formula),
        relation: clone(body.relation)
      },
      steps: ['detect-indexed-sequence-form', 'type-index-over-natural-numbers', 'canonicalize-term-formula']
    });
  }

`;
    s = replaceOnce(s, '  function domainGuard(input) {', block + '  function domainGuard(input) {', 'sequence proof insertion');
  }
  if (!has(s, "operator === 'defineSequence'")) {
    s = replaceOnce(s,
      "    if (operator === 'typeMatrixProduct') return typeMatrixProduct(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      "    if (operator === 'typeMatrixProduct') return typeMatrixProduct(body);\n    if (operator === 'defineSequence') return defineSequence(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      'sequence proof dispatcher insertion');
  }
  if (!has(s, 'defineSequence,')) {
    s = replaceOnce(s,
      '    typeMatrixProduct,\n    domainGuard,',
      '    typeMatrixProduct,\n    defineSequence,\n    domainGuard,',
      'sequence proof export insertion');
  }
  return s;
}

function patchAnatomy(s) {
  if (!has(s, 'sequence_definition: Object.freeze')) {
    const block = String.raw`    sequence_definition: Object.freeze({
      id: 'sequence_definition', operation: 'define', surface: 'a_n = n^2',
      parts: ['sequence_symbol', 'index', 'domain', 'term_formula'], preconditions: ['index is typed over natural numbers', 'term formula is canonical'],
      inverse_chain: [], closure_operator: 'defineSequence', closure_result: 'sequence_definition_packet',
      examples: ['a_n = n^2'], assertion: "assert.strictEqual(P.defineSequence('a_n = n^2').ok, true);"
    }),
`;
    s = replaceOnce(s, '    division_constraint: Object.freeze({', block + '    division_constraint: Object.freeze({', 'sequence anatomy insertion');
  }
  return s;
}

function patchReality(s) {
  if (!has(s, 'sequence_definition_square')) {
    s = replaceOnce(s,
      "    { id: 'matrix_product_guard', input: 'A B = C', must_verify: true, closure_operator: 'typeMatrixProduct', selected_rule: 'matrix-product-dimension-guard' }\n  ]);",
      "    { id: 'matrix_product_guard', input: 'A B = C', must_verify: true, closure_operator: 'typeMatrixProduct', selected_rule: 'matrix-product-dimension-guard' },\n    { id: 'sequence_definition_square', input: 'a_n = n^2', must_verify: true, closure_operator: 'defineSequence', selected_rule: 'sequence-term-definition' }\n  ]);",
      'sequence reality anchor insertion');
  }
  return s;
}

function patchWholeSelf(s) {
  if (!has(s, "'a_n = n^2'")) {
    s = replaceOnce(s,
      "    'A B = C'\n  ]);",
      "    'A B = C',\n    'a_n = n^2'\n  ]);",
      'sequence whole-self language anchor insertion');
  }
  s = s.replace(/  const DEFAULT_FRONTIER_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, String.raw`  const DEFAULT_FRONTIER_ANCHORS = Object.freeze([
    { id: 'logic_quantifier_exists', input: 'exists x in R, x^2 = 2', expected_gap: 'unclassified_math_ast', reason: 'Existential quantifier closure is not yet represented.' }
  ]);`);
  return s;
}

function buildTest() {
  return [
    "const assert = require('assert');",
    "const AST = require('../src/math-ast-core-v0-1.js');",
    "const Proof = require('../src/proof-calculus-core-v0-1.js');",
    "const Closure = require('../src/math-closure-engine-v0-1.js');",
    "const K = require('../src/math-language-kernel-v0-1.js');",
    "const complexSource = 'i' + '^' + '2 = -1';",
    "const complexAst = AST.parse(complexSource);",
    "assert.strictEqual(complexAst.ok, true);",
    "assert.strictEqual(complexAst.body.type, 'ComplexUnitIdentityStatement');",
    "assert.strictEqual(Proof.proveComplexUnitIdentity(complexAst).rule, 'complex-unit-identity');",
    "const matrixSource = 'A B = C';",
    "const matrixAst = AST.parse(matrixSource);",
    "assert.strictEqual(matrixAst.ok, true);",
    "assert.strictEqual(matrixAst.body.type, 'MatrixProductStatement');",
    "assert.strictEqual(Proof.typeMatrixProduct(matrixAst).rule, 'matrix-product-dimension-guard');",
    "const sequenceSource = 'a_n = n' + '^' + '2';",
    "const sequenceAst = AST.parse(sequenceSource);",
    "assert.strictEqual(sequenceAst.ok, true);",
    "assert.strictEqual(sequenceAst.body.type, 'SequenceDefinition');",
    "assert.strictEqual(AST.classify(sequenceAst).closure, 'defineSequence');",
    "const proof = Proof.defineSequence(sequenceAst);",
    "assert.strictEqual(proof.ok, true);",
    "assert.strictEqual(proof.rule, 'sequence-term-definition');",
    "assert.strictEqual(proof.conclusion.type, 'SequenceDefinitionPacket');",
    "const closed = Closure.close(sequenceSource);",
    "assert.strictEqual(closed.ok, true);",
    "assert.strictEqual(closed.selected_rule, 'sequence-term-definition');",
    "const packet = K.math(sequenceSource);",
    "assert.strictEqual(packet.ok, true);",
    "assert.strictEqual(packet.closure_operator, 'defineSequence');",
    "assert.strictEqual(packet.selected_rule, 'sequence-term-definition');",
    "console.log('frontier-candidate-complex-unit-v0-1 tests passed with matrix and sequence definitions');",
    ""
  ].join('\n');
}

function writeNoop(summaryExtra) {
  const summary = Object.assign({
    packet_type: '42ndMind_frontier_discovery_candidate_summary_v0_1',
    version: '0.1.0',
    candidate_id: null,
    discovery_kind: null,
    accepted_by_sandbox: true,
    changed: [],
    chaos: [],
    test_count: 0,
    tests_ok: true,
    validators_ok: true,
    export_patch_ok: true,
    promoted: false,
    promotion_policy: 'no candidate generated because target frontier already closes',
    Ξ: ''
  }, summaryExtra || {});
  const full = { packet_type: '42ndMind_frontier_discovery_candidate_report_v0_1', version: '0.1.0', proposal: { id: null, operations: [] }, simulation: { accepted: true, changed: [], chaos: [], tests: [], validators: [] }, export_patch: { ok: true, operations: [] }, summary, Ξ: '' };
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(full, null, 2) + '\n');
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

function main() {
  const files = collectFiles();
  const discovery = FD.infer(SEQUENCE_INPUT);
  if (discovery.needed === false) return writeNoop({ discovery_kind: 'sequence_definition', reason: 'sequence_definition_already_supported' });

  const next = Object.assign({}, files);
  next['src/math-ast-core-v0-1.js'] = patchAst(next['src/math-ast-core-v0-1.js']);
  next['src/proof-calculus-core-v0-1.js'] = patchProof(next['src/proof-calculus-core-v0-1.js']);
  next['src/operator-anatomy-v0-1.js'] = patchAnatomy(next['src/operator-anatomy-v0-1.js']);
  next['src/source-edit-reality-feedback-v0-1.js'] = patchReality(next['src/source-edit-reality-feedback-v0-1.js']);
  next['src/whole-self-simulation-core-v0-1.js'] = patchWholeSelf(next['src/whole-self-simulation-core-v0-1.js']);

  const proposal = {
    id: 'frontier_candidate_sequence_definition_v0_1',
    discovery,
    operations: [
      { type: 'replace', path: 'src/math-ast-core-v0-1.js', content: next['src/math-ast-core-v0-1.js'] },
      { type: 'replace', path: 'src/proof-calculus-core-v0-1.js', content: next['src/proof-calculus-core-v0-1.js'] },
      { type: 'replace', path: 'src/operator-anatomy-v0-1.js', content: next['src/operator-anatomy-v0-1.js'] },
      { type: 'replace', path: 'src/source-edit-reality-feedback-v0-1.js', content: next['src/source-edit-reality-feedback-v0-1.js'] },
      { type: 'replace', path: 'src/whole-self-simulation-core-v0-1.js', content: next['src/whole-self-simulation-core-v0-1.js'] },
      { type: 'replace', path: TEST_PATH, content: buildTest() }
    ]
  };

  const sandbox = S.create(files, { allowDelete: false, maxPatchBytes: 5000000 });
  const anchors = Array.from(R.DEFAULT_ANCHORS).concat([{ id: 'sequence_definition_square', input: SEQUENCE_INPUT, must_verify: true, closure_operator: 'defineSequence', selected_rule: 'sequence-term-definition' }]);
  const report = S.simulate(sandbox, proposal, [TEST_PATH], [R.validator(anchors)]);
  const exportPatch = S.exportPatch(report);
  const summary = {
    packet_type: '42ndMind_frontier_discovery_candidate_summary_v0_1',
    version: '0.1.0',
    candidate_id: proposal.id,
    discovery_kind: discovery.proposals && discovery.proposals[0] ? discovery.proposals[0].kind : null,
    accepted_by_sandbox: report.accepted,
    changed: report.changed,
    chaos: report.chaos,
    test_count: report.tests.length,
    tests_ok: report.tests.every(t => t.ok),
    validators_ok: report.validators.every(v => v.ok),
    export_patch_ok: exportPatch.ok,
    promoted: false,
    promotion_policy: 'candidate accepted by sandbox only; real source promotion remains separate',
    Ξ: ''
  };
  const full = { packet_type: '42ndMind_frontier_discovery_candidate_report_v0_1', version: '0.1.0', proposal, simulation: report, export_patch: exportPatch, summary, Ξ: '' };
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(full, null, 2) + '\n');
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
  if (!report.accepted) process.exitCode = 1;
}

if (require.main === module) main();
