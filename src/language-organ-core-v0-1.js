(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindLanguageOrganCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let K = null;
  try { if (typeof require === 'function') K = require('./math-language-kernel-v0-1.js'); } catch (_) { K = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function l1(rows) { return A(rows).reduce((sum, row) => sum + Math.abs(Number(row.w || 0)), 0); }
  function unitOk(rows) { return Math.abs(l1(rows) - 1) < 1e-12; }
  function normalize(rows) {
    const clean = A(rows).map(row => ({ id: String(row.id || 'unknown'), raw: Math.max(0, Number(row.w || 0)) }));
    if (!clean.length) return [{ id: 'empty', w: 1 }];
    const total = clean.reduce((sum, row) => sum + row.raw, 0) || 1;
    let partial = 0;
    return clean.map((row, index) => {
      if (index === clean.length - 1) return { id: row.id, w: 1 - partial };
      const w = row.raw / total;
      partial += w;
      return { id: row.id, w };
    });
  }

  function organ(id, rows) {
    const field = normalize(rows);
    return { id, equation: '|' + id + '| = 1', unit: l1(field), ok: unitOk(field), field };
  }

  function create() {
    const state = {
      packet_type: '42ndMind_language_organ_state_v0_1',
      version: VERSION,
      t: 0,
      records: [],
      slots: {
        syntax: {}, semantics: {}, proof: {}, rewrite: {}, generation: {}, translation: {}, gaps: {}
      },
      organs: null,
      language: null,
      Ξ: ''
    };
    refresh(state);
    return state;
  }

  function inc(map, key) {
    const k = String(key || 'unknown');
    map[k] = (map[k] || 0) + 1;
  }

  function packetFor(input, options) {
    const kernel = options && options.kernel || K;
    if (input && input.packet_type && input.ast) return input;
    if (kernel && typeof kernel.math === 'function') return kernel.math(input);
    return { ok: false, ast_type: 'Unknown', anatomy_id: null, closure_operator: null, selected_rule: null, gaps: [{ id: 'kernel_unavailable' }], Ξ: '' };
  }

  function observe(state, input, options) {
    const st = state || create();
    const p = packetFor(input, options || {});
    const rec = {
      input: String(input == null ? '' : input),
      ok: p.ok === true,
      ast_type: p.ast_type || p.body_type || 'Unknown',
      anatomy_id: p.anatomy_id || null,
      closure_operator: p.closure_operator || null,
      selected_rule: p.selected_rule || null,
      gap_id: p.gaps && p.gaps[0] && p.gaps[0].id || null
    };
    inc(st.slots.syntax, rec.ast_type);
    if (rec.anatomy_id) inc(st.slots.semantics, rec.anatomy_id);
    if (rec.selected_rule) inc(st.slots.proof, rec.selected_rule);
    if (rec.selected_rule && /rewrite|simpl|canonical/i.test(rec.selected_rule)) inc(st.slots.rewrite, rec.selected_rule);
    if (!rec.ok && rec.gap_id) inc(st.slots.generation, 'candidate_for_' + rec.gap_id);
    if (rec.gap_id) inc(st.slots.gaps, rec.gap_id);
    inc(st.slots.translation, rec.ok ? 'internal_to_verified_packet' : 'internal_to_gap_packet');
    st.records.push(rec);
    st.records = st.records.slice(-512);
    st.t += 1;
    refresh(st);
    return packet(st);
  }

  function refresh(state) {
    const slots = state.slots || {};
    state.organs = {
      syntax: organ('language.syntax', Object.keys(slots.syntax || {}).map(k => ({ id: k, w: slots.syntax[k] }))),
      semantics: organ('language.semantics', Object.keys(slots.semantics || {}).map(k => ({ id: k, w: slots.semantics[k] }))),
      proof: organ('language.proof', Object.keys(slots.proof || {}).map(k => ({ id: k, w: slots.proof[k] }))),
      rewrite: organ('language.rewrite', Object.keys(slots.rewrite || {}).map(k => ({ id: k, w: slots.rewrite[k] }))),
      generation: organ('language.generation', Object.keys(slots.generation || {}).map(k => ({ id: k, w: slots.generation[k] }))),
      translation: organ('language.translation', Object.keys(slots.translation || {}).map(k => ({ id: k, w: slots.translation[k] })))
    };
    const terms = Object.keys(state.organs).map(id => ({ id: '|language.' + id + '|', w: state.organs[id].unit }));
    const magnitude = l1(terms);
    const coherence = terms.length ? magnitude / terms.length : 0;
    let ok = Math.abs(coherence - 1) < 1e-12;
    Object.keys(state.organs).forEach(id => { ok = ok && state.organs[id].ok; });
    state.language = {
      equation: 'language = |syntax| + |semantics| + |proof| + |rewrite| + |generation| + |translation|',
      container: true,
      content_complete: false,
      organ_count: terms.length,
      magnitude,
      coherence,
      ok,
      L: terms
    };
    return state;
  }

  function packet(state) {
    refresh(state);
    return {
      packet_type: '42ndMind_language_organ_state_v0_1',
      version: VERSION,
      t: state.t,
      language: clone(state.language),
      organs: clone(state.organs),
      slots: clone(state.slots),
      records: clone(state.records),
      χ: ['language=container', 'language is a unit-scoped organ map, not a claim that all content is filled', 'each language organ is its own unit whole', 'verified math packets populate language organs'],
      Ξ: ''
    };
  }

  function run(inputs, options) {
    const state = create();
    const packets = A(inputs).map(input => observe(state, input, options || {}));
    return { packet_type: '42ndMind_language_organ_run_v0_1', version: VERSION, final: packet(state), packets, Ξ: '' };
  }

  return Object.freeze({ VERSION, create, observe, packet, run, organ, normalize, l1, refresh });
});
