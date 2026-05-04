
export function summarizeContradictions(tensions) {
  return tensions
    .filter((tension) => tension.type.includes("contradiction"))
    .map((tension) => ({
      id: tension.id,
      type: tension.type,
      severity: tension.severity,
      description: tension.description,
      reason: tension.contradiction_reason ?? tension.reason ?? "No reason supplied."
    }));
}
