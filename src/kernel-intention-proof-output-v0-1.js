/* 42ndMind Intention Proof Output v0.1
 * Builds readable proof traces from canonical formula ledger records.
 * Candidate-only. No doctrine promotion. No belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_proof_output_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function ledgerApi() {
    if (!global.KernelIntentionCanonicalFormulaLedgerV01) throw new Error('KernelIntentionCanonicalFormulaLedgerV01 unavailable');
    return global.KernelIntentionCanonicalFormulaLedgerV01;
  }

  function doctrine() {
    return {
      outputs_formula_proof_traces: true,
      proof_output_is_candidate_trace_not_doctrine: true,
      proof_output_does_not_promote_versions: true,
      proof_output_does_not_change_formulas: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function l1(terms) {
    return Number(asArray(terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
  }

  function forceOutsideShape(shapeTerms, forceTerms) {
    const shape = new Set(asArray(shapeTerms).map(term => safeId(term.dimension)));
    return asArray(forceTerms).every(force => !shape.has(safeId(force.dimension)));
  }

  function currentVersion(record) {
    const id = text(record && record.current_candidate_version);
    return asArray(record && record.versions).find(v => v.version_id === id) || asArray(record && record.versions)[0] || null;
  }

  function compiledVersion(record) {
    return asArray(record && record.versions).find(v => v.source_type === 'compiled_formula') || null;
  }

  function dimensionRole(version, dimension) {
    const id = safeId(dimension);
    const term = asArray(version && version.shape_terms).find(row => safeId(row.dimension) === id);
    return text(term && term.role) || 'shape_term';
  }

  function transitionClass(edge) {
    const type = safeId(edge && edge.edge_type);
    if (type.includes('collapse')) return 'necessary_core_pressure';
    if (type.includes('neighbor')) return 'neighbor_separation_pressure';
    if (type.includes('boundary')) return 'boundary_pressure';
    if (type.includes('expression')) return 'expression_or_derivative_pressure';
    return 'structural_pressure';
  }

  function guardsForDimension(version, dimension) {
    const id = safeId(dimension);
    return asArray(version && version.guards).filter(guard => safeId(guard.removed_dimension || guard.dimension || '') === id || text(guard.guard_expression).toLowerCase().includes(id));
  }

  function proofStep(record, current, compiled, edge, index) {
    const concept = safeId(record && record.concept);
    const removed = safeId(edge && edge.removed_dimension);
    const neighbor = safeId(edge && edge.to);
    const role = dimensionRole(compiled, removed);
    const pressure = transitionClass(edge);
    return {
      step_id: `${concept}_proof_step_${String(index + 1).padStart(3, '0')}`,
      given: `${concept}_i`,
      version_id: text(current && current.version_id),
      remove: removed,
      removed_dimension_role: role,
      observed_transition: `${concept} -> ${neighbor}`,
      edge_type: text(edge && edge.edge_type),
      pressure_class: pressure,
      structural_pressure_weight: Number(edge && edge.structural_pressure_weight || 0),
      candidate_status: text(edge && edge.candidate_status) || 'candidate_structural_relation',
      guard_count: guardsForDimension(current, removed).length,
      conclusion: `${removed} carries ${pressure} separating ${concept} from ${neighbor}.`,
      proof_lines: [
        `Given: ${concept}_i`,
        `Version: ${text(current && current.version_id)}`,
        `Remove: ${removed}`,
        `Observed transition: ${concept} -> ${neighbor}`,
        `Role: ${role}`,
        `Therefore: ${removed} carries ${pressure} separating ${concept} from ${neighbor}.`,
        'Belief movement: none'
      ],
      belief_movement: 'none'
    };
  }

  function proofForRecord(record) {
    const concept = safeId(record && record.concept);
    const current = currentVersion(record);
    const compiled = compiledVersion(record);
    const shapeTerms = asArray(current && current.shape_terms);
    const forceTerms = asArray(current && current.force_terms);
    const transitions = asArray(compiled && compiled.formula_snapshot && compiled.formula_snapshot.neighbor_transitions);
    const steps = transitions.map((edge, index) => proofStep(record, current, compiled, edge, index));
    const shapeTotal = l1(shapeTerms);
    const forceOk = forceOutsideShape(shapeTerms, forceTerms);
    const formulaLine = text(current && current.symbolic_formula);
    const forceLine = text(current && current.force_equation) || `F_${concept} = M_${concept} · ${concept.toUpperCase()}_i`;
    const guardCount = asArray(current && current.guards).length;
    const headerLines = [
      `Proof object: ${concept}`,
      `Given: ${concept}_i`,
      `Version: ${text(current && current.version_id)}`,
      `Formula: ${formulaLine}`,
      'Shape invariant: Σ |dimension_i| = 1',
      `Observed L1 total: ${shapeTotal}`,
      `Force separation: ${forceLine}`,
      `Force terms outside shape: ${forceOk}`,
      `Revision guards stored: ${guardCount}`,
      `Promotion status: ${text(current && current.promotion_status)}`,
      'Belief movement: none'
    ];
    const stepLines = steps.flatMap(step => [''].concat(step.proof_lines));
    return {
      proof_id: `proof_${concept}_v0_1`,
      concept,
      ledger_id: text(record && record.ledger_id),
      current_candidate_version: text(record && record.current_candidate_version),
      source_compiled_version: text(compiled && compiled.version_id),
      source_type: 'canonical_formula_ledger_record',
      formula_line: formulaLine,
      shape_line: 'Σ |dimension_i| = 1',
      observed_l1_total: shapeTotal,
      force_line: forceLine,
      force_terms_outside_shape: forceOk,
      guard_count: guardCount,
      proof_steps: steps,
      proof_step_count: steps.length,
      proof_lines: headerLines.concat(stepLines),
      proof_text: headerLines.concat(stepLines).join('\n'),
      promotion_status: text(current && current.promotion_status),
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
  }

  function validateProof(proof) {
    const errors = [];
    if (!text(proof && proof.concept)) errors.push('missing_concept');
    if (!text(proof && proof.current_candidate_version)) errors.push('missing_current_candidate_version');
    if (!text(proof && proof.source_compiled_version)) errors.push('missing_source_compiled_version');
    if (!text(proof && proof.formula_line).includes('Σ|dimension_i| = 1')) errors.push('formula_missing_unit_total');
    if (!text(proof && proof.shape_line).includes('Σ |dimension_i| = 1')) errors.push('shape_line_missing_unit_total');
    if (Math.abs(1 - Number(proof && proof.observed_l1_total || 0)) > EPSILON) errors.push(`l1_not_1:${proof && proof.observed_l1_total}`);
    if (proof && proof.force_terms_outside_shape !== true) errors.push('force_terms_not_outside_shape');
    if (!text(proof && proof.force_line).includes('F_') || !text(proof && proof.force_line).includes('M_')) errors.push('force_line_missing_equation');
    if (!asArray(proof && proof.proof_steps).length) errors.push('missing_proof_steps');
    if (proof && proof.promotion_status !== 'not_promoted') errors.push('proof_promoted');
    if (proof && proof.doctrine_status !== 'candidate_not_doctrine') errors.push('proof_doctrine_status_not_safe');
    if (proof && proof.belief_movement !== 'none') errors.push('belief_movement_not_none');
    asArray(proof && proof.proof_steps).forEach(step => {
      if (step.belief_movement !== 'none') errors.push(`${step.step_id}:belief_movement_not_none`);
      if (!text(step.observed_transition).includes('->')) errors.push(`${step.step_id}:missing_transition`);
      if (!text(step.conclusion)) errors.push(`${step.step_id}:missing_conclusion`);
    });
    return {
      proof_id: text(proof && proof.proof_id),
      concept: text(proof && proof.concept),
      ok: errors.length === 0,
      errors,
      proof_step_count: asArray(proof && proof.proof_steps).length,
      observed_l1_total: Number(proof && proof.observed_l1_total || 0),
      force_terms_outside_shape: proof && proof.force_terms_outside_shape === true,
      promotion_status: text(proof && proof.promotion_status),
      doctrine_status: text(proof && proof.doctrine_status),
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const proofs = asArray(packet && packet.proofs);
    const proofValidations = proofs.map(validateProof);
    const errors = [];
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (proofs.length !== 11) errors.push(`proof_count_not_11:${proofs.length}`);
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    proofValidations.forEach(row => { if (!row.ok) errors.push(`${row.concept}:${row.errors.join('|')}`); });
    return {
      packet_type: '42ndMind_intention_proof_output_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks: {
        source_ledger_ok: packet && packet.source_ledger_ok === true,
        eleven_proofs: proofs.length === 11,
        all_proofs_have_steps: proofValidations.every(row => row.proof_step_count > 0),
        all_l1_totals_equal_1: proofValidations.every(row => Math.abs(1 - Number(row.observed_l1_total || 0)) <= EPSILON),
        force_terms_outside_shape: proofValidations.every(row => row.force_terms_outside_shape === true),
        candidate_only_not_promoted: proofValidations.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
        belief_movement_none: packet && packet.belief_movement === 'none' && proofValidations.every(row => row.belief_movement === 'none')
      },
      proof_validations: proofValidations,
      errors,
      belief_movement: 'none'
    };
  }

  function runProofOutput(options = {}) {
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const proofs = asArray(ledgerPacket && ledgerPacket.ledger_records).map(proofForRecord);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Proof-style output for candidate intention formulas. Explains versioned formula structure, unit-total shape, force separation, and neighbor-transition pressure. Candidate only.',
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      proof_count: proofs.length,
      proof_step_count: proofs.reduce((sum, proof) => sum + asArray(proof.proof_steps).length, 0),
      proofs,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionProofOutputV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    l1,
    forceOutsideShape,
    currentVersion,
    compiledVersion,
    dimensionRole,
    transitionClass,
    guardsForDimension,
    proofStep,
    proofForRecord,
    validateProof,
    validatePacket,
    runProofOutput
  });
})(typeof window !== 'undefined' ? window : globalThis);
