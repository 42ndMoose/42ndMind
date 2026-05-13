/* 42ndMind Lexical Uncertainty v0.4.1 patch
 *
 * Fix:
 * v0.4.0 detected pure acronyms like IAPWS, but missed hyphenated technical
 * acronym compounds like CDA-EOS because acronym detection required only A-Z.
 *
 * v0.4.1 treats uppercase acronym compounds with hyphens as unknown terms
 * unless they are known or supplied in the glossary.
 */
(function (global) {
  'use strict';
  if (!global.KernelLexicalUncertaintyV04) return;

  const BASE = global.KernelLexicalUncertaintyV04;
  const VERSION = '0.4.1';

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

  function glossaryMap(options) {
    const glossary = options && options.glossary || {};
    const out = {};
    Object.keys(glossary).forEach(k => { out[k.toLowerCase()] = glossary[k]; });
    return out;
  }

  function knownSet(options) {
    return new Set(unique(BASE.DEFAULT_KNOWN_TERMS.concat(asArray(options && options.known_terms))).map(t => t.toLowerCase()));
  }

  function isKnown(token, options) {
    const k = lower(token);
    return knownSet(options).has(k) || Object.prototype.hasOwnProperty.call(glossaryMap(options), k);
  }

  function isAcronymOrCompound(token) {
    const t = text(token);
    return /^[A-Z]{2,8}$/.test(t) || /^[A-Z]{2,8}(?:-[A-Z]{2,8})+$/.test(t);
  }

  function getInputText(input) {
    if (typeof input === 'string') return input;
    if (!input || typeof input !== 'object') return '';
    return text(input.text || input.claim || input.content || input.raw_text || input.title || input.label || JSON.stringify(input));
  }

  function tokenize(raw) {
    return unique(text(raw).match(/[A-Za-z][A-Za-z0-9_-]{1,}/g) || []);
  }

  function patchedUnknownTerms(raw, options) {
    const explicit = asArray(options && options.unknown_terms);
    const tokens = tokenize(raw);
    const acronyms = tokens.filter(t => isAcronymOrCompound(t) && !isKnown(t, options));
    const quoted = unique((text(raw).match(/["'“”‘’]([^"'“”‘’]{2,40})["'“”‘’]/g) || []).map(s => s.replace(/["'“”‘’]/g, ''))).filter(t => !isKnown(t, options));
    return unique(explicit.concat(acronyms).concat(quoted));
  }

  function analyze(input, options) {
    const report = BASE.analyze(input, options || {});
    const raw = getInputText(input);
    const unknown = patchedUnknownTerms(raw, options || {});
    const existingUnknown = report.unresolved_terms.filter(t => t.type === 'unknown_term').map(t => t.term);
    const missing = unknown.filter(t => !existingUnknown.map(lower).includes(lower(t)));

    if (missing.length) {
      missing.forEach(term => {
        report.unresolved_terms.unshift({
          term,
          type: 'unknown_term',
          reason: 'Term is unknown to the current kernel/glossary or was explicitly marked unknown.',
          definition_status: 'missing',
          epistemic_effect: 'definition_needed_before_strong_claim_pressure'
        });
      });
      report.counts.unknown_terms += missing.length;
      report.counts.unresolved_terms += missing.length;
      report.claim_pressure_allowed = false;
      if (report.decision !== BASE.DECISIONS.REQUEST_EXTRACTION) report.decision = BASE.DECISIONS.HOLD_FOR_DEFINITION;
      report.recommended_effect = 'hold_strong_claim_pressure_until_unknown_terms_are_defined_in_context';
      report.extractor_request = BASE.buildExtractorRequest(report.raw_text, report.unresolved_terms);
      report.lexical_pressure_score = Math.min(1, Number(report.lexical_pressure_score || 0) + missing.length * 0.28);
      report.v041_patch = {
        applied: true,
        rule: 'hyphenated_uppercase_acronym_compounds_are_unknown_terms',
        added_unknown_terms: missing
      };
    } else {
      report.v041_patch = { applied: false, rule: 'base_report_retained' };
    }
    report.packet_version = VERSION;
    return report;
  }

  function attachToCommand(command, reportInput, options) {
    const report = reportInput && reportInput.packet_type === '42ndMind_lexical_uncertainty_report_v0_4' ? reportInput : analyze(reportInput || command, options || {});
    return BASE.attachToCommand(command, report, options || {});
  }

  function applyDefinition(reportInput, definitions, options) {
    const baseReport = reportInput && reportInput.packet_type === '42ndMind_lexical_uncertainty_report_v0_4' ? reportInput : analyze(reportInput, options || {});
    const glossary = Object.assign({}, (options && options.glossary) || {});
    Object.keys(definitions || {}).forEach(k => { glossary[k] = definitions[k]; });
    return analyze(baseReport.raw_text, Object.assign({}, options || {}, { glossary }));
  }

  global.KernelLexicalUncertaintyV04 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    analyze,
    attachToCommand,
    applyDefinition
  }));
})(typeof window !== 'undefined' ? window : globalThis);
