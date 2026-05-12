/* 42ndMind Kernel Intention Recovery v0.4
 *
 * Purpose:
 * Recover likely intended meaning from sloppy wording while preserving
 * uncertainty. This module does not mind-read and does not decide truth.
 * It creates candidate interpretations that still answer to the governor.
 *
 * Doctrine:
 * - true understanding beats shallow literalism
 * - sloppy wording can be repaired when the intended meaning is recoverable
 * - recovered meaning remains candidate pressure
 * - motive attribution is high-risk unless separately supported
 * - nuance means preserving live alternatives until evidence narrows them
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const CATEGORIES = Object.freeze({
    LITERAL_CLAIM: 'literal_claim',
    LIKELY_INTENDED_CLAIM: 'likely_intended_claim',
    CHARITABLE_RECONSTRUCTION: 'charitable_reconstruction',
    AMBIGUOUS_INTENT: 'ambiguous_intent',
    MOTIVE_OVERCLAIM_RISK: 'motive_overclaim_risk',
    HOSTILE_OR_SELF_SEALING: 'hostile_or_self_sealing_pressure',
    CLARIFICATION_NEEDED: 'clarification_needed'
  });
  const DECISIONS = Object.freeze({
    RECOVERED_CANDIDATE: 'RECOVERED_CANDIDATE',
    MULTIPLE_PLAUSIBLE: 'MULTIPLE_PLAUSIBLE',
    CLARIFY: 'CLARIFY',
    HIGH_RISK_INTENT: 'HIGH_RISK_INTENT'
  });

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function words(value) { return lower(value).match(/[a-z0-9][a-z0-9'_-]*/g) || []; }
  function unique(items) {
    const seen = new Set();
    const out = [];
    for (const item of asArray(items)) {
      const t = text(item); const k = lower(t);
      if (t && !seen.has(k)) { seen.add(k); out.push(t); }
    }
    return out;
  }

  function hasRealityContact(raw) {
    return /\b(source|evidence|record|document|timestamp|receipt|video|data|test|benchmark|audit|official|measured|observed|log|report|study|link|citation|registry|screenshot|email|reply|file|form)\b/i.test(raw);
  }

  function hasMotiveLanguage(raw) {
    return /\b(on purpose|malicious|evil|bad faith|they lied|he lied|she lied|intended to|motive|agenda|wanted to|trying to|hiding|covering up|secretly)\b/i.test(raw);
  }

  function hasSelfSealing(raw) {
    return /\b(anyone who disagrees|everyone who disagrees|counterevidence proves|evidence against .* proves|criticism means attack|all criticism is|no evidence could|no amount of evidence|part of the conspiracy|disagreement proves)\b/i.test(raw);
  }

  function hasSloppyMarkers(raw) {
    return /\b(idk|i don't know|not sure|maybe|kinda|kind of|sort of|somehow|something|thing|stuff|weird|like|basically|whatever|you know|i guess|seems like|feels like)\b/i.test(raw);
  }

  function hasQuestionShape(raw) {
    return /\?$/.test(text(raw)) || /^\s*(what|why|how|when|where|who|can|could|should|is|are|does|do|would|did)\b/i.test(raw);
  }

  function hasClaimRelation(raw) {
    return /\b(is|are|was|were|means|shows|suggests|causes|supports|contradicts|depends|requires|proves|implies|because|therefore|but|however|so)\b/i.test(raw);
  }

  function cleanSloppy(raw) {
    let out = text(raw);
    out = out.replace(/\b(idk|i don't know|not sure|maybe|kinda|kind of|sort of|somehow|basically|whatever|you know|i guess|like)\b/gi, '');
    out = out.replace(/\bthat whole thing\b/gi, 'the issue');
    out = out.replace(/\bthing\b/gi, 'matter');
    out = out.replace(/\bstuff\b/gi, 'details');
    out = out.replace(/\s+/g, ' ').trim();
    return out || text(raw);
  }

  function confidenceBase(raw) {
    const wc = words(raw).length;
    let c = 0.32;
    if (wc >= 6) c += 0.12;
    if (hasClaimRelation(raw)) c += 0.12;
    if (hasRealityContact(raw)) c += 0.16;
    if (hasSloppyMarkers(raw)) c -= 0.1;
    if (hasMotiveLanguage(raw) && !hasRealityContact(raw)) c -= 0.16;
    if (hasSelfSealing(raw)) c -= 0.22;
    return clamp(c, 0.08, 0.82);
  }

  function interpretation(category, meaning, confidence, evidence, risks) {
    return {
      category,
      meaning: text(meaning),
      confidence: clamp(confidence, 0, 1),
      evidence: unique(evidence || []),
      risks: unique(risks || []),
      status: 'candidate_interpretation',
      not_final_belief: true
    };
  }

  function generateInterpretations(input, options = {}) {
    const raw = text(input);
    const base = confidenceBase(raw);
    const interpretations = [];
    if (!raw) {
      interpretations.push(interpretation(CATEGORIES.CLARIFICATION_NEEDED, 'No intended meaning can be recovered from empty input.', 0.95, ['empty_input'], []));
      return interpretations;
    }

    if (hasSelfSealing(raw)) {
      interpretations.push(interpretation(
        CATEGORIES.HOSTILE_OR_SELF_SEALING,
        raw,
        0.82,
        ['self_sealing_language_detected'],
        ['blocks_mature_belief_movement', 'requires_evidence_that_could_count_against_it']
      ));
      interpretations.push(interpretation(
        CATEGORIES.CHARITABLE_RECONSTRUCTION,
        'The speaker may be expressing distrust or perceived bad-faith pressure, but the wording is self-sealing and needs a falsifiable version.',
        0.46,
        ['charitable_repair_possible'],
        ['intent_not_directly_known', 'requires_clarification']
      ));
      return interpretations;
    }

    if (hasMotiveLanguage(raw) && !hasRealityContact(raw)) {
      interpretations.push(interpretation(
        CATEGORIES.MOTIVE_OVERCLAIM_RISK,
        raw,
        0.78,
        ['motive_language_without_independent_evidence'],
        ['motive_or_intent_not_established', 'should_rewrite_as_observable_claim']
      ));
      interpretations.push(interpretation(
        CATEGORIES.CHARITABLE_RECONSTRUCTION,
        raw.replace(/\b(on purpose|malicious|evil|bad faith|they lied|he lied|she lied|intended to|wanted to|trying to|secretly)\b/gi, 'may have produced an effect that'),
        0.44,
        ['observable_effect_reconstruction'],
        ['motive_removed_for_safety', 'needs_source_review']
      ));
      return interpretations;
    }

    if (hasQuestionShape(raw)) {
      interpretations.push(interpretation(
        CATEGORIES.CLARIFICATION_NEEDED,
        raw,
        0.74,
        ['question_shape_detected'],
        ['question_should_not_become_claim_without_answer']
      ));
      return interpretations;
    }

    if (hasSloppyMarkers(raw)) {
      const cleaned = cleanSloppy(raw);
      interpretations.push(interpretation(
        CATEGORIES.LIKELY_INTENDED_CLAIM,
        cleaned,
        base,
        ['sloppy_wording_repaired'],
        ['recovered_meaning_not_final', 'preserve_literal_alternative']
      ));
      interpretations.push(interpretation(
        CATEGORIES.CHARITABLE_RECONSTRUCTION,
        `A careful version may be: ${cleaned}`,
        clamp(base - 0.08, 0.1, 0.7),
        ['charitable_reconstruction_from_sloppy_input'],
        ['speaker_intent_uncertain']
      ));
      interpretations.push(interpretation(
        CATEGORIES.AMBIGUOUS_INTENT,
        raw,
        clamp(0.38, 0.1, 0.6),
        ['sloppy_markers_remain'],
        ['ask_for_exact_claim_or_evidence_if_needed']
      ));
      return interpretations;
    }

    if (hasClaimRelation(raw)) {
      interpretations.push(interpretation(
        CATEGORIES.LITERAL_CLAIM,
        raw,
        base,
        ['claim_relation_detected'].concat(hasRealityContact(raw) ? ['reality_contact_language_detected'] : []),
        hasRealityContact(raw) ? ['source_visible_not_verified'] : ['source_support_not_established']
      ));
      return interpretations;
    }

    interpretations.push(interpretation(
      CATEGORIES.AMBIGUOUS_INTENT,
      raw,
      0.5,
      ['some_semantic_signal_present'],
      ['not_enough_structure_to_recover_intent']
    ));
    return interpretations;
  }

  function chooseDecision(interpretations) {
    if (interpretations.some(i => i.category === CATEGORIES.HOSTILE_OR_SELF_SEALING || i.category === CATEGORIES.MOTIVE_OVERCLAIM_RISK)) return DECISIONS.HIGH_RISK_INTENT;
    if (interpretations.some(i => i.category === CATEGORIES.CLARIFICATION_NEEDED) && interpretations.length === 1) return DECISIONS.CLARIFY;
    if (interpretations.length > 1) return DECISIONS.MULTIPLE_PLAUSIBLE;
    return DECISIONS.RECOVERED_CANDIDATE;
  }

  function toGovernorCandidate(report) {
    const best = asArray(report.interpretations).slice().sort((a, b) => b.confidence - a.confidence)[0];
    if (!best || report.decision === DECISIONS.CLARIFY) return null;
    return {
      candidate_type: 'intention_recovery_candidate',
      text: best.meaning,
      support_status: 'unreviewed',
      source_ids: [],
      evidence: best.evidence.map(e => ({ text:e, relation:'context' })),
      attacks: best.risks,
      questions: report.decision === DECISIONS.MULTIPLE_PLAUSIBLE
        ? ['Which interpretation best captures the intended meaning?']
        : best.risks.includes('motive_or_intent_not_established')
          ? ['What independent evidence supports the motive attribution?']
          : [],
      confidence: best.confidence,
      status: 'candidate',
      mechanism_class: best.category,
      raw: { intention_recovery_report: report }
    };
  }

  function analyze(input, options = {}) {
    const interpretations = generateInterpretations(input, options);
    const decision = chooseDecision(interpretations);
    const report = {
      packet_type: '42ndMind_kernel_intention_recovery_report',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      input_preview: text(input).slice(0, 220),
      decision,
      interpretations,
      selected_interpretation: interpretations.slice().sort((a, b) => b.confidence - a.confidence)[0] || null,
      governor_candidate: null,
      governor_report: null,
      doctrine: {
        true_understanding_beats_shallow_literalism: true,
        intent_recovery_is_not_mind_reading: true,
        recovered_meaning_is_candidate_pressure: true,
        motive_attribution_is_high_risk_without_independent_support: true,
        preserve_live_alternatives_until_evidence_narrows_them: true,
        governor_owns_belief_movement: true
      }
    };
    report.governor_candidate = toGovernorCandidate(report);
    if (report.governor_candidate && global.KernelEpistemicGovernorV01 && typeof global.KernelEpistemicGovernorV01.assess === 'function') {
      report.governor_report = global.KernelEpistemicGovernorV01.assess(report.governor_candidate);
    }
    return report;
  }

  function sampleInput(kind) {
    if (kind === 'sloppy') return 'idk maybe that whole thing is weird somehow';
    if (kind === 'motive') return 'they lied on purpose to hide the real agenda';
    if (kind === 'self_sealing') return 'anyone who disagrees only proves they are part of it';
    if (kind === 'question') return 'what did he actually mean by that sloppy reply?';
    if (kind === 'source_claim') return 'the timestamp in the record contradicts the claim that the form was submitted early';
    if (kind === 'plain') return 'the source supports the bounded claim but motive remains unresolved';
    return 'maybe he worded it badly but probably meant the source was weak';
  }

  global.KernelIntentionRecoveryV04 = Object.freeze({
    VERSION,
    CATEGORIES,
    DECISIONS,
    generateInterpretations,
    analyze,
    toGovernorCandidate,
    sampleInput
  });
})(typeof window !== 'undefined' ? window : globalThis);
