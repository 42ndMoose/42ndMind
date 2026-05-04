# 42ndMind v1.8.1 No-Action Fallback Patch

Date: 2026-05-04

## Purpose

This patch prevents custom scenario batch runs from crashing when the runtime creates an investigation plan with no actionable next step.

The bug found during v1.9 scenario generation was:

```text
plan
→ next creates no investigation action
→ scenarioRunner still calls answer({ actionSelector: "latest" })
→ no open action exists
→ run-scenarios-file crashes before combined dataset export
```

## Change

When no next investigation action exists, `createNextInvestigationAction` now records a `noActionEvent` and a belief update instead of returning unchanged memory.

The scenario runner now checks `next.action` before calling `answer latest`.

```text
if next.action exists:
  answer latest normally
else:
  skip answer intake
  record the no-action event in the scenario result
  continue to export traces, SFT rows, preference rows, validation, quality audit, and combined manifest
```

## Expected Result

Broader motive/deception/scope scenario batches should no longer crash just because a scenario creates no open investigation action.

Those scenarios may still fail quality gates, which is acceptable. The important fix is that the batch continues and produces:

```text
combined_alignment_sft.jsonl
combined_preference_pairs.jsonl
combined_manifest.json
excluded_scenarios.json
scenario_summary.json
```

## Validation Run

A 50-scenario broad test completed after the patch.

Result:

```text
scenario_count: 50
included_scenarios: 5
excluded_scenarios: 45
sft_rows: 25
preference_rows: 25
```

Interpretation:

- The crash is fixed.
- The extractor/planner is still narrow.
- Most broader scenarios are excluded by quality gating.
- The next improvement should expand extraction, contradiction detection, motive modeling, and planning coverage.

## Files Changed

```text
src/memory/memoryStore.js
src/cognition/investigationActionManager.js
src/runtime/agent.js
src/runtime/scenarioRunner.js
```
