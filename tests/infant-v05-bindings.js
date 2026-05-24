const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " must equal 1, got " + value);
}

const s = K.create();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
unit(K.l1(s.brain_field), "brain");
unit(K.l1(s.language_field), "language");
unit(K.l1(s.meaning_binding_field), "candidate meaning");
assert.strictEqual(s.english_expression_channel.enabled, false);
assert.strictEqual(s.doctrine.bindings_are_candidates_not_truth, true);

K.step(s, "truth proof truth proof claim evidence claim evidence");
assert.ok(s.memory.token_library.length > 0);
assert.ok(s.memory.language_terms.length > 0);
assert.ok(s.memory.meaning_bindings.length > 0);
unit(K.l1(s.brain_field), "brain after first step");
unit(K.l1(s.language_field), "language after first step");
unit(K.l1(s.meaning_binding_field), "candidate meaning after first step");
assert.strictEqual(s.binding_state.quarantined, true);
assert.strictEqual(s.internal_math_packet.binding_l1, 1);
assert.ok(s.internal_math_packet.expressions.includes("candidate_meaning=1"));
assert.strictEqual(s.action_packet.english, "");

for (let i = 0; i < 6; i += 1) {
  K.step(s, "truth proof truth proof claim evidence claim evidence");
}
assert.ok(s.memory.meaning_bindings.length > 0);
unit(K.l1(s.brain_field), "brain after repeated steps");
unit(K.l1(s.language_field), "language after repeated steps");
unit(K.l1(s.meaning_binding_field), "candidate meaning after repeated steps");
unit(K.l1(s.attention_field), "attention after repeated steps");
unit(K.l1(s.thought_field), "thought after repeated steps");

K.observe(s, "counter claim evidence counter claim evidence");
K.think(s, 5);
const settled = K.settle(s);
assert.ok(settled.selected);
const action = K.act(s);
assert.ok(action.enabled);
assert.strictEqual(action.english, "");
assert.ok([
  "emit_binding_candidate",
  "emit_math",
  "emit_token",
  "emit_relation",
  "attend",
  "inquire",
  "hold",
  "predict_ready"
].includes(action.kind));
unit(K.l1(s.brain_field), "brain after observe-think-act");
unit(K.l1(s.language_field), "language after observe-think-act");
unit(K.l1(s.meaning_binding_field), "candidate meaning after observe-think-act");

console.log("PASS infant v05 meaning-binding scenarios");
