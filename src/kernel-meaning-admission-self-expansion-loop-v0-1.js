/* 42ndMind Meaning Admission / Self-Expansion Loop v0.1
 * Consumes raw messy language intake records and proposes candidate subdivisions / meaning additions.
 * This is controlled self-expansion: no silent canonical mutation, no truth promotion, no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_meaning_admission_self_expansion_loop_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'meaning_admission'; }
  function unique(values) { return Array.from(new Set(asArray(values).filter(Boolean))); }

  function rawApi() {
    if (!global.KernelRawMessyLanguageIntakeReceptorV01) throw new Error('KernelRawMessyLanguageIntakeReceptorV01 unavailable');
    return global.KernelRawMessyLanguageIntakeReceptorV01;
  }

  function doctrine() {
    return {
      meaning_admission_loop_is_candidate_self_expansion: true,
      self_expansion_is_not_silent_self_rewrite: true,
      growth_means_subdivision_not_mass_inflation: true,
      candidate_admission_is_not_canonical_meaning: true,
      raw_intake_gaps_can_propose_admission_candidates: true,
      recurring_unknowns_can_propose_subdivision_candidates: true,
      typo_variants_can_propose_lexical_variant_candidates: true,
      idioms_and_metaphors_can_propose_contextual_meaning_candidates: true,
      belief_pressure_can_propose_pressure_semantics_subdivision: true,
      source_evidence_media_gaps_can_propose_separation_subdivision: true,
      quote_reframe_gaps_can_propose_scope_subdivision: true,
      causal_bridge_gaps_can_propose_relation_subdivision: true,
      epistemic_octahedron_maturity_guard_active: true,
      maturity_is_integration_not_confidence: true,
      objective_maturity_refuses_premature_certainty: true,
      no_canonical_mutation: true,
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

  function collectSignals(rawPacket) {
    const records = asArray(rawPacket && rawPacket.raw_intake_records);
    const typoItems = records.flatMap(r => asArray(r.typo_variant_hypotheses).map(h => ({ record_id: r.raw_intake_record_id, item: h.original_token, candidate: h.candidate_repair, source: h })));
    const unknownItems = records.flatMap(r => asArray(r.unknown_or_new_meaning_hypotheses).map(h => ({ record_id: r.raw_intake_record_id, item: h.token, candidate: h.normalized_token, source: h })));
    const unresolved = records.flatMap(r => asArray(r.unresolved_items));
    const packets = records.flatMap(r => asArray(r.candidate_packets));
    const relations = records.flatMap(r => asArray(r.relation_candidates));
    return {
      records,
      typoItems,
      unknownItems,
      unresolved,
      packets,
      relations,
      has_idiom_or_metaphor_gap: unresolved.includes('idiom_or_metaphor_requires_context'),
      has_belief_pressure_gap: unresolved.includes('belief_statement_is_pressure_not_truth'),
      has_source_evidence_media_gap: unresolved.includes('source_reference_is_anchor_not_lookup') || unresolved.includes('evidence_description_not_verified_evidence') || unresolved.includes('media_description_not_verified_media'),
      has_quote_reframe_gap: unresolved.includes('quote_fragment_context_required') || unresolved.includes('hostile_reframe_is_pressure_not_same_claim'),
      has_causal_bridge_gap: unresolved.includes('causal_bridge_required_before_causal_truth'),
      has_claim_gap: unresolved.includes('claim_candidate_is_not_truth') || packets.some(p => p.packet_type === 'claim_candidate')
    };
  }

  function makeProposal(id, family, title, sourceItems, producedSubdivisions, guards, rationale) {
    return {
      expansion_proposal_id: id,
      proposal_family: family,
      title,
      rationale,
      source_items: clone(sourceItems || []),
      produced_subdivision_candidates: unique(producedSubdivisions),
      admission_status: 'candidate_not_doctrine',
      proposal_status: 'candidate_self_expansion_not_canonical',
      canonical_mutation_performed: false,
      exact_meaning_claimed: false,
      growth_mode: 'subdivision_not_mass_inflation',
      required_before_admission: unique([
        'explicit_admission_review_required',
        'source_runtime_trace_required',
        'rollback_snapshot_required',
        'no_silent_canonical_mutation',
        'scope_and_context_preserved'
      ].concat(guards || [])),
      active_guards: unique([
        'meaning_admission_loop_is_candidate_self_expansion',
        'self_expansion_is_not_silent_self_rewrite',
        'growth_means_subdivision_not_mass_inflation',
        'candidate_admission_is_not_canonical_meaning',
        'epistemic_octahedron_maturity_guard_active',
        'maturity_is_integration_not_confidence',
        'no_canonical_mutation',
        'no_final_truth_promotion',
        'no_belief_movement',
        'rollback_required',
        'no_silent_mutation'
      ].concat(guards || [])).reduce((acc, key) => { acc[key] = true; return acc; }, {}),
      unresolved_items: unique([
        'candidate_admission_not_canonical_meaning',
        'requires_future_admission_review',
        'truth_status:not_adjudicated',
        'belief_movement:none'
      ].concat(guards || [])),
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
        source_items: clone(sourceItems || []),
        produced_subdivision_candidates: unique(producedSubdivisions),
        rollback_reason: 'remove_expansion_proposal_without_mutating_canonical_meaning_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `${safeId(id)}_v0001_candidate`,
          source_type: 'meaning_admission_self_expansion_loop',
          created_at: now(),
          mutation_type: 'initial_candidate_expansion_proposal',
          silent_mutation: false,
          canonical_mutation_performed: false,
          promotion_status: 'not_promoted',
          truth_status: 'not_adjudicated',
          belief_movement: 'none'
        }
      ]
    };
  }

  function makeExpansionProposals(rawPacket) {
    const s = collectSignals(rawPacket);
    const proposals = [];
    if (s.typoItems.length) {
      proposals.push(makeProposal('expansion_typo_variant_subdivision_001', 'typo_variant_subdivision', 'Candidate lexical-variant subdivision from repeated typo/variant signals', s.typoItems, ['lexical_variant_candidate', 'orthographic_variant_candidate', 'repair_confidence_candidate'], ['typo_repair_is_candidate_not_certainty'], 'Typos should create candidate repair variants without becoming certain meanings.'));
    }
    if (s.unknownItems.length) {
      proposals.push(makeProposal('expansion_unknown_term_admission_001', 'unknown_term_admission', 'Candidate unknown-term admission hold', s.unknownItems, ['unknown_term_candidate', 'domain_specific_meaning_candidate', 'context_requirement_candidate'], ['unknown_meaning_requires_admission_no_fake_meaning'], 'Unknown words should enter admission review rather than receiving fake exact meanings.'));
    }
    if (s.has_idiom_or_metaphor_gap) {
      proposals.push(makeProposal('expansion_idiom_metaphor_subdivision_001', 'idiom_metaphor_subdivision', 'Candidate idiom/metaphor context subdivision', s.records.filter(r => asArray(r.unresolved_items).includes('idiom_or_metaphor_requires_context')).map(r => r.raw_intake_record_id), ['figurative_language_candidate', 'idiom_candidate', 'metaphor_candidate', 'literal_vs_nonliteral_context_candidate'], ['idiom_or_metaphor_requires_context'], 'Figurative language should be represented as contextual meaning pressure, not forced literal meaning.'));
    }
    if (s.has_belief_pressure_gap) {
      proposals.push(makeProposal('expansion_belief_pressure_semantics_001', 'belief_pressure_subdivision', 'Candidate belief-pressure semantics subdivision', s.records.filter(r => asArray(r.unresolved_items).includes('belief_statement_is_pressure_not_truth')).map(r => r.raw_intake_record_id), ['confidence_signal_candidate', 'belief_pressure_candidate', 'evidence_separation_candidate'], ['belief_statement_is_pressure_not_truth', 'user_confidence_is_not_evidence'], 'Confidence language should be split from evidence and truth promotion.'));
    }
    if (s.has_source_evidence_media_gap) {
      proposals.push(makeProposal('expansion_source_evidence_media_separation_001', 'source_evidence_media_separation', 'Candidate source/evidence/media separation subdivision', s.packets.filter(p => ['source_reference','evidence_description','media_description'].includes(p.packet_type)).map(p => p.candidate_packet_id), ['source_anchor_candidate', 'evidence_description_candidate', 'media_description_candidate', 'verification_requirement_candidate'], ['source_reference_is_anchor_not_lookup', 'evidence_media_description_is_not_verification'], 'Source, evidence, and media descriptions must remain separated from verification.'));
    }
    if (s.has_quote_reframe_gap) {
      proposals.push(makeProposal('expansion_quote_reframe_scope_001', 'quote_reframe_scope_subdivision', 'Candidate quote/reframe scope subdivision', s.packets.filter(p => ['quote_fragment','adversarial_reframe'].includes(p.packet_type)).map(p => p.candidate_packet_id), ['quote_fragment_candidate', 'context_completion_requirement_candidate', 'hostile_reframe_pressure_candidate', 'scope_shift_candidate'], ['quote_fragment_context_required', 'hostile_reframe_is_pressure_not_same_claim'], 'Quote fragments and hostile reframes require context and scope separation.'));
    }
    if (s.has_causal_bridge_gap) {
      proposals.push(makeProposal('expansion_causal_bridge_relation_001', 'causal_bridge_relation_subdivision', 'Candidate causal-bridge relation subdivision', s.relations.filter(r => r.relation_family === 'causes_or_contributes_to').map(r => r.relation_candidate_id), ['temporal_sequence_candidate', 'causal_claim_candidate', 'bridge_requirement_candidate', 'mechanism_requirement_candidate'], ['causal_bridge_required_before_causal_truth'], 'Causal language must subdivide temporal order, mechanism, bridge, and truth claim.'));
    }
    if (s.has_claim_gap) {
      proposals.push(makeProposal('expansion_claim_scope_candidate_001', 'claim_scope_subdivision', 'Candidate claim/scope subdivision from raw claims', s.packets.filter(p => p.packet_type === 'claim_candidate').map(p => p.candidate_packet_id), ['claim_candidate', 'scope_candidate', 'quantifier_candidate', 'condition_candidate'], ['claim_candidate_is_not_truth', 'scope_and_context_preserved'], 'Raw claims should expose scope, quantifier, and condition candidates before truth movement.'));
    }
    return proposals;
  }

  function proposalFamilyCounts(proposals) {
    return asArray(proposals).reduce((acc, row) => {
      acc[row.proposal_family] = (acc[row.proposal_family] || 0) + 1;
      return acc;
    }, {});
  }

  function validateProposal(row) {
    const errors = [];
    if (!text(row && row.expansion_proposal_id)) errors.push('missing_expansion_proposal_id');
    if (!text(row && row.proposal_family)) errors.push('missing_proposal_family');
    if (asArray(row && row.produced_subdivision_candidates).length < 1) errors.push('missing_subdivision_candidates');
    if (row && row.admission_status !== 'candidate_not_doctrine') errors.push('admission_status_not_candidate');
    if (row && row.proposal_status !== 'candidate_self_expansion_not_canonical') errors.push('proposal_status_not_candidate');
    if (row && row.canonical_mutation_performed !== false) errors.push('canonical_mutation_performed');
    if (row && row.exact_meaning_claimed !== false) errors.push('exact_meaning_claimed');
    if (row && row.growth_mode !== 'subdivision_not_mass_inflation') errors.push('growth_mode_not_subdivision');
    if (!row || !row.active_guards || row.active_guards.no_canonical_mutation !== true) errors.push('no_canonical_mutation_guard_missing');
    if (!row || !row.active_guards || row.active_guards.growth_means_subdivision_not_mass_inflation !== true) errors.push('growth_guard_missing');
    if (!row || !row.active_guards || row.active_guards.epistemic_octahedron_maturity_guard_active !== true) errors.push('eo_maturity_guard_missing');
    if (asArray(row && row.required_before_admission).length < 1) errors.push('required_before_admission_missing');
    if (asArray(row && row.unresolved_items).length < 1) errors.push('unresolved_items_missing');
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
    if (asArray(row && row.revision_trail).some(v => v.silent_mutation !== false || v.canonical_mutation_performed !== false)) errors.push('silent_or_canonical_mutation_present');
    return { expansion_proposal_id: text(row && row.expansion_proposal_id), ok: errors.length === 0, errors, proposal_family: text(row && row.proposal_family), belief_movement: 'none' };
  }

  function validatePacket(packet) {
    const proposals = asArray(packet && packet.expansion_proposals);
    const validations = proposals.map(validateProposal);
    const families = new Set(proposals.map(p => p.proposal_family));
    const unresolved = proposals.flatMap(p => asArray(p.unresolved_items));
    const produced = proposals.flatMap(p => asArray(p.produced_subdivision_candidates));
    const errors = [];
    if (packet && packet.source_raw_intake_ok !== true) errors.push('source_raw_intake_not_ok');
    if (packet && packet.source_raw_intake_record_count !== 5) errors.push(`source_raw_intake_record_count_not_5:${packet.source_raw_intake_record_count}`);
    if (proposals.length !== 8) errors.push(`expansion_proposal_count_not_8:${proposals.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.expansion_proposal_id}:${row.errors.join('|')}`); });
    const requiredFamilies = ['typo_variant_subdivision','unknown_term_admission','idiom_metaphor_subdivision','belief_pressure_subdivision','source_evidence_media_separation','quote_reframe_scope_subdivision','causal_bridge_relation_subdivision','claim_scope_subdivision'];
    const checks = {
      source_raw_intake_ready: packet && packet.source_raw_intake_ok === true,
      source_raw_intake_records_5: packet && packet.source_raw_intake_record_count === 5,
      eight_expansion_proposals: proposals.length === 8,
      all_required_proposal_families_present: requiredFamilies.every(f => families.has(f)),
      all_proposals_valid: validations.every(v => v.ok),
      all_proposals_candidate_not_canonical: proposals.every(p => p.admission_status === 'candidate_not_doctrine' && p.proposal_status === 'candidate_self_expansion_not_canonical' && p.canonical_mutation_performed === false),
      growth_is_subdivision_not_mass_inflation: proposals.every(p => p.growth_mode === 'subdivision_not_mass_inflation') && produced.includes('bridge_requirement_candidate') && produced.includes('orthographic_variant_candidate'),
      typo_unknown_idiom_admission_visible: unresolved.includes('typo_repair_is_candidate_not_certainty') && unresolved.includes('unknown_meaning_requires_admission_no_fake_meaning') && unresolved.includes('idiom_or_metaphor_requires_context'),
      belief_source_media_reframe_causal_gaps_visible: unresolved.includes('belief_statement_is_pressure_not_truth') && unresolved.includes('source_reference_is_anchor_not_lookup') && unresolved.includes('evidence_media_description_is_not_verification') && unresolved.includes('hostile_reframe_is_pressure_not_same_claim') && unresolved.includes('causal_bridge_required_before_causal_truth'),
      admission_requirements_visible_for_all: proposals.every(p => asArray(p.required_before_admission).includes('explicit_admission_review_required') && asArray(p.required_before_admission).includes('no_silent_canonical_mutation')),
      eo_maturity_guard_active_for_all: proposals.every(p => p.active_guards && p.active_guards.epistemic_octahedron_maturity_guard_active === true && p.active_guards.maturity_is_integration_not_confidence === true),
      no_canonical_mutation: packet && packet.canonical_mutation_performed === false && proposals.every(p => p.canonical_mutation_performed === false),
      no_truth_promotion: packet && packet.truth_status === 'not_adjudicated' && proposals.every(p => p.truth_status === 'not_adjudicated' && p.promotion_status === 'not_promoted'),
      no_llm_used: packet && packet.llm_used === false && proposals.every(p => p.llm_used === false),
      no_lookup_used: packet && packet.external_lookup_performed === false && packet.media_lookup_performed === false && proposals.every(p => p.external_lookup_performed === false && p.media_lookup_performed === false),
      rollback_available_for_all: proposals.every(p => p.rollback_available === true && !!p.rollback_snapshot),
      no_silent_mutation: proposals.every(p => asArray(p.revision_trail).every(v => v.silent_mutation === false && v.canonical_mutation_performed === false)),
      final_authority_false: packet && packet.meaning_admission_loop_is_final_truth_authority === false && proposals.every(p => p.final_authority === false),
      belief_movement_none: packet && packet.belief_movement === 'none' && proposals.every(p => p.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_meaning_admission_self_expansion_loop_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      proposal_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runMeaningAdmissionSelfExpansionLoop(options = {}) {
    const rawPacket = options.raw_intake_packet || rawApi().runRawMessyLanguageIntake(options.raw_intake_options || {});
    const proposals = makeExpansionProposals(rawPacket);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Meaning admission / self-expansion loop. Converts raw-intake gaps into candidate subdivision/admission proposals without canonical mutation.',
      source_raw_intake_ok: rawPacket && rawPacket.ok === true,
      source_raw_intake_version: text(rawPacket && rawPacket.packet_version),
      source_raw_intake_record_count: Number(rawPacket && rawPacket.raw_intake_record_count) || 0,
      source_candidate_interpretation_count: Number(rawPacket && rawPacket.candidate_interpretation_count) || 0,
      source_candidate_packet_count: Number(rawPacket && rawPacket.candidate_packet_count) || 0,
      source_relation_candidate_count: Number(rawPacket && rawPacket.relation_candidate_count) || 0,
      source_typo_variant_hypothesis_count: Number(rawPacket && rawPacket.typo_variant_hypothesis_count) || 0,
      source_unknown_or_new_meaning_hypothesis_count: Number(rawPacket && rawPacket.unknown_or_new_meaning_hypothesis_count) || 0,
      expansion_proposal_count: proposals.length,
      expansion_proposal_family_count: new Set(proposals.map(p => p.proposal_family)).size,
      expansion_proposals: proposals,
      proposal_family_counts: proposalFamilyCounts(proposals),
      doctrine: doctrine(),
      canonical_mutation_performed: false,
      meaning_admission_loop_is_final_truth_authority: false,
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
        source_raw_intake_summary: rawPacket ? {
          ok: rawPacket.ok,
          packet_version: rawPacket.packet_version,
          raw_intake_record_count: rawPacket.raw_intake_record_count,
          admission_candidate_count: rawPacket.admission_candidate_count
        } : null,
        expansion_proposals: clone(proposals),
        rollback_reason: 'remove_self_expansion_loop_packet_without_mutating_canonical_meanings_or_promoting_truth'
      },
      revision_trail: [
        {
          version_id: `meaning_admission_self_expansion_loop_${VERSION.replace(/\./g, '_')}_v0001_candidate`,
          source_type: 'meaning_admission_self_expansion_loop',
          created_at: now(),
          mutation_type: 'initial_self_expansion_candidate_packet',
          silent_mutation: false,
          canonical_mutation_performed: false,
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

  global.KernelMeaningAdmissionSelfExpansionLoopV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    collectSignals,
    makeProposal,
    makeExpansionProposals,
    proposalFamilyCounts,
    validateProposal,
    validatePacket,
    runMeaningAdmissionSelfExpansionLoop
  });
})(typeof window !== 'undefined' ? window : globalThis);
