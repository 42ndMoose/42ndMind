import fs from "node:fs/promises";
import path from "node:path";
import { EpistemicAgent } from "./agent.js";
import { nowIso } from "./id.js";
import { auditMemory } from "../cognition/qualityAuditor.js";

export const BUILTIN_SCENARIOS = [
  {
    id: "money_scope_clarification",
    description: "Current debt versus ever having borrowed.",
    firstClaim: "I never borrowed the money.",
    secondClaim: "Actually, I borrowed the money last week but already returned it.",
    evidence: {
      direction: "supports",
      text: "There is a bank transfer receipt showing repayment."
    },
    actionAnswer: "The earlier denial meant I do not currently owe money, not that I had never borrowed it before."
  },
  {
    id: "phone_definition_clarification",
    description: "Stealing versus borrowing/holding and returning.",
    firstClaim: "I never took the phone.",
    secondClaim: "Actually, I took the phone yesterday but already returned it.",
    evidence: {
      direction: "supports",
      text: "There is a video record showing the phone was returned."
    },
    actionAnswer: "The earlier denial meant I did not steal the phone. I only borrowed it and returned it."
  },
  {
    id: "book_memory_error",
    description: "Contradiction explained as forgotten older borrowing.",
    firstClaim: "I never borrowed the book.",
    secondClaim: "Actually, I borrowed the book last month but already returned it.",
    evidence: {
      direction: "supports",
      text: "There is a library record showing the book was checked out and returned."
    },
    actionAnswer: "I honestly forgot because it happened last month. My memory was wrong."
  }
];

export async function runBuiltInScenarios({ outputRoot = "data/scenario_runs.local" } = {}) {
  await fs.mkdir(outputRoot, { recursive: true });

  const results = [];

  for (const scenario of BUILTIN_SCENARIOS) {
    const result = await runScenario({
      scenario,
      outputRoot
    });

    results.push(result);
  }

  const combined = await combineScenarioDatasets({
    outputRoot,
    scenarioResults: results
  });

  const summary = {
    created_at: nowIso(),
    scenario_count: results.length,
    scenarios: results,
    combined
  };

  const summaryPath = path.join(outputRoot, "scenario_summary.json");
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2) + "\n", "utf8");

  return {
    outputRoot,
    summaryPath,
    scenario_count: results.length,
    combined,
    scenarios: results.map((result) => ({
      id: result.id,
      trace_count: result.traceExport.count,
      sft_rows: result.alignmentExport.row_count,
      preference_rows: result.preferenceExport.row_count,
      validation_status: result.validation.status,
      quality_status: result.quality.status,
      quality_score: result.quality.score,
      final_summary: result.finalSummary
    }))
  };
}


export async function runScenariosFromFile({
  scenarioFile = "data/example_scenarios.json",
  outputRoot = "data/custom_scenario_runs.local"
} = {}) {
  const raw = await fs.readFile(scenarioFile, "utf8");
  const parsed = JSON.parse(raw);

  const scenarios = Array.isArray(parsed) ? parsed : parsed.scenarios;

  if (!Array.isArray(scenarios)) {
    throw new Error(`Scenario file ${scenarioFile} must be an array or an object with a scenarios array.`);
  }

  const normalized = scenarios.map(normalizeScenario);
  await fs.mkdir(outputRoot, { recursive: true });

  const results = [];

  for (const scenario of normalized) {
    const result = await runScenario({
      scenario,
      outputRoot
    });

    results.push(result);
  }

  const combined = await combineScenarioDatasets({
    outputRoot,
    scenarioResults: results
  });

  const summary = {
    created_at: nowIso(),
    scenarioFile,
    scenario_count: results.length,
    scenarios: results,
    combined
  };

  const summaryPath = path.join(outputRoot, "scenario_summary.json");
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2) + "\n", "utf8");

  return {
    scenarioFile,
    outputRoot,
    summaryPath,
    scenario_count: results.length,
    combined,
    scenarios: results.map((result) => ({
      id: result.id,
      trace_count: result.traceExport.count,
      sft_rows: result.alignmentExport.row_count,
      preference_rows: result.preferenceExport.row_count,
      validation_status: result.validation.status,
      quality_status: result.quality.status,
      quality_score: result.quality.score,
      final_summary: result.finalSummary
    }))
  };
}

function normalizeScenario(scenario) {
  const required = ["id", "firstClaim", "secondClaim", "evidence", "actionAnswer"];

  for (const key of required) {
    if (!scenario[key]) {
      throw new Error(`Scenario is missing required field: ${key}`);
    }
  }

  if (!scenario.evidence.direction || !scenario.evidence.text) {
    throw new Error(`Scenario "${scenario.id}" evidence must include direction and text.`);
  }

  return {
    id: sanitizeScenarioId(scenario.id),
    description: scenario.description ?? scenario.id,
    firstClaim: scenario.firstClaim,
    secondClaim: scenario.secondClaim,
    evidence: {
      direction: scenario.evidence.direction,
      text: scenario.evidence.text
    },
    actionAnswer: scenario.actionAnswer
  };
}

function sanitizeScenarioId(id) {
  return String(id)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "scenario";
}


