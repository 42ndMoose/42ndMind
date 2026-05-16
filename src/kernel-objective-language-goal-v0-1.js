/* 42ndMind Objective Language Goal v0.1
 * Establishes the kernel's long-range research goal:
 * truth-seeking under objective philosophical maturity, plus discovery of the
 * canonical formal language that survives translation, symbol renaming, and
 * notation changes.
 *
 * This is a goal/constraint module, not a doctrine promotion engine.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_objective_language_goal_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function sumAbs(values) { return asArray(values).reduce((sum, value) => sum + Math.abs(Number(value) || 0), 0); }
  function normalizeL1(values) {
    const nums = asArray(values).map(v => Number(v) || 0);
    const norm = sumAbs(nums);
    if (!norm) return nums.map(() => 0);
    return nums.map(v => Number((v / norm).toFixed(8)));
  }
  function l1Norm(values) { return Number(sumAbs(values).toFixed(8)); }

  function doctrine() {
    return {
      kernel_goal_is_truth_seeking_plus_objective_language_discovery: true,
      truth_seeking_uses_objective_philosophical_maturity: true,
      objective_language_is_canonical_structure_not_english_labels: true,
      notation_is_surface_rendering_not_final_form: true,
      correct_discoverers_should_converge_up_to_isomorphism: true,
      active_intention_shapes_are_l1_normalized: true,
      intention_force_is_separate_from_intention_shape: true,
      declared_intention_is_not_automatically_validated_intention: true,
      semantic_laws_remain_candidates_until_invariance_and_contrast_tests_pass: true,
      module_does_not_move_belief: true,
      module_does_not_promote_doctrine: true,
      module_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function objectiveLanguageGoal() {
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      thesis: 'The kernel should seek truth while recursively discovering the canonical formal structure beneath language, intention, evidence, and belief movement.',
      target_definition: 'The objective language is not a preferred notation. It is the invariant structure that all correct notations reduce to under translation, symbol renaming, and basis permutation.',
      convergence_condition: 'Independent correct discoverers may use different symbols or languages, but their law graphs should be isomorphic after labels are stripped.',
      canonical_pipeline: [
        'surface expression',
        'local operator',
        'pressure vector',
        'evidence burden',
        'legitimacy guard',
        'contrast boundary',
        'blocked or allowed belief movement',
        'law candidate',
        'invariance test',
        'canonical basis relation',
        'isomorphism class'
      ],
      intention_hypothesis: {
        statement: 'Every active intention can be modeled as a normalized directed pressure network.',
        normalized_shape: 'For active intention vector i, ||i||_1 = 1.',
        separate_force: 'Behavioral force is modeled separately as F = M · i, where M is motivational intensity.',
        implication: 'A weak desire and a life-defining commitment can share a normalized shape type while differing in force.',
        warning: 'Declared intention, inferred intention, and validated intention must remain separate.'
      },
      formal_candidate_shape: {
        semantic_law: 'L := (O, v, B, C, tau)',
        O: 'operator class or state-transition move',
        v: 'canonical pressure vector, eventually stripped of local labels',
        B: 'evidence burden or validation burden',
        C: 'contrast boundary preventing semantic collapse',
        tau: 'blocked or allowed transition rule'
      },
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function normalizeIntentionVector(components, options = {}) {
    const list = asArray(components).map((component, index) => ({
      id: text(component && component.id || component && component.name || `d_${index + 1}`),
      local_label: text(component && component.label || component && component.name || component && component.id || `component_${index + 1}`),
      value: Number(component && component.value ?? component) || 0,
      role: text(component && component.role || 'unclassified_intention_pressure')
    }));
    const normalized = normalizeL1(list.map(c => c.value));
    return {
      packet_type: '42ndMind_normalized_intention_vector_v0_1',
      packet_version: VERSION,
      created_at: now(),
      components: list.map((component, index) => Object.assign({}, component, { normalized_value: normalized[index] })),
      l1_norm: l1Norm(normalized),
      active_shape_total: l1Norm(normalized),
      intensity_scalar: Number(options.intensity_scalar || 1),
      behavioral_force_vector: normalized.map(v => Number((v * Number(options.intensity_scalar || 1)).toFixed(8))),
      warning: 'This normalizes declared component structure only. It does not validate the true underlying intention.',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function isomorphicGoalCriteria() {
    return {
      packet_type: '42ndMind_objective_language_isomorphism_criteria_v0_1',
      packet_version: VERSION,
      created_at: now(),
      criteria: [
        'Strip local language labels.',
        'Strip arbitrary symbol names.',
        'Preserve relation graph: operator, vector dimensions, burden, contrast, transition.',
        'Check whether another notation maps one-to-one onto the same relation graph.',
        'Treat matching relation graphs as equivalent up to isomorphism.',
        'Do not treat matching labels as proof of structural equivalence.',
        'Do not treat different labels as proof of structural difference.'
      ],
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function goalAlignmentCheck(packet) {
    const p = packet || {};
    const flags = {
      preserves_no_belief_movement: text(p.belief_movement) === 'none' || p.belief_movement === undefined,
      avoids_doctrine_promotion: !(p.promote_doctrine === true || p.doctrine_promotion === true),
      includes_contrast_or_invariance: !!(p.contrast_boundaries || p.ranked_invariance_tests || p.contrast_classes || p.invariance_report),
      avoids_label_finalism: !(p.objective_language_claim === 'final_math' || p.final_notation === true)
    };
    const ok = Object.values(flags).every(Boolean);
    return {
      packet_type: '42ndMind_objective_language_goal_alignment_check_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok,
      flags,
      recommendation: ok ? 'aligned_with_objective_language_discovery_goal' : 'review_for_goal_drift',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelObjectiveLanguageGoalV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    objectiveLanguageGoal,
    normalizeIntentionVector,
    isomorphicGoalCriteria,
    goalAlignmentCheck,
    normalizeL1,
    l1Norm
  });
})(typeof window !== 'undefined' ? window : globalThis);
