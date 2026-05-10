# 42ndMind Current Progress

This file is the handoff record for continuing work toward the README goal: a transparent, meaning-based epistemic system governed by the Epistemic Octahedron.

Last updated: **2026-05-09**.

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
- limited M12-M15 milestone closer harness

It is still not a full truth machine. It cannot independently verify external facts without a retrieval/source layer or user-supplied evidence.

## Main live entry points

- `llm-brain-v0-3.html` is the main patched live brain console.
- `goal-runner.html` runs benchmark, milestone, sandbox, and compression reports.
- `claim-challenge.html` challenges external claims and exports optional kernel commands.
- `claim-challenge-test.html` runs the claim-challenge smoke test.
- `dossier-source-graph.html` imports curated dossier packets into typed source-graph pressure and can send a kernel command to the live brain.
- `dossier-source-graph-test.html` runs the dossier source-graph smoke test.
- `milestone-closer.html` runs the limited M12-M15 harness.
- `belief-graph.html` is the graph view.

## Main implementation files

- `src/epistemic-kernel-v0-2.js`: base browser kernel.
- `src/epistemic-kernel-v0-2-patches.js`: low-signal quarantine and unresolved-contradiction audit patch layer.
- `src/epistemic-benchmark-v0-1.js`: fixed benchmark cases.
- `src/claim-challenge-v0-1.js`: claim-challenge workflow.
- `src/dossier-source-graph-v0-1.js`: dossier source-graph importer and kernel-command exporter.

## Confirmed stable pieces

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

## Latest important change: imported source trace

`llm-brain-v0-3.html` now builds a read-only imported-source trace from the existing kernel event log.

The trace is deliberately not core logic yet. It does not change belief state, promote truth, or mutate rules.

It groups each `structured_packet_imported` event and reports:

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
- metadata saying the trace is read-only and grouped from the event log

This is the first source-provenance step toward README Milestones 13 and 14: the kernel can now show where an import came from and what pressure it brought in, while still keeping the LLM/interface layer outside belief control.

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

Next small task should verify the imported-source trace from a clean browser run.

Recommended test:

1. Open `llm-brain-v0-3.html`.
2. Hard refresh.
3. Click `RESET`.
4. Open `dossier-source-graph.html`.
5. Hard refresh and confirm version `0.1.3`.
6. Click `SEND to live brain`.
7. Return to `llm-brain-v0-3.html`.
8. Click `LOAD pending command` only if needed.
9. Click `IMPORT / RUN`.
10. Confirm the `Imported source trace` panel shows one structured packet import.
11. Click `COPY brain packet`.
12. Confirm `source_trace_summary[0]` exists and reports observations `0`, evidence `7`, attacking evidence `3`, and claims `4`.

If clean, the next implementation step should be a tiny persistent source-trace field inside kernel state, rather than recomputing only from event logs. That would move the source trace from UI/export derived summary toward persistent dossier-to-kernel memory.

Do not jump into a large redesign.

## Remaining major gaps

- Mature source/retrieval layer is not implemented.
- Formal ordinary-LLM comparison using real model outputs is not implemented.
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
- M10 Philosophical text ingestion: candidate principles require testing.
- M11 Benchmark v0.1: fixed cases exist and currently pass `10 / 10`.
- M12-M15 limited harness: `milestone-closer.html` makes endgame behavior visible as testable packets.
- M13 cleaner bridge: `dossier-source-graph.html` imports typed dossier packets, exports counter-considerations as attacking evidence, and hands a clean kernel command into the live brain.
- M13/M14 source trace seed: `llm-brain-v0-3.html` now exposes a read-only imported-source trace in UI and brain packet export.

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
- Main live console: llm-brain-v0-3.html
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
- copied brain packets now include source_trace_summary

Use the SHA write trick:
1. Fetch file first and use current blob SHA.
2. update_file with full replacement content and that SHA.
3. Wait for commit_sha.
4. Fetch file back and verify exact change.
5. Make only one small change at a time.

Next task:
1. Ask user to verify a clean dossier import in the browser.
2. Inspect the copied brain packet.
3. Confirm source_trace_summary[0] exists.
4. Confirm source_trace_summary[0].counts observations 0, evidence 7, attacking_evidence 3, claims 4.
5. If clean, make the next tiny step: persist source traces in kernel state instead of only deriving them from event logs.

Keep edits small. Avoid broad rewrites or visual redesign.
```
