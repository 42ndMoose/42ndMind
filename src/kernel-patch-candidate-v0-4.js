/* 42ndMind Kernel Patch Candidate v0.4
 *
 * Purpose:
 * Convert approved promotion-pipeline outcomes into explicit runtime-change
 * plans or patch plans.
 *
 * This module is a planner only. It never writes source files, enables runtime
 * candidates, executes imports, or changes core doctrine.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    RUNTIME_PLAN_READY: 'RUNTIME_PLAN_READY',
    PATCH_PLAN_READY: 'PATCH_PLAN_READY',
    HOLD_NOT_READY: 'HOLD_NOT_READY',
    BLOCKED: 'BLOCKED'
  });

  const TARGET_FILE_MAP = Object.freeze({
    sensemaking_adapter: ['src/kernel-sensemaking-v0-1-1-patch.js', 'kernel-sensemaking-test.html'],
    intention_recovery_adapter: ['src/kernel-intention-recovery-v0-4.js', 'kernel-intention-recovery-v0-4-test.html'],
    consistency_adapter: ['src/kernel-consistency-v0-4.js', 'kernel-consistency-v0-4-test.html'],
    probability_adapter: ['src/kernel-probability-v0-4.js', 'kernel-probability-v0-4-test.html'],
    motivation_adapter: ['src/kernel-motivation-v0-4-1-patch.js', 'kernel-motivation-v0-4-test.html'],
    kernel_brain_adapter: ['src/kernel-brain-v0-4.js', 'kernel-brain-v0-4-test.html', 'llm-brain-v0-4-test.html'],
    governor_adapter_boundary: ['src/kernel-epistemic-governor-v0-1-2-patch.js', 'kernel-epistemic-governor-test.html'],
    source_registry_adapter: ['src/entity-event-source-registry-v0-1.js'],
    pending_import_review: ['llm-brain-v0-4.html', 'kernel-state-v0-4-test.html'],
    state_candidate_review: ['llm-brain-v0-4.html', 'kernel-state-v0-4-test.html'],
    runtime_visibility: ['llm-brain-v0-4.html', 'llm-brain-v0-4-test.html'],
    diagnostics: ['kernel-test-suite-v0-4.html'],
    ui_review_queue: ['llm-brain-v0-4.html'],
    self_maintenance_baseline: ['src/kernel-self-maintenance-v0-4.js', 'kernel-self-maintenance-v0-4-test.html']
  });

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function id(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

  function promotionReport(input) {
    if (input && input.packet_type === '42ndMind_kernel_promotion_pipeline_report_v0_4') return input;
    if (global.KernelPromotionPipelineV04 && typeof global.KernelPromotionPipelineV04.evaluate === 'function') {
      return global.KernelPromotionPipelineV04.evaluate(input || {});
    }
    return null;
  }

  function proposalFrom(report, fallback) {
    return (report && report.governor_candidate && report.governor_candidate.raw && report.governor_candidate.raw.proposal) || fallback || {};
  }

  function testsFrom(report, proposal) {
    return Array.from(new Set(asArray(report && report.tests_required).concat(asArray(proposal && proposal.tests_required)).map(text).filter(Boolean)));
  }

  function targetFilesFor(proposal, report) {
    const target = lower((proposal && proposal.target_layer) || (report && report.target_layer));
    const mapped = asArray(TARGET_FILE_MAP[target]);
    const explicit = asArray(proposal && proposal.target_files).map(text).filter(Boolean);
    const tests = testsFrom(report, proposal).filter(t => /\.html$|\.js$/.test(t));
    return Array.from(new Set(explicit.concat(mapped).concat(tests))).filter(Boolean);
  }

  function basePlan(report, proposal) {
    const target = text((proposal && proposal.target_layer) || (report && report.target_layer));
    return {
      packet_type: '42ndMind_kernel_patch_candidate_plan_v0_4',
      packet_version: VERSION,
      id: id('patch_plan'),
      created_at: now(),
      source_promotion_decision: text(report && report.decision),
      proposal_id: text((proposal && proposal.id) || (report && report.proposal_id)),
      target_layer: target,
      title: text(proposal && proposal.title),
      intent: text(proposal && proposal.proposed_change),
      rationale: text(proposal && proposal.rationale),
      target_files: targetFilesFor(proposal, report),
      tests_required: testsFrom(report, proposal),
      rollback_notes: [
        'Do not delete the previous module or patch file until replacement passes tests.',
        'Keep the prior script include available for rollback.',
        'If any expected browser test fails, revert the candidate and preserve the failure report.'
      ],
      risk_notes: [],
      implementation_steps: [],
      application_state: {
        runtime_enabled: false,
        patch_applied: false,
        source_rewritten: false,
        import_executed: false,
        core_doctrine_changed: false,
        explicit_apply_required: true
      },
      doctrine: {
        plan_is_not_patch_application: true,
        no_source_write_in_browser_runtime: true,
        tests_required_before_promotion: true,
        rollback_must_remain_available: true,
        protected_core_cannot_be_rewritten_directly: true
      },
      raw: {
        promotion_report: clone(report || {}),
        proposal: clone(proposal || {})
      }
    };
  }

  function riskNotes(report, proposal) {
    const notes = [];
    const target = lower((proposal && proposal.target_layer) || (report && report.target_layer));
    const decision = text(report && report.decision);
    if (/governor|brain|motivation|probability|consistency|intention/.test(target)) notes.push('Adapter-level change can affect broad reasoning behavior; run integrated suite after local test.');
    if (decision === 'PATCH_CANDIDATE_ONLY') notes.push('Patch candidate requires source review and fetch-back verification before commit.');
    if (decision === 'PROMOTE_RUNTIME_CANDIDATE') notes.push('Runtime candidate must stay disabled until explicit apply and inspection.');
    if (asArray(report && report.issues).some(i => i.code === 'governor_caps_maturity')) notes.push('Governor cap remains visible; candidate staging is not final promotion.');
    if (!testsFrom(report, proposal).length) notes.push('No required tests listed; plan cannot be applied.');
    return notes;
  }

  function runtimeSteps(plan) {
    return [
      'Stage the runtime behavior as disabled candidate data only.',
      'Expose candidate in a review queue with title, target layer, rationale, tests, and rollback notes.',
      'Require explicit user/runtime apply before enabling the candidate.',
      'After apply, run the integrated v0.4 suite and preserve the result.'
    ];
  }

  function patchSteps(plan) {
    return [
      'Create a patch proposal naming exact target file(s) and test file(s).',
      'Fetch each target file and use its current blob SHA before any update.',
      'Apply one small source change at a time, preferably as a patch file rather than replacing core doctrine.',
      'Fetch back every changed file and verify the exact change.',
      'Run listed tests, then run kernel-test-suite-v0-4.html.',
      'If any test fails, revert or add a narrow patch preserving failure details.'
    ];
  }

  function holdPlan(report, proposal) {
    const plan = basePlan(report, proposal);
    plan.decision = DECISIONS.HOLD_NOT_READY;
    plan.reason = 'Promotion report is not ready for runtime or patch planning.';
    plan.risk_notes = riskNotes(report, proposal).concat(asArray(report && report.issues).map(i => `${i.code}: ${i.message}`));
    plan.implementation_steps = ['Do not stage or patch yet.', 'Supply missing tests, rationale, target layer, or evidence.', 'Re-run promotion pipeline evaluation.'];
    return plan;
  }

  function blockedPlan(report, proposal) {
    const plan = basePlan(report, proposal);
    plan.decision = DECISIONS.BLOCKED;
    plan.reason = 'Promotion report blocks this proposal.';
    plan.risk_notes = riskNotes(report, proposal).concat(asArray(report && report.issues).map(i => `${i.code}: ${i.message}`));
    plan.implementation_steps = ['Do not stage, patch, or enable.', 'Preserve blocked audit trail.', 'Rewrite proposal away from protected core or unsafe self-modification if appropriate.'];
    return plan;
  }

  function createPlan(input, options = {}) {
    const report = promotionReport(input);
    const proposal = proposalFrom(report, input);
    if (!report) {
      return {
        packet_type: '42ndMind_kernel_patch_candidate_plan_v0_4',
        packet_version: VERSION,
        id: id('patch_plan_invalid'),
        created_at: now(),
        decision: DECISIONS.HOLD_NOT_READY,
        reason: 'No promotion pipeline report could be produced.',
        application_state: { runtime_enabled:false, patch_applied:false, source_rewritten:false, import_executed:false, core_doctrine_changed:false, explicit_apply_required:true },
        doctrine: { plan_is_not_patch_application:true, no_source_write_in_browser_runtime:true }
      };
    }

    if (report.decision === 'BLOCK_PROMOTION') return blockedPlan(report, proposal);
    if (report.decision === 'HOLD_FOR_MORE_EVIDENCE') return holdPlan(report, proposal);

    const plan = basePlan(report, proposal);
    plan.risk_notes = riskNotes(report, proposal);

    if (report.decision === 'PROMOTE_RUNTIME_CANDIDATE') {
      plan.decision = DECISIONS.RUNTIME_PLAN_READY;
      plan.reason = 'Promotion report allows disabled runtime-candidate staging only.';
      plan.runtime_candidate = {
        enabled: false,
        storage_key: '42ndMind_runtime_candidates_v0_4',
        activation_requires_explicit_apply: true
      };
      plan.implementation_steps = runtimeSteps(plan);
    } else if (report.decision === 'PATCH_CANDIDATE_ONLY') {
      plan.decision = DECISIONS.PATCH_PLAN_READY;
      plan.reason = 'Promotion report allows patch planning only; no source write occurs here.';
      plan.patch_candidate = {
        patch_applied: false,
        suggested_patch_mode: 'small_patch_file_or_single_file_update_with_sha_fetch_back',
        target_files_locked: false
      };
      plan.implementation_steps = patchSteps(plan);
    } else {
      return holdPlan(report, proposal);
    }

    return plan;
  }

  function createMany(inputs, options = {}) {
    const plans = asArray(inputs).map(i => createPlan(i, options));
    return {
      packet_type: '42ndMind_kernel_patch_candidate_batch_v0_4',
      packet_version: VERSION,
      created_at: now(),
      count: plans.length,
      plans,
      summary: {
        runtime_plan_ready: plans.filter(p => p.decision === DECISIONS.RUNTIME_PLAN_READY).length,
        patch_plan_ready: plans.filter(p => p.decision === DECISIONS.PATCH_PLAN_READY).length,
        hold_not_ready: plans.filter(p => p.decision === DECISIONS.HOLD_NOT_READY).length,
        blocked: plans.filter(p => p.decision === DECISIONS.BLOCKED).length
      },
      doctrine: {
        batch_plan_is_not_application: true,
        no_source_write: true,
        no_runtime_enablement: true
      }
    };
  }

  function sampleInput(kind) {
    if (global.KernelPromotionPipelineV04 && typeof global.KernelPromotionPipelineV04.sampleProposal === 'function') {
      return global.KernelPromotionPipelineV04.sampleProposal(kind || 'runtime');
    }
    return { id:'proposal_runtime_queue', target_layer:'pending_import_review', title:'Add pending import review queue', proposed_change:'Show pending commands.', rationale:'Improve review.', tests_required:['kernel-state-v0-4-test.html'] };
  }

  global.KernelPatchCandidateV04 = Object.freeze({
    VERSION,
    DECISIONS,
    TARGET_FILE_MAP,
    createPlan,
    createMany,
    sampleInput,
    targetFilesFor
  });
})(typeof window !== 'undefined' ? window : globalThis);
