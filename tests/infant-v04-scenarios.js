const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

function unit(x) { assert.ok(Math.abs(x - 1) < 1e-6, "not unit: " + x); }

const s = K.create();
assert.strictEqual(K.VERSION, "0.4.0-math-language");
unit(K.l1(s.brain_field));
unit(K.l1(s.body.body_field));
unit(K.l1(s.language_field));
assert.strictEqual(s.english_expression_channel.enabled, false);

K.step(s, "abababab cdcdcdcd ababab cdcdcdcd");
assert.ok(s.memory.token_library.length > 0);
assert.ok(s.memory.token_relation_graph.length > 0);
assert.ok(s.memory.language_terms.length > 0);
unit(K.l1(s.language_field));
assert.strictEqual(s.internal_math_packet.language_l1, 1);
assert.ok(s.internal_math_packet.expressions.includes("language=1"));
assert.ok(s.thought_state.candidates.length > 0);
assert.ok(s.action_packet.enabled);
assert.strictEqual(s.action_packet.english, "");

const before = s.memory.language_terms.length;
for (let i = 0; i < 6; i += 1) K.step(s, "red red blue red red blue red red blue");
assert.ok(s.memory.language_terms.length >= before);
unit(K.l1(s.brain_field));
unit(K.l1(s.language_field));
unit(K.l1(s.attention_field));
unit(K.l1(s.thought_field));

K.observe(s, "claim evidence claim counter claim evidence");
assert.ok(s.sensory.raw.includes("claim"));
K.think(s, 5);
const settled = K.settle(s);
assert.ok(settled.selected);
const action = K.act(s);
assert.ok(["emit_math", "emit_token", "emit_relation", "attend", "inquire", "hold", "predict_ready"].includes(action.kind));
assert.strictEqual(action.english, "");
unit(K.l1(s.brain_field));
unit(K.l1(s.language_field));

console.log("PASS infant v04 math language scenarios");
