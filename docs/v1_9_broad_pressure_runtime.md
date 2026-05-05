# 42ndMind v1.9 Broad Epistemic Pressure Runtime

Date: 2026-05-04

## Purpose

v1.9 expands the rule-based runtime beyond the original borrow/return/memory examples.

v1.8.1 fixed the crash where broad scenario batches stopped when no investigation action existed. v1.9 improves the upstream rule coverage so broader motive, deception, scope, timeline, accusation, certainty, and self-sealing scenarios can produce training-ready traces instead of being mostly excluded by the quality gate.

## Main Result

The broad 50-scenario test now completes without crashing and passes the quality gate for all scenarios.

```text
scenario_count: 50
included_scenarios: 50
excluded_scenarios: 0
sft_rows: 250
preference_rows: 250
```

The test scenario file is:

```text
data/v2_0_broad_test_scenarios.json
```

The local output folder used during testing was:

```text
data/v2_0_broad_patch_test.local/
```

## Coverage Added

The rule-based extractor now recognizes broader objects and claim kinds, including:

```text
charger
laptop
wallet
form
messages / texts / conversation
wrongdoing
motive
understanding
belief
whereabouts
```

It also recognizes broader epistemic claim patterns:

```text
false certainty
evidence gap admission
mistaken accusation
recovered object
wrongdoing denial
reputation management admission
deadline/timeline mismatch
partial truth
motive attribution
alternative explanation
whereabouts contradiction
concealment admission
self-sealing disagreement claim
self-sealing counterevidence claim
```

## Tension and Contradiction Coverage

The tension detector now identifies broad contradiction types such as:

```text
possible_contradiction_timeline_deadline
possible_contradiction_reputation_management
possible_contradiction_accusation_weakened
possible_contradiction_motive_alternative
possible_contradiction_overconfidence_evidence_gap
epistemic_contradiction_self_sealing_logic
possible_contradiction_whereabouts
possible_contradiction_return_vs_possession
possible_contradiction_partial_truth
```

These are still rule-based approximations. They are not a replacement for a structured LLM extractor.

## Planning Coverage

The planner now includes a dedicated self-sealing audit plan.

When a self-sealing contradiction is detected, the system creates a high-priority plan asking what evidence could count against the belief rather than being absorbed as proof of itself.

This helps self-sealing scenarios produce a real investigation action and action-answer classification instead of remaining unresolved.

## Action Answer Classification Added

The classifier now recognizes broader action-answer types:

```text
partial_truth_correction
avoidance_or_reputation_management
mistaken_accusation_correction
timeline_correction
motive_alternative_supported
certainty_reduction_after_evidence_gap
self_sealing_logic_identified
```

These classifications close the relevant contradiction and update motive/hypothesis confidence.

## Why This Matters for 42ndAlignment

v1.9 is the first runtime version that can generate a broad dataset candidate without relying only on safe borrow/return examples.

The next alignment dataset should likely be stored under:

```text
42ndAlignment/datasets/42ndmind/v2_0/
```

That dataset should come from the v1.9 broad scenario runtime, not from the earlier v1.9-safe4 bridge dataset.

## Remaining Limitations

This is still rule-based.

The system can now complete and quality-pass broader synthetic scenarios, but the extractor and classifier are still hand-written pattern matchers. The next major upgrade should be a structured LLM extractor with a deterministic schema.

Recommended next work:

```text
1. Generate a real v2_0 broad dataset from 42ndMind v1.9.
2. Move the combined SFT/preference files into 42ndAlignment.
3. Train a new Qwen 0.5B adapter.
4. Compare base vs v1_9-safe4 adapter vs v2_0 broad adapter.
5. Replace rule-based extraction with a structured LLM extractor.
```
