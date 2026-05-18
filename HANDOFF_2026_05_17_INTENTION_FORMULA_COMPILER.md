# HANDOFF 2026-05-17: Intention Formula Compiler v0.1

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
```

Do not read unrelated uploaded files.

## Confirmed state before this layer

The lattice invariance benchmark passed after correcting the promise-plan benchmark assumption.

Completed item:

```text
5. lattice invariance benchmark
```

Next implemented item:

```text
6. formula compiler
```

## Goal

Compile the intention-discovery workbench into compact algebraic intention packets.

The compiler packages results from:

```text
discovery
refinement
necessity testing
neighbor lattice
lattice invariance benchmark
```

into clean formula packets per concept.

This is still:

```text
candidate only
not doctrine
no real-world intent attribution
no person/event/narrative belief ledger
belief_movement: none
force/intensity separate from shape
local concept scope total = 1
```

## New module

```text
src/kernel-intention-formula-compiler-v0-1.js
```

Purpose:

```text
Compile discovery/refinement/necessity/lattice/invariance outputs into compact algebraic intention packets.
```

## Formula output per concept

Each compiled formula includes:

```text
concept
scope_total: 1
source_status
core_terms
boundary_terms
derivative_expression_terms
unresolved_terms
shape_terms
force_terms
necessity_summary
neighbor_transitions
invariance_status
symbolic_formula
force_equation
review_status: compiled_candidate_not_doctrine
belief_movement: none
```

## Symbolic form

Example pattern:

```text
LYING_i = 0.190476·proposition_representation + ... ; Σ|dimension_i| = 1; F_lying = M_lying · LYING_i
```

The compiler keeps:

```text
shape = i
force/intensity = M
force equation = F = M · i
```

Force terms are listed outside the shape.

## Current compiled concepts

```text
desire
lying
promise
```

## Doctrine

```text
compiles_intention_formulas_not_claim_facts: true
no_real_world_intent_attribution: true
no_person_event_or_narrative_belief_ledger: true
compiled_formulas_are_candidate_not_doctrine: true
concept_scope_total: 1
shape_terms_preserve_l1_total: sum_abs_dimensions_equals_1
force_intensity_outside_shape: F = M · i
neighbor_transitions_are_candidate_structural_relations_not_truth_claims: true
invariance_status_is_discovery_hygiene_not_institutional_validation: true
belief_movement: none
```

## Browser test

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-formula-compiler-v0-1-test.html?v=formula-1
```

Expected:

```text
8/8 passed
compiled_formula_count: 3
desire, lying, promise
all shape L1 totals = 1
force terms stay outside shape
neighbor transitions compile
invariance status compiles
review_status = compiled_candidate_not_doctrine
belief_movement: none
```

## Inspection page

```text
https://42ndmoose.github.io/42ndMind/intention-formula-compiler.html?v=formula-1
```

Expected:

```text
Decision: FORMULAS_READY
Formulas: 3
```

## Current commits for this layer

```text
0b94e71 Add intention formula compiler module
46403f3 Add intention formula compiler browser test
08a63b3 Add intention formula compiler inspection page
```

## Next task

After browser test passes, begin item 7:

```text
concept expansion loop
```

Candidate module:

```text
src/kernel-intention-concept-expansion-loop-v0-1.js
```

Goal:

```text
Add more intention concepts while preserving the same pipeline:
concept seed -> discovery -> refinement -> necessity -> lattice -> invariance -> formula compiler
```

Initial next concepts:

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

Expansion must remain:

```text
candidate only
not doctrine
no real-world intent attribution
no belief movement
unit-total local concept shapes
force/intensity separate from shape
```