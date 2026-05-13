/* 42ndMind Source Patch Bridge v0.4
 *
 * Purpose:
 * Convert PATCH_PLAN_READY outputs into GitHub-safe external write packets.
 *
 * This module does not write files, fetch SHAs, apply patches, run tests,
 * or verify GitHub contents. It only creates a strict packet for an external
 * tool/operator to perform SHA fetch -> small write -> fetch-back verify -> test.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    PATCH_PACKET_READY: 'PATCH_PACKET_READY',
    HOLD_NOT_READY: 'HOLD_NOT_READY',
    BLOCKED: 'BLOCKED'
  });

  const PROTECTED_PATH_PATTERNS = Object.freeze([
    /^CURRENT_PROGRESS\.md$/,
    /^HANDOFF_.*\.md$/,
    /^BACKLOG_.*\.md$/
  ]);

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function id(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

  function planFrom(input) {
    if (input && input.packet_type === '42ndMind_kernel_patch_candidate_plan_v0_4') return input;
    if (global.KernelPatchCandidateV04 && typeof global.KernelPatchCandidateV04.createPlan === 'function') return global.KernelPatchCandidateV04.createPlan(input || {});
    return null;
  }

  function sandboxFrom(options) {
    return options && options.sandbox_report ? options.sandbox_report : null;
  }

  function isSourcePath(path) {
    return /\.(js|html|css|json|md)$/.test(text(path));
  }

  function isProtectedPath(path) {
    const p = text(path);
    return PROTECTED_PATH_PATTERNS.some(re => re.test(p));
  }

  function isProtectedCoreTarget(plan) {
    const target = lower(plan && plan.target_layer);
    const body = lower([plan && plan.title, plan && plan.intent, plan && plan.rationale].join(' '));
    return /core_doctrine|objective_peak|null_origin|octahedron_surface_rule|axis_semantics|governor_final_authority/.test(target + ' ' + body);
  }

  function testsFrom(plan) {
    return Array.from(new Set(asArray(plan && plan.tests_required).map(text).filter(Boolean)));
  }

  function targetFilesFrom(plan) {
    return Array.from(new Set(asArray(plan && plan.target_files).map(text).filter(Boolean))).filter(isSourcePath);
  }

  function sandboxFailed(sandbox) {
    if (!sandbox) return false;
    return sandbox.decision === 'BLOCK_BEHAVIOR_DRIFT' || sandbox.decision === 'BLOCK_UNSAFE_CANDIDATE' || sandbox.behavior_delta_detected === true;
  }

  function shaFor(path, options) {
    const shaMap = options && options.sha_map || {};
    return text(shaMap[path] || '');
  }

  function buildFileOperation(path, plan, options) {
    const currentSha = shaFor(path, options);
    return {
      file_path: path,
      operation: 'update_file_with_sha_required',
      patch_mode: options && options.patch_mode || 'small_full_file_replacement_or_narrow_patch_file',
      expected_current_sha: currentSha || null,
      current_sha_required_before_write: true,
      current_sha_available: !!currentSha,
      intended_edit_summary: text(plan.intent) || 'Apply the planned patch candidate change.',
      write_constraints: [
        'fetch file first and use current blob SHA',
        'make one small change at a time',
        'do not rewrite protected core doctrine directly',
        'do not trust write until fetch-back verifies exact change'
      ],
      fetch_back_verification: {
        required: true,
        verify_exact_change: true,
        verify_script_version_or_visible_marker: true,
        verify_no_unrelated_rewrite: true
      },
      rollback_strategy: {
        required: true,
        rollback_mode: 'restore_previous_blob_or_add_revert_patch',
        rollback_notes: asArray(plan.rollback_notes)
      }
    };
  }

  function issuesFor(plan, sandbox, options) {
    const issues = [];
    if (!plan) issues.push({ severity:'block', code:'missing_plan', message:'No patch plan is available.' });
    if (plan && plan.decision !== 'PATCH_PLAN_READY') issues.push({ severity:'block', code:'plan_not_patch_ready', message:'Only PATCH_PLAN_READY plans can become source patch bridge packets.' });
    if (plan && isProtectedCoreTarget(plan)) issues.push({ severity:'block', code:'protected_core_target', message:'Protected core doctrine or equivalent invariant cannot be rewritten through this bridge.' });
    if (plan && !testsFrom(plan).length) issues.push({ severity:'block', code:'tests_missing', message:'Patch bridge requires listed tests.' });
    if (plan && !targetFilesFrom(plan).length) issues.push({ severity:'block', code:'target_files_missing', message:'Patch bridge requires at least one source target file.' });
    if (plan && targetFilesFrom(plan).some(isProtectedPath)) issues.push({ severity:'hold', code:'handoff_or_status_file_targeted', message:'Patch target includes handoff/status file; keep source patch packets focused on runtime/source files.' });
    if (sandboxFailed(sandbox)) issues.push({ severity:'block', code:'sandbox_comparison_failed', message:'Sandbox comparison failed or detected behavior drift.' });
    if (options && options.require_sha === true && plan && targetFilesFrom(plan).some(path => !shaFor(path, options))) issues.push({ severity:'hold', code:'sha_missing', message:'At least one target file is missing expected current SHA.' });
    return issues;
  }

  function createPacket(input, options = {}) {
    const plan = planFrom(input);
    const sandbox = sandboxFrom(options);
    const issues = issuesFor(plan, sandbox, options);
    const targetFiles = plan ? targetFilesFrom(plan) : [];
    const tests = plan ? testsFrom(plan) : [];
    const block = issues.some(i => i.severity === 'block');
    const hold = issues.some(i => i.severity === 'hold');
    const decision = block ? DECISIONS.BLOCKED : hold ? DECISIONS.HOLD_NOT_READY : DECISIONS.PATCH_PACKET_READY;

    return {
      packet_type: '42ndMind_source_patch_bridge_packet_v0_4',
      packet_version: VERSION,
      id: id('source_patch_bridge'),
      created_at: now(),
      decision,
      issues,
      plan_id: text(plan && plan.id),
      proposal_id: text(plan && plan.proposal_id),
      target_layer: text(plan && plan.target_layer),
      title: text(plan && plan.title),
      intent: text(plan && plan.intent),
      target_files: targetFiles,
      tests_required: tests,
      sandbox_gate: sandbox ? {
        supplied: true,
        decision: text(sandbox.decision),
        behavior_delta_detected: !!sandbox.behavior_delta_detected,
        accepted: !sandboxFailed(sandbox)
      } : {
        supplied: false,
        accepted: true,
        note: 'No sandbox report supplied. Bridge can plan packet, but external operator should run sandbox before source write.'
      },
      file_operations: decision === DECISIONS.PATCH_PACKET_READY ? targetFiles.map(path => buildFileOperation(path, plan, options)) : [],
      external_write_protocol: {
        external_tool_required: true,
        browser_kernel_writes_source: false,
        steps: [
          'fetch target file and current blob SHA',
          'apply one small write with current SHA',
          'wait for commit SHA',
          'fetch file back and verify exact change',
          'run listed local/module tests',
          'run integrated suite or activation add-on suite as applicable',
          'record pass/fail packet before any promotion claim'
        ]
      },
      post_write_requirements: {
        fetch_back_verification_required: true,
        tests_must_pass: true,
        rollback_required_on_failure: true,
        handoff_update_recommended: true
      },
      application_state: {
        source_written: false,
        commit_created: false,
        fetch_back_verified: false,
        tests_run: false,
        rollback_performed: false,
        core_doctrine_changed: false
      },
      doctrine: {
        bridge_plans_writes_only: true,
        external_github_tool_performs_writes: true,
        browser_kernel_never_writes_source_directly: true,
        fetch_back_verification_required: true,
        protected_core_cannot_be_rewritten_directly: true,
        patch_packet_is_not_patch_application: true
      },
      raw: {
        plan: plan ? clone(plan) : null,
        sandbox_report: sandbox ? clone(sandbox) : null
      }
    };
  }

  function sampleInput(kind) {
    if (global.KernelPatchCandidateV04 && typeof global.KernelPatchCandidateV04.sampleInput === 'function') {
      return global.KernelPatchCandidateV04.sampleInput(kind || 'patch');
    }
    return {
      packet_type:'42ndMind_kernel_patch_candidate_plan_v0_4',
      decision:'PATCH_PLAN_READY',
      id:'sample_patch_plan',
      target_layer:'probability_adapter',
      title:'Refine probability interval display',
      intent:'Improve probability diagnostics while preserving caps.',
      target_files:['src/kernel-probability-v0-4.js', 'kernel-probability-v0-4-test.html'],
      tests_required:['kernel-probability-v0-4-test.html', 'kernel-test-suite-v0-4.html'],
      rollback_notes:['Restore previous blob if tests fail.']
    };
  }

  function sampleSandbox(kind) {
    if (kind === 'failed') return { packet_type:'42ndMind_sandbox_comparison_report_v0_4', decision:'BLOCK_BEHAVIOR_DRIFT', behavior_delta_detected:true };
    return { packet_type:'42ndMind_sandbox_comparison_report_v0_4', decision:'PASS_NO_BEHAVIOR_DELTA', behavior_delta_detected:false };
  }

  global.KernelSourcePatchBridgeV04 = Object.freeze({
    VERSION,
    DECISIONS,
    createPacket,
    sampleInput,
    sampleSandbox,
    targetFilesFrom,
    testsFrom,
    isProtectedCoreTarget
  });
})(typeof window !== 'undefined' ? window : globalThis);
