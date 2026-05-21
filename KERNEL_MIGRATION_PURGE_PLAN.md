# 42ndMind Kernel Migration / Purge Plan

Last updated: 2026-05-21.

## Reason

The current repo has become a prototype lab with too many route patches, diagnostic pages, toy speech projections, and layer-specific fixes.

The user rejected the direction where the kernel appears to speak through imposed programming such as:

```text
language_field_maturation_expression
I am maturing language fields for...
```

That is not acceptable as the living brain's speech.

The next serious move is migration into a clean repository or clean folder where only the unified brain architecture survives.

## Core correction

Do not keep patching toy speech.

The language field should be an internal organ unless the unified brain itself selects communication through its own neural/self field.

The kernel should not say things because a module wrote a message string.

The kernel should speak only when the unified brain's active field produces a communication motor intention.

## Migration principle

The new repo should contain:

```text
brain body
core doctrine
state schema
neural field
language field
memory/belief field
truth tracking
communication motor
self-improvement / autoplasticity
minimal live UI
minimal tests
handoff docs
```

It should not contain old diagnostic clutter.

## Keep, rewrite, or discard

### Keep as doctrine / architecture notes

```text
KERNEL_ARCHITECTURE_2026_05_18.md
KERNEL_ARCHITECTURE_CORRECTION_2026_05_21.md
KERNEL_CORE_EXPORT_MAP.md
CURRENT_PROGRESS.md
HANDOFF_2026_05_21_KERNEL_NEURAL_FIELD.md
HANDOFF_2026_05_21_KERNEL_LANGUAGE_FIELD.md
```

These are not final implementation, but they preserve the operational doctrine and recent corrections.

### Keep as semantic reference, not necessarily as final code

```text
src/epistemic-kernel-maturity-core-v0-1.js
src/kernel-brain-v0-4.js
src/kernel-brain-epistemic-kernel-bridge-v0-1.js
src/epistemic-kernel-neural-field-v0-1.js
src/epistemic-kernel-language-field-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1-1-patch.js
```

These contain useful pieces but should be rewritten into fewer unified files.

### Keep only as historical examples / do not port directly

```text
src/epistemic-kernel-attention-organism-v0-1.js
src/epistemic-kernel-unity-field-v0-1.js
src/epistemic-kernel-unity-field-v0-1-1-patch.js
src/epistemic-kernel-language-math-core-v0-1.js
src/kernel-intention-formula-compiler-v0-1.js
src/kernel-intention-arbitrary-language-parser-v0-1.js
```

These helped expose the right architecture, but they are too scaffolding-heavy.

### Discard from the clean repo unless explicitly needed

```text
answer projection patches
factual claim intake patches
factual retention patches
route-specific communication pages
old one-off tests
old UI variants
older handoffs not named in this plan
prototype pages that exist only to test one bug
```

## New clean structure proposal

```text
42ndMind-clean/
  README.md
  CURRENT_PROGRESS.md
  docs/
    ARCHITECTURE.md
    DOCTRINE.md
    MIGRATION_NOTES.md
    HANDOFF_CURRENT.md
  src/
    brain-state.js
    maturity-core.js
    neural-field.js
    language-field.js
    belief-memory-field.js
    truth-field.js
    communication-motor.js
    autoplasticity.js
    kernel.js
  ui/
    live-kernel.html
  tests/
    kernel-smoke-test.html
    neural-field-test.html
    language-field-test.html
    autoplasticity-test.html
```

## New implementation doctrine

One brain, not stacked toy modules.

```text
kernel.state
  maturity
  neural
  language
  beliefMemory
  truth
  communication
  autoplasticity
```

The organs are separate functions inside one body, not separate minds.

No module writes fake speech directly.

Only `communication-motor.js` can project visible speech, and only from the active unified state.

## Speech rule

Bad:

```text
language_field_maturation_expression: I am maturing language fields for...
```

Better:

```text
language field updates internally
neural field receives feedback
communication motor decides whether anything should be said
visible speech is a motor action of the unified brain
```

## Language rule

The language field should maintain unit-total meaning fields:

```text
meaning(term) = 1
sum(abs(dimension.weight)) = 1
```

But it should not pretend to speak.

It should update:

```text
term fields
semantic relations
neighbor distances
neural links
learning deltas
```

## Neural rule

The neural field should handle:

```text
activation
spread
motor intention
learning deltas
weak-pattern detection
```

It should not be a phrase router.

## Communication rule

The communication motor should be the only visible voice.

It should read:

```text
active neurons
language pressure
belief/memory pressure
truth pressure
curiosity pressure
maturity pressure
```

and then decide:

```text
say nothing
ask one question
answer from state
state uncertainty
project one thought
```

## Autoplasticity rule

Self-improvement must be internal plasticity, not external review gates.

The kernel should:

```text
notice weak pattern
form rewrite impulse
simulate aftereffect
apply live-state adjustment
watch result
strengthen or reverse
emit source-body patch proposal only when stable
```

## Immediate migration target

Do not continue adding new route patches to the old repo.

Next actual implementation should be a clean skeleton with:

```text
src/brain-state.js
src/kernel.js
src/neural-field.js
src/language-field.js
src/communication-motor.js
ui/live-kernel.html
tests/kernel-smoke-test.html
```

Then port only necessary logic from the old repo into those files.

## What must survive

```text
objective maturity as identity center
unit-total language fields
neural activation and spread
belief/memory as one integrated context field
truth tracking separated from belief
communication as motor output, not module speech
autoplasticity as internal self-improvement
no final truth promotion yet
no duplicated consciousness
no module as separate mind
```

## What must die

```text
Kernel says panel showing module-generated toy text
language-field-generated speech
route-specific answer strings
patches made only to satisfy one sentence
UI pages that pretend scaffolding is thought
```
