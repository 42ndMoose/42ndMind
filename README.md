# Epistemic Kernel v0

A tiny transparent belief-state prototype based on epistemic pressure, gate updates, scoped belief graphs, and Epistemic Octahedron projection.

This is not an LLM. It does not understand English deeply. It understands structured belief objects: claims, evidence, contradictions, questions, gate states, local octahedron states, and a root worldview aggregate.

The point of this prototype is to put the Epistemic Octahedron beneath the language layer instead of merely training an LLM to sound mature.

## Current status

The current system is a browser-based JavaScript prototype hosted through GitHub Pages.

Current live pages:

- `index.html` — main kernel UI for ingesting claims/evidence, viewing gates, copying LLM context, exporting/importing state.
- `belief-graph.html` — graph viewer for local octahedron states, parent links, stance clusters, and the root worldview aggregate.

Current core file:

- `src/epistemic-kernel.js` — the transparent belief-state engine.

Current state persistence:

- Kernel state is stored in browser `localStorage` under the GitHub Pages site origin.
- Reloading the page should preserve state.
- Closing/reopening the browser should preserve state unless site data is cleared.
- State is local to the browser/device. It is not automatically stored in GitHub.
- For durable transfer, use `Export state JSON` or `Copy LLM context`.

## What it does now

- Starts from the null origin: `(0, 0, 0)`.
- Stores claims.
- Stores evidence that supports or attacks claims.
- Detects a few simple contradiction patterns.
- Preserves live hypotheses instead of jumping straight to motive certainty.
- Creates open inquiry questions when belief pressure remains unresolved.
- Updates six gate scores:
  - G1 counter-consideration
  - G2 non-strawman
  - G3 self-correction
  - G4 contradiction handling
  - G5 reality contact
  - G6 non-self-sealing
- Projects semantic state onto the Epistemic Octahedron surface for active worldview states.
- Exports and imports JSON state.
- Copies a complete LLM context packet so a future ChatGPT session can see current UI state, unsaved textbox drafts, visible UI text, and saved kernel state.
- Builds a scoped `beliefGraph` containing:
  - root worldview node
  - claim nodes
  - contradiction nodes
  - stance cluster nodes
  - principle cluster node
  - links showing whether local nodes reinforce, pressure, or remain unresolved relative to parent nodes

## How to run

### Browser mode

Open `index.html` in a browser.

No install is required.

### GitHub Pages mode

Open the deployed GitHub Pages site for this repo.

If changes do not show immediately, hard refresh the browser or wait for GitHub Pages deployment to catch up.

### Node demo

If Node.js is installed:

```bash
npm run demo
```

## How to use

The fastest path is the Quick Ingest box. Paste something like:

```text
I submitted the form before the deadline. Actually, I submitted it this morning, but the deadline was yesterday.
```

Then click `Ingest text`.

The better path is structured input:

1. Add a claim.
2. Add evidence that supports or attacks the claim.
3. Watch the kernel update confidence, contradictions, gate states, questions, local graph nodes, and octahedron position.

For serious work, prefer structured input over Quick Ingest. Quick Ingest is intentionally crude.

## Important limitation

The quick English parser is intentionally crude. It is not the real intelligence layer.

The intended future architecture is:

```text
Human language
→ LLM extractor
→ structured claim/evidence/principle packet
→ Epistemic Kernel
→ belief-state update
→ optional LLM verbal explanation
```

In other words, the LLM becomes the eyes and mouth. The kernel owns belief movement.

## Core design thesis

The real target is not a chatbot that says wise things.

The real target is a transparent epistemic kernel whose internal update rules are faithful to the Epistemic Octahedron: null origin, active worldview surface, collapse pressure, and mature integration.

The kernel should not be optimized for generic “knowledge accumulation.” It should be optimized for mature belief movement under pressure.

Generic epistemy rewards: knowing more facts.

The kernel should reward: updating beliefs correctly when challenged by evidence, contradiction, uncertainty, scope pressure, and counter-consideration.

The guiding distinction:

```text
Normal LLM:
  produces a plausible answer.

Epistemic Kernel:
  stores and updates belief state under maturity rules.
```

## Relation to the Epistemic Octahedron

The kernel is intended to embody the core distinction of the Epistemic Octahedron:

- The origin `(0, 0, 0)` represents pre-philosophical nullity, not maturity.
- The lower vertex represents epistemic collapse.
- The upper vertex represents mature integration.
- Active worldview positions are projected to the surface: `|x| + |y| + |z| = 1`.

