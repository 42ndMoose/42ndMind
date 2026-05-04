
import { makeId, nowIso, clamp } from "../runtime/id.js";

/**
 * v0.3 toy extractor.
 *
 * This is intentionally rule-based so the runtime can be tested without an API key or GPU.
 * Later, replace this file with a structured LLM extractor.
 */
export async function extractEpistemicSignals(inputText) {
  const text = inputText.trim();
  const lower = text.toLowerCase();

  const claim = parseClaim(text, lower);

  return {
    claims: [claim],
    evidence: [],
    extractor_meta: {
      extractor: "rule_based_toy_v0.3",
      warning: "Replace with real LLM extraction later."
    }
  };
}

function parseClaim(text, lower) {
  const hasAbsoluteLanguage = /\b(never|always|everyone|no one|nobody|nothing|everything|impossible|definitely|certainly)\b/i.test(text);

  const polarity = inferPolarity(lower);
  const action = inferAction(lower);
  const object = inferObject(lower);
  const time = inferTime(lower);
  const subject = inferSubject(lower);
  const resolutionClaim = inferResolutionClaim(lower);
  const scope = hasAbsoluteLanguage ? "absolute" : "bounded_or_unspecified";
  const confidence = inferInitialConfidence({ lower, polarity, hasAbsoluteLanguage });

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
    created_at: nowIso()
  };
}

function inferPolarity(lower) {
  if (/\b(never|did not|didn't|dont|don't|no|not|wasn't|isn't|cannot|can't)\b/.test(lower)) {
    return "negative";
  }

  if (/\b(i borrowed|borrowed|took|stole|did|was|is|actually)\b/.test(lower)) {
    return "positive";
  }

  return "unknown";
}

function inferAction(lower) {
  if (/\bborrowed|borrow\b/.test(lower)) return "borrow";
  if (/\breturned|return\b/.test(lower)) return "return";
  if (/\btook|take\b/.test(lower)) return "take";
  if (/\bstole|steal\b/.test(lower)) return "steal";
  if (/\blied|lie\b/.test(lower)) return "lie";
  if (/\bpaid|pay\b/.test(lower)) return "pay";
  return "assert";
}

function inferObject(lower) {
  if (/\bmoney\b/.test(lower)) return "money";
  if (/\bbook\b/.test(lower)) return "book";
  if (/\bphone\b/.test(lower)) return "phone";
  if (/\bcar\b/.test(lower)) return "car";
  if (/\bkeys?\b/.test(lower)) return "key";
  if (/\breceipt\b/.test(lower)) return "receipt";
  return null;
}

function inferTime(lower) {
  if (/\blast week\b/.test(lower)) return "last_week";
  if (/\byesterday\b/.test(lower)) return "yesterday";
  if (/\btoday\b/.test(lower)) return "today";
  if (/\blast month\b/.test(lower)) return "last_month";
  if (/\bnever\b/.test(lower)) return "all_time_denial";
  return "unspecified";
}

function inferSubject(lower) {
  if (/\bi\b/.test(lower)) return "user";
  if (/\bhe\b/.test(lower)) return "he";
  if (/\bshe\b/.test(lower)) return "she";
  if (/\bthey\b/.test(lower)) return "they";
  return "unknown";
}

function inferResolutionClaim(lower) {
  if (/\breturned it\b|\breturned them\b|\breturned the money\b|\breturned the book\b|\breturned the phone\b|\breturned the keys?\b|\balready returned\b|\bbrought it back\b|\bbrought them back\b|\bbrought the car back\b/.test(lower)) {
    return {
      type: "resolution_or_repair",
      text: "The object was allegedly returned.",
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

function inferInitialConfidence({ lower, polarity, hasAbsoluteLanguage }) {
  let confidence = 0.5;

  if (polarity === "negative" && hasAbsoluteLanguage) confidence += 0.24;
  if (/\bactually\b/.test(lower)) confidence += 0.08;
  if (/\bmaybe|might|possibly|i think\b/.test(lower)) confidence -= 0.18;

  return clamp(confidence, 0.05, 0.95);
}
