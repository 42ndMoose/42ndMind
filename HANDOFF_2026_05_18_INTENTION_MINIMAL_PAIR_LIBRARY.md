# HANDOFF 2026-05-18: Intention Minimal-Pair Library v0.1

## Scope

This handoff records the minimal-pair library layer for the objective intention-language kernel.

This layer turns proof-output transition steps into structured contrast pairs.

It does not parse arbitrary language. It does not revise formulas. It does not promote doctrine.

## Built files

```text
src/kernel-intention-minimal-pair-library-v0-1.js
kernel-intention-minimal-pair-library-v0-1-test.html
intention-minimal-pair-library.html
HANDOFF_2026_05_18_INTENTION_MINIMAL_PAIR_LIBRARY.md
```

## Dependency stack

The minimal-pair library loads the existing v0.1 stack through proof output:

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
```

## Purpose

The library takes every proof-output transition step and generates two candidate minimal-pair pressure cases:

```text
1. structural_contrast
2. dimension_absence
```

Given the current proof-output result:

```text
Proofs: 11
Proof steps: 55
```

The minimal-pair library should produce:

```text
55 proof steps × 2 pair types = 110 minimal pairs
```

## Output shape

Each minimal pair contains:

```text
pair_id
concept
current_candidate_version
source_proof_id
source_step_id
pair_type
left_term
right_term
pressure_dimension
expected_neighbor
expected_transition
expected_pressure_class
removed_dimension_role
structural_pressure_weight
prompt
expected_result
explanation
observed_l1_total
force_terms_outside_shape
promotion_status
doctrine_status
belief_movement
```

## Concept grouping

The current library expects:

```text
11 concept groups
10 pairs per concept
5 structural_contrast pairs per concept
5 dimension_absence pairs per concept
110 total pairs
```

This is because each current concept has 5 proof steps, and each step creates 2 pair rows.

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
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-minimal-pair-library-v0-1-test.html?v=minpair-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is minimal-pair only
2. library runs from proof output
3. eleven concepts and one hundred ten pairs are produced
4. each concept has ten pairs split across two pair types
5. all pairs are traceable to proof steps
6. all L1 totals remain 1
7. force terms remain outside shape
8. candidate-only status and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-minimal-pair-library.html?v=minpair-1
```

Expected metrics if the page passes:

```text
Decision: MINIMAL_PAIR_LIBRARY_READY
Concepts: 11
Pairs: 110
```

## What this proves and does not prove

This layer proves that each proof-output transition can be converted into direct pressure cases.

It gives the kernel a broader contrast surface for later maturity work.

It does not yet automatically split dimensions.

It does not yet parse arbitrary natural language.

It does not yet revise coefficients or dimensions.

## Suggested next task

The best next layer is automatic dimension-splitting.

Reason:

```text
The kernel now has:
- formula discovery
- refinement
- necessity testing
- neighbor lattice
- invariance checks
- compiler
- concept expansion
- contradiction pressure
- staged revisions
- canonical formula ledger
- cross-language benchmark
- proof output
- minimal-pair pressure library
```

Minimal pairs provide pressure. The next maturity step is to detect whether any broad dimension should subdivide while preserving:

```text
Σ |dimension_i| = 1
```

Suggested files:

```text
src/kernel-intention-dimension-splitting-v0-1.js
kernel-intention-dimension-splitting-v0-1-test.html
intention-dimension-splitting.html
HANDOFF_2026_05_18_INTENTION_DIMENSION_SPLITTING.md
```

Expected purpose:

```text
Use minimal-pair pressure to propose candidate dimension splits without increasing total conceptual mass.
```

Example split pattern:

```text
voluntary_authorization
-> internal_willingness
-> external_nonconstraint
-> recognized_permission_grant
-> revocability_boundary
```

The split must preserve:

```text
old dimension coefficient redistributed across children
local shape L1 remains 1
force terms remain outside shape
source formula remains intact
split candidate is not doctrine
belief_movement: none
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote minimal pairs to doctrine.
