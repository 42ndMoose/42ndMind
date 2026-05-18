/* 42ndMind Intention Discovery v0.1
 * Discovers candidate mathematical concept-shapes for intention types.
 *
 * This is not a claim-intent detector and not a belief/world-model ledger.
 * It does not decide whether a person had an intent in a real case.
 * It tries to discover the invariant structure of intention concepts themselves.
 *
 * Core doctrine:
 * intention_type = 1
 * Σ |shape_dimension_i| = 1
 * force/intensity remains separate from shape
 * formulas are candidates until contrast and invariance testing survive review
 * belief_movement: none
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_intention_discovery_v0_1';
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

  function doctrine() {
    return {
      discovers_intention_concepts_not_claim_facts: true,
      intention_type_scope_total: 1,
      active_shape_l1_total: 'sum_abs_dimensions_equals_1',
      unit_total_growth_is_subdivision_not_mass_inflation: true,
      force_intensity_remains_separate_from_shape: true,
      contrast_cases_are_discovery_pressure_not_truth: true,
      formulas_are_candidate_discoveries_not_doctrine: true,
      no_person_event_or_narrative_belief_ledger: true,
      no_real_world_intent_attribution: true,
      belief_movement: 'none'
    };
  }

  function seedConcepts() {
    return [
      {
        concept: 'desire',
        question: 'What invariant structure makes desire desire, before any real-world target or person is evaluated?',
        raw_dimensions: [
          { name: 'recognized_gap_or_absence', role: 'shape', description: 'A current state is experienced or represented as lacking relative to another possible state.' },
          { name: 'preferred_possible_state', role: 'shape', description: 'A possible state is oriented as preferable to the current state.' },
          { name: 'valuation_of_preferred_state', role: 'shape', description: 'The preferred state carries positive value inside the intention structure.' },
          { name: 'attainment_pull', role: 'shape', description: 'The structure contains directional pull toward the preferred state.' },
          { name: 'constraint_contact', role: 'shape', description: 'The desired state is bounded by perceived possibility, impossibility, cost, delay, or obstacle.' },
          { name: 'action_or_attention_orientation', role: 'shape', description: 'Desire tends to orient attention, planning, fantasy, or action without requiring immediate action.' },
          { name: 'intensity', role: 'force', description: 'How strongly desire presses. This is force/magnitude, not a shape dimension.' }
        ],
        contrasts: ['need', 'preference', 'hope', 'craving', 'compulsion', 'intention', 'curiosity', 'habit'],
        exclusion_frames: ['mere biological deficit without represented preferred state', 'mere preference without pull', 'mere action without valued target'],
        minimal_pairs: [
          { pair: 'desire_vs_need', pressure: 'Need can exist as requirement; desire requires valued orientation toward a preferred possible state.' },
          { pair: 'desire_vs_preference', pressure: 'Preference ranks options; desire adds pull toward realization or possession.' },
          { pair: 'desire_vs_compulsion', pressure: 'Compulsion can override valuation; desire includes positive orientation to the preferred state.' },
          { pair: 'desire_vs_intention', pressure: 'Intention commits to doing; desire can exist without commitment or action.' }
        ]
      },
      {
        concept: 'lying',
        question: 'What invariant structure makes lying lying before evaluating whether any named person lied?',
        raw_dimensions: [
          { name: 'proposition_representation', role: 'shape', description: 'There is a represented proposition or state of affairs being communicated.' },
          { name: 'communicative_assertion_act', role: 'shape', description: 'The agent presents the proposition to an audience as asserted, implied, or meant to update belief.' },
          { name: 'belief_assertion_mismatch', role: 'shape', description: 'The asserted content conflicts with the agent’s own belief, knowledge, or warranted confidence.' },
          { name: 'audience_belief_update_target', role: 'shape', description: 'The communication targets another mind’s belief state or practical acceptance.' },
          { name: 'concealment_of_mismatch', role: 'shape', description: 'The mismatch is hidden rather than marked as fiction, joke, quote, uncertainty, or roleplay.' },
          { name: 'advantage_avoidance_or_control_pressure', role: 'shape', description: 'The mismatch serves some gain, avoidance, protection, manipulation, or control function.' },
          { name: 'severity_or_harm', role: 'force', description: 'How damaging or consequential the lie is. This is force/magnitude, not the shape of lying itself.' }
        ],
        contrasts: ['mistake', 'bullshit', 'fiction', 'joke', 'sarcasm', 'roleplay', 'omission', 'spin', 'self_deception', 'secrecy'],
        exclusion_frames: ['valid nonliteral frame', 'honest mistake', 'quoted falsehood', 'uncertain claim marked as uncertain'],
        minimal_pairs: [
          { pair: 'lying_vs_mistake', pressure: 'Mistake lacks belief-assertion mismatch or concealment of mismatch.' },
          { pair: 'lying_vs_fiction', pressure: 'Fiction marks a nonliteral frame, so audience deception is not the target under normal conditions.' },
          { pair: 'lying_vs_bullshit', pressure: 'Bullshit may show indifference to truth; lying specifically requires mismatch concealed as assertion.' },
          { pair: 'lying_vs_omission', pressure: 'Omission withholds; lying asserts or implies mismatched content as belief-updating communication.' }
        ]
      },
      {
        concept: 'promise',
        question: 'What invariant structure makes a promise a promise before evaluating whether one was kept?',
        raw_dimensions: [
          { name: 'future_action_or_state_commitment', role: 'shape', description: 'The speaker binds themselves to a future action, restraint, or state.' },
          { name: 'speaker_ownership_of_commitment', role: 'shape', description: 'The commitment is owned by the speaker rather than merely predicted or wished.' },
          { name: 'recipient_reliance_invitation', role: 'shape', description: 'The recipient is invited to rely on the commitment.' },
          { name: 'normative_obligation_creation', role: 'shape', description: 'The act creates an ought, duty, expectation, or accountability relation.' },
          { name: 'condition_or_scope_boundary', role: 'shape', description: 'The promise has implied or explicit boundaries, conditions, object, timeframe, or context.' },
          { name: 'breach_meaning_if_failed', role: 'shape', description: 'Failure would have a distinct breach meaning rather than merely being an inaccurate prediction.' },
          { name: 'trust_stakes', role: 'force', description: 'How much trust is at stake. This is force/magnitude, not the shape of promise itself.' }
        ],
        contrasts: ['prediction', 'hope', 'plan', 'threat', 'offer', 'request', 'intention', 'contract'],
        exclusion_frames: ['mere prediction', 'private plan not communicated as commitment', 'wish without obligation', 'coerced utterance without valid commitment frame'],
        minimal_pairs: [
          { pair: 'promise_vs_prediction', pressure: 'Prediction estimates future; promise creates speaker-owned obligation.' },
          { pair: 'promise_vs_plan', pressure: 'Plan can be private or tentative; promise invites reliance and accountability.' },
          { pair: 'promise_vs_threat', pressure: 'Threat commits to harmful consequence pressure; promise normally creates relied-upon obligation.' },
          { pair: 'promise_vs_contract', pressure: 'Contract is formalized legal promise-like structure; promise is broader and can be informal.' }
        ]
      }
    ];
  }

  function splitDimensions(rawDimensions) {
    const rows = asArray(rawDimensions).map(row => ({
      name: text(row && row.name),
      role: text(row && row.role || 'shape'),
      description: text(row && row.description)
    })).filter(row => row.name);
    return {
      shape_dimensions: rows.filter(row => row.role === 'shape'),
      force_dimensions: rows.filter(row => row.role === 'force'),
      other_dimensions: rows.filter(row => row.role !== 'shape' && row.role !== 'force')
    };
  }

  function normalizeShape(shapeDimensions, weights) {
    const dims = asArray(shapeDimensions).filter(row => text(row && row.name));
    const raw = {};
    dims.forEach(dim => {
      const supplied = weights && weights[dim.name];
      raw[dim.name] = supplied == null ? 1 : Number(supplied);
      if (!Number.isFinite(raw[dim.name])) raw[dim.name] = 1;
    });
    const names = Object.keys(raw);
    const total = Object.values(raw).reduce((sum, value) => sum + Math.abs(value), 0) || 1;
    const shape = {};
    names.forEach((name, index) => {
      if (index === names.length - 1) {
        const prior = Object.values(shape).reduce((sum, value) => sum + Math.abs(Number(value) || 0), 0);
        const sign = raw[name] < 0 ? -1 : 1;
        shape[name] = Number((sign * Math.max(0, 1 - prior)).toFixed(6));
      } else {
        shape[name] = Number((raw[name] / total).toFixed(6));
      }
    });
    const l1 = Number(Object.values(shape).reduce((sum, value) => sum + Math.abs(Number(value) || 0), 0).toFixed(6));
    return { shape, l1_total: l1, unit_total_error: Number(Math.abs(1 - l1).toFixed(6)), belief_movement: 'none' };
  }

  function symbolicFormula(concept, shape) {
    const c = text(concept).toUpperCase();
    const terms = Object.entries(shape || {}).map(([name, weight]) => `${weight}·${name}`).join(' + ');
    return `${c}_INTENTION = ${terms}; Σ|dimension_i| = 1; force = M · i`;
  }

  function discoverConcept(seed, options = {}) {
    const dims = splitDimensions(seed && seed.raw_dimensions);
    const normalized = normalizeShape(dims.shape_dimensions, options.weights && options.weights[seed.concept]);
    const concept = text(seed && seed.concept);
    const vector = {
      concept,
      scope_total: 1,
      shape: normalized.shape,
      force_dimensions: dims.force_dimensions.map(row => row.name),
      contrast_concepts: unique(seed && seed.contrasts).sort(),
      exclusion_frames: unique(seed && seed.exclusion_frames).sort(),
      minimal_pairs: clone(asArray(seed && seed.minimal_pairs)),
      symbolic_formula: symbolicFormula(concept, normalized.shape),
      review_status: 'candidate_discovered_not_doctrine',
      belief_movement: 'none'
    };
    return {
      packet_type: '42ndMind_intention_concept_candidate_v0_1',
      packet_version: VERSION,
      created_at: now(),
      concept,
      question: text(seed && seed.question),
      scope_total: 1,
      shape_dimensions: clone(dims.shape_dimensions),
      force_dimensions: clone(dims.force_dimensions),
      other_dimensions: clone(dims.other_dimensions),
      normalized_shape: normalized,
      contrast_concepts: vector.contrast_concepts,
      exclusion_frames: vector.exclusion_frames,
      minimal_pairs: vector.minimal_pairs,
      symbolic_formula: vector.symbolic_formula,
      vector,
      doctrine: doctrine(),
      review_status: 'candidate_discovered_not_doctrine',
      belief_movement: 'none'
    };
  }

  function validateCandidate(candidate) {
    const errors = [];
    const warnings = [];
    if (!text(candidate && candidate.concept)) errors.push('missing_concept');
    const shape = candidate && candidate.normalized_shape && candidate.normalized_shape.shape || {};
    const shapeKeys = Object.keys(shape);
    const forceNames = asArray(candidate && candidate.force_dimensions).map(row => text(row.name || row)).filter(Boolean);
    const forceSet = new Set(forceNames.map(lower));
    if (Number(candidate && candidate.scope_total) !== 1) errors.push('scope_total_not_1');
    if (!shapeKeys.length) errors.push('missing_shape_dimensions');
    const l1 = Number(candidate && candidate.normalized_shape && candidate.normalized_shape.l1_total || 0);
    if (Math.abs(1 - l1) > EPSILON) errors.push(`unit_total_error:${l1}`);
    shapeKeys.forEach(name => { if (forceSet.has(lower(name))) errors.push(`force_dimension_leaked_into_shape:${name}`); });
    if (!forceNames.length) warnings.push('no_force_dimensions_declared');
    if (asArray(candidate && candidate.contrast_concepts).length < 3) errors.push('insufficient_contrast_concepts');
    if (asArray(candidate && candidate.minimal_pairs).length < 3) errors.push('insufficient_minimal_pairs');
    if (!text(candidate && candidate.symbolic_formula).includes('Σ|dimension_i| = 1')) errors.push('symbolic_formula_missing_unit_total');
    if (candidate && candidate.belief_movement !== 'none') errors.push('belief_movement_not_none');
    if (candidate && candidate.review_status !== 'candidate_discovered_not_doctrine') errors.push('review_status_not_candidate');
    return {
      concept: text(candidate && candidate.concept),
      ok: errors.length === 0,
      errors,
      warnings,
      l1_total: l1,
      shape_dimension_count: shapeKeys.length,
      force_dimension_count: forceNames.length,
      contrast_count: asArray(candidate && candidate.contrast_concepts).length,
      minimal_pair_count: asArray(candidate && candidate.minimal_pairs).length,
      belief_movement: 'none'
    };
  }

  function validateDiscoveryPacket(packet) {
    const candidates = asArray(packet && packet.candidates);
    const validations = candidates.map(validateCandidate);
    const concepts = unique(candidates.map(candidate => candidate.concept));
    const errors = [];
    if (!candidates.length) errors.push('missing_candidates');
    if (concepts.length !== candidates.length) errors.push('duplicate_concepts');
    validations.forEach(v => { if (!v.ok) errors.push(`${v.concept}:${v.errors.join('|')}`); });
    return {
      packet_type: '42ndMind_intention_discovery_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      candidate_count: candidates.length,
      concept_count: concepts.length,
      validations,
      errors,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
  }

  function runDiscovery(options = {}) {
    const seeds = asArray(options.concepts || seedConcepts());
    const limit = Math.max(1, Number(options.limit || seeds.length));
    const candidates = seeds.slice(0, limit).map(seed => discoverConcept(seed, options));
    const packet = {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Candidate mathematical intention concept-shapes discovered from seed concepts and contrast pressure. Not doctrine. No real-world intent attribution.',
      candidate_count: candidates.length,
      candidates,
      doctrine: doctrine(),
      belief_movement: 'none'
    };
    packet.validation = validateDiscoveryPacket(packet);
    packet.ok = packet.validation.ok === true;
    return packet;
  }

  global.KernelIntentionDiscoveryV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    seedConcepts,
    splitDimensions,
    normalizeShape,
    symbolicFormula,
    discoverConcept,
    validateCandidate,
    validateDiscoveryPacket,
    runDiscovery
  });
})(typeof window !== 'undefined' ? window : globalThis);