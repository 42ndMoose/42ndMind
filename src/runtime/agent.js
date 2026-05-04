
import { MemoryStore, getRelatedClaims, summarizeMemory } from "../memory/memoryStore.js";
import { extractEpistemicSignals } from "../llm/extractorClient.js";
import { detectTensions } from "../cognition/tensionDetector.js";
import { createInquiryTasks } from "../cognition/inquiryPolicy.js";
import { generateHypotheses } from "../cognition/hypothesisGenerator.js";
import { generateMotiveModels } from "../cognition/motiveModeler.js";
import { buildInvestigationPlan } from "../cognition/investigationPlanner.js";
import { createNextInvestigationAction, answerInvestigationAction } from "../cognition/investigationActionManager.js";
import { writeTrainingTraces } from "../cognition/trainingTraceExporter.js";
import { writeAlignmentDataset } from "../cognition/alignmentDatasetExporter.js";
import { writePreferenceDataset } from "../cognition/preferenceDatasetExporter.js";
import { validateDatasets } from "../cognition/datasetValidator.js";
import { writeAlignmentBundle } from "../cognition/alignmentBundleExporter.js";
import { auditMemory } from "../cognition/qualityAuditor.js";
import { buildBeliefUpdates, applyConfidenceChanges } from "../cognition/beliefUpdater.js";
import { addEvidenceToMemory } from "../cognition/evidenceManager.js";
import { reviewAllContradictions } from "../cognition/contradictionReview.js";
import { scoreWithPhilosophersStonePlaceholder } from "../stone/philosophersStoneAdapter.js";

export class EpistemicAgent {
  constructor({ memoryPath = "data/epistemic_memory.json" } = {}) {
    this.memory = new MemoryStore(memoryPath);
  }

  async think(inputText) {
    const beforeMemory = await this.memory.read();

    const extracted = await extractEpistemicSignals(inputText);
    const relatedClaims = getRelatedClaims(beforeMemory, extracted.claims);

    const tensions = detectTensions({
      currentClaims: extracted.claims,
      relatedClaims
    });

    const hypotheses = generateHypotheses({
      currentClaims: extracted.claims,
      tensions
    });

    const inquiryTasks = createInquiryTasks(tensions);

    const motiveModels = generateMotiveModels({
      currentClaims: extracted.claims,
      relatedClaims,
      tensions
    });

    const { updates: beliefUpdates, claimConfidenceChanges } = buildBeliefUpdates({
      memory: beforeMemory,
      currentClaims: extracted.claims,
      tensions
    });

    let nextMemory = applyConfidenceChanges(beforeMemory, claimConfidenceChanges);

    const contradictions = tensions.filter((tension) => tension.type.includes("contradiction"));

    const newBatch = {
      claims: extracted.claims,
      evidence: extracted.evidence ?? [],
      tensions,
      contradictions,
      hypotheses,
      inquiryTasks,
      motiveModels,
      beliefUpdates
    };

    for (const [key, items] of Object.entries(newBatch)) {
      nextMemory[key].push(...items);
    }

    await this.memory.write(nextMemory);

    const stoneScore = scoreWithPhilosophersStonePlaceholder({
      claims: extracted.claims,
      tensions,
      contradictions,
      hypotheses,
      inquiryTasks,
      motiveModels
    });

    return {
      input: inputText,
      extracted,
      relatedClaims,
      tensions,
      contradictions,
      hypotheses,
      inquiryTasks,
      motiveModels,
      beliefUpdates,
      claimConfidenceChanges,
      stoneScore,
      summary: summarizeMemory(nextMemory),
      memoryPath: this.memory.filePath
    };
  }

  async addEvidence({ claimSelector, direction, text, strength = null }) {
    const beforeMemory = await this.memory.read();

    const nextMemory = addEvidenceToMemory({
      memory: beforeMemory,
      claimSelector,
      direction,
      text,
      strength
    });

    await this.memory.write(nextMemory);

    return {
      added: nextMemory.evidence.at(-1),
      updatedClaim: claimSelector === "latest"
        ? nextMemory.claims.at(-1)
        : nextMemory.claims.find((claim) => claim.id === claimSelector),
      summary: summarizeMemory(nextMemory),
      memoryPath: this.memory.filePath
    };
  }

