# HANDOFF 2026-05-18: Intention Cross-Language Benchmark v0.1

## Scope

This handoff records the first broad cross-language benchmark layer for the objective intention-language kernel.

This layer is not a full arbitrary-language parser yet.

It is a deterministic invariance benchmark that tests whether the canonical formula ledger preserves formula identity across multiple language surfaces.

## Built files

```text
src/kernel-intention-cross-language-benchmark-v0-1.js
kernel-intention-cross-language-benchmark-v0-1-test.html
intention-cross-language-benchmark.html
HANDOFF_2026_05_18_INTENTION_CROSS_LANGUAGE_BENCHMARK.md
```

## Dependency stack

The benchmark loads the existing v0.1 stack through the canonical formula ledger:

```text
src/kernel-intention-discovery-v0-1.js?v=intent-1
src/kernel-intention-refinement-v0-1.js?v=refine-1
src/kernel-intention-necessity-test-v0-1.js?v=necessity-1
src/kernel-intention-neighbor-lattice-v0-1.js?v=lattice-3
src/kernel-intention-lattice-invariance-benchmark-v0-1.js?v=invariance-2
src/kernel-intention-formula-compiler-v0-1.js?v=formula-1
src/kernel-intention-concept-expansion-loop-v0-1.js?v=expansion-2
src/kernel-intention-contradiction-refinement-loop-v0-1.js?v=contradiction-1
src/kernel-intention-formula-revision-engine-v0-1.js?v=revision-1
src/kernel-intention-canonical-formula-ledger-v0-1.js?v=ledger-1
src/kernel-intention-cross-language-benchmark-v0-1.js?v=xlang-1
```

## Purpose

The benchmark tests whether the current candidate formula versions survive broad language surface variation.

It checks:

```text
concept identity
current candidate version identity
shape signature
shape term count
Σ |dimension_i| = 1
force terms outside shape
candidate-only status
belief_movement: none
```

## Languages covered

```text
English
en

Indonesian
id

Tagalog
tl

Japanese
ja

Spanish
es

Arabic
ar
```

## Concepts covered

The benchmark runs all 11 canonical ledger records:

```text
consent
threat
request
refusal
trust
betrayal
doubt
belief
fear
coercion
manipulation
```

## Expected case count

```text
6 languages × 11 concepts = 66 cases
```

## Important doctrine preserved

```text
intention_type = 1
local concept shape = 1
Σ |dimension_i| = 1
force/intensity remains outside shape
F = M · i
belief_movement: none
candidate only unless a future ledger explicitly promotes it
no real-world intent attribution
no person/event/narrative belief ledger inside the language brain
cross-language agreement is discovery hygiene, not doctrine promotion
not an arbitrary parser yet
```

## Test behavior

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-cross-language-benchmark-v0-1-test.html?v=xlang-1
```

Expected browser result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is cross-language only
2. benchmark runs from canonical ledger
3. six languages are covered
4. eleven concepts and sixty-six cases are covered
5. all language cases preserve concept and version identity
6. all L1 totals remain 1
7. force terms remain outside shape
8. candidate-only status and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-cross-language-benchmark.html?v=xlang-1
```

Expected metrics if the page passes:

```text
Decision: CROSS_LANGUAGE_STRUCTURE_HELD
Languages: 6
Cases: 66
Passed: 66
```

## What this proves and does not prove

This layer does prove that the current canonical formula ledger can be projected through six language surfaces without changing the formula identity, current version identity, L1 total, force separation, or candidate-only status.

This layer does not yet prove arbitrary natural-language understanding.

It does not parse raw free text such as:

```text
He agreed because he had no real choice.
```

That belongs to the future arbitrary-language parser layer.

## Suggested next task

The best next layer is proof-style output.

Reason:

```text
The kernel now has:
- formula discovery
- refinement
- necessity testing
- neighbor lattice
- invariance checks
- compiler
- expansion
- contradiction pressure
- staged revisions
- canonical ledger
- cross-language invariance benchmark
```

Before adding a complex arbitrary parser, the system should be able to explain its own formula relations in proof form.

That gives the future parser a clean target output and makes the kernel readable to humans.

Suggested files:

```text
src/kernel-intention-proof-output-v0-1.js
kernel-intention-proof-output-v0-1-test.html
intention-proof-output.html
HANDOFF_2026_05_18_INTENTION_PROOF_OUTPUT.md
```

Expected proof output style:

```text
Given: consent_i
Version: consent_v0002_staged_revision
Shape: Σ |dimension_i| = 1
Force: F_consent = M_consent · CONSENT_i^r
Remove: voluntary_authorization
Observed transition: consent -> coercion
Therefore: voluntary_authorization is necessary-core pressure separating consent from coercion.
Promotion status: not_promoted
Belief movement: none
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not use real people/events/political claims inside the intention-language brain.

Do not make the language brain decide what is propaganda.

Do not make cross-language benchmark results doctrine.
