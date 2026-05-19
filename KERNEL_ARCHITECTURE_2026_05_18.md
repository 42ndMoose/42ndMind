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
user-supplied context is context, not automatic truth
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

Meaning:

```text
Epistemic Octahedron supplied invariant geometry and maturity semantics.
The language-math kernel operationalized them.
The alignment layer confirmed the core semantics are mathematically coherent inside the built kernel.
Newly learned meanings now enter through candidate admission records.
The unified inspector exposes canonical formulas and admitted candidate formulas in one place.
```

Important URLs:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-formula-inspector-v0-1-test.html?v=inspect-1
https://42ndmoose.github.io/42ndMind/kernel-concept-admission-registry-v0-1-test.html?v=admit-1
https://42ndmoose.github.io/42ndMind/kernel-intention-formula-inspector-v0-1-1-test.html?v=inspect-2
https://42ndmoose.github.io/42ndMind/intention-formula-inspector-v0-1-1.html?v=inspect-2
https://42ndmoose.github.io/42ndMind/epistemic-octahedron-language-alignment-v0-1-test.html?v=eoalign-1
```

Main formula inspection URL:

```text
https://42ndmoose.github.io/42ndMind/intention-formula-inspector-v0-1-1.html?v=inspect-2
```

Expected current formula counts:

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

### 5. External-world anchoring stack

```text
src/kernel-external-anchor-packet-schema-v0-1.js?v=anchor-1
src/kernel-source-provenance-registry-v0-1.js?v=prov-1
```

Status:

```text
external anchor packet schema ready
source/provenance registry ready
```

Important URLs:

```text
https://42ndmoose.github.io/42ndMind/kernel-external-anchor-packet-schema-v0-1-test.html?v=anchor-1
https://42ndmoose.github.io/42ndMind/kernel-source-provenance-registry-v0-1-test.html?v=prov-1
```

Important UI note:

```text
source records: 4
source groups: 3
```

This is correct because two source records share `user_context_group`.

## Current maturity status

```text
CORE_LANGUAGE_MATH_KERNEL_MATURE_CANDIDATE_THRESHOLD_PASSED
FORMULA_ADMISSION_PATH_READY
UNIFIED_FORMULA_INSPECTOR_READY
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
```

## What remains

The remaining work is not core-language invention from zero.

The remaining work is:

```text
evidence/media registry
larger multilingual and claim benchmark
world-model relation expansion
stress testing against adversarial narrative forms
real-world packet ingestion discipline
```

## Next build

Build evidence/media registry v0.1.

Suggested files:

```text
src/kernel-evidence-media-registry-v0-1.js
kernel-evidence-media-registry-v0-1-test.html
evidence-media-registry.html
HANDOFF_2026_05_18_EVIDENCE_MEDIA_REGISTRY.md
```

Purpose:

```text
Track evidence type, media/record/user-description posture, support/counterevidence direction, strength, independence group, source linkage, contradiction contribution, and whether evidence is direct, documentary, hearsay, or ambiguous.
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
do not promote candidates to doctrine
do not use real people/events as built-in truth examples
do not read unrelated uploaded files
```
