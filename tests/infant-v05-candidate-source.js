const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " must equal 1, got " + value);
}

const s = K.create();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
assert.strictEqual(s.doctrine.source_body_equals_one, true);
assert.strictEqual(s.doctrine.candidate_source_change_equals_one, true);
assert.strictEqual(s.doctrine.candidate_source_is_sandbox_only, true);
assert.strictEqual(s.doctrine.direct_source_write, false);

unit(K.l1(s.brain_field), "brain at birth");
unit(K.l1(s.body.body_field), "body at birth");
unit(K.l1(s.language_field), "language at birth");
unit(K.l1(s.meaning_binding_field), "candidate meaning at birth");
unit(K.l1(s.source_body_field), "source body at birth");
unit(K.l1(s.candidate_source_change_field), "candidate source at birth");

K.step(s, "truth proof truth proof claim evidence claim evidence");
unit(K.l1(s.brain_field), "brain after step");
unit(K.l1(s.body.body_field), "body after step");
unit(K.l1(s.language_field), "language after step");
unit(K.l1(s.meaning_binding_field), "candidate meaning after step");
unit(K.l1(s.source_body_field), "source body after step");
unit(K.l1(s.candidate_source_change_field), "candidate source after step");

assert.ok(s.source_body_state.checksum, "source body checksum exists");
assert.ok(s.candidate_source_change_state.checksum, "candidate source checksum exists");
assert.strictEqual(s.source_body_state.write_enabled, false);
assert.strictEqual(s.candidate_source_change_state.write_enabled, false);
assert.strictEqual(s.candidate_source_change_state.sandbox_only, true);
assert.strictEqual(s.candidate_source_change_state.proposed, false);
assert.ok(s.candidate_source_change_state.selected, "candidate source selected pressure exists");
assert.ok(s.candidate_source_change_state.selected.reason, "candidate source includes reason");
assert.ok(s.internal_math_packet.expressions.includes("candidate_source_change=1"));
assert.ok(s.internal_math_packet.expressions.includes("candidate source changes are sandbox-only"));
assert.strictEqual(s.internal_math_packet.candidate_source_l1, 1);

K.think(s, 6);
assert.ok(s.thought_state.candidates.some(a => a.kind === "attend_candidate_source_change"), "candidate source can enter attention/action competition");
unit(K.l1(s.brain_field), "brain after thought");
unit(K.l1(s.candidate_source_change_field), "candidate source after thought");

const action = K.act(s);
assert.strictEqual(action.english, "");
assert.strictEqual(s.english_expression_channel.enabled, false);
assert.strictEqual(s.candidate_source_change_state.write_enabled, false);
assert.strictEqual(s.body.direct_source_write_enabled, false);

console.log("PASS infant v05 candidate source change test");
