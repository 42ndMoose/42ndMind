import fs from "node:fs/promises";
import path from "node:path";
import { nowIso } from "../runtime/id.js";

export async function validateDatasets({
  sftPath = "data/alignment_sft.local.jsonl",
  preferencePath = "data/preference_pairs.local.jsonl",
  reportPath = "data/dataset_validation_report.local.json"
} = {}) {
  const sft = await validateSftJsonl(sftPath);
  const preference = await validatePreferenceJsonl(preferencePath);

  const report = {
    created_at: nowIso(),
    status: sft.valid && preference.valid ? "pass" : "fail",
    files: {
      sft,
      preference
    },
    summary: {
      sft_rows: sft.row_count,
      preference_rows: preference.row_count,
      total_errors: sft.errors.length + preference.errors.length,
      total_warnings: sft.warnings.length + preference.warnings.length
    }
  };

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");

  return report;
}

async function validateSftJsonl(filePath) {
  const rows = await readJsonl(filePath);
  const errors = [];
  const warnings = [];

  rows.items.forEach((row, index) => {
    const label = `${filePath}:${index + 1}`;

    if (!Array.isArray(row.messages)) {
      errors.push(`${label} missing messages array.`);
      return;
    }

    if (row.messages.length < 3) {
      errors.push(`${label} should have at least system, user, assistant messages.`);
    }

    const roles = row.messages.map((message) => message.role);
    if (!roles.includes("system")) warnings.push(`${label} has no system message.`);
    if (!roles.includes("user")) errors.push(`${label} has no user message.`);
    if (!roles.includes("assistant")) errors.push(`${label} has no assistant message.`);

    for (const message of row.messages) {
      if (typeof message.content !== "string" || message.content.trim().length === 0) {
        errors.push(`${label} has empty message content.`);
      }
    }

    if (!row.metadata?.trace_type) {
      warnings.push(`${label} missing metadata.trace_type.`);
    }
  });

  return {
    path: filePath,
    exists: rows.exists,
    valid: rows.exists && errors.length === 0,
    row_count: rows.items.length,
    errors: rows.errors.concat(errors),
    warnings
  };
}

async function validatePreferenceJsonl(filePath) {
  const rows = await readJsonl(filePath);
  const errors = [];
  const warnings = [];

  rows.items.forEach((row, index) => {
    const label = `${filePath}:${index + 1}`;

    if (!Array.isArray(row.prompt)) {
      errors.push(`${label} missing prompt array.`);
    }

    if (typeof row.chosen !== "string" || row.chosen.trim().length === 0) {
      errors.push(`${label} missing chosen string.`);
    }

    if (!row.rejected || typeof row.rejected.content !== "string" || row.rejected.content.trim().length === 0) {
      errors.push(`${label} missing rejected.content string.`);
    }

    if (!row.rejected?.reason) {
      warnings.push(`${label} missing rejected.reason.`);
    }

    if (!row.metadata?.trace_type) {
      warnings.push(`${label} missing metadata.trace_type.`);
    }
  });

  return {
    path: filePath,
    exists: rows.exists,
    valid: rows.exists && errors.length === 0,
    row_count: rows.items.length,
    errors: rows.errors.concat(errors),
    warnings
  };
}

async function readJsonl(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const items = [];
    const errors = [];

    lines.forEach((line, index) => {
      try {
        items.push(JSON.parse(line));
      } catch (error) {
        errors.push(`${filePath}:${index + 1} invalid JSON: ${error.message}`);
      }
    });

    return {
      exists: true,
      items,
      errors
    };
  } catch (error) {
    return {
      exists: false,
      items: [],
      errors: [`${filePath} could not be read: ${error.message}`]
    };
  }
}
