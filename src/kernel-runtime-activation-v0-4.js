/* 42ndMind Runtime Activation v0.4
 *
 * Purpose:
 * Validate supplied test result packets before metadata-only enablement of a
 * staged runtime candidate.
 *
 * This module does not run tests by itself. It does not execute candidate
 * behavior. It only verifies result packets and delegates metadata-only
 * enablement to KernelRuntimeCandidatesV04.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    ACTIVATE_METADATA_ONLY: 'ACTIVATE_METADATA_ONLY',
    HOLD_TESTS_MISSING: 'HOLD_TESTS_MISSING',
    HOLD_TESTS_FAILED: 'HOLD_TESTS_FAILED',
    BLOCK_NOT_STAGED: 'BLOCK_NOT_STAGED'
  });

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function packetPassed(packet) {
    if (!packet || typeof packet !== 'object') return false;
    if (Array.isArray(packet.results)) return packet.results.length > 0 && packet.results.every(r => r && r.passed === true);
    if (packet.passed === true) return true;
    if (packet.summary && Number.isFinite(Number(packet.summary.passed)) && Number.isFinite(Number(packet.summary.total))) {
      return Number(packet.summary.passed) === Number(packet.summary.total) && Number(packet.summary.total) > 0;
    }
    return false;
  }

  function packetName(packet) {
    return text(packet && (packet.packet_type || packet.name || packet.title || 'unnamed_test_packet'));
  }

  function classifyPackets(packets) {
    const list = asArray(packets);
    return list.map(packet => ({
      packet_type: packetName(packet),
      passed: packetPassed(packet),
      result_count: Array.isArray(packet && packet.results) ? packet.results.length : null,
      failed: Array.isArray(packet && packet.results) ? packet.results.filter(r => !r.passed).map(r => ({ name:r.name, error:r.error || '' })) : []
    }));
  }

  function hasIntegratedSuite(packets) {
    return asArray(packets).some(packet => /integrated_test_suite|kernel_v0_4_integrated/i.test(packetName(packet)) && packetPassed(packet));
  }

  function hasLocalPass(packets) {
    return asArray(packets).some(packet => !/integrated_test_suite|kernel_v0_4_integrated/i.test(packetName(packet)) && packetPassed(packet));
  }

  function evaluate(candidate_id, options = {}) {
    const key = options.key || (global.KernelRuntimeCandidatesV04 && global.KernelRuntimeCandidatesV04.DEFAULT_KEY);
    const queue = global.KernelRuntimeCandidatesV04 && typeof global.KernelRuntimeCandidatesV04.load === 'function' ? global.KernelRuntimeCandidatesV04.load(key) : [];
    const candidate = queue.find(c => c && c.id === candidate_id);
    const packets = asArray(options.test_packets);
    const packet_status = classifyPackets(packets);
    const anyFailed = packet_status.some(p => p.passed !== true);
    const localPass = hasLocalPass(packets);
    const integratedPass = hasIntegratedSuite(packets);
    const manualReviewed = options.manual_reviewed === true;

    let decision = DECISIONS.ACTIVATE_METADATA_ONLY;
    const issues = [];

    if (!candidate) {
      decision = DECISIONS.BLOCK_NOT_STAGED;
      issues.push({ severity:'block', code:'candidate_not_found', message:'Candidate is not staged in runtime candidate queue.' });
    }
    if (candidate && candidate.status === 'REJECTED') {
      decision = DECISIONS.BLOCK_NOT_STAGED;
      issues.push({ severity:'block', code:'candidate_rejected', message:'Rejected candidates cannot be activated.' });
    }
    if (!packets.length) {
      decision = DECISIONS.HOLD_TESTS_MISSING;
      issues.push({ severity:'hold', code:'test_packets_missing', message:'Activation requires supplied test result packets.' });
    } else if (anyFailed) {
      decision = DECISIONS.HOLD_TESTS_FAILED;
      issues.push({ severity:'hold', code:'test_packet_failed', message:'One or more supplied test result packets failed.' });
    }
    if (!localPass) {
      if (decision === DECISIONS.ACTIVATE_METADATA_ONLY) decision = DECISIONS.HOLD_TESTS_MISSING;
      issues.push({ severity:'hold', code:'local_test_pass_required', message:'At least one local/module test packet must pass.' });
    }
    if (!integratedPass) {
      if (decision === DECISIONS.ACTIVATE_METADATA_ONLY) decision = DECISIONS.HOLD_TESTS_MISSING;
      issues.push({ severity:'hold', code:'integrated_suite_pass_required', message:'Integrated v0.4 suite packet must pass.' });
    }
    if (!manualReviewed) {
      if (decision === DECISIONS.ACTIVATE_METADATA_ONLY) decision = DECISIONS.HOLD_TESTS_MISSING;
      issues.push({ severity:'hold', code:'manual_review_required', message:'Manual review flag is required before metadata-only activation.' });
    }

    return {
      packet_type: '42ndMind_runtime_activation_evaluation_v0_4',
      packet_version: VERSION,
      created_at: now(),
      candidate_id: text(candidate_id),
      decision,
      issues,
      packet_status,
      requirements: {
        candidate_staged: !!candidate,
        local_test_passed: localPass,
        integrated_suite_passed: integratedPass,
        manual_reviewed: manualReviewed,
        no_failed_packets: !anyFailed && packets.length > 0
      },
      candidate_snapshot: candidate ? clone(candidate) : null,
      doctrine: {
        activation_evaluation_does_not_execute_behavior: true,
        supplied_test_packets_required: true,
        metadata_enablement_is_not_runtime_execution: true,
        v0_3_untouched: true
      }
    };
  }

  function activate(candidate_id, options = {}) {
    const evaluation = evaluate(candidate_id, options);
    if (evaluation.decision !== DECISIONS.ACTIVATE_METADATA_ONLY) {
      return {
        ok:false,
        reason:'activation_evaluation_not_ready',
        activated:false,
        evaluation,
        enable_result:null
      };
    }
    const enable_result = global.KernelRuntimeCandidatesV04.enable(candidate_id, {
      key: options.key,
      explicit_enable: true,
      tests_passed: true,
      integrated_suite_passed: true,
      manual_reviewed: true
    });
    return {
      ok: enable_result.ok === true,
      reason: enable_result.ok ? 'activated_metadata_only_after_test_packets' : enable_result.reason,
      activated: enable_result.ok === true,
      evaluation,
      enable_result,
      doctrine: {
        activation_is_metadata_only: true,
        behavior_executed: false,
        source_rewritten: false,
        import_executed: false
      }
    };
  }

  function sampleLocalPassPacket() {
    return {
      packet_type: '42ndMind_runtime_candidates_v0_4_test_report',
      results: [
        { name:'module loads', passed:true },
        { name:'metadata-only enablement', passed:true }
      ]
    };
  }

  function sampleIntegratedPassPacket() {
    return {
      packet_type: '42ndMind_kernel_v0_4_integrated_test_suite_report',
      packet_version: '0.4.2-suite',
      results: [
        { name:'current modules load', passed:true },
        { name:'runtime candidates stage disabled and enable metadata-only', passed:true }
      ]
    };
  }

  function sampleFailPacket() {
    return {
      packet_type: '42ndMind_runtime_candidates_v0_4_test_report',
      results: [
        { name:'module loads', passed:true },
        { name:'metadata-only enablement', passed:false, error:'simulated failure' }
      ]
    };
  }

  global.KernelRuntimeActivationV04 = Object.freeze({
    VERSION,
    DECISIONS,
    evaluate,
    activate,
    packetPassed,
    classifyPackets,
    sampleLocalPassPacket,
    sampleIntegratedPassPacket,
    sampleFailPacket
  });
})(typeof window !== 'undefined' ? window : globalThis);
