/* 42ndMind Semantic Operator Grammar v0.1.7 Patch
 * Adds closure/source/evidence gap coverage from the contrast-gap planner:
 * misleading(claim), disputed(claim), clip(evidence), hearsay(source),
 * summary(source), unverified(claim), not_disproven(claim), and omission(record,claim).
 *
 * No truth decision, belief movement, doctrine promotion, or source write occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorGrammarV01;
  if (!base) return;

  const VERSION = '0.1.7';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item); const key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  const EXTRA_PRESSURES = Object.freeze([
    'misleading_pressure',
    'omission_pressure',
    'partial_evidence_pressure',
    'hearsay_pressure',
    'unverified_pressure',
    'not_falsified_pressure'
  ]);

  const EXTRA_OPERATORS = Object.freeze([
    {
      id: 'op_misleading_claim',
      operator: 'misleading(claim)',
      name: 'misleading',
      group: 'closure_dismissal',
      surface_terms: ['misleading', 'claim is misleading', 'headline is misleading'],
      P: ['misleading_pressure', 'uncertainty_calibration_pressure'],
      G: 'Misleading language is legitimate when framing, omission, scope distortion, or presentation creates a false impression without requiring direct falsity.',
      E: ['Identify the exact claim or presentation being called misleading.', 'Identify the omitted, narrowed, or distorted context.', 'Separate misleading framing from direct falsity.'],
      A: 'Treat as misleading/framing pressure; do not convert to false unless direct contradiction is shown.',
      C: ['false(claim)', 'lacks_evidence(claim)', 'disputed(claim)', 'unverified(claim)']
    },
    {
      id: 'op_omission_record_claim',
      operator: 'omission(record,claim)',
      name: 'omission',
      group: 'evidence_contact',
      surface_terms: ['omits', 'omitted', 'leaves out', 'left out', 'leaves out the qualifying', 'omits the qualifying'],
      P: ['omission_pressure', 'qualification_pressure', 'misleading_pressure'],
      G: 'Omission pressure is legitimate when a relevant qualifying record or context is left out of the claim presentation.',
      E: ['Identify what was omitted.', 'Check whether the omitted context is relevant to the claim.', 'Check whether the omission changes support, scope, or interpretation.'],
      A: 'Treat omission as qualification/misleading pressure, not automatic falsity.',
      C: ['misleading(claim)', 'qualifies(record,claim)', 'narrows(record,claim)', 'false(claim)']
    },
    {
      id: 'op_clip_evidence',
      operator: 'clip(evidence)',
      name: 'clip',
      group: 'evidence_contact',
      surface_terms: ['clip', 'the clip', 'clip shows', 'only part of the exchange', 'part of the exchange'],
      P: ['partial_evidence_pressure', 'evidence_contact_pressure'],
      G: 'Clip evidence is legitimate only as partial evidence until the fuller record and surrounding context are checked.',
      E: ['Identify the clip source.', 'Identify what part of the record is missing.', 'Compare the clip to the full record before support or contradiction movement.'],
      A: 'Treat clip as partial evidence; ask for the full record before strong support or contradiction.',
      C: ['transcript(evidence)', 'summary(source)', 'hearsay(source)', 'different_scope(record,claim)']
    },
    {
      id: 'op_disputed_claim',
      operator: 'disputed(claim)',
      name: 'disputed',
      group: 'closure_dismissal',
      surface_terms: ['disputed', 'is disputed', 'claim is disputed', 'result is disputed'],
      P: ['challenge_pressure', 'uncertainty_calibration_pressure'],
      G: 'Disputed language is legitimate as contestation pressure, but it is not the same as refutation, contradiction, or falsity.',
      E: ['Identify who disputes the claim.', 'Identify the reason or evidence for the dispute.', 'Check whether the dispute weakens, contradicts, or merely contests the claim.'],
      A: 'Preserve dispute status; do not collapse disputed into false or debunked.',
      C: ['debunked(claim)', 'false(claim)', 'challenged(claim)', 'contradicted_by(record,claim)']
    },
    {
      id: 'op_hearsay_source',
      operator: 'hearsay(source)',
      name: 'hearsay',
      group: 'source_trust',
      surface_terms: ['hearsay', 'secondhand', 'heard the claim secondhand', 'without seeing the document', 'repeated hearsay'],
      P: ['hearsay_pressure', 'low_trust_prior_pressure', 'source_trust_pressure'],
      G: 'Hearsay is legitimate only as source-distance pressure; it does not prove or disprove the underlying claim without primary evidence.',
      E: ['Identify the original source if possible.', 'Separate repeated claim from direct evidence.', 'Seek the document, record, or firsthand testimony.'],
      A: 'Lower source-contact confidence and ask for primary evidence.',
      C: ['primary_document(evidence)', 'transcript(evidence)', 'named_source(source)', 'anonymous_social_post(source)']
    },
    {
      id: 'op_summary_source',
      operator: 'summary(source)',
      name: 'summary',
      group: 'source_trust',
      surface_terms: ['summary', 'the summary', 'summary leaves out', 'summary simplifies', 'simplifies the record'],
      P: ['interpretation_layer_pressure', 'source_trust_pressure'],
      G: 'A summary is an interpretation or compression layer and must be checked against the underlying record before claim movement.',
      E: ['Identify the underlying record.', 'Check what the summary includes or omits.', 'Compare the summary to the exact record text or data.'],
      A: 'Treat summary as an interpretation layer until checked against the record.',
      C: ['primary_document(evidence)', 'transcript(evidence)', 'published_summary(source)', 'quote(source,claim)']
    },
    {
      id: 'op_unverified_claim',
      operator: 'unverified(claim)',
      name: 'unverified',
      group: 'uncertainty_calibration',
      surface_terms: ['unverified', 'remains unverified', 'not verified', 'not yet verified'],
      P: ['unverified_pressure', 'uncertainty_calibration_pressure'],
      G: 'Unverified language is legitimate as support-withholding pressure; it is not direct falsity or contradiction.',
      E: ['Identify what verification would require.', 'Check whether verification was attempted in the right place.', 'Separate not verified from false.'],
      A: 'Withhold support while preserving unresolved status.',
      C: ['lacks_evidence(claim)', 'false(claim)', 'debunked(claim)', 'disputed(claim)']
    },
    {
      id: 'op_not_disproven_claim',
      operator: 'not_disproven(claim)',
      name: 'not_disproven',
      group: 'uncertainty_calibration',
      surface_terms: ['not been disproven', 'not disproven', 'has not been disproven', 'has not been dis-proven'],
      P: ['not_falsified_pressure', 'uncertainty_calibration_pressure'],
      G: 'Not-disproven language is legitimate only as absence of refutation; it does not establish that the claim is true.',
      E: ['Identify what would disprove the claim.', 'Check whether contradictory evidence exists.', 'Separate not disproven from supported.'],
      A: 'Preserve not-falsified status without promoting the claim to supported.',
      C: ['proved(evidence,claim)', 'disproven(claim)', 'false(claim)', 'unverified(claim)']
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
    d.patch_adds_remaining_gap_operators = true;
    d.patch_preserves_weaker_status_against_false_closure = true;
    return d;
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PRESSURES: Object.freeze(unique(asArray(base.PRESSURES).concat(EXTRA_PRESSURES))),
    EXTRA_OPERATORS_V017: EXTRA_OPERATORS,
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
