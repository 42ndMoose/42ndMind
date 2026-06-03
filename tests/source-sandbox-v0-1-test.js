const assert = require('assert');
const S = require('../src/source-sandbox-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const files = {
  'src/core.js': `module.exports = { value: () => 1 };`,
  'tests/core-test.js': `const assert = require('assert'); const core = require('../src/core.js'); assert.strictEqual(core.value(), 1); console.log('PASS core');`
};

const sandbox = S.create(files);
ok('sandbox loads', S.VERSION === '0.1.0');
ok('sandbox starts with virtual copy', S.summarize(sandbox.virtual)['src/core.js'].checksum === S.summarize(files)['src/core.js'].checksum);
ok('sandbox has no English output channel', sandbox.ξ === '');

const bad = S.simulate(sandbox, {
  id: 'bad_mutation',
  operations: [{ type: 'replace', path: 'src/core.js', content: `module.exports = { value: () => 2 };` }]
}, ['tests/core-test.js']);

ok('bad mutation is rejected', bad.accepted === false);
ok('bad mutation reports failed test', bad.chaos.some(x => x.indexOf('test_failed') === 0));
ok('bad mutation does not change virtual source', sandbox.virtual['src/core.js'].includes('value: () => 1'));

const good = S.simulate(sandbox, {
  id: 'good_mutation',
  operations: [
    { type: 'replace', path: 'src/core.js', content: `module.exports = { value: () => 2 };` },
    { type: 'replace', path: 'tests/core-test.js', content: `const assert = require('assert'); const core = require('../src/core.js'); assert.strictEqual(core.value(), 2); console.log('PASS core');` }
  ]
}, ['tests/core-test.js'], [virtual => ({ ok: virtual['src/core.js'].includes('value') })]);

ok('good mutation is accepted in sandbox', good.accepted === true);
ok('good mutation changes virtual source only', sandbox.virtual['src/core.js'].includes('value: () => 2'));
ok('base source remains unchanged', sandbox.base['src/core.js'].includes('value: () => 1'));
ok('accepted report exports patch summary', S.exportPatch(good).ok === true);

const blocked = S.simulate(sandbox, {
  id: 'blocked_delete',
  operations: [{ type: 'delete', path: 'src/core.js' }]
}, ['tests/core-test.js']);

ok('delete is blocked by policy', blocked.accepted === false && blocked.status === 'blocked');
ok('blocked proposal reports chaos', blocked.chaos.includes('proposal_blocked'));

S.reset(sandbox);
ok('reset restores virtual source', sandbox.virtual['src/core.js'].includes('value: () => 1'));

console.log(rows.join('\n'));
