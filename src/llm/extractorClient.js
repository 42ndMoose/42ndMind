import { makeId, nowIso } from "../runtime/id.js";

const ABSOLUTE_WORDS = /\b(always|never|everyone|nobody|impossible|definitely|certainly|obviously)\b/i;
const NEGATION_WORDS = /\b(no|not|never|didn't|didnt|don't|dont|isn't|isnt|wasn't|wasnt|cannot|can't|cant)\b/i;

function crudeSubject(text) {
  const lower = text.toLowerCase();
  if (lower.includes("money")) return "money";
  if (lower.includes("lie") || lower.includes("lied") || lower.includes("lying")) return "lying";
  if (lower.includes("borrow")) return "borrowing";
  if (lower.includes("return")) return "returning";
  const words = lower.match(/[a-z0-9']+/g) ?? [];
  return words.slice(0, 4).join(" ") || "general_claim";
}

function crudePolarity(text) {
  return NEGATION_WORDS.test(text) ? "negative" : "positive";
}

export async function extractEpistemicSignals(userInput) {
  const text = userInput.trim();

  return {
    claims: [
      {
        id: makeId("claim"),
        text,
        source: "user",
        subject: crudeSubject(text),
        predicate: text,
        polarity: crudePolarity(text),
        confidence: ABSOLUTE_WORDS.test(text) ? 0.74 : 0.5,
        status: "unverified",
        evidence_count: 0,
        has_absolute_language: ABSOLUTE_WORDS.test(text),
        created_at: nowIso()
      }
    ],
    notes: [
      "v0.1 extractor is heuristic. Replace this with your LLM extraction contract later."
    ]
  };
}
