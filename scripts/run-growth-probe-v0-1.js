#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('../src/self-edit-loop-v0-1.js');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const REPORT_PATH = path.join(ARTIFACT_DIR, 'growth-probe-report-v0-1.json');
const SUMMARY_PATH = path.join(ARTIFACT_DIR, 'growth-probe-summary-v0-1.json');

function readIfExists(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

function collectFiles() {
  const files = {};
  L.DEFAULT_MANIFEST.forEach(layer => {
    [layer.source, layer.test].forEach(relativePath => {
      const content = readIfExists(relativePath);
      if (content != null) files[relativePath] = content;
    });
  });
  return files;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeProbe(files) {
  const probed = clone(files);
  delete probed['src/truth-accounting-core-v0-1.js'];
  delete probed['tests/truth-accounting-core-v0-1-test.js'];
  if (probed['src/language-parser-v0-1.js']) {
    probed['src/language-parser-v0-1.js'] = probed['src/language-parser-v0-1.js'].replace(/roundTrip/g, 'roundTrip_missing_marker');
  }
  return probed;
}

function main() {
  const base = collectFiles();
  const files = makeProbe(base);
  const rawInput = Object.keys(files).sort().map(key => '--- ' + key + '\n' + files[key]).join('\n');
  const report = L.run(files, {
    rawInput,
    tests: [],
    sandboxOptions: { allowDelete: false, maxPatchBytes: 5_000_000 }
  });

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');

  const summary = {
    probe: 'missing_truth_layer_plus_parser_roundtrip_marker',
    accepted: report.accepted,
    decision: report.decision,
    gap_count: report.state.gaps.length,
    mathematical_gap_count: report.math_patch ? report.math_patch.gaps.length : null,
    mathematical_decision: report.math_patch ? report.math_patch.decision : null,
    operator_candidate_count: report.operator_synthesis && report.operator_synthesis.candidates ? report.operator_synthesis.candidates.length : 0,
    operator_decision: report.operator_synthesis ? report.operator_synthesis.decision : null,
    operator_candidates: report.operator_synthesis && report.operator_synthesis.candidates
      ? report.operator_synthesis.candidates.map(c => ({ operator: c.operator, target: c.target, rule: c.rule, source_failure: c.source_failure }))
      : [],
    operations: report.proposal.operations.map(op => ({ type: op.type, path: op.path })),
    truth_gate: report.truth_gate,
    changed_virtual_paths: report.sandbox_report.changed,
    chaos: report.sandbox_report.chaos
  };

  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) main();
