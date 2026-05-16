/* 42ndMind Semantic Law Candidate Extractor v0.1.1 Patch
 * Imports basis-refinement seed entries as reviewable law candidates and
 * suppresses old collapsed candidates when a targeted split exists.
 *
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticLawCandidateExtractorV01;
  if (!base) throw new Error('KernelSemanticLawCandidateExtractorV01 unavailable for v0.1.1 patch');

  const VERSION = '0.1.1';
  const PACKET_TYPE = '42ndMind_semantic_law_candidate_extractor_v0_1_1_patch';

  function text(value) { return String(value == null ? '' : value).trim(); }
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
  function stableHash(value) {
    let h = 0;
    const s = text(value);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36).slice(0, 8);
  }
  function countMap(items) {
    return asArray(items).reduce((acc, item) => {
      const key = text(item || 'unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
  function vectorFor(pressures, dimensions) {
    const set = new Set(asArray(pressures));
    const out = {};
    asArray(dimensions).forEach(d => { out[d] = set.has(d) ? 1 : 0; });
    return out;
  }

  const TARGETED_COLLAPSED_SIGNATURES = Object.freeze({
    expert: ['authority_transfer_pressure|closure_pressure'],
    settled: ['authority_transfer_pressure|closure_pressure'],
    collusion: ['direct_link_evidence_burden|motive_agency_pressure'],
    coordinated: ['direct_link_evidence_burden|motive_agency_pressure']
  });

  function doctrine() {
    return Object.assign({}, base.doctrine(), {
      patch_packet_type: PACKET_TYPE,
      patch_version: VERSION,
      basis_refinement_seeds_can_generate_reviewable_law_candidates: true,
      targeted_collapsed_candidates_can_be_suppressed_when_split_seed_exists: true,
      basis_refinement_laws_are_candidates_not_doctrine: true,
      patch_does_not_move_belief: true,
      belief_movement: 'none'
    });
  }

  function isBasisRefinementEntry(entry) {
    return lower(entry && entry.operator_group).startsWith('basis_refinement_') || !!(entry && entry.workbench_metadata && entry.workbench_metadata.refinement_target);
  }

  function basisRefinementEntries(corpus) {
    return asArray(corpus && corpus.entries).filter(isBasisRefinementEntry);
  }

  function groupBasisOperators(entries) {
    const groups = new Map();
    asArray(entries).forEach(entry => {
      asArray(entry.semantic_operators).forEach(op => {
        const operator = text(op && op.operator);
        const name = operatorName(operator);
        const pressures = unique(op && op.pressure).sort();
        if (!operator || !pressures.length) return;
        const key = `${name}::${pressureSignature(pressures)}`;
        if (!groups.has(key)) groups.set(key, { key, name, operator, pressures, rows: [] });
        groups.get(key).rows.push({ entry, op });
      });
    });
    return Array.from(groups.values());
  }

  function evidenceBurdenFromRows(rows) {
    return unique(asArray(rows).flatMap(row => asArray(row.entry && row.entry.evidence_burden))).slice(0, 16);
  }

  function guardsFromRows(rows) {
    return unique(asArray(rows).map(row => row.op && row.op.legitimacy_condition).filter(Boolean)).slice(0, 16);
  }

  function contrastClassesFromRows(rows) {
    return unique(asArray(rows).flatMap(row => [row.entry && row.entry.contrast_group, row.entry && row.entry.operator_group, row.entry && row.entry.workbench_metadata && row.entry.workbench_metadata.refinement_target])).slice(0, 20);
  }

  function sourceGroupsFromRows(rows) {
    return unique(asArray(rows).flatMap(row => [row.entry && row.entry.operator_group, row.entry && row.entry.workbench_metadata && row.entry.workbench_metadata.refinement_target])).filter(Boolean);
  }

  function buildBasisRefinementLaw(group, dimensions) {
    const rows = asArray(group.rows);
    const pressures = unique(group.pressures).sort();
    const primaryOperator = text(group.operator || group.name);
    const name = operatorName(primaryOperator);
    const sentences = unique(rows.map(row => row.entry && row.entry.text));
    const candidateId = `law_basis_refinement_${name}_${stableHash(name + pressureSignature(pressures))}`;
    return {
      id: candidateId,
      law_status: 'basis_refinement_candidate',
      equation_type: 'operator_pressure_vector_mapping',
      equation: `${name} := { ${pressures.join(', ')} } -> evidence_burden -> blocked_belief_movement_until_legitimate`,
      primary_operator: name,
      operator_names: [name],
      pressure_signature: pressureSignature(pressures),
      pressures,
      pressure_vector_l1_norm: pressures.length,
      binary_pressure_vector: vectorFor(pressures, dimensions),
      observation_count: rows.length,
      sentence_equivalence_class: sentences,
      evidence_burden: evidenceBurdenFromRows(rows),
      legitimacy_guards: guardsFromRows(rows),
      contrast_classes: contrastClassesFromRows(rows),
      blocked_movement: 'belief_movement_blocked_until_legitimacy_conditions_are_satisfied',
      allowed_movement: 'none_from_language_alone',
      falsification_tests: [
        'Find a basis-refinement sentence where this operator does not require the proposed pressure vector.',
        'Find a contrast sentence that collapses this operator into the target it is meant to split from.',
        'Run candidate sentences through the workbench and check for overmatch or undermatch.'
      ],
      source_template_groups: sourceGroupsFromRows(rows),
      source_recommendations: { basis_refinement_seed_candidate: rows.length },
      created_from: 'basis_refinement_seed_corpus',
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function shouldSuppressCollapsedLaw(law, basisLaws) {
    const name = operatorName(law && law.primary_operator);
    const sig = text(law && law.pressure_signature || pressureSignature(law && law.pressures));
    const targeted = asArray(TARGETED_COLLAPSED_SIGNATURES[name]);
    if (!targeted.includes(sig)) return false;
    return asArray(basisLaws).some(candidate => operatorName(candidate.primary_operator) === name);
  }

  function augmentLawReportWithBasisRefinement(lawReport, corpus) {
    const baseLaws = asArray(lawReport && lawReport.law_candidates);
    const entries = basisRefinementEntries(corpus);
    const basisGroups = groupBasisOperators(entries);
    const pressureDimensions = unique(asArray(lawReport && lawReport.pressure_dimensions).concat(basisGroups.flatMap(group => group.pressures))).sort();
    const basisLaws = basisGroups.map(group => buildBasisRefinementLaw(group, pressureDimensions));
    const filteredBaseLaws = baseLaws.filter(law => !shouldSuppressCollapsedLaw(law, basisLaws));
    const laws = filteredBaseLaws.concat(basisLaws);
    const suppressed = baseLaws.filter(law => shouldSuppressCollapsedLaw(law, basisLaws)).map(law => ({
      law_id: text(law.id),
      primary_operator: text(law.primary_operator),
      pressure_signature: text(law.pressure_signature),
      reason: 'suppressed_by_basis_refinement_split_candidate',
      belief_movement: 'none'
    }));
    const summary = Object.assign({}, lawReport && lawReport.summary || {}, {
      law_candidate_count: laws.length,
      basis_refinement_entry_count: entries.length,
      basis_refinement_law_count: basisLaws.length,
      suppressed_collapsed_law_count: suppressed.length,
      pressure_dimension_count: pressureDimensions.length,
      law_status_counts: countMap(laws.map(l => l.law_status)),
      top_operator_counts: countMap(laws.map(l => l.primary_operator)),
      patch_version: VERSION,
      belief_movement: 'none'
    });
    return Object.assign({}, clone(lawReport || {}), {
      packet_version: VERSION,
      patched_by: PACKET_TYPE,
      patched_at: now(),
      summary,
      pressure_dimensions: pressureDimensions,
      law_candidates: laws,
      basis_refinement_source_summary: {
        source_entry_count: entries.length,
        generated_law_count: basisLaws.length,
        suppressed_collapsed_law_count: suppressed.length,
        suppressed_collapsed_laws: suppressed,
        belief_movement: 'none'
      },
      doctrine: doctrine(),
      belief_movement: 'none'
    });
  }

  async function loadCombinedCorpus(options = {}) {
    if (!global.KernelSemanticCorpusCombinerV01 || typeof global.KernelSemanticCorpusCombinerV01.loadAndCombine !== 'function') return null;
    const packet = await global.KernelSemanticCorpusCombinerV01.loadAndCombine(options);
    return packet && packet.combined;
  }

  async function loadValidateTriageAndExtract(options = {}) {
    const basePacket = await base.loadValidateTriageAndExtract(options);
    let combined = null;
    try { combined = await loadCombinedCorpus(options); }
    catch (e) { combined = null; }
    const augmentedLawReport = combined ? augmentLawReportWithBasisRefinement(basePacket.law_report, combined) : basePacket.law_report;
    return Object.assign({}, basePacket, {
      packet_version: VERSION,
      patched_by: PACKET_TYPE,
      law_report: augmentedLawReport,
      summary: augmentedLawReport.summary,
      doctrine: doctrine(),
      belief_movement: 'none'
    });
  }

  global.KernelSemanticLawCandidateExtractorV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PACKET_TYPE,
    doctrine,
    isBasisRefinementEntry,
    basisRefinementEntries,
    groupBasisOperators,
    buildBasisRefinementLaw,
    shouldSuppressCollapsedLaw,
    augmentLawReportWithBasisRefinement,
    loadValidateTriageAndExtract
  }));
})(typeof window !== 'undefined' ? window : globalThis);
