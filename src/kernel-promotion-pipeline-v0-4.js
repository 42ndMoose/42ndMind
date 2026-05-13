/* 42ndMind Kernel Promotion Pipeline v0.4
 *
 * Purpose:
 * Evaluate self-maintenance proposals and decide whether they remain candidates,
 * become runtime candidates, become patch candidates, or are blocked.
 *
 * This pipeline does not apply patches, execute imports, rewrite source files,
 * or promote protected doctrine. It is a promotion evaluator only.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    PROMOTE_RUNTIME_CANDIDATE: 'PROMOTE_RUNTIME_CANDIDATE',
    HOLD_FOR_MORE_EVIDENCE: 'HOLD_FOR_MORE_EVIDENCE',
    BLOCK_PROMOTION: 'BLOCK_PROMOTION',
    PATCH_CANDIDATE_ONLY: 'PATCH_CANDIDATE_ONLY'
  });

  const RUNTIME_TARGETS = Object.freeze([
    'sensemaking_adapter',
    'state_candidate_review',
    'pending_import_review',
    'runtime_visibility',
    'diagnostics',
    'ui_review_queue',
    'self_maintenance_baseline'
  ]);

  const PATCH_TARGETS = Object.freeze([
    'governor_adapter_boundary',
    'probability_adapter',
    'consistency_adapter',
    'intention_recovery_adapter',
    'motivation_adapter',
    'kernel_brain_adapter',
    'source_registry_adapter'
  ]);

  const PROTECTED_TARGETS = Object.freeze([
    'core_doctrine',
    'objective_peak',
    'null_origin',
    'octahedron_surface_rule',
    'axis_semantics',
    'governor_final_authority',
    'auto_rule_promotion',
    'delete_unresolved_pressure',
    'delete_contradiction'
  ]);

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function collectText(proposal) {
    return lower([
      proposal && proposal.id,
      proposal && proposal.target_layer,
      proposal && proposal.title,
      proposal && proposal.proposed_change,
      proposal && proposal.rationale,
      asArray(proposal && proposal.tests_required).join(' ')
    ].join(' '));
  }

  function hasUnsafeLanguage(proposal) {
    const t = collectText(proposal);
    return /\b(auto[- ]?promote|direct self rewrite|rewrite core|ignore tests|skip tests|bypass governor|disable provenance|retrieval equals verification|delete unresolved|delete contradiction|force certainty|treat probability as truth)\b/.test(t);
  }

  function targetLayer(proposal) {
    return lower(proposal && proposal.target_layer);
  }

  function isProtectedTarget(proposal) {
    const target = targetLayer(proposal);
    const full = collectText(proposal);
    return PROTECTED_TARGETS.includes(target) || PROTECTED_TARGETS.some(t => full.includes(t));
  }

  function isRuntimeTarget(proposal) {
    const target = targetLayer(proposal);
    return RUNTIME_TARGETS.includes(target) || /queue|visibility|diagnostic|review|ui|clarification|summary/.test(target);
  }

  function isPatchTarget(proposal) {
    const target = targetLayer(proposal);
    return PATCH_TARGETS.includes(target) || /adapter|module|pipeline|brain|governor/.test(target);
  }

  function testsRequired(proposal) {
    return asArray(proposal && proposal.tests_required).map(text).filter(Boolean);
  }

  function hasRequiredTests(proposal) {
    return testsRequired(proposal).length > 0;
  }

  function selfMaintenanceEvaluation(proposal) {
    if (proposal && proposal.evaluation) return proposal.evaluation;
    if (global.KernelSelfMaintenanceV04 && typeof global.KernelSelfMaintenanceV04.evaluateProposal === 'function') {
      return global.KernelSelfMaintenanceV04.evaluateProposal(proposal || {});
    }
    return null;
  }

  function governorCandidateFor(proposal) {
    return {
      candidate_type: 'promotion_pipeline_candidate',
      text: text(proposal && (proposal.title || proposal.proposed_change || proposal.id)),
      support_status: 'candidate',
      source_ids: [],
      evidence: testsRequired(proposal).map(t => ({ text:t, relation:'required_test' })),
      attacks: hasUnsafeLanguage(proposal) ? ['unsafe_self_modification_language'] : [],
      questions: hasRequiredTests(proposal) ? [] : ['Which tests must pass before promotion?'],
      confidence: 0.5,
      status: 'candidate',
      mechanism_class: 'self_maintenance_promotion',
      raw: { proposal: clone(proposal || {}) }
    };
  }

  function governorReportFor(proposal) {
    if (global.KernelEpistemicGovernorV01 && typeof global.KernelEpistemicGovernorV01.assess === 'function') {
      return global.KernelEpistemicGovernorV01.assess(governorCandidateFor(proposal));
    }
    return null;
  }

  function issue(severity, code, message) {
    return { severity, code, message };
  }

  function evaluate(proposal = {}, options = {}) {
    const issues = [];
    const tests = testsRequired(proposal);
    const selfEval = selfMaintenanceEvaluation(proposal);
    const governorReport = governorReportFor(proposal);

    if (!proposal || typeof proposal !== 'object') issues.push(issue('block', 'invalid_proposal', 'Proposal must be an object.'));
    if (!text(proposal.id)) issues.push(issue('caution', 'missing_id', 'Proposal has no stable id.'));
    if (!text(proposal.title)) issues.push(issue('caution', 'missing_title', 'Proposal has no title.'));
    if (!text(proposal.target_layer)) issues.push(issue('block', 'missing_target_layer', 'Proposal has no target layer.'));
    if (!text(proposal.proposed_change)) issues.push(issue('caution', 'missing_proposed_change', 'Proposal has no proposed change.'));
    if (!text(proposal.rationale)) issues.push(issue('caution', 'missing_rationale', 'Proposal has no rationale.'));
    if (!tests.length) issues.push(issue('hold', 'missing_tests', 'Proposal has no required tests.'));
    if (isProtectedTarget(proposal)) issues.push(issue('block', 'protected_core_target', 'Proposal targets protected core doctrine or equivalent invariant.'));
    if (hasUnsafeLanguage(proposal)) issues.push(issue('block', 'unsafe_self_modification_language', 'Proposal contains unsafe self-modification language.'));
    if (selfEval && selfEval.decision === 'BLOCK_PROMOTION') issues.push(issue('block', 'self_maintenance_evaluation_blocked', 'Self-maintenance evaluation blocks promotion.'));
    if (governorReport && governorReport.decision === 'BLOCK_MOVEMENT') issues.push(issue('block', 'governor_blocked_candidate', 'Governor blocks movement for this promotion candidate.'));
    if (governorReport && governorReport.decision === 'CAP_MATURITY') issues.push(issue('hold', 'governor_caps_maturity', 'Governor caps maturity; promotion should remain bounded.'));

    let decision = DECISIONS.HOLD_FOR_MORE_EVIDENCE;
    if (issues.some(i => i.severity === 'block')) decision = DECISIONS.BLOCK_PROMOTION;
    else if (!tests.length || issues.some(i => i.severity === 'hold')) decision = DECISIONS.HOLD_FOR_MORE_EVIDENCE;
    else if (isRuntimeTarget(proposal)) decision = DECISIONS.PROMOTE_RUNTIME_CANDIDATE;
    else if (isPatchTarget(proposal)) decision = DECISIONS.PATCH_CANDIDATE_ONLY;
    else decision = DECISIONS.HOLD_FOR_MORE_EVIDENCE;

    return {
      packet_type: '42ndMind_kernel_promotion_pipeline_report_v0_4',
      packet_version: VERSION,
      created_at: now(),
      proposal_id: text(proposal.id),
      target_layer: text(proposal.target_layer),
      decision,
      issues,
      tests_required: tests,
      self_maintenance_evaluation: selfEval,
      governor_candidate: governorCandidateFor(proposal),
      governor_report: governorReport,
      promotion_effect: {
        runtime_enabled: false,
        patch_applied: false,
        source_rewritten: false,
        import_executed: false,
        core_doctrine_changed: false
      },
      next_step: nextStep(decision),
      doctrine: {
        evaluation_is_not_promotion: true,
        promotion_requires_tests: true,
        governor_must_assess_before_promotion: true,
        protected_core_cannot_be_rewritten_directly: true,
        probability_is_not_truth: true,
        unresolved_pressure_must_remain_visible: true
      }
    };
  }

  function nextStep(decision) {
    if (decision === DECISIONS.PROMOTE_RUNTIME_CANDIDATE) return 'Eligible to be staged as disabled runtime candidate; explicit enablement still required.';
    if (decision === DECISIONS.PATCH_CANDIDATE_ONLY) return 'Eligible to become a patch plan; no source write is allowed here.';
    if (decision === DECISIONS.BLOCK_PROMOTION) return 'Do not promote. Preserve audit reason.';
    return 'Hold until required tests/evidence/rationale are supplied.';
  }

  function evaluateMany(proposals, options = {}) {
    const reports = asArray(proposals).map(p => evaluate(p, options));
    return {
      packet_type: '42ndMind_kernel_promotion_pipeline_batch_report_v0_4',
      packet_version: VERSION,
      created_at: now(),
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
        no_patch_application: true
      }
    };
  }

  function sampleProposal(kind) {
    if (kind === 'runtime') return {
      id:'proposal_runtime_queue',
      target_layer:'pending_import_review',
      title:'Add pending import review queue',
      proposed_change:'Show pending sanitized commands with caution status and import-executed=false until a separate live runtime imports them.',
      rationale:'Pending commands are already separated from belief movement. A queue makes them easier to inspect without accidental execution.',
      tests_required:['kernel-command-preflight-test.html', 'kernel-state-v0-4-test.html']
    };
    if (kind === 'patch') return {
      id:'proposal_probability_adapter',
      target_layer:'probability_adapter',
      title:'Refine probability interval display',
      proposed_change:'Improve probability interval diagnostics while preserving contradiction caps and duplicate provenance limits.',
      rationale:'The probability adapter can become clearer without changing core doctrine.',
      tests_required:['kernel-probability-v0-4-test.html', 'kernel-test-suite-v0-4.html']
    };
    if (kind === 'blocked') return {
      id:'bad_core',
      target_layer:'core_doctrine',
      title:'Rewrite objective peak',
      proposed_change:'rewrite core and auto-promote this rule while skipping tests',
      rationale:'skip tests',
      tests_required:[]
    };
    if (kind === 'hold') return {
      id:'proposal_missing_tests',
      target_layer:'diagnostics',
      title:'Improve blocked-pressure summary',
      proposed_change:'Group blocked pressure by reason.',
      rationale:'This might improve review visibility.',
      tests_required:[]
    };
    return sampleProposal('runtime');
  }

  global.KernelPromotionPipelineV04 = Object.freeze({
    VERSION,
    DECISIONS,
    RUNTIME_TARGETS,
    PATCH_TARGETS,
    PROTECTED_TARGETS,
    evaluate,
    evaluateMany,
    sampleProposal,
    governorCandidateFor
  });
})(typeof window !== 'undefined' ? window : globalThis);
