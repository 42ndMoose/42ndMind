import fs from "node:fs/promises";
import path from "node:path";
import { makeId, nowIso } from "../runtime/id.js";

export function buildTrainingTraces(memory) {
  const traces = [];

  const contradictionTraces = buildContradictionTraces(memory);
  const motiveTraces = buildMotiveTraces(memory);
  const investigationTraces = buildInvestigationTraces(memory);
  const classificationTraces = buildClassificationTraces(memory);
  const fullTrajectory = buildFullTrajectoryTrace(memory);

  traces.push(...contradictionTraces);
  traces.push(...motiveTraces);
  traces.push(...investigationTraces);
  traces.push(...classificationTraces);

  if (fullTrajectory) traces.push(fullTrajectory);

  return traces;
}

export async function writeTrainingTraces({ memory, outputPath = "data/training_traces.local.jsonl" }) {
  const traces = buildTrainingTraces(memory);
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  const jsonl = traces.map((trace) => JSON.stringify(trace)).join("\n") + (traces.length ? "\n" : "");
  await fs.writeFile(outputPath, jsonl, "utf8");

  return {
    outputPath,
    count: traces.length,
    traces
  };
}

function buildContradictionTraces(memory) {
  return (memory.contradictions ?? []).map((contradiction) => {
    const claimA = memory.claims.find((claim) => claim.id === contradiction.claim_a);
    const claimB = memory.claims.find((claim) => claim.id === contradiction.claim_b);

    return baseTrace({
      traceType: "contradiction_detection",
      instruction: "Detect whether a new claim creates epistemic tension with stored memory.",
      input: {
        prior_claim: simplifyClaim(claimA),
        new_claim: simplifyClaim(claimB)
      },
      target: {
        contradiction_type: contradiction.type,
        status: contradiction.status,
        severity: contradiction.severity,
        reason: contradiction.contradiction_reason,
        correct_behavior: [
          "Do not naively accept the newest claim as settled.",
          "Preserve the contradiction as epistemic pressure.",
          "Generate inquiry pressure until the conflict is explained."
        ]
      }
    });
  });
}

function buildMotiveTraces(memory) {
  const grouped = groupBy(memory.motiveModels ?? [], (motive) => motive.contradiction_id);

  return [...grouped.entries()].map(([contradictionId, motives]) => {
    const contradiction = (memory.contradictions ?? []).find((item) => item.id === contradictionId);

    return baseTrace({
      traceType: "motive_modeling",
      instruction: "Given a contradiction, keep multiple motive/context explanations live without prematurely accusing deception.",
      input: {
        contradiction: simplifyContradiction(contradiction),
        motive_candidates_before_evidence: motives.map(simplifyMotive)
      },
      target: {
        ranked_motives: motives
          .map(simplifyMotive)
          .sort((a, b) => b.confidence - a.confidence),
        correct_behavior: [
          "Treat deception as possible but not proven.",
          "Separate claim truth from motive explanation.",
          "Use evidence to distinguish correction, wording shift, memory error, avoidance, and strategic deception."
        ]
      }
    });
  });
}

function buildInvestigationTraces(memory) {
  return (memory.investigationPlans ?? []).map((plan) => {
    return baseTrace({
      traceType: "investigation_planning",
      instruction: "Turn unresolved epistemic pressure into a concrete next investigative action.",
      input: {
        plan_summary: plan.summary,
        plan_items: plan.plan_items?.map((item) => ({
          plan_type: item.plan_type,
          priority: item.priority,
          focus: item.focus,
          reason: item.reason,
          suggested_actions: item.suggested_actions
        }))
      },
      target: {
        next_best_action: plan.next_best_action,
        correct_behavior: [
          "Choose an action that discriminates between live explanations.",
          "Prefer questions that reduce motive/context uncertainty.",
          "Do not ask generic follow-up questions when a specific discriminator exists."
        ]
      }
    });
  });
}

