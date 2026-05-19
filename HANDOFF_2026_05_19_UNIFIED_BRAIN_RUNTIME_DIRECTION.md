# HANDOFF 2026-05-19: Unified Brain Runtime Direction

## Why this handoff exists

The user raised a major architecture correction after `DOSSIER_PACKET_STRESS_BENCHMARK_READY` passed.

The correction is that the kernel must not become a collection of side modules around a brain.

The end target is one unified epistemic brain where modules act as receptors/operators inside `1`, not as disconnected filters beside it.

## User correction

The user clarified:

```text
The brain itself should be 1.
Its modules should be part of that 1, not operating alongside it.
The kernel should eventually understand arbitrary text, claims, words, meanings, beliefs, and typos as one unified objective language.
The structured dossier system is only a scaffold.
The real kernel should behave more like a brain with receptors that make it aware of what is happening in realtime.
```

## Correct interpretation

The current build has produced many deterministic layers:

```text
formula grammar
claim language
source/evidence/media registries
truth pressure
preledger
relation expansion
coverage expansion
deterministic ingestion
dossier compiler
preledger bridge
dossier packet stress benchmark
```

These layers are useful and tested, but the architecture is still mostly layered modules calling each other.

That is not the final form.

The final form should be a unified runtime where every layer registers into one kernel state as:

```text
receptor
operator
relation type
pressure type
guard
promotion requirement
rollback rule
meaning-admission rule
world-model update rule
```

The repo should stop treating future capability as isolated feature pages only.

## Important distinction

Raw messy language intake should not be a mere filter.

It should be a receptor layer inside the unified grammar.

Wrong framing:

```text
raw text -> external parser/filter -> kernel
```

Better framing:

```text
raw text event enters unified kernel runtime
runtime activates receptors
receptors produce candidate interpretations
candidate interpretations enter the same grammar
same grammar produces packets, relations, pressure, gaps, and possible admission records
nothing outside the brain becomes truth by itself
```

## What “learning” means in the current repo

The current repo has learned in the sense that it now contains more deterministic machinery and more registered candidate behavior.

But it has not yet learned in the stronger sense of autonomous self-expansion from arbitrary experience.

Current learning mode:

```text
human/assistant adds modules
modules encode tested deterministic behavior
browser tests verify invariants
candidate entries remain non-promoted
```

Target learning mode:

```text
kernel receives events
kernel routes them through unified receptors
kernel identifies gaps and needed subdivisions
kernel proposes candidate formula/meaning/relation additions
kernel stores admission candidates with rollback
kernel only promotes under explicit criteria
kernel improves coverage without silent mutation
```

## Answer to the user’s concern

Yes, the current architecture partially explains why growth has not been exponential.

The build so far has emphasized safe deterministic scaffolding and invariant preservation.

That was useful because it prevented false truth promotion and fake universal claims.

But the next architecture step should consolidate the system into a unified runtime, otherwise every new capability will keep needing a new connector.

## Required next architectural layer

Recommended next build:

```text
unified kernel runtime / receptor registry v0.1
```

Purpose:

```text
Turn the existing modules into registered receptors/operators inside one unified kernel runtime, so new inputs can activate one brain state rather than moving through loose feature connectors.
```

Suggested files:

```text
src/kernel-unified-runtime-receptor-registry-v0-1.js
kernel-unified-runtime-receptor-registry-v0-1-test.html
unified-runtime-receptor-registry.html
HANDOFF_2026_05_19_UNIFIED_RUNTIME_RECEPTOR_REGISTRY.md
```

## Runtime record shape

Suggested runtime event shape:

```text
{
  runtime_event_id,
  input_event_type,
  raw_input_snapshot,
  activated_receptors,
  candidate_interpretations,
  candidate_packets,
  relation_candidates,
  pressure_components,
  unresolved_items,
  admission_candidates,
  active_guards,
  rollback_available: true,
  rollback_snapshot,
  revision_trail,
  truth_status: not_adjudicated,
  promotion_status: not_promoted,
  belief_movement: none
}
```

Suggested receptor record shape:

```text
{
  receptor_id,
  receptor_family,
  consumes,
  produces,
  invariant_guards,
  refusal_rules,
  rollback_rule,
  enabled: true
}
```

## Receptor families to register first

```text
coverage_receptor
claim_receptor
source_anchor_receptor
evidence_description_receptor
media_description_receptor
quote_context_receptor
adversarial_reframe_receptor
relation_receptor
truth_pressure_receptor
preledger_receptor
dossier_packet_receptor
unknown_or_typo_candidate_receptor
meaning_admission_receptor
rollback_receptor
```

## Doctrine to preserve

```text
one unified language grammar
brain itself is 1
modules are receptors/operators inside 1
raw intake is not an external filter
structured packets are scaffold, not final intake
coverage class is not exact meaning
candidate interpretation is not truth
user confidence is not evidence
support pressure is not truth
counterpressure is not disproof
source reference is anchor, not lookup
evidence/media description is not verification
hostile reframe is pressure, not same claim
causal relation requires bridge
unknown or typo repair is candidate only
belief movement remains none until explicit promotion criteria exist
no silent mutation
rollback required
```

## How this relates to the Epistemic Octahedron

The unified runtime should remain coherent with the Epistemic Octahedron’s operational semantics:

```text
active worldview positions preserve |x| + |y| + |z| = 1
origin is pre-philosophical null, not pathology
positive epistemic stability integrates lateral dimensions
objective maturity means maximal positive integration, not mere confidence
negative stability means epistemic collapse
belief should not move just because pressure exists
```

The runtime should eventually be capable of holding beliefs only through mature promotion criteria.

The kernel’s held worldview should remain objectively mature by refusing premature certainty, preserving contradiction pressure, maintaining rollback, and distinguishing support from truth.

## Do not do next

```text
do not build raw messy intake as a loose side filter
do not build final truth promotion before runtime unification is clear
do not keep adding disconnected feature modules without receptor registration
do not make typo repair equal certainty
do not make candidate interpretation equal truth
do not move belief before promotion criteria exist
```

## Next suggested layer

Build:

```text
unified kernel runtime / receptor registry v0.1
```

Then build:

```text
raw messy language intake receptor v0.1
```

Then build:

```text
meaning admission / self-expansion loop v0.1
```

Then build:

```text
truth promotion criteria v0.1
```
