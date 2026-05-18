# HANDOFF 2026-05-18: Intention Formula Inspector v0.1

## Scope

This handoff records the read-only formula inspector for the objective intention-language kernel.

This layer answers the practical question:

```text
How can I see the mathematical/algebraic formula the kernel has for a specific intention?
```

The inspector exposes current candidate formula memory for each intention concept.

It does not promote doctrine. It does not mutate the ledger. It does not attribute real-world intent. It does not create a belief/world-model ledger.

## Built files

```text
src/kernel-intention-formula-inspector-v0-1.js
kernel-intention-formula-inspector-v0-1-test.html
intention-formula-inspector.html
HANDOFF_2026_05_18_INTENTION_FORMULA_INSPECTOR.md
```

## Dependency stack

The formula inspector loads the canonical ledger v0.1.1 and proof output:

```text
src/kernel-intention-discovery-v0-1.js?v=intent-1
src/kernel-intention-refinement-v0-1.js?v=refine-1
src/kernel-intention-necessity-test-v0-1.js?v=necessity-1
src/kernel-intention-neighbor-lattice-v0-1.js?v=lattice-3
src/kernel-intention-lattice-invariance-benchmark-v0-1.js?v=invariance-2
src/kernel-intention-formula-compiler-v0-1.js?v=formula-1
src/kernel-intention-concept-expansion-loop-v0-1.js?v=expansion-2
src/kernel-intention-contradiction-refinement-loop-v0-1.js?v=contradiction-1
src/kernel-intention-formula-revision-engine-v0-1.js?v=revision-1
src/kernel-intention-canonical-formula-ledger-v0-1.js?v=ledger-1
src/kernel-intention-proof-output-v0-1.js?v=proof-1
src/kernel-intention-minimal-pair-library-v0-1.js?v=minpair-1
src/kernel-intention-dimension-splitting-v0-1.js?v=split-2
src/kernel-intention-coefficient-dimension-revision-engine-v0-1.js?v=codim-1
src/kernel-intention-canonical-formula-ledger-v0-1-1-patch.js?v=ledger-2
src/kernel-intention-formula-inspector-v0-1.js?v=inspect-1
```

## Purpose

The inspector lets the user select or inspect an intention concept and see:

```text
current candidate version
symbolic formula
shape terms
force terms
force equation
all versions v0001/v0002/v0003
version types
L1 total
force terms outside shape
proof reference
proof lines
rollback targets
revision trail
candidate-only status
belief_movement: none
```

## Concepts exposed

```text
consent
threat
request
refusal
trust
betrayal
doubt
belief
fear
coercion
manipulation
```

## Expected current version

Each concept should currently point to:

```text
<concept>_v0003_coefficient_dimension_revision
```

This version has 10 shape terms after dimension splitting.

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-formula-inspector-v0-1-test.html?v=inspect-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is read-only inspector
2. inspector runs from ledger v0.1.1 and proof output
3. eleven concepts are inspectable
4. each concept exposes three formula versions
5. current candidate is v0003 with symbolic formula
6. L1 and force separation are visible and valid
7. proof references and rollback data are present
8. read-only candidate-only status and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-formula-inspector.html?v=inspect-1
```

Expected metrics:

```text
Decision: FORMULA_INSPECTOR_READY
Concepts: 11 or 1 depending on inspect-all or selected concept view
Selected: <concept>
```

## What this proves

The kernel now has an inspectable formula memory layer.

A user can select a concept and see its current algebraic/symbolic structure instead of only seeing parser decisions.

This closes a major usability gap for the intention-language kernel.

## Suggested next task

The next best technical layer is cross-language expanded benchmark v0.1.

Reason:

```text
The English expanded surface is now traceable and inspectable.
To move closer to language-independent mathematical structure, equivalent neutral inputs across languages should map into the same formula targets while preserving ambiguity and holdout behavior.
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote formula candidates to doctrine.
