/* 42ndMind Semantic Corpus → Invariants Bridge v0.1
 * Bridges reviewed semantic corpus entries into the existing semantic invariant learner.
 * It preserves operator legitimacy conditions and evidence burdens as review metadata.
 * It does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_corpus_to_invariants_bridge_v0_1';
  const DECISIONS = Object.freeze({
    READY: 'READY_FOR_INVARIANT_LEARNER',
    HOLD_NO_CORPUS: 'HOLD_NO_CORPUS',
    HOLD_VALIDATION_ERRORS: 'HOLD_VALIDATION_ERRORS',
    HOLD_REVIEW_REQUIRED: 'HOLD_REVIEW_REQUIRED',
    RECORDED: 'RECORDED_INVARIANT_PRESSURE',
    BRIDGE_UNAVAILABLE: 'BRIDGE_UNAVAILABLE'
  });

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function entriesOf(corpusOrEntries) { return Array.isArray(corpusOrEntries) ? corpusOrEntries : (corpusOrEntries && Array.isArray(corpusOrEntries.entries) ? corpusOrEntries.entries : []); }
  function operatorName(operator) { return text(operator).split('(')[0].trim() || text(operator); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item), key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  function doctrine() {
    return {
      bridge_preserves_legitimacy_conditions: true,
      bridge_preserves_evidence_burden: true,
      corpus_entries_are_training_pressure_not_truth: true,
      semantic_invariants_remain_candidates_not_doctrine: true,
      source_status_is_metadata_not_truth: true,
      bridge_does_not_move_belief: true,
      bridge_does_not_promote_doctrine: true,
      bridge_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function validateCorpus(corpusOrEntries, options = {}) {
    if (!global.KernelSemanticCorpusV01 || typeof global.KernelSemanticCorpusV01.validateCorpus !== 'function') {
      return { ok:false, decision:DECISIONS.BRIDGE_UNAVAILABLE, errors:['KernelSemanticCorpusV01 missing'], warnings:[], belief_movement:'none', doctrine:doctrine() };
    }
    const corpus = Array.isArray(corpusOrEntries)
      ? { packet_type:global.KernelSemanticCorpusV01.PACKET_TYPE, entries:corpusOrEntries }
      : corpusOrEntries;
    return global.KernelSemanticCorpusV01.validateCorpus(corpus, options);
  }

  function reviewStatusOk(entry, options = {}) {
    if (options.require_reviewed === true) return text(entry.review_status) === 'reviewed_seed' || text(entry.review_status) === 'promoted_candidate';
    if (options.allow_seed_candidate === false) return text(entry.review_status) !== 'seed_candidate';
    return ['seed_candidate','reviewed_seed','promoted_candidate'].includes(text(entry.review_status));
  }

  function readiness(corpusOrEntries, options = {}) {
    const entries = entriesOf(corpusOrEntries);
    if (!entries.length) return { ok:false, decision:DECISIONS.HOLD_NO_CORPUS, errors:['no corpus entries supplied'], warnings:[], entry_count:0, belief_movement:'none', doctrine:doctrine() };
    const validation = validateCorpus(corpusOrEntries, options);
    if (!validation.ok) return { ok:false, decision:DECISIONS.HOLD_VALIDATION_ERRORS, errors:validation.errors, warnings:validation.warnings || [], validation, entry_count:entries.length, belief_movement:'none', doctrine:doctrine() };
    const unreviewed = entries.filter(e => !reviewStatusOk(e, options)).map(e => text(e.id));
    if (unreviewed.length) return { ok:false, decision:DECISIONS.HOLD_REVIEW_REQUIRED, errors:[`review required for ${unreviewed.length} entries`], warnings:unreviewed, validation, entry_count:entries.length, belief_movement:'none', doctrine:doctrine() };
    return { ok:true, decision:DECISIONS.READY, errors:[], warnings:validation.warnings || [], validation, entry_count:entries.length, belief_movement:'none', doctrine:doctrine() };
  }

  function operatorRows(corpusOrEntries) {
    const rows = [];
    entriesOf(corpusOrEntries).forEach(entry => {
      asArray(entry.semantic_operators).forEach(op => {
        asArray(op.pressure).forEach(pressure => rows.push({
          corpus_entry_id: text(entry.id),
          text: text(entry.text),
          language: text(entry.language || 'en'),
          operator_group: text(entry.operator_group || entry.contrast_group || 'ungrouped'),
          contrast_group: text(entry.contrast_group || entry.operator_group || 'ungrouped'),
          operator: text(op.operator),
          operator_name: operatorName(op.operator),
          pressure: text(pressure),
          legitimacy_condition: text(op.legitimacy_condition),
          evidence_burden: clone(asArray(entry.evidence_burden)),
          expected_kernel_response: clone(entry.expected_kernel_response || {}),
          review_status: text(entry.review_status || 'unknown')
        }));
      });
    });
    return rows;
  }

  function metadataIndex(corpusOrEntries) {
    const index = {};
    operatorRows(corpusOrEntries).forEach(row => {
      const key = `${lower(row.operator_name)}::${row.pressure}`;
      const slot = index[key] || (index[key] = {
        term_key: lower(row.operator_name),
        term: row.operator_name,
        pressure: row.pressure,
        corpus_entry_ids: [],
        operators: [],
        operator_groups: [],
        contrast_groups: [],
        legitimacy_conditions: [],
        evidence_burdens: [],
        expected_kernel_actions: [],
        examples: [],
        review_statuses: []
      });
      slot.corpus_entry_ids.push(row.corpus_entry_id);
      slot.operators.push(row.operator);
      slot.operator_groups.push(row.operator_group);
      slot.contrast_groups.push(row.contrast_group);
      slot.legitimacy_conditions.push(row.legitimacy_condition);
      row.evidence_burden.forEach(item => slot.evidence_burdens.push(item));
      slot.review_statuses.push(row.review_status);
      const expected = row.expected_kernel_response || {};
      ['lexical_action','source_trust_action','belief_movement'].forEach(field => { if (text(expected[field])) slot.expected_kernel_actions.push(`${field}: ${expected[field]}`); });
      asArray(expected.questions).forEach(q => slot.expected_kernel_actions.push(`question: ${q}`));
      slot.examples.push({ corpus_entry_id: row.corpus_entry_id, text: row.text, operator: row.operator, legitimacy_condition: row.legitimacy_condition });
    });
    Object.keys(index).forEach(key => {
      const slot = index[key];
      ['corpus_entry_ids','operators','operator_groups','contrast_groups','legitimacy_conditions','evidence_burdens','expected_kernel_actions','review_statuses'].forEach(field => { slot[field] = unique(slot[field]); });
      slot.examples = slot.examples.slice(0, 8);
    });
    return index;
  }

  function toObservationBatch(corpusOrEntries, options = {}) {
    if (global.KernelSemanticCorpusV01 && typeof global.KernelSemanticCorpusV01.toSemanticObservationBatch === 'function') {
      const batch = global.KernelSemanticCorpusV01.toSemanticObservationBatch(corpusOrEntries, options);
      batch.bridge_packet_type = PACKET_TYPE;
      batch.bridge_version = VERSION;
      batch.metadata_index = metadataIndex(corpusOrEntries);
      batch.doctrine = doctrine();
      return batch;
    }
    const observations = operatorRows(corpusOrEntries).map(row => ({
      id: `semantic_bridge_obs_${row.corpus_entry_id}_${row.operator_name}_${row.pressure}`.replace(/[^a-z0-9_:-]+/gi, '_').slice(0, 180),
      term: row.operator_name,
      term_key: lower(row.operator_name),
      pressure: row.pressure,
      signal_source: 'semantic_corpus_to_invariants_bridge',
      context: `semantic_corpus_bridge:${row.corpus_entry_id}`,
      outcome: text(options.outcome || 'seed_labeled_pressure'),
      confirmed: options.confirmed !== false,
      contradicted: options.contradicted === true,
      raw_excerpt: row.text.slice(0, 240),
      corpus_entry_id: row.corpus_entry_id,
      operator: row.operator,
      legitimacy_condition: row.legitimacy_condition,
      evidence_burden: row.evidence_burden
    }));
    return { packet_type:'42ndMind_semantic_observation_batch_v0_4', packet_version:'0.4.0', created_at:now(), source_packet_type:'42ndMind_semantic_seed_corpus_v0_1', bridge_packet_type:PACKET_TYPE, bridge_version:VERSION, source_entry_count:entriesOf(corpusOrEntries).length, term_observations:observations, count:observations.length, metadata_index:metadataIndex(corpusOrEntries), belief_movement:'none', doctrine:doctrine() };
  }

  function enrichInvariant(invariant, index) {
    const inv = clone(invariant || {});
    const key = `${lower(inv.term_key || inv.term)}::${text(inv.pressure)}`;
    const meta = index[key] || null;
    inv.corpus_bridge = meta ? {
      preserved: true,
      corpus_entry_ids: meta.corpus_entry_ids,
      operators: meta.operators,
      operator_groups: meta.operator_groups,
      contrast_groups: meta.contrast_groups,
      legitimacy_conditions: meta.legitimacy_conditions,
      evidence_burdens: meta.evidence_burdens,
      expected_kernel_actions: meta.expected_kernel_actions,
      examples: meta.examples,
      review_statuses: meta.review_statuses,
      warning: 'These fields preserve review metadata. They do not make the invariant doctrine or truth.'
    } : {
      preserved: false,
      warning: 'No corpus metadata matched this invariant.'
    };
    inv.doctrine = Object.assign({}, inv.doctrine || {}, {
      invariant_is_candidate_not_doctrine: true,
      corpus_metadata_is_review_pressure_not_truth: true,
      legitimacy_condition_required_before_pressure_is_treated_as_earned: true
    });
    inv.active_belief_effect = 'none';
    return inv;
  }

  function enrichInvariants(invariants, corpusOrEntries) {
    const index = metadataIndex(corpusOrEntries);
    return asArray(invariants).map(inv => enrichInvariant(inv, index));
  }

  function buildPacket(corpusOrEntries, options = {}) {
    const ready = readiness(corpusOrEntries, options);
    const batch = ready.ok ? toObservationBatch(corpusOrEntries, options) : null;
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      decision: ready.decision,
      ok: ready.ok,
      readiness: ready,
      source_entry_count: entriesOf(corpusOrEntries).length,
      operator_row_count: operatorRows(corpusOrEntries).length,
      metadata_index: ready.ok ? metadataIndex(corpusOrEntries) : {},
      semantic_observation_batch: batch,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function recordIntoLearner(corpusOrEntries, options = {}) {
    const packet = buildPacket(corpusOrEntries, options);
    if (!packet.ok) return Object.assign({}, packet, { decision: packet.decision, learner_result: null, enriched_invariants: [] });
    if (!global.KernelSemanticInvariantLearnerV04 || typeof global.KernelSemanticInvariantLearnerV04.record !== 'function') {
      return Object.assign({}, packet, { ok:false, decision:DECISIONS.BRIDGE_UNAVAILABLE, learner_result: null, enriched_invariants: [], errors:['KernelSemanticInvariantLearnerV04 missing'] });
    }
    const learnerOptions = Object.assign({}, options.learner_options || {}, {
      key: options.key || options.learner_key || (options.learner_options && options.learner_options.key) || undefined,
      min_observations: options.min_observations || options.minObs || (options.learner_options && options.learner_options.min_observations) || 2
    });
    const result = global.KernelSemanticInvariantLearnerV04.record(packet.semantic_observation_batch, learnerOptions);
    const invariants = result && result.ledger ? result.ledger.invariants : [];
    const enriched = enrichInvariants(invariants, corpusOrEntries);
    return Object.assign({}, packet, {
      decision: DECISIONS.RECORDED,
      learner_result: result,
      enriched_invariants: enriched,
      enriched_stable_invariants: enriched.filter(inv => inv.decision === 'INVARIANT_STABLE'),
      belief_movement: 'none',
      doctrine: doctrine()
    });
  }

  function proposalPacketFromResult(bridgeResult) {
    const stable = asArray(bridgeResult && bridgeResult.enriched_stable_invariants);
    return {
      packet_type: '42ndMind_semantic_corpus_invariant_proposals_v0_1',
      packet_version: VERSION,
      created_at: now(),
      count: stable.length,
      proposals: stable.map(inv => ({
        id: `corpus_proposal_${inv.id || inv.term_key + '_' + inv.pressure}`.replace(/[^a-z0-9_:-]+/gi, '_').slice(0, 180),
        target_layer: 'semantic_invariant_adapter',
        title: `Recognize corpus-backed semantic operator: ${inv.term}`,
        proposed_change: `Use corpus-backed candidate invariant as pressure only: ${inv.invariant_statement || inv.term + ' -> ' + inv.pressure}`,
        rationale: 'Corpus entries repeatedly map this semantic operator to pressure and preserve legitimacy conditions/evidence burden.',
        tests_required: ['kernel-semantic-corpus-v0-1-test.html','kernel-semantic-corpus-to-invariants-v0-1-test.html','kernel-semantic-invariant-learner-v0-4-test.html'],
        invariant: inv,
        corpus_bridge: inv.corpus_bridge,
        promotion_state: { implemented:false, enabled:false }
      })),
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  global.KernelSemanticCorpusToInvariantsV01 = Object.freeze({
    VERSION, PACKET_TYPE, DECISIONS,
    doctrine, validateCorpus, readiness, operatorRows, metadataIndex,
    toObservationBatch, enrichInvariant, enrichInvariants, buildPacket,
    recordIntoLearner, proposalPacketFromResult
  });
})(typeof window !== 'undefined' ? window : globalThis);
