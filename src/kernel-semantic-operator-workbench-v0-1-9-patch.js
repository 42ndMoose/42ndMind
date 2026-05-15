/* 42ndMind Semantic Operator Workbench v0.1.9 Patch
 * Scrubs stale draft/export overmatches that can persist after a clean analysis UI:
 * - proved(evidence,claim) caused by provenance/provenance wording
 * - this(reference) caused by relative-clause "that" in "language that made..."
 *
 * This patch applies to draft entries and exported seed-candidate corpora, not only
 * the visible analysis report.
 *
 * No truth decision, belief movement, doctrine promotion, source patching,
 * or intent proof occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorWorkbenchV01;
  if (!base) return;

  const VERSION = '0.1.9';
  const PATCH_PACKET = '42ndMind_semantic_operator_workbench_v0_1_9_patch';

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
    d.patch_scrubs_stale_draft_provenance_proved_overmatch = true;
    d.patch_scrubs_stale_draft_relative_that_reference_overmatch = true;
    d.belief_movement = 'none';
    return d;
  }

  function shouldSuppressProvedInEntry(entry) {
    const s = lower(entry && entry.text);
    if (!s.includes('provenance')) return false;
    if (s.includes('provenance rather than truth')) return true;
    if (s.includes('posting establishes provenance')) return true;
    return false;
  }

  function shouldSuppressThisInEntry(entry) {
    const s = lower(entry && entry.text);
    if (/\b(this|these|those)\b/.test(s)) return false;
    if (!/\bthat\b/.test(s)) return false;
    return /\b(language|wording|statement|claim|record|evidence|issue|article|speech|source|document)\s+that\b/.test(s);
  }

  function scrubEntry(entry) {
    const e = clone(entry || {});
    const removeOps = new Set();
    if (shouldSuppressProvedInEntry(e)) removeOps.add('proved(evidence,claim)');
    if (shouldSuppressThisInEntry(e)) removeOps.add('this(reference)');

    if (!removeOps.size) return e;

    e.semantic_operators = asArray(e.semantic_operators).filter(op => !removeOps.has(text(op && op.operator)));

    const remainingPressureSet = new Set();
    e.semantic_operators.forEach(op => asArray(op.pressure).forEach(p => remainingPressureSet.add(text(p))));

    e.surface_terms = asArray(e.surface_terms).filter(term => {
      const t = lower(term);
      if (removeOps.has('proved(evidence,claim)') && (t === 'proved' || t === 'proven')) return false;
      if (removeOps.has('this(reference)') && (t === 'this' || t === 'that')) return false;
      return true;
    });

    if (e.workbench_metadata) {
      e.workbench_metadata.match_count = asArray(e.semantic_operators).length;
      e.workbench_metadata.pressures = unique(Array.from(remainingPressureSet));
      e.workbench_metadata.legitimacy_guards = unique(asArray(e.semantic_operators).map(op => op.legitimacy_condition));
      e.workbench_metadata.patch_packet_type = PATCH_PACKET;
      e.workbench_metadata.patch_version = VERSION;
      e.workbench_metadata.stale_overmatches_suppressed = unique(Array.from(removeOps));
    }

    const burdenKeep = [];
    asArray(e.evidence_burden).forEach(item => {
      const b = lower(item);
      if (removeOps.has('proved(evidence,claim)') && (b.includes('evidence being used as proof') || b.includes('entails the claim'))) return;
      if (removeOps.has('this(reference)') && (b.includes('referenced object') || b.includes('conclusion exceeds the reference'))) return;
      burdenKeep.push(item);
    });
    e.evidence_burden = unique(burdenKeep);

    if (e.expected_kernel_response && Array.isArray(e.expected_kernel_response.questions)) {
      e.expected_kernel_response.questions = unique(e.expected_kernel_response.questions.filter(q => {
        const x = lower(q);
        if (removeOps.has('proved(evidence,claim)') && x.includes('proof')) return false;
        if (removeOps.has('this(reference)') && x.includes('reference')) return false;
        return true;
      }));
      if (e.expected_kernel_response.questions.length === 0 && e.semantic_operators.length) {
        e.expected_kernel_response.questions.push('What evidence would make this semantic operation legitimate?');
      }
    }

    e.belief_movement = 'none';
    return e;
  }

  function scrubDraft(draft) {
    const d = clone(draft || {});
    d.entries = asArray(d.entries).map(scrubEntry).filter(e => asArray(e.semantic_operators).length > 0);
    d.entry_count = d.entries.length;
    d.draft_entry_count = d.entries.length;
    d.patch_packet_type = PATCH_PACKET;
    d.patch_version = VERSION;
    d.doctrine = Object.assign({}, d.doctrine || {}, doctrine());
    d.belief_movement = 'none';
    return d;
  }

  function scrubCorpus(corpus) {
    const c = clone(corpus || {});
    c.entries = asArray(c.entries).map(scrubEntry).filter(e => asArray(e.semantic_operators).length > 0);
    c.patch_packet_type = PATCH_PACKET;
    c.patch_version = VERSION;
    c.doctrine = Object.assign({}, c.doctrine || {}, doctrine());
    c.belief_movement = 'none';
    return c;
  }

  function draftEntries(raw, options = {}) {
    return scrubDraft(base.draftEntries(raw, options));
  }

  function promoteDraftToSeedCandidateCorpus(draft, options = {}) {
    return scrubCorpus(base.promoteDraftToSeedCandidateCorpus(scrubDraft(draft), options));
  }

  global.KernelSemanticOperatorWorkbenchV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PATCH_PACKET,
    doctrine,
    draftEntries,
    promoteDraftToSeedCandidateCorpus,
    scrubEntry,
    scrubDraft,
    scrubCorpus
  }));
})(typeof window !== 'undefined' ? window : globalThis);
