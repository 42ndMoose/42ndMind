/* 42ndMind Intention Minimal-Pair Library v0.1
 * Builds structured contrast pairs from proof-output transition steps.
 * Candidate-only. No formula mutation. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_minimal_pair_library_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function proofApi() {
    if (!global.KernelIntentionProofOutputV01) throw new Error('KernelIntentionProofOutputV01 unavailable');
    return global.KernelIntentionProofOutputV01;
  }

  function doctrine() {
    return {
      stores_minimal_pairs_for_formula_pressure: true,
      minimal_pairs_are_candidate_tests_not_doctrine: true,
      minimal_pairs_do_not_change_formulas: true,
      minimal_pairs_do_not_promote_versions: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function conceptTitle(concept) {
    return safeId(concept).replace(/_/g, ' ');
  }

  function pressureQuestion(concept, dimension, neighbor) {
    return `If ${dimension.replace(/_/g, ' ')} is removed from ${conceptTitle(concept)}, does the structure move toward ${conceptTitle(neighbor)}?`;
  }

  function pairFromStep(proof, step, variant) {
    const concept = safeId(proof && proof.concept);
    const removed = safeId(step && step.remove);
    const neighbor = safeId(text(step && step.observed_transition).split('->')[1] || 'neighbor');
    const variantId = variant === 'dimension_absence' ? 'absence' : 'contrast';
    return {
      pair_id: `${concept}_${removed}_${neighbor}_${variantId}_minimal_pair`,
      concept,
      current_candidate_version: text(proof && proof.current_candidate_version),
      source_proof_id: text(proof && proof.proof_id),
      source_step_id: text(step && step.step_id),
      pair_type: variant,
      left_term: concept,
      right_term: variant === 'dimension_absence' ? `${concept}_without_${removed}` : neighbor,
      pressure_dimension: removed,
      expected_neighbor: neighbor,
      expected_transition: `${concept} -> ${neighbor}`,
      expected_pressure_class: text(step && step.pressure_class),
      removed_dimension_role: text(step && step.removed_dimension_role),
      structural_pressure_weight: Number(step && step.structural_pressure_weight || 0),
      prompt: pressureQuestion(concept, removed, neighbor),
      expected_result: 'transition_or_boundary_pressure_visible',
      explanation: `${concept} is contrasted with ${neighbor} by removing ${removed}.`,
      observed_l1_total: Number(proof && proof.observed_l1_total || 0),
      force_terms_outside_shape: proof && proof.force_terms_outside_shape === true,
      promotion_status: text(proof && proof.promotion_status),
      doctrine_status: text(proof && proof.doctrine_status),
      belief_movement: 'none'
    };
  }

  function buildPairs(proofPacket) {
    const pairs = [];
    asArray(proofPacket && proofPacket.proofs).forEach(proof => {
      asArray(proof.proof_steps).forEach(step => {
        pairs.push(pairFromStep(proof, step, 'structural_contrast'));
        pairs.push(pairFromStep(proof, step, 'dimension_absence'));
      });
    });
    return pairs;
  }

  function groupByConcept(pairs) {
    const map = {};
    asArray(pairs).forEach(pair => {
      const concept = safeId(pair.concept);
      if (!map[concept]) map[concept] = [];
      map[concept].push(pair);
    });
    return Object.keys(map).sort().map(concept => ({
      concept,
      pair_count: map[concept].length,
      structural_contrast_count: map[concept].filter(pair => pair.pair_type === 'structural_contrast').length,
      dimension_absence_count: map[concept].filter(pair => pair.pair_type === 'dimension_absence').length,
      pairs: map[concept],
      belief_movement: 'none'
    }));
  }

  function validatePair(pair) {
    const errors = [];
    if (!text(pair && pair.pair_id)) errors.push('missing_pair_id');
    if (!text(pair && pair.concept)) errors.push('missing_concept');
    if (!text(pair && pair.source_proof_id)) errors.push('missing_source_proof_id');
    if (!text(pair && pair.source_step_id)) errors.push('missing_source_step_id');
    if (!text(pair && pair.left_term) || !text(pair && pair.right_term)) errors.push('missing_pair_terms');
    if (!text(pair && pair.pressure_dimension)) errors.push('missing_pressure_dimension');
    if (!text(pair && pair.expected_neighbor)) errors.push('missing_expected_neighbor');
    if (!text(pair && pair.expected_transition).includes('->')) errors.push('missing_expected_transition');
    if (!text(pair && pair.prompt).includes('?')) errors.push('missing_question_prompt');
    if (Math.abs(1 - Number(pair && pair.observed_l1_total || 0)) > EPSILON) errors.push(`l1_not_1:${pair && pair.observed_l1_total}`);
    if (pair && pair.force_terms_outside_shape !== true) errors.push('force_terms_not_outside_shape');
    if (pair && pair.promotion_status !== 'not_promoted') errors.push('pair_promoted');
    if (pair && pair.doctrine_status !== 'candidate_not_doctrine') errors.push('pair_doctrine_status_not_safe');
    if (pair && pair.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      pair_id: text(pair && pair.pair_id),
      concept: text(pair && pair.concept),
      ok: errors.length === 0,
      errors,
      observed_l1_total: Number(pair && pair.observed_l1_total || 0),
      force_terms_outside_shape: pair && pair.force_terms_outside_shape === true,
      promotion_status: text(pair && pair.promotion_status),
      doctrine_status: text(pair && pair.doctrine_status),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const pairs = asArray(packet && packet.minimal_pairs);
    const grouped = asArray(packet && packet.concept_groups);
    const pairValidations = pairs.map(validatePair);
    const errors = [];
    if (packet && packet.source_proof_ok !== true) errors.push('source_proof_not_ok');
    if (packet && packet.concept_count !== 11) errors.push(`concept_count_not_11:${packet && packet.concept_count}`);
    if (packet && packet.minimal_pair_count !== 110) errors.push(`minimal_pair_count_not_110:${packet && packet.minimal_pair_count}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    pairValidations.forEach(row => { if (!row.ok) errors.push(`${row.pair_id}:${row.errors.join('|')}`); });
    grouped.forEach(group => {
      if (group.pair_count !== 10) errors.push(`${group.concept}:pair_count_not_10:${group.pair_count}`);
      if (group.structural_contrast_count !== 5) errors.push(`${group.concept}:structural_contrast_count_not_5:${group.structural_contrast_count}`);
      if (group.dimension_absence_count !== 5) errors.push(`${group.concept}:dimension_absence_count_not_5:${group.dimension_absence_count}`);
    });
    return {
      packet_type: '42ndMind_intention_minimal_pair_library_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks: {
        source_proof_ok: packet && packet.source_proof_ok === true,
        eleven_concepts: packet && packet.concept_count === 11,
        one_hundred_ten_pairs: packet && packet.minimal_pair_count === 110,
        ten_pairs_per_concept: grouped.length === 11 && grouped.every(group => group.pair_count === 10),
        all_pairs_valid: pairValidations.length > 0 && pairValidations.every(row => row.ok),
        all_l1_totals_equal_1: pairValidations.every(row => Math.abs(1 - Number(row.observed_l1_total || 0)) <= EPSILON),
        force_terms_outside_shape: pairValidations.every(row => row.force_terms_outside_shape === true),
        candidate_only_not_promoted: pairValidations.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
        belief_movement_none: packet && packet.belief_movement === 'none' && pairValidations.every(row => row.belief_movement === 'none')
      },
      pair_validations: pairValidations,
      errors,
      belief_movement: 'none'
    };
  }

  function runMinimalPairLibrary(options = {}) {
    const proofPacket = options.proof_packet || proofApi().runProofOutput(options.proof_options || {});
    const pairs = buildPairs(proofPacket);
    const groups = groupByConcept(pairs);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Large candidate minimal-pair library generated from proof-output transition steps. Each proof step becomes a structural contrast pair and a dimension-absence pair.',
      source_proof_ok: proofPacket && proofPacket.ok === true,
      source_proof_count: proofPacket && proofPacket.proof_count || 0,
      source_proof_step_count: proofPacket && proofPacket.proof_step_count || 0,
      concept_count: groups.length,
      minimal_pair_count: pairs.length,
      concept_groups: groups,
      minimal_pairs: pairs,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionMinimalPairLibraryV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    conceptTitle,
    pressureQuestion,
    pairFromStep,
    buildPairs,
    groupByConcept,
    validatePair,
    validatePacket,
    runMinimalPairLibrary
  });
})(typeof window !== 'undefined' ? window : globalThis);
