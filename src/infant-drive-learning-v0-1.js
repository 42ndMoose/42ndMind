(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-drive-v0-1.js'));
  else root.FortySecondMindInfantDriveLearning=factory(root.FortySecondMindInfantDrive);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function clone(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function arr(x){ return Array.isArray(x) ? x : []; }
  function num(x){ return Number(x) || 0; }
  function clamp(x, lo, hi){ return Math.max(lo, Math.min(hi, num(x))); }

  const AXES = [
    'unresolved_error',
    'prediction_gap',
    'low_coverage',
    'compression_opportunity',
    'unstable_binding',
    'comparison_pain',
    'body_tension',
    'action_uncertainty',
    'thought_instability',
    'language_gap',
    'continue_inner_cycle'
  ];

  function ensureLearning(state){
    state.drive_learning = state.drive_learning || {
      enabled: true,
      updates: 0,
      weights: {},
      history: [],
      last_reward: 0,
      last_focus: null
    };
    AXES.forEach(axis => {
      if(state.drive_learning.weights[axis] == null) state.drive_learning.weights[axis] = 1;
    });
    return state.drive_learning;
  }

  function metrics(state){
    const p = state.prediction || {};
    const c = state.compression || {};
    const b = state.binding_state || {};
    const s = state.sandbox_result_state || {};
    const t = state.thought_state || {};
    return {
      error: num(p.error_rate),
      accuracy: num(p.accuracy),
      coverage: num(p.coverage),
      compression: num(c.compression_score),
      binding: num(b.average_stability),
      sandbox_delta: num(s.score_delta),
      sandbox_accepted: s.accepted === true ? 1 : 0,
      thought_stability: num(t.stability),
      unit_health: unitHealth(state)
    };
  }

  function unitHealth(state){
    const fields = [
      state.brain_field,
      state.body && state.body.body_field,
      state.language_field,
      state.meaning_binding_field,
      state.source_body_field,
      state.candidate_source_change_field,
      state.sandbox_result_field,
      state.attention_field,
      state.thought_field,
      state.drive_field || [{axis:'idle', weight:1}]
    ];
    return fields.every(field => Math.abs(Core.l1(field) - 1) < 1e-6) ? 1 : 0;
  }

  function reward(before, after){
    const errorGain = before.error - after.error;
    const accuracyGain = after.accuracy - before.accuracy;
    const coverageGain = after.coverage - before.coverage;
    const compressionGain = after.compression - before.compression;
    const bindingGain = after.binding - before.binding;
    const sandboxGain = after.sandbox_delta - before.sandbox_delta;
    const thoughtGain = after.thought_stability - before.thought_stability;
    const healthPenalty = after.unit_health < 1 ? -1 : 0;
    const sandboxPenalty = after.sandbox_accepted < before.sandbox_accepted ? -0.25 : 0;

    return clamp(
      errorGain * 0.22 +
      accuracyGain * 0.16 +
      coverageGain * 0.08 +
      compressionGain * 0.16 +
      bindingGain * 0.16 +
      sandboxGain * 0.10 +
      thoughtGain * 0.12 +
      healthPenalty +
      sandboxPenalty,
      -1,
      1
    );
  }

  function learnedDriveField(state){
    const learn = ensureLearning(state);
    const base = Core.driveField(state);
    return Core.normalize(base.map(row => {
      const axis = String(row.axis || 'axis');
      const weight = Math.abs(num(row.weight)) * clamp(learn.weights[axis] == null ? 1 : learn.weights[axis], 0.25, 4);
      return {axis, weight};
    }));
  }

  function updateLearnedDrive(state){
    ensureLearning(state);
    state.drive_field = learnedDriveField(state);
    state.drive_l1 = Core.l1(state.drive_field);
    const focus = arr(state.drive_field)[0] || {axis:'none', weight:1};
    state.drive_state = {
      unit: true,
      l1: state.drive_l1,
      focus,
      should_continue: focus.axis !== 'none',
      reason: focus.axis,
      learned: true,
      english: ''
    };
    return state.drive_state;
  }

  function applyReward(state, focusAxis, r){
    const learn = ensureLearning(state);
    const axis = focusAxis || 'continue_inner_cycle';
    if(learn.weights[axis] == null) learn.weights[axis] = 1;

    const oldWeight = learn.weights[axis];
    const nextWeight = clamp(oldWeight * (1 + r * 0.18), 0.25, 4);
    learn.weights[axis] = Number(nextWeight.toFixed(6));
    learn.updates += 1;
    learn.last_reward = Number(r.toFixed(6));
    learn.last_focus = axis;
    learn.history.unshift({
      axis,
      reward: learn.last_reward,
      old_weight: Number(oldWeight.toFixed(6)),
      new_weight: learn.weights[axis],
      at_update: learn.updates
    });
    learn.history = learn.history.slice(0, 64);
    return learn;
  }

  function injectLearnedDrive(state){
    updateLearnedDrive(state);
    state.attention_field = Core.normalize([
      ...(state.attention_field || []).map(row => ({axis: row.axis, weight: row.weight * 0.70})),
      ...state.drive_field.map(row => ({axis: 'learned_drive:' + row.axis, weight: row.weight * 0.30}))
    ]);
    state.thought_field = Core.normalize([
      ...(state.thought_field || []).map(row => ({axis: row.axis, weight: row.weight * 0.74})),
      ...state.drive_field.map(row => ({axis: 'learned_drive:' + row.axis, weight: row.weight * 0.26}))
    ]);
    state.brain_field = Core.normalize([
      ...(state.brain_field || []).map(row => ({axis: row.axis, weight: row.weight * 0.78})),
      ...state.drive_field.map(row => ({axis: 'learned_drive:' + row.axis, weight: row.weight * 0.22}))
    ]);
    return state;
  }

  function learningCycle(state, ticks, depth){
    const rows = [];
    const n = Math.max(1, Number(ticks || 1));
    const d = Math.max(1, Number(depth || 4));
    const externalTime = state.time;
    ensureLearning(state);

    for(let i = 0; i < n; i += 1){
      injectLearnedDrive(state);
      const beforeMetrics = metrics(state);
      const focus = (state.drive_state && state.drive_state.reason) || 'continue_inner_cycle';

      Core.innerCycle(state, 1, d);

      injectLearnedDrive(state);
      const afterMetrics = metrics(state);
      const r = reward(beforeMetrics, afterMetrics);
      const learn = applyReward(state, focus, r);
      updateLearnedDrive(state);

      const row = {
        type: 'drive_learning_cycle',
        external_time: state.time,
        time_preserved: state.time === externalTime,
        focus,
        reward: Number(r.toFixed(6)),
        drive_weight: learn.weights[focus],
        before: beforeMetrics,
        after: afterMetrics,
        action: state.action_packet && state.action_packet.kind,
        units: unitSnapshot(state)
      };
      state.trace = arr(state.trace);
      state.trace.unshift(row);
      state.trace = state.trace.slice(0, 128);
      rows.push(row);
    }

    return {
      state: Core.snapshot(state),
      rows,
      drive_learning: clone(state.drive_learning),
      drive_state: clone(state.drive_state)
    };
  }

  function unitSnapshot(state){
    return {
      brain: Core.l1(state.brain_field),
      body: Core.l1(state.body && state.body.body_field),
      language: Core.l1(state.language_field),
      candidate_meaning: Core.l1(state.meaning_binding_field),
      source_body: Core.l1(state.source_body_field),
      candidate_source: Core.l1(state.candidate_source_change_field),
      sandbox_result: Core.l1(state.sandbox_result_field),
      attention: Core.l1(state.attention_field),
      thought: Core.l1(state.thought_field),
      inner_cycle: Core.l1(state.inner_cycle_field || [{axis:'idle', weight:1}]),
      drive: Core.l1(state.drive_field || [{axis:'idle', weight:1}])
    };
  }

  return Object.freeze(Object.assign({}, Core, {
    DRIVE_LEARNING_VERSION: '0.1.0',
    ensureLearning,
    metrics,
    reward,
    learnedDriveField,
    updateLearnedDrive,
    injectLearnedDrive,
    learningCycle,
    unitSnapshotWithDriveLearning: unitSnapshot
  }));
});
