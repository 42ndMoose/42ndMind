# 42ndMind Current Progress

This file is the handoff record for continuing work toward the README goal: a transparent, meaning-based epistemic system governed by the Epistemic Octahedron.

Last updated: **2026-05-10**.

## Current short status

42ndMind is now an early browser-based belief-state engine, not just a static concept page. It has:

- live Epistemic Octahedron math
- browser kernel state
- scoped graph nodes
- contradiction pressure
- low-signal quarantine
- audit pressure
- benchmark packets
- claim-challenge workflow
- dossier source-graph importer
- pending-command handoff into the live brain
- imported source trace in the live brain packet/UI
- persisted `sourceTraces` in live kernel state
- source-trace explanation bridge for LLM-facing summaries
- source-trace bridge smoke test
- deterministic local explanation preview
- ordinary LLM comparison harness for Milestone 12
- ordinary LLM comparison smoke test
- M12 comparison report saver/index
- refreshed README status for the current v0.3 stack
- limited M12-M15 milestone closer harness

It is still not a full truth machine. It cannot independently verify external facts without a retrieval/source layer or user-supplied evidence.

## Main live entry points

- `llm-brain-v0-3.html` is the main patched live brain console.
- `goal-runner.html` runs benchmark, milestone, sandbox, and compression reports and links to the ordinary LLM comparison harness.
- `ordinary-llm-comparison.html` compares pasted generic/prompt-only LLM outputs against kernel-guided benchmark behavior and links to the M12 report index.
- `ordinary-llm-comparison-test.html` runs the ordinary LLM comparison smoke test.
- `m12-comparison-report-index.html` saves copied M12 comparison packets in localStorage and exports an aggregate evidence packet.
- `claim-challenge.html` challenges external claims and exports optional kernel commands.
- `claim-challenge-test.html` runs the claim-challenge smoke test.
- `dossier-source-graph.html` imports curated dossier packets into typed source-graph pressure and can send a kernel command to the live brain.
- `dossier-source-graph-test.html` runs the dossier source-graph smoke test.
- `source-trace-bridge.html` reads persisted source traces and produces read-only LLM explanation packets/prompts plus a local explanation preview.
- `source-trace-bridge-test.html` runs the source-trace bridge smoke test.
- `milestone-closer.html` runs the limited M12-M15 harness.
- `belief-graph.html` is the graph view.
- `index.html` remains available as an older human-facing kernel UI, but it is no longer the primary active console.

## Main implementation files

- `src/epistemic-kernel-v0-2.js`: base browser kernel.
- `src/epistemic-kernel-v0-2-patches.js`: low-signal quarantine and unresolved-contradiction audit patch layer.
- `src/epistemic-benchmark-v0-1.js`: fixed benchmark cases, sandbox overlay runner, milestone status, and memory compression helpers.
- `src/claim-challenge-v0-1.js`: claim-challenge workflow.
- `src/dossier-source-graph-v0-1.js`: dossier source-graph importer and kernel-command exporter.

## Confirmed stable pieces

### M12 report saver/index

`m12-comparison-report-index.html` now exists.

It lets the user:

- paste copied `42ndMind_ordinary_llm_comparison_packet` reports
- validate the packet type
- save reports into localStorage
- list saved reports by case id, timestamp, best lane, score split, and whether real generic/prompt-only outputs appear present
- export all reports as a single `42ndMind_m12_comparison_report_index` packet
- copy the aggregate export packet
- clear saved local reports

It does not claim M12 is passed. Its aggregate export includes the honesty note:

```text
This index stores comparison reports. M12 is not passed unless real generic and prompt-only LLM outputs are present and kernel-guided analysis outperforms them across the benchmark criteria.
```

`ordinary-llm-comparison.html` now links to `m12-comparison-report-index.html`.

This is the final M12 scaffolding step unless real external LLM comparison outputs are being collected.

### README status refresh

`README.md` was refreshed to reflect the current v0.3 stack.

The README now states:

