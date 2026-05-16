# 42ndMind Current Progress

Last updated: **2026-05-16**.

Read this file first for the current operational state. Older handoffs may still be useful for background, but this file is newer for the semantic operator / pressure / vector-template pipeline.

## Current focus

Semantic operator / pressure / vector-template pipeline for 42ndMind.

Live pages involved:

```text
semantic-operator-workbench.html
semantic-corpus-combiner.html
semantic-language-distiller.html
semantic-vector-compressor.html
semantic-vector-template-planner.html
kernel-semantic-vector-template-planner-v0-1-test.html
```

## Current corpus target

```text
combined entries: 119
duplicates skipped: 0
source packets: 11
last status: combined
belief movement: none
```

Source breakdown:

```text
main: 32 entries
extension_1: 6 entries
extension_2: 6 entries
extension_3: 9 entries
extension_4: 4 entries
extension_5: 10 entries
extension_6: 2 entries
extension_7: 10 entries
extension_8: 16 entries
extension_9: 20 entries
extension_10: 4 entries
```

Current extension list:

```text
data/semantic_seed_closure_contrast_v0_1.json
data/semantic_seed_authority_evidence_contrast_v0_1.json
data/semantic_seed_motive_agency_weakmap_contrast_v0_1.json
data/semantic_seed_scope_qualification_contrast_v0_1.json
data/semantic_seed_closure_source_gap_contrast_v0_1.json
data/semantic_seed_unverified_contrast_v0_1.json
data/semantic_seed_rhetoric_intent_pressure_v0_1.json
data/semantic_seed_vector_template_contrast_v0_1.json
data/semantic_seed_vector_template_contrast_v0_2.json
data/semantic_seed_accusation_risk_direct_evidence_v0_1.json
```

## Latest seed packet

Latest added packet:

```text
data/semantic_seed_accusation_risk_direct_evidence_v0_1.json
```

It contains exactly these four accepted workbench sentences:

```text
The post makes a serious accusation without showing a direct evidence link.
The article recklessly accused the official of misconduct without direct evidence.
The report recklessly accused the named target of misconduct without direct evidence.
The claim accuses the person of wrongdoing, but the direct evidence link is still missing.
```

Expected mapping:

```text
operator: reckless_accusation(actor,target,claim)
pressures:
- accusation_pressure
- evidence_gap_pressure
- reputational_risk_pressure
- direct_link_evidence_burden
```

Do not reuse this rejected earlier batch:

```text
The post makes a serious accusation, but the direct evidence link has not been shown.
The allegation names a target before separating suspicion from proof.
The claim could damage the person’s reputation, so the actor, action, and evidence must be made explicit.
The report alleges misconduct, but the cited record only shows an unresolved evidence gap.
```

## Planner state

Latest planner patch:

```text
src/kernel-semantic-vector-template-planner-v0-1-2-patch.js
```

Planner page should load:

```text
src/kernel-semantic-vector-template-planner-v0-1.js?v=0.1.0
src/kernel-semantic-vector-template-planner-v0-1-1-patch.js?v=0.1.1
src/kernel-semantic-vector-template-planner-v0-1-2-patch.js?v=0.1.2
```

`semantic-vector-template-planner.html` loads that patch stack and should emit natural accusation-risk sentences, not symbolic fallback lines such as `This wording triggers ...`.

## Changes made in the latest pass

The semantic combiner default extension list now includes the accusation-risk packet. The combiner also merges stale explicit extension lists with current defaults before loading, so older pages/tests should not silently omit the newest packet.

These pages now visibly include all 10 extension URLs and load the combiner with `?v=0.1.1`:

```text
semantic-corpus-combiner.html
semantic-language-distiller.html
semantic-vector-compressor.html
semantic-vector-template-planner.html
```

These tests have been updated toward the 119-entry state:

```text
kernel-semantic-corpus-combiner-v0-1-test.html
kernel-semantic-vector-compressor-v0-1-test.html
kernel-semantic-vector-template-planner-v0-1-test.html
```

Recent commits:

