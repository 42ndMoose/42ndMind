/* 42ndMind EES Registry → Kernel Command Compiler v0.1
 *
 * Purpose:
 * Convert one Entity/Event/Source registry mechanism into a candidate
 * epistemic_kernel_command for explicit user approval/import.
 *
 * Doctrine:
 * - reads metadata only
 * - does not import automatically
 * - does not move belief state
 * - source/review status is preserved as metadata, not proof
 * - overclaim flags become attacking evidence / counter-considerations
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const DEFAULT_STORAGE_KEY = '42ndMind_entity_event_source_registry_v0_1';

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function unique(items) {
    const seen = new Set();
    const out = [];
    for (const item of asArray(items)) {
      const t = text(item);
      const k = lower(t);
      if (t && !seen.has(k)) { seen.add(k); out.push(t); }
    }
    return out;
  }
  function safeId(value, fallback) {
    const t = text(value || fallback).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return t || text(fallback) || 'item';
  }

  function extractRegistry(input) {
    if (!input) return null;
    if (typeof input === 'string') {
      try { return extractRegistry(JSON.parse(input)); }
      catch (error) { return null; }
    }
    if (input.entityEventSourceRegistry) return input.entityEventSourceRegistry;
    if (input.entity_event_source_registry) return input.entity_event_source_registry;
    if (input.validation && input.validation.registry_report) return extractRegistry(input.validation.registry_report);
    if (input.compileReport && input.compileReport.validation && input.compileReport.validation.registry_report) return extractRegistry(input.compileReport.validation.registry_report);
    if (input.registry_type === '42ndMind_entity_event_source_registry') return input;
    if (asArray(input.mechanisms).length || asArray(input.events).length || asArray(input.links).length) return input;
    return null;
  }

  function loadSavedRegistry(storageKey) {
    if (typeof localStorage === 'undefined') {
      return { ok:false, reason:'localStorage_unavailable', storage_key:storageKey || DEFAULT_STORAGE_KEY, registry:null };
    }
    const key = storageKey || DEFAULT_STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return { ok:false, reason:'no_saved_registry', storage_key:key, registry:null };
    const registry = extractRegistry(raw);
    return registry
      ? { ok:true, reason:'loaded_saved_registry', storage_key:key, registry }
      : { ok:false, reason:'saved_payload_did_not_contain_registry', storage_key:key, registry:null };
  }

  function byId(items) {
    return Object.fromEntries(asArray(items).map(item => [text(item.id), item]).filter(row => row[0]));
  }

  function supportConfidence(status) {
    return {
      evidence_backed: 0.72,
      mechanism_supported: 0.62,
      source_visible: 0.52,
      unreviewed: 0.42,
      unresolved: 0.38,
      weakened: 0.28,
      contradicted: 0.18
    }[text(status)] ?? 0.4;
  }

  function supportStrength(status) {
    return {
      evidence_backed: 'moderate',
      mechanism_supported: 'moderate',
      source_visible: 'weak',
      unreviewed: 'weak',
      unresolved: 'weak',
      weakened: 'weak',
      contradicted: 'weak'
    }[text(status)] || 'weak';
  }

  function claimStatusFor(mechanism) {
    const status = text(mechanism.support_status);
    const hasFlags = asArray(mechanism.overclaim_flags).length > 0;
    if (hasFlags || status === 'unreviewed' || status === 'unresolved' || status === 'weakened' || status === 'contradicted') return 'unresolved';
    return status === 'evidence_backed' || status === 'mechanism_supported' || status === 'source_visible' ? 'active' : 'unresolved';
  }

  function overclaimText(flag) {
    const f = text(flag);
    const known = {
      direct_coordination_not_established: 'Direct coordination is not established by the EES registry.',
      motive_not_established: 'Motive or intent is not established by the EES registry.',
      no_direct_coordination_source: 'No direct coordination source is attached.',
      no_direct_command_source: 'No direct command source is attached.',
      command_not_established: 'Command authority is not established by the EES registry.',
      intent_not_established: 'Intent is not established by the EES registry.'
    };
    return known[f] || `Overclaim flag preserved as counter-consideration: ${f}`;
  }

  function linkedEvents(registry, mechanism) {
    const events = byId(registry.events);
    const direct = asArray(mechanism.event_ids).map(id => events[text(id)]).filter(Boolean);
    const fromLinks = asArray(registry.links)
      .filter(link => text(link.from_id) === text(mechanism.id) && events[text(link.to_id)])
      .map(link => events[text(link.to_id)]);
    const toLinks = asArray(registry.links)
      .filter(link => text(link.to_id) === text(mechanism.id) && events[text(link.from_id)])
      .map(link => events[text(link.from_id)]);
    const all = [];
    const seen = new Set();
    for (const ev of direct.concat(fromLinks, toLinks)) {
      const id = text(ev.id);
      if (id && !seen.has(id)) { seen.add(id); all.push(ev); }
    }
    return all;
  }

  function eventSupportLinks(registry, mechanism, event) {
    return asArray(registry.links).filter(link => {
      const a = text(link.from_id); const b = text(link.to_id);
      return (a === text(mechanism.id) && b === text(event.id)) || (a === text(event.id) && b === text(mechanism.id));
    });
  }

  function questionsFor(registry, mechanism, events) {
    const related = new Set([text(mechanism.id), ...asArray(mechanism.entity_ids).map(text), ...asArray(mechanism.event_ids).map(text)]);
    const own = asArray(mechanism.unresolved_questions).map(q => ({
      text: q,
      links: { mechanism_id:text(mechanism.id), source:'ees_to_kernel_command_v0_1' }
    }));
    const eventQuestions = asArray(events).flatMap(event => asArray(event.unresolved_questions).map(q => ({
      text: q,
      links: { mechanism_id:text(mechanism.id), event_id:text(event.id), source:'ees_to_kernel_command_v0_1' }
    })));
    const registryQuestions = asArray(registry.unresolved_questions)
      .filter(q => {
        if (!q || text(q.status || 'open') !== 'open') return false;
        const ids = asArray(q.related_ids).map(text).filter(Boolean);
        return ids.length === 0 || ids.some(id => related.has(id));
      })
      .map(q => ({
        text: text(q.text || q),
        links: { mechanism_id:text(mechanism.id), related_ids:asArray(q.related_ids).map(text).filter(Boolean), source:'ees_to_kernel_command_v0_1' }
      }));
    const seen = new Set();
    return own.concat(eventQuestions, registryQuestions).filter(q => {
      const k = lower(q.text);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function compileMechanism(registryInput, options = {}) {
    const registry = extractRegistry(registryInput);
    if (!registry) throw new Error('No EES registry found.');
    const mechanisms = asArray(registry.mechanisms);
    if (!mechanisms.length) throw new Error('EES registry has no mechanisms to compile.');

    const selected = text(options.mechanism_id)
      ? mechanisms.find(m => text(m.id) === text(options.mechanism_id))
      : mechanisms[Number.isInteger(options.mechanism_index) ? options.mechanism_index : 0];
    if (!selected) throw new Error('Requested mechanism was not found.');

    const mechanism = selected;
    const claimId = `ees_claim_${safeId(mechanism.id, 'mechanism_1')}`;
    const events = linkedEvents(registry, mechanism);
    const claimText = text(options.claim_text) || text(mechanism.label) || 'Unlabeled EES mechanism claim';

    const claim = {
      client_id: claimId,
      text: claimText,
      subject: 'ees_mechanism',
      object: text(mechanism.mechanism_class) || 'unresolved_mechanism',
      scope: 'entity_event_source_registry_mechanism',
      confidence: supportConfidence(mechanism.support_status),
      status: claimStatusFor(mechanism),
      links: {
        mechanism_id: text(mechanism.id),
        entity_ids: asArray(mechanism.entity_ids).map(text).filter(Boolean),
        event_ids: asArray(mechanism.event_ids).map(text).filter(Boolean),
        source_ids: asArray(mechanism.source_ids).map(text).filter(Boolean),
        support_status: text(mechanism.support_status) || 'unreviewed',
        mechanism_class: text(mechanism.mechanism_class) || 'unresolved_mechanism',
        source_review_status_is_metadata_only: true
      }
    };

    const supportEvidence = events.map((event, index) => {
      const links = eventSupportLinks(registry, mechanism, event);
      const date = text(event.date) ? ` (${text(event.date)})` : '';
      const linkStatus = links.map(l => text(l.support_status)).filter(Boolean)[0] || text(event.support_status) || text(mechanism.support_status) || 'unreviewed';
      return {
        text: `EES linked event supports candidate mechanism claim: ${text(event.title)}${date}.`,
        relation: 'supports',
        target: claimId,
        strength: supportStrength(linkStatus),
        confidence: supportConfidence(linkStatus),
        source: 'entity_event_source_registry',
        links: {
          mechanism_id: text(mechanism.id),
          event_id: text(event.id),
          event_type: text(event.event_type),
          source_ids: unique(asArray(event.source_ids).concat(asArray(mechanism.source_ids), links.flatMap(l => asArray(l.source_ids)))),
          support_status: linkStatus,
          link_ids: links.map(l => text(l.id)).filter(Boolean),
          source_review_status_is_metadata_only: true,
          event_record_not_proof_of_motive: true
        }
      };
    });

    const attackingEvidence = asArray(mechanism.overclaim_flags).map((flag, index) => ({
      text: `counter_consideration: ${overclaimText(flag)}`,
      relation: 'attacks',
      target: claimId,
      strength: 'weak',
      confidence: 0.55,
      source: 'entity_event_source_registry_overclaim_flags',
      links: {
        mechanism_id: text(mechanism.id),
        overclaim_flag: text(flag),
        source_ids: asArray(mechanism.source_ids).map(text).filter(Boolean),
        source_review_status_is_metadata_only: true,
        direct_coordination_requires_direct_evidence: true,
        convergence_is_not_command_proof: true
      }
    }));

    const questions = questionsFor(registry, mechanism, events);
    if (!questions.length) {
      questions.push({
        text: `What source review would most strengthen or weaken this EES mechanism claim: ${claimText}`,
        links: { mechanism_id:text(mechanism.id), source:'ees_to_kernel_command_v0_1' }
      });
    }

    const gate_events = [];
    if (supportEvidence.length > 0) {
      gate_events.push({
        gate: 'G5_reality_contact',
        direction: 'positive',
        strength: 'weak',
        confidence: 0.6,
        evidence: 'EES compiler preserved linked events as source-visible support candidates.',
        reason: 'Named events are evidence candidates only; retrieval/review status remains metadata.',
        scope: 'ees_registry'
      });
    }
    if (attackingEvidence.length > 0 || questions.length > 0) {
      gate_events.push({
        gate: 'G1_counter_consideration',
        direction: 'positive',
        strength: 'weak',
        confidence: 0.65,
        evidence: 'EES compiler preserved overclaim flags and unresolved questions.',
        reason: 'Overclaim pressure remains visible instead of being flattened into the claim.',
        scope: 'ees_registry'
      });
    }

    const command = {
      command_type: 'epistemic_kernel_command',
      created_by: 'ees-to-kernel-command-v0.1',
      requires_user_approval: true,
      commands: [
        {
          op: 'import_packet',
          packet: {
            packet_type: 'epistemic_extraction_packet',
            packet_version: 'ees_to_kernel_command_v0_1',
            source: 'entity_event_source_registry',
            claims: [claim],
            evidence: supportEvidence.concat(attackingEvidence),
            principles: [],
            dependencies: [],
            observations: [],
            questions,
            gate_events,
            meta: {
              ees_registry_version: text(registry.registry_version) || null,
              mechanism_id: text(mechanism.id),
              mechanism_class: text(mechanism.mechanism_class) || 'unresolved_mechanism',
              support_status: text(mechanism.support_status) || 'unreviewed',
              source_ids: asArray(mechanism.source_ids).map(text).filter(Boolean),
              entity_ids: asArray(mechanism.entity_ids).map(text).filter(Boolean),
              event_ids: asArray(mechanism.event_ids).map(text).filter(Boolean),
              overclaim_flags: asArray(mechanism.overclaim_flags).map(text).filter(Boolean),
              source_review_status_is_metadata_only: true,
              retrieval_is_not_verification: true,
              provenance_is_not_proof: true,
              named_entity_is_not_guilt: true,
              event_is_not_proof_of_motive: true,
              mechanism_classification_is_pressure_not_verdict: true,
              direct_coordination_requires_direct_evidence: true,
              convergence_is_not_command_proof: true,
              no_automatic_import: true,
              no_belief_movement_until_user_import: true,
              observations_omitted_to_avoid_low_signal_noise: true
            }
          }
        }
      ]
    };

    return {
      packet_type: '42ndMind_ees_to_kernel_command_report',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      selected_mechanism_id: text(mechanism.id),
      selected_mechanism_label: claimText,
      counts: {
        claims: 1,
        supporting_evidence: supportEvidence.length,
        attacking_evidence: attackingEvidence.length,
        open_questions: questions.length,
        observations: 0,
        gate_events: gate_events.length
      },
      doctrine: {
        non_scoring: true,
        metadata_only_input: true,
        command_requires_user_approval: true,
        no_automatic_import: true,
        belief_movement: 'none',
        source_review_status_is_metadata_only: true,
        retrieval_is_not_verification: true,
        provenance_is_not_proof: true,
        kernel_owns_belief_movement: true
      },
      epistemic_kernel_command: command
    };
  }

  function sampleRegistry() {
    return {
      registry_type: '42ndMind_entity_event_source_registry',
      registry_version: '0.1.0',
      entities: [
        { id:'entity_canada', name:'Canada', entity_type:'organization' },
        { id:'entity_us', name:'United States', entity_type:'organization' }
      ],
      events: [
        { id:'event_export_exposure_2024', title:'Canada recorded high 2024 export exposure to the United States', event_type:'other', date:'2024', source_ids:['source_export_2024'] },
        { id:'event_tariff_framework_2025_04_02', title:'April 2 2025 reciprocal tariff framework preserved a USMCA compliance path', event_type:'policy_change', date:'2025-04-02', source_ids:['source_tariff_framework'] },
        { id:'event_ev_surtax_2024', title:'Canada applied a surtax to Chinese-made EVs in 2024', event_type:'policy_change', date:'2024', source_ids:['source_ev_surtax'] }
      ],
      mechanisms: [
        {
          id:'mechanism_trade_leverage',
          label:'Canada’s industrial posture is constrained by U.S.-led North American trade leverage',
          mechanism_class:'institutional_or_incentive_convergence',
          support_status:'unreviewed',
          entity_ids:['entity_canada','entity_us'],
          event_ids:['event_export_exposure_2024','event_tariff_framework_2025_04_02','event_ev_surtax_2024'],
          source_ids:['source_export_2024','source_tariff_framework','source_ev_surtax'],
          overclaim_flags:['direct_coordination_not_established','motive_not_established'],
          unresolved_questions:[
            'Does the evidence show deliberate Ottawa alignment with U.S. industrial strategy, or mainly structural dependence?',
            'Does the EV surtax show independent Canadian policy, U.S.-led North American leverage, or both?'
          ]
        }
      ],
      links: [
        { id:'link_trade_1', from_id:'mechanism_trade_leverage', to_id:'event_export_exposure_2024', relation:'supported_by', support_status:'unreviewed', source_ids:['source_export_2024'] },
        { id:'link_trade_2', from_id:'mechanism_trade_leverage', to_id:'event_tariff_framework_2025_04_02', relation:'supported_by', support_status:'unreviewed', source_ids:['source_tariff_framework'] },
        { id:'link_trade_3', from_id:'mechanism_trade_leverage', to_id:'event_ev_surtax_2024', relation:'supported_by', support_status:'unreviewed', source_ids:['source_ev_surtax'] }
      ],
      unresolved_questions: []
    };
  }

  global.EESToKernelCommandV01 = Object.freeze({
    VERSION,
    DEFAULT_STORAGE_KEY,
    extractRegistry,
    loadSavedRegistry,
    compileMechanism,
    sampleRegistry
  });
})(typeof window !== 'undefined' ? window : globalThis);
