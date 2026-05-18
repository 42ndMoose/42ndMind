# HANDOFF 2026-05-18: Intention Expanded Parser Proof Trace v0.1.1

## Scope

This handoff records the expanded parser proof-trace layer.

This layer consumes the expanded parser v0.1.1/v0.1.2 output and turns all 27 rows into trace records.

Accepted parser rows become formula traces.

Unmatched negative controls become holdout traces.

It does not infer hidden intent. It does not build a belief/world-model ledger. It does not promote doctrine.

## Built files

```text
src/kernel-intention-parser-proof-trace-v0-1-1-patch.js
kernel-intention-expanded-parser-proof-trace-v0-1-1-test.html
intention-expanded-parser-proof-trace.html
HANDOFF_2026_05_18_INTENTION_EXPANDED_PARSER_PROOF_TRACE.md
```

## Dependency stack

The expanded trace layer loads the existing stack through expanded parser v0.1.1/v0.1.2 and base parser proof trace v0.1:

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
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js?v=parser-3
src/kernel-intention-parser-proof-trace-v0-1.js?v=ptrace-1
src/kernel-intention-parser-proof-trace-v0-1-1-patch.js?v=ptrace-2
```

## Purpose

The expanded proof-trace layer verifies that the expanded parser surface can be explained as trace records.

It produces two trace kinds:

```text
accepted_formula_trace
holdout_trace
```

Accepted traces are created for labelled and ambiguity cases.

Holdout traces are created for unmatched negative controls.

## Expected totals

```text
Trace count: 27
Accepted formula traces: 25
Holdout traces: 2
```

## Accepted formula trace behavior

Accepted rows reuse the base parser proof trace logic and then add expanded-parser metadata.

Each accepted trace preserves:

```text
input text
normalized text
parse status
top candidate
candidate v0003 formula version
formula snapshot
proof reference
alias hits
matched dimensions
unresolved dimensions
ambiguity score
observed L1 total = 1
force terms outside shape
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

## Holdout trace behavior

Holdout rows do not receive formula acceptance.

Each holdout trace records:

```text
input text
normalized text
parse status: unmatched
rejected weak candidate
rejected candidate version
alias hits
matched dimensions
unresolved dimensions
ambiguity score
holdout applied
holdout reason
conclusion: no formula acceptance
belief_movement: none
```

Holdout traces intentionally have:

```text
formula_snapshot: null
proof_reference: null
```

## Core invariants preserved

```text
intention_type = 1
local concept shape = 1 for accepted formula traces
Σ |dimension_i| = 1 for accepted formula traces
force/intensity remains outside shape for accepted formula traces
F = M · i
belief_movement: none
candidate only unless a future ledger explicitly promotes it
ambiguity remains visible
unresolved dimensions remain visible
unmatched controls produce holdout traces
holdout traces are not formula acceptances
no real-world intent attribution
no person/event/narrative belief ledger
no doctrine promotion
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-expanded-parser-proof-trace-v0-1-1-test.html?v=ptrace-2
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is expanded-trace only
2. expanded trace runs from expanded parser, ledger, and proof output
3. twenty-seven traces are produced with 25 accepted and 2 holdout traces
4. accepted traces have v0003 formula snapshots and proof references
5. holdout traces have no formula acceptance
6. ambiguity and unresolved dimensions remain visible
7. accepted L1 totals and force separation are preserved
8. candidate-only status and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-expanded-parser-proof-trace.html?v=ptrace-2
```

Expected metrics if the page passes:

```text
Decision: EXPANDED_PARSER_PROOF_TRACE_READY
Traces: 27
Accepted traces: 25
Holdout traces: 2
```

## What this proves

This layer proves the expanded language-to-formula surface now has trace accountability.

The current pipeline can show:

```text
ordinary neutral text
-> expanded parser result
-> accepted formula trace OR holdout trace
-> formula memory and proof reference when accepted
-> explicit no-acceptance trace when rejected
-> invariant validation
```

## Suggested next task

The next best layer is multilingual/cross-language expanded benchmark v0.1.

Reason:

```text
The English expanded surface is now traceable.
To move closer to language-independent math, the next pressure should test equivalent neutral inputs across languages while preserving the same formula targets and holdout behavior.
```

Suggested files:

```text
src/kernel-intention-cross-language-expanded-benchmark-v0-1.js
kernel-intention-cross-language-expanded-benchmark-v0-1-test.html
intention-cross-language-expanded-benchmark.html
HANDOFF_2026_05_18_INTENTION_CROSS_LANGUAGE_EXPANDED_BENCHMARK.md
```

Expected purpose:

```text
Run equivalent neutral samples across multiple languages or language-like surface variants.
Check whether translated surfaces preserve candidate concept targets, ambiguity visibility, unmatched holdouts, and invariant status.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote parsed traces to doctrine.
