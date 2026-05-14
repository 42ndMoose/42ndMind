/* 42ndMind Semantic Operator Workbench v0.1.1 Patch
 * Improves draft corpus entries after the first human workbench review.
 * Fixes contrast-sensitive intended meaning and questions for challenged,
 * lacks_evidence, false, rated/reviewer, and contradicted_by operators.
 * Also suppresses redundant general contradicts(record,claim) when the more
 * specific contradicted_by(record,claim) operator is present.
 *
 * Drafts remain review pressure only. No belief movement, doctrine promotion,
 * source patching, or truth decision occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorWorkbenchV01;
  if (!base) return;

  const VERSION = '0.1.1';
  const PATCH_PACKET = '42ndMind_semantic_operator_workbench_v0_1_1_patch';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item), key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }
  function slug(value) { return lower(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'entry'; }
  function hashTiny(value) { let h = 0, s = text(value); for (let i=0;i<s.length;i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h).toString(36).slice(0, 6); }

  function doctrine() {
    const d = base.doctrine ? base.doctrine() : {};
    d.patch_version = VERSION;
    d.patch_improves_contrast_sensitive_drafts = true;
    d.patch_suppresses_redundant_general_contradiction_when_specific_match_exists = true;
    d.workbench_outputs_are_drafts_not_doctrine = true;
    d.workbench_does_not_move_belief = true;
    d.workbench_does_not_promote_doctrine = true;
    d.workbench_does_not_patch_source = true;
    d.belief_movement = 'none';
    return d;
  }

  function operatorNames(report) { return asArray(report && report.matches).map(m => text(m.name)); }
  function has(report, name) { return operatorNames(report).includes(name); }

  function suppressRedundantMatches(matches) {
    const list = asArray(matches);
    const hasSpecificContradictedBy = list.some(m => m.name === 'contradicted_by');
    return list.filter(m => !(hasSpecificContradictedBy && m.name === 'contradicts'));
  }

  function rebuildReport(report) {
    const r = clone(report || {});
    r.matches = suppressRedundantMatches(r.matches);
    r.match_count = r.matches.length;
    r.groups = unique(r.matches.map(m => m.group));
    r.pressures = unique(r.matches.flatMap(m => m.pressure_vector || []));
    r.legitimacy_guards = unique(r.matches.map(m => m.legitimacy_guard));
    r.evidence_burden = unique(r.matches.flatMap(m => m.evidence_burden || []));
    r.kernel_actions = unique(r.matches.map(m => m.kernel_action));
    r.contrast_classes = unique(r.matches.flatMap(m => m.contrast_class || []));
    r.patch_packet_type = PATCH_PACKET;
    r.patch_version = VERSION;
    r.belief_movement = 'none';
    r.doctrine = doctrine();
    return r;
  }

  function analyzeSentence(sentence, options = {}) {
    return rebuildReport(base.analyzeSentence(sentence, options));
  }

  function splitInput(raw) { return base.splitInput ? base.splitInput(raw) : text(raw).split(/\n+/).map(x => x.trim()).filter(Boolean); }

  function analyzeBatch(raw, options = {}) {
    const sentences = Array.isArray(raw) ? raw.map(text).filter(Boolean) : splitInput(raw);
    const reports = sentences.map(sentence => analyzeSentence(sentence, options));
    return {
      packet_type: '42ndMind_semantic_operator_workbench_batch_report_v0_1',
      packet_version: VERSION,
      patch_packet_type: PATCH_PACKET,
      created_at: now(),
      sentence_count: sentences.length,
      matched_sentence_count: reports.filter(r => r.match_count > 0).length,
      unmatched_sentence_count: reports.filter(r => r.match_count === 0).length,
      reports,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function literalMeaning(sentence) { return `The sentence states or implies: ${text(sentence)}`; }

  function intendedMeaning(report) {
    const names = operatorNames(report);
    const groups = asArray(report.groups);
    if (!report.match_count) return 'No canonical semantic operator was matched; the intended meaning needs manual review.';
    if (names.includes('rated') && names.includes('false') && (names.includes('certified') || names.includes('reviewer'))) return 'The sentence combines source-status and rating pressure with a falsity claim; the rating must not substitute for the evidence chain.';
    if (names.includes('challenged')) return 'The sentence says the claim is being questioned or contested; this creates challenge pressure, not refutation or falsity.';
    if (names.includes('lacks_evidence')) return 'The sentence withholds support because of an evidence gap; this is not automatically a contradiction or proof of falsity.';
    if (names.includes('contradicted_by')) return 'The sentence claims an inspectable record conflicts with the claim; contradiction depends on matching definitions, date, and scope.';
    if (names.includes('false')) return 'The sentence asserts falsity and applies closure pressure that requires falsifying evidence.';
    if (names.includes('debunked')) return 'The sentence presents the dispute as closed or refuted and requires an inspectable evidence chain.';
    if (groups.includes('authority_transfer')) return 'The sentence uses authority, expertise, certification, or consensus as support pressure.';
    if (groups.includes('reference_ambiguity')) return 'The sentence depends on unresolved reference that must be identified before evaluation.';
    if (groups.includes('motive_agency')) return 'The sentence attributes agency, coordination, motive, or agenda pressure.';
    if (groups.includes('source_trust')) return 'The sentence uses source class or provenance as trust pressure.';
    if (groups.includes('evidence_contact')) return 'The sentence points toward inspectable evidence or contradiction pressure.';
    if (groups.includes('uncertainty_calibration')) return 'The sentence carries uncertainty or confidence-calibration pressure.';
    if (groups.includes('moral_risk_framing')) return 'The sentence frames the claim through harm, risk, stigma, or action-justification pressure.';
    return 'The sentence contains matched semantic operators requiring review.';
  }

  function lexicalAction(report) {
    if (has(report, 'challenged')) return 'treat challenge as challenge pressure only; do not convert it into refutation or falsity';
    if (has(report, 'lacks_evidence')) return 'separate evidence gap from falsity or contradiction';
    if (has(report, 'contradicted_by')) return 'map the record-to-claim contradiction and check scope before resolution';
    if (has(report, 'false')) return 'extract exact claim and require falsifying evidence before closure';
    if (has(report, 'rated') || has(report, 'reviewer')) return 'separate review status, rating, and evidence chain';
    if (asArray(report.pressures).includes('ambiguity_pressure')) return 'resolve ambiguous references before strong claim pressure';
    if (asArray(report.pressures).includes('closure_pressure') || asArray(report.pressures).includes('dismissal_pressure')) return 'clarify closure/dismissal terms and extract the exact claim';
    if (asArray(report.pressures).includes('motive_agency_pressure')) return 'rewrite motive/agency language as an evidence-bounded hypothesis';
    if (asArray(report.pressures).includes('moral_risk_framing_pressure')) return 'clarify moral-risk label, harm mechanism, and criteria';
    if (asArray(report.pressures).includes('uncertainty_calibration_pressure')) return 'preserve uncertainty marker and prevent confidence inflation';
    return 'review matched semantic operators and implication-heavy terms';
  }

  function sourceTrustAction(pressures) {
    const p = asArray(pressures);
    if (p.includes('source_trust_pressure') || p.includes('authority_transfer_pressure') || p.includes('trust_inflation_pressure') || p.includes('reviewer_status_pressure') || p.includes('rating_pressure')) return 'treat source/status/rating labels as metadata or prior pressure, not truth';
    if (p.includes('evidence_contact_pressure')) return 'inspect the evidence object directly before support/contradiction movement';
    return 'not source-driven unless sources are later attached';
  }

  function questionsForReport(report) {
    const q = [];
    if (has(report, 'challenged')) q.push('What part of the claim is challenged, and does the challenge weaken, contradict, or merely question it?');
    if (has(report, 'lacks_evidence')) q.push('What evidence type is expected, and was the absence of evidence checked in the right place?');
    if (has(report, 'lacks_evidence')) q.push('Is this only lack of support, or is there positive contradiction?');
    if (has(report, 'false')) q.push('What exact evidence falsifies the exact claim?');
    if (has(report, 'rated')) q.push('Who rated the claim, what category was used, and what evidence supports the rating?');
    if (has(report, 'reviewer') || has(report, 'certified')) q.push('Is reviewer/certification status being substituted for claim-level evidence?');
    if (has(report, 'contradicted_by')) q.push('What record contradicts the claim, and do the record and claim share the same definitions, date, and scope?');

    const p = asArray(report.pressures);
    if (!q.length && (p.includes('closure_pressure') || p.includes('dismissal_pressure'))) q.push('What exact claim is being closed, dismissed, or refuted?');
    if (!q.length && (p.includes('authority_transfer_pressure') || p.includes('trust_inflation_pressure'))) q.push('Is source/status being substituted for claim-level evidence?');
    if (!q.length && p.includes('source_trust_pressure')) q.push('What evidence chain does the source provide?');
    if (!q.length && p.includes('ambiguity_pressure')) q.push('Which actor, evidence object, or claim does the ambiguous reference identify?');
    if (!q.length && p.includes('motive_agency_pressure')) q.push('What direct or structured pattern evidence supports the motive/agency claim?');
    if (!q.length && p.includes('evidence_contact_pressure')) q.push('What exact passage, dataset, transcript segment, or primary record supports the claim?');
    if (!q.length && p.includes('uncertainty_calibration_pressure')) q.push('Is the uncertainty marker being preserved in the conclusion?');
    if (!q.length && p.includes('moral_risk_framing_pressure')) q.push('What concrete harm mechanism, criteria, likelihood, and severity are being claimed?');
    return unique(q.length ? q : ['What evidence would make this semantic operation legitimate?']);
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
    const cleanReport = rebuildReport(report);
    const matches = asArray(cleanReport.matches);
    const operators = matches.map(match => ({
      operator: match.operator,
      pressure: clone(asArray(match.pressure_vector)),
      legitimacy_condition: text(match.legitimacy_guard)
    }));
    const surfaceTerms = unique(matches.flatMap(match => match.matched_terms || []).concat(matches.map(match => match.name)));
    const evidence = unique(asArray(cleanReport.evidence_burden));
    const pressures = unique(asArray(cleanReport.pressures));
    return {
      id: draftId(cleanReport, index, options),
      text: text(cleanReport.sentence),
      language: text(options.language || 'en'),
      operator_group: contrastGroup(cleanReport),
      surface_terms: surfaceTerms.length ? surfaceTerms : unique(text(cleanReport.sentence).match(/[A-Za-z][A-Za-z0-9_-]{2,}/g) || []),
      literal_meaning: text(options.literal_meaning) || literalMeaning(cleanReport.sentence),
      candidate_intended_meaning: text(options.candidate_intended_meaning) || intendedMeaning(cleanReport),
      semantic_operators: operators,
      evidence_burden: evidence.length ? evidence : ['Manually identify what evidence would make the candidate operator legitimate.'],
      expected_kernel_response: {
        lexical_action: lexicalAction(cleanReport),
        source_trust_action: sourceTrustAction(pressures),
        belief_movement: 'none_until_operator_legitimacy_conditions_are_satisfied',
        questions: questionsForReport(cleanReport)
      },
      contrast_group: contrastGroup(cleanReport),
      review_status: 'draft_candidate',
      workbench_metadata: {
        generated_by: PATCH_PACKET,
        base_generated_by: base.PACKET_TYPE,
        generated_at: now(),
        match_count: cleanReport.match_count,
        pressures,
        legitimacy_guards: clone(asArray(cleanReport.legitimacy_guards)),
        kernel_actions: clone(asArray(cleanReport.kernel_actions)),
        contrast_classes: clone(asArray(cleanReport.contrast_classes)),
        redundant_matches_suppressed: true,
        requires_human_review: true
      }
    };
  }

  function draftEntries(raw, options = {}) {
    const batch = raw && raw.packet_type === '42ndMind_semantic_operator_workbench_batch_report_v0_1' ? raw : analyzeBatch(raw, options);
    const includeUnmatched = options.include_unmatched === true;
    const selectedReports = asArray(batch.reports).filter(report => includeUnmatched || report.match_count > 0);
    const entries = selectedReports.map((report, index) => entryFromReport(report, index, options));
    return {
      packet_type: base.DRAFT_CORPUS_PACKET || '42ndMind_semantic_corpus_draft_v0_1',
      packet_version: VERSION,
      patch_packet_type: PATCH_PACKET,
      created_at: now(),
      source_packet_type: batch.packet_type,
      entry_count: entries.length,
      entries,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function validateDraft(draft, options = {}) { return base.validateDraft(draft, options); }
  function promoteDraftToSeedCandidateCorpus(draft, options = {}) { return base.promoteDraftToSeedCandidateCorpus(draft, options); }

  global.KernelSemanticOperatorWorkbenchV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PATCH_PACKET,
    doctrine,
    analyzeSentence,
    analyzeBatch,
    entryFromReport,
    draftEntries,
    validateDraft,
    promoteDraftToSeedCandidateCorpus,
    splitInput: base.splitInput,
    sampleBatch: base.sampleBatch
  }));
})(typeof window !== 'undefined' ? window : globalThis);
