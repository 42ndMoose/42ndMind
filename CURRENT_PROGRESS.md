# 42ndMind Current Progress

Last updated: **2026-05-10**.

This is the handoff record for continuing work toward the README goal: a transparent, meaning-based epistemic system governed by the Epistemic Octahedron.

## Current status

42ndMind is an early browser-based kernel-brain: small, incomplete, but already governed by one coherent belief-movement logic.

It currently has:

- live Epistemic Octahedron math
- browser kernel state
- scoped graph nodes
- contradiction pressure
- low-signal quarantine
- audit pressure
- benchmark packets
- idempotent structured imports
- duplicate-provenance audit events
- claim-challenge workflow
- dossier source-graph importer
- imported source traces
- persisted `sourceTraces`
- source-trace explanation bridge
- source-registry visibility in source-trace explanations
- source-trace/source-registry bridge smoke test
- ordinary LLM comparison harness and report index
- non-scoring source registry module
- source registry workflow page
- trace-to-source-registry conversion
- source registry visibility in live brain packets
- limited M12-M15 milestone closer harness

It is not a full truth machine. It cannot independently verify external facts without a mature retrieval/source layer.

## Main live entry points

- `source-registry-readiness.html` — read-only retrieval/source-review readiness checklist. Created, fetch-back verified, and linked from `source-registry.html`.
- `llm-brain-v0-3.html` — main patched live brain console.
- `goal-runner.html` — benchmark, milestone, sandbox, and compression runner.
- `ordinary-llm-comparison.html` — M12 comparison harness.
- `ordinary-llm-comparison-test.html` — M12 harness smoke test.
- `m12-comparison-report-index.html` — saves copied M12 comparison packets and exports aggregate evidence.
- `claim-challenge.html` — external-claim challenge workflow.
- `claim-challenge-test.html` — claim-challenge smoke test.
- `dossier-source-graph.html` — dossier importer.
- `dossier-source-graph-test.html` — dossier importer smoke/regression test.
- `source-trace-bridge.html` — read-only source-trace/source-registry explanation bridge.
- `source-trace-bridge-test.html` — source-trace/source-registry bridge smoke test.
- `source-registry.html` — load/paste/save/export non-scoring source registry packets and convert live source traces.
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
- `src/source-registry-v0-1.js` — non-scoring source registry placeholder schema and trace conversion. Latest version: `0.1.2`.

## Confirmed stable pieces

### Kernel and benchmark

- patch status loaded: `v02_patches_applied = true`
- `low_signal_guard = patched`
- `contradiction_audit = patched`
- `idempotent_import_packet_guard = patched`
- `duplicate_provenance_audit = patched`
- `source_registry_visibility = patched_metadata_only`
- benchmark score: `10 / 10`
- failed cases: `0`
- active Octahedron states preserve `|x| + |y| + |z| = 1`
- null origin stays separate from active surface states

### Live brain packet

`llm-brain-v0-3.html` now produces:

```json
{
  "packet_type": "42ndMind_live_brain_packet",
  "packet_version": "0.3.4-patched"
}
```

The packet includes:

- `source_trace_summary`
- `source_registry_summary`
- `source_registry_metadata`
- `duplicate_import_audit`

`source_registry_summary` and `source_registry_metadata` are non-scoring metadata only. They do not alter claims, evidence, gates, contradictions, graph nodes, root worldview, confidence, or Octahedron coordinates.

The live brain reads saved source registry metadata from:

```text
42ndMind_source_registry_v0_1
```

If no registry is saved, the brain packet reports `available: false` and `reason: "no_saved_source_registry"`.

### Duplicate import behavior

`llm-brain-v0-3.html` prevents exact duplicate `import_packet` commands from being treated as fresh belief pressure.

Duplicate imports are skipped and recorded in `kernel_state.eventLog` as:

```json
{
  "type": "duplicate_import_skipped",
  "detail": {
    "epistemic_rule": "duplicate_provenance_is_not_independent_convergence",
    "reason": "Repeated identical structured import was already processed. Repetition of the same packet does not add independent evidence or new belief pressure.",
    "belief_movement": "none",
    "scoring_effect": "none",
    "non_scoring": true
  }
}
```

The governing principle is: repeated identical provenance is not independent convergence.

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

`source-trace-bridge.html` reads source traces and saved source registry metadata. It produces:

- `42ndMind_source_trace_explanation_packet`
- packet version `0.1.2`
- `source_registry_summary`
- `source_registry_metadata`
- copyable LLM explanation prompt
- deterministic local explanation preview

It remains read-only and non-scoring. It must not mutate kernel state, source registry, gates, confidence, or graph movement.

`source-trace-bridge-test.html` has been updated to expect packet version `0.1.2` and now checks source registry visibility/guardrails. It should report `38/38 passed` in browser.

### M12 comparison

`ordinary-llm-comparison.html` lets the user paste generic/prompt-only LLM outputs and compare them against kernel-guided benchmark behavior.

