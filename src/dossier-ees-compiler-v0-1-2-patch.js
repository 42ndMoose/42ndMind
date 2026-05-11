/* 42ndMind Dossier EES Compiler v0.1.2 patch
 * Patch over DossierEESCompilerV01 after v0.1.1.
 *
 * Fix:
 * v0.1.1 allowed unresolved command/intent questions, but still flagged
 * restraint language such as "does not prove command or motive" when the
 * mechanism class was institutional_or_incentive_convergence.
 *
 * Rule:
 * - affirmative direct_coordination without source remains a hard issue.
 * - affirmative command/intent language without source remains an issue unless
 *   it is explicitly preserved as unresolved/overclaim.
 * - negated restraint language such as "does not prove motive" is allowed and
 *   reported as a warning only when overclaim_flags/unresolved_questions preserve
 *   the boundary.
 */
(function (global) {
  'use strict';

  if (!global.DossierEESCompilerV01 || typeof global.DossierEESCompilerV01.validatePacket !== 'function') {
    global.DossierEESCompilerV012PatchStatus = { installed:false, reason:'DossierEESCompilerV01_missing' };
    return;
  }

  const BASE = global.DossierEESCompilerV01;
  const VERSION = '0.1.2-patch';

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function now() { return new Date().toISOString(); }
  function mechanismText(mech) { return `${mech.label || ''} ${mech.scope_note || ''} ${asArray(mech.overclaim_flags).join(' ')} ${asArray(mech.unresolved_questions).join(' ')}`; }
  function hasCommandIntentLanguage(mech) { return /\b(intent|motive|deliberate|command|ordered|coordinated|coordination)\b/i.test(mechanismText(mech)); }
  function hasNegatedRestraintLanguage(mech) {
    const s = mechanismText(mech);
    return /\b(does not|do not|not|without|no)\b[^.]{0,90}\b(prove|establish|show|support)\b[^.]{0,90}\b(intent|motive|command|coordination|direct coordination)\b/i.test(s) ||
      /\b(intent|motive|command|direct_coordination|direct coordination)\b[^.]{0,50}\b(not established|unproven|not proven|unresolved)\b/i.test(s);
  }
  function hasBoundaryMarkers(mech) {
    return asArray(mech.unresolved_questions).length > 0 ||
      asArray(mech.overclaim_flags).some(flag => /not_established|unresolved|unproven|overclaim/i.test(text(flag))) ||
      /not established|unproven|not proven|unresolved/i.test(mechanismText(mech));
  }
  function isUnresolvedAllowed(mech) {
    return ['unresolved_mechanism','unsupported_conspiracy_overclaim'].includes(text(mech.mechanism_class)) &&
      (asArray(mech.unresolved_questions).length > 0 || asArray(mech.overclaim_flags).length > 0 || text(mech.support_status) === 'unresolved');
  }

  function validatePacket(packet = {}) {
    const report = global.EntityEventSourceRegistryV01 && typeof global.EntityEventSourceRegistryV01.importPacket === 'function'
      ? global.EntityEventSourceRegistryV01.importPacket(packet)
      : null;
    const issues = [];
    const warnings = [];

    if (packet.packet_type !== '42ndMind_entity_event_source_packet') issues.push('wrong_packet_type');
    if (!asArray(packet.entities).length) issues.push('no_entities');
    if (!asArray(packet.events).length) issues.push('no_events');
    if (!asArray(packet.mechanisms).length) issues.push('no_mechanisms');

    asArray(packet.mechanisms).forEach(mech => {
      const id = text(mech.id);
      const hasSource = asArray(mech.source_ids).length > 0;
      if (mech.mechanism_class === 'direct_coordination' && !hasSource) {
        issues.push(`direct_coordination_without_source:${id}`);
        return;
      }
      if (hasCommandIntentLanguage(mech) && !hasSource) {
        if (hasNegatedRestraintLanguage(mech) && hasBoundaryMarkers(mech)) warnings.push(`negated_intent_or_command_boundary_without_source:${id}`);
        else if (isUnresolvedAllowed(mech)) warnings.push(`unresolved_intent_or_command_language_without_source:${id}`);
        else issues.push(`intent_or_command_language_without_source:${id}`);
      }
    });

    return {
      packet_type: '42ndMind_dossier_ees_validation_report',
      packet_version: VERSION,
      created_at: now(),
      valid_shape: issues.length === 0,
      issues,
      warnings,
      registry_report: report,
      all_passed: issues.length === 0 && (!report || report.all_passed === true),
      doctrine: {
        validation_only: true,
        metadata_only: true,
        belief_movement: 'none',
        scoring_allowed: false,
        kernel_state_mutation: false,
        negated_intent_or_command_boundaries_allowed: true,
        unresolved_intent_questions_are_allowed_as_questions_not_claims: true,
        direct_coordination_still_requires_direct_evidence: true
      }
    };
  }

  function reviewedCaseFromValidation(validation = {}) {
    const issues = asArray(validation.issues);
    const warnings = asArray(validation.warnings);
    return {
      id: `case_dossier_ees_validation_${Date.now().toString(36)}`,
      title: 'Dossier entity/event/source extraction validation',
      case_kind: 'dossier_ees_compiler_validation',
      observed_failure: issues.length ? `Validation issues: ${issues.join(', ')}` : '',
      observed_success: issues.length ? '' : 'Dossier section produced valid entity/event/source packet shape.',
      signals: [...issues, ...warnings],
      cap_reasons: issues.includes('no_entities') || issues.includes('no_events') || issues.includes('no_mechanisms') ? ['no_structured_reality_map'] : [],
      classification: issues.length ? 'needs_revision' : 'metadata_ready',
      source_review_status: 'unreviewed',
      unresolved_questions: [...issues.map(issue => `Resolve validation issue: ${issue}`), ...warnings.map(w => `Review warning: ${w}`)]
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
        'Preserve unresolved questions, warnings, and overclaim flags.'
      ] : [
        'Revise packet until validation passes.',
        'Avoid affirmative direct coordination or intent claims without direct source support.',
        'Use negated boundary language or unresolved questions when command/intent is not established.'
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

  global.DossierEESCompilerV01 = Object.freeze({
    ...BASE,
    VERSION,
    validatePacket,
    compileFromPacket,
    reviewedCaseFromValidation
  });
  global.DossierEESCompilerV012PatchStatus = { installed:true, version:VERSION };
})(typeof window !== 'undefined' ? window : globalThis);
