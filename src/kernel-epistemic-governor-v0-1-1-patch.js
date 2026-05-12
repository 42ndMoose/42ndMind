/* 42ndMind Kernel Epistemic Governor v0.1.1 patch
 *
 * Fixes the reviewed sample case so it actually satisfies the governor's
 * maturity path: reviewed source support plus visible counter-consideration.
 * The rule is not weakened. The sample is corrected.
 */
(function (global) {
  'use strict';
  if (!global.KernelEpistemicGovernorV01) return;

  const BASE = global.KernelEpistemicGovernorV01;
  const VERSION = '0.1.1';

  function sampleCandidate(kind) {
    if (kind === 'reviewed') return {
      candidate_type: 'command_import',
      text: 'Reviewed source evidence supports this bounded claim.',
      source_ids: ['source_reviewed_1'],
      support_status: 'evidence_backed',
      evidence: [{ text:'Reviewed evidence row.' }],
      questions: ['What would weaken or falsify this bounded claim?'],
      confidence: 0.7,
      status: 'active',
      fair_reconstruction: true
    };
    return BASE.sampleCandidate(kind);
  }

  global.KernelEpistemicGovernorV01 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    sampleCandidate
  }));
})(typeof window !== 'undefined' ? window : globalThis);
