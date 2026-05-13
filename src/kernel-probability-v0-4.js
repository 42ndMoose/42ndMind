/* 42ndMind Kernel Probability v0.4
 *
 * Purpose:
 * Convert confidence-like signals into calibrated probability bands while
 * respecting consistency, source/review status, contradiction pressure,
 * unresolved questions, and duplicate provenance.
 *
 * This is not mission-grade stochastic diagnosis. It is a native symbolic
 * probability layer for epistemic claims.
 *
 * Doctrine:
 * - confidence is not probability until calibrated
 * - probability must be capped by contradiction and source weakness
 * - duplicate provenance cannot increase probability as independent evidence
 * - probability remains a belief-pressure signal, not truth itself
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const BANDS = Object.freeze({
    VERY_LOW: 'VERY_LOW',
    LOW: 'LOW',
    PLAUSIBLE: 'PLAUSIBLE',
    LIKELY: 'LIKELY',
    STRONG: 'STRONG',
    CAPPED: 'CAPPED_BY_EPISTEMIC_PRESSURE'
  });

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }

  function mean(values, fallback) {
    const nums = asArray(values).map(Number).filter(Number.isFinite);
    if (!nums.length) return fallback;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  function sourceIds(item) {
    const links = item && item.links || {};
    const meta = item && item.meta || {};
    return asArray(item && item.source_ids)
      .concat(asArray(links.source_ids))
      .concat(asArray(meta.source_ids))
      .concat(asArray(item && item.sources))
      .map(text).filter(Boolean);
  }

  function supportStatus(item) {
    const links = item && item.links || {};
    return lower(item && (item.support_status || item.source_review_status || item.review_status) || links.support_status || '');
  }

  function reviewMultiplier(status) {
    if (['evidence_backed','verified_for_claim','source_reviewed','reviewed'].includes(status)) return 1.0;
    if (['source_visible_unverified','unverified','unreviewed'].includes(status)) return 0.72;
    if (['unresolved','candidate','unknown',''].includes(status)) return 0.62;
    if (['contradicted','weakened','attacked'].includes(status)) return 0.35;
    return 0.58;
  }

  function independentSourceCount(items) {
    const set = new Set();
    asArray(items).forEach(item => sourceIds(item).forEach(id => set.add(id)));
    return set.size;
  }

  function evidenceBonus(items) {
    const independent = independentSourceCount(items);
    if (independent <= 0) return -0.16;
    if (independent === 1) return 0.02;
    if (independent === 2) return 0.08;
    return 0.12;
  }

  function consistencyCap(consistencyReport) {
    if (!consistencyReport) return { cap:0.78, reasons:['no_consistency_report'] };
    if (consistencyReport.decision === 'CONTRADICTION_VISIBLE') return { cap:0.5, reasons:['contradiction_visible'] };
    if (consistencyReport.decision === 'TENSION_VISIBLE') return { cap:0.68, reasons:['tension_visible'] };
    if (consistencyReport.decision === 'INSUFFICIENT_STRUCTURE') return { cap:0.42, reasons:['insufficient_structure'] };
    return { cap:0.94, reasons:[] };
  }

  function unresolvedPenalty(input) {
    const questions = asArray(input && (input.questions || input.unresolved_questions));
    const attacks = asArray(input && (input.attacks || input.counter_considerations || input.overclaim_flags));
    return Math.min(0.22, questions.length * 0.05 + attacks.length * 0.07);
  }

  function baseFromItems(items) {
    const confidences = asArray(items).map(i => Number(i && i.confidence)).filter(Number.isFinite);
    const base = mean(confidences, 0.5);
    const review = mean(asArray(items).map(i => reviewMultiplier(supportStatus(i))), 0.62);
    return clamp(base * review + evidenceBonus(items), 0.05, 0.95);
  }

  function band(probability, capReasons) {
    if (capReasons && capReasons.length) return BANDS.CAPPED;
    if (probability < 0.2) return BANDS.VERY_LOW;
    if (probability < 0.4) return BANDS.LOW;
    if (probability < 0.62) return BANDS.PLAUSIBLE;
    if (probability < 0.82) return BANDS.LIKELY;
    return BANDS.STRONG;
  }

  function analyze(input = {}, options = {}) {
    const items = Array.isArray(input) ? input : asArray(input.items || input.claims || input.interpretations || input.evidence || input.entries);
    const consistency = input.consistency_report || (global.KernelConsistencyV04 && typeof global.KernelConsistencyV04.analyze === 'function'
      ? global.KernelConsistencyV04.analyze(items)
      : null);
    const cap = consistencyCap(consistency);
    const unresolved = unresolvedPenalty(input);
    const raw = baseFromItems(items);
    const calibrated = clamp(Math.min(raw - unresolved, cap.cap), 0.01, 0.99);
    const intervalWidth = 0.12
      + (cap.reasons.length ? 0.12 : 0)
      + (independentSourceCount(items) === 0 ? 0.1 : 0)
      + Math.min(0.12, unresolved);
    const interval = {
      low: clamp(Number((calibrated - intervalWidth / 2).toFixed(3)), 0.01, 0.99),
      high: clamp(Number((calibrated + intervalWidth / 2).toFixed(3)), 0.01, 0.99)
    };
    return {
      packet_type: '42ndMind_kernel_probability_report_v0_4',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      probability: Number(calibrated.toFixed(3)),
      probability_band: band(calibrated, cap.reasons),
      interval,
      raw_confidence_mean: Number(mean(items.map(i => Number(i && i.confidence)).filter(Number.isFinite), 0.5).toFixed(3)),
      independent_source_count: independentSourceCount(items),
      unresolved_penalty: Number(unresolved.toFixed(3)),
      cap: { value: cap.cap, reasons: cap.reasons },
      consistency_report: consistency,
      belief_pressure_only: true,
      doctrine: {
        confidence_is_not_probability_until_calibrated: true,
        consistency_constrains_probability: true,
        duplicate_provenance_cannot_boost_probability_as_independent: true,
        contradiction_caps_probability: true,
        probability_is_not_truth: true
      }
    };
  }

  function sampleInput(kind) {
    if (kind === 'contradiction') return { items: global.KernelConsistencyV04 ? global.KernelConsistencyV04.sampleItems('contradiction') : [] };
    if (kind === 'duplicate') return { items: global.KernelConsistencyV04 ? global.KernelConsistencyV04.sampleItems('duplicate_same_provenance') : [] };
    if (kind === 'reviewed') return { items:[
      { id:'a', text:'Reviewed source supports the bounded claim.', source_ids:['s1'], support_status:'evidence_backed', confidence:0.72 },
      { id:'b', text:'Separate reviewed record supports the bounded claim.', source_ids:['s2'], support_status:'evidence_backed', confidence:0.74 }
    ] };
    if (kind === 'unreviewed') return { items:[
      { id:'a', text:'Unreviewed source-visible claim.', source_ids:[], support_status:'unreviewed', confidence:0.72 }
    ] };
    return { items:[{ id:'a', text:'Candidate claim with unresolved question.', source_ids:['s1'], support_status:'candidate', confidence:0.55 }], questions:['What would weaken this?'] };
  }

  global.KernelProbabilityV04 = Object.freeze({
    VERSION,
    BANDS,
    analyze,
    sampleInput,
    consistencyCap,
    reviewMultiplier
  });
})(typeof window !== 'undefined' ? window : globalThis);
