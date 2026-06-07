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
const TEST_PATH = 'tests/frontier-candidate-matrix-product-v0-1-test.js';
const MATRIX_INPUT = 'A B = C';

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
    'src/source-sandbox-v0-1.js'
  ];
  const files = {};
  rels.forEach(rel => { files[rel] = read(rel); });
  return files;
}

function exportBlock(source) {
  return String(source || '').split('return Object.freeze({')[1] || '';
}

function patchAst(s) {
  if (!has(s, 'function parseMatrixProductStatement')) {
    const block = String.raw`
  function parseMatrixProductStatement(input) {
    const raw = compact(input);
    const m = /^([A-Z])([A-Z])=([A-Z])$/.exec(raw);
    if (!m) return null;
    return node('MatrixProductStatement', {
      left_matrix: symbol(m[1]),
      right_matrix: symbol(m[2]),
      product_matrix: symbol(m[3]),
      product: node('MatrixProduct', { left: symbol(m[1]), right: symbol(m[2]) }),
      relation: relation('=', node('MatrixProduct', { left: symbol(m[1]), right: symbol(m[2]) }), symbol(m[3])),
      guard: node('DimensionCompatibilityGuard', { left: symbol(m[1]), right: symbol(m[2]), product: symbol(m[3]) }),
      rule_class: 'matrix_product_dimension_guard'
    });
  }

`;
    s = replaceOnce(s, '  function parseArithmeticRelation(input) {', block + '  function parseArithmeticRelation(input) {', 'matrix parser insertion');
  }
  if (!has(s, '      parseMatrixProductStatement,\n      parseComplexUnitIdentity,')) {
    s = replaceOnce(s,
      '      parseProbabilityProductStatement,\n      parseComplexUnitIdentity,',
      '      parseProbabilityProductStatement,\n      parseMatrixProductStatement,\n      parseComplexUnitIdentity,',
      'matrix parser list insertion');
  }
  if (!has(s, "MatrixProductStatement: { class: 'linear_algebra'")) {
    s = replaceOnce(s,
      "      ComplexUnitIdentityStatement: { class: 'number_system', anatomy_id: 'complex_unit_identity', closure: 'proveComplexUnitIdentity' },\n      AffineExpression:",
      "      ComplexUnitIdentityStatement: { class: 'number_system', anatomy_id: 'complex_unit_identity', closure: 'proveComplexUnitIdentity' },\n      MatrixProductStatement: { class: 'linear_algebra', anatomy_id: 'matrix_product', closure: 'typeMatrixProduct' },\n      AffineExpression:",
      'matrix classification insertion');
  }
  if (!has(exportBlock(s), 'parseMatrixProductStatement')) {
    s = replaceOnce(s,
      'parseProbabilityProductStatement, parseComplexUnitIdentity,\n    parseAffineExpression',
      'parseProbabilityProductStatement, parseMatrixProductStatement, parseComplexUnitIdentity,\n    parseAffineExpression',
      'matrix export insertion');
  }
  return s;
}

