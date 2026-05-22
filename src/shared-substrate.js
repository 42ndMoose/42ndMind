/* 42ndMind Shared Substrate
 * One shared activation layer for all organs.
 *
 * The substrate does not speak and does not decide truth. It records unit-total
 * activations produced by the kernel, then lets organs leave traces against the
 * same activation IDs. This prevents one-way modules from acting like separate
 * minds.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(value) { return global.FortySecondMindBrainState.arr(value); }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }
  function id(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function l1Total(rows) { return round(arr(rows).reduce((sum, row) => sum + Math.abs(Number(row.weight) || 0), 0)); }

  function normalizeSigned(dimensions) {
    const rows = arr(dimensions).map(row => {
      if (Array.isArray(row)) return { dimension: id(row[0]), weight: Number(row[1]) || 0 };
      if (typeof row === 'string') return { dimension: id(row), weight: 1 };
      return { dimension: id(row.dimension), weight: Number(row.weight) || 0 };
    }).filter(row => row.dimension && row.weight !== 0);

    const total = rows.reduce((sum, row) => sum + Math.abs(row.weight), 0) || 1;
    let running = 0;
    return rows.map((row, index) => {
      const sign = row.weight < 0 ? -1 : 1;
      const magnitude = index === rows.length - 1 ? Math.max(0, 1 - running) : Math.abs(row.weight) / total;
      const weight = round(sign * magnitude);
      running = round(running + Math.abs(weight));
      return { dimension: row.dimension, weight };
    });
  }

  function ensure(state) {
    if (!state.sharedSubstrate) {
      state.sharedSubstrate = {
        packet_type: '42ndMind_shared_substrate_v0_1',
        packet_version: VERSION,
        doctrine: {
          one_brain_shared_activation_layer: true,
          unit_total_activations: true,
          organs_leave_traces_not_private_minds: true,
          no_speech_generation: true,
          no_truth_promotion: true
        },
        activations: [],
        current_activation_ids: [],
        organ_links: [],
        unit_checks: [],
        updated_at: now()
      };
    }
    return state.sharedSubstrate;
  }

  function activate(state, packet) {
    const substrate = ensure(state);
    const dimensions = normalizeSigned(packet && packet.dimensions || [['unclassified_pressure', 1]]);
    const activation = {
      id: 'substrate_activation_' + (substrate.activations.length + 1),
      source_event: packet && packet.source_event || null,
      source_organ: packet && packet.source_organ || 'kernel',
      kind: packet && packet.kind || 'semantic_activation',
      term: id(packet && packet.term || 'activation'),
      unit_total: 1,
      dimensions,
      l1_total: l1Total(dimensions),
      status: packet && packet.status || 'active_shared_substrate_packet',
      at: now()
    };
    substrate.activations.unshift(activation);
    substrate.current_activation_ids.unshift(activation.id);
    substrate.current_activation_ids = substrate.current_activation_ids.slice(0, 20);
    substrate.unit_checks.unshift({ id: activation.id, term: activation.term, ok: Math.abs(activation.l1_total - 1) < 0.00001, l1_total: activation.l1_total, at: now() });
    substrate.activations = substrate.activations.slice(0, 120);
    substrate.unit_checks = substrate.unit_checks.slice(0, 120);
    substrate.updated_at = now();
    return activation;
  }

  function applySemanticFocus(state, event) {
    const focus = state.semanticFocus || {};
    const activations = [];
    arr(focus.admitted).forEach(meaning => {
      activations.push(activate(state, {
        source_event: event && event.id,
        source_organ: 'semantic_basis',
        kind: 'admitted_meaning_activation',
        term: meaning.term,
        dimensions: meaning.dimensions,
        status: 'admitted_into_shared_substrate'
      }));
    });
    arr(focus.activated).forEach(activation => {
      activations.push(activate(state, {
        source_event: event && event.id,
        source_organ: 'language_field',
        kind: 'known_meaning_reactivation',
        term: activation.term,
        dimensions: activation.dimensions,
        status: 'reactivated_in_shared_substrate'
      }));
    });
    arr(focus.memory_feedback).forEach(feedback => {
      const dimensions = arr(feedback.dimensions).length ? arr(feedback.dimensions).map(d => [d, 1]) : [['memory_context_pressure', 1]];
      activations.push(activate(state, {
        source_event: event && event.id,
        source_organ: 'language_field',
        kind: 'language_memory_context_pressure',
        term: feedback.term,
        dimensions,
        status: 'memory_context_pressure_not_truth'
      }));
    });
    arr(focus.receptor_hits).forEach(hit => {
      activations.push(activate(state, {
        source_event: event && event.id,
        source_organ: 'language_field',
        kind: 'receptor_dimension_pressure',
        term: hit.dimension,
        dimensions: [[hit.dimension, 1]],
        status: 'dimension_pressure_in_shared_substrate'
      }));
    });
    arr(focus.rejected).forEach(rejection => {
      activations.push(activate(state, {
        source_event: event && event.id,
        source_organ: 'semantic_basis',
        kind: 'rejected_noise_pressure',
        term: rejection.term,
        dimensions: [['semantic_noise_rejected', 1]],
        status: 'rejected_not_admitted_to_meaning'
      }));
    });
    focus.shared_substrate_activation_ids = activations.map(item => item.id);
    focus.shared_substrate_terms = activations.map(item => item.term);
    return activations;
  }

  function eventActivations(substrate, event) {
    const eventId = event && event.id || null;
    if (!eventId) return [];
    return arr(substrate.activations).filter(activation => activation.source_event === eventId);
  }

  function recordOrganLink(state, organ, event, relation) {
    const substrate = ensure(state);
    const focusIds = arr(state.semanticFocus && state.semanticFocus.shared_substrate_activation_ids);
    const focusTerms = arr(state.semanticFocus && state.semanticFocus.shared_substrate_terms);
    const localActivations = eventActivations(substrate, event);
    const activationIds = focusIds.length ? focusIds : localActivations.map(item => item.id);
    const terms = focusTerms.length ? focusTerms : localActivations.map(item => item.term);
    const link = {
      organ: String(organ || 'unknown_organ'),
      source_event: event && event.id || null,
      relation: relation || 'used_shared_substrate',
      activation_ids: activationIds,
      terms,
      at: now()
    };
    substrate.organ_links.unshift(link);
    substrate.organ_links = substrate.organ_links.slice(0, 160);
    substrate.updated_at = now();
    return link;
  }

  global.FortySecondMindSharedSubstrate = Object.freeze({
    VERSION,
    ensure,
    activate,
    applySemanticFocus,
    recordOrganLink,
    normalizeSigned,
    l1Total
  });
})(typeof window !== 'undefined' ? window : globalThis);
