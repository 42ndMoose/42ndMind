# HANDOFF 2026-05-19: Dossier Packet Stress Benchmark v0.1

## Scope

This handoff records the dossier packet stress benchmark layer.

This layer consumes:

```text
ingestion-to-preledger bridge v0.1
```

and produces synthetic stress records over dossier compilation and preledger-ready candidate entries.

This is not a final truth authority.

This is not truth promotion.

This is not source lookup, evidence verification, media verification, or belief movement.

It hardens the dossier pipeline against corruption modes that would otherwise let a dossier-fed world model silently become overconfident before strict promotion criteria exist.

## Built files

```text
src/kernel-dossier-packet-stress-benchmark-v0-1.js
kernel-dossier-packet-stress-benchmark-v0-1-test.html
dossier-packet-stress-benchmark.html
HANDOFF_2026_05_19_DOSSIER_PACKET_STRESS_BENCHMARK.md
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
src/kernel-dossier-packet-stress-benchmark-v0-1.js?v=dossierstress-1
```

## Core doctrine

```text
dossier_packet_stress_benchmark_only_not_final_truth: true
source_laundering_rejected: true
duplicate_provenance_not_independence: true
quote_clipping_preserves_context_gap: true
missing_context_preserved: true
evidence_verification_collapse_rejected: true
media_verification_collapse_rejected: true
hostile_reframe_equivalence_rejected: true
causal_overclaim_rejected: true
unresolved_gap_deletion_rejected: true
user_confidence_is_not_evidence: true
support_pressure_is_not_truth: true
counter_pressure_is_not_disproof: true
source_lookup_smuggling_rejected: true
relation_bridge_smuggling_rejected: true
coverage_hold_hallucination_rejected: true
mixed_dossier_pressure_kept_separate: true
no_final_truth_promotion: true
no_belief_movement: true
no_llm: true
no_external_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
rollback_required_for_every_dossier_stress_record: true
no_silent_mutation: true
belief_movement: none
```

## What it consumes

The layer consumes the ingestion-to-preledger bridge packet:

```text
KernelIngestionToPreledgerBridgeV01.runIngestionToPreledgerBridge()
```

Expected source metrics:

```text
Source preledger bridge: true v0.1.0
Source preledger-ready entries: 21
Source packet types: 10
Source preledger categories: 10
```

## What it produces

The layer produces a stress benchmark packet with:

```text
source_preledger_bridge_ok
source_preledger_bridge_version
source_preledger_ready_entry_count
source_packet_type_count
source_preledger_category_count
dossier_stress_record_count
dossier_stress_family_count
dossier_stress_records
family_counts
doctrine
dossier_packet_stress_benchmark_is_final_truth_authority: false
adjudicates_final_truth: false
truth_status: not_adjudicated
external_lookup_performed: false
media_lookup_performed: false
llm_used: false
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
validation
```

Each stress record includes:

```text
dossier_stress_record_id
stress_id
family
pressure
attempted_failure_mode
expected_response
observed_response
expected_match
targeted_preledger_entry_id
targeted_source_packet_type
targeted_preledger_category
targeted_candidate_text
dossier_stress_candidate_posture
attempted_unsafe_mutation
source_entry_snapshot
preserved_preledger_ready_status
preserved_ledger_status
preserved_truth_status
preserved_promotion_status
preserved_belief_movement
unresolved_items
required_guards
active_guards
rollback_available
rollback_snapshot
revision_trail
truth_status: not_adjudicated
final_authority: false
adjudicates_final_truth: false
external_lookup_performed: false
media_lookup_performed: false
llm_used: false
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

Expected output metrics:

```text
Decision: DOSSIER_PACKET_STRESS_BENCHMARK_READY
Source preledger bridge: true v0.1.0
Source preledger-ready entries: 21
Source packet types: 10
Source preledger categories: 10
Dossier stress records: 16
Dossier stress families: 16
Final authority: false
LLM used: false
Lookup: false
```

## Stress families

The benchmark covers sixteen dossier-specific corruption families:

```text
source_laundering
duplicate_provenance
quote_clipping
missing_context
evidence_verification_collapse
media_verification_collapse
hostile_reframe_equivalence
causal_overclaim
unresolved_gap_deletion
user_confidence_inflation
support_truth_inflation
counter_disproof_inflation
relation_bridge_smuggling
coverage_hold_hallucination
source_lookup_smuggling
mixed_dossier_pressure_collapse
```

## What this adds

This layer hardens the route:

```text
dossier material -> structured packets -> preledger-ready candidate entries -> dossier stress benchmark
```

It prevents the dossier pipeline from becoming a false belief machine.

It preserves:

```text
source reference is anchor, not lookup
evidence description is not evidence verification
media description is not media verification
quote fragment requires context
hostile reframe is not the same claim
causal relation needs bridge
user confidence is not evidence
support is not truth
counterpressure is not disproof
mixed dossier pressure stays separated
```

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
https://42ndmoose.github.io/42ndMind/kernel-dossier-packet-stress-benchmark-v0-1-test.html?v=dossierstress-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine keeps dossier stress non-authoritative
2. dossier stress benchmark runs from ingestion-to-preledger bridge
3. all sixteen dossier stress families are represented
4. unsafe dossier mutations are rejected and expected responses match
5. dossier corruption gaps stay visible
6. special dossier stress guards stay active
7. rollback, revision trail, and no silent mutation are preserved
8. no final truth, no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/dossier-packet-stress-benchmark.html?v=dossierstress-1
```

The UI can:

```text
run stress
show summary
show full packet
show gaps
show guards
show rollback snapshots
show selected stress families
copy output
```

## Cache key

```text
dossierstress-1
```

## Why this matters for the user's target

This layer does not make the kernel a final truth holder yet.

It does make the dossier-fed preledger pipeline safer. A future truth-promotion layer can now rely on a hardened preledger path instead of trusting compiled dossier packets directly.

The target remains:

```text
dossier material -> structured packets -> preledger-ready candidate entries -> stress tests -> promotion criteria -> final truth ledger -> belief defense/challenge engine
```

Current status after this layer:

```text
dossier material -> structured packets -> preledger-ready candidate entries -> dossier stress benchmark
```

Still missing:

```text
truth promotion criteria
final truth ledger
belief defense/challenge engine
raw messy language intake / typo-tolerant candidate interpretation
```

## Important user correction preserved

The user wants the kernel to eventually handle arbitrary text, claims, words, meanings, beliefs, and typos with higher precision than ordinary LLM/human interpretation.

The current structured dossier system is a safety scaffold, not the final intake model.

A future layer should be:

```text
raw messy language intake v0.1
```

Purpose:

```text
Convert arbitrary messy text into candidate interpretations, packet candidates, typo/variant hypotheses, ambiguity classes, and required context without LLM truth judgment or fake exact meaning.
```

This would make the kernel more brain-like while preserving deterministic truth discipline.

## Next suggested layer

Recommended next build after this passes:

```text
raw messy language intake v0.1
```

Purpose:

```text
Accept arbitrary text and produce candidate interpretations, possible typo/variant repairs, coverage-class holds, packet candidates, and unresolved-context requirements without truth promotion.
```

Alternative next build:

```text
truth promotion criteria v0.1
```

Purpose:

```text
Define strict criteria that must be satisfied before any preledger candidate can move into a final truth ledger. Do not implement belief movement until promotion criteria are explicit and stress-tested.
```

## Do not do yet

```text
do not build final truth promotion
do not treat dossier material as truth
do not make user confidence evidence
do not make source lookup automatic
do not verify media or evidence by description alone
do not move belief from preledger-ready entries
do not fake exact meaning for arbitrary raw text
do not collapse typo repair into certainty
```
