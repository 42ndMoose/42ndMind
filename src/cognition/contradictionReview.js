import { makeId, nowIso, clamp } from "../runtime/id.js";

export function reviewContradictionsAfterEvidence({ memory, evidence }) {
  let claims = [...memory.claims];
  let tensions = [...memory.tensions];
  let contradictions = [...memory.contradictions];
  let inquiryTasks = [...memory.inquiryTasks];
  let hypotheses = [...memory.hypotheses];
  const beliefUpdates = [];

  for (const contradiction of memory.contradictions) {
    const relation = classifyEvidenceRelation(contradiction, evidence);
    if (!relation) continue;

    const winningClaim = claims.find((claim) => claim.id === relation.winningClaimId);
    const losingClaim = claims.find((claim) => claim.id === relation.losingClaimId);

    if (!winningClaim || !losingClaim) continue;

    const oldLosingConfidence = losingClaim.confidence;
    const losingPenalty = relation.strength;
    const newLosingConfidence = clamp(oldLosingConfidence - losingPenalty);

    claims = claims.map((claim) => {
      if (claim.id !== losingClaim.id) return claim;

      return {
        ...claim,
        confidence: newLosingConfidence,
        status: "evidence_weakened_by_opposing_claim",
        last_confidence_update: {
          old_confidence: oldLosingConfidence,
          new_confidence: newLosingConfidence,
          reason: relation.reason,
          evidence_id: evidence.id,
          updated_at: nowIso()
        }
      };
    });

    const reviewedStatus = determineContradictionStatus({
      winningConfidence: winningClaim.confidence,
      losingConfidence: newLosingConfidence
    });

    const reviewRecord = {
      reviewed_at: nowIso(),
      evidence_id: evidence.id,
      winning_claim_id: winningClaim.id,
      losing_claim_id: losingClaim.id,
      losing_confidence_change: Number((newLosingConfidence - oldLosingConfidence).toFixed(2)),
      reason: relation.reason
    };

    contradictions = contradictions.map((item) => {
      if (item.id !== contradiction.id) return item;

      return {
        ...item,
        status: reviewedStatus,
        evidence_items: uniqueAppend(item.evidence_items, evidence.id),
        review_history: [...(item.review_history ?? []), reviewRecord],
        reviewed_at: nowIso()
      };
    });

    tensions = tensions.map((item) => {
      if (item.id === contradiction.id) {
        return {
          ...item,
          status: reviewedStatus,
          evidence_items: uniqueAppend(item.evidence_items, evidence.id),
          review_history: [...(item.review_history ?? []), reviewRecord],
          reviewed_at: nowIso()
        };
      }

      if (
        reviewedStatus === "resolved_evidence_weighted" &&
        item.claim_id === losingClaim.id &&
        (item.type === "unsupported_confidence" || item.type === "absolute_language")
      ) {
        return {
          ...item,
          status: "superseded_by_contradiction_resolution",
          superseded_by: contradiction.id,
          evidence_items: uniqueAppend(item.evidence_items, evidence.id),
          updated_at: nowIso()
        };
      }

      return item;
    });

    inquiryTasks = inquiryTasks.map((task) => {
      if (task.related_tension === contradiction.id) {
        return {
          ...task,
          status: reviewedStatus === "resolved_evidence_weighted"
            ? "resolved_evidence_weighted"
            : "evidence_weighted_review_needed",
          evidence_items: uniqueAppend(task.evidence_items, evidence.id),
          updated_at: nowIso()
        };
      }

      const relatedTension = tensions.find((tension) => tension.id === task.related_tension);
      if (
        reviewedStatus === "resolved_evidence_weighted" &&
        relatedTension?.claim_id === losingClaim.id &&
        relatedTension?.status === "superseded_by_contradiction_resolution"
      ) {
        return {
          ...task,
          status: "superseded_by_contradiction_resolution",
          superseded_by: contradiction.id,
          evidence_items: uniqueAppend(task.evidence_items, evidence.id),
          updated_at: nowIso()
        };
      }

      return task;
    });

    const hypothesisRevision = reviseHypothesesForContradictionEvidence({
      hypotheses,
      winningClaim,
      losingClaim,
      evidence,
      reviewedStatus
    });
    hypotheses = hypothesisRevision.hypotheses;

    beliefUpdates.push({
      id: makeId("update"),
      before: `Contradiction "${contradiction.id}" was ${contradiction.status}.`,
      after: `Contradiction became ${reviewedStatus}; claim "${losingClaim.text}" confidence changed from ${oldLosingConfidence} to ${newLosingConfidence}.`,
      reason: relation.reason,
      epistemic_delta: reviewedStatus === "resolved_evidence_weighted"
        ? "contradiction_evidence_weighted_resolved"
        : "contradiction_evidence_weighted_review_needed",
      confidence_changes: [
        {
          claim_id: losingClaim.id,
          delta: Number((newLosingConfidence - oldLosingConfidence).toFixed(2))
        }
      ],
      evidence_id: evidence.id,
      created_at: nowIso()
    });

    if (hypothesisRevision.hypothesis_updates.length > 0) {
      beliefUpdates.push({
        id: makeId("update"),
        before: "Hypotheses were live but not yet evidence-weighted.",
        after: "Hypotheses were revised according to claim role and hypothesis type.",
        reason: "Evidence should affect explanation hypotheses differently, not blanket-strengthen all hypotheses.",
        epistemic_delta: "hypotheses_evidence_weighted",
        hypothesis_updates: hypothesisRevision.hypothesis_updates,
        evidence_id: evidence.id,
        created_at: nowIso()
      });
    }

    if (reviewedStatus === "resolved_evidence_weighted") {
      beliefUpdates.push({
        id: makeId("update"),
        before: "Some inquiry tasks and hypotheses remained open after contradiction resolution.",
        after: "Tasks tied to the weakened claim were marked as superseded; hypotheses were evidence-weighted by type.",
        reason: "Resolved contradiction should clean up stale epistemic pressure without flattening all explanations.",
        epistemic_delta: "stale_tension_cleanup",
        evidence_id: evidence.id,
        created_at: nowIso()
      });
    }
  }

  return {
    ...memory,
    claims,
    tensions,
    contradictions,
    inquiryTasks,
    hypotheses,
    beliefUpdates: [...memory.beliefUpdates, ...beliefUpdates]
  };
}

