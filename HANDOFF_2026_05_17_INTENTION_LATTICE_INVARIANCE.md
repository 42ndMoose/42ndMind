# HANDOFF 2026-05-17: Intention Lattice Invariance Benchmark v0.1

## Read first

```text
HANDOFF_2026_05_17_AUTO_GROWTH_UNIT_TOTAL_LANGUAGE.md
HANDOFF_2026_05_17_AUTO_GROWTH_FUTURE_PREFLIGHT.md
HANDOFF_2026_05_17_INTENTION_DISCOVERY.md
HANDOFF_2026_05_17_INTENTION_REFINEMENT.md
HANDOFF_2026_05_17_INTENTION_NECESSITY.md
HANDOFF_2026_05_17_INTENTION_NEIGHBOR_LATTICE.md
HANDOFF_2026_05_17_INTENTION_LATTICE_INVARIANCE.md
```

Do not read unrelated uploaded files.

## Goal

This layer tests whether the candidate intention-neighbor lattice tracks structure rather than surface wording.

It benchmarks whether the same concept-neighbor relations survive:

```text
paraphrase
translation-like labels
role renaming
future-language variation
force/intensity scalar changes
```

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
src/kernel-intention-lattice-invariance-benchmark-v0-1.js
```

Purpose:

```text
Test structural invariance of the candidate intention neighbor lattice.
```

Input:

```text
KernelIntentionNeighborLatticeV01.runLattice()
```

Output:

```text
case_results
force_invariance
validation
```

## Doctrine

```text
benchmarks_intention_lattice_not_claim_facts: true
no_real_world_intent_attribution: true
no_person_event_or_narrative_belief_ledger: true
invariance_cases_are_candidate_not_doctrine: true
invariance_pressure_is_discovery_hygiene_not_institutional_validation: true
tests_structure_not_surface_english: true
force_intensity_changes_must_not_change_concept_identity_relations: true
each_concept_shape_is_local_scope_total_1: true
belief_movement: none
```

## Current benchmark cases

```text
lying_mistake_paraphrase_invariance
lying_fiction_translation_like_invariance
desire_preference_force_invariance
promise_private_intention_role_rename_invariance
promise_plan_future_language_invariance
```

Examples:

```text
falsehood_presented_as_believed + speaker_belief_conflicts_with_assertion + honest_error
canonicalizes to:
lying - belief_assertion_mismatch -> mistake
```

```text
menyatakan_yang_tidak_diyakini_sebagai_benar + hiding_the_mismatch + valid_nonliteral_story_frame
canonicalizes to:
lying - concealment_of_mismatch -> fiction
```

```text
keinginan + directional_wanting_pressure + mere_preference
canonicalizes to:
desire - attainment_pull -> preference
```

## Force invariance

The module tests force scalars:

```text
M = 0
M = 0.25
M = 1
M = 4
M = 10
```

Expected result:

```text
Force scalar M changes intensity only.
It must not alter concept-neighbor lattice identity.
```

## Browser test

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-lattice-invariance-benchmark-v0-1-test.html?v=invariance-1
```

Expected:

```text
8/8 passed
case_count: 5
passed_case_count: 5
source_lattice_ok: true
force_invariance.ok: true
belief_movement: none
```

## Inspection page

```text
https://42ndmoose.github.io/42ndMind/intention-lattice-invariance.html?v=invariance-1
```

Expected:

```text
Decision: INVARIANCE_READY
Cases: 5
Passed: 5
```

## Current commits for this layer

```text
e80d47d Add intention lattice invariance benchmark module
8e91327 Add intention lattice invariance browser test
83d5287 Add intention lattice invariance inspection page
```

## Architecture note: clean kernel brain vs belief/world-model brain

The current repo now contains a kernel learning the mathematical language of intention/logic.

Future political/propaganda/narrative truth work should be stored in a separate belief/world-model layer, not inside the core grammar.

Recommended separation:

```text
Language brain = durable semantic/intention grammar
Belief brain = optional claim/world-model state
Source brain = evidence/provenance memory
Maturity governor = controls belief movement
```

The core language brain should remain reusable and politically clean.

A future belief/world-model brain can ingest politics, propaganda analysis, and narrative evidence, but it should be:

```text
separate
optional
resettable/exportable
source-backed
revision-tracked
strictly gated
```

This allows one kernel instance to remain in a clean mathematical-language state while another instance carries political/narrative belief state.

## Next task

After the browser test passes, add a formula compiler.

Candidate module:

```text
src/kernel-intention-formula-compiler-v0-1.js
```

Goal:

```text
Compile discovery/refinement/necessity/lattice/invariance outputs into compact algebraic intention packets.
```

The compiler should output for each concept:

```text
concept
core formula
boundary terms
derivative/expression terms
force terms outside shape
neighbor transitions
invariance status
Σ |dimension_i| = 1
F = M · i
candidate_not_doctrine
belief_movement: none
```

This would turn the current workbench into a cleaner objective-language artifact.