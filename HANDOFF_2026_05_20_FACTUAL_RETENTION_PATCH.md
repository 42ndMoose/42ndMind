# HANDOFF 2026-05-20: Factual Claim Retention Patch v0.1.1

## Scope

This handoff records the fix for the first combined factual-claim/question-appetite test failure.

User reported:

```text
9/10 passed
communication acknowledges factual candidate without final truth use failed
error: wrong fact communication kind
```

Diagnosis:

```text
The factual claim was being structured correctly, but communicationCore.current_message was overwritten by another later pressure, most likely generic formula parse or question-appetite pressure.
```

Correction:

```text
Current factual-claim acknowledgement should be retained over generic parse drift and lower-priority verification questions when the latest input is itself a factual claim.
```

This is not a connector. It is a retention/priority correction inside the same live-state pressure path.

## Built file

```text
src/epistemic-kernel-factual-claim-intake-v0-1-1-patch.js
```

## Updated files

```text
epistemic-factual-question-v0-1-test.html
llm-brain-v0-3-factual-question-v0-1.html
```

Both now load:

```text
src/epistemic-kernel-factual-claim-intake-v0-1-1-patch.js?v=fact-2
```

## Test URL

Open with cache bust:

```text
https://42ndmoose.github.io/42ndMind/epistemic-factual-question-v0-1-test.html?v=fact-qapp-2
```

Expected:

```text
10/10 passed
```

The corrected failing test now checks:

```text
comm().current_message.thought_kind === factual_claim_candidate_acknowledgement
comm().current_message.retention_patch_applied === true
```

## Live URL

Open with cache bust:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-factual-question-v0-1.html?v=fact-qapp-live-2
```

## What it consumes

```text
latest runtime event raw text
state.languageMathCore.factual_claim_candidates
state.communicationCore.current_message
state.languageMathCore.communication_pressure
```

## What it produces

Inside `state.languageMathCore`:

```text
factual_claim_intake_patch_version: 0.1.1
factual_retention_log
live_thought if retained
communication_pressure retained fact acknowledgement pressure
```

Inside `state.communicationCore`:

```text
current_message = factual_claim_candidate_acknowledgement when latest input is a factual claim and no higher-priority self-state/semantic-conflict/learning-priority message should override it
selected_pressure = selected_by_factual_acknowledgement_retention
```

## Retention rule

Retain factual acknowledgement over:

```text
generic formula_parse_statement
lower-priority verification question
loose conversation context fallback
```

Do not override:

```text
direct_self_state_answer
semantic_conflict_question
higher-priority learning_priority_question
```

## Doctrine

```text
factual_claim_acknowledgement_retention: true
current_factual_claim_acknowledgement_should_not_be_overwritten_by_generic_parse: true
current_factual_claim_acknowledgement_should_not_be_overwritten_by_lower_priority_verification_question: true
retention_is_priority_arbitration_not_connector: true
no_final_truth_promotion: true
belief_movement: provisional_only
```

## Next suggested layer

After this test passes, the next real layer remains:

```text
unified attention arbitration v0.1
```

Purpose:

```text
Replace local retention patches with one general pressure-selection discipline across self-state answers, semantic conflicts, factual claims, question appetite, curiosity, learning drive, belief-memory reactions, and maturity recovery pressure.
```

Do not build final truth promotion next.
