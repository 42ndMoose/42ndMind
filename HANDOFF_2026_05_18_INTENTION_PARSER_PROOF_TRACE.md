# HANDOFF 2026-05-18: Intention Parser Proof Trace v0.1

## Scope

This handoff records the parser-to-proof trace layer for the objective intention-language kernel.

This layer turns arbitrary-language parser results into readable proof-style translation traces.

It does not re-parse text. It does not infer hidden intent. It does not build a belief/world-model ledger. It does not promote doctrine.

## Built files

```text
src/kernel-intention-parser-proof-trace-v0-1.js
kernel-intention-parser-proof-trace-v0-1-test.html
intention-parser-proof-trace.html
HANDOFF_2026_05_18_INTENTION_PARSER_PROOF_TRACE.md
```

## Dependency stack

The parser proof trace layer loads the existing v0.1/v0.1.1 stack through the arbitrary-language parser:

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
```

## Purpose

The trace layer translates each parser result into a readable proof-style explanation:

```text
input phrase
normalized input
parse status
top candidate
candidate version
candidate formula
alias hits
matched dimensions
unresolved dimensions
ambiguity score
proof reference
shape invariant
observed L1 total
force separation
candidate-only conclusion
belief_movement: none
```

## Trace behavior

For each parser row, the module:

```text
reads the top parser candidate
finds the matching canonical ledger v0.1.1 concept record
finds the current v0003 candidate formula version
finds the proof-output reference for that concept
preserves matched aliases
preserves matched dimensions
preserves unresolved dimensions
preserves ambiguity score
copies formula snapshot
copies proof excerpt
renders trace_lines and trace_text
keeps promotion_status: not_promoted
keeps doctrine_status: candidate_not_doctrine
keeps belief_movement: none
```

## Output shape

Each trace contains:

```text
trace_id
parse_id
input_text
normalized_text
parse_status
top_concept
second_concept
candidate_version
formula_snapshot
alias_hits
matched_dimensions
unresolved_dimensions
matched_dimension_count
unresolved_dimension_count
ambiguity_gap
ambiguity_score
proof_reference
proof_excerpt
observed_l1_total
force_terms_outside_shape
promotion_status
doctrine_status
trace_lines
trace_text
conclusion
belief_movement
```

## Expected sample behavior

The current built-in parser produces:

```text
Parse cases: 12
Trace count: 12
```

Each trace should show:

```text
candidate_version includes v0003_coefficient_dimension_revision
formula snapshot present
proof reference present
ambiguity visible
unresolved dimensions visible
L1 total = 1
force terms outside shape
not_promoted
candidate_not_doctrine
belief_movement: none
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
https://42ndmoose.github.io/42ndMind/kernel-intention-parser-proof-trace-v0-1-test.html?v=ptrace-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is trace-only
2. trace runs from parser, ledger, and proof output
3. twelve traces are produced
4. every trace has v0003 formula snapshot and proof reference
5. trace text exposes aliases, matched dimensions, unresolved dimensions, and ambiguity
6. all L1 totals equal 1 and force remains outside shape
7. candidate-only status and belief movement are preserved
8. validation report is clean
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-parser-proof-trace.html?v=ptrace-1
```

Expected metrics if the page passes:

```text
Decision: PARSER_PROOF_TRACE_READY
Traces: 12
```

The UI also includes a custom text box so neutral text can be parsed and traced into a formula explanation.

## What this proves and does not prove

This layer proves the kernel can translate parser results into inspectable mathematical-language traces.

It turns the current pipeline into:

```text
ordinary neutral text
-> parser candidate
-> canonical v0003 formula memory
-> proof reference
-> visible ambiguity
-> visible unresolved dimensions
-> proof-style trace
```

It does not yet do deep semantic language understanding.

It does not yet handle arbitrary multilingual input.

It does not yet build a belief/world-model ledger.

## Suggested next task

The best next layer is end-to-end language-to-formula benchmark v0.1.

Reason:

```text
The kernel can now parse text and explain the parse as a proof trace.
The next layer should benchmark the entire chain as one target:
input text -> candidate concept -> v0003 formula -> proof trace -> invariant checks.
```

Suggested files:

```text
src/kernel-intention-language-to-formula-benchmark-v0-1.js
kernel-intention-language-to-formula-benchmark-v0-1-test.html
intention-language-to-formula-benchmark.html
HANDOFF_2026_05_18_INTENTION_LANGUAGE_TO_FORMULA_BENCHMARK.md
```

Expected purpose:

```text
Run end-to-end tests over all 11 concepts plus ambiguity cases.
Score whether ordinary language maps into formula memory and proof traces while preserving invariants.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote parsed traces to doctrine.
