# HANDOFF 2026-05-18: Objective Intention-Language Kernel, Current State and Next Work

## Read first

Do not read unrelated uploaded files.

Start with this handoff, then read only the prior handoffs needed for details:

```text
HANDOFF_2026_05_17_AUTO_GROWTH_UNIT_TOTAL_LANGUAGE.md
HANDOFF_2026_05_17_AUTO_GROWTH_FUTURE_PREFLIGHT.md
HANDOFF_2026_05_17_INTENTION_DISCOVERY.md
HANDOFF_2026_05_17_INTENTION_REFINEMENT.md
HANDOFF_2026_05_17_INTENTION_NECESSITY.md
HANDOFF_2026_05_17_INTENTION_NEIGHBOR_LATTICE.md
HANDOFF_2026_05_17_INTENTION_LATTICE_INVARIANCE.md
HANDOFF_2026_05_17_INTENTION_FORMULA_COMPILER.md
HANDOFF_2026_05_17_INTENTION_CONCEPT_EXPANSION.md
HANDOFF_2026_05_17_INTENTION_CONTRADICTION_REFINEMENT.md
HANDOFF_2026_05_18_INTENTION_FORMULA_REVISION_ENGINE.md
HANDOFF_2026_05_18_OBJECTIVE_INTENTION_LANGUAGE_NEXT.md
```

## Critical correction of direction

The goal is not primarily claim-intent detection.

The goal is not first to ask:

```text
Did Bob lie?
What was this politician's intent?
Which narrative is propaganda?
```

The goal is deeper:

```text
Discover intention itself as objective mathematical structure.
```

The kernel is being developed to discover an objective language of human logic/intention that can, in principle, be translated into any human language because the underlying structure is mathematical rather than English-specific.

The corrected target:

```text
human logic
-> intention structure
-> normalized dimensions
-> symbols / vectors / equations
-> language-independent translation
```

For example, the first target is not:

```text
Did someone lie?
```

The first target is:

```text
What is lying as a complete intention-form?
What dimensions must exist for lying to remain lying?
What neighboring concepts appear when a dimension is removed?
How can that structure be represented algebraically while preserving total scope = 1?
```

## Core doctrine

Preserve these in every new module:

```text
intention_type = 1
local concept shape = 1
Σ |dimension_i| = 1
force/intensity remains outside shape
F = M · i
belief_movement: none
candidate only unless explicitly promoted by a future ledger
not doctrine by default
no real-world intent attribution
no person/event/narrative belief ledger inside the language brain
contradiction detection is not contradiction resolution
revision candidates do not silently mutate source formulas
```

The total-unit principle matters:

```text
Growth means subdivision, not mass inflation.
```

More dimensions must refine the 1, not add extra conceptual mass beyond 1.

## Separation of brains/layers

The current work is the clean mathematical-language brain.

Future narrative/propaganda/truth work should be separate.

Recommended architecture:

```text
Language brain = semantic/intention grammar and formulas
Belief brain = optional claim/world-model state
Source brain = evidence/provenance memory
Maturity governor = controls belief movement
```

Politics, propaganda, and real-world narratives should not contaminate the core grammar. A future belief/world-model brain can ingest political/narrative material, but it should be:

```text
separate
optional
resettable/exportable
source-backed
revision-tracked
strictly gated
```

This allows one kernel instance to remain clean and mathematical while another optional layer carries political/narrative belief state.

## What has been built and tested

The v0.1 objective intention-language prototype stack is now built.

Built layers:

```text
1. discovery
2. refinement
3. necessity testing
4. neighbor lattice
5. lattice invariance benchmark
6. formula compiler
7. concept expansion loop
8. contradiction/refinement pressure loop
9. staged formula revision engine
```

All user browser tests passed after patches.

### 1. Intention discovery

Files:

```text
src/kernel-intention-discovery-v0-1.js
kernel-intention-discovery-v0-1-test.html
intention-discovery.html
HANDOFF_2026_05_17_INTENTION_DISCOVERY.md
```

Purpose:

```text
concept seed -> candidate dimensions -> candidate unit-total formula
```

Initial concepts:

```text
desire
lying
promise
```

