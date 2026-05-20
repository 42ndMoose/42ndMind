# HANDOFF 2026-05-19: KernelBrain v0.4 Owned Organism Pass

## Scope

This handoff records the pass that changes `src/kernel-brain-v0-4.js` from an adapter-only coordination surface into a compact owned-brain surface.

This is not another receptor registry beside the brain.

This patch makes `KernelBrainV04` own internal state directly.

## Why this exists

The user asked why the receptor registry/runtime should not simply be dropped into the brain itself so `kernel-brain-v0-4` owns everything internally.

The correct answer was:

```text
Yes, but not as another embedded connector.
KernelBrainV04 should own internal state and methods.
Old receptors should become internal tables/logic, not external registries.
Adapters should become optional reports/views, not thought sources.
```

## Changed files

```text
src/kernel-brain-v0-4.js
kernel-brain-owned-organism-v0-4-test.html
HANDOFF_2026_05_19_KERNEL_BRAIN_OWNED_ORGANISM_V0_4.md
```

## Version

```text
KernelBrainV04.VERSION = 0.4.2
```

## Main architectural change

Before:

```text
KernelBrainV04.process(input)
  -> calls external global adapters
  -> maps decisions
  -> returns one report
```

After:

```text
KernelBrainV04.createBrain()
  -> owns state
  -> owns receptors as internal tables
  -> owns ingest
  -> owns meaning nodes
  -> owns claim/evidence nodes
  -> owns relation edges
  -> owns pressure state
  -> owns admission proposals
  -> adapters are optional reports only
```

## New owned state

`KernelBrainV04.createBrain()` returns:

```text
{
  state,
  ingest(input, meta),
  proposeAdmissions(),
  tick(reason),
  snapshot(),
  process(input, options)
}
```

The owned state shape:

```text
state_type: kernel_brain_v0_4_owned_state
version
created_at
updated_at
doctrine
tick
receptors
runtimeEvents
interpretations
meaningNodes
claimNodes
evidenceNodes
relationEdges
pressureState
admissionProposals
beliefCommitments
externalReports
graph
eventIndex
stats
last_tick_summary
```

## Internal receptors

The former receptor idea is now represented as owned internal receptor rows:

```text
raw_event_receptor
coverage_receptor
claim_receptor
source_anchor_receptor
evidence_description_receptor
media_description_receptor
quote_context_receptor
adversarial_reframe_receptor
relation_receptor
truth_pressure_receptor
admission_receptor
rollback_receptor
```

Each receptor is marked:

```text
status: owned_inside_kernel_brain_v0_4
external: false
```

## Internal owned behavior

`brain.ingest(input, meta)` now creates:

```text
runtimeEvents
interpretations
meaningNodes
claimNodes
evidenceNodes
relationEdges
pressureState
admissionProposals
graph
```

from one owned state.

It detects candidate signals for:

```text
near-null / low signal
claim
belief pressure
source anchor
evidence description
media description
quote fragment
adversarial reframe
relation / causal bridge
contradiction
idiom / metaphor
typo variant
unknown meaning
```

## Adapters demoted

External adapters can still contribute optional reports:

```text
KernelSensemakingV01
KernelEpistemicGovernorV01
KernelCommandPreflightV01
KernelConsistencyV04
KernelProbabilityV04
```

But they are no longer treated as the owner of thought.

Doctrine now says:

```text
adapters_are_optional_external_reports: true
modules_are_views_not_thought_sources: true
receptors_are_internal_tables_not_external_registries: true
```

## Doctrine

```text
one_brain: true
kernel_brain_owns_internal_state: true
modules_are_views_not_thought_sources: true
adapters_are_optional_external_reports: true
receptors_are_internal_tables_not_external_registries: true
one_final_decision_surface: true
meaning_claim_relation_pressure_admission_live_inside_brain: true
meaning_must_be_earned_before_belief_movement: true
consistency_may_inform_but_not_own_truth: true
probability_is_belief_pressure_not_truth: true
gibberish_stays_near_null: true
ambiguity_requests_clarification_not_belief: true
rule_smuggling_cannot_move_belief: true
no_auto_rule_promotion: true
no_belief_movement_inside_v0_4_brain: true
no_final_truth_promotion: true
no_silent_canonical_mutation: true
belief_movement: none
```

## Test page

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-brain-owned-organism-v0-4-test.html?v=brain-2
```

Expected result:

```text
8/8 passed
```

The test verifies:

```text
KernelBrainV04 loads as owned brain v0.4.2
createBrain owns internal state and receptors without external globals
brain.ingest creates owned event, interpretations, meanings, pressure, and admissions
brain.process uses same owned state instead of adapter-only coordination
optional adapters are reports, not owners
graph exposes one owned brain root
admissions remain candidate-only with no canonical mutation
no final truth or belief movement occurs
```

## Current limitation

This still does not make the entire repo one perfect organism.

It does make `kernel-brain-v0-4.js` stop being adapter-only.

The next migration work should continue moving old standalone logic into either:

```text
KernelBrainV04 owned state/methods
EpistemicKernel.state.unifiedCore
views/tests/debuggers only
```

## Next suggested layer

Recommended next build:

```text
core/brain authority guardrail v0.1
```

Purpose:

```text
Fail if a standalone global module is treated as a truth/meaning/belief/admission authority instead of an optional report/view around the owned brain state.
```

Alternative next build:

```text
KernelBrainV04 <-> EpistemicKernel bridge v0.1
```

Purpose:

```text
Make KernelBrainV04 owned state and EpistemicKernel.state.unifiedCore interoperate cleanly without duplicating consciousness.
```

## Do not do next

```text
do not add more loose connector registries
do not treat external adapters as thought owners
do not let modules move belief
do not silently mutate canonical meanings
do not promote truth yet
do not claim the whole repo is already one organism
```
