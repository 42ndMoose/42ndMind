(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-cycle-v0-1.js'));
  else root.FortySecondMindInfantDrive=factory(root.FortySecondMindInfantCycle);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function clone(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function arr(x){ return Array.isArray(x) ? x : []; }
  function val(x){ return Number(x) || 0; }
  function first(field){ return arr(field)[0] || {axis:'none', weight:1}; }
  function clamp01(x){ return Math.max(0, Math.min(1, val(x))); }

  function driveField(state){
    const pred = state.prediction || {error_rate:1, coverage:0, accuracy:0};
    const comp = state.compression || {compression_score:0, candidates:[]};
    const bind = state.binding_state || {average_stability:0, survival_ready:false};
    const box = state.sandbox_result_state || {accepted:false, score_delta:0, injury_reason:'not_run'};
    const act = state.action_packet || {kind:'none', pressure:0};
    const thought = state.thought_state || {stability:0, settled:false};

    const unstableBinding = 1 - clamp01(bind.average_stability || 0);
    const unresolvedError = clamp01(pred.error_rate || 0);
    const predictionGap = 1 - clamp01(pred.accuracy || 0);
    const lowCoverage = 1 - clamp01(pred.coverage || 0);
    const compressionOpportunity = clamp01(comp.compression_score || 0) + Math.min(1, arr(comp.candidates).length / 12);
    const comparisonPain = box.accepted ? 0 : 1;
    const bodyTension = Math.abs(1 - Core.l1(state.source_body_field || [{axis:'empty', weight:1}])) + Math.abs(1 - Core.l1(state.sandbox_result_field || [{axis:'empty', weight:1}]));
    const actionUncertainty = 1 - clamp01(act.pressure || 0);
    const thoughtInstability = 1 - clamp01(thought.stability || 0);
    const languageGap = state.memory && state.memory.language_terms && state.memory.language_terms.length ? 0.15 : 1;

    return Core.normalize([
      ['unresolved_error', 0.10 + unresolvedError * 0.22],
      ['prediction_gap', 0.08 + predictionGap * 0.18],
      ['low_coverage', 0.06 + lowCoverage * 0.14],
      ['compression_opportunity', 0.08 + compressionOpportunity * 0.16],
      ['unstable_binding', 0.08 + unstableBinding * 0.18],
      ['comparison_pain', 0.06 + comparisonPain * 0.16],
      ['body_tension', 0.05 + bodyTension * 0.20],
      ['action_uncertainty', 0.06 + actionUncertainty * 0.14],
      ['thought_instability', 0.07 + thoughtInstability * 0.16],
      ['language_gap', 0.05 + languageGap * 0.14],
      ['continue_inner_cycle', 0.10]
    ]);
  }

  function updateDrive(state){
    state.drive_field = driveField(state);
    state.drive_l1 = Core.l1(state.drive_field);
    state.drive_state = {
      unit: true,
      l1: state.drive_l1,
      focus: first(state.drive_field),
      should_continue: first(state.drive_field).axis !== 'none',
      reason: first(state.drive_field).axis,
      english: ''
    };
    return state.drive_state;
  }

  function injectDrive(state){
    updateDrive(state);
    state.attention_field = Core.normalize([
      ...(state.attention_field || []).map(row => ({axis: row.axis, weight: row.weight * 0.72})),
      ...state.drive_field.map(row => ({axis: 'drive:' + row.axis, weight: row.weight * 0.28}))
    ]);
    state.thought_field = Core.normalize([
      ...(state.thought_field || []).map(row => ({axis: row.axis, weight: row.weight * 0.76})),
      ...state.drive_field.map(row => ({axis: 'drive:' + row.axis, weight: row.weight * 0.24}))
    ]);
    state.brain_field = Core.normalize([
      ...(state.brain_field || []).map(row => ({axis: row.axis, weight: row.weight * 0.80})),
      ...state.drive_field.map(row => ({axis: 'drive:' + row.axis, weight: row.weight * 0.20}))
    ]);
    return state;
  }

  function driveCycle(state, ticks, depth){
    const rows = [];
    const n = Math.max(1, Number(ticks || 1));
    const d = Math.max(1, Number(depth || 4));
    const externalTime = state.time;

    for(let i = 0; i < n; i += 1){
      injectDrive(state);
      const before = clone(state.drive_state);
      Core.innerCycle(state, 1, d);
      injectDrive(state);
      const after = clone(state.drive_state);
      const row = {
        type: 'drive_cycle',
        external_time: state.time,
        time_preserved: state.time === externalTime,
        drive_before: before,
        drive_after: after,
        action: state.action_packet && state.action_packet.kind,
        focus: state.attention_field && state.attention_field[0],
        units: unitSnapshot(state)
      };
      state.trace = arr(state.trace);
      state.trace.unshift(row);
      state.trace = state.trace.slice(0, 128);
      rows.push(row);
    }

    return {state: Core.snapshot(state), rows, drive_state: clone(state.drive_state)};
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
    DRIVE_VERSION: '0.1.0',
    driveField,
    updateDrive,
    injectDrive,
    driveCycle,
    unitSnapshotWithDrive: unitSnapshot
  }));
});
