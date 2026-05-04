import { MemoryStore } from "../src/memory/memoryStore.js";
import { EpistemicAgent } from "../src/runtime/agent.js";

const memory = new MemoryStore("data/demo_memory.local.json");
await memory.reset();

const agent = new EpistemicAgent({ memory });

const inputs = [
  "I never borrowed the money.",
  "Actually, I borrowed the money last week but already returned it."
];

for (const input of inputs) {
  const result = await agent.process(input);
  console.log("\nINPUT:", input);
  console.log("TENSIONS:", result.tensions.map((t) => t.type));
  console.log("TASKS:", result.inquiryTasks.map((t) => t.question));
}
