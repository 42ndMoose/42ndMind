/* 42ndMind Kernel Command Preflight v0.1.3 governor evidence patch
 *
 * v0.1.2 made preflight consult the unified governor for claims and evidence.
 * This patch keeps claim assessment strict, but prevents support evidence rows
 * from being treated as independent mature belief nodes that need their own
 * counter-consideration path. Evidence supports or attacks a claim; the claim
 * carries the maturity burden.
 */
(function (global) {
  'use strict';
  if (!global.KernelCommandPreflightV01) return;

  const BASE = global.KernelCommandPreflightV01;
  const VERSION = '0.1.3-governor-evidence-patch';
  const DECISIONS = BASE.DECISIONS;

  function asArray(value) { return Array.isArray(value) ? value : []; }

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

  function isEvidenceOnlyCounterCap(row) {
    if (!row || row.target !== 'evidence') return false;
    const gov = row.governor_report || {};
    const reasons = asArray(gov.maturity_aspiration && gov.maturity_aspiration.cap_reasons);
    return gov.decision === 'CAP_MATURITY' && reasons.length > 0 && reasons.every(reason => reason === 'counter_consideration_not_visible');
  }

  function analyze(input, options) {
    const report = BASE.analyze(input, options);
    if (!report || !report.governor_bridge || !report.governor_bridge.available) {
      if (report) report.packet_version = VERSION;
      return report;
    }

    const evidenceOnlyPaths = asArray(report.governor_bridge.reports)
      .filter(isEvidenceOnlyCounterCap)
      .map(row => row.packet_path);

    if (evidenceOnlyPaths.length) {
      report.issues = asArray(report.issues).filter(issue => !(
        issue.code === 'governor_capped_maturity' && evidenceOnlyPaths.includes(issue.path)
      ));
      report.governor_bridge.evidence_counter_cap_handling = {
        applied: true,
        version: VERSION,
        paths: evidenceOnlyPaths,
        rule: 'support_evidence_rows_are_not_independent_maturity_nodes'
      };
      if (report.sanitized_command) {
        report.sanitized_command.preflight = Object.assign({}, report.sanitized_command.preflight || {}, {
          governor_evidence_patch_version: VERSION
        });
      }
    }

    return recompute(report);
  }

  global.KernelCommandPreflightV01 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    analyze
  }));
})(typeof window !== 'undefined' ? window : globalThis);
