
# 42ndMind

v1.8.1 adds a no-action fallback so broad scenario batches do not crash when no investigation action is created. v1.8 added quality-gated scenario dataset combining.

42ndMind is a persistent epistemic memory and investigative runtime shell.

It is meant to sit above a base LLM and optional LoRA adapter. It stores claims, detects epistemic tension, keeps live hypotheses, creates inquiry tasks, records belief updates, and now accepts evidence.

## Project split

- `philosophers-stone`: deterministic instrument / profiler / visualizer.
- `42ndAlignment`: model training lab / SFT / LoRA / future preference training.
- `42ndMind`: runtime memory / inquiry loop / epistemic agent shell.


## v1.8.1 change

The scenario runner now handles no-action cases gracefully. Previously, broader scenarios could produce no investigation action, but `runScenario` still called `answer({ actionSelector: "latest" })`, causing the batch run to crash before combined dataset export.

Now, when `agent.next()` produces no action:

- a `noActionEvent` is recorded in memory,
- a belief update records the no-action condition,
- the scenario skips action-answer intake,
- traces/datasets/validation/audit still run,
- the batch continues and produces combined dataset files.

Run the regression test:

```bash
npm run test:no-action
```

This patch fixes the batch crash. It does not make the extractor broad yet. Many broader scenarios may still be excluded by quality gating until extractor/planner coverage improves.

## v1.8 MVP

This version adds:

- persistent `tensions`
- evidence intake
- confidence updates from evidence
- inquiry task status updates when evidence is added
- contradiction-aware evidence propagation
- automatic contradiction review after evidence is added
- stronger weakening of an older contradicted claim when evidence supports the later contradictory claim
- contradiction status changes such as `resolved_evidence_weighted` or `evidence_weighted_unresolved`
- better inspection summary through CLI

## Run

```bash
npm install
npm run demo
```

Manual commands:

```bash
npm run reset
npm run think -- "I never borrowed the money."
npm run think -- "Actually, I borrowed the money last week but already returned it."
npm run evidence -- latest supports "There is a transfer receipt showing repayment."
npm run export-traces
npm run export-alignment
npm run export-preferences
npm run run-scenarios
npm run run-scenarios-file -- data/example_scenarios.json
npm run audit
npm run validate-datasets
npm run export-bundle
npm run inspect
```

You can also attach evidence to a specific claim ID:

```bash
npm run evidence -- claim_abc123 weakens "The timestamp conflicts with the claimed timeline."
```

## Current limitation

The extractor and evidence strength model are still rule-based toys. Replace `src/llm/extractorClient.js` with a real structured LLM extractor later.


## v0.4.1 cleanup

When contradiction evidence resolves an older claim as weakened:

- duplicate evidence IDs are prevented
- related stale tension tasks are marked `superseded_by_contradiction_resolution`
- hypotheses attached to the winning claim are marked `strengthened_by_evidence`
- hypotheses attached to the weakened claim are marked `weakened_by_opposing_evidence`


## v0.5 change

Hypotheses now have `hypothesis_type`.

Evidence no longer blanket-strengthens every hypothesis attached to the winning claim. The runtime now updates hypothesis confidence differently depending on whether the hypothesis is:

- `claim_accurate`
- `claim_incomplete_or_mistaken`
- `correction_or_repair`
- `deception_memory_or_wording_shift`
- `earlier_false_overbroad_or_contextual`

This makes the memory less naive because it starts distinguishing evidence for a claim from evidence for a specific explanation.


## v0.6 change

The runtime now generates `motiveModels` when contradictions appear.

This moves the system from:

```text
What claim is more likely true?
```

toward:

```text
Why did the contradiction happen?
```

Motive types currently include:

- `correction_or_clarification`
- `avoid_blame_or_consequence`
- `memory_error`
- `wording_or_scope_shift`
- `strategic_deception`

Evidence can update motive confidence, but the system avoids treating evidence for a claim as proof of motive.


## v0.7 change

The runtime now generates `investigationPlans`.

This is the first version where the system turns stored epistemic pressure into a next action plan. It can identify that a claim contradiction is mostly resolved while motive/context remains unresolved, then propose discriminating questions and evidence requests.


## v0.8 change

The runtime now converts an investigation plan into a concrete `investigationAction`.

It can also store an answer to that action through:

```bash
npm run answer -- "answer text"
```

The answer is currently stored as evidence-like context. A later LLM extractor should classify how that answer changes claims, hypotheses, motives, and contradictions.


## v0.9 change

The runtime now classifies the answer to an investigation action.

