# 42ndMind

42ndMind is now centered on a pure math-language kernel.

The active public entrypoint is:

```text
ui/math-language-lab.html
```

The active source file is:

```text
src/math-language-kernel-v0-1.js
```

The active verification file is:

```text
tests/math-language-kernel-v0-1-test.js
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

## Main API

```js
const K = require('./src/math-language-kernel-v0-1.js');

const s = K.create();
K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
console.log(K.packet(s));
```

Browser global:

```js
window.FortySecondMindMathLanguageKernel
```

## Run verification

```bash
node tests/math-language-kernel-v0-1-test.js
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
