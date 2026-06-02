# 42ndMind Language Standard v0.1 Draft

Status: draft project standard.

This file defines the current internal language direction. It is project-official for this repository, but not yet a frozen external standard.

## Core objects

A field is a finite normalized weighted symbolic set:

```text
F = [{ symbol, weight }]
L1(F) = 1
```

The canonical runtime packet contains:

```text
SIGMA = raw input stream
TAU = repeated pattern token field
RHO = token relation field
MU = candidate binding field
EPSILON = error / uncertainty field
LAMBDA = internal language field
IOTA = intention field
KAPPA = constraint field
OMEGA = whole active state field
XI = English output channel
```

XI is empty at this layer.

## Invariants

```text
L1(TAU) = 1
L1(RHO) = 1
L1(MU) = 1
L1(EPSILON) = 1
L1(LAMBDA) = 1
L1(IOTA) = 1
L1(KAPPA) = 1
L1(OMEGA) = 1
```

## Current intention equation

```text
IOTA = N(0.18 TAU + 0.16 RHO + 0.18 MU + 0.18 LAMBDA + 0.15 EPSILON_DOWN + 0.10 EPSILON_UP + 0.05 KAPPA)
```

`N` means unit-total normalization.

## What counts as language here

A language exists in this repository when it has:

```text
symbols
well-formed packets
composition rules
normalization rules
tests that reject invalid packets
stable versioning
```

Under that definition, v0.1 is already a project language draft.

It is not yet a mature public language because it still lacks:

```text
frozen grammar
canonical parser
canonical serializer
external conformance suite
formal spec stability guarantee
```

## Next standardization target

The next milestone is a parser and canonical serializer:

```text
text packet -> parsed field packet -> canonical JSON -> same packet after round trip
```

After that, the language can be called a versioned internal formal language instead of only a draft symbolic protocol.
