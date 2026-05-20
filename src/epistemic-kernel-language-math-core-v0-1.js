/* 42ndMind Epistemic Kernel Language-Math Core v0.1
 *
 * Integrates the existing objective language-math kernel into owned/shared
 * brain state. This is not a connector that owns thought. It wraps the current
 * parser / unified formula inspector / concept admission / claim-language stack
 * and makes their outputs available to the live kernel's attention, memory,
 * scoped trust, and communication.
 *
 * Candidate only. No final truth. No silent canonical mutation.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const MAX_ROWS = 80;

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function rowId(prefix, parts) { return `${prefix}_${tinyHash(asArray(parts).join('|')).slice(0, 12)}`; }
  function uniqueRows(rows, keyFn) { const seen = new Set(); const out = []; asArray(rows).forEach(row => { const key = keyFn(row); if (!key || seen.has(key)) return; seen.add(key); out.push(row); }); return out; }
  function latestEvent(state) { const rows = asArray(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(event) { return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text)); }
  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }

  const SEMANTIC_PRIORS = Object.freeze({
    chicken: { term: 'chicken', semantic_fields: ['animal', 'bird', 'food', 'cowardice_slang'], word_class: 'noun_or_slang', prior_status: 'surface_prior_not_final_truth' },
    stretch: { term: 'stretch', semantic_fields: ['extend', 'lengthen', 'strain', 'flexibility', 'action_or_state'], word_class: 'verb_or_noun', prior_status: 'surface_prior_not_final_truth' },
    spectacular: { term: 'spectacular', semantic_fields: ['positive_evaluation', 'impressive', 'intensity'], word_class: 'adjective', prior_status: 'surface_prior_not_final_truth' }
  });

  function doctrine() {
    return {
      language_math_core_lives_inside_owned_state: true,
      integrates_existing_objective_language_math_kernel: true,
      not_a_connector_that_owns_thought: true,
      wraps_formula_inspector_parser_concept_admission_and_claim_language: true,
      language_meaning_enters_as_relations_constraints_and_formula_candidates: true,
      meaning_claims_must_preserve_scope_and_conflict_pressure: true,
      semantic_conflict_adjusts_scoped_trust_not_total_user_trust: true,
      benefit_of_doubt_context_is_allowed_during_conversation: true,
      back_of_head_context_is_live_attention_not_final_truth: true,
      communication_is_projection_of_state_pressure_not_scripted_chat: true,
      formula_memory_remains_candidate_not_doctrine: true,
      no_silent_canonical_mutation: true,
      no_repo_commit_without_review: true,
      no_final_truth_promotion: true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function createLanguageMathCore(seed) {
    return Object.assign({
      packet_type: '42ndMind_language_math_core_v0_1',
      packet_version: VERSION,
      created_at: now(),
      updated_at: now(),
      active: true,
      doctrine: doctrine(),
      dependency_status: {},
      formula_memory_summary: null,
      parser_results: [],
      claim_language_results: [],
      semantic_relation_claims: [],
      semantic_conflicts: [],
      scoped_trust_adjustments: [],
      benefit_of_doubt_context: [],
      back_of_head_context: [],
      candidate_admission_requests: [],
      communication_pressure: [],
      live_thought: null,
      integration_log: [],
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }, seed || {});
  }

  function createCommunicationCore(seed) {
    return Object.assign({
      packet_type: '42ndMind_communication_core_v0_1',
      packet_version: VERSION,
      created_at: now(),
      updated_at: now(),
      active: true,
      current_message: null,
      message_history: [],
      attention_source: 'language_math_core',
      doctrine: {
        communication_projects_live_state_pressure: true,
        one_visible_thought_or_question_at_a_time: true,
        not_scripted_chat: true,
        may_speak_ask_challenge_acknowledge_or_stay_silent: true,
        no_final_truth_promotion: true,
        belief_movement: 'provisional_only'
      },
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }, seed || {});
  }

  function ensureCore(state) {
    if (!state || typeof state !== 'object') return null;
    if (!state.languageMathCore || typeof state.languageMathCore !== 'object') state.languageMathCore = createLanguageMathCore();
    if (!state.communicationCore || typeof state.communicationCore !== 'object') state.communicationCore = createCommunicationCore();
    const core = state.languageMathCore;
    const fresh = createLanguageMathCore();
    Object.keys(fresh).forEach(key => { if (core[key] === undefined) core[key] = clone(fresh[key]); });
    core.packet_version = VERSION;
    core.doctrine = Object.assign({}, doctrine(), core.doctrine || {}, doctrine());
    ['parser_results','claim_language_results','semantic_relation_claims','semantic_conflicts','scoped_trust_adjustments','benefit_of_doubt_context','back_of_head_context','candidate_admission_requests','communication_pressure','integration_log'].forEach(key => { core[key] = asArray(core[key]); });
    core.truth_status = 'not_final';
    core.promotion_status = 'not_promoted_to_final_truth';
    core.belief_movement = 'provisional_only';
    core.updated_at = now();
    const comm = state.communicationCore;
    const commFresh = createCommunicationCore();
    Object.keys(commFresh).forEach(key => { if (comm[key] === undefined) comm[key] = clone(commFresh[key]); });
    comm.packet_version = VERSION;
    comm.truth_status = 'not_final';
    comm.promotion_status = 'not_promoted_to_final_truth';
    comm.belief_movement = 'provisional_only';
    comm.updated_at = now();
    state.doctrine = Object.assign({}, state.doctrine || {}, {
      language_math_core_lives_inside_owned_state: true,
      communication_projects_live_state_pressure: true,
      modules_are_views_not_thought_sources: true,
      no_final_truth_promotion: true
    });
    return core;
  }

  function deps() {
    return {
      unified_formula_inspector: !!(global.KernelUnifiedFormulaInspectorV011 && typeof global.KernelUnifiedFormulaInspectorV011.inspectAllUnified === 'function'),
      arbitrary_language_parser: !!(global.KernelIntentionArbitraryLanguageParserV01 && typeof global.KernelIntentionArbitraryLanguageParserV01.parseInput === 'function'),
      canonical_formula_ledger: !!(global.KernelIntentionCanonicalFormulaLedgerV011 && typeof global.KernelIntentionCanonicalFormulaLedgerV011.runLedger === 'function'),
      proof_output: !!(global.KernelIntentionProofOutputV01 && typeof global.KernelIntentionProofOutputV01.runProofOutput === 'function'),
      concept_admission_registry: !!(global.KernelConceptAdmissionRegistryV01 && typeof global.KernelConceptAdmissionRegistryV01.runAdmissionRegistry === 'function'),
      objective_claim_language: !!(global.KernelObjectiveClaimLanguageV01 && typeof global.KernelObjectiveClaimLanguageV01.analyzeClaim === 'function')
    };
  }

  function summarizeFormulaMemory() {
    if (!(global.KernelUnifiedFormulaInspectorV011 && typeof global.KernelUnifiedFormulaInspectorV011.inspectAllUnified === 'function')) {
      return { available: false, reason: 'KernelUnifiedFormulaInspectorV011 unavailable', truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' };
    }
    try {
      const packet = global.KernelUnifiedFormulaInspectorV011.inspectAllUnified();
      return {
        available: true,
        ok: packet.ok === true,
        canonical_count: packet.canonical_count || 0,
        admitted_count: packet.admitted_count || 0,
        total_formula_record_count: packet.total_formula_record_count || 0,
        concept_ids: asArray(packet.formula_records).map(r => text(r.concept)),
        formula_records_preview: asArray(packet.formula_records).slice(0, 24).map(r => ({ concept: r.concept, record_type: r.record_type, formula_origin_layer: r.formula_origin_layer, l1_total: r.current_candidate && r.current_candidate.l1_total, promotion_status: r.promotion_status, belief_movement: 'provisional_only' })),
        source_packet_type: packet.packet_type,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
    } catch (error) {
      return { available: false, reason: error.message, truth_status: 'not_final', promotion_status: 'not_promoted_to_final_truth', belief_movement: 'provisional_only' };
    }
  }

  function runParserOnText(raw) {
    if (!(global.KernelIntentionArbitraryLanguageParserV01 && global.KernelIntentionCanonicalFormulaLedgerV011 && global.KernelIntentionProofOutputV01)) return null;
    try {
      const ledger = global.KernelIntentionCanonicalFormulaLedgerV011.runLedger();
      const proof = global.KernelIntentionProofOutputV01.runProofOutput();
      return global.KernelIntentionArbitraryLanguageParserV01.parseInput({ id: rowId('parse', [raw]), text: raw }, ledger, proof);
    } catch (error) {
      return { ok: false, error: error.message, input_text: raw, belief_movement: 'provisional_only' };
    }
  }

  function termPrior(term, formulaSummary) {
    const id = safeId(term);
    const formulaHit = asArray(formulaSummary && formulaSummary.concept_ids).includes(id);
    const prior = SEMANTIC_PRIORS[id] || null;
    return {
      term: id,
      formula_memory_hit: formulaHit,
      formula_status: formulaHit ? 'known_formula_memory_concept' : 'not_in_current_formula_memory',
      surface_prior: prior,
      known_enough_for_conflict_check: formulaHit || !!prior,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function overlap(a, b) {
    const aa = new Set(asArray(a));
    const bb = new Set(asArray(b));
    const inter = Array.from(aa).filter(x => bb.has(x));
    const union = Array.from(new Set(asArray(a).concat(asArray(b))));
    return union.length ? inter.length / union.length : 0;
  }

  function detectMeaningClaims(raw, formulaSummary) {
    const claims = [];
    const patterns = [
      /["“']?([a-zA-Z][a-zA-Z0-9_-]{1,40})["”']?\s+(?:means|mean|meaning is|is defined as|=)\s+["“']?([a-zA-Z][a-zA-Z0-9_-]{1,60})["”']?/gi,
      /define\s+["“']?([a-zA-Z][a-zA-Z0-9_-]{1,40})["”']?\s+as\s+["“']?([a-zA-Z][a-zA-Z0-9_-]{1,60})["”']?/gi
    ];
    patterns.forEach(pattern => {
      let m;
      while ((m = pattern.exec(raw))) {
        const source = safeId(m[1]);
        const target = safeId(m[2]);
        if (!source || !target || source === 'means' || target === 'means') continue;
        const sPrior = termPrior(source, formulaSummary);
        const tPrior = termPrior(target, formulaSummary);
        const sFields = asArray(sPrior.surface_prior && sPrior.surface_prior.semantic_fields);
        const tFields = asArray(tPrior.surface_prior && tPrior.surface_prior.semantic_fields);
        const fieldOverlap = overlap(sFields, tFields);
        const bothKnownSurface = !!(sPrior.surface_prior && tPrior.surface_prior);
        const knownFormulaConflict = sPrior.formula_memory_hit && tPrior.formula_memory_hit && source !== target;
        const conflictScore = bothKnownSurface ? Number((1 - fieldOverlap).toFixed(3)) : knownFormulaConflict ? 0.78 : source !== target ? 0.54 : 0;
        let status = 'meaning_candidate_needs_scope';
        if (conflictScore >= 0.75) status = 'semantic_conflict_hold_general_truth';
        else if (!sPrior.known_enough_for_conflict_check || !tPrior.known_enough_for_conflict_check) status = 'underdefined_semantic_relation_needs_context';
        claims.push({
          relation_id: rowId('semrel', [source, target, raw]),
          relation_type: 'word_meaning_relation_claim',
          source_term: source,
          target_meaning: target,
          relation_formula: `${source} -> ${target}`,
          source_prior: sPrior,
          target_prior: tPrior,
          field_overlap: Number(fieldOverlap.toFixed(3)),
          conflict_score: clamp01(conflictScore),
          status,
          accepted_as_general_meaning: false,
          allowed_as_private_or_local_definition_candidate: true,
          requires_scope_or_reason: true,
          truth_status: 'not_final',
          promotion_status: 'not_promoted_to_final_truth',
          belief_movement: 'provisional_only'
        });
      }
    });
    return uniqueRows(claims, row => row.relation_id);
  }

  function detectTestOrExplanation(raw) {
    const s = lower(raw);
    if (/\b(test|testing|checking|see if|blindly accept|just kidding|joke|private code|invented language|local definition)\b/.test(s)) {
      return {
        context_id: rowId('bod', [raw]),
        context_kind: 'benefit_of_doubt_explanation_or_test_context',
        statement: text(raw),
        effect: 'can_recover_scoped_trust_if_coherent_and_scope_limited',
        confidence: 0.72,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
    }
    return null;
  }

  function addTrustAdjustment(core, relation, event) {
    if (!relation || relation.conflict_score < 0.5) return null;
    return {
      adjustment_id: rowId('trustadj', [relation.relation_id, event && event.id]),
      source_id: 'direct_user',
      scope: 'semantic_definition_claims',
      adjustment_direction: relation.conflict_score >= 0.75 ? 'withhold_general_semantic_trust_until_scope_or_reason_given' : 'hold_definition_claim_as_underdefined',
      reason: `Meaning relation ${relation.relation_formula} has conflict score ${relation.conflict_score}.`,
      total_user_trust_reduction: false,
      scoped_only: true,
      recoverable_by: ['scope_clarity', 'coherent reason', 'private-definition marker', 'test/joke marker', 'evidence if claiming general language truth'],
      event_id: event && event.id || null,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function addAdmissionRequest(relation, event) {
    if (!relation) return null;
    return {
      request_id: rowId('admitreq', [relation.relation_id]),
      request_kind: 'candidate_meaning_admission_review',
      source_term: relation.source_term,
      target_meaning: relation.target_meaning,
      relation_formula: relation.relation_formula,
      admission_status: relation.conflict_score >= 0.75 ? 'held_for_scope_or_reason' : 'pending_context',
      proposed_scope: 'private_or_local_until_validated',
      reason_needed_before_general_admission: true,
      rollback_required: true,
      event_id: event && event.id || null,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function buildLiveThought(core, raw, relationClaims, parserResult, benefitContext) {
    const conflict = asArray(relationClaims).sort((a, b) => Number(b.conflict_score || 0) - Number(a.conflict_score || 0))[0];
    if (conflict && conflict.conflict_score >= 0.75) {
      return {
        thought_id: rowId('thought', [conflict.relation_id, 'conflict']),
        thought_kind: 'semantic_conflict_question',
        message: `I cannot accept “${conflict.source_term}” as generally meaning “${conflict.target_meaning}” yet. I can hold it as a private definition, joke, test, typo, or invented-language candidate. What scope or reason should I use?`,
        source_pressure: 'semantic_conflict_and_scoped_trust_hold',
        priority: 0.86,
        expects_user_reply: true,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
    }
    if (benefitContext) {
      return {
        thought_id: rowId('thought', [benefitContext.context_id, 'benefit']),
        thought_kind: 'benefit_of_doubt_acknowledgement',
        message: 'I will carry that as live context for understanding your intent, not as objective truth. It can adjust scoped trust if it remains coherent with the conversation.',
        source_pressure: 'benefit_of_doubt_context',
        priority: 0.72,
        expects_user_reply: false,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
    }
    if (parserResult && parserResult.top_candidate && parserResult.parse_status !== 'unmatched') {
      return {
        thought_id: rowId('thought', [raw, parserResult.top_candidate.concept]),
        thought_kind: 'formula_parse_statement',
        message: `I can map this toward the candidate formula concept “${parserResult.top_candidate.concept},” but unresolved dimensions remain visible before belief movement.`,
        source_pressure: 'language_to_formula_parse',
        priority: 0.58,
        expects_user_reply: false,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      };
    }
    return {
      thought_id: rowId('thought', [raw, 'heard']),
      thought_kind: 'heard_context_no_major_formalization',
      message: 'I heard this as conversation context. I can keep it in working attention without treating it as final truth.',
      source_pressure: 'working_attention_context',
      priority: 0.32,
      expects_user_reply: false,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
  }

  function updateCommunication(state, thought) {
    const comm = state.communicationCore || createCommunicationCore();
    comm.current_message = thought;
    comm.message_history = uniqueRows([thought].concat(asArray(comm.message_history)), row => row.thought_id).slice(0, 50);
    comm.updated_at = now();
    comm.truth_status = 'not_final';
    comm.promotion_status = 'not_promoted_to_final_truth';
    comm.belief_movement = 'provisional_only';
    state.communicationCore = comm;
    return comm;
  }

  function refreshLanguageMathCore(state, reason) {
    const core = ensureCore(state);
    if (!core) return null;
    const event = latestEvent(state);
    const raw = eventText(event);
    core.dependency_status = deps();
    core.formula_memory_summary = summarizeFormulaMemory();
    if (!raw) {
      core.live_thought = buildLiveThought(core, '', [], null, null);
      updateCommunication(state, core.live_thought);
      return core;
    }

    const parserResult = runParserOnText(raw);
    if (parserResult) {
      const row = Object.assign({}, parserResult, {
        parse_record_id: rowId('lmparse', [event && event.id, raw]),
        event_id: event && event.id || null,
        truth_status: 'not_final',
        promotion_status: 'not_promoted_to_final_truth',
        belief_movement: 'provisional_only'
      });
      core.parser_results = uniqueRows([row].concat(core.parser_results), r => r.parse_record_id || r.parse_id).slice(0, MAX_ROWS);
    }

    const relationClaims = detectMeaningClaims(raw, core.formula_memory_summary);
    relationClaims.forEach(relation => {
      relation.event_id = event && event.id || null;
      core.semantic_relation_claims = uniqueRows([relation].concat(core.semantic_relation_claims), r => r.relation_id).slice(0, MAX_ROWS);
      if (relation.conflict_score >= 0.5) core.semantic_conflicts = uniqueRows([relation].concat(core.semantic_conflicts), r => r.relation_id).slice(0, MAX_ROWS);
      const trust = addTrustAdjustment(core, relation, event);
      if (trust) core.scoped_trust_adjustments = uniqueRows([trust].concat(core.scoped_trust_adjustments), r => r.adjustment_id).slice(0, MAX_ROWS);
      const admission = addAdmissionRequest(relation, event);
      if (admission) core.candidate_admission_requests = uniqueRows([admission].concat(core.candidate_admission_requests), r => r.request_id).slice(0, MAX_ROWS);
    });

    const benefitContext = detectTestOrExplanation(raw);
    if (benefitContext) {
      benefitContext.event_id = event && event.id || null;
      core.benefit_of_doubt_context = uniqueRows([benefitContext].concat(core.benefit_of_doubt_context), r => r.context_id).slice(0, MAX_ROWS);
    }

    const backHead = {
      context_id: rowId('backhead', [event && event.id, raw]),
      context_kind: relationClaims.length ? 'semantic_relation_context' : benefitContext ? 'benefit_of_doubt_context' : 'conversation_working_context',
      statement: raw.slice(0, 420),
      use_policy: 'may_inform_next_interpretation_without_truth_promotion',
      end_of_conversation_tally_needed: true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
    core.back_of_head_context = uniqueRows([backHead].concat(core.back_of_head_context), r => r.context_id).slice(0, MAX_ROWS);

    core.live_thought = buildLiveThought(core, raw, relationClaims, parserResult, benefitContext);
    core.communication_pressure = uniqueRows([{
      pressure_id: rowId('commpress', [core.live_thought.thought_id]),
      thought_id: core.live_thought.thought_id,
      pressure_kind: core.live_thought.thought_kind,
      priority: core.live_thought.priority,
      message: core.live_thought.message,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(core.communication_pressure), r => r.pressure_id).slice(0, MAX_ROWS);
    updateCommunication(state, core.live_thought);

    core.integration_log = uniqueRows([{
      log_id: rowId('lmlog', [event && event.id, raw, reason]),
      at: now(),
      reason: reason || 'refresh_language_math_core',
      event_id: event && event.id || null,
      parser_status: parserResult && (parserResult.parse_status || parserResult.error) || 'not_run',
      relation_claim_count: relationClaims.length,
      semantic_conflict_count: relationClaims.filter(r => r.conflict_score >= 0.5).length,
      live_thought_kind: core.live_thought && core.live_thought.thought_kind,
      formula_memory_available: core.formula_memory_summary && core.formula_memory_summary.available === true,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }].concat(core.integration_log), r => r.log_id).slice(0, 50);

    core.updated_at = now();
    return core;
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__languageMathCorePatchApplied) return;
    const oldIngest = Kernel.prototype.ingest;
    const oldTick = Kernel.prototype.unifiedTick;
    const oldSnapshot = Kernel.prototype.snapshot;
    if (oldIngest) Kernel.prototype.ingest = function languageMathKernelIngest(input, meta) { const result = oldIngest.call(this, input, meta || {}); refreshLanguageMathCore(stateFromKernel(this), 'kernel_ingest_language_math'); return result; };
    if (oldTick) Kernel.prototype.unifiedTick = function languageMathKernelTick(reason) { const result = oldTick.call(this, reason); refreshLanguageMathCore(stateFromKernel(this), reason || 'kernel_tick_language_math'); return result; };
    if (oldSnapshot) Kernel.prototype.snapshot = function languageMathKernelSnapshot() { refreshLanguageMathCore(stateFromKernel(this), 'kernel_snapshot_language_math'); return oldSnapshot.call(this); };
    Kernel.prototype.refreshLanguageMathCore = function refreshLanguageMathMethod(reason) { return refreshLanguageMathCore(stateFromKernel(this), reason || 'manual_language_math_refresh'); };
    Kernel.__languageMathCorePatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__languageMathCoreWrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    if (oldIngest) brain.ingest = function languageMathBrainIngest(input, meta) { const result = oldIngest.call(brain, input, meta || {}); refreshLanguageMathCore(brain.state, 'brain_ingest_language_math'); return result; };
    if (oldTick) brain.tick = function languageMathBrainTick(reason) { const result = oldTick.call(brain, reason); refreshLanguageMathCore(brain.state, reason || 'brain_tick_language_math'); return result; };
    if (oldSnapshot) brain.snapshot = function languageMathBrainSnapshot() { refreshLanguageMathCore(brain.state, 'brain_snapshot_language_math'); return oldSnapshot.call(brain); };
    brain.refreshLanguageMathCore = function refreshLanguageMathMethod(reason) { return refreshLanguageMathCore(brain.state, reason || 'brain_manual_language_math_refresh'); };
    brain.__languageMathCoreWrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__languageMathCorePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function languageMathCreateState(seed) { const state = Original.createState(seed || {}); ensureCore(state); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function languageMathCreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function languageMathStaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); refreshLanguageMathCore(state, 'static_ingest_language_math'); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function languageMathStaticTick(state, reason) { const result = Original.tick(state, reason); refreshLanguageMathCore(state, reason || 'static_tick_language_math'); return result; };
    wrapper.__languageMathCorePatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__languageMathCorePatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function languageMathBridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensureCore(binding.shared_state);
      refreshLanguageMathCore(binding.shared_state, 'bridge_bind_language_math');
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__languageMathCorePatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelLanguageMathCoreV01 = Object.freeze({
    VERSION,
    doctrine,
    SEMANTIC_PRIORS,
    createLanguageMathCore,
    createCommunicationCore,
    ensureCore,
    deps,
    summarizeFormulaMemory,
    runParserOnText,
    detectMeaningClaims,
    detectTestOrExplanation,
    refreshLanguageMathCore,
    patchKernel,
    patchBrainStatic,
    patchBridge,
    wrapBrain
  });
})(typeof window !== 'undefined' ? window : globalThis);
