/* 42ndMind Semantic Vector Compressor v0.1
 * Compresses reviewed semantic corpus entries into reusable vector packets.
 *
 * This is the first recursive-learning bridge:
 * stable examples -> operator/pressure ontology -> compressed semantic vectors
 * -> higher-order reusable templates -> review targets.
 *
 * It does not decide truth, infer final intent, move belief, promote doctrine,
 * or patch source. It only compresses reviewed structures into auditable vectors.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_vector_compressor_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function entriesOf(corpus) { return corpus && Array.isArray(corpus.entries) ? corpus.entries : []; }
  function operatorName(signature) { return text(signature).split('(')[0].trim() || text(signature); }
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
  function countInto(target, key, amount) {
    const k = text(key);
    if (!k) return target;
    target[k] = (target[k] || 0) + (amount === undefined ? 1 : amount);
    return target;
  }
  function mergeCounts() {
    const out = {};
    Array.from(arguments).forEach(map => {
      Object.entries(map || {}).forEach(([key, value]) => countInto(out, key, Number(value) || 0));
    });
    return out;
  }
  function normalizeCounts(map) {
    const entries = Object.entries(map || {});
    const total = entries.reduce((sum, [, value]) => sum + Math.abs(Number(value) || 0), 0) || 1;
    const out = {};
    entries.forEach(([key, value]) => { out[key] = Number((Number(value || 0) / total).toFixed(6)); });
    return out;
  }
  function dot(a, b) {
    let total = 0;
    Object.entries(a || {}).forEach(([key, value]) => { total += (Number(value) || 0) * (Number((b || {})[key]) || 0); });
    return total;
  }
  function norm(a) { return Math.sqrt(dot(a, a)); }
  function cosine(a, b) {
    const denom = norm(a) * norm(b);
    return denom ? Number((dot(a, b) / denom).toFixed(6)) : 0;
  }

  function doctrine() {
    return {
      vector_compression_is_diagnostic_not_truth: true,
      vectors_compress_reviewed_structures_not_world_facts: true,
      templates_are_candidate_reuse_units_not_doctrine: true,
      recursive_growth_must_be_gated_by_tests_and_review: true,
      vector_compressor_does_not_infer_final_intent: true,
      vector_compressor_does_not_move_belief: true,
      vector_compressor_does_not_promote_doctrine: true,
      vector_compressor_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function pressureOntologyMap(ontologyOrRegistry) {
    let rows = [];
    if (ontologyOrRegistry && Array.isArray(ontologyOrRegistry.pressures)) rows = ontologyOrRegistry.pressures;
    const out = {};
    rows.forEach(row => { if (row && row.pressure) out[text(row.pressure)] = row; });
    return out;
  }

  function rowForPressure(pressure, ontologyMap, registry) {
    const p = text(pressure);
    if (ontologyMap && ontologyMap[p]) return ontologyMap[p];
    if (global.KernelSemanticPressureRegistryV01 && typeof global.KernelSemanticPressureRegistryV01.lookup === 'function') {
      return global.KernelSemanticPressureRegistryV01.lookup(p, registry) || null;
    }
    return null;
  }

  function operatorRows(entry) {
    return asArray(entry && entry.semantic_operators).map(op => ({
      operator: text(op.operator),
      operator_name: operatorName(op.operator),
      pressures: unique(op.pressure),
      legitimacy_condition: text(op.legitimacy_condition)
    })).filter(row => row.operator);
  }

  function compressEntry(entry, options = {}) {
    const ontologyMap = pressureOntologyMap(options.ontology || options.registry);
    const registry = options.registry;
    const operators = operatorRows(entry);
    const operator_vector = {};
    const pressure_vector = {};
    const pressure_family_vector = {};
    const blocked_movement_vector = {};
    const required_check_vector = {};
    const allowed_movement_vector = {};
    const contrast_vector = {};
    const severity_vector = {};

    operators.forEach(row => {
      countInto(operator_vector, row.operator_name);
      row.pressures.forEach(pressure => {
        countInto(pressure_vector, pressure);
        const def = rowForPressure(pressure, ontologyMap, registry);
        if (def) {
          countInto(pressure_family_vector, def.family || 'unclassified');
          asArray(def.blocks).forEach(block => countInto(blocked_movement_vector, block));
          asArray(def.requires).forEach(req => countInto(required_check_vector, req));
          asArray(def.allows).forEach(allow => countInto(allowed_movement_vector, allow));
          asArray(def.contrasts).forEach(contrast => countInto(contrast_vector, contrast));
          countInto(severity_vector, def.severity || 'medium');
        } else {
          countInto(pressure_family_vector, 'unregistered');
        }
      });
    });

    const combined_vector = normalizeCounts(mergeCounts(operator_vector, pressure_vector, pressure_family_vector, blocked_movement_vector, required_check_vector, allowed_movement_vector));
    const pressures = unique(Object.keys(pressure_vector)).sort();
    const operator_names = unique(Object.keys(operator_vector)).sort();
    const pressure_families = unique(Object.keys(pressure_family_vector)).sort();
    const signature = pressures.join('|') || operator_names.join('|') || text(entry && entry.id);

    return {
      entry_id: text(entry && entry.id),
      text: text(entry && entry.text),
      operator_group: text((entry && (entry.operator_group || entry.contrast_group)) || 'ungrouped'),
      operator_names,
      pressures,
      pressure_families,
      pressure_signature: signature,
      operator_vector: normalizeCounts(operator_vector),
      pressure_vector: normalizeCounts(pressure_vector),
      pressure_family_vector: normalizeCounts(pressure_family_vector),
      blocked_movement_vector: normalizeCounts(blocked_movement_vector),
      required_check_vector: normalizeCounts(required_check_vector),
      allowed_movement_vector: normalizeCounts(allowed_movement_vector),
      contrast_vector: normalizeCounts(contrast_vector),
      severity_vector: normalizeCounts(severity_vector),
      combined_vector,
      evidence_burden_count: asArray(entry && entry.evidence_burden).length,
      kernel_question_count: asArray(entry && entry.expected_kernel_response && entry.expected_kernel_response.questions).length,
      belief_movement: 'none'
    };
  }

  function groupVectors(vectors, keyFn) {
    const groups = {};
    asArray(vectors).forEach(vector => {
      const key = text(typeof keyFn === 'function' ? keyFn(vector) : vector[keyFn]);
      if (!groups[key]) groups[key] = [];
      groups[key].push(vector);
    });
    return groups;
  }

  function centroid(vectors, field) {
    const raw = {};
    asArray(vectors).forEach(vector => {
      Object.entries(vector[field] || {}).forEach(([key, value]) => countInto(raw, key, Number(value) || 0));
    });
    return normalizeCounts(raw);
  }

  function buildTemplates(vectors, options = {}) {
    const min = Math.max(2, Number(options.min_observations || 2));
    const bySignature = groupVectors(vectors, 'pressure_signature');
    const templates = [];
    Object.entries(bySignature).forEach(([signature, items]) => {
      if (items.length < min) return;
      const famCounts = {};
      items.forEach(item => item.pressure_families.forEach(fam => countInto(famCounts, fam)));
      const opCounts = {};
      items.forEach(item => item.operator_names.forEach(op => countInto(opCounts, op)));
      templates.push({
        template_id: `template_${templates.length + 1}_${signature.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 56)}`,
        basis: 'shared_pressure_signature',
        pressure_signature: signature,
        observation_count: items.length,
        entry_ids: items.map(item => item.entry_id),
        operator_names: Object.entries(opCounts).sort((a,b) => b[1] - a[1]).map(([operator, count]) => ({ operator, count })),
        pressure_families: Object.entries(famCounts).sort((a,b) => b[1] - a[1]).map(([family, count]) => ({ family, count })),
        centroid_vector: centroid(items, 'combined_vector'),
        blocks_centroid: centroid(items, 'blocked_movement_vector'),
        requires_centroid: centroid(items, 'required_check_vector'),
        allows_centroid: centroid(items, 'allowed_movement_vector'),
        reuse_status: 'candidate_template_requires_review',
        belief_movement: 'none'
      });
    });
    return templates.sort((a,b) => b.observation_count - a.observation_count || a.pressure_signature.localeCompare(b.pressure_signature));
  }

  function nearestVectors(target, vectors, options = {}) {
    const topN = Math.max(1, Number(options.top_n || 5));
    const targetVector = target && target.combined_vector ? target.combined_vector : target;
    return asArray(vectors).filter(v => v && v.combined_vector).map(v => ({
      entry_id: v.entry_id,
      text: v.text,
      score: cosine(targetVector, v.combined_vector),
      pressure_signature: v.pressure_signature
    })).sort((a,b) => b.score - a.score).slice(0, topN);
  }

  function corpusVectors(corpus, options = {}) {
    return entriesOf(corpus).map(entry => compressEntry(entry, options));
  }

  function aggregateVectors(vectors) {
    const operator_vector = {}, pressure_vector = {}, pressure_family_vector = {}, blocked_movement_vector = {}, required_check_vector = {}, allowed_movement_vector = {}, severity_vector = {};
    asArray(vectors).forEach(vector => {
      Object.entries(vector.operator_vector || {}).forEach(([key, value]) => countInto(operator_vector, key, value));
      Object.entries(vector.pressure_vector || {}).forEach(([key, value]) => countInto(pressure_vector, key, value));
      Object.entries(vector.pressure_family_vector || {}).forEach(([key, value]) => countInto(pressure_family_vector, key, value));
      Object.entries(vector.blocked_movement_vector || {}).forEach(([key, value]) => countInto(blocked_movement_vector, key, value));
      Object.entries(vector.required_check_vector || {}).forEach(([key, value]) => countInto(required_check_vector, key, value));
      Object.entries(vector.allowed_movement_vector || {}).forEach(([key, value]) => countInto(allowed_movement_vector, key, value));
      Object.entries(vector.severity_vector || {}).forEach(([key, value]) => countInto(severity_vector, key, value));
    });
    return {
      operator_vector: normalizeCounts(operator_vector),
      pressure_vector: normalizeCounts(pressure_vector),
      pressure_family_vector: normalizeCounts(pressure_family_vector),
      blocked_movement_vector: normalizeCounts(blocked_movement_vector),
      required_check_vector: normalizeCounts(required_check_vector),
      allowed_movement_vector: normalizeCounts(allowed_movement_vector),
      severity_vector: normalizeCounts(severity_vector),
      belief_movement: 'none'
    };
  }

  function buildVectorSpace(corpus, options = {}) {
    const registry = options.registry || (global.KernelSemanticPressureRegistryV01 && global.KernelSemanticPressureRegistryV01.defaultRegistry ? global.KernelSemanticPressureRegistryV01.defaultRegistry() : null);
    const ontology = options.ontology || (global.KernelSemanticPressureRegistryV01 && global.KernelSemanticPressureRegistryV01.buildOntologyFromCorpus ? global.KernelSemanticPressureRegistryV01.buildOntologyFromCorpus(corpus, registry) : null);
    const vectors = corpusVectors(corpus, { registry, ontology });
    const templates = buildTemplates(vectors, options);
    const aggregate = aggregateVectors(vectors);
    const pressureNames = unique(vectors.flatMap(v => v.pressures)).sort();
    const operatorNames = unique(vectors.flatMap(v => v.operator_names)).sort();
    const familyNames = unique(vectors.flatMap(v => v.pressure_families)).sort();
    const blockedNames = unique(vectors.flatMap(v => Object.keys(v.blocked_movement_vector || {}))).sort();
    const requiredNames = unique(vectors.flatMap(v => Object.keys(v.required_check_vector || {}))).sort();
    const allowedNames = unique(vectors.flatMap(v => Object.keys(v.allowed_movement_vector || {}))).sort();
    return {
      packet_type: '42ndMind_semantic_vector_space_v0_1',
      packet_version: VERSION,
      created_at: now(),
      corpus_entry_count: entriesOf(corpus).length,
      vector_count: vectors.length,
      operator_dimension_count: operatorNames.length,
      pressure_dimension_count: pressureNames.length,
      pressure_family_dimension_count: familyNames.length,
      blocked_movement_dimension_count: blockedNames.length,
      required_check_dimension_count: requiredNames.length,
      allowed_movement_dimension_count: allowedNames.length,
      template_count: templates.length,
      dimensions: {
        operators: operatorNames,
        pressures: pressureNames,
        pressure_families: familyNames,
        blocked_movements: blockedNames,
        required_checks: requiredNames,
        allowed_movements: allowedNames
      },
      aggregate_vector: aggregate,
      templates,
      vectors,
      ontology_summary: ontology ? {
        pressure_count: ontology.pressure_count,
        family_count: ontology.family_count,
        missing_pressure_count: ontology.validation && ontology.validation.missing_pressure_count
      } : null,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function summarizeVectorSpace(space) {
    return {
      packet_type: '42ndMind_semantic_vector_space_summary_v0_1',
      packet_version: VERSION,
      created_at: now(),
      corpus_entry_count: space && space.corpus_entry_count || 0,
      vector_count: space && space.vector_count || 0,
      operator_dimension_count: space && space.operator_dimension_count || 0,
      pressure_dimension_count: space && space.pressure_dimension_count || 0,
      pressure_family_dimension_count: space && space.pressure_family_dimension_count || 0,
      blocked_movement_dimension_count: space && space.blocked_movement_dimension_count || 0,
      required_check_dimension_count: space && space.required_check_dimension_count || 0,
      allowed_movement_dimension_count: space && space.allowed_movement_dimension_count || 0,
      template_count: space && space.template_count || 0,
      top_pressure_families: Object.entries((space && space.aggregate_vector && space.aggregate_vector.pressure_family_vector) || {}).sort((a,b) => b[1] - a[1]).slice(0, 12).map(([family, weight]) => ({ family, weight })),
      top_blocked_movements: Object.entries((space && space.aggregate_vector && space.aggregate_vector.blocked_movement_vector) || {}).sort((a,b) => b[1] - a[1]).slice(0, 12).map(([movement, weight]) => ({ movement, weight })),
      top_required_checks: Object.entries((space && space.aggregate_vector && space.aggregate_vector.required_check_vector) || {}).sort((a,b) => b[1] - a[1]).slice(0, 12).map(([check, weight]) => ({ check, weight })),
      top_templates: asArray(space && space.templates).slice(0, 12).map(t => ({ template_id: t.template_id, pressure_signature: t.pressure_signature, observation_count: t.observation_count, entry_ids: t.entry_ids })),
      ontology_summary: space && space.ontology_summary || null,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function generateReviewTargets(space, options = {}) {
    const min = Math.max(2, Number(options.min_template_observations || 2));
    const templates = asArray(space && space.templates).filter(t => t.observation_count >= min);
    const targets = templates.slice(0, Number(options.limit || 10)).map(t => ({
      target_type: 'template_reuse_review',
      template_id: t.template_id,
      pressure_signature: t.pressure_signature,
      reason: 'Stable pressure signature can be reused as a candidate semantic template after review.',
      evidence_needed: ['Generate contrast examples.', 'Check overmatch risk.', 'Confirm pressure ontology coverage.', 'Do not promote without test pass.'],
      belief_movement: 'none'
    }));
    return {
      packet_type: '42ndMind_semantic_vector_review_targets_v0_1',
      packet_version: VERSION,
      created_at: now(),
      target_count: targets.length,
      targets,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  async function loadCombinedAndCompress(options = {}) {
    if (!global.KernelSemanticCorpusCombinerV01 || typeof global.KernelSemanticCorpusCombinerV01.loadAndCombine !== 'function') throw new Error('KernelSemanticCorpusCombinerV01 unavailable');
    if (!global.KernelSemanticPressureRegistryV01 || typeof global.KernelSemanticPressureRegistryV01.defaultRegistry !== 'function') throw new Error('KernelSemanticPressureRegistryV01 unavailable');
    const combinedPacket = await global.KernelSemanticCorpusCombinerV01.loadAndCombine(options);
    const registry = global.KernelSemanticPressureRegistryV01.defaultRegistry();
    const ontology = global.KernelSemanticPressureRegistryV01.buildOntologyFromCorpus(combinedPacket.combined, registry);
    const vector_space = buildVectorSpace(combinedPacket.combined, Object.assign({}, options, { registry, ontology }));
    const summary = summarizeVectorSpace(vector_space);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: combinedPacket.ok === true && ontology.validation && ontology.validation.ok === true,
      combined_packet: combinedPacket,
      pressure_ontology: ontology,
      vector_space,
      summary,
      review_targets: generateReviewTargets(vector_space, options),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  global.KernelSemanticVectorCompressorV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    normalizeCounts,
    cosine,
    compressEntry,
    corpusVectors,
    buildTemplates,
    nearestVectors,
    aggregateVectors,
    buildVectorSpace,
    summarizeVectorSpace,
    generateReviewTargets,
    loadCombinedAndCompress
  });
})(typeof window !== 'undefined' ? window : globalThis);
