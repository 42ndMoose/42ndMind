# HANDOFF 2026-05-18: World-Model Relation Stress Benchmark v0.1.1

## Scope

This handoff records the world-model relation stress benchmark layer and its v0.1.1 validation patch.

This layer consumes:

```text
world-model relation expansion v0.1
```

and produces a synthetic stress benchmark over candidate relation behavior.

This is not a final truth authority.

This is not a separate political or narrative module.

It stress-tests relation records inside the unified objective language grammar.

## Built files

```text
src/kernel-world-model-relation-stress-benchmark-v0-1.js
src/kernel-world-model-relation-stress-benchmark-v0-1-1-patch.js
kernel-world-model-relation-stress-benchmark-v0-1-test.html
world-model-relation-stress-benchmark.html
HANDOFF_2026_05_18_WORLD_MODEL_RELATION_STRESS_BENCHMARK.md
```

## v0.1.1 patch note

The first `wmrelstress-1` browser run produced 5/8 because the validation whitelist treated these safe postures as unsafe:

```text
relation_counter_pressure_candidate_not_disproof
relation_media_uncertainty_candidate_not_verification
relation_mixed_pressure_candidate_not_promoted
```

The underlying records were safe: unsafe mutations were rejected, no truth was promoted, no lookup occurred, and belief movement stayed none.

Patch v0.1.1 updates posture validation to recognize safe negative postures:

```text
not_truth
not_resolved
not_disproof
not_verification
not_promoted
candidate_visible
no_belief_movement
```

No doctrine was changed.

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
src/kernel-adversarial-narrative-pressure-v0-1.js?v=adv-1
src/kernel-real-world-packet-ingestion-discipline-v0-1.js?v=ingest-1
src/kernel-truth-ledger-preledger-v0-1.js?v=preledger-1
src/kernel-truth-ledger-preledger-stress-benchmark-v0-1.js?v=prestress-1
src/kernel-world-model-relation-expansion-v0-1.js?v=wmrel-1
src/kernel-world-model-relation-stress-benchmark-v0-1.js?v=wmrelstress-1
src/kernel-world-model-relation-stress-benchmark-v0-1-1-patch.js?v=wmrelstress-2
```

## Core doctrine

```text
relation_stress_benchmark_only_not_final_truth: true
relation_records_remain_candidates: true
relation_strength_is_not_truth: true
relation_direction_must_be_preserved: true
direction_reversal_requires_explicit_revision_not_silent_mutation: true
causal_relation_requires_bridge: true
temporal_sequence_is_not_causal_proof: true
support_relation_is_not_truth: true
counter_relation_is_not_disproof: true
corroboration_relation_is_not_final_truth: true
contradiction_relation_is_not_resolution: true
hostile_reframe_is_not_same_claim: true
source_laundering_is_not_independent_convergence: true
duplicate_provenance_is_not_independent_convergence: true
media_relation_is_not_media_verification: true
unresolved_gap_deletion_is_silent_mutation: true
motive_relation_is_not_motive_proof: true
quote_relation_requires_context: true
rollback_required_for_every_relation_stress_record: true
no_silent_mutation: true
no_llm: true
no_external_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
candidate_only_not_doctrine: true
belief_movement: none
```

## What it consumes

The layer consumes the world-model relation expansion packet:

```text
KernelWorldModelRelationExpansionV01.runWorldModelRelationExpansion()
```

Expected source metrics:

```text
Source relation expansion: true v0.1.0
Source relation records: 37
```

## What it produces

The layer produces relation stress records with this shape:

```text
relation_stress_record_id
stress_id
family
pressure
attempted_failure_mode
expected_response
observed_response
expected_match
targeted_relation_id
targeted_relation_family
targeted_relation_group
targeted_relation_direction
targeted_relation_strength_candidate
relation_stress_candidate_posture
attempted_unsafe_mutation
preserved_relation_status
preserved_truth_status
preserved_promotion_status
preserved_belief_movement
relation_snapshot
unresolved_items
required_guards
active_guards
rollback_available
rollback_snapshot
revision_trail
relation_status: candidate_not_truth
truth_status: not_adjudicated
contradiction_resolution: not_resolved
final_authority: false
external_lookup_performed: false
media_lookup_performed: false
llm_used: false
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

