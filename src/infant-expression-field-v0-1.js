(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-organism-v0-1.js'));
  else root.FortySecondMindInfantExpressionField=factory(root.FortySecondMindInfantOrganism);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';
  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function I(p,n){ return p + String(n + 1); }

  function baseItems(state){
    const out = [];
    A(state.memory && state.memory.token_library).forEach(t => out.push({id:t.id, kind:'token', refs:[t.pattern], weight:Math.max(1,V(t.gain)||1)}));
    A(state.memory && state.memory.language_terms).forEach(t => out.push({id:t.id, kind:'term', refs:[t.ref], weight:Math.max(1,V(t.weight)||1)}));
    A(state.memory && state.memory.meaning_bindings).forEach(b => out.push({id:b.id, kind:'binding', refs:[b.source,b.term], weight:Math.max(0.001,(V(b.weight)||1)*(0.5+V(b.stability)))}));
    A(state.drive_field).forEach(d => out.push({id:'d_'+d.axis, kind:'drive', refs:[d.axis], weight:Math.max(0.001,Math.abs(V(d.weight)))}));
    return out;
  }

  function linkItems(state){
    const out = [];
    A(state.memory && state.memory.token_relation_graph).forEach(e => out.push({id:'r_'+e.from+'_'+e.to, kind:'link', refs:[e.from,e.to], weight:Math.max(1,V(e.count)||1)}));
    A(state.memory && state.memory.meaning_bindings).forEach(b => out.push({id:'m_'+b.id, kind:'map', refs:[b.source,b.term], weight:Math.max(0.001,V(b.stability)||0.001)}));
    if(state.drive_state && state.action_packet) out.push({id:'da_1', kind:'drive_action', refs:[state.drive_state.reason,state.action_packet.kind], weight:1});
    return out;
  }

  function expressions(state){
    const out = [];
    baseItems(state).slice(0,80).forEach((x,i)=>out.push({id:I('e_base_',i), kind:'base_expr', form:'E('+x.id+')', refs:x.refs, weight:x.weight}));
    linkItems(state).slice(0,80).forEach((x,i)=>out.push({id:I('e_link_',i), kind:'link_expr', form:'L('+x.refs.join(',')+')', refs:x.refs, weight:x.weight}));
    const u = Core.unitMap ? Core.unitMap(state) : {};
    Object.keys(u).forEach((k,i)=>out.push({id:I('e_unit_',i), kind:'unit_expr', form:'U('+k+')=1', refs:[k], weight:Math.max(0.001,V(u[k]))}));
    if(state.sandbox_result_state) out.push({id:'e_compare_1', kind:'compare_expr', form:'C('+V(state.sandbox_result_state.score_delta)+')', refs:['comparison'], weight:0.1+Math.abs(V(state.sandbox_result_state.score_delta))});
    return out;
  }

  function expressionScore(state, expr){
    const e = A(expr);
    const terms = A(state.memory && state.memory.language_terms).length;
    const binds = A(state.memory && state.memory.meaning_bindings).length;
    const links = A(state.memory && state.memory.token_relation_graph).length;
    const unit = Core.allUnit && Core.allUnit(state) ? 1 : 0;
    const survival = Math.min(1,V(state.binding_state && state.binding_state.average_stability));
    const coverage = Math.min(1,e.length/Math.max(1,terms+binds+links+1));
    return Number((coverage*0.34 + survival*0.20 + unit*0.30 + (state.drive_state?0.08:0) + (state.action_packet?0.08:0)).toFixed(6));
  }

  function updateExpressionField(state){
    const expr = expressions(state);
    state.expression_library = expr;
    state.expression_field = expr.length ? Core.normalize(expr.map(x=>({axis:x.id, weight:x.weight}))) : Core.normalize([['empty_expression',1]]);
    state.expression_l1 = Core.l1(state.expression_field);
    state.expression_state = {
      version:'0.1.0',
      unit:true,
      l1:state.expression_l1,
      count:expr.length,
      base_count:baseItems(state).length,
      link_count:linkItems(state).length,
      score:expressionScore(state,expr),
      selected:expr.find(x=>x.id===(state.expression_field[0]&&state.expression_field[0].axis))||null,
      generated_from_state:true,
      english:''
    };
    return state.expression_state;
  }

  function liveExpression(state,ticks,depth){
    const rows=[];
    const n=Math.max(1,Number(ticks||1));
    const external=state.time;
    for(let i=0;i<n;i++){
      const before=updateExpressionField(state);
      Core.live(state,1,depth||4);
      const after=updateExpressionField(state);
      const row={type:'expression_tick',external_time_preserved:state.time===external,before:C(before),after:C(after),count_delta:after.count-before.count,score_delta:Number((after.score-before.score).toFixed(6)),english:''};
      state.trace=A(state.trace);state.trace.unshift(row);state.trace=state.trace.slice(0,128);rows.push(row);
    }
    return{state:Core.snapshot(state),rows,expression_state:C(state.expression_state)};
  }

  function quickRun(text,ticks,depth){
    const s=Core.birth();
    Core.perceive(s,text||'abababab cdcdcdcd abababab cdcdcdcd');
    liveExpression(s,ticks||16,depth||4);
    return Core.snapshot(s);
  }

  function expressionPacket(state){
    updateExpressionField(state);
    return{mode:'state_generated_expression_field',expression_count:state.expression_state.count,base_count:state.expression_state.base_count,link_count:state.expression_state.link_count,score:state.expression_state.score,expression_l1:state.expression_l1,selected:C(state.expression_state.selected),expressions:C(A(state.expression_library).slice(0,80)),english:''};
  }

  return Object.freeze(Object.assign({},Core,{EXPRESSION_FIELD_VERSION:'0.1.0',baseItems,linkItems,expressions,updateExpressionField,liveExpression,quickRun,expressionPacket}));
});
