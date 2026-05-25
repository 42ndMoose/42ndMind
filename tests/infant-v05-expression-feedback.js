const assert = require("assert");
const K = require("../src/infant-expression-feedback-v0-1.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " expected 1, got " + value);
}

function check(state, label) {
  const u = K.unitMap(state);
  Object.keys(u).forEach(key => unit(u[key], label + " " + key));
  unit(K.l1(state.expression_field || [{axis:"idle", weight:1}]), label + " expression");
  unit(K.l1(state.expression_feedback_field || [{axis:"idle", weight:1}]), label + " expression feedback");
  unit(K.l1(state.attention_field), label + " attention");
  unit(K.l1(state.thought_field), label + " thought");
  unit(K.l1(state.brain_field), label + " brain");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " English channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action English empty");
}

const s = K.birth();
assert.strictEqual(K.EXPRESSION_FEEDBACK_VERSION, "0.1.0");

K.perceive(s, "abababab cdcdcdcd abababab cdcdcdcd");
K.updateExpressionField(s);
K.expressionSignal(s);
check(s, "after signal");

assert.ok(s.expression_feedback_state.participates, "expression feedback participates");
assert.ok(s.expression_feedback_state.focus, "expression feedback focus exists");
assert.ok(s.expression_feedback_state.selected_expression, "selected expression exists");

const beforeAttention = JSON.stringify(s.attention_field);
const beforeThought = JSON.stringify(s.thought_field);
const beforeBrain = JSON.stringify(s.brain_field);
K.injectExpression(s);
check(s, "after injection");

assert.notStrictEqual(JSON.stringify(s.attention_field), beforeAttention, "attention should change after expression injection");
assert.notStrictEqual(JSON.stringify(s.thought_field), beforeThought, "thought should change after expression injection");
assert.notStrictEqual(JSON.stringify(s.brain_field), beforeBrain, "brain should change after expression injection");
assert.ok(s.attention_field.some(row => String(row.axis).startsWith("expr:") || String(row.axis).startsWith("learned_drive:")), "attention contains expression or learned drive signal");
assert.ok(s.thought_field.some(row => String(row.axis).startsWith("expr:") || String(row.axis).startsWith("learned_drive:")), "thought contains expression or learned drive signal");
assert.ok(s.brain_field.some(row => String(row.axis).startsWith("expr:") || String(row.axis).startsWith("learned_drive:")), "brain contains expression or learned drive signal");

const externalTime = s.time;
const result = K.feedbackLive(s, 8, 4);
check(s, "after feedback live");
assert.strictEqual(s.time, externalTime, "feedback live must not consume new outside observation");
assert.ok(result.rows.length === 8, "one row per feedback tick");
assert.ok(s.trace.some(row => row.type === "expression_feedback_tick"), "trace records expression feedback ticks");
assert.strictEqual(K.feedbackPacket(s).participates, true, "feedback packet marks participation");
assert.strictEqual(K.feedbackPacket(s).english, "", "feedback packet has no English output");

console.log("PASS infant expression feedback bridge test");
