/* 42ndMind Kernel Brain v0.4 Runtime Bindings v0.1
 *
 * Controlled bridge from KernelBrainV04.process(report) output to browser
 * runtime memory.
 *
 * This module does not mutate v0.3 kernel state and does not run imports.
 * It only records non-scoring v0.4 runtime entries and, by explicit action,
 * saves sanitized commands as pending import material.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const DEFAULT_LOG_KEY = '42ndMind_v0_4_runtime_log';
  const DEFAULT_PENDING_COMMAND_KEY = '42ndMind_pending_kernel_command';

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }

  function storageAvailable() {
    try { return typeof localStorage !== 'undefined'; }
    catch (error) { return false; }
  }

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); }
    catch (error) { return fallback; }
  }

  function loadLog(key = DEFAULT_LOG_KEY) {
    if (!storageAvailable()) return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function saveLog(log, key = DEFAULT_LOG_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    localStorage.setItem(key, JSON.stringify(asArray(log), null, 2));
    return { ok:true, reason:'saved_runtime_log', key, count:asArray(log).length };
  }

  function appendLog(entry, key = DEFAULT_LOG_KEY) {
    const log = loadLog(key);
    log.push(entry);
    const saved = saveLog(log, key);
    return Object.assign({}, saved, { entry, log_count:log.length });
  }

  function clearLog(key = DEFAULT_LOG_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    localStorage.removeItem(key);
    return { ok:true, reason:'cleared_runtime_log', key };
  }

  function validReport(report) {
    return !!(report && typeof report === 'object' && report.packet_type === '42ndMind_kernel_brain_v0_4_report');
  }

  function entryKindFor(report) {
    switch (text(report.final_decision)) {
      case 'NEAR_NULL': return 'near_null_observation';
      case 'CLARIFY': return 'clarification_needed_observation';
      case 'BLOCK': return 'blocked_pressure_audit_event';
      case 'CAP_MATURITY': return 'capped_candidate_pressure';
      case 'HOLD_AS_CANDIDATE': return 'held_candidate_pressure';
      case 'ALLOW_PRESSURE': return 'allowed_pressure_candidate';
      case 'SAFE_TO_IMPORT': return 'pending_import_safe';
      case 'IMPORT_WITH_CAUTION': return 'pending_import_caution';
      default: return 'unknown_v0_4_runtime_entry';
    }
  }

  function entryFor(report, options = {}) {
    const kind = entryKindFor(report);
    const entry = {
      entry_type: kind,
      entry_version: VERSION,
      created_at: now(),
      source_packet_type: text(report.packet_type),
      source_packet_version: text(report.packet_version),
      final_decision: text(report.final_decision),
      input_kind: text(report.input_kind),
      input_preview: text(report.input_preview),
      final_reason: text(report.final_reason),
      non_scoring: true,
      belief_movement: 'none',
      kernel_state_mutation: false,
      auto_import: false,
      runtime_binding_only: true,
      near_null: report.near_null === true,
      allowed_for_belief_pressure: report.allowed_for_belief_pressure === true,
      report_snapshot: options.include_report_snapshot === false ? null : clone(report),
      doctrine: {
        v0_4_report_is_pressure_not_state_movement: true,
        binding_does_not_run_imports: true,
        pending_import_requires_explicit_user_action: true,
        adapters_do_not_own_belief_movement: true,
        kernel_state_updates_require_later_runtime_binding: true
      }
    };

    if (kind === 'near_null_observation') {
      entry.observation = {
        observation_type: 'near_null_low_signal_or_empty_input',
        reason: text(report.final_reason) || 'Input did not earn active worldview pressure.'
      };
    }
    if (kind === 'clarification_needed_observation') {
      entry.observation = {
        observation_type: 'clarification_needed',
        reason: text(report.final_reason) || 'Input was not yet precise enough for belief pressure.'
      };
    }
    if (kind === 'blocked_pressure_audit_event') {
      entry.audit_event = {
        audit_type: 'blocked_v0_4_pressure',
        reason: text(report.final_reason) || 'Input was blocked by v0.4 decision surface.',
        block_is_belief_movement: false
      };
    }
    if (kind === 'capped_candidate_pressure' || kind === 'held_candidate_pressure' || kind === 'allowed_pressure_candidate') {
      entry.candidate_pressure = {
        pressure_type: kind,
        status: kind === 'allowed_pressure_candidate' ? 'allowed_pressure_not_applied' : 'candidate_only',
        reason: text(report.final_reason) || 'Stored as v0.4 candidate pressure without mutating kernel state.'
      };
    }
    if (kind === 'pending_import_safe' || kind === 'pending_import_caution') {
      entry.pending_import = {
        available: !!report.sanitized_command,
        caution: kind === 'pending_import_caution',
        saved_to_pending_key: false,
        pending_command_key: DEFAULT_PENDING_COMMAND_KEY,
        reason: report.sanitized_command ? 'Sanitized command can be saved as pending import by explicit action.' : 'No sanitized command was present.'
      };
    }
    return entry;
  }

  function savePendingCommand(report, key = DEFAULT_PENDING_COMMAND_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    if (!report || !report.sanitized_command) return { ok:false, reason:'no_sanitized_command', key };
    localStorage.setItem(key, JSON.stringify(report.sanitized_command, null, 2));
    return { ok:true, reason:'saved_pending_sanitized_command', key, decision:text(report.final_decision) };
  }

  function bindReport(report, options = {}) {
    if (!validReport(report)) {
      return {
        ok:false,
        reason:'invalid_v0_4_report',
        entry:null,
        saved_log:null,
        saved_pending_command:null,
        doctrine:{ invalid_reports_do_not_move_state:true }
      };
    }

    const key = options.log_key || DEFAULT_LOG_KEY;
    const entry = entryFor(report, options);
    let savedPending = null;

    if ((entry.entry_type === 'pending_import_safe' || entry.entry_type === 'pending_import_caution') && options.save_pending_import === true) {
      savedPending = savePendingCommand(report, options.pending_command_key || DEFAULT_PENDING_COMMAND_KEY);
      if (entry.pending_import) {
        entry.pending_import.saved_to_pending_key = savedPending.ok === true;
        entry.pending_import.pending_command_key = savedPending.key;
      }
    }

    const savedLog = appendLog(entry, key);
    return {
      ok: savedLog.ok,
      reason: savedLog.reason,
      entry,
      saved_log: savedLog,
      saved_pending_command: savedPending,
      doctrine: {
        runtime_binding_only: true,
        non_scoring: true,
        belief_movement: 'none',
        kernel_state_mutation: false,
        pending_import_is_not_executed: true
      }
    };
  }

  function exportLog(key = DEFAULT_LOG_KEY) {
    return {
      packet_type: '42ndMind_v0_4_runtime_log_export',
      packet_version: VERSION,
      created_at: now(),
      key,
      entries: loadLog(key),
      doctrine: {
        non_scoring: true,
        browser_runtime_memory_only: true,
        not_kernel_state: true,
        belief_movement: 'none'
      }
    };
  }

  function sampleReport(kind) {
    if (!global.KernelBrainV04 || typeof global.KernelBrainV04.process !== 'function') return null;
    return global.KernelBrainV04.process(global.KernelBrainV04.sampleInput(kind || 'claim'));
  }

  global.KernelBrainV04RuntimeBindings = Object.freeze({
    VERSION,
    DEFAULT_LOG_KEY,
    DEFAULT_PENDING_COMMAND_KEY,
    loadLog,
    saveLog,
    appendLog,
    clearLog,
    exportLog,
    entryFor,
    bindReport,
    savePendingCommand,
    sampleReport
  });
})(typeof window !== 'undefined' ? window : globalThis);
