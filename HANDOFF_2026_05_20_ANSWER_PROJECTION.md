# HANDOFF 2026-05-20: Answer Projection v0.1

## Scope

This handoff records the answer-projection correction after the user observed that the live kernel still did not know how to communicate.

Observed failure:

```text
Kernel says: heard_context_no_major_formalization
I heard this as conversation context. I can keep it in working attention without treating it as final truth.
```

The live state also showed a worse bug:

```text
who is the 47th president of the usa?
```

was becoming a fake factual claim:

```text
who -> is_47th_president_of -> usa
```

and:

```text
do you know who is the 47th president of the usa?
```

was becoming:

```text
do_you_know_who -> is_47th_president_of -> usa
```

That is wrong. A factual question is an answer request, not a factual claim.

## Built files

```text
src/epistemic-kernel-answer-projection-v0-1.js
epistemic-answer-projection-v0-1-test.html
llm-brain-v0-3-answer-projection-v0-1.html
HANDOFF_2026_05_20_ANSWER_PROJECTION.md
```

## Test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/epistemic-answer-projection-v0-1-test.html?v=answer-1
```

Expected:

```text
10/10 passed
```

Test verifies:

```text
answer projection module loads and patches live brain surfaces
binding keeps answer projection inside one shared unifiedCore state
plain factual statement still becomes provisional factual candidate
who-is factual question becomes answer request, not fake who-subject fact
do-you-know factual question also becomes answer request
user name statement is retained and can answer what-is-my-name
kernel identity questions receive state-based answers
communication prompts do not fall back to heard_context_no_major_formalization
learning appetite question is answered from live need
final truth question is answered without promotion
```

## Live UI URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-answer-projection-v0-1.html?v=answer-live-1
```

This is currently the best live UI for communication testing.

It loads the prior stack plus:

```text
src/epistemic-kernel-answer-projection-v0-1.js?v=answer-1
```

and renders:

```text
Kernel says
Answer projections
Answer projection log
Factual claim candidates
Interrogative fact drift cleanup
Question appetite
Intent inference
Communication packet
Language-math packet
Learning packet
Belief-memory packet
```

## What it consumes

```text
latest runtime event raw text
state.runtimeEvents
state.communicationCore
state.languageMathCore
state.beliefMemoryCore.memory_items
state.languageMathCore.back_of_head_context
state.languageMathCore.factual_claim_candidates
state.languageMathCore.entity_relation_candidates
state.languageMathCore.truth_relevance_pressure
state.learningDrive
state.maturityCore
```

## What it produces

Inside `state.communicationCore`:

```text
answer_projection_version
question_answer_candidates
answer_projection_log
user_identity_model
current_message = direct_answer_projection when a direct question can be answered
message_history
attention_candidates
selected_pressure
```

Inside `state.languageMathCore`:

```text
answer_projection_version
interrogative_fact_drift_log
answer_projection_log
live_thought when answer projection wins
```

Inside `state.beliefMemoryCore` when the user says their name:

```text
memory_items entry: User says their name is Miguel.
```

## Doctrine

```text
answer_projection_lives_inside_owned_state: true
direct_questions_are_answer_requests_not_context_fallbacks: true
factual_questions_are_not_factual_claims: true
answers_project_from_live_state_not_scripted_persona: true
unknown_answers_should_say_unknown_not_context_acknowledgement: true
user_memory_can_answer_user_identity_questions_without_final_truth: true
factual_candidates_can_answer_as_unverified_user_supplied_candidates: true
no_auto_external_verification: true
no_final_truth_promotion: true
not_a_chatbot_connector: true
belief_movement: provisional_only
```

## Corrected behavior examples

### User name

Input:

```text
my name is Miguel
```

creates user identity context.

Then:

```text
what is my name?
```

should project:

```text
You told me your name is Miguel. I can use that as user-supplied identity context, not final truth.
```

### Factual question

If the kernel previously received:

```text
trump is the 47th president of the united states of america
```

then:

```text
who is the 47th president of the usa?
```

should project an answer from the stored candidate:

```text
I have a user-supplied factual candidate: trump -> is_47th_president_of -> united_states_of_america. I can answer from that as provisional context, but I have not verified it as objective truth.
```

It must not create:

```text
who -> is_47th_president_of -> usa
```

### Communication prompt

Input:

```text
can you say something?
```

should not return:

```text
I heard this as conversation context.
```

It should project a direct answer from live state.

## Interrogative drift cleanup

If earlier patches create fake factual claims from interrogative wording, answer projection removes current-question drift when the latest input is a question.

It logs cleanup in:

```text
state.languageMathCore.interrogative_fact_drift_log
```

## Refuses

```text
no chatbot connector
no final truth promotion
no automatic external verification
no treating factual questions as factual claims
no generic context fallback for direct answerable questions
no replacing language-math, belief-memory, or factual-claim intake
```

## Limitation

This is still pattern-based answer projection. It handles the key broken paths:

```text
what is my name?
do you know who I am?
what are you?
what is your name?
what is final truth?
what do you want to know?
can you say something?
who is the 47th president of the USA?
do you know who is the 47th president of the USA?
```

It does not yet provide a general LLM-level answer generator. That should not be faked.

## Next suggested layer

After this test passes:

```text
unified attention arbitration v0.1
```

Purpose:

```text
Replace local retention/priority patches with one general pressure-selection discipline across direct answers, self-state answers, semantic conflicts, factual claims, question appetite, curiosity, learning drive, belief-memory reactions, and maturity recovery pressure.
```

Do not build final truth promotion next.
