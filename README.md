# 42ndMind

Persistent epistemic memory + investigative runtime shell for an Epistemic Octahedron-aligned agent.

This repo is separate from:

- `philosophers-stone`: deterministic instrument / graph profiler / extractor contract
- `42ndAlignment`: SFT / LoRA / training lab
- `42ndMind`: runtime memory, tension detection, inquiry policy, belief updates

## MVP goal

The first milestone is intentionally small:

> Remember claims, compare new claims against prior memory, detect possible contradiction or unsupported confidence, keep hypotheses alive, and create inquiry tasks instead of blindly accepting statements.

## Quick start

```bash
npm install
npm run think -- "I never borrowed the money."
npm run think -- "Actually, I borrowed it last week but already returned it."
npm run demo
```

No external dependencies are required for v0.1. Memory is stored in `data/epistemic_memory.json`.

## Current status

This is not yet a full AI agent. It is the runtime skeleton for the epistemic memory loop. The LLM client and Philosopher's Stone adapter are currently stubs/interfaces.