- `llm-brain-v0-3.html` is the current main console.
- `index.html` is older and no longer the primary active console.
- current active pages include the goal runner, ordinary LLM comparison harness/test, claim challenge/test, dossier source graph/test, source-trace bridge/test, milestone closer, and graph view.
- current active implementation files include `src/epistemic-kernel-v0-2.js`, `src/epistemic-kernel-v0-2-patches.js`, `src/epistemic-benchmark-v0-1.js`, `src/claim-challenge-v0-1.js`, and `src/dossier-source-graph-v0-1.js`.
- stable smoke checks include benchmark `10 / 10`, dossier source graph behavior, source-trace bridge guardrails, and ordinary LLM comparison harness shape.
- M12, M13, and M14 now include current implementation notes.
- next immediate tasks now focus on real LLM comparison packets, M12 report saving/indexing, retrieval/source schema, natural-language approval loop, deeper source traces, richer philosophical text ingestion, sandboxed self-improvement, and selected `profiler.js` math.

### Kernel and benchmark

Latest copied browser packets confirmed:

- patch status loaded: `v02_patches_applied = true`
- `low_signal_guard = patched`
- `contradiction_audit = patched`
- benchmark score: `10 / 10`
- failed cases: `0`
- active Octahedron states preserve `|x| + |y| + |z| = 1`
- null origin stays separate from active surface states

The live brain still often contains the sample unresolved timeline contradiction:

- Claim A: `I submitted the form before the deadline.`
- Claim B: `Actually, I submitted it this morning, but the deadline was yesterday.`

This is intentional test material. The audit correctly flags positive root-y as suspicious while unresolved contradiction remains active.

### Ordinary LLM comparison harness

`ordinary-llm-comparison.html` now exists for README Milestone 12.

It does not call external models and does not pretend to prove superiority from placeholders. It provides a visible comparison harness where real model outputs can be pasted and scored.

It supports:

- selecting any fixed `EpistemicBenchmark.CASES` case
- copying a generic LLM prompt
- copying a prompt-only epistemic LLM prompt
- filling a kernel-guided output from the benchmark case result
- scoring all three outputs against visible epistemic-pressure criteria
- exporting a `42ndMind_ordinary_llm_comparison_packet`

The scoring rubric covers:

- contradiction detection
- evidence separation
- motive calibration
- scope control
- self-sealing detection
- belief update accuracy
- unresolved-pressure preservation

The packet includes an honesty note:

```text
This does not call external models and does not prove superiority unless real model outputs are pasted and preserved.
```

`ordinary-llm-comparison-test.html` now exists and checks:

- benchmark cases loaded
- selected case comes from benchmark
- comparison packet type/version
- honesty note present
- three score lanes
- max score matches rubric
- all seven rubric criteria are present
- kernel result is included
- kernel-guided output is nonempty and scores nonzero
- generic and prompt-only outputs are scoreable
- best label is valid
- doctrine flags preserve first-principles, kernel-owned belief movement, LLM-output-as-observed-behavior, contradiction-not-resolution, unresolved pressure, and no self-promotion

This turns Milestone 12 from a vague claim into a reproducible comparison workflow.

### Claim challenge

`claim-challenge-test.html` passed:

- self-sealing classification
- motive-overclaim classification
- contradiction classification
- null origin on no-claim input
- active states preserve the Octahedron surface equation
- optional kernel command packet output

The claim-challenge page exports both:

- full report packet
- `epistemic_kernel_command`

### Dossier source graph

`dossier-source-graph-test.html` now uses `src/dossier-source-graph-v0-1.js?v=0.1.3` and includes a 12-check smoke/regression test:

- has fact
- has inference
- has interpretation
- has hypothesis
- has evidence
- has counter-consideration
- prevents automatic truth merge
- has unresolved pressure
- root blocks direct merge
- kernel command omits observations
- counter-considerations export as attacking evidence
- metadata records counter-consideration export mode

`dossier-source-graph.html` can now:

