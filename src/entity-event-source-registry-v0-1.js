/* 42ndMind Entity/Event/Source Registry v0.1
 * Non-scoring named reality-map layer.
 *
 * Purpose:
 * Represent named actors, organizations, policies, events, documents,
 * mechanisms, contradictions, and unresolved questions separately from
 * conclusions and belief movement.
 *
 * Doctrine:
 * - named entity is not guilt
 * - named event is not proof
 * - source link is not verification
 * - mechanism classification is pressure, not verdict
 * - kernel owns belief movement
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const ENTITY_TYPES = Object.freeze(['actor','organization','funder','platform','policy','document','public_statement','mechanism','other']);
  const EVENT_TYPES = Object.freeze(['policy_change','public_statement','funding_action','enforcement_action','coordination_event','publication','legal_event','platform_action','other']);
  const MECHANISM_CLASSES = Object.freeze([
    'direct_coordination',
    'institutional_or_incentive_convergence',
    'shared_enforcement_pipeline',
    'funding_or_dependency_pressure',
    'reputational_or_advertiser_pressure',
    'platform_policy_enforcement',
    'unsupported_conspiracy_overclaim',
    'unresolved_mechanism'
  ]);
  const SUPPORT_STATUS = Object.freeze(['unreviewed','source_visible','mechanism_supported','evidence_backed','weakened','contradicted','unresolved']);

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function oneOf(value, allowed, fallback) { return allowed.includes(value) ? value : fallback; }
  function id(prefix, index) { return `${prefix}_${String(index + 1).padStart(3, '0')}`; }

  function normalizeEntity(raw = {}, index = 0) {
    return {
      id: text(raw.id) || id('entity', index),
      name: text(raw.name) || 'Unnamed entity',
      entity_type: oneOf(text(raw.entity_type || raw.type), ENTITY_TYPES, 'other'),
      role_hint: text(raw.role_hint || raw.role),
      aliases: asArray(raw.aliases).map(text).filter(Boolean),
      source_ids: asArray(raw.source_ids).map(text).filter(Boolean),
      claim_ids: asArray(raw.claim_ids).map(text).filter(Boolean),
      evidence_ids: asArray(raw.evidence_ids).map(text).filter(Boolean),
      unresolved_questions: asArray(raw.unresolved_questions).map(text).filter(Boolean),
      notes: asArray(raw.notes).map(text).filter(Boolean),
      meta: {
        non_scoring: true,
        named_entity_not_guilt: true,
        named_entity_not_intent: true
      }
    };
  }

  function normalizeEvent(raw = {}, index = 0) {
    return {
      id: text(raw.id) || id('event', index),
      title: text(raw.title) || 'Untitled event',
      event_type: oneOf(text(raw.event_type || raw.type), EVENT_TYPES, 'other'),
      date: text(raw.date),
      date_precision: text(raw.date_precision) || (raw.date ? 'day_or_known_date' : 'unknown'),
      entity_ids: asArray(raw.entity_ids).map(text).filter(Boolean),
      source_ids: asArray(raw.source_ids).map(text).filter(Boolean),
      claim_ids: asArray(raw.claim_ids).map(text).filter(Boolean),
      evidence_ids: asArray(raw.evidence_ids).map(text).filter(Boolean),
      unresolved_questions: asArray(raw.unresolved_questions).map(text).filter(Boolean),
      notes: asArray(raw.notes).map(text).filter(Boolean),
      meta: {
        non_scoring: true,
        event_record_not_proof_of_motive: true
      }
    };
  }

  function normalizeMechanism(raw = {}, index = 0) {
    return {
      id: text(raw.id) || id('mechanism', index),
      label: text(raw.label) || 'Unlabeled mechanism',
      mechanism_class: oneOf(text(raw.mechanism_class || raw.class), MECHANISM_CLASSES, 'unresolved_mechanism'),
      support_status: oneOf(text(raw.support_status), SUPPORT_STATUS, 'unreviewed'),
      entity_ids: asArray(raw.entity_ids).map(text).filter(Boolean),
      event_ids: asArray(raw.event_ids).map(text).filter(Boolean),
      source_ids: asArray(raw.source_ids).map(text).filter(Boolean),
      claim_ids: asArray(raw.claim_ids).map(text).filter(Boolean),
      evidence_ids: asArray(raw.evidence_ids).map(text).filter(Boolean),
      counter_evidence_ids: asArray(raw.counter_evidence_ids).map(text).filter(Boolean),
      unresolved_questions: asArray(raw.unresolved_questions).map(text).filter(Boolean),
      scope_note: text(raw.scope_note),
      overclaim_flags: asArray(raw.overclaim_flags).map(text).filter(Boolean),
      meta: {
        non_scoring: true,
        mechanism_is_classification_not_verdict: true,
        direct_coordination_requires_direct_evidence: true,
        convergence_is_not_command_proof: true
      }
    };
  }

  function normalizeLink(raw = {}, index = 0) {
    return {
      id: text(raw.id) || id('link', index),
      from_id: text(raw.from_id || raw.from),
      to_id: text(raw.to_id || raw.to),
      relation: text(raw.relation) || 'related_to',
      source_ids: asArray(raw.source_ids).map(text).filter(Boolean),
      note: text(raw.note),
      support_status: oneOf(text(raw.support_status), SUPPORT_STATUS, 'unreviewed'),
      meta: {
        non_scoring: true,
        link_is_not_proof: true
      }
    };
  }

  function normalizePacket(packet = {}) {
    return {
      packet_type: '42ndMind_entity_event_source_packet',
      packet_version: VERSION,
      created_at: text(packet.created_at) || new Date().toISOString(),
      purpose: text(packet.purpose) || 'Represent named entities/events/mechanisms separately from conclusions and belief movement.',
      entities: asArray(packet.entities).map(normalizeEntity),
      events: asArray(packet.events).map(normalizeEvent),
      mechanisms: asArray(packet.mechanisms).map(normalizeMechanism),
      links: asArray(packet.links).map(normalizeLink),
      unresolved_questions: asArray(packet.unresolved_questions).map((q, index) => ({
        id: text(q.id) || id('question', index),
        text: text(q.text || q),
        related_ids: asArray(q.related_ids).map(text).filter(Boolean),
        status: text(q.status) || 'open'
      })).filter(q => q.text),
      doctrine: {
        non_scoring: true,
        metadata_only: true,
        named_entities_are_not_guilt: true,
        events_are_not_proof_of_motive: true,
        mechanisms_are_classifications_not_verdicts: true,
        direct_coordination_requires_direct_evidence: true,
        incentive_convergence_is_not_command_proof: true,
        retrieval_is_not_verification: true,
        provenance_is_not_proof: true,
        kernel_owns_belief_movement: true
      }
    };
  }

  function buildRegistry(packet = {}) {
    const normalized = normalizePacket(packet);
    const entityIds = new Set(normalized.entities.map(x => x.id));
    const eventIds = new Set(normalized.events.map(x => x.id));
    const mechanismIds = new Set(normalized.mechanisms.map(x => x.id));
    const knownIds = new Set([...entityIds, ...eventIds, ...mechanismIds]);

    const unresolvedFromObjects = [
      ...normalized.entities.flatMap(x => x.unresolved_questions),
      ...normalized.events.flatMap(x => x.unresolved_questions),
      ...normalized.mechanisms.flatMap(x => x.unresolved_questions),
      ...normalized.unresolved_questions.filter(q => q.status === 'open').map(q => q.text)
    ].filter(Boolean);

    const mechanismCounts = Object.fromEntries(MECHANISM_CLASSES.map(k => [k, 0]));
    normalized.mechanisms.forEach(m => { mechanismCounts[m.mechanism_class] += 1; });

    return {
      registry_type: '42ndMind_entity_event_source_registry',
      registry_version: VERSION,
      entities: normalized.entities,
      events: normalized.events,
      mechanisms: normalized.mechanisms,
      links: normalized.links,
      unresolved_questions: normalized.unresolved_questions,
      counts: {
        entities: normalized.entities.length,
        events: normalized.events.length,
        mechanisms: normalized.mechanisms.length,
        links: normalized.links.length,
        unresolved_questions: unresolvedFromObjects.length,
        mechanism_classes: mechanismCounts,
        direct_coordination_claims: mechanismCounts.direct_coordination,
        convergence_claims: mechanismCounts.institutional_or_incentive_convergence,
        unsupported_conspiracy_overclaims: mechanismCounts.unsupported_conspiracy_overclaim
      },
      integrity: {
        links_reference_known_ids: normalized.links.every(l => knownIds.has(l.from_id) && knownIds.has(l.to_id)),
        mechanisms_reference_known_entities: normalized.mechanisms.every(m => m.entity_ids.every(id => entityIds.has(id))),
        mechanisms_reference_known_events: normalized.mechanisms.every(m => m.event_ids.every(id => eventIds.has(id))),
        direct_coordination_has_direct_source: normalized.mechanisms
          .filter(m => m.mechanism_class === 'direct_coordination')
          .every(m => m.source_ids.length > 0 && !m.overclaim_flags.includes('no_direct_coordination_source')),
        unsupported_overclaims_are_flagged: normalized.mechanisms
          .filter(m => m.mechanism_class === 'unsupported_conspiracy_overclaim')
          .every(m => m.overclaim_flags.length > 0 || m.unresolved_questions.length > 0)
      },
      meta: {
        non_scoring: true,
        metadata_only: true,
        safe_to_attach_to_kernel_state_as_metadata: true,
        belief_movement: 'none',
        note: 'Named reality-map layer only. Review and kernel import are separate steps.'
      }
    };
  }

  function importPacket(packet = {}) {
    const registry = buildRegistry(packet);
    const checks = {
      non_scoring: registry.meta.non_scoring === true,
      metadata_only: registry.meta.metadata_only === true,
      has_named_entities: registry.counts.entities > 0,
      has_events: registry.counts.events > 0,
      has_mechanism_classification: registry.counts.mechanisms > 0,
      links_reference_known_ids: registry.integrity.links_reference_known_ids,
      mechanisms_reference_known_entities: registry.integrity.mechanisms_reference_known_entities,
      mechanisms_reference_known_events: registry.integrity.mechanisms_reference_known_events,
      direct_coordination_requires_direct_evidence: registry.integrity.direct_coordination_has_direct_source,
      unsupported_overclaims_are_flagged: registry.integrity.unsupported_overclaims_are_flagged,
      kernel_owns_belief_movement: true,
      belief_movement_none: registry.meta.belief_movement === 'none'
    };
    return {
      packet_type: '42ndMind_entity_event_source_registry_report',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      purpose: 'Normalize named entities/events/mechanisms without scoring belief state.',
      entity_event_source_registry: registry,
      pass_checks: checks,
      all_passed: Object.values(checks).every(Boolean),
      next_kernel_state_extension: {
        field: 'entityEventSourceRegistry',
        value: registry,
        attach_as_metadata_only: true,
        scoring_allowed: false
      }
    };
  }

  function samplePacket() {
    return {
      packet_type: '42ndMind_entity_event_source_packet',
      packet_version: VERSION,
      entities: [
        { id:'entity_platform_x', name:'Platform X', entity_type:'platform', source_ids:['source_policy_1'] },
        { id:'entity_org_y', name:'Organization Y', entity_type:'organization', source_ids:['source_policy_1'], unresolved_questions:['Did Organization Y directly request enforcement, or only supply classification language?'] }
      ],
      events: [
        { id:'event_policy_change_2021', title:'Policy category change in 2021', event_type:'policy_change', date:'2021', date_precision:'year', entity_ids:['entity_platform_x','entity_org_y'], source_ids:['source_policy_1'] }
      ],
      mechanisms: [
        { id:'mechanism_shared_enforcement', label:'Shared enforcement-category pipeline', mechanism_class:'shared_enforcement_pipeline', support_status:'mechanism_supported', entity_ids:['entity_platform_x','entity_org_y'], event_ids:['event_policy_change_2021'], source_ids:['source_policy_1'], scope_note:'Supports pipeline involvement, not private command or individual motive.' },
        { id:'mechanism_unresolved_command', label:'Possible direct command structure', mechanism_class:'unresolved_mechanism', support_status:'unresolved', entity_ids:['entity_platform_x','entity_org_y'], event_ids:['event_policy_change_2021'], unresolved_questions:['What direct evidence would show command authority rather than convergence?'] }
      ],
      links: [
        { from_id:'entity_org_y', to_id:'event_policy_change_2021', relation:'named_in_context_of', source_ids:['source_policy_1'], support_status:'source_visible' },
        { from_id:'mechanism_shared_enforcement', to_id:'event_policy_change_2021', relation:'classifies_mechanism_for', source_ids:['source_policy_1'], support_status:'mechanism_supported' }
      ],
      unresolved_questions: [
        { id:'q_direct_command', text:'Is there direct evidence of command coordination, or only institutional convergence?', related_ids:['mechanism_unresolved_command'], status:'open' }
      ]
    };
  }

  global.EntityEventSourceRegistryV01 = Object.freeze({
    VERSION,
    ENTITY_TYPES,
    EVENT_TYPES,
    MECHANISM_CLASSES,
    SUPPORT_STATUS,
    normalizePacket,
    buildRegistry,
    importPacket,
    samplePacket
  });
})(typeof window !== 'undefined' ? window : globalThis);
