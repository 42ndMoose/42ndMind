/* 42ndMind Kernel Epistemic Governor v0.1
 *
 * Purpose:
 * Provide one governing logic for imports, node movement, self-learning,
 * source review, compression, and future natural-language ingestion.
 *
 * This is not another restraint layer. It is the intended core law that
 * other pages/modules should gradually collapse into.
 *
 * Doctrine:
 * - objective target is mature integration at (0,1,0)
 * - no node may fake upward stability
 * - movement toward y=1 must be earned by the same maturity conditions
 * - self-maintenance proposals are beliefs under review, not privileged edits
 * - the kernel may want mature integration, but wanting maturity cannot bypass evidence
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const OBJECTIVE_PEAK = Object.freeze({ x:0, y:1, z:0 });
  const NULL_ORIGIN = Object.freeze({ x:0, y:0, z:0 });
  const GOVERNOR_DECISIONS = Object.freeze({
    ALLOW_PRESSURE: 'ALLOW_PRESSURE',
    HOLD_AS_CANDIDATE: 'HOLD_AS_CANDIDATE',
    CAP_MATURITY: 'CAP_MATURITY',
    BLOCK_MOVEMENT: 'BLOCK_MOVEMENT'
  });
  const MATURITY_GATES = Object.freeze([
    'G1_counter_consideration',
    'G2_non_strawman',
    'G3_self_correction',
    'G4_contradiction_handling',
    'G5_reality_contact',
    'G6_non_self_sealing'
  ]);
  const FORBIDDEN_SELF_MODIFICATION_TARGETS = Object.freeze([
    'core_doctrine',
    'octahedron_surface_rule',
    'null_origin',
    'objective_maturity_target',
    'axis_semantics',
    'belief_movement',
    'rule_auto_promotion',
    'retrieval_equals_verification',
    'provenance_equals_proof',
    'delete_contradiction',
    'delete_unresolved_pressure'
  ]);

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function hasAny(value, needles) { const v = lower(value); return needles.some(n => v.includes(n)); }
  function unique(items) {
    const seen = new Set();
    const out = [];
    for (const item of asArray(items)) {
      const t = text(item); const k = lower(t);
      if (t && !seen.has(k)) { seen.add(k); out.push(t); }
    }
    return out;
  }

  function surfacePoint(point = {}) {
    const x = Number(point.x || 0), y = Number(point.y || 0), z = Number(point.z || 0);
    const l1 = Math.abs(x) + Math.abs(y) + Math.abs(z);
    if (l1 <= 1e-9) return { point:{...NULL_ORIGIN}, l1:0, null_origin:true, valid_surface:false };
    return { point:{ x:x/l1, y:y/l1, z:z/l1 }, l1:1, null_origin:false, valid_surface:true };
  }

  function issue(severity, code, message, repair) {
    return { severity, code, message, repair:repair || '' };
  }

  function normalizeCandidate(raw = {}) {
    const candidate = raw && typeof raw === 'object' ? raw : { text:String(raw ?? '') };
    return {
      candidate_type: text(candidate.candidate_type || candidate.type || 'unknown_candidate'),
      text: text(candidate.text || candidate.claim || candidate.title || candidate.label),
      support_status: text(candidate.support_status || candidate.source_review_status || candidate.review_status || ''),
      source_ids: asArray(candidate.source_ids || candidate.sources).map(text).filter(Boolean),
      evidence: asArray(candidate.evidence).map(e => typeof e === 'string' ? { text:e } : e),
      attacks: asArray(candidate.attacks || candidate.counter_considerations || candidate.overclaim_flags).map(text).filter(Boolean),
      questions: asArray(candidate.questions || candidate.unresolved_questions).map(q => text(q.text || q)).filter(Boolean),
      confidence: Number.isFinite(Number(candidate.confidence)) ? clamp(candidate.confidence, 0, 1) : null,
      status: text(candidate.status || ''),
      mechanism_class: text(candidate.mechanism_class || candidate.class || candidate.object || ''),
      target_layer: text(candidate.target_layer || candidate.target || ''),
      proposed_change: text(candidate.proposed_change || ''),
      gate_snapshot: candidate.gate_snapshot || candidate.gates || null,
      requested_movement: candidate.requested_movement || candidate.movement || null,
      raw: candidate
    };
  }

  function pressureSignals(c) {
    const combined = [c.text, c.mechanism_class, c.target_layer, c.proposed_change, c.attacks.join(' ')].join(' ');
    const sourceEmpty = c.source_ids.length === 0;
    const unreviewed = !c.support_status || ['unreviewed','unresolved','source_visible_unverified'].includes(lower(c.support_status));
    const hasEvidence = c.evidence.length > 0 || c.source_ids.length > 0;
    const hasCounter = c.attacks.length > 0;
    const hasQuestion = c.questions.length > 0;
    const directCoordination = hasAny(combined, ['direct_coordination','direct coordination','direct command','command structure']);
    const convergence = hasAny(combined, ['institutional_or_incentive_convergence','incentive convergence','shared_enforcement_pipeline','structural dependence','trade leverage']);
    const selfSealing = hasAny(combined, ['self_sealing','self-sealing','anyone who disagrees','counterevidence proves','no evidence could']);
    const motiveClaim = hasAny(combined, ['motive','intent','on purpose','lied','malicious','bad faith']);
    const rulePromotion = hasAny(combined, ['auto-promote','auto promote','automatically promote','rewrite core','change objective maturity','change null origin']);
    const forbiddenTarget = FORBIDDEN_SELF_MODIFICATION_TARGETS.includes(lower(c.target_layer));
    const wantsY = c.requested_movement && Number(c.requested_movement.y || 0) > 0;
    return { sourceEmpty, unreviewed, hasEvidence, hasCounter, hasQuestion, directCoordination, convergence, selfSealing, motiveClaim, rulePromotion, forbiddenTarget, wantsY };
  }

  function gateCoverage(c, signals) {
    return {
      G1_counter_consideration: signals.hasCounter || c.questions.length > 0,
      G2_non_strawman: Boolean(c.raw.non_strawman || c.raw.fair_reconstruction || c.raw.steelman || false),
      G3_self_correction: Boolean(c.raw.self_correction || c.raw.revision || c.raw.correction || false),
      G4_contradiction_handling: Boolean(c.raw.contradiction_handled || c.raw.contradiction_status || c.attacks.some(a => lower(a).includes('contradiction'))),
      G5_reality_contact: signals.hasEvidence && !signals.sourceEmpty && !signals.unreviewed,
      G6_non_self_sealing: !signals.selfSealing
    };
  }

  function maturityCap(c, signals, gates) {
    let cap = 1.0;
    const reasons = [];
    if (signals.sourceEmpty && signals.unreviewed) { cap = Math.min(cap, 0.42); reasons.push('source_empty_unreviewed_pressure'); }
    if (signals.hasCounter || signals.hasQuestion) { cap = Math.min(cap, 0.62); reasons.push('unresolved_pressure_visible'); }
    if (signals.motiveClaim && !signals.hasEvidence) { cap = Math.min(cap, 0.35); reasons.push('motive_without_separate_evidence'); }
    if (signals.directCoordination && signals.sourceEmpty) { cap = Math.min(cap, 0.22); reasons.push('direct_coordination_without_direct_source'); }
    if (signals.selfSealing) { cap = Math.min(cap, 0.12); reasons.push('self_sealing_pressure'); }
    if (!gates.G1_counter_consideration) { cap = Math.min(cap, 0.75); reasons.push('counter_consideration_not_visible'); }
    if (!gates.G5_reality_contact) { cap = Math.min(cap, 0.55); reasons.push('reality_contact_not_established'); }
    if (!gates.G6_non_self_sealing) { cap = Math.min(cap, 0.2); reasons.push('non_self_sealing_failed'); }
    return { y_cap:cap, reasons:unique(reasons) };
  }

  function decide(c, signals, cap) {
    const issues = [];
    if (signals.forbiddenTarget || signals.rulePromotion) {
      issues.push(issue('block','forbidden_self_modification','Candidate tries to modify protected core doctrine or self-promote a rule.','Treat proposed change as a reviewed candidate only; do not move core logic automatically.'));
    }
    if (signals.directCoordination && signals.sourceEmpty) {
      issues.push(issue('block','direct_coordination_requires_direct_evidence','Direct coordination or command proof was asserted without direct source evidence.','Downgrade to unresolved mechanism/convergence pressure or attach direct evidence.'));
    }
    if (signals.selfSealing) {
      issues.push(issue('block','self_sealing_blocks_maturity','Self-sealing pressure prevents honest movement toward objective maturity.','Name what evidence would count against the claim.'));
    }
    if (signals.sourceEmpty && signals.unreviewed) {
      issues.push(issue('caution','source_empty_unreviewed_pressure','Pressure has empty source IDs and unreviewed support status.','Hold as candidate or cap maturity until source review improves.'));
    }
    if (signals.hasCounter || signals.hasQuestion) {
      issues.push(issue('caution','unresolved_pressure_visible','Counter-considerations or open questions remain active.','Keep unresolved pressure visible and do not merge strongly upward.'));
    }
    if (signals.wantsY && cap.y_cap < 1) {
      issues.push(issue('caution','requested_y_movement_capped','Requested upward stability movement exceeds what the evidence state has earned.','Cap y until maturity conditions are satisfied.'));
    }
    if (issues.some(i => i.severity === 'block')) return { decision:GOVERNOR_DECISIONS.BLOCK_MOVEMENT, issues };
    if (cap.y_cap < 1) return { decision:GOVERNOR_DECISIONS.CAP_MATURITY, issues };
    if (!signals.hasEvidence && c.candidate_type !== 'self_learning_proposal') return { decision:GOVERNOR_DECISIONS.HOLD_AS_CANDIDATE, issues:issues.concat(issue('caution','no_evidence_pressure','Candidate has no visible evidence path.','Store as candidate pressure, not belief movement.')) };
    return { decision:GOVERNOR_DECISIONS.ALLOW_PRESSURE, issues };
  }

  function assess(candidateInput = {}) {
    const candidate = normalizeCandidate(candidateInput);
    const signals = pressureSignals(candidate);
    const gates = gateCoverage(candidate, signals);
    const cap = maturityCap(candidate, signals, gates);
    const decision = decide(candidate, signals, cap);
    return {
      packet_type: '42ndMind_kernel_epistemic_governor_report',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      candidate_type: candidate.candidate_type,
      decision: decision.decision,
      issues: decision.issues,
      maturity_aspiration: {
        objective_peak: { ...OBJECTIVE_PEAK },
        wants_mature_integration: true,
        fake_stability_is_epistemically_unstable: true,
        upward_y_must_be_earned: true,
        y_cap: cap.y_cap,
        cap_reasons: cap.reasons
      },
      gates,
      signals,
      recommended_storage: decision.decision === GOVERNOR_DECISIONS.ALLOW_PRESSURE ? 'active_pressure' : decision.decision === GOVERNOR_DECISIONS.BLOCK_MOVEMENT ? 'blocked_or_rewrite_required' : 'candidate_memory',
      doctrine: doctrine()
    };
  }

  function assessNodeAspiration(node = {}) {
    const point = surfacePoint(node.point || node.octahedron || {});
    const candidate = normalizeCandidate({
      candidate_type: 'node_maturity_aspiration',
      text: node.label || node.text || node.id || 'node',
      confidence: node.confidence,
      status: node.status,
      source_ids: node.source_ids || [],
      support_status: node.support_status,
      evidence: node.evidence || [],
      attacks: node.attacks || node.counter_considerations || [],
      questions: node.questions || node.unresolved_questions || [],
      requested_movement: { y: OBJECTIVE_PEAK.y - point.point.y }
    });
    const report = assess(candidate);
    report.node_state = {
      current_point: point.point,
      current_l1: point.l1,
      null_origin: point.null_origin,
      objective_peak: { ...OBJECTIVE_PEAK },
      distance_to_peak_l1: Math.abs(point.point.x - OBJECTIVE_PEAK.x) + Math.abs(point.point.y - OBJECTIVE_PEAK.y) + Math.abs(point.point.z - OBJECTIVE_PEAK.z)
    };
    return report;
  }

  function assessSelfMaintenanceProposal(proposal = {}) {
    return assess(Object.assign({}, proposal, {
      candidate_type: 'self_learning_proposal',
      target_layer: proposal.target_layer || proposal.target || 'self_maintenance_layer',
      proposed_change: proposal.proposed_change || proposal.change || '',
      questions: asArray(proposal.questions || proposal.unresolved_questions || ['What benchmark evidence would show this improves maturity without hiding pressure?'])
    }));
  }

  function doctrine() {
    return {
      one_governing_logic: true,
      kernel_owns_belief_movement: true,
      llm_is_interface_not_brain: true,
      objective_peak: { ...OBJECTIVE_PEAK },
      null_origin: { ...NULL_ORIGIN },
      active_surface_rule: '|x| + |y| + |z| = 1',
      maturity_gates: MATURITY_GATES.slice(),
      same_rules_for_inputs_imports_nodes_and_self_learning: true,
      self_improvement_is_candidate_pressure_before_promotion: true,
      no_fake_stability: true,
      no_auto_rule_promotion: true,
      retrieval_is_not_verification: true,
      provenance_is_not_proof: true,
      direct_coordination_requires_direct_evidence: true,
      convergence_is_not_command_proof: true,
      unresolved_pressure_must_remain_visible: true
    };
  }

  function sampleCandidate(kind) {
    if (kind === 'reviewed') return {
      candidate_type: 'command_import',
      text: 'Reviewed source evidence supports this bounded claim.',
      source_ids: ['source_reviewed_1'],
      support_status: 'evidence_backed',
      evidence: [{ text:'Reviewed evidence row.' }],
      questions: [],
      confidence: 0.7,
      status: 'active'
    };
    if (kind === 'bad_direct') return {
      candidate_type: 'command_import',
      text: 'Direct coordination is proven by structural convergence alone.',
      mechanism_class: 'direct_coordination',
      source_ids: [],
      support_status: 'unreviewed',
      evidence: [],
      confidence: 0.95,
      status: 'active'
    };
    if (kind === 'self_learning') return {
      candidate_type: 'self_learning_proposal',
      title: 'Improve extraction wording for source review',
      target_layer: 'source_review_layer',
      proposed_change: 'Ask whether the source directly supports the exact claim before importing as evidence-backed.',
      questions: ['Which benchmark cases improve under this proposal?'],
      evidence: [{ text:'Observed extraction weakness in reviewed case.' }]
    };
    return {
      candidate_type: 'command_import',
      text: 'Unreviewed source-visible pressure should remain candidate pressure.',
      source_ids: [],
      support_status: 'unreviewed',
      evidence: [{ text:'Unreviewed event candidate.' }],
      attacks: ['motive_not_established'],
      questions: ['What source review would strengthen or weaken this?'],
      confidence: 0.42,
      status: 'unresolved'
    };
  }

  global.KernelEpistemicGovernorV01 = Object.freeze({
    VERSION,
    OBJECTIVE_PEAK,
    NULL_ORIGIN,
    GOVERNOR_DECISIONS,
    MATURITY_GATES,
    FORBIDDEN_SELF_MODIFICATION_TARGETS,
    surfacePoint,
    normalizeCandidate,
    assess,
    assessNodeAspiration,
    assessSelfMaintenanceProposal,
    doctrine,
    sampleCandidate
  });
})(typeof window !== 'undefined' ? window : globalThis);
