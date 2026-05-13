# 42ndMind Epistemic Kernel

42ndMind is a browser-executable epistemic kernel: a transparent belief-state engine governed by the Epistemic Octahedron.

It is not an LLM. It does not try to be the language model. The intended architecture is:

```text
human language / documents / dossiers
→ LLM or human extractor
→ structured claim/evidence/source packet
→ epistemic kernel
→ belief-state pressure, gates, memory, source trust, and review packets
→ optional LLM explanation layer
```

The kernel owns belief movement. LLMs are extractor/interface layers.

## Current status

The repo now has two related layers:

1. The older live console stack centered on `llm-brain-v0-3.html`.
2. The newer v0.4 module stack for one-brain processing, source trust, epistemic memory, lexical uncertainty, semantic invariant learning, and controlled self-improvement.

The latest operational status is tracked in:

```text
CURRENT_PROGRESS.md
```

The full high-context handoff for writing a serious paper on the current v0.4 kernel is:

```text
HANDOFF_2026_05_13_KERNEL_V04_PAPER_CONTEXT.md
```

Read those two files first before continuing development or writing a paper.

## Main live entry points

Current live console:

- `llm-brain-v0-3.html` — main patched live brain console. Current live packet version: `0.3.4-patched`.

Current v0.4 / self-improvement / semantic stack:

- `kernel-brain-v0-4-test.html`
- `kernel-command-preflight-test.html`
- `kernel-sensemaking-test.html`
- `kernel-intention-recovery-v0-4-test.html`
- `kernel-runtime-candidates-v0-4-test.html`
- `kernel-runtime-activation-v0-4-test.html`
- `kernel-sandbox-comparison-v0-4-test.html`
- `kernel-sandbox-comparison-review.html`
- `kernel-source-patch-bridge-v0-4-test.html`
- `kernel-source-patch-bridge-review.html`
- `kernel-source-trust-v0-4-test.html`
- `kernel-source-trust-bridge-v0-4-test.html`
- `ees-to-kernel-command.html`
- `ees-to-kernel-command-test.html`
- `kernel-epistemic-memory-v0-4-test.html`
- `kernel-lexical-uncertainty-v0-4-test.html`
- `kernel-semantic-invariant-learner-v0-4-test.html`
- `kernel-semantic-invariant-review.html`
- `kernel-semantic-promotion-bridge-v0-4-test.html`
- `kernel-semantic-promotion-review.html`
- `kernel-semantic-source-bridge-v0-4-test.html`

Older but still useful pages:

- `goal-runner.html`
- `claim-challenge.html`
- `dossier-source-graph.html`
- `dossier-source-graph-test.html`
- `dossier-ees-compiler-v0-1-2.html`
- `source-registry.html`
- `source-registry-test.html`
- `source-trace-bridge.html`
- `source-trace-bridge-test.html`
- `ordinary-llm-comparison.html`
- `ordinary-llm-comparison-test.html`
- `belief-graph.html`

## Core design thesis

The real target is not a chatbot that sounds wise.

The target is a transparent epistemic operating system whose internal update rules are faithful to the Epistemic Octahedron:

- null origin is not maturity
- active states obey `|x| + |y| + |z| = 1`
- unresolved contradiction remains visible
- motive overclaim is capped
- source metadata does not become truth
- lexical uncertainty blocks fake certainty
- contradicted beliefs are archived, not deleted
- stable semantic patterns can become candidates, not doctrine
- self-improvement must pass through review, tests, and source-bridge packets

## Epistemic Octahedron relation

The Epistemic Octahedron supplies the governing geometry and maturity doctrine.

Important semantic points:

- `(0,0,0)` is the pre-philosophical null state.
- Active worldview states live on `|x| + |y| + |z| = 1`.
- Lower y represents epistemic collapse / negative stability.
- Upper y represents mature integration / objective peak.
- Lateral axes encode empathy/practicality and knowledge/wisdom pressures.
- Mature stability cannot be faked by polished language, source status, repetition, or unresolved contradiction.

## What the kernel does now

The current stack can:

- process structured kernel commands
- preserve null origin separately from active octahedron states
- expose contradiction pressure
- cap maturity under unresolved pressure
- run sensemaking and preflight checks
- recover likely intention while preserving uncertainty
- track consistency and probability pressure
- attach source-trust priors
- keep certification as metadata, not truth
- compile EES registry mechanisms into copyable kernel commands
- store epistemic memory as inactive pressure
- archive contradicted beliefs instead of deleting them
- detect unknown, ambiguous, acronymic, and implication-heavy terms
- produce lexical definition requests for human/LLM/glossary extraction
- learn repeated semantic-pressure patterns
- propose stable semantic invariants
- evaluate semantic invariant proposals through the promotion pipeline
- generate patch plans for semantic adapters
- convert semantic patch plans into GitHub-safe source patch bridge packets

## Current full self-improvement path

The most advanced implemented path is:

```text
language example / lexical report / memory report
→ semantic invariant learner
→ stable invariant proposal
→ semantic promotion bridge
→ promotion pipeline
→ patch candidate planner
→ semantic target patch mapping
→ semantic source bridge
→ source patch bridge packet
→ external GitHub SHA/write/fetch-back/test protocol
```