  async review() {
    const beforeMemory = await this.memory.read();
    const nextMemory = reviewAllContradictions(beforeMemory);
    await this.memory.write(nextMemory);

    return {
      summary: summarizeMemory(nextMemory),
      memory: nextMemory
    };
  }

  async plan() {
    const beforeMemory = await this.memory.read();
    const plan = buildInvestigationPlan(beforeMemory);

    const nextMemory = {
      ...beforeMemory,
      investigationPlans: [...(beforeMemory.investigationPlans ?? []), plan]
    };

    await this.memory.write(nextMemory);

    return {
      plan,
      summary: summarizeMemory(nextMemory),
      memoryPath: this.memory.filePath
    };
  }

  async next() {
    const beforeMemory = await this.memory.read();
    const result = createNextInvestigationAction(beforeMemory);
    await this.memory.write(result.memory);

    return {
      action: result.action,
      reason: result.reason,
      summary: summarizeMemory(result.memory),
      memoryPath: this.memory.filePath
    };
  }

  async answer({ actionSelector = "latest", answerText }) {
    const beforeMemory = await this.memory.read();
    const result = answerInvestigationAction({
      memory: beforeMemory,
      actionSelector,
      answerText
    });

    await this.memory.write(result.memory);

    return {
      response: result.response,
      evidenceLikeItem: result.evidenceLikeItem,
      classification: result.classification,
      summary: summarizeMemory(result.memory),
      memoryPath: this.memory.filePath
    };
  }

  async exportTraces({ outputPath = "data/training_traces.local.jsonl" } = {}) {
    const memory = await this.memory.read();
    const result = await writeTrainingTraces({
      memory,
      outputPath
    });

    return {
      outputPath: result.outputPath,
      count: result.count,
      traceTypes: result.traces.map((trace) => trace.trace_type),
      summary: summarizeMemory(memory)
    };
  }

  async exportAlignment({ outputPath = "data/alignment_sft.local.jsonl", manifestPath = "data/alignment_manifest.local.json" } = {}) {
    const memory = await this.memory.read();
    const result = await writeAlignmentDataset({
      memory,
      outputPath,
      manifestPath
    });

    return {
      ...result,
      summary: summarizeMemory(memory)
    };
  }

  async exportPreferences({ outputPath = "data/preference_pairs.local.jsonl", manifestPath = "data/preference_manifest.local.json" } = {}) {
    const memory = await this.memory.read();
    const result = await writePreferenceDataset({
      memory,
      outputPath,
      manifestPath
    });

    return {
      ...result,
      summary: summarizeMemory(memory)
    };
  }

  async validateDatasets({
    sftPath = "data/alignment_sft.local.jsonl",
    preferencePath = "data/preference_pairs.local.jsonl",
    reportPath = "data/dataset_validation_report.local.json"
  } = {}) {
    return validateDatasets({
      sftPath,
      preferencePath,
      reportPath
    });
  }

  async exportBundle({ bundleDir = "data/42ndAlignment_bundle.local" } = {}) {
    const memory = await this.memory.read();
    const result = await writeAlignmentBundle({
      memory,
      bundleDir
    });

    return {
      ...result,
      summary: summarizeMemory(memory)
    };
  }

  async audit({ reportPath = "data/quality_audit.local.json" } = {}) {
    const memory = await this.memory.read();
    const report = await auditMemory({
      memory,
      reportPath
    });

    return {
      ...report,
      reportPath,
      summary: summarizeMemory(memory)
    };
  }

  async inspect() {
    const memory = await this.memory.read();
    return {
      summary: summarizeMemory(memory),
      memory
    };
  }

  async reset() {
    await this.memory.reset();
    return this.inspect();
  }
}
