# HANDOFF 2026-05-19: Kernel-Owned Unified Core v0.4 First Pass

## Scope

This handoff records the first real core-unification patch.

This is not another side module.

This patch modifies the actual live-brain kernel path:

```text
src/epistemic-kernel-v0-2-patches.js
```

The live console already loads:

```text
src/epistemic-kernel-v0-2.js
src/epistemic-kernel-v0-2-patches.js
```

So the patch attaches the unified core directly to `EpistemicKernel` itself.

## Why this exists

The user correctly rejected the previous direction as too connector-like.

The correction:

```text
Modules should not decide what the brain thinks.
Modules/pages should present what the brain thinks.
The actual logic must live in the kernel's owned state and methods.
```

This layer moves from:

```text
global module federation / connector stack
```

toward:

```text
EpistemicKernel owns unifiedCore
EpistemicKernel methods write into unifiedCore
EpistemicKernel snapshot exposes unifiedCore
UI/modules inspect unifiedCore only as views
```

## Changed files

```text
src/epistemic-kernel-v0-2-patches.js
kernel-owned-unified-core-v0-4-test.html
HANDOFF_2026_05_19_KERNEL_OWNED_UNIFIED_CORE.md
```

## Core patch

The patch adds kernel-owned state:

```text
state.unifiedCore
```

with fields:

```text
version
created_at
updated_at
doctrine
tick
runtimeEvents
meaningNodes
claimNodes
evidenceNodes
relationEdges
pressureState
admissionProposals
beliefCommitments
audit
graph
eventIndex
stats
last_tick_summary
```

## Kernel-owned methods added

The patch adds methods directly to `EpistemicKernel.prototype`:

```text
unifiedIngestRaw(text, meta)
unifiedTick(reason)
unifiedCoreSnapshot()
```

It also patches existing methods so they write into `state.unifiedCore`:

```text
createEmptyState
migrateState
quickIngest
addObservation
addClaim
addEvidence
addPrinciple
importExtractionPacket
recalculate
snapshot
selfAudit
```

## Actual core behavior

`quickIngest()` now writes raw text into the core before side displays matter:

```text
kernel.quickIngest(text)
-> kernel.unifiedIngestRaw(text)
-> state.unifiedCore.runtimeEvents
-> state.unifiedCore.meaningNodes
-> state.unifiedCore.pressureState
-> state.unifiedCore.tick
```

`addClaim()` now writes kernel-owned claim nodes:

```text
claim added
-> state.claims
-> state.unifiedCore.claimNodes
-> state.unifiedCore.meaningNodes
-> state.unifiedCore.graph
```

`addEvidence()` now writes kernel-owned evidence nodes and relation edges:

```text
evidence added
-> state.evidence
-> state.unifiedCore.evidenceNodes
-> state.unifiedCore.relationEdges
```

`importExtractionPacket()` now writes structured imports through the same core:

```text
structured packet import
-> normal kernel import
-> state.unifiedCore.runtimeEvents
-> state.unifiedCore.claimNodes/evidenceNodes/relationEdges
```

Unknowns and typos now become core-owned admission proposals:

```text
unknown/typo meaning node
-> state.unifiedCore.admissionProposals
```

## Doctrine inside the core

```text
brain_owns_unified_core: true
modules_are_views_not_thought_sources: true
one_owned_state: true
unified_tick_loop: true
raw_input_enters_core_before_ui_modules: true
candidate_interpretation_is_not_truth: true
self_expansion_is_candidate_only: true
no_silent_canonical_mutation: true
no_final_truth_promotion: true
belief_movement_requires_explicit_future_promotion: true
epistemic_octahedron_maturity_guard_active: true
objective_maturity_refuses_premature_certainty: true
support_pressure_is_not_truth: true
counterpressure_is_not_disproof: true
source_reference_is_anchor_not_lookup: true
evidence_media_description_is_not_verification: true
hostile_reframe_is_pressure_not_same_claim: true
causal_relation_requires_bridge: true
rollback_required: true
belief_movement: none
```

## Test page

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-owned-unified-core-v0-4-test.html?v=core-1
```

Expected result:

```text
8/8 passed
```

The test does not test side modules. It tests the real `EpistemicKernel` path:

```text
new EpistemicKernel()
kernel.quickIngest(...)
kernel.addEvidence(...)
kernel.importExtractionPacket(...)
kernel.snapshot()
```

It verifies:

```text
state.unifiedCore exists at construction
quickIngest writes raw events and claim nodes into unifiedCore
addEvidence writes evidence nodes and relation edges into unifiedCore
unknown/typo input creates core-owned admission proposals
structured packet import writes through the same core
snapshot exposes unifiedCore as owned kernel state
belief commitments remain empty before promotion criteria
no final truth, no belief movement, no silent canonical mutation
```

## Live console

The live brain already loads the patched file:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3.html?v=core-1
```

After refresh, `Raw state` and copied brain packet should include:

```text
kernel_state.unifiedCore
```

## What this fixes

This is the first pass that makes the unified logic part of the real brain object rather than another separate global module.

It directly answers the user's critique:

```text
The previous registry/receptor layers were still connector-like.
The new patch makes EpistemicKernel itself own the unified state and core tick loop.
```

## What this does not yet do

```text
does not fully rewrite all old modules into core methods
does not remove old global modules
does not promote beliefs
does not accept admission proposals into canonical formulas
does not make the kernel rewrite itself freely
does not yet make final truth adjudication
```

## Next suggested layer

After this passes, the next best step is not another connector.

Recommended next build:

```text
core-owned admission acceptance gate v0.1
```

Purpose:

```text
Let EpistemicKernel evaluate its own state.unifiedCore.admissionProposals and mark some as admitted non-canonical meanings only under explicit criteria, still without truth promotion or belief movement.
```

Alternative next build:

```text
core-owned raw intake improvement v0.1
```

Purpose:

```text
Move more of the raw messy intake heuristics into EpistemicKernel methods, reducing dependence on standalone intake modules.
```

## Do not do next

```text
do not add another standalone connector benchmark
do not let external modules decide meaning before the kernel sees it
do not promote beliefs yet
do not mutate canonical meanings silently
do not claim this is already a complete unified brain
```
