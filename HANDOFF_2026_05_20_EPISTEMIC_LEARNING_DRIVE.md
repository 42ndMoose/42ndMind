# HANDOFF 2026-05-20: Epistemic Learning Drive v0.1

## Scope

This handoff records the Epistemic Learning Drive v0.1.

This is not a UI prompt queue.

It installs a truth-seeking / learning drive inside the owned/shared brain state so the kernel's questions can come from active epistemic appetite rather than merely from unresolved span detection.

The kernel should not ask questions only because a span crossed a curiosity threshold.

It should generate learning goals from:

```text
objective maturity
resolved referents
user context answers
principle claims
boundary distinctions
scope pressure
causal bridge pressure
exception conditions
concept definitions
working belief candidates
```

The layer still refuses premature belief promotion.

User answers teach context and meaning, but they do not become final truth.

## Built files

```text
src/epistemic-kernel-learning-drive-v0-1.js
epistemic-learning-drive-v0-1-test.html
llm-brain-v0-3-learning-drive-v0-1.html
HANDOFF_2026_05_20_EPISTEMIC_LEARNING_DRIVE.md
```

## Version

```text
EpistemicKernelLearningDriveV01.VERSION = 0.1.0
```

## Test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/epistemic-learning-drive-v0-1-test.html?v=learn-1
```

Expected result:

```text
8/8 passed
```

The test verifies:

```text
learning drive patch loads on kernel, brain, and bridge
binding creates learning drive inside shared state
raw philosophy creates learning goals beyond curiosity prompt queue
curiosity answers feed learned context and working belief candidates
learning drive keeps user answer as context, not truth
learning question can be answered and satisfied without truth promotion
learning drive still opens remaining truth-seeking goals after one answer
learning drive remains candidate-only and maturity-compatible
```

## Live URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-learning-drive-v0-1.html?v=learn-live-1
```

Usage:

```text
1. Paste ordinary text into Raw input.
2. Press INGEST RAW → BRAIN.
3. Answer active curiosity if it asks a targeted referent question.
4. Watch Learning drive summary.
5. Answer the current learning goal if useful.
6. The answer becomes learned context, not final truth.
```

## Core state added

The layer installs:

```text
state.learningDrive
```

inside the owned/shared state.

Shape:

```text
packet_type: 42ndMind_epistemic_learning_drive_v0_1
packet_version
active
learning_orientation: truth_seeking_under_objective_maturity
current_learning_goal
current_learning_goal_id
learning_goals
learning_questions
learned_context
working_belief_candidates
truth_chase_state
learning_appetite_score
satisfied_items
unsatisfied_items
truth_status: not_adjudicated
promotion_status: not_promoted
belief_movement: none
```

## Doctrine

```text
learning_drive_lives_inside_owned_state: true
curiosity_comes_from_truth_seeking_not_prompt_trigger_only: true
questions_are_epistemic_actions_not_ui_prompts: true
user_answers_teach_context_not_truth: true
resolved_referents_feed_learning_goals: true
principle_text_requires_scope_exception_and_revision_conditions: true
causal_claims_require_bridge_before_belief: true
belief_satisfaction_is_not_truth_promotion: true
kernel_may_hold_working_belief_candidates: true
working_belief_candidates_are_not_final_truth: true
objective_maturity_remains_identity_center: true
no_truth_promotion_from_user_assertion: true
no_belief_movement_without_future_ledger: true
no_silent_canonical_mutation: true
belief_movement: none
```

## Patched surfaces

The boot patch installs into:

```text
EpistemicKernel
KernelBrainV04
KernelBrainEpistemicKernelBridgeV01
```

### EpistemicKernel additions

```text
kernel.refreshLearningDrive(reason)
kernel.answerLearningQuestion(answer, meta)
```

### KernelBrainV04 / bound brain additions

```text
brain.refreshLearningDrive(reason)
brain.answerLearningQuestion(answer, meta)
```

## What it does

The learning drive reads:

```text
state.curiosityCore.referent_candidates
state.curiosityCore.answer_log
state.curiosityCore.bound_referents
runtime event signals
```

Then it creates:

```text
learning_goals
learning_questions
learned_context
working_belief_candidates
```

## Learning needs detected

First-pass learning needs:

```text
principle_scope_test
scope_quantifier_test
causal_bridge_needed
boundary_definition_needed
concept_definition_needed
exception_conditions_needed
user_worldview_fragment_candidate
meaning_role_needed
```

## Example input

```text
race jokes should not be mistaken for racist jokes, and the boundary between the two won't always be obvious...
```

Expected learning goals include:

```text
principle_scope_test
boundary_definition_needed
scope_quantifier_test
causal_bridge_needed
exception_conditions_needed
concept_definition_needed
user_worldview_fragment_candidate
```

The kernel can now continue learning even after current active curiosity is answered.

If active curiosity is resolved, learningDrive may still have open goals such as:

```text
What is the intended scope of this principle?
Where is the boundary in this distinction?
What mechanism or bridge would make this causal claim work?
What are the exceptions or limiting conditions?
```

## Working belief candidates

The layer allows:

```text
working_belief_candidates
```

but keeps them candidate-only.

A working belief candidate may record:

```text
target_span
user_context_bound
belief_satisfaction: context_learned_but_not_truth
truth_requirements_remaining
may_inform_future_questions
truth_status: not_adjudicated
promotion_status: not_promoted
belief_movement: none
```

This means the kernel can be taught by the user's answers without pretending the user's answers are objective truth.

## Important distinction

This layer answers the user's conceptual correction:

```text
Questions should come from wanting to learn, not merely from unresolved contradiction detection.
```

v0.1 implements this as a deterministic epistemic drive:

```text
maturity identity -> truth-seeking orientation
raw/context input -> learning needs
learning needs -> learning goals
learning goals -> questions
answers -> learned context
learned context -> working belief candidates and remaining truth requirements
```

## What this does not do yet

```text
does not promote final beliefs
does not claim objective truth from user answers
does not canonically admit user principles
does not yet build a full personal worldview model
does not yet update a truth ledger with promoted beliefs
does not yet perform external verification
```

## Next suggested layer

Recommended next build:

```text
principle-boundary intake v0.1
```

Purpose:

```text
Use learningDrive.learned_context and curiosityCore.bound_referents to create candidate principle nodes, boundary nodes, exception nodes, revision-condition nodes, and maturity evaluations inside owned brain state.
```

Alternative next build:

```text
learning-drive renderer v0.1
```

Purpose:

```text
Render the drive more cleanly: what the kernel wants to learn, why it wants to learn it, what has been satisfied, what remains open, and what working belief candidates exist.
```

## Do not do next

```text
do not treat learning goals as truth
do not treat user answers as automatic truth
do not move belief without an explicit future ledger
do not let UI decide what the kernel wants to learn
do not confuse working belief candidate with final belief
do not turn curiosity into a shallow prompt queue again
```
