# 42ndMind Current Progress

Last updated: **2026-05-15**.

This is the short operational handoff for the current repo state. For the full paper-level technical context, read:

```text
HANDOFF_2026_05_13_KERNEL_V04_PAPER_CONTEXT.md
```

That file remains the authoritative high-context bundle for writing a serious paper on the Epistemic Kernel v0.4 state. This file now also records the later semantic-language corpus/certificate milestone.

## Current status

42ndMind is now a browser-based epistemic kernel stack with three related layers:

1. The older live console stack centered on `llm-brain-v0-3.html`.
2. The newer v0.4 one-brain / self-improvement / source-trust / semantic-invariant stack built as separate deterministic modules and test pages.
3. The v0.1 semantic-language corpus/distiller/certificate layer, which turns reviewed language examples into compact operator-pressure diagnostics.

The project remains a prototype. It is not a full truth machine and does not independently verify external facts without structured evidence, source review, and user/tool-mediated verification. The kernel owns belief movement; LLMs should remain extractor/interface layers.

## Main live console

- `llm-brain-v0-3.html` remains the main live console.
- Live packet version: `0.3.4-patched`.
- User manually wired maturity hard-fusion into the live brain.
- Live hard-fusion was verified on contradiction examples.
- Corrected live classification after v0.1.2 hard-fusion patch: `motive_overclaim_capped`.

## Current v0.4 doctrine

The v0.4 modules preserve these boundaries:

```text
metadata does not move belief
source trust is pressure, not truth
lexical uncertainty blocks fake certainty but does not define truth
memory archives pressure, not active belief
semantic invariants are candidates, not doctrine
self-improvement produces proposals/plans/packets, not automatic source edits
browser kernel never writes GitHub source directly
```

## Current semantic-language certificate milestone

The repo now has a clean semantic-language baseline certificate.

Pages:

```text
semantic-language-certificate.html
kernel-semantic-language-certificate-v0-1-test.html
semantic-language-distiller.html
semantic-corpus-combiner.html
semantic-operator-workbench.html
semantic-contrast-gap-planner-inline.html
```

The user reported:

```text
kernel-semantic-language-certificate-v0-1-test.html — 7/7 passed
```

Current certificate/distiller metrics:

```text
entries: 69
operators: 92
pressures: 47
families: 17
stable mappings: 71
weak mappings: 80
contrast gaps: 0
overmatch risks: 0
source packets: 7
```

Interpretation: the current surfaced semantic operator space has full contrast coverage and zero detected overmatch risks. Stable mappings are still candidate rules, not doctrine. The certificate is an auditable diagnostic snapshot, not a truth decision and not belief movement.

The semantic seed corpus currently combines:

```text
32 main entries
+ 6 closure contrast entries
+ 6 authority/evidence contrast entries
+ 9 motive/agency weak-map contrast entries
+ 4 scope/qualification contrast entries
+ 10 closure/source gap contrast entries
+ 2 unverified contrast entries
= 69 entries
```

Key semantic distinctions now covered include:

```text
misleading ≠ false
disputed ≠ debunked
clip ≠ full record
hearsay ≠ primary evidence
summary ≠ underlying record
not disproven ≠ supported
unverified ≠ false / debunked / contradicted
omission ≠ contradiction
scope mismatch ≠ contradiction
qualification ≠ falsity
```

## Current full self-improvement path

The most advanced implemented path is now:

```text
language example / lexical report / memory report
→ semantic invariant learner
→ stable invariant proposal
→ semantic promotion bridge
→ promotion pipeline
→ patch candidate planner
→ semantic target patch mapping
→ semantic source bridge
→ source patch bridge packet
→ external GitHub SHA/write/fetch-back/test protocol
```

This means the kernel can discover repeated semantic-pressure patterns, turn stable invariants into proposals, evaluate those proposals, create patch plans, and produce GitHub-safe external write packets.

It still cannot and should not write source automatically.

## Current important modules and pages

### Core / one-brain path

- `src/kernel-sensemaking-v0-1.js`
- `src/kernel-sensemaking-v0-1-1-patch.js`
- `src/kernel-command-preflight-v0-1.js`
- `src/kernel-command-preflight-v0-1-1-patch.js`
- `src/kernel-command-preflight-v0-1-2-governor-patch.js`
- `src/kernel-command-preflight-v0-1-3-governor-evidence-patch.js`
- `src/kernel-intention-recovery-v0-4.js`
- `src/kernel-consistency-v0-4.js`
- `src/kernel-probability-v0-4.js`
- `src/kernel-brain-v0-4.js`
- `src/kernel-brain-v0-4-runtime-bindings.js`
- `src/kernel-state-v0-4.js`

### Self-improvement chain

- `src/kernel-self-maintenance-v0-4.js`
- `src/kernel-motivation-v0-4.js`
- `src/kernel-motivation-v0-4-1-patch.js`
- `src/kernel-promotion-pipeline-v0-4.js`
- `src/kernel-promotion-pipeline-v0-4-1-patch.js`
- `src/kernel-patch-candidate-v0-4.js`
- `src/kernel-runtime-candidates-v0-4.js`
- `src/kernel-runtime-activation-v0-4.js`
- `src/kernel-sandbox-comparison-v0-4.js`
- `src/kernel-source-patch-bridge-v0-4.js`

