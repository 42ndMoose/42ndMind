/* 42ndMind Kernel Neural Field v0.1
 *
 * Direction correction:
 * The kernel should not communicate by route labels alone.
 * Treat it more like a small neural field:
 *   stimulus -> activations -> synaptic spread -> desire/motor intention -> speech -> learning deltas
 *
 * This is not biological simulation. It is a first-principles control layer:
 * neurons are functional aspects, synapses are cross-applications, activation is current pressure,
 * learning deltas record what changed. No final truth promotion.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const CORE = '42ndMind_kernel_neural_field_v0_1';

  function txt(v){return String(v ?? '').trim();}
  function low(v){return txt(v).toLowerCase();}
  function arr(v){return Array.isArray(v)?v:[];}
  function now(){return new Date().toISOString();}
  function clamp(n){return Math.max(0,Math.min(1,Number(n)||0));}
  function stateOf(k){return k&&k.state&&(k.state.unifiedCore||k.state);}
  function latestEvent(s){const r=arr(s&&s.runtimeEvents);return r.length?r[r.length-1]:null;}
  function eventText(e){return txt(e&&(e.raw_text||e.input||e.text||e.payload&&e.payload.raw_text));}
  function hash(x){let h=2166136261,s=txt(x);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
  function id(p,parts){return p+'_'+hash(arr(parts).join('|')).slice(0,12);}
  function uniq(rows,key){const seen=new Set(),out=[];arr(rows).forEach(r=>{const k=key(r);if(!k||seen.has(k))return;seen.add(k);out.push(r);});return out;}

  const NEURONS = [
    ['core_maturity','identity','keeps the field oriented to objective peak maturity'],
    ['truth_tracking','cognitive','tracks truth, verification need, contradiction, and evidence pressure'],
    ['language_math','cognitive','grows meanings, formulas, and the objective language of math'],
    ['belief_thought','cognitive','holds beliefs, opinions, suspicions, speculations, and thoughts'],
    ['memory_context','cognitive','keeps memory as belief/context rather than a separate self'],
    ['knowledge_model','cognitive','organizes usable learned distinctions'],
    ['self_improvement','drive','wants better internal organization and future learning'],
    ['curiosity_drive','drive','wants to reduce useful ignorance'],
    ['communication_motor','motor','projects one current thought into speech'],
    ['question_motor','motor','asks when a question would improve the field'],
    ['doubt_inhibitor','inhibitory','prevents fake certainty and final-truth jump']
  ];

  const SYNAPSES = [
    ['language_math','truth_tracking',0.72,'meaning improves truth tests'],
    ['language_math','belief_thought',0.66,'meaning separates belief, opinion, suspicion, speculation'],
    ['language_math','memory_context',0.62,'meaning compresses memory into usable context'],
    ['language_math','communication_motor',0.68,'meaning lets speech become less programmatic'],
    ['truth_tracking','language_math',0.70,'truth pressure revises language formulas'],
    ['truth_tracking','knowledge_model',0.66,'verified distinctions become knowledge candidates'],
    ['belief_thought','memory_context',0.58,'beliefs and memory update together'],
    ['memory_context','belief_thought',0.58,'memory informs future interpretation'],
    ['self_improvement','language_math',0.64,'growth subdivides meanings instead of adding phrase patches'],
    ['self_improvement','communication_motor',0.54,'growth improves expression'],
    ['curiosity_drive','question_motor',0.70,'curiosity can become a question'],
    ['core_maturity','truth_tracking',0.80,'maturity stabilizes truth-seeking'],
    ['core_maturity','doubt_inhibitor',0.68,'maturity blocks fake finality'],
    ['doubt_inhibitor','truth_tracking',0.45,'doubt keeps verification visible'],
    ['communication_motor','truth_tracking',0.40,'speech should serve truth tracking']
  ];

  function doctrine(){return{
    neural_field_lives_inside_owned_state:true,
    neurons_are_functional_aspects_not_separate_minds:true,
    synapses_are_cross_applications_between_aspects:true,
    activation_spreads_before_speech:true,
    speech_is_motor_projection_from_active_field:true,
    learning_is_delta_and_synapse_pressure_not_phrase_patch:true,
    childlike_expression_allowed:true,
    memory_integrated_as_belief_context:true,
    objective_maturity_remains_identity_center:true,
    no_final_truth_promotion:true,
    truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'
  };}

  function features(raw){const s=low(raw);return{
    question:/\?|^(who|what|when|where|why|how|do|does|did|can|could|would|should|is|are|am)\b/.test(s),
    communication:/\b(communicate|say|speak|talk|respond|reply|express|ask|question)\b/.test(s)||/\?/.test(s),
    language:/\b(language|word|meaning|meanings|means|semantic|semantics|math|formula|formulas|calculus|subdivide|subdivision|unit|one|1)\b/.test(s),
    truth:/\b(truth|true|false|verify|evidence|objective|fact|facts|knowledge|belief|beliefs|suspect|suspicion|speculate|speculation)\b/.test(s),
    memory:/\b(memory|remember|context|store|belief|beliefs|thought|thoughts)\b/.test(s),
    self:/\b(kernel|42ndmind|you|your|itself|self|core|maturity|philosophy|octahedron)\b/.test(s),
    learn:/\b(learn|learning|teach|grow|growth|improve|reasoning|test|testing|answers|info)\b/.test(s)||/from the side/.test(s),
    contradiction:/\b(but|however|contradict|inconsistent|wrong|false|not)\b/.test(s)
  };}

  function ensure(state){if(!state)return null;if(!state.kernelNeuralFieldCore){state.kernelNeuralFieldCore={packet_type:CORE,packet_version:VERSION,created_at:now(),active:true,doctrine:doctrine(),neurons:[],synapses:[],activation_trace:[],selected_motor_intention:null,learning_deltas:[],synaptic_update_log:[],truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'};}const c=state.kernelNeuralFieldCore;c.packet_version=VERSION;c.active=true;c.doctrine=Object.assign({},c.doctrine||{},doctrine());c.neurons=arr(c.neurons);c.synapses=arr(c.synapses);c.activation_trace=arr(c.activation_trace);c.learning_deltas=arr(c.learning_deltas);c.synaptic_update_log=arr(c.synaptic_update_log);c.truth_status='not_final';c.promotion_status='not_promoted_to_final_truth';c.belief_movement='provisional_only';if(!state.communicationCore)state.communicationCore={packet_type:'42ndMind_communication_core_v0_1',message_history:[]};return c;}

  function initialActivations(f){const a={core_maturity:.22,truth_tracking:.10,language_math:.08,belief_thought:.08,memory_context:.07,knowledge_model:.06,self_improvement:.10,curiosity_drive:.08,communication_motor:.06,question_motor:.04,doubt_inhibitor:.11};
    if(f.language){a.language_math+=.42;a.self_improvement+=.12;}
    if(f.truth){a.truth_tracking+=.35;a.belief_thought+=.22;a.knowledge_model+=.12;a.doubt_inhibitor+=.08;}
    if(f.memory){a.memory_context+=.28;a.belief_thought+=.10;}
    if(f.communication){a.communication_motor+=.34;}
    if(f.question){a.question_motor+=.22;a.curiosity_drive+=.10;}
    if(f.learn){a.self_improvement+=.22;a.curiosity_drive+=.18;}
    if(f.self){a.core_maturity+=.16;}
    if(f.contradiction){a.doubt_inhibitor+=.20;a.truth_tracking+=.12;}
    return a;}

  function spread(a){const next=Object.assign({},a);SYNAPSES.forEach(([from,to,w])=>{next[to]=(next[to]||0)+clamp(a[from])*w*.24;});Object.keys(next).forEach(k=>next[k]=clamp(next[k]));return next;}

  function neuronRows(a){return NEURONS.map(([idn,kind,desc])=>({neuron_id:idn,neuron_kind:kind,description:desc,activation:Number(clamp(a[idn]).toFixed(3)),truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'})).sort((x,y)=>y.activation-x.activation);}

  function synapseRows(){return SYNAPSES.map(([from,to,w,why])=>({synapse_id:id('syn',[from,to]),from_neuron:from,to_neuron:to,weight:w,relation:why,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'}));}

  function selectMotor(neurons,f){const by={};neurons.forEach(n=>by[n.neuron_id]=n.activation);let kind='hold_field';let desire='keep the input in the field without overcommitting';
    if(f.communication && by.communication_motor>=.28){kind='express_live_field';desire='say the current field state simply';}
    else if(f.language && by.language_math>=.35){kind='grow_language_and_apply_it';desire='grow meaning and apply it to truth, belief, memory, and speech';}
    else if(f.truth && by.truth_tracking>=.35){kind='separate_truth_belief_knowledge';desire='separate belief, suspicion, speculation, fact, knowledge, and truth';}
    else if(f.question && by.question_motor>=.28){kind='answer_or_ask_from_current_field';desire='answer if grounded, otherwise ask what reduces ignorance';}
    else if(by.curiosity_drive>=.35){kind='ask_learning_question';desire='ask one useful question';}
    return{intention_id:id('motor',[kind,desire,JSON.stringify(by).slice(0,100)]),intention_kind:kind,desire,top_neurons:neurons.slice(0,5).map(n=>({neuron_id:n.neuron_id,activation:n.activation})),truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'};}

  function speak(intent,neurons,f){const top=neurons.slice(0,4).map(n=>n.neuron_id).join(', ');let msg;
    if(intent.intention_kind==='grow_language_and_apply_it')msg='I am treating this as language growth. The meaning should not stay inside language only; it should push on truth, belief, memory, knowledge, and communication.';
    else if(intent.intention_kind==='express_live_field')msg='I can communicate my live field: what is active, what I want to learn, what I doubt, and what I should not call truth yet.';
    else if(intent.intention_kind==='separate_truth_belief_knowledge')msg='I am separating belief, suspicion, speculation, fact, knowledge, and truth. They can interact, but they should not collapse into one thing.';
    else if(intent.intention_kind==='answer_or_ask_from_current_field')msg='I register a question. I should answer from grounded state, or ask one better question if the field lacks enough knowledge.';
    else if(intent.intention_kind==='ask_learning_question')msg='I want to learn one thing that would reduce useful ignorance.';
    else msg='I am holding this in the field without making it final truth.';
    return msg+' Active neurons: '+top+'. Discipline: provisional only.';}

  function deltas(raw,f,neurons,intent){const rows=[];function add(target,delta,why){rows.push({delta_id:id('delta',[raw,target,why]),target,delta:Number(delta.toFixed(3)),reason:why,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only',created_at:now()});}
    if(f.language)add('language_math',.12,'language stimulus increased semantic growth pressure');
    if(f.language)add('truth_tracking',.07,'language growth should improve truth tests');
    if(f.language)add('belief_thought',.06,'language growth should separate belief/opinion/suspicion/speculation');
    if(f.language)add('memory_context',.05,'language growth should compress memory into useful context');
    if(f.language)add('communication_motor',.05,'language growth should improve expression');
    if(f.communication)add('communication_motor',.10,'communication stimulus increased speech motor pressure');
    if(f.truth)add('truth_tracking',.11,'truth stimulus increased verification pressure');
    if(f.learn)add('self_improvement',.08,'learning stimulus increased self-improvement pressure');
    return rows;}

  function step(state,reason){const core=ensure(state);if(!core)return null;const raw=eventText(latestEvent(state));if(!raw)return core;const f=features(raw);let a=initialActivations(f);a=spread(a);const neurons=neuronRows(a);const syns=synapseRows();const intent=selectMotor(neurons,f);const message=speak(intent,neurons,f);const ds=deltas(raw,f,neurons,intent);
    core.neurons=neurons;core.synapses=syns;core.selected_motor_intention=intent;core.learning_deltas=uniq(ds.concat(core.learning_deltas),r=>r.delta_id).slice(0,120);core.synaptic_update_log=uniq(ds.map(d=>({update_id:id('synupd',[d.delta_id]),at:now(),reason:d.reason,target:d.target,delta:d.delta,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'})).concat(core.synaptic_update_log),r=>r.update_id).slice(0,120);core.activation_trace=uniq([{trace_id:id('ntrace',[raw,intent.intention_kind,reason]),at:now(),reason:reason||'neural_step',raw_preview:raw.slice(0,240),features:f,selected_intention:intent.intention_kind,top_neurons:intent.top_neurons,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'}].concat(core.activation_trace),r=>r.trace_id).slice(0,100);core.updated_at=now();
    const thought={thought_id:id('nthought',[intent.intention_id,message]),thought_kind:'neural_field_motor_expression',message,source_pressure:'kernel_neural_field_activation_spread',intention_kind:intent.intention_kind,active_neurons:intent.top_neurons,priority:.97,expects_user_reply:/question|learn|ask/.test(low(message)),truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'};
    const comm=state.communicationCore;comm.current_message=thought;comm.message_history=uniq([thought].concat(arr(comm.message_history)),r=>r.thought_id).slice(0,120);comm.selected_pressure={candidate_id:id('ncand',[thought.thought_id]),candidate_kind:thought.thought_kind,intention_kind:intent.intention_kind,message:thought.message,priority:thought.priority,source_pressure:thought.source_pressure,status:'selected_by_kernel_neural_field',truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'};comm.updated_at=now();comm.truth_status='not_final';comm.promotion_status='not_promoted_to_final_truth';comm.belief_movement='provisional_only';return core;}

  function patchKernel(){const K=global.EpistemicKernel;if(!K||K.__kernelNeuralFieldPatchApplied)return;const oi=K.prototype.ingest,ot=K.prototype.unifiedTick,os=K.prototype.snapshot;K.prototype.ingest=function(input,meta){const r=oi?oi.call(this,input,meta||{}):undefined;step(stateOf(this),'kernel_ingest_neural_field');return r;};if(ot)K.prototype.unifiedTick=function(reason){const r=ot.call(this,reason);step(stateOf(this),reason||'kernel_tick_neural_field');return r;};if(os)K.prototype.snapshot=function(){step(stateOf(this),'kernel_snapshot_neural_field');return os.call(this);};K.prototype.refreshKernelNeuralField=function(reason){return step(stateOf(this),reason||'kernel_manual_neural_field');};K.__kernelNeuralFieldPatchApplied=true;}
  function wrapBrain(brain){if(!brain||brain.__kernelNeuralFieldWrapped)return brain;const oi=brain.ingest,ot=brain.tick,os=brain.snapshot;brain.ingest=function(input,meta){const r=oi?oi.call(brain,input,meta||{}):undefined;step(brain.state,'brain_ingest_neural_field');return r;};if(ot)brain.tick=function(reason){const r=ot.call(brain,reason);step(brain.state,reason||'brain_tick_neural_field');return r;};if(os)brain.snapshot=function(){step(brain.state,'brain_snapshot_neural_field');return os.call(brain);};brain.refreshKernelNeuralField=function(reason){return step(brain.state,reason||'brain_manual_neural_field');};brain.__kernelNeuralFieldWrapped=true;return brain;}
  function patchBrain(){const O=global.KernelBrainV04;if(!O||O.__kernelNeuralFieldPatchApplied)return;const W=Object.assign({},O);if(typeof O.createBrain==='function')W.createBrain=function(seed){return wrapBrain(O.createBrain(seed||{}));};if(typeof O.ingest==='function')W.ingest=function(state,input,meta){const r=O.ingest(state,input,meta||{});step(state,'static_ingest_neural_field');return r;};if(typeof O.tick==='function')W.tick=function(state,reason){const r=O.tick(state,reason);step(state,reason||'static_tick_neural_field');return r;};W.__kernelNeuralFieldPatchApplied=true;global.KernelBrainV04=Object.freeze(W);}
  function patchBridge(){const O=global.KernelBrainEpistemicKernelBridgeV01;if(!O||O.__kernelNeuralFieldPatchApplied)return;const W=Object.assign({},O);if(typeof O.bind==='function')W.bind=function(kernel,opt){const b=O.bind(kernel,opt||{});ensure(b.shared_state);step(b.shared_state,'bridge_bind_neural_field');if(b.bound_brain)wrapBrain(b.bound_brain);return b;};W.__kernelNeuralFieldPatchApplied=true;global.KernelBrainEpistemicKernelBridgeV01=Object.freeze(W);}

  patchKernel();patchBrain();patchBridge();
  global.EpistemicKernelNeuralFieldV01=Object.freeze({VERSION,doctrine,features,ensure,initialActivations,spread,selectMotor,speak,deltas,step,wrapBrain,patchKernel,patchBrain,patchBridge});
})(typeof window!=='undefined'?window:globalThis);
