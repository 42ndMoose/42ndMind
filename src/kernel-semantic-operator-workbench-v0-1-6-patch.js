/* 42ndMind Semantic Operator Workbench v0.1.6 Patch
 * Adds draft-language support for rhetoric and intent-pressure operators:
 * obfuscates, emotionally_loaded, reckless_accusation,
 * argument_from_ignorance, and ulterior_motive_attribution.
 *
 * These remain review candidates. No truth decision, belief movement,
 * doctrine promotion, source patching, or intent proof occurs here.
 */
(function (global) {
  'use strict';

  const base = global.KernelSemanticOperatorWorkbenchV01;
  if (!base) return;

  const VERSION = '0.1.6';
  const PATCH_PACKET = '42ndMind_semantic_operator_workbench_v0_1_6_patch';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
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
  function slug(value) { return lower(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'entry'; }
  function hashTiny(value) { let h = 0, s = text(value); for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h).toString(36).slice(0, 6); }

  function doctrine() {
    const d = base.doctrine ? base.doctrine() : {};
    d.patch_version = VERSION;
    d.patch_adds_rhetoric_and_intent_pressure_draft_language = true;
    d.rhetoric_pressure_is_not_truth = true;
    d.intent_attribution_requires_extra_evidence = true;
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
      if (names.includes('argument_from_ignorance') && (m.name === 'proved' || m.name === 'not_disproven')) return false;
      if (names.includes('obfuscates') && raw.includes('vague') && m.name === 'they') return false;
      if (names.includes('emotionally_loaded') && (m.name === 'harmful' || m.name === 'dangerous')) return false;
      if (names.includes('ulterior_motive_attribution') && m.name === 'agenda') return false;
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

  function intendedMeaning(report) {
    if (!report.match_count) return 'No canonical semantic operator was matched; the intended meaning needs manual review.';
    if (has(report, 'obfuscates')) return 'The sentence marks clarity reduction or vague wording that makes the exact claim harder to inspect.';
    if (has(report, 'emotionally_loaded')) return 'The sentence uses affective framing or emotionally charged rhetoric that must be separated from evidence.';
    if (has(report, 'reckless_accusation')) return 'The sentence makes or describes a serious accusation with inadequate direct evidence or care.';
    if (has(report, 'argument_from_ignorance')) return 'The sentence moves from absence of proof or disproof into a truth or falsity conclusion.';
    if (has(report, 'ulterior_motive_attribution')) return 'The sentence attributes a hidden motive and therefore requires actor, motive, action, and direct-link evidence.';
    if (base.entryFromReport) return base.entryFromReport(report, 0).candidate_intended_meaning || 'The sentence contains matched semantic operators requiring review.';
    return 'The sentence contains matched semantic operators requiring review.';
  }

  function lexicalAction(report) {
    if (has(report, 'obfuscates')) return 'strip vague language and restate the simplest inspectable claim';
    if (has(report, 'emotionally_loaded')) return 'remove emotional framing and evaluate the underlying proposition';
    if (has(report, 'reckless_accusation')) return 'identify accusation, target, and direct evidence before allowing accusation pressure';
    if (has(report, 'argument_from_ignorance')) return 'block absence-to-truth or absence-to-falsity movement and preserve unresolved status';
    if (has(report, 'ulterior_motive_attribution')) return 'treat hidden motive as a hypothesis requiring direct-link evidence';
    return base.entryFromReport ? (base.entryFromReport(report, 0).expected_kernel_response || {}).lexical_action || 'review matched semantic operators and implication-heavy terms' : 'review matched semantic operators and implication-heavy terms';
  }

  function sourceTrustAction(pressures) {
    const p = asArray(pressures);
    if (p.includes('direct_link_evidence_burden') || p.includes('intent_attribution_pressure')) return 'do not infer intent or agency from outcome, dislike, or suspicion; require direct-link evidence';
    if (p.includes('evidence_access_burden')) return 'request clearer evidence access and a simpler inspectable claim';
    if (p.includes('reputational_risk_pressure')) return 'treat accusation as reputationally risky pressure requiring direct evidence';
    return 'not source-driven unless sources are later attached';
  }

  function questionsForReport(report) {
    const q = [];
    if (has(report, 'obfuscates')) q.push('What exact claim is being obscured, and how can it be restated in the simplest testable form?');
    if (has(report, 'emotionally_loaded')) q.push('What remains if the emotionally charged wording is removed?');
    if (has(report, 'reckless_accusation')) q.push('Who is accused, of what exactly, and what direct evidence supports the accusation?');
    if (has(report, 'argument_from_ignorance')) q.push('Is the argument treating absence of proof as falsity, or absence of disproof as truth?');
    if (has(report, 'ulterior_motive_attribution')) q.push('What evidence links the alleged hidden motive to the actor and action?');
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
      literal_meaning: text(options.literal_meaning) || `The sentence states or implies: ${text(cleanReport.sentence)}`,
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