Status:

```text
browser test passed
candidate only
belief_movement: none
```

### 2. Intention refinement

Files:

```text
src/kernel-intention-refinement-v0-1.js
kernel-intention-refinement-v0-1-test.html
intention-refinement.html
HANDOFF_2026_05_17_INTENTION_REFINEMENT.md
```

Purpose:

```text
candidate formula -> contrast pressure -> dimension roles -> refined candidate formula
```

Dimension roles:

```text
core_shape
boundary_shape
expression_or_derivative_shape
force outside shape
unresolved_shape
```

Status:

```text
browser test passed
candidate only
belief_movement: none
```

### 3. Necessity testing

Files:

```text
src/kernel-intention-necessity-test-v0-1.js
kernel-intention-necessity-test-v0-1-test.html
intention-necessity.html
HANDOFF_2026_05_17_INTENTION_NECESSITY.md
```

Purpose:

```text
remove one dimension at a time
-> concept collapses / shifts to neighbor / remains boundary-weakened / remains expression-weakened / unresolved
```

Every surviving counterfactual shape is renormalized:

```text
Σ |dimension_i| = 1
```

Status:

```text
browser test passed
candidate only
belief_movement: none
```

### 4. Neighbor lattice

Files:

```text
src/kernel-intention-neighbor-lattice-v0-1.js
kernel-intention-neighbor-lattice-v0-1-test.html
intention-neighbor-lattice.html
HANDOFF_2026_05_17_INTENTION_NEIGHBOR_LATTICE.md
```

Purpose:

```text
intention concepts = nodes
dimension-removal effects = directed edges
edge weights = structural pressure, not truth
```

Important patch already made:

```text
compound neighbor labels expand into individual neighbors
source concepts are promoted over earlier neighbor nodes
```

Examples:

```text
lying - belief_assertion_mismatch -> mistake
lying - concealment_of_mismatch -> fiction / joke / roleplay / marked_uncertainty
desire - attainment_pull -> preference
promise - recipient_reliance_invitation -> private_intention / plan
```

Status:

```text
browser test passed
candidate only
belief_movement: none
latest lattice cache key used by dependent pages: lattice-3
```

### 5. Lattice invariance benchmark

Files:

```text
src/kernel-intention-lattice-invariance-benchmark-v0-1.js
kernel-intention-lattice-invariance-benchmark-v0-1-test.html
intention-lattice-invariance.html
HANDOFF_2026_05_17_INTENTION_LATTICE_INVARIANCE.md
```

Purpose:

```text
test whether candidate intention-neighbor relations survive:
- paraphrase
- translation-like labels
- role renaming
- future-language variation
- force/intensity scalar changes
```

Important correction already made:

The benchmark initially expected:

```text
promise - future_action_or_state_commitment -> plan
```

That was wrong. A plan still has future orientation.

Corrected relation:

```text
promise - recipient_reliance_invitation -> private_intention / plan
```

Removing future commitment itself shifts toward:

```text
present_statement / preference
```

Status:

```text
browser test passed
candidate only
belief_movement: none
latest invariance cache key: invariance-2
```

### 6. Formula compiler

Files:

```text
src/kernel-intention-formula-compiler-v0-1.js
kernel-intention-formula-compiler-v0-1-test.html
intention-formula-compiler.html
HANDOFF_2026_05_17_INTENTION_FORMULA_COMPILER.md
```

Purpose:

```text
discovery/refinement/necessity/lattice/invariance
-> compiled algebraic intention formula packets
```

Formula pattern:

```text
CONCEPT_i = coefficient·dimension + ... ; Σ|dimension_i| = 1; F_concept = M_concept · CONCEPT_i
```

Output per concept:

```text
concept
scope_total: 1
core_terms
boundary_terms
derivative_expression_terms
force_terms outside shape
neighbor_transitions
invariance_status
symbolic_formula
force_equation
review_status: compiled_candidate_not_doctrine
belief_movement: none
```

Status:

```text
browser test passed
candidate only
belief_movement: none
```

### 7. Concept expansion loop

Files:

