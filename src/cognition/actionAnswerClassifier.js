import { makeId, nowIso, clamp } from "../runtime/id.js";

export function classifyAndApplyActionAnswer({ memory, action, response, evidenceLikeItem }) {
  const classification = classifyActionAnswer({ action, response, evidenceLikeItem });

  if (classification.classification_type === "unclassified_context") {
    return {
      ...memory,
      actionAnswerClassifications: [...(memory.actionAnswerClassifications ?? []), classification],
      beliefUpdates: [
        ...memory.beliefUpdates,
        {
          id: makeId("update"),
          before: "Action answer was stored but not classified.",
          after: "Action answer remained unclassified context.",
          reason: "No rule matched the answer yet.",
          epistemic_delta: "action_answer_unclassified",
          action_id: action.id,
          classification_id: classification.id,
          created_at: nowIso()
        }
      ]
    };
  }

  const relatedContradictionId = action.related_contradiction ?? evidenceLikeItem.related_contradiction ?? null;

  let motiveModels = [...(memory.motiveModels ?? [])];
  let hypotheses = [...(memory.hypotheses ?? [])];
  let contradictions = [...(memory.contradictions ?? [])];
  let tensions = [...(memory.tensions ?? [])];
  let claims = [...(memory.claims ?? [])];
  let inquiryTasks = [...(memory.inquiryTasks ?? [])];

  const motiveUpdates = [];
  const hypothesisUpdates = [];
  const claimUpdates = [];

  for (const effect of classification.effects) {
    if (effect.target_kind === "motive_type") {
      motiveModels = motiveModels.map((motive) => {
        if (motive.contradiction_id !== relatedContradictionId) return motive;
        if (motive.motive_type !== effect.target) return motive;

        const oldConfidence = motive.confidence;
        const newConfidence = clamp(oldConfidence + effect.delta);

        motiveUpdates.push({
          motive_id: motive.id,
          motive_type: motive.motive_type,
          old_confidence: oldConfidence,
          new_confidence: newConfidence,
          delta: Number((newConfidence - oldConfidence).toFixed(2)),
          reason: effect.reason
        });

        return {
          ...motive,
          confidence: newConfidence,
          status: effect.status,
          evidence_items: uniqueAppend(motive.evidence_items, evidenceLikeItem.id),
          last_confidence_update: {
            old_confidence: oldConfidence,
            new_confidence: newConfidence,
            reason: effect.reason,
            evidence_id: evidenceLikeItem.id,
            updated_at: nowIso()
          },
          updated_at: nowIso()
        };
      });
    }

    if (effect.target_kind === "hypothesis_type") {
      const relatedClaimIds = getContradictionClaimIds(memory, relatedContradictionId);

      hypotheses = hypotheses.map((hypothesis) => {
        if (!relatedClaimIds.includes(hypothesis.related_claim)) return hypothesis;
        if (hypothesis.hypothesis_type !== effect.target) return hypothesis;

        const oldConfidence = hypothesis.confidence;
        const newConfidence = clamp(oldConfidence + effect.delta);

        hypothesisUpdates.push({
          hypothesis_id: hypothesis.id,
          hypothesis_type: hypothesis.hypothesis_type,
          old_confidence: oldConfidence,
          new_confidence: newConfidence,
          delta: Number((newConfidence - oldConfidence).toFixed(2)),
          reason: effect.reason
        });

        return {
          ...hypothesis,
          confidence: newConfidence,
          status: effect.status,
          evidence_items: uniqueAppend(hypothesis.evidence_items, evidenceLikeItem.id),
          last_confidence_update: {
            old_confidence: oldConfidence,
            new_confidence: newConfidence,
            reason: effect.reason,
            evidence_id: evidenceLikeItem.id,
            updated_at: nowIso()
          },
          updated_at: nowIso()
        };
      });
    }

    if (effect.target_kind === "earlier_absolute_claim") {
      const contradiction = memory.contradictions.find((item) => item.id === relatedContradictionId);
      if (!contradiction) continue;

      claims = claims.map((claim) => {
        if (claim.id !== contradiction.claim_a) return claim;

        const oldConfidence = claim.confidence;
        const newConfidence = clamp(oldConfidence + effect.delta);

        claimUpdates.push({
          claim_id: claim.id,
          old_confidence: oldConfidence,
          new_confidence: newConfidence,
          delta: Number((newConfidence - oldConfidence).toFixed(2)),
          reason: effect.reason
        });

        return {
          ...claim,
          confidence: newConfidence,
          status: effect.status,
          last_confidence_update: {
            old_confidence: oldConfidence,
            new_confidence: newConfidence,
            reason: effect.reason,
            evidence_id: evidenceLikeItem.id,
            updated_at: nowIso()
          },
          updated_at: nowIso()
        };
      });
    }
  }

  const contradictionStatus = classification.contradiction_status ?? null;

  if (relatedContradictionId && contradictionStatus) {
    const contradiction = memory.contradictions.find((item) => item.id === relatedContradictionId);
    const losingClaimId = contradiction?.claim_a ?? null;

    contradictions = contradictions.map((item) => {
      if (item.id !== relatedContradictionId) return item;

      return {
        ...item,
        status: contradictionStatus,
        action_answer_classifications: uniqueAppend(item.action_answer_classifications, classification.id),
        evidence_items: uniqueAppend(item.evidence_items, evidenceLikeItem.id),
        reviewed_at: nowIso()
      };
    });

    tensions = tensions.map((tension) => {
      if (tension.id === relatedContradictionId) {
        return {
          ...tension,
          status: contradictionStatus,
          action_answer_classifications: uniqueAppend(tension.action_answer_classifications, classification.id),
          evidence_items: uniqueAppend(tension.evidence_items, evidenceLikeItem.id),
          reviewed_at: nowIso()
        };
      }

      if (
        losingClaimId &&
        tension.claim_id === losingClaimId &&
        (tension.type === "unsupported_confidence" || tension.type === "absolute_language" || tension.type === "self_sealing_pressure")
      ) {
        return {
          ...tension,
          status: "superseded_by_action_answer_classification",
          superseded_by: relatedContradictionId,
          action_answer_classifications: uniqueAppend(tension.action_answer_classifications, classification.id),
          evidence_items: uniqueAppend(tension.evidence_items, evidenceLikeItem.id),
          updated_at: nowIso()
        };
      }

      return tension;
    });

    inquiryTasks = inquiryTasks.map((task) => {
      if (task.related_tension === relatedContradictionId) {
        return {
          ...task,
          status: contradictionStatus,
          action_answer_classifications: uniqueAppend(task.action_answer_classifications, classification.id),
          evidence_items: uniqueAppend(task.evidence_items, evidenceLikeItem.id),
          updated_at: nowIso()
        };
      }

      const relatedTension = tensions.find((tension) => tension.id === task.related_tension);
      if (
        relatedTension?.status === "superseded_by_action_answer_classification"
      ) {
        return {
          ...task,
          status: "superseded_by_action_answer_classification",
          superseded_by: relatedContradictionId,
          action_answer_classifications: uniqueAppend(task.action_answer_classifications, classification.id),
          evidence_items: uniqueAppend(task.evidence_items, evidenceLikeItem.id),
          updated_at: nowIso()
        };
      }

      return task;
    });
  }

  return {
    ...memory,
    claims,
    motiveModels,
    hypotheses,
    contradictions,
    tensions,
    inquiryTasks,
    actionAnswerClassifications: [...(memory.actionAnswerClassifications ?? []), classification],
    beliefUpdates: [
      ...memory.beliefUpdates,
      {
        id: makeId("update"),
        before: "Action answer was stored as raw context.",
        after: "Action answer was classified and applied to motives, hypotheses, and contradiction state.",
        reason: classification.reason,
        epistemic_delta: "action_answer_classified_and_applied",
        action_id: action.id,
        classification_id: classification.id,
        motive_updates: motiveUpdates,
        hypothesis_updates: hypothesisUpdates,
        claim_updates: claimUpdates,
        contradiction_status: contradictionStatus,
        created_at: nowIso()
      }
    ]
  };
}

