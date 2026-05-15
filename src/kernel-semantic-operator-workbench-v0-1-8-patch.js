/* 42ndMind Semantic Operator Workbench v0.1.8 Patch
 * Suppresses two template-review batch overmatches:
 * - proved(evidence,claim) when the only trigger is provenance/provenance wording
 * - this(reference) when "that" is functioning as a relative clause marker,
 *   such as "language that made...", not as a deictic reference.
 *
 * No truth decision, belief movement, doctrine promotion, source patching,
 * or intent proof occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorWorkbenchV01;
  if (!base) return;

  const VERSION = '0.1.8';
  const PATCH_PACKET = '42ndMind_semantic_operator_workbench_v0_1_8_patch';

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
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
    d.patch_suppresses_provenance_proved_overmatch = true;
    d.patch_suppresses_relative_that_reference_overmatch = true;
    d.belief_movement = 'none';
    return d;
  }

  function hasExplicitProofLanguage(sentence) {
    const s = lower(sentence);
    return /\b(prove|proves|proved|proven|proof|supports|supported|supporting|shows|shown)\b/.test(s);
  }

  function shouldSuppressProved(report) {
    const s = lower(report && report.sentence);
    if (!s.includes('provenance')) return false;
    return !hasExplicitProofLanguage(s.replace(/\bprovenance\b/g, ''));
  }

  function shouldSuppressRelativeThatReference(report) {
    const s = lower(report && report.sentence);
    if (/\b(this|these|those)\b/.test(s)) return false;
    if (!/\bthat\b/.test(s)) return false;
    return /\b(language|wording|statement|claim|record|evidence|issue|article|speech|source|document)\s+that\b/.test(s);
  }

  function rebuildReport(report) {
    const r = clone(report || {});
    r.matches = asArray(r.matches).filter(m => {
      if (!m) return false;
      if (shouldSuppressProved(r) && (m.name === 'proved' || m.operator === 'proved(evidence,claim)')) return false;
      if (shouldSuppressRelativeThatReference(r) && (m.name === 'this' || m.operator === 'this(reference)')) return false;
      return true;
    });
    r.match_count = asArray(r.matches).length;
    r.groups = unique(asArray(r.matches).map(m => m.group));
    r.pressures = unique(asArray(r.matches).flatMap(m => m.pressure_vector || []));
    r.legitimacy_guards = unique(asArray(r.matches).map(m => m.legitimacy_guard));
    r.evidence_burden = unique(asArray(r.matches).flatMap(m => m.evidence_burden || []));
    r.kernel_actions = unique(asArray(r.matches).map(m => m.kernel_action));
    r.contrast_classes = unique(asArray(r.matches).flatMap(m => m.contrast_class || []));
    r.patch_packet_type = PATCH_PACKET;
    r.patch_version = VERSION;
    r.belief_movement = 'none';
    r.doctrine = doctrine();
    return r;
  }

  function analyzeSentence(sentence, options = {}) { return rebuildReport(base.analyzeSentence(sentence, options)); }
  function analyzeBatch(raw, options = {}) {
    const batch = base.analyzeBatch(raw, options);
    const reports = asArray(batch.reports).map(rebuildReport);
    return Object.assign({}, batch, {
      packet_version: VERSION,
      patch_packet_type: PATCH_PACKET,
      created_at: now(),
      reports,
      matched_sentence_count: reports.filter(r => r.match_count > 0).length,
      unmatched_sentence_count: reports.filter(r => r.match_count === 0).length,
      belief_movement: 'none',
      doctrine: doctrine()
    });
  }

  function draftEntries(raw, options = {}) {
    const batch = raw && raw.packet_type === '42ndMind_semantic_operator_workbench_batch_report_v0_1' ? analyzeBatch(asArray(raw.reports).map(r => r.sentence).join('\n'), options) : analyzeBatch(raw, options);
    return base.draftEntries(batch, options);
  }

  global.KernelSemanticOperatorWorkbenchV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PATCH_PACKET,
    doctrine,
    analyzeSentence,
    analyzeBatch,
    draftEntries
  }));
})(typeof window !== 'undefined' ? window : globalThis);
