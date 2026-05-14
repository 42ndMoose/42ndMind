/* 42ndMind Semantic Operator Grammar v0.1
 * Defines the first algebraic target for semantic language-math:
 * O(x) -> P | G | E | A | C
 *
 * O = semantic operator
 * P = pressure vector
 * G = legitimacy guard
 * E = evidence burden
 * A = kernel action
 * C = contrast class
 *
 * This module defines and validates operator grammar. It does not decide truth,
 * move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_operator_grammar_v0_1';

  const FIELDS = Object.freeze({
    OPERATOR: 'O',
    PRESSURE: 'P',
    GUARD: 'G',
    EVIDENCE: 'E',
    ACTION: 'A',
    CONTRAST: 'C'
  });

  const PRESSURES = Object.freeze([
    'closure_pressure',
    'dismissal_pressure',
    'authority_transfer_pressure',
    'trust_inflation_pressure',
    'source_trust_pressure',
    'ambiguity_pressure',
    'motive_agency_pressure',
    'direct_link_evidence_burden',
    'evidence_contact_pressure',
    'confidence_inflation_pressure',
    'uncertainty_calibration_pressure',
    'moral_risk_framing_pressure',
    'stigma_pressure',
    'social_proof_pressure',
    'support_inflation_pressure',
    'effectiveness_claim_pressure',
    'certification_pressure',
    'low_trust_prior_pressure',
    'provenance_uncertainty_pressure',
    'official_record_pressure',
    'direct_support_pressure',
    'contradiction_pressure',
    'negative_evidence_pressure',
    'interpretation_layer_pressure',
    'integrity_claim_pressure',
    'self_limiting_claim_pressure',
    'scope_pressure',
    'action_justification_pressure',
    'language_evidence_pressure'
  ]);

  const CANONICAL_OPERATORS = Object.freeze([
    {
      id: 'op_debunked_claim',
      operator: 'debunked(claim)',
      name: 'debunked',
      group: 'closure_dismissal',
      surface_terms: ['debunked', 'debunk', 'fact-checked false'],
      P: ['closure_pressure', 'dismissal_pressure'],
      G: 'Legitimate only if an inspectable evidence chain directly contradicts the exact claim being closed.',
      E: ['Extract the exact claim.', 'Inspect the cited evidence chain.', 'Check whether unresolved counter-considerations remain.'],
      A: 'Hold belief movement unless the evidence chain directly supports closure.',
      C: ['challenged(claim)', 'disputed(claim)', 'contradicted_by(record,claim)', 'lacks_evidence(claim)', 'false(claim)']
    },
    {
      id: 'op_disproven_claim',
      operator: 'disproven(claim)',
      name: 'disproven',
      group: 'closure_dismissal',
      surface_terms: ['disproven', 'proved false', 'refuted'],
      P: ['closure_pressure'],
      G: 'Legitimate only if the claim fails against direct contradiction, failed prediction, or stronger evidence than the claim requires.',
      E: ['State the claim precisely.', 'Identify the disproof mechanism.', 'Separate failed support from actual disproof.'],
      A: 'Convert to contradiction pressure only when the disproof mechanism is inspectable.',
      C: ['weakened(claim)', 'challenged(claim)', 'not_established(claim)']
    },
    {
      id: 'op_certified_source',
      operator: 'certified(source)',
      name: 'certified',
      group: 'authority_transfer',
      surface_terms: ['certified', 'approved', 'accredited'],
      P: ['authority_transfer_pressure', 'trust_inflation_pressure'],
      G: 'Certification is legitimate only as metadata about process or status; it does not prove the source conclusion.',
      E: ['Identify the certifier.', 'Define what certification covers.', 'Inspect claim-level evidence separately.'],
      A: 'Treat certification as metadata, not truth.',
      C: ['primary_document(evidence)', 'raw_data(evidence)', 'expert(source)', 'official_source(source)']
    },
    {
      id: 'op_fact_checker_source',
      operator: 'fact-checker(source)',
      name: 'fact-checker',
      group: 'source_trust',
      surface_terms: ['fact-checker', 'fact check', 'fact-check'],
      P: ['source_trust_pressure', 'authority_transfer_pressure'],
      G: 'Fact-checker status can change triage priority but cannot replace the reasoning and evidence used in the check.',
      E: ['Identify the rating.', 'Inspect the reasoning.', 'Inspect primary evidence cited by the fact-checker.'],
      A: 'Treat as secondary-source pressure until evidence chain is inspected.',
      C: ['primary_document(evidence)', 'direct_transcript(evidence)', 'expert_commentary(source)']
    },
    {
      id: 'op_expert_source',
      operator: 'expert(source)',
      name: 'expert',
      group: 'authority_transfer',
      surface_terms: ['expert', 'specialist', 'authority'],
      P: ['authority_transfer_pressure'],
      G: 'Expertise is legitimate prior pressure only when the domain fits the claim and the expert gives inspectable reasons.',
      E: ['Identify the expert.', 'Check domain fit.', 'Inspect the expert’s evidence or reasoning.'],
      A: 'Use as prior pressure, not direct evidence.',
      C: ['primary_document(evidence)', 'raw_data(evidence)', 'consensus(group)']
    },
    {
      id: 'op_consensus_group',
      operator: 'consensus(group)',
      name: 'consensus',
      group: 'authority_transfer',
      surface_terms: ['consensus', 'agreed by experts', 'settled science'],
      P: ['authority_transfer_pressure', 'closure_pressure'],
      G: 'Consensus is legitimate only when the group, scope, evidence basis, and remaining uncertainty are defined.',
      E: ['Define consensus group.', 'Define the exact question covered.', 'Inspect evidence basis and dissent boundary.'],
      A: 'Preserve consensus as scoped prior pressure, not automatic closure.',
      C: ['expert(source)', 'official_report(source)', 'raw_data(evidence)']
    },
    {
      id: 'op_they_reference',
      operator: 'they(reference)',
      name: 'they',
      group: 'reference_ambiguity',
      surface_terms: ['they', 'them', 'these people'],
      P: ['ambiguity_pressure'],
      G: 'A reference operator is legitimate only after the actor or target has been resolved.',
      E: ['Identify the referent.', 'Separate actor class from specific actor.', 'Check whether the claim changes after reference resolution.'],
      A: 'Block strong claim pressure until reference is resolved.',
      C: ['named_actor(actor)', 'institution(actor)', 'unknown_actor(reference)']
    },
    {
      id: 'op_this_reference',
      operator: 'this(reference)',
      name: 'this',
      group: 'reference_ambiguity',
      surface_terms: ['this', 'that', 'these', 'those'],
      P: ['ambiguity_pressure'],
      G: 'A deictic reference is legitimate only when the referenced evidence, event, or claim is identified.',
      E: ['Identify the referenced object.', 'Determine whether it is evidence, claim, or context.', 'Check whether the conclusion exceeds the reference.'],
      A: 'Ask for reference resolution before strong belief pressure.',
      C: ['named_evidence(evidence)', 'named_claim(claim)', 'context_marker(reference)']
    },
    {
      id: 'op_coordinated_actor_event',
      operator: 'coordinated(actor,event)',
      name: 'coordinated',
      group: 'motive_agency',
      surface_terms: ['coordinated', 'coordination', 'coordinated campaign'],
      P: ['motive_agency_pressure', 'direct_link_evidence_burden'],
      G: 'Coordination is legitimate only with direct link evidence or a strong structured pattern that defeats independent-convergence explanations.',
      E: ['Identify actors.', 'Identify shared event/message.', 'Look for communication records, timing, common source, or control channel.'],
      A: 'Hold motive/coordination claim until direct-link or strong pattern evidence is present.',
      C: ['similar(actor,event)', 'same_source(actor,event)', 'independent_convergence(actor,event)']
    },
    {
      id: 'op_agenda_actor',
      operator: 'agenda(actor)',
      name: 'agenda',
      group: 'motive_agency',
      surface_terms: ['agenda', 'hidden agenda', 'political agenda'],
      P: ['motive_agency_pressure'],
      G: 'Agenda framing is legitimate only when the goal, actor, mechanism, and evidence pattern are specified.',
      E: ['Identify actor.', 'Define alleged goal.', 'Show documents, incentives, repeated behavior, or admissions.'],
      A: 'Rewrite as bounded motive hypothesis unless evidence supports stronger framing.',
      C: ['policy_goal(actor)', 'incentive(actor)', 'observed_effect(event)']
    },
    {
      id: 'op_misinformation_claim',
      operator: 'misinformation(claim)',
      name: 'misinformation',
      group: 'moral_risk_framing',
      surface_terms: ['misinformation', 'disinformation', 'malinformation'],
      P: ['dismissal_pressure', 'closure_pressure', 'moral_risk_framing_pressure'],
      G: 'Misinformation labeling is legitimate only after the exact claim, falsity criteria, and evidence are specified.',
      E: ['Extract exact claim.', 'Define why it is false or misleading.', 'Inspect the evidence and harm pathway if risk is claimed.'],
      A: 'Clarify label before belief movement; do not let label substitute for falsity proof.',
      C: ['false(claim)', 'misleading(claim)', 'unverified(claim)', 'harmful(content)']
    },
    {
      id: 'op_primary_document_evidence',
      operator: 'primary_document(evidence)',
      name: 'primary_document',
      group: 'evidence_contact',
      surface_terms: ['primary document', 'original document', 'source document'],
      P: ['evidence_contact_pressure'],
      G: 'Primary document contact is legitimate only when the cited passage directly maps to the claim and scope.',
      E: ['Identify document.', 'Locate relevant passage.', 'Check date, authority, scope, and applicability.'],
      A: 'Allow bounded support pressure after passage-level inspection.',
      C: ['secondary_summary(source)', 'expert_commentary(source)', 'official_report(source)']
    },
    {
      id: 'op_transcript_evidence',
      operator: 'transcript(evidence)',
      name: 'transcript',
      group: 'evidence_contact',
      surface_terms: ['transcript', 'verbatim record', 'recording transcript'],
      P: ['evidence_contact_pressure', 'direct_support_pressure'],
      G: 'Transcript evidence is legitimate only when authentic, complete enough for the claim, and mapped to the exact statement.',
      E: ['Identify transcript source.', 'Check completeness.', 'Map exact quote or absence claim.'],
      A: 'Allow bounded support or contradiction pressure after authenticity/scope check.',
      C: ['clip(evidence)', 'summary(source)', 'hearsay(source)']
    },
    {
      id: 'op_raw_data_evidence',
      operator: 'raw_data(evidence)',
      name: 'raw_data',
      group: 'evidence_contact',
      surface_terms: ['raw data', 'dataset', 'underlying data'],
      P: ['evidence_contact_pressure'],
      G: 'Raw-data pressure is legitimate only after definitions, cleaning, exclusions, and method are understood.',
      E: ['Identify dataset.', 'Check definitions and exclusions.', 'Reproduce the relevant calculation.'],
      A: 'Allow bounded evidence pressure after method review.',
      C: ['published_summary(source)', 'chart(source)', 'interpretation(source)']
    },
    {
      id: 'op_contradicts_record_claim',
      operator: 'contradicts(record,claim)',
      name: 'contradicts',
      group: 'evidence_contact',
      surface_terms: ['contradicts', 'conflicts with', 'inconsistent with'],
      P: ['contradiction_pressure'],
      G: 'Contradiction is legitimate only when record and claim cannot both be true under the same definitions and scope.',
      E: ['State claim.', 'State record.', 'Check definitions, dates, scope, and possible reconciliation.'],
      A: 'Preserve contradiction pressure; do not resolve contradiction by deletion.',
      C: ['qualifies(record,claim)', 'weakens(record,claim)', 'different_scope(record,claim)']
    },
    {
      id: 'op_allegedly_claim',
      operator: 'allegedly(claim)',
      name: 'allegedly',
      group: 'uncertainty_calibration',
      surface_terms: ['allegedly', 'accused of', 'is alleged to'],
      P: ['uncertainty_calibration_pressure'],
      G: 'Allegation markers are legitimate when they preserve non-final status until evidence or adjudication changes it.',
      E: ['Identify who alleges it.', 'Identify evidence status.', 'Check whether adjudication or direct evidence exists.'],
      A: 'Preserve allegation status and block premature closure.',
      C: ['confirmed(claim)', 'found_by_court(claim)', 'rumored(claim)']
    },
    {
      id: 'op_probably_claim',
      operator: 'probably(claim)',
      name: 'probably',
      group: 'uncertainty_calibration',
      surface_terms: ['probably', 'likely', 'appears to', 'may'],
      P: ['uncertainty_calibration_pressure'],
      G: 'Probability language is legitimate when confidence remains bounded and proportional to evidence.',
      E: ['Identify evidence supporting probability.', 'Estimate alternatives.', 'Preserve uncertainty marker.'],
      A: 'Maintain bounded support; do not convert probability into certainty.',
      C: ['confirmed(claim)', 'possible(claim)', 'speculative(claim)']
    },
    {
      id: 'op_obviously_modifier',
      operator: 'obviously(modifier)',
      name: 'obviously',
      group: 'uncertainty_calibration',
      surface_terms: ['obviously', 'clearly', 'everyone knows'],
      P: ['confidence_inflation_pressure', 'closure_pressure'],
      G: 'Obviousness language is legitimate only as rhetoric after evidence is already inspectable; it cannot replace evidence.',
      E: ['Identify the underlying claim.', 'Remove the confidence modifier.', 'Inspect whether evidence still supports the claim.'],
      A: 'Strip confidence inflation and evaluate the underlying claim.',
      C: ['probably(claim)', 'evidence_shows(claim)', 'I_infer(claim)']
    },
    {
      id: 'op_harmful_content',
      operator: 'harmful(content)',
      name: 'harmful',
      group: 'moral_risk_framing',
      surface_terms: ['harmful', 'dangerous', 'unsafe'],
      P: ['moral_risk_framing_pressure', 'action_justification_pressure'],
      G: 'Harm framing is legitimate only when the mechanism, affected party, likelihood, severity, and comparison baseline are stated.',
      E: ['Define content or action.', 'Identify harm mechanism.', 'Estimate likelihood and severity.', 'Compare alternatives.'],
      A: 'Clarify harm mechanism before accepting action justification.',
      C: ['offensive(content)', 'false(claim)', 'unsafe(policy)', 'risk_tradeoff(policy)']
    },
    {
      id: 'op_extremist_label',
      operator: 'extremist(label)',
      name: 'extremist',
      group: 'moral_risk_framing',
      surface_terms: ['extremist', 'radical', 'dangerous rhetoric'],
      P: ['moral_risk_framing_pressure', 'stigma_pressure', 'dismissal_pressure'],
      G: 'Extremist labeling is legitimate only with explicit criteria and cited examples; otherwise it operates as stigma pressure.',
      E: ['Define criteria.', 'Identify target group or statement.', 'Quote examples.', 'Separate stigma from evidence.'],
      A: 'Require criteria and examples before accepting the label as meaningful.',
      C: ['controversial(label)', 'violent(statement)', 'outside_consensus(position)']
    },
    {
      id: 'op_official_source',
      operator: 'official_source(source)',
      name: 'official_source',
      group: 'source_trust',
      surface_terms: ['official source', 'government source', 'official record'],
      P: ['source_trust_pressure', 'authority_transfer_pressure'],
      G: 'Official status improves provenance but does not make interpretation or conclusion true.',
      E: ['Identify source authority.', 'Inspect document content.', 'Separate record from interpretation.'],
      A: 'Treat official status as provenance pressure only.',
      C: ['primary_document(evidence)', 'press_release(source)', 'anonymous_social_post(source)']
    },
    {
      id: 'op_anonymous_social_post',
      operator: 'anonymous_social_post(source)',
      name: 'anonymous_social_post',
      group: 'source_trust',
      surface_terms: ['anonymous account', 'anonymous post', 'unnamed account'],
      P: ['source_trust_pressure', 'low_trust_prior_pressure'],
      G: 'Anonymous source status lowers trust prior but does not automatically falsify inspectable evidence.',
      E: ['Separate source trust from evidence content.', 'Check document authenticity.', 'Look for independent corroboration.'],
      A: 'Keep low source prior while preserving inspectable evidence as possible evidence.',
      C: ['named_source(source)', 'primary_document(evidence)', 'leaked_document(evidence)']
    }
  ]);

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(); const out = []; asArray(items).forEach(item => { const value = text(item); const key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }

  function doctrine() {
    return {
      grammar_defines_operator_form_not_truth: true,
      operators_are_candidate_language_math_units: true,
      pressure_requires_legitimacy_guard_before_being_earned: true,
      evidence_burden_must_remain_visible: true,
      contrast_classes_prevent_semantic_collapse: true,
      grammar_does_not_move_belief: true,
      grammar_does_not_promote_doctrine: true,
      grammar_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function parseSignature(signature) {
    const raw = text(signature);
    const match = raw.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*\(([^)]*)\)$/);
    if (!match) return { ok:false, raw, name:raw, args:[], reason:'signature_does_not_match_name_args' };
    const args = match[2].split(',').map(a => text(a)).filter(Boolean);
    return { ok:true, raw, name:match[1], args, arity:args.length };
  }

  function validateOperator(definition) {
    const d = definition || {}, errors = [], warnings = [];
    if (!text(d.id)) errors.push('id missing');
    if (!text(d.operator)) errors.push('operator missing');
    const signature = parseSignature(d.operator);
    if (!signature.ok) errors.push('operator signature invalid');
    if (!text(d.name)) errors.push('name missing');
    if (!text(d.group)) errors.push('group missing');
    if (!Array.isArray(d.surface_terms) || !d.surface_terms.length) errors.push('surface_terms missing');
    if (!Array.isArray(d.P) || !d.P.length) errors.push('P pressure vector missing');
    asArray(d.P).forEach(p => { if (!PRESSURES.includes(text(p))) warnings.push(`unknown pressure ${p}`); });
    if (!text(d.G)) errors.push('G legitimacy guard missing');
    if (!Array.isArray(d.E) || !d.E.length) errors.push('E evidence burden missing');
    if (!text(d.A)) errors.push('A kernel action missing');
    if (!Array.isArray(d.C) || !d.C.length) errors.push('C contrast class missing');
    return { ok:errors.length === 0, id:text(d.id), errors, warnings, signature, definition:d, belief_movement:'none', doctrine:doctrine() };
  }

  function validateGrammar(grammar) {
    const g = grammar || defaultGrammar();
    const errors = [], warnings = [], seen = new Set();
    const operators = asArray(g.operators);
    if (!operators.length) errors.push('operators missing');
    const operator_reports = operators.map((op, index) => {
      const report = validateOperator(op);
      if (report.id) { if (seen.has(report.id)) report.errors.push(`duplicate id ${report.id}`); seen.add(report.id); }
      if (report.errors.length) errors.push(`operator ${index} invalid`);
      warnings.push.apply(warnings, report.warnings.map(w => `${report.id || index}: ${w}`));
      report.index = index;
      report.ok = report.errors.length === 0;
      return report;
    });
    return { packet_type:'42ndMind_semantic_operator_grammar_validation_report_v0_1', packet_version:VERSION, created_at:now(), ok:errors.length === 0, errors, warnings, operator_count:operators.length, valid_operator_count:operator_reports.filter(r => r.ok).length, invalid_operator_count:operator_reports.filter(r => !r.ok).length, operator_reports, belief_movement:'none', doctrine:doctrine() };
  }

  function defaultGrammar() {
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      algebraic_form: 'O(x) -> P | G | E | A | C',
      symbols: {
        O: 'semantic operator',
        P: 'pressure vector',
        G: 'legitimacy guard',
        E: 'evidence burden',
        A: 'kernel action',
        C: 'contrast class'
      },
      operators: clone(CANONICAL_OPERATORS),
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function operatorsByGroup(grammarOrGroup, maybeGroup) {
    const grammar = typeof grammarOrGroup === 'string' ? defaultGrammar() : (grammarOrGroup || defaultGrammar());
    const group = typeof grammarOrGroup === 'string' ? grammarOrGroup : maybeGroup;
    const key = lower(group);
    return asArray(grammar.operators).filter(op => lower(op.group) === key);
  }

  function findOperator(nameOrSignature, grammar) {
    const key = lower(parseSignature(nameOrSignature).name || nameOrSignature);
    return asArray((grammar || defaultGrammar()).operators).find(op => lower(op.name) === key || lower(parseSignature(op.operator).name) === key || lower(op.operator) === lower(nameOrSignature)) || null;
  }

  function pressureVectorFor(nameOrSignature, grammar) {
    const op = findOperator(nameOrSignature, grammar);
    return op ? clone(op.P) : [];
  }

  function contrastClassFor(nameOrSignature, grammar) {
    const op = findOperator(nameOrSignature, grammar);
    return op ? clone(op.C) : [];
  }

  function algebraLine(definition) {
    const d = definition || {};
    return `${text(d.operator)} -> P:[${asArray(d.P).join(', ')}] | G:${text(d.G)} | E:[${asArray(d.E).join('; ')}] | A:${text(d.A)} | C:[${asArray(d.C).join(', ')}]`;
  }

  function grammarRows(grammar) {
    return asArray((grammar || defaultGrammar()).operators).map(op => ({
      id: op.id,
      operator: op.operator,
      name: op.name,
      group: op.group,
      pressure_vector: clone(op.P),
      legitimacy_guard: op.G,
      evidence_burden: clone(op.E),
      kernel_action: op.A,
      contrast_class: clone(op.C),
      algebra: algebraLine(op)
    }));
  }

  function summarize(grammar) {
    const rows = grammarRows(grammar), groups = {}, pressures = {}, contrasts = {};
    rows.forEach(row => {
      groups[row.group] = (groups[row.group] || 0) + 1;
      row.pressure_vector.forEach(p => { pressures[p] = (pressures[p] || 0) + 1; });
      row.contrast_class.forEach(c => { const name = parseSignature(c).name || c; contrasts[name] = (contrasts[name] || 0) + 1; });
    });
    return { packet_type:'42ndMind_semantic_operator_grammar_summary_v0_1', packet_version:VERSION, created_at:now(), operator_count:rows.length, group_count:Object.keys(groups).length, pressure_count:Object.keys(pressures).length, contrast_count:Object.keys(contrasts).length, groups, pressures, contrasts, belief_movement:'none', doctrine:doctrine() };
  }

  function corpusOperatorToGrammarCandidate(corpusOperator, entry) {
    const op = corpusOperator || {};
    const signature = parseSignature(op.operator);
    const name = signature.name || text(op.operator);
    return {
      id: `candidate_op_${lower(name).replace(/[^a-z0-9_:-]+/g, '_')}`,
      operator: text(op.operator),
      name,
      group: text(entry && (entry.operator_group || entry.contrast_group) || 'candidate'),
      surface_terms: unique((entry && entry.surface_terms) || [name]),
      P: unique(op.pressure),
      G: text(op.legitimacy_condition),
      E: unique(entry && entry.evidence_burden || []),
      A: text(entry && entry.expected_kernel_response && entry.expected_kernel_response.belief_movement ? entry.expected_kernel_response.belief_movement : 'Preserve as candidate pressure pending review.'),
      C: unique([entry && entry.contrast_group].filter(Boolean)),
      source: 'semantic_corpus_candidate'
    };
  }

  function corpusEntriesToGrammarCandidates(corpusOrEntries) {
    const entries = Array.isArray(corpusOrEntries) ? corpusOrEntries : (corpusOrEntries && Array.isArray(corpusOrEntries.entries) ? corpusOrEntries.entries : []);
    const candidates = [];
    entries.forEach(entry => asArray(entry.semantic_operators).forEach(op => candidates.push(corpusOperatorToGrammarCandidate(op, entry))));
    return { packet_type:'42ndMind_semantic_operator_grammar_candidates_v0_1', packet_version:VERSION, created_at:now(), count:candidates.length, candidates, belief_movement:'none', doctrine:doctrine() };
  }

  function analyzeText(textValue, grammar) {
    const raw = lower(textValue);
    const matches = [];
    asArray((grammar || defaultGrammar()).operators).forEach(op => {
      const hitTerms = asArray(op.surface_terms).filter(term => raw.includes(lower(term)));
      if (hitTerms.length) matches.push({
        operator: op.operator,
        name: op.name,
        group: op.group,
        matched_terms: hitTerms,
        pressure_vector: clone(op.P),
        legitimacy_guard: op.G,
        evidence_burden: clone(op.E),
        kernel_action: op.A,
        contrast_class: clone(op.C),
        status: 'candidate_operator_match'
      });
    });
    return { packet_type:'42ndMind_semantic_operator_match_report_v0_1', packet_version:VERSION, created_at:now(), raw_text:text(textValue), match_count:matches.length, matches, belief_movement:'none', doctrine:doctrine() };
  }

  global.KernelSemanticOperatorGrammarV01 = Object.freeze({
    VERSION, PACKET_TYPE, FIELDS, PRESSURES, CANONICAL_OPERATORS,
    doctrine, parseSignature, validateOperator, validateGrammar, defaultGrammar,
    operatorsByGroup, findOperator, pressureVectorFor, contrastClassFor,
    algebraLine, grammarRows, summarize, corpusOperatorToGrammarCandidate,
    corpusEntriesToGrammarCandidates, analyzeText
  });
})(typeof window !== 'undefined' ? window : globalThis);
