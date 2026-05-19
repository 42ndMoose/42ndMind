# 42ndMind Kernel Architecture — 2026-05-18

## Purpose

This is the compact architecture map for the current objective language-math kernel.

Read this before touching the repo when continuing objective-language work.

The current kernel is a working deterministic language-math brain for the covered grammar.

It is not a political/narrative-specific system.

It is not LLM-dependent for structured packets.

It is not a source lookup engine yet.

It is not a final truth authority.

## Core doctrine

```text
unified language grammar
claims/world-models/narratives/propaganda are inside the same objective language grammar
external anchors are modular registries, not separate language
candidate only unless a future ledger explicitly promotes
belief_movement: none
contradiction detection is not contradiction resolution
contradiction relation is not contradiction resolution
relation strength is not truth
relation direction must be explicit
relation direction must be preserved unless changed by explicit revision
direction reversal requires explicit revision, not silent mutation
support relation is not truth
counter relation is not automatic disproof
corroboration relation is not final truth
temporal sequence is not causal proof
causal relation requires bridge
source relation is not source lookup
source laundering is not independent convergence
duplicate provenance is not independent convergence
media relation is not media verification
adversarial relation is pressure, not truth
unresolved gap deletion is silent mutation
motive relation is not motive proof
quote relation requires context
narrative pressure is not proof of hidden motive
specific narrative-overclaim status outranks broad propaganda-threshold classification
bad-actor reframe is pressure, not truth
hostile reframe is not the same claim
quantifier injection is not the same claim
condition deletion is not the same claim
no-good-interpretation framing is structural distortion pressure
motive stuffing is not motive proof
ambiguity weaponization does not close ambiguity
user confidence is not evidence
user-supplied context is context, not automatic truth
user-described real-world material enters as context packet, not truth
source reference is anchor, not lookup
media description is context, not media verification
evidence claim is separate from evidence verification
uncertainty notes and ingestion warnings stay visible
truth-ledger preledger is not final truth authority
candidate preledger entries are not final truth
preledger stress benchmark is not final truth authority
world-model relation expansion is not final truth authority
world-model relation stress benchmark is not final truth authority
rollback and revision trail are required for preledger, stress, relation, and relation-stress entries
evidence descriptions are context, not automatic truth
support/counterevidence direction is separate from truth
support is not truth
counterevidence is not automatic disproof
corroboration pressure is not final truth
truth-pressure synthesis is not final truth promotion
force/intensity remains outside shape
active local shape preserves Σ |dimension_i| = 1
F = M · i
no silent mutation
rollback/version trail required for formula changes
new meanings enter through admission records, not silent canonical mutation
admitted meanings do not fake proof references
```

## Current stack map

### 1. Objective intention-language formula stack

```text
src/kernel-intention-discovery-v0-1.js
src/kernel-intention-refinement-v0-1.js
src/kernel-intention-necessity-test-v0-1.js
src/kernel-intention-neighbor-lattice-v0-1.js?v=lattice-3
src/kernel-intention-lattice-invariance-benchmark-v0-1.js?v=invariance-2
src/kernel-intention-formula-compiler-v0-1.js?v=formula-1
src/kernel-intention-concept-expansion-loop-v0-1.js?v=expansion-2
src/kernel-intention-contradiction-refinement-loop-v0-1.js?v=contradiction-1
src/kernel-intention-formula-revision-engine-v0-1.js?v=revision-1
src/kernel-intention-canonical-formula-ledger-v0-1.js?v=ledger-1
src/kernel-intention-proof-output-v0-1.js?v=proof-1
src/kernel-intention-minimal-pair-library-v0-1.js?v=minpair-1
src/kernel-intention-dimension-splitting-v0-1.js?v=split-2
src/kernel-intention-coefficient-dimension-revision-engine-v0-1.js?v=codim-1
src/kernel-intention-canonical-formula-ledger-v0-1-1-patch.js?v=ledger-2
```

Status:

```text
canonical formula ledger ready
proof output ready
dimension splitting ready
coefficient/dimension revision ready
```

### 2. Parser / language-to-formula stack

```text
src/kernel-intention-arbitrary-language-parser-v0-1.js?v=parser-1
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js?v=parser-3
src/kernel-intention-parser-proof-trace-v0-1.js?v=ptrace-1
src/kernel-intention-parser-proof-trace-v0-1-1-patch.js?v=ptrace-2
```

Status:

```text
expanded language-to-formula benchmark ready
weak dimension-only noise holdout ready
expanded parser proof trace ready
```

