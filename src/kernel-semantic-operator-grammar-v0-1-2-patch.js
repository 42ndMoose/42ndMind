/* 42ndMind Semantic Operator Grammar v0.1.2 Patch
 * Extends the grammar after the first authority/evidence contrast batch.
 * Adds operators for proved, works, reliable, states, deadline_extended,
 * published_summary, and posted.
 *
 * These operators sharpen the distinction between authority/status pressure,
 * proof/support inflation, policy effectiveness, and evidence-contact pressure.
 * No truth decision, belief movement, doctrine promotion, or source write occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.2';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item), key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  const EXTRA_PRESSURES = Object.freeze([
    'policy_effectiveness_pressure',
    'provenance_pressure',
    'factual_update_pressure'
  ]);

  const EXTRA_OPERATORS = Object.freeze([
    {
      id: 'op_proved_evidence_claim',
      operator: 'proved(evidence,claim)',
      name: 'proved',
      group: 'closure_dismissal',
      surface_terms: ['proved', 'proves', 'proof', 'proven'],
      P: ['support_inflation_pressure', 'closure_pressure'],
      G: 'Proof language is legitimate only when the evidence directly entails the exact claim under the same definitions and scope.',
      E: ['Identify the exact claim.', 'Identify the evidence being used as proof.', 'Check whether the evidence entails the claim or only supports it weakly.'],
      A: 'Treat proof language as support-inflation pressure until direct entailment is inspected.',
      C: ['supports(evidence,claim)', 'suggests(evidence,claim)', 'contradicted_by(record,claim)', 'false(claim)']
    },
    {
      id: 'op_works_policy',
      operator: 'works(policy)',
      name: 'works',
      group: 'authority_transfer',
      surface_terms: ['works', 'worked', 'effective', 'successful'],
      P: ['effectiveness_claim_pressure', 'policy_effectiveness_pressure'],
      G: 'A policy-effectiveness claim is legitimate only with a defined outcome, baseline, timeframe, and comparison class.',
      E: ['Define what works means.', 'Identify outcome metrics.', 'Compare against baseline and alternatives.', 'Check timeframe and scope.'],
      A: 'Require outcome evidence before accepting effectiveness pressure.',
      C: ['expert(source)', 'primary_document(evidence)', 'raw_data(evidence)', 'anecdote(source)']
    },
    {
      id: 'op_reliable_source',
      operator: 'reliable(source)',
      name: 'reliable',
      group: 'source_trust',
      surface_terms: ['reliable', 'trustworthy', 'credible'],
      P: ['trust_inflation_pressure', 'source_trust_pressure'],
      G: 'Reliability is legitimate only as source-history pressure; it cannot settle a specific claim without evidence.',
      E: ['Identify the source.', 'Check reliability history and incentives.', 'Inspect claim-level evidence separately.'],
      A: 'Treat reliability as prior pressure, not truth.',
      C: ['official_source(source)', 'primary_document(evidence)', 'certified(source)', 'anonymous_social_post(source)']
    },
    {
      id: 'op_posted_source_claim',
      operator: 'posted(source,claim)',
      name: 'posted',
      group: 'source_trust',
      surface_terms: ['posted', 'published', 'released'],
      P: ['provenance_pressure', 'source_trust_pressure'],
      G: 'Posting or publication establishes provenance of a statement, not truth of the statement.',
      E: ['Identify who posted it.', 'Separate the posted content from the content truth.', 'Inspect supporting records or evidence.'],
      A: 'Treat posting as provenance pressure only.',
      C: ['states(document,claim)', 'official_source(source)', 'primary_document(evidence)']
    },
    {
      id: 'op_states_document_claim',
      operator: 'states(document,claim)',
      name: 'states',
      group: 'evidence_contact',
      surface_terms: ['states', 'says', 'states that', 'document states'],
      P: ['direct_support_pressure', 'evidence_contact_pressure'],
      G: 'A document statement supports a claim only when the exact passage maps to the claim and scope.',
      E: ['Identify the document.', 'Locate the exact passage.', 'Check date, authority, scope, and applicability.'],
      A: 'Allow bounded support pressure after passage-level inspection.',
      C: ['primary_document(evidence)', 'published_summary(source)', 'quotes(source,claim)']
    },
    {
      id: 'op_deadline_extended_event',
      operator: 'deadline_extended(event)',
      name: 'deadline_extended',
      group: 'evidence_contact',
      surface_terms: ['deadline was extended', 'deadline extended', 'extended the deadline'],
      P: ['factual_update_pressure', 'direct_support_pressure'],
      G: 'A deadline-extension claim is legitimate only when the authority, date, affected case, and scope are identified.',
      E: ['Identify the original deadline.', 'Identify the new deadline.', 'Check who had authority to extend it.', 'Check whether it applies to the relevant case.'],
      A: 'Treat as bounded factual update after authority and scope are checked.',
      C: ['states(document,claim)', 'primary_document(evidence)', 'rumored_update(claim)']
    },
    {
      id: 'op_published_summary_source',
      operator: 'published_summary(source)',
      name: 'published_summary',
      group: 'evidence_contact',
      surface_terms: ['published summary', 'summary', 'report summary'],
      P: ['interpretation_layer_pressure'],
      G: 'A published summary is an interpretation layer and must be checked against the underlying record or raw data.',
      E: ['Identify the summary claim.', 'Identify the underlying data or record.', 'Check whether the summary preserves definitions and scope.'],
      A: 'Treat summary as interpretation until checked against underlying evidence.',
      C: ['raw_data(evidence)', 'primary_document(evidence)', 'chart(source)']
    }
  ]);

  function extendedGrammar() {
    const grammar = base.defaultGrammar();
    const existing = new Set(asArray(grammar.operators).map(op => lower(op.id)));
    EXTRA_OPERATORS.forEach(op => { if (!existing.has(lower(op.id))) grammar.operators.push(clone(op)); });

    const byName = {};
    grammar.operators.forEach(op => { byName[lower(op.name)] = op; });
    if (byName.certified) byName.certified.surface_terms = unique(asArray(byName.certified.surface_terms).concat(['certified source']));
    if (byName.expert) byName.expert.surface_terms = unique(asArray(byName.expert.surface_terms).concat(['expert said', 'expert says']));
    if (byName.consensus) byName.consensus.surface_terms = unique(asArray(byName.consensus.surface_terms).concat(['there is a consensus']));
    if (byName.official_source) byName.official_source.surface_terms = unique(asArray(byName.official_source.surface_terms).concat(['official source']));
    if (byName.raw_data) byName.raw_data.surface_terms = unique(asArray(byName.raw_data.surface_terms).concat(['raw data']));
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
    d.patch_adds_authority_evidence_contrast_operators = true;
    d.patch_preserves_status_vs_evidence_distinction = true;
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PRESSURES: Object.freeze(unique(asArray(base.PRESSURES).concat(EXTRA_PRESSURES))),
    EXTRA_OPERATORS_V012: EXTRA_OPERATORS,
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
