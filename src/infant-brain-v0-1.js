(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-whole-loop-v0-1.js'));
  else root.FortySecondMindInfantBrain=factory(root.FortySecondMindInfantWholeLoop);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function L(field){ return Core.l1(field || [{axis:'empty', weight:1}]); }
  function top(field){ return A(field)[0] || {axis:'none', weight:1}; }

  const ACTIVE_FIELDS = [
    'brain_field',
    'language_field',
    'meaning_binding_field',
    'source_body_field',
    'candidate_source_change_field',
    'sandbox_result_field',
    'attention_field',
    'thought_field',
    'inner_cycle_field',
    'drive_field',
    'expression_field',
    'expression_feedback_field',
    'whole_field'
  ];

  function birthBrain(seed){
    const state = Core.birthWhole ? Core.birthWhole(seed) : Core.birth(seed);
    state.brain_version = '0.1.0';
    ensureBrainFields(state);
    causalField(state);
    metabolize(state);
    state.brain_state = brainState(state, 'born');
    return state;
  }

  function ensureBrainFields(state){
    if(Core.ensureActiveFields) Core.ensureActiveFields(state);
    if(Core.wholeField) Core.wholeField(state);
    if(Core.updateExpressionField) Core.updateExpressionField(state);
    if(Core.expressionSignal) Core.expressionSignal(state);
    if(Core.updateLearnedDrive) Core.updateLearnedDrive(state);
    state.inner_cycle_field = state.inner_cycle_field || Core.normalize([['idle',1]]);
    state.drive_field = state.drive_field || Core.normalize([['idle_drive',1]]);
    state.expression_field = state.expression_field || Core.normalize([['empty_expression',1]]);
    state.expression_feedback_field = state.expression_feedback_field || Core.normalize([['empty_expression_feedback',1]]);
    state.whole_field = state.whole_field || Core.normalize([['empty_whole',1]]);
    return state;
  }

  function unitMap(state){
    const base = Core.wholeUnitMap ? Core.wholeUnitMap(state) : (Core.unitMap ? Core.unitMap(state) : {});
    return Object.assign({}, base, {
      inner_cycle: L(state.inner_cycle_field),
      drive: L(state.drive_field),
      expression: L(state.expression_field),
      expression_feedback: L(state.expression_feedback_field),
      whole: L(state.whole_field),
      causal: L(state.causal_field)
    });
  }

  function allUnit(state){
    const u = unitMap(state);
    return Object.keys(u).every(key => Math.abs(u[key] - 1) < 1e-6);
  }

  function causalField(state){
    ensureBrainFields(state);
    const rows = [];
    ACTIVE_FIELDS.forEach(name => {
      const field = state[name] || [{axis:'empty', weight:1}];
      const t = top(field);
      rows.push({axis:name.replace('_field',''), weight:1});
      rows.push({axis:name.replace('_field','') + ':' + t.axis, weight:Math.max(0.001, Math.abs(V(t.weight)))});
    });
    rows.push({axis:'memory:seen', weight:Math.max(1, V(state.memory && state.memory.seen_count))});
    rows.push({axis:'trace:length', weight:Math.max(1, A(state.trace).length)});
    rows.push({axis:'action:' + ((state.action_packet && state.action_packet.kind) || 'none'), weight:1});
    rows.push({axis:'organism:alive', weight:1});
    state.causal_field = Core.normalize(rows);
    state.causal_l1 = Core.l1(state.causal_field);
    state.causal_state = {
      version:'0.1.0',
      unit:true,
      l1:state.causal_l1,
      focus:top(state.causal_field),
      field_count:ACTIVE_FIELDS.length,
      english:''
    };
    return state.causal_state;
  }

  function mixField(field, causal, localRetain, causalShare, tag){
    const local = A(field).map(row => ({axis:row.axis, weight:V(row.weight) * localRetain}));
    const global = A(causal).map(row => ({axis:'causal:' + tag + ':' + row.axis, weight:V(row.weight) * causalShare}));
    return Core.normalize(local.concat(global));
  }

  function metabolize(state){
    causalField(state);
    ACTIVE_FIELDS.forEach(name => {
      const tag = name.replace('_field','');
      const retain = name === 'brain_field' ? 0.60 : 0.68;
      const share = 1 - retain;
      state[name] = mixField(state[name], state.causal_field, retain, share, tag);
    });
    state.causal_field = mixField(state.causal_field, state.whole_field, 0.72, 0.28, 'causal_from_whole');
    state.causal_l1 = Core.l1(state.causal_field);
    return state;
  }

  function brainTick(state, depth){
    const before = brainState(state, 'before_tick');
    metabolize(state);
    if(Core.feedbackLive) Core.feedbackLive(state, 1, depth || 4);
    else if(Core.wholeLive) Core.wholeLive(state, 1, depth || 4);
    else if(Core.live) Core.live(state, 1, depth || 4);
    metabolize(state);
    if(Core.think) Core.think(state, Math.max(1, Number(depth || 4)));
    if(Core.act) Core.act(state);
    metabolize(state);
    const after = brainState(state, 'after_tick');
    const row = {
      type:'brain_tick',
      before:C(before),
      after:C(after),
      all_unit:allUnit(state),
      causal_focus:top(state.causal_field),
      attention_focus:top(state.attention_field),
      thought_focus:top(state.thought_field),
      brain_focus:top(state.brain_field),
      action:state.action_packet && state.action_packet.kind,
      english:''
    };
    state.trace = A(state.trace);
    state.trace.unshift(row);
    state.trace = state.trace.slice(0,128);
    return row;
  }

  function brainLive(state, ticks, depth){
    const n = Math.max(1, Number(ticks || 1));
    const d = Math.max(1, Number(depth || 4));
    const external = state.time;
    const rows = [];
    for(let i=0;i<n;i++) rows.push(brainTick(state,d));
    state.brain_state = Object.assign({}, brainState(state, 'living'), {
      external_time_preserved: state.time === external,
      ticks:n,
      english:''
    });
    return {state:Core.snapshot(state), rows, brain_state:C(state.brain_state)};
  }

  function perceiveBrain(state, text, options){
    if(Core.perceiveWhole) Core.perceiveWhole(state, text, options || {});
    else if(Core.perceive) Core.perceive(state, text, options || {});
    else Core.step(state, text);
    metabolize(state);
    state.brain_state = brainState(state, 'perceived');
    return Core.snapshot(state);
  }

  function seedBrain(text, ticks, depth){
    const state = birthBrain();
    perceiveBrain(state, text || 'abababab cdcdcdcd abababab cdcdcdcd');
    brainLive(state, ticks || 16, depth || 4);
    return Core.snapshot(state);
  }

  function brainState(state, mode){
    causalField(state);
    return {
      version:'0.1.0',
      mode:mode || 'state',
      unit:unitMap(state),
      all_unit:allUnit(state),
      causal_l1:L(state.causal_field),
      focus:top(state.causal_field),
      active_fields:ACTIVE_FIELDS.slice(),
      language_terms:A(state.memory && state.memory.language_terms).length,
      candidate_meanings:A(state.memory && state.memory.meaning_bindings).length,
      expressions:A(state.expression_library).length,
      action:state.action_packet && state.action_packet.kind,
      english:''
    };
  }

  function hasCausalSignal(field){
    return A(field).some(row => String(row.axis).startsWith('causal:'));
  }

  function causalParticipation(state){
    const out = {};
    ACTIVE_FIELDS.forEach(name => { out[name] = hasCausalSignal(state[name]); });
    out.causal_field = L(state.causal_field) === 1;
    return out;
  }

  function brainPacket(state){
    return {
      mode:'unified_infant_brain_loop',
      brain_state:brainState(state,'packet'),
      causal_participation:causalParticipation(state),
      english:''
    };
  }

  return Object.freeze(Object.assign({},Core,{
    BRAIN_VERSION:'0.1.0',
    ACTIVE_FIELDS,
    birthBrain,
    perceiveBrain,
    brainTick,
    brainLive,
    seedBrain,
    brainState,
    brainPacket,
    causalField,
    metabolize,
    causalParticipation,
    brainUnitMap:unitMap,
    brainAllUnit:allUnit
  }));
});