### 3. Formula inspection, concept admission, and octahedron alignment

```text
src/kernel-intention-formula-inspector-v0-1.js?v=inspect-1
src/kernel-concept-admission-registry-v0-1.js?v=admit-1
src/kernel-intention-formula-inspector-v0-1-1-patch.js?v=inspect-2
src/epistemic-octahedron-language-alignment-v0-1.js?v=eoalign-1
```

Status:

```text
formula inspector ready
concept admission / formula registration ready
unified formula inspector ready
octahedron language alignment ready
```

Main formula inspection URL:

```text
https://42ndmoose.github.io/42ndMind/intention-formula-inspector-v0-1-1.html?v=inspect-2
```

Expected formula counts:

```text
canonical formulas: 11
admitted candidate formulas: 6
total formula records: 17
```

### 4. Objective claim-language stack

```text
src/kernel-objective-claim-language-v0-1.js?v=claim-1
src/kernel-objective-claim-language-v0-1-1-patch.js?v=claim-2
src/kernel-objective-claim-trace-v0-1.js?v=ctrace-1
```

Status:

```text
objective claim-language ready v0.1.1
objective claim trace ready v0.1
```

Important correction:

```text
because + ordinary event sequence -> causal_claim
because + hidden motive language -> motive_attribution_claim
```

### 5. External-world anchoring, truth-pressure, benchmark, ingestion, preledger, stress, relation, and relation-stress stack

```text
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
```

Status:

```text
external anchor packet schema ready
source/provenance registry ready
evidence/media registry ready
truth-pressure synthesis ready v0.1.1
claim/narrative benchmark ready v0.1
adversarial narrative-pressure suite ready v0.1
real-world packet ingestion discipline ready v0.1
truth-ledger preledger ready v0.1
truth-ledger preledger stress benchmark ready v0.1, user-confirmed pass
world-model relation expansion ready v0.1, user-confirmed pass
world-model relation stress benchmark v0.1 built for verification
```

Important URLs:

```text
https://42ndmoose.github.io/42ndMind/kernel-external-anchor-packet-schema-v0-1-test.html?v=anchor-1
https://42ndmoose.github.io/42ndMind/kernel-source-provenance-registry-v0-1-test.html?v=prov-1
https://42ndmoose.github.io/42ndMind/kernel-evidence-media-registry-v0-1-test.html?v=evidence-1
https://42ndmoose.github.io/42ndMind/kernel-truth-pressure-synthesis-v0-1-1-test.html?v=truth-2
https://42ndmoose.github.io/42ndMind/kernel-claim-narrative-benchmark-v0-1-test.html?v=bench-1
https://42ndmoose.github.io/42ndMind/kernel-adversarial-narrative-pressure-v0-1-test.html?v=adv-1
https://42ndmoose.github.io/42ndMind/kernel-real-world-packet-ingestion-discipline-v0-1-test.html?v=ingest-1
https://42ndmoose.github.io/42ndMind/kernel-truth-ledger-preledger-v0-1-test.html?v=preledger-1
https://42ndmoose.github.io/42ndMind/kernel-truth-ledger-preledger-stress-benchmark-v0-1-test.html?v=prestress-1
https://42ndmoose.github.io/42ndMind/kernel-world-model-relation-expansion-v0-1-test.html?v=wmrel-1
https://42ndmoose.github.io/42ndMind/kernel-world-model-relation-stress-benchmark-v0-1-test.html?v=wmrelstress-1
```

Important UI notes:

```text
source records: 4
source groups: 3
evidence records: 5
evidence groups: 3
evidence claim summaries: 4
truth-pressure synthesis records: 8
truth-pressure synthesis version: 0.1.1
claim/narrative benchmark records: 12
claim/narrative benchmark case families: 12
adversarial attack records: 12
adversarial attack families: 12
real-world ingestion records: 8
real-world material types: 8
truth preledger entries: 8
truth preledger final authority: false
preledger stress records: 16
preledger stress families: 16
preledger stress final authority: false
world-model relation records: 37
world-model relation families: 24
world-model relation groups: 9
world-model relation final authority: false
world-model relation stress records: 16
world-model relation stress families: 16
world-model relation stress final authority: false
```

Source groups = 3 is correct because two source records share `user_context_group`.

Evidence claim summaries = 4 is correct because two evidence records support `claim_cost_change`.

The v0.1.1 truth-pressure patch fixes the earlier 4/8 failure by preserving `narrative_overclaim_pressure_visible_candidate` before applying the broader propaganda-pressure threshold.

The claim/narrative benchmark adds neutral synthetic bad-actor distortion tests:

