# 42ndMind

42ndMind is an experimental math-language kernel, verification stack, and self-editing research system.

The project is trying to build a small formal substrate where raw input can be reduced into canonical symbolic state, checked against invariants, completed through closure, and extended only when a simulated candidate improves the system without breaking its stability conditions.

It is not finished. It is not a mature artificial mind. It is not a general theorem prover yet. The current repo is a working research scaffold for moving toward a unified mathematical language spine.

## Core idea

The long-term target is not to manually add thousands of functions. The target is to build a kernel where new math/logical ability is generated from a shared internal language:

```text
raw input
→ canonical AST
→ semantic classification
→ operator anatomy
→ proof / closure obligation
→ verified output or precise gap
→ safe self-extension when the missing closure is well-defined
```

The kernel should prefer state transitions that increase closure while preserving reality contact, self-correction, coherence, and integration.

## Current status

The repo currently has several active layers:

```text
math-language kernel       normalized Ω packets, gaps, correction, proof, grounding, completion
math AST core              canonical syntax tree for supported math/proof forms
language parser            symbolic parser and bridge into the AST layer
operator anatomy           operation parts, preconditions, violations, inverse chains, closure targets
proof closures             implication chains, contradiction detection, basic equation/relation closure
self-edit loop             simulated source mutation, test-backed candidate generation, safe promotion
epistemic octahedron core  stability geometry for candidate state transitions
truth accounting           support / contradiction / unknown / measurement accounting
source sandbox             virtual source editing before real source is touched
```

The important shift is that the project is moving away from isolated patches and toward one shared math-language spine. The AST layer is now intended to become the structure that parser, anatomy, proof, and self-edit logic consume.

## Completion model

The main kernel still uses normalized symbolic fields and fixed-point completion.

The central invariant is:

```text
∥Ω∥₁ = 1
```

The current completion equation is:

```text
Ω* = fix(C ⊕ Λ)
```

Meaning:

```text
completed state = fixed point of closure plus lexeme derivation
```

The current lifecycle is:

```text
F → ν → ≡ → Δ → T → ⊢ → lim → G → Λ → Ω*
```

Where:

```text
F     field / packet input
ν     canonical form
≡     canonical equivalence relation
Δ     measured gap field
T     correction transform
⊢     proof gate
lim   convergence packet
G     grounding status
Λ     kernel-derived lexeme field
Ω*    completion fixed point
χ     invariant set
Ξ     English output channel, empty at kernel layer
```

Completion means:

```text
fixed = true
χ holds
Δ? = 0
conflict_count = 0
Ξ = ""
```

## Math-language spine

The current spine begins in:

```text
src/math-ast-core-v0-1.js
```

It canonicalizes supported forms into a `MathProgram` AST. Current supported forms include:

```text
2x + 1 = 7
x/y is undefined when y = 0
∀x ∈ ℝ, x² ≥ 0
A=>B, B=>C
A, not A
x >= 3 with x = 5
```

Current AST nodes include:

```text
MathProgram
Equation
AffineExpression
LinearRelation
DivisionConstraint
QuantifiedStatement
ImplicationChain
ContradictionPair
```

These classify into closure obligations:

```text
Equation              → solveAffineEquation
DivisionConstraint    → proveDivisionByZeroUndefined
QuantifiedStatement   → proveSquareNonnegative
ImplicationChain      → composeImplicationChain
ContradictionPair     → detectContradiction
LinearRelation        → evaluateLinearRelation
```

The parser bridge exposes:

```text
parseMathAst(...)
classifyMathAst(...)
mathAstToKernelFields(...)
```

The anatomy bridge lets operator anatomy derive surfaces from AST classifications instead of only from raw source text.

## Operator anatomy

Operator anatomy lives in:

```text
src/operator-anatomy-v0-1.js
```

It represents reusable operation structure:

```text
operation
surface
parts
preconditions
violations
inverse_chain
closure_operator
closure_result
examples
assertion
```

Current anatomy families include:

```text
affine_equation
affine_expression
linear_relation_truth
division_constraint
square_nonnegative
statement_classification
implication_chain
contradiction_pair
```

The purpose is to stop adding isolated functions and instead make missing functions arise from recognizable operation structure.

## Epistemic Octahedron core

The philosophical stability layer lives in:

```text
src/epistemic-octahedron-core-v0-1.js
```

This is not meant to be a morality filter or a decorative rule. It is meant to act as a stability field for kernel growth.

The core coordinates currently include:

```text
PEAK        = (0,  1, 0)
COLLAPSE    = (0, -1, 0)
NULL_ORIGIN = (0,  0, 0)
```