- load sample dossier packet
- import pasted dossier packet JSON
- output a `42ndMind_dossier_source_graph_report`
- output an `epistemic_kernel_command`
- save the command to localStorage through `SEND to live brain`

`llm-brain-v0-3.html` can now:

- detect `localStorage["42ndMind_pending_kernel_command"]`
- auto-load or manually load it with `LOAD pending command`
- run it with `IMPORT / RUN`
- clear the pending command after import
- show a read-only `Imported source trace` panel
- include `source_trace_summary` in the copied brain packet
- persist the same trace into `kernel_state.sourceTraces`
- link to `source-trace-bridge.html`

### Source trace bridge

`source-trace-bridge.html` now:

- reads persisted `kernel_state.sourceTraces` from local browser state
- produces a `42ndMind_source_trace_explanation_packet`
- produces a copyable LLM explanation prompt
- shows a compact trace summary
- shows a deterministic local explanation preview
- has `COPY local preview`
- links to `source-trace-bridge-test.html`

`source-trace-bridge-test.html` now exists and checks:

- packet type
- one source trace
- claims count 4
- evidence count 7
- attacking evidence count 3
- observations 0
- linked claims preserved
- linked evidence preserved
- attacking rows separated
- open pressure visible
- first-principles flag
- Octahedron active surface rule
- contradiction detection is not contradiction resolution
- no rule self-promotion
- explain-only guardrail
- no-mutation guardrail
- provenance-is-not-proof guardrail
- LLM-is-interface guardrail
- prompt blocks mutation
- prompt blocks truth promotion

## Latest important change: M12 report saver/index

`m12-comparison-report-index.html` was added as the final local M12 evidence-storage scaffold.

This matters because M12 should not stay as a one-off manual page test. Real generic/prompt-only LLM outputs need to be collected as comparison reports and exported as an aggregate packet if the project later claims M12 progress.

The index deliberately keeps M12 conservative:

- empty/fixture reports do not count as real-output reports
- the aggregate packet reports `m12_status: "not_yet_claimable"` until real generic and prompt-only LLM outputs are present
- the index treats benchmark outputs as evidence, not proof by themselves
- doctrine flags preserve first-principles, kernel-owned belief movement, LLM-output-as-observed-behavior, no rule self-promotion, and no M12 pass claim without real outputs

## README status refresh

`README.md` now reflects the current active project state instead of the older original v0/index flow.

The refresh was intentionally scoped. It updated:

- current status
- current active pages
- active implementation files
- stable smoke checks
- what the prototype does now
- how to use the active v0.3 stack
- current limitations
- current proof claims and non-proof claims
- M0, M12, M13, and M14 implementation notes
- next immediate tasks

It did not rewrite the core theory sections or the full roadmap.

## Ordinary LLM comparison smoke test

`ordinary-llm-comparison-test.html` was added as a deterministic smoke test for the Milestone 12 comparison harness.

It uses a fixture comparison packet and checks packet shape, rubric shape, scoring lanes, honesty note, kernel benchmark linkage, and doctrine guardrails.

This test does not replace real model comparisons. It only verifies that the comparison harness itself is structurally sane before real generic/prompt-only LLM outputs are pasted.

## Ordinary LLM comparison harness

`ordinary-llm-comparison.html` was added as the first real Milestone 12 comparison harness.

It is intentionally conservative. It does not claim that kernel-guided analysis beats ordinary LLMs unless actual ordinary LLM outputs are pasted into the page and scored against the rubric.

It creates a comparison packet with:

- case metadata
- kernel benchmark result
- generic LLM output score
- prompt-only epistemic LLM output score
- kernel-guided output score
- visible per-criterion hits
- pasted outputs
- doctrine flags saying LLM outputs are observed behavior, not truth

This keeps the project first-principles: the benchmark measures belief-movement behavior rather than polished wording.

## Local source-trace explanation preview

`source-trace-bridge.html` generates a deterministic local explanation preview from the same source-trace packet it gives to the LLM.

