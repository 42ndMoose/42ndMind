# 42ndMind Semantic Language-Math Workflow Handoff — 2026-05-14

This handoff records the new semantic language-math workflow built after the v0.4 semantic invariant path.

## Current purpose

The new path turns natural-language claim examples into structured semantic operators using the algebraic grammar:

```text
O(x) -> P | G | E | A | C
```

Where:

- `O` = semantic operator
- `P` = pressure vector
- `G` = legitimacy guard
- `E` = evidence burden
- `A` = kernel action
- `C` = contrast class

The kernel does not need to speak English. The extractor/workbench maps surface language into this operator grammar. The kernel preserves pressure, guards, evidence burden, and review boundaries.

## Doctrine boundary

All files in this path preserve these rules:

```text
semantic operators are candidate language-math units
pressure is not truth
source status is metadata, not truth
legitimacy conditions define when pressure is earned
corpus entries are training pressure, not belief movement
workbench outputs are drafts, not doctrine
combiner output is a runtime working corpus, not a source rewrite
browser pages do not write GitHub source
```

## Files added in this sequence

### Corpus system

```text
data/semantic_seed_corpus_v0_1.json
src/kernel-semantic-corpus-v0-1.js
semantic-corpus-builder.html
kernel-semantic-corpus-v0-1-test.html
```

User reported: `kernel-semantic-corpus-v0-1-test.html` = `18/18 passed`.

### Corpus-to-invariants bridge

```text
src/kernel-semantic-corpus-to-invariants-v0-1.js
kernel-semantic-corpus-to-invariants-v0-1-test.html
```

User reported the bridge test passed.

### Operator grammar

```text
src/kernel-semantic-operator-grammar-v0-1.js
kernel-semantic-operator-grammar-v0-1-test.html
src/kernel-semantic-operator-grammar-v0-1-1-patch.js
```

`v0.1` defines the canonical operator grammar.

`v0.1.1` adds the first contrast-sensitive operators exposed by workbench testing:

```text
challenged(claim)
lacks_evidence(claim)
false(claim)
rated(source,claim)
reviewer(source)
contradicted_by(record,claim)
```

User reported `kernel-semantic-operator-grammar-v0-1-test.html` = `21/21 passed`.

### Operator workbench

```text
src/kernel-semantic-operator-workbench-v0-1.js
semantic-operator-workbench.html
kernel-semantic-operator-workbench-v0-1-test.html
src/kernel-semantic-operator-workbench-v0-1-1-patch.js
```

`v0.1` turns pasted sentence batches into matched operators and draft corpus entries.

`v0.1.1` fixes contrast-sensitive intended meanings/questions and suppresses the redundant general `contradicts(record,claim)` match when the more specific `contradicted_by(record,claim)` is present.

The workbench currently loads:

```text
src/kernel-semantic-operator-grammar-v0-1.js?v=0.1.0
src/kernel-semantic-operator-grammar-v0-1-1-patch.js?v=0.1.1
src/kernel-semantic-corpus-v0-1.js?v=0.1.0
src/kernel-semantic-operator-workbench-v0-1.js?v=0.1.0
src/kernel-semantic-operator-workbench-v0-1-1-patch.js?v=0.1.1
```

### Closure contrast extension batch

```text
data/semantic_seed_closure_contrast_v0_1.json
kernel-semantic-seed-extension-v0-1-test.html
```

This extension contains 6 reviewed contrast entries:

```text
The claim was debunked.
The claim was challenged.
The claim was contradicted by the transcript.
The claim lacks evidence.
The claim is false.
The certified reviewer rated the claim false.
```

Stable IDs:

```text
closure_contrast_debunked_033
closure_contrast_challenged_034
closure_contrast_transcript_contradiction_035
closure_contrast_lacks_evidence_036
closure_contrast_false_037
closure_contrast_certified_reviewer_rating_038
```

The user reported the workbench summary for this batch reached:

```text
sentences: 6
matched: 6
draft entries: 6
last status: valid draft
```

Expected extension test result: `8/8 passed`.

### Runtime corpus combiner

```text
src/kernel-semantic-corpus-combiner-v0-1.js
semantic-corpus-combiner.html
kernel-semantic-corpus-combiner-v0-1-test.html
```

The combiner joins the main corpus plus extension batches at runtime instead of rewriting the large main JSON file. It skips duplicate IDs instead of overwriting them.

Default combiner inputs:

```text
main: data/semantic_seed_corpus_v0_1.json
extension_1: data/semantic_seed_closure_contrast_v0_1.json
```

User reported:

```text
kernel-semantic-corpus-combiner-v0-1-test.html = 11/11 passed
combined entries = 38
source packets = 2
main = 32 entries
extension_1 = 6 entries
duplicates skipped = 0
```

## Current workflow for user

The user does not need to understand the whole repo. The workflow is:

```text
1. Open semantic-operator-workbench.html.
2. Load or paste a small contrast batch.
3. Click ANALYZE.
4. Check whether the matched operators look sane.
5. Click DRAFT corpus entries.
6. Click VALIDATE draft.
7. If valid, export seed-candidate corpus JSON.
8. Add that batch as a modular extension file.
9. Add the extension URL to semantic-corpus-combiner.html.
10. Run combiner test.
```

The user mainly acts as a reviewer for obvious semantic mistakes.

## Recommended next work

Next best contrast batches:

1. `authority_transfer_contrast_v0_1`

```text
The certified source proved the claim false.
An expert said the policy works.
There is a consensus, so the debate is over.
The official source posted it, so it is reliable.
The primary document states the deadline was extended.
The raw data contradicts the published summary.
```

Purpose: distinguish authority/status pressure from evidence-contact pressure.

2. `motive_agency_contrast_v0_1`

```text
They coordinated the talking points.
The media pushed that agenda on purpose.
The companies colluded to suppress the story.
Several outlets used the same wording.
This may indicate coordination, but it is not enough by itself.
The records show a shared planning document.
```

Purpose: distinguish coordination, agenda, collusion, similarity, self-limiting uncertainty, and direct-link evidence.

3. `reference_ambiguity_contrast_v0_1`

```text
They are hiding the real numbers.
The department withheld the March report.
This proves the whole thing was staged.
The leaked spreadsheet raises a question about the totals.
That is why nobody trusts them anymore.
The filing names the agency and the disputed figures.
```

Purpose: distinguish unresolved reference from named actors/evidence objects.

## Important current principle

Do not dump random claims into the corpus. Use contrast sets. Each batch should teach the kernel one set of nearby semantic differences.

Good contrast batches make the algebra sharper. Large noisy batches make the grammar worse.
