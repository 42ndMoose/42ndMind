/* 42ndMind Self-Learning v0.1.1 patch
 * Patch over SelfLearningV01.
 *
 * Fix:
 * v0.1.0 convergence detection checked signals, observed failures, and cap reasons,
 * but missed explicit mechanism_class values such as shared_enforcement_pipeline.
 * That prevented the compression-rule candidate from appearing in sample cases.
 */
(function (global) {
  'use strict';

  if (!global.SelfLearningV01 || typeof global.SelfLearningV01.learn !== 'function') {
    global.SelfLearningV011PatchStatus = { installed:false, reason:'SelfLearningV01_missing' };
    return;
  }

  const BASE = global.SelfLearningV01;
  const VERSION = '0.1.1-patch';
  const CONVERGENCE_CLASSES = ['institutional_or_incentive_convergence', 'shared_enforcement_pipeline'];

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }

  function hasConvergenceCase(cases) {
    return asArray(cases).some(raw => {
      const c = BASE.normalizeCase(raw);
      return CONVERGENCE_CLASSES.includes(c.mechanism_class) ||
        c.signals.some(s => CONVERGENCE_CLASSES.includes(s)) ||
        /institutional.*convergence|shared.*enforcement.*pipeline/i.test(`${c.observed_success} ${c.observed_failure} ${c.notes.join(' ')}`);
    });
  }

  function hasCompressionProposal(proposals) {
    return asArray(proposals).some(p => p.proposal_type === 'compression_rule_candidate');
  }

  function normalizeProposal(raw, index) {
    return BASE.normalizeProposal(raw, index);
  }

  function learn(reviewedCases = [], options = {}) {
    const report = BASE.learn(reviewedCases, options);
    const cases = asArray(reviewedCases).map(BASE.normalizeCase);

    if (hasConvergenceCase(cases) && !hasCompressionProposal(report.proposals)) {
      const proposal = normalizeProposal({
        proposal_type: 'compression_rule_candidate',
        title: 'Compress repeated mechanism-supported convergence into candidate principle',
        target_layer: 'principle_compression_layer',
        proposed_change: 'After repeated reviewed cases survive source review, compress them into a candidate principle about institutional convergence while keeping the principle challengeable.',
        rationale: 'Dossier-level conclusions require pattern compression without replacing claim-specific evidence. Mechanism classes such as shared_enforcement_pipeline should count as convergence signals.',
        expected_benefit: 'Allows higher-level learning from repeated named cases while preserving unresolved pressure and claim-specific evidence.',
        known_risks: ['Could become a worldview shortcut if promoted without enough reviewed cases.'],
        benchmark_cases: cases.filter(c => CONVERGENCE_CLASSES.includes(c.mechanism_class)).map(c => c.id)
      }, report.proposals.length);
      const sandbox = BASE.sandboxProposal(proposal, cases);
      report.proposals.push(proposal);
      report.sandbox_results.push(sandbox);
      report.counts.proposals = report.proposals.length;
      report.counts.blocked = report.sandbox_results.filter(r => !r.validation.valid).length;
      report.counts.reviewable = report.sandbox_results.filter(r => r.validation.valid).length;
      report.v011_patch = { applied:true, reason:'mechanism_class_convergence_detection', version:VERSION };
    } else {
      report.v011_patch = { applied:false, reason:'no_missing_convergence_proposal', version:VERSION };
    }

    report.packet_version = VERSION;
    return report;
  }

  global.SelfLearningV01 = Object.freeze({
    ...BASE,
    VERSION,
    learn
  });
  global.SelfLearningV011PatchStatus = { installed:true, version:VERSION };
})(typeof window !== 'undefined' ? window : globalThis);
