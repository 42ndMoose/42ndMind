/* 42ndMind Objective Language Shape Bridge v0.1
 * Bridges semantic compressed vectors into unit-total active shapes.
 *
 * This is the first controlled merge point between:
 *   semantic corpus/vector compression
 * and
 *   ||i||_1 = 1, F = M · i
 *
 * It does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_objective_language_shape_bridge_v0_1';
  const SHAPE_PACKET_TYPE = '42ndMind_semantic_vector_as_unit_total_shape_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function num(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function round(value) { return Number(num(value).toFixed(12)); }
  function absSumPairs(pairs) { return round(asArray(pairs).reduce((sum, pair) => sum + Math.abs(num(pair[1])), 0)); }
  function safeId(value) { return text(value).replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'dimension'; }

  function doctrine() {
    return {
      semantic_vectors_can_be_projected_into_unit_total_shapes: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      parent_active_shape_can_equal_one_while_children_have_local_one: true,
      mature_scope_remains_one_with_more_dimensions: true,
      force_intensity_remains_separate_from_shape: true,
      local_labels_are_metadata_only: true,
      anonymous_shape_signature_is_for_structure_not_truth: true,
      semantic_bridge_does_not_move_belief: true,
      semantic_bridge_does_not_promote_doctrine: true,
      semantic_bridge_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function unitKernel() {
    if (!global.KernelUnitTotalNestedShapeV01) throw new Error('KernelUnitTotalNestedShapeV01 unavailable');
    return global.KernelUnitTotalNestedShapeV01;
  }

  function compressor() {
    if (!global.KernelSemanticVectorCompressorV01) throw new Error('KernelSemanticVectorCompressorV01 unavailable');
    return global.KernelSemanticVectorCompressorV01;
  }

  function normalizeMap(map) {
    const pairs = Object.entries(map || {}).map(([key, value]) => [text(key), num(value)]).filter(pair => pair[0] && pair[1] !== 0);
    const total = absSumPairs(pairs) || 1;
    const out = {};
    pairs.forEach(([key, value]) => { out[key] = round(value / total); });
    return out;
  }

  function weightedDimensionsFromMap(map, metadata = {}) {
    const normalized = normalizeMap(map);
    return Object.entries(normalized).sort((a, b) => a[0].localeCompare(b[0])).map(([key, weight]) => ({
      id: safeId(key),
      weight,
      metadata: Object.assign({}, clone(metadata), { source_label: key, local_label_metadata_only: true })
    }));
  }

  function vectorBasisMap(vector, basis) {
    const selected = text(basis || 'pressure');
    if (selected === 'operator') return vector && vector.operator_vector || {};
    if (selected === 'pressure_family') return vector && vector.pressure_family_vector || {};
    if (selected === 'blocked_movement') return vector && vector.blocked_movement_vector || {};
    if (selected === 'required_check') return vector && vector.required_check_vector || {};
    if (selected === 'allowed_movement') return vector && vector.allowed_movement_vector || {};
    return vector && vector.pressure_vector || {};
  }

  function semanticVectorToShape(vector, options = {}) {
    const basis = text(options.basis || 'pressure');
    const dimensions = weightedDimensionsFromMap(vectorBasisMap(vector, basis), {
      basis,
      entry_id: text(vector && vector.entry_id),
      pressure_signature: text(vector && vector.pressure_signature)
    });
    const shape = {
      packet_type: SHAPE_PACKET_TYPE,
      packet_version: VERSION,
      label: text(options.label || `semantic_${basis}_shape_${text(vector && vector.entry_id) || 'unknown'}`),
      source_vector: {
        entry_id: text(vector && vector.entry_id),
        text: text(vector && vector.text),
        operator_group: text(vector && vector.operator_group),
        pressure_signature: text(vector && vector.pressure_signature),
        basis
      },
      dimensions,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    const report = unitKernel().analyzeShape(shape);
    return {
      packet_type: '42ndMind_semantic_vector_unit_total_shape_projection_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: report.ok === true,
      basis,
      shape,
      shape_report: report,
      anonymous_signature: anonymousShapeSignature(report),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function bridgeVectorSpace(vectorSpace, options = {}) {
    const basis = text(options.basis || 'pressure');
    const limit = Number(options.limit || 0);
    const vectors = limit > 0 ? asArray(vectorSpace && vectorSpace.vectors).slice(0, limit) : asArray(vectorSpace && vectorSpace.vectors);
    const projections = vectors.map(vector => semanticVectorToShape(vector, { basis }));
    const okCount = projections.filter(p => p.ok).length;
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: okCount === projections.length,
      basis,
      source_vector_count: asArray(vectorSpace && vectorSpace.vectors).length,
      projected_count: projections.length,
      ok_count: okCount,
      failed_count: projections.length - okCount,
      projection_summary: summarizeProjections(projections),
      projections,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function summarizeProjections(projections) {
    const rows = asArray(projections);
    const signatureCounts = {};
    rows.forEach(row => { signatureCounts[row.anonymous_signature] = (signatureCounts[row.anonymous_signature] || 0) + 1; });
    return {
      projection_count: rows.length,
      ok_count: rows.filter(r => r.ok).length,
      anonymous_signature_count: Object.keys(signatureCounts).length,
      repeated_anonymous_signatures: Object.entries(signatureCounts).filter(([, count]) => count > 1).map(([signature, count]) => ({ signature, count })).sort((a, b) => b.count - a.count),
      belief_movement: 'none'
    };
  }

  function anonymousShapeSignature(report) {
    const leaves = asArray(report && report.flattened_dimensions).map(d => Math.abs(num(d.global_weight))).sort((a, b) => b - a).map(v => round(v).toFixed(6));
    const scopeArities = asArray(report && report.scopes).map(s => Number(s.dimension_count) || 0).sort((a, b) => b - a).join(',');
    return `L1:${round(report && report.flattened_l1).toFixed(6)}|leaves:${leaves.join(',')}|scopes:${scopeArities}`;
  }

  function renameShapeLabels(shape, prefix = 'r') {
    const source = clone(shape || {});
    let n = 0;
    function visit(scope) {
      scope.label = `${prefix}_scope_${++n}`;
      asArray(scope.dimensions).forEach(dim => {
        dim.id = `${prefix}_dim_${++n}`;
        if (dim.metadata) dim.metadata.source_label = `${prefix}_label_${n}`;
        const child = dim.local_shape || dim.child_shape || dim.children_shape;
        if (child && Array.isArray(child.dimensions)) visit(child);
      });
    }
    visit(source);
    return source;
  }

  function labelInvarianceCheck(shape) {
    const kernel = unitKernel();
    const original = kernel.analyzeShape(shape);
    const renamedShape = renameShapeLabels(shape, 'anon');
    const renamed = kernel.analyzeShape(renamedShape);
    const originalSignature = anonymousShapeSignature(original);
    const renamedSignature = anonymousShapeSignature(renamed);
    return {
      packet_type: '42ndMind_label_invariance_check_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: original.ok === true && renamed.ok === true && originalSignature === renamedSignature,
      original_signature: originalSignature,
      renamed_signature: renamedSignature,
      original_report: original,
      renamed_report: renamed,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function semanticShapeObservation(projection) {
    const p = projection || {};
    return {
      packet_type: '42ndMind_unit_total_semantic_shape_observation_v0_1',
      packet_version: VERSION,
      source_entry_id: p.shape && p.shape.source_vector && p.shape.source_vector.entry_id || '',
      source_pressure_signature: p.shape && p.shape.source_vector && p.shape.source_vector.pressure_signature || '',
      basis: p.basis || 'pressure',
      anonymous_shape_signature: p.anonymous_signature || '',
      root_l1: p.shape_report && p.shape_report.root_l1,
      flattened_l1: p.shape_report && p.shape_report.flattened_l1,
      leaf_dimension_count: p.shape_report && p.shape_report.leaf_dimension_count,
      interpretation: 'semantic vector projected into unit-total active shape; labels remain metadata only',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadCompressAndBridge(options = {}) {
    const packet = await compressor().loadCombinedAndCompress(options);
    const bridge = bridgeVectorSpace(packet.vector_space, options);
    return {
      packet_type: '42ndMind_semantic_compress_to_unit_total_bridge_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: packet.ok === true && bridge.ok === true,
      compressed_packet: packet,
      bridge_report: bridge,
      observations: bridge.projections.map(semanticShapeObservation),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelObjectiveLanguageShapeBridgeV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    SHAPE_PACKET_TYPE,
    doctrine,
    normalizeMap,
    weightedDimensionsFromMap,
    vectorBasisMap,
    semanticVectorToShape,
    bridgeVectorSpace,
    summarizeProjections,
    anonymousShapeSignature,
    renameShapeLabels,
    labelInvarianceCheck,
    semanticShapeObservation,
    loadCompressAndBridge
  });
})(typeof window !== 'undefined' ? window : globalThis);
