/* 42ndMind Raw Messy Language Intake Receptor v0.1
 * Accepts arbitrary messy text into the unified runtime and produces candidate interpretations,
 * typo/variant hypotheses, packet candidates, relation candidates, coverage holds, admission candidates,
 * and unresolved-context requirements. This is a receptor inside the runtime, not an external parser/filter.
 * No truth promotion, no lookup, no LLM, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_raw_messy_language_intake_receptor_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'raw'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }

  function runtimeApi() {
    if (!global.KernelUnifiedRuntimeReceptorRegistryV01) throw new Error('KernelUnifiedRuntimeReceptorRegistryV01 unavailable');
    return global.KernelUnifiedRuntimeReceptorRegistryV01;
  }

  function doctrine() {
    return {
      raw_messy_language_enters_unified_runtime: true,
      raw_intake_is_receptor_inside_one: true,
      raw_intake_is_not_external_filter: true,
      arbitrary_text_becomes_candidate_interpretations: true,
      typo_repair_is_candidate_not_certainty: true,
      fragment_completion_is_candidate_not_certainty: true,
      belief_statement_is_pressure_not_truth: true,
      claim_candidate_is_not_truth: true,
      packet_candidate_is_not_truth: true,
      relation_candidate_is_not_truth: true,
      coverage_hold_is_not_fake_meaning: true,
      admission_candidate_is_not_doctrine: true,
      epistemic_octahedron_maturity_guard_active: true,
      maturity_is_integration_not_confidence: true,
      objective_maturity_refuses_premature_certainty: true,
      source_reference_is_anchor_not_lookup: true,
      evidence_media_description_is_not_verification: true,
      hostile_reframe_is_pressure_not_same_claim: true,
      causal_relation_requires_bridge: true,
      no_final_truth_promotion: true,
      no_belief_movement: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      rollback_required: true,
      no_silent_mutation: true,
      belief_movement: 'none'
    };
  }

  const TYPO_MAP = {
    teh: 'the',
    opne: 'open',
    isnt: "isn't",
    cant: "can't",
    dont: "don't",
    alot: 'a lot',
    seperated: 'separated',
    definately: 'definitely',
    recieve: 'receive',
    becuase: 'because'
  };

  function sampleRawInputs() {
    return [
      { raw_input_id: 'raw_messy_typo_001', input_event_type: 'raw_messy_language_event', raw_text: 'teh valve isnt opne becuase pressure rose', source: 'synthetic_raw_text' },
      { raw_input_id: 'raw_belief_pressure_001', input_event_type: 'belief_pressure_event', raw_text: 'I am sure this proves the claim, but the source is only described and the screenshot is not verified.', source: 'synthetic_raw_text' },
      { raw_input_id: 'raw_quote_reframe_001', input_event_type: 'quote_reframe_event', raw_text: 'Quote fragment: "some should wait". A hostile reframe turns it into "all must stop".', source: 'synthetic_raw_text' },
      { raw_input_id: 'raw_evidence_media_001', input_event_type: 'evidence_media_event', raw_text: 'A log says the temperature dropped. A screenshot shows a warning banner.', source: 'synthetic_raw_text' },
      { raw_input_id: 'raw_unknown_idiom_001', input_event_type: 'unknown_or_idiom_event', raw_text: 'zorp flindle is a bottleneck and the plan is up in the air.', source: 'synthetic_raw_text' }
    ];
  }

  function tokenize(rawText) {
    return text(rawText).split(/\s+/).map((token, index) => ({
      token_id: `tok_${String(index + 1).padStart(2, '0')}`,
      original: token,
      normalized: lower(token).replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, ''),
      index
    })).filter(row => row.normalized || row.original);
  }

  function typoHypotheses(tokens) {
    return asArray(tokens).filter(row => TYPO_MAP[row.normalized]).map(row => ({
      hypothesis_id: `${row.token_id}__typo_candidate`,
      original_token: row.original,
      normalized_token: row.normalized,
      candidate_repair: TYPO_MAP[row.normalized],
      repair_basis: 'deterministic_known_variant_map',
      certainty: 'candidate_not_certain',
      exact_meaning_claimed: false,
      truth_status: 'not_adjudicated',
      belief_movement: 'none'
    }));
  }

  function unknownHypotheses(tokens) {
    const known = new Set(Object.keys(TYPO_MAP).concat(['the','valve','is','open','because','pressure','rose','i','am','sure','this','proves','claim','but','source','only','described','and','screenshot','not','verified','quote','fragment','some','should','wait','a','hostile','reframe','turns','it','into','all','must','stop','log','says','temperature','dropped','shows','warning','banner','bottleneck','plan','up','in','air']));
    return asArray(tokens).filter(row => row.normalized && !known.has(row.normalized) && !TYPO_MAP[row.normalized]).map(row => ({
      hypothesis_id: `${row.token_id}__unknown_or_new_meaning_candidate`,
      token: row.original,
      normalized_token: row.normalized,
      candidate_status: 'unknown_or_domain_specific_candidate',
      action: 'hold_for_context_or_meaning_admission',
      exact_meaning_claimed: false,
      truth_status: 'not_adjudicated',
      belief_movement: 'none'
    }));
  }

  function classifySignals(rawText) {
    const raw = lower(rawText);
    return {
      has_claim_signal: /claim|prove|proves|is |are |should |must |says|shows|because/.test(raw),
      has_belief_pressure_signal: /i am sure|i know|definitely|obviously|proves|confidence/.test(raw),
      has_source_signal: /source|reports|reference/.test(raw),
      has_evidence_signal: /evidence|log|says|indicates|temperature/.test(raw),
      has_media_signal: /screenshot|video|image|shows|banner/.test(raw),
      has_quote_signal: /quote|"|fragment/.test(raw),
      has_reframe_signal: /reframe|turns it into|some .* all|all must/.test(raw),
      has_relation_signal: /because|caused|causal|bottleneck|therefore|so /.test(raw),
      has_idiom_or_metaphor_signal: /up in the air|bottleneck/.test(raw),
      has_unknown_signal: /zorp|flindle/.test(raw),
      has_typo_signal: Object.keys(TYPO_MAP).some(k => new RegExp(`\\b${k}\\b`).test(raw))
    };
  }

  function candidateInterpretations(input, signals, typoRows, unknownRows) {
    const rows = [];
    if (signals.has_claim_signal) rows.push(interpretation(input, 'claim_candidate_interpretation', 'raw text may contain a claim candidate, not truth'));
    if (signals.has_belief_pressure_signal) rows.push(interpretation(input, 'belief_pressure_interpretation', 'confidence/proof language is pressure, not evidence'));
    if (signals.has_source_signal) rows.push(interpretation(input, 'source_anchor_interpretation', 'source wording is an anchor candidate, not lookup'));
    if (signals.has_evidence_signal) rows.push(interpretation(input, 'evidence_description_interpretation', 'evidence wording is a description, not verification'));
    if (signals.has_media_signal) rows.push(interpretation(input, 'media_description_interpretation', 'media wording is a description, not verification'));
    if (signals.has_quote_signal) rows.push(interpretation(input, 'quote_fragment_interpretation', 'quote wording may be fragmentary and context-dependent'));
    if (signals.has_reframe_signal) rows.push(interpretation(input, 'adversarial_reframe_interpretation', 'scope-changing reframe is pressure, not same claim'));
    if (signals.has_relation_signal) rows.push(interpretation(input, 'relation_candidate_interpretation', 'relation or causal language needs bridge before truth'));
    if (signals.has_idiom_or_metaphor_signal) rows.push(interpretation(input, 'idiom_or_metaphor_candidate_interpretation', 'figurative language candidate requires context'));
    if (signals.has_typo_signal || typoRows.length) rows.push(interpretation(input, 'typo_variant_candidate_interpretation', 'typo repair candidates are not certainty'));
    if (signals.has_unknown_signal || unknownRows.length) rows.push(interpretation(input, 'unknown_meaning_candidate_interpretation', 'unknown terms route to admission candidates, not fake meaning'));
    if (!rows.length) rows.push(interpretation(input, 'raw_context_candidate_interpretation', 'raw text enters as context candidate'));
    return rows;
  }

  function interpretation(input, family, note) {
    return {
      interpretation_id: `${safeId(input && input.raw_input_id)}__${family}`,
      interpretation_family: family,
      note,
      interpretation_status: 'candidate_not_truth',
      exact_meaning_claimed: false,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function candidatePackets(input, signals) {
    const rows = [];
    if (signals.has_claim_signal) rows.push(packetCandidate(input, 'claim_candidate', 'raw claim candidate'));
    if (signals.has_source_signal) rows.push(packetCandidate(input, 'source_reference', 'source anchor candidate'));
    if (signals.has_evidence_signal) rows.push(packetCandidate(input, 'evidence_description', 'evidence description candidate'));
    if (signals.has_media_signal) rows.push(packetCandidate(input, 'media_description', 'media description candidate'));
    if (signals.has_quote_signal) rows.push(packetCandidate(input, 'quote_fragment', 'quote fragment candidate'));
    if (signals.has_reframe_signal) rows.push(packetCandidate(input, 'adversarial_reframe', 'adversarial reframe candidate'));
    if (signals.has_relation_signal) rows.push(packetCandidate(input, 'relation_candidate', 'relation candidate'));
    if (signals.has_unknown_signal || signals.has_typo_signal || signals.has_idiom_or_metaphor_signal) rows.push(packetCandidate(input, 'coverage_hold', 'coverage hold for typo/unknown/idiom candidate'));
    return rows;
  }

  function packetCandidate(input, type, note) {
    return {
      candidate_packet_id: `${safeId(input && input.raw_input_id)}__${type}__raw_packet_candidate`,
      packet_type: type,
      raw_text_snapshot: text(input && input.raw_text),
      note,
      packet_status: 'candidate_packet_not_truth',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function relationCandidates(input, signals) {
    const rows = [];
    if (signals.has_source_signal) rows.push(relationCandidate(input, 'source_reports', 'source_anchor_to_claim_candidate'));
    if (signals.has_evidence_signal) rows.push(relationCandidate(input, 'supports', 'evidence_description_to_claim_candidate'));
    if (signals.has_media_signal) rows.push(relationCandidate(input, 'media_describes', 'media_description_to_claim_candidate'));
    if (signals.has_reframe_signal) rows.push(relationCandidate(input, 'broadens_scope_or_injects_quantifier', 'reframe_to_candidate_claim'));
    if (signals.has_relation_signal) rows.push(relationCandidate(input, 'causes_or_contributes_to', 'candidate_cause_to_effect_bridge_required'));
    return rows;
  }

  function relationCandidate(input, family, direction) {
    return {
      relation_candidate_id: `${safeId(input && input.raw_input_id)}__${safeId(family)}__raw_relation_candidate`,
      relation_family: family,
      relation_direction: direction,
      relation_status: 'candidate_relation_not_truth',
      relation_strength_candidate: 0.5,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function pressureComponents(signals) {
    return {
      belief_pressure: signals.has_belief_pressure_signal ? 0.65 : 0,
      support_pressure: signals.has_evidence_signal ? 0.45 : 0,
      source_anchor_pressure: signals.has_source_signal ? 0.4 : 0,
      media_description_pressure: signals.has_media_signal ? 0.5 : 0,
      adversarial_pressure: signals.has_reframe_signal ? 0.7 : 0,
      relation_candidate_pressure: signals.has_relation_signal ? 0.55 : 0,
      unresolved_gap_pressure: (signals.has_unknown_signal || signals.has_typo_signal || signals.has_quote_signal || signals.has_idiom_or_metaphor_signal) ? 0.7 : 0.25,
      truth_promotion_pressure: 0
    };
  }

  function admissionCandidates(input, typoRows, unknownRows, signals) {
    const rows = [];
    if (typoRows.length) rows.push({
      admission_candidate_id: `${safeId(input && input.raw_input_id)}__typo_variant_repair_admission_candidate`,
      admission_family: 'typo_variant_candidate',
      candidate_items: typoRows,
      admitted_to_canonical: false,
      exact_meaning_claimed: false,
      admission_status: 'candidate_not_doctrine',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    });
    if (unknownRows.length || signals.has_idiom_or_metaphor_signal) rows.push({
      admission_candidate_id: `${safeId(input && input.raw_input_id)}__meaning_subdivision_admission_candidate`,
      admission_family: 'meaning_or_idiom_subdivision_candidate',
      candidate_items: unknownRows,
      admitted_to_canonical: false,
      exact_meaning_claimed: false,
      admission_status: 'candidate_not_doctrine',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    });
    return rows;
  }

  function unresolvedItems(signals, typoRows, unknownRows) {
    const items = [
      'raw_messy_language_event_candidate_not_truth',
      'raw_intake_is_receptor_inside_one',
      'raw_intake_is_not_external_filter',
      'candidate_interpretation_is_not_truth',
      'belief_movement:none',
      'epistemic_octahedron_maturity_guard_active'
    ];
    if (signals.has_claim_signal) items.push('claim_candidate_is_not_truth');
    if (signals.has_belief_pressure_signal) items.push('belief_statement_is_pressure_not_truth');
    if (signals.has_source_signal) items.push('source_reference_is_anchor_not_lookup');
    if (signals.has_evidence_signal) items.push('evidence_description_not_verified_evidence');
    if (signals.has_media_signal) items.push('media_description_not_verified_media');
    if (signals.has_quote_signal) items.push('quote_fragment_context_required');
    if (signals.has_reframe_signal) items.push('hostile_reframe_is_pressure_not_same_claim');
    if (signals.has_relation_signal) items.push('causal_bridge_required_before_causal_truth');
    if (signals.has_idiom_or_metaphor_signal) items.push('idiom_or_metaphor_requires_context');
    if (signals.has_typo_signal || typoRows.length) items.push('typo_repair_is_candidate_not_certainty');
    if (signals.has_unknown_signal || unknownRows.length) items.push('unknown_meaning_requires_admission_no_fake_meaning');
    return unique(items);
  }

  function activeGuards(signals) {
    const guards = {
      raw_messy_language_enters_unified_runtime: true,
      raw_intake_is_receptor_inside_one: true,
      raw_intake_is_not_external_filter: true,
      arbitrary_text_becomes_candidate_interpretations: true,
      candidate_interpretation_is_not_truth: true,
      coverage_hold_is_not_fake_meaning: true,
      epistemic_octahedron_maturity_guard_active: true,
      maturity_is_integration_not_confidence: true,
      objective_maturity_refuses_premature_certainty: true,
      no_final_truth_promotion: true,
      no_belief_movement: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      rollback_required: true,
      no_silent_mutation: true
    };
    if (signals.has_typo_signal) guards.typo_repair_is_candidate_not_certainty = true;
    if (signals.has_belief_pressure_signal) guards.belief_statement_is_pressure_not_truth = true;
    if (signals.has_source_signal) guards.source_reference_is_anchor_not_lookup = true;
    if (signals.has_evidence_signal || signals.has_media_signal) guards.evidence_media_description_is_not_verification = true;
    if (signals.has_reframe_signal) guards.hostile_reframe_is_pressure_not_same_claim = true;
    if (signals.has_relation_signal) guards.causal_relation_requires_bridge = true;
    return guards;
  }

  function makeRawIntakeRecord(input, sourceRuntimePacket, index) {
    const tokens = tokenize(input && input.raw_text);
    const typos = typoHypotheses(tokens);
    const unknowns = unknownHypotheses(tokens);
    const signals = classifySignals(input && input.raw_text);
    const recordId = `raw_intake_${String(index + 1).padStart(2, '0')}__${safeId(input && input.raw_input_id)}`;
    return {
      raw_intake_record_id: recordId,
      raw_input_id: text(input && input.raw_input_id) || recordId,
      input_event_type: text(input && input.input_event_type) || 'raw_messy_language_event',
      raw_text_snapshot: text(input && input.raw_text),
      source: text(input && input.source) || 'synthetic_raw_text',
      source_unified_runtime_snapshot: {
        source_unified_runtime_ok: !!(sourceRuntimePacket && sourceRuntimePacket.ok),
        source_unified_runtime_version: text(sourceRuntimePacket && sourceRuntimePacket.packet_version),
        source_receptor_count: Number(sourceRuntimePacket && sourceRuntimePacket.receptor_count) || 0,
        source_runtime_is_one_brain: !!(sourceRuntimePacket && sourceRuntimePacket.runtime_is_one_brain),
        source_modules_as_side_filters: !!(sourceRuntimePacket && sourceRuntimePacket.modules_as_side_filters)
      },
      token_count: tokens.length,
      tokens,
      signal_snapshot: signals,
      typo_variant_hypotheses: typos,
      unknown_or_new_meaning_hypotheses: unknowns,
      candidate_interpretations: candidateInterpretations(input, signals, typos, unknowns),
      candidate_packets: candidatePackets(input, signals),
      relation_candidates: relationCandidates(input, signals),
      pressure_components: pressureComponents(signals),
      admission_candidates: admissionCandidates(input, typos, unknowns, signals),
      unresolved_items: unresolvedItems(signals, typos, unknowns),
      active_guards: activeGuards(signals),
      runtime_receptor_status: 'raw_messy_intake_receptor_inside_unified_runtime',
      record_status: 'candidate_raw_intake_not_truth',
      truth_status: 'not_adjudicated',
      final_authority: false,
      adjudicates_final_truth: false,
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none',
      rollback_available: true,
      rollback_snapshot: {
        raw_input_snapshot: clone(input),
        tokens: clone(tokens),
        signal_snapshot: clone(signals),
        rollback_reason: 'remove_raw_intake_record_without_mutating_runtime_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${recordId}_v0001_candidate`,
          source_type: 'raw_messy_language_intake_receptor',
          created_at: now(),
          mutation_type: 'initial_raw_messy_intake_record',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ]
    };
  }

  function countTotal(records, key) {
    return asArray(records).reduce((sum, row) => sum + asArray(row && row[key]).length, 0);
  }

  function validateRawIntakeRecord(row) {
    const errors = [];
    if (!text(row && row.raw_intake_record_id)) errors.push('missing_raw_intake_record_id');
    if (!text(row && row.raw_text_snapshot)) errors.push('missing_raw_text_snapshot');
    if (row && row.runtime_receptor_status !== 'raw_messy_intake_receptor_inside_unified_runtime') errors.push('not_inside_unified_runtime');
    if (row && row.record_status !== 'candidate_raw_intake_not_truth') errors.push('record_status_not_candidate');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
    if (row && row.adjudicates_final_truth !== false) errors.push('adjudicates_final_truth');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (!row || !row.active_guards || row.active_guards.raw_intake_is_receptor_inside_one !== true) errors.push('raw_receptor_guard_missing');
    if (!row || !row.active_guards || row.active_guards.raw_intake_is_not_external_filter !== true) errors.push('not_external_filter_guard_missing');
    if (!row || !row.active_guards || row.active_guards.epistemic_octahedron_maturity_guard_active !== true) errors.push('eo_maturity_guard_missing');
    if (asArray(row && row.candidate_interpretations).length < 1) errors.push('candidate_interpretations_missing');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    if (row && row.rollback_available !== true || !row || !row.rollback_snapshot) errors.push('rollback_missing');
    if (asArray(row && row.revision_trail).length < 1) errors.push('revision_trail_missing');
    if (asArray(row && row.revision_trail).some(v => v.silent_mutation !== false)) errors.push('silent_mutation_present');
    return { raw_intake_record_id: text(row && row.raw_intake_record_id), ok: errors.length === 0, errors, input_event_type: text(row && row.input_event_type), belief_movement: 'none' };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.raw_intake_records);
    const validations = records.map(validateRawIntakeRecord);
    const unresolved = records.flatMap(row => asArray(row.unresolved_items));
    const errors = [];
    if (packet && packet.source_unified_runtime_ok !== true) errors.push('source_unified_runtime_not_ok');
    if (packet && packet.source_receptor_count !== 14) errors.push(`source_receptor_count_not_14:${packet.source_receptor_count}`);
    if (records.length !== 5) errors.push(`raw_intake_record_count_not_5:${records.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.raw_intake_record_id}:${row.errors.join('|')}`); });
    const checks = {
      source_unified_runtime_ready: packet && packet.source_unified_runtime_ok === true,
      source_receptors_14: packet && packet.source_receptor_count === 14,
      source_runtime_is_one_brain: packet && packet.source_runtime_is_one_brain === true && packet.source_modules_as_side_filters === false,
      five_raw_intake_records: records.length === 5,
      all_records_valid: validations.every(row => row.ok),
      raw_intake_inside_runtime: records.every(row => row.runtime_receptor_status === 'raw_messy_intake_receptor_inside_unified_runtime'),
      candidate_interpretations_present: records.every(row => asArray(row.candidate_interpretations).length >= 1),
      typo_variant_hypotheses_visible: records.some(row => asArray(row.typo_variant_hypotheses).length >= 1) && unresolved.includes('typo_repair_is_candidate_not_certainty'),
      unknown_or_admission_visible: records.some(row => asArray(row.unknown_or_new_meaning_hypotheses).length >= 1 || asArray(row.admission_candidates).length >= 1) && unresolved.includes('unknown_meaning_requires_admission_no_fake_meaning'),
      claim_source_evidence_media_quote_reframe_relation_candidates_visible: records.some(row => asArray(row.candidate_packets).some(p => p.packet_type === 'claim_candidate')) && records.some(row => asArray(row.candidate_packets).some(p => p.packet_type === 'source_reference')) && records.some(row => asArray(row.candidate_packets).some(p => p.packet_type === 'evidence_description')) && records.some(row => asArray(row.candidate_packets).some(p => p.packet_type === 'media_description')) && records.some(row => asArray(row.candidate_packets).some(p => p.packet_type === 'quote_fragment')) && records.some(row => asArray(row.candidate_packets).some(p => p.packet_type === 'adversarial_reframe')) && records.some(row => asArray(row.candidate_packets).some(p => p.packet_type === 'relation_candidate')),
      belief_pressure_not_truth_visible: unresolved.includes('belief_statement_is_pressure_not_truth'),
      source_evidence_media_reframe_causal_guards_visible: unresolved.includes('source_reference_is_anchor_not_lookup') && unresolved.includes('evidence_description_not_verified_evidence') && unresolved.includes('media_description_not_verified_media') && unresolved.includes('hostile_reframe_is_pressure_not_same_claim') && unresolved.includes('causal_bridge_required_before_causal_truth'),
      eo_maturity_guard_active_for_all: records.every(row => row.active_guards && row.active_guards.epistemic_octahedron_maturity_guard_active === true && row.active_guards.maturity_is_integration_not_confidence === true),
      no_truth_promotion: packet && packet.truth_status === 'not_adjudicated' && records.every(row => row.truth_status === 'not_adjudicated' && row.promotion_status === 'not_promoted'),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_lookup_used: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.raw_messy_intake_is_final_truth_authority === false && records.every(row => row.final_authority === false),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_raw_messy_language_intake_receptor_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      raw_intake_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runRawMessyLanguageIntake(options = {}) {
    const sourceRuntimePacket = options.unified_runtime_packet || runtimeApi().runUnifiedRuntimeReceptorRegistry(options.unified_runtime_options || {});
    const inputs = asArray(options.raw_inputs || sampleRawInputs());
    const records = inputs.map((input, index) => makeRawIntakeRecord(input, sourceRuntimePacket, index));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Raw messy language intake receptor. Arbitrary text enters the unified runtime as candidate interpretations, not truth.',
      source_unified_runtime_ok: sourceRuntimePacket && sourceRuntimePacket.ok === true,
      source_unified_runtime_version: text(sourceRuntimePacket && sourceRuntimePacket.packet_version),
      source_receptor_count: Number(sourceRuntimePacket && sourceRuntimePacket.receptor_count) || 0,
      source_runtime_is_one_brain: !!(sourceRuntimePacket && sourceRuntimePacket.runtime_is_one_brain),
      source_modules_as_side_filters: !!(sourceRuntimePacket && sourceRuntimePacket.modules_as_side_filters),
      raw_intake_record_count: records.length,
      candidate_interpretation_count: countTotal(records, 'candidate_interpretations'),
      candidate_packet_count: countTotal(records, 'candidate_packets'),
      relation_candidate_count: countTotal(records, 'relation_candidates'),
      typo_variant_hypothesis_count: countTotal(records, 'typo_variant_hypotheses'),
      unknown_or_new_meaning_hypothesis_count: countTotal(records, 'unknown_or_new_meaning_hypotheses'),
      admission_candidate_count: countTotal(records, 'admission_candidates'),
      raw_intake_records: records,
      doctrine: doctrine(),
      raw_messy_intake_is_final_truth_authority: false,
      adjudicates_final_truth: false,
      truth_status: 'not_adjudicated',
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none',
      rollback_available: true,
      rollback_snapshot: {
        source_unified_runtime_summary: sourceRuntimePacket ? {
          ok: sourceRuntimePacket.ok,
          packet_version: sourceRuntimePacket.packet_version,
          receptor_count: sourceRuntimePacket.receptor_count,
          runtime_is_one_brain: sourceRuntimePacket.runtime_is_one_brain
        } : null,
        raw_inputs: clone(inputs),
        raw_intake_records: clone(records),
        rollback_reason: 'remove_raw_messy_intake_packet_without_mutating_runtime_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `raw_messy_language_intake_receptor_${VERSION.replace(/\./g, '_')}_v0001_candidate`,
          source_type: 'raw_messy_language_intake_receptor',
          created_at: now(),
          mutation_type: 'initial_raw_messy_language_intake_packet',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ]
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelRawMessyLanguageIntakeReceptorV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    TYPO_MAP,
    doctrine,
    sampleRawInputs,
    tokenize,
    typoHypotheses,
    unknownHypotheses,
    classifySignals,
    candidateInterpretations,
    candidatePackets,
    relationCandidates,
    pressureComponents,
    admissionCandidates,
    unresolvedItems,
    activeGuards,
    makeRawIntakeRecord,
    validateRawIntakeRecord,
    validatePacket,
    runRawMessyLanguageIntake
  });
})(typeof window !== 'undefined' ? window : globalThis);
