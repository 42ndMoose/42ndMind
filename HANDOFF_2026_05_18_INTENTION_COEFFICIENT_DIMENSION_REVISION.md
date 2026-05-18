# HANDOFF 2026-05-18: Intention Coefficient/Dimension Revision Engine v0.1

## Scope

This handoff records the coefficient/dimension revision layer for the objective intention-language kernel.

This layer takes candidate dimension splits and stages candidate formula revisions that replace parent dimensions with split child dimensions.

It does not apply revisions to the canonical ledger. It does not mutate source formulas. It does not promote doctrine.

## Built files

```text
src/kernel-intention-coefficient-dimension-revision-engine-v0-1.js
kernel-intention-coefficient-dimension-revision-engine-v0-1-test.html
intention-coefficient-dimension-revision.html
HANDOFF_2026_05_18_INTENTION_COEFFICIENT_DIMENSION_REVISION.md
```

## Dependency stack

The coefficient/dimension revision layer loads the existing v0.1 stack through dimension splitting:

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
```

## Purpose

The engine stages one candidate formula revision per canonical concept.

Current expected inputs:

```text
Dimension split candidates: 55
Canonical ledger records: 11
Source dimensions per concept: 5
Split child dimensions per concept: 10
```

Expected output:

```text
11 staged revisions
5 applied split candidates per revision
source dimensions: 5
revised dimensions: 10
source L1 total: 1
revised L1 total: 1
coefficient delta total: 0
mass change: 0
```

## Staged revision behavior

For each concept, the engine:

```text
reads the current canonical ledger candidate version
finds the 5 split candidates for that concept
preserves the source formula snapshot
replaces each parent dimension with its 2 child dimensions
keeps force terms outside shape
preserves source L1 = 1
preserves revised L1 = 1
keeps total coefficient mass unchanged
adds split guards
adds revision trail
adds rollback target
marks action_status: staged_revision_not_applied
marks promotion_status: not_promoted
marks doctrine_status: candidate_not_doctrine
keeps belief_movement: none
```

## Output shape

Each staged revision contains:

```text
revision_id
concept
source_type
parent_version_id
source_ledger_id
applied_split_candidate_ids
applied_split_candidate_count
source_dimension_count
revised_dimension_count
dimension_count_delta
source_shape_terms
revised_shape_terms
force_terms
coefficient_deltas
coefficient_delta_total
source_l1_total
revised_l1_total
mass_change
force_terms_outside_shape
source_formula_snapshot
revised_symbolic_formula
force_equation
guards
revision_trail
rollback_available
rollback_target
action_status
source_formula_mutated
promotion_status
doctrine_status
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
source formula snapshots preserved
no source formula mutation
no formula replacement without version trail
old dimension mass is redistributed, not inflated
rollback data present
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-coefficient-dimension-revision-engine-v0-1-test.html?v=codim-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is coefficient-dimension revision only
2. revision engine runs from split candidates and ledger
3. eleven staged revisions are produced
4. each revision applies five splits and expands five dimensions to ten
5. L1 and coefficient mass are preserved
6. force terms remain outside revised shape
7. source snapshots, guards, trails, and rollback are present
8. candidate-only status and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-coefficient-dimension-revision.html?v=codim-1
```

Expected metrics if the page passes:

```text
Decision: COEFFICIENT_DIMENSION_REVISIONS_READY
Staged revisions: 11
Source split candidates: 55
```

## What this proves and does not prove

This layer proves the kernel can stage split-dimension formula revisions while preserving source snapshots, local L1 total, coefficient mass, force separation, rollback, and candidate-only status.

It does not yet write these v0003 revisions back into the canonical formula ledger.

It does not yet promote any revised formula.

It does not yet parse arbitrary natural language.

## Suggested next task

The best next layer is canonical ledger ingestion for coefficient/dimension staged revisions.

Reason:

```text
The new engine stages v0003 split-dimension revisions.
The canonical ledger should be able to store those staged revisions as additional candidate versions without replacing v0001 or v0002.
```

Suggested files:

```text
src/kernel-intention-canonical-formula-ledger-v0-1-1-patch.js
kernel-intention-canonical-formula-ledger-v0-1-1-test.html
intention-canonical-formula-ledger-v0-1-1.html
HANDOFF_2026_05_18_INTENTION_CANONICAL_LEDGER_V0_1_1.md
```

Expected purpose:

```text
Add v0003 coefficient_dimension_revision versions to each ledger record.
Keep v0001 compiled formula.
Keep v0002 staged formula revision.
Keep v0003 split-dimension staged revision.
Keep current_candidate_version as v0003 while still not promoted.
Preserve rollback to v0002 and v0001.
Keep belief_movement: none.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote staged revisions to doctrine.
