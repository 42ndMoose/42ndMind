/* 42ndMind Intention Refinement v0.1
 * Applies deterministic contrast pressure to candidate intention concept-shapes.
 *
 * This is not a claim-intent detector and not a belief/world-model ledger.
 * It does not decide whether a real person had an intention.
 * It refines candidate objective intention formulas by separating core shape,
 * boundary shape, expression/derivative shape, force, and unresolved dimensions.
 *
 * Core doctrine:
 * intention_type = 1
 * refined_shape remains Σ |dimension_i| = 1
 * force/intensity remains separate from shape
 * contrast pressure refines formulas but does not promote doctrine
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_refinement_v0_1';
  const EPSILON = 0.000001;

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
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

  function discoveryApi() {
    if (!global.KernelIntentionDiscoveryV01) throw new Error('KernelIntentionDiscoveryV01 unavailable');
    return global.KernelIntentionDiscoveryV01;
  }

  function doctrine() {
    return {
      refines_intention_concepts_not_claim_facts: true,
      no_real_world_intent_attribution: true,
      no_person_event_or_narrative_belief_ledger: true,
      formulas_remain_candidate_not_doctrine: true,
      contrast_pressure_is_discovery_hygiene_not_truth: true,
      refined_shape_l1_total: 'sum_abs_dimensions_equals_1',
      unit_total_growth_is_subdivision_not_mass_inflation: true,
      force_intensity_remains_separate_from_shape: true,
      belief_movement: 'none'
    };
  }

  function refinementSuites() {
    return {
      desire: {
        concept: 'desire',
        core_dimensions: [
          'recognized_gap_or_absence',
          'preferred_possible_state',
          'valuation_of_preferred_state',
          'attainment_pull'
        ],
        boundary_dimensions: [
          'constraint_contact'
        ],
        expression_dimensions: [
          'action_or_attention_orientation'
        ],
        force_dimensions: ['intensity'],
        rejected_shape_dimensions: [],
        contrast_findings: [
          { contrast: 'need', finding: 'Need can be requirement without represented preferred-state pull; desire keeps valuation and attainment-pull.' },
          { contrast: 'preference', finding: 'Preference can rank options without pull; desire requires pull toward the preferred possible state.' },
          { contrast: 'intention', finding: 'Intention commits to action; desire can remain pre-commitment while still orienting attention.' },
          { contrast: 'compulsion', finding: 'Compulsion can press without endorsed value; desire includes valued orientation.' }
        ],
        refinement_notes: [
          'action_or_attention_orientation is kept as expression/derivative shape, not core essence.',
          'intensity is force and must never enter the unit-total shape.'
        ]
      },
      lying: {
        concept: 'lying',
        core_dimensions: [
          'proposition_representation',
          'communicative_assertion_act',
          'belief_assertion_mismatch',
          'audience_belief_update_target',
          'concealment_of_mismatch'
        ],
        boundary_dimensions: [],
        expression_dimensions: [
          'advantage_avoidance_or_control_pressure'
        ],
        force_dimensions: ['severity_or_harm'],
        rejected_shape_dimensions: [],
        contrast_findings: [
          { contrast: 'mistake', finding: 'Mistake can be false without belief-assertion mismatch or concealment of mismatch.' },
          { contrast: 'fiction', finding: 'Fiction uses a valid nonliteral frame, blocking concealment-as-deception.' },
          { contrast: 'bullshit', finding: 'Bullshit may be truth-indifferent; lying requires concealed mismatch around an asserted proposition.' },
          { contrast: 'omission', finding: 'Omission withholds; lying requires assertion or implication that updates belief through mismatch.' }
        ],
        refinement_notes: [
          'advantage_avoidance_or_control_pressure is not core to lying because lying can serve many motives. It remains expression/function pressure.',
          'severity_or_harm is force, not the shape of lying.'
        ]
      },
      promise: {
        concept: 'promise',
        core_dimensions: [
          'future_action_or_state_commitment',
          'speaker_ownership_of_commitment',
          'recipient_reliance_invitation',
          'normative_obligation_creation'
        ],
        boundary_dimensions: [
          'condition_or_scope_boundary'
        ],
        expression_dimensions: [
          'breach_meaning_if_failed'
        ],
        force_dimensions: ['trust_stakes'],
        rejected_shape_dimensions: [],
        contrast_findings: [
          { contrast: 'prediction', finding: 'Prediction estimates future; promise creates speaker-owned normative commitment.' },
          { contrast: 'plan', finding: 'Plan can be private or tentative; promise invites reliance and accountability.' },
          { contrast: 'threat', finding: 'Threat creates pressure through harmful consequence; promise creates reliance-oriented obligation.' },
          { contrast: 'contract', finding: 'Contract formalizes obligation; promise is broader and can be informal.' }
        ],
        refinement_notes: [
          'breach_meaning_if_failed is derivative: it follows from obligation rather than defining promise alone.',
          'trust_stakes is force and remains outside unit-total shape.'
        ]
      }
    };
  }

  function normalizeSignedShape(rawWeights) {
    const entries = Object.entries(rawWeights || {}).filter(([name]) => text(name));
    if (!entries.length) return { shape: {}, l1_total: 0, unit_total_error: 1, belief_movement: 'none' };
    const rawTotal = entries.reduce((sum, [, value]) => sum + Math.abs(Number(value) || 0), 0) || 1;
    const shape = {};
    entries.forEach(([name, value], index) => {
      const number = Number(value) || 0;
      if (index === entries.length - 1) {
        const prior = Object.values(shape).reduce((sum, v) => sum + Math.abs(Number(v) || 0), 0);
        const sign = number < 0 ? -1 : 1;
        shape[name] = Number((sign * Math.max(0, 1 - prior)).toFixed(6));
      } else {
        shape[name] = Number((number / rawTotal).toFixed(6));
      }
    });
    const l1 = Number(Object.values(shape).reduce((sum, value) => sum + Math.abs(Number(value) || 0), 0).toFixed(6));
    return { shape, l1_total: l1, unit_total_error: Number(Math.abs(1 - l1).toFixed(6)), belief_movement: 'none' };
  }

  function classifyDimensions(candidate, suite) {
    const shape = candidate && candidate.normalized_shape && candidate.normalized_shape.shape || {};
    const dimensionNames = Object.keys(shape);
    const forceFromCandidate = asArray(candidate && candidate.force_dimensions).map(row => text(row.name || row)).filter(Boolean);
    const core = new Set(asArray(suite && suite.core_dimensions).map(lower));
    const boundary = new Set(asArray(suite && suite.boundary_dimensions).map(lower));
    const expression = new Set(asArray(suite && suite.expression_dimensions).map(lower));
    const force = new Set(unique(asArray(suite && suite.force_dimensions).concat(forceFromCandidate)).map(lower));
    const rejected = new Set(asArray(suite && suite.rejected_shape_dimensions).map(lower));
    return dimensionNames.map(name => {
      const key = lower(name);
      let role = 'unresolved_shape';
      if (core.has(key)) role = 'core_shape';
      else if (boundary.has(key)) role = 'boundary_shape';
      else if (expression.has(key)) role = 'expression_or_derivative_shape';
      else if (force.has(key)) role = 'force_leak_error';
      else if (rejected.has(key)) role = 'rejected_shape';
      return {
        dimension: name,
        input_weight: Number(shape[name] || 0),
        refined_role: role,
        retained_in_refined_shape: role !== 'force_leak_error' && role !== 'rejected_shape',
        belief_movement: 'none'
      };
    });
  }

  function roleBaseWeight(role) {
    if (role === 'core_shape') return 4;
    if (role === 'boundary_shape') return 2;
    if (role === 'expression_or_derivative_shape') return 1;
    if (role === 'unresolved_shape') return 1;
    return 0;
  }

  function buildRefinedShape(classifications) {
    const raw = {};
    asArray(classifications).forEach(row => {
      if (!row.retained_in_refined_shape) return;
      raw[row.dimension] = roleBaseWeight(row.refined_role);
    });
    return normalizeSignedShape(raw);
  }

  function symbolicFormula(concept, refinedShape) {
    const terms = Object.entries(refinedShape && refinedShape.shape || {}).map(([name, weight]) => `${weight}·${name}`).join(' + ');
    return `${text(concept).toUpperCase()}_REFINED_INTENTION = ${terms}; Σ|dimension_i| = 1; force = M · i`;
  }

  function refineCandidate(candidate, suite) {
    const concept = text(candidate && candidate.concept);
    const rules = suite || refinementSuites()[concept] || { concept };
    const classifications = classifyDimensions(candidate, rules);
    const refinedShape = buildRefinedShape(classifications);
    const errors = [];
    if (!concept) errors.push('missing_concept');
    if (Math.abs(1 - Number(refinedShape.l1_total || 0)) > EPSILON) errors.push('refined_shape_not_unit_total');
    if (classifications.some(row => row.refined_role === 'force_leak_error')) errors.push('force_dimension_leaked_into_shape');
    if (!classifications.some(row => row.refined_role === 'core_shape')) errors.push('no_core_shape_dimensions');
    return {
      packet_type: '42ndMind_intention_refinement_candidate_v0_1',
      packet_version: VERSION,
      created_at: now(),
      concept,
      source_review_status: text(candidate && candidate.review_status),
      refined_review_status: 'refined_candidate_not_doctrine',
      dimension_classifications: classifications,
      refined_shape: refinedShape,
      symbolic_formula: symbolicFormula(concept, refinedShape),
      contrast_findings: clone(asArray(rules.contrast_findings)),
      refinement_notes: clone(asArray(rules.refinement_notes)),
      ok: errors.length === 0,
      errors,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function validateRefinement(refinement) {
    const errors = [];
    if (!text(refinement && refinement.concept)) errors.push('missing_concept');
    if (refinement && refinement.refined_review_status !== 'refined_candidate_not_doctrine') errors.push('promoted_to_doctrine');
    if (refinement && refinement.belief_movement !== 'none') errors.push('belief_movement_not_none');
    const l1 = Number(refinement && refinement.refined_shape && refinement.refined_shape.l1_total || 0);
    if (Math.abs(1 - l1) > EPSILON) errors.push(`unit_total_error:${l1}`);
    const rows = asArray(refinement && refinement.dimension_classifications);
    if (!rows.some(row => row.refined_role === 'core_shape')) errors.push('missing_core_shape');
    if (rows.some(row => row.refined_role === 'force_leak_error')) errors.push('force_leak_error');
    if (!asArray(refinement && refinement.contrast_findings).length) errors.push('missing_contrast_findings');
    return {
      concept: text(refinement && refinement.concept),
      ok: errors.length === 0 && refinement && refinement.ok === true,
      errors: errors.concat(asArray(refinement && refinement.errors)),
      l1_total: l1,
      core_count: rows.filter(row => row.refined_role === 'core_shape').length,
      boundary_count: rows.filter(row => row.refined_role === 'boundary_shape').length,
      expression_count: rows.filter(row => row.refined_role === 'expression_or_derivative_shape').length,
      unresolved_count: rows.filter(row => row.refined_role === 'unresolved_shape').length,
      belief_movement: 'none'
    };
  }

  function runRefinement(options = {}) {
    const discovery = options.discovery_packet || discoveryApi().runDiscovery(options.discovery_options || {});
    const suites = Object.assign({}, refinementSuites(), options.refinement_suites || {});
    const refinements = asArray(discovery && discovery.candidates).map(candidate => refineCandidate(candidate, suites[candidate.concept]));
    const validations = refinements.map(validateRefinement);
    const errors = [];
    validations.forEach(v => { if (!v.ok) errors.push(`${v.concept}:${v.errors.join('|')}`); });
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Contrast-pressure refinement of candidate intention concept-shapes. Candidate only; not doctrine; no real-world intent attribution.',
      source_discovery_ok: discovery && discovery.ok === true,
      refinement_count: refinements.length,
      refinements,
      validation: {
        packet_type: '42ndMind_intention_refinement_validation_v0_1',
        packet_version: VERSION,
        created_at: now(),
        ok: errors.length === 0 && discovery && discovery.ok === true,
        refinement_count: refinements.length,
        validations,
        errors,
        belief_movement: 'none'
      },
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionRefinementV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    refinementSuites,
    normalizeSignedShape,
    classifyDimensions,
    buildRefinedShape,
    symbolicFormula,
    refineCandidate,
    validateRefinement,
    runRefinement
  });
})(typeof window !== 'undefined' ? window : globalThis);