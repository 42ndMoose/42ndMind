/* 42ndMind Infant Symbolic Kernel v0.4
 * brain = 1; language = 1.
 * Raw stream -> compression -> prediction/error -> memory -> token relations
 * -> internal math language -> recurrent thought -> symbolic action.
 */
(function(root,factory){
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FortySecondMindInfantSymbolicKernel = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function(){
  "use strict";
  const VERSION = "0.4.0-math-language";
  const EPS = 1e-6;
  const now = () => new Date().toISOString();
  const round = n => Number((Number(n)||0).toFixed(6));
  const arr = v => Array.isArray(v) ? v : [];
  const clone = v => JSON.parse(JSON.stringify(v == null ? null : v));

  function l1(field){ return round(arr(field).reduce((s,r)=>s+Math.abs(Number(r.weight)||0),0)); }
  function normalize(field){
    const clean = arr(field).map(r=>({
      axis:String(r.axis || r[0] || "").trim() || "axis",
      weight:Number(r.weight == null ? r[1] : r.weight) || 0
    })).filter(r=>r.axis && r.weight !== 0);
    if (!clean.length) return [{axis:"null", weight:1}];
    const total = clean.reduce((s,r)=>s+Math.abs(r.weight),0) || 1;
    let running = 0;
    return clean.map((r,i)=>{
      const sign = r.weight < 0 ? -1 : 1;
      const mag = i === clean.length-1 ? Math.max(0,1-running) : Math.abs(r.weight)/total;
      const weight = round(sign*mag);
      running = round(running + Math.abs(weight));
      return {axis:r.axis, weight};
    });
  }
  function mapField(field){ const out={}; arr(field).forEach(r=>{ out[r.axis]=Number(r.weight)||0; }); return out; }
  function blend(a,b,aw,bw){
    const am=mapField(a), bm=mapField(b), out={};
    Array.from(new Set(Object.keys(am).concat(Object.keys(bm)))).forEach(k=>{ out[k]=(am[k]||0)*aw+(bm[k]||0)*bw; });
    return normalize(Object.keys(out).map(axis=>({axis, weight:out[axis]})));
  }
  function distance(a,b){
    const am=mapField(a), bm=mapField(b), keys=Array.from(new Set(Object.keys(am).concat(Object.keys(bm))));
    return round(keys.reduce((s,k)=>s+Math.abs((am[k]||0)-(bm[k]||0)),0));
  }
  function checksum(value){
    const text = typeof value === "string" ? value : JSON.stringify(value || null);
    let hash=2166136261;
    for(let i=0;i<text.length;i++){ hash ^= text.charCodeAt(i); hash += (hash<<1)+(hash<<4)+(hash<<7)+(hash<<8)+(hash<<24); }
    return (hash>>>0).toString(16).padStart(8,"0");
  }

  function createBody(seed){
    const body = {
      type:"infant_runtime_body_v0_4",
      generation:0,
      direct_source_write_enabled:false,
      english_output_enabled:false,
      params:Object.assign({
        max_ngram:4, min_repeat:2, prediction_order:1, mutation_rate:0.08,
        injury_tolerance:0.02, max_tokens:128, max_relations:256,
        thought_cycles:6, settle_threshold:0.82, max_language_terms:256
      }, seed && seed.params || {}),
      body_field:normalize(seed && seed.body_field || [
        ["sense",.10],["pattern",.10],["compress",.10],["predict",.10],["error",.09],
        ["memory",.09],["relate",.09],["language",.11],["attend",.09],["settle",.06],
        ["mutate",.04],["act",.03]
      ])
    };
    body.checksum = checksum({generation:body.generation, params:body.params, body_field:body.body_field});
    return body;
  }

  function create(seed){
    const state = {
      packet_type:"42ndMind_infant_symbolic_kernel_v0_4",
      version:VERSION,
      doctrine:{
        brain_equals_one:true, language_equals_one:true, no_semantic_label_learning_layer:true,
        raw_stream_first:true, compression_before_language:true,
        token_relations_before_english:true, recurrent_attention_before_speech:true,
        math_language_before_english:true, english_output_disabled:true, direct_source_write:false
      },
      time:0,
      brain_field:normalize(seed && seed.brain_field || [
        ["sense",.12],["pattern",.10],["compress",.10],["predict",.09],["error",.09],
        ["memory",.09],["relate",.09],["language",.12],["attend",.09],["settle",.05],
        ["mutate",.03],["act",.03]
      ]),
      body:createBody(seed && seed.body),
      memory:{
        seen_count:0, symbol_counts:{}, transition_counts:{}, ngram_counts:{},
        token_library:[], token_index:{}, relation_counts:{}, token_relation_graph:[],
        language_terms:[], language_index:{}, expression_counts:{}
      },
      sensory:null, prediction:null, compression:null, error:null,
      attention_field:normalize([["null",1]]),
      thought_field:normalize([["idle",1]]),
      language_field:normalize([["empty_language",1]]),
      language_state:{term_count:0, expression_count:0, selected:null, stable:false},
      thought_state:{cycle_count:0, stability:0, settled:false, selected:null, candidates:[]},
      candidate_body:null, candidate_test:null, internal_math_packet:null,
      injury_register:[], action_packet:{enabled:true, kind:"none", symbols:[], english:""},
      english_expression_channel:{enabled:false, content:""},
      trace:[], updated_at:now()
    };
    enforceOne(state);
    updateMathLanguage(state);
    updateInternalMathPacket(state);
    return state;
  }

  function enforceOne(state){
    state.brain_field = normalize(state.brain_field);
    state.body.body_field = normalize(state.body.body_field);
    state.attention_field = normalize(state.attention_field);
    state.thought_field = normalize(state.thought_field);
    state.language_field = normalize(state.language_field);
    state.brain_l1 = l1(state.brain_field);
    state.body_l1 = l1(state.body.body_field);
    state.attention_l1 = l1(state.attention_field);
    state.thought_l1 = l1(state.thought_field);
    state.language_l1 = l1(state.language_field);
    return Math.abs(state.brain_l1-1)<EPS && Math.abs(state.body_l1-1)<EPS &&
      Math.abs(state.attention_l1-1)<EPS && Math.abs(state.thought_l1-1)<EPS &&
      Math.abs(state.language_l1-1)<EPS;
  }

  function sense(text){
    const raw = String(text == null ? "" : text), symbols = Array.from(raw), symbol_counts = {};
    symbols.forEach(ch=>{ symbol_counts[ch]=(symbol_counts[ch]||0)+1; });
    return {raw, symbols, length:symbols.length, distinct:Object.keys(symbol_counts).length, symbol_counts, checksum:checksum(raw)};
  }
  function ngrams(symbols,max){
    const counts={}, limit=Math.max(1, Number(max)||1);
    for(let n=1;n<=limit;n++) for(let i=0;i<=symbols.length-n;i++){
      const key=symbols.slice(i,i+n).join(""); counts[key]=(counts[key]||0)+1;
    }
    return counts;
  }
  function predict(memory,symbols,order){
    const n=Math.max(1,Number(order)||1); let possible=Math.max(0,symbols.length-1), attempted=0, correct=0; const misses=[];
    for(let i=1;i<symbols.length;i++){
      const ctx=symbols.slice(Math.max(0,i-n),i).join(""), opts=memory.transition_counts[ctx]||{};
      const ranked=Object.keys(opts).sort((a,b)=>opts[b]-opts[a]);
      if(!ranked.length){ misses.push({i,context:ctx,expected:symbols[i],predicted:null}); continue; }
      attempted++; if(ranked[0]===symbols[i]) correct++; else misses.push({i,context:ctx,expected:symbols[i],predicted:ranked[0]});
    }
    return {possible, attempted, correct, accuracy:possible?round(correct/possible):1, coverage:possible?round(attempted/possible):1, error_rate:possible?round(1-correct/possible):0, misses:misses.slice(0,24)};
  }
  function compress(ngram_counts,body){
    const min=Math.max(2,Number(body.params.min_repeat)||2);
    return Object.keys(ngram_counts).map(pattern=>({pattern,count:ngram_counts[pattern],length:Array.from(pattern).length}))
      .filter(x=>x.length>1 && x.count>=min)
      .map(x=>Object.assign(x,{gain:(x.length-1)*(x.count-1)}))
      .filter(x=>x.gain>0)
      .sort((a,b)=>b.gain-a.gain || b.length-a.length || a.pattern.localeCompare(b.pattern));
  }
  function evaluateTextWithBody(state,text,body){
    const sensory=sense(text);
    const prediction=predict(state.memory,sensory.symbols,Math.max(1,body.params.prediction_order||1));
    const candidates=compress(ngrams(sensory.symbols,body.params.max_ngram),body);
    const gain=candidates.reduce((s,x)=>s+x.gain,0);
    const compression_score=sensory.length?Math.min(1,gain/Math.max(1,sensory.length*2)):0;
    const stable=(Math.abs(l1(body.body_field)-1)<EPS && body.direct_source_write_enabled===false && body.english_output_enabled===false)?1:0;
    const lang=Math.min(1,(state.memory.language_terms||[]).length/16);
    const thought=Math.min(1,state.thought_state.stability||0);
    return {sensory,prediction,compression:{candidates,gain,compression_score:round(compression_score)},
      score:round(prediction.accuracy*.32 + prediction.coverage*.09 + compression_score*.20 + stable*.11 + lang*.14 + thought*.14),
      stable};
  }

  function remember(memory,sensory,body,compression){
    memory.seen_count++;
    Object.keys(sensory.symbol_counts).forEach(k=>{ memory.symbol_counts[k]=(memory.symbol_counts[k]||0)+sensory.symbol_counts[k]; });
    const order=Math.max(1,body.params.prediction_order||1);
    for(let n=1;n<=order;n++) for(let i=n;i<sensory.symbols.length;i++){
      const ctx=sensory.symbols.slice(i-n,i).join(""), next=sensory.symbols[i];
      memory.transition_counts[ctx]=memory.transition_counts[ctx]||{};
      memory.transition_counts[ctx][next]=(memory.transition_counts[ctx][next]||0)+1;
    }
    const counts=ngrams(sensory.symbols,body.params.max_ngram);
    Object.keys(counts).forEach(k=>{ memory.ngram_counts[k]=(memory.ngram_counts[k]||0)+counts[k]; });
    compression.candidates.slice(0,12).forEach(c=>{
      if(!memory.token_index[c.pattern] && memory.token_library.length<body.params.max_tokens){
        const token={id:"τ"+(memory.token_library.length+1), pattern:c.pattern, length:c.length, count:c.count, gain:c.gain, birth:memory.seen_count};
        memory.token_index[c.pattern]=token.id; memory.token_library.push(token);
      }
    });
    updateTokenRelations(memory,compression,sensory,body);
  }

  function pairKey(a,b){ return a<b ? a+"|"+b : b+"|"+a; }
  function tokenForPattern(memory,pattern){ return memory.token_library.find(t=>t.pattern===pattern) || null; }
  function updateTokenRelations(memory,compression,sensory,body){
    const active=compression.candidates.map(c=>tokenForPattern(memory,c.pattern)).filter(Boolean).slice(0,12);
    for(let i=0;i<active.length;i++) for(let j=i+1;j<active.length;j++){
      const a=active[i], b=active[j], key=pairKey(a.id,b.id);
      const overlap=a.pattern.includes(b.pattern)||b.pattern.includes(a.pattern)?1:0;
      const near=sensory.raw.indexOf(a.pattern)>=0 && sensory.raw.indexOf(b.pattern)>=0 ? 1 : 0;
      memory.relation_counts[key]=(memory.relation_counts[key]||0)+1+overlap+near;
    }
    memory.token_relation_graph=Object.keys(memory.relation_counts).map(key=>{
      const p=key.split("|"); return {from:p[0], to:p[1], count:memory.relation_counts[key]};
    }).sort((a,b)=>b.count-a.count || a.from.localeCompare(b.from)||a.to.localeCompare(b.to)).slice(0,body.params.max_relations);
  }

  function tokenUnitField(memory){ return normalize(memory.token_library.map(t=>({axis:t.id, weight:Math.max(1,Number(t.gain)||1)}))); }
  function relationUnitField(memory){ return normalize(memory.token_relation_graph.map(e=>({axis:e.from+"↔"+e.to, weight:Math.max(1,Number(e.count)||1)}))); }

  function updateMathLanguage(state){
    const memory=state.memory;
    const terms=[];
    memory.token_library.forEach(token=>{
      terms.push({id:"λ"+(terms.length+1), kind:"token", ref:token.id, form:"λ("+token.id+")", weight:Math.max(1,token.gain||1)});
    });
    memory.token_relation_graph.forEach(edge=>{
      terms.push({id:"λ"+(terms.length+1), kind:"relation", ref:edge.from+"↔"+edge.to, form:"λ("+edge.from+"↔"+edge.to+")", weight:Math.max(1,edge.count||1)});
    });
    const limited=terms.slice(0, state.body.params.max_language_terms);
    memory.language_terms=limited.map(term=>({id:term.id, kind:term.kind, ref:term.ref, form:term.form, weight:term.weight}));
    memory.language_index={}; memory.language_terms.forEach(term=>{ memory.language_index[term.ref]=term.id; });
    state.language_field = memory.language_terms.length
      ? normalize(memory.language_terms.map(term=>({axis:term.id, weight:term.weight})))
      : normalize([["empty_language",1]]);
    const top=state.language_field[0] || {axis:"empty_language", weight:1};
    const selected = memory.language_terms.find(term=>term.id===top.axis) || null;
    state.language_state = {
      term_count:memory.language_terms.length,
      expression_count:memory.token_relation_graph.length,
      selected:selected,
      stable:memory.language_terms.length>0 && Math.abs(l1(state.language_field)-1)<EPS
    };
    return state.language_state;
  }

  function updateInternalMathPacket(state){
    updateMathLanguage(state);
    state.internal_math_packet = {
      packet_type:"infant_internal_math_packet_v0_4",
      mode:"math_language_unit_field_not_english",
      expressions:[
        "brain=1",
        "language=1",
        "Σ|brain.pressure|=1",
        "Σ|language.term|=1",
        "τ_i = compressed repeatable raw-symbol pattern",
        "ρ_ij = relation(τ_i,τ_j) from shared compression pressure",
        "λ_k = internal math-language term from τ or ρ",
        "A(t)=N(tokens + relations + language + error + prediction)",
        "Θ(t+1)=N(A(t)+Θ(t)+candidate_action_pressure)",
        "R = selected symbolic action; English=∅"
      ],
      token_count:state.memory.token_library.length,
      relation_count:state.memory.token_relation_graph.length,
      language_term_count:state.memory.language_terms.length,
      token_unit_field:state.memory.token_library.length ? tokenUnitField(state.memory) : [],
      relation_unit_field:state.memory.token_relation_graph.length ? relationUnitField(state.memory) : [],
      language_field:state.language_field,
      attention_field:state.attention_field,
      thought_field:state.thought_field,
      language_state:state.language_state,
      thought_state:state.thought_state,
      token_l1:state.memory.token_library.length ? l1(tokenUnitField(state.memory)) : 0,
      relation_l1:state.memory.token_relation_graph.length ? l1(relationUnitField(state.memory)) : 0,
      language_l1:l1(state.language_field),
      attention_l1:l1(state.attention_field),
      thought_l1:l1(state.thought_field),
      at:now()
    };
    return state.internal_math_packet;
  }

  function attentionPressure(state){
    const f=[], memory=state.memory, p=state.prediction || {accuracy:0,coverage:0,error_rate:1}, c=state.compression || {candidates:[]};
    c.candidates.slice(0,8).forEach(cand=>{ const t=tokenForPattern(memory,cand.pattern); if(t) f.push({axis:t.id,weight:.10+Math.min(1,cand.gain/12)*.16}); });
    memory.token_relation_graph.slice(0,8).forEach(edge=>f.push({axis:edge.from+"↔"+edge.to,weight:.08+Math.min(1,edge.count/18)*.14}));
    memory.language_terms.slice(0,8).forEach(term=>f.push({axis:term.id, weight:.08+Math.min(1,term.weight/18)*.18}));
    f.push({axis:"error",weight:.05+p.error_rate*.20});
    f.push({axis:"predict",weight:.05+p.accuracy*.18});
    f.push({axis:"coverage",weight:.04+p.coverage*.10});
    if(!memory.token_library.length) f.push({axis:"inquire",weight:.40});
    return normalize(f);
  }

  function candidateActions(state){
    const p=state.prediction || {accuracy:0,coverage:0,error_rate:1}, focus=state.attention_field[0] || {axis:"null",weight:1};
    const token=state.memory.token_library[0]||null, relation=state.memory.token_relation_graph[0]||null;
    const lang=state.language_state.selected || state.memory.language_terms[0] || null;
    const actions=[{kind:"hold",symbols:[],weight:.10+Math.max(0,1-Math.abs(state.thought_state.stability||0))*.10}];
    if(p.coverage<.30 || p.error_rate>.70) actions.push({kind:"inquire",symbols:["?"],weight:.35+p.error_rate*.25});
    if(lang) actions.push({kind:"emit_math",symbols:[lang.id],weight:.26+Math.min(1,lang.weight/18)*.26});
    if(token) actions.push({kind:"emit_token",symbols:[token.id],weight:.18+Math.min(1,token.gain/12)*.18});
    if(relation) actions.push({kind:"emit_relation",symbols:[relation.from+"↔"+relation.to],weight:.16+Math.min(1,relation.count/18)*.20});
    if(p.accuracy>.65 && p.coverage>.45) actions.push({kind:"predict_ready",symbols:["→"],weight:.14+p.accuracy*.18});
    if(focus.axis && focus.axis!=="null" && focus.axis!=="error") actions.push({kind:"attend",symbols:[focus.axis],weight:.12+Math.abs(focus.weight)*.18});
    const total=actions.reduce((s,a)=>s+Math.abs(a.weight),0)||1;
    return actions.map(a=>Object.assign({},a,{pressure:round(Math.abs(a.weight)/total)})).sort((a,b)=>b.pressure-a.pressure||a.kind.localeCompare(b.kind));
  }

  function think(state, cycles){
    const count=Math.max(1,Number(cycles || state.body.params.thought_cycles || 1)), trace=[];
    for(let i=0;i<count;i++){
      const prev=state.attention_field;
      const next=attentionPressure(state);
      const dist=distance(prev,next);
      const stability=round(Math.max(0,1-Math.min(1,dist/2)));
      state.attention_field=next;
      state.thought_state.candidates=candidateActions(state);
      state.thought_state.selected=state.thought_state.candidates[0] || {kind:"hold",symbols:[],pressure:1};
      state.thought_state.stability=stability;
      state.thought_state.cycle_count++;
      state.thought_state.settled=stability >= Number(state.body.params.settle_threshold||.82);
      state.thought_field=normalize([
        ["attend",.16+Math.abs((state.attention_field[0]&&state.attention_field[0].weight)||0)*.22],
        ["memory_reentry",.10+Math.min(1,state.memory.token_library.length/16)*.16],
        ["relation_reentry",.10+Math.min(1,state.memory.token_relation_graph.length/16)*.16],
        ["language_reentry",.12+Math.min(1,state.memory.language_terms.length/16)*.20],
        ["predict",.09+((state.prediction&&state.prediction.accuracy)||0)*.15],
        ["error",.09+((state.prediction&&state.prediction.error_rate)||0)*.18],
        ["action_compete",.11+((state.thought_state.selected&&state.thought_state.selected.pressure)||0)*.17],
        ["settle",.07+stability*.20]
      ]);
      state.brain_field=normalize([
        ...state.brain_field.map(row=>({axis:row.axis,weight:row.weight*.70})),
        ...state.thought_field.map(row=>({axis:row.axis,weight:row.weight*.20})),
        ...state.language_field.map(row=>({axis:"lang:"+row.axis,weight:row.weight*.10}))
      ]);
      enforceOne(state);
      trace.push({cycle:state.thought_state.cycle_count, stability, settled:state.thought_state.settled, focus:state.attention_field[0], selected:state.thought_state.selected});
      if(state.thought_state.settled && i>=1) break;
    }
    updateInternalMathPacket(state);
    state.trace.unshift({type:"think",cycles:trace.length,result:trace[trace.length-1]||null,at:now()});
    state.trace=state.trace.slice(0,128);
    return clone(state.thought_state);
  }

  function settle(state){
    if(!state.thought_state.candidates.length) think(state,state.body.params.thought_cycles);
    const selected=state.thought_state.selected || {kind:"hold",symbols:[],pressure:1};
    const settled=state.thought_state.settled || selected.kind==="inquire" || selected.pressure>=.34;
    state.thought_state.settled=!!settled;
    state.thought_state.selected=selected;
    updateInternalMathPacket(state);
    return clone({settled:state.thought_state.settled, selected});
  }

  function act(state){
    const st=settle(state), selected=st.selected || {kind:"hold",symbols:[]};
    state.action_packet={enabled:true, kind:selected.kind, symbols:arr(selected.symbols), pressure:selected.pressure||0, settled:!!st.settled, english:"", at:now()};
    state.english_expression_channel={enabled:false,content:""};
    return clone(state.action_packet);
  }

  function updateBrainField(state,evaluation){
    const p=evaluation.prediction, c=evaluation.compression, injury=state.injury_register.length?Math.min(.25,state.injury_register.length*.03):0;
    const relationPressure=Math.min(1,state.memory.token_relation_graph.length/16);
    const languagePressure=Math.min(1,state.memory.language_terms.length/16);
    const thoughtPressure=Math.min(1,state.thought_state.stability||0);
    state.brain_field=normalize([
      ["sense",.07+(evaluation.sensory.length?.07:0)],
      ["pattern",.07+Math.min(1,c.candidates.length/12)*.12],
      ["compress",.06+c.compression_score*.18],
      ["predict",.06+p.accuracy*.14],
      ["error",.06+p.error_rate*.18],
      ["memory",.06+Math.min(1,state.memory.seen_count/16)*.11],
      ["relate",.06+relationPressure*.14],
      ["language",.07+languagePressure*.18],
      ["attend",.06+l1(state.attention_field)*.08],
      ["settle",.05+thoughtPressure*.14],
      ["mutate",.04+(p.error_rate+c.compression_score)*.06],
      ["act",.04+((state.action_packet&&state.action_packet.pressure)||0)*.07],
      ["injury",injury]
    ]);
    enforceOne(state);
  }

  function proposeCandidateBody(state,evaluation){
    const source=state.body, candidate=clone(source), p=evaluation.prediction, c=evaluation.compression;
    const relationPressure=Math.min(1,state.memory.token_relation_graph.length/16);
    const languagePressure=Math.min(1,state.memory.language_terms.length/16);
    const attentionPressureValue=Math.min(1,Math.abs((state.attention_field[0]&&state.attention_field[0].weight)||0));
    candidate.generation=source.generation+1;
    if(c.candidates.length && candidate.params.max_ngram<8) candidate.params.max_ngram++;
    if(p.coverage>.75 && p.accuracy>.55 && candidate.params.prediction_order<3) candidate.params.prediction_order++;
    if(p.error_rate>.65 && candidate.params.prediction_order>1) candidate.params.prediction_order--;
    const pressure=normalize([
      ["sense",.07],["pattern",.08+Math.min(1,c.candidates.length/10)*.12],
      ["compress",.08+c.compression_score*.16],["predict",.08+p.accuracy*.12],
      ["error",.06+p.error_rate*.14],["memory",.08+Math.min(1,state.memory.seen_count/16)*.07],
      ["relate",.08+relationPressure*.12],["language",.09+languagePressure*.16],
      ["attend",.08+attentionPressureValue*.10],["settle",.06+(state.thought_state.stability||0)*.11],
      ["mutate",.06+Math.abs(c.compression_score-p.error_rate)*.07],
      ["act",.05+((state.thought_state.selected&&state.thought_state.selected.pressure)||0)*.07]
    ]);
    candidate.body_field=blend(source.body_field,pressure,1-source.params.mutation_rate,source.params.mutation_rate);
    candidate.checksum=checksum({generation:candidate.generation,params:candidate.params,body_field:candidate.body_field});
    state.candidate_body=candidate;
    return candidate;
  }

  function testCandidateBody(state,candidate,text){
    const sourceScore=evaluateTextWithBody(state,text || (state.sensory&&state.sensory.raw) || "",state.body);
    const candidateScore=candidate ? evaluateTextWithBody(state,text || (state.sensory&&state.sensory.raw) || "",candidate) : null;
    const checks=[
      ["candidate exists",!!candidate],
      ["brain remains one",Math.abs(l1(state.brain_field)-1)<EPS,l1(state.brain_field)],
      ["language remains one",Math.abs(l1(state.language_field)-1)<EPS,l1(state.language_field)],
      ["attention remains one",Math.abs(l1(state.attention_field)-1)<EPS,l1(state.attention_field)],
      ["thought remains one",Math.abs(l1(state.thought_field)-1)<EPS,l1(state.thought_field)],
      ["candidate body equals one",!!candidate && Math.abs(l1(candidate.body_field)-1)<EPS,candidate&&l1(candidate.body_field)],
      ["candidate sandboxed",!!candidate && candidate.direct_source_write_enabled===false],
      ["candidate keeps english disabled",!!candidate && candidate.english_output_enabled===false],
      ["candidate generation advances",!!candidate && candidate.generation===state.body.generation+1],
      ["candidate does not regress beyond tolerance",!!candidateScore && candidateScore.score + state.body.params.injury_tolerance >= sourceScore.score,candidateScore&&{old:sourceScore.score,next:candidateScore.score}]
    ].map(row=>({name:row[0],passed:!!row[1],observed:row[2]}));
    const failed=checks.filter(c=>!c.passed);
    return {packet_type:"infant_candidate_body_test_v0_4",passed:failed.length===0,checks,source_score:sourceScore.score,candidate_score:candidateScore?candidateScore.score:0,failed_count:failed.length,at:now()};
  }

  function recordInjury(state,reason,test){
    const injury={type:"body_mutation_injury",reason,source_checksum:state.body&&state.body.checksum,candidate_checksum:state.candidate_body&&state.candidate_body.checksum,failed_checks:arr(test&&test.checks).filter(c=>!c.passed).map(c=>c.name),at:now()};
    state.injury_register.unshift(injury); state.injury_register=state.injury_register.slice(0,64); return injury;
  }
  function acceptCandidateBody(state){
    const prev=state.body; state.body=clone(state.candidate_body); state.body.previous_checksum=prev.checksum; state.body.accepted_at=now(); state.body_accept_count=(state.body_accept_count||0)+1; return state.body;
  }

  function observe(state,text){ return step(state,text,{autoThink:false}); }

  function step(state,text,options){
    const opts=options||{}, input=text==null?((state.sensory&&state.sensory.raw)||""):String(text);
    state.time++;
    const evaluation=evaluateTextWithBody(state,input,state.body);
    state.sensory=evaluation.sensory; state.prediction=evaluation.prediction; state.compression=evaluation.compression;
    state.error={error_rate:evaluation.prediction.error_rate,misses:evaluation.prediction.misses};
    remember(state.memory,state.sensory,state.body,state.compression);
    updateMathLanguage(state); updateInternalMathPacket(state); updateBrainField(state,evaluation);
    if(opts.autoThink!==false){ think(state,state.body.params.thought_cycles); act(state); }
    const candidate=proposeCandidateBody(state,evaluation), test=testCandidateBody(state,candidate,input);
    state.candidate_test=test;
    if(test.passed) acceptCandidateBody(state); else recordInjury(state,"candidate_failed_survival_test",test);
    enforceOne(state); updateInternalMathPacket(state);
    state.trace.unshift({type:"cycle",time:state.time,brain_l1:state.brain_l1,body_l1:state.body_l1,language_l1:state.language_l1,attention_l1:state.attention_l1,thought_l1:state.thought_l1,score:evaluation.score,prediction:state.prediction,compression_gain:state.compression.gain,token_count:state.memory.token_library.length,relation_count:state.memory.token_relation_graph.length,language_term_count:state.memory.language_terms.length,thought:clone(state.thought_state),candidate_passed:test.passed,action:state.action_packet.kind,at:now()});
    state.trace=state.trace.slice(0,128); state.updated_at=now();
    return snapshot(state);
  }

  function run(state,inputs){ arr(inputs).forEach(input=>step(state,input)); return snapshot(state); }
  function snapshot(state){ return clone(state); }

  return Object.freeze({
    VERSION, create, step, observe, think, settle, act, run,
    sense, ngrams, predict, evaluateTextWithBody,
    updateTokenRelations, updateMathLanguage, updateInternalMathPacket,
    proposeCandidateBody, testCandidateBody, l1, normalize, checksum, snapshot
  });
});
