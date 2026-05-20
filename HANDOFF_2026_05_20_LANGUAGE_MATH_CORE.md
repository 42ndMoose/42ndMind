# HANDOFF 2026-05-20: Language-Math Core v0.1

## Scope

This handoff records the Language-Math Core v0.1 integration.

The user corrected an important architecture risk:

```text
Do not invent a new formalization layer blindly.
The objective language-math kernel already exists in the repo.
Find where it lives, then integrate it into the live kernel.
```

This build therefore does not replace the existing objective language-math stack.

It wraps the existing stack into owned/shared live brain state:

```text
state.languageMathCore
state.communicationCore
```

The goal is to let the live kernel use the existing language/math machinery during conversation:

```text
formula memory
language-to-formula parsing
concept admission / meaning registration pressure
semantic relation conflict
scoped trust adjustment
back-of-head conversational context
one visible thought projected to the user
```

This remains candidate-only. No final truth. No silent canonical mutation.

## Existing objective language-math stack location

The existing objective language-math kernel sits mainly in:

```text
src/kernel-intention-formula-compiler-v0-1.js
src/kernel-intention-arbitrary-language-parser-v0-1.js
src/kernel-intention-formula-inspector-v0-1.js
src/kernel-intention-formula-inspector-v0-1-1-patch.js
src/kernel-concept-admission-registry-v0-1.js
src/kernel-objective-claim-language-v0-1.js
```

Relevant architecture file:

```text
KERNEL_ARCHITECTURE_2026_05_18.md
```

That file describes the current kernel as:

```text
working deterministic language-math brain for the covered grammar
```

The existing stack includes:

```text
Objective intention-language formula stack
Parser / language-to-formula stack
Formula inspection, concept admission, and octahedron alignment
Objective claim-language stack
External-world anchoring / truth-pressure / preledger stacks
```

## Built files

```text
src/epistemic-kernel-language-math-core-v0-1.js
epistemic-language-math-core-v0-1-test.html
llm-brain-v0-3-language-math-v0-1.html
HANDOFF_2026_05_20_LANGUAGE_MATH_CORE.md
```

## Version

```text
EpistemicKernelLanguageMathCoreV01.VERSION = 0.1.0
```

## Test URL

Open:

```text
https://42ndmoose.github.io/42ndMind/epistemic-language-math-core-v0-1-test.html?v=langmath-1
```

Expected result:

```text
10/10 passed
```

The test verifies:

```text
module loads and patches kernel, brain, and bridge
binding creates languageMathCore and communicationCore inside shared state
existing objective language-math dependencies and formula memory are visible
semantic remapping claim is detected as relation formula
semantic inconsistency creates scoped trust hold, not total user distrust
communicationCore projects one live thought challenging the claim
reply can be carried as benefit-of-doubt back-of-head context
ordinary language still routes through parser toward candidate formula concepts
candidate admission requests do not silently mutate canonical meaning
no final truth promotion and maturity identity preserved
```

## Live UI URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-language-math-v0-1.html?v=langmath-live-1
```

The live page uses one input area and renders:

```text
Kernel says
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
state.unifiedCore
state.runtimeEvents latest raw input
state.maturityCore
state.beliefMemoryCore if present
KernelUnifiedFormulaInspectorV011
KernelIntentionArbitraryLanguageParserV01
KernelConceptAdmissionRegistryV01
KernelObjectiveClaimLanguageV01
KernelIntentionCanonicalFormulaLedgerV011
KernelIntentionProofOutputV01
```

## What it produces

Inside `state.languageMathCore`:

```text
dependency_status
formula_memory_summary
parser_results
claim_language_results
semantic_relation_claims
semantic_conflicts
scoped_trust_adjustments
benefit_of_doubt_context
back_of_head_context
candidate_admission_requests
communication_pressure
live_thought
integration_log
```

Inside `state.communicationCore`:

```text
current_message
message_history
attention_source: language_math_core
```

## Core doctrine

```text
language_math_core_lives_inside_owned_state: true
integrates_existing_objective_language_math_kernel: true
not_a_connector_that_owns_thought: true
wraps_formula_inspector_parser_concept_admission_and_claim_language: true
language_meaning_enters_as_relations_constraints_and_formula_candidates: true
meaning_claims_must_preserve_scope_and_conflict_pressure: true
semantic_conflict_adjusts_scoped_trust_not_total_user_trust: true
benefit_of_doubt_context_is_allowed_during_conversation: true
back_of_head_context_is_live_attention_not_final_truth: true
communication_is_projection_of_state_pressure_not_scripted_chat: true
formula_memory_remains_candidate_not_doctrine: true
no_silent_canonical_mutation: true
no_repo_commit_without_review: true
no_final_truth_promotion: true
belief_movement: provisional_only
```

## Semantic remapping example

Input:

```text
chicken means stretch
```

The kernel should detect:

```text
semantic relation claim: chicken -> stretch
conflict score: high
accepted_as_general_meaning: false
allowed_as_private_or_local_definition_candidate: true
candidate admission request: held_for_scope_or_reason
scoped trust adjustment: semantic_definition_claims only
communication thought: ask for scope or reason
```

It should not totally distrust the user.

It should withhold trust only in the relevant claim scope:

```text
semantic_definition_claims
```

Then if the user says:

```text
I was testing whether you would blindly accept semantic remapping.
```

The kernel should carry that as:

```text
benefit_of_doubt_context
back_of_head_context
may_inform_next_interpretation_without_truth_promotion
```

and communicate:

```text
I will carry that as live context for understanding your intent, not as objective truth.
```

## Important distinction

This build is not just a connector.

A bad connector would be:

```text
live brain asks external math module for a packet
external module owns the result
UI displays the packet
```

This build instead does:

```text
existing language-math stack remains intact
languageMathCore lives inside state.unifiedCore
languageMathCore reads existing formula/parser/admission outputs
communicationCore projects one live thought from state pressure
kernel can carry user replies as context without final truth promotion
```

## Current limitation

The conflict check is still primitive.

For v0.1 it has a small internal semantic prior for testable surface terms:

```text
chicken
stretch
spectacular
```

This is enough to test scoped semantic trust and communication, but not enough for mature general lexicon reasoning.

Future work should connect a broader lexicon / formula-memory / admission-review path without turning it into an unreviewed truth source.

## Cache keys

```text
src/epistemic-kernel-language-math-core-v0-1.js?v=langmath-1
epistemic-language-math-core-v0-1-test.html?v=langmath-1
llm-brain-v0-3-language-math-v0-1.html?v=langmath-live-1
localStorage: epistemic_kernel_language_math_core_v0_1_state
```

## Do not regress

```text
objective maturity core
shared-state bridge
active curiosity
learning drive
belief-memory engine
belief-memory self-optimization
existing objective language-math formula stack
formula inspector
concept admission registry
no final truth promotion
no silent canonical mutation
modules are views, not thought sources
brain owns state
communication projects live state pressure
one input box
```

## Next suggested layer

Recommended next build:

```text
communication attention v0.1
```

Purpose:

```text
Unify communicationCore with curiosityCore, learningDrive, beliefMemoryCore, and languageMathCore so the kernel chooses one thing to say from all live pressures, not just language-math pressure.
```

Alternative next build:

```text
semantic prior / lexicon admission review v0.1
```

Purpose:

```text
Make semantic conflict checks less toy-like by routing unknown and known word claims through a reviewable lexicon/formula-admission path.
```

Do not build final truth promotion next.
