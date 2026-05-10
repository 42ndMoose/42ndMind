/* 42ndMind Source Registry v0.1
 * Non-scoring source placeholder layer.
 *
 * Purpose:
 * Represent source objects separately from claims and evidence so the kernel can later attach
 * source pressure, retrieval status, trust notes, and unresolved source questions without
 * pretending that retrieval equals verification or that provenance equals truth.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.2';
  const SOURCE_STATUSES = Object.freeze([
    'not_retrieved',
    'provided_by_user',
    'retrieved_unverified',
    'retrieved_verified',
    'needs_review',
    'unavailable'
  ]);
  const DEFAULT_STATUS = 'not_retrieved';

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function text(value) {
    return String(value ?? '').trim();
  }

  function sourceId(index) {
    return `source_${String(index + 1).padStart(3, '0')}`;
  }

  function slug(value, fallback = 'source') {
    const s = text(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return s || fallback;
  }

  function normalizeLocator(locator = {}) {
    return {
      url: text(locator.url),
      citation_text: text(locator.citation_text),
      document_ref: text(locator.document_ref),
      local_ref: text(locator.local_ref),
      quote_hint: text(locator.quote_hint)
    };
  }

  function normalizeSource(raw = {}, index = 0) {
    const status = SOURCE_STATUSES.includes(raw.retrieval_status) ? raw.retrieval_status : DEFAULT_STATUS;
    return {
      id: text(raw.id) || sourceId(index),
      title: text(raw.title) || 'Untitled source',
      source_kind: text(raw.source_kind) || 'unknown',
      locator: normalizeLocator(raw.locator || raw),
      retrieval_status: status,
      retrieval_method: text(raw.retrieval_method) || 'not_attempted',
      retrieved_at: text(raw.retrieved_at),
      trust_notes: asArray(raw.trust_notes).map(text).filter(Boolean),
      reliability_flags: asArray(raw.reliability_flags).map(text).filter(Boolean),
      attached_claim_ids: asArray(raw.attached_claim_ids).map(text).filter(Boolean),
      attached_evidence_ids: asArray(raw.attached_evidence_ids).map(text).filter(Boolean),
      unresolved_source_questions: asArray(raw.unresolved_source_questions).map(text).filter(Boolean),
      provenance: {
        imported_from: text(raw.provenance?.imported_from || raw.imported_from),
        import_event_id: text(raw.provenance?.import_event_id || raw.import_event_id),
        source_trace_id: text(raw.provenance?.source_trace_id || raw.source_trace_id)
      },
      meta: {
        non_scoring: true,
        source_object_not_truth: true,
        source_pressure_not_belief_movement: true,
        retrieval_status_not_verification: true,
        unresolved_questions_remain_visible: true
      }
    };
  }

  function normalizePacket(packet = {}) {
    const sources = asArray(packet.sources).map(normalizeSource);
    return {
      packet_type: '42ndMind_source_registry_packet',
      packet_version: VERSION,
      created_at: text(packet.created_at) || new Date().toISOString(),
      purpose: text(packet.purpose) || 'Represent source objects separately from claims/evidence without scoring belief state.',
      sources,
      claim_source_links: asArray(packet.claim_source_links).map(link => ({
        claim_id: text(link.claim_id),
        source_id: text(link.source_id),
        relation: text(link.relation) || 'cited_by_source',
        note: text(link.note)
      })).filter(link => link.claim_id && link.source_id),
      evidence_source_links: asArray(packet.evidence_source_links).map(link => ({
        evidence_id: text(link.evidence_id),
        source_id: text(link.source_id),
        relation: text(link.relation) || 'derived_from_source',
        note: text(link.note)
      })).filter(link => link.evidence_id && link.source_id),
      source_questions: asArray(packet.source_questions).map(question => ({
        id: text(question.id),
        source_id: text(question.source_id),
        text: text(question.text),
        status: text(question.status) || 'open'
      })).filter(question => question.source_id && question.text),
      doctrine: {
        non_scoring: true,
        source_objects_separate_from_claims: true,
        source_objects_separate_from_evidence: true,
        provenance_is_not_proof: true,
        retrieval_is_not_verification: true,
        trust_notes_are_pressure_not_truth: true,
        unresolved_source_questions_must_remain_visible: true,
        kernel_owns_belief_movement: true
      }
    };
  }

  function buildRegistry(packet = {}) {
    const normalized = normalizePacket(packet);
    const sourcesById = new Map(normalized.sources.map(source => [source.id, source]));

    normalized.claim_source_links.forEach(link => {
      const source = sourcesById.get(link.source_id);
      if (source && !source.attached_claim_ids.includes(link.claim_id)) source.attached_claim_ids.push(link.claim_id);
    });

    normalized.evidence_source_links.forEach(link => {
      const source = sourcesById.get(link.source_id);
      if (source && !source.attached_evidence_ids.includes(link.evidence_id)) source.attached_evidence_ids.push(link.evidence_id);
    });

    normalized.source_questions.forEach(question => {
      const source = sourcesById.get(question.source_id);
      if (source && question.status === 'open' && !source.unresolved_source_questions.includes(question.text)) {
        source.unresolved_source_questions.push(question.text);
      }
    });

    const sources = Array.from(sourcesById.values());
    return {
      registry_type: '42ndMind_source_registry',
      registry_version: VERSION,
      sources,
      claim_source_links: normalized.claim_source_links,
      evidence_source_links: normalized.evidence_source_links,
      source_questions: normalized.source_questions,
      counts: {
        sources: sources.length,
        claim_source_links: normalized.claim_source_links.length,
        evidence_source_links: normalized.evidence_source_links.length,
        source_questions: normalized.source_questions.length,
        unresolved_source_questions: sources.reduce((sum, source) => sum + source.unresolved_source_questions.length, 0),
        retrieved_verified: sources.filter(source => source.retrieval_status === 'retrieved_verified').length,
        retrieved_unverified: sources.filter(source => source.retrieval_status === 'retrieved_unverified').length,
        not_retrieved: sources.filter(source => source.retrieval_status === 'not_retrieved').length
      },
      meta: {
        non_scoring: true,
        source_registry_not_belief_update: true,
        safe_to_attach_to_kernel_state_as_metadata: true,
        note: 'This registry stores provenance and source pressure only. It does not verify facts or move belief state.'
      }
    };
  }

  function importPacket(packet = {}) {
    const normalized = normalizePacket(packet);
    const registry = buildRegistry(normalized);
    const sourceIds = new Set(registry.sources.map(source => source.id));
    const passChecks = {
      has_sources: registry.counts.sources > 0,
      source_objects_separate_from_claims: normalized.doctrine.source_objects_separate_from_claims === true,
      source_objects_separate_from_evidence: normalized.doctrine.source_objects_separate_from_evidence === true,
      every_source_has_retrieval_status: registry.sources.every(source => SOURCE_STATUSES.includes(source.retrieval_status)),
      has_trust_notes: registry.sources.some(source => source.trust_notes.length > 0),
      has_unresolved_source_questions: registry.counts.unresolved_source_questions > 0,
      claim_links_reference_sources: registry.claim_source_links.every(link => sourceIds.has(link.source_id)),
      evidence_links_reference_sources: registry.evidence_source_links.every(link => sourceIds.has(link.source_id)),
      provenance_is_not_proof: normalized.doctrine.provenance_is_not_proof === true,
      retrieval_is_not_verification: normalized.doctrine.retrieval_is_not_verification === true,
      non_scoring: normalized.doctrine.non_scoring === true && registry.meta.non_scoring === true,
      kernel_owns_belief_movement: normalized.doctrine.kernel_owns_belief_movement === true
    };

    return {
      packet_type: '42ndMind_source_registry_report',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      purpose: 'Normalize source objects and source links without scoring belief state.',
      normalized_packet: normalized,
      source_registry: registry,
      pass_checks: passChecks,
      all_passed: Object.values(passChecks).every(Boolean),
      next_kernel_state_extension: {
        field: 'sourceRegistry',
        value: registry,
        attach_as_metadata_only: true,
        scoring_allowed: false
      }
    };
  }

  function traceSourceId(trace = {}, suffix = 'import') {
    const base = slug(trace.event_id || trace.import_time || trace.source_title || 'trace', 'trace');
    return `source_trace_${base}_${suffix}`;
  }

  function sourceTraceToPacket(trace = {}, options = {}) {
    const claimIds = asArray(trace.claim_ids).map(text).filter(Boolean);
    const evidenceIds = asArray(trace.evidence_ids).map(text).filter(Boolean);
    const sourceLinks = asArray(trace.source_links).map(text).filter(Boolean);
    const eventId = text(trace.event_id) || 'unknown_event';
    const sourceKind = text(trace.source_kind) || 'structured_packet_import';
    const sourceTitle = text(trace.source_title) || 'Structured source trace import';
    const importSourceId = traceSourceId(trace, 'import_event');
    const importedFrom = text(options.imported_from) || 'kernel_state.sourceTraces';

    const sources = [{
      id: importSourceId,
      title: `${sourceTitle} import event`,
      source_kind: `${sourceKind}_import_event`,
      locator: {
        citation_text: `Imported source trace ${eventId}`,
        local_ref: eventId,
        quote_hint: `Trace created at ${text(trace.import_time) || 'unknown time'}. Counts: ${JSON.stringify(trace.counts || {})}`
      },
      retrieval_status: 'provided_by_user',
      retrieval_method: 'local_kernel_source_trace',
      retrieved_at: text(trace.import_time),
      trust_notes: [
        'Converted from persisted kernel source trace; not independently retrieved by source registry.',
        'Import provenance groups claim/evidence pressure but does not verify the underlying claims.',
        sourceLinks.length ? `Trace included ${sourceLinks.length} source link(s); link-to-row precision still requires review.` : 'Trace contained no explicit source links.'
      ],
      reliability_flags: ['source_trace_conversion', 'requires_source_review', 'non_scoring_metadata'],
      attached_claim_ids: claimIds,
      attached_evidence_ids: evidenceIds,
      unresolved_source_questions: [
        'Which imported claims are directly supported by each source object?',
        'Which evidence rows are direct citations, interpretations, or counter-considerations?',
        'Can the original source context be retrieved and checked independently?'
      ],
      provenance: {
        imported_from: importedFrom,
        import_event_id: eventId,
        source_trace_id: eventId
      }
    }];

    sourceLinks.forEach((link, index) => {
      const linkId = `${traceSourceId(trace, 'linked_source')}_${String(index + 1).padStart(2, '0')}`;
      const isUrl = /^https?:\/\//i.test(link);
      sources.push({
        id: linkId,
        title: `Linked source ${index + 1} from ${sourceTitle}`,
        source_kind: 'linked_source_from_trace',
        locator: {
          url: isUrl ? link : '',
          citation_text: isUrl ? '' : link,
          local_ref: eventId,
          quote_hint: 'Source link came from imported evidence text; direct row mapping still needs review.'
        },
        retrieval_status: 'not_retrieved',
        retrieval_method: 'link_extracted_from_source_trace',
        retrieved_at: '',
        trust_notes: [
          'Source link was extracted from a source trace and has not been retrieved by the registry.',
          'Do not treat this link as verified support until retrieval and context review are performed.'
        ],
        reliability_flags: ['unretrieved_link', 'requires_context_review', 'non_scoring_metadata'],
        attached_claim_ids: claimIds,
        attached_evidence_ids: evidenceIds,
        unresolved_source_questions: [
          'Can this link be retrieved?',
          'Which exact claim and evidence rows does this link support or weaken?',
          'Does the linked context support the imported claim text, or only a narrower claim?'
        ],
        provenance: {
          imported_from: importSourceId,
          import_event_id: eventId,
          source_trace_id: eventId
        }
      });
    });

    const claim_source_links = sources.flatMap(source => claimIds.map(claim_id => ({
      claim_id,
      source_id: source.id,
      relation: source.id === importSourceId ? 'grouped_by_import_trace' : 'possibly_cited_by_source_link',
      note: 'Non-scoring provenance link from source trace conversion; direct support still requires source review.'
    })));

    const evidence_source_links = sources.flatMap(source => evidenceIds.map(evidence_id => ({
      evidence_id,
      source_id: source.id,
      relation: source.id === importSourceId ? 'grouped_by_import_trace' : 'possibly_derived_from_source_link',
      note: 'Non-scoring provenance link from source trace conversion; direct derivation still requires source review.'
    })));

    const source_questions = sources.flatMap(source => source.unresolved_source_questions.map((question, index) => ({
      id: `${source.id}_question_${String(index + 1).padStart(2, '0')}`,
      source_id: source.id,
      text: question,
      status: 'open'
    })));

    return {
      packet_type: '42ndMind_source_registry_packet',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      purpose: 'Converted from persisted sourceTrace into non-scoring source registry objects.',
      sources,
      claim_source_links,
      evidence_source_links,
      source_questions,
      conversion_meta: {
        converted_from: 'sourceTrace',
        source_trace_event_id: eventId,
        non_scoring: true,
        provenance_is_not_proof: true,
        retrieval_is_not_verification: true,
        link_to_row_precision_requires_review: true
      }
    };
  }

  function sourceTracesToPacket(traces = [], options = {}) {
    const packets = asArray(traces).map((trace, index) => sourceTraceToPacket(trace, { ...options, trace_index: index }));
    return {
      packet_type: '42ndMind_source_registry_packet',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      purpose: 'Converted persisted sourceTraces into non-scoring source registry objects.',
      sources: packets.flatMap(packet => packet.sources),
      claim_source_links: packets.flatMap(packet => packet.claim_source_links),
      evidence_source_links: packets.flatMap(packet => packet.evidence_source_links),
      source_questions: packets.flatMap(packet => packet.source_questions),
      conversion_meta: {
        converted_from: 'sourceTraces',
        trace_count: packets.length,
        non_scoring: true,
        provenance_is_not_proof: true,
        retrieval_is_not_verification: true,
        link_to_row_precision_requires_review: true
      }
    };
  }

  function sampleTrace() {
    return {
      trace_type: 'structured_packet_import',
      source_title: 'Dossier source graph import',
      source_kind: 'dossier_source_graph',
      import_time: '2026-05-10T00:00:00.000Z',
      event_id: 'event_sample_trace',
      counts: { claims: 4, evidence: 7, attacking_evidence: 3, open_questions: 6, observations: 0 },
      source_links: ['https://example.invalid/source-a'],
      claim_ids: ['claim_1', 'claim_2', 'claim_3', 'claim_4'],
      evidence_ids: ['evidence_1', 'evidence_2', 'evidence_3', 'evidence_4', 'evidence_5', 'evidence_6', 'evidence_7'],
      meta: { read_only_trace: true, persisted_in_kernel_state: true }
    };
  }

  function samplePacket() {
    return {
      packet_type: '42ndMind_source_registry_packet',
      packet_version: VERSION,
      purpose: 'Sample non-scoring source registry packet.',
      sources: [
        {
          id: 'source_dossier_001',
          title: 'Sample dossier source excerpt',
          source_kind: 'dossier_section',
          locator: {
            url: 'https://example.invalid/dossier-section',
            citation_text: 'Sample dossier section used as a placeholder source object.',
            quote_hint: 'Specific quote or section locator would go here.'
          },
          retrieval_status: 'provided_by_user',
          retrieval_method: 'user_supplied_packet',
          trust_notes: ['User-supplied curated dossier section; not independently retrieved by kernel.'],
          reliability_flags: ['requires_external_verification'],
          attached_claim_ids: ['dossier_claim_1', 'dossier_claim_2'],
          attached_evidence_ids: ['dossier_evidence_1'],
          unresolved_source_questions: ['Can this source be independently retrieved and checked against the original context?'],
          provenance: { imported_from: 'dossier_source_graph_v0_1', import_event_id: 'event_sample_source_import' }
        },
        {
          id: 'source_counter_001',
          title: 'Counter-consideration placeholder source',
          source_kind: 'counter_consideration_note',
          locator: { citation_text: 'Counter-consideration captured during dossier import.' },
          retrieval_status: 'not_retrieved',
          retrieval_method: 'not_attempted',
          trust_notes: ['Counter-pressure source object, not a verified external citation.'],
          reliability_flags: ['pressure_only'],
          attached_claim_ids: ['dossier_claim_2'],
          attached_evidence_ids: ['dossier_evidence_attack_1'],
          unresolved_source_questions: ['What external evidence would strengthen or weaken this counter-consideration?']
        }
      ],
      claim_source_links: [
        { claim_id: 'dossier_claim_1', source_id: 'source_dossier_001', relation: 'cited_by_source', note: 'Claim is represented as coming from this dossier source object.' },
        { claim_id: 'dossier_claim_2', source_id: 'source_counter_001', relation: 'pressured_by_source', note: 'Counter-pressure remains attached separately.' }
      ],
      evidence_source_links: [
        { evidence_id: 'dossier_evidence_1', source_id: 'source_dossier_001', relation: 'derived_from_source' },
        { evidence_id: 'dossier_evidence_attack_1', source_id: 'source_counter_001', relation: 'derived_from_source' }
      ],
      source_questions: [
        { id: 'sq_001', source_id: 'source_dossier_001', text: 'Does the cited source support the exact claim text or only a narrower version?', status: 'open' }
      ]
    };
  }

  global.SourceRegistryV01 = Object.freeze({
    VERSION,
    SOURCE_STATUSES,
    normalizePacket,
    normalizeSource,
    buildRegistry,
    importPacket,
    sourceTraceToPacket,
    sourceTracesToPacket,
    sampleTrace,
    samplePacket
  });
})(typeof window !== 'undefined' ? window : globalThis);
