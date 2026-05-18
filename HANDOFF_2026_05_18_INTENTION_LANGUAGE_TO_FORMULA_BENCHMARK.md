# HANDOFF 2026-05-18: Intention Language-to-Formula Benchmark v0.1

## Scope

This handoff records the end-to-end language-to-formula benchmark layer for the objective intention-language kernel.

This layer benchmarks the full chain:

```text
neutral input text
-> parser candidate
-> canonical v0003 formula memory
-> parser proof trace
-> invariant checks
```

It does not infer hidden intent. It does not build a belief/world-model ledger. It does not promote doctrine.

## Built files

```text
src/kernel-intention-language-to-formula-benchmark-v0-1.js
kernel-intention-language-to-formula-benchmark-v0-1-test.html
intention-language-to-formula-benchmark.html
HANDOFF_2026_05_18_INTENTION_LANGUAGE_TO_FORMULA_BENCHMARK.md
```

## Dependency stack

The benchmark loads the existing v0.1/v0.1.1 stack through parser proof trace:

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
src/kernel-intention-proof-output-v0-1.js?v=proof-1
src/kernel-intention-minimal-pair-library-v0-1.js?v=minpair-1
src/kernel-intention-dimension-splitting-v0-1.js?v=split-2
src/kernel-intention-coefficient-dimension-revision-engine-v0-1.js?v=codim-1
src/kernel-intention-canonical-formula-ledger-v0-1-1-patch.js?v=ledger-2
src/kernel-intention-arbitrary-language-parser-v0-1.js?v=parser-1
src/kernel-intention-parser-proof-trace-v0-1.js?v=ptrace-1
src/kernel-intention-language-to-formula-benchmark-v0-1.js?v=l2f-1
```

## Purpose

The benchmark verifies the entire language-to-formula chain as one object.

For each case, it checks:

```text
input text exists
parser top candidate exists
trace top candidate exists
candidate version is v0003_coefficient_dimension_revision
formula text is present
proof reference is present
ambiguity score is visible
unresolved dimension count is visible
observed L1 total = 1
force terms remain outside shape
promotion_status = not_promoted
doctrine_status = candidate_not_doctrine
belief_movement = none
```

## Benchmark input set

The benchmark uses the parser v0.1 sample set:

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
ambiguous request/pressure case
```

Expected totals:

```text
Case count: 12
Labelled case count: 11
Labelled case pass count: 11
Ambiguity case count: 1
```

## Output shape

Each case result contains:

```text
case_id
input_text
expected_concept
expected_is_ambiguity_case
parser_status
parser_top_concept
trace_top_concept
candidate_version
formula_present
formula_excerpt
proof_reference_present
proof_reference
ambiguity_score
unresolved_dimension_count
observed_l1_total
force_terms_outside_shape
promotion_status
doctrine_status
expected_match
ok
errors
belief_movement
```

## Core invariants preserved

```text
intention_type = 1
local concept shape = 1
Σ |dimension_i| = 1
force/intensity remains outside shape
F = M · i
belief_movement: none
candidate only unless a future ledger explicitly promotes it
ambiguity remains visible
unresolved dimensions remain visible
no real-world intent attribution
no person/event/narrative belief ledger
no doctrine promotion
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-language-to-formula-benchmark-v0-1-test.html?v=l2f-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is benchmark-only
2. benchmark runs from ledger, proof, parser, and trace
3. twelve cases, eleven labelled matches, and one ambiguity case are present
4. each case completes input to candidate to v0003 formula to proof trace
5. ambiguity and unresolved dimensions remain visible
6. L1 totals equal 1 and force remains outside shape
7. candidate-only status and belief movement are preserved
8. validation report is clean
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-language-to-formula-benchmark.html?v=l2f-1
```

Expected metrics if the page passes:

```text
Decision: LANGUAGE_TO_FORMULA_BENCHMARK_READY
Cases: 12
Labelled pass: 11/11
Ambiguity cases: 1
```

## What this proves and does not prove

This layer proves the current kernel can run an end-to-end deterministic chain from ordinary neutral language to candidate formula memory and proof trace while preserving invariants.

It means the current build has a continuous route:

```text
ordinary neutral input
-> candidate intention formula structure
-> durable v0003 formula version
-> proof-style explanation
-> invariant validation
```

It does not yet prove deep semantic understanding.

It does not yet handle arbitrary multilingual input.

It does not yet build a belief/world-model ledger.

It does not yet decide narrative truth, propaganda, or real-world intent.

## Suggested next task

The next best layer is arbitrary-language parser expansion v0.1.1.

Reason:

```text
The end-to-end chain now exists.
The next pressure should broaden the parser surfaces without changing doctrine:
more phrasings,
more minimal pairs,
more ambiguity cases,
more negative/unmatched cases,
and eventually multilingual arbitrary-language samples.
```

Suggested files:

```text
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js
kernel-intention-language-to-formula-expanded-benchmark-v0-1-1-test.html
intention-language-to-formula-expanded-benchmark.html
HANDOFF_2026_05_18_INTENTION_LANGUAGE_TO_FORMULA_EXPANDED_BENCHMARK.md
```

Expected purpose:

```text
Broaden the text surface benchmark while keeping candidate-only status, no attribution, no belief ledger, and no doctrine promotion.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote parsed benchmark results to doctrine.
