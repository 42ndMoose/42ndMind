# 42ndMind

42ndMind is currently centered on the unified infant brain loop.

The main public entrypoint is:

```text
src/infant-brain-v0-1.js
```

The browser lab is:

```text
ui/infant-brain-lab.html
```

GitHub Pages URL:

```text
https://42ndmoose.github.io/42ndMind/ui/infant-brain-lab.html
```

## Current direction

The project is no longer organized around separate modules pretending to be separate organs.

The current top-level loop creates a single causal field and forces every active field to participate in the same update cycle.

Current active fields:

```text
brain
language
meaning
source_body
candidate_source
sandbox_result
attention
thought
inner_cycle
drive
expression
expression_feedback
whole
memory
trace
action
```

The important invariant is no longer just `field = 1`.

The stronger invariant is:

```text
organism = 1
causal_field = 1
every active field participates in causal_field
causal_field reinjects into every active field
```

## Main API

```js
const K = require('./src/infant-brain-v0-1.js');

const s = K.birthBrain();
K.perceiveBrain(s, 'abababab cdcdcdcd abababab cdcdcdcd');
K.brainLive(s, 12, 4);
console.log(K.brainPacket(s));
```

Browser global:

```js
window.FortySecondMindInfantBrain
```

## Current tests

Core top-level loop:

```bash
node tests/infant-v05-brain-loop.js
node tests/infant-v05-causal-loop.js
```

Bridge stack:

```bash
node tests/infant-v05-inner-cycle-bridge.js
node tests/infant-v05-drive-bridge.js
node tests/infant-v05-drive-learning-bridge.js
node tests/infant-v05-organism-entrypoint.js
node tests/infant-v05-expression-field.js
node tests/infant-v05-expression-feedback.js
node tests/infant-v05-whole-loop.js
```

## Non-negotiables

- One state.
- No duplicated consciousness.
- No English output until internal language deserves translation.
- Unit-total active fields.
- Every active field must be inside the causal loop.
- Memory is not a separate self.
- Source change remains sandboxed until the organism can compare harm and improvement.
- No final truth promotion yet.
- No UI text pretending to be intelligence.
