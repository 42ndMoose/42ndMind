/* 42ndMind Objective Language Knowledge Growth v0.1
 * Deterministic language-knowledge growth engine.
 *
 * Purpose:
 * - read semantic corpus entries and benchmark cases
 * - extract surface phrases, operator names, pressure labels, and multilingual variants
 * - build reviewed candidate language anchors
 * - preserve unit-total shape doctrine and zero belief movement
 *
 * This is not a neural network training loop. It is a gated semantic-network growth layer.
 * It does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_objective_language_knowledge_growth_v0_1';
  const DEFAULT_CASE_URL = 'data/objective_language_invariance_benchmark_cases_v0_1.json';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 96) || 'language_anchor'; }
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
  function uniqueObjects(items, keyFn) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const key = keyFn(item);
      if (key && !seen.has(key)) { seen.add(key); out.push(item); }
    });
    return out;
  }
  function operatorName(operator) {
    const raw = text(operator && operator.operator || operator);
    const idx = raw.indexOf('(');
    return idx >= 0 ? raw.slice(0, idx) : raw;
  }
  function operatorTerms(op) {
    const raw = text(op && op.operator || op);
    const name = operatorName(raw);
    const inside = raw.includes('(') ? raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(')')) : '';
    return unique([raw, name].concat(inside.split(',').map(t => text(t)).filter(Boolean)));
  }
  function normalizePhrase(value) {
    return lower(value).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^a-z0-9_\s\-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function phraseTokens(value) {
    return normalizePhrase(value).split(' ').filter(t => t.length >= 2);
  }

  function doctrine() {
    return {
      growth_engine_is_gated_semantic_network_not_unbounded_neural_training: true,
      language_growth_adds_candidate_anchors_not_truth: true,
      exponential_growth_must_be_candidate_growth_not_belief_growth: true,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      mature_scope_remains_one_with_more_dimensions: true,
      force_intensity_remains_separate_from_shape: true,
      local_labels_are_metadata_only: true,
      language_anchor_repetition_is_not_truth: true,
      growth_engine_does_not_move_belief: true,
      growth_engine_does_not_promote_doctrine: true,
      growth_engine_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function combiner() {
    if (!global.KernelSemanticCorpusCombinerV01) throw new Error('KernelSemanticCorpusCombinerV01 unavailable');
    return global.KernelSemanticCorpusCombinerV01;
  }

  async function fetchJson(url) {
    if (typeof fetch !== 'function') throw new Error('fetch_unavailable');
    const target = `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(VERSION)}`;
    const res = await fetch(target, { cache: 'no-store' });
    if (!res.ok) throw new Error(`fetch_failed_${res.status}_${url}`);
    return res.json();
  }

  function anchorsFromCorpus(combined) {
    const anchors = [];
    asArray(combined && combined.entries).forEach(entry => {
      const sourceId = text(entry.id);
      const basePhrases = unique([entry.text, entry.literal_meaning, entry.candidate_intended_meaning].concat(asArray(entry.surface_terms)));
      const ops = asArray(entry.semantic_operators);
      const opNames = unique(ops.map(operatorName));
      const pressures = unique(ops.flatMap(op => asArray(op.pressure)));
      basePhrases.forEach(phrase => {
        if (!phrase || normalizePhrase(phrase).length < 3) return;
        anchors.push({
          anchor_id: `corpus_${safeId(sourceId)}_${safeId(phrase).slice(0,48)}`,
          phrase,
          normalized_phrase: normalizePhrase(phrase),
          language: text(entry.language || 'en'),
          source: 'semantic_corpus',
          source_entry_id: sourceId,
          operator_group: text(entry.operator_group),
          operators: opNames,
          pressures,
          tokens: phraseTokens(phrase),
          review_status: 'candidate_language_anchor',
          belief_movement: 'none'
        });
      });
      ops.forEach(op => {
        operatorTerms(op).forEach(term => {
          anchors.push({
            anchor_id: `operator_${safeId(sourceId)}_${safeId(term)}`,
            phrase: term,
            normalized_phrase: normalizePhrase(term),
            language: 'symbolic',
            source: 'semantic_operator',
            source_entry_id: sourceId,
            operator_group: text(entry.operator_group),
            operators: [operatorName(op)],
            pressures: asArray(op.pressure),
            tokens: phraseTokens(term.replace(/_/g, ' ')),
            review_status: 'candidate_operator_anchor',
            belief_movement: 'none'
          });
        });
      });
    });
    return uniqueObjects(anchors, a => `${a.source_entry_id}|${a.language}|${a.normalized_phrase}|${asArray(a.operators).join(',')}|${asArray(a.pressures).join(',')}`);
  }

  function anchorsFromBenchmarkCases(casePacket) {
    const anchors = [];
    asArray(casePacket && casePacket.groups).forEach(group => {
      asArray(group.variants).forEach(variant => {
        const dims = Object.keys(variant.expected_dimensions || {});
        anchors.push({
          anchor_id: `benchmark_${safeId(group.group_id)}_${safeId(variant.variant_id)}`,
          phrase: text(variant.text),
          normalized_phrase: normalizePhrase(variant.text),
          language: text(variant.language || 'en'),
          source: 'invariance_benchmark_case',
          source_group_id: text(group.group_id),
          source_variant_id: text(variant.variant_id),
          expected_group_type: text(group.group_type),
          operators: [],
          pressures: dims,
          tokens: phraseTokens(variant.text),
          expected_dimensions: clone(variant.expected_dimensions || {}),
          review_status: 'fixed_benchmark_language_anchor',
          belief_movement: 'none'
        });
      });
      if (group.shape) {
        anchors.push({
          anchor_id: `benchmark_shape_${safeId(group.group_id)}`,
          phrase: text(group.description || group.group_id),
          normalized_phrase: normalizePhrase(group.description || group.group_id),
          language: 'shape',
          source: 'invariance_benchmark_shape',
          source_group_id: text(group.group_id),
          expected_group_type: text(group.group_type),
          operators: ['nested_unit_total_shape'],
          pressures: ['unit_total_refinement_pressure'],
          tokens: phraseTokens(group.description || group.group_id),
          review_status: 'fixed_benchmark_shape_anchor',
          belief_movement: 'none'
        });
      }
    });
    return anchors.filter(a => a.normalized_phrase || a.source === 'invariance_benchmark_shape');
  }

  function groupByPressure(anchors) {
    const map = {};
    asArray(anchors).forEach(anchor => {
      asArray(anchor.pressures).forEach(pressure => {
        const key = text(pressure);
        if (!key) return;
        if (!map[key]) map[key] = { pressure: key, anchors: [], languages: new Set(), operators: new Set(), phrases: new Set() };
        map[key].anchors.push(anchor);
        if (anchor.language) map[key].languages.add(anchor.language);
        asArray(anchor.operators).forEach(op => map[key].operators.add(op));
        if (anchor.phrase) map[key].phrases.add(anchor.phrase);
      });
    });
    return Object.values(map).map(row => ({
      pressure: row.pressure,
      anchor_count: row.anchors.length,
      language_count: row.languages.size,
      languages: Array.from(row.languages).sort(),
      operators: Array.from(row.operators).sort(),
      sample_phrases: Array.from(row.phrases).slice(0, 8),
      growth_status: row.anchors.length >= 2 ? 'repeated_language_anchor_candidate' : 'single_anchor_candidate',
      belief_movement: 'none'
    })).sort((a, b) => b.anchor_count - a.anchor_count || a.pressure.localeCompare(b.pressure));
  }

  function groupByOperator(anchors) {
    const map = {};
    asArray(anchors).forEach(anchor => {
      asArray(anchor.operators).forEach(operator => {
        const key = text(operator);
        if (!key) return;
        if (!map[key]) map[key] = { operator: key, anchors: [], languages: new Set(), pressures: new Set(), phrases: new Set() };
        map[key].anchors.push(anchor);
        if (anchor.language) map[key].languages.add(anchor.language);
        asArray(anchor.pressures).forEach(p => map[key].pressures.add(p));
        if (anchor.phrase) map[key].phrases.add(anchor.phrase);
      });
    });
    return Object.values(map).map(row => ({
      operator: row.operator,
      anchor_count: row.anchors.length,
      language_count: row.languages.size,
      languages: Array.from(row.languages).sort(),
      pressures: Array.from(row.pressures).sort(),
      sample_phrases: Array.from(row.phrases).slice(0, 8),
      growth_status: row.anchors.length >= 2 ? 'repeated_operator_anchor_candidate' : 'single_operator_anchor_candidate',
      belief_movement: 'none'
    })).sort((a, b) => b.anchor_count - a.anchor_count || a.operator.localeCompare(b.operator));
  }

  function tokenIndex(anchors) {
    const map = {};
    asArray(anchors).forEach(anchor => {
      asArray(anchor.tokens).forEach(token => {
        if (!map[token]) map[token] = { token, anchors: [], pressures: new Set(), operators: new Set(), languages: new Set() };
        map[token].anchors.push(anchor.anchor_id);
        asArray(anchor.pressures).forEach(p => map[token].pressures.add(p));
        asArray(anchor.operators).forEach(op => map[token].operators.add(op));
        if (anchor.language) map[token].languages.add(anchor.language);
      });
    });
    return Object.values(map).map(row => ({
      token: row.token,
      anchor_count: row.anchors.length,
      pressures: Array.from(row.pressures).sort(),
      operators: Array.from(row.operators).sort(),
      languages: Array.from(row.languages).sort(),
      ambiguity_count: row.pressures.size + row.operators.size,
      review_status: row.pressures.size + row.operators.size > 3 ? 'ambiguous_token_review_needed' : 'token_anchor_candidate',
      belief_movement: 'none'
    })).sort((a, b) => b.anchor_count - a.anchor_count || b.ambiguity_count - a.ambiguity_count || a.token.localeCompare(b.token));
  }

  function growthCandidateEntries(pressureGroups, operatorGroups, options = {}) {
    const max = Math.max(1, Number(options.max_entries || 16));
    const pressureRows = asArray(pressureGroups).filter(g => g.anchor_count >= 2).slice(0, Math.ceil(max / 2));
    const operatorRows = asArray(operatorGroups).filter(g => g.anchor_count >= 2).slice(0, Math.floor(max / 2));
    const pressureEntries = pressureRows.map((g, i) => ({
      id: `language_growth_pressure_anchor_${String(i + 1).padStart(3, '0')}`,
      text: `Repeated language anchors map to pressure ${g.pressure}.`,
      language: 'en',
      operator_group: 'language_knowledge_growth_candidate',
      surface_terms: g.sample_phrases,
      literal_meaning: `Multiple phrases or symbols have been observed around ${g.pressure}.`,
      candidate_intended_meaning: 'Use repeated language anchors as training pressure for recognition, not as truth or belief movement.',
      semantic_operators: [{ operator: `language_anchor_pressure(${g.pressure})`, pressure: [g.pressure], legitimacy_condition: 'Anchor is usable only as a recognition candidate after review.' }],
      evidence_burden: ['Check anchor phrases.', 'Check language coverage.', 'Check ambiguity.', 'Do not infer truth from anchor repetition.'],
      expected_kernel_response: { lexical_action: 'increase recognition coverage for this pressure', source_trust_action: 'training pressure only', belief_movement: 'none_from_language_anchor_alone' },
      review_status: 'growth_seed_candidate',
      workbench_metadata: { generated_by: PACKET_TYPE, anchor_count: g.anchor_count, languages: g.languages, requires_human_review: true }
    }));
    const operatorEntries = operatorRows.map((g, i) => ({
      id: `language_growth_operator_anchor_${String(i + 1).padStart(3, '0')}`,
      text: `Repeated language anchors map to operator ${g.operator}.`,
      language: 'en',
      operator_group: 'language_knowledge_growth_candidate',
      surface_terms: g.sample_phrases,
      literal_meaning: `Multiple phrases or symbols have been observed around ${g.operator}.`,
      candidate_intended_meaning: 'Use repeated language anchors as training pressure for operator recognition, not as truth or belief movement.',
      semantic_operators: [{ operator: `language_anchor_operator(${g.operator})`, pressure: asArray(g.pressures).slice(0, 4), legitimacy_condition: 'Anchor is usable only as an operator recognition candidate after review.' }],
      evidence_burden: ['Check anchor phrases.', 'Check pressure links.', 'Check ambiguity.', 'Do not infer truth from operator repetition.'],
      expected_kernel_response: { lexical_action: 'increase recognition coverage for this operator', source_trust_action: 'training pressure only', belief_movement: 'none_from_language_anchor_alone' },
      review_status: 'growth_seed_candidate',
      workbench_metadata: { generated_by: PACKET_TYPE, anchor_count: g.anchor_count, languages: g.languages, requires_human_review: true }
    }));
    return pressureEntries.concat(operatorEntries);
  }

  function buildGrowthReport(combined, casePacket, options = {}) {
    const corpusAnchors = anchorsFromCorpus(combined);
    const benchmarkAnchors = anchorsFromBenchmarkCases(casePacket);
    const anchors = uniqueObjects(corpusAnchors.concat(benchmarkAnchors), a => `${a.source}|${a.normalized_phrase}|${asArray(a.pressures).join(',')}|${asArray(a.operators).join(',')}|${a.language}`);
    const pressure_groups = groupByPressure(anchors);
    const operator_groups = groupByOperator(anchors);
    const token_index = tokenIndex(anchors);
    const candidate_entries = growthCandidateEntries(pressure_groups, operator_groups, options);
    const report = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: anchors.length > 0 && pressure_groups.length > 0,
      corpus_entry_count: combined && combined.entry_count || 0,
      benchmark_group_count: asArray(casePacket && casePacket.groups).length,
      anchor_count: anchors.length,
      corpus_anchor_count: corpusAnchors.length,
      benchmark_anchor_count: benchmarkAnchors.length,
      pressure_group_count: pressure_groups.length,
      operator_group_count: operator_groups.length,
      token_count: token_index.length,
      repeated_pressure_group_count: pressure_groups.filter(g => g.anchor_count >= 2).length,
      repeated_operator_group_count: operator_groups.filter(g => g.anchor_count >= 2).length,
      candidate_entry_count: candidate_entries.length,
      growth_status: 'candidate_language_knowledge_growth_ready_for_review',
      anchors,
      pressure_groups,
      operator_groups,
      token_index,
      candidate_entries,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    return report;
  }

  async function loadAndGrow(options = {}) {
    const corpusPacket = await combiner().loadAndCombine(options);
    const cases = await fetchJson(text(options.case_url || DEFAULT_CASE_URL));
    const report = buildGrowthReport(corpusPacket.combined, cases, options);
    report.combiner_summary = {
      entry_count: corpusPacket.combined.entry_count,
      source_packet_count: asArray(corpusPacket.combined.source_packets).length,
      duplicate_count: asArray(corpusPacket.combined.duplicate_entries).length,
      belief_movement: 'none'
    };
    return report;
  }

  global.KernelObjectiveLanguageKnowledgeGrowthV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    DEFAULT_CASE_URL,
    doctrine,
    normalizePhrase,
    phraseTokens,
    anchorsFromCorpus,
    anchorsFromBenchmarkCases,
    groupByPressure,
    groupByOperator,
    tokenIndex,
    growthCandidateEntries,
    buildGrowthReport,
    loadAndGrow
  });
})(typeof window !== 'undefined' ? window : globalThis);