with the active surface:

```text
|x| + |y| + |z| = 1
```

Candidate transitions can be evaluated by:

```text
before_state
after_state
Δpeak_distance
Δcoherence
Δreality_contact
Δself_correction
Δanti_delusion
Δintegration
Δclosure
pressure before / after
```

The goal is not to force the kernel to obey a slogan. The goal is to make source-level growth preserve the conditions that make truth-seeking sane: coherence, reality contact, self-correction, resistance to fake closure, scope clarity, and integration.

## Self-edit loop

The self-edit loop lives in:

```text
src/self-edit-loop-v0-1.js
scripts/run-self-edit-loop-v0-1.js
```

The loop currently does this:

```text
collect current source state
create frontier / gap report
generate candidate patch in simulation
reject marker-only or fake improvements
run test-backed pressure comparison
apply report consistency gate
apply epistemic transition checks
promote only safe candidates
rerun after promotion
publish latest artifacts
```

Promotion is controlled by:

```text
scripts/promote-safe-reactive-candidate-v0-1.js
```

A candidate is promoted only when the simulated report says it is safe, consistency gates agree, the path is allowed, and candidate content exists.

## Important source files

```text
src/math-language-kernel-v0-1.js       core Ω completion kernel
src/math-ast-core-v0-1.js              canonical math AST spine
src/language-parser-v0-1.js            symbolic parser + math AST bridge
src/operator-anatomy-v0-1.js           operation anatomy and closure surfaces
src/epistemic-octahedron-core-v0-1.js  stability geometry / transition field
src/self-edit-loop-v0-1.js             self-edit simulation and candidate search
src/source-sandbox-v0-1.js             virtual source mutation sandbox
src/discovery-core-v0-1.js             raw stream pattern discovery
src/intention-algebra-v0-1.js          intention as unit-total field
src/nested-relation-core-v0-1.js       relations over relations
src/truth-accounting-core-v0-1.js      support / contradiction / unknown accounting
```

## Active tests

Current core tests include:

```text
tests/math-ast-core-v0-1-test.js
tests/math-ast-bridge-v0-1-test.js
tests/math-language-kernel-v0-1-test.js
tests/completion-scopes-v0-1-test.js
tests/completion-edge-scopes-v0-1-test.js
tests/completion-frontier-scopes-v0-1-test.js
tests/compiler-to-kernel-v0-1-test.js
tests/raw-to-kernel-v0-1-test.js
tests/claim-memory-v0-1-test.js
tests/stance-ambiguity-v0-1-test.js
tests/formal-math-v0-1-test.js
tests/discovery-core-v0-1-test.js
tests/source-sandbox-v0-1-test.js
tests/mathematical-patch-proposer-v0-1-test.js
tests/operator-synthesis-core-v0-1-test.js
tests/self-edit-loop-v0-1-test.js
tests/intention-algebra-v0-1-test.js
tests/language-parser-v0-1-test.js
tests/nested-relation-core-v0-1-test.js
tests/language-v0-1-conformance-test.js
tests/truth-accounting-core-v0-1-test.js
```

The workflow publishes latest reports into:

```text
artifacts/latest-*.json
artifacts/latest-core-test-log-v0-1.txt
```

## Running locally

Run the AST tests:

```bash
node tests/math-ast-core-v0-1-test.js
node tests/math-ast-bridge-v0-1-test.js
```

Run the main kernel tests:

```bash
node tests/math-language-kernel-v0-1-test.js
node tests/completion-scopes-v0-1-test.js
node tests/completion-edge-scopes-v0-1-test.js
```

Run the self-edit loop:

```bash
node scripts/run-self-edit-loop-v0-1.js
```

The self-edit loop writes:

```text
artifacts/self-edit-loop-report-v0-1.json
artifacts/self-edit-loop-summary-v0-1.json
artifacts/reactive-self-edit-report-v0-1.json
artifacts/reactive-self-edit-summary-v0-1.json
```

## Current direction

The immediate direction is to finish wiring the canonical AST spine into every major layer:

```text
parser → AST
AST → classification
classification → operator anatomy
operator anatomy → closure obligation
closure obligation → proof engine
proof engine → verified output or precise gap
safe self-edit loop → candidate promotion
```

The project should be considered successful at this phase when it can take new supported math/proof forms, reduce them into the AST, derive the correct closure obligation, prove or reject the closure, and expose the exact missing structure when it fails.

The point is a small, disciplined kernel with increasingly general internal logic, not a large pile of disconnected modules.
