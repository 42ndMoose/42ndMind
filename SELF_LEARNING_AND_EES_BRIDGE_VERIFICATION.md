# Self-Learning and Entity/Event/Source Bridge Verification

Date: 2026-05-10

This note records browser verification after adding the bounded self-learning sandbox and the entity/event/source bridge.

## Files involved

Self-learning:

- `src/self-learning-v0-1.js`
- `src/self-learning-v0-1-1-patch.js`
- `self-learning-test-v0-1-1.html`

Entity/event/source bridge:

- `src/entity-event-source-registry-v0-1.js`
- `entity-event-source-bridge.html`
- `entity-event-source-registry-test.html`

## Self-learning verification

The user ran:

```text
https://42ndmoose.github.io/42ndMind/self-learning-test-v0-1-1.html
```

Observed result:

```text
10/10 passed
```

This verifies the bounded self-learning sandbox with the v0.1.1 convergence-detection patch.

The patch fixed the earlier issue where `mechanism_class: shared_enforcement_pipeline` was not counted as a convergence signal, preventing a compression-rule candidate from being proposed.

Self-learning remains bounded:

- candidate proposals only
- sandbox-only
- non-scoring
- no belief movement
- no core doctrine rewrite
- no auto-promotion
- user approval required before any promotion

## Entity/event/source bridge verification

The user opened:

```text
https://42ndmoose.github.io/42ndMind/entity-event-source-bridge.html
```

The user clicked `SAVE metadata registry` and observed a status line confirming save to:

```text
42ndMind_entity_event_source_registry_v0_1
```

This confirms the bridge can build and persist a named reality-map registry as metadata only.

## Current status

```text
Entity/event/source registry module: built and 9/9 browser-tested.
Entity/event/source bridge: built and browser-verified saving to localStorage.
Self-learning sandbox: built and 10/10 browser-tested after v0.1.1 patch.
Live hard fusion: browser-verified earlier.
```

## Doctrine preserved

- named entity is not guilt
- event is not proof of motive
- mechanism classification is pressure, not verdict
- retrieval is not verification
- provenance is not proof
- self-learning proposals are candidate-only
- kernel owns belief movement
- user approval is required before promotion

## Next safe step

Add a self-learning bridge page that can read:

```text
42ndMind_entity_event_source_registry_v0_1
```

and reviewed live hard-fusion/maturity cases, then emit a `42ndMind_self_learning_report` and optionally save `selfLearningCandidates` as metadata only.

Do not promote self-learning candidates into active rules automatically.