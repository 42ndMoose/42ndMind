/* 42ndMind Kernel Patch Candidate v0.4.1 semantic target patch
 * Adds semantic_invariant_adapter target-file mapping without changing planner doctrine.
 * Planner still does not write source, enable runtime, import commands, or move belief.
 */
(function (global) {
  'use strict';
  if (!global.KernelPatchCandidateV04) return;

  const BASE = global.KernelPatchCandidateV04;
  const VERSION = '0.4.1-semantic-target-patch';
  const EXTRA_TARGET_FILE_MAP = Object.freeze({
    semantic_invariant_adapter: [
      'src/kernel-semantic-invariant-learner-v0-4.js',
      'src/kernel-semantic-promotion-bridge-v0-4.js',
      'src/kernel-lexical-uncertainty-v0-4-1-patch.js',
      'kernel-semantic-invariant-learner-v0-4-test.html',
      'kernel-semantic-promotion-bridge-v0-4-test.html',
      'kernel-lexical-uncertainty-v0-4-test.html'
    ]
  });

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }

  function targetFilesFor(proposal, report) {
    const target = lower((proposal && proposal.target_layer) || (report && report.target_layer));
    const original = BASE.targetFilesFor(proposal, report);
    const extra = asArray(EXTRA_TARGET_FILE_MAP[target]);
    return Array.from(new Set(extra.concat(original))).filter(Boolean);
  }

  function createPlan(input, options) {
    const plan = BASE.createPlan(input, options || {});
    const proposal = plan && plan.raw && plan.raw.proposal || {};
    const report = plan && plan.raw && plan.raw.promotion_report || {};
    const target = lower(plan && plan.target_layer);
    if (target === 'semantic_invariant_adapter') {
      plan.target_files = targetFilesFor(proposal, report);
      plan.v041_semantic_target_patch = {
        applied: true,
        reason: 'semantic_invariant_adapter mapped to semantic learner, promotion bridge, lexical patch, and tests'
      };
      if (!Array.isArray(plan.risk_notes)) plan.risk_notes = [];
      plan.risk_notes.push('Semantic invariant adapter changes must remain pressure-only and cannot become live doctrine without promotion/sandbox/source-bridge review.');
    }
    plan.packet_version = VERSION;
    return plan;
  }

  function createMany(inputs, options) {
    const plans = asArray(inputs).map(i => createPlan(i, options || {}));
    return {
      packet_type: '42ndMind_kernel_patch_candidate_batch_v0_4',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      count: plans.length,
      plans,
      summary: {
        runtime_plan_ready: plans.filter(p => p.decision === BASE.DECISIONS.RUNTIME_PLAN_READY).length,
        patch_plan_ready: plans.filter(p => p.decision === BASE.DECISIONS.PATCH_PLAN_READY).length,
        hold_not_ready: plans.filter(p => p.decision === BASE.DECISIONS.HOLD_NOT_READY).length,
        blocked: plans.filter(p => p.decision === BASE.DECISIONS.BLOCKED).length
      },
      doctrine: { batch_plan_is_not_application:true, no_source_write:true, no_runtime_enablement:true }
    };
  }

  global.KernelPatchCandidateV04 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    EXTRA_TARGET_FILE_MAP,
    createPlan,
    createMany,
    targetFilesFor
  }));
})(typeof window !== 'undefined' ? window : globalThis);
