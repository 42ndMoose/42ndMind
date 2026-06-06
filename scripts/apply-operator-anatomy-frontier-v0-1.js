#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'scripts/run-self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes("const OA = require('../src/operator-anatomy-v0-1.js');")) {
  s = s.replace("const L = require('../src/self-edit-loop-v0-1.js');", "const L = require('../src/self-edit-loop-v0-1.js');\nconst OA = require('../src/operator-anatomy-v0-1.js');");
}

if (!s.includes("'src/operator-anatomy-v0-1.js'")) {
  s = s.replace("'src/self-edit-loop-v0-1.js',", "'src/self-edit-loop-v0-1.js',\n    'src/operator-anatomy-v0-1.js',");
}

if (!s.includes('function operatorAnatomyFrontier(files)')) {
  const marker = 'function generatedClosureFrontier(files) {';
  if (!s.includes(marker)) throw new Error('generatedClosureFrontier marker not found');
  const block = `function operatorAnatomyFrontier(files) {
  if (!OA || typeof OA.frontierNode !== 'function') return [];
  const node = OA.frontierNode(parserSource(files), { file: PARSER_PATH });
  return node ? [node] : [];
}

`;
  s = s.replace(marker, block + marker);
}

const oldActive = `function activeFrontier(files) {
  return BASE_FRONTIER.concat(generatedClosureFrontier(files));
}`;
const newActive = `function activeFrontier(files) {
  const anatomy = operatorAnatomyFrontier(files);
  return BASE_FRONTIER.concat(anatomy.length ? anatomy : generatedClosureFrontier(files));
}`;
if (s.includes(oldActive)) s = s.replace(oldActive, newActive);

if (!s.includes('operator_anatomy_pressure')) {
  const oldReport = "    frontier: goal.frontier,\n    generated_from: goal.generated_from || null,";
  const newReport = "    frontier: goal.frontier,\n    operator_anatomy_pressure: OA && typeof OA.pressure === 'function' ? OA.pressure(parserSource(files), { file: PARSER_PATH }) : null,\n    generated_from: goal.generated_from || null,";
  if (s.includes(oldReport)) s = s.replace(oldReport, newReport);
}

if (!s.includes('operator_anatomy_pressure: reactive.report.operator_anatomy_pressure')) {
  const oldSummary = "    reactive_frontier_generated_count: reactive.summary.frontier_generated_count,\n";
  const newSummary = "    reactive_frontier_generated_count: reactive.summary.frontier_generated_count,\n    operator_anatomy_pressure: reactive.report.operator_anatomy_pressure,\n";
  if (s.includes(oldSummary)) s = s.replace(oldSummary, newSummary);
}

fs.writeFileSync(path, s);
console.log('operator anatomy frontier applied');
