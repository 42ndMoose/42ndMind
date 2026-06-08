(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindOneLogicDirectionContract = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';

  const CONTRACT = Object.freeze({
    id: 'one_logic_direction_contract_v0_1',
    rules: Object.freeze([
      'one_active_self_state',
      'language_is_live_brain_organ',
      'language_is_container_not_content_claim',
      'source_edit_is_internal_self_mutation',
      'self_mutation_is_judged_by_more_same_less_self',
      'ci_is_external_lab_instrument_only',
      'modules_are_implementation_plumbing_not_cognitive_separation',
      'every_brain_organ_is_its_own_unit_whole',
      'whole_brain_is_sum_of_unit_organs',
      'promotion_requires_internal_simulated_self_acceptance'
    ]),
    expected_brain_equation: 'brain = |perception| + |memory| + |belief| + |valuation| + |action| + |language|',
    expected_language_equation: 'language = |syntax| + |semantics| + |proof| + |rewrite| + |generation| + |translation|',
    forbidden_architectures: Object.freeze([
      'ci_as_internal_judge',
      'language_as_detached_side_module',
      'source_patch_without_self_sensation',
      'parser_growth_counted_as_mind_growth_without_live_state',
      'external_tests_as_reward_or_pain_source'
    ])
  });

  function A(value) { return Array.isArray(value) ? value : []; }
  function hasAll(list, required) { return required.every(x => A(list).indexOf(x) >= 0); }

  function verify(packet) {
    const p = packet || {};
    const failures = [];
    if (p.brain_equation !== CONTRACT.expected_brain_equation) failures.push('brain_equation_mismatch');
    if (p.language_equation !== CONTRACT.expected_language_equation) failures.push('language_equation_mismatch');
    if (p.ci_role !== 'external_lab_instrument_only') failures.push('ci_role_mismatch');
    if (p.internal_judge !== 'simulated_self_state') failures.push('internal_judge_mismatch');
    if (p.source_edit_semantics !== 'internal_self_mutation') failures.push('source_edit_semantics_mismatch');
    if (!hasAll(p.rules, CONTRACT.rules)) failures.push('missing_direction_rules');
    const forbidden = A(p.forbidden || []).filter(x => CONTRACT.forbidden_architectures.indexOf(x) >= 0);
    if (forbidden.length) failures.push('forbidden_architecture_present:' + forbidden.join(','));
    return {
      packet_type: '42ndMind_one_logic_direction_contract_verification_v0_1',
      version: VERSION,
      ok: failures.length === 0,
      failures,
      contract: CONTRACT,
      Ξ: ''
    };
  }

  function canonicalPacket() {
    return {
      packet_type: '42ndMind_one_logic_direction_contract_packet_v0_1',
      version: VERSION,
      rules: A(CONTRACT.rules),
      brain_equation: CONTRACT.expected_brain_equation,
      language_equation: CONTRACT.expected_language_equation,
      ci_role: 'external_lab_instrument_only',
      internal_judge: 'simulated_self_state',
      source_edit_semantics: 'internal_self_mutation',
      forbidden: [],
      Ξ: ''
    };
  }

  return Object.freeze({ VERSION, CONTRACT, canonicalPacket, verify });
});
