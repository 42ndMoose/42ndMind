import { makeId, nowIso } from "../runtime/id.js";
import { classifyAndApplyActionAnswer } from "./actionAnswerClassifier.js";

export function createNextInvestigationAction(memory) {
  const plan = getLatestActivePlan(memory);

  if (!plan?.next_best_action) {
    return {
      memory,
      action: null,
      reason: "No active investigation plan with a next best action."
    };
  }

  const planItem = plan.next_best_action;
  const selected = selectBestSuggestedAction(planItem);

  const action = {
    id: makeId("action"),
    status: "open",
    action_type: selected.action_type,
    prompt: selected.prompt,
    source_plan: plan.id,
    source_plan_item: planItem.id,
    related_contradiction: planItem.related_contradiction ?? null,
    reason: planItem.reason,
    expected_answer_kind: inferExpectedAnswerKind(selected.action_type),
    created_at: nowIso()
  };

  const nextMemory = {
    ...memory,
    investigationActions: [...(memory.investigationActions ?? []), action],
    beliefUpdates: [
      ...memory.beliefUpdates,
      {
        id: makeId("update"),
        before: "Investigation plan existed but had not been converted into an executable action.",
        after: "Next investigation action was created.",
        reason: action.reason,
        epistemic_delta: "investigation_action_created",
        action_id: action.id,
        created_at: nowIso()
      }
    ]
  };

  return {
    memory: nextMemory,
    action,
    reason: "Created next investigation action from latest active plan."
  };
}

export function answerInvestigationAction({ memory, actionSelector, answerText }) {
  const action = selectAction(memory, actionSelector);

  if (!action) {
    throw new Error(`No investigation action found for selector "${actionSelector}". Use "latest" or a specific action id.`);
  }

  const response = {
    id: makeId("action_response"),
    action_id: action.id,
    text: answerText,
    source: "user",
    created_at: nowIso()
  };

  const evidenceLikeItem = convertAnswerToEvidenceLikeItem({ action, response });

  const investigationActions = memory.investigationActions.map((item) => {
    if (item.id !== action.id) return item;

    return {
      ...item,
      status: "answered",
      response_id: response.id,
      response_text: response.text,
      answered_at: nowIso()
    };
  });

  const beliefUpdate = {
    id: makeId("update"),
    before: "Investigation action was open.",
    after: "Investigation action received an answer and was stored for later extraction/revision.",
    reason: action.prompt,
    epistemic_delta: "investigation_action_answered",
    action_id: action.id,
    response_id: response.id,
    created_at: nowIso()
  };

  const memoryWithAnswer = {
    ...memory,
    investigationActions,
    evidence: [...memory.evidence, evidenceLikeItem],
    beliefUpdates: [...memory.beliefUpdates, beliefUpdate]
  };

  const classifiedMemory = classifyAndApplyActionAnswer({
    memory: memoryWithAnswer,
    action,
    response,
    evidenceLikeItem
  });

  const classification = classifiedMemory.actionAnswerClassifications.at(-1) ?? null;

  return {
    memory: classifiedMemory,
    response,
    evidenceLikeItem,
    classification
  };
}

function getLatestActivePlan(memory) {
  return [...(memory.investigationPlans ?? [])]
    .reverse()
    .find((plan) => plan.status === "active") ?? null;
}

function selectBestSuggestedAction(planItem) {
  const suggested = planItem.suggested_actions ?? [];

  const preferredOrder = [
    "ask_for_discriminating_evidence",
    "ask_user_for_timeline",
    "ask_user_for_context",
    "ask_for_scope",
    "ask_for_wording",
    "ask_for_repair_evidence"
  ];

  for (const preferred of preferredOrder) {
    const found = suggested.find((item) => item.action_type === preferred);
    if (found) return found;
  }

  return suggested[0] ?? {
    action_type: "ask_user_for_context",
    prompt: "What missing context would best reduce uncertainty here?"
  };
}

function inferExpectedAnswerKind(actionType) {
  if (actionType.includes("timeline")) return "timeline";
  if (actionType.includes("evidence")) return "evidence_or_discriminator";
  if (actionType.includes("scope")) return "scope_clarification";
  if (actionType.includes("wording")) return "wording_clarification";
  return "context_clarification";
}

function selectAction(memory, selector) {
  if (selector === "latest") {
    return [...(memory.investigationActions ?? [])]
      .reverse()
      .find((action) => action.status === "open") ?? null;
  }

  return (memory.investigationActions ?? []).find((action) => action.id === selector) ?? null;
}

function convertAnswerToEvidenceLikeItem({ action, response }) {
  return {
    id: makeId("evidence"),
    claim_id: null,
    direction: "contextual",
    text: response.text,
    strength: 0.12,
    source: "user_action_response",
    related_action: action.id,
    related_contradiction: action.related_contradiction,
    note: "This is stored as evidence-like context. A later LLM extractor should classify its effect.",
    created_at: nowIso()
  };
}
