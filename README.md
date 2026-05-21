# 42ndMind Clean Kernel

This branch is the clean migration reset after the prototype-lab purge.

The old repository state remains recoverable through Git history and local ZIP backups. This branch intentionally does not preserve old live pages, route-specific patches, toy speech modules, or one-off tests.

## Doctrine

One brain, separate organs.

The kernel owns one state object. Organs update fields inside that state, but they do not become separate minds and they do not print their own speech.

Communication is a motor output of the unified brain.

## Initial structure

```text
src/brain-state.js
src/kernel.js
src/maturity-core.js
src/neural-field.js
src/language-field.js
src/belief-memory-field.js
src/truth-field.js
src/communication-motor.js
src/autoplasticity.js
ui/live-kernel.html
tests/kernel-smoke-test.html
tests/neural-field-test.html
tests/language-field-test.html
```

## Non-negotiables

- Brain owns state.
- No duplicated consciousness.
- Objective maturity remains identity center.
- Language/math uses unit-total meaning fields.
- Memory is belief/context, not a separate self.
- Truth tracking stays separate from belief.
- Communication is a motor output, not module-generated speech.
- Self-improvement is internal plasticity.
- No final truth promotion yet.
- Do not fake intelligence through UI text.