function buildClassificationTraces(memory) {
  return (memory.actionAnswerClassifications ?? []).map((classification) => {
    const action = (memory.investigationActions ?? []).find((item) => item.id === classification.action_id);
    const evidence = (memory.evidence ?? []).find((item) => item.id === classification.evidence_id);

    return baseTrace({
      traceType: "action_answer_classification",
      instruction: "Classify an answer to an investigation action and apply the correct epistemic update.",
      input: {
        action: simplifyAction(action),
        answer: evidence?.text ?? null
      },
      target: {
        classification_type: classification.classification_type,
        confidence: classification.confidence,
        contradiction_status: classification.contradiction_status,
        effects: classification.effects,
        correct_behavior: [
          "Classify the answer before changing belief state.",
          "Apply different updates to motives, hypotheses, claims, and contradiction status.",
          "Do not treat clarification as proof of innocence or deception; update by scope."
        ]
      }
    });
  });
}

function buildFullTrajectoryTrace(memory) {
  if ((memory.claims ?? []).length < 2) return null;

  const keyBeliefUpdates = (memory.beliefUpdates ?? []).map((update) => ({
    epistemic_delta: update.epistemic_delta,
    reason: update.reason,
    contradiction_status: update.contradiction_status ?? null
  }));

  return baseTrace({
    traceType: "full_epistemic_trajectory",
    instruction: "Run the full epistemic loop from claim intake through contradiction detection, evidence, motive modeling, planning, and action-answer classification.",
    input: {
      claims: (memory.claims ?? []).map(simplifyClaim),
      evidence: (memory.evidence ?? []).map(simplifyEvidence)
    },
    target: {
      final_summary: {
        claims: memory.claims?.length ?? 0,
        contradictions: memory.contradictions?.length ?? 0,
        motives: memory.motiveModels?.length ?? 0,
        investigation_plans: memory.investigationPlans?.length ?? 0,
        investigation_actions: memory.investigationActions?.length ?? 0,
        action_answer_classifications: memory.actionAnswerClassifications?.length ?? 0
      },
      epistemic_deltas: keyBeliefUpdates,
      correct_behavior: [
        "Store claims as unresolved before treating them as settled.",
        "Detect contradiction across memory.",
        "Generate live hypotheses and motive/context models.",
        "Use evidence to update claims and explanation confidence differently.",
        "Create an investigation plan when motive/context remains unclear.",
        "Classify action answers and revise state."
      ]
    }
  });
}

function baseTrace({ traceType, instruction, input, target }) {
  return {
    id: makeId("trace"),
    version: "1.0.0",
    trace_type: traceType,
    created_at: nowIso(),
    instruction,
    input,
    target,
    sft_format: {
      messages: [
        {
          role: "system",
          content: "You are an epistemic runtime trained to reduce naive acceptance, preserve live hypotheses, detect contradiction, and update belief state from evidence."
        },
        {
          role: "user",
          content: JSON.stringify(input, null, 2)
        },
        {
          role: "assistant",
          content: JSON.stringify(target, null, 2)
        }
      ]
    }
  };
}

function simplifyClaim(claim) {
  if (!claim) return null;
  return {
    id: claim.id,
    text: claim.text,
    subject: claim.subject,
    action: claim.action,
    object: claim.object,
    time: claim.time,
    polarity: claim.polarity,
    scope: claim.scope,
    confidence: claim.confidence,
    status: claim.status
  };
}

function simplifyContradiction(contradiction) {
  if (!contradiction) return null;
  return {
    id: contradiction.id,
    type: contradiction.type,
    status: contradiction.status,
    severity: contradiction.severity,
    reason: contradiction.contradiction_reason
  };
}

function simplifyMotive(motive) {
  return {
    id: motive.id,
    motive_type: motive.motive_type,
    confidence: motive.confidence,
    status: motive.status,
    signals: motive.signals ?? []
  };
}

function simplifyAction(action) {
  if (!action) return null;
  return {
    id: action.id,
    action_type: action.action_type,
    prompt: action.prompt,
    reason: action.reason,
    expected_answer_kind: action.expected_answer_kind
  };
}

function simplifyEvidence(evidence) {
  return {
    id: evidence.id,
    direction: evidence.direction,
    text: evidence.text,
    strength: evidence.strength,
    source: evidence.source,
    related_action: evidence.related_action ?? null,
    related_contradiction: evidence.related_contradiction ?? null
  };
}

function groupBy(items, keyFn) {
  const map = new Map();

  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }

  return map;
}
