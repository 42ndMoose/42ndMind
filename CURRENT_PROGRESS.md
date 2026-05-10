# 42ndMind Current Progress

Last updated: **2026-05-10**.

This is the handoff record for continuing work toward the README goal: a transparent, meaning-based epistemic system governed by the Epistemic Octahedron.

## Current status

42ndMind is now an early browser-based belief-state engine with:

- live Epistemic Octahedron math
- browser kernel state
- scoped graph nodes
- contradiction pressure
- low-signal quarantine
- audit pressure
- benchmark packets
- claim-challenge workflow
- dossier source-graph importer
- imported source traces
- persisted `sourceTraces`
- source-trace explanation bridge
- ordinary LLM comparison harness and report index
- non-scoring source registry module
- source registry workflow page
- limited M12-M15 milestone closer harness

It is still not a full truth machine. It cannot independently verify external facts without a mature retrieval/source layer.

## Main live entry points

- `llm-brain-v0-3.html` — main patched live brain console.
- `goal-runner.html` — benchmark, milestone, sandbox, and compression runner.
- `ordinary-llm-comparison.html` — M12 comparison harness.
- `ordinary-llm-comparison-test.html` — M12 harness smoke test.
- `m12-comparison-report-index.html` — saves copied M12 comparison packets and exports aggregate evidence.
- `claim-challenge.html` — external-claim challenge workflow.
- `claim-challenge-test.html` — claim-challenge smoke test.
- `dossier-source-graph.html` — dossier importer.
- `dossier-source-graph-test.html` — dossier importer smoke/regression test.
- `source-trace-bridge.html` — read-only source-trace explanation bridge.
- `source-trace-bridge-test.html` — source-trace bridge smoke test.
- `source-registry.html` — load/paste/save/export non-scoring source registry packets.
- `source-registry-test.html` — source registry smoke test.
- `milestone-closer.html` — limited M12-M15 harness.
- `belief-graph.html` — graph viewer.
- `index.html` — older human-facing UI, no longer primary.

## Main implementation files

- `src/epistemic-kernel-v0-2.js` — base browser kernel.
- `src/epistemic-kernel-v0-2-patches.js` — low-signal quarantine and unresolved-contradiction audit patch layer.
- `src/epistemic-benchmark-v0-1.js` — fixed benchmark cases, sandbox overlay runner, milestone status, and memory compression helpers.
- `src/claim-challenge-v0-1.js` — claim-challenge workflow.
- `src/dossier-source-graph-v0-1.js` — dossier source-graph importer and kernel-command exporter. Latest version: `0.1.3`.
- `src/source-registry-v0-1.js` — non-scoring source registry placeholder schema. Latest version: `0.1.0`.

## Confirmed stable pieces

### Kernel and benchmark

- patch status loaded: `v02_patches_applied = true`
- `low_signal_guard = patched`
- `contradiction_audit = patched`
- benchmark score: `10 / 10`
- failed cases: `0`
- active Octahedron states preserve `|x| + |y| + |z| = 1`
- null origin stays separate from active surface states

### Dossier source graph

`dossier-source-graph.html` and `dossier-source-graph-test.html` load:

```html
<script src="src/dossier-source-graph-v0-1.js?v=0.1.3"></script>
```

v0.1.3 behavior:

- counter-considerations export as `evidence` with `relation: "attacks"`
- kernel command exports `observations: []`
- explicit open questions preserve unresolved pressure
- no dossier-created `Clarify low-signal input...` questions from clean import

Clean browser packet confirmed:

```json
{
  "claims": 4,
  "evidence": 7,
  "attacking_evidence": 3,
  "open_questions": 6,
  "observations": 0
}
```

### Source trace bridge

`llm-brain-v0-3.html` persists imported source traces into `kernel_state.sourceTraces`.

`source-trace-bridge.html` reads those traces and produces:

- `42ndMind_source_trace_explanation_packet`
- copyable LLM explanation prompt
- deterministic local explanation preview

`source-trace-bridge-test.html` should report `20/20 passed`.

### M12 comparison

`ordinary-llm-comparison.html` lets the user paste generic/prompt-only LLM outputs and compare them against kernel-guided benchmark behavior.

`ordinary-llm-comparison-test.html` verifies packet shape, rubric criteria, scoring lanes, honesty note, and doctrine guardrails.

