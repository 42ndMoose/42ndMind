/* 42ndMind Live Brain Source Registry Bridge v0.1
 * Adds saved sourceRegistry visibility to live brain packets as non-scoring metadata.
 *
 * This bridge does not mutate claims, evidence, gates, confidence, contradictions, graph nodes,
 * root worldview, or Octahedron coordinates.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const STORAGE_KEY = '42ndMind_source_registry_v0_1';

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function readSavedSourceRegistry() {
    const raw = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      return {
        available: false,
        storage_key: STORAGE_KEY,
        reason: 'no_saved_source_registry',
        meta: nonScoringMeta()
      };
    }
    try {
      const payload = JSON.parse(raw);
      const registry = payload.sourceRegistry || (payload.sourceRegistryReport && payload.sourceRegistryReport.source_registry) || null;
      if (!registry) {
        return {
          available: false,
          storage_key: STORAGE_KEY,
          reason: 'saved_payload_missing_sourceRegistry',
          saved_at: payload.saved_at || '',
          meta: nonScoringMeta()
        };
      }
      return {
        available: true,
        storage_key: STORAGE_KEY,
        saved_at: payload.saved_at || '',
        sourceRegistry: registry,
        sourceRegistryReport: payload.sourceRegistryReport || null,
        saved_meta: payload.meta || {},
        meta: nonScoringMeta()
      };
    } catch (error) {
      return {
        available: false,
        storage_key: STORAGE_KEY,
        reason: 'parse_failed',
        error: error.message,
        meta: nonScoringMeta()
      };
    }
  }

  function nonScoringMeta() {
    return {
      non_scoring: true,
      metadata_only: true,
      source_registry_not_belief_update: true,
      scoring_allowed: false,
      affects_claim_confidence: false,
      affects_gates: false,
      affects_root_worldview: false,
      provenance_is_not_proof: true,
      retrieval_is_not_verification: true
    };
  }

  function summarizeRegistry(saved) {
    const registry = saved && saved.sourceRegistry;
    const sources = asArray(registry && registry.sources);
    const claimLinks = asArray(registry && registry.claim_source_links);
    const evidenceLinks = asArray(registry && registry.evidence_source_links);
    const sourceQuestions = asArray(registry && registry.source_questions);
    const counts = registry && registry.counts ? registry.counts : {};
    const statuses = sources.reduce((acc, source) => {
      const status = source.retrieval_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return {
      available: !!(saved && saved.available && registry),
      storage_key: STORAGE_KEY,
      saved_at: (saved && saved.saved_at) || '',
      reason: saved && saved.reason ? saved.reason : '',
      error: saved && saved.error ? saved.error : '',
      counts: {
        sources: Number(counts.sources || sources.length || 0),
        claim_source_links: Number(counts.claim_source_links || claimLinks.length || 0),
        evidence_source_links: Number(counts.evidence_source_links || evidenceLinks.length || 0),
        source_questions: Number(counts.source_questions || sourceQuestions.length || 0),
        unresolved_source_questions: Number(counts.unresolved_source_questions || sources.reduce((sum, source) => sum + asArray(source.unresolved_source_questions).length, 0))
      },
      retrieval_statuses: statuses,
      doctrine: {
        non_scoring: true,
        metadata_only: true,
        source_objects_separate_from_claims: true,
        source_objects_separate_from_evidence: true,
        provenance_is_not_proof: true,
        retrieval_is_not_verification: true,
        kernel_owns_belief_movement: true
      }
    };
  }

  function augmentPacket(packet) {
    const saved = readSavedSourceRegistry();
    const summary = summarizeRegistry(saved);
    packet.source_registry_summary = summary;
    packet.source_registry_metadata = saved.available ? {
      available: true,
      storage_key: STORAGE_KEY,
      saved_at: saved.saved_at,
      sourceRegistry: saved.sourceRegistry,
      sourceRegistryReport: saved.sourceRegistryReport,
      meta: saved.meta
    } : {
      available: false,
      storage_key: STORAGE_KEY,
      reason: saved.reason || 'no_saved_source_registry',
      error: saved.error || '',
      meta: saved.meta
    };
    packet.patch_status = packet.patch_status || {};
    packet.patch_status.source_registry_visibility = 'patched_metadata_only';
    packet.packet_version = packet.packet_version === '0.3.3-patched' ? '0.3.4-patched' : packet.packet_version;
    return packet;
  }

  function install() {
    if (typeof global.brainPacket !== 'function') return false;
    if (global.__sourceRegistryBridgeInstalled) return true;
    const originalBrainPacket = global.brainPacket;
    global.brainPacket = function wrappedBrainPacket() {
      const packet = originalBrainPacket.apply(this, arguments);
      return augmentPacket(packet);
    };
    global.__sourceRegistryBridgeInstalled = true;
    global.SourceRegistryBridgeV01 = Object.freeze({
      VERSION,
      STORAGE_KEY,
      readSavedSourceRegistry,
      summarizeRegistry,
      augmentPacket
    });
    if (typeof global.refresh === 'function') {
      try { global.refresh(); } catch (error) { /* non-fatal: next manual refresh/copy will use the patched packet */ }
    }
    return true;
  }

  install();
})(typeof window !== 'undefined' ? window : globalThis);
