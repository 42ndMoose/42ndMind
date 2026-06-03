#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('../src/self-edit-loop-v0-1.js');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const REPORT_PATH = path.join(ARTIFACT_DIR, 'self-edit-loop-report-v0-1.json');

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

  [
    'README.md',
    'docs/language-standard-v0-1.md',
    'src/self-edit-loop-v0-1.js',
    'tests/self-edit-loop-v0-1-test.js'
  ].forEach(relativePath => {
    const content = readIfExists(relativePath);
    if (content != null) files[relativePath] = content;
  });

  return files;
}

function main() {
  const files = collectFiles();
  const rawInput = Object.keys(files).sort().map(key => '--- ' + key + '\n' + files[key]).join('\n');
  const report = L.run(files, {
    rawInput,
    tests: [],
    sandboxOptions: { allowDelete: false, maxPatchBytes: 5_000_000 }
  });

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');

  const summary = {
    accepted: report.accepted,
    gap_count: report.state.gaps.length,
    operations: report.proposal.operations.length,
    artifact: path.relative(ROOT, REPORT_PATH),
    truth_gate: report.truth_gate,
    changed_virtual_paths: report.sandbox_report.changed
  };

  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) main();
