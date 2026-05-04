# 42ndMind Architecture

42ndMind is an agent runtime shell, not a deterministic graph instrument.

## Layers

1. Base LLM or LoRA-loaded LLM
2. Epistemic extractor
3. Persistent epistemic memory
4. Tension detector
5. Inquiry policy
6. Hypothesis generator
7. Belief updater
8. Optional Philosopher's Stone adapter
9. User-facing report

## Main loop

```text
input
→ extract claims
→ retrieve related memory
→ detect tensions
→ generate hypotheses
→ create inquiry tasks
→ update memory
→ optionally score with Epistemic Octahedron math
→ answer/report
```
