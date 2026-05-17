/* 42ndMind Objective Language Invariance Benchmark v0.1
 * Fixed pilot benchmark for unit-total objective-language invariance.
 *
 * Tests:
 * - paraphrase / translation-like invariance
 * - minimal-pair role separation
 * - force/shape separation
 * - nested unit-total preservation
 *
 * This module does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_objective_language_invariance_benchmark_v0_1';
  const DEFAULT_CASE_URL = 'data/objective_language_invariance_benchmark_cases_v0_1.json';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function num(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function round(value) { return Number(num(value).toFixed(12)); }
  function near(a, b, tol) { return Math.abs(num(a) - num(b)) <= num(tol || 1e-9); }
  function safeId(value) { return text(value).replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'dimension'; }
  function absSumMap(map) { return round(Object.values(map || {}).reduce((sum, v) => sum + Math.abs(num(v)), 0)); }

  function doctrine() {
    return {
      benchmark_is_pilot_validation_not_final_scientific_proof: true,
      benchmark_cases_are_test_inputs_not_doctrine: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      paraphrase_and_translation_should_preserve_shape_when_role_is_unchanged: true,
      minimal_pairs_should_split_when_role_changes: true,
      force_intensity_remains_separate_from_shape: true,
      local_labels_are_metadata_only: true,
      anonymous_signature_tests_structure_not_truth: true,
      benchmark_does_not_move_belief: true,
      benchmark_does_not_promote_doctrine: true,
      benchmark_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function unitKernel() {
    if (!global.KernelUnitTotalNestedShapeV01) throw new Error('KernelUnitTotalNestedShapeV01 unavailable');
    return global.KernelUnitTotalNestedShapeV01;
  }

  function bridge() {
    if (!global.KernelObjectiveLanguageShapeBridgeV01) throw new Error('KernelObjectiveLanguageShapeBridgeV01 unavailable');
    return global.KernelObjectiveLanguageShapeBridgeV01;
  }

  function normalizeMap(map) {
    const total = absSumMap(map) || 1;
    const out = {};
    Object.keys(map || {}).sort().forEach(key => {
      const v = num(map[key]);
      if (v !== 0) out[key] = round(v / total);
    });
    return out;
  }

  function shapeFromMap(map, label) {
    const normalized = normalizeMap(map);
    return {
      packet_type: '42ndMind_objective_language_benchmark_shape_v0_1',
      packet_version: VERSION,
      label: text(label || 'benchmark_shape'),
      dimensions: Object.entries(normalized).map(([key, weight]) => ({
        id: safeId(key),
        weight,
        metadata: { source_label: key, local_label_metadata_only: true }
      })),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function evaluateVariant(variant, options = {}) {
    const shape = variant && variant.shape ? clone(variant.shape) : shapeFromMap(variant && variant.expected_dimensions || {}, variant && variant.variant_id);
    const report = unitKernel().analyzeShape(shape, options);
    const signature = bridge().anonymousShapeSignature(report);
    const labelCheck = bridge().labelInvarianceCheck(shape);
    const magnitude = Number.isFinite(Number(variant && variant.magnitude)) ? Number(variant.magnitude) : null;
    const force = magnitude == null ? null : unitKernel().applyForce(shape, magnitude, options);
    return {
      variant_id: text(variant && variant.variant_id || shape.label),
      language: text(variant && variant.language || 'shape'),
      text: text(variant && variant.text || ''),
      ok: report.ok === true && labelCheck.ok === true && (!force || force.ok === true),
      magnitude,
      anonymous_signature: signature,
      root_l1: report.root_l1,
      flattened_l1: report.flattened_l1,
      leaf_dimension_count: report.leaf_dimension_count,
      shape_report: report,
      label_invariance: {
        ok: labelCheck.ok === true,
        original_signature: labelCheck.original_signature,
        renamed_signature: labelCheck.renamed_signature
      },
      force_l1: force && force.force_l1,
      expected_force_l1_when_shape_ok: force && force.expected_force_l1_when_shape_ok,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function evaluateSameStructureGroup(group, options = {}) {
    const variants = asArray(group && group.variants).map(v => evaluateVariant(v, options));
    const signatures = Array.from(new Set(variants.map(v => v.anonymous_signature)));
    const ok = variants.length > 0 && variants.every(v => v.ok) && signatures.length === 1 && variants.every(v => near(v.root_l1, 1) && near(v.flattened_l1, 1));
    return {
      group_id: text(group && group.group_id),
      group_type: 'same_structure',
      passed: ok,
      expected: 'all variants preserve one anonymous signature',
      signature_count: signatures.length,
      signatures,
      variant_count: variants.length,
      variants,
      belief_movement: 'none'
    };
  }

  function evaluateDifferentStructureGroup(group, options = {}) {
    const variants = asArray(group && group.variants).map(v => evaluateVariant(v, options));
    const signatures = Array.from(new Set(variants.map(v => v.anonymous_signature)));
    const ok = variants.length > 1 && variants.every(v => v.ok) && signatures.length === variants.length && variants.every(v => near(v.root_l1, 1) && near(v.flattened_l1, 1));
    return {
      group_id: text(group && group.group_id),
      group_type: 'different_structure',
      passed: ok,
      expected: 'role-changing minimal pairs produce distinct anonymous signatures',
      signature_count: signatures.length,
      signatures,
      variant_count: variants.length,
      variants,
      belief_movement: 'none'
    };
  }

  function evaluateForceGroup(group, options = {}) {
    const variants = asArray(group && group.variants).map(v => evaluateVariant(v, options));
    const signatures = Array.from(new Set(variants.map(v => v.anonymous_signature)));
    const forceValues = variants.map(v => v.force_l1);
    const expectedValues = variants.map(v => Math.abs(num(v.magnitude)));
    const shapeOk = signatures.length === 1;
    const forceOk = variants.every((v, i) => near(v.force_l1, expectedValues[i]));
    const differentForce = new Set(forceValues.map(v => String(v))).size > 1;
    const ok = variants.length > 1 && variants.every(v => v.ok) && shapeOk && forceOk && differentForce;
    return {
      group_id: text(group && group.group_id),
      group_type: 'force_same_shape_different_magnitude',
      passed: ok,
      expected: 'same anonymous shape, different force magnitudes',
      signature_count: signatures.length,
      signatures,
      force_values: forceValues,
      expected_force_values: expectedValues,
      variant_count: variants.length,
      variants,
      belief_movement: 'none'
    };
  }

  function evaluateNestedGroup(group, options = {}) {
    const shape = clone(group && group.shape || {});
    const report = unitKernel().analyzeShape(shape, options);
    const signature = bridge().anonymousShapeSignature(report);
    const labelCheck = bridge().labelInvarianceCheck(shape);
    const childScopes = asArray(report.scopes).filter(s => s.depth > 0);
    const ok = report.ok === true && labelCheck.ok === true && near(report.root_l1, 1) && near(report.flattened_l1, 1) && childScopes.length > 0 && childScopes.every(s => near(s.local_l1, 1));
    return {
      group_id: text(group && group.group_id),
      group_type: 'nested_unit_total',
      passed: ok,
      expected: 'root L1 equals 1, flattened L1 equals 1, and each child scope has local L1 equals 1',
      anonymous_signature: signature,
      root_l1: report.root_l1,
      flattened_l1: report.flattened_l1,
      child_scope_count: childScopes.length,
      child_scopes: childScopes,
      shape_report: report,
      label_invariance: {
        ok: labelCheck.ok === true,
        original_signature: labelCheck.original_signature,
        renamed_signature: labelCheck.renamed_signature
      },
      belief_movement: 'none'
    };
  }

  function evaluateGroup(group, options = {}) {
    const type = text(group && group.group_type);
    if (type === 'same_structure') return evaluateSameStructureGroup(group, options);
    if (type === 'different_structure') return evaluateDifferentStructureGroup(group, options);
    if (type === 'force_same_shape_different_magnitude') return evaluateForceGroup(group, options);
    if (type === 'nested_unit_total') return evaluateNestedGroup(group, options);
    return { group_id: text(group && group.group_id), group_type: type || 'unknown', passed: false, error: 'unknown_group_type', belief_movement: 'none' };
  }

  function summarize(groupReports) {
    const rows = asArray(groupReports);
    const passed = rows.filter(r => r.passed === true).length;
    const total = rows.length;
    const same = rows.filter(r => r.group_type === 'same_structure');
    const diff = rows.filter(r => r.group_type === 'different_structure');
    const force = rows.filter(r => r.group_type === 'force_same_shape_different_magnitude');
    const nested = rows.filter(r => r.group_type === 'nested_unit_total');
    return {
      group_count: total,
      passed_group_count: passed,
      failed_group_count: total - passed,
      pass_rate: total ? round(passed / total) : 0,
      same_structure_pass_rate: same.length ? round(same.filter(r => r.passed).length / same.length) : null,
      minimal_pair_separation_pass_rate: diff.length ? round(diff.filter(r => r.passed).length / diff.length) : null,
      force_shape_separation_pass_rate: force.length ? round(force.filter(r => r.passed).length / force.length) : null,
      nested_unit_total_pass_rate: nested.length ? round(nested.filter(r => r.passed).length / nested.length) : null,
      benchmark_claim_supported: passed === total && total > 0,
      scientific_status: passed === total && total > 0 ? 'pilot_internal_validation_passed_not_final_scientific_proof' : 'pilot_internal_validation_failed',
      belief_movement: 'none'
    };
  }

  function runBenchmark(casesPacket, options = {}) {
    const groups = asArray(casesPacket && casesPacket.groups);
    const group_reports = groups.map(group => evaluateGroup(group, options));
    const summary = summarize(group_reports);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: summary.benchmark_claim_supported === true,
      case_packet_type: text(casesPacket && casesPacket.packet_type),
      summary,
      group_reports,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function fetchJson(url) {
    if (typeof fetch !== 'function') throw new Error('fetch_unavailable');
    const target = `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(VERSION)}`;
    const res = await fetch(target, { cache: 'no-store' });
    if (!res.ok) throw new Error(`fetch_failed_${res.status}_${url}`);
    return res.json();
  }

  async function loadAndRun(options = {}) {
    const url = text(options.case_url || DEFAULT_CASE_URL);
    const cases = await fetchJson(url);
    const report = runBenchmark(cases, options);
    report.case_url = url;
    return report;
  }

  global.KernelObjectiveLanguageInvarianceBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    DEFAULT_CASE_URL,
    doctrine,
    normalizeMap,
    shapeFromMap,
    evaluateVariant,
    evaluateSameStructureGroup,
    evaluateDifferentStructureGroup,
    evaluateForceGroup,
    evaluateNestedGroup,
    evaluateGroup,
    summarize,
    runBenchmark,
    loadAndRun
  });
})(typeof window !== 'undefined' ? window : globalThis);
