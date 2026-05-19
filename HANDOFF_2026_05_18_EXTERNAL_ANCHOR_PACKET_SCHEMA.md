# HANDOFF 2026-05-18: External Anchor Packet Schema v0.1

## Scope

This handoff records the first modular external anchor packet schema.

This layer exists because the objective language grammar should remain unified, while real-world anchors should remain modular.

The schema defines anchors for:

```text
names/entities
events
dates
source/provenance
evidence/media
claim bridges
```

It does not make source lookup automatic.

It does not use an LLM.

It does not treat user descriptions as automatic truth.

It does not merge real-world anchors into the formula language itself.

## Built files

```text
src/kernel-external-anchor-packet-schema-v0-1.js
kernel-external-anchor-packet-schema-v0-1-test.html
external-anchor-packet-schema.html
HANDOFF_2026_05_18_EXTERNAL_ANCHOR_PACKET_SCHEMA.md
```

## Dependency stack

This layer has no runtime dependency on the formula stack or claim stack.

It can project a claim-language input from an anchor bridge, but it does not call the claim-language kernel by itself.

Runtime:

```text
src/kernel-external-anchor-packet-schema-v0-1.js?v=anchor-1
```

## Core doctrine

```text
external_anchors_are_modular_not_formula_language: true
names_entities_events_dates_sources_and_evidence_are_anchor_registries: true
anchor_packets_are_context_not_truth: true
user_descriptions_are_not_auto_truth: true
source_lookup_is_not_automatic: true
llm_is_not_required: true
provenance_is_recorded_without_source_adjudication: true
evidence_media_descriptions_require_trust_posture: true
claim_language_may_consume_anchor_summaries: true
anchor_schema_does_not_promote_claims: true
belief_movement: none
```

## Demo anchor packet contents

The sample packet contains synthetic placeholder anchors only:

```text
4 entities
4 events
3 dates
4 sources
5 evidence/media rows
2 claim bridge examples
```

No real people, events, or political claims are encoded.

## Anchor categories

### Entities

Each entity records:

```text
entity_id
label
entity_type
role
identity_status
trust_posture
```

Entity trust posture is context-only.

### Events

Each event records:

```text
event_id
label
event_type
entity_refs
date_refs
event_status
trust_posture
```

Event trust posture is not_auto_truth.

### Dates

Each date records:

```text
date_id
label
date_value
precision
chronology_status
trust_posture
```

Dates may be unknown or symbolic.

### Sources

Each source records:

```text
source_id
label
source_type
provenance_status
independence_group
trust_posture
lookup_performed: false
```

The schema records provenance posture without source adjudication.

### Evidence/media

Each evidence row records:

```text
evidence_id
evidence_type
source_ref
event_refs
entity_refs
supports
strength
independence_group
trust_posture
media_lookup_performed: false
```

Evidence descriptions require trust posture and do not become automatic truth.

### Claim bridges

Each bridge records:

```text
claim_id
claim_text
entity_refs
event_refs
evidence_refs
source_refs
bridge_status: structured_context_bridge_not_truth
```

The bridge allows a claim-language input to be generated from anchor references while preserving context-not-truth posture.

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-external-anchor-packet-schema-v0-1-test.html?v=anchor-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine keeps anchors modular
2. anchor schema runs and validates demo packet
3. anchor counts match schema baseline
4. all anchor references resolve
5. user context is not auto-truth
6. source lookup, media lookup, and LLM use remain false
7. claim bridge projection creates claim-language input without truth promotion
8. candidate-only status and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/external-anchor-packet-schema.html?v=anchor-1
```

Expected metrics:

```text
Decision: EXTERNAL_ANCHOR_SCHEMA_READY
Entities: 4
Events: 4
Dates: 3
Sources: 4
Evidence: 5
Claim bridges: 2
LLM used: false
Lookup: false
```

## What this proves

This layer gives the kernel a clean external anchoring boundary.

It can now represent real-world anchor structures without confusing them with the formula language and without treating user descriptions as truth.

The schema supports later source/provenance and evidence/media registries.

## Relation to universal language coverage

This is part of universal coverage, but not by adding a dictionary of every word.

The correct path is:

```text
unified language grammar
+
modular external anchors
+
coverage benchmarks
+
stress tests
```

The anchor schema is the bridge between structured world descriptions and the deterministic claim-language kernel.

## Suggested next task

Build source/provenance registry v0.1.

Suggested files:

```text
src/kernel-source-provenance-registry-v0-1.js
kernel-source-provenance-registry-v0-1-test.html
source-provenance-registry.html
HANDOFF_2026_05_18_SOURCE_PROVENANCE_REGISTRY.md
```

Expected purpose:

```text
Track source independence, provenance posture, duplicate provenance, hearsay/direct/media/documentary distinctions, and trust posture without external lookup and without deciding truth.
```

## Do not do yet

```text
do not make source lookup automatic
do not treat user descriptions as truth
do not promote anchor packets to doctrine
do not build political-specific logic
do not use real people/events as built-in examples
```
