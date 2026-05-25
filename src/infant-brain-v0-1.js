(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./infant-whole-loop-v0-1.js'));
  else root.FortySecondMindInfantBrain=factory(root.FortySecondMindInfantWholeLoop);
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';

  function A(x){ return Array.isArray(x) ? x : []; }
  function C(x){ return JSON.parse(JSON.stringify(x == null ? null : x)); }
  function V(x){ return Number(x) || 0; }
  function L(field){ return Core.l1(field || [{axis:'empty', weight:1}]); }
  function top(field){ return A(field)[0] || {axis:'none', weight:1}; }
  function unitField(name){ return [{axis:name || 'unit', weight:1}]; }

  const BRAIN_VERSION = '0.1.1';
  const ACTIVE_FIELDS = [
    'brain_field',
    'language_field',
    'meaning_binding_field',
    'source_body_field',
    'candidate_source_change_field',
    'sandbox_result_field',
    'attention_field',
    'thought_field',
    'inner_cycle_field',
    'drive_field',
    'expression_field',
    'expression_feedback_field',
    'whole_field'
  ];

  function createBase(seed){
    if(Core.create) return Core.create(seed);
    if(Core.birth) return Core.birth(seed);
    return {};
  }

  function ensureField(state, name, fallback){
    state[name] = A(state[name]).length ? Core.normalize(state[name]) : Core.normalize(fallback || unitField(name));
    return state[name];
  }

  function ensureBrainFields(state){
    ensureField(state, 'brain_field', [['brain',1]]);
    ensureField(state, 'language_field', [['empty_language',1]]);
    ensureField(state, 'meaning_binding_field', [['empty_binding',1]]);
    ensureField(state, 'source_body_field', [['source_body',1]]);
    ensureField(state, 'candidate_source_change_field', [['candidate_source',1]]);
    ensureField(state, 'sandbox_result_field', [['sandbox_result',1]]);
    ensureField(state, 'attention_field', [['attention',1]]);
    ensureField(state, 'thought_field', [['thought',1]]);
    ensureField(state, 'inner_cycle_field', [['inner_cycle',1]]);
    ensureField(state, 'drive_field', [['drive',1]]);
    ensureField(state, 'expression_field', [['expression',1]]);
    ensureField(state, 'expression_feedback_field', [['expression_feedback',1]]);
    ensureField(state, 'whole_field', [['whole',1]]);

    if(Core.updateMathLanguage) Core.updateMathLanguage(state);
    if(Core.updateMeaningBindings) Core.updateMeaningBindings(state);
    if(Core.updateSourceBody) Core.updateSourceBody(state);
    if(Core.updateCandidateSourceChange) Core.updateCandidateSourceChange(state);
    if(Core.sandboxCompare) Core.sandboxCompare(state, (state.sensory && state.sensory.raw) || '');
    if(Core.ensureLearning) Core.ensureLearning(state);
    if(Core.updateLearnedDrive) Core.updateLearnedDrive(state);
    if(Core.updateExpressionField) Core.updateExpressionField(state);
    if(Core.expressionSignal) Core.expressionSignal(state);

    ensureField(state, 'inner_cycle_field', [['inner_cycle',1]]);
    ensureField(state, 'drive_field', [['drive',1]]);
    ensureField(state, 'expression_field', [['expression',1]]);
    ensureField(state, 'expression_feedback_field', [['expression_feedback',1]]);
    ensureWholeField(state);
    return state;
  }

  function unitMap(state){
    return {
      brain:L(state.brain_field),
      body:L(state.body && state.body.body_field),
      language:L(state.language_field),
      candidate_meaning:L(state.meaning_binding_field),
      source_body:L(state.source_body_field),
      candidate_source:L(state.candidate_source_change_field),
      sandbox_result:L(state.sandbox_result_field),
      attention:L(state.attention_field),
      thought:L(state.thought_field),
      inner_cycle:L(state.inner_cycle_field),
      drive:L(state.drive_field),
      expression:L(state.expression_field),
      expression_feedback:L(state.expression_feedback_field),
      whole:L(state.whole_field),
      causal:L(state.causal_field)
    };
  }

  function allUnit(state){
    const u = unitMap(state);
    return Object.keys(u).every(key => Math.abs(u[key] - 1) < 1e-6);
  }

  function ensureWholeField(state){
    const rows = [
      ['brain', L(state.brain_field)],
      ['body', L(state.body && state.body.body_field)],
      ['language', L(state.language_field)],
      ['candidate_meaning', L(state.meaning_binding_field)],
      ['source_body', L(state.source_body_field)],
      ['candidate_source', L(state.candidate_source_change_field)],
      ['sandbox_result', L(state.sandbox_result_field)],
      ['attention', L(state.attention_field)],
      ['thought', L(state.thought_field)],
      ['inner_cycle', L(state.inner_cycle_field)],
      ['drive', L(state.drive_field)],
      ['expression', L(state.expression_field)],
      ['expression_feedback', L(state.expression_feedback_field)],
      ['action', state.action_packet && state.action_packet.kind ? 1 : 0.25],
      ['memory', Math.max(1, V(state.memory && state.memory.seen_count))],
      ['trace', Math.max(1, A(state.trace).length)]
    ];
    state.whole_field = Core.normalize(rows.map(row => ({axis:row[0], weight:Math.max(0.001, V(row[1]))})));
    state.whole_l1 = Core.l1(state.whole_field);
    state.whole_state = {
      version:BRAIN_VERSION,
      unit:true,
      l1:state.whole_l1,
      focus:top(state.whole_field),
      english:''
    };
    return state.whole_state;
  }

  function causalField(state){
    const rows = [];
    ACTIVE_FIELDS.forEach(name => {
      const field = A(state[name]).length ? state[name] : unitField(name);
      const t = top(field);
      const shortName = name.replace('_field','');
      rows.push({axis:shortName, weight:1});
      rows.push({axis:shortName + ':' + t.axis, weight:Math.max(0.001, Math.abs(V(t.weight)))});
    });
    rows.push({axis:'memory:seen', weight:Math.max(1, V(state.memory && state.memory.seen_count))});
    rows.push({axis:'trace:length', weight:Math.max(1, A(state.trace).length)});
    rows.push({axis:'action:' + ((state.action_packet && state.action_packet.kind) || 'none'), weight:1});
    rows.push({axis:'organism:alive', weight:1});
    state.causal_field = Core.normalize(rows);
    state.causal_l1 = Core.l1(state.causal_field);
    state.causal_state = {
      version:BRAIN_VERSION,
      unit:true,
      l1:state.causal_l1,
      focus:top(state.causal_field),
      field_count:ACTIVE_FIELDS.length,
      english:''
    };
    return state.causal_state;
  }

  function mixField(field, causal, localRetain, causalShare, tag){
    const local = A(field).map(row => ({axis:row.axis, weight:V(row.weight) * localRetain}));
    const global = A(causal).map(row => ({axis:'causal:' + tag + ':' + row.axis, weight:V(row.weight) * causalShare}));
    return Core.normalize(local.concat(global));
  }

  function metabolize(state){
    ensureBrainFields(state);
    causalField(state);
    ACTIVE_FIELDS.forEach(name => {
      const tag = name.replace('_field','');
      const retain = name === 'brain_field' ? 0.60 : 0.68;
      const share = 1 - retain;
      state[name] = mixField(state[name], state.causal_field, retain, share, tag);
    });
    ensureWholeField(state);
    state.causal_field = mixField(state.causal_field, state.whole_field, 0.72, 0.28, 'causal_from_whole');
    state.causal_l1 = Core.l1(state.causal_field);
    return state;
  }

  function innerWork(state, depth){
    const d = Math.max(1, Number(depth || 4));
    if(Core.learningCycle) Core.learningCycle(state, 1, d);
    else if(Core.driveCycle) Core.driveCycle(state, 1, d);
    else if(Core.innerCycle) Core.innerCycle(state, 1, d);
    else {
      if(Core.think) Core.think(state, d);
      if(Core.act) Core.act(state);
    }
    if(Core.updateExpressionField) Core.updateExpressionField(state);
    if(Core.expressionSignal) Core.expressionSignal(state);
    if(Core.think) Core.think(state, d);
    if(Core.act) Core.act(state);
  }

  function brainTick(state, depth){
    const before = brainState(state, 'before_tick');
    metabolize(state);
    innerWork(state, depth || 4);
    metabolize(state);
    const after = brainState(state, 'after_tick');
    const row = {
      type:'brain_tick',
      before:C(before),
      after:C(after),
      all_unit:allUnit(state),
      causal_focus:top(state.causal_field),
      attention_focus:top(state.attention_field),
      thought_focus:top(state.thought_field),
      brain_focus:top(state.brain_field),
      action:state.action_packet && state.action_packet.kind,
      english:''
    };
    state.trace = A(state.trace);
    state.trace.unshift(row);
    state.trace = state.trace.slice(0,128);
    return row;
  }

  function brainLive(state, ticks, depth){
    const n = Math.max(1, Number(ticks || 1));
    const d = Math.max(1, Number(depth || 4));
    const external = state.time;
    const rows = [];
    for(let i=0;i<n;i++) rows.push(brainTick(state,d));
    state.brain_state = Object.assign({}, brainState(state, 'living'), {
      external_time_preserved: state.time === external,
      ticks:n,
      english:''
    });
    return {state:Core.snapshot(state), rows, brain_state:C(state.brain_state)};
  }

  function birthBrain(seed){
    const state = createBase(seed);
    state.brain_version = BRAIN_VERSION;
    state.trace = A(state.trace);
    ensureBrainFields(state);
    metabolize(state);
    state.brain_state = brainState(state, 'born');
    return state;
  }

  function perceiveBrain(state, text, options){
    if(Core.step) Core.step(state, text, options || {});
    else if(Core.perceive) Core.perceive(state, text, options || {});
    ensureBrainFields(state);
    metabolize(state);
    state.brain_state = brainState(state, 'perceived');
    return Core.snapshot(state);
  }

  function seedBrain(text, ticks, depth){
    const state = birthBrain();
    perceiveBrain(state, text || 'abababab cdcdcdcd abababab cdcdcdcd');
    brainLive(state, ticks || 16, depth || 4);
    return Core.snapshot(state);
  }

  function brainState(state, mode){
    ensureBrainFields(state);
    causalField(state);
    return {
      version:BRAIN_VERSION,
      mode:mode || 'state',
      unit:unitMap(state),
      all_unit:allUnit(state),
      causal_l1:L(state.causal_field),
      focus:top(state.causal_field),
      active_fields:ACTIVE_FIELDS.slice(),
      language_terms:A(state.memory && state.memory.language_terms).length,
      candidate_meanings:A(state.memory && state.memory.meaning_bindings).length,
      expressions:A(state.expression_library).length,
      action:state.action_packet && state.action_packet.kind,
      english:''
    };
  }

  function hasCausalSignal(field){
    return A(field).some(row => String(row.axis).startsWith('causal:'));
  }

  function causalParticipation(state){
    const out = {};
    ACTIVE_FIELDS.forEach(name => { out[name] = hasCausalSignal(state[name]); });
    out.causal_field = L(state.causal_field) === 1;
    return out;
  }

  function brainPacket(state){
    return {
      mode:'unified_infant_brain_loop',
      brain_state:brainState(state,'packet'),
      causal_participation:causalParticipation(state),
      english:''
    };
  }

  return Object.freeze(Object.assign({},Core,{
    BRAIN_VERSION,
    ACTIVE_FIELDS,
    birthBrain,
    perceiveBrain,
    brainTick,
    brainLive,
    seedBrain,
    brainState,
    brainPacket,
    causalField,
    metabolize,
    causalParticipation,
    brainUnitMap:unitMap,
    brainAllUnit:allUnit
  }));
});