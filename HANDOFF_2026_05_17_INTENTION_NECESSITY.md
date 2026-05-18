# HANDOFF 2026-05-17: Intention Necessity Test v0.1

## Read first

```text
HANDOFF_2026_05_17_AUTO_GROWTH_UNIT_TOTAL_LANGUAGE.md
HANDOFF_2026_05_17_AUTO_GROWTH_FUTURE_PREFLIGHT.md
HANDOFF_2026_05_17_INTENTION_DISCOVERY.md
HANDOFF_2026_05_17_INTENTION_REFINEMENT.md
HANDOFF_2026_05_17_INTENTION_NECESSITY.md
```

Do not read unrelated uploaded files.

## Goal

This layer begins testing whether refined intention dimensions are necessary.

It does this by removing one dimension at a time and checking whether the concept:

```text
- collapses
- shifts to a neighboring concept
- remains but becomes boundary-weakened
- remains but becomes expression-weakened
- remains unresolved
```

This is still not a real-world intent detector.

It does not decide whether a person lied, desired, promised, etc.

It tests concept-structure only.

## New module

```text
src/kernel-intention-necessity-test-v0-1.js
```

Purpose:

```text
Run remove-one-dimension counterfactual tests over refined intention concept-shapes.
```

Input:

```text
KernelIntentionRefinementV01.runRefinement()
```

Output:

```text
necessity candidates for desire, lying, promise
```

## Doctrine

```text
tests_intention_concepts_not_claim_facts: true
no_real_world_intent_attribution: true
no_person_event_or_narrative_belief_ledger: true
necessity_findings_are_candidate_not_doctrine: true
removal_tests_are_counterfactual_structure_pressure: true
counterfactual_shapes_preserve_l1_total: sum_abs_dimensions_equals_1
force_intensity_remains_separate_from_shape: true
unit_total_growth_is_subdivision_not_mass_inflation: true
belief_movement: none
```

## Current necessity findings

Desire:

```text
necessary_core:
- recognized_gap_or_absence
- preferred_possible_state
- valuation_of_preferred_state
- attainment_pull

boundary:
- constraint_contact

derivative_expression:
- action_or_attention_orientation
```

Lying:

```text
necessary_core:
- proposition_representation
- communicative_assertion_act
- belief_assertion_mismatch
- audience_belief_update_target
- concealment_of_mismatch

derivative_expression:
- advantage_avoidance_or_control_pressure
```

Promise:

```text
necessary_core:
- future_action_or_state_commitment
- speaker_ownership_of_commitment
- recipient_reliance_invitation
- normative_obligation_creation

boundary:
- condition_or_scope_boundary

derivative_expression:
- breach_meaning_if_failed
```

## Important behavior

For every retained refined dimension, the module creates a counterfactual shape with that dimension removed.

Every surviving counterfactual shape is renormalized so:

```text
Σ |dimension_i| = 1
```

This preserves the total-unit principle even under removal tests.

## Browser test

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-necessity-test-v0-1-test.html?v=necessity-1
```

Expected:

```text
8/8 passed
3 candidates
desire, lying, promise
all non-empty counterfactual L1 totals = 1
findings remain candidate_necessity_finding_not_doctrine
necessity_review_status = necessity_candidate_not_doctrine
belief_movement: none
```

## Inspection page

```text
https://42ndmoose.github.io/42ndMind/intention-necessity.html?v=necessity-1
```

Expected:

```text
Decision: NECESSITY_READY
Candidates: 3
```

## Current commits for this layer

```text
6ecf138 Add intention necessity test module
6e64cb2 Add intention necessity browser test
6d3604c Add intention necessity inspection page
```

## Next task

After the browser test passes, the next layer should be a concept-neighbor lattice.

Candidate module:

```text
src/kernel-intention-neighbor-lattice-v0-1.js
```

Goal:

```text
Map how intention concepts shift into neighboring concepts when necessary dimensions are removed or altered.
```

Example:

```text
lying - belief_assertion_mismatch -> mistake
lying - concealment_of_mismatch -> fiction / joke / roleplay / marked uncertainty
desire - attainment_pull -> preference
promise - recipient_reliance_invitation -> private intention / plan
```

This should still be:

```text
candidate only
not doctrine
no real-world intent attribution
no belief movement
unit-total preserving
force/intensity separate from shape
```

This neighbor lattice is the next step toward discovering the objective mathematical language of intention.