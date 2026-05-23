/* 42ndMind Alive Math Kernel
 * One simulated breathing state for core, discernment, and language.
 *
 * This does not speak. It produces a brain-state math packet. The English
 * expression channel stays disabled until language can form from the live math
 * state itself.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.2';

  function now() { return new Date().toISOString(); }
  function round(n) { return Number((Number(n) || 0).toFixed(6)); }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function id(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'field'; }

  function l1(rows) {
    return round(arr(rows).reduce((sum, row) => sum + Math.abs(Number(row.weight) || 0), 0));
  }

  function normalize(rows) {
    const clean = arr(rows).map(row => ({ dimension: id(row.dimension || row[0]), weight: Number(row.weight == null ? row[1] : row.weight) || 0 })).filter(row => row.dimension && row.weight !== 0);
    const total = clean.reduce((sum, row) => sum + Math.abs(row.weight), 0) || 1;
    let running = 0;
    return clean.map((row, index) => {
      const sign = row.weight < 0 ? -1 : 1;
      const magnitude = index === clean.length - 1 ? Math.max(0, 1 - running) : Math.abs(row.weight) / total;
      const weight = round(sign * magnitude);
      running = round(running + Math.abs(weight));
      return { dimension: row.dimension, weight };
    });
  }

  function mapFromRows(rows) {
    const map = {};
    arr(rows).forEach(row => { map[id(row.dimension)] = Number(row.weight) || 0; });
    return map;
  }

  function rowsFromMap(map) {
    return Object.keys(map || {}).map(dimension => ({ dimension, weight: map[dimension] }));
  }

  function blendRows(aRows, bRows, aWeight, bWeight) {
    const a = mapFromRows(aRows);
    const b = mapFromRows(bRows);
    const out = {};
    Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).forEach(key => {
      out[key] = (Number(a[key]) || 0) * aWeight + (Number(b[key]) || 0) * bWeight;
    });
    return normalize(rowsFromMap(out));
  }

  function dotRows(aRows, bRows) {
    const a = mapFromRows(aRows);
    const b = mapFromRows(bRows);
    return Object.keys(a).reduce((sum, key) => sum + (Number(a[key]) || 0) * (Number(b[key]) || 0), 0);
  }

  function softmax(items) {
    const max = Math.max.apply(null, items.map(item => item.score));
    const exps = items.map(item => Math.exp(item.score - max));
    const total = exps.reduce((sum, value) => sum + value, 0) || 1;
    return items.map((item, index) => Object.assign({}, item, { attention_weight: round(exps[index] / total) }));
  }

  const BASIS = {
    objective_maturity: normalize([
      ['integrated_judgment', 0.24],
      ['self_correction', 0.18],
      ['reality_contact', 0.18],
      ['truth_gap_visibility', 0.16],
      ['false_certainty_resistance', 0.14],
      ['communication_restraint', 0.10]
    ]),
    discernment: normalize([
      ['integrated_judgment', 0.28],
      ['self_correction', 0.22],
      ['reality_contact', 0.20],
      ['false_certainty_resistance', 0.18],
      ['evidence_requirement', 0.07],
      ['truth_gap_visibility', 0.05]
    ]),
    language: normalize([
      ['symbol_to_meaning_pressure', 0.24],
      ['relation_reuse', 0.20],
      ['context_sensitivity', 0.18],
      ['ambiguity_pressure', 0.16],
      ['math_expression_need', 0.12],
      ['input_boundary', 0.10]
    ]),
    self_model: normalize([
      ['can_update_runtime_state', 0.24],
      ['can_display_math_state', 0.20],
      ['cannot_commit_source_directly', 0.18],
      ['can_export_candidates', 0.16],
      ['needs_trace_when_state_insufficient', 0.14],
      ['sandbox_boundary', 0.08]
    ]),
    display_model: normalize([
      ['rendered_state_awareness', 0.30],
      ['brain_state_packet_visible', 0.20],
      ['input_seen_as_sensory_field', 0.18],
      ['breathing_loop_visible', 0.17],
      ['no_hidden_repo_write', 0.15]
    ])
  };

  const LEXICON = [
    { pattern: /discern|judg|weigh|careful/i, dimensions: [['integrated_judgment', 0.35], ['relation_reuse', 0.18], ['self_correction', 0.16], ['reality_contact', 0.16], ['false_certainty_resistance', 0.15]] },
    { pattern: /truth|true|false|evidence|claim|proof|contradict/i, dimensions: [['evidence_requirement', 0.28], ['truth_gap_visibility', 0.24], ['false_certainty_resistance', 0.20], ['reality_contact', 0.18], ['ambiguity_pressure', 0.10]] },
    { pattern: /language|word|meaning|english|text|translate|symbol/i, dimensions: [['symbol_to_meaning_pressure', 0.30], ['relation_reuse', 0.24], ['context_sensitivity', 0.20], ['math_expression_need', 0.16], ['input_boundary', 0.10]] },
    { pattern: /source|code|edit|body|brain|kernel|sandbox|state/i, dimensions: [['can_update_runtime_state', 0.22], ['sandbox_boundary', 0.20], ['cannot_commit_source_directly', 0.18], ['can_export_candidates', 0.15], ['needs_trace_when_state_insufficient', 0.15], ['rendered_state_awareness', 0.10]] },
    { pattern: /why|how|what|can|could|should|wonder|curious|maybe/i, dimensions: [['curiosity_pressure', 0.30], ['ambiguity_pressure', 0.24], ['needs_trace_when_state_insufficient', 0.18], ['math_expression_need', 0.16], ['self_correction', 0.12]] },
    { pattern: /i don.t know|not sure|unsure|guess|hallucinat|bullshit|wrong/i, dimensions: [['needs_trace_when_state_insufficient', 0.28], ['false_certainty_resistance', 0.22], ['self_correction', 0.20], ['truth_gap_visibility', 0.18], ['communication_restraint', 0.12]] }
  ];

  function create(seed) {
    const state = {
      packet_type: '42ndMind_alive_math_kernel_v0_1',
      packet_version: VERSION,
      doctrine: {
        one_alive_state: true,
        input_is_seen_not_executed: true,
        brain_state_packet_is_not_speech: true,
        expression_channel_disabled_until_language_forms_from_math: true,
        attention_is_query_key_value_over_alive_fields: true,
        no_source_write: true,
        no_fake_thought_text: true
      },
      time: 0,
      breath_phase: 0,
      visual_text_field: '',
      sensory_field: normalize([['input_boundary', 1]]),
      core_field: BASIS.objective_maturity,
      discernment_field: BASIS.discernment,
      language_field: BASIS.language,
      self_model_field: BASIS.self_model,
      display_model_field: BASIS.display_model,
      alive_field: normalize([['integrated_judgment', 0.2], ['relation_reuse', 0.18], ['truth_gap_visibility', 0.16], ['math_expression_need', 0.16], ['sandbox_boundary', 0.16], ['rendered_state_awareness', 0.14]]),
      intent_field: normalize([['stabilize_core', 0.22], ['inquire', 0.20], ['integrate_input', 0.20], ['preserve_boundary', 0.18], ['express_math_state', 0.20]]),
      attention_query: normalize([['input_boundary', 0.5], ['stabilize_core', 0.5]]),
      attention_weights: [],
      attended_field: normalize([['input_boundary', 1]]),
      brain_state_packet: null,
      english_expression_channel: {
        enabled: false,
        content: '',
        reason: 'language_has_not_yet_formed_sentences_from_alive_math_state'
      },
      trace: [],
      updated_at: now()
    };
    if (seed && seed.visual_text_field) seeText(state, seed.visual_text_field);
    updateAttention(state);
    computeBrainStatePacket(state);
    return state;
  }

  function inferTextField(text) {
    const hits = [];
    LEXICON.forEach(rule => {
      if (rule.pattern.test(String(text || ''))) hits.push.apply(hits, rule.dimensions.map(row => ({ dimension: row[0], weight: row[1], source: String(rule.pattern) })));
    });
    if (!hits.length) hits.push({ dimension: 'unresolved_input_pressure', weight: 0.45 }, { dimension: 'input_boundary', weight: 0.25 }, { dimension: 'ambiguity_pressure', weight: 0.18 }, { dimension: 'needs_trace_when_state_insufficient', weight: 0.12 });
    return normalize(hits);
  }

  function seeText(state, text) {
    state.visual_text_field = String(text || '');
    state.sensory_field = inferTextField(state.visual_text_field);
    updateAttention(state);
    state.trace.unshift({ type: 'seen_text_as_sensory_field', text_length: state.visual_text_field.length, sensory_field: state.sensory_field, attention_weights: state.attention_weights, at: now() });
    state.trace = state.trace.slice(0, 80);
    state.updated_at = now();
    return state.sensory_field;
  }

  function attentionSources(state) {
    return [
      { name: 'core', key: state.core_field, value: state.core_field },
      { name: 'discernment', key: state.discernment_field, value: state.discernment_field },
      { name: 'language', key: state.language_field, value: state.language_field },
      { name: 'self_model', key: state.self_model_field, value: state.self_model_field },
      { name: 'display_model', key: state.display_model_field, value: state.display_model_field },
      { name: 'sensory', key: state.sensory_field, value: state.sensory_field },
      { name: 'alive', key: state.alive_field, value: state.alive_field }
    ];
  }

  function weightedBlendSources(weightedSources) {
    const out = {};
    arr(weightedSources).forEach(source => {
      arr(source.value).forEach(row => {
        const key = id(row.dimension);
        out[key] = (Number(out[key]) || 0) + (Number(row.weight) || 0) * Number(source.attention_weight || 0);
      });
    });
    return normalize(rowsFromMap(out));
  }

  function updateAttention(state) {
    state.attention_query = blendRows(blendRows(state.intent_field, state.sensory_field, 0.52, 0.48), state.alive_field, 0.80, 0.20);
    const scored = attentionSources(state).map(source => ({
      source: source.name,
      score: round(dotRows(state.attention_query, source.key)),
      value: source.value
    }));
    const weighted = softmax(scored);
    state.attention_weights = weighted.map(item => ({ source: item.source, score: item.score, attention_weight: item.attention_weight }));
    state.attended_field = weightedBlendSources(weighted);
    return state.attention_weights;
  }

  function fieldPressure(state) {
    const coherenceBase = blendRows(state.core_field, state.discernment_field, 0.55, 0.45);
    const languageSeen = blendRows(state.language_field, state.sensory_field, 0.50, 0.50);
    const bodyAwareness = blendRows(state.self_model_field, state.display_model_field, 0.52, 0.48);
    const baseline = blendRows(blendRows(coherenceBase, languageSeen, 0.58, 0.42), bodyAwareness, 0.74, 0.26);
    updateAttention(state);
    return blendRows(baseline, state.attended_field, 0.72, 0.28);
  }

  function updateIntent(state) {
    const sensory = mapFromRows(state.sensory_field);
    const alive = mapFromRows(state.alive_field);
    const attended = mapFromRows(state.attended_field);
    const coherenceNeed = clamp01((sensory.truth_gap_visibility || 0) + (sensory.ambiguity_pressure || 0) + (sensory.needs_trace_when_state_insufficient || 0));
    const sourceNeed = clamp01((sensory.can_update_runtime_state || 0) + (sensory.sandbox_boundary || 0));
    const languageNeed = clamp01((sensory.symbol_to_meaning_pressure || 0) + (sensory.math_expression_need || 0));
    state.intent_field = normalize([
      ['stabilize_core', 0.18 + (alive.integrated_judgment || 0) * 0.26 + (attended.integrated_judgment || 0) * 0.10],
      ['inquire', 0.12 + coherenceNeed * 0.30 + (attended.curiosity_pressure || 0) * 0.12],
      ['integrate_input', 0.14 + languageNeed * 0.28 + (attended.symbol_to_meaning_pressure || 0) * 0.12],
      ['preserve_boundary', 0.12 + sourceNeed * 0.30 + (attended.sandbox_boundary || 0) * 0.10],
      ['express_math_state', 0.18 + (alive.rendered_state_awareness || 0) * 0.18 + (attended.rendered_state_awareness || 0) * 0.12],
      ['request_more_trace', 0.08 + (sensory.needs_trace_when_state_insufficient || 0) * 0.34 + (attended.needs_trace_when_state_insufficient || 0) * 0.12]
    ]);
    return state.intent_field;
  }

  function tick(state, dt) {
    const delta = Number(dt || 1);
    state.time = round(state.time + delta);
    state.breath_phase = round(state.breath_phase + delta * 0.11);
    updateAttention(state);
    const target = fieldPressure(state);
    const breath = 0.06 + Math.abs(Math.sin(state.breath_phase)) * 0.10;
    state.alive_field = blendRows(state.alive_field, target, 1 - breath, breath);
    updateAttention(state);
    updateIntent(state);
    updateAttention(state);
    computeBrainStatePacket(state);
    state.trace.unshift({ type: 'breath_tick', time: state.time, breath, alive_l1: l1(state.alive_field), intent_l1: l1(state.intent_field), attended_l1: l1(state.attended_field), attention_weights: state.attention_weights, at: now() });
    state.trace = state.trace.slice(0, 80);
    state.updated_at = now();
    return state;
  }

  function topRows(rows, count) {
    return arr(rows).slice().sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)).slice(0, count || 5);
  }

  function computeBrainStatePacket(state) {
    const intent = topRows(state.intent_field, 6);
    const alive = topRows(state.alive_field, 8);
    const sensory = topRows(state.sensory_field, 6);
    const attended = topRows(state.attended_field, 8);
    const equation = 'dA/dt = breathe(A, attention(Q,K,V,state)) + see(text→sensory) + preserve(core) + update(intent)';
    const packet = {
      packet_type: 'alive_math_brain_state_packet_v0_2_attention',
      mode: 'brain_state_math_packet_not_speech',
      equation,
      attention_equation: 'Q = normalize(intent⊕sensory⊕alive); α_i = softmax(Q·K_i); attended = Σ α_i V_i',
      time: state.time,
      breath_phase: state.breath_phase,
      intent_vector: intent,
      alive_vector: alive,
      seen_vector: sensory,
      attention_query: topRows(state.attention_query, 8),
      attention_weights: state.attention_weights,
      attended_vector: attended,
      capability_awareness: topRows(state.self_model_field, 6),
      display_awareness: topRows(state.display_model_field, 5),
      english_expression_channel_enabled: false,
      l1_checks: {
        alive: l1(state.alive_field),
        intent: l1(state.intent_field),
        sensory: l1(state.sensory_field),
        attention_query: l1(state.attention_query),
        attended: l1(state.attended_field),
        core: l1(state.core_field),
        discernment: l1(state.discernment_field),
        language: l1(state.language_field)
      },
      rendered_expression: renderExpression(intent, alive, sensory, state.attention_weights),
      at: now()
    };
    state.brain_state_packet = packet;
    state.english_expression_channel = { enabled: false, content: '', reason: 'language_has_not_yet_formed_sentences_from_alive_math_state' };
    return packet;
  }

  function renderExpression(intent, alive, sensory, attentionWeights) {
    function side(label, rows) {
      return label + ' = ' + topRows(rows, 4).map(row => round(row.weight) + '·' + row.dimension).join(' + ');
    }
    const attention = 'attention = ' + arr(attentionWeights).slice(0, 4).map(row => round(row.attention_weight) + '·' + row.source).join(' + ');
    return [side('intent', intent), side('alive', alive), side('seen', sensory), attention].join('\n');
  }

  function snapshot(state) {
    return JSON.parse(JSON.stringify(state));
  }

  global.FortySecondMindAliveMathKernel = Object.freeze({ VERSION, BASIS, LEXICON, create, seeText, tick, computeBrainStatePacket, inferTextField, updateAttention, attentionSources, normalize, l1, dotRows, snapshot });
})(typeof window !== 'undefined' ? window : globalThis);