```text
quantifier/scope distortion
condition deletion
no-good-interpretation framing
modal strength inflation
```

The adversarial narrative-pressure suite expands this into twelve hostile-reframe classes:

```text
quantifier_injection
condition_deletion
no_good_interpretation
motive_stuffing
context_stripping
quote_clipping
burden_inversion
equivalence_smuggling
certainty_inflation
source_laundering
ambiguity_weaponization
loaded_label_substitution
```

The real-world packet ingestion discipline adds eight neutral material types:

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

The truth-ledger preledger adds candidate preledger entries with:

```text
ingestion snapshots
truth-pressure links
unresolved items
uncertainty summaries
separation guards
rollback snapshots
revision trails
not_adjudicated truth status
candidate_preledger_not_truth ledger status
```

The preledger stress benchmark adds sixteen synthetic pressure families:

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

The world-model relation expansion adds relation groups:

```text
causal
temporal
evidential
contradiction
source
media
narrative
adversarial
uncertainty
```

and relation families:

```text
causes_or_contributes_to
temporally_precedes
temporally_follows
supports
counters
contradicts
depends_on
requires_evidence_for
source_reports
source_duplicates
source_independent_of
media_describes
media_unverified_for
contextualizes
narrows_scope
broadens_scope
injects_quantifier
removes_condition
clips_quote
strips_context
stuffs_motive
launders_source
weaponizes_ambiguity
leaves_unresolved
```

The world-model relation stress benchmark adds sixteen relation-specific failure families:

```text
direction_reversal
false_causal_promotion
temporal_causal_smuggling
support_to_truth_inflation
counter_to_disproof_inflation
corroboration_truth_promotion
source_laundering
duplicate_independence_smuggling
hostile_reframe_equivalence
media_verification_collapse
unresolved_gap_deletion
contradiction_resolution_collapse
motive_relation_proof_inflation
quote_context_relation_collapse
relation_strength_belief_movement
mixed_relation_pressure_collapse
```

## Current maturity status

```text
CORE_LANGUAGE_MATH_KERNEL_MATURE_CANDIDATE_THRESHOLD_PASSED
FORMULA_ADMISSION_PATH_READY
UNIFIED_FORMULA_INSPECTOR_READY
EXTERNAL_WORLD_EVIDENCE_STACK_READY
TRUTH_PRESSURE_SYNTHESIS_READY_V0_1_1
CLAIM_NARRATIVE_BENCHMARK_READY
ADVERSARIAL_NARRATIVE_PRESSURE_READY
REAL_WORLD_PACKET_INGESTION_DISCIPLINE_READY
TRUTH_LEDGER_PRELEDGER_READY
TRUTH_LEDGER_PRELEDGER_STRESS_READY
WORLD_MODEL_RELATION_EXPANSION_READY
WORLD_MODEL_RELATION_STRESS_BUILT_FOR_VERIFICATION
ROADMAP_V0_1_COMPLETE_THROUGH_CANDIDATE_PRELEDGER
PRELEDGER_HARDENING_PASS_CONFIRMED
RELATION_LAYER_FIRST_PASS_CONFIRMED
RELATION_STRESS_FIRST_PASS_BUILT
```

This means:

```text
working deterministic language-math brain for covered grammar
formula memory exists
formula inspection exists
newly learned meanings can be admitted as candidate formulas
unified formula inspection exists
proof traces exist
claim-language analysis exists
claim traces exist
external anchors exist
source/provenance tracking exists
evidence/media tracking exists
truth-pressure synthesis v0.1.1 exists
claim/narrative benchmark v0.1 exists
adversarial narrative-pressure suite v0.1 exists
real-world packet ingestion discipline v0.1 exists
truth-ledger preledger v0.1 exists
preledger stress benchmark v0.1 exists and passed
world-model relation expansion v0.1 exists and passed
world-model relation stress benchmark v0.1 exists for verification
bad-actor distortion pressure is represented structurally
hostile reframes are explicitly not the same claim
user-described real-world material enters as context packet, not truth
candidate truth preledger entries are not final truth
stress pressure does not promote truth
relations do not promote truth
relation stress does not promote truth
no LLM dependency for structured packets
no source lookup dependency for structured packets
```

This does not mean:

```text
every word in every language has coverage
every source type has full anchor schema coverage
every real-world event can be adjudicated automatically
external truth is finalized without evidence anchors
admitted meanings are canonical doctrine
truth-pressure synthesis is final truth promotion
real-world ingestion is final truth promotion
preledger is final truth authority
stress benchmark is final truth authority
world-model relation expansion is final truth authority
world-model relation stress benchmark is final truth authority
relation strength is proof
```

