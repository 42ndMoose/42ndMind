# HANDOFF 2026-05-17: Intention Concept Expansion Loop v0.1

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
```

Do not read unrelated uploaded files.

## Confirmed state before this layer

Completed:

```text
5. lattice invariance benchmark
6. formula compiler
```

This handoff covers:

```text
7. concept expansion loop
```

## Goal

Expand the objective intention-language workbench beyond the initial concepts:

```text
desire
lying
promise
```

while preserving the same pipeline:

```text
concept seed
-> discovery
-> refinement
-> necessity testing
-> neighbor lattice
-> lattice invariance benchmark
-> formula compiler
```

## New module

```text
src/kernel-intention-concept-expansion-loop-v0-1.js
```

Purpose:

```text
Add more intention concepts while preserving the full candidate-only pipeline.
```

## Expanded concepts

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

## Doctrine

```text
expands_intention_concepts_not_claim_facts: true
no_real_world_intent_attribution: true
no_person_event_or_narrative_belief_ledger: true
expanded_concepts_are_candidate_not_doctrine: true
concept_scope_total: 1
local_shape_l1_total: sum_abs_dimensions_equals_1
force_intensity_outside_shape: F = M · i
expansion_must_pass_discovery_refinement_necessity_lattice_invariance_compiler: true
belief_movement: none
```

## Expansion design

The expansion module does not modify the base discovery/refinement/necessity modules.

It adds a separate expansion loop with:

```text
blueprints()
buildDiscoverySeeds()
buildRefinementSuites()
buildNecessitySuites()
buildInvarianceCases()
runExpansion()
```

Each expanded concept has:

```text
core dimensions
boundary dimensions
derivative/expression dimensions
force dimension outside shape
contrast concepts
necessity removal effects
```

## Output

`runExpansion()` returns:

```text
expanded_concept_count
expanded_concepts
source_summary
discovery_packet
refinement_packet
necessity_packet
lattice_packet
invariance_packet
compiled_packet
validation
belief_movement: none
```

The `compiled_packet` contains formula packets for all 11 expanded concepts.

## Browser test

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-concept-expansion-loop-v0-1-test.html?v=expansion-1
```

Expected:

```text
8/8 passed
expanded_concept_count: 11
expanded concepts present:
- consent
- threat
- request
- refusal
- trust
- betrayal
- doubt
- belief
- fear
- coercion
- manipulation
source_summary all true:
- discovery_ok
- refinement_ok
- necessity_ok
- lattice_ok
- invariance_ok
- compiler_ok
all compiled formula L1 totals = 1
force terms stay outside shape
review_status = compiled_candidate_not_doctrine
belief_movement: none
```

## Inspection page

```text
https://42ndmoose.github.io/42ndMind/intention-concept-expansion.html?v=expansion-1
```

Expected:

```text
Decision: EXPANSION_READY
Concepts: 11
Compiled: 11
```

## Current commits for this layer

```text
8054def Add intention concept expansion loop module
3b6c9f4 Add intention concept expansion browser test
20804d7 Add intention concept expansion inspection page
```

## Next task

After browser test passes, begin item 8:

```text
contradiction/refinement loop
```

Candidate module:

```text
src/kernel-intention-contradiction-refinement-loop-v0-1.js
```

Goal:

```text
Let new concepts pressure old formulas and each other without losing unit-total structure.
```

The contradiction/refinement loop should:

```text
- compare compiled formulas across concepts
- detect role conflicts and neighbor contradictions
- detect force/shape leakage
- detect duplicate or overly broad dimensions
- propose refinement actions
- never auto-promote doctrine
- preserve belief_movement: none
- preserve local Σ |dimension_i| = 1
```

Likely first checks:

```text
consent vs coercion
request vs threat
trust vs betrayal
belief vs doubt
fear vs threat
manipulation vs persuasion/advice/coercion
```

Still do not implement real-world intent attribution or political/narrative belief storage here.