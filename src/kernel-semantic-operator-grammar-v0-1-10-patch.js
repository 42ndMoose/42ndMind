/* 42ndMind Semantic Operator Grammar v0.1.10 Patch
 * Adds coverage for vector-template planner suggested sentences and tightens
 * two substring overmatches found in workbench analysis:
 * - bare "question" no longer triggers challenged(claim)
 * - bare "rated" no longer matches inside "separated"
 *
 * No truth decision, belief movement, doctrine promotion, or source write occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.10';

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

  const EXTRA_OPERATORS = Object.freeze([
    {
      id: 'op_settled_claim',
      operator: 'settled(claim)',
      name: 'settled',
      group: 'closure_dismissal',
      surface_terms: ['claim settled', 'calls the claim settled', 'closes the question', 'end the analysis', 'settles the question'],
      P: ['closure_pressure', 'authority_transfer_pressure'],
      G: 'Settled or closure language is legitimate only when the exact question, record support, and unresolved-boundary are defined.',
      E: ['Identify what question is being closed.', 'Identify the supporting evidence or authority basis.', 'Check whether unresolved alternatives or scope limits remain.'],
      A: 'Treat settled language as closure pressure until evidence and scope are inspected.',
      C: ['challenged(claim)', 'lacks_evidence(claim)', 'unverified(claim)', 'consensus(group)']
    },
    {
      id: 'op_same_source_actor_event',
      operator: 'same_source(actor,event)',
      name: 'same_source',
      group: 'motive_agency',
      surface_terms: ['common source', 'could explain the overlap', 'outlets used similar wording', 'similar wording'],
      P: ['motive_agency_pressure', 'uncertainty_calibration_pressure'],
      G: 'Common-source pressure is legitimate when similar wording or timing may be explained by shared upstream material rather than direct coordination.',
      E: ['Identify the similar wording or timing.', 'Look for a shared upstream source.', 'Compare common-source, coordination, and independent-convergence explanations.'],
      A: 'Preserve common-source alternative before inferring coordination.',
      C: ['coordinated(actor,event)', 'collusion(actors)', 'independent_convergence(actor,event)']
    },
    {
      id: 'op_quote_source_claim',
      operator: 'quote(source,claim)',
      name: 'quote',
      group: 'evidence_contact',
      surface_terms: ['the quote', 'quote creates evidence contact', 'quoted passage', 'full record must still be checked'],
      P: ['evidence_contact_pressure', 'direct_support_pressure'],
      G: 'A quote creates evidence contact only when it is authentic, complete enough, and mapped to the same claim and scope.',
      E: ['Identify the quote source.', 'Check surrounding context and completeness.', 'Map the quoted passage to the exact claim and scope.'],
      A: 'Treat quote evidence as bounded evidence contact until the fuller record is checked.',
      C: ['transcript(evidence)', 'clip(evidence)', 'summary(source)', 'different_scope(record,claim)']
    }
  ]);

  function extendedGrammar() {
    const grammar = base.defaultGrammar();
    const existing = new Set(asArray(grammar.operators).map(op => lower(op.id)));
    EXTRA_OPERATORS.forEach(op => { if (!existing.has(lower(op.id))) grammar.operators.push(clone(op)); });

    const byName = {};
    grammar.operators.forEach(op => { byName[lower(op.name)] = op; });

    if (byName.challenged) {
      byName.challenged.surface_terms = unique(asArray(byName.challenged.surface_terms).filter(term => !['question', 'questions'].includes(lower(term))));
    }

    if (byName.rated) {
      byName.rated.surface_terms = unique(asArray(byName.rated.surface_terms)
        .filter(term => lower(term) !== 'rated')
        .concat(['rated the claim', 'rated claim', 'rated false', 'rated the claim false', 'reviewer rated']));
    }

    if (byName.ulterior_motive_attribution) {
      byName.ulterior_motive_attribution.surface_terms = unique(asArray(byName.ulterior_motive_attribution.surface_terms).concat([
        'benefited from the result',
        'benefit alone does not prove motive',
        'benefit alone',
        'does not prove motive'
      ]));
    }

    if (byName.reckless_accusation) {
      byName.reckless_accusation.surface_terms = unique(asArray(byName.reckless_accusation.surface_terms).concat([
        'accusation assigns intent',
        'assigns intent before identifying',
        'direct evidence link',
        'before identifying a direct evidence link'
      ]));
    }

    if (byName.emotionally_loaded) {
      byName.emotionally_loaded.surface_terms = unique(asArray(byName.emotionally_loaded.surface_terms).concat([
        'moral shock',
        'uses moral shock',
        'feel urgent',
        'issue feel urgent',
        'without showing whether the claim is true'
      ]));
    }

    if (byName.obfuscates) {
      byName.obfuscates.surface_terms = unique(asArray(byName.obfuscates.surface_terms).concat([
        'answer obscures',
        'obscures the claim',
        'avoiding the specific actor and action',
        'compresses several claims together',
        'several claims together',
        'must be separated first'
      ]));
    }

    if (byName.official_source) {
      byName.official_source.surface_terms = unique(asArray(byName.official_source.surface_terms).concat([
        'official conclusion',
        'institution published'
      ]));
    }

    if (byName.posted) {
      byName.posted.surface_terms = unique(asArray(byName.posted.surface_terms).concat([
        'published the claim',
        'institution published the claim',
        'publication does not settle',
        'publication does not settle the interpretation'
      ]));
    }

    if (byName.states) {
      byName.states.surface_terms = unique(asArray(byName.states.surface_terms).concat([
        'document supports the claim',
        'cited passage maps to the same scope',
        'supports the claim only if',
        'record supports the exact claim'
      ]));
    }

    if (byName.primary_document) {
      byName.primary_document.surface_terms = unique(asArray(byName.primary_document.surface_terms).concat([
        'cited passage',
        'full record',
        'supporting evidence still has to be shown'
      ]));
    }

    if (byName.expert) {
      byName.expert.surface_terms = unique(asArray(byName.expert.surface_terms).concat([
        'expert calls',
        'expert calls the claim settled'
      ]));
    }

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
    d.patch_adds_vector_planner_sentence_coverage = true;
    d.patch_tightens_rated_substring_overmatch = true;
    d.patch_tightens_challenged_question_overmatch = true;
    d.vector_planner_sentences_are_review_targets_not_doctrine = true;
    d.belief_movement = 'none';
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    EXTRA_OPERATORS_V0110: EXTRA_OPERATORS,
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
