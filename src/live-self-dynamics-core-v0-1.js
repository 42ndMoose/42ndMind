(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindLiveSelfDynamicsCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let Unified = null;
  try { if (typeof require === 'function') Unified = require('./unified-self-simulation-core-v0-1.js'); } catch (_) { Unified = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function text(value) { return String(value == null ? '' : value); }
  function file(files, path) { return text((files || {})[path]); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }

  function preserveCandidate(files) {
    return { id: 'same_self_preserve_current_operator_anatomy', origin: 'live_self_dynamics', kind: 'preserve_current_state', operations: [{ type: 'replace', path: 'src/operator-anatomy-v0-1.js', content: file(files, 'src/operator-anatomy-v0-1.js') }] };
  }

  function markerCandidate(files) {
    const path = 'src/operator-anatomy-v0-1.js';
    const content = file(files, path);
    if (!content || content.indexOf('live-self dynamics marker') >= 0) return null;
    return { id: 'mark_live_self_dynamics_memory', origin: 'live_self_dynamics', kind: 'safe_memory_marker', operations: [{ type: 'replace', path, content: content + '\n// live-self dynamics marker: simulated before application.\n' }] };
  }

  function generate(files, options) {
    const candidates = [];
    candidates.push(preserveCandidate(files));
    const marker = markerCandidate(files);
    if (marker) candidates.push(marker);
    A(options && options.extra_candidates).forEach(c => candidates.push(c));
    return candidates.filter(Boolean);
  }

  function sensation(sim) {
    const pain = Number(sim && sim.pain || 0);
    const reward = Number(sim && sim.reward || 0);
    const more = sim && sim.more_self === true ? 1 : 0;
    const same = sim && sim.same_self === true ? 1 : 0;
    const less = sim && sim.less_self === true ? 1 : 0;
    const self_score = clamp01((0.45 * more) + (0.25 * same) + (0.30 * reward) - (0.55 * less) - (0.35 * pain));
    return { feeling: sim && sim.feeling || 'unknown', more_self: !!more, same_self: !!same, less_self: !!less, pain, reward, self_score, applyable: !!(sim && sim.applyable) };
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
    return { packet_type: '42ndMind_live_self_dynamics_step_v0_1', version: VERSION, ok: !!best, generated_count: candidates.length, candidates: rows, best, selected_stage: best ? { id: best.candidate.id, feeling: best.sensation.feeling, self_score: best.sensation.self_score, reward: best.sensation.reward, pain: best.sensation.pain, applyable: best.sensation.applyable } : null, Ξ: '' };
  }

  function trajectory(files, options) {
    const opts = options || {};
    const maxSteps = Math.max(1, Math.min(16, Number(opts.steps || 3)));
    let current = clone(files || {});
    const trace = [];
    for (let i = 0; i < maxSteps; i += 1) {
      const packet = step(current, opts);
      trace.push(packet);
      if (!packet.ok || !packet.best || !packet.best.sensation.applyable) break;
      if (packet.best.sensation.less_self) break;
      if (packet.best.simulation && packet.best.simulation.next_files) current = clone(packet.best.simulation.next_files);
      if (packet.best.sensation.same_self && packet.best.candidate.kind === 'preserve_current_state') break;
    }
    const finalStep = trace[trace.length - 1] || null;
    return { packet_type: '42ndMind_live_self_dynamics_trajectory_v0_1', version: VERSION, ok: trace.length > 0 && finalStep && finalStep.ok === true, steps: trace.length, trace, final_files: current, optimized_stage: finalStep && finalStep.selected_stage || null, final_feeling: finalStep && finalStep.selected_stage && finalStep.selected_stage.feeling || 'unknown', Ξ: '' };
  }

  function continuous(files, options) {
    const opts = options || {};
    const maxIterations = Math.max(1, Math.min(128, Number(opts.max_iterations || 32)));
    const minGain = Number(opts.min_gain == null ? 0.000001 : opts.min_gain);
    let current = clone(files || {});
    let lastScore = -Infinity;
    const trace = [];
    let stop_reason = 'max_iterations_reached';

    for (let i = 0; i < maxIterations; i += 1) {
      const packet = step(current, opts);
      const best = packet && packet.best;
      const score = best ? Number(best.sensation.self_score || 0) : -Infinity;
      const gain = Number.isFinite(lastScore) ? R(score - lastScore) : score;
      trace.push({ iteration: i, packet, score: R(score), gain: R(gain) });

      if (!packet.ok || !best) { stop_reason = 'no_candidate'; break; }
      if (!best.sensation.applyable) { stop_reason = 'no_applyable_mutation'; break; }
      if (best.sensation.less_self) { stop_reason = 'less_self_detected'; break; }
      if (Number.isFinite(lastScore) && gain <= minGain) { stop_reason = 'stable_no_better_state'; break; }

      if (best.simulation && best.simulation.next_files) current = clone(best.simulation.next_files);
      lastScore = score;
    }

    const final = trace[trace.length - 1] || null;
    return { packet_type: '42ndMind_live_self_dynamics_continuous_v0_1', version: VERSION, ok: trace.length > 0, iterations: trace.length, stop_reason, optimized_stage: final && final.packet && final.packet.selected_stage || null, final_score: final ? final.score : null, final_files: current, trace, Ξ: '' };
  }

  return Object.freeze({ VERSION, generate, sensation, step, trajectory, continuous });
});
