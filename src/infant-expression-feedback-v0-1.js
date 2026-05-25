(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-expression-field-v0-1.js'));
  else root.FortySecondMindInfantExpressionFeedback=factory(root.FortySecondMindInfantExpressionField);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';
  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function top(field){ return A(field)[0] || {axis:'none', weight:1}; }

  function expressionSignal(state){
    if(Core.updateExpressionField) Core.updateExpressionField(state);
    const ex = state.expression_state || {count:0, score:0, selected:null};
    const selected = ex.selected || {id:'none', kind:'none', weight:1};
    const countPressure = Math.min(1, V(ex.count) / 64);
    const scorePressure = Math.max(0, Math.min(1, V(ex.score)));
    const selectedWeight = Math.max(0.001, Math.abs(V(selected.weight) || 1));
    const linkPressure = Math.min(1, V(ex.link_count) / 32);
    const basePressure = Math.min(1, V(ex.base_count) / 64);

    state.expression_feedback_field = Core.normalize([
      ['expression_selected', 0.12 + selectedWeight * 0.18],
      ['expression_count', 0.08 + countPressure * 0.16],
      ['expression_score', 0.08 + scorePressure * 0.18],
      ['expression_links', 0.07 + linkPressure * 0.14],
      ['expression_bases', 0.07 + basePressure * 0.12],
      ['expression_to_attention', 0.12],
      ['expression_to_drive', 0.12],
      ['expression_to_thought', 0.12]
    ]);

    state.expression_feedback_l1 = Core.l1(state.expression_feedback_field);
    state.expression_feedback_state = {
      version:'0.1.0',
      unit:true,
      l1:state.expression_feedback_l1,
      selected_expression:selected,
      focus:top(state.expression_feedback_field),
      expression_count:ex.count || 0,
      expression_score:ex.score || 0,
      participates:true,
      english:''
    };
    return state.expression_feedback_state;
  }

  function injectExpression(state){
    expressionSignal(state);
    state.attention_field = Core.normalize([
      ...A(state.attention_field).map(row => ({axis:row.axis, weight:row.weight * 0.68})),
      ...A(state.expression_field).slice(0,12).map(row => ({axis:'expr:'+row.axis, weight:row.weight * 0.18})),
      ...A(state.expression_feedback_field).map(row => ({axis:'expr_feedback:'+row.axis, weight:row.weight * 0.14}))
    ]);
    state.thought_field = Core.normalize([
      ...A(state.thought_field).map(row => ({axis:row.axis, weight:row.weight * 0.70})),
      ...A(state.expression_field).slice(0,12).map(row => ({axis:'expr:'+row.axis, weight:row.weight * 0.16})),
      ...A(state.expression_feedback_field).map(row => ({axis:'expr_feedback:'+row.axis, weight:row.weight * 0.14}))
    ]);
    state.brain_field = Core.normalize([
      ...A(state.brain_field).map(row => ({axis:row.axis, weight:row.weight * 0.76})),
      ...A(state.expression_field).slice(0,16).map(row => ({axis:'expr:'+row.axis, weight:row.weight * 0.12})),
      ...A(state.expression_feedback_field).map(row => ({axis:'expr_feedback:'+row.axis, weight:row.weight * 0.12}))
    ]);
    if(Core.injectLearnedDrive) Core.injectLearnedDrive(state);
    return state;
  }

  function feedbackLive(state,ticks,depth){
    const rows=[];
    const n=Math.max(1,Number(ticks||1));
    const d=Math.max(1,Number(depth||4));
    const external=state.time;
    for(let i=0;i<n;i++){
      const before=expressionSignal(state);
      injectExpression(state);
      Core.live(state,1,d);
      injectExpression(state);
      const after=expressionSignal(state);
      const row={
        type:'expression_feedback_tick',
        external_time_preserved:state.time===external,
        before:C(before),
        after:C(after),
        attention_focus:top(state.attention_field),
        thought_focus:top(state.thought_field),
        brain_focus:top(state.brain_field),
        feedback_l1:Core.l1(state.expression_feedback_field),
        expression_l1:Core.l1(state.expression_field),
        english:''
      };
      state.trace=A(state.trace);state.trace.unshift(row);state.trace=state.trace.slice(0,128);rows.push(row);
    }
    return{state:Core.snapshot(state),rows,expression_feedback_state:C(state.expression_feedback_state)};
  }

  function feedbackPacket(state){
    expressionSignal(state);
    return{
      mode:'expression_feedback_active',
      expression_l1:Core.l1(state.expression_field),
      expression_feedback_l1:Core.l1(state.expression_feedback_field),
      participates:state.expression_feedback_state.participates,
      focus:C(state.expression_feedback_state.focus),
      selected_expression:C(state.expression_feedback_state.selected_expression),
      english:''
    };
  }

  return Object.freeze(Object.assign({},Core,{EXPRESSION_FEEDBACK_VERSION:'0.1.0',expressionSignal,injectExpression,feedbackLive,feedbackPacket}));
});
