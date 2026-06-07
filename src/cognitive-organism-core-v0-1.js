(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindCognitiveOrganismCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-9;
  let K = null;
  try { if (typeof require === 'function') K = require('./math-language-kernel-v0-1.js'); } catch (_) { K = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function truthy(value) { return value === true; }

  function checksum(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value || null);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  function normalizeWeights(rows) {
    const clean = A(rows).map(row => ({ id: String(row.id || row.σ || 'unknown'), w: Math.max(EPS, Number(row.w || row.weight || 0)) }));
    const total = clean.reduce((sum, row) => sum + row.w, 0) || 1;
    return clean.map(row => ({ id: row.id, w: R(row.w / total) })).sort((a, b) => b.w - a.w || a.id.localeCompare(b.id));
  }

  function emptyMemory() {
    return {
      observations: [],
      by_input: {},
      by_signature: {},
      successes: [],
      failures: [],
      edits: [],
      predictions: []
    };
  }

  function create(options) {
    const opts = options || {};
    return {
      packet_type: '42ndMind_cognitive_organism_state_v0_1',
      version: VERSION,
      t: 0,
      params: Object.assign({ memory_limit: 512, novelty_floor: 0.08 }, opts.params || {}),
      memory: emptyMemory(),
      attention: normalizeWeights([{ id: 'novelty', w: 1 }]),
      reward: 0,
      pain: 0,
      surprise: 1,
      integrity: 1,
      aliveness: 0,
      feeling: 'uninitialized',
      last: null,
      trace: [],
      Ξ: ''
    };
  }

  function inputSignature(mathPacket) {
    if (!mathPacket) return 'unknown';
    return [
      mathPacket.ast_type || 'Unknown',
      mathPacket.anatomy_id || 'none',
      mathPacket.closure_operator || 'none',
      mathPacket.selected_rule || 'none',
      mathPacket.ok ? 'ok' : 'gap'
    ].join('|');
  }

  function predict(memory, raw, signature) {
    const key = String(raw == null ? '' : raw);
    const exact = memory.by_input[key];
    const structural = memory.by_signature[signature];
    if (exact) {
      return { mode: 'exact', expected_ok: exact.last_ok, confidence: clamp01(0.55 + Math.min(0.4, exact.count * 0.08)), prior_count: exact.count };
    }
    if (structural) {
      const okRate = structural.count ? structural.ok_count / structural.count : 0;
      return { mode: 'structural', expected_ok: okRate >= 0.5, confidence: clamp01(0.25 + Math.min(0.45, structural.count * 0.06)), prior_count: structural.count };
    }
    return { mode: 'none', expected_ok: null, confidence: 0, prior_count: 0 };
  }

  function scoreObservation(mathPacket, prediction) {
    const ok = truthy(mathPacket && mathPacket.ok);
    const gapCount = Number(mathPacket && mathPacket.gap_count) || 0;
    const hasGap = !ok || gapCount > 0;
    const predicted = prediction && prediction.expected_ok;
    const confidence = clamp01(prediction && prediction.confidence);
    const predictionMiss = predicted == null ? 1 : (predicted === ok ? 0 : confidence);
    const novelty = clamp01(1 - confidence);
    const contradiction = hasGap ? 1 : 0;
    const closureGain = ok ? 1 : 0;
    const reward = clamp01((0.62 * closureGain) + (0.18 * (1 - predictionMiss)) + (0.12 * confidence) + (0.08 * (ok && novelty < 1 ? 1 : 0)));
    const pain = clamp01((0.55 * contradiction) + (0.25 * predictionMiss) + (0.15 * (hasGap ? 1 : 0)) + (0.05 * (mathPacket && mathPacket.Ξ ? 1 : 0)));
    const surprise = clamp01((0.60 * novelty) + (0.40 * predictionMiss));
    const rewardPotential = clamp01(hasGap ? 0.55 : 0.15 + novelty * 0.25);
    return { ok, hasGap, gapCount, contradiction, predictionMiss: R(predictionMiss), novelty: R(novelty), reward: R(reward), pain: R(pain), surprise: R(surprise), rewardPotential: R(rewardPotential) };
  }

  function attentionFrom(score) {
    return normalizeWeights([
      { id: 'gap', w: score.hasGap ? 1 : EPS },
      { id: 'contradiction', w: score.contradiction + EPS },
      { id: 'novelty', w: score.novelty + EPS },
      { id: 'surprise', w: score.surprise + EPS },
      { id: 'reward_potential', w: score.rewardPotential + EPS },
      { id: 'integrity', w: score.pain + EPS }
    ]);
  }

  function remember(memory, raw, mathPacket, signature, score, prediction) {
    const key = String(raw == null ? '' : raw);
    const row = {
      id: 'obs_' + checksum({ key, t: memory.observations.length + 1 }).slice(0, 10),
      input: key,
      signature,
      ok: score.ok,
      reward: score.reward,
      pain: score.pain,
      surprise: score.surprise,
      selected_rule: mathPacket && mathPacket.selected_rule || null,
      closure_operator: mathPacket && mathPacket.closure_operator || null,
      prediction_mode: prediction.mode
    };
    memory.observations.push(row);
    if (memory.observations.length > 512) memory.observations = memory.observations.slice(-512);

    const exact = memory.by_input[key] || { count: 0, ok_count: 0, last_ok: null, reward_sum: 0, pain_sum: 0 };
    exact.count += 1;
    exact.ok_count += score.ok ? 1 : 0;
    exact.last_ok = score.ok;
    exact.reward_sum = R(exact.reward_sum + score.reward);
    exact.pain_sum = R(exact.pain_sum + score.pain);
    memory.by_input[key] = exact;

    const structural = memory.by_signature[signature] || { count: 0, ok_count: 0, reward_sum: 0, pain_sum: 0, examples: [] };
    structural.count += 1;
    structural.ok_count += score.ok ? 1 : 0;
    structural.reward_sum = R(structural.reward_sum + score.reward);
    structural.pain_sum = R(structural.pain_sum + score.pain);
    if (structural.examples.indexOf(key) < 0) structural.examples.push(key);
    structural.examples = structural.examples.slice(-8);
    memory.by_signature[signature] = structural;

    if (score.ok) memory.successes.push(row);
    else memory.failures.push(row);
    memory.successes = memory.successes.slice(-128);
    memory.failures = memory.failures.slice(-128);
    memory.predictions.push({ input: key, signature, mode: prediction.mode, confidence: prediction.confidence, miss: score.predictionMiss });
    memory.predictions = memory.predictions.slice(-128);
    return row;
  }

  function proposeCandidate(mathPacket, score) {
    if (score.ok) return { id: 'keep_closed_structure', action: 'preserve', reason: 'input closed without unresolved gap', priority: score.reward };
    const gap = mathPacket && mathPacket.gaps && mathPacket.gaps[0] || null;
    return {
      id: 'seek_missing_structure_' + String(gap && gap.id || 'unknown'),
      action: 'discover_structure',
      reason: gap && gap.reason || 'unresolved input produced pain and gap pressure',
      gap_id: gap && gap.id || 'unknown',
      priority: R(Math.max(score.pain, score.rewardPotential))
    };
  }

  function updateFeeling(state) {
    if (state.pain > state.reward && state.pain > 0.35) state.feeling = 'pain_gap_or_contradiction';
    else if (state.reward > state.pain && state.surprise < 0.35) state.feeling = 'stable_learning';
    else if (state.reward > state.pain) state.feeling = 'curious_learning';
    else state.feeling = 'uncertain';
    state.integrity = R(clamp01(1 - state.pain));
    state.aliveness = R(clamp01((0.28 * state.reward) + (0.22 * state.surprise) + (0.20 * (1 - state.pain)) + (0.15 * (state.attention.length ? 1 : 0)) + (0.15 * (state.memory.observations.length ? 1 : 0))));
    return state;
  }

  function observe(state, raw, options) {
    const st = state || create();
    const opts = options || {};
    const kernel = opts.kernel || K;
    const mathPacket = kernel && typeof kernel.math === 'function'
      ? kernel.math(raw)
      : { ok: false, verified: false, gap_count: 1, gaps: [{ id: 'kernel_unavailable', reason: 'No math kernel available.' }], Ξ: '' };
    const signature = inputSignature(mathPacket);
    const prediction = predict(st.memory, raw, signature);
    const score = scoreObservation(mathPacket, prediction);
    const memoryRow = remember(st.memory, raw, mathPacket, signature, score, prediction);
    const candidate = proposeCandidate(mathPacket, score);
    st.t += 1;
    st.reward = score.reward;
    st.pain = score.pain;
    st.surprise = score.surprise;
    st.attention = attentionFrom(score);
    st.last = { input: String(raw == null ? '' : raw), signature, math: clone(mathPacket), prediction: clone(prediction), score: clone(score), memory: clone(memoryRow), candidate: clone(candidate) };
    updateFeeling(st);
    st.trace.unshift({ t: st.t, input: st.last.input, ok: score.ok, reward: st.reward, pain: st.pain, surprise: st.surprise, attention_top: st.attention[0] && st.attention[0].id, candidate: candidate.id, feeling: st.feeling });
    st.trace = st.trace.slice(0, 128);
    return packet(st);
  }

  function evaluateSelfEdit(state, candidate) {
    const st = state || create();
    const c = candidate || {};
    const testsOk = c.tests_ok === true;
    const validatorsOk = c.validators_ok === true;
    const preservesIdentity = c.preserves_identity !== false;
    const closesGap = c.closes_gap === true || c.closure_gain > 0;
    const introducesContradiction = c.contradiction === true || c.breaks_anchor === true;
    const reward = clamp01((testsOk ? 0.35 : 0) + (validatorsOk ? 0.25 : 0) + (preservesIdentity ? 0.20 : 0) + (closesGap ? 0.20 : 0));
    const pain = clamp01((testsOk ? 0 : 0.25) + (validatorsOk ? 0 : 0.25) + (preservesIdentity ? 0 : 0.25) + (introducesContradiction ? 0.35 : 0));
    const accept = reward > pain && testsOk && validatorsOk && preservesIdentity && !introducesContradiction;
    const row = {
      id: c.id || 'edit_' + checksum(c).slice(0, 8),
      decision: accept ? 'accept_candidate' : 'reject_candidate',
      reward: R(reward),
      pain: R(pain),
      feeling: accept ? 'more_self' : 'less_self',
      reason: accept ? 'candidate improves closure while preserving identity' : 'candidate damages tests, validators, identity, or anchors'
    };
    st.memory.edits.push(row);
    st.memory.edits = st.memory.edits.slice(-128);
    st.reward = row.reward;
    st.pain = row.pain;
    st.surprise = R(accept ? 0.2 : 0.8);
    st.attention = attentionFrom({ hasGap: !accept, contradiction: introducesContradiction ? 1 : 0, novelty: 0.4, surprise: st.surprise, rewardPotential: accept ? 0.3 : 0.8, pain: st.pain });
    st.feeling = row.feeling;
    st.integrity = R(clamp01(1 - st.pain));
    st.aliveness = R(clamp01((0.30 * st.reward) + (0.20 * st.surprise) + (0.25 * st.integrity) + (0.25 * (st.memory.edits.length ? 1 : 0))));
    st.last = { edit: clone(row), candidate: clone(c) };
    st.trace.unshift({ t: st.t, edit: row.id, decision: row.decision, reward: row.reward, pain: row.pain, feeling: row.feeling });
    st.trace = st.trace.slice(0, 128);
    return { packet_type: '42ndMind_cognitive_organism_self_edit_v0_1', version: VERSION, ok: accept, edit: row, state: packet(st), Ξ: '' };
  }

  function packet(state) {
    return {
      packet_type: '42ndMind_cognitive_organism_state_v0_1',
      version: VERSION,
      t: state.t,
      reward: R(state.reward),
      pain: R(state.pain),
      surprise: R(state.surprise),
      integrity: R(state.integrity),
      aliveness: R(state.aliveness),
      feeling: state.feeling,
      attention: clone(state.attention),
      memory_summary: {
        observations: state.memory.observations.length,
        successes: state.memory.successes.length,
        failures: state.memory.failures.length,
        edits: state.memory.edits.length,
        signatures: Object.keys(state.memory.by_signature).length
      },
      last: clone(state.last),
      trace: clone(state.trace),
      χ: ['attention=𝒩(gap⊕contradiction⊕novelty⊕surprise⊕reward_potential⊕integrity)', 'reward=closure_gain+prediction_fit+memory_transfer', 'pain=gap+contradiction+prediction_miss+identity_damage', 'memory updates after every observation', 'Ξ=""'],
      Ξ: ''
    };
  }

  function run(inputs, options) {
    const state = create(options);
    const packets = A(inputs).map(input => observe(state, input, options));
    return { packet_type: '42ndMind_cognitive_organism_run_v0_1', version: VERSION, final: packet(state), packets, Ξ: '' };
  }

  return Object.freeze({ VERSION, create, observe, packet, run, evaluateSelfEdit, normalizeWeights, inputSignature, scoreObservation, attentionFrom });
});
