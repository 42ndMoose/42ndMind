/* 42ndMind Kernel Language Field v0.1
 *
 * Language and neural logic are distinct organs inside one brain.
 * This layer gives language its own unit-total semantic fields, then links those
 * fields into the neural field so meaning growth affects truth, belief, memory,
 * knowledge, and communication.
 *
 * It is not a dictionary-populator. It matures high-value terms and repeated or
 * pressure-bearing terms. Candidate only. No final truth promotion.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const PACKET_TYPE = '42ndMind_kernel_language_field_v0_1';
  const MAX_ROWS = 120;

  function text(v){return String(v ?? '').trim();}
  function lower(v){return text(v).toLowerCase();}
  function arr(v){return Array.isArray(v)?v:[];}
  function now(){return new Date().toISOString();}
  function clamp(n){return Math.max(0,Math.min(1,Number(n)||0));}
  function stateOf(k){return k&&k.state&&(k.state.unifiedCore||k.state);}
  function latestEvent(s){const r=arr(s&&s.runtimeEvents);return r.length?r[r.length-1]:null;}
  function eventText(e){return text(e&&(e.raw_text||e.input||e.text||e.payload&&e.payload.raw_text));}
  function safeId(v){return lower(v).replace(/[^a-z0-9_]+/g,'_').replace(/^_+|_+$/g,'')||'term';}
  function hash(x){let h=2166136261,s=text(x);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
  function id(p,parts){return p+'_'+hash(arr(parts).join('|')).slice(0,12);}
  function uniq(rows,key){const seen=new Set(),out=[];arr(rows).forEach(r=>{const k=key(r);if(!k||seen.has(k))return;seen.add(k);out.push(r);});return out;}

  const SEED_FIELDS = {
    one: [
      ['scoped_whole',0.34],['boundary_of_total',0.18],['subdivision_basis',0.20],['consistency_constraint',0.18],['identity_reference',0.10]
    ],
    language: [
      ['meaning_carrier',0.22],['distinction_system',0.22],['relation_mapping',0.20],['communication_medium',0.18],['truth_tracking_interface',0.18]
    ],
    meaning: [
      ['relation_to_referent',0.26],['use_boundary',0.22],['context_sensitivity',0.18],['neighbor_difference',0.18],['truth_constraint',0.16]
    ],
    intention: [
      ['selected_direction',0.26],['action_structure',0.22],['commitment_pressure',0.18],['desire_channel',0.16],['maturity_constraint',0.18]
    ],
    desire: [
      ['pull_toward_state',0.26],['felt_or_structural_lack',0.17],['action_tendency',0.19],['selection_pressure',0.18],['maturity_constraint',0.20]
    ],
    belief: [
      ['accepted_candidate',0.24],['confidence_weight',0.20],['action_readiness',0.16],['revision_openness',0.20],['truth_gap_visibility',0.20]
    ],
    truth: [
      ['reality_contact',0.30],['non_contradiction_pressure',0.20],['evidence_requirement',0.20],['scope_condition',0.15],['belief_independence',0.15]
    ],
    knowledge: [
      ['structured_understanding',0.26],['justification_link',0.22],['usable_distinction',0.20],['memory_stability',0.16],['truth_contact',0.16]
    ],
    memory: [
      ['stored_context',0.24],['retrieval_usefulness',0.22],['belief_context_link',0.20],['compression_need',0.18],['source_trace',0.16]
    ],
    communication: [
      ['state_expression',0.24],['listener_bridge',0.20],['truth_discipline',0.20],['question_projection',0.16],['meaning_precision',0.20]
    ],
    opinion: [
      ['held_evaluation',0.25],['lower_truth_commitment',0.20],['preference_or_judgment',0.20],['revision_openness',0.20],['scope_marker',0.15]
    ],
    suspicion: [
      ['possible_pattern',0.26],['low_to_mid_confidence',0.22],['evidence_gap',0.22],['watch_pressure',0.16],['non_accusation_constraint',0.14]
    ],
    speculation: [
      ['possibility_generation',0.28],['low_commitment',0.22],['model_exploration',0.20],['evidence_gap',0.18],['truth_boundary',0.12]
    ]
  };

  const NEURAL_TARGETS = {
    language: ['language_math','communication_motor','truth_tracking'],
    meaning: ['language_math','truth_tracking','belief_thought'],
    intention: ['belief_thought','communication_motor','self_improvement'],
    desire: ['self_improvement','belief_thought','question_motor'],
    belief: ['belief_thought','truth_tracking','memory_context'],
    truth: ['truth_tracking','doubt_inhibitor','knowledge_model'],
    knowledge: ['knowledge_model','truth_tracking','memory_context'],
    memory: ['memory_context','belief_thought','knowledge_model'],
    communication: ['communication_motor','language_math','truth_tracking'],
    opinion: ['belief_thought','doubt_inhibitor'],
    suspicion: ['belief_thought','truth_tracking','doubt_inhibitor'],
    speculation: ['belief_thought','language_math','doubt_inhibitor'],
    one: ['core_maturity','language_math','truth_tracking']
  };

  function doctrine(){return{
    language_field_lives_inside_owned_state:true,
    language_and_neural_are_distinct_organs_inside_one_brain:true,
    every_term_field_has_unit_total_one:true,
    language_growth_updates_neural_field:true,
    language_growth_updates_truth_belief_memory_knowledge_and_communication:true,
    does_not_populate_every_word_blindly:true,
    prioritizes_root_terms_repeated_terms_and_pressure_bearing_terms:true,
    meaning_fields_are_candidate_not_doctrine:true,
    no_final_truth_promotion:true,
    truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'
  };}

  function normalizeDims(rows){let total=arr(rows).reduce((s,r)=>s+Math.abs(Number(r.weight)||0),0)||1;let run=0;return arr(rows).map((r,i)=>{let w=i===rows.length-1?Math.max(0,1-run):Math.abs(Number(r.weight)||0)/total;w=Number(w.toFixed(6));run+=w;return{dimension:safeId(r.dimension||r[0]),weight:w,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'};});}

  function makeField(term, dims, source){const tid=safeId(term);const raw=arr(dims).map(d=>Array.isArray(d)?{dimension:d[0],weight:d[1]}:d);const normalized=normalizeDims(raw.length?raw:[['underdefined_reference',1]]);return{
    term_id:tid,term:tid,unit_total:1,field_version:'0.1.0',source:source||'seed_or_candidate',dimensions:normalized,
    l1_total:Number(normalized.reduce((s,d)=>s+Math.abs(Number(d.weight)||0),0).toFixed(6)),
    maturity_score: source==='seed' ? 0.32 : 0.08,
    neighbor_terms:[],neural_targets:NEURAL_TARGETS[tid]||['language_math'],
    status:source==='seed'?'seed_candidate_field':'underdefined_candidate_field',
    truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only',updated_at:now()
  };}

  function ensure(state){if(!state)return null;if(!state.kernelLanguageFieldCore){state.kernelLanguageFieldCore={packet_type:PACKET_TYPE,packet_version:VERSION,created_at:now(),active:true,doctrine:doctrine(),term_fields:{},semantic_relation_graph:[],unit_total_checks:[],language_neural_links:[],language_learning_deltas:[],maturation_log:[],current_language_reading:null,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'};}const c=state.kernelLanguageFieldCore;c.packet_version=VERSION;c.active=true;c.doctrine=Object.assign({},c.doctrine||{},doctrine());c.term_fields=c.term_fields&&typeof c.term_fields==='object'?c.term_fields:{};Object.keys(SEED_FIELDS).forEach(t=>{if(!c.term_fields[t])c.term_fields[t]=makeField(t,SEED_FIELDS[t],'seed');});c.semantic_relation_graph=arr(c.semantic_relation_graph);c.unit_total_checks=arr(c.unit_total_checks);c.language_neural_links=arr(c.language_neural_links);c.language_learning_deltas=arr(c.language_learning_deltas);c.maturation_log=arr(c.maturation_log);c.truth_status='not_final';c.promotion_status='not_promoted_to_final_truth';c.belief_movement='provisional_only';return c;}

  function tokens(raw){return lower(raw).replace(/[^a-z0-9_\s]+/g,' ').split(/\s+/).filter(Boolean);}
  function pressureTerms(raw, core){const ts=tokens(raw);const seedHits=ts.filter(t=>core.term_fields[safeId(t)]);const high=/\b(one|1|unit|total|language|meaning|intention|desire|belief|truth|knowledge|memory|communication|opinion|suspicion|speculation)\b/g;const explicit=[];let m;while((m=high.exec(lower(raw))))explicit.push(safeId(m[1]==='1'?'one':m[1]));return Array.from(new Set(seedHits.concat(explicit))).slice(0,12);}

  function relationType(a,b){if(a===b)return 'self_identity';const pairs=[['desire','intention','desire_can_feed_intention_but_is_not_identical'],['belief','truth','belief_tracks_truth_but_is_not_truth'],['opinion','belief','opinion_has_lower_truth_commitment_than_belief'],['suspicion','belief','suspicion_is_possible_pattern_not_belief'],['speculation','knowledge','speculation_is_exploration_not_knowledge'],['memory','belief','memory_context_informs_belief'],['language','truth','language_mediates_truth_tracking'],['meaning','communication','meaning_precision_improves_communication'],['one','language','unit_total_constrains_language_scope']];const hit=pairs.find(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));return hit?hit[2]:'candidate_semantic_neighbor';}

  function updateRelations(core, terms, raw){const out=[];for(let i=0;i<terms.length;i++){for(let j=i+1;j<terms.length;j++){const a=terms[i],b=terms[j];out.push({relation_id:id('langrel',[a,b,relationType(a,b)]),from_term:a,to_term:b,relation_type:relationType(a,b),distance_candidate:a===b?0:0.5,strength_candidate:0.5,source:'current_input_coactivation',raw_preview:text(raw).slice(0,180),truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only',updated_at:now()});if(core.term_fields[a])core.term_fields[a].neighbor_terms=Array.from(new Set(arr(core.term_fields[a].neighbor_terms).concat([b]))).slice(0,20);if(core.term_fields[b])core.term_fields[b].neighbor_terms=Array.from(new Set(arr(core.term_fields[b].neighbor_terms).concat([a]))).slice(0,20);}}
    core.semantic_relation_graph=uniq(out.concat(core.semantic_relation_graph),r=>r.relation_id).slice(0,MAX_ROWS);return out;}

  function unitChecks(core, terms){const checks=terms.map(t=>{const f=core.term_fields[t];const l1=f?Number(arr(f.dimensions).reduce((s,d)=>s+Math.abs(Number(d.weight)||0),0).toFixed(6)):0;return{check_id:id('unitcheck',[t,l1]),term:t,ok:Math.abs(l1-1)<0.00001,unit_total:l1,dimension_count:f?arr(f.dimensions).length:0,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only',checked_at:now()};});core.unit_total_checks=uniq(checks.concat(core.unit_total_checks),r=>r.check_id).slice(0,MAX_ROWS);return checks;}

  function neuralLinks(core, terms, raw){const links=[];terms.forEach(t=>{const f=core.term_fields[t];arr(f&&f.neural_targets).forEach(target=>links.push({link_id:id('langneural',[t,target,raw]),term:t,target_neuron:target,activation_delta:0.05,reason:'language term coactivated neural target',truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only',created_at:now()}));});core.language_neural_links=uniq(links.concat(core.language_neural_links),r=>r.link_id).slice(0,MAX_ROWS);return links;}

  function learningDeltas(core, terms, raw){const ds=[];terms.forEach(t=>{ds.push({delta_id:id('langdelta',[t,raw]),term:t,delta_kind:'semantic_maturation_pressure',reason:'term appeared in pressure-bearing input and should refine its unit-total field through use',maturity_delta:0.01,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only',created_at:now()});const f=core.term_fields[t];if(f)f.maturity_score=clamp(Number(f.maturity_score||0)+0.01);});core.language_learning_deltas=uniq(ds.concat(core.language_learning_deltas),r=>r.delta_id).slice(0,MAX_ROWS);return ds;}

  function pushIntoNeural(state, links, deltas){const n=state&&state.kernelNeuralFieldCore;if(!n)return; n.language_field_feedback=uniq(arr(links).map(l=>({feedback_id:id('lfb',[l.link_id]),term:l.term,target_neuron:l.target_neuron,activation_delta:l.activation_delta,reason:l.reason,created_at:now(),truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'})).concat(arr(n.language_field_feedback)),r=>r.feedback_id).slice(0,MAX_ROWS);n.learning_deltas=uniq(arr(deltas).map(d=>({delta_id:id('n_from_lang',[d.delta_id]),target:'language_math',delta:0.04,reason:'language field maturation fed neural learning: '+d.term,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only',created_at:now()})).concat(arr(n.learning_deltas)),r=>r.delta_id).slice(0,MAX_ROWS);}

  function buildReading(raw,terms,relations,checks,links){return{reading_id:id('langread',[raw,terms.join('|')]),raw_text:text(raw),active_terms:terms,unit_total_ok:checks.every(c=>c.ok),relation_count:relations.length,neural_link_count:links.length,reading_kind:terms.length?'language_field_maturation':'no_pressure_bearing_language_terms',truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only',created_at:now()};}

  function speak(state, reading){if(!state.communicationCore)state.communicationCore={packet_type:'42ndMind_communication_core_v0_1',message_history:[]};const msg=reading.active_terms.length?('I am maturing language fields for: '+reading.active_terms.join(', ')+'. Each meaning stays unit-total = 1, then feeds neural targets so language can improve truth, belief, memory, knowledge, and communication.'):('I do not see a high-pressure language field to mature yet. I can hold the input as context.');const thought={thought_id:id('langthought',[reading.reading_id,msg]),thought_kind:'language_field_maturation_expression',message:msg,source_pressure:'kernel_language_field_unit_total_and_neural_feedback',priority:0.96,expects_user_reply:false,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'};const c=state.communicationCore;c.current_message=thought;c.message_history=uniq([thought].concat(arr(c.message_history)),r=>r.thought_id).slice(0,MAX_ROWS);c.updated_at=now();c.truth_status='not_final';c.promotion_status='not_promoted_to_final_truth';c.belief_movement='provisional_only';return thought;}

  function step(state,reason){const core=ensure(state);if(!core)return null;const raw=eventText(latestEvent(state));if(!raw)return core;let terms=pressureTerms(raw,core);terms.forEach(t=>{if(!core.term_fields[t])core.term_fields[t]=makeField(t,[['underdefined_reference',0.34],['usage_context',0.24],['neighbor_pressure',0.18],['truth_constraint',0.14],['communication_use',0.10]],'pressure_candidate');});const rels=updateRelations(core,terms,raw);const checks=unitChecks(core,terms);const links=neuralLinks(core,terms,raw);const ds=learningDeltas(core,terms,raw);pushIntoNeural(state,links,ds);const reading=buildReading(raw,terms,rels,checks,links);core.current_language_reading=reading;core.maturation_log=uniq([{log_id:id('lflog',[reading.reading_id,reason]),at:now(),reason:reason||'language_field_step',active_terms:terms,unit_total_ok:reading.unit_total_ok,relation_count:rels.length,neural_link_count:links.length,truth_status:'not_final',promotion_status:'not_promoted_to_final_truth',belief_movement:'provisional_only'}].concat(core.maturation_log),r=>r.log_id).slice(0,MAX_ROWS);core.updated_at=now();speak(state,reading);return core;}

  function patchKernel(){const K=global.EpistemicKernel;if(!K||K.__kernelLanguageFieldPatchApplied)return;const oi=K.prototype.ingest,ot=K.prototype.unifiedTick,os=K.prototype.snapshot;K.prototype.ingest=function(input,meta){const r=oi?oi.call(this,input,meta||{}):undefined;step(stateOf(this),'kernel_ingest_language_field');return r;};if(ot)K.prototype.unifiedTick=function(reason){const r=ot.call(this,reason);step(stateOf(this),reason||'kernel_tick_language_field');return r;};if(os)K.prototype.snapshot=function(){step(stateOf(this),'kernel_snapshot_language_field');return os.call(this);};K.prototype.refreshKernelLanguageField=function(reason){return step(stateOf(this),reason||'kernel_manual_language_field');};K.__kernelLanguageFieldPatchApplied=true;}
  function wrapBrain(brain){if(!brain||brain.__kernelLanguageFieldWrapped)return brain;const oi=brain.ingest,ot=brain.tick,os=brain.snapshot;brain.ingest=function(input,meta){const r=oi?oi.call(brain,input,meta||{}):undefined;step(brain.state,'brain_ingest_language_field');return r;};if(ot)brain.tick=function(reason){const r=ot.call(brain,reason);step(brain.state,reason||'brain_tick_language_field');return r;};if(os)brain.snapshot=function(){step(brain.state,'brain_snapshot_language_field');return os.call(brain);};brain.refreshKernelLanguageField=function(reason){return step(brain.state,reason||'brain_manual_language_field');};brain.__kernelLanguageFieldWrapped=true;return brain;}
  function patchBrain(){const O=global.KernelBrainV04;if(!O||O.__kernelLanguageFieldPatchApplied)return;const W=Object.assign({},O);if(typeof O.createBrain==='function')W.createBrain=function(seed){return wrapBrain(O.createBrain(seed||{}));};if(typeof O.ingest==='function')W.ingest=function(state,input,meta){const r=O.ingest(state,input,meta||{});step(state,'static_ingest_language_field');return r;};if(typeof O.tick==='function')W.tick=function(state,reason){const r=O.tick(state,reason);step(state,reason||'static_tick_language_field');return r;};W.__kernelLanguageFieldPatchApplied=true;global.KernelBrainV04=Object.freeze(W);}
  function patchBridge(){const O=global.KernelBrainEpistemicKernelBridgeV01;if(!O||O.__kernelLanguageFieldPatchApplied)return;const W=Object.assign({},O);if(typeof O.bind==='function')W.bind=function(kernel,opt){const b=O.bind(kernel,opt||{});ensure(b.shared_state);step(b.shared_state,'bridge_bind_language_field');if(b.bound_brain)wrapBrain(b.bound_brain);return b;};W.__kernelLanguageFieldPatchApplied=true;global.KernelBrainEpistemicKernelBridgeV01=Object.freeze(W);}

  patchKernel();patchBrain();patchBridge();
  global.EpistemicKernelLanguageFieldV01=Object.freeze({VERSION,PACKET_TYPE,doctrine,SEED_FIELDS,NEURAL_TARGETS,ensure,makeField,pressureTerms,updateRelations,unitChecks,neuralLinks,learningDeltas,step,wrapBrain,patchKernel,patchBrain,patchBridge});
})(typeof window!=='undefined'?window:globalThis);
