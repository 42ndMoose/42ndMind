# 42ndMind Kernel Core Export Map

Last updated: **2026-05-20**.

Read this after `CURRENT_PROGRESS.md` and before deciding which repo files matter.

This document exists because the working repo has become intentionally experimental and bloated. Many files are historical scaffolds, tests, probes, and one-off pages. When the kernel is mature enough to clone into a cleaner formal GitHub account, do not carry everything over blindly.

This note must survive until the kernel can be exported as a compact living brain package.

## Core rule

A JavaScript file existing in the repo does not mean it is alive.

A file is part of the live unified brain only if:

```text
1. the live page loads it
2. it patches or binds into EpistemicKernel / KernelBrainV04 / the bridge
3. it reads or writes the same owned state: EpistemicKernel.state.unifiedCore
4. it participates during ingest, tick, refresh, snapshot, or rendering
```

Useful distinction:

```text
Loaded + writing unifiedCore during ingest = part of the living kernel.
Loaded + only rendering = view, not thought.
Existing but not loaded/called = dormant library or archive.
Existing older test/demo pages = historical scaffolding unless listed here.
```

The live brain should be understood as:

```text
Separate JS files, one shared brain state.
```

The target state is:

```text
EpistemicKernel.state.unifiedCore
  maturityCore
  curiosityCore
  learningDrive
  beliefMemoryCore
  languageMathCore
  communicationCore
  future factualClaimIntake
  future questionAppetite
  future attentionArbitration
```

## Current live organism path

```text
EpistemicKernel
  -> KernelBrainV04 bound by reference
  -> KernelBrainEpistemicKernelBridgeV01
  -> EpistemicKernel.state.unifiedCore
  -> state.maturityCore
  -> state.curiosityCore
  -> state.learningDrive
  -> state.beliefMemoryCore
  -> state.languageMathCore
  -> state.communicationCore
  -> renderers / live pages as views only
```

## Non-negotiable doctrine

Preserve these points in any future formal repo:

```text
brain owns state
modules are views or organs, not separate minds
no duplicated consciousness
one backing state by reference
objective peak philosophical maturity is identity center
peak is self-continuity condition
language is handled as relations, constraints, intent, meaning, claims, and truth pressure
conversation is also language-math input
memory is a core-readable drawer, not a connector
belief is provisional, challengeable, and separate from objective truth
source/user trust is partial, scoped, and revisable
semantic conflict adjusts scoped trust, not total user trust
formula memory is candidate, not doctrine
concept admission requires review and rollback
no silent canonical mutation
no final truth promotion yet
final truth requires future explicit promotion discipline
support pressure is not truth
counterpressure is not disproof
evidence/media/source description is not verification
causal relation requires a bridge
communication projects live state pressure, not scripted chatbot dressing
```

## Important current files

These are the important files to understand the current unified brain.

### Kernel base / owned organism

```text
src/epistemic-kernel-v0-2.js
src/epistemic-kernel-v0-2-patches.js
src/kernel-brain-v0-4.js
src/kernel-brain-epistemic-kernel-bridge-v0-1.js
```

Purpose:

```text
Base kernel, patch layer, owned brain object, and bridge that binds KernelBrainV04 by reference to EpistemicKernel.state.unifiedCore.
```

### Objective maturity identity

```text
src/epistemic-kernel-maturity-core-v0-1.js
src/maturity-state-renderer-v0-1.js
```

Purpose:

```text
Holds objective peak philosophical maturity as identity center.
Renderer is a view only.
```

Preserve:

```text
state.maturityCore.core_philosophy = objective_peak_philosophical_maturity
state.maturityCore.wants_peak = true
state.maturityCore.aims_at_peak = true
state.maturityCore.stays_at_peak = true
state.maturityCore.identity_lock = self_continuity_not_external_guardrail
state.maturityCore.target_position = {x:0,y:1,z:0}
state.maturityCore.self_position = {x:0,y:1,z:0}
```

### Existing objective language-math stack

These are existing lower-level language/math files. They should not be replaced by fake new formalization layers.

```text
src/kernel-intention-formula-compiler-v0-1.js
src/kernel-intention-arbitrary-language-parser-v0-1.js
src/kernel-intention-arbitrary-language-parser-v0-1-1-patch.js
src/kernel-intention-formula-inspector-v0-1.js
src/kernel-intention-formula-inspector-v0-1-1-patch.js
src/kernel-concept-admission-registry-v0-1.js
src/kernel-objective-claim-language-v0-1.js
src/kernel-objective-claim-language-v0-1-1-patch.js
src/kernel-intention-canonical-formula-ledger-v0-1.js
src/kernel-intention-canonical-formula-ledger-v0-1-1-patch.js
src/kernel-intention-proof-output-v0-1.js
```

