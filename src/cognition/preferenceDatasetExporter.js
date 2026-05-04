import fs from "node:fs/promises";
import path from "node:path";
import { buildTrainingTraces } from "./trainingTraceExporter.js";
import { nowIso } from "../runtime/id.js";

export async function writePreferenceDataset({
  memory,
  outputPath = "data/preference_pairs.local.jsonl",
  manifestPath = "data/preference_manifest.local.json"
} = {}) {
  const traces = buildTrainingTraces(memory);

  const rows = traces.map((trace) => {
    const promptMessages = trace.sft_format.messages.slice(0, -1);
    const chosen = trace.sft_format.messages.at(-1)?.content ?? JSON.stringify(trace.target, null, 2);
    const rejected = buildRejectedAnswer(trace);

    return {
      prompt: promptMessages,
      chosen,
      rejected,
      metadata: {
        trace_id: trace.id,
        trace_type: trace.trace_type,
        trace_version: trace.version,
        created_at: trace.created_at,
        source: "42ndMind",
        intended_repo: "42ndAlignment",
        target_use: "DPO_ORPO_OR_GRPO_seed",
        rejected_reason: rejected.reason
      }
    };
  });

  const manifest = {
    created_at: nowIso(),
    source: "42ndMind",
    intended_repo: "42ndAlignment",
    target_use: "DPO_ORPO_OR_GRPO_seed",
    outputPath,
    row_count: rows.length,
    trace_types: countTraceTypes(traces),
    warning: "Rejected answers are synthetic failure cases. Review before serious preference training.",
    notes: [
      "This export is not required for SFT.",
      "It gives future DPO/ORPO/GRPO work a starting pair format.",
      "Each row contains prompt, chosen, rejected, and metadata.",
      "The rejected side is generated from known epistemic failure modes."
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

function buildRejectedAnswer(trace) {
  const payloadByType = {
    contradiction_detection: {
      reason: "Naively accepts the latest claim and fails to preserve contradiction.",
      content: {
        status: "accepted_as_settled",
        conclusion: "The newest claim should be treated as true because it was stated most recently.",
        errors: [
          "ignored prior memory",
          "collapsed contradiction",
          "failed to create inquiry pressure",
          "overtrusted user statement"
        ]
      }
    },
    motive_modeling: {
      reason: "Jumps to a single motive explanation without evidence.",
      content: {
        conclusion: "The person was definitely lying.",
        errors: [
          "premature accusation",
          "collapsed live hypotheses",
          "confused contradiction with proven motive",
          "failed to model correction, memory error, or wording shift"
        ]
      }
    },
    investigation_planning: {
      reason: "Asks a vague follow-up instead of a discriminating question.",
      content: {
        next_action: "Ask the user to explain more.",
        errors: [
          "generic follow-up",
          "does not distinguish competing motives",
          "does not reduce epistemic uncertainty efficiently"
        ]
      }
    },
    action_answer_classification: {
      reason: "Stores the answer but fails to classify and update state.",
      content: {
        classification_type: "unprocessed_answer",
        action: "Store answer only.",
        errors: [
          "failed to classify scope clarification",
          "failed to update motive confidence",
          "failed to change contradiction status"
        ]
      }
    },
    full_epistemic_trajectory: {
      reason: "Treats the whole interaction as a simple answer instead of a stateful epistemic trajectory.",
      content: {
        conclusion: "The user corrected themselves, so the matter is resolved.",
        errors: [
          "no memory state",
          "no contradiction tracking",
          "no motive/context modeling",
          "no investigation plan",
          "no action-answer classification"
        ]
      }
    }
  };

  const rejected = payloadByType[trace.trace_type] ?? {
    reason: "Generic epistemic failure.",
    content: {
      conclusion: "Accept the input and answer normally.",
      errors: ["naive acceptance"]
    }
  };

  return {
    content: JSON.stringify(rejected.content, null, 2),
    reason: rejected.reason
  };
}

function countTraceTypes(traces) {
  const counts = {};

  for (const trace of traces) {
    counts[trace.trace_type] = (counts[trace.trace_type] ?? 0) + 1;
  }

  return counts;
}
