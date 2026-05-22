/* 42ndMind Growth Breather
 * Repeated provisional growth loop over unit-total semantic mappings.
 *
 * This does not edit source files. It changes candidate state values in a loop,
 * records every step, keeps the best provisional state, and can export that best
 * state through GrowthExport for human review.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }
  function clone(v) { return global.FortySecondMindBrainState.clone(v); }
  function clamp01(n) { return global.FortySecondMindBrainState.clamp01(n); }
  function round(n) { return Number((Number(n) || 0).toFixed(6)); }

  function ensure(state) {
    if (!state.growthBreather) state.growthBreather = {
      packet_type: '42ndMind_growth_breather_v0_1',
      packet_version: VERSION,
      doctrine: {
        repeated_provisional_steps: true,
        unit_total_preserved: true,
        best_state_not_auto_committed: true,
        export_requires_growth_export: true
      },
      runs: [],
      steps: [],
      updated_at: now()
    };
    return state.growthBreather;
  }

  function dimensionMap(mapping) {
    const out = {};
    arr(mapping && mapping.dimensions).forEach(row => { out[row.dimension] = Number(row.weight) || 0; });
    return out;
  }

  function fromMap(term, status, map, rationale) {
    const rows = Object.keys(map).map(dimension => ({ dimension, weight: Number(map[dimension]) || 0 }));
    const normalized = global.FortySecondMindBrainState.normalizeUnitTotal(rows);
    return { term, status, dimensions: normalized, rationale: rationale || '', unit_total: 1, l1_total: global.FortySecondMindBrainState.l1Total(normalized) };
  }

  function scoreAgainstTarget(candidate, target) {
    const c = dimensionMap(candidate);
    const t = dimensionMap(target);
    const dims = Array.from(new Set(Object.keys(c).concat(Object.keys(t))));
    const distance = dims.reduce((sum, dim) => sum + Math.abs((c[dim] || 0) - (t[dim] || 0)), 0) / Math.max(1, dims.length);
    return round(clamp01(1 - distance));
  }

  function defaultTarget(term) {
    return fromMap(term || 'discernment', 'target_not_committed', {
      integrated_judgment: 0.28,
      self_correction: 0.22,
      reality_contact: 0.20,
      false_certainty_resistance: 0.14,
      evidence_requirement: 0.09,
      truth_gap_visibility: 0.07
    }, 'Target profile for evidence-aware discernment growth.');
  }

  function activate(state, run, kind, status) {
    if (!global.FortySecondMindSharedSubstrate) return null;
    const activation = global.FortySecondMindSharedSubstrate.activate(state, {
      source_organ: 'growth_breather',
      source_event: run && run.source_event || 'growth_breather_loop',
      kind,
      term: run && run.term || 'growth',
      dimensions: [
        ['provisional_growth_step', 0.3],
        ['unit_total_check', 0.24],
        ['score_feedback', 0.2],
        ['best_state_memory', 0.16],
        ['human_commit_gate', 0.1]
      ],
      status
    });
    return activation && activation.id;
  }

  function startRun(state, spec) {
    const box = ensure(state);
    const term = String(spec && spec.term || 'discernment');
    const initial = clone(spec && spec.initial_state || fromMap(term, 'initial_growth_state', {
      integrated_judgment: 0.36,
      self_correction: 0.28,
      reality_contact: 0.24,
      false_certainty_resistance: 0.12
    }, 'Initial state before breathing growth loop.'));
    const target = clone(spec && spec.target_state || defaultTarget(term));
    const run = {
      id: 'growth_breathing_run_' + (box.runs.length + 1),
      term,
      source_event: spec && spec.source_event || 'growth_breather_loop',
      initial_state: initial,
      target_state: target,
      current_state: clone(initial),
      best_state: clone(initial),
      best_score: scoreAgainstTarget(initial, target),
      iteration: 0,
      learning_rate: Number(spec && spec.learning_rate || 0.18),
      breath_amplitude: Number(spec && spec.breath_amplitude || 0.015),
      status: 'running_provisional_growth',
      shared_substrate_activation_id: null,
      at: now()
    };
    run.shared_substrate_activation_id = activate(state, run, 'growth_breathing_run_started', 'running_provisional_growth');
    box.runs.unshift(run);
    box.runs = box.runs.slice(0, 20);
    box.updated_at = now();
    return run;
  }

  function findRun(box, runId) {
    return arr(box.runs).find(run => run.id === runId) || null;
  }

  function stepRun(state, runId) {
    const box = ensure(state);
    const run = findRun(box, runId);
    if (!run) return null;
    const current = dimensionMap(run.current_state);
    const target = dimensionMap(run.target_state);
    const dims = Array.from(new Set(Object.keys(current).concat(Object.keys(target))));
    const nextMap = {};
    const iteration = run.iteration + 1;
    dims.forEach((dim, index) => {
      const c = current[dim] || 0;
      const t = target[dim] || 0;
      const breath = Math.sin(iteration + index) * run.breath_amplitude;
      nextMap[dim] = Math.max(0, c + (t - c) * run.learning_rate + breath);
    });
    const nextState = fromMap(run.term, 'breathing_growth_candidate_not_committed', nextMap, 'Generated by repeated breathing growth loop.');
    const score = scoreAgainstTarget(nextState, run.target_state);
    const improved = score > run.best_score;
    run.iteration = iteration;
    run.current_state = nextState;
    if (improved) {
      run.best_score = score;
      run.best_state = clone(nextState);
    }
    const step = {
      id: 'growth_breathing_step_' + (box.steps.length + 1),
      run_id: run.id,
      iteration,
      score,
      improved,
      current_state: clone(nextState),
      best_score: run.best_score,
      l1_total: nextState.l1_total,
      unit_total_ok: Math.abs(nextState.l1_total - 1) < 0.00001,
      shared_substrate_activation_id: activate(state, run, improved ? 'growth_breathing_improved_step' : 'growth_breathing_probe_step', improved ? 'best_state_updated_not_committed' : 'probe_state_not_committed'),
      at: now()
    };
    box.steps.unshift(step);
    box.steps = box.steps.slice(0, 200);
    box.updated_at = now();
    return step;
  }

  function exportBest(state, runId) {
    const box = ensure(state);
    const run = findRun(box, runId);
    if (!run || !global.FortySecondMindGrowthExport) return null;
    global.FortySecondMindGrowthExport.ensure(state);
    const candidate = global.FortySecondMindGrowthExport.createCandidate(state, {
      kind: 'breathing_semantic_mapping_growth',
      target_path: 'data/growth-candidates/' + run.term + '-breathing-growth-v0-1.json',
      summary: 'Best provisional ' + run.term + ' state found by breathing growth loop.',
      before_state: run.initial_state,
      after_state: run.best_state,
      expected_effect: 'Export best unit-total mapping found by repeated local growth loop without auto-commit.',
      source_event: run.source_event
    });
    const checks = [
      { name: 'best state has unit total', passed: Math.abs(run.best_state.l1_total - 1) < 0.00001, observed: run.best_state.l1_total },
      { name: 'best score did not regress', passed: run.best_score >= scoreAgainstTarget(run.initial_state, run.target_state), observed: run.best_score },
      { name: 'growth remains provisional', passed: String(run.best_state.status || '').includes('not_committed'), observed: run.best_state.status }
    ];
    const testRecord = global.FortySecondMindGrowthExport.recordTestResult(state, candidate.id, { test_name: 'growth-breather-export-checks', checks });
    const artifact = global.FortySecondMindGrowthExport.createCommitArtifact(state, candidate.id);
    return { run, candidate, testRecord, artifact };
  }

  global.FortySecondMindGrowthBreather = Object.freeze({ VERSION, ensure, startRun, stepRun, exportBest, scoreAgainstTarget, defaultTarget, fromMap });
})(typeof window !== 'undefined' ? window : globalThis);