### Source trust / EES

- `src/kernel-source-trust-v0-4.js`
- `src/kernel-source-trust-bridge-v0-4.js`
- `src/entity-event-source-registry-v0-1.js`
- `dossier-ees-compiler-v0-1-2.html`
- `src/ees-to-kernel-command-v0-1.js`
- `src/ees-to-kernel-command-v0-1-1-source-trust-patch.js`
- `ees-to-kernel-command.html`
- `ees-to-kernel-command-test.html`

### Memory / lexical / semantic language-math path

- `src/kernel-epistemic-memory-v0-4.js`
- `kernel-epistemic-memory-v0-4-test.html`
- `src/kernel-lexical-uncertainty-v0-4.js`
- `src/kernel-lexical-uncertainty-v0-4-1-patch.js`
- `kernel-lexical-uncertainty-v0-4-test.html`
- `src/kernel-semantic-invariant-learner-v0-4.js`
- `kernel-semantic-invariant-learner-v0-4-test.html`
- `kernel-semantic-invariant-review.html`
- `src/kernel-semantic-promotion-bridge-v0-4.js`
- `kernel-semantic-promotion-bridge-v0-4-test.html`
- `kernel-semantic-promotion-review.html`
- `src/kernel-patch-candidate-v0-4-1-semantic-target-patch.js`
- `src/kernel-semantic-source-bridge-v0-4.js`
- `kernel-semantic-source-bridge-v0-4-test.html`

### Semantic corpus / language-math certificate path

- `data/semantic_seed_corpus_v0_1.json`
- `data/semantic_seed_closure_contrast_v0_1.json`
- `data/semantic_seed_authority_evidence_contrast_v0_1.json`
- `data/semantic_seed_motive_agency_weakmap_contrast_v0_1.json`
- `data/semantic_seed_scope_qualification_contrast_v0_1.json`
- `data/semantic_seed_closure_source_gap_contrast_v0_1.json`
- `data/semantic_seed_unverified_contrast_v0_1.json`
- `src/kernel-semantic-corpus-v0-1.js`
- `src/kernel-semantic-corpus-combiner-v0-1.js`
- `src/kernel-semantic-language-distiller-v0-1.js`
- `src/kernel-semantic-operator-grammar-v0-1.js`
- `src/kernel-semantic-operator-grammar-v0-1-1-patch.js`
- `src/kernel-semantic-operator-grammar-v0-1-2-patch.js`
- `src/kernel-semantic-operator-grammar-v0-1-3-patch.js`
- `src/kernel-semantic-operator-grammar-v0-1-4-patch.js`
- `src/kernel-semantic-operator-grammar-v0-1-5-patch.js`
- `src/kernel-semantic-operator-grammar-v0-1-6-patch.js`
- `src/kernel-semantic-operator-grammar-v0-1-7-patch.js`
- `src/kernel-semantic-operator-workbench-v0-1.js`
- `src/kernel-semantic-operator-workbench-v0-1-1-patch.js`
- `src/kernel-semantic-operator-workbench-v0-1-2-patch.js`
- `src/kernel-semantic-operator-workbench-v0-1-3-patch.js`
- `src/kernel-semantic-operator-workbench-v0-1-4-patch.js`
- `src/kernel-semantic-operator-workbench-v0-1-5-patch.js`
- `src/kernel-semantic-corpus-to-invariants-v0-1.js`
- `src/kernel-semantic-contrast-gap-planner-v0-1.js`
- `src/kernel-semantic-contrast-gap-planner-v0-1-1-patch.js`
- `src/kernel-semantic-contrast-gap-planner-v0-1-2-patch.js`
- `semantic-corpus-builder.html`
- `semantic-operator-workbench.html`
- `semantic-corpus-combiner.html`
- `semantic-language-distiller.html`
- `semantic-contrast-gap-planner.html`
- `semantic-contrast-gap-planner-inline.html`
- `semantic-language-certificate.html`
- `kernel-semantic-language-certificate-v0-1-test.html`

### Review / bridge pages

- `kernel-runtime-candidate-review.html`
- `kernel-sandbox-comparison-review.html`
- `kernel-source-patch-bridge-review.html`
- `kernel-semantic-invariant-review.html`
- `kernel-semantic-promotion-review.html`

## User-reported verified tests

The user reported these key results:

- `maturity-hard-fusion-test-v0-1-2.html` — `11/11 passed`
- `kernel-epistemic-governor-test.html` — `10/10 passed`
- `kernel-sensemaking-test.html` — `11/11 passed`
- `kernel-command-preflight-test.html` — `13/13 passed`
- `kernel-brain-v0-4-test.html` — `11/11 passed`
- `kernel-intention-recovery-v0-4-test.html` — `11/11 passed`
- `kernel-runtime-candidates-v0-4-test.html` — `15/15 passed`
- `kernel-runtime-activation-v0-4-test.html` — `15/15 passed`
- `kernel-test-suite-v0-4-activation.html` — `7/7 passed`
- `kernel-sandbox-comparison-v0-4-test.html` — `12/12 passed`
- `kernel-source-patch-bridge-v0-4-test.html` — `16/16 passed`
- `kernel-source-trust-v0-4-test.html` — `14/14 passed`
- `kernel-source-trust-bridge-v0-4-test.html` — `10/10 passed`
- `ees-to-kernel-command-test.html` — `14/14 passed`
- `kernel-epistemic-memory-v0-4-test.html` — `15/15 passed`
- `kernel-lexical-uncertainty-v0-4-test.html` — `13/13 passed`
- `kernel-semantic-invariant-learner-v0-4-test.html` — `14/14 passed`
- `kernel-semantic-promotion-bridge-v0-4-test.html` — `10/10 passed`
- `kernel-semantic-source-bridge-v0-4-test.html` — `10/10 passed`
- `kernel-semantic-corpus-combiner-v0-1-test.html` — `11/11 passed`, `combined_entry_count: 69`
- `kernel-semantic-language-certificate-v0-1-test.html` — `7/7 passed`

If future pages disagree, trust the page’s actual listed tests and update this file after verification.

## Important storage keys

```text
42ndMind_source_registry_v0_1
42ndMind_entity_event_source_registry_v0_1
42ndMind_runtime_candidates_v0_4
42ndMind_epistemic_memory_v0_4
42ndMind_semantic_invariants_v0_4
```

`localStorage` is acceptable for the prototype, but serious research will need durable JSONL/SQLite-style export/import for epistemic memory and semantic invariant ledgers.

## README status

`README.md` has been revised to describe the v0.4 architecture, but it may still need another update to include the 69-entry semantic-language certificate milestone.

Recommended future documentation step:

- Add a short section to `README.md` linking `semantic-language-certificate.html` and summarizing the zero-gap semantic-language baseline.
- Keep older milestone content as archival or move it into a separate roadmap document.

## Current next development target

No urgent code build is required immediately after the semantic-language certificate if `kernel-semantic-language-certificate-v0-1-test.html` reports `7/7 passed`.

Recommended next work:

1. Add the semantic-language certificate milestone to `README.md`.
2. Consider creating a compact public-facing “Science Claim Sheet” page from the certificate.
3. Prepare a serious paper outline or LaTeX/PDF using `HANDOFF_2026_05_13_KERNEL_V04_PAPER_CONTEXT.md` plus the newer semantic-language certificate milestone.
4. Add durable export/import for `42ndMind_epistemic_memory_v0_4` and `42ndMind_semantic_invariants_v0_4`.
5. Eventually integrate selected v0.4 and semantic-language pages into the main navigation/index.

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

First read CURRENT_PROGRESS.md and HANDOFF_2026_05_13_KERNEL_V04_PAPER_CONTEXT.md.

Important current state:
- Main live console remains llm-brain-v0-3.html.
- v0.4 modules implement one-brain sensemaking, intention recovery, consistency, probability, motivation, self-maintenance, promotion, patch planning, runtime staging, activation, sandbox comparison, source patch bridge, source trust, epistemic memory, lexical uncertainty, semantic invariant learning, semantic promotion, and semantic source bridge.
- Semantic source bridge reaches source patch bridge packets but does not write source.
- kernel-semantic-source-bridge-v0-4-test.html should report 10/10 passed.
- Semantic-language corpus now combines 69 entries across 7 source packets.
- semantic-language-certificate.html produces a zero-gap certificate baseline.
- kernel-semantic-language-certificate-v0-1-test.html should report 7/7 passed.
- Latest semantic-language certificate metrics: 69 entries, 92 operators, 47 pressures, 17 families, 71 stable mappings, 80 weak mappings, 0 contrast gaps, 0 overmatch risks.
- Key semantic distinctions now covered: misleading ≠ false, disputed ≠ debunked, clip ≠ full record, hearsay ≠ primary evidence, summary ≠ underlying record, not disproven ≠ supported, unverified ≠ false/debunked/contradicted, omission ≠ contradiction, scope mismatch ≠ contradiction, qualification ≠ falsity.
- Source-trust treats certification as metadata, not truth.
- Lexical uncertainty treats LLM as extractor, not authority.
- Epistemic memory archives contradicted beliefs instead of deleting them.
- Semantic invariants and semantic-language stable mappings are candidate pressure patterns, not live doctrine.
- No browser module may write GitHub source directly.
- No semantic invariant may promote itself into doctrine without the promotion/sandbox/source-bridge path.

Likely next work:
1. Add the semantic-language certificate milestone to README.md.
2. Consider a public-facing Science Claim Sheet page.
3. Prepare a serious paper outline or LaTeX/PDF using the paper-context handoff plus the newer certificate milestone.
4. Consider durable export/import for epistemic memory and semantic invariant ledgers beyond localStorage.
```