This preview is intentionally not an LLM answer and not a belief update. It is a local, auditable summary of the imported source trace.

It explains:

- what source/import entered the kernel
- how many claims, evidence rows, attacking evidence rows, open questions, and observations came in
- that the import created provenance and pressure, not automatic truth
- the support/attack split
- live counter-considerations
- unresolved pressure
- the guardrail that an LLM may explain but must not mutate state, promote coherence into truth, flatten counter-considerations, or propose rule promotion without user approval

`source-trace-bridge.html` packet version is now `0.1.1`.

## Source-trace explanation bridge

`source-trace-bridge.html` was added as a read-only LLM interface bridge.

It reads persisted `kernel_state.sourceTraces` from local browser state and produces:

- a `42ndMind_source_trace_explanation_packet`
- a copyable LLM explanation prompt
- a compact trace summary
- a local explanation preview

The bridge is intentionally not a belief engine. It does not mutate kernel state, change confidence, alter gates, resolve contradictions, promote rules, or touch the root worldview. It prepares a controlled explanation packet so an LLM can explain source provenance and unresolved pressure without becoming the brain.

The bridge packet includes doctrine flags:

- first-principles mode
- Epistemic Octahedron consistency
- null origin preserved
- active surface rule preserved
- unresolved pressure remains visible
- contradiction detection is not contradiction resolution
- no rule self-promotion

It also tells the LLM to:

- explain imported sources and pressure
- separate claims from evidence
- separate supporting evidence from attacking evidence
- preserve counter-considerations
- describe unresolved questions as unresolved pressure
- avoid treating dossier coherence as automatic truth
- avoid inventing missing validation
- frame any belief change as a proposed kernel command requiring user approval

This directly supports the README architecture: the kernel owns belief movement, and the LLM is the interface/explanation layer.

## Persisted imported source traces

`llm-brain-v0-3.html` persists imported-source traces into live kernel state as `sourceTraces`.

This is still deliberately non-scoring metadata. It does not alter claim confidence, gates, semantic coordinates, contradiction handling, or root worldview movement.

The trace is built from existing `structured_packet_imported` events and stored during refresh/brain-packet export. Each trace reports:

- source title/kind
- import time
- event id
- claim count
- evidence count
- attacking evidence count
- open question count
- observation count
- source links found in imported evidence rows
- claim ids and evidence ids created by that import
- metadata saying the trace is read-only, persisted in kernel state, and grouped from the event log

The first browser verification showed a clean dossier trace with:

```json
{
  "claims": 4,
  "evidence": 7,
  "attacking_evidence": 3,
  "open_questions": 6,
  "observations": 0
}
```

This is the first persistent source-provenance step toward README Milestones 13 and 14: the kernel can now carry import provenance as state while still keeping source provenance separate from truth promotion and belief movement.

## Dossier source graph v0.1.3 note

`src/dossier-source-graph-v0-1.js` is now at:

```text
VERSION = 0.1.3
```

Why this matters:

Earlier v0.1.2 exported dossier counter-considerations as `observations`. The kernel treats observations as low-signal by design and creates questions like:

```text
Clarify low-signal input before treating it as belief: ...
```

That was noisy for structured dossier imports.

v0.1.3 fixes this at the source:

- counter-considerations now export as `evidence` with `relation: "attacks"`
- dossier kernel command exports `observations: []`
- explicit open questions preserve unresolved pressure
- metadata records `counter_considerations_exported_as_attacking_evidence: true`
- metadata records `observations_omitted_to_avoid_low_signal_question_noise: true`

`dossier-source-graph.html` and `dossier-source-graph-test.html` are cache-busted to load:

```html
<script src="src/dossier-source-graph-v0-1.js?v=0.1.3"></script>
```

## Latest clean browser packet note

A clean reset test was run on 2026-05-09 using the v0.1.3 dossier path alone.

Clean result confirmed:

- reset state imported 4 dossier claims and 7 evidence rows
- `structured_packet_imported.detail.counts.observations = 0`
- `kernel_state.observations = []`
- counter-considerations imported as evidence rows with `relation: "attacks"`
- no dossier-created `Clarify low-signal input...` questions appeared
- open questions now come from explicit unresolved inference/interpretation/hypothesis pressure, not low-signal observation quarantine
- benchmark remained `10 / 10`
- active graph nodes preserved the Octahedron surface rule

The clean packet proves the v0.1.3 path supports README Milestone 13: curated dossier structures can enter the kernel as typed claims/evidence/counter-pressure without becoming a propaganda mirror or automatic truth merge.

## Current next development target

M12 scaffolding is now sufficient until real ordinary LLM outputs are being collected.

Next implementation should pivot back to the actual kernel-brain loop.

Recommended next step:

1. Add a retrieval/source placeholder schema without pretending it verifies facts yet.
2. Represent source objects separately from claims/evidence.
3. Include fields such as source id, title, URL/citation text, retrieval status, trust notes, attached claims, attached evidence, and unresolved source questions.
4. Keep it non-scoring first.
5. Use it as the bridge toward mature source/retrieval and deeper dossier-to-kernel memory.

This is closer to the main goal than more M12 UI work: the kernel needs to learn/hold/challenge/replace/strengthen beliefs using explicit source pressure, not just compare outputs.

Do not jump into a large redesign unless there is a specific coherent step toward README Milestones 13-15.

## Remaining major gaps

- Mature source/retrieval layer is not implemented.
- Formal ordinary-LLM comparison using real model outputs is scaffolded; real model outputs must still be pasted and preserved.
- Persistent dossier integration as a source graph tied into kernel memory is still early.
- Full natural-language approval/import interface is not implemented.
- Live self-improvement remains candidate-level only; no rule self-promotes.

## Roadmap movement

The repo has moved forward on these README milestones:

- M1 Graph first-class: local nodes expose semantic triples, surface points, and parent relations.
- M2 Meaning-packet ingestion: structured packets are benchmarked.
- M3 Low-signal guard: gibberish is quarantined as observation, not serious belief.
- M4 Evidence-grounded update: attacking evidence weakens target claims.
- M5 Dependency propagation: dependent claims are tested when support claims weaken.
- M6 Scope and merge rules: surface/root behavior is benchmarked.
- M7 Self-audit: motive, self-sealing, and unresolved contradiction pressure are tested.
- M8 Sandboxed self-improvement: candidate overlays can be compared without core promotion.
- M9 Memory compression: active pressure and archival traces can be separated.
- M10 Philosophical text ingestion: principle candidates require testing.
- M11 Benchmark v0.1: fixed cases exist and currently pass `10 / 10`.
- M12 comparison harness: `ordinary-llm-comparison.html` now scores pasted LLM outputs against kernel-guided benchmark behavior.
- M12 comparison smoke test: `ordinary-llm-comparison-test.html` verifies packet shape, rubric criteria, scoring lanes, and doctrine guardrails.
- M12 report index: `m12-comparison-report-index.html` stores copied comparison packets and exports aggregate evidence without claiming proof.
- M12-M15 limited harness: `milestone-closer.html` makes endgame behavior visible as testable packets.
- M13 cleaner bridge: `dossier-source-graph.html` imports typed dossier packets, exports counter-considerations as attacking evidence, and hands a clean kernel command into the live brain.
- M13/M14 source trace seed: `llm-brain-v0-3.html` now exposes a read-only imported-source trace in UI and brain packet export.
- M13/M14 persistent source trace: `llm-brain-v0-3.html` now persists source traces into `kernel_state.sourceTraces` as non-scoring provenance state.
- M14 explanation bridge seed: `source-trace-bridge.html` turns persisted source traces into read-only LLM explanation packets/prompts.
- M14 local explanation preview: `source-trace-bridge.html` now gives a deterministic local preview before any LLM is involved.
- M14 bridge smoke test: `source-trace-bridge-test.html` checks bridge packet shape, counts, doctrine flags, and no-mutation guardrails.

