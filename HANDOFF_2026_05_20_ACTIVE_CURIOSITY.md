# HANDOFF 2026-05-20: Active Curiosity / Referent Layer v0.1

## Scope

This handoff records the Active Curiosity / Referent Layer v0.1.

This is not a connector and not a UI-only helper.

It installs active curiosity inside the owned/shared brain state so the kernel can expose what it is currently trying to identify and what span of text it is referring to.

The goal is to let the user paste unstructured philosophy, beliefs, boundaries, or principles, then let the kernel ask a targeted question like:

```text
What distinction is this trying to make: “Race jokes should not be mistaken for racist jokes”?
```

or:

```text
Who is saying or owning this statement?
```

The user can then answer:

```text
me
my principle
quoted claim
humor vs hostility
```

The answer is bound as context inside the owned state, not promoted to truth.

## Built files

```text
src/epistemic-kernel-active-curiosity-v0-1.js
active-curiosity-v0-1-test.html
HANDOFF_2026_05_20_ACTIVE_CURIOSITY.md
```

## Updated files

```text
llm-brain-v0-3-maturity.html
```

The live maturity console now loads:

```text
src/epistemic-kernel-active-curiosity-v0-1.js?v=curiosity-1
```

and includes:

```text
Active curiosity answer
Current active curiosity
ANSWER CURIOSITY button
quick answer buttons: me / my principle / quoted claim
```

## Version

```text
EpistemicKernelActiveCuriosityV01.VERSION = 0.1.0
```

## Test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/active-curiosity-v0-1-test.html?v=curiosity-1
```

Expected result:

```text
8/8 passed
```

The test verifies:

```text
active curiosity patch loads on kernel, brain, and bridge
binding creates curiosity core inside shared state
raw ambiguous philosophy text creates current curiosity from active logic
curiosity question points to span and expected answer shape
answer me binds referent as direct user speaker/context candidate
answer does not promote truth or move belief
new input can create a new current curiosity
curiosity remains renderer/view-safe and candidate-only
```

## Live console URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-maturity.html?v=curiosity-live-1
```

Usage:

```text
1. Paste ordinary text into Raw brain input.
2. Press INGEST RAW → BRAIN.
3. Look at Current active curiosity.
4. Answer in Active curiosity answer, e.g. “me”, “my principle”, “quoted claim”.
5. Press ANSWER CURIOSITY.
6. The answer becomes context-bound inside curiosityCore.bound_referents.
```

## Core state added

The layer installs:

```text
state.curiosityCore
```

inside the owned/shared state.

Shape:

```text
packet_type: 42ndMind_active_curiosity_core_v0_1
packet_version
active
latest_event_id
focus_span
focus_reason
current_question
current_question_id
active_questions
referent_candidates
answer_log
bound_referents
unresolved_referents
curiosity_state
renderer_hint
truth_status: not_adjudicated
promotion_status: not_promoted
belief_movement: none
```

## Doctrine

```text
active_curiosity_lives_inside_owned_state: true
curiosity_comes_from_active_logic_not_ui: true
curiosity_targets_spans_and_referents: true
user_answers_are_context_not_automatic_truth: true
short_answers_can_bind_referents_when_current_question_requests_it: true
clarification_is_maturity_preserving: true
no_truth_promotion_from_answer: true
no_belief_movement_from_answer: true
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
kernel.refreshActiveCuriosity(reason)
kernel.answerActiveCuriosity(answer, meta)
```

### KernelBrainV04 / bound brain additions

```text
brain.refreshActiveCuriosity(reason)
brain.answerActiveCuriosity(answer, meta)
```

## What the layer detects first

The first pass detects candidate spans and types such as:

```text
normative_principle_candidate
self_report_candidate
humor_boundary_candidate
distinction_candidate
scope_quantifier_candidate
quote_or_reported_claim_candidate
speaker_self_reference_candidate
reframe_context_candidate
raw_meaning_candidate
```

Then it asks targeted questions based on the highest-priority unresolved span.

## Example

Input:

```text
Race jokes should not be mistaken for racist jokes.
```

Expected active curiosity:

```text
focus_span: Race jokes should not be mistaken for racist jokes.
focus_reason: humor_boundary_candidate|distinction_candidate|normative_principle_candidate
current_question: What distinction is this trying to make: “Race jokes should not be mistaken for racist jokes.”?
```

User answer:

```text
me
```

Expected binding:

```text
answer_kind: direct_user_speaker
bound_value: user_directly_owns_statement
status: referent_binding_candidate_not_truth
truth_status: not_adjudicated
promotion_status: not_promoted
belief_movement: none
```

## What this means

The kernel can now point to a span and ask what it is.

This is the start of active interactive learning:

```text
kernel detects unresolved referent
kernel asks targeted question
user answers minimally
kernel binds answer as context candidate
future layers can use that context for principle/boundary evaluation
```

## What this does not do yet

```text
does not fully classify personal philosophy into worldview fragments
does not canonically admit user principles
does not promote belief
does not make final truth claims
does not yet persist a mature user worldview model beyond context bindings
does not yet ask multiple chained questions intelligently
```

## Next suggested layer

Recommended next build:

```text
principle-boundary intake v0.1
```

Purpose:

```text
Use curiosityCore.bound_referents to turn raw philosophy/belief/boundary text into candidate principle nodes, boundary nodes, exception nodes, revision-condition nodes, and maturity evaluations inside the owned brain state.
```

Alternative next build:

```text
curiosity renderer v0.1
```

Purpose:

```text
Render active curiosity in a cleaner readable format: focused span, why the kernel is curious, what it needs, and how the user's answer was bound.
```

## Do not do next

```text
do not let curiosity become truth promotion
do not treat user answer as automatic truth
do not build curiosity only in HTML
do not let UI decide what the brain is curious about
do not mutate canonical meaning from short answers
```
