
# Memory Schema

Persistent memory currently stores:

- `claims`
- `evidence`
- `tensions`
- `contradictions`
- `hypotheses`
- `inquiryTasks`
- `beliefUpdates`

## v0.3 change

`tensions` are now stored directly. In v0.2, inquiry tasks could reference non-contradiction tensions that were not persisted. v0.3 fixes that.

Evidence can now be attached to a claim. Adding evidence updates claim confidence and marks related inquiry tasks as `evidence_added_review_needed`.


## v0.4 change

Evidence now propagates across contradictions. If evidence supports one side of a contradiction, the opposing claim can be weakened. A contradiction can move to `evidence_weighted_unresolved` or `resolved_evidence_weighted`.


## v0.4.1 change

Evidence IDs are deduplicated in tasks and contradiction review histories. Stale inquiry tasks linked to a losing claim can now be superseded after the contradiction is resolved.


## v0.5 change

Hypotheses now include `hypothesis_type`, `evidence_items`, and `last_confidence_update`. Evidence can support a claim without equally supporting every possible explanation for that claim.


## v0.6 change

Memory now includes `motiveModels`. A motive model is not a fact claim; it is a live explanation for why a contradiction occurred.


## v0.7 change

Memory now includes `investigationPlans`. A plan turns unresolved motive/context uncertainty into concrete next actions.


## v0.8 change

Memory now includes `investigationActions`. These are concrete questions or checks generated from an investigation plan. User answers are stored as evidence-like contextual items.


## v0.9 change

Memory now includes `actionAnswerClassifications`. These classify user responses to investigation actions and apply effects to claims, hypotheses, motives, and contradictions.


## v1.0 change

The runtime can export SFT-style JSONL training traces derived from memory.


## v1.1 change

The runtime can export `42ndAlignment`-ready SFT rows with `messages` and `metadata`.


## v1.2 change

The runtime can export synthetic chosen/rejected preference pairs for future DPO, ORPO, or GRPO experiments.


## v1.3 change

Dataset exports can now be validated and packaged into a 42ndAlignment-ready bundle.


## v1.4 change

Scenario runs can now generate multiple independent memory files and combined dataset exports.


## v1.5 change

Scenario batches can now be generated from custom JSON files. This allows dataset growth without editing source code.


## v1.6 change

Action-answer classifications now update related inquiry task statuses, not only contradictions and motives.


## v1.7 change

Scenario outputs now include quality audit reports.


## v1.8 change

Combined scenario datasets are now quality-gated. Failed scenarios are excluded and listed in `excluded_scenarios.json`.
