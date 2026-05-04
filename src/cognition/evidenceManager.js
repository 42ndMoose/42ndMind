
import { makeId, nowIso, clamp } from "../runtime/id.js";
import { reviewContradictionsAfterEvidence } from "./contradictionReview.js";
import { updateMotiveModelsAfterEvidence } from "./motiveModeler.js";

export function addEvidenceToMemory({ memory, claimSelector, direction, text, strength = null }) {
  const claim = selectClaim(memory, claimSelector);

  if (!claim) {
    throw new Error(`No claim found for selector "${claimSelector}". Use "latest" or a specific claim id.`);
  }

  const normalizedDirection = normalizeDirection(direction);
  const evidenceStrength = inferEvidenceStrength(text, strength);

  const evidence = {
    id: makeId("evidence"),
    claim_id: claim.id,
    direction: normalizedDirection,
    text,
    strength: evidenceStrength,
    source: "user",
    created_at: nowIso()
  };

  const confidenceDelta = normalizedDirection === "supports"
    ? evidenceStrength
    : -evidenceStrength;

  const oldConfidence = claim.confidence;
  const newConfidence = clamp(oldConfidence + confidenceDelta);

  const relatedTensionIds = findRelatedTensionIds(memory, claim.id);

  const updatedClaims = memory.claims.map((item) => {
    if (item.id !== claim.id) return item;

    return {
      ...item,
      confidence: newConfidence,
      evidence_count: (item.evidence_count ?? 0) + 1,
      status: normalizedDirection === "supports" ? "evidence_supported" : "evidence_weakened",
      last_confidence_update: {
        old_confidence: oldConfidence,
        new_confidence: newConfidence,
        reason: `Evidence ${normalizedDirection} claim.`,
        evidence_id: evidence.id,
        updated_at: nowIso()
      }
    };
  });

  const updatedTasks = memory.inquiryTasks.map((task) => {
    if (!relatedTensionIds.includes(task.related_tension)) return task;

    return {
      ...task,
      status: task.status === "open" ? "evidence_added_review_needed" : task.status,
      evidence_items: [...(task.evidence_items ?? []), evidence.id],
      updated_at: nowIso()
    };
  });

  const update = {
    id: makeId("update"),
    before: `Claim "${claim.text}" had confidence ${oldConfidence}.`,
    after: `Evidence was added and confidence changed to ${newConfidence}.`,
    reason: `Evidence ${normalizedDirection}: ${text}`,
    epistemic_delta: normalizedDirection === "supports" ? "evidence_added_support" : "evidence_added_weakening",
    confidence_changes: [
      {
        claim_id: claim.id,
        delta: Number((newConfidence - oldConfidence).toFixed(2))
      }
    ],
    evidence_id: evidence.id,
    created_at: nowIso()
  };

  const memoryWithEvidence = {
    ...memory,
    claims: updatedClaims,
    evidence: [...memory.evidence, evidence],
    inquiryTasks: updatedTasks,
    beliefUpdates: [...memory.beliefUpdates, update]
  };

  const memoryAfterContradictionReview = reviewContradictionsAfterEvidence({
    memory: memoryWithEvidence,
    evidence
  });

  return updateMotiveModelsAfterEvidence({
    memory: memoryAfterContradictionReview,
    evidence
  });
}

function selectClaim(memory, selector) {
  if (selector === "latest") {
    return memory.claims.at(-1) ?? null;
  }

  return memory.claims.find((claim) => claim.id === selector) ?? null;
}

function normalizeDirection(direction) {
  if (["supports", "support", "for"].includes(direction)) return "supports";
  if (["weakens", "weaken", "against"].includes(direction)) return "weakens";
  throw new Error(`Invalid evidence direction "${direction}". Use supports or weakens.`);
}

function inferEvidenceStrength(text, explicitStrength) {
  if (explicitStrength !== null && explicitStrength !== undefined) {
    const number = Number(explicitStrength);
    if (!Number.isNaN(number)) return clamp(number, 0.01, 0.5);
  }

  const lower = text.toLowerCase();

  if (/\breceipt\b|\bbank\b|\btransfer\b|\bvideo\b|\btimestamp\b|\btimestamped\b|\brecord\b|\blibrary\b|\bparking\b|\bmessage\b|\bchecked out\b|\breturned\b/.test(lower)) {
    return 0.22;
  }

  if (/\bsomeone said\b|\bi heard\b|\brumor\b/.test(lower)) {
    return 0.08;
  }

  return 0.15;
}

function findRelatedTensionIds(memory, claimId) {
  return memory.tensions
    .filter((tension) => {
      return (
        tension.claim_id === claimId ||
        tension.claim_a === claimId ||
        tension.claim_b === claimId
      );
    })
    .map((tension) => tension.id);
}
