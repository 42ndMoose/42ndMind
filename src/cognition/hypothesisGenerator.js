import { makeId, nowIso } from "../runtime/id.js";

export function generateHypotheses({ currentClaims, tensions }) {
  const hypotheses = [];

  for (const claim of currentClaims) {
    hypotheses.push({
      id: makeId("hyp"),
      related_claim: claim.id,
      text: "The claim may be accurate as stated.",
      confidence: 0.33,
      status: "live",
      created_at: nowIso()
    });

    hypotheses.push({
      id: makeId("hyp"),
      related_claim: claim.id,
      text: "The claim may be sincere but incomplete, mistaken, or missing context.",
      confidence: 0.33,
      status: "live",
      created_at: nowIso()
    });
  }

  if (tensions.some((tension) => tension.type === "possible_contradiction")) {
    hypotheses.push({
      id: makeId("hyp"),
      related_claim: currentClaims[0]?.id ?? "unknown",
      text: "A contradiction may indicate deception, changed memory, changed wording, or two different meanings being collapsed.",
      confidence: 0.34,
      status: "live",
      created_at: nowIso()
    });
  }

  return hypotheses;
}