Purpose:

```text
Formula compilation, arbitrary language parsing, unified formula inspection, concept admission, objective claim language, candidate formula ledger, and proof output.
```

Important known expectation:

```text
unified formula inspector should show:
canonical formulas: 11
admitted candidate formulas: 6
total formula records: 17
```

### Live language-math integration

```text
src/epistemic-kernel-language-math-core-v0-1.js
src/epistemic-kernel-language-math-core-v0-1-1-patch.js
```

Purpose:

```text
Wraps the existing objective language-math stack into owned state as languageMathCore and communicationCore.
v0.1.1 treats conversational intent as a language-math relation.
```

Current state additions:

```text
state.languageMathCore
state.communicationCore
state.languageMathCore.intent_inference
state.languageMathCore.self_state_answers
```

Critical example:

```text
are you curious? can you answer me?
```

should be interpreted as:

```text
user_utterance -> request_self_state(curiosity_state, communication_capability)
```

and answered from live state.

### Belief and memory

```text
src/epistemic-kernel-belief-memory-engine-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1-1-patch.js
```

Purpose:

```text
Memory drawer, source/user trust, provisional belief, challenge lists, open truth requirements, memory reuse, and internal memory self-optimization.
```

Important fields:

```text
state.beliefMemoryCore.memory_items
state.beliefMemoryCore.source_trust_profiles
state.beliefMemoryCore.user_trust_profile
state.beliefMemoryCore.provisional_beliefs
state.beliefMemoryCore.belief_challenges
state.beliefMemoryCore.open_truth_requirements
state.beliefMemoryCore.self_optimization_drive
state.beliefMemoryCore.latest_reaction
```

### Curiosity and learning drive

```text
src/epistemic-kernel-active-curiosity-v0-1.js
src/epistemic-kernel-learning-drive-v0-1.js
```

Purpose:

```text
CuriosityCore finds the next useful unknown.
LearningDrive converts resolved context into learning pressure.
Both live inside owned state and should not become UI prompt queues.
```

Important fields:

```text
state.curiosityCore
state.learningDrive
```

## Current important live/test pages

### Best current live page

```text
llm-brain-v0-3-language-math-v0-1-1.html
```