export function reviewAllContradictions(memory) {
  const contradictions = memory.contradictions.map((contradiction) => {
    const claimA = memory.claims.find((claim) => claim.id === contradiction.claim_a);
    const claimB = memory.claims.find((claim) => claim.id === contradiction.claim_b);

    if (!claimA || !claimB) return contradiction;

    const status = determineContradictionStatus({
      winningConfidence: Math.max(claimA.confidence, claimB.confidence),
      losingConfidence: Math.min(claimA.confidence, claimB.confidence)
    });

    return {
      ...contradiction,
      status,
      reviewed_at: nowIso()
    };
  });

  const statusById = new Map(contradictions.map((item) => [item.id, item.status]));

  const tensions = memory.tensions.map((tension) => {
    if (!statusById.has(tension.id)) return tension;
    return {
      ...tension,
      status: statusById.get(tension.id),
      reviewed_at: nowIso()
    };
  });

  const inquiryTasks = memory.inquiryTasks.map((task) => {
    if (!statusById.has(task.related_tension)) return task;
    const status = statusById.get(task.related_tension);

    return {
      ...task,
      status: status === "resolved_evidence_weighted"
        ? "resolved_evidence_weighted"
        : task.status,
      updated_at: nowIso()
    };
  });

  return {
    ...memory,
    contradictions,
    tensions,
    inquiryTasks
  };
}

