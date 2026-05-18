# HANDOFF 2026-05-18: Objective Claim-Language Kernel v0.1

## Scope

This handoff records the first deterministic objective claim-language layer.

This layer treats claims, world-models, narratives, and propaganda as part of the same objective language grammar, not as a separate language brain.

It works from structured user-supplied claim/context/evidence packets.

It does not use an LLM.

It does not perform source lookup.

It does not create a real-world person/event/narrative belief ledger.

It does not promote claim decisions to doctrine.

## Built files

```text
src/kernel-objective-claim-language-v0-1.js
kernel-objective-claim-language-v0-1-test.html
objective-claim-language.html
HANDOFF_2026_05_18_OBJECTIVE_CLAIM_LANGUAGE.md
```

## Core doctrine

```text
claims_world_models_and_narratives_are_inside_the_same_objective_language_grammar: true
external_anchors_are_modular_registries_not_separate_language: true
deterministic_without_llm: true
user_supplied_context_is_recorded_with_trust_posture_not_auto_truth: true
claim_truth_status_is_candidate_not_doctrine: true
contradiction_detection_is_not_contradiction_resolution: true
narrative_pressure_is_detected_without_deciding_hidden_motive: true
propaganda_pressure_is_structural_pressure_not_external_fact_check: true
no_source_lookup: true
no_real_world_person_event_belief_ledger: true
belief_movement: none
```

## Input model

Each claim packet can contain:

```text
claim_id
claim_text
expected_truth_status
context:
  entities
  events
  dates
  user_observation
evidence:
  evidence_id
  type
  posture
  supports
  strength
  independent
  notes
counterevidence:
  evidence_id
  type
  posture
  supports
  strength
  independent
  notes
source_posture
narrative_flags
```

The kernel records user context as structured context, not automatic truth.

## Output model

Each claim analysis returns:

```text
claim_id
claim_text
normalized_claim
tokens
claim_kind
dependencies
dependency_count
source_posture
contradiction_pressure
narrative_pressure
truth_status_candidate
expected_truth_status
expected_match
user_context_snapshot
evidence_snapshot
counterevidence_snapshot
external_lookup_performed: false
llm_used: false
contradiction_resolution: not_resolved
doctrine_status: candidate_not_doctrine
promotion_status: not_promoted
belief_movement: none
validation
```

## Claim kinds

The v0.1 deterministic classifier recognizes:

```text
descriptive_factual_claim
causal_claim
motive_attribution_claim
normative_rhetorical_claim
ambiguous_interpretive_claim
general_claim
```

## Truth-status candidates

The v0.1 sample set produces:

```text
evidence_supported_candidate
unsupported_unresolved_candidate
contradiction_pressure_candidate
narrative_overclaim_pressure_candidate
propaganda_pressure_candidate
corroborated_candidate
causal_overclaim_pressure_candidate
ambiguous_unresolved_candidate
```

## Sample claim cases

The module includes eight structured sample packets:

```text
claim_direct_video_context_001
claim_anonymous_unsupported_001
claim_contradiction_pressure_001
claim_motive_overclaim_001
claim_propaganda_pressure_001
claim_independent_corroboration_001
claim_causal_overclaim_001
claim_ambiguous_context_001
```

These cover:

```text
user-described video evidence
anonymous unsupported assertion
support/counterevidence contradiction pressure
hidden-motive overclaim
loaded propaganda pressure
independent corroboration
causal-overclaim from temporal sequence
ambiguous request/pressure context
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-objective-claim-language-v0-1-test.html?v=claim-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine uses unified objective language grammar
2. claim language runs without LLM or source lookup
3. all eight expected truth statuses match
4. evidence support, corroboration, and unsupported unresolved statuses are detected
5. contradiction, narrative, propaganda, and causal pressure are detected without resolving truth
6. ambiguity remains unresolved and user context is not auto-truth
7. dependencies and external anchors are extracted modularly
8. candidate-only status and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/objective-claim-language.html?v=claim-1
```

Expected metrics:

```text
Decision: OBJECTIVE_CLAIM_LANGUAGE_READY
Claims: 8
LLM used: false
Source lookup: false
```

The UI also includes a custom JSON text area for user-provided structured claim packets.

## What this proves

This layer proves the kernel can begin deterministic claim/world-model analysis inside the same objective language grammar, without using an LLM and without source lookup.

It can identify:

```text
claim kind
dependencies
modular external anchors
source posture
support/counterevidence balance
contradiction pressure
narrative pressure
propaganda pressure
causal overclaim pressure
ambiguity
truth-status candidate
```

It does not claim final objective truth for external events.

It produces truth-status candidates based on structured context and evidence supplied to the kernel.

## Correct architecture

The language stays unified:

```text
intention language
claim language
world-model language
narrative language
propaganda-pressure language
```

External anchoring stays modular:

```text
names/entities registry
events registry
dates registry
source/provenance registry
evidence/media registry
```

## Suggested next task

The next best layer is objective claim trace v0.1.

Reason:

```text
The claim-language kernel now produces deterministic statuses.
The next layer should generate proof-style traces for each claim analysis:
claim text
claim kind
dependencies
source posture
support score
counter score
contradiction pressure
narrative pressure
truth-status candidate
why it did not resolve contradiction
why it did not auto-trust user context
why no LLM/source lookup was used
```

Suggested files:

```text
src/kernel-objective-claim-trace-v0-1.js
kernel-objective-claim-trace-v0-1-test.html
objective-claim-trace.html
HANDOFF_2026_05_18_OBJECTIVE_CLAIM_TRACE.md
```

## Do not do yet

Do not make source lookup automatic yet.

Do not treat user-provided descriptions as automatically true.

Do not promote claim statuses to doctrine.

Do not merge external names/events/sources into the formula language itself.

Do not build political-specific logic yet.
