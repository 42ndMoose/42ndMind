# 42ndMind Current Progress

Last updated: **2026-05-18**.

Read this file first.

Then read:

```text
KERNEL_ARCHITECTURE_2026_05_18.md
```

This file is the compact operational status. The architecture file is the detailed map.

## Current status

```text
CORE_LANGUAGE_MATH_KERNEL_MATURE_CANDIDATE_THRESHOLD_PASSED
FORMULA_ADMISSION_PATH_READY
UNIFIED_FORMULA_INSPECTOR_READY
EXTERNAL_WORLD_EVIDENCE_STACK_READY
TRUTH_PRESSURE_SYNTHESIS_READY_V0_1_1
```

The kernel is now a working deterministic language-math brain for the covered grammar.

It is no longer only an intention-language prototype.

It now includes:

```text
objective intention/concept formula grammar
canonical formula ledger
formula proof output
formula inspector
concept admission / formula registration registry
unified formula inspector
Epistemic Octahedron language alignment
arbitrary/expanded language parser
expanded parser proof trace
objective claim-language kernel
objective claim trace layer
external anchor packet schema
source/provenance registry
evidence/media registry
truth-pressure synthesis v0.1.1
```

## Current main formula-inspection URL

Use this as the main place to inspect formulas for both canonical concepts and newly admitted candidate meanings:

```text
https://42ndmoose.github.io/42ndMind/intention-formula-inspector-v0-1-1.html?v=inspect-2
```

Expected metrics:

```text
Decision: UNIFIED_FORMULA_INSPECTOR_READY
Canonical: 11
Admitted: 6
Total formulas: 17
```

Base inspector remains available for canonical-only inspection:

```text
https://42ndmoose.github.io/42ndMind/intention-formula-inspector.html?v=inspect-1
```

Concept admission registry remains available for admission-specific records:

```text
https://42ndmoose.github.io/42ndMind/concept-admission-registry.html?v=admit-1
```

## Most recent added layers

Truth-pressure synthesis v0.1.1:

```text
https://42ndmoose.github.io/42ndMind/kernel-truth-pressure-synthesis-v0-1-1-test.html?v=truth-2
https://42ndmoose.github.io/42ndMind/truth-pressure-synthesis-v0-1-1.html?v=truth-2
```

Expected metrics:

```text
Decision: TRUTH_PRESSURE_SYNTHESIS_READY_V0_1_1
Version: 0.1.1
Claims: 8
Evidence records: 5
External summaries: 4
Synthesis records: 8
LLM used: false
Lookup: false
```

Important v0.1.1 fix:

```text
narrative_overclaim_pressure_candidate now remains narrative_overclaim_pressure_visible_candidate even when propaganda_pressure is high.
propaganda_pressure remains visible as a component, not the overriding synthesis status.
motive_evidence_required_before_motive_truth remains visible as a gap note.
```

Evidence/media registry v0.1:

```text
https://42ndmoose.github.io/42ndMind/kernel-evidence-media-registry-v0-1-test.html?v=evidence-1
https://42ndmoose.github.io/42ndMind/evidence-media-registry.html?v=evidence-1
```

Expected metrics:

```text
Decision: EVIDENCE_MEDIA_REGISTRY_READY
Evidence records: 5
Evidence groups: 3
Claim summaries: 4
LLM used: false
Lookup: false
```

Note: five evidence records compress into four unique claim summaries because two independent documentary evidence rows support `claim_cost_change`.

Concept admission / formula registration registry v0.1:

```text
https://42ndmoose.github.io/42ndMind/kernel-concept-admission-registry-v0-1-test.html?v=admit-1
https://42ndmoose.github.io/42ndMind/concept-admission-registry.html?v=admit-1
```

