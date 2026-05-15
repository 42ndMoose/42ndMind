/* 42ndMind Semantic Language Distiller v0.1
 * Distills a combined semantic corpus into compact language-math diagnostics:
 * operator families, pressure vectors, stable candidate mappings, weak mappings,
 * missing contrast coverage, and overmatch risks.
 *
 * It does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_language_distiller_v0_1';
  const RULE_PACKET_TYPE = '42ndMind_semantic_language_candidate_rules_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function entriesOf(corpus) { return corpus && Array.isArray(corpus.entries) ? corpus.entries : []; }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item); const key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }
  function operatorName(signature) { return text(signature).split('(')[0].trim() || text(signature); }
  function vectorKey(pressures) { return unique(pressures).sort().join(' + '); }

  function doctrine() {
    return {
      distiller_reports_language_math_diagnostics_not_truth: true,
      stable_mappings_are_candidate_rules_not_doctrine: true,
      repeated_pressure_is_not_belief_movement: true,
      contrast_gaps_are_research_targets_not_failures: true,
      overmatch_risks_are_review_flags_not_rejections: true,
      distiller_does_not_move_belief: true,
      distiller_does_not_promote_doctrine: true,
      distiller_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function operatorRows(corpus) {
    const rows = [];
    entriesOf(corpus).forEach((entry, entry_index) => {
      asArray(entry.semantic_operators).forEach((op, operator_index) => {
        const pressures = unique(op.pressure);
        rows.push({
          entry_id: text(entry.id),
          entry_index,
          text: text(entry.text),
          language: text(entry.language || 'en'),
          operator: text(op.operator),
          operator_name: operatorName(op.operator),
          operator_index,
          operator_group: text(entry.operator_group || entry.contrast_group || 'ungrouped'),
          contrast_group: text(entry.contrast_group || entry.operator_group || 'ungrouped'),
          pressures,
          pressure_vector: vectorKey(pressures),
          legitimacy_condition: text(op.legitimacy_condition),
          evidence_burden: clone(asArray(entry.evidence_burden)),
          questions: clone(asArray(entry.expected_kernel_response && entry.expected_kernel_response.questions)),
          review_status: text(entry.review_status || 'unknown'),
          source_label: text(entry.combiner_metadata && entry.combiner_metadata.source_label),
          source_packet_type: text(entry.combiner_metadata && entry.combiner_metadata.source_packet_type)
        });
      });
    });
    return rows;
  }

  function pressureRows(corpus) {
    const rows = [];
    operatorRows(corpus).forEach(row => {
      row.pressures.forEach(pressure => rows.push(Object.assign({}, row, { pressure, mapping_key: `${lower(row.operator_name)}::${pressure}` })));
    });
    return rows;
  }

  function countBy(items, keyFn) {
    const out = {};
    asArray(items).forEach(item => {
      const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
      const k = text(key || 'unknown');
      out[k] = (out[k] || 0) + 1;
    });
    return out;
  }

  function groupRows(rows, keyFn) {
    const groups = {};
    asArray(rows).forEach(row => {
      const key = text(typeof keyFn === 'function' ? keyFn(row) : row[keyFn]);
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    return groups;
  }

  function summarizeSources(corpus) {
    const sources = {};
    entriesOf(corpus).forEach(entry => {
      const label = text(entry.combiner_metadata && entry.combiner_metadata.source_label || 'unknown_source');
      if (!sources[label]) sources[label] = { entry_count: 0, operator_count: 0, source_packet_type: text(entry.combiner_metadata && entry.combiner_metadata.source_packet_type) };
      sources[label].entry_count += 1;
      sources[label].operator_count += asArray(entry.semantic_operators).length;
    });
    return sources;
  }

  function operatorFamilies(corpus) {
    const rows = operatorRows(corpus);
    const byGroup = groupRows(rows, 'operator_group');
    const families = Object.keys(byGroup).sort().map(group => {
      const groupRows = byGroup[group];
      return {
        group,
        operator_count: unique(groupRows.map(r => r.operator_name)).length,
        observation_count: groupRows.length,
        operators: unique(groupRows.map(r => r.operator_name)).sort(),
        pressures: unique(groupRows.flatMap(r => r.pressures)).sort(),
        entry_ids: unique(groupRows.map(r => r.entry_id)).sort()
      };
    });
    return families;
  }

  function pressureVectors(corpus) {
    const rows = operatorRows(corpus);
    const byVector = groupRows(rows, row => `${row.operator_name}::${row.pressure_vector}`);
    return Object.keys(byVector).sort().map(key => {
      const group = byVector[key];
      const first = group[0];
      return {
        key,
        operator: first.operator,
        operator_name: first.operator_name,
        pressure_vector: first.pressure_vector,
        count: group.length,
        entry_ids: unique(group.map(r => r.entry_id)).sort(),
        examples: group.slice(0, 5).map(r => ({ entry_id: r.entry_id, text: r.text }))
      };
    });
  }

  function stableMappings(corpus, options = {}) {
    const min = Number(options.min_observations || 2);
    const rows = pressureRows(corpus);
    const byMapping = groupRows(rows, 'mapping_key');
    return Object.keys(byMapping).sort().map(key => {
      const group = byMapping[key];
      const first = group[0];
      return {
        key,
        operator: first.operator,
        operator_name: first.operator_name,
        pressure: first.pressure,
        count: group.length,
        stable: group.length >= min,
        legitimacy_conditions: unique(group.map(r => r.legitimacy_condition)).slice(0, 8),
        evidence_burdens: unique(group.flatMap(r => r.evidence_burden)).slice(0, 16),
        questions: unique(group.flatMap(r => r.questions)).slice(0, 10),
        entry_ids: unique(group.map(r => r.entry_id)).sort(),
        examples: group.slice(0, 5).map(r => ({ entry_id: r.entry_id, text: r.text }))
      };
    }).filter(item => item.stable);
  }

  function weakMappings(corpus, options = {}) {
    const min = Number(options.min_observations || 2);
    const rows = pressureRows(corpus);
    const byMapping = groupRows(rows, 'mapping_key');
    return Object.keys(byMapping).sort().map(key => {
      const group = byMapping[key];
      const first = group[0];
      return {
        key,
        operator: first.operator,
        operator_name: first.operator_name,
        pressure: first.pressure,
        count: group.length,
        needed: Math.max(0, min - group.length),
        entry_ids: unique(group.map(r => r.entry_id)).sort(),
        examples: group.slice(0, 3).map(r => ({ entry_id: r.entry_id, text: r.text }))
      };
    }).filter(item => item.count < min);
  }

  function contrastNamesFromEntry(entry) {
    const out = [];
    const meta = entry && entry.workbench_metadata || {};
    asArray(meta.contrast_classes).forEach(c => out.push(operatorName(c)));
    asArray(entry && entry.semantic_operators).forEach(op => asArray(op.contrast_class).forEach(c => out.push(operatorName(c))));
    return unique(out);
  }

  function contrastCoverage(corpus) {
    const entries = entriesOf(corpus);
    const observedOperators = new Set(operatorRows(corpus).map(r => lower(r.operator_name)));
    const mentioned = [];
    entries.forEach(entry => contrastNamesFromEntry(entry).forEach(name => mentioned.push({ name, entry_id: entry.id, text: entry.text })));
    const byName = groupRows(mentioned, row => lower(row.name));
    const missing = Object.keys(byName).filter(name => !observedOperators.has(name)).sort().map(name => ({
      operator_name: byName[name][0].name,
      mentioned_count: byName[name].length,
      examples: byName[name].slice(0, 5).map(x => ({ entry_id: x.entry_id, text: x.text }))
    }));
    const covered = Object.keys(byName).filter(name => observedOperators.has(name)).sort().map(name => ({ operator_name: byName[name][0].name, mentioned_count: byName[name].length }));
    return { mentioned_contrast_count: Object.keys(byName).length, covered_count: covered.length, missing_count: missing.length, covered, missing };
  }

  function detectOvermatchRisks(corpus, options = {}) {
    const maxOperators = Number(options.max_operators_per_entry || 4);
    const risks = [];
    entriesOf(corpus).forEach(entry => {
      const ops = asArray(entry.semantic_operators);
      const names = ops.map(op => operatorName(op.operator));
      if (ops.length > maxOperators) risks.push({ type: 'many_operators_single_sentence', entry_id: entry.id, count: ops.length, operators: names, text: entry.text });
      if (names.includes('proved_false') && (names.includes('proved') || names.includes('false'))) risks.push({ type: 'compound_operator_with_unsuppressed_generic_parts', entry_id: entry.id, operators: names, text: entry.text });
      if (names.includes('contradicted_by') && names.includes('contradicts')) risks.push({ type: 'specific_contradiction_with_unsuppressed_generic_contradiction', entry_id: entry.id, operators: names, text: entry.text });
      if (names.includes('published_summary') && names.includes('posted')) risks.push({ type: 'published_summary_overmatched_as_posted', entry_id: entry.id, operators: names, text: entry.text });
      const closureCount = ops.filter(op => asArray(op.pressure).includes('closure_pressure')).length;
      if (closureCount >= 3) risks.push({ type: 'stacked_closure_pressure_review_needed', entry_id: entry.id, closure_operator_count: closureCount, operators: names, text: entry.text });
    });
    return risks;
  }

  function compactLanguageReport(corpus, options = {}) {
    const rows = operatorRows(corpus);
    const pRows = pressureRows(corpus);
    const families = operatorFamilies(corpus);
    const vectors = pressureVectors(corpus);
    const stable = stableMappings(corpus, options);
    const weak = weakMappings(corpus, options);
    const coverage = contrastCoverage(corpus);
    const risks = detectOvermatchRisks(corpus, options);

    return {
      packet_type: '42ndMind_semantic_language_compact_report_v0_1',
      packet_version: VERSION,
      created_at: now(),
      corpus_entry_count: entriesOf(corpus).length,
      operator_observation_count: rows.length,
      pressure_observation_count: pRows.length,
      operator_family_count: families.length,
      unique_operator_count: Object.keys(countBy(rows, 'operator_name')).length,
      unique_pressure_count: Object.keys(countBy(pRows, 'pressure')).length,
      pressure_vector_count: vectors.length,
      stable_mapping_count: stable.length,
      weak_mapping_count: weak.length,
      contrast_missing_count: coverage.missing_count,
      overmatch_risk_count: risks.length,
      top_operators: Object.entries(countBy(rows, 'operator_name')).sort((a,b) => b[1] - a[1]).slice(0, 20).map(([operator, count]) => ({ operator, count })),
      top_pressures: Object.entries(countBy(pRows, 'pressure')).sort((a,b) => b[1] - a[1]).slice(0, 20).map(([pressure, count]) => ({ pressure, count })),
      source_summary: summarizeSources(corpus),
      families,
      stable_mappings: stable,
      weak_mappings: weak,
      contrast_coverage: coverage,
      overmatch_risks: risks,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function candidateRules(corpus, options = {}) {
    const stable = stableMappings(corpus, options);
    const rules = stable.map((m, index) => ({
      id: `semantic_rule_${String(index + 1).padStart(3, '0')}_${lower(m.operator_name).replace(/[^a-z0-9]+/g, '_')}_${lower(m.pressure).replace(/[^a-z0-9]+/g, '_')}`.slice(0, 180),
      operator: m.operator,
      operator_name: m.operator_name,
      pressure: m.pressure,
      rule_form: `${m.operator} -> ${m.pressure}`,
      observation_count: m.count,
      legitimacy_conditions: m.legitimacy_conditions,
      evidence_burdens: m.evidence_burdens,
      questions: m.questions,
      examples: m.examples,
      promotion_state: { implemented: false, enabled: false, requires_review: true },
      active_belief_effect: 'none'
    }));
    return {
      packet_type: RULE_PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      rule_count: rules.length,
      min_observations: Number(options.min_observations || 2),
      rules,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function distill(corpus, options = {}) {
    const report = compactLanguageReport(corpus, options);
    const rules = candidateRules(corpus, options);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: true,
      decision: 'LANGUAGE_MATH_DISTILLED_AS_CANDIDATE_DIAGNOSTICS',
      compact_report: report,
      candidate_rules: rules,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  async function loadCombinedAndDistill(options = {}) {
    if (!global.KernelSemanticCorpusCombinerV01 || typeof global.KernelSemanticCorpusCombinerV01.loadAndCombine !== 'function') throw new Error('KernelSemanticCorpusCombinerV01 unavailable');
    const combinedPacket = await global.KernelSemanticCorpusCombinerV01.loadAndCombine(options);
    return Object.assign(distill(combinedPacket.combined, options), { combined_packet: combinedPacket });
  }

  global.KernelSemanticLanguageDistillerV01 = Object.freeze({
    VERSION, PACKET_TYPE, RULE_PACKET_TYPE,
    doctrine, operatorRows, pressureRows, operatorFamilies, pressureVectors,
    stableMappings, weakMappings, contrastCoverage, detectOvermatchRisks,
    compactLanguageReport, candidateRules, distill, loadCombinedAndDistill
  });
})(typeof window !== 'undefined' ? window : globalThis);
