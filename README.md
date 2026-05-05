# Epistemic Kernel v0

A tiny transparent belief-state prototype based on epistemic pressure, gate updates, and octahedron projection.

This is not an LLM. It does not understand English deeply. It understands structured belief objects: claims, evidence, contradictions, questions, gate states, and an octahedron point.

The point of this prototype is to put the Epistemic Octahedron beneath the language layer instead of merely training an LLM to sound mature.

## What it does

- Starts from the null origin: `(0, 0, 0)`.
- Stores claims.
- Stores evidence that supports or attacks claims.
- Detects a few simple contradiction patterns.
- Preserves live hypotheses instead of jumping straight to motive certainty.
- Creates open inquiry questions when belief pressure remains unresolved.
- Updates six gate scores:
  - G1 counter-consideration
  - G2 non-strawman
  - G3 self-correction
  - G4 contradiction handling
  - G5 reality contact
  - G6 non-self-sealing
- Projects semantic state onto the Epistemic Octahedron surface for active worldview states.
- Exports and imports JSON state.

## How to run

### Browser mode

Open `index.html` in a browser.

No install is required.

### Node demo

If Node.js is installed:

```bash
npm run demo
```

## How to use

The fastest path is the Quick Ingest box. Paste something like:

```text
I submitted the form before the deadline. Actually, I submitted it this morning, but the deadline was yesterday.
```

Then click `Ingest text`.

The better path is structured input:

1. Add a claim.
2. Add evidence that supports or attacks the claim.
3. Watch the kernel update confidence, contradictions, gate states, questions, and octahedron position.

## Important limitation

The quick English parser is intentionally crude. It is not the real intelligence layer.

The intended future architecture is:

```text
Human language
→ LLM extractor
→ structured claim/evidence packet
→ Epistemic Kernel
→ belief-state update
→ optional LLM verbal explanation
```

In other words, the LLM becomes the eyes and mouth. The kernel owns belief movement.

## What this prototype proves

This v0 proves that the kernel can exist without training a model:

```text
claim enters
belief state changes
contradiction creates pressure
evidence changes confidence
gates move
octahedron point moves
questions remain open until resolved
```

It is not a finished AI. It is the first skeleton of an epistemic operating system.
