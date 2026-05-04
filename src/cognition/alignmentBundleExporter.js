import fs from "node:fs/promises";
import path from "node:path";
import { writeAlignmentDataset } from "./alignmentDatasetExporter.js";
import { writePreferenceDataset } from "./preferenceDatasetExporter.js";
import { validateDatasets } from "./datasetValidator.js";
import { nowIso } from "../runtime/id.js";

export async function writeAlignmentBundle({
  memory,
  bundleDir = "data/42ndAlignment_bundle.local"
} = {}) {
  await fs.mkdir(bundleDir, { recursive: true });

  const sftPath = path.join(bundleDir, "alignment_sft.jsonl");
  const sftManifestPath = path.join(bundleDir, "alignment_manifest.json");
  const preferencePath = path.join(bundleDir, "preference_pairs.jsonl");
  const preferenceManifestPath = path.join(bundleDir, "preference_manifest.json");
  const validationReportPath = path.join(bundleDir, "dataset_validation_report.json");
  const readmePath = path.join(bundleDir, "README.md");

  const sft = await writeAlignmentDataset({
    memory,
    outputPath: sftPath,
    manifestPath: sftManifestPath
  });

  const preferences = await writePreferenceDataset({
    memory,
    outputPath: preferencePath,
    manifestPath: preferenceManifestPath
  });

  const validation = await validateDatasets({
    sftPath,
    preferencePath,
    reportPath: validationReportPath
  });

  const readme = buildBundleReadme({
    createdAt: nowIso(),
    sft,
    preferences,
    validation
  });

  await fs.writeFile(readmePath, readme, "utf8");

  return {
    bundleDir,
    files: {
      sft: sftPath,
      sftManifest: sftManifestPath,
      preferences: preferencePath,
      preferenceManifest: preferenceManifestPath,
      validationReport: validationReportPath,
      readme: readmePath
    },
    sft,
    preferences,
    validation: {
      status: validation.status,
      total_errors: validation.summary.total_errors,
      total_warnings: validation.summary.total_warnings
    }
  };
}

function buildBundleReadme({ createdAt, sft, preferences, validation }) {
  return `# 42ndAlignment Bundle

Created: ${createdAt}

This bundle was exported from 42ndMind.

## Files

- alignment_sft.jsonl
- alignment_manifest.json
- preference_pairs.jsonl
- preference_manifest.json
- dataset_validation_report.json

## SFT rows

${sft.row_count}

## Preference rows

${preferences.row_count}

## Validation

Status: ${validation.status}

Errors: ${validation.summary.total_errors}
Warnings: ${validation.summary.total_warnings}

## Intended use

Copy this folder into the 42ndAlignment repo when preparing a future SFT or preference-training run.

The SFT file is the safer first target.

The preference file contains synthetic rejected answers and should be reviewed before serious DPO/ORPO/GRPO work.
`;
}
