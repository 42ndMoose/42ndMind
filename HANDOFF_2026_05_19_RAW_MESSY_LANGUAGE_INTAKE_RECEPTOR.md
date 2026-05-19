# HANDOFF 2026-05-19: Raw Messy Language Intake Receptor v0.1

## Scope

This handoff records the raw messy language intake receptor layer.

This layer consumes:

```text
unified runtime receptor registry v0.1
```

and produces candidate interpretations, typo/variant hypotheses, packet candidates, relation candidates, coverage holds, pressure components, and admission candidates from arbitrary messy text.

This is a receptor inside the unified runtime, not an external parser or side filter.

This is not a final truth authority.

This is not belief movement.

This is not source lookup, evidence verification, media verification, or LLM judgment.

## Why this layer exists

The user clarified that the kernel should not remain dependent on structured forms forever.

The long-run target is a brain that can handle arbitrary information thrown at it:

```text
raw text
claims
belief statements
typos
fragments
unknown words
idioms
relations
source/evidence/media descriptions
hostile reframes
```

The correct architecture is:

```text
raw messy text enters the unified runtime
raw intake receptor activates inside 1
candidate interpretations form inside the same runtime
packet candidates, relation candidates, pressure, gaps, and admission candidates remain candidate-only
```

Wrong architecture:

```text
raw text -> external parser/filter -> kernel
```

## Built files

```text
src/kernel-raw-messy-language-intake-receptor-v0-1.js
kernel-raw-messy-language-intake-receptor-v0-1-test.html
raw-messy-language-intake-receptor.html
HANDOFF_2026_05_19_RAW_MESSY_LANGUAGE_INTAKE_RECEPTOR.md
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
src/kernel-unified-runtime-receptor-registry-v0-1.js?v=runtime-1
src/kernel-raw-messy-language-intake-receptor-v0-1.js?v=rawintake-1
```

## Core doctrine

```text
raw_messy_language_enters_unified_runtime: true
raw_intake_is_receptor_inside_one: true
raw_intake_is_not_external_filter: true
arbitrary_text_becomes_candidate_interpretations: true
typo_repair_is_candidate_not_certainty: true
fragment_completion_is_candidate_not_certainty: true
belief_statement_is_pressure_not_truth: true
claim_candidate_is_not_truth: true
packet_candidate_is_not_truth: true
relation_candidate_is_not_truth: true
coverage_hold_is_not_fake_meaning: true
admission_candidate_is_not_doctrine: true
epistemic_octahedron_maturity_guard_active: true
maturity_is_integration_not_confidence: true
objective_maturity_refuses_premature_certainty: true
source_reference_is_anchor_not_lookup: true
evidence_media_description_is_not_verification: true
hostile_reframe_is_pressure_not_same_claim: true
causal_relation_requires_bridge: true
no_final_truth_promotion: true
no_belief_movement: true
no_llm: true
no_external_lookup: true
no_media_lookup: true
rollback_required: true
no_silent_mutation: true
belief_movement: none
```

## What it consumes

The layer consumes the unified runtime receptor registry:

```text
KernelUnifiedRuntimeReceptorRegistryV01.runUnifiedRuntimeReceptorRegistry()
```

Expected source metrics:

```text
Source unified runtime: true v0.1.0
Source receptors: 14
Source runtime is one brain: true
Source modules as side filters: false
```

## What it produces

The layer produces a raw intake packet with:

```text
source_unified_runtime_ok
source_unified_runtime_version
source_receptor_count
source_runtime_is_one_brain
source_modules_as_side_filters
raw_intake_record_count
candidate_interpretation_count
candidate_packet_count
relation_candidate_count
typo_variant_hypothesis_count
unknown_or_new_meaning_hypothesis_count
admission_candidate_count
raw_intake_records
doctrine
raw_messy_intake_is_final_truth_authority: false
adjudicates_final_truth: false
truth_status: not_adjudicated
external_lookup_performed: false
media_lookup_performed: false
llm_used: false
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
rollback_available
rollback_snapshot
revision_trail
validation
```

Each raw intake record includes:

