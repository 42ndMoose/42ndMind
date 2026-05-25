const assert = require("assert");
const K = require("../src/infant-drive-learning-v0-1.js");

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
  unit(K.l1(state.inner_cycle_field || [{axis:"idle", weight:1}]), label + " inner cycle");
  unit(K.l1(state.drive_field || [{axis:"idle", weight:1}]), label + " drive");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " English channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action English empty");
}

const s = K.create();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
assert.strictEqual(K.CYCLE_VERSION, "0.1.0");
assert.strictEqual(K.DRIVE_VERSION, "0.1.0");
assert.strictEqual(K.DRIVE_LEARNING_VERSION, "0.1.0");

K.step(s, "truth proof truth proof claim evidence claim evidence");
check(s, "after observation");

K.ensureLearning(s);
K.updateLearnedDrive(s);
unit(K.l1(s.drive_field), "learned drive field");
assert.ok(s.drive_learning.enabled, "drive learning enabled");
assert.ok(s.drive_state.learned, "learned drive state marked");
assert.ok(s.drive_state.focus, "learned drive focus exists");

const externalTime = s.time;
const thoughtCycles = s.thought_state.cycle_count;
const updates = s.drive_learning.updates;
const result = K.learningCycle(s, 8, 4);

assert.strictEqual(s.time, externalTime, "learning cycle must not consume a new outside observation");
assert.ok(s.thought_state.cycle_count > thoughtCycles, "thought cycle count must increase");
assert.ok(s.drive_learning.updates > updates, "drive learning updates must increase");
assert.ok(s.drive_learning.history.length > 0, "drive learning history must exist");
assert.ok(typeof s.drive_learning.last_reward === "number", "last reward must be numeric");
assert.ok(s.drive_learning.last_focus, "last focus must exist");
assert.ok(result.rows.length === 8, "one row per learning tick");
unit(K.l1(s.drive_field), "drive field after learning cycle");
check(s, "after learning cycle");

assert.ok(s.trace.some(row => row.type === "drive_learning_cycle"), "trace records drive learning cycles");
assert.ok(s.trace.some(row => row.type === "inner_cycle"), "trace records inner cycles");
assert.ok(s.action_packet.kind, "symbolic action exists");
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

console.log("PASS infant v05 drive learning bridge test");
