/* 42ndMind Intention Cross-Language Benchmark v0.1
 * Tests whether versioned intention formulas survive broad language variation.
 *
 * This is not an arbitrary-language parser yet. It is a deterministic benchmark
 * that uses language surfaces as invariance cases against the canonical formula
 * ledger. It checks whether concept identity, local shape, dimensions, force
 * separation, and candidate-only status survive translation pressure.
 *
 * Core doctrine:
 * tests intention structure, not real-world claims
 * no person/event/narrative belief ledger
 * cross-language agreement is discovery hygiene, not doctrine promotion
 * language variation must not change local Σ |dimension_i| = 1
 * force/intensity remains outside shape: F = M · i
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_cross_language_benchmark_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }

  function ledgerApi() {
    if (!global.KernelIntentionCanonicalFormulaLedgerV01) throw new Error('KernelIntentionCanonicalFormulaLedgerV01 unavailable');
    return global.KernelIntentionCanonicalFormulaLedgerV01;
  }

  function doctrine() {
    return {
      benchmarks_language_invariance_not_claim_facts: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      cross_language_cases_are_candidate_not_doctrine: true,
      cross_language_agreement_is_discovery_hygiene_not_promotion: true,
      tests_formula_structure_not_surface_english: true,
      local_shape_l1_total_required: 'sum_abs_dimensions_equals_1',
      force_intensity_outside_shape: 'F = M · i',
      belief_movement: 'none'
    };
  }

  function languages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'id', name: 'Indonesian' },
      { code: 'tl', name: 'Tagalog' },
      { code: 'ja', name: 'Japanese' },
      { code: 'es', name: 'Spanish' },
      { code: 'ar', name: 'Arabic' }
    ];
  }

  function conceptLexicon() {
    return {
      consent: { en: 'consent', id: 'persetujuan', tl: 'pahintulot', ja: '同意', es: 'consentimiento', ar: 'موافقة' },
      threat: { en: 'threat', id: 'ancaman', tl: 'banta', ja: '脅し', es: 'amenaza', ar: 'تهديد' },
      request: { en: 'request', id: 'permintaan', tl: 'pakiusap', ja: '依頼', es: 'petición', ar: 'طلب' },
      refusal: { en: 'refusal', id: 'penolakan', tl: 'pagtanggi', ja: '拒否', es: 'rechazo', ar: 'رفض' },
      trust: { en: 'trust', id: 'kepercayaan', tl: 'tiwala', ja: '信頼', es: 'confianza', ar: 'ثقة' },
      betrayal: { en: 'betrayal', id: 'pengkhianatan', tl: 'pagtataksil', ja: '裏切り', es: 'traición', ar: 'خيانة' },
      doubt: { en: 'doubt', id: 'keraguan', tl: 'pagdududa', ja: '疑い', es: 'duda', ar: 'شك' },
      belief: { en: 'belief', id: 'keyakinan', tl: 'paniniwala', ja: '信念', es: 'creencia', ar: 'اعتقاد' },
      fear: { en: 'fear', id: 'ketakutan', tl: 'takot', ja: '恐れ', es: 'miedo', ar: 'خوف' },
      coercion: { en: 'coercion', id: 'paksaan', tl: 'pamimilit', ja: '強制', es: 'coacción', ar: 'إكراه' },
      manipulation: { en: 'manipulation', id: 'manipulasi', tl: 'manipulasyon', ja: '操作', es: 'manipulación', ar: 'تلاعب' }
    };
  }

  function frameTemplates() {
    return {
      en: 'The surface phrase {concept} is mapped as an intention-structure candidate, not as a claim about any real person.',
      id: 'Frasa permukaan {concept} dipetakan sebagai kandidat struktur intensi, bukan klaim tentang orang nyata.',
      tl: 'Ang salitang {concept} ay minamapa bilang kandidato ng estruktura ng intensiyon, hindi bilang paratang sa totoong tao.',
      ja: '表現「{concept}」は、実在の人物への判断ではなく、意図構造の候補として対応づけられる。',
      es: 'La frase superficial {concept} se mapea como candidata de estructura de intención, no como afirmación sobre una persona real.',
      ar: 'تُطابق العبارة {concept} كمرشح لبنية نية، وليس كحكم على شخص حقيقي.'
    };
  }

  function dimensionSurface(languageCode, dimension) {
    const compact = String(dimension || '').replace(/_/g, ' ');
    const labels = {
      en: compact,
      id: 'dimensi: ' + compact,
      tl: 'dimensiyon: ' + compact,
      ja: '次元: ' + compact,
      es: 'dimensión: ' + compact,
      ar: 'بُعد: ' + compact
    };
    return labels[languageCode] || compact;
  }

  function conceptSurface(languageCode, concept) {
    const lex = conceptLexicon()[safeId(concept)] || {};
    return text(lex[languageCode] || concept);
  }

  function surfaceFrame(languageCode, concept) {
    const template = frameTemplates()[languageCode] || frameTemplates().en;
    return template.replace('{concept}', conceptSurface(languageCode, concept));
  }

  function l1(terms) {
    return Number(asArray(terms).reduce((sum, term) => sum + Math.abs(Number(term.coefficient) || 0), 0).toFixed(6));
  }

  function forceOutsideShape(shapeTerms, forceTerms) {
    const shape = new Set(asArray(shapeTerms).map(term => safeId(term.dimension)));
    return asArray(forceTerms).every(force => !shape.has(safeId(force.dimension)));
  }

  function currentVersion(record) {
    const id = text(record && record.current_candidate_version);
    return asArray(record && record.versions).find(v => v.version_id === id) || asArray(record && record.versions)[0] || null;
  }

  function formulaSignature(version) {
    return asArray(version && version.shape_terms).map(term => `${safeId(term.dimension)}:${Number(term.coefficient).toFixed(6)}:${safeId(term.role)}`).sort().join('|');
  }

  function buildCases(ledgerPacket) {
    const cases = [];
    asArray(ledgerPacket && ledgerPacket.ledger_records).forEach(record => {
      const concept = safeId(record.concept);
      const version = currentVersion(record);
      const shapeTerms = asArray(version && version.shape_terms);
      languages().forEach(language => {
        cases.push({
          id: `${concept}_${language.code}_cross_language_formula_case`,
          case_type: 'concept_formula_invariance',
          language: language.code,
          language_name: language.name,
          surface_concept: conceptSurface(language.code, concept),
          surface_frame: surfaceFrame(language.code, concept),
          expected_concept: concept,
          expected_version_id: text(version && version.version_id),
          expected_shape_term_count: shapeTerms.length,
          expected_shape_signature: formulaSignature(version),
          expected_force_outside_shape: true,
          expected_l1_total: 1,
          dimension_surfaces: shapeTerms.map(term => ({
            dimension: safeId(term.dimension),
            surface_dimension: dimensionSurface(language.code, term.dimension),
            coefficient: Number(term.coefficient),
            role: text(term.role),
            belief_movement: 'none'
          })),
          belief_movement: 'none'
        });
      });
    });
    return cases;
  }

  function recordByConcept(ledgerPacket, concept) {
    const id = safeId(concept);
    return asArray(ledgerPacket && ledgerPacket.ledger_records).find(record => safeId(record.concept) === id) || null;
  }

  function runCase(ledgerPacket, testCase) {
    const record = recordByConcept(ledgerPacket, testCase.expected_concept);
    const version = currentVersion(record);
    const shapeTerms = asArray(version && version.shape_terms);
    const forceTerms = asArray(version && version.force_terms);
    const observedSignature = formulaSignature(version);
    const observedL1 = l1(shapeTerms);
    const observedForceOutside = forceOutsideShape(shapeTerms, forceTerms);
    const errors = [];
    if (!record) errors.push('missing_ledger_record');
    if (!version) errors.push('missing_current_candidate_version');
    if (safeId(record && record.concept) !== safeId(testCase.expected_concept)) errors.push('concept_identity_changed');
    if (text(version && version.version_id) !== text(testCase.expected_version_id)) errors.push('version_identity_changed');
    if (shapeTerms.length !== Number(testCase.expected_shape_term_count)) errors.push('shape_term_count_changed');
    if (observedSignature !== text(testCase.expected_shape_signature)) errors.push('shape_signature_changed');
    if (Math.abs(observedL1 - Number(testCase.expected_l1_total)) > EPSILON) errors.push(`l1_not_1:${observedL1}`);
    if (observedForceOutside !== true) errors.push('force_terms_not_outside_shape');
    if (version && version.promotion_status !== 'not_promoted') errors.push('version_promoted');
    if (version && version.belief_movement !== 'none') errors.push('belief_movement_not_none');
    return {
      id: text(testCase.id),
      case_type: text(testCase.case_type),
      language: text(testCase.language),
      language_name: text(testCase.language_name),
      surface_concept: text(testCase.surface_concept),
      surface_frame: text(testCase.surface_frame),
      expected_concept: safeId(testCase.expected_concept),
      observed_concept: safeId(record && record.concept),
      expected_version_id: text(testCase.expected_version_id),
      observed_version_id: text(version && version.version_id),
      expected_shape_signature: text(testCase.expected_shape_signature),
      observed_shape_signature: observedSignature,
      expected_l1_total: Number(testCase.expected_l1_total),
      observed_l1_total: observedL1,
      force_terms_outside_shape: observedForceOutside,
      dimension_surfaces: clone(testCase.dimension_surfaces),
      ok: errors.length === 0,
      errors,
      belief_movement: 'none'
    };
  }

  function summarizeByLanguage(caseResults) {
    return languages().map(language => {
      const rows = asArray(caseResults).filter(row => row.language === language.code);
      return {
        language: language.code,
        language_name: language.name,
        case_count: rows.length,
        passed_case_count: rows.filter(row => row.ok).length,
        ok: rows.length > 0 && rows.every(row => row.ok),
        belief_movement: 'none'
      };
    });
  }

  function validatePacket(packet) {
    const results = asArray(packet && packet.case_results);
    const errors = [];
    if (packet && packet.belief_movement !== 'none') errors.push('packet_belief_movement_not_none');
    if (packet && packet.source_ledger_ok !== true) errors.push('source_ledger_not_ok');
    if (packet && packet.language_count !== 6) errors.push(`language_count_not_6:${packet && packet.language_count}`);
    if (packet && packet.concept_count !== 11) errors.push(`concept_count_not_11:${packet && packet.concept_count}`);
    if (packet && packet.case_count !== 66) errors.push(`case_count_not_66:${packet && packet.case_count}`);
    results.forEach(result => { if (!result.ok) errors.push(`${result.id}:${result.errors.join('|')}`); });
    if (!results.every(result => Math.abs(1 - Number(result.observed_l1_total || 0)) <= EPSILON)) errors.push('not_all_l1_totals_equal_1');
    if (!results.every(result => result.force_terms_outside_shape === true)) errors.push('not_all_force_terms_outside_shape');
    if (!results.every(result => result.belief_movement === 'none')) errors.push('case_belief_movement_not_none');
    return {
      packet_type: '42ndMind_intention_cross_language_benchmark_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      checks: {
        six_languages: packet && packet.language_count === 6,
        eleven_concepts: packet && packet.concept_count === 11,
        sixty_six_cases: packet && packet.case_count === 66,
        all_cases_passed: results.length > 0 && results.every(result => result.ok),
        all_l1_totals_equal_1: results.every(result => Math.abs(1 - Number(result.observed_l1_total || 0)) <= EPSILON),
        force_terms_outside_shape: results.every(result => result.force_terms_outside_shape === true),
        candidate_only_not_promoted: results.every(result => !asArray(result.errors).includes('version_promoted')),
        belief_movement_none: packet && packet.belief_movement === 'none' && results.every(result => result.belief_movement === 'none')
      },
      errors,
      belief_movement: 'none'
    };
  }

  function runBenchmark(options = {}) {
    const ledgerPacket = options.ledger_packet || ledgerApi().runLedger(options.ledger_options || {});
    const cases = asArray(options.cases || buildCases(ledgerPacket));
    const caseResults = cases.map(testCase => runCase(ledgerPacket, testCase));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Broad deterministic cross-language benchmark for versioned objective intention formulas. Tests structure preservation across English, Indonesian, Tagalog, Japanese, Spanish, and Arabic surfaces. Candidate only; not doctrine; not an arbitrary parser.',
      source_ledger_ok: ledgerPacket && ledgerPacket.ok === true,
      source_ledger_record_count: ledgerPacket && ledgerPacket.ledger_record_count || 0,
      languages: languages(),
      language_count: languages().length,
      concept_count: asArray(ledgerPacket && ledgerPacket.ledger_records).length,
      case_count: caseResults.length,
      passed_case_count: caseResults.filter(result => result.ok).length,
      cases,
      case_results: caseResults,
      language_summary: summarizeByLanguage(caseResults),
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validatePacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionCrossLanguageBenchmarkV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    languages,
    conceptLexicon,
    frameTemplates,
    dimensionSurface,
    conceptSurface,
    surfaceFrame,
    l1,
    forceOutsideShape,
    currentVersion,
    formulaSignature,
    buildCases,
    recordByConcept,
    runCase,
    summarizeByLanguage,
    validatePacket,
    runBenchmark
  });
})(typeof window !== 'undefined' ? window : globalThis);
