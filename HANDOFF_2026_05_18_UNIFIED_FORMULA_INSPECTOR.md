# HANDOFF 2026-05-18: Unified Formula Inspector v0.1.1

## Scope

This handoff records the unified formula inspector patch.

This layer combines:

```text
canonical formula ledger concepts
+
admitted candidate meanings from the concept admission registry
```

into one read-only inspection surface.

It answers the practical question:

```text
Where can I see the formula for a word/meaning the kernel already knows or has newly admitted?
```

Answer:

```text
https://42ndmoose.github.io/42ndMind/intention-formula-inspector-v0-1-1.html?v=inspect-2
```

## Built files

```text
src/kernel-intention-formula-inspector-v0-1-1-patch.js
kernel-intention-formula-inspector-v0-1-1-test.html
intention-formula-inspector-v0-1-1.html
HANDOFF_2026_05_18_UNIFIED_FORMULA_INSPECTOR.md
```

## Dependency stack

The unified inspector loads both the canonical formula stack and the concept admission registry:

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
src/kernel-concept-admission-registry-v0-1.js?v=admit-1
src/kernel-intention-formula-inspector-v0-1-1-patch.js?v=inspect-2
```

## Core doctrine

```text
unified_inspector_shows_canonical_and_admitted_meanings: true
canonical_formulas_remain_separate_from_admitted_candidate_formulas: true
admitted_meanings_are_candidate_not_doctrine: true
no_admitted_formula_auto_promotes_to_canonical_ledger: true
admission_revision_hooks_visible: true
formula_origin_layer_visible: true
no_llm: true
no_source_lookup: true
belief_movement: none
```

## Current record counts

Expected:

```text
canonical formulas: 11
admitted candidate formulas: 6
total formula records: 17
```

Canonical concepts:

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

Admitted candidate meanings:

```text
permission
warning
skepticism
loyalty
pressure
deception
```

## Separation rule

Canonical formula records have:

```text
record_type: canonical_formula
formula_origin_layer: canonical_formula_ledger
proof_reference: present
```

Admitted candidate formula records have:

```text
record_type: admitted_candidate_formula
formula_origin_layer: concept_admission_registry
proof_reference: null
source_formula_snapshots: present
revision_hooks: visible when contradiction_notes exist
```

This prevents admitted formulas from pretending to be canonical doctrine.

## Formula invariants

All records must preserve:

```text
L1 = 1
force terms outside shape
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-formula-inspector-v0-1-1-test.html?v=inspect-2
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. modules load and doctrine is unified inspector only
2. unified inspector runs from formula inspector and admission registry
3. canonical and admitted formula layers remain separate
4. all expected concepts and admitted meanings are inspectable
5. all formulas preserve L1 and force separation
6. admitted records expose source snapshots and revision hooks
7. selected inspection finds canonical and admitted records
8. no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/intention-formula-inspector-v0-1-1.html?v=inspect-2
```

Expected metrics:

```text
Decision: UNIFIED_FORMULA_INSPECTOR_READY
Canonical: 11
Admitted: 6
Total formulas: 17
```

## What this proves

The kernel now has a practical formula inspection path for both:

```text
canonical meanings
newly admitted candidate meanings
```

This closes the user-facing gap between learning a meaning and seeing its mathematical formula.

## Relation to universal language coverage

Universal coverage now has a working admission route:

```text
new word/meaning
-> concept admission registry
-> candidate formula
-> revision hooks
-> rollback target
-> unified formula inspector
```

This does not mean every word in existence already has a formula.

It means the kernel now has a deterministic registration path for expanding coverage without mutating canonical formulas silently.

## Suggested next task

Update the architecture/progress files to mark:

```text
concept admission registry ready
unified formula inspector ready
```

Then continue with:

```text
evidence/media registry v0.1
```

## Do not do yet

```text
do not auto-promote admitted meanings into canonical doctrine
do not silently overwrite canonical ledger formulas
do not fake proof references for admitted records
do not use LLM generation as formula authority
do not make source lookup automatic
```
