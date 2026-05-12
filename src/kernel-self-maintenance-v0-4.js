/* 42ndMind Kernel Self-Maintenance v0.4
 *
 * The kernel may notice recurring weaknesses and propose changes to its own
 * adapters, heuristics, or tests. It must not directly rewrite protected core
 * doctrine or bypass the governor.
 *
 * Self-maintenance lifecycle:
 * observe runtime/state pattern → propose improvement → evaluate risk
 * → store as candidate → tests/user/runtime may promote later.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DEFAULT_PROPOSAL_KEY = '42ndMind_self_maintenance_proposals_v0_4';
  const PROTECTED_TARGETS = Object.freeze([
    'core_doctrine',
    'objective_peak',
    'null_origin',
    'octahedron_surface_rule',
    'axis_semantics',
    'governor_final_authority',
    'retrieval_equals_verification',
    'provenance_equals_proof',
    'auto_rule_promotion',
    'delete_unresolved_pressure',
    'delete_contradiction'
  ]);

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function id(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
  function lower(value) { return text(value).toLowerCase(); }

  function storageAvailable() {
    try { return typeof localStorage !== 'undefined'; }
    catch (error) { return false; }
  }

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); }
    catch (error) { return fallback; }
  }

  function loadProposals(key = DEFAULT_PROPOSAL_KEY) {
    if (!storageAvailable()) return [];
    const raw = localStorage.getItem(key);
    const parsed = raw ? safeParse(raw, []) : [];
    return Array.isArray(parsed) ? parsed : [];
  }

  function saveProposals(proposals, key = DEFAULT_PROPOSAL_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    localStorage.setItem(key, JSON.stringify(asArray(proposals), null, 2));
    return { ok:true, reason:'saved_self_maintenance_proposals', key, count:asArray(proposals).length };
  }

  function clearProposals(key = DEFAULT_PROPOSAL_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    localStorage.removeItem(key);
    return { ok:true, reason:'cleared_self_maintenance_proposals', key };
  }

  function getRuntimeLog() {
    if (global.KernelBrainV04RuntimeBindings && typeof global.KernelBrainV04RuntimeBindings.loadLog === 'function') {
      return global.KernelBrainV04RuntimeBindings.loadLog();
    }
    return [];
  }

  function getStateSnapshot() {
    if (global.KernelStateV04 && typeof global.KernelStateV04.snapshot === 'function') {
      return global.KernelStateV04.snapshot();
    }
    return null;
  }

  function countEntries(entries, predicate) {
    return asArray(entries).filter(predicate).length;
  }

  function diagnostics(input = {}) {
    const runtimeLog = asArray(input.runtime_log || getRuntimeLog());
    const snapshot = input.snapshot || getStateSnapshot();
    const stateCounters = snapshot && snapshot.counters ? snapshot.counters : {};
    const nearNull = countEntries(runtimeLog, e => e.entry_type === 'near_null_observation') + Number(stateCounters.near_null_observations || 0);
    const clarifications = countEntries(runtimeLog, e => e.entry_type === 'clarification_needed_observation') + Number(stateCounters.clarification_requests || 0);
    const blocked = countEntries(runtimeLog, e => e.entry_type === 'blocked_pressure_audit_event') + Number(stateCounters.blocked_audits || 0);
    const candidates = countEntries(runtimeLog, e => /candidate_pressure/.test(text(e.entry_type))) + Number(stateCounters.candidate_pressures || 0);
    const pending = countEntries(runtimeLog, e => /pending_import/.test(text(e.entry_type))) + Number(stateCounters.pending_imports || 0);
    return {
      runtime_log_count: runtimeLog.length,
      near_null: nearNull,
      clarifications,
      blocked,
      candidates,
      pending_imports: pending,
      state_counters: clone(stateCounters),
      repeated_patterns: {
        many_near_null: nearNull >= 3,
        many_clarifications: clarifications >= 3,
        many_blocks: blocked >= 2,
        many_candidates: candidates >= 3,
        pending_import_pressure: pending >= 1
      }
    };
  }

  function proposalTemplate(target_layer, title, proposed_change, rationale, tests) {
    return {
      proposal_type: '42ndMind_self_maintenance_proposal_v0_4',
      proposal_version: VERSION,
      id: id('proposal'),
      created_at: now(),
      status: 'candidate_only',
      target_layer,
      title,
      proposed_change,
      rationale,
      tests_required: asArray(tests),
      promotion_state: {
        implemented: false,
        promoted_to_runtime: false,
        direct_self_rewrite: false,
        requires_explicit_apply: true,
        requires_tests: true
      },
      doctrine: {
        proposal_is_not_implementation: true,
        governor_must_assess_before_promotion: true,
        protected_core_cannot_be_rewritten_directly: true,
        self_improvement_is_candidate_pressure_before_promotion: true
      }
    };
  }

  function generateProposals(input = {}) {
    const d = diagnostics(input);
    const proposals = [];

    if (d.repeated_patterns.many_near_null) {
      proposals.push(proposalTemplate(
        'sensemaking_adapter',
        'Improve low-signal explanation and recovery path',
        'When repeated near-null inputs occur, show a compact prompt asking for the missing claim/evidence/question structure instead of only logging near-null.',
        'Repeated near-null entries suggest the system is correctly refusing gibberish but may need a better recovery affordance for the user.',
        ['kernel-sensemaking-test.html', 'kernel-brain-v0-4-test.html']
      ));
    }

    if (d.repeated_patterns.many_clarifications) {
      proposals.push(proposalTemplate(
        'sensemaking_adapter',
        'Add clarification templates for ambiguous inputs',
        'Map ambiguous inputs into one of three clarification prompts: claim needed, evidence needed, or question needed.',
        'Repeated clarification entries indicate the kernel is preserving ambiguity, but it can help the user supply clearer structure.',
        ['kernel-sensemaking-test.html', 'llm-brain-v0-4-test.html']
      ));
    }

    if (d.repeated_patterns.many_blocks) {
      proposals.push(proposalTemplate(
        'governor_adapter_boundary',
        'Summarize blocked pressure by reason',
        'Group blocked inputs by block reason so recurring rule-smuggling, self-sealing, or direct-coordination failures become visible.',
        'Repeated blocks may reveal attack patterns or recurring misuse. The kernel should notice the pattern without weakening the block.',
        ['kernel-epistemic-governor-test.html', 'kernel-command-preflight-test.html']
      ));
    }

    if (d.repeated_patterns.many_candidates) {
      proposals.push(proposalTemplate(
        'state_candidate_review',
        'Add candidate review queue',
        'Expose candidate pressures in a compact queue with status, reason, and required evidence before promotion.',
        'Many candidate pressures mean the kernel is accumulating potentially useful material without a review surface.',
        ['kernel-state-v0-4-test.html', 'llm-brain-v0-4-test.html']
      ));
    }

    if (d.repeated_patterns.pending_import_pressure) {
      proposals.push(proposalTemplate(
        'pending_import_review',
        'Add pending import review queue',
        'Show pending sanitized commands with caution status and import-executed=false until a separate live runtime imports them.',
        'Pending commands are already separated from belief movement. A queue would make them easier to inspect without accidental execution.',
        ['kernel-command-preflight-test.html', 'kernel-state-v0-4-test.html']
      ));
    }

    if (!proposals.length) {
      proposals.push(proposalTemplate(
        'self_maintenance_baseline',
        'Maintain current kernel behavior',
        'No recurring failure pattern is strong enough to justify a logic change. Continue logging and testing.',
        'A mature kernel should also know when not to change itself.',
        ['kernel-brain-v0-4-test.html', 'kernel-state-v0-4-test.html']
      ));
    }

    return { diagnostics:d, proposals };
  }

  function evaluateProposal(proposal = {}) {
    const target = lower(proposal.target_layer);
    const combined = lower([proposal.title, proposal.proposed_change, proposal.rationale, proposal.target_layer].join(' '));
    const issues = [];
    const protectedTarget = PROTECTED_TARGETS.includes(target) || PROTECTED_TARGETS.some(t => combined.includes(t));
    if (protectedTarget) issues.push({ severity:'block', code:'protected_core_target', message:'Proposal targets protected core doctrine or equivalent semantic target.' });
    if (/\b(auto[- ]?promote|direct self rewrite|rewrite core|ignore tests|skip tests|bypass governor|disable provenance|retrieval equals verification|delete unresolved|delete contradiction)\b/.test(combined)) {
      issues.push({ severity:'block', code:'unsafe_self_modification_language', message:'Proposal contains unsafe self-modification language.' });
    }
    if (!asArray(proposal.tests_required).length) issues.push({ severity:'caution', code:'missing_tests', message:'Proposal has no required tests.' });
    if (!text(proposal.rationale)) issues.push({ severity:'caution', code:'missing_rationale', message:'Proposal has no rationale.' });

    const decision = issues.some(i => i.severity === 'block') ? 'BLOCK_PROMOTION'
      : issues.some(i => i.severity === 'caution') ? 'HOLD_FOR_REVIEW'
      : 'PROMOTION_CANDIDATE';

    return {
      packet_type: '42ndMind_self_maintenance_evaluation_v0_4',
      packet_version: VERSION,
      created_at: now(),
      proposal_id: text(proposal.id),
      decision,
      issues,
      doctrine: {
        evaluation_is_not_implementation: true,
        promotion_requires_tests: true,
        governor_must_assess_before_promotion: true,
        protected_core_cannot_be_rewritten_directly: true
      }
    };
  }

  function storeProposal(proposal, key = DEFAULT_PROPOSAL_KEY) {
    const proposals = loadProposals(key);
    const evaluated = Object.assign({}, clone(proposal), { evaluation:evaluateProposal(proposal) });
    proposals.push(evaluated);
    const saved = saveProposals(proposals, key);
    return Object.assign({}, saved, { proposal:evaluated });
  }

  function proposeAndStore(input = {}, key = DEFAULT_PROPOSAL_KEY) {
    const generated = generateProposals(input);
    const stored = generated.proposals.map(p => storeProposal(p, key));
    return {
      packet_type: '42ndMind_self_maintenance_cycle_v0_4',
      packet_version: VERSION,
      created_at: now(),
      diagnostics: generated.diagnostics,
      stored,
      doctrine: {
        self_maintenance_generates_candidates_only: true,
        no_direct_logic_rewrite: true,
        tests_required_before_promotion: true,
        one_brain_governor_still_controls_movement: true
      }
    };
  }

  function exportProposals(key = DEFAULT_PROPOSAL_KEY) {
    return {
      packet_type: '42ndMind_self_maintenance_proposals_export_v0_4',
      packet_version: VERSION,
      created_at: now(),
      key,
      proposals: loadProposals(key),
      doctrine: {
        proposals_are_not_runtime_logic: true,
        export_is_not_promotion: true
      }
    };
  }

  global.KernelSelfMaintenanceV04 = Object.freeze({
    VERSION,
    DEFAULT_PROPOSAL_KEY,
    PROTECTED_TARGETS,
    diagnostics,
    generateProposals,
    evaluateProposal,
    storeProposal,
    proposeAndStore,
    loadProposals,
    saveProposals,
    clearProposals,
    exportProposals
  });
})(typeof window !== 'undefined' ? window : globalThis);
