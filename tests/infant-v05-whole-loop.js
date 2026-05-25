const assert = require("assert");
const K = require("../src/infant-whole-loop-v0-1.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " expected 1, got " + value);
}

function check(state, label) {
  const u = K.wholeUnitMap(state);
  Object.keys(u).forEach(key => unit(u[key], label + " " + key));
  assert.strictEqual(K.wholeAllUnit(state), true, label + " all unit");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " English channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action English empty");
}

const s = K.birthWhole();
assert.strictEqual(K.WHOLE_LOOP_VERSION, "0.1.0");
K.wholeField(s);
check(s, "birth whole");
assert.ok(s.whole_state.participates, "whole state participates");
assert.ok(s.whole_state.focus, "whole focus exists");

K.perceiveWhole(s, "abababab cdcdcdcd abababab cdcdcdcd");
K.wholeField(s);
check(s, "after perceive whole");

const beforeAttention = JSON.stringify(s.attention_field);
const beforeThought = JSON.stringify(s.thought_field);
const beforeBrain = JSON.stringify(s.brain_field);
K.injectWhole(s);
check(s, "after inject whole");

assert.notStrictEqual(JSON.stringify(s.attention_field), beforeAttention, "attention should change after whole injection");
assert.notStrictEqual(JSON.stringify(s.thought_field), beforeThought, "thought should change after whole injection");
assert.notStrictEqual(JSON.stringify(s.brain_field), beforeBrain, "brain should change after whole injection");
assert.ok(s.attention_field.some(row => String(row.axis).startsWith("whole:") || String(row.axis).startsWith("expr:") || String(row.axis).startsWith("learned_drive:")), "attention contains whole or lower-loop signal");
assert.ok(s.thought_field.some(row => String(row.axis).startsWith("whole:") || String(row.axis).startsWith("expr:") || String(row.axis).startsWith("learned_drive:")), "thought contains whole or lower-loop signal");
assert.ok(s.brain_field.some(row => String(row.axis).startsWith("whole:") || String(row.axis).startsWith("expr:") || String(row.axis).startsWith("learned_drive:")), "brain contains whole or lower-loop signal");

const externalTime = s.time;
const result = K.wholeLive(s, 8, 4);
check(s, "after whole live");
assert.strictEqual(s.time, externalTime, "whole live must not consume new outside observation");
assert.ok(result.rows.length === 8, "one row per whole tick");
assert.ok(s.trace.some(row => row.type === "whole_tick"), "trace records whole ticks");
assert.strictEqual(K.wholePacket(s).participates, true, "whole packet marks participation");
assert.strictEqual(K.wholePacket(s).english, "", "whole packet has no English output");

console.log("PASS infant whole organism loop test");
