(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-brain-v0-1.js'));
  else root.FortySecondMindBrain=factory(root.FortySecondMindInfantBrain);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }

  function birthBrain(seed){
    return Core.birthBrain ? Core.birthBrain(seed) : Core.create(seed);
  }

  function refresh(state){
    if(Core.metabolize) Core.metabolize(state);
    if(Core.updateExpressionField) Core.updateExpressionField(state);
    return state;
  }

  function expressionRows(state){
    refresh(state);
    const library = A(state.expression_library);
    const field = A(state.expression_field);
    return field.map(row => {
      const found = library.find(item => item.id === row.axis) || null;
      return {id:row.axis, weight:Math.abs(V(row.weight)), item:found};
    }).filter(row => row.item && row.item.form).sort((a,b)=>b.weight-a.weight);
  }

  function mathLine(row){
    if(!row || !row.item) return '';
    const form = String(row.item.form || '').trim();
    if(!form) return '';
    const refs = A(row.item.refs).map(String).filter(Boolean).slice(0,4);
    return refs.length ? 'M(' + form + ')\n' + refs.join(' · ') : 'M(' + form + ')';
  }

  function speakBrain(state){
    const rows = expressionRows(state);
    const text = mathLine(rows[0]);
    state.public_output_state = {
      version:'0.2.0',
      text,
      row:C(rows[0] || null),
      output_kind:'math_expression'
    };
    return text;
  }

  function respondBrain(state,text,ticks,depth){
    if(Core.perceiveBrain) Core.perceiveBrain(state,text);
    else if(Core.step) Core.step(state,text);
    if(Core.brainLive) Core.brainLive(state, Math.max(1,Number(ticks||12)), Math.max(1,Number(depth||4)));
    return speakBrain(state);
  }

  function Brain(seed){
    const state = birthBrain(seed);
    return {
      state,
      say(text){ return respondBrain(state,text); },
      speak(){ return speakBrain(state); },
      rows(){ return expressionRows(state); },
      packet(){ return Core.brainPacket ? Core.brainPacket(state) : C(state); }
    };
  }

  return Object.freeze(Object.assign({},Core,{
    PUBLIC_BRAIN_VERSION:'0.2.0',
    Brain,
    birthBrain,
    respondBrain,
    speakBrain,
    expressionRows
  }));
});
