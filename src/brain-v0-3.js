(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-brain-v0-1.js'), require('./math-language-core-v0-1.js'));
  else root.FortySecondMindBrain=factory(root.FortySecondMindInfantBrain, root.FortySecondMindMathLanguageCore);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core,MathCore){
  'use strict';

  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function textOf(state){ return String((state.sensory && state.sensory.raw) || '').trim(); }
  function normText(s){ return String(s || '').trim().toLowerCase(); }
  function q(s){ return JSON.stringify(String(s || '').slice(0,80)); }

  const BLOCKED_AXES = ['unresolved_error','inquire','prediction_gap','low_coverage','thought_instability','action_uncertainty','comparison_pain','body_tension','language_gap','continue_inner_cycle'];

  function birthBrain(seed){
    const state = Core.birthBrain ? Core.birthBrain(seed) : Core.create(seed);
    state.public_memory = state.public_memory || {facts:{}};
    return state;
  }

  function ensureMemory(state){
    state.public_memory = state.public_memory || {facts:{}};
    state.public_memory.facts = state.public_memory.facts || {};
    return state.public_memory;
  }

  function absorbDirectRelation(state, input){
    const memory = ensureMemory(state);
    const m = String(input || '').match(/^\s*my\s+name\s+is\s+(.+?)\s*\.?\s*$/i);
    if(m){
      const name = m[1].trim();
      if(name){
        memory.facts.user_name = name;
        memory.last_relation = {kind:'identity_binding', subject:'user', predicate:'name', object:name};
      }
    }
    return memory.last_relation || null;
  }

  function directRelationReply(state, input){
    const memory = ensureMemory(state);
    const t = normText(input);
    if(/\bwhat\s+is\s+my\s+name\b/.test(t) || /\bwho\s+am\s+i\b/.test(t)){
      if(memory.facts.user_name) return 'BIND(user.name,' + q(memory.facts.user_name) + ') = 1';
      return '';
    }
    const relation = memory.last_relation;
    if(relation && /^\s*my\s+name\s+is\s+/i.test(input)){
      return 'BIND(user.name,' + q(relation.object) + ') = 1';
    }
    return '';
  }

  function conceptReply(input){
    if(!MathCore || !MathCore.findConcept) return '';
    const hit = MathCore.findConcept(input);
    if(!hit || !hit.concept) return '';
    const c = hit.concept;
    return c.form + '\n' + c.plain;
  }

  function questionReply(state, input){
    const t = normText(input);
    if(/\bwhat\s+are\s+you\b/.test(t) || /\bwho\s+are\s+you\b/.test(t)){
      return 'Brain = one causal field recursively updating memory, attention, expression, and action under unit-total constraint.';
    }
    if(/\bcurrent\s+belief\b/.test(t)){
      const relation = ensureMemory(state).last_relation;
      if(relation) return 'BELIEF(' + relation.subject + '.' + relation.predicate + ',' + q(relation.object) + ') = candidate';
      return '';
    }
    return '';
  }

  function expressionRows(state){
    if(Core.metabolize) Core.metabolize(state);
    if(Core.updateExpressionField) Core.updateExpressionField(state);
    const library = A(state.expression_library);
    const field = A(state.expression_field);
    return field.map(row => {
      const item = library.find(x => x.id === row.axis) || null;
      return {id:row.axis, weight:Math.abs(V(row.weight)), item};
    }).filter(row => {
      if(!row.item || !row.item.form) return false;
      const form = String(row.item.form || '');
      const joined = [form].concat(A(row.item.refs)).join(' ').toLowerCase();
      return !BLOCKED_AXES.some(axis => joined.includes(axis));
    }).sort((a,b)=>{
      const ak = rowKindScore(a.item);
      const bk = rowKindScore(b.item);
      return bk-ak || b.weight-a.weight;
    });
  }

  function rowKindScore(item){
    const kind = String(item && item.kind || '');
    if(kind.includes('binding')) return 5;
    if(kind.includes('link')) return 4;
    if(kind.includes('base')) return 3;
    if(kind.includes('unit')) return 1;
    return 2;
  }

  function expressionReply(state){
    const row = expressionRows(state)[0];
    if(!row || !row.item) return '';
    const form = String(row.item.form || '').trim();
    if(!form) return '';
    const refs = A(row.item.refs).map(String).filter(Boolean).slice(0,4);
    return refs.length ? 'M(' + form + ')\n' + refs.join(' · ') : 'M(' + form + ')';
  }

  function speakBrain(state){
    const input = textOf(state);
    const text = conceptReply(input) || directRelationReply(state,input) || questionReply(state,input) || expressionReply(state) || '';
    state.public_output_state = {version:'0.3.0', text, source:text ? 'semantic_math_language' : 'silent', memory:C(state.public_memory || null)};
    return text;
  }

  function respondBrain(state,input,ticks,depth){
    ensureMemory(state);
    absorbDirectRelation(state,input);
    if(Core.perceiveBrain) Core.perceiveBrain(state,input);
    else if(Core.step) Core.step(state,input);
    if(Core.brainLive) Core.brainLive(state, Math.max(1,Number(ticks||12)), Math.max(1,Number(depth||4)));
    return speakBrain(state);
  }

  function Brain(seed){
    const state = birthBrain(seed);
    return {
      state,
      say(input){ return respondBrain(state,input); },
      speak(){ return speakBrain(state); },
      packet(){ return Core.brainPacket ? Core.brainPacket(state) : C(state); },
      expressions(){ return expressionRows(state); }
    };
  }

  return Object.freeze(Object.assign({},Core,{PUBLIC_BRAIN_VERSION:'0.3.0',Brain,birthBrain,respondBrain,speakBrain,expressionRows}));
});
