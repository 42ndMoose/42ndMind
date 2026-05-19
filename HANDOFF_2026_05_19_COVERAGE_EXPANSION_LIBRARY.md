# HANDOFF 2026-05-19: Coverage Expansion Library v0.1

## Scope

This handoff records the coverage expansion library layer.

This layer consumes:

```text
world-model relation stress benchmark v0.1.1
```

and produces general language-phenomenon coverage records without trying to populate every English word, idiom, metaphor, technical phrase, or domain-specific expression.

This is a meta-grammar coverage layer.

It answers the user's correction: the kernel should have the whole scope of language inside `1`, but it should not need every possible word or expression in memory. It should recognize the class of a language phenomenon first, then learn the specific meaning only when accuracy requires it.

This is not a final truth authority.

This is not dictionary population.

This is not a separate political or narrative module.

It is a coverage layer inside the unified objective language grammar.

## Built files

```text
src/kernel-coverage-expansion-library-v0-1.js
kernel-coverage-expansion-library-v0-1-test.html
coverage-expansion-library.html
HANDOFF_2026_05_19_COVERAGE_EXPANSION_LIBRARY.md
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
```

## Core doctrine

```text
unified_language_grammar_scope_is_one: true
coverage_expansion_is_meta_grammar_not_dictionary_population: true
language_phenomenon_class_can_be_known_before_exact_meaning: true
unknown_specifics_hold_for_admission_when_needed: true
learn_detail_only_when_accuracy_requires_it: true
no_fake_specific_meaning: true
no_silent_dictionary_inflation: true
growth_means_subdivision_not_mass_inflation: true
local_concept_shape_l1_equals_1: true
force_intensity_remains_outside_shape: true
intention_type: 1
coverage_records_are_candidate_not_doctrine: true
relation_stress_source_required: true
no_final_truth_promotion: true
no_llm: true
no_external_lookup: true
no_media_lookup: true
no_real_people_or_events_as_builtins: true
no_political_specific_builtins: true
rollback_required_for_every_coverage_record: true
no_silent_mutation: true
belief_movement: none
```

## What it consumes

The layer consumes the patched relation stress packet:

```text
KernelWorldModelRelationStressBenchmarkV01.runRelationStressBenchmark()
```

Expected source metrics:

```text
Source relation stress: true
Source relation stress patch: 0.1.1
Source relation stress records: 16
Source relation stress families: 16
```

## What it produces

The layer produces coverage records with this shape:

```text
coverage_id
coverage_family
language_phenomenon
abstract_detector
synthetic_sample
output_relation_candidates
required_context_or_detail
intention_type: 1
local_concept_shape
local_concept_shape_l1: 1
force_intensity: 0
force_formula: F = M · i
force_kept_outside_shape: true
coverage_status: candidate_general_coverage_not_doctrine
dictionary_population_required: false
exact_instance_population_required: false
detail_learning_policy
source_relation_stress_snapshot
unresolved_items
active_guards
rollback_available
rollback_snapshot
revision_trail
truth_status: not_adjudicated
final_authority: false
external_lookup_performed: false
media_lookup_performed: false
llm_used: false
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

Expected output metrics:

```text
Decision: COVERAGE_EXPANSION_LIBRARY_READY
Source relation stress: true patch 0.1.1
Coverage records: 22
Coverage families: 22
Final authority: false
LLM used: false
Lookup: false
```

## Coverage families

The v0.1 layer covers general language phenomena, not a word list:

```text
literal_statement
idiom_or_fixed_expression
sarcasm_or_irony
metaphor_or_analogy
ambiguity_polysemy
deixis_indexicality
scope_quantifier
modality_possibility
modality_necessity
conditional_relation
negation
comparison
identity_definition
obligation_permission
ability_capacity
temporal_relation
causal_relation
evidence_marker
question_request
command_directive
quotation_report
unknown_pattern_hold_for_admission
```

## Key behavior

The layer can classify examples like:

```text
That plan is up in the air. -> idiom_or_fixed_expression
Great, another delay. -> sarcasm_or_irony
The queue is a bottleneck. -> metaphor_or_analogy
Zorp flindle makes the bracket hum. -> unknown_pattern_hold_for_admission
```

Important: the classifier identifies the phenomenon class without pretending exact meaning.

For example, the kernel can mark something as idiom/sarcasm/metaphor without claiming the exact intended meaning until context or admission requires it.

This gives the kernel a brain-like first-principles recognition layer:

```text
I know what class of thing this is.
I know what kind of context is needed.
I do not need every possible instance preloaded.
I do not fake the exact meaning.
I learn the specific meaning only when needed.
```

## What it refuses to do

```text
does not populate every English word
does not populate every idiom
does not populate every metaphor
does not populate every technical expression
does not fake exact meaning from weak coverage
does not turn class detection into truth
does not promote coverage records into doctrine
does not inflate shape mass
does not place force/intensity inside concept shape
does not use LLMs
does not perform external lookup
does not perform media lookup
does not use real people/events as built-in examples
does not add political-specific logic
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-coverage-expansion-library-v0-1-test.html?v=coverage-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine treats coverage as meta-grammar, not dictionary population
2. coverage expansion runs from patched relation stress benchmark
3. required general language phenomena are represented
4. class detection works without exact instance or dictionary population
5. idiom, sarcasm, metaphor, and unknown patterns classify without pretending exact meaning
6. unknown pattern hold and admission route stay visible
7. local shape invariants and rollback discipline are preserved
8. no truth promotion, no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/coverage-expansion-library.html?v=coverage-1
```

The UI can show:

```text
summary
full packet
families
unknown/admission holds
rollback snapshots
sample phenomenon classifier
copyable output
```

## Cache key

```text
coverage-1
```

## What this adds

This layer shifts the project from “more covered examples” into “whole-scope language-class awareness.”

The kernel does not need a giant dictionary to avoid being blind. It needs a deterministic way to detect the kind of phenomenon in front of it, preserve uncertainty, request the right context, and admit new specific meanings only when required.

This is closer to a programming-language layer for meaning: surface text gets routed into structural language classes, relation candidates, context requirements, rollback, and candidate admission discipline.

## Next suggested layer

Recommended next build after coverage expansion passes:

```text
coverage stress benchmark v0.1
```

Purpose:

```text
Stress-test the coverage library against fake exact meaning, idiom literalization, sarcasm literalization, metaphor collapse, ambiguity closure, missing deictic anchors, scope drift, modality inflation, condition deletion, negation scope failure, causal overclaim, and unknown-pattern hallucination.
```

Alternative next build:

```text
deterministic packet ingestion form/UI v0.1
```

Purpose:

```text
Let a human enter structured packets directly without relying on an LLM intake assistant, while preserving candidate-only truth discipline.
```

## Do not do yet

```text
do not build final truth promotion
do not build political-specific coverage logic
do not turn the coverage library into a dictionary
do not make class recognition equal exact meaning
do not fake meaning for unknown phrases
do not make coverage expansion a final truth authority
```
