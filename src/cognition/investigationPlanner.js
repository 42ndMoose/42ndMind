import { makeId, nowIso } from "../runtime/id.js";

export function buildInvestigationPlan(memory) {
  const activeContradictions = memory.contradictions.filter((contradiction) => {
    return ["unresolved", "evidence_weighted_unresolved", "resolved_evidence_weighted"].includes(contradiction.status);
  });

  const motiveClusters = activeContradictions
    .map((contradiction) => {
      const motives = memory.motiveModels
        .filter((motive) => motive.contradiction_id === contradiction.id)
        .sort((a, b) => b.confidence - a.confidence);

      if (motives.length === 0) return null;

      const top = motives[0];
      const runnerUp = motives[1] ?? null;
      const separation = runnerUp ? Number((top.confidence - runnerUp.confidence).toFixed(2)) : top.confidence;

      return { contradiction, motives, top, runnerUp, separation };
    })
    .filter(Boolean);

  const planItems = [];

  for (const cluster of motiveClusters) {
    if (cluster.separation < 0.2) planItems.push(createMotiveDiscriminationPlan(cluster));
    if (cluster.top.motive_type === "strategic_deception" && cluster.top.confidence >= 0.45) planItems.push(createDeceptionAuditPlan(cluster));
    if (cluster.top.motive_type === "correction_or_clarification") planItems.push(createCorrectionVerificationPlan(cluster));
  }

  const unresolvedTasks = memory.inquiryTasks.filter((task) => task.status === "open");

  for (const task of unresolvedTasks) {
    planItems.push({
      id: makeId("plan_item"),
      plan_type: "open_inquiry_task",
      priority: task.priority ?? 0.5,
      focus: task.question,
      reason: task.reason,
      related_task: task.id,
      suggested_actions: [
        { action_type: "ask_user_for_evidence", prompt: task.question },
        { action_type: "request_timeline", prompt: "Ask for a concrete sequence of events, including dates, wording, and evidence." }
      ]
    });
  }

  const sortedItems = planItems.sort((a, b) => b.priority - a.priority);

  return {
    id: makeId("plan"),
    status: sortedItems.length > 0 ? "active" : "no_active_investigation_needed",
    created_at: nowIso(),
    summary: sortedItems.length > 0 ? "Investigation plan generated from unresolved epistemic pressure." : "No active investigation pressure detected.",
    plan_items: sortedItems,
    next_best_action: sortedItems[0] ?? null
  };
}

function createMotiveDiscriminationPlan(cluster) {
  return {
    id: makeId("plan_item"),
    plan_type: "motive_discrimination",
    priority: 0.86,
    focus: "Distinguish between competing motive/context explanations.",
    reason: `Top motive "${cluster.top.motive_type}" is not strongly separated from runner-up "${cluster.runnerUp?.motive_type ?? "none"}".`,
    related_contradiction: cluster.contradiction.id,
    motive_candidates: cluster.motives.map((motive) => ({
      motive_id: motive.id,
      motive_type: motive.motive_type,
      confidence: motive.confidence,
      status: motive.status
    })),
    suggested_actions: [
      { action_type: "ask_user_for_context", prompt: "What was the exact reason the earlier statement was phrased as an absolute denial?" },
      { action_type: "ask_user_for_timeline", prompt: "What happened first, what was said next, and when did the correction happen?" },
      { action_type: "ask_for_discriminating_evidence", prompt: "What evidence would separate correction, memory error, wording shift, and deliberate deception?" }
    ]
  };
}

function createDeceptionAuditPlan(cluster) {
  return {
    id: makeId("plan_item"),
    plan_type: "deception_audit",
    priority: 0.92,
    focus: "Audit possible strategic deception without premature accusation.",
    reason: "Strategic deception has become a high-confidence motive candidate.",
    related_contradiction: cluster.contradiction.id,
    suggested_actions: [
      { action_type: "check_incentive", prompt: "Identify what the person would gain by hiding or changing the claim." },
      { action_type: "check_pattern", prompt: "Check whether there are repeated contradictions, not only one correction." },
      { action_type: "check_alternative_explanations", prompt: "Compare deception against memory error, fear, wording ambiguity, and correction." }
    ]
  };
}

function createCorrectionVerificationPlan(cluster) {
  return {
    id: makeId("plan_item"),
    plan_type: "correction_verification",
    priority: 0.74,
    focus: "Verify whether the later claim functions as a correction or clarification.",
    reason: "Correction or clarification is currently the leading motive/context model.",
    related_contradiction: cluster.contradiction.id,
    suggested_actions: [
      { action_type: "ask_for_wording", prompt: "What exactly was meant by the earlier denial?" },
      { action_type: "ask_for_scope", prompt: "Was the earlier statement meant as 'never borrowed' or 'I do not currently owe'?" },
      { action_type: "ask_for_repair_evidence", prompt: "Is there evidence that the issue was corrected, repaid, clarified, or resolved?" }
    ]
  };
}
