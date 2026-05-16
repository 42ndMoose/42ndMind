/* 42ndMind Objective Language Shape Observation Review v0.1
 * Reviews unit-total semantic-shape observations before they become seed pressure.
 *
 * Input: bridge projections / observations from KernelObjectiveLanguageShapeBridgeV01.
 * Output: reviewed repeated anonymous structures and optional seed-packet draft.
 *
 * This module does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_objective_language_shape_observation_review_v0_1';
  const SEED_PACKET_TYPE = '42ndMind_semantic_seed_corpus_v0_1_extension';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function num(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function round(value) { return Number(num(value).toFixed(12)); }
  function safeId(value) { return text(value).replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'shape'; }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const value = text(item);
      const key = value.toLowerCase();
      if (value && !seen.has(key)) { seen.add(key); out.push(value); }
    });
    return out;
  }
  function near(a, b, tolerance) { return Math.abs(num(a) - num(b)) <= num(tolerance || 1e-9); }

  function doctrine() {
    return {
      shape_observations_are_review_inputs_not_doctrine: true,
      repeated_anonymous_shapes_are_structure_candidates_not_truth: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      local_labels_are_metadata_only: true,
      reviewed_seed_packet_is_training_pressure_not_doctrine: true,
      do_not_import_seed_packet_without_browser_tests: true,
      review_gate_does_not_move_belief: true,
      review_gate_does_not_promote_doctrine: true,
      review_gate_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function bridge() {
    if (!global.KernelObjectiveLanguageShapeBridgeV01) throw new Error('KernelObjectiveLanguageShapeBridgeV01 unavailable');
    return global.KernelObjectiveLanguageShapeBridgeV01;
  }

  function projectionRows(packetOrBridge) {
    if (packetOrBridge && packetOrBridge.bridge_report && Array.isArray(packetOrBridge.bridge_report.projections)) return packetOrBridge.bridge_report.projections;
    if (packetOrBridge && Array.isArray(packetOrBridge.projections)) return packetOrBridge.projections;
    return [];
  }

  function observationRows(packetOrBridge) {
    if (packetOrBridge && Array.isArray(packetOrBridge.observations)) return packetOrBridge.observations;
    return projectionRows(packetOrBridge).map(p => bridge().semanticShapeObservation(p));
  }

  function dimensionLabelsAreMetadataOnly(projection) {
    return asArray(projection && projection.shape && projection.shape.dimensions).every(d => d && d.metadata && d.metadata.local_label_metadata_only === true);
  }

  function groupBySignature(packetOrBridge) {
    const projections = projectionRows(packetOrBridge);
    const observations = observationRows(packetOrBridge);
    const map = {};
    observations.forEach((obs, index) => {
      const signature = text(obs.anonymous_shape_signature || (projections[index] && projections[index].anonymous_signature));
      if (!signature) return;
      if (!map[signature]) map[signature] = { signature, observations: [], projections: [] };
      map[signature].observations.push(obs);
      if (projections[index]) map[signature].projections.push(projections[index]);
    });
    return Object.values(map).sort((a, b) => b.observations.length - a.observations.length || a.signature.localeCompare(b.signature));
  }

  function reviewGroup(group, options = {}) {
    const minRepeat = Math.max(2, Number(options.min_repetition || 2));
    const tolerance = Number.isFinite(Number(options.tolerance)) ? Number(options.tolerance) : 1e-9;
    const observations = asArray(group && group.observations);
    const projections = asArray(group && group.projections);
    const rootOk = observations.every(o => near(o.root_l1, 1, tolerance));
    const flatOk = observations.every(o => near(o.flattened_l1, 1, tolerance));
    const projectionOk = projections.length === 0 || projections.every(p => p.ok === true);
    const labelMetadataOk = projections.length === 0 || projections.every(dimensionLabelsAreMetadataOnly);
    const repeated = observations.length >= minRepeat;
    const sourceIds = unique(observations.map(o => o.source_entry_id).filter(Boolean));
    const pressureSignatures = unique(observations.map(o => o.source_pressure_signature).filter(Boolean));
    const bases = unique(observations.map(o => o.basis || 'pressure'));
    const leafCounts = unique(observations.map(o => String(o.leaf_dimension_count))).map(Number).filter(Number.isFinite);
    const status = repeated && rootOk && flatOk && projectionOk && labelMetadataOk ? 'reviewed_repeated_structure_candidate' : 'hold_for_more_evidence';
    return {
      candidate_id: `unit_total_shape_candidate_${safeId(group.signature).slice(0, 48)}`,
      anonymous_shape_signature: text(group.signature),
      review_status: status,
      repeated_observation_count: observations.length,
      source_entry_ids: sourceIds,
      source_pressure_signatures: pressureSignatures,
      bases,
      leaf_dimension_counts: leafCounts,
      checks: {
        repeated_enough: repeated,
        root_l1_equals_one: rootOk,
        flattened_l1_equals_one: flatOk,
        projections_ok: projectionOk,
        labels_metadata_only: labelMetadataOk
      },
      evidence_needed_before_seed_import: [
        'Browser-run the review test.',
        'Inspect repeated anonymous signatures for over-broad collapse.',
        'Confirm the structure is reusable under renamed labels.',
        'Import only as training pressure, not doctrine.'
      ],
      interpretation: 'Repeated anonymous unit-total shape structure candidate. This is structure evidence, not a truth decision.',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function reviewBridgePacket(packetOrBridge, options = {}) {
    const groups = groupBySignature(packetOrBridge);
    const candidates = groups.map(group => reviewGroup(group, options));
    const accepted = candidates.filter(c => c.review_status === 'reviewed_repeated_structure_candidate');
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: accepted.length > 0,
      source_projection_count: projectionRows(packetOrBridge).length,
      source_observation_count: observationRows(packetOrBridge).length,
      anonymous_signature_count: groups.length,
      candidate_count: candidates.length,
      accepted_candidate_count: accepted.length,
      held_candidate_count: candidates.length - accepted.length,
      candidates,
      accepted_candidates: accepted,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function seedEntryFromCandidate(candidate, index) {
    const n = String(index + 1).padStart(3, '0');
    const topPressure = asArray(candidate.source_pressure_signatures)[0] || 'anonymous repeated semantic pressure structure';
    return {
      id: `unit_total_shape_bridge_repeated_signature_${n}`,
      text: `A repeated semantic pressure structure can be projected into a unit-total active shape while preserving label-independent structure: ${candidate.anonymous_shape_signature}`,
      language: 'en',
      operator_group: 'basis_refinement_unit_total_shape_bridge',
      surface_terms: ['repeated semantic pressure structure', 'unit-total active shape', 'label-independent structure'],
      literal_meaning: 'A repeated semantic vector structure can be represented as an active shape whose absolute dimensions sum to one.',
      candidate_intended_meaning: 'The kernel may reuse repeated anonymous unit-total shape signatures as training pressure, while treating labels as metadata and avoiding belief movement from shape alone.',
      semantic_operators: [
        {
          operator: 'unit_total_shape_projection(semantic_vector)',
          pressure: ['unit_total_refinement_pressure'],
          legitimacy_condition: 'The semantic vector may be projected into a normalized active shape only when root and flattened L1 totals equal one.'
        },
        {
          operator: 'anonymous_shape_repetition(shape_signature)',
          pressure: ['unit_total_refinement_pressure'],
          legitimacy_condition: 'Repeated anonymous signatures are reusable only as structure candidates, not truth decisions.'
        }
      ],
      evidence_burden: [
        'Verify root L1 equals one.',
        'Verify flattened L1 equals one.',
        'Check that labels are metadata only.',
        'Check that the anonymous shape repeats across multiple semantic observations.',
        'Do not move belief from shape repetition alone.'
      ],
      expected_kernel_response: {
        lexical_action: 'treat repeated anonymous unit-total shape as a structure candidate',
        source_trust_action: 'use as training pressure only after review gate passes',
        belief_movement: 'none_from_shape_structure_alone',
        questions: ['Does this anonymous structure remain stable under label renaming and new examples?']
      },
      contrast_group: 'unit_total_objective_language_shape_bridge',
      review_status: 'reviewed_seed_candidate',
      workbench_metadata: {
        generated_by: PACKET_TYPE,
        source_candidate_id: candidate.candidate_id,
        anonymous_shape_signature: candidate.anonymous_shape_signature,
        repeated_observation_count: candidate.repeated_observation_count,
        source_pressure_signatures: asArray(candidate.source_pressure_signatures).slice(0, 12),
        representative_source_pressure_signature: topPressure,
        requires_human_review: true
      }
    };
  }

  function buildSeedPacket(reviewReport, options = {}) {
    const maxEntries = Math.max(1, Number(options.max_entries || 12));
    const accepted = asArray(reviewReport && reviewReport.accepted_candidates).slice(0, maxEntries);
    return {
      packet_type: SEED_PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Reviewed seed candidates generated from repeated anonymous unit-total semantic-shape structures. Training pressure only; not doctrine.',
      doctrine: {
        reviewed_seed_packet_is_training_pressure_not_doctrine: true,
        active_shape_l1_total: 'sum_abs_dimensions_equals_1',
        local_labels_are_metadata_only: true,
        force_intensity_remains_separate_from_shape: true,
        belief_movement: 'none'
      },
      entries: accepted.map(seedEntryFromCandidate),
      source_review_summary: {
        source_packet_type: reviewReport && reviewReport.packet_type || PACKET_TYPE,
        source_candidate_count: reviewReport && reviewReport.candidate_count || 0,
        accepted_candidate_count: reviewReport && reviewReport.accepted_candidate_count || 0,
        emitted_entry_count: accepted.length,
        import_status: 'not_added_to_default_combiner_until_browser_tests_pass',
        belief_movement: 'none'
      },
      belief_movement: 'none'
    };
  }

  async function loadBridgeReviewAndDraftSeed(options = {}) {
    const bridgePacket = await bridge().loadCompressAndBridge(options);
    const review = reviewBridgePacket(bridgePacket, options);
    const seed_packet_draft = buildSeedPacket(review, options);
    return {
      packet_type: '42ndMind_objective_language_shape_review_and_seed_draft_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: bridgePacket.ok === true && review.ok === true && seed_packet_draft.entries.length > 0,
      bridge_packet: bridgePacket,
      review_report: review,
      seed_packet_draft,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelObjectiveLanguageShapeObservationReviewV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    SEED_PACKET_TYPE,
    doctrine,
    projectionRows,
    observationRows,
    dimensionLabelsAreMetadataOnly,
    groupBySignature,
    reviewGroup,
    reviewBridgePacket,
    seedEntryFromCandidate,
    buildSeedPacket,
    loadBridgeReviewAndDraftSeed
  });
})(typeof window !== 'undefined' ? window : globalThis);
