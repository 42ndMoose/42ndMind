# HANDOFF 2026-05-18: Concept Admission / Formula Registration Registry v0.1

## Scope

This handoff records the first concept admission and formula registration layer.

This layer answers the question:

```text
How do newly learned words/meanings enter the kernel so the formula inspector can show their mathematical structure?
```

The answer is:

```text
new word/meaning -> candidate admission record -> provisional formula -> version trail -> revision hooks -> inspector extension record
```

It does not promote doctrine.

It does not silently mutate source formulas.

It does not use an LLM.

It does not perform source lookup.

It does not treat a new meaning as final truth.

## Built files

```text
src/kernel-concept-admission-registry-v0-1.js
kernel-concept-admission-registry-v0-1-test.html
concept-admission-registry.html
HANDOFF_2026_05_18_CONCEPT_ADMISSION_REGISTRY.md
```

## Dependency stack

The admission registry consumes the current formula inspector output.

Runtime stack:

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
```

## Core doctrine

```text
admits_new_words_and_meanings_as_candidate_formula_records: true
admission_does_not_promote_doctrine: true
learned_meanings_are_registered_with_version_trail: true
provisional_formula_must_preserve_l1_1_when_formula_present: true
force_terms_remain_outside_shape: true
contradiction_pressure_creates_revision_hooks_not_silent_mutation: true
inherited_formulas_record_source_formula_snapshot: true
composite_formulas_are_normalized_not_mass_inflated: true
unknown_or_underdefined_meanings_can_remain_pending_without_false_formula: true
formula_inspector_extension_records_are_available: true
no_llm: true
no_source_lookup: true
belief_movement: none
```

## Sample admissions

The v0.1 registry includes six neutral learned meanings:

```text
permission
warning
skepticism
loyalty
pressure
deception
```

These demonstrate both admission modes:

```text
inherit_formula
composite_formula
```

## Admission examples

```text
permission -> consent
skepticism -> doubt
warning -> threat + fear
loyalty -> trust + betrayal
pressure -> coercion + threat + manipulation
deception -> manipulation + betrayal
```

## Formula behavior

Each admitted meaning receives:

```text
registry_entry_id
admission_id
concept
meaning_text
aliases
admission_mode
admission_status
current_candidate_version
versions
source_formula_snapshots
formula_snapshot
shape_terms
force_terms
symbolic_formula
contradiction_notes
revision_hooks
rollback_targets
inspector_extension_available
promotion_status: not_promoted
doctrine_status: candidate_not_doctrine
belief_movement: none
```

For formula-registered meanings:

```text
L1 = 1
force terms remain outside shape
source formula snapshots are preserved
composite formulas are normalized, not mass inflated
```

## Revision behavior

Contradiction notes create revision hooks.

Example:

```text
warning can be protective rather than coercive
```

becomes:

```text
warning_revision_hook_1
hook_status: available_for_future_revision
```

This means contradictions create explicit pressure hooks instead of silently mutating the formula.

## Inspector relation

The existing formula inspector remains the canonical place to view admitted formulas for the main ledger.

The concept admission registry adds inspector-extension records for newly admitted candidate meanings.

Current practical split:

```text
intention-formula-inspector.html?v=inspect-1
  shows canonical ledger concepts

concept-admission-registry.html?v=admit-1
  shows newly admitted candidate meanings and their provisional formulas
```

A future patch can merge the two views into a single unified inspector UI.

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-concept-admission-registry-v0-1-test.html?v=admit-1
```

Expected result:

```text
8/8 passed
```

The 8 test groups are:

```text
1. module loads and doctrine admits candidate formulas only
2. admission registry runs from formula inspector
3. six learned meanings are registered as candidate formulas
4. inherited and composite admission modes are both present
5. candidate formulas preserve L1 and force separation
6. source formula snapshots, revision hooks, and rollback are present
7. inspector extension records are available
8. no LLM, no lookup, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/concept-admission-registry.html?v=admit-1
```

Expected metrics:

```text
Decision: CONCEPT_ADMISSION_REGISTRY_READY
Source formulas: 11
Admissions: 6
Registered formulas: 6
LLM used: false
Lookup: false
```

## What this proves

The kernel now has a registration path for newly learned meanings.

This closes the gap between:

```text
kernel learns new meaning
```

and:

```text
kernel can expose that meaning as a candidate mathematical formula
```

It remains candidate-only, revision-ready, and rollback-safe.

## Relation to universal language coverage

Universal coverage does not require manually writing a giant dictionary.

The correct path is now:

```text
canonical formula ledger
+
concept admission registry
+
coverage benchmarks
+
revision hooks
+
inspector extension records
```

New meanings can be admitted by inheritance or composition from known formula concepts.

Underdefined meanings can remain pending until enough source formula material exists.

## Suggested next task

Build unified formula inspector v0.1.1.

Suggested files:

```text
src/kernel-intention-formula-inspector-v0-1-1-patch.js
kernel-intention-formula-inspector-v0-1-1-test.html
intention-formula-inspector-v0-1-1.html
HANDOFF_2026_05_18_UNIFIED_FORMULA_INSPECTOR.md
```

Expected purpose:

```text
Show both canonical ledger concepts and admitted candidate meanings in one inspector UI.
Canonical formulas stay separate from admitted provisional formulas.
No promotion. No silent mutation.
```

## Do not do yet

```text
do not auto-promote admitted meanings into canonical doctrine
do not silently overwrite canonical ledger formulas
do not use LLM generation as the formula authority
do not make source lookup automatic
do not treat contradiction notes as resolved contradictions
```
