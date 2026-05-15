/* 42ndMind Semantic Pressure Registry v0.1
 * Defines pressure labels as first-class semantic ontology entries.
 *
 * This layer sits after semantic operator matching:
 * surface phrase -> semantic operator -> pressure labels -> pressure ontology
 * -> evidence burden -> blocked/allowed belief movement.
 *
 * It does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_pressure_registry_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function entriesOf(corpus) { return corpus && Array.isArray(corpus.entries) ? corpus.entries : []; }
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

  function doctrine() {
    return {
      pressure_registry_defines_labels_not_truth: true,
      pressure_labels_are_not_belief_movement: true,
      pressure_effects_are_bounded_by_legitimacy_conditions: true,
      blocked_movement_is_review_guidance_not_final_truth: true,
      pressure_registry_does_not_promote_doctrine: true,
      pressure_registry_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function entry(pressure, family, definition, effect, blocks, requires, allows, contrasts, severity) {
    return {
      pressure,
      family,
      definition,
      effect,
      blocks: unique(blocks),
      requires: unique(requires),
      allows: unique(allows),
      contrasts: unique(contrasts),
      severity: severity || 'medium',
      belief_movement: 'none_by_itself'
    };
  }

  const REGISTRY_ROWS = Object.freeze([
    entry('closure_pressure','closure','Language pushes a dispute toward finality, resolution, or shutdown.','Require exact claim, scope, and evidence chain before closure is allowed.',['automatic_support','automatic_falsity','premature_resolution'],['exact_claim','evidence_chain','scope_check'],['bounded_closure_after_direct_evidence'],['challenge_pressure','uncertainty_calibration_pressure','unverified_pressure'],'high'),
    entry('dismissal_pressure','closure','Language reduces a claim or claimant as unworthy of direct evaluation.','Separate stigma or dismissal from claim-level evidence.',['claim_rejection_by_label','speaker_status_rejection'],['claim_extraction','evidence_review'],['dismissal_as_rhetorical_flag'],['evidence_contact_pressure','challenge_pressure'],'high'),
    entry('falsity_claim_pressure','closure','Language asserts that a claim is false.','Demand falsifying evidence or failed agreed condition.',['false_by_assertion','false_by_status'],['exact_claim','falsifying_evidence','definition_scope_date_check'],['falsity_after_direct_contradiction'],['misleading_pressure','unverified_pressure','evidence_gap_pressure'],'high'),
    entry('challenge_pressure','uncertainty','Language contests or questions a claim without necessarily refuting it.','Preserve contested status and prevent conversion into falsity.',['challenge_to_false_collapse','challenge_to_debunked_collapse'],['challenged_part','reason_for_challenge'],['uncertainty_or_review_pressure'],['closure_pressure','falsity_claim_pressure'],'medium'),
    entry('evidence_gap_pressure','uncertainty','Support is withheld because expected evidence is missing or not supplied.','Withhold support while separating missing support from contradiction.',['absence_as_falsity'],['expected_evidence_type','search_scope'],['support_withholding'],['contradiction_pressure','falsity_claim_pressure'],'medium'),
    entry('uncertainty_calibration_pressure','uncertainty','Language should preserve probability, allegation, incompleteness, or non-final status.','Block confidence inflation and keep unresolved state visible.',['certainty_inflation','closure_without_resolution'],['uncertainty_marker','confidence_level'],['bounded_uncertain_state'],['closure_pressure','support_inflation_pressure'],'medium'),
    entry('unverified_pressure','uncertainty','A claim has not been verified.','Withhold support while avoiding automatic falsity.',['unverified_to_false','unverified_to_debunked'],['verification_standard','search_location'],['unresolved_status'],['falsity_claim_pressure','contradiction_pressure'],'medium'),
    entry('not_falsified_pressure','uncertainty','A claim has not been disproven or falsified.','Preserve non-refutation without promoting support.',['not_disproven_to_true','absence_to_truth'],['falsification_condition','positive_support_check'],['not_falsified_status'],['proved(evidence,claim)','argument_from_ignorance'],'medium'),
    entry('self_limiting_claim_pressure','uncertainty','The sentence limits its own evidentiary strength.','Reduce overclaim risk and preserve hypothesis status.',['hypothesis_to_fact'],['additional_evidence_needed','remaining_alternatives'],['bounded_hypothesis'],['closure_pressure','support_inflation_pressure'],'low'),

    entry('authority_transfer_pressure','source_trust','Status, expertise, consensus, or institution is being transferred into claim support.','Treat status as prior or metadata, not evidence itself.',['authority_to_truth','credential_to_truth'],['domain_fit','reasoning','claim_level_evidence'],['bounded_prior_pressure'],['evidence_contact_pressure','source_trust_pressure'],'high'),
    entry('source_trust_pressure','source_trust','A source class, history, or provenance affects prior trust.','Use as triage pressure while preserving claim-level evidence burden.',['source_trust_to_truth'],['source_identity','track_record','incentives','evidence_content'],['bounded_source_prior'],['evidence_contact_pressure','low_trust_prior_pressure'],'medium'),
    entry('trust_inflation_pressure','source_trust','Language inflates trust beyond evidence or source history.','Prevent reliability/status words from settling the claim.',['trust_to_truth','neutrality_by_certification'],['source_history','claim_evidence'],['trust_flag_only'],['evidence_contact_pressure'],'high'),
    entry('certification_pressure','source_trust','A formal rating or certification is present.','Treat certification/rating as review metadata until reasoning is inspected.',['certification_to_truth'],['certifier','scope','criteria','evidence_chain'],['metadata_prior_pressure'],['primary_document(evidence)','raw_data(evidence)'],'medium'),
    entry('rating_pressure','source_trust','A source assigns a label or rating to a claim.','Inspect rating category, criteria, reasoning, and evidence.',['rating_to_truth'],['rating_source','rating_category','reasoning'],['rating_as_review_output'],['falsity_claim_pressure','evidence_contact_pressure'],'medium'),
    entry('reviewer_status_pressure','source_trust','Reviewer role or status is invoked.','Keep reviewer status separate from reviewed evidence.',['reviewer_to_truth'],['reviewer_role','review_scope','evidence'],['metadata_prior_pressure'],['primary_document(evidence)'],'medium'),
    entry('official_record_pressure','source_trust','A court filing, official record, or formal record affects provenance.','Improve provenance while preserving allegation/finding distinction.',['official_record_to_truth','filing_to_finding'],['record_type','attached_evidence','finding_status'],['official_record_metadata'],['alleges(claim)','found_by_court(claim)'],'medium'),
    entry('official_source_pressure','source_trust','Official source status is present.','Use official status as provenance, not interpretation truth.',[],['authority_scope','document_content'],['provenance_prior_pressure'],['primary_document(evidence)'],'medium'),
    entry('low_trust_prior_pressure','source_trust','A source class has low prior trust, such as anonymous or secondhand sourcing.','Lower source prior without automatically falsifying inspectable evidence.',['low_trust_to_false'],['authentication','corroboration'],['low_prior_plus_evidence_review'],['evidence_contact_pressure'],'medium'),
    entry('hearsay_pressure','source_trust','The source is secondhand or distant from primary evidence.','Require primary evidence or firsthand source before claim movement.',['hearsay_to_truth','hearsay_to_false'],['original_source','primary_record'],['source_distance_flag'],['primary_document(evidence)','transcript(evidence)'],'medium'),
    entry('provenance_pressure','source_trust','Posting/publication establishes where a statement came from.','Separate provenance of statement from truth of statement.',['posted_to_true'],['who_posted','supporting_record'],['provenance_metadata'],['evidence_contact_pressure'],'medium'),
    entry('provenance_uncertainty_pressure','source_trust','The chain of custody, leak origin, or authenticity is uncertain.','Require authentication before using content strongly.',['leak_to_truth','leak_to_false'],['authenticity','chain_of_custody'],['provisional_evidence_contact'],['document(evidence)','source_trust_pressure'],'medium'),

    entry('evidence_contact_pressure','evidence','The sentence points toward inspectable evidence.','Inspect the evidence object directly before support or contradiction movement.',['evidence_label_to_truth'],['evidence_identity','authenticity','scope_mapping'],['bounded_evidence_pressure'],['hearsay_pressure','summary(source)'],'medium'),
    entry('direct_support_pressure','evidence','A record or passage is claimed to directly support a claim.','Require exact mapping from record to claim.',['mention_to_support'],['exact_passage','claim_mapping','scope_match'],['bounded_support_after_mapping'],['interpretation_layer_pressure','different_scope(record,claim)'],'medium'),
    entry('contradiction_pressure','evidence','A record and claim are claimed to be mutually incompatible.','Preserve contradiction pressure and require same definitions, date, and scope.',['contradiction_resolution_by_deletion'],['record','claim','definition_scope_date_check'],['bounded_contradiction'],['qualifies(record,claim)','different_scope(record,claim)'],'high'),
    entry('negative_evidence_pressure','evidence','Absence or denial inside a relevant record may count against attribution.','Check completeness and expected-presence logic.',['absence_to_false_without_completeness'],['record_completeness','expected_presence'],['bounded_negative_evidence'],['unverified_pressure'],'medium'),
    entry('factual_update_pressure','evidence','A record claims a factual update such as deadline or status change.','Check authority, date, affected case, and scope.',['update_to_universal_claim'],['authority','date','affected_scope'],['bounded_factual_update'],['rumored_update(claim)'],'medium'),
    entry('interpretation_layer_pressure','evidence','A summary, chart, report, or interpretation sits between raw record and claim.','Check against underlying record before claim movement.',['summary_to_record','interpretation_to_fact'],['underlying_record','method','included_omitted_context'],['interpretation_layer_flag'],['raw_data(evidence)','primary_document(evidence)'],'medium'),
    entry('partial_evidence_pressure','evidence','A clip or partial excerpt is being used as evidence.','Ask for fuller record before strong support or contradiction.',['clip_to_full_record'],['full_record','surrounding_context'],['partial_evidence_flag'],['transcript(evidence)','summary(source)'],'medium'),
    entry('language_evidence_pressure','evidence','Actual wording or rhetoric is used as evidence.','Require quoted statements and criteria for labeling language.',['language_label_without_quote'],['quote','criteria','context'],['language_evidence_after_quote'],['stigma_pressure'],'medium'),
    entry('scope_mismatch_pressure','evidence_scope','Record and claim may differ in time, geography, population, definition, or aggregation level.','Explain apparent contradiction without erasing either side.',['scope_mismatch_to_false','scope_mismatch_to_contradiction'],['record_scope','claim_scope','scope_comparison'],['bounded_scope_resolution'],['contradiction_pressure','qualification_pressure'],'medium'),
    entry('qualification_pressure','evidence_scope','A record limits, conditions, or qualifies a claim.','Narrow the claim without treating qualification as falsity.',['qualification_to_contradiction'],['qualifying_record','limited_part'],['bounded_qualified_claim'],['contradiction_pressure','narrowing_pressure'],'medium'),
    entry('narrowing_pressure','evidence_scope','A broad claim is restricted to a smaller scope.','Convert broad claim pressure into bounded claim pressure.',['narrowing_to_falsity'],['broader_claim','narrowed_scope'],['bounded_narrowed_claim'],['qualification_pressure','different_scope(record,claim)'],'medium'),
    entry('scope_pressure','evidence_scope','A claim applies to a public, group, case, population, or affected scope.','Define affected population before generalizing.',['undefined_scope_generalization'],['scope_definition','affected_population'],['bounded_scope_claim'],['different_scope(record,claim)'],'medium'),

    entry('motive_agency_pressure','agency','Language attributes motive, intent, concealment, coordination, or agency.','Require actor, action, mechanism, and evidence link.',['outcome_to_intent','suspicion_to_motive'],['actor','action','mechanism','evidence_link'],['motive_hypothesis_after_evidence'],['observed_effect(event)','incentive(actor)'],'high'),
    entry('direct_link_evidence_burden','agency','The claim requires evidence linking actors, actions, control, agreement, or intent.','Raise burden above similarity or outcome alignment.',['similarity_to_coordination','outcome_to_intent'],['communication','agreement','shared_control','pattern_defeating_independence'],['agency_claim_after_link'],['independent_convergence(actor,event)'],'high'),
    entry('intent_attribution_pressure','agency','The sentence attributes hidden motive, deliberate action, or intent.','Do not infer intent from outcome, dislike, or benefit alone.',['benefit_to_intent','outcome_to_motive'],['actor','action','motive','direct_link_evidence'],['intent_hypothesis_after_link'],['incentive(actor)','policy_goal(actor)'],'high'),
    entry('pattern_similarity_pressure','agency','Similar wording or behavior appears across actors or events.','Treat similarity as candidate evidence, not proof of coordination.',['similarity_to_collusion'],['pattern','timing','common_source_check'],['pattern_flag'],['same_source(actor,event)','independent_convergence(actor,event)'],'medium'),
    entry('integrity_claim_pressure','agency','The sentence alleges falsification, manipulation, or integrity failure.','Require audit trail, mechanism, and responsible action.',['integrity_label_to_truth'],['records','alteration_mechanism','audit_trail'],['integrity_claim_after_evidence'],['error(event)','definition_change(event)'],'high'),

    entry('confidence_inflation_pressure','rhetoric','Words like clearly, obviously, nobody, or proof inflate confidence beyond evidence.','Strip modifier and evaluate underlying proposition.',['modifier_to_truth','certainty_without_evidence'],['underlying_claim','supporting_evidence'],['confidence_flag_only'],['uncertainty_calibration_pressure'],'medium'),
    entry('social_proof_pressure','rhetoric','A social quantity or group belief is used as evidence.','Require measured social evidence and prevent social mood from becoming truth.',['social_belief_to_truth'],['group','measurement','relevance'],['social_context_flag'],['evidence_contact_pressure'],'medium'),
    entry('stigma_pressure','rhetoric','A label stigmatizes the claimant, group, or belief.','Separate stigma from evidence analysis.',['stigma_to_false','speaker_attack_to_claim_rejection'],['actual_claim','label_criteria','evidence'],['stigma_flag_only'],['evidence_contact_pressure','challenge_pressure'],'high'),
    entry('moral_risk_framing_pressure','rhetoric','Harm, safety, danger, or public-risk language frames the claim morally.','Require concrete harm mechanism, affected party, and evidence.',['moral_label_to_truth','harm_label_to_suppression'],['harm_mechanism','affected_party','risk_evidence'],['moral_risk_flag'],['action_justification_pressure','evidence_contact_pressure'],'medium'),
    entry('action_justification_pressure','rhetoric','A claim is used to justify removal, suppression, sanction, or action.','Require separate policy/legal/moral justification beyond the label.',['harm_to_action_without_policy'],['action','authority','criteria','evidence'],['bounded_action_review'],['moral_risk_framing_pressure'],'high'),
    entry('misleading_pressure','rhetoric','Framing, omission, scope distortion, or presentation creates false impression without direct falsity.','Separate misleading effect from falsehood and intent.',['misleading_to_false','misleading_to_deception'],['presentation','omitted_context','false_impression'],['misleading_flag'],['falsity_claim_pressure','omission_pressure'],'medium'),
    entry('omission_pressure','rhetoric','Relevant context or qualifying record is left out.','Check whether omission changes support, scope, or interpretation.',['omission_to_falsity','omission_to_intent'],['omitted_context','relevance','effect_on_claim'],['omission_flag'],['qualification_pressure','misleading_pressure'],'medium'),
    entry('clarity_reduction_pressure','rhetoric_clarity','Wording or structure makes the exact claim harder to inspect.','Ask for simpler, testable claim and definitions.',['vagueness_to_truth','vagueness_to_evasion_proof'],['obscured_claim','simpler_restatement','term_definitions'],['clarity_request'],['ambiguity_pressure','misleading_pressure'],'medium'),
    entry('evidence_access_burden','rhetoric_clarity','A claim cannot be evaluated cleanly because evidence access or claim clarity is blocked.','Request accessible evidence, clearer wording, or operational definitions.',['unclear_claim_movement'],['accessible_evidence','operational_claim'],['evidence_access_request'],['evidence_contact_pressure'],'medium'),
    entry('affective_pressure','rhetoric_affect','Emotional framing pushes feeling before evidence.','Strip affective wording and evaluate remaining proposition.',['emotion_to_truth','outrage_to_evidence'],['loaded_words','stripped_proposition'],['affect_flag'],['evidence_contact_pressure'],'medium'),
    entry('salience_distortion_pressure','rhetoric_affect','Rhetoric changes what feels important before evidence ranking is justified.','Check whether salience is evidence-based or emotionally amplified.',['salience_to_truth'],['salience_basis','evidence_priority'],['salience_review'],['affective_pressure'],'medium'),
    entry('accusation_pressure','accusation','The sentence accuses a target of wrongdoing.','Identify accusation, target, and evidence before accepting it.',['accusation_to_truth'],['accusation','target','direct_evidence'],['accusation_review'],['alleges(claim)','supported_accusation(claim)'],'high'),
    entry('reputational_risk_pressure','accusation','A claim can harm a person or group if accepted without support.','Raise evidence burden and preserve non-final status.',['harmful_accusation_to_truth'],['target','harm_risk','direct_evidence'],['higher_burden_review'],['hearsay_pressure','evidence_gap_pressure'],'high'),
    entry('absence_to_truth_pressure','fallacy','The argument treats no disproof as proof, or no proof as falsity.','Block absence-to-truth and absence-to-falsity movement.',['not_disproven_to_true','not_proven_to_false'],['absence_type','expected_evidence_logic'],['unresolved_status'],['unverified_pressure','not_falsified_pressure'],'high')
  ]);

  function defaultRegistry() {
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Registry of semantic pressure labels used by the 42ndMind semantic-language corpus. Definitions are ontology guidance, not belief movement.',
      pressure_count: REGISTRY_ROWS.length,
      pressures: clone(REGISTRY_ROWS),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function lookup(pressure, registry) {
    const rows = asArray((registry || defaultRegistry()).pressures);
    const key = lower(pressure);
    return rows.find(row => lower(row.pressure) === key) || null;
  }

  function pressureRowsFromCorpus(corpus) {
    const rows = [];
    entriesOf(corpus).forEach((entry, entry_index) => {
      asArray(entry.semantic_operators).forEach((op, operator_index) => {
        unique(op.pressure).forEach(pressure => {
          rows.push({
            pressure,
            entry_id: text(entry.id),
            entry_index,
            operator: text(op.operator),
            operator_name: operatorName(op.operator),
            operator_index,
            text: text(entry.text),
            operator_group: text(entry.operator_group || entry.contrast_group || 'ungrouped')
          });
        });
      });
    });
    return rows;
  }

  function pressureNamesFromCorpus(corpus) {
    return unique(pressureRowsFromCorpus(corpus).map(row => row.pressure)).sort();
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

  function validateRegistry(registry) {
    const rows = asArray((registry || defaultRegistry()).pressures);
    const errors = [];
    const seen = new Set();
    rows.forEach((row, index) => {
      const p = text(row.pressure);
      if (!p) errors.push(`pressure_${index}_missing_pressure`);
      if (seen.has(lower(p))) errors.push(`duplicate_pressure:${p}`);
      seen.add(lower(p));
      ['family','definition','effect'].forEach(field => { if (!text(row[field])) errors.push(`${p || index}_missing_${field}`); });
      if (!Array.isArray(row.blocks)) errors.push(`${p || index}_blocks_not_array`);
      if (!Array.isArray(row.requires)) errors.push(`${p || index}_requires_not_array`);
      if (!Array.isArray(row.allows)) errors.push(`${p || index}_allows_not_array`);
    });
    return { ok: errors.length === 0, errors, pressure_count: rows.length, belief_movement: 'none', doctrine: doctrine() };
  }

  function validateAgainstCorpus(corpus, registry) {
    const reg = registry || defaultRegistry();
    const observed = pressureNamesFromCorpus(corpus);
    const registered = unique(asArray(reg.pressures).map(row => row.pressure)).sort();
    const registeredSet = new Set(registered.map(lower));
    const observedSet = new Set(observed.map(lower));
    const missing = observed.filter(p => !registeredSet.has(lower(p)));
    const orphaned = registered.filter(p => !observedSet.has(lower(p)));
    return {
      packet_type: '42ndMind_semantic_pressure_registry_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: missing.length === 0,
      observed_pressure_count: observed.length,
      registered_pressure_count: registered.length,
      covered_pressure_count: observed.length - missing.length,
      missing_pressure_count: missing.length,
      orphaned_registry_count: orphaned.length,
      missing_pressures: missing,
      orphaned_registry_pressures: orphaned,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function buildOntologyFromCorpus(corpus, registry) {
    const reg = registry || defaultRegistry();
    const rows = pressureRowsFromCorpus(corpus);
    const grouped = groupRows(rows, 'pressure');
    const pressures = Object.keys(grouped).sort().map(pressure => {
      const observations = grouped[pressure];
      const def = lookup(pressure, reg);
      return Object.assign({}, def || { pressure, family: 'unregistered', definition: '', effect: '', blocks: [], requires: [], allows: [], contrasts: [], severity: 'unknown' }, {
        observation_count: observations.length,
        operators: unique(observations.map(row => row.operator_name)).sort(),
        operator_groups: unique(observations.map(row => row.operator_group)).sort(),
        examples: observations.slice(0, 5).map(row => ({ entry_id: row.entry_id, operator: row.operator, text: row.text }))
      });
    });
    const validation = validateAgainstCorpus(corpus, reg);
    return {
      packet_type: '42ndMind_semantic_pressure_ontology_from_corpus_v0_1',
      packet_version: VERSION,
      created_at: now(),
      pressure_count: pressures.length,
      observation_count: rows.length,
      family_count: Object.keys(countBy(pressures, 'family')).length,
      families: Object.entries(countBy(pressures, 'family')).sort((a,b) => b[1] - a[1]).map(([family, count]) => ({ family, count })),
      top_pressures: Object.entries(countBy(rows, 'pressure')).sort((a,b) => b[1] - a[1]).slice(0, 20).map(([pressure, count]) => ({ pressure, count })),
      pressures,
      validation,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function allowedMovementFor(pressure, registry) {
    const row = lookup(pressure, registry);
    if (!row) return { pressure: text(pressure), registered: false, blocked: [], allowed: [], belief_movement: 'none_by_itself' };
    return { pressure: row.pressure, registered: true, blocks: clone(row.blocks), allows: clone(row.allows), requires: clone(row.requires), belief_movement: row.belief_movement || 'none_by_itself' };
  }

  global.KernelSemanticPressureRegistryV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    defaultRegistry,
    lookup,
    pressureRowsFromCorpus,
    pressureNamesFromCorpus,
    validateRegistry,
    validateAgainstCorpus,
    buildOntologyFromCorpus,
    allowedMovementFor
  });
})(typeof window !== 'undefined' ? window : globalThis);
