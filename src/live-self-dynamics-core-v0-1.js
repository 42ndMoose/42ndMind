(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindLiveSelfDynamicsCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-9;
  const ORGAN_IDS = Object.freeze(['brain', 'language', 'truth', 'belief', 'memory', 'valuation', 'action', 'source']);
  let Unified = null, Language = null, Direction = null;
  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }
  try { if (typeof require === 'function') Language = require('./language-organ-core-v0-1.js'); } catch (_) { Language = null; }
  try { if (typeof require === 'function') Direction = require('./one-logic-direction-contract-v0-1.js'); } catch (_) { Direction = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function text(value) { return String(value == null ? '' : value); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function file(files, path) { return text((files || {})[path]); }
  function l1(rows) { return R(A(rows).reduce((sum, row) => sum + Math.abs(Number(row.w || 0)), 0)); }

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
    if (!targetPath || targetPath.indexOf('..') >= 0) throw new Error('invalid candidate operation path');
    const type = operation.type || operation.op || 'replace';
    if (type === 'create') {
      if (Object.prototype.hasOwnProperty.call(next, targetPath)) throw new Error('candidate create target already exists: ' + targetPath);
      next[targetPath] = text(operation.content);
    } else if (type === 'replace') {
      if (!Object.prototype.hasOwnProperty.call(next, targetPath)) throw new Error('candidate replace target missing: ' + targetPath);
      next[targetPath] = text(operation.content);
    } else if (type === 'patch') {
      if (!Object.prototype.hasOwnProperty.call(next, targetPath)) throw new Error('candidate patch target missing: ' + targetPath);
      const from = text(operation.from);
      const current = text(next[targetPath]);
      if (!from || current.indexOf(from) < 0) throw new Error('candidate patch source not found: ' + targetPath);
      next[targetPath] = current.replace(from, text(operation.to));
    } else if (type === 'delete') {
      if (!(options && options.allowDelete)) throw new Error('candidate delete blocked: ' + targetPath);
      delete next[targetPath];
    } else {
      throw new Error('unknown candidate operation type: ' + type);
    }
    return next;
  }

  function candidateFiles(files, candidate, options) {
    let next = clone(files || {});
    const beforeKeys = Object.keys(next).sort();
    const ops = A(candidate && candidate.operations);
    if (!ops.length) return { ok: false, files: clone(files || {}), changed: [], error: 'candidate has no operations' };
    try {
      ops.forEach(op => { next = applyCandidateOperation(next, op, options || {}); });
      const afterKeys = Object.keys(next).sort();
      const changed = afterKeys.filter(key => text(next[key]) !== text((files || {})[key]))
        .concat(beforeKeys.filter(key => !Object.prototype.hasOwnProperty.call(next, key)));
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

  function generate(files, options) {
    const opts = options || {};
    const candidates = [];
    candidates.push(preserveCandidate(files));
    if (opts.allow_marker_candidate === true) {
      const marker = markerCandidate(files);
      if (marker) candidates.push(marker);
    }
    A(opts.extra_candidates).forEach(c => candidates.push(c));
    return candidates.filter(Boolean);
  }

  function sourceShape(files) {
    if (Unified && typeof Unified.sourceShape === 'function') return Unified.sourceShape(files, files);
    return { ok: false, count: 1, rows: [], missing_unified_source_shape: true };
  }

  function anchorInputs(options) {
    const anchors = options && options.anchors || [];
    return A(anchors).map(a => a && a.input).filter(Boolean).slice(0, 32);
  }

  function languagePacket(files, options) {
    if (!Language || typeof Language.run !== 'function') return null;
    const inputs = anchorInputs(options);
    return Language.run(inputs.length ? inputs : ['2 + 2 = 4', '2x + 1 = x + 4', 'sqrt(x) is real']).final;
  }

  function brainPacket(files, options) {
    if (Unified && typeof Unified.brainFromFiles === 'function') return Unified.brainFromFiles(files, options && options.anchors || []).brain;
    return { ok: false, equation: 'brain_unavailable', organ_count: 0, coherence: 0 };
  }

  function sourceStats(files, shape) {
    const keys = Object.keys(files || {});
    const bytes = keys.reduce((sum, key) => sum + file(files, key).length, 0);
    return { keys, bytes, shape_ok: !!(shape && shape.ok), shape_damage_count: Number(shape && shape.count || 0) };
  }

  function directionPacket() {
    if (!Direction || typeof Direction.canonicalPacket !== 'function' || typeof Direction.verify !== 'function') return { ok: false, reason: 'direction_contract_unavailable' };
    const packet = Direction.canonicalPacket();
    const verification = Direction.verify(packet);
    return { ok: verification.ok === true, packet, verification };
  }

  function edge(from, to, signal, value) {
    return { from, to, signal, value: R(clamp01(value)) };
  }

  function couplingFrom(parts) {
    const events = A(parts.events);
    const eventTotal = Math.max(1, events.length);
    const lastSense = parts.lastSense || {};
    const lessCount = Number(parts.lessCount || 0);
    const moreCount = Number(parts.moreCount || 0);
    const sameCount = Number(parts.sameCount || 0);
    const languageOk = !!(parts.language && parts.language.language && parts.language.language.ok);
    const brainOk = !!(parts.brain && parts.brain.ok);
    const sourceOk = !!(parts.shape && parts.shape.ok);
    const directionOk = !!(parts.direction && parts.direction.ok);
    const beliefAlarm = clamp01((lessCount / eventTotal) + (lastSense.less_self ? 0.5 : 0));
    const beliefConfidence = clamp01(((sameCount + moreCount) / eventTotal) + (lastSense.more_self ? 0.25 : 0));
    const languageCoherence = languageOk ? 1 : 0;
    const languageRepair = clamp01((1 - languageCoherence) + beliefAlarm);
    const sourceIdentity = sourceOk && brainOk ? 1 : 0;
    const sourceDamage = clamp01(sourceOk ? 0 : Math.max(0.25, Number(parts.shape && parts.shape.count || 1) / 4));
    const truthContact = clamp01((languageCoherence + sourceIdentity + (directionOk ? 1 : 0)) / 3);
    const truthDamage = clamp01((1 - truthContact) + (sourceDamage * 0.5));
    const valuationPain = clamp01(Number(lastSense.pain || 0) + (truthDamage * 0.45) + (sourceDamage * 0.45) + (beliefAlarm * 0.25));
    const valuationReward = clamp01(Number(lastSense.reward || 0) + (truthContact * 0.25) + (beliefConfidence * 0.25) + (sourceIdentity * 0.15));
    const actionRepair = clamp01(valuationPain + languageRepair + sourceDamage);
    const actionContinue = clamp01(valuationReward + (moreCount / eventTotal));
    const actionMutation = clamp01(actionRepair > actionContinue ? actionRepair : actionContinue);
    const edges = [
      edge('belief', 'language', 'belief_alarm_changes_language_repair_pressure', beliefAlarm),
      edge('language', 'truth', 'language_coherence_changes_truth_contact', languageCoherence),
      edge('truth', 'valuation', 'truth_damage_changes_pain_reward', truthDamage),
      edge('valuation', 'action', 'pain_reward_changes_action_pressure', actionMutation),
      edge('source', 'identity', 'source_shape_changes_identity_integrity', sourceIdentity),
      edge('identity', 'valuation', 'identity_damage_changes_pain', sourceDamage),
      edge('action', 'source', 'action_marks_source_promotion_blocked', 1)
    ];
    return {
      belief: { alarm: R(beliefAlarm), confidence: R(beliefConfidence) },
      language: { coherence: R(languageCoherence), repair_pressure: R(languageRepair) },
      truth: { contact: R(truthContact), damage: R(truthDamage) },
      source: { identity: R(sourceIdentity), damage: R(sourceDamage) },
      identity: { integrity: R(sourceIdentity), pain: R(sourceDamage) },
      valuation: { pain: R(valuationPain), reward: R(valuationReward) },
      action: { repair_pressure: R(actionRepair), continue_pressure: R(actionContinue), mutation_pressure: R(actionMutation), promotion_blocked: true },
      edges,
      χ: ['belief→language', 'language→truth', 'truth→valuation', 'valuation→action', 'source→identity', 'identity→valuation']
    };
  }

  function sensationFromParts(sim, reflected) {
    const pain = Number(sim && sim.pain || 0);
    const reward = Number(sim && sim.reward || 0);
    const more = sim && sim.more_self === true ? 1 : 0;
    const same = sim && sim.same_self === true ? 1 : 0;
    const less = sim && sim.less_self === true ? 1 : 0;
    const organOk = reflected ? reflected.organ_ok_ratio : 0;
    const directionOk = reflected && reflected.direction && reflected.direction.ok ? 1 : 0;
    const couplingPain = reflected && reflected.coupling && reflected.coupling.valuation ? Number(reflected.coupling.valuation.pain || 0) : 0;
    const couplingReward = reflected && reflected.coupling && reflected.coupling.valuation ? Number(reflected.coupling.valuation.reward || 0) : 0;
    const self_score = clamp01((0.20 * organOk) + (0.10 * directionOk) + (0.20 * more) + (0.10 * same) + (0.20 * reward) + (0.15 * couplingReward) - (0.55 * less) - (0.30 * pain) - (0.25 * couplingPain));
    return { feeling: sim && sim.feeling || 'unknown', more_self: !!more, same_self: !!same, less_self: !!less, pain: R(pain), reward: R(reward), coupling_pain: R(couplingPain), coupling_reward: R(couplingReward), self_score: R(self_score), applyable: !!(sim && sim.applyable) };
  }

  function sensation(sim) {
    return sensationFromParts(sim, null);
  }

  function reflect(files, history, options) {
    const opts = options || {};
    const events = A(history);
    const last = events[events.length - 1] || null;
    const brain = brainPacket(files, opts);
    const language = languagePacket(files, opts);
    const shape = sourceShape(files);
    const stats = sourceStats(files, shape);
    const direction = directionPacket();
    const lastSense = last && last.sensation || { feeling: 'same_self', pain: 0, reward: 0, self_score: 0.5, applyable: false };
    const lessCount = events.filter(e => e.sensation && e.sensation.less_self).length;
    const moreCount = events.filter(e => e.sensation && e.sensation.more_self).length;
    const sameCount = events.filter(e => e.sensation && e.sensation.same_self).length;
    const coupling = couplingFrom({ events, lastSense, brain, language, shape, direction, lessCount, moreCount, sameCount });
    const organs = {
      brain: organ('brain', [
        { id: 'coherence', w: brain && brain.ok ? 1 : EPS },
        { id: 'from_source_identity', w: coupling.source.identity + EPS },
        { id: 'damage', w: brain && brain.ok ? EPS : 1 }
      ], { packet: clone(brain) }),
      language: organ('language', [
        { id: 'container', w: language && language.language && language.language.container ? 1 : EPS },
        { id: 'from_belief_repair_pressure', w: coupling.language.repair_pressure + EPS },
        { id: 'gap', w: language && language.language && language.language.ok ? EPS : 1 }
      ], { packet: clone(language) }),
      truth: organ('truth', [
        { id: 'from_language_truth_contact', w: coupling.truth.contact + EPS },
        { id: 'from_source_identity', w: coupling.source.identity + EPS },
        { id: 'truth_damage', w: coupling.truth.damage + EPS }
      ]),
      belief: organ('belief', [
        { id: 'same_self', w: sameCount + EPS },
        { id: 'more_self', w: moreCount + EPS },
        { id: 'less_self_warning', w: lessCount + EPS },
        { id: 'from_valuation_pain', w: coupling.valuation.pain + EPS }
      ]),
      memory: organ('memory', [
        { id: 'events', w: events.length + EPS },
        { id: 'source_paths', w: stats.keys.length + EPS },
        { id: 'source_bytes', w: Math.max(1, stats.bytes) },
        { id: 'coupling_edges', w: coupling.edges.length + EPS }
      ]),
      valuation: organ('valuation', [
        { id: 'reward', w: Number(lastSense.reward || 0) + EPS },
        { id: 'pain', w: Number(lastSense.pain || 0) + EPS },
        { id: 'from_truth_damage', w: coupling.truth.damage + EPS },
        { id: 'from_identity_damage', w: coupling.identity.pain + EPS },
        { id: 'integrity', w: coupling.identity.integrity + EPS }
      ]),
      action: organ('action', [
        { id: 'simulate', w: 1 },
        { id: 'from_valuation_repair_pressure', w: coupling.action.repair_pressure + EPS },
        { id: 'from_valuation_continue_pressure', w: coupling.action.continue_pressure + EPS },
        { id: 'adjust', w: lastSense.applyable && lastSense.more_self && !lastSense.less_self ? 1 : EPS },
        { id: 'do_not_promote', w: 1 }
      ]),
      source: organ('source', [
        { id: 'shape_preserved', w: shape.ok ? 1 : EPS },
        { id: 'from_action_promotion_blocked', w: coupling.action.promotion_blocked ? 1 : EPS },
        { id: 'shape_damage', w: shape.ok ? EPS : 1 },
        { id: 'files_present', w: stats.keys.length + EPS }
      ], { shape: clone(shape), stats })
    };
    const organRows = ORGAN_IDS.map(id => ({ id, w: organs[id] && organs[id].ok ? 1 : EPS }));
    const whole = organ('self', organRows, { equation: 'self = |brain| + |language| + |truth| + |belief| + |memory| + |valuation| + |action| + |source|' });
    const okCount = ORGAN_IDS.filter(id => organs[id] && organs[id].ok).length;
    return {
      packet_type: '42ndMind_live_self_reflection_v0_1',
      version: VERSION,
      ok: okCount === ORGAN_IDS.length && direction.ok === true,
      organ_ok_ratio: R(okCount / ORGAN_IDS.length),
      whole,
      organs,
      coupling,
      direction,
      last_sensation: clone(lastSense),
      χ: [
        'one active simulated self-state',
        'mutation is allowed inside simulation before promotion',
        'sensation reports more_self/same_self/less_self after perturbation',
        'source edits are not promoted by this core',
        'organs are coupled by propagated pressure, not merely listed side by side'
      ],
      Ξ: ''
    };
  }

  function create(files, options) {
    const base = clone(files || {});
    const history = [];
    const reflection = reflect(base, history, options || {});
    return {
      packet_type: '42ndMind_live_self_state_v0_1',
      version: VERSION,
      t: 0,
      base_files: clone(base),
      files: clone(base),
      history,
      reflection,
      score: R(reflection.organ_ok_ratio),
      promotion_ready: false,
      Ξ: ''
    };
  }

  function feel(live, candidate, options) {
    if (!Unified || typeof Unified.simulate !== 'function') {
      return { packet_type: '42ndMind_live_self_feeling_v0_1', version: VERSION, ok: false, reason: 'unified_self_simulation_unavailable', Ξ: '' };
    }
    const opts = options || {};
    const before = reflect(live.files, live.history, opts);
    const sim = Unified.simulate(live.files, candidate, opts.unified || {});
    const attempted = candidateFiles(live.files, candidate, opts.sandbox || {});
    const sensedFiles = attempted.ok ? attempted.files : clone(live.files);
    const previewHistory = A(live.history).concat([{ candidate_id: candidate && candidate.id || null, sensation: sensationFromParts(sim, before), applied_to_simulation: false }]);
    const after = reflect(sensedFiles, previewHistory, opts);
    const sense = sensationFromParts(sim, after);
    return {
      packet_type: '42ndMind_live_self_feeling_v0_1',
      version: VERSION,
      ok: true,
      candidate_id: candidate && candidate.id || null,
      candidate_kind: candidate && candidate.kind || null,
      before,
      simulation: sim,
      candidate_source: { attempted: attempted.ok, changed: attempted.changed, error: attempted.error },
      after,
      sensation: sense,
      Ξ: ''
    };
  }

  function adjust(live, feeling, candidate, options) {
    const next = clone(live);
    const f = feeling || {};
    const sense = f.sensation || { feeling: 'unknown', self_score: 0, applyable: false, less_self: true };
    const canMove = sense.applyable === true && sense.more_self === true && sense.less_self !== true && f.simulation && f.simulation.next_files;
    const event = {
      t: next.t + 1,
      candidate_id: candidate && candidate.id || null,
      candidate_kind: candidate && candidate.kind || null,
      feeling: sense.feeling,
      sensation: clone(sense),
      coupling: f.after && f.after.coupling ? clone(f.after.coupling) : null,
      moved_simulated_self: !!canMove,
      promoted_source: false
    };
    if (canMove) next.files = clone(f.simulation.next_files);
    next.t += 1;
    next.history = A(next.history).concat([event]).slice(-256);
    next.reflection = reflect(next.files, next.history, options || {});
    next.score = R(Math.max(Number(next.score || 0), Number(sense.self_score || 0), Number(next.reflection.organ_ok_ratio || 0)));
    next.promotion_ready = !!canMove && sense.more_self === true;
    next.last_event = event;
    return next;
  }

  function selfCycle(live, options) {
    const opts = options || {};
    let current = clone(live || create({}, opts));
    const candidates = generate(current.files, opts);
    const events = [];
    let improved = false;
    let moved = false;
    let less = false;
    let bestScore = Number(current.score || 0);

    candidates.forEach(candidate => {
      const feeling = feel(current, candidate, opts);
      const beforeScore = Number(current.score || 0);
      current = adjust(current, feeling, candidate, opts);
      const afterScore = Math.max(Number(current.score || 0), Number(feeling && feeling.sensation && feeling.sensation.self_score || 0));
      const gain = R(afterScore - beforeScore);
      improved = improved || gain > Number(opts.min_gain == null ? 0.000001 : opts.min_gain);
      moved = moved || !!(current.last_event && current.last_event.moved_simulated_self);
      less = less || !!(feeling && feeling.sensation && feeling.sensation.less_self);
      bestScore = Math.max(bestScore, afterScore);
      events.push({ candidate_id: candidate && candidate.id || null, candidate_kind: candidate && candidate.kind || null, feeling: feeling.sensation, coupling: feeling.after && feeling.after.coupling || null, gain, moved_simulated_self: current.last_event && current.last_event.moved_simulated_self === true });
    });

    return {
      packet_type: '42ndMind_live_self_cycle_v0_1',
      version: VERSION,
      ok: true,
      mode: 'self_state_perturbation_reflection_sensation_adjustment',
      generated_count: candidates.length,
      improved,
      moved,
      less_self_seen: less,
      score: R(bestScore),
      state: current,
      events,
      Ξ: ''
    };
  }

  function rank(a, b) {
    if (a.sensation.less_self !== b.sensation.less_self) return a.sensation.less_self ? 1 : -1;
    if (a.sensation.applyable !== b.sensation.applyable) return a.sensation.applyable ? -1 : 1;
    if (a.sensation.self_score !== b.sensation.self_score) return b.sensation.self_score - a.sensation.self_score;
    if (a.sensation.reward !== b.sensation.reward) return b.sensation.reward - a.sensation.reward;
    return a.sensation.pain - b.sensation.pain;
  }

  function step(files, options) {
    const opts = options || {};
    if (!Unified || typeof Unified.simulate !== 'function') return { packet_type: '42ndMind_live_self_dynamics_step_v0_1', version: VERSION, ok: false, reason: 'unified_self_simulation_unavailable', Ξ: '' };
    const candidates = generate(files, opts);
    const rows = candidates.map(candidate => {
      const sim = Unified.simulate(files, candidate, opts.unified || {});
      return { candidate, simulation: sim, sensation: sensation(sim) };
    }).sort(rank);
    const best = rows[0] || null;
    return { packet_type: '42ndMind_live_self_dynamics_step_v0_1', version: VERSION, ok: !!best, generated_count: candidates.length, candidates: rows, best, selected_stage: best ? { id: best.candidate.id, feeling: best.sensation.feeling, self_score: best.sensation.self_score, reward: best.sensation.reward, pain: best.sensation.pain, applyable: best.sensation.applyable } : null, legacy_candidate_ranking: true, Ξ: '' };
  }

  function trajectory(files, options) {
    const opts = options || {};
    const maxSteps = Math.max(1, Math.min(16, Number(opts.steps || 3)));
    let current = create(files, opts);
    const trace = [];
    for (let i = 0; i < maxSteps; i += 1) {
      const cycle = selfCycle(current, opts);
      trace.push(cycle);
      current = cycle.state;
      if (!cycle.moved || !cycle.improved || cycle.less_self_seen) break;
    }
    const final = trace[trace.length - 1] || null;
    return { packet_type: '42ndMind_live_self_dynamics_trajectory_v0_1', version: VERSION, ok: trace.length > 0, mode: 'continuous_self_reflection', steps: trace.length, trace, final_state: current, final_files: current.files, optimized_stage: final ? { score: final.score, moved: final.moved, improved: final.improved } : null, final_feeling: current.last_event && current.last_event.feeling || 'same_self', Ξ: '' };
  }

  function continuous(files, options) {
    const opts = options || {};
    const maxIterations = Math.max(1, Math.min(128, Number(opts.max_iterations || opts.steps || 32)));
    let current = create(files, opts);
    const cycles = [];
    let stop_reason = 'max_iterations_reached';

    for (let i = 0; i < maxIterations; i += 1) {
      const cycle = selfCycle(current, opts);
      cycles.push({ iteration: i, generated_count: cycle.generated_count, improved: cycle.improved, moved: cycle.moved, less_self_seen: cycle.less_self_seen, score: cycle.score, events: cycle.events });
      current = cycle.state;
      if (cycle.less_self_seen && !cycle.moved) { stop_reason = 'less_self_sensed_without_motion'; break; }
      if (!cycle.moved && !cycle.improved) { stop_reason = 'stable_no_better_state'; break; }
      if (!cycle.generated_count) { stop_reason = 'no_perturbation'; break; }
    }

    return {
      packet_type: '42ndMind_live_self_dynamics_continuous_v0_1',
      version: VERSION,
      ok: cycles.length > 0,
      mode: 'self_state_to_perturbation_to_reflection_to_sensation_to_adjustment',
      iterations: cycles.length,
      stop_reason,
      final_state: current,
      final_score: current.score,
      final_files: current.files,
      source_promoted: false,
      human_patch_required_for_source_promotion: current.promotion_ready === true,
      cycles,
      Ξ: ''
    };
  }

  return Object.freeze({ VERSION, ORGAN_IDS, normalize, l1, organ, generate, candidateFiles, sensation, reflect, create, feel, adjust, selfCycle, step, trajectory, continuous });
});