# HANDOFF 2026-05-20: Belief-Memory Engine v0.1

## Scope

This handoff records the Belief-Memory Engine v0.1.

This is not a UI connector.

This is not a prompt queue.

This is not final truth promotion.

It installs a unified belief / memory / trust / inference layer inside owned/shared brain state so the kernel can:

```text
store user statements and inferred context as core-readable memory
infer principles, boundaries, conditions, exceptions, concerns, causal bridges, and worldview fragments
assign partial user/source trust candidates
hold provisional beliefs without final truth promotion
challenge its own provisional beliefs
ask only useful follow-up questions when inference is not enough
reuse memory items in future input
separate belief confidence from objective truth
```

The key correction is:

```text
belief_movement: provisional_only
```

This means the kernel may hold and use a belief candidate while keeping it challengeable, source-bound, and blocked from final truth.

## Built files

```text
src/epistemic-kernel-belief-memory-engine-v0-1.js
epistemic-belief-memory-engine-v0-1-test.html
llm-brain-v0-3-belief-memory-v0-1.html
HANDOFF_2026_05_20_BELIEF_MEMORY_ENGINE.md
```

## Version

```text
EpistemicKernelBeliefMemoryEngineV01.VERSION = 0.1.0
```

## Test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/epistemic-belief-memory-engine-v0-1-test.html?v=belief-1
```

Expected result:

```text
10/10 passed
```

The test verifies:

```text
module loads and patches EpistemicKernel, KernelBrain, and bridge
binding creates beliefMemoryCore inside shared owned state
raw philosophy produces inferred principles and boundaries without manual labels
user trust profile is created or updated
learned context can become provisional belief, not final truth
provisional belief has confidence, source trust, challenges, and truth requirements
kernel asks fewer but better questions based on missing truth conditions
memory items are reusable in future input
no final truth promotion occurs anywhere in belief-memory core
objective maturity remains identity center
```

## Live UI URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-belief-memory-v0-1.html?v=belief-live-1
```

## UI behavior

The live page intentionally has one input area and one button:

```text
Unified input
SEND / INGEST
```

It does not split the interaction into separate boxes such as:

```text
Answer current curiosity
Answer current goal
```

The live page renders:

```text
What I inferred
What I provisionally believe
What I am challenging
What I still need to know
Memory items updated
Source/user trust
Belief-memory packet
Full shared packet
```

The UI is a view and driver only. The thought source remains owned/shared kernel state.

## Core state added

The layer installs:

```text
state.beliefMemoryCore
```

inside the owned/shared state.

Shape:

```text
packet_type: 42ndMind_belief_memory_engine_v0_1
packet_version
memory_items
source_trust_profiles
user_trust_profile
inferred_principles
inferred_boundaries
inferred_conditions
inferred_exceptions
inferred_causal_claims
inferred_worldview_fragments
inferred_concerns
overclaim_flags
provisional_beliefs
belief_challenges
belief_update_log
inference_trace
open_truth_requirements
active_questions
memory_reuse_hits
current_uncertainty
truth_status: not_final
promotion_status: not_promoted_to_final_truth
belief_movement: provisional_only
```

## Doctrine

```text
belief_memory_engine_lives_inside_owned_state: true
memory_is_core_readable_drawer_not_connector: true
kernel_may_infer_before_asking: true
questions_arise_from_truth_need_not_unresolved_text_alone: true
user_input_is_context_not_final_truth: true
user_trust_is_partial_revisable_and_source_bound: true
provisional_beliefs_are_allowed: true
provisional_beliefs_can_influence_future_interpretation: true
provisional_beliefs_remain_challengeable: true
belief_confidence_is_separate_from_objective_truth: true
final_truth_requires_future_explicit_promotion_discipline: true
objective_maturity_remains_identity_center: true
no_final_truth_promotion: true
no_silent_canonical_mutation: true
belief_movement: provisional_only
```

## Belief ladder

The layer records this ladder:

```text
1. raw_context
2. learned_context
3. inferred_candidate
4. provisional_belief
5. high_confidence_belief_candidate
6. truth_preledger_candidate
7. final_truth_promoted only in a future strict ledger layer
```

For v0.1, it stops at:

