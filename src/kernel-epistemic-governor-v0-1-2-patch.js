/* 42ndMind Kernel Epistemic Governor v0.1.2 patch
 *
 * Fix:
 * v0.1.1 corrected the reviewed sample by adding a falsification question,
 * but the base governor treated every question as unresolved pressure.
 *
 * v0.1.2 separates falsifiability/counter-consideration visibility from
 * unresolved doubt. A reviewed, evidence-backed, bounded claim may be allowed
 * if its question is a weakening/falsification criterion rather than an open
 * unresolved defect.
 */
(function (global) {
  'use strict';
  if (!global.KernelEpistemicGovernorV01) return;

  const BASE = global.KernelEpistemicGovernorV01;
  const VERSION = '0.1.2';

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }

  function isFalsifiabilityQuestion(q) {
    const t = lower(q && (q.text || q));
    return /\b(what would weaken|what would falsify|falsify this|weaken this|count against|would count against|defeat this claim|disconfirm)\b/.test(t);
  }

  function hasOnlyFalsifiabilityQuestions(candidate) {
    const questions = asArray(candidate.questions || candidate.unresolved_questions);
    return questions.length > 0 && questions.every(isFalsifiabilityQuestion);
  }

  function reviewedEvidenceBacked(candidate) {
    const sourceIds = asArray(candidate.source_ids || candidate.sources).map(text).filter(Boolean);
    const support = lower(candidate.support_status || candidate.source_review_status || candidate.review_status || '');
    const evidence = asArray(candidate.evidence);
    return sourceIds.length > 0 && evidence.length > 0 && ['evidence_backed','reviewed','verified_for_claim','source_reviewed'].includes(support);
  }

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
      fair_reconstruction: true,
      falsifiability_visible: true
    };
    return BASE.sampleCandidate(kind);
  }

  function stripFalsifiabilityAsUnresolved(candidate) {
    if (!reviewedEvidenceBacked(candidate) || !hasOnlyFalsifiabilityQuestions(candidate)) return candidate;
    const clone = JSON.parse(JSON.stringify(candidate));
    clone.falsifiability_visible = true;
    clone.counter_consideration_visible = true;
    clone.unresolved_questions = [];
    clone.questions = [];
    clone.raw_falsifiability_questions = asArray(candidate.questions || candidate.unresolved_questions).map(q => text(q.text || q)).filter(Boolean);
    return clone;
  }

  function assess(candidateInput) {
    const prepared = stripFalsifiabilityAsUnresolved(candidateInput || {});
    const report = BASE.assess(prepared);
    if (prepared && prepared.falsifiability_visible && report.decision === 'CAP_MATURITY') {
      const onlyCounterCap = asArray(report.maturity_aspiration && report.maturity_aspiration.cap_reasons).every(reason => reason === 'counter_consideration_not_visible' || reason === 'unresolved_pressure_visible');
      const sourceReviewed = reviewedEvidenceBacked(candidateInput || {});
      if (sourceReviewed && onlyCounterCap) {
        report.decision = 'ALLOW_PRESSURE';
        report.recommended_storage = 'active_pressure';
        report.maturity_aspiration.y_cap = 1;
        report.maturity_aspiration.cap_reasons = [];
        report.issues = asArray(report.issues).filter(issue => !['unresolved_pressure_visible','requested_y_movement_capped'].includes(issue.code));
        report.falsifiability_patch = {
          applied: true,
          version: VERSION,
          rule: 'falsifiability_question_is_counter_consideration_visibility_not_unresolved_defect'
        };
      }
    }
    report.packet_version = VERSION;
    return report;
  }

  function assessSelfMaintenanceProposal(proposal) {
    return assess(Object.assign({}, proposal || {}, {
      candidate_type: 'self_learning_proposal',
      target_layer: (proposal && (proposal.target_layer || proposal.target)) || 'self_maintenance_layer',
      proposed_change: (proposal && (proposal.proposed_change || proposal.change)) || '',
      questions: asArray(proposal && (proposal.questions || proposal.unresolved_questions)).length
        ? asArray(proposal.questions || proposal.unresolved_questions)
        : ['What benchmark evidence would show this improves maturity without hiding pressure?']
    }));
  }

  function assessNodeAspiration(node) {
    const base = BASE.assessNodeAspiration(node || {});
    base.packet_version = VERSION;
    return base;
  }

  global.KernelEpistemicGovernorV01 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    sampleCandidate,
    assess,
    assessSelfMaintenanceProposal,
    assessNodeAspiration
  }));
})(typeof window !== 'undefined' ? window : globalThis);
