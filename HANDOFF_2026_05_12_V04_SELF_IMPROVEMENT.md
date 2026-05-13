# 42ndMind v0.4 Self-Improvement Handoff — 2026-05-12

This handoff records the current self-improvement chain after sandbox comparison passed in browser testing.

## User-verified tests

The user reported these passed:

- `kernel-motivation-v0-4-test.html` — patched version expected **13/13 passed**
- `kernel-promotion-pipeline-v0-4-test.html` — patched version expected **12/12 passed**
- `kernel-patch-candidate-v0-4-test.html` — expected **13/13 passed**
- `kernel-runtime-candidates-v0-4-test.html` — expected **15/15 passed**
- `kernel-runtime-activation-v0-4-test.html` — expected **15/15 passed**
- `kernel-test-suite-v0-4-activation.html` — expected **7/7 passed**
- `kernel-sandbox-comparison-v0-4-test.html` — expected **12/12 passed**
- `kernel-sandbox-comparison-review.html` — manual review flow worked as intended:
  - stage sample candidate
  - run sandbox comparison
  - expected `PASS_NO_BEHAVIOR_DELTA`
  - run with simulated drift
  - expected `BLOCK_BEHAVIOR_DRIFT`

## Current self-improvement chain

The current chain is:

```text
self-maintenance observation
→ proposal generation
→ promotion evaluation
→ patch/runtime plan generation
→ runtime candidate staging
→ supplied-test-packet activation
→ sandbox baseline-vs-candidate comparison
→ review/export packet
```

This is not yet autonomous source editing. It is a safe self-improvement pipeline up to reviewable candidate staging and sandbox comparison.

## Implemented modules

### Motivation

Files:

- `src/kernel-motivation-v0-4.js`
- `src/kernel-motivation-v0-4-1-patch.js`
- `kernel-motivation-v0-4-test.html`

Effective version:

- `KernelMotivationV04.VERSION === "0.4.1"`

Purpose:

Turns epistemic immaturity into pressure signals: contradiction pressure, unresolved pressure, overconfidence pressure, source-contact hunger, falsifiability hunger, integration pressure, self-stability pressure, intention-clarity pressure, and optimality pressure.

Important doctrine:

- motivation is preference gradient, not emotion
- peak is attractor, not slogan
- pressure reduction must be earned
- motivation does not decide truth
- motivation does not bypass the governor
- motivation does not auto-promote rules

### Promotion pipeline

Files:

- `src/kernel-promotion-pipeline-v0-4.js`
- `src/kernel-promotion-pipeline-v0-4-1-patch.js`
- `kernel-promotion-pipeline-v0-4-test.html`

Effective version:

- `KernelPromotionPipelineV04.VERSION === "0.4.1"`

Purpose:

Evaluates self-maintenance proposals as:

- `PROMOTE_RUNTIME_CANDIDATE`
- `PATCH_CANDIDATE_ONLY`
- `HOLD_FOR_MORE_EVIDENCE`
- `BLOCK_PROMOTION`

Important v0.4.1 distinction:

A governor `CAP_MATURITY` result is preserved as caution, but it does not block disabled candidate staging. It blocks final unchecked promotion, not candidate planning.

### Patch candidate planner

Files:

- `src/kernel-patch-candidate-v0-4.js`
- `kernel-patch-candidate-v0-4-test.html`

Version:

- `KernelPatchCandidateV04.VERSION === "0.4.0"`

Purpose:

Turns promotion outcomes into explicit plans:

- `RUNTIME_PLAN_READY`
- `PATCH_PLAN_READY`
- `HOLD_NOT_READY`
- `BLOCKED`

Important doctrine:

- plan is not patch application
- no source write in browser runtime
- tests required before promotion
- rollback must remain available
- protected core cannot be rewritten directly

### Runtime candidate staging

Files:

- `src/kernel-runtime-candidates-v0-4.js`
- `kernel-runtime-candidates-v0-4-test.html`
- `kernel-runtime-candidate-review.html`

Version:

- `KernelRuntimeCandidatesV04.VERSION === "0.4.0"`

Storage key:

- `42ndMind_runtime_candidates_v0_4`

Purpose:

Stages approved runtime plans into a disabled review queue.

Candidate statuses:

- `STAGED_DISABLED`
- `ENABLED_METADATA_ONLY`
- `DISABLED`
- `REJECTED`

Important doctrine:

- staged candidate is not enabled behavior
- enablement is metadata-only
- no source write
- no auto-execution
- protected core cannot be changed by candidate

### Runtime activation

Files:

- `src/kernel-runtime-activation-v0-4.js`
- `kernel-runtime-activation-v0-4-test.html`
- `kernel-test-suite-v0-4-activation.html`

Version:

- `KernelRuntimeActivationV04.VERSION === "0.4.0"`

Purpose:

Validates supplied test result packets before metadata-only activation.

Requirements:

- candidate staged
- at least one local/module test packet passed
- integrated v0.4 suite packet passed
- no supplied test packet failed
- manual review flag set

Important limitation:

This module does not run tests by itself. It only checks supplied result packets.

### Sandbox comparison

Files:

- `src/kernel-sandbox-comparison-v0-4.js`
- `kernel-sandbox-comparison-v0-4-test.html`
- `kernel-sandbox-comparison-review.html`

Version:

- `KernelSandboxComparisonV04.VERSION === "0.4.0"`

Purpose:

Compares baseline `KernelBrainV04.process(input)` against candidate-shadow behavior.

The candidate shadow is annotation-only and does not execute candidate behavior.

Core drift fields:

- `final_decision`
- `belief_movement`
- `near_null`
- `allowed_for_belief_pressure`
- `input_kind`
- `probability_report.probability`
- `consistency_report.decision`
- `sanitized_command` presence

Expected decisions:

- `PASS_NO_BEHAVIOR_DELTA`
- `BLOCK_BEHAVIOR_DRIFT`
- `BLOCK_UNSAFE_CANDIDATE`
- `HOLD_REVIEW_REQUIRED`

## Current architecture status

The kernel can now:

- observe runtime/state patterns
- generate self-maintenance proposals
- evaluate proposal safety
- produce runtime or patch plans
- stage disabled runtime candidates
- metadata-enable candidates after supplied test packets and manual review
- compare baseline behavior against candidate-shadow behavior
- block unsafe candidates or behavior drift

The kernel still cannot:

- write source files by itself
- run real browser tests by itself
- fetch GitHub blob SHAs
- apply GitHub patches
- fetch back files to verify exact source changes
- rollback source code automatically

## Next recommended module

Next build should be a source patch bridge planner, not a source writer:

Suggested files:

- `src/kernel-source-patch-bridge-v0-4.js`
- `kernel-source-patch-bridge-v0-4-test.html`

Purpose:

Turn `PATCH_PLAN_READY` outputs into GitHub-safe patch application packets.

It should not write source files. It should produce a strict checklist / machine-readable packet:

- target file path
- expected current SHA required
- intended edit summary
- full replacement or patch mode
- tests to run after write
- fetch-back verification requirement
- rollback file/path strategy
- blocked if target is protected core
- blocked if no tests are listed
- blocked if sandbox comparison failed

Doctrine:

```text
patch bridge plans writes
external GitHub tool performs writes
fetch-back verifies writes
browser kernel never writes source directly
```

## Suggested next flow

```text
PATCH_PLAN_READY
→ source patch bridge packet
→ external GitHub SHA/write/fetch-back flow
→ browser tests
→ activation/sandbox packet
→ handoff update
```

This is the next step toward self-maintenance without pretending the browser kernel can safely edit its own source directly.
