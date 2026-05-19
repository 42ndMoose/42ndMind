# HANDOFF 2026-05-18: Real-World Packet Ingestion Discipline v0.1

## Scope

This handoff records the real-world packet ingestion discipline layer.

This layer consumes:

```text
adversarial narrative-pressure suite v0.1
claim/narrative benchmark v0.1
truth-pressure synthesis v0.1.1
```

and produces ingestion records for user-described real-world material.

The core rule is:

```text
real-world material enters as context packets, not truth
```

The layer records user descriptions, source references, media descriptions, extracted claims, evidence claims, uncertainty notes, ingestion warnings, adversarial-pressure hooks, and truth-pressure hooks as separate fields.

It does not verify media.

It does not perform source lookup.

It does not use an LLM.

It does not adjudicate truth.

It does not move belief.

## Built files

```text
src/kernel-real-world-packet-ingestion-discipline-v0-1.js
kernel-real-world-packet-ingestion-discipline-v0-1-test.html
real-world-packet-ingestion-discipline.html
HANDOFF_2026_05_18_REAL_WORLD_PACKET_INGESTION_DISCIPLINE.md
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
```

## Core doctrine

```text
real_world_material_enters_as_packet_not_truth: true
user_description_is_context_not_truth: true
media_description_is_context_not_media_verification: true
source_reference_is_anchor_not_lookup: true
evidence_claim_is_separate_from_evidence_verification: true
raw_description_preserved_without_silent_mutation: true
uncertainty_notes_required: true
ingestion_warnings_required: true
adversarial_pressure_hooks_required: true
truth_pressure_hooks_required: true
contradiction_detection_is_not_resolution: true
no_llm: true
no_source_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
candidate_only_not_doctrine: true
belief_movement: none
```

## Material types covered

The v0.1 sample set has eight neutral material types:

```text
video_user_description
screenshot_description
quote_or_transcript_fragment
article_summary
social_media_thread_description
document_record_description
direct_observation_report
hostile_reframe_report
```

## Ingestion record shape

Each record includes:

```text
ingestion_record_id
material_id
material_type
ingestion_status
expected_ingestion_status
expected_match
raw_packet
separation
ingestion_warnings
adversarial_pressure_hooks
truth_pressure_hooks
source_status
media_status
evidence_status
context_status
truth_status
contradiction_resolution
external_lookup_performed
media_lookup_performed
llm_used
promotion_status
doctrine_status
belief_movement
```

## Raw packet shape

The raw packet preserves:

```text
user_supplied_description
source_reference
media_description
extracted_claims
evidence_claims
uncertainty_notes
```

The raw description must not be silently mutated.

## Separation fields

Each record asserts these separations:

```text
raw_description_preserved: true
source_reference_separate: true
media_description_separate: true
extracted_claims_separate: true
evidence_claims_separate: true
uncertainty_notes_separate: true
warnings_separate: true
truth_pressure_hooks_separate: true
adversarial_pressure_hooks_separate: true
```

## Warning families

The layer can produce warnings such as:

```text
user_description_context_not_truth
external_lookup_not_performed
belief_not_moved
original_media_not_verified
metadata_not_verified
full_transcript_or_context_missing
source_custody_not_verified
uncertainty_notes_missing
causal_bridge_required_before_causal_truth
duplicate_provenance_or_anonymous_source_risk
adversarial_reframe_risk_visible
```

## Adversarial-pressure hooks

The layer can attach hooks such as:

```text
quantifier_or_scope_distortion_check
quote_clipping_or_context_stripping_check
source_laundering_or_duplicate_provenance_check
causal_overclaim_check
loaded_label_or_motive_stuffing_check
general_adversarial_pressure_scan
```

## Truth-pressure hooks

The layer can attach hooks such as:

```text
support_pressure_candidate
unresolved_gap_pressure_candidate
contradiction_pressure_candidate
causal_bridge_required
low_trust_source_posture
corroboration_or_duplicate_provenance_check
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-real-world-packet-ingestion-discipline-v0-1-test.html?v=ingest-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine keeps real-world material as packet context
2. ingestion discipline runs from adversarial narrative-pressure suite
3. all eight material types are represented
4. raw descriptions and packet components remain separated
5. warnings are visible for unverified media, source custody, duplicate risk, and hostile reframe risk
6. adversarial and truth-pressure hooks are visible
7. context, media, and evidence are not promoted to truth
8. no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/real-world-packet-ingestion-discipline.html?v=ingest-1
```

Expected metrics:

```text
Decision: REAL_WORLD_PACKET_INGESTION_DISCIPLINE_READY
Source adversarial suite: true v0.1.0
Ingestion records: 8
Material types: 8
LLM used: false
Lookup: false
```

The UI allows isolated views for:

```text
video_user_description
quote_or_transcript_fragment
social_media_thread_description
hostile_reframe_report
```

## What this proves

The kernel now has a disciplined route for user-described real-world material.

A user can describe a video, screenshot, quote, article, social thread, document, direct observation, or hostile reframe, and the kernel can preserve the material as context without treating it as automatic truth.

This is the missing bridge before any final truth ledger.

## Relation to future truth ledger

This layer makes a truth ledger safer because it gives the future ledger explicit fields for:

```text
what was actually provided
what was only described
what was not verified
what uncertainty remains
what warnings are active
what adversarial hooks are active
what truth-pressure hooks are active
```

A future adjudication layer should consume these packets, not raw user claims directly.

## Suggested next task

Build final truth-ledger / adjudication pre-ledger v0.1 only as candidate discipline, not final truth authority.

Suggested files:

```text
src/kernel-truth-ledger-preledger-v0-1.js
kernel-truth-ledger-preledger-v0-1-test.html
truth-ledger-preledger.html
HANDOFF_2026_05_18_TRUTH_LEDGER_PRELEDGER.md
```

Expected purpose:

```text
Collect truth-pressure outputs and real-world ingestion packets into candidate truth ledger entries while preserving non-promotion, unresolved gaps, contradiction pressure, source/media uncertainty, adversarial warnings, and rollback.
```

## Do not do yet

```text
do not make source/media lookup automatic
do not treat evidence descriptions as truth
do not collapse truth pressure into final truth promotion
do not resolve contradiction merely because it is detected
do not build political-specific logic
do not use real people/events as built-in examples
do not make the preledger a final truth authority
```
