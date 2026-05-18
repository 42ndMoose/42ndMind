# HANDOFF 2026-05-18: Intention Arbitrary-Language Parser v0.1

## Scope

This handoff records the first arbitrary-language parser layer for the objective intention-language kernel.

This layer maps neutral text surfaces into candidate formula structures from canonical formula ledger v0.1.1.

It is deterministic v0.1. It is not a semantic oracle. It does not attribute real-world intent. It does not build a belief/world-model ledger.

## Built files

```text
src/kernel-intention-arbitrary-language-parser-v0-1.js
kernel-intention-arbitrary-language-parser-v0-1-test.html
intention-arbitrary-language-parser.html
HANDOFF_2026_05_18_INTENTION_ARBITRARY_LANGUAGE_PARSER.md
```

## Dependency stack

The parser loads the existing v0.1/v0.1.1 stack through the canonical ledger v0.1.1:

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
```

## Purpose

The parser accepts neutral text and returns candidate formula matches.

It reads:

```text
canonical ledger v0.1.1 records
current v0003 candidate versions
proof output references
concept aliases
dimension surfaces
```

It returns:

```text
parse_id
input_text
normalized_text
parse_status
top_candidate
second_candidate
ambiguity_gap
ambiguity_score
candidate list
matched dimensions
unresolved dimensions
proof reference
candidate version
promotion status
belief_movement
```

## Parse policy

The parser is intentionally conservative.

It does not infer hidden intent.

It does not decide truth.

It does not attach parsed text to a person, event, institution, claim, or narrative.

It only maps language surfaces into candidate formula structures.

## Candidate matching behavior

For each parse input, the parser:

```text
normalizes text
extracts tokens
scores concept alias hits
scores dimension-word hits
computes weighted dimension score
computes ambiguity gap
returns top and second candidate
keeps unresolved dimensions visible
links top candidate to proof reference
keeps current candidate version from ledger v0.1.1
keeps belief_movement: none
```

## Built-in samples

The v0.1 test uses 12 samples:

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

Expected parse count:

```text
12
```

Expected labelled concept matches:

```text
11/11 labelled samples match expected concept
```

The ambiguous sample is expected to keep ambiguity visible rather than force a false clean classification.

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
https://42ndmoose.github.io/42ndMind/kernel-intention-arbitrary-language-parser-v0-1-test.html?v=parser-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is parser-only
2. parser runs from canonical ledger v0.1.1 and proof output
3. twelve parse cases are produced
4. expected neutral samples map to their target concepts
5. ambiguity and unresolved dimensions remain visible
6. top candidate uses v0003 ledger memory and has proof reference
7. L1, force separation, and candidate-only status are preserved
8. belief movement and validation are clean
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-arbitrary-language-parser.html?v=parser-1
```

Expected metrics if the page passes:

```text
Decision: PARSER_CANDIDATE_MATCH_READY
Parse cases: 12
```

The UI also includes a custom text box so neutral text can be parsed into candidate structures.

## What this proves and does not prove

This layer proves the kernel can map ordinary neutral text into durable v0003 formula candidates while preserving ambiguity, unresolved dimensions, proof references, L1, force separation, candidate-only status, and belief_movement: none.

It does not yet do real semantic understanding at LLM depth.

It does not yet handle multilingual arbitrary input.

It does not yet infer hidden intent.

It does not yet build a belief/world-model ledger.

## Suggested next task

The best next layer is parser-to-proof trace v0.1.

Reason:

```text
The parser can now choose candidate formula structures.
The next step is making each parse result explain itself as a proof trace:
input phrase -> matched aliases -> matched dimensions -> unresolved dimensions -> candidate formula -> proof reference -> ambiguity status.
```

Suggested files:

```text
src/kernel-intention-parser-proof-trace-v0-1.js
kernel-intention-parser-proof-trace-v0-1-test.html
intention-parser-proof-trace.html
HANDOFF_2026_05_18_INTENTION_PARSER_PROOF_TRACE.md
```

Expected purpose:

```text
Turn parse results into readable proof traces without adding belief movement.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote parsed matches to doctrine.
