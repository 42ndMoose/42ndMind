/* 42ndMind Runtime Candidates v0.4
 *
 * Purpose:
 * Stage approved runtime-candidate plans into a disabled review queue.
 *
 * This module does not execute behavior. It does not rewrite source files,
 * import commands, mutate v0.3, or change core doctrine. Enabling a candidate
 * only changes candidate metadata and still requires a separate runtime to
 * interpret enabled candidates.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DEFAULT_KEY = '42ndMind_runtime_candidates_v0_4';
  const STATUSES = Object.freeze({
    STAGED_DISABLED: 'STAGED_DISABLED',
    ENABLED_METADATA_ONLY: 'ENABLED_METADATA_ONLY',
    DISABLED: 'DISABLED',
    REJECTED: 'REJECTED'
  });

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function id(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

  function storageAvailable() {
    try { return typeof localStorage !== 'undefined'; }
    catch (error) { return false; }
  }

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); }
    catch (error) { return fallback; }
  }

  function load(key = DEFAULT_KEY) {
    if (!storageAvailable()) return [];
    const raw = localStorage.getItem(key);
    const parsed = raw ? safeParse(raw, []) : [];
    return Array.isArray(parsed) ? parsed : [];
  }

  function save(candidates, key = DEFAULT_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    localStorage.setItem(key, JSON.stringify(asArray(candidates), null, 2));
    return { ok:true, reason:'saved_runtime_candidates', key, count:asArray(candidates).length };
  }

  function clear(key = DEFAULT_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    localStorage.removeItem(key);
    return { ok:true, reason:'cleared_runtime_candidates', key };
  }

  function planFrom(input) {
    if (input && input.packet_type === '42ndMind_kernel_patch_candidate_plan_v0_4') return input;
    if (global.KernelPatchCandidateV04 && typeof global.KernelPatchCandidateV04.createPlan === 'function') {
      return global.KernelPatchCandidateV04.createPlan(input || {});
    }
    return null;
  }

  function candidateFromPlan(plan) {
    return {
      candidate_type: '42ndMind_runtime_candidate_v0_4',
      candidate_version: VERSION,
      id: id('runtime_candidate'),
      created_at: now(),
      updated_at: now(),
      status: STATUSES.STAGED_DISABLED,
      enabled: false,
      title: text(plan && plan.title),
      proposal_id: text(plan && plan.proposal_id),
      target_layer: text(plan && plan.target_layer),
      intent: text(plan && plan.intent),
      rationale: text(plan && plan.rationale),
      source_plan_id: text(plan && plan.id),
      target_files: asArray(plan && plan.target_files),
      tests_required: asArray(plan && plan.tests_required),
      rollback_notes: asArray(plan && plan.rollback_notes),
      risk_notes: asArray(plan && plan.risk_notes),
      activation_requirements: {
        explicit_enable_required: true,
        tests_passed_required: true,
        integrated_suite_passed_required: true,
        manual_review_required: true,
        plan_must_be_runtime_ready: true
      },
      activation_record: null,
      runtime_effect: {
        behavior_executed: false,
        source_rewritten: false,
        import_executed: false,
        core_doctrine_changed: false,
        v0_3_touched: false
      },
      doctrine: {
        staged_candidate_is_not_enabled_behavior: true,
        enablement_is_metadata_only: true,
        no_source_write: true,
        no_auto_execution: true,
        protected_core_cannot_be_changed_by_candidate: true
      },
      raw: { plan: clone(plan || {}) }
    };
  }

  function stage(input, options = {}) {
    const key = options.key || DEFAULT_KEY;
    const plan = planFrom(input);
    if (!plan) return { ok:false, reason:'no_plan_available', staged:false, candidate:null };
    if (plan.decision !== 'RUNTIME_PLAN_READY') {
      return { ok:false, reason:'plan_not_runtime_ready', staged:false, plan_decision:plan.decision, candidate:null, plan };
    }
    if (options.explicit_stage !== true) {
      return { ok:false, reason:'explicit_stage_required', staged:false, candidate:null, plan };
    }
    const candidates = load(key);
    const candidate = candidateFromPlan(plan);
    candidates.push(candidate);
    const saved = save(candidates, key);
    return { ok:saved.ok, reason:saved.ok ? 'staged_runtime_candidate_disabled' : saved.reason, staged:saved.ok, candidate, key, count:candidates.length };
  }

  function findCandidate(candidates, candidate_id) {
    return asArray(candidates).find(c => c && c.id === candidate_id);
  }

  function enable(candidate_id, options = {}) {
    const key = options.key || DEFAULT_KEY;
    const candidates = load(key);
    const candidate = findCandidate(candidates, candidate_id);
    if (!candidate) return { ok:false, reason:'candidate_not_found', enabled:false };
    if (options.explicit_enable !== true) return { ok:false, reason:'explicit_enable_required', enabled:false, candidate };
    if (options.tests_passed !== true) return { ok:false, reason:'tests_passed_required', enabled:false, candidate };
    if (options.integrated_suite_passed !== true) return { ok:false, reason:'integrated_suite_passed_required', enabled:false, candidate };
    if (options.manual_reviewed !== true) return { ok:false, reason:'manual_review_required', enabled:false, candidate };

    candidate.status = STATUSES.ENABLED_METADATA_ONLY;
    candidate.enabled = true;
    candidate.updated_at = now();
    candidate.activation_record = {
      enabled_at: now(),
      explicit_enable: true,
      tests_passed: true,
      integrated_suite_passed: true,
      manual_reviewed: true,
      metadata_only: true,
      behavior_executed: false
    };
    candidate.runtime_effect.behavior_executed = false;
    candidate.runtime_effect.source_rewritten = false;
    candidate.runtime_effect.import_executed = false;
    candidate.runtime_effect.core_doctrine_changed = false;
    candidate.runtime_effect.v0_3_touched = false;

    const saved = save(candidates, key);
    return { ok:saved.ok, reason:saved.ok ? 'enabled_runtime_candidate_metadata_only' : saved.reason, enabled:saved.ok, candidate, key };
  }

  function disable(candidate_id, options = {}) {
    const key = options.key || DEFAULT_KEY;
    const candidates = load(key);
    const candidate = findCandidate(candidates, candidate_id);
    if (!candidate) return { ok:false, reason:'candidate_not_found', disabled:false };
    candidate.status = STATUSES.DISABLED;
    candidate.enabled = false;
    candidate.updated_at = now();
    candidate.disable_record = {
      disabled_at: now(),
      reason: text(options.reason || 'disabled_by_request')
    };
    const saved = save(candidates, key);
    return { ok:saved.ok, reason:saved.ok ? 'disabled_runtime_candidate' : saved.reason, disabled:saved.ok, candidate, key };
  }

  function reject(candidate_id, options = {}) {
    const key = options.key || DEFAULT_KEY;
    const candidates = load(key);
    const candidate = findCandidate(candidates, candidate_id);
    if (!candidate) return { ok:false, reason:'candidate_not_found', rejected:false };
    candidate.status = STATUSES.REJECTED;
    candidate.enabled = false;
    candidate.updated_at = now();
    candidate.rejection_record = {
      rejected_at: now(),
      reason: text(options.reason || 'rejected_by_review')
    };
    const saved = save(candidates, key);
    return { ok:saved.ok, reason:saved.ok ? 'rejected_runtime_candidate' : saved.reason, rejected:saved.ok, candidate, key };
  }

  function exportQueue(key = DEFAULT_KEY) {
    const candidates = load(key);
    return {
      packet_type: '42ndMind_runtime_candidates_export_v0_4',
      packet_version: VERSION,
      created_at: now(),
      key,
      count: candidates.length,
      candidates,
      summary: {
        staged_disabled: candidates.filter(c => c.status === STATUSES.STAGED_DISABLED).length,
        enabled_metadata_only: candidates.filter(c => c.status === STATUSES.ENABLED_METADATA_ONLY).length,
        disabled: candidates.filter(c => c.status === STATUSES.DISABLED).length,
        rejected: candidates.filter(c => c.status === STATUSES.REJECTED).length
      },
      doctrine: {
        export_is_not_execution: true,
        enabled_metadata_is_not_behavior_execution: true,
        no_source_write: true
      }
    };
  }

  function samplePlan(kind) {
    if (global.KernelPatchCandidateV04 && typeof global.KernelPatchCandidateV04.createPlan === 'function') {
      return global.KernelPatchCandidateV04.createPlan(global.KernelPatchCandidateV04.sampleInput(kind || 'runtime'));
    }
    return null;
  }

  global.KernelRuntimeCandidatesV04 = Object.freeze({
    VERSION,
    DEFAULT_KEY,
    STATUSES,
    load,
    save,
    clear,
    stage,
    enable,
    disable,
    reject,
    exportQueue,
    samplePlan
  });
})(typeof window !== 'undefined' ? window : globalThis);
