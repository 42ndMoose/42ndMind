# HANDOFF 2026-05-18: Source/Provenance Registry v0.1

## Scope

This handoff records the first source/provenance registry layer.

This layer consumes the external anchor packet schema and produces source-level provenance records.

It tracks:

```text
source modality
source trust posture
provenance status
independence groups
duplicate provenance
evidence-source links
```

It does not perform source lookup.

It does not use an LLM.

It does not adjudicate truth.

It does not promote source or evidence records to doctrine.

## Built files

```text
src/kernel-source-provenance-registry-v0-1.js
kernel-source-provenance-registry-v0-1-test.html
source-provenance-registry.html
HANDOFF_2026_05_18_SOURCE_PROVENANCE_REGISTRY.md
```

## Dependency stack

```text
src/kernel-external-anchor-packet-schema-v0-1.js?v=anchor-1
src/kernel-source-provenance-registry-v0-1.js?v=prov-1
```

The registry runs from the anchor schema packet.

## Core doctrine

```text
tracks_source_provenance_without_truth_adjudication: true
duplicate_provenance_is_not_independent_convergence: true
independent_sources_require_distinct_independence_groups: true
source_lookup_is_not_automatic: true
llm_is_not_required: true
user_descriptions_are_context_not_truth: true
evidence_links_to_sources_but_does_not_promote_truth: true
hearsay_direct_media_and_documentary_postures_are_distinguished: true
registry_entries_are_candidate_not_doctrine: true
belief_movement: none
```

## Source modalities

The registry classifies source rows into modalities:

```text
user_supplied_description
media_description
documentary_description
hearsay_or_unverified_assertion
unknown_source_modality
```

The demo anchor packet should produce:

```text
user_supplied_description >= 1
media_description >= 1
documentary_description >= 1
```

## Independence model

The registry tracks source and evidence independence groups.

Important rule:

```text
duplicate provenance is not independent convergence
```

Independent convergence is only possible across distinct independence groups.

This registry does not yet decide truth from convergence. It only exposes the provenance structure.

## Evidence-source links

Each evidence row becomes an evidence-source link:

```text
link_id
evidence_id
evidence_type
source_ref
source_ref_resolves
independence_group
strength
trust_posture
media_lookup_performed: false
link_status: evidence_source_link_not_truth
belief_movement: none
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-source-provenance-registry-v0-1-test.html?v=prov-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine tracks provenance without truth adjudication
2. registry runs from external anchor packet schema
3. source modalities are distinguished
4. independence groups are tracked and duplicate provenance is checked
5. evidence-source links resolve and do not promote truth
6. source lookup, media lookup, and LLM use remain false
7. candidate-only status and belief movement are preserved
8. validation report is clean
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/source-provenance-registry.html?v=prov-1
```

Expected metrics:

```text
Decision: SOURCE_PROVENANCE_REGISTRY_READY
Source records: 4
Evidence links: 5
Duplicate provenance: 0
Source groups: 4
LLM used: false
Lookup: false
```

## What this proves

The kernel now has a clean provenance layer between external anchors and claim truth-status reasoning.

It can distinguish direct/user/media/documentary source posture, track source independence, and prevent duplicate provenance from being treated as independent convergence.

This is necessary for objective truth-seeking because claim strength should not inflate just because the same provenance repeats.

## Relation to universal language coverage

Universal language coverage is not a giant dictionary.

The path is now:

```text
unified objective grammar
external anchors
source/provenance registry
evidence/media registry
claim-language analysis
claim trace
coverage benchmarks
```

This source/provenance layer strengthens the external-world side of the language kernel.

## Suggested next task

Build evidence/media registry v0.1.

Suggested files:

```text
src/kernel-evidence-media-registry-v0-1.js
kernel-evidence-media-registry-v0-1-test.html
evidence-media-registry.html
HANDOFF_2026_05_18_EVIDENCE_MEDIA_REGISTRY.md
```

Expected purpose:

```text
Track evidence type, media/record/user-description posture, support/counterevidence direction, strength, independence group, source linkage, contradiction contribution, and whether evidence is direct, documentary, hearsay, or ambiguous.
```

## Do not do yet

```text
do not make source lookup automatic
do not treat evidence descriptions as truth
do not promote evidence records to doctrine
do not build political-specific logic
do not use real people/events as built-in examples
```
