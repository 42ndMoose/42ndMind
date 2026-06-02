# 42ndMind

42ndMind is now centered on a pure math-language kernel.

The active public entrypoint is:

```text
ui/math-language-lab.html
```

The active source files are:

```text
src/math-language-kernel-v0-1.js
src/intention-algebra-v0-1.js
src/language-parser-v0-1.js
src/nested-relation-core-v0-1.js
```

The active verification files are:

```text
tests/math-language-kernel-v0-1-test.js
tests/intention-algebra-v0-1-test.js
tests/language-parser-v0-1-test.js
tests/nested-relation-core-v0-1-test.js
tests/language-v0-1-conformance-test.js
```

The active conformance fixtures are:

```text
tests/fixtures/language-v0-1/conformance-fixtures.json
```

The active language draft is:

```text
docs/language-standard-v0-1.md
```

## Core rule

```text
∥Ω∥₁ = 1
```

Every active subdivision is also unit-total:

```text
∥τ∥₁ = 1
∥ρ∥₁ = 1
∥μ∥₁ = 1
∥ε∥₁ = 1
∥λ∥₁ = 1
∥ι∥₁ = 1
∥κ∥₁ = 1
∥ν∥₁ = 1
```

Where:

```text
τ = raw pattern tokens
ρ = token relations
μ = candidate bindings
ε = error / uncertainty pressure
λ = internal language field
ι = intention field
κ = constraint field
ν = nested relation field
Ω = whole active math state
Ξ = English output channel
```

`Ξ` must stay empty at this layer.

## Current direction

The repo should not treat English as the language of the kernel.

English may describe the kernel from outside, but the kernel state itself is expressed as normalized symbolic fields.

Current flow:

```text
Σ raw input
  -> τ repeated pattern tokens
  -> ρ token relations
  -> μ candidate bindings
  -> ε error / uncertainty
  -> λ internal language
  -> ι intention
  -> ν nested relations
  -> Ω whole state
```

Each new observation readjusts the active fields by normalization instead of appending an uncontrolled module.

## Intention algebra

The current intention algebra is:

```text
ι = N(0.18τ + 0.16ρ + 0.18μ + 0.18λ + 0.15ε↓ + 0.10ε↑ + 0.05κ)
```

This is project-official as version `0.1.0`, but not yet a frozen public language standard.

## Nested relations

The nested relation core allows relations to point to other relations.

Example:

```text
ν1 = rel(a,b)
ν2 = rel(ν1,c)
ν3 = rel(ν2,ν1)
```

This is the first layer needed for complex structure: evidence about evidence, contradiction about a relation, support between claims, and scope over another relation.

The nested graph also has a unit-total relation field:

```text
∥ν∥₁ = 1
```

Cycles are rejected by validation.

## Packet grammar

The parser accepts packets like:

```text
Ω{τ[τ1=1];ρ[ρ∅=1];μ[μ1=0.7,μ2=0.3];ε[ε↓=0.8,ε↑=0.2];λ[λ1=1];ι[ιτ=0.5,ιμ=0.5];κ[κλ=1];Ω[λ:λ1=0.5,ι:ιτ=0.5]}
```

The canonical round trip is:

```text
source packet -> parse -> canonical packet -> serialize -> parse -> same canonical packet
```

Nested relation graphs serialize separately as:

```text
Ν{nodes[...];relations[...]}
```

## Conformance

The conformance suite defines what independent implementations must accept and reject.

It includes:

```text
valid packets
invalid packets
valid nested graphs
invalid nested graphs
intention fixtures
canonical round-trip checks
```

Run:

```bash
node tests/language-v0-1-conformance-test.js
```

## Main API

```js
const K = require('./src/math-language-kernel-v0-1.js');
const I = require('./src/intention-algebra-v0-1.js');
const P = require('./src/language-parser-v0-1.js');
const N = require('./src/nested-relation-core-v0-1.js');

const s = K.create();
K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
const p = K.packet(s);
const i = I.compute(p);
const text = P.serialize(P.fromKernelPacket(p));
const graph = N.fromKernelPacket(p);
console.log({ i, text, graphText: N.serialize(graph), roundTrip: P.roundTrip(text).same });
```

Browser global:

```js
window.FortySecondMindMathLanguageKernel
window.FortySecondMindIntentionAlgebra
window.FortySecondMindLanguageParser
window.FortySecondMindNestedRelationCore
```

## Run verification

```bash
node tests/math-language-kernel-v0-1-test.js
node tests/intention-algebra-v0-1-test.js
node tests/language-parser-v0-1-test.js
node tests/nested-relation-core-v0-1-test.js
node tests/language-v0-1-conformance-test.js
```

Expected result: all PASS lines.

## Boundaries

```text
No LLM calls.
No English output as internal language.
No semantic label shortcut as the main learning layer.
No direct GitHub/source writing from static pages.
No final truth promotion.
No claim that unit-total fields alone prove understanding.
```

## Archived / experimental layers

Older infant, brain, alive-math, and bridge files may remain in the repository as recoverable experimental history, but they are no longer the default project center.