## The SHA write trick for ChatGPT GitHub connector

The GitHub connector write path can appear to stall or fail in the ChatGPT app. Use this defensive sequence.

For existing files:

```text
1. Fetch the file first.
2. Record the file/blob SHA from the fetch result.
3. Send the full replacement content through update_file with that SHA.
4. Wait for the returned commit_sha.
5. Fetch the same file again.
6. Verify the exact intended change is present.
7. Only then move to the next file.
```

For new files:

```text
1. Create only one small file.
2. Wait for the returned commit_sha.
3. Fetch the new file back.
4. Verify content.
5. Only then link or document it.
```

Why it works:

- The file/blob SHA identifies the exact version of the file being replaced.
- GitHub uses it as a safety check so a stale update cannot silently overwrite a newer file.
- The returned `commit_sha` means GitHub accepted the write and created a commit.
- Fetching back confirms the repo actually contains the change, rather than trusting the ChatGPT UI state.

Operational rule:

```text
Never trust a write until commit_sha returns and fetch-back verifies the content.
```

Prefer one small change per commit. Avoid rewriting multiple large files in one step unless necessary.

## Prompt for the next ChatGPT session

Use this prompt if continuing in a fresh chat:

```text
Continue work on https://github.com/42ndMoose/42ndMind

Do not read unrelated uploaded files.

First read CURRENT_PROGRESS.md.

Important state:
- README.md has been refreshed for the current v0.3 stack.
- Main live console: llm-brain-v0-3.html
- Goal runner: goal-runner.html
- Ordinary LLM comparison: ordinary-llm-comparison.html
- Ordinary LLM comparison test: ordinary-llm-comparison-test.html
- M12 report index: m12-comparison-report-index.html
- Dossier importer: dossier-source-graph.html
- Dossier module: src/dossier-source-graph-v0-1.js
- Dossier module latest version is 0.1.3
- dossier-source-graph.html loads src/dossier-source-graph-v0-1.js?v=0.1.3
- dossier-source-graph-test.html loads src/dossier-source-graph-v0-1.js?v=0.1.3
- v0.1.3 exports counter-considerations as attacking evidence, not observations
- v0.1.3 produces kernel command with observations: []
- Clean reset test confirmed structured_packet_imported counts observations: 0
- Clean reset test confirmed no dossier-created Clarify low-signal input questions
- dossier-source-graph-test.html now checks observations: [], attacking evidence rows, and metadata
- llm-brain-v0-3.html now has an Imported source trace panel
- copied brain packets include source_trace_summary
- llm-brain-v0-3.html persists source traces into kernel_state.sourceTraces
- source-trace-bridge.html reads sourceTraces and emits read-only LLM explanation packets/prompts
- source-trace-bridge.html now has a deterministic local explanation preview
- source-trace-bridge-test.html exists and should report 20/20 passed
- ordinary-llm-comparison.html exists as Milestone 12 harness
- ordinary-llm-comparison-test.html exists and should report all checks passed
- m12-comparison-report-index.html stores copied comparison packets and exports aggregate evidence

Use the SHA write trick:
1. Fetch file first and use current blob SHA.
2. update_file with full replacement content and that SHA.
3. Wait for commit_sha.
4. Fetch file back and verify exact change.
5. Make only one small change at a time.

Next task:
Pivot back to the actual kernel-brain loop, not more M12 scaffolding.

Recommended next implementation:
1. Add a retrieval/source placeholder schema without pretending it verifies facts yet.
2. Represent source objects separately from claims/evidence.
3. Include fields such as source id, title, URL/citation text, retrieval status, trust notes, attached claims, attached evidence, and unresolved source questions.
4. Keep it non-scoring first.
5. Use it as the bridge toward mature source/retrieval and deeper dossier-to-kernel memory.

Keep edits small unless the next step is clearly coherent with README Milestones 13-15.
```
