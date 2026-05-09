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

`dossier-source-graph-test.html` passed the 9-check smoke test:

- has fact
- has inference
- has interpretation
- has hypothesis
- has evidence
- has counter-consideration
- prevents automatic truth merge
- has unresolved pressure
- root blocks direct merge

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

## Latest important change: dossier source graph v0.1.3

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

`dossier-source-graph.html` is cache-busted to load:

```html
<script src="src/dossier-source-graph-v0-1.js?v=0.1.3"></script>
```

## Latest browser packet note

The latest user-provided brain packet showed that the bridge worked, but the live browser state contained both old and new imports because earlier tests happened before a reset.

Important detail from the latest packet:

- old import event included `observations: 7`
- newer v0.1.3-style import event included `observations: 0`
- newer import exported counter-considerations as `attacks` evidence
- benchmark remained `10 / 10`

So the code fix is in place, but the next clean test must start from a reset state to prove the v0.1.3 path alone avoids observation noise.

## Clean test sequence for next session

Use this sequence before making more changes:

1. Open `llm-brain-v0-3.html`.
2. Hard refresh.
3. Click `RESET`.
4. Open `dossier-source-graph.html`.
5. Hard refresh.
6. Confirm the summary shows version `0.1.3`.
7. Click `SEND to live brain`.
8. Open `llm-brain-v0-3.html`.
9. Click `LOAD pending command` only if the command box is empty.
10. Click `IMPORT / RUN`.
11. Click `COPY brain packet`.
12. Inspect the brain packet.

Expected clean result:

- dossier claims imported
- dossier evidence imported
- counter-considerations appear as attacking evidence
- `structured_packet_imported.detail.counts.observations = 0`
- no new `Clarify low-signal input...` questions from dossier import
- benchmark remains `10 / 10`

## Current next development target

Next small task should be one of these, in order:

1. Verify clean v0.1.3 dossier import after reset.
2. If clean, add a tiny regression/smoke test that checks dossier kernel-command export has `observations: []` and at least one `attacks` evidence row.
3. Then document the clean import result in this file.
4. After that, begin persistent dossier-to-kernel memory integration or real source/retrieval design.

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
- M13 early bridge: `dossier-source-graph.html` imports typed dossier packets and can hand a kernel command into the live brain.

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
- Dossier module latest version should be 0.1.3
- dossier-source-graph.html should load src/dossier-source-graph-v0-1.js?v=0.1.3
- v0.1.3 exports counter-considerations as attacking evidence, not observations
- v0.1.3 should produce kernel command with observations: []
- Previous noisy low-signal questions came from older observation-based dossier imports before v0.1.3

Use the SHA write trick:
1. Fetch file first and use current blob SHA.
2. update_file with full replacement content and that SHA.
3. Wait for commit_sha.
4. Fetch file back and verify exact change.
5. Make only one small change at a time.

Next task:
1. Ask user to run a clean reset test:
   - open llm-brain-v0-3.html
   - RESET
   - open dossier-source-graph.html
   - hard refresh
   - confirm version 0.1.3
   - SEND to live brain
   - open llm-brain-v0-3.html
   - LOAD pending command only if needed
   - IMPORT / RUN
   - COPY brain packet
2. Inspect the brain packet.
3. Confirm structured_packet_imported counts observations: 0.
4. Confirm counter-considerations imported as evidence relation attacks.
5. Confirm no new Clarify low-signal input questions came from the dossier import.
6. If clean, add a tiny dossier-source-graph-test.html check or module smoke test that verifies kernel command export has observations: [] and attacking evidence rows.
7. Update CURRENT_PROGRESS.md briefly.

Keep edits small. Avoid broad rewrites or visual redesign.
```
