import { MemoryStore } from "../memory/memoryStore.js";
import { extractEpistemicSignals } from "../llm/extractorClient.js";
import { detectTensions } from "../cognition/tensionDetector.js";
import { createInquiryTasks } from "../cognition/inquiryPolicy.js";
import { generateHypotheses } from "../cognition/hypothesisGenerator.js";
import { createBeliefUpdates } from "../cognition/beliefUpdater.js";
import { scoreWithPhilosophersStone } from "../stone/philosophersStoneAdapter.js";

export class EpistemicAgent {
  constructor({ memory = new MemoryStore() } = {}) {
    this.memory = memory;
  }

  async process(userInput) {
    const extracted = await extractEpistemicSignals(userInput);
    const relatedMemory = await this.memory.retrieveRelated(extracted.claims);

    const tensions = detectTensions({
      currentClaims: extracted.claims,
      relatedClaims: relatedMemory.claims
    });

    const inquiryTasks = createInquiryTasks(tensions);
    const hypotheses = generateHypotheses({ currentClaims: extracted.claims, tensions });
    const beliefUpdates = createBeliefUpdates({ tensions, inquiryTasks });
    const stoneScore = scoreWithPhilosophersStone({ extracted, tensions, hypotheses });

    await this.memory.storeClaims(extracted.claims);
    await this.memory.storeContradictions(tensions.filter((item) => item.type === "possible_contradiction"));
    await this.memory.storeHypotheses(hypotheses);
    await this.memory.storeInquiryTasks(inquiryTasks);
    await this.memory.storeBeliefUpdates(beliefUpdates);

    return {
      extracted,
      relatedMemory,
      tensions,
      hypotheses,
      inquiryTasks,
      beliefUpdates,
      stoneScore
    };
  }
}
