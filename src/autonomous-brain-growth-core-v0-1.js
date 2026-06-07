(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindAutonomousBrainGrowthCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let Organism = null;
  try { if (typeof require === 'function') Organism = require('./cognitive-organism-core-v0-1.js'); } catch (_) { Organism = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function clean(text) { return String(text == null ? '' : text).trim().replace(/\s+/g, ' '); }
  function norm(text) { return clean(text).toLowerCase().replace(/[?.!]+$/g, ''); }
  function l1(rows) { return R(A(rows).reduce((sum, row) => sum + Math.abs(Number(row.w || 0)), 0)); }
  function normalize(rows) {
    const base = A(rows).map(row => ({ id: String(row.id || row.σ || 'unknown'), w: Math.max(1e-9, Number(row.w || 0)) }));
    const total = base.reduce((sum, row) => sum + row.w, 0) || 1;
    return base.map(row => ({ id: row.id, w: R(row.w / total) })).sort((a, b) => b.w - a.w || a.id.localeCompare(b.id));
  }

  function relationKey(subject, predicate) { return norm(subject) + '::' + norm(predicate); }
  function conceptKey(value) { return norm(value).replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown'; }

  function parseRelationalInput(input) {
    const raw = clean(input);
    const q = /^is\s+(.+?)\s+(.+?)\??$/i.exec(raw) || /^are\s+(.+?)\s+(.+?)\??$/i.exec(raw);
    if (q) return { kind: 'query', subject: norm(q[1]), predicate: norm(q[2]), raw };

    const m = /^(.+?)\s+(is|are)\s+(not\s+)?(.+?)$/i.exec(raw.replace(/[.!]+$/g, ''));
    if (!m) return null;
    return { kind: 'claim', subject: norm(m[1]), copula: m[2].toLowerCase(), predicate: norm(m[4]), polarity: !m[3], raw };
  }

  function emptyGrowthMemory() {
    return {
      concepts: {},
      beliefs: {},
      contradictions: [],
      questions: [],
      growth_log: []
    };
  }

  function create(options) {
    const organismState = Organism && typeof Organism.create === 'function' ? Organism.create(options || {}) : null;
    const state = {
      packet_type: '42ndMind_autonomous_brain_growth_state_v0_1',
      version: VERSION,
      t: 0,
      organism: organismState,
      growth: emptyGrowthMemory(),
      B: organismState && organismState.B || normalize([{ id: 'B:memory', w: 1 }]),
      brain: organismState && organismState.brain || { equation: 'brain = 1', invariant: '∥B∥₁=1', unit: 1, ok: true },
      last: null,
      Ξ: ''
    };
    return state;
  }

  function touchConcept(state, name) {
    const id = conceptKey(name);
    const existing = state.growth.concepts[id] || { id, label: norm(name), count: 0, support: 0, predicates: [] };
    existing.count += 1;
    existing.support = R(clamp01(existing.support + 0.12));
    state.growth.concepts[id] = existing;
    return existing;
  }

  function beliefTruth(belief) {
    if (!belief) return { known: false, confidence: 0, value: null };
    const total = belief.positive + belief.negative;
    const value = belief.positive >= belief.negative;
    const confidence = total ? Math.abs(belief.positive - belief.negative) / total : 0;
    return { known: total > 0, confidence: R(confidence), value };
  }

  function updateBelief(state, parsed) {
    const subject = touchConcept(state, parsed.subject);
    const predicate = touchConcept(state, parsed.predicate);
    const key = relationKey(parsed.subject, parsed.predicate);
    const belief = state.growth.beliefs[key] || {
      key,
      subject: subject.label,
      predicate: predicate.label,
      positive: 0,
      negative: 0,
      support: 0,
      confidence: 0,
      value: null,
      examples: []
    };
    const before = beliefTruth(belief);
    if (parsed.polarity) belief.positive += 1;
    else belief.negative += 1;
    belief.examples.push(parsed.raw);
    belief.examples = belief.examples.slice(-8);
    const after = beliefTruth(belief);
    belief.value = after.value;
    belief.confidence = after.confidence;
    belief.support = R(clamp01((belief.positive + belief.negative) / 6));
    state.growth.beliefs[key] = belief;
    if (subject.predicates.indexOf(predicate.id) < 0) subject.predicates.push(predicate.id);

    const contradiction = before.known && before.value !== after.value;
    if (contradiction) {
      state.growth.contradictions.push({ key, before, after, input: parsed.raw });
      state.growth.contradictions = state.growth.contradictions.slice(-64);
    }
    return { belief, before, after, contradiction };
  }

  function answerQuery(state, parsed) {
    const key = relationKey(parsed.subject, parsed.predicate);
    const belief = state.growth.beliefs[key] || null;
    const truth = beliefTruth(belief);
    const answer = truth.known ? (truth.value ? 'yes' : 'no') : 'unknown';
    const packet = { kind: 'belief_answer', subject: parsed.subject, predicate: parsed.predicate, answer, confidence: truth.confidence, belief: clone(belief) };
    state.growth.questions.push({ input: parsed.raw, answer, confidence: truth.confidence, key });
    state.growth.questions = state.growth.questions.slice(-64);
    return packet;
  }

  function growthPressure(state, growthEvent) {
    const beliefCount = Object.keys(state.growth.beliefs).length;
    const conceptCount = Object.keys(state.growth.concepts).length;
    const contradiction = growthEvent && growthEvent.contradiction ? 1 : 0;
    const answered = growthEvent && growthEvent.answer && growthEvent.answer.answer !== 'unknown' ? 1 : 0;
    const unknown = growthEvent && growthEvent.answer && growthEvent.answer.answer === 'unknown' ? 1 : 0;
    return normalize([
      { id: 'G:concepts', w: conceptCount + 1e-9 },
      { id: 'G:beliefs', w: beliefCount + 1e-9 },
      { id: 'G:contradiction', w: contradiction + 1e-9 },
      { id: 'G:answered', w: answered + 1e-9 },
      { id: 'G:unknown', w: unknown + 1e-9 }
    ]);
  }

  function mergeBrain(state, growthField) {
    const organismB = state.organism && state.organism.B || [];
    const rows = A(organismB).concat(A(growthField).map(row => ({ id: row.id.replace(/^G:/, 'B:growth_'), w: row.w })));
    state.B = normalize(rows);
    state.brain = { equation: 'brain = 1', invariant: '∥B∥₁=1', unit: l1(state.B), ok: Math.abs(l1(state.B) - 1) < 1e-5 };
    return state.B;
  }

  function grow(state, input, options) {
    const st = state || create(options || {});
    const parsed = parseRelationalInput(input);
    const organismPacket = Organism && typeof Organism.observe === 'function' ? Organism.observe(st.organism, input, options || {}) : null;
    let event;
    if (!parsed) {
      event = { kind: 'unparsed', input: clean(input), learned: false, answer: null, contradiction: false };
    } else if (parsed.kind === 'query') {
      const answer = answerQuery(st, parsed);
      event = { kind: 'query', input: parsed.raw, learned: false, answer, contradiction: false };
    } else {
      const learned = updateBelief(st, parsed);
      event = { kind: 'claim', input: parsed.raw, learned: true, belief: clone(learned.belief), contradiction: learned.contradiction };
    }
    const g = growthPressure(st, event);
    mergeBrain(st, g);
    st.t += 1;
    st.last = { input: clean(input), parsed: clone(parsed), organism: clone(organismPacket), growth: clone(event), G: clone(g), brain: clone(st.brain) };
    st.growth.growth_log.unshift({ t: st.t, input: clean(input), kind: event.kind, learned: !!event.learned, contradiction: !!event.contradiction, brain_unit: st.brain.unit });
    st.growth.growth_log = st.growth.growth_log.slice(0, 128);
    return packet(st);
  }

  function answer(state, input) {
    const st = state || create();
    const parsed = parseRelationalInput(input);
    if (!parsed || parsed.kind !== 'query') return { packet_type: '42ndMind_autonomous_brain_answer_v0_1', version: VERSION, ok: false, answer: 'unparsed', Ξ: '' };
    const ans = answerQuery(st, parsed);
    mergeBrain(st, growthPressure(st, { kind: 'query', answer: ans }));
    return { packet_type: '42ndMind_autonomous_brain_answer_v0_1', version: VERSION, ok: ans.answer !== 'unknown', result: ans, brain: clone(st.brain), B: clone(st.B), Ξ: '' };
  }

  function packet(state) {
    return {
      packet_type: '42ndMind_autonomous_brain_growth_state_v0_1',
      version: VERSION,
      t: state.t,
      brain: clone(state.brain),
      B: clone(state.B),
      concept_count: Object.keys(state.growth.concepts).length,
      belief_count: Object.keys(state.growth.beliefs).length,
      contradiction_count: state.growth.contradictions.length,
      concepts: clone(state.growth.concepts),
      beliefs: clone(state.growth.beliefs),
      last: clone(state.last),
      χ: ['brain=1', '∥B∥₁=1', 'growth creates concepts from raw relation claims', 'belief support changes through repeated input', 'contradiction creates pain pressure through organism channel', 'queries answer from grown memory'],
      Ξ: ''
    };
  }

  function run(inputs, options) {
    const state = create(options || {});
    const packets = A(inputs).map(input => grow(state, input, options || {}));
    return { packet_type: '42ndMind_autonomous_brain_growth_run_v0_1', version: VERSION, final: packet(state), packets, Ξ: '' };
  }

  return Object.freeze({ VERSION, create, grow, run, answer, packet, parseRelationalInput, l1, normalize, relationKey });
});
