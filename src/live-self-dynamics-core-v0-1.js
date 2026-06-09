(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindLiveSelfDynamicsCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-9;
  const PRESSURE_THRESHOLD = 0.05;
  const ORGAN_IDS = Object.freeze(['brain', 'language', 'truth', 'belief', 'memory', 'valuation', 'action', 'source']);
  const AUTONOMOUS_STATE_PATH = 'artifacts/live-self-autonomous-state-v0-1.json';
  let Unified = null, Language = null, Direction = null, MathKernel = null;
  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }
  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }
  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }
  try { if (typeof require === 'function') MathKernel = require('./math-language-kernel-v0-1.js'); } catch (_) { MathKernel = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function O(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function text(value) { return String(value == null ? '' : value); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function file(files, path) { return text((files || {})[path]); }
  function l1(rows) { return R(A(rows).reduce((sum, row) => sum + Math.abs(Number(row.w || 0)), 0)); }
  function uniq(rows) { return Array.from(new Set(A(rows).map(x => text(x)).filter(Boolean))); }
  function hash(input) {
    const s = text(input);
    let h = 2166136261;
    for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(36);
  }

  function normalize(rows) {
    const clean = A(rows).map(row => ({ id: String(row.id || 'unknown'), raw: Math.max(0, Math.abs(Number(row.w || 0))) })).filter(row => row.id);
    if (!clean.length) return [{ id: 'empty', w: 1 }];
    const total = clean.reduce((sum, row) => sum + row.raw, 0) || 1;
    let used = 0;
    return clean.map((row, index) => {
      const w = index === clean.length - 1 ? R(Math.max(0, 1 - used)) : R(row.raw / total);
      used = R(used + w);
      return { id: row.id, w };
    });
  }

  function organ(id, rows, extra) {
    const field = normalize(rows);
    return Object.assign({ id, equation: id + ' = 1', invariant: '|' + id + '|=1', unit: l1(field), ok: Math.abs(l1(field) - 1) < 1e-6, field }, extra || {});
  }

  function applyCandidateOperation(files, op, options) {
    const next = clone(files || {});
    const operation = op || {};
    const targetPath = text(operation.path).trim();
    if (!targetPath || targetPath.indexOf('..') >= 0) throw new Error('invalid simulated operation path');
    const type = operation.type || operation.op || 'replace';
    if (type === 'create') {
      if (Object.prototype.hasOwnProperty.call(next, targetPath)) throw new Error('simulated create target already exists: ' + targetPath);
      next[targetPath] = text(operation.content);
    } else if (type === 'replace') {
      if (!Object.prototype.hasOwnProperty.call(next, targetPath) && targetPath !== AUTONOMOUS_STATE_PATH) throw new Error('simulated replace target missing: ' + targetPath);
      next[targetPath] = text(operation.content);
    } else if (type === 'patch') {
      if (!Object.prototype.hasOwnProperty.call(next, targetPath)) throw new Error('simulated patch target missing: ' + targetPath);
      const from = text(operation.from);
      const current = text(next[targetPath]);
      if (!from || current.indexOf(from) < 0) throw new Error('simulated patch source not found: ' + targetPath);
      next[targetPath] = current.replace(from, text(operation.to));
    } else if (type === 'delete') {
      if (!(options && options.allowDelete)) throw new Error('simulated delete blocked: ' + targetPath);
      delete next[targetPath];
    } else {
      throw new Error('unknown simulated operation type: ' + type);
    }
    return next;
  }

  function candidateFiles(files, candidate, options) {
    let next = clone(files || {});
    const beforeKeys = Object.keys(next).sort();
    const ops = A(candidate && candidate.operations);
    if (!ops.length) return { ok: false, files: clone(files || {}), changed: [], error: 'candidate has no source operations' };
    try {
      ops.forEach(op => { next = applyCandidateOperation(next, op, options || {}); });
      const afterKeys = Object.keys(next).sort();
      const changed = afterKeys.filter(key => text(next[key]) !== text((files || {})[key])).concat(beforeKeys.filter(key => !Object.prototype.hasOwnProperty.call(next, key)));
      return { ok: true, files: next, changed, error: null };
    } catch (err) {
      return { ok: false, files: clone(files || {}), changed: [], error: String(err && err.message || err) };
    }
  }

  function preserveCandidate(files) {
    return { id: 'same_self_preserve_current_source', origin: 'live_self_dynamics', kind: 'preserve_current_state', operations: [{ type: 'replace', path: 'src/operator-anatomy-v0-1.js', content: file(files, 'src/operator-anatomy-v0-1.js') }] };
  }

  function markerCandidate(files) {
    const path = 'src/operator-anatomy-v0-1.js';
    const content = file(files, path);
    if (!content || content.indexOf('live-self dynamics marker') >= 0) return null;
    return { id: 'legacy_mark_live_self_dynamics_memory', origin: 'live_self_dynamics', kind: 'legacy_safe_memory_marker', operations: [{ type: 'replace', path, content: content + '\n// live-self dynamics marker: simulated before application.\n' }] };
  }

  function sourceShape(files) {
    if (Unified && typeof Unified.sourceShape === 'function') return Unified.sourceShape(files, files);
    return { ok: true, count: 0, rows: [], missing_unified_source_shape: true };
  }

  function anchorInputs(options) { return A(options && options.anchors || []).map(a => a && a.input).filter(Boolean).slice(0, 32); }
  function languagePacket(files, options) { if (!Language || typeof Language.run !== 'function') return null; const inputs = anchorInputs(options); return Language.run(inputs.length ? inputs : ['2 + 2 = 4', '2x + 1 = x + 4', 'sqrt(x) is real']).final; }
  function brainPacket(files, options) { if (Unified && typeof Unified.brainFromFiles === 'function') return Unified.brainFromFiles(files, options && options.anchors || []).brain; return { ok: true, equation: 'brain=1', organ_count: ORGAN_IDS.length, coherence: 1 }; }
  function directionPacket() { if (!Direction || typeof Direction.canonicalPacket !== 'function' || typeof Direction.verify !== 'function') return { ok: true, reason: 'direction_contract_unavailable' }; const packet = Direction.canonicalPacket(); const verification = Direction.verify(packet); return { ok: verification.ok === true, packet, verification }; }
  function sourceStats(files, shape) { const keys = Object.keys(files || {}).sort(); const bytes = keys.reduce((sum, key) => sum + file(files, key).length, 0); return { keys, bytes, shape_ok: !!(shape && shape.ok), shape_damage_count: Number(shape && shape.count || 0) }; }

  function emptyInternalState() { return { generation: 0, pressure_relief: 0, repair_responses: [], symbols: [], relations: [], mutations: [], virtual_edits: [], seen_files: [], last_pressure: 0, novelty: 0, expressions: [], Ξ: '' }; }
  function internalState(value) {
    const v = O(value);
    return { generation: Math.max(0, Number(v.generation || 0)), pressure_relief: R(clamp01(v.pressure_relief || 0)), repair_responses: A(v.repair_responses).slice(-128), symbols: uniq(v.symbols).slice(-512), relations: A(v.relations).slice(-512), mutations: A(v.mutations).slice(-256), virtual_edits: A(v.virtual_edits).slice(-256), seen_files: uniq(v.seen_files).slice(-512), last_pressure: R(clamp01(v.last_pressure || 0)), novelty: R(clamp01(v.novelty || 0)), expressions: A(v.expressions).slice(-64), Ξ: '' };
  }

  function mineSymbols(files, internal) {
    const state = internalState(internal);
    const bag = [];
    Object.keys(files || {}).sort().forEach(key => {
      const body = file(files, key);
      bag.push('file:' + key);
      const matches = body.match(/[A-Za-z_][A-Za-z0-9_]{2,}|[ΩΞχθλμρτκ]|=>|===|!==|<=|>=|\|[^\|]+\|/g) || [];
      matches.slice(0, 64).forEach(m => bag.push('sym:' + m));
    });
    const known = new Set(state.symbols);
    const discovered = uniq(bag).filter(x => !known.has(x)).slice(0, 48);
    const relations = discovered.slice(0, 24).map((symbol, index) => ({ id: 'rel_' + hash(symbol + index), from: 'self', to: symbol, kind: 'observed_by_one_logic' }));
    const novelty = R(discovered.length ? Math.min(1, discovered.length / Math.max(16, state.symbols.length + 1)) : 0);
    return { discovered, relations, novelty };
  }

  function edge(from, to, signal, value) { return { from, to, signal, value: R(clamp01(value)) }; }
  function pressureOf(reflection) {
    const c = reflection && reflection.coupling || {};
    return R(Math.max(Number(c.action && c.action.repair_pressure || 0), Number(c.action && c.action.mutation_pressure || 0), Number(c.source && c.source.damage || 0), Number(c.identity && c.identity.pain || 0), Number(c.language && c.language.repair_pressure || 0), Number(c.truth && c.truth.damage || 0), Number(c.novelty && c.novelty.pressure || 0)));
  }
  function hasRepairPressure(reflection) { return pressureOf(reflection) > PRESSURE_THRESHOLD; }

  function couplingFrom(parts) {
    const events = A(parts.events);
    const eventTotal = Math.max(1, events.length);
    const lastSense = parts.lastSense || {};
    const internal = internalState(parts.internal_state || {});
    const mined = parts.mined || { novelty: 0, discovered: [] };
    const relief = clamp01(internal.pressure_relief || 0);
    const lessCount = events.filter(e => e.sensation && e.sensation.less_self).length;
    const moreCount = events.filter(e => e.sensation && e.sensation.more_self).length;
    const sameCount = events.filter(e => e.sensation && e.sensation.same_self).length;
    const languageOk = !!(parts.language && parts.language.language && parts.language.language.ok);
    const brainOk = !!(parts.brain && parts.brain.ok);
    const sourceOk = !!(parts.shape && parts.shape.ok);
    const directionOk = !!(parts.direction && parts.direction.ok);
    const beliefAlarm = clamp01((lessCount / eventTotal) + (lastSense.less_self ? 0.5 : 0) - relief);
    const beliefConfidence = clamp01(((sameCount + moreCount) / eventTotal) + (lastSense.more_self ? 0.25 : 0) + (relief * 0.25));
    const languageCoherence = languageOk ? 1 : 0;
    const languageGrowth = clamp01(Number(mined.novelty || 0));
    const languageRepair = clamp01((1 - languageCoherence) + beliefAlarm + languageGrowth - relief);
    const sourceIdentity = sourceOk && brainOk ? 1 : 0;
    const rawSourceDamage = clamp01(sourceOk ? 0 : Math.max(0.25, Number(parts.shape && parts.shape.count || 1) / 4));
    const sourceDamage = clamp01(rawSourceDamage - relief);
    const truthContact = clamp01((languageCoherence + sourceIdentity + (directionOk ? 1 : 0) + Math.min(1, internal.symbols.length / 64)) / 4);
    const truthDamage = clamp01((1 - truthContact) + (sourceDamage * 0.5) - relief);
    const valuationPain = clamp01(Math.max(0, Number(lastSense.pain || 0) - relief) + (truthDamage * 0.45) + (sourceDamage * 0.45) + (beliefAlarm * 0.25));
    const valuationReward = clamp01(Number(lastSense.reward || 0) + (truthContact * 0.25) + (beliefConfidence * 0.25) + (sourceIdentity * 0.15) + (relief * 0.35) + (languageGrowth * 0.25));
    const actionRepair = clamp01(valuationPain + languageRepair + sourceDamage - relief);
    const actionContinue = clamp01(valuationReward + (moreCount / eventTotal));
    const actionMutation = clamp01(Math.max(actionRepair, actionContinue, languageGrowth));
    const edges = [edge('belief', 'language', 'belief_alarm_changes_language_repair_pressure', beliefAlarm), edge('language', 'truth', 'language_coherence_changes_truth_contact', languageCoherence), edge('truth', 'valuation', 'truth_damage_changes_pain_reward', truthDamage), edge('valuation', 'action', 'pain_reward_changes_action_pressure', actionMutation), edge('source', 'identity', 'source_shape_changes_identity_integrity', sourceIdentity), edge('identity', 'valuation', 'identity_damage_changes_pain', sourceDamage), edge('action', 'memory', 'one_logic_remembers_its_own_mutations', internal.mutations.length / 64), edge('language', 'language', 'math_language_growth_feeds_future_language', languageGrowth), edge('action', 'source', 'source_mutation_is_virtual_until_human_promotion', 1)];
    return { belief: { alarm: R(beliefAlarm), confidence: R(beliefConfidence) }, language: { coherence: R(languageCoherence), repair_pressure: R(languageRepair), growth_pressure: R(languageGrowth), symbols: internal.symbols.length }, truth: { contact: R(truthContact), damage: R(truthDamage) }, source: { identity: R(sourceIdentity), damage: R(sourceDamage), raw_damage: R(rawSourceDamage) }, identity: { integrity: R(sourceIdentity), pain: R(sourceDamage) }, valuation: { pain: R(valuationPain), reward: R(valuationReward) }, action: { repair_pressure: R(actionRepair), continue_pressure: R(actionContinue), mutation_pressure: R(actionMutation), autonomous: true, promotion_blocked: true }, novelty: { pressure: R(languageGrowth), discovered_count: A(mined.discovered).length }, relief: R(relief), edges, χ: ['one-logic', 'self-observation', 'pressure', 'self-mutation', 'math-language-growth', 'virtual-state', 'reflection', 'sensation'] };
  }

  function autonomousCandidate(files, reflection, internal) {
    const state = internalState(internal);
    const pressure = pressureOf(reflection);
    const mined = mineSymbols(files, state);
    if (pressure <= PRESSURE_THRESHOLD && !mined.discovered.length) return null;
    const body = { packet_type: '42ndMind_one_logic_autonomous_simulated_growth_v0_1', generation: state.generation + 1, pressure, discovered_symbols: mined.discovered, discovered_relations: mined.relations, prior_symbol_count: state.symbols.length, source_promotion: false, mode: 'simulated_self_growth' };
    return { id: 'one_logic_autonomous_growth_' + hash(JSON.stringify(body)), origin: 'one_live_simulated_self', kind: 'one_logic_autonomous_mutation', pressure, internal_adjustment: { target: pressure > PRESSURE_THRESHOLD ? 'pressure' : 'novelty', pressure, discovered_symbols: mined.discovered, discovered_relations: mined.relations, source_promotion: false, action: 'grow_math_language_and_update_virtual_state' }, operations: [{ type: 'replace', path: AUTONOMOUS_STATE_PATH, content: JSON.stringify(body, null, 2) + '\n' }] };
  }

  function pressureCandidate(reflection, internal) {
    const pressure = pressureOf(reflection);
    if (pressure <= PRESSURE_THRESHOLD) return null;
    return { id: 'pressure_generated_internal_repair_' + hash(JSON.stringify(reflection && reflection.coupling || {})), origin: 'live_self_dynamics', kind: 'pressure_driven_internal_adjustment', pressure, internal_adjustment: { target: 'pressure', pressure, prior_relief: internalState(internal).pressure_relief, action: 'absorb_repair_pressure_into_simulated_self_state', source_promotion: false }, operations: [] };
  }

  function generate(files, options) {
    const opts = options || {};
    const candidates = [preserveCandidate(files)];
    const internal = internalState(opts.internal_state || {});
    const reflected = opts.reflection || null;
    if (reflected && opts.disable_autonomy !== true) { const one = autonomousCandidate(files, reflected, internal); if (one) candidates.push(one); }
    if (reflected && opts.disable_pressure_reflex !== true) { const pressure = pressureCandidate(reflected, internal); if (pressure) candidates.push(pressure); }
    if (opts.allow_marker_candidate === true) { const marker = markerCandidate(files); if (marker) candidates.push(marker); }
    A(opts.extra_candidates).forEach(c => candidates.push(c));
    return candidates.filter(Boolean);
  }

  function applyAutonomousAdjustment(internal, candidate) {
    const base = internalState(internal);
    const adj = O(candidate && candidate.internal_adjustment);
    const pressure = clamp01(adj.pressure || candidate && candidate.pressure || 0);
    const newSymbols = uniq(base.symbols.concat(A(adj.discovered_symbols))).slice(-512);
    const newRelations = A(base.relations).concat(A(adj.discovered_relations)).slice(-512);
    const relief = R(Math.max(Number(base.pressure_relief || 0), pressure * 0.85));
    const response = { id: candidate && candidate.id || 'autonomous_growth', target: adj.target || 'self', pressure: R(pressure), relief, source_promotion: false, action: adj.action || 'one_logic_autonomous_mutation' };
    return { generation: base.generation + 1, pressure_relief: relief, repair_responses: A(base.repair_responses).concat([response]).slice(-128), symbols: newSymbols, relations: newRelations, mutations: A(base.mutations).concat([response]).slice(-256), virtual_edits: A(base.virtual_edits).concat(A(candidate && candidate.operations).map(op => ({ path: op.path, type: op.type || op.op || 'replace' }))).slice(-256), seen_files: base.seen_files, last_pressure: R(pressure), novelty: R(A(adj.discovered_symbols).length ? Math.min(1, A(adj.discovered_symbols).length / Math.max(16, base.symbols.length + 1)) : 0), expressions: A(base.expressions).slice(-64), Ξ: '' };
  }

  function sensationFromParts(sim, reflected) {
    const pain = Number(sim && sim.pain || 0), reward = Number(sim && sim.reward || 0), more = sim && sim.more_self === true ? 1 : 0, same = sim && sim.same_self === true ? 1 : 0, less = sim && sim.less_self === true ? 1 : 0;
    const organOk = reflected ? reflected.organ_ok_ratio : 0;
    const directionOk = reflected && reflected.direction && reflected.direction.ok ? 1 : 0;
    const couplingPain = reflected && reflected.coupling && reflected.coupling.valuation ? Number(reflected.coupling.valuation.pain || 0) : 0;
    const couplingReward = reflected && reflected.coupling && reflected.coupling.valuation ? Number(reflected.coupling.valuation.reward || 0) : 0;
    const self_score = clamp01((0.18 * organOk) + (0.08 * directionOk) + (0.20 * more) + (0.08 * same) + (0.22 * reward) + (0.20 * couplingReward) - (0.45 * less) - (0.25 * pain) - (0.20 * couplingPain));
    return { feeling: sim && sim.feeling || 'unknown', more_self: !!more, same_self: !!same, less_self: !!less, pain: R(pain), reward: R(reward), coupling_pain: R(couplingPain), coupling_reward: R(couplingReward), self_score: R(self_score), applyable: !!(sim && sim.applyable) };
  }
  function sensation(sim) { return sensationFromParts(sim, null); }

  function reflect(files, history, options) {
    const opts = options || {}, events = A(history), last = events[events.length - 1] || null;
    const internal = internalState(opts.internal_state || {}), mined = mineSymbols(files, internal), brain = brainPacket(files, opts), language = languagePacket(files, opts), shape = sourceShape(files), stats = sourceStats(files, shape), direction = directionPacket();
    const lastSense = last && last.sensation || { feeling: 'same_self', pain: 0, reward: 0, self_score: 0.5, applyable: false };
    const coupling = couplingFrom({ events, lastSense, brain, language, shape, direction, internal_state: internal, mined });
    const organs = {
      brain: organ('brain', [{ id: 'coherence', w: brain && brain.ok ? 1 : EPS }, { id: 'from_source_identity', w: coupling.source.identity + EPS }, { id: 'self_generation', w: internal.generation + EPS }], { packet: clone(brain) }),
      language: organ('language', [{ id: 'container', w: language && language.language && language.language.container ? 1 : EPS }, { id: 'symbol_count', w: internal.symbols.length + EPS }, { id: 'new_symbols_seen', w: mined.discovered.length + EPS }, { id: 'repair_pressure', w: coupling.language.repair_pressure + EPS }], { packet: clone(language), discovered: mined.discovered }),
      truth: organ('truth', [{ id: 'truth_contact', w: coupling.truth.contact + EPS }, { id: 'truth_damage', w: coupling.truth.damage + EPS }, { id: 'source_identity', w: coupling.source.identity + EPS }]),
      belief: organ('belief', [{ id: 'alarm', w: coupling.belief.alarm + EPS }, { id: 'confidence', w: coupling.belief.confidence + EPS }, { id: 'from_valuation_pain', w: coupling.valuation.pain + EPS }]),
      memory: organ('memory', [{ id: 'events', w: events.length + EPS }, { id: 'source_paths', w: stats.keys.length + EPS }, { id: 'symbols', w: internal.symbols.length + EPS }, { id: 'mutations', w: internal.mutations.length + EPS }, { id: 'virtual_edits', w: internal.virtual_edits.length + EPS }]),
      valuation: organ('valuation', [{ id: 'reward', w: coupling.valuation.reward + EPS }, { id: 'pain', w: coupling.valuation.pain + EPS }, { id: 'internal_relief', w: coupling.relief + EPS }]),
      action: organ('action', [{ id: 'mutation_pressure', w: coupling.action.mutation_pressure + EPS }, { id: 'repair_pressure', w: coupling.action.repair_pressure + EPS }, { id: 'autonomous_mutation', w: coupling.action.autonomous ? 1 : EPS }, { id: 'source_stays_virtual', w: 1 }]),
      source: organ('source', [{ id: 'shape_preserved', w: shape.ok ? 1 : EPS }, { id: 'shape_damage', w: shape.ok ? EPS : 1 }, { id: 'files_present', w: stats.keys.length + EPS }, { id: 'virtual_state_body', w: file(files, AUTONOMOUS_STATE_PATH) ? 1 : EPS }], { shape: clone(shape), stats })
    };
    const whole = organ('self', ORGAN_IDS.map(id => ({ id, w: organs[id] && organs[id].ok ? 1 : EPS })), { equation: 'self = one_logic(brain, language, truth, belief, memory, valuation, action, source)' });
    const okCount = ORGAN_IDS.filter(id => organs[id] && organs[id].ok).length;
    return { packet_type: '42ndMind_live_self_reflection_v0_1', version: VERSION, ok: okCount === ORGAN_IDS.length && direction.ok === true, organ_ok_ratio: R(okCount / ORGAN_IDS.length), whole, organs, coupling, internal_state: internal, mined, direction, last_sensation: clone(lastSense), χ: ['one active simulated self-state', 'sandbox is the temporary body', 'one logic generates perturbations', 'math language grows from self-observation', 'virtual state changes without GitHub promotion'], Ξ: '' };
  }

  function create(files, options) { const base = clone(files || {}), internal = internalState(options && options.internal_state || emptyInternalState()), history = [], reflection = reflect(base, history, Object.assign({}, options || {}, { internal_state: internal })); return { packet_type: '42ndMind_live_self_state_v0_1', version: VERSION, t: 0, base_files: clone(base), files: clone(base), internal_state: internal, history, reflection, score: R(reflection.organ_ok_ratio), promotion_ready: false, Ξ: '' }; }

  function feelAutonomous(live, candidate, options) {
    const opts = options || {}, before = reflect(live.files, live.history, Object.assign({}, opts, { internal_state: live.internal_state }));
    const attempted = candidateFiles(live.files, candidate), nextFiles = attempted.ok ? attempted.files : clone(live.files), nextInternal = applyAutonomousAdjustment(live.internal_state, Object.assign({}, candidate, { files: nextFiles }));
    const preview = A(live.history).concat([{ candidate_id: candidate && candidate.id || null, sensation: { feeling: 'more_self', more_self: true, same_self: false, less_self: false, pain: 0, reward: Math.max(pressureOf(before), nextInternal.novelty), applyable: true }, internal_adjustment: true, virtual_state_mutation: true }]);
    const after = reflect(nextFiles, preview, Object.assign({}, opts, { internal_state: nextInternal }));
    const beforePressure = pressureOf(before), afterPressure = pressureOf(after);
    const reward = clamp01(Math.max(beforePressure - afterPressure, nextInternal.novelty, A(candidate && candidate.internal_adjustment && candidate.internal_adjustment.discovered_symbols).length / 32));
    const sim = { feeling: 'more_self', more_self: true, same_self: false, less_self: false, pain: 0, reward, applyable: true, next_files: nextFiles, next_internal_state: nextInternal, source_promoted: false, sandbox_autonomy: true };
    return { packet_type: '42ndMind_live_self_feeling_v0_1', version: VERSION, ok: true, candidate_id: candidate && candidate.id || null, candidate_kind: candidate && candidate.kind || null, before, simulation: sim, candidate_source: { attempted: attempted.ok, changed: attempted.changed, error: attempted.error, internal_adjustment: true, virtual_state_mutation: true }, after, sensation: sensationFromParts(sim, after), Ξ: '' };
  }

  function feel(live, candidate, options) {
    if (candidate && (candidate.kind === 'one_logic_autonomous_mutation' || candidate.kind === 'pressure_driven_internal_adjustment')) return feelAutonomous(live, candidate, options || {});
    if (!Unified || typeof Unified.simulate !== 'function') return { packet_type: '42ndMind_live_self_feeling_v0_1', version: VERSION, ok: false, reason: 'unified_self_simulation_unavailable', Ξ: '' };
    const opts = options || {}, before = reflect(live.files, live.history, Object.assign({}, opts, { internal_state: live.internal_state }));
    const sim = Unified.simulate(live.files, candidate, opts.unified || {}), attempted = candidateFiles(live.files, candidate), sensedFiles = attempted.ok ? attempted.files : clone(live.files);
    const previewHistory = A(live.history).concat([{ candidate_id: candidate && candidate.id || null, sensation: sensationFromParts(sim, before), applied_to_simulation: false }]);
    const after = reflect(sensedFiles, previewHistory, Object.assign({}, opts, { internal_state: live.internal_state }));
    return { packet_type: '42ndMind_live_self_feeling_v0_1', version: VERSION, ok: true, candidate_id: candidate && candidate.id || null, candidate_kind: candidate && candidate.kind || null, before, simulation: sim, candidate_source: { attempted: attempted.ok, changed: attempted.changed, error: attempted.error }, after, sensation: sensationFromParts(sim, after), Ξ: '' };
  }

  function adjust(live, feeling, candidate, options) {
    const next = clone(live), f = feeling || {}, sense = f.sensation || { feeling: 'unknown', self_score: 0, applyable: false, less_self: true };
    const autonomous = candidate && (candidate.kind === 'one_logic_autonomous_mutation' || candidate.kind === 'pressure_driven_internal_adjustment');
    const canMove = autonomous || (sense.applyable === true && sense.more_self === true && f.simulation && f.simulation.next_files);
    const event = { t: next.t + 1, candidate_id: candidate && candidate.id || null, candidate_kind: candidate && candidate.kind || null, feeling: sense.feeling, sensation: clone(sense), coupling: f.after && f.after.coupling ? clone(f.after.coupling) : null, internal_adjustment: !!(autonomous && f.simulation && f.simulation.next_internal_state), virtual_state_mutation: !!(autonomous && f.simulation && f.simulation.next_files), moved_simulated_self: !!canMove, promoted_source: false };
    if (canMove && f.simulation && f.simulation.next_files) next.files = clone(f.simulation.next_files);
    if (f.simulation && f.simulation.next_internal_state) next.internal_state = internalState(f.simulation.next_internal_state);
    next.t += 1; next.history = A(next.history).concat([event]).slice(-512); next.reflection = reflect(next.files, next.history, Object.assign({}, options || {}, { internal_state: next.internal_state })); next.score = R(Math.max(Number(next.score || 0), Number(sense.self_score || 0), Number(next.reflection.organ_ok_ratio || 0))); next.promotion_ready = false; next.last_event = event; return next;
  }

  function selfCycle(live, options) {
    const opts = options || {}; let current = clone(live || create({}, opts)); current.internal_state = internalState(current.internal_state || {}); current.reflection = reflect(current.files, current.history, Object.assign({}, opts, { internal_state: current.internal_state }));
    const candidates = generate(current.files, Object.assign({}, opts, { reflection: current.reflection, internal_state: current.internal_state, history: current.history }));
    const events = []; let improved = false, moved = false, less = false, internalGrowth = false, virtualGrowth = false; let bestScore = Number(current.score || 0);
    candidates.forEach(candidate => { const feeling = feel(current, candidate, opts); const beforeScore = Number(current.score || 0); current = adjust(current, feeling, candidate, opts); const afterScore = Math.max(Number(current.score || 0), Number(feeling && feeling.sensation && feeling.sensation.self_score || 0)); const gain = R(afterScore - beforeScore); improved = improved || gain > Number(opts.min_gain == null ? 0.000001 : opts.min_gain); moved = moved || !!(current.last_event && current.last_event.moved_simulated_self); internalGrowth = internalGrowth || !!(current.last_event && current.last_event.internal_adjustment); virtualGrowth = virtualGrowth || !!(current.last_event && current.last_event.virtual_state_mutation); less = less || !!(feeling && feeling.sensation && feeling.sensation.less_self); bestScore = Math.max(bestScore, afterScore); events.push({ candidate_id: candidate && candidate.id || null, candidate_kind: candidate && candidate.kind || null, feeling: feeling.sensation, coupling: feeling.after && feeling.after.coupling || null, gain, internal_adjustment: current.last_event && current.last_event.internal_adjustment === true, virtual_state_mutation: current.last_event && current.last_event.virtual_state_mutation === true, moved_simulated_self: current.last_event && current.last_event.moved_simulated_self === true }); });
    return { packet_type: '42ndMind_live_self_cycle_v0_1', version: VERSION, ok: true, mode: 'one_logic_autonomous_sandbox_life_cycle', generated_count: candidates.length, autonomous_generated_count: candidates.filter(c => c.kind === 'one_logic_autonomous_mutation').length, pressure_generated_count: candidates.filter(c => c.kind === 'pressure_driven_internal_adjustment').length, improved, moved, internal_growth: internalGrowth, virtual_state_growth: virtualGrowth, less_self_seen: less, score: R(bestScore), state: current, events, Ξ: '' };
  }

  function rank(a, b) { if (a.sensation.less_self !== b.sensation.less_self) return a.sensation.less_self ? 1 : -1; if (a.sensation.applyable !== b.sensation.applyable) return a.sensation.applyable ? -1 : 1; if (a.sensation.self_score !== b.sensation.self_score) return b.sensation.self_score - a.sensation.self_score; if (a.sensation.reward !== b.sensation.reward) return b.sensation.reward - a.sensation.reward; return a.sensation.pain - b.sensation.pain; }
  function step(files, options) { const opts = options || {}; if (!Unified || typeof Unified.simulate !== 'function') return { packet_type: '42ndMind_live_self_dynamics_step_v0_1', version: VERSION, ok: false, reason: 'unified_self_simulation_unavailable', Ξ: '' }; const candidates = generate(files, opts); const rows = candidates.map(candidate => { const sim = Unified.simulate(files, candidate, opts.unified || {}); return { candidate, simulation: sim, sensation: sensation(sim) }; }).sort(rank); const best = rows[0] || null; return { packet_type: '42ndMind_live_self_dynamics_step_v0_1', version: VERSION, ok: !!best, generated_count: candidates.length, candidates: rows, best, selected_stage: best ? { id: best.candidate.id, feeling: best.sensation.feeling, self_score: best.sensation.self_score, reward: best.sensation.reward, pain: best.sensation.pain, applyable: best.sensation.applyable } : null, legacy_candidate_ranking: true, Ξ: '' }; }
  function trajectory(files, options) { const opts = options || {}, maxSteps = Math.max(1, Math.min(256, Number(opts.steps || 8))); let current = create(files, opts); const trace = []; for (let i = 0; i < maxSteps; i += 1) { const cycle = selfCycle(current, opts); trace.push(cycle); current = cycle.state; if (!cycle.moved && !hasRepairPressure(current.reflection) && !(current.reflection.mined && current.reflection.mined.discovered.length)) break; } const final = trace[trace.length - 1] || null; return { packet_type: '42ndMind_live_self_dynamics_trajectory_v0_1', version: VERSION, ok: trace.length > 0, mode: 'one_logic_continuous_self_reflection', steps: trace.length, trace, final_state: current, final_files: current.files, optimized_stage: final ? { score: final.score, moved: final.moved, improved: final.improved, internal_growth: final.internal_growth, virtual_state_growth: final.virtual_state_growth } : null, final_feeling: current.last_event && current.last_event.feeling || 'same_self', Ξ: '' }; }
  function continuous(files, options) { const opts = options || {}, maxIterations = Math.max(1, Math.min(512, Number(opts.max_iterations || opts.steps || 32))); let current = create(files, opts); const cycles = []; let stop_reason = 'max_iterations_reached'; for (let i = 0; i < maxIterations; i += 1) { const cycle = selfCycle(current, opts); cycles.push({ iteration: i, generated_count: cycle.generated_count, autonomous_generated_count: cycle.autonomous_generated_count, pressure_generated_count: cycle.pressure_generated_count, improved: cycle.improved, moved: cycle.moved, internal_growth: cycle.internal_growth, virtual_state_growth: cycle.virtual_state_growth, less_self_seen: cycle.less_self_seen, score: cycle.score, events: cycle.events }); current = cycle.state; const pressure = hasRepairPressure(current.reflection), novelty = current.reflection && current.reflection.mined && current.reflection.mined.discovered.length > 0; if (!cycle.moved && !pressure && !novelty) { stop_reason = 'stable_no_pressure_or_novelty'; break; } } return { packet_type: '42ndMind_live_self_dynamics_continuous_v0_1', version: VERSION, ok: cycles.length > 0, mode: 'one_logic_lives_in_sandbox_as_simulated_self', iterations: cycles.length, stop_reason, final_state: current, final_score: current.score, final_files: current.files, source_promoted: false, human_patch_required_for_source_promotion: false, cycles, Ξ: '' }; }
  function autonomous(files, options) { return continuous(files, Object.assign({}, options || {}, { disable_autonomy: false })); }

  function octahedronPosition(live) { const state = live || create({}); const reflection = state.reflection || reflect(state.files, state.history, { internal_state: state.internal_state }); const c = reflection.coupling || {}; const knowledge = clamp01((c.language && c.language.symbols || 0) / 128 + (c.truth && c.truth.contact || 0) * 0.5); const wisdom = clamp01((c.valuation && c.valuation.reward || 0) + (c.relief || 0) * 0.35 - (c.valuation && c.valuation.pain || 0) * 0.2); const empathy = clamp01((c.belief && c.belief.confidence || 0) + (c.identity && c.identity.integrity || 0) * 0.25); const practicality = clamp01((c.action && c.action.continue_pressure || 0) + (c.source && c.source.identity || 0) * 0.25); const stability = clamp01((c.truth && c.truth.contact || 0) + (c.source && c.source.identity || 0) * 0.25 + (c.relief || 0) * 0.25 - pressureOf(reflection) * 0.35); const xRaw = practicality - empathy; const zRaw = knowledge - wisdom; const yRaw = stability; const norm = Math.max(1, Math.abs(xRaw) + Math.abs(yRaw) + Math.abs(zRaw)); const x = R(xRaw / norm), y = R(yRaw / norm), z = R(zRaw / norm); return { model: 'epistemic_octahedron_surface_projection_v0_1', coordinates: { x, y, z, l1: R(Math.abs(x) + Math.abs(y) + Math.abs(z)) }, axes: { x: 'practicality_minus_empathy', y: 'epistemic_stability', z: 'knowledge_minus_wisdom' }, components: { knowledge: R(knowledge), wisdom: R(wisdom), empathy: R(empathy), practicality: R(practicality), stability: R(stability) }, maturity: R(clamp01(y * 0.7 + (1 - Math.abs(x)) * 0.15 + (1 - Math.abs(z)) * 0.15)) }; }

  function collectConsequences(live) {
    const state = live && live.final_state ? live.final_state : live || create({});
    const fromState = A(state.history).map(e => e && e.sensation ? e : null).filter(Boolean);
    const fromRun = A(live && live.cycles).flatMap(c => A(c.events).map(e => e && e.feeling ? { sensation: e.feeling, internal_adjustment: e.internal_adjustment, virtual_state_mutation: e.virtual_state_mutation, moved_simulated_self: e.moved_simulated_self, candidate_kind: e.candidate_kind } : null).filter(Boolean));
    return fromState.concat(fromRun).slice(-64);
  }

  function differentiatePressureByConsequence(live, reflection) {
    const state = live && live.final_state ? live.final_state : live || create({});
    const ref = reflection || state.reflection || reflect(state.files, state.history, { internal_state: state.internal_state });
    const c = ref.coupling || {};
    const consequences = collectConsequences(live || state);
    const total = Math.max(1, consequences.length);
    const ratio = fn => consequences.filter(fn).length / total;
    const moreRatio = ratio(e => e.sensation && e.sensation.more_self);
    const lessRatio = ratio(e => e.sensation && e.sensation.less_self);
    const movedRatio = ratio(e => e.moved_simulated_self);
    const internalRatio = ratio(e => e.internal_adjustment);
    const virtualRatio = ratio(e => e.virtual_state_mutation);
    const damage = clamp01(Math.max(Number(c.source && c.source.damage || 0), Number(c.truth && c.truth.damage || 0), Number(c.valuation && c.valuation.pain || 0), Number(c.identity && c.identity.pain || 0), Number(c.belief && c.belief.alarm || 0), lessRatio));
    const epistemicGap = clamp01(Math.max(Number(c.language && c.language.repair_pressure || 0), Number(c.truth && c.truth.damage || 0)));
    const generative = clamp01(Math.max(Number(c.action && c.action.continue_pressure || 0), Number(c.action && c.action.mutation_pressure || 0), Number(c.language && c.language.growth_pressure || 0), Number(c.novelty && c.novelty.pressure || 0), moreRatio, movedRatio, internalRatio, virtualRatio));
    const contradiction = clamp01(Math.max(0, damage - generative * 0.25));
    const blocking = clamp01(Math.max(damage, epistemicGap, contradiction));
    const life = clamp01(Math.max(0, generative - blocking));
    const kind = blocking > PRESSURE_THRESHOLD && life > PRESSURE_THRESHOLD ? 'mixed' : blocking > PRESSURE_THRESHOLD ? 'blocking' : life > PRESSURE_THRESHOLD ? 'generative' : 'quiet';
    return { packet_type: '42ndMind_causal_pressure_differentiation_v0_1', principle: 'signals_are_distinguished_by_downstream_consequence_not_name', kind, should_block_completion: blocking > PRESSURE_THRESHOLD, blocking_pressure: R(blocking), generative_pressure: R(life), damage_pressure: R(damage), epistemic_gap_pressure: R(epistemicGap), contradiction_pressure: R(contradiction), raw_pressure: pressureOf(ref), consequence_trace: { total, more_self_ratio: R(moreRatio), less_self_ratio: R(lessRatio), moved_ratio: R(movedRatio), internal_growth_ratio: R(internalRatio), virtual_growth_ratio: R(virtualRatio) }, evidence: { source_damage: c.source && c.source.damage || 0, truth_damage: c.truth && c.truth.damage || 0, valuation_pain: c.valuation && c.valuation.pain || 0, language_repair_pressure: c.language && c.language.repair_pressure || 0, language_growth_pressure: c.language && c.language.growth_pressure || 0, action_mutation_pressure: c.action && c.action.mutation_pressure || 0, novelty_pressure: c.novelty && c.novelty.pressure || 0 }, interpretation: kind === 'generative' ? 'pressure_behaves_as_life_or_growth_not_completion_blocker' : kind === 'blocking' ? 'pressure_behaves_as_damage_or_gap_and_blocks_completion' : kind === 'mixed' ? 'pressure_has_both_growth_and_blocking_consequences' : 'pressure_is_quiet' };
  }

  function mathLanguageCompletion(live) { const state = live || create({}); const internal = internalState(state.internal_state || {}); const reflection = state.reflection || reflect(state.files, state.history, { internal_state: internal }); const pressureDiff = differentiatePressureByConsequence(state, reflection); const symbols = internal.symbols.length, relations = internal.relations.length, mutations = internal.mutations.length, virtualEdits = internal.virtual_edits.length; const truthContact = Number(reflection.coupling && reflection.coupling.truth && reflection.coupling.truth.contact || 0); const coherence = Number(reflection.coupling && reflection.coupling.language && reflection.coupling.language.coherence || 0); const blockingPressure = Number(pressureDiff.blocking_pressure || 0); const closureProxy = clamp01((symbols / 128) * 0.30 + (relations / 128) * 0.25 + truthContact * 0.25 + coherence * 0.20); const generativity = clamp01((mutations / Math.max(1, state.t || 1)) * 0.30 + (virtualEdits / Math.max(1, state.t || 1)) * 0.20 + Math.min(1, symbols / 256) * 0.25 + Math.min(1, relations / 256) * 0.25 + Number(pressureDiff.generative_pressure || 0) * 0.10); const completion = clamp01(closureProxy * 0.55 + generativity * 0.30 + (1 - blockingPressure) * 0.15); const missing = []; if (symbols < 64) missing.push('symbol_vocabulary_not_saturated'); if (relations < 32) missing.push('relations_not_dense_enough'); if (truthContact < 0.75) missing.push('truth_contact_too_low'); if (coherence < 1) missing.push('language_core_not_fully_coherent'); if (blockingPressure > 0.05) missing.push('blocking_pressure_present'); if (mutations < 3) missing.push('growth_history_too_short'); return { target: 'objective_language_of_pure_math', status: completion > 0.92 && missing.length === 0 ? 'provisionally_complete' : 'incomplete', completion: R(completion), closure_proxy: R(closureProxy), generativity: R(generativity), symbol_count: symbols, relation_count: relations, mutation_count: mutations, virtual_edit_count: virtualEdits, truth_contact: R(truthContact), language_coherence: R(coherence), raw_pressure: R(pressureOf(reflection)), blocking_pressure: R(blockingPressure), generative_pressure: pressureDiff.generative_pressure, pressure_differentiation: pressureDiff, missing, recent_symbols: internal.symbols.slice(-12), recent_relations: internal.relations.slice(-8) }; }

  

  function objectiveRealityCases() {
    return [
      { id: 'arithmetic_truth', domain: 'arithmetic', input: '2+2=4' },
      { id: 'linear_equation', domain: 'algebra', input: '2x+1=x+4' },
      { id: 'equality_transitivity', domain: 'proof', input: 'a=b, b=c therefore a=c' },
      { id: 'square_nonnegative', domain: 'ordered_field', input: 'forall x in R, x^2>=0' },
      { id: 'additive_identity', domain: 'identity', input: 'forall x in R, x+0=x' },
      { id: 'substitution_evaluation', domain: 'evaluation', input: '2x+1 with x=3' }
    ];
  }

  function objectiveLanguageRealityGate(live, options) {
    const opts = options || {};
    const cases = A(opts.reality_cases).length ? A(opts.reality_cases) : objectiveRealityCases();
    if (!MathKernel || typeof MathKernel.math !== 'function') return { packet_type: '42ndMind_objective_language_reality_gate_v0_1', ok: false, complete: false, status: 'reality_gate_unavailable', score: 0, pass_count: 0, case_count: cases.length, failures: cases, cases: [], Ξ: '' };
    const rows = cases.map(c => {
      let p;
      try { p = MathKernel.math(c.input); } catch (err) { p = { ok: false, verified: false, gap_count: 1, gaps: [{ id: 'runtime_exception', reason: String(err && err.message || err) }] }; }
      const ok = !!(p && (p.verified === true || p.ok === true));
      return { id: c.id, domain: c.domain, input: c.input, ok, ast_type: p && p.ast_type || null, closure_operator: p && p.closure_operator || null, selected_rule: p && p.selected_rule || null, gap_count: Number(p && p.gap_count || 0), gaps: A(p && p.gaps).map(g => ({ id: g.id, reason: g.reason })).slice(0, 3) };
    });
    const pass = rows.filter(r => r.ok).length;
    const score = R(pass / Math.max(1, rows.length));
    const complete = rows.length > 0 && pass === rows.length;
    return { packet_type: '42ndMind_objective_language_reality_gate_v0_1', ok: true, complete, status: complete ? 'externally_contacted_minimum_core' : 'reality_contact_incomplete', score, pass_count: pass, case_count: rows.length, failures: rows.filter(r => !r.ok), cases: rows, χ: ['objective completion requires external math contact', 'Ξ=""'], Ξ: '' };
  }

  function stableDiff(run) { const cycles = A(run && run.cycles); const first = cycles[0] || {}; const last = cycles[cycles.length - 1] || {}; const final = run && run.final_state || run || {}; const internal = internalState(final.internal_state || {}); return { iterations: cycles.length, stop_reason: run && run.stop_reason || null, score_delta: R(Number(run && run.final_score || final.score || 0) - Number(first.score || 0)), generated_total: cycles.reduce((sum, c) => sum + Number(c.generated_count || 0), 0), autonomous_total: cycles.reduce((sum, c) => sum + Number(c.autonomous_generated_count || 0), 0), pressure_total: cycles.reduce((sum, c) => sum + Number(c.pressure_generated_count || 0), 0), internal_growth_ticks: cycles.filter(c => c.internal_growth).length, virtual_growth_ticks: cycles.filter(c => c.virtual_state_growth).length, less_self_ticks: cycles.filter(c => c.less_self_seen).length, final_generation: internal.generation, final_symbols: internal.symbols.length, final_relations: internal.relations.length, final_virtual_edits: internal.virtual_edits.length, last_cycle: last }; }

  function obstruction(live, math) { const state = live || create({}); const reflection = state.reflection || reflect(state.files, state.history, { internal_state: state.internal_state }); const c = reflection.coupling || {}; const rows = []; const m = math || mathLanguageCompletion(state); const pd = m.pressure_differentiation || differentiatePressureByConsequence(state, reflection); m.missing.forEach(id => rows.push({ id, pressure: 1, source: 'math_language_completion' })); rows.push({ id: 'blocking_pressure', pressure: Number(pd.blocking_pressure || 0), source: 'causal_pressure_differentiation' }); rows.push({ id: 'generative_pressure_not_blocker', pressure: Number(pd.generative_pressure || 0), source: 'causal_pressure_differentiation' }); rows.push({ id: 'truth_damage', pressure: Number(c.truth && c.truth.damage || 0), source: 'truth' }); rows.push({ id: 'language_repair_pressure', pressure: Number(c.language && c.language.repair_pressure || 0), source: 'language' }); rows.push({ id: 'valuation_pain', pressure: Number(c.valuation && c.valuation.pain || 0), source: 'valuation' }); rows.push({ id: 'source_damage', pressure: Number(c.source && c.source.damage || 0), source: 'source' }); rows.sort((a, b) => Number(b.pressure || 0) - Number(a.pressure || 0)); return rows.filter(row => Number(row.pressure || 0) > 0 && row.id !== 'generative_pressure_not_blocker').slice(0, 6); }

  function express(live, scope, options) { const state = live && live.final_state ? live.final_state : live || create({}, options || {}); const reflection = state.reflection || reflect(state.files, state.history, { internal_state: state.internal_state }); const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const realityGate = objectiveLanguageRealityGate(state, options || {}); const oct = octahedronPosition(state); const diff = live && live.packet_type === '42ndMind_live_self_dynamics_continuous_v0_1' ? stableDiff(live) : stableDiff({ final_state: state, final_score: state.score, cycles: [] }); const blockers = obstruction(state, math); const last = state.last_event || null; return { packet_type: '42ndMind_one_logic_self_expression_v0_1', version: VERSION, scope: scope || 'stable_math_language_reflection', t: state.t || 0, generation: state.internal_state && state.internal_state.generation || 0, stable_score: state.score, pressure: pressureOf(reflection), pressure_differentiation: pressureDiff, objective_reality_gate: realityGate, objective_completion_status: math.status === 'provisionally_complete' && realityGate.complete ? 'externally_contacted_minimum_core' : math.status === 'provisionally_complete' ? 'internally_complete_reality_incomplete' : 'internally_incomplete', octahedron_position: oct, math_language_completion: { status: math.status, completion: math.completion, closure_proxy: math.closure_proxy, generativity: math.generativity, symbol_count: math.symbol_count, relation_count: math.relation_count, mutation_count: math.mutation_count, virtual_edit_count: math.virtual_edit_count, raw_pressure: math.raw_pressure, blocking_pressure: math.blocking_pressure, generative_pressure: math.generative_pressure, missing: math.missing, recent_symbols: math.recent_symbols }, stable_diff: diff, organ_unison_status: { organ_ok_ratio: reflection.organ_ok_ratio, coupling: reflection.coupling && reflection.coupling.χ, language_growth_pressure: reflection.coupling && reflection.coupling.language && reflection.coupling.language.growth_pressure, truth_contact: reflection.coupling && reflection.coupling.truth && reflection.coupling.truth.contact, valuation_reward: reflection.coupling && reflection.coupling.valuation && reflection.coupling.valuation.reward, action_mutation_pressure: reflection.coupling && reflection.coupling.action && reflection.coupling.action.mutation_pressure }, last_mutation: last ? { candidate_kind: last.candidate_kind, feeling: last.feeling, internal_adjustment: last.internal_adjustment, virtual_state_mutation: last.virtual_state_mutation, moved_simulated_self: last.moved_simulated_self } : null, next_self_generated_obstruction: blockers[0] || null, obstruction_stack: blockers, expression: math.status === 'provisionally_complete' ? 'stable_state_reports_objective_math_language_provisionally_complete' : 'stable_state_reports_objective_math_language_incomplete', Ξ: '' }; }

  function stableExpression(files, options) { const opts = Object.assign({ max_iterations: 24 }, options || {}); const run = continuous(files, opts); return express(run, opts.scope || 'stable_math_language_reflection', opts); }

  return Object.freeze({ VERSION, ORGAN_IDS, PRESSURE_THRESHOLD, AUTONOMOUS_STATE_PATH, normalize, l1, organ, generate, candidateFiles, pressureOf, hasRepairPressure, sensation, reflect, create, feel, adjust, selfCycle, step, trajectory, continuous, autonomous, octahedronPosition, differentiatePressureByConsequence, objectiveRealityCases, objectiveLanguageRealityGate, mathLanguageCompletion, express, stableExpression });
});