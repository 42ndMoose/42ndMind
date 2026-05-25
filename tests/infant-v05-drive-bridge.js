const assert = require("assert");
const K = require("../src/infant-drive-v0-1.js");

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

K.step(s, "truth proof truth proof claim evidence claim evidence");
check(s, "after observation");

K.updateDrive(s);
assert.ok(s.drive_state.focus, "drive focus exists");
assert.ok(s.drive_state.reason, "drive reason exists");
unit(K.l1(s.drive_field), "drive field after update");

const externalTime = s.time;
const thoughtCycles = s.thought_state.cycle_count;
const result = K.driveCycle(s, 6, 4);

assert.strictEqual(result.drive_state.english, "");
assert.strictEqual(s.time, externalTime, "drive cycle must not consume a new outside observation");
assert.ok(s.thought_state.cycle_count > thoughtCycles, "thought cycle count must increase");
assert.ok(s.drive_state.focus, "drive focus still exists");
assert.ok(s.drive_state.should_continue, "drive should continue while pressure exists");
unit(K.l1(s.drive_field), "drive field after drive cycle");
check(s, "after drive cycle");

assert.ok(s.trace.some(row => row.type === "drive_cycle"), "trace records drive cycles");
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

console.log("PASS infant v05 drive bridge test");
