/* 42ndMind Semantic Pressure Registry v0.1.1 Patch
 * Adds pressure definitions observed in the current semantic corpus.
 *
 * This patch keeps pressure labels as ontology guidance only.
 * It does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticPressureRegistryV01;
  if (!base) return;

  const VERSION = '0.1.1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
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

  const EXTRA_PRESSURES = Object.freeze([
    entry('ambiguity_pressure','reference_clarity','A pronoun, deictic term, broad actor class, undefined target, or unclear scope prevents clean claim evaluation.','Require reference resolution before strong belief pressure or agency/evidence movement.',['unresolved_reference_to_claim_movement','ambiguous_actor_to_agency_claim','deictic_reference_to_evidence'],['referent','actor_or_target_resolution','claim_scope'],['reference_resolution_request','bounded_unresolved_status'],['clear_claim(claim)','named_actor(actor)','named_evidence(evidence)'],'medium'),
    entry('effectiveness_claim_pressure','policy_effect','The sentence asserts that something works, failed, reduced risk, or caused an outcome.','Require defined outcome metric, baseline, timeframe, and comparison class before accepting effectiveness pressure.',['works_to_true','failed_to_false_without_metric','outcome_claim_without_baseline'],['outcome_metric','baseline','timeframe','comparison_class','scope'],['bounded_effectiveness_review'],['anecdote(source)','raw_data(evidence)','primary_document(evidence)'],'medium'),
    entry('policy_effectiveness_pressure','policy_effect','A policy is claimed to work, fail, reduce risk, or produce a result.','Treat policy-effectiveness as empirical pressure needing outcome data and scope discipline.',['policy_label_to_effect','expert_claim_to_policy_success'],['policy_definition','outcome_data','baseline','alternatives','scope'],['bounded_policy_effectiveness_claim'],['effectiveness_claim_pressure','authority_transfer_pressure'],'medium'),
    entry('support_inflation_pressure','support','Language such as proves, confirms, or directly shows inflates support beyond what the evidence may warrant.','Require direct entailment or exact support mapping before allowing strong support movement.',['relevance_to_proof','mention_to_confirmation','weak_evidence_to_strong_support'],['evidence_object','exact_claim','support_mapping','scope_check'],['bounded_support_after_mapping'],['direct_support_pressure','uncertainty_calibration_pressure','evidence_gap_pressure'],'high'),
    entry('covert_agreement_pressure','agency','Language requires or alleges a hidden, secret, covert, or illicit agreement behind actor coordination.','Separate public or neutral coordination from collusion by requiring evidence of covert agreement, shared control, or illicit coordination mechanism.',['coordination_to_collusion','similar_timing_to_secret_agreement','public_coordination_to_illicit_agreement'],['agreement_channel','hidden_control_mechanism','actor_link','direct_evidence'],['covert_agreement_review_after_direct_link'],['coordinated(actor,event)','independent_convergence(actor,event)','same_source(actor,event)'],'high')
  ]);

  function doctrine() {
    const d = base.doctrine();
    d.patch_version = VERSION;
    d.patch_adds_missing_current_corpus_pressures = true;
    d.pressure_registry_defines_labels_not_truth = true;
    d.pressure_labels_are_not_belief_movement = true;
    d.belief_movement = 'none';
    return d;
  }

  function extendedRegistry() {
    const registry = base.defaultRegistry();
    const seen = new Set(asArray(registry.pressures).map(row => lower(row.pressure)));
    EXTRA_PRESSURES.forEach(row => {
      if (!seen.has(lower(row.pressure))) registry.pressures.push(clone(row));
    });
    registry.packet_version = VERSION;
    registry.pressure_count = registry.pressures.length;
    registry.description = `${registry.description} Patched with current-corpus missing pressure definitions.`;
    registry.doctrine = doctrine();
    registry.belief_movement = 'none';
    return registry;
  }

  function lookup(pressure, registry) { return base.lookup(pressure, registry || extendedRegistry()); }
  function validateRegistry(registry) { return base.validateRegistry(registry || extendedRegistry()); }
  function validateAgainstCorpus(corpus, registry) { return base.validateAgainstCorpus(corpus, registry || extendedRegistry()); }
  function buildOntologyFromCorpus(corpus, registry) { return base.buildOntologyFromCorpus(corpus, registry || extendedRegistry()); }
  function allowedMovementFor(pressure, registry) { return base.allowedMovementFor(pressure, registry || extendedRegistry()); }

  global.KernelSemanticPressureRegistryV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    EXTRA_PRESSURES_V011: EXTRA_PRESSURES,
    doctrine,
    defaultRegistry: extendedRegistry,
    lookup,
    validateRegistry,
    validateAgainstCorpus,
    buildOntologyFromCorpus,
    allowedMovementFor
  }));
})(typeof window !== 'undefined' ? window : globalThis);
