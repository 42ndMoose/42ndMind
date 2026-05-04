
import { makeId, nowIso } from "../runtime/id.js";

export function createInquiryTasks(tensions) {
  return tensions.map((tension) => {
    if (tension.type === "direct_contradiction_absolute_denial_broken") {
      return task(
        tension,
        "What changed between the earlier absolute denial and the later admission? Was the earlier claim false, mistaken, incomplete, or using different wording?"
      );
    }

    if (tension.type === "possible_contradiction") {
      return task(
        tension,
        "What evidence, timeline, definition, or motive would resolve this contradiction?"
      );
    }

    if (tension.type === "unsupported_confidence") {
      return task(
        tension,
        "What evidence supports this claim, and what evidence would weaken it?"
      );
    }

    if (tension.type === "absolute_language") {
      return task(
        tension,
        "What is the exact scope of this claim, and are there exceptions?"
      );
    }

    return task(
      tension,
      "What missing context would make this claim more stable?"
    );
  });
}

function task(tension, question) {
  return {
    id: makeId("task"),
    reason: tension.description,
    question,
    priority: tension.severity,
    status: "open",
    related_tension: tension.id,
    created_at: nowIso()
  };
}
