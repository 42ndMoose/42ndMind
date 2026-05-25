const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " must equal 1, got " + value);
}

function check(state, label) {
  unit(K.l1(state.brain_field), label + " brain");
  unit(K.l1(state.body.body_field), label + " body");
  unit(K.l1(state.language_field), label + " language");
  unit(K.l1(state.meaning_binding_field), label + " candidate meaning");
  unit(K.l1(state.source_body_field), label + " source body");
  unit(K.l1(state.candidate_source_change_field), label + " candidate source");
  unit(K.l1(state.sandbox_result_field), label + " sandbox result");
  unit(K.l1(state.attention_field), label + " attention");
  unit(K.l1(state.thought_field), label + " thought");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " English channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action English empty");
  assert.strictEqual(state.source_body_state.write_enabled, false, label + " source body cannot write");
  assert.strictEqual(state.candidate_source_change_state.write_enabled, false, label + " candidate source cannot write");
  assert.strictEqual(state.candidate_source_change_state.sandbox_only, true, label + " candidate source sandbox only");
  assert.strictEqual(state.sandbox_result_state.write_enabled, false, label + " sandbox cannot write");
}

function runScenario(name, stream, repeats) {
  const s = K.create();
  assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
  check(s, name + " birth");

  for (let i = 0; i < repeats; i += 1) {
    K.step(s, stream);
    check(s, name + " step " + i);
    assert.ok(typeof s.sandbox_result_state.score_delta === "number", name + " score delta exists");
    assert.ok(typeof s.sandbox_result_state.improvement_reason === "string", name + " improvement reason exists");
    assert.ok(typeof s.sandbox_result_state.injury_reason === "string", name + " injury reason exists");
    assert.ok(s.sandbox_result_state.checksum, name + " sandbox checksum exists");
  }

  const before = JSON.stringify(s.sandbox_result_state);
  K.observe(s, stream);
  K.think(s, 6);
  const action = K.act(s);
  check(s, name + " observe-think-act");
  assert.strictEqual(action.english, "", name + " no English action");
  assert.ok(s.thought_state.candidates.some(a => a.kind === "attend_sandbox_result"), name + " sandbox result enters action competition");
  assert.ok(before.length > 0, name + " previous sandbox result captured");

  return {
    name,
    accepted: s.sandbox_result_state.accepted,
    source_score: s.sandbox_result_state.source_score,
    candidate_score: s.sandbox_result_state.candidate_score,
    score_delta: s.sandbox_result_state.score_delta,
    prediction_delta: s.sandbox_result_state.prediction_delta,
    compression_delta: s.sandbox_result_state.compression_delta,
    improvement_reason: s.sandbox_result_state.improvement_reason,
    injury_reason: s.sandbox_result_state.injury_reason,
    action: action.kind
  };
}

const results = [];
results.push(runScenario("repetition", "abababab abababab abababab", 5));
results.push(runScenario("relation", "truth proof truth proof claim evidence claim evidence", 5));
results.push(runScenario("variation", "truth proof truh proof truth proof truh proof", 5));
results.push(runScenario("claim counter", "claim evidence claim counter claim evidence", 5));
results.push(runScenario("noise", "xqz 91 %% ?? blorp", 2));

assert.ok(results.every(r => typeof r.score_delta === "number"), "all scenarios produce numeric score delta");
assert.ok(results.every(r => typeof r.improvement_reason === "string"), "all scenarios produce improvement reason");
assert.ok(results.every(r => typeof r.injury_reason === "string"), "all scenarios produce injury reason");

console.log("PASS infant v05 sandbox scenario battery");
console.log(JSON.stringify(results, null, 2));
