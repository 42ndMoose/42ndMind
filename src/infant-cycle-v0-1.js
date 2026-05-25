(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-symbolic-kernel.js'));
  else root.FortySecondMindInfantCycle=factory(root.FortySecondMindInfantSymbolicKernel);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function arr(x){ return Array.isArray(x) ? x : []; }
  function clone(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }

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
      inner_cycle: Core.l1(state.inner_cycle_field || [{axis:"idle", weight:1}])
    };
  }

  function cycleField(state){
    return Core.normalize([
      ["attention", 1],
      ["thought", 1],
      ["memory", Math.max(1, (state.memory && state.memory.seen_count) || 0)],
      ["language", Math.max(1, (state.memory && state.memory.language_terms && state.memory.language_terms.length) || 0)],
      ["candidate_meaning", Math.max(1, (state.memory && state.memory.meaning_bindings && state.memory.meaning_bindings.length) || 0)],
      ["source_body", 1],
      ["candidate_source", 1],
      ["sandbox_result", 1],
      ["action", 1]
    ]);
  }

  function runCycle(state, ticks, depth){
    const startingExternalTime = state.time;
    const rows = [];
    const tickCount = Math.max(1, Number(ticks || 1));
    const depthCount = Math.max(1, Number(depth || 4));

    state.inner_time = state.inner_time || 0;
    state.inner_cycle_field = state.inner_cycle_field || Core.normalize([["idle", 1]]);
    state.inner_cycle_state = state.inner_cycle_state || {
      enabled: true,
      ticks: 0,
      uses_new_observation: false,
      time_preserved: true,
      last_action: null,
      last_focus: null
    };

    for (let i = 0; i < tickCount; i += 1) {
      state.inner_time += 1;

      if (Core.updateSourceBody) Core.updateSourceBody(state);
      if (Core.updateCandidateSourceChange) Core.updateCandidateSourceChange(state);
      if (Core.sandboxCompare) Core.sandboxCompare(state, (state.sensory && state.sensory.raw) || "");

      Core.think(state, depthCount);
      Core.act(state);

      state.inner_cycle_field = cycleField(state);
      state.inner_cycle_l1 = Core.l1(state.inner_cycle_field);
      state.inner_cycle_state = {
        enabled: true,
        ticks: state.inner_time,
        uses_new_observation: false,
        time_preserved: state.time === startingExternalTime,
        last_action: state.action_packet && state.action_packet.kind,
        last_focus: state.attention_field && state.attention_field[0]
      };

      const row = {
        type: "inner_cycle",
        inner_time: state.inner_time,
        external_time: state.time,
        unit: unitSnapshot(state),
        action: state.action_packet && state.action_packet.kind,
        focus: state.attention_field && state.attention_field[0],
        selected: state.thought_state && state.thought_state.selected,
        sandbox_result: clone(state.sandbox_result_state)
      };

      state.trace = arr(state.trace);
      state.trace.unshift(row);
      state.trace = state.trace.slice(0, 128);
      rows.push(row);
    }

    return {
      state: Core.snapshot(state),
      rows,
      inner_cycle_state: clone(state.inner_cycle_state)
    };
  }

  return Object.freeze(Object.assign({}, Core, {
    CYCLE_VERSION: "0.1.0",
    runCycle,
    innerCycle: runCycle,
    cycleField,
    unitSnapshot
  }));
});
