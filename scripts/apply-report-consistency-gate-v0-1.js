#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'scripts/run-self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('const searchAccepted = search && search.decision && search.decision.code === \'propose_best_candidate\';')) {
  const marker = '  const report = {\n';
  if (!s.includes(marker)) throw new Error('report marker not found');
  s = s.replace(marker,
`  const searchAccepted = search && search.decision && search.decision.code === 'propose_best_candidate';
  const metaAccepted = meta && meta.decision && meta.decision.code === 'propose_candidate_patch';
  const mutationAccepted = !!(goodMutation && goodMutation.accepted && goodMutation.delta < 0 && goodMutation.state.unit.ok);
  const safeToPropose = !!(searchAccepted && metaAccepted && mutationAccepted);

` + marker);
}

const old = "    safe_to_propose: !!(goodMutation && goodMutation.accepted && goodMutation.delta < 0 && goodMutation.state.unit.ok),";
if (s.includes(old)) s = s.replace(old, "    safe_to_propose: safeToPropose,");

if (!s.includes('report_consistency: {')) {
  const marker = "    base_mutated: false,\n";
  if (!s.includes(marker)) throw new Error('base_mutated marker not found');
  s = s.replace(marker,
`    report_consistency: {
      search_accepted: searchAccepted,
      meta_accepted: metaAccepted,
      mutation_accepted: mutationAccepted,
      ok: safeToPropose
    },
` + marker);
}

if (!s.includes('report_consistency: report.report_consistency')) {
  const marker = '    search_decision: report.closed_loop_search.decision,\n';
  if (!s.includes(marker)) throw new Error('summary search_decision marker not found');
  s = s.replace(marker, marker + '    report_consistency: report.report_consistency,\n');
}

fs.writeFileSync(path, s);
console.log('report consistency gate applied');
