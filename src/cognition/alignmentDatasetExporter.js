import fs from "node:fs/promises";
import path from "node:path";
import { buildTrainingTraces } from "./trainingTraceExporter.js";
import { nowIso } from "../runtime/id.js";

export async function writeAlignmentDataset({
  memory,
  outputPath = "data/alignment_sft.local.jsonl",
  manifestPath = "data/alignment_manifest.local.json"
} = {}) {
  const traces = buildTrainingTraces(memory);

  const rows = traces.map((trace) => {
    return {
      messages: trace.sft_format.messages,
      metadata: {
        trace_id: trace.id,
        trace_type: trace.trace_type,
        trace_version: trace.version,
        created_at: trace.created_at,
        source: "42ndMind",
        intended_repo: "42ndAlignment",
        target_use: "SFT"
      }
    };
  });

  const manifest = {
    created_at: nowIso(),
    source: "42ndMind",
    intended_repo: "42ndAlignment",
    target_use: "SFT",
    outputPath,
    row_count: rows.length,
    trace_types: countTraceTypes(traces),
    notes: [
      "This export contains chat-style SFT rows.",
      "Each row has messages plus metadata.",
      "This is not DPO data yet because no rejected/comparison answers are included.",
      "Use this to train imitation of the epistemic runtime process."
    ]
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });

  const jsonl = rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : "");
  await fs.writeFile(outputPath, jsonl, "utf8");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  return {
    outputPath,
    manifestPath,
    row_count: rows.length,
    trace_types: manifest.trace_types
  };
}

function countTraceTypes(traces) {
  const counts = {};

  for (const trace of traces) {
    counts[trace.trace_type] = (counts[trace.trace_type] ?? 0) + 1;
  }

  return counts;
}
