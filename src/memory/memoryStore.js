
import fs from "node:fs/promises";
import path from "node:path";

export const EMPTY_MEMORY = {
  claims: [],
  evidence: [],
  tensions: [],
  contradictions: [],
  hypotheses: [],
  inquiryTasks: [],
  motiveModels: [],
  investigationPlans: [],
  investigationActions: [],
  actionAnswerClassifications: [],
  beliefUpdates: []
};

export class MemoryStore {
  constructor(filePath = "data/epistemic_memory.json") {
    this.filePath = filePath;
  }

  async ensure() {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.write(structuredClone(EMPTY_MEMORY));
    }
  }

  normalize(memory) {
    return {
      ...structuredClone(EMPTY_MEMORY),
      ...memory,
      claims: memory.claims ?? [],
      evidence: memory.evidence ?? [],
      tensions: memory.tensions ?? [],
      contradictions: memory.contradictions ?? [],
      hypotheses: memory.hypotheses ?? [],
      inquiryTasks: memory.inquiryTasks ?? [],
      motiveModels: memory.motiveModels ?? [],
      investigationPlans: memory.investigationPlans ?? [],
      investigationActions: memory.investigationActions ?? [],
      actionAnswerClassifications: memory.actionAnswerClassifications ?? [],
      beliefUpdates: memory.beliefUpdates ?? []
    };
  }

  async read() {
    await this.ensure();
    const raw = await fs.readFile(this.filePath, "utf8");
    return this.normalize(JSON.parse(raw));
  }

  async write(memory) {
    const normalized = this.normalize(memory);
    await fs.writeFile(this.filePath, JSON.stringify(normalized, null, 2) + "\n", "utf8");
  }

  async reset() {
    await this.write(structuredClone(EMPTY_MEMORY));
  }
}

export function getRelatedClaims(memory, extractedClaims) {
  const related = [];

  for (const newClaim of extractedClaims) {
    for (const oldClaim of memory.claims) {
      if (oldClaim.id === newClaim.id) continue;

      const sameObject =
        oldClaim.object &&
        newClaim.object &&
        oldClaim.object.toLowerCase() === newClaim.object.toLowerCase();

      const sameSubject =
        oldClaim.subject &&
        newClaim.subject &&
        oldClaim.subject.toLowerCase() === newClaim.subject.toLowerCase();

      const sameAction =
        oldClaim.action &&
        newClaim.action &&
        oldClaim.action.toLowerCase() === newClaim.action.toLowerCase();

      const sameLooseSubject =
        oldClaim.subject_label &&
        newClaim.subject_label &&
        oldClaim.subject_label.toLowerCase() === newClaim.subject_label.toLowerCase();

      if (sameObject || (sameSubject && sameAction) || sameLooseSubject) {
        related.push(oldClaim);
      }
    }
  }

  return related;
}

export function summarizeMemory(memory) {
  return {
    claims: memory.claims.length,
    evidence: memory.evidence.length,
    tensions: memory.tensions.length,
    contradictions: memory.contradictions.length,
    hypotheses: memory.hypotheses.length,
    openInquiryTasks: memory.inquiryTasks.filter((task) => task.status === "open").length,
    motiveModels: memory.motiveModels.length,
    investigationPlans: memory.investigationPlans.length,
    openInvestigationActions: memory.investigationActions.filter((action) => action.status === "open").length,
    actionAnswerClassifications: memory.actionAnswerClassifications.length,
    beliefUpdates: memory.beliefUpdates.length
  };
}
