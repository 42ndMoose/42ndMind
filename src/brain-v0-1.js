(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-brain-v0-1.js'));
  else root.FortySecondMindBrain=factory(root.FortySecondMindInfantBrain);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function raw(state){ return String((state.sensory && state.sensory.raw) || '').trim(); }
  function q(s){ return JSON.stringify(String(s || '').slice(0,80)); }

  function topPattern(state){
    const list = A(state.compression && state.compression.candidates);
    return list.length ? list[0] : null;
  }

  function topBinding(state){
    return A(state.memory && state.memory.meaning_bindings)
      .slice()
      .sort((a,b)=>V(b.stability)-V(a.stability)||V(b.weight)-V(a.weight))[0] || null;
  }

  function isGreeting(text){
    const t = String(text || '').trim().toLowerCase().replace(/[^a-z]/g,'');
    return t === 'hi' || t === 'hey' || t === 'hello';
  }

  function makeSpeech(state){
    const text = raw(state);
    const pattern = topPattern(state);
    const binding = topBinding(state);
    const seen = V(state.memory && state.memory.seen_count);

    if(!text) return '';
    if(isGreeting(text)) return seen <= 1 ? 'Hi.' : 'Hi again.';
    if(/\?\s*$/.test(text)) return 'I can hold the question, but I cannot answer it yet.';
    if(pattern && pattern.pattern) return 'I found ' + q(pattern.pattern) + ' repeating.';
    if(binding && binding.surface) return 'I am forming ' + q(binding.surface) + '.';
    return 'I heard ' + q(text) + '.';
  }

  function birthBrain(seed){
    return Core.birthBrain ? Core.birthBrain(seed) : Core.create(seed);
  }

  function speakBrain(state){
    if(Core.metabolize) Core.metabolize(state);
    const text = makeSpeech(state);
    state.speech_state = {version:'0.1.0', text, raw:raw(state), pattern:C(topPattern(state)), binding:C(topBinding(state)), from_state:true};
    return text;
  }

  function respondBrain(state, text, ticks, depth){
    if(Core.perceiveBrain) Core.perceiveBrain(state, text);
    else if(Core.step) Core.step(state, text);
    if(Core.brainLive) Core.brainLive(state, Math.max(1,Number(ticks||12)), Math.max(1,Number(depth||4)));
    return speakBrain(state);
  }

  function Brain(seed){
    const state = birthBrain(seed);
    return {
      state,
      say(text){ return respondBrain(state, text); },
      speak(){ return speakBrain(state); },
      packet(){ return Core.brainPacket ? Core.brainPacket(state) : C(state); }
    };
  }

  return Object.freeze(Object.assign({}, Core, {
    PUBLIC_BRAIN_VERSION:'0.1.0',
    Brain,
    birthBrain,
    respondBrain,
    speakBrain
  }));
});
