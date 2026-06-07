#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('../src/cognitive-organism-core-v0-1.js');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const REPORT_PATH = path.join(ARTIFACT_DIR, 'cognitive-organism-report-v0-1.json');
const SUMMARY_PATH = path.join(ARTIFACT_DIR, 'cognitive-organism-summary-v0-1.json');

function main() {
  const state = C.create();
  const inputs = [
    '2 + 3 * 4 = 14',
    '2 + 3 * 4 = 14',
    '3 + 2 = 4',
    '2 + 3 * 5 = 17',
    'a_n = n^2',
    'exists x in R, x^2 = 2'
  ];
  const packets = inputs.map(input => C.observe(state, input));
  const goodEdit = C.evaluateSelfEdit(state, {
    id: 'demo_good_self_edit_closes_gap',
    tests_ok: true,
    validators_ok: true,
    preserves_identity: true,
    closes_gap: true,
    contradiction: false
  });
  const badEdit = C.evaluateSelfEdit(state, {
    id: 'demo_bad_self_edit_breaks_anchor',
    tests_ok: false,
    validators_ok: false,
    preserves_identity: false,
    closes_gap: false,
    contradiction: true,
    breaks_anchor: true
  });

  const summary = {
    packet_type: '42ndMind_cognitive_organism_summary_v0_1',
    version: C.VERSION,
    observations: packets.length,
    success_count: packets.filter(p => p.last && p.last.math && p.last.math.ok === true).length,
    failure_count: packets.filter(p => p.last && p.last.math && p.last.math.ok === false).length,
    repeated_input_surprise_drop: packets[1].surprise < packets[0].surprise,
    false_claim_pain_gt_reward: packets[2].pain > packets[2].reward,
    good_edit_decision: goodEdit.edit.decision,
    good_edit_feeling: goodEdit.edit.feeling,
    bad_edit_decision: badEdit.edit.decision,
    bad_edit_feeling: badEdit.edit.feeling,
    final_feeling: state.feeling,
    final_aliveness: state.aliveness,
    memory_summary: C.packet(state).memory_summary,
    report_artifact: path.relative(ROOT, REPORT_PATH),
    summary_artifact: path.relative(ROOT, SUMMARY_PATH),
    Ξ: ''
  };
  const report = {
    packet_type: '42ndMind_cognitive_organism_report_v0_1',
    version: C.VERSION,
    inputs,
    packets,
    good_edit: goodEdit,
    bad_edit: badEdit,
    final_state: C.packet(state),
    summary,
    Ξ: ''
  };

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));

  const ok = summary.repeated_input_surprise_drop && summary.false_claim_pain_gt_reward && summary.good_edit_decision === 'accept_candidate' && summary.bad_edit_decision === 'reject_candidate';
  if (!ok) process.exitCode = 1;
}

if (require.main === module) main();
