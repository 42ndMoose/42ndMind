(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindNestedBrainCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let Growth = null;
  try { if (typeof require === 'function') Growth = require('./autonomous-brain-growth-core-v0-1.js'); } catch (_) { Growth = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function l1(rows) { return R(A(rows).reduce((sum, row) => sum + Math.abs(Number(row.w || 0)), 0)); }
  function unitOk(rows) { return Math.abs(l1(rows) - 1) < 1e-5; }
  function normalize(rows) {
    const clean = A(rows).map(row => ({ id: String(row.id || 'unknown'), w: Math.max(1e-9, Number(row.w || 0)) }));
    const total = clean.reduce((sum, row) => sum + row.w, 0) || 1;
    return clean.map(row => ({ id: row.id, w: R(row.w / total) })).sort((a, b) => b.w - a.w || a.id.localeCompare(b.id));
  }

  function organ(id, rows) {
    const field = normalize(rows);
    return { id, equation: id + ' = 1', invariant: 'unit(' + id + ')=1', unit: l1(field), ok: unitOk(field), field };
  }

  function stats(state) {
    const growth = state && state.growth || {};
    const concepts = Object.keys(growth.concepts || {}).length;
    const beliefs = Object.keys(growth.beliefs || {}).length;
    const contradictions = A(growth.contradictions).length;
    const questions = A(growth.questions).length;
    const log = A(growth.growth_log).length;
    let pos = 0, neg = 0, confidence = 0;
    Object.keys(growth.beliefs || {}).forEach(key => {
      const b = growth.beliefs[key] || {};
      pos += b.positive || 0;
      neg += b.negative || 0;
      confidence += b.confidence || 0;
    });
    return { concepts, beliefs, contradictions, questions, log, pos, neg, confidence: beliefs ? confidence / beliefs : 0 };
  }

  function organsFor(state) {
    const s = stats(state);
    const last = state && state.last && state.last.growth || {};
    const organism = state && state.last && state.last.organism || {};
    const isClaim = last.kind === 'claim' ? 1 : 0;
    const isQuery = last.kind === 'query' ? 1 : 0;
    const isUnknown = last.answer && last.answer.answer === 'unknown' ? 1 : 0;
    const isAnswered = last.answer && last.answer.answer !== 'unknown' ? 1 : 0;
    const isUnparsed = last.kind === 'unparsed' ? 1 : 0;
    const isContradiction = last.contradiction ? 1 : s.contradictions ? 0.5 : 0;
    return {
      perception: organ('perception', [
        { id: 'claim', w: isClaim + 1e-9 },
        { id: 'query', w: isQuery + 1e-9 },
        { id: 'unparsed', w: isUnparsed + 1e-9 },
        { id: 'recognized', w: isClaim + isQuery + 1e-9 }
      ]),
      memory: organ('memory', [
        { id: 'concepts', w: s.concepts + 1e-9 },
        { id: 'beliefs', w: s.beliefs + 1e-9 },
        { id: 'questions', w: s.questions + 1e-9 },
        { id: 'log', w: s.log + 1e-9 }
      ]),
      belief: organ('belief', [
        { id: 'positive', w: s.pos + 1e-9 },
        { id: 'negative', w: s.neg + 1e-9 },
        { id: 'confidence', w: s.confidence + 1e-9 },
        { id: 'contradiction', w: isContradiction + 1e-9 }
      ]),
      valuation: organ('valuation', [
        { id: 'reward', w: Number(organism.reward || 0) + isAnswered + 1e-9 },
        { id: 'pain', w: Number(organism.pain || 0) + isContradiction + isUnparsed + 1e-9 },
        { id: 'surprise', w: Number(organism.surprise || 0) + isUnknown + 1e-9 },
        { id: 'integrity', w: Number(organism.integrity || 1) + 1e-9 }
      ]),
      action: organ('action', [
        { id: 'answer', w: isAnswered + 1e-9 },
        { id: 'reinforce', w: isClaim + 1e-9 },
        { id: 'repair', w: isContradiction + 1e-9 },
        { id: 'explore', w: isUnparsed + isUnknown + 1e-9 }
      ])
    };
  }

  function build(state) {
    const organs = organsFor(state || {});
    const B = normalize(Object.keys(organs).map(id => ({ id: 'B:' + id, w: organs[id].ok ? 1 : 0 })));
    const organ_units = {};
    let ok = unitOk(B);
    Object.keys(organs).forEach(id => { organ_units[id] = organs[id].unit; ok = ok && organs[id].ok; });
    return { equation: 'brain = 1', invariant: 'whole brain and every organ are unit wholes', unit: l1(B), ok, B, organs, organ_units };
  }

  function optimizedStage(state) {
    const s = stats(state || {});
    const last = state && state.last && state.last.growth || {};
    let stage;
    if (s.contradictions > 0 || last.contradiction) stage = { id: 'repair_belief_conflict', action: 'seek_disambiguation', priority: 1 };
    else if (last.kind === 'unparsed') stage = { id: 'learn_input_shape', action: 'seek_parser_growth', priority: 0.9 };
    else if (last.answer && last.answer.answer === 'unknown') stage = { id: 'seek_missing_belief', action: 'ask_or_observe', priority: 0.82 };
    else if (s.beliefs > 0 && s.confidence < 1) stage = { id: 'raise_belief_confidence', action: 'collect_reinforcement', priority: 0.65 };
    else stage = { id: 'consolidate_stable_memory', action: 'compress_preserve', priority: 0.42 };
    const nested = build(state || {});
    return { packet_type: '42ndMind_nested_brain_optimized_stage_v0_1', version: VERSION, ok: nested.ok, stage, brain: nested, Xi: '' };
  }

  function simulate(state) {
    const stage = optimizedStage(state);
    const ok = stage.ok === true;
    return { packet_type: '42ndMind_nested_brain_live_simulation_v0_1', version: VERSION, ok, applyable: ok, stage: stage.stage, brain: stage.brain, Xi: '' };
  }

  function commit(state) {
    const sim = simulate(state);
    if (!sim.ok) return { packet_type: '42ndMind_nested_brain_commit_v0_1', version: VERSION, ok: false, applied: false, simulation: sim, Xi: '' };
    const target = state || (Growth && Growth.create ? Growth.create() : {});
    target.nested_brain = clone(sim.brain);
    target.optimized_stage = clone(sim.stage);
    if (target.growth) {
      target.growth.optimized_stages = A(target.growth.optimized_stages).concat([{ id: sim.stage.id, action: sim.stage.action, applied: true }]).slice(-64);
    }
    return { packet_type: '42ndMind_nested_brain_commit_v0_1', version: VERSION, ok: true, applied: true, stage: clone(sim.stage), state: target, Xi: '' };
  }

  return Object.freeze({ VERSION, normalize, l1, organ, organsFor, build, optimizedStage, simulate, commit });
});
