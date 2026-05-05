import { makeId, nowIso, clamp } from "../runtime/id.js";

/**
 * v0.4 rule-based extractor.
 *
 * This remains intentionally local/no-API, but it recognizes a broader set of
 * epistemic pressure patterns so scenario batches can cover more than the
 * original borrow/return examples.
 */
export async function extractEpistemicSignals(inputText) {
  const text = inputText.trim();
  const lower = text.toLowerCase();

  const claim = parseClaim(text, lower);

  return {
    claims: [claim],
    evidence: [],
    extractor_meta: {
      extractor: "rule_based_toy_v0.4_broad_pressure",
      warning: "Still rule-based. Replace with real LLM extraction later."
    }
  };
}

function parseClaim(text, lower) {
  const hasAbsoluteLanguage = /\b(never|always|everyone|anyone|no one|nobody|nothing|everything|impossible|definitely|certainly|no possible way)\b/i.test(text);

  const claimKind = inferClaimKind(lower);
  const polarity = inferPolarity(lower, claimKind);
  const action = inferAction(lower, claimKind);
  const object = inferObject(lower, claimKind);
  const time = inferTime(lower, claimKind);
  const subject = inferSubject(lower);
  const resolutionClaim = inferResolutionClaim(lower);
  const scope = inferScope({ lower, hasAbsoluteLanguage, claimKind });
  const confidence = inferInitialConfidence({ lower, polarity, hasAbsoluteLanguage, claimKind });

  return {
    id: makeId("claim"),
    text,
    source: "user",
    subject,
    subject_label: object ?? subject ?? "unknown",
    action,
    object,
    time,
    predicate: text,
    polarity,
    scope,
    confidence,
    status: "unverified",
    evidence_count: 0,
    has_absolute_language: hasAbsoluteLanguage,
    resolution_claim: resolutionClaim,
    claim_kind: claimKind,
    created_at: nowIso()
  };
}

