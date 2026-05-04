
import { makeId, nowIso, clamp } from "../runtime/id.js";

export function buildBeliefUpdates({ memory, currentClaims, tensions }) {
  const updates = [];
  const claimConfidenceChanges = [];

  for (const tension of tensions) {
    if (tension.type === "direct_contradiction_absolute_denial_broken") {
      const oldClaim = memory.claims.find((claim) => claim.id === tension.claim_a);
      const newClaim = currentClaims.find((claim) => claim.id === tension.claim_b);

      if (oldClaim && newClaim) {
        claimConfidenceChanges.push({
          claim_id: oldClaim.id,
          old_confidence: oldClaim.confidence,
          new_confidence: clamp(oldClaim.confidence - 0.42),
          reason: "Later positive admission weakens earlier absolute denial."
        });

        updates.push({
          id: makeId("update"),
          before: `Prior claim: "${oldClaim.text}" with confidence ${oldClaim.confidence}.`,
          after: "Prior denial is weakened but not erased; the contradiction remains unresolved until motive, wording, or correction is clarified.",
          reason: tension.contradiction_reason,
          epistemic_delta: "contradiction_exposed_confidence_reduced",
          confidence_changes: [
            {
              claim_id: oldClaim.id,
              delta: -0.42
            }
          ],
          created_at: nowIso()
        });
      }
    }

    if (tension.type === "possible_contradiction") {
      const oldClaim = memory.claims.find((claim) => claim.id === tension.claim_a);

      if (oldClaim) {
        claimConfidenceChanges.push({
          claim_id: oldClaim.id,
          old_confidence: oldClaim.confidence,
          new_confidence: clamp(oldClaim.confidence - 0.25),
          reason: "Possible contradiction weakens the older claim until resolved."
        });

        updates.push({
          id: makeId("update"),
          before: "Related claims could be accepted independently.",
          after: "Related claims are linked under unresolved contradiction, and older confidence is reduced.",
          reason: tension.contradiction_reason,
          epistemic_delta: "possible_contradiction_linked",
          confidence_changes: [
            {
              claim_id: oldClaim.id,
              delta: -0.25
            }
          ],
          created_at: nowIso()
        });
      }
    }
  }

  if (tensions.length > 0) {
    updates.push({
      id: makeId("update"),
      before: "New input could be accepted naively as settled.",
      after: "New input is stored with unresolved tensions and inquiry tasks.",
      reason: `${tensions.length} tension(s) detected.`,
      epistemic_delta: "reduced_naive_acceptance",
      created_at: nowIso()
    });
  }

  return {
    updates,
    claimConfidenceChanges
  };
}

export function applyConfidenceChanges(memory, claimConfidenceChanges) {
  if (!claimConfidenceChanges.length) return memory;

  const changesById = new Map(claimConfidenceChanges.map((change) => [change.claim_id, change]));

  return {
    ...memory,
    claims: memory.claims.map((claim) => {
      const change = changesById.get(claim.id);
      if (!change) return claim;

      return {
        ...claim,
        confidence: change.new_confidence,
        status: claim.status === "unverified" ? "weakened_by_later_tension" : claim.status,
        last_confidence_update: {
          old_confidence: change.old_confidence,
          new_confidence: change.new_confidence,
          reason: change.reason,
          updated_at: nowIso()
        }
      };
    })
  };
}
