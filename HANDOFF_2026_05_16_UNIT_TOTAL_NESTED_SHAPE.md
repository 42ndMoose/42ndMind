# HANDOFF 2026-05-16: Unit-Total Nested Shape Kernel

Read `CURRENT_PROGRESS.md` first, then this file if continuing unit-total / objective-language work.

## What was added

A first concrete unit-total nested shape kernel was added as a separate module so it does not destabilize the passing semantic/status-negation tests.

Files:

```text
src/kernel-unit-total-nested-shape-v0-1.js
kernel-unit-total-nested-shape-v0-1-test.html
unit-total-nested-shape.html
```

Commits:

```text
2c898fd9f8718641c4f72d55cb99afb5294b21e4 Add unit-total nested shape kernel
94c034972006b51d68e3ba35dbfccbba8e8ad41b Add unit-total nested shape test
ee82b23786652ebdcc22d61d8cc168f443eca0bd Add unit-total nested shape page
```

## Doctrine preserved

```text
active shape = Σ |dimension_i| = 1
parent active shape can be 1
child dimensions can unfold into their own local 1
mature scope remains 1 with more dimensions
force/intensity remains separate from shape
belief movement remains none
```

For intention:

```text
||i||_1 = 1
F = M · i
```

## Meaning

The point is not to add more words. The point is to split one overloaded dimension into role-specific dimensions while preserving the active total:

```text
Σ |parent_i| = 1
Σ |child_j within parent_i| = 1
global_child_ij = parent_i · child_ij
Σ |global_child_ij| = 1
```

So `intent` can be represented as:

```text
intent = desire + mood + mindset + principles + boundaries + physical_constraint + environment + ...
```

with:

```text
|desire| + |mood| + |mindset| + |principles| + |boundaries| + |physical_constraint| + |environment| + ... = 1
```

Each expanded dimension may then have its own local 1, but its global contribution remains parent-weighted.

## Module behavior

`KernelUnitTotalNestedShapeV01` exposes:

```text
doctrine()
defaultIntentShape()
analyzeShape(shape, options)
applyForce(shape, magnitude, options)
explainRule()
```

`analyzeShape` returns:

```text
root_l1
flattened_l1
scope_count
leaf_dimension_count
scopes
flattened_dimensions
errors
belief_movement: none
```

`applyForce` returns:

```text
shape_l1
force_l1
expected_force_l1_when_shape_ok
force_dimensions
belief_movement: none
```

## Test page

Run:

```text
https://42ndmoose.github.io/42ndMind/kernel-unit-total-nested-shape-v0-1-test.html?v=0.1.0
```

Expected:

```text
9/9 passed
```

The test checks:

```text
module loads
doctrine preserves unit-total and no belief movement
default intention shape is valid
all expanded child scopes have local L1 = 1
flattened global contributions preserve parent × child weighting
bad parent total fails
bad child total fails
F = M · i keeps force separate from shape
rule explanation contains the overloaded-dimension refinement statement
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/unit-total-nested-shape.html?v=0.1.0
```

The page lets the user:

```text
load default intent shape
edit nested shape JSON
analyze root/flattened L1
apply magnitude M through F = M · i
copy output JSON
```

## Next good build target

After the test passes, next work should probably add a second module that bridges unit-total shape to the semantic/canonical basis system:

```text
src/kernel-objective-language-shape-bridge-v0-1.js
```

Goal:

```text
convert semantic pressure vectors into normalized unit-total active shapes
preserve local labels as metadata only
show how a collapsed semantic pressure can split into role-specific local dimensions without increasing total mass
keep force/intensity separate from shape
```

Do not merge this directly into the semantic corpus until the standalone unit-total module is browser-verified.

## Prompt for next session

```text
Continue work on https://github.com/42ndMoose/42ndMind

Do not read unrelated uploaded files.

First read CURRENT_PROGRESS.md, then read HANDOFF_2026_05_16_UNIT_TOTAL_NESTED_SHAPE.md.

Current task:
Browser-run the unit-total nested shape test and fix only real failures.

Run:
https://42ndmoose.github.io/42ndMind/kernel-unit-total-nested-shape-v0-1-test.html?v=0.1.0

Expected:
9/9 passed

Then inspect:
https://42ndmoose.github.io/42ndMind/unit-total-nested-shape.html?v=0.1.0

Preserve:
- active shape = Σ |dimension_i| = 1
- parent active shape can be 1 while each child dimension unfolds into local 1
- mature scope remains 1 with more dimensions
- force/intensity remains separate from shape
- belief movement remains none
- local labels are metadata only

Use the SHA write trick. Make small commits only.
```
