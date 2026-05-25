(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-expression-feedback-v0-1.js'));
  else root.FortySecondMindInfantWholeLoop=factory(root.FortySecondMindInfantExpressionFeedback);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function L(state, field){ return Core.l1(field || [{axis:'empty', weight:1}]); }
  function T(field){ return A(field)[0] || {axis:'none', weight:1}; }

  function ensureActiveFields(state){
    if(Core.updateSourceBody) Core.updateSourceBody(state);
    if(Core.updateCandidateSourceChange) Core.updateCandidateSourceChange(state);
    if(Core.sandboxCompare) Core.sandboxCompare(state, (state.sensory && state.sensory.raw) || '');
    if(Core.ensureLearning) Core.ensureLearning(state);
    if(Core.updateLearnedDrive) Core.updateLearnedDrive(state);
    if(Core.updateExpressionField) Core.updateExpressionField(state);
    if(Core.expressionSignal) Core.expressionSignal(state);
    state.inner_cycle_field = state.inner_cycle_field || Core.normalize([['idle',1]]);
    return state;
  }

  function unitMap(state){
    const base = Core.unitMap ? Core.unitMap(state) : {};
    return Object.assign({}, base, {
      inner_cycle: L(state, state.inner_cycle_field),
      drive: L(state, state.drive_field),
      expression: L(state, state.expression_field),
      expression_feedback: L(state, state.expression_feedback_field),
      whole: L(state, state.whole_field)
    });
  }

  function allUnit(state){
    const u = unitMap(state);
    return Object.keys(u).every(key => Math.abs(u[key] - 1) < 1e-6);
  }

  function wholeField(state){
    ensureActiveFields(state);
    const u = unitMap(state);
    const rows = [
      ['brain', u.brain],
      ['body', u.body],
      ['language', u.language],
      ['candidate_meaning', u.candidate_meaning],
      ['source_body', u.source_body],
      ['candidate_source', u.candidate_source],
      ['sandbox_result', u.sandbox_result],
      ['attention', u.attention],
      ['thought', u.thought],
      ['inner_cycle', u.inner_cycle],
      ['drive', u.drive],
      ['expression', u.expression],
      ['expression_feedback', u.expression_feedback],
      ['action', state.action_packet && state.action_packet.kind ? 1 : 0.25],
      ['memory', Math.max(1, V(state.memory && state.memory.seen_count))],
      ['trace', Math.max(1, A(state.trace).length)]
    ];
    state.whole_field = Core.normalize(rows.map(row => ({axis:row[0], weight:Math.max(0.001, V(row[1]))})));
    state.whole_l1 = Core.l1(state.whole_field);
    state.whole_state = {
      version:'0.1.0',
      unit:true,
      l1:state.whole_l1,
      focus:T(state.whole_field),
      all_unit:allUnit(state),
      field_count:Object.keys(u).length,
      participates:true,
      english:''
    };
    return state.whole_state;
  }

  function injectWhole(state){
    wholeField(state);
    if(Core.injectExpression) Core.injectExpression(state);
    if(Core.injectLearnedDrive) Core.injectLearnedDrive(state);

    state.attention_field = Core.normalize([
      ...A(state.attention_field).map(row => ({axis:row.axis, weight:row.weight * 0.62})),
      ...A(state.whole_field).map(row => ({axis:'whole:' + row.axis, weight:row.weight * 0.38}))
    ]);

    state.thought_field = Core.normalize([
      ...A(state.thought_field).map(row => ({axis:row.axis, weight:row.weight * 0.64})),
      ...A(state.whole_field).map(row => ({axis:'whole:' + row.axis, weight:row.weight * 0.36}))
    ]);

    state.brain_field = Core.normalize([
      ...A(state.brain_field).map(row => ({axis:row.axis, weight:row.weight * 0.70})),
      ...A(state.whole_field).map(row => ({axis:'whole:' + row.axis, weight:row.weight * 0.30}))
    ]);

    wholeField(state);
    return state.whole_state;
  }

  function wholeTick(state, depth){
    const before = C(wholeField(state));
    injectWhole(state);
    if(Core.feedbackLive) Core.feedbackLive(state, 1, depth || 4);
    else if(Core.live) Core.live(state, 1, depth || 4);
    injectWhole(state);
    const after = C(wholeField(state));
    const row = {
      type:'whole_tick',
      before,
      after,
      whole_l1:Core.l1(state.whole_field),
      unit:unitMap(state),
      attention_focus:T(state.attention_field),
      thought_focus:T(state.thought_field),
      brain_focus:T(state.brain_field),
      english:''
    };
    state.trace = A(state.trace);
    state.trace.unshift(row);
    state.trace = state.trace.slice(0,128);
    return row;
  }

  function wholeLive(state, ticks, depth){
    const n = Math.max(1, Number(ticks || 1));
    const d = Math.max(1, Number(depth || 4));
    const external = state.time;
    const rows = [];
    for(let i=0;i<n;i++) rows.push(wholeTick(state,d));
    state.whole_state = Object.assign({}, state.whole_state || {}, {
      external_time_preserved: state.time === external,
      ticks: n,
      all_unit: allUnit(state),
      english:''
    });
    return {state:Core.snapshot(state),rows,whole_state:C(state.whole_state)};
  }

  function birthWhole(){
    const state = Core.birth ? Core.birth() : Core.create();
    ensureActiveFields(state);
    wholeField(state);
    return state;
  }

  function perceiveWhole(state,text,options){
    if(Core.perceive) Core.perceive(state,text,options || {});
    else Core.step(state,text);
    injectWhole(state);
    return Core.snapshot(state);
  }

  function packet(state){
    wholeField(state);
    return {
      mode:'whole_organism_causal_loop',
      whole_l1:Core.l1(state.whole_field),
      all_unit:allUnit(state),
      focus:C(state.whole_state.focus),
      unit:unitMap(state),
      participates:state.whole_state.participates,
      english:''
    };
  }

  return Object.freeze(Object.assign({},Core,{
    WHOLE_LOOP_VERSION:'0.1.0',
    ensureActiveFields,
    wholeField,
    injectWhole,
    wholeTick,
    wholeLive,
    birthWhole,
    perceiveWhole,
    wholeUnitMap:unitMap,
    wholeAllUnit:allUnit,
    wholePacket:packet
  }));
});
