/* 42ndMind Semantic Operator Workbench v0.1.3 Patch
 * Suppresses redundant/overbroad matches exposed by the motive-agency batch.
 * - If agenda(actor) is matched through "that agenda", suppress broad this(reference).
 * - If clearly(modifier) is present, suppress broad obviously(modifier).
 * - If contradicted_by(record,claim) is present, suppress generic contradicts(record,claim).
 *
 * Drafts remain review pressure only. No belief movement, doctrine promotion,
 * source patching, or truth decision occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorWorkbenchV01;
  if (!base) return;

  const VERSION = '0.1.3';
  const PATCH_PACKET = '42ndMind_semantic_operator_workbench_v0_1_3_patch';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item); const key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }
  function slug(value) { return lower(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'entry'; }
  function hashTiny(value) { let h = 0, s = text(value); for (let i=0;i<s.length;i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h).toString(36).slice(0, 6); }

  function doctrine() {
    const d = base.doctrine ? base.doctrine() : {};
    d.patch_version = VERSION;
    d.patch_suppresses_redundant_motive_batch_overmatches = true;
    d.workbench_outputs_are_drafts_not_doctrine = true;
    d.workbench_does_not_move_belief = true;
    d.workbench_does_not_promote_doctrine = true;
    d.workbench_does_not_patch_source = true;
    d.belief_movement = 'none';
    return d;
  }

  function operatorNames(report) { return asArray(report && report.matches).map(m => text(m.name)); }
  function has(report, name) { return operatorNames(report).includes(name); }

  function suppressRedundantMatches(matches, sentence) {
    const list = asArray(matches);
    const names = list.map(m => m.name);
    const raw = lower(sentence);
    const hasSpecificContradictedBy = names.includes('contradicted_by');
    const hasProvedFalse = names.includes('proved_false');
    const hasClearly = names.includes('clearly');
    const agendaPhrase = raw.includes('that agenda') || raw.includes('pushed that agenda') || raw.includes('pushed the agenda');
    return list.filter(m => {
      if (hasProvedFalse && (m.name === 'proved' || m.name === 'false')) return false;
      if (hasSpecificContradictedBy && m.name === 'contradicts') return false;
      if (hasClearly && m.name === 'obviously') return false;
      if (agendaPhrase && m.name === 'this') return false;
      return true;
    });
  }

  function rebuildReport(report) {
    const r = clone(report || {});
    r.matches = suppressRedundantMatches(r.matches, r.sentence);
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

  function analyzeSentence(sentence, options = {}) { return rebuildReport(base.analyzeSentence(sentence, options)); }
  function splitInput(raw) { return base.splitInput ? base.splitInput(raw) : text(raw).split(/\n+/).map(x => x.trim()).filter(Boolean); }
  function analyzeBatch(raw, options = {}) {
    const sentences = Array.isArray(raw) ? raw.map(text).filter(Boolean) : splitInput(raw);
    const reports = sentences.map(sentence => analyzeSentence(sentence, options));
    return { packet_type:'42ndMind_semantic_operator_workbench_batch_report_v0_1', packet_version:VERSION, patch_packet_type:PATCH_PACKET, created_at:now(), sentence_count:sentences.length, matched_sentence_count:reports.filter(r => r.match_count > 0).length, unmatched_sentence_count:reports.filter(r => r.match_count === 0).length, reports, belief_movement:'none', doctrine:doctrine() };
  }

  function intendedMeaning(report) {
    const names = operatorNames(report);
    const groups = asArray(report.groups);
    if (!report.match_count) return 'No canonical semantic operator was matched; the intended meaning needs manual review.';
    if (names.includes('collusion')) return 'The sentence asserts collusion or coordinated action; this requires direct-link evidence rather than mere similarity.';
    if (names.includes('court_filing') && names.includes('alleges')) return 'The sentence uses an official filing to preserve an allegation, not an adjudicated finding.';
    if (names.includes('anonymous_social_post')) return 'The sentence uses a low-trust or anonymous source while preserving inspectable evidence as possible evidence.';
    if (names.includes('clearly') || names.includes('pressured')) return 'The sentence combines confidence inflation with an agency/pressure claim that needs actor, target, mechanism, and evidence.';
    if (names.includes('conspiracy')) return 'The sentence applies a stigma/dismissal label that must not replace evidence analysis.';
    if (names.includes('agenda')) return 'The sentence attributes agenda or motive pressure and requires actor, goal, mechanism, and evidence.';
    if (names.includes('coordinated')) return 'The sentence asserts coordination pressure and requires direct-link or strong structured-pattern evidence.';
    if (names.includes('proved_false') && names.includes('certified')) return 'The sentence combines source-status pressure with a proof-plus-falsity claim; certification must not substitute for the falsifying evidence chain.';
    if (names.includes('proved_false')) return 'The sentence applies proof-plus-falsity pressure; the claim is treated as false only if direct falsifying evidence is inspectable.';
    if (names.includes('challenged')) return 'The sentence says the claim is being questioned or contested; this creates challenge pressure, not refutation or falsity.';
    if (names.includes('contradicted_by')) return 'The sentence claims an inspectable record conflicts with the claim; contradiction depends on matching definitions, date, and scope.';
    if (names.includes('false')) return 'The sentence asserts falsity and applies closure pressure that requires falsifying evidence.';
    if (names.includes('debunked')) return 'The sentence presents the dispute as closed or refuted and requires an inspectable evidence chain.';
    if (groups.includes('authority_transfer')) return 'The sentence uses authority, expertise, certification, or consensus as support pressure.';
    if (groups.includes('source_trust')) return 'The sentence uses source class or provenance as trust pressure.';
    if (groups.includes('evidence_contact')) return 'The sentence points toward inspectable evidence or contradiction pressure.';
    if (groups.includes('uncertainty_calibration')) return 'The sentence carries uncertainty or confidence-calibration pressure.';
    return 'The sentence contains matched semantic operators requiring review.';
  }

  function lexicalAction(report) {
    if (has(report, 'collusion')) return 'treat collusion as direct-link agency pressure; require agreement, communication, common control, or shared planning evidence';
    if (has(report, 'court_filing') || has(report, 'alleges')) return 'separate filed allegation from adjudicated finding and inspect attached evidence';
    if (has(report, 'anonymous_social_post')) return 'separate low source trust from the inspectability of the leaked evidence';
    if (has(report, 'clearly')) return 'strip confidence inflation and evaluate the underlying claim';
    if (has(report, 'pressured')) return 'resolve actor, target, mechanism, and direct evidence for the pressure claim';
    if (has(report, 'conspiracy')) return 'separate stigma/dismissal pressure from evidence analysis';
    if (has(report, 'agenda')) return 'bound agenda language by actor, goal, mechanism, and evidence';
    if (has(report, 'coordinated')) return 'require direct-link or strong structured-pattern evidence for coordination';
    if (has(report, 'proved_false')) return 'separate proof language, falsity closure, and source status; require direct falsifying evidence';
    if (has(report, 'challenged')) return 'treat challenge as challenge pressure only; do not convert it into refutation or falsity';
    if (has(report, 'contradicted_by')) return 'map the record-to-claim contradiction and check scope before resolution';
    return base.entryFromReport ? (base.entryFromReport(report, 0).expected_kernel_response || {}).lexical_action || 'review matched semantic operators and implication-heavy terms' : 'review matched semantic operators and implication-heavy terms';
  }

  function sourceTrustAction(pressures) {
    const p = asArray(pressures);
    if (p.includes('source_trust_pressure') || p.includes('authority_transfer_pressure') || p.includes('trust_inflation_pressure') || p.includes('reviewer_status_pressure') || p.includes('rating_pressure') || p.includes('provenance_pressure') || p.includes('low_trust_prior_pressure') || p.includes('official_record_pressure')) return 'treat source/status/provenance labels as metadata or prior pressure, not truth';
    if (p.includes('evidence_contact_pressure')) return 'inspect the evidence object directly before support/contradiction movement';
    return 'not source-driven unless sources are later attached';
  }

  function questionsForReport(report) {
    const q = [];
    if (has(report, 'collusion')) q.push('What agreement, communication, common-control, or shared-planning evidence supports collusion?');
    if (has(report, 'coordinated')) q.push('What direct-link or structured-pattern evidence supports coordination?');
    if (has(report, 'agenda')) q.push('Who has the alleged agenda, what is the goal, and what evidence supports that motive claim?');
    if (has(report, 'court_filing')) q.push('What exactly does the court filing allege, and what exhibits or findings support it?');
    if (has(report, 'alleges')) q.push('Is this only an allegation, or is there adjudication, admission, or direct evidence?');
    if (has(report, 'anonymous_social_post')) q.push('Can the leaked document be authenticated independently of the anonymous source?');
    if (has(report, 'clearly')) q.push('What remains if the confidence word clearly is removed?');
    if (has(report, 'pressured')) q.push('Who pressured whom, by what mechanism, and what direct evidence shows it?');
    if (has(report, 'conspiracy')) q.push('Does the conspiracy label address evidence, or only stigmatize the claimant?');
    if (has(report, 'challenged')) q.push('What part of the claim is challenged, and does the challenge weaken, contradict, or merely question it?');
    if (has(report, 'contradicted_by')) q.push('What record contradicts the claim, and do the record and claim share the same definitions, date, and scope?');
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
    const operators = matches.map(match => ({ operator: match.operator, pressure: clone(asArray(match.pressure_vector)), legitimacy_condition: text(match.legitimacy_guard) }));
    const surfaceTerms = unique(matches.flatMap(match => match.matched_terms || []).concat(matches.map(match => match.name)));
    const evidence = unique(asArray(cleanReport.evidence_burden));
    const pressures = unique(asArray(cleanReport.pressures));
    return {
      id: draftId(cleanReport, index, options),
      text: text(cleanReport.sentence),
      language: text(options.language || 'en'),
      operator_group: contrastGroup(cleanReport),
      surface_terms: surfaceTerms.length ? surfaceTerms : unique(text(cleanReport.sentence).match(/[A-Za-z][A-Za-z0-9_-]{2,}/g) || []),
      literal_meaning: text(options.literal_meaning) || `The sentence states or implies: ${text(cleanReport.sentence)}`,
      candidate_intended_meaning: text(options.candidate_intended_meaning) || intendedMeaning(cleanReport),
      semantic_operators: operators,
      evidence_burden: evidence.length ? evidence : ['Manually identify what evidence would make the candidate operator legitimate.'],
      expected_kernel_response: { lexical_action: lexicalAction(cleanReport), source_trust_action: sourceTrustAction(pressures), belief_movement: 'none_until_operator_legitimacy_conditions_are_satisfied', questions: questionsForReport(cleanReport) },
      contrast_group: contrastGroup(cleanReport),
      review_status: 'draft_candidate',
      workbench_metadata: { generated_by: PATCH_PACKET, base_generated_by: base.PACKET_TYPE, generated_at: now(), match_count: cleanReport.match_count, pressures, legitimacy_guards: clone(asArray(cleanReport.legitimacy_guards)), kernel_actions: clone(asArray(cleanReport.kernel_actions)), contrast_classes: clone(asArray(cleanReport.contrast_classes)), redundant_matches_suppressed: true, requires_human_review: true }
    };
  }

  function draftEntries(raw, options = {}) {
    const batch = raw && raw.packet_type === '42ndMind_semantic_operator_workbench_batch_report_v0_1' ? raw : analyzeBatch(raw, options);
    const includeUnmatched = options.include_unmatched === true;
    const selectedReports = asArray(batch.reports).filter(report => includeUnmatched || report.match_count > 0);
    const entries = selectedReports.map((report, index) => entryFromReport(report, index, options));
    return { packet_type: base.DRAFT_CORPUS_PACKET || '42ndMind_semantic_corpus_draft_v0_1', packet_version: VERSION, patch_packet_type: PATCH_PACKET, created_at: now(), source_packet_type: batch.packet_type, entry_count: entries.length, entries, belief_movement: 'none', doctrine: doctrine() };
  }

  global.KernelSemanticOperatorWorkbenchV01 = Object.freeze(Object.assign({}, base, {
    VERSION,
    PATCH_PACKET,
    doctrine,
    analyzeSentence,
    analyzeBatch,
    entryFromReport,
    draftEntries,
    validateDraft: base.validateDraft,
    promoteDraftToSeedCandidateCorpus: base.promoteDraftToSeedCandidateCorpus,
    splitInput: base.splitInput,
    sampleBatch: base.sampleBatch
  }));
})(typeof window !== 'undefined' ? window : globalThis);
