#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'artifacts', 'frontier-discovery-candidate-report-v0-1.json');
const STATUS_PATH = path.join(ROOT, 'artifacts', 'frontier-discovery-candidate-promotion-status-v0-1.json');

const ALLOWED_PATHS = new Set([
  'src/math-ast-core-v0-1.js',
  'src/proof-calculus-core-v0-1.js',
  'src/operator-anatomy-v0-1.js',
  'src/source-edit-reality-feedback-v0-1.js',
  'src/whole-self-simulation-core-v0-1.js',
  'tests/frontier-candidate-complex-unit-v0-1-test.js',
  'tests/frontier-candidate-matrix-product-v0-1-test.js'
]);

const ALLOWED_CANDIDATES = new Map([
  ['frontier_candidate_complex_unit_identity_v0_1', 'complex_unit_identity'],
  ['frontier_candidate_matrix_product_v0_1', 'matrix_multiplication'],
  ['frontier_candidate_sequence_definition_v0_1', 'sequence_definition']
]);

function writeStatus(status) {
  fs.mkdirSync(path.dirname(STATUS_PATH), { recursive: true });
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2) + '\n');
}

function text(value) { return String(value == null ? '' : value); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function targetPath(relativePath) {
  const rel = text(relativePath).trim();
  if (!rel || rel.includes('..') || path.isAbsolute(rel)) throw new Error('unsafe_path:' + rel);
  return path.join(ROOT, rel);
}

if (!fs.existsSync(REPORT_PATH)) {
  writeStatus({ promoted: false, reason: 'missing_frontier_discovery_candidate_report' });
  process.exit(0);
}

let report;
try {
  report = readJson(REPORT_PATH);
} catch (err) {
  writeStatus({ promoted: false, reason: 'invalid_frontier_discovery_candidate_report_json', error: String(err && err.message || err) });
  process.exit(0);
}

const summary = report.summary || {};
const proposal = report.proposal || {};
const simulation = report.simulation || {};
const exportPatch = report.export_patch || {};
const operations = Array.isArray(proposal.operations) ? proposal.operations : [];
const changed = Array.isArray(simulation.changed) ? simulation.changed : [];
const operationPaths = operations.map(op => text(op.path).trim());
const expectedKind = ALLOWED_CANDIDATES.get(proposal.id);

const noopAlreadySupported = proposal.id == null && operations.length === 0 && summary.accepted_by_sandbox === true;
if (noopAlreadySupported) {
  writeStatus({ promoted: false, reason: 'candidate_already_current_or_noop', checks: { noop_report: true }, discovery_kind: summary.discovery_kind || null });
  process.exit(0);
}

const checks = {
  candidate_id_known: ALLOWED_CANDIDATES.has(proposal.id),
  discovery_kind_known: !!expectedKind && summary.discovery_kind === expectedKind,
  accepted_by_sandbox: summary.accepted_by_sandbox === true && simulation.accepted === true,
  tests_ok: summary.tests_ok === true && Array.isArray(simulation.tests) && simulation.tests.every(row => row && row.ok === true),
  validators_ok: summary.validators_ok === true && Array.isArray(simulation.validators) && simulation.validators.every(row => row && row.ok === true),
  no_chaos: Array.isArray(summary.chaos) && summary.chaos.length === 0 && Array.isArray(simulation.chaos) && simulation.chaos.length === 0,
  export_patch_ok: summary.export_patch_ok === true && exportPatch.ok === true,
  operations_present: operations.length > 0,
  all_paths_allowed: operationPaths.length > 0 && operationPaths.every(p => ALLOWED_PATHS.has(p)),
  changed_paths_allowed: changed.every(p => ALLOWED_PATHS.has(p))
};

const ok = Object.values(checks).every(Boolean);
if (!ok) {
  writeStatus({
    promoted: false,
    reason: 'frontier_candidate_promotion_gate_failed',
    checks,
    candidate_id: proposal.id || null,
    expected_kind: expectedKind || null,
    actual_kind: summary.discovery_kind || null,
    operation_paths: operationPaths,
    changed_paths: changed
  });
  process.exit(0);
}

const applied = [];
const skipped = [];
try {
  for (const op of operations) {
    const rel = text(op.path).trim();
    const type = op.type || op.op || 'replace';
    if (!ALLOWED_PATHS.has(rel)) throw new Error('path_not_allowed:' + rel);
    const target = targetPath(rel);
    const nextContent = text(op.content);
    const existed = fs.existsSync(target);
    const before = existed ? fs.readFileSync(target, 'utf8') : null;

    if (type === 'create') {
      if (existed && before === nextContent) {
        skipped.push({ path: rel, reason: 'already_current', type });
        continue;
      }
      if (existed && before !== nextContent) throw new Error('create_target_exists_with_different_content:' + rel);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, nextContent);
      applied.push({ path: rel, type, before_bytes: 0, after_bytes: nextContent.length });
      continue;
    }

    if (type === 'replace') {
      if (!existed) throw new Error('replace_target_missing:' + rel);
      if (before === nextContent) {
        skipped.push({ path: rel, reason: 'already_current', type });
        continue;
      }
      fs.writeFileSync(target, nextContent);
      applied.push({ path: rel, type, before_bytes: before.length, after_bytes: nextContent.length });
      continue;
    }

    throw new Error('unsupported_operation_type:' + type);
  }
} catch (err) {
  writeStatus({ promoted: false, reason: 'frontier_candidate_apply_failed', checks, applied, skipped, error: String(err && err.message || err) });
  process.exit(1);
}

writeStatus({
  promoted: applied.length > 0,
  reason: applied.length > 0 ? 'safe_frontier_candidate_promoted' : 'candidate_already_current',
  checks,
  applied,
  skipped,
  candidate_id: proposal.id,
  discovery_kind: summary.discovery_kind,
  changed_paths: changed
});
