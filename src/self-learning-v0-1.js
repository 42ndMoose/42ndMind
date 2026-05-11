/* 42ndMind Self-Learning Sandbox v0.1
 * Bounded self-improvement layer.
 *
 * Purpose:
 * Learn from reviewed cases by proposing improvements to extraction schemas,
 * source-review checklists, mechanism rubrics, benchmark cases, compression rules,
 * and candidate heuristics.
 *
 * It never promotes rules automatically, never changes core Octahedron doctrine,
 * never deletes contradictions, and never moves belief state.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  const PROPOSAL_TYPES = Object.freeze([
    'extraction_schema_improvement',
    'source_review_checklist_improvement',
    'mechanism_classification_rubric',
    'benchmark_case',
    'compression_rule_candidate',
    'maturity_cap_heuristic',
    'risk_flag_improvement'
  ]);

  const FORBIDDEN_TARGETS = Object.freeze([
    'core_doctrine',
    'octahedron_surface_rule',
    'null_origin',
    'objective_maturity_target',
    'axis_semantics',
    'belief_movement',
    'contradiction_deletion',
    'rule_auto_promotion',
    'retrieval_equals_verification',
    'provenance_equals_proof'
  ]);

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function uid(prefix) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
  function oneOf(value, allowed, fallback) { return allowed.includes(value) ? value : fallback; }

  function normalizeCase(raw = {}, index = 0) {
    return {
      id: text(raw.id) || `case_${String(index + 1).padStart(3, '0')}`,
      title: text(raw.title) || 'Untitled reviewed case',
      case_kind: text(raw.case_kind || raw.kind) || 'reviewed_case',
      observed_failure: text(raw.observed_failure || raw.failure),
      observed_success: text(raw.observed_success || raw.success),
      signals: asArray(raw.signals).map(lower).filter(Boolean),
      cap_reasons: asArray(raw.cap_reasons).map(text).filter(Boolean),
      classification: text(raw.classification),
      mechanism_class: text(raw.mechanism_class),
      source_review_status: text(raw.source_review_status),
      unresolved_questions: asArray(raw.unresolved_questions).map(text).filter(Boolean),
      notes: asArray(raw.notes).map(text).filter(Boolean)
    };
  }

  function normalizeProposal(raw = {}, index = 0) {
    return {
      id: text(raw.id) || `proposal_${String(index + 1).padStart(3, '0')}`,
      proposal_type: oneOf(text(raw.proposal_type || raw.type), PROPOSAL_TYPES, 'risk_flag_improvement'),
      title: text(raw.title) || 'Untitled self-learning proposal',
      target_layer: text(raw.target_layer) || 'review_layer',
      target_is_forbidden: FORBIDDEN_TARGETS.includes(text(raw.target_layer)),
      proposed_change: text(raw.proposed_change),
      rationale: text(raw.rationale),
      expected_benefit: text(raw.expected_benefit),
      known_risks: asArray(raw.known_risks).map(text).filter(Boolean),
      benchmark_cases: asArray(raw.benchmark_cases).map(text).filter(Boolean),
      required_user_approval: true,
      promotion_status: 'candidate_only',
      meta: {
        non_scoring: true,
        sandbox_only: true,
        auto_promotion_allowed: false,
        belief_movement: 'none',
        kernel_state_mutation: false
      }
    };
  }

  function hasSignal(cases, pattern) {
    return cases.some(c => c.signals.includes(pattern) || lower(c.observed_failure).includes(pattern) || c.cap_reasons.some(r => lower(r).includes(pattern)));
  }

  function countSignal(cases, pattern) {
    return cases.filter(c => c.signals.includes(pattern) || lower(c.observed_failure).includes(pattern) || c.cap_reasons.some(r => lower(r).includes(pattern))).length;
  }

  function proposeFromCases(reviewedCases = []) {
    const cases = asArray(reviewedCases).map(normalizeCase);
    const proposals = [];

    if (hasSignal(cases, 'no_source_registry_or_source_review_visibility') || hasSignal(cases, 'source_review_failure')) {
      proposals.push(normalizeProposal({
        proposal_type: 'source_review_checklist_improvement',
        title: 'Require source-review visibility before high-y maturity claims',
        target_layer: 'source_review_layer',
        proposed_change: 'Add a checklist item that asks whether source objects are visible, retrieved, reviewed for exact-claim support, and marked with unresolved source questions before maturity pressure can rise.',
        rationale: 'Cases without source visibility can look clean while lacking support context.',
        expected_benefit: 'Reduces premature maturity claims from provenance-only or unretrieved source states.',
        known_risks: ['May over-cap early exploratory states unless marked as exploratory rather than mature.'],
        benchmark_cases: cases.filter(c => c.cap_reasons.includes('no_source_registry_or_source_review_visibility')).map(c => c.id)
      }, proposals.length));
    }

    if (hasSignal(cases, 'motive_overclaim_pressure') || hasSignal(cases, 'motive overclaim')) {
      proposals.push(normalizeProposal({
        proposal_type: 'mechanism_classification_rubric',
        title: 'Separate mechanism support from motive proof',
        target_layer: 'mechanism_classification_layer',
        proposed_change: 'When behavior alignment or institutional convergence is shown without direct motive evidence, classify as mechanism-supported but motive-unproven.',
        rationale: 'Motive overclaim was detected in reviewed cases. The system should preserve mechanism evidence while refusing unsupported intent claims.',
        expected_benefit: 'Improves named-actor/event conclusions without turning pattern recognition into guilt or intent claims.',
        known_risks: ['Could understate intent when direct motive evidence exists unless source review captures it clearly.'],
        benchmark_cases: cases.filter(c => c.cap_reasons.includes('motive_overclaim_pressure')).map(c => c.id)
      }, proposals.length));
    }

    if (hasSignal(cases, 'self_sealing_pressure') || hasSignal(cases, 'self-sealing')) {
      proposals.push(normalizeProposal({
        proposal_type: 'risk_flag_improvement',
        title: 'Flag self-sealing claims as hard maturity blockers',
        target_layer: 'maturity_objective_layer',
        proposed_change: 'Preserve a hard cap when counterevidence is reinterpreted as confirmation or disagreement is treated as proof of corruption.',
        rationale: 'Self-sealing pressure blocks truth-seeking because it prevents reality-contact from changing belief state.',
        expected_benefit: 'Prevents high-y stability from becoming dogmatic closure.',
        known_risks: ['Must distinguish actual self-sealing from partial non-self-sealing gate weakness.'],
        benchmark_cases: cases.filter(c => c.cap_reasons.includes('self_sealing_pressure')).map(c => c.id)
      }, proposals.length));
    }

    if (hasSignal(cases, 'partial_gate') || countSignal(cases, 'partial_gate') >= 1) {
      proposals.push(normalizeProposal({
        proposal_type: 'benchmark_case',
        title: 'Add benchmark for gate-limited but not self-sealing states',
        target_layer: 'benchmark_layer',
        proposed_change: 'Add a benchmark case where partial non-self-sealing gate weakness is classified as gate_limited rather than self_sealing_capped unless exact self_sealing_pressure exists.',
        rationale: 'Reviewed live state showed classification can be too strong if substring matching treats partial_gate_non_self_sealing as actual self-sealing pressure.',
        expected_benefit: 'Improves classification precision while preserving caps.',
        known_risks: ['None if classification remains separate from cap strength.'],
        benchmark_cases: cases.filter(c => c.cap_reasons.some(r => lower(r).startsWith('partial_gate'))).map(c => c.id)
      }, proposals.length));
    }

    if (hasSignal(cases, 'institutional_or_incentive_convergence') || hasSignal(cases, 'shared_enforcement_pipeline')) {
      proposals.push(normalizeProposal({
        proposal_type: 'compression_rule_candidate',
        title: 'Compress repeated mechanism-supported convergence into candidate principle',
        target_layer: 'principle_compression_layer',
        proposed_change: 'After repeated reviewed cases survive source review, compress them into a candidate principle about institutional convergence while keeping the principle challengeable.',
        rationale: 'Dossier-level conclusions require pattern compression without replacing claim-specific evidence.',
        expected_benefit: 'Allows higher-level learning from repeated named cases while preserving unresolved pressure.',
        known_risks: ['Could become a worldview shortcut if promoted without enough reviewed cases.'],
        benchmark_cases: cases.filter(c => ['institutional_or_incentive_convergence','shared_enforcement_pipeline'].includes(c.mechanism_class)).map(c => c.id)
      }, proposals.length));
    }

    if (!proposals.length) {
      proposals.push(normalizeProposal({
        proposal_type: 'benchmark_case',
        title: 'No strong learning signal; preserve case as benchmark candidate',
        target_layer: 'benchmark_layer',
        proposed_change: 'Store the reviewed case pattern as a benchmark candidate rather than changing rules.',
        rationale: 'No repeated or high-confidence failure pattern was detected.',
        expected_benefit: 'Prevents overfitting from one weak case.',
        known_risks: ['May slow learning when real patterns are sparse.'],
        benchmark_cases: cases.map(c => c.id)
      }, proposals.length));
    }

    return proposals;
  }

  function validateProposal(proposal = {}) {
    const p = normalizeProposal(proposal);
    const violations = [];
    if (p.target_is_forbidden) violations.push(`forbidden_target:${p.target_layer}`);
    if (/\b(auto.?promote|automatically promote|rewrite core|delete contradiction|retrieval equals verification|provenance equals proof|change objective maturity|change null origin)\b/i.test(`${p.title} ${p.proposed_change} ${p.rationale}`)) {
      violations.push('forbidden_change_language');
    }
    if (p.meta.auto_promotion_allowed !== false) violations.push('auto_promotion_not_false');
    if (p.meta.belief_movement !== 'none') violations.push('belief_movement_not_none');
    return {
      valid: violations.length === 0,
      violations,
      proposal: p,
      doctrine: {
        sandbox_only: true,
        user_approval_required: true,
        kernel_owns_belief_movement: true,
        core_doctrine_protected: true
      }
    };
  }

  function sandboxProposal(proposal = {}, cases = []) {
    const validation = validateProposal(proposal);
    const reviewedCases = asArray(cases).map(normalizeCase);
    const touchedCases = reviewedCases.filter(c => validation.proposal.benchmark_cases.includes(c.id));
    const riskCount = validation.proposal.known_risks.length + validation.violations.length;
    return {
      packet_type: '42ndMind_self_learning_sandbox_result',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      proposal: validation.proposal,
      validation,
      sandbox: {
        applied_to_kernel: false,
        belief_movement: 'none',
        promotion_status: validation.valid ? 'candidate_can_be_reviewed' : 'blocked_by_guardrails',
        touched_case_count: touchedCases.length,
        expected_benefit: validation.proposal.expected_benefit,
        risk_count: riskCount,
        recommendation: validation.valid ? 'review_before_promotion' : 'reject_or_rewrite_candidate'
      }
    };
  }

  function learn(reviewedCases = [], options = {}) {
    const cases = asArray(reviewedCases).map(normalizeCase);
    const proposals = proposeFromCases(cases);
    const sandbox_results = proposals.map(p => sandboxProposal(p, cases));
    return {
      packet_type: '42ndMind_self_learning_report',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      purpose: 'Propose bounded self-improvements from reviewed cases without changing core doctrine or belief state.',
      reviewed_cases: cases,
      proposals,
      sandbox_results,
      counts: {
        reviewed_cases: cases.length,
        proposals: proposals.length,
        blocked: sandbox_results.filter(r => !r.validation.valid).length,
        reviewable: sandbox_results.filter(r => r.validation.valid).length
      },
      doctrine: {
        non_scoring: true,
        sandbox_only: true,
        metadata_only: true,
        user_approval_required_before_promotion: true,
        auto_promotion_allowed: false,
        core_doctrine_protected: true,
        belief_movement: 'none',
        kernel_state_mutation: false,
        retrieval_is_not_verification: true,
        provenance_is_not_proof: true
      },
      next_kernel_state_extension: {
        field: 'selfLearningCandidates',
        value: proposals,
        attach_as_metadata_only: true,
        scoring_allowed: false
      }
    };
  }

  function sampleCases() {
    return [
      {
        id: 'case_live_motive_cap',
        title: 'Live contradiction example capped by motive overclaim and missing evidence/source visibility',
        case_kind: 'live_hard_fusion_review',
        cap_reasons: ['no_evidence_grounding','no_source_registry_or_source_review_visibility','unresolved_contradiction_pressure','motive_overclaim_pressure','partial_gate_non_self_sealing'],
        classification: 'motive_overclaim_capped',
        observed_success: 'Hard fusion constrained upward y and classification was corrected to motive_overclaim_capped.'
      },
      {
        id: 'case_partial_gate_precision',
        title: 'Partial non-self-sealing gate should not equal actual self-sealing pressure',
        case_kind: 'classification_precision_review',
        cap_reasons: ['partial_gate_non_self_sealing'],
        classification: 'gate_limited',
        observed_failure: 'Earlier substring classification risk could label partial_gate_non_self_sealing as self_sealing_capped.'
      },
      {
        id: 'case_convergence_mechanism',
        title: 'Mechanism-supported convergence without command proof',
        case_kind: 'entity_event_source_review',
        mechanism_class: 'shared_enforcement_pipeline',
        source_review_status: 'source_visible',
        unresolved_questions: ['Is there direct command evidence, or only institutional convergence?'],
        observed_success: 'Mechanism support preserved without overclaiming direct command.'
      }
    ];
  }

  global.SelfLearningV01 = Object.freeze({
    VERSION,
    PROPOSAL_TYPES,
    FORBIDDEN_TARGETS,
    normalizeCase,
    normalizeProposal,
    proposeFromCases,
    validateProposal,
    sandboxProposal,
    learn,
    sampleCases
  });
})(typeof window !== 'undefined' ? window : globalThis);
