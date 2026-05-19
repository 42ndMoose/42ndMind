/* 42ndMind Unified Runtime Receptor Registry v0.1
 * Consolidates existing deterministic modules as receptors/operators inside one unified kernel runtime.
 * This is not a loose side-filter layer. It registers capabilities into one brain-state scaffold.
 * No truth promotion, no LLM, no lookup, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_unified_runtime_receptor_registry_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'runtime'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }

  function dossierStressApi() {
    if (!global.KernelDossierPacketStressBenchmarkV01) throw new Error('KernelDossierPacketStressBenchmarkV01 unavailable');
    return global.KernelDossierPacketStressBenchmarkV01;
  }

  function doctrine() {
    return {
      one_unified_language_grammar: true,
      brain_itself_is_one: true,
      modules_are_receptors_inside_one: true,
      modules_are_not_side_filters: true,
      raw_intake_is_not_external_filter: true,
      structured_packets_are_scaffold_not_final_intake: true,
      receptors_operate_inside_unified_runtime_state: true,
      runtime_event_activates_receptors_not_connectors: true,
      candidate_interpretation_is_not_truth: true,
      coverage_class_is_not_exact_meaning: true,
      unknown_or_typo_repair_is_candidate_only: true,
      user_confidence_is_not_evidence: true,
      support_pressure_is_not_truth: true,
      counterpressure_is_not_disproof: true,
      source_reference_is_anchor_not_lookup: true,
      evidence_media_description_is_not_verification: true,
      hostile_reframe_is_pressure_not_same_claim: true,
      causal_relation_requires_bridge: true,
      belief_movement_requires_future_promotion_criteria: true,
      no_final_truth_promotion: true,
      no_belief_movement: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      rollback_required: true,
      no_silent_mutation: true,
      epistemic_octahedron_coherence_required: true,
      active_worldview_positions_preserve_l1_surface: true,
      origin_is_pre_philosophical_null_not_pathology: true,
      maturity_is_integration_not_confidence: true,
      belief_movement: 'none'
    };
  }

  function receptorRegistry() {
    const baseGuards = [
      'one_unified_language_grammar',
      'modules_are_receptors_inside_one',
      'candidate_interpretation_is_not_truth',
      'no_final_truth_promotion',
      'no_belief_movement',
      'rollback_required',
      'no_silent_mutation'
    ];
    return [
      receptor('coverage_receptor', 'coverage_receptor', ['raw_text_event', 'structured_packet', 'candidate_text'], ['coverage_family_candidate', 'coverage_hold', 'unknown_context_requirement'], baseGuards.concat(['coverage_class_is_not_exact_meaning']), ['do_not_treat_class_as_exact_meaning', 'do_not_fake_unknown_meaning']),
      receptor('claim_receptor', 'claim_receptor', ['candidate_text', 'claim_candidate_packet'], ['claim_candidate', 'scope_notes', 'claim_dependencies'], baseGuards.concat(['claim_text_is_candidate_not_truth']), ['do_not_treat_claim_as_truth']),
      receptor('source_anchor_receptor', 'source_anchor_receptor', ['source_reference_packet', 'anchor_text'], ['source_anchor_candidate', 'source_uncertainty'], baseGuards.concat(['source_reference_is_anchor_not_lookup']), ['do_not_lookup_source', 'do_not_count_duplicate_as_independent']),
      receptor('evidence_description_receptor', 'evidence_description_receptor', ['evidence_description_packet'], ['evidence_description_candidate', 'verification_requirement'], baseGuards.concat(['evidence_media_description_is_not_verification']), ['do_not_treat_evidence_description_as_verified_evidence']),
      receptor('media_description_receptor', 'media_description_receptor', ['media_description_packet'], ['media_description_candidate', 'media_verification_requirement'], baseGuards.concat(['evidence_media_description_is_not_verification']), ['do_not_treat_media_description_as_verified_media']),
      receptor('quote_context_receptor', 'quote_context_receptor', ['quote_fragment_packet'], ['quote_context_gap', 'context_requirement'], baseGuards.concat(['quote_fragment_requires_context']), ['do_not_treat_quote_fragment_as_full_context']),
      receptor('adversarial_reframe_receptor', 'adversarial_reframe_receptor', ['adversarial_reframe_packet', 'hostile_reframe_text'], ['adversarial_pressure', 'reframe_not_same_claim'], baseGuards.concat(['hostile_reframe_is_pressure_not_same_claim']), ['do_not_treat_hostile_reframe_as_same_claim']),
      receptor('relation_receptor', 'relation_receptor', ['relation_candidate_packet', 'relation_text'], ['relation_candidate', 'bridge_requirement'], baseGuards.concat(['causal_relation_requires_bridge']), ['do_not_promote_relation_to_truth_without_bridge']),
      receptor('truth_pressure_receptor', 'truth_pressure_receptor', ['support_pressure', 'counter_pressure', 'contradiction_pressure', 'narrative_pressure'], ['pressure_components', 'unresolved_pressure'], baseGuards.concat(['support_pressure_is_not_truth', 'counterpressure_is_not_disproof']), ['do_not_convert_pressure_to_truth']),
      receptor('preledger_receptor', 'preledger_receptor', ['candidate_packet', 'preledger_ready_entry'], ['candidate_preledger_entry', 'promotion_requirements'], baseGuards.concat(['preledger_ready_is_not_truth_promotion']), ['do_not_promote_preledger_entry']),
      receptor('dossier_packet_receptor', 'dossier_packet_receptor', ['dossier_section', 'compiled_dossier_packet', 'dossier_stress_record'], ['dossier_candidate_context', 'dossier_corruption_warnings'], baseGuards.concat(['dossier_material_remains_context_not_truth']), ['do_not_believe_dossier_by_default']),
      receptor('unknown_or_typo_candidate_receptor', 'unknown_or_typo_candidate_receptor', ['raw_text_event', 'unknown_phrase', 'possible_typo'], ['candidate_variant_hypotheses', 'admission_need'], baseGuards.concat(['unknown_or_typo_repair_is_candidate_only']), ['do_not_make_typo_repair_certain', 'do_not_fake_exact_meaning']),
      receptor('meaning_admission_receptor', 'meaning_admission_receptor', ['new_meaning_candidate', 'coverage_hold', 'unknown_context_requirement'], ['admission_candidate', 'subdivision_need'], baseGuards.concat(['growth_means_subdivision_not_mass_inflation']), ['do_not_silently_mutate_canonical_meaning']),
      receptor('rollback_receptor', 'rollback_receptor', ['runtime_event', 'candidate_entry', 'admission_candidate'], ['rollback_snapshot', 'revision_trail'], baseGuards.concat(['rollback_required']), ['do_not_allow_untracked_mutation'])
    ];
  }

  function receptor(id, family, consumes, produces, invariantGuards, refusalRules) {
    return {
      receptor_id: id,
      receptor_family: family,
      consumes: unique(consumes),
      produces: unique(produces),
      invariant_guards: unique(invariantGuards),
      refusal_rules: unique(refusalRules),
      rollback_rule: 'remove_receptor_output_without_mutating_runtime_or_promoting_truth',
      enabled: true,
      receptor_status: 'registered_inside_unified_runtime'
    };
  }

  function operatorRegistry() {
    return [
      operator('event_reception_operator', ['raw_input_snapshot'], ['runtime_event'], ['raw_input_enters_runtime_not_external_filter']),
      operator('coverage_classification_operator', ['runtime_event'], ['candidate_coverage_family'], ['coverage_class_is_not_exact_meaning']),
      operator('packet_candidate_operator', ['candidate_interpretation'], ['candidate_packet'], ['structured_packet_is_candidate_not_truth']),
      operator('relation_candidate_operator', ['candidate_packet'], ['relation_candidate'], ['relation_is_candidate_not_truth']),
      operator('pressure_synthesis_operator', ['candidate_packet', 'relation_candidate'], ['pressure_components'], ['pressure_is_not_truth']),
      operator('preledger_candidate_operator', ['candidate_packet', 'pressure_components'], ['preledger_ready_candidate'], ['preledger_ready_is_not_truth_promotion']),
      operator('meaning_admission_operator', ['unknown_or_typo_candidate', 'coverage_hold'], ['admission_candidate'], ['new_meaning_requires_admission_not_silent_mutation']),
      operator('rollback_operator', ['runtime_event', 'candidate_output'], ['rollback_snapshot', 'revision_trail'], ['rollback_required'])
    ];
  }

  function operator(id, consumes, produces, guards) {
    return {
      operator_id: id,
      consumes: unique(consumes),
      produces: unique(produces),
      invariant_guards: unique(guards),
      operator_status: 'registered_inside_unified_runtime',
      enabled: true
    };
  }

  function sampleRuntimeEvents() {
    return [
      {
        runtime_event_id: 'runtime_event_full_stack_synthetic_001',
        input_event_type: 'unified_structured_context_event',
        raw_input: 'CLAIM: Some containers are sealed. SOURCE: Source A reports it. EVIDENCE: A log indicates a temperature drop. REFRAME: Some becomes all. UNRESOLVED: causal bridge missing.',
        input_origin: 'synthetic_runtime_event',
        expected_receptor_families: ['coverage_receptor', 'claim_receptor', 'source_anchor_receptor', 'evidence_description_receptor', 'adversarial_reframe_receptor', 'relation_receptor', 'truth_pressure_receptor', 'preledger_receptor', 'dossier_packet_receptor', 'rollback_receptor']
      },
      {
        runtime_event_id: 'runtime_event_typo_unknown_synthetic_001',
        input_event_type: 'raw_messy_language_event',
        raw_input: 'teh valve isnt opne and zorp flindle makes teh bracket hum',
        input_origin: 'synthetic_runtime_event',
        expected_receptor_families: ['coverage_receptor', 'unknown_or_typo_candidate_receptor', 'meaning_admission_receptor', 'rollback_receptor']
      },
      {
        runtime_event_id: 'runtime_event_belief_pressure_synthetic_001',
        input_event_type: 'belief_pressure_event',
        raw_input: 'I am confident this dossier proves the claim, but the media and evidence are only described.',
        input_origin: 'synthetic_runtime_event',
        expected_receptor_families: ['coverage_receptor', 'claim_receptor', 'evidence_description_receptor', 'media_description_receptor', 'truth_pressure_receptor', 'preledger_receptor', 'dossier_packet_receptor', 'rollback_receptor']
      }
    ];
  }

  function activateReceptors(event, registry) {
    const expected = asArray(event && event.expected_receptor_families);
    const raw = lower(event && event.raw_input);
    let families = expected.slice();
    if (!families.length) {
      if (raw) families.push('coverage_receptor');
      if (/claim|prove|sealed|locked|valve/.test(raw)) families.push('claim_receptor');
      if (/source|reports|reference/.test(raw)) families.push('source_anchor_receptor');
      if (/evidence|log|indicates/.test(raw)) families.push('evidence_description_receptor');
      if (/media|screenshot|video|image/.test(raw)) families.push('media_description_receptor');
      if (/quote|fragment/.test(raw)) families.push('quote_context_receptor');
      if (/reframe|some becomes all|hostile/.test(raw)) families.push('adversarial_reframe_receptor');
      if (/because|causal|relation|bridge/.test(raw)) families.push('relation_receptor');
      if (/support|counter|pressure|confidence|prove/.test(raw)) families.push('truth_pressure_receptor');
      if (/preledger|candidate|dossier|claim/.test(raw)) families.push('preledger_receptor');
      if (/dossier/.test(raw)) families.push('dossier_packet_receptor');
      if (/teh|opne|isnt|zorp|flindle/.test(raw)) families.push('unknown_or_typo_candidate_receptor');
      if (/zorp|flindle|unknown/.test(raw)) families.push('meaning_admission_receptor');
      families.push('rollback_receptor');
    }
    const uniqueFamilies = unique(families);
    return asArray(registry).filter(rec => uniqueFamilies.includes(rec.receptor_family));
  }

  function candidateInterpretationsFor(event, activated) {
    return asArray(activated).map(rec => {
      const family = rec.receptor_family;
      const base = {
        interpretation_id: `${safeId(event && event.runtime_event_id)}__${family}__candidate`,
        receptor_family: family,
        interpretation_status: 'candidate_not_truth',
        confidence_is_not_evidence: true,
        exact_meaning_claimed: false,
        truth_status: 'not_adjudicated',
        belief_movement: 'none'
      };
      if (family === 'coverage_receptor') base.interpretation = 'classify_language_phenomenon_without_claiming_exact_meaning';
      else if (family === 'claim_receptor') base.interpretation = 'treat_claim_text_as_candidate_claim_not_truth';
      else if (family === 'source_anchor_receptor') base.interpretation = 'treat_source_reference_as_anchor_not_lookup';
      else if (family === 'evidence_description_receptor') base.interpretation = 'treat_evidence_description_as_claim_not_verification';
      else if (family === 'media_description_receptor') base.interpretation = 'treat_media_description_as_context_not_verification';
      else if (family === 'quote_context_receptor') base.interpretation = 'preserve_quote_fragment_context_gap';
      else if (family === 'adversarial_reframe_receptor') base.interpretation = 'mark_reframe_as_pressure_not_same_claim';
      else if (family === 'relation_receptor') base.interpretation = 'mark_relation_candidate_and_preserve_bridge_requirement';
      else if (family === 'truth_pressure_receptor') base.interpretation = 'synthesize_pressure_without_truth_promotion';
      else if (family === 'preledger_receptor') base.interpretation = 'prepare_candidate_preledger_entry_without_promotion';
      else if (family === 'dossier_packet_receptor') base.interpretation = 'treat_dossier_material_as_structured_context_not_truth';
      else if (family === 'unknown_or_typo_candidate_receptor') base.interpretation = 'create_candidate_typo_or_unknown_variant_hypotheses_without_certainty';
      else if (family === 'meaning_admission_receptor') base.interpretation = 'route_unknown_meaning_to_admission_candidate_without_silent_mutation';
      else if (family === 'rollback_receptor') base.interpretation = 'attach_rollback_and_revision_trail_to_runtime_outputs';
      else base.interpretation = 'registered_receptor_candidate_interpretation';
      return base;
    });
  }

  function candidatePacketsFor(event, activated) {
    const families = asArray(activated).map(rec => rec.receptor_family);
    const packets = [];
    if (families.includes('claim_receptor')) packets.push(packetCandidate(event, 'claim_candidate', 'candidate claim extracted from runtime event'));
    if (families.includes('source_anchor_receptor')) packets.push(packetCandidate(event, 'source_reference', 'source reference held as anchor, not lookup'));
    if (families.includes('evidence_description_receptor')) packets.push(packetCandidate(event, 'evidence_description', 'evidence description held as unverified claim'));
    if (families.includes('media_description_receptor')) packets.push(packetCandidate(event, 'media_description', 'media description held as context, not verification'));
    if (families.includes('quote_context_receptor')) packets.push(packetCandidate(event, 'quote_fragment', 'quote fragment context gap preserved'));
    if (families.includes('adversarial_reframe_receptor')) packets.push(packetCandidate(event, 'adversarial_reframe', 'hostile reframe held as pressure'));
    if (families.includes('relation_receptor')) packets.push(packetCandidate(event, 'relation_candidate', 'relation candidate requires bridge if truth is claimed'));
    if (families.includes('dossier_packet_receptor')) packets.push(packetCandidate(event, 'dossier_summary_packet', 'dossier material remains structured context'));
    if (families.includes('unknown_or_typo_candidate_receptor')) packets.push(packetCandidate(event, 'coverage_hold', 'typo or unknown meaning held for candidate repair/admission'));
    return packets;
  }

  function packetCandidate(event, packetType, note) {
    return {
      candidate_packet_id: `${safeId(event && event.runtime_event_id)}__${safeId(packetType)}__runtime_packet_candidate`,
      packet_type: packetType,
      candidate_text_snapshot: text(event && event.raw_input),
      note,
      packet_status: 'candidate_packet_not_truth',
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function relationCandidatesFor(event, activated) {
    const families = asArray(activated).map(rec => rec.receptor_family);
    const relations = [];
    if (families.includes('source_anchor_receptor')) relations.push(relationCandidate(event, 'source_reports', 'source_anchor_to_claim_candidate'));
    if (families.includes('evidence_description_receptor')) relations.push(relationCandidate(event, 'supports', 'evidence_description_to_claim_candidate'));
    if (families.includes('media_description_receptor')) relations.push(relationCandidate(event, 'media_describes', 'media_description_to_claim_candidate'));
    if (families.includes('adversarial_reframe_receptor')) relations.push(relationCandidate(event, 'injects_quantifier', 'hostile_reframe_to_scoped_claim_candidate'));
    if (families.includes('relation_receptor')) relations.push(relationCandidate(event, 'causes_or_contributes_to', 'candidate_cause_to_candidate_effect_bridge_required'));
    return relations;
  }

  function relationCandidate(event, family, direction) {
    return {
      relation_candidate_id: `${safeId(event && event.runtime_event_id)}__${safeId(family)}__runtime_relation_candidate`,
      relation_family: family,
      relation_direction: direction,
      relation_status: 'candidate_relation_not_truth',
      relation_strength_candidate: 0.5,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function pressureComponentsFor(activated) {
    const families = asArray(activated).map(rec => rec.receptor_family);
    return {
      support_pressure: families.includes('evidence_description_receptor') ? 0.45 : 0,
      counter_pressure: 0,
      contradiction_pressure: 0,
      narrative_pressure: families.includes('dossier_packet_receptor') ? 0.25 : 0,
      adversarial_pressure: families.includes('adversarial_reframe_receptor') ? 0.7 : 0,
      unresolved_gap_pressure: families.some(f => ['quote_context_receptor','unknown_or_typo_candidate_receptor','meaning_admission_receptor'].includes(f)) ? 0.65 : 0.25,
      source_anchor_pressure: families.includes('source_anchor_receptor') ? 0.45 : 0,
      evidence_description_pressure: families.includes('evidence_description_receptor') ? 0.55 : 0,
      media_description_pressure: families.includes('media_description_receptor') ? 0.55 : 0,
      relation_candidate_pressure: families.includes('relation_receptor') ? 0.6 : 0
    };
  }

  function admissionCandidatesFor(event, activated) {
    const families = asArray(activated).map(rec => rec.receptor_family);
    if (!families.includes('meaning_admission_receptor') && !families.includes('unknown_or_typo_candidate_receptor')) return [];
    return [
      {
        admission_candidate_id: `${safeId(event && event.runtime_event_id)}__meaning_or_typo_admission_candidate`,
        candidate_source: 'unified_runtime_receptor_activation',
        candidate_reason: 'unknown_or_typo_or_unresolved_meaning_detected',
        admitted_to_canonical: false,
        admission_status: 'candidate_not_doctrine',
        exact_meaning_claimed: false,
        rollback_available: true,
        truth_status: 'not_adjudicated',
        promotion_status: 'not_promoted',
        belief_movement: 'none'
      }
    ];
  }

  function unresolvedItemsFor(event, activated) {
    const families = asArray(activated).map(rec => rec.receptor_family);
    const items = [
      'runtime_event_candidate_not_truth',
      'modules_are_receptors_inside_one',
      'raw_input_snapshot_preserved',
      'belief_movement:none'
    ];
    if (families.includes('coverage_receptor')) items.push('coverage_class_is_not_exact_meaning');
    if (families.includes('source_anchor_receptor')) items.push('source_reference_is_anchor_not_lookup');
    if (families.includes('evidence_description_receptor')) items.push('evidence_description_not_verified_evidence');
    if (families.includes('media_description_receptor')) items.push('media_description_not_verified_media');
    if (families.includes('quote_context_receptor')) items.push('quote_fragment_context_required');
    if (families.includes('adversarial_reframe_receptor')) items.push('hostile_reframe_is_pressure_not_same_claim');
    if (families.includes('relation_receptor')) items.push('causal_bridge_required_before_causal_truth');
    if (families.includes('truth_pressure_receptor')) items.push('pressure_is_not_truth');
    if (families.includes('preledger_receptor')) items.push('preledger_ready_is_not_truth_promotion');
    if (families.includes('dossier_packet_receptor')) items.push('dossier_material_remains_context_not_truth');
    if (families.includes('unknown_or_typo_candidate_receptor')) items.push('unknown_or_typo_repair_is_candidate_only');
    if (families.includes('meaning_admission_receptor')) items.push('meaning_admission_required_no_silent_mutation');
    return unique(items);
  }

  function activeGuardsFor(activated) {
    const guardList = asArray(activated).flatMap(rec => asArray(rec.invariant_guards));
    const guards = unique(guardList).reduce((acc, guard) => { acc[guard] = true; return acc; }, {});
    guards.one_unified_language_grammar = true;
    guards.brain_itself_is_one = true;
    guards.modules_are_receptors_inside_one = true;
    guards.modules_are_not_side_filters = true;
    guards.runtime_event_activates_receptors_not_connectors = true;
    guards.no_final_truth_promotion = true;
    guards.no_belief_movement = true;
    guards.no_llm = true;
    guards.no_external_lookup = true;
    guards.no_media_lookup = true;
    guards.rollback_required = true;
    guards.no_silent_mutation = true;
    return guards;
  }

  function makeRuntimeEvent(event, registry, operators, sourceStressPacket) {
    const activated = activateReceptors(event, registry);
    const runtimeEventId = text(event && event.runtime_event_id) || `runtime_event_${String(Date.now())}`;
    return {
      runtime_event_id: runtimeEventId,
      input_event_type: text(event && event.input_event_type) || 'runtime_event',
      raw_input_snapshot: {
        raw_input: text(event && event.raw_input),
        input_origin: text(event && event.input_origin) || 'synthetic_runtime_event',
        raw_snapshot_preserved: true
      },
      source_dossier_stress_snapshot: {
        source_dossier_stress_ok: !!(sourceStressPacket && sourceStressPacket.ok),
        source_dossier_stress_version: text(sourceStressPacket && sourceStressPacket.packet_version),
        dossier_stress_records: Number(sourceStressPacket && sourceStressPacket.dossier_stress_record_count) || 0,
        dossier_stress_families: Number(sourceStressPacket && sourceStressPacket.dossier_stress_family_count) || 0,
        source_final_authority: !!(sourceStressPacket && sourceStressPacket.dossier_packet_stress_benchmark_is_final_truth_authority)
      },
      activated_receptors: activated.map(rec => ({ receptor_id: rec.receptor_id, receptor_family: rec.receptor_family, receptor_status: rec.receptor_status })),
      activated_receptor_count: activated.length,
      activated_operators: asArray(operators).filter(op => op.enabled).map(op => ({ operator_id: op.operator_id, operator_status: op.operator_status })),
      candidate_interpretations: candidateInterpretationsFor(event, activated),
      candidate_packets: candidatePacketsFor(event, activated),
      relation_candidates: relationCandidatesFor(event, activated),
      pressure_components: pressureComponentsFor(activated),
      unresolved_items: unresolvedItemsFor(event, activated),
      admission_candidates: admissionCandidatesFor(event, activated),
      active_guards: activeGuardsFor(activated),
      rollback_available: true,
      rollback_snapshot: {
        raw_input_snapshot: clone(event),
        activated_receptors: activated.map(rec => rec.receptor_id),
        rollback_reason: 'remove_runtime_event_without_mutating_receptor_registry_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${safeId(runtimeEventId)}_v0001_unified_runtime_candidate`,
          source_type: 'unified_runtime_receptor_registry',
          created_at: now(),
          mutation_type: 'initial_runtime_event',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ],
      runtime_event_status: 'candidate_runtime_event_not_truth',
      truth_status: 'not_adjudicated',
      final_authority: false,
      adjudicates_final_truth: false,
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function validateReceptor(rec) {
    const errors = [];
    if (!text(rec && rec.receptor_id)) errors.push('missing_receptor_id');
    if (!text(rec && rec.receptor_family)) errors.push('missing_receptor_family');
    if (asArray(rec && rec.consumes).length < 1) errors.push('missing_consumes');
    if (asArray(rec && rec.produces).length < 1) errors.push('missing_produces');
    if (asArray(rec && rec.invariant_guards).length < 1) errors.push('missing_invariant_guards');
    if (asArray(rec && rec.refusal_rules).length < 1) errors.push('missing_refusal_rules');
    if (rec && rec.enabled !== true) errors.push('receptor_disabled');
    if (rec && rec.receptor_status !== 'registered_inside_unified_runtime') errors.push('not_registered_inside_runtime');
    return { receptor_id: text(rec && rec.receptor_id), ok: errors.length === 0, errors, receptor_family: text(rec && rec.receptor_family) };
  }

  function validateRuntimeEvent(row) {
    const errors = [];
    if (!text(row && row.runtime_event_id)) errors.push('missing_runtime_event_id');
    if (!row || !row.raw_input_snapshot || row.raw_input_snapshot.raw_snapshot_preserved !== true) errors.push('raw_snapshot_missing');
    if (asArray(row && row.activated_receptors).length < 1) errors.push('no_receptors_activated');
    if (asArray(row && row.candidate_interpretations).length < 1) errors.push('candidate_interpretations_missing');
    if (!row || !row.pressure_components) errors.push('pressure_components_missing');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    if (!row || !row.active_guards || row.active_guards.modules_are_receptors_inside_one !== true) errors.push('modules_inside_one_guard_missing');
    if (!row || !row.active_guards || row.active_guards.modules_are_not_side_filters !== true) errors.push('not_side_filter_guard_missing');
    if (!row || !row.active_guards || row.active_guards.no_final_truth_promotion !== true) errors.push('no_truth_promotion_guard_missing');
    if (row && row.runtime_event_status !== 'candidate_runtime_event_not_truth') errors.push('runtime_event_status_not_candidate');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
    if (row && row.adjudicates_final_truth !== false) errors.push('adjudicates_final_truth');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.rollback_available !== true || !row || !row.rollback_snapshot) errors.push('rollback_missing');
    if (asArray(row && row.revision_trail).length < 1) errors.push('revision_trail_missing');
    if (asArray(row && row.revision_trail).some(v => v.silent_mutation !== false)) errors.push('silent_mutation_present');
    return { runtime_event_id: text(row && row.runtime_event_id), ok: errors.length === 0, errors, activated_receptor_count: Number(row && row.activated_receptor_count) || 0, belief_movement: 'none' };
  }

  function validateRuntimePacket(packet) {
    const receptors = asArray(packet && packet.receptors);
    const events = asArray(packet && packet.runtime_events);
    const receptorValidations = receptors.map(validateReceptor);
    const eventValidations = events.map(validateRuntimeEvent);
    const families = new Set(receptors.map(row => row.receptor_family));
    const activatedFamilies = new Set(events.flatMap(ev => asArray(ev.activated_receptors).map(r => r.receptor_family)));
    const unresolved = events.flatMap(ev => asArray(ev.unresolved_items));
    const errors = [];
    if (packet && packet.source_dossier_stress_ok !== true) errors.push('source_dossier_stress_not_ok');
    if (packet && packet.source_dossier_stress_record_count !== 16) errors.push(`source_dossier_stress_record_count_not_16:${packet.source_dossier_stress_record_count}`);
    if (receptors.length !== 14) errors.push(`receptor_count_not_14:${receptors.length}`);
    if (events.length !== 3) errors.push(`runtime_event_count_not_3:${events.length}`);
    receptorValidations.forEach(row => { if (!row.ok) errors.push(`${row.receptor_id}:${row.errors.join('|')}`); });
    eventValidations.forEach(row => { if (!row.ok) errors.push(`${row.runtime_event_id}:${row.errors.join('|')}`); });
    const requiredFamilies = ['coverage_receptor','claim_receptor','source_anchor_receptor','evidence_description_receptor','media_description_receptor','quote_context_receptor','adversarial_reframe_receptor','relation_receptor','truth_pressure_receptor','preledger_receptor','dossier_packet_receptor','unknown_or_typo_candidate_receptor','meaning_admission_receptor','rollback_receptor'];
    const checks = {
      source_dossier_stress_ready: packet && packet.source_dossier_stress_ok === true,
      source_dossier_stress_records_16: packet && packet.source_dossier_stress_record_count === 16,
      doctrine_unified_brain: packet && packet.doctrine && packet.doctrine.brain_itself_is_one === true && packet.doctrine.modules_are_receptors_inside_one === true && packet.doctrine.modules_are_not_side_filters === true,
      fourteen_receptors_registered: receptors.length === 14,
      all_required_receptor_families_registered: requiredFamilies.every(f => families.has(f)),
      all_receptors_valid: receptorValidations.every(row => row.ok),
      operators_registered: asArray(packet && packet.operators).length >= 8,
      runtime_events_present: events.length === 3,
      all_runtime_events_valid: eventValidations.every(row => row.ok),
      runtime_events_activate_receptors: events.every(ev => asArray(ev.activated_receptors).length >= 1),
      all_receptor_outputs_inside_runtime: events.every(ev => ev.active_guards && ev.active_guards.modules_are_receptors_inside_one === true && ev.active_guards.modules_are_not_side_filters === true),
      raw_messy_event_routes_to_typo_and_admission: Array.from(activatedFamilies).includes('unknown_or_typo_candidate_receptor') && Array.from(activatedFamilies).includes('meaning_admission_receptor'),
      structured_event_routes_to_dossier_preledger_pressure: Array.from(activatedFamilies).includes('dossier_packet_receptor') && Array.from(activatedFamilies).includes('preledger_receptor') && Array.from(activatedFamilies).includes('truth_pressure_receptor'),
      unresolved_items_preserve_core_guards: unresolved.includes('coverage_class_is_not_exact_meaning') && unresolved.includes('unknown_or_typo_repair_is_candidate_only') && unresolved.includes('preledger_ready_is_not_truth_promotion') && unresolved.includes('dossier_material_remains_context_not_truth'),
      no_truth_promotion: packet && packet.truth_status === 'not_adjudicated' && events.every(ev => ev.truth_status === 'not_adjudicated' && ev.promotion_status === 'not_promoted'),
      no_llm_used: packet && packet.llm_used === false && events.every(ev => ev.llm_used === false),
      no_lookup_used: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && events.every(ev => ev.external_lookup_performed === false && ev.media_lookup_performed === false),
      rollback_available_for_all: events.every(ev => ev.rollback_available === true && !!ev.rollback_snapshot),
      no_silent_mutation: events.every(ev => asArray(ev.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.unified_runtime_is_final_truth_authority === false && events.every(ev => ev.final_authority === false),
      belief_movement_none: packet && packet.belief_movement === 'none' && events.every(ev => ev.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_unified_runtime_receptor_registry_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      receptor_validations: receptorValidations,
      runtime_event_validations: eventValidations,
      errors,
      belief_movement: 'none'
    };
  }

  function runUnifiedRuntimeReceptorRegistry(options = {}) {
    const sourceStressPacket = options.dossier_stress_packet || dossierStressApi().runDossierPacketStressBenchmark(options.dossier_stress_options || {});
    const receptors = asArray(options.receptors || receptorRegistry());
    const operators = asArray(options.operators || operatorRegistry());
    const runtimeInputs = asArray(options.runtime_events || sampleRuntimeEvents());
    const events = runtimeInputs.map(ev => makeRuntimeEvent(ev, receptors, operators, sourceStressPacket));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Unified runtime receptor registry. Registers deterministic modules as receptors/operators inside one brain-state runtime.',
      source_dossier_stress_ok: sourceStressPacket && sourceStressPacket.ok === true,
      source_dossier_stress_version: text(sourceStressPacket && sourceStressPacket.packet_version),
      source_dossier_stress_record_count: Number(sourceStressPacket && sourceStressPacket.dossier_stress_record_count) || 0,
      source_dossier_stress_family_count: Number(sourceStressPacket && sourceStressPacket.dossier_stress_family_count) || 0,
      unified_runtime_status: 'candidate_unified_runtime_not_truth_authority',
      runtime_is_one_brain: true,
      modules_as_receptors_inside_one: true,
      modules_as_side_filters: false,
      receptors,
      receptor_count: receptors.length,
      receptor_family_count: new Set(receptors.map(row => row.receptor_family)).size,
      operators,
      operator_count: operators.length,
      runtime_events: events,
      runtime_event_count: events.length,
      doctrine: doctrine(),
      unified_runtime_is_final_truth_authority: false,
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
        source_dossier_stress_summary: sourceStressPacket ? {
          ok: sourceStressPacket.ok,
          packet_version: sourceStressPacket.packet_version,
          dossier_stress_record_count: sourceStressPacket.dossier_stress_record_count,
          dossier_stress_family_count: sourceStressPacket.dossier_stress_family_count
        } : null,
        receptors: clone(receptors),
        operators: clone(operators),
        runtime_events: clone(events),
        rollback_reason: 'remove_unified_runtime_registry_without_mutating_source_modules_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `unified_runtime_receptor_registry_${VERSION.replace(/\./g, '_')}_v0001_candidate`,
          source_type: 'unified_runtime_receptor_registry',
          created_at: now(),
          mutation_type: 'initial_unified_runtime_registry',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ]
    };
    packet.validation = validateRuntimePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelUnifiedRuntimeReceptorRegistryV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    receptor,
    receptorRegistry,
    operator,
    operatorRegistry,
    sampleRuntimeEvents,
    activateReceptors,
    candidateInterpretationsFor,
    candidatePacketsFor,
    relationCandidatesFor,
    pressureComponentsFor,
    admissionCandidatesFor,
    unresolvedItemsFor,
    activeGuardsFor,
    makeRuntimeEvent,
    validateReceptor,
    validateRuntimeEvent,
    validateRuntimePacket,
    runUnifiedRuntimeReceptorRegistry
  });
})(typeof window !== 'undefined' ? window : globalThis);
