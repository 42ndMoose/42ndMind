# 42ndMind Handoff: Basis Refinement Regression Tests Verified

Date: 2026-05-16

User reported both rerun regression tests passed after the basis-refinement fixes:

```text
kernel-semantic-vector-compressor-v0-1-test.html?v=basis-refine-2
expected: 11/11 passed
reported: passed

kernel-semantic-vector-template-planner-v0-1-test.html?v=basis-refine-2
expected: 14/14 passed
reported: passed
```

Current verified 135-entry baseline:

```text
combiner: 13/13 passed
compressor: 11/11 passed
planner: 14/14 passed
combined entries: 135
source packets: 13
ontology missing: 0
belief movement: none
```

Explanation of the prior planner generic fallback issue:

```text
The basis-refinement seed packet introduced new pressure signatures, especially covert_agreement_pressure and authority/coordination refinement signatures.
The planner had natural rules for older signatures, including accusation-risk and false-accusation signatures, but did not yet have natural rules for the new basis-refinement signatures.
When a selected top-10 template has no natural rule, it falls back to generic_pressure_signature_review sentences.
The test detected that as stale generic symbolic fallback.
```

Fix applied:

```text
8cb9214644e6ca024a3f41464c3513bd7d7903c4
Add basis refinement planner sentence rules
```

The planner patch now includes natural sentence rules for:

```text
covert_agreement_pressure
source-status / non-closure
claim-closure / evidence-support
coordination / motive uncertainty
pattern similarity / coordination review
motive-intent / direct-link
```

The live planner page was also updated to include the basis-refinement seed file and fresh cache keys.

Next recommended inspection:

```text
semantic-vector-template-planner.html?v=basis-refine-2
semantic-language-distiller.html?v=basis-refine-2
semantic-canonical-vector-basis.html?v=basis-refine-2
semantic-canonical-relation-proposer.html?v=basis-refine-2
semantic-canonical-relation-triage.html?v=basis-refine-2
```

Main semantic check:

```text
Did expert ≡ settled split?
Did collusion ≡ coordinated split?
Did belief movement remain none?
Did stale generic fallback remain absent?
```
