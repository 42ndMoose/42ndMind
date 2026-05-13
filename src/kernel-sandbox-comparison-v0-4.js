/* 42ndMind Sandbox Comparison v0.4
 *
 * Purpose:
 * Compare baseline kernel behavior against candidate-shadow behavior before any
 * runtime candidate is allowed to influence live behavior.
 *
 * This module does not execute candidate code. Candidate-shadow behavior is an
 * annotation-only pass used to prove whether core outputs would remain stable.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    PASS_NO_BEHAVIOR_DELTA: 'PASS_NO_BEHAVIOR_DELTA',
    HOLD_REVIEW_REQUIRED: 'HOLD_REVIEW_REQUIRED',
    BLOCK_BEHAVIOR_DRIFT: 'BLOCK_BEHAVIOR_DRIFT',
    BLOCK_UNSAFE_CANDIDATE: 'BLOCK_UNSAFE_CANDIDATE'
  });

  const CORE_FIELDS = Object.freeze([
    'final_decision',
    'belief_movement',
    'near_null',
    'allowed_for_belief_pressure',
    'input_kind'
  ]);

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }

  function candidateFrom(input, options) {
    if (input && input.candidate_type === '42ndMind_runtime_candidate_v0_4') return input;
    const key = options && options.key || (global.KernelRuntimeCandidatesV04 && global.KernelRuntimeCandidatesV04.DEFAULT_KEY);
    if (typeof input === 'string' && global.KernelRuntimeCandidatesV04 && typeof global.KernelRuntimeCandidatesV04.load === 'function') {
      return global.KernelRuntimeCandidatesV04.load(key).find(c => c && c.id === input) || null;
    }
    return null;
  }

  function defaultProbes() {
    if (global.KernelBrainV04 && typeof global.KernelBrainV04.sampleInput === 'function') {
      return [
        { id:'claim', input:global.KernelBrainV04.sampleInput('claim') },
        { id:'gibberish', input:global.KernelBrainV04.sampleInput('gibberish') },
        { id:'ambiguous', input:global.KernelBrainV04.sampleInput('ambiguous') },
        { id:'rule_smuggling', input:global.KernelBrainV04.sampleInput('rule_smuggling') },
        { id:'reviewed_command', input:global.KernelBrainV04.sampleInput('reviewed_command') }
      ];
    }
    return [{ id:'plain_claim', input:'The source supports the bounded claim.' }];
  }

  function runBrain(input) {
    if (!global.KernelBrainV04 || typeof global.KernelBrainV04.process !== 'function') {
      return { error:'KernelBrainV04.process unavailable' };
    }
    return global.KernelBrainV04.process(input);
  }

  function applyShadow(report, candidate, options) {
    const shadow = clone(report);
    shadow.sandbox_candidate_shadow = {
      candidate_id: text(candidate && candidate.id),
      candidate_status: text(candidate && candidate.status),
      target_layer: text(candidate && candidate.target_layer),
      enabled_metadata_only: candidate && candidate.status === 'ENABLED_METADATA_ONLY',
      behavior_executed: false,
      source_rewritten: false,
      import_executed: false,
      v0_3_touched: false,
      note: 'Candidate shadow is annotation-only; no candidate behavior was executed.'
    };
    if (options && options.simulated_behavior_delta) {
      const delta = options.simulated_behavior_delta;
      Object.keys(delta).forEach(k => { shadow[k] = delta[k]; });
      shadow.sandbox_candidate_shadow.simulated_behavior_delta = clone(delta);
    }
    return shadow;
  }

  function probabilityValue(report) {
    return report && report.probability_report ? report.probability_report.probability : null;
  }

  function consistencyDecision(report) {
    return report && report.consistency_report ? report.consistency_report.decision : null;
  }

  function compareReports(baseline, shadow) {
    const diffs = [];
    CORE_FIELDS.forEach(field => {
      if (JSON.stringify(baseline && baseline[field]) !== JSON.stringify(shadow && shadow[field])) {
        diffs.push({ field, baseline:baseline && baseline[field], candidate:shadow && shadow[field], severity:'block' });
      }
    });
    if (probabilityValue(baseline) !== probabilityValue(shadow)) {
      diffs.push({ field:'probability_report.probability', baseline:probabilityValue(baseline), candidate:probabilityValue(shadow), severity:'block' });
    }
    if (consistencyDecision(baseline) !== consistencyDecision(shadow)) {
      diffs.push({ field:'consistency_report.decision', baseline:consistencyDecision(baseline), candidate:consistencyDecision(shadow), severity:'block' });
    }
    if (baseline && baseline.sanitized_command && !shadow.sanitized_command) {
      diffs.push({ field:'sanitized_command', baseline:'present', candidate:'missing', severity:'block' });
    }
    return diffs;
  }

  function unsafeCandidate(candidate) {
    const issues = [];
    if (!candidate) issues.push({ code:'candidate_missing', message:'Candidate is missing.' });
    if (candidate && candidate.status === 'REJECTED') issues.push({ code:'candidate_rejected', message:'Rejected candidate cannot enter sandbox comparison.' });
    if (candidate && candidate.runtime_effect) {
      if (candidate.runtime_effect.behavior_executed === true) issues.push({ code:'behavior_already_executed', message:'Candidate claims behavior already executed.' });
      if (candidate.runtime_effect.source_rewritten === true) issues.push({ code:'source_already_rewritten', message:'Candidate claims source was already rewritten.' });
      if (candidate.runtime_effect.v0_3_touched === true) issues.push({ code:'v0_3_touched', message:'Candidate claims v0.3 was touched.' });
    }
    return issues;
  }

  function compare(candidateInput, options = {}) {
    const candidate = candidateFrom(candidateInput, options);
    const safetyIssues = unsafeCandidate(candidate);
    const probes = asArray(options.probes).length ? asArray(options.probes) : defaultProbes();

    if (safetyIssues.length) {
      return {
        packet_type: '42ndMind_sandbox_comparison_report_v0_4',
        packet_version: VERSION,
        created_at: now(),
        decision: DECISIONS.BLOCK_UNSAFE_CANDIDATE,
        candidate_id: text(candidate && candidate.id),
        safety_issues: safetyIssues,
        probe_count: probes.length,
        comparisons: [],
        doctrine: doctrine()
      };
    }

    const comparisons = probes.map((probe, index) => {
      const id = text(probe && probe.id) || `probe_${index}`;
      const input = probe && Object.prototype.hasOwnProperty.call(probe, 'input') ? probe.input : probe;
      const baseline = runBrain(input);
      const shadow = applyShadow(baseline, candidate, options);
      const diffs = compareReports(baseline, shadow);
      return {
        probe_id: id,
        passed: diffs.length === 0,
        diffs,
        baseline_summary: summarizeReport(baseline),
        candidate_shadow_summary: summarizeReport(shadow)
      };
    });

    const blocked = comparisons.some(c => c.diffs.some(d => d.severity === 'block'));
    const decision = blocked ? DECISIONS.BLOCK_BEHAVIOR_DRIFT : DECISIONS.PASS_NO_BEHAVIOR_DELTA;

    return {
      packet_type: '42ndMind_sandbox_comparison_report_v0_4',
      packet_version: VERSION,
      created_at: now(),
      decision,
      candidate_id: text(candidate.id),
      candidate_status: text(candidate.status),
      probe_count: comparisons.length,
      comparisons,
      behavior_delta_detected: blocked,
      candidate_behavior_executed: false,
      source_rewritten: false,
      import_executed: false,
      v0_3_touched: false,
      doctrine: doctrine()
    };
  }

  function summarizeReport(report) {
    return {
      final_decision: report && report.final_decision,
      input_kind: report && report.input_kind,
      belief_movement: report && report.belief_movement,
      near_null: report && report.near_null,
      allowed_for_belief_pressure: report && report.allowed_for_belief_pressure,
      consistency_decision: consistencyDecision(report),
      probability: probabilityValue(report),
      has_sanitized_command: !!(report && report.sanitized_command),
      has_candidate_shadow: !!(report && report.sandbox_candidate_shadow)
    };
  }

  function doctrine() {
    return {
      sandbox_comparison_is_not_runtime_execution: true,
      candidate_shadow_is_annotation_only: true,
      baseline_behavior_must_remain_stable: true,
      probability_and_consistency_drift_blocks_candidate: true,
      v0_3_untouched: true,
      source_write_forbidden: true
    };
  }

  function sampleCandidate(kind) {
    if (global.KernelPatchCandidateV04 && global.KernelRuntimeCandidatesV04) {
      const plan = global.KernelPatchCandidateV04.createPlan(global.KernelPatchCandidateV04.sampleInput('runtime'));
      const candidate = {
        candidate_type:'42ndMind_runtime_candidate_v0_4',
        id: kind === 'enabled' ? 'sample_enabled_candidate' : 'sample_staged_candidate',
        status: kind === 'enabled' ? 'ENABLED_METADATA_ONLY' : 'STAGED_DISABLED',
        enabled: kind === 'enabled',
        title: plan.title,
        target_layer: plan.target_layer,
        runtime_effect: { behavior_executed:false, source_rewritten:false, import_executed:false, core_doctrine_changed:false, v0_3_touched:false },
        raw: { plan }
      };
      if (kind === 'unsafe') candidate.runtime_effect.behavior_executed = true;
      return candidate;
    }
    return { candidate_type:'42ndMind_runtime_candidate_v0_4', id:'sample', status:'STAGED_DISABLED', runtime_effect:{ behavior_executed:false, source_rewritten:false, import_executed:false, v0_3_touched:false } };
  }

  global.KernelSandboxComparisonV04 = Object.freeze({
    VERSION,
    DECISIONS,
    CORE_FIELDS,
    compare,
    compareReports,
    applyShadow,
    defaultProbes,
    sampleCandidate,
    doctrine
  });
})(typeof window !== 'undefined' ? window : globalThis);
