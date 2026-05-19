# HANDOFF 2026-05-18: Truth-Pressure Synthesis v0.1

## Scope

This handoff records the first truth-pressure synthesis layer.

This layer consumes:

```text
objective claim-language outputs
external anchor packet schema
source/provenance registry
evidence/media registry
```

and produces candidate truth-pressure synthesis records.

It combines pressure signals while keeping them separate:

```text
support pressure
counterevidence pressure
contradiction pressure
narrative pressure
propaganda pressure
unresolved gap pressure
external evidence linkage
source/evidence posture
```

It does not promote claims to truth.

It does not use an LLM.

It does not perform source or media lookup.

It does not resolve contradiction pressure.

It does not treat support as truth.

It does not treat counterevidence as disproof by itself.

It does not treat narrative pressure as proof of hidden motive.

It does not treat propaganda pressure as an external fact-check.

## Built files

```text
src/kernel-truth-pressure-synthesis-v0-1.js
kernel-truth-pressure-synthesis-v0-1-test.html
truth-pressure-synthesis.html
HANDOFF_2026_05_18_TRUTH_PRESSURE_SYNTHESIS.md
```

## Dependency stack

```text
src/kernel-objective-claim-language-v0-1.js?v=claim-1
src/kernel-objective-claim-language-v0-1-1-patch.js?v=claim-2
src/kernel-external-anchor-packet-schema-v0-1.js?v=anchor-1
src/kernel-source-provenance-registry-v0-1.js?v=prov-1
src/kernel-evidence-media-registry-v0-1.js?v=evidence-1
src/kernel-truth-pressure-synthesis-v0-1.js?v=truth-1
```

## Core doctrine

```text
synthesizes_truth_pressure_without_truth_promotion: true
claim_language_status_remains_candidate: true
support_counterevidence_contradiction_narrative_propaganda_and_gaps_remain_separate: true
contradiction_detection_is_not_contradiction_resolution: true
narrative_pressure_is_not_hidden_motive_proof: true
propaganda_pressure_is_structural_not_external_fact_check: true
evidence_descriptions_are_context_not_truth: true
source_provenance_informs_weight_without_source_lookup: true
unresolved_gaps_remain_visible: true
no_llm: true
no_source_lookup: true
candidate_only_not_doctrine: true
belief_movement: none
```

## Synthesis records

Each claim produces one synthesis record:

```text
synthesis_id
claim_id
claim_text
claim_kind
source_truth_status_candidate
synthesis_status_candidate
pressure_components
external_evidence_pressure
dependency_count
dependencies
unresolved_gap_notes
separation_guards
external_lookup_performed: false
llm_used: false
contradiction_resolution: not_resolved
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

## Pressure components

Each record keeps pressure dimensions separate:

```text
support_pressure
counter_pressure
contradiction_pressure
contradiction_present
contradiction_resolution: not_resolved
narrative_pressure
propaganda_pressure
unresolved_gap_pressure
source_weight_posture
user_context_not_auto_truth
belief_movement
```

The synthesis layer must not collapse these into a single final truth score.

## Synthesis statuses

The v0.1 sample set should produce these status families:

```text
evidence_supported_pressure_candidate
unsupported_unresolved_pressure_candidate
contradiction_pressure_visible_candidate
narrative_overclaim_pressure_visible_candidate
propaganda_pressure_visible_candidate
corroborated_pressure_candidate
causal_overclaim_pressure_visible_candidate
ambiguous_unresolved_pressure_candidate
```

## External evidence linkage

The synthesis layer consumes the evidence/media claim summaries.

The current evidence/media sample has:

```text
Evidence records: 5
Evidence groups: 3
Claim summaries: 4
```

Five evidence rows compress into four unique claim summaries because two independent documentary evidence rows support `claim_cost_change`.

The synthesis layer does not require all claim-language demo claims to have direct external evidence-summary matches. Missing direct links become visible unresolved/bridge notes rather than false failures.

## Separation guards

Each synthesis record includes explicit guards:

```text
support_is_not_truth: true
counterevidence_is_not_disproof_by_itself: true
contradiction_is_not_resolved: true
narrative_pressure_is_not_motive_proof: true
propaganda_pressure_is_not_external_fact_check: true
user_context_is_not_auto_truth: true
```

These guards are the core value of this layer.

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-truth-pressure-synthesis-v0-1-test.html?v=truth-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine synthesizes pressure without truth promotion
2. synthesis runs from claim language and evidence media registry
3. all expected pressure statuses are visible
4. pressure components stay separate and bounded
5. separation guards prevent false promotion
6. external evidence summaries are linked without requiring final truth
7. unresolved gaps remain visible
8. no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/truth-pressure-synthesis.html?v=truth-1
```

Expected metrics:

```text
Decision: TRUTH_PRESSURE_SYNTHESIS_READY
Claims: 8
Evidence records: 5
External summaries: 4
Synthesis records: 8
LLM used: false
Lookup: false
```

## What this proves

The kernel can now combine the internal objective claim-language analysis with external-world anchor/provenance/evidence structure.

It still refuses the key bad moves:

```text
support -> truth
counterevidence -> automatic disproof
contradiction -> resolved contradiction
narrative pressure -> hidden motive proof
propaganda pressure -> external fact-check
user context -> automatic truth
```

This is the first proper truth-pressure layer, not a final truth ledger.

## Relation to universal language coverage

The current stack now includes:

```text
formula grammar
concept admission
unified formula inspection
claim-language analysis
claim trace
external anchors
source provenance
evidence/media registry
truth-pressure synthesis
```

The language kernel is now able to represent:

```text
meaning structure
claim structure
source structure
evidence structure
truth-pressure structure
```

## Suggested next task

Build larger claim/narrative benchmark v0.1.

Suggested files:

```text
src/kernel-claim-narrative-benchmark-v0-1.js
kernel-claim-narrative-benchmark-v0-1-test.html
claim-narrative-benchmark.html
HANDOFF_2026_05_18_CLAIM_NARRATIVE_BENCHMARK.md
```

Expected purpose:

```text
Stress-test truth-pressure synthesis across more claim types, including support-only, counterevidence, ambiguity, causal jumps, hidden motive claims, loaded-label propaganda, unsupported rumor, independent corroboration, duplicate provenance, and unresolved evidence gaps.
```

## Do not do yet

```text
do not make source/media lookup automatic
do not treat evidence descriptions as truth
do not collapse truth pressure into final truth promotion
do not resolve contradiction merely because it is detected
do not build political-specific logic
do not use real people/events as built-in examples
```
