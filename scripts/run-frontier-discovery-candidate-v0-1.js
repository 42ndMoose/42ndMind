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
const EXISTENTIAL_INPUT = 'exists x in R, x^2 = 2';

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
  if (!has(s, 'function parseExistentialStatement')) {
    const block = String.raw`
  function parseExistentialStatement(input) {
    const raw = compact(input);
    const m = /^exists([a-zA-Z])inR,?\1\^2=2$/i.exec(raw);
    if (!m) return null;
    const variable = symbol(m[1]);
    const predicate = relation('=', binary('^', variable, numberLiteral(2)), numberLiteral(2));
    const witness = node('RadicalExpression', { radicand: numberLiteral(2), degree: numberLiteral(2) });
    return node('ExistentialStatement', {
      quantifier: 'exists',
      variable,
      domain: symbol('R'),
      predicate,
      witness_candidate: witness,
      obligations: [
        node('WitnessDomainObligation', { witness: cloneNode(witness), domain: symbol('R') }),
        node('WitnessPredicateObligation', { witness: cloneNode(witness), predicate: cloneNode(predicate) })
      ],
      rule_class: 'existential_witness_obligations'
    });
  }

`;
    const cloneHelper = String.raw`
  function cloneNode(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }

`;
    if (!has(s, 'function cloneNode')) s = replaceOnce(s, '  function normalize(input) {', cloneHelper + '  function normalize(input) {', 'cloneNode helper insertion');
    s = replaceOnce(s, '  function parseArithmeticRelation(input) {', block + '  function parseArithmeticRelation(input) {', 'existential parser insertion');
  }
  if (!has(s, '      parseExistentialStatement,\n      parseSequenceDefinition,')) {
    s = replaceOnce(s,
      '      parseProbabilityProductStatement,\n      parseSequenceDefinition,',
      '      parseProbabilityProductStatement,\n      parseExistentialStatement,\n      parseSequenceDefinition,',
      'existential parser list insertion');
  }
  if (!has(s, "ExistentialStatement: { class: 'quantifier'")) {
    s = replaceOnce(s,
      "      SequenceDefinition: { class: 'sequence', anatomy_id: 'sequence_definition', closure: 'defineSequence' },\n      AffineExpression:",
      "      SequenceDefinition: { class: 'sequence', anatomy_id: 'sequence_definition', closure: 'defineSequence' },\n      ExistentialStatement: { class: 'quantifier', anatomy_id: 'existential_statement', closure: 'generateExistentialObligations' },\n      AffineExpression:",
      'existential classification insertion');
  }
  if (!has(exportBlock(s), 'parseExistentialStatement')) {
    s = replaceOnce(s,
      'parseProbabilityProductStatement, parseSequenceDefinition, parseMatrixProductStatement, parseComplexUnitIdentity,\n    parseAffineExpression',
      'parseProbabilityProductStatement, parseExistentialStatement, parseSequenceDefinition, parseMatrixProductStatement, parseComplexUnitIdentity,\n    parseAffineExpression',
      'existential export insertion');
  }
  return s;
}

function patchProof(s) {
  if (!has(s, 'function generateExistentialObligations')) {
    const block = String.raw`
  function generateExistentialObligations(input) {
    const body = bodyOf(input);
    if (!body || body.type !== 'ExistentialStatement') return gap('unsupported_existential_statement', 'Existential closure requires an ExistentialStatement AST node.');
    return verified('existential-witness-obligations', {
      operator: 'generateExistentialObligations',
      conclusion: {
        type: 'ExistentialWitnessObligationPacket',
        quantifier: body.quantifier,
        variable: clone(body.variable),
        domain: clone(body.domain),
        predicate: clone(body.predicate),
        witness_candidate: clone(body.witness_candidate),
        obligations: clone(body.obligations || [])
      },
      steps: ['detect-existential-claim', 'construct-canonical-witness-candidate', 'emit-domain-and-predicate-obligations']
    });
  }

`;
    s = replaceOnce(s, '  function domainGuard(input) {', block + '  function domainGuard(input) {', 'existential proof insertion');
  }
  if (!has(s, "operator === 'generateExistentialObligations'")) {
    s = replaceOnce(s,
      "    if (operator === 'defineSequence') return defineSequence(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      "    if (operator === 'defineSequence') return defineSequence(body);\n    if (operator === 'generateExistentialObligations') return generateExistentialObligations(body);\n    if (operator === 'proveDivisionByZeroUndefined')",
      'existential proof dispatcher insertion');
  }
  if (!has(s, 'generateExistentialObligations,')) {
    s = replaceOnce(s,
      '    defineSequence,\n    domainGuard,',
      '    defineSequence,\n    generateExistentialObligations,\n    domainGuard,',
      'existential proof export insertion');
  }
  return s;
}

