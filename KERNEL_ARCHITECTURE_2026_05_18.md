# 42ndMind Kernel Architecture — 2026-05-18

## Purpose

This is the compact architecture map for the current objective language-math kernel.

Read this before touching the repo when continuing the objective-language work.

The current kernel is a working deterministic language-math brain for the covered grammar.

It is not a political/narrative-specific system.

It is not LLM-dependent for structured packets.

It is not a source lookup engine yet.

## Core doctrine

```text
unified language grammar
claims/world-models/narratives/propaganda are inside the same objective language grammar
external anchors are modular registries, not separate language
candidate only unless a future ledger explicitly promotes
belief_movement: none
contradiction detection is not contradiction resolution
narrative pressure is not proof of hidden motive
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

## Current stack map

### 1. Objective intention-language formula stack

```text
src/kernel-intention-discovery-v0-1.js
src/kernel-intention-refinement-v0-1.js
src/kernel-intention-necessity-test-v0-1.js
src/kernel-intention-neighbor-lattice-v0-1.js?v=lattice-3
src/kernel-intention-lattice-invariance-benchmark-v0-1.js?v=invariance-2
src/kernel-intention-formula-compiler-v0-1.js?v=formula-1
src/kernel-intention-concept-expansion-loop-v0-1.js?v=expansion-2
src/kernel-intention-contradiction-refinement-loop-v0-1.js?v=contradiction-1
src/kernel-intention-formula-revision-engine-v0-1.js?v=revision-1
src/kernel-intention-canonical-formula-ledger-v0-1.js?v=ledger-1
src/kernel-intention-proof-output-v0-1.js?v=proof-1
src/kernel-intention-minimal-pair-library-v0-1.js?v=minpair-1
src/kernel-intention-dimension-splitting-v0-1.js?v=split-2
src/kernel-intention-coefficient-dimension-revision-engine-v0-1.js?v=codim-1
src/kernel-intention-canonical-formula-ledger-v0-1-1-patch.js?v=ledger-2
```

Status:

```text
canonical formula ledger ready
proof output ready
dimension splitting ready
coefficient/dimension revision ready
```

### 2. Parser / language-to-formula stack

```text
src/kernel-intention-arbitrary-language-parser-v0-1.js?v=parser-1
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js?v=parser-3
src/kernel-intention-parser-proof-trace-v0-1.js?v=ptrace-1
src/kernel-intention-parser-proof-trace-v0-1-1-patch.js?v=ptrace-2
```

Status:

```text
expanded language-to-formula benchmark ready
weak dimension-only noise holdout ready
expanded parser proof trace ready
```

Important URLs:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-language-to-formula-expanded-benchmark-v0-1-2-test.html?v=parser-3
https://42ndmoose.github.io/42ndMind/kernel-intention-expanded-parser-proof-trace-v0-1-1-test.html?v=ptrace-2
```

### 3. Formula inspection, concept admission, and octahedron alignment

```text
src/kernel-intention-formula-inspector-v0-1.js?v=inspect-1
src/kernel-concept-admission-registry-v0-1.js?v=admit-1
src/kernel-intention-formula-inspector-v0-1-1-patch.js?v=inspect-2
src/epistemic-octahedron-language-alignment-v0-1.js?v=eoalign-1
```

Status:

```text
formula inspector ready
concept admission / formula registration ready
unified formula inspector ready
octahedron language alignment ready
```

Main formula inspection URL:

```text
https://42ndmoose.github.io/42ndMind/intention-formula-inspector-v0-1-1.html?v=inspect-2
```

Expected formula counts:

```text
canonical formulas: 11
admitted candidate formulas: 6
total formula records: 17
```

### 4. Objective claim-language stack

```text
src/kernel-objective-claim-language-v0-1.js?v=claim-1
src/kernel-objective-claim-language-v0-1-1-patch.js?v=claim-2
src/kernel-objective-claim-trace-v0-1.js?v=ctrace-1
```

Status:

