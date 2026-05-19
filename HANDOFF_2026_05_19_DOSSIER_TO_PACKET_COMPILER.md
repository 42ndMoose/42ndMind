# HANDOFF 2026-05-19: Dossier-to-Packet Compiler v0.1

## Scope

This handoff records the dossier-to-packet compiler layer.

This layer consumes:

```text
deterministic packet ingestion form v0.1
```

and produces compiled candidate ingestion packets from dossier-style sections.

This is not a final truth authority.

This is not raw source verification.

This is not source lookup.

This is not a political-specific module.

It converts structured dossier sections into candidate packets while preserving separation guards, coverage classification, unresolved gaps, adversarial warnings, rollback, and no belief movement.

## Built files

```text
src/kernel-dossier-to-packet-compiler-v0-1.js
kernel-dossier-to-packet-compiler-v0-1-test.html
dossier-to-packet-compiler.html
HANDOFF_2026_05_19_DOSSIER_TO_PACKET_COMPILER.md
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
```

## Core doctrine

```text
dossier_compilation_is_not_truth_promotion: true
dossier_material_enters_as_structured_context_packets: true
dossier_claims_are_candidate_claims_not_truth: true
dossier_sources_are_anchors_not_lookup: true
dossier_evidence_descriptions_are_claims_not_verification: true
dossier_media_descriptions_are_context_not_verification: true
quote_fragments_require_context: true
adversarial_reframes_are_pressure_not_truth: true
unresolved_gaps_stay_visible: true
compiled_packets_remain_candidate_not_truth: true
deterministic_ingestion_required: true
no_final_truth_promotion: true
no_belief_movement: true
no_llm: true
no_external_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
rollback_required_for_every_compiled_dossier: true
no_silent_mutation: true
belief_movement: none
```

## What it consumes

The layer consumes deterministic ingestion:

```text
KernelDeterministicPacketIngestionFormV01.runDeterministicPacketIngestion()
```

Expected source metrics:

```text
Source deterministic ingestion: true v0.1.0
Source packet type count: 10
```

## What it produces

The layer produces a compiler packet with:

```text
compiled_section_count
compiled_input_count
compiled_packet_count
compiled_section_summaries
separation_warnings
compiled_human_inputs
source_deterministic_ingestion_ok
source_deterministic_ingestion_version
source_ingestion_packet_count
source_packet_type_count
compiled_ingestion_packets
packet_type_counts
coverage_family_counts
doctrine
truth_status: not_adjudicated
dossier_compiler_is_final_truth_authority: false
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
Decision: DOSSIER_TO_PACKET_COMPILER_READY
Source deterministic ingestion: true v0.1.0
Compiled sections: 2
Compiled inputs: 21
Compiled packets: 21
Packet types: 10
Final authority: false
LLM used: false
Lookup: false
```

## Supported structured section fields

The compiler supports structured dossier sections with these fields:

```text
section_id
title
summary
claims
sources
evidence
media
quotes
context
reframes
relations
unresolved
tags
```

The UI also supports line-prefix input:

```text
TITLE:
SUMMARY:
CLAIM:
SOURCE:
EVIDENCE:
MEDIA:
QUOTE:
CONTEXT:
REFRAME:
RELATION:
UNRESOLVED:
```

## Output packet mapping

The compiler maps dossier fields into deterministic ingestion packet types:

```text
summary -> dossier_summary_packet
claims -> claim_candidate
sources -> source_reference
evidence -> evidence_description
media -> media_description
quotes -> quote_fragment
context -> context_note
reframes -> adversarial_reframe
relations -> relation_candidate
unresolved -> coverage_hold
```

## What this adds

This layer turns dossier-style material into kernel-feedable packet sets.

It is the next step after manual packet entry:

```text
dossier section -> compiled human inputs -> deterministic ingestion packets -> candidate kernel material
```

It still refuses truth promotion.

It preserves the line:

```text
dossier material is structured context, not automatic truth.
```

## What it refuses to do

```text
does not believe the dossier
does not promote claims to truth
does not verify sources
does not verify evidence
does not verify media
does not perform external lookup
does not use an LLM
does not move belief
does not collapse quote fragments into context-complete claims
does not treat adversarial reframes as the same claim
does not hide unresolved gaps
does not use real people/events as built-in examples
does not add political-specific logic
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-dossier-to-packet-compiler-v0-1-test.html?v=dossierpack-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine keeps dossier compilation non-authoritative
2. dossier compiler runs through deterministic ingestion
3. all major dossier fields compile into separated packet types
4. source, media, evidence, reframe, relation, and unresolved warnings stay visible
5. coverage classification exists on every compiled packet
6. line-prefix parser converts raw dossier text into section fields
7. rollback, revision trail, and no silent mutation are preserved
8. no final truth, no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/dossier-to-packet-compiler.html?v=dossierpack-1
```

The UI can:

```text
paste a line-prefix dossier section
compile the pasted section
load synthetic dossier sections
show summary
show separation warnings
show compiled human inputs
show rollback snapshots
copy output
```

## Cache key

```text
dossierpack-1
```

## Why this matters for the user's target

This is the first layer where dossier-style material becomes directly feedable into the deterministic kernel without LLM judgment.

The target remains:

```text
dossier material -> structured packets -> candidate preledger/relation/coverage world model -> stress tests -> promotion criteria -> final truth ledger -> belief defense/challenge engine
```

Current status after this layer:

```text
dossier material -> structured packets
```

Still missing:

```text
ingestion-to-preledger bridge
dossier packet stress benchmark
truth promotion criteria
final truth ledger
belief defense/challenge engine
```

## Next suggested layer

Recommended next build after this passes:

```text
ingestion-to-preledger bridge v0.1
```

Purpose:

```text
Take deterministic ingestion and dossier-compiled packets and convert them into preledger-ready candidate entries without truth promotion.
```

Alternative next build:

```text
dossier packet stress benchmark v0.1
```

Purpose:

```text
Stress-test dossier compilation against source laundering, duplicate provenance, quote clipping, missing context, evidence-verification collapse, media-verification collapse, hostile reframe equivalence, causal overclaim, unresolved-gap deletion, and user-confidence inflation.
```

## Do not do yet

```text
do not build final truth promotion
do not treat dossier material as truth
do not make user confidence evidence
do not make source lookup automatic
do not verify media or evidence by description alone
do not move belief from compiled dossier packets
```
