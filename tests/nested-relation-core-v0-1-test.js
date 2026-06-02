const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');
const N = require('../src/nested-relation-core-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const g = N.create({ nodes: ['a', 'b', 'c'] });
N.addRelation(g, { id: 'ν1', op: 'rel', from: 'a', to: 'b', scope: 's', w: 1 });
N.addRelation(g, { id: 'ν2', op: 'rel', from: 'ν1', to: 'c', scope: 's', w: 1 });
N.addRelation(g, { id: 'ν3', op: 'rel', from: 'ν2', to: 'ν1', scope: 'meta', w: 1 });

ok('nested relation core loads', N.VERSION === '0.1.0');
ok('relations can point to relations', g.relations.ν2.from === 'ν1' && g.relations.ν3.from === 'ν2');
ok('nested count sees nested relations', N.nestedCount(g) >= 2);
ok('relation depth increases through nesting', N.relationDepth(g, 'ν3') > N.relationDepth(g, 'ν1'));
ok('relation field is unit-total', Math.abs(N.l1(g.relation_field) - 1) < 1e-6);
ok('graph has no English output', g.english === '');
ok('graph validates', N.validate(g).ok === true);

const rt = N.roundTrip(g);
ok('nested graph serializes', rt.text.startsWith('Ν{'));
ok('nested graph round trips', rt.same === true);
ok('round trip validates', rt.ok === true);

const parsed = N.parse(rt.text);
ok('parser restores nested relation', parsed.relations.ν2.from === 'ν1');
ok('parser preserves unit field', Math.abs(N.l1(parsed.relation_field) - 1) < 1e-6);

const s = K.create();
K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
const kg = N.fromKernelPacket(K.packet(s));

ok('kernel packet converts to nested graph', !!kg.relations.νnested1 && !!kg.relations.νnested2);
ok('converted graph has nested relations', N.nestedCount(kg) >= 2);
ok('converted graph is unit-total', Math.abs(N.l1(kg.relation_field) - 1) < 1e-6);
ok('converted graph round trips', N.roundTrip(kg).same === true);

const bad = N.create();
N.addRelation(bad, { id: 'νa', op: 'rel', from: 'νb', to: 'x', scope: 's', w: 1 });
N.addRelation(bad, { id: 'νb', op: 'rel', from: 'νa', to: 'y', scope: 's', w: 1 });

ok('cycles are rejected by validation', N.validate(bad).ok === false);

console.log(rows.join('\n'));
