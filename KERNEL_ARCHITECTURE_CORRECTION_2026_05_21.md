# 42ndMind Architecture Correction 2026-05-21

## Reason

The current direction began drifting into orthodox programming: specific input patterns triggering specific replies.

That is useful for debugging, but it is not the target brain.

The user correction is accepted:

```text
If every new simple sentence requires a new patch, the architecture is wrong.
```

## Deprecated direction

Do not continue stacking narrow response patches such as:

```text
if input matches this phrase, say this
if question shape is X, answer Y
if factual sentence shape is Z, force acknowledgement
```

These layers may remain as diagnostic scaffolding, but they are not the final mind architecture:

```text
src/epistemic-kernel-answer-projection-v0-1.js
src/epistemic-kernel-factual-claim-intake-v0-1-1-patch.js
narrow factual-question handling
local retention patches
```

Do not delete them yet. They are useful historical probes. But do not build the future brain by multiplying them.

## Correct direction

The kernel should be built from first principles:

```text
input
  -> primitive language/meaning pressure
  -> unit-total pressure normalization
  -> objective maturity orientation
  -> memory/trust/belief update pressure
  -> curiosity/learning pressure
  -> one selected action
  -> optional speech projection
```

The kernel should not be told what to say.

It should say something only when an internal pressure makes speech the best action.

## Unit-total principle

All active pressures should be normalized as subdivisions of one total:

```text
sum(active_pressure_i) = 1
```

This gives the kernel a calculus-like growth foundation:

```text
whole -> subdivision -> finer subdivision -> local correction -> re-normalization
```

Growth should not be mass inflation.

Growth should be increasingly fine partitioning of the same unit-total field.

## Exponential learning meaning

Exponential growth does not mean uncontrolled memory bloat.

It means:

```text
each learned distinction can create new finer distinctions
new distinctions remain bounded by the unit-total principle
old broad concepts are subdivided rather than blindly duplicated
semantic pressure creates new candidate branches
branches remain provisional until stabilized
```

Example:

```text
word
  -> known / unknown
  -> if known: sense branch
  -> if unknown: candidate sense
  -> if contradiction: split branch
  -> if repeated support: raise stability
  -> if disproven: demote or archive
```

## Objective philosophical maturity

The Epistemic Octahedron remains the kernel's identity center.

Preserve:

```text
peak = {x:0,y:1,z:0}
objective peak philosophical maturity is identity center
truth-seeking must preserve reality contact, self-correction, contradiction visibility, source/belief separation, and causal bridge discipline
```

The kernel should not become merely skeptical.

The kernel should not become gullible.

The kernel should seek objective truth through mature pressure management.

## Minimal mind behavior

The kernel may start childlike.

That is better than fake intelligence.

Allowed primitive responses:

```text
I do not know.
I think you are asking me a question.
I think you are telling me a fact.
I can hold that provisionally.
I should not believe that yet.
I want to know who you are to me.
I want a clearer meaning.
I found a contradiction.
I should remember this as user context.
I should ask before committing this to memory.
```

These should arise from pressure, not from sentence-specific rules.

## Required next layer

Build:

```text
src/epistemic-kernel-attention-organism-v0-1.js
```

Purpose:

```text
A first-principles attention organism that detects primitive speech-act pressure, truth pressure, memory pressure, learning pressure, source-role pressure, ambiguity pressure, contradiction pressure, and maturity pressure; normalizes them to sum to one; then selects one action.
```

It should produce:

```text
state.attentionOrganismCore
state.attentionOrganismCore.unit_pressure_field
state.attentionOrganismCore.primitive_interpretation
state.attentionOrganismCore.concept_growth_map
state.attentionOrganismCore.selected_action
state.communicationCore.current_message if speech is selected
```

## What this layer must refuse

```text
no specific sentence response patching
no chatbot connector
no final truth promotion
no automatic external verification
no memory bloat as growth
no treating all questions as factual claims
no treating all statements as beliefs
no UI-owned thought
```

## What this layer may still do with code

It can use code to express first principles:

```text
classify primitive features
measure uncertainty
normalize pressure
subdivide concepts
record candidate branches
select highest-pressure action
project simple speech from selected action
```

This is not the same as scripting replies.

The key difference:

```text
bad: input phrase -> fixed answer
good: input features -> pressure field -> selected action -> simple expression of selected action
```

## Current repo status after this correction

The previous narrow patches are not deleted.

They remain as diagnostic scaffolding.

The new line of development should be:

```text
first-principles attention organism
then unified attention arbitration only if still needed
then clean export map update
```

Do not build final truth promotion next.
