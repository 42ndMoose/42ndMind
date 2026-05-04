import { makeId, nowIso } from "../runtime/id.js";

export function createInquiryTasks(tensions) {
  return tensions.map((tension) => {
    if (tension.type === "possible_contradiction") {
      return {
        id: makeId("task"),
        reason: tension.description,
        question: "What evidence, timeline, definition, or motive would resolve this contradiction?",
        priority: tension.severity,
        status: "open",
        created_at: nowIso()
      };
    }

    if (tension.type === "unsupported_confidence") {
      return {
        id: makeId("task"),
        reason: tension.description,
        question: "What evidence supports this claim, and what evidence would weaken it?",
        priority: tension.severity,
        status: "open",
        created_at: nowIso()
      };
    }

    if (tension.type === "absolute_language") {
      return {
        id: makeId("task"),
        reason: tension.description,
        question: "What is the exact scope of this claim, and are there exceptions?",
        priority: tension.severity,
        status: "open",
        created_at: nowIso()
      };
    }

    return {
      id: makeId("task"),
      reason: tension.description,
      question: "What missing context would make this belief more stable?",
      priority: tension.severity ?? 0.5,
      status: "open",
      created_at: nowIso()
    };
  });
}