The kernel should eventually treat each belief, stance, contradiction, principle, and worldview fragment as a scoped octahedron state.

A person or mind should not be modeled as one flat permanent octahedron point. A mind is better represented as a hierarchy of scoped octahedron states:

```text
claim states
→ contradiction/tension states
→ stance clusters
→ worldview fragments
→ core principles
→ root worldview aggregate
```

The root worldview point is only the current aggregate summary of active kernel memory. It should not erase local unresolved states.

## What this prototype proves

This v0 proves that the kernel can exist without training a model:

```text
claim enters
belief state changes
contradiction creates pressure
evidence changes confidence
gates move
octahedron point moves
questions remain open until resolved
local belief graph nodes can feed a root worldview aggregate
```

It is not a finished AI. It is the first skeleton of an epistemic operating system.

## What this prototype does not prove yet

It does not yet prove that the Epistemic Octahedron is validated.

It does not yet deeply understand English.

It does not yet ingest long philosophical texts reliably.

It does not yet perform strong inference propagation.

It does not yet self-audit its own scoring.

It does not yet sandbox and test rule changes.

It does not yet outperform generic LLM reasoning on a formal benchmark.

The implementation should be judged by milestone tests, not by hype.

## Roadmap to the real goal

The real goal is a transparent, meaning-based epistemic system that can grow a belief graph, evaluate claims under pressure, test its own update logic, and eventually guide or train language models from a stable philosophical core.

The end result should be an epistemic operating system where the Epistemic Octahedron is the governing law and LLMs are interface/extractor layers, not the brain.

### Milestone 0 — Current skeleton

Status: partially complete.

Required capabilities:

- Browser kernel exists.
- Claims can be stored.
- Evidence can support or attack claims.
- Simple contradictions can be detected.
- Gate states can move.
- Null origin and active octahedron projection exist.
- LLM context copy packet exists.
- Basic hierarchical belief graph exists.
- Belief graph viewer exists.

Pass condition:

A user can ingest a simple contradiction, inspect the saved state, copy the LLM context packet, and see local graph nodes feeding a root worldview aggregate.

### Milestone 1 — Make the graph first-class

Goal: turn the current hidden graph into the main working model.

Required capabilities:

- Every claim has its own local octahedron state.
- Every contradiction has its own pressure state.
- Every stance cluster has its own aggregate state.
- Every principle cluster has its own worldview-fragment state.
- Parent links explicitly mark one of:
  - reinforces parent
  - pressures parent
  - unresolved, do not merge strongly
  - contradiction should bubble upward
- UI shows local state, parent state, and relation clearly.

Pass condition:

For a contradiction case, the app must show the claim nodes, contradiction node, stance cluster, and root worldview separately, with clear explanation of how each local state affects the parent.

### Milestone 2 — Meaning-packet ingestion

Goal: stop depending on English trigger words as the real input layer.

Required capabilities:

- Define a structured extraction packet schema for:
  - claims
  - evidence
  - principles
  - assumptions
  - scope
  - time
  - polarity
  - uncertainty
  - source
  - contradiction links
  - motive hypotheses
  - proposed gate updates
- Add an import box for structured extraction packets.
- Add a “Copy LLM extraction prompt” button.
- LLM can convert English, Indonesian, Tagalog, or other language text into the same packet format.
- Kernel updates belief state from the packet, not from raw language.

Pass condition:

The same scenario in English and Indonesian can be extracted into equivalent packets and produce equivalent kernel state movement.

### Milestone 3 — Nonsense and low-signal guard

Goal: prevent junk input from becoming serious belief.

Required capabilities:

- Detect low-signal/gibberish text.
- Store unclear input as `unparsed_observation` rather than a claim.
- Keep low-signal input near null.
- Ask clarification questions instead of creating false beliefs.

Pass condition:

Random gibberish, vague slogans, or malformed text should not produce high confidence claims or strong worldview movement.

### Milestone 4 — Evidence-grounded belief update

Goal: make belief movement depend more strongly on support/attack structure.

Required capabilities:

- Evidence must visibly support or attack specific claims.
- Attacking evidence should weaken target claims.
- Supporting evidence should strengthen target claims only proportionally.
- Contradiction detection alone should not over-reward epistemic stability.
- Unresolved contradictions should cap or pressure y until resolved.
- Motive remains unresolved unless separate motive evidence exists.

