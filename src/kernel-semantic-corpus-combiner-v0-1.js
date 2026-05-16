/* 42ndMind Semantic Corpus Combiner v0.1
 * Combines the main semantic seed corpus with modular extension batches.
 * This avoids risky large JSON rewrites while allowing the kernel to use a
 * single runtime working corpus.
 *
 * It does not decide truth, move belief, promote doctrine, or patch source.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_semantic_corpus_combiner_v0_1';
  const COMBINED_PACKET_TYPE = '42ndMind_semantic_seed_corpus_v0_1';
  const DEFAULT_MAIN_URL = 'data/semantic_seed_corpus_v0_1.json';
  const DEFAULT_EXTENSION_URLS = Object.freeze([
    'data/semantic_seed_closure_contrast_v0_1.json',
    'data/semantic_seed_authority_evidence_contrast_v0_1.json',
    'data/semantic_seed_motive_agency_weakmap_contrast_v0_1.json',
    'data/semantic_seed_scope_qualification_contrast_v0_1.json',
    'data/semantic_seed_closure_source_gap_contrast_v0_1.json',
    'data/semantic_seed_unverified_contrast_v0_1.json',
    'data/semantic_seed_rhetoric_intent_pressure_v0_1.json',
    'data/semantic_seed_vector_template_contrast_v0_1.json',
    'data/semantic_seed_vector_template_contrast_v0_2.json',
    'data/semantic_seed_accusation_risk_direct_evidence_v0_1.json'
  ]);

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function unique(items) { const seen = new Set(), out = []; asArray(items).forEach(item => { const value = text(item), key = lower(value); if (value && !seen.has(key)) { seen.add(key); out.push(value); } }); return out; }
  function entriesOf(packet) { return packet && Array.isArray(packet.entries) ? packet.entries : []; }

  function doctrine() {
    return {
      combiner_builds_runtime_working_corpus_not_truth: true,
      modular_extensions_preserve_review_status: true,
      duplicate_ids_are_skipped_not_overwritten: true,
      corpus_entries_are_training_pressure_not_truth: true,
      source_status_is_metadata_not_truth: true,
      combiner_does_not_move_belief: true,
      combiner_does_not_promote_doctrine: true,
      combiner_does_not_patch_source: true,
      belief_movement: 'none'
    };
  }

  function normalizePacket(packet, sourceLabel) {
    const p = packet || {};
    return {
      packet_type: text(p.packet_type || 'unknown_packet'),
      packet_version: text(p.packet_version || 'unknown'),
      source_label: text(sourceLabel || p.description || p.packet_type || 'unknown_source'),
      description: text(p.description),
      entry_count: entriesOf(p).length,
      entries: clone(entriesOf(p))
    };
  }

  function collectOperatorGroups(packets) {
    const groups = [];
    asArray(packets).forEach(packet => {
      if (Array.isArray(packet.operator_groups)) groups.push.apply(groups, packet.operator_groups);
      entriesOf(packet).forEach(entry => { if (entry.operator_group) groups.push(entry.operator_group); });
    });
    return unique(groups);
  }

  function combinePackets(mainPacket, extensionPackets, options = {}) {
    const packets = [mainPacket].concat(asArray(extensionPackets));
    const normalized = packets.map((packet, index) => normalizePacket(packet, index === 0 ? 'main' : `extension_${index}`));
    const seenIds = new Set();
    const entries = [];
    const duplicate_entries = [];
    const source_entry_counts = {};

    normalized.forEach((source, sourceIndex) => {
      source_entry_counts[source.source_label] = source.entry_count;
      source.entries.forEach((entry, entryIndex) => {
        const id = text(entry.id);
        if (!id) {
          duplicate_entries.push({ reason: 'missing_id', source_label: source.source_label, source_index: sourceIndex, entry_index: entryIndex });
          return;
        }
        if (seenIds.has(id)) {
          duplicate_entries.push({ reason: 'duplicate_id_skipped', id, source_label: source.source_label, source_index: sourceIndex, entry_index: entryIndex });
          return;
        }
        seenIds.add(id);
        const next = clone(entry);
        next.combiner_metadata = Object.assign({}, next.combiner_metadata || {}, {
          included_by: PACKET_TYPE,
          included_at: now(),
          source_label: source.source_label,
          source_packet_type: source.packet_type,
          source_packet_version: source.packet_version,
          source_index: sourceIndex,
          source_entry_index: entryIndex
        });
        entries.push(next);
      });
    });

    const combined = {
      packet_type: COMBINED_PACKET_TYPE,
      packet_version: '0.1.0',
      created_at: now(),
      description: text(options.description || 'Runtime combined semantic corpus assembled from main seed corpus and modular extension batches.'),
      combined_by: PACKET_TYPE,
      combiner_version: VERSION,
      doctrine: doctrine(),
      operator_groups: collectOperatorGroups(packets),
      source_packets: normalized.map(({ packet_type, packet_version, source_label, description, entry_count }) => ({ packet_type, packet_version, source_label, description, entry_count })),
      source_entry_counts,
      duplicate_entries,
      entry_count: entries.length,
      entries,
      belief_movement: 'none'
    };

    return combined;
  }

  function validateCombined(combined, options = {}) {
    const validationAvailable = !!(global.KernelSemanticCorpusV01 && typeof global.KernelSemanticCorpusV01.validateCorpus === 'function');
    const validation = validationAvailable ? global.KernelSemanticCorpusV01.validateCorpus(combined, options) : { ok:false, errors:['KernelSemanticCorpusV01 unavailable'], warnings:[] };
    return {
      packet_type: '42ndMind_semantic_corpus_combiner_validation_report_v0_1',
      packet_version: VERSION,
      created_at: now(),
      ok: validation.ok === true,
      combined_entry_count: combined && combined.entry_count || entriesOf(combined).length,
      duplicate_count: asArray(combined && combined.duplicate_entries).length,
      validation,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function summarizeCombined(combined) {
    const baseSummary = global.KernelSemanticCorpusV01 && typeof global.KernelSemanticCorpusV01.summarize === 'function'
      ? global.KernelSemanticCorpusV01.summarize(combined)
      : { entry_count: entriesOf(combined).length, groups: {}, operators: {}, pressures: {} };
    return Object.assign({}, baseSummary, {
      packet_type: '42ndMind_semantic_corpus_combiner_summary_v0_1',
      packet_version: VERSION,
      created_at: now(),
      combined_by: PACKET_TYPE,
      source_packets: clone(asArray(combined && combined.source_packets)),
      duplicate_entries: clone(asArray(combined && combined.duplicate_entries)),
      belief_movement: 'none',
      doctrine: doctrine()
    });
  }

  function toObservationBatch(combined, options = {}) {
    if (!global.KernelSemanticCorpusV01 || typeof global.KernelSemanticCorpusV01.toSemanticObservationBatch !== 'function') {
      return { ok:false, reason:'KernelSemanticCorpusV01.toSemanticObservationBatch unavailable', belief_movement:'none', doctrine:doctrine() };
    }
    const batch = global.KernelSemanticCorpusV01.toSemanticObservationBatch(combined, options);
    batch.combined_by = PACKET_TYPE;
    batch.combiner_version = VERSION;
    batch.source_packets = clone(asArray(combined && combined.source_packets));
    batch.belief_movement = 'none';
    batch.doctrine = doctrine();
    return batch;
  }

  function buildPacket(mainPacket, extensionPackets, options = {}) {
    const combined = combinePackets(mainPacket, extensionPackets, options);
    const validation = validateCombined(combined, options);
    const summary = summarizeCombined(combined);
    return {
      packet_type: PACKET_TYPE,
      packet_version: VERSION,
      created_at: now(),
      ok: validation.ok === true,
      decision: validation.ok ? 'COMBINED_CORPUS_READY' : 'COMBINED_CORPUS_HELD',
      combined,
      validation,
      summary,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  async function fetchJson(url) {
    if (typeof fetch !== 'function') throw new Error('fetch_unavailable');
    const target = `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(VERSION)}`;
    const response = await fetch(target);
    if (!response.ok) throw new Error(`fetch_failed_${response.status}_${url}`);
    return response.json();
  }

  async function loadAndCombine(options = {}) {
    const mainUrl = text(options.main_url || DEFAULT_MAIN_URL);
    const suppliedExtensions = options.extension_urls ? asArray(options.extension_urls) : DEFAULT_EXTENSION_URLS;
    const extensionUrls = unique(suppliedExtensions.concat(DEFAULT_EXTENSION_URLS));
    const main = await fetchJson(mainUrl);
    const extensions = [];
    const load_errors = [];
    for (const url of extensionUrls) {
      try { extensions.push(await fetchJson(url)); }
      catch (e) { if (options.strict_extensions === true) throw e; load_errors.push({ url, error: e.message }); }
    }
    const packet = buildPacket(main, extensions, options);
    packet.main_url = mainUrl;
    packet.extension_urls = extensionUrls;
    packet.load_errors = load_errors;
    if (load_errors.length) packet.validation.validation.warnings = asArray(packet.validation.validation.warnings).concat(load_errors.map(e => `extension_load_error:${e.url}:${e.error}`));
    return packet;
  }

  function exportForBridge(combined) {
    return {
      packet_type: '42ndMind_semantic_corpus_combiner_bridge_export_v0_1',
      packet_version: VERSION,
      created_at: now(),
      combined_corpus: combined,
      semantic_observation_batch: toObservationBatch(combined),
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  global.KernelSemanticCorpusCombinerV01 = Object.freeze({
    VERSION, PACKET_TYPE, COMBINED_PACKET_TYPE, DEFAULT_MAIN_URL, DEFAULT_EXTENSION_URLS,
    doctrine, normalizePacket, combinePackets, validateCombined, summarizeCombined,
    toObservationBatch, buildPacket, fetchJson, loadAndCombine, exportForBridge
  });
})(typeof window !== 'undefined' ? window : globalThis);