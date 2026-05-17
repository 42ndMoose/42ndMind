/* 42ndMind Auto Growth Controller v0.1
 * Runs the deterministic language-growth pipeline and returns a gated decision:
 * AUTO_STAGE / HOLD / REJECT.
 *
 * This controller does not commit to GitHub, does not patch source, does not
 * promote doctrine, and does not move belief. It prepares copyable staged
 * packets and reports only.
 *
 * Future belief/world-model layer note, intentionally not implemented here:
 * truth ideal = 1; belief state = current structured approximation of that 1;
 * possibilities remain retained branches inside the 1; claim status shapes are
 * local 1s; force/confidence remains separate from shape.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_auto_growth_controller_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return text(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120) || 'auto_growth'; }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const value = text(item);
      const key = value.toLowerCase();
      if (value && !seen.has(key)) { seen.add(key); out.push(value); }
    });
    return out;
  }

  function doctrine() {
    return {
      controller_runs_growth_pipeline_but_does_not_commit: true,
      auto_stage_is_not_auto_import: true,
      growth_candidates_are_training_pressure_not_doctrine: true,
      exponential_growth_must_be_candidate_growth_not_belief_growth: true,
      staged_candidate_ids_are_source_scoped_to_prevent_duplicate_reimport: true,
      staged_candidates_include_required_contrast_group: true,
      candidate_corpus_validator_preflight_required_before_auto_stage: true,
      staged_pressure_registry_preflight_required_before_auto_stage: true,
      temp_combined_corpus_preflight_required_before_auto_stage: true,
      temp_vector_compression_preflight_required_before_auto_stage: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      force_intensity_remains_separate_from_shape: true,
      local_labels_are_metadata_only: true,
      controller_rejects_schema_failures_before_import: true,
      controller_does_not_move_belief: true,
      controller_does_not_promote_doctrine: true,
      controller_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function combiner() {
    if (!global.KernelSemanticCorpusCombinerV01) throw new Error('KernelSemanticCorpusCombinerV01 unavailable');
    return global.KernelSemanticCorpusCombinerV01;
  }

  function growthEngine() {
    if (!global.KernelObjectiveLanguageKnowledgeGrowthV01) throw new Error('KernelObjectiveLanguageKnowledgeGrowthV01 unavailable');
    return global.KernelObjectiveLanguageKnowledgeGrowthV01;
  }

  function benchmarkEngine() { return global.KernelObjectiveLanguageInvarianceBenchmarkV01 || null; }
  function compressorEngine() { return global.KernelSemanticVectorCompressorV01 || null; }
  function corpusValidator() { return global.KernelSemanticCorpusV01 || null; }
  function pressureRegistry() { return global.KernelSemanticPressureRegistryV01 || null; }

  function defaultQuestion(entry) {
    const op = asArray(entry && entry.semantic_operators)[0];
    const operator = text(op && op.operator || 'language anchor');
    return `Does this ${operator} candidate improve recognition without moving belief or promoting doctrine?`;
  }

  function scopedCandidateId(rawId, index, options) {
    const prefix = text(options && options.id_prefix || 'auto_growth');
    const base = text(rawId) || `${prefix}_${String(index + 1).padStart(3, '0')}`;
    if (options && options.force_id_scope === true) return safeId(`${prefix}_${String(index + 1).padStart(3, '0')}_${base}`);
    return safeId(base);
  }

  function contrastGroupFor(entry) {
    const id = text(entry && entry.id);
    if (id.includes('_operator_')) return 'auto_growth_operator_anchor';
    if (id.includes('_pressure_')) return 'auto_growth_pressure_anchor';
    return safeId(entry && (entry.contrast_group || entry.operator_group) || 'auto_growth_language_anchor');
  }

  function normalizeCandidateEntry(entry, index, options = {}) {
    const out = clone(entry || {});
    out.id = scopedCandidateId(out.id, index, options);
    out.language = text(out.language || 'en');
    out.operator_group = text(out.operator_group || 'language_knowledge_growth_candidate');
    out.contrast_group = text(out.contrast_group || contrastGroupFor(out));
    out.surface_terms = unique(out.surface_terms || []);
    out.evidence_burden = unique(out.evidence_burden || ['Check anchor phrases.', 'Check ambiguity.', 'Do not infer truth.', 'Do not move belief.']);
    out.semantic_operators = asArray(out.semantic_operators).map(op => ({
      operator: text(op && op.operator),
      pressure: unique(op && op.pressure || []),
      legitimacy_condition: text(op && op.legitimacy_condition || 'Use as training pressure only after review.')
    })).filter(op => op.operator);
    out.expected_kernel_response = Object.assign({}, out.expected_kernel_response || {}, {
      lexical_action: text(out.expected_kernel_response && out.expected_kernel_response.lexical_action || 'stage language anchor for review'),
      source_trust_action: text(out.expected_kernel_response && out.expected_kernel_response.source_trust_action || 'training pressure only'),
      belief_movement: text(out.expected_kernel_response && out.expected_kernel_response.belief_movement || 'none_from_language_anchor_alone'),
      questions: unique(asArray(out.expected_kernel_response && out.expected_kernel_response.questions).concat([defaultQuestion(out)]))
    });
    out.review_status = text(out.review_status || 'auto_growth_seed_candidate');
    out.workbench_metadata = Object.assign({}, out.workbench_metadata || {}, {
      generated_by: PACKET_TYPE,
      normalized_by: 'normalizeCandidateEntry',
      source_growth_engine: 'KernelObjectiveLanguageKnowledgeGrowthV01',
      id_scope: text(options.id_prefix || 'auto_growth'),
      requires_human_review: true
    });
    return out;
  }

  function validateCandidateEntry(entry) {
    const errors = [];
    if (!text(entry && entry.id)) errors.push('missing_id');
    if (!text(entry && entry.text)) errors.push('missing_text');
    if (!text(entry && entry.language)) errors.push('missing_language');
    if (!text(entry && entry.operator_group)) errors.push('missing_operator_group');
    if (!text(entry && entry.contrast_group)) errors.push('missing_contrast_group');
    if (!asArray(entry && entry.surface_terms).length) errors.push('missing_surface_terms');
    if (!text(entry && entry.literal_meaning)) errors.push('missing_literal_meaning');
    if (!text(entry && entry.candidate_intended_meaning)) errors.push('missing_candidate_intended_meaning');
    if (!asArray(entry && entry.semantic_operators).length) errors.push('missing_semantic_operators');
    asArray(entry && entry.semantic_operators).forEach((op, i) => {
      if (!text(op && op.operator)) errors.push(`operator_${i}_missing_operator`);
      if (!asArray(op && op.pressure).length) errors.push(`operator_${i}_missing_pressure`);
      if (!text(op && op.legitimacy_condition)) errors.push(`operator_${i}_missing_legitimacy_condition`);
    });
    if (!asArray(entry && entry.evidence_burden).length) errors.push('missing_evidence_burden');
    const ekr = entry && entry.expected_kernel_response || {};
    if (!text(ekr.lexical_action)) errors.push('missing_expected_lexical_action');
    if (!text(ekr.source_trust_action)) errors.push('missing_expected_source_trust_action');
    if (!text(ekr.belief_movement)) errors.push('missing_expected_belief_movement');
    if (!asArray(ekr.questions).length) errors.push('missing_expected_questions');
    if (text(ekr.belief_movement) !== 'none_from_language_anchor_alone') errors.push('belief_movement_guard_not_none_from_language_anchor_alone');
    if (!entry || !entry.workbench_metadata || entry.workbench_metadata.requires_human_review !== true) errors.push('missing_human_review_guard');
    return { id: text(entry && entry.id), ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function duplicateCheck(entries, combined) {
    const existing = new Set(asArray(combined && combined.entries).map(e => text(e.id)).filter(Boolean));
    const seen = new Set();
    const duplicates = [];
    asArray(entries).forEach(entry => {
      const id = text(entry && entry.id);
      if (!id) return;
      if (seen.has(id)) duplicates.push({ id, reason: 'duplicate_within_stage' });
      if (existing.has(id)) duplicates.push({ id, reason: 'duplicate_with_existing_corpus' });
      seen.add(id);
    });
    return { ok: duplicates.length === 0, duplicates, belief_movement: 'none' };
  }

  function buildSeedPacket(candidateEntries, context, options = {}) {
    const baseline = `${context && context.current_entry_count || 0} entries / ${context && context.current_source_packet_count || 0} source packets`;
    const nextSourceIndex = Number(context && context.current_source_packet_count || 0);
    return {
      packet_type: '42ndMind_semantic_seed_corpus_v0_1_extension',
      packet_version: VERSION,
      created_at: now(),
      description: `Auto-staged language-growth seed candidates generated by ${PACKET_TYPE}. Training pressure only; not doctrine. Intended next runtime source: extension_${nextSourceIndex}.`,
      doctrine: {
        auto_staged_seed_packet_is_training_pressure_not_doctrine: true,
        language_growth_adds_candidate_anchors_not_truth: true,
        exponential_growth_must_be_candidate_growth_not_belief_growth: true,
        staged_candidate_ids_are_source_scoped_to_prevent_duplicate_reimport: true,
        staged_candidates_include_required_contrast_group: true,
        active_shape_l1_total: 'sum_abs_dimensions_equals_1',
        local_labels_are_metadata_only: true,
        language_anchor_repetition_is_not_truth: true,
        force_intensity_remains_separate_from_shape: true,
        belief_movement: 'none'
      },
      entries: clone(candidateEntries),
      source_review_summary: {
        source_packet_type: PACKET_TYPE,
        source_baseline: baseline,
        emitted_entry_count: candidateEntries.length,
        import_status: 'auto_staged_not_added_to_default_combiner',
        expected_next_baseline: `${Number(context && context.current_entry_count || 0) + candidateEntries.length} entries / ${Number(context && context.current_source_packet_count || 0) + 1} source packets`,
        belief_movement: 'none'
      },
      belief_movement: 'none'
    };
  }

  function validateSeedPacketPreflight(seedPacket) {
    const validator = corpusValidator();
    if (!validator || typeof validator.validateCorpus !== 'function') {
      return {
        ok: false,
        detail: { ok: false, error: 'KernelSemanticCorpusV01.validateCorpus unavailable', belief_movement: 'none' },
        belief_movement: 'none'
      };
    }
    try {
      const report = validator.validateCorpus(seedPacket);
      return {
        ok: report && report.ok === true,
        detail: {
          ok: report && report.ok === true,
          entry_count: report && report.entry_count,
          valid_entry_count: report && report.valid_entry_count,
          invalid_entry_count: report && report.invalid_entry_count,
          errors: report && report.errors || [],
          warnings: report && report.warnings || [],
          belief_movement: 'none'
        },
        belief_movement: 'none'
      };
    } catch (error) {
      return {
        ok: false,
        detail: { ok: false, error: error && error.message || String(error), belief_movement: 'none' },
        belief_movement: 'none'
      };
    }
  }

  function validateStagedPressureRegistryPreflight(seedPacket) {
    const registryApi = pressureRegistry();
    if (!registryApi || typeof registryApi.defaultRegistry !== 'function' || typeof registryApi.validateAgainstCorpus !== 'function') {
      return {
        ok: false,
        detail: { ok: false, error: 'KernelSemanticPressureRegistryV01 pressure validation unavailable', belief_movement: 'none' },
        belief_movement: 'none'
      };
    }
    try {
      const registry = registryApi.defaultRegistry();
      const registryReport = typeof registryApi.validateRegistry === 'function' ? registryApi.validateRegistry(registry) : { ok: true, errors: [] };
      const coverage = registryApi.validateAgainstCorpus(seedPacket, registry);
      const missing = Number(coverage && coverage.missing_pressure_count || 0);
      const ok = registryReport.ok === true && coverage && coverage.ok === true && missing === 0;
      return {
        ok,
        detail: {
          ok,
          registry_ok: registryReport.ok === true,
          registry_pressure_count: registry && registry.pressure_count,
          observed_pressure_count: coverage && coverage.observed_pressure_count,
          covered_pressure_count: coverage && coverage.covered_pressure_count,
          missing_pressure_count: missing,
          missing_pressures: coverage && coverage.missing_pressures || [],
          registry_errors: registryReport.errors || [],
          belief_movement: 'none'
        },
        belief_movement: 'none'
      };
    } catch (error) {
      return {
        ok: false,
        detail: { ok: false, error: error && error.message || String(error), belief_movement: 'none' },
        belief_movement: 'none'
      };
    }
  }

  function validateTempCombinedCorpusPreflight(currentCombined, seedPacket, options = {}) {
    const comb = combiner();
    if (!comb || typeof comb.buildPacket !== 'function') {
      return {
        ok: false,
        detail: { ok: false, error: 'KernelSemanticCorpusCombinerV01.buildPacket unavailable', belief_movement: 'none' },
        temp_combined_corpus: null,
        belief_movement: 'none'
      };
    }
    try {
      const expectedEntryCount = asArray(currentCombined && currentCombined.entries).length + asArray(seedPacket && seedPacket.entries).length;
      const tempPacket = comb.buildPacket(currentCombined, [seedPacket], Object.assign({}, options, {
        description: 'Temporary future combined semantic corpus preflight only; not durable import.'
      }));
      const combined = tempPacket && tempPacket.combined;
      const duplicateCount = asArray(combined && combined.duplicate_entries).length;
      const combinedEntryCount = combined && combined.entry_count || asArray(combined && combined.entries).length;
      const validation = tempPacket && tempPacket.validation && tempPacket.validation.validation;
      const ok = tempPacket && tempPacket.ok === true && combinedEntryCount === expectedEntryCount && duplicateCount === 0;
      return {
        ok,
        detail: {
          ok,
          expected_entry_count: expectedEntryCount,
          combined_entry_count: combinedEntryCount,
          duplicate_count: duplicateCount,
          validation_ok: validation && validation.ok === true,
          validation_errors: validation && validation.errors || [],
          validation_warnings: validation && validation.warnings || [],
          belief_movement: 'none'
        },
        temp_combined_corpus: combined || null,
        belief_movement: 'none'
      };
    } catch (error) {
      return {
        ok: false,
        detail: { ok: false, error: error && error.message || String(error), belief_movement: 'none' },
        temp_combined_corpus: null,
        belief_movement: 'none'
      };
    }
  }

  function validateTempVectorCompressionPreflight(tempCombinedCorpus, options = {}) {
    const registryApi = pressureRegistry();
    const comp = compressorEngine();
    if (!tempCombinedCorpus || !Array.isArray(tempCombinedCorpus.entries)) {
      return {
        ok: false,
        detail: { ok: false, error: 'temp combined corpus unavailable', belief_movement: 'none' },
        belief_movement: 'none'
      };
    }
    if (!registryApi || typeof registryApi.defaultRegistry !== 'function' || typeof registryApi.buildOntologyFromCorpus !== 'function') {
      return {
        ok: false,
        detail: { ok: false, error: 'KernelSemanticPressureRegistryV01 ontology unavailable', belief_movement: 'none' },
        belief_movement: 'none'
      };
    }
    if (!comp || typeof comp.buildVectorSpace !== 'function') {
      return {
        ok: false,
        detail: { ok: false, error: 'KernelSemanticVectorCompressorV01.buildVectorSpace unavailable', belief_movement: 'none' },
        belief_movement: 'none'
      };
    }
    try {
      const registry = registryApi.defaultRegistry();
      const ontology = registryApi.buildOntologyFromCorpus(tempCombinedCorpus, registry);
      const missing = Number(ontology && ontology.validation && ontology.validation.missing_pressure_count || 0);
      const vectorSpace = comp.buildVectorSpace(tempCombinedCorpus, Object.assign({}, options, { registry, ontology }));
      const summary = typeof comp.summarizeVectorSpace === 'function' ? comp.summarizeVectorSpace(vectorSpace) : null;
      const expectedVectorCount = asArray(tempCombinedCorpus.entries).length;
      const vectorCount = Number(vectorSpace && vectorSpace.vector_count || 0);
      const ok = ontology && ontology.validation && ontology.validation.ok === true && missing === 0 && vectorCount === expectedVectorCount;
      return {
        ok,
        detail: {
          ok,
          vector_count: vectorCount,
          expected_vector_count: expectedVectorCount,
          missing_pressure_count: missing,
          pressure_count: ontology && ontology.pressure_count,
          family_count: ontology && ontology.family_count,
          template_count: vectorSpace && vectorSpace.template_count,
          pressure_dimension_count: vectorSpace && vectorSpace.pressure_dimension_count,
          ontology_ok: ontology && ontology.validation && ontology.validation.ok === true,
          summary: summary ? {
            corpus_entry_count: summary.corpus_entry_count,
            vector_count: summary.vector_count,
            pressure_dimension_count: summary.pressure_dimension_count,
            template_count: summary.template_count,
            ontology_summary: summary.ontology_summary
          } : null,
          belief_movement: 'none'
        },
        belief_movement: 'none'
      };
    } catch (error) {
      return {
        ok: false,
        detail: { ok: false, error: error && error.message || String(error), belief_movement: 'none' },
        belief_movement: 'none'
      };
    }
  }

  function decide(gates) {
    const failures = asArray(gates).filter(g => g.status === 'fail');
    const warnings = asArray(gates).filter(g => g.status === 'warn');
    if (failures.length) return { decision: 'REJECT', reason: failures.map(f => f.name).join(', '), belief_movement: 'none' };
    if (warnings.length) return { decision: 'HOLD', reason: warnings.map(w => w.name).join(', '), belief_movement: 'none' };
    return { decision: 'AUTO_STAGE', reason: 'all hard gates passed', belief_movement: 'none' };
  }

  async function runController(options = {}) {
    const maxEntries = Math.max(1, Number(options.max_entries || 16));
    const gates = [];
    const current = await combiner().loadAndCombine(options);
    const currentSourceCount = asArray(current && current.combined && current.combined.source_packets).length;
    const nextIdPrefix = text(options.id_prefix || `auto_growth_extension_${currentSourceCount + 1}`);
    const stagingOptions = Object.assign({}, options, { id_prefix: nextIdPrefix, force_id_scope: options.force_id_scope !== false });

    gates.push({ name: 'current_combiner_ok', status: current.ok === true ? 'pass' : 'fail', detail: { entry_count: current.combined && current.combined.entry_count, source_packet_count: currentSourceCount }, belief_movement: 'none' });

    const growth = await growthEngine().loadAndGrow(Object.assign({}, options, { max_entries: maxEntries }));
    gates.push({ name: 'knowledge_growth_ok', status: growth.ok === true ? 'pass' : 'fail', detail: { anchor_count: growth.anchor_count, candidate_entry_count: growth.candidate_entry_count }, belief_movement: 'none' });

    let benchmark = null;
    const bench = benchmarkEngine();
    if (bench && typeof bench.loadAndRun === 'function') {
      benchmark = await bench.loadAndRun(options);
      gates.push({ name: 'invariance_benchmark_ok', status: benchmark.ok === true ? 'pass' : 'fail', detail: benchmark.summary, belief_movement: 'none' });
    } else {
      gates.push({ name: 'invariance_benchmark_unavailable', status: 'warn', detail: 'benchmark module not loaded', belief_movement: 'none' });
    }

    let compression = null;
    const comp = compressorEngine();
    if (comp && typeof comp.loadCombinedAndCompress === 'function') {
      compression = await comp.loadCombinedAndCompress(options);
      const ontologyOk = compression && compression.pressure_ontology && compression.pressure_ontology.validation && compression.pressure_ontology.validation.missing_pressure_count === 0;
      gates.push({ name: 'current_vector_compression_ok', status: compression.ok === true && ontologyOk ? 'pass' : 'fail', detail: { vector_count: compression.vector_space && compression.vector_space.vector_count, missing_pressure_count: compression.pressure_ontology && compression.pressure_ontology.validation && compression.pressure_ontology.validation.missing_pressure_count }, belief_movement: 'none' });
    } else {
      gates.push({ name: 'vector_compressor_unavailable', status: 'warn', detail: 'compressor module not loaded', belief_movement: 'none' });
    }

    const normalizedEntries = asArray(growth.candidate_entries).slice(0, maxEntries).map((entry, index) => normalizeCandidateEntry(entry, index, stagingOptions));
    const validations = normalizedEntries.map(validateCandidateEntry);
    gates.push({ name: 'candidate_schema_valid', status: validations.every(v => v.ok) && normalizedEntries.length > 0 ? 'pass' : 'fail', detail: validations, belief_movement: 'none' });

    const duplicates = duplicateCheck(normalizedEntries, current.combined);
    gates.push({ name: 'candidate_ids_not_duplicate', status: duplicates.ok ? 'pass' : 'fail', detail: duplicates, belief_movement: 'none' });

    const movementOk = normalizedEntries.every(e => e.expected_kernel_response && e.expected_kernel_response.belief_movement === 'none_from_language_anchor_alone');
    gates.push({ name: 'belief_movement_guard', status: movementOk ? 'pass' : 'fail', detail: 'all candidate entries must preserve none_from_language_anchor_alone', belief_movement: 'none' });

    const context = {
      current_entry_count: current.combined && current.combined.entry_count || 0,
      current_source_packet_count: currentSourceCount
    };
    const seed_packet_draft = buildSeedPacket(normalizedEntries, context, stagingOptions);
    const corpusPreflight = validateSeedPacketPreflight(seed_packet_draft);
    gates.push({ name: 'candidate_corpus_validator_preflight', status: corpusPreflight.ok ? 'pass' : 'fail', detail: corpusPreflight.detail, belief_movement: 'none' });

    const stagedPressurePreflight = validateStagedPressureRegistryPreflight(seed_packet_draft);
    gates.push({ name: 'staged_pressure_registry_preflight', status: stagedPressurePreflight.ok ? 'pass' : 'fail', detail: stagedPressurePreflight.detail, belief_movement: 'none' });

    const tempCombinedPreflight = validateTempCombinedCorpusPreflight(current.combined, seed_packet_draft, stagingOptions);
    gates.push({ name: 'temp_combined_corpus_preflight', status: tempCombinedPreflight.ok ? 'pass' : 'fail', detail: tempCombinedPreflight.detail, belief_movement: 'none' });

    const tempVectorPreflight = validateTempVectorCompressionPreflight(tempCombinedPreflight.temp_combined_corpus, stagingOptions);
    gates.push({ name: 'temp_vector_compression_preflight', status: tempVectorPreflight.ok ? 'pass' : 'fail', detail: tempVectorPreflight.detail, belief_movement: 'none' });

    const decision = decide(gates);

    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: decision.decision === 'AUTO_STAGE',
      decision: decision.decision,
      decision_reason: decision.reason,
      current_baseline: `${context.current_entry_count} entries / ${context.current_source_packet_count} source packets`,
      proposed_entry_count: normalizedEntries.length,
      proposed_next_baseline: `${context.current_entry_count + normalizedEntries.length} entries / ${context.current_source_packet_count + 1} source packets`,
      gates,
      normalized_candidate_entries: normalizedEntries,
      seed_packet_draft,
      growth_summary: {
        anchor_count: growth.anchor_count,
        pressure_group_count: growth.pressure_group_count,
        operator_group_count: growth.operator_group_count,
        token_count: growth.token_count,
        candidate_entry_count: growth.candidate_entry_count,
        id_prefix: nextIdPrefix,
        belief_movement: 'none'
      },
      benchmark_summary: benchmark && benchmark.summary || null,
      compression_summary: compression && compression.summary || null,
      future_preflight_summary: {
        staged_seed_packet_valid: corpusPreflight.ok === true,
        staged_pressures_registered: stagedPressurePreflight.ok === true,
        temp_combined_corpus_valid: tempCombinedPreflight.ok === true,
        temp_vector_compression_ok: tempVectorPreflight.ok === true,
        temp_combined_entry_count: tempCombinedPreflight.detail && tempCombinedPreflight.detail.combined_entry_count,
        temp_vector_count: tempVectorPreflight.detail && tempVectorPreflight.detail.vector_count,
        missing_pressure_count: tempVectorPreflight.detail && tempVectorPreflight.detail.missing_pressure_count,
        belief_movement: 'none'
      },
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelAutoGrowthControllerV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    scopedCandidateId,
    contrastGroupFor,
    normalizeCandidateEntry,
    validateCandidateEntry,
    duplicateCheck,
    buildSeedPacket,
    validateSeedPacketPreflight,
    validateStagedPressureRegistryPreflight,
    validateTempCombinedCorpusPreflight,
    validateTempVectorCompressionPreflight,
    decide,
    runController
  });
})(typeof window !== 'undefined' ? window : globalThis);