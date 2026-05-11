# Maturity v0.1.1 Verification

Date: 2026-05-10

This note records the fixed maturity bridge verification.

## Bug found

The original maturity objective/fusion bridge pages read the live point incorrectly. The live brain saves the root point at:

```text
state.octahedron.point
```

The first bridge pages effectively read `state.octahedron` as if it directly contained `x`, `y`, and `z`, so they reported the null origin even when the live brain showed a non-null active point.

## Fixed pages

Use these pages instead of the original bridge pages:

- `maturity-objective-bridge-v0-1-1.html`
- `maturity-fusion-bridge-v0-1-1.html`

Both pages explicitly read `state.octahedron.point` and remain read-only / metadata-only.

## User browser verification

The user tested the fixed pages after creating a real non-null live brain state from `llm-brain-v0-3.html`.

The live brain showed approximately:

```text
x -0.468
y  0.532
z  0.000
nodes 7
```

The user reported that the fixed objective bridge and fixed fusion bridge were good.

## Current status

```text
Maturity objective benchmark: good.
Original bridge pages: stale reader bug; do not use for live-state validation.
Fixed v0.1.1 bridge pages: browser-verified by user against non-null live state.
Hard movement fusion: not applied yet.
```

## Next step

Expose the maturity assessment inside live brain packets as metadata-only. Do not hard-fuse movement yet.

After packet exposure, run benchmark/non-null checks again. Hard fusion should only happen after the packet-visible assessment is stable and approved.