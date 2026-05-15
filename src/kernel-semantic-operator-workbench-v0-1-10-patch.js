/* 42ndMind Semantic Operator Workbench v0.1.10 Patch
 * Cleans metadata after v0.1.9 stale-overmatch scrubbing.
 *
 * If an operator is scrubbed from semantic_operators, associated stale
 * kernel_actions, contrast_classes, and evidence-burden fragments are also
 * removed so exported seed-candidate corpora remain source-clean.
 *
 * No truth decision, belief movement, doctrine promotion, source patching,
 * or intent proof occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorWorkbenchV01;
  if (!base) return;

  const VERSION = '0.1.10';
  const PATCH_PACKET = '42ndMind_semantic_operator_workbench_v0_1_10_patch';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const value = text(item);
      const key = lower(value);
      if (value && !seen.has(key)) { seen.add(key); out.push(value); }
    });
    return out;
  }

  function doctrine() {
    const d = base.doctrine ? base.doctrine() : {};
    d.patch_version = VERSION;
    d.patch_cleans_metadata_after_stale_overmatch_scrub = true;
    d.belief_movement = 'none';
    return d;
  }

  function activeOperators(entry) {
    return new Set(asArray(entry && entry.semantic_operators).map(op => text(op && op.operator)));
  }

  function activePressures(entry) {
    return unique(asArray(entry && entry.semantic_operators).flatMap(op => asArray(op && op.pressure)));
  }

  function cleanEntry(entry) {
    const e = base.scrubEntry ? base.scrubEntry(entry) : clone(entry || {});
    const ops = activeOperators(e);
    const pressures = activePressures(e);

    const hasProved = ops.has('proved(evidence,claim)');
    const hasThis = ops.has('this(reference)');

    if (e.workbench_metadata) {
      e.workbench_metadata.match_count = asArray(e.semantic_operators).length;
      e.workbench_metadata.pressures = pressures;
      e.workbench_metadata.legitimacy_guards = unique(asArray(e.semantic_operators).map(op => op.legitimacy_condition));

      if (!hasProved) {
        e.workbench_metadata.kernel_actions = asArray(e.workbench_metadata.kernel_actions).filter(action => !/proof language|support-inflation|direct entailment/i.test(text(action)));
        e.workbench_metadata.contrast_classes = asArray(e.workbench_metadata.contrast_classes).filter(c => !['supports(evidence,claim)', 'suggests(evidence,claim)', 'false(claim)'].includes(text(c)));
      }
      if (!hasThis) {
        e.workbench_metadata.kernel_actions = asArray(e.workbench_metadata.kernel_actions).filter(action => !/reference resolution/i.test(text(action)));
        e.workbench_metadata.contrast_classes = asArray(e.workbench_metadata.contrast_classes).filter(c => !['named_evidence(evidence)', 'named_claim(claim)', 'context_marker(reference)'].includes(text(c)));
      }

      e.workbench_metadata.kernel_actions = unique(e.workbench_metadata.kernel_actions);
      e.workbench_metadata.contrast_classes = unique(e.workbench_metadata.contrast_classes);
      e.workbench_metadata.patch_packet_type = PATCH_PACKET;
      e.workbench_metadata.patch_version = VERSION;
    }

    if (!hasProved) {
      e.evidence_burden = asArray(e.evidence_burden).filter(item => !/proof|entails the claim/i.test(text(item)));
    }
    if (!hasThis) {
      e.evidence_burden = asArray(e.evidence_burden).filter(item => !/referenced object|conclusion exceeds the reference|determine whether it is evidence, claim, or context/i.test(text(item)));
    }
    e.evidence_burden = unique(e.evidence_burden);

    e.semantic_operators = asArray(e.semantic_operators);
    e.belief_movement = 'none';
    return e;
  }

  function cleanDraft(draft) {
    const d = base.scrubDraft ? base.scrubDraft(draft) : clone(draft || {});
    d.entries = asArray(d.entries).map(cleanEntry).filter(e => asArray(e.semantic_operators).length > 0);
    d.entry_count = d.entries.length;
    d.draft_entry_count = d.entries.length;
    d.patch_packet_type = PATCH_PACKET;
    d.patch_version = VERSION;
    d.doctrine = Object.assign({}, d.doctrine || {}, doctrine());
    d.belief_movement = 'none';
    return d;
  }

  function cleanCorpus(corpus) {
    const c = base.scrubCorpus ? base.scrubCorpus(corpus) : clone(corpus || {});
    c.entries = asArray(c.entries).map(cleanEntry).filter(e => asArray(e.semantic_operators).length > 0);
    c.patch_packet_type = PATCH_PACKET;
    c.patch_version = VERSION;
    c.doctrine = Object.assign({}, c.doctrine || {}, doctrine());
    c.belief_movement = 'none';
    return c;
  }

  function draftEntries(raw, options = {}) {
    return cleanDraft(base.draftEntries(raw, options));
  }

  function promoteDraftToSeedCandidateCorpus(draft, options = {}) {
    return cleanCorpus(base.promoteDraftToSeedCandidateCorpus(cleanDraft(draft), options));
  }

  global.KernelSemanticOperatorWorkbenchV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PATCH_PACKET,
    doctrine,
    draftEntries,
    promoteDraftToSeedCandidateCorpus,
    cleanEntry,
    cleanDraft,
    cleanCorpus
  }));
})(typeof window !== 'undefined' ? window : globalThis);