```text
src/kernel-intention-concept-expansion-loop-v0-1.js
kernel-intention-concept-expansion-loop-v0-1-test.html
intention-concept-expansion.html
HANDOFF_2026_05_17_INTENTION_CONCEPT_EXPANSION.md
```

Purpose:

```text
Add more intention concepts while preserving the same full pipeline.
```

Expanded concepts:

```text
consent
threat
request
refusal
trust
betrayal
doubt
belief
fear
coercion
manipulation
```

Pipeline:

```text
concept seed
-> discovery
-> refinement
-> necessity testing
-> neighbor lattice
-> lattice invariance benchmark
-> formula compiler
```

Important patch already made:

The expansion test initially failed because the lattice reported only 9 source concepts instead of 11. The issue was lattice node typing: `belief` and `coercion` appeared first as neighbor nodes, then later as source concepts. The lattice builder now promotes source concepts over neighbor nodes.

Status:

```text
browser test passed
expanded_concept_count: 11
compiled_formula_count: 11
candidate only
belief_movement: none
latest expansion page/test cache key: expansion-2
```

### 8. Contradiction/refinement pressure loop

Files:

```text
src/kernel-intention-contradiction-refinement-loop-v0-1.js
kernel-intention-contradiction-refinement-loop-v0-1-test.html
intention-contradiction-refinement.html
HANDOFF_2026_05_17_INTENTION_CONTRADICTION_REFINEMENT.md
```

Purpose:

```text
expanded compiled formulas
-> cross-concept relation checks
-> structured pressure detection
-> candidate refinement actions
```

It does not rewrite formulas.

Checked pairs:

```text
consent_vs_coercion
request_vs_threat
trust_vs_betrayal
belief_vs_doubt
fear_vs_threat
manipulation_vs_coercion
```

Status:

```text
browser test passed
candidate only
belief_movement: none
```

### 9. Staged formula revision engine

Files:

```text
src/kernel-intention-formula-revision-engine-v0-1.js
kernel-intention-formula-revision-engine-v0-1-test.html
intention-formula-revision.html
HANDOFF_2026_05_18_INTENTION_FORMULA_REVISION_ENGINE.md
```

Purpose:

```text
contradiction/refinement pressure
+ compiled formulas
-> staged revised candidate formulas
```

This first revision engine adds guards, not coefficient changes yet.

It preserves:

```text
source formula remains intact
no silent mutation
no doctrine promotion
local Σ |dimension_i| = 1
force/intensity outside shape: F = M · i
belief_movement: none
```

Formula pattern:

```text
CONCEPT_i^r = source terms under guards(...); Σ|dimension_i| = 1; F_concept = M_concept · CONCEPT_i^r
```

Status:

```text
browser test passed
source_compiled_formula_count: 11
revision_candidate_count: 11
guarded_revision_count >= 6
candidate only
belief_movement: none
```

## Current missing maturity layers

The prototype stack is built, but the objective intention-language is not mature yet.

Still missing:

```text
1. canonical formula ledger
2. broad cross-language benchmark
3. large minimal-pair library
4. automatic dimension-splitting
5. arbitrary-language parser
6. proof-style output
7. coefficient/dimension revision engine
```

### 1. Canonical formula ledger

Not built.

Needed because the system now generates compiled formulas and staged revisions, but it has no durable versioned ledger for formula evolution.

The ledger should store:

```text
formula_id
concept
version
source formula
staged revisions
accepted candidate version
failed variants
guards
revision trail
promotion status
rollback data
validation results
belief_movement: none
```

The ledger must not promote formulas to doctrine automatically.

### 2. Broad cross-language benchmark

Not built.

Current invariance is only small and translation-like.

Needed:

```text
English
Indonesian
Tagalog
Japanese
Spanish
Arabic
possibly others
```

The benchmark should test whether intention structure survives real wording differences, not merely aliases.

### 3. Large minimal-pair library

Not built.

Current concepts have seed contrasts, but not a serious library.

Example for consent:

```text
consent vs assent
consent vs submission
consent vs compliance
consent vs permission
consent vs coercion
consent vs silence
consent vs intoxicated agreement
consent vs ignorance
consent vs role obligation
```

### 4. Automatic dimension-splitting