Pass condition:

In the form/deadline case, contradiction alone creates pressure, but timestamp evidence is required before the before-deadline claim is strongly weakened.

### Milestone 5 — Dependency propagation

Goal: let the kernel put two and two together through relations.

Required capabilities:

- Claims can depend on other claims.
- Conclusions can depend on premises.
- Principles can depend on repeated stable cases.
- If a support claim weakens, dependent conclusions weaken.
- If a local contradiction attacks a parent stance, pressure can bubble upward.
- If a local belief survives challenge, it can reinforce the parent.

Pass condition:

If claim B depends on claim A, and evidence attacks claim A, the kernel must reduce confidence in claim B and explain why.

### Milestone 6 — Scope and merge rules

Goal: stop small claims from moving the whole worldview too much.

Required capabilities:

- Add scope levels:
  - thought
  - claim
  - contradiction
  - stance
  - worldview_fragment
  - core_principle
  - full_profile_summary
- Add scope weights inspired by Philosopher’s Stone/profiler logic.
- A local belief can remain local.
- A belief only merges upward if it survives relevant pressure.
- Parent worldview can guide lower interpretation but must remain challengeable by lower evidence.

Pass condition:

A single weak claim cannot strongly move the root worldview, but repeated tested claims can form a stance cluster or principle.

### Milestone 7 — Self-audit

Goal: make the kernel criticize its own belief movement.

Required capabilities:

- Kernel generates an audit report after each update.
- Audit checks:
  - Did I over-reward contradiction detection?
  - Did I overclaim motive?
  - Did I merge upward too early?
  - Did I ignore attacking evidence?
  - Did I preserve unresolved pressure?
  - Did I confuse no contradiction with truth?
  - Did I treat criticism as hostility without motive evidence?
- Audit findings are stored as internal pressure, not hidden logs.

Pass condition:

For known failure cases, the kernel must identify at least one plausible weakness in its own state movement.

### Milestone 8 — Sandboxed self-improvement

Goal: allow controlled improvement without uncontrolled self-modification.

Required capabilities:

- Kernel can propose a rule change.
- Proposed rule is treated as a claim:
  - what it changes
  - why it might improve maturity
  - what evidence would falsify it
  - expected behavior difference
- Patch runs in sandbox against benchmark cases.
- Old behavior and new behavior are compared.
- Patch cannot promote itself automatically.
- User approval required to promote a rule into core logic.

Pass condition:

Kernel can propose something like “unresolved contradiction should cap y until evidence is added,” test it against cases, and show whether it improved results.

### Milestone 9 — Memory compression and active workspace

Goal: keep the kernel from drowning in its own belief graph.

Required capabilities:

- Active memory stores current pressure:
  - unresolved contradictions
  - open questions
  - unstable claims
  - active principles
- Archive memory stores resolved traces:
  - resolved contradictions
  - old evidence
  - past cases
  - source links
- Repeated stable cases can compress into a principle.
- Redundant questions can merge.
- Resolved contradictions become history rather than active pressure.
- Compression must preserve traceability.

Pass condition:

After many related cases, the kernel can compress them into a principle while still linking back to the original support cases.

### Milestone 10 — Philosophical text ingestion

Goal: let the kernel handle actual philosophical writing.

Required capabilities:

- Add input mode: philosophical text.
- Extract:
  - thesis
  - principles
  - definitions
  - assumptions
  - scope limits
  - implied counterarguments
  - possible contradictions
  - testing requirements
- Store principles as candidates, not automatic truths.
- Candidate principles must survive challenge before merging upward.

Pass condition:

A paragraph of philosophical text produces principle candidates with scope, counter-considerations, and testing requirements rather than being blindly believed.

### Milestone 11 — Epistemic Pressure Benchmark v0.1

Goal: make progress measurable.

Required benchmark categories:

- timeline contradiction
- mistaken accusation
- deleted-message concealment
- self-sealing belief
- false certainty
- motive ambiguity
- scope clarification
- partial truth
- memory error
- strategic deception
- strawman reconstruction
- conflicting evidence

Each case should include:

- prompt/input
- expected structured extraction
- expected belief movement
- expected gate movement
- acceptable answer/status
- failure patterns
- scoring rubric

Pass condition:

The kernel must pass a fixed benchmark better than its previous version before claiming improvement.

### Milestone 12 — Compare against ordinary LLM behavior

Goal: show why the kernel matters.

Required comparisons:

