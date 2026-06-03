(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindRealizationPlanCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;
  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(6));
  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));

  function axis(row) {
    if (Array.isArray(row)) return String(row[0] == null ? '∅' : row[0]);
    return String((row && (row.σ || row.axis || row.dimension)) || '∅');
  }

  function weight(row) {
    if (Array.isArray(row)) return Number(row[1]) || 0;
    return Number(row && (row.w || row.weight)) || 0;
  }

  function normalize(rows, fallback) {
    const clean = A(rows).map(row => ({ σ: axis(row), w: weight(row) })).filter(row => row.σ && row.w !== 0);
    if (!clean.length) return [{ σ: fallback || '∅', w: 1 }];
    const total = clean.reduce((sum, row) => sum + Math.abs(row.w), 0) || 1;
    let used = 0;
    return clean.map((row, index) => {
      const sign = row.w < 0 ? -1 : 1;
      const magnitude = index === clean.length - 1 ? Math.max(0, 1 - used) : Math.abs(row.w) / total;
      const w = R(sign * magnitude);
      used = R(used + Math.abs(w));
      return { σ: row.σ, w };
    });
  }

  function l1(field) {
    return R(A(field).reduce((sum, row) => sum + Math.abs(weight(row)), 0));
  }

  function checksum(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value || null);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  function action(candidate) {
    const c = candidate || {};
    const op = c.operator || 'unknown_gap_operator';
    if (op === 'expected_actual_alignment_operator') {
      return { id: 'φ' + checksum(c).slice(0, 10), operator: op, class: 'contract_alignment', realization: 'compare_expected_actual_values', status: 'ready_for_design', source_failure: c.source_failure };
    }
    if (op === 'unit_restoration_operator') {
      return { id: 'φ' + checksum(c).slice(0, 10), operator: op, class: 'unit_total_restoration', realization: 'restore_normalized_field_total', status: 'ready_for_design', source_failure: c.source_failure };
    }
    if (op === 'validator_repair_operator') {
      return { id: 'φ' + checksum(c).slice(0, 10), operator: op, class: 'validator_alignment', realization: 'align_validator_contract', status: 'ready_for_design', source_failure: c.source_failure };
    }
    return { id: 'φ' + checksum(c).slice(0, 10), operator: op, class: 'unclassified', realization: 'classify_before_design', status: 'needs_classification', source_failure: c.source_failure };
  }

  function plan(synthesis, context) {
    const actions = A(synthesis && synthesis.candidates).map(action);
    const Φ = normalize(actions.map(item => ({ σ: 'Φ:' + item.class + ':' + item.realization, w: item.status === 'needs_classification' ? 0.5 : 1 })), 'Φ0');
    const decision = !actions.length
      ? { code: 'no_plan', confidence: 1, summary: 'No candidate operators were available.' }
      : actions.some(item => item.status === 'needs_classification')
        ? { code: 'plan_needs_classification', confidence: 0.72, summary: 'A realization plan exists, but at least one candidate needs classification.' }
        : { code: 'plan_ready', confidence: 0.78, summary: 'Candidate operators were converted into realization actions.' };

    return {
      packet_type: '42ndMind_realization_plan_v0_1',
      version: VERSION,
      id: 'Φ' + checksum({ synthesis, context }).slice(0, 10),
      source_synthesis_id: synthesis && synthesis.id,
      actions: C(actions),
      fields: { Φ },
      unit: { Φ: l1(Φ), ok: Math.abs(l1(Φ) - 1) < EPS },
      decision,
      ξ: ''
    };
  }

  function compact(packet) {
    return {
      decision: packet && packet.decision,
      action_count: A(packet && packet.actions).length,
      actions: A(packet && packet.actions).map(item => ({ class: item.class, realization: item.realization, status: item.status, source_failure: item.source_failure })),
      unit: packet && packet.unit,
      ξ: ''
    };
  }

  return Object.freeze({ VERSION, plan, compact, normalize, l1 });
});
