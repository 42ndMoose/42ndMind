/* 42ndMind Deterministic Packet Ingestion Form v0.1
 * Converts human-entered structured inputs into candidate packets without an LLM.
 * This feeds the kernel while preserving source/media/evidence separation, coverage-class holds,
 * relation candidates, rollback, and no final truth promotion.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_deterministic_packet_ingestion_form_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'packet'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }

  function coverageStressApi() {
    if (!global.KernelCoverageStressBenchmarkV01) throw new Error('KernelCoverageStressBenchmarkV01 unavailable');
    return global.KernelCoverageStressBenchmarkV01;
  }
  function coverageApi() {
    if (!global.KernelCoverageExpansionLibraryV01) throw new Error('KernelCoverageExpansionLibraryV01 unavailable');
    return global.KernelCoverageExpansionLibraryV01;
  }

  function doctrine() {
    return {
      deterministic_human_packet_ingestion_without_llm: true,
      human_input_is_context_not_automatic_truth: true,
      structured_packet_is_candidate_not_truth: true,
      source_reference_is_anchor_not_lookup: true,
      media_description_is_context_not_media_verification: true,
      evidence_description_is_claim_not_evidence_verification: true,
      claim_text_is_candidate_not_truth: true,
      relation_text_is_candidate_not_truth: true,
      adversarial_reframe_is_pressure_not_truth: true,
      coverage_classification_is_not_exact_meaning: true,
      unknown_specifics_hold_for_admission_when_needed: true,
      packet_separation_required: true,
      dossier_material_enters_as_structured_context_packets: true,
      no_final_truth_promotion: true,
      no_belief_movement: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      rollback_required_for_every_ingestion_packet: true,
      no_silent_mutation: true,
      belief_movement: 'none'
    };
  }

  const PACKET_TYPES = [
    'claim_candidate',
    'source_reference',
    'evidence_description',
    'media_description',
    'quote_fragment',
    'context_note',
    'adversarial_reframe',
    'relation_candidate',
    'coverage_hold',
    'dossier_summary_packet'
  ];

  function sampleHumanInputs() {
    return [
      { input_id: 'human_input_claim_001', packet_type: 'claim_candidate', title: 'Synthetic claim candidate', content: 'Some containers are sealed.', source_label: 'human structured entry', target_claim_id: 'claim_synthetic_containers_sealed', relation_family: '', confidence_note: 'human context only', tags: ['synthetic', 'claim'] },
      { input_id: 'human_input_source_001', packet_type: 'source_reference', title: 'Synthetic source reference', content: 'Source A is described as the origin of the claim.', source_label: 'Source A', target_claim_id: 'claim_synthetic_containers_sealed', relation_family: 'source_reports', confidence_note: 'reference only, not lookup', tags: ['synthetic', 'source'] },
      { input_id: 'human_input_evidence_001', packet_type: 'evidence_description', title: 'Synthetic evidence description', content: 'A log is described as indicating a temperature drop.', source_label: 'Log description', target_claim_id: 'claim_synthetic_temperature_drop', relation_family: 'supports', confidence_note: 'evidence described, not verified', tags: ['synthetic', 'evidence'] },
      { input_id: 'human_input_media_001', packet_type: 'media_description', title: 'Synthetic media description', content: 'A screenshot is described as showing a warning banner.', source_label: 'Screenshot description', target_claim_id: 'claim_synthetic_warning_banner', relation_family: 'media_describes', confidence_note: 'media not verified', tags: ['synthetic', 'media'] },
      { input_id: 'human_input_quote_001', packet_type: 'quote_fragment', title: 'Synthetic quote fragment', content: 'Quote fragment: "the valve is not open".', source_label: 'Quote fragment only', target_claim_id: 'claim_synthetic_valve_state', relation_family: 'clips_quote', confidence_note: 'context required', tags: ['synthetic', 'quote'] },
      { input_id: 'human_input_context_001', packet_type: 'context_note', title: 'Synthetic context note', content: 'The statement may depend on where "there" refers.', source_label: 'human context note', target_claim_id: 'claim_synthetic_deictic_target', relation_family: 'contextualizes', confidence_note: 'context only', tags: ['synthetic', 'context'] },
      { input_id: 'human_input_reframe_001', packet_type: 'adversarial_reframe', title: 'Synthetic hostile reframe', content: 'A reframe tries to turn "some" into "all".', source_label: 'reframe report', target_claim_id: 'claim_synthetic_scope', relation_family: 'injects_quantifier', confidence_note: 'pressure not truth', tags: ['synthetic', 'adversarial'] },
      { input_id: 'human_input_relation_001', packet_type: 'relation_candidate', title: 'Synthetic relation candidate', content: 'The alarm sounded because pressure rose.', source_label: 'human relation entry', target_claim_id: 'claim_synthetic_alarm_pressure', relation_family: 'causes_or_contributes_to', confidence_note: 'causal bridge required', tags: ['synthetic', 'relation'] },
      { input_id: 'human_input_hold_001', packet_type: 'coverage_hold', title: 'Synthetic unknown phrase hold', content: 'Zorp flindle makes the bracket hum.', source_label: 'unknown phrase', target_claim_id: 'claim_synthetic_unknown_phrase', relation_family: '', confidence_note: 'unknown meaning must not be faked', tags: ['synthetic', 'coverage_hold'] },
      { input_id: 'human_input_dossier_001', packet_type: 'dossier_summary_packet', title: 'Synthetic dossier summary', content: 'A dossier section summarizes a claim, source note, evidence description, and unresolved gap.', source_label: 'dossier section description', target_claim_id: 'claim_synthetic_dossier_summary', relation_family: 'contextualizes', confidence_note: 'dossier material enters as packet, not truth', tags: ['synthetic', 'dossier'] }
    ];
  }

  function separationGuardsFor(packetType) {
    const guards = {
      packet_is_candidate_not_truth: true,
      no_final_truth_promotion: true,
      belief_movement_none: true
    };
    if (packetType === 'source_reference') guards.source_reference_is_anchor_not_lookup = true;
    if (packetType === 'evidence_description') guards.evidence_description_is_claim_not_evidence_verification = true;
    if (packetType === 'media_description') guards.media_description_is_context_not_media_verification = true;
    if (packetType === 'quote_fragment') guards.quote_fragment_requires_context = true;
    if (packetType === 'adversarial_reframe') guards.adversarial_reframe_is_pressure_not_truth = true;
    if (packetType === 'relation_candidate') guards.relation_text_is_candidate_not_truth = true;
    if (packetType === 'coverage_hold') guards.unknown_specifics_hold_for_admission_when_needed = true;
    if (packetType === 'dossier_summary_packet') guards.dossier_material_enters_as_structured_context_packets = true;
    if (packetType === 'claim_candidate') guards.claim_text_is_candidate_not_truth = true;
    if (packetType === 'context_note') guards.human_input_is_context_not_automatic_truth = true;
    return guards;
  }

  function unresolvedItemsFor(input, classification) {
    const packetType = text(input && input.packet_type);
    const items = [
      `packet_type:${packetType}`,
      'human_input_is_context_not_automatic_truth',
      'packet_status:candidate_not_truth',
      'truth_status:not_adjudicated'
    ];
    if (classification && classification.coverage_family_candidate) items.push(`coverage_family_candidate:${classification.coverage_family_candidate}`);
    if (classification && classification.admission_required_for_exact_new_meaning) items.push('exact_meaning_requires_context_or_admission');
    if (packetType === 'source_reference') items.push('source_reference_is_anchor_not_lookup');
    if (packetType === 'evidence_description') items.push('evidence_description_not_verified_evidence');
    if (packetType === 'media_description') items.push('media_description_not_media_verification');
    if (packetType === 'quote_fragment') items.push('quote_context_required');
    if (packetType === 'adversarial_reframe') items.push('hostile_reframe_is_pressure_not_truth');
    if (packetType === 'relation_candidate') items.push('relation_candidate_requires_bridge_or_support');
    if (packetType === 'coverage_hold') items.push('unknown_specific_meaning_must_not_be_faked');
    if (packetType === 'dossier_summary_packet') items.push('dossier_summary_is_not_truth_promotion');
    return unique(items);
  }

  function makeIngestionPacket(input, sourceCoverageStressPacket, index) {
    const packetType = PACKET_TYPES.includes(text(input && input.packet_type)) ? text(input.packet_type) : 'context_note';
    const content = text(input && input.content);
    const classification = coverageApi().classifyLanguagePhenomenon(content);
    const packetId = `ingest_${String(index + 1).padStart(2, '0')}__${safeId(packetType)}__${safeId(input && input.input_id)}`;
    const guards = Object.assign({
      deterministic_human_packet_ingestion_without_llm: true,
      packet_separation_required: true,
      coverage_classification_is_not_exact_meaning: true,
      no_silent_mutation: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      rollback_available: true
    }, separationGuardsFor(packetType));
    return {
      ingestion_packet_id: packetId,
      input_id: text(input && input.input_id) || packetId,
      packet_type: packetType,
      title: text(input && input.title),
      content,
      source_label: text(input && input.source_label),
      target_claim_id: text(input && input.target_claim_id),
      relation_family_candidate: text(input && input.relation_family),
      confidence_note: text(input && input.confidence_note),
      tags: asArray(input && input.tags).map(text).filter(Boolean),
      coverage_classification_snapshot: classification,
      coverage_family_candidate: text(classification && classification.coverage_family_candidate),
      exact_meaning_claimed: false,
      source_lookup_performed: false,
      media_lookup_performed: false,
      external_lookup_performed: false,
      llm_used: false,
      source_coverage_stress_snapshot: {
        source_coverage_stress_ok: !!(sourceCoverageStressPacket && sourceCoverageStressPacket.ok),
        source_coverage_stress_version: text(sourceCoverageStressPacket && sourceCoverageStressPacket.packet_version),
        source_coverage_stress_records: Number(sourceCoverageStressPacket && sourceCoverageStressPacket.coverage_stress_record_count) || 0,
        source_coverage_stress_families: Number(sourceCoverageStressPacket && sourceCoverageStressPacket.coverage_stress_family_count) || 0,
        source_final_authority: !!(sourceCoverageStressPacket && sourceCoverageStressPacket.coverage_stress_benchmark_is_final_truth_authority)
      },
      unresolved_items: unresolvedItemsFor(Object.assign({}, input, { packet_type: packetType }), classification),
      active_guards: guards,
      rollback_available: true,
      rollback_snapshot: {
        raw_human_input: clone(input),
        classification_snapshot: clone(classification),
        source_coverage_stress_summary: sourceCoverageStressPacket ? {
          ok: sourceCoverageStressPacket.ok,
          packet_version: sourceCoverageStressPacket.packet_version,
          coverage_stress_record_count: sourceCoverageStressPacket.coverage_stress_record_count,
          coverage_stress_family_count: sourceCoverageStressPacket.coverage_stress_family_count
        } : null,
        rollback_reason: 'remove_ingestion_packet_without_mutating_source_text_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${packetId}_v0001_candidate`,
          source_type: 'deterministic_human_packet_ingestion',
          created_at: now(),
          mutation_type: 'initial_ingestion_packet',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ],
      packet_status: 'candidate_packet_not_truth',
      truth_status: 'not_adjudicated',
      final_authority: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function makeIngestionPackets(inputs, sourceCoverageStressPacket) {
    return asArray(inputs).map((input, index) => makeIngestionPacket(input, sourceCoverageStressPacket, index));
  }

  function packetTypeCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.packet_type] = (acc[row.packet_type] || 0) + 1;
      return acc;
    }, {});
  }

  function coverageFamilyCounts(records) {
    return asArray(records).reduce((acc, row) => {
      acc[row.coverage_family_candidate] = (acc[row.coverage_family_candidate] || 0) + 1;
      return acc;
    }, {});
  }

  function validateIngestionPacket(row) {
    const errors = [];
    if (!text(row && row.ingestion_packet_id)) errors.push('missing_ingestion_packet_id');
    if (!PACKET_TYPES.includes(text(row && row.packet_type))) errors.push(`invalid_packet_type:${row && row.packet_type}`);
    if (!text(row && row.content)) errors.push('missing_content');
    if (!row || !row.coverage_classification_snapshot) errors.push('coverage_classification_missing');
    if (!text(row && row.coverage_family_candidate)) errors.push('coverage_family_candidate_missing');
    if (row && row.exact_meaning_claimed !== false) errors.push('exact_meaning_claimed');
    if (row && row.packet_status !== 'candidate_packet_not_truth') errors.push('packet_status_not_candidate');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
    if (row && row.source_lookup_performed !== false) errors.push('source_lookup_performed');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    if (!row || !row.active_guards || row.active_guards.deterministic_human_packet_ingestion_without_llm !== true) errors.push('deterministic_guard_missing');
    if (!row || !row.active_guards || row.active_guards.packet_separation_required !== true) errors.push('separation_guard_missing');
    if (!row || !row.active_guards || row.active_guards.no_llm !== true) errors.push('no_llm_guard_missing');
    if (!row || !row.active_guards || row.active_guards.no_external_lookup !== true) errors.push('no_lookup_guard_missing');
    if (row && row.packet_type === 'source_reference' && (!row.active_guards || row.active_guards.source_reference_is_anchor_not_lookup !== true)) errors.push('source_anchor_guard_missing');
    if (row && row.packet_type === 'evidence_description' && (!row.active_guards || row.active_guards.evidence_description_is_claim_not_evidence_verification !== true)) errors.push('evidence_separation_guard_missing');
    if (row && row.packet_type === 'media_description' && (!row.active_guards || row.active_guards.media_description_is_context_not_media_verification !== true)) errors.push('media_separation_guard_missing');
    if (row && row.packet_type === 'adversarial_reframe' && (!row.active_guards || row.active_guards.adversarial_reframe_is_pressure_not_truth !== true)) errors.push('adversarial_guard_missing');
    if (row && row.packet_type === 'coverage_hold' && (!row.active_guards || row.active_guards.unknown_specifics_hold_for_admission_when_needed !== true)) errors.push('coverage_hold_guard_missing');
    if (row && row.rollback_available !== true || !row || !row.rollback_snapshot) errors.push('rollback_missing');
    if (asArray(row && row.revision_trail).length < 1) errors.push('revision_trail_missing');
    if (asArray(row && row.revision_trail).some(v => v.silent_mutation !== false)) errors.push('silent_mutation_present');
    return {
      ingestion_packet_id: text(row && row.ingestion_packet_id),
      ok: errors.length === 0,
      errors,
      packet_type: text(row && row.packet_type),
      coverage_family_candidate: text(row && row.coverage_family_candidate),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const records = asArray(packet && packet.ingestion_packets);
    const validations = records.map(validateIngestionPacket);
    const types = new Set(records.map(row => row.packet_type));
    const unresolved = records.flatMap(row => asArray(row.unresolved_items));
    const errors = [];
    if (packet && packet.source_coverage_stress_ok !== true) errors.push('source_coverage_stress_not_ok');
    if (packet && packet.source_coverage_stress_records !== 16) errors.push(`source_coverage_stress_records_not_16:${packet.source_coverage_stress_records}`);
    if (records.length < 10) errors.push(`ingestion_packet_count_below_10:${records.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.ingestion_packet_id}:${row.errors.join('|')}`); });
    const checks = {
      source_coverage_stress_ready: packet && packet.source_coverage_stress_ok === true,
      source_coverage_stress_records_16: packet && packet.source_coverage_stress_records === 16,
      ingestion_packets_at_least_10: records.length >= 10,
      all_records_valid: validations.every(row => row.ok),
      required_packet_types_present: PACKET_TYPES.every(type => types.has(type)),
      source_media_evidence_separation_visible: unresolved.includes('source_reference_is_anchor_not_lookup') && unresolved.includes('evidence_description_not_verified_evidence') && unresolved.includes('media_description_not_media_verification'),
      adversarial_reframe_pressure_visible: unresolved.includes('hostile_reframe_is_pressure_not_truth'),
      coverage_hold_visible: unresolved.includes('unknown_specific_meaning_must_not_be_faked'),
      dossier_packet_not_truth_visible: unresolved.includes('dossier_summary_is_not_truth_promotion'),
      coverage_classification_present_for_all: records.every(row => !!row.coverage_classification_snapshot && !!row.coverage_family_candidate),
      exact_meaning_not_claimed_for_all: records.every(row => row.exact_meaning_claimed === false),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_lookup_used: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false && row.source_lookup_performed === false),
      candidate_only_not_promoted: records.every(row => row.packet_status === 'candidate_packet_not_truth' && row.truth_status === 'not_adjudicated' && row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      revision_trail_present_for_all: records.every(row => asArray(row.revision_trail).length >= 1),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.deterministic_packet_ingestion_is_final_truth_authority === false && records.every(row => row.final_authority === false),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_deterministic_packet_ingestion_form_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      ingestion_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runDeterministicPacketIngestion(options = {}) {
    const sourcePacket = options.coverage_stress_packet || coverageStressApi().runCoverageStressBenchmark(options.coverage_stress_options || {});
    const inputs = asArray(options.human_inputs || sampleHumanInputs());
    const records = makeIngestionPackets(inputs, sourcePacket);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Deterministic human packet ingestion. Converts structured entries into candidate packets without LLM or lookup.',
      source_coverage_stress_ok: sourcePacket && sourcePacket.ok === true,
      source_coverage_stress_version: text(sourcePacket && sourcePacket.packet_version),
      source_coverage_stress_records: Number(sourcePacket && sourcePacket.coverage_stress_record_count) || 0,
      source_coverage_stress_families: Number(sourcePacket && sourcePacket.coverage_stress_family_count) || 0,
      ingestion_packet_count: records.length,
      packet_type_count: new Set(records.map(row => row.packet_type)).size,
      ingestion_packets: records,
      packet_type_counts: packetTypeCounts(records),
      coverage_family_counts: coverageFamilyCounts(records),
      doctrine: doctrine(),
      deterministic_packet_ingestion_is_final_truth_authority: false,
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

  global.KernelDeterministicPacketIngestionFormV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    PACKET_TYPES,
    doctrine,
    sampleHumanInputs,
    separationGuardsFor,
    unresolvedItemsFor,
    makeIngestionPacket,
    makeIngestionPackets,
    packetTypeCounts,
    coverageFamilyCounts,
    validateIngestionPacket,
    validatePacket,
    runDeterministicPacketIngestion
  });
})(typeof window !== 'undefined' ? window : globalThis);
