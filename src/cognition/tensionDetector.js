import { makeId, nowIso } from "../runtime/id.js";

export function detectTensions({ currentClaims, relatedClaims }) {
  const tensions = [];

  for (const claim of currentClaims) {
    if (claim.confidence >= 0.7 && claim.evidence_count === 0) {
      tensions.push({
        id: makeId("tension"),
        type: "unsupported_confidence",
        severity: 0.72,
        claim_id: claim.id,
        description: "Claim is expressed with relatively high confidence but has no stored evidence.",
        status: "unresolved",
        created_at: nowIso()
      });
    }

    if (claim.has_absolute_language) {
      tensions.push({
        id: makeId("tension"),
        type: "absolute_language",
        severity: 0.45,
        claim_id: claim.id,
        description: "Claim uses absolute language, so the system should check scope and exceptions.",
        status: "unresolved",
        created_at: nowIso()
      });
    }

    if (claim.claim_kind?.startsWith("self_sealing")) {
      tensions.push({
        id: makeId("tension"),
        type: "self_sealing_pressure",
        severity: 0.88,
        claim_id: claim.id,
        description: "Claim appears to protect itself from correction by treating disagreement or counterevidence as confirmation.",
        status: "unresolved",
        created_at: nowIso()
      });
    }
  }

  for (const oldClaim of relatedClaims) {
    for (const newClaim of currentClaims) {
      const contradiction = classifyContradiction(oldClaim, newClaim);
      if (!contradiction) continue;

      tensions.push({
        id: makeId("contradiction"),
        type: contradiction.type,
        severity: contradiction.severity,
        claim_a: oldClaim.id,
        claim_b: newClaim.id,
        description: contradiction.description,
        status: "unresolved",
        contradiction_reason: contradiction.reason,
        created_at: nowIso()
      });
    }
  }

  return tensions;
}

function classifyContradiction(oldClaim, newClaim) {
  const sameSubject = oldClaim.subject === newClaim.subject;
  const sameObject = oldClaim.object && newClaim.object && oldClaim.object === newClaim.object;
  const sameAction = oldClaim.action && newClaim.action && oldClaim.action === newClaim.action;

  const broad = classifyBroadEpistemicContradiction(oldClaim, newClaim);
  if (broad) return broad;

  const directPolarityConflict =
    sameObject &&
    sameSubject &&
    oldClaim.polarity !== "unknown" &&
    newClaim.polarity !== "unknown" &&
    oldClaim.polarity !== newClaim.polarity;

  const absoluteNeverBroken =
    sameObject &&
    sameSubject &&
    oldClaim.scope === "absolute" &&
    oldClaim.polarity === "negative" &&
    newClaim.polarity === "positive";

  if (absoluteNeverBroken) {
    return {
      type: "direct_contradiction_absolute_denial_broken",
      severity: 0.9,
      reason: "A later positive admission conflicts with an earlier absolute denial.",
      description: `Later claim appears to break an earlier absolute denial about "${newClaim.object}".`
    };
  }

  if (directPolarityConflict || (sameObject && sameAction && oldClaim.polarity !== newClaim.polarity)) {
    return {
      type: "possible_contradiction",
      severity: 0.82,
      reason: "Opposite polarity found across related claims.",
      description: `New claim about "${newClaim.object ?? newClaim.subject_label}" may conflict with a prior claim.`
    };
  }

  return null;
}

function classifyBroadEpistemicContradiction(oldClaim, newClaim) {
  if (oldClaim.claim_kind === "deadline_compliance_claim" && newClaim.claim_kind === "deadline_missed_admission") {
    return broad("possible_contradiction_timeline_deadline", 0.88, "A later timestamp/deadline admission conflicts with the earlier before-deadline claim.", "Deadline/timeline mismatch creates direct epistemic pressure.");
  }

  if (oldClaim.claim_kind === "wrongdoing_denial" && newClaim.claim_kind === "reputation_management_admission") {
    return broad("possible_contradiction_reputation_management", 0.86, "Deleting messages because they looked bad weakens an earlier blanket denial of wrongdoing.", "Self-serving denial conflicts with reputation-management behavior.");
  }

  if (oldClaim.claim_kind === "accusation_theft" && newClaim.claim_kind === "recovered_object" && oldClaim.object === newClaim.object) {
    return broad("possible_contradiction_accusation_weakened", 0.9, "Finding the allegedly stolen object weakens the earlier accusation.", "Recovered object creates strong pressure to revise the accusation.");
  }

  if (oldClaim.claim_kind === "motive_attribution_claim" && newClaim.claim_kind === "alternative_explanation_claim") {
    return broad("possible_contradiction_motive_alternative", 0.8, "A concrete alternative explanation competes with the earlier motive attribution.", "Mind-reading motive claim is weakened by live practical alternatives.");
  }

  if (oldClaim.claim_kind === "false_certainty_denial" && newClaim.claim_kind === "evidence_gap_admission") {
    return broad("possible_contradiction_overconfidence_evidence_gap", 0.87, "A later evidence-gap admission conflicts with the earlier certainty claim.", "Limited perception undercuts certainty.");
  }

  if (oldClaim.claim_kind === "self_sealing_disagreement_claim" && newClaim.claim_kind === "self_sealing_counterevidence_claim") {
    return broad("epistemic_contradiction_self_sealing_logic", 0.93, "The later claim turns counterevidence into confirmation, making the belief self-sealing.", "The reasoning protects itself from correction.");
  }

  if (oldClaim.claim_kind === "all_night_claim" && ["absence_admission", "concealment_admission"].includes(newClaim.claim_kind)) {
    return broad("possible_contradiction_whereabouts", 0.86, "A later absence/concealment admission conflicts with the earlier all-night claim.", "Timeline and concealment signals create motive uncertainty.");
  }

  if (oldClaim.action === "return" && newClaim.claim_kind === "current_possession_after_return_claim" && oldClaim.object === newClaim.object) {
    return broad("possible_contradiction_return_vs_possession", 0.86, "A later present-possession claim conflicts with the earlier return claim.", "The word 'returned' may have been false, partial, or scope-shifted.");
  }

  if (["pay", "return"].includes(oldClaim.action) && newClaim.claim_kind === "partial_truth_admission" && (!newClaim.object || oldClaim.object === newClaim.object)) {
    return broad("possible_contradiction_partial_truth", 0.82, "A later partial-truth admission narrows an earlier complete-sounding claim.", "The earlier claim may be technically related but overbroad.");
  }

  return null;
}

function broad(type, severity, description, reason) {
  return { type, severity, description, reason };
}
