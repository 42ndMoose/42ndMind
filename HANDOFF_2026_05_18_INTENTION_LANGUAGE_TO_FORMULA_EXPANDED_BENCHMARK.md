# HANDOFF 2026-05-18: Intention Language-to-Formula Expanded Benchmark v0.1.1

## Scope

This handoff records the arbitrary-language parser expansion and expanded language-to-formula benchmark layer.

This layer broadens the neutral text surface without changing doctrine.

It adds more phrasings, ambiguity cases, and negative/unmatched cases.

It does not infer hidden intent. It does not build a belief/world-model ledger. It does not promote doctrine.

## Built files

```text
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js
kernel-intention-language-to-formula-expanded-benchmark-v0-1-1-test.html
intention-language-to-formula-expanded-benchmark.html
HANDOFF_2026_05_18_INTENTION_LANGUAGE_TO_FORMULA_EXPANDED_BENCHMARK.md
```

## Dependency stack

The expanded benchmark loads the existing stack through canonical ledger v0.1.1 and parser v0.1:

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
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js?v=parser-2
```

## Purpose

The v0.1.1 parser patch broadens the benchmark surface while preserving the original parser doctrine.

The expanded set contains:

```text
27 parse cases
22 labelled phrasing cases
3 ambiguity cases
2 unmatched negative cases
```

## Case groups

Labelled cases cover two phrasings each for:

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

Ambiguity cases are designed to keep ambiguity visible instead of forcing a false clean classification:

```text
request + compliance pressure
request/refusal + penalty
trust/invitation + implied harm
```

Unmatched cases use neutral object descriptions and should remain unmatched:

```text
blue triangle / quiet window
cold stone / table / lamp
```

## Expanded parser behavior

For each input, the patch:

```text
uses the base parser v0.1 parseInput function
adds expected_mode
adds expected_concept
checks expanded expected match behavior
keeps ambiguity visible
keeps unmatched cases unmatched
keeps unresolved dimensions visible
keeps candidate-only status
keeps belief_movement: none
```

## Output shape

Each expanded parse includes the base parser row plus:

```text
expected_mode
expected_concept
expected_match_v0_1_1
belief_movement: none
```

The packet includes:

```text
parse_count
labelled_case_count
ambiguity_case_count
unmatched_case_count
parses
validation
doctrine
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
unmatched cases remain unmatched
no real-world intent attribution
no person/event/narrative belief ledger
no doctrine promotion
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-language-to-formula-expanded-benchmark-v0-1-1-test.html?v=parser-2
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is parser-expansion only
2. expanded parser runs from ledger and proof output
3. twenty-seven parse cases are produced
4. twenty-two labelled cases match expected concepts
5. three ambiguity cases remain visibly ambiguous
6. two negative cases remain unmatched
7. unresolved dimensions and candidate-only status are preserved
8. validation report is clean
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-language-to-formula-expanded-benchmark.html?v=parser-2
```

Expected metrics if the page passes:

```text
Decision: EXPANDED_LANGUAGE_TO_FORMULA_READY
Parse cases: 27
Labelled: 22
Ambiguity: 3
Unmatched: 2
```

## What this proves and does not prove

This layer proves the parser can handle a broader deterministic neutral-language surface while preserving doctrine.

It strengthens the language-to-formula path by adding:

```text
more phrasing coverage
explicit ambiguity pressure
negative/unmatched controls
```

It does not yet do deep semantic language understanding.

It does not yet handle multilingual arbitrary input.

It does not yet build a belief/world-model ledger.

It does not yet decide narrative truth, propaganda, or real-world intent.

## Suggested next task

The next best layer is parser proof trace expansion v0.1.1 over the expanded parser surface.

Reason:

```text
The expanded parser now covers 27 cases.
The proof trace layer should be able to explain all non-unmatched expanded cases and explicitly explain why unmatched cases are held out.
```

Suggested files:

```text
src/kernel-intention-parser-proof-trace-v0-1-1-patch.js
kernel-intention-expanded-parser-proof-trace-v0-1-1-test.html
intention-expanded-parser-proof-trace.html
HANDOFF_2026_05_18_INTENTION_EXPANDED_PARSER_PROOF_TRACE.md
```

Expected purpose:

```text
Produce proof-style traces for expanded parser rows.
Include traceable holdout records for unmatched negative cases.
Keep candidate-only status, no attribution, no belief ledger, and no doctrine promotion.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote parsed benchmark results to doctrine.
