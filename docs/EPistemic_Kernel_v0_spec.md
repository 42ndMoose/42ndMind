# Epistemic Kernel v0 Spec

## Purpose

Build the Epistemic Octahedron as the first layer of cognition rather than putting it on top of a chatbot.

## Core rule

The kernel does not optimize for polished answers. It optimizes for mature belief movement under pressure.

## State objects

The kernel state contains:

- claims
- evidence
- contradictions
- questions
- principles
- gate states
- semantic triple `(a, s, b)`
- projected octahedron point `(x, y, z)`
- event log

## Update loop

1. Claim is added.
2. Claim is checked for closure, self-sealing, and reality-contact signals.
3. Claim is compared against prior claims.
4. Contradiction pressure is created where needed.
5. Live hypotheses are attached.
6. Inquiry questions are created.
7. Gate scores update.
8. Semantic triple updates.
9. Active state projects to the octahedron surface.

## Why it can grow

Growth happens by state update, not by hidden neural-weight update.

Later versions can allow stable repeated patterns to become principles, then allow principles to be challenged by later evidence.

## Future version targets

v0.1: better structured schema and cleaner contradiction types.

v0.2: attach an LLM extractor that converts raw text into structured claim/evidence packets.

v0.3: connect directly to philosophers-stone profiler.js or a reduced kernel-compatible port.

v0.4: benchmark mode for Epistemic Pressure Benchmark cases.

v0.5: dossier ingestion mode, where claims from a dossier become evidence-linked belief nodes instead of unexamined assertions.

v1.0: public demo that shows null-to-active worldview movement, gate pressure, and octahedron projection.
