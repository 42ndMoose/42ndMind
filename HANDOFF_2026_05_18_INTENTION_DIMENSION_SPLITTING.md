# HANDOFF 2026-05-18: Intention Dimension Splitting v0.1

## Scope

This handoff records the candidate automatic dimension-splitting layer for the objective intention-language kernel.

This layer uses minimal-pair pressure to propose candidate subdivisions of existing shape dimensions.

It does not apply the split to the source formula. It does not promote doctrine. It does not increase conceptual mass.

## Built files

```text
src/kernel-intention-dimension-splitting-v0-1.js
kernel-intention-dimension-splitting-v0-1-test.html
intention-dimension-splitting.html
HANDOFF_2026_05_18_INTENTION_DIMENSION_SPLITTING.md
```

## Dependency stack

The dimension-splitting layer loads the existing v0.1 stack through the minimal-pair library:

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
src/kernel-intention-dimension-splitting-v0-1.js?v=split-1
```

## Purpose

The layer creates candidate split records for each current shape dimension in the canonical formula ledger.

Current expected inputs:

```text
Minimal pairs: 110
Canonical ledger records: 11
Shape dimensions per concept: 5
```

Expected output:

```text
11 concepts × 5 dimensions = 55 split candidates
```

## Split candidate behavior

For each parent dimension, the splitter:

```text
reads the current candidate formula version
finds minimal-pair pressure touching that dimension
creates two child dimensions
redistributes the parent coefficient equally across children
preserves source formula snapshot
preserves source L1 total = 1
preserves revised L1 total = 1
keeps force terms outside shape
marks split as candidate_not_doctrine
marks split as not_promoted
keeps rollback data
keeps belief_movement: none
```

## Child naming pattern

The first version uses role-sensitive generic child names:

```text
core_shape
-> identity_component
-> contrast_boundary_component

boundary_shape
-> scope_component
-> limit_component

expression_or_derivative_shape
-> signal_component
-> expression_boundary_component

other role
-> primary_component
-> pressure_component
```

Example:

```text
voluntary_authorization
-> voluntary_authorization_identity_component
-> voluntary_authorization_contrast_boundary_component
```

This is intentionally conservative. It does not claim the child labels are final. It produces a reversible candidate split structure.

## Output shape

Each split candidate contains:

```text
split_id
concept
source_version_id
parent_dimension
parent_role
parent_coefficient
pressure_pair_count
pressure_pair_ids
split_reason
child_terms
source_shape_terms
revised_shape_terms
force_terms
source_l1_total
revised_l1_total
mass_change
force_terms_outside_shape
source_formula_snapshot
revised_symbolic_formula
action_status
promotion_status
doctrine_status
rollback_available
rollback_target
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
no formula mutation
no doctrine promotion
no belief/world-model storage
source formula remains intact
old dimension mass is redistributed, not inflated
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-dimension-splitting-v0-1-test.html?v=split-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is split-only
2. dimension splitting runs from minimal-pair library and ledger
3. eleven concepts and fifty-five split candidates are produced
4. each concept has five split candidates and ten pressure pairs
5. split children redistribute parent coefficient without mass inflation
6. force terms remain outside revised shape
7. source formulas remain intact and rollback data is present
8. candidate-only status and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-dimension-splitting.html?v=split-1
```

Expected metrics if the page passes:

```text
Decision: DIMENSION_SPLIT_CANDIDATES_READY
Concepts: 11
Split candidates: 55
```

## What this proves and does not prove

This layer proves that the kernel can propose reversible candidate subdivisions while preserving unit-total shape and force separation.

It does not yet decide which splits should be accepted.

It does not yet create a new compiled formula version in the canonical ledger.

It does not yet revise coefficients based on deeper pressure.

It does not yet parse arbitrary natural language.

## Suggested next task

The best next layer is coefficient/dimension revision engine v0.1.

Reason:

```text
The kernel now has minimal-pair pressure and candidate dimension splits.
The next layer should stage revised formula versions that include split dimensions, still without applying or promoting them.
```

Suggested files:

```text
src/kernel-intention-coefficient-dimension-revision-engine-v0-1.js
kernel-intention-coefficient-dimension-revision-engine-v0-1-test.html
intention-coefficient-dimension-revision.html
HANDOFF_2026_05_18_INTENTION_COEFFICIENT_DIMENSION_REVISION.md
```

Expected purpose:

```text
Take split candidates and propose staged formula revisions with split dimensions.
Preserve source formula snapshots.
Preserve local L1 = 1.
Keep force outside shape.
Keep promotion_status: not_promoted.
Keep belief_movement: none.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote split candidates to doctrine.
