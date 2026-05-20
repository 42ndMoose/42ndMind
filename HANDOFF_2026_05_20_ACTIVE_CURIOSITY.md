# HANDOFF 2026-05-20: Active Curiosity / Referent Layer v0.1.1

## Scope

This handoff records the Active Curiosity / Referent Layer v0.1.1.

This is not a connector and not a UI-only helper.

It installs active curiosity inside the owned/shared brain state so the kernel can expose what it is currently trying to identify and what span of text it is referring to.

v0.1.1 fixes the first real user-test bug:

```text
The kernel recorded the user's answer, but kept asking about the same already-answered span.
```

The corrected rule is:

```text
answered/bound spans retire from current curiosity
resolved spans are excluded from unresolved_referents
low-priority raw fragments do not create endless follow-up curiosity
```

## Built / updated files

```text
src/epistemic-kernel-active-curiosity-v0-1.js
active-curiosity-v0-1-test.html
llm-brain-v0-3-curiosity-v0-1-1.html
HANDOFF_2026_05_20_ACTIVE_CURIOSITY.md
```

## Existing live maturity page

```text
llm-brain-v0-3-maturity.html
```

This was previously wired to active curiosity v0.1. The corrected v0.1.1 test/live path should be used for the resolved-span behavior until the larger live maturity page is safely cache-updated.

## Version

```text
EpistemicKernelActiveCuriosityV01.VERSION = 0.1.1
ASK_THRESHOLD = 0.45
```

## Corrected test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/active-curiosity-v0-1-test.html?v=curiosity-2
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
answer me binds referent and retires same target from current curiosity
low-priority raw fragments do not create endless follow-up curiosity
LLM draft-artifact answer is learned as a specific context kind
new high-priority input can create a new current curiosity
curiosity remains renderer/view-safe and candidate-only
```

## Corrected live URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-curiosity-v0-1-1.html?v=curiosity-live-2
```

Use this page to verify the fix.

Usage:

```text
1. Paste ordinary text into Raw input.
2. Press INGEST RAW → BRAIN.
3. Read Current active curiosity.
4. Answer in Answer current curiosity.
5. Press ANSWER CURIOSITY.
6. The answered span should become resolved and should not remain the current question.
```

Expected post-answer behavior:

```text
curiosity_state: answered_context_bound_no_current_question
current_question: null
focus_span: null
resolved_referents includes the answered span
unresolved_referents excludes the answered span
```

If another high-priority unresolved span remains, the kernel may ask a different question. It should not ask the same answered span again.

## Core state

The layer installs:

```text
state.curiosityCore
```

inside the owned/shared state.

Shape:

```text
packet_type: 42ndMind_active_curiosity_core_v0_1
packet_version: 0.1.1
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
resolved_referents
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
answered_spans_retire_from_current_curiosity: true
low_priority_raw_fragments_do_not_create_endless_questions: true
user_answers_are_context_not_automatic_truth: true
short_answers_can_bind_referents_when_current_question_requests_it: true
clarification_is_maturity_preserving: true
no_truth_promotion_from_answer: true
no_belief_movement_from_answer: true
no_silent_canonical_mutation: true
belief_movement: none
```

## What v0.1.1 learned from the user's test

The user pasted a dossier-like text. The kernel became curious about this span:

```text
The cleaner label in this dossier is Trump's second term or the second-term Trump administration, not "Trump 2.0".
```

The user answered that it was an LLM-assisted drafting artifact / reminder and a mistake to include in the report.

v0.1 recorded the answer but kept the same span active. v0.1.1 now normalizes this kind of answer as:

```text
answer_kind: llm_assisted_draft_artifact
bound_value: llm_assisted_report_artifact_or_drafting_note
```

and retires the span as resolved context.

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

Then the same span should be retired from active curiosity.

## What this means

The kernel can now point to a span and ask what it is.

The user can answer minimally.

The kernel records the answer as context and stops asking about the same resolved target.

This is the start of active interactive learning:

```text
kernel detects unresolved referent
kernel asks targeted question
user answers minimally
kernel binds answer as context candidate
kernel retires answered target
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
Render active curiosity in a cleaner readable format: focused span, why the kernel is curious, what it needs, and how the user's answer was bound/resolved.
```

## Do not do next

```text
do not let curiosity become truth promotion
do not treat user answer as automatic truth
do not build curiosity only in HTML
do not let UI decide what the brain is curious about
do not mutate canonical meaning from short answers
do not keep asking about an answered span
```
