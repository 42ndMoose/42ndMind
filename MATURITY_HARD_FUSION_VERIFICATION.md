# Maturity Hard Fusion Verification

Date: 2026-05-10

This note records browser verification for the hard-fusion maturity patch.

## Files involved

- `src/maturity-objective-v0-1.js`
- `src/maturity-objective-v0-1-1-patch.js`
- `src/maturity-fusion-v0-1.js`
- `src/maturity-hard-fusion-v0-1.js`
- `maturity-hard-fusion-test-v0-1-2.html`

## Bug found and fixed

The first hard-fusion test exposed that the original maturity objective made the clean peak structurally unreachable. The source-discipline lane maxed at `0.85`, so even a source-visible, well-evidenced, contradiction-free `(0,1,0)` case could be capped below full maturity.

`src/maturity-objective-v0-1-1-patch.js` fixes this narrowly. It allows true `y = 1` only when the case is clean, source-visible, well-evidenced, has no unresolved source questions, no unresolved contradictions, no self-sealing pressure, no motive-overclaim pressure, and all gates/evidence are clean.

All existing caps are preserved.

## Browser verification reported by user

The user ran:

```text
https://42ndmoose.github.io/42ndMind/maturity-hard-fusion-test-v0-1-2.html
```

Observed result:

```text
11/11 passed
```

Passed cases:

- objective patch installed
- module exists
- null origin is preserved
- active surface is preserved when cap applies
- lateral sign is preserved when cap applies
- unresolved contradiction caps y
- unresolved source questions cap y
- self-sealing caps harder
- clean active candidate is not capped
- no source visibility caps clean-looking peak
- root graph node is updated when capped

## Current status

```text
Maturity objective: built.
Maturity objective clean-peak patch: built and verified.
Maturity fusion proposal: built.
Maturity hard-fusion patch: built and browser-verified by synthetic tests.
Real non-null metadata bridge: verified earlier by user.
Hard-fusion patch loaded into main live console: not yet.
```

## Next step

Wire the following scripts into a live console after `src/epistemic-kernel-v0-2-patches.js` and before the inline live-brain script that creates the kernel:

```html
<script src="src/maturity-objective-v0-1.js?v=0.1.0"></script>
<script src="src/maturity-objective-v0-1-1-patch.js?v=0.1.1"></script>
<script src="src/maturity-fusion-v0-1.js?v=0.1.0"></script>
<script src="src/maturity-hard-fusion-v0-1.js?v=0.1.0"></script>
```

Because large `update_file` operations were unstable in this ChatGPT session, prefer manual one-line script-tag insertion or a new live console version if tool writes are stable.