```text
objective claim-language ready v0.1.1
objective claim trace ready v0.1
```

Important correction:

```text
because + ordinary event sequence -> causal_claim
because + hidden motive language -> motive_attribution_claim
```

Important URLs:

```text
https://42ndmoose.github.io/42ndMind/kernel-objective-claim-language-v0-1-1-test.html?v=claim-2
https://42ndmoose.github.io/42ndMind/kernel-objective-claim-trace-v0-1-test.html?v=ctrace-1
```

### 5. External-world anchoring and truth-pressure stack

```text
src/kernel-external-anchor-packet-schema-v0-1.js?v=anchor-1
src/kernel-source-provenance-registry-v0-1.js?v=prov-1
src/kernel-evidence-media-registry-v0-1.js?v=evidence-1
src/kernel-truth-pressure-synthesis-v0-1.js?v=truth-1
src/kernel-truth-pressure-synthesis-v0-1-1-patch.js?v=truth-2
```

Status:

```text
external anchor packet schema ready
source/provenance registry ready
evidence/media registry ready
truth-pressure synthesis ready v0.1.1
```

Important URLs:

```text
https://42ndmoose.github.io/42ndMind/kernel-external-anchor-packet-schema-v0-1-test.html?v=anchor-1
https://42ndmoose.github.io/42ndMind/kernel-source-provenance-registry-v0-1-test.html?v=prov-1
https://42ndmoose.github.io/42ndMind/kernel-evidence-media-registry-v0-1-test.html?v=evidence-1
https://42ndmoose.github.io/42ndMind/kernel-truth-pressure-synthesis-v0-1-1-test.html?v=truth-2
```

Important UI notes:

```text
source records: 4
source groups: 3
evidence records: 5
evidence groups: 3
evidence claim summaries: 4
truth-pressure synthesis records: 8
truth-pressure synthesis version: 0.1.1
```

Source groups = 3 is correct because two source records share `user_context_group`.

Evidence claim summaries = 4 is correct because two evidence records support `claim_cost_change`.

The v0.1.1 truth-pressure patch fixes the earlier 4/8 failure by preserving `narrative_overclaim_pressure_visible_candidate` before applying the broader propaganda-pressure threshold.

## Current maturity status

```text
CORE_LANGUAGE_MATH_KERNEL_MATURE_CANDIDATE_THRESHOLD_PASSED
FORMULA_ADMISSION_PATH_READY
UNIFIED_FORMULA_INSPECTOR_READY
EXTERNAL_WORLD_EVIDENCE_STACK_READY
TRUTH_PRESSURE_SYNTHESIS_READY_V0_1_1
```

This means:

```text
working deterministic language-math brain for covered grammar
formula memory exists
formula inspection exists
newly learned meanings can be admitted as candidate formulas
unified formula inspection exists
proof traces exist
claim-language analysis exists
claim traces exist
external anchors exist
source/provenance tracking exists
evidence/media tracking exists
truth-pressure synthesis v0.1.1 exists
no LLM dependency for structured packets
no source lookup dependency for structured packets
```

This does not mean:

```text
every word in every language has coverage
every source type has full anchor schema coverage
every real-world event can be adjudicated automatically
external truth is finalized without evidence anchors
admitted meanings are canonical doctrine
truth-pressure synthesis is final truth promotion
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

The remaining work is not core-language invention from zero.

The remaining work is:

```text
larger multilingual and claim benchmark
world-model relation expansion
stress testing against adversarial narrative forms
real-world packet ingestion discipline
```

## Next build

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

Each new layer should include exactly these four files unless there is a good reason not to:

```text
src/<module>.js
<module>-test.html
<module-ui>.html
HANDOFF_<date>_<MODULE>.md
```

Every layer must state:

```text
what it consumes
what it produces
what it refuses to do
cache keys
browser test URL
UI URL
next suggested layer
```

## Naming rule

Patch files should only be used for small corrections:

```text
src/<module>-v0-1-1-patch.js
```

Do not create patch files for unrelated new features.

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
