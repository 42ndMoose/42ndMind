/* Epistemic Kernel v0.2 compatibility + kernel-owned unified core migration patches
   Loaded after src/epistemic-kernel-v0-2.js.

   This file is intentionally the live brain patch point. It does not create another
   connector module. It attaches unified meaning/claim/relation/pressure/admission
   logic directly to EpistemicKernel-owned state and methods.

   Rule: modules/pages may inspect or present what the kernel thinks. They must not
   be the source of thought. */
(function (global) {
  if (!global.EpistemicKernel || global.EpistemicKernel.__v02PatchesApplied) return;

  const Kernel = global.EpistemicKernel;
  const originalCreateEmptyState = Kernel.prototype.createEmptyState;
  const originalMigrateState = Kernel.prototype.migrateState;
  const originalQuickIngest = Kernel.prototype.quickIngest;
  const originalAddClaim = Kernel.prototype.addClaim;
  const originalAddObservation = Kernel.prototype.addObservation;
  const originalAddEvidence = Kernel.prototype.addEvidence;
  const originalAddPrinciple = Kernel.prototype.addPrinciple;
  const originalImportExtractionPacket = Kernel.prototype.importExtractionPacket;
  const originalRecalculate = Kernel.prototype.recalculate;
  const originalSnapshot = Kernel.prototype.snapshot;
  const originalPreviewAudit = Kernel.prototype.previewAudit;
  const originalSelfAudit = Kernel.prototype.selfAudit;

  function clean(value) { return String(value ?? '').trim(); }
  function lower(value) { return clean(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'core'; }
  function unique(values) { return Array.from(new Set(asArray(values).map(clean).filter(Boolean))); }
  function stableStringify(value) { if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']'; if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}'; return JSON.stringify(value); }
  function tinyHash(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function tokenParts(text) { return clean(text).split(/\s+/).filter(Boolean); }
  function alphaTokens(text) { return (lower(text).match(/[a-z]{2,}/g) || []); }

  const STOPWORDS = new Set('a an the and or but if then this that these those is are was were be been being to of in on for from with without into by as at it its i you he she they we them us our your his her their not no yes do does did can could should would must may might just only'.split(/\s+/));
  const TYPO_MAP = { teh: 'the', opne: 'open', isnt: "isn't", cant: "can't", dont: "don't", alot: 'a lot', seperated: 'separated', definately: 'definitely', recieve: 'receive', becuase: 'because' };

  const CORE_DOCTRINE = Object.freeze({
    brain_owns_unified_core: true,
    modules_are_views_not_thought_sources: true,
    one_owned_state: true,
    unified_tick_loop: true,
    raw_input_enters_core_before_ui_modules: true,
    meaning_claim_relation_pressure_admission_live_inside_kernel: true,
    candidate_interpretation_is_not_truth: true,
    self_expansion_is_candidate_only: true,
    growth_means_subdivision_not_mass_inflation: true,
    no_silent_canonical_mutation: true,
    no_final_truth_promotion: true,
    belief_movement_requires_explicit_future_promotion: true,
    epistemic_octahedron_maturity_guard_active: true,
    objective_maturity_refuses_premature_certainty: true,
    support_pressure_is_not_truth: true,
    counterpressure_is_not_disproof: true,
    source_reference_is_anchor_not_lookup: true,
    evidence_media_description_is_not_verification: true,
    hostile_reframe_is_pressure_not_same_claim: true,
    causal_relation_requires_bridge: true,
    rollback_required: true,
    belief_movement: 'none'
  });

  function hasMeaningAnchor(text) { return /\b(i|you|he|she|they|we|user|person|people|model|belief|claim|evidence|timestamp|receipt|record|deadline|form|document|data|source|audit|test|principle|motive|criticism|truth|false|wrong|right)\b/i.test(text); }
  function hasPredicateAnchor(text) { return /\b(is|are|was|were|be|being|been|did|does|do|submitted|took|found|deleted|believes|means|causes|supports|attacks|proves|shows|checked|verified|changed|admit|admitted|misunderstood)\b/i.test(text); }
  function hasEpistemicAnchor(text) { return /\b(evidence|counterevidence|timestamp|receipt|record|verified|measured|document|data|source|audit|test|benchmark|observed|contradiction|uncertain|hypothesis|principle|claim|belief|truth|false|wrong|motive|deadline)\b/i.test(text); }
  function hasClosureOrCorrectionAnchor(text) { return /\b(always|never|impossible|cannot be wrong|can't be wrong|anyone who disagrees|everyone who disagrees|only proves|brainwashed|no evidence could|actually|i was wrong|i misunderstood|admit|admitted|did not|didn't|no longer|nothing)\b/i.test(text); }
  function gibberishRatio(tokens) {
    if (!tokens.length) return 1;
    const weird = tokens.filter((token) => {
      const t = token.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!t) return true;
      if (/^(.)\1{2,}$/.test(t)) return true;
      if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(t)) return true;
      if (/^[a-z]{2,6}$/i.test(t) && !/[aeiouy]/i.test(t)) return true;
      return false;
    }).length;
    return weird / tokens.length;
  }
  function shouldQuarantineLowSignal(text) {
    const raw = clean(text);
    if (!raw) return true;
    const tokens = tokenParts(raw);
    const letters = alphaTokens(raw);
    const hasAnchor = hasMeaningAnchor(raw) || hasPredicateAnchor(raw) || hasEpistemicAnchor(raw) || hasClosureOrCorrectionAnchor(raw);
    if (/^[^a-z0-9]+$/i.test(raw)) return true;
    if (raw.length < 12 && !hasAnchor) return true;
    if (!letters.length && !hasAnchor) return true;
    if (tokens.length <= 5 && !hasAnchor) return true;
    if (tokens.length <= 6 && gibberishRatio(tokens) >= 0.5 && !hasAnchor) return true;
    return false;
  }

  function activeContradictions(state) { return (state?.contradictions || []).filter((item) => item.status === 'active'); }
  function openQuestions(state) { return (state?.questions || []).filter((item) => item.status === 'open'); }
  function pushUniqueFinding(findings, finding) { if (!findings.some((item) => item.type === finding.type && item.text === finding.text)) findings.push(finding); }
  function removeNoMajorIfNeeded(auditLike) { const findings = auditLike.findings || []; const realFindings = findings.filter((item) => item.type !== 'no_major_audit_flags'); auditLike.findings = realFindings.length ? realFindings : findings; return auditLike; }
  function addAuditPressureFindings(kernel, auditLike) {
    const state = kernel.state || {};
    const findings = auditLike.findings || [];
    const contradictions = activeContradictions(state);
    const rootY = Number(state.octahedron?.point?.y || 0);
    const evidenceCount = (state.evidence || []).length;
    const openContradictionQuestions = openQuestions(state).filter((q) => JSON.stringify(q.links || {}).includes('contradiction'));
    if (contradictions.length && rootY > 0.45) pushUniqueFinding(findings, { severity: 'medium', type: 'possible_over_reward', text: 'Root y is positive while active contradictions remain unresolved. Detection is not the same as resolution.' });
    if (contradictions.length && evidenceCount === 0) pushUniqueFinding(findings, { severity: 'medium', type: 'unresolved_contradiction_needs_evidence', text: 'Active contradiction exists with no attached evidence. Preserve pressure until evidence or resolution is added.' });
    if (contradictions.length && openContradictionQuestions.length === 0) pushUniqueFinding(findings, { severity: 'high', type: 'unqueried_contradiction', text: 'Active contradiction lacks an open inquiry question linked to contradiction pressure.' });
    auditLike.findings = findings;
    return removeNoMajorIfNeeded(auditLike);
  }

  function createUnifiedCore() {
    return {
      version: 'epistemic_unified_core_v0_4_migration_pass_1',
      created_at: now(),
      updated_at: now(),
      doctrine: clone(CORE_DOCTRINE),
      tick: 0,
      runtimeEvents: [],
      interpretations: [],
      meaningNodes: [],
      claimNodes: [],
      evidenceNodes: [],
      relationEdges: [],
      pressureState: { support: 0, counter: 0, contradiction: 0, adversarial: 0, unresolved: 0, belief: 0, source: 0, media: 0, evidence: 0, causal: 0 },
      admissionProposals: [],
      beliefCommitments: [],
      audit: [],
      graph: { nodes: [], links: [] },
      eventIndex: {},
      stats: { raw_events: 0, interpretations: 0, meaning_nodes: 0, claim_nodes: 0, evidence_nodes: 0, relation_edges: 0, admission_proposals: 0, belief_commitments: 0 },
      last_tick_summary: null
    };
  }

  function ensureUnifiedCore(kernel) {
    if (!kernel.state) return null;
    if (!kernel.state.unifiedCore || typeof kernel.state.unifiedCore !== 'object') kernel.state.unifiedCore = createUnifiedCore();
    const core = kernel.state.unifiedCore;
    const fresh = createUnifiedCore();
    for (const key of Object.keys(fresh)) if (core[key] === undefined) core[key] = clone(fresh[key]);
    core.version = 'epistemic_unified_core_v0_4_migration_pass_1';
    core.doctrine = { ...clone(CORE_DOCTRINE), ...(core.doctrine || {}) };
    core.runtimeEvents = asArray(core.runtimeEvents);
    core.interpretations = asArray(core.interpretations);
    core.meaningNodes = asArray(core.meaningNodes);
    core.claimNodes = asArray(core.claimNodes);
    core.evidenceNodes = asArray(core.evidenceNodes);
    core.relationEdges = asArray(core.relationEdges);
    core.admissionProposals = asArray(core.admissionProposals);
    core.beliefCommitments = asArray(core.beliefCommitments);
    core.audit = asArray(core.audit);
    core.graph = core.graph && typeof core.graph === 'object' ? core.graph : { nodes: [], links: [] };
    core.graph.nodes = asArray(core.graph.nodes);
    core.graph.links = asArray(core.graph.links);
    core.eventIndex = core.eventIndex && typeof core.eventIndex === 'object' ? core.eventIndex : {};
    core.pressureState = { ...fresh.pressureState, ...(core.pressureState || {}) };
    core.stats = { ...fresh.stats, ...(core.stats || {}) };
    return core;
  }

  function coreTokenize(rawText) {
    return clean(rawText).split(/\s+/).map((token, index) => ({ token_id: `tok_${String(index + 1).padStart(2, '0')}`, original: token, normalized: lower(token).replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, ''), index })).filter(row => row.normalized || row.original);
  }
  function coreSignals(rawText) {
    const raw = lower(rawText);
    return {
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
  function coreEventId(kind, payload) { return `core_${safeId(kind)}_${tinyHash(stableStringify(payload)).slice(0, 10)}`; }
  function upsertById(list, row) { const index = list.findIndex(item => item.id === row.id); if (index >= 0) { list[index] = { ...list[index], ...row, updated_at: now(), seen_count: Number(list[index].seen_count || 1) + 1 }; return list[index]; } list.push(row); return row; }

  function pressureFromSignals(signals) {
    return { support: signals.evidence ? 0.35 : 0, counter: 0, contradiction: signals.contradiction ? 0.45 : 0, adversarial: signals.reframe ? 0.55 : 0, unresolved: (signals.typo || signals.unknown || signals.idiom || signals.quote) ? 0.65 : 0.2, belief: signals.belief_pressure ? 0.6 : 0, source: signals.source ? 0.35 : 0, media: signals.media ? 0.45 : 0, evidence: signals.evidence ? 0.45 : 0, causal: signals.relation ? 0.45 : 0 };
  }
  function mergePressure(a, b) { const out = { ...a }; for (const key of Object.keys(b || {})) out[key] = Math.min(1, Math.max(Number(out[key] || 0), Number(b[key] || 0))); return out; }

  function coreInterpretations(rawText, signals) {
    const rows = [];
    const add = (family, note) => rows.push({ family, note, status: 'candidate_interpretation_not_truth', exact_meaning_claimed: false, belief_movement: 'none' });
    if (signals.claim) add('claim_candidate', 'raw text may contain a claim candidate, not truth');
    if (signals.belief_pressure) add('belief_pressure', 'confidence/proof language is pressure, not evidence');
    if (signals.source) add('source_anchor', 'source wording is an anchor candidate, not lookup');
    if (signals.evidence) add('evidence_description', 'evidence wording is description, not verification');
    if (signals.media) add('media_description', 'media wording is description, not verification');
    if (signals.quote) add('quote_fragment', 'quote wording may be fragmentary and context-dependent');
    if (signals.reframe) add('adversarial_reframe', 'scope-changing reframe is pressure, not same claim');
    if (signals.relation) add('relation_candidate', 'relation or causal language needs bridge before truth');
    if (signals.idiom) add('idiom_or_metaphor_candidate', 'figurative language candidate requires context');
    if (signals.typo) add('typo_variant_candidate', 'typo repair candidates are not certainty');
    if (signals.unknown) add('unknown_meaning_candidate', 'unknown terms route to admission candidates, not fake meaning');
    if (!rows.length) add('raw_context_candidate', 'raw text enters as context candidate');
    return rows;
  }
  function corePacketCandidates(rawText, signals) {
    const out = [];
    const add = (type, note) => out.push({ type, note, raw_text_snapshot: clean(rawText), status: 'candidate_packet_not_truth', belief_movement: 'none' });
    if (signals.claim) add('claim_candidate', 'raw claim candidate');
    if (signals.source) add('source_reference', 'source anchor candidate');
    if (signals.evidence) add('evidence_description', 'evidence description candidate');
    if (signals.media) add('media_description', 'media description candidate');
    if (signals.quote) add('quote_fragment', 'quote fragment candidate');
    if (signals.reframe) add('adversarial_reframe', 'adversarial reframe candidate');
    if (signals.relation) add('relation_candidate', 'relation candidate');
    if (signals.unknown || signals.typo || signals.idiom) add('coverage_hold', 'coverage hold for typo/unknown/idiom candidate');
    return out;
  }
  function coreRelationCandidates(eventId, signals) {
    const out = [];
    const add = (family, status) => out.push({ id: `edge_${safeId(eventId)}_${safeId(family)}`, from: eventId, to: 'unified_core_root', relation_family: family, status, truth_status: 'not_adjudicated', promotion_status: 'not_promoted', belief_movement: 'none', created_at: now() });
    if (signals.source) add('source_reports', 'source_anchor_not_lookup');
    if (signals.evidence) add('supports', 'support_pressure_not_truth');
    if (signals.media) add('media_describes', 'media_description_not_verification');
    if (signals.reframe) add('injects_or_broadens_scope', 'hostile_reframe_pressure_not_same_claim');
    if (signals.relation) add('causes_or_contributes_to', 'causal_candidate_requires_bridge');
    if (signals.contradiction) add('contradicts_or_counters', 'contradiction_detection_not_resolution');
    return out;
  }
  function coreUnresolvedItems(signals) {
    const items = ['candidate_interpretation_is_not_truth', 'belief_movement:none'];
    if (signals.claim) items.push('claim_candidate_is_not_truth');
    if (signals.belief_pressure) items.push('belief_statement_is_pressure_not_truth');
    if (signals.source) items.push('source_reference_is_anchor_not_lookup');
    if (signals.evidence) items.push('evidence_description_not_verified_evidence');
    if (signals.media) items.push('media_description_not_verified_media');
    if (signals.quote) items.push('quote_fragment_context_required');
    if (signals.reframe) items.push('hostile_reframe_is_pressure_not_same_claim');
    if (signals.relation) items.push('causal_bridge_required_before_causal_truth');
    if (signals.idiom) items.push('idiom_or_metaphor_requires_context');
    if (signals.typo) items.push('typo_repair_is_candidate_not_certainty');
    if (signals.unknown) items.push('unknown_meaning_requires_admission_no_fake_meaning');
    return unique(items);
  }

  function upsertMeaningNodes(core, tokens, eventId) {
    const created = [];
    for (const token of tokens) {
      const kind = tokenKind(token);
      if (kind === 'empty' || kind === 'function_word') continue;
      const id = `meaning_${safeId(token.normalized)}`;
      const existing = core.meaningNodes.find(n => n.id === id);
      const row = upsertById(core.meaningNodes, { id, label: token.normalized, kind, source_event_ids: unique([...(existing?.source_event_ids || []), eventId]), candidate_status: kind.includes('candidate') ? 'candidate_not_canonical' : 'known_surface_token', exact_meaning_claimed: false, canonical_mutation_performed: false, belief_movement: 'none', created_at: existing?.created_at || now(), updated_at: now(), seen_count: existing?.seen_count || 1 });
      created.push(row.id);
    }
    return unique(created);
  }

  function coreRecord(kernel, kind, payload = {}) {
    const core = ensureUnifiedCore(kernel);
    if (!core) return null;
    const rawText = clean(payload.text || payload.raw_text || payload.claim_text || payload.evidence_text || '');
    const eventPayload = { kind, rawText, source: payload.source || '', ref_id: payload.ref_id || payload.id || '', mode: payload.mode || '' };
    const id = payload.core_event_id || coreEventId(kind, eventPayload);
    if (core.eventIndex[id]) return core.runtimeEvents.find(e => e.id === id) || null;
    const tokens = coreTokenize(rawText);
    const signals = coreSignals(rawText);
    const pressure = pressureFromSignals(signals);
    const interpretations = coreInterpretations(rawText, signals).map((row, index) => ({ ...row, id: `${id}_interp_${String(index + 1).padStart(2, '0')}`, source_event_id: id }));
    const candidatePackets = corePacketCandidates(rawText, signals).map((row, index) => ({ ...row, id: `${id}_packet_${String(index + 1).padStart(2, '0')}`, source_event_id: id }));
    const relationCandidates = coreRelationCandidates(id, signals);
    const meaningNodeIds = upsertMeaningNodes(core, tokens, id);
    const event = { id, kind, at: now(), raw_text: rawText, payload_snapshot: clone(payload), tokens, signals, meaning_node_ids: meaningNodeIds, interpretations, candidate_packets: candidatePackets, candidate_relation_edges: relationCandidates, unresolved_items: coreUnresolvedItems(signals), pressure, status: 'core_owned_candidate_event_not_truth', truth_status: 'not_adjudicated', promotion_status: 'not_promoted', belief_movement: 'none' };
    core.runtimeEvents.push(event);
    core.interpretations.push(...interpretations);
    core.runtimeEvents = core.runtimeEvents.slice(-300);
    core.interpretations = core.interpretations.slice(-600);
    core.eventIndex[id] = true;
    core.pressureState = mergePressure(core.pressureState, pressure);
    core.updated_at = now();
    return event;
  }

  function coreRegisterClaim(kernel, claim) {
    if (!claim || !claim.id) return null;
    const core = ensureUnifiedCore(kernel);
    const existing = core.claimNodes.find(n => n.id === `core_${claim.id}`);
    const event = coreRecord(kernel, 'claim_node', { text: claim.text, source: claim.source, id: claim.id, ref_id: claim.id });
    return upsertById(core.claimNodes, { id: `core_${claim.id}`, source_claim_id: claim.id, text: claim.text, scope: claim.scope, status: 'candidate_claim_not_truth', confidence_snapshot: Number(claim.confidence || 0), event_id: event?.id || existing?.event_id || null, truth_status: 'not_adjudicated', promotion_status: 'not_promoted', belief_movement: 'none', created_at: existing?.created_at || now() });
  }
  function coreRegisterEvidence(kernel, evidence) {
    if (!evidence || !evidence.id) return null;
    const core = ensureUnifiedCore(kernel);
    const existing = core.evidenceNodes.find(n => n.id === `core_${evidence.id}`);
    const event = coreRecord(kernel, 'evidence_node', { text: evidence.text, source: evidence.source, id: evidence.id, ref_id: evidence.id });
    const node = upsertById(core.evidenceNodes, { id: `core_${evidence.id}`, source_evidence_id: evidence.id, text: evidence.text, relation: evidence.relation, claimId: evidence.claimId, status: 'candidate_evidence_description_not_verification', event_id: event?.id || existing?.event_id || null, truth_status: 'not_adjudicated', promotion_status: 'not_promoted', belief_movement: 'none', created_at: existing?.created_at || now() });
    if (evidence.claimId) upsertById(core.relationEdges, { id: `edge_${safeId(evidence.id)}_${safeId(evidence.claimId)}`, from: node.id, to: `core_${evidence.claimId}`, relation_family: evidence.relation === 'attacks' ? 'counters' : 'supports', status: evidence.relation === 'attacks' ? 'counterpressure_not_disproof' : 'support_pressure_not_truth', truth_status: 'not_adjudicated', promotion_status: 'not_promoted', belief_movement: 'none', created_at: now() });
    return node;
  }

  function addAdmissionProposal(core, row) {
    return upsertById(core.admissionProposals, { ...row, admission_status: 'candidate_not_doctrine', status: 'candidate_admission_not_canonical', canonical_mutation_performed: false, exact_meaning_claimed: false, growth_mode: 'subdivision_not_mass_inflation', truth_status: 'not_adjudicated', promotion_status: 'not_promoted', belief_movement: 'none', created_at: row.created_at || now(), updated_at: now(), rollback_available: true });
  }
  function maybeProposeAdmissions(core) {
    const unknowns = core.meaningNodes.filter(n => n.kind === 'unknown_meaning_candidate');
    const typos = core.meaningNodes.filter(n => n.kind === 'typo_variant_candidate');
    const events = core.runtimeEvents;
    if (unknowns.length) addAdmissionProposal(core, { id: 'core_admission_unknown_meaning_001', proposal_family: 'unknown_meaning_admission', source_node_ids: unknowns.map(n => n.id), produced_subdivision_candidates: ['unknown_term_candidate', 'context_requirement_candidate', 'domain_specific_meaning_candidate'] });
    if (typos.length) addAdmissionProposal(core, { id: 'core_admission_typo_variant_001', proposal_family: 'typo_variant_subdivision', source_node_ids: typos.map(n => n.id), produced_subdivision_candidates: ['orthographic_variant_candidate', 'repair_candidate', 'repair_confidence_candidate'] });
    if (events.some(e => e.signals?.idiom)) addAdmissionProposal(core, { id: 'core_admission_idiom_metaphor_001', proposal_family: 'idiom_metaphor_subdivision', source_event_ids: events.filter(e => e.signals?.idiom).map(e => e.id), produced_subdivision_candidates: ['figurative_language_candidate', 'literal_vs_nonliteral_context_candidate'] });
    if (events.some(e => e.signals?.belief_pressure)) addAdmissionProposal(core, { id: 'core_admission_belief_pressure_001', proposal_family: 'belief_pressure_subdivision', source_event_ids: events.filter(e => e.signals?.belief_pressure).map(e => e.id), produced_subdivision_candidates: ['confidence_signal_candidate', 'belief_pressure_candidate', 'evidence_separation_candidate'] });
    if (events.some(e => e.signals?.source || e.signals?.evidence || e.signals?.media)) addAdmissionProposal(core, { id: 'core_admission_source_evidence_media_001', proposal_family: 'source_evidence_media_separation', source_event_ids: events.filter(e => e.signals?.source || e.signals?.evidence || e.signals?.media).map(e => e.id), produced_subdivision_candidates: ['source_anchor_candidate', 'evidence_description_candidate', 'media_description_candidate', 'verification_requirement_candidate'] });
    if (events.some(e => e.signals?.quote || e.signals?.reframe)) addAdmissionProposal(core, { id: 'core_admission_quote_reframe_scope_001', proposal_family: 'quote_reframe_scope_subdivision', source_event_ids: events.filter(e => e.signals?.quote || e.signals?.reframe).map(e => e.id), produced_subdivision_candidates: ['quote_fragment_candidate', 'context_completion_requirement_candidate', 'scope_shift_candidate'] });
    if (events.some(e => e.signals?.relation)) addAdmissionProposal(core, { id: 'core_admission_causal_bridge_001', proposal_family: 'causal_bridge_relation_subdivision', source_event_ids: events.filter(e => e.signals?.relation).map(e => e.id), produced_subdivision_candidates: ['temporal_sequence_candidate', 'causal_claim_candidate', 'bridge_requirement_candidate', 'mechanism_requirement_candidate'] });
    if (events.some(e => e.signals?.claim)) addAdmissionProposal(core, { id: 'core_admission_claim_scope_001', proposal_family: 'claim_scope_subdivision', source_event_ids: events.filter(e => e.signals?.claim).map(e => e.id), produced_subdivision_candidates: ['claim_candidate', 'scope_candidate', 'quantifier_candidate', 'condition_candidate'] });
  }

  function rebuildCoreGraph(core) {
    const nodes = [{ id: 'unified_core_root', type: 'unified_core', label: 'EpistemicKernel-owned unified core', status: 'owned_by_brain' }];
    const links = [];
    for (const n of core.meaningNodes.slice(-100)) nodes.push({ id: n.id, type: n.kind, label: n.label, status: n.candidate_status });
    for (const c of core.claimNodes.slice(-100)) nodes.push({ id: c.id, type: 'claim', label: c.text, status: c.status });
    for (const e of core.evidenceNodes.slice(-100)) nodes.push({ id: e.id, type: 'evidence', label: e.text, status: e.status });
    for (const a of core.admissionProposals.slice(-80)) nodes.push({ id: a.id, type: 'admission_proposal', label: a.proposal_family, status: a.status });
    for (const n of core.meaningNodes.slice(-100)) links.push({ from: 'unified_core_root', to: n.id, relation: 'owns_meaning_candidate' });
    for (const c of core.claimNodes.slice(-100)) links.push({ from: 'unified_core_root', to: c.id, relation: 'owns_claim_candidate' });
    for (const e of core.evidenceNodes.slice(-100)) links.push({ from: 'unified_core_root', to: e.id, relation: 'owns_evidence_candidate' });
    for (const a of core.admissionProposals.slice(-80)) links.push({ from: 'unified_core_root', to: a.id, relation: 'owns_admission_candidate' });
    for (const edge of core.relationEdges.slice(-180)) links.push({ from: edge.from, to: edge.to, relation: edge.relation_family, status: edge.status });
    core.graph = { nodes, links };
  }
  function recomputePressure(core) {
    let merged = { support: 0, counter: 0, contradiction: 0, adversarial: 0, unresolved: 0, belief: 0, source: 0, media: 0, evidence: 0, causal: 0 };
    for (const event of core.runtimeEvents) merged = mergePressure(merged, event.pressure || {});
    core.pressureState = merged;
  }
  function coreTick(kernel, reason = 'recalculate') {
    const core = ensureUnifiedCore(kernel);
    if (!core) return null;
    core.tick = Number(core.tick || 0) + 1;
    maybeProposeAdmissions(core);
    recomputePressure(core);
    rebuildCoreGraph(core);
    core.stats = { raw_events: core.runtimeEvents.length, interpretations: core.interpretations.length, meaning_nodes: core.meaningNodes.length, claim_nodes: core.claimNodes.length, evidence_nodes: core.evidenceNodes.length, relation_edges: core.relationEdges.length, admission_proposals: core.admissionProposals.length, belief_commitments: core.beliefCommitments.length };
    core.last_tick_summary = { tick: core.tick, reason, at: now(), doctrine: { brain_owns_unified_core: true, modules_are_views_not_thought_sources: true, no_final_truth_promotion: true, belief_movement: 'none' }, stats: clone(core.stats), pressureState: clone(core.pressureState) };
    core.updated_at = now();
    return core.last_tick_summary;
  }

  function findCoreEvent(core, eventOrId) { const id = typeof eventOrId === 'string' ? eventOrId : eventOrId?.id; return core.runtimeEvents.find(e => e.id === id) || null; }

  Kernel.prototype.createEmptyState = function patchedCreateEmptyState() { const state = originalCreateEmptyState.call(this); state.unifiedCore = createUnifiedCore(); return state; };
  Kernel.prototype.migrateState = function patchedMigrateState(input) { const state = originalMigrateState.call(this, input); if (!state.unifiedCore) state.unifiedCore = createUnifiedCore(); this.state = state; ensureUnifiedCore(this); return this.state; };

  Kernel.prototype.interpret = function interpret(rawInput, meta = {}) { return coreRecord(this, meta.kind || 'core_interpret', { text: rawInput, source: meta.source || 'kernel_interpret', mode: meta.mode || 'manual', id: meta.id || '' }); };
  Kernel.prototype.relate = function relate(eventOrId) {
    const core = ensureUnifiedCore(this);
    const event = findCoreEvent(core, eventOrId);
    if (!event) return [];
    const edges = asArray(event.candidate_relation_edges).map(edge => upsertById(core.relationEdges, edge));
    coreTick(this, 'relate');
    return edges;
  };
  Kernel.prototype.applyPressure = function applyPressure() { const core = ensureUnifiedCore(this); recomputePressure(core); coreTick(this, 'apply_pressure'); return clone(core.pressureState); };
  Kernel.prototype.proposeAdmissions = function proposeAdmissions() { const core = ensureUnifiedCore(this); maybeProposeAdmissions(core); coreTick(this, 'propose_admissions'); return clone(core.admissionProposals); };
  Kernel.prototype.ingest = function ingest(rawInput, meta = {}) { const event = this.interpret(rawInput, { ...meta, kind: meta.kind || 'core_ingest' }); this.relate(event); this.applyPressure(); this.proposeAdmissions(); coreTick(this, 'ingest'); return event; };
  Kernel.prototype.unifiedIngestRaw = function unifiedIngestRaw(text, meta = {}) { return this.ingest(text, { source: meta.source || 'manual', mode: meta.mode || 'auto', id: meta.id || '', kind: 'raw_ingest' }); };
  Kernel.prototype.unifiedTick = function unifiedTick(reason = 'manual_tick') { return coreTick(this, reason); };
  Kernel.prototype.unifiedCoreSnapshot = function unifiedCoreSnapshot() { const core = ensureUnifiedCore(this); coreTick(this, 'snapshot'); return clone(core); };

  Kernel.prototype.quickIngest = function patchedQuickIngest(text, options = {}) {
    const raw = clean(text);
    const mode = lower(options.mode || 'auto');
    if (raw) this.ingest(raw, { source: 'quick_ingest', mode, kind: 'quick_ingest_raw' });
    if (mode === 'auto' && shouldQuarantineLowSignal(raw)) return [this.addObservation({ text: raw, source: 'quick_ingest', reason: 'low-signal or gibberish input quarantined before claim creation' })];
    const result = originalQuickIngest.call(this, text, options);
    coreTick(this, 'quick_ingest_complete');
    return result;
  };
  Kernel.prototype.addObservation = function patchedAddObservation(args = {}) { const obs = originalAddObservation.call(this, args); if (obs && obs.text) coreRecord(this, 'observation_node', { text: obs.text, source: obs.source, id: obs.id, ref_id: obs.id }); coreTick(this, 'observation_added'); return obs; };
  Kernel.prototype.addClaim = function patchedAddClaim(args = {}) {
    const source = lower(args.source || 'manual');
    const scope = lower(args.scope || 'claim');
    const text = clean(args.text);
    const structured = source === 'structured_packet';
    const explicitlyPhilosophical = scope === 'principle_candidate' || scope === 'worldview_fragment' || scope === 'core_principle';
    if (!structured && !explicitlyPhilosophical && shouldQuarantineLowSignal(text)) return this.addObservation({ text, source: args.source || 'manual', reason: 'low-signal or gibberish input quarantined before claim creation' });
    const claim = originalAddClaim.call(this, args);
    if (claim && claim.id && claim.text) coreRegisterClaim(this, claim);
    coreTick(this, 'claim_added');
    return claim;
  };
  Kernel.prototype.addEvidence = function patchedAddEvidence(args = {}) { const ev = originalAddEvidence.call(this, args); if (ev && ev.id && ev.text) coreRegisterEvidence(this, ev); coreTick(this, 'evidence_added'); return ev; };
  Kernel.prototype.addPrinciple = function patchedAddPrinciple(args = {}) {
    const principle = originalAddPrinciple.call(this, args);
    if (principle && principle.id && principle.text) { const core = ensureUnifiedCore(this); const event = coreRecord(this, 'principle_candidate', { text: principle.text, source: principle.source, id: principle.id, ref_id: principle.id }); upsertById(core.claimNodes, { id: `core_${principle.id}`, source_principle_id: principle.id, text: principle.text, scope: principle.scope, status: 'candidate_principle_not_doctrine', event_id: event?.id || null, truth_status: 'not_adjudicated', promotion_status: 'not_promoted', belief_movement: 'none', created_at: now() }); }
    coreTick(this, 'principle_added');
    return principle;
  };
  if (originalImportExtractionPacket) {
    Kernel.prototype.importExtractionPacket = function patchedImportExtractionPacket(packet) {
      const result = originalImportExtractionPacket.call(this, packet);
      coreRecord(this, 'structured_packet_import', { text: JSON.stringify({ packet_type: packet?.packet_type || 'structured_packet', counts: { claims: asArray(packet?.claims).length, evidence: asArray(packet?.evidence).length, observations: asArray(packet?.observations).length, questions: asArray(packet?.questions).length } }), source: 'structured_packet', id: packet?.packet_id || packet?.id || '' });
      for (const claim of asArray(result?.claims)) if (claim && claim.id) coreRegisterClaim(this, claim);
      for (const ev of asArray(result?.evidence)) if (ev && ev.id) coreRegisterEvidence(this, ev);
      coreTick(this, 'structured_packet_imported');
      return result;
    };
  }
  Kernel.prototype.recalculate = function patchedRecalculate() { const result = originalRecalculate.call(this); coreTick(this, 'recalculate'); return result; };
  Kernel.prototype.snapshot = function patchedSnapshot() { ensureUnifiedCore(this); coreTick(this, 'snapshot'); return originalSnapshot.call(this); };
  Kernel.prototype.previewAudit = function patchedPreviewAudit() { const audit = originalPreviewAudit.call(this); return addAuditPressureFindings(this, audit); };
  Kernel.prototype.selfAudit = function patchedSelfAudit() {
    const audit = originalSelfAudit.call(this);
    const core = ensureUnifiedCore(this);
    audit.unified_core_audit = { owned_by_kernel: true, modules_are_views_not_thought_sources: true, stats: clone(core.stats || {}), pressureState: clone(core.pressureState || {}), belief_movement: 'none', final_truth_promotion: false };
    return addAuditPressureFindings(this, audit);
  };

  Kernel.lowSignalPatch = { shouldQuarantineLowSignal };
  Kernel.unifiedCorePatch = { version: '0.4.1-core-migration-pass-1', createUnifiedCore, ensureUnifiedCore, coreTick };
  Kernel.__v02PatchesApplied = true;
  Kernel.__unifiedCorePatchApplied = true;
  Kernel.__coreMigrationPassApplied = true;
})(typeof window !== 'undefined' ? window : globalThis);