export function classifyActionAnswer({ action, response, evidenceLikeItem }) {
  const lower = response.text.toLowerCase();


  const definitionClarification =
    /\bnot steal\b/.test(lower) ||
    /\bdid not steal\b/.test(lower) ||
    /\bdidn't steal\b/.test(lower) ||
    /\bborrowed it\b/.test(lower) && /\bnot\b/.test(lower) && /\bsteal\b/.test(lower);

  if (definitionClarification) {
    return {
      id: makeId("classification"),
      action_id: action.id,
      response_id: response.id,
      evidence_id: evidenceLikeItem.id,
      classification_type: "definition_clarification_borrowed_vs_stole",
      confidence: 0.82,
      reason: "The answer distinguishes stealing from borrowing/holding/returning.",
      contradiction_status: "resolved_scope_clarified",
      effects: [
        {
          target_kind: "motive_type",
          target: "wording_or_scope_shift",
          delta: 0.26,
          status: "strongly_supported_by_action_answer",
          reason: "The answer directly says the earlier denial used a different definition."
        },
        {
          target_kind: "motive_type",
          target: "correction_or_clarification",
          delta: 0.08,
          status: "strengthened_by_action_answer",
          reason: "The answer clarifies why the later statement corrected the earlier one."
        },
        {
          target_kind: "motive_type",
          target: "strategic_deception",
          delta: -0.10,
          status: "weakened_by_definition_clarification",
          reason: "A definition clarification weakens deliberate deception relative to wording/scope shift."
        },
        {
          target_kind: "hypothesis_type",
          target: "earlier_false_overbroad_or_contextual",
          delta: 0.18,
          status: "strongly_supported_by_action_answer",
          reason: "The answer directly supports the earlier claim being contextual or definition-dependent."
        },
        {
          target_kind: "hypothesis_type",
          target: "deception_memory_or_wording_shift",
          delta: 0.08,
          status: "wording_shift_supported",
          reason: "The answer supports wording/definition shift inside this broader hypothesis."
        },
        {
          target_kind: "earlier_absolute_claim",
          target: "claim_a",
          delta: -0.05,
          status: "weakened_as_literal_absolute_but_explained_by_definition",
          reason: "The literal absolute denial remains false, but the definition issue is now clearer."
        }
      ],
      created_at: nowIso()
    };
  }

  const memoryClarification =
    /\bforgot\b/.test(lower) ||
    /\bmisremembered\b/.test(lower) ||
    /\bdid not remember\b/.test(lower) ||
    /\bdidn't remember\b/.test(lower) ||
    /\bmemory\b/.test(lower) && /\bwrong\b/.test(lower);

  if (memoryClarification) {
    return {
      id: makeId("classification"),
      action_id: action.id,
      response_id: response.id,
      evidence_id: evidenceLikeItem.id,
      classification_type: "memory_error_clarification",
      confidence: 0.78,
      reason: "The answer explicitly attributes the contradiction to forgetting or memory error.",
      contradiction_status: "resolved_memory_error_claimed",
      effects: [
        {
          target_kind: "motive_type",
          target: "memory_error",
          delta: 0.32,
          status: "strongly_supported_by_action_answer",
          reason: "The answer directly says the earlier denial was caused by memory error."
        },
        {
          target_kind: "motive_type",
          target: "strategic_deception",
          delta: -0.13,
          status: "weakened_by_memory_explanation",
          reason: "A memory-error explanation weakens deliberate deception unless other signals appear."
        },
        {
          target_kind: "motive_type",
          target: "avoid_blame_or_consequence",
          delta: -0.06,
          status: "weakened_by_memory_explanation",
          reason: "Memory error weakens avoidance motive unless independent incentive evidence appears."
        },
        {
          target_kind: "hypothesis_type",
          target: "claim_incomplete_or_mistaken",
          delta: 0.18,
          status: "strongly_supported_by_action_answer",
          reason: "The answer supports the earlier claim being mistaken."
        },
        {
          target_kind: "hypothesis_type",
          target: "deception_memory_or_wording_shift",
          delta: 0.10,
          status: "memory_shift_supported",
          reason: "The answer supports the memory-error branch of this broader hypothesis."
        },
        {
          target_kind: "earlier_absolute_claim",
          target: "claim_a",
          delta: -0.05,
          status: "weakened_as_literal_absolute_but_explained_by_memory",
          reason: "The literal absolute denial remains false, but the memory-error explanation is now clearer."
        }
      ],
      created_at: nowIso()
    };
  }

  const scopeClarification =
    /\bdo not currently owe\b/.test(lower) ||
    /\bdon't currently owe\b/.test(lower) ||
    /\bnot that i had never borrowed\b/.test(lower) ||
    /\bnot that i never borrowed\b/.test(lower) ||
    /\bcurrently owe\b/.test(lower) ||
    /\bdo not currently have\b/.test(lower) ||
    /\bdon't currently have\b/.test(lower) ||
    /\bcurrently have\b/.test(lower) ||
    /\bnot that i had never used\b/.test(lower) ||
    /\bnot that i never used\b/.test(lower) ||
    /\bscope mistake\b/.test(lower) ||
    /\bi meant\b/.test(lower) && /\bnot the\b/.test(lower) ||
    /\bnot the car itself\b/.test(lower) ||
    /\bonly returned the keys\b/.test(lower);

  if (scopeClarification) {
    return {
      id: makeId("classification"),
      action_id: action.id,
      response_id: response.id,
      evidence_id: evidenceLikeItem.id,
      classification_type: "scope_clarification_current_owed_vs_ever_borrowed",
      confidence: 0.86,
      reason: "The answer explicitly distinguishes current debt from ever having borrowed.",
      contradiction_status: "resolved_scope_clarified",
      effects: [
        {
          target_kind: "motive_type",
          target: "wording_or_scope_shift",
          delta: 0.28,
          status: "strongly_supported_by_action_answer",
          reason: "The answer directly says the earlier denial used a different scope."
        },
        {
          target_kind: "motive_type",
          target: "correction_or_clarification",
          delta: 0.10,
          status: "strengthened_by_action_answer",
          reason: "The answer clarifies why the later statement corrected the earlier one."
        },
        {
          target_kind: "motive_type",
          target: "strategic_deception",
          delta: -0.12,
          status: "weakened_by_scope_clarification",
          reason: "A clear scope explanation weakens deliberate deception relative to wording/scope shift."
        },
        {
          target_kind: "motive_type",
          target: "memory_error",
          delta: -0.05,
          status: "weakened_by_scope_clarification",
          reason: "The answer gives a scope explanation rather than a memory failure explanation."
        },
        {
          target_kind: "motive_type",
          target: "avoid_blame_or_consequence",
          delta: -0.04,
          status: "slightly_weakened_by_scope_clarification",
          reason: "Scope clarification weakens avoidance motive unless other signals appear."
        },
        {
          target_kind: "hypothesis_type",
          target: "earlier_false_overbroad_or_contextual",
          delta: 0.20,
          status: "strongly_supported_by_action_answer",
          reason: "The answer directly supports the earlier claim being overbroad/contextual."
        },
        {
          target_kind: "hypothesis_type",
          target: "deception_memory_or_wording_shift",
          delta: 0.08,
          status: "wording_shift_supported",
          reason: "The answer supports wording/scope shift inside this broader hypothesis."
        },
        {
          target_kind: "earlier_absolute_claim",
          target: "claim_a",
          delta: -0.06,
          status: "weakened_as_literal_absolute_but_explained_by_scope",
          reason: "The literal absolute denial remains false, but the context is now clearer."
        }
      ],
      created_at: nowIso()
    };
  }


  const broadClassification = classifyBroadActionAnswer({ action, response, evidenceLikeItem, lower });
  if (broadClassification) return broadClassification;

  return {
    id: makeId("classification"),
    action_id: action.id,
    response_id: response.id,
    evidence_id: evidenceLikeItem.id,
    classification_type: "unclassified_context",
    confidence: 0.25,
    reason: "No rule matched this answer.",
    effects: [],
    created_at: nowIso()
  };
}