`ordinary-llm-comparison-test.html` verifies packet shape, rubric criteria, scoring lanes, honesty note, and doctrine guardrails.

`m12-comparison-report-index.html` stores copied comparison reports locally and exports an aggregate evidence packet. It does not claim M12 is passed without real generic/prompt-only LLM outputs.

### Source registry

`src/source-registry-v0-1.js` is at version `0.1.2`.

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

`source-registry-test.html` loads:

```html
<script src="src/source-registry-v0-1.js?v=0.1.2"></script>
```

It was verified in-browser as `36/36 passed`.

`source-registry.html` loads:

```html
<script src="src/source-registry-v0-1.js?v=0.1.2"></script>
```

It can:

- load the sample source registry packet
- import pasted `42ndMind_source_registry_packet` JSON
- load from live `kernel_state.sourceTraces`
- convert live source traces into source registry objects
- render a source table and normalized report
- save `sourceRegistry` into localStorage under `42ndMind_source_registry_v0_1`
- mark saved registry as metadata-only and non-scoring
- load saved registry
- copy the normalized report
- clear saved registry metadata

## Latest important changes

### Updated source trace bridge test

- commit `56cdbbf1ea1a2a811ad292467420edac2bd50e7b`: updated `source-trace-bridge-test.html`

The smoke test now expects explanation packet version `0.1.2` and checks:

- source registry summary exists
- source registry metadata exists
- source registry source count is visible
- unresolved source questions are visible
- source registry is non-scoring metadata only
- provenance is not proof
- retrieval is not verification
- bridge guardrails include `do_not_mutate_source_registry`
- prompt blocks source registry mutation

### Source registry visibility in source trace bridge

- commit `e18fa7ae62cb4e92641a6b2e22563ab16ff38430`: added source registry visibility to `source-trace-bridge.html`

`source-trace-bridge.html` now produces explanation packets at version `0.1.2` and includes source-registry summary/metadata. It remains read-only and non-scoring.

### Source registry visibility in live brain packet

- commit `ff8db604f8b247b5e3ac32add2bbd29454880105`: added source registry visibility directly to `llm-brain-v0-3.html`
- commit `231c67536a0f4b3f177a9f653ad26c1147ebd78d`: removed unused bridge file created during the first implementation attempt

The live brain now reads saved source registry metadata from localStorage and includes it in copied brain packets as metadata-only.

### Duplicate provenance audit

- commit `0f0f1346425ada62ed41b32337ae48a995023049`: `llm-brain-v0-3.html`

Exact duplicate structured imports are skipped and recorded as explicit non-scoring epistemic audit events.

This strengthens the kernel rule:

```text
Repeated identical provenance is not independent convergence.
```

### Source registry bug fix

- commit `8295b9b3d176874e84a39a1e899d93c442ed027f`: fixed trace conversion typo and bumped source registry to `0.1.2`
- commit `94e68130d603d71a8221de1b20fddec0116aa3d2`: cache-busted source registry test to `0.1.2`
- commit `2bff811af962911924bdcf00b8f2fa685afddc3f`: cache-busted source registry page to `0.1.2`

The browser test reports `36/36 passed`.

## Current next development target

Next step should verify `source-trace-bridge-test.html` in browser.

Recommended test:

1. Hard refresh `source-trace-bridge-test.html`.
2. Confirm it reports `38/38 passed`.
3. Open `source-trace-bridge.html`.
4. Hard refresh.
5. Confirm local preview includes source registry availability as non-scoring metadata.
6. Copy explanation packet if needed and confirm packet version is `0.1.2`.

If clean, the next implementation target should be a tiny source-registry explanation preview or retrieval-readiness checklist, still non-scoring.

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
- M13: dossier import, source traces, non-scoring source registry module, workflow page, trace conversion, duplicate-provenance rule, and live brain source-registry visibility exist.
- M14: read-only source-trace/source-registry explanation bridge exists.
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
- Live brain packet version is 0.3.4-patched
- Brain packet includes source_registry_summary and source_registry_metadata
- source_registry_metadata is non-scoring metadata only
- Duplicate import guard records duplicate_import_skipped events
- Duplicate provenance rule: repeated identical provenance is not independent convergence
- Dossier importer: dossier-source-graph.html
- Dossier module latest version is 0.1.3
- Source registry module: src/source-registry-v0-1.js
- Source registry module latest version is 0.1.2
- source-registry-test.html loads v=0.1.2 and has been verified as 36/36 passed
- source-registry.html loads v=0.1.2 and saves sourceRegistry to localStorage as metadata only
- source-registry.html can LOAD from live sourceTraces
- source-trace-bridge.html emits packet version 0.1.2 and includes source_registry_summary/source_registry_metadata
- source-trace-bridge-test.html expects 38/38 passed
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
1. Ask user to verify source-trace-bridge-test.html reports 38/38 passed.
2. If clean, add a tiny source-registry explanation preview or retrieval-readiness checklist.
3. Keep it read-only and non-scoring.
```
