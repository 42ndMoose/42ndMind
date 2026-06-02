const assert = require('assert');
const fixtures = require('./fixtures/language-v0-1/conformance-fixtures.json');
const P = require('../src/language-parser-v0-1.js');
const I = require('../src/intention-algebra-v0-1.js');
const N = require('../src/nested-relation-core-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

ok('fixture version matches parser', fixtures.version === P.VERSION);

fixtures.validPackets.forEach(item => {
  const result = P.validate(item.source);
  ok('valid packet accepted: ' + item.name, result.ok === true);
  const rt = P.roundTrip(item.source);
  ok('valid packet round trip: ' + item.name, rt.same === true);
  if (item.canonical) ok('canonical packet matches fixture: ' + item.name, rt.text === item.canonical);
});

fixtures.invalidPackets.forEach(item => {
  const result = P.validate(item.source);
  ok('invalid packet rejected: ' + item.name, result.ok === false);
});

fixtures.validNestedGraphs.forEach(item => {
  const result = N.validate(item.source);
  ok('valid nested graph accepted: ' + item.name, result.ok === true);
  const rt = N.roundTrip(item.source);
  ok('valid nested graph round trip: ' + item.name, rt.same === true);
  ok('valid nested graph has unit relation field: ' + item.name, Math.abs(N.l1(rt.reparsed.relation_field) - 1) < 1e-6);
});

fixtures.invalidNestedGraphs.forEach(item => {
  const result = N.validate(item.source);
  ok('invalid nested graph rejected: ' + item.name, result.ok === false);
});

fixtures.intentionPackets.forEach(item => {
  const packet = P.parse(item.source);
  const fields = packet.fields;
  const result = I.compute({
    λ: fields.λ,
    τ: fields.τ,
    ρ: fields.ρ,
    μ: fields.μ,
    ε: fields.ε,
    κ: fields.κ
  });
  ok('intention fixture computes: ' + item.name, result.ok === true);
  ok('intention fixture l1: ' + item.name, Math.abs(I.l1(result.field) - item.expectedL1) < 1e-6);
  ok('intention fixture english empty: ' + item.name, result.english === item.english);
});

console.log(rows.join('\n'));
