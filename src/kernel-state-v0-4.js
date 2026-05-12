/* 42ndMind Kernel State v0.4
 *
 * Controlled v0.4 kernel-state store.
 *
 * This is the first actual v0.4 state layer. It mutates only the v0.4
 * localStorage state key and only when explicitly called. It does not touch
 * v0.3 state, does not auto-import, and does not treat command-shaped input
 * as applied belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DEFAULT_STATE_KEY = '42ndMind_kernel_state_v0_4';
  const DEFAULT_AUDIT_KEY = '42ndMind_kernel_state_v0_4_audit';

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

  function emptyState() {
    return {
      state_type: '42ndMind_kernel_state_v0_4',
      state_version: VERSION,
      created_at: now(),
      updated_at: now(),
      doctrine: {
        one_brain_runtime_state: true,
        v0_3_untouched: true,
        explicit_apply_required: true,
        command_import_is_pending_until_live_import: true,
        candidates_are_not_beliefs: true,
        near_null_is_non_scoring: true,
        no_auto_rule_promotion: true
      },
      counters: {
        applied_reports: 0,
        near_null_observations: 0,
        clarification_requests: 0,
        blocked_audits: 0,
        candidate_pressures: 0,
        allowed_pressures: 0,
        pending_imports: 0
      },
      near_null_observations: [],
      clarification_requests: [],
      blocked_audits: [],
      candidate_pressures: [],
      allowed_pressures: [],
      pending_imports: [],
      audit: []
    };
  }

  function loadState(key = DEFAULT_STATE_KEY) {
    if (!storageAvailable()) return emptyState();
    const raw = localStorage.getItem(key);
    if (!raw) return emptyState();
    const state = safeParse(raw, null);
    if (!state || state.state_type !== '42ndMind_kernel_state_v0_4') return emptyState();
    return state;
  }

  function saveState(state, key = DEFAULT_STATE_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    const next = clone(state || emptyState());
    next.updated_at = now();
    localStorage.setItem(key, JSON.stringify(next, null, 2));
    return { ok:true, reason:'saved_kernel_state_v0_4', key, state:next };
  }

  function clearState(key = DEFAULT_STATE_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    localStorage.removeItem(key);
    return { ok:true, reason:'cleared_kernel_state_v0_4', key };
  }

  function validReport(report) {
    return !!(report && typeof report === 'object' && report.packet_type === '42ndMind_kernel_brain_v0_4_report');
  }

  function compactReport(report) {
    return {
      report_packet_type: text(report.packet_type),
      report_packet_version: text(report.packet_version),
      final_decision: text(report.final_decision),
      input_kind: text(report.input_kind),
      input_preview: text(report.input_preview),
      final_reason: text(report.final_reason),
      belief_movement: text(report.belief_movement || 'none'),
      near_null: report.near_null === true,
      allowed_for_belief_pressure: report.allowed_for_belief_pressure === true,
      sanitized_command_present: !!report.sanitized_command
    };
  }

  function applyKind(report) {
    switch (text(report.final_decision)) {
      case 'NEAR_NULL': return 'near_null_observation';
      case 'CLARIFY': return 'clarification_request';
      case 'BLOCK': return 'blocked_audit';
      case 'CAP_MATURITY': return 'candidate_pressure_capped';
      case 'HOLD_AS_CANDIDATE': return 'candidate_pressure_held';
      case 'ALLOW_PRESSURE': return 'allowed_pressure_unapplied';
      case 'SAFE_TO_IMPORT': return 'pending_import_safe';
      case 'IMPORT_WITH_CAUTION': return 'pending_import_caution';
      default: return 'unknown_report_decision';
    }
  }

  function baseEntry(report, options) {
    return {
      id: id('state_entry'),
      created_at: now(),
      entry_type: applyKind(report),
      explicit_apply: options && options.explicit_apply === true,
      non_scoring: report.final_decision === 'NEAR_NULL' || report.final_decision === 'CLARIFY' || report.final_decision === 'BLOCK',
      belief_movement: 'none',
      kernel_state_mutation_scope: 'v0_4_state_only',
      v0_3_untouched: true,
      report: compactReport(report)
    };
  }

  function addAudit(state, action, entry, result) {
    state.audit.push({
      id: id('audit'),
      created_at: now(),
      action,
      entry_id: entry && entry.id || null,
      entry_type: entry && entry.entry_type || null,
      result: result || 'recorded',
      doctrine: {
        audit_is_not_belief_movement: true,
        explicit_apply_required: true
      }
    });
  }

  function applyReport(report, options = {}) {
    const key = options.state_key || DEFAULT_STATE_KEY;
    if (!validReport(report)) {
      return { ok:false, reason:'invalid_v0_4_report', applied:false, state:null, entry:null };
    }
    if (options.explicit_apply !== true) {
      return { ok:false, reason:'explicit_apply_required', applied:false, state:loadState(key), entry:null };
    }

    const state = loadState(key);
    const entry = baseEntry(report, options);
    const decision = text(report.final_decision);

    if (decision === 'NEAR_NULL') {
      entry.observation = { reason:text(report.final_reason), near_null:true };
      state.near_null_observations.push(entry);
      state.counters.near_null_observations += 1;
    } else if (decision === 'CLARIFY') {
      entry.clarification = { reason:text(report.final_reason), input_preview:text(report.input_preview) };
      state.clarification_requests.push(entry);
      state.counters.clarification_requests += 1;
    } else if (decision === 'BLOCK') {
      entry.block = { reason:text(report.final_reason), source:'KernelBrainV04.final_decision' };
      state.blocked_audits.push(entry);
      state.counters.blocked_audits += 1;
    } else if (decision === 'CAP_MATURITY' || decision === 'HOLD_AS_CANDIDATE') {
      entry.candidate = { status:decision === 'CAP_MATURITY' ? 'capped_candidate' : 'held_candidate', reason:text(report.final_reason) };
      state.candidate_pressures.push(entry);
      state.counters.candidate_pressures += 1;
    } else if (decision === 'ALLOW_PRESSURE') {
      entry.allowed_pressure = { status:'allowed_pressure_not_applied_as_belief', reason:text(report.final_reason) };
      state.allowed_pressures.push(entry);
      state.counters.allowed_pressures += 1;
    } else if (decision === 'SAFE_TO_IMPORT' || decision === 'IMPORT_WITH_CAUTION') {
      entry.pending_import = {
        caution: decision === 'IMPORT_WITH_CAUTION',
        sanitized_command: report.sanitized_command ? clone(report.sanitized_command) : null,
        command_import_executed: false,
        reason: report.sanitized_command ? 'Sanitized command stored as pending import only.' : 'No sanitized command was present.'
      };
      state.pending_imports.push(entry);
      state.counters.pending_imports += 1;
    } else {
      entry.block = { reason:'Unknown v0.4 final decision.', source:'KernelStateV04.applyReport' };
      state.blocked_audits.push(entry);
      state.counters.blocked_audits += 1;
    }

    state.counters.applied_reports += 1;
    addAudit(state, 'apply_v0_4_report', entry, 'recorded_v0_4_state_only');
    const saved = saveState(state, key);
    return { ok:saved.ok, reason:saved.reason, applied:saved.ok, state:saved.state, entry, doctrine:{ v0_4_state_only:true, v0_3_untouched:true, imports_not_executed:true } };
  }

  function snapshot(key = DEFAULT_STATE_KEY) {
    const state = loadState(key);
    return {
      packet_type: '42ndMind_kernel_state_v0_4_snapshot',
      packet_version: VERSION,
      created_at: now(),
      key,
      counters: clone(state.counters),
      latest: {
        near_null_observations: state.near_null_observations.slice(-3),
        clarification_requests: state.clarification_requests.slice(-3),
        blocked_audits: state.blocked_audits.slice(-3),
        candidate_pressures: state.candidate_pressures.slice(-3),
        allowed_pressures: state.allowed_pressures.slice(-3),
        pending_imports: state.pending_imports.slice(-3),
        audit: state.audit.slice(-5)
      },
      doctrine: clone(state.doctrine)
    };
  }

  function exportState(key = DEFAULT_STATE_KEY) {
    return {
      packet_type: '42ndMind_kernel_state_v0_4_export',
      packet_version: VERSION,
      created_at: now(),
      key,
      state: loadState(key),
      doctrine: {
        export_is_not_import: true,
        v0_4_state_only: true,
        v0_3_untouched: true
      }
    };
  }

  global.KernelStateV04 = Object.freeze({
    VERSION,
    DEFAULT_STATE_KEY,
    DEFAULT_AUDIT_KEY,
    emptyState,
    loadState,
    saveState,
    clearState,
    applyReport,
    snapshot,
    exportState
  });
})(typeof window !== 'undefined' ? window : globalThis);
