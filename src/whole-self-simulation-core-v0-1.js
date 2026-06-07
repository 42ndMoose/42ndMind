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
    'sqrt(x) is real',
    'f(g(x))',
    'x ∈ A',
    'prove by induction P(n)',
    'i^2 = -1'
  ]);

  const DEFAULT_FRONTIER_ANCHORS = Object.freeze([
    { id: 'matrices', input: 'A B = C', expected_gap: 'unclassified_math_ast', reason: 'Matrix multiplication and typed linear algebra are not yet represented.' },
    { id: 'sequences', input: 'a_n = n^2', expected_gap: 'unclassified_math_ast', reason: 'Sequences and indexed variables are not yet represented.' },
    { id: 'logic_quantifier_exists', input: 'exists x in R, x^2 = 2', expected_gap: 'unclassified_math_ast', reason: 'Existential quantifier closure is not yet represented.' }
  ]);

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function A(value) { return Array.isArray(value) ? value : []; }

  function frontierFor(input, frontiers) { return A(frontiers && frontiers.length ? frontiers : DEFAULT_FRONTIER_ANCHORS).find(f => f.input === input) || null; }

  function mathScore(kernel, anchors, frontierAnchors) {
    if (!kernel || typeof kernel.math !== 'function') return { ok: false, score: 0, stability_score: 0, completeness_score: 0, damage_count: 1, frontier_count: 0, anchors: [], frontiers: [], gap_count: 1 };
    const frontiers = A(frontierAnchors && frontierAnchors.length ? frontierAnchors : DEFAULT_FRONTIER_ANCHORS);
    const rows = A(anchors && anchors.length ? anchors : DEFAULT_LANGUAGE_ANCHORS).map(input => {
      try {
        const packet = kernel.math(input);
        const frontier = frontierFor(input, frontiers);
        const gapId = packet && packet.gaps && packet.gaps[0] ? packet.gaps[0].id : null;
        const expectedGap = frontier && frontier.expected_gap;
        const ok = expectedGap ? packet.ok === false && gapId === expectedGap : packet.ok === true;
        return { input, ok, frontier: !!frontier, frontier_id: frontier && frontier.id || null, reason: frontier && frontier.reason || null, verified: packet.verified === true, closure_operator: packet.closure_operator || null, selected_rule: packet.selected_rule || null, gap: gapId };
      } catch (err) {
        return { input, ok: false, frontier: false, error: String(err && err.message || err) };
      }
    });
    const explicitFrontierRows = frontiers.filter(f => !rows.some(r => r.input === f.input)).map(f => {
      try {
        const packet = kernel.math(f.input);
        const gapId = packet && packet.gaps && packet.gaps[0] ? packet.gaps[0].id : null;
        const ok = packet.ok === false && gapId === f.expected_gap;
        return { input: f.input, ok, frontier: true, frontier_id: f.id, reason: f.reason, verified: false, closure_operator: null, selected_rule: null, gap: gapId };
      } catch (err) {
        return { input: f.input, ok: false, frontier: true, frontier_id: f.id, reason: f.reason, error: String(err && err.message || err) };
      }
    });
    const allRows = rows.concat(explicitFrontierRows);
    const damage = allRows.filter(row => !row.ok);
    const frontierRows = allRows.filter(row => row.ok && row.frontier === true);
    const stableRows = allRows.filter(row => row.ok || row.frontier === true);
    const stabilityScore = allRows.length ? R(stableRows.length / allRows.length) : 0;
    const completenessScore = allRows.length ? R((allRows.length - frontierRows.length - damage.length) / allRows.length) : 0;
    return { ok: damage.length === 0, score: stabilityScore, stability_score: stabilityScore, completeness_score: completenessScore, damage_count: damage.length, frontier_count: frontierRows.length, gap_count: damage.length, anchors: allRows, frontiers: frontierRows };
  }

  function truthScore(math) {
    if (!Truth || typeof Truth.create !== 'function') return { ok: false, score: 0, claim: null };
    const score = clamp01(math && math.stability_score != null ? math.stability_score : math && math.score);
    const frontierPressure = math && math.frontier_count ? Math.min(1, math.frontier_count / Math.max(1, A(math.anchors).length)) : 0;
    const damagePressure = math && math.damage_count ? 1 : 0;
    const claim = Truth.create({
      id: 'whole_self_truth_state', support: score, counter: 1 - score, contradiction: damagePressure, unknown: frontierPressure,
      scope_ok: score, scope_error: 1 - score, definition_ok: score, definition_error: 1 - score,
      observation_ok: score, observation_error: 1 - score, measurement_ok: score, measurement_error: 1 - score,
      no_contradiction: damagePressure ? 0 : 1, no_unknown: 1 - frontierPressure
    });
    return { ok: damagePressure === 0, score: R(claim.closure), frontier_pressure: R(frontierPressure), claim };
  }

  function epistemicScore(math, truth, reality) {
    if (!Epistemic || typeof Epistemic.evaluateGates !== 'function') return { ok: false, score: 0, gates: null };
    const stable = !!(math && math.ok === true && reality && reality.ok === true);
    const gates = { coherence: stable, reality_contact: !!(reality && reality.ok === true), self_correction: true, anti_delusion: stable, integration: stable && !!truth, scope_clarity: !!(math && math.anchors && math.anchors.length > 0) };
    const packet = Epistemic.evaluateGates(gates);
    return { ok: packet.ok === true, score: R(packet.gate_open_ratio || 0), gates: packet };
  }

  function loadKernelFromFiles(files) {
    if (!files || !files['src/math-language-kernel-v0-1.js']) return K;
    if (!Reality || typeof Reality.evaluate !== 'function') return K;
    return { math: K && K.math, completeMath: K && K.completeMath };
  }

  function evaluateState(input, options) {
    const opts = options || {};
    const files = input && input.files || null;
    const kernel = opts.kernel || loadKernelFromFiles(files) || K;
    const math = mathScore(kernel, opts.language_anchors || DEFAULT_LANGUAGE_ANCHORS, opts.frontier_anchors || DEFAULT_FRONTIER_ANCHORS);
    const reality = files && Reality && typeof Reality.evaluate === 'function' ? Reality.evaluate(files) : { ok: math.ok, score: math.stability_score, damage_count: math.damage_count, anchors: math.anchors };
    const truth = truthScore(math);
    const epistemic = epistemicScore(math, truth, reality);
    const stability_score = R((0.35 * math.stability_score) + (0.25 * (truth.ok ? 1 : truth.score)) + (0.25 * (reality.score == null ? (reality.ok ? 1 : 0) : reality.score)) + (0.15 * epistemic.score));
    const completeness_score = R(math.completeness_score);
    const score = R((0.7 * stability_score) + (0.3 * completeness_score));
    const damage_count = (math.damage_count || 0) + (reality.damage_count || 0) + (epistemic.ok ? 0 : 1) + (truth.ok ? 0 : 1);
    const frontier_count = math.frontier_count || 0;
    return { packet_type: '42ndMind_whole_self_state_v0_1', version: VERSION, id: input && input.id || 'state', ok: damage_count === 0, score, stability_score, completeness_score, damage_count, frontier_count, math, truth, reality, epistemic, stop: damage_count === 0 && frontier_count === 0 && stability_score === 1 && completeness_score === 1, feeling: damage_count ? 'less_self' : frontier_count ? 'stable_but_incomplete' : 'same_self_or_more_self', wants: math.frontiers.map(f => ({ id: f.frontier_id, input: f.input, gap: f.gap, reason: f.reason || 'Supported as an intended frontier gap.' })), Ξ: '' };
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
        try { files = Sandbox.applyProposal(files, candidate, { allowDelete: false, maxPatchBytes: opts.maxPatchBytes || 250000 }); sandboxReport = { ok: true }; }
        catch (err) { sandboxReport = { ok: false, error: String(err && err.message || err) }; }
      } else if (candidate && candidate.files) { files = candidate.files; sandboxReport = { ok: true }; }
      const state = sandboxReport && sandboxReport.ok === false ? { packet_type: '42ndMind_whole_self_state_v0_1', version: VERSION, id: candidate.id || ('candidate_' + index), ok: false, score: 0, stability_score: 0, completeness_score: 0, damage_count: 1, frontier_count: 0, sandbox: sandboxReport, stop: false, feeling: 'less_self', Ξ: '' } : evaluateState({ id: candidate && candidate.id || ('candidate_' + index), files }, opts);
      state.sandbox = sandboxReport;
      rows.push(state);
    });
    rows.sort((a, b) => Number(b.stability_score || 0) - Number(a.stability_score || 0) || Number(a.damage_count || 0) - Number(b.damage_count || 0) || Number(b.completeness_score || 0) - Number(a.completeness_score || 0));
    return { packet_type: '42ndMind_whole_self_simulation_v0_1', version: VERSION, base, candidates: rows.filter(row => row.id !== 'base'), best: rows[0] || base, stop: !!(rows[0] && rows[0].stop === true), decision: rows[0] && rows[0].id === 'base' ? 'keep_current_state' : 'prefer_candidate_state', frontier_count: rows[0] && rows[0].frontier_count || 0, wants: rows[0] && rows[0].wants || [], Ξ: '' };
  }

  return Object.freeze({ VERSION, DEFAULT_LANGUAGE_ANCHORS, DEFAULT_FRONTIER_ANCHORS, evaluateState, simulateCandidates, mathScore, truthScore, epistemicScore });
});
