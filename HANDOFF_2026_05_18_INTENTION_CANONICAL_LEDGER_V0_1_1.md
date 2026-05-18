# HANDOFF 2026-05-18: Intention Canonical Formula Ledger v0.1.1

## Scope

This handoff records the canonical formula ledger v0.1.1 ingestion patch.

This layer appends coefficient/dimension staged revisions as v0003 candidate versions in the canonical formula ledger.

It does not replace v0001 or v0002. It does not promote doctrine. It does not mutate source formulas.

## Built files

```text
src/kernel-intention-canonical-formula-ledger-v0-1-1-patch.js
kernel-intention-canonical-formula-ledger-v0-1-1-test.html
intention-canonical-formula-ledger-v0-1-1.html
HANDOFF_2026_05_18_INTENTION_CANONICAL_LEDGER_V0_1_1.md
```

## Dependency stack

The ledger v0.1.1 patch loads the existing v0.1 stack through the coefficient/dimension revision engine:

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
```

## Purpose

The v0.1.1 ledger patch stores the staged v0003 coefficient/dimension revisions as durable candidate versions.

For each of the 11 concepts, the ledger should now contain:

```text
v0001 compiled_formula
v0002 staged_revision
v0003 coefficient_dimension_revision
```

Expected totals:

```text
Ledger records: 11
Versions per concept: 3
Total versions: 33
```

## Current candidate policy

The current candidate version is updated to v0003:

```text
current_candidate_version = <concept>_v0003_coefficient_dimension_revision
```

This does not promote the version.

The v0003 version remains:

```text
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

## Ledger behavior

For each concept record, the patch:

```text
reads the base canonical ledger v0.1 record
reads the coefficient/dimension revision engine output
builds a v0003 coefficient_dimension_revision version
appends v0003 without replacing v0001 or v0002
sets current_candidate_version to v0003
adds revision trail event
adds rollback targets to v0002 and v0001
preserves source formula snapshots
preserves force terms outside shape
preserves all local L1 totals = 1
keeps all versions not_promoted
keeps belief_movement: none
```

## v0003 version shape

Each v0003 version contains:

```text
version_id
source_type: coefficient_dimension_revision
concept
parent_version_id
formula_snapshot
source_formula_snapshot
shape_terms
force_terms
symbolic_formula
force_equation
guards
validation
revision_trail
rollback_available
rollback_target
created_at
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
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
no source formula mutation
no formula replacement without version trail
v0001 preserved
v0002 preserved
v0003 appended
rollback data present
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-canonical-formula-ledger-v0-1-1-test.html?v=ledger-2
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is ledger-ingestion only
2. ledger v0.1.1 runs from base ledger and coefficient-dimension revisions
3. eleven concepts and thirty-three total versions are present
4. v0001, v0002, and v0003 are preserved for every concept
5. current candidate is v0003 and remains unpromoted
6. v0003 has ten dimensions and all L1 totals remain 1
7. force terms, rollback, and overwrite protection are preserved
8. source snapshots and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-canonical-formula-ledger-v0-1-1.html?v=ledger-2
```

Expected metrics if the page passes:

```text
Decision: LEDGER_V0_1_1_READY_WITH_V0003
Ledger records: 11
Total versions: 33
```

## What this proves and does not prove

This layer proves the kernel can store split-dimension staged revisions as durable candidate formula versions while preserving previous versions.

It makes the kernel's formula memory deeper:

```text
compiled baseline
staged guarded revision
split-dimension staged revision
```

It does not yet promote v0003 to doctrine.

It does not yet use arbitrary natural-language parsing.

It does not yet create a live parser from ordinary text to formula structure.

## Suggested next task

The best next layer is arbitrary-language parser v0.1.

Reason:

```text
The kernel now has durable formula memory, cross-language invariance, proof output, minimal-pair pressure, dimension splitting, staged coefficient/dimension revision, and v0003 ledger ingestion.

The next goal is to let arbitrary text map into these candidate formula structures without using real-world belief attribution.
```

Suggested files:

```text
src/kernel-intention-arbitrary-language-parser-v0-1.js
kernel-intention-arbitrary-language-parser-v0-1-test.html
intention-arbitrary-language-parser.html
HANDOFF_2026_05_18_INTENTION_ARBITRARY_LANGUAGE_PARSER.md
```

Expected purpose:

```text
Parse neutral language samples into candidate intention formula matches.
Use the canonical ledger v0.1.1 formulas as target structures.
Return candidate concept, matched dimensions, unresolved dimensions, ambiguity score, proof reference, and no belief movement.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote v0003 revisions to doctrine.
