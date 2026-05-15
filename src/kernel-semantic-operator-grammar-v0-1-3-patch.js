/* 42ndMind Semantic Operator Grammar v0.1.3 Patch
 * Fixes authority/evidence contrast overmatching from v0.1.2.
 * - Adds debate_over(claim) for consensus/debate closure language.
 * - Adds proved_false(evidence,claim) for compound proof + falsity wording.
 * - Removes broad "published" matching from posted(source,claim) so
 *   published_summary(source) does not falsely trigger posted(source,claim).
 *
 * No truth decision, belief movement, doctrine promotion, or source write occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.3';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item), key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  const EXTRA_OPERATORS = Object.freeze([
    {
      id: 'op_debate_over_claim',
      operator: 'debate_over(claim)',
      name: 'debate_over',
      group: 'closure_dismissal',
      surface_terms: ['debate is over', 'debate over', 'case closed'],
      P: ['closure_pressure'],
      G: 'Debate-over language is legitimate only when the exact question, evidence basis, and unresolved-question boundary are defined.',
      E: ['Identify what debate is allegedly over.', 'Identify the evidence or consensus basis.', 'State what questions remain open.'],
      A: 'Treat debate-over language as closure pressure until scope and evidence are inspected.',
      C: ['consensus(group)', 'settled(claim)', 'challenged(claim)', 'unresolved_question(claim)']
    },
    {
      id: 'op_proved_false_evidence_claim',
      operator: 'proved_false(evidence,claim)',
      name: 'proved_false',
      group: 'closure_dismissal',
      surface_terms: ['proved the claim false', 'proved false', 'proven false'],
      P: ['support_inflation_pressure', 'falsity_claim_pressure', 'closure_pressure'],
      G: 'Proved-false language is legitimate only when the cited evidence directly falsifies the exact claim under the same definitions and scope.',
      E: ['Extract the exact claim.', 'Identify the evidence being used as proof.', 'Check whether the evidence falsifies rather than merely weakens the claim.'],
      A: 'Hold as proof-plus-falsity pressure until direct falsification is inspectable.',
      C: ['proved(evidence,claim)', 'false(claim)', 'lacks_evidence(claim)', 'contradicted_by(record,claim)']
    }
  ]);

  function extendedGrammar() {
    const grammar = base.defaultGrammar();
    const existing = new Set(asArray(grammar.operators).map(op => lower(op.id)));
    EXTRA_OPERATORS.forEach(op => { if (!existing.has(lower(op.id))) grammar.operators.push(clone(op)); });

    const byName = {};
    grammar.operators.forEach(op => { byName[lower(op.name)] = op; });

    // Narrow posted(source,claim). "Published summary" should map to published_summary(source),
    // not posted(source,claim). Keep posted/released, remove bare published.
    if (byName.posted) {
      byName.posted.surface_terms = unique(asArray(byName.posted.surface_terms).filter(term => lower(term) !== 'published'));
    }

    // Strengthen consensus and false/proof surface detection without changing source semantics.
    if (byName.consensus) byName.consensus.surface_terms = unique(asArray(byName.consensus.surface_terms).concat(['there is a consensus']));
    if (byName.false) byName.false.surface_terms = unique(asArray(byName.false.surface_terms).concat(['claim false', 'the claim false']));
    if (byName.proved) byName.proved.surface_terms = unique(asArray(byName.proved.surface_terms).concat(['proved the claim']));
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
    d.patch_fixes_published_summary_overmatch = true;
    d.patch_adds_debate_closure_and_proved_false = true;
    d.patch_preserves_status_vs_evidence_distinction = true;
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    EXTRA_OPERATORS_V013: EXTRA_OPERATORS,
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
