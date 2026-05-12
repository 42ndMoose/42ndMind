/* 42ndMind Kernel Command Preflight v0.1.2 governor patch
 *
 * Makes preflight consult KernelEpistemicGovernorV01 so preflight becomes
 * an import adapter, not a separate epistemic brain.
 */
(function (global) {
  'use strict';
  if (!global.KernelCommandPreflightV01) return;

  const BASE = global.KernelCommandPreflightV01;
  const VERSION = '0.1.2-governor-patch';
  const DECISIONS = BASE.DECISIONS;

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }

  function parse(input) {
    if (typeof input === 'string') {
      try { return JSON.parse(input); } catch (error) { return null; }
    }
    return input && typeof input === 'object' ? input : null;
  }

  function addIssue(report, issue) {
    report.issues = asArray(report.issues);
    const key = `${issue.code}|${issue.path || ''}|${issue.message || ''}`;
    const exists = report.issues.some(existing => `${existing.code}|${existing.path || ''}|${existing.message || ''}` === key);
    if (!exists) report.issues.push(issue);
  }

  function recompute(report) {
    report.counts = {
      block: report.issues.filter(i => i.severity === 'block').length,
      caution: report.issues.filter(i => i.severity === 'caution').length,
      info: report.issues.filter(i => i.severity === 'info').length
    };
    report.decision = report.counts.block > 0 ? DECISIONS.BLOCK : report.counts.caution > 0 ? DECISIONS.CAUTION : DECISIONS.SAFE;
    report.import_allowed = report.decision !== DECISIONS.BLOCK;
    report.packet_version = VERSION;
    return report;
  }

  function importPackets(command) {
    const commands = Array.isArray(command && command.commands) ? command.commands : [command];
    return commands.map((cmd, index) => ({ cmd, index, packet:(cmd && (cmd.packet || cmd.extraction_packet)) || {} })).filter(row => row.cmd && row.cmd.op === 'import_packet');
  }

  function packetMeta(packet) { return packet && packet.meta && typeof packet.meta === 'object' ? packet.meta : {}; }

  function claimCandidate(packet, claim, index) {
    const meta = packetMeta(packet);
    const links = claim.links || {};
    const target = text(claim.client_id || claim.id || claim.text);
    const relatedEvidence = asArray(packet.evidence).filter(e => text(e.target || e.claimId || e.target_client_id || e.target_claim_text) === target);
    const attacks = relatedEvidence.filter(e => text(e.relation) === 'attacks' || lower(e.text).includes('counter_consideration')).map(e => text(e.text)).filter(Boolean);
    const supportEvidence = relatedEvidence.filter(e => text(e.relation) !== 'attacks');
    return {
      candidate_type: 'kernel_import_claim',
      text: text(claim.text),
      support_status: text(links.support_status || meta.support_status || claim.support_status || ''),
      source_ids: asArray(links.source_ids).concat(asArray(claim.source_ids), asArray(meta.source_ids)).map(text).filter(Boolean),
      evidence: supportEvidence.map(e => ({ text:text(e.text), relation:text(e.relation || 'supports') })).filter(e => e.text),
      attacks,
      questions: asArray(packet.questions).map(q => text(q.text || q)).filter(Boolean),
      confidence: Number.isFinite(Number(claim.confidence)) ? Number(claim.confidence) : null,
      status: text(claim.status),
      mechanism_class: text(meta.mechanism_class || claim.object || claim.scope || ''),
      raw: { claim, packet_meta:meta, source:'kernel_command_preflight_governor_patch' }
    };
  }

  function evidenceCandidate(packet, evidence, index) {
    const meta = packetMeta(packet);
    const links = evidence.links || {};
    return {
      candidate_type: 'kernel_import_evidence',
      text: text(evidence.text),
      support_status: text(links.support_status || meta.support_status || evidence.support_status || ''),
      source_ids: asArray(links.source_ids).concat(asArray(evidence.source_ids), asArray(meta.source_ids)).map(text).filter(Boolean),
      evidence: text(evidence.relation) === 'supports' || !text(evidence.relation) ? [{ text:text(evidence.text), relation:text(evidence.relation || 'supports') }] : [],
      attacks: text(evidence.relation) === 'attacks' ? [text(evidence.text)] : [],
      questions: [],
      confidence: Number.isFinite(Number(evidence.confidence)) ? Number(evidence.confidence) : null,
      status: 'candidate',
      mechanism_class: text(evidence.relation || 'evidence'),
      raw: { evidence, packet_meta:meta, source:'kernel_command_preflight_governor_patch' }
    };
  }

  function applyGovernor(report, command) {
    if (!global.KernelEpistemicGovernorV01 || typeof global.KernelEpistemicGovernorV01.assess !== 'function') {
      report.governor_bridge = { available:false, reason:'KernelEpistemicGovernorV01 missing' };
      return report;
    }
    const governorReports = [];
    for (const row of importPackets(command)) {
      const packet = row.packet || {};
      asArray(packet.claims).forEach((claim, index) => {
        const candidate = claimCandidate(packet, claim, index);
        const gov = global.KernelEpistemicGovernorV01.assess(candidate);
        governorReports.push({ command_index:row.index, packet_path:`commands[${row.index}].packet.claims[${index}]`, target:'claim', governor_report:gov });
      });
      asArray(packet.evidence).forEach((evidence, index) => {
        const candidate = evidenceCandidate(packet, evidence, index);
        const gov = global.KernelEpistemicGovernorV01.assess(candidate);
        governorReports.push({ command_index:row.index, packet_path:`commands[${row.index}].packet.evidence[${index}]`, target:'evidence', governor_report:gov });
      });
    }

    for (const row of governorReports) {
      const gov = row.governor_report || {};
      if (gov.decision === 'BLOCK_MOVEMENT') {
        addIssue(report, { severity:'block', code:'governor_blocked_movement', message:`Governor blocked ${row.target} movement.`, path:row.packet_path, repair:'Rewrite packet so it satisfies the unified epistemic governor before import.' });
      } else if (gov.decision === 'CAP_MATURITY') {
        addIssue(report, { severity:'caution', code:'governor_capped_maturity', message:`Governor capped maturity for ${row.target} pressure.`, path:row.packet_path, repair:'Allowed only as capped candidate pressure; do not treat as mature belief movement.' });
      } else if (gov.decision === 'HOLD_AS_CANDIDATE') {
        addIssue(report, { severity:'caution', code:'governor_hold_as_candidate', message:`Governor held ${row.target} as candidate pressure.`, path:row.packet_path, repair:'Store as candidate until evidence/review improves.' });
      }
    }

    report.governor_bridge = {
      available:true,
      version:global.KernelEpistemicGovernorV01.VERSION || 'unknown',
      reports:governorReports,
      doctrine:{ preflight_is_adapter_not_brain:true, unified_governor_owns_epistemic_decision:true }
    };
    if (report.sanitized_command) {
      report.sanitized_command.preflight = Object.assign({}, report.sanitized_command.preflight || {}, {
        governor_bridge_version: VERSION,
        governor_version: global.KernelEpistemicGovernorV01.VERSION || 'unknown'
      });
    }
    return report;
  }

  function analyze(input, options) {
    const report = BASE.analyze(input, options);
    const command = parse(input);
    if (!report || !command) {
      if (report) report.packet_version = VERSION;
      return report;
    }
    return recompute(applyGovernor(report, command));
  }

  global.KernelCommandPreflightV01 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    analyze
  }));
})(typeof window !== 'undefined' ? window : globalThis);
