/* 42ndMind Infant Symbolic Kernel v0.3
 * One-state infant layer.
 *
 * Doctrine:
 * - brain = 1
 * - no semantic-label learning layer
 * - raw stream first
 * - compression before language
 * - prediction/error before meaning
 * - token relations before English translation
 * - recurrent attention before speech
 * - English output disabled
 *
 * This is not a chatbot and not a completed brain.
 * It adds primitive recurrent thought:
 * observe -> think cycles -> settle -> symbolic action.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FortySecondMindInfantSymbolicKernel = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = "0.3.0-recurrent-attention";
  const EPS = 1e-6;

  function now() { return new Date().toISOString(); }
  function round(n) { return Number((Number(n) || 0).toFixed(6)); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function clone(v) { return JSON.parse(JSON.stringify(v == null ? null : v)); }

  function l1(field) {
    return round(arr(field).reduce((sum, row) => sum + Math.abs(Number(row.weight) || 0), 0));
  }

  function normalize(field) {
    const clean = arr(field).map(row => ({
      axis: String(row.axis || row[0] || "").trim() || "axis",
      weight: Number(row.weight == null ? row[1] : row.weight) || 0
    })).filter(row => row.axis && row.weight !== 0);

    if (!clean.length) return [{ axis: "null", weight: 1 }];

    const total = clean.reduce((sum, row) => sum + Math.abs(row.weight), 0) || 1;
    let running = 0;

    return clean.map((row, index) => {
      const sign = row.weight < 0 ? -1 : 1;
      const magnitude = index === clean.length - 1
        ? Math.max(0, 1 - running)
        : Math.abs(row.weight) / total;
      const weight = round(sign * magnitude);
      running = round(running + Math.abs(weight));
      return { axis: row.axis, weight };
    });
  }

  function mapField(field) {
    const out = {};
    arr(field).forEach(row => { out[row.axis] = Number(row.weight) || 0; });
    return out;
  }

  function blend(a, b, aw, bw) {
    const am = mapField(a);
    const bm = mapField(b);
    const out = {};
    Array.from(new Set(Object.keys(am).concat(Object.keys(bm)))).forEach(key => {
      out[key] = (am[key] || 0) * aw + (bm[key] || 0) * bw;
    });
    return normalize(Object.keys(out).map(axis => ({ axis, weight: out[axis] })));
  }

  function fieldDistance(a, b) {
    const am = mapField(a);
    const bm = mapField(b);
    const keys = Array.from(new Set(Object.keys(am).concat(Object.keys(bm))));
    return round(keys.reduce((sum, key) => sum + Math.abs((am[key] || 0) - (bm[key] || 0)), 0));
  }

  function checksum(value) {
    const text = typeof value === "string" ? value : JSON.stringify(value || null);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function createBody(seed) {
    const body = {
      type: "infant_runtime_body_v0_3",
      generation: 0,
      direct_source_write_enabled: false,
      english_output_enabled: false,
      params: Object.assign({
        max_ngram: 4,
        min_repeat: 2,
        prediction_order: 1,
        mutation_rate: 0.08,
        injury_tolerance: 0.02,
        max_tokens: 128,
        max_relations: 256,
        thought_cycles: 6,
        settle_threshold: 0.82
      }, seed && seed.params || {}),
      body_field: normalize(seed && seed.body_field || [
        ["sense", 0.12],
        ["pattern", 0.11],
        ["compress", 0.11],
        ["predict", 0.11],
        ["error", 0.10],
        ["memory", 0.10],
        ["relate", 0.10],
        ["attend", 0.10],
        ["settle", 0.08],
        ["mutate", 0.04],
        ["act", 0.03]
      ])
    };
    body.checksum = checksum({ generation: body.generation, params: body.params, body_field: body.body_field });
    return body;
  }

  function create(seed) {
    const state = {
      packet_type: "42ndMind_infant_symbolic_kernel_v0_3",
      version: VERSION,
      doctrine: {
        brain_equals_one: true,
        no_semantic_label_learning_layer: true,
        raw_stream_first: true,
        compression_before_language: true,
        token_relations_before_english: true,
        recurrent_attention_before_speech: true,
        english_output_disabled: true,
        direct_source_write: false
      },
      time: 0,
      brain_field: normalize(seed && seed.brain_field || [
        ["sense", 0.13],
        ["pattern", 0.11],
        ["compress", 0.11],
        ["predict", 0.10],
        ["error", 0.10],
        ["memory", 0.10],
        ["relate", 0.10],
        ["attend", 0.10],
        ["settle", 0.07],
        ["mutate", 0.04],
        ["act", 0.04]
      ]),
      body: createBody(seed && seed.body),
      memory: {
        seen_count: 0,
        symbol_counts: {},
        transition_counts: {},
        ngram_counts: {},
        token_library: [],
        token_index: {},
        relation_counts: {},
        token_relation_graph: []
      },
      sensory: null,
      prediction: null,
      compression: null,
      error: null,
      attention_field: normalize([["null", 1]]),
      thought_field: normalize([["idle", 1]]),
      thought_state: {
        cycle_count: 0,
        stability: 0,
        settled: false,
        selected: null,
        candidates: []
      },
      candidate_body: null,
      candidate_test: null,
      internal_math_packet: null,
      injury_register: [],
      action_packet: { enabled: true, kind: "none", symbols: [], english: "" },
      english_expression_channel: { enabled: false, content: "" },
      trace: [],
      updated_at: now()
    };
    enforceBrainEqualsOne(state);
    updateInternalMathPacket(state);
    return state;
  }

  function enforceBrainEqualsOne(state) {
    state.brain_field = normalize(state.brain_field);
    state.body.body_field = normalize(state.body.body_field);
    state.attention_field = normalize(state.attention_field);
    state.thought_field = normalize(state.thought_field);
    state.brain_l1 = l1(state.brain_field);
    state.body_l1 = l1(state.body.body_field);
    state.attention_l1 = l1(state.attention_field);
    state.thought_l1 = l1(state.thought_field);
    return Math.abs(state.brain_l1 - 1) < EPS &&
      Math.abs(state.body_l1 - 1) < EPS &&
      Math.abs(state.attention_l1 - 1) < EPS &&
      Math.abs(state.thought_l1 - 1) < EPS;
  }

  function sense(text) {
    const raw = String(text == null ? "" : text);
    const symbols = Array.from(raw);
    const symbol_counts = {};
    symbols.forEach(ch => { symbol_counts[ch] = (symbol_counts[ch] || 0) + 1; });
    return {
      raw,
      symbols,
      length: symbols.length,
      distinct: Object.keys(symbol_counts).length,
      symbol_counts,
      checksum: checksum(raw)
    };
  }

  function ngrams(symbols, max) {
    const counts = {};
    const limit = Math.max(1, Number(max) || 1);
    for (let n = 1; n <= limit; n += 1) {
      for (let i = 0; i <= symbols.length - n; i += 1) {
        const key = symbols.slice(i, i + n).join("");
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }

  function predict(memory, symbols, order) {
    const n = Math.max(1, Number(order) || 1);
    let possible = Math.max(0, symbols.length - 1);
    let attempted = 0;
    let correct = 0;
    const misses = [];

    for (let i = 1; i < symbols.length; i += 1) {
      const context = symbols.slice(Math.max(0, i - n), i).join("");
      const options = memory.transition_counts[context] || {};
      const ranked = Object.keys(options).sort((a, b) => options[b] - options[a]);

      if (!ranked.length) {
        misses.push({ i, context, expected: symbols[i], predicted: null });
        continue;
      }

      attempted += 1;
      if (ranked[0] === symbols[i]) correct += 1;
      else misses.push({ i, context, expected: symbols[i], predicted: ranked[0] });
    }

    return {
      possible,
      attempted,
      correct,
      accuracy: possible ? round(correct / possible) : 1,
      coverage: possible ? round(attempted / possible) : 1,
      error_rate: possible ? round(1 - correct / possible) : 0,
      misses: misses.slice(0, 24)
    };
  }

  function compress(ngram_counts, body) {
    const min = Math.max(2, Number(body.params.min_repeat) || 2);
    return Object.keys(ngram_counts)
      .map(pattern => ({
        pattern,
        count: ngram_counts[pattern],
        length: Array.from(pattern).length
      }))
      .filter(item => item.length > 1 && item.count >= min)
      .map(item => Object.assign(item, {
        gain: (item.length - 1) * (item.count - 1)
      }))
      .filter(item => item.gain > 0)
      .sort((a, b) => b.gain - a.gain || b.length - a.length || a.pattern.localeCompare(b.pattern));
  }

  function evaluateTextWithBody(state, text, body) {
    const sensory = sense(text);
    const prediction = predict(
      state.memory,
      sensory.symbols,
      Math.max(1, body.params.prediction_order || 1)
    );
    const counts = ngrams(sensory.symbols, body.params.max_ngram);
    const candidates = compress(counts, body);
    const gain = candidates.reduce((sum, item) => sum + item.gain, 0);
    const compression_score = sensory.length ? Math.min(1, gain / Math.max(1, sensory.length * 2)) : 0;
    const stable = (
      Math.abs(l1(body.body_field) - 1) < EPS &&
      body.direct_source_write_enabled === false &&
      body.english_output_enabled === false
    ) ? 1 : 0;

    return {
      sensory,
      prediction,
      compression: { candidates, gain, compression_score: round(compression_score) },
      score: round(
        prediction.accuracy * 0.36 +
        prediction.coverage * 0.10 +
        compression_score * 0.22 +
        stable * 0.12 +
        Math.min(1, state.memory.token_relation_graph.length / 16) * 0.08 +
        Math.min(1, state.thought_state.stability || 0) * 0.12
      ),
      stable
    };
  }

  function remember(memory, sensory, body, compression) {
    memory.seen_count += 1;

    Object.keys(sensory.symbol_counts).forEach(key => {
      memory.symbol_counts[key] = (memory.symbol_counts[key] || 0) + sensory.symbol_counts[key];
    });

    const order = Math.max(1, body.params.prediction_order || 1);
    for (let n = 1; n <= order; n += 1) {
      for (let i = n; i < sensory.symbols.length; i += 1) {
        const context = sensory.symbols.slice(i - n, i).join("");
        const next = sensory.symbols[i];
        memory.transition_counts[context] = memory.transition_counts[context] || {};
        memory.transition_counts[context][next] = (memory.transition_counts[context][next] || 0) + 1;
      }
    }

    const counts = ngrams(sensory.symbols, body.params.max_ngram);
    Object.keys(counts).forEach(key => {
      memory.ngram_counts[key] = (memory.ngram_counts[key] || 0) + counts[key];
    });

    compression.candidates.slice(0, 12).forEach(candidate => {
      if (!memory.token_index[candidate.pattern] && memory.token_library.length < body.params.max_tokens) {
        const token = {
          id: "τ" + (memory.token_library.length + 1),
          pattern: candidate.pattern,
          length: candidate.length,
          count: candidate.count,
          gain: candidate.gain,
          birth: memory.seen_count
        };
        memory.token_index[candidate.pattern] = token.id;
        memory.token_library.push(token);
      }
    });

    updateTokenRelations(memory, compression, sensory, body);
  }

  function pairKey(a, b) {
    return a < b ? a + "|" + b : b + "|" + a;
  }

  function tokenForPattern(memory, pattern) {
    return memory.token_library.find(token => token.pattern === pattern) || null;
  }

  function updateTokenRelations(memory, compression, sensory, body) {
    const active = compression.candidates
      .map(candidate => tokenForPattern(memory, candidate.pattern))
      .filter(Boolean)
      .slice(0, 12);

    for (let i = 0; i < active.length; i += 1) {
      for (let j = i + 1; j < active.length; j += 1) {
        const a = active[i];
        const b = active[j];
        const key = pairKey(a.id, b.id);
        const overlap = a.pattern.includes(b.pattern) || b.pattern.includes(a.pattern) ? 1 : 0;
        const near = sensory.raw.indexOf(a.pattern) >= 0 && sensory.raw.indexOf(b.pattern) >= 0 ? 1 : 0;
        const strength = 1 + overlap + near;
        memory.relation_counts[key] = (memory.relation_counts[key] || 0) + strength;
      }
    }

    memory.token_relation_graph = Object.keys(memory.relation_counts)
      .map(key => {
        const parts = key.split("|");
        return {
          from: parts[0],
          to: parts[1],
          count: memory.relation_counts[key]
        };
      })
      .sort((a, b) => b.count - a.count || a.from.localeCompare(b.from) || a.to.localeCompare(b.to))
      .slice(0, body.params.max_relations);
  }

  function tokenUnitField(memory) {
    return normalize(memory.token_library.map(token => ({
      axis: token.id,
      weight: Math.max(1, Number(token.gain) || 1)
    })));
  }

  function relationUnitField(memory) {
    return normalize(memory.token_relation_graph.map(edge => ({
      axis: edge.from + "↔" + edge.to,
      weight: Math.max(1, Number(edge.count) || 1)
    })));
  }

  function updateInternalMathPacket(state) {
    const tokens = state.memory.token_library;
    const relations = state.memory.token_relation_graph;
    state.internal_math_packet = {
      packet_type: "infant_internal_math_packet_v0_3",
      mode: "recurrent_token_attention_not_english",
      expressions: [
        "brain=1",
        "Σ|brain.pressure|=1",
        "τ_i = compressed repeatable raw-symbol pattern",
        "ρ_ij = relation(τ_i,τ_j) from shared compression pressure",
        "A(t)=N(tokens + relations + error + prediction)",
        "Θ(t+1)=N(A(t)+Θ(t)+candidate_action_pressure)",
        "settle ⇔ stability(A_t,A_t-1) ≥ θ",
        "R = selected symbolic action; English=∅"
      ],
      token_count: tokens.length,
      relation_count: relations.length,
      token_unit_field: tokens.length ? tokenUnitField(state.memory) : [],
      relation_unit_field: relations.length ? relationUnitField(state.memory) : [],
      attention_field: state.attention_field,
      thought_field: state.thought_field,
      thought_state: state.thought_state,
      token_l1: tokens.length ? l1(tokenUnitField(state.memory)) : 0,
      relation_l1: relations.length ? l1(relationUnitField(state.memory)) : 0,
      attention_l1: l1(state.attention_field),
      thought_l1: l1(state.thought_field),
      at: now()
    };
    return state.internal_math_packet;
  }

  function attentionPressure(state) {
    const memory = state.memory;
    const p = state.prediction || { accuracy: 0, coverage: 0, error_rate: 1 };
    const c = state.compression || { candidates: [] };
    const field = [];

    c.candidates.slice(0, 10).forEach(candidate => {
      const token = tokenForPattern(memory, candidate.pattern);
      if (token) field.push({ axis: token.id, weight: 0.12 + Math.min(1, candidate.gain / 12) * 0.18 });
    });

    memory.token_relation_graph.slice(0, 10).forEach(edge => {
      field.push({ axis: edge.from + "↔" + edge.to, weight: 0.08 + Math.min(1, edge.count / 18) * 0.16 });
    });

    field.push({ axis: "error", weight: 0.06 + p.error_rate * 0.22 });
    field.push({ axis: "predict", weight: 0.06 + p.accuracy * 0.20 });
    field.push({ axis: "coverage", weight: 0.05 + p.coverage * 0.12 });

    if (!memory.token_library.length) field.push({ axis: "inquire", weight: 0.40 });
    return normalize(field);
  }

  function candidateActions(state) {
    const p = state.prediction || { accuracy: 0, coverage: 0, error_rate: 1 };
    const token = state.memory.token_library[0] || null;
    const relation = state.memory.token_relation_graph[0] || null;
    const focus = state.attention_field[0] || { axis: "null", weight: 1 };
    const actions = [];

    actions.push({ kind: "hold", symbols: [], weight: 0.10 + Math.max(0, 1 - Math.abs(state.thought_state.stability || 0)) * 0.10 });

    if (p.coverage < 0.30 || p.error_rate > 0.70) {
      actions.push({ kind: "inquire", symbols: ["?"], weight: 0.35 + p.error_rate * 0.25 });
    }

    if (token) {
      actions.push({ kind: "emit_token", symbols: [token.id], weight: 0.20 + Math.min(1, token.gain / 12) * 0.20 });
    }

    if (relation) {
      actions.push({ kind: "emit_relation", symbols: [relation.from + "↔" + relation.to], weight: 0.18 + Math.min(1, relation.count / 18) * 0.22 });
    }

    if (p.accuracy > 0.65 && p.coverage > 0.45) {
      actions.push({ kind: "predict_ready", symbols: ["→"], weight: 0.16 + p.accuracy * 0.20 });
    }

    if (focus.axis && focus.axis !== "null" && focus.axis !== "error") {
      actions.push({ kind: "attend", symbols: [focus.axis], weight: 0.14 + Math.abs(focus.weight) * 0.20 });
    }

    const total = actions.reduce((sum, action) => sum + Math.abs(action.weight), 0) || 1;
    return actions
      .map(action => Object.assign({}, action, { pressure: round(Math.abs(action.weight) / total) }))
      .sort((a, b) => b.pressure - a.pressure || a.kind.localeCompare(b.kind));
  }

  function think(state, cycles) {
    const count = Math.max(1, Number(cycles || state.body.params.thought_cycles || 1));
    const trace = [];

    for (let i = 0; i < count; i += 1) {
      const previousAttention = state.attention_field;
      const nextAttention = attentionPressure(state);
      const distance = fieldDistance(previousAttention, nextAttention);
      const stability = round(Math.max(0, 1 - Math.min(1, distance / 2)));

      state.attention_field = nextAttention;
      state.thought_state.candidates = candidateActions(state);
      state.thought_state.selected = state.thought_state.candidates[0] || { kind: "hold", symbols: [], pressure: 1 };
      state.thought_state.stability = stability;
      state.thought_state.cycle_count += 1;
      state.thought_state.settled = stability >= Number(state.body.params.settle_threshold || 0.82);

      state.thought_field = normalize([
        ["attend", 0.18 + Math.abs((state.attention_field[0] && state.attention_field[0].weight) || 0) * 0.24],
        ["memory_reentry", 0.12 + Math.min(1, state.memory.token_library.length / 16) * 0.18],
        ["relation_reentry", 0.10 + Math.min(1, state.memory.token_relation_graph.length / 16) * 0.18],
        ["predict", 0.10 + ((state.prediction && state.prediction.accuracy) || 0) * 0.16],
        ["error", 0.10 + ((state.prediction && state.prediction.error_rate) || 0) * 0.20],
        ["action_compete", 0.12 + ((state.thought_state.selected && state.thought_state.selected.pressure) || 0) * 0.18],
        ["settle", 0.08 + stability * 0.22]
      ]);

      state.brain_field = normalize([
        ...state.brain_field.map(row => ({ axis: row.axis, weight: row.weight * 0.74 })),
        ...state.thought_field.map(row => ({ axis: row.axis, weight: row.weight * 0.26 }))
      ]);

      enforceBrainEqualsOne(state);
      trace.push({
        cycle: state.thought_state.cycle_count,
        stability,
        settled: state.thought_state.settled,
        focus: state.attention_field[0],
        selected: state.thought_state.selected
      });

      if (state.thought_state.settled && i >= 1) break;
    }

    updateInternalMathPacket(state);
    state.trace.unshift({ type: "think", cycles: trace.length, result: trace[trace.length - 1] || null, at: now() });
    state.trace = state.trace.slice(0, 128);
    return clone(state.thought_state);
  }

  function settle(state) {
    if (!state.thought_state.candidates.length) think(state, state.body.params.thought_cycles);
    const selected = state.thought_state.selected || { kind: "hold", symbols: [], pressure: 1 };
    const settled = state.thought_state.settled || selected.kind === "inquire" || selected.pressure >= 0.34;
    state.thought_state.settled = !!settled;
    state.thought_state.selected = selected;
    updateInternalMathPacket(state);
    return clone({ settled: state.thought_state.settled, selected });
  }

  function act(state) {
    const settled = settle(state);
    const selected = settled.selected || { kind: "hold", symbols: [] };
    state.action_packet = {
      enabled: true,
      kind: selected.kind,
      symbols: arr(selected.symbols),
      pressure: selected.pressure || 0,
      settled: !!settled.settled,
      english: "",
      at: now()
    };
    state.english_expression_channel = { enabled: false, content: "" };
    return clone(state.action_packet);
  }

  function updateBrainField(state, evaluation) {
    const p = evaluation.prediction;
    const c = evaluation.compression;
    const injury = state.injury_register.length ? Math.min(0.25, state.injury_register.length * 0.03) : 0;
    const relationPressure = Math.min(1, state.memory.token_relation_graph.length / 16);
    const thoughtPressure = Math.min(1, state.thought_state.stability || 0);

    state.brain_field = normalize([
      ["sense", 0.08 + (evaluation.sensory.length ? 0.08 : 0)],
      ["pattern", 0.08 + Math.min(1, c.candidates.length / 12) * 0.14],
      ["compress", 0.07 + c.compression_score * 0.20],
      ["predict", 0.07 + p.accuracy * 0.16],
      ["error", 0.07 + p.error_rate * 0.20],
      ["memory", 0.07 + Math.min(1, state.memory.seen_count / 16) * 0.12],
      ["relate", 0.07 + relationPressure * 0.16],
      ["attend", 0.07 + l1(state.attention_field) * 0.10],
      ["settle", 0.06 + thoughtPressure * 0.16],
      ["mutate", 0.05 + (p.error_rate + c.compression_score) * 0.07],
      ["act", 0.05 + ((state.action_packet && state.action_packet.pressure) || 0) * 0.08],
      ["injury", injury]
    ]);

    enforceBrainEqualsOne(state);
  }

  function proposeCandidateBody(state, evaluation) {
    const source = state.body;
    const candidate = clone(source);
    const p = evaluation.prediction;
    const c = evaluation.compression;
    const relationPressure = Math.min(1, state.memory.token_relation_graph.length / 16);
    const attentionPressureValue = Math.min(1, Math.abs((state.attention_field[0] && state.attention_field[0].weight) || 0));

    candidate.generation = source.generation + 1;

    if (c.candidates.length && candidate.params.max_ngram < 8) candidate.params.max_ngram += 1;
    if (p.coverage > 0.75 && p.accuracy > 0.55 && candidate.params.prediction_order < 3) {
      candidate.params.prediction_order += 1;
    }
    if (p.error_rate > 0.65 && candidate.params.prediction_order > 1) {
      candidate.params.prediction_order -= 1;
    }

    const pressure = normalize([
      ["sense", 0.08],
      ["pattern", 0.09 + Math.min(1, c.candidates.length / 10) * 0.14],
      ["compress", 0.09 + c.compression_score * 0.18],
      ["predict", 0.09 + p.accuracy * 0.14],
      ["error", 0.07 + p.error_rate * 0.16],
      ["memory", 0.09 + Math.min(1, state.memory.seen_count / 16) * 0.08],
      ["relate", 0.09 + relationPressure * 0.14],
      ["attend", 0.09 + attentionPressureValue * 0.12],
      ["settle", 0.07 + (state.thought_state.stability || 0) * 0.13],
      ["mutate", 0.07 + Math.abs(c.compression_score - p.error_rate) * 0.08],
      ["act", 0.06 + ((state.thought_state.selected && state.thought_state.selected.pressure) || 0) * 0.08]
    ]);

    candidate.body_field = blend(
      source.body_field,
      pressure,
      1 - source.params.mutation_rate,
      source.params.mutation_rate
    );
    candidate.checksum = checksum({ generation: candidate.generation, params: candidate.params, body_field: candidate.body_field });

    state.candidate_body = candidate;
    return candidate;
  }

  function testCandidateBody(state, candidate, text) {
    const sourceScore = evaluateTextWithBody(state, text || (state.sensory && state.sensory.raw) || "", state.body);
    const candidateScore = candidate
      ? evaluateTextWithBody(state, text || (state.sensory && state.sensory.raw) || "", candidate)
      : null;

    const checks = [
      ["candidate exists", !!candidate],
      ["brain remains one", Math.abs(l1(state.brain_field) - 1) < EPS, l1(state.brain_field)],
      ["attention remains one", Math.abs(l1(state.attention_field) - 1) < EPS, l1(state.attention_field)],
      ["thought remains one", Math.abs(l1(state.thought_field) - 1) < EPS, l1(state.thought_field)],
      ["candidate body equals one", !!candidate && Math.abs(l1(candidate.body_field) - 1) < EPS, candidate && l1(candidate.body_field)],
      ["candidate sandboxed", !!candidate && candidate.direct_source_write_enabled === false],
      ["candidate keeps english disabled", !!candidate && candidate.english_output_enabled === false],
      ["candidate generation advances", !!candidate && candidate.generation === state.body.generation + 1],
      [
        "candidate does not regress survival beyond tolerance",
        !!candidateScore && candidateScore.score + state.body.params.injury_tolerance >= sourceScore.score,
        candidateScore && { old: sourceScore.score, next: candidateScore.score }
      ]
    ].map(row => ({ name: row[0], passed: !!row[1], observed: row[2] }));

    const failed = checks.filter(check => !check.passed);

    return {
      packet_type: "infant_candidate_body_test_v0_3",
      passed: failed.length === 0,
      checks,
      source_score: sourceScore.score,
      candidate_score: candidateScore ? candidateScore.score : 0,
      failed_count: failed.length,
      at: now()
    };
  }

  function recordInjury(state, reason, test) {
    const injury = {
      type: "body_mutation_injury",
      reason,
      source_checksum: state.body && state.body.checksum,
      candidate_checksum: state.candidate_body && state.candidate_body.checksum,
      failed_checks: arr(test && test.checks).filter(check => !check.passed).map(check => check.name),
      at: now()
    };
    state.injury_register.unshift(injury);
    state.injury_register = state.injury_register.slice(0, 64);
    return injury;
  }

  function acceptCandidateBody(state) {
    const previous = state.body;
    state.body = clone(state.candidate_body);
    state.body.previous_checksum = previous.checksum;
    state.body.accepted_at = now();
    state.body_accept_count = (state.body_accept_count || 0) + 1;
    return state.body;
  }

  function observe(state, text) {
    return step(state, text, { autoThink: false });
  }

  function step(state, text, options) {
    const opts = options || {};
    const input = text == null ? ((state.sensory && state.sensory.raw) || "") : String(text);
    state.time += 1;

    const evaluation = evaluateTextWithBody(state, input, state.body);

    state.sensory = evaluation.sensory;
    state.prediction = evaluation.prediction;
    state.compression = evaluation.compression;
    state.error = {
      error_rate: evaluation.prediction.error_rate,
      misses: evaluation.prediction.misses
    };

    remember(state.memory, state.sensory, state.body, state.compression);
    updateInternalMathPacket(state);
    updateBrainField(state, evaluation);

    if (opts.autoThink !== false) {
      think(state, state.body.params.thought_cycles);
      act(state);
    }

    const candidate = proposeCandidateBody(state, evaluation);
    const test = testCandidateBody(state, candidate, input);
    state.candidate_test = test;

    if (test.passed) acceptCandidateBody(state);
    else recordInjury(state, "candidate_failed_survival_test", test);

    enforceBrainEqualsOne(state);
    updateInternalMathPacket(state);

    state.trace.unshift({
      type: "cycle",
      time: state.time,
      brain_l1: state.brain_l1,
      body_l1: state.body_l1,
      attention_l1: state.attention_l1,
      thought_l1: state.thought_l1,
      score: evaluation.score,
      prediction: state.prediction,
      compression_gain: state.compression.gain,
      token_count: state.memory.token_library.length,
      relation_count: state.memory.token_relation_graph.length,
      thought: clone(state.thought_state),
      candidate_passed: test.passed,
      action: state.action_packet.kind,
      at: now()
    });
    state.trace = state.trace.slice(0, 128);
    state.updated_at = now();

    return snapshot(state);
  }

  function run(state, inputs) {
    arr(inputs).forEach(input => step(state, input));
    return snapshot(state);
  }

  function snapshot(state) {
    return clone(state);
  }

  return Object.freeze({
    VERSION,
    create,
    step,
    observe,
    think,
    settle,
    act,
    run,
    sense,
    ngrams,
    predict,
    evaluateTextWithBody,
    updateTokenRelations,
    updateInternalMathPacket,
    proposeCandidateBody,
    testCandidateBody,
    l1,
    normalize,
    checksum,
    snapshot
  });
});
