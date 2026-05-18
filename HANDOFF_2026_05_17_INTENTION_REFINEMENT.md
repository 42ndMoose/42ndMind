# HANDOFF 2026-05-17: Intention Refinement v0.1

## Read first

```text
HANDOFF_2026_05_17_AUTO_GROWTH_UNIT_TOTAL_LANGUAGE.md
HANDOFF_2026_05_17_AUTO_GROWTH_FUTURE_PREFLIGHT.md
HANDOFF_2026_05_17_INTENTION_DISCOVERY.md
HANDOFF_2026_05_17_INTENTION_REFINEMENT.md
```

Do not read unrelated uploaded files.

## Goal

The user’s objective-language goal is to discover intention as mathematical structure.

This layer does not ask whether a real person had an intent.

It asks:

```text
Which dimensions are part of the intention concept itself?
Which are boundary/context dimensions?
Which are expression or derivative dimensions?
Which are force/intensity dimensions and must stay outside the shape?
```

## New module

```text
src/kernel-intention-refinement-v0-1.js
```

Purpose:

```text
Applies deterministic contrast pressure to candidate intention concept-shapes from kernel-intention-discovery-v0-1.js.
```

It refines each candidate into:

```text
core_shape
boundary_shape
expression_or_derivative_shape
force dimensions outside shape
unresolved_shape if not classified
```

Current refined concepts:

```text
desire
lying
promise
```

## Doctrine

```text
refines_intention_concepts_not_claim_facts: true
no_real_world_intent_attribution: true
no_person_event_or_narrative_belief_ledger: true
formulas_remain_candidate_not_doctrine: true
contrast_pressure_is_discovery_hygiene_not_truth: true
refined_shape_l1_total: sum_abs_dimensions_equals_1
unit_total_growth_is_subdivision_not_mass_inflation: true
force_intensity_remains_separate_from_shape: true
belief_movement: none
```

## Important conceptual distinction

Discovery layer:

```text
seed concept -> candidate dimensions -> candidate unit-total formula
```

Refinement layer:

```text
candidate formula -> contrast pressure -> dimension roles -> refined candidate formula
```

Neither layer produces final doctrine yet.

## Examples of current refinement logic

Desire:

```text
core_shape:
- recognized_gap_or_absence
- preferred_possible_state
- valuation_of_preferred_state
- attainment_pull

boundary_shape:
- constraint_contact

expression_or_derivative_shape:
- action_or_attention_orientation

force:
- intensity
```

Lying:

```text
core_shape:
- proposition_representation
- communicative_assertion_act
- belief_assertion_mismatch
- audience_belief_update_target
- concealment_of_mismatch

expression_or_derivative_shape:
- advantage_avoidance_or_control_pressure

force:
- severity_or_harm
```

Promise:

```text
core_shape:
- future_action_or_state_commitment
- speaker_ownership_of_commitment
- recipient_reliance_invitation
- normative_obligation_creation

boundary_shape:
- condition_or_scope_boundary

expression_or_derivative_shape:
- breach_meaning_if_failed

force:
- trust_stakes
```

## Browser test

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-refinement-v0-1-test.html?v=refine-1
```

Expected:

```text
8/8 passed
3 refinements
desire, lying, promise
all refined L1 totals = 1
force dimensions excluded from refined shape
refined_candidate_not_doctrine
belief_movement: none
```

## Inspection page

```text
https://42ndmoose.github.io/42ndMind/intention-refinement.html?v=refine-1
```

Expected:

```text
Decision: REFINEMENT_READY
Refinements: 3
```

## Current commits for this layer

```text
9b7d2ba Add intention refinement module
0c55ea2 Add intention refinement browser test
a1ff368 Add intention refinement inspection page
```

## Next task

After browser test passes, add a contradiction/refinement pressure layer that tests whether a dimension can be removed without destroying the concept.

Candidate module:

```text
src/kernel-intention-necessity-test-v0-1.js
```

Target behavior:

```text
for each refined concept:
- remove one dimension at a time
- ask whether the concept collapses, shifts to a neighbor, or remains intact
- classify dimension as necessary, boundary, derivative, or optional
- preserve Σ |dimension_i| = 1 after every test
- preserve force/intensity separation
- keep belief_movement: none
- never promote doctrine automatically
```

This is the next step toward discovering the actual objective language of mathematical intention.