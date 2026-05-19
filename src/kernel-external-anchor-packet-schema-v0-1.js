/* 42ndMind External Anchor Packet Schema v0.1
 * Modular anchors for entities, events, dates, source/provenance, and evidence/media.
 * No source lookup. No LLM. User descriptions are context, not automatic truth.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_external_anchor_packet_schema_v0_1';

  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function lower(value) { return text(value).toLowerCase(); }
  function safeId(value) { return lower(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'node'; }
  function uniq(rows) { return Array.from(new Set(asArray(rows).map(text).filter(Boolean))); }

  function doctrine() {
    return {
      external_anchors_are_modular_not_formula_language: true,
      names_entities_events_dates_sources_and_evidence_are_anchor_registries: true,
      anchor_packets_are_context_not_truth: true,
      user_descriptions_are_not_auto_truth: true,
      source_lookup_is_not_automatic: true,
      llm_is_not_required: true,
      provenance_is_recorded_without_source_adjudication: true,
      evidence_media_descriptions_require_trust_posture: true,
      claim_language_may_consume_anchor_summaries: true,
      anchor_schema_does_not_promote_claims: true,
      belief_movement: 'none'
    };
  }

  function sampleAnchorPacket() {
    return {
      anchor_packet_id: 'external_anchor_packet_demo_v0_1',
      created_by: 'user_supplied_context',
      description: 'Synthetic neutral demo packet for external anchors. No real person/event claim is encoded as truth.',
      entities: [
        { entity_id: 'entity_alpha', label: 'Person Alpha', entity_type: 'person_placeholder', role: 'described_actor', identity_status: 'placeholder_not_real_person', trust_posture: 'context_only' },
        { entity_id: 'entity_beta', label: 'Person Beta', entity_type: 'person_placeholder', role: 'described_recipient', identity_status: 'placeholder_not_real_person', trust_posture: 'context_only' },
        { entity_id: 'entity_policy', label: 'Policy Gamma', entity_type: 'policy_placeholder', role: 'described_object', identity_status: 'placeholder_not_real_policy', trust_posture: 'context_only' },
        { entity_id: 'entity_record_keeper', label: 'Record Keeper Delta', entity_type: 'institution_placeholder', role: 'described_source_holder', identity_status: 'placeholder_not_real_institution', trust_posture: 'context_only' }
      ],
      events: [
        { event_id: 'event_argument', label: 'Argument began', event_type: 'interaction_event', entity_refs: ['entity_alpha', 'entity_beta'], date_refs: ['date_unknown'], event_status: 'user_described_context', trust_posture: 'not_auto_truth' },
        { event_id: 'event_physical_contact', label: 'Physical contact occurred', event_type: 'described_action_event', entity_refs: ['entity_alpha', 'entity_beta'], date_refs: ['date_unknown'], event_status: 'user_described_context', trust_posture: 'not_auto_truth' },
        { event_id: 'event_policy_change', label: 'Policy changed', event_type: 'rule_change_event', entity_refs: ['entity_policy'], date_refs: ['date_interval_start'], event_status: 'user_described_context', trust_posture: 'not_auto_truth' },
        { event_id: 'event_cost_change', label: 'Cost changed after policy', event_type: 'measurement_event', entity_refs: ['entity_policy', 'entity_record_keeper'], date_refs: ['date_interval_end'], event_status: 'user_described_context', trust_posture: 'not_auto_truth' }
      ],
      dates: [
        { date_id: 'date_unknown', label: 'Unknown date', date_value: null, precision: 'unknown', chronology_status: 'unknown_but_declared', trust_posture: 'context_only' },
        { date_id: 'date_interval_start', label: 'Interval start', date_value: 'T0', precision: 'symbolic', chronology_status: 'relative_marker', trust_posture: 'context_only' },
        { date_id: 'date_interval_end', label: 'Interval end', date_value: 'T1', precision: 'symbolic', chronology_status: 'relative_marker', trust_posture: 'context_only' }
      ],
      sources: [
        { source_id: 'source_user_description', label: 'User description', source_type: 'user_supplied_description', provenance_status: 'first_person_reported_context', independence_group: 'user_context_group', trust_posture: 'consider_with_grain_of_salt', lookup_performed: false },
        { source_id: 'source_video_description', label: 'User-described video', source_type: 'media_description', provenance_status: 'media_described_not_verified_by_kernel', independence_group: 'user_context_group', trust_posture: 'direct_description_not_auto_truth', lookup_performed: false },
        { source_id: 'source_record_a', label: 'Record A description', source_type: 'record_description', provenance_status: 'documentary_description_not_verified_by_kernel', independence_group: 'record_group_a', trust_posture: 'documentary_description_candidate', lookup_performed: false },
        { source_id: 'source_record_b', label: 'Record B description', source_type: 'record_description', provenance_status: 'documentary_description_not_verified_by_kernel', independence_group: 'record_group_b', trust_posture: 'documentary_description_candidate', lookup_performed: false }
      ],
      evidence: [
        { evidence_id: 'evidence_video_sequence', evidence_type: 'media_description', source_ref: 'source_video_description', event_refs: ['event_argument', 'event_physical_contact'], entity_refs: ['entity_alpha', 'entity_beta'], supports: ['claim_physical_contact_after_argument'], strength: 0.82, independence_group: 'user_context_group', trust_posture: 'direct_description_not_auto_truth', media_lookup_performed: false },
        { evidence_id: 'evidence_record_cost_a', evidence_type: 'record_description', source_ref: 'source_record_a', event_refs: ['event_cost_change'], entity_refs: ['entity_policy'], supports: ['claim_cost_change'], strength: 0.7, independence_group: 'record_group_a', trust_posture: 'record_description_candidate', media_lookup_performed: false },
        { evidence_id: 'evidence_record_cost_b', evidence_type: 'record_description', source_ref: 'source_record_b', event_refs: ['event_cost_change'], entity_refs: ['entity_policy'], supports: ['claim_cost_change'], strength: 0.72, independence_group: 'record_group_b', trust_posture: 'record_description_candidate', media_lookup_performed: false },
        { evidence_id: 'evidence_policy_context', evidence_type: 'user_description', source_ref: 'source_user_description', event_refs: ['event_policy_change'], entity_refs: ['entity_policy'], supports: ['claim_policy_change'], strength: 0.52, independence_group: 'user_context_group', trust_posture: 'context_only', media_lookup_performed: false },
        { evidence_id: 'evidence_ambiguous_message', evidence_type: 'user_description', source_ref: 'source_user_description', event_refs: ['event_argument'], entity_refs: ['entity_alpha', 'entity_beta'], supports: ['claim_ambiguous_message'], strength: 0.5, independence_group: 'user_context_group', trust_posture: 'ambiguous_context_only', media_lookup_performed: false }
      ],
      claim_bridge_examples: [
        {
          claim_id: 'claim_physical_contact_after_argument',
          claim_text: 'The described video shows physical contact after the argument began.',
          entity_refs: ['entity_alpha', 'entity_beta'],
          event_refs: ['event_argument', 'event_physical_contact'],
          evidence_refs: ['evidence_video_sequence'],
          source_refs: ['source_video_description'],
          bridge_status: 'structured_context_bridge_not_truth'
        },
        {
          claim_id: 'claim_cost_change',
          claim_text: 'Two described records report a cost change after the policy changed.',
          entity_refs: ['entity_policy'],
          event_refs: ['event_policy_change', 'event_cost_change'],
          evidence_refs: ['evidence_record_cost_a', 'evidence_record_cost_b', 'evidence_policy_context'],
          source_refs: ['source_record_a', 'source_record_b', 'source_user_description'],
          bridge_status: 'structured_context_bridge_not_truth'
        }
      ],
      lookup_performed: false,
      llm_used: false,
      doctrine_status: 'candidate_not_doctrine',
      promotion_status: 'not_promoted',
      belief_movement: 'none'
    };
  }

  function idSet(rows, key) {
    return new Set(asArray(rows).map(row => text(row && row[key])).filter(Boolean));
  }

  function validateRefs(refs, allowed, label) {
    const errors = [];
    asArray(refs).forEach(ref => { if (!allowed.has(text(ref))) errors.push(`${label}_missing:${text(ref)}`); });
    return errors;
  }

  function validateEntity(entity) {
    const errors = [];
    if (!text(entity && entity.entity_id)) errors.push('missing_entity_id');
    if (!text(entity && entity.label)) errors.push('missing_label');
    if (!text(entity && entity.entity_type)) errors.push('missing_entity_type');
    if (!text(entity && entity.identity_status)) errors.push('missing_identity_status');
    if (text(entity && entity.trust_posture) !== 'context_only') errors.push('entity_not_context_only');
    return { anchor_id: text(entity && entity.entity_id), anchor_kind: 'entity', ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function validateDate(date) {
    const errors = [];
    if (!text(date && date.date_id)) errors.push('missing_date_id');
    if (!text(date && date.label)) errors.push('missing_label');
    if (!text(date && date.precision)) errors.push('missing_precision');
    if (!text(date && date.chronology_status)) errors.push('missing_chronology_status');
    if (!text(date && date.trust_posture)) errors.push('missing_trust_posture');
    return { anchor_id: text(date && date.date_id), anchor_kind: 'date', ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function validateSource(source) {
    const errors = [];
    if (!text(source && source.source_id)) errors.push('missing_source_id');
    if (!text(source && source.source_type)) errors.push('missing_source_type');
    if (!text(source && source.provenance_status)) errors.push('missing_provenance_status');
    if (!text(source && source.independence_group)) errors.push('missing_independence_group');
    if (!text(source && source.trust_posture)) errors.push('missing_trust_posture');
    if (source && source.lookup_performed !== false) errors.push('source_lookup_performed');
    return { anchor_id: text(source && source.source_id), anchor_kind: 'source', ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function validateEvent(event, packet) {
    const errors = [];
    const entityIds = idSet(packet && packet.entities, 'entity_id');
    const dateIds = idSet(packet && packet.dates, 'date_id');
    if (!text(event && event.event_id)) errors.push('missing_event_id');
    if (!text(event && event.event_type)) errors.push('missing_event_type');
    if (!text(event && event.event_status)) errors.push('missing_event_status');
    if (text(event && event.trust_posture) !== 'not_auto_truth') errors.push('event_auto_truth_risk');
    errors.push.apply(errors, validateRefs(event && event.entity_refs, entityIds, 'event_entity_ref'));
    errors.push.apply(errors, validateRefs(event && event.date_refs, dateIds, 'event_date_ref'));
    return { anchor_id: text(event && event.event_id), anchor_kind: 'event', ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function validateEvidence(evidence, packet) {
    const errors = [];
    const entityIds = idSet(packet && packet.entities, 'entity_id');
    const eventIds = idSet(packet && packet.events, 'event_id');
    const sourceIds = idSet(packet && packet.sources, 'source_id');
    if (!text(evidence && evidence.evidence_id)) errors.push('missing_evidence_id');
    if (!text(evidence && evidence.evidence_type)) errors.push('missing_evidence_type');
    if (!text(evidence && evidence.source_ref)) errors.push('missing_source_ref');
    if (!text(evidence && evidence.trust_posture)) errors.push('missing_trust_posture');
    if (Number(evidence && evidence.strength) < 0 || Number(evidence && evidence.strength) > 1) errors.push('strength_out_of_range');
    if (evidence && evidence.media_lookup_performed !== false) errors.push('media_lookup_performed');
    errors.push.apply(errors, validateRefs([evidence && evidence.source_ref], sourceIds, 'evidence_source_ref'));
    errors.push.apply(errors, validateRefs(evidence && evidence.event_refs, eventIds, 'evidence_event_ref'));
    errors.push.apply(errors, validateRefs(evidence && evidence.entity_refs, entityIds, 'evidence_entity_ref'));
    return { anchor_id: text(evidence && evidence.evidence_id), anchor_kind: 'evidence', ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function validateClaimBridge(bridge, packet) {
    const errors = [];
    const entityIds = idSet(packet && packet.entities, 'entity_id');
    const eventIds = idSet(packet && packet.events, 'event_id');
    const sourceIds = idSet(packet && packet.sources, 'source_id');
    const evidenceIds = idSet(packet && packet.evidence, 'evidence_id');
    if (!text(bridge && bridge.claim_id)) errors.push('missing_claim_id');
    if (!text(bridge && bridge.claim_text)) errors.push('missing_claim_text');
    if (text(bridge && bridge.bridge_status) !== 'structured_context_bridge_not_truth') errors.push('bridge_auto_truth_risk');
    errors.push.apply(errors, validateRefs(bridge && bridge.entity_refs, entityIds, 'bridge_entity_ref'));
    errors.push.apply(errors, validateRefs(bridge && bridge.event_refs, eventIds, 'bridge_event_ref'));
    errors.push.apply(errors, validateRefs(bridge && bridge.source_refs, sourceIds, 'bridge_source_ref'));
    errors.push.apply(errors, validateRefs(bridge && bridge.evidence_refs, evidenceIds, 'bridge_evidence_ref'));
    return { anchor_id: text(bridge && bridge.claim_id), anchor_kind: 'claim_bridge', ok: errors.length === 0, errors, belief_movement: 'none' };
  }

  function anchorSummary(packet) {
    return {
      entity_count: asArray(packet && packet.entities).length,
      event_count: asArray(packet && packet.events).length,
      date_count: asArray(packet && packet.dates).length,
      source_count: asArray(packet && packet.sources).length,
      evidence_count: asArray(packet && packet.evidence).length,
      claim_bridge_count: asArray(packet && packet.claim_bridge_examples).length,
      independence_groups: uniq(asArray(packet && packet.sources).map(row => row.independence_group).concat(asArray(packet && packet.evidence).map(row => row.independence_group))),
      lookup_performed: packet && packet.lookup_performed === true,
      llm_used: packet && packet.llm_used === true,
      belief_movement: 'none'
    };
  }

  function validatePacket(packet) {
    const validations = [];
    asArray(packet && packet.entities).forEach(row => validations.push(validateEntity(row)));
    asArray(packet && packet.dates).forEach(row => validations.push(validateDate(row)));
    asArray(packet && packet.sources).forEach(row => validations.push(validateSource(row)));
    asArray(packet && packet.events).forEach(row => validations.push(validateEvent(row, packet)));
    asArray(packet && packet.evidence).forEach(row => validations.push(validateEvidence(row, packet)));
    asArray(packet && packet.claim_bridge_examples).forEach(row => validations.push(validateClaimBridge(row, packet)));
    const errors = [];
    if (!text(packet && packet.anchor_packet_id)) errors.push('missing_anchor_packet_id');
    if (asArray(packet && packet.entities).length !== 4) errors.push(`entity_count_not_4:${asArray(packet && packet.entities).length}`);
    if (asArray(packet && packet.events).length !== 4) errors.push(`event_count_not_4:${asArray(packet && packet.events).length}`);
    if (asArray(packet && packet.dates).length !== 3) errors.push(`date_count_not_3:${asArray(packet && packet.dates).length}`);
    if (asArray(packet && packet.sources).length !== 4) errors.push(`source_count_not_4:${asArray(packet && packet.sources).length}`);
    if (asArray(packet && packet.evidence).length !== 5) errors.push(`evidence_count_not_5:${asArray(packet && packet.evidence).length}`);
    if (asArray(packet && packet.claim_bridge_examples).length !== 2) errors.push(`claim_bridge_count_not_2:${asArray(packet && packet.claim_bridge_examples).length}`);
    if (packet && packet.lookup_performed !== false) errors.push('packet_lookup_performed');
    if (packet && packet.llm_used !== false) errors.push('packet_llm_used');
    if (packet && packet.promotion_status !== 'not_promoted') errors.push('packet_promoted');
    if (packet && packet.doctrine_status !== 'candidate_not_doctrine') errors.push('packet_doctrine_status_not_safe');
    if (packet && packet.belief_movement !== 'none') errors.push('belief_movement_not_none');
    validations.forEach(row => { if (!row.ok) errors.push(`${row.anchor_kind}:${row.anchor_id}:${row.errors.join('|')}`); });
    const summary = anchorSummary(packet);
    const checks = {
      packet_id_present: !!text(packet && packet.anchor_packet_id),
      four_entities: summary.entity_count === 4,
      four_events: summary.event_count === 4,
      three_dates: summary.date_count === 3,
      four_sources: summary.source_count === 4,
      five_evidence_items: summary.evidence_count === 5,
      two_claim_bridges: summary.claim_bridge_count === 2,
      all_anchor_refs_resolve: validations.every(row => row.ok),
      user_context_not_auto_truth: asArray(packet && packet.events).every(row => row.trust_posture === 'not_auto_truth') && asArray(packet && packet.claim_bridge_examples).every(row => row.bridge_status === 'structured_context_bridge_not_truth'),
      source_lookup_not_performed: packet && packet.lookup_performed === false && asArray(packet && packet.sources).every(row => row.lookup_performed === false),
      media_lookup_not_performed: asArray(packet && packet.evidence).every(row => row.media_lookup_performed === false),
      no_llm_used: packet && packet.llm_used === false,
      candidate_only_not_promoted: packet && packet.promotion_status === 'not_promoted' && packet.doctrine_status === 'candidate_not_doctrine',
      belief_movement_none: packet && packet.belief_movement === 'none' && validations.every(row => row.belief_movement === 'none')
    };
    Object.keys(checks).forEach(key => { if (!checks[key] && errors.indexOf(key) === -1) errors.push(key); });
    return {
      packet_type: '42ndMind_external_anchor_packet_schema_validation_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: errors.length === 0,
      summary,
      checks,
      anchor_validations: validations,
      errors,
      belief_movement: 'none'
    };
  }

  function buildClaimLanguageInputFromBridge(packet, bridgeId) {
    const bridge = asArray(packet && packet.claim_bridge_examples).find(row => text(row.claim_id) === text(bridgeId));
    if (!bridge) return null;
    const evidenceRows = asArray(packet && packet.evidence).filter(row => asArray(bridge.evidence_refs).includes(row.evidence_id));
    const entityRows = asArray(packet && packet.entities).filter(row => asArray(bridge.entity_refs).includes(row.entity_id));
    const eventRows = asArray(packet && packet.events).filter(row => asArray(bridge.event_refs).includes(row.event_id));
    const dateRefs = uniq(eventRows.flatMap(row => asArray(row.date_refs)));
    return {
      claim_id: text(bridge.claim_id),
      claim_text: text(bridge.claim_text),
      context: {
        entities: entityRows.map(row => row.label),
        events: eventRows.map(row => row.label),
        dates: dateRefs,
        user_observation: 'Built from external anchor packet bridge. Context only, not automatic truth.'
      },
      evidence: evidenceRows.map(row => ({
        evidence_id: row.evidence_id,
        type: row.evidence_type,
        posture: row.trust_posture,
        supports: true,
        strength: row.strength,
        independent: text(row.independence_group) !== 'user_context_group',
        notes: 'Projected from external anchor packet evidence row.'
      })),
      counterevidence: [],
      source_posture: 'external_anchor_packet_context',
      narrative_flags: [],
      bridge_status: 'structured_context_bridge_not_truth',
      llm_used: false,
      external_lookup_performed: false,
      belief_movement: 'none'
    };
  }

  function runAnchorSchema(options = {}) {
    const packet = clone(options.anchor_packet || sampleAnchorPacket());
    const validation = validatePacket(packet);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      description: 'Modular external anchor packet schema for entities, events, dates, source/provenance, and evidence/media. No LLM. No source lookup. Context not auto-truth.',
      anchor_packet: packet,
      summary: validation.summary,
      validation,
      doctrine: doctrine(),
      ok: validation.ok === true,
      llm_used: false,
      lookup_performed: false,
      belief_movement: 'none'
    };
  }

  global.KernelExternalAnchorPacketSchemaV01 = Object.freeze({
    VERSION,
    PACKET_TYPE,
    doctrine,
    sampleAnchorPacket,
    idSet,
    validateRefs,
    validateEntity,
    validateDate,
    validateSource,
    validateEvent,
    validateEvidence,
    validateClaimBridge,
    anchorSummary,
    validatePacket,
    buildClaimLanguageInputFromBridge,
    runAnchorSchema
  });
})(typeof window !== 'undefined' ? window : globalThis);
