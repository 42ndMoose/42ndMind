import { makeId, nowIso } from "../runtime/id.js";

export function generateHypotheses({ currentClaims, tensions }) {
  const hypotheses = [];

  for (const claim of currentClaims) {
    hypotheses.push(makeHypothesis({
      relatedClaim: claim.id,
      type: "claim_accurate",
      text: "The claim may be accurate as stated.",
      confidence: 0.33
    }));

    hypotheses.push(makeHypothesis({
      relatedClaim: claim.id,
      type: "claim_incomplete_or_mistaken",
      text: "The claim may be sincere but incomplete, mistaken, or missing context.",
      confidence: 0.33
    }));

    if (claim.resolution_claim) {
      hypotheses.push(makeHypothesis({
        relatedClaim: claim.id,
        type: "correction_or_repair",
        text: "The later claim may be a correction, repair, or narrowing of an earlier statement rather than pure deception.",
        confidence: 0.34
      }));
    }
  }

  for (const tension of tensions) {
    if (
      tension.type === "possible_contradiction" ||
      tension.type === "direct_contradiction_absolute_denial_broken"
    ) {
      hypotheses.push(makeHypothesis({
        relatedClaim: tension.claim_b,
        type: "deception_memory_or_wording_shift",
        text: "A contradiction may indicate deception, changed memory, changed wording, or two different meanings being collapsed.",
        confidence: 0.34
      }));

      hypotheses.push(makeHypothesis({
        relatedClaim: tension.claim_b,
        type: "earlier_false_overbroad_or_contextual",
        text: "The earlier claim may have been false, overbroad, or context-dependent.",
        confidence: 0.32
      }));
    }
  }

  return hypotheses;
}

function makeHypothesis({ relatedClaim, type, text, confidence }) {
  return {
    id: makeId("hyp"),
    related_claim: relatedClaim,
    hypothesis_type: type,
    text,
    confidence,
    status: "live",
    evidence_items: [],
    created_at: nowIso()
  };
}
