/* 42ndMind Source Trust v0.4
 *
 * Purpose:
 * Evaluate source-class trust as bounded prior pressure, not truth.
 *
 * Source labels such as fact-check certification, legacy media branding,
 * institutional affiliation, anonymous posting, or primary-document status are
 * metadata. They can affect trust priors and verification burden, but they do
 * not decide truth and cannot replace claim-level evidence.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';

  const SOURCE_CLASSES = Object.freeze({
    PRIMARY_DOCUMENT: 'primary_document',
    DIRECT_TRANSCRIPT: 'direct_transcript',
    RAW_DATASET: 'raw_dataset',
    OFFICIAL_RECORD: 'official_record',
    LEGACY_MEDIA: 'legacy_media',
    FACT_CHECK_CERTIFIED: 'fact_check_certified',
    GOVERNMENT_FUNDED_NGO: 'government_funded_ngo',
    ADVOCACY_ORG: 'advocacy_org',
    ANONYMOUS_SOCIAL_POST: 'anonymous_social_post',
    EXPERT_COMMENTARY: 'expert_commentary',
    UNKNOWN: 'unknown'
  });

  const DECISIONS = Object.freeze({
    TRUST_PRIOR_STRONG: 'TRUST_PRIOR_STRONG',
    TRUST_PRIOR_MODERATE: 'TRUST_PRIOR_MODERATE',
    TRUST_PRIOR_LOW: 'TRUST_PRIOR_LOW',
    TRUST_PRIOR_CONFLICTED: 'TRUST_PRIOR_CONFLICTED',
    HOLD_SOURCE_REVIEW: 'HOLD_SOURCE_REVIEW'
  });

  const CLASS_WEIGHTS = Object.freeze({
    primary_document: 0.82,
    direct_transcript: 0.78,
    raw_dataset: 0.74,
    official_record: 0.7,
    expert_commentary: 0.56,
    legacy_media: 0.46,
    fact_check_certified: 0.42,
    government_funded_ngo: 0.4,
    advocacy_org: 0.34,
    anonymous_social_post: 0.24,
    unknown: 0.38
  });

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function round(value) { return Number(clamp(value, 0, 1).toFixed(3)); }
  function now() { return new Date().toISOString(); }
  function unique(items) { return Array.from(new Set(asArray(items).map(text).filter(Boolean))); }

  function detectClasses(source = {}) {
    const raw = lower([
      source.kind,
      source.type,
      source.label,
      source.title,
      source.publisher,
      source.organization,
      source.certification,
      source.description,
      asArray(source.tags).join(' ')
    ].join(' '));
    const classes = [];
    if (/primary document|primary source|original document|court filing|legislation|bill text|archive document/.test(raw)) classes.push(SOURCE_CLASSES.PRIMARY_DOCUMENT);
    if (/direct transcript|verbatim transcript|full transcript|recording transcript/.test(raw)) classes.push(SOURCE_CLASSES.DIRECT_TRANSCRIPT);
    if (/raw data|dataset|spreadsheet|telemetry|csv|database/.test(raw)) classes.push(SOURCE_CLASSES.RAW_DATASET);
    if (/official record|government record|public record|registry|gazette|hansard/.test(raw)) classes.push(SOURCE_CLASSES.OFFICIAL_RECORD);
    if (/legacy media|newspaper|broadcast|cnn|bbc|reuters|associated press|ap news|new york times|washington post|guardian|npr|politico|wall street journal/.test(raw)) classes.push(SOURCE_CLASSES.LEGACY_MEDIA);
    if (/fact[- ]?check|fact checker|ifcn|international fact-checking network|certified fact/.test(raw)) classes.push(SOURCE_CLASSES.FACT_CHECK_CERTIFIED);
    if (/government funded|state funded|publicly funded|grant funded|usaid|omidyar|open society|ngo/.test(raw)) classes.push(SOURCE_CLASSES.GOVERNMENT_FUNDED_NGO);
    if (/advocacy|campaign|activist|lobby|think tank|pressure group/.test(raw)) classes.push(SOURCE_CLASSES.ADVOCACY_ORG);
    if (/anonymous|social post|tweet|x post|reddit|telegram|rumor|thread/.test(raw)) classes.push(SOURCE_CLASSES.ANONYMOUS_SOCIAL_POST);
    if (/expert commentary|opinion|analysis|commentary|column|essay|interview/.test(raw)) classes.push(SOURCE_CLASSES.EXPERT_COMMENTARY);
    return unique(classes.length ? classes : [SOURCE_CLASSES.UNKNOWN]);
  }

  function historySignals(source = {}) {
    const history = source.history || {};
    return {
      contradiction_count: Number(history.contradiction_count || source.contradiction_count || 0),
      correction_count: Number(history.correction_count || source.correction_count || 0),
      retraction_count: Number(history.retraction_count || source.retraction_count || 0),
      primary_evidence_count: Number(history.primary_evidence_count || source.primary_evidence_count || 0),
      transparent_funding: source.transparent_funding === true || history.transparent_funding === true,
      adversarial_audit: source.adversarial_audit === true || history.adversarial_audit === true,
      cross_ideological_accuracy: source.cross_ideological_accuracy === true || history.cross_ideological_accuracy === true
    };
  }

  function baseScore(classes) {
    const scores = asArray(classes).map(c => CLASS_WEIGHTS[c] ?? CLASS_WEIGHTS.unknown);
    if (!scores.length) return CLASS_WEIGHTS.unknown;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  function evidenceSignals(source = {}) {
    const links = source.links || {};
    const evidence = asArray(source.evidence).concat(asArray(links.evidence));
    const directPrimary = evidence.some(e => /primary|original|transcript|raw|record|document/i.test(text(e && (e.type || e.relation || e.label || e.text || e))));
    const independentCount = Number(source.independent_source_count || links.independent_source_count || 0);
    return { evidence_count:evidence.length, direct_primary_evidence:directPrimary, independent_source_count:independentCount };
  }

  function certificationIsMetadata(classes) {
    return asArray(classes).includes(SOURCE_CLASSES.FACT_CHECK_CERTIFIED);
  }

  function computeScore(classes, source = {}) {
    const history = historySignals(source);
    const evidence = evidenceSignals(source);
    let score = baseScore(classes);

    if (evidence.direct_primary_evidence) score += 0.16;
    if (evidence.independent_source_count >= 2) score += 0.08;
    else if (evidence.independent_source_count === 1) score += 0.03;
    if (history.primary_evidence_count >= 2) score += 0.08;
    if (history.transparent_funding) score += 0.04;
    if (history.adversarial_audit) score += 0.06;
    if (history.cross_ideological_accuracy) score += 0.06;

    score -= Math.min(0.28, history.contradiction_count * 0.07);
    score -= Math.min(0.18, history.retraction_count * 0.09);
    score -= Math.min(0.1, history.correction_count * 0.025);

    if (classes.includes(SOURCE_CLASSES.FACT_CHECK_CERTIFIED) && !evidence.direct_primary_evidence) score -= 0.08;
    if (classes.includes(SOURCE_CLASSES.LEGACY_MEDIA) && classes.includes(SOURCE_CLASSES.FACT_CHECK_CERTIFIED)) score -= 0.04;
    if (classes.includes(SOURCE_CLASSES.GOVERNMENT_FUNDED_NGO) && classes.includes(SOURCE_CLASSES.FACT_CHECK_CERTIFIED)) score -= 0.06;

    return round(score);
  }

  function decisionFor(score, classes, source) {
    const history = historySignals(source);
    if (history.contradiction_count >= 3 || history.retraction_count >= 2) return DECISIONS.TRUST_PRIOR_CONFLICTED;
    if (score >= 0.68) return DECISIONS.TRUST_PRIOR_STRONG;
    if (score >= 0.5) return DECISIONS.TRUST_PRIOR_MODERATE;
    if (score >= 0.32) return DECISIONS.TRUST_PRIOR_LOW;
    return DECISIONS.HOLD_SOURCE_REVIEW;
  }

  function verificationBurden(score, classes, source) {
    const burden = [];
    if (classes.includes(SOURCE_CLASSES.FACT_CHECK_CERTIFIED)) burden.push('do_not_treat_certification_as_direct_evidence');
    if (classes.includes(SOURCE_CLASSES.LEGACY_MEDIA)) burden.push('seek_primary_source_or_full_transcript');
    if (classes.includes(SOURCE_CLASSES.GOVERNMENT_FUNDED_NGO)) burden.push('check_funding_and_partner_network');
    if (classes.includes(SOURCE_CLASSES.ADVOCACY_ORG)) burden.push('separate_claim_from_advocacy_frame');
    if (classes.includes(SOURCE_CLASSES.ANONYMOUS_SOCIAL_POST)) burden.push('require_external_corroborration_before_claim_support');
    if (score < 0.5) burden.push('cap_claim_probability_until_independent_support');
    if (!burden.length) burden.push('preserve_provenance_and_check_claim_level_evidence');
    return unique(burden);
  }

  function analyze(source = {}, options = {}) {
    const classes = detectClasses(source);
    const score = computeScore(classes, source);
    const decision = decisionFor(score, classes, source);
    const burden = verificationBurden(score, classes, source);
    const certificationMetadata = certificationIsMetadata(classes);

    return {
      packet_type: '42ndMind_source_trust_report_v0_4',
      packet_version: VERSION,
      created_at: now(),
      source_id: text(source.id || source.source_id || source.url || source.title),
      source_label: text(source.label || source.title || source.publisher || source.organization),
      source_classes: classes,
      trust_prior_score: score,
      decision,
      verification_burden: burden,
      certification_is_metadata_not_truth: certificationMetadata,
      automatic_trust_allowed: score >= 0.68 && !certificationMetadata,
      can_support_claim_directly: classes.some(c => [SOURCE_CLASSES.PRIMARY_DOCUMENT, SOURCE_CLASSES.DIRECT_TRANSCRIPT, SOURCE_CLASSES.RAW_DATASET, SOURCE_CLASSES.OFFICIAL_RECORD].includes(c)),
      claim_level_evidence_still_required: true,
      history_signals: historySignals(source),
      evidence_signals: evidenceSignals(source),
      contradiction_memory_effect: {
        contradicted_claims_are_not_deleted: true,
        contradicted_claims_become_inactive_pressure: true,
        repeated_source_contradictions_reduce_future_trust_prior: true
      },
      doctrine: {
        source_class_is_prior_not_truth: true,
        certification_does_not_replace_evidence: true,
        retrieval_is_not_verification: true,
        primary_evidence_can_overcome_low_source_class_prior: true,
        contradicted_beliefs_are_archived_not_erased: true,
        source_trust_updates_must_remain_falsifiable: true
      },
      raw: { source }
    };
  }

  function analyzeMany(sources, options = {}) {
    const reports = asArray(sources).map(s => analyze(s, options));
    return {
      packet_type: '42ndMind_source_trust_batch_report_v0_4',
      packet_version: VERSION,
      created_at: now(),
      count: reports.length,
      reports,
      summary: {
        strong: reports.filter(r => r.decision === DECISIONS.TRUST_PRIOR_STRONG).length,
        moderate: reports.filter(r => r.decision === DECISIONS.TRUST_PRIOR_MODERATE).length,
        low: reports.filter(r => r.decision === DECISIONS.TRUST_PRIOR_LOW).length,
        conflicted: reports.filter(r => r.decision === DECISIONS.TRUST_PRIOR_CONFLICTED).length,
        hold: reports.filter(r => r.decision === DECISIONS.HOLD_SOURCE_REVIEW).length
      },
      doctrine: {
        batch_source_review_is_not_claim_truth: true,
        trust_prior_must_be_joined_with_claim_evidence: true
      }
    };
  }

  function sampleSource(kind) {
    if (kind === 'ifcn') return {
      id:'sample_ifcn_certified_fact_checker',
      label:'IFCN-certified fact checker article',
      type:'fact-check certified legacy media partner',
      certification:'IFCN certified fact checker',
      transparent_funding:false,
      evidence:[],
      history:{ contradiction_count:1, correction_count:1 }
    };
    if (kind === 'primary') return {
      id:'sample_primary_document',
      label:'Court filing primary document',
      type:'primary document official record',
      evidence:[{ type:'primary document', text:'Original filing' }],
      history:{ primary_evidence_count:2, transparent_funding:true }
    };
    if (kind === 'legacy') return {
      id:'sample_legacy_media',
      label:'Legacy media article',
      type:'legacy media newspaper analysis',
      evidence:[],
      history:{ correction_count:2 }
    };
    if (kind === 'ngo') return {
      id:'sample_government_funded_ngo',
      label:'Government-funded NGO report',
      type:'government funded NGO advocacy report',
      evidence:[{ type:'secondary analysis' }],
      history:{ contradiction_count:2, correction_count:1 }
    };
    if (kind === 'anonymous') return {
      id:'sample_anonymous_social_post',
      label:'Anonymous social post',
      type:'anonymous social post rumor thread',
      evidence:[],
      history:{ contradiction_count:0 }
    };
    if (kind === 'redeemed_fact_check') return {
      id:'sample_fact_check_with_primary_evidence',
      label:'Fact-check article with primary transcript',
      type:'IFCN certified fact checker',
      transparent_funding:true,
      adversarial_audit:true,
      cross_ideological_accuracy:true,
      independent_source_count:2,
      evidence:[{ type:'direct transcript', text:'Full transcript linked' }, { type:'primary document', text:'Original record linked' }],
      history:{ contradiction_count:0, correction_count:0, primary_evidence_count:2 }
    };
    return { id:'sample_unknown', label:'Unknown source', type:'unknown' };
  }

  global.KernelSourceTrustV04 = Object.freeze({
    VERSION,
    SOURCE_CLASSES,
    DECISIONS,
    analyze,
    analyzeMany,
    sampleSource,
    detectClasses,
    computeScore,
    verificationBurden
  });
})(typeof window !== 'undefined' ? window : globalThis);
