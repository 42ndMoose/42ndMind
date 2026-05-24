const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

function unit(value, label) {
  assert.ok(Math.abs(value - 1) < 1e-6, label + " must equal 1, got " + value);
}

function checkOne(state, label) {
  unit(K.l1(state.brain_field), label + " brain");
  unit(K.l1(state.language_field), label + " language");
  unit(K.l1(state.meaning_binding_field), label + " candidate meaning");
  unit(K.l1(state.attention_field), label + " attention");
  unit(K.l1(state.thought_field), label + " thought");
  assert.strictEqual(state.english_expression_channel.enabled, false, label + " english channel off");
  assert.strictEqual(state.action_packet.english, "", label + " action has no english");
  assert.strictEqual(state.binding_state.quarantined, true, label + " bindings quarantined");
  assert.ok(state.internal_math_packet.expressions.includes("candidate_meaning=1"), label + " packet has candidate_meaning=1");
}

function runScenario(name, stream, repeats, expectBindings) {
  const s = K.create();
  assert.strictEqual(K.VERSION, "0.5.0-meaning-bindings");
  checkOne(s, name + " birth");

  for (let i = 0; i < repeats; i += 1) {
    K.step(s, stream);
    checkOne(s, name + " step " + i);
  }

  K.observe(s, stream);
  K.think(s, 5);
  K.act(s);
  checkOne(s, name + " observe-think-act");

  if (expectBindings) {
    assert.ok(s.memory.token_library.length > 0, name + " tokens formed");
    assert.ok(s.memory.language_terms.length > 0, name + " language terms formed");
    assert.ok(s.memory.meaning_bindings.length > 0, name + " binding candidates formed");
    assert.ok(s.memory.meaning_bindings.every(b => b.status === "candidate"), name + " only candidate bindings");
    assert.ok(!s.memory.meaning_bindings.some(b => b.status === "truth"), name + " no truth bindings");
  }

  return {
    name,
    token_count: s.memory.token_library.length,
    relation_count: s.memory.token_relation_graph.length,
    language_term_count: s.memory.language_terms.length,
    binding_count: s.memory.meaning_bindings.length,
    action: s.action_packet.kind
  };
}

const results = [];
results.push(runScenario("pure repetition", "abababab abababab abababab", 6, true));
results.push(runScenario("two-pattern relation", "red red blue red red blue red red blue", 6, true));
results.push(runScenario("near variation", "truth proof truth proof truh proof truth proof", 6, true));
results.push(runScenario("claim pattern", "claim evidence claim counter claim evidence", 6, true));
results.push(runScenario("noise survival", "xqz 91 %% ?? blorp", 2, false));

console.log("PASS infant v05 scenario battery");
console.log(JSON.stringify(results, null, 2));