function reviseHypothesesForContradictionEvidence({ hypotheses, winningClaim, losingClaim, evidence }) {
  const hypothesis_updates = [];

  const revised = hypotheses.map((hypothesis) => {
    let delta = 0;
    let status = hypothesis.status;
    let reason = null;

    const isWinning = hypothesis.related_claim === winningClaim.id;
    const isLosing = hypothesis.related_claim === losingClaim.id;

    if (isWinning) {
      if (hypothesis.hypothesis_type === "claim_accurate") {
        delta = 0.18;
        status = "strengthened_by_evidence";
        reason = "Evidence supports the winning claim as stated.";
      } else if (hypothesis.hypothesis_type === "correction_or_repair") {
        delta = 0.14;
        status = "strengthened_by_evidence";
        reason = "Evidence supports the later correction or repair interpretation.";
      } else if (hypothesis.hypothesis_type === "earlier_false_overbroad_or_contextual") {
        delta = 0.16;
        status = "strengthened_by_evidence";
        reason = "Evidence against the earlier absolute denial supports the overbroad/false/contextual hypothesis.";
      } else if (hypothesis.hypothesis_type === "deception_memory_or_wording_shift") {
        delta = 0.04;
        status = "still_live_low_change";
        reason = "Evidence confirms contradiction, but does not by itself distinguish deception, memory shift, or wording shift.";
      } else if (hypothesis.hypothesis_type === "claim_incomplete_or_mistaken") {
        delta = 0.02;
        status = "still_live_low_change";
        reason = "Evidence helps the claim but does not resolve whether it is incomplete or mistaken.";
      }
    }

    if (isLosing) {
      if (hypothesis.hypothesis_type === "claim_accurate") {
        delta = -0.20;
        status = "weakened_by_opposing_evidence";
        reason = "Evidence supporting the opposing claim weakens this claim as stated.";
      } else if (hypothesis.hypothesis_type === "claim_incomplete_or_mistaken") {
        delta = 0.06;
        status = "partly_strengthened_as_error_explanation";
        reason = "Evidence against the claim strengthens the possibility it was incomplete, mistaken, or missing context.";
      }
    }

    if (delta === 0) return hypothesis;

    const oldConfidence = hypothesis.confidence;
    const newConfidence = clamp(oldConfidence + delta);

    hypothesis_updates.push({
      hypothesis_id: hypothesis.id,
      hypothesis_type: hypothesis.hypothesis_type,
      old_confidence: oldConfidence,
      new_confidence: newConfidence,
      delta: Number((newConfidence - oldConfidence).toFixed(2)),
      status,
      reason
    });

    return {
      ...hypothesis,
      confidence: newConfidence,
      status,
      evidence_items: uniqueAppend(hypothesis.evidence_items, evidence.id),
      last_confidence_update: {
        old_confidence: oldConfidence,
        new_confidence: newConfidence,
        reason,
        evidence_id: evidence.id,
        updated_at: nowIso()
      },
      updated_at: nowIso()
    };
  });

  return {
    hypotheses: revised,
    hypothesis_updates
  };
}

function classifyEvidenceRelation(contradiction, evidence) {
  const strength = inferPropagationStrength(evidence);

  if (evidence.direction === "supports" && evidence.claim_id === contradiction.claim_b) {
    return {
      winningClaimId: contradiction.claim_b,
      losingClaimId: contradiction.claim_a,
      strength,
      reason: "Evidence supports the later claim that contradicted the earlier claim."
    };
  }

  if (evidence.direction === "supports" && evidence.claim_id === contradiction.claim_a) {
    return {
      winningClaimId: contradiction.claim_a,
      losingClaimId: contradiction.claim_b,
      strength,
      reason: "Evidence supports the earlier claim against the later contradictory claim."
    };
  }

  if (evidence.direction === "weakens" && evidence.claim_id === contradiction.claim_a) {
    return {
      winningClaimId: contradiction.claim_b,
      losingClaimId: contradiction.claim_a,
      strength,
      reason: "Evidence weakens the earlier claim, indirectly strengthening the later contradictory claim."
    };
  }

  if (evidence.direction === "weakens" && evidence.claim_id === contradiction.claim_b) {
    return {
      winningClaimId: contradiction.claim_a,
      losingClaimId: contradiction.claim_b,
      strength,
      reason: "Evidence weakens the later claim, indirectly strengthening the earlier contradictory claim."
    };
  }

  return null;
}

function inferPropagationStrength(evidence) {
  return clamp(Math.max(0.08, evidence.strength * 0.7), 0.05, 0.25);
}

function determineContradictionStatus({ winningConfidence, losingConfidence }) {
  if (winningConfidence >= 0.75 && losingConfidence <= 0.2) {
    return "resolved_evidence_weighted";
  }

  return "evidence_weighted_unresolved";
}

function uniqueAppend(list, item) {
  return [...new Set([...(list ?? []), item])];
}
