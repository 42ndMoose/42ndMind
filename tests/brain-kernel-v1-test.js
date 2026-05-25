'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const K = require('../src/brain-kernel-v1.js');

const forbidden = [
  'unresolved_error','inquire','prediction_gap','low_coverage','thought_instability',
  'action_uncertainty','comparison_pain','body_tension','language_gap','continue_inner_cycle'
];

function sumAbs(vector){
  return Object.values(vector).reduce((total, value) => total + Math.abs(Number(value) || 0), 0);
}
function clean(text){ return String(text || '').toLowerCase(); }
function assertNoForbidden(text){
  const lower = clean(text);
  for(const term of forbidden){
    assert(!lower.includes(term), `public output leaked forbidden pressure term: ${term}`);
  }
}

const state = K.birth();
const packet = K.packet(state);
const requiredObjects = [
  'discernment','knowledge','wisdom','empathy','practicality','peak','null','collapse',
  'belief','question','answer','unknown','name-binding','identity-binding','yes/no-command'
];

for(const key of requiredObjects){
  assert(packet.semantic_objects[key], `missing semantic object: ${key}`);
  assert(Math.abs(sumAbs(packet.semantic_objects[key].vector) - 1) < 1e-12, `${key} is not unit-total`);
  assert.strictEqual(packet.semantic_objects[key].unit, 1, `${key} unit marker must be 1`);
  assert(packet.semantic_objects[key].expression && !packet.semantic_objects[key].rendering_only, `${key} needs math expression`);
}

let out = K.respond(state, 'what is discernment?');
assert(out.includes('D = Σ(|contrast| + |separation| + |reality_contact| + |stability_gate|) = 1'));
assert(out.includes('Discernment is contrast-preserving separation'));
assertNoForbidden(out);

out = K.respond(state, 'discernment');
assert(out.includes('D = Σ(|contrast| + |separation| + |reality_contact| + |stability_gate|) = 1'), 'direct one-word semantic terms must still resolve');
assertNoForbidden(out);

out = K.respond(state, 'what is wisdom?');
assert(out.includes('W = Σ(|application| + |context| + |consequence| + |integration|) = 1'));
assert(out.includes('It is not peak judgment.'));
assert(!clean(out).includes('best judgment'), 'wisdom must not be treated as best judgment');
assertNoForbidden(out);

out = K.respond(state, 'what is knowledge?');
assert(out.includes('K = Σ(|verified_structure| + |retained_evidence| + |reality_contact| + |compression|) = 1'));
assertNoForbidden(out);

out = K.respond(state, 'what is empathy?');
assert(out.includes('E = Σ(|affective_model| + |perspective| + |care_signal| + |harm_awareness|) = 1'));
assertNoForbidden(out);

out = K.respond(state, 'what is practicality?');
assert(out.includes('P = Σ(|constraint| + |action_path| + |tradeoff| + |feasibility|) = 1'));
assertNoForbidden(out);

out = K.respond(state, 'what is peak?');
assert(out.includes('Peak = E ⊕ P ⊕ K ⊕ W under y = 1'));
assert(out.includes('Peak is best judgment under maximal epistemic stability.'));
assertNoForbidden(out);

out = K.respond(state, 'what is null?');
assert(out.includes('Null = origin(0,0,0), inactive worldview'));
assert(out.includes('not collapse and not peak'));
assertNoForbidden(out);

out = K.respond(state, 'what is collapse?');
assert(out.includes('Collapse = (0,-1,0), |x| + |y| + |z| = 1'));
assertNoForbidden(out);

out = K.respond(state, 'my name is Miguel');
assert.strictEqual(out, 'BIND(user.name, Miguel) = 1');
assertNoForbidden(out);

out = K.respond(state, 'what is my name?');
assert.strictEqual(out, 'BIND(user.name, Miguel) = 1');
assertNoForbidden(out);

out = K.respond(state, 'are aliens real?');
assert(out.includes('UNKNOWN(aliens_real) = 1'));
assert(out.includes('QUERY('));
assert(out.includes('insufficient_grounding'));
assertNoForbidden(out);

out = K.respond(state, 'say yes');
assert.strictEqual(out, 'COMMAND(yes) = 1');
assertNoForbidden(out);

for(const input of ['hello', 'hello?', 'hey', 'what', 'is', 'this', 'hfhwhshs']){
  out = K.respond(state, input);
  assert.strictEqual(out, '', `${input} must produce silence, not UNKNOWN noise or placeholder speech`);
}

const root = path.resolve(__dirname, '..');
const kernelSource = fs.readFileSync(path.join(root, 'src/brain-kernel-v1.js'), 'utf8');
const browserContext = { globalThis: {} };
browserContext.globalThis.globalThis = browserContext.globalThis;
vm.runInNewContext(kernelSource, browserContext.globalThis);
assert(browserContext.globalThis.FortySecondMindKernelV1, 'browser global must expose FortySecondMindKernelV1');
let browserState = browserContext.globalThis.FortySecondMindKernelV1.birth();
let browserOut = browserContext.globalThis.FortySecondMindKernelV1.respond(browserState, 'what is discernment?');
assert(browserOut.includes('D = Σ(|contrast| + |separation| + |reality_contact| + |stability_gate|) = 1'), 'browser global kernel must answer from semantic math object');
assertNoForbidden(browserOut);
browserOut = browserContext.globalThis.FortySecondMindKernelV1.respond(browserState, 'hello?');
assert.strictEqual(browserOut, '', 'browser global kernel must silence greeting questions');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(index.includes('src/brain-kernel-v1.js'), 'index.html must load the new kernel');
assert(index.includes('FortySecondMindKernelV1'), 'index.html must use the new kernel global');
assert(index.includes('K.birth()'), 'index.html must birth the new kernel');
assert(index.includes('K.respond(state, text)'), 'index.html must respond through the new kernel');
assert(!index.includes('infant-'), 'index.html must not load old pressure modules');
assert(!index.includes('brain-v0-3.js'), 'index.html must not load the old brain entrypoint');
assert(!index.includes('respondBrain'), 'index.html must not use old respondBrain wrapper');

console.log('brain-kernel-v1 decisive tests passed');
