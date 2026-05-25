const assert = require("assert");
const K = require("../src/infant-organism-v0-1.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " expected 1, got " + value);
}

function check(state, label) {
  const u = K.unitMap(state);
  Object.keys(u).forEach(key => unit(u[key], label + " " + key));
  assert.strictEqual(K.allUnit(state), true, label + " all unit");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " English channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action English empty");
}

const s = K.birth();
assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
assert.strictEqual(K.CYCLE_VERSION, "0.1.0");
assert.strictEqual(K.DRIVE_VERSION, "0.1.0");
assert.strictEqual(K.DRIVE_LEARNING_VERSION, "0.1.0");
assert.strictEqual(K.ORGANISM_VERSION, "0.1.0");
assert.strictEqual(s.organism_state.alive, true);
check(s, "birth");

K.perceive(s, "truth proof truth proof claim evidence claim evidence");
check(s, "after perceive");
assert.ok(s.memory.language_terms.length > 0, "language terms should form");
assert.ok(s.memory.meaning_bindings.length > 0, "candidate meanings should form");

const externalTime = s.time;
const thoughtCycles = s.thought_state.cycle_count;
const driveUpdates = s.drive_learning.updates;
const liveResult = K.live(s, 10, 4);

check(s, "after live");
assert.strictEqual(s.time, externalTime, "living internally must not consume new outside observation");
assert.ok(s.thought_state.cycle_count > thoughtCycles, "thought cycles should increase");
assert.ok(s.drive_learning.updates > driveUpdates, "drive learning should update");
assert.strictEqual(s.organism_state.mode, "living");
assert.strictEqual(s.organism_state.alive, true);
assert.strictEqual(s.organism_state.external_time_preserved, true);
assert.ok(s.organism_state.internal_ticks >= 10, "internal ticks should advance");
assert.ok(liveResult.rows.length === 10, "one live row per tick");
assert.ok(s.trace.some(row => row.type === "organism_live_tick"), "trace records organism live ticks");

const packet = K.mathLanguagePacket(s);
assert.strictEqual(packet.complete, false, "language must not falsely claim completion");
assert.strictEqual(packet.english, "", "no English packet output");
assert.ok(packet.terms.length > 0, "packet exposes proto math terms");
assert.ok(packet.candidate_meanings.length > 0, "packet exposes candidate meanings");

console.log("PASS infant v05 organism entrypoint test");
