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
  unit(K.l1(state.attention_field), label + " attention");
  unit(K.l1(state.thought_field), label + " thought");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " english channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action english empty");
  assert.strictEqual(state.binding_state.quarantined, true, label + " bindings quarantined");
}

const stream = "truth proof truth proof claim evidence claim evidence";
const s = K.create();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
check(s, "birth");

K.step(s, stream);
check(s, "after first exposure");
assert.ok(s.memory.meaning_bindings.length > 0, "bindings should form");
const first = s.memory.meaning_bindings[0];
assert.ok(first.exposures >= 1, "first binding exposure exists");
assert.ok(first.status === "candidate", "binding stays candidate");
assert.ok(!s.memory.meaning_bindings.some(b => b.status === "truth"), "no binding becomes truth");

const firstExposure = first.exposures;
const firstSupport = first.support;
const firstStability = first.stability;

for (let i = 0; i < 12; i += 1) {
  K.step(s, stream);
  check(s, "repeated exposure " + i);
}

const later = s.memory.meaning_bindings.find(b => b.surface === first.surface && b.term === first.term) || s.memory.meaning_bindings[0];
assert.ok(later.exposures > firstExposure, "exposures should compound");
assert.ok(later.support >= firstSupport, "support should not decrease under repeated matching context");
assert.ok(later.stability >= firstStability, "stability should not decrease under repeated matching context");
assert.ok(s.binding_state.average_stability >= firstStability, "average stability should reflect repeated contact");
assert.ok(s.internal_math_packet.binding_average_stability >= firstStability, "packet reports binding stability growth");
assert.ok(s.internal_math_packet.expressions.includes("survival(μ)=support/exposure/conflict/context"), "packet includes survival expression");

K.observe(s, "truth proof claim evidence truth proof claim evidence");
K.think(s, 6);
const action = K.act(s);
check(s, "after observe-think-act");
assert.ok(action.enabled, "action exists");
assert.ok([
  "emit_binding_survivor",
  "emit_binding_candidate",
  "emit_math",
  "emit_token",
  "emit_relation",
  "attend",
  "inquire",
  "hold",
  "predict_ready"
].includes(action.kind), "action kind should be symbolic");
assert.strictEqual(action.english, "", "no English output");

console.log("PASS infant v05 compounding growth test");
