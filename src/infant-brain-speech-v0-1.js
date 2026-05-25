(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-brain-v0-1.js'));
  else root.FortySecondMindInfantBrainSpeech=factory(root.FortySecondMindInfantBrain);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function currentInput(state){ return String((state.sensory && state.sensory.raw) || '').trim(); }
  function lower(s){ return String(s || '').trim().toLowerCase(); }
  function shortQuote(s){ return JSON.stringify(String(s || '').slice(0,80)); }

  function bestPattern(state){
    const list = A(state.compression && state.compression.candidates);
    return list.length ? list[0] : null;
  }

  function bestBinding(state){
    return A(state.memory && state.memory.meaning_bindings)
      .slice()
      .sort((a,b)=>V(b.stability)-V(a.stability)||V(b.weight)-V(a.weight))[0] || null;
  }

  function greeting(text){
    const t = lower(text).replace(/[^a-z]/g,'');
    return t === 'hi' || t === 'hey' || t === 'hello';
  }

  function repeated(text){
    const s = String(text || '');
    return /(.)\1{2,}/.test(s) || /(.{2,6})\1/.test(s);
  }

  function makeSpeech(state){
    const text = currentInput(state);
    const pattern = bestPattern(state);
    const binding = bestBinding(state);
    const seen = V(state.memory && state.memory.seen_count);

    if(!text) return 'Send me something.';
    if(greeting(text)) return seen <= 1 ? 'Hi.' : 'Hi. I remember this.';
    if(/\?\s*$/.test(text)) return 'I can hold the question, but I cannot answer it yet.';
    if(pattern && pattern.pattern) return 'I found repetition in ' + shortQuote(pattern.pattern) + '.';
    if(binding && binding.surface) return V(binding.stability) >= 0.55 ? 'This is becoming stable: ' + shortQuote(binding.surface) + '.' : 'This is forming: ' + shortQuote(binding.surface) + '.';
    if(repeated(text)) return 'I see repetition, but it is not clean yet.';
    if(text.length <= 3) return 'I heard ' + shortQuote(text) + '. Send more.';
    return 'I heard ' + shortQuote(text) + '. Send another example.';
  }

  function speakBrain(state){
    if(Core.metabolize) Core.metabolize(state);
    if(Core.brainPacket) Core.brainPacket(state);
    const text = makeSpeech(state);
    state.speech_state = {version:'0.2.0',text,raw:currentInput(state),pattern:C(bestPattern(state)),binding:C(bestBinding(state)),generated_from_state:true};
    return text;
  }

  function speakAfterInput(state,text,ticks,depth){
    if(Core.perceiveBrain) Core.perceiveBrain(state,text);
    if(Core.brainLive) Core.brainLive(state, Math.max(1, Number(ticks||10)), Math.max(1, Number(depth||4)));
    return speakBrain(state);
  }

  return Object.freeze(Object.assign({},Core,{BRAIN_SPEECH_VERSION:'0.2.0',speakBrain,speakAfterInput}));
});
