# HANDOFF 2026-05-20: Factual Claim Intake + Question Appetite v0.1

## Scope

This handoff records two new live-state learning organs:

```text
src/epistemic-kernel-factual-claim-intake-v0-1.js
src/epistemic-kernel-question-appetite-v0-1.js
```

These are not connector modules.

They patch/bind into the same owned brain state and write into:

```text
EpistemicKernel.state.unifiedCore
```

The purpose is to let the kernel handle factual information and learning opportunities as live pressure, rather than inert context or rigid prompts.

## Built files

```text
src/epistemic-kernel-factual-claim-intake-v0-1.js
src/epistemic-kernel-question-appetite-v0-1.js
epistemic-factual-question-v0-1-test.html
llm-brain-v0-3-factual-question-v0-1.html
HANDOFF_2026_05_20_FACTUAL_QUESTION_APPETITE.md
```

## Test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/epistemic-factual-question-v0-1-test.html?v=fact-qapp-1
```

Expected:

```text
10/10 passed
```

Test verifies:

```text
factual claim and question appetite modules load and patch live brain surfaces
binding keeps all additions inside one shared unifiedCore state
Trump president input becomes structured external-world factual candidate
fact creates entity relation, truth pressure, and belief-memory provisional fact candidate
communication acknowledges factual candidate without final truth use
learning offer creates question appetite pressure and asks useful source-role question
question comes from pressure needs, not always-ask hard rule
communication projects learning priority question when its pressure is highest
direct self-state question still works after fact/question patches
no final truth promotion and maturity identity preserved
```

## Live UI URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-factual-question-v0-1.html?v=fact-qapp-live-1
```

Live page loads the current unified stack plus:

```text
src/epistemic-kernel-factual-claim-intake-v0-1.js?v=fact-1
src/epistemic-kernel-question-appetite-v0-1.js?v=qapp-1
```

It renders:

```text
Kernel says
Factual claim candidates
Truth relevance pressure
Question appetite
Learning priority questions
Intent inference
Semantic relation claims
Language-math packet
Communication packet
Learning packet
Belief-memory packet
```

## What factual-claim intake consumes

```text
latest runtime event raw text
state.languageMathCore.intent_inference if present
state.beliefMemoryCore.user_trust_profile if present
state.communicationCore
state.beliefMemoryCore
```

## What factual-claim intake produces

Inside `state.languageMathCore`:

```text
factual_claim_intake_version
factual_claim_candidates
entity_relation_candidates
truth_relevance_pressure
factual_intake_log
```

Inside `state.beliefMemoryCore`:

```text
provisional_fact_candidates
```

Inside `state.communicationCore`:

```text
current_message
message_history
```

## Factual-claim example

Input:

```text
trump is the 47th president of the united states of america
```

Expected candidate:

```text
utterance_kind: factual_claim
claim_type: external_world_role_claim
claim_scope: external_world
subject: trump
relation: is_47th_president_of
object: united_states_of_america
relation_formula: trump -> is_47th_president_of -> united_states_of_america
source_id: direct_user
source_kind: user_input
user_intent_candidate: informing_or_contextualizing
truth_status: unverified_external_claim_candidate
objective_truth_status: not_adjudicated
promotion_status: not_promoted_to_final_truth
belief_movement: provisional_only
memory_status: provisional_fact_candidate
verification_need: high
```

Expected communication:

```text
I am treating that as an external factual claim candidate: trump -> is_47th_president_of -> united_states_of_america. I can hold it provisionally from you, but verification is required before objective truth use.
```

## Factual-claim doctrine

```text
factual_claim_intake_lives_inside_owned_state: true
factual_claims_are_language_math_relations: true
external_world_claims_become_structured_candidates: true
user_facts_are_context_not_final_truth: true
direct_user_source_is_partial_revisable_source: true
verification_pressure_is_created_without_verification: true
no_auto_fact_checking_from_memory: true
no_final_truth_promotion: true
no_silent_canonical_mutation: true
not_a_connector_fact_checker: true
belief_movement: provisional_only
```

## What question appetite consumes

```text
latest runtime event raw text
state.languageMathCore.factual_claim_candidates
state.languageMathCore.truth_relevance_pressure
state.languageMathCore.semantic_relation_claims if present
state.beliefMemoryCore.memory_items if present
state.communicationCore.current_message if present
```

## What question appetite produces

Inside `state.learningDrive`:

```text
question_appetite_version
question_appetite
learning_priority_questions
```

Inside `state.curiosityCore`:

```text
priority_needs
```

Inside `state.communicationCore`:

```text
attention_candidates
selected_pressure
current_message if selected pressure wins
message_history
```

Inside `state.languageMathCore`:

```text
question_appetite_version
question_appetite_log
communication_pressure
live_thought if selected
```

## Question appetite example

Input:

```text
you can ask me anything. i can give you answers for you to understand everything better, one small info at a time.
```

Expected needs:

```text
learning_opportunity_need: high
source_role_need: high
identity_need: medium-high
memory_commitment_need: medium
truth_verification_need: low unless a factual claim is current
meaning_scope_need: low unless a meaning claim is current
```

Expected selected question:

```text
What should I call you, and are you trying to teach me facts, meanings, or your worldview?
```

This question comes from pressure, not from a fixed always-ask rule.

## Question appetite doctrine

```text
question_appetite_lives_inside_owned_state: true
questions_arise_from_live_need_pressure: true
not_a_connector_question_module: true
not_a_strict_bottleneck_rule: true
no_always_ask_identity_rule: true
learning_opportunity_can_raise_source_role_need: true
factual_claims_can_raise_verification_need_without_forcing_question: true
communication_candidates_are_pressure_candidates_not_scripts: true
one_selected_question_is_projection_of_need_pressure: true
no_final_truth_promotion: true
belief_movement: provisional_only
```

## Refuses

```text
no connector fact checker
no automatic truth verification
no final truth promotion
no hard-coded always-ask identity rule
no strict bottleneck before continuing conversation
no UI-owned thought
no replacement of existing objective language-math stack
```

## Current limitation

Factual extraction is still narrow and pattern-based.

Currently it is strongest for claims like:

```text
X is the Nth president of Y
X is the [role] of Y
X is/was [predicate]
```

Question appetite is also first-pass pressure scoring. It is enough to distinguish learning offers and factual verification pressure, but not yet a full unified attention system.

## Next suggested layer

Recommended next build:

```text
unified attention arbitration v0.1
```

Purpose:

```text
Let one visible thought be selected from all active pressure sources: direct self-state answer, semantic conflict, factual-claim acknowledgement, question appetite, curiosity, learning drive, belief-memory reaction, and maturity recovery pressure.
```

Do not build final truth promotion next.
