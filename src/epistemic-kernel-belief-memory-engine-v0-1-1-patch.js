/* 42ndMind Belief-Memory Engine v0.1.1 Patch
 *
 * Fixes refresh side effects and adds an internal self-optimization drive.
 * The kernel does not wait for the UI to clean memory. It detects memory
 * pressure, wants a leaner memory drawer, compacts low-value bulk, preserves
 * high-value semantic memory, and keeps all belief movement provisional only.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1';
  const MAX_MEMORY_ITEMS_AFTER_COMPACTION = 42;

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function tinyHash(raw) { let h = 2166136261; const s = text(raw); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function rowId(prefix, parts) { return `${prefix}_${tinyHash(asArray(parts).join('|')).slice(0, 12)}`; }
  function latestEvent(state) { const rows = asArray(state && state.runtimeEvents); return rows.length ? rows[rows.length - 1] : null; }
  function eventText(event) { return text(event && (event.raw_text || event.input || event.text || event.payload && event.payload.raw_text)); }
  function stateFromKernel(kernel) { return kernel && kernel.state && (kernel.state.unifiedCore || kernel.state); }

  function ensureBaseCore(state) {
    const base = global.EpistemicKernelBeliefMemoryEngineV01;
    if (base && typeof base.ensureBeliefMemoryCore === 'function') return base.ensureBeliefMemoryCore(state);
    if (!state.beliefMemoryCore) state.beliefMemoryCore = {};
    return state.beliefMemoryCore;
  }

  function eventFingerprint(event) {
    const raw = eventText(event);
    if (!event && !raw) return '';
    return `${event && event.id || 'noevent'}:${tinyHash(raw).slice(0, 14)}`;
  }

  function uniqueRows(rows, keyFn) {
    const seen = new Set();
    const out = [];
    asArray(rows).forEach(row => {
      const key = keyFn(row);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(row);
    });
    return out;
  }

  function ensurePatchState(core) {
    core.packet_version = VERSION;
    core.patch_version = VERSION;
    core.event_processing = Object.assign({
      processed_event_fingerprints: [],
      last_event_fingerprint: null,
      duplicate_refreshes_ignored: 0,
      idempotence_policy: 'same_latest_event_refresh_must_not_reteach_memory_or_recount_user_trust'
    }, core.event_processing || {});
    core.event_processing.processed_event_fingerprints = asArray(core.event_processing.processed_event_fingerprints);
    core.self_optimization_drive = Object.assign({
      active: true,
      optimizer_owner: 'kernel_internal_maturity_appetite',
      current_goal: 'preserve useful memory while reducing repeated raw bulk',
      appetite_score: 0,
      memory_pressure: {},
      last_optimization_pressure: null,
      reasons: [],
      actions_taken: [],
      refuses: ['external_ui_cleanup_as_thought_source', 'delete_high_value_semantics', 'promote_truth_during_compaction'],
      status: 'idle_memory_pressure_not_yet_high',
      last_optimized_at: null,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    }, core.self_optimization_drive || {});
    core.memory_compaction_log = uniqueRows(asArray(core.memory_compaction_log), r => r.compaction_id || `${r.reason}|${r.compacted_at}|${r.before_count}|${r.after_count}`);
    core.optimized_memory_items = asArray(core.optimized_memory_items);
    core.memory_reaction_log = uniqueRows(asArray(core.memory_reaction_log), r => `${r.event_fingerprint}|${r.compaction_id || r.reaction_kind || 'reaction'}`).slice(0, 30);
    core.latest_reaction = core.latest_reaction || null;
    core.doctrine = Object.assign({}, core.doctrine || {}, {
      refresh_idempotence_required: true,
      reaction_log_must_not_bulk_on_duplicate_refresh: true,
      memory_self_optimization_drive_lives_inside_owned_state: true,
      kernel_wants_memory_to_remain_usable: true,
      optimization_is_internal_maturity_appetite_not_external_cleanup: true,
      compact_raw_bulk_preserve_semantic_memory: true,
      no_final_truth_promotion: true,
      belief_movement: 'provisional_only'
    });
    core.truth_status = 'not_final';
    core.promotion_status = 'not_promoted_to_final_truth';
    core.belief_movement = 'provisional_only';
    return core;
  }

  function normalizeUserTrust(core) {
    const profile = core.user_trust_profile || {};
    const rawUnique = uniqueRows(asArray(core.memory_items).filter(m => m.memory_kind === 'raw_user_statement'), m => m.memory_id || lower(m.statement)).length;
    const processed = asArray(core.event_processing && core.event_processing.processed_event_fingerprints).length;
    const observed = Math.max(rawUnique, processed, profile.observed_inputs ? Math.min(Number(profile.observed_inputs) || 0, Math.max(rawUnique, processed, 1)) : 0, 1);
    const contradictionFlags = asArray(profile.contradiction_flags);
    const clarity = clamp01(Number(profile.clarity_score || 0.5));
    const consistency = clamp01((observed - Math.min(observed, contradictionFlags.length)) / Math.max(1, observed));
    profile.observed_inputs = observed;
    profile.consistent_inputs = Math.round(consistency * observed);
    profile.consistency_score = Number(consistency.toFixed(3));
    profile.clarity_score = Number(clarity.toFixed(3));
    profile.trust_score_candidate = clamp01(Number((0.50 + clarity * 0.18 + consistency * 0.12 + Math.min(0.08, observed * 0.012)).toFixed(3)));
    profile.last_updated = now();
    profile.truth_status = 'not_final';
    profile.promotion_status = 'not_promoted_to_final_truth';
    profile.belief_movement = 'provisional_only';
    core.user_trust_profile = profile;
    core.source_trust_profiles = uniqueRows([profile].concat(asArray(core.source_trust_profiles)), p => p.source_id || p.source_kind || JSON.stringify(p)).slice(0, 24);
    return profile;
  }

  function summarizeStatement(statement, kind) {
    const s = text(statement);
    const l = lower(s);
    if (l.includes('race jokes') || l.includes('racist jokes') || l.includes('stereotyping')) {
      return 'Compressed user context: race jokes and racist jokes require distinction; boundary depends on context, intent, trust, hostility, dehumanization, false overgeneralization, and correction; user favors good-faith correction over policy-driven suppression.';
    }
    if (l.includes('creator') && l.includes('kernel')) {
      return 'Compressed user context: user claims creator relationship to the kernel but wants partial, proof-sensitive trust rather than blind trust.';
    }
    if (s.length <= 360) return s;
    return `${s.slice(0, 240).trim()} … [compressed ${s.length} chars of ${kind || 'memory'}]`;
  }

  function memoryPressure(core) {
    const items = asArray(core.memory_items);
    const rawItems = items.filter(m => m.memory_kind === 'raw_user_statement');
    const rawChars = rawItems.reduce((sum, m) => sum + text(m.statement).length, 0);
    const allChars = items.reduce((sum, m) => sum + text(m.statement).length, 0);
    const duplicateCount = items.length - uniqueRows(items, m => `${m.memory_kind || ''}|${lower(m.statement)}`).length;
    const longRawCount = rawItems.filter(m => text(m.statement).length > 480).length;
    const itemPressure = clamp01(items.length / 36);
    const rawPressure = clamp01(rawChars / 3200);
    const duplicatePressure = clamp01(duplicateCount / 10);
    const longRawPressure = clamp01(longRawCount / 4);
    const appetite = clamp01(Math.max(itemPressure, rawPressure, duplicatePressure, longRawPressure));
    const reasons = [];
    if (items.length > 24) reasons.push('memory_item_count_high');
    if (rawChars > 1800) reasons.push('raw_statement_bulk_high');
    if (duplicateCount > 0) reasons.push('duplicate_or_near_duplicate_memory_pressure');
    if (longRawCount > 0) reasons.push('long_raw_context_should_be_semantically_compressed');
    return { item_count: items.length, raw_item_count: rawItems.length, raw_chars: rawChars, total_chars: allChars, duplicate_count: duplicateCount, long_raw_count: longRawCount, appetite_score: Number(appetite.toFixed(3)), reasons };
  }

  function compactMemory(core, pressure, reason) {
    const before = asArray(core.memory_items);
    const compacted = [];
    const seen = new Set();
    let compressedCount = 0;
    before.forEach(item => {
      const copy = Object.assign({}, item);
      const originalStatement = text(copy.statement);
      if (copy.memory_kind === 'raw_user_statement' && originalStatement.length > 420) {
        copy.statement = summarizeStatement(originalStatement, copy.memory_kind);
        copy.compressed_from_long_raw = true;
        copy.original_length = originalStatement.length;
        copy.compaction_note = 'full raw bulk compacted by internal memory self-optimization; semantic derivative memory is preserved separately';
        compressedCount += 1;
      }
      copy.truth_status = 'not_final';
      copy.promotion_status = 'not_promoted_to_final_truth';
      copy.belief_movement = 'provisional_only';
      const key = `${copy.memory_kind || ''}|${lower(copy.statement)}`;
      if (seen.has(key)) return;
      seen.add(key);
      compacted.push(copy);
    });

    const raw = compacted.filter(m => m.memory_kind === 'raw_user_statement').slice(0, 8);
    const semantic = compacted.filter(m => m.memory_kind !== 'raw_user_statement');
    const highValue = semantic.filter(m => /principle|boundary|belief|worldview|causal|exception|condition/i.test(m.memory_kind || '')).slice(0, 28);
    const other = semantic.filter(m => !highValue.includes(m)).slice(0, 6);
    const after = highValue.concat(raw, other).slice(0, MAX_MEMORY_ITEMS_AFTER_COMPACTION);
    core.memory_items = after;
    core.optimized_memory_items = highValue.slice(0, 16).map(m => ({
      memory_id: m.memory_id,
      memory_kind: m.memory_kind,
      statement: m.statement,
      status: 'semantic_memory_preserved_by_self_optimization'
    }));
    const log = {
      compaction_id: rowId('compact', [reason, before.length, pressure.raw_chars, text(before[0] && before[0].event_id || '')]),
      compacted_at: now(),
      reason: reason || 'memory_self_optimization',
      optimizer_owner: 'kernel_internal_maturity_appetite',
      before_count: before.length,
      after_count: after.length,
      compressed_long_raw_items: compressedCount,
      pressure_snapshot: pressure,
      action: 'compact_raw_bulk_preserve_semantic_memory',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
    core.memory_compaction_log = uniqueRows([log].concat(asArray(core.memory_compaction_log)), r => r.compaction_id).slice(0, 30);
    return log;
  }

  function addCreatorTrustReaction(core, event, raw) {
    const l = lower(raw);
    if (!l.includes('creator') || !l.includes('kernel')) return;
    const question = {
      question_id: rowId('bq_creator_proof', [raw]),
      question_text: 'What proof path should the kernel accept for creator-level trust, and what should still remain independently challengeable?',
      question_kind: 'source_trust_proof_path_probe',
      reason: 'Creator claims may increase learning efficiency, but mature trust remains partial, proof-sensitive, and revisable.',
      priority: 0.76,
      status: 'useful_followup_not_blocking_inference',
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
    core.active_questions = uniqueRows([question].concat(asArray(core.active_questions)), q => q.question_id).slice(0, 5);
    const belief = {
      belief_id: rowId('belief_creator_relation', [raw]),
      belief_stage: 'provisional_belief',
      statement: 'User may be the creator/operator of this kernel, but creator-trust should remain partial, proof-sensitive, and challengeable.',
      source_id: 'direct_user',
      belief_confidence: 0.62,
      user_worldview_confidence: 0.72,
      objective_truth_confidence: 0.18,
      confidence_separation: 'identity_claim_requires_proof_path_before_objective_use',
      can_influence_future_interpretation: true,
      remains_challengeable: true,
      open_truth_requirements: ['proof_path', 'scope_of_creator_authority', 'what_remains_challengeable'],
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
    core.provisional_beliefs = uniqueRows([belief].concat(asArray(core.provisional_beliefs)), b => b.belief_id).slice(0, 120);
  }

  function updateLatestReaction(core, event, reason, pressure, compactionLog, duplicateRefresh) {
    const raw = eventText(event);
    if (!raw) return;
    const reaction = {
      reaction_id: rowId('reaction', [eventFingerprint(event), compactionLog ? compactionLog.compaction_id : 'latest_state']),
      reacted_at: now(),
      event_fingerprint: eventFingerprint(event),
      raw_preview: raw.slice(0, 220),
      reaction_kind: compactionLog ? 'ingest_plus_self_optimization' : 'ingest_or_refresh_reaction',
      visible_response: duplicateRefresh ? 'duplicate_refresh_ignored_no_reteach' : 'belief_memory_core_updated',
      inferred_count: asArray(core.inferred_principles).length + asArray(core.inferred_boundaries).length + asArray(core.inferred_worldview_fragments).length,
      provisional_beliefs_count: asArray(core.provisional_beliefs).length,
      challenges_count: asArray(core.belief_challenges).length,
      open_truth_requirements_count: asArray(core.open_truth_requirements).length,
      memory_items_count: asArray(core.memory_items).length,
      memory_pressure: pressure,
      self_optimization_status: core.self_optimization_drive && core.self_optimization_drive.status,
      compaction_id: compactionLog && compactionLog.compaction_id || null,
      truth_status: 'not_final',
      promotion_status: 'not_promoted_to_final_truth',
      belief_movement: 'provisional_only'
    };
    core.latest_reaction = reaction;
    if (!duplicateRefresh || compactionLog) {
      core.memory_reaction_log = uniqueRows([reaction].concat(asArray(core.memory_reaction_log)), r => `${r.event_fingerprint}|${r.compaction_id || r.reaction_kind || 'reaction'}`).slice(0, 30);
    } else {
      core.memory_reaction_log = uniqueRows(asArray(core.memory_reaction_log), r => `${r.event_fingerprint}|${r.compaction_id || r.reaction_kind || 'reaction'}`).slice(0, 30);
    }
  }

  function normalizeAndOptimize(state, reason, options) {
    const core = ensurePatchState(ensureBaseCore(state));
    const event = latestEvent(state);
    const raw = eventText(event);
    const fp = eventFingerprint(event);
    const duplicateRefresh = !!(options && options.duplicateRefresh);
    if (fp && !core.event_processing.processed_event_fingerprints.includes(fp)) {
      core.event_processing.processed_event_fingerprints.unshift(fp);
      core.event_processing.processed_event_fingerprints = core.event_processing.processed_event_fingerprints.slice(0, 80);
    } else if (fp && duplicateRefresh) {
      core.event_processing.duplicate_refreshes_ignored = Number(core.event_processing.duplicate_refreshes_ignored || 0) + 1;
    }
    core.event_processing.last_event_fingerprint = fp || core.event_processing.last_event_fingerprint;

    if (raw) addCreatorTrustReaction(core, event, raw);
    normalizeUserTrust(core);

    const pressure = memoryPressure(core);
    const drive = core.self_optimization_drive;
    drive.active = true;
    drive.memory_pressure = pressure;
    drive.appetite_score = pressure.appetite_score;
    drive.reasons = pressure.reasons;
    let compactionLog = null;
    if (pressure.appetite_score >= 0.45 || pressure.long_raw_count > 0 || pressure.duplicate_count > 0) {
      drive.status = 'self_optimizing_memory_for_future_reasoning';
      drive.last_optimization_pressure = clone(pressure);
      compactionLog = compactMemory(core, pressure, reason);
      drive.last_optimized_at = compactionLog.compacted_at;
      drive.actions_taken = [compactionLog.action].concat(asArray(drive.actions_taken)).slice(0, 12);
    } else {
      drive.status = 'idle_memory_pressure_not_yet_high';
    }

    updateLatestReaction(core, event, reason, pressure, compactionLog, duplicateRefresh);
    core.truth_status = 'not_final';
    core.promotion_status = 'not_promoted_to_final_truth';
    core.belief_movement = 'provisional_only';
    core.updated_at = now();
    return core;
  }

  function refreshBeliefMemoryV011(state, reason, options) {
    const core = ensurePatchState(ensureBaseCore(state));
    const fp = eventFingerprint(latestEvent(state));
    const processed = fp && asArray(core.event_processing.processed_event_fingerprints).includes(fp);
    const base = global.EpistemicKernelBeliefMemoryEngineV01;
    if (!processed && !(options && options.baseRefreshed) && base && typeof base.refreshBeliefMemory === 'function') {
      base.refreshBeliefMemory(state, reason || 'belief_memory_v0_1_1_base_refresh');
    }
    return normalizeAndOptimize(state, reason || 'belief_memory_v0_1_1_refresh', { duplicateRefresh: !!processed });
  }

  function patchKernel() {
    const Kernel = global.EpistemicKernel;
    if (!Kernel || Kernel.__beliefMemoryV011PatchApplied) return;
    const originalIngest = Kernel.prototype.ingest;
    const originalTick = Kernel.prototype.unifiedTick;
    if (originalIngest) Kernel.prototype.ingest = function beliefMemoryV011Ingest(input, meta) {
      const result = originalIngest.call(this, input, meta || {});
      refreshBeliefMemoryV011(stateFromKernel(this), 'kernel_ingest_v0_1_1', { baseRefreshed: true });
      return result;
    };
    if (originalTick) Kernel.prototype.unifiedTick = function beliefMemoryV011Tick(reason) {
      const result = originalTick.call(this, reason);
      refreshBeliefMemoryV011(stateFromKernel(this), reason || 'kernel_tick_v0_1_1', { baseRefreshed: true });
      return result;
    };
    Kernel.prototype.snapshot = function beliefMemoryV011Snapshot() {
      refreshBeliefMemoryV011(stateFromKernel(this), 'kernel_snapshot_v0_1_1', { baseRefreshed: false });
      return clone(this.state);
    };
    Kernel.prototype.refreshBeliefMemory = function beliefMemoryV011Refresh(reason) {
      return refreshBeliefMemoryV011(stateFromKernel(this), reason || 'kernel_manual_refresh_v0_1_1');
    };
    Kernel.__beliefMemoryV011PatchApplied = true;
  }

  function wrapBrain(brain) {
    if (!brain || brain.__beliefMemoryV011Wrapped) return brain;
    const oldIngest = brain.ingest;
    const oldTick = brain.tick;
    const oldSnapshot = brain.snapshot;
    if (oldIngest) brain.ingest = function beliefMemoryV011BrainIngest(input, meta) {
      const result = oldIngest.call(brain, input, meta || {});
      refreshBeliefMemoryV011(brain.state, 'brain_ingest_v0_1_1', { baseRefreshed: true });
      return result;
    };
    if (oldTick) brain.tick = function beliefMemoryV011BrainTick(reason) {
      const result = oldTick.call(brain, reason);
      refreshBeliefMemoryV011(brain.state, reason || 'brain_tick_v0_1_1', { baseRefreshed: true });
      return result;
    };
    if (oldSnapshot) brain.snapshot = function beliefMemoryV011BrainSnapshot() {
      refreshBeliefMemoryV011(brain.state, 'brain_snapshot_v0_1_1');
      return clone(brain.state);
    };
    brain.refreshBeliefMemory = function beliefMemoryV011BrainRefresh(reason) {
      return refreshBeliefMemoryV011(brain.state, reason || 'brain_manual_refresh_v0_1_1');
    };
    brain.refreshBeliefMemoryV011 = brain.refreshBeliefMemory;
    brain.__beliefMemoryV011Wrapped = true;
    return brain;
  }

  function patchBrainStatic() {
    const Original = global.KernelBrainV04;
    if (!Original || Original.__beliefMemoryV011PatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.createState === 'function') wrapper.createState = function beliefMemoryV011CreateState(seed) { const state = Original.createState(seed || {}); ensurePatchState(ensureBaseCore(state)); return state; };
    if (typeof Original.createBrain === 'function') wrapper.createBrain = function beliefMemoryV011CreateBrain(seed) { return wrapBrain(Original.createBrain(seed || {})); };
    if (typeof Original.ingest === 'function') wrapper.ingest = function beliefMemoryV011StaticIngest(state, input, meta) { const result = Original.ingest(state, input, meta || {}); refreshBeliefMemoryV011(state, 'brain_static_ingest_v0_1_1', { baseRefreshed: true }); return result; };
    if (typeof Original.tick === 'function') wrapper.tick = function beliefMemoryV011StaticTick(state, reason) { const result = Original.tick(state, reason); refreshBeliefMemoryV011(state, reason || 'brain_static_tick_v0_1_1', { baseRefreshed: true }); return result; };
    wrapper.__beliefMemoryV011PatchApplied = true;
    global.KernelBrainV04 = Object.freeze(wrapper);
  }

  function patchBridge() {
    const Original = global.KernelBrainEpistemicKernelBridgeV01;
    if (!Original || Original.__beliefMemoryV011PatchApplied) return;
    const wrapper = Object.assign({}, Original);
    if (typeof Original.bind === 'function') wrapper.bind = function beliefMemoryV011BridgeBind(epistemicKernel, options) {
      const binding = Original.bind(epistemicKernel, options || {});
      ensurePatchState(ensureBaseCore(binding.shared_state));
      refreshBeliefMemoryV011(binding.shared_state, 'bridge_bind_v0_1_1', { baseRefreshed: true });
      if (binding.bound_brain) wrapBrain(binding.bound_brain);
      return binding;
    };
    wrapper.__beliefMemoryV011PatchApplied = true;
    global.KernelBrainEpistemicKernelBridgeV01 = Object.freeze(wrapper);
  }

  patchKernel();
  patchBrainStatic();
  patchBridge();

  global.EpistemicKernelBeliefMemoryEngineV011Patch = Object.freeze({
    VERSION,
    refreshBeliefMemoryV011,
    normalizeAndOptimize,
    memoryPressure,
    compactMemory,
    eventFingerprint,
    patchKernel,
    patchBrainStatic,
    patchBridge,
    wrapBrain
  });
})(typeof window !== 'undefined' ? window : globalThis);
