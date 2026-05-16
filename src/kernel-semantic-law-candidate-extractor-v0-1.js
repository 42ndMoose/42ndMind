/* 42ndMind Semantic Law Candidate Extractor v0.1
 * Extracts reviewable semantic law candidates from validated template/workbench mappings.
 *
 * A law candidate is not doctrine. It is a compact equation-like mapping:
 * surface family -> semantic operator -> pressure vector -> evidence burden -> blocked movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_law_candidate_extractor_v0_1';
  const LAW_PACKET_TYPE = '42ndMind_semantic_law_candidate_report_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
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
  function operatorName(signature) { return text(signature).split('(')[0].trim() || text(signature); }
  function pressureSignature(pressures) { return unique(pressures).sort().join('|'); }
  function lawKey(operator, pressures) { return `${operatorName(operator)}::${pressureSignature(pressures)}`; }
  function countMap(items) {
    return asArray(items).reduce((acc, item) => {
      const key = text(item || 'unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
  function stableHash(value) {
    let h = 0;
    const s = text(value);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36).slice(0, 8);
  }

  function doctrine() {
    return {
      law_candidates_are_reviewable_equations_not_doctrine: true,
      validated_mapping_is_not_final_truth: true,
      objective_language_requires_repeatable_mapping_and_contrast_survival: true,
      pressure_vectors_are_semantic_diagnostics_not_belief: true,
      evidence_burden_blocks_belief_movement_until_legitimacy_conditions_are_met: true,
      extractor_does_not_promote_doctrine: true,
      extractor_does_not_patch_source: true,
      extractor_does_not_move_belief: true,
      belief_movement: 'none'
    };
  }

  function modulesAvailable() {
    return {
      triage_planner: !!(global.KernelSemanticValidationTriagePlannerV01 && typeof global.KernelSemanticValidationTriagePlannerV01.loadValidateAndTriage === 'function')
    };
  }

  function rowStatus(row) {
    const rec = text(row && row.recommendation || row && row.source_recommendation);
    if (rec === 'accept') return 'validated_clean';
    if (rec === 'accept_with_review') return 'validated_with_review';
    if (rec === 'revise') return 'contested_revision_needed';
    if (rec === 'reject') return 'rejected_unusable';
    return 'unknown';
  }

  function acceptedRows(validation, options = {}) {
    const includeReview = options.include_accept_with_review !== false;
    return asArray(validation && validation.results).filter(row => row.recommendation === 'accept' || (includeReview && row.recommendation === 'accept_with_review'));
  }

  function contestedRows(validation) {
    return asArray(validation && validation.results).filter(row => row.recommendation === 'revise' || row.recommendation === 'reject');
  }

  function extractEvidenceBurden(rows) {
    return unique(asArray(rows).flatMap(row => asArray(row.evidence_burden))).slice(0, 12);
  }

  function extractLegitimacyGuards(rows) {
    return unique(asArray(rows).flatMap(row => asArray(row.legitimacy_guards))).slice(0, 12);
  }

  function extractContrastClasses(rows) {
    return unique(asArray(rows).flatMap(row => asArray(row.contrast_classes))).slice(0, 20);
  }

  function equationFor(operator, pressures) {
    return `${operatorName(operator)} := { ${unique(pressures).sort().join(', ')} } -> evidence_burden -> blocked_belief_movement_until_legitimate`;
  }

  function vectorFor(pressures, dimensions) {
    const set = new Set(asArray(pressures));
    const out = {};
    asArray(dimensions).forEach(d => { out[d] = set.has(d) ? 1 : 0; });
    return out;
  }

  function buildLawCandidate(group, options = {}) {
    const rows = asArray(group.rows);
    const first = rows[0] || {};
    const pressures = unique(group.pressures).sort();
    const operators = unique(group.operators);
    const primaryOperator = operators[0] || 'unknown_operator';
    const dimensions = asArray(options.pressure_dimensions).length ? asArray(options.pressure_dimensions) : pressures;
    const sentences = unique(rows.map(r => r.sentence));
    const lawStatus = rows.every(r => rowStatus(r) === 'validated_clean') ? 'validated_candidate' : 'review_candidate';
    const candidateId = `law_${operatorName(primaryOperator)}_${stableHash(primaryOperator + pressureSignature(pressures))}`;
    return {
      id: candidateId,
      law_status: lawStatus,
      equation_type: 'operator_pressure_vector_mapping',
      equation: equationFor(primaryOperator, pressures),
      primary_operator: primaryOperator,
      operator_names: operators,
      pressure_signature: pressureSignature(pressures),
      pressures,
      pressure_vector_l1_norm: pressures.length,
      binary_pressure_vector: vectorFor(pressures, dimensions),
      observation_count: rows.length,
      sentence_equivalence_class: sentences,
      evidence_burden: extractEvidenceBurden(rows),
      legitimacy_guards: extractLegitimacyGuards(rows),
      contrast_classes: extractContrastClasses(rows),
      blocked_movement: 'belief_movement_blocked_until_legitimacy_conditions_are_satisfied',
      allowed_movement: 'none_from_language_alone',
      falsification_tests: [
        'Find a sentence with the same surface family that does not map to this pressure vector.',
        'Find a contrast sentence that collapses into this operator incorrectly.',
        'Run candidate sentences through the workbench and check for overmatch or undermatch.'
      ],
      source_template_groups: unique(rows.map(r => r.expected_template_group)).filter(Boolean),
      source_recommendations: countMap(rows.map(r => r.recommendation)),
      created_from: 'validated_template_workbench_mapping',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function groupAcceptedRows(rows) {
    const groups = new Map();
    asArray(rows).forEach(row => {
      const operators = unique(asArray(row.actual_operator_names).length ? row.actual_operator_names : asArray(row.actual_operators).map(operatorName));
      const pressures = unique(row.actual_pressures).sort();
      operators.forEach(op => {
        const key = lawKey(op, pressures);
        if (!groups.has(key)) groups.set(key, { key, operators:[op], pressures, rows:[] });
        groups.get(key).rows.push(row);
      });
    });
    return Array.from(groups.values());
  }

  function buildContrastBoundary(row) {
    const expected = unique(row.expected_pressures).sort();
    const actual = unique(row.actual_pressures).sort();
    const missing = unique(row.comparison && row.comparison.missing_pressures).sort();
    const extra = unique(row.comparison && row.comparison.extra_pressures).sort();
    return {
      sentence: text(row.sentence),
      boundary_status: row.recommendation === 'reject' ? 'hard_boundary_or_unmatched_language' : 'soft_boundary_requires_revision',
      expected_signature: pressureSignature(expected),
      actual_signature: pressureSignature(actual),
      missing_pressures: missing,
      extra_pressures: extra,
      actual_operators: clone(asArray(row.actual_operators)),
      reason: row.recommendation === 'reject'
        ? 'The language cannot yet be mapped by the workbench and should not enter the law set.'
        : 'The language crosses or weakens the expected pressure mapping and must be revised or modeled separately.',
      belief_movement: 'none'
    };
  }

  function extractFromValidation(validation, options = {}) {
    const accepted = acceptedRows(validation, options);
    const contested = contestedRows(validation);
    const pressureDimensions = unique(asArray(validation && validation.results).flatMap(r => r.actual_pressures)).sort();
    const laws = groupAcceptedRows(accepted).map(group => buildLawCandidate(group, { pressure_dimensions: pressureDimensions }));
    const boundaries = contested.map(buildContrastBoundary);
    const summary = {
      source_sentence_count: Number(validation && validation.validation_case_count) || asArray(validation && validation.results).length,
      accepted_rows: accepted.length,
      contested_rows: contested.length,
      law_candidate_count: laws.length,
      contrast_boundary_count: boundaries.length,
      pressure_dimension_count: pressureDimensions.length,
      law_status_counts: countMap(laws.map(l => l.law_status)),
      top_operator_counts: countMap(laws.map(l => l.primary_operator)),
      belief_movement: 'none'
    };
    return {
      packet_type: LAW_PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      source_validation_packet_type: text(validation && validation.packet_type),
      summary,
      pressure_dimensions: pressureDimensions,
      law_candidates: laws,
      contrast_boundaries: boundaries,
      objective_language_claim: 'candidate_formal_semantic_language_only_not_final_objective_math',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function extractFromValidationPacket(packet, options = {}) {
    const validation = packet && packet.validation ? packet.validation : packet;
    return extractFromValidation(validation, options);
  }

  async function loadValidateTriageAndExtract(options = {}) {
    if (!modulesAvailable().triage_planner) throw new Error('KernelSemanticValidationTriagePlannerV01 unavailable');
    const triagePacket = await global.KernelSemanticValidationTriagePlannerV01.loadValidateAndTriage(options);
    const lawReport = extractFromValidation(triagePacket.validation_packet.validation, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: triagePacket.ok === true,
      triage_packet: triagePacket,
      law_report: lawReport,
      summary: lawReport.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticLawCandidateExtractorV01 = Object.freeze({
    VERSION, PACKET_TYPE, LAW_PACKET_TYPE,
    doctrine, modulesAvailable, operatorName, pressureSignature, equationFor,
    acceptedRows, contestedRows, groupAcceptedRows, buildLawCandidate,
    buildContrastBoundary, extractFromValidation, extractFromValidationPacket,
    loadValidateTriageAndExtract
  });
})(typeof window !== 'undefined' ? window : globalThis);
