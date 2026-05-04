#!/usr/bin/env node
import { EpistemicAgent } from "./runtime/agent.js";
import { runBuiltInScenarios, runScenariosFromFile } from "./runtime/scenarioRunner.js";

const [command, ...args] = process.argv.slice(2);
const agent = new EpistemicAgent();

if (!command || command === "help") {
  printHelp();
  process.exit(0);
}

if (command === "think") {
  const input = args.join(" ").trim();

  if (!input) {
    console.error("Missing input. Example: npm run think -- \"I never borrowed the money.\"");
    process.exit(1);
  }

  const result = await agent.think(input);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "evidence") {
  const [claimSelector, direction, ...textParts] = args;
  const text = textParts.join(" ").trim();

  if (!claimSelector || !direction || !text) {
    console.error("Missing evidence args. Example: npm run evidence -- latest supports \"There is a bank receipt.\"");
    process.exit(1);
  }

  const result = await agent.addEvidence({
    claimSelector,
    direction,
    text
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}










if (command === "run-scenarios-file") {
  const [scenarioFile, outputRoot] = args;
  const result = await runScenariosFromFile({
    scenarioFile: scenarioFile ?? "data/example_scenarios.json",
    outputRoot: outputRoot ?? "data/custom_scenario_runs.local"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "run-scenarios") {
  const [outputRoot] = args;
  const result = await runBuiltInScenarios({
    outputRoot: outputRoot ?? "data/scenario_runs.local"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}


if (command === "audit") {
  const [reportPath] = args;
  const result = await agent.audit({
    reportPath: reportPath ?? "data/quality_audit.local.json"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "validate-datasets") {
  const [sftPath, preferencePath, reportPath] = args;
  const result = await agent.validateDatasets({
    sftPath: sftPath ?? "data/alignment_sft.local.jsonl",
    preferencePath: preferencePath ?? "data/preference_pairs.local.jsonl",
    reportPath: reportPath ?? "data/dataset_validation_report.local.json"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "export-bundle") {
  const [bundleDir] = args;
  const result = await agent.exportBundle({
    bundleDir: bundleDir ?? "data/42ndAlignment_bundle.local"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "export-preferences") {
  const [outputPath, manifestPath] = args;
  const result = await agent.exportPreferences({
    outputPath: outputPath ?? "data/preference_pairs.local.jsonl",
    manifestPath: manifestPath ?? "data/preference_manifest.local.json"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "export-alignment") {
  const [outputPath, manifestPath] = args;
  const result = await agent.exportAlignment({
    outputPath: outputPath ?? "data/alignment_sft.local.jsonl",
    manifestPath: manifestPath ?? "data/alignment_manifest.local.json"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "export-traces") {
  const [outputPath] = args;
  const result = await agent.exportTraces({
    outputPath: outputPath ?? "data/training_traces.local.jsonl"
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "next") {
  const result = await agent.next();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "answer") {
  const [maybeSelector, ...rest] = args;

  let actionSelector = "latest";
  let answerText = args.join(" ").trim();

  if (maybeSelector && maybeSelector.startsWith("action_")) {
    actionSelector = maybeSelector;
    answerText = rest.join(" ").trim();
  }

  if (!answerText) {
    console.error("Missing answer text. Example: npm run answer -- \"The earlier denial meant I do not currently owe money.\"");
    process.exit(1);
  }

  const result = await agent.answer({
    actionSelector,
    answerText
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "plan") {
  const result = await agent.plan();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "review") {
  const result = await agent.review();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "inspect") {
  const result = await agent.inspect();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command === "reset") {
  const result = await agent.reset();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
printHelp();
process.exit(1);

function printHelp() {
  console.log(`
42ndMind CLI

Commands:
  npm run think -- "claim text"
    Process one input through the epistemic loop.

  npm run evidence -- latest supports "Evidence text"
    Attach evidence to the latest claim.

  npm run evidence -- claim_id weakens "Evidence text"
    Attach evidence to a specific claim.

  npm run plan
    Generate and store the next investigation plan.

  npm run export-traces
    Export full runtime traces from current memory.

  npm run export-alignment
    Export 42ndAlignment-ready SFT JSONL rows.

  npm run export-preferences
    Export synthetic chosen/rejected preference pairs.

  npm run run-scenarios
    Run built-in scenarios and combine exported datasets.

  npm run run-scenarios-file -- data/example_scenarios.json
    Run scenarios from a custom JSON file.

  npm run audit
    Audit current memory quality.

  npm run validate-datasets
    Validate exported SFT and preference JSONL files.

  npm run export-bundle
    Export a 42ndAlignment-ready bundle folder.

  npm run next
    Create the next concrete investigation action from the latest plan.

  npm run answer -- "answer text"
    Answer the latest open investigation action.

  npm run review
    Review contradiction statuses.

  npm run inspect
    Print persistent epistemic memory.

  npm run reset
    Reset persistent epistemic memory.

  npm run demo
    Run the sample contradiction + evidence demo.
`);
}
