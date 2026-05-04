#!/usr/bin/env node
import { EpistemicAgent } from "./runtime/agent.js";
import { MemoryStore } from "./memory/memoryStore.js";

const args = process.argv.slice(2);
const memory = new MemoryStore();

if (args.includes("--reset")) {
  await memory.reset();
  console.log("42ndMind memory reset.");
  process.exit(0);
}

const input = args.join(" ").trim();

if (!input) {
  console.log("Usage: npm run think -- \"Your claim or situation here\"");
  process.exit(1);
}

const agent = new EpistemicAgent({ memory });
const result = await agent.process(input);

console.log(JSON.stringify({
  input,
  stored_claims: result.extracted.claims,
  tensions: result.tensions,
  live_hypotheses: result.hypotheses,
  inquiry_tasks: result.inquiryTasks,
  belief_updates: result.beliefUpdates,
  stone: result.stoneScore
}, null, 2));
