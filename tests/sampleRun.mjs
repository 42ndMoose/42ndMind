
import { EpistemicAgent } from "../src/runtime/agent.js";

const agent = new EpistemicAgent({
  memoryPath: "data/demo_memory.local.json"
});

await agent.reset();

const first = await agent.think("I never borrowed the money.");
const second = await agent.think("Actually, I borrowed the money last week but already returned it.");
const evidence = await agent.addEvidence({
  claimSelector: "latest",
  direction: "supports",
  text: "There is a bank transfer receipt showing repayment."
});
const review = await agent.review();
const plan = await agent.plan();
const nextAction = await agent.next();
const answer = await agent.answer({
  actionSelector: "latest",
  answerText: "The earlier denial meant I do not currently owe money, not that I had never borrowed it before."
});
const traceExport = await agent.exportTraces({ outputPath: "data/demo_training_traces.local.jsonl" });
const alignmentExport = await agent.exportAlignment({
  outputPath: "data/demo_alignment_sft.local.jsonl",
  manifestPath: "data/demo_alignment_manifest.local.json"
});
const preferenceExport = await agent.exportPreferences({
  outputPath: "data/demo_preference_pairs.local.jsonl",
  manifestPath: "data/demo_preference_manifest.local.json"
});
const audit = await agent.audit({ reportPath: "data/demo_quality_audit.local.json" });
const validation = await agent.validateDatasets({
  sftPath: "data/demo_alignment_sft.local.jsonl",
  preferencePath: "data/demo_preference_pairs.local.jsonl",
  reportPath: "data/demo_dataset_validation_report.local.json"
});
const bundle = await agent.exportBundle({ bundleDir: "data/demo_42ndAlignment_bundle.local" });
const memory = await agent.inspect();

console.log("=== FIRST RESULT ===");
console.log(JSON.stringify(first, null, 2));

console.log("\n=== SECOND RESULT ===");
console.log(JSON.stringify(second, null, 2));

console.log("\n=== EVIDENCE RESULT ===");
console.log(JSON.stringify(evidence, null, 2));

console.log("\n=== REVIEW RESULT ===");
console.log(JSON.stringify(review, null, 2));

console.log("\n=== INVESTIGATION PLAN ===");
console.log(JSON.stringify(plan, null, 2));

console.log("\n=== NEXT ACTION ===");
console.log(JSON.stringify(nextAction, null, 2));

console.log("\n=== ACTION ANSWER ===");
console.log(JSON.stringify(answer, null, 2));

console.log("\n=== TRAINING TRACE EXPORT ===");
console.log(JSON.stringify(traceExport, null, 2));

console.log("\n=== ALIGNMENT DATASET EXPORT ===");
console.log(JSON.stringify(alignmentExport, null, 2));

console.log("\n=== PREFERENCE DATASET EXPORT ===");
console.log(JSON.stringify(preferenceExport, null, 2));

console.log("\n=== QUALITY AUDIT ===");
console.log(JSON.stringify(audit, null, 2));

console.log("\n=== DATASET VALIDATION ===");
console.log(JSON.stringify(validation, null, 2));

console.log("\n=== ALIGNMENT BUNDLE EXPORT ===");
console.log(JSON.stringify(bundle, null, 2));

console.log("\n=== FINAL MEMORY ===");
console.log(JSON.stringify(memory, null, 2));
