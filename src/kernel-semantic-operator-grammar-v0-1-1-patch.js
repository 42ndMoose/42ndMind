/* 42ndMind Semantic Operator Grammar v0.1.1 Patch
 * Extends v0.1 with contrast-sensitive operators exposed by the first workbench run:
 * challenged, lacks_evidence, false, rated, reviewer, and contradicted_by.
 *
 * This patch re-exports KernelSemanticOperatorGrammarV01 with an extended default grammar.
 * It does not decide truth, move belief, promote doctrine, or patch source at runtime.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item), key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  const EXTRA_PRESSURES = Object.freeze([
    'challenge_pressure',
    'evidence_gap_pressure',
    'falsity_claim_pressure',
    'rating_pressure',
    'reviewer_status_pressure'
  ]);

  const EXTRA_OPERATORS = Object.freeze([
    {
      id: 'op_challenged_claim',
      operator: 'challenged(claim)',
      name: 'challenged',
      group: 'closure_dismissal',
      surface_terms: ['challenged', 'challenge', 'questioned', 'disputed'],
      P: ['challenge_pressure', 'uncertainty_calibration_pressure'],
      G: 'A challenge is legitimate as pressure against certainty, but it is not the same as refutation or contradiction.',
      E: ['Identify what part of the claim is challenged.', 'Identify the reason or evidence for the challenge.', 'Check whether the challenge weakens, contradicts, or merely questions the claim.'],
      A: 'Reduce premature certainty; do not convert challenge into debunking or falsity.',
      C: ['debunked(claim)', 'contradicted_by(record,claim)', 'lacks_evidence(claim)', 'false(claim)']
    },
    {
      id: 'op_lacks_evidence_claim',
      operator: 'lacks_evidence(claim)',
      name: 'lacks_evidence',
      group: 'closure_dismissal',
      surface_terms: ['lacks evidence', 'no evidence', 'unsupported', 'unsubstantiated'],
      P: ['evidence_gap_pressure', 'uncertainty_calibration_pressure'],
      G: 'Lack of evidence is legitimate as support-withholding pressure; it is not automatically evidence of falsity.',
      E: ['Identify the claim and expected evidence type.', 'Check whether evidence was searched for in the right place.', 'Separate absence of support from contradiction.'],
      A: 'Withhold support or reduce confidence; do not treat absence of evidence as direct refutation unless the evidence should necessarily exist.',
      C: ['false(claim)', 'contradicted_by(record,claim)', 'unverified(claim)', 'debunked(claim)']
    },
    {
      id: 'op_false_claim',
      operator: 'false(claim)',
      name: 'false',
      group: 'closure_dismissal',
      surface_terms: ['is false', 'claim false', 'false claim', 'rated false', 'marked false'],
      P: ['falsity_claim_pressure', 'closure_pressure'],
      G: 'A falsity claim is legitimate only when the exact claim is contradicted by evidence or fails under agreed definitions and scope.',
      E: ['Extract the exact claim.', 'Identify the falsifying evidence.', 'Check definitions, scope, date, and possible weaker interpretation.'],
      A: 'Hold as falsity-claim pressure until the contradiction or failed condition is inspectable.',
      C: ['lacks_evidence(claim)', 'challenged(claim)', 'misleading(claim)', 'debunked(claim)']
    },
    {
      id: 'op_rated_source_claim',
      operator: 'rated(source,claim)',
      name: 'rated',
      group: 'source_trust',
      surface_terms: ['rated', 'rating', 'marked', 'labeled'],
      P: ['rating_pressure', 'certification_pressure', 'source_trust_pressure'],
      G: 'A rating is legitimate only as a review output; the rating must be backed by inspectable reasoning and evidence.',
      E: ['Identify who rated it.', 'Identify the exact rating category.', 'Inspect the evidence and reasoning behind the rating.'],
      A: 'Treat rating as review metadata until the evidence chain is inspected.',
      C: ['debunked(claim)', 'false(claim)', 'certified(source)', 'fact-checker(source)']
    },
    {
      id: 'op_reviewer_source',
      operator: 'reviewer(source)',
      name: 'reviewer',
      group: 'source_trust',
      surface_terms: ['reviewer', 'review panel', 'review board'],
      P: ['reviewer_status_pressure', 'source_trust_pressure', 'authority_transfer_pressure'],
      G: 'Reviewer status is legitimate as role metadata; it does not establish the reviewed claim without reasoning and evidence.',
      E: ['Identify the reviewer.', 'Identify review role and scope.', 'Inspect reasoning, criteria, and evidence.'],
      A: 'Treat reviewer status as metadata and ask for review evidence.',
      C: ['expert(source)', 'certified(source)', 'fact-checker(source)', 'primary_document(evidence)']
    },
    {
      id: 'op_contradicted_by_record_claim',
      operator: 'contradicted_by(record,claim)',
      name: 'contradicted_by',
      group: 'evidence_contact',
      surface_terms: ['contradicted by', 'was contradicted by', 'is contradicted by'],
      P: ['contradiction_pressure', 'evidence_contact_pressure'],
      G: 'A record legitimately contradicts a claim only when both cannot be true under the same definitions, date, and scope.',
      E: ['Identify the record.', 'State the exact claim.', 'Check definitions, timing, and possible reconciliation.'],
      A: 'Preserve contradiction pressure and require scope check before resolution.',
      C: ['challenged(claim)', 'lacks_evidence(claim)', 'qualifies(record,claim)', 'different_scope(record,claim)']
    }
  ]);

  function extendedGrammar() {
    const grammar = base.defaultGrammar();
    const existing = new Set(asArray(grammar.operators).map(op => lower(op.id)));
    EXTRA_OPERATORS.forEach(op => { if (!existing.has(lower(op.id))) grammar.operators.push(clone(op)); });

    // Improve existing inflection coverage without changing the original source file.
    const byName = {};
    grammar.operators.forEach(op => { byName[lower(op.name)] = op; });
    if (byName.contradicts) byName.contradicts.surface_terms = unique(asArray(byName.contradicts.surface_terms).concat(['contradicted', 'contradicted by', 'was contradicted by']));
    if (byName.fact_checker) byName.fact_checker.surface_terms = unique(asArray(byName.fact_checker.surface_terms).concat(['fact-checker', 'fact checker', 'factchecked']));
    if (byName.certified) byName.certified.surface_terms = unique(asArray(byName.certified.surface_terms).concat(['certified reviewer', 'certified source']));
    return grammar;
  }

  function withGrammar(fnName) {
    return function () {
      const args = Array.prototype.slice.call(arguments);
      if (args.length < 2 || !args[args.length - 1] || typeof args[args.length - 1] === 'string') {
        return base[fnName].apply(base, args);
      }
      return base[fnName].apply(base, args);
    };
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
    d.patch_adds_contrast_operators_from_workbench_feedback = true;
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PRESSURES: Object.freeze(unique(asArray(base.PRESSURES).concat(EXTRA_PRESSURES))),
    EXTRA_OPERATORS,
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
    // keep original helpers unchanged where no default grammar issue exists
    parseSignature: base.parseSignature,
    validateOperator: base.validateOperator,
    algebraLine: base.algebraLine,
    corpusOperatorToGrammarCandidate: base.corpusOperatorToGrammarCandidate,
    corpusEntriesToGrammarCandidates: base.corpusEntriesToGrammarCandidates
  }));
})(typeof window !== 'undefined' ? window : globalThis);
