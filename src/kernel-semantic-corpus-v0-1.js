/* 42ndMind Semantic Corpus v0.1
 * Validates seed entries for semantic operations, epistemic effects, and legitimacy conditions.
 * Corpus entries are training pressure, not truth. This module does not move belief,
 * import commands, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const DEFAULT_SEED_URL = 'data/semantic_seed_corpus_v0_1.json';
  const PACKET_TYPE = '42ndMind_semantic_seed_corpus_v0_1';
  const OBSERVATION_BATCH_TYPE = '42ndMind_semantic_observation_batch_v0_4';

  const REQUIRED_ENTRY_FIELDS = Object.freeze([
    'id','text','language','surface_terms','literal_meaning','candidate_intended_meaning',
    'semantic_operators','evidence_burden','expected_kernel_response','contrast_group','review_status'
  ]);

  const ALLOWED_PRESSURES = Object.freeze([
    'closure_pressure','dismissal_pressure','authority_transfer_pressure','trust_inflation_pressure',
    'source_trust_pressure','ambiguity_pressure','motive_agency_pressure','direct_link_evidence_burden',
    'evidence_contact_pressure','technical_definition_pressure','confidence_inflation_pressure',
    'uncertainty_calibration_pressure','moral_risk_framing_pressure','stigma_pressure','social_proof_pressure',
    'support_inflation_pressure','effectiveness_claim_pressure','certification_pressure',
    'retrieval_not_verification_pressure','low_trust_prior_pressure','provenance_uncertainty_pressure',
    'expert_commentary_pressure','official_record_pressure','direct_support_pressure','factual_update_pressure',
    'contradiction_pressure','negative_evidence_pressure','interpretation_layer_pressure','sequence_claim_pressure',
    'integrity_claim_pressure','self_limiting_claim_pressure','context_pressure','pattern_similarity_pressure',
    'scope_pressure','action_justification_pressure','necessity_claim_pressure','language_evidence_pressure'
  ]);

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function idSafe(value) { return lower(value).replace(/[^a-z0-9_:-]+/g, '_').replace(/^_+|_+$/g, ''); }
  function operatorName(operator) { return text(operator).split('(')[0].trim() || text(operator); }
  function packetEntries(input) { return Array.isArray(input) ? input : (input && Array.isArray(input.entries) ? input.entries : []); }

  function doctrine() {
    return {
      corpus_entries_are_training_pressure_not_truth: true,
      semantic_operators_are_candidate_language_math_units: true,
      legitimacy_conditions_define_when_pressure_is_earned: true,
      source_status_is_metadata_not_truth: true,
      corpus_does_not_move_belief: true,
      corpus_does_not_promote_doctrine: true,
      corpus_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function validateOperator(operator, path) {
    const errors = [], warnings = [], op = operator || {};
    if (!text(op.operator)) errors.push(`${path}.operator missing`);
    const pressures = asArray(op.pressure);
    if (!pressures.length) errors.push(`${path}.pressure missing`);
    pressures.forEach(p => { if (!ALLOWED_PRESSURES.includes(text(p))) warnings.push(`${path}.pressure ${p} is not in allowed pressure list`); });
    if (!text(op.legitimacy_condition)) errors.push(`${path}.legitimacy_condition missing`);
    return { errors, warnings };
  }

  function validateExpectedResponse(response, path) {
    const errors = [], warnings = [], r = response || {};
    if (!text(r.lexical_action)) errors.push(`${path}.lexical_action missing`);
    if (!text(r.source_trust_action)) errors.push(`${path}.source_trust_action missing`);
    if (!text(r.belief_movement)) errors.push(`${path}.belief_movement missing`);
    if (text(r.belief_movement) && !/none|no_final|candidate|hold|bounded/i.test(text(r.belief_movement))) {
      warnings.push(`${path}.belief_movement should preserve non-final movement language`);
    }
    if (!Array.isArray(r.questions) || !r.questions.length) errors.push(`${path}.questions missing`);
    return { errors, warnings };
  }

  function validateEntry(entry, options = {}) {
    const errors = [], warnings = [], e = entry || {};
    REQUIRED_ENTRY_FIELDS.forEach(field => {
      if (e[field] === undefined || e[field] === null || (typeof e[field] === 'string' && !text(e[field]))) errors.push(`${field} missing`);
    });
    if (text(e.id) && !/^[a-z0-9][a-z0-9_-]*$/i.test(text(e.id))) errors.push('id must be stable ascii slug');
    if (!Array.isArray(e.surface_terms) || !e.surface_terms.length) errors.push('surface_terms must be a non-empty array');
    if (!Array.isArray(e.semantic_operators) || !e.semantic_operators.length) errors.push('semantic_operators must be a non-empty array');
    if (!Array.isArray(e.evidence_burden) || !e.evidence_burden.length) errors.push('evidence_burden must be a non-empty array');
    asArray(e.semantic_operators).forEach((operator, index) => {
      const checked = validateOperator(operator, `semantic_operators[${index}]`);
      errors.push.apply(errors, checked.errors); warnings.push.apply(warnings, checked.warnings);
    });
    const response = validateExpectedResponse(e.expected_kernel_response, 'expected_kernel_response');
    errors.push.apply(errors, response.errors); warnings.push.apply(warnings, response.warnings);
    if (text(e.review_status) && !['seed_candidate','reviewed_seed','rejected_seed','promoted_candidate'].includes(text(e.review_status))) warnings.push('review_status is not a known status');
    if (options.strict === true && warnings.length) errors.push.apply(errors, warnings.map(w => `strict:${w}`));
    return { ok: errors.length === 0, id: text(e.id), errors, warnings, entry: e, belief_movement: 'none', doctrine: doctrine() };
  }

  function summarize(corpus) {
    const entries = packetEntries(corpus), groups = {}, pressures = {}, operators = {}, review_statuses = {};
    entries.forEach(entry => {
      const group = text(entry.operator_group || entry.contrast_group || 'ungrouped');
      groups[group] = (groups[group] || 0) + 1;
      const status = text(entry.review_status || 'unknown');
      review_statuses[status] = (review_statuses[status] || 0) + 1;
      asArray(entry.semantic_operators).forEach(op => {
        const name = operatorName(op.operator);
        if (name) operators[name] = (operators[name] || 0) + 1;
        asArray(op.pressure).forEach(p => { const key = text(p); if (key) pressures[key] = (pressures[key] || 0) + 1; });
      });
    });
    return { packet_type: '42ndMind_semantic_corpus_summary_v0_1', packet_version: VERSION, created_at: now(), entry_count: entries.length, group_count: Object.keys(groups).length, groups, operator_count: Object.keys(operators).length, operators, pressure_count: Object.keys(pressures).length, pressures, review_statuses, belief_movement: 'none', doctrine: doctrine() };
  }

  function validateCorpus(corpus, options = {}) {
    const errors = [], warnings = [], c = corpus || {}, entries = packetEntries(c), seen = new Set();
    if (text(c.packet_type) && text(c.packet_type) !== PACKET_TYPE) warnings.push(`unexpected packet_type ${c.packet_type}`);
    if (!entries.length) errors.push('entries missing or empty');
    const entry_reports = entries.map((entry, index) => {
      const report = validateEntry(entry, options);
      if (report.id) { if (seen.has(report.id)) report.errors.push(`duplicate id ${report.id}`); seen.add(report.id); }
      report.index = index;
      if (report.errors.length) errors.push(`entry ${index} invalid`);
      warnings.push.apply(warnings, report.warnings.map(w => `${report.id || index}: ${w}`));
      report.ok = report.errors.length === 0;
      return report;
    });
    return { packet_type: '42ndMind_semantic_corpus_validation_report_v0_1', packet_version: VERSION, created_at: now(), ok: errors.length === 0, errors, warnings, entry_count: entries.length, valid_entry_count: entry_reports.filter(r => r.ok).length, invalid_entry_count: entry_reports.filter(r => !r.ok).length, summary: summarize(c), entry_reports, belief_movement: 'none', doctrine: doctrine() };
  }

  function entriesByGroup(corpus, group) {
    const g = lower(group);
    return packetEntries(corpus).filter(entry => lower(entry.operator_group || entry.contrast_group) === g);
  }

  function entryToObservations(entry, options = {}) {
    const confirmed = options.confirmed !== false, contradicted = options.contradicted === true;
    const outcome = text(options.outcome || 'seed_labeled_pressure');
    const contextPrefix = text(options.context_prefix || 'semantic_seed_corpus');
    const observations = [];
    asArray(entry.semantic_operators).forEach(op => {
      const term = operatorName(op.operator);
      asArray(op.pressure).forEach(pressure => observations.push({
        id: `semantic_corpus_obs_${idSafe(entry.id)}_${idSafe(term)}_${idSafe(pressure)}`.slice(0, 180),
        term,
        term_key: lower(term),
        pressure: text(pressure),
        signal_source: 'semantic_seed_corpus',
        context: `${contextPrefix}:${text(entry.id)}`,
        outcome,
        confirmed,
        contradicted,
        raw_excerpt: text(entry.text).slice(0, 240),
        corpus_entry_id: text(entry.id),
        operator: text(op.operator),
        legitimacy_condition: text(op.legitimacy_condition),
        evidence_burden: clone(asArray(entry.evidence_burden))
      }));
    });
    return observations;
  }

  function toSemanticObservationBatch(corpusOrEntries, options = {}) {
    const entries = packetEntries(corpusOrEntries), term_observations = [];
    entries.forEach(entry => { term_observations.push.apply(term_observations, entryToObservations(entry, options)); });
    return { packet_type: OBSERVATION_BATCH_TYPE, packet_version: '0.4.0', created_at: now(), source_packet_type: PACKET_TYPE, source_entry_count: entries.length, raw_text: entries.map(e => text(e.text)).join('\n').slice(0, 12000), term_observations, count: term_observations.length, belief_movement: 'none', doctrine: doctrine() };
  }

  async function loadSeed(url = DEFAULT_SEED_URL) {
    if (typeof fetch !== 'function') throw new Error('fetch_unavailable');
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(VERSION)}`);
    if (!response.ok) throw new Error(`seed_fetch_failed_${response.status}`);
    return response.json();
  }

  function sampleEntry(kind) {
    if (kind === 'authority') return {
      id: 'sample_authority_certified', text: 'The certified source proved the claim false.', language: 'en', operator_group: 'authority_transfer', surface_terms: ['certified','proved','false'], literal_meaning: 'A certified source is said to prove the claim false.', candidate_intended_meaning: 'The source status is being used to close the dispute.',
      semantic_operators: [ { operator:'certified(source)', pressure:['authority_transfer_pressure','trust_inflation_pressure'], legitimacy_condition:'Certification remains metadata unless backed by primary evidence.' }, { operator:'proved(claim)', pressure:['closure_pressure','support_inflation_pressure'], legitimacy_condition:'Proof requires direct evidence that entails the claim status.' } ],
      evidence_burden: ['Identify the exact claim.', 'Inspect the evidence chain.'], expected_kernel_response: { lexical_action:'clarify implication-heavy terms', source_trust_action:'treat certification as metadata', belief_movement:'none_without_evidence_chain', questions:['What evidence proves it?', 'What does certification cover?'] }, contrast_group: 'authority_transfer', review_status: 'seed_candidate'
    };
    return {
      id: 'sample_closure_debunked', text: 'The certified fact-checker debunked the claim.', language: 'en', operator_group: 'closure_dismissal', surface_terms: ['certified','fact-checker','debunked'], literal_meaning: 'A certified fact-checking source says the claim is false.', candidate_intended_meaning: 'The dispute is being presented as resolved.',
      semantic_operators: [ { operator:'certified(source)', pressure:['authority_transfer_pressure','trust_inflation_pressure'], legitimacy_condition:'Certification must remain metadata unless supported by primary evidence.' }, { operator:'debunked(claim)', pressure:['closure_pressure','dismissal_pressure'], legitimacy_condition:'Closure is only legitimate if the evidence chain directly contradicts the claim.' } ],
      evidence_burden: ['Identify the exact claim being refuted.', 'Inspect the evidence used by the fact-checker.', 'Check whether primary evidence exists.'], expected_kernel_response: { lexical_action:'clarify implication-heavy terms', source_trust_action:'treat certification as metadata, not truth', belief_movement:'none_without_evidence_chain', questions:['What primary evidence supports the debunking?', 'Which exact claim was allegedly refuted?'] }, contrast_group: 'closure_pressure_debunked', review_status: 'seed_candidate'
    };
  }

  global.KernelSemanticCorpusV01 = Object.freeze({ VERSION, DEFAULT_SEED_URL, PACKET_TYPE, OBSERVATION_BATCH_TYPE, REQUIRED_ENTRY_FIELDS, ALLOWED_PRESSURES, doctrine, validateOperator, validateEntry, validateCorpus, summarize, entriesByGroup, entryToObservations, toSemanticObservationBatch, loadSeed, sampleEntry });
})(typeof window !== 'undefined' ? window : globalThis);
