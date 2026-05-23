/* 42ndMind Infant Symbolic Kernel v0.1
 * First-principles infant layer.
 *
 * Doctrine:
 * - brain = 1
 * - no semantic-label learning layer
 * - raw stream first
 * - compression before language
 * - prediction/error before meaning
 * - runtime body changes only inside the state
 * - English output disabled
 *
 * This is not a chatbot and not a completed brain.
 * It is the lowest layer: raw symbols -> pattern pressure -> compression
 * -> prediction -> error -> memory update -> runtime body mutation.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FortySecondMindInfantSymbolicKernel = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = "0.1.0-brain-one";
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
      type: "infant_runtime_body_v0_1",
      generation: 0,
      direct_source_write_enabled: false,
      english_output_enabled: false,
      params: Object.assign({
        max_ngram: 4,
        min_repeat: 2,
        prediction_order: 1,
        mutation_rate: 0.08,
        injury_tolerance: 0.02,
        max_tokens: 128
      }, seed && seed.params || {}),
      body_field: normalize(seed && seed.body_field || [
        ["sense", 0.14],
        ["pattern", 0.14],
        ["compress", 0.14],
        ["predict", 0.14],
        ["error", 0.12],
        ["memory", 0.12],
        ["mutate", 0.10],
        ["act", 0.10]
      ])
    };
    body.checksum = checksum({ generation: body.generation, params: body.params, body_field: body.body_field });
    return body;
  }

  function create(seed) {
    const state = {
      packet_type: "42ndMind_infant_symbolic_kernel_v0_1",
      version: VERSION,
      doctrine: {
        brain_equals_one: true,
        no_semantic_label_learning_layer: true,
        raw_stream_first: true,
        compression_before_language: true,
        english_output_disabled: true,
        direct_source_write: false
      },
      time: 0,
      brain_field: normalize(seed && seed.brain_field || [
        ["sense", 0.15],
        ["pattern", 0.13],
        ["compress", 0.12],
        ["predict", 0.12],
        ["error", 0.12],
        ["memory", 0.12],
        ["mutate", 0.12],
        ["act", 0.12]
      ]),
      body: createBody(seed && seed.body),
      memory: {
        seen_count: 0,
        symbol_counts: {},
        transition_counts: {},
        ngram_counts: {},
        token_library: [],
        token_index: {}
      },
      sensory: null,
      prediction: null,
      compression: null,
      error: null,
      candidate_body: null,
      candidate_test: null,
      injury_register: [],
      action_packet: { enabled: true, kind: "none", symbols: [], english: "" },
      english_expression_channel: { enabled: false, content: "" },
      trace: [],
      updated_at: now()
    };
    enforceBrainEqualsOne(state);
    return state;
  }

  function enforceBrainEqualsOne(state) {
    state.brain_field = normalize(state.brain_field);
    state.body.body_field = normalize(state.body.body_field);
    state.brain_l1 = l1(state.brain_field);
    state.body_l1 = l1(state.body.body_field);
    return Math.abs(state.brain_l1 - 1) < EPS && Math.abs(state.body_l1 - 1) < EPS;
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
      score: round(prediction.accuracy * 0.42 + prediction.coverage * 0.14 + compression_score * 0.28 + stable * 0.16),
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
  }

  function updateBrainField(state, evaluation) {
    const p = evaluation.prediction;
    const c = evaluation.compression;
    const injury = state.injury_register.length ? Math.min(0.25, state.injury_register.length * 0.03) : 0;

    state.brain_field = normalize([
      ["sense", 0.10 + (evaluation.sensory.length ? 0.10 : 0)],
      ["pattern", 0.10 + Math.min(1, c.candidates.length / 12) * 0.18],
      ["compress", 0.08 + c.compression_score * 0.24],
      ["predict", 0.08 + p.accuracy * 0.20],
      ["error", 0.08 + p.error_rate * 0.24],
      ["memory", 0.08 + Math.min(1, state.memory.seen_count / 16) * 0.16],
      ["mutate", 0.08 + (p.error_rate + c.compression_score) * 0.10],
      ["act", 0.07 + p.coverage * 0.10],
      ["injury", injury]
    ]);

    enforceBrainEqualsOne(state);
  }

  function proposeCandidateBody(state, evaluation) {
    const source = state.body;
    const candidate = clone(source);
    const p = evaluation.prediction;
    const c = evaluation.compression;

    candidate.generation = source.generation + 1;

    if (c.candidates.length && candidate.params.max_ngram < 8) candidate.params.max_ngram += 1;
    if (p.coverage > 0.75 && p.accuracy > 0.55 && candidate.params.prediction_order < 3) {
      candidate.params.prediction_order += 1;
    }
    if (p.error_rate > 0.65 && candidate.params.prediction_order > 1) {
      candidate.params.prediction_order -= 1;
    }

    const pressure = normalize([
      ["sense", 0.10],
      ["pattern", 0.12 + Math.min(1, c.candidates.length / 10) * 0.18],
      ["compress", 0.12 + c.compression_score * 0.22],
      ["predict", 0.12 + p.accuracy * 0.18],
      ["error", 0.08 + p.error_rate * 0.20],
      ["memory", 0.12 + Math.min(1, state.memory.seen_count / 16) * 0.10],
      ["mutate", 0.10 + Math.abs(c.compression_score - p.error_rate) * 0.12],
      ["act", 0.08 + p.coverage * 0.10]
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
      packet_type: "infant_candidate_body_test_v0_1",
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

  function act(state, evaluation) {
    const p = evaluation.prediction;
    const c = evaluation.compression;
    let kind = "hold";
    let symbols = [];

    if (p.coverage < 0.25 || p.error_rate > 0.72) {
      kind = "inquire";
      symbols = ["?"];
    } else if (c.candidates.length) {
      kind = "emit_token";
      symbols = [c.candidates[0].pattern];
    } else if (p.accuracy > 0.65) {
      kind = "predict_ready";
      symbols = ["→"];
    }

    state.action_packet = { enabled: true, kind, symbols, english: "", at: now() };
    state.english_expression_channel = { enabled: false, content: "" };
    return state.action_packet;
  }

  function step(state, text) {
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

    updateBrainField(state, evaluation);
    remember(state.memory, state.sensory, state.body, state.compression);

    const candidate = proposeCandidateBody(state, evaluation);
    const test = testCandidateBody(state, candidate, input);
    state.candidate_test = test;

    if (test.passed) acceptCandidateBody(state);
    else recordInjury(state, "candidate_failed_survival_test", test);

    act(state, evaluation);
    enforceBrainEqualsOne(state);

    state.trace.unshift({
      type: "cycle",
      time: state.time,
      brain_l1: state.brain_l1,
      body_l1: state.body_l1,
      score: evaluation.score,
      prediction: state.prediction,
      compression_gain: state.compression.gain,
      token_count: state.memory.token_library.length,
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
    run,
    sense,
    ngrams,
    predict,
    evaluateTextWithBody,
    proposeCandidateBody,
    testCandidateBody,
    l1,
    normalize,
    checksum,
    snapshot
  });
});
