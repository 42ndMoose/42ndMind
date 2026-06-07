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

function patchAst(s) {
  if (!has(s, 'function parseComplexUnitIdentity')) {
    const block = String.raw`
  function parseComplexUnitIdentity(input) {
    const raw = compact(input);
    if (!/^i\^2=-1$/i.test(raw)) return null;
    return node('ComplexUnitIdentityStatement', {
      unit: symbol('i'),
      domain: symbol('C'),
      expression: binary('^', symbol('i'), numberLiteral(2)),
      relation: relation('=', binary('^', symbol('i'), numberLiteral(2)), numberLiteral(-1)),
      rule_class: 'complex_unit_identity'
    });
  }

`;
    s = replaceOnce(s, '  function parseArithmeticRelation(input) {', block + '  function parseArithmeticRelation(input) {', 'complex parser insertion');
  }
  if (!has(s, 'parseComplexUnitIdentity,')) {
    s = replaceOnce(s,
      '      parseProbabilityProductStatement,\n      parseDivisionConstraint,',
      '      parseProbabilityProductStatement,\n      parseComplexUnitIdentity,\n      parseDivisionConstraint,',
      'complex parser list insertion');
  }
  if (!has(s, "ComplexUnitIdentityStatement: { class: 'number_system'")) {
    s = replaceOnce(s,
      "      ProbabilityProductStatement: { class: 'probability', anatomy_id: 'probability_product_rule', closure: 'proveProbabilityProductRule' },\n      AffineExpression:",
      "      ProbabilityProductStatement: { class: 'probability', anatomy_id: 'probability_product_rule', closure: 'proveProbabilityProductRule' },\n      ComplexUnitIdentityStatement: { class: 'number_system', anatomy_id: 'complex_unit_identity', closure: 'proveComplexUnitIdentity' },\n      AffineExpression:",
      'complex classification insertion');
  }
  if (!has(s, 'parseComplexUnitIdentity,')) throw new Error('complex parser list did not apply');
  if (!/parseComplexUnitIdentity/.test(s.split('return Object.freeze')[1] || '')) {
    s = replaceOnce(s,
      'parseProbabilityProductStatement,',
      'parseProbabilityProductStatement, parseComplexUnitIdentity,',
      'complex export insertion');
  }
  return s;
}

