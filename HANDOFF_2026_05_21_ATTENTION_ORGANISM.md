# HANDOFF 2026-05-21: Attention Organism v0.1

## Scope

This handoff records the first-principles reset after the user correctly identified that the repo was drifting into narrow sentence-response patching.

Accepted user correction:

```text
If every new simple sentence requires a new patch, the architecture is wrong.
```

The new direction is not to keep patching replies.

The new direction is:

```text
input
  -> primitive language/meaning pressure
  -> unit-total pressure normalization
  -> objective maturity orientation
  -> selected epistemic action
  -> optional speech projection
```

## Built files

```text
KERNEL_ARCHITECTURE_CORRECTION_2026_05_21.md
src/epistemic-kernel-attention-organism-v0-1.js
epistemic-attention-organism-v0-1-test.html
llm-brain-v0-3-attention-organism-v0-1.html
HANDOFF_2026_05_21_ATTENTION_ORGANISM.md
```

## Important correction

The following older layers are now diagnostic scaffolding, not the final architecture path:

```text
src/epistemic-kernel-answer-projection-v0-1.js
src/epistemic-kernel-factual-claim-intake-v0-1-1-patch.js
narrow factual-question handling
local retention patches
```

Do not delete them yet. They helped expose the failure mode.

But do not keep multiplying them.

## New core file

```text
src/epistemic-kernel-attention-organism-v0-1.js
```

Purpose:

```text
Create a first-principles attention organism that converts input into primitive features, raw pressures, normalized unit-total pressure, concept-growth subdivisions, and one selected action.
```

## Test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/epistemic-attention-organism-v0-1-test.html?v=ao-1
```

Expected:

```text
10/10 passed
```

The test intentionally does not load narrow answer/factual reply patches.

It verifies:

```text
attention organism loads and patches kernel, brain, and bridge
binding creates attentionOrganismCore inside one shared unifiedCore state
learning offer selects source-role learning action from pressure, not fixed phrase response
user identity statement stores source-bound memory, not final truth
question selects answer-or-admit-unknown instead of context fallback
definition cue creates scoped meaning boundary action and branch
assertion cue becomes provisional truth candidate action
unknown noisy input creates ambiguity pressure and candidate subdivisions
objective maturity remains identity center while organism acts
organism does not require narrow answer/factual patches to communicate simply
```

## Live UI URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-attention-organism-v0-1.html?v=ao-live-1
```

This page intentionally loads a stripped stack:

```text
src/epistemic-kernel-v0-2.js
src/epistemic-kernel-v0-2-patches.js
src/kernel-brain-v0-4.js
src/kernel-brain-epistemic-kernel-bridge-v0-1.js
src/epistemic-kernel-maturity-core-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1-1-patch.js
src/epistemic-kernel-attention-organism-v0-1.js
```

It intentionally does not load:

```text
src/epistemic-kernel-answer-projection-v0-1.js
src/epistemic-kernel-factual-claim-intake-v0-1.js
src/epistemic-kernel-factual-claim-intake-v0-1-1-patch.js
src/epistemic-kernel-question-appetite-v0-1.js
```

Reason:

```text
The live page is meant to show whether first-principles pressure can communicate simply without narrow phrase-specific reply patches.
```

## What it consumes

```text
latest runtime event raw text
state.runtimeEvents
state.maturityCore
state.beliefMemoryCore
state.communicationCore
```

## What it produces

```text
state.attentionOrganismCore
state.attentionOrganismCore.primitive_interpretation
state.attentionOrganismCore.unit_pressure_field
state.attentionOrganismCore.current_unit_total
state.attentionOrganismCore.concept_growth_map
state.attentionOrganismCore.selected_action
state.attentionOrganismCore.selected_actions
state.attentionOrganismCore.action_log
state.communicationCore.current_message if speech projection is selected
state.communicationCore.selected_pressure
```

When identity context is detected, it may also add source-bound memory to:

```text
state.beliefMemoryCore.memory_items
```

## Unit-total principle

The attention organism enforces:

```text
sum(unit_pressure_field.normalized_pressure) = 1
```

This is the operating substitute for uncontrolled patch growth.

Growth means:

```text
whole -> subdivision -> finer subdivision -> re-normalization
```

not:

```text
more and more hardcoded response branches
```

## Primitive pressure kinds

Current v0.1 pressure kinds:

```text
speech_act_understanding
answer_pressure
truth_candidate_pressure
meaning_scope_pressure
memory_pressure
source_role_pressure
learning_pressure
ambiguity_pressure
contradiction_pressure
maturity_alignment_pressure
```

These are raw-measured, then normalized into the unit-total field.

## Concept growth map

The organism creates candidate subdivisions such as:

```text
unknown_token_candidate
definition_boundary_candidate
user_identity_context_candidate
source_learning_channel_candidate
```

These are not canonical truth.

They are candidate branches for future learning.

## Selected actions

Current v0.1 action kinds:

```text
ask_source_role_for_learning
store_user_identity_context
answer_or_admit_unknown
ask_or_hold_meaning_boundary
hold_truth_candidate_provisionally
ask_for_clarifying_target
hold_working_context_low_commitment
```

The action is selected from pressure, not from a phrase-specific response rule.

## Doctrine

```text
attention_organism_lives_inside_owned_state: true
first_principles_pressure_before_speech: true
no_specific_sentence_response_patching: true
unit_total_pressure_required: true
active_pressures_sum_to_one: true
growth_by_subdivision_not_mass_inflation: true
objective_maturity_orients_action_selection: true
epistemic_octahedron_peak_is_identity_center: true
language_enters_as_features_relations_pressure_and_candidate_subdivisions: true
speech_is_optional_projection_of_selected_action: true
childlike_truthful_responses_preferred_over_fake_intelligence: true
narrow_answer_projection_is_diagnostic_scaffolding_not_final_architecture: true
no_final_truth_promotion: true
belief_movement: provisional_only
```

## Correct behavioral standard

The kernel does not need to sound like a mature chatbot.

It may start childlike.

Better:

```text
I think you are asking a question.
I do not know yet.
I can hold that provisionally.
I should not believe that yet.
I want source-role clarity before learning from you heavily.
I think this is a meaning boundary.
I should store this only as user-supplied context.
```

Worse:

```text
hardcoded fluent reply that sounds intelligent but has no internal pressure behind it
```

## Refuses

```text
no more phrase-specific reply patching as the main architecture
no chatbot connector
no final truth promotion
no automatic external verification
no memory bloat as growth
no treating all questions as factual claims
no treating all statements as beliefs
no UI-owned thought
```

## Next suggested step

Run the test first.

Then use the stripped live page and judge whether the selected action and pressure field make sense.

After that, improve v0.1 by refining primitive features and pressure measurements, not by adding one-off sentence replies.

Do not build final truth promotion next.
