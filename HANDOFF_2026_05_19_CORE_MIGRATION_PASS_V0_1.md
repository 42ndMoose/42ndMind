# HANDOFF 2026-05-19: Core Migration Pass v0.1

## Scope

This handoff records the first direct core migration pass.

This is not another connector layer.

This pass changes the actual live kernel patch file:

```text
src/epistemic-kernel-v0-2-patches.js
```

The live brain already loads this file after:

```text
src/epistemic-kernel-v0-2.js
```

So the new methods and state now belong to `EpistemicKernel` itself.

## Why this exists

The user correctly rejected the previous architecture as still connector-like.

The corrected principle:

```text
Modules/pages should present what the brain thinks, not decide what it should think.
The real logic must live in the EpistemicKernel object and its owned state.
```

This pass moves raw intake, interpretation, relation building, pressure application, and admission proposal into `EpistemicKernel` methods.

## Changed files

```text
src/epistemic-kernel-v0-2-patches.js
kernel-core-migration-pass-v0-1-test.html
HANDOFF_2026_05_19_CORE_MIGRATION_PASS_V0_1.md
```

## New core-owned state

`EpistemicKernel.state.unifiedCore` now uses:

```text
version: epistemic_unified_core_v0_4_migration_pass_1
runtimeEvents
interpretations
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

## New core-owned methods

Direct methods now exist on `EpistemicKernel.prototype`:

```text
ingest(rawInput, meta)
interpret(rawInput, meta)
relate(eventOrId)
applyPressure()
proposeAdmissions()
unifiedIngestRaw(text, meta)
unifiedTick(reason)
unifiedCoreSnapshot()
```

The main intended pipeline is now:

```text
kernel.ingest(rawInput)
  -> kernel.interpret(rawInput)
  -> kernel.relate(event)
  -> kernel.applyPressure()
  -> kernel.proposeAdmissions()
  -> kernel.unifiedTick('ingest')
```

## Existing kernel methods patched into the same core

These existing methods now write through the same `state.unifiedCore`:

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

## What lives inside the core now

Raw text creates core-owned runtime events:

```text
state.unifiedCore.runtimeEvents
```

Interpretations are stored inside the core:

```text
state.unifiedCore.interpretations
```

Meaning tokens become core-owned meaning nodes:

```text
state.unifiedCore.meaningNodes
```

Claims and evidence are mirrored into core-owned graph nodes:

```text
state.unifiedCore.claimNodes
state.unifiedCore.evidenceNodes
```

Relations become core-owned edges:

```text
state.unifiedCore.relationEdges
```

Pressure is recomputed from core events:

```text
state.unifiedCore.pressureState
```

Unknowns, typos, idioms, belief pressure, source/evidence/media gaps, quote/reframe gaps, causal gaps, and claim-scope gaps create core-owned admission proposals:

```text
state.unifiedCore.admissionProposals
```

## Doctrine inside the core

```text
brain_owns_unified_core: true
modules_are_views_not_thought_sources: true
one_owned_state: true
unified_tick_loop: true
raw_input_enters_core_before_ui_modules: true
meaning_claim_relation_pressure_admission_live_inside_kernel: true
candidate_interpretation_is_not_truth: true
self_expansion_is_candidate_only: true
growth_means_subdivision_not_mass_inflation: true
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

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-core-migration-pass-v0-1-test.html?v=coremig-1
```

Expected result:

```text
8/8 passed
```

The test checks the actual `EpistemicKernel` path, not standalone connector modules:

```text
new EpistemicKernel()
kernel.ingest(...)
kernel.quickIngest(...)
kernel.addClaim(...)
kernel.addEvidence(...)
kernel.importExtractionPacket(...)
kernel.snapshot()
```

It verifies:

```text
core migration patch loads on actual EpistemicKernel
new kernel owns unifiedCore and doctrine says modules are views
kernel.ingest runs interpret, relate, pressure, and admission inside unifiedCore
quickIngest uses the same core-owned path before old claim creation
addClaim/addEvidence write claim/evidence nodes and relation edges into same core
structured packet import writes through the same core
core graph and snapshot expose one owned organism state
no standalone module decides truth/belief/canonical admission in this path
```

## Live brain URL

Open:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3.html?v=coremig-1
```

After refresh, copied state/brain packet should expose:

```text
kernel_state.unifiedCore
```

## What this fixes

This is the first actual migration away from connector federation.

The earlier standalone modules remain useful as tests and scaffolds, but they are now architecturally demoted.

The intended source of thought is now:

```text
EpistemicKernel.state.unifiedCore
EpistemicKernel.ingest()
EpistemicKernel.interpret()
EpistemicKernel.relate()
EpistemicKernel.applyPressure()
EpistemicKernel.proposeAdmissions()
```

## What this does not yet finish

```text
does not migrate every old module into core
does not delete old modules
does not make final truth promotion
does not accept admission proposals into canonical meaning
does not move belief
does not make the repo a perfect organism yet
```

## Next suggested layer

Recommended next build after this passes:

```text
core migration guardrail v0.1
```

Purpose:

```text
Add a test that fails if global standalone modules are treated as truth/meaning/belief/admission authorities instead of views/tests/scaffolds around EpistemicKernel.state.unifiedCore.
```

Alternative next build:

```text
core-owned admission acceptance gate v0.1
```

Purpose:

```text
Let EpistemicKernel evaluate state.unifiedCore.admissionProposals and mark some as admitted non-canonical meanings only under explicit criteria, still without truth promotion or belief movement.
```

## Do not do next

```text
do not add another loose connector as the thinking layer
do not let external modules decide meaning before the kernel sees it
do not promote beliefs yet
do not mutate canonical meanings silently
do not claim this is already a complete unified brain
do not use standalone modules as the source of thought
```