Unified formula inspector v0.1.1:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-formula-inspector-v0-1-1-test.html?v=inspect-2
https://42ndmoose.github.io/42ndMind/intention-formula-inspector-v0-1-1.html?v=inspect-2
```

Source/provenance registry v0.1:

```text
https://42ndmoose.github.io/42ndMind/kernel-source-provenance-registry-v0-1-test.html?v=prov-1
https://42ndmoose.github.io/42ndMind/source-provenance-registry.html?v=prov-1
```

Note: source provenance UI should show `Source records: 4` and `Source groups: 3`. This is correct because two sources share `user_context_group`.

## Current doctrine invariants

Preserve:

```text
unified language grammar
claims/world-models/narratives/propaganda are inside the same objective language grammar
external anchors are modular registries, not separate language
candidate only unless a future ledger explicitly promotes
belief_movement: none
contradiction detection is not contradiction resolution
narrative pressure is not proof of hidden motive
propaganda pressure is structural pressure, not external fact-checking
specific narrative-overclaim status outranks broad propaganda-threshold classification
user-supplied context is context, not automatic truth
evidence descriptions are context, not automatic truth
support/counterevidence direction is separate from truth
support is not truth
counterevidence is not automatic disproof
truth-pressure synthesis is not final truth promotion
force/intensity remains outside shape
active local shape preserves Σ |dimension_i| = 1
F = M · i
no silent mutation
rollback/version trail required for formula changes
new meanings enter through admission records, not silent canonical mutation
admitted meanings do not fake proof references
```

## Key current files

Architecture:

```text
KERNEL_ARCHITECTURE_2026_05_18.md
CURRENT_PROGRESS.md
```

Formula / intention stack:

```text
src/kernel-intention-discovery-v0-1.js
src/kernel-intention-refinement-v0-1.js
src/kernel-intention-necessity-test-v0-1.js
src/kernel-intention-neighbor-lattice-v0-1.js
src/kernel-intention-lattice-invariance-benchmark-v0-1.js
src/kernel-intention-formula-compiler-v0-1.js
src/kernel-intention-concept-expansion-loop-v0-1.js
src/kernel-intention-contradiction-refinement-loop-v0-1.js
src/kernel-intention-formula-revision-engine-v0-1.js
src/kernel-intention-canonical-formula-ledger-v0-1.js
src/kernel-intention-proof-output-v0-1.js
src/kernel-intention-minimal-pair-library-v0-1.js
src/kernel-intention-dimension-splitting-v0-1.js
src/kernel-intention-coefficient-dimension-revision-engine-v0-1.js
src/kernel-intention-canonical-formula-ledger-v0-1-1-patch.js
src/kernel-intention-formula-inspector-v0-1.js
src/kernel-concept-admission-registry-v0-1.js
src/kernel-intention-formula-inspector-v0-1-1-patch.js
```

Language/parser stack:

```text
src/kernel-intention-arbitrary-language-parser-v0-1.js
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js
src/kernel-intention-parser-proof-trace-v0-1.js
src/kernel-intention-parser-proof-trace-v0-1-1-patch.js
```

Inspection/alignment:

```text
src/kernel-intention-formula-inspector-v0-1.js
src/kernel-concept-admission-registry-v0-1.js
src/kernel-intention-formula-inspector-v0-1-1-patch.js
src/epistemic-octahedron-language-alignment-v0-1.js
```

Claim stack:

```text
src/kernel-objective-claim-language-v0-1.js
src/kernel-objective-claim-language-v0-1-1-patch.js
src/kernel-objective-claim-trace-v0-1.js
```

External-world stack:

```text
src/kernel-external-anchor-packet-schema-v0-1.js
src/kernel-source-provenance-registry-v0-1.js
src/kernel-evidence-media-registry-v0-1.js
src/kernel-truth-pressure-synthesis-v0-1.js
src/kernel-truth-pressure-synthesis-v0-1-1-patch.js
```

## Current architecture interpretation

The Epistemic Octahedron supplied invariant geometry and maturity semantics.

The objective language-math kernel operationalized those semantics into deterministic machinery.

The alignment layer confirmed that the Epistemic Octahedron's operational core is mathematically coherent inside the built kernel.

The claim-language layer extended the same objective grammar into claim/world-model/narrative/propaganda-pressure analysis without LLM use or source lookup.

The concept admission registry gives the kernel a deterministic route for newly learned meanings to become candidate formulas.

The unified formula inspector exposes both canonical formulas and admitted candidate formulas in one place.

The external-world stack now has anchor packets, source/provenance, evidence/media structure, and truth-pressure synthesis v0.1.1.

## What remains

The core grammar is mature enough to build on.

The language is not complete in universal coverage yet.

Remaining work:

```text
larger claim/narrative benchmark
larger multilingual benchmark
world-model relation expansion
coverage stress tests
adversarial narrative-pressure tests
real-world packet ingestion discipline
```

## Next task

Build larger claim/narrative benchmark v0.1.

Suggested files:

```text
src/kernel-claim-narrative-benchmark-v0-1.js
kernel-claim-narrative-benchmark-v0-1-test.html
claim-narrative-benchmark.html
HANDOFF_2026_05_18_CLAIM_NARRATIVE_BENCHMARK.md
```

Purpose:

```text
Stress-test truth-pressure synthesis across more claim types, including support-only, counterevidence, ambiguity, causal jumps, hidden motive claims, loaded-label propaganda, unsupported rumor, independent corroboration, duplicate provenance, and unresolved evidence gaps.
```

## File growth rule

New files are acceptable only if they add one clear layer.

Each new layer should normally include:

```text
src/<module>.js
<module>-test.html
<module-ui>.html
HANDOFF_<date>_<MODULE>.md
```

Every handoff must state:

```text
what it consumes
what it produces
what it refuses to do
cache keys
browser test URL
UI URL
next suggested layer
```

## Do not do yet

```text
do not build political-specific logic
do not make source lookup automatic
do not treat user descriptions as truth
do not treat evidence descriptions as truth
do not promote candidates to doctrine
do not use real people/events as built-in truth examples
do not read unrelated uploaded files
```

## SHA write trick

For existing files:

```text
1. Fetch file first.
2. Use current blob SHA.
3. update_file with full replacement content and that SHA.
4. Wait for commit_sha.
5. Fetch file back and verify exact change.
6. Make one small change at a time.
```
