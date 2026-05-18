# HANDOFF 2026-05-17: Intention Discovery v0.1

## Read first

```text
HANDOFF_2026_05_17_AUTO_GROWTH_UNIT_TOTAL_LANGUAGE.md
HANDOFF_2026_05_17_AUTO_GROWTH_FUTURE_PREFLIGHT.md
HANDOFF_2026_05_17_INTENTION_DISCOVERY.md
```

Do not read unrelated uploaded files.

## Goal shift clarified

The user clarified that the objective-language goal is not first to detect the intent behind real-world claims.

The immediate goal is deeper:

```text
Discover intention itself as objective mathematical structure.
```

Meaning:

```text
intention = 1
intention concept = 1
Σ |dimension_i| = 1
force/intensity remains separate from shape
```

The kernel should learn the objective grammar of intention before it tries to attribute intention to people, claims, events, or narratives.

Example:

```text
Do not start with: Did Bob lie?
Start with: What is lying as a complete intention-form?
```

## New module

```text
src/kernel-intention-discovery-v0-1.js
```

Purpose:

```text
Discovers candidate mathematical concept-shapes for intention types.
```

Current seed concepts:

```text
desire
lying
promise
```

This is intentionally not final doctrine. It is a discovery workbench.

## Core doctrine in module

```text
discovers_intention_concepts_not_claim_facts: true
intention_type_scope_total: 1
active_shape_l1_total: sum_abs_dimensions_equals_1
unit_total_growth_is_subdivision_not_mass_inflation: true
force_intensity_remains_separate_from_shape: true
contrast_cases_are_discovery_pressure_not_truth: true
formulas_are_candidate_discoveries_not_doctrine: true
no_person_event_or_narrative_belief_ledger: true
no_real_world_intent_attribution: true
belief_movement: none
```

## Discovery output shape

Each candidate includes:

```text
concept
question
scope_total: 1
shape_dimensions
force_dimensions
normalized_shape
contrast_concepts
exclusion_frames
minimal_pairs
symbolic_formula
review_status: candidate_discovered_not_doctrine
belief_movement: none
```

The normalizer now makes the rounded L1 total exactly 1 by assigning the rounding remainder to the final shape dimension.

## Important distinction

Current output examples are candidate discovery packets, not final formulas.

The kernel is not yet proving the formula for desire, lying, or promise.

It is creating the first deterministic structure that allows formulas to be tested, contradicted, refined, and eventually stabilized.

## New browser test

```text
kernel-intention-discovery-v0-1-test.html?v=intent-1
```

Expected:

```text
8/8 passed
3 candidates
desire, lying, promise
all L1 totals = 1
force separated from shape
candidate_discovered_not_doctrine
belief_movement: none
```

## New inspection page

```text
intention-discovery.html?v=intent-1
```

Purpose:

```text
Shows candidate equations, normalized dimensions, force dimensions, contrasts, and validation output.
```

## Current commits for this layer

```text
9d0e3e7 Add intention discovery module
5aeaa8d Add intention discovery browser test
8d0aea6 Fix intention shape normalization rounding
916acda Add intention discovery inspection page
```

## Next task

Run:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-discovery-v0-1-test.html?v=intent-1
```

If it passes, inspect:

```text
https://42ndmoose.github.io/42ndMind/intention-discovery.html?v=intent-1
```

Then next engineering move:

```text
Add contradiction/refinement pressure for intention concept candidates.
```

That next layer should not promote formulas. It should:

```text
- take a concept candidate
- apply minimal-pair pressure
- identify necessary vs accidental dimensions
- identify force dimensions mistakenly included as shape
- emit refinement suggestions
- preserve belief_movement: none
```

The aim is still discovery, not claim attribution and not final doctrine.