`m12-comparison-report-index.html` stores copied comparison reports locally and exports an aggregate evidence packet. It does not claim M12 is passed without real generic/prompt-only LLM outputs.

### Source registry

`src/source-registry-v0-1.js` now exists.

It defines a non-scoring source registry layer that represents source objects separately from claims and evidence.

Each source can include:

- source id
- title
- source kind
- URL/citation/document locator
- retrieval status
- retrieval method
- retrieved timestamp
- trust notes
- reliability flags
- attached claim ids
- attached evidence ids
- unresolved source questions
- provenance fields

Doctrine/guardrails:

- source objects are separate from claims
- source objects are separate from evidence
- provenance is not proof
- retrieval is not verification
- trust notes are pressure, not truth
- unresolved source questions remain visible
- kernel owns belief movement
- registry is non-scoring metadata only

`source-registry-test.html` should report `24/24 passed`.

`source-registry.html` now exists and can:

- load the sample source registry packet
- import pasted `42ndMind_source_registry_packet` JSON
- render a source table and normalized report
- save `sourceRegistry` into localStorage under `42ndMind_source_registry_v0_1`
- mark saved registry as metadata-only and non-scoring
- load saved registry
- copy the normalized report
- clear saved registry metadata

## Latest important change

Added source registry workflow page:

- commit `648c3351b170fdd7a00c9ac71d66d0071b5ee24b`: `source-registry.html`

This makes the source registry usable in-browser without integrating it into belief scoring.

## Current next development target

Next step should bridge real dossier source traces into source registry objects.

Recommended next implementation:

1. Add a tiny function to `src/source-registry-v0-1.js` that converts a persisted `sourceTrace` into a `42ndMind_source_registry_packet`.
2. Keep generated source objects non-scoring.
3. Preserve `claim_ids`, `evidence_ids`, `source_links`, counts, import event id, and unresolved source questions.
4. Add a smoke check for trace-to-registry conversion.
5. After verification, add a button in `source-registry.html` to import from saved `kernel_state.sourceTraces`.

This would connect M13 dossier import, source traces, and source registry into one provenance chain without moving belief state.

## Remaining major gaps

- Mature retrieval/source layer is not implemented.
- Source registry is non-scoring metadata only.
- Formal ordinary-LLM comparison using real model outputs is scaffolded; real outputs still need to be pasted and preserved.
- Persistent dossier integration as a source graph tied into kernel memory is still early.
- Full natural-language approval/import interface is not implemented.
- Live self-improvement remains candidate-level only; no rule self-promotes.

## Roadmap movement

- M1-M11: browser kernel, graph, gates, evidence pressure, benchmark, and patch layer are active.
- M12: comparison harness, smoke test, and report index exist.
- M13: dossier import, source traces, non-scoring source registry module, and source registry workflow page exist.
- M14: read-only source-trace explanation bridge exists.
- M15: only limited/sandboxed pieces exist; no autonomous self-promotion.

## SHA write trick

For existing files:

```text
1. Fetch file first.
2. Use current blob SHA.
3. update_file with full replacement content and that SHA.
4. Wait for commit_sha.
5. Fetch file back and verify exact change.
6. Make only one small change at a time.
```

Never trust a write until commit_sha returns and fetch-back verifies content.

## Prompt for next session

```text
Continue work on https://github.com/42ndMoose/42ndMind

Do not read unrelated uploaded files.

First read CURRENT_PROGRESS.md.

Important state:
- Main live console: llm-brain-v0-3.html
- Dossier importer: dossier-source-graph.html
- Dossier module latest version is 0.1.3
- Source registry module: src/source-registry-v0-1.js
- Source registry module latest version is 0.1.0
- source-registry-test.html exists and should report 24/24 passed
- source-registry.html exists and saves sourceRegistry to localStorage as metadata only
- Source registry is non-scoring metadata only; it must not move belief state.
- Source objects are separate from claims/evidence.
- Retrieval status is not verification.
- Provenance is not proof.

Use the SHA write trick:
1. Fetch file first and use current blob SHA.
2. update_file with full replacement content and that SHA.
3. Wait for commit_sha.
4. Fetch file back and verify exact change.
5. Make only one small change at a time.

Next task:
1. Ask user to verify source-registry.html sample import/save works.
2. If clean, add trace-to-source-registry conversion.
3. Keep it non-scoring.
4. Do not integrate into belief scoring yet.
```
