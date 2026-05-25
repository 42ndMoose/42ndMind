const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " must equal 1, got " + value);
}

function checkUnitState(state, label) {
  unit(K.l1(state.brain_field), label + " brain");
  unit(K.l1(state.body.body_field), label + " body");
  unit(K.l1(state.language_field), label + " language");
  unit(K.l1(state.meaning_binding_field), label + " candidate meaning");
  unit(K.l1(state.source_body_field), label + " source body");
  unit(K.l1(state.candidate_source_change_field), label + " candidate source");
  unit(K.l1(state.sandbox_result_field), label + " sandbox result");
  unit(K.l1(state.attention_field), label + " attention");
  unit(K.l1(state.thought_field), label + " thought");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " English off");
  assert.strictEqual(state.action_packet.english, "", label + " action English empty");
  assert.strictEqual(state.body.direct_source_write_enabled, false, label + " body cannot write source");
  assert.strictEqual(state.sandbox_result_state.write_enabled, false, label + " sandbox cannot write source");
}

const s = K.create();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
assert.strictEqual(s.doctrine.sandbox_compare_before_source_edit, true);
assert.strictEqual(s.doctrine.candidate_source_is_sandbox_only, true);
checkUnitState(s, "birth");

const streams = [
  "truth proof truth proof claim evidence claim evidence",
  "truth proof truh proof truth proof truh proof",
  "claim evidence claim counter claim evidence",
  "abababab abababab abababab"
];

for (let i = 0; i < streams.length; i += 1) {
  K.step(s, streams[i]);
  checkUnitState(s, "cycle " + i);
  assert.ok(s.sandbox_result_state.checksum, "cycle " + i + " has sandbox checksum");
  assert.ok(typeof s.sandbox_result_state.improvement_reason === "string", "cycle " + i + " has improvement reason");
  assert.ok(typeof s.sandbox_result_state.injury_reason === "string", "cycle " + i + " has injury reason");
  assert.ok(typeof s.sandbox_result_state.accepted === "boolean", "cycle " + i + " has accepted flag");
}

const cycleEntries = s.trace.filter(row => row.type === "cycle");
assert.ok(cycleEntries.length >= streams.length, "trace retains cycle entries");
assert.ok(cycleEntries.every(row => row.sandbox_result), "each cycle trace keeps sandbox result snapshot");
assert.ok(cycleEntries.every(row => typeof row.sandbox_result.improvement_reason === "string"), "trace retains improvement reasons");
assert.ok(cycleEntries.every(row => typeof row.sandbox_result.injury_reason === "string"), "trace retains injury reasons");
assert.ok(cycleEntries.every(row => typeof row.sandbox_result.score_delta === "number"), "trace retains score deltas");
assert.ok(cycleEntries.every(row => row.sandbox_result.write_enabled === false), "trace confirms sandbox cannot write");

K.think(s, 6);
const action = K.act(s);
checkUnitState(s, "after thought-action");
assert.ok(s.thought_state.candidates.some(a => a.kind === "attend_sandbox_result"), "thought can attend to sandbox result");
assert.strictEqual(action.english, "", "no English action");

console.log("PASS infant v05 sandbox memory test");
