/* 42ndMind Semantic Operator Grammar v0.1.9 Patch
 * Adds coverage for template-review-planner suggested sentences.
 *
 * Focus:
 * - motive attribution vs observed outcome
 * - chart/summary as interpretation layer
 * - definition/scope mismatch around contradiction
 * - vague/unclear statement coverage
 * - obvious/conclusion confidence marker coverage
 *
 * No truth decision, belief movement, doctrine promotion, or source write occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.9';

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
      id: 'op_chart_source',
      operator: 'chart(source)',
      name: 'chart',
      group: 'source_trust',
      surface_terms: ['chart suggests', 'the chart', 'chart'],
      P: ['interpretation_layer_pressure', 'source_trust_pressure'],
      G: 'A chart is an interpretation or presentation layer and must be checked against the underlying data, definitions, and scale before claim movement.',
      E: ['Identify the chart.', 'Identify the underlying data.', 'Check definitions, scale, exclusions, and visual framing.'],
      A: 'Treat chart evidence as an interpretation layer until checked against raw data or primary records.',
      C: ['raw_data(evidence)', 'summary(source)', 'published_summary(source)']
    }
  ]);

  function extendedGrammar() {
    const grammar = base.defaultGrammar();
    const existing = new Set(asArray(grammar.operators).map(op => lower(op.id)));
    EXTRA_OPERATORS.forEach(op => { if (!existing.has(lower(op.id))) grammar.operators.push(clone(op)); });

    const byName = {};
    grammar.operators.forEach(op => { byName[lower(op.name)] = op; });

    if (byName.ulterior_motive_attribution) {
      byName.ulterior_motive_attribution.surface_terms = unique(asArray(byName.ulterior_motive_attribution.surface_terms).concat([
        'attributed a motive',
        'critic attributed a motive',
        'record only shows an outcome',
        'only shows an outcome',
        'motive, but the record only shows an outcome'
      ]));
    }

    if (byName.different_scope) {
      byName.different_scope.surface_terms = unique(asArray(byName.different_scope.surface_terms).concat([
        'different definition',
        'uses a different definition',
        'definitions must match',
        'same date and scope',
        'same definition',
        'definitions, date, and scope'
      ]));
    }

    if (byName.contradicted_by) {
      byName.contradicted_by.surface_terms = unique(asArray(byName.contradicted_by.surface_terms).concat([
        'appears to contradict',
        'record appears to contradict',
        'contradict the claim',
        'contradicts the claim only if'
      ]));
    }

    if (byName.contradicts) {
      byName.contradicts.surface_terms = unique(asArray(byName.contradicts.surface_terms).concat([
        'appears to contradict',
        'contradict the claim',
        'contradicts the claim only if'
      ]));
    }

    if (byName.obfuscates) {
      byName.obfuscates.surface_terms = unique(asArray(byName.obfuscates.surface_terms).concat([
        'too vague',
        'too vague to identify',
        'vague to identify the exact claim',
        'exact claim being made',
        'evidence burden unclear'
      ]));
    }

    if (byName.clearly) {
      byName.clearly.surface_terms = unique(asArray(byName.clearly.surface_terms).concat([
        'obvious',
        'conclusion is obvious',
        'confidence marker',
        'does not replace the missing record'
      ]));
    }

    if (byName.obviously) {
      byName.obviously.surface_terms = unique(asArray(byName.obviously.surface_terms).concat([
        'obvious',
        'conclusion is obvious',
        'confidence marker',
        'does not replace the missing record'
      ]));
    }

    if (byName.summary) {
      byName.summary.surface_terms = unique(asArray(byName.summary.surface_terms).concat([
        'summary simplifies',
        'simplifies the record',
        'checked against the source document'
      ]));
    }

    if (byName.raw_data) {
      byName.raw_data.surface_terms = unique(asArray(byName.raw_data.surface_terms).concat([
        'raw data uses a different definition'
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
    d.patch_adds_template_review_sentence_coverage = true;
    d.patch_preserves_template_suggestions_as_review_targets = true;
    d.belief_movement = 'none';
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    EXTRA_OPERATORS_V019: EXTRA_OPERATORS,
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