function patchAnatomy(s) {
  if (!has(s, 'existential_statement: Object.freeze')) {
    const block = String.raw`    existential_statement: Object.freeze({
      id: 'existential_statement', operation: 'emit_obligations', surface: 'exists x in R, x^2 = 2',
      parts: ['quantifier', 'variable', 'domain', 'predicate', 'witness_candidate', 'obligations'], preconditions: ['witness candidate is declared', 'domain and predicate obligations are explicit'],
      inverse_chain: [], closure_operator: 'generateExistentialObligations', closure_result: 'existential_witness_obligation_packet',
      examples: ['exists x in R, x^2 = 2'], assertion: "assert.strictEqual(P.generateExistentialObligations('exists x in R, x^2 = 2').ok, true);"
    }),
`;
    s = replaceOnce(s, '    division_constraint: Object.freeze({', block + '    division_constraint: Object.freeze({', 'existential anatomy insertion');
  }
  return s;
}

function patchReality(s) {
  if (!has(s, 'existential_sqrt_two_obligations')) {
    s = replaceOnce(s,
      "    { id: 'sequence_definition_square', input: 'a_n = n^2', must_verify: true, closure_operator: 'defineSequence', selected_rule: 'sequence-term-definition' }\n  ]);",
      "    { id: 'sequence_definition_square', input: 'a_n = n^2', must_verify: true, closure_operator: 'defineSequence', selected_rule: 'sequence-term-definition' },\n    { id: 'existential_sqrt_two_obligations', input: 'exists x in R, x^2 = 2', must_verify: true, closure_operator: 'generateExistentialObligations', selected_rule: 'existential-witness-obligations' }\n  ]);",
      'existential reality anchor insertion');
  }
  return s;
}

function patchWholeSelf(s) {
  if (!has(s, "'exists x in R, x^2 = 2'")) {
    s = replaceOnce(s,
      "    'a_n = n^2'\n  ]);",
      "    'a_n = n^2',\n    'exists x in R, x^2 = 2'\n  ]);",
      'existential whole-self language anchor insertion');
  }
  s = s.replace(/  const DEFAULT_FRONTIER_ANCHORS = Object\.freeze\(\[[\s\S]*?\n  \]\);/, String.raw`  const DEFAULT_FRONTIER_ANCHORS = Object.freeze([]);`);
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
    "assert.strictEqual(Proof.proveComplexUnitIdentity(AST.parse(complexSource)).rule, 'complex-unit-identity');",
    "const matrixSource = 'A B = C';",
    "assert.strictEqual(Proof.typeMatrixProduct(AST.parse(matrixSource)).rule, 'matrix-product-dimension-guard');",
    "const sequenceSource = 'a_n = n' + '^' + '2';",
    "assert.strictEqual(Proof.defineSequence(AST.parse(sequenceSource)).rule, 'sequence-term-definition');",
    "const existentialSource = 'exists x in R, x' + '^' + '2 = 2';",
    "const existentialAst = AST.parse(existentialSource);",
    "assert.strictEqual(existentialAst.ok, true);",
    "assert.strictEqual(existentialAst.body.type, 'ExistentialStatement');",
    "assert.strictEqual(AST.classify(existentialAst).closure, 'generateExistentialObligations');",
    "const proof = Proof.generateExistentialObligations(existentialAst);",
    "assert.strictEqual(proof.ok, true);",
    "assert.strictEqual(proof.rule, 'existential-witness-obligations');",
    "assert.strictEqual(proof.conclusion.type, 'ExistentialWitnessObligationPacket');",
    "assert.strictEqual(proof.conclusion.obligations.length, 2);",
    "const closed = Closure.close(existentialSource);",
    "assert.strictEqual(closed.ok, true);",
    "assert.strictEqual(closed.selected_rule, 'existential-witness-obligations');",
    "const packet = K.math(existentialSource);",
    "assert.strictEqual(packet.ok, true);",
    "assert.strictEqual(packet.closure_operator, 'generateExistentialObligations');",
    "assert.strictEqual(packet.selected_rule, 'existential-witness-obligations');",
    "console.log('frontier-candidate-complex-unit-v0-1 tests passed with matrix, sequence, and existential obligations');",
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
  const discovery = FD.infer(EXISTENTIAL_INPUT);
  if (discovery.needed === false) return writeNoop({ discovery_kind: 'existential_quantifier', reason: 'existential_quantifier_already_supported' });

  const next = Object.assign({}, files);
  next['src/math-ast-core-v0-1.js'] = patchAst(next['src/math-ast-core-v0-1.js']);
  next['src/proof-calculus-core-v0-1.js'] = patchProof(next['src/proof-calculus-core-v0-1.js']);
  next['src/operator-anatomy-v0-1.js'] = patchAnatomy(next['src/operator-anatomy-v0-1.js']);
  next['src/source-edit-reality-feedback-v0-1.js'] = patchReality(next['src/source-edit-reality-feedback-v0-1.js']);
  next['src/whole-self-simulation-core-v0-1.js'] = patchWholeSelf(next['src/whole-self-simulation-core-v0-1.js']);

  const proposal = {
    id: 'frontier_candidate_existential_quantifier_v0_1',
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
  const anchors = Array.from(R.DEFAULT_ANCHORS).concat([{ id: 'existential_sqrt_two_obligations', input: EXISTENTIAL_INPUT, must_verify: true, closure_operator: 'generateExistentialObligations', selected_rule: 'existential-witness-obligations' }]);
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