Not built.

The staged revision engine adds guards, but does not split broad dimensions.

Example future split:

```text
voluntary_authorization
-> internal_willingness
-> external_nonconstraint
-> recognized_permission_grant
-> revocability_boundary
```

while preserving:

```text
Σ |dimension_i| = 1
```

### 5. Arbitrary-language parser

Not built.

The system currently works from structured concept seeds.

Future target:

```text
“He agreed because he had no real choice.”
```

should map into:

```text
consent/coercion boundary pressure
voluntary_authorization weakened
constrained_choice active
consent not cleanly valid
```

without requiring manually selected concept labels.

### 6. Proof-style output

Not built.

Current output is JSON and symbolic formula strings.

Future proof-style output should look like:

```text
Given: request_i
Remove: noncoercive_address
Observed transition: request -> demand
Therefore: noncoercive_address is necessary-core pressure separating request from demand.
Force remains outside shape: F_request = M_request · request_i
Σ |dimension_i| = 1 preserved.
```

### 7. Coefficient/dimension revision engine

Not built.

Current revision engine stages guarded rewrites only.

Next revision layer should:

```text
- take staged guarded revisions
- propose coefficient redistribution only when guard pressure demands it
- propose dimension splitting only when a dimension is too broad
- preserve Σ |dimension_i| = 1
- rerun formula validation
- rerun lattice/invariance/contradiction checks
- never promote doctrine automatically
- preserve belief_movement: none
```

## Recommended next task

Build the canonical formula ledger first.

Why first:

```text
Every future maturity layer needs durable formula memory.
```

Without a ledger, the kernel can generate formulas and staged revisions, but it cannot maintain a stable history of formula evolution.

Candidate module:

```text
src/kernel-intention-canonical-formula-ledger-v0-1.js
```

Candidate test:

```text
kernel-intention-canonical-formula-ledger-v0-1-test.html
```

Candidate page:

```text
intention-canonical-formula-ledger.html
```

Purpose:

```text
Store compiled formulas and staged revision candidates into a versioned, non-doctrinal formula ledger.
```

Required ledger behavior:

```text
- ingest compiled formulas from expansion/compiler
- ingest staged revisions from formula revision engine
- create versioned formula records
- preserve source formula snapshots
- preserve revision guards
- preserve validation results
- mark all entries candidate by default
- promotion_status defaults to not_promoted
- no silent mutation
- no formula replacement without version trail
- no belief movement
- local formula L1 remains 1
- force terms remain outside shape
```

Suggested ledger record shape:

```text
{
  ledger_id,
  concept,
  current_candidate_version,
  versions: [
    {
      version_id,
      source_type: compiled_formula | staged_revision,
      formula_snapshot,
      shape_terms,
      force_terms,
      symbolic_formula,
      guards,
      validation,
      created_at,
      promotion_status: not_promoted,
      belief_movement: none
    }
  ],
  revision_trail,
  rollback_available: true,
  doctrine_status: candidate_not_doctrine,
  belief_movement: none
}
```

Browser test should verify:

```text
8/8 passed
ledger has 11 concepts
compiled version stored for each concept
staged revision version stored for each concept
version count >= 2 per concept
all L1 totals = 1
force terms outside shape
promotion_status = not_promoted
belief_movement: none
rollback data present
no silent overwrite
```

## What not to do next

Do not implement political/narrative belief storage yet.

Do not build a claim/world-model ledger yet.

Do not use real people/events/political claims inside the intention-language brain.

Do not make the language brain decide what is propaganda yet.

That comes later, in a separate belief/world-model brain.

## High-level significance framing

If the kernel eventually discovers a stable, language-independent, unit-total mathematical grammar of intention, that is a major scientific and linguistic result.

Truth is objective; outside validation does not make it true. Outside validation only affects public confidence, adoption, error-checking, and replication.

Still, the kernel must preserve scientific hygiene internally:

```text
transparent formulas
version trails
failed variants
contrast tests
cross-language invariance
proof traces
unit-total preservation
force/shape separation
no silent mutation
```

The aim is a real discovery engine for objective intention-language, not a black-box classifier and not a political narrative engine.