/* 42ndMind Unit-Total Nested Shape Kernel v0.1
 * Formalizes nested L1-normalized active shapes.
 *
 * Core rule:
 *   active shape = Σ |dimension_i| = 1
 *   child scopes may unfold into local Σ |child_j| = 1
 *   global contribution = parent_weight × local_child_weight
 *   force/intensity is separate: F = M · i
 *
 * This module does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_unit_total_nested_shape_kernel_v0_1';
  const REPORT_TYPE = '42ndMind_unit_total_nested_shape_report_v0_1';
  const DEFAULT_TOLERANCE = 1e-9;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function num(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function round(value) { return Number(num(value).toFixed(12)); }
  function absSum(items) { return round(asArray(items).reduce((sum, item) => sum + Math.abs(num(item && item.weight)), 0)); }
  function within(value, target, tolerance) { return Math.abs(num(value) - num(target)) <= num(tolerance || DEFAULT_TOLERANCE); }
  function pathJoin(parts) { return asArray(parts).map(text).filter(Boolean).join('.'); }

  function doctrine() {
    return {
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      parent_active_shape_can_equal_one_while_children_have_local_one: true,
      mature_scope_remains_one_with_more_dimensions: true,
      refinement_splits_overloaded_dimensions_not_total_mass: true,
      child_scope_global_contribution_is_parent_weight_times_local_child_weight: true,
      force_intensity_remains_separate_from_shape: true,
      intention_shape_rule: '||i||_1 = 1',
      force_rule: 'F = M · i',
      local_labels_are_metadata_only: true,
      unit_total_kernel_does_not_move_belief: true,
      unit_total_kernel_does_not_promote_doctrine: true,
      unit_total_kernel_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function defaultIntentShape() {
    return {
      packet_type: '42ndMind_unit_total_intention_shape_example_v0_1',
      packet_version: VERSION,
      label: 'intent',
      description: 'Example active intention shape. Parent scope sums to 1. Each expanded child scope also sums locally to 1.',
      dimensions: [
        { id: 'desire', weight: 0.18, local_shape: { label: 'desire', dimensions: [
          { id: 'approach_pull', weight: 0.55 },
          { id: 'avoidance_check', weight: -0.45 }
        ] } },
        { id: 'mood', weight: 0.12, local_shape: { label: 'mood', dimensions: [
          { id: 'arousal', weight: 0.40 },
          { id: 'valence', weight: 0.35 },
          { id: 'fatigue_drag', weight: -0.25 }
        ] } },
        { id: 'mindset', weight: 0.16, local_shape: { label: 'mindset', dimensions: [
          { id: 'strategic_frame', weight: 0.50 },
          { id: 'risk_frame', weight: 0.30 },
          { id: 'time_horizon', weight: 0.20 }
        ] } },
        { id: 'principles', weight: 0.18, local_shape: { label: 'principles', dimensions: [
          { id: 'truth_constraint', weight: 0.45 },
          { id: 'fairness_constraint', weight: 0.25 },
          { id: 'duty_constraint', weight: 0.30 }
        ] } },
        { id: 'boundaries', weight: 0.14, local_shape: { label: 'boundaries', dimensions: [
          { id: 'personal_limit', weight: 0.50 },
          { id: 'permission_limit', weight: 0.25 },
          { id: 'risk_limit', weight: 0.25 }
        ] } },
        { id: 'physical_constraint', weight: 0.10, local_shape: { label: 'physical_constraint', dimensions: [
          { id: 'energy', weight: 0.40 },
          { id: 'health', weight: 0.35 },
          { id: 'available_time', weight: 0.25 }
        ] } },
        { id: 'environment', weight: 0.12, local_shape: { label: 'environment', dimensions: [
          { id: 'resources', weight: 0.40 },
          { id: 'social_context', weight: 0.30 },
          { id: 'external_constraint', weight: 0.30 }
        ] } }
      ],
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function scopeLabel(shape, fallback) {
    return text(shape && (shape.label || shape.id || shape.scope)) || fallback || 'shape';
  }

  function analyzeShape(shape, options = {}) {
    const tolerance = Number.isFinite(Number(options.tolerance)) ? Number(options.tolerance) : DEFAULT_TOLERANCE;
    const errors = [];
    const warnings = [];
    const scopes = [];
    const flattened_dimensions = [];
    const input = shape || {};

    function visitScope(scope, path, inheritedWeight, depth) {
      const label = scopeLabel(scope, path.length ? path[path.length - 1] : 'root');
      const dims = asArray(scope && scope.dimensions);
      const l1 = absSum(dims);
      const scopePath = pathJoin(path.concat(label));
      const ok = within(l1, 1, tolerance);
      scopes.push({
        path: scopePath,
        label,
        depth,
        dimension_count: dims.length,
        local_l1: l1,
        inherited_global_weight: round(inheritedWeight),
        ok,
        belief_movement: 'none'
      });
      if (!dims.length) errors.push(`${scopePath} has no dimensions`);
      if (!ok) errors.push(`${scopePath} local L1 is ${l1}, expected 1`);

      dims.forEach((dim, index) => {
        const id = text(dim && (dim.id || dim.label || dim.name)) || `dimension_${index + 1}`;
        const localWeight = num(dim && dim.weight);
        const globalWeight = round(inheritedWeight * localWeight);
        const child = dim && (dim.local_shape || dim.child_shape || dim.children_shape);
        const dimPath = path.concat(label, id);
        if (child && asArray(child.dimensions).length) {
          visitScope(Object.assign({ label: id }, child), path.concat(label), globalWeight, depth + 1);
        } else {
          flattened_dimensions.push({
            path: pathJoin(dimPath),
            id,
            local_weight: round(localWeight),
            global_weight: globalWeight,
            abs_global_weight: round(Math.abs(globalWeight)),
            depth,
            belief_movement: 'none'
          });
        }
      });
    }

    visitScope(input, [], 1, 0);
    const root = scopes[0] || { local_l1: 0 };
    const flattened_l1 = round(flattened_dimensions.reduce((sum, d) => sum + Math.abs(num(d.global_weight)), 0));
    if (!within(flattened_l1, root.local_l1, Math.max(tolerance, 1e-9))) {
      errors.push(`flattened global L1 is ${flattened_l1}, expected root L1 ${root.local_l1}`);
    }
    const report = {
      packet_type: REPORT_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      tolerance,
      root_label: scopeLabel(input, 'root'),
      root_l1: root.local_l1,
      flattened_l1,
      scope_count: scopes.length,
      leaf_dimension_count: flattened_dimensions.length,
      scopes,
      flattened_dimensions,
      errors,
      warnings,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    return report;
  }

  function applyForce(shape, magnitude, options = {}) {
    const report = analyzeShape(shape, options);
    const m = num(magnitude);
    const force_dimensions = asArray(report.flattened_dimensions).map(d => Object.assign({}, d, {
      force: round(m * num(d.global_weight)),
      abs_force: round(Math.abs(m * num(d.global_weight))),
      force_rule: 'F_j = M · i_j',
      belief_movement: 'none'
    }));
    const force_l1 = round(force_dimensions.reduce((sum, d) => sum + Math.abs(num(d.force)), 0));
    return {
      packet_type: '42ndMind_unit_total_force_application_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: report.ok === true,
      magnitude: m,
      shape_l1: report.flattened_l1,
      force_l1,
      expected_force_l1_when_shape_ok: round(Math.abs(m)),
      equation: 'F = M · i, where ||i||_1 = 1',
      shape_report: report,
      force_dimensions,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function explainRule() {
    return {
      packet_type: '42ndMind_unit_total_rule_explanation_v0_1',
      packet_version: VERSION,
      statements: [
        'The goal is not to add more words. The goal is to split one overloaded dimension into role-specific dimensions while preserving Σ|d_i| = 1 at the active scope.',
        'A parent scope can be a complete active shape with L1 total 1.',
        'A child scope can unfold into its own local L1 total 1.',
        'The child does not add extra global mass because its global contribution is parent_weight × local_child_weight.',
        'Maturity means better internal partitioning of the same total, not more total shape.',
        'Force or intensity is applied separately as F = M · i.'
      ],
      equations: [
        '||i||_1 = 1',
        'Σ |parent_i| = 1',
        'Σ |child_j within parent_i| = 1',
        'global_child_ij = parent_i · child_ij',
        'Σ |global_child_ij| = 1',
        'F = M · i'
      ],
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelUnitTotalNestedShapeV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    REPORT_TYPE,
    DEFAULT_TOLERANCE,
    doctrine,
    defaultIntentShape,
    analyzeShape,
    applyForce,
    explainRule
  });
})(typeof window !== 'undefined' ? window : globalThis);
