/* 42ndMind Kernel Brain v0.4
 *
 * One-brain consolidation surface.
 *
 * This module is the single entry point for raw language, JSON commands,
 * source/evidence snippets, self-sealing pressure, gibberish, and import
 * packets. Sensemaking and preflight are adapters. The governor is the shared
 * movement law. This module produces one final decision surface.
 *
 * Doctrine:
 * - one brain, not stacked independent logic
 * - meaning must be earned before belief movement
 * - every path answers to the same epistemic governor
 * - adapters may parse/format, but they do not own belief movement
 * - no belief movement occurs inside this v0.4 module by itself
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    NEAR_NULL: 'NEAR_NULL',
    CLARIFY: 'CLARIFY',
    BLOCK: 'BLOCK',
    HOLD: 'HOLD_AS_CANDIDATE',
    CAP: 'CAP_MATURITY',
    ALLOW: 'ALLOW_PRESSURE',
    SAFE_IMPORT: 'SAFE_TO_IMPORT',
    CAUTION_IMPORT: 'IMPORT_WITH_CAUTION'
  });

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }

  function parseJson(raw) {
    try { return { ok:true, value:JSON.parse(raw), error:'' }; }
    catch (error) { return { ok:false, value:null, error:error.message }; }
  }

  function isCommandObject(value) {
    return !!(value && typeof value === 'object' && (value.command_type === 'epistemic_kernel_command' || Array.isArray(value.commands)));
  }

  function mapGovernorDecision(decision) {
    if (decision === 'BLOCK_MOVEMENT') return DECISIONS.BLOCK;
    if (decision === 'CAP_MATURITY') return DECISIONS.CAP;
    if (decision === 'HOLD_AS_CANDIDATE') return DECISIONS.HOLD;
    if (decision === 'ALLOW_PRESSURE') return DECISIONS.ALLOW;
    return DECISIONS.HOLD;
  }

  function mapSensemakingDecision(report) {
    if (!report) return DECISIONS.BLOCK;
    if (report.decision === 'QUARANTINE_NEAR_NULL') return DECISIONS.NEAR_NULL;
    if (report.decision === 'ASK_CLARIFICATION') return DECISIONS.CLARIFY;
    if (report.decision === 'BLOCK_MOVEMENT') return DECISIONS.BLOCK;
    if (report.decision === 'SEND_TO_GOVERNOR') return mapGovernorDecision(report.governor_report && report.governor_report.decision);
    return DECISIONS.HOLD;
  }

  function mapPreflightDecision(report) {
    if (!report) return DECISIONS.BLOCK;
    if (report.decision === 'BLOCK_IMPORT') return DECISIONS.BLOCK;
    if (report.decision === 'IMPORT_WITH_CAUTION') return DECISIONS.CAUTION_IMPORT;
    if (report.decision === 'SAFE_TO_IMPORT') return DECISIONS.SAFE_IMPORT;
    return DECISIONS.HOLD;
  }

  function canMove(decision) {
    return decision === DECISIONS.ALLOW || decision === DECISIONS.SAFE_IMPORT || decision === DECISIONS.CAUTION_IMPORT || decision === DECISIONS.CAP || decision === DECISIONS.HOLD;
  }

  function adapterStatus() {
    return {
      sensemaking: !!(global.KernelSensemakingV01 && typeof global.KernelSensemakingV01.analyze === 'function'),
      governor: !!(global.KernelEpistemicGovernorV01 && typeof global.KernelEpistemicGovernorV01.assess === 'function'),
      preflight: !!(global.KernelCommandPreflightV01 && typeof global.KernelCommandPreflightV01.analyze === 'function')
    };
  }

  function doctrine() {
    return {
      one_brain: true,
      one_final_decision_surface: true,
      adapters_are_not_separate_brains: true,
      governor_is_shared_movement_law: true,
      meaning_must_be_earned_before_belief_movement: true,
      gibberish_stays_near_null: true,
      ambiguity_requests_clarification_not_belief: true,
      rule_smuggling_cannot_move_belief: true,
      no_auto_rule_promotion: true,
      no_belief_movement_inside_v0_4_processor: true,
      kernel_state_updates_require_explicit_import_or_later_runtime_binding: true
    };
  }

  function process(input, options = {}) {
    const raw = typeof input === 'string' ? input : JSON.stringify(input ?? '');
    const parsed = parseJson(raw);
    const status = adapterStatus();
    const isCommand = parsed.ok && isCommandObject(parsed.value);

    const report = {
      packet_type: '42ndMind_kernel_brain_v0_4_report',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      input_preview: text(raw).slice(0, 220),
      input_kind: isCommand ? 'epistemic_kernel_command' : parsed.ok ? 'json_or_structured_text' : 'raw_language',
      final_decision: DECISIONS.HOLD,
      final_reason: '',
      allowed_for_belief_pressure: false,
      belief_movement: 'none',
      near_null: false,
      sanitized_command: null,
      sensemaking_report: null,
      governor_report: null,
      preflight_report: null,
      adapter_status: status,
      doctrine: doctrine()
    };

    if (!status.sensemaking) {
      report.final_decision = DECISIONS.BLOCK;
      report.final_reason = 'KernelSensemakingV01 is not loaded; meaning cannot be earned.';
      return report;
    }
    if (!status.governor) {
      report.final_decision = DECISIONS.BLOCK;
      report.final_reason = 'KernelEpistemicGovernorV01 is not loaded; movement law is missing.';
      return report;
    }

    report.sensemaking_report = global.KernelSensemakingV01.analyze(raw, options);

    if (isCommand) {
      if (!status.preflight) {
        report.final_decision = DECISIONS.BLOCK;
        report.final_reason = 'Command-shaped input requires preflight adapter, but it is not loaded.';
        return report;
      }
      report.preflight_report = global.KernelCommandPreflightV01.analyze(raw, options);
      report.final_decision = mapPreflightDecision(report.preflight_report);
      report.sanitized_command = report.preflight_report && report.preflight_report.sanitized_command ? report.preflight_report.sanitized_command : null;
      report.final_reason = report.preflight_report && report.preflight_report.import_allowed
        ? 'Structured command passed through sensemaking and governor-backed preflight adapter.'
        : 'Structured command was blocked by sensemaking/preflight/governor path.';
    } else {
      report.governor_report = report.sensemaking_report && report.sensemaking_report.governor_report ? report.sensemaking_report.governor_report : null;
      report.final_decision = mapSensemakingDecision(report.sensemaking_report);
      report.final_reason = report.sensemaking_report ? report.sensemaking_report.reason : 'No sensemaking report produced.';
    }

    report.allowed_for_belief_pressure = canMove(report.final_decision) && report.final_decision !== DECISIONS.SAFE_IMPORT && report.final_decision !== DECISIONS.CAUTION_IMPORT;
    report.near_null = report.final_decision === DECISIONS.NEAR_NULL;
    report.belief_movement = 'none';
    report.runtime_note = report.final_decision === DECISIONS.SAFE_IMPORT || report.final_decision === DECISIONS.CAUTION_IMPORT
      ? 'Import is allowed only if a live runtime explicitly applies the sanitized command.'
      : 'This processor emits pressure/decision only; it does not mutate kernel state.';
    return report;
  }

  function sampleInput(kind) {
    if (global.KernelSensemakingV01 && typeof global.KernelSensemakingV01.sampleInput === 'function') {
      if (['gibberish','ambiguous','claim','self_sealing','rule_smuggling','question','command'].includes(kind)) return global.KernelSensemakingV01.sampleInput(kind);
    }
    if (kind === 'reviewed_command' && global.KernelCommandPreflightV01 && typeof global.KernelCommandPreflightV01.sampleSafeCautionCommand === 'function') {
      return JSON.stringify(global.KernelCommandPreflightV01.sampleSafeCautionCommand(), null, 2);
    }
    return 'The source document supports the bounded claim, but motive remains unresolved.';
  }

  global.KernelBrainV04 = Object.freeze({
    VERSION,
    DECISIONS,
    process,
    doctrine,
    adapterStatus,
    sampleInput
  });
})(typeof window !== 'undefined' ? window : globalThis);
