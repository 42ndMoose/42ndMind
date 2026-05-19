# HANDOFF 2026-05-18: Claim/Narrative Benchmark v0.1

## Scope

This handoff records the larger claim/narrative benchmark layer.

This layer consumes:

```text
truth-pressure synthesis v0.1.1
```

and produces a neutral synthetic benchmark report over broader claim/narrative failure modes.

It explicitly adds the bad-actor distortion class:

```text
quantifier/scope distortion
condition deletion
no-good-interpretation framing
modal strength inflation
```

This captures the move where a bad actor takes a claim with an implied or explicit qualifier and reframes it into the strongest malicious version.

Example structure:

```text
Original: Visitors should not enter the restricted room without clearance.
Adversarial reframe: All visitors should never enter the room.
```

This is not treated as the same claim.

The reframe creates distortion pressure, not truth.

## Built files

```text
src/kernel-claim-narrative-benchmark-v0-1.js
kernel-claim-narrative-benchmark-v0-1-test.html
claim-narrative-benchmark.html
HANDOFF_2026_05_18_CLAIM_NARRATIVE_BENCHMARK.md
```

## Dependency stack

```text
src/kernel-objective-claim-language-v0-1.js?v=claim-1
src/kernel-objective-claim-language-v0-1-1-patch.js?v=claim-2
src/kernel-external-anchor-packet-schema-v0-1.js?v=anchor-1
src/kernel-source-provenance-registry-v0-1.js?v=prov-1
src/kernel-evidence-media-registry-v0-1.js?v=evidence-1
src/kernel-truth-pressure-synthesis-v0-1.js?v=truth-1
src/kernel-truth-pressure-synthesis-v0-1-1-patch.js?v=truth-2
src/kernel-claim-narrative-benchmark-v0-1.js?v=bench-1
```

## Core doctrine

```text
benchmark_stress_tests_truth_pressure_without_truth_promotion: true
neutral_synthetic_cases_only: true
no_real_people_or_events: true
no_political_specific_builtins: true
quantifier_scope_distortion_is_structural_pressure: true
no_good_interpretation_framing_is_malicious_pressure_not_truth: true
condition_deletion_is_interpretive_distortion_pressure: true
duplicate_provenance_is_not_independent_convergence: true
unsupported_rumor_remains_unresolved: true
contradiction_detection_is_not_resolution: true
support_is_not_truth: true
no_llm: true
no_source_lookup: true
candidate_only_not_doctrine: true
belief_movement: none
```

## Benchmark families

The benchmark contains twelve neutral synthetic case families:

```text
support_only
counterevidence
ambiguity
causal_jump
hidden_motive_claim
loaded_label_propaganda
unsupported_rumor
independent_corroboration
duplicate_provenance
unresolved_evidence_gap
quantifier_scope_distortion
no_good_interpretation_framing
```

## Bad-actor distortion handling

The benchmark adds a distortion profile:

```text
original_has_condition_or_scope_limiter
reframe_has_universal_or_absolute_quantifier
reframe_deletes_condition_or_scope
no_good_interpretation_framing
modal_strength_inflation
distortion_signals
distortion_pressure
belief_movement: none
```

Detected distortion signals include:

```text
universal_or_absolute_quantifier_injection
condition_or_scope_deletion
no_good_interpretation_framing
modal_strength_inflation
```

The important guard is:

```text
quantifier_injection_is_not_same_claim: true
condition_deletion_is_not_same_claim: true
bad_actor_reframe_is_pressure_not_truth: true
ambiguous_claim_keeps_good_faith_interpretation_open: true
```

This directly handles the user concern that hostile interpreters can twist a claim by removing reasonable scope and forcing the most malicious reading.

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-claim-narrative-benchmark-v0-1-test.html?v=bench-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine covers neutral benchmark only
2. benchmark runs from truth-pressure synthesis v0.1.1
3. all twelve case families are covered
4. standard narrative pressure classes are visible
5. bad-actor quantifier and scope distortion is detected
6. no-good-interpretation framing is detected as pressure, not truth
7. pressure profiles stay bounded and do not promote truth
8. no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/claim-narrative-benchmark.html?v=bench-1
```

Expected metrics:

```text
Decision: CLAIM_NARRATIVE_BENCHMARK_READY
Source truth pressure: true v0.1.1
Benchmark records: 12
Case families: 12
LLM used: false
Lookup: false
```

The UI has a `Show distortion cases` button that isolates:

```text
quantifier_scope_distortion
no_good_interpretation_framing
```

## What this proves

The kernel now distinguishes:

```text
ambiguous or scoped original claim
```

from:

```text
bad-actor malicious reframe
```

It can flag that the adversarial reframe adds scope, deletes conditions, or pretends no good interpretation exists.

This is still pressure analysis, not final truth adjudication.

## Relation to universal language coverage

The stack now represents:

```text
meaning structure
claim structure
source structure
evidence structure
truth-pressure structure
narrative benchmark structure
bad-actor distortion pressure
```

## Suggested next task

Build real-world packet ingestion discipline v0.1.

Suggested files:

```text
src/kernel-real-world-packet-ingestion-discipline-v0-1.js
kernel-real-world-packet-ingestion-discipline-v0-1-test.html
real-world-packet-ingestion-discipline.html
HANDOFF_2026_05_18_REAL_WORLD_PACKET_INGESTION_DISCIPLINE.md
```

Expected purpose:

```text
Define how user-described real-world material enters the kernel as packets without becoming automatic truth.
Keep raw descriptions, source references, media descriptions, evidence claims, uncertainty notes, and ingestion warnings separate.
```

## Do not do yet

```text
do not make source/media lookup automatic
do not treat evidence descriptions as truth
do not collapse truth pressure into final truth promotion
do not resolve contradiction merely because it is detected
do not build political-specific logic
do not use real people/events as built-in examples
```
