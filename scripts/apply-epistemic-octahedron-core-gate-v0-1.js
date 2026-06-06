#!/usr/bin/env node
'use strict';

const fs = require('fs');

const path = 'scripts/run-self-edit-loop-v0-1.js';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes("const EO = require('../src/epistemic-octahedron-core-v0-1.js');")) {
  s = s.replace("const OA = require('../src/operator-anatomy-v0-1.js');", "const OA = require('../src/operator-anatomy-v0-1.js');\nconst EO = require('../src/epistemic-octahedron-core-v0-1.js');");
}

if (!s.includes("'src/epistemic-octahedron-core-v0-1.js'")) {
  s = s.replace("'src/operator-anatomy-v0-1.js',", "'src/operator-anatomy-v0-1.js',\n    'src/epistemic-octahedron-core-v0-1.js',");
}

if (!s.includes('const epistemicGate = EO && typeof EO.evaluateReactiveGate')) {
  const marker = "  const safeToPropose = !!(searchAccepted && metaAccepted && mutationAccepted);\n";
  if (!s.includes(marker)) throw new Error('safeToPropose marker not found');
  s = s.replace(marker, marker + "  const epistemicGate = EO && typeof EO.evaluateReactiveGate === 'function' ? EO.evaluateReactiveGate({ initial, meta, search, parserPatch, badMutation, goodMutation }) : null;\n  const peakGateOk = !epistemicGate || epistemicGate.ok === true;\n");
}

const oldSafe = "    safe_to_propose: safeToPropose,";
if (s.includes(oldSafe)) s = s.replace(oldSafe, "    safe_to_propose: !!(safeToPropose && peakGateOk),");

if (!s.includes('epistemic_octahedron_gate: epistemicGate')) {
  const marker = "    report_consistency: {\n";
  if (!s.includes(marker)) throw new Error('report_consistency marker not found');
  s = s.replace(marker, "    epistemic_octahedron_gate: epistemicGate,\n" + marker);
}

if (!s.includes('peak_gate_ok: peakGateOk')) {
  const marker = "      ok: safeToPropose\n";
  if (!s.includes(marker)) throw new Error('report consistency ok marker not found');
  s = s.replace(marker, "      peak_gate_ok: peakGateOk,\n      ok: !!(safeToPropose && peakGateOk)\n");
}

if (!s.includes('epistemic_octahedron_gate: report.epistemic_octahedron_gate')) {
  const marker = "    report_consistency: report.report_consistency,\n";
  if (!s.includes(marker)) throw new Error('summary report consistency marker not found');
  s = s.replace(marker, marker + "    epistemic_octahedron_gate: report.epistemic_octahedron_gate,\n");
}

if (!s.includes('epistemic_octahedron_core: EO && typeof EO.governanceSummary')) {
  const marker = "    operator_anatomy_pressure: reactive.report.operator_anatomy_pressure,\n";
  if (s.includes(marker)) {
    s = s.replace(marker, marker + "    epistemic_octahedron_core: EO && typeof EO.governanceSummary === 'function' ? EO.governanceSummary() : null,\n");
  }
}

fs.writeFileSync(path, s);
console.log('epistemic octahedron core gate applied');