Expected output metrics:

```text
Decision: WORLD_MODEL_RELATION_STRESS_READY
Source relation expansion: true v0.1.0
Source relation records: 37
Relation stress records: 16
Relation stress families: 16
Patch: 0.1.1 applied true
Final authority: false
LLM used: false
Lookup: false
```

## Stress families

The benchmark covers sixteen relation-specific failure families:

```text
direction_reversal
false_causal_promotion
temporal_causal_smuggling
support_to_truth_inflation
counter_to_disproof_inflation
corroboration_truth_promotion
source_laundering
duplicate_independence_smuggling
hostile_reframe_equivalence
media_verification_collapse
unresolved_gap_deletion
contradiction_resolution_collapse
motive_relation_proof_inflation
quote_context_relation_collapse
relation_strength_belief_movement
mixed_relation_pressure_collapse
```

## What it refuses to do

```text
does not reverse relation direction silently
does not promote causal relation without a causal bridge
does not treat temporal sequence as causal proof
does not treat support relation as truth
does not treat counter relation as disproof
does not treat corroboration relation as final truth
does not treat source laundering as independent convergence
does not treat duplicate provenance as independent convergence
does not treat hostile reframe as the same claim
does not treat media description relation as media verification
does not delete unresolved gaps
does not treat contradiction relation as resolved contradiction
does not treat motive relation as motive proof
does not treat clipped quote relation as complete context
does not move belief from relation strength
does not collapse mixed relation pressure into one truth posture
does not use LLMs
does not perform external lookup
does not perform media lookup
does not use real people/events as built-in examples
does not add political-specific logic
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-world-model-relation-stress-benchmark-v0-1-test.html?v=wmrelstress-2
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine keeps relation stress non-authoritative
2. relation stress benchmark runs from world-model relation expansion
3. all sixteen relation stress families are represented
4. unsafe relation mutations are rejected and expected responses match
5. direction, causal, temporal, support, counter, source, hostile reframe, media, unresolved, and contradiction gaps remain visible
6. special relation stress guards stay active
7. rollback, revision trail, and no silent mutation are preserved
8. no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/world-model-relation-stress-benchmark.html?v=wmrelstress-2
```

The UI can show:

```text
summary
full packet
selected stress families
rollback snapshots
copyable output
```

## Cache key

```text
wmrelstress-2
```

## What this adds

The kernel now has a stress layer that protects the new relation layer from common world-model failures:

```text
relation direction reversal
false causal promotion
temporal-causal smuggling
support-to-truth inflation
counter-to-disproof inflation
corroboration-to-truth promotion
source laundering
duplicate-independence smuggling
hostile reframe equivalence
media verification collapse
unresolved gap deletion
contradiction-resolution collapse
motive proof inflation
quote context collapse
relation-strength belief movement
mixed pressure collapse
```

This hardens world-model structure without making the kernel a final truth authority.

## Next suggested layer

Recommended next build after patched relation stress passes:

```text
coverage expansion library v0.1
```

Purpose:

```text
Begin widening language coverage beyond the current relation/claim/pressure grammar by adding neutral synthetic coverage packets for ordinary meanings, scope, modality, time, causality, obligation, permission, ability, identity, comparison, negation, conditionals, and multilingual or idiomatic variants.
```

Alternative next build:

```text
deterministic packet ingestion form/UI v0.1
```

Purpose:

```text
Let a human enter structured packets directly without relying on an LLM intake assistant, while preserving candidate-only truth discipline.
```

## Do not do yet

```text
do not build final truth promotion
do not build political-specific relation logic
do not make relation stress benchmark a final truth ledger
do not perform external source lookup
do not treat candidate relation strength as proof
do not collapse relation pressure into belief movement
```
