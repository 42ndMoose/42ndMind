# HANDOFF 2026-05-18: World-Model Relation Expansion v0.1

## Scope

This handoff records the world-model relation expansion layer.

This layer consumes:

```text
truth-ledger preledger stress benchmark v0.1
```

and produces candidate relation records between stress/preledger records, claim candidates, source/media packets, narrative pressure, adversarial pressure, contradiction pressure, causal gaps, and unresolved uncertainty.

This is not a final truth authority.

This is not a separate political or narrative module.

It is a relation layer inside the unified objective language grammar.

## Built files

```text
src/kernel-world-model-relation-expansion-v0-1.js
kernel-world-model-relation-expansion-v0-1-test.html
world-model-relation-expansion.html
HANDOFF_2026_05_18_WORLD_MODEL_RELATION_EXPANSION.md
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
src/kernel-adversarial-narrative-pressure-v0-1.js?v=adv-1
src/kernel-real-world-packet-ingestion-discipline-v0-1.js?v=ingest-1
src/kernel-truth-ledger-preledger-v0-1.js?v=preledger-1
src/kernel-truth-ledger-preledger-stress-benchmark-v0-1.js?v=prestress-1
src/kernel-world-model-relation-expansion-v0-1.js?v=wmrel-1
```

## Core doctrine

```text
relation_expansion_only_not_final_truth: true
world_model_relations_are_candidate_pressure: true
relation_strength_is_not_truth: true
relation_direction_must_be_explicit: true
relation_detection_is_not_relation_resolution: true
contradiction_relation_is_not_contradiction_resolution: true
support_relation_is_not_truth: true
counter_relation_is_not_disproof: true
corroboration_relation_is_not_final_truth: true
temporal_sequence_is_not_causal_proof: true
causal_relation_requires_bridge: true
source_relation_is_not_source_lookup: true
media_relation_is_not_media_verification: true
adversarial_relation_is_pressure_not_truth: true
hostile_reframe_is_not_same_claim: true
duplicate_provenance_is_not_independent_convergence: true
uncertainty_relation_keeps_gap_visible: true
rollback_required_for_every_relation_record: true
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

The layer consumes the preledger stress benchmark packet:

```text
KernelTruthLedgerPreledgerStressBenchmarkV01.runStressBenchmark()
```

Expected source metrics:

```text
Source stress: true v0.1.0
Source stress records: 16
```

## What it produces

The layer produces candidate relation records with this shape:

```text
relation_id
source_node_id
target_node_id
relation_family
relation_group
relation_role
relation_direction
relation_strength_candidate
relation_status: candidate_not_truth
source_packet_snapshot
target_packet_snapshot
pressure_components
unresolved_items
active_guards
rollback_available
rollback_snapshot
revision_trail
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
Decision: WORLD_MODEL_RELATION_EXPANSION_READY
Source stress: true v0.1.0
Relation records: 37
Relation families: 24
Relation groups: 9
Final authority: false
LLM used: false
Lookup: false
```

## Relation groups

The layer represents these world-model relation groups:

```text
causal
temporal
evidential
contradiction
source
media
narrative
adversarial
uncertainty
```

## Relation families

The layer currently covers these relation families:

```text
causes_or_contributes_to
temporally_precedes
temporally_follows
supports
counters
contradicts
depends_on
requires_evidence_for
source_reports
source_duplicates
source_independent_of
media_describes
media_unverified_for
contextualizes
narrows_scope
broadens_scope
injects_quantifier
removes_condition
clips_quote
strips_context
stuffs_motive
launders_source
weaponizes_ambiguity
leaves_unresolved
```

## What it refuses to do

```text
does not adjudicate final truth
does not promote relation strength into truth
does not resolve contradiction merely because a contradiction relation exists
does not treat support as truth
does not treat counterevidence as automatic disproof
does not treat corroboration as final truth
does not treat temporal sequence as causal proof
does not treat source relation as source lookup
does not treat media relation as media verification
does not treat hostile reframe as the same claim
does not treat duplicate provenance as independent convergence
does not use LLMs
does not perform external lookup
does not perform media lookup
does not use real people/events as built-in examples
does not add political-specific logic
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-world-model-relation-expansion-v0-1-test.html?v=wmrel-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine is relation-only, not final truth
2. relation expansion runs from preledger stress benchmark
3. causal, temporal, evidential, contradiction, source, media, narrative, adversarial, and uncertainty groups are represented
4. required relation families are represented
5. relation direction is explicit and not silently reversed
6. relation strength remains candidate pressure, not truth
7. unresolved items and guards remain visible
8. rollback, revision trail, no silent mutation, no LLM, no lookup, candidate-only, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/world-model-relation-expansion.html?v=wmrel-1
```

The UI can show:

```text
summary
full packet
relation groups
rollback snapshots
copyable output
```

## Cache key

```text
wmrel-1
```

## What this adds

The kernel now has a relation layer that can represent how claim candidates, preledger entries, stress cases, source/media descriptions, adversarial reframes, causal gaps, contradiction pressure, and uncertainty connect to each other.

This begins world-model structure without making the kernel a final truth authority.

## Next suggested layer

Recommended next build:

```text
world-model relation stress benchmark v0.1
```

Purpose:

```text
Stress-test relation expansion against direction reversal, false causal promotion, support-to-truth inflation, counterevidence-to-disproof inflation, source laundering, hostile reframe equivalence, media verification collapse, and unresolved-gap deletion.
```

Suggested files:

```text
src/kernel-world-model-relation-stress-benchmark-v0-1.js
kernel-world-model-relation-stress-benchmark-v0-1-test.html
world-model-relation-stress-benchmark.html
HANDOFF_2026_05_18_WORLD_MODEL_RELATION_STRESS_BENCHMARK.md
```

## Do not do yet

```text
do not build final truth promotion
do not build political-specific relation logic
do not make relation expansion a final truth ledger
do not perform external source lookup
do not treat candidate relation strength as proof
do not collapse relation pressure into belief movement
```
