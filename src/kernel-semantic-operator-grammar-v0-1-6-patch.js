/* 42ndMind Semantic Operator Grammar v0.1.6 Patch
 * Adds evidence-contact contrast coverage from the contrast-gap planner:
 * different_scope(record,claim), qualifies(record,claim), narrows(record,claim),
 * dataset(evidence), and footnote(evidence).
 *
 * This teaches apparent contradiction vs scope mismatch vs qualification.
 * No truth decision, belief movement, doctrine promotion, or source write occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.6';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item); const key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  const EXTRA_PRESSURES = Object.freeze([
    'scope_mismatch_pressure',
    'qualification_pressure',
    'narrowing_pressure'
  ]);

  const EXTRA_OPERATORS = Object.freeze([
    {
      id: 'op_different_scope_record_claim',
      operator: 'different_scope(record,claim)',
      name: 'different_scope',
      group: 'evidence_contact',
      surface_terms: [
        'different scope',
        'different month',
        'different date',
        'different timeframe',
        'national totals',
        'one province',
        'claim refers to',
        'refers to a different',
        'covers national totals'
      ],
      P: ['scope_mismatch_pressure', 'uncertainty_calibration_pressure'],
      G: 'Different-scope pressure is legitimate when the record and claim use different dates, populations, geography, definitions, or aggregation levels; it explains apparent contradiction without erasing either side.',
      E: ['Identify the record scope.', 'Identify the claim scope.', 'Compare date, geography, population, definition, and aggregation level.', 'Check whether the apparent contradiction disappears under scoped readings.'],
      A: 'Treat as scope-mismatch pressure; do not convert to contradiction or falsity without matching scope.',
      C: ['contradicted_by(record,claim)', 'qualifies(record,claim)', 'weakens(record,claim)']
    },
    {
      id: 'op_qualifies_record_claim',
      operator: 'qualifies(record,claim)',
      name: 'qualifies',
      group: 'evidence_contact',
      surface_terms: [
        'qualifies the claim',
        'qualifies',
        'does not contradict',
        'but does not contradict',
        'narrowed by',
        'qualified by'
      ],
      P: ['qualification_pressure', 'uncertainty_calibration_pressure'],
      G: 'Qualifying evidence is legitimate when it narrows, limits, or conditions a claim without making the claim and record mutually exclusive.',
      E: ['Identify the original claim.', 'Identify the qualifying record.', 'State what part is narrowed, limited, or conditioned.', 'Check whether contradiction remains after qualification.'],
      A: 'Preserve qualification pressure and avoid false contradiction closure.',
      C: ['contradicted_by(record,claim)', 'different_scope(record,claim)', 'weakens(record,claim)', 'narrows(record,claim)']
    },
    {
      id: 'op_narrows_record_claim',
      operator: 'narrows(record,claim)',
      name: 'narrows',
      group: 'evidence_contact',
      surface_terms: [
        'narrows the claim',
        'narrows claim',
        'narrowed the claim',
        'to march only',
        'march only',
        'only applies to'
      ],
      P: ['narrowing_pressure', 'qualification_pressure'],
      G: 'Narrowing is legitimate when a record restricts the claim by time, place, actor, population, or condition.',
      E: ['Identify the broader claim.', 'Identify the narrowed scope.', 'Check whether the narrowed version remains supported.'],
      A: 'Convert broad claim pressure into bounded/narrowed claim pressure.',
      C: ['qualifies(record,claim)', 'different_scope(record,claim)', 'false(claim)']
    },
    {
      id: 'op_dataset_evidence',
      operator: 'dataset(evidence)',
      name: 'dataset',
      group: 'evidence_contact',
      surface_terms: ['dataset', 'data set', 'data table'],
      P: ['evidence_contact_pressure'],
      G: 'Dataset evidence is legitimate only after definitions, scope, exclusions, cleaning, and aggregation level are understood.',
      E: ['Identify the dataset.', 'Check definitions, exclusions, cleaning, and aggregation level.', 'Map the relevant fields to the claim.'],
      A: 'Treat dataset contact as bounded evidence pressure after scope/method review.',
      C: ['raw_data(evidence)', 'published_summary(source)', 'different_scope(record,claim)']
    },
    {
      id: 'op_footnote_evidence',
      operator: 'footnote(evidence)',
      name: 'footnote',
      group: 'evidence_contact',
      surface_terms: ['footnote', 'note says', 'note states'],
      P: ['evidence_contact_pressure', 'qualification_pressure'],
      G: 'Footnote evidence is legitimate as qualifying context only when it directly limits, defines, or conditions the relevant claim.',
      E: ['Identify the footnote.', 'Map it to the claim.', 'Check whether it narrows, defines, or merely comments on the claim.'],
      A: 'Treat footnote as qualifying evidence, not automatic contradiction.',
      C: ['qualifies(record,claim)', 'narrows(record,claim)', 'different_scope(record,claim)']
    }
  ]);

  function extendedGrammar() {
    const grammar = base.defaultGrammar();
    const existing = new Set(asArray(grammar.operators).map(op => lower(op.id)));
    EXTRA_OPERATORS.forEach(op => { if (!existing.has(lower(op.id))) grammar.operators.push(clone(op)); });

    const byName = {};
    grammar.operators.forEach(op => { byName[lower(op.name)] = op; });
    if (byName.transcript) byName.transcript.surface_terms = unique(asArray(byName.transcript.surface_terms).concat(['the transcript']));
    if (byName.raw_data) byName.raw_data.surface_terms = unique(asArray(byName.raw_data.surface_terms).filter(term => lower(term) !== 'dataset'));
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
    d.patch_adds_scope_and_qualification_contrast_coverage = true;
    d.patch_preserves_qualification_without_false_contradiction = true;
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PRESSURES: Object.freeze(unique(asArray(base.PRESSURES).concat(EXTRA_PRESSURES))),
    EXTRA_OPERATORS_V016: EXTRA_OPERATORS,
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
