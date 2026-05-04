import fs from "node:fs/promises";
import path from "node:path";
import { nowIso } from "../runtime/id.js";

export async function auditMemory({
  memory,
  reportPath = null
} = {}) {
  const checks = [];

  checks.push(check({
    id: "no_open_inquiry_tasks",
    pass: (memory.inquiryTasks ?? []).filter((task) => task.status === "open").length === 0,
    severity: "high",
    detail: "No inquiry tasks should remain open after a fully resolved scenario."
  }));

  checks.push(check({
    id: "no_open_investigation_actions",
    pass: (memory.investigationActions ?? []).filter((action) => action.status === "open").length === 0,
    severity: "high",
    detail: "No investigation actions should remain open after action-answer intake."
  }));

  checks.push(check({
    id: "has_action_answer_classification",
    pass: (memory.actionAnswerClassifications ?? []).length > 0,
    severity: "high",
    detail: "At least one action answer classification should exist in a full scenario."
  }));

  checks.push(check({
    id: "has_training_ready_state",
    pass:
      (memory.claims ?? []).length >= 2 &&
      (memory.contradictions ?? []).length >= 1 &&
      (memory.motiveModels ?? []).length >= 1 &&
      (memory.investigationPlans ?? []).length >= 1,
    severity: "medium",
    detail: "Scenario should contain enough structure to produce useful training traces."
  }));

  checks.push(check({
    id: "contradictions_not_unresolved",
    pass: (memory.contradictions ?? []).every((contradiction) => !["unresolved", "evidence_weighted_unresolved"].includes(contradiction.status)),
    severity: "high",
    detail: "Contradictions should not remain unresolved after classification in a completed scenario."
  }));

  checks.push(check({
    id: "belief_updates_recorded",
    pass: (memory.beliefUpdates ?? []).length >= 5,
    severity: "medium",
    detail: "Scenario should record a meaningful belief-update trail."
  }));

  const highFailures = checks.filter((item) => !item.pass && item.severity === "high");
  const mediumFailures = checks.filter((item) => !item.pass && item.severity === "medium");

  const report = {
    created_at: nowIso(),
    quality_status: highFailures.length === 0 ? "pass" : "fail",
    quality_score: scoreChecks(checks),
    checks,
    summary: {
      total_checks: checks.length,
      passed: checks.filter((item) => item.pass).length,
      failed: checks.filter((item) => !item.pass).length,
      high_failures: highFailures.length,
      medium_failures: mediumFailures.length
    }
  };

  if (reportPath) {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  }

  return report;
}

function check({ id, pass, severity, detail }) {
  return {
    id,
    pass: Boolean(pass),
    severity,
    detail
  };
}

function scoreChecks(checks) {
  const weights = {
    high: 2,
    medium: 1,
    low: 0.5
  };

  const total = checks.reduce((sum, item) => sum + (weights[item.severity] ?? 1), 0);
  const passed = checks.reduce((sum, item) => {
    return sum + (item.pass ? (weights[item.severity] ?? 1) : 0);
  }, 0);

  return Number((passed / total).toFixed(3));
}
