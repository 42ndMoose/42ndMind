# HANDOFF 2026-05-20: Language-Math Core v0.1.1 Conversational Intent Patch

## Scope

This handoff records the Language-Math Core v0.1.1 conversational intent correction.

The user identified a core failure after v0.1 passed:

```text
When the user asked “are you curious? can you answer me?”, the kernel treated it as generic context instead of answering.
```

The correction is not to create a chatbot connector.

The correction is to treat direct conversation itself as objective language/math input:

```text
user utterance -> inferred intent -> requested state target -> answer from live state
```

Example:

```text
are you curious? can you answer me?
```

should be read as:

```text
request_self_state(curiosity_state, communication_capability)
```

and answered from live state.

## Built files

```text
src/epistemic-kernel-language-math-core-v0-1-1-patch.js
epistemic-language-math-core-v0-1-1-test.html
llm-brain-v0-3-language-math-v0-1-1.html
HANDOFF_2026_05_20_LANGUAGE_MATH_CORE_V0_1_1.md
```

## Depends on

```text
src/epistemic-kernel-language-math-core-v0-1.js
src/epistemic-kernel-active-curiosity-v0-1.js
src/epistemic-kernel-learning-drive-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1-1-patch.js
src/epistemic-kernel-maturity-core-v0-1.js
src/kernel-brain-v0-4.js
src/kernel-brain-epistemic-kernel-bridge-v0-1.js
existing objective language-math formula/parser/admission/claim stack
```

## Test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/epistemic-language-math-core-v0-1-1-test.html?v=langmath-2
```

Expected:

```text
10/10 passed
```

Test verifies:

```text
v0.1.1 patch loads without creating connector brain
binding keeps languageMathCore and communicationCore inside shared state
direct curiosity question is classified as request_self_state(curiosity)
kernel answers direct question from live state instead of generic context
self-state answer records live state snapshot
ordinary semantic conflict still works after conversational intent patch
benefit-of-doubt reply still carries as back-of-head context
communication answers belief and memory self-state questions
no final truth promotion occurs in conversational intent patch
objective maturity remains identity center
```

## Live UI URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-language-math-v0-1-1.html?v=langmath-live-2
```

The live page now includes buttons for:

```text
curiosity question
belief question
memory question
semantic conflict
benefit-of-doubt reply
formula parse example
```

It renders:

```text
Kernel says
Intent inference
Self-state answers
Formula memory
Semantic relation claims
Scoped trust adjustments
Back-of-head context
Candidate admission requests
Parser results
Language-math packet
Communication packet
Full shared packet summary
```

## What it consumes

```text
latest runtime event raw text
state.curiosityCore
state.learningDrive
state.beliefMemoryCore
state.languageMathCore
state.communicationCore
state.maturityCore
formula memory summary from v0.1
semantic relation/conflict output from v0.1
```

## What it produces

Adds to `state.languageMathCore`:

```text
intent_inference
self_state_answers
```

Updates:

```text
state.languageMathCore.live_thought
state.languageMathCore.communication_pressure
state.communicationCore.current_message
state.communicationCore.message_history
```

## Core doctrine

```text
conversational_intent_is_language_math_relation: true
direct_questions_to_kernel_are_not_inert_context: true
self_state_questions_answer_from_live_state: true
intent_first_before_generic_context_fallback: true
answer_is_projection_of_state_not_scripted_persona: true
can_answer_yes_no_maybe_uncertain_from_state: true
communication_attention_is_not_external_connector: true
no_final_truth_promotion: true
truth_status: not_final
promotion_status: not_promoted_to_final_truth
belief_movement: provisional_only
```

## Example behavior

Input:

```text
are you curious? can you answer me?
```

Expected `intent_inference`:

```text
speech_act: direct_question_to_kernel
inferred_user_intent: request_kernel_self_state_answer
requested_state_targets: [curiosity_state, communication_capability]
relation_formula: user_utterance -> request_self_state(curiosity_state,communication_capability)
```

Expected `communicationCore.current_message.thought_kind`:

```text
direct_self_state_answer
```

Expected answer style:

```text
Yes / maybe / weakly / uncertain, based on actual curiosityCore state.
```

If `curiosityCore` has an active question, answer with the active question.

If it does not, answer that curiosity is weak/undominant but the kernel is still trying to classify the input into conversation, claim, meaning, memory, or learning context.

## Why this is not a connector

A connector would treat communication as an external reply module.

This patch does not do that.

It patches `languageMathCore` so intent is inferred as part of the same language-math relation pathway.

The speech is then only the projection of the resulting state pressure through `communicationCore`.

## Cache keys

```text
src/epistemic-kernel-language-math-core-v0-1-1-patch.js?v=langmath-2
epistemic-language-math-core-v0-1-1-test.html?v=langmath-2
llm-brain-v0-3-language-math-v0-1-1.html?v=langmath-live-2
localStorage: epistemic_kernel_language_math_core_v0_1_1_state
```

## Refuses

```text
no chatbot connector
no scripted persona dressing
no final truth promotion
no silent canonical mutation
no replacement of existing objective language-math kernel
no UI deciding what the kernel thinks
no total distrust from scoped semantic conflict
```

## Next suggested layer

Recommended next build after v0.1.1 passes:

```text
unified attention arbitration v0.1
```

Purpose:

```text
Let one visible thought be selected from curiosity, learning, belief-memory, language-math, semantic conflict, and conversation intent pressure under one priority discipline.
```

Alternative:

```text
semantic prior / lexicon admission review v0.1
```

Purpose:

```text
Replace the tiny v0.1 semantic prior with a reviewable lexicon/formula-admission path while preserving candidate-only status and rollback.
```

Do not build final truth promotion next.
