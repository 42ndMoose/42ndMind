import { makeId, nowIso } from "../runtime/id.js";

export function createBeliefUpdates({ tensions, inquiryTasks }) {
  if (tensions.length === 0) {
    return [
      {
        id: makeId("update"),
        before: "No current memory update recorded.",
        after: "Stored new claim without detected contradiction.",
        reason: "No significant epistemic tension detected in this pass.",
        epistemic_delta: "memory_extended",
        created_at: nowIso()
      }
    ];
  }

  return [
    {
      id: makeId("update"),
      before: "New input could be accepted naively as settled.",
      after: "New input is stored with unresolved tensions and inquiry tasks.",
      reason: `${tensions.length} tension(s) produced ${inquiryTasks.length} inquiry task(s).`,
      epistemic_delta: "reduced_naive_acceptance",
      created_at: nowIso()
    }
  ];
}
