# 42ndMind Language Standard v0.1 Draft

Status: internal formal language draft with conformance fixtures.

This file defines the current internal language direction. It is project-official for this repository, but not yet frozen as an external public standard.

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
NU = nested relation field
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
L1(NU) = 1
L1(OMEGA) = 1
```

## Current intention equation

```text
IOTA = N(0.18 TAU + 0.16 RHO + 0.18 MU + 0.18 LAMBDA + 0.15 EPSILON_DOWN + 0.10 EPSILON_UP + 0.05 KAPPA)
```

`N` means unit-total normalization.

## Nested relations

Nested relations are implemented in:

```text
src/nested-relation-core-v0-1.js
```

Verification is implemented in:

```text
tests/nested-relation-core-v0-1-test.js
```

Nested relations allow a relation to use another relation as one of its endpoints:

```text
NU1 = rel(a, b)
NU2 = rel(NU1, c)
NU3 = rel(NU2, NU1)
```

This is required for complex structure such as:

```text
evidence about evidence
support between claims
contradiction over a relation
scope over another relation
causality between relation chains
```

The nested relation graph has its own unit-total field:

```text
L1(NU) = 1
```

Cycles are rejected by validation.

## Packet grammar v0.1

The parser accepts canonical packets of this form:

```text
OMEGA_PACKET ::= OMEGA_OPEN FIELD_LIST OMEGA_CLOSE
FIELD_LIST   ::= FIELD (SEMICOLON FIELD)*
FIELD        ::= FIELD_NAME OPEN ROW_LIST CLOSE
ROW_LIST     ::= ROW (COMMA ROW)*
ROW          ::= SYMBOL EQUAL NUMBER
FIELD_NAME   ::= TAU | RHO | MU | EPSILON | LAMBDA | IOTA | KAPPA | OMEGA
```

The concrete character form is:

```text
Ω{τ[τ1=1];ρ[ρ∅=1];μ[μ1=0.7,μ2=0.3];ε[ε↓=0.8,ε↑=0.2];λ[λ1=1];ι[ιτ=0.5,ιμ=0.5];κ[κλ=1];Ω[λ:λ1=0.5,ι:ιτ=0.5]}
```

Whitespace is ignored by the parser.

Every canonical packet must include all fields in this order:

```text
τ, ρ, μ, ε, λ, ι, κ, Ω
```

The parser may accept loose packets with missing fields only when explicitly called in loose mode. Loose mode fills missing fields with unit-total empty fields.

## Nested graph grammar v0.1

Nested graphs serialize separately as:

```text
Ν{nodes[...];relations[...]}
```

Concrete example:

```text
Ν{nodes[a:symbol,b:symbol,c:symbol];relations[ν1(rel,a,b,s,1);ν2(rel,ν1,c,s,1)]}
```

A relation row has this form:

```text
RELATION ::= ID(OP,FROM,TO,SCOPE,WEIGHT)
```

`FROM` and `TO` may be symbols or relation IDs.

## Parser and serializer

The packet parser and serializer are implemented in:

```text
src/language-parser-v0-1.js
```

The nested graph parser and serializer are implemented in:

```text
src/nested-relation-core-v0-1.js
```

Verification is implemented in:

```text
tests/language-parser-v0-1-test.js
tests/nested-relation-core-v0-1-test.js
tests/language-v0-1-conformance-test.js
```

The required round trip is:

```text
source packet -> parse -> canonical packet -> serialize -> parse -> same canonical packet
nested graph -> serialize -> parse -> same nested graph
```

## Conformance suite

The conformance suite is implemented in:

```text
tests/fixtures/language-v0-1/conformance-fixtures.json
tests/language-v0-1-conformance-test.js
```

It defines:

```text
valid packet fixtures
invalid packet fixtures
valid nested graph fixtures
invalid nested graph fixtures
intention-algebra fixtures
canonical round-trip checks
```

An independent implementation of v0.1 should pass the same fixture set.

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

Under that definition, v0.1 is now an internal formal language draft with conformance fixtures.

It is not yet a mature public language because it still lacks:

```text
formal freeze guarantee
multiple independent implementations
complete grammar document with all edge cases fixed
large cross-domain fixture suite
```

## Frozen grammar

A frozen grammar means the syntax rules cannot silently change inside the same version.

For example, if v0.1 says fields must appear as:

```text
τ[...] ; ρ[...] ; μ[...] ; ε[...] ; λ[...] ; ι[...] ; κ[...] ; Ω[...]
```

then v0.1 cannot later redefine packet order, row separators, required fields, or numeric rules without becoming v0.2.

PEMDAS is not the whole grammar of math. PEMDAS only tells you the order for evaluating arithmetic operations. A grammar tells you what strings are valid expressions in the first place.

Example distinction:

```text
1 + 2 * 3
```

PEMDAS says multiplication happens before addition.

But grammar says `1 + * 3` is not even a valid expression.

42ndMind needs grammar first, then evaluation rules.

## Next standardization target

The next milestone is a cross-domain fixture suite:

```text
logic fixtures
causality fixtures
evidence fixtures
time/order fixtures
scope fixtures
contradiction fixtures
translation fixtures
```

After that, the language can move from internal formal draft toward a frozen v0.1 standard.
