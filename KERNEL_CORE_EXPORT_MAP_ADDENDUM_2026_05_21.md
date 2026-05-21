# Kernel Core Export Map Addendum 2026-05-21

Read after:

```text
KERNEL_CORE_EXPORT_MAP.md
KERNEL_ARCHITECTURE_CORRECTION_2026_05_21.md
HANDOFF_2026_05_21_ATTENTION_ORGANISM.md
```

## Correction

The previous export-map direction still listed factual-claim intake, question appetite, factual retention, and answer projection as active export candidates.

That is now corrected.

The user identified the core problem:

```text
If every new simple sentence requires a new patch, the architecture is wrong.
```

Therefore, the following are now diagnostic scaffolding, not final export-core architecture:

```text
src/epistemic-kernel-answer-projection-v0-1.js
src/epistemic-kernel-factual-claim-intake-v0-1-1-patch.js
narrow factual-question handling
local retention patches
```

Do not delete them yet. They are useful evidence of the failure mode.

Do not build the future by multiplying them.

## New export-core candidate

Add to future clean export candidate list:

```text
src/epistemic-kernel-attention-organism-v0-1.js
```

Associated files:

```text
KERNEL_ARCHITECTURE_CORRECTION_2026_05_21.md
HANDOFF_2026_05_21_ATTENTION_ORGANISM.md
epistemic-attention-organism-v0-1-test.html
llm-brain-v0-3-attention-organism-v0-1.html
```

## Current best test

```text
https://42ndmoose.github.io/42ndMind/epistemic-attention-organism-v0-1-test.html?v=ao-1
```

Expected:

```text
10/10 passed
```

## Current best live page

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-attention-organism-v0-1.html?v=ao-live-1
```

This page intentionally does not load the narrow answer/factual reply patches.

## First-principles export doctrine

Preserve:

```text
input -> primitive pressure -> unit-total normalization -> objective maturity orientation -> selected epistemic action -> optional speech
```

Preserve the unit-total principle:

```text
sum(unit_pressure_field.normalized_pressure) = 1
```

Preserve growth by subdivision:

```text
whole -> subdivision -> finer subdivision -> re-normalization
```

Reject growth by phrase-patch accumulation.

## Current target state additions

```text
state.attentionOrganismCore
state.attentionOrganismCore.primitive_interpretation
state.attentionOrganismCore.unit_pressure_field
state.attentionOrganismCore.current_unit_total
state.attentionOrganismCore.concept_growth_map
state.attentionOrganismCore.selected_action
state.attentionOrganismCore.action_log
```

## Clean export shape update

Future clean repo should include an attention organism folder:

```text
src/05-attention-organism/
  epistemic-kernel-attention-organism-v0-1.js
```

Older folders for factual-claim-intake/question-appetite may remain as archived experiments unless a later first-principles version replaces them.

## Next work rule

Improve attention organism v0.1 by refining primitive features and pressure equations.

Do not add one-off sentence replies.

Do not build final truth promotion next.
