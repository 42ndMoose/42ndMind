/* 42ndMind Intention Neighbor Lattice v0.1
 * Builds a directed candidate lattice from intention necessity tests.
 *
 * This maps how intention concepts shift toward neighboring concepts when
 * necessary, boundary, or derivative dimensions are removed.
 * It does not attribute intent to real people and does not promote doctrine.
 *
 * Core doctrine:
 * intention concepts are nodes
 * removal / alteration effects are directed edges
 * edge weights represent structural pressure, not truth
 * every source concept remains unit-total in its own local scope
 * force/intensity remains separate from shape
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_neighbor_lattice_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const value = text(item);
      const key = lower(value);
      if (value && !seen.has(key)) { seen.add(key); out.push(value); }
    });
    return out;
  }

  function necessityApi() {
    if (!global.KernelIntentionNecessityTestV01) throw new Error('KernelIntentionNecessityTestV01 unavailable');
    return global.KernelIntentionNecessityTestV01;
  }

  function doctrine() {
    return {
      maps_intention_concepts_not_claim_facts: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      lattice_edges_are_candidate_not_doctrine: true,
      edge_weight_is_structural_pressure_not_truth: true,
      each_concept_shape_is_local_scope_total_1: true,
      source_concepts_are_promoted_over_neighbor_aliases: true,
      force_intensity_remains_separate_from_shape: true,
      unit_total_growth_is_subdivision_not_mass_inflation: true,
      belief_movement: 'none'
    };
  }

  function neighborExpansionMap() {
    return {
      fiction_joke_roleplay_or_marked_uncertainty: ['fiction', 'joke', 'roleplay', 'marked_uncertainty'],
      fiction_roleplay_or_private_expression: ['fiction', 'roleplay', 'private_expression'],
      private_intention_or_plan: ['private_intention', 'plan'],
      prediction_or_external_expectation: ['prediction', 'external_expectation'],
      preference_or_valuation_without_lack: ['preference', 'valuation_without_lack'],
      fantasy_or_unbounded_want: ['fantasy', 'unbounded_want'],
      unbounded_or_vague_variant: ['unbounded_variant', 'vague_variant'],
      curiosity_or_abstract_goal_state: ['curiosity', 'abstract_goal_state'],
      plan_or_preference: ['plan', 'preference'],
      present_statement_or_preference: ['present_statement', 'preference']
    };
  }

  function splitNeighborShift(value) {
    const raw = safeId(value);
    if (!raw) return [];
    const mapped = neighborExpansionMap()[raw];
    if (mapped) return unique(mapped);
    return unique(text(value).split(/\s+or\s+|_or_|\/|,|\band\b/g).map(v => v.trim()).filter(Boolean));
  }

  function edgeKind(removalResult, necessityClass) {
    const result = text(removalResult);
    const cls = text(necessityClass);
    if (result === 'concept_collapses') return 'collapse_edge';
    if (result === 'concept_shifts_to_neighbor') return 'neighbor_shift_edge';
    if (result === 'concept_shifts_or_collapses') return 'ambiguous_shift_or_collapse_edge';
    if (cls === 'boundary_condition') return 'boundary_weaken_edge';
    if (cls === 'derivative_expression') return 'expression_weaken_edge';
    return 'unresolved_edge';
  }

  function edgeWeight(kind) {
    if (kind === 'collapse_edge') return 1;
    if (kind === 'neighbor_shift_edge') return 0.85;
    if (kind === 'ambiguous_shift_or_collapse_edge') return 0.75;
    if (kind === 'boundary_weaken_edge') return 0.45;
    if (kind === 'expression_weaken_edge') return 0.30;
    return 0.15;
  }

  function makeNode(id, label, type, metadata) {
    return {
      id: safeId(id),
      label: text(label),
      node_type: text(type || 'concept'),
      metadata: Object.assign({ belief_movement: 'none' }, metadata || {}),
      belief_movement: 'none'
    };
  }

  function buildNodes(necessityPacket) {
    const nodes = [];
    const byId = new Map();
    function put(node) {
      if (!node.id) return;
      const existing = byId.get(node.id);
      if (!existing) {
        byId.set(node.id, node);
        nodes.push(node);
        return;
      }
      if (node.node_type === 'source_intention_concept' && existing.node_type !== 'source_intention_concept') {
        const index = nodes.findIndex(row => row.id === node.id);
        byId.set(node.id, node);
        if (index >= 0) nodes[index] = node;
      }
    }

    asArray(necessityPacket && necessityPacket.candidates).forEach(candidate => {
      put(makeNode(candidate.concept, candidate.concept, 'source_intention_concept', {
        source: 'necessity_candidate',
        necessary_core_count: asArray(candidate.necessary_core_dimensions).length,
        boundary_count: asArray(candidate.boundary_dimensions).length,
        derivative_expression_count: asArray(candidate.derivative_expression_dimensions).length,
        review_status: text(candidate.necessity_review_status)
      }));
    });

    asArray(necessityPacket && necessityPacket.candidates).forEach(candidate => {
      asArray(candidate.dimension_tests).forEach(test => {
        splitNeighborShift(test.neighbor_shift).forEach(neighbor => {
          const type = test.removal_result === 'concept_collapses' ? 'collapse_or_residue_neighbor' : 'neighbor_intention_concept';
          put(makeNode(neighbor, neighbor, type, { discovered_from: candidate.concept, via_removed_dimension: test.dimension }));
        });
      });
    });
    return nodes;
  }

  function buildEdges(necessityPacket) {
    const edges = [];
    asArray(necessityPacket && necessityPacket.candidates).forEach(candidate => {
      const from = safeId(candidate.concept);
      asArray(candidate.dimension_tests).forEach(test => {
        const kind = edgeKind(test.removal_result, test.necessity_class);
        const weight = edgeWeight(kind);
        const targets = splitNeighborShift(test.neighbor_shift);
        targets.forEach(target => {
          edges.push({
            id: safeId(`${candidate.concept}_${test.dimension}_${target}`),
            from,
            to: safeId(target),
            label: `${test.dimension} removed → ${target}`,
            edge_type: kind,
            removed_dimension: text(test.dimension),
            necessity_class: text(test.necessity_class),
            removal_result: text(test.removal_result),
            structural_pressure_weight: weight,
            explanation: text(test.explanation),
            counterfactual_l1_total: test.counterfactual_shape_after_removal && test.counterfactual_shape_after_removal.l1_total,
            candidate_status: 'candidate_lattice_edge_not_doctrine',
            belief_movement: 'none'
          });
        });
      });
    });
    return edges;
  }

  function summarize(nodes, edges) {
    const byType = {};
    asArray(edges).forEach(edge => { byType[edge.edge_type] = (byType[edge.edge_type] || 0) + 1; });
    const sourceNodes = asArray(nodes).filter(node => node.node_type === 'source_intention_concept');
    const neighborNodes = asArray(nodes).filter(node => node.node_type !== 'source_intention_concept');
    return {
      source_concept_count: sourceNodes.length,
      neighbor_concept_count: neighborNodes.length,
      node_count: asArray(nodes).length,
      edge_count: asArray(edges).length,
      edge_type_counts: byType,
      belief_movement: 'none'
    };
  }

  function validateLattice(packet) {
    const errors = [];
    const nodes = asArray(packet && packet.nodes);
    const edges = asArray(packet && packet.edges);
    const nodeIds = new Set(nodes.map(node => node.id));
    const sourceIds = new Set(asArray(packet && packet.source_candidate_concepts).map(safeId));
    if (!nodes.length) errors.push('missing_nodes');
    if (!edges.length) errors.push('missing_edges');
    if (!nodes.some(node => node.node_type === 'source_intention_concept')) errors.push('missing_source_concepts');
    sourceIds.forEach(id => {
      const node = nodes.find(row => row.id === id);
      if (!node || node.node_type !== 'source_intention_concept') errors.push(`source_concept_not_promoted:${id}`);
    });
    edges.forEach(edge => {
      if (!nodeIds.has(edge.from)) errors.push(`edge_missing_from:${edge.id}`);
      if (!nodeIds.has(edge.to)) errors.push(`edge_missing_to:${edge.id}`);
      if (edge.candidate_status !== 'candidate_lattice_edge_not_doctrine') errors.push(`edge_promoted:${edge.id}`);
      if (edge.belief_movement !== 'none') errors.push(`edge_belief_movement_not_none:${edge.id}`);
      if (!(Number(edge.structural_pressure_weight) > 0 && Number(edge.structural_pressure_weight) <= 1)) errors.push(`bad_edge_weight:${edge.id}`);
      if (edge.counterfactual_l1_total != null && Number(edge.counterfactual_l1_total) !== 1) errors.push(`counterfactual_l1_not_1:${edge.id}`);
    });
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    return {
      packet_type: '42ndMind_intention_neighbor_lattice_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      node_count: nodes.length,
      edge_count: edges.length,
      errors,
      belief_movement: 'none'
    };
  }

  function runLattice(options = {}) {
    const necessity = options.necessity_packet || necessityApi().runNecessityTests(options.necessity_options || {});
    const nodes = buildNodes(necessity);
    const edges = buildEdges(necessity);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Candidate neighbor lattice for objective intention concepts. Edges map concept shifts under removed dimensions. Not doctrine; no real-world intent attribution.',
      source_necessity_ok: necessity && necessity.ok === true,
      source_candidate_concepts: asArray(necessity && necessity.candidates).map(candidate => safeId(candidate.concept)),
      nodes,
      edges,
      summary: summarize(nodes, edges),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validateLattice(packet);
    packet.ok = packet.source_necessity_ok === true && packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionNeighborLatticeV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    neighborExpansionMap,
    splitNeighborShift,
    edgeKind,
    edgeWeight,
    buildNodes,
    buildEdges,
    summarize,
    validateLattice,
    runLattice
  });
})(typeof window !== 'undefined' ? window : globalThis);