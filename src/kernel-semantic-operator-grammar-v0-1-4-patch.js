/* 42ndMind Semantic Operator Grammar v0.1.4 Patch
 * Adds targeted operators/surface coverage from the motive/agency weak-mapping batch:
 * collusion, court_filing, alleges, clearly, someone, pressured, and conspiracy.
 * Also expands challenged(claim) to catch active "question" wording.
 *
 * No truth decision, belief movement, doctrine promotion, or source write occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.4';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item); const key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  const EXTRA_OPERATORS = Object.freeze([
    {
      id: 'op_collusion_actors',
      operator: 'collusion(actors)',
      name: 'collusion',
      group: 'motive_agency',
      surface_terms: ['collusion', 'colluded', 'collude', 'colluded to'],
      P: ['motive_agency_pressure', 'direct_link_evidence_burden'],
      G: 'Collusion is legitimate only with direct-link evidence such as agreement, communication, shared control, or coordinated action that defeats independent convergence.',
      E: ['Identify the actors.', 'Identify the alleged shared action.', 'Look for agreement, communication records, common control, or shared planning evidence.'],
      A: 'Hold collusion as a motive/agency hypothesis until direct-link evidence is inspectable.',
      C: ['coordinated(actor,event)', 'similar(actor,event)', 'same_source(actor,event)', 'independent_convergence(actor,event)']
    },
    {
      id: 'op_court_filing_source',
      operator: 'court_filing(source)',
      name: 'court_filing',
      group: 'evidence_contact',
      surface_terms: ['court filing', 'legal filing', 'complaint filing'],
      P: ['official_record_pressure', 'source_trust_pressure'],
      G: 'A court filing is an official record of allegations or filings; it is not proof of the allegations by itself.',
      E: ['Identify the filing.', 'Separate filed allegation from adjudicated finding.', 'Inspect exhibits, sworn statements, and court findings separately.'],
      A: 'Treat the filing as official-record pressure while preserving allegation status.',
      C: ['alleges(claim)', 'found_by_court(claim)', 'primary_document(evidence)']
    },
    {
      id: 'op_alleges_claim',
      operator: 'alleges(claim)',
      name: 'alleges',
      group: 'uncertainty_calibration',
      surface_terms: ['alleges', 'allege', 'alleged in', 'filing alleges'],
      P: ['uncertainty_calibration_pressure'],
      G: 'Alleges language is legitimate when it preserves the non-final status of a claim until evidence or adjudication changes it.',
      E: ['Identify who alleges it.', 'Identify what evidence is attached.', 'Check whether a finding, admission, or direct evidence exists.'],
      A: 'Preserve allegation status and block premature closure.',
      C: ['allegedly(claim)', 'found_by_court(claim)', 'confirmed(claim)']
    },
    {
      id: 'op_clearly_modifier',
      operator: 'clearly(modifier)',
      name: 'clearly',
      group: 'uncertainty_calibration',
      surface_terms: ['clearly'],
      P: ['confidence_inflation_pressure'],
      G: 'Clearly language is legitimate only as rhetoric after the evidence is inspectable; it cannot replace evidence.',
      E: ['Remove the confidence modifier.', 'Identify the underlying claim.', 'Check whether evidence supports the claim without the modifier.'],
      A: 'Strip confidence inflation and evaluate the underlying claim.',
      C: ['obviously(modifier)', 'probably(claim)', 'evidence_shows(claim)']
    },
    {
      id: 'op_someone_reference',
      operator: 'someone(reference)',
      name: 'someone',
      group: 'reference_ambiguity',
      surface_terms: ['someone', 'somebody'],
      P: ['ambiguity_pressure'],
      G: 'Someone is legitimate only as an unresolved actor placeholder until the actor is identified.',
      E: ['Identify the actor if possible.', 'Separate unknown actor from known institution.', 'Check whether the claim depends on actor identity.'],
      A: 'Block strong agency pressure until the actor is resolved.',
      C: ['named_actor(actor)', 'they(reference)', 'unknown_actor(reference)']
    },
    {
      id: 'op_pressured_actor_event',
      operator: 'pressured(actor,event)',
      name: 'pressured',
      group: 'motive_agency',
      surface_terms: ['pressured', 'pressure the', 'pressured the'],
      P: ['motive_agency_pressure', 'direct_link_evidence_burden'],
      G: 'Pressure/coercion language is legitimate only when the actor, target, mechanism, and evidence of pressure are identified.',
      E: ['Identify who applied pressure.', 'Identify the target.', 'Identify the pressure mechanism.', 'Inspect direct evidence such as messages, threats, incentives, or testimony.'],
      A: 'Treat pressure as an agency claim requiring direct-link evidence.',
      C: ['someone(reference)', 'coordinated(actor,event)', 'alleges(claim)']
    },
    {
      id: 'op_conspiracy_label',
      operator: 'conspiracy(label)',
      name: 'conspiracy',
      group: 'closure_dismissal',
      surface_terms: ['conspiracy theorists', 'conspiracy theorist', 'conspiracy theory', 'conspiracy'],
      P: ['closure_pressure', 'dismissal_pressure', 'stigma_pressure'],
      G: 'Conspiracy labeling is legitimate only when it distinguishes unsupported coordination claims from evidence-backed coordination claims; otherwise it operates as stigma and dismissal pressure.',
      E: ['Identify the claim being labeled.', 'Check whether the label addresses evidence or only stigmatizes the claimant.', 'Separate unsupported theory from inspectable coordination evidence.'],
      A: 'Treat conspiracy labeling as stigma/dismissal pressure unless evidence analysis is supplied.',
      C: ['coordinated(actor,event)', 'collusion(actors)', 'lacks_evidence(claim)', 'challenged(claim)']
    }
  ]);

  function extendedGrammar() {
    const grammar = base.defaultGrammar();
    const existing = new Set(asArray(grammar.operators).map(op => lower(op.id)));
    EXTRA_OPERATORS.forEach(op => { if (!existing.has(lower(op.id))) grammar.operators.push(clone(op)); });

    const byName = {};
    grammar.operators.forEach(op => { byName[lower(op.name)] = op; });
    if (byName.challenged) byName.challenged.surface_terms = unique(asArray(byName.challenged.surface_terms).concat(['question', 'questions', 'still question', 'questioned by']));
    if (byName.agenda) byName.agenda.surface_terms = unique(asArray(byName.agenda.surface_terms).concat(['that agenda', 'pushed that agenda', 'pushed the agenda']));
    if (byName.coordinated) byName.coordinated.surface_terms = unique(asArray(byName.coordinated.surface_terms).concat(['coordination', 'coordinated the talking points']));
    if (byName.transcript) byName.transcript.surface_terms = unique(asArray(byName.transcript.surface_terms).concat(['the transcript']));
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
    d.patch_adds_motive_agency_weak_mapping_coverage = true;
    d.patch_preserves_agency_claims_as_pressure_not_truth = true;
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    EXTRA_OPERATORS_V014: EXTRA_OPERATORS,
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