For the demo answer:

```text
The earlier denial meant I do not currently owe money, not that I had never borrowed it before.
```

v0.9 identifies this as:

```text
scope_clarification_current_owed_vs_ever_borrowed
```

Then it updates motive and hypothesis confidence:

- strengthens `wording_or_scope_shift`
- strengthens `correction_or_clarification`
- weakens `strategic_deception`
- marks the contradiction as `resolved_scope_clarified`


## v1.0 change

The runtime can now export training traces.

```bash
npm run export-traces
```

This writes JSONL to:

```text
data/training_traces.local.jsonl
```

The exported traces are meant for `42ndAlignment` as SFT-style examples. Each trace includes:

- an instruction
- structured input
- structured target
- a `messages` array compatible with chat-style SFT conversion

This is the bridge from external runtime behavior into future LoRA/RL training.


## v1.1 change

The runtime can now export a cleaner SFT dataset for `42ndAlignment`.

```bash
npm run export-alignment
```

This writes:

```text
data/alignment_sft.local.jsonl
data/alignment_manifest.local.json
```

The JSONL rows contain:

```json
{
  "messages": [],
  "metadata": {}
}
```

This keeps the full runtime trace export separate from the training-ready alignment dataset.


## v1.2 change

The runtime can now export synthetic preference pairs:

```bash
npm run export-preferences
```

This writes:

```text
data/preference_pairs.local.jsonl
data/preference_manifest.local.json
```

Each row contains:

```json
{
  "prompt": [],
  "chosen": "",
  "rejected": {
    "content": "",
    "reason": ""
  },
  "metadata": {}
}
```

The rejected answers are synthetic epistemic failures, such as naive acceptance, premature accusation, vague follow-up, and failure to classify an investigation answer.

These are not required for SFT. They are a seed format for future DPO, ORPO, or GRPO experiments.


## v1.3 change

The runtime can now validate exported datasets:

```bash
npm run validate-datasets
```

It can also export a portable bundle for `42ndAlignment`:

```bash
npm run export-bundle
```

This writes:

```text
data/42ndAlignment_bundle.local/
  alignment_sft.jsonl
  alignment_manifest.json
  preference_pairs.jsonl
  preference_manifest.json
  dataset_validation_report.json
  README.md
```

This is the first version that gives you a clean handoff package from 42ndMind into 42ndAlignment.


## v1.4 change

The runtime can now run multiple built-in scenarios:

```bash
npm run run-scenarios
```

This writes:

```text
data/scenario_runs.local/
  scenario_summary.json
  combined_alignment_sft.jsonl
  combined_preference_pairs.jsonl
  money_scope_clarification/
  phone_definition_clarification/
  book_memory_error/
```

The purpose is to grow the dataset beyond one toy example. Each scenario runs the full loop and exports both SFT rows and synthetic preference pairs.


## v1.5 change

The runtime can now run custom scenario files:

```bash
npm run run-scenarios-file -- data/example_scenarios.json
```

Scenario files can be either an array or an object with a `scenarios` array.

Required scenario fields:

```json
{
  "id": "scenario_id",
  "description": "optional description",
  "firstClaim": "I never borrowed the money.",
  "secondClaim": "Actually, I borrowed it last week but already returned it.",
  "evidence": {
    "direction": "supports",
    "text": "There is a receipt."
  },
  "actionAnswer": "The earlier denial meant I do not currently owe money."
}
```

This makes the dataset growable without editing source code.


## v1.6 change

Action-answer classification now cleans up inquiry tasks linked to the resolved contradiction.

This fixes the issue where custom scenarios could finish with open inquiry tasks even after the answer classified the contradiction as a scope, definition, or memory clarification.

It also improves rule coverage for:

- `returned them`
- `brought it back`
- `timestamped`
- `library record`
- `parking record`
- `do not currently have`


## v1.7 change

The runtime now has a quality audit:

```bash
npm run audit
```

Scenario runs also include:

```json
{
  "quality_status": "pass",
  "quality_score": 1
}
```

The audit checks for stale open inquiry tasks, unresolved contradictions, missing action-answer classifications, missing training-ready state, and missing belief-update trails.


## v1.8 change

Scenario batch exports are now quality-gated.

Combined datasets now include only scenarios where both checks pass:

```text
validation_status = pass
quality_status = pass
```

The scenario batch now also writes:

```text
combined_manifest.json
excluded_scenarios.json
```

This prevents low-quality or partially unresolved scenarios from silently entering the combined SFT/preference datasets.
