/* 42ndMind Growth Target Deriver
 * Builds provisional growth targets from the kernel's own state pressure.
 *
 * This does not discover final truth. It converts repeated truth, memory, and
 * language-context pressure into a unit-total target that the growth breather can
 * optimize toward. The target remains provisional and review-gated.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.3';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }
  function id(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'term'; }

  function ensure(state) {
    if (!state.growthTargetDeriver) state.growthTargetDeriver = {
      packet_type: '42ndMind_growth_target_deriver_v0_1',
      packet_version: VERSION,
      doctrine: {
        target_derived_from_internal_pressure: true,
        semantic_core_retention_required: true,
        normalized_pressure_blend: true,
        semantic_core_floor: true,
        target_is_not_truth: true,
        target_is_not_doctrine: true,
        shared_substrate_link_required: true,
        breathing_loop_may_optimize_target: true
      },
      targets: [],
      pressure_packets: [],
      updated_at: now()
    };
    state.growthTargetDeriver.packet_version = VERSION;
    state.growthTargetDeriver.doctrine.semantic_core_retention_required = true;
    state.growthTargetDeriver.doctrine.normalized_pressure_blend = true;
    state.growthTargetDeriver.doctrine.semantic_core_floor = true;
    return state.growthTargetDeriver;
  }

  function add(map, dimension, weight) {
    const key = id(dimension);
    map[key] = Math.max(0, Number(map[key] || 0) + Number(weight || 0));
  }

  function mapTotal(source) {
    return Object.keys(source || {}).reduce((sum, key) => sum + Math.abs(Number(source[key]) || 0), 0);
  }

  function normalizeMap(source) {
    const total = mapTotal(source) || 1;
    const out = {};
    Object.keys(source || {}).forEach(key => { out[key] = Math.max(0, Number(source[key] || 0) / total); });
    return out;
  }

  function scaleMap(source, factor) {
    const out = {};
    Object.keys(source || {}).forEach(key => { out[key] = Math.max(0, Number(source[key] || 0) * factor); });
    return out;
  }

  function dimensionsToMap(rows, multiplier) {
    const out = {};
    arr(rows).forEach(row => add(out, row.dimension, Number(row.weight || 0) * (multiplier == null ? 1 : multiplier)));
    return out;
  }

  function mergeInto(target, source) {
    Object.keys(source || {}).forEach(key => add(target, key, source[key]));
    return target;
  }

  function includesTerm(text, term) {
    return String(text || '').toLowerCase().includes(String(term || '').toLowerCase());
  }

  function baseMapping(state, term) {
    const key = id(term);
    const semantic = state.semanticBasis && state.semanticBasis.meanings && state.semanticBasis.meanings[key];
    if (semantic && arr(semantic.dimensions).length) return { source: 'semantic_basis', map: dimensionsToMap(semantic.dimensions, 1) };
    const language = state.language && state.language.term_fields && state.language.term_fields[key];
    if (language && arr(language.dimensions).length) return { source: 'language_term_field', map: dimensionsToMap(language.dimensions, 1) };
    return { source: 'fallback_underdefined', map: { underdefined_reference: 1 } };
  }

  function pressureFromSnapshot(snapshot, scale) {
    const map = {};
    const s = snapshot || {};
    const k = scale == null ? 1 : scale;
    add(map, 'evidence_requirement', k * (Number(s.verification_need || 0) * 0.12 + Number(s.support_pressure || 0) * 0.08 + Number(s.global_support_pressure || 0) * 0.04));
    add(map, 'truth_gap_visibility', k * (Number(s.unresolved_pressure || 0) * 0.12 + Number(s.global_unresolved_pressure || 0) * 0.08));
    add(map, 'false_certainty_resistance', k * (Number(s.counter_pressure || 0) * 0.1 + Number(s.contradiction_pressure || 0) * 0.14 + Number(s.global_contradiction_pressure || 0) * 0.08));
    add(map, 'self_correction', k * (Number(s.counter_pressure || 0) * 0.08 + Number(s.contradiction_pressure || 0) * 0.1 + Number(s.semantic_precision_need || 0) * 0.06));
    add(map, 'reality_contact', k * (Number(s.verification_need || 0) * 0.08));
    return map;
  }

  function collectPressure(state, term) {
    const key = id(term);
    const base = baseMapping(state, key);
    const packet = {
      term: key,
      base_source: base.source,
      base_map: base.map,
      pressure_only_map: {},
      semantic_requirement_count: 0,
      truth_context_count: 0,
      truth_pressure_snapshot_count: 0,
      language_memory_feedback_count: 0,
      derived_from_claim_ids: [],
      derived_from_sources: [],
      pressure_map: {},
      blend_method: 'normalized_base_pressure_blend_with_core_floor',
      at: now()
    };

    arr(state.truth && state.truth.semantic_requirements).filter(item => item.term === key).forEach(item => {
      packet.semantic_requirement_count += 1;
      arr(item.dimensions).forEach(dim => add(packet.pressure_only_map, dim, 0.035));
    });

    arr(state.beliefMemory && state.beliefMemory.truth_context_items).filter(item => includesTerm(item.text, key) || item.claim_id === key || item.target_claim_id === key).forEach(item => {
      packet.truth_context_count += 1;
      if (item.claim_id) packet.derived_from_claim_ids.push(item.claim_id);
      if (item.target_claim_id) packet.derived_from_claim_ids.push(item.target_claim_id);
      if (item.source_id) packet.derived_from_sources.push(item.source_id);
      mergeInto(packet.pressure_only_map, pressureFromSnapshot(item.pressure_snapshot, 1));
      if (item.kind === 'truth_evidence_context') add(packet.pressure_only_map, 'evidence_requirement', 0.08);
      if (item.kind === 'truth_counterclaim_context') {
        add(packet.pressure_only_map, 'truth_gap_visibility', 0.08);
        add(packet.pressure_only_map, 'false_certainty_resistance', 0.08);
        add(packet.pressure_only_map, 'self_correction', 0.06);
      }
      if (item.shared_substrate_activation_id) add(packet.pressure_only_map, 'shared_substrate_trace', 0.025);
    });

    arr(state.beliefMemory && state.beliefMemory.truth_pressure_snapshots).filter(item => item.claim_id === key || String(item.claim_id || '').includes(key)).forEach(item => {
      packet.truth_pressure_snapshot_count += 1;
      mergeInto(packet.pressure_only_map, pressureFromSnapshot(item.pressure_snapshot, 0.8));
    });

    arr(state.language && state.language.semantic_memory_feedback).filter(item => item.term === key).forEach(item => {
      packet.language_memory_feedback_count += 1;
      arr(item.dimensions).forEach(dim => add(packet.pressure_only_map, dim, 0.025));
      if (Number(item.truth_context_count || 0) > 0) add(packet.pressure_only_map, 'belief_memory_context', 0.035);
    });

    packet.derived_from_claim_ids = Array.from(new Set(packet.derived_from_claim_ids)).slice(0, 12);
    packet.derived_from_sources = Array.from(new Set(packet.derived_from_sources)).slice(0, 12);
    packet.pressure_map = blendBaseWithPressure(packet.base_map, packet.pressure_only_map, { base_weight: 0.62, pressure_weight: 0.38, core_floor_ratio: 0.72 });
    return packet;
  }

  function strongestBaseDimensions(normalizedBase, count) {
    return Object.keys(normalizedBase || {})
      .map(key => ({ key, weight: Number(normalizedBase[key]) || 0 }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, count || 2);
  }

  function enforceCoreFloor(blended, normalizedBase, ratio) {
    const out = Object.assign({}, blended);
    strongestBaseDimensions(normalizedBase, 2).forEach(row => {
      const floor = row.weight * (ratio == null ? 0.72 : ratio);
      if ((out[row.key] || 0) < floor) out[row.key] = floor;
    });
    return normalizeMap(out);
  }

  function blendBaseWithPressure(baseMap, pressureMap, options) {
    const baseWeight = Number(options && options.base_weight || 0.62);
    const pressureWeight = Number(options && options.pressure_weight || 0.38);
    const coreFloorRatio = Number(options && options.core_floor_ratio || 0.72);
    const normalizedBase = normalizeMap(baseMap);
    const normalizedPressure = mapTotal(pressureMap) > 0 ? normalizeMap(pressureMap) : {};
    const blended = {};
    mergeInto(blended, scaleMap(normalizedBase, baseWeight));
    mergeInto(blended, scaleMap(normalizedPressure, pressureWeight));
    return enforceCoreFloor(blended, normalizedBase, coreFloorRatio);
  }

  function activate(state, target) {
    if (!global.FortySecondMindSharedSubstrate) return null;
    const activation = global.FortySecondMindSharedSubstrate.activate(state, {
      source_organ: 'growth_target_deriver',
      source_event: 'growth_target_derivation',
      kind: 'pressure_derived_growth_target',
      term: target.term,
      dimensions: target.dimensions,
      status: 'derived_target_not_truth_not_committed'
    });
    return activation && activation.id;
  }

  function deriveTarget(state, term, options) {
    const box = ensure(state);
    const key = id(term);
    const packet = collectPressure(state, key);
    const fromMap = global.FortySecondMindGrowthBreather && global.FortySecondMindGrowthBreather.fromMap;
    if (!fromMap) return null;
    const target = fromMap(key, 'pressure_derived_target_not_committed', packet.pressure_map, 'Derived from internal truth, memory, and language pressure while preserving semantic core.');
    target.target_source = 'derived_from_truth_memory_language_pressure';
    target.derivation_method = 'semantic_core_blend_v0_3_core_floor';
    target.semantic_core_source = packet.base_source;
    target.semantic_core_retention = 0.62;
    target.pressure_influence = 0.38;
    target.semantic_core_floor_ratio = 0.72;
    target.source_counts = {
      semantic_requirement_count: packet.semantic_requirement_count,
      truth_context_count: packet.truth_context_count,
      truth_pressure_snapshot_count: packet.truth_pressure_snapshot_count,
      language_memory_feedback_count: packet.language_memory_feedback_count
    };
    target.derived_from_claim_ids = packet.derived_from_claim_ids;
    target.derived_from_sources = packet.derived_from_sources;
    target.truth_status = 'target_not_truth';
    target.promotion_status = 'not_committed';
    target.shared_substrate_activation_id = activate(state, target);
    box.pressure_packets.unshift(packet);
    box.targets.unshift(target);
    box.pressure_packets = box.pressure_packets.slice(0, 80);
    box.targets = box.targets.slice(0, 80);
    box.updated_at = now();
    return target;
  }

  global.FortySecondMindGrowthTargetDeriver = Object.freeze({
    VERSION,
    ensure,
    baseMapping,
    collectPressure,
    deriveTarget,
    pressureFromSnapshot,
    blendBaseWithPressure,
    normalizeMap,
    mapTotal,
    enforceCoreFloor,
    strongestBaseDimensions
  });
})(typeof window !== 'undefined' ? window : globalThis);
