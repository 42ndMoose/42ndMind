# 42ndMind

42ndMind is now centered on a pure math-language kernel.

The active public entrypoint is:

```text
ui/math-language-lab.html
```

The active source files are:

```text
src/math-language-kernel-v0-1.js
src/discovery-core-v0-1.js
src/source-sandbox-v0-1.js
src/self-edit-loop-v0-1.js
src/intention-algebra-v0-1.js
src/language-parser-v0-1.js
src/nested-relation-core-v0-1.js
src/truth-accounting-core-v0-1.js
```

The active verification files are:

```text
tests/math-language-kernel-v0-1-test.js
tests/discovery-core-v0-1-test.js
tests/source-sandbox-v0-1-test.js
tests/self-edit-loop-v0-1-test.js
tests/intention-algebra-v0-1-test.js
tests/language-parser-v0-1-test.js
tests/nested-relation-core-v0-1-test.js
tests/language-v0-1-conformance-test.js
tests/truth-accounting-core-v0-1-test.js
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
∥θ∥₁ = 1
∥Ωd∥₁ = 1
∥ΩL∥₁ = 1
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
θ = truth-accounting field
Ωd = discovery state field
ΩL = whole-language self-edit state field
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
  -> Ωd discovery
  -> ΩL whole-language stack calculation
  -> sandboxed source mutation proposal
  -> tests and validators
  -> accepted virtual state or rejected chaos report
  -> τ repeated pattern tokens
  -> ρ token relations
  -> μ candidate bindings
  -> ε error / uncertainty
  -> λ internal language
  -> ι intention
  -> ν nested relations
  -> θ truth accounting
  -> Ω whole state
```

Each new observation readjusts the active fields by normalization instead of appending an uncontrolled module.

## Discovery core

The discovery core is the first non-dictionary growth operator.

It does not define meanings. It observes raw streams, compresses repeated structure, forms candidate distinctions, births stable symbols, tracks relations, exposes contradiction and unknown pressure, and keeps the discovery state unit-total.

```text
Σ -> α -> π -> Δ -> β -> ν -> χ/υ -> Ωd
```

## Source sandbox and self-edit loop

The source sandbox is the protected self-edit layer.

The self-edit loop calculates the whole declared language stack as one unit-total state, detects manifest-level gaps, generates one batch proposal, simulates the proposal in the virtual source sandbox, runs tests and validators, and returns a full accepted/rejected report.

```text
base source
  -> whole-language field ΩL
  -> gap field Γ
  -> batch mutation proposal
  -> virtual source simulation
  -> tests / validators
  -> accepted virtual state OR rejected chaos report
```

Real source patching remains outside the sandbox and requires an external write gate.

Run the loop locally:

```bash
node scripts/run-self-edit-loop-v0-1.js
```

It writes:

```text
artifacts/self-edit-loop-report-v0-1.json
```

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

## Truth accounting

The truth-accounting core ports the old truth-field pressure logic into pure math fields.

```text
σ = scope field
δ = definition field
ο = observation field
η = support/counter field
χ = contradiction field
υ = unknown field
μ = measurement field
θ = truth accounting field
```

The truth gate opens only when support is complete and every error/unknown/contradiction channel is zero.

```text
θT = 1 only if:
η+ = 1
χ! = 0
υ? = 0
σ! = 0
δ! = 0
ο! = 0
μ! = 0
```

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

Truth-accounting packets serialize separately as:

```text
Θ{σ[...];δ[...];ο[...];η[...];χ[...];υ[...];μ[...];θ[...]}
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
const L = require('./src/self-edit-loop-v0-1.js');
const report = L.run(files, { rawInput: '...' });
console.log(report.accepted, report.state.fields.ΩL, report.sandbox_report.chaos);
```

## Run verification

```bash
node tests/math-language-kernel-v0-1-test.js
node tests/discovery-core-v0-1-test.js
node tests/source-sandbox-v0-1-test.js
node tests/self-edit-loop-v0-1-test.js
node tests/intention-algebra-v0-1-test.js
node tests/language-parser-v0-1-test.js
node tests/nested-relation-core-v0-1-test.js
node tests/language-v0-1-conformance-test.js
node tests/truth-accounting-core-v0-1-test.js
```

Expected result: all PASS lines.

## Boundaries

```text
No LLM calls.
No English output as internal language.
No semantic label shortcut as the main learning layer.
No direct real-source writing from sandbox simulation.
No final truth promotion without truth-accounting closure.
No claim that unit-total fields alone prove understanding.
```

## Archived / experimental layers

Older infant, brain, alive-math, and bridge files may remain in the repository as recoverable experimental history, but they are no longer the default project center.