function patchProof(s) {
  if (!has(s, 'function typeMatrixProduct')) {
    const block = String.raw`
  function typeMatrixProduct(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'MatrixProductStatement') return gap('unsupported_matrix_product', 'Matrix product typing requires a MatrixProductStatement AST node.');
    return verified('matrix-product-dimension-guard', {
      operator: 'typeMatrixProduct',
      guard: clone(body.guard),
      conclusion: {
        type: 'GuardedMatrixProductRelation',
        guard: clone(body.guard),
        relation: clone(body.relation)
      },
      steps: ['detect-matrix-product-form', 'emit-dimension-compatibility-guard', 'canonicalize-guarded-matrix-product-relation']
    });
  }

`;
    s = replaceOnce(s, '  function domainGuard(input) {', block + '  function domainGuard(input) {', 'matrix proof insertion');
  }
  if (!has(s, "operator === 'typeMatrixProduct'")) {
    s = replaceOnce(s,
      "    if (operator === 'proveComplexUnitIdentity') return proveComplexUnitIdentity(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      "    if (operator === 'proveComplexUnitIdentity') return proveComplexUnitIdentity(body);\n    if (operator === 'typeMatrixProduct') return typeMatrixProduct(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      'matrix proof dispatcher insertion');
  }
  if (!has(s, 'typeMatrixProduct,')) {
    s = replaceOnce(s,
      '    proveComplexUnitIdentity,\n    domainGuard,',
      '    proveComplexUnitIdentity,\n    typeMatrixProduct,\n    domainGuard,',
      'matrix proof export insertion');
  }
  return s;
}

function patchAnatomy(s) {
  if (!has(s, 'matrix_product: Object.freeze')) {
    const block = String.raw`    matrix_product: Object.freeze({
      id: 'matrix_product', operation: 'type', surface: 'A B = C',
      parts: ['left_matrix', 'right_matrix', 'product_matrix', 'dimension_guard'], preconditions: ['left/right dimensions are compatible', 'product dimensions match declared matrix'],
      inverse_chain: [], closure_operator: 'typeMatrixProduct', closure_result: 'guarded_matrix_product_relation',
      examples: ['A B = C'], assertion: "assert.strictEqual(P.typeMatrixProduct('A B = C').ok, true);"
    }),
`;
    s = replaceOnce(s, '    division_constraint: Object.freeze({', block + '    division_constraint: Object.freeze({', 'matrix anatomy insertion');
  }
  return s;
}

function patchReality(s) {
  if (!has(s, 'matrix_product_guard')) {
    s = replaceOnce(s,
      "    { id: 'complex_unit_identity', input: 'i^2 = -1', must_verify: true, closure_operator: 'proveComplexUnitIdentity', selected_rule: 'complex-unit-identity' }\n  ]);",
      "    { id: 'complex_unit_identity', input: 'i^2 = -1', must_verify: true, closure_operator: 'proveComplexUnitIdentity', selected_rule: 'complex-unit-identity' },\n    { id: 'matrix_product_guard', input: 'A B = C', must_verify: true, closure_operator: 'typeMatrixProduct', selected_rule: 'matrix-product-dimension-guard' }\n  ]);",
      'matrix reality anchor insertion');
  }
  return s;
}

function patchWholeSelf(s) {
  if (!has(s, "'A B = C'")) {
    s = replaceOnce(s,
      "    'i^2 = -1'\n  ]);",
      "    'i^2 = -1',\n    'A B = C'\n  ]);",
      'matrix whole-self language anchor insertion');
  }
  s = s.replace(/  const DEFAULT_FRONTIER_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, String.raw`  const DEFAULT_FRONTIER_ANCHORS = Object.freeze([
    { id: 'sequences', input: 'a_n = n^2', expected_gap: 'unclassified_math_ast', reason: 'Sequences and indexed variables are not yet represented.' },
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
    "const source = 'A B = C';",
    "const ast = AST.parse(source);",
    "assert.strictEqual(ast.ok, true);",
    "assert.strictEqual(ast.body.type, 'MatrixProductStatement');",
    "assert.strictEqual(AST.classify(ast).closure, 'typeMatrixProduct');",
    "const proof = Proof.typeMatrixProduct(ast);",
    "assert.strictEqual(proof.ok, true);",
    "assert.strictEqual(proof.rule, 'matrix-product-dimension-guard');",
    "assert.strictEqual(proof.conclusion.type, 'GuardedMatrixProductRelation');",
    "assert.strictEqual(proof.conclusion.guard.type, 'DimensionCompatibilityGuard');",
    "const closed = Closure.close(source);",
    "assert.strictEqual(closed.ok, true);",
    "assert.strictEqual(closed.selected_rule, 'matrix-product-dimension-guard');",
    "const packet = K.math(source);",
    "assert.strictEqual(packet.ok, true);",
    "assert.strictEqual(packet.closure_operator, 'typeMatrixProduct');",
    "assert.strictEqual(packet.selected_rule, 'matrix-product-dimension-guard');",
    "console.log('frontier-candidate-matrix-product-v0-1 tests passed');",
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
  const discovery = FD.infer(MATRIX_INPUT);
  if (discovery.needed === false) return writeNoop({ discovery_kind: 'matrix_multiplication', reason: 'matrix_product_already_supported' });

  const next = Object.assign({}, files);
  next['src/math-ast-core-v0-1.js'] = patchAst(next['src/math-ast-core-v0-1.js']);
  next['src/proof-calculus-core-v0-1.js'] = patchProof(next['src/proof-calculus-core-v0-1.js']);
  next['src/operator-anatomy-v0-1.js'] = patchAnatomy(next['src/operator-anatomy-v0-1.js']);
  next['src/source-edit-reality-feedback-v0-1.js'] = patchReality(next['src/source-edit-reality-feedback-v0-1.js']);
  next['src/whole-self-simulation-core-v0-1.js'] = patchWholeSelf(next['src/whole-self-simulation-core-v0-1.js']);

  const proposal = {
    id: 'frontier_candidate_matrix_product_v0_1',
    discovery,
    operations: [
      { type: 'replace', path: 'src/math-ast-core-v0-1.js', content: next['src/math-ast-core-v0-1.js'] },
      { type: 'replace', path: 'src/proof-calculus-core-v0-1.js', content: next['src/proof-calculus-core-v0-1.js'] },
      { type: 'replace', path: 'src/operator-anatomy-v0-1.js', content: next['src/operator-anatomy-v0-1.js'] },
      { type: 'replace', path: 'src/source-edit-reality-feedback-v0-1.js', content: next['src/source-edit-reality-feedback-v0-1.js'] },
      { type: 'replace', path: 'src/whole-self-simulation-core-v0-1.js', content: next['src/whole-self-simulation-core-v0-1.js'] },
      { type: 'create', path: TEST_PATH, content: buildTest() }
    ]
  };

  const sandbox = S.create(files, { allowDelete: false, maxPatchBytes: 5000000 });
  const anchors = Array.from(R.DEFAULT_ANCHORS).concat([{ id: 'matrix_product_guard', input: MATRIX_INPUT, must_verify: true, closure_operator: 'typeMatrixProduct', selected_rule: 'matrix-product-dimension-guard' }]);
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