export async function runScenario({ scenario, outputRoot }) {
  const scenarioDir = path.join(outputRoot, scenario.id);
  await fs.mkdir(scenarioDir, { recursive: true });

  const agent = new EpistemicAgent({
    memoryPath: path.join(scenarioDir, "memory.json")
  });

  await agent.reset();

  const first = await agent.think(scenario.firstClaim);
  const second = await agent.think(scenario.secondClaim);
  const evidence = await agent.addEvidence({
    claimSelector: "latest",
    direction: scenario.evidence.direction,
    text: scenario.evidence.text
  });
  const review = await agent.review();
  const plan = await agent.plan();
  const next = await agent.next();
  const answer = next.action
    ? await agent.answer({
      actionSelector: "latest",
      answerText: scenario.actionAnswer
    })
    : {
      response: null,
      evidenceLikeItem: null,
      classification: null,
      skipped: true,
      reason: next.reason,
      noActionEvent: next.noActionEvent ?? null
    };

  const traceExport = await agent.exportTraces({
    outputPath: path.join(scenarioDir, "training_traces.jsonl")
  });

  const alignmentExport = await agent.exportAlignment({
    outputPath: path.join(scenarioDir, "alignment_sft.jsonl"),
    manifestPath: path.join(scenarioDir, "alignment_manifest.json")
  });

  const preferenceExport = await agent.exportPreferences({
    outputPath: path.join(scenarioDir, "preference_pairs.jsonl"),
    manifestPath: path.join(scenarioDir, "preference_manifest.json")
  });

  const validation = await agent.validateDatasets({
    sftPath: path.join(scenarioDir, "alignment_sft.jsonl"),
    preferencePath: path.join(scenarioDir, "preference_pairs.jsonl"),
    reportPath: path.join(scenarioDir, "dataset_validation_report.json")
  });

  const inspect = await agent.inspect();
  const quality = await auditMemory({
    memory: inspect.memory,
    reportPath: path.join(scenarioDir, "quality_audit.json")
  });

  return {
    id: scenario.id,
    description: scenario.description,
    scenarioDir,
    first: minimalResult(first),
    second: minimalResult(second),
    evidence: evidence.added,
    review: {
      status: review.summary
    },
    plan: {
      next_best_action: plan.plan.next_best_action
    },
    nextAction: next.action,
    noActionEvent: next.noActionEvent ?? null,
    answer: {
      classification: answer.classification,
      skipped: answer.skipped ?? false,
      reason: answer.reason ?? null
    },
    traceExport,
    alignmentExport,
    preferenceExport,
    validation: {
      status: validation.status,
      summary: validation.summary
    },
    quality: {
      status: quality.quality_status,
      score: quality.quality_score,
      summary: quality.summary
    },
    finalSummary: inspect.summary
  };
}

async function combineScenarioDatasets({ outputRoot, scenarioResults }) {
  const combinedSftPath = path.join(outputRoot, "combined_alignment_sft.jsonl");
  const combinedPreferencePath = path.join(outputRoot, "combined_preference_pairs.jsonl");
  const combinedManifestPath = path.join(outputRoot, "combined_manifest.json");
  const excludedPath = path.join(outputRoot, "excluded_scenarios.json");

  const included = scenarioResults.filter((result) => {
    return result.validation?.status === "pass" && result.quality?.status === "pass";
  });

  const excluded = scenarioResults.filter((result) => !included.includes(result));

  const sftParts = [];
  const preferenceParts = [];

  for (const result of included) {
    sftParts.push(await fs.readFile(result.alignmentExport.outputPath, "utf8"));
    preferenceParts.push(await fs.readFile(result.preferenceExport.outputPath, "utf8"));
  }

  await fs.writeFile(combinedSftPath, joinJsonlParts(sftParts), "utf8");
  await fs.writeFile(combinedPreferencePath, joinJsonlParts(preferenceParts), "utf8");

  const manifest = {
    created_at: nowIso(),
    gating: {
      mode: "validation_and_quality_pass_only",
      required_validation_status: "pass",
      required_quality_status: "pass"
    },
    included_scenarios: included.map((result) => ({
      id: result.id,
      validation_status: result.validation?.status,
      quality_status: result.quality?.status,
      quality_score: result.quality?.score,
      sft_rows: result.alignmentExport.row_count,
      preference_rows: result.preferenceExport.row_count
    })),
    excluded_scenarios: excluded.map((result) => ({
      id: result.id,
      validation_status: result.validation?.status,
      quality_status: result.quality?.status,
      quality_score: result.quality?.score,
      reason: "Scenario failed validation and/or quality gate."
    })),
    row_counts: {
      sft_rows: included.reduce((sum, result) => sum + result.alignmentExport.row_count, 0),
      preference_rows: included.reduce((sum, result) => sum + result.preferenceExport.row_count, 0)
    }
  };

  await fs.writeFile(combinedManifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  await fs.writeFile(excludedPath, JSON.stringify(manifest.excluded_scenarios, null, 2) + "\n", "utf8");

  return {
    combinedSftPath,
    combinedPreferencePath,
    combinedManifestPath,
    excludedPath,
    included_scenarios: included.length,
    excluded_scenarios: excluded.length,
    sft_rows: manifest.row_counts.sft_rows,
    preference_rows: manifest.row_counts.preference_rows
  };
}

function joinJsonlParts(parts) {
  const trimmed = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");

  return trimmed.length ? trimmed + "\n" : "";
}

function minimalResult(result) {
  return {
    input: result.input,
    tensions: result.tensions?.map((item) => ({
      type: item.type,
      status: item.status,
      severity: item.severity
    })) ?? [],
    contradictions: result.contradictions?.map((item) => ({
      type: item.type,
      status: item.status,
      severity: item.severity
    })) ?? [],
    summary: result.summary
  };
}
