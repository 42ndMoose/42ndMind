import { makeId, nowIso } from "../runtime/id.js";

function oppositePolarity(a, b) {
  if (!a || !b) return false;
  return a !== b;
}

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
      if (
        oldClaim.id !== newClaim.id &&
        oldClaim.subject &&
        newClaim.subject &&
        oldClaim.subject === newClaim.subject &&
        oppositePolarity(oldClaim.polarity, newClaim.polarity)
      ) {
        tensions.push({
          id: makeId("contradiction"),
          type: "possible_contradiction",
          severity: 0.82,
          claim_a: oldClaim.id,
          claim_b: newClaim.id,
          description: `New claim about "${newClaim.subject}" may conflict with a prior claim.`,
          status: "unresolved",
          created_at: nowIso()
        });
      }
    }
  }

  return tensions;
}
