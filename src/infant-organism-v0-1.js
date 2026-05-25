(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-drive-learning-v0-1.js'));
  else root.FortySecondMindInfantOrganism=factory(root.FortySecondMindInfantDriveLearning);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function clone(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function arr(x){ return Array.isArray(x) ? x : []; }
  function unit(x){ return Core.l1(x); }

  function birth(seed){
    const state = Core.create(seed);
    state.organism_version = '0.1.0';
    state.organism_state = {
      alive: true,
      external_observations: state.time || 0,
      internal_ticks: state.inner_time || 0,
      mode: 'born',
      english: ''
    };
    return state;
  }

  function unitMap(state){
    return {
      brain: unit(state.brain_field),
      body: unit(state.body && state.body.body_field),
      language: unit(state.language_field),
      candidate_meaning: unit(state.meaning_binding_field),
      source_body: unit(state.source_body_field),
      candidate_source: unit(state.candidate_source_change_field),
      sandbox_result: unit(state.sandbox_result_field),
      attention: unit(state.attention_field),
      thought: unit(state.thought_field),
      inner_cycle: unit(state.inner_cycle_field || [{axis:'idle', weight:1}]),
      drive: unit(state.drive_field || [{axis:'idle', weight:1}])
    };
  }

  function allUnit(state){
    const u = unitMap(state);
    return Object.keys(u).every(key => Math.abs(u[key] - 1) < 1e-6);
  }

  function perceive(state, text, options){
    const opts = options || {};
    Core.step(state, text);
    Core.ensureLearning(state);
    Core.updateLearnedDrive(state);
    state.organism_state = {
      alive: true,
      external_observations: state.time || 0,
      internal_ticks: state.inner_time || 0,
      mode: 'perceived',
      all_unit: allUnit(state),
      unit: unitMap(state),
      action: state.action_packet && state.action_packet.kind,
      drive_focus: state.drive_state && state.drive_state.reason,
      english: ''
    };
    if(opts.inner_ticks){ live(state, opts.inner_ticks, opts.depth || 4); }
    return snapshot(state);
  }

  function live(state, ticks, depth){
    const n = Math.max(1, Number(ticks || 1));
    const d = Math.max(1, Number(depth || 4));
    const externalTime = state.time;
    const rows = [];

    Core.ensureLearning(state);
    for(let i = 0; i < n; i += 1){
      const before = {
        time: state.time,
        inner_time: state.inner_time || 0,
        drive_focus: state.drive_state && state.drive_state.reason,
        action: state.action_packet && state.action_packet.kind,
        units: unitMap(state)
      };

      Core.learningCycle(state, 1, d);

      const after = {
        time: state.time,
        inner_time: state.inner_time || 0,
        drive_focus: state.drive_state && state.drive_state.reason,
        action: state.action_packet && state.action_packet.kind,
        units: unitMap(state),
        reward: state.drive_learning && state.drive_learning.last_reward,
        learned_focus: state.drive_learning && state.drive_learning.last_focus
      };

      const row = {
        type: 'organism_live_tick',
        external_time_preserved: state.time === externalTime,
        before,
        after,
        all_unit: allUnit(state),
        english: ''
      };
      state.trace = arr(state.trace);
      state.trace.unshift(row);
      state.trace = state.trace.slice(0, 128);
      rows.push(row);
    }

    state.organism_state = {
      alive: true,
      external_observations: state.time || 0,
      internal_ticks: state.inner_time || 0,
      mode: 'living',
      external_time_preserved: state.time === externalTime,
      all_unit: allUnit(state),
      unit: unitMap(state),
      action: state.action_packet && state.action_packet.kind,
      drive_focus: state.drive_state && state.drive_state.reason,
      drive_reward: state.drive_learning && state.drive_learning.last_reward,
      language_terms: state.memory && state.memory.language_terms && state.memory.language_terms.length || 0,
      candidate_meanings: state.memory && state.memory.meaning_bindings && state.memory.meaning_bindings.length || 0,
      english: ''
    };

    return {state: snapshot(state), rows};
  }

  function seedAndLive(text, ticks, depth){
    const state = birth();
    perceive(state, text || '', {inner_ticks: 0});
    live(state, ticks || 12, depth || 4);
    return snapshot(state);
  }

  function mathLanguagePacket(state){
    return {
      mode: 'proto_math_language_not_complete',
      complete: false,
      reason_not_complete: 'language terms are still induced from repeated raw patterns and candidate bindings; no final semantic closure exists yet',
      terms: clone((state.memory && state.memory.language_terms) || []),
      candidate_meanings: clone((state.memory && state.memory.meaning_bindings) || []),
      unit: unitMap(state),
      english: ''
    };
  }

  function snapshot(state){ return Core.snapshot(state); }

  return Object.freeze(Object.assign({}, Core, {
    ORGANISM_VERSION: '0.1.0',
    birth,
    perceive,
    live,
    seedAndLive,
    unitMap,
    allUnit,
    mathLanguagePacket
  }));
});
