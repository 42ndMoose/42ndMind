# HANDOFF 2026-05-19: Deterministic Packet Ingestion Form v0.1

## Scope

This handoff records the deterministic packet ingestion form layer.

This layer consumes:

```text
coverage stress benchmark v0.1
```

and produces human-entered structured candidate packets without relying on an LLM intake assistant.

This is the first practical feed point for dossier-style material.

It does not make user material true.

It converts user-entered structured material into candidate packets with separation guards, coverage classification, unresolved items, rollback, and no belief movement.

## Built files

```text
src/kernel-deterministic-packet-ingestion-form-v0-1.js
kernel-deterministic-packet-ingestion-form-v0-1-test.html
deterministic-packet-ingestion-form.html
HANDOFF_2026_05_19_DETERMINISTIC_PACKET_INGESTION_FORM.md
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
```

## Core doctrine

```text
deterministic_human_packet_ingestion_without_llm: true
human_input_is_context_not_automatic_truth: true
structured_packet_is_candidate_not_truth: true
source_reference_is_anchor_not_lookup: true
media_description_is_context_not_media_verification: true
evidence_description_is_claim_not_evidence_verification: true
claim_text_is_candidate_not_truth: true
relation_text_is_candidate_not_truth: true
adversarial_reframe_is_pressure_not_truth: true
coverage_classification_is_not_exact_meaning: true
unknown_specifics_hold_for_admission_when_needed: true
packet_separation_required: true
dossier_material_enters_as_structured_context_packets: true
no_final_truth_promotion: true
no_belief_movement: true
no_llm: true
no_external_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
rollback_required_for_every_ingestion_packet: true
no_silent_mutation: true
belief_movement: none
```

## What it consumes

The layer consumes the coverage stress benchmark packet:

```text
KernelCoverageStressBenchmarkV01.runCoverageStressBenchmark()
```

Expected source metrics:

```text
Source coverage stress: true v0.1.0
Source coverage stress records: 16
Source coverage stress families: 16
```

## What it produces

The layer produces ingestion packets with this shape:

```text
ingestion_packet_id
input_id
packet_type
title
content
source_label
target_claim_id
relation_family_candidate
confidence_note
tags
coverage_classification_snapshot
coverage_family_candidate
exact_meaning_claimed: false
source_lookup_performed: false
media_lookup_performed: false
external_lookup_performed: false
llm_used: false
source_coverage_stress_snapshot
unresolved_items
active_guards
rollback_available
rollback_snapshot
revision_trail
packet_status: candidate_packet_not_truth
truth_status: not_adjudicated
final_authority: false
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

Expected output metrics:

```text
Decision: DETERMINISTIC_PACKET_INGESTION_FORM_READY
Source coverage stress: true v0.1.0
Source coverage stress records: 16
Ingestion packets: 10
Packet types: 10
Final authority: false
LLM used: false
Lookup: false
```

## Packet types

The form supports ten packet types:

```text
claim_candidate
source_reference
evidence_description
media_description
quote_fragment
context_note
adversarial_reframe
relation_candidate
coverage_hold
dossier_summary_packet
```

## What this adds

This layer gives the kernel a deterministic intake path for human-structured dossier material.

It is not raw dossier parsing yet.

It is the first safe feed mechanism:

```text
human enters structured claim/source/evidence/media/context/reframe/relation/coverage/dossier packet
kernel classifies coverage family
kernel preserves separation guards
kernel preserves uncertainty
kernel creates rollback snapshot
kernel refuses truth promotion
kernel refuses belief movement
kernel refuses lookup and LLM dependency
```

## What it refuses to do

```text
does not treat human input as truth
does not treat dossier material as truth
does not verify sources
does not verify media
does not verify evidence
does not adjudicate final truth
does not promote candidate packets
does not move belief
does not use LLMs
does not perform external lookup
does not use real people/events as built-in examples
does not add political-specific logic
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-deterministic-packet-ingestion-form-v0-1-test.html?v=ingestform-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine keeps deterministic ingestion non-authoritative
2. deterministic packet ingestion runs from coverage stress benchmark
3. all ten packet types are represented
4. source, media, evidence, reframe, coverage hold, and dossier separation stay visible
5. coverage classification is present but not exact meaning
6. deterministic guards are active without LLM or lookup
7. rollback, revision trail, and no silent mutation are preserved
8. no final truth, no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/deterministic-packet-ingestion-form.html?v=ingestform-1
```

The UI can:

```text
enter one manual structured packet
load the ten synthetic packet examples
run deterministic ingestion
show packet summary
show source/media/evidence separation
show rollback snapshots
copy output
```

## Cache key

```text
ingestform-1
```

## Why this matters for the user's target

This layer starts the route from dossier material into the kernel without making the LLM the truth engine.

The target remains:

```text
dossier material -> structured packets -> candidate preledger/relation/coverage world model -> stress tests -> promotion criteria -> final truth ledger -> belief defense/challenge engine
```

The current layer handles only the first feed step.

It does not yet compile a full dossier automatically.

It does not yet promote truth.

## Next suggested layer

Recommended next build after this passes:

```text
dossier-to-packet compiler v0.1
```

Purpose:

```text
Convert dossier-style sections into multiple structured packet types while preserving candidate-only discipline, separation guards, coverage classification, source/media/evidence distinctions, adversarial warnings, unresolved gaps, and rollback.
```

Alternative next build:

```text
ingestion-to-preledger bridge v0.1
```

Purpose:

```text
Take deterministic ingestion packets and convert them into preledger-ready candidate entries without truth promotion.
```

## Do not do yet

```text
do not build final truth promotion
do not treat dossier material as truth
do not make user confidence evidence
do not make source lookup automatic
do not verify media or evidence by description alone
do not move belief from ingestion packets
```
