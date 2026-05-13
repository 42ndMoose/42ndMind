/* 42ndMind Epistemic Memory v0.4
 *
 * Purpose:
 * Maintain a local epistemic ledger for contradictions, source failures,
 * rejected candidates, sandbox drift, failed activations, and archived beliefs.
 *
 * This module does not decide truth, import commands, delete claims, mutate v0.3,
 * or move active belief state. It stores memory as reviewable pressure.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DEFAULT_KEY = '42ndMind_epistemic_memory_v0_4';

  const ENTRY_TYPES = Object.freeze({
    CONTRADICTION: 'contradiction_memory',
    SOURCE_TRUST: 'source_trust_memory',
    SANDBOX_DRIFT: 'sandbox_drift_memory',
    ACTIVATION_FAILURE: 'activation_failure_memory',
    REJECTED_CANDIDATE: 'rejected_candidate_memory',
    ARCHIVED_BELIEF: 'archived_belief_memory',
    GENERAL_PRESSURE: 'general_epistemic_pressure_memory'
  });

  const DECISIONS = Object.freeze({
    MEMORY_RECORDED: 'MEMORY_RECORDED',
    MEMORY_HELD: 'MEMORY_HELD',
    MEMORY_REVIEW_REQUIRED: 'MEMORY_REVIEW_REQUIRED',
    MEMORY_EMPTY: 'MEMORY_EMPTY'
  });

  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function id(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function round(value) { return Number(clamp(value, 0, 1).toFixed(3)); }

  function storageAvailable() {
    try { return typeof localStorage !== 'undefined'; }
    catch (error) { return false; }
  }

  function parse(raw, fallback) {
    try { return JSON.parse(raw); }
    catch (error) { return fallback; }
  }

  function emptyLedger() {
    return {
      packet_type: '42ndMind_epistemic_memory_ledger_v0_4',
      packet_version: VERSION,
      created_at: now(),
      updated_at: now(),
      entries: [],
      counters: {
        total_entries: 0,
        contradictions: 0,
        source_trust_events: 0,
        sandbox_drifts: 0,
        activation_failures: 0,
        rejected_candidates: 0,
        archived_beliefs: 0
      },
      doctrine: doctrine()
    };
  }

  function load(key = DEFAULT_KEY) {
    if (!storageAvailable()) return emptyLedger();
    const raw = localStorage.getItem(key);
    if (!raw) return emptyLedger();
    const ledger = parse(raw, emptyLedger());
    if (!ledger || !Array.isArray(ledger.entries)) return emptyLedger();
    return ledger;
  }

  function save(ledger, key = DEFAULT_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    ledger.updated_at = now();
    ledger.counters = summarize(ledger).counters;
    localStorage.setItem(key, JSON.stringify(ledger, null, 2));
    return { ok:true, reason:'saved_epistemic_memory', key, ledger };
  }

  function clear(key = DEFAULT_KEY) {
    if (!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key };
    localStorage.removeItem(key);
    return { ok:true, reason:'cleared_epistemic_memory', key };
  }

  function entry(type, data = {}, options = {}) {
    const rawSeverity = options.severity || data.severity || inferSeverity(type, data);
    return {
      id: text(options.id) || id(type),
      entry_type: type,
      created_at: now(),
      updated_at: now(),
      status: text(options.status || data.status || 'inactive_pressure'),
      severity: rawSeverity,
      pressure_score: round(options.pressure_score !== undefined ? options.pressure_score : inferPressure(type, data)),
      subject_id: text(data.subject_id || data.claim_id || data.source_id || data.candidate_id || data.proposal_id || data.id),
      label: text(data.label || data.title || data.text || data.source_label || data.reason || type),
      reason: text(data.reason || data.message || inferReason(type, data)),
      provenance: asArray(data.provenance || data.sources || data.source_ids || data.provenance_ids).map(text).filter(Boolean),
      tags: asArray(data.tags).map(text).filter(Boolean),
      memory_effect: memoryEffect(type),
      active_belief_effect: 'none',
      raw: clone(data || {})
    };
  }

  function inferSeverity(type, data) {
    if (type === ENTRY_TYPES.CONTRADICTION || type === ENTRY_TYPES.SANDBOX_DRIFT) return 'high';
    if (type === ENTRY_TYPES.SOURCE_TRUST && /CONFLICTED|HOLD/i.test(text(data.decision))) return 'high';
    if (type === ENTRY_TYPES.ACTIVATION_FAILURE || type === ENTRY_TYPES.REJECTED_CANDIDATE) return 'medium';
    return 'low';
  }

  function inferPressure(type, data) {
    if (type === ENTRY_TYPES.CONTRADICTION) return 0.9;
    if (type === ENTRY_TYPES.SANDBOX_DRIFT) return 0.86;
    if (type === ENTRY_TYPES.SOURCE_TRUST && /CONFLICTED/i.test(text(data.decision))) return 0.82;
    if (type === ENTRY_TYPES.SOURCE_TRUST && /HOLD|LOW/i.test(text(data.decision))) return 0.58;
    if (type === ENTRY_TYPES.ACTIVATION_FAILURE) return 0.54;
    if (type === ENTRY_TYPES.REJECTED_CANDIDATE) return 0.5;
    if (type === ENTRY_TYPES.ARCHIVED_BELIEF) return 0.46;
    return 0.25;
  }

  function inferReason(type, data) {
    if (type === ENTRY_TYPES.CONTRADICTION) return 'Contradiction remains archived as inactive pressure, not deleted.';
    if (type === ENTRY_TYPES.SOURCE_TRUST) return 'Source-trust pressure recorded for future provenance review.';
    if (type === ENTRY_TYPES.SANDBOX_DRIFT) return 'Candidate behavior drift recorded for future promotion review.';
    if (type === ENTRY_TYPES.ACTIVATION_FAILURE) return 'Failed activation requirements recorded for review.';
    if (type === ENTRY_TYPES.REJECTED_CANDIDATE) return 'Rejected candidate recorded for future pattern awareness.';
    if (type === ENTRY_TYPES.ARCHIVED_BELIEF) return 'Belief archived and removed from active support without deletion.';
    return 'General epistemic pressure recorded.';
  }

  function memoryEffect(type) {
    return {
      active_support_removed: type === ENTRY_TYPES.CONTRADICTION || type === ENTRY_TYPES.ARCHIVED_BELIEF,
      future_trust_prior_pressure: type === ENTRY_TYPES.SOURCE_TRUST,
      future_promotion_pressure: type === ENTRY_TYPES.SANDBOX_DRIFT || type === ENTRY_TYPES.REJECTED_CANDIDATE || type === ENTRY_TYPES.ACTIVATION_FAILURE,
      deleted: false,
      archived: true,
      reviewable: true
    };
  }

  function record(input, options = {}) {
    const key = options.key || DEFAULT_KEY;
    const ledger = load(key);
    const entries = entriesFrom(input, options);
    if (!entries.length) {
      return {
        ok:false,
        decision: DECISIONS.MEMORY_EMPTY,
        reason:'no_memory_entries_derived',
        ledger,
        recorded: []
      };
    }
    entries.forEach(e => ledger.entries.push(e));
    const saved = save(ledger, key);
    return {
      ok:saved.ok,
      decision: saved.ok ? DECISIONS.MEMORY_RECORDED : DECISIONS.MEMORY_HELD,
      reason: saved.reason,
      key,
      recorded: entries,
      ledger: saved.ledger || ledger,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function entriesFrom(input = {}, options = {}) {
    const packetType = text(input.packet_type);
    if (packetType === '42ndMind_source_trust_report_v0_4') return [entry(ENTRY_TYPES.SOURCE_TRUST, input, { severity: sourceSeverity(input) })];
    if (packetType === '42ndMind_source_trust_bridge_packet_v0_4') {
      return asArray(input.source_trust_reports).map(report => entry(ENTRY_TYPES.SOURCE_TRUST, report, { severity: sourceSeverity(report) }));
    }
    if (packetType === '42ndMind_sandbox_comparison_report_v0_4') {
      if (input.decision === 'BLOCK_BEHAVIOR_DRIFT' || input.behavior_delta_detected === true) return [entry(ENTRY_TYPES.SANDBOX_DRIFT, input, { pressure_score:0.86 })];
      if (input.decision === 'BLOCK_UNSAFE_CANDIDATE') return [entry(ENTRY_TYPES.REJECTED_CANDIDATE, input, { pressure_score:0.7 })];
      return [];
    }
    if (packetType === '42ndMind_runtime_activation_evaluation_v0_4') {
      if (input.decision && input.decision !== 'ACTIVATE_METADATA_ONLY') return [entry(ENTRY_TYPES.ACTIVATION_FAILURE, input, { pressure_score:0.55 })];
      return [];
    }
    if (packetType === '42ndMind_kernel_consistency_report_v0_4') {
      if (input.decision === 'CONTRADICTION_VISIBLE') return [entry(ENTRY_TYPES.CONTRADICTION, input, { pressure_score:0.9 })];
      return [];
    }
    if (input.type || input.entry_type) return [entry(input.entry_type || input.type, input, options)];
    return [];
  }

  function sourceSeverity(report) {
    if (report.decision === 'TRUST_PRIOR_CONFLICTED') return 'high';
    if (report.decision === 'HOLD_SOURCE_REVIEW' || report.decision === 'TRUST_PRIOR_LOW') return 'medium';
    return 'low';
  }

  function archiveBelief(belief = {}, options = {}) {
    return record({
      entry_type: ENTRY_TYPES.ARCHIVED_BELIEF,
      subject_id: belief.id || belief.claim_id,
      label: belief.text || belief.label || 'archived belief',
      reason: options.reason || belief.reason || 'Belief removed from active support and archived as inactive pressure.',
      provenance: belief.provenance || belief.source_ids || [],
      tags: ['archived_belief'].concat(asArray(belief.tags)),
      belief
    }, options);
  }

  function summarize(ledgerInput) {
    const ledger = ledgerInput && Array.isArray(ledgerInput.entries) ? ledgerInput : load();
    const entries = asArray(ledger.entries);
    const counters = {
      total_entries: entries.length,
      contradictions: entries.filter(e => e.entry_type === ENTRY_TYPES.CONTRADICTION).length,
      source_trust_events: entries.filter(e => e.entry_type === ENTRY_TYPES.SOURCE_TRUST).length,
      sandbox_drifts: entries.filter(e => e.entry_type === ENTRY_TYPES.SANDBOX_DRIFT).length,
      activation_failures: entries.filter(e => e.entry_type === ENTRY_TYPES.ACTIVATION_FAILURE).length,
      rejected_candidates: entries.filter(e => e.entry_type === ENTRY_TYPES.REJECTED_CANDIDATE).length,
      archived_beliefs: entries.filter(e => e.entry_type === ENTRY_TYPES.ARCHIVED_BELIEF).length
    };
    const bySubject = {};
    entries.forEach(e => {
      const k = e.subject_id || 'unknown';
      if (!bySubject[k]) bySubject[k] = { subject_id:k, count:0, pressure_total:0, max_pressure:0, entry_types:[] };
      bySubject[k].count += 1;
      bySubject[k].pressure_total += Number(e.pressure_score || 0);
      bySubject[k].max_pressure = Math.max(bySubject[k].max_pressure, Number(e.pressure_score || 0));
      bySubject[k].entry_types.push(e.entry_type);
    });
    const subject_pressure = Object.values(bySubject).map(row => ({
      subject_id: row.subject_id,
      count: row.count,
      average_pressure: round(row.pressure_total / Math.max(1, row.count)),
      max_pressure: round(row.max_pressure),
      entry_types: Array.from(new Set(row.entry_types))
    }));
    return {
      packet_type: '42ndMind_epistemic_memory_summary_v0_4',
      packet_version: VERSION,
      created_at: now(),
      counters,
      subject_pressure,
      doctrine: doctrine()
    };
  }

  function recall(query = {}, options = {}) {
    const key = options.key || DEFAULT_KEY;
    const ledger = load(key);
    const type = text(query.entry_type || query.type);
    const subject = text(query.subject_id || query.source_id || query.claim_id || query.candidate_id);
    const minPressure = query.min_pressure !== undefined ? Number(query.min_pressure) : 0;
    const entries = ledger.entries.filter(e => {
      if (type && e.entry_type !== type) return false;
      if (subject && e.subject_id !== subject) return false;
      if (Number(e.pressure_score || 0) < minPressure) return false;
      return true;
    });
    return {
      packet_type: '42ndMind_epistemic_memory_recall_v0_4',
      packet_version: VERSION,
      created_at: now(),
      query: clone(query || {}),
      count: entries.length,
      entries,
      belief_movement: 'none',
      doctrine: doctrine()
    };
  }

  function doctrine() {
    return {
      epistemic_memory_is_not_active_belief: true,
      contradicted_beliefs_are_archived_not_deleted: true,
      memory_records_pressure_not_truth: true,
      memory_does_not_import_commands: true,
      memory_does_not_mutate_v0_3: true,
      memory_is_reviewable_and_falsifiable: true
    };
  }

  function samplePacket(kind) {
    if (kind === 'source_conflicted') return { packet_type:'42ndMind_source_trust_report_v0_4', source_id:'source_bad', source_label:'Repeatedly contradicted certified source', decision:'TRUST_PRIOR_CONFLICTED', trust_prior_score:0.22, verification_burden:['seek_primary_source'], history_signals:{ contradiction_count:4 } };
    if (kind === 'sandbox_drift') return { packet_type:'42ndMind_sandbox_comparison_report_v0_4', decision:'BLOCK_BEHAVIOR_DRIFT', candidate_id:'candidate_bad', behavior_delta_detected:true, comparisons:[{ probe_id:'claim', diffs:[{ field:'final_decision' }] }] };
    if (kind === 'activation_failure') return { packet_type:'42ndMind_runtime_activation_evaluation_v0_4', candidate_id:'candidate_missing_tests', decision:'HOLD_TESTS_MISSING', issues:[{ code:'test_packets_missing' }] };
    if (kind === 'contradiction') return { packet_type:'42ndMind_kernel_consistency_report_v0_4', decision:'CONTRADICTION_VISIBLE', conflicts:[{ a:'claim_a', b:'claim_b' }] };
    return { entry_type:ENTRY_TYPES.GENERAL_PRESSURE, subject_id:'sample', label:'sample pressure', reason:'sample memory pressure' };
  }

  global.KernelEpistemicMemoryV04 = Object.freeze({
    VERSION,
    DEFAULT_KEY,
    ENTRY_TYPES,
    DECISIONS,
    load,
    save,
    clear,
    record,
    entriesFrom,
    archiveBelief,
    summarize,
    recall,
    samplePacket,
    doctrine
  });
})(typeof window !== 'undefined' ? window : globalThis);
