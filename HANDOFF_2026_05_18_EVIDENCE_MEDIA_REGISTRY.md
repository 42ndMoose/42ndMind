# HANDOFF 2026-05-18: Evidence/Media Registry v0.1

## Scope

This handoff records the first evidence/media registry layer.

This layer consumes:

```text
external anchor packet schema
source/provenance registry
```

and produces evidence-level records.

It tracks:

```text
evidence modality
evidence direction
source linkage
source modality
source reliability posture
event/entity refs
support/counterevidence refs
strength
independence group
trust posture
weight posture
contradiction contribution
claim evidence summaries
```

It does not perform media lookup.

It does not perform source lookup.

It does not use an LLM.

It does not adjudicate truth.

It does not resolve contradiction pressure.

It does not promote evidence rows to doctrine.

## Built files

```text
src/kernel-evidence-media-registry-v0-1.js
kernel-evidence-media-registry-v0-1-test.html
evidence-media-registry.html
HANDOFF_2026_05_18_EVIDENCE_MEDIA_REGISTRY.md
```

## Dependency stack

```text
src/kernel-external-anchor-packet-schema-v0-1.js?v=anchor-1
src/kernel-source-provenance-registry-v0-1.js?v=prov-1
src/kernel-evidence-media-registry-v0-1.js?v=evidence-1
```

## Core doctrine

```text
tracks_evidence_media_without_truth_promotion: true
evidence_descriptions_are_context_not_truth: true
support_and_counterevidence_direction_are_separate_from_truth: true
direct_documentary_media_hearsay_and_ambiguous_postures_are_distinguished: true
source_links_required_for_evidence_rows: true
independent_evidence_requires_distinct_independence_groups: true
contradiction_contribution_is_pressure_not_resolution: true
media_lookup_is_not_automatic: true
source_lookup_is_not_automatic: true
llm_is_not_required: true
registry_entries_are_candidate_not_doctrine: true
belief_movement: none
```

## Evidence modalities

The registry classifies evidence rows into modalities:

```text
media_description_evidence
documentary_description_evidence
direct_description_evidence
user_description_evidence
hearsay_or_unverified_evidence
ambiguous_context_evidence
unknown_evidence_modality
```

The sample packet should show at least:

```text
media_description_evidence >= 1
documentary_description_evidence >= 1
user_description_evidence or direct_description_evidence >= 1
```

## Evidence direction

Evidence rows are classified as:

```text
support
counterevidence
mixed_support_and_counterevidence
undirected_context
```

Direction is not truth.

A support row remains candidate context unless later synthesis has enough anchored, independent, non-contradicted support.

## Source linkage

Every evidence row records:

```text
source_ref
source_ref_resolves
source_modality
source_reliability_posture
```

This means evidence can now inherit provenance posture without treating provenance as truth.

## Contradiction pressure

Each evidence row records:

```text
contradiction_contribution
contradiction_status
```

Allowed contradiction status in this layer:

```text
no_contradiction_pressure
pressure_only_not_resolution
```

Not allowed:

```text
resolved
```

Contradiction contribution remains pressure only.

## Claim evidence summaries

The registry summarizes evidence by claim reference:

```text
claim_id
support_count
counter_count
mixed_count
support_strength
counter_strength
evidence_ids
independence_groups
independent_group_count
claim_evidence_status
belief_movement
```

This is not a truth-status decision.

It is a structured bridge for a later truth-pressure synthesis layer.

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-evidence-media-registry-v0-1-test.html?v=evidence-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine tracks evidence without truth promotion
2. registry runs from anchor schema and source provenance registry
3. evidence modalities and directions are visible
4. source links resolve and lookup remains false
5. independence groups and claim evidence summaries are present
6. contradiction pressure remains pressure, not resolution
7. no LLM, no truth promotion, candidate-only status, and belief movement are preserved
8. validation report is clean
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/evidence-media-registry.html?v=evidence-1
```

Expected metrics:

```text
Decision: EVIDENCE_MEDIA_REGISTRY_READY
Evidence records: 5
Evidence groups: 3
Claim summaries: 5
Contradiction pressure: pressure_visible_not_resolved or no_contradiction_pressure_visible
LLM used: false
Lookup: false
```

The exact contradiction-pressure metric depends on whether the current sample packet includes counter/mixed evidence rows. In v0.1 sample, the default anchor evidence is mostly support/context, so no contradiction pressure may be visible. The invariant is that contradiction is never marked resolved.

## What this proves

The kernel now has a clean evidence/media layer between source provenance and claim truth-status synthesis.

The external-world stack is now:

```text
external anchor packet schema
-> source/provenance registry
-> evidence/media registry
```

This gives the future truth-pressure synthesis layer enough structure to avoid two common failures:

```text
repeated provenance counted as independent convergence
evidence descriptions treated as automatic truth
```

## Relation to universal language coverage

This layer strengthens the external-world side of the universal language kernel.

Universal coverage now has:

```text
formula admission path for new meanings
external anchors for world references
source provenance registry
evidence/media registry
```

The next layers should synthesize evidence pressure without violating candidate-only doctrine.

## Suggested next task

Build truth-pressure synthesis v0.1.

Suggested files:

```text
src/kernel-truth-pressure-synthesis-v0-1.js
kernel-truth-pressure-synthesis-v0-1-test.html
truth-pressure-synthesis.html
HANDOFF_2026_05_18_TRUTH_PRESSURE_SYNTHESIS.md
```

Expected purpose:

```text
Consume claim-language outputs, source provenance, and evidence/media summaries.
Produce candidate truth-pressure synthesis without final truth promotion.
Keep support, counterevidence, contradiction, narrative pressure, propaganda pressure, and unresolved gaps separate.
```

## Do not do yet

```text
do not make media/source lookup automatic
do not treat evidence descriptions as truth
do not collapse support into truth
do not resolve contradiction merely because it is detected
do not promote evidence records to doctrine
do not build political-specific logic
```
