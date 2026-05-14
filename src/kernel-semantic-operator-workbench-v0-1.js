/* 42ndMind Semantic Operator Workbench v0.1
 * Turns pasted sentence batches into reviewable operator analyses and draft
 * semantic corpus entries using the operator grammar.
 *
 * It does not decide truth, move belief, promote doctrine, or write source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_operator_workbench_v0_1';
  const DRAFT_CORPUS_PACKET = '42ndMind_semantic_corpus_draft_v0_1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item), key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }
  function slug(value) { return lower(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'entry'; }
  function hashTiny(value) { let h = 0, s = text(value); for (let i=0;i<s.length;i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h).toString(36).slice(0, 6); }

  function doctrine() {
    return {
      workbench_outputs_are_drafts_not_doctrine: true,
      matched_operators_are_candidate_readings: true,
      legitimacy_conditions_must_be_reviewed: true,
      evidence_burden_must_remain_visible: true,
      contrast_classes_prevent_semantic_collapse: true,
      workbench_does_not_move_belief: true,
      workbench_does_not_promote_doctrine: true,
      workbench_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function grammarAvailable() {
    return !!(global.KernelSemanticOperatorGrammarV01 && typeof global.KernelSemanticOperatorGrammarV01.analyzeText === 'function');
  }

  function defaultGrammar() {
    if (!global.KernelSemanticOperatorGrammarV01 || typeof global.KernelSemanticOperatorGrammarV01.defaultGrammar !== 'function') return null;
    return global.KernelSemanticOperatorGrammarV01.defaultGrammar();
  }

  function splitInput(raw) {
    return text(raw)
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line && !/^\s*#/.test(line));
  }

  function analyzeSentence(sentence, options = {}) {
    if (!grammarAvailable()) return {
      packet_type: '42ndMind_semantic_operator_workbench_sentence_report_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: false,
      reason: 'operator_grammar_unavailable',
      sentence: text(sentence),
      match_count: 0,
      matches: [],
      pressures: [],
      evidence_burden: [],
      legitimacy_guards: [],
      contrast_classes: [],
      belief_movement: 'none',
      doctrine: doctrine()
    };

    const grammar = options.grammar || defaultGrammar();
    const matchReport = global.KernelSemanticOperatorGrammarV01.analyzeText(sentence, grammar);
    const matches = asArray(matchReport.matches).map(m => clone(m));
    const pressures = unique(matches.flatMap(m => m.pressure_vector || []));
    const evidence = unique(matches.flatMap(m => m.evidence_burden || []));
    const guards = unique(matches.map(m => m.legitimacy_guard));
    const actions = unique(matches.map(m => m.kernel_action));
    const contrasts = unique(matches.flatMap(m => m.contrast_class || []));
    const groups = unique(matches.map(m => m.group));

    return {
      packet_type: '42ndMind_semantic_operator_workbench_sentence_report_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: true,
      sentence: text(sentence),
      match_count: matches.length,
      groups,
      matches,
      pressures,
      legitimacy_guards: guards,
      evidence_burden: evidence,
      kernel_actions: actions,
      contrast_classes: contrasts,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function sourceTrustAction(pressures) {
    const p = asArray(pressures);
    if (p.includes('source_trust_pressure') || p.includes('authority_transfer_pressure') || p.includes('trust_inflation_pressure')) return 'treat source/status labels as metadata or prior pressure, not truth';
    if (p.includes('evidence_contact_pressure')) return 'inspect the evidence object directly before support/contradiction movement';
    return 'not source-driven unless sources are later attached';
  }

  function lexicalAction(report) {
    if (asArray(report.pressures).includes('ambiguity_pressure')) return 'resolve ambiguous references before strong claim pressure';
    if (asArray(report.pressures).includes('closure_pressure') || asArray(report.pressures).includes('dismissal_pressure')) return 'clarify closure/dismissal terms and extract the exact claim';
    if (asArray(report.pressures).includes('motive_agency_pressure')) return 'rewrite motive/agency language as an evidence-bounded hypothesis';
    if (asArray(report.pressures).includes('moral_risk_framing_pressure')) return 'clarify moral-risk label, harm mechanism, and criteria';
    if (asArray(report.pressures).includes('uncertainty_calibration_pressure')) return 'preserve uncertainty marker and prevent confidence inflation';
    return 'review matched semantic operators and implication-heavy terms';
  }

  function questionsForReport(report) {
    const questions = [];
    const p = asArray(report.pressures);
    if (p.includes('closure_pressure') || p.includes('dismissal_pressure')) questions.push('What exact claim is being closed, dismissed, or refuted?');
    if (p.includes('authority_transfer_pressure') || p.includes('trust_inflation_pressure')) questions.push('Is source/status being substituted for claim-level evidence?');
    if (p.includes('source_trust_pressure')) questions.push('What evidence chain does the source provide?');
    if (p.includes('ambiguity_pressure')) questions.push('Which actor, evidence object, or claim does the ambiguous reference identify?');
    if (p.includes('motive_agency_pressure')) questions.push('What direct or structured pattern evidence supports the motive/agency claim?');
    if (p.includes('direct_link_evidence_burden')) questions.push('What communication, timing, common-source, or control-channel evidence links the actors?');
    if (p.includes('evidence_contact_pressure')) questions.push('What exact passage, dataset, transcript segment, or primary record supports the claim?');
    if (p.includes('contradiction_pressure')) questions.push('Can the record and claim both be true under different definitions, dates, or scopes?');
    if (p.includes('uncertainty_calibration_pressure')) questions.push('Is the uncertainty marker being preserved in the conclusion?');
    if (p.includes('confidence_inflation_pressure')) questions.push('What remains if confidence words such as obviously or clearly are removed?');
    if (p.includes('moral_risk_framing_pressure')) questions.push('What concrete harm mechanism, criteria, likelihood, and severity are being claimed?');
    return unique(questions.length ? questions : ['What evidence would make this semantic operation legitimate?']);
  }

  function intendedMeaning(report) {
    const groups = asArray(report.groups);
    if (!report.match_count) return 'No canonical semantic operator was matched; the intended meaning needs manual review.';
    if (groups.includes('closure_dismissal')) return 'The sentence presents the dispute as closed, refuted, false, or dismissible.';
    if (groups.includes('authority_transfer')) return 'The sentence uses authority, expertise, certification, or consensus as support pressure.';
    if (groups.includes('reference_ambiguity')) return 'The sentence depends on unresolved reference that must be identified before evaluation.';
    if (groups.includes('motive_agency')) return 'The sentence attributes agency, coordination, motive, or agenda pressure.';
    if (groups.includes('source_trust')) return 'The sentence uses source class or provenance as trust pressure.';
    if (groups.includes('evidence_contact')) return 'The sentence points toward inspectable evidence or contradiction pressure.';
    if (groups.includes('uncertainty_calibration')) return 'The sentence carries uncertainty or confidence-calibration pressure.';
    if (groups.includes('moral_risk_framing')) return 'The sentence frames the claim through harm, risk, stigma, or action-justification pressure.';
    return 'The sentence contains matched semantic operators requiring review.';
  }

  function literalMeaning(sentence) {
    return `The sentence states or implies: ${text(sentence)}`;
  }

  function contrastGroup(report) {
    const groups = asArray(report.groups);
    if (groups.length === 1) return groups[0];
    if (groups.length > 1) return `mixed_${groups.slice(0, 3).join('_')}`.slice(0, 80);
    return 'manual_review_required';
  }

  function draftId(report, index, options = {}) {
    const prefix = text(options.id_prefix || 'draft_semantic');
    const first = asArray(report.matches)[0];
    const name = first ? first.name : 'unmatched';
    return `${prefix}_${slug(name)}_${String(index + 1).padStart(3, '0')}_${hashTiny(report.sentence)}`;
  }

  function entryFromReport(report, index = 0, options = {}) {
    const matches = asArray(report.matches);
    const operators = matches.map(match => ({
      operator: match.operator,
      pressure: clone(asArray(match.pressure_vector)),
      legitimacy_condition: text(match.legitimacy_guard)
    }));
    const surfaceTerms = unique(matches.flatMap(match => match.matched_terms || []).concat(matches.map(match => match.name)));
    const evidence = unique(asArray(report.evidence_burden));
    const pressures = unique(asArray(report.pressures));
    return {
      id: draftId(report, index, options),
      text: text(report.sentence),
      language: text(options.language || 'en'),
      operator_group: contrastGroup(report),
      surface_terms: surfaceTerms.length ? surfaceTerms : unique(text(report.sentence).match(/[A-Za-z][A-Za-z0-9_-]{2,}/g) || []),
      literal_meaning: text(options.literal_meaning) || literalMeaning(report.sentence),
      candidate_intended_meaning: text(options.candidate_intended_meaning) || intendedMeaning(report),
      semantic_operators: operators,
      evidence_burden: evidence.length ? evidence : ['Manually identify what evidence would make the candidate operator legitimate.'],
      expected_kernel_response: {
        lexical_action: lexicalAction(report),
        source_trust_action: sourceTrustAction(pressures),
        belief_movement: 'none_until_operator_legitimacy_conditions_are_satisfied',
        questions: questionsForReport(report)
      },
      contrast_group: contrastGroup(report),
      review_status: 'draft_candidate',
      workbench_metadata: {
        generated_by: PACKET_TYPE,
        generated_at: now(),
        match_count: report.match_count,
        pressures,
        legitimacy_guards: clone(asArray(report.legitimacy_guards)),
        kernel_actions: clone(asArray(report.kernel_actions)),
        contrast_classes: clone(asArray(report.contrast_classes)),
        requires_human_review: true
      }
    };
  }

  function analyzeBatch(raw, options = {}) {
    const sentences = Array.isArray(raw) ? raw.map(text).filter(Boolean) : splitInput(raw);
    const reports = sentences.map(sentence => analyzeSentence(sentence, options));
    return {
      packet_type: '42ndMind_semantic_operator_workbench_batch_report_v0_1',
      packet_version: VERSION,
      created_at: now(),
      sentence_count: sentences.length,
      matched_sentence_count: reports.filter(r => r.match_count > 0).length,
      unmatched_sentence_count: reports.filter(r => r.match_count === 0).length,
      reports,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function draftEntries(raw, options = {}) {
    const batch = raw && raw.packet_type === '42ndMind_semantic_operator_workbench_batch_report_v0_1' ? raw : analyzeBatch(raw, options);
    const includeUnmatched = options.include_unmatched === true;
    const selectedReports = asArray(batch.reports).filter(report => includeUnmatched || report.match_count > 0);
    const entries = selectedReports.map((report, index) => entryFromReport(report, index, options));
    return {
      packet_type: DRAFT_CORPUS_PACKET,
      packet_version: VERSION,
      created_at: now(),
      source_packet_type: batch.packet_type,
      entry_count: entries.length,
      entries,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function validateDraft(draft, options = {}) {
    const entries = asArray(draft && draft.entries);
    if (!global.KernelSemanticCorpusV01 || typeof global.KernelSemanticCorpusV01.validateCorpus !== 'function') {
      return { ok:false, reason:'semantic_corpus_validator_unavailable', entry_count:entries.length, belief_movement:'none', doctrine:doctrine() };
    }
    const corpus = {
      packet_type: global.KernelSemanticCorpusV01.PACKET_TYPE,
      packet_version: '0.1.0',
      created_at: now(),
      description: 'Workbench-generated draft corpus. Review before committing.',
      doctrine: doctrine(),
      entries: entries.map(entry => Object.assign({}, entry, { review_status: options.review_status || 'seed_candidate' }))
    };
    const validation = global.KernelSemanticCorpusV01.validateCorpus(corpus, options);
    return Object.assign({}, validation, { source_packet_type: DRAFT_CORPUS_PACKET, draft_entry_count: entries.length, reviewed_corpus_preview: corpus, belief_movement:'none', doctrine:doctrine() });
  }

  function promoteDraftToSeedCandidateCorpus(draft, options = {}) {
    const entries = asArray(draft && draft.entries).map(entry => Object.assign({}, entry, {
      review_status: options.review_status || 'seed_candidate',
      workbench_metadata: Object.assign({}, entry.workbench_metadata || {}, { promoted_to_seed_candidate_at: now() })
    }));
    return {
      packet_type: global.KernelSemanticCorpusV01 ? global.KernelSemanticCorpusV01.PACKET_TYPE : '42ndMind_semantic_seed_corpus_v0_1',
      packet_version: '0.1.0',
      created_at: now(),
      description: 'Workbench-generated seed-candidate corpus. Human review required before source commit.',
      doctrine: doctrine(),
      entries,
      belief_movement: 'none'
    };
  }

  function sampleBatch(kind) {
    if (kind === 'closure') return [
      'The claim was debunked.',
      'The claim was challenged.',
      'The claim was contradicted by the transcript.',
      'The claim lacks evidence.',
      'The claim is false.',
      'The certified reviewer rated the claim false.'
    ].join('\n');
    if (kind === 'authority') return [
      'The certified source proved the claim false.',
      'An expert said the policy works.',
      'There is a consensus, so the debate is over.',
      'The official source posted it, so it is reliable.'
    ].join('\n');
    if (kind === 'motive') return [
      'They coordinated the talking points.',
      'The media pushed that agenda on purpose.',
      'The companies colluded to suppress the story.',
      'This may indicate coordination, but it is not enough by itself.'
    ].join('\n');
    return sampleBatch('closure');
  }

  global.KernelSemanticOperatorWorkbenchV01 = Object.freeze({
    VERSION, PACKET_TYPE, DRAFT_CORPUS_PACKET,
    doctrine, grammarAvailable, splitInput, analyzeSentence, analyzeBatch,
    entryFromReport, draftEntries, validateDraft, promoteDraftToSeedCandidateCorpus,
    sampleBatch
  });
})(typeof window !== 'undefined' ? window : globalThis);
