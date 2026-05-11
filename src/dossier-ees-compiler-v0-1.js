/* 42ndMind Dossier -> Entity/Event/Source Compiler v0.1
 * Browser-side helper for converting dossier sections into kernel-readable
 * entity_event_source_packet objects.
 *
 * This module does not extract by itself with hidden model logic. It builds a
 * strict LLM extraction prompt, validates the returned packet, and keeps the
 * output metadata-only until source review and kernel approval.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }

  function extractUrls(input) {
    const matches = text(input).match(/https?:\/\/[^\s)\]}"']+/g) || [];
    return Array.from(new Set(matches));
  }

  function compilerContract() {
    return {
      packet_type: '42ndMind_dossier_ees_compiler_contract',
      packet_version: VERSION,
      target_packet_type: '42ndMind_entity_event_source_packet',
      doctrine: {
        non_scoring: true,
        metadata_only: true,
        named_entity_is_not_guilt: true,
        event_is_not_proof_of_motive: true,
        mechanism_classification_is_not_verdict: true,
        direct_coordination_requires_direct_evidence: true,
        convergence_is_not_command_proof: true,
        intention_requires_direct_intent_evidence: true,
        preserve_unresolved_questions: true,
        retrieval_is_not_verification: true,
        provenance_is_not_proof: true,
        kernel_owns_belief_movement: true
      },
      allowed_mechanism_classes: [
        'direct_coordination',
        'institutional_or_incentive_convergence',
        'shared_enforcement_pipeline',
        'funding_or_dependency_pressure',
        'reputational_or_advertiser_pressure',
        'platform_policy_enforcement',
        'unsupported_conspiracy_overclaim',
        'unresolved_mechanism'
      ],
      required_output_rules: [
        'Return only JSON.',
        'Use packet_type: 42ndMind_entity_event_source_packet.',
        'Represent named people, organizations, platforms, funders, policies, documents, and statements as entities.',
        'Represent dated or period-bound happenings as events.',
        'Represent causal/coordination claims as mechanisms.',
        'Do not infer guilt, intent, command, or motive unless the provided text gives direct support.',
        'If direct coordination is not directly evidenced, use institutional_or_incentive_convergence, shared_enforcement_pipeline, or unresolved_mechanism instead.',
        'Use unsupported_conspiracy_overclaim when the text leaps from pattern to command/intent without enough support.',
        'Add unresolved questions for missing dates, unclear actors, weak source mapping, or motive uncertainty.',
        'Use source_ids consistently, but do not treat source_ids as verification.'
      ]
    };
  }

  function buildPrompt(dossierText = '', options = {}) {
    const urls = extractUrls(dossierText);
    const title = text(options.title) || 'Pasted dossier section';
    const contract = compilerContract();
    const skeleton = {
      packet_type: '42ndMind_entity_event_source_packet',
      packet_version: '0.1.0',
      purpose: 'Structured named reality-map extraction from dossier section. Metadata only.',
      entities: [
        { id: 'entity_example', name: 'Named actor or organization', entity_type: 'actor|organization|platform|funder|policy|document|public_statement|mechanism|other', role_hint: '', aliases: [], source_ids: [], claim_ids: [], evidence_ids: [], unresolved_questions: [], notes: [] }
      ],
      events: [
        { id: 'event_example', title: 'Named event or dated action', event_type: 'policy_change|public_statement|funding_action|enforcement_action|coordination_event|publication|legal_event|platform_action|other', date: '', date_precision: 'unknown|year|month|day', entity_ids: [], source_ids: [], claim_ids: [], evidence_ids: [], unresolved_questions: [], notes: [] }
      ],
      mechanisms: [
        { id: 'mechanism_example', label: 'Claimed mechanism', mechanism_class: 'unresolved_mechanism', support_status: 'unreviewed|source_visible|mechanism_supported|evidence_backed|weakened|contradicted|unresolved', entity_ids: [], event_ids: [], source_ids: [], claim_ids: [], evidence_ids: [], counter_evidence_ids: [], unresolved_questions: [], scope_note: '', overclaim_flags: [] }
      ],
      links: [
        { from_id: 'entity_example', to_id: 'event_example', relation: 'named_in_context_of', source_ids: [], note: '', support_status: 'unreviewed' }
      ],
      unresolved_questions: [
        { id: 'q_example', text: 'What is still unclear?', related_ids: [], status: 'open' }
      ]
    };

    return [
      'You are compiling a dossier section into a 42ndMind entity/event/source packet.',
      '',
      'Do not write prose. Return only valid JSON.',
      '',
      'Contract:',
      JSON.stringify(contract, null, 2),
      '',
      'Output skeleton:',
      JSON.stringify(skeleton, null, 2),
      '',
      'Extraction target title:',
      title,
      '',
      'URLs noticed in the pasted section. Use these as source_ids or locator hints only if relevant. Retrieval is not verification:',
      JSON.stringify(urls.map((url, i) => ({ suggested_source_id: `source_${String(i + 1).padStart(3, '0')}`, url })), null, 2),
      '',
      'Dossier section:',
      '```text',
      text(dossierText),
      '```'
    ].join('\n');
  }

  function validatePacket(packet = {}) {
    const report = global.EntityEventSourceRegistryV01 && typeof global.EntityEventSourceRegistryV01.importPacket === 'function'
      ? global.EntityEventSourceRegistryV01.importPacket(packet)
      : null;
    const issues = [];
    if (packet.packet_type !== '42ndMind_entity_event_source_packet') issues.push('wrong_packet_type');
    if (!asArray(packet.entities).length) issues.push('no_entities');
    if (!asArray(packet.events).length) issues.push('no_events');
    if (!asArray(packet.mechanisms).length) issues.push('no_mechanisms');
    asArray(packet.mechanisms).forEach(mech => {
      if (mech.mechanism_class === 'direct_coordination' && !asArray(mech.source_ids).length) issues.push(`direct_coordination_without_source:${text(mech.id)}`);
      if (/intent|motive|deliberate|command|ordered|coordinated/i.test(`${mech.label || ''} ${mech.scope_note || ''}`) && !asArray(mech.source_ids).length) {
        issues.push(`intent_or_command_language_without_source:${text(mech.id)}`);
      }
    });
    return {
      packet_type: '42ndMind_dossier_ees_validation_report',
      packet_version: VERSION,
      created_at: now(),
      valid_shape: issues.length === 0,
      issues,
      registry_report: report,
      all_passed: issues.length === 0 && (!report || report.all_passed === true),
      doctrine: {
        validation_only: true,
        metadata_only: true,
        belief_movement: 'none',
        scoring_allowed: false,
        kernel_state_mutation: false
      }
    };
  }

  function reviewedCaseFromValidation(validation = {}) {
    const issues = asArray(validation.issues);
    return {
      id: `case_dossier_ees_validation_${Date.now().toString(36)}`,
      title: 'Dossier entity/event/source extraction validation',
      case_kind: 'dossier_ees_compiler_validation',
      observed_failure: issues.length ? `Validation issues: ${issues.join(', ')}` : '',
      observed_success: issues.length ? '' : 'Dossier section produced valid entity/event/source packet shape.',
      signals: issues,
      cap_reasons: issues.includes('no_entities') || issues.includes('no_events') || issues.includes('no_mechanisms') ? ['no_structured_reality_map'] : [],
      classification: issues.length ? 'needs_revision' : 'metadata_ready',
      source_review_status: 'unreviewed',
      unresolved_questions: issues.map(issue => `Resolve validation issue: ${issue}`)
    };
  }

  function compileFromPacket(packet = {}) {
    const validation = validatePacket(packet);
    return {
      packet_type: '42ndMind_dossier_ees_compile_report',
      packet_version: VERSION,
      created_at: now(),
      validation,
      reviewed_case: reviewedCaseFromValidation(validation),
      next_steps: validation.all_passed ? [
        'Save entity/event/source registry as metadata only.',
        'Run source review before converting mechanisms into claim/evidence pressure.',
        'Preserve unresolved questions and overclaim flags.'
      ] : [
        'Revise packet until validation passes.',
        'Avoid direct coordination or intent claims without direct source support.',
        'Add entities, events, mechanisms, links, and unresolved questions.'
      ],
      doctrine: {
        compiler_is_not_belief_update: true,
        metadata_only: true,
        scoring_allowed: false,
        belief_movement: 'none',
        kernel_owns_belief_movement: true
      }
    };
  }

  function sampleDossierText() {
    return 'Organization Y appeared in the context of Platform X policy-category changes in 2021. The visible pattern may support a shared enforcement pipeline, but the section does not yet prove that Organization Y directly commanded Platform X or had private intent. Open question: did Organization Y directly request enforcement, or only supply classification language?';
  }

  global.DossierEESCompilerV01 = Object.freeze({
    VERSION,
    extractUrls,
    compilerContract,
    buildPrompt,
    validatePacket,
    compileFromPacket,
    reviewedCaseFromValidation,
    sampleDossierText
  });
})(typeof window !== 'undefined' ? window : globalThis);
