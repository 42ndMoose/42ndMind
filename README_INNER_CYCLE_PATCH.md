# 42ndMind inner cycle patch

This patch adds an inner-cycle bridge on top of the current infant kernel.

Files:
- `src/infant-cycle-v0-1.js`
- `tests/infant-v05-inner-cycle-bridge.js`

Run from the repo root:

```bash
node tests/infant-v05-inner-cycle-bridge.js
```

It proves:
- External observation happens once.
- Inner cycles continue without consuming a new outside observation.
- Thought cycle count increases internally.
- The symbolic action channel updates.
- Unit-total fields remain equal to 1.
- English remains disabled.

This is a bridge because the GitHub connector blocked direct replacement of `src/infant-symbolic-kernel.js`.
The intended later move is to merge `runCycle` into the core kernel.
