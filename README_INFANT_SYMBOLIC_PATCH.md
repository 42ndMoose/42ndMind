# 42ndMind infant symbolic patch

Drop these folders into the root of the `42ndMind` repository.

This patch adds:

- `src/infant-symbolic-kernel.js`
- `tests/infant-symbolic-kernel-node-test.js`

Run from the repo root:

```bash
node tests/infant-symbolic-kernel-node-test.js
```

Expected result: all PASS lines.

This is the first-principles infant layer:

```text
brain = 1
raw stream -> pattern pressure -> compression -> prediction -> error -> memory update -> runtime body mutation
```

It intentionally does not use an LLM, a semantic lexicon, or English output.
