/* 42ndMind Semantic Operator Workbench v0.1.7 Patch
 * Tightens the rhetoric/intent batch by suppressing disproven(claim)
 * when the same sentence is matched as argument_from_ignorance(claim).
 *
 * "No one has disproven X, so X is true" mentions disproof language,
 * but its operative semantic move is absence-to-truth pressure, not an
 * actual disproven/closure operator.
 *
 * No truth decision, belief movement, doctrine promotion, source patching,
 * or intent proof occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorWorkbenchV01;
  if (!base) return;

  const VERSION = '0.1.7';
  const PATCH_PACKET = '42ndMind_semantic_operator_workbench_v0_1_7_patch';

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
    d.patch_suppresses_ignorance_fallacy_disproven_overmatch = true;
    d.mentions_disproof_is_not_disproof_when_used_as_absence_to_truth = true;
    d.belief_movement = 'none';
    return d;
  }

  function hasName(report, name) {
    return asArray(report && report.matches).some(m => m && m.name === name);
  }

  function rebuildReport(report) {
    const r = clone(report || {});
    if (hasName(r, 'argument_from_ignorance')) {
      r.matches = asArray(r.matches).filter(m => m.name !== 'disproven' && m.operator !== 'disproven(claim)');
    }
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
