/* 42ndMind Source Trust Bridge v0.4
 *
 * Purpose:
 * Attach source-trust prior reports to kernel evidence/command packets as
 * provenance pressure.
 *
 * This bridge does not decide truth, delete claims, import commands, or mutate
 * belief state. It only turns source-class priors into visible constraints that
 * downstream probability/preflight/governor logic can inspect.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    BRIDGE_READY: 'BRIDGE_READY',
    HOLD_SOURCE_REVIEW: 'HOLD_SOURCE_REVIEW',
    SOURCE_PRESSURE_CONFLICTED: 'SOURCE_PRESSURE_CONFLICTED',
    NO_SOURCE_DATA: 'NO_SOURCE_DATA'
  });

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function unique(items) { return Array.from(new Set(asArray(items).map(text).filter(Boolean))); }

  function trustReportFor(source) {
    if (source && source.packet_type === '42ndMind_source_trust_report_v0_4') return source;
    if (global.KernelSourceTrustV04 && typeof global.KernelSourceTrustV04.analyze === 'function') return global.KernelSourceTrustV04.analyze(source || {});
    return null;
  }

  function trustReportsFor(sources) {
    return asArray(sources).map(trustReportFor).filter(Boolean);
  }

  function sourceDecisionPressure(report) {
    if (!report) return 'unknown_source_pressure';
    if (report.decision === 'TRUST_PRIOR_CONFLICTED') return 'conflicted_source_pressure';
    if (report.decision === 'HOLD_SOURCE_REVIEW') return 'source_review_pressure';
    if (report.decision === 'TRUST_PRIOR_LOW') return 'low_source_trust_pressure';
    if (report.certification_is_metadata_not_truth) return 'certification_metadata_pressure';
    return 'bounded_source_trust_pressure';
  }

  function aggregate(reports) {
    const list = asArray(reports);
    const scores = list.map(r => Number(r.trust_prior_score || 0)).filter(n => Number.isFinite(n));
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const min = scores.length ? Math.min.apply(null, scores) : 0;
    const conflicted = list.some(r => r.decision === 'TRUST_PRIOR_CONFLICTED');
    const hold = list.some(r => r.decision === 'HOLD_SOURCE_REVIEW');
    const certification = list.some(r => r.certification_is_metadata_not_truth === true);
    const burdens = unique(list.flatMap(r => asArray(r.verification_burden)));
    let decision = DECISIONS.BRIDGE_READY;
    if (!list.length) decision = DECISIONS.NO_SOURCE_DATA;
    else if (conflicted) decision = DECISIONS.SOURCE_PRESSURE_CONFLICTED;
    else if (hold || min < 0.32) decision = DECISIONS.HOLD_SOURCE_REVIEW;
    return {
      decision,
      source_count: list.length,
      average_trust_prior: Number(avg.toFixed(3)),
      minimum_trust_prior: Number(min.toFixed(3)),
      any_conflicted: conflicted,
      any_certification_metadata: certification,
      verification_burden: burdens,
      source_pressure_tags: unique(list.map(sourceDecisionPressure))
    };
  }

  function pressureEvidenceFor(report) {
    return {
      id: `source_trust_${text(report.source_id || report.source_label || 'unknown').replace(/[^a-z0-9_]+/gi, '_').slice(0, 80)}`,
      relation: 'attacks',
      text: `Source-trust prior: ${report.source_label || report.source_id || 'unknown source'} => ${report.decision} (${report.trust_prior_score}).`,
      evidence_type: 'source_trust_pressure',
      source_id: report.source_id,
      source_classes: report.source_classes,
      trust_prior_score: report.trust_prior_score,
      source_trust_decision: report.decision,
      verification_burden: report.verification_burden,
      certification_is_metadata_not_truth: report.certification_is_metadata_not_truth === true,
      metadata_only: true
    };
  }

  function buildBridgePacket(input = {}, options = {}) {
    const sources = asArray(input.sources || input.source_reports || input);
    const reports = trustReportsFor(sources);
    const agg = aggregate(reports);
    return {
      packet_type: '42ndMind_source_trust_bridge_packet_v0_4',
      packet_version: VERSION,
      created_at: now(),
      decision: agg.decision,
      aggregate: agg,
      source_trust_reports: reports,
      pressure_evidence: reports.map(pressureEvidenceFor),
      probability_constraints: {
        certification_cannot_raise_probability_by_itself: agg.any_certification_metadata,
        conflicted_source_caps_claim_support: agg.any_conflicted,
        require_independent_support_if_low_prior: agg.minimum_trust_prior < 0.5,
        source_class_is_prior_not_truth: true
      },
      recommended_kernel_effect: recommendedEffect(agg),
      belief_movement: 'none',
      doctrine: doctrine(),
      raw: clone(input || {})
    };
  }

  function recommendedEffect(agg) {
    if (agg.decision === DECISIONS.SOURCE_PRESSURE_CONFLICTED) return 'add_attacking_evidence_and_cap_probability_until_independent_primary_support';
    if (agg.decision === DECISIONS.HOLD_SOURCE_REVIEW) return 'hold_or_lower_source_weight_until_verification_burden_is_answered';
    if (agg.decision === DECISIONS.NO_SOURCE_DATA) return 'do_not_inflate_confidence_from_missing_source_data';
    if (agg.any_certification_metadata) return 'treat_certification_as_metadata_and_require_claim_level_evidence';
    return 'preserve_source_prior_as_metadata_and_continue_claim_level_evaluation';
  }

  function attachToCommand(command, sources, options = {}) {
    const bridge = buildBridgePacket({ sources });
    const cloned = clone(command || {});
    if (!cloned.meta) cloned.meta = {};
    cloned.meta.source_trust_bridge = bridge;
    cloned.meta.source_trust_decision = bridge.decision;
    cloned.meta.source_trust_prior_min = bridge.aggregate.minimum_trust_prior;

    if (Array.isArray(cloned.commands)) {
      cloned.commands = cloned.commands.map(cmd => {
        const next = clone(cmd);
        const packet = next.packet || next.extraction_packet;
        if (packet && typeof packet === 'object') {
          if (!Array.isArray(packet.evidence)) packet.evidence = [];
          packet.evidence = packet.evidence.concat(bridge.pressure_evidence);
          if (!packet.meta) packet.meta = {};
          packet.meta.source_trust_bridge_decision = bridge.decision;
          packet.meta.source_trust_verification_burden = bridge.aggregate.verification_burden;
        }
        return next;
      });
    }

    return {
      packet_type: '42ndMind_source_trust_attached_command_v0_4',
      packet_version: VERSION,
      created_at: now(),
      command: cloned,
      source_trust_bridge: bridge,
      import_executed: false,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function doctrine() {
    return {
      source_trust_bridge_does_not_decide_truth: true,
      source_trust_bridge_does_not_import_commands: true,
      source_trust_pressure_is_metadata_until_governed: true,
      certification_cannot_replace_evidence: true,
      contradicted_source_history_remains_visible: true,
      claim_level_evidence_still_required: true
    };
  }

  function sampleCommand() {
    return {
      command_type: 'epistemic_kernel_command',
      commands: [{
        op: 'import_packet',
        packet: {
          claims: [{ id:'claim_1', text:'The certified fact-check resolves the disputed claim.', confidence:0.75 }],
          evidence: [{ id:'evidence_1', text:'Article carries a fact-check certification.', relation:'supports' }],
          questions: []
        }
      }]
    };
  }

  function sampleSources(kind) {
    if (global.KernelSourceTrustV04 && typeof global.KernelSourceTrustV04.sampleSource === 'function') {
      if (kind === 'mixed') return [global.KernelSourceTrustV04.sampleSource('ifcn'), global.KernelSourceTrustV04.sampleSource('primary')];
      if (kind === 'conflicted') return [{ id:'bad_history', type:'legacy media fact-check certified', history:{ contradiction_count:4, retraction_count:1 } }];
      return [global.KernelSourceTrustV04.sampleSource(kind || 'ifcn')];
    }
    return [{ id:'sample_ifcn', type:'IFCN certified fact checker' }];
  }

  global.KernelSourceTrustBridgeV04 = Object.freeze({
    VERSION,
    DECISIONS,
    buildBridgePacket,
    attachToCommand,
    aggregate,
    pressureEvidenceFor,
    sampleCommand,
    sampleSources,
    doctrine
  });
})(typeof window !== 'undefined' ? window : globalThis);
