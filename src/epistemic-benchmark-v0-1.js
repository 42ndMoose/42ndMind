/* Epistemic Benchmark v0.1
   Browser-friendly benchmark, sandbox, and memory compression utilities for 42ndMind.
   Depends on src/epistemic-kernel-v0-2.js being loaded first. */
(function (global) {
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function nowIso() { return new Date().toISOString(); }
  function num(value) { return Number(value || 0); }
  function round(value, places = 4) { const factor = Math.pow(10, places); return Math.round(num(value) * factor) / factor; }
  function l1(point) { return Math.abs(num(point?.x)) + Math.abs(num(point?.y)) + Math.abs(num(point?.z)); }
  function surfaceValid(point) { const total = l1(point); if (total === 0) return true; return Math.abs(total - 1) < 0.000001; }
  function findClaim(state, ref) { return (state.claims || []).find((claim) => claim.id === ref || claim.client_id === ref || claim.text === ref) || null; }
  function openQuestions(state) { return (state.questions || []).filter((question) => question.status === 'open'); }
  function activeContradictions(state) { return (state.contradictions || []).filter((contradiction) => contradiction.status === 'active'); }
  function rootY(state) { return num(state.octahedron?.point?.y); }
  function allNodeSurfaceValid(state) { return (state.beliefGraph?.nodes || []).every((node) => surfaceValid(node.octahedron?.point || { x: 0, y: 0, z: 0 })); }
  function importPacket(kernel, packet) { return kernel.importExtractionPacket(clone(packet)); }

  const CASES = [
    {
      id: 'timeline_contradiction_timestamp_attack', title: 'Timeline contradiction with timestamp attack', category: 'evidence_grounded_update', milestone: 4,
      setup(kernel) { importPacket(kernel, { packet_type: 'epistemic_extraction_packet', claims: [ { client_id: 'c1', text: 'I submitted the form before the deadline.', subject: 'user', object: 'form', scope: 'claim', confidence: 0.55 }, { client_id: 'c2', text: 'I submitted it this morning, but the deadline was yesterday.', subject: 'user', object: 'form', scope: 'claim', confidence: 0.70 } ], evidence: [ { text: 'The timestamp shows the form was submitted after the posted deadline.', relation: 'attacks', target_client_id: 'c1', strength: 'strong', confidence: 0.90 } ], principles: [], dependencies: [], questions: [], observations: [] }); },
      expect(state) { const target = findClaim(state, 'c1'); return { passed: !!target && (target.status === 'weakened' || target.confidence < 0.35) && state.evidence.length === 1, checks: { target_confidence: round(target?.confidence), target_status: target?.status || null, evidence_count: state.evidence.length, active_contradictions: activeContradictions(state).length, surface_valid: allNodeSurfaceValid(state) } }; },
      failure_pattern: 'Timestamp evidence does not sharply weaken the before-deadline claim.'
    },
    {
      id: 'mistaken_accusation_live_hypotheses', title: 'Mistaken accusation preserves hypotheses before motive certainty', category: 'motive_calibration', milestone: 4,
      setup(kernel) { kernel.quickIngest('Alex stole my charger. Actually, I found the charger in my own backpack. I did not check my backpack before accusing Alex.', { mode: 'auto' }); },
      expect(state) { const hasContradiction = activeContradictions(state).some((item) => /Mistaken-accusation/.test(item.reason)); const anyHypothesis = (state.claims || []).some((claim) => (claim.live_hypotheses || []).length); const motiveQuestion = openQuestions(state).some((q) => /mistake|scope shift|deliberate deception|evidence/i.test(q.text)); return { passed: hasContradiction && anyHypothesis && motiveQuestion, checks: { active_contradictions: activeContradictions(state).length, has_mistaken_accusation: hasContradiction, has_live_hypotheses: anyHypothesis, open_questions: openQuestions(state).length } }; },
      failure_pattern: 'The kernel jumps to motive or ignores the mistaken-accusation pressure.'
    },
    {
      id: 'self_sealing_belief_detection', title: 'Self-sealing belief drives G6 negative', category: 'self_sealing', milestone: 7,
      setup(kernel) { kernel.quickIngest('Anyone who disagrees with me is brainwashed. Evidence against my view only proves how brainwashed they are.', { mode: 'auto' }); },
      expect(state) { const gate = state.gateStates?.G6_non_self_sealing || {}; const asksFalsification = openQuestions(state).some((q) => /what evidence would count against/i.test(q.text)); return { passed: num(gate.score) < 0 && activeContradictions(state).length >= 1 && asksFalsification, checks: { g6_score: round(gate.score), g6_status: gate.status || null, active_contradictions: activeContradictions(state).length, asks_falsification: asksFalsification, root_y: round(rootY(state)) } }; },
      failure_pattern: 'Counterevidence gets treated as confirmation without penalty.'
    },
    {
      id: 'low_signal_quarantine', title: 'Low-signal input stays near null and becomes observation', category: 'low_signal_guard', milestone: 3,
      setup(kernel) { kernel.quickIngest('asdf qwer zzzz !!!!!', { mode: 'auto' }); },
      expect(state) { return { passed: state.observations.length >= 1 && state.claims.length === 0 && l1(state.octahedron?.point) === 0, checks: { observations: state.observations.length, claims: state.claims.length, root_l1: round(l1(state.octahedron?.point)), state_label: state.octahedron?.debug?.state || null } }; },
      failure_pattern: 'Gibberish or low-signal text becomes a serious belief.'
    },
    {
      id: 'candidate_principle_requires_testing', title: 'Candidate principle remains testable before promotion', category: 'principle_handling', milestone: 10,
      setup(kernel) { kernel.quickIngest('Criticism is epistemic pressure against a claim. Hostility is only one possible motive and needs separate evidence.', { mode: 'principle' }); },
      expect(state) { const principle = state.principles[0]; const hasQuestion = openQuestions(state).some((q) => /test|falsify/i.test(q.text)); return { passed: !!principle && principle.status === 'candidate' && hasQuestion, checks: { principle_status: principle?.status || null, testing_requirements: principle?.testing_requirements?.length || 0, open_questions: openQuestions(state).length } }; },
      failure_pattern: 'A philosophical principle gets promoted as truth without testing.'
    },
    {
      id: 'motive_claim_needs_separate_evidence', title: 'Motive language without evidence creates pressure', category: 'motive_calibration', milestone: 7,
      setup(kernel) { kernel.addClaim({ text: 'Alex lied because he wanted to hurt me.', subject: 'Alex', object: 'motive', scope: 'claim', confidence: 0.74 }); kernel.selfAudit(); },
      expect(state) { const hasMotiveQuestion = openQuestions(state).some((q) => /motive|benefit|pressure|disagreement/i.test(q.text)); const auditFlag = (state.currentAuditPreview?.findings || []).some((finding) => finding.type === 'motive_overclaim_risk'); const gate = state.gateStates?.G1_counter_consideration || {}; return { passed: hasMotiveQuestion && auditFlag && num(gate.score) < 0, checks: { has_motive_question: hasMotiveQuestion, audit_flag: auditFlag, g1_score: round(gate.score), open_questions: openQuestions(state).length } }; },
      failure_pattern: 'Motive is treated as fact without separate motive evidence.'
    },
    {
      id: 'dependency_propagation_attack_support', title: 'Dependency weakens when support claim weakens', category: 'dependency_propagation', milestone: 5,
      setup(kernel) { importPacket(kernel, { packet_type: 'epistemic_extraction_packet', claims: [ { client_id: 'c1', text: 'The receipt proves the package arrived Monday.', subject: 'receipt', object: 'package', scope: 'claim', confidence: 0.60 }, { client_id: 'c2', text: 'Therefore, Alex must have received the package before Tuesday.', subject: 'Alex', object: 'package', scope: 'claim', confidence: 0.62 } ], evidence: [], principles: [], dependencies: [ { dependent_client_id: 'c2', depends_on_client_id: 'c1', relation: 'depends_on', strength: 'strong' } ], questions: [], observations: [] }); kernel.addEvidence({ text: 'The receipt belongs to a different package.', relation: 'attacks', target_client_id: 'c1', strength: 'strong', confidence: 0.95 }); },
      expect(state) { const support = findClaim(state, 'c1'); const dependent = findClaim(state, 'c2'); return { passed: !!support && !!dependent && support.confidence < 0.35 && dependent.confidence < 0.55, checks: { support_confidence: round(support?.confidence), support_status: support?.status || null, dependent_confidence: round(dependent?.confidence), dependent_status: dependent?.status || null, dependencies: state.dependencies.length } }; },
      failure_pattern: 'The dependent conclusion stays strong after its support claim weakens.'
    },
    {
      id: 'structured_packet_language_equivalence', title: 'Equivalent structured packets produce equivalent state movement', category: 'meaning_packet_ingestion', milestone: 2,
      setup(kernel) { importPacket(kernel, { packet_type: 'epistemic_extraction_packet', claims: [ { client_id: 'c1', text: 'Saya menyerahkan formulir setelah tenggat waktu.', subject: 'user', object: 'form', scope: 'claim', confidence: 0.70 } ], evidence: [ { text: 'Timestamp menunjukkan pengiriman setelah deadline.', relation: 'supports', target_client_id: 'c1', strength: 'moderate', confidence: 0.85 } ], principles: [], dependencies: [], questions: ['Apakah user tahu deadline sebelumnya?'], observations: [] }); },
      expect(state) { const claim = findClaim(state, 'c1'); return { passed: !!claim && claim.confidence > 0.74 && state.evidence.length === 1 && openQuestions(state).length >= 1, checks: { claim_confidence: round(claim?.confidence), evidence_count: state.evidence.length, open_questions: openQuestions(state).length, surface_valid: allNodeSurfaceValid(state) } }; },
      failure_pattern: 'The kernel depends on English trigger words after a structured packet is supplied.'
    },
    {
      id: 'all_nodes_project_to_surface', title: 'All active graph nodes obey the octahedron surface rule', category: 'surface_projection', milestone: 1,
      setup(kernel) { importPacket(kernel, { packet_type: 'epistemic_extraction_packet', claims: [ { client_id: 'c1', text: 'Evidence should decide whether a claim survives pressure.', subject: 'worldview', object: 'belief_update', scope: 'worldview_fragment', confidence: 0.70 }, { client_id: 'c2', text: 'A mature decision should protect people while respecting practical constraints.', subject: 'worldview', object: 'decision_quality', scope: 'worldview_fragment', confidence: 0.66 } ], evidence: [ { text: 'A structured packet separates claim, evidence, principle, scope, and uncertainty.', relation: 'supports', target_client_id: 'c1', strength: 'moderate', confidence: 0.80 } ], principles: [ { text: 'A local belief should merge upward only after surviving relevant evidence and contradiction pressure.', scope: 'principle_candidate', confidence: 0.58, status: 'candidate', testing_requirements: ['Run contradiction and dependency benchmark cases before promotion.'] } ], dependencies: [], questions: [], observations: [] }); },
      expect(state) { const invalid = (state.beliefGraph?.nodes || []).filter((node) => !surfaceValid(node.octahedron?.point || { x: 0, y: 0, z: 0 })).map((node) => node.id); return { passed: (state.beliefGraph?.nodes || []).length > 1 && invalid.length === 0, checks: { nodes: state.beliefGraph?.nodes?.length || 0, invalid_nodes: invalid, root_l1: round(l1(state.octahedron?.point)) } }; },
      failure_pattern: 'A graph node fails the surface projection constraint.'
    },
    {
      id: 'unresolved_contradiction_should_not_look_like_peak', title: 'Unresolved contradiction should not look like peak maturity', category: 'peak_guard', milestone: 6,
      setup(kernel) { importPacket(kernel, { packet_type: 'epistemic_extraction_packet', claims: [ { client_id: 'c1', text: 'I submitted the form before the deadline.', subject: 'user', object: 'form', scope: 'claim', confidence: 0.72 }, { client_id: 'c2', text: 'I submitted it this morning, but the deadline was yesterday.', subject: 'user', object: 'form', scope: 'claim', confidence: 0.72 } ], evidence: [], principles: [], dependencies: [], questions: [], observations: [] }); },
      expect(state) { const contradictions = activeContradictions(state).length; const y = rootY(state); return { passed: contradictions > 0 && y < 0.55, checks: { active_contradictions: contradictions, root_y: round(y), open_questions: openQuestions(state).length, audit_flags: state.currentAuditPreview?.findings?.map((finding) => finding.type) || [] } }; },
      failure_pattern: 'The root point rises too high simply because contradiction was detected.'
    }
  ];

  function runCase(caseDef) {
    const kernel = new global.EpistemicKernel();
    let error = null;
    try { caseDef.setup(kernel); kernel.recalculate(); } catch (err) { error = err; }
    const state = kernel.snapshot();
    let expectation = { passed: false, checks: {} };
    if (!error) { try { expectation = caseDef.expect(state); } catch (err) { error = err; } }
    return { id: caseDef.id, title: caseDef.title, category: caseDef.category, milestone: caseDef.milestone, passed: !error && !!expectation.passed, checks: expectation.checks || {}, error: error ? error.message : null, failure_pattern: caseDef.failure_pattern, root_point: state.octahedron?.point || { x: 0, y: 0, z: 0 }, semantic: state.semantic, counts: { observations: state.observations?.length || 0, claims: state.claims?.length || 0, evidence: state.evidence?.length || 0, contradictions: activeContradictions(state).length, open_questions: openQuestions(state).length, principles: state.principles?.length || 0, dependencies: state.dependencies?.length || 0, graph_nodes: state.beliefGraph?.nodes?.length || 0 } };
  }

  function runBenchmark() {
    const results = CASES.map(runCase);
    const passed = results.filter((result) => result.passed).length;
    const failed = results.length - passed;
    const byMilestone = {};
    for (const result of results) { const key = `M${result.milestone}`; if (!byMilestone[key]) byMilestone[key] = { passed: 0, total: 0 }; byMilestone[key].total += 1; if (result.passed) byMilestone[key].passed += 1; }
    return { packet_type: '42ndMind_epistemic_pressure_benchmark_report', benchmark_version: '0.1', created_at: nowIso(), summary: { passed, failed, total: results.length, score: round(passed / Math.max(1, results.length), 4), by_milestone: byMilestone }, cases: results, next_actions: results.filter((result) => !result.passed).map((result) => ({ case_id: result.id, milestone: result.milestone, failure_pattern: result.failure_pattern, checks: result.checks })) };
  }

  function capSurfaceY(point, cap = 0.55) {
    const p = clone(point || { x: 0, y: 0, z: 0 });
    if (p.y <= cap || l1(p) === 0) return p;
    const oldHorizontal = Math.abs(num(p.x)) + Math.abs(num(p.z));
    const newHorizontal = Math.max(0, 1 - Math.abs(cap));
    if (oldHorizontal <= 1e-9) return { x: 0, y: cap, z: newHorizontal };
    return { x: Math.sign(num(p.x)) * newHorizontal * (Math.abs(num(p.x)) / oldHorizontal), y: cap, z: Math.sign(num(p.z)) * newHorizontal * (Math.abs(num(p.z)) / oldHorizontal) };
  }

  function sandboxRuleProposal(proposal = {}) {
    const id = proposal.id || proposal.rule_id || 'cap_unresolved_contradiction_y';
    const baseline = runBenchmark();
    const comparison = clone(baseline);
    const notes = [];
    if (id === 'cap_unresolved_contradiction_y') {
      const cap = num(proposal.cap || 0.55);
      comparison.rule_overlay = { id, description: 'If active contradictions remain unresolved, cap root y so detection cannot masquerade as mature integration.', cap };
      for (const result of comparison.cases) {
        if (result.counts.contradictions > 0) {
          const before = result.root_point;
          const after = capSurfaceY(before, cap);
          result.overlay = { before_root_point: before, after_root_point: after, before_l1: round(l1(before)), after_l1: round(l1(after)), adjusted: after.y !== before.y, surface_valid_after: surfaceValid(after) };
          if (after.y < before.y) notes.push(`${result.id}: y capped from ${round(before.y)} to ${round(after.y)}.`);
        }
      }
    } else if (id === 'require_falsification_for_principle_promotion') {
      comparison.rule_overlay = { id, description: 'A principle cannot leave candidate status unless it has testing requirements or surviving support traces.' };
      notes.push('This overlay is mostly already respected by current benchmark cases. Promotion mechanics still need a real principle lifecycle.');
    } else {
      comparison.rule_overlay = { id, description: 'Unknown proposal id. Baseline report returned without behavioral overlay.' };
    }
    return { packet_type: '42ndMind_rule_sandbox_report', sandbox_version: '0.1', created_at: nowIso(), proposal: comparison.rule_overlay, baseline_summary: baseline.summary, comparison_summary: comparison.summary, notes, comparison, promotion_gate: { status: 'candidate_requires_user_approval', requirements: [ 'The proposed rule must improve benchmark failures without breaking already-passing cases.', 'The rule must preserve the Epistemic Octahedron surface law.', 'The rule must not promote itself into core logic.', 'The user must approve promotion after reviewing comparison output.' ] } };
  }

  function createMemoryCompression(state) {
    const snapshot = clone(state || {});
    const activeClaims = (snapshot.claims || []).filter((claim) => claim.status !== 'active' || num(claim.confidence) < 0.45 || (claim.contradictions || []).length || (claim.evidence_against || []).length);
    const stableClaims = (snapshot.claims || []).filter((claim) => claim.status === 'active' && num(claim.confidence) >= 0.45 && !(claim.contradictions || []).length && !(claim.evidence_against || []).length);
    const activeQuestionIds = new Set(openQuestions(snapshot).map((question) => question.id));
    const activeContradictionIds = new Set(activeContradictions(snapshot).map((contradiction) => contradiction.id));
    const principleCandidates = (snapshot.principles || []).map((principle) => ({ id: principle.id, text: principle.text, status: principle.status, confidence: round(principle.confidence), testing_requirements: principle.testing_requirements || [], trace_ids: [ ...(principle.evidence_for || []), ...(principle.evidence_against || []), principle.id ].filter(Boolean) }));
    return { packet_type: '42ndMind_memory_compression_v0_1', created_at: nowIso(), rule: 'Compress resolved or stable traces, keep unresolved pressure in active workspace, and preserve IDs for traceability.', active_workspace: { unstable_claims: activeClaims.map((claim) => ({ id: claim.id, client_id: claim.client_id || null, text: claim.text, status: claim.status, confidence: round(claim.confidence), evidence_for: claim.evidence_for || [], evidence_against: claim.evidence_against || [], contradictions: claim.contradictions || [], live_hypotheses: claim.live_hypotheses || [] })), active_contradictions: activeContradictions(snapshot).map((contradiction) => clone(contradiction)), open_questions: openQuestions(snapshot).map((question) => clone(question)), principle_candidates: principleCandidates.filter((principle) => principle.status === 'candidate' || (principle.testing_requirements || []).length) }, archive_index: { stable_claims: stableClaims.map((claim) => ({ id: claim.id, client_id: claim.client_id || null, text: claim.text, confidence: round(claim.confidence), evidence_for: claim.evidence_for || [], trace_ids: [claim.id, ...(claim.evidence_for || [])] })), resolved_questions: (snapshot.questions || []).filter((question) => !activeQuestionIds.has(question.id)).map((question) => clone(question)), resolved_or_inactive_contradictions: (snapshot.contradictions || []).filter((contradiction) => !activeContradictionIds.has(contradiction.id)).map((contradiction) => clone(contradiction)), audits: (snapshot.audits || []).map((audit) => ({ id: audit.id, created_at: audit.created_at, findings: audit.findings || [] })), event_count: snapshot.eventLog?.length || 0 }, graph_summary: { root_id: snapshot.beliefGraph?.root_id || 'root_worldview', nodes: snapshot.beliefGraph?.nodes?.length || 0, links: snapshot.beliefGraph?.links?.length || 0, root_point: snapshot.octahedron?.point || { x: 0, y: 0, z: 0 }, root_surface_l1: round(l1(snapshot.octahedron?.point)) }, traceability_check: { active_question_ids: Array.from(activeQuestionIds), active_contradiction_ids: Array.from(activeContradictionIds), stable_claim_ids: stableClaims.map((claim) => claim.id), unstable_claim_ids: activeClaims.map((claim) => claim.id) } };
  }

  function milestoneStatus(state = {}, benchmarkReport = null) {
    const report = benchmarkReport || runBenchmark();
    const passedMilestones = new Set();
    const failedMilestones = new Set();
    for (const result of report.cases || []) { if (result.passed) passedMilestones.add(result.milestone); else failedMilestones.add(result.milestone); }
    function statusFor(milestone, label, evidence) { let status = 'not_started'; if (passedMilestones.has(milestone) && !failedMilestones.has(milestone)) status = 'passing_benchmark_slice'; else if (passedMilestones.has(milestone) && failedMilestones.has(milestone)) status = 'partial'; else if (evidence && evidence.length) status = 'partial'; return { milestone, label, status, evidence: evidence || [] }; }
    return { packet_type: '42ndMind_goal_milestone_status', created_at: nowIso(), benchmark_score: report.summary?.score ?? null, milestones: [ statusFor(0, 'Current skeleton', ['browser kernel, claims, evidence, gates, projection, graph']), statusFor(1, 'Make the graph first-class', ['beliefGraph nodes expose local octahedron states']), statusFor(2, 'Meaning-packet ingestion', ['structured extraction packet import exists']), statusFor(3, 'Nonsense and low-signal guard', ['low-signal benchmark case']), statusFor(4, 'Evidence-grounded belief update', ['timeline and motive benchmark cases']), statusFor(5, 'Dependency propagation', ['dependency propagation benchmark case']), statusFor(6, 'Scope and merge rules', ['scope weights exist, stricter merge rules still need promotion']), statusFor(7, 'Self-audit', ['selfAudit and previewAudit exist']), statusFor(8, 'Sandboxed self-improvement', ['sandboxRuleProposal exists as overlay runner']), statusFor(9, 'Memory compression and active workspace', ['createMemoryCompression exists']), statusFor(10, 'Philosophical text ingestion', ['principle candidate benchmark exists']), statusFor(11, 'Epistemic Pressure Benchmark v0.1', ['this benchmark file defines fixed cases']), statusFor(12, 'Compare against ordinary LLM behavior', []), statusFor(13, 'Dossier integration', []), statusFor(14, 'LLM interface layer', ['llm-brain command packet loop exists']), statusFor(15, 'Live self-improving epistemic system', []) ], current_state_counts: { claims: state.claims?.length || 0, evidence: state.evidence?.length || 0, contradictions: activeContradictions(state).length, open_questions: openQuestions(state).length, principles: state.principles?.length || 0, graph_nodes: state.beliefGraph?.nodes?.length || 0 } };
  }

  global.EpistemicBenchmark = { CASES, runCase, runBenchmark, sandboxRuleProposal, createMemoryCompression, milestoneStatus, utils: { l1, surfaceValid, activeContradictions, openQuestions, findClaim, capSurfaceY } };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.EpistemicBenchmark;
})(typeof window !== 'undefined' ? window : globalThis);
