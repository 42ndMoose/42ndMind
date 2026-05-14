# 42ndMind Semantic Corpus v0.1 Handoff — 2026-05-14

This handoff records the first semantic corpus system added after the v0.4 kernel / semantic invariant work.

## Purpose

The corpus is meant to seed the objective language-math path with structured examples that label:

- surface language
- literal meaning
- candidate intended meaning
- semantic operators
- epistemic pressure effects
- legitimacy conditions
- evidence burden
- expected kernel response

The key doctrine is that the corpus should not merely label intended meaning. It should label the deeper operation and what evidence would make that operation legitimate.

Example:

```text
"The certified fact-checker debunked the claim."

certified(source) -> authority_transfer_pressure + trust_inflation_pressure
fact-checker(source) -> source_trust_pressure + authority_transfer_pressure
debunked(claim) -> closure_pressure + dismissal_pressure
closure is legitimate only if the evidence chain directly contradicts the exact claim
```

## New files

```text
data/semantic_seed_corpus_v0_1.json
src/kernel-semantic-corpus-v0-1.js
semantic-corpus-builder.html
kernel-semantic-corpus-v0-1-test.html
HANDOFF_2026_05_14_SEMANTIC_CORPUS_V01.md
```

## Seed corpus

The first seed corpus contains 32 entries across 8 operator groups:

- `closure_dismissal`
- `authority_transfer`
- `reference_ambiguity`
- `motive_agency`
- `source_trust`
- `evidence_contact`
- `uncertainty_calibration`
- `moral_risk_framing`

Each entry uses this shape:

```json
{
  "id": "closure_debunked_001",
  "text": "The certified fact-checker debunked the claim.",
  "language": "en",
  "operator_group": "closure_dismissal",
  "surface_terms": ["certified", "fact-checker", "debunked"],
  "literal_meaning": "A certified fact-checking source says the claim is false.",
  "candidate_intended_meaning": "The dispute is being presented as resolved.",
  "semantic_operators": [
    {
      "operator": "certified(source)",
      "pressure": ["authority_transfer_pressure", "trust_inflation_pressure"],
      "legitimacy_condition": "Certification must remain metadata unless supported by primary evidence."
    },
    {
      "operator": "debunked(claim)",
      "pressure": ["closure_pressure", "dismissal_pressure"],
      "legitimacy_condition": "Closure is legitimate only if the evidence chain directly contradicts the exact claim."
    }
  ],
  "evidence_burden": [
    "Identify the exact claim being refuted.",
    "Inspect the evidence used by the fact-checker.",
    "Check whether primary evidence exists."
  ],
  "expected_kernel_response": {
    "lexical_action": "clarify implication-heavy terms",
    "source_trust_action": "treat certification as metadata, not truth",
    "belief_movement": "none_without_evidence_chain",
    "questions": [
      "What primary evidence supports the debunking?",
      "Which exact claim was allegedly refuted?"
    ]
  },
  "contrast_group": "closure_pressure_debunked",
  "review_status": "seed_candidate"
}
```

## Module behavior

`src/kernel-semantic-corpus-v0-1.js` exposes `KernelSemanticCorpusV01`.

Main functions:

- `validateEntry(entry, options)`
- `validateCorpus(corpus, options)`
- `summarize(corpus)`
- `entriesByGroup(corpus, group)`
- `entryToObservations(entry, options)`
- `toSemanticObservationBatch(corpusOrEntries, options)`
- `loadSeed(url)`
- `sampleEntry(kind)`

Doctrine preserved by the module:

```text
corpus entries are training pressure, not truth
semantic operators are candidate language-math units
legitimacy conditions define when pressure is earned
source status is metadata, not truth
corpus does not move belief
corpus does not promote doctrine
corpus does not patch source
```

## Builder page

`semantic-corpus-builder.html` provides a browser page for:

- loading sample entries
- editing a corpus entry JSON
- validating a single entry
- appending an entry to a corpus JSON blob
- loading the seed corpus from `data/semantic_seed_corpus_v0_1.json`
- validating/summarizing the corpus
- exporting a learner-compatible observation batch
- copying or downloading output JSON

It does not write source files or mutate doctrine.

## Test page

`kernel-semantic-corpus-v0-1-test.html` checks:

- module loading
- doctrine boundaries
- valid/invalid entry validation
- seed corpus loading on GitHub Pages
- clean validation
- coverage of the 8 initial operator groups
- closure/dismissal, authority-transfer, ambiguity, motive, and evidence operators
- non-final expected belief movement
- `entriesByGroup`
- observation-batch export
- compatibility with `KernelSemanticInvariantLearnerV04.record(...)`
- stable proposal generation from repeated corpus operators
- cleanup of the learner test ledger

Expected browser result on GitHub Pages: `18/18 passed`.

If opened directly from `file://`, `fetch()` may fail to load the JSON seed. The test includes a small fallback sample so module-level checks can still run, but the full seed-corpus coverage checks are meaningful on GitHub Pages.

## Current next build

Recommended next build:

```text
src/kernel-semantic-corpus-to-invariants-v0-1.js
kernel-semantic-corpus-to-invariants-v0-1-test.html
```

Purpose:

- formally bridge reviewed corpus entries into the existing semantic invariant learner
- preserve legitimacy conditions and evidence burden in the invariant proposal layer
- avoid treating corpus labels as doctrine
- allow reviewed corpus entries to become stable proposal pressure only after the current promotion path

After that, expand the seed corpus from 32 entries toward 100–300 entries using contrast pairs.

## Important warning

Do not dump random claims into the corpus. The value comes from contrastive structure:

```text
surface phrase
semantic operator
epistemic pressure
legitimacy condition
required evidence
expected kernel response
nearby contrast examples
```

Volume without contrast will teach noise. A smaller corpus with clean semantic operators is more valuable.
