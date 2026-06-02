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
```

The active verification files are:

```text
tests/math-language-kernel-v0-1-test.js
tests/intention-algebra-v0-1-test.js
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
  -> Ω whole state
```

Each new observation readjusts the active fields by normalization instead of appending an uncontrolled module.

## Intention algebra

The current intention algebra is:

```text
ι = N(0.18τ + 0.16ρ + 0.18μ + 0.18λ + 0.15ε↓ + 0.10ε↑ + 0.05κ)
```

This is project-official as version `0.1.0`, but not yet a frozen public language standard.

A broader official language requires:

```text
frozen grammar
parser
canonical serializer
conformance tests
versioned spec
reference implementation
```

## Main API

```js
const K = require('./src/math-language-kernel-v0-1.js');
const I = require('./src/intention-algebra-v0-1.js');

const s = K.create();
K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
const p = K.packet(s);
console.log(I.compute(p));
```

Browser global:

```js
window.FortySecondMindMathLanguageKernel
window.FortySecondMindIntentionAlgebra
```

## Run verification

```bash
node tests/math-language-kernel-v0-1-test.js
node tests/intention-algebra-v0-1-test.js
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