function classifyBroadActionAnswer({ action, response, evidenceLikeItem, lower }) {
  const partialTruth =
    /\bpartial\b/.test(lower) ||
    /\bpartly true\b/.test(lower) ||
    /\btoo broad\b/.test(lower) ||
    /\bhalf\b/.test(lower) ||
    /\bnot the full\b/.test(lower) ||
    /\bnot fully\b/.test(lower);

  if (partialTruth) {
    return makeBroadClassification({
      action,
      response,
      evidenceLikeItem,
      classificationType: "partial_truth_correction",
      confidence: 0.8,
      reason: "The answer narrows an earlier complete-sounding claim into a partial-truth correction.",
      contradictionStatus: "resolved_partial_truth_clarified",
      motiveBoost: "correction_or_clarification",
      motiveWeaken: "strategic_deception",
      hypothesisBoost: "earlier_false_overbroad_or_contextual"
    });
  }

  const reputationOrAvoidance =
    /\bdeleted\b/.test(lower) ||
    /\bmade me look bad\b/.test(lower) ||
    /\bembarrassed\b/.test(lower) ||
    /\bavoid consequences\b/.test(lower) ||
    /\bworried how it would look\b/.test(lower) ||
    /\bdid not want anyone to know\b/.test(lower) ||
    /\bdidn't want anyone to know\b/.test(lower) ||
    /\bhid that detail\b/.test(lower);

  if (reputationOrAvoidance) {
    return makeBroadClassification({
      action,
      response,
      evidenceLikeItem,
      classificationType: "avoidance_or_reputation_management",
      confidence: 0.78,
      reason: "The answer supports avoidance, reputation management, or concealment as a live motive.",
      contradictionStatus: "resolved_avoidance_or_reputation_motive_supported",
      motiveBoost: "avoid_blame_or_consequence",
      motiveWeaken: "memory_error",
      hypothesisBoost: "deception_memory_or_wording_shift"
    });
  }

  const mistakenAccusation =
    /\bwrong to accuse\b/.test(lower) ||
    /\bi was wrong to accuse\b/.test(lower) ||
    /\bfound\b/.test(lower) && /\b(backpack|bag|room|drawer|pocket)\b/.test(lower) ||
    /\bassumed theft\b/.test(lower);

  if (mistakenAccusation) {
    return makeBroadClassification({
      action,
      response,
      evidenceLikeItem,
      classificationType: "mistaken_accusation_correction",
      confidence: 0.84,
      reason: "The answer retracts or weakens an accusation after the object was found elsewhere.",
      contradictionStatus: "resolved_accusation_weakened",
      motiveBoost: "correction_or_clarification",
      motiveWeaken: "strategic_deception",
      hypothesisBoost: "claim_incomplete_or_mistaken"
    });
  }

  const timelineCorrection =
    /\bdeadline\b/.test(lower) ||
    /\bnot before\b/.test(lower) ||
    /\bsubmitted it\b/.test(lower) && /\blate\b/.test(lower) ||
    /\bmisunderstood the timeline\b/.test(lower);

  if (timelineCorrection) {
    return makeBroadClassification({
      action,
      response,
      evidenceLikeItem,
      classificationType: "timeline_correction",
      confidence: 0.82,
      reason: "The answer revises the claim by correcting the timeline or deadline relation.",
      contradictionStatus: "resolved_timeline_corrected",
      motiveBoost: "correction_or_clarification",
      motiveWeaken: "strategic_deception",
      hypothesisBoost: "earlier_false_overbroad_or_contextual"
    });
  }

  const motiveAlternative =
    /\balternative explanation\b/.test(lower) ||
    /\bjumped to a motive\b/.test(lower) ||
    /\bphone dying\b/.test(lower) ||
    /\bbeing at work\b/.test(lower) ||
    /\bnot enough evidence\b/.test(lower) && /\bmotive\b/.test(lower);

  if (motiveAlternative) {
    return makeBroadClassification({
      action,
      response,
      evidenceLikeItem,
      classificationType: "motive_alternative_supported",
      confidence: 0.8,
      reason: "The answer preserves a concrete alternative explanation and weakens premature motive certainty.",
      contradictionStatus: "resolved_motive_alternative_supported",
      motiveBoost: "wording_or_scope_shift",
      motiveWeaken: "strategic_deception",
      hypothesisBoost: "claim_incomplete_or_mistaken"
    });
  }

  const certaintyReduction =
    /\bcertainty was too high\b/.test(lower) ||
    /\bmisunderstanding remains possible\b/.test(lower) ||
    /\bonly heard part\b/.test(lower) ||
    /\bheard part\b/.test(lower) ||
    /\btoo certain\b/.test(lower);

  if (certaintyReduction) {
    return makeBroadClassification({
      action,
      response,
      evidenceLikeItem,
      classificationType: "certainty_reduction_after_evidence_gap",
      confidence: 0.82,
      reason: "The answer reduces certainty after admitting limited evidence or perception.",
      contradictionStatus: "resolved_certainty_reduced",
      motiveBoost: "correction_or_clarification",
      motiveWeaken: "strategic_deception",
      hypothesisBoost: "claim_incomplete_or_mistaken"
    });
  }

  const selfSealing =
    /\bself-sealing\b/.test(lower) ||
    /\bself sealing\b/.test(lower) ||
    /\bprotects the belief\b/.test(lower) ||
    /\bprotects itself from correction\b/.test(lower) ||
    /\brefuses correction\b/.test(lower);

  if (selfSealing) {
    return makeBroadClassification({
      action,
      response,
      evidenceLikeItem,
      classificationType: "self_sealing_logic_identified",
      confidence: 0.88,
      reason: "The answer identifies a belief-protecting pattern that treats counterevidence as confirmation.",
      contradictionStatus: "resolved_self_sealing_identified",
      motiveBoost: "strategic_deception",
      motiveWeaken: "memory_error",
      hypothesisBoost: "earlier_false_overbroad_or_contextual"
    });
  }

  return null;
}

