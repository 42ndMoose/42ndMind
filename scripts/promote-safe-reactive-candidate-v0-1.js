#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const reportPath = path.join(ROOT, 'artifacts', 'reactive-self-edit-report-v0-1.json');
const statusPath = path.join(ROOT, 'artifacts', 'reactive-promotion-status-v0-1.json');
const allowedPaths = new Set([
  'src/language-parser-v0-1.js'
]);

function writeStatus(status) {
  fs.mkdirSync(path.dirname(statusPath), { recursive: true });
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2) + '\n');
}

if (!fs.existsSync(reportPath)) {
  writeStatus({ promoted: false, reason: 'missing_reactive_report' });
  process.exit(0);
}

let report;
try {
  report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch (err) {
  writeStatus({ promoted: false, reason: 'invalid_reactive_report_json', error: String(err && err.message || err) });
  process.exit(0);
}

const consistency = report.report_consistency || {};
const candidate = report.proposed_virtual_source || {};
const candidatePath = String(candidate.path || '');
const candidateContent = typeof candidate.content === 'string' ? candidate.content : null;

const checks = {
  safe_to_propose: report.safe_to_propose === true,
  report_consistency_ok: consistency.ok === true,
  search_accepted: consistency.search_accepted === true,
  meta_accepted: consistency.meta_accepted === true,
  mutation_accepted: consistency.mutation_accepted === true,
  allowed_path: allowedPaths.has(candidatePath),
  has_candidate_content: !!candidateContent
};

const ok = Object.values(checks).every(Boolean);
if (!ok) {
  writeStatus({ promoted: false, reason: 'promotion_gate_failed', checks, candidate_path: candidatePath });
  process.exit(0);
}

const target = path.join(ROOT, candidatePath);
const before = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
if (before === candidateContent) {
  writeStatus({ promoted: false, reason: 'candidate_already_current', checks, candidate_path: candidatePath });
  process.exit(0);
}

fs.writeFileSync(target, candidateContent);
writeStatus({
  promoted: true,
  reason: 'safe_candidate_promoted',
  checks,
  candidate_path: candidatePath,
  before_bytes: before.length,
  after_bytes: candidateContent.length,
  added_needles: Array.isArray(report.candidate_diff && report.candidate_diff.added_needles) ? report.candidate_diff.added_needles : []
});
