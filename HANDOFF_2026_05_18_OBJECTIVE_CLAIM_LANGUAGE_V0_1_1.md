# HANDOFF 2026-05-18: Objective Claim-Language Kernel v0.1.1

## Scope

This handoff records the v0.1.1 patch for the objective claim-language kernel.

The v0.1 test reported `7/8 passed` because the stricter dependency test expected the motive-overclaim sample to emit a `motive_evidence_required` dependency.

The analysis packet itself validated as `ok: true`, and the truth status was correct:

```text
claim_motive_overclaim_001
truth_status_candidate: narrative_overclaim_pressure_candidate
```

But the claim kind was incorrectly classified as:

```text
causal_claim
```

because the base classifier checked generic causal markers such as `because` before hidden-motive markers such as `secretly`, `wanted`, `hidden_motive_claim`, `mind_reading`, and `only_because`.

## Patch decision

The v0.1.1 patch adds a wrapper module that prioritizes hidden-motive markers over generic causal markers.

This preserves the truth-status output while fixing the dependency structure.

## Built files

```text
src/kernel-objective-claim-language-v0-1-1-patch.js
kernel-objective-claim-language-v0-1-1-test.html
objective-claim-language-v0-1-1.html
HANDOFF_2026_05_18_OBJECTIVE_CLAIM_LANGUAGE_V0_1_1.md
```

## Runtime/cache keys

The patched test/page load:

```text
src/kernel-objective-claim-language-v0-1.js?v=claim-1
src/kernel-objective-claim-language-v0-1-1-patch.js?v=claim-2
```

Use `claim-2` URLs for this patch.

## Added doctrine guards

```text
motive_markers_outrank_generic_causal_markers: true
hidden_motive_claim_requires_motive_evidence_dependency: true
patch_version: 0.1.1
```

## Corrected behavior

For:

```text
They only changed the rule because they secretly wanted control.
```

The patched result should be:

```text
claim_kind: motive_attribution_claim
truth_status_candidate: narrative_overclaim_pressure_candidate
dependency includes: motive_evidence_required
dependency does not include: causal_bridge_required
```

This means the kernel now distinguishes:

```text
because + ordinary event sequence -> causal_claim
because + hidden motive language -> motive_attribution_claim
```

## Browser test

Open:

```text
https://42ndmoose.github.io/42ndMind/kernel-objective-claim-language-v0-1-1-test.html?v=claim-2
```

Expected result:

```text
8/8 passed
```

The patched 8 test groups are:

```text
1. modules load and doctrine uses unified objective language grammar with motive priority
2. claim language v0.1.1 runs without LLM or source lookup
3. all eight expected truth statuses match
4. motive overclaim is motive-attribution and emits motive dependency
5. evidence support, corroboration, and unsupported unresolved statuses are detected
6. contradiction, narrative, propaganda, and causal pressure are detected without resolving truth
7. ambiguity remains unresolved and user context is not auto-truth
8. dependencies, candidate-only status, and belief movement are preserved
```

## UI page

Open:

```text
https://42ndmoose.github.io/42ndMind/objective-claim-language-v0-1-1.html?v=claim-2
```

Expected metrics:

```text
Decision: OBJECTIVE_CLAIM_LANGUAGE_READY_V0_1_1
Claims: 8
LLM used: false
Source lookup: false
Motive fix: true
```

## What this proves

The objective claim-language layer now handles a key narrative/truth distinction:

```text
causal structure
vs.
hidden-motive attribution
```

This matters because propaganda and narrative pressure often hide inside causal grammar.

The kernel now prevents `because` from overpowering hidden-motive semantics when motive markers are present.

## Preserved invariants

```text
claims/world-models/narratives remain inside the same objective language grammar
external anchors remain modular registries
structured user context is not auto-truth
contradiction detection is not contradiction resolution
narrative pressure is detected without deciding hidden motive
no LLM
no source lookup
candidate only
belief_movement: none
```

## Suggested next task

After this passes, build objective claim trace v0.1.

Suggested files:

```text
src/kernel-objective-claim-trace-v0-1.js
kernel-objective-claim-trace-v0-1-test.html
objective-claim-trace.html
HANDOFF_2026_05_18_OBJECTIVE_CLAIM_TRACE.md
```

Expected purpose:

```text
Generate proof-style traces for each claim analysis, including why context is not auto-truth, why contradiction is not resolved, and why narrative pressure is structural pressure rather than hidden-motive proof.
```