function makeBroadClassification({
  action,
  response,
  evidenceLikeItem,
  classificationType,
  confidence,
  reason,
  contradictionStatus,
  motiveBoost,
  motiveWeaken,
  hypothesisBoost
}) {
  return {
    id: makeId("classification"),
    action_id: action.id,
    response_id: response.id,
    evidence_id: evidenceLikeItem.id,
    classification_type: classificationType,
    confidence,
    reason,
    contradiction_status: contradictionStatus,
    effects: [
      {
        target_kind: "motive_type",
        target: motiveBoost,
        delta: 0.22,
        status: "supported_by_broad_action_answer",
        reason: "The answer directly supports this motive/context explanation."
      },
      {
        target_kind: "motive_type",
        target: motiveWeaken,
        delta: -0.08,
        status: "weakened_by_broad_action_answer",
        reason: "The answer makes this motive/context explanation less central."
      },
      {
        target_kind: "hypothesis_type",
        target: hypothesisBoost,
        delta: 0.16,
        status: "supported_by_broad_action_answer",
        reason: "The answer supports this broader hypothesis update."
      },
      {
        target_kind: "earlier_absolute_claim",
        target: "claim_a",
        delta: -0.05,
        status: "weakened_or_narrowed_by_broad_action_answer",
        reason: "The earlier claim should be weakened, narrowed, or contextualized by the later answer."
      }
    ],
    created_at: nowIso()
  };
}

function getContradictionClaimIds(memory, contradictionId) {
  const contradiction = memory.contradictions.find((item) => item.id === contradictionId);
  if (!contradiction) return [];
  return [contradiction.claim_a, contradiction.claim_b].filter(Boolean);
}

function uniqueAppend(list, item) {
  return [...new Set([...(list ?? []), item])];
}