- Generic LLM answer
- LLM with prompt-only epistemic instruction
- LoRA/adapted model output if available
- Kernel-guided output
- Kernel state movement

Scoring should measure:

- contradiction detection
- evidence separation
- motive calibration
- scope control
- self-sealing detection
- belief update accuracy
- unresolved-pressure preservation

Pass condition:

Kernel-guided analysis must outperform prompt-only generic answers on the benchmark’s epistemic-pressure criteria.

### Milestone 13 — Dossier integration

Goal: let the kernel ingest curated factual structures without becoming a propaganda mirror.

Required capabilities:

- Import dossier claims as structured packets.
- Attach source/evidence links.
- Distinguish fact, inference, interpretation, and hypothesis.
- Keep adversarial counter-considerations live.
- Avoid treating a coherent dossier as automatically true.
- Let stable evidence-supported claims feed worldview fragments.

Pass condition:

The kernel can ingest a dossier section, build claim/evidence/principle nodes, identify unresolved points, and avoid overclaiming beyond the evidence.

### Milestone 14 — LLM interface layer

Goal: make the kernel usable through natural language without giving the LLM control of belief.

Required capabilities:

- LLM extracts structured packets.
- Kernel validates packets.
- Kernel updates belief state.
- LLM explains kernel state back to user.
- LLM cannot directly mutate core logic or silently alter belief state.

Pass condition:

A user can paste normal text, get a structured extraction, approve/import it, and receive a plain-language explanation of the resulting belief movement.

### Milestone 15 — Live self-improving epistemic system

Goal: the long-term target.

Required capabilities:

- Kernel understands the world through structured belief graph growth.
- It can form, test, revise, and compress principles.
- It can propose improvements to mappings and rules.
- It can sandbox those proposals.
- It can explain why an improvement is or is not mature.
- It treats its own interpretations as beliefs subject to the same gates.
- It uses the Epistemic Octahedron peak as the internal guardrail, not an unrelated external rule system.
- It asks the user before using external tools, paid compute, internet access, GitHub writes, or core-logic promotion.

Pass condition:

The kernel can improve a limited part of its own interpretation or scoring through sandboxed benchmark testing, preserve traceability, and require user approval before promotion.

## Failure conditions

The implementation should be considered failed or immature if it does any of the following:

- Treats “more knowledge” as automatic maturity.
- Treats confidence as automatic truth.
- Treats no contradiction as proof of truth.
- Treats criticism as hostility without motive evidence.
- Treats counterevidence as confirmation.
- Merges weak local claims into the root worldview too early.
- Lets learned mappings override core gates.
- Deletes uncomfortable contradictions instead of resolving or preserving them.
- Lets a proposed self-patch promote itself without sandbox testing and user approval.
- Rewards polished language more than correct belief movement.

## Internal guardrail principle

The guardrail should be the Epistemic Octahedron logic itself.

The kernel should not rely on an unrelated external restraint system. Instead, every expansion, learned mapping, self-modification, and interpretation must pass through the same maturity conditions:

- counter-consideration
- non-strawman reconstruction
- self-correction
- contradiction handling
- reality contact
- non-self-sealing

A proposed action such as “use more compute,” “go online,” “change a rule,” or “promote a mapping” is itself a claim that requires scope, evidence, counter-consideration, and user approval.

## Next immediate tasks

1. Improve the belief graph UI so local states are easier to inspect from the main app.
2. Add structured extraction packet import.
3. Add a reusable LLM extraction prompt generator.
4. Add low-signal/gibberish handling.
5. Add dependency links between claims.
6. Add self-audit report generation.
7. Add the first benchmark cases.
8. Begin porting selected `profiler.js` math into the kernel one piece at a time:
   - scope weights
   - local-y signal weights
   - gate-to-signal mapping
   - stricter peak guards
   - repair logic

## Current philosophical framing for future sessions

This project should be understood as an attempt to build a transparent epistemic organism, not a toy chatbot.

The theory layer is the Epistemic Octahedron.

The instrument/scoring layer is Philosopher’s Stone / `profiler.js`.

The kernel layer is this repo’s live belief-state engine.

The LLM layer should eventually act as extractor and verbal interface.

The benchmark layer should determine whether the system actually improves epistemic maturity under pressure.

The end result should be a system that does not merely answer. It should grow a belief state under pressure, preserve unresolved uncertainty, correct itself through evidence, and move toward mature integration by the logic of the Epistemic Octahedron.
