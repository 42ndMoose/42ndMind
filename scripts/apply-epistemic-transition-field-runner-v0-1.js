#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'scripts/run-self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes('const epistemicTransition = EO && typeof EO.evaluateTransitionField')) {
  const marker = "  const peakGateOk = !epistemicGate || epistemicGate.ok === true;\n";
  if (!s.includes(marker)) throw new Error('peakGateOk marker not found');
  s = s.replace(marker, marker + "  const epistemicTransition = EO && typeof EO.evaluateTransitionField === 'function' ? EO.evaluateTransitionField({ initial, meta, search, parserPatch, badMutation, goodMutation }) : null;\n  const transitionOk = !epistemicTransition || (epistemicTransition.preference && epistemicTransition.preference.accept === true);\n");
}

const oldSafe = "    safe_to_propose: !!(safeToPropose && peakGateOk),";
if (s.includes(oldSafe)) s = s.replace(oldSafe, "    safe_to_propose: !!(safeToPropose && peakGateOk && transitionOk),");

if (!s.includes('epistemic_transition_field: epistemicTransition')) {
  const marker = "    epistemic_octahedron_gate: epistemicGate,\n";
  if (!s.includes(marker)) throw new Error('epistemic gate marker not found');
  s = s.replace(marker, marker + "    epistemic_transition_field: epistemicTransition,\n");
}

if (!s.includes('transition_ok: transitionOk')) {
  const marker = "      peak_gate_ok: peakGateOk,\n";
  if (!s.includes(marker)) throw new Error('peak_gate_ok marker not found');
  s = s.replace(marker, marker + "      transition_ok: transitionOk,\n");
}

const oldOk = "      ok: !!(safeToPropose && peakGateOk)";
if (s.includes(oldOk)) s = s.replace(oldOk, "      ok: !!(safeToPropose && peakGateOk && transitionOk)");

if (!s.includes('epistemic_transition_field: report.epistemic_transition_field')) {
  const marker = "    epistemic_octahedron_gate: report.epistemic_octahedron_gate,\n";
  if (!s.includes(marker)) throw new Error('summary epistemic gate marker not found');
  s = s.replace(marker, marker + "    epistemic_transition_field: report.epistemic_transition_field,\n");
}

fs.writeFileSync(path, s);
console.log('epistemic transition field runner wiring applied');
