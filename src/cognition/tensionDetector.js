
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
