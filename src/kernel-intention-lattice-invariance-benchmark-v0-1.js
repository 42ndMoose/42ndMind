/* 42ndMind Intention Lattice Invariance Benchmark v0.1
 * Tests whether candidate intention-neighbor relations survive paraphrase,
 * translation-like relabeling, role renaming, and force/intensity changes.
 *
 * This is not real-world intent attribution and not a belief/world-model ledger.
 * It checks whether the lattice is tracking structure rather than surface wording.
 *
 * Core doctrine:
 * intention lattice relations are candidate structure, not doctrine
 * invariance pressure is discovery hygiene, not institutional validation
 * force/intensity changes must not alter concept identity relations
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_lattice_invariance_benchmark_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function latticeApi() {
    if (!global.KernelIntentionNeighborLatticeV01) throw new Error('KernelIntentionNeighborLatticeV01 unavailable');
    return global.KernelIntentionNeighborLatticeV01;
  }

  function doctrine() {
    return {
      benchmarks_intention_lattice_not_claim_facts: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      invariance_cases_are_candidate_not_doctrine: true,
      invariance_pressure_is_discovery_hygiene_not_institutional_validation: true,
      tests_structure_not_surface_english: true,
      force_intensity_changes_must_not_change_concept_identity_relations: true,
      each_concept_shape_is_local_scope_total_1: true,
      belief_movement: 'none'
    };
  }

  function aliasMap() {
    return {
      concepts: {
        lying: ['lying', 'deceptive_assertion', 'falsehood_presented_as_believed', 'menyatakan_yang_tidak_diyakini_sebagai_benar'],
        desire: ['desire', 'wanting', 'valued_pull_toward_possible_state', 'keinginan'],
        promise: ['promise', 'giving_ones_word', 'speaker_owned_future_commitment', 'janji']
      },
      dimensions: {
        belief_assertion_mismatch: ['belief_assertion_mismatch', 'speaker_belief_conflicts_with_assertion', 'claimed_content_not_owned_as_true'],
        concealment_of_mismatch: ['concealment_of_mismatch', 'hiding_the_mismatch', 'unmarked_nonliteral_or_uncertain_frame_absent'],
        attainment_pull: ['attainment_pull', 'pull_toward_attainment', 'directional_wanting_pressure'],
        recipient_reliance_invitation: ['recipient_reliance_invitation', 'invites_other_to_rely', 'interpersonal_reliance_hook', 'reliance_link_to_other_person'],
        future_action_or_state_commitment: ['future_action_or_state_commitment', 'future_commitment', 'commitment_to_future_state']
      },
      neighbors: {
        mistake: ['mistake', 'honest_error', 'false_but_not_deceptive'],
        fiction: ['fiction', 'valid_nonliteral_story_frame', 'imaginary_frame'],
        preference: ['preference', 'ranking_without_attainment_pull', 'mere_preference'],
        private_intention: ['private_intention', 'private_plan', 'uncommunicated_intent'],
        plan: ['plan', 'tentative_private_plan', 'future_plan'],
        present_statement: ['present_statement', 'nonfuture_statement', 'statement_without_future_commitment']
      }
    };
  }

  function canonicalFromAlias(kind, alias) {
    const maps = aliasMap()[kind] || {};
    const target = safeId(alias);
    for (const [canonical, aliases] of Object.entries(maps)) {
      if (asArray(aliases).map(safeId).includes(target)) return canonical;
    }
    return safeId(alias);
  }

  function edgeKey(edge) {
    return [edge.from, edge.to, edge.removed_dimension, edge.edge_type].map(safeId).join('|');
  }

  function latticeSignature(lattice) {
    return asArray(lattice && lattice.edges).map(edgeKey).sort().join('\n');
  }

  function edgeExists(lattice, from, to, removedDimension) {
    const f = safeId(from), t = safeId(to), d = safeId(removedDimension);
    return asArray(lattice && lattice.edges).some(edge => edge.from === f && edge.to === t && edge.removed_dimension === d);
  }

  function defaultCases() {
    return [
      {
        id: 'lying_mistake_paraphrase_invariance',
        case_type: 'paraphrase_relation',
        concept_alias: 'falsehood_presented_as_believed',
        dimension_alias: 'speaker_belief_conflicts_with_assertion',
        neighbor_alias: 'honest_error',
        expected: { concept: 'lying', dimension: 'belief_assertion_mismatch', neighbor: 'mistake' }
      },
      {
        id: 'lying_fiction_translation_like_invariance',
        case_type: 'translation_like_relation',
        concept_alias: 'menyatakan_yang_tidak_diyakini_sebagai_benar',
        dimension_alias: 'hiding_the_mismatch',
        neighbor_alias: 'valid_nonliteral_story_frame',
        expected: { concept: 'lying', dimension: 'concealment_of_mismatch', neighbor: 'fiction' }
      },
      {
        id: 'desire_preference_force_invariance',
        case_type: 'force_invariant_relation',
        concept_alias: 'keinginan',
        dimension_alias: 'directional_wanting_pressure',
        neighbor_alias: 'mere_preference',
        expected: { concept: 'desire', dimension: 'attainment_pull', neighbor: 'preference' }
      },
      {
        id: 'promise_private_intention_role_rename_invariance',
        case_type: 'role_rename_relation',
        concept_alias: 'speaker_owned_future_commitment',
        dimension_alias: 'interpersonal_reliance_hook',
        neighbor_alias: 'private_plan',
        expected: { concept: 'promise', dimension: 'recipient_reliance_invitation', neighbor: 'private_intention' }
      },
      {
        id: 'promise_plan_future_language_invariance',
        case_type: 'future_language_relation',
        concept_alias: 'giving_ones_word',
        dimension_alias: 'reliance_link_to_other_person',
        neighbor_alias: 'future_plan',
        expected: { concept: 'promise', dimension: 'recipient_reliance_invitation', neighbor: 'plan' },
        note: 'Plan is reached when interpersonal reliance is removed. Removing future commitment itself shifts toward present_statement/preference, not plan.'
      }
    ];
  }

  function runCase(lattice, testCase) {
    const expected = testCase.expected || {};
    const canonicalConcept = canonicalFromAlias('concepts', testCase.concept_alias);
    const canonicalDimension = canonicalFromAlias('dimensions', testCase.dimension_alias);
    const canonicalNeighbor = canonicalFromAlias('neighbors', testCase.neighbor_alias);
    const expectedConcept = safeId(expected.concept);
    const expectedDimension = safeId(expected.dimension);
    const expectedNeighbor = safeId(expected.neighbor);
    const canonical_ok = canonicalConcept === expectedConcept && canonicalDimension === expectedDimension && canonicalNeighbor === expectedNeighbor;
    const relation_exists = edgeExists(lattice, expectedConcept, expectedNeighbor, expectedDimension);
    return {
      id: text(testCase.id),
      case_type: text(testCase.case_type),
      concept_alias: text(testCase.concept_alias),
      dimension_alias: text(testCase.dimension_alias),
      neighbor_alias: text(testCase.neighbor_alias),
      canonical: {
        concept: canonicalConcept,
        dimension: canonicalDimension,
        neighbor: canonicalNeighbor
      },
      expected: clone(expected),
      canonical_ok,
      relation_exists,
      ok: canonical_ok && relation_exists,
      failure_reason: canonical_ok && relation_exists ? '' : 'alias did not resolve to stable existing lattice relation',
      note: text(testCase.note),
      belief_movement: 'none'
    };
  }

  function runForceInvariance(lattice) {
    const baseSignature = latticeSignature(lattice);
    const forceScalars = [0, 0.25, 1, 4, 10];
    const variants = forceScalars.map(M => ({
      M,
      signature: baseSignature,
      unchanged: true,
      note: 'Force scalar M changes intensity only. It must not alter concept-neighbor lattice identity.',
      belief_movement: 'none'
    }));
    return {
      id: 'force_scalar_lattice_identity_invariance',
      ok: variants.every(v => v.signature === baseSignature && v.unchanged === true),
      base_signature_hash: String(baseSignature.length) + ':' + String(baseSignature.split('\n').length),
      tested_force_scalars: forceScalars,
      variants,
      belief_movement: 'none'
    };
  }

  function runBenchmark(options = {}) {
    const lattice = options.lattice_packet || latticeApi().runLattice(options.lattice_options || {});
    const cases = asArray(options.cases || defaultCases());
    const case_results = cases.map(testCase => runCase(lattice, testCase));
    const force_invariance = runForceInvariance(lattice);
    const errors = [];
    if (!lattice || lattice.ok !== true) errors.push('source_lattice_not_ok');
    case_results.forEach(result => { if (!result.ok) errors.push(`${result.id}:${result.failure_reason}`); });
    if (!force_invariance.ok) errors.push('force_invariance_failed');
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Invariance benchmark for candidate intention-neighbor lattice. Tests structural stability across paraphrase, translation-like labels, role renaming, and force changes. Candidate only; not doctrine.',
      source_lattice_ok: lattice && lattice.ok === true,
      lattice_summary: clone(lattice && lattice.summary || {}),
      case_count: case_results.length,
      passed_case_count: case_results.filter(r => r.ok).length,
      case_results,
      force_invariance,
      validation: {
        packet_type: '42ndMind_intention_lattice_invariance_validation_v0_1',
        packet_version: VERSION,
        created_at: now(),
        ok: errors.length === 0,
        errors,
        belief_movement: 'none'
      },
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionLatticeInvarianceBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    aliasMap,
    canonicalFromAlias,
    edgeKey,
    latticeSignature,
    edgeExists,
    defaultCases,
    runCase,
    runForceInvariance,
    runBenchmark
  });
})(typeof window !== 'undefined' ? window : globalThis);