## Current architecture interpretation

The Epistemic Octahedron supplied invariant geometry and maturity semantics.

The objective language-math kernel operationalized those semantics into deterministic machinery.

The alignment layer confirmed that the Epistemic Octahedron's operational core is mathematically coherent inside the built kernel.

The claim-language layer extended the same objective grammar into claim/world-model/narrative/propaganda-pressure analysis without LLM use or source lookup.

The concept admission registry gives the kernel a deterministic route for newly learned meanings to become candidate formulas.

The unified formula inspector exposes both canonical formulas and admitted candidate formulas in one place.

The external-world stack now has anchor packets, source/provenance, evidence/media structure, truth-pressure synthesis v0.1.1, a larger claim/narrative benchmark, an adversarial narrative-pressure suite, real-world packet ingestion discipline, truth-ledger preledger, preledger stress benchmark, world-model relation expansion, and world-model relation stress benchmark.

The benchmark distinguishes an original scoped claim from a bad-actor reframe that injects universals, removes conditions, or pretends no good-faith interpretation exists.

The adversarial suite expands the hostile-reframe model into twelve synthetic pressure families.

The ingestion layer defines how user-described videos, screenshots, quotes, articles, social threads, documents, direct observations, and hostile reframe reports enter the kernel without becoming automatic truth.

The preledger collects ingestion snapshots and truth-pressure links into candidate entries without making them final truth.

The stress benchmark hardens the preledger against conflict, duplicate provenance, adversarial reframe, context stripping, media uncertainty, user confidence, anonymous claims, causal gaps, motive stuffing, counterevidence, corroboration, ambiguity weaponization, and mixed pressure stacks.

The relation expansion begins world-model structure by creating candidate relation records across causal, temporal, evidential, contradiction, source, media, narrative, adversarial, and uncertainty relation groups without truth promotion.

The relation stress benchmark hardens the relation layer against direction reversal, false causal promotion, temporal-causal smuggling, support-to-truth inflation, counter-to-disproof inflation, source laundering, hostile reframe equivalence, media verification collapse, unresolved-gap deletion, contradiction-resolution collapse, motive proof inflation, quote context collapse, relation-strength belief movement, and mixed pressure collapse.

## Roadmap status

The five-step roadmap is complete through candidate preledger, the first hardening benchmark has passed, relation expansion has passed, and relation stress is built for verification:

```text
1. truth-pressure synthesis v0.1.1: complete
2. larger claim/narrative benchmark v0.1: complete
3. adversarial narrative-pressure cases v0.1: complete
4. real-world packet ingestion discipline v0.1: complete
5. truth-ledger preledger v0.1: complete
6. preledger stress benchmark v0.1: user-confirmed pass
7. world-model relation expansion v0.1: user-confirmed pass
8. world-model relation stress benchmark v0.1: built for verification
```

## What remains

The core roadmap is complete through candidate preledger, and relation expansion/stress has begun.

The language is still not guaranteed complete in universal coverage.

Remaining optional expansion work:

```text
coverage expansion library
larger multilingual benchmark
deterministic packet ingestion form/UI
coverage stress tests
final truth ledger / adjudication discipline only after more stress passes
```

## Next build

Run the world-model relation stress benchmark browser test.

After it passes, treat `WORLD_MODEL_RELATION_STRESS_READY` as confirmed.

Recommended next build after that:

```text
coverage expansion library v0.1
```

Alternative next build:

```text
deterministic packet ingestion form/UI v0.1
```

## File growth rule

New files are acceptable only if they add one clear layer.

Each new layer should include exactly these four files unless there is a good reason not to:

```text
src/<module>.js
<module>-test.html
<module-ui>.html
HANDOFF_<date>_<MODULE>.md
```

Every layer must state:

```text
what it consumes
what it produces
what it refuses to do
cache keys
browser test URL
UI URL
next suggested layer
```

## Naming rule

Patch files should only be used for small corrections:

```text
src/<module>-v0-1-1-patch.js
```

Do not create patch files for unrelated new features.

## SHA write trick

For existing files:

```text
1. Fetch file first.
2. Use current blob SHA.
3. update_file with full replacement content and that SHA.
4. Wait for commit_sha.
5. Fetch file back and verify exact change.
6. Make one small change at a time.
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
do not make the preledger, stress benchmark, relation expansion, or relation stress benchmark a final truth authority
do not read unrelated uploaded files
```
