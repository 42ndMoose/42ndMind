import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PATH = path.resolve(__dirname, "../../data/epistemic_memory.json");

const EMPTY_MEMORY = {
  claims: [],
  evidence: [],
  contradictions: [],
  hypotheses: [],
  inquiryTasks: [],
  beliefUpdates: []
};

export class MemoryStore {
  constructor(filePath = DEFAULT_PATH) {
    this.filePath = filePath;
  }

  async init() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await this.write(EMPTY_MEMORY);
    }
  }

  async read() {
    await this.init();
    const raw = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(raw);
  }

  async write(memory) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(memory, null, 2));
  }

  async reset() {
    await this.write(EMPTY_MEMORY);
  }

  async append(collection, items) {
    const memory = await this.read();
    const nextItems = Array.isArray(items) ? items : [items];
    memory[collection] = [...(memory[collection] ?? []), ...nextItems];
    await this.write(memory);
    return nextItems;
  }

  async storeClaims(claims) {
    return this.append("claims", claims);
  }

  async storeContradictions(contradictions) {
    return this.append("contradictions", contradictions);
  }

  async storeHypotheses(hypotheses) {
    return this.append("hypotheses", hypotheses);
  }

  async storeInquiryTasks(tasks) {
    return this.append("inquiryTasks", tasks);
  }

  async storeBeliefUpdates(updates) {
    return this.append("beliefUpdates", updates);
  }

  async retrieveRelated(claims) {
    const memory = await this.read();
    const subjects = new Set(claims.map((claim) => claim.subject).filter(Boolean));
    const relatedClaims = memory.claims.filter((claim) => subjects.has(claim.subject));

    return {
      claims: relatedClaims,
      contradictions: memory.contradictions.filter((item) => item.status === "unresolved"),
      hypotheses: memory.hypotheses.filter((item) => item.status === "live"),
      inquiryTasks: memory.inquiryTasks.filter((item) => item.status === "open")
    };
  }
}