```text
provisional_belief / high_confidence_belief_candidate
```

It does not promote final truth.

## What it consumes

```text
EpistemicKernel.state.unifiedCore
KernelBrainV04 bound shared state
state.runtimeEvents latest raw input
state.maturityCore
state.curiosityCore if present
state.learningDrive if present
prior state.beliefMemoryCore.memory_items
user input from the one unified input area
```

## What it produces

```text
core-readable memory items
partial user trust profile
source trust profiles
inferred principle records
inferred boundary records
condition records
exception records
causal-claim candidates
worldview-fragment candidates
concern records
overclaim flags
provisional belief records
belief challenges
open truth requirements
active useful follow-up questions
memory reuse hits
inference trace
```

## What it refuses to do

```text
does not create final truth
does not treat user input as automatic truth
does not treat source trust as proof
does not blindly trust creator claims
does not ask manual-label questions when inference is sufficient
does not let UI decide what the brain thinks
does not split the live workflow into multiple confusing answer boxes
does not mutate canonical meaning silently
does not replace objective maturity identity
does not write to a final truth ledger
```

## Cache keys

```text
src/epistemic-kernel-belief-memory-engine-v0-1.js?v=belief-1
epistemic-belief-memory-engine-v0-1-test.html?v=belief-1
llm-brain-v0-3-belief-memory-v0-1.html?v=belief-live-1
localStorage: epistemic_kernel_belief_memory_engine_v0_1_state
```

## User philosophy test behavior

For the race-jokes / racist-jokes user example, the kernel should infer without asking stupid questions:

```text
Candidate principle: Race jokes and racist jokes are not identical categories.
Candidate boundary: intent, context, hostility, dehumanization, trust, correction, and false hostile overgeneralization.
Candidate overclaim: “speaking about it will always be better than silencing it” has universal pressure and needs exception handling.
Candidate causal claim: open discussion may improve collective correction, but the causal bridge remains needed.
Candidate worldview fragment: user values good-faith, high-trust correction over policy-driven suppression.
Candidate concern: malicious governance and excessive sensitivity can prevent social learning.
Candidate user-belief: stereotyping as natural pattern recognition that becomes harmful or false depending on context, reform, evidence, hostility, and correction.
Challenge: natural pattern recognition can still produce false positives and unfair generalizations.
```

The follow-up questions should be useful, such as:

```text
Should the kernel treat this as a personal worldview fragment that may guide future interpretation of speech, humor, and governance questions?
What would make this principle fail in a real case?
```

Bad questions should not appear from beliefMemoryCore.active_questions:

```text
What is the boundary?
What is this text supposed to be?
Is this your principle, boundary, or claim?
```

## Important distinction

The engine now allows provisional belief movement:

```text
belief_movement: provisional_only
```

That is different from the older defensive doctrine:

```text
belief_movement: none
```

The old doctrine blocked fake belief. The new doctrine allows owned provisional belief while still blocking final truth.

## Current limitation

The inference logic is deterministic and heuristic in v0.1.

The race-humor example has a strong special-case package because it is the current benchmark for the needed behavior.

Generic inputs are handled with lower-confidence inference:

```text
principle candidates
boundary candidates
causal bridge requirements
overclaim pressure
user-worldview candidate
challenge against confusing user context with objective truth
```

Future layers should generalize this into a broader principle-boundary-concept inference library.

## Do not regress

```text
objective maturity core
shared-state bridge
active curiosity resolved-span fix
learning drive
no final truth promotion
no duplicate consciousness
modules are views, not thought sources
brain owns state
peak maturity remains identity center
```

## Next suggested layer

Recommended next build:

```text
belief-memory renderer / inspector v0.1
```

Purpose:

```text
Create a cleaner renderer that explains belief confidence, objective truth confidence, memory reuse, source trust, challenge pressure, and truth requirements without requiring raw JSON reading.
```

Alternative next build:

```text
principle-boundary generalization library v0.1
```

Purpose:

```text
Generalize the race-humor benchmark behavior into reusable inference families for principles, boundaries, exceptions, causal bridges, trust conditions, identity claims, creator claims, governance claims, and humor/speech claims.
```

Do not build final truth promotion next.