This is not autonomous source rewriting.

It is controlled self-maintenance up to reviewable patch packets.

## Safety and review doctrine

The kernel must not:

- treat more knowledge as automatic maturity
- treat confidence as truth
- treat source certification as truth
- treat retrieval as verification
- treat provenance as proof
- treat no contradiction as proof
- delete contradicted beliefs instead of archiving them
- let learned semantic mappings become doctrine automatically
- let a proposed patch promote itself
- write GitHub source directly from browser runtime

The current implementation preserves those boundaries through metadata-only ledgers, sandbox comparison, promotion evaluation, patch planning, and source patch bridge packets.

## Source trust doctrine

Source trust is bounded prior pressure, not truth.

A source can be classified as:

- primary document
- direct transcript
- raw dataset
- official record
- legacy media
- fact-check certified
- government-funded NGO
- advocacy organization
- anonymous social post
- expert commentary
- unknown

Key rule:

```text
Certification is metadata, not truth.
```

Fact-check certification can affect verification burden, but it cannot replace claim-level evidence.

## Lexical and semantic language-math path

The v0.4 stack introduces a research path toward mathematical language/intention analysis.

The current learner tracks repeated semantic-pressure patterns such as:

- `debunked` → closure pressure / dismissal pressure
- `certified` → authority-transfer / trust-inflation pressure
- `IFCN`, `fact-check` → source-trust / authority pressure
- `they`, `this`, `that` → ambiguity pressure
- `coordinated`, `agenda`, `motive` → motive/agency pressure
- `misinformation`, `propaganda`, `conspiracy` → dismissal / closure pressure
- `CDA-EOS`, `IAPWS`, `LLM`, `EES`, `SHA` → technical-definition pressure

These are not final laws. They are candidate pressure patterns.

The long-term research idea is that natural-language wording may converge to language-independent semantic operators beneath the surface words:

```text
utterance → semantic operators → intention vector → belief-pressure effect
```

The current kernel only seeds that path. It does not claim final intention algebra.

## Local storage keys

Important browser `localStorage` keys:

```text
42ndMind_source_registry_v0_1
42ndMind_entity_event_source_registry_v0_1
42ndMind_runtime_candidates_v0_4
42ndMind_epistemic_memory_v0_4
42ndMind_semantic_invariants_v0_4
```

Prototype storage is local to the browser/device. Durable research work should export ledgers regularly. Future work should add JSONL or SQLite-style export/import for long-running epistemic memory and semantic invariant data.

## How to run

No build step is required for browser use.

Open the relevant `.html` file directly or through GitHub Pages.

If a new update does not appear, hard refresh the browser or wait for GitHub Pages deployment.

For the older Node demo, if Node.js is installed:

```bash
npm run demo
```

## Current verified test expectations

The latest important user-reported checks include:

- `kernel-source-trust-v0-4-test.html` — `14/14 passed`
- `kernel-source-trust-bridge-v0-4-test.html` — `10/10 passed`
- `ees-to-kernel-command-test.html` — `14/14 passed`
- `kernel-epistemic-memory-v0-4-test.html` — `15/15 passed`
- `kernel-lexical-uncertainty-v0-4-test.html` — `13/13 passed`
- `kernel-semantic-invariant-learner-v0-4-test.html` — `14/14 passed`
- `kernel-semantic-promotion-bridge-v0-4-test.html` — `10/10 passed`
- `kernel-semantic-source-bridge-v0-4-test.html` — `10/10 passed`

For the complete verified list, read `CURRENT_PROGRESS.md`.

## Current limitations

The kernel is still a prototype.

It does not yet:

- independently verify external facts
- run browser tests by itself
- fetch GitHub file SHAs by itself
- write source files by itself
- perform automatic rollback
- replace external human/tool review
- prove the full Epistemic Octahedron theory
- prove final mathematical language/intention algebra

It does provide a runnable, transparent substrate for testing those ideas.

## Development rule: SHA write trick

For existing GitHub files:

```text
1. Fetch file first.
2. Use current blob SHA.
3. Update the file with that SHA.
4. Wait for commit SHA.
5. Fetch file back and verify exact content.
6. Make only one small change at a time.
```

Never trust a write until commit SHA returns and fetch-back verifies exact content.

## Recommended next work

No urgent code build is required if `kernel-semantic-source-bridge-v0-4-test.html` passes `10/10`.

Recommended next tasks:

1. Write a serious technical paper from scratch using `HANDOFF_2026_05_13_KERNEL_V04_PAPER_CONTEXT.md`.
2. Add durable export/import for epistemic memory and semantic invariant ledgers.
3. Integrate selected v0.4 pages into the main navigation/index.
4. Continue validating semantic invariant learning with real examples and reviewed outcomes.

## One-line summary

42ndMind is an attempt to build a transparent epistemic operating system: a belief-state kernel governed by the Epistemic Octahedron, with LLMs kept as interface/extractor layers rather than the source of belief movement.
