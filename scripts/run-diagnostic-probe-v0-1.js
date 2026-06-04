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
  return { φ: packet.φ, ω: packet.ω, score: packet.score, z: packet.z, u: packet.u, χ: packet.χ, Ξ: packet.Ξ };
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

function compactCanonical(packet) {
  return { φ: packet.φ, id: packet.id, F: packet.F, body: packet.body, u: packet.u, χ: packet.χ, Ξ: packet.Ξ };
}

function compactEquivalence(packet) {
  return { φ: packet.φ, true: packet.true, distance: packet.distance, a: packet.a, b: packet.b, χ: packet.χ, Ξ: packet.Ξ };
}

function compactClosure(packet) {
  return { φ: packet.φ, field_count: packet.fields.length, fields: packet.fields, gaps: packet.gaps, transforms: packet.transforms, u: packet.u, χ: packet.χ, Ξ: packet.Ξ };
}

function compactProof(packet) {
  return { φ: packet.φ, true: packet.true, valid: packet.valid, reduced: packet.reduced, before: packet.before, after: packet.after, transform: packet.transform, χ: packet.χ, Ξ: packet.Ξ };
}

function compactConvergence(packet) {
  return { φ: packet.φ, stable: packet.stable, score: packet.score, final: packet.final, trace: packet.trace, u: packet.u, χ: packet.χ, Ξ: packet.Ξ };
}

function compactGround(packet) {
  return { φ: packet.φ, mode: packet.mode, formal: packet.formal, observed: packet.observed, true: packet.true, id: packet.id, χ: packet.χ, Ξ: packet.Ξ };
}

function compactLexicon(packet) {
  return { φ: packet.φ, Λ: packet.Λ, count: packet.count, entries: packet.entries, u: packet.u, χ: packet.χ, Ξ: packet.Ξ };
}

function main() {
  const files = collectFiles();
  files[PROBE_TEST] = [
    "const assert = require('assert');",
    "assert.strictEqual(0, 1, 'unit invariant failed: probe expected_actual_alignment');",
    ""
  ].join('\n');

  const rawInput = Object.keys(files).sort().map(key => '--- ' + key + '\n' + files[key]).join('\n');
  const report = L.run(files, { rawInput, tests: [PROBE_TEST], sandboxOptions: { allowDelete: false, maxPatchBytes: 5_000_000 } });

  const kernelClosedDiscrepancy = K.discrepancy(1, 1, 'diagnostic:closed-discrepancy');
  const kernelDiscrepancy = K.discrepancy(0, 1, 'tests/diagnostic-probe-v0-1-test.js');
  const current = [{ σ: 'a', w: 0.5 }, { σ: 'b', w: 0.5 }];
  const target = [{ σ: 'a', w: 0.25 }, { σ: 'b', w: 0.75 }];
  const messy = [{ σ: 'b', w: 0.25 }, { σ: 'a', w: 0.25 }, { σ: 'b', w: 0.25 }, { σ: 'a', w: 0.25 }];
  const axisTarget = [{ σ: 'a', w: 0.4 }, { σ: 'b', w: 0.4 }, { σ: 'c', w: 0.2 }];
  const kernelClosedGap = K.gap(current, current, 'diagnostic:closed-gap');
  const kernelWeightGap = K.gap(current, target, 'diagnostic:weight');
  const kernelAxisGap = K.gap(current, axisTarget, 'diagnostic:axis');
  const kernelCorrection = K.correction(current, target, 'diagnostic:correction');
  const kernelCanonical = K.canonical(messy);
  const kernelEquivalentSame = K.equivalent(messy, current);
  const kernelEquivalentDifferent = K.equivalent(current, target);
  const kernelClosure = K.close([current], { target });
  const kernelProof = K.proveTransform(kernelCorrection, current, target, 'diagnostic:proof');
  const kernelConvergence = K.converge(current, target, { steps: 4 });
  const kernelFormalGround = K.ground(current);
  const kernelObservedGround = K.ground(current, [{ source: 'diagnostic', value: current }]);
  const kernelLexicon = K.deriveLexicon([
    kernelClosedGap,
    kernelClosedDiscrepancy,
    kernelCorrection,
    kernelProof,
    kernelConvergence,
    kernelFormalGround,
    kernelObservedGround,
    kernelEquivalentSame,
    kernelEquivalentDifferent
  ]);
  const kernelResolvedClosedGap = K.resolveLexeme('Λ:Δ0', kernelLexicon);

  const kernelLogic = {
    definitions: K.definitions(),
    invariants: K.invariants(),
    invariant_field: K.invariantField(),
    valid_field: K.validateField([{ σ: 'a', w: 1 }]),
    invalid_unit_field: K.validateField([{ σ: 'a', w: 0.25 }]),
    closed_discrepancy: kernelClosedDiscrepancy,
    discrepancy: kernelDiscrepancy,
    closed_gap: kernelClosedGap,
    weight_gap: kernelWeightGap,
    axis_gap: kernelAxisGap,
    correction: kernelCorrection,
    canonical: kernelCanonical,
    equivalent_same: kernelEquivalentSame,
    equivalent_different: kernelEquivalentDifferent,
    closure: kernelClosure,
    proof: kernelProof,
    convergence: kernelConvergence,
    ground_formal: kernelFormalGround,
    ground_observed: kernelObservedGround,
    lexicon: kernelLexicon,
    resolve_closed_gap: kernelResolvedClosedGap,
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
      closed_discrepancy: { φ: kernelClosedDiscrepancy.φ, ω: kernelClosedDiscrepancy.ω, score: kernelClosedDiscrepancy.score, z: kernelClosedDiscrepancy.z, u: kernelClosedDiscrepancy.u, χ: kernelClosedDiscrepancy.χ, Ξ: kernelClosedDiscrepancy.Ξ },
      discrepancy: { φ: kernelDiscrepancy.φ, ω: kernelDiscrepancy.ω, score: kernelDiscrepancy.score, z: kernelDiscrepancy.z, u: kernelDiscrepancy.u, χ: kernelDiscrepancy.χ, Ξ: kernelDiscrepancy.Ξ },
      closed_gap: compactGap(kernelClosedGap),
      weight_gap: compactGap(kernelWeightGap),
      axis_gap: compactGap(kernelAxisGap),
      correction: compactCorrection(kernelCorrection),
      canonical: compactCanonical(kernelCanonical),
      equivalent_same: compactEquivalence(kernelEquivalentSame),
      equivalent_different: compactEquivalence(kernelEquivalentDifferent),
      closure: compactClosure(kernelClosure),
      proof: compactProof(kernelProof),
      convergence: compactConvergence(kernelConvergence),
      ground_formal: compactGround(kernelFormalGround),
      ground_observed: compactGround(kernelObservedGround),
      lexicon: compactLexicon(kernelLexicon),
      resolve_closed_gap: kernelResolvedClosedGap
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