```text
19245e01139e4ad7ce07005182dd81e7f10c30ae Include accusation-risk packet in semantic combiner defaults
a22e189c95ce2ac9ebaf3f901a0d041be86577f7 Guard semantic combiner against stale extension lists
e050dc072ebb5a0803b0724f18958b69db9479d6 Update vector template planner test for 119-entry corpus
1a352e679f88406e2358c6bd8edf3d73cc70199d Show current semantic extension list in combiner page
9ea08c9e8a841e969bf91937136ed9fe20c7baf6 Show current semantic extension list in vector compressor
0ed725e03cf6164d8e75061b80f04458ae684256 Show current semantic extension list in vector template planner
80ca3d5ae4f0482b1786d2f85e366d99397f6909 Update semantic combiner test for 119-entry corpus
dfcdf0b00e0c4636600236451fb02b142b786ebc Update vector compressor test for 119-entry corpus
3ef338751b307a5c0ce7de6b26b4ae3e49d12b57 Show current semantic extension list in language distiller
```

## Required browser verification

Run with a cache buster if needed, for example `?v=2026-05-16-119`.

1. `semantic-corpus-combiner.html`

Expected:

```text
combined entries: 119
duplicates skipped: 0
source packets: 11
last status: combined
```

2. `semantic-language-distiller.html`

Expected likely state:

```text
entries: 119
operators: around 100+
pressures: 55
contrast gaps: 0
overmatch risks: 0
belief movement: none
```

3. `semantic-vector-compressor.html`

Expected likely state:

```text
vectors: 119
candidate templates: at least 20 or around there
ontology missing: 0
belief movement: none
```

4. `semantic-vector-template-planner.html`

Expected:

```text
vectors: 119
no selected symbolic fallback suggestions like "This wording triggers ..."
no selected pressure-signature fallback lines
accusation-risk suggestions stay natural and match the accepted four-sentence batch
belief movement: none
```

5. Run these updated tests and record exact pass counts:

```text
kernel-semantic-corpus-combiner-v0-1-test.html
kernel-semantic-vector-compressor-v0-1-test.html
kernel-semantic-vector-template-planner-v0-1-test.html
```

Known stale tests/docs still needing update after browser verification:

```text
kernel-semantic-language-distiller-v0-1-test.html
kernel-semantic-language-certificate-v0-1-test.html
semantic-language-certificate.html
```

## Doctrine invariants

```text
workbench outputs are drafts, not doctrine
matched operators are candidate readings
pressure labels do not move belief
vector compression is diagnostic, not truth
templates are candidate reuse units, not doctrine
no automatic doctrine promotion
belief movement remains none unless explicit legitimacy conditions are satisfied
```

Current architecture:

```text
surface phrase
→ semantic operator
→ pressure labels
→ pressure ontology
→ evidence burden
→ blocked/allowed belief movement
```

## SHA write trick

For existing files:

```text
1. Fetch file first.
2. Use current blob SHA.
3. update_file with full replacement content and that SHA.
4. Wait for commit_sha.
5. Fetch file back and verify exact change.
6. Make only one small change at a time.
```

Never trust a write until commit SHA returns and fetch-back verifies exact content.

## Prompt for next session

```text
Continue work on https://github.com/42ndMoose/42ndMind

Do not read unrelated uploaded files.

First read CURRENT_PROGRESS.md.

Current task area:
Semantic operator / pressure / vector-template pipeline.

Important current state:
- 119-entry semantic corpus target is current: 32 main + 10 extension packets = 119 entries.
- Expected combiner state: 119 entries, 0 duplicates skipped, 11 source packets, status combined.
- Newest packet: data/semantic_seed_accusation_risk_direct_evidence_v0_1.json.
- Newest packet contains the accepted four accusation-risk entries only.
- Latest planner patch: src/kernel-semantic-vector-template-planner-v0-1-2-patch.js.
- Updated tests needing browser confirmation: kernel-semantic-corpus-combiner-v0-1-test.html, kernel-semantic-vector-compressor-v0-1-test.html, kernel-semantic-vector-template-planner-v0-1-test.html.
- Known stale tests/docs still needing update after browser verification: kernel-semantic-language-distiller-v0-1-test.html, kernel-semantic-language-certificate-v0-1-test.html, semantic-language-certificate.html.

Use the SHA write trick. Make small commits only.
```
