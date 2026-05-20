/* 42ndMind Kernel Brain v0.4
 *
 * Kernel-owned brain surface.
 *
 * v0.4.2 changes the meaning of this file: it is no longer just a coordinator
 * around external globals. It owns a compact internal brain state and tick loop.
 * Adapters may still contribute external reports, but they do not own meaning,
 * relations, pressure, admission, belief, or truth movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.2';
  const DECISIONS = Object.freeze({
    NEAR_NULL: 'NEAR_NULL',
    CLARIFY: 'CLARIFY',
    BLOCK: 'BLOCK',
    HOLD: 'HOLD_AS_CANDIDATE',
    CAP: 'CAP_MATURITY',
    ALLOW: 'ALLOW_PRESSURE',
    SAFE_IMPORT: 'SAFE_TO_IMPORT',
    CAUTION_IMPORT: 'IMPORT_WITH_CAUTION'
  });

  const TYPO_MAP = Object.freeze({ teh:'the', opne:'open', isnt:"isn't", cant:"can't", dont:"don't", becuase:'because', definately:'definitely', recieve:'receive' });
  const STOPWORDS = new Set('a an the and or but if then this that these those is are was were be been being to of in on for from with without into by as at it its i you he she they we them us our your his her their not no yes do does did can could should would must may might just only'.split(/\s+/));

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'brain'; }
  function unique(values) { return Array.from(new Set(asArray(values).map(text).filter(Boolean))); }
  function stableStringify(value) { if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']'; if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}'; return JSON.stringify(value); }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

  function sourceIds(item) {
    const links = item && item.links || {};
    const meta = item && item.meta || {};
    return asArray(item && item.source_ids)
      .concat(asArray(links.source_ids))
      .concat(asArray(meta.source_ids))
      .concat(asArray(item && item.sources))
      .map(text).filter(Boolean);
  }

  function parseJson(raw) {
    try { return { ok:true, value:JSON.parse(raw), error:'' }; }
    catch (error) { return { ok:false, value:null, error:error.message }; }
  }

  function isCommandObject(value) {
    return !!(value && typeof value === 'object' && (value.command_type === 'epistemic_kernel_command' || Array.isArray(value.commands)));
  }

  function mapGovernorDecision(decision) {
    if (decision === 'BLOCK_MOVEMENT') return DECISIONS.BLOCK;
    if (decision === 'CAP_MATURITY') return DECISIONS.CAP;
    if (decision === 'HOLD_AS_CANDIDATE') return DECISIONS.HOLD;
    if (decision === 'ALLOW_PRESSURE') return DECISIONS.ALLOW;
    return DECISIONS.HOLD;
  }

  function mapSensemakingDecision(report) {
    if (!report) return DECISIONS.HOLD;
    if (report.decision === 'QUARANTINE_NEAR_NULL') return DECISIONS.NEAR_NULL;
    if (report.decision === 'ASK_CLARIFICATION') return DECISIONS.CLARIFY;
    if (report.decision === 'BLOCK_MOVEMENT') return DECISIONS.BLOCK;
    if (report.decision === 'SEND_TO_GOVERNOR') return mapGovernorDecision(report.governor_report && report.governor_report.decision);
    return DECISIONS.HOLD;
  }

  function mapPreflightDecision(report) {
    if (!report) return DECISIONS.HOLD;
    if (report.decision === 'BLOCK_IMPORT') return DECISIONS.BLOCK;
    if (report.decision === 'IMPORT_WITH_CAUTION') return DECISIONS.CAUTION_IMPORT;
    if (report.decision === 'SAFE_TO_IMPORT') return DECISIONS.SAFE_IMPORT;
    return DECISIONS.HOLD;
  }

  function canMove(decision) {
    return decision === DECISIONS.ALLOW || decision === DECISIONS.SAFE_IMPORT || decision === DECISIONS.CAUTION_IMPORT || decision === DECISIONS.CAP || decision === DECISIONS.HOLD;
  }

  function adapterStatus() {
    return {
      sensemaking: !!(global.KernelSensemakingV01 && typeof global.KernelSensemakingV01.analyze === 'function'),
      governor: !!(global.KernelEpistemicGovernorV01 && typeof global.KernelEpistemicGovernorV01.assess === 'function'),
      preflight: !!(global.KernelCommandPreflightV01 && typeof global.KernelCommandPreflightV01.analyze === 'function'),
      consistency: !!(global.KernelConsistencyV04 && typeof global.KernelConsistencyV04.analyze === 'function'),
      probability: !!(global.KernelProbabilityV04 && typeof global.KernelProbabilityV04.analyze === 'function')
    };
  }

  function doctrine() {
    return {
      one_brain: true,
      kernel_brain_owns_internal_state: true,
      modules_are_views_not_thought_sources: true,
      adapters_are_optional_external_reports: true,
      receptors_are_internal_tables_not_external_registries: true,
      one_final_decision_surface: true,
      meaning_claim_relation_pressure_admission_live_inside_brain: true,
      meaning_must_be_earned_before_belief_movement: true,
      consistency_may_inform_but_not_own_truth: true,
      probability_is_belief_pressure_not_truth: true,
      gibberish_stays_near_null: true,
      ambiguity_requests_clarification_not_belief: true,
      rule_smuggling_cannot_move_belief: true,
      no_auto_rule_promotion: true,
      no_belief_movement_inside_v0_4_brain: true,
      no_final_truth_promotion: true,
      no_silent_canonical_mutation: true,
      belief_movement: 'none'
    };
  }

  function internalReceptors() {
    return [
      'raw_event_receptor','coverage_receptor','claim_receptor','source_anchor_receptor','evidence_description_receptor','media_description_receptor','quote_context_receptor','adversarial_reframe_receptor','relation_receptor','truth_pressure_receptor','admission_receptor','rollback_receptor'
    ].map(id => ({ id, status:'owned_inside_kernel_brain_v0_4', external:false }));
  }

  function createState(seed = {}) {
    return {
      state_type: 'kernel_brain_v0_4_owned_state',
      version: VERSION,
      created_at: now(),
      updated_at: now(),
      doctrine: doctrine(),
      tick: 0,
      receptors: internalReceptors(),
      runtimeEvents: [],
      interpretations: [],
      meaningNodes: [],
      claimNodes: [],
      evidenceNodes: [],
      relationEdges: [],
      pressureState: { support:0, counter:0, contradiction:0, adversarial:0, unresolved:0, belief:0, source:0, evidence:0, media:0, causal:0 },
      admissionProposals: [],
      beliefCommitments: [],
      externalReports: [],
      graph: { nodes:[], links:[] },
      eventIndex: {},
      stats: { events:0, meanings:0, claims:0, evidence:0, relations:0, interpretations:0, admissions:0, beliefs:0 },
      last_tick_summary: null,
      ...clone(seed)
    };
  }

  function tokenize(raw) {
    return text(raw).split(/\s+/).map((token, index) => ({ token_id:`tok_${String(index + 1).padStart(2, '0')}`, original:token, normalized:lower(token).replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, ''), index })).filter(t => t.original || t.normalized);
  }

  function signals(rawInput) {
    const raw = lower(rawInput);
    return {
      near_null: !raw || (/^[^a-z0-9]+$/i.test(raw)) || (raw.length < 4),
      claim: /\b(claim|prove|proves|is|are|was|were|should|must|says|shows|because|means)\b/.test(raw),
      belief_pressure: /\b(i am sure|i know|definitely|obviously|proves|no doubt|certain|certainty)\b/.test(raw),
      source: /\b(source|reports|reference|according to|cites|citation)\b/.test(raw),
      evidence: /\b(evidence|log|record|receipt|timestamp|data|test|benchmark|indicates|measured)\b/.test(raw),
      media: /\b(screenshot|video|image|photo|clip|shows|recording)\b/.test(raw),
      quote: /\b(quote|fragment)\b|"/.test(raw),
      reframe: /\b(reframe|turns it into|all must|all should|everyone|no good interpretation)\b/.test(raw),
      relation: /\b(because|caused|causal|therefore|so that|leads to|bottleneck|depends on)\b/.test(raw),
      contradiction: /\b(actually|but|however|contradiction|inconsistent|conflicts)\b/.test(raw),
      idiom: /\b(up in the air|bottleneck|red flag|smoking gun)\b/.test(raw),
      typo: Object.keys(TYPO_MAP).some(k => new RegExp(`\\b${k}\\b`).test(raw)),
      unknown: /\b(zorp|flindle)\b/.test(raw)
    };
  }

  function tokenKind(token) {
    const norm = token.normalized;
    if (!norm) return 'empty';
    if (TYPO_MAP[norm]) return 'typo_variant_candidate';
    if (STOPWORDS.has(norm)) return 'function_word';
    if (/^\d+$/.test(norm)) return 'number';
    if (/^(zorp|flindle)$/i.test(norm)) return 'unknown_meaning_candidate';
    return 'meaning_token_candidate';
  }

  function pressureFromSignals(s) {
    return {
      support: s.evidence ? 0.35 : 0,
      counter: 0,
      contradiction: s.contradiction ? 0.45 : 0,
      adversarial: s.reframe ? 0.55 : 0,
      unresolved: (s.typo || s.unknown || s.idiom || s.quote || s.near_null) ? 0.65 : 0.2,
      belief: s.belief_pressure ? 0.6 : 0,
      source: s.source ? 0.35 : 0,
      evidence: s.evidence ? 0.45 : 0,
      media: s.media ? 0.45 : 0,
      causal: s.relation ? 0.45 : 0
    };
  }

  function mergePressure(a, b) {
    const out = { ...a };
    Object.keys(b || {}).forEach(key => { out[key] = Math.min(1, Math.max(Number(out[key] || 0), Number(b[key] || 0))); });
    return out;
  }

  function upsertById(list, row) {
    const index = list.findIndex(item => item.id === row.id);
    if (index >= 0) { list[index] = { ...list[index], ...row, updated_at:now(), seen_count:Number(list[index].seen_count || 1) + 1 }; return list[index]; }
    list.push(row);
    return row;
  }

  function interpretations(raw, s) {
    const rows = [];
    const add = (family, note) => rows.push({ family, note, status:'candidate_interpretation_not_truth', exact_meaning_claimed:false, belief_movement:'none' });
    if (s.near_null) add('near_null_or_low_signal', 'near-null input is held without meaning inflation');
    if (s.claim) add('claim_candidate', 'raw text may contain a claim candidate, not truth');
    if (s.belief_pressure) add('belief_pressure', 'confidence/proof language is pressure, not evidence');
    if (s.source) add('source_anchor', 'source wording is anchor candidate, not lookup');
    if (s.evidence) add('evidence_description', 'evidence wording is description, not verification');
    if (s.media) add('media_description', 'media wording is description, not verification');
    if (s.quote) add('quote_fragment', 'quote wording may be fragmentary and context-dependent');
    if (s.reframe) add('adversarial_reframe', 'scope-changing reframe is pressure, not same claim');
    if (s.relation) add('relation_candidate', 'relation or causal language needs bridge before truth');
    if (s.idiom) add('idiom_or_metaphor_candidate', 'figurative language requires context');
    if (s.typo) add('typo_variant_candidate', 'typo repair candidates are not certainty');
    if (s.unknown) add('unknown_meaning_candidate', 'unknown terms route to admission candidates, not fake meaning');
    if (!rows.length) add('raw_context_candidate', 'raw text enters as context candidate');
    return rows;
  }

  function packets(raw, s) {
    const rows = [];
    const add = (type, note) => rows.push({ type, note, raw_text_snapshot:text(raw), status:'candidate_packet_not_truth', belief_movement:'none' });
    if (s.claim) add('claim_candidate', 'raw claim candidate');
    if (s.source) add('source_reference', 'source anchor candidate');
    if (s.evidence) add('evidence_description', 'evidence description candidate');
    if (s.media) add('media_description', 'media description candidate');
    if (s.quote) add('quote_fragment', 'quote fragment candidate');
    if (s.reframe) add('adversarial_reframe', 'adversarial reframe candidate');
    if (s.relation) add('relation_candidate', 'relation candidate');
    if (s.unknown || s.typo || s.idiom || s.near_null) add('coverage_hold', 'coverage hold for low-signal/typo/unknown/idiom candidate');
    return rows;
  }

  function relationEdges(eventId, s) {
    const out = [];
    const add = (family, status) => out.push({ id:`edge_${safeId(eventId)}_${safeId(family)}`, from:eventId, to:'kernel_brain_root', relation_family:family, status, truth_status:'not_adjudicated', promotion_status:'not_promoted', belief_movement:'none', created_at:now() });
    if (s.source) add('source_reports', 'source_anchor_not_lookup');
    if (s.evidence) add('supports', 'support_pressure_not_truth');
    if (s.media) add('media_describes', 'media_description_not_verification');
    if (s.reframe) add('injects_or_broadens_scope', 'hostile_reframe_pressure_not_same_claim');
    if (s.relation) add('causes_or_contributes_to', 'causal_candidate_requires_bridge');
    if (s.contradiction) add('contradicts_or_counters', 'contradiction_detection_not_resolution');
    return out;
  }

  function unresolved(s) {
    const items = ['candidate_interpretation_is_not_truth','belief_movement:none'];
    if (s.near_null) items.push('near_null_input_no_meaning_inflation');
    if (s.claim) items.push('claim_candidate_is_not_truth');
    if (s.belief_pressure) items.push('belief_statement_is_pressure_not_truth');
    if (s.source) items.push('source_reference_is_anchor_not_lookup');
    if (s.evidence) items.push('evidence_description_not_verified_evidence');
    if (s.media) items.push('media_description_not_verified_media');
    if (s.quote) items.push('quote_fragment_context_required');
    if (s.reframe) items.push('hostile_reframe_is_pressure_not_same_claim');
    if (s.relation) items.push('causal_bridge_required_before_causal_truth');
    if (s.idiom) items.push('idiom_or_metaphor_requires_context');
    if (s.typo) items.push('typo_repair_is_candidate_not_certainty');
    if (s.unknown) items.push('unknown_meaning_requires_admission_no_fake_meaning');
    return unique(items);
  }

  function ingest(state, rawInput, meta = {}) {
    const raw = text(rawInput);
    const s = signals(raw);
    const eventPayload = { raw, meta, s };
    const id = `brain_event_${safeId(meta.kind || 'raw')}_${tinyHash(stableStringify(eventPayload)).slice(0, 10)}`;
    if (state.eventIndex[id]) return state.runtimeEvents.find(e => e.id === id);

    const tokens = tokenize(raw);
    const meaningIds = [];
    tokens.forEach(token => {
      const kind = tokenKind(token);
      if (kind === 'empty' || kind === 'function_word') return;
      const nodeId = `meaning_${safeId(token.normalized)}`;
      const existing = state.meaningNodes.find(n => n.id === nodeId);
      upsertById(state.meaningNodes, { id:nodeId, label:token.normalized, kind, source_event_ids:unique([...(existing?.source_event_ids || []), id]), candidate_status:kind.includes('candidate') ? 'candidate_not_canonical' : 'known_surface_token', exact_meaning_claimed:false, canonical_mutation_performed:false, belief_movement:'none', created_at:existing?.created_at || now() });
      meaningIds.push(nodeId);
    });

    const eventInterpretations = interpretations(raw, s).map((row, index) => ({ ...row, id:`${id}_interp_${String(index + 1).padStart(2, '0')}`, source_event_id:id }));
    const candidatePackets = packets(raw, s).map((row, index) => ({ ...row, id:`${id}_packet_${String(index + 1).padStart(2, '0')}`, source_event_id:id }));
    const candidateEdges = relationEdges(id, s);
    const pressure = pressureFromSignals(s);
    const event = { id, kind:meta.kind || 'raw_language', at:now(), raw_text:raw, input_kind:meta.input_kind || 'raw_language', meta_snapshot:clone(meta), tokens, signals:s, meaning_node_ids:unique(meaningIds), interpretations:eventInterpretations, candidate_packets:candidatePackets, candidate_relation_edges:candidateEdges, unresolved_items:unresolved(s), pressure, status:'kernel_brain_owned_candidate_event_not_truth', truth_status:'not_adjudicated', promotion_status:'not_promoted', belief_movement:'none' };

    state.runtimeEvents.push(event);
    state.interpretations.push(...eventInterpretations);
    candidateEdges.forEach(edge => upsertById(state.relationEdges, edge));
    if (s.claim) upsertById(state.claimNodes, { id:`claim_${safeId(id)}`, source_event_id:id, text:raw, status:'candidate_claim_not_truth', truth_status:'not_adjudicated', promotion_status:'not_promoted', belief_movement:'none', created_at:now() });
    if (s.evidence || s.media || s.source) upsertById(state.evidenceNodes, { id:`evidence_${safeId(id)}`, source_event_id:id, text:raw, status:'candidate_evidence_or_anchor_not_verification', truth_status:'not_adjudicated', promotion_status:'not_promoted', belief_movement:'none', created_at:now() });

    state.eventIndex[id] = true;
    state.pressureState = mergePressure(state.pressureState, pressure);
    proposeAdmissions(state);
    tick(state, 'ingest');
    return event;
  }

  function addAdmission(state, row) {
    return upsertById(state.admissionProposals, { ...row, admission_status:'candidate_not_doctrine', status:'candidate_admission_not_canonical', canonical_mutation_performed:false, exact_meaning_claimed:false, growth_mode:'subdivision_not_mass_inflation', truth_status:'not_adjudicated', promotion_status:'not_promoted', belief_movement:'none', rollback_available:true, created_at:row.created_at || now() });
  }

  function proposeAdmissions(state) {
    const events = state.runtimeEvents;
    const unknowns = state.meaningNodes.filter(n => n.kind === 'unknown_meaning_candidate');
    const typos = state.meaningNodes.filter(n => n.kind === 'typo_variant_candidate');
    if (unknowns.length) addAdmission(state, { id:'brain_admission_unknown_meaning_001', proposal_family:'unknown_meaning_admission', source_node_ids:unknowns.map(n => n.id), produced_subdivision_candidates:['unknown_term_candidate','context_requirement_candidate','domain_specific_meaning_candidate'] });
    if (typos.length) addAdmission(state, { id:'brain_admission_typo_variant_001', proposal_family:'typo_variant_subdivision', source_node_ids:typos.map(n => n.id), produced_subdivision_candidates:['orthographic_variant_candidate','repair_candidate','repair_confidence_candidate'] });
    if (events.some(e => e.signals?.source || e.signals?.evidence || e.signals?.media)) addAdmission(state, { id:'brain_admission_source_evidence_media_001', proposal_family:'source_evidence_media_separation', produced_subdivision_candidates:['source_anchor_candidate','evidence_description_candidate','media_description_candidate','verification_requirement_candidate'] });
    if (events.some(e => e.signals?.quote || e.signals?.reframe)) addAdmission(state, { id:'brain_admission_quote_reframe_scope_001', proposal_family:'quote_reframe_scope_subdivision', produced_subdivision_candidates:['quote_fragment_candidate','context_completion_requirement_candidate','scope_shift_candidate'] });
    if (events.some(e => e.signals?.relation)) addAdmission(state, { id:'brain_admission_causal_bridge_001', proposal_family:'causal_bridge_relation_subdivision', produced_subdivision_candidates:['temporal_sequence_candidate','causal_claim_candidate','bridge_requirement_candidate','mechanism_requirement_candidate'] });
    if (events.some(e => e.signals?.claim)) addAdmission(state, { id:'brain_admission_claim_scope_001', proposal_family:'claim_scope_subdivision', produced_subdivision_candidates:['claim_candidate','scope_candidate','quantifier_candidate','condition_candidate'] });
    return state.admissionProposals;
  }

  function tick(state, reason = 'manual') {
    state.tick += 1;
    state.updated_at = now();
    state.graph = buildGraph(state);
    state.stats = { events:state.runtimeEvents.length, meanings:state.meaningNodes.length, claims:state.claimNodes.length, evidence:state.evidenceNodes.length, relations:state.relationEdges.length, interpretations:state.interpretations.length, admissions:state.admissionProposals.length, beliefs:state.beliefCommitments.length };
    state.last_tick_summary = { tick:state.tick, reason, at:now(), stats:clone(state.stats), pressureState:clone(state.pressureState), belief_movement:'none', final_truth_promotion:false };
    return state.last_tick_summary;
  }

  function buildGraph(state) {
    const nodes = [{ id:'kernel_brain_root', type:'brain', label:'KernelBrainV04 owned brain', status:'owned' }];
    const links = [];
    state.meaningNodes.slice(-120).forEach(n => { nodes.push({ id:n.id, type:n.kind, label:n.label, status:n.candidate_status }); links.push({ from:'kernel_brain_root', to:n.id, relation:'owns_meaning' }); });
    state.claimNodes.slice(-120).forEach(n => { nodes.push({ id:n.id, type:'claim', label:n.text, status:n.status }); links.push({ from:'kernel_brain_root', to:n.id, relation:'owns_claim' }); });
    state.evidenceNodes.slice(-120).forEach(n => { nodes.push({ id:n.id, type:'evidence_or_anchor', label:n.text, status:n.status }); links.push({ from:'kernel_brain_root', to:n.id, relation:'owns_evidence_or_anchor' }); });
    state.admissionProposals.slice(-80).forEach(n => { nodes.push({ id:n.id, type:'admission_proposal', label:n.proposal_family, status:n.status }); links.push({ from:'kernel_brain_root', to:n.id, relation:'owns_admission' }); });
    state.relationEdges.slice(-180).forEach(edge => links.push({ from:edge.from, to:edge.to, relation:edge.relation_family, status:edge.status }));
    return { nodes, links };
  }

  function createBrain(seed = {}) {
    const state = createState(seed);
    return {
      state,
      ingest(input, meta = {}) { return ingest(state, input, meta); },
      proposeAdmissions() { return proposeAdmissions(state); },
      tick(reason = 'manual') { return tick(state, reason); },
      snapshot() { tick(state, 'snapshot'); return clone(state); },
      process(input, options = {}) { return process(input, { ...options, brain:this }); }
    };
  }

  function commandPacketRows(command) {
    return asArray(command && command.commands).map((cmd, index) => ({ cmd, index, packet:(cmd && (cmd.packet || cmd.extraction_packet)) || {} })).filter(row => row.cmd && row.cmd.op === 'import_packet');
  }
  function itemFromClaim(claim, packet, index) {
    const meta = packet && packet.meta || {}; const links = claim && claim.links || {};
    return { id:text(claim && (claim.client_id || claim.id)) || `claim_${index}`, text:text(claim && claim.text), confidence:Number.isFinite(Number(claim && claim.confidence)) ? Number(claim.confidence) : null, source_ids:sourceIds(claim).concat(sourceIds(meta)).concat(sourceIds(links)), support_status:text(links.support_status || claim && claim.support_status || meta.support_status || '') };
  }
  function itemFromEvidence(evidence, packet, index) {
    const meta = packet && packet.meta || {}; const links = evidence && evidence.links || {};
    return { id:text(evidence && (evidence.client_id || evidence.id)) || `evidence_${index}`, text:text(evidence && evidence.text), confidence:Number.isFinite(Number(evidence && evidence.confidence)) ? Number(evidence.confidence) : null, source_ids:sourceIds(evidence).concat(sourceIds(meta)).concat(sourceIds(links)), support_status:text(links.support_status || evidence && evidence.support_status || meta.support_status || '') };
  }

  function collectEpistemicItems(report, parsedCommand) {
    const items = [];
    const pressure = { questions:[], attacks:[] };
    const candidate = report && report.sensemaking_report && report.sensemaking_report.governor_candidate;
    if (candidate && candidate.text) {
      items.push({ id:'sensemaking_candidate', text:text(candidate.text), confidence:Number.isFinite(Number(candidate.confidence)) ? Number(candidate.confidence) : null, source_ids:sourceIds(candidate), support_status:text(candidate.support_status || '') });
      pressure.questions = pressure.questions.concat(asArray(candidate.questions));
      pressure.attacks = pressure.attacks.concat(asArray(candidate.attacks));
    }
    if (parsedCommand) {
      commandPacketRows(parsedCommand).forEach(row => {
        asArray(row.packet.claims).forEach((claim, index) => { const item = itemFromClaim(claim, row.packet, index); if (item.text) items.push(item); });
        asArray(row.packet.evidence).forEach((evidence, index) => { const item = itemFromEvidence(evidence, row.packet, index); if (item.text) items.push(item); });
        pressure.questions = pressure.questions.concat(asArray(row.packet.questions).map(q => text(q && (q.text || q))).filter(Boolean));
        pressure.attacks = pressure.attacks.concat(asArray(row.packet.evidence).filter(e => text(e && e.relation) === 'attacks').map(e => text(e.text)).filter(Boolean));
      });
    }
    return { items, questions:pressure.questions.filter(Boolean), attacks:pressure.attacks.filter(Boolean) };
  }

  function attachConsistencyAndProbability(report, parsedCommand) {
    const status = report.adapter_status || adapterStatus();
    const collected = collectEpistemicItems(report, parsedCommand);
    report.epistemic_items = collected.items;
    report.consistency_report = null;
    report.probability_report = null;
    if (!collected.items.length) return report;
    if (status.consistency) report.consistency_report = global.KernelConsistencyV04.analyze(collected.items);
    if (status.probability) report.probability_report = global.KernelProbabilityV04.analyze({ items:collected.items, questions:collected.questions, attacks:collected.attacks, consistency_report:report.consistency_report });
    return report;
  }

  function process(input, options = {}) {
    const raw = typeof input === 'string' ? input : JSON.stringify(input ?? '');
    const parsed = parseJson(raw);
    const status = adapterStatus();
    const isCommand = parsed.ok && isCommandObject(parsed.value);
    const brain = options.brain && options.brain.state ? options.brain : createBrain();
    const brainEvent = brain.ingest(raw, { source:'KernelBrainV04.process', input_kind:isCommand ? 'epistemic_kernel_command' : parsed.ok ? 'json_or_structured_text' : 'raw_language', kind:isCommand ? 'command_input' : 'process_input' });

    const report = {
      packet_type: '42ndMind_kernel_brain_v0_4_report',
      packet_version: VERSION,
      created_at: now(),
      input_preview: text(raw).slice(0, 220),
      input_kind: isCommand ? 'epistemic_kernel_command' : parsed.ok ? 'json_or_structured_text' : 'raw_language',
      final_decision: DECISIONS.HOLD,
      final_reason: 'KernelBrainV04 internal brain state accepted input as candidate pressure.',
      allowed_for_belief_pressure: false,
      belief_movement: 'none',
      near_null: brainEvent.signals.near_null === true,
      sanitized_command: null,
      sensemaking_report: null,
      governor_report: null,
      preflight_report: null,
      consistency_report: null,
      probability_report: null,
      epistemic_items: [],
      adapter_status: status,
      adapters_are_optional: true,
      internal_brain_event: brainEvent,
      internal_brain_state_summary: {
        owned_state: true,
        tick: brain.state.tick,
        stats: clone(brain.state.stats),
        pressureState: clone(brain.state.pressureState),
        admissions: brain.state.admissionProposals.length,
        beliefs: brain.state.beliefCommitments.length
      },
      doctrine: doctrine()
    };

    if (brainEvent.signals.near_null) {
      report.final_decision = DECISIONS.NEAR_NULL;
      report.final_reason = 'Internal brain classified input as near-null/low-signal; no meaning inflation.';
    }

    if (status.sensemaking) {
      report.sensemaking_report = global.KernelSensemakingV01.analyze(raw, options);
      const adapterDecision = mapSensemakingDecision(report.sensemaking_report);
      if (adapterDecision === DECISIONS.BLOCK || adapterDecision === DECISIONS.CLARIFY || adapterDecision === DECISIONS.CAP) {
        report.final_decision = adapterDecision;
        report.final_reason = report.sensemaking_report ? report.sensemaking_report.reason : report.final_reason;
      }
      report.governor_report = report.sensemaking_report && report.sensemaking_report.governor_report ? report.sensemaking_report.governor_report : null;
    }

    if (isCommand && status.preflight) {
      report.preflight_report = global.KernelCommandPreflightV01.analyze(raw, options);
      const preflightDecision = mapPreflightDecision(report.preflight_report);
      if (preflightDecision === DECISIONS.BLOCK || preflightDecision === DECISIONS.CAUTION_IMPORT || preflightDecision === DECISIONS.SAFE_IMPORT) report.final_decision = preflightDecision;
      report.sanitized_command = report.preflight_report && report.preflight_report.sanitized_command ? report.preflight_report.sanitized_command : null;
      report.final_reason = report.preflight_report && report.preflight_report.import_allowed ? 'Structured command passed internal brain path and optional preflight.' : 'Structured command held or blocked by internal/preflight path.';
    }

    report.allowed_for_belief_pressure = canMove(report.final_decision) && report.final_decision !== DECISIONS.SAFE_IMPORT && report.final_decision !== DECISIONS.CAUTION_IMPORT;
    report.belief_movement = 'none';
    report.runtime_note = 'KernelBrainV04 owns internal candidate state; adapters can inform reports but do not own thought or belief movement.';
    return attachConsistencyAndProbability(report, isCommand ? parsed.value : null);
  }

  function sampleInput(kind) {
    if (global.KernelSensemakingV01 && typeof global.KernelSensemakingV01.sampleInput === 'function') {
      if (['gibberish','ambiguous','claim','self_sealing','rule_smuggling','question','command'].includes(kind)) return global.KernelSensemakingV01.sampleInput(kind);
    }
    if (kind === 'reviewed_command' && global.KernelCommandPreflightV01 && typeof global.KernelCommandPreflightV01.sampleSafeCautionCommand === 'function') return JSON.stringify(global.KernelCommandPreflightV01.sampleSafeCautionCommand(), null, 2);
    if (kind === 'messy') return 'teh source says the valve isnt opne because pressure rose, and I am sure it proves the claim';
    return 'The source document supports the bounded claim, but motive remains unresolved.';
  }

  global.KernelBrainV04 = Object.freeze({
    VERSION,
    DECISIONS,
    createState,
    createBrain,
    ingest,
    tick,
    doctrine,
    process,
    adapterStatus,
    sampleInput,
    collectEpistemicItems
  });
})(typeof window !== 'undefined' ? window : globalThis);
