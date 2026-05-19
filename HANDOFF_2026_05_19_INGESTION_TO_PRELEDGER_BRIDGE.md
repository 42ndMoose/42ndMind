# HANDOFF 2026-05-19: Ingestion-to-Preledger Bridge v0.1

## Scope

This handoff records the ingestion-to-preledger bridge layer.

This layer consumes:

```text
dossier-to-packet compiler v0.1
```

and produces preledger-ready candidate entries from compiled dossier/ingestion packets.

This is not a final truth authority.

This is not truth promotion.

This is not source lookup, evidence verification, or media verification.

It converts compiled packets into preledger-ready entries while preserving separation guards, pressure components, promotion requirements, unresolved gaps, rollback, and no belief movement.

## Built files

```text
src/kernel-ingestion-to-preledger-bridge-v0-1.js
kernel-ingestion-to-preledger-bridge-v0-1-test.html
ingestion-to-preledger-bridge.html
HANDOFF_2026_05_19_INGESTION_TO_PRELEDGER_BRIDGE.md
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
src/kernel-world-model-relation-stress-benchmark-v0-1.js?v=wmrelstress-1
src/kernel-world-model-relation-stress-benchmark-v0-1-1-patch.js?v=wmrelstress-2
src/kernel-coverage-expansion-library-v0-1.js?v=coverage-1
src/kernel-coverage-stress-benchmark-v0-1.js?v=coverstress-1
src/kernel-deterministic-packet-ingestion-form-v0-1.js?v=ingestform-1
src/kernel-dossier-to-packet-compiler-v0-1.js?v=dossierpack-1
src/kernel-ingestion-to-preledger-bridge-v0-1.js?v=prebridge-1
```

## Core doctrine

```text
ingestion_to_preledger_bridge_only: true
preledger_ready_is_not_truth_promotion: true
compiled_ingestion_packets_become_candidate_preledger_entries: true
dossier_material_remains_context_not_truth: true
source_reference_is_anchor_not_lookup: true
evidence_description_is_claim_not_verification: true
media_description_is_context_not_verification: true
quote_fragment_requires_context: true
adversarial_reframe_is_pressure_not_truth: true
relation_candidate_is_not_relation_truth: true
coverage_hold_preserves_unknown_or_unresolved_gap: true
support_pressure_is_not_truth: true
counter_pressure_is_not_disproof: true
causal_relation_requires_bridge: true
preledger_entry_is_candidate_not_final: true
no_final_truth_promotion: true
no_belief_movement: true
no_llm: true
no_external_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
rollback_required_for_every_preledger_entry: true
no_silent_mutation: true
belief_movement: none
```

## What it consumes

The layer consumes the dossier-to-packet compiler packet:

```text
KernelDossierToPacketCompilerV01.runDossierToPacketCompiler()
```

Expected source metrics:

```text
Source dossier compiler: true v0.1.0
Source compiled sections: 2
Source compiled packets: 21
```

## What it produces

The layer produces a bridge packet with:

```text
source_dossier_compiler_ok
source_dossier_compiler_version
source_compiled_section_count
source_compiled_packet_count
preledger_ready_entry_count
source_packet_type_count
preledger_category_count
preledger_ready_entries
source_packet_type_counts
preledger_category_counts
doctrine
ingestion_to_preledger_bridge_is_final_truth_authority: false
adjudicates_final_truth: false
truth_status: not_adjudicated
external_lookup_performed: false
media_lookup_performed: false
llm_used: false
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
rollback_available
rollback_snapshot
revision_trail
```

Each preledger-ready entry includes:

