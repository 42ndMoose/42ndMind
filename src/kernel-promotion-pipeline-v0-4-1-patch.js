/* 42ndMind Kernel Promotion Pipeline v0.4.1 patch
 *
 * Fix:
 * v0.4.0 treated governor CAP_MATURITY as a hold condition for candidate
 * staging. That made safe runtime/patch proposals fail to become candidates.
 *
 * v0.4.1 preserves the cap as a caution, but allows safe proposals to be
 * staged as runtime candidates or patch candidates. Final enablement still
 * requires explicit action and tests. No runtime behavior is enabled here.
 */
(function (global) {
  'use strict';
  if (!global.KernelPromotionPipelineV04) return;

  const BASE = global.KernelPromotionPipelineV04;
  const VERSION = '0.4.1';
  const DECISIONS = BASE.DECISIONS;

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }

  function isRuntimeTarget(target) {
    target = lower(target);
    return asArray(BASE.RUNTIME_TARGETS).includes(target) || /queue|visibility|diagnostic|review|ui|clarification|summary/.test(target);
  }

  function isPatchTarget(target) {
    target = lower(target);
    return asArray(BASE.PATCH_TARGETS).includes(target) || /adapter|module|pipeline|brain|governor/.test(target);
  }

  function hasMissingTests(report) {
    return asArray(report && report.issues).some(i => i && i.code === 'missing_tests');
  }

  function hasBlockingIssue(report) {
    return asArray(report && report.issues).some(i => i && i.severity === 'block');
  }

  function capOnlyHold(report) {
    const holds = asArray(report && report.issues).filter(i => i && i.severity === 'hold');
    return holds.length > 0 && holds.every(i => i.code === 'governor_caps_maturity');
  }

  function patchReport(report) {
    if (!report || hasBlockingIssue(report) || hasMissingTests(report)) return report;
    if (!capOnlyHold(report)) return report;

    const target = report.target_layer;
    const previous = report.decision;
    let next = previous;
    if (isRuntimeTarget(target)) next = DECISIONS.PROMOTE_RUNTIME_CANDIDATE;
    else if (isPatchTarget(target)) next = DECISIONS.PATCH_CANDIDATE_ONLY;

    if (next !== previous) {
      report.decision = next;
      report.next_step = next === DECISIONS.PROMOTE_RUNTIME_CANDIDATE
        ? 'Eligible to be staged as disabled runtime candidate; governor cap remains a caution and explicit enablement is still required.'
        : 'Eligible to become a patch plan; governor cap remains a caution and no source write is allowed here.';
      report.v041_patch = {
        applied: true,
        rule: 'governor_cap_allows_candidate_staging_not_final_promotion',
        previous_decision: previous,
        next_decision: next
      };
    } else {
      report.v041_patch = { applied: false, rule: 'base_decision_retained' };
    }
    report.packet_version = VERSION;
    return report;
  }

  function evaluate(proposal, options) {
    return patchReport(BASE.evaluate(proposal, options));
  }

  function evaluateMany(proposals, options) {
    const reports = asArray(proposals).map(p => evaluate(p, options));
    return {
      packet_type: '42ndMind_kernel_promotion_pipeline_batch_report_v0_4',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      count: reports.length,
      reports,
      summary: {
        promote_runtime_candidate: reports.filter(r => r.decision === DECISIONS.PROMOTE_RUNTIME_CANDIDATE).length,
        hold_for_more_evidence: reports.filter(r => r.decision === DECISIONS.HOLD_FOR_MORE_EVIDENCE).length,
        block_promotion: reports.filter(r => r.decision === DECISIONS.BLOCK_PROMOTION).length,
        patch_candidate_only: reports.filter(r => r.decision === DECISIONS.PATCH_CANDIDATE_ONLY).length
      },
      doctrine: {
        batch_evaluation_is_not_promotion: true,
        no_runtime_enablement: true,
        no_patch_application: true,
        governor_cap_allows_candidate_staging_not_final_promotion: true
      }
    };
  }

  global.KernelPromotionPipelineV04 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    evaluate,
    evaluateMany
  }));
})(typeof window !== 'undefined' ? window : globalThis);
