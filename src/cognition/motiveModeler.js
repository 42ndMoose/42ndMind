import { makeId, nowIso, clamp } from "../runtime/id.js";

export function generateMotiveModels({ currentClaims, relatedClaims, tensions }) {
  const motives = [];

  for (const tension of tensions) {
    if (!tension.type.includes("contradiction")) continue;

    const laterClaim = currentClaims.find((claim) => claim.id === tension.claim_b);
    const earlierClaim = relatedClaims.find((claim) => claim.id === tension.claim_a);

    motives.push(makeMotive({
      contradictionId: tension.id,
      relatedClaims: [tension.claim_a, tension.claim_b],
      motiveType: "correction_or_clarification",
      text: "The later statement may be an attempt to correct or clarify an earlier overbroad statement.",
      confidence: laterClaim?.resolution_claim ? 0.42 : 0.32,
      signals: laterClaim?.resolution_claim ? ["later_claim_contains_repair_or_resolution"] : []
    }));

    motives.push(makeMotive({
      contradictionId: tension.id,
      relatedClaims: [tension.claim_a, tension.claim_b],
      motiveType: "avoid_blame_or_consequence",
      text: "The earlier denial may have been motivated by avoiding blame, debt, conflict, shame, punishment, or responsibility.",
      confidence: 0.30,
      signals: ["earlier_absolute_denial", "later_admission_conflict"]
    }));

    motives.push(makeMotive({
      contradictionId: tension.id,
      relatedClaims: [tension.claim_a, tension.claim_b],
      motiveType: "memory_error",
      text: "The contradiction may come from mistaken memory rather than deliberate deception.",
      confidence: 0.24,
      signals: ["conflicting_self_report"]
    }));

    motives.push(makeMotive({
      contradictionId: tension.id,
      relatedClaims: [tension.claim_a, tension.claim_b],
      motiveType: "wording_or_scope_shift",
      text: "The contradiction may come from different meanings, scope, or wording around the same event.",
      confidence: earlierClaim?.scope === "absolute" ? 0.31 : 0.25,
      signals: earlierClaim?.scope === "absolute" ? ["absolute_scope_later_broken"] : []
    }));

    motives.push(makeMotive({
      contradictionId: tension.id,
      relatedClaims: [tension.claim_a, tension.claim_b],
      motiveType: "strategic_deception",
      text: "The contradiction may involve deliberate deception.",
      confidence: 0.22,
      signals: ["contradiction_live_but_motive_unproven"]
    }));
  }

  return motives;
}

export function updateMotiveModelsAfterEvidence({ memory, evidence }) {
  if (!memory.motiveModels?.length) return memory;

  const relatedContradictionIds = new Set(
    memory.contradictions
      .filter((contradiction) => {
        return contradiction.claim_a === evidence.claim_id || contradiction.claim_b === evidence.claim_id;
      })
      .map((contradiction) => contradiction.id)
  );

  if (relatedContradictionIds.size === 0) return memory;

  const motiveUpdates = [];

  const motiveModels = memory.motiveModels.map((motive) => {
    if (!relatedContradictionIds.has(motive.contradiction_id)) return motive;

    const revision = getMotiveEvidenceRevision({ motive, evidence });
    if (!revision) return motive;

    const oldConfidence = motive.confidence;
    const newConfidence = clamp(oldConfidence + revision.delta);

    motiveUpdates.push({
      motive_id: motive.id,
      motive_type: motive.motive_type,
      old_confidence: oldConfidence,
      new_confidence: newConfidence,
      delta: Number((newConfidence - oldConfidence).toFixed(2)),
      reason: revision.reason
    });

    return {
      ...motive,
      confidence: newConfidence,
      status: revision.status,
      evidence_items: uniqueAppend(motive.evidence_items, evidence.id),
      last_confidence_update: {
        old_confidence: oldConfidence,
        new_confidence: newConfidence,
        reason: revision.reason,
        evidence_id: evidence.id,
        updated_at: nowIso()
      },
      updated_at: nowIso()
    };
  });

  if (motiveUpdates.length === 0) {
    return {
      ...memory,
      motiveModels
    };
  }

  return {
    ...memory,
    motiveModels,
    beliefUpdates: [
      ...memory.beliefUpdates,
      {
        id: makeId("update"),
        before: "Motive models were live but not evidence-weighted.",
        after: "Motive models were updated according to the new evidence.",
        reason: "Evidence can affect motive hypotheses without fully deciding motive.",
        epistemic_delta: "motive_models_evidence_weighted",
        motive_updates: motiveUpdates,
        evidence_id: evidence.id,
        created_at: nowIso()
      }
    ]
  };
}

function makeMotive({ contradictionId, relatedClaims, motiveType, text, confidence, signals }) {
  return {
    id: makeId("motive"),
    contradiction_id: contradictionId,
    related_claims: relatedClaims,
    motive_type: motiveType,
    text,
    confidence,
    status: "live",
    signals,
    evidence_items: [],
    created_at: nowIso()
  };
}

function getMotiveEvidenceRevision({ motive, evidence }) {
  const lower = evidence.text.toLowerCase();
  const hasReceiptSignal = /\breceipt\b|\bbank\b|\btransfer\b|\brepayment\b|\bpaid\b|\breturned\b/.test(lower);

  if (!hasReceiptSignal) {
    return {
      delta: 0.02,
      status: "still_live_low_change",
      reason: "Evidence is related but does not strongly identify motive."
    };
  }

  if (motive.motive_type === "correction_or_clarification") {
    return {
      delta: 0.10,
      status: "strengthened_by_repair_evidence",
      reason: "Repayment evidence supports the possibility that the later statement corrected or clarified the earlier one."
    };
  }

  if (motive.motive_type === "wording_or_scope_shift") {
    return {
      delta: 0.05,
      status: "slightly_strengthened_by_scope_evidence",
      reason: "Repayment evidence makes a scope shift plausible, such as confusing 'never borrowed' with 'do not currently owe'."
    };
  }

  if (motive.motive_type === "avoid_blame_or_consequence") {
    return {
      delta: 0.03,
      status: "still_live_low_change",
      reason: "Repayment evidence confirms contradiction but does not prove avoidance motive."
    };
  }

  if (motive.motive_type === "memory_error") {
    return {
      delta: 0.01,
      status: "still_live_low_change",
      reason: "Repayment evidence does not strongly distinguish memory error from correction or deception."
    };
  }

  if (motive.motive_type === "strategic_deception") {
    return {
      delta: 0.02,
      status: "still_live_low_change",
      reason: "Repayment evidence confirms the earlier denial was false or overbroad, but does not by itself prove deliberate deception."
    };
  }

  return null;
}

function uniqueAppend(list, item) {
  return [...new Set([...(list ?? []), item])];
}