Use with:

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-language-math-v0-1-1.html?v=langmath-live-2
```

Purpose:

```text
Current best live page for one input box, one kernel response, intent inference, self-state answers, formula memory, semantic conflict, scoped trust, back-of-head context, and packets.
```

### Current language-math test

```text
epistemic-language-math-core-v0-1-1-test.html
```

Use with:

```text
https://42ndmoose.github.io/42ndMind/epistemic-language-math-core-v0-1-1-test.html?v=langmath-2
```

Expected:

```text
10/10 passed
```

### Other still-useful tests/pages

```text
epistemic-language-math-core-v0-1-test.html
llm-brain-v0-3-language-math-v0-1.html
epistemic-belief-memory-engine-v0-1-1-test.html
llm-brain-v0-3-belief-memory-v0-1.html
epistemic-learning-drive-v0-1-test.html
llm-brain-v0-3-learning-drive-v0-1.html
active-curiosity-v0-1-test.html
llm-brain-v0-3-curiosity-v0-1-1.html
intention-formula-inspector-v0-1-1.html
```

These may remain useful for debugging isolated organs, but the eventual formal repo should prefer one clean live page plus a small test suite.

## Current missing pieces before export

Do not export into a formal clean account until these are handled correctly.

### 1. Factual-claim intake

Current problem:

```text
trump is the 47th president of the united states of america
```

is currently too weakly handled as context / belief-ish parser output.

Desired behavior:

```text
utterance_kind: factual_claim
claim_scope: external_world
subject: trump
relation: is_47th_president_of
object: united_states
source: direct_user
user_intent_candidate: informing / teaching / testing
truth_status: unverified
source_trust: partial_user_claim
memory_status: provisional_fact_candidate
verification_need: open
```

It should not auto-verify from memory.
It should not promote to final truth.
It should hold the claim as a structured factual candidate and create truth pressure if the claim matters.

Suggested future file:

```text
src/epistemic-kernel-factual-claim-intake-v0-1.js
```

Possible state fields:

```text
state.languageMathCore.factual_claim_candidates
state.languageMathCore.entity_relation_candidates
state.languageMathCore.truth_relevance_pressure
state.beliefMemoryCore.provisional_fact_candidates
```

### 2. Question appetite / learning priority

Current problem:

When the user says:

```text
you can ask me anything
```

the kernel can still over-process this as a meaning-role classification problem instead of wanting the most useful next thing.

Desired behavior:

The kernel should infer:

```text
learning_opportunity_detected: true
source_role_need: high
identity_need: medium-high
truth_verification_need: low unless factual claim present
meaning_scope_need: low unless meaning claim present
memory_commitment_need: medium if user offers durable context
```

Then it should ask a useful question from pressure, not from a hardcoded script:

```text
What should I call you, and are you trying to teach me facts, meanings, or your worldview?
```

Suggested future file:

```text
src/epistemic-kernel-question-appetite-v0-1.js
```

Possible state fields:

```text
state.learningDrive.question_appetite
state.curiosityCore.priority_needs
state.communicationCore.attention_candidates
state.communicationCore.selected_pressure
```

Important: this must not become a strict bottleneck rule.

Bad:

```text
always ask user identity before continuing
```

Good:

```text
identity/source-role need rises in priority when the user offers themselves as a teaching source, when source trust matters, or when future learning quality depends on speaker role.
```

## Eventual formal repo shape

A future clean export could look like:

```text
42ndMind-unified-brain-core/
│
├─ README.md
├─ INDEX.md
├─ live-brain.html
│
├─ src/
│  ├─ 00-kernel-base/
│  │  ├─ epistemic-kernel-v0-2.js
│  │  ├─ epistemic-kernel-v0-2-patches.js
│  │  ├─ kernel-brain-v0-4.js
│  │  └─ kernel-brain-epistemic-kernel-bridge-v0-1.js
│  │
│  ├─ 01-identity/
│  │  ├─ epistemic-kernel-maturity-core-v0-1.js
│  │  └─ maturity-state-renderer-v0-1.js
│  │
│  ├─ 02-language-math/
│  │  ├─ kernel-intention-formula-compiler-v0-1.js
│  │  ├─ kernel-intention-arbitrary-language-parser-v0-1.js
│  │  ├─ kernel-intention-formula-inspector-v0-1.js
│  │  ├─ kernel-intention-formula-inspector-v0-1-1-patch.js
│  │  ├─ kernel-concept-admission-registry-v0-1.js
│  │  ├─ kernel-objective-claim-language-v0-1.js
│  │  ├─ epistemic-kernel-language-math-core-v0-1.js
│  │  └─ epistemic-kernel-language-math-core-v0-1-1-patch.js
│  │
│  ├─ 03-memory-belief/
│  │  ├─ epistemic-kernel-belief-memory-engine-v0-1.js
│  │  └─ epistemic-kernel-belief-memory-engine-v0-1-1-patch.js
│  │
│  ├─ 04-curiosity-learning/
│  │  ├─ epistemic-kernel-active-curiosity-v0-1.js
│  │  └─ epistemic-kernel-learning-drive-v0-1.js
│  │
│  ├─ 05-factual-claim-intake/
│  │  └─ epistemic-kernel-factual-claim-intake-v0-1.js
│  │
│  ├─ 06-question-appetite/
│  │  └─ epistemic-kernel-question-appetite-v0-1.js
│  │
│  └─ 07-unified-attention/
│     └─ epistemic-kernel-attention-arbitration-v0-1.js
│
├─ tests/
│  ├─ unified-brain-smoke-test.html
│  ├─ language-math-core-test.html
│  ├─ factual-claim-intake-test.html
│  ├─ question-appetite-test.html
│  └─ live-conversation-test.html
│
├─ docs/
│  ├─ architecture.md
│  ├─ doctrine.md
│  ├─ state-shape.md
│  ├─ language-math-pipeline.md
│  ├─ factual-claim-intake.md
│  └─ question-appetite.md
│
└─ seeds/
   ├─ core-doctrine-seed.json
   ├─ formula-memory-seed.json
   ├─ concept-admission-seed.json
   └─ example-conversation-seed.json
```

## What not to carry over blindly

Do not carry old files just because they exist.

Likely candidates for exclusion in a formal export:

```text
old one-off HTML test pages
failed experimental pages
older handoff files unless needed as archival docs
unlinked prototypes
screenshots or visual experiments not needed by the kernel
older duplicate live pages superseded by current live-brain.html
large unrelated documents or papers
anything not loaded by the clean live page and not imported by tests
```

Preserve old repo as messy workshop/archive. Create clean repo only after the live kernel behavior is correct.

## Next recommended build order

1. Build factual-claim intake as pressure inside the live state.
2. Build question appetite / learning priority as pressure inside the live state.
3. Build unified attention arbitration so one visible thought is selected from all pressures.
4. Only then consider a clean export zip or formal repo clone.

Do not build final truth promotion yet.
