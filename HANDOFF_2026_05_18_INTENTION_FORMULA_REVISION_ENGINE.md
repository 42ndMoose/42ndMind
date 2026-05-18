# HANDOFF 2026-05-18: Intention Formula Revision Engine v0.1

## Read first

```text
HANDOFF_2026_05_17_AUTO_GROWTH_UNIT_TOTAL_LANGUAGE.md
HANDOFF_2026_05_17_AUTO_GROWTH_FUTURE_PREFLIGHT.md
HANDOFF_2026_05_17_INTENTION_DISCOVERY.md
HANDOFF_2026_05_17_INTENTION_REFINEMENT.md
HANDOFF_2026_05_17_INTENTION_NECESSITY.md
HANDOFF_2026_05_17_INTENTION_NEIGHBOR_LATTICE.md
HANDOFF_2026_05_17_INTENTION_LATTICE_INVARIANCE.md
HANDOFF_2026_05_17_INTENTION_FORMULA_COMPILER.md
HANDOFF_2026_05_17_INTENTION_CONCEPT_EXPANSION.md
HANDOFF_2026_05_17_INTENTION_CONTRADICTION_REFINEMENT.md
HANDOFF_2026_05_18_INTENTION_FORMULA_REVISION_ENGINE.md
```

Do not read unrelated uploaded files.

## Goal

This layer adds the staged formula revision engine.

The previous contradiction/refinement loop only detects pressure and proposes actions.

This new layer turns those pressures into staged revised candidate formulas while preserving:

```text
source formula remains intact
no silent mutation
no doctrine promotion
local Σ |dimension_i| = 1
force/intensity outside shape: F = M · i
belief_movement: none
```

## New module

```text
src/kernel-intention-formula-revision-engine-v0-1.js
```

Purpose:

```text
Generate staged rewritten candidate formulas from contradiction/refinement pressure.
```

## Important design

This is a guarded rewrite engine.

It does not currently change coefficients or shape terms. It stages a revised candidate formula with explicit guards:

```text
CONCEPT_i^r = source terms under guards(...); Σ|dimension_i| = 1; F_concept = M_concept · CONCEPT_i^r
```

So the first revision layer does:

```text
compiled source formula
+ contradiction/refinement pressure
-> staged guarded revised candidate
```

It does not yet do coefficient redistribution or dimension splitting.

## Output per staged revision

Each revision candidate includes:

```text
concept
revision_kind: guarded_formula_rewrite
source_review_status
staged_review_status: staged_revised_candidate_not_doctrine
source_formula_snapshot
staged_shape_terms
staged_force_terms
revision_guards
source_l1_total
revised_l1_total
revised_symbolic_formula
revision_changes_source_coefficients: false
revision_changes_source_shape_terms: false
revision_adds_guards
action_status: staged_candidate_revision_not_applied
promotion_status: not_promoted
belief_movement: none
```

## Browser test

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-formula-revision-engine-v0-1-test.html?v=revision-1
```

Expected:

```text
8/8 passed
source_compiled_formula_count: 11
revision_candidate_count: 11
guarded_revision_count >= 6
all source_l1_total = 1
all revised_l1_total = 1
force terms stay outside shape
source coefficients and shape terms are not silently changed
staged_review_status = staged_revised_candidate_not_doctrine
action_status = staged_candidate_revision_not_applied
promotion_status = not_promoted
belief_movement: none
```

## Inspection page

```text
https://42ndmoose.github.io/42ndMind/intention-formula-revision.html?v=revision-1
```

Expected:

```text
Decision: STAGED_REVISIONS_READY
Candidates: 11
Guarded: >= 6
```

## Current commits for this layer

```text
7efa067 Add intention formula revision engine module
569e2ff Wire revision engine to expansion formulas
3a7c68a Add intention formula revision engine browser test
9cccaba Add intention formula revision inspection page
```

## Next task

After the browser test passes, the next natural layer is a real coefficient/dimension revision engine.

Candidate module:

```text
src/kernel-intention-formula-coefficient-revision-v0-1.js
```

Goal:

```text
Apply staged candidate changes to coefficients or dimension splits while preserving local unit-total shape.
```

This next layer should be stricter:

```text
- take staged guarded revisions
- propose coefficient redistribution only when a guard or duplicate-pressure demands it
- propose dimension splitting only when a dimension is too broad
- preserve Σ |dimension_i| = 1
- rerun formula validation
- rerun lattice/invariance/contradiction checks
- never promote doctrine automatically
- preserve belief_movement: none
```

Do not implement political/narrative belief storage here.