```text
preledger_entry_id
source_ingestion_packet_id
source_packet_type
preledger_category
title
candidate_text
source_label
target_claim_id
relation_family_candidate
coverage_family_candidate
coverage_classification_snapshot
pressure_components
required_for_truth_promotion
unresolved_items
separation_guards
source_packet_snapshot
source_compiler_snapshot
preledger_ready_status: candidate_preledger_entry_not_truth
ledger_status: candidate_preledger_not_truth
truth_status: not_adjudicated
adjudicates_final_truth: false
final_authority: false
source_lookup_performed: false
external_lookup_performed: false
media_lookup_performed: false
llm_used: false
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
rollback_available
rollback_snapshot
revision_trail
```

Expected output metrics:

```text
Decision: INGESTION_TO_PRELEDGER_BRIDGE_READY
Source dossier compiler: true v0.1.0
Source compiled sections: 2
Source compiled packets: 21
Preledger-ready entries: 21
Packet types: 10
Preledger categories: 10
Final authority: false
LLM used: false
Lookup: false
```

## Preledger categories

The bridge maps source packet types into preledger categories:

```text
claim_candidate -> claim_candidate_entry
source_reference -> source_anchor_entry
evidence_description -> evidence_description_entry
media_description -> media_description_entry
quote_fragment -> quote_fragment_entry
context_note -> context_note_entry
adversarial_reframe -> adversarial_pressure_entry
relation_candidate -> relation_candidate_entry
coverage_hold -> unresolved_coverage_hold_entry
dossier_summary_packet -> dossier_summary_entry
```

## What this adds

This layer moves the pipeline from feedable packets to preledger-ready entries:

```text
dossier section -> compiled ingestion packets -> preledger-ready candidate entries
```

It adds pressure components and required-for-promotion fields without promotion.

This matters because later truth-promotion criteria can inspect what would be required before belief movement is allowed.

## What it refuses to do

```text
does not promote truth
does not adjudicate final truth
does not move belief
does not verify sources
does not verify evidence
does not verify media
does not perform source lookup
does not perform external lookup
does not perform media lookup
does not use an LLM
does not treat support as truth
does not treat counterpressure as disproof
does not treat causal relation as causal truth without bridge
does not hide unresolved gaps
does not use real people/events as built-in examples
does not add political-specific logic
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-ingestion-to-preledger-bridge-v0-1-test.html?v=prebridge-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine keeps bridge non-authoritative
2. bridge runs from dossier-to-packet compiler
3. all ten packet types and preledger categories are represented
4. source, evidence, media, quote, reframe, relation, and coverage guards stay visible
5. pressure components and promotion requirements are present without promotion
6. all entries remain candidate preledger, not truth ledger
7. rollback, revision trail, and no silent mutation are preserved
8. no final truth, no LLM, no lookup, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/ingestion-to-preledger-bridge.html?v=prebridge-1
```

The UI can:

```text
run the bridge
show summary
show full packet
show pressure components
show promotion requirements
show guards and unresolved items
show rollback snapshots
copy output
```

## Cache key

```text
prebridge-1
```

## Why this matters for the user's target

This layer makes the dossier pipeline closer to an operational memory system:

```text
dossier material -> structured packets -> preledger-ready candidate entries
```

It still refuses to call those entries truth.

This is correct. A later promotion layer should inspect the required-for-promotion fields before any final truth ledger or belief-defense engine is allowed to move belief.

## Next suggested layer

Recommended next build after this passes:

```text
dossier packet stress benchmark v0.1
```

Purpose:

```text
Stress-test dossier compilation and preledger bridging against source laundering, duplicate provenance, quote clipping, missing context, evidence-verification collapse, media-verification collapse, hostile reframe equivalence, causal overclaim, unresolved-gap deletion, and user-confidence inflation.
```

Alternative next build:

```text
truth promotion criteria v0.1
```

Purpose:

```text
Define strict criteria that must be satisfied before any preledger candidate can move into a final truth ledger. Do not implement belief movement until stress passes exist.
```

## Do not do yet

```text
do not build final truth promotion
do not treat dossier material as truth
do not make user confidence evidence
do not make source lookup automatic
do not verify media or evidence by description alone
do not move belief from preledger-ready entries
```
