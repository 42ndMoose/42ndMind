#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const L = require('../src/self-edit-loop-v0-1.js');
const K = require('../src/math-language-kernel-v0-1.js');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const REPORT_PATH = path.join(ARTIFACT_DIR, 'diagnostic-probe-report-v0-1.json');
const SUMMARY_PATH = path.join(ARTIFACT_DIR, 'diagnostic-probe-summary-v0-1.json');
const KERNEL_DISCREPANCY_PATH = path.join(ARTIFACT_DIR, 'diagnostic-kernel-discrepancy-v0-1.json');
const KERNEL_LOGIC_PATH = path.join(ARTIFACT_DIR, 'diagnostic-kernel-logic-v0-1.json');
const PROBE_TEST = 'tests/diagnostic-probe-v0-1-test.js';

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

function compactGap(packet) {
  return {
    φ: packet.φ,
    ω: packet.ω,
    score: packet.score,
    z: packet.z,
    u: packet.u,
    χ: packet.χ,
    Ξ: packet.Ξ
  };
}

function compactCorrection(packet) {
  return {
    φ: packet.φ,
    method: packet.method,
    chosen: packet.chosen,
    reduced: packet.reduced,
    before: compactGap(packet.before),
    after: compactGap(packet.after),
    transformed: packet.transformed,
    candidates: packet.candidates,
    u: packet.u,
    χ: packet.χ,
    Ξ: packet.Ξ
  };
}

function main() {
  const files = collectFiles();
  files[PROBE_TEST] = [
    "const assert = require('assert');",
    "assert.strictEqual(0, 1, 'unit invariant failed: probe expected_actual_alignment');",
    ""
  ].join('\n');

  const rawInput = Object.keys(files).sort().map(key => '--- ' + key + '\n' + files[key]).join('\n');
  const report = L.run(files, {
    rawInput,
    tests: [PROBE_TEST],
    sandboxOptions: { allowDelete: false, maxPatchBytes: 5_000_000 }
  });

  const kernelDiscrepancy = K.discrepancy(0, 1, 'tests/diagnostic-probe-v0-1-test.js');
  const current = [{ σ: 'a', w: 0.5 }, { σ: 'b', w: 0.5 }];
  const target = [{ σ: 'a', w: 0.25 }, { σ: 'b', w: 0.75 }];
  const axisTarget = [{ σ: 'a', w: 0.4 }, { σ: 'b', w: 0.4 }, { σ: 'c', w: 0.2 }];
  const kernelWeightGap = K.gap(current, target, 'diagnostic:weight');
  const kernelAxisGap = K.gap(current, axisTarget, 'diagnostic:axis');
  const kernelCorrection = K.correction(current, target, 'diagnostic:correction');
  const kernelLogic = {
    definitions: K.definitions(),
    invariants: K.invariants(),
    invariant_field: K.invariantField(),
    valid_field: K.validateField([{ σ: 'a', w: 1 }]),
    invalid_unit_field: K.validateField([{ σ: 'a', w: 0.25 }]),
    discrepancy: kernelDiscrepancy,
    weight_gap: kernelWeightGap,
    axis_gap: kernelAxisGap,
    correction: kernelCorrection,
    Ξ: ''
  };

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(KERNEL_DISCREPANCY_PATH, JSON.stringify(kernelDiscrepancy, null, 2) + '\n');
  fs.writeFileSync(KERNEL_LOGIC_PATH, JSON.stringify(kernelLogic, null, 2) + '\n');

  const failedTests = report.sandbox_report.tests.filter(t => !t.ok).map(t => ({ path: t.path, error: t.error }));
  const summary = {
    probe: 'forced_diagnostic_signature',
    accepted: report.accepted,
    decision: report.decision,
    gap_count: report.state.gaps.length,
    mathematical_gap_count: report.math_patch ? report.math_patch.gaps.length : null,
    operator_candidate_count: report.operator_synthesis && report.operator_synthesis.candidates ? report.operator_synthesis.candidates.length : 0,
    operator_decision: report.operator_synthesis ? report.operator_synthesis.decision : null,
    operator_candidates: report.operator_synthesis && report.operator_synthesis.candidates
      ? report.operator_synthesis.candidates.map(c => ({ operator: c.operator, target: c.target, rule: c.rule, source_failure: c.source_failure }))
      : [],
    kernel_logic: {
      definitions: kernelLogic.definitions,
      invariant_count: kernelLogic.invariants.length,
      invariant_field_unit: K.l1(kernelLogic.invariant_field),
      valid_field_ok: kernelLogic.valid_field.ok,
      invalid_unit_field_ok: kernelLogic.invalid_unit_field.ok,
      discrepancy: {
        φ: kernelDiscrepancy.φ,
        ω: kernelDiscrepancy.ω,
        z: kernelDiscrepancy.z,
        u: kernelDiscrepancy.u,
        χ: kernelDiscrepancy.χ,
        Ξ: kernelDiscrepancy.Ξ
      },
      weight_gap: compactGap(kernelWeightGap),
      axis_gap: compactGap(kernelAxisGap),
      correction: compactCorrection(kernelCorrection)
    },
    operations: report.proposal.operations.map(op => ({ type: op.type, path: op.path })),
    truth_gate: report.truth_gate,
    changed_virtual_paths: report.sandbox_report.changed,
    diagnostic: report.sandbox_report.chaos,
    failed_tests: failedTests
  };

  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) main();
