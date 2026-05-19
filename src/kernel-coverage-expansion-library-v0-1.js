/* 42ndMind Coverage Expansion Library v0.1
 * Adds general language-phenomenon coverage without dictionary population.
 * The aim is whole-scope coverage in the unified grammar: identify the class of a meaning/problem,
 * preserve uncertainty, and admit details only when accuracy requires it.
 * No final truth promotion, no lookup, no LLM, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_coverage_expansion_library_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'coverage'; }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }
  function l1(dimensions) { return round(Object.keys(dimensions || {}).reduce((sum, key) => sum + Math.abs(Number(dimensions[key]) || 0), 0)); }

  function relationStressApi() {
    if (!global.KernelWorldModelRelationStressBenchmarkV01) throw new Error('KernelWorldModelRelationStressBenchmarkV01 unavailable');
    return global.KernelWorldModelRelationStressBenchmarkV01;
  }

  function doctrine() {
    return {
      unified_language_grammar_scope_is_one: true,
      coverage_expansion_is_meta_grammar_not_dictionary_population: true,
      language_phenomenon_class_can_be_known_before_exact_meaning: true,
      unknown_specifics_hold_for_admission_when_needed: true,
      learn_detail_only_when_accuracy_requires_it: true,
      no_fake_specific_meaning: true,
      no_silent_dictionary_inflation: true,
      growth_means_subdivision_not_mass_inflation: true,
      local_concept_shape_l1_equals_1: true,
      force_intensity_remains_outside_shape: true,
      intention_type: 1,
      coverage_records_are_candidate_not_doctrine: true,
      relation_stress_source_required: true,
      no_final_truth_promotion: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      rollback_required_for_every_coverage_record: true,
      no_silent_mutation: true,
      belief_movement: 'none'
    };
  }

  const COVERAGE_SPECS = [
    { family: 'literal_statement', phenomenon: 'direct descriptive assertion', detector: 'declarative clause with low figurative pressure', sample: 'The container is closed.', dims: { structure: 0.42, context: 0.16, relation: 0.28, pressure: 0.14 }, output: ['claim_candidate'], needs: ['subject_predicate_relation'] },
    { family: 'idiom_or_fixed_expression', phenomenon: 'fixed phrase whose meaning may not equal literal parts', detector: 'phrase pattern suggests non-compositional meaning', sample: 'That plan is up in the air.', dims: { structure: 0.2, context: 0.38, relation: 0.2, pressure: 0.22 }, output: ['idiom_pattern_candidate', 'meaning_admission_if_needed'], needs: ['context_before_exact_meaning'] },
    { family: 'sarcasm_or_irony', phenomenon: 'surface wording may oppose intended meaning', detector: 'positive wording near negative context or reversal pressure', sample: 'Great, another delay.', dims: { structure: 0.14, context: 0.42, relation: 0.16, pressure: 0.28 }, output: ['surface_intent_tension_candidate', 'context_required'], needs: ['tone_context', 'speaker_relation'] },
    { family: 'metaphor_or_analogy', phenomenon: 'mapping between source domain and target domain', detector: 'nonliteral comparison or domain transfer', sample: 'The queue is a bottleneck.', dims: { structure: 0.24, context: 0.26, relation: 0.34, pressure: 0.16 }, output: ['mapping_candidate', 'domain_transfer_candidate'], needs: ['source_target_mapping'] },
    { family: 'ambiguity_polysemy', phenomenon: 'one surface form permits multiple candidate meanings', detector: 'lexical or structural ambiguity remains open', sample: 'The bank is nearby.', dims: { structure: 0.18, context: 0.42, relation: 0.24, pressure: 0.16 }, output: ['ambiguity_hold', 'candidate_meaning_set'], needs: ['disambiguating_context'] },
    { family: 'deixis_indexicality', phenomenon: 'meaning depends on speaker, place, time, or pointing context', detector: 'this, that, here, there, now, tomorrow, I, you', sample: 'Put it there tomorrow.', dims: { structure: 0.16, context: 0.5, relation: 0.2, pressure: 0.14 }, output: ['context_anchor_required'], needs: ['speaker_time_place_anchor'] },
    { family: 'scope_quantifier', phenomenon: 'some, all, none, many, few, every, only, at least, at most', detector: 'quantifier or scope boundary controls claim range', sample: 'Some containers are sealed.', dims: { structure: 0.34, context: 0.22, relation: 0.28, pressure: 0.16 }, output: ['scope_record', 'quantifier_guard'], needs: ['scope_boundary'] },
    { family: 'modality_possibility', phenomenon: 'possible, may, might, could, likely, uncertain', detector: 'modal marker lowers certainty and blocks hard truth', sample: 'The door may be locked.', dims: { structure: 0.28, context: 0.24, relation: 0.24, pressure: 0.24 }, output: ['modal_status_candidate'], needs: ['modal_strength'] },
    { family: 'modality_necessity', phenomenon: 'must, required, necessary, cannot avoid', detector: 'necessity marker raises obligation or constraint pressure', sample: 'The door must stay locked.', dims: { structure: 0.3, context: 0.2, relation: 0.24, pressure: 0.26 }, output: ['necessity_candidate', 'constraint_record'], needs: ['constraint_source'] },
    { family: 'conditional_relation', phenomenon: 'if/when/unless condition controls conclusion', detector: 'conditional marker separates antecedent from consequent', sample: 'If pressure rises, stop the pump.', dims: { structure: 0.34, context: 0.2, relation: 0.32, pressure: 0.14 }, output: ['condition_record', 'dependency_relation'], needs: ['antecedent_consequent_boundary'] },
    { family: 'negation', phenomenon: 'not, never, no, without, lack, absent', detector: 'negation marker reverses or blocks a predicate', sample: 'The valve is not open.', dims: { structure: 0.4, context: 0.14, relation: 0.3, pressure: 0.16 }, output: ['negated_predicate_candidate'], needs: ['negation_scope'] },
    { family: 'comparison', phenomenon: 'more, less, better, worse, same, different, than', detector: 'comparative relation between entities or states', sample: 'This batch is colder than the last one.', dims: { structure: 0.32, context: 0.22, relation: 0.32, pressure: 0.14 }, output: ['comparison_relation_candidate'], needs: ['comparison_axis', 'reference_class'] },
    { family: 'identity_definition', phenomenon: 'is/means/refers-to/defined-as identity or definition', detector: 'definition or equivalence marker', sample: 'A chiller is a cooling unit.', dims: { structure: 0.34, context: 0.18, relation: 0.34, pressure: 0.14 }, output: ['identity_relation_candidate', 'definition_candidate'], needs: ['definition_scope'] },
    { family: 'obligation_permission', phenomenon: 'must, should, allowed, forbidden, permitted', detector: 'normative permission or obligation marker', sample: 'Operators must log temperature.', dims: { structure: 0.28, context: 0.22, relation: 0.24, pressure: 0.26 }, output: ['normative_relation_candidate'], needs: ['authority_or_rule_source'] },
    { family: 'ability_capacity', phenomenon: 'can, cannot, able, capable, capacity', detector: 'ability marker separates capability from actual event', sample: 'The system can detect ambiguity.', dims: { structure: 0.28, context: 0.2, relation: 0.3, pressure: 0.22 }, output: ['capacity_candidate'], needs: ['capability_evidence_if_claimed'] },
    { family: 'temporal_relation', phenomenon: 'before, after, during, while, then, until', detector: 'temporal marker orders events without proving cause', sample: 'Before packing, inspect the seal.', dims: { structure: 0.3, context: 0.2, relation: 0.36, pressure: 0.14 }, output: ['temporal_relation_candidate'], needs: ['event_order_boundary'] },
    { family: 'causal_relation', phenomenon: 'because, caused by, led to, due to, resulted in', detector: 'causal marker requires bridge before causal truth', sample: 'The alarm sounded because pressure rose.', dims: { structure: 0.28, context: 0.18, relation: 0.36, pressure: 0.18 }, output: ['causal_relation_candidate'], needs: ['causal_bridge'] },
    { family: 'evidence_marker', phenomenon: 'shows, indicates, according to, based on, evidence suggests', detector: 'evidence marker links source claim to target claim', sample: 'The log indicates a temperature drop.', dims: { structure: 0.26, context: 0.24, relation: 0.34, pressure: 0.16 }, output: ['evidence_relation_candidate'], needs: ['evidence_verification_if_truth_claimed'] },
    { family: 'question_request', phenomenon: 'question or request for information/action', detector: 'question form or request marker', sample: 'Can you check the reading?', dims: { structure: 0.28, context: 0.26, relation: 0.22, pressure: 0.24 }, output: ['question_or_request_intent_candidate'], needs: ['requested_target'] },
    { family: 'command_directive', phenomenon: 'imperative instruction or directive', detector: 'imperative verb or command pressure', sample: 'Close the valve.', dims: { structure: 0.28, context: 0.2, relation: 0.22, pressure: 0.3 }, output: ['directive_intent_candidate'], needs: ['actor_action_target'] },
    { family: 'quotation_report', phenomenon: 'reported speech, quote, transcript, or attribution', detector: 'says, said, quoted, according to, transcript marker', sample: 'The note says the seal is broken.', dims: { structure: 0.26, context: 0.28, relation: 0.3, pressure: 0.16 }, output: ['reported_claim_candidate', 'source_anchor_required'], needs: ['quotation_context', 'speaker_or_source_anchor'] },
    { family: 'unknown_pattern_hold_for_admission', phenomenon: 'recognized as meaningful pressure but not yet covered specifically', detector: 'unmatched or weakly matched structure that should not be faked', sample: 'This phrase carries a meaning the kernel has not admitted yet.', dims: { structure: 0.18, context: 0.36, relation: 0.18, pressure: 0.28 }, output: ['admission_hold_candidate', 'coverage_gap_visible'], needs: ['new_meaning_admission_record'] }
  ];

  function sampleCoverageSpecs() { return clone(COVERAGE_SPECS); }

  function detailPolicyFor(spec) {
    const family = text(spec && spec.family);
    const exactMeaningNeeded = ['literal_statement', 'scope_quantifier', 'conditional_relation', 'negation', 'comparison', 'identity_definition', 'temporal_relation', 'causal_relation', 'evidence_marker', 'command_directive'].includes(family);
    return {
      exact_meaning_required_immediately: exactMeaningNeeded,
      class_detection_without_dictionary_population: true,
      learn_detail_only_when_accuracy_requires_it: true,
      admission_required_for_new_specific_meaning: ['idiom_or_fixed_expression', 'sarcasm_or_irony', 'metaphor_or_analogy', 'ambiguity_polysemy', 'unknown_pattern_hold_for_admission'].includes(family),
      no_fake_specific_meaning: true
    };
  }

  function unresolvedItemsFor(spec) {
    const family = text(spec && spec.family);
    const items = [
      `coverage_family:${family}`,
      'coverage_status:candidate_general_coverage',
      'meaning_class_known_before_all_instances_known',
      'no_dictionary_population_required',
      'learn_detail_only_when_accuracy_requires_it'
    ];
    if (family === 'idiom_or_fixed_expression') items.push('idiom_exact_meaning_held_until_context_or_admission');
    if (family === 'sarcasm_or_irony') items.push('surface_meaning_may_not_equal_intended_meaning');
    if (family === 'metaphor_or_analogy') items.push('domain_mapping_required_before_exact_interpretation');
    if (family === 'ambiguity_polysemy') items.push('multiple_candidate_meanings_remain_open');
    if (family === 'deixis_indexicality') items.push('speaker_time_place_anchor_required');
    if (family === 'scope_quantifier') items.push('scope_boundary_preserved');
    if (family === 'conditional_relation') items.push('condition_boundary_preserved');
    if (family === 'causal_relation') items.push('causal_bridge_required_before_causal_truth');
    if (family === 'evidence_marker') items.push('evidence_claim_separate_from_evidence_verification');
    if (family === 'unknown_pattern_hold_for_admission') items.push('unknown_specific_meaning_must_not_be_faked');
    return items;
  }

  function makeCoverageRecord(spec, sourcePacket, index) {
    const dims = clone(spec.dims || {});
    const shapeMass = l1(dims);
    const id = `coverage_${String(index + 1).padStart(2, '0')}__${safeId(spec.family)}`;
    return {
      coverage_id: id,
      coverage_family: text(spec.family),
      language_phenomenon: text(spec.phenomenon),
      abstract_detector: text(spec.detector),
      synthetic_sample: text(spec.sample),
      output_relation_candidates: asArray(spec.output).slice(),
      required_context_or_detail: asArray(spec.needs).slice(),
      intention_type: 1,
      local_concept_shape: dims,
      local_concept_shape_l1: shapeMass,
      force_intensity: 0,
      force_formula: 'F = M · i',
      force_kept_outside_shape: true,
      coverage_status: 'candidate_general_coverage_not_doctrine',
      dictionary_population_required: false,
      exact_instance_population_required: false,
      detail_learning_policy: detailPolicyFor(spec),
      source_relation_stress_snapshot: {
        source_relation_stress_ok: !!(sourcePacket && sourcePacket.ok),
        source_relation_stress_version: text(sourcePacket && sourcePacket.packet_version),
        source_relation_stress_patch_version: text(sourcePacket && sourcePacket.patch_version),
        source_relation_stress_records: Number(sourcePacket && sourcePacket.relation_stress_record_count) || 0,
        source_relation_stress_families: Number(sourcePacket && sourcePacket.relation_stress_family_count) || 0,
        source_final_authority: !!(sourcePacket && sourcePacket.relation_stress_benchmark_is_final_truth_authority)
      },
      unresolved_items: unresolvedItemsFor(spec),
      active_guards: {
        unified_language_grammar_scope_is_one: true,
        coverage_expansion_is_meta_grammar_not_dictionary_population: true,
        meaning_class_known_before_all_instances_known: true,
        unknown_specifics_hold_for_admission_when_needed: true,
        no_fake_specific_meaning: true,
        local_concept_shape_l1_equals_1: shapeMass === 1,
        force_intensity_remains_outside_shape: true,
        no_truth_promotion: true,
        no_llm: true,
        no_external_lookup: true,
        no_media_lookup: true,
        rollback_available: true,
        no_silent_mutation: true,
        belief_movement_none: true
      },
      rollback_available: true,
      rollback_snapshot: {
        source_spec: clone(spec),
        source_relation_stress_summary: clone(sourcePacket ? {
          ok: sourcePacket.ok,
          packet_version: sourcePacket.packet_version,
          patch_version: sourcePacket.patch_version,
          relation_stress_record_count: sourcePacket.relation_stress_record_count,
          relation_stress_family_count: sourcePacket.relation_stress_family_count
        } : null),
        rollback_reason: 'remove_candidate_coverage_record_without_mutating_language_scope_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${id}_v0001_candidate`,
          source_type: 'coverage_expansion_library_candidate',
          created_at: now(),
          mutation_type: 'initial_coverage_record',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ],
      truth_status: 'not_adjudicated',
      final_authority: false,
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function makeCoverageRecords(specs, sourcePacket) {
    return asArray(specs).map((spec, index) => makeCoverageRecord(spec, sourcePacket, index));
  }

  function familyCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.coverage_family] = (acc[row.coverage_family] || 0) + 1;
      return acc;
    }, {});
  }

  function classifyLanguagePhenomenon(input) {
    const raw = text(input);
    const s = lower(raw);
    const reasons = [];
    function result(family, confidence, extraReasons) {
      return {
        packet_type: '42ndMind_language_phenomenon_classification_v0_1',
        input: raw,
        coverage_family_candidate: family,
        confidence_candidate: round(confidence),
        reasons: asArray(extraReasons || reasons).slice(),
        exact_meaning_claimed: false,
        admission_required_for_exact_new_meaning: ['idiom_or_fixed_expression', 'sarcasm_or_irony', 'metaphor_or_analogy', 'unknown_pattern_hold_for_admission'].includes(family),
        dictionary_population_required: false,
        truth_status: 'not_adjudicated',
        belief_movement: 'none'
      };
    }
    if (!raw) return result('unknown_pattern_hold_for_admission', 0.1, ['empty_input']);
    if (/\b(up in the air|kick the bucket|spill the beans|under the weather|piece of cake)\b/.test(s)) return result('idiom_or_fixed_expression', 0.86, ['known_fixed_expression_pattern']);
    if (/^(great|perfect|fantastic|wonderful)[,!]?\s+another\b/.test(s) || /yeah right|as if\b/.test(s)) return result('sarcasm_or_irony', 0.78, ['surface_positive_or_agreeing_marker_near_negative_context']);
    if (/\b(is|are|was|were)\s+a\s+(bottleneck|bridge|wall|machine|weapon|mirror)\b/.test(s) || /\blike\s+a\b/.test(s)) return result('metaphor_or_analogy', 0.74, ['domain_transfer_or_comparison_marker']);
    if (/\b(bank|seal|charge|light|right)\b/.test(s)) return result('ambiguity_polysemy', 0.65, ['polysemy_marker']);
    if (/\b(this|that|here|there|now|tomorrow|yesterday|i|you|it)\b/.test(s)) return result('deixis_indexicality', 0.62, ['indexical_or_context_anchor_marker']);
    if (/\b(all|some|none|many|few|every|only|at least|at most)\b/.test(s)) return result('scope_quantifier', 0.8, ['quantifier_marker']);
    if (/\b(may|might|could|possibly|likely|uncertain)\b/.test(s)) return result('modality_possibility', 0.76, ['possibility_modal_marker']);
    if (/\b(must|required|necessary|cannot avoid)\b/.test(s)) return result('modality_necessity', 0.78, ['necessity_modal_marker']);
    if (/\b(if|unless|when)\b/.test(s)) return result('conditional_relation', 0.8, ['conditional_marker']);
    if (/\b(not|never|no|without|lack|absent)\b/.test(s)) return result('negation', 0.82, ['negation_marker']);
    if (/\b(more|less|better|worse|same|different|than)\b/.test(s)) return result('comparison', 0.78, ['comparison_marker']);
    if (/\b(means|defined as|refers to|is a|is an)\b/.test(s)) return result('identity_definition', 0.72, ['definition_or_identity_marker']);
    if (/\b(allowed|forbidden|permitted|should)\b/.test(s)) return result('obligation_permission', 0.72, ['normative_marker']);
    if (/\b(can|cannot|able|capable)\b/.test(s)) return result('ability_capacity', 0.72, ['capacity_marker']);
    if (/\b(before|after|during|while|then|until)\b/.test(s)) return result('temporal_relation', 0.76, ['temporal_marker']);
    if (/\b(because|caused by|led to|due to|resulted in)\b/.test(s)) return result('causal_relation', 0.8, ['causal_marker']);
    if (/\b(shows|indicates|according to|based on|evidence suggests)\b/.test(s)) return result('evidence_marker', 0.78, ['evidence_marker']);
    if (/\?$/.test(raw)) return result('question_request', 0.72, ['question_mark']);
    if (/^(close|open|stop|start|check|inspect|record|log)\b/.test(s)) return result('command_directive', 0.68, ['imperative_candidate']);
    if (/\b(says|said|quoted|transcript|note says)\b/.test(s)) return result('quotation_report', 0.72, ['reported_speech_marker']);
    return result('unknown_pattern_hold_for_admission', 0.35, ['no_specific_detector_matched', 'hold_for_admission_without_faking_meaning']);
  }

  function validateCoverageRecord(row) {
    const errors = [];
    if (!text(row && row.coverage_id)) errors.push('missing_coverage_id');
    if (!text(row && row.coverage_family)) errors.push('missing_coverage_family');
    if (!text(row && row.language_phenomenon)) errors.push('missing_language_phenomenon');
    if (!text(row && row.abstract_detector)) errors.push('missing_abstract_detector');
    if (row && row.intention_type !== 1) errors.push('intention_type_not_1');
    if (row && row.local_concept_shape_l1 !== 1) errors.push(`local_concept_shape_l1_not_1:${row.local_concept_shape_l1}`);
    if (row && row.force_kept_outside_shape !== true) errors.push('force_not_outside_shape');
    if (row && row.dictionary_population_required !== false) errors.push('dictionary_population_required');
    if (row && row.exact_instance_population_required !== false) errors.push('exact_instance_population_required');
    if (!row || !row.detail_learning_policy || row.detail_learning_policy.class_detection_without_dictionary_population !== true) errors.push('detail_policy_missing_class_detection');
    if (!row || !row.detail_learning_policy || row.detail_learning_policy.learn_detail_only_when_accuracy_requires_it !== true) errors.push('detail_policy_missing_needed_learning');
    if (asArray(row && row.output_relation_candidates).length < 1) errors.push('output_relation_candidates_missing');
    if (asArray(row && row.required_context_or_detail).length < 1) errors.push('required_context_or_detail_missing');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    if (!row || !row.active_guards || row.active_guards.coverage_expansion_is_meta_grammar_not_dictionary_population !== true) errors.push('meta_grammar_guard_missing');
    if (!row || !row.active_guards || row.active_guards.meaning_class_known_before_all_instances_known !== true) errors.push('class_before_instances_guard_missing');
    if (!row || !row.active_guards || row.active_guards.no_fake_specific_meaning !== true) errors.push('no_fake_specific_meaning_guard_missing');
    if (!row || !row.active_guards || row.active_guards.local_concept_shape_l1_equals_1 !== true) errors.push('l1_guard_missing');
    if (row && row.rollback_available !== true || !row || !row.rollback_snapshot) errors.push('rollback_missing');
    if (asArray(row && row.revision_trail).length < 1) errors.push('revision_trail_missing');
    if (asArray(row && row.revision_trail).some(v => v.silent_mutation !== false)) errors.push('silent_mutation_present');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      coverage_id: text(row && row.coverage_id),
      ok: errors.length === 0,
      errors,
      coverage_family: text(row && row.coverage_family),
      local_concept_shape_l1: row && row.local_concept_shape_l1,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.coverage_records);
    const validations = records.map(validateCoverageRecord);
    const families = new Set(records.map(row => row.coverage_family));
    const errors = [];
    if (packet && packet.source_relation_stress_ok !== true) errors.push('source_relation_stress_not_ok');
    if (packet && packet.source_relation_stress_patch_version !== '0.1.1') errors.push(`source_relation_stress_patch_not_0_1_1:${packet.source_relation_stress_patch_version}`);
    if (packet && packet.source_relation_stress_records !== 16) errors.push(`source_relation_stress_records_not_16:${packet.source_relation_stress_records}`);
    if (records.length < 20) errors.push(`coverage_record_count_below_20:${records.length}`);
    if (families.size < 20) errors.push(`coverage_family_count_below_20:${families.size}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.coverage_id}:${row.errors.join('|')}`); });
    const requiredFamilies = ['literal_statement', 'idiom_or_fixed_expression', 'sarcasm_or_irony', 'metaphor_or_analogy', 'ambiguity_polysemy', 'deixis_indexicality', 'scope_quantifier', 'modality_possibility', 'modality_necessity', 'conditional_relation', 'negation', 'comparison', 'identity_definition', 'obligation_permission', 'ability_capacity', 'temporal_relation', 'causal_relation', 'evidence_marker', 'question_request', 'command_directive', 'quotation_report', 'unknown_pattern_hold_for_admission'];
    const sampleChecks = {
      idiom: classifyLanguagePhenomenon('That plan is up in the air.').coverage_family_candidate === 'idiom_or_fixed_expression',
      sarcasm: classifyLanguagePhenomenon('Great, another delay.').coverage_family_candidate === 'sarcasm_or_irony',
      metaphor: classifyLanguagePhenomenon('The queue is a bottleneck.').coverage_family_candidate === 'metaphor_or_analogy',
      unknown: classifyLanguagePhenomenon('Zorp flindle makes the bracket hum.').coverage_family_candidate === 'unknown_pattern_hold_for_admission'
    };
    const checks = {
      source_relation_stress_ready: packet && packet.source_relation_stress_ok === true,
      source_relation_stress_patch_0_1_1: packet && packet.source_relation_stress_patch_version === '0.1.1',
      source_relation_stress_records_16: packet && packet.source_relation_stress_records === 16,
      coverage_records_at_least_20: records.length >= 20,
      coverage_families_at_least_20: families.size >= 20,
      required_language_phenomena_present: requiredFamilies.every(family => families.has(family)),
      meta_grammar_not_dictionary: records.every(row => row.dictionary_population_required === false && row.exact_instance_population_required === false),
      class_detection_without_exact_population: records.every(row => row.detail_learning_policy && row.detail_learning_policy.class_detection_without_dictionary_population === true),
      learn_details_only_when_needed: records.every(row => row.detail_learning_policy && row.detail_learning_policy.learn_detail_only_when_accuracy_requires_it === true),
      idiom_sarcasm_metaphor_unknown_classified_without_exact_meaning: sampleChecks.idiom && sampleChecks.sarcasm && sampleChecks.metaphor && sampleChecks.unknown,
      unknown_pattern_hold_visible: records.some(row => row.coverage_family === 'unknown_pattern_hold_for_admission' && asArray(row.unresolved_items).includes('unknown_specific_meaning_must_not_be_faked')),
      local_l1_preserved_for_all: records.every(row => row.local_concept_shape_l1 === 1 && row.active_guards && row.active_guards.local_concept_shape_l1_equals_1 === true),
      force_outside_shape_for_all: records.every(row => row.force_kept_outside_shape === true && row.force_intensity === 0),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      revision_trail_present_for_all: records.every(row => asArray(row.revision_trail).length >= 1),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.coverage_expansion_is_final_truth_authority === false && records.every(row => row.final_authority === false),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_external_or_media_lookup: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_coverage_expansion_library_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      sample_classifications: sampleChecks,
      coverage_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runCoverageExpansionLibrary(options = {}) {
    const sourcePacket = options.relation_stress_packet || relationStressApi().runRelationStressBenchmark(options.relation_stress_options || {});
    const specs = asArray(options.coverage_specs || sampleCoverageSpecs());
    const records = makeCoverageRecords(specs, sourcePacket);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'General language coverage layer. Classifies language phenomena without populating every word or faking exact meanings.',
      source_relation_stress_ok: sourcePacket && sourcePacket.ok === true,
      source_relation_stress_version: text(sourcePacket && sourcePacket.packet_version),
      source_relation_stress_patch_version: text(sourcePacket && sourcePacket.patch_version),
      source_relation_stress_records: Number(sourcePacket && sourcePacket.relation_stress_record_count) || 0,
      source_relation_stress_families: Number(sourcePacket && sourcePacket.relation_stress_family_count) || 0,
      coverage_record_count: records.length,
      coverage_family_count: new Set(records.map(row => row.coverage_family)).size,
      coverage_records: records,
      family_counts: familyCounts(records),
      doctrine: doctrine(),
      coverage_expansion_is_final_truth_authority: false,
      adjudicates_final_truth: false,
      external_lookup_performed: false,
      media_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelCoverageExpansionLibraryV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    COVERAGE_SPECS,
    sampleCoverageSpecs,
    detailPolicyFor,
    unresolvedItemsFor,
    makeCoverageRecord,
    makeCoverageRecords,
    familyCounts,
    classifyLanguagePhenomenon,
    validateCoverageRecord,
    validatePacket,
    runCoverageExpansionLibrary
  });
})(typeof window !== 'undefined' ? window : globalThis);