```text
raw_intake_record_id
raw_input_id
input_event_type
raw_text_snapshot
source
source_unified_runtime_snapshot
token_count
tokens
signal_snapshot
typo_variant_hypotheses
unknown_or_new_meaning_hypotheses
candidate_interpretations
candidate_packets
relation_candidates
pressure_components
admission_candidates
unresolved_items
active_guards
runtime_receptor_status: raw_messy_intake_receptor_inside_unified_runtime
record_status: candidate_raw_intake_not_truth
truth_status: not_adjudicated
final_authority: false
adjudicates_final_truth: false
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

## What this adds

This layer begins the move from structured packet scaffold toward brain-like intake.

It can deterministically identify candidate signals for:

```text
claims
belief pressure
source references
evidence descriptions
media descriptions
quote fragments
hostile reframes
relations / causal language
idiom or metaphor candidates
typo variants
unknown meanings
```

It produces candidate output only:

```text
candidate interpretations
candidate packets
candidate relations
candidate admission records
unresolved gaps
```

## What it refuses to do

```text
does not promote truth
does not adjudicate final truth
does not move belief
does not use an LLM
does not perform source lookup
does not perform external lookup
does not perform media lookup
does not treat typo repair as certainty
does not fake exact meaning for unknown terms
does not treat belief pressure as evidence
does not treat source references as lookup
does not treat evidence/media descriptions as verification
does not treat hostile reframes as same claims
does not treat causal language as causal truth without bridge
does not silently mutate meanings
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-raw-messy-language-intake-receptor-v0-1-test.html?v=rawintake-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine makes raw intake a receptor inside one runtime
2. raw messy intake runs from unified runtime receptor registry
3. typo and unknown meaning hypotheses are visible but not certain
4. raw intake creates candidate interpretations, packets, relations, and admission candidates
5. belief pressure, source/evidence/media/reframe/causal gaps stay visible
6. Epistemic Octahedron maturity guard stays active on all raw records
7. raw intake remains inside runtime, not external filter
8. no final truth, no LLM, no lookup, rollback, and belief movement are preserved
```

Expected metrics:

```text
Decision: RAW_MESSY_LANGUAGE_INTAKE_RECEPTOR_READY
Source unified runtime: true v0.1.0
Source receptors: 14
Source runtime is one brain: true
Source modules as side filters: false
Raw intake records: 5
Candidate interpretations: >= 5
Candidate packets: >= 7
Relation candidates: >= 4
Typo variant hypotheses: >= 1
Unknown/new meaning hypotheses: >= 1
Admission candidates: >= 1
Final authority: false
LLM used: false
Lookup: false
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/raw-messy-language-intake-receptor.html?v=rawintake-1
```

The UI can:

```text
run a manual raw text entry
run synthetic sample set
show summary
show full packet
show raw intake records
show typo/unknown hypotheses
show candidates
show admission candidates
show guards
show rollback snapshots
copy output
```

## Cache key

```text
rawintake-1
```

## Why this matters for the user's target

The kernel now has a first raw intake receptor inside the unified runtime.

This is still early and deterministic.

It is not yet human-level arbitrary language understanding.

But it points in the right direction:

```text
raw text enters one brain
signals activate receptors
candidate interpretations form
unknowns and typos create admission candidates
maturity guard blocks premature certainty
truth promotion remains impossible until future criteria exist
```

## Important limitation

This v0.1 is heuristic and first-pass.

It does not yet learn autonomously.

It does not yet rewrite its own formulas.

It does not yet hold promoted beliefs.

It does not yet parse all language.

Its main contribution is architectural:

```text
raw messy intake now enters the unified brain as a receptor pathway, not as an external side parser.
```

## Next suggested layer

Recommended next build after this passes:

```text
meaning admission / self-expansion loop v0.1
```

Purpose:

```text
Let the runtime propose candidate subdivisions and meaning additions when receptors detect unknown terms, idioms, typos, or recurring gaps, without silently mutating canonical knowledge.
```

Alternative next build:

```text
raw intake stress benchmark v0.1
```

Purpose:

```text
Stress-test raw messy intake against typo-certainty collapse, fake meaning, ambiguous scope, quote clipping, hostile reframe equivalence, belief-pressure inflation, and causal overclaim.
```

## Do not do yet

```text
do not build final truth promotion
do not build political-specific logic
do not make source lookup automatic
do not treat user descriptions as truth
do not treat evidence descriptions as truth
do not promote candidates to doctrine
do not use real people/events as built-in truth examples
do not move belief from raw intake records
do not fake exact meaning for arbitrary raw text
do not collapse typo repair into certainty
```