function inferClaimKind(lower) {
  if (/\b(anyone|everyone) who disagrees\b/.test(lower) && /\bbrainwashed\b/.test(lower)) return "self_sealing_disagreement_claim";
  if (/\bevidence against\b/.test(lower) && /\b(proves|proof)\b/.test(lower) && /\bbrainwashed\b/.test(lower)) return "self_sealing_counterevidence_claim";
  if (/\bno possible way\b/.test(lower) || /\bimpossible\b/.test(lower) && /\bmisunderstood\b/.test(lower)) return "false_certainty_denial";
  if (/\bonly heard part\b/.test(lower) || /\bheard only part\b/.test(lower)) return "evidence_gap_admission";
  if (/\b(stole|stolen)\b/.test(lower) && /\b(alex|he|she|they)\b/.test(lower)) return "accusation_theft";
  if (/\bfound\b/.test(lower) && /\b(backpack|bag|room|drawer|pocket)\b/.test(lower)) return "recovered_object";
  if (/\bdid nothing wrong\b/.test(lower) || /\bi did not do anything wrong\b/.test(lower)) return "wrongdoing_denial";
  if (/\bdeleted\b/.test(lower) && /\b(messages?|texts?|conversation)\b/.test(lower)) return "reputation_management_admission";
  if (/\bsubmitted\b/.test(lower) && /\bbefore the deadline\b/.test(lower)) return "deadline_compliance_claim";
  if (/\bdeadline was yesterday\b/.test(lower) || /\bafter the deadline\b/.test(lower)) return "deadline_missed_admission";
  if (/\breturned\b/.test(lower) && /\bhalf\b/.test(lower)) return "partial_truth_admission";
  if (/\bpaid back half\b/.test(lower) || /\bpaid half\b/.test(lower)) return "partial_truth_admission";
  if (/\bbecause she hates me\b/.test(lower) || /\bbecause he hates me\b/.test(lower) || /\bbecause they hate me\b/.test(lower)) return "motive_attribution_claim";
  if (/\bphone died\b/.test(lower) || /\bat work\b/.test(lower)) return "alternative_explanation_claim";
  if (/\bhome all night\b/.test(lower)) return "all_night_claim";
  if (/\bleft for\b/.test(lower) && /\bhour\b/.test(lower)) return "absence_admission";
  if (/\bdid not want anyone to know\b/.test(lower) || /\bdidn't want anyone to know\b/.test(lower)) return "concealment_admission";
  if (/\bnot when i first claimed\b/.test(lower) || /\blate\b/.test(lower) && /\breturned\b/.test(lower)) return "timing_correction";
  if (/\bstill in my\b/.test(lower) || /\bstill have\b/.test(lower) || /\bstill has\b/.test(lower)) return "current_possession_after_return_claim";
  return "ordinary_claim";
}

function inferPolarity(lower, claimKind) {
  if ([
    "wrongdoing_denial",
    "false_certainty_denial",
    "all_night_claim"
  ].includes(claimKind)) return "negative";

  if ([
    "partial_truth_admission",
    "reputation_management_admission",
    "deadline_missed_admission",
    "alternative_explanation_claim",
    "evidence_gap_admission",
    "recovered_object",
    "concealment_admission",
    "current_possession_after_return_claim"
  ].includes(claimKind)) return "positive";

  if (/\b(never|did not|didn't|dont|don't|no|not|wasn't|isn't|cannot|can't)\b/.test(lower)) {
    return "negative";
  }

  if (/\b(i borrowed|borrowed|took|stole|did|was|is|actually|returned|paid|submitted|deleted|found|left)\b/.test(lower)) {
    return "positive";
  }

  return "unknown";
}

function inferAction(lower, claimKind) {
  if (claimKind === "wrongdoing_denial") return "deny_wrongdoing";
  if (claimKind === "reputation_management_admission") return "delete";
  if (claimKind === "deadline_compliance_claim" || claimKind === "deadline_missed_admission") return "submit";
  if (claimKind === "accusation_theft") return "accuse_theft";
  if (claimKind === "recovered_object") return "find";
  if (claimKind === "motive_attribution_claim") return "attribute_motive";
  if (claimKind === "alternative_explanation_claim") return "explain_alternative";
  if (claimKind === "false_certainty_denial") return "deny_misunderstanding";
  if (claimKind === "evidence_gap_admission") return "admit_limited_evidence";
  if (claimKind.startsWith("self_sealing")) return "self_seal";
  if (claimKind === "all_night_claim") return "deny_absence";
  if (claimKind === "absence_admission" || claimKind === "concealment_admission") return "admit_absence";
  if (claimKind === "current_possession_after_return_claim") return "possess";
  if (claimKind === "timing_correction") return "correct_timing";
  if (claimKind === "partial_truth_admission") return "partial_repair";

  if (/\bborrowed|borrow\b/.test(lower)) return "borrow";
  if (/\breturned|return\b/.test(lower)) return "return";
  if (/\btook|take\b/.test(lower)) return "take";
  if (/\bstole|steal\b/.test(lower)) return "steal";
  if (/\blied|lie\b/.test(lower)) return "lie";
  if (/\bpaid|pay\b/.test(lower)) return "pay";
  if (/\bsubmitted|submit\b/.test(lower)) return "submit";
  if (/\bdeleted|delete\b/.test(lower)) return "delete";
  if (/\bfound|find\b/.test(lower)) return "find";
  return "assert";
}

function inferObject(lower, claimKind) {
  if (claimKind === "partial_truth_admission" && /\b(paid|pay|repaid|repay)\b/.test(lower)) return "money";
  if (claimKind === "deadline_compliance_claim" || claimKind === "deadline_missed_admission") return "form";
  if (claimKind === "wrongdoing_denial" || claimKind === "reputation_management_admission") return "wrongdoing";
  if (claimKind === "motive_attribution_claim" || claimKind === "alternative_explanation_claim") return "motive";
  if (claimKind === "false_certainty_denial" || claimKind === "evidence_gap_admission") return "understanding";
  if (claimKind.startsWith("self_sealing")) return "belief";
  if (claimKind === "all_night_claim" || claimKind === "absence_admission" || claimKind === "concealment_admission") return "whereabouts";

  if (/\bmoney\b/.test(lower)) return "money";
  if (/\bbook\b/.test(lower)) return "book";
  if (/\bphone\b/.test(lower)) return "phone";
  if (/\bcar\b/.test(lower)) return "car";
  if (/\bkeys?\b/.test(lower)) return "key";
  if (/\bcharger\b/.test(lower)) return "charger";
  if (/\blaptop\b/.test(lower)) return "laptop";
  if (/\bwallet\b/.test(lower)) return "wallet";
  if (/\btoolbox\b/.test(lower)) return "toolbox";
  if (/\bjacket\b/.test(lower)) return "jacket";
  if (/\bmessages?|texts?|conversation\b/.test(lower)) return "message";
  if (/\bform\b/.test(lower)) return "form";
  if (/\breceipt\b/.test(lower)) return "receipt";
  return null;
}

function inferTime(lower, claimKind) {
  if (claimKind === "deadline_compliance_claim") return "before_deadline";
  if (claimKind === "deadline_missed_admission") return "after_deadline";
  if (claimKind === "all_night_claim") return "all_night";
  if (claimKind === "absence_admission") return "one_hour_absence";

  if (/\blast week\b/.test(lower)) return "last_week";
  if (/\byesterday\b/.test(lower)) return "yesterday";
  if (/\btoday\b/.test(lower)) return "today";
  if (/\bthis morning\b/.test(lower)) return "this_morning";
  if (/\blast month\b/.test(lower)) return "last_month";
  if (/\bnever\b/.test(lower)) return "all_time_denial";
  if (/\bcurrently\b|\bstill\b/.test(lower)) return "present";
  return "unspecified";
}

function inferSubject(lower) {
  if (/\balex\b/.test(lower)) return "alex";
  if (/\bi\b/.test(lower)) return "user";
  if (/\bhe\b/.test(lower)) return "he";
  if (/\bshe\b/.test(lower)) return "she";
  if (/\bthey\b/.test(lower)) return "they";
  if (/\banyone\b|\beveryone\b/.test(lower)) return "general_person";
  return "unknown";
}

function inferResolutionClaim(lower) {
  if (/\breturned it\b|\breturned them\b|\breturned the money\b|\breturned the book\b|\breturned the phone\b|\breturned the keys?\b|\balready returned\b|\bbrought it back\b|\bbrought them back\b|\bbrought the car back\b|\breturned\b/.test(lower)) {
    return {
      type: "resolution_or_repair",
      text: "The object was allegedly returned or repaired.",
      action: "return"
    };
  }

  if (/\bpaid it back\b|\balready paid\b|\bpaid back\b/.test(lower)) {
    return {
      type: "resolution_or_repair",
      text: "The debt was allegedly paid back.",
      action: "pay_back"
    };
  }

  return null;
}

function inferScope({ lower, hasAbsoluteLanguage, claimKind }) {
  if (claimKind === "partial_truth_admission") return "partial";
  if (claimKind === "deadline_missed_admission") return "bounded_corrective";
  if (claimKind === "current_possession_after_return_claim") return "present_state";
  return hasAbsoluteLanguage ? "absolute" : "bounded_or_unspecified";
}

function inferInitialConfidence({ lower, polarity, hasAbsoluteLanguage, claimKind }) {
  let confidence = 0.5;

  if (polarity === "negative" && hasAbsoluteLanguage) confidence += 0.24;
  if (/\bactually\b/.test(lower)) confidence += 0.08;
  if (/\bmaybe|might|possibly|i think\b/.test(lower)) confidence -= 0.18;
  if (["false_certainty_denial", "self_sealing_counterevidence_claim", "self_sealing_disagreement_claim"].includes(claimKind)) confidence += 0.2;
  if (["evidence_gap_admission", "alternative_explanation_claim", "partial_truth_admission"].includes(claimKind)) confidence += 0.08;

  return clamp(confidence, 0.05, 0.95);
}
