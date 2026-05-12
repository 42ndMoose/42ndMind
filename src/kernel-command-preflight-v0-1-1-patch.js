/* 42ndMind Kernel Command Preflight v0.1.1 patch
 *
 * Tightens v0.1.0 so source-empty, unreviewed import packets are never
 * labeled SAFE merely because confidence was already low. They are allowed
 * only as IMPORT_WITH_CAUTION unless another rule blocks them.
 */
(function (global) {
  'use strict';
  if (!global.KernelCommandPreflightV01) return;

  const base = global.KernelCommandPreflightV01;
  const VERSION = '0.1.1';
  const DECISIONS = base.DECISIONS;

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }

  function parse(input) {
    if (typeof input === 'string') {
      try { return JSON.parse(input); } catch (error) { return null; }
    }
    return input && typeof input === 'object' ? input : null;
  }

  function sourceIdsFromPacket(packet, item) {
    return asArray(item && item.links && item.links.source_ids)
      .concat(asArray(item && item.source_ids))
      .concat(asArray(packet && packet.meta && packet.meta.source_ids))
      .map(text).filter(Boolean);
  }

  function supportStatus(packet, item) {
    return lower((item && item.links && item.links.support_status) || (packet && packet.meta && packet.meta.support_status) || item.support_status || '');
  }

  function isUnreviewed(packet, item) {
    const status = supportStatus(packet, item);
    return !status || status === 'unreviewed' || status === 'unresolved' || status === 'source_visible_unverified';
  }

  function importPackets(command) {
    const packets = [];
    const commands = Array.isArray(command && command.commands) ? command.commands : [command];
    commands.forEach((cmd, index) => {
      if (cmd && cmd.op === 'import_packet') packets.push({ cmd, index, packet:cmd.packet || cmd.extraction_packet || {} });
    });
    return packets;
  }

  function hasIssue(report, code) {
    return asArray(report && report.issues).some(issue => issue.code === code);
  }

  function addIssue(report, issue) {
    if (!hasIssue(report, issue.code)) report.issues.push(issue);
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
    if (report.sanitized_command && report.sanitized_command.preflight) report.sanitized_command.preflight.version = VERSION;
    return report;
  }

  function analyze(input, options) {
    const report = base.analyze(input, options);
    if (!report || report.decision === DECISIONS.BLOCK) {
      if (report) report.packet_version = VERSION;
      return report;
    }

    const command = parse(input);
    for (const row of importPackets(command)) {
      const packet = row.packet || {};
      const claims = asArray(packet.claims);
      const evidence = asArray(packet.evidence);
      const anySourceEmpty = claims.concat(evidence).some(item => sourceIdsFromPacket(packet, item).length === 0);
      const anyUnreviewed = claims.concat(evidence).some(item => isUnreviewed(packet, item));
      const hasClaimsOrEvidence = claims.length > 0 || evidence.length > 0;
      if (hasClaimsOrEvidence && anySourceEmpty && anyUnreviewed) {
        addIssue(report, {
          severity: 'caution',
          code: 'source_empty_unreviewed_import',
          message: 'Import packet contains claim/evidence pressure with empty source IDs and unreviewed support status.',
          path: `commands[${row.index}].packet`,
          repair: 'Allow only as candidate pressure; keep status unresolved and source/review status metadata-only.'
        });
      }
    }

    return recompute(report);
  }

  global.KernelCommandPreflightV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    analyze
  }));
})(typeof window !== 'undefined' ? window : globalThis);
