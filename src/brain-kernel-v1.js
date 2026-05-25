(function(root){
  'use strict';

  var VERSION = 'brain-kernel-v1.0.2';
  var PRESSURE_FORBIDDEN = [
    'unresolved_error','inquire','prediction_gap','low_coverage','thought_instability',
    'action_uncertainty','comparison_pain','body_tension','language_gap','continue_inner_cycle'
  ];

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function sumAbs(vector){
    return Object.keys(vector || {}).reduce(function(total, key){
      return total + Math.abs(Number(vector[key]) || 0);
    }, 0);
  }
  function unitVector(raw){
    var total = sumAbs(raw);
    if(!total) throw new Error('Semantic vector cannot be empty.');
    var out = {};
    Object.keys(raw).forEach(function(key){ out[key] = raw[key] / total; });
    return out;
  }
  function semanticObject(key, symbol, vector, expression, rendering, extra){
    return Object.assign({
      key: key,
      symbol: symbol,
      unit: 1,
      vector: unitVector(vector),
      expression: expression,
      rendering: rendering || '',
      english_is_rendering_only: true
    }, extra || {});
  }

  var SEMANTIC_OBJECTS = {
    discernment: semanticObject(
      'discernment', 'D',
      { contrast: 1, separation: 1, reality_contact: 1, stability_gate: 1 },
      'D = Σ(|contrast| + |separation| + |reality_contact| + |stability_gate|) = 1',
      'Discernment is contrast-preserving separation under reality contact and stability gating.'
    ),
    knowledge: semanticObject(
      'knowledge', 'K',
      { verified_structure: 3, retained_evidence: 3, reality_contact: 2, compression: 2 },
      'K = Σ(|verified_structure| + |retained_evidence| + |reality_contact| + |compression|) = 1',
      'Knowledge is retained, reality-contacting structure that can be checked, compressed, and reused.'
    ),
    wisdom: semanticObject(
      'wisdom', 'W',
      { application: 7, context: 5, consequence: 5, integration: 3 },
      'W = Σ(|application| + |context| + |consequence| + |integration|) = 1',
      'Wisdom is integrated application under context and consequence. It is not peak judgment.',
      { not_best_judgment: true }
    ),
    empathy: semanticObject(
      'empathy', 'E',
      { affective_model: 3, perspective: 3, care_signal: 2, harm_awareness: 2 },
      'E = Σ(|affective_model| + |perspective| + |care_signal| + |harm_awareness|) = 1',
      'Empathy models another subject\'s felt state and stakes without erasing reality contact.'
    ),
    practicality: semanticObject(
      'practicality', 'P',
      { constraint: 3, action_path: 3, tradeoff: 2, feasibility: 2 },
      'P = Σ(|constraint| + |action_path| + |tradeoff| + |feasibility|) = 1',
      'Practicality keeps action tied to constraints, tradeoffs, and feasible paths.'
    ),
    peak: semanticObject(
      'peak', 'Peak',
      { empathy_integrated: 1, practicality_integrated: 1, knowledge_integrated: 1, wisdom_integrated: 1 },
      'Peak = E ⊕ P ⊕ K ⊕ W under y = 1',
      'Peak is best judgment under maximal epistemic stability.',
      { best_judgment: true, octahedron: { x: 0, y: 1, z: 0, active: true } }
    ),
    null: semanticObject(
      'null', 'Null',
      { null_origin: 1 },
      'Null = origin(0,0,0), inactive worldview, Σ(|null_origin|) = 1',
      'Null is the origin: no active worldview. It is not collapse and not peak.',
      { octahedron: { x: 0, y: 0, z: 0, active: false } }
    ),
    collapse: semanticObject(
      'collapse', 'Collapse',
      { active_negative_stability: 1 },
      'Collapse = (0,-1,0), |x| + |y| + |z| = 1',
      'Collapse is maximal active negative epistemic stability.',
      { octahedron: { x: 0, y: -1, z: 0, active: true } }
    ),
    belief: semanticObject(
      'belief', 'BELIEF',
      { assertion: 2, confidence: 1, grounding_need: 1 },
      'BELIEF = Σ(|assertion| + |confidence| + |grounding_need|) = 1',
      'Belief is an asserted relation with confidence and a grounding requirement.'
    ),
    question: semanticObject(
      'question', 'QUERY',
      { inquiry: 2, target: 1, grounding_need: 1 },
      'QUERY = Σ(|inquiry| + |target| + |grounding_need|) = 1',
      'A question is an inquiry relation aimed at a target under a grounding need.'
    ),
    answer: semanticObject(
      'answer', 'ANSWER',
      { resolution: 2, grounding: 1, rendering: 1 },
      'ANSWER = Σ(|resolution| + |grounding| + |rendering|) = 1',
      'An answer is a grounded resolution relation with optional English rendering.'
    ),
    unknown: semanticObject(
      'unknown', 'UNKNOWN',
      { insufficiency: 2, open_query: 1, non_invention: 1 },
      'UNKNOWN = Σ(|insufficiency| + |open_query| + |non_invention|) = 1',
      'Unknown means the kernel has insufficient grounding and must not invent.'
    ),
    'name-binding': semanticObject(
      'name-binding', 'BIND_NAME',
      { slot: 2, referent: 2, equality: 1 },
      'BIND_NAME = Σ(|slot| + |referent| + |equality|) = 1',
      'Name-binding attaches a referent to a user name slot.'
    ),
    'identity-binding': semanticObject(
      'identity-binding', 'BIND_IDENTITY',
      { identity_slot: 2, referent: 2, equality: 1 },
      'BIND_IDENTITY = Σ(|identity_slot| + |referent| + |equality|) = 1',
      'Identity-binding attaches a referent to an identity slot.'
    ),
    'yes/no-command': semanticObject(
      'yes/no-command', 'COMMAND_BOOL',
      { command: 2, polarity: 2, compliance_gate: 1 },
      'COMMAND_BOOL = Σ(|command| + |polarity| + |compliance_gate|) = 1',
      'A yes/no command is a command relation over a Boolean polarity, not free chatbot obedience.'
    )
  };

  var TERM_ALIASES = {
    discernment: 'discernment', discern: 'discernment', discerning: 'discernment',
    knowledge: 'knowledge', knowing: 'knowledge',
    wisdom: 'wisdom', wise: 'wisdom',
    empathy: 'empathy', empathic: 'empathy',
    practicality: 'practicality', practical: 'practicality',
    peak: 'peak', maturity: 'peak', 'best judgment': 'peak', 'best judgement': 'peak',
    null: 'null', origin: 'null',
    collapse: 'collapse',
    belief: 'belief', question: 'question', answer: 'answer', unknown: 'unknown',
    'name binding': 'name-binding', 'name-binding': 'name-binding',
    'identity binding': 'identity-binding', 'identity-binding': 'identity-binding',
    'yes no command': 'yes/no-command', 'yes/no-command': 'yes/no-command'
  };

  var GREETING_TERMS = {
    hi: true, hello: true, hey: true, yo: true, sup: true, 'what up': true, 'whats up': true,
    'good morning': true, 'good afternoon': true, 'good evening': true
  };

  var FRAGMENT_TERMS = {
    what: true, is: true, are: true, was: true, were: true, do: true, does: true, did: true,
    can: true, could: true, would: true, should: true, this: true, that: true, it: true,
    the: true, a: true, an: true, why: true, how: true, who: true, where: true, when: true
  };

  function birth(){
    return {
      version: VERSION,
      organism: {
        unit: 1,
        fields: {
          semantic_memory: { weight: 1/3, causes: ['birth'] },
          relation_network: { weight: 1/3, causes: ['birth'] },
          judgment_field: { weight: 1/3, causes: ['birth'] }
        }
      },
      semantic_objects: clone(SEMANTIC_OBJECTS),
      bindings: {},
      relations: [],
      judgments: [],
      ticks: 0,
      last: null,
      public_outputs: []
    };
  }

  function normalizeText(input){
    return String(input || '').trim().replace(/\s+/g, ' ');
  }
  function keyText(input){
    return normalizeText(input).toLowerCase().replace(/[“”]/g, '"').replace(/[?!.]+$/g, '').trim();
  }
  function safeName(value){
    return normalizeText(value).replace(/[\n\r\t]+/g, ' ').replace(/[<>]/g, '').trim();
  }
  function tokenCount(value){
    var k = keyText(value);
    if(!k) return 0;
    return k.split(/\s+/).filter(Boolean).length;
  }
  function isGreeting(value){
    return !!GREETING_TERMS[keyText(value)];
  }
  function isFragment(value){
    var k = keyText(value);
    return !k || !!FRAGMENT_TERMS[k] || tokenCount(k) < 2;
  }
  function topicKey(value){
    var cleaned = keyText(value).replace(/^(is|are|was|were|do|does|did|can|could|would|should)\s+/i, '');
    cleaned = cleaned.replace(/\b(true|the case)\b/gi, '').replace(/\s+/g, ' ').trim();
    return (cleaned || 'query').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'query';
  }
  function objectKeyFromTerm(term){
    var k = keyText(term);
    if(SEMANTIC_OBJECTS[k]) return k;
    if(TERM_ALIASES[k]) return TERM_ALIASES[k];
    var withoutWhatIs = k.replace(/^what\s+is\s+/, '').replace(/^define\s+/, '').trim();
    if(SEMANTIC_OBJECTS[withoutWhatIs]) return withoutWhatIs;
    if(TERM_ALIASES[withoutWhatIs]) return TERM_ALIASES[withoutWhatIs];
    return null;
  }
  function isSubstantiveUnknownQuery(value){
    var raw = normalizeText(value);
    var k = keyText(raw);
    if(!k || isGreeting(k) || isFragment(k)) return false;

    var auxiliary = raw.match(/^(are|is|was|were|do|does|did|can|could|would|should)\s+(.+?)\??$/i);
    if(auxiliary && tokenCount(auxiliary[2]) >= 2) return true;

    var open = raw.match(/^(what|why|how|who|where|when)\s+(.+?)\??$/i);
    if(open && tokenCount(open[2]) >= 2) return true;

    return false;
  }
  function pushCause(state, cause){
    Object.keys(state.organism.fields).forEach(function(field){
      state.organism.fields[field].causes.push(cause);
    });
  }
  function publicSafe(text){
    var s = String(text || '');
    var lower = s.toLowerCase();
    for(var i = 0; i < PRESSURE_FORBIDDEN.length; i++){
      if(lower.indexOf(PRESSURE_FORBIDDEN[i]) !== -1) return '';
    }
    return s;
  }
  function relation(type, semanticKey, fields){
    var obj = SEMANTIC_OBJECTS[semanticKey];
    return Object.assign({
      type: type,
      semantic_object: semanticKey,
      unit: 1,
      vector: clone(obj.vector),
      expression: obj.expression
    }, fields || {});
  }
  function judgment(kind, rel, expression, rendering){
    return {
      kind: kind,
      relation_type: rel.type,
      semantic_object: rel.semantic_object,
      unit: 1,
      vector: clone(rel.vector),
      expression: expression,
      rendering: rendering || '',
      english_is_rendering_only: true
    };
  }
  function renderObjectJudgment(state, objectKey, input){
    var obj = state.semantic_objects[objectKey] || SEMANTIC_OBJECTS[objectKey];
    var rel = relation('semantic-object-query', 'question', {
      target: objectKey,
      source_input: input,
      object_vector: clone(obj.vector)
    });
    var out = obj.expression + (obj.rendering ? '\n' + obj.rendering : '');
    return { relation: rel, judgment: judgment('definition', rel, obj.expression, obj.rendering), output: out };
  }
  function bindName(state, name, input){
    var clean = safeName(name);
    if(!clean) return null;
    state.bindings['user.name'] = clean;
    var expr = 'BIND(user.name, ' + clean + ') = 1';
    var rel = relation('name-binding', 'name-binding', {
      slot: 'user.name',
      referent: clean,
      expression: expr,
      source_input: input
    });
    return { relation: rel, judgment: judgment('binding', rel, expr, ''), output: expr };
  }
  function retrieveName(state, input){
    var name = state.bindings['user.name'];
    if(!name){ return makeUnknown('user_name', input); }
    var expr = 'BIND(user.name, ' + name + ') = 1';
    var rel = relation('name-binding-retrieval', 'name-binding', {
      slot: 'user.name',
      referent: name,
      expression: expr,
      source_input: input
    });
    return { relation: rel, judgment: judgment('binding-retrieval', rel, expr, ''), output: expr };
  }
  function commandBool(value, input){
    var polarity = keyText(value).indexOf('no') === 0 ? 'no' : 'yes';
    var expr = 'COMMAND(' + polarity + ') = 1';
    var rel = relation('yes/no-command', 'yes/no-command', {
      polarity: polarity,
      expression: expr,
      source_input: input
    });
    return { relation: rel, judgment: judgment('command-object', rel, expr, ''), output: expr };
  }
  function makeUnknown(topic, input){
    var key = topicKey(topic);
    var expr = 'UNKNOWN(' + key + ') = 1';
    var rel = relation('unknown-query', 'unknown', {
      target: key,
      expression: expr,
      source_input: input
    });
    return { relation: rel, judgment: judgment('unknown', rel, expr, 'QUERY(' + key + ') → insufficient_grounding'), output: expr + '\nQUERY(' + key + ') → insufficient_grounding' };
  }
  function derive(state, input){
    var raw = normalizeText(input);
    var k = keyText(raw);
    if(!k || isGreeting(k)) return null;

    var m = raw.match(/^my\s+name\s+is\s+(.+)$/i);
    if(m) return bindName(state, m[1], raw);
    if(/^what\s+is\s+my\s+name\??$/i.test(raw)) return retrieveName(state, raw);

    var command = raw.match(/^say\s+(yes|no)\.?$/i);
    if(command) return commandBool(command[1], raw);

    var objectKey = null;
    var q = raw.match(/^(what\s+is|define)\s+(.+?)\??$/i);
    if(q) objectKey = objectKeyFromTerm(q[2]);
    if(!objectKey) objectKey = objectKeyFromTerm(raw);
    if(objectKey) return renderObjectJudgment(state, objectKey, raw);

    if(isFragment(k)) return null;

    if(isSubstantiveUnknownQuery(raw)){
      return makeUnknown(raw, raw);
    }
    return null;
  }

  function step(state, input){
    if(!state) state = birth();
    state.ticks += 1;
    pushCause(state, input ? 'input' : 'tick');
    var result = derive(state, input || '');
    if(result){
      state.relations.push(result.relation);
      state.judgments.push(result.judgment);
      result.output = publicSafe(result.output);
      if(result.output) state.public_outputs.push(result.output);
    }
    state.last = result;
    return state;
  }
  function think(state, ticks){
    if(!state) state = birth();
    var n = Math.max(0, Number(ticks) || 0);
    for(var i = 0; i < n; i++) step(state, '');
    return state;
  }
  function respond(state, input){
    if(!state) state = birth();
    step(state, input);
    return state.last ? publicSafe(state.last.output) : '';
  }
  function packet(state){
    var s = state || birth();
    return {
      version: s.version,
      organism: clone(s.organism),
      semantic_objects: clone(s.semantic_objects),
      bindings: clone(s.bindings),
      relations: clone(s.relations),
      judgments: clone(s.judgments),
      ticks: s.ticks,
      last: clone(s.last)
    };
  }

  var api = { birth: birth, step: step, think: think, respond: respond, packet: packet };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FortySecondMindKernelV1 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
