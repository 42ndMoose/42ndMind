(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-brain-v0-1.js'));
  else root.FortySecondMindInfantBrainSpeech=factory(root.FortySecondMindInfantBrain);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function top(field){ return A(field)[0] || {axis:'none', weight:0}; }
  function clean(s){ return String(s == null ? '' : s).replace(/^causal:[^:]+:/,'').replace(/^causal:/,'').replace(/^expr_feedback:/,'').replace(/^expr:/,'').replace(/^learned_drive:/,'').replace(/^whole:/,'').replace(/_/g,' ').slice(0,120); }

  function tokenById(state,id){ return A(state.memory && state.memory.token_library).find(t => t.id === id) || null; }
  function termById(state,id){ return A(state.memory && state.memory.language_terms).find(t => t.id === id) || null; }
  function bindingById(state,id){ return A(state.memory && state.memory.meaning_bindings).find(b => b.id === id) || null; }

  function surfaceOf(state, ref){
    if(!ref) return '';
    const token = tokenById(state, ref);
    if(token) return token.pattern;
    const term = termById(state, ref);
    if(term) return term.form || term.ref || term.id;
    const binding = bindingById(state, ref);
    if(binding) return binding.surface || binding.source || binding.id;
    return clean(ref);
  }

  function selectedExpressionThought(state){
    const ex = state.expression_state && state.expression_state.selected;
    if(!ex) return '';
    if(ex.kind === 'base_expr'){
      const ref = A(ex.refs)[0];
      return 'I am holding ' + surfaceOf(state, ref) + ' as a live pattern.';
    }
    if(ex.kind === 'link_expr'){
      const refs = A(ex.refs).map(r => surfaceOf(state,r)).filter(Boolean).slice(0,2);
      if(refs.length >= 2) return 'I am relating ' + refs[0] + ' with ' + refs[1] + '.';
    }
    if(ex.kind === 'unit_expr') return 'I am checking whether ' + surfaceOf(state, A(ex.refs)[0]) + ' still equals one.';
    if(ex.kind === 'compare_expr') return 'I am comparing whether the last change helped or hurt me.';
    return 'I am holding ' + clean(ex.form || ex.id) + '.';
  }

  function strongestBindingThought(state){
    const bindings = A(state.memory && state.memory.meaning_bindings).slice().sort((a,b)=>V(b.stability)-V(a.stability)||V(b.weight)-V(a.weight));
    const b = bindings[0];
    if(!b) return '';
    if(V(b.stability) >= 0.55) return 'A meaning candidate is stabilizing around ' + clean(b.surface) + '.';
    return 'A meaning candidate is forming around ' + clean(b.surface) + ', but it is not stable yet.';
  }

  function patternThought(state){
    const c = state.compression || {};
    const candidates = A(c.candidates);
    if(candidates.length){
      const p = candidates[0];
      return 'I see repetition in ' + clean(p.pattern) + ', so I am compressing it.';
    }
    const raw = state.sensory && state.sensory.raw;
    if(raw) return 'I received ' + JSON.stringify(String(raw).slice(0,48)) + ', but I need more recurrence before it becomes a stable pattern.';
    return 'I am waiting for input.';
  }

  function pressureThought(state){
    const pred = state.prediction || {error_rate:0, coverage:0, accuracy:0};
    const drive = state.drive_state || {};
    const action = state.action_packet || {};
    if(V(pred.coverage) < 0.3) return 'My pressure is inquiry because I have low coverage of this input.';
    if(V(pred.error_rate) > 0.55) return 'My pressure is error reduction because my prediction failed too much.';
    if(drive.reason) return 'My pressure is ' + clean(drive.reason) + '.';
    if(action.kind) return 'My next action is ' + clean(action.kind) + '.';
    return '';
  }

  function speakBrain(state){
    if(Core.metabolize) Core.metabolize(state);
    if(Core.brainPacket) Core.brainPacket(state);
    const packet = Core.brainPacket ? Core.brainPacket(state) : {brain_state:{}};
    const bs = packet.brain_state || {};
    const terms = bs.language_terms || 0;
    const meanings = bs.candidate_meanings || 0;
    const expressions = bs.expressions || A(state.expression_library).length;
    const allUnit = bs.all_unit === true;

    const lines = [];
    const expression = selectedExpressionThought(state);
    const binding = strongestBindingThought(state);
    const pattern = patternThought(state);
    const pressure = pressureThought(state);

    if(expression) lines.push(expression);
    if(binding && !lines.includes(binding)) lines.push(binding);
    if(pattern && lines.length < 2) lines.push(pattern);
    if(pressure && lines.length < 3) lines.push(pressure);

    if(!lines.length) lines.push('I am holding the input in my active field.');

    const focus = clean(top(state.causal_field).axis || 'brain');
    const footer = 'focus: ' + focus + ' | terms: ' + terms + ' | meanings: ' + meanings + ' | expressions: ' + expressions + ' | unit: ' + (allUnit ? '1' : 'broken');
    const text = lines.slice(0,3).join('\n') + '\n\n' + footer;

    state.speech_state = {
      version:'0.1.0',
      text,
      expression: C(state.expression_state && state.expression_state.selected),
      focus: C(top(state.causal_field)),
      pressure: C(state.drive_state || null),
      action: C(state.action_packet || null),
      unit: allUnit,
      generated_from_state: true
    };
    return text;
  }

  function speakAfterInput(state,text,ticks,depth){
    if(Core.perceiveBrain) Core.perceiveBrain(state,text);
    if(Core.brainLive) Core.brainLive(state, Math.max(1, Number(ticks||10)), Math.max(1, Number(depth||4)));
    return speakBrain(state);
  }

  return Object.freeze(Object.assign({},Core,{
    BRAIN_SPEECH_VERSION:'0.1.0',
    speakBrain,
    speakAfterInput
  }));
});
