# Entity/Event/Source Registry Verification

Date: 2026-05-10

This note records the first browser verification for the named reality-map layer.

## Files involved

- `src/entity-event-source-registry-v0-1.js`
- `entity-event-source-registry-test.html`

## Purpose

The entity/event/source registry represents named actors, organizations, policies, events, documents, mechanisms, links, and unresolved questions separately from conclusions and belief movement.

It is a non-scoring metadata layer.

Doctrine preserved:

- named entity is not guilt
- named event is not proof of motive
- source link is not verification
- mechanism classification is pressure, not verdict
- direct coordination requires direct evidence
- incentive convergence is not command proof
- retrieval is not verification
- provenance is not proof
- kernel owns belief movement

## Browser verification reported by user

The user ran:

```text
https://42ndmoose.github.io/42ndMind/entity-event-source-registry-test.html
```

Observed result:

```text
9/9 passed
```

Passed checks include:

- module loads
- sample packet imports
- layer is metadata-only and non-scoring
- links reference known ids
- mechanism classes are counted
- direct coordination requires direct source
- unsupported conspiracy overclaim must be flagged
- flagged unsupported overclaim passes integrity while remaining visible
- doctrine preserves entity/event/mechanism humility

## Current status

```text
Entity/event/source registry v0.1: built.
Browser smoke test: 9/9 passed.
Live brain integration: not yet.
Dossier-to-entity/event extraction: not yet.
Source-review promotion into claims/evidence: not yet.
```

## Next step

Add a bridge page that can read a saved source registry or pasted entity/event/source packet, build the entity/event/source registry, and save it to localStorage as metadata only.

Suggested storage key:

```text
42ndMind_entity_event_source_registry_v0_1
```

Do not score belief state from this registry directly. It should become structured visibility for later source review and kernel-approved import.