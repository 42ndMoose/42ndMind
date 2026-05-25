const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " must equal 1, got " + value);
}

const s = K.create();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
assert.strictEqual(s.doctrine.sandbox_result_equals_one, true);
assert.strictEqual(s.doctrine.sandbox_compare_before_source_edit, true);
assert.strictEqual(s.doctrine.direct_source_write, false);

unit(K.l1(s.brain_field), "brain at birth");
unit(K.l1(s.body.body_field), "body at birth");
unit(K.l1(s.language_field), "language at birth");
unit(K.l1(s.meaning_binding_field), "candidate meaning at birth");
unit(K.l1(s.source_body_field), "source body at birth");
unit(K.l1(s.candidate_source_change_field), "candidate source at birth");
unit(K.l1(s.sandbox_result_field), "sandbox result at birth");

K.step(s, "truth proof truth proof claim evidence claim evidence");
unit(K.l1(s.brain_field), "brain after step");
unit(K.l1(s.body.body_field), "body after step");
unit(K.l1(s.language_field), "language after step");
unit(K.l1(s.meaning_binding_field), "candidate meaning after step");
unit(K.l1(s.source_body_field), "source body after step");
unit(K.l1(s.candidate_source_change_field), "candidate source after step");
unit(K.l1(s.sandbox_result_field), "sandbox result after step");

assert.ok(s.sandbox_result_state.checksum, "sandbox result checksum exists");
assert.strictEqual(s.sandbox_result_state.write_enabled, false);
assert.ok(typeof s.sandbox_result_state.accepted === "boolean", "sandbox result accepted flag exists");
assert.ok(typeof s.sandbox_result_state.score_delta === "number", "score delta exists");
assert.ok(typeof s.sandbox_result_state.source_score === "number", "source score exists");
assert.ok(typeof s.sandbox_result_state.candidate_score === "number", "candidate score exists");
assert.ok(typeof s.sandbox_result_state.prediction_delta === "number", "prediction delta exists");
assert.ok(typeof s.sandbox_result_state.compression_delta === "number", "compression delta exists");
assert.ok(typeof s.sandbox_result_state.improvement_reason === "string", "improvement reason exists");
assert.ok(typeof s.sandbox_result_state.injury_reason === "string", "injury reason exists");
assert.ok(s.internal_math_packet.expressions.includes("sandbox_result=1"));
assert.ok(s.internal_math_packet.expressions.includes("sandbox score = unit + prediction + compression + binding survival + source coherence + boundary safety"));
assert.strictEqual(s.internal_math_packet.sandbox_result_l1, 1);

K.think(s, 6);
assert.ok(s.thought_state.candidates.some(a => a.kind === "attend_sandbox_result"), "sandbox result can enter action competition");
unit(K.l1(s.brain_field), "brain after thought");
unit(K.l1(s.sandbox_result_field), "sandbox result after thought");

const action = K.act(s);
assert.strictEqual(action.english, "");
assert.strictEqual(s.english_expression_channel.enabled, false);
assert.strictEqual(s.sandbox_result_state.write_enabled, false);
assert.strictEqual(s.body.direct_source_write_enabled, false);

console.log("PASS infant v05 sandbox result test");
