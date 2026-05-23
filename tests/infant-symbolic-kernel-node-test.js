const assert = require("assert");
const K = require("../src/infant-symbolic-kernel.js");

const rows = [];
function ok(name, condition) {
  rows.push((condition ? "PASS " : "FAIL ") + name);
  assert.ok(condition, name);
}

const brain = K.create();

ok("module loads", K.VERSION === "0.1.0-brain-one");
ok("brain equals one at birth", Math.abs(K.l1(brain.brain_field) - 1) < 1e-6);
ok("body equals one at birth", Math.abs(K.l1(brain.body.body_field) - 1) < 1e-6);
ok("english disabled at birth", brain.english_expression_channel.enabled === false);
ok("no semantic lexicon exported", typeof K.LEXICON === "undefined");

const first = K.step(brain, "abababab");
ok("raw input sensed", first.sensory.raw === "abababab");
ok("brain remains one after first step", Math.abs(K.l1(brain.brain_field) - 1) < 1e-6);
ok("memory updated", brain.memory.seen_count === 1 && brain.memory.symbol_counts.a > 0);
ok("compression candidates found", brain.compression.candidates.length > 0);
ok("token library created", brain.memory.token_library.length > 0);
ok("candidate tested", !!brain.candidate_test && typeof brain.candidate_test.passed === "boolean");
ok("runtime body not source write", brain.body.direct_source_write_enabled === false);

const before = brain.prediction.accuracy;
for (let i = 0; i < 8; i += 1) K.step(brain, "abababab");

ok("prediction improves or stabilizes", brain.prediction.accuracy >= before);
ok("body mutates or remains test-stable", brain.body.generation > 0 || brain.candidate_test.passed === false);
ok("brain remains one after learning", Math.abs(K.l1(brain.brain_field) - 1) < 1e-6);
ok("body remains one after learning", Math.abs(K.l1(brain.body.body_field) - 1) < 1e-6);
ok("trace cycles exist", brain.trace.some(t => t.type === "cycle"));
ok("action packet is symbolic only", brain.action_packet.english === "");

K.step(brain, "xqz 91 %% ?? blorp");

ok("gibberish tolerated", brain.sensory.raw.includes("blorp"));
ok("brain remains one after gibberish", Math.abs(K.l1(brain.brain_field) - 1) < 1e-6);

const bad = JSON.parse(JSON.stringify(brain.body));
bad.generation = brain.body.generation + 1;
bad.body_field = [{ axis: "broken", weight: 2 }];

const badTest = K.testCandidateBody(brain, bad, brain.sensory.raw);

ok(
  "bad candidate rejected by unit total",
  badTest.passed === false &&
  badTest.checks.some(c => c.name === "candidate body equals one" && !c.passed)
);

ok("body/source does not auto write github", brain.doctrine.direct_source_write === false && brain.body.direct_source_write_enabled === false);
ok("compression before language doctrine", brain.doctrine.compression_before_language === true);
ok("brain equals one doctrine", brain.doctrine.brain_equals_one === true);

console.log(rows.join("\n"));
