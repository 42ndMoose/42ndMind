# HANDOFF 2026-05-18: Intention Canonical Formula Ledger v0.1

## Scope

This handoff records the canonical formula ledger layer for the objective intention-language kernel.

This layer is not claim-intent detection, not propaganda analysis, not a political/narrative truth module, and not a real-world belief ledger.

It stores objective intention-language formula candidates and staged revision candidates as versioned formula memory.

## Built files

```text
src/kernel-intention-canonical-formula-ledger-v0-1.js
kernel-intention-canonical-formula-ledger-v0-1-test.html
intention-canonical-formula-ledger.html
HANDOFF_2026_05_18_INTENTION_CANONICAL_FORMULA_LEDGER.md
```

## Dependency stack

The ledger loads the existing v0.1 stack:

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
```

## Purpose

The ledger stores:

```text
compiled formulas from the expansion/compiler stack
staged revision candidates from the formula revision engine
source formula snapshots
revision guards
validation results
revision trails
rollback targets
promotion status
belief movement state
```

The ledger does not replace formulas silently. It records versions.

## Core preserved doctrine

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
contradiction detection is not contradiction resolution
no silent mutation of source formulas
growth means subdivision, not mass inflation
```

## Ledger record shape

Each concept record follows this shape:

```text
{
  ledger_id,
  concept,
  current_candidate_version,
  versions: [
    {
      version_id,
      source_type: compiled_formula | staged_revision,
      concept,
      formula_snapshot,
      source_formula_snapshot,
      shape_terms,
      force_terms,
      symbolic_formula,
      force_equation,
      guards,
      validation,
      created_at,
      promotion_status: not_promoted,
      doctrine_status: candidate_not_doctrine,
      belief_movement: none
    }
  ],
  revision_trail,
  rollback_available: true,
  rollback_targets,
  doctrine_status: candidate_not_doctrine,
  belief_movement: none
}
```

## Behavior

For each of the 11 expanded concepts, the ledger creates:

```text
v0001 compiled_formula
v0002 staged_revision
```

The current candidate version is the staged revision version, but it remains:

```text
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

The compiled version is preserved as a rollback target.

The staged revision stores the source formula snapshot and guards. It does not mutate the compiled version.

## Validation behavior

The browser test is designed to report:

```text
8/8 passed
```

Test groups:

```text
1. modules load and doctrine is ledger-only
2. ledger runs and has 11 concepts
3. compiled and staged versions stored for every concept
4. all L1 totals remain 1
5. force terms remain outside shape
6. candidate-only status and belief movement are preserved
7. rollback data and validation snapshots are present
8. no silent overwrite or source mutation
```

The validation packet checks:

```text
ledger_has_11_concepts
compiled_version_stored_for_each_concept
staged_revision_version_stored_for_each_concept
version_count_at_least_2_per_concept
all_l1_totals_equal_1
force_terms_outside_shape
all_promotion_status_not_promoted
belief_movement_none
rollback_data_present
no_silent_overwrite
```

## Public page

Open:

```text
intention-canonical-formula-ledger.html?v=ledger-1
```

The page automatically runs the ledger and shows:

```text
LEDGER_READY_CANDIDATE_ONLY
ledger record count
total version count
per-concept cards
compiled/staged version cards
summary JSON
full packet JSON
```

## Browser test

Open:

```text
kernel-intention-canonical-formula-ledger-v0-1-test.html?v=ledger-1
```

Expected result:

```text
8/8 passed
```

If the browser cache behaves strangely, hard refresh with the exact cache key above.

## Important implementation notes

The ledger uses the same expansion packet when running the formula revision engine:

```text
const expansionPacket = options.expansion_packet || expansionApi().runExpansion(...)
const revisionPacket = options.revision_packet || revisionApi().runRevisionEngine({ expansion_packet: expansionPacket })
```

This preserves alignment between compiled formulas and staged revisions.

The staged revision version verifies that its source formula snapshot matches the compiled version snapshot:

```text
sourceSnapshotMatchesCompiled(stagedVersion, compiledVersionRow)
```

If that check fails, validation reports:

```text
staged_source_snapshot_does_not_match_compiled_version
```

## What not to do next

Do not build political/narrative belief storage yet.

Do not build a claim/world-model ledger yet.

Do not use real people/events/political claims inside the intention-language brain.

Do not make the language brain decide what is propaganda yet.

That belongs later in a separate belief/world-model brain.

## Suggested next tasks

Next maturity layers should be one small layer at a time:

```text
1. broad cross-language benchmark
2. large minimal-pair library
3. automatic dimension-splitting
4. arbitrary-language parser
5. proof-style output
6. coefficient/dimension revision engine
```

Recommended next task:

```text
Build the broad cross-language benchmark.
```

Reason:

```text
The ledger now gives durable version memory, so the next useful maturity test is whether the candidate formula structures survive real language variation rather than only English labels and small alias cases.
```
