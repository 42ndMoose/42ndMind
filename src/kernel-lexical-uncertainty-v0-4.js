/* 42ndMind Lexical Uncertainty v0.4
 *
 * Purpose:
 * Detect unknown, ambiguous, acronymic, or implication-heavy terms before the
 * kernel allows a claim to carry strong epistemic pressure.
 *
 * This module does not define words by itself, decide truth, import commands,
 * or move belief. It produces definition-needed pressure and a structured
 * extractor request that a human, LLM, dictionary, glossary, or primary source
 * can answer separately.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';

  const DECISIONS = Object.freeze({
    LEXICAL_CLEAR: 'LEXICAL_CLEAR',
    CLARIFY_TERMS: 'CLARIFY_TERMS',
    HOLD_FOR_DEFINITION: 'HOLD_FOR_DEFINITION',
    REQUEST_EXTRACTION: 'REQUEST_EXTRACTION'
  });

  const DEFAULT_KNOWN_TERMS = Object.freeze([
    'claim','source','evidence','belief','truth','false','support','attack','question','probability','confidence','contradiction','motive','intent','coordination','direct','indirect','metadata','certification','primary','document','record','dataset','transcript','official','legacy','media','fact','check','verified','reviewed','unreviewed','kernel','epistemic','memory','pressure','archive','deleted','candidate','runtime','sandbox','patch','bridge','governor','preflight','trust','prior','provenance','import','export','command','definition','term','word','context','meaning'
  ]);

  const IMPLICATION_HEAVY_TERMS = Object.freeze([
    'misinformation','disinformation','malinformation','extremist','radical','hate','harmful','unsafe','dangerous','debunked','conspiracy','propaganda','trusted','certified','verified','independent','authoritative','expert','consensus','science-backed','anti-science','far-right','far-left','racist','sexist','phobic','terrorist','coordinated','collusion','motive','intent','agenda','misleading','falsehood','fact-check','factchecker','fact-checker','ifcn'
  ]);

  const AMBIGUOUS_REFERENCE_TERMS = Object.freeze(['it','this','that','they','them','those','these','someone','something','people','theyre','their','there','institution','apparatus','network','actor','bad actor','source','they say']);

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function unique(items) {
    const seen = new Set();
    const out = [];
    asArray(items).forEach(item => {
      const t = text(item);
      const k = t.toLowerCase();
      if (t && !seen.has(k)) { seen.add(k); out.push(t); }
    });
    return out;
  }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function round(value) { return Number(clamp(value, 0, 1).toFixed(3)); }

  function getInputText(input) {
    if (typeof input === 'string') return input;
    if (!input || typeof input !== 'object') return '';
    return text(input.text || input.claim || input.content || input.raw_text || input.title || input.label || JSON.stringify(input));
  }

  function tokenize(raw) {
    return unique(text(raw).match(/[A-Za-z][A-Za-z0-9_-]{1,}/g) || []);
  }

  function knownSet(options) {
    return new Set(unique(DEFAULT_KNOWN_TERMS.concat(asArray(options && options.known_terms))).map(t => t.toLowerCase()));
  }

  function glossaryMap(options) {
    const glossary = options && options.glossary || {};
    const out = {};
    Object.keys(glossary).forEach(k => { out[k.toLowerCase()] = glossary[k]; });
    return out;
  }

  function isAcronym(token) {
    return /^[A-Z]{2,8}$/.test(text(token));
  }

  function isKnown(token, options) {
    const k = lower(token);
    return knownSet(options).has(k) || Object.prototype.hasOwnProperty.call(glossaryMap(options), k);
  }

  function detectImplicationHeavy(raw) {
    const hay = lower(raw);
    return IMPLICATION_HEAVY_TERMS.filter(term => hay.includes(term));
  }

  function detectAmbiguous(raw) {
    const hay = ` ${lower(raw).replace(/[^a-z0-9_-]+/g, ' ')} `;
    return AMBIGUOUS_REFERENCE_TERMS.filter(term => hay.includes(` ${term} `));
  }

  function detectUnknownTerms(raw, options) {
    const explicit = asArray(options && options.unknown_terms);
    const tokens = tokenize(raw);
    const acronyms = tokens.filter(t => isAcronym(t) && !isKnown(t, options));
    const quoted = unique((text(raw).match(/["'“”‘’]([^"'“”‘’]{2,40})["'“”‘’]/g) || []).map(s => s.replace(/["'“”‘’]/g, ''))).filter(t => !isKnown(t, options));
    return unique(explicit.concat(acronyms).concat(quoted));
  }

  function termRecords(terms, type, reason) {
    return unique(terms).map(term => ({ term, type, reason, definition_status:'missing', epistemic_effect:'definition_needed_before_strong_claim_pressure' }));
  }

  function analyze(input, options = {}) {
    const raw = getInputText(input);
    const unknown = detectUnknownTerms(raw, options);
    const implication = detectImplicationHeavy(raw).filter(t => !unknown.map(lower).includes(lower(t)));
    const ambiguous = detectAmbiguous(raw).filter(t => !unknown.map(lower).includes(lower(t)) && !implication.map(lower).includes(lower(t)));
    const glossary = glossaryMap(options);
    const defined = tokenize(raw).filter(t => glossary[lower(t)]).map(t => ({ term:t, definition:glossary[lower(t)], definition_status:'provided_by_glossary', epistemic_effect:'definition_available_but_claim_still_requires_evidence' }));

    const unresolved_terms = []
      .concat(termRecords(unknown, 'unknown_term', 'Term is unknown to the current kernel/glossary or was explicitly marked unknown.'))
      .concat(termRecords(implication, 'implication_heavy_term', 'Term can alter implication, blame, motive, trust, or claim strength.'))
      .concat(termRecords(ambiguous, 'ambiguous_reference', 'Reference may be unclear without resolving what it points to.'));

    let decision = DECISIONS.LEXICAL_CLEAR;
    if (unknown.length) decision = DECISIONS.HOLD_FOR_DEFINITION;
    else if (implication.length || ambiguous.length) decision = DECISIONS.CLARIFY_TERMS;
    if (options.request_extraction === true && unresolved_terms.length) decision = DECISIONS.REQUEST_EXTRACTION;

    const pressure = round(Math.min(1, unknown.length * 0.28 + implication.length * 0.16 + ambiguous.length * 0.1));

    return {
      packet_type: '42ndMind_lexical_uncertainty_report_v0_4',
      packet_version: VERSION,
      created_at: now(),
      decision,
      raw_text: raw,
      unresolved_terms,
      defined_terms: defined,
      counts: {
        unknown_terms: unknown.length,
        implication_heavy_terms: implication.length,
        ambiguous_references: ambiguous.length,
        defined_terms: defined.length,
        unresolved_terms: unresolved_terms.length
      },
      lexical_pressure_score: pressure,
      claim_pressure_allowed: unresolved_terms.length === 0,
      recommended_effect: recommendedEffect(decision),
      extractor_request: unresolved_terms.length ? buildExtractorRequest(raw, unresolved_terms) : null,
      belief_movement: 'none',
      doctrine: doctrine(),
      raw: { input: clone(input || {}), options: clone(options || {}) }
    };
  }

  function recommendedEffect(decision) {
    if (decision === DECISIONS.HOLD_FOR_DEFINITION) return 'hold_strong_claim_pressure_until_unknown_terms_are_defined_in_context';
    if (decision === DECISIONS.CLARIFY_TERMS) return 'allow_only_bounded_pressure_and_request_term_clarification';
    if (decision === DECISIONS.REQUEST_EXTRACTION) return 'send_extractor_request_to_llm_human_or_glossary_and_recheck_before_import';
    return 'continue_claim_level_evaluation';
  }

  function buildExtractorRequest(raw, terms) {
    return {
      packet_type: '42ndMind_lexical_definition_request_v0_4',
      target: 'human_or_llm_extractor',
      raw_text: raw,
      terms: asArray(terms).map(t => ({
        term: t.term,
        type: t.type,
        request: 'Define this term in the exact context of the claim. Give possible meanings, the most likely intended meaning, and how each meaning would change the claim implication.'
      })),
      required_output_shape: {
        term: 'string',
        context_definition: 'string',
        possible_meanings: ['string'],
        most_likely_meaning: 'string',
        implication_effect: 'string',
        confidence: 'number_0_to_1',
        evidence_needed_to_lock_definition: ['string']
      },
      doctrine: {
        extractor_output_is_candidate_only: true,
        definition_does_not_decide_truth: true,
        ambiguous_terms_block_fake_certainty: true
      }
    };
  }

  function attachToCommand(command = {}, reportInput, options = {}) {
    const report = reportInput && reportInput.packet_type === '42ndMind_lexical_uncertainty_report_v0_4' ? reportInput : analyze(reportInput || command, options);
    const cloned = clone(command || {});
    if (!cloned.meta) cloned.meta = {};
    cloned.meta.lexical_uncertainty_report = report;
    cloned.meta.lexical_decision = report.decision;
    cloned.meta.lexical_pressure_score = report.lexical_pressure_score;

    if (Array.isArray(cloned.commands)) {
      cloned.commands = cloned.commands.map(cmd => {
        const next = clone(cmd);
        const packet = next.packet || next.extraction_packet;
        if (packet && typeof packet === 'object') {
          if (!Array.isArray(packet.questions)) packet.questions = [];
          report.unresolved_terms.forEach(term => {
            packet.questions.push({
              id: `lexical_definition_needed_${term.term.replace(/[^a-z0-9_]+/gi, '_').slice(0, 60)}`,
              text: `Define term in context before strong import: ${term.term}`,
              question_type: 'lexical_definition_needed',
              term: term.term,
              term_type: term.type,
              metadata_only: true
            });
          });
          if (!packet.meta) packet.meta = {};
          packet.meta.lexical_uncertainty_decision = report.decision;
          packet.meta.lexical_pressure_score = report.lexical_pressure_score;
          packet.meta.claim_pressure_allowed_by_lexical_layer = report.claim_pressure_allowed;
        }
        return next;
      });
    }

    return {
      packet_type: '42ndMind_lexical_uncertainty_attached_command_v0_4',
      packet_version: VERSION,
      created_at: now(),
      command: cloned,
      lexical_uncertainty_report: report,
      import_executed: false,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function applyDefinition(reportInput, definitions = {}, options = {}) {
    const report = reportInput && reportInput.packet_type === '42ndMind_lexical_uncertainty_report_v0_4' ? reportInput : analyze(reportInput, options);
    const glossary = Object.assign({}, glossaryMap(options));
    Object.keys(definitions || {}).forEach(k => { glossary[k.toLowerCase()] = definitions[k]; });
    return analyze(report.raw_text, Object.assign({}, options, { glossary }));
  }

  function doctrine() {
    return {
      lexical_layer_does_not_decide_truth: true,
      unknown_terms_block_fake_certainty: true,
      definitions_are_candidate_metadata_until_reviewed: true,
      llm_is_extractor_not_authority: true,
      claim_level_evidence_still_required_after_definition: true,
      belief_movement: 'none'
    };
  }

  function sampleInput(kind) {
    if (kind === 'unknown') return 'The IFCN-certified article debunked the malinformation network, so the claim is resolved.';
    if (kind === 'ambiguous') return 'They said this was verified, but that source changed the implication.';
    if (kind === 'technical') return 'The CDA-EOS model changes the interpretation of the IAPWS baseline.';
    if (kind === 'clear') return 'The primary document supports the claim, but more evidence is still required.';
    return sampleInput('unknown');
  }

  global.KernelLexicalUncertaintyV04 = Object.freeze({
    VERSION,
    DECISIONS,
    DEFAULT_KNOWN_TERMS,
    IMPLICATION_HEAVY_TERMS,
    analyze,
    attachToCommand,
    applyDefinition,
    buildExtractorRequest,
    tokenize,
    sampleInput,
    doctrine
  });
})(typeof window !== 'undefined' ? window : globalThis);
