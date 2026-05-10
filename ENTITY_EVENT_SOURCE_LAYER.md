# Entity/Event/Source Layer Note

Date: 2026-05-10

This note records a conceptual extension discussed after the source-registry readiness work.

## Purpose

The kernel should eventually be able to reach dossier-level conclusions with named actors, organizations, dates, documents, policies, events, and mechanisms. It should not simply mirror a dossier or user conclusion. The target is disciplined convergence under pressure.

A mature kernel should be able to evaluate whether evidence supports the same conclusion as a dossier, a stronger conclusion, a narrower corrected conclusion, or an unresolved state.

## New layer

After the source registry, add a first-class entity/event/source layer.

Objects to represent separately from conclusions:

- named actors
- organizations
- funders
- platforms
- policies
- enforcement mechanisms
- events
- public statements
- documents
- contradictions
- unresolved questions

A named actor appearing in a source is not proof of intent, command authority, or wrongdoing.

## Pipeline

```text
Dossier or retrieval input
-> source registry
-> entity/event/source registry
-> source review
-> claim/evidence separation
-> mechanism classification
-> counter-consideration pressure
-> worldview-fragment candidate
-> root worldview update only after repeated survival
```

## Mechanism classification

The kernel should distinguish:

1. direct coordination
2. institutional or incentive convergence
3. shared enforcement pipeline
4. funding or dependency pressure
5. reputational or advertiser pressure
6. platform-policy enforcement
7. unsupported conspiracy overclaim
8. unresolved mechanism

Important middle category: coordinated outcomes can arise without proof of one centralized command structure.

## Named conclusion discipline

The kernel should eventually support outputs like:

```text
Actor: Person or organization X
Event: Date/event Y
Mechanism: Policy/enforcement/funding channel Z
Evidence: Source A, Source B, document C
Status: mechanism-supported but motive-unproven
Open question: whether X directly requested enforcement or merely supplied classification language
```

It must avoid: "Person X is guilty because the pattern feels obvious."

It should preserve scope: X held role R during event E; document B shows policy action P; source C links organization X to mechanism M. This may support "part of the pipeline" without proving intent, command, or private coordination.

## Doctrine

- retrieval is not verification
- provenance is not proof
- source registry metadata is non-scoring
- fact-check/status labels are metadata, not truth
- consensus is not proof
- unresolved source questions stay visible
- kernel owns belief movement

## Dossier convergence target

Do not make the kernel agree with the dossier by default. Make the kernel disciplined enough that, if the dossier pattern is real, it cannot avoid seeing it.

Repeated reviewed cases may compress into candidate principles, but principles remain challengeable and never replace claim-specific evidence.

## Self-learning boundary

Allowed self-learning: extraction schemas, source-review checklists, retrieval-readiness prompts, mechanism rubrics, benchmark cases, compression rules, and candidate heuristics.

Not automatic: core doctrine rewrite, maturity target changes, rule promotion, contradiction deletion, treating prior conclusions as proof, or belief movement without approved evidence.

Project invariant:

```text
LLM/retrieval layer = eyes and mouth
source/entity/event layer = structured visibility
kernel = belief movement
user approval = promotion gate
```