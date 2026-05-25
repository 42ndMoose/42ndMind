const assert = require("assert");
const K = require("../src/infant-brain-v0-1.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " expected 1, got " + value);
}

function checkUnits(state, label) {
  const u = K.brainUnitMap(state);
  Object.keys(u).forEach(key => unit(u[key], label + " " + key));
  assert.strictEqual(K.brainAllUnit(state), true, label + " all unit");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " English channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action English empty");
}

function checkParticipation(state, label) {
  const p = K.causalParticipation(state);
  K.ACTIVE_FIELDS.forEach(name => {
    assert.strictEqual(p[name], true, label + " " + name + " participates in causal loop");
  });
  assert.strictEqual(p.causal_field, true, label + " causal field is unit-total");
}

const s = K.birthBrain();
assert.strictEqual(typeof K.BRAIN_VERSION, "string", "brain version is exported");
assert.ok(/^0\.1\.\d+$/.test(K.BRAIN_VERSION), "brain version uses the current infant v0.1.x line");
assert.strictEqual(s.brain_version, K.BRAIN_VERSION, "birth state records exported brain version");
assert.strictEqual(s.brain_state.version, K.BRAIN_VERSION, "birth brain state uses exported brain version");
checkUnits(s, "birth brain");

K.perceiveBrain(s, "abababab cdcdcdcd abababab cdcdcdcd");
checkUnits(s, "after perceive brain");

K.metabolize(s);
checkUnits(s, "after metabolize");
checkParticipation(s, "after metabolize");

const before = {
  attention: JSON.stringify(s.attention_field),
  thought: JSON.stringify(s.thought_field),
  brain: JSON.stringify(s.brain_field),
  language: JSON.stringify(s.language_field),
  meaning: JSON.stringify(s.meaning_binding_field),
  causal: JSON.stringify(s.causal_field)
};

const externalTime = s.time;
const result = K.brainLive(s, 8, 4);

checkUnits(s, "after brain live");
checkParticipation(s, "after brain live");
assert.strictEqual(s.time, externalTime, "brain live must not consume new outside observation");
assert.ok(result.rows.length === 8, "one row per brain tick");
assert.ok(s.trace.some(row => row.type === "brain_tick"), "trace records brain ticks");

assert.notStrictEqual(JSON.stringify(s.attention_field), before.attention, "attention changes through causal loop");
assert.notStrictEqual(JSON.stringify(s.thought_field), before.thought, "thought changes through causal loop");
assert.notStrictEqual(JSON.stringify(s.brain_field), before.brain, "brain changes through causal loop");
assert.notStrictEqual(JSON.stringify(s.language_field), before.language, "language changes through causal loop");
assert.notStrictEqual(JSON.stringify(s.meaning_binding_field), before.meaning, "meaning changes through causal loop");
assert.notStrictEqual(JSON.stringify(s.causal_field), before.causal, "causal field changes through brain live");

const packet = K.brainPacket(s);
assert.strictEqual(packet.english, "", "brain packet has no English output");
assert.strictEqual(packet.brain_state.version, K.BRAIN_VERSION, "brain packet uses exported brain version");
assert.strictEqual(packet.brain_state.all_unit, true, "brain packet all unit");
K.ACTIVE_FIELDS.forEach(name => {
  assert.strictEqual(packet.causal_participation[name], true, "packet confirms " + name + " participates");
});

console.log("PASS infant unified brain loop test");
