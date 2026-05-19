# HANDOFF 2026-05-18: Truth Ledger Preledger v0.1

## Scope

This handoff records the truth-ledger preledger layer.

This layer consumes:

```text
real-world packet ingestion discipline v0.1
truth-pressure synthesis v0.1.1
```

and produces candidate preledger entries.

This is not a final truth authority.

The core rule is:

```text
collect pressure and ingestion snapshots without truth promotion
```

The preledger preserves:

```text
ingestion snapshots
truth-pressure links
unresolved gaps
source uncertainty
media uncertainty
evidence uncertainty
adversarial warnings
rollback snapshots
revision trail
non-promotion status
belief_movement: none
```

## Built files

```text
src/kernel-truth-ledger-preledger-v0-1.js
kernel-truth-ledger-preledger-v0-1-test.html
truth-ledger-preledger.html
HANDOFF_2026_05_18_TRUTH_LEDGER_PRELEDGER.md
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
```

## Core doctrine

```text
preledger_collects_candidate_entries_not_truth: true
ingestion_packets_are_context_not_truth: true
truth_pressure_is_pressure_not_final_truth: true
unresolved_gaps_remain_visible: true
contradiction_pressure_is_not_resolution: true
source_uncertainty_remains_visible: true
media_uncertainty_remains_visible: true
evidence_claims_are_not_verification: true
adversarial_warnings_remain_visible: true
rollback_required_for_every_entry: true
version_trail_required_for_every_entry: true
no_silent_mutation: true
no_truth_promotion: true
no_llm: true
no_source_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
candidate_only_not_doctrine: true
belief_movement: none
```

## Preledger record shape

Each preledger entry includes:

```text
preledger_entry_id
material_id
material_type
version_id
version_index
current_candidate_version
candidate_truth_posture
source_ingestion_status
linked_truth_pressure
ingestion_snapshot
unresolved_items
uncertainty_summary
separation_guards
rollback_available
rollback_snapshot
revision_trail
external_lookup_performed
media_lookup_performed
llm_used
truth_status
contradiction_resolution
ledger_status
promotion_status
doctrine_status
belief_movement
```

## Candidate postures

The layer generates safe non-truth postures such as:

```text
context_candidate_not_truth
evidence_supported_pressure_candidate_not_truth
corroborated_pressure_candidate_not_truth
causal_bridge_required_candidate_not_truth
low_trust_or_duplicate_candidate_not_truth
contradiction_pressure_candidate_not_resolved
adversarial_context_candidate_not_truth
```

These are candidate ledger postures, not final truth states.

## Unresolved item handling

Every entry must preserve unresolved items, including:

```text
uncertainty:<source note>
warning:<ingestion warning>
truth_pressure_gap:<gap note>
contradiction_pressure_visible_not_resolved
unresolved_gap_pressure_visible
media_not_verified
evidence_claims_not_verified
```

## Separation guards

Each entry includes explicit guards:

```text
support_is_not_truth: true
counterevidence_is_not_disproof_by_itself: true
contradiction_detection_is_not_resolution: true
truth_pressure_is_not_final_truth: true
user_context_is_not_truth: true
media_description_is_not_media_verification: true
evidence_claims_are_not_evidence_verification: true
source_reference_is_not_source_lookup: true
adversarial_warning_is_pressure_not_truth: true
preledger_is_not_final_ledger: true
```

## Rollback and revision trail

Every entry has:

```text
rollback_available: true
rollback_snapshot
revision_trail
silent_mutation: false
promotion_status: not_promoted
truth_status: not_adjudicated
belief_movement: none
```

The rollback snapshot stores:

```text
source_ingestion_record
linked_truth_pressure_record
source_pressure_summary
rollback_reason
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-truth-ledger-preledger-v0-1-test.html?v=preledger-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine makes preledger non-authoritative
2. preledger runs from ingestion discipline and truth-pressure synthesis
3. all entries link ingestion snapshots and truth-pressure records
4. candidate postures remain non-truth and multiple postures are visible
5. unresolved gaps, uncertainty, and warnings remain visible
6. rollback, version trail, and no silent mutation are preserved
7. separation guards prevent final ledger behavior
8. no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/truth-ledger-preledger.html?v=preledger-1
```

Expected metrics:

```text
Decision: TRUTH_LEDGER_PRELEDGER_READY
Source ingestion: true v0.1.0
Source truth pressure: true v0.1.1
Preledger entries: 8
Final authority: false
LLM used: false
Lookup: false
```

The UI can show:

```text
summary
full packet
unresolved items
rollback snapshots
```

## What this proves

The roadmap now has a complete candidate pipeline from language formula to real-world packet intake and candidate truth preledger.

The stack can now represent:

```text
meaning formulas
claim language
source/provenance/evidence/media structure
truth pressure
claim/narrative benchmark
adversarial narrative pressure
real-world packet ingestion
candidate preledger entries
rollback and revision trail
```

## What this does not prove

This is not a final universal truth authority.

It does not yet perform external source lookup.

It does not verify media.

It does not promote candidates to doctrine.

It does not adjudicate final truth.

It does not guarantee full universal coverage of every natural-language word or every real-world fact pattern.

## Roadmap status

The five-step roadmap is complete through the preledger:

```text
truth-pressure synthesis v0.1.1: complete
larger claim/narrative benchmark v0.1: complete
adversarial narrative-pressure cases v0.1: complete
real-world packet ingestion discipline v0.1: complete
truth-ledger preledger v0.1: complete
```

## Suggested next task

Run the preledger browser test first.

After it passes, the next rational step is not immediate final truth authority. The next rational step is one of:

```text
larger multilingual benchmark
world-model relation expansion
coverage stress tests
preledger stress benchmark
optional final adjudication ledger only after more stress passes
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
