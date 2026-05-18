# HANDOFF 2026-05-18: Intention Language-to-Formula Expanded Benchmark v0.1.2

## Scope

This handoff records the v0.1.2 patch for the expanded language-to-formula benchmark.

The v0.1.1 expanded parser correctly handled labelled cases and ambiguity cases, but one unmatched negative control failed:

```text
A cold stone rests under a table beside a lamp.
```

The base parser treated the word `under` as a weak dimension-only hit for `proposition_under_consideration`, producing a low-confidence `doubt` candidate.

After the patch, both unmatched negative controls may be counted as weak-noise holdouts because both contain only weak dimension-level noise and no concept alias support.

## Patch decision

The patch adds an unmatched holdout rule for weak dimension-only noise.

This does not change doctrine.

It prevents negative object-description controls from becoming formula matches based only on isolated structural words such as `under`.

## Files added/updated

Updated:

```text
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js
```

Added:

```text
kernel-intention-language-to-formula-expanded-benchmark-v0-1-2-test.html
intention-language-to-formula-expanded-benchmark-v0-1-2.html
HANDOFF_2026_05_18_INTENTION_LANGUAGE_TO_FORMULA_EXPANDED_BENCHMARK_V0_1_2.md
```

## Cache/runtime notes

Use the patched cache key:

```text
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js?v=parser-3
```

Do not use the old expanded benchmark URL with `parser-2` when verifying this patch.

## Added doctrine guard

```text
weak_dimension_only_noise_must_not_create_formula_match: true
```

## Added functions

```text
isWeakDimensionOnlyNoise(parse)
applyUnmatchedHoldoutIfNeeded(parse)
```

## Holdout rule

An unmatched control is held out if the parser result is weak dimension-only noise:

```text
alias_hits.length === 0
matched_dimension_count <= 2
raw_score <= 2
normalized_score < 0.5
```

When that condition is met, the wrapper sets:

```text
parse_status: unmatched
unmatched_holdout_applied: true
unmatched_holdout_reason: weak_dimension_only_noise_rejected
belief_movement: none
```

## Expected test URL

```text
https://42ndmoose.github.io/42ndMind/kernel-intention-language-to-formula-expanded-benchmark-v0-1-2-test.html?v=parser-3
```

Expected result:

```text
8/8 passed
```

## Expected UI URL

```text
https://42ndmoose.github.io/42ndMind/intention-language-to-formula-expanded-benchmark-v0-1-2.html?v=parser-3
```

Expected metrics:

```text
Decision: EXPANDED_LANGUAGE_TO_FORMULA_READY_V0_1_2
Parse cases: 27
Labelled: 22
Ambiguity: 3
Unmatched: 2
Holdouts: 2
```

## What this proves

This patch proves the expanded parser can reject weak formula matches caused by isolated structural vocabulary in negative controls.

It preserves:

```text
candidate only
no real-world attribution
no belief/world-model ledger
no doctrine promotion
ambiguity visible
unmatched controls held out
belief_movement: none
```

## Suggested next task

After this passes, the next layer is still expanded parser proof trace v0.1.1/v0.1.2.

Reason:

```text
The expanded parser now covers 27 cases.
The proof trace layer should explain all accepted cases and produce holdout traces for unmatched negative controls.
```

Suggested files:

```text
src/kernel-intention-parser-proof-trace-v0-1-1-patch.js
kernel-intention-expanded-parser-proof-trace-v0-1-1-test.html
intention-expanded-parser-proof-trace.html
HANDOFF_2026_05_18_INTENTION_EXPANDED_PARSER_PROOF_TRACE.md
```

## Do not do yet

Do not build political/narrative belief storage.

Do not build a claim/world-model ledger.

Do not make the language brain decide what is propaganda.

Do not promote parsed benchmark results to doctrine.
