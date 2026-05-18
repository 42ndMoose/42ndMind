/* 42ndMind Epistemic Octahedron Language Alignment v0.1
 * Tests whether current objective language-math kernel coheres with core octahedron semantics.
 * No external truth attribution. No belief/world-model ledger. No doctrine promotion.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_epistemic_octahedron_language_alignment_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function abs(value) { return Math.abs(Number(value) || 0); }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function inspectorApi() {
    if (!global.KernelIntentionFormulaInspectorV01) throw new Error('KernelIntentionFormulaInspectorV01 unavailable');
    return global.KernelIntentionFormulaInspectorV01;
  }

  function doctrine() {
    return {
      tests_octahedron_semantics_against_language_math: true,
      null_origin_is_pre_philosophical_absence_not_collapse: true,
      active_surface_requires_l1_total_1: true,
      equator_y0_is_net_zero_epistemic_convergence_boundary: true,
      positive_y_integrates_tensions_toward_maturity: true,
      negative_y_expresses_epistemic_collapse_pressure: true,
      maturity_peak_integrates_empathy_practicality_wisdom_knowledge_under_positive_stability: true,
      force_intensity_remains_outside_shape: 'F = M · i',
      no_external_truth_attribution: true,
      no_belief_world_model_ledger: true,
      belief_movement: 'none'
    };
  }

  function pointL1(point) {
    return round(abs(point && point.x) + abs(point && point.y) + abs(point && point.z));
  }

  function isSurfacePoint(point) {
    return Math.abs(pointL1(point) - 1) <= EPSILON;
  }

  function canonicalStates() {
    return [
      {
        state_id: 'null_origin',
        label: 'Null origin',
        point: { x: 0, y: 0, z: 0 },
        expected_l1: 0,
        expected_zone: 'pre_philosophical_absence',
        semantics: 'No active worldview vector. This is not epistemic collapse because no negative stability vector is active.'
      },
      {
        state_id: 'equator_empathy_knowledge_boundary',
        label: 'Equator boundary example',
        point: { x: -0.5, y: 0, z: -0.5 },
        expected_l1: 1,
        expected_zone: 'net_zero_epistemic_convergence_boundary',
        semantics: 'An active worldview shape exists, but vertical epistemic stability is net zero.'
      },
      {
        state_id: 'maturity_peak',
        label: 'Philosophical maturity peak',
        point: { x: 0, y: 1, z: 0 },
        expected_l1: 1,
        expected_zone: 'integrated_positive_epistemic_stability',
        semantics: 'Maximum positive epistemic stability. Lateral tensions are integrated rather than passively destabilizing.'
      },
      {
        state_id: 'collapse_vertex',
        label: 'Epistemic collapse vertex',
        point: { x: 0, y: -1, z: 0 },
        expected_l1: 1,
        expected_zone: 'maximal_negative_epistemic_stability',
        semantics: 'Maximum active negative stability. This is the opposite pole of maturity, not the same as null.'
      },
      {
        state_id: 'integrated_positive_mixed_state',
        label: 'Integrated positive mixed state',
        point: { x: 0.25, y: 0.5, z: 0.25 },
        expected_l1: 1,
        expected_zone: 'partial_positive_integration',
        semantics: 'A surface-preserving active state where lateral content exists under positive stability.'
      },
      {
        state_id: 'negative_mixed_state',
        label: 'Negative mixed state',
        point: { x: 0.25, y: -0.5, z: 0.25 },
        expected_l1: 1,
        expected_zone: 'partial_negative_epistemic_pressure',
        semantics: 'A surface-preserving active state where lateral content exists under negative stability pressure.'
      }
    ];
  }

  function classifyZone(point) {
    const l1 = pointL1(point);
    const y = Number(point && point.y) || 0;
    if (Math.abs(l1) <= EPSILON) return 'pre_philosophical_absence';
    if (Math.abs(l1 - 1) > EPSILON) return 'invalid_non_surface_state';
    if (Math.abs(y) <= EPSILON) return 'net_zero_epistemic_convergence_boundary';
    if (Math.abs(y - 1) <= EPSILON) return 'integrated_positive_epistemic_stability';
    if (Math.abs(y + 1) <= EPSILON) return 'maximal_negative_epistemic_stability';
    if (y > 0) return 'partial_positive_integration';
    return 'partial_negative_epistemic_pressure';
  }

  function validateState(state) {
    const l1 = pointL1(state.point);
    const zone = classifyZone(state.point);
    const errors = [];
    if (Math.abs(l1 - Number(state.expected_l1)) > EPSILON) errors.push(`l1_expected_${state.expected_l1}_got_${l1}`);
    if (zone !== state.expected_zone) errors.push(`zone_expected_${state.expected_zone}_got_${zone}`);
    if (state.state_id !== 'null_origin' && !isSurfacePoint(state.point)) errors.push('active_state_not_on_surface');
    if (state.state_id === 'null_origin' && isSurfacePoint(state.point)) errors.push('null_misclassified_as_surface');
    if (state.state_id === 'collapse_vertex' && l1 === 0) errors.push('collapse_misclassified_as_null');
    return {
      state_id: state.state_id,
      label: state.label,
      point: clone(state.point),
      l1_total: l1,
      zone,
      expected_zone: state.expected_zone,
      semantics: state.semantics,
      ok: errors.length === 0,
      errors,
      belief_movement: 'none'
    };
  }

  function axisSemantics() {
    return {
      x_axis: {
        negative_pole: 'empathy',
        positive_pole: 'practicality',
        integration_rule: 'maturity does not erase either pole; it regulates their tension through positive epistemic stability'
      },
      z_axis: {
        negative_pole: 'knowledge',
        positive_pole: 'wisdom',
        integration_rule: 'maturity does not collapse information into judgment or judgment into information; it regulates both through positive epistemic stability'
      },
      y_axis: {
        negative_pole: 'epistemic_collapse_pressure',
        zero_boundary: 'net_zero_convergence',
        positive_pole: 'epistemic_stability_maturity',
        integration_rule: 'y is the stabilizing/integrating dimension that determines whether lateral tensions mature, stall, or collapse'
      }
    };
  }

  function inspectKernelCompatibility(options = {}) {
    const inspectorPacket = options.inspector_packet || inspectorApi().inspectAll(options.inspector_options || {});
    const inspections = asArray(inspectorPacket && inspectorPacket.inspections);
    const formulaChecks = inspections.map(row => ({
      concept: text(row.concept),
      current_candidate_version: text(row.current_candidate_version),
      version_count: Number(row.version_count || 0),
      current_l1_total: row.current_candidate ? row.current_candidate.l1_total : null,
      force_terms_outside_shape: row.current_candidate ? row.current_candidate.force_terms_outside_shape : false,
      proof_reference_present: !!row.proof_reference,
      candidate_only: row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine',
      belief_movement: 'none'
    }));
    return {
      source_formula_inspector_ok: inspectorPacket && inspectorPacket.ok === true,
      source_inspection_count: inspections.length,
      all_current_formulas_l1_1: formulaChecks.every(row => Math.abs(1 - Number(row.current_l1_total || 0)) <= EPSILON),
      all_force_terms_outside_shape: formulaChecks.every(row => row.force_terms_outside_shape === true),
      all_have_proof_reference: formulaChecks.every(row => row.proof_reference_present === true),
      all_candidate_only: formulaChecks.every(row => row.candidate_only === true),
      formula_checks: formulaChecks,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const states = asArray(packet && packet.state_validations);
    const errors = [];
    if (packet && packet.source_formula_inspector_ok !== true) errors.push('formula_inspector_not_ok');
    if (packet && packet.source_inspection_count !== 11) errors.push(`inspection_count_not_11:${packet && packet.source_inspection_count}`);
    if (states.length !== 6) errors.push(`state_count_not_6:${states.length}`);
    states.forEach(row => { if (!row.ok) errors.push(`${row.state_id}:${row.errors.join('|')}`); });
    const nullRow = states.find(row => row.state_id === 'null_origin');
    const maturity = states.find(row => row.state_id === 'maturity_peak');
    const collapse = states.find(row => row.state_id === 'collapse_vertex');
    const equator = states.find(row => row.state_id === 'equator_empathy_knowledge_boundary');
    const checks = {
      formula_inspector_ok: packet && packet.source_formula_inspector_ok === true,
      eleven_formula_inspections: packet && packet.source_inspection_count === 11,
      six_canonical_state_tests: states.length === 6,
      null_origin_l1_0: nullRow && nullRow.l1_total === 0 && nullRow.zone === 'pre_philosophical_absence',
      active_states_l1_1: states.filter(row => row.state_id !== 'null_origin').every(row => Math.abs(1 - row.l1_total) <= EPSILON),
      equator_is_y0_boundary: equator && equator.zone === 'net_zero_epistemic_convergence_boundary',
      maturity_peak_is_positive_y_vertex: maturity && maturity.point.y === 1 && maturity.zone === 'integrated_positive_epistemic_stability',
      collapse_vertex_is_negative_y_vertex: collapse && collapse.point.y === -1 && collapse.zone === 'maximal_negative_epistemic_stability',
      null_and_collapse_not_conflated: nullRow && collapse && nullRow.zone !== collapse.zone && nullRow.l1_total !== collapse.l1_total,
      language_formulas_preserve_l1: packet && packet.kernel_compatibility && packet.kernel_compatibility.all_current_formulas_l1_1 === true,
      force_terms_remain_outside_shape: packet && packet.kernel_compatibility && packet.kernel_compatibility.all_force_terms_outside_shape === true,
      candidate_only_not_promoted: packet && packet.kernel_compatibility && packet.kernel_compatibility.all_candidate_only === true,
      belief_movement_none: packet && packet.belief_movement === 'none' && states.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_epistemic_octahedron_language_alignment_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      errors,
      belief_movement: 'none'
    };
  }

  function runAlignment(options = {}) {
    const kernelCompatibility = inspectKernelCompatibility(options);
    const stateValidations = canonicalStates().map(validateState);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Tests whether core Epistemic Octahedron semantics cohere with the current deterministic language-math kernel invariants.',
      source_formula_inspector_ok: kernelCompatibility.source_formula_inspector_ok,
      source_inspection_count: kernelCompatibility.source_inspection_count,
      axis_semantics: axisSemantics(),
      canonical_states: canonicalStates(),
      state_validations: stateValidations,
      kernel_compatibility: kernelCompatibility,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.EpistemicOctahedronLanguageAlignmentV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    pointL1,
    isSurfacePoint,
    canonicalStates,
    classifyZone,
    validateState,
    axisSemantics,
    inspectKernelCompatibility,
    validatePacket,
    runAlignment
  });
})(typeof window !== 'undefined' ? window : globalThis);
