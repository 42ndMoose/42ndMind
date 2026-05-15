/* 42ndMind Semantic Operator Workbench v0.1.5 Patch
 * Adds draft-language support for remaining contrast-gap operators:
 * misleading, omission, clip, disputed, hearsay, summary, unverified,
 * and not_disproven.
 *
 * Drafts remain review pressure only. No belief movement, doctrine promotion,
 * source patching, or truth decision occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorWorkbenchV01;
  if (!base) return;

  const VERSION = '0.1.5';
  const PATCH_PACKET = '42ndMind_semantic_operator_workbench_v0_1_5_patch';

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
    d.patch_adds_remaining_gap_draft_language = true;
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
    return list.filter(m => {
      if (names.includes('not_disproven') && (m.name === 'disproven' || m.name === 'proved')) return false;
      if (raw.includes('misleading') && m.name === 'false') return false;
      if (raw.includes('summary') && m.name === 'published_summary') return false;
      if (raw.includes('clip') && m.name === 'transcript' && !raw.includes('full transcript')) return false;
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
    if (!report.match_count) return 'No canonical semantic operator was matched; the intended meaning needs manual review.';
    if (has(report, 'misleading')) return 'The sentence marks misleading framing, omission, or scope distortion without treating it as direct falsity.';
    if (has(report, 'omission')) return 'The sentence says relevant qualifying context was omitted, creating misleading or qualification pressure.';
    if (has(report, 'clip')) return 'The sentence uses a partial clip as evidence and requires the fuller record before strong support or contradiction.';
    if (has(report, 'disputed')) return 'The sentence says the claim is contested; this is dispute pressure, not refutation or falsity.';
    if (has(report, 'hearsay')) return 'The sentence uses secondhand or hearsay sourcing and requires primary evidence before claim movement.';
    if (has(report, 'summary')) return 'The sentence uses a summary as an interpretation layer that must be checked against the underlying record.';
    if (has(report, 'unverified')) return 'The sentence withholds support because the claim has not been verified; this is not direct falsity.';
    if (has(report, 'not_disproven')) return 'The sentence says the claim has not been falsified; this does not make the claim supported.';
    if (base.entryFromReport) return base.entryFromReport(report, 0).candidate_intended_meaning || 'The sentence contains matched semantic operators requiring review.';
    return 'The sentence contains matched semantic operators requiring review.';
  }

  function lexicalAction(report) {
    if (has(report, 'misleading')) return 'separate misleading/framing pressure from direct falsity';
    if (has(report, 'omission')) return 'identify omitted context and test whether it changes scope, support, or interpretation';
    if (has(report, 'clip')) return 'treat clip as partial evidence and ask for the fuller record';
    if (has(report, 'disputed')) return 'preserve dispute status without converting it into debunking or falsity';
    if (has(report, 'hearsay')) return 'separate secondhand claim transmission from primary evidence';
    if (has(report, 'summary')) return 'treat summary as interpretation layer until checked against the underlying record';
    if (has(report, 'unverified')) return 'withhold support while preserving unresolved status';
    if (has(report, 'not_disproven')) return 'preserve not-falsified status without treating it as support';
    return base.entryFromReport ? (base.entryFromReport(report, 0).expected_kernel_response || {}).lexical_action || 'review matched semantic operators and implication-heavy terms' : 'review matched semantic operators and implication-heavy terms';
  }

  function sourceTrustAction(pressures) {
    const p = asArray(pressures);
    if (p.includes('hearsay_pressure') || p.includes('low_trust_prior_pressure')) return 'treat hearsay/source-distance as low-contact source pressure, not claim truth';
    if (p.includes('interpretation_layer_pressure') || p.includes('source_trust_pressure')) return 'treat summary/source/status as interpretation or metadata, not truth';
    if (p.includes('evidence_contact_pressure') || p.includes('partial_evidence_pressure')) return 'inspect the evidence object and fuller record before support/contradiction movement';
    return 'not source-driven unless sources are later attached';
  }

  function questionsForReport(report) {
    const q = [];
    if (has(report, 'misleading')) q.push('What omitted, narrowed, or distorted context makes the claim misleading rather than false?');
    if (has(report, 'omission')) q.push('What exactly was omitted, and does the omission change support, scope, or interpretation?');
    if (has(report, 'clip')) q.push('What does the full record show beyond the clip?');
    if (has(report, 'disputed')) q.push('Who disputes the claim, and does the dispute weaken, contradict, or merely contest it?');
    if (has(report, 'hearsay')) q.push('What primary evidence or firsthand source exists beyond the hearsay?');
    if (has(report, 'summary')) q.push('What underlying record does the summary compress, and what does it include or omit?');
    if (has(report, 'unverified')) q.push('What verification would be needed, and was it checked in the right place?');
    if (has(report, 'not_disproven')) q.push('What would disprove the claim, and is there positive support or only lack of refutation?');
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
