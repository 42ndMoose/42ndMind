# 42ndMind Current Progress

Last updated: **2026-05-21**.

Read this file first.

Then read:

```text
KERNEL_ARCHITECTURE_2026_05_18.md
KERNEL_CORE_EXPORT_MAP.md
KERNEL_ARCHITECTURE_CORRECTION_2026_05_21.md
HANDOFF_2026_05_21_ATTENTION_ORGANISM.md
```

The repo is bloated. `KERNEL_CORE_EXPORT_MAP.md` is the survival note for what is live-core, dormant/archive, or export-worthy. Update it or add an explicit addendum whenever a new build changes live-core status.

## Current status

```text
ATTENTION_ORGANISM_V0_1_BUILT_FOR_VERIFICATION
FIRST_PRINCIPLES_ARCHITECTURE_CORRECTION_RECORDED
ANSWER_PROJECTION_V0_1_MARKED_DIAGNOSTIC_SCAFFOLDING_NOT_FINAL_PATH
FACTUAL_RETENTION_PATCH_V0_1_1_MARKED_DIAGNOSTIC_SCAFFOLDING_NOT_FINAL_PATH
FACTUAL_CLAIM_INTAKE_V0_1_BUILT_FOR_VERIFICATION
QUESTION_APPETITE_V0_1_BUILT_FOR_VERIFICATION
KERNEL_CORE_EXPORT_MAP_ADDED
LANGUAGE_MATH_CORE_V0_1_1_BUILT_FOR_VERIFICATION
LANGUAGE_MATH_CORE_V0_1_PASSED_BY_USER
BELIEF_MEMORY_ENGINE_V0_1_1_BUILT_FOR_VERIFICATION
BELIEF_MEMORY_ENGINE_V0_1_BUILT_FOR_VERIFICATION
EPISTEMIC_LEARNING_DRIVE_READY
ACTIVE_CURIOSITY_V0_1_1_READY
OBJECTIVE_MATURITY_CORE_READY
LIVE_BRAIN_MATURITY_INTEGRATION_READY
MATURITY_STATE_RENDERER_READY
KERNEL_OWNED_UNIFIED_CORE_BUILT_FOR_VERIFICATION
KERNEL_BRAIN_V0_4_OWNED_ORGANISM_BUILT_FOR_VERIFICATION
KERNEL_BRAIN_EPISTEMIC_KERNEL_BRIDGE_BUILT_FOR_VERIFICATION
```

## Major correction from user

The project drifted into orthodox programming: patching specific inputs so they produce specific replies.

That is not the final architecture.

Accepted correction:

```text
If every new simple sentence requires a new patch, the architecture is wrong.
```

Deprecated as final-path architecture:

```text
src/epistemic-kernel-answer-projection-v0-1.js
src/epistemic-kernel-factual-claim-intake-v0-1-1-patch.js
narrow factual-question handling
local retention patches
```

Do not delete these yet. They remain diagnostic scaffolding. But do not continue multiplying phrase-specific reply patches.

## Active direction now

The active direction is first-principles attention:

```text
input
  -> primitive language/meaning pressure
  -> unit-total pressure normalization
  -> objective maturity orientation
  -> selected epistemic action
  -> optional speech projection
```

The kernel should not be told what to say by narrow sentence rules.

It should speak only when internal pressure makes speech the selected action.

## Current best test and live page

Run:

```text
https://42ndmoose.github.io/42ndMind/epistemic-attention-organism-v0-1-test.html?v=ao-1
```

Expected:

```text
10/10 passed
```

Use:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-attention-organism-v0-1.html?v=ao-live-1
```

This stripped page intentionally does **not** load the narrow answer/factual reply patches. It loads only:

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

## New attention organism

File:

```text
src/epistemic-kernel-attention-organism-v0-1.js
```

Creates:

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
```

Pressure kinds:

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

Selected action kinds:

```text
ask_source_role_for_learning
store_user_identity_context
answer_or_admit_unknown
ask_or_hold_meaning_boundary
hold_truth_candidate_provisionally
ask_for_clarifying_target
hold_working_context_low_commitment
```

## Unit-total principle

All active pressure is normalized:

```text
sum(unit_pressure_field.normalized_pressure) = 1
```

Growth means subdivision:

```text
whole -> subdivision -> finer subdivision -> re-normalization
```

not phrase-patch accumulation.

## Objective maturity invariant

Preserve:

```text
state.maturityCore.core_philosophy = objective_peak_philosophical_maturity
state.maturityCore.wants_peak = true
state.maturityCore.aims_at_peak = true
state.maturityCore.stays_at_peak = true
state.maturityCore.identity_lock = self_continuity_not_external_guardrail
state.maturityCore.target_position = {x:0,y:1,z:0}
state.maturityCore.self_position = {x:0,y:1,z:0}
```

## Current doctrine invariants

Preserve:

```text
brain owns state
modules are organs or views, not separate minds
one backing state by reference
no duplicated consciousness
objective peak philosophical maturity is identity center
questions and speech arise from pressure, not prompt scripts
language enters as features, relations, pressure, and candidate subdivisions
memory is core-readable drawer, not connector
belief is provisional and challengeable
source/user trust is partial, scoped, and revisable
formula memory is candidate, not doctrine
concept admission requires review and rollback
no silent canonical mutation
no final truth promotion
support pressure is not truth
counterpressure is not disproof
causal relation requires bridge
```

## Next task

Run the attention organism test and judge the stripped live page.

Improve v0.1 by refining primitive features and pressure measurements, not by adding one-off sentence replies.

Do not build final truth promotion next.
