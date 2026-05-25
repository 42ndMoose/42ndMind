const assert = require("assert");
const K = require("../src/infant-expression-field-v0-1.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " expected 1, got " + value);
}

function check(state, label) {
  const u = K.unitMap(state);
  Object.keys(u).forEach(key => unit(u[key], label + " " + key));
  unit(K.l1(state.expression_field || [{axis:"idle", weight:1}]), label + " expression");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " English channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action English empty");
}

const s = K.birth();
K.perceive(s, "abababab cdcdcdcd abababab cdcdcdcd");
check(s, "after perceive");

K.updateExpressionField(s);
unit(K.l1(s.expression_field), "expression field");
assert.ok(s.expression_state.count > 0, "expressions should form");
assert.ok(s.expression_state.base_count > 0, "base items should form");
assert.ok(s.expression_state.score >= 0, "score should exist");
assert.strictEqual(s.expression_state.english, "", "no English output");

const beforeCount = s.expression_state.count;
const result = K.liveExpression(s, 12, 4);
check(s, "after live expression");

assert.ok(result.rows.length === 12, "one row per expression tick");
assert.ok(s.trace.some(row => row.type === "expression_tick"), "trace records expression ticks");
assert.ok(s.expression_state.count >= beforeCount, "expression count should not shrink under internal run");
assert.ok(s.expression_state.score >= 0, "score remains numeric");
assert.ok(K.expressionPacket(s).expressions.length > 0, "packet exposes expressions");
assert.strictEqual(K.expressionPacket(s).english, "", "packet has no English output");

console.log("PASS infant expression field bridge test");
