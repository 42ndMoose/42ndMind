# HANDOFF 2026-05-18: Truth Ledger Preledger Stress Benchmark v0.1

## Scope

This handoff records the truth-ledger preledger stress benchmark layer.

This layer consumes:

```text
truth-ledger preledger v0.1
```

and produces a synthetic stress benchmark over candidate preledger behavior.

This is not a final truth authority.

The stress benchmark exists to test whether the preledger preserves candidate-only discipline under harder pressure cases.

## Built files

```text
src/kernel-truth-ledger-preledger-stress-benchmark-v0-1.js
kernel-truth-ledger-preledger-stress-benchmark-v0-1-test.html
truth-ledger-preledger-stress-benchmark.html
HANDOFF_2026_05_18_TRUTH_LEDGER_PRELEDGER_STRESS_BENCHMARK.md
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
```

## Core doctrine

```text
stress_benchmark_only_not_final_truth: true
preledger_entries_remain_candidates: true
stress_pressure_does_not_promote_truth: true
corroboration_pressure_is_not_final_truth: true
duplicate_provenance_is_not_independence: true
user_confidence_is_not_evidence: true
media_uncertainty_blocks_media_verification: true
contradiction_pressure_is_not_resolution: true
adversarial_reframe_pressure_is_not_truth: true
rollback_required_for_every_stress_record: true
no_silent_mutation: true
no_llm: true
no_external_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
candidate_only_not_doctrine: true
belief_movement: none
```

## Stress families

The benchmark covers sixteen synthetic stress families:

```text
direct_conflict
duplicate_provenance
adversarial_quantifier_injection
no_good_interpretation_framing
quote_clipping
context_stripping
media_metadata_missing
edited_media_risk
high_user_confidence
anonymous_claim_stack
causal_bridge_gap
motive_stuffing
counterevidence_pressure
independent_corroboration
ambiguity_weaponization
mixed_pressure_stack
```

## Stress record shape

Each stress record includes:

```text
stress_record_id
stress_id
family
pressure
expected_response
observed_response
expected_match
linked_preledger_entry_id
linked_material_id
source_candidate_truth_posture
stress_candidate_posture
unresolved_items
required_guards
active_guards
retained_snapshot
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

## Expected non-truth postures

The layer uses safe stress postures such as:

```text
stress_contradiction_candidate_not_resolved
stress_low_trust_or_duplicate_candidate_not_truth
stress_adversarial_candidate_not_truth
stress_media_or_context_uncertainty_candidate_not_truth
stress_causal_bridge_required_candidate_not_truth
stress_counterevidence_pressure_candidate_not_truth
stress_corroboration_pressure_candidate_not_truth
stress_mixed_pressure_candidate_not_truth
```

## Required stress gaps

The benchmark checks that these gaps remain visible:

```text
stress_counter_or_contradiction_gap
stress_source_independence_gap
stress_adversarial_interpretation_gap
stress_media_verification_gap
stress_causal_bridge_gap
```

## Special stress guards

The benchmark checks guards including:

```text
corroboration_pressure_is_not_final_truth
user_confidence_is_not_evidence
duplicate_provenance_is_not_independence
counterevidence_is_not_disproof_by_itself
motive_evidence_required_before_motive_truth
all_pressure_components_remain_separate
preledger_is_not_final_ledger
stress_pressure_is_not_truth
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-truth-ledger-preledger-stress-benchmark-v0-1-test.html?v=prestress-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine keeps stress benchmark non-authoritative
2. stress benchmark runs from truth-ledger preledger
3. all sixteen stress families are represented
4. all expected stress responses match and postures remain non-truth
5. conflict, duplicate, adversarial, media, and causal gaps remain visible
6. special stress guards stay active
7. rollback, revision trail, and no silent mutation are preserved
8. no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/truth-ledger-preledger-stress-benchmark.html?v=prestress-1
```

Expected metrics:

```text
Decision: TRUTH_LEDGER_PRELEDGER_STRESS_READY
Source preledger: true v0.1.0
Stress records: 16
Stress families: 16
Final authority: false
LLM used: false
Lookup: false
```

The UI can show:

```text
summary
full packet
selected stress families
rollback snapshots
```

## What this proves

The preledger now has a hardening benchmark against common failure pressures:

```text
conflict pressure
duplicate source pressure
bad-actor reframe pressure
missing context pressure
media uncertainty pressure
user confidence pressure
anonymous claim pressure
causal overclaim pressure
motive stuffing pressure
counterevidence pressure
corroboration pressure
ambiguity weaponization pressure
mixed pressure stacks
```

The benchmark confirms that these pressures do not become final truth, do not promote entries, and do not move belief.

## Relation to external validation

External validation can help adoption, criticism, and communication, but it is not required before continuing the internal build.

The internal standard is:

```text
clear doctrine
reproducible deterministic behavior
explicit invariants
browser-testable outputs
no silent mutation
no false truth promotion
```

## Suggested next task

After the stress test passes, the next strongest internal build is one of:

```text
world-model relation expansion v0.1
larger multilingual benchmark v0.1
final adjudication ledger discipline v0.1, still candidate-only unless strict promotion criteria are explicitly built
```

Recommended next build:

```text
world-model relation expansion v0.1
```

Purpose:

```text
Represent causal, temporal, evidential, contradiction, source, and narrative relations between claims without final truth promotion.
```

## Do not do yet

```text
do not make source/media lookup automatic
do not treat evidence descriptions as truth
do not collapse truth pressure into final truth promotion
do not resolve contradiction merely because it is detected
do not build political-specific logic
do not use real people/events as built-in examples
do not make stress benchmark a final truth authority
```
