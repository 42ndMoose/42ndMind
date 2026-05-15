/* 42ndMind Semantic Operator Grammar v0.1.8 Patch
 * Adds rhetoric and intent-pressure coverage:
 * obfuscates(actor,claim), emotionally_loaded(frame,claim),
 * reckless_accusation(actor,target,claim), argument_from_ignorance(claim),
 * and ulterior_motive_attribution(actor,target,motive).
 *
 * This patch separates semantic/rhetorical effect from truth and intent proof.
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.8';

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

  const EXTRA_PRESSURES = Object.freeze([
    'clarity_reduction_pressure',
    'evidence_access_burden',
    'affective_pressure',
    'salience_distortion_pressure',
    'accusation_pressure',
    'reputational_risk_pressure',
    'absence_to_truth_pressure',
    'intent_attribution_pressure'
  ]);

  const EXTRA_OPERATORS = Object.freeze([
    {
      id: 'op_obfuscates_actor_claim',
      operator: 'obfuscates(actor,claim)',
      name: 'obfuscates',
      group: 'rhetoric_clarity',
      surface_terms: ['obfuscated', 'obfuscates', 'obfuscation', 'vague language', 'so vague', 'obscures what was actually claimed', 'obscures'],
      P: ['clarity_reduction_pressure', 'ambiguity_pressure', 'evidence_access_burden'],
      G: 'Obfuscation pressure is legitimate when wording, structure, or vagueness makes the exact claim harder to define, inspect, or test.',
      E: ['Identify the exact claim being obscured.', 'Strip vague padding and restate the simplest inspectable claim.', 'Define ambiguous terms and check whether the obscurity changes the evidence burden.'],
      A: 'Treat as clarity-reduction pressure; ask for a simpler inspectable claim before belief movement.',
      C: ['clear_claim(claim)', 'ambiguous_reference(reference)', 'misleading(claim)', 'different_scope(record,claim)']
    },
    {
      id: 'op_emotionally_loaded_frame_claim',
      operator: 'emotionally_loaded(frame,claim)',
      name: 'emotionally_loaded',
      group: 'rhetoric_affect',
      surface_terms: ['emotionally loaded', 'emotionally charged', 'emotionally driven', 'charged rhetoric', 'loaded language', 'provoke outrage', 'outrage'],
      P: ['affective_pressure', 'salience_distortion_pressure', 'confidence_inflation_pressure'],
      G: 'Emotionally loaded framing is legitimate as a rhetoric-pressure flag, not as evidence for or against the underlying claim.',
      E: ['Identify the emotionally loaded words.', 'Restate the underlying proposition without affective framing.', 'Check whether evidence remains after emotional language is removed.'],
      A: 'Separate affective pressure from evidence and evaluate the stripped proposition.',
      C: ['evidence_shows(claim)', 'misleading(claim)', 'moral_risk(label)', 'false(claim)']
    },
    {
      id: 'op_reckless_accusation_actor_target_claim',
      operator: 'reckless_accusation(actor,target,claim)',
      name: 'reckless_accusation',
      group: 'accusation_risk',
      surface_terms: ['reckless accusation', 'accusation was made recklessly', 'recklessly accused', 'accused the witness', 'without direct evidence'],
      P: ['accusation_pressure', 'evidence_gap_pressure', 'reputational_risk_pressure', 'direct_link_evidence_burden'],
      G: 'Reckless-accusation pressure is legitimate when a serious accusation is made with inadequate direct evidence, care, or scope discipline.',
      E: ['Identify the exact accusation.', 'Identify the accused target.', 'Identify the direct evidence, if any.', 'Check whether the accusation is supported, merely suspected, or reputationally harmful without evidence.'],
      A: 'Raise evidence burden for accusation claims and preserve reputational risk without treating accusation as proof.',
      C: ['supported_accusation(claim)', 'alleges(claim)', 'hearsay(source)', 'false_accusation(claim)']
    },
    {
      id: 'op_argument_from_ignorance_claim',
      operator: 'argument_from_ignorance(claim)',
      name: 'argument_from_ignorance',
      group: 'fallacy_absence',
      surface_terms: ['nobody has proven', 'no one has disproven', 'has not been disproven so', 'so it must be true', 'because nobody has proven', 'because no one has disproven'],
      P: ['absence_to_truth_pressure', 'closure_pressure', 'uncertainty_calibration_pressure'],
      G: 'Argument-from-ignorance pressure is legitimate when absence of proof is treated as proof of the opposite or absence of disproof is treated as proof of truth.',
      E: ['Identify whether the argument moves from absence of proof to falsity or absence of disproof to truth.', 'Check what evidence should exist if the claim were true or false.', 'Separate unresolved status from support or falsity.'],
      A: 'Block absence-to-truth and absence-to-falsity movement; preserve unresolved status unless expected evidence logic applies.',
      C: ['unverified(claim)', 'not_disproven(claim)', 'lacks_evidence(claim)', 'proved(evidence,claim)']
    },
    {
      id: 'op_ulterior_motive_attribution_actor_target_motive',
      operator: 'ulterior_motive_attribution(actor,target,motive)',
      name: 'ulterior_motive_attribution',
      group: 'motive_agency',
      surface_terms: ['ulterior motive', 'without showing evidence of intent', 'assumes the minister acted out of self-interest', 'acted out of self-interest', 'self-interest', 'motive without evidence'],
      P: ['motive_agency_pressure', 'intent_attribution_pressure', 'direct_link_evidence_burden'],
      G: 'Ulterior-motive attribution is legitimate only when actor, alleged hidden motive, action, and evidence link are specified.',
      E: ['Identify who is assigned the motive.', 'Identify the alleged motive and action.', 'Inspect evidence linking motive to action rather than inferring motive from outcome or dislike.'],
      A: 'Treat hidden motive as a motive/agency hypothesis requiring direct-link evidence.',
      C: ['incentive(actor)', 'policy_goal(actor)', 'observed_effect(event)', 'deliberately_misleading(actor,claim)']
    }
  ]);

  function extendedGrammar() {
    const grammar = base.defaultGrammar();
    const existing = new Set(asArray(grammar.operators).map(op => lower(op.id)));
    EXTRA_OPERATORS.forEach(op => { if (!existing.has(lower(op.id))) grammar.operators.push(clone(op)); });
    return grammar;
  }

  function findOperator(nameOrSignature, grammar) { return base.findOperator(nameOrSignature, grammar || extendedGrammar()); }
  function pressureVectorFor(nameOrSignature, grammar) { return base.pressureVectorFor(nameOrSignature, grammar || extendedGrammar()); }
  function contrastClassFor(nameOrSignature, grammar) { return base.contrastClassFor(nameOrSignature, grammar || extendedGrammar()); }
  function operatorsByGroup(grammarOrGroup, maybeGroup) {
    if (typeof grammarOrGroup === 'string') return base.operatorsByGroup(extendedGrammar(), grammarOrGroup);
    return base.operatorsByGroup(grammarOrGroup || extendedGrammar(), maybeGroup);
  }
  function validateGrammar(grammar) { return base.validateGrammar(grammar || extendedGrammar()); }
  function grammarRows(grammar) { return base.grammarRows(grammar || extendedGrammar()); }
  function summarize(grammar) { return base.summarize(grammar || extendedGrammar()); }
  function analyzeText(value, grammar) { return base.analyzeText(value, grammar || extendedGrammar()); }

  function doctrine() {
    const d = base.doctrine();
    d.patch_version = VERSION;
    d.patch_adds_rhetoric_and_intent_pressure_operators = true;
    d.rhetorical_pressure_is_not_truth = true;
    d.intent_attribution_requires_extra_evidence = true;
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PRESSURES: Object.freeze(unique(asArray(base.PRESSURES).concat(EXTRA_PRESSURES))),
    EXTRA_OPERATORS_V018: EXTRA_OPERATORS,
    doctrine,
    defaultGrammar: extendedGrammar,
    findOperator,
    pressureVectorFor,
    contrastClassFor,
    operatorsByGroup,
    validateGrammar,
    grammarRows,
    summarize,
    analyzeText,
    parseSignature: base.parseSignature,
    validateOperator: base.validateOperator,
    algebraLine: base.algebraLine,
    corpusOperatorToGrammarCandidate: base.corpusOperatorToGrammarCandidate,
    corpusEntriesToGrammarCandidates: base.corpusEntriesToGrammarCandidates
  }));
})(typeof window !== 'undefined' ? window : globalThis);
