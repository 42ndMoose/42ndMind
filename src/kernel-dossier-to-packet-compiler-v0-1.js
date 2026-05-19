/* 42ndMind Dossier-to-Packet Compiler v0.1
 * Converts structured dossier-style sections into deterministic ingestion packets.
 * It does not believe the dossier. It preserves candidate-only discipline, source/media/evidence separation,
 * adversarial warnings, unresolved gaps, rollback, and no LLM/lookup dependency.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_dossier_to_packet_compiler_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'dossier'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }

  function ingestionApi() {
    if (!global.KernelDeterministicPacketIngestionFormV01) throw new Error('KernelDeterministicPacketIngestionFormV01 unavailable');
    return global.KernelDeterministicPacketIngestionFormV01;
  }

  function doctrine() {
    return {
      dossier_compilation_is_not_truth_promotion: true,
      dossier_material_enters_as_structured_context_packets: true,
      dossier_claims_are_candidate_claims_not_truth: true,
      dossier_sources_are_anchors_not_lookup: true,
      dossier_evidence_descriptions_are_claims_not_verification: true,
      dossier_media_descriptions_are_context_not_verification: true,
      quote_fragments_require_context: true,
      adversarial_reframes_are_pressure_not_truth: true,
      unresolved_gaps_stay_visible: true,
      compiled_packets_remain_candidate_not_truth: true,
      deterministic_ingestion_required: true,
      no_final_truth_promotion: true,
      no_belief_movement: true,
      no_llm: true,
      no_external_lookup: true,
      no_media_lookup: true,
      no_real_people_or_events_as_builtins: true,
      no_political_specific_builtins: true,
      rollback_required_for_every_compiled_dossier: true,
      no_silent_mutation: true,
      belief_movement: 'none'
    };
  }

  function sampleDossierSections() {
    return [
      {
        section_id: 'dossier_section_synthetic_001',
        title: 'Synthetic process-integrity section',
        summary: 'A synthetic dossier section describes a claim, source note, evidence description, media description, quote fragment, context note, hostile reframe, relation, and unresolved gap.',
        claims: ['Some containers are sealed.', 'The door may be locked.'],
        sources: ['Source A is described as reporting the container claim.'],
        evidence: ['A log is described as indicating a temperature drop.'],
        media: ['A screenshot is described as showing a warning banner.'],
        quotes: ['Quote fragment: "the valve is not open".'],
        context: ['The statement may depend on where "there" refers.'],
        reframes: ['A hostile reframe tries to turn "some" into "all".'],
        relations: ['The alarm sounded because pressure rose.'],
        unresolved: ['The causal bridge has not been verified.', 'The screenshot is described but not verified.'],
        tags: ['synthetic', 'dossier']
      },
      {
        section_id: 'dossier_section_synthetic_002',
        title: 'Synthetic ambiguity section',
        summary: 'A synthetic dossier section records ambiguity and unknown phrase holds without fake exact meaning.',
        claims: ['The bank is nearby.'],
        sources: ['Source B is described as a secondary reference.'],
        evidence: ['A note says the seal is broken.'],
        media: [],
        quotes: ['Quote fragment: "up in the air".'],
        context: ['That plan is up in the air.'],
        reframes: ['A reframe treats an idiom as a literal object in the sky.'],
        relations: ['The queue is a bottleneck.'],
        unresolved: ['The exact meaning of the unknown phrase must not be faked.'],
        tags: ['synthetic', 'ambiguity']
      }
    ];
  }

  function parseLinePrefixDossier(rawText, options = {}) {
    const section = {
      section_id: text(options.section_id) || `line_prefix_section_${String(Date.now())}`,
      title: text(options.title) || 'Line-prefix dossier section',
      summary: '',
      claims: [],
      sources: [],
      evidence: [],
      media: [],
      quotes: [],
      context: [],
      reframes: [],
      relations: [],
      unresolved: [],
      tags: ['line_prefix']
    };
    text(rawText).split(/\r?\n/).forEach(line => {
      const trimmed = text(line);
      if (!trimmed) return;
      const match = trimmed.match(/^([A-Z_ ]{3,20})\s*:\s*(.*)$/);
      if (!match) {
        section.context.push(trimmed);
        return;
      }
      const key = lower(match[1]).replace(/\s+/g, '_');
      const value = text(match[2]);
      if (!value) return;
      if (key === 'title') section.title = value;
      else if (key === 'summary') section.summary = value;
      else if (key === 'claim') section.claims.push(value);
      else if (key === 'source') section.sources.push(value);
      else if (key === 'evidence') section.evidence.push(value);
      else if (key === 'media') section.media.push(value);
      else if (key === 'quote') section.quotes.push(value);
      else if (key === 'context') section.context.push(value);
      else if (key === 'reframe') section.reframes.push(value);
      else if (key === 'relation') section.relations.push(value);
      else if (key === 'unresolved') section.unresolved.push(value);
      else section.context.push(trimmed);
    });
    return section;
  }

  function makeInput(section, packetType, content, index, detail = {}) {
    const sectionId = text(section && section.section_id) || 'dossier_section';
    return {
      input_id: `${safeId(sectionId)}_${packetType}_${String(index + 1).padStart(2, '0')}`,
      packet_type: packetType,
      title: detail.title || `${text(section && section.title) || sectionId} / ${packetType}`,
      content: text(content),
      source_label: detail.source_label || text(section && section.title) || sectionId,
      target_claim_id: detail.target_claim_id || `${safeId(sectionId)}_claim`,
      relation_family: detail.relation_family || '',
      confidence_note: detail.confidence_note || 'compiled from dossier section as candidate context, not truth',
      tags: unique(asArray(section && section.tags).concat(['compiled_dossier', packetType]))
    };
  }

  function sectionToHumanInputs(section) {
    const inputs = [];
    const sectionId = text(section && section.section_id) || 'dossier_section';
    const sectionTitle = text(section && section.title) || sectionId;
    if (text(section && section.summary)) {
      inputs.push(makeInput(section, 'dossier_summary_packet', section.summary, inputs.length, {
        target_claim_id: `${safeId(sectionId)}_summary`,
        relation_family: 'contextualizes',
        confidence_note: 'dossier summary packet, not truth promotion'
      }));
    }
    asArray(section && section.claims).forEach(item => inputs.push(makeInput(section, 'claim_candidate', item, inputs.length, {
      target_claim_id: `${safeId(sectionId)}_claim_${inputs.length + 1}`,
      confidence_note: 'dossier claim candidate, not truth'
    })));
    asArray(section && section.sources).forEach(item => inputs.push(makeInput(section, 'source_reference', item, inputs.length, {
      source_label: sectionTitle,
      target_claim_id: `${safeId(sectionId)}_source_anchor`,
      relation_family: 'source_reports',
      confidence_note: 'source reference is anchor, not lookup'
    })));
    asArray(section && section.evidence).forEach(item => inputs.push(makeInput(section, 'evidence_description', item, inputs.length, {
      target_claim_id: `${safeId(sectionId)}_evidence_claim`,
      relation_family: 'supports',
      confidence_note: 'evidence description is claim, not verification'
    })));
    asArray(section && section.media).forEach(item => inputs.push(makeInput(section, 'media_description', item, inputs.length, {
      target_claim_id: `${safeId(sectionId)}_media_claim`,
      relation_family: 'media_describes',
      confidence_note: 'media description is context, not verification'
    })));
    asArray(section && section.quotes).forEach(item => inputs.push(makeInput(section, 'quote_fragment', item, inputs.length, {
      target_claim_id: `${safeId(sectionId)}_quote_context`,
      relation_family: 'clips_quote',
      confidence_note: 'quote fragment requires context'
    })));
    asArray(section && section.context).forEach(item => inputs.push(makeInput(section, 'context_note', item, inputs.length, {
      target_claim_id: `${safeId(sectionId)}_context`,
      relation_family: 'contextualizes',
      confidence_note: 'context note, not truth'
    })));
    asArray(section && section.reframes).forEach(item => inputs.push(makeInput(section, 'adversarial_reframe', item, inputs.length, {
      target_claim_id: `${safeId(sectionId)}_reframe`,
      relation_family: 'injects_quantifier',
      confidence_note: 'adversarial reframe is pressure, not truth'
    })));
    asArray(section && section.relations).forEach(item => inputs.push(makeInput(section, 'relation_candidate', item, inputs.length, {
      target_claim_id: `${safeId(sectionId)}_relation`,
      relation_family: 'causes_or_contributes_to',
      confidence_note: 'relation candidate, bridge required if causal truth is claimed'
    })));
    asArray(section && section.unresolved).forEach(item => inputs.push(makeInput(section, 'coverage_hold', item, inputs.length, {
      target_claim_id: `${safeId(sectionId)}_unresolved`,
      relation_family: 'leaves_unresolved',
      confidence_note: 'unresolved gap remains visible'
    })));
    return inputs;
  }

  function compileSectionsToInputs(sections) {
    return asArray(sections).flatMap(sectionToHumanInputs);
  }

  function expectedSeparationWarnings(sections) {
    const warnings = [];
    const any = field => asArray(sections).some(section => asArray(section && section[field]).length > 0);
    if (any('sources')) warnings.push('source_reference_is_anchor_not_lookup');
    if (any('evidence')) warnings.push('evidence_description_not_verified_evidence');
    if (any('media')) warnings.push('media_description_not_media_verification');
    if (any('quotes')) warnings.push('quote_fragment_requires_context');
    if (any('reframes')) warnings.push('adversarial_reframe_is_pressure_not_truth');
    if (any('relations')) warnings.push('relation_candidate_requires_bridge_or_support');
    if (any('unresolved')) warnings.push('unresolved_gaps_stay_visible');
    return warnings;
  }

  function compiledSectionSummaries(sections) {
    return asArray(sections).map(section => ({
      section_id: text(section && section.section_id),
      title: text(section && section.title),
      summary_present: !!text(section && section.summary),
      claims: asArray(section && section.claims).length,
      sources: asArray(section && section.sources).length,
      evidence: asArray(section && section.evidence).length,
      media: asArray(section && section.media).length,
      quotes: asArray(section && section.quotes).length,
      context: asArray(section && section.context).length,
      reframes: asArray(section && section.reframes).length,
      relations: asArray(section && section.relations).length,
      unresolved: asArray(section && section.unresolved).length
    }));
  }

  function validateCompiledPacket(row) {
    const errors = [];
    if (!text(row && row.ingestion_packet_id)) errors.push('missing_ingestion_packet_id');
    if (row && row.packet_status !== 'candidate_packet_not_truth') errors.push('packet_not_candidate');
    if (row && row.truth_status !== 'not_adjudicated') errors.push('truth_adjudicated');
    if (row && row.final_authority !== false) errors.push('final_authority_true');
    if (row && row.promotion_status !== 'not_promoted') errors.push('promoted');
    if (row && row.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (row && row.llm_used !== false) errors.push('llm_used');
    if (row && row.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (row && row.media_lookup_performed !== false) errors.push('media_lookup_performed');
    if (row && row.source_lookup_performed !== false) errors.push('source_lookup_performed');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
    if (!row || !row.rollback_available || !row.rollback_snapshot) errors.push('rollback_missing');
    if (asArray(row && row.revision_trail).some(v => v.silent_mutation !== false)) errors.push('silent_mutation_present');
    return { ingestion_packet_id: text(row && row.ingestion_packet_id), ok: errors.length === 0, errors, packet_type: text(row && row.packet_type), belief_movement: 'none' };
  }

  function validateCompilationPacket(packet) {
    const records = asArray(packet && packet.compiled_ingestion_packets);
    const validations = records.map(validateCompiledPacket);
    const types = new Set(records.map(row => row.packet_type));
    const unresolved = records.flatMap(row => asArray(row.unresolved_items));
    const errors = [];
    if (packet && packet.source_deterministic_ingestion_ok !== true) errors.push('source_deterministic_ingestion_not_ok');
    if (packet && packet.compiled_section_count < 1) errors.push('compiled_section_count_missing');
    if (packet && packet.compiled_input_count !== records.length) errors.push('compiled_input_count_mismatch');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.ingestion_packet_id}:${row.errors.join('|')}`); });
    const checks = {
      deterministic_ingestion_ready: packet && packet.source_deterministic_ingestion_ok === true,
      compiled_sections_present: packet && packet.compiled_section_count >= 1,
      compiled_inputs_match_packets: packet && packet.compiled_input_count === records.length,
      all_records_valid: validations.every(row => row.ok),
      dossier_summary_packet_present: types.has('dossier_summary_packet'),
      claim_source_evidence_media_quote_context_reframe_relation_unresolved_present: ['claim_candidate','source_reference','evidence_description','media_description','quote_fragment','context_note','adversarial_reframe','relation_candidate','coverage_hold'].every(type => types.has(type)),
      separation_warnings_visible: asArray(packet && packet.separation_warnings).includes('source_reference_is_anchor_not_lookup') && asArray(packet && packet.separation_warnings).includes('evidence_description_not_verified_evidence') && asArray(packet && packet.separation_warnings).includes('media_description_not_media_verification'),
      unresolved_gaps_visible: asArray(packet && packet.separation_warnings).includes('unresolved_gaps_stay_visible') && unresolved.includes('unknown_specific_meaning_must_not_be_faked'),
      adversarial_reframe_visible: asArray(packet && packet.separation_warnings).includes('adversarial_reframe_is_pressure_not_truth') && unresolved.includes('hostile_reframe_is_pressure_not_truth'),
      coverage_classification_present_for_all: records.every(row => !!row.coverage_classification_snapshot && !!row.coverage_family_candidate),
      no_truth_promotion: packet && packet.truth_status === 'not_adjudicated' && records.every(row => row.truth_status === 'not_adjudicated' && row.promotion_status === 'not_promoted'),
      no_llm_used: packet && packet.llm_used === false && records.every(row => row.llm_used === false),
      no_lookup_used: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && records.every(row => row.external_lookup_performed === false && row.media_lookup_performed === false && row.source_lookup_performed === false),
      rollback_available_for_all: records.every(row => row.rollback_available === true && !!row.rollback_snapshot),
      no_silent_mutation: records.every(row => asArray(row.revision_trail).every(v => v.silent_mutation === false)),
      final_authority_false: packet && packet.dossier_compiler_is_final_truth_authority === false && records.every(row => row.final_authority === false),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_dossier_to_packet_compiler_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      compiled_packet_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runDossierToPacketCompiler(options = {}) {
    const sections = asArray(options.dossier_sections || sampleDossierSections());
    const humanInputs = compileSectionsToInputs(sections);
    const ingestionPacket = ingestionApi().runDeterministicPacketIngestion({ human_inputs: humanInputs });
    const compiledPackets = asArray(ingestionPacket && ingestionPacket.ingestion_packets);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Dossier-to-packet compiler. Converts structured dossier sections into candidate ingestion packets without truth promotion.',
      compiled_section_count: sections.length,
      compiled_input_count: humanInputs.length,
      compiled_packet_count: compiledPackets.length,
      compiled_section_summaries: compiledSectionSummaries(sections),
      separation_warnings: expectedSeparationWarnings(sections),
      compiled_human_inputs: humanInputs,
      source_deterministic_ingestion_ok: ingestionPacket && ingestionPacket.ok === true,
      source_deterministic_ingestion_version: text(ingestionPacket && ingestionPacket.packet_version),
      source_ingestion_packet_count: Number(ingestionPacket && ingestionPacket.ingestion_packet_count) || 0,
      source_packet_type_count: Number(ingestionPacket && ingestionPacket.packet_type_count) || 0,
      compiled_ingestion_packets: compiledPackets,
      packet_type_counts: ingestionPacket ? clone(ingestionPacket.packet_type_counts) : {},
      coverage_family_counts: ingestionPacket ? clone(ingestionPacket.coverage_family_counts) : {},
      doctrine: doctrine(),
      dossier_compiler_is_final_truth_authority: false,
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
        source_sections: clone(sections),
        compiled_human_inputs: clone(humanInputs),
        rollback_reason: 'remove_compiled_dossier_packet_without_mutating_source_sections_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `dossier_to_packet_compiler_${VERSION.replace(/\./g, '_')}_v0001_candidate`,
          source_type: 'dossier_to_packet_compiler',
          created_at: now(),
          mutation_type: 'initial_compilation_packet',
          silent_mutation: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ]
    };
    packet.validation = validateCompilationPacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelDossierToPacketCompilerV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleDossierSections,
    parseLinePrefixDossier,
    makeInput,
    sectionToHumanInputs,
    compileSectionsToInputs,
    expectedSeparationWarnings,
    compiledSectionSummaries,
    validateCompiledPacket,
    validateCompilationPacket,
    runDossierToPacketCompiler
  });
})(typeof window !== 'undefined' ? window : globalThis);
