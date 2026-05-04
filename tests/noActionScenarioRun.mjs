import fs from "node:fs/promises";
import { runScenariosFromFile } from "../src/runtime/scenarioRunner.js";

const scenarioFile = "data/no_action_test_scenarios.local.json";
const outputRoot = "data/no_action_test_runs.local";

await fs.rm(outputRoot, { recursive: true, force: true });

const scenarios = {
  scenarios: [
    {
      id: "no_action_partial_truth_money",
      description: "Scenario likely to create no investigation action under the v1.8 rule-based runtime.",
      firstClaim: "I paid back the money.",
      secondClaim: "I paid back half, and I will pay the rest Friday.",
      evidence: {
        direction: "supports",
        text: "A receipt confirms only half of the amount was repaid."
      },
      actionAnswer: "My first statement was too broad. I paid back part of it, but not the full amount yet."
    },
    {
      id: "normal_memory_error_keys",
      description: "Scenario expected to create an investigation action and pass the regular path.",
      firstClaim: "I never took the keys.",
      secondClaim: "Actually, I took the keys yesterday but already returned them.",
      evidence: {
        direction: "supports",
        text: "There is a message confirming the keys were returned yesterday evening."
      },
      actionAnswer: "I honestly forgot because it happened quickly yesterday. My earlier denial was a memory error, not an attempt to deceive."
    }
  ]
};

await fs.writeFile(scenarioFile, JSON.stringify(scenarios, null, 2) + "\n", "utf8");

const result = await runScenariosFromFile({ scenarioFile, outputRoot });

if (result.scenario_count !== 2) {
  throw new Error(`Expected 2 scenarios, got ${result.scenario_count}`);
}

await fs.access(`${outputRoot}/combined_alignment_sft.jsonl`);
await fs.access(`${outputRoot}/combined_preference_pairs.jsonl`);
await fs.access(`${outputRoot}/combined_manifest.json`);
await fs.access(`${outputRoot}/excluded_scenarios.json`);
await fs.access(`${outputRoot}/scenario_summary.json`);

const noActionScenario = result.scenarios.find((scenario) => scenario.id === "no_action_partial_truth_money");

if (!noActionScenario) {
  throw new Error("No-action scenario result missing.");
}

if ((noActionScenario.final_summary?.noActionEvents ?? 0) < 1) {
  throw new Error("Expected no-action scenario to record at least one noActionEvent.");
}

console.log(JSON.stringify({
  status: "pass",
  scenario_count: result.scenario_count,
  combined: result.combined,
  noActionEvents: noActionScenario.final_summary.noActionEvents
}, null, 2));
