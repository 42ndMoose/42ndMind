(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindWholeSelfSimulationCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let K = null;
  let Truth = null;
  let Epistemic = null;
  let Reality = null;
  let Sandbox = null;
  try { if (typeof require === 'function') K = require('./math-language-kernel-v0-1.js'); } catch (_) { K = null; }
  try { if (typeof require === 'function') Truth = require('./truth-accounting-core-v0-1.js'); } catch (_) { Truth = null; }
  try { if (typeof require === 'function') Epistemic = require('./epistemic-octahedron-core-v0-1.js'); } catch (_) { Epistemic = null; }
  try { if (typeof require === 'function') Reality = require('./source-edit-reality-feedback-v0-1.js'); } catch (_) { Reality = null; }
  try { if (typeof require === 'function') Sandbox = require('./source-sandbox-v0-1.js'); } catch (_) { Sandbox = null; }

  const DEFAULT_LANGUAGE_ANCHORS = Object.freeze([
    '2 + 2 = 4',
    '3 + 2 = 4',
    '2x + 1 = x + 4',
    'a = b, b = c therefore a = c',
    'simplify x + 0',
    '∀x ∈ ℝ, x + 0 = x',
    'sqrt(x) is real'
  ]);

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function A(value) { return Array.isArray(value) ? value : []; }

  function mathScore(kernel, anchors) {
    if (!kernel || typeof kernel.math !== 'function') return { ok: false, score: 0, damage_count: 1, anchors: [], gap_count: 1 };
    const rows = A(anchors && anchors.length ? anchors : DEFAULT_LANGUAGE_ANCHORS).map(input => {
      try {
        const packet = kernel.math(input);
        const expectedGap = input === 'sqrt(x) is real';
        const ok = expectedGap ? packet.ok === false && packet.gaps && packet.gaps[0] && packet.gaps[0].id === 'unclassified_math_ast' : packet.ok === true;
        return { input, ok, verified: packet.verified === true, closure_operator: packet.closure_operator || null, selected_rule: packet.selected_rule || null, gap: packet.gaps && packet.gaps[0] ? packet.gaps[0].id : null };
      } catch (err) {
        return { input, ok: false, error: String(err && err.message || err) };
      }
    });
    const okCount = rows.filter(row => row.ok).length;
    const damage = rows.filter(row => !row.ok);
    return { ok: damage.length === 0, score: rows.length ? R(okCount / rows.length) : 0, damage_count: damage.length, gap_count: damage.length, anchors: rows };
  }

  function truthScore(math) {
    if (!Truth || typeof Truth.create !== 'function') return { ok: false, score: 0, claim: null };
    const score = clamp01(math && math.score);
    const claim = Truth.create({
      id: 'whole_self_truth_state',
      support: score,
      counter: 1 - score,
      contradiction: math && math.damage_count ? 1 : 0,
      unknown: math && math.gap_count ? Math.min(1, math.gap_count / Math.max(1, A(math.anchors).length)) : 0,
      scope_ok: score,
      scope_error: 1 - score,
      definition_ok: score,
      definition_error: 1 - score,
      observation_ok: score,
      observation_error: 1 - score,
      measurement_ok: score,
      measurement_error: 1 - score,
      no_contradiction: math && math.damage_count ? 0 : 1,
      no_unknown: math && math.gap_count ? 1 - Math.min(1, math.gap_count / Math.max(1, A(math.anchors).length)) : 1
    });
    return { ok: claim.truth_gate.true === true || score === 1, score: R(claim.closure), claim };
  }

  function epistemicScore(math, truth, reality) {
    if (!Epistemic || typeof Epistemic.evaluateGates !== 'function') return { ok: false, score: 0, gates: null };
    const gates = {
      coherence: !!(truth && truth.score === 1),
      reality_contact: !!(reality && reality.ok === true),
      self_correction: true,
      anti_delusion: !!(math && math.ok === true && reality && reality.ok === true),
      integration: !!(math && truth && reality && math.ok === true && truth.score === 1 && reality.ok === true),
      scope_clarity: !!(math && math.anchors && math.anchors.length > 0)
    };
    const packet = Epistemic.evaluateGates(gates);
    return { ok: packet.ok === true, score: R(packet.gate_open_ratio || 0), gates: packet };
  }

  function loadKernelFromFiles(files) {
    if (!files || !files['src/math-language-kernel-v0-1.js']) return K;
    if (!Reality || typeof Reality.evaluate !== 'function') return K;
    const evalReport = Reality.evaluate(files);
    return { __virtual_reality_report: evalReport, math: K && K.math, completeMath: K && K.completeMath };
  }

  function evaluateState(input, options) {
    const opts = options || {};
    const files = input && input.files || null;
    const kernel = opts.kernel || loadKernelFromFiles(files) || K;
    const math = mathScore(kernel, opts.language_anchors || DEFAULT_LANGUAGE_ANCHORS);
    const reality = files && Reality && typeof Reality.evaluate === 'function' ? Reality.evaluate(files) : { ok: math.ok, score: math.score, damage_count: math.damage_count, anchors: math.anchors };
    const truth = truthScore(math);
    const epistemic = epistemicScore(math, truth, reality);
    const score = R((0.35 * math.score) + (0.25 * truth.score) + (0.25 * (reality.score == null ? (reality.ok ? 1 : 0) : reality.score)) + (0.15 * epistemic.score));
    const damage_count = (math.damage_count || 0) + (reality.damage_count || 0) + (epistemic.ok ? 0 : 1);
    return {
      packet_type: '42ndMind_whole_self_state_v0_1',
      version: VERSION,
      id: input && input.id || 'state',
      ok: damage_count === 0 && score === 1,
      score,
      damage_count,
      math,
      truth,
      reality,
      epistemic,
      stop: damage_count === 0 && score === 1,
      feeling: damage_count === 0 ? 'same_self_or_more_self' : 'less_self',
      Ξ: ''
    };
  }

  function simulateCandidates(baseFiles, candidates, options) {
    const opts = options || {};
    const rows = [];
    const base = evaluateState({ id: 'base', files: baseFiles }, opts);
    rows.push(base);
    A(candidates).forEach((candidate, index) => {
      let files = clone(baseFiles || {});
      let sandboxReport = null;
      if (candidate && candidate.operations && Sandbox && typeof Sandbox.applyProposal === 'function') {
        try {
          files = Sandbox.applyProposal(files, candidate, { allowDelete: false, maxPatchBytes: opts.maxPatchBytes || 250000 });
          sandboxReport = { ok: true };
        } catch (err) {
          sandboxReport = { ok: false, error: String(err && err.message || err) };
        }
      } else if (candidate && candidate.files) {
        files = candidate.files;
        sandboxReport = { ok: true };
      }
      const state = sandboxReport && sandboxReport.ok === false
        ? { packet_type: '42ndMind_whole_self_state_v0_1', version: VERSION, id: candidate.id || ('candidate_' + index), ok: false, score: 0, damage_count: 1, sandbox: sandboxReport, stop: false, feeling: 'less_self', Ξ: '' }
        : evaluateState({ id: candidate && candidate.id || ('candidate_' + index), files }, opts);
      state.sandbox = sandboxReport;
      rows.push(state);
    });
    rows.sort((a, b) => Number(b.score || 0) - Number(a.score || 0) || Number(a.damage_count || 0) - Number(b.damage_count || 0));
    return {
      packet_type: '42ndMind_whole_self_simulation_v0_1',
      version: VERSION,
      base,
      candidates: rows.filter(row => row.id !== 'base'),
      best: rows[0] || base,
      stop: !!(rows[0] && rows[0].stop === true),
      decision: rows[0] && rows[0].id === 'base' ? 'keep_current_state' : 'prefer_candidate_state',
      Ξ: ''
    };
  }

  return Object.freeze({ VERSION, DEFAULT_LANGUAGE_ANCHORS, evaluateState, simulateCandidates, mathScore, truthScore, epistemicScore });
});
