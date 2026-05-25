const assert = require("assert");
const K = require("../src/infant-cycle-v0-1.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " expected 1, got " + value);
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
}

const s = K.create();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
assert.strictEqual(K.CYCLE_VERSION, "0.1.0");

K.step(s, "truth proof truth proof claim evidence claim evidence");
check(s, "after observation");

const externalTime = s.time;
const thoughtCycles = s.thought_state.cycle_count;

const result = K.innerCycle(s, 8, 4);
assert.strictEqual(result.inner_cycle_state.uses_new_observation, false);
assert.strictEqual(result.inner_cycle_state.time_preserved, true);
assert.strictEqual(s.time, externalTime, "inner cycle must not consume new outside observation");
assert.ok(s.thought_state.cycle_count > thoughtCycles, "thought cycle count must increase");
assert.ok(s.inner_time >= 8, "inner time must advance");
assert.ok(s.inner_cycle_state.last_action, "last action exists");
assert.ok(s.inner_cycle_state.last_focus, "last focus exists");
unit(K.l1(s.inner_cycle_field), "inner cycle field");
check(s, "after inner cycles");

assert.ok(s.trace.some(row => row.type === "inner_cycle"), "trace records inner cycles");
assert.ok(s.thought_state.candidates.length > 0, "candidate actions exist");
assert.ok(s.thought_state.selected, "selected action exists");
assert.ok([
  "hold",
  "attend",
  "attend_source_body",
  "attend_candidate_source_change",
  "attend_sandbox_result",
  "emit_binding_candidate",
  "emit_binding_survivor",
  "emit_math",
  "inquire",
  "predict_ready"
].includes(s.action_packet.kind), "valid symbolic action");

console.log("PASS infant v05 inner cycle bridge test");
