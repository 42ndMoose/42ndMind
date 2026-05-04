
# Architecture

42ndMind is the runtime shell.

Current v0.3 loop:

```text
input
→ toy extractor
→ persistent memory lookup
→ tension detection
→ hypothesis generation
→ inquiry task creation
→ belief update / confidence revision
→ memory write
→ optional evidence intake
→ evidence-based confidence revision
→ contradiction-aware evidence propagation
→ contradiction review
→ visible report
```

Later loop:

```text
input
→ LLM structured extractor
→ persistent epistemic memory
→ contradiction/tension detector
→ inquiry policy
→ tool/search action
→ evidence intake
→ belief updater
→ optional Philosopher's Stone scoring
→ LoRA-loaded answer/report model
```
