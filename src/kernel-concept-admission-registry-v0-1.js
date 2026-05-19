/* 42ndMind Concept Admission / Formula Registration Registry v0.1
 * Registers newly learned words/meanings as candidate formula records.
 * Uses existing formula inspector memory. No doctrine promotion. No LLM. No source lookup.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_concept_admission_registry_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function round(value) { return Number((Number(value) || 0).toFixed(6)); }

  function inspectorApi() {
    if (!global.KernelIntentionFormulaInspectorV01) throw new Error('KernelIntentionFormulaInspectorV01 unavailable');
    return global.KernelIntentionFormulaInspectorV01;
  }

  function doctrine() {
    return {
      admits_new_words_and_meanings_as_candidate_formula_records: true,
      admission_does_not_promote_doctrine: true,
      learned_meanings_are_registered_with_version_trail: true,
      provisional_formula_must_preserve_l1_1_when_formula_present: true,
      force_terms_remain_outside_shape: true,
      contradiction_pressure_creates_revision_hooks_not_silent_mutation: true,
      inherited_formulas_record_source_formula_snapshot: true,
      composite_formulas_are_normalized_not_mass_inflated: true,
      unknown_or_underdefined_meanings_can_remain_pending_without_false_formula: true,
      formula_inspector_extension_records_are_available: true,
      no_llm: true,
      no_source_lookup: true,
      belief_movement: 'none'
    };
  }

  function sampleAdmissions() {
    return [
      {
        admission_id: 'permission_admission_v0_1',
        concept: 'permission',
        meaning_text: 'authorization allowing an action within a scope',
        admission_mode: 'inherit_formula',
        source_concepts: [{ concept: 'consent', weight: 1 }],
        aliases: ['allowance', 'authorization'],
        contradiction_notes: []
      },
      {
        admission_id: 'warning_admission_v0_1',
        concept: 'warning',
        meaning_text: 'a signal that possible harm or negative consequence may follow',
        admission_mode: 'inherit_formula',
        source_concepts: [{ concept: 'threat', weight: 0.7 }, { concept: 'fear', weight: 0.3 }],
        aliases: ['caution', 'alert'],
        contradiction_notes: ['warning can be protective rather than coercive']
      },
      {
        admission_id: 'skepticism_admission_v0_1',
        concept: 'skepticism',
        meaning_text: 'withheld closure toward a proposition until support improves',
        admission_mode: 'inherit_formula',
        source_concepts: [{ concept: 'doubt', weight: 1 }],
        aliases: ['critical doubt', 'withheld belief'],
        contradiction_notes: []
      },
      {
        admission_id: 'loyalty_admission_v0_1',
        concept: 'loyalty',
        meaning_text: 'stable commitment to a relation or obligation under possible pressure',
        admission_mode: 'composite_formula',
        source_concepts: [{ concept: 'trust', weight: 0.65 }, { concept: 'betrayal', weight: 0.35 }],
        aliases: ['faithfulness', 'allegiance'],
        contradiction_notes: ['loyalty may be healthy trust or coercive obligation depending on pressure']
      },
      {
        admission_id: 'pressure_admission_v0_1',
        concept: 'pressure',
        meaning_text: 'a force applied toward compliance, choice narrowing, or action shift',
        admission_mode: 'composite_formula',
        source_concepts: [{ concept: 'coercion', weight: 0.45 }, { concept: 'threat', weight: 0.35 }, { concept: 'manipulation', weight: 0.2 }],
        aliases: ['push', 'constraint pressure'],
        contradiction_notes: ['pressure may be social, coercive, manipulative, or contextually benign']
      },
      {
        admission_id: 'deception_admission_v0_1',
        concept: 'deception',
        meaning_text: 'hidden distortion of understanding that affects another agent\'s interpretation or choice',
        admission_mode: 'composite_formula',
        source_concepts: [{ concept: 'manipulation', weight: 0.72 }, { concept: 'betrayal', weight: 0.28 }],
        aliases: ['deceit', 'misleading concealment'],
        contradiction_notes: ['deception requires distortion/hiddenness; not every false statement is intentional deception']
      }
    ];
  }

  function l1(terms) {
    return round(asArray(terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0));
  }

  function normalizeShapeTerms(terms) {
    const merged = {};
    asArray(terms).forEach(term => {
      const key = safeId(term.dimension || term.label || term.name);
      if (!key) return;
      if (!merged[key]) merged[key] = { dimension: key, coefficient: 0, source_dimensions: [] };
      merged[key].coefficient += Number(term.coefficient) || 0;
      merged[key].source_dimensions.push(text(term.dimension || key));
    });
    const rows = Object.keys(merged).map(key => ({
      dimension: key,
      coefficient: merged[key].coefficient,
      source_dimensions: Array.from(new Set(merged[key].source_dimensions))
    }));
    const total = rows.reduce((sum, row) => sum + Math.abs(row.coefficient), 0);
    if (total <= EPSILON) return [];
    return rows.map(row => ({
      dimension: row.dimension,
      coefficient: round(row.coefficient / total),
      source_dimensions: row.source_dimensions
    }));
  }

  function reconcileRounding(terms) {
    const rows = asArray(terms).map(term => Object.assign({}, term));
    if (!rows.length) return rows;
    const total = l1(rows);
    const delta = round(1 - total);
    if (Math.abs(delta) <= EPSILON) return rows;
    let idx = 0;
    rows.forEach((row, i) => {
      if (Math.abs(Number(row.coefficient) || 0) > Math.abs(Number(rows[idx].coefficient) || 0)) idx = i;
    });
    const sign = (Number(rows[idx].coefficient) || 0) < 0 ? -1 : 1;
    rows[idx].coefficient = round((Number(rows[idx].coefficient) || 0) + sign * delta);
    return rows;
  }

  function forceOutsideShape(shapeTerms, forceTerms) {
    const shape = new Set(asArray(shapeTerms).map(term => safeId(term.dimension)));
    return asArray(forceTerms).every(force => !shape.has(safeId(force.dimension)));
  }

  function normalizeWeights(sourceConcepts) {
    const rows = asArray(sourceConcepts).map(row => ({ concept: safeId(row.concept), weight: Math.max(0, Number(row.weight) || 0) }));
    const total = rows.reduce((sum, row) => sum + row.weight, 0);
    if (total <= EPSILON) return rows.map(row => ({ concept: row.concept, weight: 0 }));
    return rows.map(row => ({ concept: row.concept, weight: round(row.weight / total) }));
  }

  function findInspection(inspectorPacket, concept) {
    const id = safeId(concept);
    return asArray(inspectorPacket && inspectorPacket.inspections).find(row => safeId(row.concept) === id) || null;
  }

  function combineShapeTerms(sourceInspections, weightedSources) {
    const terms = [];
    asArray(weightedSources).forEach(source => {
      const inspection = sourceInspections[source.concept];
      const current = inspection && inspection.current_candidate;
      asArray(current && current.shape_terms).forEach(term => {
        terms.push({
          dimension: `${source.concept}__${safeId(term.dimension)}`,
          coefficient: (Number(term.coefficient) || 0) * source.weight,
          source_concept: source.concept,
          source_dimension: text(term.dimension)
        });
      });
    });
    return reconcileRounding(normalizeShapeTerms(terms));
  }

  function combineForceTerms(sourceInspections, weightedSources, shapeTerms) {
    const shape = new Set(asArray(shapeTerms).map(term => safeId(term.dimension)));
    const rows = [];
    asArray(weightedSources).forEach(source => {
      const inspection = sourceInspections[source.concept];
      const current = inspection && inspection.current_candidate;
      asArray(current && current.force_terms).forEach(term => {
        const dim = `${source.concept}__${safeId(term.dimension || term.force || 'force')}_force`;
        if (!shape.has(safeId(dim))) {
          rows.push(Object.assign({}, term, {
            dimension: dim,
            coefficient: round((Number(term.coefficient) || 0) * source.weight),
            source_concept: source.concept,
            outside_shape: true
          }));
        }
      });
    });
    return rows;
  }

  function symbolicFormula(concept, shapeTerms) {
    const terms = asArray(shapeTerms).map(term => `${term.coefficient}·${term.dimension}`);
    return `${safeId(concept)}(i) = normalize_L1(${terms.join(' + ')}) ; F_${safeId(concept)} = M_${safeId(concept)} · i_${safeId(concept)}`;
  }

  function admissionRecord(admission, inspectorPacket) {
    const weightedSources = normalizeWeights(admission.source_concepts);
    const sourceInspections = {};
    weightedSources.forEach(source => { sourceInspections[source.concept] = findInspection(inspectorPacket, source.concept); });
    const missingSources = weightedSources.filter(source => !sourceInspections[source.concept]).map(source => source.concept);
    const formulaAvailable = missingSources.length === 0 && weightedSources.length > 0;
    const shapeTerms = formulaAvailable ? combineShapeTerms(sourceInspections, weightedSources) : [];
    const forceTerms = formulaAvailable ? combineForceTerms(sourceInspections, weightedSources, shapeTerms) : [];
    const sourceSnapshots = weightedSources.map(source => {
      const inspection = sourceInspections[source.concept];
      return {
        concept: source.concept,
        weight: source.weight,
        current_candidate_version: inspection ? inspection.current_candidate_version : null,
        formula_snapshot: inspection && inspection.current_candidate ? {
          symbolic_formula: inspection.current_candidate.symbolic_formula,
          shape_terms: clone(inspection.current_candidate.shape_terms),
          force_terms: clone(inspection.current_candidate.force_terms),
          l1_total: inspection.current_candidate.l1_total
        } : null
      };
    });
    const versionId = `${safeId(admission.concept)}_v0001_admission_candidate`;
    const record = {
      registry_entry_id: `${safeId(admission.concept)}_concept_admission_v0_1`,
      admission_id: text(admission.admission_id),
      concept: safeId(admission.concept),
      meaning_text: text(admission.meaning_text),
      aliases: asArray(admission.aliases).map(text),
      admission_mode: text(admission.admission_mode),
      admission_status: formulaAvailable ? 'candidate_formula_registered' : 'pending_source_formula',
      current_candidate_version: versionId,
      versions: [{
        version_id: versionId,
        source_type: 'learned_meaning_admission',
        source_concepts: weightedSources,
        source_formula_snapshots: sourceSnapshots,
        formula_snapshot: formulaAvailable ? {
          symbolic_formula: symbolicFormula(admission.concept, shapeTerms),
          shape_terms: shapeTerms,
          force_terms: forceTerms,
          l1_total: l1(shapeTerms),
          force_terms_outside_shape: forceOutsideShape(shapeTerms, forceTerms),
          formula_status: 'provisional_candidate_formula'
        } : null,
        guards: [
          'candidate_only_not_doctrine',
          'no_silent_mutation',
          'contradiction_pressure_creates_revision_candidate',
          'rollback_required_for_replacement',
          'belief_movement_none'
        ],
        validation: null,
        created_at: now(),
        promotion_status: 'not_promoted',
        doctrine_status: 'candidate_not_doctrine',
        belief_movement: 'none'
      }],
      contradiction_notes: asArray(admission.contradiction_notes).map(text),
      revision_hooks: asArray(admission.contradiction_notes).map((note, idx) => ({
        hook_id: `${safeId(admission.concept)}_revision_hook_${idx + 1}`,
        pressure_note: note,
        hook_status: 'available_for_future_revision',
        belief_movement: 'none'
      })),
      missing_source_concepts: missingSources,
      rollback_available: true,
      rollback_targets: [],
      inspector_extension_available: formulaAvailable,
      external_lookup_performed: false,
      llm_used: false,
      promotion_status: 'not_promoted',
      doctrine_status: 'candidate_not_doctrine',
      belief_movement: 'none'
    };
    record.versions[0].validation = validateAdmissionRecord(record).formula_validation;
    record.rollback_targets = [{ version_id: versionId, rollback_kind: 'remove_admission_candidate' }];
    return record;
  }

  function validateAdmissionRecord(record) {
    const errors = [];
    const version = asArray(record && record.versions)[0] || {};
    const formula = version.formula_snapshot;
    const formulaValidation = {
      formula_present: !!formula,
      l1_total: formula ? formula.l1_total : null,
      l1_equal_1: formula ? Math.abs(1 - Number(formula.l1_total || 0)) <= EPSILON : false,
      force_terms_outside_shape: formula ? formula.force_terms_outside_shape === true : false,
      source_snapshots_present: asArray(version.source_formula_snapshots).every(row => !!row.formula_snapshot),
      belief_movement: 'none'
    };
    if (!text(record && record.registry_entry_id)) errors.push('missing_registry_entry_id');
    if (!text(record && record.concept)) errors.push('missing_concept');
    if (!text(record && record.meaning_text)) errors.push('missing_meaning_text');
    if (!text(record && record.current_candidate_version)) errors.push('missing_current_candidate_version');
    if (record && record.admission_status === 'candidate_formula_registered') {
      if (!formula) errors.push('missing_formula_snapshot');
      if (!formulaValidation.l1_equal_1) errors.push(`l1_not_1:${formulaValidation.l1_total}`);
      if (!formulaValidation.force_terms_outside_shape) errors.push('force_terms_not_outside_shape');
      if (!formulaValidation.source_snapshots_present) errors.push('missing_source_formula_snapshot');
    }
    if (!asArray(record && record.versions).length) errors.push('missing_versions');
    if (record && record.rollback_available !== true) errors.push('rollback_unavailable');
    if (record && record.external_lookup_performed !== false) errors.push('external_lookup_performed');
    if (record && record.llm_used !== false) errors.push('llm_used');
    if (record && record.promotion_status !== 'not_promoted') errors.push('promoted');
    if (record && record.doctrine_status !== 'candidate_not_doctrine') errors.push('doctrine_status_not_safe');
    if (record && record.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      concept: text(record && record.concept),
      ok: errors.length === 0,
      errors,
      admission_status: text(record && record.admission_status),
      formula_validation: formulaValidation,
      revision_hook_count: asArray(record && record.revision_hooks).length,
      belief_movement: 'none'
    };
  }

  function toInspectorExtensionRecord(record) {
    const version = asArray(record && record.versions)[0] || {};
    const formula = version.formula_snapshot || {};
    return {
      packet_type: '42ndMind_concept_admission_inspector_extension_record_v0_1',
      concept: text(record && record.concept),
      current_candidate_version: text(record && record.current_candidate_version),
      current_candidate: {
        version_id: text(version.version_id),
        source_type: text(version.source_type),
        symbolic_formula: text(formula.symbolic_formula),
        shape_terms: clone(asArray(formula.shape_terms)),
        force_terms: clone(asArray(formula.force_terms)),
        l1_total: formula.l1_total,
        force_terms_outside_shape: formula.force_terms_outside_shape,
        promotion_status: 'not_promoted',
        doctrine_status: 'candidate_not_doctrine',
        belief_movement: 'none'
      },
      versions: clone(asArray(record && record.versions)),
      version_count: asArray(record && record.versions).length,
      rollback_available: record && record.rollback_available === true,
      revision_hooks: clone(asArray(record && record.revision_hooks)),
      doctrine_status: 'candidate_not_doctrine',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function validateRegistry(packet) {
    const records = asArray(packet && packet.admission_records);
    const validations = records.map(validateAdmissionRecord);
    const errors = [];
    if (packet && packet.source_formula_inspector_ok !== true) errors.push('source_formula_inspector_not_ok');
    if (records.length !== 6) errors.push(`admission_record_count_not_6:${records.length}`);
    validations.forEach(row => { if (!row.ok) errors.push(`${row.concept}:${row.errors.join('|')}`); });
    const formulaRecords = records.filter(row => row.admission_status === 'candidate_formula_registered');
    const checks = {
      source_formula_inspector_ok: packet && packet.source_formula_inspector_ok === true,
      six_admission_records: records.length === 6,
      all_registered_as_candidate_formulas: formulaRecords.length === records.length,
      inherited_and_composite_modes_present: records.some(row => row.admission_mode === 'inherit_formula') && records.some(row => row.admission_mode === 'composite_formula'),
      all_formula_l1_totals_equal_1: formulaRecords.every(row => validateAdmissionRecord(row).formula_validation.l1_equal_1 === true),
      all_force_terms_outside_shape: formulaRecords.every(row => validateAdmissionRecord(row).formula_validation.force_terms_outside_shape === true),
      all_source_snapshots_preserved: formulaRecords.every(row => validateAdmissionRecord(row).formula_validation.source_snapshots_present === true),
      revision_hooks_available_for_contradiction_notes: records.filter(row => asArray(row.contradiction_notes).length > 0).every(row => asArray(row.revision_hooks).length === asArray(row.contradiction_notes).length),
      rollback_available: records.every(row => row.rollback_available === true && asArray(row.rollback_targets).length >= 1),
      inspector_extension_available: records.every(row => row.inspector_extension_available === true),
      no_llm_used: records.every(row => row.llm_used === false) && packet && packet.llm_used === false,
      no_external_lookup: records.every(row => row.external_lookup_performed === false) && packet && packet.external_lookup_performed === false,
      candidate_only_not_promoted: records.every(row => row.promotion_status === 'not_promoted' && row.doctrine_status === 'candidate_not_doctrine'),
      belief_movement_none: packet && packet.belief_movement === 'none' && records.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_concept_admission_registry_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks,
      admission_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function runAdmissionRegistry(options = {}) {
    const inspectorPacket = options.inspector_packet || inspectorApi().inspectAll(options.inspector_options || {});
    const admissions = asArray(options.admissions || sampleAdmissions());
    const records = admissions.map(admission => admissionRecord(admission, inspectorPacket));
    const inspectorExtensionRecords = records.map(toInspectorExtensionRecord);
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Registers newly learned words/meanings as candidate formula records using current formula inspector memory. Candidate only; no LLM; no source lookup.',
      source_formula_inspector_ok: inspectorPacket && inspectorPacket.ok === true,
      source_formula_inspection_count: inspectorPacket && inspectorPacket.inspection_count || 0,
      admission_count: admissions.length,
      admission_record_count: records.length,
      admission_records: records,
      inspector_extension_records: inspectorExtensionRecords,
      doctrine: doctrine(),
      external_lookup_performed: false,
      llm_used: false,
      belief_movement: 'none'
    };
    packet.validation = validateRegistry(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelConceptAdmissionRegistryV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleAdmissions,
    l1,
    normalizeShapeTerms,
    reconcileRounding,
    forceOutsideShape,
    normalizeWeights,
    findInspection,
    combineShapeTerms,
    combineForceTerms,
    symbolicFormula,
    admissionRecord,
    validateAdmissionRecord,
    toInspectorExtensionRecord,
    validateRegistry,
    runAdmissionRegistry
  });
})(typeof window !== 'undefined' ? window : globalThis);