function patchProof(s) {
  if (!has(s, 'function proveComplexUnitIdentity')) {
    const block = String.raw`
  function proveComplexUnitIdentity(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'ComplexUnitIdentityStatement') return gap('unsupported_complex_unit_identity', 'Complex unit identity closure requires a ComplexUnitIdentityStatement AST node.');
    return verified('complex-unit-identity', {
      operator: 'proveComplexUnitIdentity',
      domain: clone(body.domain),
      conclusion: clone(body.relation),
      steps: ['detect-imaginary-unit-symbol', 'apply-complex-unit-identity-i-squared-equals-negative-one']
    });
  }

`;
    s = replaceOnce(s, '  function domainGuard(input) {', block + '  function domainGuard(input) {', 'complex proof insertion');
  }
  if (!has(s, "operator === 'proveComplexUnitIdentity'")) {
    s = replaceOnce(s,
      "    if (operator === 'proveProbabilityProductRule') return proveProbabilityProductRule(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      "    if (operator === 'proveProbabilityProductRule') return proveProbabilityProductRule(body);\n    if (operator === 'proveComplexUnitIdentity') return proveComplexUnitIdentity(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      'complex prove dispatcher insertion');
  }
  if (!has(s, 'proveComplexUnitIdentity,')) {
    s = replaceOnce(s,
      '    proveProbabilityProductRule,\n    domainGuard,',
      '    proveProbabilityProductRule,\n    proveComplexUnitIdentity,\n    domainGuard,',
      'complex proof export insertion');
  }
  return s;
}

function patchAnatomy(s) {
  if (!has(s, 'complex_unit_identity: Object.freeze')) {
    const block = String.raw`    complex_unit_identity: Object.freeze({
      id: 'complex_unit_identity', operation: 'prove', surface: 'i^2 = -1 over C',
      parts: ['imaginary_unit', 'exponent', 'negative_one', 'complex_domain'], preconditions: ['i is typed as imaginary unit', 'domain is complex numbers'],
      inverse_chain: [], closure_operator: 'proveComplexUnitIdentity', closure_result: 'complex_unit_truth',
      examples: ['i^2 = -1'], assertion: "assert.strictEqual(P.proveComplexUnitIdentity('i^2 = -1').ok, true);"
    }),
`;
    s = replaceOnce(s, '    division_constraint: Object.freeze({', block + '    division_constraint: Object.freeze({', 'complex anatomy insertion');
  }
  return s;
}

function patchReality(s) {
  if (!has(s, 'complex_unit_identity')) {
    s = replaceOnce(s,
      "    { id: 'probability_independence_product_guard', input: 'P(A and B) = P(A)P(B)', must_verify: true, closure_operator: 'proveProbabilityProductRule', selected_rule: 'probability-product-requires-independence' }\n  ]);",
      "    { id: 'probability_independence_product_guard', input: 'P(A and B) = P(A)P(B)', must_verify: true, closure_operator: 'proveProbabilityProductRule', selected_rule: 'probability-product-requires-independence' },\n    { id: 'complex_unit_identity', input: 'i^2 = -1', must_verify: true, closure_operator: 'proveComplexUnitIdentity', selected_rule: 'complex-unit-identity' }\n  ]);",
      'complex reality anchor insertion');
  }
  return s;
}

function buildTest() {
  return [
    "const assert = require('assert');",
    "const AST = require('../src/math-ast-core-v0-1.js');",
    "const Proof = require('../src/proof-calculus-core-v0-1.js');",
    "const Closure = require('../src/math-closure-engine-v0-1.js');",
    "const K = require('../src/math-language-kernel-v0-1.js');",
    "const source = 'i' + '^' + '2 = -1';",
    "const ast = AST.parse(source);",
    "assert.strictEqual(ast.ok, true);",
    "assert.strictEqual(ast.body.type, 'ComplexUnitIdentityStatement');",
    "assert.strictEqual(AST.classify(ast).closure, 'proveComplexUnitIdentity');",
    "const proof = Proof.proveComplexUnitIdentity(ast);",
    "assert.strictEqual(proof.ok, true);",
    "assert.strictEqual(proof.selected_rule, 'complex-unit-identity');",
    "const closed = Closure.close(source);",
    "assert.strictEqual(closed.ok, true);",
    "assert.strictEqual(closed.selected_rule, 'complex-unit-identity');",
    "const packet = K.math(source);",
    "assert.strictEqual(packet.ok, true);",
    "assert.strictEqual(packet.closure_operator, 'proveComplexUnitIdentity');",
    "assert.strictEqual(packet.selected_rule, 'complex-unit-identity');",
    "console.log('frontier-candidate-complex-unit-v0-1 tests passed');",
    ""
  ].join('\n');
}

function main() {
  const files = collectFiles();
  const discovery = FD.infer('i' + '^' + '2 = -1');
  const next = Object.assign({}, files);
  next['src/math-ast-core-v0-1.js'] = patchAst(next['src/math-ast-core-v0-1.js']);
  next['src/proof-calculus-core-v0-1.js'] = patchProof(next['src/proof-calculus-core-v0-1.js']);
  next['src/operator-anatomy-v0-1.js'] = patchAnatomy(next['src/operator-anatomy-v0-1.js']);
  next['src/source-edit-reality-feedback-v0-1.js'] = patchReality(next['src/source-edit-reality-feedback-v0-1.js']);

  const proposal = {
    id: 'frontier_candidate_complex_unit_identity_v0_1',
    discovery,
    operations: [
      { type: 'replace', path: 'src/math-ast-core-v0-1.js', content: next['src/math-ast-core-v0-1.js'] },
      { type: 'replace', path: 'src/proof-calculus-core-v0-1.js', content: next['src/proof-calculus-core-v0-1.js'] },
      { type: 'replace', path: 'src/operator-anatomy-v0-1.js', content: next['src/operator-anatomy-v0-1.js'] },
      { type: 'replace', path: 'src/source-edit-reality-feedback-v0-1.js', content: next['src/source-edit-reality-feedback-v0-1.js'] },
      { type: 'create', path: TEST_PATH, content: buildTest() }
    ]
  };

  const sandbox = S.create(files, { allowDelete: false, maxPatchBytes: 5000000 });
  const anchors = Array.from(R.DEFAULT_ANCHORS).concat([{ id: 'complex_unit_identity', input: 'i^2 = -1', must_verify: true, closure_operator: 'proveComplexUnitIdentity', selected_rule: 'complex-unit-identity' }]);
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
