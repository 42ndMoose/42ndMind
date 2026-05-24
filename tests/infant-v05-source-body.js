const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " must equal 1, got " + value);
}

const s = K.create();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
assert.strictEqual(s.doctrine.source_body_equals_one, true);
assert.strictEqual(s.doctrine.self_observation_before_source_edit, true);
unit(K.l1(s.brain_field), "brain");
unit(K.l1(s.body.body_field), "body");
unit(K.l1(s.language_field), "language");
unit(K.l1(s.meaning_binding_field), "candidate meaning");
unit(K.l1(s.source_body_field), "source body");

K.step(s, "truth proof truth proof claim evidence claim evidence");
assert.ok(s.source_body_state.checksum, "source body checksum exists");
assert.strictEqual(s.source_body_state.write_enabled, false);
assert.strictEqual(s.source_body_state.attention_ready, true);
unit(K.l1(s.source_body_field), "source body after step");
assert.strictEqual(s.internal_math_packet.source_body_l1, 1);
assert.ok(s.internal_math_packet.expressions.includes("source_body=1"));
assert.ok(s.internal_math_packet.expressions.includes("self-observation precedes source edit"));
assert.ok(s.trace[0].source_body_checksum, "trace records source body checksum");

K.think(s, 6);
assert.ok(s.thought_state.candidates.some(a => a.kind === "attend_source_body"), "source body can enter action competition");
unit(K.l1(s.brain_field), "brain after thought");
unit(K.l1(s.source_body_field), "source body after thought");
const action = K.act(s);
assert.strictEqual(action.english, "");
assert.strictEqual(s.english_expression_channel.enabled, false);

console.log("PASS infant v05 source body test");
